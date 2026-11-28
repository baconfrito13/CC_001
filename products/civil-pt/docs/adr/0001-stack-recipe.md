# ADR 0001 — Receita `web-saas` com camada de IA dormente (em vez de `ai-app`)

> **Estado:** accepted · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente) · **Relacionado:** ADR-0005, ADR-0008, US-07, `02-product.md` §5.1 e §7, `docs/04-architecture.md` §3

## Contexto

`product.json` tem `type: ai-app` (o ciclo «carregar PDF → IA mede → rever → exportar» do brief). Na estratégia, o PRD v0.2 retirou a IA do MVP: o motor mede com **geometria vetorial exata**, a IA (US-07, sugestões de designação) é *Should* 5.º e só entra por gatilho, e o critério de precisão do produto («sem IA no MVP; as peças não seguem para nenhum fornecedor de IA») é parte da proposta de valor e da resposta ao risco R2. A receita `ai-app` acrescenta à `web-saas` uma camada que o MVP não usa: cliente Anthropic, guarda por pedido, livro-razão `ai_usage` e `ai_budget_daily`, orçamento diário, *kill-switch*, evals e página `/ai`. O Must está no teto (30 unidades, `02-product.md` §5.1).

## Fatores de decisão

1. Cumpre as histórias Must (US-01 a US-06, US-08, US-12) sem trabalho fora do orçamento.
2. Custo a 10 000 contas e custo fixo antes de receita (≤ €50).
3. Tempo de construção (Must ≤ 30 unidades, margem 0).
4. *Lock-in* e custo de saída.
5. Residência na UE e superfície de subcontratantes.
6. Manutenção do projeto/dependências.

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo mensal a 0 / 100 / 10k | Lock-in / saída | Fonte |
|---|---|---|---|---|---|---|
| A — `ai-app` (por omissão do `type`) | `web-saas` + camada Anthropic completa | Pronta para US-07 | Constrói ≈ 8–10 unidades de camada de IA fora do Must; adiciona fornecedor nos EUA e `ANTHROPIC_API_KEY` ao MVP; contradiz a alegação «sem IA» | €42 / €42 / ≈ €1 241 + custo de IA | Anthropic (substituível por adaptador) | `ai-app.md`; `02-product.md` §7 |
| B — `web-saas` + camada de IA **dormente** | `web-saas` sem código de IA; US-07 acrescenta o módulo da receita `ai-app` quando o gatilho disparar (ADR 0008) | Cumpre o Must; menos um subcontratante; mesma base de dados e autenticação | Se US-07 avançar, há ≈ 3–8 unidades de camada de IA a construir (já orçamentadas em US-07 e no ADR 0008) | €42 / €42 / ≈ €1 241 | Nenhum novo | `web-saas.md` |
| C — `web-saas` alternativa: Better Auth + Drizzle + Neon | Mesma app, sem Supabase | Portabilidade; BD gratuita com escala a zero | Sem RLS (a tenancy passa a código, mais risco); sem Storage integrado (+ R2); *cold starts*; mais trabalho no Must | ≈ €20 / ≈ €25 / ≈ €900 (Vercel + Neon + R2) | Baixo | `web-saas.md` («Alternative») |

Pontuação 1–5 (cumpre história · custo a 10k · tempo de construção · *lock-in* · residência UE · manutenção): **A = 3·3·2·3·3·4 = 18 · B = 5·5·5·4·5·4 = 28 · C = 4·4·2·5·4·3 = 22**. Desempate: a receita por omissão não é a mais pontuada, por isso a decisão é um desvio documentado.

## Decisão

**Escolhemos B:** `stack.recipe = web-saas`. O tipo `ai-app` mantém-se em `product.json` como descrição do posicionamento do produto; **a receita descreve o que o MVP entrega**. A camada de IA fica descrita (ADR 0008), com adaptador `mock` e bandeiras `AI_ENABLED=false`, e só é construída por gatilho do PRD §5.4. O construtor usa `factory/stacks/web-saas.md` e **não** cria `src/lib/ai/`, `/ai` nem tabelas de IA.

## Consequências

- **Positivas:** o Must cabe; sem fornecedor de IA nem chave no MVP; a mensagem «peças não enviadas a fornecedores de IA» é verdadeira por desenho; menos superfície de ataque (T-12).
- **Negativas / custos aceites:** se o mercado exigir «IA» na mensagem, é preciso construir US-07 primeiro; o painel da fábrica mostra `type: ai-app` com receita `web-saas` (intencional).
- **Riscos e mitigação:** deriva silenciosa para IA sem ADR → qualquer chamada a um LLM exige novo ADR ou a ativação de US-07.
- **Impacto noutras fases:** legal: sem subcontratante de IA no MVP · gtm: não alegar «IA» antes de US-07 · qa: teste de que nenhum pedido de saída vai a fornecedores de IA · launch: sem tarefa C no go-live.

## Como verificamos

Revisão de `package.json` (sem `@anthropic-ai/sdk`) e e2e que falha se houver pedidos de rede a domínios de IA durante o processamento (`06-qa`).

## Revisitar quando

US-07 passar a Must por gatilho (≥ 5 das primeiras 20 demonstrações apontarem a designação como dor), ou o fundador pedir IA no MVP.

## Referências

- `factory/stacks/README.md` §2 e §6; `factory/stacks/ai-app.md` (acedido 2026-11-28)
- `products/civil-pt/docs/02-product.md` §5.1, §5.4, §7
