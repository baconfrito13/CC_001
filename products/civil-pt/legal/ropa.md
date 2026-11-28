<!-- TEMPLATE-NOTICE: Modelo gerado para products/civil-pt/legal/ropa.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado em tratamentos de risco elevado ou receita significativa. Documento INTERNO: não publicar nem copiar para a aplicação. Não escrever NIF, morada ou contactos reais de pessoas (ficam em env/config). -->

# Registo das atividades de tratamento (RoPA) — Rastoplan

> RGPD art. 30.º. Fonte única de verdade para a Política de Privacidade, a Política de Cookies, o DPA e (se um dia houver aplicação móvel) os formulários das lojas. Atualizar sempre que mudar um fornecedor, um campo recolhido, um SDK ou uma finalidade. A Política de Privacidade publicada (`legal/public/privacy.{pt,en}.md`) tem de coincidir, linha a linha, com a secção 2 e os prazos da secção 2.

**Versão:** 1 · **Data:** 2026-11-28 · **Origem dos dados:** `docs/04-architecture.md` (§5, §8, §12–§14), `docs/02-product.md` (§7, §9), `docs/02-business.md`, ADR 0002, 0003, 0004, 0007, 0008 e o código em `app/` (ver secção 6)

**Última reconciliação com o código:** 2026-11-28 contra `products/civil-pt/app/` **ainda incompleta** (a construção decorre em paralelo): comando da secção 6 executado; o código só tem, por agora, a starter da fábrica (Stripe, Resend, PostHog/Plausible, consentimento). Supabase, Sentry, o registo de IP e o resto do mapa estão apenas na arquitetura. **Repetir na integração** (o comando está na secção 6).

## 1. Responsável pelo tratamento (art. 30.º, n.º 1, al. a))

