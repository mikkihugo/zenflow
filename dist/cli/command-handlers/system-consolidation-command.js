/**
 * System Consolidation Command - Unified entry point
 * Addresses redundant commands and provides clear system control
 */

import { printSuccess, printError, printInfo, printWarning } from '../utils.js';

export async function systemConsolidationCommand(subArgs, flags) {
  if (flags.help || flags.h) {
    showConsolidationHelp();
    return;
  }

  const action = subArgs[0] || 'status';

  switch (action) {
    case 'start':
      return await startUnifiedSystem(subArgs.slice(1), flags);
    case 'stop':
      return await stopUnifiedSystem(subArgs.slice(1), flags);
    case 'restart':
      return await restartUnifiedSystem(subArgs.slice(1), flags);
    case 'status':
      return await showUnifiedStatus(subArgs.slice(1), flags);
    case 'consolidate':
      return await showConsolidationPlan();
    default:
      showConsolidationHelp();
  }
}

async function startUnifiedSystem(args, flags) {
  printInfo('🚀 Starting unified Claude-Zen system...');
  
  const services = [];
  
  try {
    // Import and start the main system
    const { startCommand } = await import('./start-wrapper-command.js');
    await startCommand(args, flags);
    
    printSuccess('✅ Unified system started successfully');
    printInfo('📋 Active services: API Server, Dashboard, Queen Council');
    printInfo('🌐 Access points:');
    printInfo('  - API: http://localhost:3000');
    printInfo('  - Dashboard: Integrated with start command');
    printInfo('  - Queen Council: Auto-convened for oversight');
    
  } catch (error) {
    printError(`Failed to start unified system: ${error.message}`);
  }
}

async function stopUnifiedSystem(args, flags) {
  printInfo('⏹️ Stopping unified Claude-Zen system...');
  
  try {
    // Stop services gracefully
    // This would typically send shutdown signals to running processes
    printWarning('Stop functionality requires process management integration');
    printInfo('Use Ctrl+C to stop running services for now');
    
  } catch (error) {
    printError(`Failed to stop system: ${error.message}`);
  }
}

async function restartUnifiedSystem(args, flags) {
  printInfo('🔄 Restarting unified Claude-Zen system...');
  
  try {
    await stopUnifiedSystem(args, flags);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await startUnifiedSystem(args, flags);
    
  } catch (error) {
    printError(`Failed to restart system: ${error.message}`);
  }
}

async function showUnifiedStatus(args, flags) {
  printInfo('📊 Claude-Zen System Status');
  console.log();
  
  // Check API server
  try {
    const response = await fetch('http://localhost:3000/health');
    const health = await response.json();
    printSuccess(`✅ API Server: HEALTHY (uptime: ${health.uptime}s)`);
  } catch {
    printWarning('⚠️ API Server: NOT RESPONDING');
  }
  
  // Check plugin system
  try {
    const { checkPluginSystemHealth } = await import('./plugin-status-command.js');
    const pluginHealth = await checkPluginSystemHealth();
    printSuccess(`✅ Plugin System: ${pluginHealth.active}/${pluginHealth.total} plugins active`);
  } catch {
    printWarning('⚠️ Plugin System: STATUS UNKNOWN');
  }
  
  // Check strategic documents
  try {
    const { strategicDocs } = await import('../database/strategic-documents-manager.js');
    await strategicDocs.getAnalytics();
    printSuccess('✅ Strategic Documents: LanceDB operational');
  } catch {
    printWarning('⚠️ Strategic Documents: CONNECTION ISSUES');
  }
  
  console.log();
  printInfo('🎯 System Integration:');
  printInfo('  - start = API + Dashboard + Queen Council (integrated)');
  printInfo('  - server start = API only (individual component)');
  printInfo('  - dashboard start = UI only (individual component)');
  printInfo('  - init = Project setup with template selection');
}

async function showConsolidationPlan() {
  printInfo('🔧 Command Consolidation Analysis');
  console.log();
  
  printInfo('📋 REDUNDANT COMMANDS IDENTIFIED:');
  console.log('  ❌ claude-zen start === claude-zen server start');
  console.log('  ❌ claude-zen dashboard start (auto-included in start)');
  console.log('  ❌ Manual queen council convening (auto-convened)');
  console.log();
  
  printInfo('✅ CONSOLIDATED SYSTEM:');
  console.log('  🚀 claude-zen start = Full integrated system');
  console.log('     ├── API Server (port 3000)');
  console.log('     ├── Dashboard (integrated)');
  console.log('     └── Queen Council (auto-convened)');
  console.log();
  console.log('  🔧 claude-zen server start = API only (dev/debug)');
  console.log('  🎨 claude-zen dashboard start = UI only (dev/debug)');
  console.log('  👑 claude-zen queen-council convene = Manual council');
  console.log();
  
  printInfo('📂 TEMPLATE SYSTEM:');
  console.log('  🎯 claude-zen init = Project setup (template selection)');
  console.log('  📋 claude-zen template = Template management');
  console.log('     Available: claude-zen, ruv-FANN-zen');
  console.log();
  
  printInfo('🎯 RECOMMENDED USAGE:');
  console.log('  • Start development: claude-zen start');
  console.log('  • New project: claude-zen init --template claude-zen');
  console.log('  • Neural project: claude-zen init --template ruv-FANN-zen');
  console.log('  • System status: claude-zen system status');
}

function showConsolidationHelp() {
  console.log('Claude-Zen System Consolidation Command');
  console.log();
  console.log('Usage: claude-zen system <action> [options]');
  console.log();
  console.log('Actions:');
  console.log('  start        Start unified system (API + Dashboard + Queen Council)');
  console.log('  stop         Stop all system components');
  console.log('  restart      Restart entire system');
  console.log('  status       Show comprehensive system status');
  console.log('  consolidate  Show command consolidation analysis');
  console.log();
  console.log('Examples:');
  console.log('  claude-zen system start           # Start everything');
  console.log('  claude-zen system status          # Check all components');
  console.log('  claude-zen system consolidate     # See consolidation plan');
}

export const systemConsolidationCommandConfig = {
  name: 'system',
  description: 'Unified system control and consolidation',
  usage: 'system <action> [options]',
  options: [
    { name: 'help', description: 'Show help message', alias: 'h' }
  ]
};