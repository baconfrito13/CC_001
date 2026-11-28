<!-- TEMPLATE-NOTICE: gerado para products/civil-pt/docs/07-compliance.md. Não constitui aconselhamento jurídico; rascunhos e registos preparados por um agente; recomenda-se revisão por advogado em tratamentos de risco elevado ou receita significativa. Não colocar NIF, morada ou telefone reais neste ficheiro (ficam em env/config). -->

# Conformidade legal — Rastoplan

**Produto:** `civil-pt` · **Fase:** 07 `legal` · **Profundidade:** standard · **Data:** 2026-11-28 · **Versão:** 1 · **Checklist:** `factory/checklists/legal-eu-pt.md` (verificada em 2026-10-08; os factos voláteis foram reverificados a 2026-11-28, secção 6)

> Rascunhos e registos preparados por um agente; não substituem aconselhamento jurídico. Revisão por advogado recomendada quando se verifique algum dos gatilhos da secção 7. **Nada neste produto é «certificado» ou «em conformidade com o RGPD»:** o que se pode dizer é que os registos estão feitos e que cada lacuna tem dono (secção 5).

## 0. Estado em resumo

- **Páginas públicas:** 4 documentos × 2 idiomas (`pt` = pt-PT, `en`) em `legal/public/`: Política de Privacidade, Termos e Condições, Política de Cookies e Aviso Legal. **A página «Direito de Livre Resolução» não existe de propósito** (produto só B2B; secção 1, pressuposto 3). A verificação de publicação do playbook (sem `FILL`, sem comentários, só chaves permitidas) não imprime nada.
- **Registos internos:** `legal/ropa.md`, `legal/subprocessors.md`, `legal/dpia-screening.md` (AIPD **não** necessária, 0 critérios), `legal/ai-act-note.md` (o MVP **não** é sistema de IA), `legal/dpa.md` (o produto tem papel de subcontratante), `legal/trademark-check.md` (**amarelo**).
- **Itens da checklist:** ver contagem no fim da secção 3. **Em falta:** só o que depende do fundador (identidade e IVA, Livro de Reclamações, aceitação dos DPA) e a verificação em QA/integração.
- **Lacunas de maior risco:** (1) sem entidade legal e sem regime de IVA definidos não se pode cobrar (HT-04, HT-05); (2) Livro de Reclamações por registar (HT-06); (3) DPA dos fornecedores por aceitar/assinar (HT-07, HT-08); (4) o código ainda não tem Supabase nem Sentry: reconciliar a análise do código na integração; (5) a marca está **amarela** (TMview e INPI por consultar, HT-03); (6) cláusulas B2B de responsabilidade, Data Act e DSA sem revisão de advogado (HT-09, recomendada).

## 1. Classificação do produto

| Sinalizador | Valor | Notas / fonte |
|---|---|---|
| Clientes (`b2c` / `b2b`) | **Só `b2b`**: empresas e profissionais (empreiteiros, subempreiteiros, medidores, gabinetes). Sem consumidores | `docs/00-brief.md` §4; `docs/02-business.md` §4 (declaração «atuo a título profissional» e NIF-IVA no checkout); `docs/04-architecture.md` §16 (`legal.sellsToConsumers: false`) |
| Venda de produtos/serviços (`sells`) | **Sim**: Passes (pagamento único, 20/60/150 folhas, 90 dias) e subscrições mensais (Independente, Empresa, Gabinete). **Stripe direto**, sem Merchant of Record; o fundador é o vendedor | ADR 0004; `docs/02-business.md` §3–§5 |
| Papel de subcontratante (`processor-role`) | **Sim**, quanto aos dados pessoais acessórios nas peças carregadas (nomes e assinaturas em carimbos). Não extraímos o texto no MVP | `docs/04-architecture.md` §14; `legal/dpa.md`; `legal/ropa.md` §4 |
| Conteúdo gerado por utilizadores (`ugc`) | **Não** difundido: cada conta só vê os seus ficheiros. Tecnicamente é um **serviço de alojamento** (armazena informação a pedido do destinatário, DSA art. 3.º, al. g), iii)) e **não** é uma plataforma em linha (art. 3.º, al. i): exige difundir ao público). Aplicam-se, por prudência, os deveres mínimos de alojamento (secção 9) | https://www.eu-digital-services-act.com/Digital_Services_Act_Article_3.html (espelho de terceiros, 2026-11-28) |
| IA (`ai`) | **Não no MVP.** US-07 está dormente (ADR 0008); o motor é geometria determinística, fora do âmbito do Regulamento da IA | `legal/ai-act-note.md` |
| Dados especiais (`special-data`) | **Não**. Sem saúde, finanças pessoais, menores, biometria ou localização. As peças são confidenciais para o negócio, não são dados de categorias especiais | `legal/dpia-screening.md` |
| Crianças (`kids`) | **Não dirigido**; idade mínima 18 anos (produto pago e B2B). Art. 8.º RGPD em Portugal: 13 anos (Lei 58/2019 art. 16.º) | Termos §2; Privacidade §10 |
| App / extensão / desktop (`app`) | **Não**: aplicação web (sem aplicação móvel; PRD §5.5) | `docs/04-architecture.md` §2 |
| Rastreio (`tracking`) | **Banner de consentimento** para estatísticas do PostHog UE; só armazenamento estritamente necessário antes do consentimento. Desvio ao «sem banner por desenho» do playbook, justificado no ADR 0007 (funil de produto grátis ≤ 1 M eventos; Plausible custaria $9/mês e consumiria a folga de €8). Métricas de decisão (norte, ativação, devoluções) saem da BD sem consentimento | ADR 0007; `app/src/components/Analytics.tsx` |
| Atividade regulada (`regulated`) | **Não** (software de medição; não é aconselhamento técnico nem jurídico: os Termos dizem-no) | Termos §9 |

**Pressupostos assumidos** (cada um é reversível):

