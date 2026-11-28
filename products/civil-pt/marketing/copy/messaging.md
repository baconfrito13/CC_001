# Mensagens — Rastoplan

> Fonte única do vocabulário e das alegações de todos os ativos de `marketing/`. Voz: `docs/03-brand.md` §5 (rigoroso, transparente, direto, sóbrio; pt-PT neutro e impessoal, nunca «você»). Alegações: `docs/02-product.md` §7. Tudo o que é número ou comparação tem fonte e data.

## 1. Proposta de valor (nível 1)

**Cada quantidade de uma planta PDF, com rasto até à folha.** (11 palavras)

Em inglês: *Every quantity from a PDF plan, traced to the sheet.* Slogan (marca): «Cada quantidade, com rasto até à folha.» / «Every quantity, traced to the sheet.»

Teste dos 5 segundos: *O que é?* Medição de plantas PDF vetoriais com Excel no fim. *Para quem?* Quem orça pavimentos, arranjos exteriores e redes em Portugal. *Porquê?* Cada número mostra de onde vem.

## 2. Três pilares (nível 2)

| Pilar | Promessa | Prova (hoje) | Funcionalidade por trás |
|---|---|---|---|
| **1. Confirma-se no desenho** | Ver sobre a folha de onde vem cada quantidade antes de a aceitar | A revisão sobre a folha é obrigatória antes de exportar (PRD US-05, US-06); a interface diz «a rever pelo utilizador» | Grupos realçados na folha, aceitar/rejeitar, tabela e teclado |
| **2. Excel com rasto** | Defender cada número perante o diretor técnico ou o fiscal | Folha «Rasto» no Excel: quantidade, folha, grupo (PRD US-06) | Mapa em capítulos, artigos e unidades; exportação `.xlsx` |
| **3. Paga-se por concurso, em euros, em português** | Pagar o que se usa, sem fidelização | Tabela pública: Passe 60 = 129 € + IVA (60 folhas, 90 dias, ≈ 2,15 € por folha); subscrição cancela-se em dois cliques (`docs/02-business.md` §5; Termos §3) | Passe Concurso (US-12), subscrição mensal (US-08), interface pt-PT |

Ordem de uso conforme o gatilho: concurso com prazo curto → pilar 1; reunião com o diretor técnico → pilar 2; aprovação de custo → pilar 3.

## 3. Prova (nível 3)

**Disponível hoje (pode usar-se):**
- Os limites do produto, ditos às claras: só PDF vetorial exportado de CAD; mede áreas, perímetros e comprimentos em planta; não mede volumes que dependem de perfis (PRD §2, §7).
- Preços públicos em euros sem IVA e a regra de reembolso (Termos §4: integral se nenhuma folha foi usada, proporcional nos outros casos, em 14 dias na 1.ª compra).
- Ficheiros em armazenamento privado na UE (Supabase `eu-central-1`, Vercel `fra1`; `docs/04-architecture.md`); nesta versão as peças não seguem para nenhum fornecedor de IA (`legal/ai-act-note.md`).
- Dado de contexto, verificado em 2026-11-28 em https://civils.ai/pricing: Starter «$90/month», «20 measured sheets in your first month Then 10 per month»; a página não indica código de moeda nem IVA. Só para uso interno ou para a página de comparação depois de revisão do `legal-counsel` (ver §6).

**A obter após o lançamento (não usar antes):** resultados de comparações reais (mínimo 3 registadas, PRD §7 regra 1), citações e logótipos de clientes, tempo poupado por folha, número de clientes ou de folhas processadas. Até lá: «Resultados de clientes: a obter após o lançamento».

## 4. Objeções e respostas (nível 4)

