/**
 * HTTP Client Usage Examples
 *
 * Demonstrates how to use the UACL HTTP Client Adapter and Factory
 * for various use cases and scenarios.
 */

import {
  createHTTPClient,
  createHTTPClientWithPreset,
  createLoadBalancedHTTPClients,
  HTTPClientAdapter,
  HTTPClientFactory,
  isAuthenticationError,
  isClientError,
  isConnectionError,
  UACL_PRESETS,
} from '../index';

// ===== BASIC USAGE =====

/**
 * Example 1: Basic HTTP client creation
 */
async function basicUsage() {
  console.log('=== Basic HTTP Client Usage ===');

  // Create a simple HTTP client
  const client = await createHTTPClient({
    name: 'api-client',
    baseURL: 'https://api.example.com',
    timeout: 30000,
  });

  try {
    // Make requests
    const users = await client.get('/users');
    console.log('Users:', users.data);

    const newUser = await client.post('/users', {
      name: 'John Doe',
      email: 'john@example.com',
    });
    console.log('Created user:', newUser.data);

    // Check client status
    const status = await client.healthCheck();
    console.log('Client status:', status);

    // Get performance metrics
    const metrics = await client.getMetrics();
    console.log('Client metrics:', metrics);
  } catch (error) {
    if (isClientError(error)) {
      console.error(`Client error: ${error.code} - ${error.message}`);
    } else {
      console.error('Unknown error:', error);
    }
  } finally {
    await client.destroy();
  }
}

// ===== AUTHENTICATION EXAMPLES =====

/**
 * Example 2: Bearer token authentication
 */
async function bearerTokenAuth() {
  console.log('=== Bearer Token Authentication ===');

  const client = await createHTTPClient({
    name: 'auth-api-client',
    baseURL: 'https://api.example.com',
    authentication: {
      type: 'bearer',
      token: 'your-jwt-token-here',
    },
  });

  try {
    const profile = await client.get('/profile');
    console.log('User profile:', profile.data);
  } catch (error) {
    if (isAuthenticationError(error)) {
      console.error('Authentication failed - token may be expired');
    }
  } finally {
    await client.destroy();
  }
}

/**
 * Example 3: API key authentication
 */
async function apiKeyAuth() {
  console.log('=== API Key Authentication ===');

  const client = await createHTTPClient({
    name: 'api-key-client',
    baseURL: 'https://api.example.com',
    authentication: {
      type: 'apikey',
      apiKey: 'your-api-key-here',
      apiKeyHeader: 'X-API-Key', // Optional, defaults to X-API-Key
    },
  });

  try {
    const data = await client.get('/protected-endpoint');
    console.log('Protected data:', data.data);
  } finally {
    await client.destroy();
  }
}

/**
 * Example 4: OAuth authentication with token refresh
 */
