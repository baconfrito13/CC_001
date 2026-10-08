# Checklist · Accessibility (WCAG 2.2 AA)

Used by: builders while building (★ = check on every new page/component), `qa-engineer` in `06-qa` Step 4, `legal` for the accessibility statement (EU Accessibility Act context: verify applicability to the product at execution time).
Targets: **zero serious/critical axe violations** on every route × locale × viewport {390, 1280}; every item below `pass` or `N/A (reason)`. Automated tools find only a part of the issues: the manual rows are mandatory.
Reference: https://www.w3.org/WAI/WCAG22/quickref/ (re-check criteria numbers at execution time).

## 1. Automated gate

| ID | Check | How to verify | Sev |
|---|---|---|---|
| AX-01 ★ | axe finds no serious/critical violation on any route, both locales, two viewports, and in non-default states (menu open, dialog open, form error, consent banner visible) | `@axe-core/playwright` test (snippet in `factory/playbooks/06-qa.md` Step 4); tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` | P1 |
| AX-02 | moderate violations ≤ 3 open, each justified; minor logged | same run, filter by `impact` | P2/P3 |
| AX-03 | Lighthouse accessibility category = 100 on static pages (≥ 95 elsewhere) | `CHROME_PATH=/opt/pw-browsers/chromium npx lighthouse@latest <url> --only-categories=accessibility --chrome-flags="--headless=new --no-sandbox"` | P2 |
| AX-04 | HTML valid enough for assistive tech: no duplicate ids, valid ARIA attributes/roles | `npx html-validate dist/**/*.html` or `.next/server/app/**/*.html` (verify path), axe `aria-*` rules | P2 |

## 2. Perceivable

| ID | Check | How to verify | Sev |
|---|---|---|---|
| PE-01 ★ | Every informative image has meaningful `alt`; decorative images `alt=""`; icons-only buttons have accessible names | axe `image-alt`, `button-name`; grep `<img`/`Image` without alt | P1 |
| PE-02 ★ | Text contrast ≥ 4.5:1 (≥ 3:1 for large text ≥ 24 px or 18.66 px bold); UI component and focus indicator contrast ≥ 3:1 | axe `color-contrast`; compute brand token pairs from `brand/tokens.json` in both light and dark | P1 |
| PE-03 | Information not conveyed by color alone (errors, status, links in text) | visual review with a grayscale emulation (`page.emulateMedia` + CSS filter in a test screenshot) | P2 |
| PE-04 ★ | Reflow: no horizontal scroll at 320 CSS px width and 400% zoom; no clipped content | Playwright `setViewportSize({width:320,height:800})`, assert `scrollWidth <= innerWidth` | P1 |
| PE-05 | Text can be resized to 200% and text spacing overridden (line-height 1.5, letter 0.12em, word 0.16em, paragraph 2em) without loss | inject spacing CSS in a test, screenshot compare | P2 |
| PE-06 | Content works in portrait and landscape; no orientation lock | emulate both | P3 |
| PE-07 | Video has captions/transcript; audio has transcript; autoplay with sound absent; no flashing > 3/s | review each media element | P1 |
| PE-08 | Dark mode/forced colors keep contrast and focus visibility | `page.emulateMedia({ colorScheme: 'dark' })`, `forcedColors: 'active'` + axe + screenshots | P2 |

## 3. Operable

| ID | Check | How to verify | Sev |
|---|---|---|---|
| OP-01 ★ | Everything usable by keyboard alone, logical Tab order, no keyboard trap | Playwright: press Tab N times collecting `document.activeElement` description; complete each flow without mouse | P1 |
| OP-02 ★ | Focus is always visible (≥ 2 px, contrast ≥ 3:1) and never hidden behind sticky headers/banners (2.4.11) | screenshot after Tab on each control; scroll-margin on anchors | P1 |
| OP-03 | "Skip to content" link first in tab order and works | first Tab reveals it; Enter moves focus to main | P2 |
| OP-04 ★ | Dialogs/menus: focus moves in, is trapped while modal, Escape closes, focus returns to trigger | e2e on consent banner, mobile menu, any modal | P1 |
| OP-05 ★ | Pointer targets ≥ 24×24 CSS px (2.5.8), prefer 44×44 on touch; spacing between small targets | `locator.boundingBox()` assertions on buttons/links in nav and footer | P2 |
| OP-06 | Drag/gesture interactions have single-pointer alternatives (2.5.7); no path-based gestures required | review UI | P2 |
| OP-07 | Page has a unique descriptive `<title>` per route and locale; headings form a logical outline (one `h1`, no skipped levels) | Playwright title/heading dump per route | P2 |
| OP-08 | Link text describes purpose; same-text links go to same place | axe `link-name`; review "click here" | P3 |
| OP-09 | Animations respect `prefers-reduced-motion`; no auto-moving content > 5 s without pause | emulate reduced motion, check CSS | P2 |
| OP-10 | Time limits (sessions, OTP) are announced and extendable, or generous | review flows | P3 |

## 4. Understandable

| ID | Check | How to verify | Sev |
|---|---|---|---|
| UN-01 ★ | `<html lang>` matches page language per locale; language changes inside the page marked with `lang` | read rendered HTML for `/en` and `/pt` | P1 |
| UN-02 ★ | Every form control has a programmatic label; required and format hints are text, not color; autocomplete attributes on identity fields (`email`, `name`, `current-password`) | axe `label`; inspect | P1 |
| UN-03 ★ | Errors are identified in text, associated with the field (`aria-describedby`), announced (`role="alert"` or `aria-live`), and focus moves to the first error | e2e submit invalid form, assert accessible name/description | P1 |
| UN-04 | Redundant entry avoided (3.3.7): data entered earlier is not asked again in the same flow | review checkout/signup | P3 |
| UN-05 | Authentication does not rely on cognitive tests (3.3.8): OTP/passkey/paste allowed, password managers work | paste into fields; no `autocomplete=off` on credentials | P2 |
| UN-06 | Navigation and component naming consistent across pages and locales | review header/footer | P3 |
| UN-07 | Legal/consent text is plain language and reachable; consent banner buttons have equal prominence | visual review | P2 |

## 5. Robust and dynamic content

| ID | Check | How to verify | Sev |
|---|---|---|---|
| RO-01 ★ | Custom widgets have correct name/role/value (prefer native elements); no `div` buttons | axe `aria-allowed-role`, `nested-interactive`; code review | P1 |
| RO-02 | Status messages (toasts, saving, results) use `role="status"`/`aria-live="polite"` without stealing focus | e2e reads live region text after action | P2 |
| RO-03 | Landmarks: one `main`, `nav` labelled when several, `header`/`footer` | `locator.ariaSnapshot()` | P2 |
| RO-04 | Tables have headers/scope; lists use list markup; charts have text alternative or data table | review | P2 |
| RO-05 | Loading/skeleton states are announced or not focus-blocking; no content shift on load (CLS ≤ 0.1) | Lighthouse CLS, e2e | P3 |

## 6. Product-type additions

- **Mobile (Expo):** every pressable has `accessibilityRole` and `accessibilityLabel`; touch targets ≥ 44 pt; supports dynamic type / `allowFontScaling`; contrast in light and dark; screen reader order (VoiceOver/TalkBack) verified on a device (founder task); focus management on navigation.
- **Extension:** popup/options pages pass axe; keyboard operable popup (open via shortcut), focus returns to page after close; content-script UI in shadow DOM keeps contrast on arbitrary pages.
- **Bots:** buttons/inline keyboards labelled; avoid emoji-only meaning; alt text for images sent.
- **Content sites:** heading structure per article, table of contents landmarks, link underlines in body text, ad containers labelled and not trapping focus.

## 7. Documentation

- [ ] Accessibility statement (if `legal` requires it): conformance target WCAG 2.2 AA, known limitations from this audit, contact email, feedback route.
- [ ] Known issues listed in `docs/06-qa-report.md` §5 with severity and plan.

## Snippet: keyboard path capture (Playwright)

```ts
const stops: string[] = [];
for (let i = 0; i < 40; i++) {
  await page.keyboard.press('Tab');
  stops.push(await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el ? `${el.tagName.toLowerCase()}|${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30) ?? ''}` : 'none';
  }));
}
// assert the sequence matches the visual order, and that a focus ring is visible via screenshot clip of each stop
```
