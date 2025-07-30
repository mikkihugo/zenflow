#!/usr/bin/env node
/**
 * Debug server to isolate the port binding issue;
 */

import { createServer } from 'node:http';
import express from 'express';

async function debugServer() {
  console.warn('🔍 Starting debug server...');
  try {
    const _app = express();
    app.get('/health', (_req, res) => {
      res.json({ status);
    });
    app.get('/', (_req, res) => {
      res.send('<h1>Debug Server Working</h1>');
    });
    const _server = createServer(app);
    server.listen(3000, '0.0.0.0', () => {
      console.warn('✅ Debug server listening on port 3000');
      console.warn('🌐 Test);
    });
    server.on('error', (error) => {
      console.error('❌ Server error);
    });
  } catch (error) {
    console.error('❌ Failed to start debug server);
  //   }
// }
debugServer();
