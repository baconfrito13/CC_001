# Brief — Visão Guiada

> **Slug:** `visao-guiada` · **Tipo:** `other` · **Criado em:** 2026-10-08 · **Origem:** chat (`/ideia`) · **Profundidade:** standard (definida pelo fundador: não)

## 1. Ideia original (palavras do fundador)

~~~~text
Uma solução para pessoas cegas ou com outros tipos de problemas visuais graves que seria, no fundo, um conjunto de óculos e fones interligados e com um sistema de inteligência artificial integrado, de preferência sem necessidade de ligação à internet, que se fosse indespensável teria de ser feita através de ligação ao telemovel do utilizador. Uma solução nativa mesmo. Esses óculos teriam um câmara e o que vêm transmitem ao utilizador através dos fones, que também têm microfone e permitem ao utilizador fazer perguntas à IA. Tudo feito no mesmo ecosistema. A "monetização" seria através da venda do kit (óculos + fones/microfone), preferencialmente sem necessidade de subscrição e com possíveis atualizações OTA.
~~~~

## 2. Resumo numa frase

Óculos com câmara e auriculares com IA offline que descrevem o mundo a pessoas cegas, vendidos como kit sem subscrição

## 3. Problema

«Não consigo ler um rótulo, saber o que está à minha frente ou orientar-me num sítio novo sem pedir ajuda a alguém — e as apps que existem obrigam-me a segurar o telemóvel e a estar ligado à internet.»

## 4. Público-alvo

| | |
|---|---|
| **Segmento primário** | Adultos cegos ou com baixa visão grave (B2C), utilizadores de leitor de ecrã, na Europa; mercado de entrada Portugal + mercados de língua inglesa |
| **Segmento secundário** | Instituições e financiadores: associações (ex.: ACAPO), centros de reabilitação, seguradoras/SNS via produtos de apoio comparticipados, programas de emprego inclusivo |
| **Quem paga** | O próprio utilizador ou a família; parte relevante pode ser financiada por sistemas de produtos de apoio (hipótese a verificar) |
| **Alternativa atual** | Bengala/cão-guia + apps no telemóvel (Be My Eyes, Seeing AI, Envision app), óculos dedicados caros (Envision Glasses, OrCam), óculos de consumo com IA na nuvem (Ray-Ban Meta), ou pedir ajuda a outra pessoa — tudo palpites de memória, a verificar na pesquisa |

## 5. Trabalho a realizar (JTBD)

Quando estou sozinho num sítio ou perante um objeto que não consigo ver, quero perguntar em voz alta e ouvir de imediato o que está à minha frente, de mãos livres e sem depender de rede, para fazer as minhas tarefas com autonomia e sem pedir ajuda.

## 6. Proposta de valor

Um kit de óculos + auriculares que descreve, lê e responde a perguntas sobre o que está à frente do utilizador, de mãos livres, a funcionar offline e sem mensalidade — mais privado e mais barato a longo prazo do que óculos dedicados com subscrição ou apps de telemóvel na nuvem.

## 7. Tipo de produto

**`other`** — o produto é hardware de consumo (óculos com câmara + auriculares com microfone) com IA embarcada e firmware atualizável OTA; nenhuma categoria da taxonomia cobre hardware, por isso a arquitetura terá de escrever um ADR obrigatório com a receita mais próxima (`ecommerce` para a venda do kit, `mobile` para a app companheira). Alternativas descartadas: `ecommerce` (é só o canal de venda, não o produto), `mobile` (o fundador quer uma solução nativa em hardware próprio; o telemóvel é apenas plano B de processamento), `ai-app` (a IA é o núcleo, mas o artefacto que o cliente toca é físico).

## 8. Hipótese de monetização

| | |
|---|---|
| **Modelo** | Pagamento único pelo kit (decisão do fundador), atualizações OTA incluídas; receitas complementares possíveis: garantia alargada, acessórios, versão institucional |
| **Pagador** | Utilizador/família; em alternativa, instituição ou sistema de comparticipação |
| **Preço indicativo** | hipótese €400–900 IVA incluído (abaixo dos óculos dedicados conhecidos, acima de óculos de consumo) |
| **Meio de pagamento provável** | Loja Shopify para bens físicos (ver `factory/playbooks/monetization.md`); antes de haver produto, pré-reservas/lista de espera |
| **Primeiro euro** | Pré-encomendas com depósito reembolsável ou campanha de crowdfunding depois de um protótipo funcional — nunca antes de haver protótipo e enquadramento legal claro |

## 9. Porquê agora e diferenciação provável

- **Porquê agora:** modelos de visão-linguagem pequenos começam a correr em chips móveis/embarcados e os óculos com câmara tornaram-se produtos de consumo; o Ato Europeu da Acessibilidade (aplicável desde 2025) aumentou a atenção ao tema — palpite, não verificado.
- **Diferenciação provável:** processamento local (privacidade, sem rede, sem mensalidade) + ecossistema único óculos/auriculares desenhado de raiz para cegos (áudio, botões físicos, sem ecrã) — palpite, não verificado.

## 10. Interpretação escolhida

A ideia é concreta (público, problema e forma do produto definidos pelo fundador). Como é hardware — o critério de viabilidade de construção da fábrica penaliza hardware —, ficam registados dois ângulos alternativos como candidatos a pivot para a pesquisa.

