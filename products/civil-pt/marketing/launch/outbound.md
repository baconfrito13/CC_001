# Contacto direto (canal 1) — método, mensagens e demonstração

> **Canal principal** (`docs/08-gtm.md` §5). **O fundador envia tudo**: Claude prepara a lista, os textos por contacto e o registo; nenhuma mensagem sai sem aprovação (lotes de 5 contactos ≈ 5 min, `schedule.md`). Funil esperado (PRD §8; PRESSUPOSTOS): 50 contactos por mês → 8 % de respostas → 60 % pedem demonstração → 12 % das demonstrações compram. **Probabilidade de zero pagantes nos primeiros 90 dias: ≈ 13,6 %** (`docs/02-business.md`): é esperado, não é falha.

## 1. Quem contactar

- **Conta-alvo:** empresas de construção (CAE 42 e 43, ≥ 10 pessoas; ≈ 879 no universo do PRD §2) que executam pavimentos, arranjos exteriores e redes, ou subempreiteiros dessas obras. Preferir quem ganha concursos até ≈ 1,6 M€ (segundo o barómetro AICCOPN até junho de 2026, 58 % dos concursos promovidos tinham preço base ≤ 0,4 M€ e 29 % entre 0,4 e 1,6 M€; `docs/research/audience.md` [S5]).
- **Pessoa:** orçamentista/medidor ou diretor técnico; em PME, o sócio-gerente. **Uma pessoa por empresa.**
- **Como construir a lista (≈ 150 empresas, 50 por mês):**
  1. Portal BASE (https://www.base.gov.pt/Base4/pt/): pesquisa de contratos, filtro «Entidade adjudicatária»; empreitadas recentes de pavimentação, arranjos exteriores, redes de água e saneamento. Fonte pública; **confirmar as condições de reutilização antes de qualquer exportação em massa** (a página não as indica; ver https://dados.gov.pt/pt/organizations/impic-i-p-instituto-dos-mercados-publicos-do/). Para ≈ 150 consultas manuais, a pesquisa pública chega.
  2. Sítio da empresa e LinkedIn (perfil público) para achar o cargo e o canal. **Não adivinhar e-mails pessoais.**
  3. **Só pessoas coletivas** (sociedades: Lda, SA…; NIPC iniciado por 5, a confirmar na Autoridade Tributária). **Excluir empresários em nome individual**: 48,3 % das empresas de construção em Portugal são empresas individuais e o e-mail frio a pessoas singulares exige consentimento (Lei n.º 41/2004, art. 13.º-A; `docs/research/risks.md` S17). Para estas, só contacto manual via LinkedIn em contexto profissional.
- **Fora do alvo (anti-ICP):** quem só trabalha com edifícios residenciais e DWG; quem só tem PDF digitalizado; particulares e donos de obra.

## 2. Regras de conformidade (RoPA-10, `legal/ropa.md`)

- Base: interesse legítimo (art. 6.º, n.º 1, al. f) RGPD), contactos profissionais de fontes públicas, **baixo volume (≈ 600 por ano), manual e personalizado**. Avaliação de equilíbrio no `legal/ropa.md`; **o `legal-counsel` confirma antes do 1.º lote**.
- **Informação do art. 14.º RGPD na 1.ª mensagem** (quem somos, fonte do contacto, finalidade, como se opor) e oposição em 1 resposta: cada primeira mensagem inclui a linha «Informação sobre dados» abaixo.
- **Registo dos contactos num ficheiro privado do fundador, fora do repositório** (colunas na §6; sem SaaS, por isso **sem novo subcontratante**: decisão da fase `gtm` para a linha «Ferramenta de registo dos contactos» de `legal/subprocessors.md`, que o `legal` deve atualizar). Retenção: 12 meses sem resposta; oposição: guardar só o endereço, 5 anos (RoPA-10).
- **No máximo 2 toques por pessoa** (mensagem + 1 seguimento). Parar à primeira oposição. Sem automatização do LinkedIn (os termos proíbem; reverificar). Sem anexos nem ligações encurtadas na 1.ª mensagem.
- Nenhuma alegação além de `copy/messaging.md` §6: **nada de percentagens, «IA», «poupa X horas», erros e omissões, CCP, «primeiro», «melhor»**.

Linha «Informação sobre dados» (final de todas as primeiras mensagens): «Obtive o seu contacto profissional em fontes públicas ({{fonte}}) para lhe apresentar o Rastoplan. Se não quiser receber mais mensagens minhas, responda «parar» e não volto a contactá-lo. Mais informação: {{domain}}/pt/legal/privacy.»

## 3. A oferta

«Uma demonstração de 15 minutos, numa folha de um concurso seu (PDF vetorial exportado de CAD) ou numa folha de exemplo.» **Limite: 10 demonstrações nos primeiros 30 dias** (≈ 2,5 h de fundador, dentro das 5 h por semana). Confidencialidade: se a pessoa enviar o PDF, o projeto é apagado no fim da chamada (US-02) e confirma-se por escrito; nunca se guardam as peças de um cliente fora do projeto da própria conta.

## 4. Mensagens (pt-PT, voz do fundador; `{{ }}` = personalizar por contacto)

**M1 · Nota de ligação no LinkedIn (≤ 300 caracteres; limite a confirmar na conta)**
«Olá {{nome}}, vi que a {{empresa}} executou {{obra/município}}. Estou a construir uma ferramenta para medir plantas em PDF vetorial, com rasto até à folha. Posso mostrar-lha numa folha sua? 15 min.»