async function oauthAuth() {
  console.log('=== OAuth Authentication ===');

  const client = await createHTTPClient({
    name: 'oauth-client',
    baseURL: 'https://api.example.com',
    authentication: {
      type: 'oauth',
      credentials: {
        clientId: 'your-client-id',
        clientSecret: 'your-client-secret',
        tokenUrl: 'https://auth.example.com/token',
        scope: 'read write',
        accessToken: 'current-access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      },
    },
  });

  try {
    // The client will automatically refresh the token if it's expired
    const data = await client.get('/protected-resource');
    console.log('OAuth protected data:', data.data);
  } finally {
    await client.destroy();
  }
}

// ===== RETRY AND RESILIENCE =====

/**
 * Example 5: Advanced retry configuration
 */
async function retryConfiguration() {
  console.log('=== Advanced Retry Configuration ===');

  const client = await createHTTPClient({
    name: 'resilient-client',
    baseURL: 'https://api.example.com',
    retry: {
      attempts: 5,
      delay: 1000,
      backoff: 'exponential',
      maxDelay: 10000,
      retryStatusCodes: [408, 429, 500, 502, 503, 504],
      retryMethods: ['GET', 'POST', 'PUT'],
      retryCondition: (error) => {
        // Custom retry logic
        return error.response?.status >= 500 || !error.response;
      },
    },
  });

  // Listen for retry events
  client.on('retry', (info) => {
    console.log(`Retry attempt ${info.attempt} after ${info.delay}ms: ${info.error}`);
  });

  try {
    const data = await client.get('/unreliable-endpoint');
    console.log('Data received after retries:', data.data);
  } finally {
    await client.destroy();
  }
}

// ===== MONITORING AND HEALTH CHECKS =====

/**
 * Example 6: Monitoring and health checks
 */
async function monitoringExample() {
  console.log('=== Monitoring and Health Checks ===');

  const client = await createHTTPClient({
    name: 'monitored-client',
    baseURL: 'https://api.example.com',
    monitoring: {
      enabled: true,
      metricsInterval: 30000, // 30 seconds
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
    },
    health: {
      endpoint: '/health',
      interval: 10000, // 10 seconds
      timeout: 5000,
      failureThreshold: 3,
      successThreshold: 2,
    },
  });

  // Listen for health status changes
  client.on('connect', () => {
    console.log('Client connected and healthy');
  });

  client.on('disconnect', () => {
    console.log('Client disconnected');
  });

  client.on('error', (error) => {
    console.error('Client error:', error);
  });

  try {
    // Connect and start health monitoring
    await client.connect();

    // Make some requests to generate metrics
    for (let i = 0; i < 10; i++) {
      try {
        await client.get(`/data/${i}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Request ${i} failed:`, error);
      }
    }

    // Get final metrics
    const metrics = await client.getMetrics();
    console.log('Final metrics:', {
      requests: metrics.requestCount,
      success: metrics.successCount,
      errors: metrics.errorCount,
      avgLatency: metrics.averageLatency,
      p95Latency: metrics.p95Latency,
      throughput: metrics.throughput,
    });
  } finally {
    await client.destroy();
  }
}

// ===== FACTORY USAGE =====

/**
 * Example 7: Using the HTTP Client Factory
 */
async function factoryUsage() {
  console.log('=== HTTP Client Factory Usage ===');

  const factory = new HTTPClientFactory();

  try {
    // Create multiple clients
    const clients = await factory.createMultiple([
      {
        name: 'users-api',
        baseURL: 'https://users.example.com',
        authentication: { type: 'bearer', token: 'users-token' },
      },
      {
        name: 'orders-api',
        baseURL: 'https://orders.example.com',
        authentication: { type: 'apikey', apiKey: 'orders-key' },
      },
      {
        name: 'inventory-api',
        baseURL: 'https://inventory.example.com',
        authentication: { type: 'basic', username: 'admin', password: 'secret' },
      },
    ]);

    console.log(`Created ${clients.length} clients`);

    // Get a specific client
    const usersClient = factory.get('users-api');
    if (usersClient) {
      const users = await usersClient.get('/users');
      console.log('Users from factory client:', users.data);
    }

    // Health check all clients
    const healthResults = await factory.healthCheckAll();
    for (const [name, status] of healthResults) {
      console.log(`${name}: ${status.status} (${status.responseTime}ms)`);
    }

    // Get metrics for all clients
    const metricsResults = await factory.getMetricsAll();
    for (const [name, metrics] of metricsResults) {
      console.log(`${name}: ${metrics.requestCount} requests, ${metrics.errorCount} errors`);
    }
  } finally {
    await factory.shutdown();
  }
}

// ===== PRESET CONFIGURATIONS =====

/**
 * Example 8: Using configuration presets
 */
async function presetUsage() {
  console.log('=== Configuration Presets ===');

  // Development preset with relaxed timeouts
  const devClient = await createHTTPClientWithPreset(
    'dev-client',
    'https://dev-api.example.com',
    'development'
  );

  // Production preset with optimized settings
  const prodClient = await createHTTPClientWithPreset(
    'prod-client',
    'https://api.example.com',
    'production',
    {
      authentication: {
        type: 'bearer',
        token: 'production-token',
      },
    }
  );

  // High-availability preset with aggressive health checks
  const haClient = await createHTTPClientWithPreset(
    'ha-client',
    'https://ha-api.example.com',
    'highAvailability'
  );

  try {
    // Use the clients...
    const devData = await devClient.get('/test');
    const prodData = await prodClient.get('/data');
    const haData = await haClient.get('/critical');

    console.log('All preset clients working correctly');
  } finally {
    await Promise.all([devClient.destroy(), prodClient.destroy(), haClient.destroy()]);
  }
}

// ===== LOAD BALANCING =====

/**
 * Example 9: Load-balanced HTTP clients
 */
async function loadBalancingExample() {
  console.log('=== Load-Balanced HTTP Clients ===');

  // Create load-balanced clients across multiple endpoints
  const clients = await createLoadBalancedHTTPClients(
    'api-cluster',
    ['https://api1.example.com', 'https://api2.example.com', 'https://api3.example.com'],
    'production'
  );

  console.log(`Created ${clients.length} load-balanced clients`);

  try {
    // Simple round-robin usage
    for (let i = 0; i < 10; i++) {
      const client = clients[i % clients.length];
      try {
        const response = await client.get('/data');
        console.log(`Request ${i} handled by ${client.name}: ${response.status}`);
      } catch (error) {
        console.error(`Request ${i} failed on ${client.name}:`, error);
      }
    }
  } finally {
    await Promise.all(clients.map((client) => client.destroy()));
  }
}

// ===== BACKWARD COMPATIBILITY =====

/**
 * Example 10: Backward compatibility with existing APIClient
 */
async function backwardCompatibility() {
  console.log('=== Backward Compatibility ===');

  // Import the compatible API client
  const { APIClient, createAPIClient } = await import('../wrappers/api-client-wrapper');

  // Create client using the old interface
  const apiClient = createAPIClient({
    baseURL: 'https://api.example.com',
    bearerToken: 'your-token-here',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  });

  try {
    // Use the old interface methods (all still work)
    const agents = await apiClient.coordination.listAgents();
    console.log('Agents:', agents);

    const networks = await apiClient.neural.listNetworks();
    console.log('Networks:', networks);

    // Use new UACL features
    const status = await apiClient.getClientStatus();
    console.log('UACL Status:', status);

    const metrics = await apiClient.getClientMetrics();
    console.log('UACL Metrics:', metrics);

    // Test connectivity
    const isOnline = await apiClient.ping();
    console.log('API is online:', isOnline);
  } finally {
    await apiClient.destroy();
  }
}

// ===== ERROR HANDLING =====

/**
 * Example 11: Comprehensive error handling
 */
async function errorHandlingExample() {
  console.log('=== Error Handling ===');

  const client = await createHTTPClient({
    name: 'error-demo-client',
    baseURL: 'https://httpstat.us', // Service that returns specific status codes
    retry: {
      attempts: 2,
      delay: 1000,
      backoff: 'fixed',
    },
  });

  const testCases = [
    { endpoint: '/200', description: 'Success' },
    { endpoint: '/404', description: 'Not Found' },
    { endpoint: '/401', description: 'Unauthorized' },
    { endpoint: '/500', description: 'Server Error' },
    { endpoint: '/timeout', description: 'Timeout' },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing ${testCase.description}...`);
      const response = await client.get(testCase.endpoint);
      console.log(`✅ ${testCase.description}: ${response.status}`);
    } catch (error) {
      if (isConnectionError(error)) {
        console.error(`❌ Connection Error: ${error.message}`);
      } else if (isAuthenticationError(error)) {
        console.error(`❌ Auth Error: ${error.message}`);
      } else if (isClientError(error)) {
        console.error(`❌ Client Error: ${error.code} - ${error.message}`);
      } else {
        console.error(`❌ Unknown Error: ${error}`);
      }
    }
  }

  await client.destroy();
}

// ===== MAIN EXECUTION =====

/**
 * Run all examples
 */
async function runAllExamples() {
  const examples = [
    basicUsage,
    bearerTokenAuth,
    apiKeyAuth,
    oauthAuth,
    retryConfiguration,
    monitoringExample,
    factoryUsage,
    presetUsage,
    loadBalancingExample,
    backwardCompatibility,
    errorHandlingExample,
  ];

  for (const example of examples) {
    try {
      await example();
      console.log(''); // Add spacing between examples
    } catch (error) {
      console.error(`Example ${example.name} failed:`, error);
      console.log(''); // Add spacing between examples
    }
  }

  console.log('All examples completed!');
}

// Export for use in other modules
export {
  basicUsage,
  bearerTokenAuth,
  apiKeyAuth,
  oauthAuth,
  retryConfiguration,
  monitoringExample,
  factoryUsage,
  presetUsage,
  loadBalancingExample,
  backwardCompatibility,
  errorHandlingExample,
  runAllExamples,
};

// If this file is run directly, execute all examples
if (require.main === module) {
  runAllExamples().catch(console.error);
}
