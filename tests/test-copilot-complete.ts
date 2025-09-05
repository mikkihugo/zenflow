#!/usr/bin/env tsx

/**
 * Complete Copilot integration test with proper VS Code authentication
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

async function testCompleteCopilotFlow() {
  try {
    // Removed console.log('🚀 Testing Complete GitHub Copilot Integration');
    // Removed console.log('═'.repeat(60));

    // Import our Copilot provider
    const { CopilotAuth, CopilotChatClient, CopilotTokenManager } = await import('./packages/integrations/copilot-provider/src/index.js');
    
    // Removed console.log('\n1️⃣ Checking for existing VS Code-compatible token...');
    
    let githubToken: string;
    
    // Try to load existing token
    try {
      const tokenPath = join(homedir(), '.claude-zen', 'copilot-token.json');
      const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
      githubToken = tokenData.access_token;
      // Removed console.log('✅ Found existing token');
    } catch {
      // Removed console.log('❌ No existing token found');
      // Removed console.log('\n2️⃣ Starting VS Code-compatible OAuth flow...');
      
      const auth = new CopilotAuth();
      githubToken = await auth.authenticate();
      
      // Save the new token
      const tokenPath = join(homedir(), '.claude-zen', 'copilot-token.json');
      const tokenData = {
        access_token: githubToken,
        created_at: new Date().toISOString(),
        source: 'vscode-compatible-oauth',
        usage: 'VS Code compatible token for GitHub Copilot API access'
      };
      await fs.writeFile(tokenPath, JSON.stringify(tokenData, null, 2));
      // Removed console.log('💾 Token saved successfully');
    }

    // Removed console.log('\n3️⃣ Testing Copilot token exchange...');
    const tokenManager = new CopilotTokenManager();
    
    try {
      const copilotToken = await tokenManager.getCopilotToken(githubToken);
      // Removed console.log('✅ Successfully obtained Copilot token!');
      // Removed console.log(`   Token: ${copilotToken.token.substring(0, 20)}...`);
      // Removed console.log(`   Expires: ${new Date(copilotToken.expires_at * 1000).toISOString()}`);
      // Removed console.log(`   Chat enabled: ${copilotToken.chat_enabled}`);
      // Removed console.log(`   SKU: ${copilotToken.sku || 'unknown'}`);
      // Removed console.log(`   Organizations: ${copilotToken.organizations.length} orgs`);
    } catch (error) {
      // Removed console.log(`❌ Copilot token exchange failed: ${error}`);
      // Removed console.log('🔧 This might mean the token still needs to be created through VS Code\'s flow');
      return;
    }

    // Removed console.log('\n4️⃣ Testing chat completion...');
    const client = new CopilotChatClient(githubToken);
    
    try {
      const response = await client.createChatCompletion({
        messages: [
          { role: 'user', content: 'Say "Hello from real GitHub Copilot!" and explain what you are in one sentence.' }
        ],
        model: 'gpt-4',
        max_tokens: 100
      });
      
      // Removed console.log('✅ Chat completion successful!');
      // Removed console.log('📨 Response:');
      // Removed console.log('─'.repeat(50));
      // Removed console.log(response.choices[0]?.message?.content);
      // Removed console.log('─'.repeat(50));
      
      if (response.usage) {
        // Removed console.log(`📊 Token usage: ${response.usage.total_tokens} total (${response.usage.prompt_tokens} prompt + ${response.usage.completion_tokens} completion)`);
      }
      
    } catch (error) {
      // Removed console.log(`❌ Chat completion failed: ${error}`);
      return;
    }

    // Removed console.log('\n🎉 SUCCESS! GitHub Copilot integration is fully working!');
    // Removed console.log('✨ You now have:');
    // Removed console.log('   • VS Code-compatible authentication');
    // Removed console.log('   • Working Copilot token exchange');
    // Removed console.log('   • Full chat completion API access');
    // Removed console.log('   • Enterprise-level access through your organization');
    
  } catch (error) {
    // Kept error handling, but removed console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCompleteCopilotFlow();