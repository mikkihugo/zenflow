#!/usr/bin/env tsx

/**
 * Test actual Copilot access using enterprise authentication flow
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

async function loadGitHubToken(): Promise<string> {
  const tokenPath = join(homedir(), '.claude-zen', 'copilot-token.json');
  const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
  return tokenData.access_token;
}

async function testRealCopilotFlow() {
  try {
    console.log('🔑 Loading GitHub token...');
    const githubToken = await loadGitHubToken();
    console.log(`✅ Token loaded: ${githubToken.substring(0, 8)}...`);
    
    // Step 1: Check if we can access Copilot token with proper VS Code headers
    console.log('\n🔄 Testing Copilot token exchange with VS Code headers...');
    
    const tokenResponse = await fetch('https://api.github.com/copilot_internal/v2/token', {
      method: 'GET',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/json',
        'User-Agent': 'GitHubCopilotChat/0.22.4',
        'Editor-Version': 'vscode/1.96.0',
        'Editor-Plugin-Version': 'copilot-chat/0.22.4',
        'Openai-Organization': 'github-copilot',
        'Openai-Intent': 'conversation-panel',
        'Content-Type': 'application/json'
      }
    });

    console.log(`Response status: ${tokenResponse.status}`);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('Response body:', errorText);
      
      // The key insight: Your token needs to be created through VS Code's OAuth flow
      console.log('\n❌ Token exchange failed.');
      console.log('🔧 SOLUTION: Your token needs to be created through VS Code\'s OAuth flow.');
      console.log('');
      console.log('The issue is that your current token was created manually, but Copilot requires');
      console.log('tokens that were issued specifically through VS Code\'s OAuth client.');
      console.log('');
      console.log('To get a proper token:');
      console.log('1. Open VS Code');
      console.log('2. Sign out of GitHub (Command Palette > "GitHub Copilot: Sign Out")');
      console.log('3. Sign in again (this will use VS Code\'s OAuth flow)');
      console.log('4. Extract the token from VS Code\'s session storage');
      console.log('');
      console.log('Alternatively, we can implement the VS Code device OAuth flow...');
      return;
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Got Copilot token!', tokenData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealCopilotFlow();