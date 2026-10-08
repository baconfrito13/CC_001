import Link from "next/link";
import { type Locale, type PricingPlan, pricing, site } from "@/config/site";
import type { Dictionary } from "@/content";
import { fill, formatPrice } from "@/lib/format";
import { localeMeta } from "@/lib/i18n";
import { primaryCtaHref } from "@/lib/links";
import { localizedPath } from "@/lib/locale-path";
import { CheckoutButton } from "./CheckoutButton";
import { Section } from "./Section";
import { button } from "./ui";

interface PricingProps {
  locale: Locale;
  dict: Dictionary;
  /** "teaser" is a compact strip for the home page, "full" the complete page. */
  variant: "teaser" | "full";
}

function intervalLabel(plan: PricingPlan, dict: Dictionary): string {
  if (plan.price === 0) return "";
  if (plan.interval === "month") return dict.pricing.perMonth;
  if (plan.interval === "year") return dict.pricing.perYear;
  return dict.pricing.oneTime;
}

function planPrice(plan: PricingPlan, locale: Locale, dict: Dictionary): string {
  return plan.price === 0
    ? dict.pricing.free
    : formatPrice(plan.price, plan.currency, localeMeta[locale].intl);
}

/** The action for one plan: external checkout link, Stripe Checkout, or the waitlist. */
function PlanAction({
  plan,
  locale,
  dict,
}: {
  plan: PricingPlan;
  locale: Locale;
  dict: Dictionary;
}) {
  const planName = plan.name[locale];
  const style = plan.highlighted ? button.primary : button.secondary;

  if (plan.checkoutUrl) {
    return (
      <a href={plan.checkoutUrl} rel="noopener noreferrer" className={`${style} w-full`}>
        {fill(dict.pricing.ctaCheckout, { plan: planName })}
      </a>
    );
  }
  if (plan.stripePriceId) {
    return (
      <CheckoutButton
        planId={plan.id}
        locale={locale}
        highlighted={plan.highlighted}
        label={fill(dict.pricing.ctaCheckout, { plan: planName })}
        redirectingLabel={dict.pricing.redirecting}
        errorMessage={dict.pricing.checkoutError}
        notConfiguredMessage={dict.pricing.checkoutNotConfigured}
      />
    );
  }
  const href = primaryCtaHref(locale);
  return (
    <a href={href} className={`${style} w-full`}>
      {href.startsWith("mailto:") ? dict.pricing.ctaContact : dict.pricing.ctaWaitlist}
    </a>
  );
}

export function Pricing({ locale, dict, variant }: PricingProps) {
  const plans = pricing.plans;
  const paid = plans.filter((plan) => plan.price > 0);

  if (variant === "teaser") {
    const cheapest = paid.length > 0 ? Math.min(...paid.map((plan) => plan.price)) : null;
    const cheapestPlan = paid.find((plan) => plan.price === cheapest);
    return (
      <Section
        id="pricing"
        title={dict.pricing.teaserTitle}
        intro={
          cheapestPlan
            ? fill(dict.pricing.teaserIntro, {
                price: formatPrice(
                  cheapestPlan.price,
                  cheapestPlan.currency,
                  localeMeta[locale].intl,
                ),
              })
            : dict.pricing.intro
        }
        tone="muted"
      >
        <ul className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground"
            >
              <span className="font-semibold">{plan.name[locale]}</span>
              <span>
                <span className="text-xl font-bold">{planPrice(plan, locale, dict)}</span>{" "}
                <span className="text-sm text-muted-foreground">
                  {intervalLabel(plan, dict)}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href={localizedPath(locale, "/pricing")} className={button.secondary}>
            {dict.pricing.teaserCta}
          </Link>
        </p>
      </Section>
    );
  }

  return (
    <Section id="pricing" as="h1" title={dict.pricing.title} intro={dict.pricing.intro}>
      <ul className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className={`flex flex-col rounded-2xl border bg-card p-6 text-card-foreground ${
              plan.highlighted ? "border-2 border-brand shadow-lg" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold">{plan.name[locale]}</h2>
              {plan.highlighted ? (
                <span className="rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-brand-foreground">
                  {dict.pricing.mostPopular}
                </span>
              ) : null}
            </div>
            {plan.description ? (
              <p className="mt-2 text-muted-foreground">{plan.description[locale]}</p>
            ) : null}
            <p className="mt-6">
              <span className="font-display text-4xl font-bold">
                {planPrice(plan, locale, dict)}
              </span>{" "}
              <span className="text-muted-foreground">{intervalLabel(plan, dict)}</span>
            </p>
            <h3 className="sr-only">{dict.pricing.included}</h3>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features[locale].map((feature) => (
                <li key={feature} className="flex gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                    className="mt-0.5 shrink-0 text-accent"
                  >
                    <path
                      d="m4.5 10.5 3.5 3.5 7.5-8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <PlanAction plan={plan} locale={locale} dict={dict} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">
        {fill(dict.pricing.taxNote, { name: site.name })}
      </p>
    </Section>
  );
}
