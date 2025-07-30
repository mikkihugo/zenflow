/**
 * WebSocket Command Handler
 * CLI interface for WebSocket testing and management using Node.js 22 native WebSocket
 */

import { WebSocketService } from '../../api/websocket-service.js';
import { printInfo, printSuccess, printWarning } from '../utils.js';

/**
 * WebSocket command handler
 */
export async function websocketCommand(input = input[0];
const subArgs = input.slice(1);

if (flags.help || flags.h || !subcommand) {
  showWebSocketHelp();
  return;
}

switch(subcommand) {
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
      break;default = args[0] || `ws = await WebSocketService.create({clientHost = await service.connectToExternal('test', url, {
      reconnect = {type = false;
    
    client.on('message', (info) => {
      responseReceived = true;
      printSuccess(`📨 Response received => {
      setTimeout(() => {
        if(!responseReceived) {
          printWarning('⏰ No response received within timeout');
        }
        client.disconnect();
        service.shutdown();
        resolve();
      }, flags.timeout || 5000);
    });
    
  } catch(error) {
    printError(`❌ WebSocket testfailed = args[0] || `ws = flags.name || 'cli-connection';
  
  printInfo(`🔗 Connecting toWebSocket = await WebSocketService.create({clientHost = await service.connectToExternal(connectionName, url, {reconnect = = false,
      heartbeatInterval => {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] 📨 ${JSON.stringify(info.data, null, 2)}`);
    });
    
    client.on('disconnected', (info) => {
      printWarning(`❌ Disconnected => {
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
    
  } catch(error) {
    printError(`❌ Connectionfailed = await WebSocketService.create();
    const _status = service.getStatus();
    
    printInfo('📊 WebSocket Service Status');
    console.warn('━'.repeat(60));
    
    console.warn(`🚀 Service Status => {
        console.warn(`  • ${type}`);
      });
      
      console.warn('\n🔗 Connections => {
        console.warn(`  • ${name}: ${conn.isConnected ? '✅ Connected' : '❌ Disconnected'} (${conn.url})`);
        if(flags.stats) {
          console.warn(`    📊Messages = args.join(' ');
  const _url = flags.url || `ws = await WebSocketService.create();
    const client = await service.connectToExternal('send-client', url, {reconnect = JSON.parse(message);
      } catch(error) {
        printError('❌ Invalid JSON message');
        return;
      }
    } else if(flags.type) {
      messageData = {type = message;
    }
    
    const success = client.send(messageData);
    
    if(success) {
      printSuccess(`✅ Messagesent = > setTimeout(resolve, 1000));
    
    client.disconnect();
    await service.shutdown();
    
  } catch(error) {
    printError(`❌ _Sendfailed = args.length > 0 ? args = await WebSocketService.create();
    
    // Connect to all URLs
    for(let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const name = `monitor-${i}`;
      
      try {
        await service.connectToExternal(name, url, {
          reconnect => {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] 📨 ${info.connectionName}: ${JSON.stringify(info.data)}`);
    });
    
    service.on('clientConnected', (_info) => {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] ✅ Connected => {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] ❌ Disconnected => {
        const _status = service.getStatus();
        console.warn(`📊 Stats - Active => {
      printInfo('🔄 Stopping monitor...');
      service.shutdown();
      process.exit(0);
    });
    
    // Keep process alive
    await new Promise(() => {});
    
  } catch(error) {
    printError(`❌ Monitorfailed = args[0] || `ws = flags.messages || 1000;
  const concurrency = flags.concurrency || 1;
  const messageSize = flags.size || 100;
  
  printInfo(`🏃 BenchmarkingWebSocket = await WebSocketService.create();
    const _testMessage = 'x'.repeat(messageSize);
    
    const _startTime = Date.now();
    const _totalSent = 0;
    const totalReceived = 0;
    let _errors = 0;
    
    // Create concurrent connections
    const connections = [];
    for(let i = 0; i < concurrency; i++) {
      try {
        const _client = await service.connectToExternal(`bench-${i}`, url, {
          reconnect => {
          totalReceived++;
        });
        
        client.on('error', () => {
          _errors++;
        });
        
        connections.push(client);
      } catch(error) 
        printError(`❌ Failed to create connection $i: $error.message`);
        errors++;
    }
    
    printInfo(`✅ Created $connections.lengthconnections`);
    
    // Send messages
    const messagesPerConnection = Math.floor(messageCount / connections.length);
    
    for(const client of connections) {
      for(let i = 0; i < messagesPerConnection; i++) {
        const success = client.send(testMessage);
        if (success) totalSent++;
      }
    }
    
    // Wait for responses
    await new Promise(resolve => setTimeout(resolve, flags.timeout || 10000));
    
    const endTime = Date.now();
    const _duration = endTime - startTime;
    
    // Calculate stats

    console.warn('\n📊 BenchmarkResults = > client.disconnect());
    await service.shutdown();
    
  } catch(error) {
    printError(`❌ _Benchmarkfailed = checkWebSocketSupport();
  
  printInfo('🔍 WebSocket Support Information');
  console.warn('━'.repeat(60));
  
  console.warn(`🐍 Node.js Version: ${support.nodeVersion}`);
  console.warn(`🔢 Major Version: ${support.majorVersion}`);
  console.warn(`🆕 Native WebSocket: ${support.hasNativeWebSocket ? '✅ Available' : '❌ Not Available'}`);
  console.warn(`🧪 Experimental Support: ${support.supportsExperimentalWebSocket ? '✅ Yes' : '❌ No'}`);
  console.warn(`💡 Recommendation: ${support.recommendation}`);
  
  if(support.supportsExperimentalWebSocket && !support.hasNativeWebSocket) {
    console.warn('\n🔧 To enable native WebSocket support:');
    console.warn('   node --experimental-websocket your-script.js');
    console.warn('   or add to NODE_OPTIONS: --experimental-websocket');
  }
  
  console.warn('\n📚 Features:');
  console.warn('• Standards-compliant WebSocket client (RFC 6455)');
  console.warn('• Automatic reconnection with exponential backoff');
  console.warn('• Message queuing during disconnection');
  console.warn('• Heartbeat/ping support');
  console.warn('• Load balancing across multiple connections');
  console.warn('• Real-time monitoring and statistics');
  console.warn('• Integration with claude-zen services');
}

function _showWebSocketHelp() {
  console.warn(`
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
