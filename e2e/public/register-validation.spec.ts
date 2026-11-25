import { test, expect, type Page } from '@playwright/test';
import { clearAppStorage } from '../helpers/storage';

const validPassword = 'Test@1234';

async function fillRegisterForm(
  page: Page,
  options: { password?: string; confirmPassword?: string; acceptTerms?: boolean } = {}
) {
  const password = options.password ?? validPassword;
  const confirmPassword = options.confirmPassword ?? validPassword;

  await page.getByRole('textbox', { name: 'John', exact: true }).fill('John');
  await page.getByRole('textbox', { name: 'Doe', exact: true }).fill('Doe');
  await page.getByRole('textbox', { name: 'john@example.com' }).fill('john.doe@example.com');
  await page.getByPlaceholder('Enter your Password', { exact: true }).fill(password);
  await page.getByPlaceholder('Confirm Your Password', { exact: true }).fill(confirmPassword);

  if (options.acceptTerms) {
    await page.getByRole('checkbox', { name: /I accept the/ }).click();
  }
}

test.describe('Register validation', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
    await page.goto('/oauth/register');
  });

  test('exibe toast quando termos não são aceitos', async ({ page }) => {
    await fillRegisterForm(page, { acceptTerms: false });

    await page.getByRole('button', { name: 'Cadastre' }).click();

    await expect(
      page.getByText('Please accept the terms and conditions.')
    ).toBeVisible();
  });

  test('exibe toast quando senhas são diferentes', async ({ page }) => {
    await fillRegisterForm(page, {
      password: validPassword,
      confirmPassword: 'Different@99',
      acceptTerms: true,
    });

    await page.getByRole('button', { name: 'Cadastre' }).click();

    await expect(
      page.getByText('The passwords must be the same.')
    ).toBeVisible();
  });
});
