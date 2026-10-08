# Pesquisa — Mercado e procura · Visão Guiada

> **Faixa:** market · **Produto:** `visao-guiada` · **Agente:** market-researcher (faixa A) · **Data:** 2026-10-08 · **Profundidade:** standard · **Pesquisas feitas:** 31 WebSearch + 21 WebFetch (7 falharam ou vieram vazios) + ~50 chamadas a APIs públicas (Google suggest, HN Algolia, iTunes, Eurostat, BCE); registo em `$SCRATCH/searchlog-market.txt`

## 1. Perguntas e falsificadores

| Pressuposto (brief) | Pergunta | Falsificador | Resultado | Fontes |
|---|---|---|---|---|
| A1 | Pessoas cegas/baixa visão (ou famílias) pagam €400–900 de uma vez por um kit destes? | Falso se não houver comparáveis a cobrar nessa faixa **ou** se os comparáveis a esse preço forem gratuitos/subsidiados e o segmento tiver rendimento muito baixo | **Em aberto, a inclinar para negativo.** Há pagamento comprovado a €2 200–5 200 (OrCam, Envision) e a €340–625 (Meta, Ally Solos, EchoVision), mas a faixa €400–900 já está ocupada e a IA de descrição é gratuita (Be My Eyes, Meta AI, Guia-NOS). Rendimento do segmento é baixo. Sem estudo de disposição a pagar numa amostra de cegos; a literatura trata o custo como barreira, e na população geral o preço é o 1.º motivo de não-compra (67%) | [S14] [S15] [S20] [S21] [S22] [S23] [S7] [S9] [S28] [S32] |
| A2 (parte "procura") | Existe procura mensurável por "óculos com IA para cegos"? | Falso se o cluster de pesquisa < 1k/mês e nenhuma comunidade > 5k, ou tendência a descer | **Confirmado em amplitude, não medido em volume.** 217 sugestões EN relevantes, 18 de preço; r/Blind ≈ 25 mil; Be My Eyes > 1 M utilizadores. Volumes de pesquisa não obtidos (Trends 429; sem ferramenta de keywords) | [S10] [S11] [S13] [S31] |
| A7 (parte "comunidade") | Há comunidade acessível de cegos para o 1.º canal? | Falso se nenhuma comunidade ativa > 5k ou se todas proibirem promoção | **Parcial.** EN: r/Blind ≈ 25 mil, AppleVis (pertence à Be My Eyes), podcast Double Tap. PT: ACAPO com 14 estruturas locais mas **nenhum fórum/grupo PT encontrado**; regras de promoção não verificadas (faixa C) | [S31] [S36] [S9] |
| A8 | Um kit destes pode ser comparticipado (SAPA)? | Falso se a lista SAPA não incluir o tipo de produto ou o fundo estiver esgotado | **Não confirmado, a inclinar para negativo.** SAPA funciona por lista aprovada por despacho, exige IMU ≥ 60% e, segundo despacho de 2025, as verbas não chegaram para os pedidos pendentes. Não encontrei óculos/dispositivos de visão na lista | [S26] |
| A9 | Atualizações sem subscrição / IA local são valorizadas? | Falso se as queixas dos utilizadores não mencionarem subscrição/nuvem | **Em aberto (evidência fraca).** Comentários dispersos sobre a subscrição do Ally Pro; nenhuma evidência direta de procura por "offline". A IA em nuvem gratuita tem adoção massiva | [S33] [S10] |
| H-M1 | O segmento é grande o suficiente para sustentar um negócio de hardware? | Falso se o SAM acessível (PT+UK, com filtros) < 20 mil pessoas no caso base | **Confirmado no caso base** (≈ 294 mil pessoas), **mas** o SOM a 12 meses é de ordem 10²–10³ unidades, abaixo de um MOQ típico (a confirmar na faixa D) | secção 3A |
| H-M2 | A procura está a crescer? | Falso se tendência plana/descendente em 2 fontes independentes | **Confirmado para a categoria adjacente** (óculos com IA: +35% a/a; Be My Eyes 0,9 M → 1 M). **Plana** para sinais de nicho (HN) | [S19] [S18] [S10] [S12] |

## 2. Resumo da faixa

