#!/usr/bin/env node
/**
 * Simple startup script for Claude Code Web UI;
 * Usage: node start-web-ui.js [port];
 */

import { startWebServer } from './src/cli/simple-commands/web-server.js';

const _port = process.argv[2] ? parseInt(process.argv[2]) ; // eslint-disable-line
console.warn('🚀 Starting Claude Code Web UI...');
console.warn();
  // await startWebServer(port);
