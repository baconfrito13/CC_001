# {{name}}

> {{one_liner}}

<!-- factory:status:start -->
<!-- factory:status:end -->

<!--
Template for products/<slug>/README.md. Rendered by `factory.py new` (replaces slug, name, one_liner, type, date). Language: pt-PT.
- The two status markers above are managed by the CLI (`factory.py render-status <slug> --write`, also run by `set-phase` and `set`). NEVER edit between them and never delete them; the PR description reuses the same block (`render-status --pr`).
- Everything else is yours: keep it short, current, and in pt-PT. The README is the entry point for any agent resuming the product.
-->

## O que é

{{2–4 frases: problema, para quem, como resolve, como ganha dinheiro. Atualizar após a pesquisa e a estratégia.}}

| | |
|---|---|
| **Slug** | `{{slug}}` (nunca muda, mesmo que o nome mude) |
| **Tipo** | `{{type}}` |
| **Criado em** | {{date}} |
| **Veredicto G1** | pendente <!-- later: GO 3,85 · PIVOT 3,10 · KILL 2,45 --> |
| **Modelo de negócio** | pendente |

## Ligações

<!-- Source of truth is product.json `links` (shown in the status block). List here the extra links people need; update when they change. -->

| O quê | Onde |
|---|---|
| Branch / PR | ainda não |
| Pré-visualização | ainda não |
| Produção / domínio | ainda não |
| Repositório próprio (após spin-out) | n/a |
| Pagamentos (painel) | ainda não |
| Analítica / erros (painéis) | ainda não |
| Design (Figma / ficheiros) | `brand/` |

## Registo de decisões

<!-- Append-only, newest last. One row per decision that someone could later question: type, interpretation, verdict, pivot, monetization model, price, rail, stack, name, domain, scope cuts, overrides by the founder. Pivots start with "⚠️ PIVOT". -->

| Data | Fase | Decisão | Alternativas consideradas | Porquê | Referência |
|---|---|---|---|---|---|
| {{date}} | intake | Tipo `{{type}}`; interpretação: {{qual}} | {{outras}} | {{critério}} | `docs/00-brief.md` |

## Onde encontrar o quê

| Preciso de… | Ver |
|---|---|
| Estado e próximos passos | bloco de estado acima · `product.json` |
| O que o fundador tem de fazer | `HUMAN_TASKS.md` |
| Ideia original, pressupostos | `docs/00-brief.md` |
| Evidência de mercado, veredicto G1 | `docs/01-research.md` · `docs/research/` |
| Produto (PRD), histórias, métricas | `docs/02-product.md` |
| Preços, economia unitária, projeções | `docs/02-business.md` |
| Nome, marca, voz, paleta | `docs/03-brand.md` · `brand/` (`tokens.json`, logótipos) |
| Arquitetura e decisões técnicas | `docs/04-architecture.md` · `docs/adr/` |
| Como correr, variáveis de ambiente | `docs/05-build.md` · `app/` (ver `stack.app_dir` em `product.json`) |
| Qualidade e segurança | `docs/06-qa-report.md` |
| Conformidade legal | `docs/07-compliance.md` · `legal/` · `legal/public/` |
| Plano de marketing e textos | `docs/08-gtm.md` · `marketing/` |
| Lançamento e operação | `docs/09-launch.md` |
| Resultados e experiências pós-lançamento | `docs/10-growth.md` |

## Como retomar

1. Lê `product.json` (`phase`, `status`), `HUMAN_TASKS.md`, os últimos commits e os comentários do PR.
2. Continua a partir da fase atual: `/continuar {{slug}}`. Uma fase `in_progress` com saídas parciais continua-se, não se recomeça.
3. Depois de cada fase: `python3 factory/scripts/factory.py set-phase {{slug}} <fase> done --summary "…"`, `validate {{slug}}`, atualizar este bloco e fazer commit `{{slug}}: <fase> — <resumo>`.
