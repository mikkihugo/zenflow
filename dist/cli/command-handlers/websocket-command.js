/**
 * WebSocket Command Handler
 * CLI interface for WebSocket testing and management using Node.js 22 native WebSocket
 */

import { WebSocketService, checkWebSocketSupport } from '../../api/websocket-service.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';

/**
 * WebSocket command handler
 */
export async function websocketCommand(input, flags) {
  const subcommand = input[0];
  const subArgs = input.slice(1);

  if (flags.help || flags.h || !subcommand) {
    showWebSocketHelp();
    return;
  }

  switch (subcommand) {
    case 'test':
      await testWebSocket(subArgs, flags);
      break;
      
    case 'connect':
      await connectWebSocket(subArgs, flags);
      break;
      
    case 'status':
      await showWebSocketStatus(flags);
      break;
      
    case 'send':
      await sendWebSocketMessage(subArgs, flags);
      break;
      
    case 'monitor':
      await monitorWebSocket(subArgs, flags);
      break;
      
    case 'benchmark':
      await benchmarkWebSocket(subArgs, flags);
      break;
      
    case 'support':
      showWebSocketSupport();
      break;
      
    default:
      printError(`Unknown websocket command: ${subcommand}`);
      showWebSocketHelp();
  }
}

/**
 * Test WebSocket connectivity
 */
async function testWebSocket(args, flags) {
  const url = args[0] || `ws://localhost:${flags.port || 3000}/ws`;
  
  printInfo(`🧪 Testing WebSocket connection to: ${url}`);
  
  try {
    const service = await WebSocketService.create({
      clientHost: 'localhost',
      clientPort: flags.port || 3000
    });
    
    // Test connection
    const client = await service.connectToExternal('test', url, {
      reconnect: false,
      heartbeatInterval: flags.heartbeat || 5000
    });
    
    // Send test message
    const testMessage = {
      type: 'test',
      payload: {
        message: 'Hello from claude-zen WebSocket test',
        timestamp: Date.now(),
        nodeVersion: process.version
      }
    };
    
    client.send(JSON.stringify(testMessage));
    printSuccess('✅ Test message sent');
    
    // Listen for responses
    let responseReceived = false;
    
    client.on('message', (info) => {
      responseReceived = true;
      printSuccess(`📨 Response received: ${JSON.stringify(info.data, null, 2)}`);
    });
    
    // Wait for response or timeout
    await new Promise((resolve) => {
      setTimeout(() => {
        if (!responseReceived) {
          printWarning('⏰ No response received within timeout');
        }
        client.disconnect();
        service.shutdown();
        resolve();
      }, flags.timeout || 5000);
    });
    
  } catch (error) {
    printError(`❌ WebSocket test failed: ${error.message}`);
  }
}

/**
 * Connect to WebSocket and keep connection alive
 */
