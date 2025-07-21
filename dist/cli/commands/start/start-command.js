import { promises as fs } from 'node:fs';
/**
 * Unified start command implementation with robust service management
 */

import { Command } from '@cliffy/command';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ProcessManager } from './process-manager.js';
import { ProcessUI } from './process-ui.js';
import { SystemMonitor } from './system-monitor.js';
import { eventBus } from '../../../core/event-bus.js';
import { logger } from '../../../core/logger.js';
import { formatDuration } from '../../formatter.js';

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
  .option('--force', 'Force start even if already running')
  .option('--health-check', 'Perform health checks before starting')
  .option('--timeout <seconds:number>', 'Startup timeout in seconds', { default: 60 })
  .action(async (options) => {
    console.log(chalk.cyan('🧠 Claude-Flow Orchestration System'));
    console.log(chalk.gray('─'.repeat(60)));

    try {
      // Check if already running
      if (!options.force && (await isSystemRunning())) {
        console.log(chalk.yellow('⚠ Claude-Flow is already running'));
        const { shouldContinue } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldContinue',
            message: 'Stop existing instance and restart?',
            default: false,
          },
        ]);

        if (!shouldContinue) {
          console.log(chalk.gray('Use --force to override or "claude-flow stop" first'));
          return;
        }

        await stopExistingInstance();
      }

      // Perform pre-flight checks
      if (options.healthCheck) {
        console.log(chalk.blue('Running pre-flight health checks...'));
        await performHealthChecks();
      }

      // Initialize process manager with timeout
      const processManager = new ProcessManager();
      console.log(chalk.blue('Initializing system components...'));
      const initPromise = processManager.initialize(options.config);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Initialization timeout')),
          (options.timeout || 30) * 1000,
        ),
      );

      await Promise.race([initPromise, timeoutPromise]);

      // Initialize system monitor with enhanced monitoring
      const systemMonitor = new SystemMonitor(processManager);
      systemMonitor.start();

      // Setup system event handlers
      setupSystemEventHandlers(processManager, systemMonitor, options);

      // Override MCP settings from CLI options
      if (options.port) {
        const mcpProcess = processManager.getProcess('mcp-server');
        if (mcpProcess) {
          mcpProcess.config = { ...mcpProcess.config, port: options.port };
        }
      }

      // Configure transport settings
      if (options.mcpTransport) {
        const mcpProcess = processManager.getProcess('mcp-server');
        if (mcpProcess) {
          mcpProcess.config = { ...mcpProcess.config, transport: options.mcpTransport };
        }
      }

      // Setup event listeners for logging
      if (options.verbose) {
        setupVerboseLogging(systemMonitor);
      }

      // Launch UI mode
      if (options.ui) {
        // Check if web server is available
        try {
          const { ClaudeCodeWebServer } = await import('../../simple-commands/web-server.js');

          // Start the web server
          console.log(chalk.blue('Starting Web UI server...'));
          const webServer = new ClaudeCodeWebServer(options.port);
          await webServer.start();

          // Open browser if possible
          const openCommand =
            process.platform === 'darwin'
              ? 'open'
              : process.platform === 'win32'
                ? 'start'
                : 'xdg-open';

          try {
            const { exec } = await import('child_process');
            exec(`${openCommand} http://localhost:${options.port}/console`);
          } catch {
            // Browser opening failed, that's okay
          }

          // Keep process running
          console.log(
            chalk.green('✨ Web UI is running at:'),
            chalk.cyan(`http://localhost:${options.port}/console`),
          );
          console.log(chalk.gray('Press Ctrl+C to stop'));

          // Handle shutdown
          const shutdownWebUI = async () => {
            console.log('\n' + chalk.yellow('Shutting down Web UI...'));
            await webServer.stop();
            systemMonitor.stop();
            await processManager.stopAll();
            console.log(chalk.green('✓ Shutdown complete'));
            process.exit(0);
          };
<<<<<<< HEAD:src/cli/commands/start/start-command.js
          
          // Handle signals
          process.on('SIGINT', shutdownWebUI);
          process.on('SIGTERM', shutdownWebUI);
          
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
          
          Deno.addSignalListener('SIGINT', shutdownWebUI);
          Deno.addSignalListener('SIGTERM', shutdownWebUI);
          
=======

          Deno.addSignalListener('SIGINT', shutdownWebUI);
          Deno.addSignalListener('SIGTERM', shutdownWebUI);

>>>>>>> origin/main:src/cli/commands/start/start-command.ts
          // Keep process alive
          await new Promise(() => {});
        } catch (webError) {
          // Fall back to TUI if web server is not available
          console.log(chalk.yellow('Web UI not available, falling back to Terminal UI'));
          const ui = new ProcessUI(processManager);
          await ui.start();

          // Cleanup on exit
          systemMonitor.stop();
          await processManager.stopAll();
          console.log(chalk.green.bold('✓'), 'Shutdown complete');
          process.exit(0);
        }
      }
      // Daemon mode
      else if (options.daemon) {
        console.log(chalk.yellow('Starting in daemon mode...'));

        // Auto-start all processes
        if (options.autoStart) {
          console.log(chalk.blue('Starting all system processes...'));
          await startWithProgress(processManager, 'all');
        } else {
          // Start only core processes
          console.log(chalk.blue('Starting core processes...'));
          await startWithProgress(processManager, 'core');
        }

        // Create PID file with metadata
        const pid = process.pid;
        const pidData = {
          pid,
          startTime: Date.now(),
          config: options.config || 'default',
          processes: processManager.getAllProcesses().map((p) => ({ id: p.id, status: p.status })),
        };
        await fs.writeFile('.claude-flow.pid', JSON.stringify(pidData, null, 2));
        console.log(chalk.gray(`Process ID: ${pid}`));

        // Wait for services to be fully ready
        await waitForSystemReady(processManager);

        console.log(chalk.green.bold('✓'), 'Daemon started successfully');
        console.log(chalk.gray('Use "claude-flow status" to check system status'));
        console.log(chalk.gray('Use "claude-flow monitor" for real-time monitoring'));

        // Keep process running
<<<<<<< HEAD:src/cli/commands/start/start-command.js
        await new Promise(() => {});
      } 
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
        await new Promise<void>(() => {});
      } 
