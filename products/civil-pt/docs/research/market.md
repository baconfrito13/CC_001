# Pesquisa — Mercado e procura · Medições PT

> **Faixa:** market · **Produto:** `civil-pt` · **Agente:** market-researcher · **Data:** 2026-11-26 · **Profundidade:** standard · **Pesquisas feitas:** ≈ 40 pesquisas/consultas web (WebSearch/WebFetch), ≈ 650 chamadas ao endpoint de autocomplete do Google (19 sementes PT/EN × letras e prefixos), 3 consultas à API do HN Algolia, ≈ 10 consultas à API de indicadores do INE

## 1. Perguntas e falsificadores

| Pressuposto (brief) | Pergunta | Falsificador | Resultado | Fontes |
|---|---|---|---|---|
| A1 | Empresas portuguesas de construção pagam por medições assistidas por IA (~€60–250/mês)? | Falso se não houver comparáveis com preço semelhante em uso por empresas PT, ou se o universo de compradores com ≥ 10 pessoas for < 500. | **Em aberto, inclinado para fraco.** Universo existe (879 empresas núcleo), mas não há nenhuma prova de pagamento por IA de medição em PT; o comparável local (CYPE Arquimedes Starter) custa €475 numa licença única. | [S4] [S5] [S15] [S2] |
| A3 | As plantas em PT chegam em PDF legível e não só em DWG? | Falso se o fluxo de medição português for dominantemente DWG/BIM (o PDF seria só cópia de leitura). | **Em aberto.** Sem dados sobre a quota PDF vs DWG. Indícios mistos: o módulo AQ1 da CYPE gera medições a partir de DWG/DXF; a estratégia BIM aprovada em 2026 empurra para modelos. | [S15] [S14] |
| A4 (parte de mercado) | O diferencial pt-PT (mapa de quantidades, terminologia) é procurado? | Falso se não houver pesquisas/perguntas em pt-PT sobre o problema, ou se a procura em PT for dominada por termos brasileiros. | **Parcialmente confirmado.** Existem ≈ 60 sugestões para "mapa de quantidades/medições" (termo pt-PT), mas o autocomplete pt-PT está contaminado por termos brasileiros (SINAPI, Orçafácio) e as frases de solução ("software de medições", "medição de plantas pdf") devolvem zero sugestões. | [S3] |
| H-M2 (novo; complementa A5) | Há procura de pesquisa mensurável? Hipótese: cluster de consultas núcleo ≥ 1 000 pesquisas/mês | Falso se o volume combinado < 1 000/mês e nenhuma comunidade > 5 000 membros. | **Não medido; provável falso para a procura "aware da solução".** Ahrefs (valores em imagem) e Google Trends (429) inacessíveis; nenhuma comunidade PT dedicada encontrada. | [S3] [S10] |
| H-M1 (novo) | O número de compradores potenciais sustenta um negócio? | Falso se empresas de engenharia civil/terraplenagem com ≥ 10 pessoas < 500. | **Confirmado por pouco:** 879 (núcleo) + 664 (gabinetes de engenharia ≥ 10 pessoas). | [S5] |
| H-M3 (novo) | A procura por medição assistida está a subir? | Falso se a atividade de obras de engenharia civil e a adoção de IA em PT estiverem a descer. | **Misto:** construção total sobe, **engenharia civil desce (−2,4 % em valor de trabalhos)**; adoção de IA nas empresas PT sobe (7,9 % → 11,5 %). | [S4] [S13] |

## 2. Resumo da faixa

