#!/usr/bin/env node
/**
 * PRODUCTION CLAUDE ZEN UNIFIED SERVER
 * The real production server - starts unified interface with MCP + WebSocket
 */

import { UnifiedInterfacePlugin } from './src/plugins/unified-interface/index.js';

async function startProductionServer() {
  console.log('🚀 CLAUDE ZEN PRODUCTION SERVER STARTING...');
  
  try {
    // Create the unified interface plugin (this IS the production server)
    const server = new UnifiedInterfacePlugin({
      webPort: 3000,
      enableMCP: true,
      theme: 'dark',
      daemonMode: false // Keep alive in foreground
    });
    
    // Initialize - this starts web UI, MCP server, and WebSocket
    await server.initialize();
    
    console.log('✅ PRODUCTION SERVER READY!');
    console.log('🌐 Web UI: http://localhost:3000/');
    console.log('🔗 MCP Server: http://localhost:3000/mcp');
    console.log('📡 WebSocket: ws://localhost:3000/ws');
    console.log('📊 Health: http://localhost:3000/health');
    console.log('');
    console.log('🎯 This is the REAL production server');
    console.log('⏰ Server will stay alive... Press Ctrl+C to stop');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down production server...');
      await server.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Terminating production server...');
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