<!-- TEMPLATE-NOTICE: Modelo gerado para products/civil-pt/legal/dpia-screening.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado sempre que a triagem indique que é necessária uma AIPD (DPIA) ou que o tratamento é de risco elevado. Documento INTERNO. -->

# Triagem de AIPD (DPIA) — Rastoplan

> RGPD art. 35.º; Regulamento n.º 1/2018 da CNPD (lista de tratamentos sujeitos a AIPD); critérios do WP248 rev.01 (Grupo de Trabalho do Artigo 29.º, subscritos pelo CEPD). Objetivo: decidir, com razões, se é obrigatória uma avaliação de impacto antes do lançamento.

**Versão:** 1 · **Data:** 2026-11-28 · **Baseado em:** `legal/ropa.md` v1, `docs/04-architecture.md`

## 1. Resumo do tratamento

O Rastoplan é um SaaS B2B para orçamentistas de construção em Portugal. Os titulares são os utilizadores profissionais (≈ 6 contas ativas e ≈ 71 criadas a 12 meses no cenário base; universo nomeável ≈ 5 600 contas) e, de forma acessória, as pessoas nomeadas nas peças que carregam (nomes e assinaturas em carimbos). Dados: e-mail, identificador interno, estado da conta, ficheiros PDF e resultados de medição, dados de pagamento (no Stripe), contadores de abuso (HMAC de IP e de e-mail), erros sem PII e, com consentimento, estatísticas pseudónimas. Não há categorias especiais, menores, geolocalização, biometria nem decisões automatizadas sobre pessoas. **Não há IA no MVP** (ADR 0008). Fornecedores: Supabase, Vercel, Stripe, Resend, PostHog, Sentry (RoPA-01 a RoPA-12; `legal/subprocessors.md`). Armazenamento na UE (Frankfurt) com acesso de apoio a partir de fora da UE em casos limitados (SCC).

## 2. Casos de AIPD obrigatória (art. 35.º, n.º 3)

| Caso | Aplica-se? | Razão |
|---|---|---|
| a) Avaliação sistemática e extensiva de aspetos pessoais baseada em tratamento automatizado (incluindo perfis) com efeitos jurídicos ou similares | Não | Não há perfis nem pontuação de pessoas; os limites automáticos de abuso (bloqueios temporários, contas de avaliação) não têm efeitos jurídicos nem similarmente significativos |
| b) Tratamento em grande escala de categorias especiais (art. 9.º) ou de dados sobre condenações penais (art. 10.º) | Não | Nenhuma categoria especial é recolhida. As peças desenhadas de obras não são dados de categorias especiais |
| c) Controlo sistemático de zonas acessíveis ao público em grande escala | Não | Não aplicável |

## 3. Lista da CNPD (Regulamento n.º 1/2018)

*A lista foi lida na altura da execução pelo resumo do template; o texto integral do regulamento deve ser confirmado em https://www.cnpd.pt (não foi possível abri-lo nesta sessão). Nenhum dos tipos listados é remotamente próximo do tratamento do produto.*

| Tipo de tratamento (resumo) | Aplica-se? |
|---|---|
| Dados de saúde recolhidos por dispositivos eletrónicos que os transmitem por redes | Não |
| Interconexão de dados pessoais ou tratamento que relacione dados do art. 9.º/10.º ou de natureza altamente pessoal | Não |
| Recolha indireta de dados sensíveis/altamente pessoais sem possibilidade de informar (art. 14.º, n.º 5, al. b)) | Não (a prospecção B2B só trata contactos profissionais de fontes públicas e informa no primeiro contacto) |
| Seguimento da localização ou do comportamento para avaliar ou classificar pessoas | Não (a analítica é opcional, pseudónima, sem IP e sem avaliação de pessoas) |
| Dados sensíveis para arquivo de interesse público, investigação ou estatística | Não |
| Biometria para identificar pessoas vulneráveis; genéticos de pessoas vulneráveis | Não |
| Dados sensíveis/altamente pessoais com novas tecnologias | Não |

## 4. Os nove critérios do WP248

| # | Critério | Aplica-se? | Razão |
|---|---|---|---|
| 1 | Avaliação ou classificação (scoring, perfis) | Não | Nenhuma avaliação de pessoas |
| 2 | Decisões automatizadas com efeitos jurídicos ou similares | Não | Só limites técnicos de segurança, com revisão humana a pedido |
| 3 | Monitorização sistemática | Não | Estatísticas só com consentimento, pseudónimas, pequena escala; sem monitorização do trabalho dos utilizadores |
| 4 | Dados sensíveis ou altamente pessoais | Não | Só e-mail profissional e dados de faturação de empresas; as peças são confidenciais para o negócio, não são dados «altamente pessoais» |
| 5 | Tratamento em grande escala | Não | ≈ 71 contas criadas a 12 meses; universo ≈ 5 600 |
| 6 | Cruzamento ou combinação de conjuntos de dados | Não | Nenhum cruzamento com outras fontes |
| 7 | Titulares vulneráveis | Não | Profissionais adultos; o trabalhador-utilizador não é monitorizado |
| 8 | Uso inovador ou novas soluções tecnológicas | Não | Extração geométrica determinística (sem IA); componentes padrão |
| 9 | Tratamento que impede o exercício de um direito ou o uso de um serviço | Não | Nenhum |

**Total de critérios:** 0

## 5. Decisão

- [x] **AIPD não necessária.** Razões: nenhum caso do art. 35.º, n.º 3, nenhum tipo da lista da CNPD e 0 de 9 critérios do WP248. Medidas já previstas: minimização (e-mail como único dado de conta; sem palavra-passe), IP e e-mail só como HMAC, retenções curtas (24 h a 30 dias), isolamento por conta com RLS, UE por defeito, analítica só com consentimento, sem decisões automatizadas, sem IA. **Rever se:** US-07 (IA) for ativada, for criada monitorização do trabalho dos utilizadores, forem recolhidas categorias especiais, o número de titulares crescer para dezenas de milhares, ou houver cruzamento de dados com fontes externas.
- [ ] **AIPD necessária.** — não se aplica.

## 6. Esboço mínimo de uma AIPD

Não aplicável. Se a revisão acima falhar, seguir o esboço do template (`factory/templates/legal/dpia-screening.md` §6) e escalar para advogado antes do lançamento.

## 7. Aprovação

| Quem | Data | Decisão |
|---|---|---|
| legal-counsel (agente) | 2026-11-28 | AIPD não necessária (0 critérios) |
| Fundador / advogado | — | Não escalado (nenhum gatilho de revisão por advogado se verifica; ver `docs/07-compliance.md` §7) |