- O problema é grande (a OMS conta 2,2 mil M com défice visual, mas a maioria é presbiopia ou erro refrativo corrigível; só os casos graves interessam) [S6]: em Portugal ≈ 3,8% dos maiores de 15 anos têm dificuldade grave em ver (≈ 371 mil pessoas, 60% com 65+); na UE27 2,1% (≈ 8,2 M); nos EUA ≈ 8,3 M adultos [FACTO + ESTIMATIVA] [S1, S2, S7].
- O segmento é pobre e envelhecido: emprego de 17,5% (vs 49,1%) em Portugal; 22,9% dos EUA com dificuldade visual abaixo do limiar de pobreza; 28,8% das pessoas com deficiência na UE em risco de pobreza/exclusão (2023) [FACTO] [S9, S7, S27]. Isto limita o preço que se cobra do bolso do utilizador. Clientes de organizações de cegos dizem que os óculos Meta não servem de auxiliar de mobilidade e ajudam pouco a quem é totalmente cego [S35].
- A faixa de €400–900 **não é um degrau vazio**: Meta Ray-Ban Gen 2 ≈ €339–419, Ally Solos ≈ €625 (+ subscrição opcional), EchoVision ≈ €535 (+ plano mensal), contra Envision €2 200–3 100 e OrCam €3 800–5 200 [FACTO] [S14, S20, S21, S15, S23, S25].
- A "descrição por IA" é gratuita em 2026 (Be My Eyes > 1 M utilizadores, Meta AI nos óculos em 21 mercados, Guia-NOS pt-PT gratuito); a procura paga tem de assentar no hardware, no formato ou na ausência de subscrição, não na IA [FACTO] [S10, S16, S22].
- Procura de categoria a subir (óculos com IA +35% a/a no 2.º trim. 2026; Meta > 7 M unidades em 2025) mas **sem volumes de pesquisa medidos** para o nicho [FACTO] [S18, S19]; Google Trends e Wikimedia bloqueados.
- Dimensionamento bottom-up: TAM anualizado ≈ €0,9–2,4 mil M; SAM (PT+UK, filtrado) ≈ €6–253 M/ano (base ≈ €44 M); SOM a 12 meses ≈ 10–950 unidades (base ≈ 126 un. ≈ €76 mil com IVA) [ESTIMATIVA/PRESSUPOSTO].
- Sem evidência de procura por emprego/vagas associado ao problema em Portugal (pesquisa vazia) e sem estudo de disposição a pagar com amostra de cegos: ambos ficam em *Lacunas*.

## 3. Constatações

### 3A. Mercado e procura

**Dados de procura e tamanho** (todas as datas de acesso: 2026-10-08)

