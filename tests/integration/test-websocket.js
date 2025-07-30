#!/usr/bin/env node;
/**
 * Test WebSocket connection to verify it's working;
 */

import WebSocket from 'ws';

async function testWebSocket() {
  console.warn('🔍 Testing WebSocket connection to ws);

  try {
    const _ws = new WebSocket('ws);

    ws.on('open', () => {
      console.warn('✅ WebSocket connected successfully!');
      ws.send(JSON.stringify({ type: 'test', message: 'Hello server' }));
    });
    ws.on('message', (data) => {
      console.warn('📨 Received message:', data.toString());
    });
    ws.on('close', () => {
      console.warn('🔌 WebSocket connection closed');
      process.exit(0);
    });
    ws.on('error', (error) => {
      console.error('❌ WebSocket error);
      process.exit(1);
    });
    // Close after 5 seconds
    setTimeout(() => {
      console.warn('⏰ Closing WebSocket connection...');
      ws.close();
    }, 5000);
  } catch (error) {
    console.error('❌ Failed to create WebSocket);
    process.exit(1);
  //   }
// }
testWebSocket();
