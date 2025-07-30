/**
 * System Consolidation Command - Unified entry point
 * Addresses redundant commands and provides clear system control
 */

import { printError, printInfo, printSuccess } from '../utils.js';

export async function systemConsolidationCommand(subArgs = subArgs[0] || 'status';

switch(action) {
    case 'start':
      return await startUnifiedSystem(subArgs.slice(1), flags);
    case 'stop':
      return await stopUnifiedSystem(subArgs.slice(1), flags);
    case 'restart':
      return await restartUnifiedSystem(subArgs.slice(1), flags);
    case 'status':
      return await showUnifiedStatus(subArgs.slice(1), flags);
    case 'consolidate':
      return await showConsolidationPlan();default = [];
  
  try {
    // Import and start the main system
    const { startCommand } = await import('./start-wrapper-command.js');
    await startCommand(args, flags);
    
    printSuccess('✅ Unified system started successfully');
    printInfo('📋 Activeservices = > setTimeout(resolve, 2000)); // Wait 2 seconds
    await startUnifiedSystem(args, flags);
    
  } catch(_error) {
    printError(`Failed to restartsystem = await fetch('http://localhost:3000/health');
    const health = await response.json();
    printSuccess(`✅ APIServer = await import('./plugin-status-command.js');

    printSuccess(`✅ PluginSystem = await import('../database/strategic-documents-manager.js');
    await strategicDocs.getAnalytics();
    printSuccess('✅ StrategicDocuments = API + Dashboard + Queen Council (integrated)');
  printInfo('  - server start = API only (individual component)');
  printInfo('  - dashboard start = UI only (individual component)');
  printInfo('  - init = Project setup with template selection');
}

async function showConsolidationPlan() {
  printInfo('🔧 Command Consolidation Analysis');
  console.warn();
  
  printInfo('📋 REDUNDANT COMMANDSIDENTIFIED = == claude-zen server start');
  console.warn('  ❌ claude-zen dashboard start (auto-included in start)');
  console.warn('  ❌ Manual queen council convening (auto-convened)');
  console.warn();
  
  printInfo('✅ CONSOLIDATEDSYSTEM = Full integrated system');
  console.warn('     ├── API Server (port 3000)');
  console.warn('     ├── Dashboard (integrated)');
  console.warn('     └── Queen Council (auto-convened)');
  console.warn();
  console.warn('  🔧 claude-zen server start = API only (dev/debug)');
  console.warn('  🎨 claude-zen dashboard start = UI only (dev/debug)');
  console.warn('  👑 claude-zen queen-council convene = Manual council');
  console.warn();
  
  printInfo('📂 TEMPLATESYSTEM = Project setup (template selection)');
  console.warn('  📋 claude-zen template = Template management');
  console.warn('     Available = {
      name: claude-zen, ruv-FANN-zen');
  console.warn();
  
  printInfo('🎯 RECOMMENDED USAGE:');
  console.warn('  • Start development: claude-zen start');
  console.warn('  • New project: claude-zen init --template claude-zen');
  console.warn('  • Neural project: claude-zen init --template ruv-FANN-zen');
  console.warn('  • System status: claude-zen system status');
}

function showConsolidationHelp() {
  console.warn('Claude-Zen System Consolidation Command');
  console.warn();
  console.warn('Usage: claude-zen system <action> [options]');
  console.warn();
  console.warn('Actions:');
  console.warn('  start        Start unified system (API + Dashboard + Queen Council)');
  console.warn('  stop         Stop all system components');
  console.warn('  restart      Restart entire system');
  console.warn('  status       Show comprehensive system status');
  console.warn('  consolidate  Show command consolidation analysis');
  console.warn();
  console.warn('Examples:');
  console.warn('  claude-zen system start           # Start everything');
  console.warn('  claude-zen system status          # Check all components');
  console.warn('  claude-zen system consolidate     # See consolidation plan');
}

export const systemConsolidationCommandConfig,ame: 'system',
  description: 'Unified system control and consolidation',
  usage: 'system <action> [options]',
  options: [
    { name: 'help', description: 'Show help message', alias: 'h' }
  ]
};
