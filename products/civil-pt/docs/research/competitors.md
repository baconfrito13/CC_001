# Pesquisa — Concorrentes e preços · Medições PT (civil-pt)

> **Faixa:** competitors · **Produto:** `civil-pt` · **Agente:** market-researcher (faixa B) · **Data:** 2026-11-26 · **Profundidade:** standard · **Pesquisas feitas:** ≈ 50 (pesquisas + leituras de páginas; ver Lacunas para o que ficou bloqueado)

## 1. Perguntas e falsificadores

| Pressuposto (brief) | Pergunta | Falsificador | Resultado | Fontes |
|---|---|---|---|---|
| A1 | Há comparáveis que cobram ≥ €60/mês por medição assistida por IA a empresas de construção? | Falso se < 3 comparáveis vivos cobrarem ≥ €60/mês (ex-IVA) | **Confirmado para o mercado global** (≥ 5 comparáveis com preço público entre €82 e €273/mês por utilizador); **em aberto para Portugal** (nenhum preço de referência local para IA; âncoras locais são licenças de centenas de euros) | [S2] [S7] [S8] [S9] [S10] [S23] |
| A2 | Os concorrentes provam precisão aceitável com revisão humana? | Falso se não existir nenhum teste independente de precisão | **Em aberto, a inclinar para parcialmente confirmado**: existe um teste de convidado favorável ao civils.ai (0,18 % de erro em 2 195 m de drenagem) e um estudo académico (Togal ≈ 5 % após correção manual), mas as alegações dos fornecedores (97–99 %) não têm metodologia | [S17] [S18] |
| A3 | PDF chega para o mercado-alvo (sem exigir DWG)? | Falso se os concorrentes líderes precisarem de DWG para funcionar | **Em aberto**: civils.ai e Togal são PDF-first; Kreo e BOQIFY aceitam também DWG/DXF; sem dados de Portugal sobre o formato em que as peças chegam | [S1] [S5] [S8] [S22] |
| A4 | O diferencial pt-PT (idioma, estrutura de mapa de quantidades, €/IVA, RGPD) é valorizado e não está já coberto? | Falso se existir um concorrente com interface pt-PT, exportação BC3/estrutura nacional e preço em € à venda em Portugal, ou se compradores usarem ferramentas EN sem fricção | **Em aberto (sinal favorável, prova fraca)**: não encontrei nenhum produto de IA para medições em PDF com interface pt-PT; nenhum dos 5 internacionais lista português nem BC3. Mas a pesquisa é US-only e não prova ausência; e nenhum cliente PT foi ouvido | [S9] [S13] [S26] [S28] |
| A6 | O custo de IA por folha cabe na margem (≤ ~€1–2/folha)? | Falso se os preços por folha dos concorrentes forem < €2 | **Compatível (indireto)**: o civils.ai cobra ≈ $9 (≈ €8,2) por folha medida em regime normal; Kreo cobra $0,51–1,50 por lançamento de API Auto Measure (custo de referência de mercado). Custo real por folha fica para a faixa de riscos | [S2] [S8] |

## 2. Resumo da faixa

- O concorrente de referência (civils.ai) cobra **$90/mês (10 folhas/mês) e $270/mês (30 folhas/mês)**, i.e. **≈ $9 (≈ €8,2) por folha medida** nos dois escalões; sem IVA/moeda explícitos, sem plano gratuito, sem desconto anual, sem pt-PT declarado, dados em servidores nos EUA [FACTO] [S2] [S1]. O brief (€60–250/mês) está alinhado com isto.
- Há **≥ 6 comparáveis com preço público** (civils.ai, Togal, Kreo, Bluebeam, QuantiFlow, OneEstimate) e 2–3 com preço de terceiros (Beam, STACK, PlanSwift); escalão por utilizador de €82 a €273/mês; Beam é a exceção, licenciada por ofício (≈ €607/mês/ofício, estimativa de terceiros) [FACTO/ESTIMATIVA] [S2] [S7] [S8] [S13] [S14] [S16] [S23].
- **Nenhum produto de IA para medições em PDF com UI em português europeu encontrado.** A oferta nacional/ibérica é de software clássico (CYPE Arquimedes €475 Starter, Presto, PREMETI €470 +IVA, Candy, Gest) sem leitura de PDF por IA, e os concorrentes de IA são anglófonos/US/UK/Israel/Brasil (Sienge pt-BR) [FACTO] [S10] [S13] [S22] [S23] [S28]. Pesquisa US-only: ausência ≠ prova de ausência (confiança baixa).
- **Cunhas plausíveis:** (1) medições de infraestruturas/obra civil com estrutura de mapa de quantidades PT + exportação BC3/Excel; (2) complemento (não substituto) de Arquimedes/Presto/Candy via BC3; (3) verificação de discrepâncias entre peças desenhadas em português. A 1 e a 2 combinam bem; a 3 já é feita pelo civils.ai [S1] [S13].
- **Âncora de preço local é baixa:** licenças de poucas centenas de € (Arquimedes Starter €475; Bluebeam ≈ €300/ano) e medições externas a €350–€1 000 por moradia (fórum, 2020, só edifícios). €60–250/mês (€720–3 000/ano) só se justifica pela poupança de horas — risco A1 [FACTO/PRESSUPOSTO] [S9] [S10] [S24].
- **Risco de inclusão por grandes plataformas é real:** Bluebeam Max (maio 2026, £588/utilizador/ano de lançamento) já traz revisão de desenhos por IA e integração MCP com Claude; modelos gerais falham em medição de infraestruturas (erro 24,7 % no teste de drenagem; ~71 % das linhas fora de ±20 % no teste do próprio civils.ai) — vantagem hoje, mas a janela fecha [FACTO] [S6] [S18] [S29].
- **Mineração de avaliações abaixo do mínimo** (ver 3B): o bloqueio 403 de G2/Capterra/Software Advice impediu ≥ 30 avaliações 1–3★ datadas. Só 1 avaliação de 1★ confirmada (Trustpilot); o resto são secções de "contras" de avaliações 4–5★ e excertos de resultados de pesquisa. Confiança baixa a média nos temas.

