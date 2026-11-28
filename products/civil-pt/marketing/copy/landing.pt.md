# Landing — pt-PT (final)

> Copy final para o passo de integração. Chaves = `Dictionary` em `app/src/content/types.ts` (verificado em 2026-11-28; se `types.ts` mudar, `types.ts` ganha). Planos = `pricing.plans[]` de `app/src/config/site.ts` (os preços ficam numéricos em `site.ts`). Texto escrito de raiz em pt-PT (AO90), formas neutras e impessoais (B2B), sem «você». Alegações: PRD §7 (sem percentagens de precisão, sem IA, sem erros e omissões / CCP, sem «dados só na UE»).

---
locale: pt                # pt = pt-PT
mode: waitlist            # CTA = pedir demonstração; a variante «live» está no fim do ficheiro
---

## meta
homeTitle: Medição de plantas PDF e mapa de quantidades | {name}
description: Mede plantas em PDF vetorial, mostra cada quantidade sobre o desenho e exporta o mapa de quantidades para Excel, com rasto até à folha. Pedir demonstração.
pricingTitle: Preços: Passe por concurso ou ao mês | {name}
pricingDescription: Passe por concurso ou subscrição mensal, em euros e sem fidelização. Escolha o lote de folhas que cabe no concurso. Preços sem IVA.
ogCaption: Cada quantidade, com rasto até à folha

## hero
eyebrow: Para quem orça pavimentos, arranjos exteriores e redes
title: Cada quantidade, com rasto até à folha
subtitle: O {name} lê plantas em PDF vetorial exportadas de CAD, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel.
primaryCta: Pedir demonstração
secondaryCta: Ver como funciona
note: Só lê PDF vetorial exportado de CAD. Não lê DWG nem PDF digitalizado.

## problem
title: Medir à mão custa horas, e o número tem de se defender
intro: Chega o concurso, o prazo começa a contar e as peças desenhadas vêm em PDF.
items:
- title: Horas de medição manual
  body: Áreas de pavimento, lancis, valetas e tubagens medidos um a um, entre o PDF, o AutoCAD e o Excel, com o prazo a correr.
- title: Números difíceis de defender
  body: Dar um número ao diretor técnico ou ao fiscal sem saber de que desenho veio custa tempo e confiança.
- title: Prazos que não esperam
  body: Entregar mais propostas em menos tempo é fácil de pedir e difícil de cumprir sem deixar nada de fora.

## features
title: O que o {name} faz
intro: A geometria é lida do PDF e revista pelo utilizador, sobre o desenho, antes de qualquer exportação.
items:
- title: Quantidades lidas do desenho
  body: Áreas, perímetros e comprimentos saem da geometria do PDF vetorial, convertidos para a escala da folha, sem medir à vista.
- title: Confirmação sobre o desenho
  body: Cada grupo de elementos fica realçado na folha. Aceita-se ou rejeita-se ali mesmo, na tabela ou pelo teclado.
- title: Excel com rasto
  body: O mapa segue em capítulos, artigos e unidades, com uma folha «Rasto» que liga cada quantidade à folha e ao grupo.
- title: Em português e em euros
  body: Interface em pt-PT, terminologia de medições e preços em euros, por concurso ou ao mês, sem fidelização.
- title: Ficheiros guardados na UE
  body: Os PDF ficam em armazenamento privado na UE e podem ser apagados. Nesta versão, as peças não seguem para nenhum fornecedor de IA.
- title: Diz o que não mede
  body: Imagens, digitalizados e DWG são recusados com uma mensagem clara. Volumes que dependem de perfis ficam de fora.

## howItWorks
title: Como funciona
intro: Do PDF ao mapa de quantidades em três passos.
steps:
- title: Carregar o PDF
  body: Crie um projeto e carregue as peças desenhadas. O ficheiro segue direto para armazenamento privado.
