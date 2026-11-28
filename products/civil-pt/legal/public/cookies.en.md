[//]: # "Draft prepared by a factory agent. Not legal advice. Inventory built from docs/04-architecture.md section 14 (the application did not exist yet): repeat the code scan at integration and add any new cookie or storage key here. The consent validity (180 days) must equal CONSENT_MAX_AGE_SECONDS and the session cookie duration (30 days) must equal the application configuration. English is a translation of the Portuguese text, which prevails."

# Cookie Policy

**Effective date:** {{legal.effectiveDate}} · **Last updated:** {{legal.lastUpdated}}

This policy explains what cookies and similar technologies {{site.name}} ([{{site.url}}]({{site.url}})) uses, why, and how you can control them. It is provided by **{{company.legalName}}** ({{company.address}}, {{company.country}}). Read it together with our Privacy Policy, which explains how we process personal data.

## 1. What are cookies and similar technologies

Cookies are small text files that a website stores on your device. Similar technologies, such as local storage, session storage, software identifiers in apps and tracking pixels, work in a comparable way. In this policy we call them all "cookies".

Cookies can be:

- **Session cookies**, which disappear when you close the browser, or **persistent cookies**, which stay for a set period.
- **First-party cookies**, set by us, or **third-party cookies**, set by another company whose service we use.

## 2. The rules and our approach

In Portugal and the European Union, storing information on your device, or accessing information already stored there, requires your **prior consent**, except where it is **strictly necessary** to provide a service you expressly asked for or to carry out a communication (Lei n.º 41/2004, article 5, which implements the ePrivacy Directive).

When we need your consent:

- we ask before storing or reading anything;
- refusing is as easy as accepting and no option is pre-selected;
- we do not make the service depend on accepting cookies that are not necessary for it;
- you can change your mind at any time.

Where cookies involve personal data, the General Data Protection Regulation (GDPR) also applies; see our Privacy Policy.

## 3. Types of cookies

- **Strictly necessary:** essential to provide the service you asked for, for example keeping you signed in, protecting forms against forgery, balancing server load or remembering your cookie choice. They do not need your consent.
- **Preferences:** remember settings such as language or layout when not strictly necessary to provide the service. They need your consent.
- **Statistics:** help us understand how the service is used. They need your consent when they store or read information on your device.
- **Marketing:** build profiles or display and measure advertising. They always need your consent.
- **Embedded content:** videos, maps or social media posts supplied by other companies, which may set their own cookies. They need your consent.

## 4. What we use

Besides strictly necessary cookies, we only use cookies if you accept them in our cookie banner. We do not use preference, marketing or embedded-content cookies.

**Strictly necessary (no consent needed)**

| Name | Provider | Purpose | Duration | First or third party |
|---|---|---|---|---|
| `sb-<reference>-auth-token` (and, if large, numbered parts such as `.0` and `.1`) | {{site.name}} (authentication supplied by Supabase) | Keep you signed in after you enter the sign-in code | Up to 30 days | First party |
| `consent` (cookie) and `consent` (browser local storage) | {{site.name}} | Store your cookie choice (accept or reject) and the date you made it, so we do not ask again | 180 days | First party |
| `__stripe_mid` and `__stripe_sid` | Stripe | Fraud prevention and security of the payment you asked for. Only set when you open the Stripe payment page, on Stripe's domain | 1 year and 30 minutes, respectively | Third party |

They cannot be switched off in our systems; you can block them in your browser, but parts of the service will stop working (for example, you will not be able to stay signed in or pay).

**Statistics (only if you accept)**

| Name | Provider | Purpose | Duration | First or third party |
|---|---|---|---|---|
| `ph_<key>_posthog` (cookie and equivalent local-storage entry) | PostHog (EU cloud, Frankfurt) | Recognise the browser between visits with a pseudonymous identifier and count pages and actions (for example, creating a project), so we understand how the service is used. It does not store your IP address | 1 year | First party (set on our domain by the PostHog script) |

Consent is valid for 180 days, after which we ask again, or sooner if we change the purposes. To prove that you gave or refused consent, we keep a record of your choice (decision and date) in the `consent` cookie and local storage above. If you refuse, the PostHog script is not loaded and nothing is stored for statistics.

We also measure, on our servers and without identifying anyone, events such as purchases and processing failures. That does not store or read anything on your device.

## 5. Your choices

On your first visit, our banner lets you accept or reject statistics; rejecting is as easy as accepting. You can change or withdraw your choice at any time through "Cookie settings" in the footer of every page. Withdrawing consent does not affect the lawfulness of processing carried out before. You can also delete or block cookies in your browser settings.

## 6. Third-party content and links

{{site.name}} does not embed third-party content that sets cookies and does not load fonts or scripts from external services, other than PostHog (only with your consent). When you go on to pay, you are taken to Stripe's payment page, which sets the cookies listed above on Stripe's domain; Stripe's policy is available on Stripe's website. Links to other websites are governed by those sites' policies.

## 7. Your rights

If cookies involve personal data, you have the rights described in our Privacy Policy: access, rectification, erasure, restriction, portability and objection, as well as the right to withdraw consent at any time. To exercise them, write to [{{contact.privacyEmail}}](mailto:{{contact.privacyEmail}}).

## 8. Changes to this policy

We may update this policy when our use of cookies or the law changes. We will publish the new version here with a new "Last updated" date and, if the changes require your consent, we will ask for it again.

## 9. Contact and complaints

Questions about cookies: [{{contact.privacyEmail}}](mailto:{{contact.privacyEmail}}) · {{company.legalName}}, {{company.address}}, {{company.country}}.

You can complain to the supervisory authority, {{legal.supervisoryAuthority}} ([{{legal.supervisoryAuthorityUrl}}]({{legal.supervisoryAuthorityUrl}})).