1. **Entidade jurídica ainda não existe** (`FOUNDER.md` vazio). As páginas usam as chaves `company.*`, preenchidas na configuração depois de HT-04/HT-05. Forma (ENI/trabalhador independente ou Unipessoal Lda) e regime de IVA (isento do art. 53.º do CIVA ou normal) decidem-se com o contabilista; nenhuma página escreve nada sobre IVA além de «sem IVA / IVA conforme a lei» (o `TAX_MODE` é configurável).
2. **Controlador:** a entidade do fundador. **Sem encarregado de proteção de dados** (art. 37.º RGPD não se verifica); o contacto de privacidade é `contact.privacyEmail`.
3. **Só B2B.** Não se vende a consumidores; o checkout recolhe NIF-IVA e uma declaração de atuação profissional; a **avaliação gratuita** (5 folhas, sem cartão) está aberta a qualquer e-mail, mas os Termos exigem uso profissional e 18 anos. **A página «Direito de Livre Resolução» e a função «Resolver o contrato aqui» não se publicam** (`legal.sellsToConsumers: false`; DL 24/2014 e art. 11.º-A da Dir. 2011/83/UE só se aplicam a consumidores); o reembolso de 14 dias na primeira compra é **cortesia comercial** escrita uma só vez nos Termos §4 e repetida na página de preços e no checkout (secção 4). *Risco residual aceite:* um consumidor que declare falsamente uso profissional; os Termos mantêm os direitos imperativos e o reembolso de 14 dias aproxima-se do regime legal (integral sem uso; proporcional com uso).
4. **RAL:** sem adesão a nenhuma entidade e **sem menção** (o dever de informar da Lei 144/2015 art. 18.º é para litígios de consumo). A ligação ao Livro de Reclamações mantém-se. **Nunca** se menciona a plataforma ODR (encerrada em 20-07-2025).
5. **Stripe direto, sem MoR** (ADR 0004); Paddle como recurso. Sem OSS (não há vendas B2C); vendas a empresas da UE com NIF-IVA válido: autoliquidação (a confirmar com o contabilista).
6. **Idade mínima 18** (produto pago e profissional), em vez de 16.
7. **Retenções** (iguais no RoPA e na Política de Privacidade): conta ativa + 30 dias (exportação) e eliminação; contas inativas 24 meses; registos do servidor ≤ 30 dias (mais curto do que os 90 dias por defeito do playbook, como no `docs/04` §13); cópias da BD 7 dias (mais curto do que os 35 do defeito; sem PITR); faturas 10 anos; apoio 24 meses; estatísticas ≤ 14 meses; abuso 24 h/1 h; código da avaliação gratuita até 12 meses após eliminar a conta (a implementar); prova de oposição 5 anos; pedidos de titulares 3 anos.
8. **Preços fora dos Termos** (nem tabelas nem valores): para não divergirem da página de preços e do Stripe, e porque o plano de teste de preços (`docs/02-business.md` §5) pode mudar o alvo; os Termos dizem «o preço indicado na página de preços no momento da compra, sem IVA».
9. **Registo do consentimento de cookies só no dispositivo** (cookie e `localStorage` `consent`, 180 dias; `CONSENT_MAX_AGE_SECONDS`): suficiente para um banner só de estatísticas, mas é uma limitação (não há registo no servidor).
10. **Livro de Reclamações:** regista-se por prudência, apesar de o produto ser B2B. O DL 156/2005 (art. 2.º, n.º 2) obriga todos os prestadores, incluindo os que atuam «através de meios digitais», ao livro em formato eletrónico; o livro destina-se a «consumidor ou utente» (art. 2.º, n.º 5), o que deixa dúvida sobre os clientes só empresariais. Registar é grátis e evita coima (€250–3 500 para pessoas singulares; €1 500–15 000 para pessoas coletivas, art. 9.º, versão de 2017). Pergunta para o advogado (secção 7).
11. **DSA:** o serviço é tratado como «alojamento» (micro-empresa), com contactos, termos de moderação, canal de denúncia por e-mail e exposição de motivos (secção 9).
12. **Código aberto/fontes:** `pdfjs-dist` (Apache-2.0) e `write-excel-file` (MIT) são licenças permissivas; o tipo de letra do logótipo (Inter) é OFL.
13. **O repositório pode ser público:** os dados de identificação de HT-05 vão ao Aviso Legal por obrigação legal; usar a morada profissional registada, nunca uma morada pessoal (`FOUNDER.md`).
14. **As páginas em inglês são tradução** da versão portuguesa, que prevalece (Termos §15).

## 2. Mapa de dados (resumo)

Detalhe em `legal/ropa.md` (12 atividades) e `legal/subprocessors.md`. **Última reconciliação com o código:** 2026-11-28, `rg` do passo 2b sobre `products/civil-pt/app/` (a construção decorre em paralelo): só a starter está presente (Stripe, Resend, PostHog/Plausible, consentimento). **Supabase, Sentry, registo de IP e livro-razão ainda não estão no código: repetir na integração** (comando em `legal/ropa.md` §6).

| Atividade | Base de licitude | Subcontratantes / destinatários | Transferência fora do EEE | Conservação |
|---|---|---|---|---|
| Contas e autenticação | Contrato (6.º/1/b) | Supabase, Vercel, Resend | Supabase: SCC (Singapura/EUA, apoio); Vercel e Resend: DPF + SCC | Conta + 30 dias; inativa 24 meses |
| Conteúdos do cliente (PDF, projetos, mapas) | Contrato; subcontratante quanto a dados de terceiros | Supabase (Frankfurt), Vercel (`fra1`) | Acesso de apoio fora da UE (SCC) | Até apagar o projeto/conta; cópias BD 7 dias |
| Utilização, saldo e métricas | Contrato; interesse legítimo (métricas) | Supabase | Idem | Conta; depois agregados |
| Pagamentos e faturação | Contrato; obrigação legal | Stripe (SC e RI), contabilista, AT | Stripe: SCC + DPF | Faturas 10 anos |
| E-mails de serviço e apoio | Contrato; interesse legítimo | Resend, fornecedor da caixa de correio | Resend: EUA (DPF + SCC) | Entrega ≤ 30 dias; apoio 24 meses |
| Segurança e abuso | Interesse legítimo | Supabase, Vercel | Idem | 1 h a 24 h; avaliação 12 meses após eliminar; registos ≤ 30 dias |
| Erros | Interesse legítimo | Sentry (Frankfurt) | DPF + SCC | 30 dias |
| Estatísticas | **Consentimento** | PostHog (UE) | SCC | ≤ 14 meses |
| Pedidos de demonstração | Consentimento | Resend | DPF + SCC | Até retirar; revisão anual (24 meses) |
| Prospecção B2B | Interesse legítimo (+ art. 14.º) | Ferramenta do fundador (por definir) | A definir | 12 meses; oposição 5 anos |

## 3. Estado por item da checklist

Estados: **Cumpre** · **Parcial** · **Em falta** · **N/A** (com razão). A evidência é um caminho no repositório ou um URL com data de acesso. «Rxx» remete para os requisitos de integração da secção 4; «HT-xx» para `HUMAN_TASKS.md`.

