# UACL (Unified Adaptive Client Layer) - Complete Integration Guide

## 🎯 Overview

The UACL (Unified Adaptive Client Layer) provides a centralized, type-safe, and monitoring-enabled approach to managing all client types in Claude-Zen. It replaces scattered client management with a unified system that provides:

- **Centralized Management**: Single point of control for all client types
- **Health Monitoring**: Automatic health checks and metrics collection
- **Load Balancing**: Intelligent client selection and failover
- **Backward Compatibility**: Zero breaking changes for existing code
- **Type Safety**: Full TypeScript support with comprehensive interfaces

## 🏗️ Architecture

```
UACL Architecture
├── Core Layer
│   ├── ClientRegistry - Type registration and discovery
│   ├── ClientManager - Lifecycle management
│   └── Interfaces - Type definitions and contracts
├── Adapters Layer
│   ├── HTTP Client Adapter - REST API clients
│   ├── WebSocket Client Adapter - Real-time clients
│   ├── Knowledge Client Adapter - FACT integration clients
│   └── MCP Client Adapter - Model Context Protocol clients
├── Compatibility Layer
│   ├── Legacy Wrappers - Backward compatibility
│   ├── Migration Helpers - Gradual migration utilities
│   └── Enhanced Clients - Drop-in UACL-powered replacements
└── Integration Layer
    ├── Database Tools Integration - MCP client management
    ├── Knowledge Swarm Integration - Knowledge client management
    └── System Metrics Integration - HTTP client management
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { uacl, ClientType } from '@/interfaces/clients';

// Initialize UACL
await uacl.initialize();

// Create clients
const httpClient = await uacl.createHTTPClient('api-client', 'https://api.example.com');
const wsClient = await uacl.createWebSocketClient('ws-client', 'wss://ws.example.com');

// Use clients
const response = await (httpClient.client as APIClient).get('/data');
```

### Advanced Usage with Configuration

```typescript
import { uacl, ClientType, UACLHelpers } from '@/interfaces/clients';

// Initialize with custom configuration
await uacl.initialize({
  healthCheckInterval: 15000,
  autoReconnect: true,
  maxRetryAttempts: 5,
  enableLogging: true
});

// Create HTTP client with custom config
const httpClient = await uacl.createHTTPClient('main-api', 'https://api.example.com', {
  enabled: true,
  priority: 10,
  timeout: 60000,
  retryAttempts: 3,
  apiKey: 'your-api-key',
  headers: {
    'User-Agent': 'Claude-Zen/2.0'
  }
});

// Get the best available client for a type
const bestHttpClient = uacl.getBestClient(ClientType.HTTP);

// Get system health status
const health = uacl.getHealthStatus();
console.log('System Health:', health.overall);

// Get comprehensive metrics
const metrics = uacl.getMetrics();
console.log('Connected Clients:', metrics.connected, '/', metrics.total);
```

## 📦 Client Types

### HTTP Clients (REST API)

```typescript
// Create HTTP client
const httpClient = await uacl.createHTTPClient('my-api', 'https://api.example.com', {
  enabled: true,
  priority: 8,
  timeout: 30000,
  apiKey: 'key',
  bearerToken: 'token',
  headers: { 'Custom-Header': 'value' },
  retryAttempts: 3
});

// Use the client
const apiClient = httpClient.client as APIClient;
const data = await apiClient.get('/endpoint');
```

### WebSocket Clients (Real-time)

```typescript
// Create WebSocket client
const wsClient = await uacl.createWebSocketClient('realtime', 'wss://ws.example.com', {
  enabled: true,
  priority: 7,
  timeout: 5000,
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10
});

// Use the client
const webSocketClient = wsClient.client as WebSocketClient;
await webSocketClient.connect();
webSocketClient.on('message', (data) => console.log('Received:', data));
```

### Knowledge Clients (FACT Integration)