| # | Indicador | Valor | Tipo | Data do dado | Classe | Fonte |
|---|---|---|---|---|---|---|
| 1 | Dificuldade grave em ver (idade ≥ 15), UE27, EHIS | 2,1% (moderada 16,0%) | FACTO | 2019 | A | [S1] |
| 2 | Idem, Portugal | 3,8% (15–64: 2,2%; 65+: 8,7%; 75+: 13,0%) | FACTO | 2019 | A | [S1] |
| 3 | População PT 15–64 / 65+ | 6 711 383 / 2 564 575 | FACTO | 1 jan. 2024 | A | [S2, S3] |
| 4 | Pessoas PT com dificuldade grave em ver | ≈ 370 800 = 6 711 383 × 2,2% + 2 564 575 × 8,7% (60% são 65+) | ESTIMATIVA | 2019/2024 | A→D | [S1, S2] |
| 5 | Idem, UE27 | ≈ 8,2 M = 286,5 M × 1,2% + 97,1 M × 4,9% | ESTIMATIVA | 2019/2024 | A→D | [S1, S2] |
| 6 | Cegos na Europa Ocidental / com deficiência moderada-grave | 1,16 M / 9,61 M | FACTO (> 24 meses: desconto de confiança) | 2015 | A | [S4] |
| 7 | Cegos no mundo | 43,3 M | FACTO | 2020 | B (via resumo de pesquisa) | [S5] |
| 8 | Adultos EUA com dificuldade visual (cegos ou "dificuldade séria mesmo com óculos") | ≈ 8,3 M = 4,6 M (18–64) + 3,7 M (65+); 9 M com crianças | FACTO | 2024 | A/B | [S7] |
| 9 | Reino Unido: perda de visão / registados | > 2 M / 322 638 | FACTO | 2022/23 | B (via resumo de pesquisa) | [S8] |
| 10 | Portugal, Censos 2021: incapacidade em ver / emprego | 3,5% / 17,5% (vs 49,1% população geral) | FACTO (secundário) | 2021 | B | [S9] |
| 11 | Utilizadores Be My Eyes (cegos/baixa visão) / voluntários | > 1 M / > 10 M (150 países, 180 línguas); 0,9 M em jul. 2025 | FACTO (autodeclarado) | 12 mar. 2026 | A | [S10] |
| 12 | Avaliações App Store: Be My Eyes | EUA 11 349 (4,78★); PT 141 (4,85★) | FACTO | 2026-10-08 | A | [S11] |
| 13 | Avaliações App Store: Seeing AI / Envision AI / Aira Explorer | EUA 631 / 593 / 801 (PT 14 / 9 / n.d.). Contagens por versão podem ter sido repostas | FACTO | 2026-10-08 | A | [S11] |
| 14 | HN Algolia, histórias "Be My Eyes" (total / últ. 12 m / 12–24 m) | 939 / 91 / 105; "smart glasses blind": 8 total | FACTO | 2026-10-08 | B | [S12] |
| 15 | Autocomplete Google EN (6 sementes × a–z) | 463 sugestões distintas, 217 relevantes (óculos + cego/baixa visão), 18 com preço/custo | FACTO | 2026-10-08 | B | [S13] |
| 16 | Autocomplete Google PT (6 sementes × a–z, `hl=pt-PT&gl=PT`) | 144 distintas, 44 relevantes, 6 com preço. Ortografia e marcas sugerem utilizadores **brasileiros** ("oculos") | FACTO | 2026-10-08 | B | [S13] |
| 17 | Proxy de "People Also Ask" (prefixos how/are/best) | ≥ 13 perguntas, ex.: "are smart glasses good for blind people", "how much are smart glasses for blind people", "disadvantages of smart glasses for blind person" (página PAA não obtida; usado o autocomplete) | FACTO | 2026-10-08 | B | [S13] |
| 18 | Comunidade r/Blind | ≈ 25 mil membros, +17,7% no último ano (sem data) | FACTO | n.d. | C | [S31] |
| 19 | Óculos com IA vendidos por EssilorLuxottica/Meta | > 7 M em 2025 (> 3× 2024) | FACTO | 2025 | B | [S18] |
| 20 | Envios mundiais de óculos inteligentes (IDC) | 3,547 M no 2.º trim. 2026 (+35,3% a/a); Meta 69,2% no 1.º trim.; previsão 13,6 M (2026) → 27,3 M (2030) para óculos sem ecrã | FACTO | 2026 | B | [S19] |
| 21 | Be My Eyes nos óculos Meta | disponível em 21 mercados (lançado 13 nov. 2024); em maio de 2026 a Meta anunciou chamadas de grupo e diretório de serviços sem divulgar números de utilização | FACTO (empresa) | 2026 | A | [S16, S17] |
| 22 | Compra institucional: Estado do Paraná (Brasil) | 147 OrCam MyEye 2.0 a R$ 14,9 mil/un. (R$ 2,19 M no total) para alunos cegos | FACTO | 18 jul. 2023 | A | [S24] |
| 23 | Guia-NOS (operador PT, app gratuita, pt-PT, funciona com óculos Meta) | gratuita; exige certificado multiusos; 20 pares emprestados no NOS Alive | FACTO | jul. 2026 | B | [S22] |
| 24 | Dispositivos dedicados: base instalada declarada | OrCam: "dezenas de milhares" de utilizadores (alegação, 2018: "milhares" vendidos); Envision: "milhares" de utilizadores pagos (promocional) | FACTO (alegação) | 2018–2025 | C | [S25] [S37] |

**Âncoras de preço usadas no dimensionamento** (conversão BCE de 2026-10-08: 1 € = 1,1186 USD = 0,84698 GBP [S30]; perfis completos na faixa B)

| Dispositivo | Preço de origem | ≈ EUR | IVA | Subscrição | Fonte |
|---|---|---|---|---|---|
| Ray-Ban Meta Gen 2 | US$ 379 (lista EUA); €419 lista UE | €339 / €419 | EUA sem IVA; UE c/ IVA | IA da Meta gratuita; Be My Eyes gratuito | [S20] [S16] |
| Ally Solos (Envision/Solos) | US$ 399 lançamento; US$ 699 regular (esgotado na loja); base de dados europeia ≈ €604 | €357 / €625 | EUA sem IVA | 1.º ano Ally Pro incluído (US$ 200); depois US$ 10–20/mês (US$ 100–200/ano) | [S14] [S33] [S15] |
| EchoVision (AGIGA) | US$ 599 | €535 | EUA sem IVA | Explorer US$ 0; Independence US$ 9,99/mês (€9) | [S21] |
| Envision Glasses Read / Home / Pro | €1 899 / €2 499 / €3 499 (Bélgica/Países Baixos, abr. 2025; revendedor Sensotec €2 256 / €2 970 / €4 157) | €1 700–4 200 | com IVA | sem subscrição obrigatória | [S15] |
| OrCam MyEye (PT, 2019) | €3 500 (leitor) / €4 500 (MyEye 2) | €3 500–4 500 | com IVA | não | [S23] |
| OrCam MyEye 3 Pro (UK, 2026) | £ 4 440 c/ IVA (£ 3 700 s/ IVA); marcado esgotado | €5 242 / €4 368 | com IVA | não | [S25] |
| **Visão Guiada (hipótese do brief)** | €400–900 IVA incl. | €400–900 | IVA incl. | nenhuma | brief |

