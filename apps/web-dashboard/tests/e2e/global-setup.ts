/**
 * Global setup for Playwright tests
 * Ensures the development server is running before tests
 */

import { chromium, FullConfig } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

let devServer: ChildProcess;

export default async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Claude Code Zen development server for E2E tests...');

  // Start the development server
  devServer = spawn('pnpm', ['--filter', '@claude-zen/web-dashboard', 'dev'], {
    stdio: 'pipe',
    env: { ...process.env },
    cwd: process.cwd()
  });

  // Wait for server to start
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds timeout

  devServer.stdout?.on('data', (data) => {
    const output = data.toString();
    console.log(`[DEV SERVER] ${output}`);
    if (output.includes('Local:') || output.includes('localhost:3000')) {
      serverReady = true;
    }
  });

  devServer.stderr?.on('data', (data) => {
    console.error(`[DEV SERVER ERROR] ${data.toString()}`);
  });

  // Wait for server to be ready
  while (!serverReady && attempts < maxAttempts) {
    await sleep(1000);
    attempts++;
    
    // Try to connect to check if server is ready
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto('http://localhost:3000', { timeout: 2000 });
      await browser.close();
      serverReady = true;
      console.log('✅ Development server is ready!');
    } catch (error) {
      // Server not ready yet, continue waiting
    }
  }

  if (!serverReady) {
    throw new Error('❌ Development server failed to start within 60 seconds');
  }

  // Store server process for cleanup
  (global as any).__DEV_SERVER__ = devServer;
  
  return devServer;
}