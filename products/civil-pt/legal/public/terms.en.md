[//]: # "Draft prepared by a factory agent from docs/02-product.md and docs/02-business.md. Not legal advice. Business-only product: the consumer sections were removed on purpose (legal.sellsToConsumers = false). Prices are not written here so they cannot diverge from the pricing page. The refund promise in section 4 must be identical to the pricing page and the checkout. English is a translation of the Portuguese text, which prevails."

# Terms and Conditions

**Effective date:** {{legal.effectiveDate}} · **Last updated:** {{legal.lastUpdated}}

These Terms govern the use of {{site.name}} ([{{site.url}}]({{site.url}})), provided by **{{company.legalName}}** (tax no. {{company.taxId}}; VAT no. {{company.vatId}}; registration {{company.registration}}), with address at {{company.address}}, {{company.country}} ("we", "us"). {{site.name}} is meant for businesses and professionals. By creating an account, buying or using the service you accept these Terms; "you" means the entity using the service and the person who accepts on its behalf. Read them together with our Privacy Policy and our Cookie Policy.

## 1. The service

{{site.name}} is a web application for people who price construction works (contractors, subcontractors, quantity surveyors and design offices): it reads the geometry of drawings in PDF and helps prepare the bill of quantities.

- **How it works.** You upload a vector PDF exported from a drawing program (CAD), up to 50 MB and 40 pages per file. You set the scale of each sheet. On our servers the service reads the exact geometry (lines, polygons and curves) and groups the elements by graphic style. You review each group over the drawing, confirm or reject it and assign it to an item and chapter of your schedule. Finally you export an Excel file with the bill of quantities and a "Rasto" (trace) sheet that links each quantity back to the drawing.
- **Sheets.** A sheet is one PDF page that is processed. It uses up a sheet only the first time it is processed successfully. These do not use up sheets: technical failures, pages without readable vector geometry (images and scanned documents) and pages where the graphic styles do not allow the elements to be separated. Processing again a sheet already processed in the same project does not use up another sheet. If no group on a sheet ever gets confirmed, you can return the sheet as "did not work" (up to 3 returns per lot of sheets).
- **What it measures.** In plan view, areas, perimeters and lengths; with a uniform thickness that you enter, simple volumes. It does **not** read images or scanned documents or DWG, DXF or IFC files, and does not measure volumes that depend on profiles or levels (for example excavation and fill) or slopes.
- **No artificial intelligence.** The service does not use artificial intelligence to process your drawings: quantities result from geometric calculation.
- **Requirements.** A recent desktop browser with JavaScript enabled, and an Internet connection. There is no mobile app.
- **Beta.** New features may be in beta and marked as such.

## 2. Eligibility and your account

{{site.name}} is for professional use only. By creating an account or buying, you declare that you act within a commercial, industrial, craft or professional activity (and not as a consumer) and that you are at least 18 years old. We do not sell to consumers. Nothing in these Terms reduces the mandatory rights that the law gives to anyone who, despite this declaration, is a consumer.

- Provide true information and keep it up to date. Access is by a 6-digit code or a link sent to your e-mail: keep your mailbox secure and tell us at [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}) if you suspect unauthorised use. You are responsible for what happens in your account.
- Each account has a single user and may not be shared. The free trial is limited to one per e-mail address and may not be circumvented with several accounts.
- You confirm that you have authority to bind your organisation.

## 3. Plans, prices and payment

