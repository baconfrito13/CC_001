import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * End-to-end tests run against a production build (`next build && next start`).
 *
 * CHROMIUM_PATH (optional): path to a Chromium/Chrome binary to use instead of the browser
 * revision Playwright expects. Needed in sandboxes where only another revision is preinstalled,
 * e.g. CHROMIUM_PATH=/opt/pw-browsers/chromium. In CI, run
 * `npx playwright install --with-deps chromium` and leave it unset.
 */
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    // Deterministic UI language for the browser; tests that care override it.
    locale: "en-GB",
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      // Analytics is enabled for tests that verify consent gating (the script is stubbed).
      NEXT_PUBLIC_ANALYTICS_PROVIDER: "plausible",
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: "acme.example",
      // `next start` runs in production mode, where the console adapter must be explicit.
      WAITLIST_ADAPTER: "console",
    },
  },
});
