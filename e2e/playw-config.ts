import * as path from 'path';
import type { Config, PlaywrightTestOptions } from '@playwright/test';

const outputDir = path.join(__dirname, '..', 'e2e', 'test-results');
const testDir = path.join(__dirname, '..', 'e2e');

const config: Config<PlaywrightTestOptions> = {
  testDir,
  outputDir,
  timeout:       process.env.CI ? 700000 : 300000,
  globalTimeout: 700000,
  workers:       process.env.CI ? 1 : undefined,
  retries: 3,
  reporter:      'list',
};

export default config;
