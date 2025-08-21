#!/usr/bin/env node

/**
 * Check actual GitHub Copilot models available via API
 */

const fs = require('fs');
const path = require('path');
const { homedir } = require('os');

async function checkCopilotModels() {
  console.log('🔍 Checking GitHub Copilot Available Models');
  console.log('============================================\n');

  try {
    // Load token
    const tokenPath = path.join(homedir(), '.claude-zen', 'copilot-token.json');
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const token = tokenData.access_token;

    // Fetch models
    const response = await fetch('https://api.githubcopilot.com/models', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'claude-code-zen/1.0',
        'Copilot-Integration-Id': 'vscode-chat'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const models = await response.json();
    
    console.log(`📊 Total models available: ${models.data?.length || 0}\n`);
    
    if (models.data) {
      console.log('📋 Available Models:');
      console.log('===================');
      
      // Group and sort models
      const sortedModels = models.data.sort((a, b) => a.id.localeCompare(b.id));
      
      sortedModels.forEach((model, index) => {
        console.log(`${index + 1}. ${model.id}`);
        if (model.max_tokens) {
          console.log(`   Max tokens: ${model.max_tokens}`);
        }
        if (model.description) {
          console.log(`   Description: ${model.description}`);
        }
        console.log('');
      });

      // Check for specific models we're interested in
      console.log('\n🎯 Key Models Check:');
      console.log('====================');
      
      const keyModels = ['gpt-5', 'gpt-4.1', 'gpt-4', 'gpt-3.5-turbo', 'claude', 'o1'];
      
      keyModels.forEach(modelName => {
        const found = sortedModels.find(m => 
          m.id.includes(modelName) || 
          m.id.toLowerCase().includes(modelName.toLowerCase())
        );
        
        if (found) {
          console.log(`✅ ${modelName}: Found as "${found.id}"`);
        } else {
          console.log(`❌ ${modelName}: Not found`);
        }
      });

      // Test GPT-4 specifically since GPT-5 might not exist
      console.log('\n🧪 Testing actual models with chat completions:');
      console.log('===============================================');
      
      const testModels = ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo'];
      
      for (const modelId of testModels) {
        const found = sortedModels.find(m => m.id === modelId);
        if (found) {
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
                model: modelId,
                messages: [{ role: 'user', content: 'Say hello in one word.' }],
                max_tokens: 5
              })
            });

            if (chatResponse.ok) {
              const result = await chatResponse.json();
              console.log(`✅ ${modelId}: Working (${result.choices?.[0]?.message?.content || 'no response'})`);
            } else {
              console.log(`❌ ${modelId}: Failed (${chatResponse.status})`);
            }
          } catch (error) {
            console.log(`❌ ${modelId}: Error (${error.message})`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking models:', error.message);
    process.exit(1);
  }
}

checkCopilotModels();