# Pesquisa e veredicto G1 — Medições PT

> **Produto:** `civil-pt` · **Data:** 2026-11-26 · **Profundidade da pesquisa:** standard · **Fontes:** 32 · **Notas por faixa:** `research/market.md`, `research/competitors.md`, `research/audience.md`, `research/risks.md`

> **Revisão após o advogado do diabo (2026-11-26).** Todas as objeções D1–D8 têm resposta no fim do documento. O que mudou: (1) a nota da ideia original desce de 2,60 para **2,45** (dor 3 → 2: os sinais portugueses vêm de um único fórum, de edifícios, e nenhum é do segmento-alvo); (2) os ângulos 1 e 3 foram repontuados com evidência nova (**2,70** e **2,20**; tetos de secretária 3,20 e 3,10) e nenhum chega a 3,5, logo não há PIVOT; (3) retiraram-se «três factos medidos» e «não frágil», corrigiu-se a leitura do barómetro AICCOPN (o −39 % é 81 % edifícios; infraestruturas +2,7 % em valor, −31 % em número) e o «veto por tamanho» deixou de ser critério. Veredicto: **KILL provisório, não validado**.

## 1. Resumo executivo

| | |
|---|---|
| **Veredicto** | **KILL provisório, não validado** — pontuação **2,45 / 5** (banda 1,70–3,00 consoante as lacunas se resolvam; melhor ângulo alternativo: 2,70, teto de secretária 3,20, abaixo de 3,5) |
| **Knockout** | Nenhum confirmado. K2 (atos reservados de engenharia) fica como lacuna não verificada, sem efeito no veredicto |
| **Profundidade para as fases seguintes** | não aplicável (a regra adaptativa só se aplica a GO/PIVOT); `product.json` mantém `standard` |
| **Cunha (wedge) mais forte encontrada** | Para empreiteiros e gabinetes de obra civil/infraestruturas em Portugal que perdem horas a medir ou a verificar mapas de quantidades em PDF, a Medições PT é um assistente de medição com IA, em pt-PT, com a estrutura de mapa de quantidades nacional, preço em € e armazenamento na UE, ao contrário do civils.ai e dos restantes takeoff internacionais, que não têm português, BC3 nem preço local. |
| **Hipótese de MVP (se o fundador forçar)** | Carregar PDF vetorial, deteção de escala e medição geométrica exata, IA só para rotular e validar, revisão humana com rasto até à geometria, exportação Excel (BC3 como extra) |
| **Hipótese de monetização** | Subscrição B2B por folhas medidas · empresa (orçamentista/diretor técnico) · €60–150/mês sem IVA (PRESSUPOSTO) · Stripe direto + Stripe Tax |
| **Primeiro canal** | Outbound manual a decisores de empresas CAE 42/43 e gabinetes 71120, com oferta «medimos uma folha do vosso próximo concurso» |
| **Maior risco** | Falta de evidência do segmento-alvo (nenhuma voz de empreiteiro de infraestruturas, procura por medir, canal por testar) num mercado só-PT pequeno: SOM de 12 meses entre ≈ €5 k e ≈ €32 k conforme o teste de outbound (base original ≈ €17 k), sem audiência do fundador e sem prova de que alguém pague por medição por IA em Portugal |

O veredicto assenta num facto medido, duas estimativas e uma ausência de evidência, não em «três factos medidos». **Facto medido:** o universo comprador é de ≈ 1 543 contas (879 empresas «núcleo» + 664 gabinetes, todas com ≥ 10 pessoas) [M5] (não reverificado nesta ronda: a API do INE devolveu 403 ao crítico). **Estimativas (taxas em PRESSUPOSTO):** TAM base ≈ €1,8 M e SOM base ≈ €17 k no primeiro ano, recalibrado para €5–32 k no §5. **Ausência de evidência:** a procura é de lista e não de pesquisa, por isso o autocomplete (zero sugestões para as frases de solução) não mede nada e a procura fica «não medida», não «zero» [M3]; e a dor documentada em português vem de edifícios e de particulares num único fórum, sem nenhuma voz de empreiteiro de infraestruturas [A1] [A4]. A favor: nenhum knockout, custo de IA por folha ≈ €0,34 (base) contra ≈ €8 de preço de referência, e uma lacuna de idioma pt-PT sem concorrente de IA encontrado (mas ver §6: já há ferramentas ibéricas em castelhano com BC3 a €10–30/mês). O que poderia mudar o veredicto está em §3 (falsificadores).

## 2. Scorecard G1

| Critério | Peso | Nota (1–5) | Confiança (alta / média / baixa) | Contributo | Evidência-chave | Fontes |
|---|---|---|---|---|---|---|
| Dor e frequência do problema | 15% | 2 | baixa | 0,30 | Os sinais portugueses vêm de **uma só comunidade** (Fórum da Casa, 4 fios), de edifícios e particulares, e contam como uma fonte independente; nenhum é de empreiteiro de infraestruturas. A âncora 3 exige ≥ 10 queixas independentes em 12 meses (há 5 sinais datados, 3 origens). Pagam-se €350–1 200+ por mapa de moradia e há funções dedicadas de «medidor orçamentista», o que sustenta a dor na atividade adjacente, não no segmento. Desce de 3 para 2 (regra 3: sem evidência do segmento) — resposta a D1 | [A1] [A4] [A16] [M8] |
| Evidência de procura | 15% | 2 | baixa | 0,30 | **Não medida** (não «zero»): o autocomplete não discrimina num mercado de lista (0 sugestões para 6 frases de solução pt-PT; para «lista de erros e omissões» só a própria frase) e não há volumes nem comunidade PT; concursos de infraestruturas H1 2026 +2,7 % em valor mas −31 % em número; ≥ 3 concorrentes vivos e financiados (conta a favor da âncora 3). Âncoras de volume/comunidade não cumpridas; a verificação «price-aware» sobre a lista dá razão 0,5–1,0 (banda 3) mas com entradas PRESSUPOSTO (classe D), sem efeito na nota — resposta a D2/D3 | [M3] [A5] [E-9] |
| Disposição para pagar / clareza da monetização | 15% | 3 | média | 0,45 | Pagador claro; ≥ 6 comparáveis de IA a €45–€318/mês por utilizador (mediana ≈ €246); âncoras locais muito mais baixas (Arquimedes €475 de licença) e nenhum pagamento por IA observado em PT | [M2] [C7] [C8] [M15] [C13] |
| Distribuição | 15% | 2 | baixa | 0,30 | A lista de ≈ 1 543 contas nomeáveis prova alcance, não canal: não há SERP inspecionada, comunidade com promoção permitida nem política das associações (as «Counts» da âncora 3 não existem); a SERP pt-PT sobre o art. 50.º já tem um editor comercial ativo (ConcursosGov, 2026-11-19), logo não é «fraca» por defeito; outbound é ação reservada ao fundador. Retirados: «fundador sem audiência» (pesa em Aderência, não aqui) e o 48,3 % de empresas individuais (não se aplica à lista ≥ 10 pessoas) — resposta a D1/D7 | [M3] [M4] [R17] [E-2] |
| Lacuna competitiva | 10% | 3 | baixa | 0,30 | Nenhum dos 5 internacionais lista português nem BC3; civils.ai com dados nos EUA; mas pesquisa US-only, tradução copiável em < 1 mês e Bluebeam Max com IA e Claude (MCP) | [C9] [C13] [M1] [C29] |
| Viabilidade de construção | 10% | 3 | baixa | 0,30 | Receita `ai-app`; spike vetorial exato (erro 0) e custo €0,34/folha; mas precisão não provada em plantas reais, 40 unidades de MVP (≈ 28 cortado) acima do teto Must ≤ 25 | [R27] [R3] [R7] [R8] |
| Tempo até à primeira receita | 10% | 2 | baixa | 0,20 | Checkout B2B possível no dia 1 [R16], mas a âncora conta analogias temporais e ciclos de venda observados e exclui otimismo: não há nenhum, e o piloto pago a 45 dias é um plano, não uma observação; ciclo com demo e validação de precisão; sem canal pago | [R16] |
| Risco (invertido) | 5% | 3 | média | 0,15 | RGPD comum, AI Act risco mínimo, Stripe sem restrição; desce por responsabilidade por erro silencioso e por «dados na UE» não cumprível com a API direta | [R4] [R16] [R19] |
| Aderência ao fundador | 5% | 3 | média | 0,15 | `FOUNDER.md`: «Setores ou temas a evitar» vazio, «Ativos que já tens» vazio, competências vazias: neutro, sem audiência no setor | [A8] |
| **Total** | **100%** | | | **2,45** | | |

- **Pontuação pessimista** (critérios com confiança baixa menos 1): **1,70** → KILL. Este teste só desce e um KILL não pode «virar» para baixo, por isso o rótulo «não frágil» foi **retirado** (resposta a D1). O que importa é a **sensibilidade para cima**:

| Cenário (só o que muda face ao base) | Nota | Veredicto |
|---|---|---|
| Base | 2,45 | KILL |
| Distribuição 2 → 3 | 2,60 | KILL |
| Tempo até à receita 2 → 3 | 2,55 | KILL |
| Distribuição 3 **e** tempo 3 | 2,70 | KILL |
| … e dor 2 → 3 | 2,85 | PIVOT |
| Dor, procura, distribuição e tempo todos +1 | 3,00 | PIVOT |
| Pessimista (L − 1) | 1,70 | KILL |

  A banda é **1,70–3,00** (central 2,45). O PIVOT só aparece se **três ou mais** critérios de confiança baixa subirem ao mesmo tempo sem evidência nova; por isso o rótulo correto é «KILL provisório, não validado», não «KILL robusto». **Teto com as confianças atuais** (baixa = 3, média = 4): **3,25**: mesmo que todas as lacunas se resolvessem no melhor sentido dentro dos tetos, o resultado seria PIVOT e nunca GO, a menos que nova evidência de classe A/B eleve confiança e notas. Cenário otimista só atingível com validação (dor 4, procura 3, pagar 4, distribuição 3, lacuna 4, viabilidade 4, receita 3): **3,50**.
- **Limiares:** GO ≥ 3,50 sem knockouts · PIVOT 2,80–3,49 · KILL < 2,80 ou knockout confirmado.
- **Knockouts verificados:** K1 não · K2 possível mas não confirmado (atos reservados de engenharia não pesquisados; a ferramenta não assina nem certifica) · K3 não · K4 não · K5 não (Stripe sem proibição) · K6 não (campo vazio) · K7 não (lacuna: condições de reutilização das peças de concursos) · K8 não (custo de IA 1–37 % do preço por folha).

### 2.1 Ângulos alternativos repontuados (resposta a D5)

Mesma rubrica; regra do pivô (`idea-scorecard.md` §5): um critério só sobe com evidência específica da variante, e sem ela no máximo +1. A0 = ideia original com a nota corrigida. Evidência nova específica em §11 e na lista E-1 a E-9.

