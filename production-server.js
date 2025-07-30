#!/usr/bin/env node
/**
 * PRODUCTION CLAUDE ZEN UNIFIED SERVER
 * The real production server - starts unified interface with MCP + WebSocket
 */

import { UnifiedInterfacePlugin } from './src/plugins/unified-interface/index.js';

async function startProductionServer() {
  console.warn('🚀 CLAUDE ZEN PRODUCTION SERVER STARTING...');

  try {
    // Create the unified interface plugin (this IS the production server)
    const server = new UnifiedInterfacePlugin({
      webPort: 3000,
      enableMCP: true,
      theme: 'dark',
      daemonMode: false, // Keep alive in foreground
    });

    // Initialize - this starts web UI, MCP server, and WebSocket
    await server.initialize();

    console.warn('✅ PRODUCTION SERVER READY!');
    console.warn('🌐 Web UI: http://localhost:3000/');
    console.warn('🔗 MCP Server: http://localhost:3000/mcp');
    console.warn('📡 WebSocket: ws://localhost:3000/ws');
    console.warn('📊 Health: http://localhost:3000/health');
    console.warn('');
    console.warn('🎯 This is the REAL production server');
    console.warn('⏰ Server will stay alive... Press Ctrl+C to stop');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.warn('\n🛑 Shutting down production server...');
      await server.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.warn('\n🛑 Terminating production server...');
      await server.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ PRODUCTION SERVER FAILED:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Start the production server
startProductionServer();
