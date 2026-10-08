# Modelo de negócio — {{name}}

<!--
Template for docs/02-business.md. Language: pt-PT. Procedure: factory/playbooks/02-strategy.md (Steps 5-11). Every external number: [fonte](url) — acedido em AAAA-MM-DD; tag FACTO / ESTIMATIVA / PRESSUPOSTO. Fees, prices, tax rates and commissions change: verify at execution time on the official page. Compute tables with a script (projection snippet in the playbook), never by hand. Amounts net of VAT unless stated; consumer prices shown VAT-inclusive. Delete guidance comments when done; the double-brace placeholder and TODO must not remain.
-->

> **Produto:** `{{slug}}` · **Data:** {{AAAA-MM-DD}} · **Profundidade:** {{lean/standard/deep}} · **Moeda:** EUR · **Depende de:** `01-research.md`, `02-product.md`

## 1. Resumo

| | |
|---|---|
| **Modelo primário** | {{subscrição / utilização / pagamento único / freemium / …}} + receita-ponte: {{ou «nenhuma»}} |
| **Preço-alvo (escalão central)** | {{€/mês · €/ano, IVA incl.}} |
| **Meio de pagamento** | {{Merchant of Record: … / Stripe + Stripe Tax / loja de apps / Shopify}} |
| **Margem bruta · LTV:CAC · retorno do CAC** | {{%}} · {{x:1}} · {{meses}} |
| **Ponto de equilíbrio** | {{n clientes · mês}} (cenário base) |
| **Pico de caixa (dinheiro a adiantar)** · **custo mensal em 0 utilizadores** | {{€}} · {{€}} vs. teto `monthly_budget_per_product_eur` = {{€}} |
| **Pressuposto mais arriscado** | {{}} |

## 2. Lean Canvas

| Problema | Solução | Proposta de valor única | Vantagem competitiva | Segmentos de clientes |
|---|---|---|---|---|
| {{top 3 + alternativas atuais}} | {{top 3 funcionalidades}} | {{frase única; conceito de alto nível «X para Y»}} | {{o que não é fácil de copiar}} | {{primário; adotantes iniciais}} |

| Métricas-chave | Canais | Estrutura de custos | Fontes de receita |
|---|---|---|---|
| {{north star + 3}} | {{top 3 canais}} | {{fixos + variáveis}} | {{modelo, preços}} |

## 3. Modelo de receitas

<!-- Candidate scoring 1-5 per criterion (see playbook Step 5). Choose ONE primary model and at most one bridge revenue. -->

