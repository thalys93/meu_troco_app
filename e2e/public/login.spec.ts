import { test, expect } from '@playwright/test';
import { clearAppStorage } from '../helpers/storage';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test('exibe formulário e link para registro', async ({ page }) => {
    await page.goto('/oauth/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByPlaceholder('john@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your Password')).toBeVisible();

    const submitButton = page.getByRole('button', { name: 'Access' });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    await expect(page.getByRole('link', { name: 'Create one now' })).toBeVisible();

    await page.getByRole('link', { name: 'Create one now' }).click();
    await expect(page).toHaveURL(/\/oauth\/register/);
  });
});
