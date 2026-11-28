# ADR 0008 — Política de IA: dormente no MVP; fornecedor, região e minimização se US-07 avançar

> **Estado:** accepted (dormente) · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente) · **Relacionado:** US-07, ADR-0001, `02-product.md` §5.4 e §7, `02-business.md` §5 (margens com IA), `docs/04-architecture.md` §8

## Contexto

O MVP **não usa IA** (as quantidades vêm da geometria; PRD §7). US-07 (sugestões de designação e unidade) é *Should* 5.º, com gatilho: ≥ 5 das primeiras 20 demonstrações apontarem a designação como dor **e** DPA do fornecedor, página `/ai` e teto de custo prontos. A pesquisa registou que a API direta da Anthropic só oferece `inference_geo` `us` ou `global` e que a inferência só na UE exige Bedrock ou Vertex (+10 % nos *endpoints* regionais) — [preços](https://platform.claude.com/docs/en/about-claude/pricing), 2026-11-28. As peças dos clientes são confidenciais e a alegação comercial é «peças não enviadas a fornecedores de IA».

## Fatores de decisão

1. Confidencialidade das peças e honestidade da alegação.
2. Custo por folha e margem (IA ≤ 25 % do ARPU; custo por conta gratuita ≤ €0,20).
3. Residência dos dados (UE).
4. Esforço e fornecedor (conta do fundador).

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo por folha | Fonte |
|---|---|---|---|---|---|
| A — API direta da Anthropic, **só texto da legenda e dos rótulos** (nunca o PDF nem a geometria) | Haiku 5.5 para classificar (`$0,10/$0,50` por MTok); Sonnet 5.5 como escalão superior (`$2/$10`) | Dados mínimos; ≈ $0,0005 (Haiku) a $0,009 (Sonnet) por folha com ≈ 2 000 tokens de entrada e 500 de saída; mais simples | Inferência `global` ou `us` (não só UE): o texto sai da UE | ≈ $0,0005–0,009 | [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing), 2026-11-28 |
| B — Bedrock UE (ou Vertex) com *endpoint* regional | Mesma capacidade, inferência na UE | Residência UE | Conta AWS do fundador, +10 %, mais configuração | ≈ $0,0006–0,010 | idem |
| C — Sem IA (permanecer determinístico: US-17, correspondência pela legenda) | Alternativa já no PRD | Zero risco de dados e custo | Não resolve designações sem legenda | $0 | PRD §5.4 |
| D — IA sobre o desenho (visão), como no cálculo da v0.1 | Passagens de imagem | Mais cobertura | €0,054–0,34/folha; envia o desenho; precisão de visão pura ≈ 52,8 % em ±25 % | €0,054–0,34 | PRD §10; `01-research.md` |

## Decisão

**No MVP: nenhuma IA, nenhuma chave, nenhum subcontratante de IA.** Se o gatilho de US-07 disparar: **A** por defeito (texto da legenda e rótulos, limitado a `AI_MAX_INPUT_CHARS`, sem o PDF, sem geometria, sem nomes de projeto/ficheiro; saída validada por zod; **a IA nunca altera quantidades**), com adaptador `AI_PROVIDER=anthropic|mock` e *kill-switch* `AI_ENABLED`; **B** só se um cliente exigir inferência na UE. A camada segue a receita `ai-app`: guarda por pedido (autenticação → *kill-switch* → limites → quota → tetos), `ai_usage` e `ai_budget_daily` com RLS, orçamento diário com alerta a 80 % e corte a 100 %, rótulo «Sugestão de IA», página `/ai`, evals ≥ 20 casos pt-PT, modelos lidos de `AI_MODEL_FAST|DEFAULT|SMART` (nunca fixos no código) e opção da *fallback* do servidor, registada porque pode mudar o custo. Teto de €0,50 por folha (PRD US-07 critério 5).

## Consequências

- **Positivas:** a alegação «no MVP as peças não são enviadas a nenhum fornecedor de IA» é verdadeira; US-07 pode custar 10–40× menos do que o previsto na v0.1 se o texto da legenda bastar (**a validar com evals**; o PRD deve rever a margem se avançar).
- **Negativas / custos aceites:** com A o texto sai da UE (a formulação da mensagem muda para «IA com DPA, sem treino com os seus dados», declarando a região); depende da qualidade das legendas.
- **Riscos e mitigação:** injeção por texto da legenda (T-12) → saída validada, quantidades do motor; custo → tetos e *kill-switch*.
- **Impacto noutras fases:** legal: DPA, retenção da API, AI Act (risco mínimo/limitado a confirmar) · gtm: não alegar IA antes de US-07 · fundador: tarefa C (conta, limite de gasto, `ANTHROPIC_API_KEY`) só no gatilho.

## Como verificamos

Hoje: o *build* não tem `@anthropic-ai/sdk` e nenhum pedido sai para domínios de IA (e2e). Com US-07: critérios 1–5 de US-07, evals, teste de *kill-switch* e de custo por folha.

## Revisitar quando

O gatilho de US-07 disparar; um cliente exigir inferência só na UE; a API direta passar a oferecer região UE; ou o custo médio por folha passar de €0,34.

## Referências

- https://platform.claude.com/docs/en/about-claude/pricing — acedido em 2026-11-28 (Sonnet 5.5 $2/$10; Haiku 5.5 $0,10/$0,50; `inference_geo` `us` ×1,1)
- `products/civil-pt/docs/research/risks.md` (regiões de inferência, 2026-11-26)
- `factory/stacks/ai-app.md`
