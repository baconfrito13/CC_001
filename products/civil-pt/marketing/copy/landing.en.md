# Landing — en (final)

> Final copy for the integration step. Keys = `Dictionary` in `app/src/content/types.ts` (checked 2026-11-28; `types.ts` wins if it changes). Plans = `pricing.plans[]` in `app/src/config/site.ts`. Written natively in English for the Portuguese market (English-speaking estimators working in Portugal, international readers), not translated line by line. Claims follow PRD §7: no accuracy percentages, no AI, no tender-law angle, no "data only in the EU".

---
locale: en
mode: waitlist            # CTA = request a demo; the "live" variant is at the end of the file
---

## meta
homeTitle: Quantity takeoff from PDF plans, with a trace | {name}
description: Measures vector PDF plans, shows every quantity on the drawing and exports the bill of quantities to Excel, with a trace to the sheet. Request a demo.
pricingTitle: Pricing: per-tender pass or monthly | {name}
pricingDescription: A per-tender pass or a monthly plan, in euros with no lock-in. Pick the sheet bundle that fits the tender. Prices exclude VAT.
ogCaption: Every quantity, traced to the sheet

## hero
eyebrow: For estimators of paving, landscaping and utility works
title: Every quantity, traced to the sheet
subtitle: {name} reads vector PDF plans exported from CAD, shows each quantity on the drawing for you to confirm, and exports the bill of quantities to Excel.
primaryCta: Request a demo
secondaryCta: See how it works
note: Reads vector PDF exported from CAD only. It does not read DWG or scanned PDF.

## problem
title: Measuring by hand costs hours, and the number must hold up
intro: The tender lands, the clock starts, and the drawings arrive as PDF.
items:
- title: Hours of manual takeoff
  body: Paving areas, kerbs, drainage channels and pipes measured one by one across the PDF, AutoCAD and Excel, with the deadline running.
- title: Hard-to-defend numbers
  body: Handing a figure to the technical director or the supervisor without knowing which drawing it came from costs time and trust.
- title: Deadlines that do not wait
  body: Sending more bids in less time is easy to ask for and hard to deliver without leaving something out.

## features
title: What {name} does
intro: Geometry is read from the PDF and reviewed by you, on the drawing, before anything is exported.
items:
- title: Quantities read from the drawing
  body: Areas, perimeters and lengths come from the vector PDF's geometry, converted to the sheet's scale, with no measuring by eye.
- title: Confirmed on the drawing
  body: Each group of elements is highlighted on the sheet. Accept or reject it right there, in the table or from the keyboard.
- title: Excel with a trace
  body: The bill of quantities comes in chapters, items and units, with a "Trace" sheet that links every quantity to its sheet and group.
- title: Portuguese-first, in euros
  body: Interface in European Portuguese or English, Portuguese measurement terms and prices in euros, per tender or monthly, with no lock-in.
- title: Files stored in the EU
  body: PDFs sit in private EU storage and can be deleted. In this version, your drawings are not sent to any AI provider.
- title: Honest about its limits
  body: Images, scans and DWG are refused with a clear message. Volumes that depend on cross-sections are left out.

## howItWorks
title: How it works
intro: From PDF to bill of quantities in three steps.
steps:
- title: Upload the PDF
  body: Create a project and upload the drawings. The file goes straight to private storage.
- title: Confirm on the drawing
  body: Check the scale, review each group on the sheet and accept or reject. The review is always yours.
- title: Export to Excel
  body: Assign groups to items and export the bill, with the Trace sheet to justify every quantity.

## pricing
title: Pricing per tender or per month
intro: A per-tender pass with one payment, or a monthly plan. In euros, with no lock-in.
teaserTitle: Pay per tender
teaserIntro: Sheet bundles from {price}, excluding VAT, with no subscription required.
teaserCta: See all pricing
perMonth: / month
perYear: / year
oneTime: one-time payment
free: Free
mostPopular: Recommended
ctaCheckout: Choose {plan}
ctaWaitlist: Request a demo
ctaContact: Talk to us
redirecting: Redirecting to checkout...
checkoutError: We could not start the payment. Please try again in a moment.
checkoutNotConfigured: Online payment is not available yet. Request a demo and we will let you know when it is.
checkoutSuccess: Thank you! We received your payment and the confirmation follows in a moment.
checkoutCancelled: Payment cancelled. You have not been charged.
taxNote: Prices in euros, excluding VAT. Any VAT that applies is shown at checkout.
included: What is included

## plans
# ids = `pricing.plans[].id` in site.ts. One sheet = one PDF page processed successfully.
pass-20:
  name: Pass 20
  description: One small tender or one freelance job.
  features:
  - 20 sheets, valid for 90 days
  - One payment, no subscription
  - Excel export with the Trace sheet
  - Sheet returned to your balance if it "did not work"
  - Refund on request within 14 days (first purchase)
