#!/usr/bin/env node

/**
 * Test Foundation SDK to see exact message structure
 */

import { executeClaudeTask } from './packages/foundation/dist/src/claude-sdk.js';

console.log('🧪 Testing Foundation SDK message structure...\n');

async function testSDK() {
  try {
    const messages = await executeClaudeTask('Say hello and fix this simple TypeScript error: let x: number = "string";', {
      model: 'sonnet',
      timeoutMs: 30000,
      permissionMode: 'bypassPermissions'
    });

    console.log('📊 Foundation SDK returned:');
    console.log(`📈 Messages count: ${messages.length}`);
    
    messages.forEach((message, index) => {
      console.log(`\n📝 Message ${index + 1}:`);
      console.log(`   Type: ${message.type}`);
      
      if (message.type === 'result') {
        console.log(`   Success: ${!message.is_error}`);
        console.log(`   Result: ${message.result ? message.result.substring(0, 100) + '...' : 'null'}`);
      } else if (message.type === 'assistant') {
        console.log(`   Content items: ${message.message?.content?.length || 0}`);
        if (message.message?.content) {
          message.message.content.forEach((content, i) => {
            console.log(`     [${i}] Type: ${content.type}`);
            if (content.text) {
              console.log(`     [${i}] Text: ${content.text.substring(0, 100)}...`);
            }
          });
        }
      } else {
        console.log(`   Data: ${JSON.stringify(message, null, 2).substring(0, 200)}...`);
      }
    });

  } catch (error) {
    console.error('❌ SDK Test failed:', error.message);
  }
}

testSDK();