**Leitura:** o preço proposto cai entre os óculos de consumo e os dedicados, exatamente onde já estão Ally Solos e EchoVision. O diferencial só pode ser "sem subscrição + offline + pt-PT + desenhado de raiz", nenhum dos quais tem prova de procura (A9).

**Tendência:** **sobe** na categoria adjacente (óculos com IA) e **estável** no nicho. Evidência: envios IDC +35,3% a/a no 2.º trim. 2026 e Meta > 7 M unidades em 2025 [S19, S18]; Be My Eyes de ≈ 0,9 M (jul. 2025, listagem de terceiros) para > 1 M (mar. 2026, empresa) [S10]; HN estável (91 vs 105 histórias em períodos de 12 meses) [S12]. Projeção de longo prazo: cegueira a subir para ≈ 115 M em 2050 (título de notícia sobre o estudo Lancet GH de 2020; texto não aberto) [S38]. Trends e Wikimedia bloqueados (429): sem série de 5 anos.

**Sinal de emprego/vagas:** pesquisa de vagas de técnico de orientação e mobilidade/tiflotecnologia em Portugal sem resultados (apenas formação pontual de 2019); sem sinal. Em contrapartida, há compra institucional comprovada a ≈ R$ 14,9 mil/un. no Brasil [S24] e distribuidores Envision que ajudam a pedir financiamento local [S15].

**Dimensionamento bottom-up** (12 meses; hardware vendido uma vez, anualizado com ciclo de substituição de 4 anos, PRESSUPOSTO)

Universo de pessoas (`pool`): PT 370 768 [FACTO+ESTIMATIVA, S1/S2] + EUA 8,3 M [S7] + Reino Unido (baixo 322 638 registados; alto ≈ 2 M com perda de visão; base 803 291 = média geométrica, PRESSUPOSTO) [S8].

| Nível | Fórmula | Baixo | Base | Alto | Fontes / pressupostos |
|---|---|---|---|---|---|
| Universo (pessoas) | PT + EUA + RU | 8,99 M | 9,47 M | 10,67 M | PT 370 768; EUA 8,3 M; RU 322 638 / 803 291 / 2 M |
| Preço-alvo (IVA incl.) | brief (€400–900) | €400 | €600 | €900 | brief; PRESSUPOSTO |
| TAM (anualizado) | universo × preço ÷ 4 anos | €0,90 mil M | €1,42 mil M | €2,40 mil M | ESTIMATIVA. Teto teórico: inclui quem nunca comprará; EUA = 88% do universo |
| SAM (pessoas) | (PT + RU) × f1 × f2 | 62 407 | 293 515 | 1 123 726 | f1 = usa smartphone/leitor de ecrã: 30% / 50% / 79% (âncora: 79% dos clientes da Vision Australia; 31% acima dos 85 anos; PRESSUPOSTO) [S29]. f2 = consegue pagar ≥ €400 do bolso ou tem financiamento: 30% / 50% / 60% (âncora: 28,8% em risco de pobreza/exclusão; PRESSUPOSTO) [S27][S9]. Só PT + RU no ano 1 (UE/UKCA, idiomas pt-PT/en); EUA ficam como opção (FCC, devoluções, logística a confirmar na faixa D) |
| SAM (valor, 1 compra) | pessoas × preço | €25 M | €176 M | €1,01 mil M | ESTIMATIVA |
| SAM (anualizado) | valor ÷ 4 | €6,2 M | €44 M | €253 M | ESTIMATIVA |
| SOM (12 m) | Σ canais (alcance × visita→registo × registo→pago × preço) + pilotos institucionais | 10 un. ≈ €4 100 | 126 un. ≈ €75 600 | 948 un. ≈ €853 200 | tabela seguinte; todas as taxas PRESSUPOSTO |

Canais do SOM (pessoas únicas alcançadas em 12 meses; "pago" = depósito/pré-encomenda; valores em unidades):

| Canal | Alcance (B / M / A) | Visita→registo (B / M / A) | Registo→pago (B / M / A) | Unidades (B / M / A) |
|---|---|---|---|---|
| 1. Comunidades EN de cegos (r/Blind, AppleVis, podcasts, YouTube) | 15 k / 30 k / 60 k | 2% / 4% / 8% | 2% / 5% / 10% | 6 / 60 / 480 |
| 2. Associações PT (ACAPO e outras) | 1,5 k / 4 k / 10 k | 5% / 10% / 15% | 3% / 6% / 10% | 2 / 24 / 150 |
| 3. Orgânico (SEO, YouTube, imprensa) | 5 k / 20 k / 60 k | 2% / 4% / 6% | 2% / 4% / 8% | 2 / 32 / 288 |
| 4. Pilotos institucionais (centros, escolas, associações) | 0 / 1 / 3 instituições × 10 un. | n/a | n/a | 0 / 10 / 30 |
| **Total** | | | | **10 / 126 / 948** |

