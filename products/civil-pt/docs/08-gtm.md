# Go-to-market — Rastoplan

> **Slug:** `civil-pt` · **Modo:** `waitlist` (pedido de demonstração; a variante `live` está pronta em `marketing/copy/landing.<idioma>.md`) · **Idiomas:** en, pt-PT (ver decisão D-GTM-3) · **Lançamento (L):** 2027-02-02 (terça-feira), **proposta condicionada** aos portões do §12 · **Domínio:** `rastoplan.com` (por comprar: HT-01; nos ativos aparece como `‹domain›`) · **Atualizado em:** 2026-11-28

> **Leitura obrigatória antes do plano.** O veredicto G1 da ideia é **KILL provisório não validado (2,45/5)**; o fundador forçou o avanço e dispensou a validação de procura (`docs/02-product.md`, contexto da decisão). O universo comprador é de ≈ 1 500 contas nomeáveis, o motor ainda não foi testado em plantas reais (G-GEO inconclusivo, ADR 0006) e o cenário base prevê ≈ 0,6 clientes pagantes no dia 30 e ≈ 2 no dia 90, com 13,6 % de probabilidade de **nenhum** pagante em 90 dias (`docs/02-business.md`). **Este plano dimensiona a captação para 5 horas por semana de fundador e 0 € de anúncios, e usa a captação como a validação de procura que foi dispensada** (gatilhos T1 a T8 do PRD §8, no §11). Não promete tração.

## 1. Resumo

- **Para quem:** orçamentistas e diretores técnicos de empreiteiras e subempreiteiras de pavimentos, arranjos exteriores e redes em Portugal (CAE 42 e 43, ≥ 10 pessoas, ≈ 879 empresas; `docs/02-product.md` §2).
- **Promessa:** «Cada quantidade de uma planta PDF, com rasto até à folha» (11 palavras).
- **Canais a testar (anel interior):** (1) contacto direto personalizado, enviado pelo fundador · (2) newsletters e media do setor, a começar pela AICCOPN · (3) conteúdo em pt-PT (LinkedIn do fundador + 10 guias + modelo Excel gratuito).
- **Orçamento de experiências:** **0 €** (`paid_ads_budget_eur: 0`; custos recorrentes já em ≈ 42 € dos 50 € permitidos). Qualquer despesa é decisão do fundador.
- **Lançamento:** 2027-02-02, **sem plataforma de lançamento principal**: Product Hunt, Show HN, Reddit e BetaList foram avaliados e **não se aplicam** (§8). O «lançamento» é o início do contacto direto e da série de publicações, com o site em produção.

## 2. Posicionamento (método April Dunford)

