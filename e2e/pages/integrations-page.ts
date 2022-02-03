import { Page, Locator } from 'playwright';

export class IntegrationsPage {
    readonly page: Page;
    // readonly description: Locator;
    readonly symlinks: Locator;
    readonly mainTitle: Locator;

    constructor(page: Page) {
      this.page = page;
      this.mainTitle = page.locator('[data-test="mainTitle"]');
      // this.description = page.locator('.description');
      this.symlinks = page.locator('[data-test="symlinkBody"]');
    }
}
