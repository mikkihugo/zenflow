#!/usr/bin/env tsx

/**
 * Complete Copilot integration test with proper VS Code authentication
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

async function testCompleteCopilotFlow() {
  try {
    console.log('🚀 Testing Complete GitHub Copilot Integration');
    console.log('═'.repeat(60));

    // Import our Copilot provider
    const { CopilotAuth, CopilotChatClient, CopilotTokenManager } = await import('./packages/integrations/copilot-provider/src/index.js');
    
    console.log('\n1️⃣ Checking for existing VS Code-compatible token...');
    
    let githubToken: string;
    
    // Try to load existing token
    try {
      const tokenPath = join(homedir(), '.claude-zen', 'copilot-token.json');
      const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
      githubToken = tokenData.access_token;
      console.log('✅ Found existing token');
    } catch {
      console.log('❌ No existing token found');
      console.log('\n2️⃣ Starting VS Code-compatible OAuth flow...');
      
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
      console.log('💾 Token saved successfully');
    }

    console.log('\n3️⃣ Testing Copilot token exchange...');
    const tokenManager = new CopilotTokenManager();
    
    try {
      const copilotToken = await tokenManager.getCopilotToken(githubToken);
      console.log('✅ Successfully obtained Copilot token!');
      console.log(`   Token: ${copilotToken.token.substring(0, 20)}...`);
      console.log(`   Expires: ${new Date(copilotToken.expires_at * 1000).toISOString()}`);
      console.log(`   Chat enabled: ${copilotToken.chat_enabled}`);
      console.log(`   SKU: ${copilotToken.sku || 'unknown'}`);
      console.log(`   Organizations: ${copilotToken.organizations.length} orgs`);
    } catch (error) {
      console.log(`❌ Copilot token exchange failed: ${error}`);
      console.log('🔧 This might mean the token still needs to be created through VS Code\'s flow');
      return;
    }

    console.log('\n4️⃣ Testing chat completion...');
    const client = new CopilotChatClient(githubToken);
    
    try {
      const response = await client.createChatCompletion({
        messages: [
          { role: 'user', content: 'Say "Hello from real GitHub Copilot!" and explain what you are in one sentence.' }
        ],
        model: 'gpt-4',
        max_tokens: 100
      });
      
      console.log('✅ Chat completion successful!');
      console.log('📨 Response:');
      console.log('─'.repeat(50));
      console.log(response.choices[0]?.message?.content);
      console.log('─'.repeat(50));
      
      if (response.usage) {
        console.log(`📊 Token usage: ${response.usage.total_tokens} total (${response.usage.prompt_tokens} prompt + ${response.usage.completion_tokens} completion)`);
      }
      
    } catch (error) {
      console.log(`❌ Chat completion failed: ${error}`);
      return;
    }

    console.log('\n🎉 SUCCESS! GitHub Copilot integration is fully working!');
    console.log('✨ You now have:');
    console.log('   • VS Code-compatible authentication');
    console.log('   • Working Copilot token exchange'); 
    console.log('   • Full chat completion API access');
    console.log('   • Enterprise-level access through your organization');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCompleteCopilotFlow();