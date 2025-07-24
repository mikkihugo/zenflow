#!/usr/bin/env node

/**
 * Demo: Claude-powered Hive Mind in action
 */

import { execSync } from 'child_process';
import { printSuccess, printInfo, printWarning } from './src/cli/utils.js';

console.log('🐝 Claude-Powered Hive Mind Demo\n');

printInfo('This demo shows Claude as the primary AI for hive coordination.\n');

// Step 1: Create a simple hive task
printInfo('Step 1: Creating a task for the hive...');
const task = "Create a simple TODO API with user authentication";

// Step 2: Show how Claude would handle it
printInfo('\nStep 2: Claude analyzes the task...\n');

try {
  // Use the Claude provider directly
  const { ClaudeCodeProvider } = await import('./src/cli/claude-code-provider.js');
  const provider = new ClaudeCodeProvider({
    customSystemPrompt: 'You are a Queen agent coordinating a software development hive. Break down tasks efficiently and delegate to specialized agents.'
  });

  if (await provider.isAvailable()) {
    printSuccess('✅ Claude is ready to coordinate!\n');
    
    // Get task breakdown
    const breakdown = await provider.generateForTask('expand-task', task);
    
    printInfo('Claude\'s Task Breakdown:');
    console.log(breakdown.substring(0, 500) + '...\n');
    
    // Show agent delegation
    const agentPrompt = `Based on this task: "${task}", what specialized agents would you spawn and what would each do? Format as a list.`;
    const agentPlan = await provider.generateText(agentPrompt);
    
    printInfo('Claude\'s Agent Delegation Plan:');
    console.log(agentPlan.substring(0, 500) + '...\n');
    
    printSuccess('✅ Claude successfully coordinated the hive!\n');
    
    // Show the actual commands
    printInfo('To run this with the actual hive mind:');
    console.log('');
    console.log('  # Launch the hive');
    console.log(`  claude-zen hive-mind launch "${task}"`);
    console.log('');
    console.log('  # Monitor progress');
    console.log('  claude-zen hive-mind status');
    console.log('');
    console.log('  # View agent coordination');
    console.log('  claude-zen swarm monitor');
    
  } else {
    printWarning('Claude is not available. Please run: claude login');
  }
  
} catch (error) {
  printWarning(`Demo error: ${error.message}`);
  printInfo('\nMake sure Claude Code is installed and authenticated.');
}

console.log('\n🚀 Claude + Hive Mind = Powerful AI-driven development!');