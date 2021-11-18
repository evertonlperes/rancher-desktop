import path from 'path';
import { Application } from 'spectron';

const electronPath = require('electron');

export class TestUtils {
  public app: Application | undefined;

  public async setUp() {
    this.app = new Application({
      path:             electronPath as any,
      args:             ['--no-sandbox', '--disable-setuid-sandbox', path.join(__dirname, '../../')],
      chromeDriverArgs: [
        '--whitelisted-ips=',
        '--disable-dev-shm-usage',
      ],
      connectionRetryTimeout: 60_000,
      webdriverLogPath:       './',
      chromeDriverLogPath:    './chromedriver.log'
    });

    return await this.app.start();
  }

  /**
   * soft App stop
   */
  public async tearDown() {
    if (this.app && this.app.isRunning()) {
      await this.app.stop();
    } else {
      console.log('Something went wrong during stop process.');
    }
  }

  /**
   * By Pass First page in CI
   */
  public async byPassFirstPage() {
    await this.app?.client.url('http://localhost:8888/index.html');
  }

  /**
   * Set jest command timeout based on env
   */
  public setupJestTimeout() {
    const jestCiTimeout = 600000;
    const jestDevTimeout = 90000;

    if (process.env.CI) {
      jest.setTimeout(jestCiTimeout);
    } else {
      jest.setTimeout(jestDevTimeout);
    }
  }
}
