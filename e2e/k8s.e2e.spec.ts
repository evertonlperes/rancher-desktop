import os from 'os';
import path from 'path';
import util from 'util';
import fetch from 'node-fetch';
import { Application } from 'spectron';
import * as childProcess from '../src/utils/childProcess';
import NavBarPage from './pages/navbar';
import { TestUtils } from './utils/TestUtils';

async function tool(tool: string, ...args: string[]): Promise<string> {
  const srcDir = path.dirname(__dirname);
  const filename = os.platform().startsWith('win') ? `${ tool }.exe` : tool;
  const exe = path.join(srcDir, 'resources', os.platform(), 'bin', filename);

  try {
    const { stdout } = await childProcess.spawnFile(
      exe, args, { stdio: ['ignore', 'pipe', 'inherit'] });

    return stdout;
  } catch (ex:any) {
    console.error(`Error running ${ tool } ${ args.join(' ') }`);
    console.error(`stdout: ${ ex.stdout }`);
    console.error(`stderr: ${ ex.stderr }`);
    throw ex;
  }
}

async function kubectl(...args: string[] ): Promise<string> {
  return await tool('kubectl', ...args);
}

describe('Rancher Desktop - K8s Sample Deployment Test', () => {
  let app: Application;
  let utils: TestUtils;
  let navBarPage: NavBarPage;

  beforeAll(async() => {
    utils = new TestUtils();
    utils.setupJestTimeout();
    utils.createDefaultSettings();
    app = await utils.setUp();

    // return utils.byPassFirstPage();
  });

  afterAll(async() => {
    if (!app?.isRunning()) {
      console.error('afterAll: app is not running');

      return;
    }

    // Due to graceful Kubernetes shutdown, we need to try to quit harder.
    // The actual object here doesn't match the TypeScript definitions.
    const remoteApp = (app.electron as any).remote.app;

    await remoteApp.quit() as Promise<void>;
    await app.stop();
  });

  it('should load Rancher Desktop App', async() => {
    await app.client.waitUntilWindowLoaded();

    // Wait till the window is fully loaded n till it gets the title 'Rancher Desktop'
    for (let i = 0; i < 10; i++) {
      const windowTitle = (await app.browserWindow.getTitle()).trim();

      app.client.saveScreenshot('./it-01.png');
      if (windowTitle === 'Rancher Desktop') {
        break;
      }
      await util.promisify(setTimeout)(5_000);
    }
    const title = await app.browserWindow.getTitle();

    expect(title).toBe('Rancher Desktop');
  });

  // it('should run Kubernetes on Rancher Desktop', async() => {
  //   await app.client.waitUntilWindowLoaded();
  //   const progress = await app.client.$('.progress');

  //   // Wait for the progress bar to exist
  //   await progress.waitForExist({ timeout: 30000 });
  //   // Wait for progress bar to disappear again
  //   await progress.waitForExist({ timeout: 360000, reverse: true });

  //   // Delete this debug entry
  //   app.client.saveScreenshot('./it-02.png');

  //   const k8sVersion = await kubectl('version');

  //   console.log('Checking k8s version cli and server ---> ', k8sVersion);

  //   const output = await kubectl('cluster-info');

  //   console.error('Output from cluster-info ---> ', output);
  //   // Filter out ANSI escape codes (colours).
  //   const filteredOutput = output.replaceAll(/\033\[.*?m/g, '');

  //   expect(filteredOutput).toMatch(/ is running at ./);
  // });

  it('should create a sample namespace', async() => {
    app.client.saveScreenshot('./it-03.png');

    try {
      // required if you're testing it locally
      const getExistingNs = (await kubectl('get', 'namespace', '--output=name')).trim();

      if (getExistingNs.includes('rd-nginx-demo')) {
        const deleteExistingNs = await kubectl('delete', 'ns', 'rd-nginx-demo');

        console.log('Results from Delete NS--> ', deleteExistingNs);
      }
      const createNs = await kubectl('create', 'namespace', 'rd-nginx-demo');

      console.log('Create NS log --> ', createNs);
    } finally {
      const namespaces = (await kubectl('get', 'namespace', '--output=name')).trim();

      const filteredNamespaces = namespaces.replaceAll(/\033\[.*?m/g, '');

      expect(filteredNamespaces).toContain('rd-nginx-demo');
    }
  });

  it('should deploy nginx server sample', async() => {
    try {
      const yamlFilePath = path.join(path.dirname(__dirname), 'e2e', 'fixtures', 'k8s-deploy-sample', 'nginx-sample-app.yaml');

      const applyTemplate = await kubectl('apply', '-f', yamlFilePath, '-n', 'rd-nginx-demo');
      console.log('Results apply template ---> ', applyTemplate);
      for (let i = 0; i < 10; i++) {
        const podName = (await kubectl('get', 'pods', '--output=name', '-n', 'rd-nginx-demo')).trim();

        //Delete this console error
        console.error('podName --> ', podName);
        if (podName) {
          expect(podName).not.toBeFalsy();
          break;
        }
        await util.promisify(setTimeout)(5_000);
      }
      const waitDeploy = await kubectl('wait', '--for=condition=ready', 'pod', '-l', 'app=nginx', '-n', 'rd-nginx-demo', '--timeout=120s');

      console.error('WaitDeploy: --> ', waitDeploy);
      if (os.platform().startsWith('win')) {
        // Forward port via UI button click, and capture the port number
        const portForwardingPage = await navBarPage.getPortForwardingPage();
        const port = await portForwardingPage?.portForward();

        // Access app and check the welcome message
        const response = await fetch(`http://localhost:${ port }`);

        expect(response.ok).toBeTruthy();
        response.text().then((text) => {
          expect(text).toContain('Welcome to nginx!');
        });
      } else {
        const podName = (await kubectl('get', 'pods', '--output=name', '-n', 'rd-nginx-demo')).trim();
        const checkAppStatus = await kubectl('exec', '-n', 'rd-nginx-demo', '-it', podName, '--', 'curl', 'localhost');

        expect(checkAppStatus).toBeTruthy();
        expect(checkAppStatus).toContain('Welcome to nginx!');
      }
    } catch (err:any) {
      console.error('Error: ');
      console.error(`stdout: ${ err.stdout }`);
      console.error(`stderr: ${ err.stderr }`);
      throw err;
    }
  });

  it('should delete sample namespace', async() => {
    await kubectl('delete', 'namespace', 'rd-nginx-demo');
    const namespaces = (await kubectl('get', 'namespace', '--output=name')).trim();
    const filteredNamespaces = namespaces.replaceAll(/\033\[.*?m/g, '');

    expect(filteredNamespaces).not.toContain('rd-nginx-demo');
  });
});
