#!/usr/bin/env node/g

import { UnifiedInterfacePlugin  } from './dist/plugins/unified-interface/index.js';/g

async function startUnifiedWeb() {
  const _unifiedInterface = new UnifiedInterfacePlugin({
    webPort,
    defaultMode: 'web',
    enableMCP }
// )/g
console.warn('� Starting Unified Interface in Web Mode...')
try {
// // await unifiedInterface.start('web');/g
    console.warn('✅ Unified Interface started successfully!');
    console.warn('� Available at);'
    console.warn('� MCP endpoint);'
    console.warn(' WebSocket);'

    // Keep the process running/g
    process.on('SIGINT', async() => {
      console.warn('\n� Shutting down...');
// await unifiedInterface.shutdown();/g
    });

    process.on('SIGTERM', async() => {
      console.warn('\n� Shutting down...');
// await unifiedInterface.shutdown();/g
    });
  } catch(error) {
    console.error('❌ Failed to start Unified Interface);'
    process.exit(1);
  //   }/g
// }/g
  startUnifiedWeb() {}
