/**
 * Test GitHub Models Database Integration
 */

import { getLogger } from '@claude-zen/foundation/logging';

import {
  githubModelsDB,
  initializeGitHubModelsDB,
} from './api/github-models-db';

const logger = getLogger('test-github-models-db');

async function testGitHubModelsDatabase() {
  try {
    logger.info('🚀 Testing GitHub Models Database...');

    // Initialize database
    await initializeGitHubModelsDB();

    // Test basic functionality
    const allModels = githubModelsDB.getAllModels();
    logger.info(`✅ Total models in database: ${allModels.length}`);

    // Test by provider
    const openaiModels = githubModelsDB.getModelsByProvider('openai');
    const metaModels = githubModelsDB.getModelsByProvider('meta');
    const mistralModels = githubModelsDB.getModelsByProvider('mistral-ai');

    logger.info(`🤖 OpenAI models: ${openaiModels.length}`);
    logger.info(`🦙 Meta models: ${metaModels.length}`);
    logger.info(`🌀 Mistral models: ${mistralModels.length}`);

    // Test by category
    const highModels = githubModelsDB.getModelsByCategory('high');
    const mediumModels = githubModelsDB.getModelsByCategory('medium');
    const lowModels = githubModelsDB.getModelsByCategory('low');

    logger.info(`⚡ High-tier models: ${highModels.length}`);
    logger.info(`🔶 Medium-tier models: ${mediumModels.length}`);
    logger.info(`🔷 Low-tier models: ${lowModels.length}`);

    // Test multimodal models
    const multimodalModels = githubModelsDB.getMultimodalModels();
    logger.info(`🖼️ Multimodal models: ${multimodalModels.length}`);
    if (multimodalModels.length > 0) {
      multimodalModels.forEach((model) => {
        logger.info(`   - ${model.id} (${model.name})`);
      });
    }

    // Test specific model lookup
    const gpt5 = githubModelsDB.getModel('openai/gpt-5');
    if (gpt5) {
      logger.info(`🎯 GPT-5 Details:`);
      logger.info(`   Context: ${gpt5.contextWindow} tokens`);
      logger.info(`   Output: ${gpt5.maxOutputTokens} tokens`);
      logger.info(`   Category: ${gpt5.category}`);
      logger.info(
        `   Rate Limits: ${gpt5.rateLimits.requestsPerMinute}/min, ${gpt5.rateLimits.requestsPerDay}/day`
      );
    }

    // Test context window insights
    logger.info('📊 Context Window Analysis:');
    const contextSummary = new Map<number, number>();
    allModels.forEach((model) => {
      const current = contextSummary.get(model.contextWindow)||0;
      contextSummary.set(model.contextWindow, current + 1);
    });

    Array.from(contextSummary.entries())
      .sort(([a], [b]) => b - a)
      .forEach(([tokens, count]) => {
        logger.info(`   ${tokens.toLocaleString()} tokens: ${count} models`);
      });

    // Test database stats
    const stats = githubModelsDB.getStats();
    logger.info('📈 Database Statistics:');
    logger.info(`   Total: ${stats.total}`);
    logger.info(`   Last Update: ${stats.lastUpdate.toISOString()}`);
    logger.info(`   Providers: ${stats.providers.join(', ')}`);

    logger.info('');
    logger.info('🔄 Note: Database updates hourly from "gh models list"');
    logger.info(
      '📋 All models limited to 8k input / 4k output on GitHub Models'
    );
  } catch (error) {
    logger.error('💥 GitHub Models Database test failed:', error);
  }
}

// Run the test
testGitHubModelsDatabase()
  .then(() => {
    logger.info('✅ Database test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Database test failed:', error);
    process.exit(1);
  });
