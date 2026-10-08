import type { Dictionary } from "./types";

/** European Portuguese (pt-PT). Avoid Brazilian forms: "utilizador", "ecrã", "equipa", "ficheiro". */
export const pt: Dictionary = {
  meta: {
    homeTitle: "{name} - A forma mais simples de lançar a sua próxima ideia",
    description:
      "O {name} ajuda-o a passar da ideia a um produto a funcionar em poucos dias. Junte-se à lista de espera para acesso antecipado.",
    pricingTitle: "Preços",
    pricingDescription:
      "Preços simples e transparentes para o {name}. Comece grátis e evolua quando quiser.",
    ogCaption: "Acesso antecipado já disponível",
  },
  a11y: {
    skipToContent: "Saltar para o conteúdo principal",
    primaryNav: "Navegação principal",
    footerNav: "Ligações legais e da empresa",
    languageNav: "Idioma",
    languageSwitchTo: "Mudar o idioma para {language}",
    homeLink: "{name} - página inicial",
    externalLink: "(abre num novo separador)",
  },
  nav: {
    features: "Funcionalidades",
    howItWorks: "Como funciona",
    pricing: "Preços",
    faq: "Perguntas frequentes",
    cta: "Entrar na lista de espera",
  },
  hero: {
    eyebrow: "Acesso antecipado",
    title: "Da ideia ao produto lançado em dias, não em meses",
    subtitle:
      "O {name} trata do trabalho de bastidores para que se possa concentrar no que torna o seu produto diferente. Seja dos primeiros a experimentar.",
    primaryCta: "Entrar na lista de espera",
    secondaryCta: "Ver como funciona",
    note: "Inscrição gratuita. Sem spam, pode cancelar a qualquer momento.",
  },
  problem: {
    title: "Lançar um produto é mais difícil do que devia",
    intro:
      "A maioria das boas ideias nunca chega aos clientes, e raramente por causa da ideia em si.",
    items: [
      {
        title: "Ferramentas a mais",
        body: "Alojamento, pagamentos, análise de utilização, páginas legais, e-mail: cada lançamento começa com uma semana de preparação.",
      },
      {
        title: "Feedback lento",
        body: "Sem uma página no ar e uma forma de recolher interesse, passa meses a construir antes de aprender seja o que for.",
      },
      {
        title: "Preocupações de conformidade",
        body: "Privacidade, cookies e direito do consumo são fáceis de errar e caros de corrigir depois do lançamento.",
      },
    ],
  },
  features: {
    title: "Tudo o que precisa para lançar",
    intro:
      "Uma base completa, rápida, acessível e pronta para receber clientes desde o primeiro dia.",
    items: [
      {
        title: "Rápido por defeito",
        body: "Páginas estáticas, sem saltos de layout e pouco JavaScript mantêm os visitantes (e os motores de pesquisa) satisfeitos.",
      },
      {
        title: "Pensado para a Europa",
        body: "Análise de utilização com consentimento prévio, páginas legais claras e o essencial do direito do consumo desde o início.",
      },
      {
        title: "Bilingue de origem",
        body: "Inglês e português europeu com as etiquetas de idioma corretas, para que cada visitante leia o produto na sua língua.",
      },
      {
        title: "Receba pagamentos depressa",
        body: "Ligue uma ligação de pagamento ou o Stripe e comece a cobrar assim que estiver pronto.",
      },
      {
        title: "Recolha interessados",
        body: "Uma lista de espera respeitadora da privacidade, com consentimento explícito, transforma visitantes em apoiantes.",
      },
      {
        title: "Acessível a todos",
        body: "Utilizável com o teclado, com bom contraste e validado com verificações automáticas de acessibilidade.",
      },
    ],
  },
  howItWorks: {
    title: "Como funciona",
    intro: "Três passos simples, da inscrição ao lançamento.",
    steps: [
      {
        title: "Entre na lista de espera",
        body: "Deixe o seu e-mail e confirme que aceita receber as nossas mensagens.",
      },
      {
        title: "Receba acesso antecipado",
        body: "Convidamos as pessoas em pequenos grupos e ouvimos com atenção o seu feedback.",
      },
      {
        title: "Lance com confiança",
        body: "Use o {name} para publicar o seu produto e começar a servir clientes.",
      },
    ],
  },
  pricing: {
    title: "Preços simples e transparentes",
    intro: "Comece grátis e evolua quando quiser. Cancele a qualquer momento.",
    teaserTitle: "Preços que crescem consigo",
    teaserIntro: "Comece grátis. Os planos pagos começam em {price}.",
    teaserCta: "Ver todos os planos",
    perMonth: "/ mês",
    perYear: "/ ano",
    oneTime: "pagamento único",
    free: "Grátis",
    mostPopular: "Mais popular",
    ctaCheckout: "Escolher {plan}",
    ctaWaitlist: "Entrar na lista de espera",
    ctaContact: "Contacte-nos",
    redirecting: "A redirecionar para o pagamento...",
    checkoutError:
      "Não foi possível iniciar o pagamento. Tente novamente dentro de instantes.",
    checkoutNotConfigured:
      "O pagamento em linha ainda não está disponível. Entre na lista de espera e avisamos quando estiver.",
    checkoutSuccess:
      "Obrigado! Recebemos o seu pagamento e a confirmação segue dentro de momentos.",
    checkoutCancelled: "Pagamento cancelado. Não foi efetuada qualquer cobrança.",
    taxNote: "Os preços incluem os impostos aplicáveis, salvo indicação em contrário.",
    included: "O que está incluído",
  },
  faq: {
    title: "Perguntas frequentes",
    intro:
      "Não encontra a resposta de que precisa? Escreva-nos e responderemos o mais depressa possível.",
    items: [
      {
        question: "O que é o {name}?",
        answer:
          "O {name} é um produto que o ajuda a passar rapidamente de uma ideia a um produto lançado e a funcionar. Este texto é um exemplo: substitua-o por uma resposta clara numa frase.",
      },
      {
        question: "Quando estará disponível?",
        answer:
          "Estamos a convidar as pessoas da lista de espera em pequenos grupos. Inscreva-se e será dos primeiros a saber.",
      },
      {
        question: "Quanto custa?",
        answer:
          "Existe um plano gratuito e os planos pagos estão indicados na página de preços. Pode cancelar a qualquer momento.",
      },
      {
        question: "Como utilizam o meu endereço de e-mail?",
        answer:
          "Apenas para o informar sobre o {name}. Dá o seu consentimento explícito ao inscrever-se e pode retirá-lo a qualquer momento. Consulte a política de privacidade para mais informação.",
      },
      {
        question: "Utilizam cookies?",
        answer:
          "Só se concordar. As ferramentas de análise são carregadas depois de aceitar e pode alterar a sua escolha a qualquer momento na ligação de definições de cookies, no rodapé.",
      },
    ],
  },
  cta: {
    title: "Seja dos primeiros a saber",
    body: "Entre na lista de espera e receba acesso antecipado quando o {name} abrir portas.",
  },
  waitlist: {
    emailLabel: "Endereço de e-mail",
    emailPlaceholder: "o.seu@exemplo.pt",
    submit: "Entrar na lista de espera",
    submitting: "A inscrever...",
    consentPrefix: "Aceito receber e-mails sobre o {name} e li a ",
    consentLinkText: "política de privacidade",
    consentSuffix: ". Posso retirar o meu consentimento a qualquer momento.",
    errors: {
      emailRequired: "Indique o seu endereço de e-mail.",
      emailInvalid: "Indique um endereço de e-mail válido, por exemplo nome@exemplo.pt.",
      consentRequired: "Assinale a caixa para confirmar que concorda.",
      generic: "Ocorreu um erro. Tente novamente.",
      rateLimited: "Demasiadas tentativas. Aguarde alguns minutos e tente novamente.",
      unavailable:
        "A lista de espera está temporariamente indisponível. Tente mais tarde.",
      summary: "Corrija o seguinte:",
    },
    successTitle: "Está na lista!",
    successBody:
      "Obrigado por se inscrever. Enviaremos um e-mail quando o {name} estiver pronto.",
  },
  consent: {
    regionLabel: "Preferências de cookies",
    title: "As suas escolhas de privacidade",
    body: "Gostaríamos de usar ferramentas de análise para perceber como o sítio é utilizado e melhorá-lo. Ficam desativadas, a menos que concorde. Pode mudar de ideias a qualquer momento.",
    policyLinkText: "Ler a política de cookies",
    accept: "Aceitar análise",
    reject: "Rejeitar análise",
    settings: "Definições de cookies",
  },
  footer: {
    blurb: "O {name} ajuda-o a passar da ideia ao produto lançado.",
    legalTitle: "Legal",
    contactTitle: "Contacto",
    copyright: "© {year} {company}. Todos os direitos reservados.",
    complaintsBook: "Livro de Reclamações",
    complaintsBookHint: "Livro de Reclamações eletrónico oficial",
    companyDetails: "Dados da empresa",
    vatLabel: "IVA",
    followTitle: "Siga-nos",
    withdraw: "Cancelar contrato (livre resolução)",
  },
  withdrawal: {
    metaDescription:
      "Exerça em linha o direito de livre resolução de um contrato celebrado como consumidor, no prazo de 14 dias e sem indicar o motivo.",
    title: "Cancelar contrato (livre resolução)",
    intro:
      "Se comprou o {name} como consumidor, pode resolver o contrato no prazo de 14 dias, sem indicar o motivo. Preencha este formulário para nos comunicar a sua decisão: não precisa de escrever um e-mail.",
    policyPrefix: "As condições e as exceções estão explicadas na nossa ",
    policyLinkText: "política de livre resolução",
    policySuffix: ".",
    nameLabel: "O seu nome",
    emailLabel: "Endereço de e-mail para o aviso de receção",
    referenceLabel: "Referência da encomenda ou do contrato",
    referenceHint:
      "Por exemplo, o número da encomenda ou da fatura que consta do e-mail de confirmação.",
    messageLabel: "Mensagem (opcional)",
    messageHint: "Não tem de indicar o motivo.",
    submit: "Confirmar livre resolução",
    submitting: "A enviar...",
    errors: {
      nameRequired: "Indique o seu nome.",
      emailRequired: "Indique o seu endereço de e-mail.",
      emailInvalid: "Indique um endereço de e-mail válido, por exemplo nome@exemplo.pt.",
      referenceRequired: "Indique a referência da encomenda ou do contrato.",
      tooLong: "Este texto é demasiado longo. Reduza-o, por favor.",
      generic: "Ocorreu um erro. Tente novamente.",
      rateLimited: "Demasiadas tentativas. Aguarde alguns minutos e tente novamente.",
      unavailable: "O formulário de livre resolução está temporariamente indisponível.",
      delivery:
        "Não foi possível registar a sua declaração. Envie-a, por favor, por e-mail para {email}. O seu direito de livre resolução não é afetado.",
      summary: "Corrija o seguinte:",
    },
    successTitle: "A sua livre resolução foi recebida",
    successBody: "Recebemos a sua declaração de livre resolução em {timestamp}.",
    successReference: "Referência do contrato: {reference}",
    successAck:
      "Será enviado um aviso de receção por e-mail para {email}. Guarde-o como prova.",
    email: {
      ackSubject: "{company}: recebemos a sua livre resolução ({reference})",
      ackBody:
        "Olá {name},\n\nConfirmamos que recebemos, em {timestamp}, a sua declaração de livre resolução do contrato.\n\nReferência do contrato: {reference}\n\nVamos tratar da sua livre resolução e reembolsar os pagamentos que efetuou sem demora injustificada e, o mais tardar, 14 dias após a receção da sua declaração, conforme descrito na nossa política de livre resolução: {policyUrl}\n\nSe não foi o próprio a fazer esta declaração, responda a este e-mail.\n\n{company}",
      notifySubject: "Livre resolução recebida: {reference} ({name})",
      notifyBody:
        "Um consumidor exerceu a livre resolução de um contrato através do sítio.\n\nRecebida em: {timestamp}\nNome: {name}\nE-mail: {email}\nReferência do contrato: {reference}\nMensagem: {message}\n\nVerifique que o aviso de receção foi enviado ao consumidor e reembolse no prazo de 14 dias a contar da data acima.",
    },
  },
  legal: {
    docs: {
      privacy: {
        label: "Política de Privacidade",
        description: "Como recolhemos e tratamos dados pessoais.",
      },
      terms: {
        label: "Termos e Condições",
        description: "As condições aplicáveis à utilização do serviço.",
      },
      cookies: {
        label: "Política de Cookies",
        description: "Que cookies e tecnologias semelhantes utilizamos.",
      },
      withdrawal: {
        label: "Direito de Livre Resolução",
        description: "O seu direito de cancelar uma compra no prazo de 14 dias.",
      },
      "legal-notice": {
        label: "Aviso Legal",
        description: "Quem somos e como nos contactar.",
      },
    },
    homeBreadcrumb: "Início",
    lastUpdated: "Última atualização",
    tableLabel: "Tabela (desliza para o lado em ecrãs pequenos)",
  },
  notFound: {
    title: "Página não encontrada",
    body: "A página que procura não existe ou foi movida.",
    home: "Voltar à página inicial",
  },
};
