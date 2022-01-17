import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';

export class PlaywrightDevPage {
    readonly page: Page;
    readonly mainTitleSelector: Locator;
    readonly progressBarSelector: Locator;

    constructor(page: Page) {
      this.page = page;
      this.mainTitleSelector = page.locator('[data-test="mainTitle"]');
      this.progressBarSelector = page.locator('.progress');
    }

    async getGeneralPageTile() {
      await expect(this.mainTitleSelector).toHaveText('Welcome to Rancher Desktop');
    }

    async getProgressBar() {
      await this.progressBarSelector.waitFor({ state: 'detached', timeout: 120_000 });
      await expect(this.progressBarSelector).toBeHidden();
    }
}
