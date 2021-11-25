import os from 'os';
import fs from 'fs';
import path from 'path';
import { Application } from 'spectron';
import { Paths, DarwinPaths, LinuxPaths, Win32Paths } from '@/utils/paths';

const electronPath = require('electron');

export class TestUtils {
  public app: Application | undefined;

  public async setUp() {
    this.app = new Application({
      path:             electronPath as any,
      args:             [path.join(__dirname, '../../')],
      chromeDriverArgs: [
        '--no-sandbox',
        '--disable-gpu',
        '--whitelisted-ips=',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222'],
      connectionRetryTimeout: 60_000,
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
   * Create empty default settings file by platform
   * Better way to bypass First Page without redirecting
   */
  public createDefaultSettings() {
    let paths: Paths;

    switch (os.platform()) {
    case 'darwin': {
      paths = new DarwinPaths();
      const darwinConfigPath = paths.config;

      this.createSettingsFile(darwinConfigPath);
    }
      break;

    case 'linux': {
      paths = new LinuxPaths();
      const linuxConfigPath = paths.config;

      this.createSettingsFile(linuxConfigPath);
    }
      break;

    case 'win32': {
      paths = new Win32Paths();
      const winConfigPath = paths.config;

      this.createSettingsFile(winConfigPath);
    }
      break;
    }
  }

  /**
   * Create empty settings file to bypass
   * First Page in CI
   * @param settingsPath
   */
  public createSettingsFile(settingsPath: string) {
    const settingsData = {}; // empty array
    const settingsJson = JSON.stringify(settingsData);
    const fileSettingsName = 'settings.json';

    try {
      if (!fs.existsSync(settingsPath)) {
        fs.mkdirSync(settingsPath, { recursive: true });
        fs.writeFileSync(path.join(settingsPath, '/', fileSettingsName), settingsJson);
        console.log('Default settings file successfully created on: ', `${ settingsPath }/${ fileSettingsName }`);
      }
    } catch (err) {
      console.error('Error during default settings creation. Error: --> ', err);
    }
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
