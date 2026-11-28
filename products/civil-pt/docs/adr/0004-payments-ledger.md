# ADR 0004 — Pagamentos: Stripe direto e livro-razão de lotes de folhas

> **Estado:** accepted · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente) · **Relacionado:** US-08, US-12, ADR-0003, `02-business.md` §4–5, `docs/04-architecture.md` §5.4 e §6

## Contexto

A estratégia escolheu **Stripe direto** (Checkout, Billing, Customer Portal; Stripe Tax só no regime normal de IVA «F2», não no isento «F1») por vender só a empresas, com **Passe Concurso** (pagamento único, 20/60/150 folhas, 90 dias) e subscrições mensais cujas folhas de cada mês valem 90 dias. A unidade é a **folha**, com avaliação de 5 folhas (14 dias), devolução por «não funcionou» (máx. 3 por lote), reembolso proporcional, graça de 7 dias, disputa e preço de fundador (as primeiras 10 «Empresa» a €79). O regime de IVA do fundador só é conhecido após a tarefa B. A receita permite Stripe Checkout + Portal; o que falta é desenhar a **fonte de verdade do saldo**.

## Fatores de decisão

1. Correção sob concorrência e webhooks repetidos (dinheiro).
2. Custo (taxas) e carga administrativa fiscal.
3. Funcionar já em modo de teste e com F1 ou F2.
4. Tempo de construção (US-08 + US-12 = 6 unidades).

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo por venda (Passe 60, €129 + IVA 23 %, cartão EEE) | Lock-in / saída | Fonte |
|---|---|---|---|---|---|---|
| A — Stripe direto + livro-razão próprio | Stripe cobra; o nosso Postgres guarda lotes e reservas por funções SQL atómicas | Taxa mais baixa; checkout personalizado; IVA configurável | O fundador trata de IVA e faturas (tarefa B); lógica de saldo é nossa | ≈ €3,84 (3,0 %); Tax via API €0,45 | Médio | [Stripe PT](https://stripe.com/en-pt/pricing), 2026-11-28 |
| B — Paddle (MoR) | MoR trata de IVA e faturas | Zero administração fiscal | 5 % + $0,50 (≈ €6,91 por Passe 60); menos controlo; ainda precisa de livro-razão | ≈ €6,91 | Médio | [Paddle](https://www.paddle.com/pricing), 2026-11-27 (PRD) |
| C — Stripe Managed Payments (MoR do Stripe) | MoR sobre o Stripe | IVA tratado | Exclui checkout personalizado e domínio próprio (PRD §4) | +3,5 % | Médio | `02-business.md` §4 |

Pontuação 1–5 (correção · custo · F1/F2 · tempo): **A = 4·5·5·3 = 17 · B = 4·3·4·4 = 15 · C = 3·3·3·4 = 13**.

## Decisão

**Escolhemos A**, com uma interface `BillingProvider` (`stripe` | `mock`) para trocar por Paddle sem tocar no livro-razão (recurso previsto se a faturação manual custar > 1 h/mês, `02-business.md` §4).

**Desenho do livro-razão:** saldo = lotes não expirados e não revogados menos reservas; sem coluna de saldo. Funções `SECURITY DEFINER` (`reserve_sheet`, `commit_sheet`, `release_sheet`, `grant_lot`, `revoke_lot`, `try_founder_price`) com bloqueio de linha, relógio injetável e idempotência por `sheet_id` e por `stripe_ref`/`event.id`. A folha só é **cobrada** (`commit`) quando fica `ready`; falha, raster e grupo dominante libertam a reserva. Webhooks: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid|payment_failed`, `charge.refunded`, `charge.dispute.created|closed`; assinatura sobre o corpo cru, tolerância 300 s, tabela `stripe_events`. `TAX_MODE=stripe_tax|exempt` e `SHOW_VAT_SUFFIX` configuram F2/F1; os preços do Stripe são objetos novos (nunca se edita um preço ativo). `PAYMENTS_LIVE=false` até à tarefa B e à aprovação do go-live. Reconciliação: *script* que reaplica eventos do Stripe e compara saldos.

## Consequências

- **Positivas:** saldo correto por construção (SQL atómico), reproduzível a partir do Stripe; funciona em modo de teste; F1 e F2 sem alterar código.
- **Negativas / custos aceites:** a lógica do saldo é nossa (risco 3 do doc); o fundador faz IVA/faturas; o PRD assumiu Tax a 0,5 % e a API custa €0,45/transação (diferença < €0,20 por venda).
- **Riscos e mitigação:** corrida na reserva → testes de concorrência e de propriedade (`reserve ≥ settle`, saldo ≥ 0); eventos fora de ordem → handlers idempotentes que leem o objeto atual do Stripe.
- **Impacto noutras fases:** legal: Stripe subcontratante; termos com reembolso de 14 dias · qa: webhooks assinados repetidos, reembolso e disputa · launch: tarefas B e A; `PAYMENTS_LIVE` só depois.

## Como verificamos

US-08 critérios 1–13 e US-12 critérios 1–6 em e2e com relógio simulado; testes SQL de concorrência; fixtures de webhook assinadas.

## Revisitar quando

A faturação manual custar > 1 h/mês, o regime fiscal impedir cobrar IVA (passar a Paddle), ou ≥ 10 compras reais permitirem rever preços.

## Referências

- https://stripe.com/en-pt/pricing — acedido em 2026-11-28
- https://www.paddle.com/pricing — acedido em 2026-11-27 (via PRD)
- `products/civil-pt/docs/02-business.md` §4–5
