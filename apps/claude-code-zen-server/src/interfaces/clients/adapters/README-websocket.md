# WebSocket Client Adapter for UACL

This directory contains the WebSocket client adapter implementation for the Unified API Client Layer (UACL) architecture.

## 🚀 Overview

The WebSocket client adapter converts the existing WebSocket client to UACL architecture while maintaining 100% backward compatibility and adding unified patterns for client management.

## 📁 Files

- **`websocket-client-adapter.ts`** - Core UACL WebSocket adapter implementing IClient interface
- **`enhanced-websocket-client.ts`** - Enhanced client with backward compatibility for legacy code
- **`websocket-client-factory.ts`** - Factory for creating and managing WebSocket clients
- **`websocket-types.ts`** - WebSocket-specific types and configurations
- **`websocket-index.ts`** - Main exports and convenience functions
- **`websocket-demo.ts`** - Complete examples and demonstrations
- **`README-websocket.md`** - This documentation file

## 🔧 Architecture

### UACL WebSocket Client Adapter

```typescript
import { WebSocketClientAdapter } from './websocket-client-adapter';

const config: WebSocketClientConfig = {
  name: 'my-websocket',
  baseURL: 'wss://example.com',
  url: 'wss://example.com/ws',
  timeout: 30000,
  reconnection: {
    enabled: true,
    maxAttempts: 10,
    initialDelay: 1000,
    maxDelay: 30000,
    backoff: 'exponential'
  },
  heartbeat: {
    enabled: true,
    interval: 30000,
    message: { type: 'ping' }
  }
};

const client = new WebSocketClientAdapter(config);
await client.connect();

// UACL interface methods
const response = await client.post('/endpoint', data);
const health = await client.healthCheck();
const metrics = await client.getMetrics();
```

### Enhanced WebSocket Client (Backward Compatible)

```typescript
import { EnhancedWebSocketClient } from './enhanced-websocket-client';

// Legacy constructor (100% backward compatible)
const legacyClient = new EnhancedWebSocketClient('wss://example.com', {
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  timeout: 30000
});

// UACL constructor (new pattern)
const uaclClient = new EnhancedWebSocketClient({
  name: 'enhanced-ws',
  url: 'wss://example.com',
  reconnection: { enabled: true, maxAttempts: 5 }
});

// Both support legacy methods
legacyClient.send({ message: 'Hello' });
console.log(legacyClient.connected);
console.log(legacyClient.connectionUrl);

// Both support UACL methods
const health = await legacyClient.healthCheck();
const metrics = await uaclClient.getMetrics();
```

## 🏭 Factory Pattern

### Basic Factory Usage

```typescript
import { WebSocketClientFactory } from './websocket-client-factory';

const factory = new WebSocketClientFactory();

// Create single client
const client = await factory.create(config);

// Create multiple clients
const clients = await factory.createMultiple([config1, config2, config3]);

// Health check all clients
const healthResults = await factory.healthCheckAll();

// Get metrics for all clients
const metricsResults = await factory.getMetricsAll();
```

### Advanced Factory Features

```typescript
// Load-balanced clients
const loadBalancedClient = await factory.createLoadBalanced(
  [config1, config2, config3], 
  'round-robin'
);

// Failover clients
const failoverClient = await factory.createFailover(
  primaryConfig,
  [fallback1, fallback2]
);

// Connection pooling
const pooledClients = await factory.createPooled(config, 5);
```

## 🔧 Configuration Types

### WebSocket Client Configuration

```typescript
interface WebSocketClientConfig extends ClientConfig {
  url: string;
  protocols?: string[];
  
  authentication?: {
    method: 'none' | 'token' | 'header' | 'query' | 'protocol';
    token?: string;
    headers?: Record<string, string>;
    query?: Record<string, string>;
  };
  
  reconnection?: {
    enabled: boolean;
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoff: 'linear' | 'exponential';
    jitter?: boolean;
  };
  
  heartbeat?: {
    enabled: boolean;
    interval: number;
    timeout?: number;
    message?: any;
  };
  
  messageQueue?: {
    enabled: boolean;
    maxSize: number;
    persistOnDisconnect?: boolean;
    drainOnReconnect?: boolean;
  };
  
  compression?: {
    enabled: boolean;
    method?: 'deflate' | 'gzip';
    level?: number;
    threshold?: number;
  };
}
```