```typescript
// Create Knowledge client
const knowledgeClient = await uacl.createKnowledgeClient(
  'fact-integration',
  '/path/to/fact/repo',
  'anthropic-api-key',
  {
    enabled: true,
    priority: 6,
    pythonPath: 'python3',
    enableCache: true,
    cacheConfig: {
      prefix: 'knowledge',
      minTokens: 100,
      maxSize: '100MB',
      ttlSeconds: 3600
    }
  }
);

// Use the client
const factClient = knowledgeClient.client as FACTIntegration;
const results = await factClient.query('search query');
```

### MCP Clients (Model Context Protocol)

```typescript
// Create MCP client
const mcpClient = await uacl.createMCPClient('mcp-tools', {
  'server1': {
    url: 'http://localhost:3000/mcp',
    type: 'http',
    capabilities: ['tools', 'resources']
  },
  'server2': {
    url: 'stdio://mcp-server',
    type: 'stdio',
    capabilities: ['tools']
  }
}, {
  enabled: true,
  priority: 9,
  timeout: 30000,
  retryAttempts: 3
});

// Use the client
const mcpInstance = mcpClient.client as ExternalMCPClient;
const tools = await mcpInstance.listTools();
```

## 🔄 Migration Guide

### Backward Compatibility

UACL provides **100% backward compatibility**. Existing code continues to work without changes:

```typescript
// OLD CODE - Still works
import { createAPIClient } from '@/interfaces/api/http/client';
const client = createAPIClient({ baseURL: 'https://api.example.com' });

// NEW CODE - Enhanced with UACL
import { createEnhancedAPIClient } from '@/interfaces/clients';
const { client, instance } = await createEnhancedAPIClient('my-api', {
  baseURL: 'https://api.example.com'
});
```

### Migration Helpers

```typescript
import { UACLMigrationHelper, getMigrationStatus } from '@/interfaces/clients';

// Get migration status
const status = getMigrationStatus();
console.log(`Migration Progress: ${status.migrated}/${status.total} clients migrated`);

// Perform batch migration
const results = await performBatchMigration();
console.log(`Migration Results: ${results.successful} successful, ${results.failed} failed`);
```

### Drop-in Replacements

```typescript
// Before: Direct client creation
const httpClient = createAPIClient(config);
const wsClient = new WebSocketClient(url, options);
const knowledgeClient = new FACTIntegration(config);
const mcpClient = new ExternalMCPClient();

// After: Enhanced UACL-managed clients (same interface + monitoring)
const { client: httpClient } = await createEnhancedAPIClient('http', config);
const { client: wsClient } = await createEnhancedWebSocketClient('ws', url, options);
const { client: knowledgeClient } = await createEnhancedKnowledgeClient('knowledge', config);
const { client: mcpClient } = await createEnhancedMCPClient('mcp', servers);
```

## 📊 Monitoring & Health Checks

### System Health

```typescript
// Get overall system health
const health = uacl.getHealthStatus();
console.log(`System Status: ${health.overall}`);
console.log('Component Health:', health.details);

// Get detailed metrics
const metrics = uacl.getMetrics();
console.log('Client Metrics:', {
  total: metrics.total,
  connected: metrics.connected,
  avgLatency: metrics.avgLatency,
  totalRequests: metrics.totalRequests,
  totalErrors: metrics.totalErrors
});
```

### Per-Client Health

```typescript
// Check specific client health
const clientId = 'my-api-client';
const isHealthy = uacl.registry.isHealthy(clientId);
const clientMetrics = uacl.manager.getClientMetrics(clientId);

console.log(`Client ${clientId}:`, {
  healthy: isHealthy,
  requests: clientMetrics?.requests.total,
  errors: clientMetrics?.errors.total,
  uptime: clientMetrics?.health.uptime
});
```

### Automated Health Monitoring

```typescript
// Health monitoring is automatic, but you can customize intervals
await uacl.initialize({
  healthCheckInterval: 30000, // Check every 30 seconds
  autoReconnect: true,        // Auto-reconnect failed clients
  maxRetryAttempts: 5,        // Max retry attempts
  enableLogging: true         // Enable detailed logging
});
```

## 🎯 Integration Examples

### Database Integration

