#!/usr/bin/env node;
/**
 * PRODUCTION CLAUDE ZEN UNIFIED SERVER;
 * The real production server - starts unified interface with MCP + WebSocket;
 */

import { UnifiedInterfacePlugin } from './src/plugins/unified-interface/index.js';

async function startProductionServer() {
  console.warn('� CLAUDE ZEN PRODUCTION SERVER STARTING...');

  try {
    // Create the unified interface plugin (this IS the production server)
    const _server = new UnifiedInterfacePlugin({
      webPort,
      enableMCP,
      theme);

    // Initialize - this starts web UI, MCP server, and WebSocket
// // await server.initialize();
    console.warn('✅ PRODUCTION SERVER READY!');
    console.warn('� Web UI);'
    console.warn('� MCP Server);'
    console.warn('� WebSocket);'
    console.warn('� Health);'
    console.warn('');
    console.warn(' This is the REAL production server');
    console.warn('⏰ Server will stay alive... Press Ctrl+C to stop');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.warn('\n� Shutting down production server...');
// await server.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.warn('\n� Terminating production server...');
// await server.shutdown();
      process.exit(0);
    });
  //   }
catch (error)
// {
  console.error('❌ PRODUCTION SERVER FAILED);'
  if (error.stack) {
    console.error('Stack);'
  //   }
  process.exit(1);
// }
// }
// Start the production server
startProductionServer() {}

}