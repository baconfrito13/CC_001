# Construção — Rastoplan

> **Produto:** `civil-pt` · **Versão:** 0.1.0 (esqueleto) · **Atualizado em:** 2026-11-28 · **Commit:** a registar pelo *checkpoint* (esqueleto ainda por submeter) · **Receita:** `web-saas` (camada `ai-app` dormente, ADR 0001) · **Diretório da app:** `products/civil-pt/app` · **Depende de:** `02-product.md` (v0.2), `04-architecture.md` (v0.1)

## 1. Resumo

- **Histórias must concluídas:** 0/8 (US-01, US-02, US-03, US-04, US-05, US-06, US-08, US-12 = 30 unidades) · **should concluídas:** 0/2 planeadas (US-11, US-15) · **bloqueadas:** 0 (secção 5).
- **Estado:** esqueleto pronto e verde (fase `build`, passo 1): a *starter* da fábrica foi copiada para `products/civil-pt/app`, configurada para o Rastoplan (nome, domínio, preços em euros, textos pt-PT e en, tokens da marca, logótipo e ícones) e as dependências com avisos de segurança foram atualizadas. Ainda **não há nenhuma história implementada**: o que corre é o site público (landing, preços, páginas legais-modelo, consentimento, lista de espera = pedido de demonstração) e `GET /api/health`.
- **Modo de teste:** a app corre inteira sem contas externas (a lista de espera usa o adaptador `console`; análise e pagamentos desligados). Os adaptadores `memory`/`mock`/`console` do produto (dados, autenticação, armazenamento, email, pagamentos) nascem no slice S-01.
- **Precisa do fundador:** nada bloqueia o esqueleto. Para o lançamento: HT-01 (domínio) e as tarefas E a K da arquitetura (secção 10), mais os dados de identidade legal (a `legal` cria a tarefa).
- **Verificação mais recente (2026-11-28, a partir de `npm ci`):** lint ✅ typecheck ✅ unit 224 ✅ e2e 89 ✅ build ✅ · `npm audit --omit=dev` 0 vulnerabilidades.
- **Desvio mais importante:** a *starter* da fábrica fixa `next@16.4.0` e `zod@4.6.5`, ambos com avisos de segurança publicados (um crítico) e o `next build` **falha** com `SecurityFatalError` nessa versão; atualizei para `next@16.4.6` e `zod@4.6.7` (secção 8, desvio 1).

## 2. Como correr

Pré-requisitos: Node ≥ 22.13 (exigência do `pdfjs-dist` 6, usado a partir do S-02), npm. Não é preciso nenhuma conta para o modo de teste.

```bash
cd products/civil-pt/app
npm ci
cp .env.example .env.local        # todas as variáveis são opcionais no modo de teste
npm run dev                       # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run check` | lint (Biome) + typecheck (`tsc`) + testes unitários (Vitest) + build de produção |
| `CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e` | e2e (Playwright + axe) sobre o build de produção na porta 3100; `CHROMIUM_PATH` só é preciso em sandboxes sem o Chromium esperado (na CI deixa-se por definir) |
| `npm run test:smoke` | testes só de leitura contra um *deploy* (`BASE_URL=…`) |
| `npm run brand:apply -- ../brand/tokens.json` | regenera `src/app/tokens.css` a partir dos tokens da marca (o teste `apply-brand` falha se o ficheiro ficar desatualizado) |
| `npm run seed` | **planeado (S-01):** dados de demonstração (5 utilizadores, 3 projetos, folhas sintéticas) |

**Aviso:** o e2e usa a porta 3100 com `reuseExistingServer`. Se houver um `next start` manual a correr nessa porta, o Playwright reutiliza-o (com outro *build* e outro ambiente) e falham testes de indexação e cabeçalhos sem razão aparente: parar o servidor antes (`pkill -f next-server`).

Contas de demonstração: ainda não existem (S-01/S-03). Rotas atuais: `/`, `/en`, `/pt`, `/{en,pt}/pricing`, `/{en,pt}/legal/{privacy,terms,cookies,legal-notice}`, `/api/health`, `/api/waitlist`, `/sitemap.xml`, `/robots.txt`. As rotas do produto seguem os URLs do PRD (secção 8, pressuposto 5).

## 3. Variáveis de ambiente

Nomes apenas, espelhados de `.env.example`. **Hoje** o código lê só as da *starter*; as marcadas «S-01» são as da arquitetura §9, que o `src/lib/env.ts` (zod, falha no arranque) passa a ler no slice S-01 e que entram em `.env.example` nesse commit.

