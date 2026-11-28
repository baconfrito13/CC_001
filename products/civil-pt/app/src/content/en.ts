import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    homeTitle: "{name}: quantity takeoff from PDF plans, traced to the sheet",
    description:
      "Rastoplan measures vector PDF plans, shows every quantity on the drawing and exports the bill of quantities to Excel, with a trace to the sheet.",
    pricingTitle: "Pricing",
    pricingDescription:
      "Per-tender pass or monthly subscription, in euros with no lock-in. Prices exclude VAT.",
    ogCaption: "Takeoff from vector PDF plans",
  },
  a11y: {
    skipToContent: "Skip to main content",
    primaryNav: "Main navigation",
    footerNav: "Legal and company links",
    languageNav: "Language",
    languageSwitchTo: "Switch language to {language}",
    homeLink: "{name} - home page",
    externalLink: "(opens in a new tab)",
  },
  nav: {
    features: "Features",
    howItWorks: "How it works",
    pricing: "Pricing",
    faq: "FAQ",
    cta: "Request a demo",
  },
  hero: {
    eyebrow: "For estimators of paving, landscaping and utility works",
    title: "Every quantity, traced to the sheet",
    subtitle:
      "{name} reads vector PDF plans exported from CAD, shows each quantity on the drawing for you to confirm, and exports the bill of quantities to Excel.",
    primaryCta: "Request a demo",
    secondaryCta: "See how it works",
    note: "Reads vector PDF exported from CAD only. It does not read DWG or scanned images.",
  },
  problem: {
    title: "Measuring by hand costs hours of skilled work",
    intro: "When a tender arrives the clock starts, and the drawings come as PDF.",
    items: [
      {
        title: "Manual takeoff",
        body: "Paving areas, kerbs, drainage channels and pipes measured one by one, between the PDF, AutoCAD and Excel.",
      },
      {
        title: "Quantities that are hard to justify",
        body: "Handing a number to the technical director or the supervisor without knowing which drawing it came from costs time and trust.",
      },
      {
        title: "Short deadlines",
        body: "Sending more bids in less time is easy to ask for and hard to do without leaving omissions.",
      },
    ],
  },
  features: {
    title: "What {name} does",
    intro: "Geometry read from the PDF, reviewed by you before anything is exported.",
    items: [
      {
        title: "Reads the geometry of the PDF",
        body: "Extracts vector geometry from plans exported from CAD, with the scale detected or set by you.",
      },
      {
        title: "Confirmed on the drawing",
        body: "Each group of elements is highlighted on the sheet to accept or reject, with a table and keyboard support.",
      },
      {
        title: "Bill of quantities in Excel",
        body: "Editable chapters, items and units, exported with a Trace sheet that links each quantity to its sheet and group.",
      },
      {
        title: "In European Portuguese and euros",
        body: "A Portuguese interface and prices in euros, per tender or per month, with no lock-in.",
      },
      {
        title: "Files stored in the EU",
        body: "PDFs are kept in private storage in the EU and can be deleted at any time. In this version, your drawings are not sent to any AI provider.",
      },
      {
        title: "Says what it does not measure",
        body: "Images, scans and DWG files are refused with a clear message. Volumes that depend on cross-sections are out of scope.",
      },
    ],
  },
  howItWorks: {
    title: "How it works",
    intro: "From PDF to bill of quantities in three steps.",
    steps: [
      {
        title: "Upload the PDF",
        body: "Create a project and upload the drawings as vector PDF. The file goes straight to private storage.",
      },
      {
        title: "Confirm on the drawing",
        body: "Check the scale, review each group on the sheet and accept or reject it. The review is always yours.",
      },
      {
        title: "Export to Excel",
        body: "Assign the groups to items and export the bill of quantities, with the Trace sheet to justify every number.",
      },
    ],
  },
  pricing: {
    title: "Pricing per tender or per month",
    intro: "A pass per tender, paid once, or a monthly subscription. No lock-in.",
    teaserTitle: "Pay per tender",
    teaserIntro: "From {price}, excluding VAT.",
    teaserCta: "See all prices",
    perMonth: "/ month",
    perYear: "/ year",
    oneTime: "one-time payment",
    free: "Free",
    mostPopular: "Recommended",
    ctaCheckout: "Get {plan}",
    ctaWaitlist: "Request a demo",
    ctaContact: "Contact us",
    redirecting: "Redirecting to checkout...",
    checkoutError: "We could not start the checkout. Please try again in a moment.",
    checkoutNotConfigured:
      "Online checkout is not available yet. Request a demo and we will let you know.",
    checkoutSuccess:
      "Thank you! Your payment was received and a confirmation is on its way.",
    checkoutCancelled: "Checkout cancelled. You have not been charged.",
    taxNote:
      "Prices in euros, excluding VAT. Applicable VAT, if any, is shown at checkout.",
    included: "What is included",
  },
  faq: {
    title: "Frequently asked questions",
    intro: "Can't find the answer you need? Write to us and we will get back to you.",
    items: [
      {
        question: "What is {name}?",
        answer:
          "A measurement assistant for estimators of paving, landscaping and utility works. It reads vector PDF plans, shows each quantity on the drawing for you to confirm, and exports the bill of quantities to Excel.",
      },
      {
        question: "Which files does it read?",
        answer:
          "Only vector PDF exported from CAD. It does not read DWG files, images or scanned PDFs.",
      },
      {
        question: "What does it measure?",
        answer:
          "Areas, perimeters and lengths on plan, such as paving, kerbs, channels and pipes. Volumes that depend on cross-sections, levels and slopes are not measured.",
      },
      {
        question: "Are the quantities exact?",
        answer:
          "The geometry is read from the PDF, but the review is always yours: every group must be confirmed on the drawing before export. {name} does not certify measurements.",
      },
      {
        question: "How does pricing work?",
        answer:
          "A pass per tender, paid once, or a monthly subscription. The amounts are on the pricing page, in euros and excluding VAT.",
      },
      {
        question: "How do you use my email address?",
        answer:
          "Only to contact you about {name}. You give explicit consent when you request the demo, and you can withdraw it at any time. See our privacy policy for details.",
      },
      {
        question: "Do you use cookies?",
        answer:
          "Only if you agree. Analytics tools load after you accept, and you can change your choice at any time from the cookie settings link in the footer.",
      },
    ],
  },
  cta: {
    title: "See {name} in action",
    body: "Leave your email to request a demo of {name}.",
  },
  waitlist: {
    emailLabel: "Email address",
    emailPlaceholder: "name@company.com",
    submit: "Request a demo",
    submitting: "Sending...",
    consentPrefix: "I agree to receive emails about {name} and accept the ",
    consentLinkText: "privacy policy",
    consentSuffix: ". I can withdraw my consent at any time.",
    errors: {
      emailRequired: "Enter your email address.",
      emailInvalid: "Enter a valid email address, for example name@example.com.",
      consentRequired: "Please tick the box to confirm you agree.",
      generic: "Something went wrong. Please try again.",
      rateLimited: "Too many attempts. Please wait a few minutes and try again.",
      unavailable: "The waitlist is temporarily unavailable. Please try again later.",
      summary: "Please fix the following:",
    },
    successTitle: "Request received!",
    successBody: "Thank you. We will contact you by email about {name}.",
  },
  consent: {
    regionLabel: "Cookie preferences",
    title: "Your privacy choices",
    body: "We would like to use analytics to understand how the site is used and improve it. They are switched off unless you agree. You can change your mind at any time.",
    policyLinkText: "Read the cookie policy",
    accept: "Accept analytics",
    reject: "Reject analytics",
    settings: "Cookie settings",
  },
  footer: {
    blurb:
      "{name} reads vector PDF plans and delivers the bill of quantities, traced to the sheet.",
    legalTitle: "Legal",
    contactTitle: "Contact",
    copyright: "© {year} {company} · All rights reserved.",
    complaintsBook: "Livro de Reclamações",
    complaintsBookHint:
      "Complaints book: the official electronic complaints book of Portugal",
    companyDetails: "Company details",
    vatLabel: "VAT",
    followTitle: "Follow",
    withdraw: "Withdraw from contract",
  },
  withdrawal: {
    metaDescription:
      "Withdraw online from a contract you made as a consumer, within 14 days and without giving a reason.",
    title: "Withdraw from a contract",
    intro:
      "If you bought {name} as a consumer, you can withdraw from the contract within 14 days without giving a reason. Fill in this form to tell us: you do not need to write an email.",
    policyPrefix: "The conditions and the exceptions are explained in our ",
    policyLinkText: "withdrawal policy",
    policySuffix: ".",
    nameLabel: "Your name",
    emailLabel: "Email address for the acknowledgement",
    referenceLabel: "Order or contract reference",
    referenceHint:
      "For example the order number or the invoice number from your confirmation email.",
    messageLabel: "Message (optional)",
    messageHint: "You do not have to give a reason.",
    submit: "Confirm withdrawal",
    submitting: "Sending...",
    errors: {
      nameRequired: "Enter your name.",
      emailRequired: "Enter your email address.",
      emailInvalid: "Enter a valid email address, for example name@example.com.",
      referenceRequired: "Enter the order or contract reference.",
      tooLong: "This text is too long. Please shorten it.",
      generic: "Something went wrong. Please try again.",
      rateLimited: "Too many attempts. Please wait a few minutes and try again.",
      unavailable: "The withdrawal form is temporarily unavailable.",
      delivery:
        "We could not record your statement. Please send it by email to {email} instead. Your right of withdrawal is not affected.",
      summary: "Please fix the following:",
    },
    successTitle: "Your withdrawal was received",
    successBody: "We received your statement of withdrawal on {timestamp}.",
    successReference: "Contract reference: {reference}",
    successAck:
      "An acknowledgement of receipt will be sent by email to {email}. Keep it as proof.",
    email: {
      ackSubject: "{company}: we received your withdrawal ({reference})",
      ackBody:
        "Hello {name},\n\nWe confirm that we received your statement of withdrawal from the contract on {timestamp}.\n\nContract reference: {reference}\n\nWe will process your withdrawal and refund any payments you made without undue delay, and at the latest within 14 days of receiving your statement, as described in our withdrawal policy: {policyUrl}\n\nIf you did not make this statement, please reply to this email.\n\n{company}",
      notifySubject: "Withdrawal received: {reference} ({name})",
      notifyBody:
        "A consumer withdrew from a contract through the website.\n\nReceived: {timestamp}\nName: {name}\nEmail: {email}\nContract reference: {reference}\nMessage: {message}\n\nCheck that the acknowledgement was sent to the consumer, and refund within 14 days of the date above.",
    },
  },
  legal: {
    docs: {
      privacy: {
        label: "Privacy Policy",
        description: "How we collect and use personal data.",
      },
      terms: {
        label: "Terms and Conditions",
        description: "The terms that apply when you use the service.",
      },
      cookies: {
        label: "Cookie Policy",
        description: "Which cookies and similar technologies we use.",
      },
      withdrawal: {
        label: "Right of Withdrawal",
        description: "Your right to cancel a purchase within 14 days.",
      },
      "legal-notice": {
        label: "Legal Notice",
        description: "Who we are and how to reach us.",
      },
    },
    homeBreadcrumb: "Home",
    lastUpdated: "Last updated",
    tableLabel: "Table (scrolls sideways on small screens)",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has moved.",
    home: "Back to the home page",
  },
};
