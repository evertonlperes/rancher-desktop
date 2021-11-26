import * as path from 'path';
import type { Config, PlaywrightTestOptions } from '@playwright/test';

const CI = !!process.env.CI;

const outputDir = path.join(__dirname, '..', 'e2e', 'test-results');
const testDir = path.join(__dirname, '..', 'e2e');

const config: Config<PlaywrightTestOptions> = {
  testDir,
  outputDir,
  timeout: CI ? 600000 : 300000,
};

export default config;
