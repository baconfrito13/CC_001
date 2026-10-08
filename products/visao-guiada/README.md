# Visão Guiada

> Óculos com câmara e auriculares com IA offline que descrevem o mundo a pessoas cegas, vendidos como kit sem subscrição

<!-- factory:status:start -->
**Estado:** 🟢 ativo · **Fase atual:** 01 Pesquisa · **Profundidade:** standard · **Score G1:** —

| # | Fase | Estado | Resumo |
|---|---|---|---|
| 00 | Receção | ✅ | other (hardware+IA offline), kit óculos+auriculares, venda única, depth standard |
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

**Links:** [sessão Claude](https://claude.ai/code/session_01PHw6osQUbYMevv5yPhTMZM)
**Tarefas do fundador:** 0 abertas, 0 feitas → [HUMAN_TASKS.md](HUMAN_TASKS.md)
_Atualizado: 2026-10-08_
<!-- factory:status:end -->

## O que é

Pessoas cegas ou com baixa visão grave precisam de perceber o que está à sua frente — ler, identificar objetos, orientar-se — sem segurar o telemóvel nem depender de rede. A Visão Guiada é um kit de óculos com câmara e auriculares com microfone, com IA que corre localmente (o telemóvel serve só de reforço), que descreve o ambiente e responde a perguntas por voz. Ganha dinheiro com a venda única do kit, sem subscrição, com atualizações OTA incluídas.

| | |
|---|---|
| **Slug** | `visao-guiada` (nunca muda, mesmo que o nome mude) |
| **Tipo** | `other` |
| **Criado em** | 2026-10-08 |
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
| 2026-10-08 | intake | Tipo `other` (hardware + IA embarcada); interpretação 1: kit próprio óculos + auriculares, IA offline, venda única; profundidade standard (não bloqueada) | 2: software primeiro sobre óculos existentes · 3: kit de prateleira para instituições | Fiel às palavras do fundador; 2 e 3 ficam como pivots para a pesquisa | `docs/00-brief.md` |

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
2. Continua a partir da fase atual: `/continuar visao-guiada`. Uma fase `in_progress` com saídas parciais continua-se, não se recomeça.
3. Depois de cada fase: `python3 factory/scripts/factory.py set-phase visao-guiada <fase> done --summary "…"`, `validate visao-guiada`, atualizar este bloco e fazer commit `visao-guiada: <fase> — <resumo>`.