pass-60:
  name: Pass 60
  description: A medium tender for a contractor's estimator.
  features:
  - 60 sheets, valid for 90 days
  - One payment, no subscription
  - Excel export with the Trace sheet
  - Sheet returned to your balance if it "did not work"
  - Refund on request within 14 days (first purchase)
pass-150:
  name: Pass 150
  description: A large tender, or several at once.
  features:
  - 150 sheets, valid for 90 days
  - One payment, no subscription
  - Excel export with the Trace sheet
  - Sheet returned to your balance if it "did not work"
  - Refund on request within 14 days (first purchase)
independente:
  name: Freelancer
  description: Monthly, for subcontractors and independent estimators.
  features:
  - 15 sheets a month
  - Each month's sheets valid for 90 days
  - Cancel in two clicks, no lock-in
  - Excel export with the Trace sheet
  - Sheet returned to your balance if it "did not work"
empresa:
  name: Company
  description: Monthly, for contractors with a steady flow of tenders.
  features:
  - 50 sheets a month
  - Each month's sheets valid for 90 days
  - Cancel in two clicks, no lock-in
  - Excel export with the Trace sheet
  - Sheet returned to your balance if it "did not work"
gabinete:
  name: Studio
  description: Monthly, for design offices with several tenders at once.
  features:
  - 120 sheets a month
  - Each month's sheets valid for 90 days
  - Cancel in two clicks, no lock-in
  - Excel export with the Trace sheet
  - Sheet returned to your balance if it "did not work"

## faq
title: Frequently asked questions
intro: Cannot find the answer you need? Write to us and we will reply.
items:
- question: What files does it read, and what does it measure?
  answer: It reads vector PDF exported from CAD. It measures areas, perimeters and lengths on plan (paving, kerbs, channels, pipes). It does not read DWG, images or scanned PDF, and it does not measure volumes that depend on sections, levels or slopes.
- question: Can I rely on the quantities?
  answer: The geometry is read straight from the PDF, but the review is always yours. You confirm each group on the drawing before exporting, and the Excel "Trace" sheet shows where each number comes from. {name} does not certify measurements.
- question: Does it use artificial intelligence?
  answer: Not in this version. Geometry is read directly from the vector PDF, with no estimates from an AI model, and your drawings are not sent to any AI provider.
- question: Where are my files stored?
  answer: In private storage in the EU, accessible only to your account. You can delete a project at any time. Files are not used to train AI models. Details are in the privacy policy.
- question: What does it cost, and what about VAT?
  answer: Prices are in euros and exclude VAT, on the pricing page. Any VAT that applies is shown at checkout. Every new account gets 5 evaluation sheets, valid for 14 days, with no card needed.
- question: Can I cancel or get a refund?
  answer: A subscription cancels in two clicks with no lock-in. On a first purchase, refunds are made on request within 14 days of payment: in full if no sheet was used, or pro rata to the unused sheets.
- question: I already use Bluebeam or CYPE Arquimedes. What is this for?
  answer: {name} is not estimating software: it has no price databases and does not export BC3 in this version. It gets the quantities from a vector PDF plan, with a trace, and hands them over in Excel to the tool you already use.
- question: Are support and the interface available in Portuguese?
  answer: Yes. The interface, the terminology and e-mail support are in European Portuguese. The interface is also available in English.

## cta
title: See one of your sheets measured in {name}
body: Leave your e-mail to request a demo. If you like, we can use a sheet from one of your tenders.

## waitlist
emailLabel: Email address
emailPlaceholder: name@company.com
submit: Request a demo
submitting: Sending...
consentPrefix: I agree to receive emails about this request and about {name}, and I have read the 
consentLinkText: privacy policy
consentSuffix: . I can withdraw my consent at any time.
successTitle: Request received
successBody: Thank you. We will reply by email to arrange the demo.

## overrides
- footer.blurb: {name} reads vector PDF plans and delivers the bill of quantities, traced to the sheet. Made in Portugal, priced in euros.
- Launch price (optional, only while `FOUNDER_PRICE_SLOTS` > 0): on the "Company" plan show "Launch price: 79 EUR a month for the first 10 companies, kept for as long as the subscription stays active". No strikethrough price, no countdown; the 99 EUR price has never been charged.
- Fire `demo_requested` on form submit (PRD §9).

## live variant (use in phase 09, once plans have `stripePriceId`/`checkoutUrl` and the evaluation is open)
hero.primaryCta: Start with 5 free sheets
hero.secondaryCta: Request a demo
cta.title: Measure your first sheet
cta.body: Create an account and try 5 evaluation sheets, valid for 14 days, with no card needed.
pricing.ctaWaitlist: Request a demo
nav.cta: Start free