async function connectWebSocket(args, flags) {
  const url = args[0] || `ws://localhost:${flags.port || 3000}/ws`;
  const connectionName = flags.name || 'cli-connection';
  
  printInfo(`🔗 Connecting to WebSocket: ${url}`);
  
  try {
    const service = await WebSocketService.create({
      clientHost: 'localhost',
      clientPort: flags.port || 3000
    });
    
    const client = await service.connectToExternal(connectionName, url, {
      reconnect: flags.reconnect !== false,
      heartbeatInterval: flags.heartbeat || 30000
    });
    
    printSuccess(`✅ Connected as: ${connectionName}`);
    
    // Setup message handler
    client.on('message', (info) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 📨 ${JSON.stringify(info.data, null, 2)}`);
    });
    
    client.on('disconnected', (info) => {
      printWarning(`❌ Disconnected: ${info.reason} (${info.code})`);
    });
    
    client.on('reconnecting', (info) => {
      printInfo(`🔄 Reconnecting... attempt ${info.attempt}/${info.maxAttempts}`);
    });
    
    // Keep connection alive
    printInfo('📡 Connection active. Press Ctrl+C to disconnect.');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      printInfo('🔄 Disconnecting...');
      client.disconnect();
      service.shutdown();
      process.exit(0);
    });
    
    // Keep process alive
    await new Promise(() => {}); // Never resolves
    
  } catch (error) {
    printError(`❌ Connection failed: ${error.message}`);
  }
}

/**
 * Show WebSocket service status
 */
async function showWebSocketStatus(flags) {
  try {
    const service = await WebSocketService.create();
    const status = service.getStatus();
    
    printInfo('📊 WebSocket Service Status');
    console.log('━'.repeat(60));
    
    console.log(`🚀 Service Status: ${status.service.initialized ? 'Initialized' : 'Not Initialized'}`);
    console.log(`⏱️  Uptime: ${Math.round(status.service.uptime / 1000)}s`);
    console.log(`🔌 Total Connections: ${status.connections.totalConnections}`);
    console.log(`✅ Active Connections: ${status.connections.activeConnections}`);
    console.log(`📨 Messages Received: ${status.service.stats.messagesReceived}`);
    console.log(`📤 Messages Sent: ${status.service.stats.messagesSent}`);
    console.log(`❌ Errors: ${status.service.stats.errors}`);
    console.log(`🐍 Node.js Version: ${status.nodeJsVersion}`);
    console.log(`🆕 Native WebSocket: ${status.nativeWebSocketSupport ? '✅ Available' : '❌ Not Available'}`);
    
    if (flags.verbose) {
      console.log('\n📋 Message Handlers:');
      status.handlers.types.forEach(type => {
        console.log(`  • ${type}`);
      });
      
      console.log('\n🔗 Connections:');
      Object.entries(status.connections.connections).forEach(([name, conn]) => {
        console.log(`  • ${name}: ${conn.isConnected ? '✅ Connected' : '❌ Disconnected'} (${conn.url})`);
        if (flags.stats) {
          console.log(`    📊 Messages: ${conn.messagesReceived} received, ${conn.messagesSent} sent`);
          console.log(`    📈 Bytes: ${conn.bytesReceived} received, ${conn.bytesSent} sent`);
          console.log(`    🔄 Reconnections: ${conn.reconnections}`);
        }
      });
    }
    
    await service.shutdown();
    
  } catch (error) {
    printError(`❌ Failed to get status: ${error.message}`);
  }
}

/**
 * Send message via WebSocket
 */
async function sendWebSocketMessage(args, flags) {
  const message = args.join(' ');
  const url = flags.url || `ws://localhost:${flags.port || 3000}/ws`;
  
  if (!message) {
    printError('❌ Message content required');
    return;
  }
  
  try {
    const service = await WebSocketService.create();
    const client = await service.connectToExternal('send-client', url, {
      reconnect: false
    });
    
    let messageData;
    
    if (flags.json) {
      try {
        messageData = JSON.parse(message);
      } catch (error) {
        printError('❌ Invalid JSON message');
        return;
      }
    } else if (flags.type) {
      messageData = {
        type: flags.type,
        payload: message,
        timestamp: Date.now()
      };
    } else {
      messageData = message;
    }
    
    const success = client.send(messageData);
    
    if (success) {
      printSuccess(`✅ Message sent: ${JSON.stringify(messageData)}`);
    } else {
      printError('❌ Failed to send message');
    }
    
    // Wait a bit for any response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    client.disconnect();
    await service.shutdown();
    
  } catch (error) {
    printError(`❌ Send failed: ${error.message}`);
  }
}

/**
 * Monitor WebSocket connections
 */
async function monitorWebSocket(args, flags) {
  const urls = args.length > 0 ? args : [`ws://localhost:${flags.port || 3000}/ws`];
  
  printInfo(`📡 Monitoring WebSocket connections: ${urls.join(', ')}`);
  
  try {
    const service = await WebSocketService.create();
    
    // Connect to all URLs
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const name = `monitor-${i}`;
      
      try {
        await service.connectToExternal(name, url, {
          reconnect: true,
          heartbeatInterval: flags.heartbeat || 30000
        });
        printSuccess(`✅ Connected to ${url}`);
      } catch (error) {
        printError(`❌ Failed to connect to ${url}: ${error.message}`);
      }
    }
    
    // Setup monitoring
    service.on('message', (info) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 📨 ${info.connectionName}: ${JSON.stringify(info.data)}`);
    });
    
    service.on('clientConnected', (info) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ✅ Connected: ${info.name}`);
    });
    
    service.on('clientDisconnected', (info) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ❌ Disconnected: ${info.name} (${info.reason})`);
    });
    
    // Show periodic stats
    if (flags.stats) {
      setInterval(() => {
        const status = service.getStatus();
        console.log(`📊 Stats - Active: ${status.connections.activeConnections}, Messages: ${status.service.stats.messagesReceived} in, ${status.service.stats.messagesSent} out`);
      }, flags.interval || 10000);
    }
    
    printInfo('📡 Monitoring active. Press Ctrl+C to stop.');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      printInfo('🔄 Stopping monitor...');
      service.shutdown();
      process.exit(0);
    });
    
    // Keep process alive
    await new Promise(() => {});
    
  } catch (error) {
    printError(`❌ Monitor failed: ${error.message}`);
  }
}

/**
 * Benchmark WebSocket performance
 */
async function benchmarkWebSocket(args, flags) {
  const url = args[0] || `ws://localhost:${flags.port || 3000}/ws`;
  const messageCount = flags.messages || 1000;
  const concurrency = flags.concurrency || 1;
  const messageSize = flags.size || 100;
  
  printInfo(`🏃 Benchmarking WebSocket: ${url}`);
  printInfo(`📊 Configuration: ${messageCount} messages, ${concurrency} concurrent connections, ${messageSize} byte messages`);
  
  try {
    const service = await WebSocketService.create();
    const testMessage = 'x'.repeat(messageSize);
    
    const startTime = Date.now();
    let totalSent = 0;
    let totalReceived = 0;
    let errors = 0;
    
    // Create concurrent connections
    const connections = [];
    for (let i = 0; i < concurrency; i++) {
      try {
        const client = await service.connectToExternal(`bench-${i}`, url, {
          reconnect: false,
          heartbeatInterval: 0
        });
        
        client.on('message', () => {
          totalReceived++;
        });
        
        client.on('error', () => {
          errors++;
        });
        
        connections.push(client);
      } catch (error) {
        printError(`❌ Failed to create connection ${i}: ${error.message}`);
        errors++;
      }
    }
    
    printInfo(`✅ Created ${connections.length} connections`);
    
    // Send messages
    const messagesPerConnection = Math.floor(messageCount / connections.length);
    
    for (const client of connections) {
      for (let i = 0; i < messagesPerConnection; i++) {
        const success = client.send(testMessage);
        if (success) totalSent++;
      }
    }
    
    // Wait for responses
    await new Promise(resolve => setTimeout(resolve, flags.timeout || 10000));
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Calculate stats
    const messagesPerSecond = Math.round((totalSent / duration) * 1000);
    const responseRate = totalReceived > 0 ? Math.round((totalReceived / totalSent) * 100) : 0;
    const bytesPerSecond = Math.round((totalSent * messageSize / duration) * 1000);
    
    console.log('\n📊 Benchmark Results:');
    console.log('━'.repeat(40));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📤 Messages Sent: ${totalSent}`);
    console.log(`📨 Messages Received: ${totalReceived}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`🚀 Messages/sec: ${messagesPerSecond}`);
    console.log(`📈 Response Rate: ${responseRate}%`);
    console.log(`💾 Bytes/sec: ${bytesPerSecond}`);
    console.log(`🔌 Connections: ${connections.length}`);
    
    // Disconnect all
    connections.forEach(client => client.disconnect());
    await service.shutdown();
    
  } catch (error) {
    printError(`❌ Benchmark failed: ${error.message}`);
  }
}

