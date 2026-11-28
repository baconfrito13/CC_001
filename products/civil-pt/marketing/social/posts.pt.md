# Publicações — LinkedIn (pt-PT)

> Ritmo: 20 publicações em 30 dias (L-14 a L+15), na conta pessoal do fundador, repetidas na página da empresa (HT-02). Mix: 12 valor · 5 produto · 3 história. Marcadas **opcional**: P04, P11, P15, P17, P18, P20 (se o tempo apertar, mínimo 14). **Nenhuma publicação sai sem aprovação do fundador** (lotes semanais, `schedule.md`). Posso agendar com o agendador do próprio LinkedIn; não usar ferramentas de automatização (o LinkedIn proíbe bots, a reverificar nos termos na altura).
> Todas as alegações respeitam `copy/messaging.md` §6: sem percentagens de precisão, sem IA, sem erros e omissões/CCP, sem «poupa X horas», sem números de clientes. Os exemplos numéricos (escala 12,00 m ↔ 120 mm; preços) são aritmética ou preços da tabela pública. Texto de «História» em primeira pessoa: o fundador ajusta ao seu estilo; os marcadores `[...]` são para preencher por ele.
> Formato: `id · plataforma · idioma · gancho (≤ 140) · corpo · CTA · ligação com UTM · recurso · hora`. Hora de Lisboa = UTC até 2027-03-27. `{{domain}}` = `https://rastoplan.com` (HT-01).

Fonte de cada ligação: `launch/links.csv`. Recursos `IB-xx`: `image-briefs.md`; os que dependem de capturas do produto só se produzem depois do QA.

## P01 · LinkedIn · pt · story
- hook: Estou a construir uma ferramenta para medir plantas em PDF. Eis o problema que quero resolver.
- body:

  Quem orça pavimentos, arranjos exteriores e redes sabe como é: chega o concurso, as peças desenhadas vêm em PDF e o prazo começa a contar.

  Medir lancis, valetas e áreas de pavimento um a um, entre o PDF, o AutoCAD e o Excel, consome horas. E, no fim, o difícil é defender cada número perante o diretor técnico ou o fiscal.

  Estou a construir o Rastoplan para isto: lê a geometria de PDF vetorial, mostra cada quantidade sobre o desenho para a pessoa confirmar e exporta o mapa de quantidades para Excel, com rasto até à folha.

  Ainda não está aberto. Se orça este tipo de obra, qual é a parte que mais tempo lhe custa?

- CTA: Responder com a parte que mais tempo custa
- link: (sem ligação)
- asset: —
- slot: 2027-01-19 (Tue) 08:30 Lisboa / 08:30 UTC · L-14

## P02 · LinkedIn · pt · value
- hook: Teste de 30 segundos: o seu PDF de planta é vetorial ou é uma imagem?
- body:

  Antes de medir uma planta em PDF, convém saber se o ficheiro é vetorial.

  1. Abra o PDF e amplie ao máximo numa linha.
  2. Se a linha ficar nítida, é vetorial (exportado de CAD).
  3. Se ficar em «escada» ou desfocada, é uma imagem: foi digitalizada ou rasterizada.

  O que muda: num PDF vetorial a geometria está lá, com coordenadas. Numa imagem, só há pixéis, e medir passa a ser estimar.

  Se o ficheiro for uma imagem, o melhor é pedir ao projetista o PDF exportado diretamente do CAD.

- CTA: Guardar para a próxima planta
- link: (sem ligação)
- asset: IB-02
- slot: 2027-01-20 (Wed) 08:30 Lisboa / 08:30 UTC · L-13

## P03 · LinkedIn · pt · value
- hook: Um mapa de quantidades tem 5 campos. Quantos dos seus têm todos?
- body:

  Capítulo, artigo, designação, unidade e quantidade. É a estrutura base de um mapa de quantidades.

  Os erros mais comuns que se veem:
  - unidades misturadas no mesmo artigo (m e m²),
  - artigos sem capítulo,
  - quantidades sem referência à folha de onde vieram.

  O último é o que mais tempo custa quando alguém pergunta «de onde vem este número?».

  Vai ser tema de um guia no site. Que erro de estrutura acrescentaria à lista?

- CTA: Responder com um erro de estrutura
- link: (sem ligação)
- asset: IB-03
- slot: 2027-01-21 (Thu) 08:30 Lisboa / 08:30 UTC · L-12

