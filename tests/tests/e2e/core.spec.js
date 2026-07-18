const { test, expect } = require('@playwright/test');

// These tests run against a real `next start` server (see playwright.config.js)
// talking to the real Supabase project configured in frontend/.env.local.
// No test-account credentials are available in this environment, so
// authenticated flows (sign-in, dashboard, role-gated pages) are not
// exercised here — only anonymous/public behavior and middleware redirects,
// which don't require a live session.

test('visitor sees the marketing home page, not the student dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Try a free mock/ })).toBeVisible();
  await expect(page.getByText('Estimated overall band')).not.toBeVisible();
});

test('protected student route redirects an anonymous visitor to login', async ({ page }) => {
  await page.goto('/lectures');
  await page.waitForURL(/\/login\?required=1/);
});

test('protected staff route redirects an anonymous visitor to login', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForURL(/\/login\?required=1/);
});

test('paid-only Resources route redirects an anonymous visitor to login, not straight to the paid gate', async ({ page }) => {
  // Middleware checks auth before the paying-client check, so a signed-out
  // visitor is bounced to /login first; the /restricted?reason=paid gate
  // only fires for an authenticated-but-non-paying session.
  await page.goto('/resources');
  await page.waitForURL(/\/login\?required=1/);
});

test('compare page lists a Free tier alongside the three paid plans', async ({ page }) => {
  await page.goto('/compare');
  const table = page.locator('table.data-table');
  await expect(table.locator('th', { hasText: 'Free' })).toBeVisible();
  await expect(table.locator('th', { hasText: 'Practice Essentials' })).toBeVisible();
  await expect(table.locator('th', { hasText: 'Complete Accelerator' })).toBeVisible();
  await expect(table.locator('th', { hasText: 'Pro Coaching' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get started free' })).toBeVisible();
});

test('login page renders email/password fields', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('input[name=email]')).toBeVisible();
  await expect(page.locator('input[name=password]')).toBeVisible();
});

test('restricted page itself requires auth (only reachable via a role/paid redirect, never directly by an anonymous visitor)', async ({ page }) => {
  await page.goto('/restricted');
  await page.waitForURL(/\/login\?required=1/);
});

test('PWA manifest and service worker are served', async ({ page }) => {
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const sw = await page.request.get('/sw.js');
  expect(sw.ok()).toBeTruthy();
});
