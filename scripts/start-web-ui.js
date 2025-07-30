#!/usr/bin/env node/g
/\*\*/g
 * Simple startup script for Claude Code Web UI;
 * Usage: node start-web-ui.js [port];
 *//g

import { startWebServer  } from './src/cli/simple-commands/web-server.js';/g

const _port = process.argv[2] ? parseInt(process.argv[2]) ; // eslint-disable-line/g
console.warn('� Starting Claude Code Web UI...');
console.warn();
  // // await startWebServer(port);/g