## P04 · LinkedIn · pt · opcional · value
- hook: 3 sinais de que um PDF não serve para medir (e o que fazer em cada caso).
- body:

  1. As linhas ficam em «escada» ao ampliar: é uma imagem. Peça o PDF de CAD.
  2. A folha não tem escala indicada, nem cota conhecida para a confirmar: não meça antes de a obter.
  3. A mesma folha tem várias vistas com escalas diferentes: meça cada vista à parte.

  Nenhum destes casos se resolve com software: resolve-se à entrada, com o ficheiro certo.

  Que outro sinal acrescentaria?

- CTA: Responder com outro sinal
- link: (sem ligação)
- asset: —
- slot: 2027-01-22 (Fri) 08:30 Lisboa / 08:30 UTC · L-11

## P05 · LinkedIn · pt · value
- hook: Escala errada = quantidades erradas. Como confirmar a escala antes de medir.
- body:

  A escala está no carimbo, mas o carimbo pode estar desatualizado.

  Confirmação simples: escolha uma cota conhecida na planta (por exemplo, o comprimento de um troço ou a largura de uma faixa), meça-a no desenho e compare com o valor escrito. Se a razão não bater certo com a escala indicada, há um problema, e é melhor descobri-lo antes de medir 40 folhas.

  Exemplo: se uma cota de 12,00 m aparece com 120 mm no papel, a escala é 1:100.

- CTA: Guardar
- link: (sem ligação)
- asset: —
- slot: 2027-01-25 (Mon) 08:30 Lisboa / 08:30 UTC · L-8

## P06 · LinkedIn · pt · product
- hook: O que o Rastoplan não mede. Dizê-lo logo à partida poupa tempo a todos.
- body:

  O Rastoplan lê PDF vetorial exportado de CAD e mede áreas, perímetros e comprimentos em planta.

  Não lê DWG, imagens nem PDF digitalizado.
  Não mede volumes que dependem de perfis (escavação, aterro, camas de assentamento), nem cotas e declives.
  Não é software de orçamentação: não tem bases de preços nem exporta BC3 nesta versão.

  Recusa o que não consegue ler e não gasta folhas quando recusa.

  Se o seu caso cabe nisto, vale a pena uma demonstração. Se não cabe, é melhor saber já.

- CTA: Pedir demonstração
- link: {{domain}}/pt/?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p06
- asset: IB-01
- slot: 2027-01-26 (Tue) 08:30 Lisboa / 08:30 UTC · L-7

## P07 · LinkedIn · pt · value
- hook: O diretor técnico pergunta: «de onde vem este número?». Qual é a sua resposta?
- body:

  Uma quantidade num mapa deve ter, no mínimo, a folha, o elemento ou grupo medido e a escala usada.

  Sem isso, a revisão faz-se medindo outra vez, e o tempo poupado desaparece.

  Um registo simples em Excel resolve: uma coluna para a folha, uma para o grupo, uma para a escala e uma para a nota de critério («inclui rampas»). Uma linha por quantidade.

  É também a ideia da folha «Rasto» do Rastoplan: gerar este registo à medida que se confirma sobre o desenho.

- CTA: Descarregar o modelo (em breve)
- link: {{domain}}/pt/?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p07
- asset: IB-04
- slot: 2027-01-27 (Wed) 08:30 Lisboa / 08:30 UTC · L-6

## P08 · LinkedIn · pt · value
- hook: O que uma planta não diz: espessuras, perfis e profundidades.
- body:

  Numa planta de pavimentos e redes mede-se bem o que se vê em planta: áreas, perímetros, comprimentos de lancis, valetas e tubagens.

  O que a planta não dá: espessuras das camadas, profundidades de vala, declives, volumes de escavação e aterro. Isso está nos perfis e nas peças escritas.

  Um orçamento completo junta as três coisas. A medição em planta é só a primeira parte, e é a parte que se pode acelerar.

  Quando orça, que parte lhe dá mais trabalho: a planta ou os perfis?

- CTA: Responder
- link: (sem ligação)
- asset: —
- slot: 2027-01-28 (Thu) 08:30 Lisboa / 08:30 UTC · L-5

## P09 · LinkedIn · pt · story
- hook: Amanhã o Rastoplan abre. Peço-lhe uma coisa: dizer-me onde falha.
- body:

  Amanhã abro o Rastoplan: medição de plantas em PDF vetorial, com cada quantidade confirmada sobre o desenho e um Excel com rasto até à folha.

  É uma primeira versão e tem limites que digo logo à entrada: só PDF vetorial de CAD, só áreas e comprimentos em planta.

  O que mais me ajuda é feedback de quem orça: em que folha falhou, o que faltou, o que esperava ver.

  Se quiser ver numa folha sua, peça uma demonstração.

