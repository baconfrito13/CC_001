# ADR 0006 — Agrupamento: resultado do gate G-GEO (inconclusivo) e regra de decisão

> **Estado:** accepted (provisório) · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente); regra do `02-product.md` §5.2 · **Relacionado:** OB-1, US-04, US-05, US-20, T4/T4b, ADR-0005

## Contexto

O PRD (§5.2) manda a arquitetura testar, antes de construir US-04 e US-05, ≥ 10 PDF de peças desenhadas de ≥ 6 procedimentos portugueses, com critérios C1 a C5 escritos antes dos dados: caminho **A** (agrupar por estilo) ou **B** (seleção por clique e região, US-20) ou *inconclusivo* (C1 falha). O teste é de graça e sem tarefa do fundador, mas depende de o agente conseguir **obter folhas de planta reais**.

## Fatores de decisão

1. Não gastar 16 unidades de construção sobre uma premissa por testar.
2. Não bloquear o produto à espera de dados que o ambiente não consegue obter.
3. Manter barata a mudança A → B.
4. Seguir a regra do PRD para o caso «inconclusivo».

## Evidência recolhida (2026-11-28)

**Spikes sintéticos (S1–S3):** a extração é exata (área 102,300 m², comprimento 40,000 m, círculo −0,06 %), rápida (50 000 elementos em 0,55 s) e a deteção de raster funciona. Não prova nada sobre estilos em plantas reais.

**Tentativa com folhas reais (S5).** Pesquisa na web (só EUA; devolve sobretudo páginas brasileiras: lição já registada) e `curl` a sites públicos de municípios, plataformas e comunicações: 7 PDF obtidos de 7 fontes distintas (237 páginas, **todas A4**), analisados com o extrator do S1 (por página: elementos, estilos distintos, % do maior grupo, G90, % fechados, imagens):

| Fonte (pública) | Tipo | Páginas | Resultado |
|---|---|---|---|
| Município de Peniche | projeto de execução, rede de drenagem (peças escritas) | 12 | texto com figuras; ≤ 617 elementos, 1 estilo; **sem folha de planta** |
| Plataforma Vortal (descarga pública) | projeto da rede predial de águas residuais e pluviais | 20 | memória e cálculos; as 4 últimas páginas têm 43–173 elementos e 6–13 estilos (esquemas, não plantas) |
| Município de Sines | memória descritiva | 6 | texto |
| Município da Amadora | condições técnicas especiais, concurso 17/2023 | 60 | texto; ≤ 83 elementos/página |
| Município de São João da Madeira | desenho urbano e reordenamento de tráfego | 32 | 29 páginas com 0–1 elementos (texto e imagens); 3 com 35–53 elementos |
| Plataforma Vortal | **mapa de quantidades** (urbanização, Oeiras) | 87 | tabela; serve só ao M7 |
| Município do Montijo | proposta de câmara | 16 | texto e imagens |

Falharam: Lisboa (403), Almodôvar (resposta HTML), Águas de Coimbra e Lamego (404), Vila do Conde (sem ligação), Salvaterra de Magos (503). As plantas dos concursos ficam nas plataformas de contratação (Vortal, AcinGov, Saphety), com registo.

**M7 (um só procedimento, extração por expressão regular, indicativa):** no mapa de Oeiras, de ≈ 819 linhas com unidade, ≈ 48 % são `m`, `m²` ou `un` (medíveis em planta) e ≈ 52 % são `m³` (escavação, aterro e betão, que dependem de perfis). Coerente com o PRD §2 (o MVP mede só o que se mede em planta) e **insuficiente** para decidir a mensagem «infraestruturas» vs. «pavimentos e arranjos exteriores».

**Resultado do gate:** C1 falha (0 folhas de planta de 0 procedimentos) → **inconclusivo**. Nem C2 a C5 nem M2 a M8 são calculáveis. (Isto não é um resultado negativo sobre o agrupamento.)

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo | Fonte |
|---|---|---|---|---|---|
| A — Seguir por **A** (estilo) com risco aceite e medido | Regra do PRD para «inconclusivo»: construir o núcleo comum; seguir por A | Cumpre o Must; US-04 critério 6 e T4/T4b detetam o problema com dados reais | Se os estilos não separarem, 8 unidades de UI de revisão ficam parcialmente inúteis | €0 | PRD §5.2 |
| B — Seguir por **B** (seleção) já | Mais perto do Bluebeam | Funciona mesmo com um estilo só | +3 unidades (US-20); perde o valor de «poucos grupos em minutos» | €0 | PRD §5.2 |
| C — Esperar pelas folhas | Bloquear o WP-06 | Nenhum risco técnico | Bloqueio por tempo indeterminado, sem agente capaz de desbloquear | atraso | — |

Pontuação 1–5 (cumpre PRD · risco · tempo): **A = 4·3·5 = 12 · B = 3·4·3 = 10 · C = 2·5·1 = 8**.

## Decisão

**Escolhemos A, com a regra do PRD para o resultado inconclusivo:**

1. **Construir primeiro o núcleo comum** (WP-05a: extração, CTM, curvas, escala, raster, pacote de geometria). O pacote guarda a geometria **sem depender do agrupamento**; `GroupingStrategy` (`style` por omissão, `selection` pronta) preenche o mapa elemento → grupo.
2. A interface de revisão (WP-06) arranca depois do núcleo verde e do regresso ao gate com **qualquer folha real que entretanto exista** (por exemplo as primeiras demonstrações ou a tarefa opcional K); se, 4 h de agente depois do núcleo, continuar inconclusivo, **segue-se por A com o risco aceite**.
3. O risco é medido em produção: `sheet_low_style_diversity` > 40 % das folhas vetoriais (T4b) sobe US-20 a Must; `sheet_unsupported_raster` ≥ 11 em 20 (T4) cria tarefa 🔴 de decisão.
4. O PRD decide a mensagem pelo M7; **até haver M7 com ≥ 6 procedimentos, a mensagem fica em «pavimentos e arranjos exteriores»** (a formulação mais estreita do PRD).

## Consequências

- **Positivas:** não bloqueia; a mudança para B reaproveita o pacote e o motor; as folhas sem separação por estilo não gastam saldo (US-04 critério 6).
- **Negativas / custos aceites:** a premissa A4 (estilos separam folhas reais) segue sem prova; a primeira prova real chega só com clientes ou demonstrações.
- **Riscos e mitigação:** se T4b dispara, +3 unidades (US-20) e o Corte 1 (retirar a subscrição) do PRD §5.1.
- **Impacto noutras fases:** build: `GroupingStrategy` e fixtures de «estilo pobre» · gtm: não alegar «infraestruturas» · qa: fixtures sintéticas de 95 % no mesmo estilo · fundador: tarefa K (opcional).

## Como verificamos

Fixtures sintéticas de US-04 (6); métricas T4/T4b nas primeiras 20 folhas; repetição do gate G-GEO (C1–C5) assim que existirem ≥ 10 folhas reais de ≥ 6 procedimentos (`docs/10-growth.md`).

## Revisitar quando

Houver ≥ 10 folhas de planta reais, ou as 20 primeiras folhas de clientes derem T4b > 40 % ou raster ≥ 11.

## Referências

- `products/civil-pt/docs/02-product.md` §5.2, §8 (T4, T4b)
- Fontes da tabela acima, acedidas a 2026-11-28 (uso interno de teste; os PDF ficaram em `$SCRATCH`, fora do repositório)
