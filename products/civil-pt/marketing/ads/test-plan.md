# Plano de testes de anúncios — adiado (orçamento 0 €)

**Estado: não ativar.** `FOUNDER.md`: `paid_ads_budget_eur: 0`; os custos recorrentes do produto já ocupam ≈ 42 €/mês dos 50 € permitidos (`docs/02-business.md` §7), por isso **não há ads nem diretórios pagos**. Este ficheiro fixa as condições para o dia em que o fundador aprovar um orçamento.

## Pré-condições (todas)
1. Analítica verificada: `page_viewed`, `demo_requested`, `signup_completed` a chegar (fase 09).
2. Linha de base: ≥ 200 visitas orgânicas medidas e uma taxa de conversão visita → pedido de demonstração conhecida (PRD §8 assume 1,85 %).
3. CAC alvo: **a definir em dinheiro**. O CAC do modelo está em tempo de fundador (≈ 24 h, ≈ 479 €, retorno em 11 meses; `docs/02-business.md` §1); em dinheiro é ≈ 0. Um teste pago só se justifica se o custo por pedido de demonstração for ≤ ⅓ do valor de um Passe 60 (129 €), isto é, ≤ ≈ 43 €, e tiver sentido para um universo de ≈ 1 500 contas.
4. Aprovação escrita do fundador (money = founder task).

## Desenho (quando houver aprovação)
- **Plataforma:** Google Search (cauda longa de fundo de funil, geografia Portugal, exata/frase); LinkedIn Ads só se o fundador quiser (CPCs altos em B2B, não verificado). Meta e Reddit: sem fit (nicho B2B e comunidades inexistentes).
- **Teto:** 100 € por plataforma, ≤ 300 € no total, 7–14 dias, 3 variantes × 1–2 públicos.
- **Sucesso:** CPA ≤ alvo com ≥ 10 conversões. **Stop-loss:** 50 % do teto gasto com 0 conversões, ou CPA > 3× o alvo após ≥ 50 cliques, ou rejeição de política.
- **Palavras-chave de partida** (de `seo/keywords.csv`; volumes desconhecidos, **o Planificador de Palavras-chave da Google exige conta e é uma tarefa do fundador se os volumes forem decisivos**): «software medição plantas pdf», «medir plantas em pdf», «alternativa civils.ai» (anúncio comparativo: só após revisão legal). Negativas: «grátis», «download», «dwg», «autocad tutorial», «curso», «brasil».
- **Anúncios responsivos (rascunho; limites do Google a reverificar no gestor):** cabeçalhos ≤ 30 caracteres: «Medir plantas em PDF» (21) · «Mapa de quantidades em Excel» (28) · «Rasto até à folha» (17) · «Peça uma demonstração» (21) · «Passe por concurso» (18); descrições ≤ 90: «Lê PDF vetorial de CAD e mostra cada quantidade no desenho. Exporta Excel com rasto.» (85) · «Em português e em euros, sem fidelização. Só PDF vetorial exportado de CAD.» (77). **Sem «IA», sem percentagens, sem «grátis» a menos que seja verdade (as 5 folhas de avaliação são).**
- **Destino:** `{{domain}}/pt/?utm_source=google&utm_medium=cpc&utm_campaign=<aaaamm>-search&utm_content=<variante>&utm_term=<palavra>`.
- **Revisão:** diária por Claude a partir de exportações; nada escala antes de CPA ≤ alvo com ≥ 10 conversões.

Ficheiros `google.md`, `meta.md`, `reddit.md` **não criados** (não há orçamento); criar quando este plano for ativado.