- title: Confirmar no desenho
  body: Verifique a escala, reveja cada grupo sobre a folha e aceite ou rejeite. A revisão é sempre do utilizador.
- title: Exportar para Excel
  body: Atribua os grupos a artigos e exporte o mapa, com a folha «Rasto» para justificar cada quantidade.

## pricing
title: Preços por concurso ou ao mês
intro: Passe por concurso, com pagamento único, ou subscrição mensal. Em euros e sem fidelização.
teaserTitle: Pague por concurso
teaserIntro: Lotes de folhas a partir de {price}, sem IVA e sem subscrição obrigatória.
teaserCta: Ver todos os preços
perMonth: / mês
perYear: / ano
oneTime: pagamento único
free: Grátis
mostPopular: Recomendado
ctaCheckout: Escolher {plan}
ctaWaitlist: Pedir demonstração
ctaContact: Falar connosco
redirecting: A redirecionar para o pagamento...
checkoutError: Não foi possível iniciar o pagamento. Tente novamente dentro de instantes.
checkoutNotConfigured: O pagamento em linha ainda não está disponível. Peça uma demonstração e avisamos quando estiver.
checkoutSuccess: Obrigado! Recebemos o pagamento e a confirmação segue dentro de momentos.
checkoutCancelled: Pagamento cancelado. Não foi efetuada qualquer cobrança.
taxNote: Preços em euros, sem IVA. O IVA aplicável, se existir, é indicado no pagamento.
included: O que está incluído

## plans
# ids = `pricing.plans[].id` de site.ts. Uma folha = uma página de PDF processada com sucesso.
pass-20:
  name: Passe 20
  description: Um concurso pequeno ou um trabalho de independente.
  features:
  - 20 folhas, válidas 90 dias
  - Pagamento único, sem subscrição
  - Exportação para Excel com a folha «Rasto»
  - Folha devolvida ao saldo se «não funcionou»
  - Reembolso a pedido em 14 dias (1.ª compra)
pass-60:
  name: Passe 60
  description: Um concurso médio para o orçamentista de uma empreiteira.
  features:
  - 60 folhas, válidas 90 dias
  - Pagamento único, sem subscrição
  - Exportação para Excel com a folha «Rasto»
  - Folha devolvida ao saldo se «não funcionou»
  - Reembolso a pedido em 14 dias (1.ª compra)
pass-150:
  name: Passe 150
  description: Um concurso grande ou vários em simultâneo.
  features:
  - 150 folhas, válidas 90 dias
  - Pagamento único, sem subscrição
  - Exportação para Excel com a folha «Rasto»
  - Folha devolvida ao saldo se «não funcionou»
  - Reembolso a pedido em 14 dias (1.ª compra)
independente:
  name: Independente
  description: Mensal, para subempreiteiros e medidores independentes.
  features:
  - 15 folhas por mês
  - As folhas de cada mês valem 90 dias
  - Cancelamento em dois cliques, sem fidelização
  - Exportação para Excel com a folha «Rasto»
  - Folha devolvida ao saldo se «não funcionou»
empresa:
  name: Empresa
  description: Mensal, para empreiteiras com um fluxo contínuo de concursos.
  features:
  - 50 folhas por mês
  - As folhas de cada mês valem 90 dias
  - Cancelamento em dois cliques, sem fidelização
  - Exportação para Excel com a folha «Rasto»
  - Folha devolvida ao saldo se «não funcionou»
gabinete:
  name: Gabinete
  description: Mensal, para gabinetes com vários concursos em simultâneo.
  features:
  - 120 folhas por mês
  - As folhas de cada mês valem 90 dias
  - Cancelamento em dois cliques, sem fidelização
  - Exportação para Excel com a folha «Rasto»
  - Folha devolvida ao saldo se «não funcionou»