```typescript
// Database operations handled through DAL factory
import { DALFactory } from '@/database';

// Create database connections through DAL
const dalFactory = new DALFactory();
const userDao = await dalFactory.createDAO({
  databaseType: 'postgresql',
  entityType: 'User',
  databaseConfig: { host: 'localhost', database: 'app' }
});
```

### Knowledge Swarm Integration

```typescript
// Knowledge swarm uses UACL for managing multiple FACT clients
import { KnowledgeSwarm } from '@/knowledge/knowledge-swarm';

const swarm = new KnowledgeSwarm({
  factRepoPath: '/path/to/fact',
  anthropicApiKey: 'key',
  swarmSize: 5,
  // Each agent gets a UACL-managed knowledge client
  specializations: [
    { name: 'researcher', priority: 8, expertise: ['research', 'analysis'] },
    { name: 'coder', priority: 9, expertise: ['programming', 'debugging'] }
  ]
});

await swarm.initialize();
```

### System Metrics Integration

```typescript
// System metrics dashboard uses UACL for HTTP client management
import { SystemMetricsDashboard } from '@/interfaces/web/system-metrics-dashboard';

const dashboard = new SystemMetricsDashboard({
  metricsEndpoint: 'https://metrics.example.com',
  // Automatically creates UACL-managed HTTP client
});

await dashboard.initialize();
```

## 🔧 Configuration

### Global Configuration

```typescript
// Initialize UACL with global settings
await uacl.initialize({
  healthCheckInterval: 30000,    // Health check frequency
  autoReconnect: true,           // Auto-reconnect failed clients
  maxRetryAttempts: 3,           // Max retry attempts per client
  retryDelay: 1000,              // Initial retry delay
  metricsRetention: 24*60*60*1000, // Keep metrics for 24 hours
  enableLogging: true            // Enable detailed logging
});
```

### Per-Client Configuration

```typescript
// Each client type supports specific configuration
const httpConfig = {
  enabled: true,              // Enable/disable client
  priority: 8,               // Priority (1-10, higher = better)
  timeout: 30000,            // Request timeout
  retryAttempts: 3,          // Retry attempts
  healthCheckInterval: 30000, // Health check frequency
  
  // HTTP-specific
  baseURL: 'https://api.example.com',
  apiKey: 'key',
  bearerToken: 'token',
  headers: { 'Custom': 'value' }
};

const wsConfig = {
  enabled: true,
  priority: 7,
  timeout: 5000,
  
  // WebSocket-specific
  url: 'wss://ws.example.com',
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10
};
```

## 🧪 Testing & Validation

### UACL Validation

```typescript
import { validateUACL, printValidationReport } from '@/interfaces/clients';

// Run comprehensive validation
const report = await validateUACL();
console.log(`Validation: ${report.overall} (${report.summary.passed}/${report.summary.total} passed)`);

// Print detailed report
await printValidationReport();
```

### Command Line Validation

```bash
# Run UACL validation
npm run validate:uacl

# Output example:
# 🔍 Starting UACL Integration Validation...
# 
# # UACL Integration Validation Report
# **Overall Status:** PASS
# **Generated:** 2024-01-01T12:00:00.000Z
# 
# ## Summary
# - **Total Tests:** 15
# - **Passed:** 13 ✅
# - **Failed:** 0 ❌
# - **Warnings:** 2 ⚠️
```

### Unit Testing

```typescript
import { uacl, ClientType } from '@/interfaces/clients';

describe('UACL Integration', () => {
  beforeAll(async () => {
    await uacl.initialize();
  });

  test('should create HTTP client', async () => {
    const client = await uacl.createHTTPClient('test', 'http://localhost');
    expect(client.type).toBe(ClientType.HTTP);
    expect(client.id).toBe('test');
  });

  test('should track client health', async () => {
    const health = uacl.getHealthStatus();
    expect(health.overall).toMatch(/^(healthy|warning|critical)$/);
  });

  afterAll(async () => {
    await uacl.shutdown();
  });
});
```

## 🚨 Error Handling

### Client Creation Errors

```typescript
try {
  const client = await uacl.createHTTPClient('test', 'invalid-url');
} catch (error) {
  if (error instanceof ClientError) {
    console.error(`Client Error [${error.code}]:`, error.message);
    console.error('Details:', error.details);
    console.error('Retryable:', error.retryable);
  }
}
```

