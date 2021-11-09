import path from 'path';
import os from 'os';
import { ElectronApplication, _electron, Page } from 'playwright';
import { test, expect } from '@playwright/test';

/**
 * Using test.describe.serial make the test execute step by step, as described on each `test()` order
 * Playwright executes test in parallel by default and it will not work for our app backend loading process.
 * */
let page: Page;
let electronApp: ElectronApplication;

test.describe.serial('POC Playwright - Rancher Desktop', () => {
  const mainTitleSelector = '[data-test="mainTitle"]';

  test.beforeAll(async() => {
    electronApp = await _electron.launch({ args: [path.join(__dirname, '../')] });
    const appPath = await electronApp.evaluate(async({ app }) => {
      return await app.getAppPath();
    });

    console.log('Log from appPath ---> ', appPath);
  });

  test.afterAll(async() => {
    await electronApp.close();
  });

  test('should open the main app', async() => {
    page = await electronApp.firstWindow();
    await page.waitForSelector('.progress');
    await delay(10000); // Wait a bit

    // Use it for integration tools test - wait the entire app backend being loaded.
    // const progressBarSelector = page.locator('.progress');
    // await progressBarSelector.waitFor({ state: 'detached', timeout: 60000 });

    // const versionApp = await page.$eval('.versionInfo', el => el.textContent);

    // expect(versionApp).toBe('Version: (checking...)');
  });

  test('should get General page content', async() => {
    const generalGreetings = await page.$eval(mainTitleSelector, el => el.textContent.trim());

    expect(generalGreetings).toBe('Welcome to Rancher Desktop');
  });

  test('should navigate to Kubernetes Settings and check elements', async() => {
    const k8sVersionDndSelector = '.labeled-input';
    const k8sMemorySliderSelector = '[id="memoryInGBWrapper"]';
    const k8sCpuSliderSelector = '[id="numCPUWrapper"]';
    const k8sPortSelector = '[data-test="portConfig"]';
    const k8sResetBtn = '[data-test="k8sResetBtn"]';

    await navigateTo('K8s');
    // try {
    //   await page.click(`.nav li[item="/K8s"] a`);
    //   await page.waitForSelector('.contents');
    // } catch (err) {
    //   console.log('Error during K8s Settings navigation. Error --> ', err);
    // }

    // Collecting data from selectors
    const k8sVersionDnd = await page.$eval(k8sVersionDndSelector, el => el.textContent.trim());
    const k8sSettingsTitle = await page.$eval(mainTitleSelector, el => el.textContent.trim());
    const k8sMemorySlider = page.locator(k8sMemorySliderSelector);
    const k8sCpuSlider = page.locator(k8sCpuSliderSelector);
    const k8sPort = page.locator(k8sPortSelector);
    const k8sResetButton = page.locator(k8sResetBtn);

    // const progressBarSelector = page.locator('.progress');

    // await progressBarSelector.waitFor({ state: 'hidden' });

    expect(k8sSettingsTitle).toBe('Kubernetes Settings');
    expect(k8sVersionDnd).toContain('Kubernetes version');
    expect(k8sMemorySlider).toBeVisible();
    expect(k8sCpuSlider).toBeVisible();
    expect(k8sPort).toBeVisible();
    expect(k8sResetButton).toBeVisible();
  });

  if (os.platform().startsWith('win')) {
    test('should navigate to Port Forwarding anc check elements', async() => {});
  } else {
    test('should navigate to Supporting Utilities anc check elements', async() => {
      await navigateTo('Integrations');
      // try {
      //   await page.click(`.nav li[item="/Integrations"] a`);
      //   delay(2000);
      // } catch (err) {
      //   console.log('Error during Integrations navigation. Error --> ', err);
      // }
      const getSupportTitle = await page.$eval(mainTitleSelector, el => el.textContent.trim());

      expect(getSupportTitle).toContain('Supporting Utilities');
    });
  }

  test('should navigate to Images page', async() => {
    await navigateTo('Images');
    // try {
    //   await page.click(`.nav li[item="/Images"] a`);
    //   delay(2000);
    // } catch (err) {
    //   console.log('Error during Images navigation. Error --> ', err);
    // }
    await delay(10000);
    const getSupportTitle = await page.$eval(mainTitleSelector, el => el.textContent.trim());

    expect(getSupportTitle).toContain('Images');
  });

  test('should navigate to Troubleshooting and check elements', async() => {
    await navigateTo('Troubleshooting');
    // try {
    //   await page.click(`.nav li[item="/Troubleshooting"] a`);
    //   delay(2000);
    // } catch (err) {
    //   console.log('Error during Troubleshooting navigation. Error --> ', err);
    // }
    const getSupportTitle = await page.$eval(mainTitleSelector, el => el.textContent.trim());

    expect(getSupportTitle).toContain('Troubleshooting');
  });
});

async function navigateTo(path: string) {
  try {
    return await Promise.all([
      page.click(`.nav li[item="/${ path }"] a`),
      page.waitForNavigation({ url: `**/${ path }` })
    ]);
  } catch (err) {
    console.log(`Cannot navigate to ${ path }. Error ---> `, err);
  }
}

/**
 * Delay function to slow things down
 * @param time
 * @returns
 */
function delay(time: number | undefined) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
