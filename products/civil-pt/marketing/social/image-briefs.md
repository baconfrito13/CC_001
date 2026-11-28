# Briefs de imagem — Rastoplan

> Marca: `brand/tokens.json` (barro `#a63d0f`, texto `#1f1a17`, fundo `#fdfbf8`; modo escuro `#f08a5b` sobre `#17120f`), logótipo `brand/logo.svg`, pilha de sistema (sem fontes externas). Tamanhos: LinkedIn 1200×627 (paisagem) ou 1080×1350 (retrato) ou 1080×1080 (quadrado); OG 1200×630. Produção: Figma MCP (`use_figma`, depois de carregar a skill `figma-use`) ou capturas Playwright do produto real em `/opt/pw-browsers/chromium`. **Nenhuma imagem foi produzida nesta fase**: o produto ainda não tem interface e os cartões de conceito não acrescentam valor sem as capturas reais. Texto nas imagens em pt-PT, impessoal; nada de percentagens, «IA» ou promessas fora de `copy/messaging.md` §6. Acessibilidade: cada imagem tem texto alternativo na publicação.

| ID | Usada em | Formato | Conteúdo e layout | Origem |
|---|---|---|---|---|
| IB-01 | P06 | 1080×1350 | Título «O que o Rastoplan não mede» e duas colunas: ✓ «Mede» (áreas, perímetros, comprimentos em planta de PDF vetorial) · ✕ «Não mede» (DWG, imagens e digitalizados, volumes que dependem de perfis, cotas e declives). Rodapé: logótipo + rastoplan.com | Figma, só texto |
| IB-02 | P02 | 1080×1350 | Dois recortes ampliados da mesma folha sintética lado a lado: «Vetorial: linha nítida» vs «Imagem: pixéis em escada». Legenda curta | Folha sintética gerada por `scripts/gen-fixtures` da app; capturas Playwright |
| IB-03 | P03, P16 | 1080×1080 | Esquema «Capítulo > Artigo > Unidade» com um exemplo de pavimento (artigo, unidade m², quantidade) | Figma |
| IB-04 | P07 | 1080×1080 | Uma linha de Excel: «Quantidade 128,4 m²» → «Folha 3» → «Grupo Lancil» → «Escala 1:200», rotulada «Exemplo ilustrativo» | Figma; trocar por captura real depois do QA |
| IB-05 | P10 | 1200×627 | Cartão de lançamento: logótipo, «Cada quantidade, com rasto até à folha», rastoplan.com; sem capturas | Figma |
| IB-06 | P12 | 1080×1350 | Captura real da folha «Rasto» no Excel (dados da folha sintética de exemplo, nunca de cliente) com 2 chamadas anotadas | Playwright + Figma; **depois do QA** |
| IB-07 | P14 | 1080×1080 | Tabela dos 3 Passes e 3 subscrições com preços sem IVA; tem de coincidir com `site.ts` | Figma; gerar a partir de `site.ts` |
| IB-08 | P18 | 1080×1080 | Esquema de uma área com 2 recortes: contorno exterior − recortes = área útil (números ilustrativos) | Figma |
| IB-OG | Todas as páginas | 1200×630 | A starter gera a imagem OG com `next/og` e mostra hoje a inicial «R» em vez do logótipo (dívida n.º 7 de `docs/05-build.md`): pedir à integração para usar `brand/logo.svg` e a tagline do idioma | `app/src/app/**/opengraph-image` |

Alt text (exemplo IB-01): «Duas colunas: o que o Rastoplan mede (áreas, perímetros e comprimentos em planta de PDF vetorial) e o que não mede (DWG, imagens, digitalizados, volumes que dependem de perfis).»
