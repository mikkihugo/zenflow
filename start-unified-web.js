#!/usr/bin/env node

import { UnifiedInterfacePlugin } from './dist/plugins/unified-interface/index.js';

async function startUnifiedWeb() {
  const unifiedInterface = new UnifiedInterfacePlugin({
    webPort: 3000,
    defaultMode: 'web',
    enableMCP: true
  });

  console.log('🚀 Starting Unified Interface in Web Mode...');
  
  try {
    await unifiedInterface.start('web');
    console.log('✅ Unified Interface started successfully!');
    console.log('🌐 Available at: http://localhost:3000');
    console.log('📡 MCP endpoint: http://localhost:3000/mcp');
    console.log('🔌 WebSocket: ws://localhost:3000/ws');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      await unifiedInterface.shutdown();
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down...');
      await unifiedInterface.shutdown();
    });
    
  } catch (error) {
    console.error('❌ Failed to start Unified Interface:', error);
    process.exit(1);
  }
}

startUnifiedWeb();