=======
        await new Promise<void>(() => {});
      }
>>>>>>> origin/main:src/cli/commands/start/start-command.ts
      // Interactive mode (default)
      else {
        console.log(chalk.cyan('Starting in interactive mode...'));
        console.log();

        // Show available options
        console.log(chalk.white.bold('Quick Actions:'));
        console.log('  [1] Start all processes');
        console.log('  [2] Start core processes only');
        console.log('  [3] Launch process management UI');
        console.log('  [4] Show system status');
        console.log('  [q] Quit');
        console.log();
        console.log(chalk.gray('Press a key to select an option...'));

        // Handle user input
        const decoder = new TextDecoder();
        while (true) {
          const buf = new Uint8Array(1);
          
          // Handle input reading differently for different environments
          let key;
          if (typeof node !== 'undefined' && node.stdin) {
            await node.stdin.read(buf);
            key = decoder.decode(buf);
          } else {
            // Node.js fallback
            key = await new Promise(resolve => {
              process.stdin.once('data', data => resolve(data.toString()));
            });
          }

          switch (key.trim()) {
            case '1':
              console.log(chalk.cyan('\nStarting all processes...'));
              await startWithProgress(processManager, 'all');
              console.log(chalk.green.bold('✓'), 'All processes started');
              break;

            case '2':
              console.log(chalk.cyan('\nStarting core processes...'));
              await startWithProgress(processManager, 'core');
              console.log(chalk.green.bold('✓'), 'Core processes started');
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
              console.log(chalk.gray('Press any key to continue...'));
              
              if (typeof node !== 'undefined' && node.stdin) {
                await node.stdin.read(new Uint8Array(1));
              } else {
                await new Promise(resolve => {
                  process.stdin.once('data', resolve);
                });
              }
              break;

            case 'q':
            case 'Q':
              console.log(chalk.yellow('\nShutting down...'));
              await processManager.stopAll();
              systemMonitor.stop();
              console.log(chalk.green.bold('✓'), 'Shutdown complete');
              process.exit(0);
              break;
          }

          // Redraw menu
          console.clear();
          console.log(chalk.cyan('🧠 Claude-Flow Interactive Mode'));
          console.log(chalk.gray('─'.repeat(60)));

          // Show current status
          const stats = processManager.getSystemStats();
          console.log(
            chalk.white('System Status:'),
            chalk.green(`${stats.runningProcesses}/${stats.totalProcesses} processes running`),
          );
          console.log();

          console.log(chalk.white.bold('Quick Actions:'));
          console.log('  [1] Start all processes');
          console.log('  [2] Start core processes only');
          console.log('  [3] Launch process management UI');
          console.log('  [4] Show system status');
          console.log('  [q] Quit');
          console.log();
          console.log(chalk.gray('Press a key to select an option...'));
        }
      }
    } catch (error) {
      console.error(chalk.red.bold('Failed to start:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }

      // Cleanup on failure
      console.log(chalk.yellow('Performing cleanup...'));
      try {
        await cleanupOnFailure();
      } catch (cleanupError) {
        console.error(chalk.red('Cleanup failed:'), cleanupError.message);
      }

      process.exit(1);
    }
  });

