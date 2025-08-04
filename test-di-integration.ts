/**
 * Quick test to verify DI integration is working
 */

import { runCompleteIntegration } from './src/di/examples/complete-system-integration.ts';

runCompleteIntegration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ DI integration test failed:', error);
    process.exit(1);
  });
