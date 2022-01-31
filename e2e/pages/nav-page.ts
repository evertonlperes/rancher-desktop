import { Page, Locator } from 'playwright';
import { K8sPage } from './k8s-page';
import { PortForwardPage } from './portforward-page';
import { WslPage } from './wsl-page';

const pageConstructors = {
  'K8s':            K8sPage,
  'Integrations':   WslPage,
  'PortForwarding': PortForwardPage,
};

export class NavPage {
    readonly page: Page;
    readonly progressBar: Locator;
    readonly mainTitle: Locator;

    constructor(page: Page) {
      this.page = page;
      this.mainTitle = page.locator('[data-test="mainTitle"]');
      this.progressBar = page.locator('.progress');
    }

    /**
     * This process wait the progress bar to be visible and then
     * waits until the progress bar be detached/hidden.
     * This is a workaround until we implement:
     * https://github.com/rancher-sandbox/rancher-desktop/issues/1217
     */
    async progressBecomesReady() {
      // Wait until progress bar show up. It takes roughly ~60s to start in CI
      await this.progressBar.waitFor({ state: 'visible', timeout: 200_000 });
      // Wait until progress bar be detached. With that we can make sure the services were started
      await this.progressBar.waitFor({ state: 'detached', timeout: 120_000 });
    }

    async navigateTo(tab: keyof typeof pageConstructors) {
      await this.page.click(`.nav li[item="/${ tab }"] a`);
      await this.page.waitForNavigation({ url: `**/${ tab }`, timeout: 60_000 });

      return new (pageConstructors[tab])(this.page);
    }
}
