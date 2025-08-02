#!/usr/bin/env node

/** Simple startup script for Claude Code Web UI */
/** Usage: node start-web-ui.js [port] */

import { startWebServer } from '../src/interfaces/web/web-interface.js';

const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;

console.warn('🚀 Starting Claude Code Web UI...');
console.warn(`🌐 Server will be available at http://localhost:${port}`);

async function main() {
  try {
    await startWebServer(port);
    console.warn('✅ Web UI started successfully');
  } catch (error) {
    console.error('❌ Failed to start Web UI:', error.message);
    process.exit(1);
  }
}

main();
