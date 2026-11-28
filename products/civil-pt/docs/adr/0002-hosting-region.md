# ADR 0002 — Alojamento e região: Vercel Pro `fra1` + Supabase Pro em Frankfurt

> **Estado:** accepted · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente) · **Relacionado:** ADR-0003, ADR-0005, US-02, US-04, `docs/04-architecture.md` §9–10

## Contexto

O produto cobra (Passes e subscrições), logo não pode usar Vercel Hobby (não comercial; regra da fábrica de 2026-10-08). O processamento de uma folha corre em Node durante dezenas de segundos com um PDF de até 50 MB em memória (spike S1: 50 000 elementos em 0,55 s, RSS 249 MB), sempre **fora do pedido do utilizador**. A BD e as funções devem estar na UE e na mesma região. Custo fixo antes de receita ≤ €50.

## Fatores de decisão

1. Corre o motor de PDF (memória, duração, Node completo).
2. Custo fixo e a 10 000 contas.
3. Residência na UE e co-localização app/BD.
4. Tempo de construção e *lock-in*.

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo mensal a 0 / 100 / 10k | Lock-in / saída | Fonte |
|---|---|---|---|---|---|---|
| A — Vercel Pro `fra1` + Supabase Pro `eu-central-1` | Receita `web-saas` | Funções Node com 2 GB (máx. 4 GB), 300 s (máx. 800 s), `after()`, *cron* por minuto; um só fluxo de *deploy* | $20 + $25 fixos; Hobby só serve para *preview* | €42 / €42 / ≈ €1 241 | Médio (Next.js portável; Postgres padrão) | [Vercel limites](https://vercel.com/docs/functions/limitations), [preços](https://vercel.com/pricing), [regiões](https://vercel.com/docs/regions), [Supabase](https://supabase.com/pricing), 2026-11-28 |
| B — Cloudflare Workers + OpenNext | Recipe alternativa de alojamento | Escala a custo baixo; plano gratuito comercial | **128 MB de memória por *isolate*** e 10 ms de CPU no gratuito (30 s por defeito no pago, até 5 min): o PDF de 50 MB e o motor não cabem sem reescrever; OpenNext com Next 16 por verificar | ≈ €25 / €25 / variável | Médio | [Cloudflare limites](https://developers.cloudflare.com/workers/platform/limits/), 2026-11-28 |
| C — Contentor dedicado (Fly.io/Railway) para o motor | Função só para o processamento | Sem limite de duração/memória | Segundo *deployable*, segunda fatura, sondagem/fila próprias; fora do orçamento para ≈ 6 contas | ≈ €50 / €55 / ≈ €1 300 | Baixo | — (não adotado) |

Pontuação 1–5 (motor · custo a 10k · UE · tempo/*lock-in*): **A = 5·4·5·5 = 19 · B = 1·4·5·3 = 13 · C = 5·3·4·2 = 14**.

## Decisão

**Escolhemos A.** Funções em `fra1` (`vercel.json`) e Supabase `eu-central-1` (Frankfurt; a região não se altera depois). **Antes do go-live:** pré-visualizações em Vercel Hobby e um projeto Supabase gratuito de desenvolvimento (€0). **No go-live:** Vercel Pro e Supabase Pro (tarefa D, ≈ €41/mês), porque o plano gratuito do Supabase pausa após 1 semana sem uso e não tem cópias.

## Consequências

- **Positivas:** um fornecedor por camada; `after()` e *cron* nativos; limites folgados para o MVP.
- **Negativas / custos aceites:** €42/mês fixos a partir do go-live, mesmo sem clientes (84 % do teto); *lock-in* moderado nas funções Vercel.
- **Riscos e mitigação:** concorrência de processamento em instâncias partilhadas → fila com `SKIP LOCKED` e limite por instância; se o p95 passar 63 s, subir memória/`maxDuration` e, só depois, novo ADR com contentor dedicado.
- **Impacto noutras fases:** launch: tarefas D e F · legal: Vercel e Supabase como subcontratantes (UE + casas-mãe EUA) · qa: carga de 50 000 elementos × 20 execuções.

## Como verificamos

Teste de carga de `fra1` com a folha sintética (p95 ≤ 90 s) em *preview* Pro; `vercel.json` com `regions: ["fra1"]` conferido no *build*; criação do Supabase em Frankfurt registada em `docs/09-launch.md`.

## Revisitar quando

p95 de processamento > 63 s (70 % do alvo), RSS > 1,4 GB, ou a Vercel mudar limites do Pro; ou ≥ 100 contas ativas em simultâneo.

## Referências

- https://vercel.com/docs/functions/limitations — acedido em 2026-11-28
- https://vercel.com/pricing — acedido em 2026-11-28
- https://vercel.com/docs/regions — acedido em 2026-11-28
- https://supabase.com/pricing e https://supabase.com/docs/guides/platform/regions — acedido em 2026-11-28
- https://developers.cloudflare.com/workers/platform/limits/ — acedido em 2026-11-28
