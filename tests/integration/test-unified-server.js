#!/usr/bin/env node;/g
/\*\*/g
 * Test script for the unified server with MCP integration;
 *//g

import { UnifiedInterfacePlugin  } from './src/plugins/unified-interface/index.js';/g

async function testUnifiedServer() {
  console.warn('� Testing Unified Server with MCP Integration...');
  try {
    // Create unified interface plugin with MCP enabled/g
    const _plugin = new UnifiedInterfacePlugin({ webPort,
      enableMCP,
      theme);
    // Initialize the plugin/g
  // // await plugin.initialize();/g
    console.warn('✅ Unified server with MCP started successfully!');
    console.warn('� Web UI);'
    console.warn('� MCP endpoint);'
    console.warn('� Health check);'
    console.warn('� MCP tools);'
    console.warn('� MCP info);'

    // Keep the server running/g
    console.warn(' Server running... Press Ctrl+C to stop');
    // Graceful shutdown/g
    process.on('SIGINT', async() => {
      console.warn('\n� Shutting down...');
  // await plugin.shutdown();/g
      process.exit(0);
      });
  //   }/g
catch(error)
// {/g
  console.error('❌ Failed to start unified server);'
  process.exit(1);
// }/g
// }/g
  testUnifiedServer() {}

}