#!/usr/bin/env node

import { query } from '@anthropic-ai/claude-code/sdk.mjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '.');

console.log('Testing Claude SDK with bypassPermissions only...');

try {
  for await (const message of query({
    prompt: 'Use the LS tool to list files in the current directory.',
    options: {
      model: 'sonnet',
      maxTurns: 5,
      cwd: projectRoot,
      permissionMode: 'bypassPermissions',
      allowedTools: ['LS', 'Read', 'Glob']
    }
  })) {
    console.log(`📝 Type: ${message.type}, hasToolUse: ${!!message.toolUse}, length: ${message.result?.length || message.text?.length || 0}`);
    
    if (message.type === 'result') {
      console.log(`✅ Result: ${message.result?.substring(0, 100) || 'No result'}...`);
      break;
    }
    if (message.toolUse) {
      console.log(`🛠️ Tool used: ${message.toolUse.name}`);
    }
  }
} catch (error) {
  console.error('❌ Test failed:', error.message);
}