## 3. Constatações

### 3B. Concorrentes e preços

Cotação de referência: **1 EUR = 1,0975 USD (BCE, 2026-11-26)** [FACTO] [S31]. Conversões = USD ÷ 1,0975 (ESTIMATIVA).

| Concorrente | URL | Anel | Posicionamento | Alvo | Tração (estimada) | Acedido |
|---|---|---|---|---|---|---|
| **Civils.ai** (Civils.ai PTE LTD, Singapura) | https://civils.ai/ | Direto (inspiração do brief) | Agentes de IA que medem áreas/comprimentos/volumes/contagens em PDFs e verificam discrepâncias entre folhas; texto livre em inglês; revisão humana/QA; exporta Excel e PDF anotado | Empreiteiros (terraplenagens, paisagismo), consultores e projetistas de engenharia civil | Alegado: 200+ empresas em 8 países, 4,8/5 (próprio); logos Arup, AECOM, WSP, Jacobs. **ESTIMATIVA** SimilarWeb: 29,9 mil visitas em 3 meses (≈ 10 mil/mês), −21 % m/m; EUA 43 %, Índia 15 %, Singapura 7 %; Portugal fora do top 5. Sem equipa/financiamento públicos | 2026-11-26 |
| **Togal.AI** | https://togal.ai/pricing | Direto (IA em plantas; foco edifícios/GCs) | Takeoff automático ilimitado em PDF/imagem; "mais rápido takeoff self-service para GCs"; chat de prompts | Empreiteiros gerais (EUA), 1 a 4+ utilizadores | G2 4,8/5 com 60 avaliações (resumo de pesquisa); Trustpilot: 1 avaliação (perfil não reclamado); estudo académico (Kansas, 2025-12-30) ≈ 5 % de diferença após correção | 2026-11-26 |
| **Kreo** | https://www.kreo.net/pricing | Direto/indireto (takeoff 2D/CAD + IA) | Takeoff e orçamentação para QS e orçamentistas; Auto Measure 3.0, assistente Caddie; PDF, DWG/DXF, imagem; preços em EUR/GBP/USD | QS e orçamentistas (UK/Europa/EUA) | G2 4,5/5 (32); Capterra 4,4/5 (25) (resumo de pesquisa); piloto pago pré-anual | 2026-11-26 |
| **Bluebeam Revu / Max** | https://www.bluebeam.com/de-de/pricing/ | Indireto (PDF markup/medição manual, +IA no Max) | Padrão de marcação e medição em PDF; Max (lançado 2026-05) acrescenta revisão de desenhos por IA e MCP | AEC global, 15 idiomas (sem português) | 623 avaliações, 4,7/5 (Software Finder); Capterra ≈ 4,4–4,7 | 2026-11-26 |
| **Beam AI** (Attentive.ai) | https://alternativeto.net/software/beam-ai-takeoff-software/ (preço sem página oficial) | Direto (IA, takeoff como serviço com QA humana) | IA + QA humana por ofício; licença anual por ofício e volume de folhas | GCs/subempreiteiros (EUA) | Sem avaliações verificáveis; alegação "99 %+ com QA humano" não verificada | 2026-11-26 |
| **PlanSwift** | https://www.softwareadvice.com/construction/planswift-takeoff-estimating-profile/ | Indireto (medição manual em PDF, desktop Windows) | Takeoff e orçamentação desktop; Auto Count/Auto Scale | Empreiteiros pequenos/médios (EUA) | ≈ 4,1–4,3/5 em ≈ 400 avaliações (Capterra/Software Advice, resumo de pesquisa) | 2026-11-26 |
| **STACK** | https://www.capterra.com/p/147181/STACK-Takeoff/ | Indireto (cloud takeoff + IA no Premium) | Takeoff cloud com plano gratuito e IA | Empreiteiros (EUA) | Sem número verificado | 2026-11-26 |
| **CYPE Arquimedes** (CYPE, Espanha; suporte local Top Informática) | https://info.cype.com/en/product/arquimedes/ | Indireto — **incumbente local** | Mapa de quantidades e orçamento; importa/exporta FIEBDC-3 (BC3); AQ1 importa DXF/DWG; liga ao Gerador de Preços (base com versão Portugal) | Orçamentistas, projetistas e empreiteiros ibéricos | Pedido de emprego PT exige domínio de CYPE/Arquimedes (Workana, snippet); sem avaliações recolhidas | 2026-11-26 |
| **PREMETI (ATAYO)** | https://hackceleration.com/es/labs/mejor/software-mediciones-presupuestos | Indireto (Espanha, BC3, "orçamentos com IA para 12 tipos de projeto") | Orçamentação por IA em edifícios; BC3 | Aparelhadores/arquitetos técnicos (ES) | Sem dados | 2026-11-26 |
| **Presto (RIB Spain)** / **Candy (CCS/RIB)** / **Graitec Gest** | https://graitec.com/pt/products/gest/ | Indireto — incumbentes de orçamentação (Gest em PT) | Mapa de medições, orçamento, autos de medição; BC3; sem leitura automática de PDF documentada | Médias e grandes construtoras e gabinetes | Candy 4,5/5 em 252 avaliações (Capterra); Presto mais usado em ES (artigo de formação, 2026) | 2026-11-26 |
| **QuantiFlow** | https://quantiflow.co.uk/ | Direto (IA em PDF → BoQ com preços) | Lê quantidades de PDFs e gera BoQ com biblioteca de taxas UK; rastreio ao desenho | QS independentes e gabinetes (UK) | Beta privada; sem clientes públicos | 2026-11-26 |
| **BOQIFY** | https://boqify.ai/en | Direto (IA em plantas; Israel) | "QS de IA": DWG/DXF, PDF vetorial, IFC; saídas Excel/PDF/API; hebraico RTL | Arquitetos, empreiteiros, QS (Israel) | Programa "Founding Partners"; sem clientes nomeados | 2026-11-26 |
| **OneEstimate** | https://oneestimate.ai/en/blog/software-takeoff-cuantificacion-planos-construccion | Direto/indireto (LatAm, castelhano) | Takeoff + orçamento integrados no browser; claim ">99 %" | Construção LatAm | Sem dados | 2026-11-26 |
| **Sienge — Quantitativo IA (Brasil)** | https://sienge.com.br/blog/quantitativo-de-obra-com-inteligencia-artificial/ | Direto-adjacente (pt-BR) | Lê plantas 2D PDF/DWG/DXF e gera quantitativos; módulo do Construmanager (ERP de obra) | Construtoras brasileiras | Sem dados | 2026-11-26 |
| **Medição manual / Excel / serviço externo** (status quo) | — | Status quo | Medição em PDF/AutoCAD/Excel pelo orçamentista; ou subcontratar um orçamentista | Todos | Ver preços abaixo | 2026-11-26 |
| **LLMs gerais (Claude, ChatGPT)** (status quo "tecnológico") | — | Indireto | Carregar PDFs e pedir quantidades | Orçamentistas curiosos | Erro 24,7 % no teste de drenagem; PDFs digitalizados "inutilizáveis" para takeoff [S18] | 2026-11-26 |
| **Consultoria IA para PME (IANASPME)** | https://ianaspme.pt/ia-para-construcao | Indireto (serviço à medida, PT) | Constrói ferramentas à medida para construtoras (motor de orçamentos, leitura de faturas e autos); não é produto | Construtoras PT | Sem preço público; "caso Buildity.ai" não verificado | 2026-11-26 |