- CTA: Pedir demonstração
- link: {{domain}}/pt/?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p09
- asset: —
- slot: 2027-02-01 (Mon) 08:30 Lisboa / 08:30 UTC · L-1

## P10 · LinkedIn · pt · product
- hook: O Rastoplan já está aberto: cada quantidade, com rasto até à folha.
- body:

  O Rastoplan lê plantas em PDF vetorial exportadas de CAD, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel, com uma folha «Rasto» que liga cada número à folha e ao grupo.

  Para quem orça pavimentos, arranjos exteriores e redes. Em português, em euros, com os ficheiros guardados na UE.

  Paga-se por concurso (Passes de 20, 60 ou 150 folhas, válidos 90 dias) ou ao mês, sem fidelização.

  Peça uma demonstração com uma folha sua.

- CTA: Pedir demonstração
- link: {{domain}}/pt/?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p10
- asset: IB-05
- slot: 2027-02-02 (Tue) 08:30 Lisboa / 08:30 UTC · L

## P11 · LinkedIn · pt · opcional · value
- hook: Antes de medir um concurso: 6 verificações que poupam retrabalho.
- body:

  1. A versão da peça desenhada é a última?
  2. A escala está indicada e confirma-se com uma cota?
  3. Há legenda, e cada estilo de linha corresponde a um artigo?
  4. As folhas são vetoriais?
  5. Que peças escritas explicam o que a planta não mostra?
  6. Há notas que alteram o que se vê (por exemplo «manter existente»)?

  Feito isto, medir é só medir. Que sétima verificação acrescentaria?

- CTA: Responder com a sétima verificação
- link: (sem ligação)
- asset: —
- slot: 2027-02-03 (Wed) 08:30 Lisboa / 08:30 UTC · L+1

## P12 · LinkedIn · pt · product
- hook: A folha «Rasto»: como saber de onde vem cada quantidade do Excel.
- body:

  Quando exporta o mapa do Rastoplan para Excel, o ficheiro traz duas folhas: o mapa (capítulos, artigos, unidades, quantidades) e uma folha «Rasto».

  A folha «Rasto» diz, para cada quantidade, de que folha do PDF veio e de que grupo de elementos, e com que escala. Se alguém perguntar «de onde vem este número?», a resposta está no ficheiro.

  [Captura de ecrã da folha «Rasto» a juntar depois do QA]

- CTA: Pedir demonstração
- link: {{domain}}/pt/?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p12
- asset: IB-06
- slot: 2027-02-04 (Thu) 08:30 Lisboa / 08:30 UTC · L+2

## P13 · LinkedIn · pt · value
- hook: 3 erros ao exportar PDF do AutoCAD que estragam a medição.
- body:

  1. Imprimir para uma impressora de imagem em vez de um PDF vetorial.
  2. Exportar várias vistas com escalas diferentes na mesma folha.
  3. Converter o texto em linhas, o que perde a legenda e dificulta a leitura.

  Para um PDF medível: exportar diretamente do CAD, uma vista por folha, escala indicada, camadas ligadas.

  (Os nomes exatos dos menus variam com a versão do AutoCAD: confirme na documentação da Autodesk.)

  Que erro de exportação já lhe custou uma tarde?

- CTA: Responder
- link: (sem ligação)
- asset: —
- slot: 2027-02-08 (Mon) 08:30 Lisboa / 08:30 UTC · L+6

## P14 · LinkedIn · pt · product
- hook: Passe por concurso ou subscrição mensal? Como se escolhe.
- body:

  Duas formas de pagar o Rastoplan, em euros e sem IVA:

  - Passe: pagamento único de 20, 60 ou 150 folhas (59 €, 129 € ou 249 €), válidas 90 dias.
  - Subscrição mensal: Independente (15 folhas, 49 €), Empresa (50 folhas, 99 €) ou Gabinete (120 folhas, 199 €), cancelável em dois cliques.

  Quem tem concursos de vez em quando costuma preferir o Passe. Quem tem concursos todos os meses, a subscrição.

  Uma folha é uma página de PDF processada com sucesso. Cada conta nova tem 5 folhas de avaliação.

- CTA: Ver preços
- link: {{domain}}/pt/precos?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p14
- asset: IB-07
- slot: 2027-02-09 (Tue) 08:30 Lisboa / 08:30 UTC · L+7