- O universo de compradores PT é pequeno: 879 empresas "núcleo" com ≥ 10 pessoas (engenharia civil CAE 42 + preparação de terrenos, demolição e sondagens) e 664 gabinetes de engenharia (CAE 71120) com ≥ 10 pessoas; 2 621 empresas de engenharia civil têm < 10 pessoas e são na maioria subempreiteiros/empresários em nome individual. [FACTO] [S5]
- TAM bottom-up de ≈ €0,9 M (baixo) a ≈ €1,8 M (base) por ano; SAM base ≈ €0,76 M; SOM a 12 meses base ≈ €17 k (intervalo €1,6 k–€83 k). Um mercado só-PT dificilmente sustenta mais do que um negócio de nicho com receita de 5 dígitos baixos no primeiro ano. [ESTIMATIVA] [S4] [S5]
- O maior volume de obra em Portugal é em **edifícios** (73,3 % do valor de trabalhos; residencial +16 %), e as empresas de construção de edifícios com ≥ 10 pessoas são 4 486, ≈ 5× o núcleo de infraestruturas. A engenharia civil, o segmento escolhido no brief, está flat/em queda em valor. [FACTO] [S4] [S5]
- A procura institucional é grande e legalmente enquadrada: obras públicas lançaram €8,4 mil milhões em concursos em 2024 (+39 %) e o CCP obriga o concorrente a listar erros e omissões (incluindo "quantidade de prestações") no primeiro terço do prazo. Em PT, o mapa de quantidades de uma empreitada pública é fornecido pelo dono de obra; o trabalho do concorrente é **verificá-lo e orçamentá-lo**, não medir de raiz. [FACTO] [S6] [S8]
- Sinais de procura de pesquisa para a solução em pt-PT são fracos: 0 sugestões para 6 frases de solução; as frases de problema ("como fazer mapa de quantidades", "quanto custa um mapa de quantidades", "quem faz o mapa de quantidades") existem, o que mostra procura informativa e de subcontratação, não de software. [FACTO] [S3]
- O concorrente de referência não mostra tração em Portugal: civils.ai declara 200+ empresas em 8 países, mas o Similarweb não lista Portugal entre os principais países (EUA 43 %, Índia 15 %, Singapura 7 %), ranking global ≈ #908 mil e tráfego em queda de 21 % mês a mês. [FACTO/ESTIMATIVA] [S1] [S12]
- Disposição para pagar: comparáveis globais cobram $90–$299 por utilizador/mês (civils.ai, STACK, Togal.AI); o comparável local direto (CYPE Arquimedes Starter) custa €475 numa licença única. O custo de mão de obra de um orçamentista em PT é baixo (oferta a €1 000–1 350/mês brutos), o que reduz o ROI por horas poupadas; o argumento forte tem de ser ganhar mais concursos/evitar erros. [FACTO/ESTIMATIVA] [S2] [S9] [S15] [S17]
- Lacunas críticas: volumes de pesquisa não obtidos, quota PDF vs DWG desconhecida, nenhuma prova de pagamento por IA de medição em PT, sem comunidades PT dedicadas identificadas. Segundo o procedimento, estas lacunas baixam a confiança da procura. [ESTIMATIVA]

## 3. Constatações

### 3A. Mercado e procura

**Indicadores (≥ 15 pontos de dados)**