**Preços** (moeda, período, IVA incl.?, métrica de valor, limites, plano gratuito, desconto anual)

| Concorrente | Plano | Preço | Período | IVA incl.? | Métrica de valor | Limites | Fonte |
|---|---|---|---|---|---|---|---|
| Civils.ai | Starter | $90 (≈ €82) | mês, sem fidelização | não indicado (moeda "$" sem código) | folhas medidas | 20 folhas no 1.º mês, depois 10/mês; 2 GB; pesquisas/verificações "ilimitadas" (uso justo, 1 pessoa) | [S2] |
| Civils.ai | Professional | $270 (≈ €246) | mês | não indicado | folhas medidas | 60 no 1.º mês, depois 30/mês; 50 GB; aprende padrões do cliente; suporte prioritário | [S2] |
| Civils.ai | Enterprise | personalizado | anual/por projeto | — | folhas | multiutilizador, API/MCP, SSO, DPA | [S2] |
| Civils.ai (derivado) | — | ≈ $9 (≈ €8,2) por folha em regime normal; $4,5 (≈ €4,1) no 1.º mês Starter | — | — | **ESTIMATIVA**: 90÷10 e 270÷30 | folha com >150 medições conta 2 | [S2] |
| Togal.AI | Growth | $299 (≈ €272) | mês/utilizador, faturado anual (≈ $3 588 ≈ €3 269/ano) | não indicado | utilizador | takeoffs e prompts ilimitados | [S7] |
| Togal.AI | Business | personalizado (≥ 4 utilizadores) | — | — | utilizador | SSO, formação | [S7] |
| Kreo | Essential (sem IA) | €90 / £80 / $100 | mês/utilizador, só anual (€1 080/ano) | **sem IVA** | utilizador | sem IA; teste 7 dias | [S8] |
| Kreo | Pro (IA) | €150 / £125 / $175 | mês/utilizador, anual (€1 800/ano) | sem IVA | utilizador (1–4) | Auto Measure, Caddie, batch | [S8] |
| Kreo | Business | €220 / £210 / $250 | mês/utilizador; €13 200/ano com 5 lugares | sem IVA | utilizador (5–20) | API, IFC, SSO | [S8] |
| Kreo | API Auto Measure (Pro) | $1,50 a $0,68 por lançamento | por uso | — | lançamento | escalões por volume | [S8] |
| Bluebeam | Basics / Core / Complete / Max | $260 / $330 / $440 / $590 (≈ €237 / €301 / €401 / €538) | ano/utilizador | não indicado (€240/300/400/540 sem IVA numa comparação espanhola) | utilizador | Max: IA, MCP, revisão de desenhos | [S9] [S13] |
| Beam AI | licença por ofício | ≈ $8 000 (≈ €7 289) /ano /ofício DIY; $15 000–25 000 "done-for-you" (terceiros, não verificado) | ano | — | ofício + volume de folhas | sem tabela oficial; 1.º takeoff grátis | [S16] |
| PlanSwift | Essential / Core | $2 000 / $3 000 (≈ €1 822 / €2 733) por ano; alternativa: licença perpétua ≈ $1 595 + ≈ $400/ano manutenção | ano | USD sem imposto | utilizador | Auto Takeoff só em Core | [S13] [S14] [S15] |
| STACK | Free / Premium / Pro | $0 / $299 / $349 por utilizador/mês (≈ €272 / €318) | mês, compromisso 12 meses | USD sem imposto | utilizador | IA no Premium | [S13] |
| CYPE Arquimedes | Starter | **€475** | licença (tipo não indicado) | **não indicado** | licença | módulos ARQ + AQ1 (importa DXF/DWG) | [S10] |
| CYPE Arquimedes | M02 / M05 | €400 ou €240 / €700 ou €420 (dois valores na listagem; tabela protegida por palavra-passe) | licença | não indicado | módulo | licença "vitalícia ou por subscrição temporária" | [S11] [S12] |
| PREMETI | licença | €470 (€540 com base PREOC; €270 via Colégio de Aparelhadores de Madrid; atualização €75) | perpétua | **+ IVA** | licença | BC3 | [S13] |
| QuantiFlow | Solo / Business | £69 / £299 por mês (taxa fundador £39 / £149 nos primeiros 12 meses) | mês | não indicado | utilizador (Business: 5 lugares) | beta privada | [S23] |
| OneEstimate | Start / Pro / Business | $0 / $49 / $99 por mês (≈ €0 / €45 / €90) | mês | não indicado | utilizador | plano gratuito | [S14] |
| Medição externa (status quo) | por moradia 185 m² | €350 a > €1 000 | por projeto | não indicado | projeto | fórum 2020; só edifícios | [S24] |
| Presto, Candy, Gest, Arquimedes completo | — | sem preço público | — | — | — | cotação | [S13] |