// Enhanced helper functions

async function isSystemRunning() {
  try {
    const pidData = await fs.readFile('.claude-flow.pid', 'utf-8');
    const data = JSON.parse(pidData);

    // Check if process is still running
    try {
      process.kill(data.pid, 0); // Signal 0 tests existence
      return true; // Process exists
    } catch {
      return false; // Process not found
    }
  } catch {
    return false; // No PID file
  }
}

async function stopExistingInstance() {
  try {
    const pidData = await fs.readFile('.claude-flow.pid', 'utf-8');
    const data = JSON.parse(pidData);

    console.log(chalk.yellow('Stopping existing instance...'));
<<<<<<< HEAD:src/cli/commands/start/start-command.js
    process.kill(data.pid, 'SIGTERM');
    
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
    Deno.kill(data.pid, 'SIGTERM');
    
=======
    Deno.kill(data.pid, 'SIGTERM');

>>>>>>> origin/main:src/cli/commands/start/start-command.ts
    // Wait for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Force kill if still running
    try {
      process.kill(data.pid, 'SIGKILL');
    } catch {
      // Process already stopped
    }
<<<<<<< HEAD:src/cli/commands/start/start-command.js
    
    await fs.unlink('.claude-flow.pid').catch(() => {});
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
    
    await Deno.remove('.claude-flow.pid').catch(() => {});
=======

    await Deno.remove('.claude-flow.pid').catch(() => {});
>>>>>>> origin/main:src/cli/commands/start/start-command.ts
    console.log(chalk.green('✓ Existing instance stopped'));
  } catch (error) {
<<<<<<< HEAD:src/cli/commands/start/start-command.js
    console.warn(chalk.yellow('Warning: Could not stop existing instance'), error.message);
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
    console.warn(chalk.yellow('Warning: Could not stop existing instance'), (error as Error).message);
=======
    console.warn(
      chalk.yellow('Warning: Could not stop existing instance'),
      (error as Error).message,
    );
>>>>>>> origin/main:src/cli/commands/start/start-command.ts
  }
}

async function performHealthChecks() {
  const checks = [
    { name: 'Disk Space', check: checkDiskSpace },
    { name: 'Memory Available', check: checkMemoryAvailable },
    { name: 'Network Connectivity', check: checkNetworkConnectivity },
    { name: 'Required Dependencies', check: checkDependencies },
  ];

  for (const { name, check } of checks) {
    try {
      console.log(chalk.gray(`  Checking ${name}...`));
      await check();
      console.log(chalk.green(`  ✓ ${name} OK`));
    } catch (error) {
      console.log(chalk.red(`  ✗ ${name} Failed: ${error.message}`));
      throw error;
    }
  }
}

