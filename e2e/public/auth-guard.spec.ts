import { test, expect } from '@playwright/test';
import { clearAppStorage } from '../helpers/storage';

test.describe('Auth guard', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test('redireciona /dashboard para login quando não autenticado', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/oauth\/login/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByPlaceholder('john@example.com')).toBeVisible();
  });
});
