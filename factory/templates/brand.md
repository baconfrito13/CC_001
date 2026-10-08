# Marca — {{name}}

<!--
Template for docs/03-brand.md. Language: pt-PT (EN taglines/copy where marked). Procedure: factory/playbooks/03-brand.md. Rules that matter here: never write "disponível" for a domain unless the Shopify generate-domain-names tool said so (show tool output + date; otherwise NÃO VERIFICADO); the trademark check is a sanity check, not legal clearance; contrast ratios are computed (script in the playbook), not eyeballed; tokens.json has EXACTLY the shape in the playbook (no extra keys). Delete guidance comments when done; the double-brace placeholder and TODO must not remain.
-->

> **Produto:** `{{slug}}` · **Data:** {{AAAA-MM-DD}} · **Profundidade:** {{lean/standard/deep}} · **Depende de:** `02-product.md` (posicionamento) · **Ficheiros:** `brand/logo.svg`, `brand/logo-mark.svg`, `brand/tokens.json`, `brand/assets/`

## 1. Decisão

| | |
|---|---|
| **Nome** | **{{Nome}}** (substitui o nome de trabalho «{{}}») |
| **Domínio** | `{{dominio.tld}}` — {{disponível segundo a ferramenta Shopify em AAAA-MM-DD, ≈ n €/ano / CONDICIONAL: NÃO VERIFICADO}} |
| **Reserva (n.º 2)** | {{Nome2}} · `{{dominio2.tld}}` ({{estado}}) |
| **Marca registada (verificação preliminar)** | {{sem conflitos óbvios encontrados em … em AAAA-MM-DD / cautela: …}} — `legal/trademark-check.md` |
| **Tagline** | EN: «{{}}» · PT: «{{}}» |
| **Cor da marca / raio / tipografia** | {{#hex}} · {{0,75rem}} · {{sistema / família}} |
| **Tarefas do fundador** | `HUMAN_TASKS.md`: HT-{{n}} comprar domínio · HT-{{n}} reservar contas sociais · HT-{{n}} (opcional) registar a marca |
| **Alternativas rejeitadas** | {{nome / paleta / logótipo: o que e porquê, em 1 linha cada}} |

## 2. Estratégia de marca

- **Posicionamento:** {{frase de `02-product.md`}}
- **Personalidade (somos X, não Y):** {{3–5 pares}}
- **Promessa:** {{uma oração}} · **Território(s) de nome explorado(s):** {{sugestivo / inventado / composto / metáfora}}

## 3. Nome

### 3.1 Candidatos e destino

<!-- All 15-30 candidates. Fate: eliminado (porque: gate) / lista curta / finalista / escolhido. -->

| # | Nome | Origem (ferramenta / própria) | Território | Destino | Motivo |
|---|---|---|---|---|---|
| 1 | {{}} | {{}} | {{}} | {{}} | {{}} |

### 3.2 Gates e pontuação

<!-- Gates are pass/fail (✅/❌): pronúncia EN/PT · sem sentido negativo em PT, EN, ES, FR (dicionários consultados) · distinto dos concorrentes · pesquisável · encaixa no posicionamento. Score 0-100 only for names that pass: memorabilidade/brevidade 20 · encaixe 20 · domínio 20 (.com 20, TLD forte 14, variante 12, condicional 8) · distintividade 15 · pronúncia/ortografia 10 · handles 10 · extensibilidade 5. Deep: add the tournament bracket with the judges' one-line reasons. -->

| Nome | Gates (5) | Memor. | Encaixe | Domínio | Distint. | Pronúncia | Handles | Extens. | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| {{}} | ✅✅✅✅✅ / ❌ {{qual}} | | | | | | | | **{{}}** |

### 3.3 Verificação de domínios (ferramenta Shopify `generate-domain-names`)

| Nome | Domínio consultado | Resultado da ferramenta | Preço 1.º ano | Alternativas sugeridas | Data |
|---|---|---|---|---|---|
| {{}} | `{{x.com}}` | disponível / indisponível / NÃO VERIFICADO | {{€}} | {{}} | {{AAAA-MM-DD}} |

**Regra de preço:** 1.º ano e renovação ≤ 35 €/ano (≤ 90 € para `.ai`); sem domínios premium nem TLDs de má reputação. **Renovação a confirmar no registador na compra.**

### 3.4 Handles e nomes de pacote (informativo)

| Nome | GitHub | npm / PyPI | Instagram | X | LinkedIn | TikTok | YouTube | Loja (app/extensão) |
|---|---|---|---|---|---|---|---|---|
| {{}} | livre (404) / ocupado / n.v. | {{}} | n.v. | n.v. | n.v. | n.v. | n.v. | {{}} |

<!-- n.v. = não verificado (bots bloqueados); covered by a founder task. "livre" only means "returned 404 on AAAA-MM-DD". -->

### 3.5 Verificação preliminar de marca registada

<!-- Not legal clearance. Details and screenshots in legal/trademark-check.md and brand/assets/trademark/. Nice classes: 9, 42, 35, 41, 36 and the product's own field (verify classes at WIPO). -->

| Finalista | EUIPO | TMview | WIPO | INPI (PT) | USPTO | Veredicto |
|---|---|---|---|---|---|---|
| {{}} | {{sem resultados / cautela / bloqueado}} | {{}} | {{}} | {{}} | {{}} | claro / cautela / bloqueado |

Aviso: esta verificação não substitui aconselhamento jurídico; antes de investir em marketing pago, confirmar com um profissional de PI.

## 4. Mensagem

| | EN | pt-PT (escrito de raiz) |
|---|---|---|
| **Tagline** | {{}} | {{}} |
| **Descrição (≤ 25 palavras)** | {{}} | {{}} |
| **Meta descrição (≤ 155 caracteres)** | {{}} | {{}} |
| **Texto institucional (~50 palavras)** | {{}} | {{}} |

## 5. Voz e tom

| Atributo (3–4) | Fazer (exemplo) | Não fazer (exemplo) |
|---|---|---|
| {{ex.: Claro}} | {{}} | {{}} |

**Tom por contexto:** marketing {{}} · interface {{}} · erros {{o que aconteceu + o que fazer}} · faturação/legal {{}} · apoio {{}}.

**Tratamento em pt-PT:** {{tu (B2C) / formas impessoais (B2B/finanças/saúde/legal)}}; nunca «você». Ortografia AO90, vocabulário europeu.

**Glossário pt-PT ↔ EN**

| EN | pt-PT | Notas |
|---|---|---|
| sign in / sign up | iniciar sessão / criar conta | não «fazer login» |
| password / download / settings / subscription | palavra-passe / descarregar / definições / subscrição | base completa no playbook `03-brand.md` |
| {{termos do produto}} | {{}} | {{}} |

## 6. Paleta (claro e escuro)

<!-- Values must equal brand/tokens.json. Ratios computed with the playbook's check_tokens.py (WCAG 2.x relative luminance). Required: all text pairs >= 4.5, including brand and accent as text on background (the starter's apply-brand.mjs checks them). Border on background >= 1.5 is advisory (decorative hairline in the starter; inputs use muted-foreground). -->

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `brand` | `{{#}}` | `{{#}}` | ações principais, ligações |
| `brand-foreground` | `{{#}}` | `{{#}}` | texto sobre `brand` |
| `accent` | `{{#}}` | `{{#}}` | destaques |
| `accent-foreground` | `{{#}}` | `{{#}}` | texto sobre `accent` |
| `background` / `foreground` | `{{#}}` / `{{#}}` | `{{#}}` / `{{#}}` | página e texto |
| `muted` / `muted-foreground` | `{{#}}` / `{{#}}` | `{{#}}` / `{{#}}` | superfícies e texto secundário |
| `card` / `card-foreground` | `{{#}}` / `{{#}}` | `{{#}}` / `{{#}}` | cartões |
| `border` | `{{#}}` | `{{#}}` | contornos de campos |

**Contrastes calculados**

| Par | Claro | Escuro | Mínimo | Resultado |
|---|---|---|---|---|
| foreground / background | {{}}:1 | {{}}:1 | 4,5 | ✅ |
| card-foreground / card · muted-foreground / background, muted, card | {{}} | {{}} | 4,5 | ✅ |
| brand-foreground / brand · accent-foreground / accent | {{}} | {{}} | 4,5 | ✅ |
| brand / background, card · accent / background (texto de marca e de destaque) | {{}} | {{}} | 4,5 | ✅ |
| border / background (consultivo; linha decorativa) | {{}} | {{}} | 1,5 | {{✅ / aviso}} |

**Raciocínio:** {{matiz escolhido e porquê; diferenciação face aos concorrentes; modo escuro não é inversão}}.

## 7. Tipografia

| | Família / pilha CSS | Licença e origem | Pesos | Carregamento |
|---|---|---|---|---|
| `sans` (corpo e UI) | {{}} | {{sistema / OFL — URL}} | {{400, 600}} | {{sem pedidos externos / alojada localmente}} |
| `display` (títulos) | {{}} | {{}} | {{}} | {{}} |

Corpo ≥ 16 px, altura de linha 1,5, escala modular {{1,25}}. Teste de caracteres portugueses: «Ação, coração, pão, órgão, ênfase, à, ü» → {{ok}}. Fontes nunca ligadas ao CDN da Google (RGPD).

## 8. Logótipo

- **Conceito:** {{a ideia em 1–2 frases}} · **Alternativas descartadas:** {{}} <!-- deep: two directions, compared at 16 px -->
- **Construção:** grelha 32×32, {{n}} formas, espessura mínima 2 unidades, raio coerente com `radius`.
- **Verificações:** XML válido ✅ · legível a 16/32/64/128 px em claro e escuro ✅ · versão monocromática ✅ · wordmark em curvas (`fonttools`) / texto de sistema ({{}}).

**Ficheiros:** `brand/logo.svg` (lockup horizontal, adapta-se ao modo escuro) · `brand/logo-mark.svg` (só a marca, `currentColor`) · `brand/assets/` (`favicon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `og-image.png` 1200×630, {{banners / moodboard / ligação Figma}}).

**Regras de utilização:** espaço livre = ½ da altura da marca · tamanho mínimo 16 px (marca) / 80 px (lockup) · não distorcer, não recolorir fora da paleta, não pôr sobre fundos com contraste < 3:1 · usar ™ (não ®) até haver registo.

## 9. Tokens

`brand/tokens.json` (formato exato lido por `npm run brand:apply`) · validado com `check_tokens.py` em {{AAAA-MM-DD}}: **OK** · `font.sans` `{{}}` · `font.display` `{{}}` · `radius` `{{0.75rem}}`.
