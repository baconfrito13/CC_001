import type { Locale } from "@/config/site";
import { site } from "@/config/site";
import { authCopy } from "@/content/app/auth";
import { fill } from "@/lib/format";

/**
 * The sign-in email (US-01 criterion 1): a 6-digit code AND a link. The link opens a page that
 * only shows the "Entrar" button, so a mail scanner that opens it does not use the token (OB-9).
 *
 * Two renderers share the copy:
 * - `renderLoginEmail`: the finished message, used by the mock sign-in and by any adapter that
 *   sends the email itself;
 * - `supabaseLoginTemplate`: the same message with Supabase's Go-template variables
 *   (`{{ .Token }}`, `{{ .TokenHash }}`, `{{ .RedirectTo }}`), to paste into the project's
 *   "Magic link" template (founder task E). `supabase/templates/login.html` is generated from it.
 */

export interface LoginEmailInput {
  locale: Locale;
  code: string;
  link: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function body(locale: Locale, code: string, link: string, escape: (v: string) => string) {
  const copy = authCopy[locale].email;
  const name = site.name;
  return {
    greeting: escape(copy.greeting),
    codeIntro: escape(fill(copy.codeIntro, { name })),
    code,
    validity: escape(copy.validity),
    linkIntro: escape(copy.linkIntro),
    link,
    linkButton: escape(copy.linkButton),
    ignore: escape(copy.ignore),
    signature: escape(fill(copy.signature, { name })),
    preheader: escape(copy.preheader),
  };
}

export function loginSubject(locale: Locale, code: string): string {
  return fill(authCopy[locale].email.subject, { name: site.name, code });
}

export function renderLoginEmail(input: LoginEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const plain = body(input.locale, input.code, input.link, (v) => v);
  const html = body(input.locale, input.code, input.link, escapeHtml);
  return {
    subject: loginSubject(input.locale, input.code),
    text: [
      plain.greeting,
      "",
      plain.codeIntro,
      "",
      `    ${input.code}`,
      "",
      plain.validity,
      "",
      plain.linkIntro,
      input.link,
      "",
      plain.ignore,
      "",
      plain.signature,
    ].join("\n"),
    html: htmlDocument(input.locale, html, escapeHtml(input.link)),
  };
}

function htmlDocument(locale: Locale, b: ReturnType<typeof body>, href: string): string {
  return `<!doctype html>
<html lang="${locale === "pt" ? "pt-PT" : "en"}">
<body style="margin:0;padding:24px;background:#f5f6f8;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#14202b">
<div style="display:none;max-height:0;overflow:hidden">${b.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:8px;padding:32px">
<tr><td>
<p style="margin:0 0 16px">${b.greeting}</p>
<p style="margin:0 0 8px">${b.codeIntro}</p>
<p style="margin:0 0 16px;font-size:32px;letter-spacing:8px;font-weight:700">${b.code}</p>
<p style="margin:0 0 24px;color:#4a5a69">${b.validity}</p>
<p style="margin:0 0 12px">${b.linkIntro}</p>
<p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;padding:12px 20px;background:#14202b;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600">${b.linkButton}</a></p>
<p style="margin:0 0 16px;color:#4a5a69">${b.ignore}</p>
<p style="margin:0">${b.signature}</p>
</td></tr></table>
</td></tr></table>
</body>
</html>
`;
}

/**
 * The template for Supabase Auth ("Magic link" email). Supabase fills the variables:
 * `{{ .Token }}` (the 6-digit code), `{{ .TokenHash }}` and `{{ .RedirectTo }}` (the
 * `emailRedirectTo` the app passes: `<origin>/<locale>/auth/confirm?next=<path>`). The language
 * comes from the user metadata the app sets at the first request (`{{ .Data.locale }}`).
 */
export function supabaseLoginTemplate(): string {
  const link = "{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email";
  const part = (locale: Locale) => {
    const html = body(locale, "{{ .Token }}", link, escapeHtml);
    return htmlDocument(locale, html, link);
  };
  return `{{ if eq (index .Data "locale") "en" }}${part("en")}{{ else }}${part("pt")}{{ end }}\n`;
}

/** The subject line to type into the Supabase dashboard (it cannot carry the code reliably). */
export function supabaseSubjects(): Record<Locale, string> {
  return {
    pt: fill(authCopy.pt.email.subject, { name: site.name, code: "{{ .Token }}" }),
    en: fill(authCopy.en.email.subject, { name: site.name, code: "{{ .Token }}" }),
  };
}
