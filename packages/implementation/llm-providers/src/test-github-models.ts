/**
 * Test GitHub Models API (different from Copilot)
 */

import { getLogger } from '@claude-zen/foundation/logging';

import { createAPIProvider } from './factories/api-provider-factory';

const logger = getLogger('test-github-models');

async function _testGitHubModels() {
  try {
    logger.info('🚀 Testing GitHub Models API (NOT Copilot)...');

    // Create GitHub Models API provider (uses PAT tokens, different endpoint)
    const githubModels = await createAPIProvider('github-models-api');

    // List available models (should be different from Copilot)
    logger.info('📋 Calling listModels() for GitHub Models API...');
    const models = await githubModels.listModels();

    if (models.length > 0) {
      logger.info(`✅ Found ${models.length} GitHub Models API models:`);`
      for (const [index, model] of models.entries()) {
        logger.info(`   $index + 1. $model`);`
      }
    } else 
      logger.warn('⚠️ No models returned from GitHub Models API');

    // Test health check
    const health = await githubModels.healthCheck();
    logger.info(
      `🏥 GitHub Models API health: ${health ? '✅ Healthy' : '❌ Unhealthy'}`
    );

    logger.info('');
    logger.info('📝 Note: GitHub Models API uses:');
    logger.info('   - PAT tokens (ghp_xxx)');
    logger.info('   - models.github.ai endpoint');
    logger.info('   - Provider/model format (e.g., openai/gpt-4.1)');
    logger.info('   - Different model selection than Copilot');
  } catch (error) {
    logger.error('💥 GitHub Models API test failed:', error);
  }
}

// Run the test
testGitHubModels()
  .then(() => {
    logger.info('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  });