Controlos de sanidade:
- SOM/SAM em pessoas: 126 ÷ 293 515 ≈ 0,04% (< 5%: não precisa de justificação extra). SOM base ≈ 0,17% do SAM anualizado (€76 mil ÷ €44 M).
- Referência de penetração: Be My Eyes tem ≈ 2,3% dos 43,3 M de cegos mundiais como utilizadores de uma app **gratuita** (1 M ÷ 43,3 M) [S10][S5]; dispositivos dedicados a €3,5–5 mil têm ≈ 0,1–0,3% do universo EUA+UE+RU (≈ 17,3 M; assumindo 20–50 mil unidades, leitura PRESSUPOSTO de "dezenas de milhares") [S25]. A cada degrau de preço a penetração cai uma ordem de grandeza.
- Verificação preço-consciente do rubrico (`idea-scorecard.md` §3.2): visitas necessárias = 20 clientes/mês ÷ 1% = 2 000 visitas/mês [PRESSUPOSTO]; visitas capturáveis = (pesquisas mensais do cluster, **não medidas**) + comunidade acessível ≈ 25 mil (r/Blind) × 5–10% ≈ 1 250–2 500 (único, não mensal) → rácio ≈ 0,6–1,25 → faixa "3" apenas se ignorarmos pesquisas; **confiança média-baixa**.
- A procura vem em grande parte de utilizadores com 65+ (60% em PT) e com menor literacia digital: o SAM com f1 = 50% pode ser otimista para o segmento PT.
- Pressupostos de preço: €600 IVA incluído; taxa de IVA e eventual taxa reduzida de 6% (verba 2.9 da Lista I do CIVA só para aparelhos constantes de lista por despacho) por confirmar na faixa D [S34]. Custo de fabrico por unidade e MOQ: faixa D (sem isso o SOM não se traduz em margem).

## 4. Lacunas e limitações

- **Volumes de pesquisa não medidos.** Google Trends (429), Wikimedia pageviews (429), Ahrefs/ferramenta de keywords não usada. Substituídos por autocomplete (amplitude, não volume), HN e contagens da App Store. Fecha-se com Keyword Planner/Ahrefs ou um teste de landing page.
- **Sem estudo de disposição a pagar numa amostra de cegos.** Os únicos dados diretos são compras a €2–5 mil (OrCam/Envision) e a escolha em massa de produtos gratuitos. Fecha-se com 15–20 entrevistas (ACAPO) ou uma lista de espera com depósito reembolsável (ação do fundador).
- **Contagens absolutas dos Censos 2021 (INE) não obtidas** (3 pesquisas, sem tabela). Usados: EHIS 2019 (Eurostat, classe A, prevalência por idade) e a percentagem de 3,5% citada num artigo da Universidade do Minho sobre dados do INE. A percentagem do INE não distingue claramente níveis de dificuldade; o estudo da ACAPO de 2012 (≈ 27 mil pessoas com incapacidade visual) é antigo e a sua definição é restritiva.
- **Várias fontes só foram lidas através do resumo da pesquisa** (página não aberta): RNIB, Bourne 2020, Android Central, Eastin/preços Envision, preços OrCam UK, SAPA/Segurança Social, Portal das Finanças (IVA), Guide Dogs Victoria, PETRA/arXiv, Vision Australia, Security.org. Marcado nos ledgers; confirmar antes de usar em documentos legais ou de preços.
- **Páginas bloqueadas (403/redirect/truncadas):** Público (Portugal "fora" do lançamento Meta de set. 2025), AppleVis, suporte Envision (preço do Ally Pro), Play Store (instalações), EBU (n.º de cegos na Europa), Eurostat Statistics Explained (pobreza 28,8%, lida só no resumo).
- **Disponibilidade da Meta em Portugal por esclarecer:** o Público (set. 2025) e a Android Central não incluem Portugal; mas o Guia-NOS usou óculos Meta emprestados em 2026 e há anúncios no OLX (≈ €130–400). Venda oficial em PT e Meta AI em pt-PT não confirmados (o Brasil tem português do Brasil). Se não houver, é um intervalo temporário para o produto, não uma vantagem estrutural.
- **Dados de 2015 (Bourne 2018)** têm > 24 meses; a confiança desce um nível.
- **Reddit, Facebook, Discord** não foram consultados diretamente (bloqueios/ausência de ferramenta); tamanho de r/Blind sem data; regras de autopromoção não verificadas (faixa C).
- **Aira, Seeing AI, Lookout e outros** não foram dimensionados em utilizadores; a Play Store (instalações) não abriu.
- **Autocomplete PT** reflete utilizadores brasileiros; não é prova de procura em Portugal.