| Nome | Público / segredo | Obrigatória | Valor em modo de teste | Onde obter (produção) | Usada em |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | público | produção | `http://localhost:3000` (omissão) | domínio final (HT-01) | SEO, *links*, retorno do Stripe |
| `NEXT_PUBLIC_INDEXABLE` | público | não | vazio (pré-visualizações não indexam) | `true` só no go-live (`launch`) | `robots`, `noindex` |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` / `_COOKIELESS` / `NEXT_PUBLIC_PLAUSIBLE_*` / `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | público | não | `none` | PostHog UE (tarefa H, ADR 0007) | analítica após consentimento |
| `WAITLIST_ADAPTER` | não | produção | `console` | `resend` | pedido de demonstração |
| `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `RESEND_FROM` | segredo (a chave) | não (sem ela: `console`) | — | Resend (tarefa G) | pedido de demonstração, email |
| `WAITLIST_WEBHOOK_URL` | segredo | não | — | alternativa ao Resend | pedido de demonstração |
| `WITHDRAWAL_WEBHOOK_URL` | segredo | **não se aplica** (B2B, função desligada) | — | — | — |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | segredo | não | — | Stripe (tarefas B e A) | checkout e webhook (S-07) |
| `DATA_ADAPTER`, `AUTH_ADAPTER`, `STORAGE_ADAPTER` | não | sim | `memory` / `mock` / `memory` | `supabase` | S-01 |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | público (RLS protege) | com `supabase` | — | Supabase (tarefa E) | S-01 |
| `SUPABASE_SERVICE_ROLE_KEY` | **segredo, só servidor** | com `supabase` | — | Supabase (tarefa E; confirmar o nome atual da chave no painel) | S-01 |
| `EMAIL_ADAPTER`, `EMAIL_FROM` | não | sim | `console` | `resend` | S-01, S-03 |
| `PAYMENTS_ADAPTER`, `PAYMENTS_LIVE` | não | sim | `mock`, `false` | `stripe`, `true` só após B e A | S-07 |
| `STRIPE_PRICE_PASS_20/60/150`, `STRIPE_PRICE_SUB_INDEPENDENTE/EMPRESA/EMPRESA_FUNDADOR/GABINETE` | não | com Stripe | — | Stripe (tarefa A) | S-07 |
| `TAX_MODE`, `SHOW_VAT_SUFFIX` | não | sim | `exempt`, `false` | decididos na tarefa B | S-07 |
| `PROCESSING_MODE` | não | sim | `inline` | `after` | S-04 |
| `CRON_SECRET`, `HASH_SALT` | **segredo** | sim | gerados | gerados (Vercel) | S-01, S-04 |
| `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | DSN não crítico; token segredo | não | — | Sentry (tarefa H) | S-08 |
| `MAX_PDF_MB=50`, `MAX_PDF_PAGES=40`, `PROCESSING_MAX_ELEMENTS=500000`, `LOW_DIVERSITY_SHARE=0.9`, `TRIAL_SHEETS=5`, `TRIAL_DAYS=14`, `LOT_VALIDITY_DAYS=90`, `GRACE_DAYS=7`, `FOUNDER_PRICE_SLOTS=10`, `UPLOADS_PER_HOUR=30` | não | não | omissões | ajustáveis | S-01 em diante |
| `TURNSTILE_ENABLED`, `AI_ENABLED=false`, `AI_PROVIDER=mock`, `ANTHROPIC_API_KEY`, `AI_MODEL_*`, `AI_DAILY_BUDGET_EUR` | chave: segredo | não | desligadas | só com US-07 (dormente, ADR 0008) | — |

Só testes (não lidas pela app): `CHROMIUM_PATH`, `BASE_URL`, `PG_TEST_URL` (S-01, opcional: Postgres 16 descartável).

## 4. Feature flags e modo de teste

| Flag / adaptador | Variável ou config | Por omissão | O que muda quando ativo | Desbloqueia | Impossível em produção sem… |
|---|---|---|---|---|---|
| Pedido de demonstração (lista de espera) | `features.waitlist` + `WAITLIST_ADAPTER` | ligado, `console` | `resend` envia e regista o consentimento | tarefa G | adaptador configurado (sem ele a API responde 503) |
| Livre resolução (consumidores) | `legal.sellsToConsumers` | **`false` (B2B)** | publicaria a página e o formulário | — (decisão do produto) | n/a |
| Pagamentos reais *(S-07)* | `PAYMENTS_LIVE` | `false` | checkout Stripe real | tarefas B e A | chaves `sk_live` presentes |
| Adaptador de pagamentos *(S-07)* | `PAYMENTS_ADAPTER=mock\|stripe` | `mock` | compra simulada pelo mesmo *handler*, com eventos assinados de teste | — | **proibido** com `NODE_ENV=production` (teste automático) |
| Autenticação simulada *(S-01/S-03)* | `AUTH_ADAPTER=mock` | só dev/teste | utilizadores fictícios | — | **proibido** com `NODE_ENV=production` (T-10, SR-08) |
| Dados e armazenamento em memória *(S-01)* | `DATA_ADAPTER=memory`, `STORAGE_ADAPTER=memory` | só dev/teste | sem Supabase | tarefa E | **proibido** em produção |
| Email *(S-01)* | `EMAIL_ADAPTER=console\|resend` | `console` | envia por Resend | tarefa G | `RESEND_API_KEY` |
| Processamento *(S-04)* | `PROCESSING_MODE=inline\|after` | `inline` | `after()` + fila em Postgres | Vercel Pro | — |
| Preço de fundador, IVA *(S-07)* | `FOUNDER_PRICE_SLOTS`, `TAX_MODE`, `SHOW_VAT_SUFFIX` | 10, `exempt`, `false` | preço de €79 nas 10 primeiras «Empresa»; IVA | tarefa B | decisão fiscal registada |
| Anti-abuso *(S-01)* | `TURNSTILE_ENABLED` | `false` | CAPTCHA nas contas de avaliação | — | — |
| IA *(dormente)* | `AI_ENABLED` | `false` | US-07 | tarefa C + DPA | só com gatilho do PRD §5.4 |
| Indexação | `NEXT_PUBLIC_INDEXABLE` | `false` fora da Vercel produção | motores de pesquisa indexam | go-live | `launch` |

## 5. Estado das histórias vs PRD

Regras do plano: **ordem do playbook** (esqueleto → valor central → contas → pagamentos em modo de teste → restantes *musts* → conta/privacidade → *shoulds*); **ordem imposta pelo ADR 0006** (G-GEO inconclusivo): o núcleo do motor (S-02) fica verde antes da interface de revisão (S-05). Cada slice é vertical (SQL, lógica, API, interface, testes) e divide-se em incrementos *a/b/c* de ≤ 2 h, cada um com os seus testes e um *commit* só com os *checks* verdes: `<slug>: build — S-0x<letra> <título>`. Sem agentes em paralelo (um só escritor), por isso a posse de diretórios da arquitetura §16.1 serve de guia, não de restrição. Um slice só passa a `feito` com ≥ 1 teste automático com o id da história no nome (`it('US-04: …')`, um ficheiro e2e por história: `tests/e2e/us-0X-*.spec.ts`).

### 5.1 Plano de slices (ordem de construção)

