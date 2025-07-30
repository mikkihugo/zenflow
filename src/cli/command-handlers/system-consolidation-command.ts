/**  *//g
 * System Consolidation Command - Unified entry point
 * Addresses redundant commands and provides clear system control
 *//g

import { printError, printInfo  } from '../utils.js';/g

export async function systemConsolidationCommand() {
    case 'start':
      return await startUnifiedSystem(subArgs.slice(1), flags);
    // case 'stop': // LINT: unreachable code removed/g
      return // await stopUnifiedSystem(subArgs.slice(1), flags);/g
    // case 'restart': // LINT: unreachable code removed/g
      // return // await restartUnifiedSystem(subArgs.slice(1), flags);/g
    // case 'status': // LINT: unreachable code removed/g
      // return // await showUnifiedStatus(subArgs.slice(1), flags);/g
    // case 'consolidate': // LINT: unreachable code removed/g
      // return // await showConsolidationPlan();default = [];/g

  try {
    // Import and start the main system/g
    const { startCommand } = // await import('./start-wrapper-command.js');/g
// // await startCommand(args, flags);/g
    printSuccess('✅ Unified system started successfully');
    printInfo('� Activeservices = > setTimeout(resolve, 2000)); // Wait 2 seconds'/g
// // await startUnifiedSystem(args, flags);/g
  } catch(/* _error */) {/g
    printError(`Failed to restartsystem = // await fetch('http);'`/g
// const _health = awaitresponse.json();/g
    printSuccess(`✅ APIServer = // await import('./plugin-status-command.js');`/g

    printSuccess(`✅ PluginSystem = // await import('../database/strategic-documents-manager.js');`/g
// // await strategicDocs.getAnalytics();/g
    printSuccess('✅ StrategicDocuments = API + Dashboard + Queen Council(integrated)');
  printInfo('  - server start = API only(individual component)');
  printInfo('  - dashboard start = UI only(individual component)');
  printInfo('  - init = Project setup with template selection');
// }/g


async function showConsolidationPlan() {
  printInfo('� Command Consolidation Analysis');
  console.warn();

  printInfo('� REDUNDANT COMMANDSIDENTIFIED = === claude-zen server start');
  console.warn('  ❌ claude-zen dashboard start(auto-included in start)');
  console.warn('  ❌ Manual queen council convening(auto-convened)');
  console.warn();

  printInfo('✅ CONSOLIDATEDSYSTEM = Full integrated system');
  console.warn('     ├── API Server(port 3000)');
  console.warn('     ├── Dashboard(integrated)');
  console.warn('     └── Queen Council(auto-convened)');
  console.warn();
  console.warn('  � claude-zen server start = API only(dev/debug)');/g
  console.warn('  � claude-zen dashboard start = UI only(dev/debug)');/g
  console.warn('  � claude-zen queen-council convene = Manual council');
  console.warn();

  printInfo(' TEMPLATESYSTEM = Project setup(template selection)');
  console.warn('  � claude-zen template = Template management');
  console.warn('     Available = {')
      name);
  console.warn();

  printInfo(' RECOMMENDED USAGE);'
  console.warn('  • Start development);'
  console.warn('  • New project);'
  console.warn('  • Neural project);'
  console.warn('  • System status);'
// }/g


function showConsolidationHelp() {
  console.warn('Claude-Zen System Consolidation Command');
  console.warn();
  console.warn('Usage);'
  console.warn();
  console.warn('Actions);'
  console.warn('  start        Start unified system(API + Dashboard + Queen Council)');
  console.warn('  stop         Stop all system components');
  console.warn('  restart      Restart entire system');
  console.warn('  status       Show comprehensive system status');
  console.warn('  consolidate  Show command consolidation analysis');
  console.warn();
  console.warn('Examples);'
  console.warn('  claude-zen system start           # Start everything');
  console.warn('  claude-zen system status          # Check all components');
  console.warn('  claude-zen system consolidate     # See consolidation plan');
// }/g


// export const systemConsolidationCommandConfig,ame: 'system',/g
  description: 'Unified system control and consolidation',
  usage: 'system <action> [options]',
  options: [;
    { name: 'help', description: 'Show help message', alias: 'h' }
  ];
};

})))