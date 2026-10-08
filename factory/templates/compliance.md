<!-- TEMPLATE-NOTICE: modelo gerado para products/<slug>/docs/07-compliance.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado em tratamentos de risco elevado ou receita significativa. Escrever em pt-PT. Substituir todos os <…>, apagar este comentário e as instruções em itálico. Não colocar NIF, morada ou telefone reais neste ficheiro (ficam em env/config). -->

# Conformidade legal — <Nome do produto>

**Produto:** `<slug>` · **Fase:** 07 `legal` · **Profundidade:** <lean|standard|deep> · **Data:** <AAAA-MM-DD> · **Versão:** <n> · **Checklist:** `factory/checklists/legal-eu-pt.md` (verificada em <AAAA-MM-DD>)

> Rascunhos e registos preparados por um agente; não substituem aconselhamento jurídico. Revisão por advogado recomendada quando se verifique algum dos gatilhos da secção 7.

## 1. Classificação do produto

| Sinalizador | Valor | Notas / fonte |
|---|---|---|
| Clientes (`b2c` / `b2b`) | <consumidores · empresas · ambos> | <docs/02-product.md> |
| Venda de produtos/serviços (`sells`) | <sim/não> · pagamentos via <MoR (nome) / Stripe próprio / nenhum> | <docs/02-business.md, 04-architecture.md> |
| Papel de subcontratante (`processor-role`) | <sim/não> | <clientes carregam dados pessoais de terceiros?> |
| Conteúdo gerado por utilizadores (`ugc`) | <não / alojamento / plataforma / mercado> | <DSA> |
| IA (`ai`) | <não / sim: modelos e fornecedores> | <legal/ai-act-note.md> |
| Dados especiais (`special-data`) | <não / quais> | <DPIA> |
| Crianças (`kids`) | <não dirigido; idade mínima X> | <Lei 58/2019 art. 16: 13 anos> |
| App / extensão / desktop (`app`) | <sim/não: lojas> | <CRA, regras das lojas> |
| Rastreio (`tracking`) | <só essencial + analítica sem cookies / banner de consentimento> | <Passo 3 do playbook> |
| Atividade regulada (`regulated`) | <não / qual> | <escalar> |

**Pressupostos assumidos** (cada um é reversível): <lista numerada: entidade jurídica, regime de IVA, ausência de adesão a entidade RAL, MoR, idade mínima, etc.>

## 2. Mapa de dados (resumo)

Detalhe em `legal/ropa.md` e `legal/subprocessors.md`. Última reconciliação com o código: <AAAA-MM-DD, comando usado, resultado>.

| Atividade | Base de licitude | Subcontratantes / destinatários | Transferência fora do EEE | Conservação |
|---|---|---|---|---|
| <Contas e autenticação> | Art. 6(1)(b) | <fornecedor> | <não / EUA: DPF+CCT> | <período> |
| <…> | | | | |

## 3. Estado por item da checklist

Estados: **Cumpre** · **Parcial** · **Em falta** · **N/A** (com razão). A evidência é um caminho no repositório ou um URL com data de acesso.

| ID | Item | Estado | Evidência | Notas / ação |
|---|---|---|---|---|
| ID-01 | Identificação do prestador (DL 7/2004 art. 10) | <estado> | `legal/public/legal-notice.{pt,en}.md` | |
| ID-02 | Livro de Reclamações Eletrónico (DL 156/2005) | <estado> | <registo + ecrã do rodapé> | <HT-xx> |
| ID-03 | Informação RAL (Lei 144/2015 art. 18) | <estado> | | <decisão: não vinculado/vinculado a …> |
| ID-04 | Sem ligação à plataforma ODR (encerrada 20-07-2025) | <estado> | `rg 'consumers/odr'` vazio | |
| ID-05 | Comunicações comerciais identificáveis | <estado> | | |
| ID-06 | Páginas legais em todos os idiomas | <estado> | `legal/public/` | |
| DP-01 | Registo das atividades de tratamento | <estado> | `legal/ropa.md` | |
| DP-02 | Base de licitude por finalidade | <estado> | | |
| DP-03 | Aviso de privacidade | <estado> | `privacy.{pt,en}.md` | |
| DP-04 | Exercício de direitos dos titulares | <estado> | <runbook> | |
| DP-05 | Subcontratantes com DPA | <estado> | `legal/subprocessors.md` | <HT-xx> |
| DP-06 | Papel de subcontratante perante clientes | <estado/N/A> | `legal/dpa.md` | |
| DP-07 | Transferências internacionais | <estado> | | |
| DP-08 | Prazos de conservação | <estado> | | |
| DP-09 | Segurança do tratamento | <estado> | `docs/06-qa-report.md` | |
| DP-10 | Violações de dados (72 h) | <estado> | <runbook> | |
| DP-11 | Triagem de AIPD/DPIA | <estado> | `legal/dpia-screening.md` | |
| DP-12 | Encarregado de proteção de dados | <estado> | | <não exigido, porquê> |
| DP-13 | Dados de crianças | <estado> | | |
| DP-14 | Marketing direto (Lei 41/2004 art. 13-A) | <estado/N/A> | | |
| DP-15 | Decisões automatizadas / perfis | <estado/N/A> | | |
| DP-16 | Proteção de dados desde a conceção | <estado> | | |
| DP-17 | Representante na UE | N/A | estabelecido em Portugal | |
| CK-01 | Inventário de armazenamento/SDK | <estado> | | |
| CK-02 | Consentimento prévio (se aplicável) | <estado/N/A> | <teste de rede> | |
| CK-03 | Caminho sem consentimento documentado | <estado/N/A> | | |
| CK-04 | Política de cookies | <estado> | `cookies.{pt,en}.md` | |
| CK-05 | Conteúdos incorporados de terceiros | <estado/N/A> | | |
| CK-06 | Alterações legislativas pendentes | <estado> | | |
| CL-01 | Informação pré-contratual | <estado/N/A> | | |
| CL-02 | Botão «encomenda com obrigação de pagar» | <estado/N/A> | | |
| CL-03 | Confirmação em suporte duradouro | <estado/N/A> | | |
| CL-04 | Livre resolução 14 dias + formulário | <estado/N/A> | `withdrawal.{pt,en}.md` | |
| CL-05 | Pedido expresso + reconhecimento (conteúdos/serviços digitais) | <estado/N/A> | | |
| CL-06 | Função de resolução do contrato (19-06-2026) | <estado/N/A> | | <transposição PT: verificar> |
| CL-07 | Reembolso em 14 dias | <estado/N/A> | | |
| CL-08 | Conformidade de conteúdos/serviços digitais (DL 84/2021) | <estado/N/A> | `terms.{pt,en}.md` | |
| CL-09 | Cláusulas contratuais gerais | <estado> | | |
| CL-10 | Indicação de preços com IVA | <estado/N/A> | | |
| CL-11 | Preço de referência a 30 dias | <estado/N/A> | | |
| CL-12 | Subscrições e renovação | <estado/N/A> | | |
| CL-13 | Práticas comerciais desleais | <estado> | | |
| CL-14 | Execução e indisponibilidade | <estado/N/A> | | |
| AC-01 | Âmbito do Ato Europeu da Acessibilidade (DL 82/2022) | <estado> | <microempresa: justificação> | |
| AC-02 | WCAG 2.2 AA | <estado> | `docs/06-qa-report.md` | |
| AC-03 | Contacto de acessibilidade | <estado> | | |
| AI-01 … AI-08 | Regulamento da IA | <estado/N/A> | `legal/ai-act-note.md` | |
| DSA-01 … DSA-07 | Regulamento dos Serviços Digitais | <estado/N/A> | | |
| TX-01 … TX-06 | IVA e faturação | <estado/N/A> | | <confirmar com contabilista certificado> |
| AS-01 … AS-06 | Lojas de aplicações | <estado/N/A> | | |
| SEC-01 … SEC-03 | CRA, Data Act, NIS2 | <estado/N/A> | | |
| IP-01 … IP-03 | Propriedade intelectual | <estado> | `legal/trademark-check.md` | |

