#!/usr/bin/env tsx

/**
 * Example usage of GitHub Copilot integration
 * 
 * This demonstrates how to:
 * 1. Load the GitHub token from auth storage
 * 2. Create a Copilot client 
 * 3. List available models
 * 4. Send chat completion requests
 * 5. Handle streaming responses
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createCopilotClient } from '@claude-zen/copilot-provider';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('copilot-example');

async function loadGitHubToken(): Promise<string> {
  // Load from Claude Zen auth storage
  const tokenPath = join(homedir(), '.claude-zen', 'copilot-token.json');
  
  try {
    const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
    return tokenData.access_token;
  } catch (error) {
    throw new Error(
      'No GitHub token found. Please run "claude-zen auth login" first.'
    );
  }
}

async function main() {
  try {
    logger.info('Loading GitHub token...');
    const githubToken = await loadGitHubToken();
    
    logger.info('Creating Copilot client...');
    const client = await createCopilotClient(githubToken);
    
    // Test connection and list models
    logger.info('Testing connection...');
    const testResult = await client.testConnection();
    
    if (testResult.success) {
      logger.info('✅ Connection successful!');
      logger.info(`Available models: ${testResult.models?.join(', ')}`);
    } else {
      throw new Error(testResult.error);
    }
    
    // Send a chat completion
    logger.info('\n📤 Sending chat completion request...');
    
    const response = await client.createChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful coding assistant.' },
        { role: 'user', content: 'Write a TypeScript function to calculate factorial recursively.' }
      ],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000
    });
    
    logger.info('📨 Response received:');
    logger.info('─'.repeat(50));
    console.log(response.choices[0]?.message?.content);
    logger.info('─'.repeat(50));
    
    if (response.usage) {
      logger.info(`Token usage: ${response.usage.total_tokens} total (${response.usage.prompt_tokens} prompt + ${response.usage.completion_tokens} completion)`);
    }
    
    // Example of streaming response
    logger.info('\n🌊 Testing streaming response...');
    logger.info('─'.repeat(50));
    
    process.stdout.write('Response: ');
    
    for await (const chunk of client.createChatCompletionStream({
      messages: [
        { role: 'user', content: 'Explain async/await in JavaScript in 2 sentences.' }
      ],
      model: 'gpt-4',
      temperature: 0.5,
      max_tokens: 100
    })) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
      }
    }
    
    console.log('\n' + '─'.repeat(50));
    logger.info('✅ All tests completed successfully!');
    
  } catch (error) {
    logger.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}