import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carrega a página e navega para login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Meu Troco').first()).toBeVisible();
    await expect(page.getByText('Finance').first()).toBeVisible();

    await page.getByRole('button', { name: /Entrar|Sign In|Iniciar sesión/ }).click();

    await expect(page).toHaveURL(/\/oauth\/login/);
  });

  test('seções de feature existem no DOM', async ({ page }) => {
    await page.goto('/');

    for (const id of ['dashboard', 'transacoes', 'relatorios', 'previsoes', 'perfil']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('nav Dashboard rola até a seção', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/');

    await page.getByRole('button', { name: /Dashboard|Panel/i }).click();

    const section = page.locator('#dashboard');
    await expect(section).toBeInViewport();
  });
});