- **Free trial.** Each new account gets 5 sheets, valid for 14 days, with no card needed. Unused sheets expire at the end of that period.
- **Passes.** A one-off payment for a lot of 20, 60 or 150 sheets, valid for 90 days from purchase. They do not renew.
- **Monthly subscriptions** (Independente: 15 sheets a month; Empresa: 50; Gabinete: 120). Each monthly payment creates a lot of sheets valid for 90 days, so unused sheets accumulate for 3 months and expire afterwards. The subscription renews every month, at the price then in force, until it is cancelled.
- **How sheets are used.** Each processed sheet is taken from the lot that expires first. Sheets have no cash value, cannot be transferred and those that expire are lost. In case of a refund, the unused sheets are revoked.
- **Prices.** The price of each offer is the one shown on the pricing page at the time of purchase, in euros and excluding VAT, and is confirmed at checkout before you pay. Announced launch offers (for example a special price for the first companies to subscribe) are kept, under the terms of the offer, while the subscription stays active without interruption.
- **Who sells and how you pay.** The purchase contract is made with {{company.legalName}}. Card payments (and any other methods the checkout offers) are processed by Stripe. We never see or store your card number.
- **Taxes and invoices.** Prices exclude VAT. VAT, or the reverse charge on sales to businesses in other EU countries with a valid VAT number, is applied under the law and the tax information you give at checkout; the total is shown before you pay. Give your correct VAT number and billing details: we issue the invoice in the name of the entity you state and cannot change it once issued, except where the law allows.
- **Cancelling.** You can cancel a subscription at any time in the customer portal (in two clicks); cancellation takes effect at the end of the period already paid, access and sheets remain until then and until their expiry, and no new charges are made.
- **Price changes.** We may change prices for future periods. We will tell you at least 30 days in advance and you can cancel before the change takes effect. Passes and sheets already paid are not affected.
- **Failed payments.** If a subscription payment fails, we keep your access and balance for 7 days so you can fix it. After that period with no payment, the subscription ends and no new lot of sheets is created; sheets already paid remain usable until they expire.
- **Payment disputes.** If your bank opens a dispute about a payment, the sheet balance is frozen until the final decision.

## 4. Refunds

As a commercial courtesy, we refund on request, up to 14 days after payment of an account's first purchase (a Pass or the first monthly payment of a subscription):

- **Full refund** (including the corresponding VAT), if you have not used any sheet or if the sheets used were returned as "did not work";
- **Proportional refund** for the unused sheets, in other cases: price paid ÷ sheets in the lot × unused sheets (for example, on a 60-sheet Pass with 10 used, we return 50/60 of the price paid).

To ask for a refund, write to [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}). We refund to the same payment method, at no cost to you, within 14 days of the request. This courtesy is not the consumer right of withdrawal (which does not apply to contracts between professionals) and does not affect the rights the law gives you. Later monthly payments of a subscription are not refundable: cancel before renewal. A refund revokes the unused sheets.

## 5. Acceptable use

You agree not to: break the law or third parties' rights; upload files you have no right to process, or malicious software; try to disrupt, probe or bypass the security or the limits of the service (including creating several accounts to get more free trials); access it by automated means beyond what the service allows (mass extraction, reverse engineering, excessive load), unless the law allows it; share the account; resell access to the service; or use the service to deceive people or to create or distribute unlawful content. We may suspend access to put an end to abuse (see section 12).

## 6. Your content

You keep all rights in the files, projects and schedules you upload or create. You grant us a non-exclusive, worldwide licence to host, process, display and copy that content only as far as needed to provide and protect the service. You declare that you have the right to upload and process the drawings (including, where relevant, the permission of the project owner or designer and compliance with confidentiality duties and the copyright in tender documents) and that they do not break the law. We do not use your content to advertise to you or to third parties.

**Unlawful content.** Your content is private to your account and we do not disseminate it to the public. Even so, anyone can report content they consider unlawful by writing to [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}), with the reasons and the exact location. We examine reports diligently and objectively. If we remove or restrict content, or suspend or close an account, because it is unlawful or breaches these Terms, we send you a statement of reasons with the decision, the facts and grounds, any use of automated means and how to contest it (reply to that message within 6 months; we review with human involvement). We may report to the authorities situations that give rise to a suspicion of a threat to life or safety or of a serious crime.

## 7. Our intellectual property

The service, its software, design, trademarks and documentation belong to us or our licensors. We grant you a limited, non-exclusive, non-transferable right to use the service during your plan and for its intended purposes. Open-source components are governed by their own licences. If you send us suggestions, we may use them freely, with no obligation to you.

## 8. Availability, support and changes to the service

We try to keep the service available and secure, but we do not guarantee uninterrupted operation: maintenance, third-party failures or events beyond our control may affect it. The time a sheet takes to process varies with the file and the load on the service and is not guaranteed. Unless a separate agreement sets a service level, there is no availability commitment. Support is available by e-mail at [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}); we try to reply within a few working days, with no commitment on timing.

We may update and improve the service. If a change materially reduces the features you contracted for, we will inform you 30 days in advance, by e-mail, and you may end the contract within that period, with a refund of the unused part of any prepaid period.

## 9. Results and responsibility for review

