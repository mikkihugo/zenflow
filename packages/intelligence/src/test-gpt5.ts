/**
 * @fileoverview Test LLM Provider - Ask about GPT-5
 *
 * Simple test to verify LLM provider integration works through intelligence facade.
 */

import { getLogger } from '@claude-zen/foundation';

import {
  getLLMProvider,
  listLLMProviders,
  type CLIRequest,
  type CLIResponse,
} from './index';

const logger = getLogger('gpt5-test');

/**
 * Test LLM Provider by asking if it's GPT-5
 */
async function testGPT5Question(): Promise<void> {
  logger.info('🤖 Testing LLM Provider - Asking about GPT-5...');

  try {
    // List available providers
    const providers = listLLMProviders();
    logger.info(`📋 Available providers (${providers.length}):`);
    providers.forEach((provider) => {
      logger.info(
        `  - ${provider.name} (${provider.type}): ${provider.available ? '✅' : '❌'}`,
      );
    });

    // Get best provider for inference
    const provider = getLLMProvider('inference');
    logger.info(`🔍 Selected provider: ${provider.constructor.name}`);

    // Ask about GPT-5
    const request: CLIRequest = {
      messages: [
        {
          role: 'user',
          content:
            'Are you ChatGPT-5? What AI model are you exactly? Please be specific about your model name and version.',
        },
      ],
      temperature: 0.3,
      maxTokens: 200,
    };

    logger.info('💬 Sending question about GPT-5...');
    const response: CLIResponse = await provider.execute(request);

    if (response.success) {
      logger.info('✅ Response received!');
      logger.info('📝 AI Response:');
      console.log('─'.repeat(60));
      console.log(response.content);
      console.log('─'.repeat(60));

      // Check if response mentions GPT-5
      const content = response.content.toLowerCase();
      if (content.includes('gpt-5')||content.includes('gpt 5')) {
        logger.info('🎯 Response mentions GPT-5!');
      } else if (content.includes('claude')) {
        logger.info('🎯 Response indicates Claude model');
      } else if (content.includes('gpt-4')||content.includes('gpt 4')) {
        logger.info('🎯 Response indicates GPT-4');
      } else {
        logger.info('🤔 Model identity unclear from response');
      }
    } else {
      logger.error('❌ Request failed:', response.error);
    }

    // Test different providers to find GPT-5
    logger.info('🔍 Testing different providers for GPT-5 access...');

    const providerTypes = ['github-models-api', 'openai-api', 'anthropic-api'];

    for (const providerType of providerTypes) {
      try {
        logger.info(`Testing ${providerType} for GPT-5...`);
        const testProvider = getLLMProvider(providerType as any);

        const gpt5Request: CLIRequest = {
          messages: [
            {
              role: 'user',
              content:
                'Are you GPT-5? Please identify your exact model name and version. If you are GPT-5, say "YES I AM GPT-5". If not, clearly state what model you are.',
            },
          ],
          model: 'gpt-5', // Try to explicitly request GPT-5
          temperature: 0.1,
          maxTokens: 200,
        };

        const response = await testProvider.execute(gpt5Request);

        if (response.success) {
          logger.info(`✅ ${providerType} Response:`);
          console.log('─'.repeat(60));
          console.log(response.content);
          console.log('─'.repeat(60));

          // Check for GPT-5 indicators
          const content = response.content.toLowerCase();
          if (
            content.includes('yes i am gpt-5')||content.includes('i am gpt-5')
          ) {
            logger.info('🎯 FOUND GPT-5! This provider has access to GPT-5!');
          } else if (content.includes('gpt-5')) {
            logger.info(
              '🤔 Response mentions GPT-5 but unclear if it IS GPT-5',
            );
          } else {
            logger.info('❌ This provider does not have GPT-5 access');
          }
        } else {
          logger.warn(`⚠️ ${providerType} failed: ${response.error}`);
        }
      } catch (error) {
        logger.warn(`❌ ${providerType} error:`, error);
      }
    }
  } catch (error) {
    logger.error('💥 Test failed:', error);
  }
}

// Run the test
testGPT5Question().catch(console.error);