| Slice | Título | Histórias (critérios) | Tam. PRD | Ficheiros / diretórios | Depende de | *Flag* / adaptador | Estado |
|---|---|---|---|---|---|---|---|
| **S-00** | Esqueleto: *starter* + configuração + marca + conteúdo base | — | — | `app/**` (tudo) | — | — | **feito** (2026-11-28) |
| **S-01** | Fundação: ambiente, adaptadores, esquema SQL com RLS e livro-razão, *seed*, saúde, CSP | base de US-08 (3, 4, 7 em SQL), SR-01, SR-02, SR-06, SR-08, SR-13 | (incluída nas histórias) | `src/lib/{env.ts,core,data,db,storage,email}/**`, `supabase/{migrations,seed.sql,tests}/**`, `tests/{rls,contract}/**`, `src/app/api/health/**`, `next.config.ts`, `vercel.json`, `package.json`, `.env.example` | S-00 | `DATA_ADAPTER`, `STORAGE_ADAPTER`, `EMAIL_ADAPTER`, `PAYMENTS_ADAPTER`, `PROCESSING_MODE` | por fazer |
| **S-02** | Motor puro de medição (sem E/S): extração `pdfjs-dist`, escala, curvas, raster, estilos, estratégia de agrupamento, pacote de geometria v1 | US-04 (1, 2, 3, 6) nível motor | parte de L 8 | `src/lib/engine/**`, `tests/engine/**`, `fixtures/**`, `scripts/gen-fixtures*` | S-01 (só dependências) | — | por fazer |
| **S-03** | Conta, projetos, carregamento direto e escala | **US-01** (1–7), **US-02** (1–6), **US-03** (1–3) | S 1 + M 3 + S 1 | `src/lib/{auth,documents,scale}/**`, `src/app/[locale]/(auth)/**`, `src/app/[locale]/app/**` (casca e `projetos`), `src/app/api/{auth,projects,documents}/**`, `src/components/app-shell/**`, `src/proxy.ts`, `src/emails/**`, `src/content/app/{auth,projects}.*`, `tests/e2e/us-0{1,2,3}-*.spec.ts` | S-01 | `AUTH_ADAPTER=mock`, `STORAGE_ADAPTER=memory`, `EMAIL_ADAPTER=console` | por fazer |
| **S-04** | Processamento assíncrono e livro-razão de folhas | **US-04** (4, 5) + **US-08** (5, 6, 7: saldo, mensagens de quota, reprocessar sem custo) | resto de US-04 + parte de US-08 | `src/lib/processing/**`, `src/app/api/{sheets,internal,cron}/**`, estado da folha em `projetos/**`, `tests/processing/**`, `tests/e2e/us-04-*.spec.ts` | S-01, S-02, S-03 | `PROCESSING_MODE=inline\|after` | por fazer |
| **S-05** | Revisão sobre a folha e pergunta de confiança | **US-05** (1–7) | L 8 | `src/lib/viewer/**`, `src/components/review/**`, `src/app/[locale]/app/folhas/**`, `src/app/api/sheets/[id]/{trust,return-credit}/**`, `src/content/app/review.*`, `tests/e2e/us-05-*.spec.ts` | S-02, S-04 (e *regresso ao gate* do ADR 0006) | — | por fazer |
| **S-06** | Mapa de quantidades e exportação Excel com folha «Rasto» | **US-06** (1–5) | M 3 | `src/lib/map/**`, `src/components/map/**`, `src/app/[locale]/app/mapa/**`, `src/app/api/projects/[id]/export/**`, `src/content/app/map.*`, `tests/e2e/us-06-*.spec.ts` | S-04 (S-05 para o fluxo e2e completo) | — | por fazer |
| **S-07** | Preços, Passe Concurso, subscrição e faturação em modo de teste | **US-12** (1–6) + **US-08** (1–4, 8–13) | M 3 + M 3 | `src/lib/billing/**`, `src/app/api/{checkout,billing,webhooks}/**`, `src/app/[locale]/pricing/**` (+ alias `/precos`), `src/app/[locale]/app/conta/**`, `src/content/app/billing.*`, `tests/e2e/us-08-*.spec.ts`, `us-12-*.spec.ts` | S-01, S-03 | `PAYMENTS_ADAPTER=mock\|stripe`, `PAYMENTS_LIVE=false`, `TAX_MODE`, `SHOW_VAT_SUFFIX`, `FOUNDER_PRICE_SLOTS` | por fazer |
| **S-08** | Operação, *shoulds*-chave e fecho do build | **US-11**, **US-15** (Should; só se o Must couber em 30) + NFR de operação | S 1 + S 1 | `src/lib/ops/**`, `src/instrumentation*.ts`, `scripts/{erase-user,reconcile-stripe}.ts`, `docs/runbooks/**`, `src/app/[locale]/app/{exemplo,conta}/**`, `src/app/api/account/**` | S-01 a S-07 | `SENTRY_DSN` (*no-op* sem ele) | por fazer |
| **Integração** | Páginas legais e copy da landing (passo 9 do playbook; não conta como slice) | — | — | `src/content/legal/**`, `src/content/{en,pt}.ts`, `src/config/site.ts` | fases `legal` e `gtm` concluídas | — | pendente (`legal/public/` tem rascunhos da `legal`, ainda em curso; `marketing/copy/` não existe) |

**Detalhe dos incrementos** (cada um ≤ 2 h, com *commit* próprio):

