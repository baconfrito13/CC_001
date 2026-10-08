# Configuração única

Cada passo aqui é feito **uma vez** e desbloqueia autonomia para **todos** os produtos
futuros. Nada é obrigatório para começar: sem estes passos a fábrica pesquisa, decide,
constrói e testa tudo, e deixa preparado o que precisar de ti. Com eles, também publica
sozinha.

Ordem recomendada (o mais útil primeiro):

| # | Passo | Tempo | Desbloqueia |
|---|---|---|---|
| 1 | Privacidade do repositório e proteção do `main` | 3 min | ideias confidenciais; nenhum agente escreve diretamente no `main` |
| 2 | Fazer merge do PR da fábrica | 1 min | sessões novas já arrancam com a fábrica |
| 3 | Preencher `FOUNDER.md` | 10 min | decisões de negócio sem perguntas |
| 4 | Ligar o piloto automático (`/autopiloto ligar` na sessão "🏭 Fábrica · Capataz") | 1 min | ideias processadas sem abrires sessões |
| 5 | Tokens no ambiente cloud do Claude | 15 min | deploys, bases de dados, pagamentos em teste |
| 6 | GitHub Actions (opcional) | 5 min | ideias via issues, pré-visualização automática no merge |
| 7 | Contas de negócio (quando o 1.º produto passar a validação) | variável | cobrar dinheiro de verdade |

---

## 1. Privacidade e proteção do `main`

**Público ou privado?** Este repositório está **público**: qualquer pessoa pode ler as tuas
ideias, pesquisas, planos de negócio e código. Decide antes de enviares a primeira ideia.

- **Privado (recomendado se as ideias forem confidenciais):** GitHub → *Settings* → *General*
  → *Danger Zone* → *Change repository visibility* → *Private*. As sessões do Claude
  continuam a funcionar igual. Só os minutos do GitHub Actions passam a ter uma quota mensal
  no plano gratuito (as sessões cloud do Claude não gastam esses minutos).
- **Público:** minutos de Actions ilimitados e "build in public". Nesse caso não escrevas em
  `FOUNDER.md` nada que não queiras ver publicado.

**Proteger o `main`.** Os agentes já estão proibidos de escrever no `main` (regras em
`CLAUDE.md` e `.claude/settings.json`); uma regra no GitHub torna isso impossível, aconteça o
que acontecer:

1. GitHub → *Settings* → *Rules* → *Rulesets* → *New ruleset* → *New branch ruleset*.
2. *Ruleset name*: `proteger-main` · *Enforcement status*: **Active**.
3. *Target branches* → *Add target* → **Include default branch**.
4. Deixa marcados **Restrict deletions** e **Block force pushes**; marca **Require a pull
   request before merging** (*Required approvals*: 0, porque o GitHub não deixa aprovares os
   teus próprios PRs). Não acrescentes ninguém à *Bypass list*.
5. *Create*.

As regras estão disponíveis em repositórios públicos no plano gratuito; num repositório
**privado** exigem GitHub Pro (ou Team). Se ficares no privado e gratuito, salta este ponto —
as regras do Claude continuam a proteger o `main`.

## 2. Merge do PR da fábrica

No GitHub, abre o pull request **"🛠️ Fábrica de produtos"**, carrega em *Ready for review*
(está em rascunho) e depois em *Merge pull request* com a opção **Create a merge commit** (não
*Squash*: os produtos que já tenham começado continuam a juntar-se ao `main` sem conflitos). A
partir daí o `main` tem a fábrica e cada produto novo nasce num branch limpo a partir dele.

## 3. `FOUNDER.md`

Preenche o que souberes; o resto fica com os valores por defeito. As chaves mais importantes:
`go_live` (aprovas cada lançamento ou deixas lançar sozinho), `max_parallel_products` e a tua
identidade legal (para as páginas legais).

## 4. Piloto automático

Já existe uma sessão chamada **🏭 Fábrica · Capataz** na tua lista de sessões do Claude
Code: é o capataz permanente da fábrica, com todas as ferramentas (GitHub, criar sessões de
produto, notificações). Abre-a e escreve:

```
/autopiloto ligar
```

Ela cria uma rotina diária (02:47, hora de Lisboa) que a acorda para processar ideias novas
da caixa e das issues, retomar produtos parados e correr os ciclos de crescimento dos
produtos lançados. Tem de ser pedido por ti, nessa sessão: por segurança, a fábrica não cria
rotinas recorrentes em teu nome. Desligar: `/autopiloto desligar`. **Não arquives essa
sessão** — é ela que a rotina acorda. Também podes falar com ela a qualquer hora (`/ideia …`,
`/portfolio`).

