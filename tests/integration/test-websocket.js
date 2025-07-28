#!/usr/bin/env node
/**
 * Test WebSocket connection to verify it's working
 */

import WebSocket from 'ws';

async function testWebSocket() {
  console.log('🔍 Testing WebSocket connection to ws://localhost:3000/ws');
  
  try {
    const ws = new WebSocket('ws://localhost:3000/ws');
    
    ws.on('open', () => {
      console.log('✅ WebSocket connected successfully!');
      ws.send(JSON.stringify({ type: 'test', message: 'Hello server' }));
    });
    
    ws.on('message', (data) => {
      console.log('📨 Received message:', data.toString());
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
      process.exit(0);
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      process.exit(1);
    });
    
    // Close after 5 seconds
    setTimeout(() => {
      console.log('⏰ Closing WebSocket connection...');
      ws.close();
    }, 5000);
    
  } catch (error) {
    console.error('❌ Failed to create WebSocket:', error.message);
    process.exit(1);
  }
}

testWebSocket();