**Escada de preços (€/mês por utilizador, ex-IVA onde conhecido; ESTIMATIVA a partir da tabela acima)**

| Degrau | Quem | Observação |
|---|---|---|
| €0 | STACK Free, OneEstimate Start, Arquimedes só de visualização | grátis, sem IA em PDF PT |
| ≈ €20–€25 | Bluebeam Basics (€237–240/ano) | só medição manual |
| €26–€45 | Bluebeam Core/Complete (€25–€33/mês), OneEstimate Pro | manual / castelhano |
| **≈ €45–€80 (vazio na prática)** | — | **degrau sem concorrente de IA + pt-PT**: civils.ai começa em €82, Kreo IA em €150 |
| €82–€90 | Civils.ai Starter; Kreo Essential (sem IA) | civils.ai: 10 folhas/mês |
| €150–€273 | Kreo Pro, civils.ai Professional (€246), Togal e STACK (€272) | núcleo do mercado IA |
| ≥ €600 | Beam AI ≈ €607/ofício | custo empresarial |

**Matriz de capacidades (FACTO onde indicado pelas páginas oficiais; "não indicado" = não consta na fonte)**

| Capacidade | Civils.ai | Togal | Kreo | Bluebeam | Arquimedes | QuantiFlow |
|---|---|---|---|---|---|---|
| Leitura IA de PDF | sim [S1] | sim [S7] | sim (Pro) [S8] | só Max (revisão) [S9] | não | sim [S23] |
| DWG/DXF | não indicado | não indicado | sim [S8] | via plug-ins CAD | sim (AQ1) [S10] | não indicado |
| Exporta BC3/FIEBDC-3 | não indicado | não (comparação) [S13] | não indicado | não [S13] | sim [S10] | não indicado |
| Estrutura de mapa de quantidades PT / ProNIC | não indicado (usa CESMM4/CSI) [S6] | não | não indicado | não | sim (bases de preços Portugal) [S11] | UK |
| Interface em português | não indicado | não indicado | não indicado | não (15 idiomas, sem português) [S9] | sim | não |
| Preço em EUR | não ($) | não ($) | **sim** [S8] | não ($; UK £) | **sim** | não (£) |
| Dados na UE | **não (servidores EUA)** [S1] | não indicado | não indicado | não indicado | local | não indicado |
| Descoberta de incoerências entre folhas | **sim** [S1] | não | não | Max: sim [S29] | não | não |
| QA humana | sim [S3] | não | não | não | — | — |

