# UACL Migration Guide

This guide helps you migrate from the existing HTTP APIClient to the new UACL (Unified API Client Layer) architecture.

## 🎯 **What Changed**

The new UACL architecture provides:
- **Unified interfaces** across all client types (HTTP, WebSocket, GraphQL, gRPC)
- **Enhanced authentication** with OAuth token refresh, custom auth handlers
- **Advanced retry logic** with backoff strategies and custom conditions
- **Built-in monitoring** with performance metrics and health checks
- **Factory pattern** for client lifecycle management
- **Configuration presets** for common use cases
- **Full backward compatibility** - existing code continues to work

## 🔄 **Migration Options**

### Option 1: Keep Existing Code (Recommended)

**No changes needed!** The existing APIClient interface is preserved through a compatibility wrapper.

```typescript
// This continues to work exactly as before
import { APIClient, createAPIClient } from '@/interfaces/api/http/client';

const client = createAPIClient({
  baseURL: 'https://api.example.com',
  bearerToken: 'your-token',
  timeout: 30000,
});

// All existing methods work the same
const agents = await client.coordination.listAgents();
const networks = await client.neural.listNetworks();
```

**Benefits:**
- ✅ Zero code changes required
- ✅ Automatic UACL benefits (better retry, monitoring, health checks)
- ✅ Access to new UACL features when needed

### Option 2: Gradual Migration

Gradually adopt UACL features while keeping existing API methods:

```typescript
import { createAPIClient } from '@/interfaces/clients';

const client = createAPIClient({
  baseURL: 'https://api.example.com',
  bearerToken: 'your-token',
  // Add new UACL features gradually
  retryAttempts: 5,
  retryDelay: 2000,
});

// Use existing API methods
const agents = await client.coordination.listAgents();

// Add new UACL capabilities
const status = await client.getClientStatus();
const metrics = await client.getClientMetrics();
await client.connect(); // Explicit connection with health monitoring
```

### Option 3: Full UACL Adoption

Migrate to the full UACL client for maximum benefits:

```typescript
import { createHTTPClient, createHTTPClientWithPreset } from '@/interfaces/clients';

// Use UACL client directly
const client = await createHTTPClient({
  name: 'my-api-client',
  baseURL: 'https://api.example.com',
  authentication: {
    type: 'bearer',
    token: 'your-token',
  },
  retry: {
    attempts: 5,
    delay: 1000,
    backoff: 'exponential',
  },
  monitoring: {
    enabled: true,
    metricsInterval: 60000,
    trackLatency: true,
    trackThroughput: true,
    trackErrors: true,
  },
});

// Use UACL interface methods
const response = await client.get('/api/v1/coordination/agents');
const agents = response.data;
```

## 📊 **Feature Comparison**

| Feature | Old APIClient | UACL Client | Compatibility Wrapper |
|---------|---------------|-------------|----------------------|
| Basic HTTP requests | ✅ | ✅ | ✅ |
| Bearer/API key auth | ✅ | ✅ | ✅ |
| Basic retry logic | ✅ | ✅ Enhanced | ✅ Enhanced |
| OAuth with token refresh | ❌ | ✅ | ❌ |
| Custom authentication | ❌ | ✅ | ❌ |
| Health monitoring | ❌ | ✅ | ✅ |
| Performance metrics | ❌ | ✅ | ✅ |
| Connection management | ❌ | ✅ | ✅ |
| Configuration presets | ❌ | ✅ | ❌ |
| Load balancing | ❌ | ✅ | ❌ |
| Factory pattern | ❌ | ✅ | ❌ |
| Event system | ❌ | ✅ | ❌ |

## 🚀 **Migration Examples**

### Authentication Migration

**Before (Old APIClient):**
```typescript
const client = new APIClient({
  baseURL: 'https://api.example.com',
  bearerToken: 'your-token',
  apiKey: 'your-api-key',
});
```

**After (UACL Client):**
```typescript
const client = await createHTTPClient({
  name: 'api-client',
  baseURL: 'https://api.example.com',
  authentication: {
    type: 'bearer',
    token: 'your-token',
  },
});

// Or for OAuth with automatic token refresh:
const oauthClient = await createHTTPClient({
  name: 'oauth-client',
  baseURL: 'https://api.example.com',
  authentication: {
    type: 'oauth',
    credentials: {
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      tokenUrl: 'https://auth.example.com/token',
      accessToken: 'current-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date('2024-12-31'),
    },
  },
});
```

### Retry Configuration Migration

**Before (Old APIClient):**
```typescript
const client = new APIClient({
  baseURL: 'https://api.example.com',
  retryAttempts: 3,
  retryDelay: 1000,
});
```

**After (UACL Client):**
```typescript
const client = await createHTTPClient({
  name: 'resilient-client',
  baseURL: 'https://api.example.com',
  retry: {
    attempts: 5,
    delay: 1000,
    backoff: 'exponential',
    maxDelay: 10000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
    retryCondition: (error) => {
      return error.response?.status >= 500 || !error.response;
    },
  },
});
```

### Error Handling Migration

**Before (Old APIClient):**
```typescript
try {
  const data = await client.coordination.listAgents();
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Authentication failed');
  } else if (error.code === 'ECONNABORTED') {
    console.error('Request timeout');
  }
}
```

**After (UACL Client):**
```typescript
import { 
  isAuthenticationError, 
  isTimeoutError, 
  isConnectionError 
} from '@/interfaces/clients';

try {
  const response = await client.get('/api/v1/coordination/agents');
  const data = response.data;
} catch (error) {
  if (isAuthenticationError(error)) {
    console.error('Authentication failed:', error.message);
  } else if (isTimeoutError(error)) {
    console.error('Request timeout:', error.message);
  } else if (isConnectionError(error)) {
    console.error('Connection failed:', error.message);
  }
}
```

