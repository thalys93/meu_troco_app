import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carrega a página e navega para login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Meu Troco').first()).toBeVisible();

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/oauth\/login/);
  });
});
