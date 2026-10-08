# Construção — {{name}}

<!--
Template for docs/05-build.md, owned by the builder (factory/playbooks/05-build.md). Language: pt-PT (commands, paths and identifiers stay in English). Created in Step 3 of the playbook (story table), updated after EVERY slice, finished in Step 10. It is the document QA, launch and the founder use to run and judge the product, so every claim is backed by a command or a test file. Never write secrets: variable NAMES only. Delete guidance comments and double-brace placeholders when done.
-->

> **Produto:** `{{slug}}` · **Versão:** {{0.1.0}} · **Atualizado em:** {{AAAA-MM-DD}} · **Commit:** `{{sha}}` · **Receita:** `{{web-saas}}` · **Diretório da app:** `products/{{slug}}/{{app}}` · **Depende de:** `02-product.md`, `04-architecture.md`

## 1. Resumo

<!-- 5 lines: what exists, how many must-stories are done, what runs in test mode, what still needs the founder, the most important deviation. -->

- **Histórias must concluídas:** {{n}}/{{m}} · **should concluídas:** {{n}}/{{m}} · **bloqueadas:** {{n}} (secção 5)
- **Modo de teste:** {{a app corre completa sem contas externas; pagamentos/email/IA simulados}}
- **Precisa do fundador:** {{HT-xx, HT-yy}} (secção 10)
- **Verificação mais recente:** lint ✅ typecheck ✅ unit {{n}} ✅ e2e {{n}} ✅ build ✅ ({{AAAA-MM-DD}})

## 2. Como correr

Pré-requisitos: Node ≥ 22, npm. Não é preciso nenhuma conta para o modo de teste.

```bash
cd products/{{slug}}/{{app}}
npm install
cp .env.example .env.local        # valores de teste já preenchidos
npm run dev                       # http://localhost:3000
npm run seed                      # {{se existir: dados de demonstração}}
```

| Comando | O que faz |
|---|---|
| `npm run check` | lint + typecheck + testes unitários + build de produção |
| `CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e` | e2e (Playwright) sobre o build de produção na porta 3100; `CHROMIUM_PATH` só é preciso em sandboxes sem o Chromium esperado |
| `npm run brand:apply -- ../brand/tokens.json` | aplica os tokens da marca |
| {{outros comandos da receita}} | {{}} |

Contas de demonstração (modo de teste): {{utilizador demo / admin demo — credenciais fictícias, só em desenvolvimento}} · Rotas principais: {{/, /en, /pt, /pricing, /legal/privacy, …}}

## 3. Variáveis de ambiente

<!-- Names only, mirrored from .env.example. Every variable the code reads is listed. -->

| Nome | Público / segredo | Obrigatória | Valor em modo de teste | Onde obter (produção) | Usada em |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | público | sim | `http://localhost:3000` | URL de produção | SEO, links |
| {{`RESEND_API_KEY`}} | segredo | não (sem ela: adaptador `console`) | — | {{Resend → API Keys; HT-xx}} | {{}} |

## 4. Feature flags e modo de teste

| Flag / adaptador | Variável ou config | Por omissão | O que muda quando ativo | Desbloqueia | Impossível em produção sem… |
|---|---|---|---|---|---|
| Pagamentos reais | `{{payments.live}}` | desligado | CTA abre o checkout real | HT-{{xx}} (conta MoR/Stripe) | chaves reais presentes |
| Email real | `{{EMAIL_ADAPTER}}` | `console` | envia por {{Resend}} | HT-{{xx}} | `RESEND_API_KEY` |
| Autenticação simulada | `{{AUTH_ADAPTER=mock}}` | só dev/teste | utilizadores fictícios | — | **proibido** com `NODE_ENV=production` (teste automático) |
| {{IA / analítica / …}} | {{}} | {{}} | {{}} | {{}} | {{}} |

## 5. Estado das histórias vs PRD

<!-- One row per PRD story id AND per slice if the story was split (S-nn). Status: todo · em curso · feito · adiado · bloqueado. "feito" requires at least one automated test named with the story id. Update after every slice. -->

| Slice | História | Título | Prioridade | Estado | Testes (ficheiros) | Notas / desvios |
|---|---|---|---|---|---|---|
| S-01 | {{US-01}} | {{}} | must | {{feito}} | `tests/unit/{{}}.test.ts`, `tests/e2e/{{}}.spec.ts` | {{}} |

Won't (não construído, por decisão do PRD): {{US-xx, …}}

## 6. Testes e verificações (última execução)

| Verificação | Comando | Resultado | Data |
|---|---|---|---|
| Lint | `npm run lint` | {{✅}} | {{}} |
| Typecheck | `npm run typecheck` | {{✅}} | {{}} |
| Unitários | `npm test` | {{n testes ✅}} | {{}} |
| Build de produção | `npm run build` | {{✅, JS da landing = n KB gzip}} | {{}} |
| e2e | `npm run test:e2e` | {{n testes ✅, 0 flaky}} | {{}} |
| Axe nas rotas novas | dentro do e2e | {{0 graves/críticas}} | {{}} |
| Auditoria de dependências | `npm audit --omit=dev` | {{0 high/critical}} | {{}} |

Versões: Node {{}}, Next {{}}, React {{}}, TypeScript {{}}, Vitest {{}}, Playwright {{}} (de `npm ls --depth=0`). Cobertura (informativa): {{% em `src/lib`}}

## 7. Integração das páginas legais e do copy da landing

<!-- Filled by Step 9 of the playbook once legal/public/ and marketing/copy/ exist. State "pendente" with the reason if they do not yet. -->

**Estado:** {{concluída em AAAA-MM-DD / pendente: à espera de `legal` e/ou `gtm`}}

| Documento | en | pt | Rota | Ligado no rodapé | Notas |
|---|---|---|---|---|---|
| privacy | {{✅}} | {{✅}} | `/{{locale}}/legal/privacy` | {{✅}} | |
| terms | | | | | |
| cookies | | | | | |
| withdrawal | | | | | {{só vendas a consumidores}} |
| legal-notice | | | | | |
| {{extras: ai-notice, refund …}} | | | | | |

- **Placeholders por preencher (valores que só o fundador conhece):** {{campo → `[A PREENCHER PELO FUNDADOR]` → HT-xx}} · `grep` de sobras do starter (`(placeholder)`, `acme.example`, `Acme`): {{limpo}}
- **Copy da landing (`marketing/copy/`):** secções mapeadas {{hero, prova, funcionalidades, como funciona, preços, FAQ, CTA final, meta}} · paridade en/pt ✅ · discrepâncias com o produto reportadas ao `gtm`: {{}}
- **Tabela de cookies da política = trackers no código = inventário da arquitetura:** {{✅ / diferenças}}

## 8. Desvios e pressupostos

| # | Tipo (desvio PRD / desvio arquitetura / pressuposto) | O que aconteceu e porquê | ADR | Impacto |
|---|---|---|---|---|
| 1 | {{}} | {{}} | {{ADR-NNNN / —}} | {{}} |

Novos tratamentos de dados pessoais ou subcontratantes surgidos na construção (para `legal`): {{nenhum / …}}

## 9. Limitações conhecidas e dívida técnica

| # | Limitação | Gravidade provável | Plano |
|---|---|---|---|
| 1 | {{}} | {{P2/P3}} | {{`10-growth` / `06-qa`}} |

## 10. Tarefas do fundador relacionadas

| ID | O que desbloqueia | Tempo | Estado |
|---|---|---|---|
| HT-{{xx}} | {{pagamentos reais / email / domínio / IA}} | {{≤ 5 min}} | {{aberta}} |
