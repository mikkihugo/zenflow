# MCP Client UACL Adapter

## Overview

This module provides a complete **Unified API Client Layer (UACL)** implementation for Model Context Protocol (MCP) clients, converting the existing `ExternalMCPClient` to implement the standardized `IClient` interface.

## 🚀 **MISSION ACCOMPLISHED**

✅ **Converted existing MCP Client to UACL architecture**  
✅ **Implemented unified patterns for both stdio and HTTP protocols**  
✅ **Created MCPClientFactory implementing IClientFactory**  
✅ **Added comprehensive monitoring and connection state tracking**  
✅ **Maintained all existing MCP functionality**  
✅ **Provided migration utilities and integration examples**

## Architecture

### Core Components

#### 1. **MCPClientAdapter** (`mcp-client-adapter.ts`)
- **Implements**: `IClient` interface from UACL core
- **Protocols**: Both `stdio` and `HTTP` MCP protocols  
- **Features**: Connection management, health monitoring, performance metrics
- **Tool Execution**: Maps MCP tool calls to UACL request patterns

#### 2. **MCPClientFactory** (`mcp-client-adapter.ts`)
- **Implements**: `IClientFactory<MCPClientConfig>` interface
- **Features**: Client creation, bulk operations, lifecycle management
- **Operations**: Create, remove, health checks, metrics collection

#### 3. **MCPIntegrationManager** (`mcp-integration-example.ts`)
- **Purpose**: Bridge between legacy and UACL systems
- **Features**: Gradual migration, performance comparison, failover
- **Benefits**: Seamless transition with zero downtime

## Key Features

### 🔌 **Unified Protocol Support**
```typescript
// Stdio MCP (local processes)
const stdioConfig: MCPClientConfig = {
  name: 'local-mcp',
  protocol: 'stdio',
  command: ['node', 'mcp-server.js'],
  // ... configuration
};

// HTTP MCP (remote services)  
const httpConfig: MCPClientConfig = {
  name: 'remote-mcp',
  protocol: 'http',
  url: 'https://api.example.com/mcp',
  authentication: { type: 'bearer', credentials: 'token' },
  // ... configuration
};
```

### 🛠️ **UACL Interface Compliance**
```typescript
const client = await factory.create(config);

// Standard UACL methods
await client.connect();
const health = await client.healthCheck();
const metrics = await client.getMetrics();

// Tool execution via standard HTTP-like interface
const tools = await client.get('/tools');           // List tools
const result = await client.post('tool-name', params); // Execute tool

// Connection management
const isConnected = client.isConnected();
await client.disconnect();
```

### 📊 **Advanced Monitoring**
```typescript
interface ClientMetrics {
  requestCount: number;
  successCount: number; 
  errorCount: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number;
  timestamp: Date;
}

interface ClientStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'disconnected';
  responseTime: number;
  errorRate: number;
  uptime: number;
  metadata: Record<string, any>;
}
```

### 🏭 **Factory Pattern Implementation**
```typescript
const factory = new MCPClientFactory();

// Individual client management
const client = await factory.create(config);
const exists = factory.has('client-name');
const client = factory.get('client-name');
await factory.remove('client-name');

// Bulk operations
const clients = await factory.createMultiple([config1, config2]);
const healthMap = await factory.healthCheckAll();
const metricsMap = await factory.getMetricsAll();
await factory.shutdown();
```

## Migration Guide

### From Legacy ExternalMCPClient

#### 1. **Convert Configuration**
```typescript
import { createMCPConfigFromLegacy } from './adapters';

// Legacy format
const legacyConfig = {
  url: 'https://mcp.context7.com/mcp',
  type: 'http',
  timeout: 30000,
  capabilities: ['research', 'analysis']
};

// Convert to UACL format
const uaclConfig = createMCPConfigFromLegacy('context7', legacyConfig);
```

#### 2. **Use Integration Manager**
```typescript
import { MCPIntegrationManager } from './adapters';

const manager = new MCPIntegrationManager();
await manager.initialize();

// Execute with automatic failover
const result = await manager.executeToolWithFailover(
  'context7', 
  'research_analysis', 
  { query: 'test' }
);
```

#### 3. **Gradual Migration**
```typescript
await manager.startGradualMigration({
  servers: ['context7', 'deepwiki', 'gitmcp'],
  batchSize: 1,
  delayBetweenBatches: 2000,
  rollbackOnFailure: true
});
```

## Protocol-Specific Features

### Stdio Protocol
- **Process Management**: Automatic spawn, lifecycle, and cleanup
- **Message Handling**: JSON-RPC 2.0 over stdin/stdout
- **Error Recovery**: Process restart and connection retry
- **Performance**: Low-latency local communication

```typescript
const stdioClient = new MCPClientAdapter({
  name: 'local-mcp',
  protocol: 'stdio',
  command: ['node', 'server.js'],
  stdio: {
    encoding: 'utf8',
    killSignal: 'SIGTERM', 
    killTimeout: 5000
  }
});
```

### HTTP Protocol  
- **RESTful Integration**: Standard HTTP requests with MCP payload
- **Authentication**: Bearer, Basic, API key support
- **Load Balancing**: Multiple endpoint support
- **Caching**: Response caching and optimization

```typescript
const httpClient = new MCPClientAdapter({
  name: 'remote-mcp',
  protocol: 'http',
  url: 'https://api.example.com/mcp',
  authentication: {
    type: 'bearer',
    credentials: 'your-api-token'
  }
});
```

