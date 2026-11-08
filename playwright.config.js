import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  use: { channel: 'chrome' },
  projects: [
    { name: 'desktop-1280', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'phone-375', use: { viewport: { width: 375, height: 812 } } },
  ],
});
