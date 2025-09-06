/**
 * Playwright Configuration for Claude Code Zen Web Dashboard
 * Enterprise-grade E2E testing configuration
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env['CI'],
  
  // Retry on CI only
  retries: process.env['CI'] ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env['CI'] ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env['BASE_URL'] || 'http://localhost:3002',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Capture video on failure
    video: 'retain-on-failure',
    
    // Global timeout for all tests
    actionTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Disable web security for local testing
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet testing
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },

    // High contrast testing
    {
      name: 'High Contrast',
      use: { 
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        forcedColors: 'active'
      },
    },

    // Reduced motion testing  
    {
      name: 'Reduced Motion',
      use: { 
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce'
      },
    }
  ],

  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  // Expect options
  expect: {
    // Timeout for assertions
    timeout: 5000,
    
    // Screenshot comparisons
    threshold: 0.3,
    mode: 'pixel'
  },

  // Test timeout
  timeout: 30000,

  // Output directory for test artifacts
  outputDir: 'test-results/',
});