| # | Público | Problema | Forma do produto | Monetização | Escolhida |
|---|---|---|---|---|---|
| 1 | Adultos cegos / baixa visão grave | Perceber o ambiente, ler e perguntar sem mãos e sem rede | Kit próprio óculos com câmara + auriculares, IA embarcada (telemóvel como reforço), OTA | Venda única do kit | ✅ |
| 2 | O mesmo | O mesmo | Software primeiro: app nativa (iOS/Android) com IA no dispositivo, compatível com óculos com câmara já existentes no mercado e auriculares comuns; hardware próprio só depois de validar | Pagamento único na app ou freemium | |
| 3 | O mesmo, via instituições | O mesmo | Kit montado com componentes de prateleira + software próprio, vendido/alugado a associações e centros de reabilitação | Venda B2B / licença por unidade | |

**Critério:** monetização mais clara, depois facilidade de construção, depois proximidade às palavras do fundador. Escolheu-se a 1 por ser exatamente o que o fundador pediu; as alternativas 2 e 3 são candidatas a pivot na pesquisa.

## 11. Restrições e preferências

- **Orçamento / tempo do fundador:** teto de custos recorrentes €50/mês por produto antes de haver receita; anúncios €0 (só orgânico). Desenvolvimento de hardware (protótipos, certificação, stock) exige investimento que ultrapassa este teto → decisão do fundador quando chegar a altura.
- **Idiomas / mercados:** produto em `en` + `pt-PT` (voz/TTS e reconhecimento de fala nas duas línguas); mercados global (inglês) + Portugal.
- **Tom ou marca pretendidos:** não definidos; acessível, sóbrio, centrado na autonomia (hipótese).
- **Decisões do fundador (a respeitar):** óculos com câmara + fones com microfone num único ecossistema; IA integrada, de preferência offline; se a ligação for indispensável, só através do telemóvel do utilizador; solução nativa; venda do kit sem subscrição; atualizações OTA.

## 12. Pressupostos

| ID | Pressuposto | Se for falso… | Testado em | Confiança |
|---|---|---|---|---|
| A1 | Pessoas cegas/baixa visão (ou famílias) pagam €400–900 de uma vez por um kit destes | Preço tem de descer ou depender de comparticipação/instituições (ângulo 3) | público / mercado | baixa |
| A2 | Existe dor não resolvida pelas alternativas atuais (apps gratuitas, óculos dedicados, óculos de consumo com IA) | Sem diferenciação → KILL ou pivot para nicho (offline/privacidade, pt-PT) | concorrentes | baixa |
| A3 | Um modelo de visão-linguagem útil corre localmente em hardware de óculos/auriculares ou no telemóvel com latência e bateria aceitáveis | Processamento tem de ir para o telemóvel ou para a nuvem, contrariando a preferência offline | riscos | média |
| A4 | A fábrica (sem equipa de hardware) consegue chegar a um protótipo funcional com componentes de prateleira e parceiros ODM | Ângulo 2 (software primeiro sobre óculos existentes) passa a ser o único caminho viável | riscos | baixa |
| A5 | O kit pode ser vendido na UE como produto eletrónico de consumo (CE, RED, RoHS, WEEE, baterias) sem ser dispositivo médico, desde que não faça alegações médicas | Certificação MDR multiplica custo e prazo | riscos | média |
| A6 | Câmara sempre ligada é aceitável em termos de RGPD/privacidade de terceiros se o processamento for local e sem gravação | Restrições de uso, avisos, ou bloqueio em certos locais | riscos | média |
| A7 | O primeiro canal é a comunidade de cegos (associações como a ACAPO, grupos online, podcasts e YouTubers cegos, distribuidores de produtos de apoio) | Aquisição cara; venda B2B via instituições passa a ser o canal principal | público | média |
| A8 | Há sistemas de comparticipação de produtos de apoio (ex.: SAPA em Portugal) em que um kit destes pode entrar | O utilizador paga tudo; preço tem de baixar | mercado | baixa |
| A9 | Atualizações OTA sem subscrição são sustentáveis (custos de servidor baixos, IA local) | É preciso um plano opcional pago para manter o produto | riscos | média |
| A10 | Começar em `pt-PT` + `en` é suficiente; o fundador não tem audiência própria neste setor (FOUNDER.md vazio nesse campo) | Se tiver contactos no setor, o canal inicial muda | público | média |

## 13. Fora do âmbito (por agora)

- Nome final, identidade visual e domínio → fase `brand`.
- Pilha tecnológica e arquitetura (chips, modelo de IA, firmware, app companheira) → fase `architecture`.
- Preços finais e âmbito do MVP → fase `strategy`.
- Fornecedores/ODM, certificação, fabrico e stock → só depois de G1 e com aprovação do fundador (gastos).

## 14. Alertas

- **Hardware:** fora do perfil «construível em dias» da fábrica (critério de viabilidade do G1). A pesquisa deve avaliar seriamente o ângulo 2 (software primeiro) e um MVP de validação (lista de espera / pré-reservas / protótipo com componentes existentes).
- **Saúde / segurança:** utilizadores vulneráveis podem confiar na IA para decisões de segurança (atravessar a rua, obstáculos, medicamentos). Exige avisos claros, limites do produto e análise de responsabilidade do produto; verificar se as alegações tornam o produto dispositivo médico (MDR) e as obrigações do AI Act.
- **Privacidade de terceiros:** câmara usada em público (RGPD).
- **Custos:** protótipos, certificação CE e stock ultrapassam o teto de €50/mês → tarefas do fundador quando chegar a altura.

## 15. Registo de alterações

| Data | Fase | Alteração | Motivo |
|---|---|---|---|
| 2026-10-08 | intake | Brief criado | — |