| Campo | Valor |
|---|---|
| Denominação / firma | Ver config `company.legalName` (entidade ainda por definir: HT-04, HT-05) |
| NIF e morada | Ver config; não copiar para o repositório além do que vai ao Aviso Legal |
| Contacto de privacidade | `contact.privacyEmail` (`privacidade@rastoplan.com` na configuração da aplicação; depende do domínio, HT-01) |
| Representante na UE (art. 27.º) | N/A — estabelecido em Portugal |
| Encarregado de proteção de dados | Não designado: o art. 37.º não se verifica (sem tratamento em grande escala de categorias especiais nem monitorização regular e sistemática em grande escala; ≈ 71 contas criadas previstas a 12 meses, `02-business.md` §8). Reavaliar se o produto passar a monitorizar o trabalho dos utilizadores ou a tratar categorias especiais |
| Autoridade de controlo | CNPD (https://www.cnpd.pt) |

## 2. Atividades de tratamento como responsável (art. 30.º, n.º 1, als. b)–g))

*Prazos concretos. Base de licitude segundo o art. 6.º do RGPD. «SC» = subcontratante, «RI» = responsável independente (destinatário, não subcontratante). Os destinatários remetem para `legal/subprocessors.md`.*

| ID | Atividade e finalidade | Titulares | Categorias de dados | Base de licitude | Destinatários | Transferência fora do EEE (salvaguarda) | Conservação | Evidência (doc/código) |
|---|---|---|---|---|---|---|---|---|
| RoPA-01 | **Contas e autenticação**: criar e gerir a conta; entrar por código de 6 dígitos (válido 10 min) ou ligação com página de confirmação | Utilizadores (profissionais) | E-mail, `profiles` (id = `auth.users.id`, idioma, papel, `frozen`, `activated_at`, data de criação), sessão (cookie `sb-…-auth-token`), `auth_attempts` (hash do e-mail normalizado, falhas, bloqueio) | Contrato (6.º/1/b) | Supabase (SC), Resend (SC; entrega do e-mail), Vercel (SC) | Supabase: SCC (DPA, módulos 2 e 3); Resend: DPF + SCC (EUA); Vercel: DPF + SCC | Conta ativa + 30 dias após encerramento (janela de exportação) e eliminação; contas sem início de sessão há 24 meses: aviso e eliminação 30 dias depois; `auth_attempts`: 24 h | `docs/04` §5, §7; US-01 |
| RoPA-02 | **Conteúdos do cliente e prestação do serviço**: guardar PDF, ler geometria, mostrar medições, gerar o mapa e a exportação em Excel | Utilizadores; terceiros mencionados nas peças (acessório) | PDF, nomes de projeto e de ficheiro, escalas, grupos e quantidades, `map_nodes`, `map_exports` (contagens), pacote de geometria | Contrato (b); quanto aos dados de terceiros nas peças, o cliente é responsável e nós SC (secção 4) | Supabase (SC: Storage e Postgres, Frankfurt), Vercel (SC: funções `fra1`) | Ver RoPA-01 (acesso de apoio do Supabase a partir de fora da UE) | Até apagar o projeto (≤ 60 s para os ficheiros) ou encerrar a conta (30 dias de exportação, depois eliminação); cópias da BD: 7 dias; Storage sem cópia | `docs/04` §5.4, §13 |
| RoPA-03 | **Utilização, saldo de folhas e métricas de produto**: lotes e reservas, estado e duração do processamento, resposta à pergunta de confiança, métricas da BD sem PII (empresas pagantes com mapa exportado, devoluções, raster) | Utilizadores | `sheet_lots`, `sheet_reservations`, `sheets`, `trust_checks`, `subscriptions`, eventos de servidor sem identificar a pessoa | Contrato (b) para o saldo; interesse legítimo (f) para as métricas (ver §3) | Supabase (SC) | Ver RoPA-01 | Enquanto a conta existir (cascata ao apagar); depois só contagens agregadas | `docs/04` §12; ADR 0007 |
| RoPA-04 | **Pagamentos e faturação**: Checkout, subscrições, reembolsos, disputas, faturas e IVA | Clientes (empresas e empresários em nome individual) | `billing_customers.stripe_customer_id`, `purchases` (valor, IVA, data, estado, `stripe_ref`; **sem NIF**); no Stripe: nome/firma, morada de faturação, NIF-IVA, e-mail, cartão (tokenizado); na fatura: nome, NIF, morada | Contrato (b); obrigação legal (c) (faturação e contabilidade) | Stripe (SC e RI), contabilista certificado e programa de faturação/Portal das Finanças (RI), AT | Stripe: SCC + DPF (DPA de 2026-09-28); contabilista e AT: Portugal | Faturas e registos contabilísticos: 10 anos (CIVA art. 52.º; confirmar com o contabilista). `purchases.user_id` fica `NULL` ao apagar a conta | `docs/04` §5, §14; ADR 0004 |
| RoPA-05 | **E-mails de serviço e apoio**: códigos de acesso, avisos de pagamento e de quota, correspondência de apoio | Utilizadores | E-mail, nome (se o indicar), conteúdo da mensagem, estado de entrega | Contrato (b); interesse legítimo em apoio de qualidade (f) | Resend (SC), fornecedor da caixa de correio (SC; por definir, HT-05) | Resend: DPF + SCC (EUA, tratamento principal) | Registo de entrega: ≤ 30 dias. Correspondência de apoio: 24 meses após encerrar | `docs/04` §8, §14 |
| RoPA-06 | **Segurança e prevenção de abuso**: limites de pedidos, máximo de contas de avaliação por IP e por e-mail, bloqueio por tentativas, registos do servidor | Visitantes e utilizadores | HMAC do IP com sal (24 h), `rate_limits` (1 h), `auth_attempts` (24 h), `trial_grants` (HMAC do e-mail normalizado), registos da Vercel (IP incluído; sem e-mail, sem nomes de projeto/ficheiro) | Interesse legítimo (f) (ver §3) | Supabase (SC), Vercel (SC) | Ver RoPA-01 | HMAC de IP e `auth_attempts`: 24 h; `rate_limits`: 1 h; **`trial_grants`: conta + 12 meses após eliminar (a implementar)**; registos do servidor: ≤ 30 dias | `docs/04` §7, §12, §13 |
| RoPA-07 | **Erros e diagnóstico** | Visitantes e utilizadores | Pilha de chamadas, identificador abreviado (hash) da conta, navegador. Sem e-mail, sem nomes de projeto/ficheiro, sem IP guardado (a configurar) | Interesse legítimo (f) (ver §3) | Sentry (SC; armazenamento na UE, Frankfurt) | Sentry: DPF + SCC (EUA) | 30 dias | `docs/04` §12; SR-09 |
| RoPA-08 | **Estatísticas de utilização do site e da aplicação** | Visitantes e utilizadores que aceitem | Identificador pseudónimo (id interno ou aleatório), página, eventos do dicionário `docs/04` §12, país aproximado; **IP não guardado** | Consentimento (a) + art. 5.º, n.º 3 ePrivacy / Lei 41/2004 art. 5.º | PostHog (SC; nuvem da UE, Frankfurt) | PostHog: SCC (DPA via gerador; empresa nos EUA) | ≤ 14 meses (configurar no projeto PostHog) | `app/src/components/Analytics.tsx`; ADR 0007 |
| RoPA-09 | **Pedidos de demonstração (lista de espera)** | Visitantes | E-mail, idioma, data/hora do consentimento, origem | Consentimento (a) | Resend (SC: contactos/segmento) | Resend: DPF + SCC | Até retirar o consentimento; revisão anual e eliminação de contactos sem interação há > 24 meses | `app/src/lib/waitlist/*`; `docs/04` §14 |
| RoPA-10 | **Prospecção comercial B2B** (envio manual pelo fundador, só a pessoas coletivas): registo de contactos profissionais | Profissionais de empresas de construção e gabinetes | Nome, cargo, empresa, e-mail ou perfil profissional (fontes públicas) e resultado do contacto | Interesse legítimo (f) (ver §3); art. 14.º RGPD (informação no primeiro contacto) | Ferramenta de registo do fundador (por definir; pasta privada) | A definir (se SaaS: acrescentar a `subprocessors.md`) | 12 meses sem resposta, ou até oposição; oposição: apenas o endereço, 5 anos | `docs/02-product.md` R3, §8 |
| RoPA-11 | **Pedidos de titulares, violações e provas** | Qualquer titular | Identificação, pedido, resposta; descrição e avaliação do incidente | Obrigação legal (c) e interesse legítimo (f) | — | — | 3 anos | §7 deste ficheiro |
| RoPA-12 | **Registo da escolha de cookies** (no dispositivo) | Visitantes | Decisão (`granted`/`denied`) e data/hora | Obrigação legal (c): demonstrar o consentimento (art. 7.º/1 RGPD) | — (só no dispositivo do visitante) | — | 180 dias (`CONSENT_MAX_AGE_SECONDS`) | `app/src/lib/consent.ts` |

**Eventos do servidor que não identificam a pessoa** (compras, falhas de processamento, ativação): enviados com `$process_person_profile: false` e identificador aleatório por evento; não são dados pessoais e não precisam de consentimento. Se algum dia levarem um identificador estável, passam a RoPA-08.

## 3. Interesse legítimo — avaliações de ponderação (art. 6.º, n.º 1, al. f))

| Atividade | Interesse prosseguido | Necessidade (alternativa menos intrusiva?) | Ponderação (expectativas razoáveis, impacto, salvaguardas) | Conclusão |
|---|---|---|---|---|
| RoPA-03 (métricas) | Saber se o produto cumpre a sua promessa (norte, ativação, devoluções) e decidir manter, mudar ou encerrar o produto, sem depender do consentimento de cookies | Vistas SQL sobre dados que já existem para o contrato; só contagens agregadas; nenhum dado novo recolhido | O utilizador espera que uma empresa meça a utilização do seu serviço; impacto mínimo (sem decisões sobre pessoas, sem perfis, sem terceiros); direito de oposição em `contact.privacyEmail` | Válido |
| RoPA-06 (abuso) | Proteger o serviço, as contas e os custos contra abusos e contas de avaliação em massa | Não há alternativa menos intrusiva eficaz (CAPTCHA só como plano B, `TURNSTILE_ENABLED`); IP só como HMAC com sal por 24 h; e-mail só como HMAC | Expectável num serviço com avaliação gratuita; impacto baixo; retenção mínima (24 h; 12 meses após eliminar para o código da avaliação) | Válido |
| RoPA-07 (erros) | Detetar e corrigir falhas que afetam o serviço | Relatório sem e-mail nem nomes; id abreviado; `beforeSend` a remover campos; sem traços de desempenho | Expectável; dados mínimos; 30 dias | Válido, **condicionado** a `sendDefaultPii=false` e a não guardar o IP (ver §6) |
| RoPA-10 (prospecção) | Dar a conhecer o produto a ≈ 1 500 empresas nomeáveis do setor, onde o fundador não tem audiência (`02-business.md` §1) | Contacto manual, personalizado, de baixo volume (≈ 600 por ano), a endereços profissionais, só a pessoas coletivas; não há alternativa menos intrusiva com o mesmo alcance (o consentimento prévio é impossível sem contacto) | Contactos profissionais em contexto profissional; o titular pode esperar ser abordado por fornecedores do setor; impacto baixo; salvaguardas: informação do art. 14.º no primeiro contacto (quem somos, fonte, como recusar), oposição imediata, lista de supressão, nada de categorias especiais, sem partilha | Válido, **condicionado** à regra da GTM: só pessoas coletivas, ligação de recusa, consulta da lista de oposição da DGC (Lei 41/2004 art. 13.º-A, a verificar no texto consolidado) |

## 4. Registo como subcontratante (art. 30.º, n.º 2) — o produto tem `processor-role`

Os clientes carregam peças desenhadas que podem conter, de forma acessória, dados pessoais de terceiros (nome e assinatura de projetistas e técnicos no carimbo, nomes de donos de obra, contactos). Não extraímos texto das peças no MVP (a leitura da legenda é US-17, *Should*, e só lê texto vetorial para sugerir designações).

| Categoria de cliente (responsável) | Categorias de tratamento | Transferências fora do EEE | Medidas de segurança | DPA |
|---|---|---|---|---|
| Empresas e profissionais de construção (empreiteiros, subempreiteiros, medidores, gabinetes) | Armazenar o PDF, ler a geometria no servidor, guardar o pacote de geometria e os resultados, apresentar ao cliente e exportar; eliminação a pedido | Acesso de apoio/operação do Supabase a partir de fora da UE (SCC); o resto na UE (Frankfurt) | Secção 5 | `legal/dpa.md` (incorporado nos Termos, secção 11) |

## 5. Medidas técnicas e organizativas (art. 32.º) — estado

*«Previsto» = exigido pela arquitetura (SR-xx) e ainda por verificar em QA (`docs/06-qa-report.md` não existe). A Política de Privacidade (secção 8) só afirma o que está aqui; se a auditoria de segurança mudar um controlo, corrigir a política.*

- [x] Cifragem em trânsito (HTTPS/HSTS) e em repouso pelos prestadores (Vercel, Supabase) — previsto
- [x] Isolamento entre contas (RLS em todas as tabelas; teste A↛B por tabela e por *bucket*; SR-01) — previsto
- [x] *Buckets* privados; URL assinados ≤ 600 s; caminhos gerados pelo servidor (SR-11) — previsto
- [x] Autenticação por código de uso único; 5 falhas → bloqueio 15 min e rotação do código; resposta uniforme (SR-06) — previsto
- [x] Segredos só em variáveis de ambiente; chave de serviço só em módulos `server-only` (SR-07) — previsto
- [x] Separação de ambientes (previews com projeto Supabase de desenvolvimento; produção separada) — previsto
- [x] Registos sem e-mail nem nomes de projeto/ficheiro; Sentry sem PII (SR-09) — previsto
- [x] Cópias de segurança diárias da BD (7 dias; sem PITR); Storage sem cópia — previsto
- [x] Limites de ficheiro e páginas aplicados no servidor; limites de pedidos (SR-04, T-07) — previsto
- [ ] MFA para administração: não aplicável no MVP (sem UI de administração; acesso à chave de serviço limitado ao fundador)
- [ ] Procedimento de violações (72 h) — runbook em `docs/09-launch.md` (a escrever); registo na secção 7
- [ ] Gestão de vulnerabilidades: `npm audit`, Dependabot, versões exatas (T-09) — previsto na CI
- [ ] Formação/consciencialização do fundador — nota no runbook de lançamento

## 6. Reconciliação com o código

Comando (Passo 2b do playbook), a repetir na integração, com o resultado de 2026-11-28 (a aplicação estava a ser construída):

```bash
cd products/civil-pt
rg -n -i --no-heading -g '!node_modules' -g '!*lock*' -g '!.next' -g '!test-results' '(stripe|paddle|lemonsqueezy|polar\.sh|resend|postmark|sendgrid|mailgun|mailchimp|brevo|supabase|firebase|clerk|auth0|sentry|posthog|plausible|umami|matomo|gtag|googletagmanager|google-analytics|fbq\(|hotjar|clarity\.ms|intercom|crisp\.chat|zendesk|openai|anthropic|@vercel/analytics|speed-insights|recaptcha|hcaptcha|turnstile|mapbox|fonts\.googleapis|fonts\.gstatic|youtube|vimeo|twilio|upstash|cloudinary|uploadthing)' app docs/04-architecture.md
rg -n '^[A-Z][A-Z0-9_]+=' app/.env.example
rg -n -i 'localStorage|sessionStorage|document\.cookie|set-cookie|cookies\(\)|indexedDB' app/src
rg -n -i 'type="(email|tel|password)"|name="(email|phone|address|birth)"' app/src
```

| Achado (SDK / variável de ambiente / cookie / campo) | Onde | Atividade RoPA | Fornecedor | Estado |
|---|---|---|---|---|
| `stripe` 23.2.0, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, webhook e checkout | `app/src/lib/{stripe,checkout,stripe-webhook}.ts`, `app/.env.example` | RoPA-04 | Stripe | Coberto |
| `resend` 6.41.0, `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `RESEND_FROM` (lista de espera) | `app/src/lib/waitlist/adapters.ts` | RoPA-09 (e RoPA-05 quando houver e-mails de serviço) | Resend | Coberto |
| `WAITLIST_WEBHOOK_URL`, `WITHDRAWAL_WEBHOOK_URL` (webhook genérico) | `app/src/lib/{waitlist,withdrawal}/adapters.ts` | — | Qualquer ponto HTTPS (Zapier, Make…) | **Corrigir/vigiar:** têm de ficar vazias em produção; se alguma for usada, acrescentar o fornecedor a `subprocessors.md` e à Política de Privacidade antes |
| `posthog` (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`), `person_profiles: "identified_only"` | `app/src/components/Analytics.tsx` | RoPA-08 | PostHog | Coberto, **condicionado** a `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` e a «descartar IP do cliente» no projeto |
| `plausible` (`NEXT_PUBLIC_PLAUSIBLE_*`, `NEXT_PUBLIC_ANALYTICS_COOKIELESS`) | `app/src/components/Analytics.tsx`, `app/src/config/site.ts` | — | Plausible | **Não usado:** `NEXT_PUBLIC_ANALYTICS_PROVIDER` tem de ser `posthog` (ou `none`); com `plausible` há um fornecedor não declarado |
| `localStorage` e cookie `consent` (180 dias) | `app/src/lib/consent.ts`, `app/src/components/CookieConsent.tsx` | RoPA-12 | — | Coberto (página de cookies) |
| Cookie `sb-…-auth-token`; `@supabase/*`; `SUPABASE_*` | — (WP-01/02 por construir) | RoPA-01, 02, 03, 06 | Supabase | **A reconciliar na integração**; configurar `maxAge` do cookie de sessão a 30 dias (a página de cookies diz «até 30 dias») |
| `@sentry/nextjs`, `SENTRY_DSN` | — (WP-09 por construir) | RoPA-07 | Sentry | **A reconciliar**; `sendDefaultPii=false`, sem IP, `beforeSend` sem e-mail/nomes |
| `HASH_SALT`, `rate_limits`, `auth_attempts`, `signup_ip_daily`, `trial_grants` | — (WP-01/02 por construir) | RoPA-06 | Supabase | **A reconciliar**; implementar o *job* de purga (24 h/1 h) e a retenção de `trial_grants` (conta + 12 meses) |
| `@anthropic-ai/sdk`, `ANTHROPIC_API_KEY` | — (dormente, ADR 0008) | — | Anthropic | **Tem de continuar ausente** (a página de privacidade diz que não há IA); se aparecer: parar e rever `legal/ai-act-note.md` |
| `turnstile` (Cloudflare) | — (dormente, `TURNSTILE_ENABLED=false`) | — | Cloudflare | **Tem de continuar desligado**; se for ativado, acrescentar à Política de Privacidade e à de Cookies |
| Campos `type="email"` | Formulário da lista de espera e página de entrada | RoPA-01, 09 | — | Coberto (só o e-mail; o consentimento da lista de espera é uma caixa não pré-marcada) |

## 7. Registos operacionais

**Pedidos de titulares (arts. 12.º–22.º):**

| Data | Direito | Titular (id interno) | Prazo (1 mês) | Resposta | Fecho |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

**Violações (art. 33.º, n.º 5):** conservar 3 anos.

| Data de conhecimento | Descrição | Dados e titulares afetados | Risco | Notificação à CNPD (≤ 72 h) | Comunicação aos titulares | Medidas |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

**Simulacro de pedido de acesso e de apagamento** (DSR drill): por fazer na integração, com o *runbook* `scripts/erase-user.ts` (`docs/04` §5.4): criar uma conta de teste, carregar um PDF, comprar com o Stripe de teste, pedir o apagamento e confirmar que (i) `auth.users`, projetos, ficheiros e lotes desaparecem, (ii) `purchases.user_id` fica `NULL`, (iii) o cliente Stripe é apagado ou anonimizado, (iv) o `trial_grants` mantém só o HMAC pelo prazo previsto.

## 8. Histórico de alterações

| Versão | Data | Alteração | Motivo | Autor |
|---|---|---|---|---|
| 1 | 2026-11-28 | Criação a partir de `docs/04-architecture.md` e do código parcial de `app/` | Fase `legal` | legal-counsel |
