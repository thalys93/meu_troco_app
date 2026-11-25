import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carrega a página e navega para login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Meu Troco').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/salário|Payday|sueldo/i);

    await page.getByRole('button', { name: /Entrar|Sign In|Iniciar sesión/ }).click();

    await expect(page).toHaveURL(/\/oauth\/login/);
  });

  test('seções de feature existem no DOM', async ({ page }) => {
    await page.goto('/');

    for (const id of ['dashboard', 'transacoes', 'relatorios', 'previsoes', 'como-funciona', 'faq']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('nav Recursos rola até a seção', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/');

    await page.getByRole('button', { name: /Recursos|Features/i }).click();

    const section = page.locator('#produto');
    await expect(section).toBeInViewport();
  });
});
