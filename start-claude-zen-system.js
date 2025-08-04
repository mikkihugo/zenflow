#!/usr/bin/env node

import { WebInterfaceServer } from './src/interfaces/web/WebInterfaceServer.ts';

async function startClaudeZenSystem() {
  // Start the comprehensive Claude Zen system
  const webInterface = new WebInterfaceServer({
    port: 3000,
    host: '0.0.0.0',
    daemon: false,
    cors: true,
    realTime: true,
  });

  console.warn('🚀 Starting Claude Zen Complete System...');
  console.warn('🧠 Initializing AI-driven development platform...');

  try {
    // Start web interface (includes API, MCP, WebSocket)
    await webInterface.start();

    console.warn('✅ Claude Zen System started successfully!');
    console.warn('🌐 System available at: http://localhost:3000');
    console.warn('');
    console.warn('📍 HTTP interfaces (all on port 3000):');
    console.warn('   📊 Web Dashboard: http://localhost:3000/');
    console.warn('   🔗 REST API: http://localhost:3000/api');
    console.warn('   📡 HTTP MCP: http://localhost:3000/mcp (Claude Desktop)');
    console.warn('   ⚡ WebSocket: Real-time updates enabled');
    console.warn('');
    console.warn('🐝 Swarm coordination:');
    console.warn('   📡 Stdio MCP: Started dynamically by Claude Code when needed');
    console.warn('');
    console.warn('🎯 Features ready:');
    console.warn('   🐝 Swarm orchestration & agent management');
    console.warn('   🧠 Neural network optimization');
    console.warn('   📋 Document-driven development workflows');
    console.warn('   🔄 Real-time collaboration & monitoring');
    console.warn('   🛠️ Advanced CLI & development tools');
    // Keep the process running indefinitely
    setInterval(() => {
      // Heartbeat to keep process alive
    }, 30000);

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      console.warn('\n🛑 Shutting down Claude Zen System...');
      await webInterface.stop();
      console.warn('✅ Claude Zen System stopped gracefully');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.warn('\n🛑 Shutting down Claude Zen System...');
      await webInterface.stop();
      console.warn('✅ Claude Zen System stopped gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start Claude Zen System:', error);
    console.error('Please check the error details above and try again.');
    process.exit(1);
  }
}

// Prevent process from exiting
process.stdin.resume();

console.warn('🌟 Claude Zen v2.0.0-alpha.73 - AI-Driven Development Platform');
console.warn('📖 Documentation: https://github.com/mikkihugo/claude-code-zen');
console.warn('');

startClaudeZenSystem();
