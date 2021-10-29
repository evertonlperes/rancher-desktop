import path from 'path';
import { _electron, Page } from 'playwright';
import { test, expect } from '@playwright/test';

const electronApp = _electron.launch({ args: [path.join(__dirname, '../')] });

test.describe('POC Playwright', () => {
  let page: Page;

  test.beforeAll(async() => {
    const appPath = await (await electronApp).evaluate(async({ app }) => {
      return await app.getAppPath();
    });

    console.log(appPath);
  });

  test('should open the main app', async() => {
    page = await (await electronApp).firstWindow();
    console.log( await page.title());
  });
});
