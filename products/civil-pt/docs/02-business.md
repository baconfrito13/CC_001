# Modelo de negócio — Medições PT

> **Produto:** `civil-pt` · **Versão:** 0.2 · **Data:** 2026-11-27 · **Profundidade:** standard · **Moeda:** EUR · **Depende de:** `01-research.md`, `02-product.md`

> **Leitura obrigatória antes dos números.** O veredicto G1 é **KILL provisório, não validado (2,45)**; o fundador forçou a ideia e dispensou a validação de procura. Tudo o que segue assenta em PRESSUPOSTOS de funil, de preço e de uso que só os primeiros clientes (ou a sua ausência) podem confirmar. A estratégia responde com um modelo de **custo fixo mínimo (€42/mês, abaixo do teto de €50)**, **primeiro euro o mais cedo possível** (pagamento ativo desde o dia 1) e **gatilhos de matar ou pivotar com amostra mínima, intervalo e probabilidade de falso alarme** (`02-product.md` §8). **Mesmo no cenário otimista, o negócio é um rendimento complementar de nicho, limitado pelas horas do fundador, não um ordenado: ver §8 e §9.**

> **O que mudou da v0.1 para a v0.2** (ronda 1 do advogado do diabo; respostas em `02-product.md`, secção «Objeções do advogado do diabo»):
>
> | | v0.1 | v0.2 | Porquê |
> |---|---|---|---|
> | Oferta principal | Subscrição mensal com folhas incluídas | **Passe Concurso** (pagamento único, folhas válidas 90 dias); subscrição secundária com folhas acumuláveis 90 dias | Uso episódico por concurso (OB-4) |
> | Custo de IA por folha | €0,34 (3 passagens) | **€0 no MVP** (IA passa a Should) | OB-2 |
> | Receita por conta e mês | €90 (subscrição, 3 escalões, mix 30/55/15) | **€47,2** (60 % Passe, 40 % subscrição sem «Gabinete») | OB-4, OB-5 |
> | Churn mensal base | 5 % | **10 %**, com sensibilidade 8–25 % | OB-4 |
> | Capacidade | Sem teto; 11,7 clientes no mês 12 | **Teto de ≈ 5,8 contas ativas** a 5 h/semana | OB-6 |
> | Mês 12 do cenário base | MRR €1 052, resultado €805 | **Receita €306/mês, resultado €242/mês** (procura: 14,3 clientes novos em 12 meses; servidos pelo teto: 9,8) | OB-4 a OB-6 |
> | Custo fixo mensal | €47 | **€42** (sem as avaliações de IA) | OB-2 |
> | LTV : CAC · retorno do CAC | 2,7 : 1 · 7,3 meses | **1,0 : 1 · 11,0 meses** (CAC em tempo do fundador) | OB-4, OB-12 |

## 1. Resumo

| | |
|---|---|
| **Modelo primário** | **Passe Concurso**: pagamento único de 20, 60 ou 150 folhas, válidas 90 dias (uma folha = uma página de PDF processada). **Secundário:** subscrição mensal com as folhas de cada mês válidas 90 dias (acumuláveis). Não há receita-ponte à parte: o Passe é a oferta de entrada |
| **Preços-alvo** | **Passe 60: €129 + IVA** (€2,15 por folha) · **Empresa: €99/mês + IVA** (€79 para as primeiras 10 empresas) · tabela completa em §5 |
| **Meio de pagamento** | **Stripe direto** (Checkout + Billing + Tax) como vendedor, B2B apenas; alternativa de recurso: Paddle (Merchant of Record) |
| **Margem bruta · LTV:CAC · retorno do CAC** | 92,3 % no MVP sem IA (62,4–77 % se a IA de US-07 for ligada ao teto de €0,50 por folha) · **1,0 : 1 · 11,0 meses**, com o CAC valorizado ao tempo do fundador (24,0 h ≈ €479 por cliente); em dinheiro o CAC é ≈ €0. Contribuição de ≈ **€14,5 por hora do fundador** |
| **Ponto de equilíbrio** | **1 conta ativa** cobre os custos fixos (0,96) · resultado mensal ≥ 0 no mês 1 em valor esperado; a probabilidade de **nenhum** pagante nos primeiros 90 dias é de 13,6 % (base) |
| **Pico de caixa (dinheiro a adiantar)** · **custo mensal em 0 contas** | €77 (pessimista, mês 4), ≈ €0 (base e otimista) · pior caso sem nenhum cliente: €12 + €41 por mês, isto é, €94 a L + 60 e €135 a L + 90 · **€42,00** vs. teto `monthly_budget_per_product_eur` = **€50** |
| **Capacidade** | A 5 h/semana cabem **≈ 5,8 contas ativas** (aquisição, conteúdo e administração consomem 15,9 das 21,7 h mensais): receita ≈ €306/mês e resultado ≈ €242/mês no teto. €1 000/mês líquidos exigem ≈ 23,9 contas e ≈ 9,2 h/semana |
| **Pressuposto mais arriscado** | A1: que empresas portuguesas de obra paguem €129 por concurso (ou €49–199/mês) por medição vetorial assistida. Nenhum pagamento por IA de medição foi observado em Portugal. A premissa técnica (os grupos por estilo separam folhas reais) deixou de ser o mais arriscado porque se testa de graça antes da construção (gate G-GEO, `02-product.md` §5.2) |

## 2. Lean Canvas

| Problema | Solução | Proposta de valor única | Vantagem competitiva | Segmentos de clientes |
|---|---|---|---|---|
| 1) Medir à mão áreas e comprimentos em PDF demora horas e gera erros e omissões. 2) As ferramentas de IA para *takeoff* só existem em inglês e em dólares. 3) O trabalho segue os concursos, por isso uma subscrição mensal paga-se em meses sem uso. *Alternativas atuais:* Excel + PDF, Bluebeam, CYPE Arquimedes, medidor externo (€350–1 200+ por moradia) | 1) Motor vetorial que agrupa por estilo (US-04). 2) Revisão sobre a folha com rasto e pergunta de confiança (US-05). 3) Mapa em Excel (US-06). 4) Passe por concurso (US-12) | «Do PDF vetorial ao mapa de quantidades em Excel, em português e em euros, pagando só o concurso que está a orçar.» | **Fraca e honesta:** pt-PT, preço por concurso, ficheiros na UE e **nenhuma peça enviada a fornecedores de IA no MVP**, rapidez a ouvir clientes. A tradução copia-se em < 1 mês | Primário: orçamentistas e diretores técnicos de empreiteiras e subempreiteiras de pavimentos, arranjos exteriores e redes (universo CAE 42/43, ≥ 10 pessoas, ≈ 879) e gabinetes (CAE 71120, ≈ 664) |

| Métricas-chave | Canais | Estrutura de custos | Fontes de receita |
|---|---|---|---|
| North star: empresas pagantes com ≥ 1 mapa exportado em 30 dias; ativação (pergunta de confiança); compras por conta e ano; folhas devolvidas | 1) *Outbound* manual personalizado (≈ 1 543 contas nomeáveis). 2) Conteúdo pt-PT + LinkedIn (sem o ângulo do art. 50.º até US-09/US-10). 3) Associações (AICCOPN, AECOPS) | Fixos €42/mês (alojamento + BD €41, domínio €1); variáveis: taxas Stripe ≈ 3–4 %, reembolsos 3 %, ≈ €0,55 por conta e mês; **IA €0** | Passes €59 / €129 / €249 (pagamento único); subscrições €49 / €99 / €199 por mês (+ IVA) |

## 3. Modelo de receitas

Pontuação de 1 a 5 (5 = melhor), julgamento do estratega. Critérios de `factory/playbooks/02-strategy.md` Step 5.

| Candidato | Ajuste à métrica de valor | Tempo até 1.ª receita | Ajuste ao COGS | Carga de conformidade UE | Clareza do pagador | Total |
|---|---|---|---|---|---|---|
| Subscrição «ilimitada» | 2 | 4 | 3 | 4 | 5 | 18 |
| Créditos pré-pagos puros (por folha, sem validade) | 5 | 4 | 5 | 4 | 3 | 21 |
| Subscrição como oferta principal, com folhas incluídas (v0.1) | 3 | 4 | 5 | 4 | 5 | 21 |
| **Passe por concurso (lotes de folhas com validade) + subscrição secundária com folhas acumuláveis** | 5 | 5 | 5 | 4 | 5 | **24** |
| Pagamento único / vitalício | 1 | 5 | 2 | 4 | 4 | 16 |
| Freemium | 3 | 2 | 4 | 4 | 3 | 16 |
| Serviço por concurso (concierge) | 2 | 5 | 3 | 3 | 4 | 17 |