## P15 · LinkedIn · pt · opcional · value
- hook: 5 perguntas para fazer antes de escolher um software de medição.
- body:

  1. Lê PDF vetorial? E digitalizado? (Não são a mesma coisa.)
  2. Posso confirmar cada quantidade sobre o desenho?
  3. Exporta para Excel? Com a origem de cada número?
  4. Em que língua e em que moeda é?
  5. Onde ficam os meus ficheiros?

  Não há resposta certa para todos: depende do que se mede e de onde chegam as peças. Mas convém saber a resposta antes de pagar.

  Que pergunta falta?

- CTA: Responder
- link: (sem ligação)
- asset: —
- slot: 2027-02-10 (Wed) 08:30 Lisboa / 08:30 UTC · L+8

## P16 · LinkedIn · pt · value
- hook: Modelo Excel de mapa de quantidades, gratuito: capítulos, artigos, unidades e origem.
- body:

  Preparei um modelo de mapa de quantidades em Excel com a estrutura base (capítulo, artigo, designação, unidade, quantidade) e uma folha de origem para cada quantidade.

  É gratuito e não pede registo. Adapte-o à sua forma de trabalhar.

  [Ligação ao modelo: só depois de a rota de guias existir]

- CTA: Descarregar o modelo
- link: {{domain}}/pt/guias/modelo-excel-mapa-de-quantidades?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p16
- asset: IB-03
- slot: 2027-02-11 (Thu) 08:30 Lisboa / 08:30 UTC · L+9

## P17 · LinkedIn · pt · opcional · product
- hook: «Usa inteligência artificial?» Nesta versão, não. O que isso significa.
- body:

  É a pergunta que mais faz sentido. A resposta: nesta versão, não.

  O Rastoplan lê a geometria diretamente do PDF vetorial. Não estima quantidades a partir de uma imagem, e as peças não são enviadas a nenhum fornecedor de IA. O que o software faz é agrupar elementos por estilo de desenho e mostrá-los para a pessoa aceitar ou rejeitar.

  Se isto mudar no futuro, será dito às claras.

- CTA: Pedir demonstração
- link: {{domain}}/pt/?utm_source=linkedin&utm_medium=organic-social&utm_campaign=202702-launch&utm_content=p17
- asset: —
- slot: 2027-02-12 (Fri) 08:30 Lisboa / 08:30 UTC · L+10

## P18 · LinkedIn · pt · opcional · value
- hook: Áreas com recortes: como se medem sem somar o que não deve.
- body:

  Um pavimento com canteiros, caixas de visita ou árvores no meio: a área útil é a área exterior menos os recortes.

  Na medição manual, é onde mais se erra: um recorte esquecido, ou um recorte somado em vez de subtraído.

  Num PDF vetorial os recortes são contornos fechados dentro do contorno principal, e o software pode aplicar a regra de subtração por si. Convém sempre confirmar visualmente o resultado.

  Que recorte lhe pregou uma partida?

- CTA: Responder
- link: (sem ligação)
- asset: IB-08
- slot: 2027-02-15 (Mon) 08:30 Lisboa / 08:30 UTC · L+13

## P19 · LinkedIn · pt · story
- hook: O que aprendi com as primeiras demonstrações. [Publicar só se houver ≥ 3 demonstrações reais]
- body:

  [Texto a escrever pelo fundador depois de ≥ 3 demonstrações reais: 3 coisas que ouviu, 1 que mudou no produto, 1 pergunta. Sem números de clientes nem citações sem autorização por escrito.]

- CTA: Responder
- link: (sem ligação)
- asset: —
- slot: 2027-02-16 (Tue) 08:30 Lisboa / 08:30 UTC · L+14

## P20 · LinkedIn · pt · opcional · value
- hook: Lancis e valetas: o comprimento em planta não é o comprimento em obra.
- body:

  Em planta, um lancil curvo ou uma valeta com inclinação aparece com o comprimento projetado. Em curvas, a diferença entre medir em segmentos retos e medir a curva real pode ser relevante.

  Por isso, ao medir lancis e valetas, convém usar o comprimento ao longo do traçado e não a distância entre pontos, e confirmar se o declive justifica um acréscimo.

  É um exemplo de como a medição em planta é a primeira parte do trabalho, não a única.

- CTA: Guardar
- link: (sem ligação)
- asset: —
- slot: 2027-02-17 (Wed) 08:30 Lisboa / 08:30 UTC · L+15
