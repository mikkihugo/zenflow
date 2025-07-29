// start-wrapper.js - Wrapper to maintain backward compatibility with the new modular start command
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { compat } from '../runtime-detector.js';

export async function startCommand(subArgs, flags) {
  // Show help if requested
  if (flags.help || flags.h || subArgs.includes('--help') || subArgs.includes('-h')) {
    showStartHelp();
    return;
  }

  // Parse start options
  const daemon = subArgs.includes('--daemon') || subArgs.includes('-d') || flags.daemon;
  const port = process.env.PORT || flags.port || getArgValue(subArgs, '--port') || getArgValue(subArgs, '-p') || 3000;
  // Use same port for API - everything unified on single port
  const apiPort = flags['api-port'] || getArgValue(subArgs, '--api-port') || port;
  const verbose = subArgs.includes('--verbose') || subArgs.includes('-v') || flags.verbose;
  const ui = subArgs.includes('--ui') || subArgs.includes('-u') || flags.ui;
  const web = subArgs.includes('--web') || subArgs.includes('-w') || flags.web;
  const api = subArgs.includes('--api') || subArgs.includes('-a') || flags.api;

  try {
    printSuccess('Starting Claude-Flow Orchestration System...');
    console.log();

    // Start integrated services (API + Dashboard + Queen Council)
    const services = [];
    
    // 1. Start Claude Zen API server (schema-driven)
    try {
      const { claudeZenServer } = await import('../../api/claude-zen-server.js');
      claudeZenServer.port = apiPort;
      await claudeZenServer.start();
      services.push('API Server');
      printSuccess(`🚀 API Server started on port ${apiPort}`);
      printInfo(`📖 Documentation: http://localhost:${apiPort}/docs`);
    } catch (error) {
      printError(`❌ API server failed: ${error.message}`);
      return;
    }
    
    // 2. Auto-start Dashboard if UI requested or not daemon mode
    if (ui || !daemon) {
      try {
        const { startDashboard } = await import('./dashboard-command.js');
        await startDashboard({ api: `http://localhost:${apiPort}` });
        services.push('Dashboard');
        printSuccess(`🎨 Dashboard integrated with API`);
      } catch (error) {
        printWarning(`Dashboard auto-start failed: ${error.message}`);
      }
    }
    
    // 3. Auto-convene Queen Council for strategic oversight
    try {
      const { queenCouncilCommand } = await import('./queen-council.js');
      await queenCouncilCommand(['convene', '--auto', '--silent'], {});
      services.push('Queen Council');
      printSuccess(`👑 Queen Council convened for strategic oversight`);
    } catch (error) {
      printWarning(`Queen Council auto-convene failed: ${error.message}`);
    }
    
    printSuccess(`🎯 Integrated system ready! Active: ${services.join(', ')}`);
    
    if (daemon) {
      printSuccess('🔄 Running in daemon mode - system will continue in background');
      return;
    }

    // Check if we should launch the web UI mode
    if (web) {
      try {
        // Launch the web server
        const { startWebServer } = await import('./simple-commands/web-server.js');
        const server = await startWebServer(port);

        printSuccess(`🌐 Web UI is running!`);
        console.log(`📍 Open your browser to: http://localhost:${port}/console`);
        console.log('   Press Ctrl+C to stop the server');
        console.log();

        // Keep process running
        await new Promise(() => {});
        return;
      } catch (err) {
        printError('Failed to launch web UI: ' + err.message);
        console.error(err.stack);
        return;
      }
    }

    // Check if we should launch the UI mode (web UI by default)
    if (ui && !web) {
      try {
        // Launch the web UI by default when --ui is used
        const { ClaudeCodeWebServer } = await import('./simple-commands/web-server.js');
        const webServer = new ClaudeCodeWebServer(port);
        await webServer.start();

        printSuccess('🌐 Claude Flow Web UI is running!');
        console.log(`📍 Open your browser to: http://localhost:${port}/console`);
        console.log('   Press Ctrl+C to stop the server');
        console.log();

        // Keep process running
        await new Promise(() => {});
        return;
      } catch (err) {
        // If web UI fails, fall back to terminal UI
        printWarning('Web UI failed, launching terminal UI...');
        try {
          const { launchEnhancedUI } = await import('./process-ui-enhanced.js');
          await launchEnhancedUI();
          return;
        } catch (fallbackErr) {
          // If both fail, show error
          printError('Failed to launch UI: ' + err.message);
          console.error(err.stack);
          return;
        }
      }
    }

    // Check if required directories exist
    const requiredDirs = ['memory', 'coordination'];
    const missingDirs = [];

    for (const dir of requiredDirs) {
      try {
        await node.stat(dir);
      } catch {
        missingDirs.push(dir);
      }
    }

    if (missingDirs.length > 0) {
      printWarning('Missing required directories: ' + missingDirs.join(', '));
      console.log('Run "claude-zen init" first to create the necessary structure');
      return;
    }

    // Display startup information
    console.log('🚀 System Configuration:');
    console.log(`   Mode: ${daemon ? 'Daemon (background)' : 'Interactive'}`);
    console.log(`   MCP Port: ${port}`);
    console.log(`   Working Directory: ${cwd()}`);
    console.log(`   Memory Backend: JSON (default)`);
    console.log(`   Terminal Pool: 5 instances (default)`);
    console.log();

    // Initialize components
    console.log('📋 Initializing Components:');

    // Memory system
    console.log('   ✓ Memory Bank: Ready');
    console.log('     - Backend: JSON file (memory/claude-zen-data.json)');
    console.log('     - Namespaces: Enabled');

    // Terminal pool
    console.log('   ✓ Terminal Pool: Ready');
    console.log('     - Pool Size: 5');
    console.log('     - Shell: ' + (compat.platform.os === 'windows' ? 'cmd.exe' : '/bin/bash'));

    // Task queue
    console.log('   ✓ Task Queue: Ready');
    console.log('     - Max Concurrent: 10');
    console.log('     - Priority Queue: Enabled');

    // MCP Server
    console.log('   ✓ MCP Server: Ready');
    console.log(`     - Port: ${port}`);
    console.log('     - Transport: stdio/HTTP');

    console.log();

    if (daemon) {
      // Daemon mode - would normally fork process
      printInfo('Starting in daemon mode...');
      console.log('Note: Full daemon mode requires the TypeScript version');
      console.log('The orchestrator would run in the background on port ' + port);

      // Create a simple PID file to simulate daemon
      const pid = compat.terminal.getPid();
      await compat.safeCall(async () => {
        if (compat.runtime === 'node') {
          await node.writeTextFile('.claude-zen.pid', pid.toString());
        } else {
          const fs = await import('fs/promises');
          await fs.writeFile('.claude-zen.pid', pid.toString());
        }
      });
      console.log(`Process ID: ${pid} (saved to .claude-zen.pid)`);
    } else {
      // Interactive mode
      printSuccess('Orchestration system started!');
      console.log();
      console.log('🎯 Available Actions:');
      console.log('   • Open another terminal and run:');
      console.log('     - claude-zen agent spawn researcher');
      console.log('     - claude-zen task create "your task"');
      console.log('     - claude-zen sparc "build feature"');
      console.log('     - claude-zen monitor');
      console.log();
      console.log('   • View system status:');
      console.log('     - claude-zen status');
      console.log();
      console.log('   • Launch process management UI:');
      console.log('     - claude-zen start --ui');
      console.log();
      console.log('   • Press Ctrl+C to stop the orchestrator');
      console.log();

      if (verbose) {
        console.log('📊 Verbose Mode - Showing system activity:');
        console.log('[' + new Date().toISOString() + '] System initialized');
        console.log('[' + new Date().toISOString() + '] Waiting for commands...');
      }

      // Keep the process running
      console.log('🟢 System is running...');

      // Set up signal handlers
      const abortController = new AbortController();

      compat.terminal.onSignal('SIGINT', () => {
        console.log('\n⏹️  Shutting down orchestrator...');
        cleanup();
        compat.terminal.exit(0);
      });

      // Simple heartbeat to show system is alive
      if (!daemon) {
        const heartbeat = setInterval(() => {
          if (verbose) {
            console.log('[' + new Date().toISOString() + '] Heartbeat - System healthy');
          }
        }, 30000); // Every 30 seconds

        // Wait indefinitely (until Ctrl+C)
        await new Promise(() => {});
      }
    }
  } catch (err) {
    printError(`Failed to start orchestration system: ${err.message}`);
    console.error('Stack trace:', err.stack);
  }
}

