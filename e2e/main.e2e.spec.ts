import os from 'os';
import path from 'path';
import {
  ElectronApplication, BrowserContext, _electron, Page, Locator
} from 'playwright';
import { test } from '@playwright/test';
import { createDefaultSettings, playwrightReportAssets } from './utils/TestUtils';
import { PlaywrightDevPage } from './pages/playwright-main-page';
import { K8sPage } from './pages/playwright-k8s-page';
import { WslPage } from './pages/playwright-wsl-page';
import { PortForwardPage } from './pages/playwright-port-forward-page';

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
    const playwrightDev = new PlaywrightDevPage(page);

    await playwrightDev.getGeneralPageTile('Welcome to Rancher Desktop');
  });

  test('should start loading the background services and hide progress bar', async() => {
    const playwrightDev = new PlaywrightDevPage(page);

    await playwrightDev.getProgressBar();
  });

  test('should navigate to Kubernetes Settings and check elements', async() => {
    const playwrightDev = new PlaywrightDevPage(page);
    const k8sPage = new K8sPage(page);

    await playwrightDev.navigateTo('K8s');

    if (!os.platform().startsWith('win')) {
      await k8sPage.getK8sMemorySlider();
      await k8sPage.getK8sCpuSlider();
    }

    await playwrightDev.getGeneralPageTile('Kubernetes Settings');
    await k8sPage.getK8sPort();
    await k8sPage.getK8sResetButton();
  });

  /**
   * Checking WSL and Port Forwarding - Windows Only
   */
  if (os.platform().startsWith('win')) {
    test('should navigate to WSL Integration and check elements', async() => {
      const playwrightDev = new PlaywrightDevPage(page);
      const wslPage = new WslPage(page);

      await playwrightDev.navigateTo('Integrations');

      await playwrightDev.getGeneralPageTile('WSL Integration');
      await wslPage.getWslDescription();
    });

    test('should navigate to Port Forwarding and check elements', async() => {
      const playwrightDev = new PlaywrightDevPage(page);
      const portForwardPage = new PortForwardPage(page);

      await playwrightDev.navigateTo('PortForwarding');
      await playwrightDev.getGeneralPageTile('Port Forwarding');
      await portForwardPage.getPortForwardDescription();
    });
  }

  /**
   * Checking Support Utilities symlink list - macOS/Linux Only
   */
  if (!os.platform().startsWith('win')) {
    test('should navigate to Supporting Utilities and check elements', async() => {
      const playwrightDev = new PlaywrightDevPage(page);

      await playwrightDev.navigateTo('Integrations');
      await playwrightDev.getGeneralPageTile('Supporting Utilities');
    });
  }

  test('should navigate to Images page', async() => {
    const playwrightDev = new PlaywrightDevPage(page);

    await playwrightDev.navigateTo('Images');
    await playwrightDev.getGeneralPageTile('Images');
  });

  test('should navigate to Troubleshooting and check elements', async() => {
    const playwrightDev = new PlaywrightDevPage(page);

    await playwrightDev.navigateTo('Troubleshooting');
    await playwrightDev.getGeneralPageTile('Troubleshooting');
  });
});
