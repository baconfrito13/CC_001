<!-- TEMPLATE-NOTICE: Modelo gerado para products/<slug>/legal/subprocessors.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado em tratamentos de risco elevado ou receita significativa. Documento INTERNO que alimenta a secção «Quem recebe os seus dados» da Política de Privacidade e o Anexo III do DPA. Substituir todos os <…>, apagar as instruções em itálico e este comentário. -->

# Subcontratantes e destinatários — <Nome do produto>

**Versão:** <n> · **Data:** <AAAA-MM-DD> · **Reconciliado com o código em:** <AAAA-MM-DD>

> Um fornecedor entra aqui se tratar dados pessoais do produto (alojamento, base de dados, e-mail, pagamentos, monitorização, analítica, IA, apoio, armazenamento, CDN). Se estiver no código ou na arquitetura e não estiver aqui, a lista está errada. Se estiver aqui e não estiver no código, remover.

## 1. Lista

*Papel: **SC** = subcontratante (art. 28.º) · **RI** = responsável independente (ex.: instituição de pagamento para os seus deveres de AML/fraude; MoR como vendedor) — um RI é destinatário, não subcontratante.*

| Fornecedor | Serviço / finalidade | Papel | Dados tratados | Local do tratamento | Mecanismo de transferência | DPA: onde e como é aceite | Data | Estado |
|---|---|---|---|---|---|---|---|---|
| <Vercel / Cloudflare / …> | Alojamento da aplicação e CDN | SC | Pedidos HTTP, IP, registos | <UE/EUA> | <DPF + CCT> | <painel › Legal/DPA — aceitação automática ou assinatura> | <data> | <aceite / pendente HT-xx> |
| <Supabase / Neon / …> | Base de dados e autenticação | SC | Dados de conta e conteúdos | <região UE> | <n/a ou CCT> | <…> | | |
| <Resend / Postmark / …> | Envio de e-mails transacionais | SC | E-mail, nome, conteúdo da mensagem | <…> | <…> | <…> | | |
| <Stripe / Paddle / Lemon Squeezy / Polar> | Pagamentos / Merchant of Record | SC e/ou RI | Faturação, cartão (tokenizado), NIF | <…> | <…> | <termos do vendedor/MoR> | | |
| <Sentry / …> | Monitorização de erros | SC | Erros, IP, identificador de utilizador | <…> | <…> | <…> | | |
| <Plausible / Umami / …> | Analítica sem cookies | SC | Hash diário, página, país | <UE> | <n/a> | <…> | | |
| <OpenAI / Anthropic / …> | Funcionalidades de IA | SC | Entradas e saídas | <…> | <…> | <termos de API: sem treino com dados> | | |
| <Crisp / Intercom / …> | Apoio ao cliente | SC | Mensagens, e-mail | <…> | <…> | <…> | | |
| <Contabilista certificado> | Contabilidade e IVA | RI/SC | Faturas | Portugal | n/a | <acordo de serviços> | | |

## 2. Como aceitar cada DPA (tarefa do fundador, ≤ 5 minutos cada)

*Os agentes nunca aceitam contratos em nome do fundador. Para cada fornecedor indicar o caminho exato no painel e o URL do DPA (verificar na altura da execução).*

| Fornecedor | Caminho no painel | URL do DPA (verificar) | Tarefa |
|---|---|---|---|
| <…> | <Settings › Legal › DPA › Accept> | <https://…> | HT-<xx> |

## 3. Avaliação de transferências para fora do EEE

*Só para fornecedores fora do EEE. O Quadro de Privacidade UE–EUA (DPF) é válido, mas há recurso pendente (TJUE, C-703/25 P) — verificar na altura da execução.*

| Fornecedor | País | Ferramenta (DPF listado? CCT no DPA?) | Verificado em (lista DPF: https://www.dataprivacyframework.gov/list) | Dados e risco | Medidas adicionais |
|---|---|---|---|---|---|
| <…> | <EUA> | <DPF + CCT módulo 2/3> | <AAAA-MM-DD> | <dados de baixo risco; cifrados em repouso> | <região UE onde disponível; minimização> |

## 4. Critérios antes de adicionar um fornecedor

- [ ] Região UE disponível? Se não, DPF + CCT.
- [ ] DPA com as cláusulas do art. 28.º, n.º 3 e lista de subcontratantes ulteriores.
- [ ] Não usa os nossos dados para treinar modelos nem para fins próprios (analítica, IA).
- [ ] Prazos de retenção e apagamento compatíveis com a nossa política.
- [ ] Certificações (ISO 27001 / SOC 2) ou relatório de segurança público.
- [ ] Gestão de violações: aviso ≤ 48 h.
- [ ] Atualizados: RoPA, Política de Privacidade, Política de Cookies (se houver cookies), formulários das lojas, Anexo III do DPA.

## 5. Alterações

Novo fornecedor ou mudança relevante → atualizar este ficheiro e a Política de Privacidade; se existir DPA com clientes B2B, avisar com 30 dias de antecedência (direito de oposição). Registar abaixo.

| Data | Alteração | Aviso a clientes B2B | Autor |
|---|---|---|---|
| <data> | <…> | <sim/não/N/A> | legal-counsel |
