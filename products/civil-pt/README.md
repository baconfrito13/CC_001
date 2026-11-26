# Medições PT

> Mapas de quantidades (medições) a partir de plantas PDF, com IA, para empreiteiros e projetistas em Portugal

<!-- factory:status:start -->
**Estado:** 🟢 ativo · **Fase atual:** 01 Pesquisa · **Profundidade:** standard · **Score G1:** —

| # | Fase | Estado | Resumo |
|---|---|---|---|
| 00 | Receção | ✅ | ai-app, medições por IA para obra civil em PT, depth standard |
| 01 | Pesquisa | ⬜ |  |
| 02 | Estratégia | ⬜ |  |
| 03 | Marca | ⬜ |  |
| 04 | Arquitetura | ⬜ |  |
| 05 | Construção | ⬜ |  |
| 06 | Qualidade | ⬜ |  |
| 07 | Legal | ⬜ |  |
| 08 | Go-to-market | ⬜ |  |
| 09 | Lançamento | ⬜ |  |
| 10 | Crescimento | ⬜ |  |

**Links:** —
**Tarefas do fundador:** 0 abertas, 0 feitas → [HUMAN_TASKS.md](HUMAN_TASKS.md)
_Atualizado: 2026-11-26_
<!-- factory:status:end -->


## O que é

Ferramenta com IA que mede plantas em PDF (áreas, comprimentos, volumes, contagens) e gera mapas de quantidades auditáveis, em português e adaptados à prática de medições em Portugal. Dirigida a empreiteiros, subempreiteiros e gabinetes de projeto. Inspirada em civils.ai. Receita por subscrição com créditos de folhas (hipótese).

| | |
|---|---|
| **Slug** | `civil-pt` (nunca muda, mesmo que o nome mude) |
| **Tipo** | `ai-app` |
| **Criado em** | 2026-11-26 |
| **Veredicto G1** | pendente  |
| **Modelo de negócio** | pendente |

## Ligações


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


| Data | Fase | Decisão | Alternativas consideradas | Porquê | Referência |
|---|---|---|---|---|---|
| 2026-11-26 | intake | Tipo `ai-app`; interpretação: medições para empreiteiros de obra civil em PT | verificador de discrepâncias para projetistas; edifícios | monetização mais clara e menor concorrência local | `docs/00-brief.md` |

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
2. Continua a partir da fase atual: `/continuar civil-pt`. Uma fase `in_progress` com saídas parciais continua-se, não se recomeça.
3. Depois de cada fase: `python3 factory/scripts/factory.py set-phase civil-pt <fase> done --summary "…"`, `validate civil-pt`, atualizar este bloco e fazer commit `civil-pt: <fase> — <resumo>`.