| Candidato | Ajuste à métrica de valor | Tempo até 1.ª receita | Ajuste ao COGS | Carga de conformidade UE | Clareza do pagador | Total |
|---|---|---|---|---|---|---|
| {{subscrição}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |
| {{alternativa}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |

**Escolha:** {{modelo}} — {{porquê, 2 frases}}. **Receita-ponte:** {{ex.: pacote de modelos pago único enquanto a subscrição amadurece / nenhuma}}. **Gatilho de upgrade** (se houver plano gratuito): {{métrica + limiar}}.

## 4. Meio de pagamento

| | |
|---|---|
| **Escolha e razão** | {{ver `factory/playbooks/monetization.md`}} |
| **Custos** | {{% + fixo por transação}} — [fonte]({{url}}) acedido em {{data}} |
| **IVA / faturação** | {{quem é o vendedor registado; tratamento do IVA}} |
| **Pagamento ao fundador** | {{moeda, calendário, mínimo}} |
| **KYC / ações do fundador** | ver `HUMAN_TASKS.md` (HT-{{n}}) · webhooks necessários: {{eventos}} · alternativa de recurso: {{}} |

## 5. Preços

**Âncoras** (de `research/competitors.md`, EUR, tratamento de IVA consistente)

| Concorrente / alternativa | Plano comparável | €/mês | Métrica de valor |
|---|---|---|---|
| {{}} | {{}} | {{}} | {{}} |
| Alternativa gratuita / status quo | {{custo em tempo × valor/hora}} | {{}} | — |

**Mediana {{}} · P25 {{}} · P75 {{}}** · **Métrica de valor:** {{unidade}} — porque {{cresce com o valor, é previsível, é fácil de medir}}.

| Escalão | Para quem | €/mês (IVA incl.) | €/ano (IVA incl.) | Limites na métrica de valor | Inclui (histórias) |
|---|---|---|---|---|---|
| {{Entrada}} | {{}} | {{}} | {{}} | {{}} | US-{{}} |
| **{{Alvo}}** | {{}} | {{}} | {{}} | {{}} | US-{{}} |
| {{Âncora}} | {{}} | {{}} | {{}} | {{}} | US-{{}} |

- **Desconto anual:** {{2 meses grátis (~17%)}} · **Teste/reembolso:** {{14 dias}} · **IVA:** consumidores veem preços com IVA incluído; B2B {{líquido «+IVA» / com IVA}}.
- **Oferta de lançamento:** {{membro fundador: preço, limite de n.º ou data, mantém preço para sempre}}.
- **Plano de teste de preços:** {{variante A vs. B, amostra mínima ≥ 300 visitantes por variante, métrica, quando rever}}.

## 6. Economia unitária

| Variável | Valor | Etiqueta | Fonte / fórmula |
|---|---|---|---|
| ARPA (€/mês, sem IVA) | {{}} | {{}} | Σ preço do escalão × mix |
| COGS por cliente/mês | {{pagamentos + infra + IA/API + email + apoio + reembolsos}} | {{}} | {{}} |
| **Margem bruta** | {{%}} | | (receita − COGS) / receita |
| Taxa de conversão (visita → pago) | {{%}} | PRESSUPOSTO | {{}} |
| **CAC por canal** | {{canal A: €; canal B: €}} | {{}} | CPC ÷ conversão · ou custo de ferramentas ÷ clientes |
| Churn mensal | {{%}} | PRESSUPOSTO | omissão: B2C 7–10%, B2B PME 3–5% |
| **LTV** | {{€}} | | ARPA × margem ÷ churn (máx. 36 meses) |
| **LTV : CAC** | {{x:1}} | | meta ≥ 3 |
| **Retorno do CAC (meses)** | {{}} | | CAC ÷ (ARPA × margem); meta ≤ 12 (≤ 3 em pagos) |

{{Se alguma meta falhar: ajuste feito (preço/canal/modelo) ou risco explícito.}} Tempo do fundador (fora do custo): {{h/semana}}.

## 7. Modelo de custos

| Custo | Tipo | 0 utilizadores | 100 | 1 000 | 10 000 | Fonte (limites do plano gratuito, data) |
|---|---|---|---|---|---|---|
| Alojamento / base de dados | misto | | | | | [fonte] |
| Email transacional | misto | | | | | [fonte] |
| Monitorização / analítica | misto | | | | | [fonte] |
| IA / APIs externas | variável | | | | | [fonte] |
| Taxas de pagamento | variável | | | | | [fonte] |
| Domínio, ferramentas, apoio, outros | misto | | | | | [fonte] |
| **Total mensal** | | **{{}}** | **{{}}** | **{{}}** | **{{}}** | |

## 8. Projeção a 12 meses (3 cenários)

<!-- Generated by the projection script (playbook Step 9). Base inputs come from the research channel plan. Multipliers: pessimistic traffic x0.4, conversions x0.6, churn x1.5; optimistic traffic x2, conversions x1.3, churn x0.8. Sanity: base month-12 revenue <= researched SOM. -->

| Pressuposto | Pessimista | Base | Otimista | Etiqueta |
|---|---|---|---|---|
| Visitantes no mês 1 / crescimento mensal | {{}} | {{}} | {{}} | PRESSUPOSTO (de `audience.md`) |
| Visita → registo / registo → pago | {{}} | {{}} | {{}} | PRESSUPOSTO |
| ARPA / churn mensal | {{}} | {{}} | {{}} | {{}} |
| Custos fixos / anúncios / setup | {{}} | {{}} | {{}} | {{}} |

| Mês | Pess.: pagantes | Receita € | Resultado € | Base: pagantes | Receita € | Resultado € | Otim.: pagantes | Receita € | Resultado € |
|---|---|---|---|---|---|---|---|---|---|
| 1 | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |
| 2 … 11 | | | | | | | | | |
| 12 | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |
| **Caixa acumulada (mês 12)** | | | **{{}}** | | | **{{}}** | | | **{{}}** |

## 9. Ponto de equilíbrio e caixa

| | Pessimista | Base | Otimista |
|---|---|---|---|
| Custos fixos mensais ÷ contribuição por cliente = clientes necessários | {{}} | {{}} | {{}} |
| Mês em que o resultado mensal ≥ 0 | {{}} | {{}} | {{}} |
| Mês de recuperação do investimento (caixa acumulada ≥ 0) | {{}} | {{}} | {{}} |
| **Pico de caixa negativo (máx. «queima»)** | {{€}} | {{€}} | {{€}} |

**Comparação com `FOUNDER.md`:** custo mensal vs. `monthly_budget_per_product_eur` {{cabe / ajustar âmbito/custos}} · anúncios vs. `paid_ads_budget_eur` {{}} · cada euro a adiantar pelo fundador tem tarefa HT-{{n}}.

## 10. Sensibilidades e pressupostos a substituir por dados reais

| Motor (top 3) | Efeito de ±30% no resultado do mês 12 | Como validar cedo (experiência do GTM) | Substituir por dados quando… (registar em `10-growth.md`) |
|---|---|---|---|
| {{conversão}} | {{}} | {{}} | {{n.º de visitantes / semanas}} |
| {{churn}} | {{}} | {{}} | {{}} |
| {{tráfego / CAC / mix de escalões}} | {{}} | {{}} | {{}} |

## 11. Alternativas consideradas (profundidade deep)

<!-- 3 proposals (user-first, revenue-first, distribution-first), judged by 3 judges; weights: speed to first revenue 25, wedge strength 20, distribution fit 20, build-budget fit 15, retention/LTV 10, risk 10. Include the synthesis "taken / left" table. -->

| Proposta | Resumo | Receita 1.º / 6.º / 12.º mês (base) | Pontuação ponderada | Elementos usados na síntese |
|---|---|---|---|---|
| Foco no utilizador | {{}} | {{}} | {{}} | {{}} |
| Foco na receita | {{}} | {{}} | {{}} | {{}} |
| Foco na distribuição | {{}} | {{}} | {{}} | {{}} |

## 12. Objeções sobre preço e economia (resposta completa no PRD, secção «Objeções do advogado do diabo»)

| # | Objeção (âmbito / preço / contas / pressupostos / pre-mortem) | Gravidade | Resposta | Tratamento | Alteração feita |
|---|---|---|---|---|---|
| 1 | {{}} | {{}} | {{}} | aceite / refutada / mitigada | {{}} |