## 5. Contributo para o scorecard (provisório)

| Critério | Nota proposta (1–5) | Confiança (alta / média / baixa) | Evidência-chave |
|---|---|---|---|
| Procura (Demand evidence) | 3 | média | Comunidade ≈ 25 mil (âncora 3); concorrentes vivos e com tração (Be My Eyes > 1 M, Meta > 7 M); tendência de categoria a subir; **volume de pesquisa não medido**; rácio capturável/necessário ≈ 0,6–1,25 → 3 [S10, S18, S19, S31] |
| Disposição a pagar (insumo) | 3 | média | Pagador identificado; ≥ 5 comparáveis a cobrar mas entre €340 e €5 200; segmento de baixo rendimento; IA de descrição gratuita; sem prova a €400–900 com amostra de cegos [S14, S15, S21, S23, S9] |
| Tempo até à primeira receita (insumo) | 2 | baixa | Hardware: protótipo, CE e MOQ antes de entregar; brief proíbe pré-venda antes de protótipo; só um depósito reembolsável encurtaria (depende da faixa D e do fundador) |
| Dor e frequência (insumo para a faixa C) | 4 | média | Prevalência grave de 2,1–3,8% e emprego de 17,5% em PT; autonomia diária; gratuitos já resolvem parte da dor [S1, S9, S10] |
| Distribuição (insumo para a faixa C) | 3 | baixa | Comunidade EN ativa mas AppleVis é da Be My Eyes; em PT a ACAPO tem 14 estruturas locais mas sem grupos/fóruns encontrados; Meta tem parcerias (Guia-NOS, doações) [S36, S9, S22] |

## 6. Fontes

