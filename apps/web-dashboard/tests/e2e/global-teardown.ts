/**
 * Global teardown for Playwright tests
 * Cleans up the development server after tests complete
 */

import { FullConfig } from '@playwright/test';

export default async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up development server...');

  const devServer = (global as any).__DEV_SERVER__;
  
  if (devServer && !devServer.killed) {
    console.log('🛑 Stopping development server...');
    
    // Try graceful shutdown first
    devServer.kill('SIGTERM');
    
    // Force kill if still running after 5 seconds
    setTimeout(() => {
      if (!devServer.killed) {
        console.log('🔥 Force killing development server...');
        devServer.kill('SIGKILL');
      }
    }, 5000);
    
    console.log('✅ Development server stopped');
  }
}