| Critério (peso) | A0 original | Ângulo 1 · verificador de erros e omissões | Ângulo 3 · PDF→BC3 ibérico | Razão da diferença |
|---|---|---|---|---|
| Dor (15) | 2 L | **3 M** | 2 L | Ângulo 1: classe A, art. 378.º n.º 3 CCP (o empreiteiro suporta **metade** dos trabalhos de suprimento de erros e omissões detetáveis que não listou) e TdC (≈ 50 % das obras com adicionais, ≈ 57 % por deficiências de projeto; 2016, desconto por idade) [E-1] [E-3]. Falta a voz do empreiteiro, por isso não sobe a 4 |
| Procura (15) | 2 L | 2 L | 2 L | Eventos de uso mensuráveis (2 929 concursos em H1 2026, 1 395 de infraestruturas) mas sem volumes de pesquisa; ES: concorrentes vivos mas sem volumes medidos |
| Pagar (15) | 3 M | 3 L | 2 L | Ângulo 1: preço por proposta sem comparável direto (Constrik ≈ €250/estudo, vendor, ES [E-8]); ângulo 3: substitutos a €9,95–29,95/mês [E-6] |
| Distribuição (15) | 2 L | 2 L | 2 L | Gatilho público com relógio (primeiro terço do prazo) melhora o desenho do outbound, mas sem evidência de canal que funcione |
| Lacuna (10) | 3 L | 3 L | 2 L | Ângulo 3: concorrentes locais em castelhano com IA, PDF e BC3 e plano gratuito [E-6] [E-8] |
| Viabilidade (10) | 3 L | 3 L | 3 L | Ângulo 1 acrescenta o cruzamento artigo↔desenho (sem spike); pode descer a 2 |
| Tempo até à receita (10) | 2 L | **3 L** | 2 L | Ângulo 1: alavanca «pré-venda com serviço por concurso, sem construir» (+1 permitido pela regra do pivô, sem analogia observada) |
| Risco (5) | 3 M | 3 L | 3 M | Ângulo 1: erro silencioso com consequência legal (art. 378.º) agrava a responsabilidade |
| Aderência (5) | 3 M | 3 M | 3 M | `FOUNDER.md` neutro |
| **Total** | **2,45** | **2,70** | **2,20** | |
| Pessimista (L − 1) | 1,70 | 1,90 | 1,30 | |
| Teto de secretária com as confianças atuais | 3,25 | **3,20** | 3,10 | Nenhum atinge 3,5 sem evidência nova de classe A/B |
| Otimista com validação | 3,50 | **3,60** | — | Ângulo 1 com dor 4, procura 3, distribuição 3, pagar 4, lacuna 4, viabilidade 4, tempo 4: exige ≥ 3 pilotos pagos, ≥ 10 vozes do segmento e o teste de precisão |

**Leitura.** O ângulo 1 é o melhor dos três, mas a regra do pivô exige ≥ 3,5 e a evidência de secretária não passa de 3,20. O ângulo 2 (serviço híbrido para edifícios) não foi repontuado: assenta num único fórum e em operação humana que colide com o tempo do fundador (viabilidade 1–2). Resultado: **não há PIVOT**; o que separa «arquivar» de «validar o ângulo 1» é o custo da validação (§11, HT-01), não mais pesquisa de secretária.

## 3. Veredicto e justificação

**KILL provisório, não validado (2,45).** A ideia é legal, tecnicamente exequível e tem economia unitária saudável, mas a pesquisa de secretária **não encontrou evidência de que alguém no segmento-alvo (empreiteiros e gabinetes de infraestruturas em Portugal) sinta a dor ou pague pela solução**: nenhuma voz do segmento, procura não medida, canal por testar e tempo até à receita sem analogia observada. O resultado está abaixo de 2,80 sem depender de nenhum knockout e reflete lacunas de evidência, não um mercado medido como mau; a banda é 1,70–3,00 e o melhor ângulo alternativo não chega a 3,5 (§2.1). **Separação de argumentos (resposta a D4):** o veredicto resulta apenas do score. O tamanho do mercado (SOM base ≈ €17 k; €5–32 k na recalibração do §5) é um risco (R1), não um veto: o G1 não tem critério de tamanho e o fator escasso é o tempo do fundador, que não foi declarado.

**O que mudaria a nossa opinião** (falsificadores observáveis):
1. ≥ 3 empreiteiros ou gabinetes portugueses de infraestruturas aceitam um **piloto pago** (≥ €60/mês, ou um preço por concurso) em 45 dias após uma demonstração com folhas reais (levantaria procura, pagar e receita para 3–4 e o total para ≈ 3,3–3,5).
2. ≥ 20 folhas portuguesas reais medidas pelo motor vetorial com **≥ 85 % das linhas dentro de ±10 %** face a um orçamentista independente, e ≥ 60 % de 10 concursos reais com peças em PDF vetorial (A2/A3).
3. Um mercado endereçável **≥ 5× maior** com o mesmo produto (por exemplo Península Ibérica com BC3), com SOM base ≥ €80 k. **Testado em secretária na resposta a D6: não cumprido** (≈ 4,8× em valor de concursos, 3,2× em emprego, e substitutos locais a €10–30/mês).

## 4. Cunha e posicionamento inicial

| | |
|---|---|
| **Segmento** | Empreiteiros, subempreiteiros e gabinetes de orçamentação/projeto de obra civil e infraestruturas em Portugal com ≥ 10 pessoas (≈ 1 543 contas) |
| **Promessa** | Do PDF ao mapa de quantidades em minutos por folha, em português, com estrutura nacional e exportação para Excel/BC3, em € e com ficheiros na UE |
| **Prova (necessidades por satisfazer)** | Língua e normas locais: 0 de 5 internacionais com português ou BC3 (ausência estrutural, FACTO, não menções de utilizadores) · preço/subscrição: 7 menções em 3 concorrentes · fiabilidade da medição automática: 4 menções (parcial) · [C9] [C13] [C18] |
| **Porque os atuais não a servem** | Os internacionais são em inglês, em $/£, com dados nos EUA (civils.ai); os incumbentes locais (Arquimedes, Presto, Candy) não leem PDF por IA |
| **Risco de cópia / de ser absorvida** | Média a alta: traduzir a interface demora < 1 mês; Bluebeam Max (maio 2026) já tem revisão de desenhos por IA e MCP com Claude [C29] |
| **Alternativas de cunha descartadas** | W3 verificador de incoerências (civils.ai e Bluebeam já o fazem, risco alto de cópia) · W4 serviço por obra com revisão humana (não escala a solo; passa a ângulo 2 em §11) |
| **Reformulação da cunha (D5)** | Em obras públicas o mapa de quantidades vem do dono de obra (CCP art. 43.º n.º 4) e o trabalho do concorrente é verificá-lo no primeiro terço do prazo (art. 50.º) [E-1]. A cunha reformulada é o **ângulo 1** (§11), pontuado 2,70 (§2.1); a cunha medida acima continua a ser a pontuada no scorecard base |

## 5. Dimensão do mercado (bottom-up)

Câmbio €1 = $1,0975 (BCE, 2026-11-26) [M19]. Preços sem IVA. Núcleo = CAE 42 e CAE 43110/43120/43130 com ≥ 10 pessoas (879); gabinetes = CAE 71120 com ≥ 10 pessoas (664); micro = 4 059 empresas com < 10 pessoas [M5].

| Nível | Fórmula | Baixo | Base | Alto | Etiqueta |
|---|---|---|---|---|---|
| TAM | Baixo: 879 × €984 · Base: 1 543 × €1 188 · Alto: 1 543 × €2 952 + 4 059 × €588 | €0,86 M | €1,83 M | €6,94 M | ESTIMATIVA (preços base e micro em PRESSUPOSTO) |
| SAM | Quota que mede por conta própria e sobre PDF: 30 % do núcleo · 50 % núcleo + 30 % gabinetes · 70 % núcleo + 40 % gabinetes + 10 % micro | €0,26 M | €0,76 M | €2,84 M | ESTIMATIVA (quotas em PRESSUPOSTO, sem fonte) |
| SOM (12 meses) | Σ canais (alcance × visita→teste × teste→pago × preço anual): 1,65 / 14,4 / 55,5 clientes | €1,6 k | €17,1 k | €83,3 k | ESTIMATIVA (todas as taxas em PRESSUPOSTO) |

SOM ÷ SAM = 0,6 % / 2,3 % / 2,9 % (abaixo de 5 %). **Sinalização:** o cenário base (≈ €1,4 k/mês de receita bruta, antes de impostos e custos) é um negócio de nicho, não um rendimento a tempo inteiro; é um risco (R1), não um critério do G1 (D4).

**Tendência (corrigida; AICCOPN n.º 150, tabelas «por tipo de obra», PDF extraído e conferido nesta ronda; FACTO) [A5] [E-4].** Os concursos de empreitada promovidos em H1 2026 somam 3 662 M€ contra 5 972 M€ em H1 2025 (−2 311 M€, −39 %); **81 % da queda (−1 881 M€) é «Construção de edifícios»** (−77 % em valor, −48 % em número). As quatro categorias de infraestruturas (Estruturas e Vias, Engenharia Hidráulica, Outras Obras de Engenharia Civil, Preparação dos Locais) somam 2 389 M€ contra 2 326 M€ (**+2,7 % em valor**; Estruturas e Vias +21 %, Hidráulica +19 %, Preparação +28 %, Outras Obras de Eng. Civil −33 %), mas 1 395 concursos contra 2 010 (**−31 % em número**), pelo que o valor médio sobe de ≈ €1,16 M para ≈ €1,71 M por concurso (ESTIMATIVA: valor ÷ número). 2025 foi o máximo da série (10 041 M€ em concursos, +21 %; contratos celebrados 7 568 M€, +48 %): o −39 % compara com um pico. Com a sazonalidade de 2025 (H1 = 59,5 % do valor anual), 2026 aponta para ≈ 6,2 mil M€ (ESTIMATIVA), ao nível de 2023 (6 048 M€) e acima de 2019–2022 (3,7–4,9 mil M€). **Leitura:** o segmento de infraestruturas mantém o valor com menos concursos, o que reduz os eventos de uso (a frequência é o que conta para este produto) mas não é uma contração de 39 %. O −2,4 % do INE (trabalho executado em 2024, indicador atrasado) não contradiz isto. Sem dados do 2.º semestre; o fim do PRR (agosto de 2026) pode prolongar a queda em número (hipótese, sem fonte). A estratégia BIM (RCM 89/2026) pode, a prazo, extrair quantidades de modelos e reduzir a medição em PDF, sem prazo de obrigatoriedade confirmado [M14].

