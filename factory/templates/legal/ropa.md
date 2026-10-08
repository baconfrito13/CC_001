<!-- TEMPLATE-NOTICE: Modelo gerado para products/<slug>/legal/ropa.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado em tratamentos de risco elevado ou receita significativa. Documento INTERNO: não publicar nem copiar para a aplicação. Substituir todos os <…>, apagar as instruções em itálico e este comentário. Não escrever NIF, morada ou contactos reais de pessoas (ficam em env/config). -->

# Registo das atividades de tratamento (RoPA) — <Nome do produto>

> RGPD art. 30.º. Fonte única de verdade para a Política de Privacidade, a Política de Cookies, os formulários das lojas (App Privacy, Data safety) e o DPA. Atualizar sempre que mudar um fornecedor, um campo recolhido, um SDK ou uma finalidade.

**Versão:** <n> · **Data:** <AAAA-MM-DD> · **Última reconciliação com o código:** <AAAA-MM-DD — comando `rg` usado — resultado> · **Origem dos dados:** `docs/04-architecture.md`, `<app_dir>/`

## 1. Responsável pelo tratamento (art. 30.º, n.º 1, al. a))

| Campo | Valor |
|---|---|
| Denominação / firma | <ver config `company.legalName`> |
| NIF e morada | <ver config; não copiar para o repositório> |
| Contacto de privacidade | <`contact.privacyEmail`> |
| Representante na UE (art. 27.º) | N/A — estabelecido em Portugal |
| Encarregado de proteção de dados | Não designado: <razão — art. 37.º não se verifica (sem monitorização regular e sistemática em grande escala nem categorias especiais em grande escala)> |
| Autoridade de controlo | CNPD (https://www.cnpd.pt) |

## 2. Atividades de tratamento como responsável (art. 30.º, n.º 1, als. b)–g))

*Uma linha por atividade realmente efetuada. Prazos concretos. Base de licitude segundo o art. 6.º do RGPD (e art. 9.º se houver categorias especiais). Destinatários remetem para `legal/subprocessors.md`.*

| ID | Atividade e finalidade | Titulares | Categorias de dados | Base de licitude | Destinatários | Transferência fora do EEE (salvaguarda) | Conservação | Evidência (doc/código) |
|---|---|---|---|---|---|---|---|---|
| RoPA-01 | Contas e autenticação: criar e gerir a conta | Utilizadores | Nome, e-mail, hash da palavra-passe, idioma, identificadores de sessão | Contrato (6.º/1/b) | <alojamento, base de dados> | <não / EUA: DPF + CCT> | Conta ativa + 30 dias | <ficheiro/rota> |
| RoPA-02 | Faturação e pagamentos | Clientes | Nome, morada de faturação, NIF/IVA, plano, faturas, marca e últimos 4 dígitos do cartão | Contrato (b); obrigação legal (c) | <Stripe / MoR>, contabilista | <…> | Faturas 10 anos (confirmar com contabilista) | <webhook …> |
| RoPA-03 | Apoio ao cliente | Utilizadores | Mensagens, e-mail, contexto técnico | Contrato / interesse legítimo (b/f) | <ferramenta de apoio> | <…> | 24 meses após encerrar | <…> |
| RoPA-04 | Segurança, deteção de abuso e registos de servidor | Visitantes e utilizadores | IP, user-agent, eventos de autenticação | Interesse legítimo (f) | <alojamento, monitorização> | <…> | 90 dias | <…> |
| RoPA-05 | Analítica de utilização sem cookies | Visitantes | Página, referência, país aproximado, hash diário do IP+UA (sem identificador persistente) | Interesse legítimo (f) — ver §3 | <ferramenta> | <…> | 14 meses (agregados) | `rg` do passo 2b |
| RoPA-06 | Marketing por e-mail | Subscritores / clientes | E-mail, preferências, prova de consentimento | Consentimento (a); *soft opt-in* (Lei 41/2004, art. 13.º-A) | <serviço de e-mail> | <…> | Até cancelar + 3 anos (prova) | <…> |
| RoPA-07 | Funcionalidades de IA | Utilizadores | Entradas e saídas (prompts, ficheiros) | Contrato (b) | <fornecedor de IA> | <…> | <período; sem treino com dados> | `legal/ai-act-note.md` |
| RoPA-08 | Pedidos de titulares e violações | Qualquer titular | Identificação, pedido, resposta | Obrigação legal (c) | — | — | 3 anos | §7 |

## 3. Interesse legítimo — avaliação de ponderação (art. 6.º, n.º 1, al. f))

*Preencher para cada atividade com base em (f). Se a ponderação for desfavorável ou o impacto for elevado, mudar a base (consentimento) ou desativar.*

| Atividade | Interesse prosseguido | Necessidade (alternativa menos intrusiva?) | Ponderação (expectativas razoáveis, impacto, salvaguardas) | Conclusão |
|---|---|---|---|---|
| RoPA-04 | Segurança e prevenção de fraude | <…> | <expectável; mínimo de dados; 90 dias> | <válido> |
| RoPA-05 | Melhorar o produto com estatísticas agregadas | <sem identificadores; sem partilha com terceiros> | <direito de oposição em contact.privacyEmail> | <válido> |

## 4. Registo como subcontratante (art. 30.º, n.º 2) — apenas se `processor-role`

| Categoria de cliente (responsável) | Categorias de tratamento | Transferências fora do EEE | Medidas de segurança | DPA |
|---|---|---|---|---|
| <empresas que usam o serviço> | <alojar, armazenar, tratar dados dos seus clientes/trabalhadores> | <…> | Ver §5 | `legal/dpa.md` |

## 5. Medidas técnicas e organizativas (art. 32.º) — resumo

- [ ] Cifragem em trânsito (TLS) e em repouso · [ ] Controlo de acessos por privilégio mínimo e MFA para administração · [ ] Segredos apenas em variáveis de ambiente · [ ] Cópias de segurança testadas (retenção ≤ <35> dias) · [ ] Registos de auditoria · [ ] Gestão de vulnerabilidades e atualizações · [ ] Separação de ambientes · [ ] Formação/consciencialização do fundador · [ ] Procedimento de violações (72 h) · Evidência: `docs/06-qa-report.md`.

## 6. Reconciliação com o código

*Executar o comando do passo 2b do playbook; cada achado tem de ter linha aqui ou ser removido.*

| Achado (SDK / variável de ambiente / cookie / campo) | Onde | Atividade RoPA | Fornecedor | Estado (coberto / corrigir / removido) |
|---|---|---|---|---|
| <ex.: `STRIPE_SECRET_KEY`> | <`src/lib/stripe.ts`> | RoPA-02 | <Stripe> | <coberto> |

## 7. Registos operacionais

**Pedidos de titulares (art. 12.º–22.º):** | Data | Direito | Titular (id interno) | Prazo (1 mês) | Resposta | Fecho |
**Violações (art. 33.º, n.º 5):** | Data de conhecimento | Descrição | Dados e titulares afetados | Risco | Notificação à CNPD (≤ 72 h) | Comunicação aos titulares | Medidas |

## 8. Histórico de alterações

| Versão | Data | Alteração | Motivo | Autor |
|---|---|---|---|---|
| <1> | <data> | Criação a partir de `docs/04-architecture.md` | Fase `legal` | legal-counsel |