| Objeção | Resposta (≤ 2 frases) | Onde aparece |
|---|---|---|
| «A IA erra.» | Nesta versão não há IA: a geometria é lida diretamente do PDF vetorial. Cada grupo é confirmado sobre o desenho e o Excel traz a folha «Rasto». | FAQ, outbound, e-mail 3 |
| «As quantidades vão coincidir com as minhas?» | Não prometemos percentagens: a revisão é sempre do utilizador, e a folha «Rasto» mostra de onde vem cada número. A demonstração faz-se com uma folha sua. | FAQ, demonstração |
| «Só funciona com PDF vetorial?» | Sim, só PDF exportado de CAD; imagens, digitalizados e DWG são recusados com uma mensagem clara e não gastam folha. | Hero (nota), FAQ, artigos 05 e 06 |
| «As minhas peças ficam seguras?» | Ficam em armazenamento privado na UE, só acessível à conta, e podem ser apagadas; não treinam modelos e nesta versão não seguem para fornecedores de IA. | FAQ, política de privacidade |
| «Já pago Bluebeam/CYPE/Presto.» | O Rastoplan não é software de orçamentação: não tem bases de preços nem BC3 nesta versão. Dá as quantidades da planta, com rasto, em Excel. | FAQ, outbound |
| «Mais uma subscrição.» | Há Passe por concurso (pagamento único, folhas válidas 90 dias) e subscrição mensal sem fidelização, cancelável em dois cliques. | Preços, e-mail 3 |
| «E se não funcionar numa folha?» | Uma folha que «não funcionou» volta ao saldo, e na 1.ª compra há reembolso a pedido em 14 dias. | Preços, FAQ |
| «Porque não o civils.ai?» | O civils.ai tem interface e preços em dólares e declara servidores nos EUA; o Rastoplan é em pt-PT, em euros e com ficheiros na UE. Aceita só PDF vetorial. (comparação a rever pelo `legal-counsel` antes de uso público) | Só artigo 02 e conversas, após revisão |
| «Quem responde por um erro?» | O Rastoplan é um assistente: o utilizador revê e confirma, e não certificamos medições. Os Termos descrevem a responsabilidade. | Termos, conversa |

## 5. Boilerplates (nível 5)

Contagem de palavras verificada por script (`wc -w`).

**10 palavras:** Medições em plantas PDF vetoriais, com rasto até à folha.

**30 palavras:** O Rastoplan lê plantas em PDF vetorial, mostra cada quantidade sobre o desenho para o utilizador confirmar e exporta o mapa de quantidades para Excel, com rasto até à folha.

**60 palavras:** O Rastoplan é um assistente de medição para quem orça pavimentos, arranjos exteriores e redes. Lê plantas em PDF vetorial exportadas de CAD, mostra cada quantidade sobre o desenho para o utilizador confirmar e exporta o mapa de quantidades para Excel, com rasto até à folha. Interface em português, preços em euros, por concurso ou ao mês, ficheiros na UE.

**Uma linha (PT):** Plantas PDF em, mapa de quantidades em Excel fora, com rasto de cada número.
**One-liner (EN):** Vector PDF plans in, Excel bill of quantities out, with a trace behind every number.

**Elevator pitch (≈ 40 segundos, voz do fundador):**
«Quem orça concursos de pavimentos e redes passa horas a medir peças desenhadas em PDF. O Rastoplan lê a geometria do PDF vetorial, mostra cada quantidade sobre o desenho para a pessoa confirmar e exporta o mapa de quantidades para Excel com uma folha de rasto, para saber sempre de onde veio cada número. Só lê PDF exportado de CAD, e diz isso às claras. Paga-se por concurso, em euros.»

## 6. Registo de alegações