**Escolha:** a unidade de trabalho do cliente é o **concurso** (a pesquisa estima 100–200 folhas por obra, e o consumo vem em meses a 200 % da quota e meses a 0), não o mês. Por isso a oferta principal é o **Passe Concurso**: paga-se uma vez, sem compromisso, pelas folhas que o concurso pede, e as folhas valem 90 dias. A subscrição fica para quem tem fluxo contínuo e usa o mesmo livro-razão de lotes (cada mês cria um lote válido 90 dias, o que dá as «folhas acumuláveis por 3 meses»). A folha continua a ser a métrica de valor: cresce com o trabalho poupado, é previsível e mede-se com `sheet_processed`. *Nunca* se vende vitalício (regra da fábrica para produtos de IA; mantém-se porque a IA pode entrar por US-07). O serviço por concurso foi recusado: o fundador não declara competência de orçamentação e consome horas que não tem.

**Sem receita-ponte à parte.** O «Pack Concurso» da v0.1 era uma ponte; passou a ser a oferta principal (US-12, Must). O primeiro euro vem de um Passe com avaliação gratuita de **5 folhas**, 14 dias, sem cartão.

**Gatilho de upgrade (avaliação gratuita):** a 6.ª folha pede um Passe ou plano. Custo da avaliação por conta ≈ **€0,30** (5 folhas × €0,01 de infraestrutura + €0,25 de armazenamento e email; sem IA), abaixo do teto de €0,20 da receita `ai-app` **só** porque a IA saiu: se US-07 existir, a IA na avaliação limita-se a 1 folha (≤ €0,10).

## 4. Meio de pagamento