Alternativa: [claude.ai/code](https://claude.ai/code) → *Routines* → *New routine* →
repositório **CC_001** selecionado, horário diário, e como instrução o texto de
`factory/routines/heartbeat.md`.

## 5. Tokens no ambiente cloud do Claude

As sessões do Claude correm num ambiente cloud. Este ambiente **já consegue chegar** às APIs
da Vercel, Cloudflare, Stripe, Supabase e Resend (verificado); só faltam as credenciais.

**Onde pôr:** numa sessão, abre o menu do ambiente cloud na barra de título → *Edit* →
**Network secrets** (ou *API credentials* / variáveis de ambiente, conforme a versão da app).
Usa exatamente os nomes abaixo. Sessões novas passam a ver os tokens. **Nunca** coles um
token no chat nem em ficheiros do repositório.

| Variável | Onde criar | Permissões mínimas | Desbloqueia |
|---|---|---|---|
| `VERCEL_TOKEN` | vercel.com → *Account Settings* → *Tokens* | conta/equipa onde ficam os produtos | deploys de preview e produção |
| `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` | dash.cloudflare.com → *My Profile* → *API Tokens* | Workers/Pages *Edit*, DNS *Edit* nas tuas zonas | alojamento alternativo, DNS dos domínios |
| `SUPABASE_ACCESS_TOKEN` | supabase.com → *Account* → *Access Tokens* | — | criar bases de dados e autenticação (região UE) |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → *Developers* → *API keys* | **chave de teste** `sk_test_…` | produtos, preços e checkout em modo de teste (Stripe direto ou *Managed Payments*) |
| `POLAR_ACCESS_TOKEN` ou `PADDLE_API_KEY` | painel do Polar ou do Paddle | — | produtos e links de pagamento com IVA tratado (alternativas ao Stripe) |
| `RESEND_API_KEY` | resend.com → *API Keys* | *Sending access* | emails transacionais e lista de espera |
| `SENTRY_AUTH_TOKEN` | sentry.io → *Settings* → *Auth Tokens* | project:write | monitorização de erros |
| `EXPO_TOKEN` | expo.dev → *Account settings* → *Access tokens* | — | builds e submissões de apps móveis |
| `POSTHOG_PERSONAL_API_KEY` / `PLAUSIBLE_API_KEY` | painel de analytics | leitura | métricas nos ciclos de crescimento |

Para ver o que está disponível numa sessão: `python3 factory/scripts/factory.py doctor`
(mostra só se cada variável existe, nunca o valor).

Se um dia um serviço novo for bloqueado pela rede do ambiente, o Claude diz-te o domínio e
acrescentas em *Network access* → *Allowed domains* no mesmo menu
([documentação](https://code.claude.com/docs/en/cloud-environments#network-access)).

## 6. GitHub Actions (opcional)

Permite enviar ideias por **issues** (modelo "💡 Nova ideia") e falar com o Claude com
`@claude` nos PRs dos produtos, mesmo sem abrires o Claude; e publica uma
**pré-visualização** na Vercel quando fazes merge de um produto (produção é sempre com
`/lancar`).

1. Instala a app do Claude no repositório: no Claude Code (terminal) corre
   `/install-github-app`, ou em [github.com/apps/claude](https://github.com/apps/claude).
2. No teu computador, com o Claude Code instalado: `claude setup-token` → copia o token.
3. GitHub → *Settings* → *Secrets and variables* → *Actions* → *New repository secret*:
   - `CLAUDE_CODE_OAUTH_TOKEN` = o token do passo 2 (usa a tua subscrição Claude);
   - `VERCEL_TOKEN` = o mesmo token da Vercel (ativa a pré-visualização automática no merge);
   - opcional, em *Variables*: `VERCEL_SCOPE` = slug da equipa Vercel, se usares uma equipa.
4. GitHub → *Issues* → *Labels*: cria `ideia`, `na-fila`, `em-curso`, `produto`, `feedback`
   e `portfolio` (o modelo de issue usa `ideia`).

Só tu (dono) e colaboradores conseguem pôr o Claude a trabalhar: issues e comentários de
outras pessoas são ignorados.

Com o Actions ligado, uma issue com a etiqueta `ideia` começa **logo** a ser trabalhada no
GitHub, mesmo que já estejam a avançar `max_parallel_products` produtos (cada execução gasta
minutos de Actions). Para guardar uma ideia sem a começar já, abre uma issue em branco
(*Open a blank issue*) com a etiqueta `na-fila`, ou acrescenta-a a `ideas/INBOX.md`: o
capataz pega nela quando houver vaga.

## 7. Contas de negócio (quando houver um produto validado)

A fábrica pede-as no `HUMAN_TASKS.md` do produto, com passos exatos, quando forem precisas.
Para adiantar:

- **Atividade/empresa:** abrir atividade nas Finanças (trabalhador independente) ou constituir
  uma Unipessoal Lda. Confirma o enquadramento de IVA e IRS com um contabilista certificado.
- **Receber pagamentos:** para vender software a consumidores em toda a UE, o mais simples é um
  *Merchant of Record*, que trata do IVA de cada país por ti: **Stripe Managed Payments** por
  defeito (disponível para empresas em Portugal), **Paddle** se quiseres MB WAY, **Polar** para
  ferramentas de developers. Para vendas só B2B, Stripe direto com Stripe Tax. Comissões e
  regras verificadas a 2026-10-08 em `factory/playbooks/monetization.md`.
- **Alojamento comercial:** o plano gratuito *Hobby* da Vercel não permite uso comercial (nem
  anunciar um produto à venda). Quando o primeiro produto for cobrar dinheiro: Vercel Pro
  (cerca de 20 USD/mês, uma subscrição serve todos os produtos) ou Cloudflare.
- **Domínios:** Cloudflare Registrar (preço de custo) ou outro registrar; `.pt` através de um
  registrar acreditado pelo DNS.pt.
- **Apps móveis:** Apple Developer Program (99 USD/ano) e Google Play Console (25 USD, uma vez).
- **Email com domínio:** encaminhamento grátis com Cloudflare Email Routing; envio pelo Resend.
