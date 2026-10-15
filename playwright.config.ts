import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: "pages-publication.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-320",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 720 },
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run serve:e2e",
    env: { NEXT_PUBLIC_BASE_PATH: "", PORT: "3000" },
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});