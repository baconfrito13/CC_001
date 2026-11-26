# Brief — Medições PT


> **Slug:** `civil-pt` · **Tipo:** `ai-app` · **Criado em:** 2026-11-26 · **Origem:** chat (`/ideia`) · **Profundidade:** standard (definida pelo fundador: não)

## 1. Ideia original (palavras do fundador)


~~~~text
criar um produto como o deste site mas adaptado ao mercado português: https://civils.ai/
~~~~

## 2. Resumo numa frase

Mapas de quantidades (medições) a partir de plantas PDF, com IA, para empreiteiros e projetistas em Portugal


## 3. Problema

«Perco horas a medir áreas, comprimentos e volumes à mão nas plantas em PDF para fazer o mapa de quantidades de um orçamento, e ainda assim há erros e omissões entre peças desenhadas.»

## 4. Público-alvo

| | |
|---|---|
| **Segmento primário** | Empreiteiros, subempreiteiros e gabinetes de orçamentação/projeto de obras de engenharia civil e infraestruturas (terraplenagens, redes de água/saneamento, pavimentos, betão, arranjos exteriores) em Portugal; B2B; pt-PT |
| **Segmento secundário** | Projetistas e consultores que verificam consistência entre especialidades; donos de obra/fiscalização |
| **Quem paga** | A empresa (orçamentista/diretor técnico decide) |
| **Alternativa atual** | Medição manual em PDF/AutoCAD/Excel, softwares portugueses de orçamentação (ex.: CYPE/Gerador de Preços, Arquimedes), serviços de medições externos, e concorrentes internacionais como civils.ai (EN, preços em $) |


## 5. Trabalho a realizar (JTBD)

Quando recebo as peças desenhadas de um concurso ou obra com prazo curto, quero obter automaticamente medições auditáveis e um mapa de quantidades pronto a exportar, e detetar incoerências entre desenhos, para orçamentar mais concursos, mais depressa e com menos erros.

## 6. Proposta de valor

Mapas de quantidades em minutos por folha, em português e com a estrutura de capítulos/artigos usada em Portugal, para empreiteiros e projetistas que hoje medem à mão.

## 7. Tipo de produto

**`ai-app`** — O ciclo carregar PDF → IA mede → revisão humana → exportar é o produto. Alternativas descartadas: web-saas puro (a IA é o núcleo, não uma funcionalidade), content (não há audiência prévia). Alternativas descartadas: nenhuma outra relevante.


## 8. Hipótese de monetização

| | |
|---|---|
| **Modelo** | Subscrição mensal/anual com créditos de folhas medidas (custo de IA variável); hipótese |
| **Pagador** | A empresa (orçamentista/diretor técnico) |
| **Preço indicativo** | B2B, sem IVA: ~€60–€250/mês (referência civils.ai: $90 e $270/mês; a validar) |
| **Meio de pagamento provável** | Stripe (B2B, faturação com IVA/NIF) ou Merchant of Record; a decidir na estratégia (ver `factory/playbooks/monetization.md`) |
| **Primeiro euro** | Piloto pago com 3–5 empreiteiros/gabinetes contactados diretamente, após um demo com plantas reais |


## 9. Porquê agora e diferenciação provável

- **Porquê agora:** Modelos de visão com PDFs técnicos tornaram a medição assistida viável; o concorrente global valida a procura mas não serve em português nem com a prática de medições nacional (não verificado).
- **Diferenciação provável:** Idioma e estrutura pt-PT (capítulos/artigos de mapa de quantidades, unidades, terminologia de obra), faturação em € com IVA, RGPD e dados na UE, preço local (não verificado).

## 10. Interpretação escolhida


| # | Público | Problema | Forma do produto | Monetização | Escolhida |
|---|---|---|---|---|---|
| 1 | Empreiteiros e orçamentistas de obra civil/infraestruturas em PT | Medições manuais lentas e sujeitas a erro | Web app: carregar PDF, IA mede, rever, exportar Excel/PDF | Subscrição por folhas | ✅ |
| 2 | Projetistas/gabinetes de coordenação | Incoerências entre especialidades | Verificador de discrepâncias entre desenhos | Subscrição | |
| 3 | Arquitetos/construção de edifícios | Mapas de quantidades de edifícios (mercado mais disputado) | Idem para edifícios | Subscrição | |

**Critério:** monetização mais clara, depois facilidade de construção, depois proximidade às palavras do fundador. As alternativas 2 e 3 são candidatas a pivot na pesquisa.

## 11. Restrições e preferências


- **Orçamento / tempo do fundador:** teto €50/mês por produto antes de receita (FOUNDER.md); tempo do fundador por defeito (não indicado)
- **Idiomas / mercados:** pt-PT primário (mercado português) + en
- **Tom ou marca pretendidos:** Profissional, técnico, sóbrio
- **Decisões do fundador (a respeitar):** Mercado: Portugal; referência de produto: civils.ai (inspiração, nunca cópia de marca, texto ou código)

## 12. Pressupostos


| ID | Pressuposto | Se for falso… | Testado em | Confiança |
|---|---|---|---|---|
| A1 | Empresas portuguesas de construção pagam por medições assistidas por IA (~€60–250/mês) | Sem receita; pivotar para serviço de medições | mercado | baixa |
| A2 | A medição por IA em plantas PDF atinge precisão aceitável com revisão humana | Produto inútil ou apenas assistente de revisão | riscos | baixa |
| A3 | As plantas em PT chegam em PDF vetorial/raster legível e não só DWG | Necessário suportar DWG, mais custo | mercado | média |
| A4 | O diferencial pt-PT (mapa de quantidades por capítulos, terminologia, € e IVA) é valorizado face ao concorrente global | Competir só por preço | concorrentes | média |
| A5 | Canal inicial: contacto direto, LinkedIn, grupos e associações do setor (AICCOPN, AECOPS) | CAC alto | público | baixa |
| A6 | Custo de IA por folha cabe na margem (≤ ~€1–2/folha) | Preço por folha mais alto ou créditos | riscos | baixa |
| A7 | RGPD e confidencialidade de projetos resolvem-se com dados na UE e sem treino com dados do cliente | Perda de clientes de maior dimensão | riscos | média |
| A8 | O fundador não tem audiência no setor; a aquisição depende de outbound e conteúdo | Crescimento lento | público | média |

## 13. Fora do âmbito (por agora)

- Nome final, identidade visual e domínio → fase `brand`.
- Pilha tecnológica e arquitetura → fase `architecture`.
- Preços finais e âmbito do MVP → fase `strategy`.
- Cobertura de DWG/IFC, integração com software de orçamentação e tabelas de preços (CYPE, Arquimedes) → estratégia decide.

## 14. Alertas


Nenhum. Nota: civils.ai é inspiração de produto; não copiar texto, marca, design ou código. Alegações do concorrente (precisão 97%, 90% menos trabalho) são marketing não verificado.

## 15. Registo de alterações

| Data | Fase | Alteração | Motivo |
|---|---|---|---|
| 2026-11-26 | intake | Brief criado | — |