| Indicador | Valor | Tipo | Data | Classe | Fonte |
|---|---|---|---|---|---|
| Empresas de construção em Portugal (2024) | 114 439 (+6,1 %); 48,3 % são empresas individuais | FACTO | 2025-12-15 (edição INE) | A | [S4] |
| Pessoal ao serviço / volume de negócios / média por empresa (2024) | 460 416 pessoas; €39,14 mil M (+10,2 %); 4,0 pessoas por empresa | FACTO | 2025-12-15 | A | [S4] |
| Empresas CAE 42 (engenharia civil) em 2024 | 3 320 (soma de 7 subclasses: 505 estradas, 33 ferrovia, 31 pontes/túneis, 377 redes de água/esgotos, 347 redes elétricas/telecom, 64 hidráulica, 1 963 outras) | ESTIMATIVA (soma de valores INE) | 2025-12-11 (atualização INE) | A | [S5] |
| CAE 42 por escalão (2024) | < 10 pessoas: 2 621 · 10–19: 290 · 20–49: 220 · 50–249: 160 · ≥ 250: 29 | FACTO (somas das subclasses) | 2025-12-11 | A | [S5] |
| CAE 43110/43120/43130 (demolição, preparação de locais, sondagens) com ≥ 10 pessoas | 180 (total destas 3 subclasses: 1 618, das quais 1 438 com < 10 pessoas) | ESTIMATIVA | 2025-12-11 | A | [S5] |
| CAE 41200 (construção de edifícios): total / ≥ 10 pessoas | 51 249 / 4 486 | FACTO + soma | 2025-12-11 | A | [S5] |
| CAE 71120 (engenharia e técnicas afins) total / ≥ 10 pessoas | 19 697 / 664 (19 033 têm < 10 pessoas) | FACTO + soma | 2025-12-11 | A | [S5] |
| Valor de trabalhos (todas as empresas, 2024) | €34,3 mil M; edifícios 73,3 %; engenharia civil 26,7 % (€9,15 mil M), −2,4 % | FACTO | 2025-12-15 | A | [S4] |
| Empresas ≥ 20 pessoas: valor de trabalhos 2024 | €19,98 mil M (+10,9 %); engenharia civil €7,27 mil M (+0,4 %); edifícios 63,6 % (+17,9 %) | FACTO | 2025-12-15 | A | [S4] |
| Concursos públicos de obras promovidos (valor) | 2023: €6 048 M · 2024: €8 376 M (+39 %) | FACTO | 2025-05 | A/B | [S6] |
| Contratos de empreitada celebrados (valor) | 2023: €3 699 M · 2024: €4 891 M (+32 %) | FACTO | 2025-05 | A/B | [S6] |
| Concursos de obras públicas lançados no 1.º trimestre de 2025 | 1 959 (+59 % em número, −28 % em valor: €2 706 M); 1 229 no 1.º trim. de 2024 | FACTO | 2025-05 (dados ≈ 19 meses) | A/B | [S6] |
| Concursos de infraestruturas/engenharia civil no 1.º trim. de 2025 (estruturas e vias 498 + hidráulica 28 + outras eng. civil 358 + preparação de locais 83) | 967 de 1 959 = 49 % | ESTIMATIVA (soma) | 2025-05 | A/B | [S6] |
| Concursos ≤ €800 k de preço base (1.º trim. 2025) | 1 372 de 1 959 = 70 % | ESTIMATIVA | 2025-05 | A/B | [S6] |
| Sugestões de autocomplete pt-PT (10 sementes + letras/prefixos) | 255 distintas; 254 relevantes (inclui ruído brasileiro); 45 em forma de pergunta/exemplo/modelo | FACTO | 2026-11-26 | B | [S3] |
| Cluster pt-PT "mapa de quantidades / mapa de medições / levantamento de quantidades" | ≈ 60 sugestões (44 + 11 + 5) | FACTO | 2026-11-26 | B | [S3] |
| Frases de solução pt-PT com **zero** sugestões | "medição de plantas pdf", "software de medições e orçamentos", "medições autocad", "tirar medições projeto", "medições de plantas", "software de medições construção" | FACTO | 2026-11-26 | B | [S3] |
| Sugestões pt-PT com sinal de pagamento/subcontratação | "quanto custa um mapa de quantidades", "quem faz o mapa de quantidades", "mapa de quantidades preço", "ia para orçamento de obra", "melhor ia para orçamento de obras" | FACTO | 2026-11-26 | B | [S3] |
| Autocomplete EN: 19 sementes (9 EN) | 444 distintas brutas; 275 relevantes; 84 com "ai"; 67 em forma de pergunta/melhor/grátis; cluster "civils ai …" (alternative, cost, free trial, funding, demo) | FACTO | 2026-11-26 | B | [S3] |
| HN Algolia (histórias): "quantity takeoff software" / "ai quantity takeoff" / "mapa de quantidades" | 4 / 3 / 0 resultados; lançamentos Bild AI (YC W25, 98 pontos), Rudus (YC P26, 41 pontos) | FACTO | 2026-11-26 | B | [S10] [S11] |
| civils.ai: clientes declarados / classificação | "200+ firms in 8 countries"; 4,8/5 declarado (autoavaliação, sem fonte independente) | FACTO (declaração do fornecedor) | 2026-11-26 | A (autodeclarado) | [S1] |
| civils.ai: tráfego estimado | Ranking global ≈ #907 720 (era #756 886 há 3 meses); 29,9 k visitas "últimos 3 meses" (período ambíguo); EUA 43 %, Índia 15 %, Singapura 7 %; Portugal não listado | ESTIMATIVA (Similarweb) | 2026-10 | C | [S12] |
| Reviews G2 de ferramentas de takeoff com IA | STACK 1 398 · Togal.AI 60 · Beam AI 30 (amostras pequenas) | FACTO (via artigo de fornecedor concorrente) | 2026-08-03 | C | [S9] |
| Financiamento: Togal.AI / xBuild / Bild AI | $22,65 M em 5 rondas / $19 M Série A (jan. 2026) / $3,1 M seed | FACTO (reportado) | 2026-08 | B/C | [S9] [S11] |
| Empresas PT que usam IA (2025) | 11,5 % (2024: ≈ 8,6 %, ESTIMATIVA = 11,5 − 2,9 p.p.; 2023: 7,9 %); pequenas 9,4 %, médias 18,2 %, grandes 49,1 % | FACTO (imprensa citando INE) | 2025-11-21 | B | [S13] |
| Peso das obras públicas na contratação pública (2023) | 7 % dos procedimentos e 18 % do valor; contratos de empreitadas +23 % em número face a 2022 | FACTO | 2024-11 (edição BASE) | A | [S7] |
| Oferta de emprego "orçamentista" (Parque das Nações, Lisboa) | €1 000–1 350/mês brutos | FACTO (snippet de pesquisa; página não aberta) | 2026 (data não confirmada) | C | [S17] |