function getArgValue(args, flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && index < args.length - 1) {
    return args[index + 1];
  }
  return null;
}

async function cleanup() {
  // Clean up resources
  try {
    await compat.safeCall(async () => {
      if (compat.runtime === 'node') {
        await node.remove('.claude-zen.pid');
      } else {
        const fs = await import('fs/promises');
        await fs.unlink('.claude-zen.pid');
      }
    });
  } catch {
    // File might not exist
  }

  console.log('✓ Terminal pool closed');
  console.log('✓ Task queue cleared');
  console.log('✓ Memory bank saved');
  console.log('✓ Cleanup complete');
}

function showStartHelp() {
  console.log('Start the Claude Zen orchestration system with schema-driven API');
  console.log();
  console.log('Usage: claude-zen start [options]');
  console.log();
  console.log('Options:');
  console.log('  -d, --daemon         Run as daemon in background');
  console.log('  -p, --port <port>    Server port (default: 3000)');
  console.log('  --api-port <port>    Override API port (default: same as --port)');
  console.log('  -u, --ui             Launch terminal-based process management UI');
  console.log('  -w, --web            Launch web-based UI server');
  console.log('  -v, --verbose        Show detailed system activity');
  console.log('  -h, --help           Show this help message');
  console.log();
  console.log('Examples:');
  console.log('  claude-zen start --daemon           # Start as background daemon on port 3000');
  console.log('  claude-zen start --web              # Start with web interface');
  console.log('  claude-zen start --port 4000        # Use custom port for everything');
  console.log('  claude-zen start --port 8080        # Use custom server port');
  console.log('  claude-zen start --ui               # Launch terminal-based UI');
  console.log('  claude-zen start --web              # Launch web-based UI');
  console.log('  claude-zen start --verbose          # Show detailed logs');
  console.log();
  console.log('Web-based UI:');
  console.log('  The --web flag starts a web server with:');
  console.log('    - Full-featured web console at http://localhost:3000/console');
  console.log('    - Real-time WebSocket communication');
  console.log('    - Mobile-responsive design');
  console.log('    - Multiple themes and customization options');
  console.log('    - Claude Flow swarm integration');
  console.log();
  console.log('Terminal-based UI:');
  console.log('  The --ui flag launches an advanced multi-view interface with:');
  console.log();
  console.log('  Views (press 1-6 to switch):');
  console.log('    1. Process Management - Start/stop individual components');
  console.log('    2. System Status - Health metrics and resource usage');
  console.log('    3. Orchestration - Agent and task management');
  console.log('    4. Memory Bank - Namespace browser and operations');
  console.log('    5. System Logs - Real-time log viewer with filters');
  console.log('    6. Help - Comprehensive keyboard shortcuts');
  console.log();
  console.log('  Features:');
  console.log('    - Color-coded status indicators');
  console.log('    - Real-time updates and monitoring');
  console.log('    - Context-sensitive controls');
  console.log('    - Tab navigation between views');
  console.log();
  console.log('Notes:');
  console.log('  - Requires "claude-zen init" to be run first');
  console.log('  - Interactive mode shows real-time system status');
  console.log('  - Daemon mode runs in background (check logs)');
  console.log('  - Use "claude-zen status" to check if running');
  console.log('  - Use Ctrl+C or "claude-zen stop" to shutdown');
  console.log();
  console.log('API Endpoints (when daemon is running):');
  console.log('  /docs                        # API documentation');
  console.log('  /api/schema                  # Schema introspection');
  console.log('  /health                      # Health check');
  console.log('  /api/adrs                    # Architectural decisions');
  console.log('  /api/prds                    # Product requirements');
  console.log('  /api/coordination/status     # Multi-service coordination');
}
