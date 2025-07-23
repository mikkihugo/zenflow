#!/usr/bin/env node

/**
 * Example: Using Hive Mind with Claude as primary AI
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

// Ensure example directory exists
const exampleDir = process.cwd();
const hiveMindDir = path.join(exampleDir, '.hive-mind');

console.log('🐝 Hive Mind with Claude Example\n');

// Step 1: Set up the project with Claude as primary
console.log('Step 1: Initializing project with Claude configuration...');
try {
  mkdirSync(hiveMindDir, { recursive: true });
  
  // Create llm-provider.json with Claude as primary
  const llmConfig = {
    providers: {
      claude: {
        enabled: true,
        priority: 1,
        modelId: 'sonnet',
        maxTurns: 5,
        customSystemPrompt: 'You are an expert AI assistant helping with software development. Be concise and practical.',
        commandSpecific: {
          'queen': {
            customSystemPrompt: 'You are the Queen agent coordinating a hive of specialized agents. Delegate tasks efficiently.'
          },
          'research': {
            maxTurns: 10,
            customSystemPrompt: 'You are a research specialist. Provide thorough analysis with sources.'
          },
          'code': {
            customSystemPrompt: 'You are a coding expert. Write clean, well-documented code following best practices.'
          }
        }
      },
      google: {
        apiKey: process.env.GEMINI_API_KEY || null,
        priority: 2
      }
    },
    defaultProvider: 'claude',
    fallbackProvider: 'google'
  };
  
  writeFileSync(
    path.join(hiveMindDir, 'llm-provider.json'),
    JSON.stringify(llmConfig, null, 2)
  );
  
  console.log('✅ Claude configuration created\n');
} catch (error) {
  console.error('Failed to create configuration:', error.message);
}

// Step 2: Test Claude availability
console.log('Step 2: Checking Claude availability...');
try {
  execSync('which claude', { stdio: 'ignore' });
  console.log('✅ Claude CLI is available\n');
} catch (error) {
  console.error('❌ Claude CLI not found!');
  console.log('\nPlease install Claude Code:');
  console.log('1. Download from: https://claude.ai/download');
  console.log('2. Run: claude login');
  console.log('3. Authenticate with your Anthropic account\n');
  process.exit(1);
}

// Step 3: Example hive mind commands
console.log('Step 3: Example Hive Mind commands with Claude:\n');

console.log('# Launch a hive to build a REST API:');
console.log('claude-zen hive-mind launch "Build a REST API for task management" --service=engineering\n');

console.log('# Spawn specialized agents:');
console.log('claude-zen spawn architect --capabilities "API design, database schema"');
console.log('claude-zen spawn backend-dev --capabilities "Node.js, Express, PostgreSQL"');
console.log('claude-zen spawn test-engineer --capabilities "Jest, API testing"\n');

console.log('# Coordinate task breakdown:');
console.log('claude-zen task create "Design task management API" --priority=high');
console.log('claude-zen task expand "Design task management API"\n');

console.log('# Check hive status:');
console.log('claude-zen hive-mind status\n');

// Step 4: Create example task for Claude
console.log('Step 4: Creating example task file...');
const exampleTask = {
  id: 'example-001',
  title: 'Implement user authentication',
  description: 'Add JWT-based authentication to the task management API',
  priority: 'high',
  assignedTo: 'backend-dev',
  subtasks: [
    'Design authentication schema',
    'Implement JWT token generation',
    'Create login/logout endpoints',
    'Add authentication middleware',
    'Write authentication tests'
  ]
};

writeFileSync(
  path.join(exampleDir, 'example-task.json'),
  JSON.stringify(exampleTask, null, 2)
);

console.log('✅ Example task created: example-task.json\n');

// Step 5: Show integration benefits
console.log('🎯 Benefits of Claude + Hive Mind Integration:\n');
console.log('1. No API keys required - uses your Claude Code authentication');
console.log('2. Superior code understanding with Sonnet model');
console.log('3. Longer context windows for complex projects');
console.log('4. Better task breakdown and technical analysis');
console.log('5. Seamless fallback to Google AI if needed\n');

console.log('📚 Next Steps:');
console.log('1. Run the example commands above');
console.log('2. Check .hive-mind/llm-provider.json for configuration');
console.log('3. Use "claude-zen hive-mind --help" for more options');
console.log('4. Monitor agent coordination in real-time\n');

console.log('Happy coding with Claude-powered Hive Mind! 🚀');