- **S-01:** (a) dependências exatas (`@supabase/supabase-js` 2.119.2, `@supabase/ssr` 0.12.7, `pdfjs-dist` **6.5.438**, `write-excel-file` 4.1.1, `server-only` 0.0.1; dev: `@electric-sql/pglite` 0.6.1), `env.ts` em zod com trava de produção, `problem+json`, *logger* sem PII, `rl_hit`; (b) interfaces e adaptadores `memory`/`mock`/`console` (dados, autenticação, armazenamento, email); (c) migração `init` (tabelas, RLS ligado em todas, *grants* por coluna, funções `SECURITY DEFINER` do livro-razão, política dos *buckets*), `seed.sql` + fixtures de memória + `npm run seed`; (d) testes de RLS e de contrato (memória vs SQL), `/api/health` com *ping* à BD, CSP (`worker-src 'self' blob:`, `connect-src` restrito), `vercel.json` `fra1`, `.env.example` completo.
- **S-02:** (a) extração e matriz de transformação (S2), amostragem de curvas, escala pt→m, deteção de raster; (b) estilos e `GroupingStrategy` (`style` por omissão, `selection` pronta), subcaminhos com furos pela regra par-ímpar (spike S6), pacote de geometria v1; (c) gerador de *fixtures* sintéticas e teste de contrato do `pdfjs-dist`; (d) **regresso ao gate G-GEO** (ADR 0006): repetir C1–C5 com qualquer folha real que entretanto exista (tarefa K); se passarem 4 h de agente e continuar inconclusivo, regista-se no ADR e segue-se por A.
- **S-03:** (a) autenticação: código de 6 dígitos + página «Confirmar entrada» com consumo só por POST, bloqueio e rotação do código (spike S7), *proxy* e redirecionamentos só relativos; (b) projetos, URL assinado de upload (spike S8), `finalize`, miniaturas, apagar projeto com remoção dos ficheiros, RLS A↛B; (c) escala: deteção a partir do texto e definição manual.
- **S-04:** (a) fila em Postgres (`claim_next_sheet`), executor `inline`/`after`, rota interna com `CRON_SECRET` (spike S10); (b) `reserve/commit/release` ligados ao processamento (falha, raster, estilo dominante, reprocessar sem custo), 402 `no_balance` e mensagens exatas de quota; (c) estado da folha com sondagem de 3 s e *cron* de manutenção (`processing` > 5 min → `failed` e liberta a reserva).
- **S-05:** (a) **primeira hora: spike S9** (`pdfjs-dist` 6 no navegador com Next 16/Turbopack, *worker*, CSP); *viewer* com *zoom* e deslocamento; (b) realce por lotes em `Path2D`, tabela e teclado com a mesma paridade; (c) pergunta de confiança e `activation_reached`, devolução de folha, ensaio de desempenho (50 000 elementos).
- **S-06:** (a) árvore de capítulos e artigos, atribuição de grupos e espessura; (b) exportação `.xlsx` (2 folhas, células de texto sem fórmulas), `map_exports`.
- **S-07:** (a) tabela de preços e `/precos`, `POST /api/checkout` (Passe e subscrição) com adaptador `mock`; (b) *handlers* de webhook idempotentes (lotes, graça de 7 dias, reembolso, disputa) com eventos assinados de teste; (c) portal, página `conta` (saldo e lotes), preço de fundador, F1/F2.
- **S-08:** (a) projeto de exemplo (US-11) e exportar/apagar conta (US-15); (b) Sentry (*no-op* sem DSN), alertas internos, *scripts* e *runbooks*; (c) passagem final: axe em todas as rotas, capturas a 360 e 1440 px, `npm audit`, `docs/05-build.md` completo.

### 5.2 Estado por história do PRD

| Slice | História | Título | Prioridade | Estado | Testes (ficheiros) | Notas / desvios |
|---|---|---|---|---|---|---|
| S-03 | US-01 | Entrar com o email (código ou ligação com confirmação) | must | por fazer | `tests/e2e/us-01-*.spec.ts`, `tests/unit/auth-*.test.ts` | spike S7 antes de construir |
| S-03 | US-02 | Projeto, carregamento direto ao armazenamento, apagar | must | por fazer | `tests/e2e/us-02-*.spec.ts`, `tests/rls/**` | spike S8; nenhum pedido à app com o corpo do PDF |
| S-03 | US-03 | Escala da folha | must | por fazer | `tests/unit/scale.test.ts`, `tests/e2e/us-03-*.spec.ts` | |
| S-02, S-04 | US-04 | Motor vetorial (grupos por estilo) | must | por fazer | `tests/engine/**`, `tests/processing/**`, `tests/e2e/us-04-*.spec.ts` | caminho A com risco aceite (ADR 0006); L 8 |
| S-05 | US-05 | Rever sobre a folha e pergunta de confiança | must | por fazer | `tests/e2e/us-05-*.spec.ts`, `tests/unit/viewer-*.test.ts` | L 8; spike S9 na 1.ª hora |
| S-06 | US-06 | Mapa de quantidades e Excel | must | por fazer | `tests/unit/map-*.test.ts`, `tests/e2e/us-06-*.spec.ts` | |
| S-01, S-04, S-07 | US-08 | Avaliação, lotes, quota e subscrição | must | por fazer | `tests/rls/**`, `tests/contract/**`, `tests/e2e/us-08-*.spec.ts` | critérios 3, 4 e 7 testados em SQL já em S-01 |
| S-07 | US-12 | Passe Concurso | must | por fazer | `tests/e2e/us-12-*.spec.ts` | |
| S-08 | US-11 | Projeto de exemplo | should 1.º | por fazer (opcional) | `tests/e2e/us-11-*.spec.ts` | cai para depois do lançamento se o Must passar de 30 |
| S-08 | US-15 | Exportar os meus dados e apagar a conta | should 4.º | por fazer (opcional) | `tests/e2e/us-15-*.spec.ts` | idem; sem isto vale o *runbook* `scripts/erase-user.ts` |

**Won't / adiados por decisão do PRD (não construir):** US-17, US-18 (Should 2.º e 3.º, gatilho M8/M7), US-09 e US-10 (gatilho nas demonstrações), US-16, US-14 (Should 4.º), US-07 (IA, Should 5.º, camada dormente), US-13, e US-20 (só no caminho B). Won't da secção 5.5 do PRD: várias pessoas por conta, DWG/DXF/IFC, PDF rasterizado, BC3, volumes por perfis, escalas mistas, chat livre, bases de preços, PDF anotado, app móvel/API/SSO.

**Orçamento:** Must = 30 unidades (D-ORC, margem 0). Corte pré-acordado se o S-07 passar do orçamento: tirar a subscrição mensal (Stripe Billing, graça, portal) do lançamento e vender só o Passe (PRD §5.1, Corte 1); nunca se corta o caminho de pagamento, o passo de ativação (US-05), os eventos do funil nem a acessibilidade básica. Calibração real (estimado vs. gasto por slice) vai para `docs/lessons.md` no fim de cada slice.

### 5.3 Critérios de aceitação convertidos em nomes de teste (por slice)

Convenção: nomes em inglês, prefixados pelo id da história e pelo critério (`it('US-04.3: …')`). Dados de teste: PDF **sintéticos gerados por *script*** (`fixtures/`, nunca PDF reais de concursos); relógio simulado nas validades; adaptadores `mock`/`memory`.

