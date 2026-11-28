<!-- TEMPLATE-NOTICE: Modelo gerado para products/civil-pt/legal/subprocessors.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado em tratamentos de risco elevado ou receita significativa. Documento INTERNO que alimenta a secção «Quem recebe os seus dados» da Política de Privacidade e o Anexo III do DPA. -->

# Subcontratantes e destinatários — Rastoplan

**Versão:** 1 · **Data:** 2026-11-28 · **Reconciliado com o código em:** 2026-11-28 (parcial: a construção decorre; Supabase e Sentry ainda não estão no código; ver `legal/ropa.md` §6)

> Um fornecedor entra aqui se tratar dados pessoais do produto. Se estiver no código ou na arquitetura e não estiver aqui, a lista está errada; se estiver aqui e não estiver no código, remover. Fontes dos factos de cada linha: páginas oficiais dos fornecedores lidas em **2026-11-28** (URL na secção 2); transferências e DPF: secção 3.

## 1. Lista

*Papel: **SC** = subcontratante (art. 28.º) · **RI** = responsável independente (destinatário, não subcontratante).*

| Fornecedor | Serviço / finalidade | Papel | Dados tratados | Local do tratamento | Mecanismo de transferência | DPA: onde e como é aceite | Data | Estado |
|---|---|---|---|---|---|---|---|---|
| **Supabase Pte. Ltd.** (Singapura; apoio e operação: Supabase, Inc., EUA) | Autenticação, base de dados Postgres, armazenamento de ficheiros (região Central EU, Frankfurt, sobre AWS) | SC | E-mail, perfis, projetos, ficheiros PDF, geometria, lotes, compras (sem NIF), contadores de abuso | Frankfurt (BD, Auth, Storage e cópias); apoio, faturação da conta e telemetria fora da região | SCC (módulos 2 e 3) no DPA; não se baseia no DPF | DPA v1 (2026-08-01) faz parte dos Termos de Serviço; aceitar os Termos ao criar a conta equivale a assinar as SCC (cláusula 12.2) | a registar na criação da conta (HT-07) | Pendente |
| **Vercel Inc.** (EUA) | Alojamento, funções (`fra1`, Frankfurt), *cron*, registos técnicos | SC | Pedidos HTTP, IP, cabeçalhos, registos (≤ 30 dias, sem e-mail nem nomes) | Frankfurt (funções); empresa nos EUA | DPF (ativo, lista oficial) + SCC (Anexo 3 do DPA) | DPA (atualizado 2026-03-17, em vigor 2026-03-31) integrado no contrato; as SCC consideram-se assinadas ao aceitar os termos. Subcontratantes ulteriores: https://security.vercel.com | a registar na criação do plano Pro (HT-07) | Pendente |
| **Stripe** (Stripe Payments Europe, Limited, Irlanda, para clientes do EEE; Stripe, LLC, EUA) | Checkout, Billing, Customer Portal, prevenção de fraude | **SC** (serviços de pagamento prestados por nossa conta) e **RI** (obrigações próprias: fraude, AML/KYC, melhoria do produto) | Nome/firma, morada de faturação, NIF-IVA, e-mail, cartão (só no Stripe; nunca toca no nosso servidor, SAQ A), valor, IVA, estado | UE e EUA | SCC (módulos 1, 2, 3 do DPA) + DPF (Stripe, LLC: ativo na lista oficial) | DPA (2026-09-28) incorporado no Contrato de Serviços do Stripe; aceite ao ativar a conta | a registar na ativação (HT-07) | Pendente |
| **Resend** (Plus Five Five, Inc., EUA) | Envio de e-mail: códigos de acesso (SMTP do Supabase Auth), avisos, lista de espera (contactos) | SC | E-mail, nome (se existir), conteúdo (código), estado de entrega | **Estados Unidos** (tratamento principal, DPA §6.1) | DPF (declarado pelo fornecedor, DPA §11.1) + SCC (DPA §6.2) | DPA (atualizado 2025-12-31) incorporado nos Termos; versão executada disponível no painel | a registar na criação da conta (HT-07) | Pendente |
| **PostHog, Inc.** (EUA), nuvem UE | Estatísticas de utilização, **só após consentimento** | SC | Identificador pseudónimo, página, eventos, país aproximado (IP não guardado) | Frankfurt (AWS eu-central-1; instância UE independente da dos EUA) | SCC (módulo 2; manual de segurança do fornecedor) — DPF não verificado | DPA pelo gerador https://posthog.com/dpa: o fornecedor envia o documento por PandaDoc em ≈ 24 h; **o fundador assina** | — | **Pendente (HT-08)** |
| **Functional Software, Inc.** («Sentry», EUA) | Monitorização de erros | SC | Pilha de chamadas, hash do id da conta, navegador (sem e-mail, nomes, IP) | Frankfurt (região «Germany/EU»; imutável após criar a organização) | DPF (mecanismo principal no DPA) + SCC (Anexo 3) — registo na lista DPF não verificado | https://sentry.io/legal/dpa/ — aceitação eletrónica (opt-in) na conta; **o fundador aceita** | — | **Pendente (HT-08)** |
| **Fornecedor da caixa de correio do domínio** (a escolher: Google Workspace, Zoho, …) | Caixas `ola@`, `apoio@`, `privacidade@` (correspondência de apoio e pedidos de titulares) | SC | E-mails e anexos | A definir (UE preferível) | A definir | A definir na escolha (tarefa B de `02-business.md` §13 pergunta o custo) | — | **Por escolher (HT-05)** |
| **Contabilista certificado** | Contabilidade, IVA, declarações | RI | Faturas (nome/firma, NIF, morada, valores) | Portugal | n/a | Acordo de prestação de serviços | — | Por escolher (HT-04) |
| **Autoridade Tributária e Aduaneira / Portal das Finanças** (ou programa de faturação certificado) | Faturação e comunicação de faturas, ATCUD | RI (obrigação legal) | Faturas | Portugal | n/a | Termos do Portal ou do programa escolhido | — | Por decidir (HT-04) |
| **Ferramenta de registo de contactos do fundador** (prospecção, RoPA-10) | Guardar contactos profissionais e resultado dos contactos | SC (se for SaaS) | Contactos profissionais | A definir | A definir | A definir; o `gtm` decide e atualiza este ficheiro | — | Por decidir (`gtm`) |
| *Dormente:* **Anthropic** | Sugestões de IA (US-07) | — | — | — | — | **Não está ativo e não consta da Política de Privacidade.** Só entra se o gatilho de US-07 disparar (ADR 0008), antes de ativar | — | Dormente |
| *Dormente:* **Cloudflare Turnstile** | CAPTCHA anti-abuso | — | — | — | — | `TURNSTILE_ENABLED=false`; só se a taxa de contas de avaliação suspeitas passar o limiar | — | Dormente |