*Notas de método.* (1) O ranking brasileiro contamina o autocomplete pt-PT (p. ex. "orçamento de obra", "planilha", SINAPI, Orçafácio, Aldo Dorea); só os termos "mapa de quantidades", "mapa de medições", "levantamento de quantidades" e "medições" identificam o uso português com alguma segurança. (2) Alguns resultados EN são ruído de aviação ("takeoff" de aviões) e foram removidos da contagem de relevantes. (3) Pesquisa de "People Also Ask": o bloco não foi acessível; usaram-se as expansões com prefixos de pergunta como proxy (45 pt-PT, 67 EN).

**Tendência:** **Estável/mista em Portugal; a subir no mundo.** Globalmente, a categoria de takeoff com IA mostra entradas e financiamento (xBuild $19 M em jan. 2026, Rudus YC P26, Bild AI seed, Togal.AI $22,65 M) [S9] [S11]. Em Portugal, o setor de construção cresce (volume de negócios +10,2 %, concursos públicos de obras +39 % em valor em 2024), mas o valor de trabalhos em **engenharia civil caiu 2,4 %** e o crescimento está nos edifícios residenciais [S4] [S6]. A adoção de IA nas empresas subiu de 7,9 % (2023) para 11,5 % (2025) [S13]. Google Trends (429) e Wikimedia pageviews indisponíveis: a direção "sobe" em PT para este produto **não está demonstrada**. O tráfego da própria civils.ai está a cair (−21 % mês a mês, ranking pior) [S12]. A Estratégia Nacional PortugalBIM (RCM 89/2026, em vigor desde 2026-05-22 segundo a imprensa) e a Portaria 255/2023 apontam para quantidades extraídas de modelos BIM no médio prazo, o que pode erodir a necessidade de medir PDFs em obras públicas, mas sem prazo de obrigatoriedade confirmado [S14].

**Contexto legal que molda a procura (verificar na execução).** Na empreitada pública, o caderno de encargos inclui o projeto de execução e, nas palavras do CCP, «uma lista completa de todas as espécies de trabalhos necessárias à execução da obra a realizar e do respetivo mapa de quantidades» (art. 43.º, n.º 4, al. b) [S8]. O concorrente deve, no primeiro terço do prazo de propostas, entregar uma lista de erros e omissões, que inclui a «quantidade de prestações» (art. 50.º, n.os 1–2), com consequências em caso de incumprimento (art. 50.º, n.º 4, remetendo para o art. 378.º) [S8]. Isto significa que, no segmento público, a tarefa-chave do cliente é **verificar** o mapa de quantidades dado e justificar erros em poucos dias, o que favorece uma ferramenta de verificação/cruzamento mais do que de medição de raiz. Esta leitura baseia-se no texto do CCP de 2017 (DL 111-B/2017); o art. 61.º aparece como «Revogado» nessa versão, ao contrário do que alguns pareceres e peças de concurso mais antigos ainda referem. Verificar a versão consolidada atual no Diário da República antes de usar em material comercial.

**Dimensionamento bottom-up** (12 meses; preços sem IVA; €1 = $1,0975, referência BCE de 2026-11-26 [S19])

Definições. **Núcleo** = 879 empresas = CAE 42 com ≥ 10 pessoas (290 + 220 + 160 + 29 = 699) + CAE 43110/43120/43130 com ≥ 10 pessoas (180) [S5]. **Gabinetes** = CAE 71120 com ≥ 10 pessoas = 664 [S5]. **Micro** = CAE 42 com < 10 pessoas (2 621) + CAE 43110/43120/43130 com < 10 pessoas (1 438) = 4 059 (a maioria empresários em nome individual; 48,3 % das empresas de construção são individuais [S4]). Preços anuais: baixo €984 (= $90 ÷ 1,0975 × 12, preço Starter da civils.ai [S2]); base €1 188 (= €99/mês × 12; PRESSUPOSTO dentro da gama €60–250 do brief); alto €2 952 (= $270 ÷ 1,0975 × 12, preço Professional [S2]); micro €588 (= €49/mês × 12, PRESSUPOSTO).

