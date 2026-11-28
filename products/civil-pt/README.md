# Medições PT

> Mapas de quantidades (medições) a partir de plantas PDF, com IA, para empreiteiros e projetistas em Portugal

<!-- factory:status:start -->
**Estado:** 🟢 ativo · **Fase atual:** 05 Construção · **Profundidade:** standard · **Score G1:** 2.5 (KILL)

| # | Fase | Estado | Resumo |
|---|---|---|---|
| 00 | Receção | ✅ | ai-app, medições por IA para obra civil em PT, depth standard |
| 01 | Pesquisa | ✅ | KILL 2.45 — Rebuttal feito: respondi às objeções D1 a D8 em /home/user/CC_001/products/civil-pt/docs/01-research.md. A nota da ideia original desce de 2,60 para 2,45 e o veredicto passa a KILL provisório, não validado (banda 1,70-3,00). Dor desce de 3 para 2: os sinais PT vêm de um só fórum, de edifícios, sem n |
| 02 | Estratégia | ✅ | Estratégia revista (v0.2) das duas peças '02-product.md' e '02-business.md', com as 12 objeções do advogado do diabo respondidas uma a uma ( |
| 03 | Marca | ✅ | Nome escolhido: Rastoplan (rasto + plan). Domínio: rastoplan.com disponível segundo a ferramenta Shopify generate-domain-names em 2026-11-28 |
| 04 | Arquitetura | ✅ | Arquitetura do civil-pt (Rastoplan) escrita e validada com 'factory.py validate civil-pt'. Escolhi a receita 'web-saas', apesar de 'product. |
| 05 | Construção | ⬜ |  |
| 06 | Qualidade | ⬜ |  |
| 07 | Legal | ⬜ |  |
| 08 | Go-to-market | ⬜ |  |
| 09 | Lançamento | ⬜ |  |
| 10 | Crescimento | ⬜ |  |

**Links:** [PR](https://github.com/baconfrito13/CC_001/pull/11) · [sessão Claude](https://claude.ai/code/session_0128UXAXkUH8kQuWGsHHnBqT)
**Tarefas do fundador:** 3 abertas, 0 feitas → [HUMAN_TASKS.md](HUMAN_TASKS.md)
_Atualizado: 2026-11-28_
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