### Monitoring Migration

**Before (Old APIClient):**
```typescript
// No built-in monitoring
const client = new APIClient({ baseURL: 'https://api.example.com' });
```

**After (UACL Client):**
```typescript
const client = await createHTTPClient({
  name: 'monitored-client',
  baseURL: 'https://api.example.com',
  monitoring: {
    enabled: true,
    metricsInterval: 60000,
    trackLatency: true,
    trackThroughput: true,
    trackErrors: true,
  },
  health: {
    endpoint: '/health',
    interval: 30000,
    timeout: 5000,
    failureThreshold: 3,
    successThreshold: 2,
  },
});

// Listen for events
client.on('connect', () => console.log('Client connected'));
client.on('error', (error) => console.error('Client error:', error));

// Get metrics
const metrics = await client.getMetrics();
console.log('Performance:', {
  requests: metrics.requestCount,
  errors: metrics.errorCount,
  avgLatency: metrics.averageLatency,
  throughput: metrics.throughput,
});
```

## 🏭 **Factory Pattern Migration**

**Before (Manual client management):**
```typescript
const usersClient = new APIClient({ baseURL: 'https://users.api.com' });
const ordersClient = new APIClient({ baseURL: 'https://orders.api.com' });
const inventoryClient = new APIClient({ baseURL: 'https://inventory.api.com' });

// Manual cleanup
usersClient.destroy();
ordersClient.destroy();
inventoryClient.destroy();
```

**After (Factory-managed clients):**
```typescript
import { HTTPClientFactory } from '@/interfaces/clients';

const factory = new HTTPClientFactory();

// Create multiple clients
const clients = await factory.createMultiple([
  { name: 'users-api', baseURL: 'https://users.api.com' },
  { name: 'orders-api', baseURL: 'https://orders.api.com' },
  { name: 'inventory-api', baseURL: 'https://inventory.api.com' },
]);

// Use clients
const usersClient = factory.get('users-api');
const users = await usersClient.get('/users');

// Batch operations
const healthResults = await factory.healthCheckAll();
const metricsResults = await factory.getMetricsAll();

// Cleanup all at once
await factory.shutdown();
```

## 📋 **Configuration Presets**

**Use presets for common scenarios:**

```typescript
import { createHTTPClientWithPreset } from '@/interfaces/clients';

// Development environment
const devClient = await createHTTPClientWithPreset(
  'dev-client',
  'https://dev-api.example.com',
  'development'
);

// Production environment
const prodClient = await createHTTPClientWithPreset(
  'prod-client',
  'https://api.example.com',
  'production',
  {
    authentication: {
      type: 'bearer',
      token: process.env.API_TOKEN,
    },
  }
);

// High-availability setup
const haClient = await createHTTPClientWithPreset(
  'ha-client',
  'https://ha-api.example.com',
  'highAvailability'
);
```

## 🔧 **Import Path Updates**

**Old imports:**
```typescript
import { APIClient, createAPIClient } from '@/interfaces/api/http/client';
```

**New imports (for full UACL features):**
```typescript
import {
  createHTTPClient,
  createHTTPClientWithPreset,
  HTTPClientFactory,
  isClientError,
  isAuthenticationError,
} from '@/interfaces/clients';
```

**Backward compatible imports:**
```typescript
import { APIClient, createAPIClient } from '@/interfaces/clients';
```

## ⚠️ **Breaking Changes**

The UACL implementation is designed to be **fully backward compatible**. However, if you choose to migrate to the full UACL client, be aware of these differences:

1. **Async client creation**: UACL clients are created asynchronously
   ```typescript
   // Old: Synchronous
   const client = new APIClient(config);
   
   // New: Asynchronous
   const client = await createHTTPClient(config);
   ```

2. **Response format**: UACL responses include additional metadata
   ```typescript
   // Old: Direct data
   const users = await client.coordination.listAgents();
   
   // New: Response wrapper
   const response = await client.get('/api/v1/coordination/agents');
   const users = response.data;
   ```

3. **Error types**: Enhanced error information
   ```typescript
   // Old: Axios errors
   catch (error) {
     console.log(error.response.status);
   }
   
   // New: UACL error types
   catch (error) {
     if (isClientError(error)) {
       console.log(error.code, error.client);
     }
   }
   ```

## 🎯 **Recommended Migration Path**

1. **Phase 1**: Keep existing code, gain automatic UACL benefits
2. **Phase 2**: Add new UACL features where beneficial (monitoring, enhanced auth)
3. **Phase 3**: Consider full UACL migration for new code
4. **Phase 4**: Gradually refactor existing code to full UACL if desired

## 🆘 **Support**

- **Documentation**: See `/src/interfaces/clients/examples/` for usage examples
- **Type Definitions**: All interfaces are fully typed with TypeScript
- **Error Handling**: Use provided type guards for robust error handling
- **Testing**: Mock clients using the IClient interface for easy testing

## 📈 **Benefits Summary**

Migrating to UACL provides:
- **100% backward compatibility** - existing code continues to work
- **Enhanced reliability** - better retry logic, health monitoring, error handling
- **Improved observability** - built-in metrics, performance tracking
- **Better authentication** - OAuth support, token refresh, custom auth
- **Simplified management** - factory pattern, configuration presets
- **Future-proof** - unified interface for all client types (HTTP, WebSocket, etc.)

The migration is designed to be **gradual and optional** - you can adopt UACL features at your own pace while maintaining full compatibility with existing code.