| ID | Item | Estado | Evidência | Notas / ação |
|---|---|---|---|---|
| ID-01 | Identificação do prestador (DL 7/2004 art. 10.º) | **Parcial** | `legal/public/legal-notice.{pt,en}.md` | Texto completo; faltam os valores `company.*` (HT-04, HT-05) e a ligação no rodapé (R01) |
| ID-02 | Livro de Reclamações Eletrónico (DL 156/2005) | **Em falta** | — | Registar em livroreclamacoes.pt e pôr o botão no rodapé (HT-06; R01). Texto das 3 páginas já remete para `{{legal.complaintsBookUrl}}`. Ver pressuposto 10 |
| ID-03 | Informação RAL (Lei 144/2015 art. 18.º) | **N/A** | — | Só B2B; sem adesão a RAL; decisão registada (pressuposto 4) |
| ID-04 | Sem ligação à plataforma ODR (encerrada 20-07-2025) | **Cumpre** | `grep -rn 'consumers/odr' legal/public/` vazio | Repetir sobre `app/src` na integração (R14) |
| ID-05 | Comunicações comerciais identificáveis (DL 7/2004 art. 21.º) | **Parcial** | Regras na secção 9 | Só e-mails de serviço no MVP; o *outbound* do `gtm` tem de identificar o remetente e ser claramente comercial |
| ID-06 | Páginas legais em todos os idiomas | **Cumpre** | `legal/public/` (8 ficheiros: 4 × 2) | `withdrawal` omitido por ser B2B (pressuposto 3) |
| DP-01 | Registo das atividades de tratamento | **Parcial** | `legal/ropa.md` v1 | Completo face à arquitetura; reconciliação com o código incompleta até a construção terminar (R14) |
| DP-02 | Base de licitude por finalidade | **Cumpre** | `legal/ropa.md` §2–§3 | Três avaliações de interesse legítimo; consentimento só para estatísticas, lista de espera e (se vier) newsletters; nada agrupado nos Termos |
| DP-03 | Aviso de privacidade | **Cumpre** | `legal/public/privacy.{pt,en}.md` | Texto final; publicar na integração (R02). Inclui o aviso do art. 14.º aos contactos de prospecção |
| DP-04 | Exercício de direitos dos titulares | **Parcial** | `legal/ropa.md` §7 | Resposta ≤ 1 mês; sem formulário: e-mail + *runbook* manual (`scripts/erase-user.ts`); falta a caixa de correio (HT-05) e o *runbook* em `docs/09-launch.md` (R16); exportação e apagamento self-service só com US-15 |
| DP-05 | Subcontratantes com DPA | **Em falta** | `legal/subprocessors.md` §2 | Aceitar/assinar os DPA: HT-07 (Supabase, Vercel, Stripe, Resend: ao criar as contas) e HT-08 (PostHog e Sentry: assinatura) |
| DP-06 | Papel de subcontratante perante clientes | **Cumpre** | `legal/dpa.md`; Termos §11; Privacidade §1 | DPA em inglês, incorporado nos Termos e fornecido a pedido |
| DP-07 | Transferências internacionais | **Parcial** | `legal/subprocessors.md` §3 | Ferramenta e nota por fornecedor feitas. O DPF de Resend, Sentry e PostHog não foi confirmado na lista oficial (só Vercel e Stripe, por motor de busca); todos os DPA têm SCC. Recurso C-703/25 P pendente. Repetir quando se criarem as contas |
| DP-08 | Prazos de conservação | **Parcial** | `legal/ropa.md` §2; pressuposto 7 | Prazos concretos escritos; falta implementar as purgas (R10) |
| DP-09 | Segurança do tratamento | **Parcial** | `docs/04-architecture.md` §11 (SR-01 a SR-14); `legal/ropa.md` §5 | Controlos previstos; verificação em `docs/06-qa-report.md` (ainda não existe). A Política de Privacidade §8 só afirma controlos previstos: se a auditoria mudar um, corrigi-la |
| DP-10 | Violações de dados (72 h) | **Parcial** | `legal/ropa.md` §7 (registo) | Procedimento: registar todas; CNPD em 72 h (https://www.cnpd.pt/organizacoes/outras-obrigacoes/violacao-de-dados-ou-data-breach/); clientes em 48 h (DPA §8); falta o *runbook* em `docs/09-launch.md` (R16) |
| DP-11 | Triagem de AIPD/DPIA | **Cumpre** | `legal/dpia-screening.md` | 0 critérios; não necessária; rever com US-07 |
| DP-12 | Encarregado de proteção de dados | **Cumpre** | `legal/ropa.md` §1 | Não exigido: sem categorias especiais nem monitorização em grande escala |
| DP-13 | Dados de crianças | **Parcial** | Termos §2; Privacidade §10 | Idade mínima 18 escrita; falta o texto na página de entrada e a caixa de aceitação (R08) |
| DP-14 | Marketing direto (Lei 41/2004 art. 13.º-A) | **Parcial** | Privacidade §11; secção 9 | Sem newsletters no MVP. *Outbound* só a pessoas coletivas, com identificação e recusa, consultando a lista de oposição da DGC (texto consolidado do art. 13.º-A e 13.º-B por confirmar no DR): regras para o `gtm` |
| DP-15 | Decisões automatizadas / perfis | **Cumpre** | Privacidade §4 | Nenhuma; só limites técnicos de segurança, com revisão humana a pedido |
| DP-16 | Proteção de dados desde a conceção | **Cumpre** | `docs/04-architecture.md` §5, §7, §11 | E-mail como único dado de conta; sem palavra-passe; IP e e-mail só como HMAC; analítica só com consentimento; sem texto das peças extraído; apagar de verdade. Verificar em QA |
| DP-17 | Representante na UE | **N/A** | — | Estabelecido em Portugal |
| CK-01 | Inventário de armazenamento/SDK | **Parcial** | `legal/public/cookies.{pt,en}.md` §4 | Inventário da arquitetura + starter; confirmar nomes e durações na integração (cookie do Supabase, R06) |
| CK-02 | Consentimento prévio (se aplicável) | **Parcial** | `app/src/components/CookieConsent.tsx`, `Analytics.tsx` | O banner da starter tem Aceitar e Rejeitar; o PostHog só carrega após «granted». Falta o teste de rede em QA (R05). Lacuna: sem registo de consentimento no servidor (pressuposto 9) |
| CK-03 | Caminho sem consentimento documentado | **Cumpre** | Cookies §4 | Só sessão, escolha de consentimento e `__stripe_*` (prevenção de fraude, no domínio do Stripe: pressuposto de «estritamente necessário» comum, a confirmar) |
| CK-04 | Política de cookies | **Cumpre** | `cookies.{pt,en}.md` | Bate com o código da starter e a arquitetura |
| CK-05 | Conteúdos incorporados de terceiros | **Cumpre** | Cookies §6 | Nenhum: sem tipos de letra externos (pilhas de sistema), sem vídeos nem mapas; o pagamento é uma página do Stripe (redirecionamento) |
| CK-06 | Alterações legislativas pendentes | **Cumpre** | Secção 6 | Omnibus digital (arts. 88a/88b): só proposta; não se invoca |
| CL-01 | Informação pré-contratual (consumidores) | **N/A** | — | B2B. Mesmo assim, o checkout mostra preço sem IVA, renovação e cancelamento (R07) |
| CL-02 | Botão «encomenda com obrigação de pagar» | **N/A** | — | B2B; recomenda-se um rótulo inequívoco («Pagar»/«Subscrever» do Stripe) |
| CL-03 | Confirmação em suporte duradouro | **N/A** | — | B2B; o recibo do Stripe e a fatura chegam por e-mail |
| CL-04 | Livre resolução 14 dias + formulário | **N/A** | — | Página omitida; reembolso de cortesia (Termos §4) |
| CL-05 | Pedido expresso + reconhecimento (conteúdos/serviços digitais) | **N/A** | — | Só consumidores |
| CL-06 | Função de resolução do contrato (19-06-2026) | **N/A** | — | Só consumidores; a transposição portuguesa não foi encontrada a 2026-11-28 (fonte secundária). A função da starter fica desligada |
| CL-07 | Reembolso em 14 dias | **N/A** | — | Reembolso de cortesia a 14 dias (Termos §4) com processo no Stripe (R07, R16) |
| CL-08 | Conformidade de conteúdos/serviços digitais (DL 84/2021) | **N/A** | — | Só consumidores; Termos §9 define a responsabilidade pela revisão |
| CL-09 | Cláusulas contratuais gerais (DL 446/85) | **Parcial** | `terms.{pt,en}.md` | Aplica-se também entre empresas. Comunicação integral antes do pagamento e aceitação registada (R07, R08); sem cláusulas proibidas em absoluto; o limite de responsabilidade (12 meses de pagamentos) não exclui dolo nem negligência grosseira. **Rever com advogado** (secção 7) |
| CL-10 | Indicação de preços com IVA | **Parcial** | Termos §3 | Para B2B vale o preço sem IVA com aviso explícito. A página de preços tem de dizer «sem IVA» (ou «preço final», se o regime for isento) de forma bem visível (R07) |
| CL-11 | Preço de referência a 30 dias | **N/A** | — | Sem consumidores; mesmo assim, a oferta de lançamento não tem preço riscado (`docs/02-business.md` §5) |
| CL-12 | Subscrições e renovação | **N/A** | — | B2B; Termos §3 dizem renovação, cancelamento em dois cliques e fim de período; o portal de cliente tem de o permitir (R07) |
| CL-13 | Práticas comerciais desleais | **Parcial** | Secção 9 | Em B2B aplica-se o Código da Publicidade; restrições para o `gtm` na secção 9 (comparação com o civils.ai, sem precisão em %, sem avaliações falsas) |
| CL-14 | Execução e indisponibilidade | **N/A** | — | Serviço de execução imediata; a folha falhada não é cobrada (Termos §1) |
| AC-01 | Âmbito do Ato Europeu da Acessibilidade (DL 82/2022) | **Cumpre** | Esta secção | **Microempresa** (< 10 pessoas e volume de negócios ou balanço ≤ €2 M: um só fundador; ≈ €3 000 de receita no ano 1 do cenário base) a prestar serviços (comércio eletrónico): fora do âmbito (art. 2.º, n.º 5, al. b) do DL 82/2022, em vigor desde 28-06-2025; fonte: https://files.dre.pt/1s/2022/12/23400/0010900132.pdf). Reavaliar aos 10 trabalhadores ou ao limite de €2 M |
| AC-02 | WCAG 2.2 AA | **Parcial** | `app/tests/e2e` (axe, da starter) | Exigência de qualidade (clientes B2B e públicos); a medição está em `docs/06-qa-report.md` (R15). Nenhuma alegação de conformidade se publica sem esse resultado |
| AC-03 | Contacto de acessibilidade | **Cumpre** | Aviso Legal §6 | |
| AI-01 | Papel e classificação de risco | **Cumpre** | `legal/ai-act-note.md` | O MVP não é sistema de IA (regras fixas); sem obrigações |
| AI-02 | Práticas proibidas | **Cumpre** | `legal/ai-act-note.md` §3.1 | Nenhuma |
| AI-03 | Informar que se interage com IA (art. 50.º/1) | **N/A** | — | Sem chatbot |
| AI-04 | Marcação de conteúdo sintético (art. 50.º/2) | **N/A** | — | Sem IA; a reavaliar com US-07 (nota §4) |
| AI-05 | Rotulagem de *deepfakes* / emoções | **N/A** | — | Sem essas funcionalidades |
| AI-06 | Literacia em IA (art. 4.º) | **N/A** | `legal/ai-act-note.md` §5 | O produto não contém IA |
| AI-07 | Termos dos fornecedores de IA | **N/A** | `legal/subprocessors.md` | Nenhum fornecedor ativo; Anthropic dormente |
| AI-08 | Divulgar a utilização de IA e os limites | **Cumpre** | Privacidade §4; Termos §1, §9, §11 | Diz-se que **não** há IA e que as peças não vão a nenhum fornecedor de IA; passa a falso se US-07 for ativada (atualizar páginas, RoPA, DPA antes) |
| DSA-01 | Classificação | **Cumpre** | Secção 1 | Serviço de alojamento, não plataforma em linha; micro-empresa isenta das obrigações adicionais (secções 3 e 4 do capítulo III); mantêm-se os arts. 11, 12, 14, 16, 17 e 18 |
| DSA-02 | Pontos de contacto | **Parcial** | Aviso Legal §5 | Texto feito (português e inglês); falta o e-mail operacional (HT-05) |
| DSA-03 | Termos sobre moderação | **Cumpre** | Termos §5, §6 | Regras, procedimento, exposição de motivos e contestação |
| DSA-04 | Notificação e ação | **Parcial** | Termos §6; Aviso Legal §5 | Canal por e-mail; falta o modelo de acusação de receção e o procedimento (R16) |
| DSA-05 | Exposição de motivos | **Parcial** | Termos §6 | Falta o modelo de e-mail (R16) |
| DSA-06 | Notificação de infrações penais | **Parcial** | — | Procedimento no *runbook* (R16) |
| DSA-07 | Mercado / P2B | **N/A** | — | Não há comerciantes a vender através do produto |
| TX-01 | Atividade e regime de IVA | **Em falta** | — | HT-04 (contabilista certificado): isenção do art. 53.º do CIVA (limite de €15 000 em 2026, a confirmar) ou regime normal |
| TX-02 | Faturação | **Em falta** | — | HT-04: Portal das Finanças ou programa certificado, ATCUD, comunicação à AT; arquivo 10 anos |
| TX-03 | Serviços digitais B2C na UE (OSS) | **N/A** | — | Sem vendas a consumidores. Se alguma passar, tratá-la como exceção com o contabilista |
| TX-04 | Autoliquidação B2B na UE | **Parcial** | `docs/02-business.md` §4 | O Stripe Checkout recolhe o NIF-IVA (`tax_id_collection.enabled=true`, `required=if_supported`, R07); validação VIES e declaração recapitulativa: HT-04 |
| TX-05 | Decisão sobre Merchant of Record | **Cumpre** | ADR 0004 | Stripe direto (B2B); Paddle como recurso |
| TX-06 | Clientes fora da UE | **Parcial** | — | HT-04 (fora do campo do IVA português; guardar prova da localização) |
| AS-01 a AS-06 | Lojas de aplicações | **N/A** | — | Sem aplicação móvel |
| SEC-01 | Regulamento de Ciberresiliência (relato desde 11-09-2026) | **N/A** | Secção 9 | SaaS puro: não é «produto com elementos digitais» colocado no mercado. Reavaliar se se distribuir software ao cliente |
| SEC-02 | Regulamento dos Dados (mudança de fornecedor) | **Parcial** | Termos §12 | Provavelmente aplicável (SaaS; sem isenção para PME no texto; o Omnibus que a proporia é só proposta). Cláusulas de saída, 30 dias de recuperação, exportação em formato estruturado, sem taxas; falta a exportação JSON a pedido (R11). Rever com advogado |
| SEC-03 | NIS2 (DL 125/2025) | **N/A** | Secção 9 | Micro-empresa fora do âmbito (diploma em vigor desde 03-04-2026, fonte secundária; o artigo do âmbito não foi lido) |
| IP-01 | Autorização de marca | **Parcial** | `legal/trademark-check.md` | **Amarelo:** sem conflitos em EUIPO e OMPI; TMview e INPI por consultar (HT-03). Avançar com ™ |
| IP-02 | Licenças de terceiros | **Parcial** | Pressuposto 12 | Fazer a verificação de licenças e `THIRD_PARTY.md` na integração (R17) |
| IP-03 | Licença de conteúdos e retirada | **Cumpre** | Termos §6 | Licença limitada; garantia de direitos sobre as peças; canal de denúncia |

### 3.1 Contagem

Total: **79 itens** (a linha «AS-01 a AS-06» conta 6): **22 Cumpre · 25 Parcial · 4 Em falta · 28 N/A**.

- **Em falta (4), todos do fundador:** ID-02 Livro de Reclamações (HT-06); DP-05 DPA dos fornecedores (HT-07, HT-08); TX-01 regime de IVA e TX-02 faturação (HT-04).
- **Parcial (25):** quase todos dependem de a construção terminar e do QA (reconciliação do código, consentimento por teste de rede, purgas, *runbooks*, WCAG), das caixas de correio e dos dados da empresa (HT-04, HT-05), do contabilista (TX-04, TX-06) ou do `gtm` (ID-05, DP-14, CL-13). Cada um está ligado a um HT ou a um requisito R01–R17 na secção 5.
- **N/A (28):** consumidores (CL-01 a CL-08, CL-11, CL-12, CL-14, ID-03), lojas de aplicações (6), IA sem IA no produto (AI-03 a AI-07), OSS (TX-03), mercado (DSA-07), CRA e NIS2 (SEC-01, SEC-03) e representante na UE (DP-17).

## 4. Requisitos para a integração

*Para o `fullstack-engineer` (integração) e o `qa-engineer`. A starter já traz: 5 rotas legais (`withdrawal` só com `sellsToConsumers`), rodapé com os links e o Livro de Reclamações, botão «Definições de cookies» e banner Aceitar/Rejeitar com a mesma importância (escolha em `localStorage` e cookie `consent`, 180 dias). **Verificar, não reconstruir.** Cada requisito tem o ID que a secção 3 cita.*

- [ ] **R01 · Rodapé em todas as páginas:** Privacidade · Termos · Cookies · «Definições de cookies» · Aviso Legal · botão oficial do **Livro de Reclamações** (imagem do livroreclamacoes.pt, ligação a `{{legal.complaintsBookUrl}}`, visível e destacado: DL 156/2005 art. 5.º-B, n.º 2). **Sem** ligação «Livre resolução» nem «Resolver o contrato aqui» (`legal.sellsToConsumers=false`); confirmar que `/api/withdrawal` e `/<idioma>/withdraw` respondem 404.
- [ ] **R02 · Páginas legais:** copiar `legal/public/<doc>.<pt|en>.md` para `app/src/content/legal/{pt,en}/<doc>.md` (4 documentos × 2 idiomas), apagar os exemplos da starter, definir os valores `legal.*` e `company.*` (HT-05) na configuração, **sem** `PENDING_FOUNDER` (o QA e o lançamento falham com essa marca) e sem `{{`/`}}` visíveis. Confirmar `legal.effectiveDate` e `legal.lastUpdated` no go-live. **Testes da starter:** substituir as asserções das amostras (banner «Template», `Acme, Lda.`, centro de arbitragem de Lisboa) por invariantes (H1 visível, sem `{{`, nome da empresa vindo da configuração, ligação do Livro de Reclamações); nunca apagar nem enfraquecer.
- [ ] **R03 · Aceitação dos Termos antes do contrato (DL 446/85):** na primeira entrada (criação de conta), caixa **não pré-marcada** e obrigatória «Declaro que atuo a título profissional, tenho 18 anos ou mais e aceito os Termos e Condições e a Política de Privacidade» com ligações; guardar `terms_accepted_at` e a versão (`legal.lastUpdated`) no perfil. Texto igual no pt e no en.
- [ ] **R04 · Lista de espera:** caixa de consentimento **não pré-marcada** (a starter já obriga a `consent: true`), com o texto «Aceito que me contactem sobre este pedido de demonstração» e ligação à Privacidade; as variáveis `WAITLIST_WEBHOOK_URL` e `WITHDRAWAL_WEBHOOK_URL` ficam **vazias** em produção (qualquer outro destino é um fornecedor por declarar).
- [ ] **R05 · Consentimento e analítica:** `NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog`, `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` (nunca `plausible`, nunca o host dos EUA); nenhum pedido a `posthog` nem outro armazenamento além do necessário antes de «Aceitar» (teste e2e com registo de rede); «Rejeitar» tem o mesmo peso que «Aceitar»; retirar o consentimento para a captura; a duração do consentimento (180 dias) igual à da Política de Cookies; nenhum e-mail, nome de projeto ou de ficheiro nos eventos (dicionário `docs/04` §12). No projeto PostHog: «descartar o IP do cliente», retenção ≤ 14 meses (HT-08).
- [ ] **R06 · Cookies e armazenamento:** só os da Política de Cookies. O cookie de sessão do Supabase com `maxAge` de 30 dias (2 592 000 s; por defeito a biblioteca usa muito mais) e, se existir no plano, limite de inatividade e de duração de sessão de 30 dias no Supabase; qualquer chave nova em `localStorage`/cookie obriga a atualizar a Política de Cookies e o RoPA. Sem tipos de letra nem scripts externos.
- [ ] **R07 · Checkout e página de preços (Stripe Checkout, B2B).** Campos a verificar na documentação do Stripe no momento (confirmados em 2026-11-28 em https://docs.stripe.com/api/checkout/sessions/create): `consent_collection.terms_of_service = required` (exige o URL dos Termos nas definições públicas da conta Stripe, HT-07); `custom_text.terms_of_service_acceptance.message` (≤ 1 200 caracteres) com o texto da caixa; `custom_text.submit.message` (≤ 1 200) com o aviso de preço, renovação e reembolso; `tax_id_collection.enabled = true` e `required = if_supported`; `billing_address_collection = required` (para a fatura); `locale` pt/en; `metadata.terms_version` = `legal.lastUpdated`. Preço **sem IVA** em destaque (ou «preço final», no regime isento) e total mostrado antes de pagar; rótulo do botão inequívoco; portal de cliente com cancelamento «no fim do período» e a 2 cliques. **Textos exatos** (pt / en):
  - Caixa dos Termos (pt): «Declaro que atuo a título profissional (não como consumidor) e que li e aceito os Termos e Condições e a Política de Privacidade.» (en): «I declare that I act in a professional capacity (not as a consumer) and that I have read and accept the Terms and Conditions and the Privacy Policy.» Com ligações `{{site.url}}/pt/legal/terms` e `/privacy`.
  - Aviso junto ao botão (pt): «Preços sem IVA; o IVA ou a autoliquidação são calculados no pagamento. As subscrições renovam todos os meses até serem canceladas no portal de cliente. Reembolso a pedido nos 14 dias seguintes à primeira compra: integral se não usou folhas; proporcional às folhas por usar (Termos, secção 4).» (en): «Prices exclude VAT; VAT or the reverse charge is calculated at payment. Subscriptions renew every month until cancelled in the customer portal. Refund on request within 14 days of the first purchase: full if no sheets were used; proportional to unused sheets (Terms, section 4).»
  - **A página de preços e a landing repetem o reembolso com as mesmas palavras** (Termos §4). Sem preço riscado nem contagem decrescente; «Preço de lançamento: €79/mês para as primeiras 10 empresas» sem referência de desconto.
- [ ] **R08 · Página de entrada e conta:** texto «Uso profissional. Tem de ter 18 anos ou mais» junto à caixa do R03; e-mail de código sem marketing, com identificação do remetente; rotação do código e bloqueio como no ADR 0003.
- [ ] **R09 · Apagar projeto e conta:** apagar projeto remove ficheiros e linhas (≤ 60 s); apagar conta pelo `scripts/erase-user.ts` (cascata, `purchases.user_id → NULL`, cliente Stripe apagado/anonimizado, objetos de Storage removidos). Pedido respondido em ≤ 1 mês.
- [ ] **R10 · Purgas e retenção (o que a política promete):** contas sem início de sessão há 24 meses (aviso por e-mail e eliminação 30 dias depois); encerramento de conta → 30 dias de exportação e eliminação; `auth_attempts` e `signup_ip_daily` 24 h; `rate_limits` 1 h; `trial_grants` apagado 12 meses após eliminar a conta; registos de aplicação ≤ 30 dias; Sentry ≤ 30 dias; sem registo de nomes de projeto/ficheiro/e-mail em *logs* nem em Sentry (`sendDefaultPii=false`, sem IP, `beforeSend`). Cobrir com testes (relógio injetável).
- [ ] **R11 · Exportação de dados:** exportação do mapa em Excel na própria aplicação; exportação JSON de projetos, folhas, grupos e mapas **a pedido** em ≤ 30 dias (script `scripts/export-user.ts` até US-15), sem custos (Termos §12; RGPD art. 20.º; Regulamento dos Dados).
- [ ] **R12 · Coerência com a aplicação:** os Termos descrevem comportamentos do PRD que o QA tem de confirmar: não cobrar folha falhada, raster ou sem estilos separáveis; reprocessar não cobra; devolução «não funcionou» (máx. 3 por lote); lotes de 14/90 dias e expiração; graça de 7 dias; disputa congela o saldo; reembolso proporcional e revogação das folhas por usar. Qualquer diferença corrige-se no código ou nos Termos antes de publicar.
- [ ] **R13 · Segurança que a Política de Privacidade afirma:** HTTPS/HSTS, RLS testada A↛B, *buckets* privados com URL assinado ≤ 10 min, sem segredos no pacote, limites de ficheiro no servidor, separação de ambientes (SR-01 a SR-14). A auditoria de segurança alimenta a secção 8 da Política de Privacidade.
- [ ] **R14 · Reconciliação final do código:** repetir o `rg` de `legal/ropa.md` §6 com `app/` completo; cada achado tem de ter linha no RoPA ou ser removido; atualizar RoPA, subcontratantes, Privacidade e Cookies se aparecer um fornecedor, campo ou chave nova. `@anthropic-ai/sdk` e `turnstile` têm de continuar ausentes/desligados.
- [ ] **R15 · Acessibilidade:** axe sem violações WCAG 2.2 AA nas duas línguas (incluindo páginas legais, banner e o ecrã da folha, que tem de ter equivalente por teclado); sem alegação de conformidade antes do resultado.
- [ ] **R16 · *Runbooks* (`docs/09-launch.md`):** pedido de titular (prazo de 1 mês; registo no RoPA §7); violação de dados (registo; CNPD em 72 h; clientes B2B em 48 h; titulares se risco elevado); denúncia de conteúdo ilícito (acusação de receção, decisão, exposição de motivos do art. 17.º DSA, notificação do art. 18.º); reembolso no Stripe (proporcional, revoga folhas) e disputa; DNS do e-mail (SPF, DKIM, DMARC) para `ola@`, `apoio@`, `privacidade@`; páginas legais acessíveis no URL de produção **antes** de ativar pagamentos reais.
- [ ] **R17 · Licenças:** `THIRD_PARTY.md` (pdfjs-dist Apache-2.0, write-excel-file MIT, Inter OFL se for distribuído); nenhuma dependência AGPL.

## 5. Itens em aberto → tarefas

| # | Item | Origem (ID) | Tipo | Tarefa | Prioridade |
|---|---|---|---|---|---|
| 1 | Definir entidade (ENI ou Unipessoal Lda), regime de IVA, faturação e conservação de 10 anos com o contabilista | TX-01, TX-02, TX-04, TX-06, ID-01 | Fundador | HT-04 | 🔴 antes de cobrar |
| 2 | Dados públicos da empresa e as 3 caixas de correio | ID-01, DP-04, DSA-02 | Fundador | HT-05 | 🔴 |
| 3 | Registar o Livro de Reclamações Eletrónico | ID-02 | Fundador | HT-06 | 🔴 antes do lançamento |
| 4 | Aceitar os DPA ao criar as contas (Supabase, Vercel, Stripe, Resend) e pôr os URL legais no Stripe | DP-05 | Fundador | HT-07 | 🟡 |
| 5 | Assinar o DPA do PostHog e aceitar o do Sentry; configurar o PostHog (IP, retenção) | DP-05, DP-07, CK-02 | Fundador | HT-08 | 🟡 |
| 6 | Repetir TMview e INPI; decidir o registo da marca | IP-01 | Fundador | HT-03 (existente) | 🟢 |
| 7 | Revisão por advogado (opcional, antes do primeiro contrato empresarial) | CL-09, SEC-02, DSA-01, ID-02 | Fundador | HT-09 | 🟢 |
| 8 | Rodapé, páginas legais, aceitação dos Termos, checkout, consentimento, cookies, purgas, exportação, reconciliação | ID-01, ID-06, DP-01/04/08/09/13, CK-01/02, CL-09/10, SEC-02 | Engenharia | R01–R17 (ciclo de correções da integração e do QA) | 🟡 |
| 9 | *Runbooks* de titulares, violações e DSA no `docs/09-launch.md` | DP-04, DP-10, DSA-04/05/06 | `launch` | R16 | 🟡 |
| 10 | Regras de comunicação (comparação, outbound, sem % de precisão) | ID-05, DP-14, CL-13 | `gtm` | Secção 9 | 🟡 |

## 6. Factos voláteis reverificados nesta execução

Registo do playbook verificado em 2026-10-08 (menos de 90 dias). Reverificado ou lido a **2026-11-28** (P = texto ou página oficial lida; S = fonte secundária; U = não verificado):

| Facto | Estado em 2026-11-28 | Src | Fonte (URL + data de acesso) |
|---|---|---|---|
| Plataforma ODR encerrada em 20-07-2025; Reg. 524/2013 revogado pelo 2024/3228 | Registo de 2026-10-08 mantido; não se menciona ODR em nenhuma página | P (registo) | https://consumer-redress.ec.europa.eu/site-relocation_en (2026-10-08) |
| Regulamento da IA: datas; Omnibus = Reg. (UE) 2026/1744 (JO 24-07-2026; em vigor 27-07-2026; art. 50.º desde 02-08-2026; moratória do art. 50.º/2 só para sistemas anteriores, até 02-12-2026) | Confirmado | S | https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act e https://www.cuatrecasas.com/en/portugal/intellectual-property/art/digital-omnibus-ai-has-been-published (2026-11-28); EUR-Lex não abre |
| Definição de «sistema de IA» (orientações da Comissão, 06-02-2025, C(2025) 924): regras fixas fora do âmbito | Fonte primária localizada, leitura do texto sobre exclusões por resumo | S | https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application (2026-11-28) |
| Transposição PT da função de resolução (Dir. 2023/2673) | **Não encontrada**; aplica-se desde 19-06-2026; irrelevante para este produto (só consumidores) | S/U | https://ecommerceparatodos.pt/botao-de-revogacao-da-ue-obrigatorio-desde-19-de-junho-2026/ (2026-11-28) |
| Quadro de Privacidade UE–EUA (DPF) | Válido; acórdão do Tribunal Geral de 03-09-2025; recurso **C-703/25 P** interposto a 31-10-2025 (JO de 22-12-2025), **sem acórdão** | S | https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework (2026-11-28) |
| DPF de cada fornecedor | Vercel e Stripe, LLC **ativos** segundo resultados de pesquisa (Vercel: certificada em 2019, próxima 2027-04-29); Resend e Sentry invocam o DPF nos seus DPA; PostHog **não** o invoca (usa SCC); nenhum dos três confirmado na lista oficial (a lista é dinâmica) | S | https://www.dataprivacyframework.gov/list (os registos de Vercel e Stripe, LLC apareceram por motor de busca e a página do participante não abriu por WebFetch: **confirmar na lista antes de invocar o DPF**); https://resend.com/changelog/data-privacy-framework-certification (declaração do fornecedor; 2026-11-28) |
| DPA dos fornecedores (versão, aceitação, SCC, regiões) | Supabase DPA v1 de 2026-08-01 (Supabase Pte. Ltd., Singapura; SCC módulos 2 e 3; faz parte dos Termos); Vercel DPA de 2026-03-17/31 (SCC no Anexo 3); Stripe DPA de 2026-09-28 (SCC + DPF; responsável independente para fraude/AML); Resend DPA de 2025-12-31 (DPF + SCC; tratamento principal nos EUA); Sentry (DPF + SCC; aceitação eletrónica; armazenamento UE em Frankfurt); PostHog (SCC; DPA por gerador/PandaDoc; nuvem UE em Frankfurt) | P | https://supabase.com/legal/dpa · https://vercel.com/legal/dpa · https://stripe.com/legal/dpa · https://resend.com/legal/dpa · https://sentry.io/legal/dpa/ · https://docs.sentry.io/organization/data-storage-location/ · https://posthog.com/dpa (2026-11-28) |
| Supabase: dados em Frankfurt, apoio de fora da região | «Acedemos aos seus dados só quando pede ajuda ou perante incidentes de segurança»; telemetria e faturação da conta fora da região; TIA publicada | P | https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq (2026-11-28) |
| Stripe Checkout: campos `consent_collection.terms_of_service`, `custom_text.terms_of_service_acceptance.message` e `custom_text.submit.message` (≤ 1 200 car.), `tax_id_collection.{enabled,required}`, `billing_address_collection` | Confirmados | P | https://docs.stripe.com/api/checkout/sessions/create (2026-11-28) |
| Livro de Reclamações: art. 2.º, n.º 2 (formato eletrónico para todos, incluindo «meios digitais»), art. 2.º, n.º 5 («qualquer consumidor ou utente»), art. 5.º-B (botão em local visível; resposta em 15 dias úteis) | Texto de 2017 lido; alterações posteriores (DL 9/2020; 90 dias de regularização) não lidas | P (2017) / S | https://www.aiccopn.pt/wp-content/uploads/2021/10/LR-republicacao.pdf (2026-11-28) |
| DSA art. 3.º: (g) serviço intermediário, iii) alojamento; (h) conteúdo ilícito; (i) plataforma em linha (difunde ao público); (k) difusão ao público | Confirmado (espelho de terceiros; EUR-Lex não abre) | S | https://www.eu-digital-services-act.com/Digital_Services_Act_Article_3.html (2026-11-28) |
| Regulamento dos Dados, cap. VI (mudança de fornecedor): contrato escrito, pré-aviso ≤ 2 meses, transição ≤ 30 dias, recuperação ≥ 30 dias, taxas de mudança proibidas a partir de 12-01-2027, **sem isenção para PME**; o Omnibus digital proporia isenção para PME (só proposta) | Confirmado em resumos; texto do art. 25.º não lido | S | https://www.pinsentmasons.com/out-law/guides/switching-porting-rules-eu-data-act e https://www.gtlaw.com/en/insights/2026/7/eu-digital-omnibus-package-proposes-amendments-to-data-act (2026-11-28) |
| NIS2 em Portugal: DL 125/2025 (entra em vigor a 03-04-2026; Regulamento n.º 756/2026 do CNCS, 22-06-2026) | Confirmado em resumos; o âmbito por dimensão não foi lido no diploma | S | https://www.pwc.pt/pt/temas-actuais/dl-125-2025.html e https://eco.sapo.pt/2026/06/22/cncs-publica-regulamento-que-concretiza-regime-juridico-da-ciberseguranca/ (2026-11-28) |
| Cookies: Lei 41/2004 art. 5.º (consentimento; exceção do estritamente necessário); orientações da CNPD sobre cookies | **Sem orientações da CNPD encontradas**; padrão = EDPB (taskforce de 2023; Diretrizes 05/2020 e 2/2023) | S | https://diariodarepublica.pt/dr/detalhe/lei/46-2012-174793 (2026-11-28) |
| Marketing direto: art. 13.º-A (singulares: consentimento; coletivas: oposição) e lista da DGC | Confirmado em resumos; texto consolidado por ler no DR | S | https://www.garrigues.com/pl/pt-PT/news/nova-diretriz-da-cnpd-marketing-direto-o-tem-mudar-na-forma-empresas-fazem-marketing.md (2026-11-28) |
| Conservação de faturas: 10 anos civis (CIVA art. 52.º; DL 49/2025 alterou a redação a 01-07-2025) | Confirmado | S | https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/ra/Pages/iva52ra_202503.aspx (2026-11-28); o contabilista confirma (HT-04) |
| Publicidade comparativa: Código da Publicidade art. 16.º e DL 57/2008 | Texto do art. 16.º **não lido** (só resumos académicos) | U | https://estudogeral.sib.uc.pt/bitstream/10316/28796/1/PUBLICIDADE%20COMPARATIVA%20E%20PR%c3%81TICAS%20COMERCIAIS%20DESLEAIS.pdf (2026-11-28) |
| Marca «Rastoplan» | Sem resultados no EUIPO para `rastoplan`, `rastaplan`, `rastoplano`; TMview e INPI inacessíveis | P | https://euipo.europa.eu/eSearch/ (2026-11-28) |

## 7. Revisão por advogado

Gatilhos avaliados:

- [ ] Categorias especiais em larga escala ou biometria: **não**.
- [ ] Saúde, finanças ou aconselhamento: **não** (o serviço mede peças; não aconselha).
- [ ] Crianças: **não** (profissional, 18 anos).
- [ ] Decisões automatizadas com efeitos jurídicos: **não**.
- [ ] IA de risco elevado: **não** (sem IA).
- [ ] Mercado/UGC em escala: **não** (conteúdos privados).
- [ ] Atividade regulada: **não**.
- [ ] Primeiro contrato empresarial com DPA ou responsabilidade à medida: **ainda não** (verificar se o primeiro cliente maior o pedir).
- [ ] Receita > ~€100 000/ano: **não** (cenário base ≈ €3 000 no ano 1).

**Conclusão: revisão por advogado não necessária para o lançamento; recomendada antes do primeiro contrato empresarial com termos à medida ou antes de qualquer receita relevante** (HT-09, opcional, ≈ 1 hora). **Perguntas para o advogado** (curtas, para a reunião):

1. A cláusula de limitação de responsabilidade dos Termos §10 (12 meses de pagamentos; sem dolo nem negligência grosseira) resiste ao DL 446/85 (arts. 18.º e 19.º) numa relação entre empresas, dado que um erro de quantidade pode custar muito mais do que €129?
2. O Regulamento dos Dados (cap. VI) aplica-se a este SaaS? As cláusulas de saída do §12 bastam?
3. O armazenamento privado de ficheiros é «alojamento» no sentido do DSA? Basta o e-mail como canal de notificação (art. 16.º)?
4. O Livro de Reclamações Eletrónico é obrigatório para um prestador só B2B? Há algum risco em registar?
5. A comparação de preços com o civils.ai (secção 9) cumpre o art. 16.º do Código da Publicidade?
6. O *outbound* por e-mail a pessoas coletivas (incluindo empresários em nome individual) e a lista de oposição da DGC.
7. A conservação das faturas durante 10 anos prevalece sobre um pedido de apagamento (art. 17.º, n.º 3, al. b) RGPD)?
8. A cortesia de reembolso, a declaração de uso profissional e a exclusão de consumidores bastam se um consumidor criar conta?

