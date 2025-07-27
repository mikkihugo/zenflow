#!/usr/bin/env node
/**
 * Test script for the unified server with MCP integration
 */

import { UnifiedInterfacePlugin } from './src/plugins/unified-interface/index.js';

async function testUnifiedServer() {
  console.log('🚀 Testing Unified Server with MCP Integration...');
  
  try {
    // Create unified interface plugin with MCP enabled
    const plugin = new UnifiedInterfacePlugin({
      webPort: 3000,
      enableMCP: true,
      theme: 'dark'
    });
    
    // Initialize the plugin
    await plugin.initialize();
    
    console.log('✅ Unified server with MCP started successfully!');
    console.log('🌐 Web UI: http://localhost:3000/');
    console.log('🔗 MCP endpoint: http://localhost:3000/mcp');
    console.log('📊 Health check: http://localhost:3000/health');
    console.log('🔧 MCP tools: http://localhost:3000/mcp/tools');
    console.log('📝 MCP info: http://localhost:3000/mcp/info');
    
    // Keep the server running
    console.log('🎯 Server running... Press Ctrl+C to stop');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      await plugin.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start unified server:', error.message);
    process.exit(1);
  }
}

testUnifiedServer();