| Componente | Resposta | Evidência |
|---|---|---|
| Alternativas à nossa solução | (1) **Medição manual** em PDF/AutoCAD/Excel (status quo); (2) **Bluebeam Revu/Max**: medição manual no PDF, 15 idiomas sem português; (3) **CYPE Arquimedes/Presto/Candy**: software de orçamentação com BC3, o Arquimedes não lê PDF (importa DXF/DWG); (4) **medidor externo**: €350 a > €1 200 por moradia (só edifícios); (5) **IA em inglês** (civils.ai, Togal, Kreo): dólares ou euros por utilizador, sem interface pt-PT; (6) **modelos de linguagem gerais**: erro de 24,7 % num teste de drenagem | `docs/research/competitors.md` e `audience.md` (2026-11-26); civils.ai relido em 2026-11-28 (§2 de `marketing/copy/messaging.md`) |
| Atributos únicos | (a) lê **só PDF vetorial** exportado de CAD, e di-lo; (b) **confirmação obrigatória sobre o desenho** antes de exportar; (c) **folha «Rasto» no Excel** (folha, grupo e escala de cada quantidade); (d) **pt-PT, euros, Passe por concurso** sem fidelização; (e) **ficheiros na UE e, nesta versão, sem IA** | PRD US-04, US-05, US-06, US-08, US-12 (Must); `legal/ai-act-note.md` |
| Valor que esses atributos criam | Defender cada número perante o diretor técnico ou o fiscal e poupar tempo de medição (poupança **não medida**: pressuposto A2; ponto de equilíbrio do Passe 60: ≥ 9,5 min por folha a 13,6 €/h, estimativa) | `docs/02-business.md` §5; **sem prova de cliente ainda** |
| Clientes que mais valorizam | Orçamentista de empreiteira de pavimentos, arranjos exteriores e redes, com concursos regulares, que tem de justificar quantidades; secundário: medidor independente (segmento 3, edifícios) e gabinete (não servido além da medição) | `audience.md` 3C; PRD §2 |
| Categoria de mercado | **Assistente de medição vetorial de plantas PDF** (não «IA», não «software de orçamentação») | Teste dos 5 segundos: PRD §1 |
| Tendência relevante | Menos concursos de infraestruturas (−31 % em número até junho de 2026 face a 2025, valor +2,7 % no segmento) ⇒ cada concurso disputa-se com mais propostas; hipótese: mais pressão para propor depressa | Barómetro AICCOPN jul. 2026 (https://www.aiccopn.pt/wp-content/uploads/2026/07/202607-BarometroAICCOPN-ObrasPublicas.pdf), decomposição por segmento em `docs/lessons.md` (2026-11-26); **a implicação é hipótese** |

**Frase de posicionamento:** Para orçamentistas e diretores técnicos de empreiteiras e subempreiteiras de pavimentos, arranjos exteriores e redes em Portugal, que perdem horas a medir plantas em PDF e têm de defender cada número, o Rastoplan é um **assistente de medição vetorial** que lê a geometria do PDF exportado de CAD, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel com rasto até à folha. Ao contrário da medição manual em Bluebeam ou Excel, cada número fica com origem registada; ao contrário das ferramentas de IA em inglês, está em pt-PT, em euros, com preço por concurso e só lê o que consegue ler.

**Regra de decisão aplicada (empate entre enquadramentos):** «assistente de medição vetorial» ganhou a «verificador de erros e omissões» (a cunha com mais força jurídica, nota 2,70 na pesquisa) porque o MVP **não** tem US-09/US-10 e o PRD §7 proíbe essa mensagem até existirem; e ganhou a «IA para medições» porque o motor não usa IA. O enquadramento «erros e omissões» fica como **segunda mensagem**, ativada só quando ≥ 3 das primeiras 8 demonstrações pedirem para comparar com o mapa do dono de obra (PRD §5.4).

## 3. Cliente ideal (ICP) e persona

- **Quem:** orçamentista/medidor (utilizador) e diretor técnico ou sócio-gerente (comprador; em PME é a mesma pessoa). Empresas de construção CAE 42/43 com ≥ 10 pessoas que executam pavimentos, arranjos exteriores e redes. Portugal, pt-PT. Pessoas coletivas.
- **Acontecimentos que desencadeiam a procura:** chega um concurso ou consulta privada com prazo curto; o orçamentista tem de medir peças desenhadas em PDF; a obra seguinte já está a chegar.
- **Trabalho a realizar:** «Quando recebo as peças desenhadas de um concurso com prazo curto, quero obter medições auditáveis e um mapa de quantidades pronto a exportar, para orçamentar mais concursos, mais depressa e com menos erros» (PRD §3).
- **Solução atual e custo:** medição manual em PDF/AutoCAD/Excel; ≈ 13,6 €/h de orçamentista (estimativa, classe C); CYPE/Presto/Candy para o orçamento.
- **Orçamento e quem paga:** a empresa; 59–249 € por concurso ou 49–199 €/mês, sem IVA.
- **Onde encontrar:** LinkedIn (perfis públicos), sítios das empresas, Portal BASE (adjudicatárias), boletim e newsletter da AICCOPN, Construção Magazine. **Sem comunidade de orçamentistas verificada**: as citações portuguesas vêm de um só fórum de edifícios (Fórum da Casa). O fundador **não declarou audiência própria** (`FOUNDER.md` vazio): nada aqui assume seguidores.
- **Objeções (as 5 que mais pesam):** (1) «e se as quantidades não coincidirem com as minhas?»; (2) «só PDF vetorial?»; (3) confidencialidade das peças; (4) «já tenho Bluebeam/CYPE»; (5) «mais uma subscrição / quem responde por um erro». Respostas em `marketing/copy/messaging.md` §4.
- **Fora do alvo (anti-ICP):** donos de obra e particulares; quem só tem DWG ou PDF digitalizado; quem precisa de volumes por perfis; empresários em nome individual **para e-mail frio** (só contacto manual em contexto profissional); empresas fora de Portugal.

## 4. Hierarquia de mensagens

Detalhe, objeções, boilerplates, ganchos e **registo de alegações** em `marketing/copy/messaging.md`.

1. **Proposta de valor:** Cada quantidade de uma planta PDF, com rasto até à folha.
2. **Três pilares:** **Confirma-se no desenho** (revisão obrigatória sobre a folha) · **Excel com rasto** (folha «Rasto») · **Paga-se por concurso, em euros, em português** (Passe 60 a 129 € + IVA; mensal sem fidelização).
3. **Prova disponível hoje:** os limites ditos às claras; preços e regra de reembolso públicos; ficheiros em armazenamento privado na UE; sem IA nesta versão. **A obter após o lançamento:** comparações reais, citações, horas poupadas, contagens de clientes.
4. **Alegações proibidas** (PRD §7): percentagens de precisão, IA, erros e omissões/CCP, «primeiro/melhor», «poupa X horas», comparação de preço com o civils.ai antes de revisão legal.
5. **Boilerplates (10/30/60 palavras):** `marketing/copy/messaging.md` §5.

## 5. Canais — Bullseye (19 canais)

Pontuação 1–5; pesos: ajuste ao ICP 30 %, alcance 20 %, rapidez até um sinal em ≤ 30 dias 20 %, eficiência de custo 15 %, executável por Claude sem tempo do fundador 15 %. Pontuações são **julgamento do estratega**, não medições; por falta de dados de comunidades e de SERP português (pesquisa web só dos EUA), a confiança é baixa.

| # | Canal | Ideia para este produto | Fit | Alcance | Rapidez | Custo | Claude | Total | Anel |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Marketing viral | Folha «Rasto» do Excel com rodapé discreto «medido com Rastoplan», com opção de o desligar (pedido à construção; só depois de 5 clientes) | 3 | 2 | 1 | 5 | 3 | **2,70** | exterior |
| 2 | Publicidade (PR) | Artigo técnico sem tom comercial na Construção Magazine; comunicado só depois de L+30 e de provas reais | 4 | 3 | 2 | 4 | 4 | **3,40** | médio |
| 3 | PR não convencional | «Medimos uma folha do seu próximo concurso, grátis»: a oferta da demonstração tornada pública; um desafio com folhas públicas só se o G-GEO for passado | 3 | 2 | 2 | 5 | 3 | **2,90** | exterior |
| 4 | Motores de pesquisa pagos (SEM) | Google Search de cauda longa (plano em `marketing/ads/test-plan.md`); orçamento de anúncios = 0 €, por isso inativo | 4 | 2 | 4 | 1 | 3 | **3,00** | médio |
| 5 | Anúncios sociais e display | LinkedIn Ads a cargos de orçamentação; custo por clique alto em B2B (não verificado), inativo | 3 | 2 | 3 | 1 | 2 | **2,35** | exterior |
| 6 | Anúncios offline | n/a: sem meios offline com custo compatível e sem público medível | 1 | 1 | 1 | 1 | 1 | **1,00** | exterior |
| 7 | SEO | 10 guias em pt-PT (`marketing/seo/briefs/`); procura de pesquisa mínima, serve de credibilidade | 3 | 3 | 1 | 5 | 5 | **3,20** | médio |
| 8 | Marketing de conteúdo | 20 publicações no LinkedIn do fundador e 10 guias; modelo Excel gratuito como isca | 4 | 2 | 2 | 5 | 5 | **3,50** | interior |
| 9 | E-mail marketing | Sequências para pedidos de demonstração, avaliação e recuperação (`marketing/email/`): só trabalham leads já existentes | 4 | 1 | 3 | 5 | 5 | **3,50** | médio |
| 10 | Engenharia como marketing | Verificador gratuito de PDF vetorial no navegador e modelo Excel (`seo/clusters.md`); a construir depois do lançamento | 5 | 3 | 2 | 4 | 3 | **3,55** | médio |
| 11 | Blogues e newsletters-alvo | Newsletter e boletins da AICCOPN (> 6 000 associadas) e Construção Magazine: guia técnico para publicação | 4 | 4 | 2 | 4 | 4 | **3,60** | interior |
| 12 | Parcerias | Ordens profissionais, consultoras de concursos, formadores, gabinetes (`launch/partners.md`) | 4 | 3 | 2 | 5 | 3 | **3,40** | médio |
| 13 | Vendas (contacto direto) | Lista de ≈ 150 empresas do Portal BASE; 50 contactos por mês pelo fundador; demonstração de 15 min com uma folha do prospeto | 5 | 3 | 4 | 5 | 3 | **4,10** | interior |
| 14 | Afiliados | n/a até haver ≥ 20 clientes pagantes e ativação ≥ 30 % | 2 | 2 | 1 | 3 | 3 | **2,10** | exterior |
| 15 | Plataformas existentes | Capterra/GetApp, SaaSHub, AlternativeTo, página no LinkedIn (`launch/directories.md`) | 3 | 2 | 3 | 5 | 4 | **3,25** | médio |
| 16 | Feiras | n/a: a Concreta de 2026 já ocorreu (18–21 nov); próxima em 2028 | 3 | 3 | 1 | 1 | 1 | **2,00** | exterior |
| 17 | Eventos offline | Eventos e formação de entidades externas da AICCOPN; sem orçamento nem tempo de fundador no mês 1 | 4 | 2 | 1 | 3 | 1 | **2,40** | exterior |
| 18 | Palestras e podcasts | Webinar de 20 min para associadas da AICCOPN depois de haver 3 casos reais | 4 | 2 | 1 | 5 | 2 | **2,85** | exterior |
| 19 | Comunidades | Fórum da Casa, Workana e Zaask: medidores independentes de edifícios (segmento 3, adjacente); regras de autopromoção não verificadas | 2 | 2 | 3 | 5 | 3 | **2,80** | exterior |

**Anel interior (3, todos gratuitos, nenhum pago):** 13 contacto direto · 11 newsletters e media do setor (inclui a ação de PR 2 e as parcerias 12 como a mesma ação AICCOPN) · 8 conteúdo (com o modelo Excel gratuito como isca e o SEO 7 como veículo). **O canal 10 (engenharia como marketing)** pontua ligeiramente acima do 8 (3,55 vs 3,50) mas exige construir uma ferramenta depois do lançamento: entra como primeiro item do anel médio e sobe se o artigo 05 tiver ≥ 100 visitas em 30 dias.

### Testes do anel interior

| Canal | Métrica de sucesso | Stop-loss | Orçamento máx. | Prazo | Resultado |
|---|---|---|---|---|---|
| **Contacto direto** (`marketing/launch/outbound.md`) | ≥ 8 % de respostas (≥ 4 em 50 contactos), ≥ 3 demonstrações e ≥ 1 compromisso de compra (Passe) | Com ≥ 40 contactos e ≤ 1 resposta (T1; falso alarme ≈ 16 % se o cenário base estiver certo): rever lista e mensagem. Abaixo de 40 contactos não se decide nada; qualquer oposição respeita-se de imediato | 0 € · ≤ 5 h/mês de contactos + ≈ 15 min por demonstração (≤ 10 em 30 dias) | Sinal informativo em L+14 (≈ 25 contactos, sem decisão); veredicto em L+30 | A preencher em `docs/10-growth.md` |
| **Newsletters e media do setor** (`launch/partners.md`) | ≥ 1 resposta positiva em 3 pedidos (AICCOPN, Construção Magazine, + 1) e ≥ 1 publicação em 30 dias | 0 respostas a 3 pedidos + 1 seguimento: mudar de ângulo (guia diferente) ou de destino | 0 € (nada de publicidade paga) · ≈ 15 min do fundador | L+30 | |
| **Conteúdo pt-PT** (LinkedIn + guias + modelo) | ≥ 300 visitas ao site e ≥ 5 pedidos de demonstração ou registos em 30 dias a partir do conteúdo (UTM `organic-social`/`organic-seo`) | < 100 visitas e 0 respostas de empresas-alvo depois de ≥ 12 publicações: reduzir para 1 publicação por semana e libertar as horas para o contacto direto | 0 € · ≈ 1,2 h em 30 dias (agendamento) | L+30 | |

Referência de plausibilidade: 300 visitas × 1,85 % (taxa visita→registo do cenário base, PRESSUPOSTO) ≈ 5,5 registos. **Depois do dia 28 (L+30):** decidir o canal vencedor (menor custo por demonstração com volume) e manter um segundo; registar em `docs/10-growth.md`.

## 6. SEO

- **Realismo:** num universo de ≈ 1 500 compradores nomeáveis, procura de pesquisa quase nula é o resultado esperado. Em 2026-11-28 o Google Suggest (pt-PT, `gl=PT`) devolveu só a própria frase para «medir áreas em pdf» e «pdf vetorial autocad», uma sugestão para «modelo de mapa de quantidades» e «autos de medição obra», e **nenhuma** para «mapa de quantidades pavimentos», «alternativa civils.ai» e «software medições obra». O SEO serve de **credibilidade** (quem recebe uma mensagem pesquisa a empresa) e de captação marginal. Volumes: `n/a` (sem ferramenta paga); dificuldade: baixa confiança (SERP só dos EUA). Medir em Search Console depois do lançamento.
- **Clusters:** A software de medição (3 páginas) · B mapa de quantidades (3) · C formato e escala do PDF (3) · D medições de pavimentos e redes (1), em `marketing/seo/clusters.md`. **SEO programático: rejeitado** (sem dados únicos por página; `marketing/seo/programmatic.md`).
- **10 briefs** (`marketing/seo/briefs/`, todos em pt-PT): 01 software para medir plantas PDF · 02 alternativa ao civils.ai (**bloqueado até revisão legal**) · 03 Bluebeam, Excel ou leitura vetorial · 04 modelo Excel de mapa de quantidades · 05 PDF vetorial ou digitalizado · 06 exportar PDF vetorial do AutoCAD · 07 escala em plantas PDF · 08 justificar cada quantidade · 09 estrutura do mapa de quantidades · 10 medir pavimentos, lancis e valetas. Mix: 4 fundo de funil, 3 meio, 3 topo. Nenhum fala de erros e omissões nem do CCP.
- **Checklist técnico entregue à integração:** título e descrição únicos por página e idioma (`landing.<idioma>.md`, `meta`); um só H1; `hreflang` pt/en e canonical; `sitemap.xml` e `robots.txt` (indexação só em produção, `NEXT_PUBLIC_INDEXABLE`); JSON-LD `Organization`, `SoftwareApplication` e `FAQPage` (FAQ da landing); imagens OG 1200×630 com o logótipo (hoje mostram a inicial «R», dívida n.º 7 do build); LCP ≤ 2,5 s; **rota de guias `/{locale}/guias/[slug]` com `Article`/`FAQPage` JSON-LD**: a starter não a tem (`features.blog = false`) e, sem ela, os artigos do calendário ficam bloqueados.

## 7. Calendário de conteúdo e redes sociais (30 dias)

- **Plataforma (1):** LinkedIn (conta pessoal do fundador, repetida na página da empresa). **Cadência:** 20 publicações em 30 dias (L-14 a L+15; 6 marcadas opcionais) · **Artigos:** ≥ 1 por semana a partir de L, bloqueados até existir a rota · **E-mail à lista:** só depois de L e só se houver ≥ 10 consentimentos (antes de L o site não está em produção).
- **Mix:** 12 valor · 5 produto · 3 história (60/25/15 %). Tabela completa: `marketing/social/calendar.md`; texto: `marketing/social/posts.pt.md`; imagens: `marketing/social/image-briefs.md` (nenhuma produzida: o produto ainda não tem interface). Vídeo (OpusClip): **não usado**; não há produto para gravar e não verifiquei o plano.
- **Fases:** L-14 a L-1 conversas e conteúdo de valor (sem lista) · L lançamento (publicação de abertura, contacto direto, site em produção) · L+1 a L+15 prova, tutoriais e respostas.

## 8. Lançamento — plataformas e horários (Europe/Lisbon)

Regras relidas em 2026-11-28 (Product Hunt: https://help.producthunt.com/en/articles/17834537-4-build-your-product-page; Show HN: https://news.ycombinator.com/showhn.html). **Reverificar no dia** de qualquer ação.

| Plataforma | Elegível / adequada? | Data/hora | Ficheiro | Tarefa |
|---|---|---|---|---|
| Product Hunt | Elegível depois de o produto funcionar de ponta a ponta, mas **público errado** e sem prova real: **adiado, reavaliar em L+60**; nunca relançar em 30 dias | não agendado | `marketing/launch/producthunt.md` (kit pronto) | — |
| Show HN | **Não elegível**: exige conta e e-mail, o público não é o alvo | — | `marketing/launch/showhn.md` (veredicto + folha de factos) | — |
| Reddit | Sem comunidade-alvo; r/estimators é EN e estrito; regras não lidas | — | `marketing/launch/reddit.md` | — |
| Indie Hackers | Opcional, depois de L+14, só com dados reais | — | `marketing/launch/indiehackers.md` | — |
| BetaList | **Não agora**: paga, público errado, orçamento 0 € | — | `marketing/launch/betalist.md` | — |
| Diretórios | Capterra/GetApp, SaaSHub, AlternativeTo (gratuitos segundo o playbook; **por verificar**: 403/404/bloqueio em 2026-11-28) | L+7 (2027-02-09) 10:00 | `marketing/launch/directories.md` | GTM-08 |
| LinkedIn (publicações) | Sim: canal do conteúdo | de L-14 a L+15, 08:30 | `marketing/social/posts.pt.md` | GTM-03 a GTM-07 |
| Contacto direto | Sim: canal principal | de L, 10:00, 2 lotes por semana | `marketing/launch/outbound.md` | GTM-10 a GTM-19 |
| AICCOPN / media setoriais | Sim | L+3 (2027-02-05) | `marketing/launch/partners.md` | GTM-09 |

## 9. Anúncios pagos

**Não ativados.** `paid_ads_budget_eur: 0`. `marketing/ads/test-plan.md` fixa as pré-condições e o desenho (teto 100 €/plataforma, ≤ 300 € no total, Google Search primeiro) para o dia em que o fundador aprovar orçamento.
- **CAC alvo:** em dinheiro ≈ 0; em tempo do fundador ≈ 24 h ≈ 479 € por cliente, **LTV:CAC 1,0 : 1 e retorno de 11 meses, abaixo das metas (3 : 1 e 6 meses)**, risco declarado em `docs/02-business.md` §6. Um teste pago só faz sentido com custo por pedido de demonstração ≤ ≈ 43 € (⅓ de um Passe 60).
- **Condições para começar:** analítica verificada ✖ (fase 09) · linha de base de conversão ✖ (≥ 200 visitas) · CAC alvo definido ✔ (condicional ao orçamento).

## 10. Parcerias, Portugal e ASO

- **Parcerias (10 candidatos):** `marketing/launch/partners.md`; só AICCOPN e Construção Magazine foram verificadas. **Afiliados:** n/a até ≥ 20 clientes pagantes e ativação ≥ 30 % (cenário base: ≈ 2 clientes aos 90 dias). **Referências no produto:** depois da ativação ≥ 30 %.
- **Portugal:** SEO em pt-PT escrito de raiz (palavras-chave não traduzidas); preços em euros; **IVA**: os preços do site são sem IVA e o texto é neutro («o IVA aplicável, se existir, é indicado no pagamento») até a tarefa fiscal do fundador decidir o regime (F1 isento, F2 normal; `docs/02-business.md` §4); **MB WAY/Multibanco: não planeados** (B2B, cartão via Stripe; a confirmar no checkout, não verificado); sazonalidade: o trabalho segue os concursos, não o calendário (a época do IRS e a Black Friday não se aplicam); imprensa e comunidades: AICCOPN e Construção Magazine; «feito em Portugal» só quando a identidade legal estiver preenchida; apoio em português por e-mail. Brasil: **não** é extensão de pt-PT; sem pt-BR.
- **ASO:** não aplicável (web).

## 11. KPIs e convenção UTM

**Estrela polar (PRD §8):** empresas pagantes ativas, isto é, com saldo ou subscrição e pelo menos 1 mapa exportado nos últimos 30 dias. Alvos do cenário base (PRESSUPOSTO, não promessas; 13,6 % de probabilidade de nenhum pagante em 90 dias).

| Fase | Métrica | Definição (evento) | Linha de base | Alvo semana 4 (L+30) | Dono |
|---|---|---|---|---|---|
| **Estrela polar** | Empresas pagantes ativas | saldo/subscrição + `map_exported` em 30 dias | n/a | 0–1 (base 0,6); dia 90 ≈ 2 | fundador |
| Aquisição | Visitantes por canal | `page_viewed` por `utm_source`/`utm_medium` | n/a | ≥ 300 visitas de conteúdo (§5) | Claude (leitura), fundador |
| Aquisição | Respostas ÷ contactos (R/C) | registo manual (`outbound.md` §6) | n/a | 8 % esperado; revisão só com ≥ 40 contactos e ≤ 1 resposta (T1) | fundador |
| Aquisição | Visita → registo | `page_viewed` → `signup_completed` (inclui `demo_requested`) | n/a | 1,85 % | Claude |
| Ativação | % de registos que chegam ao «aha» | `signup_completed` → `activation_reached` (folha real, ≥ 3 grupos, «Sim»/«Quase») | n/a | ≥ 50 % (PRD; o playbook pede ≥ 40 %) | Claude |
| Receita | Ativação → pago | `activation_reached` → `purchase_completed` | n/a | ≥ 40 % (PRD); receita ≈ 63 € no dia 30 | fundador |
| Retenção | Churn de contas e reembolsos | ver PRD §8 (≤ 10 %, reembolsos ≤ 5 %) | n/a | só mede a partir do dia 90 | Claude |
| Referência | Convites por utilizador ativo | n/a (sem programa de referência) | n/a | n/a | — |

**Funil de processo do contacto direto (PRD §8):** 50 contactos/mês → 8 % respondem → 60 % pedem demonstração → 60 % abrem conta com folha real → 50 % ativam → 40 % compram ⇒ 12 % dos que veem uma demonstração compram, 0,58 % dos contactos (3,5 clientes em 600 contactos por ano).

**Gatilhos de decisão pós-lançamento (T1 a T8, PRD §8) que este plano alimenta:** T1 (L+30: R ÷ C com C ≥ 40) · T2 (L+60: D ÷ R com R ≥ 8) · T3 (8 primeiras respostas à pergunta de confiança) · T4/T4b (20 primeiras folhas: raster e grupo dominante) · T5 (L+90) · T6 (L+180) · T7 · T8 (≥ 4 contas ativas: decidir horas). Cada disparo gera tarefa para o fundador; nada se decide abaixo da amostra mínima.

**Plano de eventos:** o do PRD §9 (`page_viewed`, `demo_requested`, `signup_started/completed`, `sheet_uploaded`, `trust_check_answered`, `activation_reached`, `map_exported`, `checkout_started`, `purchase_completed`, …), sem dados pessoais, após consentimento (exceto receita e segurança, no servidor). A starter só carrega o fornecedor de analítica; **eventos e objetivos personalizados e `utm_*` como propriedades entram na integração e verificam-se na fase 09**.

**UTM** (minúsculas, hífenes): `utm_source` = `linkedin` · `email` · `directory-<nome>` · `google` (inativo) · `partner-<nome>` · `utm_medium` ∈ `organic-social` · `social` (contacto direto) · `email` · `directory` · `organic-seo` · `cpc` (inativo) · `pr` · `utm_campaign` = `aaaamm-slug` (`202702-launch`, `202702-outbound`, `202702-welcome`…) · `utm_content` = id da publicação ou do e-mail (`p03`, `m2`, `w3`) · `utm_term` = palavra-chave (só pago). **Sem UTM** em ligações internas, no Product Hunt (`/ph`) nem em submissões a diretórios que as desaconselhem. Todas as ligações: `marketing/launch/links.csv`.

## 12. Cronograma

**L = 2027-02-02 (terça-feira) é uma proposta, não um compromisso.** Estado a 2026-11-28: apenas o esqueleto do site está pronto (nenhuma história construída; `docs/05-build.md`), o domínio não foi comprado, a identidade legal do fundador não existe, não há conta Stripe/Supabase/Vercel Pro/e-mail com domínio. L só vale se todos estes **portões** estiverem cumpridos em L-7 (2027-01-26); caso contrário **toda a tabela desloca-se em bloco** pelo número de semanas de atraso (não se lança com uma landing a prometer o que não existe).

| Portão (L-7) | Quem | Situação a 2026-11-28 |
|---|---|---|
| Build: US-01 a US-06, US-08 e US-12 em produção (Must = 30 unidades) e `06-qa` verde | Claude (build, qa) | por fazer |
| Páginas legais integradas, sem `[A PREENCHER PELO FUNDADOR]` | legal + fundador | rascunhos prontos; identidade legal por fazer |
| `rastoplan.com` comprado e DNS (HT-01); e-mail do domínio (`ola@`, `apoio@`, `privacidade@`) | fundador | por fazer |
| Estatuto fiscal e Stripe (modo de teste → ativo no go-live) | fundador | por fazer |
| Landing integrada com `landing.<idioma>.md`, evento `demo_requested`, rota `/ph` opcional | fullstack | por fazer |
| `legal-counsel`: contacto direto (RoPA-10), alegações, e-mails | legal | por rever |
| Go-live aprovado (`/lancar`, `go_live: approval`) | fundador | por fazer |

| Quando | Ação | Quem | Ficheiro / Tarefa |
|---|---|---|---|
| L-21 (12 jan) | Aprovar a lista dos 50 primeiros contactos e as mensagens | fundador | `launch/outbound.md` · GTM-01 |
| L-18 (15 jan) | Perfil e página do LinkedIn (depois de HT-02) | fundador | GTM-02 |
| L-15 / L-11 (18 e 22 jan) | Agendar publicações P01–P08 | fundador | `social/posts.pt.md` · GTM-03, GTM-04 |
| L-14 a L-1 | Publicações de valor; **sem lista nem e-mails** (o site ainda não está em produção) | fundador | `social/calendar.md` |
| L-7 (26 jan) | **Portões** verificados; se falharem, deslocar o plano | Claude + fundador | acima |
| L-1 (1 fev) | Agendar P09–P12 (após go-live aprovado) | fundador | GTM-05 |
| **L (2 fev)** | Site em produção; publicação de abertura; lote de contacto 1 | fundador | GTM-10 |
| L+2 a L+30 | Lotes 2–10 (2 por semana), seguimentos M4, demonstrações (≤ 10) | fundador | GTM-11 a GTM-19 |
| L+3 (5 fev) | Mensagem à AICCOPN; agendar P13–P17 | fundador | GTM-09, GTM-06 |
| L+7 (9 fev) | Fichas em diretórios (verificar preços e regras no dia) | fundador | GTM-08 |
| L+10 (12 fev) | Agendar P18–P20 | fundador | GTM-07 |
| L+14 | Primeiro sinal informativo (≈ 25 contactos, sem decisão) | Claude + fundador | `docs/10-growth.md` |
| L+30 (4 mar) | Revisão: T1, veredicto de canais, mês 2 | Claude + fundador | GTM-20 |
| L+60 | T2; reavaliar Product Hunt; comunicado só se houver ≥ 3 comparações reais | Claude + fundador | `press/` |

Prazos de espera: DNS e e-mail do domínio 1–2 dias; ficha de diretórios: revisão do diretório (dias).

## 13. Tarefas do fundador (em lote, ≤ 5 min cada)

Espelham o que o *checkpoint* deve acrescentar a `HUMAN_TASKS.md` (esta fase **não edita** esse ficheiro, que está a ser alterado pela fase `legal`; os IDs `GTM-xx` passam a `HT-xx`). 🟡 antes do lançamento · 🟢 depois. **20 tarefas, ≈ 100 min no total, tempo de demonstrações à parte** (≈ 15 min cada, ≤ 10 em 30 dias).

- GTM-01 🟡 · Aprovar a lista dos 50 primeiros contactos e as mensagens M1–M4 (depois da confirmação do `legal-counsel`) · ⏱ 5 min · 12 jan
- GTM-02 🟡 · Ajustar perfil pessoal e página da empresa no LinkedIn (texto de 30 palavras) · ⏱ 5 min · 15 jan
- GTM-03 🟡 · Agendar as publicações P01–P04 · ⏱ 5 min · 18 jan
- GTM-04 🟡 · Agendar as publicações P05–P08 · ⏱ 5 min · 22 jan
- GTM-05 🟡 · Agendar P09–P12, **só depois de o go-live estar aprovado** · ⏱ 5 min · 1 fev
- GTM-06 🟢 · Agendar P13–P17 · ⏱ 5 min · 5 fev
- GTM-07 🟢 · Agendar P18–P20 (P19 só com ≥ 3 demonstrações reais) · ⏱ 5 min · 12 fev
- GTM-08 🟢 · Verificar e submeter as fichas em Capterra/GetApp, SaaSHub e AlternativeTo (gratuitas) · ⏱ 5 min · 9 fev
- GTM-09 🟢 · Enviar a mensagem à AICCOPN (geral@aiccopn.pt) com o guia anexo · ⏱ 5 min · 5 fev
- GTM-10 a GTM-19 🟢 · Enviar os lotes de contacto 1 a 10 (5 mensagens por lote) · ⏱ 5 min cada · 2 por semana a partir de L
- GTM-20 🟢 · Revisão de L+30 com Claude · ⏱ 5 min · 4 mar

Tarefas **de outras fases** de que este plano depende (já abertas ou a abrir pelo *checkpoint*): HT-01 (domínio), HT-02 (contas sociais), estatuto fiscal e conta Stripe, e-mail com domínio, identidade legal.

## 14. Ativos produzidos

- [x] `marketing/copy/landing.pt.md` e `landing.en.md` (limites verificados por script; auditoria pt-PT limpa) · `messaging.md`
- [x] `marketing/seo/` (`keywords.csv` com 37 linhas, `clusters.md`, `programmatic.md`, 10 briefs)
- [x] `marketing/social/` (`calendar.md`, `posts.pt.md` com 20 publicações, `image-briefs.md`; **sem imagens produzidas**)
- [x] `marketing/email/` (`welcome`, `onboarding`, `conversion`, `winback`, em pt-PT)
- [x] `marketing/launch/` (`outbound.md`, `producthunt.md`, `showhn.md`, `reddit.md`, `indiehackers.md`, `betalist.md`, `directories.md`, `partners.md`, `schedule.md`, `links.csv`)
- [x] `marketing/press/` (kit, rascunho de comunicado, propostas, destinos) · `marketing/ads/test-plan.md` (adiado)
- [ ] **Marcadores por preencher** (nos ativos escrevem-se com chaves duplas; aqui entre ‹ ›): `‹domain›` (= `https://rastoplan.com` depois de HT-01) · `‹fundador_nome›` e dados do fundador (`FOUNDER.md` não os tem) · `‹data›` (L) · identificação legal da empresa · `‹fonte›` na linha de informação de dados · `‹folhas_restantes›`, `‹novidade_curta›`, `‹lista_de_novidades_reais›` nos e-mails · captura de ecrã da folha «Rasto» (depois do QA)

### Pedidos às outras fases

- **Integração / construção:** copiar `landing.<idioma>.md` para `src/content/{pt,en}.ts` e `site.ts` (chaves da starter; corre o lint e a auditoria pt-PT do playbook); evento `demo_requested`; rota `/ph` (opcional); **rota de guias `/{locale}/guias/[slug]`** e entradas no sitemap; imagem OG com o logótipo; linha opcional de preço de fundador (`FOUNDER_PRICE_SLOTS`); modelo Excel descarregável (artigo 04); **candidato a funcionalidade futura:** verificador de PDF vetorial no navegador.
- **`legal-counsel`:** confirmar o contacto direto (RoPA-10 e a linha de informação do art. 14.º), a exclusão de empresários em nome individual do e-mail frio, a página de comparação com o civils.ai (artigo 02), os e-mails de onboarding e conversão, e a retenção citada em `winback`. Decisão do `gtm` para `legal/subprocessors.md`: **registo de contactos em ficheiro privado, sem SaaS**, logo sem novo subcontratante.
- **Lançamento (09):** reverificar preços de diretórios, regras de plataformas e limites do LinkedIn; ligar a analítica e os eventos; abrir a avaliação de 5 folhas se a landing a anunciar.
- **Crescimento (10):** KPIs, UTM, calendário, backlog de briefs, veredicto de canais em L+30.

## 15. Riscos e pressupostos

| Risco/pressuposto | Impacto | Como testar |
|---|---|---|
| **A1: empresas portuguesas pagam 129 € por concurso (ou 49–199 €/mês)**; nenhum pagamento por medição assistida foi observado em Portugal | Alto: sem isto o negócio não existe | Pergunta de disposição a pagar nas primeiras 20 demonstrações, 3 braços de preço (`outbound.md` §5); T5 a L+90 |
| **O motor não separa grupos em plantas reais** (G-GEO inconclusivo, ADR 0006): a demonstração pode falhar à frente do prospeto | Alto: destrói a confiança, que é o produto | T3 (8 primeiras respostas), T4/T4b (20 folhas); **fazer a 1.ª demonstração com uma folha sintética e a 2.ª com uma folha real de um prospeto amigo, antes do lote 1**; folhas reais pedidas ao fundador (tarefa K da arquitetura) |
| O fundador não tem audiência própria e 5 h/semana: o LinkedIn orgânico pode não chegar a ninguém | Médio: o conteúdo rende pouco | Stop-loss do §5; cortar para 1 publicação por semana e passar as horas ao contacto direto |
| Contacto direto: compliance (empresas individuais, art. 13.º-A da Lei 41/2004, LinkedIn contra automatização) e baixa taxa de resposta (< 8 %) | Médio-alto: sanção ou canal fechado | Só pessoas coletivas, manual, 2 toques, oposição imediata; revisão do `legal-counsel` antes do lote 1; T1 só com ≥ 40 contactos |
| Pesquisa e SERP de Portugal inspecionados com ferramentas só dos EUA; dificuldade e volumes de SEO sem confiança | Médio | Search Console depois de L; reabrir `keywords.csv` em L+30 |
| Mensagens com alegações que o produto ainda não suporta (IA, precisão, erros e omissões, «5 folhas grátis» se a avaliação não abrir) | Alto: confiança e lei | Registo de alegações em `messaging.md` §6; reconferir na fase 09 contra o produto em produção |

## Registo de decisões do `gtm`

| # | Decisão (reversível) | Alternativas | Porquê |
|---|---|---|---|
| D-GTM-1 | Modo `waitlist`: CTA «Pedir demonstração»; variante `live` preparada | Abrir já com «Começar grátis» | O funil do PRD é demonstração → folha real → compra; a avaliação só faz sentido com o fluxo completo em produção |
| D-GTM-2 | Canal principal = contacto direto pelo fundador; SEO e redes como apoio | SEO primeiro (playbook por tipo `ai-app`: SEO + plataformas de lançamento + comunidades) | Universo de ≈ 1 500 contas, pesquisa quase nula, sem comunidade verificada; plataformas de lançamento não têm o público-alvo |
| D-GTM-3 | `en`: só landing (e legal); tudo o resto em pt-PT | Duplicar posts, e-mails e briefs em inglês | Regra do playbook: um idioma com < 15 % do tráfego esperado leva só landing e legal; o mercado é Portugal |
| D-GTM-4 | Sem Product Hunt, Show HN, Reddit, BetaList no lançamento | Lançar em todas | Elegibilidade (Show HN), público errado, orçamento 0 € (BetaList), um lançamento único gasto sem prova |
| D-GTM-5 | 1 plataforma social (LinkedIn) | 2 plataformas | 5 h/semana; ICP em B2B no LinkedIn |
| D-GTM-6 | `L = 2027-02-02` condicionado a portões | Data fixa | O produto ainda não está construído; a data é só uma âncora |
| D-GTM-7 | Registo de contactos em ficheiro privado (sem SaaS) | CRM gratuito | Evita subcontratante e custo; 50 contactos/mês cabem numa folha de cálculo |
| D-GTM-8 | Conteúdo sem erros e omissões, CCP, IA, percentagens | Usar o gancho legal | PRD §7 regras 1 e 2 |
| D-GTM-9 | Artigos e modelo Excel só quando existir a rota; ferramenta gratuita só depois do lançamento | Construir já | Fora do âmbito do `gtm`; custa unidades de construção |

## Autoavaliação adversarial (a repetir pelo `devils-advocate`)

Este agente não dispõe de ferramenta para lançar subagentes: o orquestrador deve correr o `devils-advocate` sobre o posicionamento, o ICP, o ranking de canais e a landing **antes do *checkpoint***. Objeções que eu próprio levantaria, e o estado de cada uma:

1. *«O plano assume que o motor funciona em plantas reais; se falhar na 1.ª demonstração, o canal principal morre.»* — Aceite; está no §15 e a mitigação (ensaiar antes do lote 1) é condição, não sugestão.
2. *«A landing pede demonstração a um comprador cético que não quer falar com ninguém.»* — Em modo `live` a variante dá 5 folhas sem falar com ninguém; fica para a fase 09 por decisão D-GTM-1. Risco assumido: a demonstração é o canal do PRD.
3. *«Sem IA nem precisão na mensagem, o que sobra é «rasto». Será suficiente?»* — É a cunha do nome e do PRD; é hipótese até haver entrevistas. Não há dado que a refute nem que a sustente.
4. *«20 publicações em 30 dias para um fundador sem audiência é desperdício.»* — Por isso 6 são opcionais, há stop-loss e o contacto direto tem prioridade nas horas.
5. *«O preço comparado com o civils.ai é o melhor argumento e foi bloqueado.»* — O PRD §7 regra 3 exige revisão legal e as conversões de moeda do concorrente (sem código de moeda) são frágeis; fica no artigo 02, após revisão.
6. *«Todas as pontuações do Bullseye são subjetivas.»* — Verdade: etiquetadas como julgamento; o que decide são os testes e os stop-losses.