async function checkDiskSpace() {
  // Basic disk space check - would need platform-specific implementation
  const stats = await fs.stat('.');
  if (!stats.isDirectory) {
    throw new Error('Current directory is not accessible');
  }
}

async function checkMemoryAvailable() {
  // Memory check - would integrate with system memory monitoring
<<<<<<< HEAD:src/cli/commands/start/start-command.js
  if (typeof node !== 'undefined') {
    const memoryInfo = node.memoryUsage();
    if (memoryInfo.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
      throw new Error('High memory usage detected');
    }
  } else {
    const memoryInfo = process.memoryUsage();
    if (memoryInfo.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
      throw new Error('High memory usage detected');
    }
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
  const memoryInfo = Deno.memoryUsage();
  if (memoryInfo.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
    throw new Error('High memory usage detected');
=======
  const memoryInfo = Deno.memoryUsage();
  if (memoryInfo.heapUsed > 500 * 1024 * 1024) {
    // 500MB threshold
    throw new Error('High memory usage detected');
>>>>>>> origin/main:src/cli/commands/start/start-command.ts
  }
}

async function checkNetworkConnectivity() {
  // Basic network check
  try {
    const response = await fetch('https://httpbin.org/status/200', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Network check failed: ${response.status}`);
    }
  } catch {
    console.log(chalk.yellow('  ⚠ Network connectivity check skipped (offline mode?)'));
  }
}

async function checkDependencies() {
  // Check for required directories and files
  const requiredDirs = ['.claude-flow', 'memory', 'logs'];
  for (const dir of requiredDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new Error(`Cannot create required directory: ${dir}`);
    }
  }
}

<<<<<<< HEAD:src/cli/commands/start/start-command.js
function setupSystemEventHandlers(processManager, systemMonitor, options) {
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
function setupSystemEventHandlers(
  processManager: ProcessManager, 
  systemMonitor: SystemMonitor, 
  options: StartOptions
): void {
=======
function setupSystemEventHandlers(
  processManager: ProcessManager,
  systemMonitor: SystemMonitor,
  options: StartOptions,
): void {
>>>>>>> origin/main:src/cli/commands/start/start-command.ts
  // Handle graceful shutdown signals
  const shutdownHandler = async () => {
    console.log('\n' + chalk.yellow('Received shutdown signal, shutting down gracefully...'));
    systemMonitor.stop();
    await processManager.stopAll();
    await cleanupOnShutdown();
    console.log(chalk.green('✓ Shutdown complete'));
    process.exit(0);
  };
<<<<<<< HEAD:src/cli/commands/start/start-command.js
  
  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
  
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
  
  Deno.addSignalListener('SIGINT', shutdownHandler);
  Deno.addSignalListener('SIGTERM', shutdownHandler);
  
=======

  Deno.addSignalListener('SIGINT', shutdownHandler);
  Deno.addSignalListener('SIGTERM', shutdownHandler);

>>>>>>> origin/main:src/cli/commands/start/start-command.ts
  // Setup verbose logging if requested
  if (options.verbose) {
    setupVerboseLogging(systemMonitor);
  }

  // Monitor for critical errors
  processManager.on('processError', (event) => {
    console.error(chalk.red(`Process error in ${event.processId}:`), event.error);
    if (event.processId === 'orchestrator') {
      console.error(chalk.red.bold('Critical process failed, initiating recovery...'));
      // Could implement auto-recovery logic here
    }
  });
}

<<<<<<< HEAD:src/cli/commands/start/start-command.js
async function startWithProgress(processManager, mode) {
  const processes = mode === 'all' 
    ? ['event-bus', 'memory-manager', 'terminal-pool', 'coordinator', 'mcp-server', 'orchestrator']
    : ['event-bus', 'memory-manager', 'mcp-server'];
  
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
async function startWithProgress(processManager: ProcessManager, mode: 'all' | 'core'): Promise<void> {
  const processes = mode === 'all' 
    ? ['event-bus', 'memory-manager', 'terminal-pool', 'coordinator', 'mcp-server', 'orchestrator']
    : ['event-bus', 'memory-manager', 'mcp-server'];
  
=======
async function startWithProgress(
  processManager: ProcessManager,
  mode: 'all' | 'core',
): Promise<void> {
  const processes =
    mode === 'all'
      ? [
          'event-bus',
          'memory-manager',
          'terminal-pool',
          'coordinator',
          'mcp-server',
          'orchestrator',
        ]
      : ['event-bus', 'memory-manager', 'mcp-server'];

>>>>>>> origin/main:src/cli/commands/start/start-command.ts
  for (let i = 0; i < processes.length; i++) {
    const processId = processes[i];
    const progress = `[${i + 1}/${processes.length}]`;

    console.log(chalk.gray(`${progress} Starting ${processId}...`));
    try {
      await processManager.startProcess(processId);
      console.log(chalk.green(`${progress} ✓ ${processId} started`));
    } catch (error) {
      console.log(chalk.red(`${progress} ✗ ${processId} failed: ${error.message}`));
      if (processId === 'orchestrator' || processId === 'mcp-server') {
        throw error; // Critical processes
      }
    }

    // Brief delay between starts
    if (i < processes.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function waitForSystemReady(processManager) {
  console.log(chalk.blue('Waiting for system to be ready...'));

  const maxWait = 30000; // 30 seconds
  const checkInterval = 1000; // 1 second
  let waited = 0;

  while (waited < maxWait) {
    const stats = processManager.getSystemStats();
    if (stats.errorProcesses === 0 && stats.runningProcesses >= 3) {
      console.log(chalk.green('✓ System ready'));
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval));
    waited += checkInterval;
  }

  console.log(
    chalk.yellow('⚠ System startup completed but some processes may not be fully ready'),
  );
}

async function cleanupOnFailure() {
  try {
    await fs.unlink('.claude-flow.pid').catch(() => {});
    console.log(chalk.gray('Cleaned up PID file'));
  } catch {
    // Ignore cleanup errors
  }
}

async function cleanupOnShutdown() {
  try {
    await fs.unlink('.claude-flow.pid').catch(() => {});
    console.log(chalk.gray('Cleaned up PID file'));
  } catch {
    // Ignore cleanup errors
  }
}

function setupVerboseLogging(monitor) {
  // Enhanced verbose logging
  console.log(chalk.gray('Verbose logging enabled'));

  // Periodically print system health
  setInterval(() => {
    console.log();
    console.log(chalk.cyan('--- System Health Report ---'));
    monitor.printSystemHealth();
    console.log(chalk.cyan('--- End Report ---'));
  }, 30000);

  // Log critical events
  eventBus.on('process:started', (data) => {
    console.log(chalk.green(`[VERBOSE] Process started: ${data.processId}`));
  });
<<<<<<< HEAD:src/cli/commands/start/start-command.js
  
  eventBus.on('process:stopped', (data) => {
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
  
  eventBus.on('process:stopped', (data: any) => {
=======

  eventBus.on('process:stopped', (data: any) => {
>>>>>>> origin/main:src/cli/commands/start/start-command.ts
    console.log(chalk.yellow(`[VERBOSE] Process stopped: ${data.processId}`));
  });
<<<<<<< HEAD:src/cli/commands/start/start-command.js
  
  eventBus.on('process:error', (data) => {
||||||| 47d5ef4:src/cli/commands/start/start-command.ts
  
  eventBus.on('process:error', (data: any) => {
=======

  eventBus.on('process:error', (data: any) => {
>>>>>>> origin/main:src/cli/commands/start/start-command.ts
    console.log(chalk.red(`[VERBOSE] Process error: ${data.processId} - ${data.error}`));
  });
}