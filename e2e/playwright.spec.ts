import path from 'path';
import { ElectronApplication, _electron, Page } from 'playwright';
import { test, expect } from '@playwright/test';

/**
 * Using test.describe.serial make the test execute step by step, as described on each `test()` order
 * Playwright executes test in parallel by default and it will not work for our app backend loading process.
 * */

test.describe.serial('POC Playwright - Rancher Desktop', () => {
  let app: Page;
  let electronApp: ElectronApplication;
  const mainTitleSelector = '[data-test="mainTitle"]';

  test.beforeAll(async({ browser }) => {
    electronApp = await _electron.launch({ args: [path.join(__dirname, '../')] });
    const appPath = await electronApp.evaluate(async({ app }) => {
      return await app.getAppPath();
    });

    app = await browser.newPage();
    console.log('Log from appPath ---> ', appPath);
  });

  test.afterAll(async() => {
    await electronApp.close();
  });

  test('should open the main app', async() => {
    app = await electronApp.firstWindow();
    await app.waitForSelector('.progress', { state: 'visible' });
    await delay(20000); // Wait a bit

    // Use it for integration tools test - wait the entire app backend being loaded.
    // const progressBarSelector = app.locator('.progress');
    // await progressBarSelector.waitFor({ state: 'detached', timeout: 60000 });

    // const versionApp = await app.$eval('.versionInfo', el => el.textContent);

    // expect(versionApp).toBe('Version: (checking...)');
  });

  test('should get General page content', async() => {
    const generalGreetings = await app.$eval(mainTitleSelector, el => el.textContent.trim());

    expect(generalGreetings).toBe('Welcome to Rancher Desktop');
  });

  test('should navigate to Kubernetes Settings', async() => {
    const k8sVersionDndSelector = '.labeled-input';
    const k8sMemorySliderSelector = '[id="memoryInGBWrapper"]';
    const k8sCpuSliderSelector = '[id="numCpuWrapper"]';
    const k8sPortSelector = '[data-test="portConfig"]';
    const k8sResetBtn = '[data-test="k8sResetBtn"]';

    try {
      await app.click(`.nav li[item="/K8s"] a`);
      await app.waitForSelector('.contents');
    } catch (err) {
      console.log('Error during K8s Settings navigation. Error --> ', err);
    }

    const k8sSettingsTitle = await app.$eval(mainTitleSelector, el => el.textContent.trim());
    const k8sVersionDnd = await app.$eval(k8sVersionDndSelector, el => el.textContent.trim());
    const k8sMemorySlider = await app.$(k8sMemorySliderSelector);
    const k8sCpuSlider = await app.$(k8sCpuSliderSelector);
    const k8sPort = await app.$(k8sPortSelector);
    const k8sResetButton = await app.$(k8sResetBtn);

    // const progressBarSelector = app.locator('.progress');

    // await progressBarSelector.waitFor({ state: 'hidden' });
    expect(k8sVersionDnd).toBe('Kubernetes version');
    expect(k8sSettingsTitle).toBe('Kubernetes Settings');
    expect(k8sMemorySlider).toBeTruthy();
    expect(k8sCpuSlider).toBeTruthy();
    expect(k8sPort).toBeTruthy();
    expect(k8sResetButton).toBeTruthy();
  });
});

function delay(time: number | undefined) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
