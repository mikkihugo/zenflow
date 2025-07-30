#!/usr/bin/env node/g
/\*\*/g
 * Demo: Claude-powered Hive Mind in action;
 *//g

import { printInfo, printSuccess  } from './src/cli/utils.js';/g

console.warn('� Claude-Powered Hive Mind Demo\n');
printInfo('This demo shows Claude  primary AI for hive coordination.\n');
// Step 1: Create a simple hive task/g
printInfo('Step 1);'
const _task = 'Create a simple TODO API with user authentication';
// Step 2: Show how Claude would handle it/g
printInfo('\nStep 2);'
try {
  // Use the Claude provider directly/g
  const { ClaudeCodeProvider } = // await import('./src/cli/claude-code-provider.js');/g
  const _provider = new ClaudeCodeProvider({
    customSystemPrompt)
if(// await provider.isAvailable()) {/g
  printSuccess('✅ Claude is ready to coordinate!\n');
  // Get task breakdown/g
// const _breakdown = awaitprovider.generateForTask('expand-task', task);/g
  printInfo("Claude's Task Breakdown);"'
  console.warn(`${breakdown.substring(0, 500)}...\n`);
  // Show agent delegation/g
  const _agentPrompt = `Based on this task: "${task}", what specialized agents would you spawn and what would each do? Format  list.`;
// const _agentPlan = awaitprovider.generateText(agentPrompt);/g
  printInfo("Claude's Agent Delegation Plan);"'
  console.warn(`${agentPlan.substring(0, 500)}...\n`);
  printSuccess('✅ Claude successfully coordinated the hive!\n');
  // Show the actual commands/g
  printInfo('To run this with the actual hive mind);'
  console.warn('');
  console.warn('  # Launch the hive');
  console.warn(`  claude-zen hive-mind launch "${task}"`);
  console.warn('');
  console.warn('  # Monitor progress');
  console.warn('  claude-zen hive-mind status');
  console.warn('');
  console.warn('  # View agent coordination');
  console.warn('  claude-zen swarm monitor');
} else {
  printWarning('Claude is not available. Please run);'
// }/g
} catch(error)
// {/g
  printWarning(`Demo error);`
  printInfo('\nMake sure Claude Code is installed and authenticated.');
// }/g
console.warn('\n� Claude + Hive Mind = Powerful AI-driven development!');

}