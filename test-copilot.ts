#!/usr/bin/env tsx

/**
 * Quick test of the Copilot implementation
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

async function loadGitHubToken(): Promise<string> {
  const tokenPath = join(homedir(), '.claude-zen', 'copilot-token.json');
  const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
  return tokenData.access_token;
}

async function testCopilot() {
  try {
    console.log('🔑 Loading GitHub token...');
    const githubToken = await loadGitHubToken();
    console.log(`✅ Token loaded: ${githubToken.substring(0, 8)}...`);

    // Import our Copilot client
    const { CopilotTokenManager, CopilotChatClient } = await import('./packages/integrations/copilot-provider/src/index.js');

    console.log('🔄 Exchanging GitHub token for Copilot token...');
    const tokenManager = new CopilotTokenManager();
    const copilotToken = await tokenManager.getCopilotToken(githubToken);
    
    console.log(`✅ Copilot token obtained: ${copilotToken.token.substring(0, 20)}...`);
    console.log(`📅 Expires: ${new Date(copilotToken.expires_at * 1000).toISOString()}`);
    console.log(`💬 Chat enabled: ${copilotToken.chat_enabled}`);
    console.log(`📦 SKU: ${copilotToken.sku || 'unknown'}`);
    console.log(`🏢 Organizations: ${copilotToken.organizations.length} orgs`);

    console.log('\n🤖 Creating chat client...');
    const client = new CopilotChatClient(githubToken);
    
    console.log('📋 Testing model listing...');
    const models = await client.listModels();
    console.log(`✅ Available models: ${models.map(m => m.id).join(', ')}`);
    
    console.log('\n💬 Testing chat completion...');
    const response = await client.createChatCompletion({
      messages: [
        { role: 'user', content: 'Say "Hello from GitHub Copilot!" in a single line.' }
      ],
      model: 'gpt-4',
      max_tokens: 50
    });
    
    console.log('📨 Response:');
    console.log('─'.repeat(50));
    console.log(response.choices[0]?.message?.content);
    console.log('─'.repeat(50));
    
    if (response.usage) {
      console.log(`📊 Token usage: ${response.usage.total_tokens} total`);
    }
    
    console.log('\n✅ All tests passed! Copilot integration is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCopilot();