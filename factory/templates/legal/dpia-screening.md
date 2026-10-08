<!-- TEMPLATE-NOTICE: Modelo gerado para products/<slug>/legal/dpia-screening.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado sempre que a triagem indicar que é necessária uma AIPD (DPIA) ou que o tratamento é de risco elevado. Documento INTERNO. Substituir todos os <…>, apagar as instruções em itálico e este comentário. -->

# Triagem de AIPD (DPIA) — <Nome do produto>

> RGPD art. 35.º; Regulamento n.º 1/2018 da CNPD (lista de tratamentos sujeitos a AIPD); critérios do WP248 rev.01 (Grupo de Trabalho do Artigo 29.º, subscritos pelo CEPD). Objetivo: decidir, com razões, se é obrigatória uma avaliação de impacto antes do lançamento.

**Versão:** <n> · **Data:** <AAAA-MM-DD> · **Baseado em:** `legal/ropa.md` v<n>, `docs/04-architecture.md`

## 1. Resumo do tratamento

<Em 5–8 linhas: quem são os titulares, que dados, para que finalidades, quantos titulares previstos (ordem de grandeza), tecnologias novas (IA, biometria, geolocalização), fornecedores principais, transferências. Remeter para as linhas do RoPA.>

## 2. Casos de AIPD obrigatória (art. 35.º, n.º 3)

| Caso | Aplica-se? | Razão |
|---|---|---|
| a) Avaliação sistemática e extensiva de aspetos pessoais baseada em tratamento automatizado (incluindo definição de perfis) que produza efeitos jurídicos ou afete significativamente de modo similar | <sim/não> | <…> |
| b) Tratamento em grande escala de categorias especiais (art. 9.º) ou de dados sobre condenações penais e infrações (art. 10.º) | <sim/não> | <…> |
| c) Controlo sistemático de zonas acessíveis ao público em grande escala | <sim/não> | <…> |

## 3. Lista da CNPD (Regulamento n.º 1/2018)

*Ler o regulamento em https://www.cnpd.pt (secção Regulamentos) e confirmar na altura da execução se foi alterado. Marcar se algum ponto se aplica; resumo dos tipos de tratamento listados:*

| Tipo de tratamento (resumo) | Aplica-se? |
|---|---|
| Dados de saúde recolhidos por dispositivos eletrónicos que os transmitem por redes de comunicação | <sim/não> |
| Interconexão de dados pessoais ou tratamento que relacione dados do art. 9.º/10.º ou dados de natureza altamente pessoal | <sim/não> |
| Recolha indireta de dados sensíveis/altamente pessoais quando não é possível cumprir o dever de informação (art. 14.º, n.º 5, al. b)) | <sim/não> |
| Seguimento da localização ou do comportamento com efeito de avaliar ou classificar pessoas (exceto se indispensável ao serviço pedido) | <sim/não> |
| Dados sensíveis para fins de arquivo de interesse público, investigação científica/histórica ou estatística | <sim/não> |
| Dados biométricos para identificação inequívoca de pessoas vulneráveis; dados genéticos de pessoas vulneráveis | <sim/não> |
| Dados sensíveis/altamente pessoais com utilização de novas tecnologias ou novo uso de tecnologias existentes | <sim/não> |

## 4. Os nove critérios do WP248

*Regra de decisão: dois ou mais critérios ⇒ AIPD provavelmente necessária; um critério ⇒ avaliar caso a caso; zero ⇒ não necessária.*

| # | Critério | Aplica-se? | Razão |
|---|---|---|---|
| 1 | Avaliação ou classificação (scoring, perfis, previsão de comportamento) | <sim/não> | <…> |
| 2 | Decisões automatizadas com efeitos jurídicos ou similares | <sim/não> | <…> |
| 3 | Monitorização sistemática | <sim/não> | <…> |
| 4 | Dados sensíveis ou de natureza altamente pessoal (incl. localização, comunicações, financeiros) | <sim/não> | <…> |
| 5 | Tratamento em grande escala | <sim/não> | <…> |
| 6 | Cruzamento ou combinação de conjuntos de dados | <sim/não> | <…> |
| 7 | Titulares vulneráveis (crianças, trabalhadores, doentes) | <sim/não> | <…> |
| 8 | Uso inovador ou aplicação de novas soluções tecnológicas ou organizacionais (ex.: IA generativa a tratar dados de terceiros) | <sim/não> | <…> |
| 9 | Tratamento que impede os titulares de exercer um direito ou de usar um serviço/contrato | <sim/não> | <…> |

**Total de critérios:** <n>

## 5. Decisão

- [ ] **AIPD não necessária.** Razões: <…>. Medidas já previstas: <minimização, retenção curta, sem decisões automatizadas…>. Rever se: <novo fornecedor, nova funcionalidade de IA, mudança de escala…>.
- [ ] **AIPD necessária.** Tratamento(s): <…>. **Escalar para revisão por advogado antes do lançamento** (HT-<xx>); lançar apenas depois de concluída ou com o tratamento desativado por *feature flag*. Se o tratamento não puder mitigar o risco elevado residual, consulta prévia à CNPD (art. 36.º).

## 6. Esboço mínimo de uma AIPD (preencher apenas se necessária)

1. Descrição sistemática do tratamento, finalidades e interesse legítimo (se aplicável).
2. Necessidade e proporcionalidade (base de licitude, minimização, conservação, informação, direitos, subcontratantes, transferências).
3. Riscos para os direitos e liberdades (acesso ilegítimo, modificação indesejada, perda de dados; discriminação, perda de confidencialidade, danos financeiros ou reputacionais) — probabilidade × gravidade.
4. Medidas para fazer face aos riscos (técnicas e organizativas) e risco residual.
5. Opinião dos titulares ou seus representantes (se adequado) e do EPD (se existir).
6. Aprovação e calendário de revisão.

*Se o produto tiver IA de risco elevado (Regulamento da IA, art. 27.º), a avaliação de impacto sobre direitos fundamentais pode incluir ou remeter para partes da AIPD (alteração do Reg. (UE) 2026/1744).*

## 7. Aprovação

| Quem | Data | Decisão |
|---|---|---|
| legal-counsel (agente) | <data> | <…> |
| Fundador / advogado (se escalado) | <data> | <…> |
