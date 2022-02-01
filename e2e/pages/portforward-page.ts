import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';

export class PortForwardPage {
    readonly page: Page;
    readonly content: Locator;

    constructor(page: Page) {
      this.page = page;
      this.content = page.locator('.content');
    }
}
