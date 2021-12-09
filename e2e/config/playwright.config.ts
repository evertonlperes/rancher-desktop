import * as path from 'path';
import type { Config, PlaywrightTestOptions, PlaywrightWorkerOptions } from '@playwright/test';

const outputDir = path.join(__dirname, '..', 'e2e', 'test-results');
const testDir = path.join(__dirname, '..', '..', 'e2e');

const config: Config< & PlaywrightWorkerOptions & PlaywrightTestOptions> = {
  testDir,
  outputDir,
  timeout:       !!process.env.CI ? 600_000 : 300_000,
  globalTimeout: 600_000,
  retries:       !!process.env.CI ? 2 : undefined,
  workers:       1,
  reporter:      'list',
  use:           { navigationTimeout: 40_000 }
};

export default config;
