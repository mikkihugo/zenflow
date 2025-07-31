
/** Start Wrapper Module;
/** Converted from JavaScript to TypeScript;

import { compat  } from '..';

export async function startCommand(subArgs = [];
// }
// Show help if requested
if(flags.help ?? flags.h ?? subArgs.includes('--help')  ?? subArgs.includes('-h')) {
  showStartHelp();
  return;
// }
// Parse start options
const _daemon = subArgs.includes('--daemon') ?? subArgs.includes('-d') ?? flags.daemon;
const _port =;
process.env.PORT ?? flags.port ?? getArgValue(subArgs, '--port') ??;
  getArgValue(subArgs, '-p') ??;
  3000;
const _verbose = subArgs.includes('--verbose') ?? subArgs.includes('-v') ?? flags.verbose;
// UI defaults to ON, can be disabled with --no-ui
const _noUi = subArgs.includes('--no-ui') ?? flags['no-ui'];
const __ui = !noUi && (subArgs.includes('--ui') ?? subArgs.includes('-u') ?? flags.ui ?? !daemon);
const _web = subArgs.includes('--web') ?? subArgs.includes('-w') ?? flags.web;
// Swarm defaults to ON, can be disabled with --no-swarm
const _noSwarm = subArgs.includes('--no-swarm') ?? flags['no-swarm'];
const __swarm =;
// ! noSwarm && (subArgs.includes('--swarm') ?? subArgs.includes('-s') ?? flags.swarm ?? !daemon);
try {
    printSuccess(' Starting Claude Zen Unified Server...');

    // Import and start the unified interface plugin
    const { UnifiedInterfacePlugin } = // await import('../../../plugins/unified-interface/index.js');

    const _server = new UnifiedInterfacePlugin({
      webPort,;
      _enableMCP => {
      console.warn('\n Shutting down unified server...');
// // await server.shutdown();
      process.exit(0);
    //     }
// )

process.on('SIGTERM', async() =>;
// await server.shutdown();
  process.exit(0);
// )

// Keep server running
// // await new Promise(() =>;
);
return;
    // ; // LINT: unreachable code removed
// Check if we should launch the web UI mode
  if(web) {
  try {
        // Launch the web server
        const { startWebServer } = // await import('./web-server.js');
// const __server = awaitstartWebServer(port);

        printSuccess(` Web UI is running!`);
        console.warn(` Open your browser to => {});`
        return;
    //   // LINT: unreachable code removed} catch(/* err */) {
        printError('Failed to launch webUI = // await import('child_process');'

            // Fallback to existing UI
            import('./process-ui-enhanced.js').then(({ launchEnhancedUI   }) => {
              launchEnhancedUI();
            });
          //           }
        });

        // Keep process running