| Nível | Fórmula | Baixo | Base | Alto | Fontes / pressupostos |
|---|---|---|---|---|---|
| TAM | Baixo: 879 × €984 · Base: (879 + 664) × €1 188 · Alto: (879 + 664) × €2 952 + 4 059 × €588 | €0,86 M | €1,83 M | €6,94 M | [S5] [S2]; preços base/micro são PRESSUPOSTO |
| SAM | Quota que mede por conta própria e sobre PDF: Baixo 30 % do núcleo × €984 · Base (50 % núcleo + 30 % gabinetes) × €1 188 · Alto (70 % núcleo + 40 % gabinetes) × €2 952 + 10 % micro × €588 | €0,26 M | €0,76 M | €2,84 M | PRESSUPOSTO: quotas sem fonte (ver Lacunas) |
| SOM (12 m) | Σ canais (alcance × visita→registo × registo→pago × preço anual); ver abaixo | €1,6 k (≈ 1,7 clientes) | €17,1 k (≈ 14,4 clientes) | €83,3 k (≈ 55,5 clientes) | PRESSUPOSTO: taxas |

Detalhe do SOM (clientes captados em 12 meses; todas as taxas são PRESSUPOSTO: B2B nicho, visita→teste 2–5 % por defeito do procedimento; teste→pago 10/20/30 %):

| Canal | Baixo | Base | Alto |
|---|---|---|---|
| Contacto direto a empresas núcleo/gabinetes (alcance × teste × pago) | 300 × 2 % × 10 % = 0,6 | 600 × 4 % × 20 % = 4,8 | 1 000 × 5 % × 30 % = 15 |
| SEO pt-PT e conteúdo (visitas × teste × pago) | 900 × 0,5 % × 10 % = 0,45 | 1 800 × 1 % × 20 % = 3,6 | 3 600 × 2 % × 25 % = 18 |
| Associações, webinars, LinkedIn orgânico (alcance × teste × pago) | 600 × 1 % × 10 % = 0,6 | 1 500 × 2 % × 20 % = 6,0 | 3 000 × 3 % × 25 % = 22,5 |
| Total clientes | 1,65 | 14,4 | 55,5 |
| Preço anual aplicado | €984 | €1 188 | €1 500 (mix Starter/Professional) |
| SOM | €1,6 k | €17,1 k | €83,3 k |

Verificações. SOM ÷ SAM: 0,6 % / 2,3 % / 2,9 % (abaixo do limiar de 5 % que exigiria justificação). Observação operacional: o contacto direto a pessoas reais (e-mails, mensagens) é uma ação reservada ao fundador (CLAUDE.md, regra 2), por isso não é totalmente automatizável por agentes; o orçamento de anúncios é €0 (FOUNDER.md), logo não há canal pago no SOM. Verificação cruzada de procura "price-aware" (checklist §3.2): clientes novos por mês necessários = 3; taxa visita→pago de 2 % ⇒ 150 visitas/mês necessárias; as visitas capturáveis não podem ser calculadas porque o volume de pesquisa do cluster e a dimensão de comunidades não foram obtidos (lacuna). A procura deste produto é, na prática, **de lista (≈ 1 543 contas identificáveis), não de pesquisa**. Cruzamento top-down: não utilizado como base (só referências de preços de concorrentes, classe D). Ponto de equilíbrio do produto: com o teto de €50/mês antes de receita e um custo de IA de €1–2 por folha (A6, não testado), cada cliente base de €99/mês cobre cerca de 10 folhas/mês com ≈ 80 % de margem bruta (ESTIMATIVA: 10 × €2 = €20 de custo); o ponto de equilíbrio dos €50/mês de custos fixos exige ≈ 1 cliente pagante.

**Valor para o comprador (ROI) em PT.** Custo horário de um orçamentista: €1 350 × 14 meses = €18 900/ano; + 23,75 % de TSU (PRESSUPOSTO) ≈ €23 400/ano; ÷ ≈ 1 720 horas úteis ≈ €13,6/hora (ESTIMATIVA, a partir de [S17]). A €99/mês, o ponto de equilíbrio por poupança de horas é ≈ 7,3 horas/mês (€99 ÷ €13,6). Compare-se com o cálculo de ROI da civils.ai, que usa $50/hora [S1]. A justificação económica em PT tem de assentar em mais propostas entregues, menos erros e omissões e menos contratação externa, não só em horas poupadas. Análise ainda por validar com compradores.