## 🎯 Configuration Presets

```typescript
import { WebSocketClientPresets } from './websocket-index';

// High-performance configuration
const highPerfConfig = WebSocketClientPresets.HighPerformance('wss://example.com');

// Robust configuration for unreliable networks
const robustConfig = WebSocketClientPresets.Robust('wss://example.com');

// Simple configuration
const simpleConfig = WebSocketClientPresets.Simple('wss://example.com');

// Secure configuration with authentication
const secureConfig = WebSocketClientPresets.Secure('wss://example.com', 'your-token');
```

## 🔄 Migration Guide

### From Legacy WebSocket Client

**Before (Legacy):**
```typescript
import { WebSocketClient } from '../api/websocket/client';

const client = new WebSocketClient('wss://example.com', {
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 5
});

client.on('connected', () => console.log('Connected'));
client.on('message', (data) => console.log('Message:', data));

await client.connect();
client.send({ message: 'Hello' });
```

**After (Enhanced with UACL):**
```typescript
import { EnhancedWebSocketClient } from './enhanced-websocket-client';

// Same constructor - 100% backward compatible
const client = new EnhancedWebSocketClient('wss://example.com', {
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 5
});

// Same events work
client.on('connected', () => console.log('Connected'));
client.on('message', (data) => console.log('Message:', data));

// Same methods work
await client.connect();
client.send({ message: 'Hello' });

// Plus new UACL features
const health = await client.healthCheck();
const metrics = await client.getMetrics();
const response = await client.post('/api/data', { value: 123 });
```

## 🏥 Health Monitoring

```typescript
import { WebSocketHealthMonitor } from './websocket-index';

const monitor = new WebSocketHealthMonitor();

// Add clients to monitor
monitor.addClient('client1', client1, 30000); // Check every 30 seconds
monitor.addClient('client2', client2, 60000); // Check every 60 seconds

// Get health status for all clients
const healthStatus = await monitor.getHealthStatus();

// Stop monitoring
monitor.stopAll();
```

## 📊 Metrics and Monitoring

### Client Status

```typescript
const status = await client.healthCheck();
console.log(status);
// {
//   name: 'my-websocket',
//   status: 'healthy',
//   lastCheck: Date,
//   responseTime: 45,
//   errorRate: 0.02,
//   uptime: 3600000,
//   metadata: {
//     connectionId: 'ws-123-abc',
//     readyState: 1,
//     queuedMessages: 0
//   }
// }
```

### Client Metrics

```typescript
const metrics = await client.getMetrics();
console.log(metrics);
// {
//   name: 'my-websocket',
//   requestCount: 1500,
//   successCount: 1485,
//   errorCount: 15,
//   averageLatency: 23.4,
//   p95Latency: 45,
//   p99Latency: 78,
//   throughput: 12.5,
//   timestamp: Date
// }
```

### WebSocket-Specific Metrics

```typescript
// Available on EnhancedWebSocketClient
const wsMetrics = await client.getWebSocketMetrics();
console.log(wsMetrics);
// {
//   connectionsOpened: 1,
//   connectionsClosed: 0,
//   connectionsActive: 1,
//   messagesSent: 1250,
//   messagesReceived: 1200,
//   bytesSent: 125000,
//   bytesReceived: 120000,
//   averageLatency: 23.4,
//   // ... more metrics
// }
```

## 🔧 Advanced Features

### Load Balancing

```typescript
const loadBalancedClient = await factory.createLoadBalanced([
  { url: 'wss://server1.example.com', ...baseConfig },
  { url: 'wss://server2.example.com', ...baseConfig },
  { url: 'wss://server3.example.com', ...baseConfig }
], 'round-robin');

// Requests are automatically distributed across servers
await loadBalancedClient.post('/api/data', payload);
```

### Failover

