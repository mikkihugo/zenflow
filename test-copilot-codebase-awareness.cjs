#!/usr/bin/env node

/**
 * Test if GitHub Copilot has codebase awareness for claude-code-zen
 */

const fs = require('fs');
const path = require('path');
const { homedir } = require('os');

async function testCodebaseAwareness() {
  console.log('🔍 Testing GitHub Copilot Codebase Awareness');
  console.log('===========================================\n');

  try {
    // Load token
    const tokenPath = path.join(homedir(), '.claude-zen', 'copilot-token.json');
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const token = tokenData.access_token;

    // Test queries about the codebase
    const testQueries = [
      {
        name: "Package Structure",
        query: "What packages are in the claude-code-zen monorepo? List the main packages under packages/implementation-packages/"
      },
      {
        name: "LLM Routing",
        query: "In the claude-code-zen codebase, what is the purpose of the @claude-zen/llm-routing package? What providers are configured?"
      },
      {
        name: "Strategic Facades", 
        query: "What are the strategic facade packages in claude-code-zen? What do @claude-zen/foundation, @claude-zen/intelligence, @claude-zen/enterprise provide?"
      },
      {
        name: "Project Structure",
        query: "What is the main entry point for the claude-code-zen server application? Where is the main.ts file located?"
      },
      {
        name: "GitHub OAuth",
        query: "How does claude-code-zen handle GitHub Copilot authentication? What files implement the OAuth flow?"
      }
    ];

    for (const test of testQueries) {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log('─'.repeat(50));
      
      try {
        const response = await fetch('https://api.githubcopilot.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'claude-code-zen/1.0',
            'Copilot-Integration-Id': 'vscode-chat'
          },
          body: JSON.stringify({
            model: 'gpt-4o', // Use a reliable model for this test
            messages: [
              {
                role: 'system',
                content: 'You are helping with the claude-code-zen codebase. If you have access to repository information, provide specific details. If not, clearly state you do not have access to this specific codebase.'
              },
              {
                role: 'user',
                content: test.query
              }
            ],
            max_tokens: 300,
            temperature: 0.1 // Low temperature for factual responses
          })
        });

        if (response.ok) {
          const result = await response.json();
          const answer = result.choices?.[0]?.message?.content || 'No response';
          
          console.log(`Response: ${answer}\n`);
          
          // Analyze response for codebase awareness indicators
          const hasSpecificInfo = answer.toLowerCase().includes('claude-code-zen') || 
                                 answer.toLowerCase().includes('llm-routing') ||
                                 answer.toLowerCase().includes('strategic facade') ||
                                 answer.toLowerCase().includes('@claude-zen');
          
          const claimsNoAccess = answer.toLowerCase().includes('do not have access') ||
                               answer.toLowerCase().includes('cannot access') ||
                               answer.toLowerCase().includes('no access to') ||
                               answer.toLowerCase().includes('not have information');
          
          if (hasSpecificInfo) {
            console.log('🟢 CODEBASE AWARE: Response contains specific information about this repository');
          } else if (claimsNoAccess) {
            console.log('🔴 NO CODEBASE ACCESS: Model explicitly states no access to this repository');
          } else {
            console.log('🟡 UNCLEAR: Response is generic, unclear if codebase-aware');
          }
          
        } else {
          console.log(`❌ API Error: ${response.status} ${response.statusText}`);
        }
        
      } catch (error) {
        console.log(`❌ Request Error: ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n📊 Codebase Awareness Summary:');
    console.log('============================');
    console.log('GitHub Copilot provides general AI capabilities but may have limited');
    console.log('or no specific awareness of private repository contents unless the');
    console.log('repository is public or you have specific enterprise features enabled.');
    console.log('');
    console.log('For codebase-specific tasks, Claude Code CLI remains the best choice');
    console.log('as it has direct file access and can read the actual codebase.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCodebaseAwareness();