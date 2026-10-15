import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "pages-publication.spec.ts",
  workers: 1,
  timeout: 90_000,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3107", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-320", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 720 } } },
  ],
  webServer: {
    command: "npm run build && npm run serve:e2e",
    env: { NEXT_PUBLIC_BASE_PATH: "/github-copilot-business-labs", PORT: "3107" },
    url: "http://127.0.0.1:3107/github-copilot-business-labs/",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});