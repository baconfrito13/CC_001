# ADR {{NNNN}} — {{título curto da decisão}}

<!--
Template for docs/adr/NNNN-<slug>.md (kebab-case slug, four-digit number, no gaps). One decision per ADR, max one page. Language: pt-PT. Written by the solution-architect (phase 04) or by any agent that deviates from a default in factory/stacks/ or from the PRD/architecture (phase 05+: status "proposed" if the decision is not yet confirmed). Rules: at least two real options with numbers (cost at 0/100/10k users, effort, lock-in, EU residency); cite every fact with URL + access date; "verificar à data de execução" for anything that changes. Accepted ADRs are immutable: to change a decision write a new ADR and set this one to "substituído por ADR-NNNN". Delete guidance comments and double-brace placeholders when done.
-->

> **Estado:** {{proposed | accepted | rejected | substituído por ADR-NNNN}} · **Data:** {{AAAA-MM-DD}} · **Produto:** `{{slug}}` · **Fase:** {{architecture | build | qa | launch | growth}} · **Decisor:** {{agente / fundador}} · **Relacionado:** {{ADR-xxxx, US-xx, docs/04-architecture.md §n}}

## Contexto

<!-- 3-6 lines: the problem or constraint that forces a decision, with the PRD story ids, limits or measurements behind it. No solution here. -->

{{O que precisa de ser decidido e porquê agora; histórias e requisitos afetados; restrições (orçamento, UE, prazo).}}

## Fatores de decisão

<!-- Ranked, 3-6 items. Typical: cumpre a história · custo a 10k utilizadores · tempo de construção · lock-in / custo de saída · residência na UE · manutenção do projeto. -->

1. {{fator mais importante}}
2. {{}}
3. {{}}

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo mensal a 0 / 100 / 10k | Lock-in / saída | Fonte (URL, data) |
|---|---|---|---|---|---|---|
| A — {{opção por omissão da receita}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |
| B — {{alternativa}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |

<!-- Deviation from a recipe default: score each option 1-5 per decision factor and show the totals; ties go to the recipe default. -->

## Decisão

**Escolhemos {{opção}}** porque {{razão em 1-2 frases ligada aos fatores}}.

## Consequências

- **Positivas:** {{}}
- **Negativas / custos aceites:** {{}}
- **Riscos e mitigação:** {{}}
- **Impacto noutras fases:** {{legal: novo subcontratante · gtm: · launch: tarefa do fundador HT-xx · qa: teste obrigatório}}

## Como verificamos

<!-- A test, metric or checklist item that proves the decision works, and who runs it. -->

{{teste/ métrica/ item da checklist; fase em que é verificado}}

## Revisitar quando

<!-- Concrete trigger with a number or event, e.g. "mais de 50k MAU", "custo de IA > 25 % do ARPU", "o fornecedor X descontinuar Y", "o fundador mudar de estrutura legal". -->

{{gatilho mensurável}}

## Referências

- {{URL — título — acedido em AAAA-MM-DD}}
