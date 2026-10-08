import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    homeTitle: "{name} - The simplest way to get your next idea off the ground",
    description:
      "{name} helps you go from idea to a working product in days. Join the waitlist for early access.",
    pricingTitle: "Pricing",
    pricingDescription:
      "Simple, transparent pricing for {name}. Start free and upgrade when you are ready.",
    ogCaption: "Early access now open",
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
    cta: "Join the waitlist",
  },
  hero: {
    eyebrow: "Early access",
    title: "Go from idea to launched product in days, not months",
    subtitle:
      "{name} takes care of the busywork so you can focus on what makes your product different. Be among the first to try it.",
    primaryCta: "Join the waitlist",
    secondaryCta: "See how it works",
    note: "Free to join. No spam, unsubscribe at any time.",
  },
  problem: {
    title: "Launching is harder than it should be",
    intro:
      "Most good ideas never reach customers. The reasons are rarely about the idea itself.",
    items: [
      {
        title: "Too many tools",
        body: "Hosting, payments, analytics, legal pages, email: every launch starts with a week of plumbing.",
      },
      {
        title: "Slow feedback",
        body: "Without a live page and a way to collect interest, you build for months before you learn anything.",
      },
      {
        title: "Compliance worries",
        body: "Privacy, cookies and consumer law are easy to get wrong and expensive to fix after launch.",
      },
    ],
  },
  features: {
    title: "Everything you need to launch",
    intro:
      "A complete foundation that is fast, accessible and ready for customers from day one.",
    items: [
      {
        title: "Fast by default",
        body: "Static pages, no layout shift and a small JavaScript footprint keep your visitors (and search engines) happy.",
      },
      {
        title: "Built for Europe",
        body: "Consent-first analytics, clear legal pages and consumer-law basics are included from the start.",
      },
      {
        title: "Bilingual out of the box",
        body: "English and European Portuguese with proper language tags, so every visitor reads your product in their language.",
      },
      {
        title: "Get paid quickly",
        body: "Connect a checkout link or Stripe and start charging as soon as you are ready.",
      },
      {
        title: "Collect interest",
        body: "A privacy-friendly waitlist with explicit consent turns visitors into early supporters.",
      },
      {
        title: "Accessible to everyone",
        body: "Keyboard friendly, high contrast and tested with automated accessibility checks.",
      },
    ],
  },
  howItWorks: {
    title: "How it works",
    intro: "Three simple steps from sign-up to launch.",
    steps: [
      {
        title: "Join the waitlist",
        body: "Leave your email and confirm that you agree to hear from us.",
      },
      {
        title: "Get early access",
        body: "We invite people in small groups and listen closely to your feedback.",
      },
      {
        title: "Launch with confidence",
        body: "Use {name} to ship your product and start serving customers.",
      },
    ],
  },
  pricing: {
    title: "Simple, transparent pricing",
    intro: "Start free and upgrade when you are ready. Cancel at any time.",
    teaserTitle: "Pricing that grows with you",
    teaserIntro: "Start for free. Paid plans start at {price}.",
    teaserCta: "See all plans",
    perMonth: "/ month",
    perYear: "/ year",
    oneTime: "one-time payment",
    free: "Free",
    mostPopular: "Most popular",
    ctaCheckout: "Get {plan}",
    ctaWaitlist: "Join the waitlist",
    ctaContact: "Contact us",
    redirecting: "Redirecting to checkout...",
    checkoutError: "We could not start the checkout. Please try again in a moment.",
    checkoutNotConfigured:
      "Online checkout is not available yet. Join the waitlist and we will let you know.",
    checkoutSuccess:
      "Thank you! Your payment was received and a confirmation is on its way.",
    checkoutCancelled: "Checkout cancelled. You have not been charged.",
    taxNote: "Prices include applicable taxes unless stated otherwise.",
    included: "What is included",
  },
  faq: {
    title: "Frequently asked questions",
    intro: "Can't find the answer you need? Write to us and we will get back to you.",
    items: [
      {
        question: "What is {name}?",
        answer:
          "{name} is a product that helps you move from an idea to a launched, working product quickly. This text is a placeholder: replace it with a clear one-sentence answer.",
      },
      {
        question: "When will it be available?",
        answer:
          "We are inviting people from the waitlist in small groups. Join the list and you will hear from us first.",
      },
      {
        question: "How much does it cost?",
        answer:
          "There is a free plan, and paid plans are listed on the pricing page. You can cancel at any time.",
      },
      {
        question: "How do you use my email address?",
        answer:
          "Only to tell you about {name}. You give explicit consent when you join, and you can withdraw it at any time. See our privacy policy for details.",
      },
      {
        question: "Do you use cookies?",
        answer:
          "Only if you agree. Analytics tools load after you accept, and you can change your choice at any time from the cookie settings link in the footer.",
      },
    ],
  },
  cta: {
    title: "Be the first to know",
    body: "Join the waitlist and get early access when {name} opens its doors.",
  },
  waitlist: {
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    submit: "Join the waitlist",
    submitting: "Joining...",
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
    successTitle: "You are on the list!",
    successBody: "Thank you for joining. We will email you when {name} is ready.",
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
    blurb: "{name} helps you go from idea to launched product.",
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
