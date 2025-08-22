/**
 * Test listing models from GitHub Copilot API
 */

import { createAPIProvider } from './factories/api-provider-factory';
import { getLogger } from '@claude-zen/foundation/logging';

const logger = getLogger('test-list-models');

async function testListModels() {
  try {
    logger.info('🚀 Testing GitHub Copilot API model listing...');
    
    // Create GitHub Copilot API provider
    const copilot = await createAPIProvider('github-copilot-api');
    
    // List available models
    logger.info('📋 Calling listModels()...');
    const models = await copilot.listModels();
    
    if (models.length > 0) {
      logger.info(`✅ Found ${models.length} available models:`);
      models.forEach((model, index) => {
        logger.info(`   ${index + 1}. ${model}`);
      });
    } else {
      logger.warn('⚠️ No models returned or API call failed');
    }
    
    // Also test health check
    const health = await copilot.healthCheck();
    logger.info(`🏥 Health check: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
    
  } catch (error) {
    logger.error('💥 Test failed:', error);
  }
}

// Run the test
testListModels()
  .then(() => {
    logger.info('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  });