## 4. Requisitos para a integração

*Copiar do Passo 7 do playbook apenas o que se aplica e marcar o estado no QA.*

- [ ] Rodapé: privacidade · termos · cookies (e «Definições de cookies») · livre resolução e reembolsos · aviso legal · botão oficial do Livro de Reclamações → `{{legal.complaintsBookUrl}}`.
- [ ] Checkout: preço com IVA, renovação e cancelamento; botão «Encomendar com obrigação de pagar»; caixa não pré-marcada de pedido expresso e reconhecimento; e-mail de confirmação com formulário de livre resolução.
- [ ] Função «Resolver o contrato aqui» (dois passos, sem login, e-mail de receção).
- [ ] Banner de consentimento (apenas se necessário): Aceitar e Rejeitar ao mesmo nível; nada carrega antes do consentimento.
- [ ] Apagamento e exportação de conta; cancelamento do envio de e-mails.
- [ ] Rótulos de IA; fluxo de denúncia de conteúdos (se `ugc`).

## 5. Itens em aberto → tarefas do fundador

| # | Item | Origem (ID) | Tipo | Tarefa | Prioridade |
|---|---|---|---|---|---|
| 1 | <ex.: registar no Livro de Reclamações Eletrónico> | ID-02 | Fundador | HT-<xx> | 🔴 |
| 2 | <ex.: aceitar os DPA dos fornecedores> | DP-05 | Fundador | HT-<xx> | 🔴 |
| 3 | <ex.: corrigir fluxo X> | CL-05 | Engenharia | ticket do ciclo de correções | 🟡 |

## 6. Factos voláteis reverificados nesta execução

| Facto | Estado em <AAAA-MM-DD> | Fonte (URL + data de acesso) |
|---|---|---|
| Plataforma ODR encerrada em 20-07-2025 | <confirmado> | <URL> |
| Regulamento da IA: datas em vigor / Omnibus (Reg. 2026/1744) | <…> | <URL> |
| Transposição PT da função de resolução (Dir. 2023/2673) | <…> | <URL> |
| Quadro de Privacidade UE–EUA (DPF) | <válido / recurso pendente> | <URL> |
| <outros> | | |

## 7. Revisão por advogado

Gatilhos avaliados (marcar os que se verificam e explicar): [ ] categorias especiais em larga escala ou biometria · [ ] saúde/finanças/aconselhamento · [ ] crianças · [ ] decisões automatizadas com efeitos jurídicos · [ ] IA de risco elevado · [ ] mercado / UGC em escala · [ ] atividade regulada · [ ] primeiro contrato empresarial com DPA/responsabilidade à medida · [ ] receita > ~100 mil €/ano.

**Conclusão:** <revisão necessária agora / recomendada antes de <marco> / não necessária por agora>. Perguntas para o advogado: <lista curta, se aplicável>.

## 8. Registo de decisões e próximas revisões

- Decisões: <data — decisão — motivo> (ver também `docs/adr/`).
- Rever quando: novo fornecedor/SDK/campo, novo mercado ou moeda, nova funcionalidade de IA, alteração de preços/reembolsos, mudança B2C↔B2B, primeiro utilizador menor reportado, ou 90 dias após a última verificação.