**Comparáveis de preço (apoio à disposição para pagar; detalhe em `competitors.md`).**

| Comparável | Preço | Período | IVA | Fonte |
|---|---|---|---|---|
| civils.ai Starter / Professional | $90 / $270 (≈ €82 / €246) | mensal | sem informação | [S2] |
| Togal.AI | desde $299/utilizador/mês (≈ €272) | mensal | sem informação | [S9] |
| STACK | $249–$299/utilizador/mês, faturação anual | mensal | sem informação | [S9] |
| Bluebeam Revu (Basics/Core/Complete) | $260 / $330 / $440 | anual | sem informação | [S16] |
| CYPE Arquimedes STARTER | €475 | licença (período não indicado) | sem informação | [S15] |
| Beam AI | $15 k–$25 k por ofício/ano (serviço "feito por nós") | anual | sem informação | [S9] |

### Faixas B, C e D

Fora do âmbito deste ficheiro (ver `competitors.md`, `audience.md`, `risks.md`).

## 4. Lacunas e limitações

- **Volumes de pesquisa não obtidos.** O Ahrefs Free Keyword Generator mostra os números em imagens (indisponíveis ao WebFetch) e o Google Trends devolveu 429; Wikimedia pageviews também limitado. Usados autocomplete, HN e Similarweb como proxies; o cluster pt-PT não tem volume mensurável. Fecha-se com uma conta Ahrefs/Semrush ou um teste real de landing page.
- **Autocomplete pt-PT contaminado por português do Brasil** (SINAPI, Orçafácio, "planilha"); a contagem de 255 sugestões sobrestima a procura pt-PT. Só o cluster "mapa de quantidades/medições" (≈ 60) é seguro.
- **Quota PDF vs DWG desconhecida (A3).** Não se encontrou evidência sobre o formato (PDF/DWG) das peças desenhadas dos concursos; o art. 43.º do CCP exige o mapa de quantidades mas não fixa o formato dos desenhos. Fecha-se descarregando 10 peças desenhadas de concursos reais (plataformas Vortal, acinGov, Anogov) e classificando-as.
- **Quotas do SAM (30/50/70 %) são PRESSUPOSTO.** Sem dados sobre quantas empresas orçamentam internamente vs usam o mapa fornecido ou serviços externos. Fecha-se com 10–15 entrevistas a orçamentistas.
- **INE: escalões por CAE (empresas ≥ 10 pessoas) e subclasses de CAE 41 e 43 não obtidos para todas as subclasses** (códigos 41100/41210/41220 e vários 43xxx foram rejeitados pela API). O núcleo inclui só 43110/43120/43130; se o segmento incluir mais 43xxx (p. ex. 43990), o universo aumenta. As empresas ≥ 20 pessoas dominam o valor de trabalhos (58,2 %), o que reforça que o núcleo está em empresas médias e grandes.
- **O INE conta 114 mil empresas, o IMPIC contava em 2018 mais de 52 mil entidades com alvará/título** [S18] (fonte antiga, > 24 meses; não usada no dimensionamento). Número atual de alvarás por classe não obtido.
- **Reviews, comunidades e Facebook/LinkedIn (tamanho de grupos PT de orçamentistas):** não encontrados. Reddit `.json` bloqueado; WebSearch é só EUA. Fica para `audience.md`.
- **Preço CYPE:** só o Arquimedes STARTER (€475) foi verificado na loja; a tabela de preços completa está protegida por palavra-passe e os valores de módulos (€400–1 200) vistos num resultado de pesquisa não foram confirmados, logo não são usados.
- **Salários de orçamentistas:** uma única oferta (snippet de pesquisa; a página não foi aberta). Não há tabela salarial oficial; o cálculo de ROI é indicativo.
- **Dados desatualizados:** barómetro AICCOPN e relatório BASE com 12–19 meses; RCM 89/2026 conhecida só por imprensa/escritório de advogados; CCP lido na redação de 2017 (alterações posteriores não verificadas).
- Dado do Similarweb ambíguo ("29,9 K" sem período) e sem confirmação independente.
- Sem validação do impacto do fim do PRR (ciclo de investimento público) na procura de infraestruturas a partir de 2026; fica para a faixa de riscos.

