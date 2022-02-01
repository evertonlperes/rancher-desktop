import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';

export class WslPage {
    readonly page: Page;
    readonly description: Locator;

    constructor(page: Page) {
      this.page = page;
      this.description = page.locator('.description');
    }
}
