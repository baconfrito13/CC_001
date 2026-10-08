# Crescimento — {{name}}

<!-- Template for docs/10-growth.md, the living log of the growth phase (factory/playbooks/10-growth.md). Language: pt-PT. Created at launch; each weekly cycle is appended at the TOP of "Ciclos" (newest first). Use real numbers with their source; "n/d" only where a founder task exists. Never store personal data of customers here. Delete guidance comments when the file is created, but keep the cycle block below as the template for the next ones. -->

> **Slug:** `{{slug}}` · **Lançado em:** {{data}} · **Estado:** `{{scale / sustain / pivot / kill / sell / em avaliação}}` · **Ciclo atual:** {{N}} · **Atualizado em:** {{date}}

## Painel

| | Valor | Alvo | Fonte |
|---|---|---|---|
| **Estrela polar:** {{métrica}} | {{}} | {{}} | {{}} |
| Receita mensal líquida (média 3 meses) | {{€}} | {{€}} | {{Stripe/MoR}} |
| Custos mensais | {{€}} | | `docs/09-launch.md` |
| Clientes pagantes · churn mensal | {{n}} · {{%}} | ≤ 5 % | |
| CAC · retorno do investimento (meses) | {{€}} · {{n}} | {{€}} · ≤ 6 | |

**Veredicto em vigor e próxima avaliação:** {{scale/sustain/pivot/kill/sell}} — {{data}} — {{evidência numa linha}}

## Fila de experiências (ICE)

<!-- ICE = (Impact + Confidence + Ease) / 3, each 1–10. Keep ≤ 25 rows. Run the top 1–3 with ICE ≥ 6.5 that target the earliest broken funnel stage. -->

| ID | Área | Hipótese (se… então… porque…) | Métrica | I | C | E | ICE | Estado | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| E-001 | {{aquisição / ativação / conversão / retenção / referência / preços}} | {{}} | {{}} | | | | | {{ideia / em curso / feito}} | |

## Histórico de preços (regra Omnibus: preço mais baixo dos 30 dias anteriores)

<!-- Every price or promotion is logged. A "de/por" claim must use the lowest price of the previous 30 days. -->

| Data | Plano | Preço (IVA incl.) | Promoção? | Preço mais baixo nos 30 dias anteriores | Aprovado por |
|---|---|---|---|---|---|
| {{}} | | | | | |

## Ciclos (mais recente primeiro)

### Ciclo {{N}} — semana {{aaaa-Sxx}} ({{seg}}–{{dom}})

<!-- Copy this block for each new cycle. Keep it to one screen. -->

**Métricas** (período · anterior · alvo)

| Fase | Métrica | Período | Anterior | Alvo | Nota |
|---|---|---|---|---|---|
| Aquisição | visitantes (principais canais) | | | | |
| Aquisição | cliques/impressões Search Console | | | | |
| Ativação | % que atinge o «aha» em 24 h | | | ≥ 40 % | |
| Conversão | visitante→inscrição · inscrição→pago | | | | |
| Receita | MRR · novos · cancelados · reembolsos | | | | |
| Retenção | churn mensal · retenção semana 4 | | | ≤ 5 % | |
| Referência | convites por utilizador ativo | | | | |

**Estrangulamento desta semana:** {{etapa do funil mais fraca face ao alvo}}

**Perceções** (3 factos · 3 hipóteses · 1 surpresa)

1. {{facto com número}}
2. {{}}
3. {{}}

**Experiências lançadas**

| ID | O que mudou | Início | Leitura prevista | Resultado/decisão |
|---|---|---|---|---|
| E-{{}} | {{}} | {{}} | {{}} | {{manter / reverter / iterar}} |

**Conteúdo publicado:** {{artigos, ligações}} · **Atualizações de artigos:** {{}}

**Feedback (issues `feedback`):** {{n novos · temas · promovidos ao backlog · respondidos em 48 h ✔/✖}}

**Próximas apostas (top 3 da fila):** {{E-..}}, {{E-..}}, {{E-..}}

**Tarefas do fundador novas:** {{HT-.. ou «nenhuma»}}

**Lição para a fábrica:** {{uma linha ou «—»}}

## Registo de decisões

<!-- One row per monthly verdict or major decision (scale/sustain/pivot/kill/sell, price change, channel stop). Include the evidence and who approved. -->

| Data | Decisão | Evidência | Aprovada por |
|---|---|---|---|
| {{}} | {{}} | {{}} | {{fundador / automático}} |

## Preparação para venda (preencher apenas se o veredicto for `sell` ou `sustain` há ≥ 3 meses)

<!-- Score 0–2 each; list when the total is ≥ 12/16. See playbook 10-growth.md, Step 12. -->

| Dimensão | 0–2 | Nota |
|---|---|---|
| Histórico de receita verificada ≥ 6 meses | | |
| Dados de retenção/churn | | |
| Tráfego diversificado (nenhum canal > 60 %) | | |
| Baixa dependência do fundador (suporte ≤ 2 h/semana) | | |
| Tecnologia limpa e documentada | | |
| Legal limpo e propriedade intelectual própria | | |
| Contas transferíveis / plano de migração de pagamentos | | |
| Concentração de clientes < 20 % | | |