## 5. Contributo para o scorecard (provisório)

| Critério | Nota proposta (1–5) | Confiança (alta / média / baixa) | Evidência-chave |
|---|---|---|---|
| Procura (demand evidence) | 2 | baixa | Sem volumes de pesquisa PT; frases de solução com zero sugestões; sem comunidade PT dedicada; mercado PT de infraestruturas flat/em queda (−2,4 %); mas ≥ 3 concorrentes vivos e financiados globalmente e procura de lista identificável (1 543 contas). [S3] [S4] [S9] [S10] |
| Disposição para pagar | 3 | média | Pagador identificado (empresa); ≥ 4 comparáveis cobram ($90–$299/mês; Arquimedes €475 licença) mas preços muito variáveis e mão de obra PT barata, o que reduz o ROI por horas; sem pagamentos observados em PT. [S2] [S9] [S15] [S16] [S17] |
| Tempo até à primeira receita (entrada) | 3 | baixa | Universo pequeno e B2B de ciclo médio; contacto direto exige ação do fundador; piloto pago plausível com 3–5 empresas mas sem prova; sem canal pago. [S5] [S8] |
| Dor e frequência (entrada para audience.md) | 3 | baixa | Dever legal de verificar quantidades em ≈ 1/3 do prazo e ≈ 5 000–8 000 concursos de obras/ano (ESTIMATIVA a partir do 1.º trim. de 2025 × 4) sustentam a frequência; queixas diretas ainda não recolhidas. [S6] [S8] |
| Distribuição (entrada) | 2 | baixa | Procura de lista e não de pesquisa; sem volume SEO medido; associações (AICCOPN/AECOPS) sem dados de membros nem de política de promoção. [S3] |

Observação para a síntese: o resultado mais importante desta faixa é o tamanho (TAM base ≈ €1,8 M e SOM base ≈ €17 k no 1.º ano), a descida da engenharia civil face aos edifícios, e a **reformulação do trabalho a realizar em contratação pública** (verificar o mapa de quantidades fornecido, em ≈ 1/3 do prazo, em vez de medir de raiz). A alternativa 3 do brief (edifícios) tem ≈ 5× mais empresas (4 486 com ≥ 10 pessoas) mas mercado mais disputado (por avaliar em `competitors.md`).

## 6. Fontes