## 8. Registo de decisões e próximas revisões

- **2026-11-28 — sem página de livre resolução:** produto só B2B, `sellsToConsumers=false`; reembolso de cortesia nos Termos §4 (ver também `docs/adr/0004-payments-ledger.md`).
- **2026-11-28 — idade mínima 18; sem DPO; sem RAL.**
- **2026-11-28 — banner para estatísticas do PostHog** (ADR 0007); a alternativa «sem banner» (Plausible sem cookies) fica registada como plano B se o consentimento for baixo.
- **2026-11-28 — retenções** (pressuposto 7), registos do servidor a 30 dias e cópias da BD a 7 dias, em vez dos defeitos do playbook (90 e 35 dias), por serem os da arquitetura e mais curtos.
- **2026-11-28 — nota de rascunho nas páginas públicas:** a 1.ª linha de cada página é uma definição de ligação Markdown (`[//]: # "…"`), que não é HTML, não se mostra (testado com `marked` 18.1.0, a biblioteca da starter, com valores de exemplo para as chaves) e não contém chaves, `FILL` nem `TEMPLATE-NOTICE`; assim a verificação de publicação do playbook continua a não imprimir nada e a nota «não é aconselhamento jurídico» não aparece no corpo da página. Os H1 coincidem com as etiquetas do rodapé.
- **2026-11-28 — nada de IA nas páginas além da frase «não usamos IA»**, que tem de ser reescrita se US-07 for ativada (`legal/ai-act-note.md` §6).
- **Rever quando:** novo fornecedor/SDK/campo/chave de armazenamento; novo mercado ou moeda; nova funcionalidade de IA (US-07); mudança de preços ou da política de reembolso; mudança para consumidores; primeiro utilizador menor ou consumidor identificado; mudança de entidade ou de regime de IVA; aplicação móvel; 90 dias após a última verificação (**2027-02-26**); decisão do TJUE no processo C-703/25 P; publicação de orientações da CNPD sobre cookies; adoção do Omnibus digital (Regulamento dos Dados/cookies); transposição portuguesa da Dir. 2023/2673.

