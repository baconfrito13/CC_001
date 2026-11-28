# Product Hunt — kit preparado, lançamento adiado

> **Veredicto: não lançar no Product Hunt em L.** Razões: (1) o público-alvo (orçamentistas de empreiteiras portuguesas) não está lá e o produto é B2B de nicho: a visita média do PH não converte em pedidos de demonstração; (2) é um lançamento de uma só vez e **nunca se relança o mesmo produto em 30 dias**; (3) no PH vale mais com prova real (≥ 3 clientes com resultados e citações com autorização), que só existirá depois de L. **Reavaliar em L+60**; se o fizer, será para credibilidade e backlinks, não como canal de aquisição. Nenhum custo.
> Regras verificadas em 2026-11-28 em https://help.producthunt.com/en/articles/17834537-4-build-your-product-page (a página antiga `producthunt.com/launch/preparing-for-launch` redireciona para aqui): nome ≤ 40 caracteres, tagline ≤ 60, descrição ≤ 500, até 3 tópicos, primeiro comentário ≤ 5 000, logótipo 240×240 (JPG/PNG/GIF até 2 MB), **galeria com pelo menos 1 imagem** (recomendado 1270×760), vídeo por ligação, «skip link shorteners»; a página não fala em parâmetros de rastreio. **Reverificar no dia** (a playbook de 2026-10-08 dizia ≥ 2 imagens). Contas são pessoais; nunca pedir votos.
> **Lote:** HT-GTM-NN (não agendado). Se avançar: horário de arranque 12:01 PT = 08:01 Lisboa (07:01 nas semanas em que os EUA e a UE mudam a hora em datas diferentes); `schedule.md` de dia de lançamento no fim.

## Ficha
- name: Rastoplan
- tagline (3 opções):
  - tagline: Cada quantidade de uma planta PDF, com rasto até à folha
  - tagline: Meça plantas PDF e confirme cada quantidade no desenho
  - tagline: Plantas PDF vetoriais em, mapa de quantidades Excel fora
- ph_description: Rastoplan lê plantas em PDF vetorial exportadas de CAD, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel, com uma folha «Rasto» que liga cada número à folha e ao grupo. Para quem orça pavimentos, arranjos exteriores e redes. Interface em português e inglês, preços em euros por concurso ou ao mês, ficheiros guardados na UE. Só lê PDF vetorial e não mede volumes que dependem de perfis.
- tópicos (máx. 3): escolher no formulário entre os sugeridos (candidatos: Productivity, SaaS, uma categoria de construção/engenharia se existir). **Não usar «Artificial Intelligence»**: nesta versão não há IA.
- URL do produto: `{{domain}}/ph` (rota simples que redireciona para `/en/` sem parâmetros; a integração cria-a; **sem UTM nem encurtadores**).
- thumbnail: `brand/assets/icon-512.png` reduzido a 240×240 (< 2 MB).
- galeria (≥ 1; recomendado 5): (1) hero: «Every quantity, traced to the sheet» + UI real; (2) a folha com grupos realçados; (3) a folha «Rasto» no Excel; (4) 3 passos; (5) preços (Passes e subscrições). Produzir com capturas reais depois do QA. Texto das imagens em inglês.
- vídeo: opcional; um demo de 30–60 s gravado com Playwright no produto real, compreensível sem som. YouTube.

## Comentário do criador (inglês, ≈ 190 palavras; o fundador ajusta ao seu estilo)
Hi, I'm {{founder_name}}, from Portugal. Estimators who bid for paving, landscaping and utility works spend hours measuring PDF plans by hand, and then have to defend each number.

Rastoplan reads the geometry of vector PDFs exported from CAD, highlights each group of elements on the drawing for you to accept or reject, and exports a bill of quantities to Excel. The Excel has a "Trace" sheet that says, for every quantity, which sheet and group it came from.

What it does not do, up front: it only reads vector PDF (no DWG, no scans), it measures areas, perimeters and lengths on plan only, and it is not estimating software (no price databases, no BC3 in this version). There is no AI in this version.

New accounts get 5 evaluation sheets with no card. After that, a per-tender pass (20, 60 or 150 sheets, valid 90 days) or a monthly plan, in euros, excluding VAT.

I would love feedback on one thing: if you measure plans for a living, which quantity would you check first, and does the Trace sheet give you enough to defend it?

## 10 respostas preparadas
1. **Preço?** Passes: 59 € / 129 € / 249 € (20/60/150 folhas, 90 dias). Mensal: 49 € / 99 € / 199 €. Sem IVA, em euros, sem fidelização.
2. **Privacidade?** Armazenamento privado na UE, projeto apagável; não treina modelos; nesta versão sem fornecedores de IA.
3. **Alternativas?** Bluebeam (medição manual), CYPE Arquimedes (orçamentação, não lê PDF), civils.ai (IA, aceita digitalizados, preços em dólares). Cada um serve a casos diferentes; o Rastoplan faz só PDF vetorial, com rasto, em pt-PT e euros. Factos datados em `copy/messaging.md` §6.
4. **IA?** Não nesta versão; geometria lida diretamente do PDF.
5. **Roadmap?** Só o que o PRD §5.4 prevê, por gatilhos reais de clientes: projeto de exemplo, designação sugerida pela legenda sem IA, importação do mapa do dono de obra. Não prometer datas.
6. **Tecnologia?** Next.js, Supabase (UE), Stripe; `pdfjs-dist` para ler a geometria. Dizer só o que a arquitetura confirma.
7. **Onde ficam os dados?** `eu-central-1` (Supabase) e `fra1` (Vercel); detalhes na política de privacidade.
8. **Reembolsos?** Na 1.ª compra, a pedido em 14 dias: integral se nenhuma folha foi usada, proporcional nos outros casos (Termos §4).
9. **Apoio?** Por e-mail, em português; sem SLA contratual.
10. **Para quem é?** Orçamentistas de empreiteiras de pavimentos, arranjos exteriores e redes em Portugal; independentes e gabinetes também podem usar.

## Dia de lançamento (se avançar; hora de Lisboa)
T-1 verificações finais (links, imagens, `/ph`) · 08:01 publicar + comentário · responder a cada comentário em ≤ 30 min até às 22:00 · 09:00 publicação no LinkedIn · 10:30 e-mail à lista de pedidos · 13:00 uma comunidade relevante · 17:00 ponto de situação · 22:00 agradecimento e registo de métricas em `docs/10-growth.md`.
