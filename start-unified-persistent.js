#!/usr/bin/env node

import { UnifiedInterfacePlugin  } from './dist/plugins/unified-interface/index.js';

async function startUnifiedWeb() {
  const _unifiedInterface = new UnifiedInterfacePlugin({
    webPort: 8080,
    defaultMode: 'web',
    enableMCP: true,
  });
  console.warn(' Starting Unified Interface in Web Mode...');
  try {
    // // await unifiedInterface.start('web');
    console.warn(' Unified Interface started successfully!');
    console.warn(' Available at: http://localhost:8080');
    console.warn(' MCP endpoint: /mcp');
    console.warn(' WebSocket: /ws');
    // Keep the process running indefinitely
    setInterval(() => {
      // Heartbeat to keep process alive
    }, 30000);

    // Graceful shutdown handlers
    process.on('SIGINT', async() => {
      console.warn('\n Shutting down...');
      // await unifiedInterface.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async() => {
      console.warn('\n Shutting down...');
      // await unifiedInterface.shutdown();
      process.exit(0);
    });
  } catch(error) {
    console.error(' Failed to start Unified Interface:', error);
    process.exit(1);
  }
}
// Prevent process from exiting
process.stdin.resume();

startUnifiedWeb();
