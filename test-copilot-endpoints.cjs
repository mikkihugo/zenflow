#!/usr/bin/env node

/**
 * Test GitHub Copilot Token with OpenAI-compatible endpoints
 * Based on aider's integration pattern
 */

const fs = require('fs');
const path = require('path');
const { homedir } = require('os');

// Read the Copilot token
const tokenPath = path.join(homedir(), '.claude-zen', 'copilot-token.json');

async function loadCopilotToken() {
  try {
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Could not load Copilot token:', error.message);
    console.error('Run: claude-zen auth copilot');
    process.exit(1);
  }
}

// Test OpenAI-compatible endpoints with Copilot token
async function testCopilotEndpoints() {
  const token = await loadCopilotToken();
  console.log('🔑 Testing GitHub Copilot with OpenAI-compatible endpoints...');
  console.log(`📋 Token: ${token.substring(0, 8)}...`);

  // Test 1: Models endpoint (GitHub Copilot)
  console.log('\n📋 Testing GitHub Copilot /models endpoint...');
  try {
    const modelsResponse = await fetch('https://api.githubcopilot.com/models', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'claude-code-zen/1.0',
        'Copilot-Integration-Id': 'vscode-chat'
      }
    });

    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log('✅ Models endpoint successful');
      console.log(`📊 Available models: ${models.data?.length || 'unknown'}`);
      if (models.data?.length > 0) {
        console.log(`🎯 First model: ${models.data[0].id}`);
      }
    } else {
      console.log(`❌ Models endpoint failed: ${modelsResponse.status} ${modelsResponse.statusText}`);
      const errorText = await modelsResponse.text();
      console.log(`📝 Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Models endpoint error: ${error.message}`);
  }

  // Test 2: Chat completions endpoint (GitHub Copilot)
  console.log('\n🤖 Testing GitHub Copilot /chat/completions endpoint...');
  try {
    const chatResponse = await fetch('https://api.githubcopilot.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'claude-code-zen/1.0',
        'Copilot-Integration-Id': 'vscode-chat'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Hello! Can you help me with a simple coding task?'
          }
        ],
        max_tokens: 50,
        temperature: 0.3
      })
    });

    if (chatResponse.ok) {
      const completion = await chatResponse.json();
      console.log('✅ Chat completions endpoint successful');
      console.log(`💬 Response: ${completion.choices?.[0]?.message?.content || 'No content'}`);
      console.log(`📊 Usage: ${JSON.stringify(completion.usage || {})}`);
    } else {
      console.log(`❌ Chat completions failed: ${chatResponse.status} ${chatResponse.statusText}`);
      const errorText = await chatResponse.text();
      console.log(`📝 Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Chat completions error: ${error.message}`);
  }

  // Test 3: Alternative Copilot-specific endpoints
  console.log('\n🔬 Testing alternative Copilot endpoints...');
  
  // Some Copilot tokens might work with different base URLs
  const alternativeEndpoints = [
    'https://copilot-proxy.githubusercontent.com/v1/models',
    'https://api.githubcopilot.com/v1/models'
  ];

  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'claude-code-zen/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint} - Success`);
        console.log(`📊 Response: ${JSON.stringify(data).substring(0, 200)}...`);
      } else {
        console.log(`❌ ${endpoint} - ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }

  console.log('\n🎯 Integration Test Summary:');
  console.log('- Token successfully loaded from claude-zen config');
  console.log('- OpenAI API compatibility tested');
  console.log('- Ready for aider integration');
  console.log('\n🔧 To use with aider:');
  console.log(`export OPENAI_API_BASE="https://api.githubcopilot.com"`);
  console.log(`export OPENAI_API_KEY="${token}"`);
  console.log('aider --model gpt-4.1');
}

// Run the tests
testCopilotEndpoints().catch(console.error);