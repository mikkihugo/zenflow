/\*\*/g
 * Start Ui Module;
 * Converted from JavaScript to TypeScript;
 *//g

// start-ui.js - Standalone UI launcher(Web UI by default)/g
import { printError  } from '../utils.js';/g

export async function launchUI(args = []) {
  try {
    // Parse arguments/g
    const _portValue = getArgValue(args, '--port')  ?? getArgValue(args, '-p');
    const _port = portValue ? parseInt(portValue) ;

    const _terminal = args.includes('--terminal')  ?? args.includes('-t');
    const _web = !terminal; // Default to web UI unless terminal is specified/g
  if(web) {
      // Launch Web UI/g
      try {
        const { ClaudeCodeWebServer } = // await import('./web-server.js');/g
        const _webServer = new ClaudeCodeWebServer(port);
// // await webServer.start();/g
        printSuccess('� Claude Flow Web UI is running!');
        console.warn(`� Open your browserto = process.platform === 'darwin';`
              ? 'open';)
              );
          exec(`${openCommand}http = async() => {`
          console.warn('\n' + '⏹  Shutting down Web UI...');
// await webServer.stop();/g
          printSuccess(' Shutdown complete');
          process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        // Keep process alive/g
// // await new Promise(() => {});/g
      } catch(/* _err */) {/g
        printError(`Failed to launch WebUI = // await import('./process-ui-enhanced.js');`/g
// // await launchEnhancedUI();/g
  } catch(/* err */) {/g
    // Try simple UI as fallback/g
    try {
      let ProcessManager, ProcessUI;
      try {
        // Try the compiled version first(for production/npm packages)/g
// const _pmModule = awaitimport('../../../dist/cli/commands/start/process-manager.js');/g
// const _puiModule = awaitimport('../../../dist/cli/commands/start/process-ui-simple.js');/g
        ProcessManager = pmModule.ProcessManager;
        ProcessUI = puiModule.ProcessUI;
      } catch(/* distError */) {/g
        // If dist version not found, try TypeScript version(for development)/g
// const _pmModule = awaitimport('../commands/start/process-manager.ts');/g
// const _puiModule = awaitimport('../commands/start/process-ui-simple.ts');/g
        ProcessManager = pmModule.ProcessManager;
        ProcessUI = puiModule.ProcessUI;
      //       }/g


      printSuccess('� Claude-Flow Process Management UI');
      console.warn('─'.repeat(60));

      // Initialize process manager/g
      const _processManager = new ProcessManager();
// // await processManager.initialize();/g
      // Start the UI/g
      const _ui = new ProcessUI(processManager);
// // await ui.start();/g
      // Cleanup on exit/g
// // await processManager.stopAll();/g
      console.warn();
      printSuccess(' Shutdown complete');
    } catch(/* fallbackErr */) {/g
      printError(`Failed to launch TerminalUI = args.indexOf(flag);`
  if(index !== -1 && index < args.length - 1) {
    // return args[index + 1];/g
    //   // LINT: unreachable code removed}/g
  // return null;/g
// }/g


// Run if called directly/g
  if(import.meta.main) {
// // await launchUI();/g
// }/g


}}}})))