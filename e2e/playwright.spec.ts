import path from 'path';
import { ElectronApplication, _electron, Page } from 'playwright';
import { test, expect } from '@playwright/test';
import NavBarPage from './pages/navbar';

test.describe('POC Playwright', () => {
  let electronApp: ElectronApplication;

  test.beforeAll(async() => {
    process.env.CI = '1';
    electronApp = await _electron.launch({ args: ['--no-sandbox', path.join(__dirname, '../')] });
    const appPath = await (await electronApp).evaluate(async({ app }) => {
      return await app.getAppPath();
    });

    console.log('Log from appPath ---> ', appPath);
  });

  test.afterAll(async() => {
    await electronApp.close();
  });

  let page: Page;
  let navBarPage: NavBarPage;

  test('should open the main app', async() => {
    page = await electronApp.firstWindow();
    page.waitForSelector('.versionInfo', { timeout: 20000 });

    console.log('Page contents ---> ', page);
    expect(page).toBe('Rancher Desktop');
  });

  test('should land on General page', async() => {
    const generalPage = await navBarPage.getGeneralPage();

    expect(generalPage).not.toBeNull();
    expect(generalPage?.getMainTitle()).toBe('Welcome to Rancher Desktop');
  });
});