**S-01 (SQL, ambiente e segurança)**
- `env: fails at boot when a required variable is missing or malformed` · `env: refuses mock/memory/console adapters when NODE_ENV=production (T-10, SR-08)` · `env: payments live requires live keys`
- `SR-01: every public table has RLS enabled and no policy uses (true) or targets anon` · `SR-01: user A cannot select/insert/update/delete user B rows in <table>` (um por tabela e por *bucket*) · `SR-01: anon sees nothing`
- `US-08.7: reserving a sheet already reserved is idempotent and charges once` · `US-08.4: lot unused sheets expire on day 91 with an injected clock; earlier lots are consumed first (ties: oldest)` · `SR-02: reserve never exceeds balance under concurrent requests` · `property: reserve >= settle and balance is never negative` · `US-05.7: a lot allows at most 3 returned sheets`
- `US-08.6: the trial grants 5 sheets for 14 days, once per normalized email (no +tag, Gmail dots)` · `US-08.2: founder price is atomic and capped at 10` · `rl_hit: counts per window and resets`
- `contract: memory adapter and SQL give the same ledger results` · `problem+json: 400/401/403/404/500 shapes` · `logger: never emits email, project or file names (SR-09)` · `health: 200 with a DB ping, 503 when the data adapter fails, no secrets in the body`

**S-02 (motor)**
- `US-04.1: vector-a2 gives area 102.30 m² (±0.1%), length 40.00 m (±0.1%), circle perimeter 9.42 m (±0.5%)` · `US-04.1: rotated and scaled CTM gives the same area (spike S2)` · `US-04.2: an image-only PDF is reported as unsupported raster with 0 elements` · `US-04.3: 50,000 elements in 6 styles give at most 6 groups per kind; p95 <= 90 s over 20 runs` · `US-04.6: 95% of elements in one style reports low diversity with dominant_share 0.95`
- `engine: even-odd subpaths with holes subtract the hole area (spike S6)` · `engine: Bézier and arcs are sampled within tolerance` · `engine: GroupingStrategy "style" and "selection" fill the same element→group map` · `engine: geometry package v1 round-trips` · `contract: pdfjs-dist 6.5.438 gives exact totals for a fixed PDF` · `SR-05: isEvalSupported is false and the element cap is enforced`

**S-03 (conta, projetos, escala)**
- `US-01.1: requesting a code sends one email with a 6-digit code valid 10 min and a link; opening the link shows "Confirmar entrada" and only the button creates the session` · `US-01.2: entering the code signs in without opening the link` · `US-01.3: a GET to the link by an email scanner does not consume the token` · `US-01.4: an incomplete email is rejected and nothing is sent` · `US-01.5: a used or expired code shows the exact message` · `US-01.6: five wrong codes lock for 15 min and rotate the active code` · `US-01.7: /pt/app/projetos without a session redirects (302) to /pt/entrar` · `T-14: next= only accepts relative paths`
- `US-02.1: no request to the app carries more than 100 KB; the PDF goes to a signed URL; anonymous access to the object is 403/404; signed URLs expire within 10 min` · `US-02.2: a 48 MB, 38-page PDF uploads without 413 and shows 38 sheets` · `US-02.3: .dwg, >50 MB and >40 pages are rejected with the exact message, nothing stays stored and upload_rejected records reason and extension` · `US-02.4: an interrupted upload leaves no partial sheets and the object is removed within 10 min` · `US-02.5: deleting a project removes rows and files within 60 s and the URL returns 404` · `US-02.6: user B gets 404 and zero rows for user A's project`
- `US-03.1: "ESC. 1/100" is detected as 1:100 and 100 pt equal 3.528 m` · `US-03.2: no scale text disables "Processar" until a scale is chosen (1:1 to 1:10000)` · `US-03.3: a manual scale overrides, marks quantities "a recalcular" and records source=manual` · e2e a11y: axe sem violações graves em `/entrar`, `/auth/confirm` e `/app/projetos`, teclado completo nos formulários.

**S-04 (processamento)**
- `US-04.4: an internal failure shows the exact message, records the cause and leaves the balance unchanged` · `US-04.5: status goes queued, processing, ready without reloading (≤ 3 s) and persists after closing the tab` · `US-08.7: reprocessing a processed sheet charges nothing` · `US-08.5: zero balance shows the exact message with a link to pricing, the sheet is not processed and quota_reached records kind` · `US-08.6: the 6th sheet of a trial shows the trial message; trial sheets expire on day 15` · `US-04.2/US-04.6: raster and low-diversity sheets release the reservation` · `T-16: internal routes answer 401 without CRON_SECRET` · `T-06: three parallel process requests with one sheet of balance charge once` · `maintenance: a sheet stuck in processing > 5 min fails and releases its reservation`

**S-05 (revisão)**
- `US-05.1: selecting group 3 highlights its elements, centres the view in ≤ 300 ms and shows "1 de 12 confirmados"` · `US-05.2: a rejected group is excluded from totals; Ctrl+Z restores it; geometry is never deleted` · `US-05.3: on a real sheet the trust question appears after the 3rd confirmation; activation_reached fires once per account and only for "Sim" or "Quase"` · `US-05.4: on the sample project trust_check_answered records sample=true and activation does not fire` · `US-05.5: every action works with the keyboard only and axe finds 0 WCAG 2.2 AA violations` · `US-05.6: highlight p95 ≤ 300 ms with 50,000 elements over 20 repetitions` · `US-05.7: "Esta folha não funcionou" returns one sheet to the lot (max 3) and marks the sheet "sem grupos válidos"` · `T-12: PDF text is rendered as text, never as HTML`

**S-06 (mapa e Excel)**
- `US-06.1: two groups of 100.00 and 60.00 m² under one article give 160.00 m²; thickness 0.05 m and unit m³ give 8.00 m³` · `US-06.2: export returns an .xlsx in ≤ 10 s with sheets "Mapa de Quantidades" and "Rasto" and values equal to the screen at 2 decimals` · `US-06.3: export is disabled with the exact message when nothing is assigned` · `US-06.4: reassigning a group moves it and never counts it twice` · `US-06.5: export is disabled and the missing articles are highlighted when two lack a title` · `T-11: cells starting with = + - @ are written as text` (carga `=cmd|…`)

