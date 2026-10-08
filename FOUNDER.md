# Perfil do fundador

> Preenche uma vez (10 minutos) e atualiza quando algo mudar. A fábrica lê este ficheiro antes
> de qualquer decisão de negócio, para não te fazer perguntas. **O que ficar vazio usa o valor
> por defeito.**
>
> ⚠️ Se o repositório for público, tudo o que escreveres aqui é público. Dados pessoais que não
> vão aparecer no site (morada pessoal, telefone, IBAN) **não** entram aqui — ver `SETUP.md`.

## Configuração da fábrica

```yaml
autonomy: max                 # max = decide tudo o que é reversível sem perguntar
go_live: approval             # approval = aprovas cada lançamento em produção · auto = lança sozinho
merges: claude                # claude = a fábrica faz os merges dos PRs (regras em CLAUDE.md) · fundador = fazes tu
self_improvement: auto        # auto = a fábrica aplica sozinha o que aprende (playbooks, starters…; regras e permissões esperam por ti) · propose = tudo espera por ti · off
radar: monthly                # monthly = radar mensal de versões, preços, leis e tendências · off
radar_ideas_per_month: 3      # ideias sugeridas por mês a partir das tendências (nunca começam sem ti; 0 = nenhuma)
max_parallel_products: 3      # quantos produtos avançam ao mesmo tempo (sessões em paralelo)
default_depth: auto           # auto (ajusta ao score da validação) · lean · standard · deep
autopilot_cron: "CRON_TZ=Europe/Lisbon 47 2 * * *"   # piloto automático: todos os dias às 02:47
product_session_model: inherit   # modelo da sessão de cada produto: inherit · claude-sonnet-5-5 · claude-opus-5-5
                                 # (os agentes especialistas correm sempre em Sonnet/Haiku)
monthly_budget_per_product_eur: 50   # teto de custos recorrentes por produto antes de haver receita
paid_ads_budget_eur: 0        # orçamento de testes de anúncios por produto (0 = só orgânico)
founder_docs_language: pt-PT
product_locales: [en, pt-PT]  # línguas do produto por defeito
```

## Sobre ti

- **País de residência fiscal:** Portugal
- **Nome ou marca pública (assina os produtos?):**
- **Competências, setores que conheces bem, interesses:**
- **Ativos que já tens** (audiência, redes sociais, newsletter, contactos, domínios, clientes):
- **Tempo semanal que queres dedicar** (para tarefas que só tu podes fazer):
- **Setores ou temas a evitar:**

## Identidade legal e fiscal

Usada nas páginas legais (aviso legal, termos, privacidade) e na faturação. Se ainda não
tens, a fábrica avança com marcadores e cria a tarefa certa quando for preciso.

- **Forma:** ainda nenhuma / trabalhador independente (atividade aberta) / Unipessoal Lda / Lda
- **Nome legal ou firma:**
- **NIF/NIPC** (só se aceitas que fique público):
- **Morada profissional/sede** (a que pode aparecer no site):
- **Email público de contacto:**
- **Entidade de resolução alternativa de litígios (RAL):** por defeito CNIACC
- **Contabilista certificado:** sim / não

## Contas que já tens

Marca o que existe — a fábrica usa e evita pedir-te contas novas sem necessidade. Tokens
**nunca** vão aqui (ver `SETUP.md`).

| Serviço | Tens? | Notas |
|---|---|---|
| GitHub | ✅ | |
| Vercel (alojamento web) | | |
| Cloudflare (domínios, DNS, alojamento) | | |
| Stripe (direto ou *Managed Payments*) | | |
| Paddle / Polar / Gumroad | | |
| Supabase (base de dados + autenticação) | | |
| Resend (email) | | |
| Email com domínio próprio (Google Workspace, Zoho, …) | | |
| Apple Developer Program | | |
| Google Play Console | | |
| Product Hunt / X / LinkedIn / Instagram / TikTok | | |

## Preferências

- **Stack técnico:** o da fábrica (`factory/stacks/`) salvo indicação aqui.
- **Estilo de marca que gostas / detestas:**
- **Mercados prioritários:** global (inglês) + Portugal
- **Modelo de receita preferido** (subscrição, pagamento único, freemium, …):
- **Coisas que nunca queres que a fábrica faça:**
