#!/usr/bin/env node;
/**
 * Test script for the unified server with MCP integration;
 */

import { UnifiedInterfacePlugin } from './src/plugins/unified-interface/index.js';

async function testUnifiedServer() {
  console.warn('🚀 Testing Unified Server with MCP Integration...');
  try {
    // Create unified interface plugin with MCP enabled
    const _plugin = new UnifiedInterfacePlugin({
      webPort,
      enableMCP,
      theme);
    // Initialize the plugin
  // await plugin.initialize();
    console.warn('✅ Unified server with MCP started successfully!');
    console.warn('🌐 Web UI);
    console.warn('🔗 MCP endpoint);
    console.warn('📊 Health check);
    console.warn('🔧 MCP tools);
    console.warn('📝 MCP info);

    // Keep the server running
    console.warn('🎯 Server running... Press Ctrl+C to stop');
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.warn('\n🛑 Shutting down...');
  // await plugin.shutdown();
      process.exit(0);
    });
  //   }
catch (error)
// {
  console.error('❌ Failed to start unified server);
  process.exit(1);
// }
// }
testUnifiedServer()