**S-07 (pagamentos em modo de teste)**
- `US-12.1: Passe 60 purchase creates a 60-sheet lot valid 90 days and purchase_completed has kind=pass, pass_size=60, amount_eur=129` · `US-12.2/US-08.3: a duplicate Stripe event.id creates one lot and one event` · `US-12.3: anonymous checkout goes to /entrar and returns to the chosen pass` · `US-12.4: a refund revokes unused sheets and keeps used ones` · `US-12.5: lots are consumed earliest-expiry first` · `US-12.6: the 8 unused sheets expire on day 91`
- `US-08.1: "Empresa" with the founder price gives amount_eur 79.00 and founder_price=true` · `US-08.2: the 11th subscriber pays 99.00` · `US-08.4: month-2 renewal adds a 50-sheet lot and month-1 leftovers expire on day 91` · `US-08.8/9/10: past_due with 7 days of grace, recovery without a duplicate lot, cancellation after grace` · `US-08.11: charge.refunded revokes only unused sheets; balance never negative` · `US-08.12: a dispute freezes the balance and shows the exact message until closed` · `US-08.13: cancelling in the portal keeps access until the end of the paid period` · `SR-03: webhook rejects a bad signature and a timestamp outside 300 s` · e2e: compra em modo de teste ponta a ponta (G2) com `PAYMENTS_ADAPTER=mock` e o mesmo *handler*.

**S-08 (operação e shoulds)**
- `US-11.1/2: the sample project opens in ≤ 3 s without quota; deleting it removes only my copy` · `US-15.1/2: export returns JSON in ≤ 60 s; deleting the account cancels the subscription and removes data and files` · `SR-09: the event dictionary carries no PII` · `ops: Sentry beforeSend strips email and names` · axe em todas as rotas, 360 px sem *scroll* horizontal.

## 6. Testes e verificações (última execução)

| Verificação | Comando | Resultado | Data |
|---|---|---|---|
| Lint | `npm run lint` | ✅ (Biome, 106 ficheiros) | 2026-11-28 |
| Typecheck | `npm run typecheck` | ✅ (`tsc` 7.0.2) | 2026-11-28 |
| Unitários | `npm test` | ✅ 224 testes (16 ficheiros) | 2026-11-28 |
| Build de produção | `npm run build` | ✅ (`next build`; JS da landing `/pt` = 9 ficheiros, ≈ 184 KB gzip no total, **linha de base** para o limite de +20 KB) | 2026-11-28 |
| e2e | `npm run test:e2e` | ✅ 89 testes, 0 *flaky* (inclui axe claro/escuro, CSP, consentimento, SEO, idiomas) | 2026-11-28 |
| Axe nas rotas | dentro do e2e | ✅ 0 graves/críticas (home, preços, legal, 404, formulário com erros; claro e escuro) | 2026-11-28 |
| Auditoria de dependências | `npm audit --omit=dev` | ✅ 0 vulnerabilidades | 2026-11-28 |
| Arranque de produção | `next start` + `curl` | ✅ `/` 307, `/en`, `/pt`, `/api/health`, `/sitemap.xml`, `/robots.txt`, páginas legais: 200 | 2026-11-28 |
| Capturas | Playwright 360 e 1440 px, `pt` e `en` | revistas à mão: sem *overflow* | 2026-11-28 |

Versões (`npm ls --depth=0`): Node 22.23.5, Next 16.4.6, React 19.3.1, TypeScript 7.0.2, Vitest 5.1.2, Playwright 1.65.1, axe-core/playwright 4.14.1, Biome 2.5.15, Tailwind 4.3.3, zod 4.6.7, Stripe SDK 23.2.0, Resend 6.41.0. Os testes de *starter* passaram de 221 para 224 unitários e de 95 para 89 e2e: o e2e desceu sobretudo porque o formulário e o documento de livre resolução não existem num produto B2B (a função continua coberta pelos testes unitários, que forçam a *flag*). Cobertura (informativa): não medida no esqueleto.

## 7. Integração das páginas legais e do copy da landing

**Estado:** **pendente**. Em 2026-11-28 (fim do esqueleto) `legal/public/` já tem 8 rascunhos (privacy, terms, cookies e legal-notice em `pt` e `en`, sem `withdrawal`: B2B) mas a fase `legal` ainda está em curso, e `marketing/copy/` não existe (a `gtm` ainda não correu). Verificado por *grep*: todas as chaves `{{…}}` desses rascunhos existem em `PLACEHOLDER_KEYS`, por isso o *build* não rebentará com `UnreplacedPlaceholderError`. O passo 9 do playbook corre quando as duas fases terminarem e é idempotente. A landing já tem texto **provisório verdadeiro** (secção abaixo); a `gtm` substitui-o.

| Documento | en | pt | Rota | Ligado no rodapé | Notas |
|---|---|---|---|---|---|
| privacy | modelo da *starter* | modelo da *starter* | `/{locale}/legal/privacy` | ✅ | a substituir por `legal/public/privacy.<locale>.md` |
| terms | modelo | modelo | `/{locale}/legal/terms` | ✅ | idem |
| cookies | modelo | modelo | `/{locale}/legal/cookies` | ✅ | a tabela tem de coincidir com os *trackers* reais (inventário da arquitetura §14) |
| legal-notice | modelo | modelo | `/{locale}/legal/legal-notice` | ✅ | idem |
| withdrawal | — | — | não publicado | não | B2B: `legal.sellsToConsumers = false`; a `legal` omite o documento |
| extras (`ai-notice`, `refund`, `acceptable-use`) | — | — | — | — | só se a `legal` os criar (exige `LEGAL_DOCS`, rota, *sitemap*, rodapé e testes) |

