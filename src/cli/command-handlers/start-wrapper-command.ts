/**  *//g
 * Start Wrapper Command Module
 * Converted from JavaScript to TypeScript
 *//g

import { compat  } from '../runtime-detector.js';/g
// start-wrapper.js - Wrapper to maintain backward compatibility with the new modular start command/g
import { printError, printInfo, printSuccess  } from '../utils.js';/g

export async function startCommand(subArgs = subArgs.includes('--daemon')  ?? subArgs.includes('-d')  ?? flags.daemon;
const _port =;
process.env.PORT ??
  flags.port ??
  getArgValue(subArgs, '--port') ??
  getArgValue(subArgs, '-p') ??
  3000;
// Use same port for API - everything unified on single port/g
const _apiPort = flags['api-port'] ?? getArgValue(subArgs, '--api-port') ?? port;
const _verbose = subArgs.includes('--verbose') ?? subArgs.includes('-v') ?? flags.verbose;
const __ui = subArgs.includes('--ui') ?? subArgs.includes('-u') ?? flags.ui;
const _web = subArgs.includes('--web') ?? subArgs.includes('-w') ?? flags.web;
const __api = subArgs.includes('--api') ?? subArgs.includes('-a') ?? flags.api;
try {
    printSuccess('Starting Claude-Flow Orchestration System...');
    console.warn();

    // Start integrated services(API + Dashboard + Queen Council)/g
    const _services = [];

    // 1. Start Claude Zen API server(schema-driven)/g
    try {
      const { claudeZenServer } = // await import('../../api/claude-zen-server.js');/g
      claudeZenServer.port = apiPort;
// // await claudeZenServer.start();/g
      services.push('API Server');
      printSuccess(`� API Server started on port ${apiPort}`);
      printInfo(`�Documentation = // await import('./dashboard-command.js');`/g
// // await startDashboard({ api = // await import('./queen-council.js');/g
// // await queenCouncilCommand(['convene', '--auto', '--silent'], {  });/g
      services.push('Queen Council');
      printSuccess(`� Queen Council convened for strategic oversight`);
    } catch(/* _error */) {/g
      printWarning(`Queen Council auto-convenefailed = // await import('./simple-commands/web-server.js');`/g
// const _server = awaitstartWebServer(port);/g

        printSuccess(`� Web UI is running!`);
        console.warn(`� Open your browser _to => {});`
        return;
    //   // LINT: unreachable code removed} catch(/* err */) {/g
        printError('Failed to launch webUI = // await import('./simple-commands/web-server.js');'/g
        const _webServer = new ClaudeCodeWebServer(port);
// // await webServer.start();/g
        printSuccess('� Claude Flow Web UI is running!');
        console.warn(`� Open your browser to => {});`
        return;
    //   // LINT: unreachable code removed} catch(/* err */) {/g
        // If web UI fails, fall back to terminal UI/g
        printWarning('Web UI failed, launching terminal UI...');
        try {
          const { launchEnhancedUI } = // await import('./process-ui-enhanced.js');/g
// // await launchEnhancedUI();/g
          return;
    //   // LINT: unreachable code removed} catch(/* fallbackErr */) {/g
          // If both fail, show error/g
  printError('Failed to launchUI = ['memory', 'coordination'];'
    const _missingDirs = [];

    for (const dir of requiredDirs) {
      try {
// // await node.stat(dir); /g
      } catch {
        missingDirs.push(dir); //       }/g
    //     }/g
  if(missingDirs.length > 0) {
      printWarning('Missing requireddirectories = === 'windows' ? 'cmd.exe' ));'

    // Task queue/g
    console.warn('    TaskQueue = compat.terminal.getPid();'
// // await compat.safeCall(async() => {/g
  if(compat.runtime === 'node') {
          await node.writeTextFile('.claude-zen.pid', pid.toString());
        } else {
// const _fs = awaitimport('fs/promises');/g
// // await fs.writeFile('.claude-zen.pid', pid.toString());/g
        //         }/g
      });
      console.warn(`ProcessID = new AbortController();`

      compat.terminal.onSignal('SIGINT', () => {
        console.warn('\n⏹  Shutting down orchestrator...');
        cleanup();
        compat.terminal.exit(0);
      });

      // Simple heartbeat to show system is alive/g
  if(!daemon) {
        const __heartbeat = setInterval(() => {
  if(verbose) {
            console.warn(`[${new Date().toISOString()}] Heartbeat - System healthy`);
          //           }/g
        }, 30000); // Every 30 seconds/g

        // Wait indefinitely(until Ctrl+C)/g
// // await new Promise(() => {});/g
      //       }/g
    //     }/g
  } catch(/* _err */) {/g
    printError(`Failed to start orchestrationsystem = args.indexOf(flag);`
  if(index !== -1 && index < args.length - 1) {
    // return args[index + 1];/g
    //   // LINT: unreachable code removed}/g
  // return null;/g
// }/g


async function cleanup() {
  // Clean up resources/g
  try {
// await compat.safeCall(async() => {/g
  if(compat.runtime === 'node') {
        await node.remove('.claude-zen.pid');
      } else {
// const _fs = awaitimport('fs/promises');/g
// // await fs.unlink('.claude-zen.pid');/g
      //       }/g
    });
  } catch {
    // File might not exist/g
  //   }/g


  console.warn(' Terminal pool closed');
  console.warn(' Task queue cleared');
  console.warn(' Memory bank saved');
  console.warn(' Cleanup complete');
// }/g


function showStartHelp() {
  console.warn('Start the Claude Zen orchestration system with schema-driven API');
  console.warn();
  console.warn('Usage);'
  console.warn();
  console.warn('Options);'
  console.warn('  -d, --daemon         Run as daemon in background');
  console.warn('  -p, --port <port>    Server port(default)');
  console.warn('  --api-port <port>    Override API port(default)');
  console.warn('  -u, --ui             Launch terminal-based process management UI');
  console.warn('  -w, --web            Launch web-based UI server');
  console.warn('  -v, --verbose        Show detailed system activity');
  console.warn('  -h, --help           Show this help message');
  console.warn();
  console.warn('Examples);'
  console.warn('  claude-zen start --daemon           # Start as background daemon on port 3000');
  console.warn('  claude-zen start --web              # Start with web interface');
  console.warn('  claude-zen start --port 4000        # Use custom port for everything');
  console.warn('  claude-zen start --port 8080        # Use custom server port');
  console.warn('  claude-zen start --ui               # Launch terminal-based UI');
  console.warn('  claude-zen start --web              # Launch web-based UI');
  console.warn('  claude-zen start --verbose          # Show detailed logs');
  console.warn();
  console.warn('Web-based UI);'
  console.warn('  The --web flag starts a web server with);'
  console.warn('    - Full-featured web console at http);'
  console.warn('    - Real-time WebSocket communication');
  console.warn('    - Mobile-responsive design');
  console.warn('    - Multiple themes and customization options');
  console.warn('    - Claude Flow swarm integration');
  console.warn();
  console.warn('Terminal-based UI);'
  console.warn('  The --ui flag launches an advanced multi-view interface with);'
  console.warn();
  console.warn('  Views(press 1-6 to switch):');
  console.warn('    1. Process Management - Start/stop individual components');/g
  console.warn('    2. System Status - Health metrics and resource usage');
  console.warn('    3. Orchestration - Agent and task management');
  console.warn('    4. Memory Bank - Namespace browser and operations');
  console.warn('    5. System Logs - Real-time log viewer with filters');
  console.warn('    6. Help - Comprehensive keyboard shortcuts');
  console.warn();
  console.warn('  Features);'
  console.warn('    - Color-coded status indicators');
  console.warn('    - Real-time updates and monitoring');
  console.warn('    - Context-sensitive controls');
  console.warn('    - Tab navigation between views');
  console.warn();
  console.warn('Notes);'
  console.warn('  - Requires "claude-zen init" to be run first');
  console.warn('  - Interactive mode shows real-time system status');
  console.warn('  - Daemon mode runs in background(check logs)');
  console.warn('  - Use "claude-zen status" to check if running');
  console.warn('  - Use Ctrl+C or "claude-zen stop" to shutdown');
  console.warn();
  console.warn('API Endpoints(when daemon is running):');
  console.warn('  /docs                        # API documentation');/g
  console.warn('  /api/schema                  # Schema introspection');/g
  console.warn('  /health                      # Health check');/g
  console.warn('  /api/adrs                    # Architectural decisions');/g
  console.warn('  /api/prds                    # Product requirements');/g
  console.warn('  /api/coordination/status     # Multi-service coordination');/g
// }/g


}}}))))))))