### Connection Errors

```typescript
// UACL handles connection errors automatically with retry logic
const client = await uacl.createWebSocketClient('ws', 'wss://example.com', {
  autoReconnect: true,
  maxRetryAttempts: 5,
  retryDelay: 1000
});

// Monitor connection events
uacl.manager.on('client:error', (clientId, error) => {
  console.error(`Client ${clientId} error:`, error);
});

uacl.manager.on('client:reconnected', (clientId) => {
  console.log(`Client ${clientId} reconnected successfully`);
});
```

## 🔮 Advanced Features

### Load Balancing

```typescript
// Create multiple clients for load balancing
await uacl.createHTTPClient('api-1', 'https://api1.example.com', { priority: 10 });
await uacl.createHTTPClient('api-2', 'https://api2.example.com', { priority: 9 });
await uacl.createHTTPClient('api-3', 'https://api3.example.com', { priority: 8 });

// Get best available client (highest priority, healthy)
const bestClient = uacl.getBestClient(ClientType.HTTP);

// Get load-balanced client (round-robin among healthy clients)
const balancedClient = UACLHelpers.getLoadBalancedClient(ClientType.HTTP);
```

### Client Metrics Collection

```typescript
// Get detailed client metrics
const metrics = uacl.getMetrics();

// Access by client type
console.log('HTTP Clients:', metrics.byType[ClientType.HTTP]);
console.log('WebSocket Clients:', metrics.byType[ClientType.WEBSOCKET]);

// Get aggregated performance data
console.log('Total Requests:', metrics.totalRequests);
console.log('Average Latency:', metrics.avgLatency, 'ms');
console.log('Error Rate:', (metrics.totalErrors / metrics.totalRequests * 100).toFixed(2), '%');
```

### Custom Health Checks

```typescript
// Implement custom health check logic
const healthResults = await UACLHelpers.performHealthCheck();

for (const [clientId, isHealthy] of Object.entries(healthResults)) {
  if (!isHealthy) {
    console.warn(`Client ${clientId} is unhealthy - investigating...`);
    
    const client = uacl.getClient(clientId);
    const metrics = uacl.manager.getClientMetrics(clientId);
    
    // Implement custom recovery logic
    if (metrics?.errors.total > 10) {
      console.log(`Restarting client ${clientId} due to high error count`);
      await uacl.manager.disconnectClient(clientId);
      await uacl.manager.connectClient(clientId);
    }
  }
}
```

## 📚 API Reference

### Core Classes

- **`UACL`** - Main UACL interface
- **`ClientRegistry`** - Client type registration and discovery
- **`ClientManager`** - Client lifecycle management
- **`UACLValidator`** - Integration validation utilities

### Helper Functions

- **`UACLHelpers.setupCommonClients()`** - Quick setup for typical configurations
- **`UACLHelpers.getQuickStatus()`** - Fast system status overview
- **`UACLHelpers.performHealthCheck()`** - Comprehensive health validation

### Migration Utilities

- **`createEnhancedAPIClient()`** - UACL-enhanced HTTP client
- **`createEnhancedWebSocketClient()`** - UACL-enhanced WebSocket client
- **`createEnhancedKnowledgeClient()`** - UACL-enhanced Knowledge client
- **`createEnhancedMCPClient()`** - UACL-enhanced MCP client

## 🎉 Success Criteria Achieved

✅ **Central client registry** - All client types registered and discoverable
✅ **Lifecycle management** - Creation, monitoring, cleanup, recovery
✅ **HTTP client integration** - System metrics dashboard migrated
✅ **WebSocket client integration** - Real-time features enhanced
✅ **Knowledge client integration** - Knowledge swarm migrated with fallback
✅ **MCP client integration** - Database tools enhanced
✅ **Backward compatibility** - Zero breaking changes, migration utilities
✅ **Performance maintained** - All existing functionality preserved
✅ **Validation framework** - Comprehensive testing and validation tools

The UACL integration is **complete and operational**! 🚀