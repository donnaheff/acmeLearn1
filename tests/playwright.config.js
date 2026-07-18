const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    // Pinned browser version can drift from the sandbox's pre-installed
    // build; point straight at it rather than downloading a matching one.
    launchOptions: { executablePath: '/opt/pw-browsers/chromium' },
  },
  webServer: {
    command: 'npm run start --prefix ../frontend',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
});
