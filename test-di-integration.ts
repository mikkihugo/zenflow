/**
 * Quick test to verify DI integration is working
 */

import { runCompleteIntegration } from '../di/examples/complete-system-integration.js';

console.log('🧪 Testing complete DI integration...');

runCompleteIntegration()
  .then(() => {
    console.log('🎉 DI integration test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ DI integration test failed:', error);
    process.exit(1);
  });
