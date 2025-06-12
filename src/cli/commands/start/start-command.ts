/**
 * Unified start command implementation
 */

import { Command } from '@cliffy/command';
import { colors } from '@cliffy/ansi/colors';
import { ProcessManager } from './process-manager.ts';
import { ProcessUI } from './process-ui.ts';
import { SystemMonitor } from './system-monitor.ts';
import { StartOptions } from './types.ts';
import { eventBus } from '../../../core/event-bus.ts';
import { logger } from '../../../core/logger.ts';

export const startCommand = new Command()
  .description('Start the Claude-Flow orchestration system')
  .option('-d, --daemon', 'Run as daemon in background')
  .option('-p, --port <port:number>', 'MCP server port', { default: 3000 })
  .option('--mcp-transport <transport:string>', 'MCP transport type (stdio, http)', {
    default: 'stdio',
  })
  .option('-u, --ui', 'Launch interactive process management UI')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--auto-start', 'Automatically start all processes')
  .option('--config <path:string>', 'Configuration file path')
  .action(async (options: StartOptions) => {
    console.log(colors.cyan('🧠 Claude-Flow Orchestration System'));
    console.log(colors.gray('─'.repeat(60)));

    try {
      // Initialize process manager
      const processManager = new ProcessManager();
      await processManager.initialize(options.config);

      // Initialize system monitor
      const systemMonitor = new SystemMonitor(processManager);
      systemMonitor.start();

      // Override MCP settings from CLI options
      if (options.port) {
        const mcpProcess = processManager.getProcess('mcp-server');
        if (mcpProcess) {
          mcpProcess.config = { ...mcpProcess.config, port: options.port };
        }
      }

      // Setup event listeners for logging
      if (options.verbose) {
        setupVerboseLogging(systemMonitor);
      }

      // Launch UI mode
      if (options.ui) {
        const ui = new ProcessUI(processManager);
        await ui.start();
        
        // Cleanup on exit
        systemMonitor.stop();
        await processManager.stopAll();
        console.log(colors.green.bold('✓'), 'Shutdown complete');
        Deno.exit(0);
      } 
      // Daemon mode
      else if (options.daemon) {
        console.log(colors.yellow('Starting in daemon mode...'));
        
        // Auto-start all processes
        if (options.autoStart) {
          await processManager.startAll();
        } else {
          // Start only core processes
          await processManager.startProcess('event-bus');
          await processManager.startProcess('memory-manager');
          await processManager.startProcess('mcp-server');
        }

        // Create PID file
        const pid = Deno.pid;
        await Deno.writeTextFile('.claude-flow.pid', pid.toString());
        console.log(colors.gray(`Process ID: ${pid}`));
        
        console.log(colors.green.bold('✓'), 'Daemon started successfully');
        console.log(colors.gray('Use "claude-flow status" to check system status'));
        
        // Keep process running
        await new Promise<void>(() => {});
      } 
      // Interactive mode (default)
      else {
        console.log(colors.cyan('Starting in interactive mode...'));
        console.log();

        // Show available options
        console.log(colors.white.bold('Quick Actions:'));
        console.log('  [1] Start all processes');
        console.log('  [2] Start core processes only');
        console.log('  [3] Launch process management UI');
        console.log('  [4] Show system status');
        console.log('  [q] Quit');
        console.log();
        console.log(colors.gray('Press a key to select an option...'));

        // Handle user input
        const decoder = new TextDecoder();
        while (true) {
          const buf = new Uint8Array(1);
          await Deno.stdin.read(buf);
          const key = decoder.decode(buf);

          switch (key) {
            case '1':
              console.log(colors.cyan('\nStarting all processes...'));
              await processManager.startAll();
              console.log(colors.green.bold('✓'), 'All processes started');
              break;

            case '2':
              console.log(colors.cyan('\nStarting core processes...'));
              await processManager.startProcess('event-bus');
              await processManager.startProcess('memory-manager');
              await processManager.startProcess('mcp-server');
              console.log(colors.green.bold('✓'), 'Core processes started');
              break;

            case '3':
              const ui = new ProcessUI(processManager);
              await ui.start();
              break;

            case '4':
              console.clear();
              systemMonitor.printSystemHealth();
              console.log();
              systemMonitor.printEventLog(10);
              console.log();
              console.log(colors.gray('Press any key to continue...'));
              await Deno.stdin.read(new Uint8Array(1));
              break;

            case 'q':
            case 'Q':
              console.log(colors.yellow('\nShutting down...'));
              await processManager.stopAll();
              systemMonitor.stop();
              console.log(colors.green.bold('✓'), 'Shutdown complete');
              Deno.exit(0);
              break;
          }

          // Redraw menu
          console.clear();
          console.log(colors.cyan('🧠 Claude-Flow Interactive Mode'));
          console.log(colors.gray('─'.repeat(60)));
          
          // Show current status
          const stats = processManager.getSystemStats();
          console.log(colors.white('System Status:'), 
            colors.green(`${stats.runningProcesses}/${stats.totalProcesses} processes running`));
          console.log();
          
          console.log(colors.white.bold('Quick Actions:'));
          console.log('  [1] Start all processes');
          console.log('  [2] Start core processes only');
          console.log('  [3] Launch process management UI');
          console.log('  [4] Show system status');
          console.log('  [q] Quit');
          console.log();
          console.log(colors.gray('Press a key to select an option...'));
        }
      }
    } catch (error) {
      console.error(colors.red.bold('Failed to start:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      Deno.exit(1);
    }
  });

function setupVerboseLogging(monitor: SystemMonitor): void {
  // Log all events in verbose mode
  eventBus.on('*', (eventName: string, data: any) => {
    console.log(colors.gray(`[${new Date().toISOString()}]`), 
      colors.blue(eventName), 
      JSON.stringify(data));
  });

  // Periodically print system health
  setInterval(() => {
    console.log();
    monitor.printSystemHealth();
  }, 30000);
}