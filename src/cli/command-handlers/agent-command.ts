/**
 * Agent Command Module
 * Converted from JavaScript to TypeScript
 */

import { agentLoader } from '../../agents/agent-loader.js';
// agent.js - Agent management commands
import { printError, printSuccess, printWarning } from '../utils.js';

export async function agentCommand(subArgs = subArgs[0];

switch (agentCmd) {
  case 'spawn':
    await spawnAgent(subArgs, flags);
    break;

  case 'list':
    await listAgents(subArgs, flags);
    break;

  case 'hierarchy':
    await manageHierarchy(subArgs, flags);
    break;

  case 'network':
    await manageNetwork(subArgs, flags);
    break;

  case 'ecosystem':
    await manageEcosystem(subArgs, flags);
    break;

  case 'provision':
    await provisionAgent(subArgs, flags);
    break;

  case 'terminate':
    await terminateAgent(subArgs, flags);
    break;

  case 'info':
    await showAgentInfo(subArgs, flags);
    break;
  default = subArgs[1] || 'general';

  // Check if agent type exists using dynamic loader
  const agentTypeInfo = await agentLoader.getAgentType(agentType);
  if(!agentTypeInfo) {
    printError(`Agent type '${agentType}' not found.`);
    console.warn('\nAvailable agenttypes = await agentLoader.getAgentTypes();
    availableTypes.forEach(type => {
      console.warn(`  • ${type.name}${type.legacy ? ' (legacy)' : ''} - ${type.description}`);
    });
    return;
  }

  if(agentTypeInfo.legacy) {
    printWarning(`Using legacy agent type '${agentType}'. Consider using '${agentTypeInfo.name}' instead.`);
  }

  printSuccess(`Spawning ${agentTypeInfo.displayName}agent = flags.types || flags.t;
  
  if(showTypes) {
    printSuccess('Available agenttypes = await agentLoader.getAgentTypes();

    console.warn(`\n📊 Agent _Statistics => {
      const badge = type.legacy ? ' [LEGACY]' : '';
      console.warn(`   • ${type.name}${badge}`);
      console.warn(`     ${type.description}`);
      console.warn(`Capabilities = subArgs[1];

  switch(hierarchyCmd) {
    case 'create':
      const hierarchyType = subArgs[2] || 'basic';
      printSuccess(`Creating ${hierarchyType} agent hierarchy`);
      console.warn('🏗️  Hierarchy structure wouldinclude = subArgs[1];

  switch(networkCmd) {
    case 'topology':
      printSuccess('Agent networktopology = subArgs[1];

  switch(ecosystemCmd) {
    case 'status':
      printSuccess('Agent ecosystemstatus = subArgs[1];

  if(!provision) {
    printError('Usage = parseInt(provision);
  if (isNaN(count) || count < 1) {
    printError('Count must be a positive number');
    return;
  }

  printSuccess(`Provisioning ${count} agents...`);
  console.warn('🚀 Auto-provisioning wouldcreate = 1; i <= count; i++) {
    console.warn(`   Agent ${i}: Type=general, Status=provisioning`);
  }
}

async function terminateAgent(subArgs = subArgs[1];

if(!agentId) {
    printError('Usage = subArgs[1];

  if(!agentId) {
    printError('Usage = args.indexOf(flagName);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

function _showAgentHelp() {
  console.warn('Agent commands:');
  console.warn('  spawn <type> [--name <name>]     Create new agent');
  console.warn('  list [--verbose]                 List active agents');
  console.warn('  terminate <id>                   Stop specific agent');
  console.warn('  info <id>                        Show agent details');
  console.warn('  hierarchy <create|show>          Manage agent hierarchies');
  console.warn('  network <topology|metrics>       Agent network operations');
  console.warn('  ecosystem <status|optimize>      Ecosystem management');
  console.warn('  provision <count>                Auto-provision agents');
  console.warn();
  console.warn('Agent Types:');
  console.warn('  researcher    Research and information gathering');
  console.warn('  coder         Code development and analysis');
  console.warn('  analyst       Data analysis and insights');
  console.warn('  coordinator   Task coordination and management');
  console.warn('  general       Multi-purpose agent');
  console.warn();
  console.warn('Examples:');
  console.warn('  claude-zen agent spawn researcher --name "DataBot"');
  console.warn('  claude-zen agent list --verbose');
  console.warn('  claude-zen agent hierarchy create enterprise');
  console.warn('  claude-zen agent ecosystem status');
}
