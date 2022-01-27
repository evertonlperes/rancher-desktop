import os from 'os';
import path from 'path';
import {
  ElectronApplication, BrowserContext, _electron, Page, Locator
} from 'playwright';
import { test, expect } from '@playwright/test';
import { createDefaultSettings, playwrightReportAssets } from './utils/TestUtils';
import { NavPage } from './pages/nav-page';
import { K8sPage } from './pages/k8s-page';
import { WslPage } from './pages/wsl-page';
import { PortForwardPage } from './pages/portforward-page';

let page: Page;

/**
 * Using test.describe.serial make the test execute step by step, as described on each `test()` order
 * Playwright executes test in parallel by default and it will not work for our app backend loading process.
 * */
test.describe.serial('Main App Test', () => {
  let electronApp: ElectronApplication;
  let context: BrowserContext;

  test.beforeAll(async() => {
    createDefaultSettings();

    electronApp = await _electron.launch({
      args: [
        path.join(__dirname, '../'),
        '--disable-gpu',
        '--whitelisted-ips=',
        '--disable-dev-shm-usage',
      ]
    });
    context = electronApp.context();

    await context.tracing.start({ screenshots: true, snapshots: true });
    page = await electronApp.firstWindow();
  });

  test.afterAll(async() => {
    await context.tracing.stop({ path: playwrightReportAssets(path.basename(__filename)) });
    await electronApp.close();
  });

  test('should land on General page', async() => {
    const navPage = new NavPage(page);

    await expect(navPage.mainTitleSelector).toHaveText('Welcome to Rancher Desktop');
  });

  test('should start loading the background services and hide progress bar', async() => {
    const navPage = new NavPage(page);

    await navPage.progressBecomesReady();
    await expect(navPage.progressBarSelector).toBeHidden();
  });

  test('should navigate to Kubernetes Settings and check elements', async() => {
    const navPage = new NavPage(page);
    const k8sPage = new K8sPage(page);

    await navPage.navigateTo('K8s');

    if (!os.platform().startsWith('win')) {
      await expect(k8sPage.k8sMemorySliderSelector).toBeVisible();
      await expect(k8sPage.k8sCpuSliderSelector).toBeVisible();
    }

    await expect(navPage.mainTitleSelector).toHaveText('Kubernetes Settings');
    await expect(k8sPage.k8sPortSelector).toBeVisible();
    await expect(k8sPage.k8sResetBtn).toBeVisible();
  });

  /**
   * Checking WSL and Port Forwarding - Windows Only
   */
  if (os.platform().startsWith('win')) {
    test('should navigate to WSL Integration and check elements', async() => {
      const navPage = new NavPage(page);
      const wslPage = new WslPage(page);

      await navPage.navigateTo('Integrations');

      await expect(navPage.mainTitleSelector).toHaveText('WSL Integration');
      await expect(wslPage.wslDescriptionSelector).toBeVisible();
    });

    test('should navigate to Port Forwarding and check elements', async() => {
      const navPage = new NavPage(page);
      const portForwardPage = new PortForwardPage(page);

      await navPage.navigateTo('PortForwarding');
      await expect(navPage.mainTitleSelector).toHaveText('Port Forwarding');
      await expect(portForwardPage.portForwardingContentSelector).toBeVisible();
    });
  }

  /**
   * Checking Support Utilities symlink list - macOS/Linux Only
   */
  if (!os.platform().startsWith('win')) {
    test('should navigate to Supporting Utilities and check elements', async() => {
      const navPage = new NavPage(page);

      await navPage.navigateTo('Integrations');
      await expect(navPage.mainTitleSelector).toHaveText('Supporting Utilities');
    });
  }

  test('should navigate to Images page', async() => {
    const navPage = new NavPage(page);

    await navPage.navigateTo('Images');
    await expect(navPage.mainTitleSelector).toHaveText('Images');
  });

  test('should navigate to Troubleshooting and check elements', async() => {
    const navPage = new NavPage(page);

    await navPage.navigateTo('Troubleshooting');
    await expect(navPage.mainTitleSelector).toHaveText('Troubleshooting');
  });
});
