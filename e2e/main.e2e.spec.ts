// import path from 'path';
import os from 'os';
import path from 'path';
import {
  ElectronApplication, BrowserContext, _electron, Page, Locator
} from 'playwright';
import { test, expect } from '@playwright/test';
import { TestUtils } from './utils/TestUtils';

let page: Page;

/**
 * Using test.describe.serial make the test execute step by step, as described on each `test()` order
 * Playwright executes test in parallel by default and it will not work for our app backend loading process.
 * */
test.describe.serial('Rancher Desktop - Main App', () => {
  let mainTitle: Locator;
  let utils: TestUtils;
  let electronApp: ElectronApplication;
  let context: BrowserContext;
  const mainTitleSelector = '[data-test="mainTitle"]';

  test.beforeAll(async() => {
    utils = new TestUtils();
    utils.createDefaultSettings();
    electronApp = await _electron.launch({
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--whitelisted-ips=',
        '--disable-dev-shm-usage',
        path.join(__dirname, '../')]
    });
    context = electronApp.context();

    await context.tracing.start({ screenshots: true, snapshots: true });
    page = await electronApp.firstWindow();

    await page.screenshot({ path: './first_window.png' });
  });

  test.afterAll(async() => {
    await context.tracing.stop({ path: './pw-trace.zip' });
    await electronApp.close();
  });

  test('should land on General page', async() => {
    mainTitle = page.locator(mainTitleSelector);

    await expect(mainTitle).toHaveText('Welcome to Rancher Desktop');
  });

  test('should navigate to Kubernetes Settings and check elements', async() => {
    const k8sMemorySliderSelector = '[id="memoryInGBWrapper"]';
    const k8sCpuSliderSelector = '[id="numCPUWrapper"]';
    const k8sPortSelector = '[data-test="portConfig"]';
    const k8sResetBtn = '[data-test="k8sResetBtn"]';

    await navigateTo('K8s');
    // Collecting data from selectors
    const k8sSettingsTitle = page.locator(mainTitleSelector);
    const k8sMemorySlider = page.locator(k8sMemorySliderSelector);
    const k8sCpuSlider = page.locator(k8sCpuSliderSelector);
    const k8sPort = page.locator(k8sPortSelector);
    const k8sResetButton = page.locator(k8sResetBtn);

    await expect(k8sSettingsTitle).toHaveText('Kubernetes Settings');
    await expect(k8sMemorySlider).toBeVisible();
    await expect(k8sCpuSlider).toBeVisible();
    await expect(k8sPort).toBeVisible();
    await expect(k8sResetButton).toBeVisible();
  });

  if (os.platform().startsWith('win')) {
    test('should navigate to Port Forwarding anc check elements', async() => {});
  } else {
    test('should navigate to Supporting Utilities anc check elements', async() => {
      await navigateTo('Integrations');
      const getSupportTitle = page.locator(mainTitleSelector);

      await expect(getSupportTitle).toHaveText('Supporting Utilities');
    });
  }

  test('should navigate to Images page', async() => {
    const getSupportTitle = page.locator(mainTitleSelector);

    await navigateTo('Images');
    await expect(getSupportTitle).toHaveText('Images');
  });

  test('should navigate to Troubleshooting and check elements', async() => {
    const getSupportTitle = page.locator(mainTitleSelector);

    await navigateTo('Troubleshooting');
    await expect(getSupportTitle).toHaveText('Troubleshooting');
  });
});

/**
 * Navigate to a specific tab
 * @param path
 */
async function navigateTo(path: string) {
  try {
    return await Promise.all([
      page.click(`.nav li[item="/${ path }"] a`),
      page.waitForNavigation({ url: `**/${ path }`, timeout: 60000 })
    ]);
  } catch (err) {
    console.log(`Cannot navigate to ${ path }. Error ---> `, err);
  }
}