| | |
|---|---|
| **Escolha e razão** | **Stripe direto + Stripe Billing + Stripe Tax**, o fundador como vendedor registado. O produto vende só a empresas com NIF-IVA (declaração «atuo a título profissional» e recolha de NIF-IVA no checkout), o que cai no n.º 4 da árvore de decisão de `factory/playbooks/monetization.md` (B2B apenas → Stripe direto). Não se usa Merchant of Record porque não há vendas a consumidores, e o Stripe Managed Payments exclui checkout personalizado e domínio próprio |
| **Custos** | Cartões EEE padrão **1,5 % + €0,25**; premium EEE **2,8 % + €0,25**; internacionais 3,15 % + €0,25; Billing **0,7 %** (só subscrições); Tax **0,5 %** por transação (sem código); disputa **€20** — [Stripe PT](https://stripe.com/en-pt/pricing), acedido em 2026-11-27. As taxas incidem sobre o valor cobrado **com IVA** |
| **IVA / faturação (OB-11)** | **Duas configurações possíveis, ambas suportadas pelo modelo.** **F2, regime normal:** IVA português a clientes portugueses, autoliquidação a empresas da UE com NIF-IVA válido, o Stripe Tax calcula a taxa e não se fixa nenhuma taxa no produto; a página de preços mostra «+ IVA». **F1, isento (art. 53.º do CIVA):** o fundador não pode cobrar IVA, o preço é o final, o Stripe Tax não se usa (poupa-se 0,5 %) e a página de preços não diz «+ IVA». **Limite de €15 000 de volume de negócios, a confirmar:** a pesquisa de 2026-11-27 (resumos de fontes secundárias e newsletter n.º 39 da AT de janeiro de 2026, [Portal das Finanças](https://info.portaldasfinancas.gov.pt/pt/at/Divulgacao/publicacoes_internas/Newsletter_AT/Documents/Newsletter-39-janeiro-2026.pdf)) indica que o limite se mantém em 2026, que o regime foi alterado pelo DL 35/2025 e que se sai dele se o volume do ano corrente exceder o limite em mais de 25 %. A receita acumulada do cenário base no ano 1 (€2 767) está abaixo, por isso F1 é provável no ano 1. O texto «+ IVA» tem de ser **configurável** (a arquitetura trata disso). **A fatura portuguesa** pode ser emitida no Portal das Finanças (gratuito segundo fontes secundárias; uma delas aponta uma restrição após o DL 49/2025 que **não consegui confirmar**) ou em programa certificado (preço não verificado); a decisão é do contabilista (tarefa B). *Tem de confirmar com um contabilista certificado*; a fábrica não dá aconselhamento fiscal |
| **Pagamento ao fundador** | Em EUR, para o IBAN do fundador. Calendário e eventual período inicial mais longo para contas novas: ver o painel do Stripe (não verificado) |
| **KYC / ações do fundador** | Tarefa B (estatuto fiscal e faturação, **primeiro**) e tarefa A (conta Stripe) em §13 · Webhooks necessários: `checkout.session.completed` (Passes), `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed` (graça de 7 dias), `charge.refunded`, `charge.dispute.created` e `charge.dispute.closed` · Alternativa de recurso: **Paddle** (MoR) se a emissão manual de faturas custar mais de 1 h por mês ou o regime de IVA do fundador não permitir cobrar IVA. **O primeiro pagamento real só acontece depois da tarefa B** |

**Duas rotas comparadas** (cartão EEE; IVA a 23 % ilustrativo, o Stripe Tax calcula o real; câmbio €1 = $1,0975, BCE de 2026-11-26 [BCE](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html), lido em 2026-11-27):

| Oferta (líquido) | Cobrado com IVA a 23 % | Stripe: cartão padrão / premium / média 80:20 (€) | Paddle: 5 % + $0,50 sobre o líquido (€) | Líquido que fica (Stripe, média) |
|---|---|---|---|---|
| Passe 20 €59,00 (pagamento único, sem Billing) | €72,57 | 1,70 / 2,64 / **1,89** (3,2 %) | 3,41 | €57,11 |
| Passe 60 €129,00 (pagamento único, sem Billing) | €158,67 | 3,42 / 5,49 / **3,84** (3,0 %) | 6,91 | €125,16 |
| Passe 150 €249,00 (pagamento único, sem Billing) | €306,27 | 6,38 / 10,36 / **7,17** (2,9 %) | 12,91 | €241,83 |
| Independente €49,00 (subscrição) | €60,27 | 1,88 / 2,66 / **2,03** (4,2 %) | 2,91 | €46,97 |
| Empresa €99,00 (subscrição) | €121,77 | 3,54 / 5,12 / **3,85** (3,9 %) | 5,41 | €95,15 |
| Gabinete €199,00 (subscrição) | €244,77 | 6,86 / 10,04 / **7,50** (3,8 %) | 10,41 | €191,50 |

A página do Paddle não indica sobre que base incide os 5 % ([Paddle](https://www.paddle.com/pricing), 2026-11-27): calculou-se sobre o preço líquido. A diferença de taxas é de €0,9 a €5,7 por venda (de €0,88 numa subscrição Independente a €5,74 num Passe 150): a escolha de rota decide-se pela carga administrativa (IVA, faturas, contabilista) e não pela taxa, por isso o Paddle fica como recurso. Em F1 as taxas do Stripe descem (sem Tax e sem IVA na base: um Passe 60 paga ≈ €2,52 em vez de €3,84). A arquitetura transforma esta secção no ADR do meio de pagamento.

## 5. Preços

**Âncoras** (de `research/competitors.md`, acedidas pela pesquisa em 2026-11-26; EUR; sem IVA onde indicado; a conversão usa €1 = $1,0975)

| Concorrente / alternativa | Plano comparável | €/mês | Métrica de valor |
|---|---|---|---|
| civils.ai Starter | 10 folhas/mês | ≈ 82 ($90) | folhas medidas (≈ €8,2 por folha) |
| civils.ai Professional | 30 folhas/mês | ≈ 246 ($270) | folhas medidas |
| Togal.AI Growth | takeoff ilimitado | ≈ 272 ($299) | utilizador |
| Kreo Pro (IA) | 1–4 utilizadores, anual | 150 (sem IVA) | utilizador |
| STACK Premium | IA, 12 meses | ≈ 272 ($299) | utilizador |
| STACK Pro | — | ≈ 318 ($349) | utilizador |
| OneEstimate Pro | castelhano | ≈ 45 ($49) | utilizador |
| BuildGets (Espanha, vendor, castelhano, BC3) | €9,95 e €29,95 | 10–30 | conversões de IA |
| CYPE Arquimedes Starter | licença única, não lê PDF | ≈ 40 (€475 ÷ 12, ilustrativo); €475 uma vez | licença |
| Bluebeam Revu/Max | medição manual; Max com IA | ≈ 20–45 ($260–590/ano) | utilizador |
| **Status quo:** medição manual | orçamentista ≈ €13,6/h (ESTIMATIVA) | ver ROI abaixo | tempo |
| Status quo: serviço externo | €350–1 200+ por moradia (edifícios, fórum) | — | projeto |

**Mediana €246 · P25 €116 · P75 €272** das 7 ferramentas de IA com preço público (€45, 82, 150, 246, 272, 272, 318). Os alvos ficam abaixo do P25 (a subscrição «Empresa» a €99 e o Passe 60 a €129 por concurso), com desvio justificado: (a) as âncoras de €116–272 são preços por utilizador para um mercado de salários de $50/h, e o custo de um orçamentista em Portugal é ≈ €13,6/h; (b) **as âncoras que o comprador português conhece são mais baixas**: BuildGets €29,95/mês, CYPE Arquimedes €475 de licença única e Bluebeam ≈ €20/mês; **três Passes 60 por ano (€387) ficam ao nível de uma licença Arquimedes (€475) ou de um Bluebeam Max (≈ €538/ano)**, que não são comparáveis (não lêem PDF vetorial com rasto), mas são a referência de orçamento; (c) um entrante sem provas e sem marca não pode cobrar como o líder. **ROI:** o Passe 60 (€129) paga-se se o motor poupar **≥ 9,5 min por folha** a €13,6/h (≥ 6,0 min a €21,5/h, outra estimativa de custo horário em `research/audience.md`); a subscrição «Empresa» a 100 % da quota, 8,7 min por folha. O tempo manual por folha não está medido (PRESSUPOSTO, pergunta nas demonstrações).

**Métrica de valor: folhas processadas por lote.** Cresce com o valor, é previsível para o comprador e mede-se com `sheet_processed` (só a 1.ª vez que a folha é processada com sucesso; reprocessar é gratuito; uma folha devolvida por «não funcionou» volta ao lote).

| Oferta | Para quem | Preço sem IVA (€) | Folhas | € por folha | Validade | Inclui |
|---|---|---|---|---|---|---|
| Avaliação | Visitante que quer experimentar | 0 | 5 | — | 14 dias | US-01 a US-06; 1 conta por email |
| **Passe 20** (entrada) | Concurso pequeno ou independente | **59** | 20 | 2,95 | 90 dias | US-12 |
| **Passe 60** (**alvo**, ≈ 50 % dos Passes) | Concurso médio; orçamentista de empreiteira | **129** | 60 | 2,15 | 90 dias | US-12 |
| **Passe 150** (âncora) | Concurso grande ou vários em simultâneo | **249** | 150 | 1,66 | 90 dias | US-12 |
| **Independente** (entrada, mensal) | Subempreiteiro, medidor independente | **49**/mês | 15 por mês | 3,27 | cada mês, 90 dias | US-08 |
| **Empresa** (alvo, mensal; ≈ 65 % das subscrições) | Empreiteira com fluxo contínuo de concursos | **99**/mês (€79 para as primeiras 10 empresas) | 50 por mês | 1,98 | cada mês, 90 dias | US-08 |
| **Gabinete** (âncora, **fora do cenário base**) | Gabinete com vários concursos | **199**/mês | 120 por mês | 1,66 | cada mês, 90 dias | US-08; **sem** compromisso de resposta em ≤ 1 dia útil e sem funcionalidades reservadas |

*Cenário base sem «Gabinete» (OB-5):* mix de subscrições 35 % Independente / 65 % Empresa → ARPA de tabela **€81,5** (a v0.1 usava 30/55/15 → €99, sem evidência); com o preço de fundador de €79, **€68,5** no 1.º ano. Mix de Passes 30 % / 50 % / 20 % → preço médio **€132,0**. Os escalões diferem **só na quota** de folhas.

| Oferta | Folhas | Preço sem IVA (€) | € por folha | Vezes abaixo de ≈ €8,2 do civils.ai |
|---|---|---|---|---|
| Passe 20 | 20 | 59,00 | 2,95 | 2,8 |
| Passe 60 | 60 | 129,00 | 2,15 | 3,8 |
| Passe 150 | 150 | 249,00 | 1,66 | 4,9 |
| Independente | 15 | 49,00 | 3,27 | 2,5 |
| Empresa | 50 | 99,00 | 1,98 | 4,1 |
| Gabinete | 120 | 199,00 | 1,66 | 4,9 |

- **Preço por folha:** €1,66–3,27, entre **2,5 e 4,9 vezes** abaixo dos ≈ €8,2 do civils.ai (Starter: $90 por 10 folhas; classe C; acedido pela pesquisa em 2026-11-26). Corrige a frase «4 a 6 vezes» da v0.1 (OB-12). É uma alegação comparativa de publicidade: só com a fonte e a data à vista e depois de a fase legal a rever; o civils.ai conta como duas as folhas com mais de 150 medições, por isso a comparação é só de tabela.
- **Desconto anual: fora do MVP.** O padrão da fábrica é 10 × o mensal; com uso episódico a subscrição anual é a oferta menos provável e exigiria 12 lotes mensais por fatura anual. Revê-se quando 3 subscrições mensais tiverem renovado. Desvio registado em §14.
- **Teste/reembolso:** reembolso a pedido em 14 dias na 1.ª compra (cortesia comercial B2B; o direito de livre resolução de consumidores não se aplica a vendas a empresas): **proporcional às folhas por usar** (preço ÷ folhas × folhas por usar), **integral** se nenhuma folha foi usada ou se as usadas foram devolvidas por «não funcionou» (alínea pedida na OB-5). Explicitado na página de preços e no checkout. Sem teste com cartão: a avaliação de 5 folhas faz esse papel.
- **IVA:** ver §4 (F1 e F2). Em F2 os preços aparecem **sem IVA** com «+ IVA» e o checkout mostra o total calculado pelo Stripe Tax; a taxa de 23 % é só ilustração e não se escreve no código.
- **Oferta de lançamento (membros fundadores):** as primeiras **10 empresas** a subscrever «Empresa» pagam **€79/mês**, mantido enquanto a subscrição estiver ativa. Mostra-se só «Preço de lançamento: €79/mês para as primeiras 10 empresas», **sem preço riscado e sem contagem decrescente**: o preço de €99 nunca foi cobrado, logo não serve de referência de desconto (regra dos 30 dias, `monetization.md` Step 7). Os Passes não têm desconto. Cria-se um novo objeto de preço no Stripe quando a oferta acabar; nunca se edita um preço ativo.
- **Plano de teste de preços (direcional, não estatístico) (OB-5):** em ≈ 1 543 contas nomeáveis não há 300 visitantes por variante. Nas primeiras **20 demonstrações** apresentam-se **3 braços**, rodados pela ordem das demonstrações (≈ 7 cada): **descendente** (Passe 60 €89 · Empresa €69), **controlo** (€129 · €99) e **ascendente** (€159 · €129). Em todas se fazem **as duas perguntas de disposição a pagar**: «a que valor por concurso seria barato demais para confiar na ferramenta?» e «a que valor seria caro demais?» (`too_cheap_to_trust_eur`, `too_expensive_eur` em `demo_outcome`), mais as perguntas de uso (folhas do último concurso, concursos por ano, Passe ou subscrição). **A pergunta é de intenção; o checkout cobra sempre o preço de controlo**, para nunca haver dois preços ao mesmo tempo. Regra de decisão: **baixar** o preço-alvo só se a aceitação do braço descendente for ≥ a do controlo + 30 pontos **e** a mediana de «caro demais» for inferior ao preço de controlo; **subir** só se a aceitação do braço ascendente for ≥ a do controlo − 10 pontos **e** a mediana de «caro demais» for superior ao preço ascendente; caso contrário mantém-se o controlo. Depois, com ≥ 10 compras reais, só se sobe o preço se o pagamento a partir do início do checkout for ≥ 60 % e menos de 5 % dos reembolsos citarem preço (`monetization.md` Step 9).
- **Margem por oferta** (consumo a 100 % da quota; sem IA no MVP; com IA ligada a €0,34 e ao teto de €0,50 por folha), todas acima de 50 % mesmo no pior caso:

| Oferta | Preço (€) | Margem sem IA (MVP) | Com IA a €0,34 por folha | Com IA no teto de €0,50 por folha |
|---|---|---|---|---|
| Passe 20 (100 % da quota usada) | 59,00 | 92,2 % | 80,7 % | 75,2 % |
| Passe 60 (100 % da quota usada) | 129,00 | 93,0 % | 77,2 % | 69,7 % |
| Passe 150 (100 % da quota usada) | 249,00 | 93,2 % | 72,7 % | 63,1 % |
| Independente (100 % da quota usada) | 49,00 | 92,0 % | 81,6 % | 76,7 % |
| Empresa (100 % da quota usada) | 99,00 | 92,3 % | 75,2 % | 67,1 % |
| Gabinete (100 % da quota usada) | 199,00 | 92,5 % | 72,0 % | 62,4 % |

## 6. Economia unitária

Cálculo com *script* (constantes e reprodução em §14). Unidade: **conta ativa** (uma empresa com saldo de folhas ou subscrição). Mix de clientes novos: **60 % Passe, 40 % subscrição** (PRESSUPOSTO, testado pela pergunta «Passe ou subscrição?» das demonstrações).

| Variável | Valor | Etiqueta | Fonte / fórmula |
|---|---|---|---|
| Preço médio do Passe (€, sem IVA) | 132,00 | PRESSUPOSTO (mix) | 0,30 × 59 + 0,50 × 129 + 0,20 × 249 |
| ARPA da subscrição (€/mês, sem IVA) | 81,50 de tabela · **68,50 no 1.º ano** | PRESSUPOSTO (mix) | 0,35 × 49 + 0,65 × 99; com €79 de fundador: 0,35 × 49 + 0,65 × 79 |
| Compras de Passe por conta ativa | 1 na aquisição e, depois, 0,25 por mês ativo (3 por ano de atividade) | PRESSUPOSTO | Orçamenta ≥ 3 concursos com folhas reais por ano; pergunta «concursos por ano» |
| **Receita por conta e mês** | Passe 33,00 (3 × 132 ÷ 12) · subscrição 68,50 · **média 47,20** | PRESSUPOSTO | 0,60 × 33,00 + 0,40 × 68,50. **A v0.1 usava €90** |
| COGS: taxas Stripe | Passe 2,97 % · subscrição 4,01 % da receita | FACTO + PRESSUPOSTO (80 % cartões padrão, 20 % premium; IVA 23 % ilustrativo) | [Stripe PT](https://stripe.com/en-pt/pricing), 2026-11-27 |
| COGS: IA | **0** | FACTO (US-07 é Should) | Se US-07 existir: ≈ €0,054–0,34 por folha ([Anthropic](https://platform.claude.com/docs/en/about-claude/pricing), 2026-11-27) ≈ €1–6 por conta e mês com 17 folhas usadas |
| COGS: infraestrutura variável | 0,55 por conta e mês | PRESSUPOSTO | €0,01 por folha × 30 + €0,20 de armazenamento + €0,05 de email (conservador) |
| COGS: reembolsos e disputas | 3 % da receita | PRESSUPOSTO | Inclui a devolução de folhas «não funcionou» |
| **Contribuição por conta e mês** | **€43,55** (92,3 % da receita): Passe €30,48 · subscrição €63,15 | | Receita − taxas − reembolsos − infraestrutura |
| Conversão visita → registo · registo → pago | 1,85 % · 20 % (ponta a ponta 0,37 %) | PRESSUPOSTO | `research/market.md` (média ponderada dos 3 canais do SOM base). **Mistura contactos personalizados com tráfego de conteúdo ainda inexistente (OB-6): o que se mede é o funil de processo de `02-product.md` §8** |
| **CAC em dinheiro** | ≈ €0 | FACTO (`paid_ads_budget_eur` = 0) | Canais sem custo e ferramentas gratuitas |
| **CAC em tempo do fundador** | **24,0 h ≈ €479** por cliente | PRESSUPOSTO | (600 contactos × 9 min + 25 demonstrações × **1 h**) ÷ 4,8 clientes = 115 h ÷ 4,8; a demonstração é **15 min de chamada + 45 min de preparação e seguimento** (a v0.1 usava 1,5 h; OB-12). €20/h é só uma convenção de leitura |
| Churn mensal | **10 %** (sensibilidade 8–25 %, §10) | PRESSUPOSTO | Uso episódico: a v0.1 usava 5 %, o extremo alto da gama B2B PME |
| **LTV** (contribuição ao longo da vida) | **€491** (vida média 10 meses; receita €531: Passe €429, subscrição €685) | | Contribuição por conta e mês, com a 1.ª compra de Passe à entrada |
| **LTV : CAC** | **1,0 : 1** (CAC em tempo); sem significado com CAC em dinheiro ≈ €0 | | Meta ≥ 3 |
| **Retorno do CAC (meses)** | **11,0** | | 479 ÷ 43,55; meta ≤ 6 |
| **Horas do fundador por conta, ao longo da vida** | 34,0 h (24,0 de aquisição + 1 h de apoio por mês ativo) | PRESSUPOSTO | Apoio: 1 h por conta e mês (a pesquisa implica até 2,5 h) |
| **Contribuição por hora do fundador** | **≈ €14,5** | | 491 ÷ 34,0. É a medida honesta de se o produto vale o tempo: está ao nível do custo horário de um orçamentista (≈ €13,6) |
| Margem de contribuição | 92,3 % | | Meta ≥ 70 % geral, ≥ 50 % em produtos de IA: **cumpre**, graças a não haver IA no MVP |

**Limiares falhados, registados como risco explícito:** LTV:CAC de 1,0 (meta 3) e retorno de 11,0 meses (meta 6) **quando o tempo do fundador é valorizado a €20/h**; em dinheiro, o CAC é ≈ €0. A v0.1 falhava por pouco (2,7 e 7,3) e a v0.2 falha por muito: a receita por conta caiu para metade porque o uso é episódico. **Não se corrige com um preço mais alto sem prova** (o mercado ibérico está a €10–30/mês); corrige-se por três vias, por ordem de efeito: (1) menos horas por cliente (demonstração só depois de uma pré-qualificação de 5 min, projeto de exemplo US-11, mensagens de erro exatas); (2) o resultado do teste de preços de §5; (3) mais compras repetidas por conta (a sensibilidade de §10 mostra que 6 Passes por ano sobem a receita por conta e mês de €47,2 para €67,0). Revê-se com dados reais em `10-growth.md`.

**Horas do fundador a 5 h/semana (21,7 h/mês), repartidas** (`FOUNDER.md` não indica o tempo; é o valor por defeito do playbook):

| Atividade | Horas/mês | Como se calcula |
|---|---|---|
| Aquisição (*outbound* + demonstrações) | 9,6 | (600 × 9 min + 25 × 1 h) ÷ 12 |
| Conteúdo (4 artigos e 8 *posts* por ano) | 3,3 | (4 × 8 h + 8 × 1 h) ÷ 12 |
| Administração (correções, faturação, contabilista) | 3,0 | PRESSUPOSTO |
| **Sobra para apoio** | **5,8** | 21,7 − 9,6 − 3,3 − 3,0 → **≈ 5,75 contas ativas** a 1 h cada (2,3 contas a 2,5 h) |

## 7. Modelo de custos

Por número de **contas ativas** (a avaliação custa ≈ €0,30 por conta e não está na tabela). O universo endereçável é de ≈ 5 602 contas (1 543 + 4 059 microempresas): a coluna de 10 000 contas é teórica, só para dimensionar a arquitetura, e **o fundador só serve ≈ 6 contas a 5 h/semana**. Antes do lançamento nada é recorrente: desenvolvimento nos planos gratuitos e pré-visualizações; o gate G-GEO e a construção custam horas de agente, 0 €.

| Custo | 0 | 10 | 100 | 1 000 | 10 000 |
|---|---|---|---|---|---|
| Alojamento e base de dados (fixo + computação a escala) | 41,00 | 41,00 | 41,00 | 71,00 | 341,00 |
| Email transacional | 0,00 | 0,00 | 0,00 | 18,20 | 72,80 |
| Monitorização e analítica | 0,00 | 0,00 | 0,00 | 24,00 | 72,00 |
| Taxas de pagamento (Stripe) | 0,00 | 16,85 | 168,55 | 1 685,48 | 16 854,80 |
| Reembolsos e disputas (3 %) | 0,00 | 14,16 | 141,60 | 1 416,00 | 14 160,00 |
| Infraestrutura variável (€0,55 por conta e mês) | 0,00 | 5,50 | 55,00 | 550,00 | 5 500,00 |
| Domínio (≈ €12/ano) | 1,00 | 1,00 | 1,00 | 1,00 | 1,00 |
| IA (US-07, só se for construída) | 0 | 0 | 0 | 0 | 0 |
| **Total mensal** | **42,00** | **78,51** | **407,15** | **3 765,68** | **37 001,60** |
| Receita em regime estacionário (€47,2 por conta e mês) | 0,00 | 472,00 | 4 720,00 | 47 200,00 | 472 000,00 |

*Fontes dos limites:* alojamento = Vercel Pro $20 + Supabase Pro $25 = $45 ≈ €41,00 (Supabase Free pausa após 1 semana sem uso, por isso a produção exige Pro) — [Supabase](https://supabase.com/pricing), [Vercel](https://vercel.com/pricing), 2026-11-27; computação a escala €30 / €300 (ESTIMATIVA). Email: Resend, gratuito até 3 000 emails/mês, Pro $20 (`factory/stacks/web-saas.md`, 2026-10-08, não reverificado). Monitorização: Sentry (5 000 erros/mês grátis) e PostHog UE (1 M de eventos grátis); Sentry Team $26 a escala (mesma fonte). Taxas: [Stripe PT](https://stripe.com/en-pt/pricing), 2026-11-27. Domínio ≈ €12/ano (PRESSUPOSTO). O custo mensal em 0 contas é **€42,00 ≤ €50** (84 % do teto; folga de €8).

**Custos fora do teto (OB-6).** Quatro custos de estrutura não estão no modelo e **nenhum preço foi verificado**; cada um depende da decisão do contabilista (tarefa B) e qualquer recorrente acima de €8/mês ultrapassa o teto de €50 do `FOUNDER.md` antes de haver receita:

| Custo | Estimativa | Estado |
|---|---|---|
| Faturação | €0 se se emitir no Portal das Finanças (a confirmar, §4); programa certificado: não verificado | Tarefa B, pergunta 2 |
| Contabilista certificado | Não verificado | Tarefa B, pergunta 4 |
| Seguro de responsabilidade civil profissional | Não verificado; a fase legal avalia | Tarefa B, pergunta 4 |
| Caixa de correio com domínio próprio | Não verificado | Tarefa B, pergunta 5 |

**Horas do fundador (fora do custo):** ver §6. **Cada euro a adiantar pelo fundador é tarefa (§13), nunca um pressuposto.**

## 8. Projeção a 12 meses (3 cenários)

Gerada pelo *script* de §14 (derivado do playbook, com restrição de horas e dois fluxos de receita). **Os números são valores esperados, não clientes inteiros:** «0,6 contas no mês 1» significa que a média ponderada de muitos meses 1 possíveis é 0,6; num único mês 1 há 0 ou 1 cliente. Mês 1 = primeiro mês depois do lançamento. Resultado = receita − taxas − reembolsos − infraestrutura variável − custos fixos (sem tempo do fundador).

| Pressuposto | Pessimista | Base | Otimista | Etiqueta |
|---|---|---|---|---|
| Visitantes no mês 1 · crescimento mensal | 64 · 12 % | 160 · 12 % | 320 · 12 % | PRESSUPOSTO (de `audience.md` e `market.md`; soma anual base = 3 861 visitantes) |
| Visita → registo · registo → pago (ponta a ponta) | 1,85 % · 12 % (0,22 %) | 1,85 % · 20 % (0,37 %) | 1,85 % · 26 % (0,48 %) | PRESSUPOSTO |
| Quota do Passe nos clientes novos · compras de Passe por conta e ano | 60 % · 3 | 60 % · 3 | 60 % · 3 | PRESSUPOSTO |
| Receita por conta e mês · churn mensal | €47,2 · 15 % | €47,2 · **10 %** | €47,2 · 8 % | PRESSUPOSTO |
| Custos fixos · *setup* | €41/mês · €12 (domínio) | idem | idem | ESTIMATIVA |
| **Teto de contas ativas pelas horas do fundador** | 5,75 | 5,75 | 5,75 | 5 h/semana, 1 h de apoio por conta (§6) |

| Mês | Pess.: contas | Receita € | Resultado € | Base: contas | Receita € | Resultado € | Otim.: contas | Receita € | Resultado € |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0,1 | 15 | -27 | 0,6 | 63 | 18 | 1,5 | 164 | 112 |
| 2 | 0,3 | 23 | -20 | 1,2 | 96 | 48 | 3,1 | 251 | 192 |
| 3 | 0,4 | 30 | -13 | 1,8 | 130 | 80 | 4,8 | 342 | 277 |
| 4 | 0,6 | 38 | -6 | 2,5 | 166 | 113 | 5,8 | 350 | 283 |
| 5 | 0,7 | 46 | 2 | 3,2 | 204 | 148 | 5,8 | 299 | 235 |
| 6 | 0,8 | 55 | 10 | 3,9 | 245 | 186 | 5,8 | 299 | 235 |
| 7 | 1,0 | 64 | 18 | 4,7 | 289 | 227 | 5,8 | 299 | 235 |
| 8 | 1,2 | 73 | 27 | 5,5 | 338 | 272 | 5,8 | 299 | 235 |
| 9 | 1,3 | 84 | 37 | 5,8 | 319 | 254 | 5,8 | 299 | 235 |
| 10 | 1,5 | 96 | 48 | 5,8 | 306 | 242 | 5,8 | 299 | 235 |
| 11 | 1,7 | 108 | 60 | 5,8 | 306 | 242 | 5,8 | 299 | 235 |
| 12 | 2,0 | 123 | 73 | 5,8 | 306 | 242 | 5,8 | 299 | 235 |
| **Caixa acumulada (mês 12)** | | | **196** | | | **2 059** | | | **2 732** |

Receita acumulada em 12 meses (com teto): pessimista €754 · base €2 767 · otimista €3 496. **O teto de horas, não a procura, decide o mês 12 do cenário base:** a procura sem teto daria 14,3 clientes novos e €581 de receita no mês 12; o teto serve 9,8 e €306. Na tabela seguinte vê-se o que o teto custa (receita que fica por servir) e quantas horas fariam falta.

| | Pessimista | Base | Otimista |
|---|---|---|---|
| Contas ativas no mês 12, **com** teto de horas | 2,0 | 5,8 | 5,8 |
| Contas ativas no mês 12, sem teto (procura) | 2,0 | 9,7 | 27,2 |
| Receita do mês 12 com teto · sem teto (€) | 123 · 123 | 306 · 581 | 299 · 1 600 |
| Receita acumulada em 12 meses com teto · sem teto (€) | 754 · 754 | 2 767 · 3 461 | 3 496 · 9 383 |
| Caixa acumulada no mês 12 com teto · sem teto (€) | 196 · 196 | 2 059 · 2 705 | 2 732 · 8 192 |
| Clientes novos em 12 meses aceites · procura | 3,4 · 3,4 | 9,8 · 14,3 | 10,2 · 37,1 |
| Mês em que o teto passa a limitar | — | 9 | 4 |
| Horas por mês necessárias no mês 12 sem teto (apoio + aquisição + conteúdo + administração) | 17,9 | 25,6 | 43,1 |

**Verificação do limite do SOM (OB-6, reescrita).** A receita acumulada do cenário base (€2 767 com teto; €3 461 sem teto) fica abaixo do SOM base de €17,1 k (`01-research.md` §5), e o MRR equivalente do mês 12 (€306) é muito inferior ao limiar de €5 k que exigiria provas. **Mas isto não valida o modelo:** o SOM e este funil saem do mesmo plano de canais de classe D, e a coincidência dos 14,3 clientes novos sem teto com os 14,4 do SOM é consequência de usarem os mesmos pressupostos, não verificação independente. A diferença de euros (€17,1 k do SOM contra ≈ €3,5 k aqui) vem do preço por cliente: o SOM usava €1 188 por cliente e ano; este modelo prevê ≈ €566 por conta ativa e ano (47,2 × 12) e serve menos contas.

## 9. Ponto de equilíbrio e caixa

| | Pessimista | Base | Otimista |
|---|---|---|---|
| Custos fixos mensais ÷ contribuição por conta (42 ÷ 43,55) = contas necessárias | 0,96 → **1 conta** | 0,96 → **1 conta** | 0,96 → **1 conta** |
| Mês em que o resultado mensal ≥ 0 (valor esperado) | 5 | **1** | 1 |
| Mês de recuperação do investimento (caixa acumulada ≥ 0) | 9 | **1** | 1 |
| **Pico de caixa negativo (máx. «queima») em valor esperado** | **€77** (mês 4) | ≈ €0 | ≈ €0 |
| **Probabilidade de nenhum pagante nos 3 primeiros meses** · **nos 6** | 61,9 % · 31,6 % | 13,6 % · 0,8 % | 0,6 % · 0,1 % |
| Contas ativas para €500/mês líquidos (contribuição − fixos) · horas/semana | 12,4 · 6,5 h | 12,4 · 6,5 h | 12,4 · 6,5 h |
| Contas ativas para €1 000/mês líquidos · horas/semana | 23,9 · 9,2 h | 23,9 · 9,2 h | 23,9 · 9,2 h |
| Resultado mensal máximo a 5 h/semana (teto de 5,75 contas) | — | **€242** | €235 |

**Perda máxima sem nenhum cliente** (o caso em que a base não se confirma) e o gatilho que a limita (`02-product.md` §8): domínio €12 + fixos €41/mês = **€94 a L + 60, €135 a L + 90, €258 a L + 180, €504 em 12 meses**. O fundador aprova a despesa de produção só no go-live (tarefa D).

**Leitura honesta:** a infraestrutura paga-se com **uma** conta, por isso o risco financeiro é pequeno (≤ €135 até ao gatilho de L + 90 se não houver nenhum cliente). Mas o negócio, a 5 h/semana, é um **rendimento complementar de ≈ €242/mês** com ≈ 6 contas; €500/mês líquidos exigem ≈ 12,4 contas e ≈ 6,5 h/semana, e €1 000/mês, ≈ 23,9 contas e ≈ 9,2 h/semana. A decisão de insistir ou parar é sobre tempo do fundador e probabilidade de haver procura, não sobre caixa.

**Comparação com `FOUNDER.md`:** custo mensal a 0 contas **€42,00 ≤ €50** · anúncios €0 = `paid_ads_budget_eur` (nenhum CAC pago em nenhum cenário) · cada euro a adiantar pelo fundador tem tarefa (§13: B, A, D, e C só se US-07 for construída).

## 10. Sensibilidades e pressupostos a substituir por dados reais

**Churn de 8 % a 25 % (OB-4).** A sensibilidade da v0.1 só ia de 3,5 % a 6,5 %. Contribuição por conta (LTV) e LTV:CAC com o CAC valorizado a €479 por cliente:

| Churn mensal | Vida média (meses) | Receita por conta (€) | LTV: contribuição por conta (€) | LTV : CAC (CAC em tempo, €479) | Contas no mês 12 sem teto · com teto | Receita do mês 12 sem teto · com teto (€) | Caixa no mês 12 com teto (€) |
|---|---|---|---|---|---|---|---|
| 8 % (otimista) | 12,5 | 649 | 600 | 1,3 : 1 | 10,4 · 5,8 | 615 · 299 | 2 055 |
| 10 % (base) | 10,0 | 531 | 491 | 1,0 : 1 | 9,7 · 5,8 | 581 · 306 | 2 059 |
| 15 % (pessimista) | 6,7 | 374 | 346 | 0,7 : 1 | 8,2 · 5,8 | 511 · 323 | 2 053 |
| 20 % | 5,0 | 295 | 274 | 0,6 : 1 | 7,1 · 5,8 | 457 · 340 | 2 010 |
| 25 % | 4,0 | 248 | 230 | 0,5 : 1 | 6,2 · 5,8 | 414 · 368 | 1 932 |

*Leitura:* **nenhum churn da gama dá LTV:CAC ≥ 3 quando o tempo do fundador vale €20/h**; a v0.1 com churn de 15 % já dava 0,9. Com teto de horas, o churn mexe pouco na receita do mês 12 (as contas que saem libertam horas e entram outras, cada uma com a sua 1.ª compra de Passe), mas mexe muito no que o fundador faz com o tempo: a procura sem teto vai de 10,4 a 6,2 contas e de €615 a €414 de receita mensal.

**±30 % por motor (efeito no mês 12).** O mês 12 com teto é insensível à procura e muito sensível às horas e ao preço:

| Motor (±30 %) | Mês 12 com teto de horas: receita € · caixa acumulada € | Mês 12 sem teto (procura): contas · receita € · caixa € |
|---|---|---|
| **Base** | 306 · 2 059 | 9,7 · 581 · 2 705 |
| Conversão ponta a ponta (×0,7 / ×1,3) | 306 · 1 627 / 306 · 2 318 | 6,8 · 407 · 1 742 / 12,6 · 756 · 3 667 |
| Tráfego (×0,7 / ×1,3) | 306 · 1 627 / 306 · 2 318 | 6,8 · 407 · 1 742 / 12,6 · 756 · 3 667 |
| Preço (×0,7 / ×1,3, mesmo volume) | 214 · 1 282 / 397 · 2 835 | 9,7 · 407 · 1 733 / 9,7 · 756 · 3 676 |
| Horas do fundador por semana (3,5 h: teto 0,0; 6,5 h: teto 12,3 contas) | 0 · -504 / 581 · 2 705 | 9,7 · 581 · 2 705 / 9,7 · 581 · 2 705 |

**Horas do fundador e apoio por conta** (o motor com maior efeito; com menos de ≈ 3,7 h/semana não há capacidade nem para servir um só cliente):

| Horas do fundador por semana | Teto de contas ativas (1 h de apoio por conta) | Receita do mês 12 (€) | Caixa acumulada no mês 12 (€) |
|---|---|---|---|
| 3,0 | 0,0 | 0 | -504 |
| 4,0 | 1,4 | 75 | 351 |
| 5,0 | 5,8 | 306 | 2 059 |
| 7,5 | 16,6 | 581 | 2 705 |
| 10,0 | 27,4 | 581 | 2 705 |
| 5,0, com 0,5 h de apoio por conta | 11,5 | 581 | 2 705 |
| 5,0, com 2,5 h de apoio por conta | 2,3 | 122 | 806 |

**Pressupostos de uso e de oferta** (sem teto, para ver a procura):

| Pressuposto de uso | Receita por conta e mês (€) | Receita do mês 12 sem teto (€) |
|---|---|---|
| 2 Passes por conta ativa e ano | 40,6 | 531 |
| 3 Passes por conta ativa e ano | 47,2 | 581 |
| 6 Passes por conta ativa e ano | 67,0 | 733 |
| 30 % dos clientes novos escolhem o Passe | 57,8 | 624 |
| 60 % dos clientes novos escolhem o Passe | 47,2 | 581 |
| 90 % dos clientes novos escolhem o Passe | 36,5 | 539 |

**O que tem de ser verdade (lista):**
1. **O fundador tem ≥ 5 h/semana e o apoio custa ≤ 1 h por conta e mês.** A 2,5 h por conta o teto é 2,3 contas e o mês 12 rende €122. É o motor com maior efeito.
2. **A conversão ponta a ponta é ≥ 0,37 %** (≈ 3 a 4 clientes por 800 visitantes ou 600 contactos). Com o teto em vigor, metade disso (0,18 %) só adia o teto (caixa acumulada −€432 no mês 12 com −30 % de procura), mas sem teto a receita do mês 12 cai de €581 para €407.
3. **Os Passes repetem-se**: 3 por ano de atividade de uma conta. Com 2 por ano a receita por conta e mês cai para €40,6; com 6 sobe para €67,0.
4. **O uso repete-se**: com 2 Passes por conta e ano, a contribuição por hora do fundador desce de ≈ €14,5 para ≈ €12,8; com 6, sobe para ≈ €19,4.
5. **A geometria real separa-se em grupos revisáveis** (gate G-GEO) e **A3** (≥ 50 % das folhas vetoriais): nada disto foi medido; testa-se de graça antes da construção.
6. **O estatuto fiscal permite cobrar** (tarefa B) sem um custo recorrente que ultrapasse o teto de €50.

O número que, se estiver errado por um fator 2, inverte a decisão é a **procura** (nenhum pagamento por IA de medição observado em Portugal), e testa-se com os gatilhos de `02-product.md` §8; logo a seguir vêm as **horas do fundador**.

## 11. Alternativas consideradas

Profundidade standard: sem propostas concorrentes pontuadas (isso é só `deep`). Alternativas ponderadas e recusadas:

| Alternativa | Porquê não |
|---|---|
| Subscrição como oferta principal, com folhas incluídas (v0.1) | O consumo é episódico (meses a 0 e meses a 200 % da quota); com cancelamento em 2 cliques, o comportamento racional é subscrever no mês do concurso e cancelar. Passou a secundária |
| Só Passe, sem subscrição | É o **Corte 1** de `02-product.md` §5.1, pré-acordado se a construção passar de 30 unidades. Perde-se a recorrência dos clientes com fluxo contínuo |
| Ângulo 1 como produto único: verificador de erros e omissões, preço por proposta (nota 2,70 em `01-research.md` §2.1) | O fundador escolheu a ideia original (medir). O melhor do ângulo 1 fica como **Should** (US-09, US-10, 3.ª da fila) e volta à mensagem (art. 50.º do CCP) quando existir. Revê-se no gatilho de pivot T5 |
| Ângulo 3: PDF → BC3 para Portugal e Espanha (nota 2,20) | Substitutos locais em castelhano a €10–30/mês; preço por cliente 3 a 10 vezes inferior |
| Subscrição «ilimitada» ou vitalício | Folha a folha custa infraestrutura e, com IA, custo variável; regra da fábrica: nunca vitalício em produtos de IA |
| Desconto anual (10 ×) no MVP | Uso episódico e complexidade dos lotes; fora do MVP, desvio do padrão registado em §14 |
| Freemium | A avaliação de 5 folhas dá o mesmo gancho a ≈ €0,30 por conta |
| Serviço de medições por concurso (concierge) | Sem competência de orçamentação declarada; não é compatível com Merchant of Record; ≤ 10 h/semana do fundador |
| Merchant of Record (Paddle, Stripe Managed Payments) | Vende-se só a empresas; a taxa é maior (Paddle +€0,9 a +€5,7 por venda) e o Managed Payments não permite checkout próprio. Fica como recurso |
| Registo prévio de DWG/DXF/IFC | Licenças e custo; o utilizador exporta para PDF; medimos o pedido (`upload_rejected`) |

## 12. Objeções sobre preço e economia

Auto-crítica do estratega (v0.1) e objeções do advogado do diabo que tocam preço e economia, com a resposta e a alteração feita. O texto completo de cada objeção e da resposta vive em `02-product.md`, secção «Objeções do advogado do diabo».

| # | Objeção (âmbito / preço / contas / pressupostos / pré-mortem) | Gravidade | Resposta | Tratamento | Alteração feita |
|---|---|---|---|---|---|
| 1 | Âmbito: o Must tem 25 unidades e margem 0 (OB-2) | grave | Eram 25 por redimensionamento. Passou a 30 com US-05 em L, US-07 fora e o Passe dentro | Aceite: exceção D-ORC registada; Corte 1 pré-acordado | PRD §5.1 |
| 2 | Preço: €99 está abaixo do P25 (€116) e o braço de teste só subia (OB-5) | grave | Mantém-se o desvio por ROI local e pelas âncoras portuguesas; o teste ganhou braço descendente e perguntas de disposição a pagar | Aceite | §5 |
| 3 | Contas: o custo de IA usava €0,34 por folha, mas o desenho custa €0,054 (v0.1) | ligeira | A IA saiu do MVP: custo €0; quando US-07 existir, o teto de €0,50 por folha mantém margens ≥ 62,4 % | Resolvida pela mudança de âmbito | §3, §5, §6 |
| 4 | Pressupostos: a conversão de 0,37 % vem de taxas sem fonte (classe D) | grave | Verdade. Com o teto de horas, metade disto só atrasa o teto; o que mais pesa é o tempo do fundador | Mitigada: gatilhos T1–T8 com amostra e intervalo | PRD §8 |
| 5 | Contas: LTV:CAC e retorno do CAC abaixo da meta (OB-4, OB-12) | grave | Agora 1,0 e 11,0 meses com CAC em tempo do fundador (€479); contribuição de ≈ €14,5 por hora do fundador | Aceite, risco explícito (§6) | §6, §10 |
| 6 | O apoio de 1 h por conta e mês contradiz a pesquisa (OB-6) | grave | O teto de contas pelas horas é parâmetro do modelo e o cenário base serve só ≈ 5,8 contas; com 2,5 h por conta, 2,3 | Aceite: teto no script; T8 | §6, §8, §10 |
| 7 | Pré-mortem do mês 3: 0 pagantes (A3, desconfiança, tempo do fundador, localização por concorrentes) | grave | (a) e (b) medidos desde o 1.º dia (G-GEO, T3, T4); (c) é de execução e T1 distingue-o; (d) acompanha-se. P(0 pagantes em 90 dias) = 13,6 % com a base certa | Mitigada | PRD §8 |
| 8 | Pagamentos: Stripe direto obriga a faturação e IVA (OB-11) | grave | Tarefa B passa a **primeira**; F1/F2 suportados; recurso Paddle | Aceite | §4, §13 |
| 9 | Preço: a oferta de fundador reduz o ARPA da subscrição (v0.1) | ligeira | Já no modelo (€68,5 no 1.º ano); só Empresa, 10 empresas, sem preço riscado | Aceite | §5, §6 |
| 10 | A unidade de venda (folha por mês) não é a de trabalho (concurso) e o churn de 5 % é baixo (OB-4) | grave | Passe Concurso principal; churn base 10 % e sensibilidade 8–25 %; ARPA por conta €47,2 | Aceite; arbitragem Passe/subscrição mitigada (medida) | §3, §5, §6, §10 |
| 11 | O ARPA de €90 vem de um mix sem evidência e o «Gabinete» serve a persona que o MVP não serve (OB-5) | grave | Cenário base sem «Gabinete» (35/65); «Gabinete» sem SLA e fora do base | Aceite | §5, §8 |
| 12 | A projeção não respeita as horas do fundador e o custo fixo não tem folga; a verificação do SOM é circular (OB-6) | grave | Teto de contas no script; 4 custos fora do teto listados; verificação do SOM reescrita | Aceite | §6 a §9 |
| 13 | Os gatilhos disparam por ruído (OB-7) | grave | Reescritos com denominador, amostra mínima e falso alarme calculado | Aceite | PRD §8; §14 |
| 14 | O «primeiro euro» depende de passos fiscais fora de calendário (OB-11) | ligeira | Tarefa B primeiro; primeiro pagamento real só depois dela; F1/F2 | Aceite | §4, §13 |
| 15 | «4 a 6 vezes» e demonstração de 15 min contra 1,5 h (OB-12) | ligeira | Corrigido para 2,5–4,9 vezes; demonstração = 1 h (15 min + 45 min) e CAC recalculado | Aceite | §5, §6 |

## 13. Tarefas do fundador propostas

Texto pronto para copiar para `HUMAN_TASKS.md` (esta fase só escreveu os dois documentos; o *checkpoint* regista as tarefas e atribui os números HT). Cada uma demora ≤ 5 minutos. **Nenhum custo recorrente existe antes do go-live.** Nunca envie chaves no chat: use as variáveis de ambiente indicadas em `SETUP.md`. **O gate G-GEO (teste da geometria real) não precisa de nenhuma tarefa do fundador.** Ordem: **B primeiro** (OB-11), depois A, depois D no go-live; C só se US-07 for construída.

- **B · Confirmar estatuto fiscal e faturação com o contabilista** — 🟡 antes do lançamento · ⏱ 5 min · 💶 0 € (a consulta pode ter custo próprio)
  - *Porquê:* o Stripe direto exige que o fundador cobre IVA (ou esteja isento) e emita faturas portuguesas. A fábrica não dá aconselhamento fiscal e `FOUNDER.md` não tem a identidade fiscal preenchida. **Sem esta resposta não há primeiro pagamento real.**
  - *Perguntas a levar:* 1. A atividade (software/SaaS) está aberta nas Finanças e em que regime de IVA: **normal, ou isenção do art. 53.º do CIVA** (limite de €15 000 de volume de negócios, **a confirmar**, com tolerância de 25 % no ano corrente)? Se isento, não se cobra IVA e o Stripe Tax não se usa. 2. Como emitir faturas-recibo a cada pagamento do Stripe: Portal das Finanças (gratuito? confirmar a restrição referida após o DL 49/2025) ou programa certificado (custo)? 3. Tratamento de clientes UE com NIF-IVA válido (autoliquidação) e fora da UE. 4. Preço do contabilista e do seguro de responsabilidade civil profissional, e se fazem sentido. 5. Custo de uma caixa de correio com domínio próprio. Ligação: <https://info.portaldasfinancas.gov.pt/>.
  - *Como assinalar:* responder «B feito + data» com a decisão sobre F1 ou F2 e sobre Stripe direto. Se não for viável, a fábrica passa a Paddle.
- **A · Criar a conta Stripe e iniciar a verificação** — 🟡 antes do lançamento · ⏱ 5 min · 💶 0 €
  - *Porquê:* cobrar Passes e subscrições B2B (modo de teste continua sem isto; a verificação demora dias). Fazer depois de B.
  - *Passos:* 1. Abrir <https://dashboard.stripe.com/register>. 2. País: Portugal; escolher a forma de atividade real. 3. Colar os valores abaixo. 4. Aceitar os termos e submeter a identidade e o IBAN.
  - *Valores a colar:* descrição «Software como serviço (SaaS) para empresas de construção: medição assistida de plantas em PDF e mapas de quantidades» · categoria «Software» · preços sem IVA: **Passes** de 59 / 129 / 249 € (pagamento único) e **subscrições** de 49 / 99 / 199 € por mês (sem planos anuais) · website: o URL de pré-visualização, depois o domínio final · email de apoio: o email da marca · descritor da fatura do cartão: o nome final da marca (a fase `brand` define).
  - *Desbloqueia:* pagamentos reais; Stripe Tax (só em F2); webhooks de produção. *Variáveis:* `STRIPE_SECRET_KEY` (teste primeiro) e `STRIPE_WEBHOOK_SECRET`.
  - *Enquanto esperas:* a fábrica constrói e testa em modo de teste. *Concluído:* marcar a caixa.
- **D · Aprovar a despesa fixa de produção (só no go-live)** — 🟡 no lançamento · ⏱ 5 min · 💶 ≈ €41/mês (Vercel Pro $20 + Supabase Pro $25) + domínio ≈ €12/ano
  - *Porquê:* a produção com receita não pode usar planos gratuitos (a Supabase gratuita pausa; a regra da fábrica exige Pro ou Cloudflare para produtos com receita). Nada disto custa antes do go-live. As fases de arquitetura e de lançamento registam os passos exatos com estes valores. O pior caso sem clientes custa €94 a L + 60 e €135 a L + 90, onde os gatilhos T5 e T6 pedem decisão.
- **C · Criar a conta Anthropic Console, o limite de gasto e a chave API** — 🟢 só se US-07 for construída (gatilho de `02-product.md` §5.4) · ⏱ 5 min · 💶 saldo inicial sugerido ≈ €20
  - *Porquê:* a IA saiu do MVP. Só será precisa para as sugestões de IA, com um limite mensal de gasto (sugestão €30) e a chave guardada como `ANTHROPIC_API_KEY` (ver `SETUP.md`). *Enquanto esperas:* não é precisa; não há chave nem custo de IA no MVP.

## 14. Registo de decisões, fontes e reprodução

**Linhas para o registo de decisões do README** (fase `strategy`, v0.2, 2026-11-27):

| Decisão | Alternativas consideradas | Porquê |
|---|---|---|
| Modelo: **Passe Concurso** (pagamento único, 20/60/150 folhas válidas 90 dias) como oferta principal; subscrição mensal com folhas acumuláveis 90 dias secundária | Subscrição principal (v0.1), créditos sem validade, vitalício, freemium, serviço | Uso episódico por concurso (OB-4); §3 |
| Meio de pagamento: Stripe direto + Billing + Tax (B2B); F1 ou F2 conforme a tarefa B | Paddle, Stripe Managed Payments | Só vende a empresas; recurso Paddle (§4) |
| Preços: Passes €59 / €129 / €249; subscrições €49 / €99 / €199 por mês + IVA; fundador €79 (10 empresas, Empresa); **sem plano anual no MVP** (desvio do padrão 10 ×) | Subscrição principal; preço do civils.ai; anual | Abaixo do P25 por ROI local e âncoras portuguesas; teste com 3 braços (§5) |
| MVP: **30 unidades Must** (US-01 a US-06, US-08, US-12), exceção D-ORC ao teto de 25 do standard; **sem IA no MVP** (US-07 Should); sem BC3, DWG, raster, equipas | A estimativa da pesquisa (40 unidades); Must de 25 por redimensionamento (v0.1) | US-05 em L; Corte 1 pré-acordado (§5.1 do PRD) |
| Gate **G-GEO** antes de construir US-04/US-05, caminhos A e B dimensionados | Construir já | OB-1: a premissa técnica nunca foi testada com plantas reais |
| Mensagem sem o art. 50.º até US-09/US-10 existirem | Subir US-09/US-10 a Must | OB-3: não cabe no teto; gatilho de volta (§5.4 do PRD) |
| Validação de procura: nenhuma prévia (ordem do fundador); gatilhos T1–T8 com amostra mínima e falso alarme | Teste de 50 contactos antes de construir | Decisão do fundador; `02-product.md` §8 |

**Fontes principais** (acedidas em 2026-11-27, salvo indicação): [Stripe PT](https://stripe.com/en-pt/pricing) · [Paddle](https://www.paddle.com/pricing) · [Supabase](https://supabase.com/pricing) · [Vercel](https://vercel.com/pricing) · [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) (corpo 4,5 MB, duração Pro 300 s) · [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) · [BCE](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html) (€1 = $1,0975, 2026-11-26) · [Newsletter n.º 39 da AT, janeiro de 2026](https://info.portaldasfinancas.gov.pt/pt/at/Divulgacao/publicacoes_internas/Newsletter_AT/Documents/Newsletter-39-janeiro-2026.pdf) e [art. 53.º do CIVA](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/artigo-53-o-do-civa.aspx), lidos só através de resultados de pesquisa (secundários; a confirmar com o contabilista) · [supabase/discussions#41618](https://github.com/orgs/supabase/discussions/41618) · pesquisa da fase 01 (concorrentes, mercado, público, riscos; acedidas em 2026-11-26): `research/competitors.md`, `research/market.md`, `research/audience.md`, `research/risks.md` · `factory/playbooks/monetization.md` (taxas de 2026-10-08, reverificadas as do Stripe e do Paddle).

**Probabilidades dos gatilhos de `02-product.md` §8** (distribuição binomial; o *script* abaixo reproduz-as):

| Gatilho | Cálculo | Probabilidade |
|---|---|---|
| T1: R ≤ 1 com C = 40 | Binomial(40; 0,08) | 15,9 % |
| T2: D ≤ 2 com R = 8 | Binomial(8; 0,60) | 5,0 % |
| T3: ≤ 1 em 8 / ≤ 2 em 8 | Binomial(8; 0,50) | 3,5 % / 14,5 % |
| T4: ≥ 11 raster em 20 / ≥ 9 em 20 | Binomial(20; 0,30), cauda superior | 1,7 % / 11,3 % |
| T5: 0 pagantes e < 3 contas com folha real, D = 7 | Σ (s = 0 a 2) C(7,s) 0,6^s 0,4^(7−s) (1 − 0,5 × 0,4)^s | 6,5 % |
| T6: 0 pagantes com D = 15 | (1 − 0,12)^15 | 14,7 % |
| T7: 0 pagantes com D = 25 | (1 − 0,12)^25 | 4,1 % |

**Reprodução.** As tabelas das §4 a §7 saem das constantes de §4 a §6 (taxas Stripe sobre valores com IVA a 23 % ilustrativo, câmbio, mix 30/50/20 de Passes e 35/65 de subscrições, 3 compras de Passe por conta e ano, 60 % de Passes nos clientes novos). As tabelas de §8 e as probabilidades saem do *script* abaixo (cola-se e corre-se com `python3`; imprime as três tabelas de §8 com teto, o mês 12 sem teto e as probabilidades T1 a T7). Parte do *script* do passo 9 de `factory/playbooks/02-strategy.md`, com a restrição de horas e dois fluxos de receita:

```python
# Medições PT v0.2: reproduz as tabelas de §8 e as probabilidades dos gatilhos. Corre com: python3 repro.py
import math
VAT, CARD = 0.23, 0.8*0.015 + 0.2*0.028           # IVA ilustrativo; taxa média do cartão (80 % padrão, 20 % premium)
def fee(net, sub=False):                           # taxas Stripe sobre o valor com IVA: cartão + €0,25 + Tax 0,5 % (+ Billing 0,7 %)
    g = net*(1+VAT); return CARD*g + 0.25 + 0.005*g + (0.007*g if sub else 0)
PASS = [(59, .30), (129, .50), (249, .20)]         # (preço sem IVA, quota de vendas): Passe 20, 60, 150
SUB = [(49, .35), (79, .65)]                       # Independente; Empresa ao preço de fundador (1.º ano, sem Gabinete)
AVG_PASS = sum(p*w for p, w in PASS); ARPA_SUB = sum(p*w for p, w in SUB)
FR_PASS = sum(fee(p)*w for p, w in PASS)/AVG_PASS; FR_SUB = sum(fee(p, True)*w for p, w in SUB)/ARPA_SUB
R, SHARE, REFUND, INFRA = 3/12, 0.60, 0.03, 0.55   # Passes por conta e mês, quota do Passe nos clientes novos, reembolsos, €/conta e mês
H_ACQ = (600*9/60 + 25*1.0)/12; H_CONTENT = (4*8 + 8*1)/12; H_ADMIN = 3.0
CAP = (5*52/12 - H_ACQ - H_CONTENT - H_ADMIN)/1.0  # teto de contas ativas: 5 h/semana, 1 h de apoio por conta e mês
BASE = dict(v1=160, growth=0.12, c1=0.0185, c2=0.20, conv=1.0, churn=0.10, fixed=41.0, setup=12.0)
MULT = {"pessimista": dict(v1=.4, conv=.6, churn=1.5), "base": {}, "otimista": dict(v1=2, conv=1.3, churn=.8)}
def run(p, cap=None):
    ap = as_ = 0.0; cash = -p["setup"]; rows = []
    for m in range(1, 13):
        new = p["v1"]*(1+p["growth"])**(m-1)*p["c1"]*p["c2"]*p["conv"]
        ap *= 1-p["churn"]; as_ *= 1-p["churn"]
        acc = new if cap is None else min(new, max(0.0, cap-(ap+as_)))
        npa, nsu = acc*SHARE, acc*(1-SHARE)
        rp = npa*AVG_PASS + ap*R*AVG_PASS; rs = (as_+nsu)*ARPA_SUB; ap += npa; as_ += nsu
        rev = rp+rs; profit = rev - rp*(FR_PASS+REFUND) - rs*(FR_SUB+REFUND) - INFRA*(ap+as_) - p["fixed"]; cash += profit
        rows.append((m, round(ap+as_, 1), round(rev), round(profit), round(cash)))
    return rows
for name, mult in MULT.items():
    p = {k: v*mult.get(k, 1) for k, v in BASE.items()}
    print(f"\n### {name} (com teto de {CAP:.2f} contas)\n| Mês | Contas | Receita € | Resultado € | Caixa acum. € |\n|---|---|---|---|---|")
    for r in run(p, CAP): print("| " + " | ".join(map(str, r)) + " |")
    print("sem teto, mês 12:", run(p)[-1])
cdf = lambda k, n, p: sum(math.comb(n, i)*p**i*(1-p)**(n-i) for i in range(k+1))
P_D = 0.6*0.5*0.4                                  # pagantes ÷ demonstrações = 12 %
print("\nT1", round(cdf(1, 40, .08), 3), "T2", round(cdf(2, 8, .6), 3), "T3", round(cdf(1, 8, .5), 3), round(cdf(2, 8, .5), 3),
      "T4", round(1-cdf(10, 20, .3), 3), round(1-cdf(8, 20, .3), 3),
      "T5", round(sum(math.comb(7, s)*.6**s*.4**(7-s)*(1-.5*.4)**s for s in range(3)), 3),
      "T6", round((1-P_D)**15, 3), "T7", round((1-P_D)**25, 3))
```
