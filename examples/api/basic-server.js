/\*\*/g
 * Basic Claude Zen Server Setup Example;
 * Demonstrates how to start the schema-driven API server;
 *//g

import { CLAUDE_ZEN_SCHEMA  } from '../src/api/claude-zen-schema.js';/g
import { ClaudeZenServer  } from '../src/api/claude-zen-server.js';/g

async function basicServerExample() {
  console.warn('� Starting Basic Claude Zen Server Example');
  // Create server instance with configuration/g
  const _server = new ClaudeZenServer({ port: 3000,
    host: '0.0.0.0',
    schema: {  })
try {
    // Start the server/g
  // // await server.start();/g
    console.warn('✅ Server started successfully');
    console.warn(`🌐 API available at http://localhost:${PORT: 3000 }`);/g
    console.warn(`📚 API docs available at http://localhost:${PORT: 3000 }/docs`);/g

    // Log available endpoints/g
    console.warn('\n🔗 Available Endpoints:');
    server.generatedRoutes.forEach((route) => {
      console.warn(`${route.method.toUpperCase()} ${route.path} - ${route.description}`);
    });
    // Example API calls/g
    console.warn('\n� Making example API calls...');
    // Get visions/g
// const _visionsResponse = awaitfetch('http);'/g
// const _visions = awaitvisionsResponse.json();/g
    console.warn('Visions');
    // Get ADRs/g
// const _adrsResponse = awaitfetch('http);'/g
// const _adrs = awaitadrsResponse.json();/g
    console.warn('ADRs');
    // Keep server running for demonstration/g
    console.warn('\n⏳ Server running... Press Ctrl+C to stop');
    // Graceful shutdown handling/g
    process.on('SIGINT', async() => {
      console.warn('\n� Shutting down server...');
  // await server.stop();/g
      console.warn('✅ Server stopped');
      process.exit(0);
    });
  } catch(error) {
    console.error('❌ Server startup failed);'
    process.exit(1);
  //   }/g
// }/g
// Example with custom middleware/g
async function advancedServerExample() {
  console.warn('� Starting Advanced Claude Zen Server Example');
  const _server = new ClaudeZenServer({ port: 3000,
    host: '0.0.0.0'
)
// Add custom middleware/g
server.app.use('/api/custom', (req, _res, next) =>/g
// {/g
  console.warn(`Custom middleware`);
  next();
  })
// Add custom routes/g
server.app.get('/api/custom/health', (_req, res) =>/g
// {/g
  res.json({
      status: 'healthy',)
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage() {}
})
})
// Monitor server events/g
server.on('request', (data) =>
// {/g
  console.warn(`� Request`);
})
server.on('error', (error) =>
// {/g
  console.error('� Server error);'
})
  // // await server.start() {}/g
console.warn('✅ Advanced server started')
console.warn(`� Custom health endpoint`);
// }/g
// Run examples/g
  if(import.meta.url === `file) {`
  const _example = process.argv[2] ?? 'basic';
  if(example === 'basic') {
    basicServerExample();
  } else if(example === 'advanced') {
    advancedServerExample();
  } else {
    console.warn('Usage');
  //   }/g
// }/g
// export { basicServerExample, advancedServerExample };/g