## faq
title: Perguntas frequentes
intro: Não encontra a resposta de que precisa? Escreva-nos e respondemos.
items:
- question: Que ficheiros lê e o que mede?
  answer: Lê PDF vetorial exportado de CAD. Mede áreas, perímetros e comprimentos em planta (pavimentos, lancis, valetas, tubagens). Não lê DWG, imagens nem PDF digitalizado, e não mede volumes que dependem de perfis, cotas ou declives.
- question: Posso fiar-me nas quantidades?
  answer: A geometria é lida diretamente do PDF, mas a revisão é sempre do utilizador: cada grupo é confirmado sobre o desenho antes de exportar, e a folha «Rasto» do Excel mostra de onde vem cada número. O {name} não certifica medições.
- question: Usa inteligência artificial?
  answer: Nesta versão, não. A geometria é lida diretamente do PDF vetorial, sem estimativas de um modelo de IA, e as peças não são enviadas a nenhum fornecedor de IA.
- question: Onde ficam os meus ficheiros?
  answer: Em armazenamento privado na UE, acessível só à sua conta. Pode apagar um projeto a qualquer momento. Os ficheiros não são usados para treinar modelos de IA. Os detalhes estão na política de privacidade.
- question: Quanto custa e o IVA?
  answer: Os preços estão em euros e sem IVA, na página de preços. O IVA aplicável, se existir, é indicado no pagamento. Cada conta nova tem 5 folhas de avaliação, válidas 14 dias, sem cartão.
- question: Posso cancelar ou pedir reembolso?
  answer: A subscrição cancela-se em dois cliques e não há fidelização. Na primeira compra, reembolsa-se a pedido até 14 dias depois do pagamento: por inteiro se nenhuma folha foi usada, ou proporcionalmente às folhas por usar.
- question: Já uso Bluebeam ou CYPE Arquimedes. Para que serve?
  answer: O {name} não é software de orçamentação: não tem bases de preços nem exporta BC3 nesta versão. Serve para obter as quantidades de uma planta PDF vetorial, com rasto, e levá-las em Excel para a ferramenta que já usa.
- question: O apoio e a interface estão em português?
  answer: Sim. A interface, a terminologia e o apoio por e-mail são em português europeu. Existe também uma versão em inglês da interface.

## cta
title: Veja uma folha sua medida no {name}
body: Deixe o e-mail para pedir uma demonstração. Se quiser, usamos uma folha de um concurso seu.

## waitlist
emailLabel: Endereço de e-mail
emailPlaceholder: nome@empresa.pt
submit: Pedir demonstração
submitting: A enviar...
consentPrefix: Aceito receber e-mails sobre este pedido e sobre o {name}, e li a 
consentLinkText: política de privacidade
consentSuffix: . Posso retirar o consentimento a qualquer momento.
successTitle: Pedido recebido
successBody: Obrigado. Respondemos por e-mail para combinar a demonstração.

## overrides
# Chaves da starter que ficam como estão (consent, footer, a11y, legal, notFound, waitlist.errors).
- footer.blurb: O {name} lê plantas em PDF vetorial e entrega o mapa de quantidades, com rasto até à folha. Feito em Portugal, em euros.
- Preço de lançamento (opcional, só enquanto `FOUNDER_PRICE_SLOTS` > 0): mostrar no plano «Empresa» a linha «Preço de lançamento: 79 € por mês para as primeiras 10 empresas, mantido enquanto a subscrição estiver ativa». Sem preço riscado e sem contagem decrescente; o preço de 99 € nunca foi cobrado.
- Evento `demo_requested` no envio do formulário (já previsto no PRD §9).

## variante live (usar na fase 09, quando os planos tiverem `stripePriceId`/`checkoutUrl` e a avaliação estiver aberta)
hero.primaryCta: Começar com 5 folhas grátis
hero.secondaryCta: Pedir demonstração
cta.title: Meça a sua primeira folha
cta.body: Crie uma conta e experimente com 5 folhas de avaliação, válidas 14 dias, sem cartão.
pricing.ctaWaitlist: Pedir demonstração
nav.cta: Começar grátis