**Mineração de avaliações (1–3★)** — necessidade não satisfeita = ≥ 3 menções em ≥ 2 concorrentes

> **Nota de método:** G2, Capterra e Software Advice devolveram 403 ao `WebFetch`. Usei o Trustpilot, o Software Finder e excertos dos resultados de pesquisa. **Só 1 avaliação de 1★ está confirmada com a nota visível** (Trustpilot, Togal). As restantes citações são secções "contras" de avaliações de 4–5★ ou excertos de resultados de pesquisa sem nota visível — contam como sinal de classe B fraco. Total de itens negativos recolhidos: **16**, abaixo do mínimo standard (30). Sem nomes de utilizadores.

| Tema | Menções | Concorrentes | Citação (≤ 25 palavras) | Fonte |
|---|---|---|---|---|
| Preço / só subscrição (ver o fim do modelo perpétuo) | 7 | Bluebeam (5), Togal (1), PlanSwift (1) → **necessidade confirmada** (3 concorrentes) | «What I like least about Bluebeam is the switch from a one-time purchase model to subscription licensing.» (G2, excerto de pesquisa); «The high annual subscription costs can be a drawback for some users.» (2023-01); «It is an extremely expensive solution for basic floor plan takeoffs» (Trustpilot, 1★, 2025-09); PlanSwift: avaliador diz que lhe disseram que deixam de suportar licenças perpétuas e passam a cobrar subscrição anual (2025) | [S19] [S20] [S21] |
| Desempenho, cloud e dependência de ligação | 4 | Kreo (2), Togal (1), Bluebeam (1) → **confirmada** | «the fact kreo is cloud based makes it difficult during days in which the wifi may be down»; «Sometimes it lags when a lot of people are online at the same time»; resumo Capterra do Bluebeam: «Frequent crashes and glitches» | [S21] |
| Curva de aprendizagem / UX | 4 | Bluebeam (2), PlanSwift (1), Kreo (1) → **confirmada** | «It is quite difficult to master the software and there's not much self-help available» (Bluebeam, 2022-12); PlanSwift: interface "very old", só Windows, sem 4K (Capterra, excerto) | [S20] [S21] |
| Medição automática exige limpeza manual / fiabilidade em digitalizados e geometria complexa | 4 (artigos e blogs, não avaliações) | Kreo (1), Togal (1), Beam (1), plataforma não nomeada (1) → **parcial** (≥ 3 menções, ≥ 2 concorrentes, mas não são avaliações de utilizadores) | «auto-measure can be a little messy and i spend as much time organizing the data as i would have doing a normal takeoff» (Kreo, avaliação 2021–2023); Beam: utilizadores corrigem "roughly 5–15%" das contagens (blogue de concorrente, 2026-07, sem amostra); plataforma não nomeada: erro 20,36 % e "wrong on utilities and concrete" (teste de convidado, 2026-08) | [S16] [S18] [S21] [S17] |
| Âmbito vs marketing ("IA avançada") | 1 | Togal | resumo do avaliador: esperava cálculo automático de peso de armadura e volume de betão; Trustpilot 1★ | [S19] |
| Suporte e licenciamento | 3 | Bluebeam (2), Kreo (1, 1/5 num agregador vs 5/5 noutro) → **fraca/inconsistente** | resumo: subscrição expirada 6 meses antes do previsto; lugar desativado sem aviso (PlanSwift) | [S21] |
| Locale / idioma / normas locais | 0 em avaliações | — | **Ausência estrutural (FACTO), não menção de utilizadores**: Bluebeam lista 15 idiomas sem português; comparação espanhola diz que Bluebeam, STACK e Togal não suportam BC3; civils.ai usa CESMM4/CSI nos seus testes | [S9] [S13] [S6] |
| Limitações do incumbente local (Arquimedes) | 3 (antigas, 2008) | CYPE Arquimedes | «mas se se quiser puxar por ele a sério, rapidamente se esgota.» (2008-05) — fora do prazo de 24 meses: peso mínimo | [S25] |

**Pistas de disposição para pagar do status quo (tema não vindo de avaliações):** «isso não fica por menos de 1000€.» e «existe quem faça MQ a 350 euros» (fórum PT, 2020-09-24; moradia 185 m²); «Hoje um bom orçamentista é mais caro que um engenheiro.» (idem) — [S24], antigo e sobre edifícios, não infraestruturas.

**Lacunas e candidatas a cunha (wedge)**

