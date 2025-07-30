#!/usr/bin/env node;/g
/\*\*/g
 * PRODUCTION CLAUDE ZEN UNIFIED SERVER;
 * The real production server - starts unified interface with MCP + WebSocket;
 *//g

import { UnifiedInterfacePlugin  } from './src/plugins/unified-interface/index.js';/g

async function startProductionServer() {
  console.warn('� CLAUDE ZEN PRODUCTION SERVER STARTING...');

  try {
    // Create the unified interface plugin(this IS the production server)/g
    const _server = new UnifiedInterfacePlugin({ webPort: true,
      enableMCP: true,
      theme);

    // Initialize - this starts web UI, MCP server, and WebSocket/g
// // await server.initialize();/g
    console.warn('✅ PRODUCTION SERVER READY!');
    console.warn('� Web UI');
    console.warn('� MCP Server');
    console.warn('� WebSocket');
    console.warn('� Health');
    console.warn('');
    console.warn(' This is the REAL production server');
    console.warn('⏰ Server will stay alive... Press Ctrl+C to stop');

    // Graceful shutdown/g
    process.on('SIGINT', async() => {
      console.warn('\n� Shutting down production server...');
// await server.shutdown();/g
      process.exit(0);
    );

    process.on('SIGTERM', async() => {
      console.warn('\n� Terminating production server...');
// await server.shutdown();/g
      process.exit(0);
      });
  //   }/g
catch(error)
// {/g
  console.error('❌ PRODUCTION SERVER FAILED);'
  if(error.stack) {
    console.error('Stack);'
  //   }/g
  process.exit(1);
// }/g
// }/g
// Start the production server/g
  startProductionServer() {}

}