/**
 * Shape of the UI dictionaries. `en.ts` and `pt.ts` both implement `Dictionary`, so a missing
 * or extra key in either locale is a TypeScript error.
 *
 * Placeholders in strings:
 *   {name}     product name        {company}  company legal name
 *   {year}     current year        {date}     a formatted date
 */
export interface TitledText {
  title: string;
  body: string;
}

export interface Dictionary {
  meta: {
    /** <title> of the home page. */
    homeTitle: string;
    description: string;
    pricingTitle: string;
    pricingDescription: string;
    /** Caption line on the generated Open Graph image. */
    ogCaption: string;
  };
  a11y: {
    skipToContent: string;
    primaryNav: string;
    footerNav: string;
    languageNav: string;
    languageSwitchTo: string;
    homeLink: string;
    externalLink: string;
  };
  nav: {
    features: string;
    howItWorks: string;
    pricing: string;
    faq: string;
    cta: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    note: string;
  };
  problem: { title: string; intro: string; items: TitledText[] };
  features: { title: string; intro: string; items: TitledText[] };
  howItWorks: { title: string; intro: string; steps: TitledText[] };
  pricing: {
    title: string;
    intro: string;
    teaserTitle: string;
    teaserIntro: string;
    teaserCta: string;
    perMonth: string;
    perYear: string;
    oneTime: string;
    free: string;
    mostPopular: string;
    ctaCheckout: string;
    ctaWaitlist: string;
    ctaContact: string;
    redirecting: string;
    checkoutError: string;
    checkoutNotConfigured: string;
    checkoutSuccess: string;
    checkoutCancelled: string;
    taxNote: string;
    included: string;
  };
  faq: { title: string; intro: string; items: { question: string; answer: string }[] };
  cta: { title: string; body: string };
  waitlist: {
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    consentPrefix: string;
    consentLinkText: string;
    consentSuffix: string;
    errors: {
      emailRequired: string;
      emailInvalid: string;
      consentRequired: string;
      generic: string;
      rateLimited: string;
      unavailable: string;
      summary: string;
    };
    successTitle: string;
    successBody: string;
  };
  consent: {
    regionLabel: string;
    title: string;
    body: string;
    policyLinkText: string;
    accept: string;
    reject: string;
    /** Footer button that re-opens the banner. */
    settings: string;
  };
  footer: {
    blurb: string;
    legalTitle: string;
    contactTitle: string;
    copyright: string;
    complaintsBook: string;
    complaintsBookHint: string;
    companyDetails: string;
    vatLabel: string;
    followTitle: string;
  };
  legal: {
    docs: Record<
      "privacy" | "terms" | "cookies" | "withdrawal" | "legal-notice",
      { label: string; description: string }
    >;
    homeBreadcrumb: string;
    lastUpdated: string;
  };
  notFound: { title: string; body: string; home: string };
}