**Calibração do SOM (resposta a D4; ESTIMATIVA, taxas em PRESSUPOSTO).** O funil base do outbound (600 contactos × 4 % × 20 % = 4,8 clientes, 0,8 %) não estava ancorado no teste do §7, cujo critério de sucesso (≥ 1 compromisso de piloto em 50 contactos = 2 %) é um **limiar de decisão, não um valor esperado**. Por isso o SOM passa a ser condicional ao teste: **se falhar** (< 1 % de compromissos), ≈ 4 clientes e ≈ **€5 k**; **se passar** (2 %), o outbound dá 12 clientes (contra 4,8) e, somando os outros dois canais do base (3,6 + 6,0), ≈ 21,6 clientes, ou ≈ **€26 k** a €99/mês e ≈ **€32 k** com preço médio de €125/mês (mix Starter/Professional). O intervalo €5–32 k tem a mesma ordem de grandeza do base de €17 k. O preço de €99 **não é um piso**: substitutos ibéricos custam €9,95–39/mês [E-6]; o preço é uma variável a testar (€45–150), não um dado.

## 6. Concorrência (top 5)

| Concorrente | Preço de entrada / alvo | Ponto forte | Fraqueza explorável | Fonte |
|---|---|---|---|---|
| civils.ai (Singapura) | $90/mês (≈ €82) 10 folhas; $270/mês (≈ €246) 30 folhas; ≈ €8,2 por folha; moeda sem código, IVA não indicado | IA em PDF, verificação de discrepâncias, QA humana; alega 200+ empresas | Sem português nem BC3 indicados; dados nos EUA; tráfego ≈ 10 mil visitas/mês em queda; Portugal fora do top 5 | [M1] [M2] [M12] |
| Togal.AI (EUA) | $299 (≈ €272) /utilizador/mês, faturação anual | Takeoff automático ilimitado em PDF, foco em empreiteiros gerais | Só EUA/inglês; 1 avaliação de 1★ por preço (Trustpilot) | [C7] |
| Kreo (UK/Europa) | Pro (IA) €150 /utilizador/mês, só anual, sem IVA; Essential €90 sem IA | Preço em €, DWG/DXF e PDF, IA no Pro | Sem português nem BC3 indicados; queixas de limpeza manual e de dependência de ligação | [C8] |
| Bluebeam Revu / Max | $260–$440/ano; Max $590 (≈ €538) /ano | Padrão de marcação em PDF; Max com IA e MCP (Claude) | 15 idiomas sem português; medição manual no núcleo; queixas de fim da licença perpétua | [C9] [C29] |
| CYPE Arquimedes (incumbente local) | €475 licença (Starter), IVA e tipo não indicados | Mapa de quantidades e orçamento, BC3, DXF/DWG, bases de preços Portugal | Não lê PDF por IA; interface antiga; opiniões críticas só de 2008 (descontadas) | [M15] |

**Mediana / P25 / P75 do preço comparável** (7 ferramentas com IA, €/utilizador/mês, sem IVA onde conhecido: €45, 82, 150, 246, 272, 272, 318): **€246 / €116 / €272** (ESTIMATIVA; mistura de preços por utilizador e por empresa). **Degrau da escada de preços:** ≈ €45–80/mês, sem concorrente de IA **com pt-PT** (a prova é de ausência numa pesquisa US-only, confiança baixa).

**Atualização (resposta a D6/D7; classe C, páginas dos próprios fornecedores, acedidas em 2026-11-26).** Existem ferramentas ibéricas em castelhano com IA, leitura de PDF e BC3, com preços muito abaixo da escada acima: **BuildGets** (Espanha; plano gratuito com 5 conversões IA/mês, €9,95 e €29,95/mês sem IVA; lê DXF, PDF e IFC; alega > 2 000 profissionais registados; sem português nem Portugal no site) [E-6] [E-7], **Constrik** (departamentos de estudos de empreiteiros residenciais espanhóis; PDF, BC3 e IFC; ≈ €250 por estudo, sem IVA, anual fechado em demo) [E-8]. Consequências: (i) a afirmação «0 de 5 internacionais com BC3» vale para esses 5, não para o mercado ibérico; (ii) o degrau de €45–80 não está vazio para quem aceite uma interface em castelhano; (iii) a lacuna que resta é pt-PT e a estrutura de mapa nacional, o que mantém a lacuna competitiva em 3 (confiança baixa) mas torna a cópia mais barata do que se assumia. PREMETI (Atayo) e Presto foram vistos só por resultados de pesquisa, sem IA em PDF confirmada e sem preço verificado.

## 7. Público e canais

**Segmento primário:** orçamentistas e diretores técnicos de empreiteiros e gabinetes de obra civil/infraestruturas em PT (comprador ≠ utilizador em empresas maiores; o mesmo nas PME). **Onde estão:** sem comunidade verificável (Reddit, Facebook e LinkedIn inacessíveis ou inexistentes nos resultados); associações AICCOPN e AECOPS sem número de associados; plataformas de concursos (Vortal, AcinGov, Anogov) onde se obtém a lista de adjudicatárias via Portal BASE [A5].

| Canal (top 3) | Porquê | Teste de 30 dias | Métrica de sucesso |
|---|---|---|---|
| 1. Outbound manual personalizado | Único canal com lista de contas identificável (≈ 1 543); sem orçamento de anúncios (€0). O envio a pessoas reais é ação do fundador e exige base legal (Lei 41/2004) | 50 contactos a empresas que ganham contratos até €1,6 M, oferta «medimos uma folha do vosso próximo concurso em 48 h» | ≥ 4 respostas (8 %), ≥ 3 demos, ≥ 1 compromisso de piloto pago; fracasso: < 2 respostas |
| 2. Conteúdo pt-PT sobre erros e omissões e verificação de mapas + LinkedIn orgânico | Gancho legal e financeiro (art. 50.º do CCP) em vez de «medir mais depressa»; SERP pt-PT provavelmente fraca (não verificada) | 4 peças + 8 publicações + página com registo | ≥ 300 visitas, ≥ 15 registos, ≥ 3 respostas de empresas-alvo |
| 3. Marketplaces e fóruns de medidores independentes (Zaask, Workana, Fórum da Casa) | Validação de preço mais rápida, mas é mercado de edifícios | 15 contactos com beta gratuito em troca de feedback | ≥ 5 testes e ≥ 2 pedidos de preço |

## 8. Principais riscos

| ID | Risco | Pontuação | Mitigação | Sinal de alerta |
|---|---|---|---|---|
| R1 | **Mercado só-PT pequeno e cíclico** (SOM €5–32 k conforme o teste de outbound; concursos de infraestruturas H1 2026: +2,7 % em valor mas −31 % em número, após o máximo de 2025 e com o fim do PRR) | 4×4 = 16 | Validar pilotos pagos antes de construir; o mercado ibérico foi testado em secretária e não resolve (§2.1, D6) | < 3 pilotos pagos em 60 dias |
| R2 | **Precisão insuficiente**: visão pura ≈ 52,8 % das linhas dentro de ±25 % (peritos 87,9 %); arcos, tramas e escalas mistas | 4×5 = 20 | Vetor primeiro, IA só rotula e valida, rasto até à geometria; gate de lançamento com ≥ 20 folhas reais | < 70 % dentro de ±10 % em *evals* |
| R3 | **Distribuição dependente do fundador**, sem audiência nem tempo declarado; outbound sujeito à Lei 41/2004 | 4×4 = 16 | Lista e textos preparados por agentes, envio manual pelo fundador, só pessoas coletivas com oposição | < 2 respostas em 50 contactos |
| R4 | **Absorção ou cópia**: Bluebeam Max com Claude, civils.ai a localizar, LLMs gerais a melhorar | 3×4 = 12 | Foco em BC3/estrutura PT e verificação legal; acompanhar notas de lançamento | civils.ai com pt-PT ou BC3 |
| R5 | **Responsabilidade por erro silencioso e promessa «dados na UE»**: DL 446/85 art. 18.º limita exclusões; API direta da Anthropic só tem inferência «us»/«global» | 3×4 = 12 | Revisão humana obrigatória, claims sóbrios, formular «ficheiros na UE, sem treino, DPA»; Bedrock/Vertex UE se exigido | Questionário de segurança que exija inferência na UE |

## 9. Pressupostos do brief — estado

| ID | Pressuposto | Estado | Evidência |
|---|---|---|---|
| A1 | Empresas PT pagam por medição assistida por IA (~€60–250/mês) | **em aberto, inclinado para fraco**: comparáveis globais cobram, nenhum pagamento por IA observado em PT | [M2] [C7] [C8] [M15] |
| A2 | Precisão aceitável com revisão humana | **em aberto**: visão pura não chega; vetor + IA + revisão plausível só em PDF vetorial; sem teste em plantas PT | [R7] [R8] [R27] [C18] |
| A3 | Plantas em PDF e não só DWG | **em aberto**: sem dados PT sobre o formato | [M15] |
| A4 | Diferencial pt-PT valorizado | **em aberto, sinal favorável**: lacuna de idioma/BC3 verificada nas páginas dos fornecedores; nenhum utilizador PT ouvido | [C9] [C13] |
| A5 | Canal inicial barato (contacto direto, associações) | **parcialmente confirmado**: lista de contas existe; sem comunidades; restrições da Lei 41/2004 | [A5] [M4] [R17] |
| A6 | Custo de IA por folha ≤ ~€1–2 | **confirmado**: base €0,34, alto €1,82 por folha | [R3] [R1] |
| A7 | RGPD e confidencialidade resolvem-se com dados na UE | **parcialmente refutado**: «dados na UE» exige Bedrock/Vertex; sem treino é o padrão | [R4] |
| A8 | Fundador sem audiência; aquisição por outbound e conteúdo | **confirmado como restrição**; viabilidade em aberto | [A8] |

**Contradições entre faixas, resolvidas.** (a) Prazo da lista de erros e omissões: a faixa de mercado leu o texto de 2017 (art. 50.º, primeiro terço do prazo, art. 61.º revogado); as faixas de público e riscos usaram resumos secundários que citam o art. 61.º e «5/6». Prevalece o texto legal lido (classe A). **Confirmado nesta ronda** na versão consolidada do CCP (cópia do IMPIC, atualizada até ao DL 112/2025 de 23 de outubro): art. 50.º n.º 1 «No primeiro terço do prazo fixado para a apresentação das propostas… devem apresentar uma lista…»; art. 61.º «(Revogado.)»; as fontes secundárias com «5/6» são anteriores a 2017 [E-1]. A verificação final no Diário da República continua recomendada antes de qualquer claim no produto. (b) Universo de contas: 660–1 300 (público, 20–40 % em PRESSUPOSTO) contra 1 543 (INE por CAE e escalão): prevalece o INE [M5]. (c) Concursos H1 2026: −29 % em número na tabela e −24 % no texto do mesmo barómetro (4 147 → 2 929 = −29,4 %: a tabela está certa); o período homólogo está na coluna jun/25 da própria tabela [A5] [E-4].

