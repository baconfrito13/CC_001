# Tarefas do fundador — {{name}}

<!--
Template for products/<slug>/HUMAN_TASKS.md. Rendered by `factory.py new` (replaces name and date). Written in pt-PT because the founder reads it.

RULES (agents)
- Create a task ONLY for founder-only actions: spending money; creating accounts or a legal/tax identity; accepting contracts; irreversible public actions under the founder's name (store submissions, social posts, emails/DMs to real people, switching payments to live); providing secrets. Everything else an agent decides.
- Each task must take the founder <= 5 minutes of active work. If it would take longer, split it (e.g. HT-04 "criar conta", HT-05 "enviar documentos") and give "Enquanto esperas" for waiting periods.
- IDs are HT-01, HT-02… never reused, never renumbered. Group by 🔴 blocks launch / 🟡 before launch / 🟢 later. Order inside a group by what it unblocks.
- EXACTLY ONE checkbox line per task (`- [ ] **HT-xx · title** — ⏱ n min · 💶 cost`): factory.py counts open/done tasks from lines starting with `- [ ]` / `- [x]` outside HTML comments. Details are plain bullets and a numbered list, never checkboxes.
- Every task has: why, steps with exact links, values to paste, time, cost, what it unblocks, what Claude does meanwhile, how to signal completion.
- Never ask for a secret in chat or in this file. Secrets go into environment variables (see SETUP.md); the task says which variable name.
- Personal data that must stay private (home address, personal phone, NIF of a person, bank details) never goes into this file when the repo is public: say "tens à mão" and where it is entered.
- Keep the Resumo line in sync (counts, total time, total cost). When a task is done: tick `[x]`, move the block to ✅ Concluídas, add the completion date.
- Verify at execution time every link, price and signup flow; platforms change.
- Typical tasks by phase — strategy: payment account + verification (🔴/🟡), tax/entity confirmation (🟡); brand: buy domain (🟡/🔴), claim social handles (🟡), file trademark (🟢); architecture/build: add deployment/API tokens as env vars (🔴 for production), connect analytics/error-monitoring accounts (🟡); legal: confirm legal identification data for the public pages (🔴), accountant review (🟢); launch: approve go-live / switch payments to live (🔴), submit app/extension to stores (🔴), DNS or registrar steps the API cannot do (🔴); gtm: approve public posts/outreach (🟡); research KILL: decide the product's fate (🔴).

WORKED EXAMPLE (format reference — do not keep in real files)

- [ ] **HT-01 · Comprar o domínio `exemplo.com`** — ⏱ 4 min · 💶 ≈ 12 €/ano
  - **Porquê:** a página de lançamento, o email transacional e os links dos meios de pagamento precisam de um domínio próprio.
  - **Passos:**
    1. Abre https://www.cloudflare.com/products/registrar/ (ou o registador indicado em `SETUP.md`) e inicia sessão.
    2. Pesquisa `exemplo.com` e confirma que o preço de renovação é o indicado abaixo.
    3. Ativa a renovação automática; recusa extras (email, alojamento).
    4. Paga com o teu cartão.
  - **Valores a colar:** domínio `exemplo.com` · titular: o teu nome · email de contacto: `<email do produto>`
  - **Desbloqueia:** pré-visualização no domínio final, DNS, email, páginas legais com a morada do site.
  - **Enquanto esperas:** o Claude continua com o domínio de teste da plataforma de alojamento e deixa as variáveis `SITE_URL` em modo configurável.
  - **Como assinalar:** marca a caixa acima ou escreve «HT-01 feito exemplo.com». Não envies dados do cartão.
-->

> Aqui só aparecem ações que **só tu** podes fazer (dinheiro, contas e identidade legal, contratos, ações públicas irreversíveis, segredos). Cada tarefa demora **≤ 5 minutos**; tudo o resto avança sem ti, em modo de teste.
> **Como dar uma tarefa por feita:** marca a caixa (`- [x]`) neste ficheiro, ou escreve «HT-xx feito» num comentário do PR ou no chat. **Nunca** cole chaves ou palavras-passe no chat nem no repositório: vê `SETUP.md` para as definir como variáveis de ambiente.

**Resumo:** 0 abertas · 🔴 0 · 🟡 0 · 🟢 0 · tempo total ≈ 0 min · custo total ≈ 0 € · atualizado em {{date}}

## 🔴 Bloqueiam o lançamento

_Sem tarefas abertas._

## 🟡 Antes do lançamento

_Sem tarefas abertas._

## 🟢 Depois / opcional

_Sem tarefas abertas._

## ✅ Concluídas

_Ainda nenhuma._
