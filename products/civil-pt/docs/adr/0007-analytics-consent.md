# ADR 0007 — Analítica e consentimento: PostHog UE; métricas de negócio na base de dados

> **Estado:** accepted · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente) · **Relacionado:** PRD §8–9, US-05, ADR-0003, `docs/04-architecture.md` §12 e §14

## Contexto

O PRD §9 define ≈ 30 eventos (funil, ativação, pagamento) «sem dados pessoais, só após consentimento, **exceto** os de receita e segurança, enviados do servidor sem identificar a pessoa». A métrica norte («empresas pagantes com ≥ 1 mapa exportado em 30 dias») e os gatilhos T1–T8 decidem se o produto continua: não podem depender de o utilizador aceitar cookies. O teto de custo fixo é €50 (previsto €42; folga €8). O recipe admite Plausible ou PostHog UE.

## Fatores de decisão

1. Medir o funil e as métricas de decisão sem depender de consentimento.
2. Custo (a folga é €8/mês).
3. Residência UE e conformidade (ePrivacy/RGPD).
4. Esforço de construção.

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo mensal a 0 / 100 / 10k | Lock-in | Fonte |
|---|---|---|---|---|---|---|
| A — PostHog UE (cliente após consentimento) + **métricas de negócio em vistas SQL** | PostHog para o funil comportamental; a BD é a fonte da métrica norte, ativação, devoluções e raster | Gratuito até 1 M eventos; eventos de servidor sem identificação; decisões não dependem de cookies | Duas fontes (BD + PostHog); página de preços do PostHog trunca na consulta | €0 / €0 / ≈ €77 | Baixo | [PostHog](https://posthog.com/pricing), 2026-11-28 (via pesquisa) |
| B — Plausible (UE, sem cookies) | Tráfego simples, eventos personalizados | Sem consentimento só para ele; simples | **$9/mês** (10 000 vistas) consome a folga de €8 do teto; sem funil de produto | ≈ €8 / €8 / ≈ €17 | Baixo | [Plausible](https://plausible.io/#pricing), 2026-11-28 |

Pontuação 1–5 (decisão sem consentimento · custo · UE · esforço): **A = 5·5·4·4 = 18 · B = 3·2·5·5 = 15**.

## Decisão

**Escolhemos A.** (i) `posthog-js` só **depois** de o utilizador aceitar (banner da starter, aceitar e recusar com o mesmo peso), `person_profiles: 'identified_only'`, `api_host = https://eu.i.posthog.com`, identificar com o id interno e **nunca** com email nem nomes; (ii) eventos do **servidor** de receita, segurança e operação com `$process_person_profile: false` e sem id de pessoa; (iii) a métrica norte, a ativação, as folhas devolvidas, o raster e o grupo dominante são **vistas SQL** sobre a BD (sem PII, sem consentimento); (iv) nenhum nome de projeto ou de ficheiro, email ou NIF em eventos, *logs* ou Sentry (SR-09); (v) Sentry com residência UE.

## Consequências

- **Positivas:** os gatilhos de matar ou pivotar medem-se sem cookies; custo €0; menos um fornecedor pago.
- **Negativas / custos aceites:** o funil de navegação só existe para quem consente; manter o dicionário de eventos em dois sítios (cliente/servidor); a região exata do PostHog UE e as transferências para a casa-mãe ficam para o `legal`.
- **Riscos e mitigação:** consentimento baixo reduz `page_viewed` → o `outbound` manual (`demo_outcome`) e a BD cobrem o essencial.
- **Impacto noutras fases:** legal: política de cookies e de privacidade com PostHog e Sentry; subcontratantes · gtm: funil e UTM só com consentimento · qa: teste de que nada se carrega antes do consentimento.

## Como verificamos

e2e: sem aceitar, nenhum pedido a `posthog`; teste do dicionário (sem campos proibidos); vistas SQL comparadas com eventos de teste.

## Revisitar quando

> 700 000 eventos/mês, ou o PostHog deixar de oferecer 1 M gratuito, ou o `legal` exigir analítica sem cookies (Plausible).

## Referências

- https://posthog.com/pricing — acedido em 2026-11-28 (página truncada; confirmado por pesquisa)
- https://plausible.io/#pricing — acedido em 2026-11-28
- `products/civil-pt/docs/02-product.md` §9