| Candidata | Segmento | Promessa | Prova | Risco de cópia (< 1 mês?) | Risco de ser incluída por grandes plataformas |
|---|---|---|---|---|---|
| **W1 — Medições de infraestruturas com mapa de quantidades à portuguesa** (capítulos/artigos, unidades e terminologia nacionais, exportação BC3 + Excel) | Empreiteiros e gabinetes de terraplenagens, redes de água/saneamento, pavimentos, arranjos exteriores em PT | "Do PDF ao mapa de quantidades pronto a importar no Arquimedes/Presto/Candy, em português, preços em €, dados na UE" | Nenhum dos 5 internacionais lista português nem BC3 [S9] [S13]; civils.ai guarda dados nos EUA [S1]; ProNIC torna o MQT o formato de referência em obras públicas, mas o seu conteúdo foi desenvolvido primeiro para edifícios [S27]; **sem prova de procura PT nesta faixa** | **Média**: traduzir a UI é < 1 mês; mapear a estrutura de capítulos PT e BC3 exige conhecimento de domínio (semanas a meses) | **Média**: Bluebeam Max (MCP/Claude) e LLMs gerais podem aproximar-se; hoje Claude falha em infraestruturas (erro 24,7 %) [S18] |
| **W2 — Complemento BC3 aos incumbentes** (IA a alimentar Arquimedes/Presto/Candy em vez de os substituir) | Orçamentistas que já pagaram €475–€700+ por Arquimedes/Presto | "Mantém o teu software; poupa as horas de medir" | Arquimedes importa DXF/DWG e BC3, **não** PDF [S10] [S11]; incumbentes não anunciam leitura de PDF por IA [S13] | **Baixa a média**: o BC3 é formato aberto; ligar-se a incumbentes não depende de segredo | **Baixa**: CYPE/RIB/Graitec podem lançar mas são lentos em IA (evidência: nenhuma funcionalidade IA anunciada nas páginas lidas) |
| **W3 — Verificador de incoerências entre peças desenhadas em português** | Projetistas, gabinetes de coordenação, fiscalização | "Deteta discrepâncias entre especialidades antes da obra" | civils.ai já faz isto e é o seu diferencial [S1]; Bluebeam Max "Smart Review" [S29]; sem prova PT | **Alta**: civils.ai e Bluebeam já têm a base técnica | **Alta** (Bluebeam Max com Claude) |
| **W4 — Medição assistida + revisão humana como serviço a preço por obra** | Pequenos empreiteiros sem orçamentista interno | "Mapa de quantidades em 24–48 h por €X por obra" | Âncora local €350–€1 000 por MQ de moradia [S24]; Beam e civils.ai já oferecem QA humana [S3] [S16]; mão-de-obra do fundador necessária (não escala com 1 pessoa) | **Média** | **Baixa**, mas margem e escala fracas para um fundador a solo |

Conclusão da faixa sobre a lacuna: o degrau "IA + pt-PT + BC3 + €/IVA + UE + €45–€150/mês" parece vazio, mas a prova é de ausência numa pesquisa US-only e sem cliente português ouvido. W1+W2 são a combinação mais defensável; W3 e W4 são, respetivamente, copiáveis e não escaláveis.

## 4. Lacunas e limitações

- **Avaliações 1–3★: mínimo não cumprido** (16 itens negativos de 3+ concorrentes vs 30 exigidos). G2, Capterra e Software Advice (WebFetch → 403); G2 só via excertos de pesquisa; Reddit não acessível (pesquisa não devolveu fios). Para fechar: acesso a G2/Capterra por browser, ou entrevistas a 5 orçamentistas.
- **Citações de avaliações e algumas classificações** vêm de resumos de resultados de pesquisa (extração secundária), não de leitura direta da página; verificar antes de citar em material público. A nota "4,8/5 com 60 avaliações" do Togal no G2 e as notas de Kreo/PlanSwift/Candy são desse tipo.
- **Preço do civils.ai:** moeda sem código ("$"), sem IVA, sem preços localizados (a página principal fala de "localized pricing" mas a página de preços não os mostra) [S2] [S3]. Pode alterar-se.
- **Preços de Beam AI, PlanSwift e STACK** são de terceiros (agregadores/comparações), valores divergentes entre fontes (Togal: $299/mês vs $249,99–$299,99 numa página AU; Kreo: $35–$100 de entrada segundo agregadores, **$100 na página oficial**); só os de Kreo, Togal, Bluebeam e civils.ai vêm de páginas oficiais [S2] [S7] [S8] [S9].
- **Preços CYPE:** a tabela oficial está protegida por palavra-passe; os valores de módulos (€400/€240, €700/€420) vêm de um excerto de pesquisa e têm dois valores sem legenda; IVA e tipo de licença não indicados. **Preços de Presto, Candy, Gest e Top Informática: não encontrados** (página Top Informática devolveu 503; Gest sem conteúdo). Cotação obrigatória a pedir.
- **Tração do civils.ai:** SimilarWeb é estimativa e mostra queda de 21 % m/m; as alegações (200+ empresas, 97 %, 4,8/5) são marketing não verificado. Teste de precisão favorável (0,18 %) é artigo de convidado cuja independência não pode ser confirmada [S18]; o teste de LLMs é publicado pelo próprio civils.ai [S6].
- **Demanda e disposição a pagar em Portugal:** nenhum cliente português, preço local de IA ou volume de procura foi encontrado nesta faixa (ficam para as faixas Mercado e Público). Âncora de preço do fórum é de 2020 e de edifícios.
- **Ausência não é prova:** WebSearch é US-only; não encontrei concorrentes de IA com UI em português europeu, mas pequenos fornecedores portugueses ou startups podem existir (ex.: "Buildity.ai", mencionado por uma consultora, **não verificado**). Pesquisa de seguimento sugerida: LinkedIn, Startup Portugal, associações (AICCOPN, AECOPS) e entrevistas.
- **Grupos de Facebook/LinkedIn de orçamentistas portugueses:** não acessíveis.
- **Funcionamento em português:** não verifiquei se o civils.ai processa corretamente peças desenhadas com legendas em português; teste prático com plantas reais seria a prova mais barata.
- **Datas:** a maior parte das fontes de concorrentes tem < 12 meses; os fóruns portugueses (2008, 2020) e avaliações de Kreo (2021–2023) estão fora do prazo e foram descontados.