## 9. Outros regimes avaliados e restrições para o `gtm`

**Regimes ponderados** (uma linha cada):

- **P2B (Reg. 2019/1150):** N/A (não é serviço de intermediação em linha).
- **COPPA (EUA, menores de 13):** N/A (profissional; idade mínima 18; não vende nos EUA).
- **Regulamento de Ciberresiliência:** N/A para SaaS puro; SEC-01.
- **Regulamento dos Dados:** provavelmente aplicável (SaaS); SEC-02.
- **NIS2:** N/A (micro-empresa); SEC-03.
- **DSA:** alojamento; secção 1; deveres mínimos (contactos no Aviso Legal §5, termos de moderação no §6 dos Termos, canal de denúncia por e-mail, exposição de motivos, art. 18.º no *runbook*).
- **EAA:** fora do âmbito por microempresa (AC-01), mas WCAG 2.2 AA como meta de qualidade.
- **IVA:** B2B sem OSS (TX-03); decisão do contabilista (HT-04).

**Restrições para o `growth-marketer` / `gtm`** (alegações e comunicação):

1. **Nunca** escrever «conforme com o RGPD», «certificado», «100 % seguro», «dados só na UE» nem «não partilhamos dados». A formulação rigorosa é: **«ficheiros guardados na UE (Frankfurt); no MVP as peças não são enviadas a nenhum fornecedor de IA»** (PRD §7, Alegações 4; Privacidade §6 explica as transferências de apoio).
2. **Sem IA** em nenhum texto, anúncio ou *outbound* até US-07 existir e `legal/ai-act-note.md` ser revisto (o produto é geometria determinística).
3. **Sem percentagem de precisão** nem «certificado» (PRD §7, Alegações 1); dizer «assistente de medição», «a rever pelo utilizador».
4. **Nada sobre erros e omissões nem sobre o art. 50.º do CCP** até US-09/US-10 existirem (PRD §7, Alegações 2).
5. **Comparação com o civils.ai** (PRD §7, Alegações 3; `docs/02-business.md` §5): publicidade comparativa só é lícita se compara características essenciais, comparáveis e verificáveis, não induz em erro, não denigre nem tira partido da marca do concorrente (Código da Publicidade art. 16.º e DL 57/2008 — texto por ler, secção 6). **Estado: «condicionada» até o `gtm` cumprir tudo isto:** (a) mostrar à vista a fonte (a página de preços do civils.ai), a data de acesso e a taxa de câmbio usada; (b) comparar escalões equivalentes e dizer como se calcula («preço por folha, tabela pública, sem IVA»), sem juntar o melhor Passe a um escalão baixo do concorrente; (c) dizer, junto à comparação, que o Rastoplan só lê PDF vetorial exportado de CAD e **não** usa IA, enquanto o concorrente declara aceitar digitalizados (o serviço não é equivalente); (d) **reverificar o preço do concorrente em ≤ 30 dias antes de publicar** e retirar a alegação se mudar; (e) sem o logótipo nem imagens do concorrente; (f) sem adjetivos («mais caro», «enganador»).
6. **Sem avaliações, depoimentos ou logótipos de clientes** sem autorização escrita; sem contagens decrescentes nem escassez falsa; «Preço de lançamento: primeiras 10 empresas» só enquanto for verdade e com o contador real.
7. **Outbound por e-mail ou LinkedIn:** só a **pessoas coletivas** (PRD R3), enviado manualmente pelo fundador, identificando o remetente e o fim comercial (DL 7/2004 art. 21.º), com uma forma simples de recusar, parando imediatamente se houver oposição (guardar só o endereço, 5 anos) e **consultando a lista de oposição da DGC** antes de enviar (Lei 41/2004 art. 13.º-A e 13.º-B: ler o texto consolidado antes da primeira campanha). Empresários em nome individual são pessoas singulares: só com consentimento. Informar a fonte dos dados no primeiro contacto (RGPD art. 14.º; a Privacidade §11 já o diz). Registo de contactos fora do repositório (nunca commitar contactos).
8. **Pixels, GA4, LinkedIn Insight, remarketing, gravação de sessões, testes A/B com identificadores:** proibidos no MVP; qualquer um exige o mecanismo de consentimento, a Política de Cookies e a de Privacidade atualizadas **antes** de ativar.
9. **UTM e funil:** só com consentimento (eventos de cliente); as decisões de mata-ou-pivota usam as vistas da BD.
10. **Reembolso:** a promessa de 14 dias na primeira compra é a dos Termos §4; qualquer garantia maior (por exemplo «30 dias») tem de ser escrita primeiro nos Termos e no checkout.
11. **Prazos e desempenho:** nenhum «em minutos», «sem erros» ou «precisão de X %» sem comparações reais registadas (PRD §8, T3); o tempo de processamento não é garantido (Termos §8).
