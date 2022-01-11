import { expect, Locator, Page } from '@playwright/test';

export class PlaywrightDevPage {
    readonly page: Page;
    readonly mainTitleSelector: Locator;

    constructor(page: Page) {
      this.page = page;
      this.mainTitleSelector = page.locator('[data-test="mainTitle"]');
    }

    async getGeneralPageTile() {
      await expect(this.mainTitleSelector).toHaveText('Welcome to Main Page');
    }
}
