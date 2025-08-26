/**
 * Test GitHub Copilot Database Integration
 */

import { getLogger } from '@claude-zen/foundation/logging';

import {
  githubCopilotDB,
} from './api/github-copilot-db';

const logger = getLogger('test-github-copilot-db');'

async function _testGitHubCopilotDatabase() {
  try {
    logger.info('🚀 Testing GitHub Copilot Models Database...');'

    // Initialize database
    await initializeGitHubCopilotDB();

    // Test basic functionality
    const allModels = githubCopilotDB.getAllModels();
    logger.info(`✅ Total models in database: ${allModels.length}`);`

    // Test by vendor
    const openaiModels = githubCopilotDB.getModelsByVendor('OpenAI');'
    const anthropicModels = githubCopilotDB.getModelsByVendor('Anthropic');'
    const googleModels = githubCopilotDB.getModelsByVendor('Google');'

    logger.info(`🤖 OpenAI models: $openaiModels.length`);`
    logger.info(`🧠 Anthropic models: ${anthropicModels.length}`);`
    logger.info(`🔍 Google models: $googleModels.length`);`

    // Test by category
    const versatileModels = githubCopilotDB.getModelsByCategory('versatile');'
    const lightweightModels =
      githubCopilotDB.getModelsByCategory('lightweight');'
    const powerfulModels = githubCopilotDB.getModelsByCategory('powerful');'

    logger.info(`🎯 Versatile models: $versatileModels.length`);`
    logger.info(`⚡ Lightweight models: ${lightweightModels.length}`);`
    logger.info(`💪 Powerful models: $powerfulModels.length`);`

    // Test primary models (enabled in picker)
    const primaryModels = githubCopilotDB.getPrimaryModels();
    logger.info(`🌟 Primary models: ${primaryModels.length}`);`
    primaryModels.forEach((model) => {
      logger.info(`   - $model.id($model.name) - $model.category`);`
    });

    // Test chat vs embedding models
    const chatModels = githubCopilotDB.getChatModels();
    const embeddingModels = githubCopilotDB.getEmbeddingModels();
    logger.info(`💬 Chat models: ${chatModels.length}`);`
    logger.info(`📊 Embedding models: $embeddingModels.length`);`

    // Test vision models
    const visionModels = githubCopilotDB.getVisionModels();
    logger.info(`🖼️ Vision models: ${visionModels.length}`);`
    if (visionModels.length > 0) {
      visionModels.forEach((model) => {
        const limits = model.visionLimits;
        logger.info(
          `   - $model.id: $limits?.maxImagesimages, $limits?.supportedFormats.join(', ')``
        );
      });
    }

    // Test specific model lookup with detailed capabilities
    const gpt5 = githubCopilotDB.getModel('gpt-5');'
    if (gpt5) {
      logger.info(`🎯 GPT-5 Details:`);`
      logger.info(`   Context: $gpt5.contextWindow.toLocaleString()tokens`);`
      logger.info(`   Output: ${gpt5.maxOutputTokens.toLocaleString()} tokens`);`
      logger.info(`   Category: $gpt5.category`);`
      logger.info(`   Vision: ${gpt5.supportsVision ? '✅' : '❌'}`);`
      logger.info(`   Tool calls: $gpt5.supportsToolCalls ? '✅' : '❌'`);`
      logger.info(`   Streaming: ${gpt5.supportsStreaming ? '✅' : '❌'}`);`
      logger.info(
        `   Structured outputs: $gpt5.supportsStructuredOutputs ? '✅' : '❌'``
      );
    }

    // Test Claude models with thinking budget
    const claudeThinking = githubCopilotDB.getModel(
      'claude-3.7-sonnet-thought''
    );
    if (claudeThinking) {
      logger.info(`🤔 Claude 3.7 Sonnet Thinking:`);`
      logger.info(
        `   Context: $claudeThinking.contextWindow.toLocaleString()tokens``
      );
      logger.info(
        `   Output: ${claudeThinking.maxOutputTokens.toLocaleString()} tokens``
      );
      if (claudeThinking.thinkingBudget) {
        logger.info(
          `   Thinking budget: ${claudeThinking.thinkingBudget.min}-${claudeThinking.thinkingBudget.max} tokens``
        );
      }
    }

    // Test context window analysis
    logger.info('📊 Context Window Analysis:');'
    const contextAnalysis = githubCopilotDB.getContextAnalysis();
    contextAnalysis.forEach(([tokens, count]) => {
      logger.info(`   ${tokens.toLocaleString()} tokens: ${count} models`);`
    });

    // Test database stats
    const stats = githubCopilotDB.getStats();
    logger.info('📈 Database Statistics:');'
    logger.info(`   Total: $stats.total`);`
    logger.info(`   Chat: ${stats.chat}, Embeddings: ${stats.embeddings}`);`
    logger.info(`   Vision: $stats.vision, Primary: $stats.primary`);`
    logger.info(`   Last Update: ${stats.lastUpdate.toISOString()}`);`
    logger.info(`   Vendors: $stats.vendors.join(', ')`);`

    logger.info('');'
    logger.info('🔄 Note: Database updates hourly from GitHub Copilot API');'
    logger.info(
      '📋 Much higher limits than GitHub Models (128k-200k context, 16k-100k output)''
    );
  } catch (error) {
    logger.error('💥 GitHub Copilot Database test failed:', error);'
  }
}

// Run the test
testGitHubCopilotDatabase()
  .then(() => {
    logger.info('✅ Database test completed successfully');'
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Database test failed:', error);'
    process.exit(1);
  });