/**
 * Show WebSocket support information
 */
function showWebSocketSupport() {
  const support = checkWebSocketSupport();
  
  printInfo('🔍 WebSocket Support Information');
  console.log('━'.repeat(60));
  
  console.log(`🐍 Node.js Version: ${support.nodeVersion}`);
  console.log(`🔢 Major Version: ${support.majorVersion}`);
  console.log(`🆕 Native WebSocket: ${support.hasNativeWebSocket ? '✅ Available' : '❌ Not Available'}`);
  console.log(`🧪 Experimental Support: ${support.supportsExperimentalWebSocket ? '✅ Yes' : '❌ No'}`);
  console.log(`💡 Recommendation: ${support.recommendation}`);
  
  if (support.supportsExperimentalWebSocket && !support.hasNativeWebSocket) {
    console.log('\n🔧 To enable native WebSocket support:');
    console.log('   node --experimental-websocket your-script.js');
    console.log('   or add to NODE_OPTIONS: --experimental-websocket');
  }
  
  console.log('\n📚 Features:');
  console.log('• Standards-compliant WebSocket client (RFC 6455)');
  console.log('• Automatic reconnection with exponential backoff');
  console.log('• Message queuing during disconnection');
  console.log('• Heartbeat/ping support');
  console.log('• Load balancing across multiple connections');
  console.log('• Real-time monitoring and statistics');
  console.log('• Integration with claude-zen services');
}

