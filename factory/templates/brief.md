# Brief — {{name}}

<!-- Template for docs/00-brief.md. Rendered by `factory.py new` (replaces slug, name, one_liner, idea, type, date); the intake playbook (factory/playbooks/00-intake.md) fills the rest. Language: pt-PT. Delete every guidance comment when done; no double-brace placeholders may remain (grep before closing the phase). Never ask the founder: infer, and write every inference as an assumption. -->

> **Slug:** `{{slug}}` · **Tipo:** `{{type}}` · **Criado em:** {{date}} · **Origem:** {{origem: chat / issue #N / inbox / ação}} · **Profundidade:** {{lean/standard/deep}} (definida pelo fundador: {{sim/não}})

## 1. Ideia original (palavras do fundador)

<!-- Verbatim, untouched: typos, language, line breaks. The fence keeps multi-line ideas intact. Redact secrets as [REDACTED] and say so under Alertas. -->

~~~~text
{{idea}}
~~~~

## 2. Resumo numa frase

{{one_liner}}

<!-- pt-PT, ≤ 20 words: "<Produto> ajuda <público> a <resultado> sem <dor>". Used in the PR title and README. -->

## 3. Problema

{{Uma frase, nas palavras do cliente («perco X a fazer Y»), sem mencionar a solução.}}

## 4. Público-alvo

| | |
|---|---|
| **Segmento primário** | {{quem, contexto, B2B ou B2C, país/idioma}} |
| **Segmento secundário** | {{opcional}} |
| **Quem paga** | {{o próprio utilizador / a empresa / outro}} |
| **Alternativa atual** | {{folha de cálculo, serviço, concorrente, não fazer nada}} |

<!-- Narrowest identifiable segment that has the pain AND a budget. Prefer the founder's own audience from FOUNDER.md. B2B if the idea mentions companies/teams/clients. -->

## 5. Trabalho a realizar (JTBD)

Quando {{situação}}, quero {{motivação}}, para {{resultado}}.

## 6. Proposta de valor

{{Uma linha: resultado + para quem + porque é melhor do que a alternativa atual.}}

## 7. Tipo de produto

**`{{type}}`** — {{porquê, em 1–2 frases}}. Alternativas descartadas: {{tipo}} ({{motivo}}).

<!-- Taxonomy in factory/PIPELINE.md. Default to web over mobile unless a native capability is essential. If the founder stated the type, say "decisão do fundador". -->

## 8. Hipótese de monetização

| | |
|---|---|
| **Modelo** | {{subscrição / utilização / pagamento único / freemium / afiliados/anúncios / margem em produtos / …}} |
| **Pagador** | {{quem}} |
| **Preço indicativo** | {{faixa em €, IVA incluído para consumidores}} |
| **Meio de pagamento provável** | {{Merchant of Record / Stripe / loja de apps / Shopify / n/a}} (ver `factory/playbooks/monetization.md`) |
| **Primeiro euro** | {{como e quando poderia acontecer}} |

<!-- Hypothesis only; strategy decides. Defaults by type are in the intake playbook. -->

## 9. Porquê agora e diferenciação provável

- **Porquê agora:** {{palpite, não verificado}}
- **Diferenciação provável:** {{palpite, não verificado}}

## 10. Interpretação escolhida

<!-- Only when the idea was vague (missing ≥ 2 of audience / problem / product shape). Otherwise write "A ideia era suficientemente concreta; sem interpretações alternativas." -->

| # | Público | Problema | Forma do produto | Monetização | Escolhida |
|---|---|---|---|---|---|
| 1 | {{}} | {{}} | {{}} | {{}} | ✅ |
| 2 | {{}} | {{}} | {{}} | {{}} | |
| 3 | {{}} | {{}} | {{}} | {{}} | |

**Critério:** monetização mais clara, depois facilidade de construção, depois proximidade às palavras do fundador. As alternativas 2 e 3 são candidatas a pivot na pesquisa.

## 11. Restrições e preferências

<!-- From FOUNDER.md and the idea itself. Founder statements are decisions, not assumptions. -->

- **Orçamento / tempo do fundador:** {{}}
- **Idiomas / mercados:** {{en + pt-PT por omissão}}
- **Tom ou marca pretendidos:** {{}}
- **Decisões do fundador (a respeitar):** {{preço, stack, prazo, nome… ou «nenhuma»}}

## 12. Pressupostos

<!-- 5–12 (lean ≥ 3). Must cover: who pays, willingness to pay, first channel, build feasibility, regulation, language/locale, anything inferred about the founder. Each says what happens if it is false and which research track tests it. -->

| ID | Pressuposto | Se for falso… | Testado em | Confiança |
|---|---|---|---|---|
| A1 | {{}} | {{}} | mercado / concorrentes / público / riscos | baixa / média |
| A2 | {{}} | {{}} | {{}} | {{}} |
| A3 | {{}} | {{}} | {{}} | {{}} |

## 13. Fora do âmbito (por agora)

- Nome final, identidade visual e domínio → fase `brand`.
- Pilha tecnológica e arquitetura → fase `architecture`.
- Preços finais e âmbito do MVP → fase `strategy`.
- {{outros}}

## 14. Alertas

<!-- Suspected knockouts (illegal, needs a licence, platform ToS, ethical harm, conflict with FOUNDER.md exclusions), redacted secrets, duplicates of existing products. If none: "Nenhum." Research Step 0 verifies each one. -->

{{Nenhum.}}

## 15. Registo de alterações

| Data | Fase | Alteração | Motivo |
|---|---|---|---|
| {{date}} | intake | Brief criado | — |