| ID | Fonte | Acedido em | Classe (A/B/C/D) | Suporta |
|---|---|---|---|---|
| S1 | [Eurostat API, hlth_ehis_pl1e (limitações funcionais, visão, EHIS 2019)](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/hlth_ehis_pl1e?geo=EU27_2020&geo=PT&sex=T&hlth_pb=SEE&isced11=TOTAL&lang=en) | 2026-10-08 | A | Dificuldade grave em ver: UE27 2,1%, PT 3,8%, por idade |
| S2 | [Eurostat API, demo_pjanbroad (população por idade, 2024)](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjanbroad?geo=PT&sex=T&time=2024&unit=NR&lang=en) | 2026-10-08 | A | População PT/UE27 15–64 e 65+ |
| S3 | [Eurostat API, demo_pjan (população total, 2024)](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?geo=PT&sex=T&time=2024&unit=NR&lang=en) | 2026-10-08 | A | PT 10 639 726; UE27 449 306 184 |
| S4 | [Bourne et al., Br J Ophthalmol 2018, cegueira e deficiência visual na Europa (PDF)](https://minerva-access.unimelb.edu.au/server/api/core/bitstreams/088410b9-ed04-5dc1-b3ed-acc4023e4c17/content) | 2026-10-08 | A (dados de 2015) | Europa Ocidental: 1,16 M cegos, 9,61 M moderada-grave |
| S5 | [Lancet Global Health 2020, tendências de cegueira (via resultados de pesquisa; repositório Middlesex)](https://repository.mdx.ac.uk/item/8q5z6) | 2026-10-08 | B (resumo de pesquisa) | 43,3 M cegos em 2020 |
| S6 | [OMS, ficha informativa sobre cegueira e deficiência visual (10 fev. 2026)](https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment) | 2026-10-08 | A | 2,2 mil M com deficiência visual (inclui presbiopia); sem total de cegueira |
| S7 | [American Foundation for the Blind, demografia de americanos com dificuldade visual (ACS 2024)](https://afb.org/research-and-initiatives/statistics/demographics-americans-vision-difficulty) | 2026-10-08 | A/B | 9 M; 4,6 M (18–64); 3,7 M (65+); 22,9% abaixo do limiar de pobreza |
| S8 | [RNIB, estatísticas-chave e pessoas registadas 2022/23](https://rnib.org.uk/knowledge-and-research-hub/key-information-and-statistics) | 2026-10-08 | B (resumo de pesquisa) | > 2 M com perda de visão; 322 638 registados |
| S9 | [Integração de pessoas com deficiência visual no mercado de trabalho em Portugal (Univ. do Minho; cita INE 2022/2023 e estudo ACAPO 2012)](https://journals.uminho.pt/index.php/configuracoes/article/download/5896/6642/33974) | 2026-10-08 | B | 3,5% incapacidade em ver; emprego 17,5% vs 49,1%; ≈ 27 mil (ACAPO 2012); 14 estruturas ACAPO (via pesquisa) |
| S10 | [Be My Eyes atinge 1 milhão de utilizadores e 10 milhões de voluntários (12 mar. 2026)](https://www.bemyeyes.com/news/be-my-eyes-reaches-1-million-blind-and-low-vision-users-and-10-million-volunteers/) | 2026-10-08 | A (autodeclarado) | Base de utilizadores; o valor de ≈ 0,9 M em jul. 2025 vem de uma listagem de terceiros (civictech.guide, via resumo de pesquisa) |
| S11 | [iTunes Search/Lookup API (Be My Eyes, Seeing AI, Envision AI, Aira; EUA e PT)](https://itunes.apple.com/lookup?id=905177575&country=pt) | 2026-10-08 | A | Contagens e notas de avaliações |
| S12 | [HN Algolia API (consultas sobre cego, Be My Eyes, smart glasses)](https://hn.algolia.com/api/v1/search?query=be%20my%20eyes&tags=story) | 2026-10-08 | B | Atividade em histórias HN |
| S13 | [Google suggest endpoint (EN/US e pt-PT/PT), 12 sementes × a–z](https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=US&q=glasses+for+blind) | 2026-10-08 | B | Amplitude de consultas e proxy de PAA |
| S14 | [Envision, loja: Ally Solos Glasses](https://shop.letsenvision.com/products/ally-solos-glasses) | 2026-10-08 | A | US$ 699 regular, 1.º ano Ally Pro incluído, esgotado; lançamento US$ 399 (resumo de pesquisa) |
| S15 | [Eastin/VLibank, base de dados de produtos de apoio: Envision Glasses (via resumo de pesquisa)](https://www.eastin.eu/en-gb/searches/products/detail/database-vlibank/id-G20788) | 2026-10-08 | B | Preços Read/Home/Pro na Bélgica/Países Baixos (abr. 2025); distribuidores e apoio a financiamento (suporte Envision) |
| S16 | [Meta, óculos IA para cegos e baixa visão](https://www.meta.com/ai-glasses/blind-visually-impaired/) | 2026-10-08 | A (empresa) | Meta AI + Be My Eyes em 21 mercados; funcionalidades |
| S17 | [Meta, "Our AI Wearables Are Changing the Game" (18 maio 2026)](https://about.fb.com/news/2026/05/meta-ai-wearables-changing-the-game-for-disabled-people/) | 2026-10-08 | A (empresa) | Funcionalidades de acessibilidade e programas; sem números de utilização |
| S18 | [UploadVR, 7 M de óculos vendidos em 2025 (11 fev. 2026)](https://uploadvr.com/meta-essilorluxottica-sold-7-million-smart-glasses-in-2025/) | 2026-10-08 | B | > 7 M unidades em 2025 |
| S19 | [TechNode/IDC, envios de óculos inteligentes 2.º trim. 2026 (via resumo de pesquisa)](https://technode.com/2026/09/17/global-smart-eyewear-shipments-q2-2026/) | 2026-10-08 | B | +35,3% a/a; quota Meta; previsões |
| S20 | [Android Central, Ray-Ban Meta Gen 2 (via resumo de pesquisa)](https://androidcentral.com/wearables/ray-ban-meta-gen-2) | 2026-10-08 | B | US$ 379 / €419; países de venda |
| S21 | [AGIGA, EchoVision Pioneer Edition](https://agiga.ai/products/echovision-pioneer-edition) | 2026-10-08 | A | US$ 599; planos US$ 0 / 9,99 por mês |
| S22 | [RTP, Guia-NOS disponível gratuitamente para pessoas cegas e com baixa visão](https://www.rtp.pt/noticias/pais/aplicacao-guia-nos-disponivel-gratuitamente-para-pessoas-cegas-e-com-baixa-visao_n1755401) | 2026-10-08 | B | App gratuita pt-PT, óculos Meta, 20 pares no NOS Alive (grau de incapacidade 60% só na 4gnews, via pesquisa) |
| S23 | [Observador, a câmara de 4500 euros (24 nov. 2019)](https://observador.pt/2019/11/24/a-camara-de-4500-euros-que-quer-mostrar-o-mundo-a-quem-nao-ve/) | 2026-10-08 | B (> 24 meses) | OrCam em Portugal: €3 500 e €4 500; ver também [Forbes PT, 2021](https://www.forbespt.com/?p=14938) |
| S24 | [Governo do Paraná, compra de óculos de IA para alunos cegos (18 jul. 2023)](https://www.parana.pr.gov.br/aen/Noticia/Governo-compra-oculos-de-inteligencia-artificial-para-alunos-cegos-da-rede-estadual) | 2026-10-08 | A (> 24 meses) | 147 OrCam MyEye 2.0 a R$ 14,9 mil |
| S25 | [OrCam MyEye 3 Pro, preços de revendedores e alegação de utilizadores (via resumo de pesquisa)](https://thedyslexiashop.co.uk/products/orcam-myeye-3-pro-advanced-wearable-assistive-device-for-visual-impairment) | 2026-10-08 | C | £ 4 440 c/ IVA; "dezenas de milhares" de utilizadores |
| S26 | [Segurança Social, Sistema de Atribuição de Produtos de Apoio (guia) e despacho DR 15038/2025 (via resumo de pesquisa)](https://seg-social.pt/documents/10152/12207936/Sistema_Atribuicao_Produtos_Apoio_SAPA/ac2d7eac-1a73-4078-8a4c-31b37bc0c5a7) | 2026-10-08 | B | SAPA: IMU ≥ 60%, lista por despacho, verbas insuficientes em 2025 |
| S27 | [Eurostat, estatísticas de deficiência: pobreza e desigualdade (via resumo de pesquisa)](https://ec.europa.eu/eurostat/statistics-explained/index.php/Disability_statistics_-_poverty_and_income_inequalities) | 2026-10-08 | B | 28,8% em risco de pobreza/exclusão (2023); emprego 52,7% vs 76,7% (carta EDF, 2024) |
| S28 | [Security.org, relatório de óculos inteligentes 2026 (via resumo de pesquisa)](https://www.security.org/resources/smart-glasses-statistics-report/) | 2026-10-08 | C | 8% dos donos citam acessibilidade; preço é o 1.º motivo de não-compra (67%) (população geral) |
| S29 | [Vision Australia, relatório de smartphones (via resumo de pesquisa)](https://new.parliament.vic.gov.au/4947c4/contentassets/49482f7b0f0442b78c92a260fe5513ea/vision-australia-response-to-qon-21oct2021-and-smartphone-report_redacted.pdf) | 2026-10-08 | C (2021) | 79% dos clientes usam smartphone; 31% acima dos 85 anos |
| S30 | [BCE, taxas de câmbio de referência (API EXR)](https://data-api.ecb.europa.eu/service/data/EXR/D.USD+GBP.EUR.SP00.A?lastNObservations=1&format=csvdata) | 2026-10-08 | A | 1 € = 1,1186 USD = 0,84698 GBP |
| S31 | [GummySearch, r/Blind (via resultado de pesquisa)](https://gummysearch.com/r/Blind/) | 2026-10-08 | C | ≈ 25 mil membros, +17,7%/ano (sem data) |
| S32 | [PETRA 2025 e arXiv 2504.06379: custo como barreira em tecnologias de apoio (via resumo de pesquisa)](https://arxiv.org/pdf/2504.06379) | 2026-10-08 | C | O custo dos óculos inteligentes limita a adoção |
| S33 | [Envision, modelo de preços do Ally / Ally Pro (via resumo de pesquisa; página 403)](https://support.letsenvision.com/hc/en-us/articles/37256624543633-What-is-ally-s-pricing-model) | 2026-10-08 | B | US$ 10/mês (lançamento) ou US$ 20/mês; comentários de utilizadores sobre a subscrição (AppleVis, ago. 2025, resumo) |
| S34 | [Portal das Finanças, informações vinculativas sobre IVA, verba 2.9 da Lista I (via resumo de pesquisa)](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/Documents/Vinculativa_18464.pdf) | 2026-10-08 | B | Taxa reduzida de 6% só para aparelhos constantes de lista por despacho |
| S35 | [Guide Dogs Victoria, feedback de clientes sobre óculos Meta (via resumo de pesquisa)](https://vic.guidedogs.com.au/?p=170666) | 2026-10-08 | C | "não serve como auxiliar de mobilidade"; utilidade limitada para cegos totais |
| S36 | [AppleVis, Sobre](https://applevis.com/about) | 2026-10-08 | B | AppleVis pertence ao grupo Be My Eyes |
| S37 | [Envision, fundos e utilizadores (via resumo de pesquisa)](https://www.letsenvision.com/blog/envision-raises-eu1-5-million) | 2026-10-08 | C | Ronda de €1,5 M (2021); "milhares" de utilizadores pagos (promocional) |
| S38 | [Cambridge Network, cegueira a subir para 115 M até 2050 (só título)](https://www.cambridgenetwork.co.uk/news/cases-blindness-rise-115-million-2050) | 2026-10-08 | C | Projeção de longo prazo |
