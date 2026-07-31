import { test, expect } from '@playwright/test';

test.describe('kitchen sink', () => {
  test('loads and exposes core sections', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/index.html');
    await expect(page).toHaveTitle(/Kitchen Sink/i);
    await expect(page.locator('#buttons')).toBeVisible();
    await expect(page.locator('#forms')).toBeVisible();
    await expect(page.locator('.button.primary').first()).toBeVisible();
    await expect(page.locator('[data-tabs]').first()).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('docs smoke', () => {
  test('button page demos render', async ({ page }) => {
    await page.goto('/docs/button.html');
    await expect(page.locator('.docs-brand')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Button', exact: true })).toBeVisible();
    await expect(page.locator('.docs-main .button.primary').first()).toBeVisible();
    await expect(page.locator('.docs-main .button.is-loading').first()).toBeVisible();
  });

  test('lifecycle documents createLF', async ({ page }) => {
    await page.goto('/docs/lifecycle.html');
    await expect(page.getByRole('heading', { name: 'Lifecycle API' })).toBeVisible();
    await expect(page.locator('.docs-main')).toContainText('createLF');
    await expect(page.locator('.docs-main')).toContainText('lazySelector');
  });

  test('tooltip page has live tip', async ({ page }) => {
    await page.goto('/docs/tooltip.html');
    await expect(page.getByRole('heading', { name: 'Tooltip', exact: true })).toBeVisible();
    await expect(page.locator('.docs-main .has-tip[data-tip]').first()).toBeVisible();
  });
});
