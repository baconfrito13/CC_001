# PRD — {{name}}

<!--
Template for docs/02-product.md. Language: pt-PT. Procedure: factory/playbooks/02-strategy.md (Steps 3-4). The PRD is read by build/QA agents: be concrete and testable, no adjectives without numbers. Delete guidance comments when done; the double-brace placeholder and TODO must not remain.
Sizing units: S = 1 (a screen or endpoint with tests), M = 3 (feature with data + UI + tests), L = 8 (multi-part/integration); split anything bigger. Budget by depth: lean Must <= 15; standard Must <= 25 and Must+Should <= 40; deep Must <= 30, total <= 70.
-->

> **Produto:** `{{slug}}` · **Versão:** {{0.1}} · **Data:** {{AAAA-MM-DD}} · **Profundidade:** {{lean/standard/deep}} · **Estado:** rascunho / aprovado · **Depende de:** `01-research.md`, `02-business.md`

## 1. Visão e posicionamento

- **Frase de posicionamento (cunha):** {{Para <segmento> que <dor>, <produto> é <categoria> que <benefício>, ao contrário de <alternativa> que <falha>.}}
- **Teste dos 5 segundos:** o que é · para quem · porquê agora → {{resposta de uma linha}}
- **Diferenciação vs. os 3 concorrentes mais próximos:** {{tabela curta ou lista}}

## 2. Personas

<!-- 1 primary, up to 2 secondary. Pains are verbatim quotes from research/audience.md. No invented demographics. B2B: describe buyer and user separately. -->

| | **Primária — {{nome-arquétipo}}** | Secundária — {{}} |
|---|---|---|
| Contexto | {{}} | {{}} |
| Objetivos | {{}} | {{}} |
| Dores (citações) | «{{}}» | «{{}}» |
| Gatilho de procura | {{}} | {{}} |
| Solução atual | {{}} | {{}} |
| Objeções à compra | {{}} | {{}} |
| Orçamento / quem paga | {{}} | {{}} |
| Canais e idioma | {{}} | {{}} |

## 3. Trabalho a realizar (JTBD)

**Principal:** Quando {{situação}}, quero {{motivação}}, para {{resultado}}.
**Relacionados:** {{2–3}}

| Força | Descrição |
|---|---|
| Empurrão (o que faz sair da solução atual) | {{}} |
| Atração (o que o novo produto promete) | {{}} |
| Ansiedade (medos de mudar) | {{}} |
| Hábito (o que prende à solução atual) | {{}} |

## 4. Jornada do utilizador

| Etapa | Ação | Emoção | Ponto de contacto | Métrica | Principal risco de abandono |
|---|---|---|---|---|---|
| Descobrir | {{}} | {{}} | {{}} | {{}} | {{}} |
| Visitar o site | {{}} | {{}} | {{}} | {{}} | {{}} |
| Registar-se | {{}} | {{}} | {{}} | {{}} | {{}} |
| **Ativação («aha»)** | {{evento exato}} | {{}} | {{}} | {{tempo até valor: < 5 min}} | {{}} |
| Pagar | {{}} | {{}} | {{}} | {{}} | {{}} |
| Reter | {{}} | {{}} | {{}} | {{}} | {{}} |
| Recomendar | {{}} | {{}} | {{}} | {{}} | {{}} |

**Evento de ativação:** `{{activation_reached}}` = {{definição mensurável}}.

## 5. Âmbito do MVP (MoSCoW)

<!-- Must = removing it makes the first sale impossible or hides the wedge. Always Must: payment path (unless a free wedge is justified), activation step, funnel analytics events, accessibility basics. Factory-standard items already in the starter are not counted (verify in factory/starters/web/README.md). Cut order when over budget: secondary persona > admin tooling > automation (do it manually) > integrations > extra platforms > extra locale for long-form content. -->

| ID | História | Prioridade | Tamanho | Persona | Evento de analítica |
|---|---|---|---|---|---|
| US-01 | {{}} | Must | {{S/M/L}} | {{}} | `{{evento}}` |
| US-02 | {{}} | Must | {{}} | {{}} | `{{}}` |
| US-0n | {{}} | Should | {{}} | {{}} | `{{}}` |

**Orçamento:** Must = {{n}} unidades (limite {{}}) · Must + Should = {{n}} (limite {{}}) · margem {{n}}.

