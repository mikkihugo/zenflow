/**
 * Server Command Handler
 * Manages the Claude Zen API server lifecycle
 */

import { claudeZenServer } from '../../api/claude-zen-server.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SERVER_PID_FILE = './.claude-zen-server.pid';

export async function serverCommand(args, flags) {
  const subcommand = args[0];
  
  switch (subcommand) {
    case 'start':
      return await startServer(flags);
    case 'stop':
      return await stopServer(flags);
    case 'restart':
      return await restartServer(flags);
    case 'status':
      return await serverStatus(flags);
    case 'logs':
      return await serverLogs(flags);
    default:
      showServerHelp();
  }
}

/**
 * Start the API server
 */
async function startServer(flags) {
  try {
    // Check if server is already running
    if (await isServerRunning()) {
      console.log('⚠️  Server is already running');
      console.log('Use "claude-zen server status" to check server details');
      return;
    }

    const port = flags.port || process.env.PORT || 3000;
    const daemon = flags.daemon || flags.background;
    
    if (daemon) {
      // Start server as daemon process
      return await startServerDaemon(port, flags);
    } else {
      // Start server in foreground
      return await startServerForeground(port, flags);
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (flags.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Start server in foreground (interactive mode)
 */
async function startServerForeground(port, flags) {
  console.log('🚀 Starting Claude Zen API Server...');
  console.log(`📡 Port: ${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  // Configure server options
  claudeZenServer.port = port;
  
  // Start server
  await claudeZenServer.start();
  
  // Display server information
  displayServerInfo(port, claudeZenServer.generatedRoutes);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await claudeZenServer.stop();
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await claudeZenServer.stop();
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });

  // Keep process alive
  console.log('Press Ctrl+C to stop the server');
  
  // Monitor server health in verbose mode
  if (flags.verbose) {
    setInterval(() => {
      const status = claudeZenServer.getStatus();
      console.log(`📊 Requests: ${status.requests}, Errors: ${status.errors}, Uptime: ${Math.floor(status.uptime)}s`);
    }, 30000);
  }
}

/**
 * Start server as daemon process
 */
async function startServerDaemon(port, flags) {
  console.log('🔄 Starting server as daemon...');
  
  const scriptPath = new URL(import.meta.url).pathname;
  const nodeArgs = [
    '--experimental-websocket', // Enable Node.js 22 WebSocket support
    scriptPath.replace('command-handlers/server-command.js', '../api/claude-zen-server.js')
  ];
  
  const env = {
    ...process.env,
    PORT: port.toString(),
    NODE_ENV: process.env.NODE_ENV || 'production'
  };

  const child = spawn('node', nodeArgs, {
    detached: true,
    stdio: flags.verbose ? 'inherit' : 'ignore',
    env
  });

  // Save PID for later management
  fs.writeFileSync(SERVER_PID_FILE, child.pid.toString());
  
  // Detach the child process
  child.unref();
  
  console.log(`✅ Server started as daemon (PID: ${child.pid})`);
  console.log(`📡 API Server: http://localhost:${port}`);
  console.log(`📖 Documentation: http://localhost:${port}/docs`);
  console.log(`🔍 Health Check: http://localhost:${port}/health`);
  console.log('');
  console.log('Use "claude-zen server status" to check server health');
  console.log('Use "claude-zen server stop" to stop the server');
}

/**
 * Stop the API server
 */
async function stopServer(flags) {
  try {
    if (!await isServerRunning()) {
      console.log('⚠️  Server is not running');
      return;
    }

    // Try to stop via PID file
    if (fs.existsSync(SERVER_PID_FILE)) {
      const pid = parseInt(fs.readFileSync(SERVER_PID_FILE, 'utf8'));
      
      try {
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(SERVER_PID_FILE);
        console.log(`✅ Server stopped (PID: ${pid})`);
      } catch (error) {
        if (error.code === 'ESRCH') {
          console.log('⚠️  Server process not found, cleaning up PID file');
          fs.unlinkSync(SERVER_PID_FILE);
        } else {
          throw error;
        }
      }
    } else {
      // Try graceful stop if server instance is available
      if (claudeZenServer.isRunning) {
        await claudeZenServer.stop();
        console.log('✅ Server stopped gracefully');
      } else {
        console.log('⚠️  Server not found');
      }
    }
  } catch (error) {
    console.error('❌ Failed to stop server:', error.message);
    if (flags.verbose) {
      console.error(error.stack);
    }
  }
}

/**
 * Restart the API server
 */
async function restartServer(flags) {
  console.log('🔄 Restarting server...');
  await stopServer(flags);
  
  // Wait a moment for cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await startServer(flags);
}

/**
 * Show server status
 */
async function serverStatus(flags) {
  try {
    const isRunning = await isServerRunning();
    
    console.log('📊 Claude Zen API Server Status');
    console.log('================================');
    console.log(`Status: ${isRunning ? '🟢 Running' : '🔴 Stopped'}`);
    
    if (fs.existsSync(SERVER_PID_FILE)) {
      const pid = fs.readFileSync(SERVER_PID_FILE, 'utf8');
      console.log(`PID: ${pid}`);
    }
    
    if (isRunning) {
      // Try to get detailed status from server
      try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
          const health = await response.json();
          console.log(`Port: ${3000}`);
          console.log(`Uptime: ${Math.floor(health.uptime)} seconds`);
          console.log(`Version: ${health.version}`);
          console.log(`Routes: ${health.routes_generated} auto-generated`);
          console.log(`Schema-driven: ✅`);
          
          if (flags.verbose) {
            console.log('\n📡 Available Endpoints:');
            console.log(`  📖 Documentation: http://localhost:3000/docs`);
            console.log(`  🔍 Health Check: http://localhost:3000/health`);
            console.log(`  📋 Schema Info: http://localhost:3000/api/schema`);
            console.log(`  🌐 Root: http://localhost:3000/`);
          }
        }
      } catch (error) {
        console.log('⚠️  Server running but health check failed');
        if (flags.verbose) {
          console.log(`Health check error: ${error.message}`);
        }
      }
    }
    
    console.log('');
    if (isRunning) {
      console.log('Use "claude-zen server stop" to stop the server');
    } else {
      console.log('Use "claude-zen server start" to start the server');
    }
  } catch (error) {
    console.error('❌ Failed to get server status:', error.message);
  }
}

/**
 * Show server logs (placeholder for future implementation)
 */
async function serverLogs(flags) {
  console.log('📜 Server Logs');
  console.log('==============');
  console.log('Log viewing not implemented yet.');
  console.log('For now, use daemon mode with --verbose flag for console output');
  console.log('');
  console.log('Planned features:');
  console.log('  • Log file rotation');
  console.log('  • Real-time log streaming');
  console.log('  • Log filtering and search');
  console.log('  • Error log aggregation');
}

/**
 * Check if server is running
 */
async function isServerRunning() {
  try {
    const response = await fetch('http://localhost:3000/health', {
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Display server information
 */
function displayServerInfo(port, routes) {
  console.log('✅ Claude Zen API Server started successfully!');
  console.log('');
  console.log('🌐 Server Information:');
  console.log(`   📡 API Server: http://localhost:${port}`);
  console.log(`   📖 Documentation: http://localhost:${port}/docs`);
  console.log(`   🔍 Health Check: http://localhost:${port}/health`);
  console.log(`   📋 Schema Info: http://localhost:${port}/api/schema`);
  console.log('');
  console.log('🚀 Features:');
  console.log('   ✨ Schema-driven API generation');
  console.log('   📊 Auto-generated OpenAPI documentation');
  console.log('   🔗 WebSocket support for real-time updates');
  console.log('   🛡️ Built-in security and rate limiting');
  console.log('   ⚡ High-performance Express.js backend');
  console.log('');
  console.log(`📋 Generated ${routes.length} API endpoints from schema`);
  console.log('');
}

/**
 * Show server command help
 */
function showServerHelp() {
  console.log('Claude Zen API Server Management');
  console.log('===============================');
  console.log('');
  console.log('Usage:');
  console.log('  claude-zen server <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  start      Start the API server');
  console.log('  stop       Stop the API server');
  console.log('  restart    Restart the API server');
  console.log('  status     Show server status and health');
  console.log('  logs       View server logs');
  console.log('');
  console.log('Start Options:');
  console.log('  --port <port>      Server port (default: 3000)');
  console.log('  --daemon           Run as background daemon');
  console.log('  --background       Alias for --daemon');
  console.log('  --verbose          Show detailed output');
  console.log('');
  console.log('Examples:');
  console.log('  claude-zen server start                    # Start in foreground');
  console.log('  claude-zen server start --daemon           # Start as daemon');
  console.log('  claude-zen server start --port 8080        # Custom port');
  console.log('  claude-zen server status --verbose         # Detailed status');
  console.log('  claude-zen server restart                  # Restart server');
  console.log('');
  console.log('Features:');
  console.log('  • 🚀 Schema-driven API with auto-generated endpoints');
  console.log('  • 📖 Interactive OpenAPI documentation at /docs');
  console.log('  • 🔗 WebSocket support for real-time communication');
  console.log('  • 🛡️ Built-in security, CORS, and rate limiting');
  console.log('  • ⚡ High-performance with comprehensive error handling');
}

// Export command configuration
export const serverCommandConfig = {
  handler: serverCommand,
  description: '🚀 Claude Zen API Server - Schema-driven REST API with WebSocket support',
  usage: 'server <command> [options]',
  examples: [
    'server start',
    'server start --daemon --port 8080',
    'server status --verbose',
    'server restart',
    'server stop'
  ],
  details: `
Claude Zen API Server Management:

The server provides a complete schema-driven REST API with:
  • Auto-generated endpoints from unified schema
  • Interactive OpenAPI documentation
  • WebSocket support for real-time updates
  • Built-in security and rate limiting
  • Comprehensive error handling

Commands:
  start      Start the API server (foreground or daemon)
  stop       Stop the running API server
  restart    Restart the API server
  status     Show server status and health information
  logs       View server logs (future feature)

Start Options:
  --port <port>      Server port (default: 3000)
  --daemon           Run as background daemon process
  --background       Alias for --daemon
  --verbose          Show detailed output and monitoring

Server Features:
  🚀 Schema-driven API generation from unified workflow schema
  📖 Interactive Swagger UI documentation at /docs
  🔗 Native WebSocket support (Node.js 22+) for real-time updates
  🛡️ Security middleware (Helmet, CORS, rate limiting)
  ⚡ High-performance Express.js with comprehensive metrics
  📊 Built-in health monitoring and status endpoints
  🔧 Hot-reload support during development

The server integrates seamlessly with the existing plugin ecosystem
and provides API access to all Claude Zen workflow management features.`
};