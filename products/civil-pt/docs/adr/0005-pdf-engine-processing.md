# ADR 0005 — Motor de PDF, processamento assíncrono e armazenamento de geometria

> **Estado:** accepted · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente) · **Relacionado:** US-02, US-04, US-05, ADR-0002, ADR-0006, `docs/04-architecture.md` §4, §15, §16.3

## Contexto

O PRD exige: extrair a geometria vetorial exata de PDF de CAD (≤ 20 MB A1 para a latência; até 50 MB e 40 páginas), converter a escala, amostrar curvas, detetar raster e agrupar, **fora do pedido do utilizador e com estado visível** (US-04 critério 5: o trabalho continua se o separador fechar); revê-lo na folha com realce de dezenas de milhares de elementos em ≤ 300 ms (US-05); PDF até 50 MB que **não passa pela aplicação** (limite de 4,5 MB por pedido nas funções da Vercel). **PyMuPDF (AGPL) está excluído** (PRD §10). Nenhuma receita cobre processamento pesado.

## Fatores de decisão

1. Exatidão e cobertura de PDF de CAD (transformações, formulários, curvas, tracejados).
2. Um só motor para extrair e desenhar (coerência de coordenadas e custo de manutenção).
3. Licença permissiva e manutenção ativa.
4. Custo e simplicidade operacional (≈ 6 contas ativas).
5. Segurança perante PDF não confiável.

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo mensal a 0 / 100 / 10k | Lock-in / saída | Fonte |
|---|---|---|---|---|---|---|
| A — `pdfjs-dist` (Apache-2.0) em Node, no servidor, + o mesmo no navegador | `getOperatorList()` → caminhos, estilos, CTM | Um motor; Node sem canvas; **spike S1: 50 000 elementos em 0,55 s (RSS 249 MB), áreas e comprimentos exatos** | Formato interno de `constructPath` mudou entre majores e `DrawOPS` não é exportado → fixar versão e testes de contrato; furos (S6) por tratar | €0 de software; computação ≈ €0 / €1 / ≈ €610 | Baixo (formato próprio de pacote) | npm 6.5.438 (2026-11-01); spikes S1–S3 |
| B — `pdfminer.six` em função Python | Extração em Python (usada no spike da pesquisa) | Licença MIT; polígono de controlo exato para retas | Segundo *runtime*; lento em folhas grandes; **devolve o polígono de controlo das curvas Bézier (−10 % num círculo)**; viewer continuaria a ser pdf.js | €0 / €1 / ≈ €700 | Médio | `research/risks.md` S27 |
| C — PyMuPDF | Rápido e completo | AGPL: exige licença comercial ou abrir o código | **Excluído** | — | — | PRD §10 |
| D — Contentor dedicado com motor nativo (PDFium/MuPDF comercial) | Processa fora das funções | Sem limites de função | Segundo *deployable*; custo e operação fora do orçamento | ≈ €50 / €55 / ≈ €1 300 | Baixo | — |

Pontuação 1–5 (exatidão · motor único · licença/manutenção · custo/operação · segurança): **A = 5·5·5·5·4 = 24 · B = 4·2·4·3·4 = 17 · D = 5·2·3·2·4 = 16**; C excluído.

## Decisão

**Escolhemos A.** Regras:

1. **Fixar `pdfjs-dist` na versão exata `6.5.438`** (Node ≥ 22.13), sem `@napi-rs/canvas` no servidor (funciona sem; avisos inofensivos) e `isEvalSupported:false`. **Teste de contrato** na CI: PDF fixo → totais exatos; uma atualização que o quebre não passa.
2. **Upload direto:** `POST …/documents` cria o registo e devolve um URL assinado; o navegador envia o PDF ao *bucket* privado `uploads`; `POST /api/documents/:id/finalize` revalida **no servidor** `%PDF-`, tamanho, ≤ 40 páginas, deteta a escala (texto «ESC. 1/100»), cria as `sheets` ou apaga o objeto (PDF não confiável: SR-04/05).
3. **Fila em Postgres:** `POST /api/sheets/:id/process` reserva a folha (`reserve_sheet`), marca `queued` e chama `after(drain)` com `maxDuration = 300`; `claim_next_sheet` usa `FOR UPDATE SKIP LOCKED`; um *cron* da Vercel (1/min, Pro) volta a despachar folhas `queued` e liberta `processing` > 5 min (o `after()` pode perder-se se a instância for reciclada). O estado é lido por sondagem de 3 s sob RLS (sem Realtime).
4. **Pacote de geometria v1** (bucket privado `geometry`, gzip): cabeçalho JSON (versão, folha, dimensões, tabela de grupos) + arrays binários (elemento → grupo, deslocamentos, coordenadas `Float32` em pontos de página). **Independente do agrupamento** (ADR 0006): a estratégia `style` ou `selection` só preenche o mapa elemento → grupo. Quantidades em `numeric` na BD, calculadas em dupla precisão (1 pt = 25,4/72 mm de papel × escala).
5. **Navegador:** o mesmo `pdfjs-dist` desenha a folha (descarga por URL assinado ≤ 600 s, *range requests*) e uma *canvas* por cima desenha o realce a partir do pacote; miniaturas geradas no cliente, sem persistência.
6. **Recusas sem custo:** 0 elementos vetoriais com imagens → `unsupported_raster`; grupo dominante ≥ `LOW_DIVERSITY_SHARE` (0,9, ajustável) → `low_diversity`; falha interna → `failed`; todas libertam a reserva.

## Consequências

- **Positivas:** coordenadas coerentes entre servidor e navegador; custo €0 em software; processamento por folha ≈ segundos; nenhum ficheiro passa pela aplicação.
- **Negativas / custos aceites:** dependência de um formato interno do `pdfjs-dist` (versão fixa + contrato); furos e tramas pesadas por validar em folhas reais (S6, G-GEO); `after()` depende de despacho por *cron*.
- **Riscos e mitigação:** PDF de abuso → tetos de elementos (`PROCESSING_MAX_ELEMENTS=500 000`), tempo e memória; instância partilhada → limite de 2 folhas por instância; p95 > 63 s → subir memória/`maxDuration` (ADR 0002).
- **Impacto noutras fases:** legal: o PDF nunca sai da UE nem vai a IA · qa: fixtures de abuso e carga (50 000 elementos × 20 execuções) · build: spikes S6, S9, S10.

## Como verificamos

US-04 critérios 1–6 e US-05 critério 6 (p95 ≤ 300 ms) em e2e e carga; teste de contrato do `pdfjs-dist`; fixtures de abuso em `06-qa`.

## Revisitar quando

p95 de processamento > 63 s ou RSS > 1,4 GB (contentor dedicado, novo ADR); `pdfjs-dist` descontinuado ou formato incompatível; > 30 % das folhas com furos mal medidos.

## Referências

- npm `pdfjs-dist` 6.5.438 (Apache-2.0; engines Node ≥ 22.13) — acedido em 2026-11-28
- https://vercel.com/docs/functions/limitations e https://nextjs.org/docs/app/api-reference/functions/after — acedidos em 2026-11-28
- https://supabase.com/docs/guides/storage/uploads/standard-uploads — acedido em 2026-11-28 (URL assinado de upload; recomenda resumable > 6 MB)
- `products/civil-pt/docs/research/risks.md` (spike S27, limite das Bézier)