Não tratam dados pessoais do produto (não constam): monitor de disponibilidade em `/api/health` (tarefa «I» da arquitetura; não recebe dados pessoais), GitHub (código sem dados pessoais).

## 2. Como aceitar cada DPA (tarefas do fundador, ≤ 5 minutos cada)

*Os agentes nunca aceitam contratos em nome do fundador. O caminho exato no painel muda: verificar na altura (HT-07 e HT-08 listam os passos).*

| Fornecedor | Como se aceita | URL do DPA / lista de subcontratantes (lidos em 2026-11-28) | Tarefa |
|---|---|---|---|
| Supabase | Ao aceitar os Termos de Serviço ao criar a conta (o DPA e as SCC fazem parte deles); guardar uma cópia | https://supabase.com/legal/dpa · https://supabase.com/legal/customer-resources/subprocessor-list | HT-07 |
| Vercel | Ao aceitar os termos do plano Pro; guardar uma cópia | https://vercel.com/legal/dpa · https://security.vercel.com | HT-07 |
| Stripe | Ao ativar a conta (Contrato de Serviços + DPA incorporado) | https://stripe.com/legal/dpa | HT-07 |
| Resend | Ao aceitar os Termos ao criar a conta; versão executada no painel | https://resend.com/legal/dpa · https://resend.com/legal/subprocessors | HT-07 |
| PostHog | Gerar e assinar o DPA (PandaDoc) | https://posthog.com/dpa · https://posthog.com/subprocessors | HT-08 |
| Sentry | Aceitar o DPA eletronicamente (instruções na própria página) | https://sentry.io/legal/dpa/ · https://sentry.io/legal/subprocessors/ | HT-08 |

## 3. Avaliação de transferências para fora do EEE

*Quadro de Privacidade UE–EUA (DPF): decisão de adequação de 10-07-2023, validada pelo Tribunal Geral (acórdão de 03-09-2025, T-553/23); recurso pendente no TJUE (C-703/25 P, Latombe; sem acórdão a 2026-11-28, fonte secundária) — repetir antes de relevar qualquer fornecedor só com DPF. Lista: https://www.dataprivacyframework.gov/list (pesquisa feita por motor de busca em 2026-11-28; a lista oficial é dinâmica).*

