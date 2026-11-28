# Clusters de tópicos — Rastoplan (pt-PT)

> Método gratuito: autocomplete pt-PT (`gl=PT`, 2026-11-26 e 2026-11-28), vocabulário do `docs/research/audience.md`, sitemaps e H1/H2 de concorrentes (a fazer na redação). **Limite assumido:** a pesquisa web da fábrica é só dos EUA e devolve páginas brasileiras para consultas portuguesas; a dificuldade é «baixa confiança» e o volume é «n/a» em todas as linhas. Num universo de ≈ 1 500 compradores nomeáveis, procura de pesquisa zero é o resultado esperado (lição de 2026-11-26): o SEO aqui serve de **prova de credibilidade** (o comprador que recebe uma mensagem vai ao Google ver quem somos) e de captação marginal, não de canal principal. Medir em Search Console após o lançamento.
>
> **Restrições de conteúdo:** nenhum artigo fala de erros e omissões, art. 50.º do CCP ou «verificação do mapa do dono de obra» (PRD §7 regra 2); nenhum promete precisão, IA ou «poupa X horas»; comparações com concorrentes só factuais, datadas e revistas pelo `legal-counsel`.
>
> **Dependência técnica:** a starter não tem rota de conteúdo (`features.blog = false` em `site.ts`). Os artigos só se publicam quando a integração criar `/{locale}/guias/[slug]` (MDX ou Markdown, com `Article`/`FAQPage` JSON-LD, entradas no sitemap, hreflang só com `pt`). Até lá, o calendário marca-os como «bloqueado: rota».

## Pilar A — Software de medição de plantas PDF (comercial, fundo de funil)
Pilar: **A1 · Software para medir plantas em PDF: o que procurar** (brief 01).
Cluster: A2 · Medir plantas em PDF: Bluebeam, Excel ou ferramenta vetorial (03) · A3 · Alternativa ao civils.ai em português e em euros (02, após revisão legal) · A4 (futuro) · Rastoplan vs. medir à mão: método de comparação a registar com clientes (só depois de ≥ 3 comparações reais).

## Pilar B — Mapa de quantidades: estrutura e modelo (transacional/informativo)
Pilar: **B1 · Estrutura de um mapa de quantidades: capítulos, artigos e unidades** (09).
Cluster: B2 · Modelo Excel de mapa de quantidades (04), com descarregamento gratuito e a mesma estrutura do export do Rastoplan · B3 · Como justificar cada quantidade de um mapa (08) · B4 (futuro) · Glossário de medições (artigo, capítulo, unidade, auto de medição), 12–20 entradas.

## Pilar C — Formato e escala: o PDF certo para medir (informativo, ligado à objeção «só vetorial?»)
Pilar: **C1 · Como saber se um PDF de planta é vetorial** (05).
Cluster: C2 · Como exportar um PDF vetorial a partir do AutoCAD (06) · C3 · Escala em plantas PDF: como confirmar antes de medir (07) · C4 (futuro) · Folhas com escalas mistas: o que fazer (o produto não as suporta no MVP, PRD §5.5).

## Pilar D — Medir obras de pavimentos, arranjos exteriores e redes (segmento-alvo)
Pilar: **D1 · Medir pavimentos, lancis e valetas em planta: o que a planta não diz** (10).
Cluster: D2 (futuro) · Áreas com recortes e furos: como se medem · D3 (futuro) · Tubagens e condutas em planta vs. em perfil · D4 (futuro) · Checklist antes de medir um concurso (versão da peça, escala, legenda).

**Ligação interna:** cada artigo liga ao pilar do seu cluster, a dois irmãos e a `/pt/precos`; o CTA único é «Pedir demonstração» (ou «Começar com 5 folhas grátis» em modo live). Pilares D e C são os que o comprador-alvo reconhece; o B capta os independentes (segmento 3, edifícios).

## Ferramentas gratuitas propostas (engenharia como marketing — backlog, não construído)
1. **Verificador de PDF vetorial** (no navegador, sem enviar o ficheiro): diz se cada página é vetorial ou imagem e quantos elementos tem. Responde à objeção n.º 1 do funil e usa `pdfjs-dist`, já na stack; **o ficheiro não sai do computador** (alinhado com a mensagem de privacidade). Gatilho: depois do lançamento, se o artigo 05 tiver ≥ 100 visitas em 30 dias ou ≥ 3 conversas pedirem isto. Tamanho estimado: M.
2. **Modelo Excel de mapa de quantidades** (descarregamento direto, sem registo): a estrutura do artigo 04. Tamanho: S, sem código.
Nenhuma é construída por esta fase; ficam como pedido à integração/crescimento.
