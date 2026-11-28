# Tarefas do fundador — Medições PT

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

**Resumo:** 9 abertas · 🔴 3 · 🟡 4 · 🟢 2 · tempo total ≈ 44 min · custo total ≈ 17 USD (domínio, 1.º ano) + consultas (contabilista, advogado) e caixa de correio a combinar · atualizado em 2026-11-28

## 🔴 Bloqueiam o lançamento

- [ ] **HT-04 · Confirmar com o contabilista a entidade, o IVA e a faturação** — ⏱ 5 min · 💶 consulta do contabilista (a combinar); a constituição de uma Unipessoal Lda, se a escolheres, tem taxa oficial (verifica o valor atual)
  - **Porquê:** não podes cobrar o primeiro euro sem saber **quem vende** (empresário em nome individual ou sociedade), **com que regime de IVA** e **como se emitem as faturas**. O Aviso Legal, os Termos e a Política de Privacidade têm de identificar essa entidade. Esta tarefa inclui a tarefa «B» de `docs/02-business.md` §13 e é o pré-requisito de HT-05 e de HT-06. Isto não é aconselhamento fiscal: a fábrica só prepara as perguntas.
  - **Passos:**
    1. Marca 5 minutos com o teu contabilista certificado (ou pede um por e-mail) e leva as perguntas abaixo. Se ainda não tens contabilista, pede o orçamento a dois (https://www.occ.pt/ tem a lista de contabilistas certificados).
    2. Perguntas: (a) para vender software por subscrição a empresas, é melhor abrir atividade como trabalhador independente (CAE de software) ou constituir uma Unipessoal Lda? (b) regime de IVA: isenção do art. 53.º do CIVA (limite de 15 000 € em 2026, a confirmar) ou regime normal? (c) como emitir faturas a cada pagamento do Stripe: Portal das Finanças ou programa certificado (preço), e comunicação à AT/ATCUD? (d) clientes de outros países da UE com NIF-IVA válido: autoliquidação, validação VIES e declaração recapitulativa; clientes fora da UE: o que guardar como prova? (e) as faturas têm de ser conservadas 10 anos; basta o arquivo do programa? (f) vale a pena um seguro de responsabilidade civil profissional, dado que os Termos limitam a responsabilidade ao valor pago nos últimos 12 meses? (g) que morada profissional usar no Aviso Legal (nunca a morada pessoal, se for diferente)?
    3. Se for preciso abrir atividade ou constituir a sociedade, fá-lo no Portal das Finanças (https://www.portaldasfinancas.gov.pt/) ou em https://eportugal.gov.pt/ (verifica o fluxo atual) com o contabilista.
  - **Valores a trazer de volta (escreve-os no chat):** forma jurídica · regime de IVA (isento ou normal) · como se faturam os pagamentos (Portal ou programa) · se há contabilista e o seu contacto.
  - **Desbloqueia:** HT-05 e HT-06; a conta Stripe (tarefa «A» de `docs/02-business.md` §13); `TAX_MODE` e «+ IVA» na página de preços; o primeiro pagamento real.
  - **Enquanto esperas:** o Claude continua tudo em modo de teste e as páginas legais ficam com marcadores.
  - **Como assinalar:** marca a caixa ou escreve «HT-04 feito» com os valores acima.

- [ ] **HT-05 · Dar os dados públicos da empresa e criar as 3 caixas de correio** — ⏱ 5 min · 💶 caixa de correio com domínio próprio (verifica o preço do fornecedor; pode bastar reencaminhar para o teu e-mail)
  - **Porquê:** a lei obriga a publicar a identificação do prestador (Decreto-Lei n.º 7/2004, art. 10.º) e os Termos, a Privacidade e o Aviso Legal prometem três endereços de contacto. Os pedidos de privacidade têm de ter resposta em 1 mês.
  - **Passos:**
    1. Depende de HT-01 (domínio) e de HT-04 (entidade). No fornecedor de e-mail do domínio (ou nas regras de reencaminhamento do registador), cria `ola@rastoplan.com`, `apoio@rastoplan.com` e `privacidade@rastoplan.com`, todos a chegar à tua caixa. Em Google Workspace ou Zoho, vê o preço atual antes de pagar.
    2. Escreve no chat (ou preenche a secção «Identidade legal e fiscal» de `FOUNDER.md`): **denominação ou nome da firma**, **NIF** (ou NIPC), **número de IVA**, **forma jurídica e registo** (por exemplo, «Empresário em nome individual, CAE …» ou «Sociedade unipessoal por quotas, NIPC …, Conservatória …»), **morada profissional/sede registada**. Telefone: não é preciso.
    3. O Claude coloca estes valores em `app/src/config/site.ts` (substitui `PENDING_FOUNDER`) e confirma que nenhuma página mostra marcadores.
  - **Valores a colar:** `ola@rastoplan.com`, `apoio@rastoplan.com`, `privacidade@rastoplan.com` (os endereços que já estão na configuração da aplicação). **Estes valores ficam públicos** (Aviso Legal) e, se o repositório for público, também no código; usa só dados que aceitas ver publicados.
  - **Desbloqueia:** páginas legais completas, contacto de privacidade e dos Serviços Digitais, códigos de acesso por e-mail (com HT-01 e o DNS do Resend).
  - **Enquanto esperas:** o Claude mantém os marcadores e o QA/lançamento falham enquanto existirem (de propósito).
  - **Como assinalar:** marca a caixa ou escreve «HT-05 feito» (sem enviar palavras-passe).

- [ ] **HT-06 · Registar-te no Livro de Reclamações Eletrónico** — ⏱ 5 min · 💶 sem custo previsto (confirma no portal)
  - **Porquê:** o Decreto-Lei n.º 156/2005 obriga os prestadores de serviços, **incluindo os que atuam só em linha**, a ter o livro de reclamações eletrónico e a mostrar o acesso no sítio web, em local visível. Mesmo sendo um produto para empresas, registar-se é grátis e evita coimas de 250 a 3 500 € (pessoa singular) ou 1 500 a 15 000 € (pessoa coletiva).
  - **Passos:**
    1. Depende de HT-04 (atividade aberta). Abre https://www.livroreclamacoes.pt e entra com a Chave Móvel Digital ou o NIF e as credenciais das Finanças.
    2. Na área de registo de fornecedores/prestadores de serviços, regista a entidade: atividade «Software como serviço (SaaS) para empresas de construção», sítio web `https://rastoplan.com`, e-mail para receber as reclamações `apoio@rastoplan.com` (HT-05). Se te pedirem a entidade reguladora, escolhe a ASAE e o CAE da atividade.
    3. Guarda o comprovativo. Responde a qualquer reclamação em 15 dias úteis.
  - **Valores a colar:** os do passo 2.
  - **Desbloqueia:** o botão do Livro de Reclamações no rodapé com o registo válido (a aplicação já tem a ligação) e o lançamento a clientes em Portugal.
  - **Enquanto esperas:** o Claude deixa a ligação para https://www.livroreclamacoes.pt no rodapé e nas páginas legais.
  - **Como assinalar:** marca a caixa ou escreve «HT-06 feito».

## 🟡 Antes do lançamento

- [ ] **HT-01 · Comprar o domínio `rastoplan.com`** — ⏱ 4 min · 💶 ≈ 17 USD no 1.º ano (renovação a confirmar)
  - **Porquê:** a página de lançamento, o email do produto, os links de pagamento e as páginas legais precisam de um domínio próprio. O nome «Rastoplan» foi escolhido com este domínio disponível.
  - **Estado da verificação:** a ferramenta Shopify `generate-domain-names` indicou `rastoplan.com` **disponível por 17,00 USD no 1.º ano em 2026-11-28** (instantâneo, não uma reserva: comprar depressa). `rastoplan.pt` está ocupado.
  - **Passos:**
    1. Abre https://www.cloudflare.com/products/registrar/ (ou o registador indicado em `SETUP.md`; verifica o preço atual) e inicia sessão.
    2. Pesquisa `rastoplan.com` e confirma o preço de **renovação** (limite do projeto: ≤ 35 €/ano).
    3. Ativa a renovação automática; recusa extras (email, alojamento).
    4. Paga com o teu cartão.
  - **Se já não estiver disponível:** usa a reserva n.º 1, `cotamapa.com` (disponível segundo a mesma ferramenta em 2026-11-28, 17,00 USD), e avisa «HT-01 reserva n.º 1»; a marca muda por completo (`docs/03-brand.md` §3.2). Reserva n.º 2: `medirplan.com` / `medirplan.pt`.
  - **Opcional antes de pagar (2 min):** vê em https://www.dns.pt/ quem detém `rastoplan.pt` (ocupado) e se tem atividade com o mesmo nome no setor; se tiver, usa a reserva n.º 1.
  - **Valores a colar:** domínio `rastoplan.com` · titular: o teu nome ou a tua entidade · email de contacto: o email do produto.
  - **Desbloqueia:** pré-visualização no domínio final, DNS, email, páginas legais, ligação a pagamentos.
  - **Enquanto esperas:** o Claude continua com o domínio de teste da plataforma de alojamento e deixa `SITE_URL` configurável; `links.domain` só é preenchido depois da tua confirmação.
  - **Como assinalar:** marca a caixa acima ou escreve «HT-01 feito rastoplan.com». Não envies dados do cartão.

- [ ] **HT-02 · Reservar as contas sociais «Rastoplan»** — ⏱ 5 min · 💶 0 €
  - **Porquê:** não foi possível verificar automaticamente os nomes nas redes (bloqueiam bots). Reservar cedo evita perder o nome.
  - **Passos:** com o email do produto, tenta criar `rastoplan` (ou o mais próximo livre) em: GitHub https://github.com/signup, LinkedIn (página de empresa) https://www.linkedin.com/company/setup/new/, X https://x.com/i/flow/signup, Instagram https://www.instagram.com/accounts/emailsignup/, YouTube https://www.youtube.com/ (canal). Não publiques nada.
  - **Valores a colar:** nome `Rastoplan` · descrição: «Medições de plantas PDF vetoriais com rasto até à folha. Para quem orça em Portugal.» · ícone: `brand/assets/icon-512.png`.
  - **Desbloqueia:** presença consistente no lançamento e prospeção no LinkedIn.
  - **Enquanto esperas:** o Claude continua a preparar o site e o conteúdo; nenhum texto é publicado sem a tua aprovação.
  - **Como assinalar:** marca a caixa ou escreve «HT-02 feito» e diz que contas ficaram com outro nome.

- [ ] **HT-07 · Aceitar os acordos de dados (DPA) dos fornecedores ao criar cada conta** — ⏱ 5 min · 💶 0 €
  - **Porquê:** o RGPD (art. 28.º) exige um contrato com cada fornecedor que trata dados pessoais, e os agentes não aceitam contratos em teu nome. Em quatro fornecedores o DPA já faz parte dos termos que aceitas ao criar a conta; só tens de **ler o ecrã, aceitar e guardar uma cópia**.
  - **Passos (faz cada um quando criares a conta, nas tarefas de contas da arquitetura E, F, G e da estratégia A):**
    1. **Supabase** (projeto na região «Central EU (Frankfurt)»): aceita os Termos de Serviço, que incluem o DPA e as cláusulas contratuais-tipo. DPA: https://supabase.com/legal/dpa
    2. **Vercel** (plano Pro): aceita os termos. DPA: https://vercel.com/legal/dpa
    3. **Stripe**: ao ativar a conta aceitas o contrato de serviços com o DPA incorporado: https://stripe.com/legal/dpa. Depois, em https://dashboard.stripe.com/settings/public, preenche os URL dos **Termos** (`https://rastoplan.com/pt/legal/terms`) e da **Privacidade** (`https://rastoplan.com/pt/legal/privacy`): o checkout com caixa de aceitação dos Termos exige o URL dos Termos.
    4. **Resend**: aceita os Termos; o DPA fica no painel. https://resend.com/legal/dpa
    5. Descarrega o PDF de cada DPA para uma pasta privada tua (não o coloques no repositório) e escreve no chat «HT-07 feito» com a data de cada aceitação.
  - **Desbloqueia:** o registo de subcontratantes (`legal/subprocessors.md`) fica completo e a Política de Privacidade pode ser publicada; Stripe com caixa de aceitação dos Termos.
  - **Enquanto esperas:** o Claude continua em modo de teste com os adaptadores `memory`/`mock`.
  - **Como assinalar:** marca a caixa ou escreve «HT-07 feito» com as datas.

- [ ] **HT-08 · Assinar o DPA do PostHog, aceitar o do Sentry e configurar a privacidade de ambos** — ⏱ 5 min · 💶 0 €
  - **Porquê:** são os dois fornecedores cujo acordo de dados **não** se aceita automaticamente ao criar a conta. Sem eles, o Claude não liga a analítica nem a monitorização de erros em produção (o produto funciona sem elas).
  - **Passos:**
    1. **PostHog** (nuvem da UE: https://eu.posthog.com): em https://posthog.com/dpa gera o DPA (chega por PandaDoc em ≈ 24 h) e assina. Nas definições do projeto ativa «descartar os dados de IP do cliente» e define a retenção de eventos em **14 meses ou menos**.
    2. **Sentry**: ao criar a organização escolhe a região de armazenamento «Germany (EU)» (não se pode mudar depois). Aceita o DPA em https://sentry.io/legal/dpa/ (segue as instruções da página). Nas definições da organização, ativa a opção que impede guardar endereços IP e confirma a retenção dos eventos do teu plano: a Política de Privacidade diz **30 dias**; se o plano retiver mais, avisa o Claude para corrigir a política (ou escolhe um plano que cumpra).
    3. Guarda uma cópia de cada DPA numa pasta privada tua.
  - **Valores a colar:** chaves públicas como variáveis de ambiente `NEXT_PUBLIC_POSTHOG_KEY` e `SENTRY_DSN` (ver `SETUP.md`; nunca no chat).
  - **Desbloqueia:** analítica com consentimento e alertas de erro; o RoPA e a Política de Privacidade já os descrevem.
  - **Enquanto esperas:** `ANALYTICS_PROVIDER=none` e sem DSN; a Política de Cookies já diz que as estatísticas só correm com consentimento.
  - **Como assinalar:** marca a caixa ou escreve «HT-08 feito».

## 🟢 Depois / opcional

- [ ] **HT-03 · (Opcional) Registar a marca «Rastoplan»** — ⏱ 5 min · 💶 taxa oficial a confirmar
  - **Porquê:** protege o nome. A verificação preliminar (`legal/trademark-check.md`) não encontrou conflitos óbvios, mas TMview e INPI não puderam ser consultados; convém uma verificação profissional antes de pedir o registo ou de investir em publicidade.
  - **Passos:** em https://www.euipo.europa.eu/ (marca da União Europeia) ou https://inpi.justica.gov.pt/ (Portugal), pedir o registo da marca nominativa e figurativa (`brand/logo.svg`) nas classes 9, 42 e 35. Consulta a taxa atual na página oficial do organismo.
  - **Nota do `legal` (2026-11-28):** a verificação formal ficou **amarela** (`legal/trademark-check.md`): sem conflitos no EUIPO e na OMPI, mas TMview e INPI continuam por consultar. Antes de pagar, pesquisa «rastoplan» em https://www.tmdn.org/tmview/ e em https://servicosonline.inpi.justica.gov.pt/pesquisas/ (2 min cada) e confirma que não há marcas parecidas nas classes 9, 35 e 42.
  - **Desbloqueia:** uso de ® e proteção do nome. Nada bloqueia o lançamento sem isto; entretanto usa ™.
  - **Como assinalar:** marca a caixa ou escreve «HT-03 feito» (ou «HT-03 adiado»).

- [ ] **HT-09 · (Opcional) Pedir 1 hora de revisão a um advogado antes do primeiro contrato maior** — ⏱ 5 min · 💶 honorários a combinar
  - **Porquê:** nenhum dos gatilhos de revisão obrigatória se verifica no lançamento (sem dados sensíveis, sem IA, sem consumidores, receita baixa), por isso **não bloqueia nada**. Convém, porém, antes do primeiro cliente que peça um DPA ou limites de responsabilidade à medida, ou antes de receita relevante: os Termos limitam a responsabilidade a 12 meses de pagamentos num produto cujo erro pode custar muito mais ao cliente.
  - **Passos:** escolhe um advogado de direito digital e envia-lhe `legal/public/terms.pt.md` e `docs/07-compliance.md` (secção 7, «Perguntas para o advogado»: limite de responsabilidade, Regulamento dos Dados, DSA, Livro de Reclamações em B2B, publicidade comparativa com o civils.ai, *outbound* por e-mail).
  - **Desbloqueia:** confiança nas cláusulas B2B e nas alegações comparativas.
  - **Como assinalar:** marca a caixa ou escreve «HT-09 feito» (ou «HT-09 adiado»).

## ✅ Concluídas

_Ainda nenhuma._
