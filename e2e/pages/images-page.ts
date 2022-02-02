import { Page, Locator } from 'playwright';

export class ImagesPage {
    readonly page: Page;
    readonly mainTitle: Locator;

    constructor(page: Page) {
      this.page = page;
      this.mainTitle = page.locator('[data-test="mainTitle"]');
    }
}
