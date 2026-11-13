
import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  reporter: 'list',

  use: {
    baseURL:
      'http://127.0.0.1:3100/digital-forensics-resource-directory/',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],

  webServer: {
    command:
      'npm run start -- --host 127.0.0.1 --port 3100 --no-open',

    url:
      'http://127.0.0.1:3100/digital-forensics-resource-directory/',

    reuseExistingServer: !process.env.CI,

    timeout: 120000,
  },
});
