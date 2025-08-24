#!/usr/bin/env node

import { query } from '@anthropic-ai/claude-code/sdk.mjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '.');

console.log('Testing Claude SDK with streaming prompt and canUseTool...');

// Test streaming format
const promptStream = async function* () {
  yield { type: 'text', content: 'List files in current directory using the Read tool. This is a test to see if tools work.' };
};

try {
  for await (const message of query({
    prompt: promptStream(),
    options: {
      model: 'sonnet',
      maxTurns: 5,
      cwd: projectRoot,
      permissionMode: 'bypassPermissions',
      allowedTools: ['Read', 'Glob', 'LS'],
      canUseTool: async (toolName, toolInput, context) => {
        console.log(`🛠️ Tool requested: ${toolName}, Input:`, JSON.stringify(toolInput));
        return { approved: true, reason: 'Test approved' };
      }
    }
  })) {
    console.log(`📝 Message type: ${message.type}, hasToolUse: ${!!message.toolUse}, content length: ${message.result?.length || message.text?.length || 0}`);
    
    if (message.type === 'result' && message.result) {
      console.log(`✅ Final result: ${message.result.substring(0, 200)}...`);
      break;
    }
  }
} catch (error) {
  console.error('❌ Claude SDK test failed:', error.message);
}