function showWebSocketHelp() {
  console.log(`
🌐 WEBSOCKET - Node.js 22 Native WebSocket Client & Server Management

USAGE:
  claude-zen websocket <command> [options]

COMMANDS:
  test [url]                Test WebSocket connectivity
  connect <url>             Connect and maintain WebSocket connection
  status                    Show WebSocket service status
  send <message>            Send message via WebSocket
  monitor [urls...]         Monitor multiple WebSocket connections
  benchmark [url]           Benchmark WebSocket performance
  support                   Show WebSocket support information

TEST OPTIONS:
  --port <port>            Server port (default: 3000)
  --heartbeat <ms>         Heartbeat interval (default: 5000)
  --timeout <ms>           Response timeout (default: 5000)

CONNECT OPTIONS:
  --name <name>            Connection name (default: cli-connection)
  --port <port>            Server port (default: 3000)
  --reconnect              Enable auto-reconnect (default: true)
  --heartbeat <ms>         Heartbeat interval (default: 30000)

SEND OPTIONS:
  --url <url>              WebSocket URL
  --port <port>            Server port (default: 3000)
  --type <type>            Message type for structured messages
  --json                   Parse message as JSON

MONITOR OPTIONS:
  --port <port>            Server port (default: 3000)
  --stats                  Show periodic statistics
  --interval <ms>          Stats interval (default: 10000)
  --heartbeat <ms>         Heartbeat interval (default: 30000)

BENCHMARK OPTIONS:
  --port <port>            Server port (default: 3000)
  --messages <count>       Number of messages (default: 1000)
  --concurrency <count>    Concurrent connections (default: 1)
  --size <bytes>           Message size in bytes (default: 100)
  --timeout <ms>           Benchmark timeout (default: 10000)

STATUS OPTIONS:
  --verbose                Show detailed information
  --stats                  Show connection statistics

EXAMPLES:
  claude-zen websocket support
  claude-zen websocket test ws://localhost:3000/ws
  claude-zen websocket connect ws://localhost:3000/ws --name my-client
  claude-zen websocket status --verbose --stats
  claude-zen websocket send "Hello WebSocket" --type greeting
  claude-zen websocket monitor ws://localhost:3000/ws --stats
  claude-zen websocket benchmark --messages 5000 --concurrency 10

NODE.JS 22 FEATURES:
  • Native WebSocket client (use --experimental-websocket flag)
  • Standards-compliant implementation (RFC 6455)
  • Better performance than external libraries
  • Built-in ping/pong support
  • Automatic connection management

INTEGRATION:
  • Real-time updates for claude-zen UI
  • Queen Council decision broadcasting
  • Swarm orchestration status updates
  • Neural network training progress
  • Memory operation notifications
`);
}

export default websocketCommand;