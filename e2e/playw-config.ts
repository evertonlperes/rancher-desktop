import * as path from 'path';
import type { Config, PlaywrightTestOptions } from '@playwright/test';

const CI = !!process.env.CI;

const outputDir = path.join(__dirname, '..', 'e2e', 'test-results');
const testDir = path.join(__dirname, '..', 'e2e');

const config: Config<PlaywrightTestOptions> = {
  testDir,
  outputDir,
  timeout:       CI ? 700000 : 300000,
  globalTimeout: 5400000,
  workers:       process.env.CI ? 1 : undefined,

};

export default config;