## 5. Contributo para o scorecard (provisório)

| Critério | Nota proposta (1–5) | Confiança (alta / média / baixa) | Evidência-chave |
|---|---|---|---|
| Lacuna competitiva (10 %) | **3** | **baixa** (máx. 3) | Sem produto IA com pt-PT/BC3 encontrado e os 5 internacionais não suportam português nem BC3 [S9] [S13]; mas pesquisa US-only, concorrente global forte (civils.ai com QA e verificação de discrepâncias) e risco Bluebeam Max/LLMs [S1] [S29] |
| Disposição para pagar (15 %) — input | **3** | **média** | ≥ 6 comparáveis com preço público em €82–€273/mês [S2] [S7] [S8] [S23]; mas âncoras PT mais baixas (Arquimedes €475; MQ €350–€1 000) [S10] [S24] e preços de IA variam de €45 a ≈ €607 — segmento sensível a preço |
| Procura (15 %) — input | **3** | **média** | ≥ 3 concorrentes vivos e a lançar produtos (Bluebeam Max 2026-05; Kreo Auto Measure 3.0; QuantiFlow/BOQIFY em beta) [S8] [S22] [S23] [S29]; mas tração visível modesta: civils.ai ≈ 10 mil visitas/mês, Portugal fora do top 5 [S30] |
| Viabilidade (10 %) — input | contributo neutro | média | Preços por folha ≈ €8 e testes independentes sugerem que a medição por IA em infraestruturas é tecnicamente possível [S2] [S18]; spike fica para a faixa de riscos |

## 6. Fontes