**Não faremos agora (Won't):**

| Item | Porquê | Rever quando… |
|---|---|---|
| {{}} | {{}} | {{gatilho mensurável}} |

## 6. Histórias de utilizador e critérios de aceitação

<!-- Each Must story: >= 2 criteria, Given/When/Then, automatable by an e2e test (Playwright): concrete data, one error/edge case, measurable thresholds. Avoid "rápido", "fácil", "intuitivo". -->

### US-01 — {{título}}
Como {{persona}}, quero {{ação}}, para {{benefício}}.

| # | Dado | Quando | Então |
|---|---|---|---|
| 1 | {{contexto concreto}} | {{ação do utilizador}} | {{resultado observável e mensurável}} |
| 2 | {{caso de erro ou limite}} | {{}} | {{mensagem exata ou comportamento}} |

### US-02 — {{título}}
{{…}}

## 7. Não-objetivos e requisitos não funcionais

**Não-objetivos:** {{o que o produto deliberadamente não é / não faz}}

**Requisitos não funcionais**

| Área | Requisito | Verificação |
|---|---|---|
| Desempenho | {{ex.: LCP ≤ 2,5 s em 4G; p95 de API ≤ 500 ms}} | {{Lighthouse / teste de carga}} |
| Acessibilidade | WCAG 2.2 AA; navegação por teclado; sem violações axe | {{axe no e2e}} |
| Idiomas | `en` + `pt-PT` (UI, emails, legal); formato de datas/moeda local | {{}} |
| Privacidade | Mínimo de dados pessoais; consentimento antes de analítica não essencial; retenção {{}} | {{revisão legal}} |
| Segurança | {{autenticação, autorização, limites de taxa, segredos só em variáveis de ambiente}} | {{auditoria}} |
| SEO | {{metadados, sitemap, dados estruturados nas páginas públicas}} | {{checklist SEO}} |
| Disponibilidade | {{expectativa}} | {{monitorização}} |

## 8. Métricas de sucesso

| Tipo | Métrica | Definição (evento) | Dia 30 | Dia 90 | Dia 365 |
|---|---|---|---|---|---|
| **North star** | {{ex.: clientes pagantes que concluíram a ativação nos últimos 7 dias}} | `{{}}` | {{}} | {{}} | {{}} |
| Entrada | visita → registo | `page_viewed` → `signup_completed` | {{}} | {{}} | {{}} |
| Entrada | registo → ativação | `signup_completed` → `activation_reached` | {{}} | {{}} | {{}} |
| Entrada | ativação → pago | `activation_reached` → `purchase_completed` | {{}} | {{}} | {{}} |
| Retenção | W1 / W4 | {{}} | {{}} | {{}} | {{}} |
| Guarda-corpos | reembolsos, pedidos de apoio/100 utilizadores, erros, p95 | {{}} | {{}} | {{}} | {{}} |

**Gatilhos de decisão pós-lançamento:** {{ex.: dia 60 com < 1% visita→registo ou 0 pagantes → executar o checklist de pivot}}.

## 9. Plano de eventos de analítica

<!-- snake_case, object_action in past tense, no PII in properties. Tool-agnostic (architecture picks the tool). Revenue events are sent server-side from the payment webhook. -->

| Evento | Quando dispara | Propriedades | História | Passo do funil |
|---|---|---|---|---|
| `page_viewed` | {{}} | `path`, `locale`, `source` | — | Descobrir |
| `signup_started` / `signup_completed` | {{}} | `method`, `locale` | {{}} | Registar |
| `activation_reached` | {{}} | {{}} | {{}} | Ativação |
| `checkout_started` | {{}} | `plan`, `interval` | {{}} | Pagar |
| `purchase_completed` | webhook do meio de pagamento | `plan`, `interval`, `amount_eur` | {{}} | Pagar |
| `subscription_canceled` | {{}} | `plan`, `reason` | {{}} | Reter |
| {{evento por história Must}} | {{}} | {{}} | US-{{}} | {{}} |

## 10. Dependências e integrações

| Dependência | Para quê | Custo / limites (fonte + data) | Alternativa |
|---|---|---|---|
| Meio de pagamento: {{}} | cobrar | {{comissão}} | {{}} |
| {{auth / email / IA / API}} | {{}} | {{}} | {{}} |

## 11. Riscos e rastreabilidade (da pesquisa)

<!-- Every top risk, the wedge, each unmet need and the first channel must map to a story, NFR or event. -->

| Origem na pesquisa | Mitigação / onde aparece | História / requisito |
|---|---|---|
| Risco R1 {{}} | {{}} | {{US-xx / NFR}} |
| Cunha · necessidade «{{tema}}» · canal «{{}}» | {{}} | US-{{}} · evento `{{}}` |

## 12. Pressupostos em aberto e roteiro pós-MVP

<!-- The devil's-advocate critic appends "## Objeções do advogado do diabo" after this section; answer under each objection and keep a single objections section. -->

- **Pressupostos:** {{lista; os que dependem de dados reais ficam marcados PRESSUPOSTO}}
- **Depois do MVP (Should/Could):** {{por ordem de valor/esforço}}
