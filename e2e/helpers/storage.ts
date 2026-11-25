import type { Page } from '@playwright/test';

export async function clearAppStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
