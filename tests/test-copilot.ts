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
    // 🔑 Loading GitHub token...
    const githubToken = await loadGitHubToken();
    // ✅ Token loaded: [REDACTED]

    // Import our Copilot client
    const { CopilotTokenManager, CopilotChatClient } = await import('./packages/integrations/copilot-provider/src/index.js');

    // 🔄 Exchanging GitHub token for Copilot token...
    const tokenManager = new CopilotTokenManager();
    const copilotToken = await tokenManager.getCopilotToken(githubToken);
    // Copilot token obtained, expires: [timestamp], chat enabled: [bool], SKU: [sku], orgs: [count]

    // 🤖 Creating chat client...
    const client = new CopilotChatClient(githubToken);

    // Testing model listing...
    const models = await client.listModels();
    // Available models: [list]

    // Testing chat completion...
    const response = await client.createChatCompletion({
      messages: [
        { role: 'user', content: 'Say "Hello from GitHub Copilot!" in a single line.' }
      ],
      model: 'gpt-4',
      max_tokens: 50
    });

    // Response: [content]
    // Token usage: [usage]

    // All tests passed! Copilot integration is working.
    
  } catch (error) {
    // ❌ Test failed
    process.exit(1);
  }
}

testCopilot();