| Alegação | Estado | Fonte / condição | Onde é permitida |
|---|---|---|---|
| «Nesta versão não usa IA / as peças não vão para fornecedores de IA» | verdadeira só com `AI_ENABLED=false` | `legal/ai-act-note.md` §1; ADR 0008 | Landing, FAQ, outbound. **Retirar assim que US-07 for ativada** |
| «Ficheiros guardados na UE» | verdadeira se Supabase `eu-central-1` e Vercel `fra1` | `docs/04-architecture.md`; confirmar na fase 09 | Landing. **Nunca «dados só na UE»** |
| «5 folhas de avaliação, 14 dias, sem cartão» | verdadeira só se a avaliação estiver aberta no lançamento | Termos §3 | FAQ de preços. Se não estiver, retirar a frase |
| «Reembolso a pedido em 14 dias (1.ª compra)» | verdadeira | Termos §4 | Preços, FAQ |
| «Cancelamento em dois cliques» | verdadeira se o portal do Stripe estiver ligado | Termos §3; US-08 | Preços, FAQ. Reverificar na fase 09 |
| Preço por folha inferior ao do civils.ai («2,5 a 4,9 vezes») | **bloqueada** | `docs/02-product.md` §7 regra 3: só com fonte e data à vista e depois de o `legal-counsel` rever a alegação comparativa; o civils.ai conta como duas as folhas com mais de 150 medições; a tabela dele não indica moeda | Só artigo 02, após revisão |
| «Aceita PDF digitalizado» (concorrente) | factual, para uso interno | https://civils.ai/ lido em 2026-11-28: «We currently support any form of PDF document or drawings (including handwritten and scanned PDF)» | Só como contexto, sem tom depreciativo |
| Percentagem de precisão, «certificado», «mais exato» | **proibida** | PRD §7 regra 1, até haver ≥ 3 comparações reais | Em lado nenhum |
| Erros e omissões, art. 50.º do CCP, «verificação de mapas» | **proibida** | PRD §7 regra 2, até US-09 e US-10 existirem | Em lado nenhum (inclui posts e artigos) |
| «Primeiro», «único», «melhor», «líder» | **proibida** | Sem prova: a pesquisa web da fábrica é só dos EUA e não prova ausência de concorrentes em Portugal | Em lado nenhum |
| Número de clientes, folhas processadas, testemunhos, logótipos | **proibida** até existirem | — | — |
| «Feito em Portugal» | verdadeira quando a entidade e a identidade legal estiverem preenchidas (HT legal) | `docs/03-brand.md` §4 | Landing, press |
| «Poupa X horas» | **proibida** | O tempo manual por folha não está medido (PRESSUPOSTO A2, `docs/02-business.md` §5) | Em lado nenhum até haver medição real |

## 7. Banco de ganchos

**Problema primeiro (10):**
1. Chegou um concurso com 12 folhas de pavimentos. Quantas horas até ao mapa de quantidades?
2. O diretor técnico pergunta de onde vem aquele número. Qual é a resposta?
3. Medir lancis e valetas em PDF, um segmento de cada vez, é trabalho de quem?
4. O mesmo PDF, três pessoas, três totais diferentes. Já aconteceu?
5. A escala da folha estava errada e só se viu depois da proposta enviada.
6. Quantas vezes medeu a mesma área porque não ficou registo de como a mediu?
7. Entre o PDF, o AutoCAD e o Excel, onde se perde o rasto de uma quantidade?
8. Um mapa de quantidades sem origem dos números não se pode rever.
9. O prazo do concurso não muda por haver mais folhas para medir.
10. Quem mede à mão sabe quanto custa uma folha de arranjos exteriores. E quanto custa conferi-la?

**Resultado primeiro (10):**
1. Cada quantidade, com rasto até à folha.
2. Do PDF vetorial ao mapa de quantidades em Excel, com a origem de cada número.
3. Confirme cada grupo sobre o desenho antes de exportar.
4. Uma folha «Rasto» no Excel que liga cada quantidade à folha e ao grupo.
5. Pague por concurso: um Passe de 60 folhas, válido 90 dias.
6. Medições em pt-PT, preços em euros, sem fidelização.
7. Aceite ou rejeite grupos de elementos na folha, na tabela ou pelo teclado.
8. Diz o que não mede: imagens, digitalizados e DWG são recusados com uma mensagem clara.
9. Um mapa de quantidades que se defende perante o fiscal.
10. Ficheiros em armazenamento privado na UE, apagáveis por si.
