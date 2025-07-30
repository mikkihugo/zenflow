#!/usr/bin/env node;
/**
 * Test script for the unified server with MCP integration;
 */

import { UnifiedInterfacePlugin } from './src/plugins/unified-interface/index.js';

async function testUnifiedServer(): unknown {
  console.warn('🚀 Testing Unified Server with MCP Integration...');
;
  try {
    // Create unified interface plugin with MCP enabled
    const _plugin = new UnifiedInterfacePlugin({
      webPort: 3000,;
      enableMCP: true,;
      theme: 'dark',;
    });
;
    // Initialize the plugin
    await plugin.initialize();
;
    console.warn('✅ Unified server with MCP started successfully!');
    console.warn('🌐 Web UI: http://localhost:3000/');
    console.warn('🔗 MCP endpoint: http://localhost:3000/mcp');
    console.warn('📊 Health check: http://localhost:3000/health');
    console.warn('🔧 MCP tools: http://localhost:3000/mcp/tools');
    console.warn('📝 MCP info: http://localhost:3000/mcp/info');

    // Keep the server running
    console.warn('🎯 Server running... Press Ctrl+C to stop');
;
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.warn('\n🛑 Shutting down...');
      await plugin.shutdown();
      process.exit(0);
    });
  }
catch (/* error */)
{
  console.error('❌ Failed to start unified server:', error.message);
  process.exit(1);
}
}
testUnifiedServer()
