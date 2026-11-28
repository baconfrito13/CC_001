import type { Locale } from "@/config/site";

/**
 * Sign-in copy (US-01): the page, the confirmation page and the email. Strings in quotes in the
 * PRD («Introduza um endereço de email válido.», «Este código expirou…», «Demasiadas
 * tentativas…») are reproduced exactly in pt. `Record<Locale, AuthCopy>` makes a missing locale
 * or key a type error; tests/unit/content-app.test.ts also compares the key sets.
 */
export interface AuthCopy {
  login: {
    metaTitle: string;
    title: string;
    intro: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendCode: string;
    sending: string;
    invalidEmail: string;
    codeIntro: string;
    codeLabel: string;
    codeHint: string;
    verify: string;
    verifying: string;
    invalidCodeFormat: string;
    codeExpired: string;
    tooManyAttempts: string;
    tooManyRequests: string;
    genericError: string;
    useAnotherEmail: string;
    consentPrefix: string;
    termsLink: string;
    consentMiddle: string;
    privacyLink: string;
    consentSuffix: string;
  };
  confirm: {
    metaTitle: string;
    title: string;
    body: string;
    button: string;
    missingToken: string;
    backToLogin: string;
  };
  email: {
    subject: string;
    preheader: string;
    greeting: string;
    codeIntro: string;
    validity: string;
    linkIntro: string;
    linkButton: string;
    ignore: string;
    signature: string;
  };
  shell: {
    nav: string;
    projects: string;
    account: string;
    signOut: string;
    signingOut: string;
    signedInAs: string;
  };
}

const pt: AuthCopy = {
  login: {
    metaTitle: "Entrar",
    title: "Entrar no {name}",
    intro:
      "Escreva o seu email. Enviamos-lhe um código de 6 dígitos e uma ligação para entrar, sem palavra-passe.",
    emailLabel: "Email",
    emailPlaceholder: "nome@empresa.pt",
    sendCode: "Enviar código",
    sending: "A enviar…",
    invalidEmail: "Introduza um endereço de email válido.",
    codeIntro:
      "Se o endereço {email} estiver correto, enviámos-lhe um código de 6 dígitos e uma ligação. Ambos são válidos durante 10 minutos.",
    codeLabel: "Código de 6 dígitos",
    codeHint:
      "Pode também abrir a ligação do email. Se não o vir, veja a pasta de correio não solicitado.",
    verify: "Entrar",
    verifying: "A entrar…",
    invalidCodeFormat: "Introduza os 6 dígitos do código.",
    codeExpired: "Este código expirou ou já foi usado. Peça um novo.",
    tooManyAttempts: "Demasiadas tentativas. Peça um novo código dentro de 15 minutos.",
    tooManyRequests: "Demasiados pedidos. Tente de novo dentro de alguns minutos.",
    genericError: "Não foi possível entrar. Tente de novo.",
    useAnotherEmail: "Usar outro email",
    consentPrefix: "Ao entrar, aceita os ",
    termsLink: "Termos de Serviço",
    consentMiddle: " e a ",
    privacyLink: "Política de Privacidade",
    consentSuffix: ".",
  },
  confirm: {
    metaTitle: "Confirmar entrada",
    title: "Confirmar entrada",
    body: "Para terminar, carregue no botão. Se não pediu este acesso, pode ignorar o email.",
    button: "Entrar",
    missingToken: "Esta ligação está incompleta. Peça um novo código.",
    backToLogin: "Voltar a Entrar",
  },
  email: {
    subject: "O seu código de entrada no {name}: {code}",
    preheader: "Código de 6 dígitos válido durante 10 minutos.",
    greeting: "Olá,",
    codeIntro: "O seu código para entrar no {name} é:",
    validity: "O código é válido durante 10 minutos e só pode ser usado uma vez.",
    linkIntro:
      "Prefere abrir uma ligação? Abra-a e carregue em «Entrar» na página que aparece:",
    linkButton: "Abrir a página de entrada",
    ignore: "Se não pediu este código, ignore este email: ninguém entra sem ele.",
    signature: "A equipa {name}",
  },
  shell: {
    nav: "Navegação da área de trabalho",
    projects: "Projetos",
    account: "Conta",
    signOut: "Terminar sessão",
    signingOut: "A terminar…",
    signedInAs: "Sessão iniciada como {email}",
  },
};

const en: AuthCopy = {
  login: {
    metaTitle: "Sign in",
    title: "Sign in to {name}",
    intro:
      "Enter your email. We send you a 6-digit code and a link to sign in, no password needed.",
    emailLabel: "Email",
    emailPlaceholder: "name@company.com",
    sendCode: "Send code",
    sending: "Sending…",
    invalidEmail: "Enter a valid email address.",
    codeIntro:
      "If {email} is correct, we sent you a 6-digit code and a link. Both are valid for 10 minutes.",
    codeLabel: "6-digit code",
    codeHint:
      "You can also open the link in the email. If you cannot see it, check your spam folder.",
    verify: "Sign in",
    verifying: "Signing in…",
    invalidCodeFormat: "Enter the 6 digits of the code.",
    codeExpired: "This code has expired or was already used. Request a new one.",
    tooManyAttempts: "Too many attempts. Request a new code in 15 minutes.",
    tooManyRequests: "Too many requests. Try again in a few minutes.",
    genericError: "Could not sign in. Please try again.",
    useAnotherEmail: "Use another email",
    consentPrefix: "By signing in you accept the ",
    termsLink: "Terms of Service",
    consentMiddle: " and the ",
    privacyLink: "Privacy Policy",
    consentSuffix: ".",
  },
  confirm: {
    metaTitle: "Confirm sign-in",
    title: "Confirm sign-in",
    body: "To finish, press the button. If you did not ask for this access you can ignore the email.",
    button: "Sign in",
    missingToken: "This link is incomplete. Request a new code.",
    backToLogin: "Back to sign in",
  },
  email: {
    subject: "Your {name} sign-in code: {code}",
    preheader: "A 6-digit code valid for 10 minutes.",
    greeting: "Hello,",
    codeIntro: "Your code to sign in to {name} is:",
    validity: "The code is valid for 10 minutes and can be used once.",
    linkIntro: "Prefer a link? Open it and press “Sign in” on the page that appears:",
    linkButton: "Open the sign-in page",
    ignore:
      "If you did not ask for this code, ignore this email: nobody signs in without it.",
    signature: "The {name} team",
  },
  shell: {
    nav: "Workspace navigation",
    projects: "Projects",
    account: "Account",
    signOut: "Sign out",
    signingOut: "Signing out…",
    signedInAs: "Signed in as {email}",
  },
};

export const authCopy: Record<Locale, AuthCopy> = { en, pt };
