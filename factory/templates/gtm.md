# Go-to-market — {{name}}

<!-- Template for docs/08-gtm.md, written by the gtm phase (factory/playbooks/08-gtm.md). Language: pt-PT (founder-facing). Fill every section with evidence (source + date) or write "a confirmar" and open a founder task. Delete all guidance comments and every {{...}} placeholder when done (grep before closing the phase). Customer-facing copy does NOT live here: it lives in marketing/ in each target locale; this document points to it. Nothing is posted by Claude: every public action is a founder task with a time. -->

> **Slug:** `{{slug}}` · **Modo:** `{{waitlist | live}}` · **Idiomas:** {{en, pt-PT}} · **Lançamento (L):** {{data prevista}} · **Domínio:** `{{domínio}}` · **Atualizado em:** {{date}}

## 1. Resumo

<!-- 5 lines max: who it is for, the promise, the winning channel hypothesis, the budget, the launch date. -->
- **Para quem:** {{ICP numa frase}}
- **Promessa:** {{proposta de valor em ≤ 12 palavras}}
- **Canais a testar:** {{1}}, {{2}}, {{3}}
- **Orçamento de experiências:** {{0 | 100 | 300}} € (gastos só com a tua aprovação)
- **Lançamento:** {{data}}, plataforma principal {{Product Hunt | Show HN | comunidades | loja}}

## 2. Posicionamento (método April Dunford)