| ID | Fonte | Acedido em | Classe (A/B/C/D) | Suporta |
|---|---|---|---|---|
| S1 | [civils.ai — AI for Construction (página inicial)](https://civils.ai/) | 2026-11-26 | A (autodeclarado) | Funcionalidades, 200+ empresas em 8 países, ROI a $50/hora, dados nos EUA |
| S2 | [civils.ai — Pricing](https://civils.ai/pricing) | 2026-11-26 | A | Starter $90/mês (10 folhas/mês), Professional $270/mês (30 folhas/mês), Enterprise sob consulta |
| S3 | [Google Suggest (endpoint de autocomplete), execuções próprias com hl=pt-PT/gl=PT e hl=en/gl=US](https://suggestqueries.google.com/complete/search) | 2026-11-26 | B | Contagens de sugestões, frases de solução com zero resultados, sinais de pagamento |
| S4 | [INE — Empresas de Construção 2024 (edição de 15 dez. 2025)](https://www.ine.pt/ngt_server/attachfileu.jsp?look_parentBoui=765949417&att_display=n&att_download=y) | 2026-11-26 | A | 114 439 empresas, pessoal, volume de negócios, valor de trabalhos por tipo e escalão |
| S5 | [INE — API de indicadores, indicador 0006592 (empresas por CAE subclasse e escalão, 2024; atualizado em 2025-12-11)](https://www.ine.pt/ine/json_indicador/pindica.jsp?op=2&varcd=0006592&Dim1=S7A2024&Dim2=PT&Dim3=42110,42210,42220,42990,42910,42130,42120&Dim4=11,21,22,31,41&lang=PT) | 2026-11-26 | A | Contagens de empresas por CAE 42, 43110/20/30, 41200, 71110/20 e escalão |
| S6 | [AICCOPN — Barómetro Obras Públicas n.º 135, abril 2025 (fonte Portal BASE)](https://www.aiccopn.pt/wp-content/uploads/2025/05/202504-BarometroAICCOPN-ObrasPublicas.pdf) | 2026-11-26 | A/B (> 12 meses) | Concursos promovidos e contratos celebrados 2017–2024 e 1.º trim. 2025, por escalão e tipo de obra |
| S7 | [Portal BASE / IMPIC — Relatório anual da contratação pública 2023 (edição nov. 2024)](https://www.base.gov.pt/Base4/media/1elfqicv/relat%C3%B3rio-anual-da-contrata%C3%A7%C3%A3o-p%C3%BAblica-2023.pdf) | 2026-11-26 | A (> 12 meses) | Contexto: obras públicas 7 % dos procedimentos e 18 % do valor; contratos de empreitadas +23 % em 2023 |
| S8 | [Código dos Contratos Públicos, redação do DL 111-B/2017 (cópia UAC)](https://novoportal.uac.pt/sites/default/files/Legislacao%20Nacional/PT%20(2017.08.31)%20-%20CCP%20-%20C%C3%B3digo%20de%20Contrata%C3%A7%C3%A3o%20P%C3%BAblica%20-%20DL111-B.pdf) | 2026-11-26 | A (versão de 2017; verificar a atual) | Art. 43.º n.º 4 al. b) (mapa de quantidades), art. 50.º (erros e omissões), art. 61.º revogado, art. 62.º n.º 6 (BIM quando possível) |
| S9 | [ConstructConnect — AI-Powered Takeoff and Estimating Software: A Contractor's Guide (2026-08-03)](https://www.constructconnect.com/blog/ai-powered-takeoff-and-estimating-software-a-contractors-guide-to-the-top-players-in-2026) | 2026-11-26 | C (fornecedor concorrente) | Preços Togal/STACK/PlanSwift/eTakeoff/Beam, reviews G2, financiamento |
| S10 | [HN Algolia API — pesquisas "quantity takeoff software", "ai quantity takeoff", "mapa de quantidades"](https://hn.algolia.com/api) | 2026-11-26 | B | Número de histórias no HN |
| S11 | [Y Combinator — Bild AI (Launch HN, YC W25) e Rudus (YC P26)](https://www.ycombinator.com/companies/bild-ai) | 2026-11-26 | B | Entrada de startups, seed de $3,1 M da Bild AI, Rudus |
| S12 | [Similarweb — civils.ai (out. 2026)](https://www.similarweb.com/website/civils.ai/) | 2026-11-26 | C (estimativa) | Ranking, quota por país, tendência de tráfego |
| S13 | [ECO — Taxa de adoção de IA pelas empresas portuguesas atinge 11,5 % (21 nov. 2025, dados INE)](https://eco.sapo.pt/2025/11/21/so-115-das-empresas-portuguesas-usam-ia/) | 2026-11-26 | B | Adoção de IA por dimensão de empresa |
| S14 | [Idealista / Cuatrecasas — Estratégia PortugalBIM (RCM 89/2026) e integração do BIM na contratação pública](https://www.idealista.pt/news/node/75834) | 2026-11-26 | B | Tendência BIM; sem prazo de obrigatoriedade confirmado |
| S15 | [CYPE Shop — Arquimedes STARTER](https://shop.cype.com/en/product/arquimedes-starter/) | 2026-11-26 | A | €475; módulo AQ1 gera medições a partir de DWG/DXF |
| S16 | [Vertigraph — Takeoff software pricing 2026](https://www.vertigraph.com/learn/takeoff-software-pricing-2026) | 2026-11-26 | C (apenas resumo de pesquisa; página não aberta) | Preços Bluebeam Revu |
| S17 | Resultados de pesquisa de ofertas de orçamentista (Grupo Crit, Randstad, Michael Page, Indeed; snippets) — [Indeed PT](https://pt.indeed.com/or%c3%a7amentista-jobs) | 2026-11-26 | C | Salário €1 000–1 350/mês, exigências de formação |
| S18 | [Público — Alvarás vão voltar a ser fiscalizados (2018)](https://www.publico.pt/2018/05/29/economia/noticia/alvaras-das-construtoras-vao-voltar-a-ser-verificados-1832436) | 2026-11-26 | B (> 24 meses, não usada no dimensionamento) | > 52 mil entidades com alvará/título (2018) |
| S19 | [BCE — taxa de referência EUR/USD](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html) | 2026-11-26 | A | 1 € = $1,0975 (valor lido na página) |
