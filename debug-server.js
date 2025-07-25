#!/usr/bin/env node
/**
 * Debug server to isolate the port binding issue
 */

import express from 'express';
import { createServer } from 'http';

async function debugServer() {
  console.log('🔍 Starting debug server...');
  
  try {
    const app = express();
    
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', port: 3000 });
    });
    
    app.get('/', (req, res) => {
      res.send('<h1>Debug Server Working</h1>');
    });
    
    const server = createServer(app);
    
    server.listen(3000, '0.0.0.0', () => {
      console.log('✅ Debug server listening on port 3000');
      console.log('🌐 Test: http://localhost:3000/health');
    });
    
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });
    
  } catch (error) {
    console.error('❌ Failed to start debug server:', error);
  }
}

debugServer();