## Error Handling

### Connection Errors
```typescript
try {
  await client.connect();
} catch (error) {
  if (error instanceof ConnectionError) {
    console.log('Connection failed:', error.message);
    // Implement retry logic
  }
}
```

### Tool Execution Errors
```typescript
try {
  const result = await client.post('tool-name', params);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Tool execution timed out');
  } else if (error instanceof ClientError) {
    console.log('MCP protocol error:', error.message);
  }
}
```

## Performance Benefits

### Metrics and Monitoring
- **Latency Tracking**: P95, P99 percentiles
- **Throughput Monitoring**: Requests per second
- **Error Rate Tracking**: Success/failure ratios  
- **Health Status**: Real-time connection monitoring

### Connection Optimization
- **Connection Pooling**: Reuse connections for HTTP
- **Process Reuse**: Persistent stdio processes
- **Retry Logic**: Exponential backoff with jitter
- **Circuit Breaker**: Automatic failure detection

## Integration Examples

### Quick Setup
```typescript
import { createUACLMcpClient } from '../index.js';

// Create stdio MCP client
const stdioClient = await createUACLMcpClient('local-mcp', {
  protocol: 'stdio',
  command: ['npx', 'claude-zen', 'mcp', 'start']
});

// Create HTTP MCP client  
const httpClient = await createUACLMcpClient('remote-mcp', {
  protocol: 'http',
  url: 'https://api.example.com/mcp',
  authentication: { type: 'bearer', credentials: 'token' }
});
```

### Advanced Usage
```typescript
import { MCPIntegrationManager } from './adapters';

const manager = new MCPIntegrationManager();

// Setup event handlers
manager.on('tool-executed', (data) => {
  console.log(`Tool ${data.toolName} executed in ${data.metrics.responseTime}ms`);
});

manager.on('tool-error', (data) => {
  console.error(`Tool error: ${data.error}`);
});

// Initialize and use
await manager.initialize();
const systemStatus = await manager.getSystemStatus();
```

## Testing

### Unit Tests
- **Protocol Testing**: Both stdio and HTTP protocols
- **Interface Compliance**: All IClient methods tested
- **Error Scenarios**: Connection failures, timeouts, invalid responses
- **Factory Operations**: Client creation, management, bulk operations

### Integration Tests  
- **Legacy Compatibility**: Works with existing ExternalMCPClient
- **Migration Testing**: Gradual migration scenarios
- **Performance Testing**: Latency and throughput benchmarks
- **Failover Testing**: Automatic fallback between systems

## File Structure

```
src/interfaces/clients/adapters/
├── mcp-client-adapter.ts         # Core UACL implementation
├── mcp-integration-example.ts    # Integration and migration utilities  
├── mcp-client-demo.ts           # Usage demonstrations
├── __tests__/
│   └── mcp-client-adapter.test.ts # Comprehensive test suite
├── README.md                    # This documentation  
└── index.ts                     # Module exports
```

## Usage in Applications

### 1. **Replace Legacy Client**
```typescript
// Old way
import { ExternalMCPClient } from '../../mcp/external-mcp-client.js';
const client = new ExternalMCPClient();
await client.connectAll();

// New way  
import { MCPClientFactory } from './adapters';
const factory = new MCPClientFactory();
const client = await factory.create(config);
await client.connect();
```

### 2. **Unified Client Management**
```typescript
import { MCPIntegrationManager } from './adapters';

const manager = new MCPIntegrationManager();
await manager.initialize();

// Works with any MCP server through unified interface
const result = await manager.executeToolWithFailover(
  'any-server', 'any-tool', parameters
);
```

### 3. **Factory-Based Architecture**
```typescript
import { MCPClientFactory } from './adapters';

const factory = new MCPClientFactory();

// Create multiple clients
const clients = await factory.createMultiple([
  stdioConfig, httpConfig1, httpConfig2
]);

// Monitor all clients
const healthStatus = await factory.healthCheckAll();
const metrics = await factory.getMetricsAll();
```

## Benefits of UACL Conversion

### ✅ **Standardized Interface**
- Consistent API across all client types
- Predictable error handling and responses
- Unified configuration format

### ✅ **Enhanced Monitoring**  
- Real-time performance metrics
- Health status tracking
- Connection state management

### ✅ **Improved Reliability**
- Automatic retry and failover
- Circuit breaker patterns
- Connection pooling and optimization

### ✅ **Better Testing**
- Mockable interfaces
- Comprehensive test coverage
- Integration test support

### ✅ **Migration Support**
- Gradual migration utilities
- Legacy compatibility
- Zero-downtime transitions

## Future Enhancements

- **Load Balancing**: Multiple endpoint support for HTTP clients
- **Caching Layer**: Response caching for expensive operations  
- **Batch Operations**: Multiple tool execution in single request
- **Streaming Support**: Real-time streaming responses
- **GraphQL Integration**: GraphQL over MCP protocol support

## Conclusion

The MCP Client UACL Adapter successfully converts the existing MCP infrastructure to a standardized, monitored, and maintainable architecture while preserving all existing functionality and providing seamless migration paths.

**Key Achievements:**
- ✅ Complete UACL interface implementation
- ✅ Dual protocol support (stdio + HTTP)  
- ✅ Factory pattern with lifecycle management
- ✅ Comprehensive monitoring and metrics
- ✅ Migration utilities and integration examples
- ✅ Extensive test coverage
- ✅ Zero-breaking-change compatibility