<!-- Fill the 5 components from research (competitors.md, audience.md). Each row needs evidence (S# or URL + date). The statement must pass the 5-second test. -->

| Componente | Resposta | Evidência |
|---|---|---|
| Alternativas à nossa solução | {{3–6, incluindo «não fazer nada»}} | {{S#}} |
| Atributos únicos | {{factos, não adjetivos}} | {{PRD must-have #}} |
| Valor que esses atributos criam | {{resultado + prova}} | {{S#}} |
| Clientes que mais valorizam | {{segmento principal}} | {{S#}} |
| Categoria de mercado | {{enquadramento que torna o valor óbvio}} | {{teste dos 5 segundos}} |
| Tendência relevante | {{uma linha}} | {{URL, data}} |

**Frase de posicionamento:** Para {{cliente}} que {{necessidade}}, o {{Produto}} é um {{categoria}} que {{valor}}. Ao contrário de {{alternativa}}, {{diferenciador}}.

## 3. Cliente ideal (ICP) e persona

<!-- One page. Include trigger events, where they hang out, top 5 objections and the anti-ICP. -->
- **Quem:** {{papel/situação, dimensão, país e idioma}}
- **Acontecimentos que desencadeiam a procura:** {{...}}
- **Trabalho a realizar:** {{quando…, quero…, para…}}
- **Solução atual e custo:** {{...}}
- **Orçamento e quem paga:** {{...}}
- **Onde encontrar:** {{comunidades, newsletters, criadores, pesquisas, eventos}}
- **Objeções:** 1) {{}} 2) {{}} 3) {{}} 4) {{}} 5) {{}}
- **Fora do alvo (anti-ICP):** {{...}}

## 4. Hierarquia de mensagens

<!-- Detail in marketing/copy/messaging.md. Only proof that exists today; everything else "a obter após o lançamento". -->

1. **Proposta de valor:** {{}}
2. **Três pilares:** {{benefício + prova + funcionalidade}} / {{}} / {{}}
3. **Prova disponível:** {{números, demonstrações, fontes}}
4. **Respostas às objeções:** ver `marketing/copy/messaging.md`
5. **Boilerplates (10/30/60 palavras):** ver `marketing/copy/messaging.md`

## 5. Canais — Bullseye (19 canais)

<!-- Score 1–5: Fit with ICP (30%), Reach (20%), Speed to signal ≤ 30 days (20%), Cost-efficiency (15%), Executable by Claude (15%). Inner ring = top 3 (≥ 1 free, ≤ 1 paid). Keep this table to the 19 rows. -->

| # | Canal | Ideia para este produto | Fit | Alcance | Rapidez | Custo | Claude | Total | Anel |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Marketing viral | {{}} | | | | | | | |
| 2–19 | {{restantes canais do playbook, uma linha cada}} | | | | | | | | |

### Testes do anel interior

| Canal | Métrica de sucesso | Stop-loss | Orçamento máx. | Prazo | Resultado |
|---|---|---|---|---|---|
| {{canal 1}} | {{}} | {{}} | {{}} | 14 dias | {{a preencher na fase de crescimento}} |
| {{canal 2}} | {{}} | {{}} | {{}} | 14 dias | |
| {{canal 3}} | {{}} | {{}} | {{}} | 14 dias | |

## 6. SEO

<!-- Free methods only (autocomplete, PAA, Trends, competitor sitemaps, Search Console after launch). Files in marketing/seo/. -->
- **Clusters:** {{pilar 1 (n páginas)}}, {{pilar 2}}, {{pilar 3}}
- **SEO programático:** {{sim/não, porquê, nº de páginas, fonte de dados únicos}}
- **10 artigos (briefs):** lista com palavra-chave, idioma, intenção, prioridade → `marketing/seo/briefs/`
- **Checklist técnico entregue à integração:** títulos/descrições únicos, hreflang, canonical, sitemap, JSON-LD, imagens OG

## 7. Calendário de conteúdo e redes sociais (30 dias)

<!-- Summary only; the full table is marketing/social/calendar.md. -->
- **Plataformas (máx. 2):** {{}} · **Cadência:** {{posts/semana}} · **Artigos:** {{1/semana}} · **Email à lista:** {{1/semana}}
- **Fases:** L-14 a L-1 audiência e lista de espera · L lançamento · L+1 a L+15 prova e tutoriais

## 8. Lançamento — plataformas e horários (Europe/Lisbon)

<!-- Rules verified 2026-10-08 in the playbook; re-verify on the day. Product Hunt: no tracking links, never ask for upvotes. Show HN: only if people can try it now; text written by the founder. -->

| Plataforma | Elegível? | Data/hora | Ficheiro | Tarefa HT |
|---|---|---|---|---|
| Product Hunt | {{sim/não}} | {{L, 08:01}} | `marketing/launch/producthunt.md` | HT-{{}} |
| Show HN | {{sim/não: o produto pode ser experimentado já?}} | {{}} | `marketing/launch/showhn.md` | HT-{{}} |
| Reddit | {{subreddits}} | {{}} | `marketing/launch/reddit.md` | HT-{{}} |
| Indie Hackers / BetaList / diretórios | {{}} | {{}} | `marketing/launch/*.md` | HT-{{}} |

## 9. Anúncios pagos

<!-- Only after tracking and a baseline exist. Cap € per platform ≤ 100, total ≤ 300, founder pays and publishes. -->
- **CAC alvo (de `docs/02-business.md`):** {{€}} · **Plataforma de teste:** {{Google | Meta | Reddit}} · **Teto:** {{€}} · **Duração:** {{7–14 dias}}
- **Condições para começar:** analítica verificada ✔/✖ · linha de base de conversão ✔/✖ · CAC alvo definido ✔/✖

## 10. Parcerias, Portugal e ASO

<!-- Portugal block only if pt-PT is a locale; ASO only for mobile apps. -->
- **Parcerias (10 candidatos):** `marketing/launch/partners.md` · **Afiliados:** {{depois de 20 clientes pagantes | n/a}} · **Referências no produto:** {{depois da ativação ≥ 30 %}}
- **Portugal:** imprensa e comunidades {{}} · MB WAY/Multibanco no meio de pagamento escolhido: {{sim/não}} · sazonalidade {{}}
- **ASO:** nome ≤ 30, subtítulo ≤ 30, palavras-chave ≤ 100 bytes, capturas → `marketing/copy/store.<idioma>.md`

## 11. KPIs e convenção UTM

| Fase | Métrica | Definição | Alvo semana 4 |
|---|---|---|---|
| **Estrela polar** | {{}} | {{}} | {{}} |
| Aquisição | visitantes por canal | | |
| Ativação | % que atinge o momento «aha» em 24 h | | ≥ 40 % |
| Receita | teste→pago, MRR | | ≥ 15 % |
| Retenção | retenção semana 4, churn mensal | | ≤ 5 % |
| Referência | convites por utilizador ativo | | |

**UTM:** `utm_source` plataforma · `utm_medium` social/cpc/email/referral/affiliate/directory/pr/community/video · `utm_campaign` `aaaamm-slug` · `utm_content` variante · `utm_term` palavra-chave. Ligações em `marketing/launch/links.csv`.

## 12. Cronograma

<!-- L-21 … L+30, aligned with the runbook in docs/09-launch.md. Include long lead times: Google Play closed test 14+ days, directories' reviews, domain/DNS. -->

| Quando | Ação | Quem | Ficheiro/Tarefa |
|---|---|---|---|
| L-21 | {{}} | | |

## 13. Tarefas do fundador (em lote, ≤ 5 min cada)

<!-- Mirror of HUMAN_TASKS.md entries created by this phase. -->
- HT-{{}} · {{aprovar e publicar posts da semana 1}} · ⏱ {{5}} min
- HT-{{}} · {{lançar no Product Hunt às 08:01}} · ⏱ {{5}} min

## 14. Ativos produzidos

- [ ] `marketing/copy/landing.<idioma>.md` (todos os idiomas, limites verificados)
- [ ] `marketing/seo/` · `marketing/social/` · `marketing/email/` · `marketing/launch/` · `marketing/press/` · `marketing/ads/`
- [ ] Marcadores por preencher (ex.: `{{domínio}}`): {{lista}}

## 15. Riscos e pressupostos

<!-- Top 5 risks to the plan and the assumption each one rests on; link to the experiment that tests it. -->

| Risco/pressuposto | Impacto | Como testar |
|---|---|---|
| {{}} | {{}} | {{}} |
