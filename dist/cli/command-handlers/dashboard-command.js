/**
 * Dashboard Command Handler - Launch unified dashboard interface
 * Integrates the React/Ink unified dashboard with the API server
 */

import process from 'process';
import { spawn } from 'child_process';
import chalk from 'chalk';

export async function dashboardCommand(args, flags) {
  const subcommand = args[0] || 'start';
  
  console.log(chalk.cyan.bold('🚀 Claude-Zen Dashboard System'));
  console.log('');

  switch (subcommand) {
    case 'start':
      return startDashboard(flags);
    case 'status':
      return dashboardStatus(flags);
    case 'stop':
      return stopDashboard(flags);
    default:
      console.log(chalk.yellow('Available dashboard commands:'));
      console.log('  start   - Start the unified dashboard interface');
      console.log('  status  - Check dashboard and API server status');
      console.log('  stop    - Stop the dashboard');
      console.log('');
      console.log(chalk.gray('Options:'));
      console.log('  --web       Force web mode');
      console.log('  --terminal  Force terminal (TUI) mode');
      console.log('  --port      WebSocket connection port (default: 3000)');
      break;
  }
}

async function startDashboard(flags) {
  // Check API server health first
  console.log(chalk.blue('🔍 Checking API server connection...'));
  
  try {
    const response = await fetch('http://localhost:3000/health');
    const health = await response.json();
    console.log(chalk.green(`✅ API server healthy (uptime: ${Math.round(health.uptime)}s)`));
  } catch (error) {
    console.log(chalk.red('❌ API server not available on port 3000'));
    console.log(chalk.yellow('💡 Start it with: claude-zen server start'));
    return;
  }

  // Determine dashboard mode
  const isWeb = flags.web || process.env.DISPLAY;
  const isTerminal = flags.terminal || !process.env.DISPLAY;
  const port = flags.port || 3000;

  console.log(chalk.blue(`🎯 Launching dashboard in ${isWeb && !flags.terminal ? 'WEB' : 'TERMINAL'} mode`));
  console.log(chalk.gray(`📡 Connecting to API server on port ${port}`));
  console.log('');

  // Set environment variables for the dashboard
  const env = {
    ...process.env,
    NODE_ENV: isWeb && !flags.terminal ? 'web' : 'terminal',
    API_PORT: port.toString(),
    WEBSOCKET_URL: `ws://localhost:${port}/ws`
  };

  try {
    // Launch the unified dashboard
    const dashboardPath = process.cwd() + '/src/ui/unified-dashboard.js';
    
    console.log(chalk.green('🚀 Starting unified dashboard...'));
    console.log(chalk.gray(`📄 Dashboard script: ${dashboardPath}`));
    console.log('');
    
    // Use spawn to run the dashboard in the current terminal
    const dashboardProcess = spawn('node', [dashboardPath], {
      env,
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Handle dashboard process events
    dashboardProcess.on('error', (error) => {
      console.error(chalk.red('❌ Failed to start dashboard:'), error.message);
    });

    dashboardProcess.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ Dashboard closed successfully'));
      } else {
        console.log(chalk.yellow(`⚠️  Dashboard exited with code ${code}`));
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down dashboard...'));
      dashboardProcess.kill('SIGTERM');
      process.exit(0);
    });

    // Keep the command alive while dashboard runs
    await new Promise((resolve) => {
      dashboardProcess.on('exit', resolve);
    });

  } catch (error) {
    console.error(chalk.red('❌ Error starting dashboard:'), error.message);
    console.log('');
    console.log(chalk.yellow('🔧 Troubleshooting:'));
    console.log('1. Ensure all dependencies are installed: npm install');
    console.log('2. Check that the API server is running: claude-zen server start');
    console.log('3. Verify React and Ink are available in node_modules');
  }
}