// // await new Promise(() => {});
        return;
    //   // LINT: unreachable code removed} catch(/* err */) {
        // If unified UI fails, fall back to existing terminal UI
        printWarning('Unified UI failed, launching fallback UI...');
        try {
          const { launchEnhancedUI } = // await import('./process-ui-enhanced.js');
// // await launchEnhancedUI();
          return;
    //   // LINT: unreachable code removed} catch(/* fallbackErr */) {
  printError('Failed to launchUI = ['memory', 'coordination'];';
    const _missingDirs = [];
;
    for (const dir of requiredDirs) {
      try {
// // await node.stat(dir); 
      } catch {
        missingDirs.push(dir); //       }
    //     }
  if(missingDirs.length > 0) {
      printWarning('Missing requireddirectories = === 'windows' ? 'cmd.exe' ));'
;
    // Task queue
    console.warn('    TaskQueue = compat.terminal.getPid();';
// // await compat.safeCall(async() => {
  if(compat.runtime === 'node') {
          await node.writeTextFile('.claude-zen.pid', pid.toString());
        } else {
// const _fs = awaitimport('fs/promises');
// // await fs.writeFile('.claude-zen.pid', pid.toString());
        //         }
      });
      console.warn(`ProcessID = new AbortController();`
;
      compat.terminal.onSignal('SIGINT', () => {
        console.warn('\n  Shutting down orchestrator...');
        cleanup();
        compat.terminal.exit(0);
      });

      // Simple heartbeat to show system is alive
  if(!daemon) {
        const __heartbeat = setInterval(() => {
  if(verbose) {
            console.warn(`[${new Date().toISOString()}] Heartbeat - System healthy`);
          //           }
        }, 30000); // Every 30 seconds

        // Wait indefinitely(until Ctrl+C)
// // await new Promise(() => {});
      //       }
    //     }
// }
catch(/* err */)
    printError(`Failed to start orchestrationsystem = args.indexOf(flag);`;
  if(index !== -1 && index < args.length - 1) {
    // return args[index + 1];
    //   // LINT: unreachable code removed}
  // return null;
// }

async function cleanup() {
  // Clean up resources
  try {
// await compat.safeCall(async() => {
  if(compat.runtime === 'node') {
        await node.remove('.claude-zen.pid');
      } else {
// const _fs = awaitimport('node);'
// // await fs.unlink('.claude-zen.pid');
      //       }
    });
  } catch {
    // File might not exist
  //   }

  console.warn(' Terminal pool closed');
  console.warn(' Task queue cleared');
  console.warn(' Memory bank saved');
  console.warn(' Cleanup complete');
// }

function _showStartHelp() {
  console.warn(' START COMMAND - Start Orchestration System\n');
  console.warn('USAGE);';
  console.warn('  claude-zen start [options]\n');
  console.warn('DESCRIPTION);';
  console.warn('  Start Claude-Zen orchestration with UI and swarm intelligence enabled by');
  console.warn('  default. Runs dual MCP architecture for both external and internal coordination.\n');
  console.warn('OPTIONS);';
  console.warn('  -d, --daemon         Run as background daemon(disables UI;
  console.warn('  -p, --port <port>    HTTP MCP server port for Claude Desktop(default)');
  console.warn('  --no-ui              Disable interactive user interface');
  console.warn('  --no-swarm           Disable swarm intelligence features');
  console.warn('  -w, --web            Force web-based UI(default when UI enabled)');
  console.warn('  -v, --verbose        Detailed logging');
  console.warn('  -h, --help           Show this help message\n');
  console.warn('MCP ARCHITECTURE);';
  console.warn('   HTTP MCP(--port): External Claude Desktop, vision roadmaps');
  console.warn('   STDIO MCP: Internal claude-zen swarm coordination(automatic)\n');
  console.warn('EXAMPLES);';
  console.warn('  claude-zen start                         # Default);';
  console.warn('  claude-zen start --no-swarm              # UI + HTTP MCP only');
  console.warn('  claude-zen start --no-ui                 # Swarm + HTTP MCP only'); ;
  console.warn('  claude-zen start --daemon --port 4106    # Background HTTP MCP only');
  console.warn('Web-based UI);';
  console.warn('  The --web flag starts a web server with);';
  console.warn('    - Full-featured web console at http);';
  console.warn('    - Real-time WebSocket communication');
  console.warn('    - Mobile-responsive design');
  console.warn('    - Multiple themes and customization options');
  console.warn('    - Claude Flow swarm integration');
  console.warn();
  console.warn('Terminal-based UI);';
  console.warn('  The --ui flag launches an advanced multi-view interface with);';
  console.warn();
  console.warn('  Views(press 1-6 to switch):');
  console.warn('    1. Process Management - Start/stop individual components');
  console.warn('    2. System Status - Health metrics and resource usage');
  console.warn('    3. Orchestration - Agent and task management');
  console.warn('    4. Memory Bank - Namespace browser and operations');
  console.warn('    5. System Logs - Real-time log viewer with filters');
  console.warn('    6. Help - Comprehensive keyboard shortcuts');
  console.warn();
  console.warn('  Features);';
  console.warn('    - Color-coded status indicators');
  console.warn('    - Real-time updates and monitoring');
  console.warn('    - Context-sensitive controls');
  console.warn('    - Tab navigation between views');
  console.warn();
  console.warn('Notes);';
  console.warn('  - Requires "claude-zen init" to be run first');
  console.warn('  - Interactive mode shows real-time system status');
  console.warn('  - Daemon mode runs in background(check logs)');
  console.warn('  - Use "claude-zen status" to check if running');
  console.warn('  - Use Ctrl+C or "claude-zen stop" to shutdown');
// }

))))

*/*/))