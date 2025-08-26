/**
 * @fileoverview Test LLM Provider - Ask about GPT-5
 * 
 * Simple test to verify LLM provider integration works through intelligence facade.
 */

import { getLogger } from '@claude-zen/foundation';
import {
  executeClaudeTask,
  getLLMProvider,
  listLLMProviders,
  type CLIRequest,
  type CLIResponse
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
    providers.forEach(provider => {
      logger.info(`  - ${provider.name} (${provider.type}): ${provider.available ? '✅' : '❌'}`);
    });

    // Get best provider for inference
    const provider = getLLMProvider('inference');
    logger.info(`🔍 Selected provider: ${provider.constructor.name}`);

    // Ask about GPT-5
    const request: CLIRequest = {
      messages: [
        {
          role: 'user',
          content: 'Are you ChatGPT-5? What AI model are you exactly? Please be specific about your model name and version.'
        }
      ],
      temperature: 0.3,
      maxTokens: 200
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
      if (content.includes('gpt-5') || content.includes('gpt 5')) {
        logger.info('🎯 Response mentions GPT-5!');
      } else if (content.includes('claude')) {
        logger.info('🎯 Response indicates Claude model');
      } else if (content.includes('gpt-4') || content.includes('gpt 4')) {
        logger.info('🎯 Response indicates GPT-4');
      } else {
        logger.info('🤔 Model identity unclear from response');
      }
    } else {
      logger.error('❌ Request failed:', response.error);
    }

    // Also test executeClaudeTask
    logger.info('🚀 Testing executeClaudeTask...');
    try {
      const claudeResponse = await executeClaudeTask('What model are you? Are you GPT-5 or Claude?');
      logger.info('✅ executeClaudeTask response:');
      console.log('─'.repeat(60));
      console.log(claudeResponse);
      console.log('─'.repeat(60));
    } catch (error) {
      logger.warn('⚠️ executeClaudeTask failed:', error);
    }

  } catch (error) {
    logger.error('💥 Test failed:', error);
  }
}

// Run the test
testGPT5Question().catch(console.error);