- **Placeholders por preencher (valores que só o fundador conhece):** `company.legalName`, `company.taxId`, `company.vatId`, `company.registration`, `company.address` = `[A PREENCHER PELO FUNDADOR]` (constante `PENDING_FOUNDER` em `src/config/site.ts`; aparece hoje no rodapé). A `06-qa` e o `launch` falham a versão enquanto existir. A tarefa de fundador correspondente é da `legal` (identidade legal e fiscal; depende da tarefa B). `grep` de sobras da *starter* (`(placeholder)`, `acme.example`, `Acme`) em `src`: **limpo**.
- **Copy da landing (provisória, escrita a partir do PRD §1, §2, §7 e de `03-brand.md`):** hero, problema, funcionalidades, como funciona, preços (teaser), FAQ (7 perguntas, com os limites do produto), CTA final, *meta* e legenda da imagem OG, em `en` e `pt`, com paridade de chaves garantida por teste. Respeita as regras de alegações do PRD §7: **sem percentagens de precisão, sem IA, sem o art. 50.º do CCP, sem «dados só na UE»** («ficheiros guardados na UE; nesta versão as peças não são enviadas a nenhum fornecedor de IA»). Os CTA dizem «Pedir demonstração» (evento `demo_requested`).
- **Testes que dependem do texto-modelo legal e vão mudar na integração:** `tests/e2e/legal.spec.ts` (afirma o aviso «Template — replaced by the factory legal phase») e `tests/unit/placeholders.test.ts` («marked as a template»). A integração tem de os atualizar (passo 9a.5: cada documento em cada idioma, sem `{{`, um `<h1>`, sem `lorem|TODO|FIXME`).
- **Tabela de cookies da política = *trackers* no código = inventário da arquitetura:** por verificar na integração (hoje: sessão do Supabase, `consent`, PostHog após consentimento, `__stripe_*`).

## 8. Desvios e pressupostos

