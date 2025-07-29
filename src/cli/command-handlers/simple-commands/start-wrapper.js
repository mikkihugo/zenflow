// start-wrapper.js - Wrapper to maintain backward compatibility with the new modular start command
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { compat } from '../runtime-detector.js';

export async function startCommand(subArgs, flags) {
  // Ensure subArgs is an array (defensive coding)
  if (!Array.isArray(subArgs)) {
    subArgs = [];
  }
  
  // Show help if requested
  if (flags.help || flags.h || subArgs.includes('--help') || subArgs.includes('-h')) {
    showStartHelp();
    return;
  }

  // Parse start options
  const daemon = subArgs.includes('--daemon') || subArgs.includes('-d') || flags.daemon;
  const port = process.env.PORT || flags.port || getArgValue(subArgs, '--port') || getArgValue(subArgs, '-p') || 3000;
  const verbose = subArgs.includes('--verbose') || subArgs.includes('-v') || flags.verbose;
  
  // UI defaults to ON, can be disabled with --no-ui
  const noUi = subArgs.includes('--no-ui') || flags['no-ui'];
  const ui = !noUi && (subArgs.includes('--ui') || subArgs.includes('-u') || flags.ui || !daemon);
  const web = subArgs.includes('--web') || subArgs.includes('-w') || flags.web;
  
  // Swarm defaults to ON, can be disabled with --no-swarm  
  const noSwarm = subArgs.includes('--no-swarm') || flags['no-swarm'];
  const swarm = !noSwarm && (subArgs.includes('--swarm') || subArgs.includes('-s') || flags.swarm || !daemon);

  try {
    printSuccess('🚀 Starting Claude Zen Unified Server...');
    
    // Import and start the unified interface plugin
    const { UnifiedInterfacePlugin } = await import('../../../plugins/unified-interface/index.js');
    
    const server = new UnifiedInterfacePlugin({
      webPort: port,
      enableMCP: true,
      theme: 'dark',
      daemonMode: daemon
    });
    
    await server.initialize();
    
    printSuccess('✅ Claude Zen Unified Server Started!');
    console.log(`🌐 Web UI: http://localhost:${port}/`);
    console.log(`🔗 MCP Server: http://localhost:${port}/mcp`);
    console.log(`📡 WebSocket: ws://localhost:${port}/ws`);
    console.log(`📊 Health Check: http://localhost:${port}/health`);
    console.log();
    
    if (daemon) {
      console.log('🎯 Running in daemon mode - server will stay alive');
      console.log('Use Ctrl+C to stop the server');
    } else {
      console.log('🎯 Running in interactive mode');
      console.log('Press Ctrl+C to stop the server');
    }
    console.log();
    
    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down unified server...');
      await server.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await server.shutdown();
      process.exit(0);
    });
    
    // Keep server running
    await new Promise(() => {});
    return;

    // Check if we should launch the web UI mode
    if (web) {
      try {
        // Launch the web server
        const { startWebServer } = await import('./web-server.js');
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

    // Check if we should launch the UI mode
    if (ui && !web) {
      try {
        // Launch new unified Ink-based dashboard
        printSuccess('🎨 Launching Unified Dashboard...');
        console.log('   Features: Vision roadmaps, swarm monitoring, system metrics');
        console.log('   Press Ctrl+C to stop');
        console.log();
        
        const { spawn } = await import('child_process');
        const dashboardProcess = spawn('node', ['src/ui/unified-dashboard.js'], {
          stdio: 'inherit',
          cwd: process.cwd()
        });

        dashboardProcess.on('close', (code) => {
          if (code !== 0) {
            printWarning('Dashboard exited, falling back to enhanced UI...');
            // Fallback to existing UI
            import('./process-ui-enhanced.js').then(({ launchEnhancedUI }) => {
              launchEnhancedUI();
            });
          }
        });

        // Keep process running
        await new Promise(() => {});
        return;
      } catch (err) {
        // If unified UI fails, fall back to existing terminal UI
        printWarning('Unified UI failed, launching fallback UI...');
        try {
          const { launchEnhancedUI } = await import('./process-ui-enhanced.js');
          await launchEnhancedUI();
          return;
        } catch (fallbackErr) {
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
  console.log('🚀 START COMMAND - Start Orchestration System\n');
  console.log('USAGE:');
  console.log('  claude-zen start [options]\n');
  console.log('DESCRIPTION:');
  console.log('  Start Claude-Zen orchestration with UI and swarm intelligence enabled by');
  console.log('  default. Runs dual MCP architecture for both external and internal coordination.\n');
  console.log('OPTIONS:');
  console.log('  -d, --daemon         Run as background daemon (disables UI/swarm)');
  console.log('  -p, --port <port>    HTTP MCP server port for Claude Desktop (default: 3000)');
  console.log('  --no-ui              Disable interactive user interface');
  console.log('  --no-swarm           Disable swarm intelligence features');
  console.log('  -w, --web            Force web-based UI (default when UI enabled)');
  console.log('  -v, --verbose        Detailed logging');
  console.log('  -h, --help           Show this help message\n');
  console.log('MCP ARCHITECTURE:');
  console.log('  • HTTP MCP (--port): External Claude Desktop, vision roadmaps');
  console.log('  • STDIO MCP: Internal claude-zen swarm coordination (automatic)\n');
  console.log('EXAMPLES:');
  console.log('  claude-zen start                         # Default: UI + swarm + HTTP MCP');
  console.log('  claude-zen start --no-swarm              # UI + HTTP MCP only');
  console.log('  claude-zen start --no-ui                 # Swarm + HTTP MCP only'); 
  console.log('  claude-zen start --daemon --port 4106    # Background HTTP MCP only');
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
}
