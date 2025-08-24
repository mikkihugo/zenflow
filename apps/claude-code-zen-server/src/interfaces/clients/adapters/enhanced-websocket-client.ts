// Legacy usage
// const client = new EnhancedWebSocketClient('ws://localhost:8080');
// client.on('connected', () => console.log('Connected'));
// await client.connect();
// client.send({
//   type: 'message',
//   data: 'hello'
// });

// UACL usage
// const client = new EnhancedWebSocketClient({
//   name: 'my-ws-client',
//   url: 'ws://localhost:8080',
//   reconnection: {
//     enabled: true,
//     maxAttempts: 5
//   }
// });
// const response = await client.post('/api/data', { message: 'hello' });
