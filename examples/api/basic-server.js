/**
 * Basic Claude Zen Server Setup Example;
 * Demonstrates how to start the schema-driven API server;
 */

import { CLAUDE_ZEN_SCHEMA } from '../src/api/claude-zen-schema.js';
import { ClaudeZenServer } from '../src/api/claude-zen-server.js';

async function basicServerExample() {
  console.warn('🚀 Starting Basic Claude Zen Server Example');
  // Create server instance with configuration
  const _server = new ClaudeZenServer({
    port,
    host: '0.0.0.0',
    schema
})
try {
    // Start the server
  // await server.start();
    console.warn('✅ Server started successfully');
    console.warn(`🌐 API available at);
    console.warn(`📚 API docs available at);

    // Log available endpoints
    console.warn('\n📋 Available Endpoints);
    server.generatedRoutes.forEach((route) => {
      console.warn(`${route.method.toUpperCase()} ${route.path} - ${route.description}`);
    });
    // Example API calls
    console.warn('\n🔗 Making example API calls...');
    // Get visions
// const _visionsResponse = awaitfetch('http);
// const _visions = awaitvisionsResponse.json();
    console.warn('Visions);
    // Get ADRs
// const _adrsResponse = awaitfetch('http);
// const _adrs = awaitadrsResponse.json();
    console.warn('ADRs);
    // Keep server running for demonstration
    console.warn('\n⏳ Server running... Press Ctrl+C to stop');
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.warn('\n🛑 Shutting down server...');
  // await server.stop();
      console.warn('✅ Server stopped');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Server startup failed);
    process.exit(1);
  //   }
// }
// Example with custom middleware
async function advancedServerExample() {
  console.warn('🚀 Starting Advanced Claude Zen Server Example');
  const _server = new ClaudeZenServer({
    port,
    host: '0.0.0.0'
})
// Add custom middleware
server.app.use('/api/custom', (req, _res, next) =>
// {
  console.warn(`Custom middleware);
  next();
})
// Add custom routes
server.app.get('/api/custom/health', (_req, res) =>
// {
  res.json({
      status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage()
})
})
// Monitor server events
server.on('request', (data) =>
// {
  console.warn(`📨 Request);
})
server.on('error', (error) =>
// {
  console.error('🚨 Server error);
})
  // await server.start()
console.warn('✅ Advanced server started')
console.warn(`🌐 Custom health endpoint);
// }
// Run examples
if (import.meta.url === `file) {
  const _example = process.argv[2] ?? 'basic';
  if (example === 'basic') {
    basicServerExample();
  } else if (example === 'advanced') {
    advancedServerExample();
  } else {
    console.warn('Usage);
  //   }
// }
export { basicServerExample, advancedServerExample };