```typescript
const failoverClient = await factory.createFailover(
  { url: 'wss://primary.example.com', ...baseConfig },
  [
    { url: 'wss://backup1.example.com', ...baseConfig },
    { url: 'wss://backup2.example.com', ...baseConfig }
  ]
);

// Automatically fails over if primary connection fails
await failoverClient.post('/api/data', payload);
```

### Connection Pooling

```typescript
const pooledClients = await factory.createPooled(config, 5);
// Creates 5 identical clients for connection pooling

const loadBalancedPool = new LoadBalancedWebSocketClient(pooledClients, 'least-connections');
// Use pooled connections with load balancing
```

## 🛠️ Convenience Functions

```typescript
import { 
  createOptimalWebSocketClient,
  createSimpleWebSocketClient 
} from './websocket-index';

// Simple client creation
const simpleClient = await createSimpleWebSocketClient('wss://example.com', {
  timeout: 30000,
  reconnect: true,
  heartbeat: true,
  useEnhanced: true
});

// Optimal client with advanced features
const optimalClient = await createOptimalWebSocketClient(config, {
  useEnhanced: true,
  loadBalancing: {
    enabled: true,
    strategy: 'round-robin',
    urls: ['wss://server1.com', 'wss://server2.com']
  },
  failover: {
    enabled: true,
    fallbackUrls: ['wss://backup1.com', 'wss://backup2.com']
  }
});
```

## 🚨 Error Handling

### Connection Errors

```typescript
try {
  await client.connect();
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Connection failed:', error.message);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Connection timeout:', error.timeout);
  }
}
```

### Message Errors

```typescript
client.on('error', (error) => {
  console.error('WebSocket error:', error);
});

client.on('reconnectFailed', () => {
  console.error('All reconnection attempts failed');
});
```

## 🔧 Custom Authentication

```typescript
const config: WebSocketClientConfig = {
  url: 'wss://secure.example.com',
  authentication: {
    method: 'custom',
    customAuth: (url, protocols) => ({
      url: `${url}?auth=custom`,
      protocols,
      headers: {
        'Authorization': 'Bearer ' + generateToken(),
        'X-Client-ID': 'my-client'
      }
    })
  }
};
```

## 🧪 Testing

Run the demo examples:

```typescript
import { runAllWebSocketExamples } from './websocket-demo';

// Run all examples
await runAllWebSocketExamples();

// Or run individual examples
import demo from './websocket-demo';
await demo.basicUACLWebSocketExample();
await demo.migrationExample();
```

## 📈 Performance Tips

1. **Use Connection Pooling** for high-throughput applications
2. **Enable Compression** for large messages
3. **Configure Heartbeat** appropriately for your network
4. **Use Load Balancing** for distributed systems
5. **Monitor Health** continuously for production systems
6. **Implement Failover** for critical applications

## 🔍 Best Practices

1. **Always handle connection errors** gracefully
2. **Use appropriate reconnection strategies** for your use case
3. **Monitor client health** and metrics
4. **Configure timeouts** based on network conditions
5. **Use message queuing** for offline scenarios
6. **Implement proper authentication** for secure connections
7. **Clean up clients** when no longer needed

## 🤝 UACL Integration

The WebSocket adapter fully implements the UACL interface:

- ✅ **IClient interface** - Complete implementation
- ✅ **Factory pattern** - WebSocketClientFactory
- ✅ **Health monitoring** - Built-in health checks
- ✅ **Metrics collection** - Comprehensive metrics
- ✅ **Configuration management** - Unified config structure
- ✅ **Error handling** - Standardized error types
- ✅ **Event system** - Consistent event patterns
- ✅ **Lifecycle management** - Proper connect/disconnect/destroy

## 🚀 What's Next

The WebSocket adapter is fully functional and ready for production use. Future enhancements may include:

- Additional authentication methods
- Advanced compression algorithms  
- Protocol-specific optimizations
- Enhanced monitoring capabilities
- Integration with service discovery
- Automatic scaling features

---

**✅ Mission Accomplished**: The WebSocket client has been successfully converted to UACL architecture while maintaining 100% backward compatibility and adding comprehensive unified patterns for client management.