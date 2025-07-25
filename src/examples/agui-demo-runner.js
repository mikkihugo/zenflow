#!/usr/bin/env node
/**
 * 🚀 AG-UI Demo Runner for Claude Code Zen
 * 
 * Demonstrates the AG-UI protocol integration
 * Run with: node agui-demo-runner.js
 */

import { runAGUIDemo } from './agui-demo.js';
import { ClaudeZenServer } from '../api/claude-zen-server.js';

async function main() {
  console.log('🌟 AG-UI Protocol Integration Demo for Claude Code Zen');
  console.log('=' .repeat(60));
  
  try {
    // Option 1: Standalone demo
    if (process.argv.includes('--standalone')) {
      console.log('Running standalone AG-UI demo...\n');
      const demo = await runAGUIDemo();
      console.log('\n🎯 Demo completed! Check the event logs above.');
      return;
    }
    
    // Option 2: Demo with server integration
    console.log('Starting Claude Code Zen server with AG-UI integration...\n');
    
    const server = new ClaudeZenServer({ port: 4001 });
    
    // Start server
    await server.start();
    
    // Wait a moment for WebSocket setup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run demo
    console.log('\n🚀 Running AG-UI demo with live server...');
    const demo = await runAGUIDemo();
    
    // Show server stats
    console.log('\n📊 Server Status:');
    console.log(server.getStatus());
    
    if (server.aguiMiddleware) {
      console.log('\n📊 AG-UI Middleware Stats:');
      console.log(server.aguiMiddleware.getStats());
    }
    
    console.log('\n✅ Demo completed! Server is still running...');
    console.log('🌐 Visit http://localhost:4001/agui/status for AG-UI status');
    console.log('🔗 WebSocket endpoint: ws://localhost:4001/ws');
    console.log('\nPress Ctrl+C to stop the server');
    
    // Keep server running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping server...');
      await server.stop();
      console.log('✅ Server stopped');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}