| Fornecedor | País | Ferramenta | Verificado em | Dados e risco | Medidas adicionais |
|---|---|---|---|---|---|
| Supabase Pte. Ltd. / Supabase, Inc. | Singapura / EUA (acesso de apoio) | SCC (módulos 2 e 3) + Avaliação de Impacto da Transferência (TIA) publicada pelo fornecedor; DPF não invocado | 2026-11-28 (DPA v1 de 2026-08-01 e FAQ de residência) | Dados alojados em Frankfurt; acesso de apoio só quando pedido ou em incidente de segurança, registado e limitado ao projeto. Peças confidenciais dos clientes: **risco médio-baixo** | Região UE; RLS; chaves de serviço só no servidor; pedir apoio sem anexar PDF; cópia da TIA arquivada na integração |
| Vercel Inc. | EUA | DPF (**ativo** segundo pesquisa: certificação de 2019, próxima 2027-04-29, FTC) + SCC | 2026-11-28 (resultado de pesquisa; confirmar na lista oficial) | Pedidos HTTP e registos técnicos sem e-mail; funções em `fra1`. Risco baixo | Registos sem PII (SR-09); região `fra1` |
| Stripe, LLC / Stripe Payments Europe, Ltd. | EUA / Irlanda | SCC (módulos 1, 2, 3) + DPF (Stripe, LLC **ativo**, via pesquisa; a entidade certificada tem de ser confirmada na lista) | 2026-11-28 | Dados de faturação e pagamento; cartão só no Stripe. Risco baixo | Nunca guardar NIF nem cartão no nosso sistema |
| Plus Five Five, Inc. (Resend) | EUA | DPF (declarado pelo fornecedor; **não confirmado na lista oficial**) + SCC | 2026-11-28 (DPA) | E-mail do utilizador e código de acesso (validade 10 min). Risco baixo | Códigos de uso único, curtos e invalidados após uso; enviar o mínimo de conteúdo; domínio próprio com SPF/DKIM/DMARC |
| PostHog, Inc. | EUA (instância UE em Frankfurt) | SCC (módulo 2); DPF não verificado | 2026-11-28 | Pseudónimos e eventos, só após consentimento; IP não guardado (configuração do projeto). Risco baixo | Instância UE; `person_profiles: identified_only`; nunca e-mail nem nomes em eventos |
| Functional Software, Inc. (Sentry) | EUA (armazenamento em Frankfurt) | DPF (invocado pelo DPA; **não confirmado na lista oficial**) + SCC | 2026-11-28 | Erros sem PII. Risco baixo | Região UE (imutável); `sendDefaultPii=false`; `beforeSend` |

**Nota de transferência (uma por fornecedor norte-americano; sem ação adicional enquanto a Comissão/EDPB não mudarem de posição):** os dados enviados aos fornecedores dos EUA são, por desenho, de baixo risco (identificadores pseudónimos, e-mail, estado técnico); as peças dos clientes ficam em Frankfurt e só são acessíveis ao Supabase em apoio ou incidente. Se o DPF for anulado, o Supabase, o Stripe, o Resend, o Sentry e o Vercel continuam cobertos pelas SCC dos respetivos DPA; o PostHog (SCC) também. Plano B para a analítica: desligar o PostHog (o produto não depende dela, `docs/04` §8).

## 4. Critérios antes de adicionar um fornecedor

- [ ] Região UE disponível? Se não, DPF + SCC.
- [ ] DPA com as cláusulas do art. 28.º, n.º 3 e lista de subcontratantes ulteriores.
- [ ] Não usa os nossos dados para treinar modelos nem para fins próprios (analítica, IA).
- [ ] Prazos de retenção e apagamento compatíveis com a nossa política.
- [ ] Certificações (ISO 27001 / SOC 2) ou relatório de segurança público.
- [ ] Gestão de violações: aviso ≤ 48 h (DPA com clientes, `legal/dpa.md` §8).
- [ ] Atualizados: RoPA, Política de Privacidade, Política de Cookies (se houver cookies), Anexo III do DPA.

## 5. Alterações

Novo fornecedor ou mudança relevante → atualizar este ficheiro, o RoPA e a Política de Privacidade; **avisar os clientes com 30 dias de antecedência** (o DPA, secção 6.2, dá-lhes direito de oposição).

| Data | Alteração | Aviso a clientes B2B | Autor |
|---|---|---|---|
| 2026-11-28 | Criação | N/A (sem clientes) | legal-counsel |