| # | Tipo | O que aconteceu e porquê | ADR | Impacto |
|---|---|---|---|---|
| 1 | Desvio à *starter* (segurança) | A *starter* fixa `next@16.4.0` e `zod@4.6.5`. `npm audit` indica 10 avisos no Next (um crítico: execução remota de código na otimização de imagens com SVG, e outros em `use cache`, *Server Actions* e cache) e 1 em `zod` (consumo de memória em coleções grandes validadas; GHSA-mrhx-c7xc-m3w5). O `next build` **recusa-se a compilar** com `SecurityFatalError`. Atualizei para `next@16.4.6` e `zod@4.6.7` (corrigem os avisos) e, para ficar alinhado com a arquitetura §3, `react`/`react-dom@19.3.1`, `stripe@23.2.0`, `resend@6.41.0`, `vitest@5.1.2`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.1`, `@types/react@19.3.3`, tudo com versão exata. **Não** atualizados de propósito: `@biomejs/biome` (2.6.9 existe: evitar ruído de formatação), `tailwindcss` 4.3.3 (4.3.5), `marked` 18.1.0 (18.3.0) e `@types/node` (fica em 22, igual ao *runtime*, lição da fábrica). Os 224 testes unitários e 89 e2e passam sem alterações de lógica. | — | A *starter* da fábrica precisa da mesma atualização (alteração «sensível»: fica como proposta para `/melhorar`; lição registada) |
| 2 | Pressuposto (caminho da app) | O argumento do orquestrador indicava `products/civil-pt/products/civil-pt/app` (prefixo duplicado). `factory.py scaffold` só aceita um nome de pasta, `product.json` tem `stack.app_dir = "app"` e a arquitetura usa `products/civil-pt/app/`. Usei **`products/civil-pt/app`**; o caminho duplicado parece ser um erro de composição do argumento `app_dir` no *workflow* (`products/<slug>/` somado duas vezes). | — | O orquestrador deve passar `app_dir = app` nas fases seguintes |
| 3 | Desvio à *starter* (produto B2B) | `legal.sellsToConsumers = false` (hand-off da arquitetura): sem página nem API de livre resolução, sem documento `withdrawal`. `tests/e2e/withdrawal.spec.ts` foi reescrito para afirmar a **ausência** (rodapé, 404, *sitemap*, API 404) e `LEGAL_DOCS` dos testes deixou de listar `withdrawal`; a função mantém cobertura unitária com a *flag* forçada. Alteração de testes legítima: a expectativa antiga codificava a configuração-modelo da *starter*. | — | Se o produto passar a vender a consumidores, voltar a `true` e repor os testes e2e |
| 4 | Pressuposto (idioma) | `defaultLocale = "pt"` (mercado português; o `x-default` do *hreflang* e o idioma sem correspondência passam a `pt`). Os testes que assumiam `en` leem agora o valor de `src/config/site.ts`. | — | Nenhum para o utilizador de `en` (negociação por `Accept-Language` igual) |
| 5 | Pressuposto (URLs) | Os critérios do PRD citam `/pt/entrar`, `/pt/app`, `/pt/app/projetos` e `/pt/precos`; a arquitetura §16.1 usa o grupo `(app)` (sem segmento) e `pricing`. **Os URLs do PRD são a fonte** (os testes citam-nos): segmento real `app` em `src/app/[locale]/app/…`, `entrar` e `precos` como *alias* (`redirects` do Next) de `/pricing`. Os segmentos são os mesmos em `en` e `pt` (área autenticada, sem SEO). | — | Decidido e testado em S-03 e S-07 |
| 6 | Pressuposto (preços) | `src/config/site.ts` traz os 6 planos de `02-business.md` §5 (Passe 20/60/150 a €59/129/249, Independente/Empresa/Gabinete a €49/99/199 por mês), **sem IVA**, sem `stripePriceId` (os botões levam ao pedido de demonstração até S-07). O «Gabinete» fica listado, como na tabela do PRD, embora fora do cenário base. A nota fiscal («preços em euros, sem IVA; o IVA aplicável, se existir, é indicado no pagamento») cobre os dois regimes F1/F2 até a tarefa B decidir. | — | `SHOW_VAT_SUFFIX` e `TAX_MODE` em S-07 |
| 7 | Pressuposto (contacto) | `contact.email/supportEmail/privacyEmail` = `ola@`, `apoio@`, `privacidade@rastoplan.com`: caixas que **ainda não existem** (dependem do domínio, HT-01, e de email com domínio próprio: rascunho L na secção 10). A `legal` pode substituí-los. | — | Sem caixa real, o email de contacto das páginas públicas não chega |
| 8 | Pressuposto (legal) | Datas legais provisórias `2026-11-28` (o `launch` define a data de entrada em vigor). Entidade RAL = CNIACC (omissão de `FOUNDER.md`; nome e sítio confirmados em https://www.cniacc.pt em 2026-11-28) e foro de Lisboa como na *starter*: a `legal` confirma ambos. | — | |
| 9 | Pressuposto (marca) | Ícone `src/app/icon.svg` = `brand/assets/favicon.svg`; `src/app/apple-icon.png` = `apple-touch-icon.png`; o logótipo do cabeçalho redesenhado com o alfinete sobre a linha de cota (`brand/logo-mark.svg`); a imagem OG continua gerada por `next/og` por idioma, com o título do *hero* e uma legenda no idioma (não o PNG estático `og-image.png`, que só tem a tagline em pt). Tipografia: pilha de sistema, sem pedidos externos. `node` mínimo 22.13. | — | |
| 10 | Pressuposto (testes SQL) | Os testes de RLS e do livro-razão correm em **PGlite** (`npm test` sem serviços, também na CI) e, em opção, contra um Postgres 16 descartável (`PG_TEST_URL`; há binários em `/usr/lib/postgresql/16`, `initdb` exige o utilizador `postgres`) para o teste de concorrência com duas ligações. A decisão final e a lista do que fica só em opção fica registada no S-01. | — | Testes opcionais reportados em `06-qa-report.md`, nunca silenciosamente ignorados |
| 11 | Pressuposto (G-GEO) | ADR 0006 (inconclusivo): o S-02 constrói o motor comum a A e B e guarda a geometria independente do agrupamento; o S-05 só arranca depois do S-02 verde e do «regresso ao gate». Sem folhas reais, segue-se por A com o risco aceite e medido (T4/T4b). | 0006 | |
| 12 | Limite do plano | O playbook pede slices de ≤ 2 h; este plano usa 8 slices (pedido do orquestrador: 2 a 8) e cada um traz incrementos *a/b/c* de ≤ 2 h, cada um com *commit* e *checks* verdes. | — | |

Novos tratamentos de dados pessoais ou subcontratantes surgidos na construção (para `legal`): **nenhum no esqueleto**. Previsto e já inventariado na arquitetura §14: Supabase, Vercel, Stripe, Resend, PostHog UE, Sentry UE (sem IA no MVP).

## 9. Limitações conhecidas e dívida técnica

| # | Limitação | Gravidade provável | Plano |
|---|---|---|---|
| 1 | O rodapé mostra `[A PREENCHER PELO FUNDADOR]` (dados da empresa) e as caixas de email de contacto não existem | P1 se chegasse a produção | `legal` e tarefas do fundador (secção 10); `06-qa`/`launch` falham a versão enquanto existir |
| 2 | Páginas legais ainda são os modelos da *starter* | P1 se chegasse a produção | Passo 9 (integração) quando `legal` terminar |
| 3 | Nenhuma história implementada: o produto ainda não mede nada | — (esperado) | S-01 a S-08 |
| 4 | `page.waitForTimeout` em testes herdados da *starter* (`consent.spec.ts`, `seo.spec.ts`) | P3 | Substituir por esperas por condição na passagem final de `06-qa` (CQ-52) |
| 5 | A *starter* da fábrica ainda fixa versões com avisos de segurança | P2 (fábrica) | Proposta para `/melhorar` (lição registada) |
| 6 | Visual da landing: a grelha de preços mostra 6 planos num bloco único (Passes e subscrições misturados) | P3 | Redesenho de `/pricing` em S-07 (Passes primeiro, subscrições depois) |
| 7 | A imagem OG gerada (por idioma, com as cores da marca e o título do *hero* no idioma) mostra a inicial «R» em vez do logótipo | P3 | Rever em `gtm`/`launch` com `brand/assets/og-image.png` |

## 10. Tarefas do fundador relacionadas

Já abertas em `HUMAN_TASKS.md`: **HT-01** domínio `rastoplan.com` (4 min), **HT-02** contas sociais, **HT-03** marca (opcional). O *checkpoint* atribui os números às restantes (rascunhos da arquitetura §16.5, mais um novo da construção; este documento **não** edita `HUMAN_TASKS.md`):

| ID | O que desbloqueia | Tempo | Estado |
|---|---|---|---|
| HT-01 | Domínio `rastoplan.com`: URL final, DNS, email, SEO e páginas legais | 4 min | aberta |
| rascunho E | Projeto Supabase UE (Frankfurt) e token: autenticação, base de dados e armazenamento reais | 5 min | por criar |
| rascunho F | Token da Vercel: pré-visualizações e produção | 3 min | por criar |
| rascunho G (🔴) | Resend: conta, domínio e DNS (SPF, DKIM, DMARC): sem isto os códigos de acesso não chegam | 5 min + DNS | por criar |
| rascunho H | PostHog UE e Sentry (opcional): `NEXT_PUBLIC_POSTHOG_KEY`, `SENTRY_DSN` | 5 min | por criar |
| rascunho I | Monitor de disponibilidade em `/api/health` | 3 min | por criar |
| rascunho J | Limites de gasto (Supabase, Vercel) e cópia lógica opcional | 5 min | por criar |
| rascunho K (opcional) | ≥ 10 PDF de peças desenhadas de ≥ 6 concursos para repetir o G-GEO (nunca vão para o repositório) | 5 min | por criar |
| **rascunho L (novo, 🟡)** | **Caixas de email reais `ola@`, `apoio@` e `privacidade@rastoplan.com`** (email com domínio próprio, por exemplo Google Workspace ou Zoho, ou reencaminhamento no registador): os endereços já estão no site e nas páginas legais. Depende do HT-01. Enquanto não existirem, o Claude mantém os endereços em `src/config/site.ts` e o site não os promete como canal único | 5 min | por criar |
| tarefa A, B, C, D (de `02-business.md` §13) | Stripe, estatuto fiscal (F1/F2), IA (dormente), despesa fixa de produção (€41/mês) | ver `02-business.md` | a numerar |
| identidade legal e fiscal (da `legal`) | Substitui `[A PREENCHER PELO FUNDADOR]` (nome legal, NIF, IVA, registo, morada) | ≤ 5 min | a criar pela `legal` |
