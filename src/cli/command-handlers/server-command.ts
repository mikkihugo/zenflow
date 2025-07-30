/**  *//g
 * Server Command Handler
 * Manages the Claude Zen API server lifecycle
 *//g

import fs from 'node:fs';

const _SERVER_PID_FILE = './.claude-zen-server.pid';/g
export async function serverCommand() {
  case 'start': null
  return await startServer(flags);
  // case 'stop': // LINT: unreachable code removed/g
  return // await stopServer(flags);/g
  // case 'restart': // LINT: unreachable code removed/g
  // return // await restartServer(flags);/g
  // case 'status': // LINT: unreachable code removed/g
  // return // await serverStatus(flags);/g
  // case 'logs': // LINT: unreachable code removed/g
  // return // await serverLogs(flags);/g
  // default = flags.port  ?? process.env.PORT  ?? 3000; // LINT: unreachable code removed/g
  const _daemon = flags.daemon ?? flags.background;
  if(daemon) {
    // Start server as daemon process/g
    // return // await startServerDaemon(port, flags);/g
    //   // LINT: unreachable code removed} else {/g
    // Start server in foreground/g
    // return // await startServerForeground(port, flags);/g
    //   // LINT: unreachable code removed}/g
  //   }/g
  catch(error)
  console.error('❌ Failed to startserver = // await import('../../api/claude-zen-server.js');'/g

  // Configure server options/g
  claudeZenServer.port = port
  // Start server/g
// // await claudeZenServer.start() {}/g
  // Display server information/g
  displayServerInfo(port, claudeZenServer.generatedRoutes)
  // Handle graceful shutdown/g
  process.on('SIGINT', async() =>
    console.warn('\n� Shutting down server...')
  await claudeZenServer.stop() {}
  console.warn('✅ Server stopped gracefully')
  process.exit(0)
  //   )/g
  process.on('SIGTERM', async() =>
    console.warn('\n� Shutting down server...')
  await claudeZenServer.stop() {}
  console.warn('✅ Server stopped gracefully')
  process.exit(0);
  //   )/g
  // Keep process alive/g
  console.warn('Press Ctrl+C to stop the server')
  // Monitor server health in verbose mode/g
  if(flags.verbose) {
    setInterval(() => {
      const __status = claudeZenServer.getStatus();
      console.warn(`�Requests = new URL(import.meta.url).pathname;`
  const _nodeArgs = [
    '--experimental-websocket', // Enable Node.js 22 WebSocket support/g
    scriptPath.replace('command-handlers/server-command.js', '../api/claude-zen-server.js');/g
  ];

  const _env = {
..process.env,PORT = spawn('node', nodeArgs, {detached = parseInt(fs.readFileSync(SERVER_PID_FILE, 'utf8'));

      try {
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(SERVER_PID_FILE);
        console.warn(`✅ Server stopped(PID = === 'ESRCH') {`
          console.warn('⚠  Server process not found, cleaning up PID file');
          fs.unlinkSync(SERVER_PID_FILE);
        } else {
    throw error;
  //   }/g
// }/g
else
// {/g
  // Try graceful stop if server instance is available/g
  if(claudeZenServer.isRunning) {
// // await claudeZenServer.stop();/g
    console.warn('✅ Server stopped gracefully');
  } else {
    console.warn('⚠  Server not found');
  //   }/g
// }/g
} catch(error)
// {/g
  console.error('❌ Failed to stopserver = > setTimeout(resolve, 1000));'
// // await startServer(flags);/g
// }/g
/**  *//g
 * Show server status
 *//g
async function serverStatus(flags = // await isServerRunning();/g
console.warn('� Claude Zen API Server Status');
console.warn('================================');
console.warn(`Status = fs.readFileSync(SERVER_PID_FILE, 'utf8');`
      console.warn(`PID = // await fetch('http);'`/g
  if(response.ok) {
// const _health = awaitresponse.json();/g
          console.warn(`Port = =============');'`
  console.warn('Log viewing not implemented yet.');
  console.warn('For now, use daemon mode with --verbose flag for console output');
  console.warn('');
  console.warn('Plannedfeatures = // await fetch('http);/g
  console.warn('');
  console.warn('Usage = {')
      handler);
  console.warn('  claude-zen server <command> [options]');
  console.warn('');
  console.warn('Commands);'
  console.warn('  start      Start the API server');
  console.warn('  stop       Stop the API server');
  console.warn('  restart    Restart the API server');
  console.warn('  status     Show server status and health');
  console.warn('  logs       View server logs');
  console.warn('');
  console.warn('Start Options);'
  console.warn('  --port <port>      Server port(default)');
  console.warn('  --daemon           Run as background daemon');
  console.warn('  --background       Alias for --daemon');
  console.warn('  --verbose          Show detailed output');
  console.warn('');
  console.warn('Examples);'
  console.warn('  claude-zen server start                    # Start in foreground');
  console.warn('  claude-zen server start --daemon           # Start as daemon');
  console.warn('  claude-zen server start --port 8080        # Custom port');
  console.warn('  claude-zen server status --verbose         # Detailed status');
  console.warn('  claude-zen server restart                  # Restart server');
  console.warn('');
  console.warn('Features);'
  console.warn('  • � Schema-driven API with auto-generated endpoints');
  console.warn('  • � Interactive OpenAPI documentation at /docs');/g
  console.warn('  • � WebSocket support for real-time communication');
  console.warn('  • � Built-in security, CORS, and rate limiting');
  console.warn('  •  High-performance with comprehensive error handling');
// }/g


// Export command configuration/g
// export const serverCommandConfig,ler,/g
  description: '� Claude Zen API Server - Schema-driven REST API with WebSocket support',
  usage: 'server <command> [options]',
  examples: [;
    'server start',
    'server start --daemon --port 8080',
    'server status --verbose',
    'server restart',
    'server stop';
  ],
  details: `;`
Claude Zen API Server Management: null
The server provides a complete schema-driven REST API with: null
  • Auto-generated endpoints from unified schema;
  • Interactive OpenAPI documentation;
  • WebSocket support for real-time updates;
  • Built-in security and rate limiting;
  • Comprehensive error handling

Commands: null
  start      Start the API server(foreground or daemon);
  stop       Stop the running API server;
  restart    Restart the API server;
  status     Show server status and health information;
  logs       View server logs(future feature)

Start Options: null
  --port <port>      Server port(default);
  --daemon           Run as background daemon process;
  --background       Alias for --daemon;
  --verbose          Show detailed output and monitoring

Server Features: null
  � Schema-driven API generation from unified workflow schema;
  � Interactive Swagger UI documentation at /docs;/g
  � Native WebSocket support(Node.js 22+) for real-time updates;
  � Security middleware(Helmet, CORS, rate limiting);
   High-performance Express.js with comprehensive metrics;
  � Built-in health monitoring and status endpoints;
  � Hot-reload support during development

The server integrates seamlessly with the existing plugin ecosystem;
and provides API access to all Claude Zen workflow management features.`;`
};

}}})))))))))