{{site.name}} is a measurement assistant. It presents quantities calculated from the geometry of the PDFs for you to review; it does not certify or sign measurements, does not replace the estimator and does not guarantee a level of accuracy. We do not state accuracy percentages.

- Review by the user is mandatory before exporting. You are responsible for confirming the scale of each sheet, for checking each quantity against the original drawings (the "Rasto" sheet of the Excel file helps) and for deciding how you use the result.
- The service may not detect every element in a drawing and groupings by graphic style may join different elements or separate identical ones. Results depend on the quality of the PDF.
- We do not give technical or legal advice (for example, on errors and omissions in public procurement procedures).
- If you find an error in the service, tell us; we will fix it diligently. A sheet processed with a technical error can be returned (section 1).

## 10. Liability

Nothing in these Terms excludes or limits liability that cannot be excluded or limited by law, including liability for wilful misconduct or gross negligence, or for death or personal injury.

To the extent the law allows, we are not liable for indirect or consequential damage, loss of profit, revenue, business opportunities or data, nor for pricing decisions, bids, prices or losses in tenders based on the quantities, which are your responsibility (section 9). Our total liability for any claim arising from the service is limited to the amount you paid us in the 12 months before the event giving rise to the claim.

## 11. Personal data and confidentiality

We process personal data as described in the Privacy Policy. If the drawings you upload contain other people's personal data, we act as your processor under a data processing agreement, which forms part of these Terms and is available, in English, on request at [{{contact.privacyEmail}}](mailto:{{contact.privacyEmail}}). Among other matters, it provides for the list of sub-processors (with 30 days' notice before adding one) and notice of data breaches within 48 hours.

We treat your files and schedules as confidential information. We do not read them or share them with anyone, except: (a) with your authorisation, to give you support; (b) as far as needed to keep the service secure and working; (c) with the providers that host it, as processors; and (d) where the law requires. We do not use them to train artificial intelligence models, and the drawings are not sent to any artificial intelligence provider.

## 12. Term, cancellation, suspension, export and switching

You can cancel at any time (section 3) or ask for the account to be closed at [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}) (or in the application, when the option exists). Except as provided in section 4 and by law, no refund is due for the remainder of a period already paid. We may suspend or end your access if you seriously breach these Terms and do not fix the situation within a reasonable time after our notice, or immediately in case of serious abuse, unlawful activity or risk to the service or to others. If we end the contract through no fault of yours, we refund the unused part of any prepaid period.

**Exporting your data and switching provider.** While the account is active, you can export your bills of quantities to Excel whenever you want. If you want to switch to another provider or take the data in-house:

- tell us in writing at [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}); the contract ends at the end of the period already paid and never more than 2 months after the notice;
- the transition takes 30 days at most;
- after the contract ends you have 30 days to retrieve your data; we delete it afterwards (see the Privacy Policy);
- you can retrieve the PDF files you uploaded, your projects, scales, groups and quantities and the bills of quantities, in a structured, commonly used format (Excel and, on request, JSON);
- we do not charge fees for exporting or for switching provider.

## 13. Changes to these Terms

We may change these Terms for valid reasons (for example legal changes, new features, security). We will inform you at least 30 days in advance of material changes, by e-mail or in the service. If you disagree, you can cancel before the change takes effect; if you keep using the service after that date, the new Terms apply. Changes to essential conditions (price, scope) for a period already paid only apply from the next renewal.

## 14. Governing law, courts and complaints

These Terms are governed by {{legal.governingLaw}}. Exclusive jurisdiction lies with {{legal.jurisdiction}}, without prejudice to the mandatory rights that the law gives to anyone who is a consumer.

**Complaints.** Contact us first at [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}). You can also use the Electronic Complaints Book: [{{legal.complaintsBookUrl}}]({{legal.complaintsBookUrl}}).

## 15. General

These Terms and the documents they refer to are the entire agreement between us about the service. You declare that you read and accepted these Terms before creating the account or paying. If a provision is invalid, the others remain in force. Delay in exercising a right is not a waiver. We may transfer our rights and obligations to a successor to the business; you may not transfer yours without our consent. These Terms are made available in Portuguese and English; if they differ, the Portuguese version prevails.

## 16. Contact

{{company.legalName}} · {{company.address}}, {{company.country}} · [{{contact.email}}](mailto:{{contact.email}}) · Support: [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}).
