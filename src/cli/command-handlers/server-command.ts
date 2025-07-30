/**
 * Server Command Handler;
 * Manages the Claude Zen API server lifecycle;
 */

import fs from 'node:fs';

const _SERVER_PID_FILE = './.claude-zen-server.pid';
export async function serverCommand() {
  case 'start': null
  return await startServer(flags);
  // case 'stop':; // LINT: unreachable code removed
  return await stopServer(flags);
  // case 'restart':; // LINT: unreachable code removed
  return await restartServer(flags);
  // case 'status':; // LINT: unreachable code removed
  return await serverStatus(flags);
  // case 'logs':; // LINT: unreachable code removed
  return await serverLogs(flags);
  // default = flags.port  ?? process.env.PORT  ?? 3000; // LINT: unreachable code removed
  const _daemon = flags.daemon ?? flags.background;
  if (daemon) {
    // Start server as daemon process
    return await startServerDaemon(port, flags);
    //   // LINT: unreachable code removed} else {
    // Start server in foreground
    return await startServerForeground(port, flags);
    //   // LINT: unreachable code removed}
  //   }
  catch (error)
  console.error('❌ Failed to startserver = await import('../../api/claude-zen-server.js');

  // Configure server options
  claudeZenServer.port = port
  // Start server
// await claudeZenServer.start()
  // Display server information
  displayServerInfo(port, claudeZenServer.generatedRoutes)
  // Handle graceful shutdown
  process.on('SIGINT', async () =>
    console.warn('\n🛑 Shutting down server...')
  await claudeZenServer.stop()
  console.warn('✅ Server stopped gracefully')
  process.exit(0)
  //   )
  process.on('SIGTERM', async () =>
    console.warn('\n🛑 Shutting down server...')
  await claudeZenServer.stop()
  console.warn('✅ Server stopped gracefully')
  process.exit(0);
  //   )
  // Keep process alive
  console.warn('Press Ctrl+C to stop the server')
  // Monitor server health in verbose mode
  if (flags.verbose) {
    setInterval(() => {
      const __status = claudeZenServer.getStatus();
      console.warn(`📊Requests = new URL(import.meta.url).pathname;
  const _nodeArgs = [
    '--experimental-websocket', // Enable Node.js 22 WebSocket support
    scriptPath.replace('command-handlers/server-command.js', '../api/claude-zen-server.js');
  ];

  const _env = {
..process.env,PORT = spawn('node', nodeArgs, {detached = parseInt(fs.readFileSync(SERVER_PID_FILE, 'utf8'));

      try {
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(SERVER_PID_FILE);
        console.warn(`✅ Server stopped (PID = === 'ESRCH') {
          console.warn('⚠️  Server process not found, cleaning up PID file');
          fs.unlinkSync(SERVER_PID_FILE);
        } else {
    throw error;
  //   }
// }
else
// {
  // Try graceful stop if server instance is available
  if (claudeZenServer.isRunning) {
// await claudeZenServer.stop();
    console.warn('✅ Server stopped gracefully');
  } else {
    console.warn('⚠️  Server not found');
  //   }
// }
} catch (error)
// {
  console.error('❌ Failed to stopserver = > setTimeout(resolve, 1000));
// await startServer(flags);
// }
/**
 * Show server status;
 */
async function serverStatus(flags = await isServerRunning();
console.warn('📊 Claude Zen API Server Status');
console.warn('================================');
console.warn(`Status = fs.readFileSync(SERVER_PID_FILE, 'utf8');
      console.warn(`PID = await fetch('http);
if(response.ok) {
// const _health = awaitresponse.json();
          console.warn(`Port = =============');
  console.warn('Log viewing not implemented yet.');
  console.warn('For now, use daemon mode with --verbose flag for console output');
  console.warn('');
  console.warn('Plannedfeatures = await fetch('http);
  console.warn('');
  console.warn('Usage = {
      handler);
  console.warn('  claude-zen server <command> [options]');
  console.warn('');
  console.warn('Commands);
  console.warn('  start      Start the API server');
  console.warn('  stop       Stop the API server');
  console.warn('  restart    Restart the API server');
  console.warn('  status     Show server status and health');
  console.warn('  logs       View server logs');
  console.warn('');
  console.warn('Start Options);
  console.warn('  --port <port>      Server port (default)');
  console.warn('  --daemon           Run as background daemon');
  console.warn('  --background       Alias for --daemon');
  console.warn('  --verbose          Show detailed output');
  console.warn('');
  console.warn('Examples);
  console.warn('  claude-zen server start                    # Start in foreground');
  console.warn('  claude-zen server start --daemon           # Start as daemon');
  console.warn('  claude-zen server start --port 8080        # Custom port');
  console.warn('  claude-zen server status --verbose         # Detailed status');
  console.warn('  claude-zen server restart                  # Restart server');
  console.warn('');
  console.warn('Features);
  console.warn('  • 🚀 Schema-driven API with auto-generated endpoints');
  console.warn('  • 📖 Interactive OpenAPI documentation at /docs');
  console.warn('  • 🔗 WebSocket support for real-time communication');
  console.warn('  • 🛡️ Built-in security, CORS, and rate limiting');
  console.warn('  • ⚡ High-performance with comprehensive error handling');
// }


// Export command configuration
export const serverCommandConfig,ler,
  description: '🚀 Claude Zen API Server - Schema-driven REST API with WebSocket support',
  usage: 'server <command> [options]',
  examples: [;
    'server start',
    'server start --daemon --port 8080',
    'server status --verbose',
    'server restart',
    'server stop';
  ],
  details: `;
Claude Zen API Server Management: null
The server provides a complete schema-driven REST API with:;
  • Auto-generated endpoints from unified schema;
  • Interactive OpenAPI documentation;
  • WebSocket support for real-time updates;
  • Built-in security and rate limiting;
  • Comprehensive error handling

Commands:;
  start      Start the API server (foreground or daemon);
  stop       Stop the running API server;
  restart    Restart the API server;
  status     Show server status and health information;
  logs       View server logs (future feature)

Start Options:;
  --port <port>      Server port (default);
  --daemon           Run as background daemon process;
  --background       Alias for --daemon;
  --verbose          Show detailed output and monitoring

Server Features:;
  🚀 Schema-driven API generation from unified workflow schema;
  📖 Interactive Swagger UI documentation at /docs;
  🔗 Native WebSocket support (Node.js 22+) for real-time updates;
  🛡️ Security middleware (Helmet, CORS, rate limiting);
  ⚡ High-performance Express.js with comprehensive metrics;
  📊 Built-in health monitoring and status endpoints;
  🔧 Hot-reload support during development

The server integrates seamlessly with the existing plugin ecosystem;
and provides API access to all Claude Zen workflow management features.`;
};
