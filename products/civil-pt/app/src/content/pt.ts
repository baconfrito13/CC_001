import type { Dictionary } from "./types";

/** European Portuguese (pt-PT). Avoid Brazilian forms: "utilizador", "ecrã", "equipa", "ficheiro". */
export const pt: Dictionary = {
  meta: {
    homeTitle: "{name}: medições em plantas PDF, com rasto até à folha",
    description:
      "Medições em plantas PDF vetoriais: cada quantidade confirmada sobre o desenho e mapa de quantidades em Excel, com rasto até à folha.",
    pricingTitle: "Preços",
    pricingDescription:
      "Passe por concurso ou subscrição mensal, em euros e sem fidelização. Preços sem IVA.",
    ogCaption: "Medições em plantas PDF vetoriais",
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
    cta: "Pedir demonstração",
  },
  hero: {
    eyebrow: "Para quem orça pavimentos, arranjos exteriores e redes",
    title: "Cada quantidade, com rasto até à folha",
    subtitle:
      "O {name} lê plantas em PDF vetorial exportadas de CAD, mostra cada quantidade sobre o desenho para o utilizador confirmar e exporta o mapa de quantidades para Excel.",
    primaryCta: "Pedir demonstração",
    secondaryCta: "Ver como funciona",
    note: "Só lê PDF vetorial exportado de CAD. Não lê DWG nem imagens digitalizadas.",
  },
  problem: {
    title: "Medir à mão custa horas de trabalho qualificado",
    intro:
      "Quando chega um concurso, o prazo começa a contar e as peças desenhadas vêm em PDF.",
    items: [
      {
        title: "Medição manual",
        body: "Áreas de pavimento, lancis, valetas e tubagens medidos um a um, entre o PDF, o AutoCAD e o Excel.",
      },
      {
        title: "Quantidades difíceis de justificar",
        body: "Apresentar um número ao diretor técnico ou ao fiscal sem saber de que desenho veio custa tempo e confiança.",
      },
      {
        title: "Prazos curtos",
        body: "Entregar mais propostas em menos tempo é fácil de pedir e difícil de fazer sem deixar omissões.",
      },
    ],
  },
  features: {
    title: "O que o {name} faz",
    intro: "Geometria lida do PDF, revista pelo utilizador antes de qualquer exportação.",
    items: [
      {
        title: "Lê a geometria do PDF",
        body: "Extrai a geometria vetorial de plantas exportadas de CAD, com a escala detetada ou definida pelo utilizador.",
      },
      {
        title: "Confirma-se sobre o desenho",
        body: "Cada grupo de elementos fica destacado na folha para aceitar ou rejeitar, com tabela e teclado.",
      },
      {
        title: "Mapa de quantidades em Excel",
        body: "Capítulos, artigos e unidades editáveis, exportados com uma folha «Rasto» que liga cada quantidade à folha e ao grupo.",
      },
      {
        title: "Em pt-PT e em euros",
        body: "Interface em português europeu e preços em euros, por concurso ou ao mês, sem fidelização.",
      },
      {
        title: "Ficheiros guardados na UE",
        body: "Os PDF ficam em armazenamento privado na UE e podem ser apagados a qualquer momento. Nesta versão, as peças não são enviadas a nenhum fornecedor de IA.",
      },
      {
        title: "Diz o que não mede",
        body: "Imagens, digitalizados e DWG são recusados com uma mensagem clara. Volumes que dependem de perfis ficam de fora.",
      },
    ],
  },
  howItWorks: {
    title: "Como funciona",
    intro: "Do PDF ao mapa de quantidades em três passos.",
    steps: [
      {
        title: "Carregue o PDF",
        body: "Crie um projeto e carregue as peças desenhadas em PDF vetorial. O ficheiro segue direto para o armazenamento privado.",
      },
      {
        title: "Confirme sobre o desenho",
        body: "Verifique a escala, reveja cada grupo sobre a folha e aceite ou rejeite. A revisão é sempre do utilizador.",
      },
      {
        title: "Exporte para Excel",
        body: "Atribua os grupos a artigos e exporte o mapa de quantidades, com a folha «Rasto» para justificar cada número.",
      },
    ],
  },
  pricing: {
    title: "Preços por concurso ou ao mês",
    intro:
      "Passe por concurso, com pagamento único, ou subscrição mensal. Sem fidelização.",
    teaserTitle: "Pague por concurso",
    teaserIntro: "A partir de {price}, sem IVA.",
    teaserCta: "Ver todos os preços",
    perMonth: "/ mês",
    perYear: "/ ano",
    oneTime: "pagamento único",
    free: "Grátis",
    mostPopular: "Recomendado",
    ctaCheckout: "Escolher {plan}",
    ctaWaitlist: "Pedir demonstração",
    ctaContact: "Contacte-nos",
    redirecting: "A redirecionar para o pagamento...",
    checkoutError:
      "Não foi possível iniciar o pagamento. Tente novamente dentro de instantes.",
    checkoutNotConfigured:
      "O pagamento em linha ainda não está disponível. Peça uma demonstração e avisamos quando estiver.",
    checkoutSuccess:
      "Obrigado! Recebemos o seu pagamento e a confirmação segue dentro de momentos.",
    checkoutCancelled: "Pagamento cancelado. Não foi efetuada qualquer cobrança.",
    taxNote:
      "Preços em euros, sem IVA. O IVA aplicável, se existir, é indicado no pagamento.",
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
          "Um assistente de medição para quem orça pavimentos, arranjos exteriores e redes. Lê plantas em PDF vetorial, mostra cada quantidade sobre o desenho para confirmar e exporta o mapa de quantidades para Excel.",
      },
      {
        question: "Que ficheiros lê?",
        answer:
          "Apenas PDF vetorial exportado de CAD. Não lê DWG nem imagens ou PDF digitalizados.",
      },
      {
        question: "O que mede?",
        answer:
          "Áreas, perímetros e comprimentos em planta, como pavimentos, lancis, valetas e tubagens. Volumes que dependem de perfis, cotas e declives não são medidos.",
      },
      {
        question: "As quantidades são exatas?",
        answer:
          "A geometria é lida do PDF, mas a revisão é sempre do utilizador: cada grupo tem de ser confirmado sobre o desenho antes de exportar. O {name} não certifica medições.",
      },
      {
        question: "Como é o preço?",
        answer:
          "Passe por concurso, com pagamento único, ou subscrição mensal. Os valores estão na página de preços, em euros e sem IVA.",
      },
      {
        question: "Como utilizam o meu endereço de e-mail?",
        answer:
          "Apenas para o contactar sobre o {name}. Dá o seu consentimento explícito ao pedir a demonstração e pode retirá-lo a qualquer momento. Consulte a política de privacidade para mais informação.",
      },
      {
        question: "Utilizam cookies?",
        answer:
          "Só se concordar. As ferramentas de análise são carregadas depois de aceitar e pode alterar a sua escolha a qualquer momento na ligação de definições de cookies, no rodapé.",
      },
    ],
  },
  cta: {
    title: "Veja o {name} em ação",
    body: "Deixe o seu e-mail para pedir uma demonstração do {name}.",
  },
  waitlist: {
    emailLabel: "Endereço de e-mail",
    emailPlaceholder: "nome@empresa.pt",
    submit: "Pedir demonstração",
    submitting: "A enviar...",
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
    successTitle: "Pedido recebido!",
    successBody: "Obrigado. Entraremos em contacto por e-mail sobre o {name}.",
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
    blurb:
      "O {name} lê plantas em PDF vetorial e entrega o mapa de quantidades, com rasto até à folha.",
    legalTitle: "Legal",
    contactTitle: "Contacto",
    copyright: "© {year} {company} · Todos os direitos reservados.",
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