**Lacunas (confiança baixa) e o teste mais barato para cada uma:** volumes de pesquisa pt-PT (landing page com registo, 30 dias) · formato PDF vs DWG das peças (descarregar 10 concursos reais) · precisão em plantas portuguesas (20 folhas medidas por um orçamentista independente) · vozes do segmento (8 entrevistas de 15 min) · quotas do SAM (as mesmas entrevistas) · SERP português real (verificação humana ou ferramenta autenticada).

## 11. Se for KILL — 3 ângulos alternativos

Os ângulos 1 e 3 foram **repontuados** na resposta a D5 (tabela do §2.1: 2,70 e 2,20; nenhum chega a 3,5); o ângulo 2 não, pelas razões do §2.1. Cada ângulo indica o critério que mais poderia subir e a maior incógnita.

1. **Verificador de erros e omissões para propostas de empreitadas públicas (nota 2,70; teto de secretária 3,20).** Mesmo público (empreiteiros e gabinetes PT), mesmo núcleo técnico (ler PDF e quantidades com IA), mas o trabalho passa de «medir de raiz» a «verificar o mapa de quantidades fornecido contra as peças desenhadas dentro do prazo legal», com preço por proposta. **Base legal confirmada** na versão consolidada do CCP [E-1]: o caderno de encargos inclui projeto de execução e mapa de quantidades (art. 43.º n.º 1 e 4); os interessados devem apresentar a lista de erros e omissões no **primeiro terço** do prazo (art. 50.º n.º 1; inclui «espécie ou quantidade de prestações», n.º 2 al. b); o dono de obra responde até ao fim do segundo terço e o que não aceitar expressamente considera-se rejeitado (n.º 5); e o empreiteiro suporta **metade** do valor dos trabalhos de suprimento de erros e omissões cuja deteção era exigível nessa fase e que não listou (art. 378.º n.º 3), com prazos adicionais de 60 e 30 dias (n.º 4 e 5). Eventos de uso: 2 929 concursos de empreitada em H1 2026 (4 147 em H1 2025), dos quais 1 395 (47,6 %) de infraestruturas; 75,6 % de todos os concursos têm preço base ≤ €800 k, isto é, compradores PME [A5] [E-4]. Dor sistémica: o Tribunal de Contas apurou alterações em perto de 50 % das obras e ≈ 57 % delas por deficiências de projeto (2016, classe A mas com mais de 24 meses) [E-3]. O mercado já paga ferramentas de concursos (ConcursosGov, alertas da ANO; preços não encontrados) e publica conteúdo sobre o art. 50.º [E-2]. **Falta:** nenhuma voz de empreiteiro, nenhum preço de verificação em PT, o cruzamento artigo↔desenho não foi testado (viabilidade pode descer a 2) e civils.ai e Bluebeam já fazem verificação de discrepâncias em geral. Incógnita principal: se o orçamentista já faz esta verificação à mão e pagaria por proposta, num mercado de concursos −31 % em número nas infraestruturas.
2. **Serviço híbrido de medições (IA + revisão humana) por projeto, para edifícios (não repontuado).** Interpretação 3 do brief: pequenos empreiteiros, arquitetos e donos de obra pagam hoje €350–€1 200+ por mapa de quantidades de moradia [A1] [A4]; o universo de edifícios tem 4 486 empresas com ≥ 10 pessoas (≈ 5× o núcleo) [M5]. Pode subir pagar e tempo até à receita: pré-venda em dias em Zaask, Workana e Fórum da Casa, sem construir o produto completo. Incógnita: margem com revisão humana, tempo do fundador, necessidade de um validador de domínio e um mercado sensível ao preço; toda a evidência vem de um único fórum. **Nota (D2):** os concursos públicos de edifícios caíram 77 % em valor e 48 % em número em H1 2026 [A5], mas este ângulo é sobretudo privado, pelo que o dado não se aplica diretamente.
3. **Assistente IA de PDF para BC3 para Portugal e Espanha (nota 2,20).** Mantém o trabalho e o público técnico, mas serve a Península Ibérica. **Testado em secretária na resposta a D6:** o mercado espanhol de concursos de engenharia civil foi de 18 615 M€ em 2025 (FIEC, classe B), ≈ 4,8× o valor estimado para infraestruturas em PT (≈ 3,9 mil M€; ESTIMATIVA, classificações não equivalentes) e ≈ 3,2× em emprego (1,47 M contra 460 mil pessoas), mas a própria FIEC prevê quebra da licitação em engenharia civil depois do RRF [E-5], e já há ferramentas locais em castelhano com IA, PDF e BC3 a €9,95–29,95/mês [E-6] [E-8]. O universo é maior, a lacuna e o preço são piores; não resolve a falta de evidência de pagamento.

**Tarefa do fundador a registar em `HUMAN_TASKS.md`** (🔴 Bloqueiam; a escrever pelo checkpoint, esta fase não edita o ficheiro):

```
- [ ] **HT-01 · Decidir o destino de Medições PT** — ⏱ 1 min · 💶 0 €
```
Responde com uma de quatro opções: `arquivar` (estado → `killed`); **`ângulo 1`** (recomendado pela fábrica: validar em 30 dias **sem construir**, com o teste de 50 contactos e 8 entrevistas do §7, que só tu podes enviar; a nota 2,70 de partida já está feita e a fábrica só repete a pesquisa se o teste passar); `ângulo 2` ou `ângulo 3` (a fábrica refaz a pesquisa nesse ângulo); ou `/continuar civil-pt --forcar` (segue com a ideia original, mantendo a pontuação 2,45 no registo). Sem resposta, o produto fica em `needs-founder` e nada avança (regra do KILL do `PIPELINE.md`).

## 12. Objeções do advogado do diabo e respostas

> Nota de método: esta secção resulta de uma auto-crítica com as lentes do passo 8 (pré-mortem, reação do concorrente, qualidade das fontes, custos ocultos, canais, legal/plataformas, tempo do fundador). As objeções do agente `devils-advocate` autónomo (D1–D8) e as respostas estão em «Objeções do advogado do diabo — revisão autónoma», no fim do documento; esta tabela é só a auto-crítica (D8: dez vezes «nenhum» não é adversarial).

| # | Objeção | Gravidade | Resposta | Tratamento | Efeito na nota |
|---|---|---|---|---|---|
| 1 | O KILL penaliza falta de evidência causada pelas ferramentas (pesquisa US-only, 403 em G2 e Reddit), não pelo mercado | grave | Em parte. A regra manda pontuar 2 e confiança baixa quando falta evidência, e é isso que o KILL é: provisório. **Correção (D4):** a versão anterior dizia que o argumento central vinha de INE e AICCOPN; só o universo (1 543) é medido, o SOM é estimativa com taxas em PRESSUPOSTO e a leitura do AICCOPN estava errada (D2). O teto com as confianças atuais é 3,25, nunca GO | aceite como limite do veredicto; refutada quanto ao sentido | nenhum |
| 2 | Pré-mortem: em 6–12 meses o civils.ai localiza para PT ou o Bluebeam Max acrescenta takeoff | grave | Tradução copiável em < 1 mês; Bluebeam Max já tem MCP com Claude [C29]. A cunha de BC3/estrutura nacional demora mais, mas não protege um mercado de ≈ 1 543 contas | aceite | lacuna competitiva mantida em 3 (teto por confiança baixa) |
| 3 | Qualidade das fontes: avaliações, preços de terceiros, e partes jurídicas vêm de resumos de pesquisa e blogs de concorrentes | grave | Verdade: avaliações 1–3★ (16 de 30), preços de Beam/PlanSwift/STACK e art. 61.º vêm de classe C. Nenhuma nota depende só delas: preços de decisão são páginas oficiais [M2] [C7] [C8] [C9] e o prazo legal foi reconciliado pelo texto lido [M8] | mitigada | nenhum |
| 4 | O ROI em PT é fraco porque a mão de obra é barata (≈ €13,6/h) | grave | Refutada em parte: a €99/mês o ponto de equilíbrio é ≈ 7,3 h/mês poupadas. O problema não é o ROI se a poupança for real, é a precisão (R2) e a ausência de pagamento por IA observado | refutada / mitigada | nenhum |
| 5 | Canal: outbound depende do fundador, a Lei 41/2004 limita o email a empresários em nome individual, LinkedIn proíbe automatização | grave | Confirmado; o teste de 30 dias usa envio manual a pessoas coletivas, mas não há tempo declarado pelo fundador (assumidas 3–5 h/semana, PRESSUPOSTO) | aceite | distribuição mantida em 2 |
| 6 | Custos ocultos: suporte B2B de alto contacto, seguro de responsabilidade, Vercel Pro + Supabase Pro ≈ $45–60/mês acima do teto de €50 | ligeira | Os custos fixos excedem ligeiramente o teto antes de receita; suporte ≈ 10–15 h/semana com 5–10 clientes (PRESSUPOSTO). Reforça R1 e R5 | aceite | nenhum (já refletido em viabilidade e tempo até à receita) |
| 7 | O produto do brief («medir») pode ser o trabalho errado: em obras públicas o mapa vem do dono da obra | grave | Verdade (art. 43.º e 50.º do CCP); é a base do ângulo 1. Não altera a pontuação da ideia original | aceite | nenhum |
| 8 | Aderência ao fundador devia ser 2: faltam competências de domínio e audiência | ligeira | A rubrica pontua só linhas citadas de `FOUNDER.md`; campos vazios = neutro. Com 2 o total seria 2,40 e o veredicto igual | refutada | nenhum |
| 9 | O mercado pode crescer: pressão de produtividade e adoção de IA nas empresas PT (7,9 % → 11,5 %) | ligeira | A adoção geral de IA não é adoção de medição por IA; pequenas empresas só 9,4 % [M13]. Sem evidência específica do segmento | refutada | nenhum |
| 10 | Um knockout K2 (atos reservados de engenharia) pode tornar o produto ilegal sem certificação | fatal (se confirmado) | Não pesquisado com fonte primária; a ferramenta não assina nem certifica e posiciona-se como assistente; o KILL já não depende dele. Se o fundador avançar, verificar a legislação das ordens profissionais antes de qualquer claim de «certificado» | mitigada | nenhum |

## 14. Fontes principais

Prefixos: M = `market.md`, A = `audience.md`, C = `competitors.md`, R = `risks.md` (o número é o ID do ledger da faixa). Todas acedidas em 2026-11-26.

