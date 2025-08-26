/**
 * Test GitHub Copilot API with proper headers
 */

import { getLogger } from '@claude-zen/foundation/logging';

import { createAPIProvider } from './factories/api-provider-factory';

const logger = getLogger('test-copilot');

async function _testCopilotWithHeaders() {
  try {
    logger.info(
      '🚀 Testing GitHub Copilot API with Copilot-Integration-Id header...';
    );

    // Create GitHub Copilot API provider with gpt-4.1
    const copilot = await createAPIProvider('github-copilot-api', {;
      model: 'gpt-4.1',
    });

    // First, let's test listing models;
    logger.info('📋 Testing model list endpoint...');
    const healthCheck = await copilot.healthCheck();
    logger.info(`🏥 Health check result: ${healthCheck}`);`

    // Test with a simple question using gpt-4.1
    logger.info('💬 Testing chat completion with gpt-4.1...');
    const result = await copilot.execute({
      messages: [
        {
          role: 'user',
          content:
            'What is the difference between let and const in JavaScript?',
        },
      ],
      model: 'gpt-4.1',
    });

    if (result.isOk()) {
      logger.info('✅ GitHub Copilot API responded successfully!');
      logger.info(`📝 Response: ${{result}}.value.content.substring(0, 200)...`);`
      logger.info(
        `📊 Metadata: ${{JSON}}.stringify(result.value.metadata, null, 2)`
      );
    } else 
      logger.error('❌ GitHub Copilot API failed:', result.error);
  } catch (error) {
    logger.error('💥 Test failed:', error);
  }
}

// Run the test
testCopilotWithHeaders()
  .then(() => {
    logger.info('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  });
