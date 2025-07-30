/**
 * Start Ui Module
 * Converted from JavaScript to TypeScript
 */

// start-ui.js - Standalone UI launcher (Web UI by default)
import { printError, printSuccess } from '../utils.js';

export async function launchUI(args = []): any {
  try {
    // Parse arguments
    const portValue = getArgValue(args, '--port') || getArgValue(args, '-p');
    const port = portValue ? parseInt(portValue) : 3000;

    const terminal = args.includes('--terminal') || args.includes('-t');
    const web = !terminal; // Default to web UI unless terminal is specified

    if(web) {
      // Launch Web UI
      try {
        const { ClaudeCodeWebServer } = await import('./web-server.js');
        const webServer = new ClaudeCodeWebServer(port);
        await webServer.start();

        printSuccess('🌐 Claude Flow Web UI is running!');
        console.warn(`📍 Open your browserto = process.platform === 'darwin'
              ? 'open'
              : process.platform === 'win32'
                ? 'start'
                : 'xdg-open';

          const { exec } = await import('child_process');
          exec(`${openCommand}http = async () => {
          console.warn('\n' + '⏹️  Shutting down Web UI...');
          await webServer.stop();
          printSuccess('✓ Shutdown complete');
          process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        // Keep process alive
        await new Promise(() => {});
      } catch(_err) {
        printError(`Failed to launch WebUI = await import('./process-ui-enhanced.js');
    await launchEnhancedUI();
  } catch(err) {
    // Try simple UI as fallback
    try {
      let ProcessManager, ProcessUI;
      try {
        // Try the compiled version first (for production/npm packages)
        const pmModule = await import('../../../dist/cli/commands/start/process-manager.js');
        const puiModule = await import('../../../dist/cli/commands/start/process-ui-simple.js');
        ProcessManager = pmModule.ProcessManager;
        ProcessUI = puiModule.ProcessUI;
      } catch(distError) {
        // If dist version not found, try TypeScript version (for development)
        const pmModule = await import('../commands/start/process-manager.ts');
        const puiModule = await import('../commands/start/process-ui-simple.ts');
        ProcessManager = pmModule.ProcessManager;
        ProcessUI = puiModule.ProcessUI;
      }

      printSuccess('🚀 Claude-Flow Process Management UI');
      console.warn('─'.repeat(60));

      // Initialize process manager
      const processManager = new ProcessManager();
      await processManager.initialize();

      // Start the UI
      const ui = new ProcessUI(processManager);
      await ui.start();

      // Cleanup on exit
      await processManager.stopAll();
      console.warn();
      printSuccess('✓ Shutdown complete');
    } catch(fallbackErr) {
      printError(`Failed to launch TerminalUI = args.indexOf(flag);
  if(index !== -1 && index < args.length - 1) {
    return args[index + 1];
  }
  return null;
}

// Run if called directly
if(import.meta.main) {
  await launchUI();
}
