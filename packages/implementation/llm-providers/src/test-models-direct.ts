/**
 * Direct test of GitHub Models API endpoint
 */

import { getLogger } from '@claude-zen/foundation/logging';

const logger = getLogger('direct-test');

async function _testDirectModelsCall() {
  try {
    logger.info('🔍 Direct test of GitHub Models API...');

    const url = 'https://models.inference.ai.azure.com/models';
    logger.info(`📡 Fetching: ${url}`);`

    const response = await fetch(url, {
      method: 'GET',
    });

    logger.info(`📊 Status: ${{response}}.status${{response}}.statusText`);`
    logger.info(
      `📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`
    );

    if (response.ok) {
      const data = await response.json();
      logger.info(`📦 Response data: ${JSON.stringify(data, null, 2)}`);`
    } else {
      const text = await response.text();
      logger.error(`❌ Error response: ${{text}}`);`
    }
  } catch (error) {
    logger.error('💥 Direct test failed:', error);
  }
}

// Run the test
testDirectModelsCall()
  .then(() => {
    logger.info('✅ Direct test completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Direct test failed:', error);
    process.exit(1);
  });