| ID | Fonte | Acedido em | Classe (A/B/C/D) | Suporta |
|---|---|---|---|---|
| S1 | [Civils.ai — AI for Construction](https://civils.ai/) | 2026-11-26 | A (página do fornecedor; alegações = marketing) | Posicionamento, funcionalidades, alegações, empresa, servidores EUA |
| S2 | [Civils.ai — Pricing](https://civils.ai/pricing) | 2026-11-26 | A | Escalões $90 e $270, folhas incluídas, limites |
| S3 | [Civils.ai — llms.txt](https://civils.ai/llms.txt) | 2026-11-26 | A | "Planos a partir de US$90/mês", QA de especialistas, sem treino com dados do cliente |
| S4 | [Civils.ai — comparação com Togal.AI](https://civils.ai/compare/togal-ai) | 2026-11-26 | C (página comparativa do próprio concorrente) | Preço do Togal ($299, data 2026-10-15) |
| S5 | [Civils.ai — comparação com Kreo](https://civils.ai/compare/kreo) | 2026-11-26 | C | Funcionalidades Kreo (verificadas em S8) |
| S6 | [Civils.ai — Can General-Purpose LLMs Perform Accurate Civil Estimates?](https://civils.ai/blog/can-llms-perform-good-civil-estimates/) | 2026-11-26 | C (estudo do próprio fornecedor, 2026-05-16) | Erros de LLMs gerais, normas CESMM4/CSI, GBP |
| S7 | [Togal.AI — Pricing](https://togal.ai/pricing) | 2026-11-26 | A | Growth $299/utilizador/mês anual, Business custom |
| S8 | [Kreo — Pricing](https://www.kreo.net/pricing) | 2026-11-26 | A | Escalões em USD/GBP/EUR sem IVA, APIs, pilotos, 7 dias de teste |
| S9 | [Bluebeam — Pricing (DE, EN-US)](https://www.bluebeam.com/de-de/pricing/) | 2026-11-26 | A | Basics/Core/Complete/Max, 15 idiomas sem português, funcionalidades Max |
| S10 | [CYPE Shop — Arquimedes STARTER](https://shop.cype.com/en/product/arquimedes-starter/) | 2026-11-26 | A | €475, módulos ARQ + AQ1 (DXF/DWG) |
| S11 | [CYPE Shop — Tabela de preços (excerto de pesquisa)](https://shop.cype.com/pt/tabela-de-precos) | 2026-11-26 | C (página protegida; valores de excerto) | Módulos M02/M05, base de preços Portugal |
| S12 | [CYPE — Licença profissional](https://info.cype.com/pt/escolha-licenca-cype/) | 2026-11-26 | A | Licença vitalícia ou por subscrição temporária |
| S13 | [Hackceleration — Mejor software de mediciones y presupuestos (2026)](https://hackceleration.com/es/labs/mejor/software-mediciones-presupuestos) | 2026-11-26 | C (comparação de terceiros) | Preços em € sem IVA, BC3, PREMETI, STACK, PlanSwift, Togal |
| S14 | [OneEstimate — comparativa de software takeoff (2026-06-13)](https://oneestimate.ai/en/blog/software-takeoff-cuantificacion-planos-construccion) | 2026-11-26 | C (blogue de concorrente) | Preços OneEstimate, PlanSwift, OST, Bluebeam |
| S15 | [Resultados de pesquisa — PlanSwift/STACK pricing 2026 (Vertigraph, Capterra)](https://www.vertigraph.com/learn/takeoff-software-pricing-2026) | 2026-11-26 | D (agregador; valores divergentes) | PlanSwift e STACK em USD |
| S16 | [Struvia — Beam AI Takeoff Pricing, Pros & Cons (2026-07-14)](https://struvia.co/blog/beam-ai-takeoff-review) | 2026-11-26 | C (blogue de concorrente; divulga conflito) | Beam sem tabela de preços; 5–15 % de correção; contras |
| S17 | [Bildrix — AI Takeoff Accuracy: Advertised vs Measured](https://bildrix.com/research/ai-takeoff-accuracy) | 2026-11-26 | C (concorrente; divulga conflito) | Alegações vs medições, estudo Kansas, modos de falha |
| S18 | [Structures Insider — Benchmarked: AI Quantity Takeoff Accuracy on 50 Civil Drawings](https://www.structuresinsider.com/post/benchmarked-ai-quantity-takeoff-accuracy-on-50-civil-drawings-2026-data) | 2026-11-26 | C (artigo de convidado, independência não confirmada) | Erro 0,18 % civils.ai; 24,74 % Claude; 20,36 % plataforma não nomeada |
| S19 | [Trustpilot — Togal.AI](https://www.trustpilot.com/review/togal.ai) | 2026-11-26 | B | Avaliação 1★ (2025-09), perfil não reclamado |
| S20 | [Software Finder — Bluebeam Revu reviews (pág. 6)](https://softwarefinder.com/project-management-software/bluebeam-revu/reviews?page=6) | 2026-11-26 | B | 4,7/5 em 623 avaliações; contras (2022-11 a 2023-01) |
| S21 | [Resultados de pesquisa — avaliações Kreo/Togal/Bluebeam/PlanSwift (Capterra, G2, Software Advice)](https://www.capterra.com/p/121586/Bluebeam-PDF-Revu/reviews/) | 2026-11-26 | C (excertos de pesquisa; páginas devolvem 403) | Citações de avaliações (G2 Togal/Bluebeam, Capterra Kreo/PlanSwift) |
| S22 | [BOQIFY](https://boqify.ai/en) | 2026-11-26 | A | Posicionamento, formatos, sem preços |
| S23 | [QuantiFlow](https://quantiflow.co.uk/) | 2026-11-26 | A | Preços em GBP, beta privada |
| S24 | [Fórum da Casa — Mapa de quantidades (2020-09-24)](https://forumdacasa.com/discussion/73158/mapa-quantidades/) | 2026-11-26 | C | Preços €350–€1 000 por MQ, citações PT |
| S25 | [Fórum da Casa — opinião sobre o programa CYPE (2008)](https://forumdacasa.com/discussion/972/1/qual-a-vossa-opiniao-do-programa-cype-2008/) | 2026-11-26 | C (> 24 meses) | Limitações do Arquimedes |
| S26 | [IANASPME — IA para construção](https://ianaspme.pt/ia-para-construcao) | 2026-11-26 | C | Consultoria PT à medida, sem preço |
| S27 | [Especificações técnicas na construção: desenvolvimentos no âmbito do ProNIC (U. Coimbra)](https://estudogeral.uc.pt/bitstream/10316/38499/1/Especificacoes%20tecnicas%20na%20construcao_desenvolvimentos%20no%20ambito%20do%20ProNIC.pdf) | 2026-11-26 | C (académico, antigo) | ProNIC, MQT como referência; conteúdo inicial em edifícios |
| S28 | [Sienge — Quantitativo de obra com IA em PDF 2D](https://sienge.com.br/blog/quantitativo-de-obra-com-inteligencia-artificial/) | 2026-11-26 | C | Oferta pt-BR |
| S29 | [Architosh — AI-powered Bluebeam Max launches globally (2026-05)](https://architosh.com/2026/05/ai-powered-bluebeam-max-launches-globally/) | 2026-11-26 | B | Lançamento Max, MCP com Claude, £588 introdutório |
| S30 | [SimilarWeb — civils.ai (out. 2026)](https://www.similarweb.com/website/civils.ai/) | 2026-11-26 | C (estimativa) | 29,9 mil visitas em 3 meses, países |
| S31 | [BCE — taxa de referência EUR/USD](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html) | 2026-11-26 | A | 1,0975 USD por EUR |