async function dashboardStatus(flags) {
  console.log(chalk.blue('📊 Dashboard System Status'));
  console.log('');

  // Check API Server
  try {
    const response = await fetch('http://localhost:3000/health');
    const health = await response.json();
    
    console.log(chalk.green('✅ API Server: HEALTHY'));
    console.log(`   Uptime: ${Math.round(health.uptime)}s`);
    console.log(`   Version: ${health.version}`);
    console.log(`   Routes: ${health.routes_generated}`);
    console.log('');
  } catch (error) {
    console.log(chalk.red('❌ API Server: OFFLINE'));
    console.log('   Start with: claude-zen server start');
    console.log('');
  }

  // Check WebSocket endpoint
  try {
    const wsResponse = await fetch('http://localhost:3000/api/websocket/status');
    const wsStatus = await wsResponse.json();
    
    console.log(chalk.green('✅ WebSocket: AVAILABLE'));
    console.log(`   Endpoint: ws://localhost:3000/ws`);
    console.log('');
  } catch (error) {
    console.log(chalk.yellow('⚠️  WebSocket: Status unknown'));
    console.log('');
  }

  // Check Dashboard Dependencies
  console.log(chalk.blue('📦 Dashboard Dependencies:'));
  
  try {
    // Check if React is available
    await import('react');
    console.log(chalk.green('   ✅ React: Available'));
  } catch (error) {
    console.log(chalk.red('   ❌ React: Missing - npm install react'));
  }

  try {
    // Check if Ink is available
    await import('ink');
    console.log(chalk.green('   ✅ Ink: Available'));
  } catch (error) {
    console.log(chalk.red('   ❌ Ink: Missing - npm install ink'));
  }

  try {
    // Check if unified dashboard exists
    const fs = await import('fs');
    const dashboardExists = fs.existsSync('./src/ui/unified-dashboard.js');
    if (dashboardExists) {
      console.log(chalk.green('   ✅ Unified Dashboard: Available'));
    } else {
      console.log(chalk.red('   ❌ Unified Dashboard: Missing'));
    }
  } catch (error) {
    console.log(chalk.yellow('   ⚠️  Dashboard Check: Error'));
  }

  console.log('');
  console.log(chalk.gray('💡 Use "claude-zen dashboard start" to launch the interface'));
}

async function stopDashboard(flags) {
  console.log(chalk.yellow('🛑 Dashboard stop command'));
  console.log('');
  console.log('The dashboard runs in the foreground.');
  console.log('To stop it, use Ctrl+C in the terminal where it\'s running.');
  console.log('');
  console.log(chalk.gray('For background processes, you would need to:'));
  console.log('1. Find the process: ps aux | grep dashboard');
  console.log('2. Kill it: kill <pid>');
}

export const dashboardCommandConfig = {
  handler: dashboardCommand,
  description: '📊 Launch unified dashboard interface with React/Ink support',
  usage: 'dashboard <command> [options]',
  examples: [
    'dashboard start',
    'dashboard start --terminal',
    'dashboard start --web --port 3000',
    'dashboard status',
    'dashboard stop'
  ],
  details: `
Dashboard Commands:
  start     Launch the unified dashboard interface
  status    Check dashboard system status and dependencies
  stop      Information on stopping the dashboard

Dashboard Features:
  🎯 Vision Management     View and manage strategic visions
  🐝 Hive-Mind Monitor     Real-time swarm and agent monitoring  
  💾 Memory Browser        Explore system memory and data
  📝 Log Viewer           System logs and activity streams
  🔄 Real-time Updates    WebSocket integration for live data
  
Interface Modes:
  🖥️  Terminal (TUI)       Text-based interface using Ink
  🌐 Web Mode             Browser-based interface (future)
  
Integration:
  📡 WebSocket Connection  Real-time updates from API server
  🔌 Plugin System        Connects to activated plugin ecosystem
  🗄️  LanceDB Integration  Strategic document access
  📊 Performance Metrics  Live system monitoring

The dashboard provides a comprehensive visual interface for the entire
claude-zen system, connecting all activated components through a unified
React/Ink interface with real-time WebSocket updates.

Options:
  --web               Force web mode (future feature)
  --terminal          Force terminal mode (default)  
  --port <port>       API server port (default: 3000)
  --verbose           Show detailed connection info
  
Prerequisites:
  • API server running (claude-zen server start)
  • React and Ink dependencies installed
  • WebSocket endpoint available
`
};