| ID | Fonte | Acedido em | Classe |
|---|---|---|---|
| M1 | [civils.ai — página inicial](https://civils.ai/) | 2026-11-26 | A (autodeclarado) |
| M2 | [civils.ai — Pricing](https://civils.ai/pricing) | 2026-11-26 | A |
| M3 | [Google Suggest, execuções próprias pt-PT e en-US](https://suggestqueries.google.com/complete/search) | 2026-11-26 | B |
| M4 | [INE — Empresas de Construção 2024](https://www.ine.pt/ngt_server/attachfileu.jsp?look_parentBoui=765949417&att_display=n&att_download=y) | 2026-11-26 | A |
| M5 | [INE — API de indicadores 0006592 (empresas por CAE e escalão, 2024)](https://www.ine.pt/ine/json_indicador/pindica.jsp?op=2&varcd=0006592&Dim1=S7A2024&Dim2=PT&Dim3=42110,42210,42220,42990,42910,42130,42120&Dim4=11,21,22,31,41&lang=PT) | 2026-11-26 | A |
| M6 | [AICCOPN — Barómetro Obras Públicas n.º 135, abril 2025](https://www.aiccopn.pt/wp-content/uploads/2025/05/202504-BarometroAICCOPN-ObrasPublicas.pdf) | 2026-11-26 | A/B |
| M8 | [CCP, redação do DL 111-B/2017 (cópia UAC)](https://novoportal.uac.pt/sites/default/files/Legislacao%20Nacional/PT%20(2017.08.31)%20-%20CCP%20-%20C%C3%B3digo%20de%20Contrata%C3%A7%C3%A3o%20P%C3%BAblica%20-%20DL111-B.pdf) | 2026-11-26 | A (versão de 2017) |
| M12 | [Similarweb — civils.ai](https://www.similarweb.com/website/civils.ai/) | 2026-11-26 | C (estimativa) |
| M13 | [ECO — adoção de IA nas empresas portuguesas, 21 nov. 2025 (INE)](https://eco.sapo.pt/2025/11/21/so-115-das-empresas-portuguesas-usam-ia/) | 2026-11-26 | B |
| M14 | [Idealista / Cuatrecasas — Estratégia PortugalBIM (RCM 89/2026)](https://www.idealista.pt/news/node/75834) | 2026-11-26 | B |
| M15 | [CYPE Shop — Arquimedes STARTER](https://shop.cype.com/en/product/arquimedes-starter/) | 2026-11-26 | A |
| M19 | [BCE — taxa de referência EUR/USD](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html) | 2026-11-26 | A |
| A1 | [Fórum da Casa — «Mapa de quantidades» (fio de jul. 2026)](https://forumdacasa.com/discussion/105824/2/mapa-de-quantidades/) | 2026-11-26 | B |
| A4 | [Fórum da Casa — «Mapa quantidades» (set. 2020)](https://forumdacasa.com/discussion/73158/mapa-quantidades/) | 2026-11-26 | B |
| A5 | [AICCOPN — Barómetro Obras Públicas n.º 150, julho 2026](https://www.aiccopn.pt/wp-content/uploads/2026/07/202607-BarometroAICCOPN-ObrasPublicas.pdf) | 2026-11-26 | B |
| A8 | [FOUNDER.md do repositório](../../../FOUNDER.md) | 2026-11-26 | A (interna) |
| A16 | [DEC-FCT NOVA — anúncio «Técnico de orçamentação» (jan. 2026)](https://www.dec.fct.unl.pt/sites/www.dec.fct.unl.pt/files/imagens/noticias/2026/01/tecnico_de_orcamentacao.pdf) | 2026-11-26 | B (via resumo) |
| C7 | [Togal.AI — Pricing](https://togal.ai/pricing) | 2026-11-26 | A |
| C8 | [Kreo — Pricing](https://www.kreo.net/pricing) | 2026-11-26 | A |
| C9 | [Bluebeam — Pricing](https://www.bluebeam.com/de-de/pricing/) | 2026-11-26 | A |
| C13 | [Hackceleration — software de mediciones y presupuestos (2026)](https://hackceleration.com/es/labs/mejor/software-mediciones-presupuestos) | 2026-11-26 | C |
| C18 | [Structures Insider — AI Quantity Takeoff Accuracy on 50 Civil Drawings](https://www.structuresinsider.com/post/benchmarked-ai-quantity-takeoff-accuracy-on-50-civil-drawings-2026-data) | 2026-11-26 | C (independência não confirmada) |
| C29 | [Architosh — Bluebeam Max (maio 2026)](https://architosh.com/2026/05/ai-powered-bluebeam-max-launches-globally/) | 2026-11-26 | B |
| R1 | [Claude Platform Docs — PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support) | 2026-11-26 | A |
| R3 | [Claude Platform Docs — Pricing](https://platform.claude.com/docs/en/about-claude/pricing) | 2026-11-26 | A |
| R4 | [Claude Platform Docs — Data residency](https://platform.claude.com/docs/en/build-with-claude/data-residency) | 2026-11-26 | A |
| R7 | [Handoff-H1 / TakeoffBench, arXiv 2608.15032](https://arxiv.org/html/2608.15032) | 2026-11-26 | B (autor é fornecedor) |
| R8 | [DrawingVQA, arXiv 2607.15418](https://arxiv.org/html/2607.15418v1) | 2026-11-26 | B (só estruturas, 92 perguntas) |
| R16 | [Stripe — Restricted businesses](https://stripe.com/legal/restricted-businesses) | 2026-11-26 | A |
| R17 | [Lei n.º 41/2004 (DRE)](https://diariodarepublica.pt/dr/detalhe/lei/41-2004-480710) | 2026-11-26 | A |
| R19 | [Decreto-Lei n.º 446/85 (DRE)](https://diariodarepublica.pt/dr/detalhe/decreto-lei/446-1985-177869) | 2026-11-26 | A (texto não lido) |
| R27 | Prova técnica própria: spike de extração vetorial de PDF (PyMuPDF e pdfminer.six, PDF sintético), faixa de riscos | 2026-11-26 | A (sintético) |

## Objeções do advogado do diabo — revisão autónoma

> **Agente:** `devils-advocate` (autónomo, distinto da auto-crítica do §12) · **Data:** 2026-11-26 · **Alvo:** o veredicto KILL (2,60) e a sua justificação · **Método:** li este ficheiro, as quatro faixas, `FOUNDER.md`, `factory/LEARNINGS.md` e `factory/checklists/idea-scorecard.md`; recalculei as pontuações; verifiquei por conta própria o barómetro AICCOPN n.º 150 (PDF descarregado e extraído com `pdftotext`: tabelas por tipo de obra e série anual), o preço público do civils.ai, a documentação oficial de *data residency* da Anthropic e o relatório FIEC de Espanha. **Não verificado:** a API do INE devolveu HTTP 403 nesta sessão (os 1 543 contas ficam por reverificar); a pesquisa web é só dos EUA; não li o texto consolidado atual do CCP.

**Posição.** Não encontrei um erro que derrube o KILL sozinho: a ideia como especificada (só Portugal, medir de raiz, infraestruturas, outbound feito pelo fundador) continua sem prova de que alguém pague. Mas o documento apresenta como «três factos medidos» e «não frágil» um veredicto que (a) está a 0,20 do limiar PIVOT, (b) assenta em 6 critérios de confiança baixa, (c) usa o dado de mercado mais citado sem o decompor por segmento e (d) fecha sem pontuar a variante que a própria pesquisa descobriu ser o trabalho real. Um KILL errado não é gratuito: pára-se um produto cujo melhor ângulo nunca foi pontuado e pede-se ao fundador (HT-01) uma escolha às cegas.

### D1 · grave — O KILL é uma margem de 0,20 que depende de duas notas por defeito; «não frágil» só testa a descida

- **Porque importa:** o rótulo KILL comunica uma certeza que a evidência não dá, e é ele que gera HT-01 e pode levar a `arquivar`.
- **Evidência:** o §2 tem 6 de 9 critérios com confiança baixa (dor, procura, distribuição, lacuna, viabilidade, tempo). O teste pessimista só desce, e um KILL não pode «virar» para baixo, logo «não frágil» é verdade por construção. O próprio §2 dá a banda real: 1,85 (pessimista) a 3,50 (otimista com validação, igual ao limiar GO). Recalculei com os pesos do §2:

| Cenário (só o que muda face ao §2) | Nota | Veredicto |
|---|---|---|
| Base | 2,60 | KILL |
| Distribuição 2 → 3 | 2,75 | KILL |
| Tempo até à receita 2 → 3 | 2,70 | KILL |
| Distribuição 3 **e** tempo 3 | **2,85** | **PIVOT** |
| … e dor 3 → 2 (leitura estrita: 5 sinais PT contra ≥ 10 exigidos) | 2,70 | KILL |

- **Distribuição 3 é defensável:** a âncora 3 da rubrica é «1–2 canais plausíveis com evidência, mas pesados»; há uma lista de ≈ 1 543 contas nomeáveis (Portal BASE), associações e um canal 1 com teste definido (§7). A nota 2 assenta em «fundador sem audiência» (a condição normal da fábrica, `FOUNDER.md` está vazio) e em «SERP não inspecionável» (desconhecido pontuado como negativo). **Tempo 3 é defensável:** a âncora 3 é 1–3 meses; o §3 propõe piloto pago em 45 dias e a oferta «medimos uma folha em 48 h» é pré-venda (alavanca «pre-sell, paid pilot» da rubrica §5).
- **Leitura honesta:** a banda é ≈ 2,55–3,00, a cavalo do limiar de 2,80, e não «2,60, não frágil».
- **Alteração mais barata:** registar em `decision.rationale` «KILL provisório, não validado, banda 2,55–3,00»; acrescentar ao §2 o espelho otimista e a sensibilidade ±1 nos dois critérios mais próximos do limiar; qualificar «não frágil» como «não frágil para baixo».

> **Resposta a D1 — aceite em parte (rótulo, banda e dor); recusada em distribuição e tempo.**
> - **Aceite, e retirado:** «não frágil» só testava a descida; o rótulo passa a «KILL provisório, não validado» e o §2 passa a mostrar a sensibilidade para cima. A tabela do crítico (base 2,60) foi recalculada com a base nova.
> - **Aceite contra a nota original: dor 3 → 2.** O contraponto do próprio crítico procede. A âncora 3 exige ≥ 10 queixas **independentes** nos últimos 12 meses; a faixa de público conclui que todas as citações PT vêm de um único fórum (uma só fonte independente), são de edifícios e particulares, e nenhuma é do segmento. Pela regra 3 (sem evidência do segmento → 2, confiança baixa) a nota é 2. O preço pago por um mapa de moradia (€350–1 200+) é evidência de disposição para pagar, não de dor do empreiteiro de infraestruturas. Efeito: −0,15, base **2,45**.
> - **Recusado: distribuição 3 e tempo 3.** *Distribuição:* as «Counts» da âncora 3 são SERP inspecionada, regras de promoção em comunidades, listagens e fontes de referência; nenhuma existe. A lista de 1 543 contas prova alcance, não canal. A evidência nova vai em sentido contrário: o art. 50.º já é tema de conteúdo de um editor comercial português (ConcursosGov, 19 nov. 2026) [E-2], pelo que a SERP não é «fraca» por defeito. Concede-se que duas das razões da nota original eram inválidas («sem audiência» pesa em Aderência, e o 48,3 % de empresas individuais não se aplica à lista; ver D7), mas a nota fica em 2 por **falta de evidência** (regra 3), não por penalização. *Tempo até à receita:* a âncora conta analogias temporais e ciclos de venda observados e exclui otimismo; o piloto a 45 dias e a pré-venda de «medimos uma folha em 48 h» são **planos**. A alavanca «pré-venda» da rubrica §5 só dá +1 a uma **variante** (ângulo 1, §2.1), não à ideia como especificada. As faixas que propuseram 2–3 deixaram a escolha à síntese.
> - **Sensibilidade (§2):** com distribuição 3 e tempo 3 a nota é 2,70 (KILL); só com **três** critérios de confiança baixa a subir ao mesmo tempo (+ dor 3) chega a 2,85 (PIVOT); com os quatro, 3,00. Banda 1,70–3,00, central 2,45.
> - **Alteração mais barata:** feita. O `decision.rationale` deve dizer «KILL provisório, não validado, banda 1,70–3,00»; a leitura estrita da dor foi adotada.

### D2 · grave — A tendência «−39 %» é usada contra o segmento errado e sem decompor

- **Porque importa:** «mercado só-PT em contração» está no §1, no §2 (procura), no §5 e no R1 (16 pontos). Se a leitura estiver errada, a natureza do risco muda (ciclo pós-PRR e não contração estrutural).
- **Evidência (barómetro n.º 150, jul. 2026 [D-1], tabelas «por tipo de obra» e série anual):**
  - Os concursos promovidos caem de 5 972 para 3 662 M€ (−2 311 M€), e **81 % da queda (−1 881 M€) é «Construção de edifícios»** (−77 % em valor). As quatro categorias do segmento do produto (Estruturas e Vias, Engenharia Hidráulica, Outras Obras de Engenharia Civil, Preparação dos Locais) somam 2 389 M€ contra 2 326 M€: **+2,7 % em valor** (Estruturas e Vias +21 %, Hidráulica +19 %, Preparação +28 %; só «Outras Obras de Eng. Civil» desce, −33 %).
  - Em número, essas quatro categorias caem 31 % (1 395 contra 2 010), sobretudo Estruturas e Vias (−53 %). Isto é real e relevante para a frequência de uso, mas não é o «−39 %» que o documento cita.
  - **2025 foi o máximo da série:** 10 041 M€ em concursos (+21 %) e 7 568 M€ em contratos celebrados (+48 %). Com a sazonalidade de 2025 (1.º semestre = 59,5 % do ano), 2026 aponta para ≈ 6,2 mil M€ (ESTIMATIVA), ao nível de 2023 (6 048 M€) e acima de 2019–2022 (3,7–4,9 mil M€).
  - O §5 contrapõe o «−2,4 %» do INE (trabalho executado em 2024, indicador atrasado) a estes dados e não menciona 2025, embora a tabela que cita [A5] o contenha. A ressalva «período homólogo não confirmado» também está resolvida na mesma tabela (coluna jun/25).
  - O ângulo 2 (edifícios) é proposto como alternativa sem registar que os concursos públicos de edifícios caíram 77 % em valor e 48 % em número.
- **Contraponto:** o fim do PRR (agosto de 2026) pode prolongar a queda em número, e não há dados do 2.º semestre. O que se discute é o enquadramento, não a existência de um ciclo descendente.
- **Alteração mais barata:** reescrever a «Tendência» do §5 com a decomposição por tipo e o ano de 2025; amostra de ≈ 30 concursos de infraestruturas do 2.º semestre no Portal BASE.

> **Resposta a D2 — aceite integralmente (refutação do enquadramento, com os números reverificados).** Descarreguei o PDF do barómetro n.º 150 e extraí as tabelas com `pdftotext` [E-4]; os números do crítico confirmam-se: queda de 2 311 M€ (5 972 → 3 662), dos quais 1 881 M€ (81,4 %) em «Construção de edifícios» (2 434 → 553 M€, −77 %); quatro categorias de infraestruturas 2 326 → 2 389 M€ (+2,7 %) e 2 010 → 1 395 concursos (−30,6 %); 2025 com 10 041 M€ (+21 %) e contratos celebrados 7 568 M€ (+48 %); projeção 2026 ≈ 3 662 ÷ 0,595 ≈ 6,2 mil M€ (ESTIMATIVA). A tabela cita mesmo o ano de 2025 e a coluna homóloga jun/25: o documento anterior tinha-a à vista e não a usou.
> - **Corrigido:** §5 (tendência reescrita com a decomposição), §2 (procura: o «−39 %» e o «−2,4 %» saem das evidências desfavoráveis), R1 (descrição), §11 (ângulo 1 usa os eventos de H1 2026; ângulo 2 com a nota sobre edifícios) e §9 (o «período homólogo não confirmado» estava resolvido na tabela).
> - **Nuances que o crítico não referiu, e que ficam no §5:** (i) para este produto o que conta é a **frequência de uso**, e −31 % em número de concursos de infraestruturas é real mesmo com o valor estável (o valor médio sobe de ≈ €1,16 M para ≈ €1,71 M, e empresas maiores têm orçamentistas internos); (ii) o −39 % compara com um pico (H1 2025 já subira 9 % e 2025 foi o máximo); (iii) nos contratos celebrados H1 2026, Estruturas e Vias +55 % em valor mas −48 % em número, e Hidráulica −40 % em valor; (iv) sem dados do 2.º semestre e com o fim do PRR em agosto de 2026, a hipótese de um ciclo pós-PRR e não de uma contração estrutural é plausível mas não provada.
> - **Efeito na nota:** nenhum. A procura continua em 2 por falta de medição, não por tendência; R1 mantém 4×4 porque o que o sustenta é a pequena dimensão do universo, que é facto.

### D3 · grave — A procura foi medida com uma régua que não se aplica a um mercado de lista

- **Porque importa:** a «Evidência de procura = 2» pesa 0,30 e é um dos dois critérios que decidem a margem (D1).
- **Evidência:** o §1 conclui que «a procura é de lista e não de pesquisa» e a nota 2 cita «0 sugestões para 6 frases de solução». Num mercado de ≈ 1,5 mil compradores B2B o autocomplete não mostra volume, seja a procura nula ou suficiente para 14–55 clientes (o que o próprio SOM pede): o teste não distingue as duas hipóteses. A rubrica §3.2 só exige ≈ 150 visitas/mês (3 clientes/mês ÷ 2 %); o documento anota-o mas não tenta calcular as visitas capturáveis.
- **«civils.ai sem Portugal no top 5 e com tráfego em queda»** é usado como prova contra: é um *non sequitur*, porque a tese do brief é precisamente que ninguém localiza para PT. O Similarweb é classe C para um site pequeno. Os concorrentes financiados (Togal.AI $22,65 M, xBuild $19 M de Série A, Bild AI e Rudus na YC) aparecem na linha da nota 2 como se pesassem contra, quando «≥ 3 concorrentes vivos» é o ponto de partida da nota 3 da rubrica.
- **Contraponto:** a nota 2 é a aplicação literal de «sem evidência → 2». Mas há evidência parcial (≈ 60 sugestões do cluster do problema, concorrentes vivos) e a âncora de pesquisa não se aplica a uma lista.
- **Alteração mais barata:** marcar o critério como «âncora de pesquisa não aplicável» e fazer da prova de lista (8 entrevistas de 15 min, ou o canal 1 do §7) o teste decisivo.

> **Resposta a D3 — aceite na fundamentação, recusada quanto à nota.**
> - **Aceite:** (i) o autocomplete é o nulo esperado num mercado de lista e não distingue «procura nula» de «procura suficiente para 14–55 clientes»; voltei a correr 7 frases pt-PT sobre o trabalho de verificação (hl=pt-PT, gl=PT, 2026-11-26) e «lista de erros e omissões» e «erros e omissões empreitada» só devolveram a própria frase ou o plural; as restantes, nada [E-9]; (ii) «civils.ai sem Portugal no top 5 e com tráfego em queda» é um *non sequitur* (a tese é que ninguém localiza para PT) e o Similarweb é classe C: **retirado** da procura; (iii) os concorrentes vivos e financiados contam **a favor** da âncora 3 («≥ 3 concorrentes vivos»), não contra: a linha da nota foi reescrita; (iv) o critério passa a chamar-se «não medida», não «zero».
> - **Recusado — a nota fica em 2:** as âncoras de volume (≈ 1k–10k pesquisas/mês) ou de comunidade (5k–50k membros ativos) não se cumprem e a tendência é mista (valor +2,7 %, número −31 %). A verificação «price-aware» da rubrica aplicada à lista dá: necessárias 3 contas/mês ÷ 2 % = 150 visitas/mês; capturáveis ≈ 1 543 × 5–10 % = 77–154; razão 0,51–1,03, banda 3. Mas as duas taxas são PRESSUPOSTO (classe D), o «alcance» é o outbound do próprio fundador e a rubrica limita a 3 as notas de confiança baixa; é uma sensibilidade (+0,15), não uma nota.
> - **Aceite como método:** a prova de lista (50 contactos e 8 entrevistas de 15 min, §7) passa a ser o teste decisivo da procura e do ângulo 1; não se gastam mais pesquisas de secretária nisto.
> - **Evidência de procura nova, fraca:** o art. 50.º é conteúdo de um editor comercial PT e existem serviços pagos de alertas de concursos (ConcursosGov, ANO), o que mostra que empresas portuguesas compram ferramentas de concursos; preços não encontrados [E-2].

### D4 · grave — O «critério decisivo» (tamanho/SOM) não está no G1 e assenta em pressupostos que o §1 chama «factos medidos»

- **Evidência:** o §1 diz «três factos medidos, não em opinião». Só o universo (INE) é medido; o §5 rotula SAM e SOM como «ESTIMATIVA (todas as taxas em PRESSUPOSTO)».
- **Funil não calibrado com o teste do próprio documento:** o base dá 0,8 % de contacto→cliente (600 × 4 % × 20 %); o limiar de sucesso do teste do §7 é ≥ 1 compromisso de piloto em 50 contactos (2 %). Não são a mesma coisa, mas a diferença de 2,5× mostra que o base não foi ancorado no teste que o §7 propõe.
- **O «base» é o piso, não o centro:** €99/mês para todas as contas equivale ao Starter (≈ 10 folhas/mês, `market.md`); 409 das 699 empresas CAE 42 com ≥ 10 pessoas têm ≥ 20 pessoas e os 7 comparáveis cobram por utilizador ou por folha. O «alto» usa o Professional.
- **Critério fora da rubrica:** o G1 tem 9 critérios e nenhum é «tamanho de mercado» ou «rendimento». «Não sustenta rendimento a tempo inteiro» (§3, §5) é um veto implícito. Numa fábrica em que o custo marginal é computação de agentes mais ≤ €50/mês, ≈ €17 k/ano com ≈ 1 cliente a cobrir os custos fixos não é negativo por si. O recurso escasso é o tempo do fundador (outbound), que o documento admite não conhecer (PRESSUPOSTO de 3–5 h/semana). Esse devia ser o argumento: horas de fundador por euro.
- **§12 #1 está parcialmente errado:** diz que o argumento central «vem de INE e AICCOPN, não de lacunas». É verdade para o universo; para o SOM não (taxas em PRESSUPOSTO); e a leitura do AICCOPN falha em D2.
- **Alteração mais barata:** separar no §3 «KILL pelo score (2,60)» de «veto por tamanho», fundamentar o veto em horas de fundador por euro, e recalcular o SOM base com a taxa do teste do §7.

> **Resposta a D4 — aceite em grande parte.**
> - **«Três factos medidos»:** errado. Corrigido no §1 para «um facto medido (universo), duas estimativas e uma ausência de evidência». O §12 #1 também foi corrigido.
> - **Veto por tamanho:** retirado do §3. O G1 não tem critério de tamanho; o §3 separa agora «KILL pelo score» de «risco R1». Aceito que o argumento certo seria horas de fundador por euro, mas **não é quantificável**: no cenário em que o teste passa (≈ €26 k, ver abaixo) e com PRESSUPOSTOS de 100 h de outbound (600 contactos × 10 min) e 38 h de demos (25 × 1,5 h), o suporte decide: 1 h/mês/cliente (≈ 260 h/ano) dá ≈ €64/h; os 10–15 h/semana do §12 #6 (≈ 650 h/ano) dão ≈ €33/h. Dois PRESSUPOSTOS contraditórios por um fator 2,5, e o `FOUNDER.md` não declara tempo nem valor/hora: nenhum veredicto pode assentar nisto.
> - **Funil não calibrado:** aceite. O limiar do §7 (2 %) é um critério de decisão e não um valor esperado, por isso o SOM passa a ser condicional ao teste: ≈ €5 k se falhar, ≈ €26–32 k se passar (cálculo no §5). O base de €17 k fica entre os dois e a ordem de grandeza não muda.
> - **«€99 é o piso»:** recusado com evidência nova. Substitutos ibéricos custam €9,95 e €29,95/mês (BuildGets), €39/mês (Planhopper, Presupix) e ≈ €250 por estudo (Constrik) [E-6] [E-8]: €99 não é piso nem centro, é uma hipótese entre €45 e €150 a testar. O crítico tem razão em que 409 de 699 empresas CAE 42 com ≥ 10 pessoas têm ≥ 20 pessoas (preço por utilizador pode subir o ARPA), mas isso também não está medido.
> - **Efeito na nota:** nenhum (o score nunca incluiu tamanho). Efeito no texto: §1, §3, §5, §12 #1.

### D5 · grave — Pontuou-se a variante que a pesquisa descobriu estar mal especificada; a que mantém o JTBD do fundador ficou por pontuar

- **Evidência:** o §5 e o §12 #7 concluem que em obras públicas o mapa vem do dono de obra e o trabalho é verificar (CCP art. 43.º e 50.º). Só que o `00-brief.md` §5 já inclui no JTBD «detetar incoerências entre desenhos», a interpretação 2 é um verificador de discrepâncias e o §10 diz que as alternativas 2 e 3 «são candidatas a pivot na pesquisa».
- **Regra violada ou contornada:** PIPELINE G1 (PIVOT) manda escolher a variante mais forte que mantém a intenção do fundador e repontuá-la; a rubrica (regra 7) manda pontuar «a ideia como será construída (a cunha)». O documento trata o ângulo 1 como alternativa de um KILL «não repontuada» e responde ao #7 com «não altera a pontuação da ideia original».
- **Porque importa:** o resultado é um KILL do objeto errado, mais um HT-01 com três opções sem nota que obriga a uma nova pesquisa completa («a fábrica refaz a pesquisa nesse ângulo»). O §11 admite que o ângulo 1 «pode subir dor, pagar e receita».
- **Há dados para o fazer já:** 2 929 concursos no 1.º semestre de 2026, 1 395 (47,6 %) de categorias de infraestruturas, 76 % (2 214) com preço base ≤ 800 k€ (clientes PME) [D-1]; dever legal com prazo (art. 50.º, a confirmar no DRE).
- **Alteração mais barata:** repontuar os ângulos 1 e 3 na mesma fase, sem fontes novas, antes de HT-01, e dar ao fundador uma opção por defeito («ângulo 1, salvo indicação em contrário»), de acordo com «decidir, não perguntar».

> **Resposta a D5 — aceite; a repontuação foi feita (§2.1).**
> - **O processo estava errado:** a pesquisa descobriu que o trabalho em obras públicas é verificar, o brief §5 já tinha «detetar incoerências» no JTBD e o §10 declarava as alternativas 2 e 3 candidatas a pivot. Pontuar só a variante mal especificada e pedir uma escolha às cegas (HT-01) era contornar a regra do pivô. Agora: ângulo 1 = **2,70** (pessimista 1,90; teto de secretária 3,20), ângulo 3 = **2,20** (teto 3,10), com a tabela critério a critério no §2.1.
> - **Evidência nova específica do ângulo 1 (classe A, lida em texto):** versão consolidada do CCP (cópia do IMPIC, até ao DL 112/2025) [E-1]: art. 43.º n.º 1 e 4 (projeto de execução e mapa de quantidades fornecidos pelo dono de obra), art. 50.º n.º 1–5 (lista no primeiro terço; dono de obra decide até ao segundo terço; o não aceite considera-se rejeitado), art. 378.º n.º 3–5 (o empreiteiro suporta **metade** dos trabalhos de suprimento de erros e omissões detetáveis que não listou), art. 61.º revogado. Isto **resolve a contradição (a) do §9** e dá ao ângulo 1 uma dor com custo legal concreto. TdC, Relatório n.º 1/2016: alterações em perto de 50 % das obras e ≈ 57 % por deficiências de conceção do projeto [E-3] (classe A, mais de 24 meses: desconto de confiança). Não usei a cifra de «€204 M, 9,79 % em 2025» que apareceu num resumo de pesquisa: não consegui abrir a fonte.
> - **Porque o ângulo 1 não passa a PIVOT:** a regra do pivô (`idea-scorecard.md` §5) exige ≥ 3,5. Dor sobe a 3 (confiança média: classe A do mecanismo, mas sem voz do empreiteiro) e tempo a 3 (alavanca de pré-venda, +1 permitido); procura, distribuição, pagar e lacuna ficam sem evidência de classe A/B específica. Mesmo com dor 4, procura 3 e distribuição 3 só se chega a 3,15–3,20. O que levaria a ≥ 3,5 é validação (≥ 3 pilotos pagos, ≥ 10 vozes do segmento, teste de precisão), que é ação do fundador.
> - **HT-01 (§11):** reescrito com uma **opção recomendada** («ângulo 1, validar em 30 dias sem construir») e a nota de partida. Não o transformo em decisão automática: a regra do KILL do `PIPELINE.md` reserva a decisão ao fundador e o contacto com pessoas reais é ação reservada. Se o fundador responder `ângulo 1`, a pesquisa não se repete (≤ 25 % do esforço, rubrica §5): corre-se o teste de 30 dias e repontua-se.

### D6 · grave — O âmbito só-PT vem do brief, mas nunca se mediu a alternativa que o falsificador 3 pede

- **Evidência:** `FOUNDER.md` diz «Mercados prioritários: global (inglês) + Portugal»; o brief §11 diz «Mercado: Portugal» (decisão a respeitar). O TAM exclui tudo o resto e o falsificador 3 («mercado ≥ 5× maior», §3) não foi testado, embora seja trabalho de secretária.
- **Ordem de grandeza que verifiquei:** o relatório FIEC de Espanha [D-4] indica 18 615 M€ de concursos públicos de engenharia civil em 2025 e 1,47 M de trabalhadores na construção (PT: 460 416 pessoas ao serviço, INE, definições diferentes). Infraestruturas PT em 2025 ≈ 3,9 mil M€ (ESTIMATIVA: 39 % do 1.º semestre de 2025 aplicado a 10 041 M€; classificações não equivalentes). Razão ≈ 4–5× em concursos e ≈ 3× em emprego, perto do limiar de 5×. O BC3 é o formato espanhol (FIEBDC-3).
- **Contra:** o mesmo relatório prevê quebra da licitação em engenharia civil espanhola depois do RRF (o mesmo ciclo), e Espanha tem oferta em castelhano com BC3 (PREMETI, Presto, OneEstimate $49/$99). Não é almoço grátis, e o âmbito PT é decisão do fundador.
- **Alteração mais barata:** dimensionamento ibérico de uma página mais contagem de concorrentes ES com BC3 antes de HT-01, apresentado como opção e não como defeito.

> **Resposta a D6 — falsificador 3 testado em secretária: não cumprido (refutada a hipótese de que o âmbito ibérico resolva); âmbito PT mantido.**
> - **Âmbito:** «Mercado: Portugal» não é um acaso do brief; vem das palavras do fundador («adaptado ao mercado português»). O `FOUNDER.md` («global (inglês) + Portugal») é a preferência por defeito, e o mercado global em inglês também não está medido (o civils.ai tem 43 % do tráfego nos EUA e já compete aí). O ângulo ibérico é um pivô, não um teste da ideia original, e foi pontuado como tal (ângulo 3, 2,20).
> - **Números (FIEC, classe B) [E-5]:** concursos de engenharia civil em Espanha em 2025 = 18 615 M€; 1,47 M de trabalhadores na construção. Infraestruturas PT em 2025 ≈ 39 % de 10 041 M€ ≈ 3 911 M€ (39 % = peso das quatro categorias em H1 2025, 2 326 ÷ 5 972; ESTIMATIVA, classificações não equivalentes: a FIEC não detalha as categorias). **Razão ≈ 4,8× em valor de concursos e ≈ 3,2× em emprego** (1,47 M ÷ 460 mil pessoas ao serviço, INE, definições diferentes). Nominalmente 4,8× × SOM base €17,1 k ≈ €82 k, perto do limiar de 5× e de €80 k, mas só se a penetração e o preço fossem iguais.
> - **Porque não cumpre:** (i) a própria FIEC prevê quebra da licitação em engenharia civil em 2026 depois do RRF (o mesmo ciclo); (ii) há concorrência local em castelhano com IA, PDF e BC3 e plano gratuito (BuildGets: grátis, €9,95, €29,95/mês) e para departamentos de estudos (Constrik, ≈ €250/estudo) [E-6] [E-8]: o preço por cliente seria 3–10× inferior ao €99 do base e o mercado já tem oferta nativa; (iii) a vantagem pt-PT desaparece em Espanha; (iv) não há lista de contas espanholas medida nem evidência de dor em ES (pontuado 2 por regra 3). PREMETI (Atayo): licença permanente, preço e IA em PDF não verificados; OneEstimate ($49/$99 segundo o crítico): não verificado por mim.
> - **Efeito na nota:** nenhum na ideia original; ângulo 3 = 2,20 (§2.1). A decisão sobre o âmbito continua a ser do fundador.

### D7 · ligeira — Duas premissas de risco e distribuição estão sobrecarregadas

- **48,3 % de empresas individuais** (INE, todas as 114 439) está na linha da Distribuição como se valesse para a lista-alvo. A lista tem ≥ 10 pessoas, maioritariamente pessoas coletivas (a verificar), e o R3 já descreve o regime de oposição. O argumento não se aplica à lista.
- **Bluebeam Max com Claude (C29, R4 = 12):** a base de conhecimento do Bluebeam (resultado de pesquisa, página não aberta [D-5]) diz que o MCP do Revu cria marcações de contagem mas ainda não identifica objetos subjacentes, e que o Claude é uma subscrição à parte. A ameaça de absorção a curto prazo está provavelmente sobrestimada, o que favorece a lacuna competitiva (a nota 3 é defensável).
- **Alteração mais barata:** ler a KB «Revu + AI (via MCP)» e corrigir C29/R4; retirar o 48,3 % da justificação da distribuição.

> **Resposta a D7 — aceite; um ponto não verificável.**
> - **48,3 %:** retirado da justificação da distribuição (§2): a lista tem ≥ 10 pessoas e o regime de oposição do R17 já descreve o canal.
> - **Bluebeam MCP (C29/R4):** tentei abrir a base de conhecimento «Revu + AI (via MCP)» e a página não devolveu o corpo (só o título), por isso a afirmação do crítico («cria marcações de contagem mas ainda não identifica objetos; o Claude é uma subscrição à parte») **continua não verificada**. Mantém-se C29 (Architosh, classe B) e R4 = 12, com a ressalva de que a ameaça de absorção a curto prazo pode estar sobrestimada. A nota de lacuna fica em 3 (já limitada por confiança baixa), com ou sem esta correção: nenhum efeito na nota.
> - **Acrescento relacionado (§6):** a ameaça de cópia mais próxima não é o Bluebeam mas ferramentas ibéricas em castelhano com BC3 (BuildGets, Constrik), que não têm português nos sites.

### D8 · ligeira — A auto-crítica do §12 não é adversarial

- Dez objeções, dez vezes «Efeito na nota: nenhum», incluindo três «aceites» graves (#2, #5, #7), escritas pelo mesmo agente que pontuou. Estas objeções ficam no fim do ficheiro para não reescrever o §12; o §12 deve passar a remeter para aqui.

> **Resposta a D8 — aceite.** Dez objeções com «nenhum» não é uma crítica adversarial; nesta ronda as objeções do agente autónomo moveram uma nota (dor 3 → 2), o rótulo («não frágil» retirado), seis secções e o HT-01. O §12 remete agora para esta secção. Mantive a secção do crítico com as respostas por baixo de cada objeção (instrução desta ronda); a fusão numa única tabela fica para a síntese final, se o produto continuar.

### Contraponto honesto: o que torna o KILL mais sólido do que as minhas objeções

- **Dor 3 e Pagar 3 estão generosas** face à rubrica: 5 sinais portugueses contra ≥ 10 exigidos, 0 vozes de empreiteiros de infraestruturas, nenhum pagamento por IA observado em PT. Aplicadas à letra, anulam o ganho de D1.
- **Viabilidade técnica por provar:** R2 (visão pura ≈ 52,8 % das linhas dentro de ±25 %), spike em PDF sintético (R27: «erro 0» não é evidência de precisão em plantas reais) e cubicações de terraplenagem a partir de perfis transversais são bem mais difíceis do que área e contagem em edifícios.
- **Dependência do fundador** (outbound, sem audiência, tempo não declarado) e **−31 % em número** de concursos de infraestruturas são reais.
- **Confirmado por mim:** o preço do civils.ai ($90 e $270/mês; 20 e 60 folhas no 1.º mês, depois 10 e 30 por mês [D-2]) e a restrição de residência de dados (`inference_geo` só `us`/`global`; *workspace geo* só `us` [D-3]), pelo que A7 «parcialmente refutado» e o R5 mantêm-se. Nenhum knockout encontrado.

### Veredicto

**Sobrevive? Sim, com alterações.** O KILL da ideia como especificada é defensável como decisão operacional de «não construir já». Não é defensável como facto medido nem como juízo robusto sobre o mercado de infraestruturas. As três alterações principais:

1. **Reformular o veredicto** como KILL provisório e não validado (banda 2,55–3,00), retirar «três factos medidos» e «não frágil», e separar o score do veto por tamanho (D1, D4).
2. **Antes de HT-01, repontuar o ângulo 1** (verificador de erros e omissões, que mantém o JTBD do brief) e fazer o dimensionamento ibérico de uma página; propor ao fundador uma opção por defeito (D5, D6).
3. **Corrigir a leitura do AICCOPN** (decomposição por tipo, 2025 recorde, contratos +48 %) e reclassificar a procura como «medida com a régua errada», com a prova de lista (8 entrevistas ou piloto pago) como teste decisivo (D2, D3).

> **Resposta ao veredicto do crítico: as três alterações foram feitas, com um desvio.** (1) Veredicto reformulado para «KILL provisório, não validado»; «três factos medidos», «não frágil» e o veto por tamanho retirados; a banda passa a **1,70–3,00 (central 2,45)** em vez de 2,55–3,00, porque a dor desce a 2 (D1). (2) Ângulos 1 e 3 repontuados (2,70 e 2,20) e dimensionamento ibérico feito (§2.1, D6); a «opção por defeito» entra no HT-01 como **recomendação** (`ângulo 1`, validar sem construir) e não como decisão automática, porque a regra do KILL e as ações com pessoas reais são do fundador. (3) AICCOPN corrigido (§5) e procura reclassificada como «não medida», **sem alterar a nota** (D2, D3). Resultado líquido: a nota da ideia original **desceu** (2,60 → 2,45) e o melhor ângulo (2,70) continua longe de 3,5; as objeções não deram razão para subir a nota, só para baixar a certeza e melhorar o caminho para a validação.

### Fontes desta revisão

Acedidas em 2026-11-26.

| ID | Fonte | Classe |
|---|---|---|
| D-1 | [AICCOPN — Barómetro Obras Públicas n.º 150, julho 2026](https://www.aiccopn.pt/wp-content/uploads/2026/07/202607-BarometroAICCOPN-ObrasPublicas.pdf) (PDF extraído localmente; tabelas por tipo de obra, por escalão e série anual) | A/B |
| D-2 | [civils.ai — Pricing](https://civils.ai/pricing) | A |
| D-3 | [Claude Platform Docs — Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency) | A |
| D-4 | [FIEC — Statistical report, Spain (2026)](https://construnews.com/wp-content/uploads/2026/07/FIEC_statistical_report_spain.pdf) (concursos de engenharia civil 2025: 18 615 M€; emprego 1,47 M; previsão de quebra pós-RRF) | B |
| D-5 | [Bluebeam Community — Revu + AI (via MCP) Capabilities](https://community.bluebeam.com/kb/categories/156-revu-ai-via-mcp-capabilities), via resultado de pesquisa (página não aberta) | C |
| D-6 | Pesquisas web (EUA) sobre takeoff com IA em ES/PT: nenhum produto português de IA em PDF encontrado, o que não contradiz as faixas | C |

### Fontes da resposta às objeções

Prefixo E. Acedidas em 2026-11-26. Os PDF foram descarregados para o diretório de trabalho da sessão (não ficam no repositório).

| ID | Fonte | Classe | Suporta |
|---|---|---|---|
| E-1 | [Código dos Contratos Públicos, versão consolidada até ao DL 112/2025 (cópia do IMPIC)](https://www.impic.pt/impic/assets/misc/img/noticias/CCP_DL112-2025.pdf) — «não dispensa a consulta ao Diário da República»; lidos art. 43.º, 50.º, 61.º (revogado) e 378.º | A (cópia oficiosa da entidade reguladora) | «Primeiro terço», art. 378.º n.º 3–5, mapa de quantidades do dono de obra |
| E-2 | [ConcursosGov — Código dos Contratos Públicos: o que uma empresa precisa de saber](https://concursosgov.pt/artigos/codigo-contratos-publicos-empresas) (publicado 2026-11-19; serviço da Caixa Mágica Software; sem preços visíveis) · alertas de concursos da [ANO](https://anogov.com/home/wp-content/uploads/termos-e-condicoes-alertas-de-concursos-publicos.pdf) (via resultado de pesquisa, sem preços) | B/C | Editor comercial PT sobre o art. 50.º; serviços pagos de concursos existem |
| E-3 | [Tribunal de Contas — Relatório n.º 1/2016 «Evolução global dos trabalhos adicionais no âmbito dos contratos de empreitada»](https://www.tcontas.pt/pt-pt/ProdutosTC/Relatorios/RelatoriosAuditoria/Documents/2016/rel001-2016-1s.pdf) (observações 2 e 13) | A (mais de 24 meses) | ≈ 50 % das obras com adicionais; ≈ 57 % por deficiências de projeto |
| E-4 | [AICCOPN — Barómetro Obras Públicas n.º 150, julho 2026](https://www.aiccopn.pt/wp-content/uploads/2026/07/202607-BarometroAICCOPN-ObrasPublicas.pdf) (PDF de 2 páginas, extraído com `pdftotext -layout`; mesma fonte que A5 e D-1, reverificada) | A/B | Decomposição por tipo de obra, série 2019–2025 |
| E-5 | [FIEC — Statistical report, Spain (2026)](https://construnews.com/wp-content/uploads/2026/07/FIEC_statistical_report_spain.pdf) (mesma fonte que D-4, relida) | B | 18 615 M€ de concursos de engenharia civil em 2025; 1,47 M de trabalhadores; previsão de quebra pós-RRF |
| E-6 | [BuildGets — comparativa de software de presupuestos (2026)](https://www.buildgets.com/comparativa-software-presupuestos-obra.php) (comparação do próprio fornecedor; atualizada em 2026-11-03) | C | Preços €9,95/€29,95; Planhopper e Presupix a €39; leitura de DXF, PDF e IFC; BC3 |
| E-7 | [BuildGets — Sobre](https://www.buildgets.com/sobre-buildgets.php) | C | Projeto espanhol, «más de 2.000 profesionales registrados (octubre de 2026)», sem Portugal no site |
| E-8 | [Constrik](https://constrik.com/) | C | Plataforma para estudos de empreiteiros residenciais espanhóis, ≈ €250/estudo sem IVA, PDF/BC3/IFC; sem clientes nomeados |
| E-9 | [Google Suggest, execuções próprias hl=pt-PT gl=PT, 7 frases sobre verificação de erros e omissões](https://suggestqueries.google.com/complete/search) | B | Autocomplete sem poder discriminativo nesta lista |

**Não verificado, não usado:** cifra de «€204 M e 9,79 % em 2025» de contratos adicionais (resumo de pesquisa, fonte não aberta); KB do Bluebeam sobre o MCP do Revu (corpo da página não devolvido); OneEstimate; preços de PREMETI e Presto; API do INE (403 ao crítico; não reexecutada).
