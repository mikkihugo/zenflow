/**
 * Basic Claude Zen Server Setup Example
 * Demonstrates how to start the schema-driven API server
 */

import { ClaudeZenServer } from '../src/api/claude-zen-server.js';
import { CLAUDE_ZEN_SCHEMA } from '../src/api/claude-zen-schema.js';

async function basicServerExample() {
  console.log('🚀 Starting Basic Claude Zen Server Example');

  // Create server instance with configuration
  const server = new ClaudeZenServer({
    port: 3001,
    host: '0.0.0.0',
    schema: CLAUDE_ZEN_SCHEMA
  });

  try {
    // Start the server
    await server.start();
    console.log('✅ Server started successfully');
    console.log(`🌐 API available at: http://localhost:3001`);
    console.log(`📚 API docs available at: http://localhost:3001/api/docs`);

    // Log available endpoints
    console.log('\n📋 Available Endpoints:');
    server.generatedRoutes.forEach(route => {
      console.log(`  ${route.method.toUpperCase()} ${route.path} - ${route.description}`);
    });

    // Example API calls
    console.log('\n🔗 Making example API calls...');
    
    // Get visions
    const visionsResponse = await fetch('http://localhost:3001/api/v1/visions');
    const visions = await visionsResponse.json();
    console.log('Visions:', visions);

    // Get ADRs
    const adrsResponse = await fetch('http://localhost:3001/api/adrs');
    const adrs = await adrsResponse.json();
    console.log('ADRs:', adrs);

    // Keep server running for demonstration
    console.log('\n⏳ Server running... Press Ctrl+C to stop');
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server...');
      await server.stop();
      console.log('✅ Server stopped');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Example with custom middleware
async function advancedServerExample() {
  console.log('🚀 Starting Advanced Claude Zen Server Example');

  const server = new ClaudeZenServer({
    port: 3002,
    host: '0.0.0.0'
  });

  // Add custom middleware
  server.app.use('/api/custom', (req, res, next) => {
    console.log(`Custom middleware: ${req.method} ${req.path}`);
    next();
  });

  // Add custom routes
  server.app.get('/api/custom/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });

  // Monitor server events
  server.on('request', (data) => {
    console.log(`📨 Request: ${data.method} ${data.path}`);
  });

  server.on('error', (error) => {
    console.error('🚨 Server error:', error);
  });

  await server.start();
  console.log('✅ Advanced server started');
  console.log(`🌐 Custom health endpoint: http://localhost:3002/api/custom/health`);
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = process.argv[2] || 'basic';
  
  if (example === 'basic') {
    basicServerExample();
  } else if (example === 'advanced') {
    advancedServerExample();
  } else {
    console.log('Usage: node basic-server.js [basic|advanced]');
  }
}

export { basicServerExample, advancedServerExample };