**M2 · 1.ª mensagem após ligação aceite**
«Obrigado por aceitar, {{nome}}. Sou {{fundador_nome}}. Criei o Rastoplan para quem orça pavimentos, arranjos exteriores e redes: lê a geometria de plantas em PDF vetorial, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel, com uma folha «Rasto» que diz de onde veio cada número.
Só lê PDF vetorial exportado de CAD e não mede volumes que dependam de perfis; digo-o já para não lhe fazer perder tempo.
Se tiver 15 minutos, mostro-lhe numa folha de um concurso seu. Se preferir, deixo o link para ver primeiro: {{domain}}/pt/?utm_source=linkedin&utm_medium=social&utm_campaign=202702-outbound&utm_content=m2
{{Informação sobre dados}}»

**M3 · E-mail (só a caixa profissional de pessoa coletiva; remetente identificado)**
Assunto (≤ 45): `Medir plantas em PDF, com rasto até à folha`
«Bom dia {{nome}},
Sou {{fundador_nome}}, do Rastoplan ({{domain}}). Vi que a {{empresa}} executou {{obra/município}}, por isso escrevo-lhe diretamente.
O Rastoplan lê plantas em PDF vetorial exportadas de CAD, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel, com rasto até à folha. Só lê PDF vetorial e não mede volumes que dependam de perfis.
Posso mostrar-lho em 15 minutos numa folha de um concurso seu?
{{fundador_nome}} · {{telefone/LinkedIn}}
{{Informação sobre dados}}»

**M4 · Seguimento (5 dias depois, uma só vez)**
«{{nome}}, volto a esta mensagem uma só vez. Se este tipo de medição não faz sentido para a {{empresa}} agora, diga-me e fico por aqui. Se fizer, o convite mantém-se: 15 minutos, numa folha sua.»

**Respostas-tipo (adaptar sempre)**
- *«Quanto custa?»* «Por concurso: Passe de 20, 60 ou 150 folhas por 59 €, 129 € ou 249 € (sem IVA), válido 90 dias. Ao mês: de 49 € a 199 €, sem fidelização. Uma folha é uma página de PDF processada. Há 5 folhas de avaliação.»
- *«Envie informação.»* «Claro: {{domain}}/pt/. Resumo: só lê PDF vetorial de CAD, mede áreas e comprimentos em planta, exporta Excel com rasto. Se quiser, mostro-lhe numa folha sua em 15 min.»
- *«Já temos CYPE/Bluebeam.»* «Faz sentido: o Rastoplan não é software de orçamentação (sem bases de preços nem BC3 nesta versão). Dá as quantidades da planta, com rasto, em Excel, para levar para o que já usam.»
- *«Funciona com DWG ou digitalizados?»* «Não: só PDF vetorial exportado de CAD. Se for o vosso caso, é melhor saber já.»
- *«Quem é a empresa? Onde ficam os ficheiros?»* «{{identificação legal quando existir}}. Os PDF ficam em armazenamento privado na UE e podem ser apagados; nesta versão não seguem para nenhum fornecedor de IA.»
- *«Parar» / oposição:* «Percebido, {{nome}}. Não volto a contactá-lo. Obrigado.» e registar a oposição.

## 5. Guião da demonstração (15 min)

1. **0–2 min · contexto:** «Que tipo de obra orça mais? Quantas folhas teve o último concurso? Quantos concursos por ano?» (`sheets_last_tender`, `tenders_per_year`).
2. **2–10 min · folha real ou de exemplo:** carregar, confirmar escala, rever 3 grupos sobre o desenho, atribuir a artigos, exportar, abrir a folha «Rasto». Dizer o que falhar; não prometer o que não existe.
3. **10–13 min · pergunta de confiança:** «As quantidades coincidem com o que mediria à mão?» (`trust_answer`: Sim/Quase/Não) e, se tiver medido à mão, que linhas ficaram fora de ±10 %.
4. **13–15 min · preço e próximo passo:** **uma** das três variantes, rodadas pela ordem das demonstrações (descendente: Passe 60 a 89 € / Empresa 69 €; controlo: 129 € / 99 €; ascendente: 159 € / 129 €), só como **pergunta de intenção**; perguntar «a que valor seria barato demais para confiar na ferramenta?» e «caro demais?» (`too_cheap_to_trust_eur`, `too_expensive_eur`). **O checkout cobra sempre o preço de controlo** (`docs/02-business.md` §5). Fechar com: «Quer experimentar com as 5 folhas de avaliação?»

## 6. Registo (ficheiro privado, sem dados pessoais em eventos nem no repositório)

Colunas: `contacto_id · empresa (NIPC) · cargo · fonte · lote · data_m1 · data_m2/m3 · data_m4 · resposta (sim/não/sem) · oposição (s/n) · demo (data) · demo_outcome (campos do PRD §9: sheets_last_tender, tenders_per_year, preferred_offer, price_arm, reaction, too_cheap_to_trust_eur, too_expensive_eur, real_sheet_uploaded, trust_answer, wants_owner_map_compare, needs_bc3, budget_software, plan_mix)`.

## 7. Critérios de decisão (T1–T2 do PRD §8)

- **L+30** (T1): se, com ≥ 40 contactos, as respostas forem ≤ 1, **rever a lista e a mensagem** (não é motivo para matar o produto).
- **L+60** (T2): se, com ≥ 8 respostas, houver ≤ 2 demonstrações, rever a oferta da demonstração.
- Registar cada resultado em `docs/10-growth.md`. Não decidir nada sobre o produto abaixo da amostra mínima.
