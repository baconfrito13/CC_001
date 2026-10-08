# Pesquisa e veredicto G1 — {{name}}

<!--
Template for docs/01-research.md (synthesis). Language: pt-PT. Procedure: factory/playbooks/01-research.md (Steps 7-9). Rubric, caps, knockouts, pivot heuristics, adaptive depth: factory/checklists/idea-scorecard.md. Weights/thresholds: factory/PIPELINE.md (G1).
Rules: integer scores 1-5; confidence alta/média/baixa = H/M/L in the checklist (low caps at 3, medium caps at 4); no evidence = score 2 + L; compute the total with the script in the checklist (never by hand); tag numbers FACTO/ESTIMATIVA/PRESSUPOSTO; cite [S#] from the track ledgers (IDs prefixed by track: M1, C1, P1, R1 when merging ledgers).
Delete all guidance comments when done; the double-brace placeholder and TODO must not remain. If the verdict is KILL keep sections 1, 2, 3, 9 and 11; if PIVOT add section 10 at the top.
-->

> **Produto:** `{{slug}}` · **Data:** {{AAAA-MM-DD}} · **Profundidade da pesquisa:** {{lean/standard/deep}} · **Fontes:** {{n}} · **Notas por faixa:** `research/market.md`, `research/competitors.md`, `research/audience.md`, `research/risks.md`

## 1. Resumo executivo

| | |
|---|---|
| **Veredicto** | **{{GO / PIVOT / KILL}}** — pontuação **{{x,xx}} / 5** {{(frágil)}} |
| **Profundidade para as fases seguintes** | {{deep / standard}} (regra adaptativa; {{ou: escolhida pelo fundador}}) |
| **Cunha (wedge)** | {{Para <segmento> que <dor>, <produto> é <categoria> que <benefício>, ao contrário de <alternativa> que <falha>.}} |
| **Hipótese de MVP** | {{uma frase}} |
| **Hipótese de monetização** | {{modelo · pagador · preço indicativo · meio de pagamento}} |
| **Primeiro canal** | {{canal + teste de 30 dias}} |
| **Maior risco** | {{uma frase}} |

{{3–5 frases: porque este veredicto, o que o sustenta e o que o poderia mudar.}}

## 2. Scorecard G1

<!-- Weights are fixed by PIPELINE.md. Contribution = weight x score / 100. Evidence column: the single strongest datum + [S#]. -->

| Critério | Peso | Nota (1–5) | Confiança (alta / média / baixa) | Contributo | Evidência-chave | Fontes |
|---|---|---|---|---|---|---|
| Dor e frequência do problema | 15% | {{}} | {{alta / média / baixa}} | {{}} | {{}} | [{{}}] |
| Evidência de procura | 15% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| Disposição para pagar / clareza da monetização | 15% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| Distribuição | 15% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| Lacuna competitiva | 10% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| Viabilidade de construção | 10% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| Tempo até à primeira receita | 10% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| Risco (invertido) | 5% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| Aderência ao fundador | 5% | {{}} | {{}} | {{}} | {{}} | [{{}}] |
| **Total** | **100%** | | | **{{x,xx}}** | | |

- **Pontuação pessimista** (critérios com confiança baixa menos 1): **{{x,xx}}** → {{o veredicto mantém-se / o veredicto muda para …: veredicto FRÁGIL}}.
- **Limiares:** GO ≥ 3,50 sem knockouts · PIVOT 2,80–3,49 · KILL < 2,80 ou knockout confirmado.
- **Knockouts verificados:** K1 {{não}} · K2 {{não}} · K3 {{não}} · K4 {{não}} · K5 {{não}} · K6 {{não}} · K7 {{não}} · K8 {{não}} <!-- one-line evidence each if "sim" or "possível" -->

## 3. Veredicto e justificação

{{Parágrafo: o que decide o veredicto. Em KILL: a razão numa frase e o knockout/critério em falta. Em GO: porque a cunha é defensável durante os primeiros 6 meses.}}

**O que mudaria a nossa opinião** (falsificadores): {{3 pontos observáveis, ex.: «se o teste de 30 dias no canal X der < 1% de registo»}}.

## 4. Cunha e posicionamento inicial

| | |
|---|---|
| **Segmento** | {{}} |
| **Promessa** | {{}} |
| **Prova (necessidades por satisfazer)** | {{tema · n.º de menções · fonte}} |
| **Porque os atuais não a servem** | {{}} |
| **Risco de cópia / de ser absorvida** | {{}} |
| **Alternativas de cunha descartadas** | {{}} |

## 5. Dimensão do mercado (bottom-up)

<!-- Copy the sized table from market.md; never replace it by a top-down figure. -->

| Nível | Fórmula | Baixo | Base | Alto | Etiqueta |
|---|---|---|---|---|---|
| TAM | {{}} | {{}} | {{}} | {{}} | ESTIMATIVA |
| SAM | {{}} | {{}} | {{}} | {{}} | ESTIMATIVA |
| SOM (12 meses) | {{}} | {{}} | {{}} | {{}} | ESTIMATIVA |

## 6. Concorrência (top 5)

| Concorrente | Preço de entrada / alvo | Ponto forte | Fraqueza explorável | Fonte |
|---|---|---|---|---|
| {{}} | {{€ / período / IVA}} | {{}} | {{}} | [{{}}] |

**Mediana / P25 / P75 do preço comparável:** {{}} · **Degrau vazio da escada de preços:** {{}}

## 7. Público e canais

**Segmento primário:** {{}} · **Onde estão:** {{}}

| Canal (top 3) | Porquê | Teste de 30 dias | Métrica de sucesso |
|---|---|---|---|
| {{}} | {{}} | {{}} | {{}} |

## 8. Principais riscos

| ID | Risco | Pontuação | Mitigação | Sinal de alerta |
|---|---|---|---|---|
| R1 | {{}} | {{}} | {{}} | {{}} |

## 9. Pressupostos do brief — estado

| ID | Pressuposto | Estado | Evidência |
|---|---|---|---|
| A1 | {{}} | confirmado / refutado / em aberto | [{{}}] |

**Lacunas (confiança baixa)** e o teste mais barato para cada uma: {{lista; a fase GTM transforma-os em experiências}}

## 10. Pivot

<!-- Only if 2,80 <= score < 3,50. Place this section first in the file and add "⚠️ PIVOT" to the README decision log. -->

**Ideia original:** {{}} (pontuação {{x,xx}}). **Alavancas usadas:** {{ver `idea-scorecard.md` §5}}.

| Variante | Mantém a intenção do fundador porque… | Critérios alterados (com evidência nova) | Nova pontuação |
|---|---|---|---|
| V1 {{}} | {{público / trabalho a realizar}} | {{}} | {{x,xx}} |
| V2 {{}} | {{}} | {{}} | {{x,xx}} |
| V3 {{}} | {{}} | {{}} | {{x,xx}} |

**Escolhida:** {{V?}} com {{x,xx}} → {{continua como `pivot` / KILL (< 3,50)}}.

## 11. Se for KILL — 3 ângulos alternativos

<!-- From the brief's alternative interpretations and the pivot variants. Each with audience, problem, why it may score better and its biggest unknown. -->

1. {{ângulo}} — {{}}
2. {{ângulo}} — {{}}
3. {{ângulo}} — {{}}

## 12. Objeções do advogado do diabo e respostas

| # | Objeção | Gravidade | Resposta | Tratamento | Efeito na nota |
|---|---|---|---|---|---|
| 1 | {{}} | fatal / grave / ligeira | {{evidência ou plano}} | aceite / refutada / mitigada | {{nenhum / critério X: de a para b}} |

<!-- Every objection must be answered. Fatal objections: resolved with evidence or treated as a knockout candidate. Deep: add round 2 below. -->

**Ronda 2 (profundidade deep):** {{objeções novas e respostas}}

## 13. Recomendação para a estratégia

- **MVP:** {{}} · **Modelo e meio de pagamento prováveis:** {{}} · **Primeiro canal:** {{}}
- **A validar cedo (experiências para o GTM):** {{}}
- **Decisão registada:** `decision` = {{verdict, score}}; `depth` = {{}}

## 14. Fontes principais

<!-- Merge the track ledgers here only for the sources cited in this document (ID, link, accessed date, class). The full ledgers stay in the track notes. -->

| ID | Fonte | Acedido em | Classe |
|---|---|---|---|
| {{}} | [{{título}}]({{url}}) | {{AAAA-MM-DD}} | {{A/B/C/D}} |
