/**
 * WebSocket Client Adapter Demo
 *
 * Demonstrates how to use the UACL WebSocket client adapters
 * and showcases the migration from legacy to UACL patterns.
 */

// Legacy WebSocket client for comparison
import { WebSocketClient as LegacyWebSocketClient } from '../../api/websocket/client';
import {
  type ClientMetrics,
  type ClientStatus,
  createOptimalWebSocketClient,
  createSimpleWebSocketClient,
  EnhancedWebSocketClient,
  FailoverWebSocketClient,
  // Core UACL interfaces
  type IClient,
  LoadBalancedWebSocketClient,
  // UACL WebSocket components
  WebSocketClientAdapter,
  // Configuration types
  type WebSocketClientConfig,
  WebSocketClientFactory,
  // Utilities and presets
  WebSocketClientPresets,
  WebSocketHealthMonitor,
} from './websocket-index';

/**
 * Example 1: Basic UACL WebSocket Client Usage
 */
export async function basicUACLWebSocketExample() {
  console.log('🚀 Basic UACL WebSocket Client Example');

  // Create a WebSocket client using UACL configuration
  const config: WebSocketClientConfig = {
    name: 'demo-websocket',
    baseURL: 'wss://echo.websocket.org',
    url: 'wss://echo.websocket.org',
    timeout: 30000,
    reconnection: {
      enabled: true,
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoff: 'exponential',
    },
    heartbeat: {
      enabled: true,
      interval: 30000,
      message: { type: 'ping' },
    },
    messageQueue: {
      enabled: true,
      maxSize: 1000,
    },
  };

  const client = new WebSocketClientAdapter(config);

  // Set up event listeners
  client.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
  });

  client.on('message', (data) => {
    console.log('📨 Received message:', data);
  });

  client.on('disconnect', (code, reason) => {
    console.log('❌ Disconnected:', code, reason);
  });

  try {
    // Connect using UACL interface
    await client.connect();

    // Send a test message using REST-like interface
    const response = await client.post('/test', { message: 'Hello UACL!' });
    console.log('📤 Response:', response);

    // Get health status
    const health = await client.healthCheck();
    console.log('🏥 Health:', health);

    // Get metrics
    const metrics = await client.getMetrics();
    console.log('📊 Metrics:', metrics);

    // Disconnect
    await client.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Example 2: Enhanced WebSocket Client with Legacy Compatibility
 */
export async function enhancedWebSocketExample() {
  console.log('🚀 Enhanced WebSocket Client Example');

  // Create using legacy constructor pattern (backward compatibility)
  const legacyClient = new EnhancedWebSocketClient('wss://echo.websocket.org', {
    reconnect: true,
    reconnectInterval: 1000,
    maxReconnectAttempts: 5,
    timeout: 30000,
  });

  // Create using UACL config pattern
  const uaclConfig: WebSocketClientConfig = {
    name: 'enhanced-demo',
    baseURL: 'wss://echo.websocket.org',
    url: 'wss://echo.websocket.org',
    timeout: 30000,
  };

  const uaclClient = new EnhancedWebSocketClient(uaclConfig);

  // Both clients support the same interface
  for (const [name, client] of [
    ['Legacy', legacyClient],
    ['UACL', uaclClient],
  ] as const) {
    console.log(`\n--- ${name} Client ---`);

    try {
      await client.connect();

      // Legacy method (works on both)
      client.send({ type: 'test', data: 'Hello from ' + name });

      // UACL method (works on both)
      const health = await client.healthCheck();
      console.log(`${name} Health:`, health.status);

      await client.disconnect();
    } catch (error) {
      console.error(`❌ ${name} Client Error:`, error);
    }
  }
}

/**
 * Example 3: WebSocket Client Factory Usage
 */
export async function webSocketFactoryExample() {
  console.log('🚀 WebSocket Client Factory Example');

  const factory = new WebSocketClientFactory();

  // Create multiple clients with different configurations
  const configs: WebSocketClientConfig[] = [
    WebSocketClientPresets.HighPerformance('wss://echo.websocket.org'),
    WebSocketClientPresets.Robust('wss://echo.websocket.org'),
    WebSocketClientPresets.Simple('wss://echo.websocket.org'),
  ];

  try {
    // Create all clients
    const clients = await factory.createMultiple(configs);
    console.log(`✅ Created ${clients.length} WebSocket clients`);

    // Health check all clients
    const healthResults = await factory.healthCheckAll();
    console.log('🏥 Health Results:');
    for (const [name, status] of healthResults) {
      console.log(`  ${name}: ${status.status} (${status.responseTime}ms)`);
    }

    // Get metrics for all clients
    const metricsResults = await factory.getMetricsAll();
    console.log('📊 Metrics Results:');
    for (const [name, metrics] of metricsResults) {
      console.log(`  ${name}: ${metrics.requestCount} requests, ${metrics.throughput} req/s`);
    }

    // Shutdown all clients
    await factory.shutdown();
    console.log('✅ All clients shut down');
  } catch (error) {
    console.error('❌ Factory Error:', error);
  }
}

/**
 * Example 4: Load Balanced WebSocket Clients
 */
export async function loadBalancedWebSocketExample() {
  console.log('🚀 Load Balanced WebSocket Example');

  const factory = new WebSocketClientFactory();

  // Create load-balanced client with multiple endpoints
  const configs = [
    { ...WebSocketClientPresets.HighPerformance('wss://echo.websocket.org'), name: 'echo-1' },
    {
      ...WebSocketClientPresets.HighPerformance('wss://ws.postman-echo.com/raw'),
      name: 'postman-1',
    },
  ];

  try {
    const loadBalancedClient = await factory.createLoadBalanced(configs, 'round-robin');

    console.log('✅ Load balanced client created');

    // Use the load balanced client
    const health = await loadBalancedClient.healthCheck();
    console.log('🏥 Load Balanced Health:', health);

    // Send requests - they will be distributed across endpoints
    for (let i = 0; i < 5; i++) {
      try {
        const response = await loadBalancedClient.post('/test', {
          message: `Load balanced message ${i}`,
        });
        console.log(`📤 Request ${i} Response:`, response.status);
      } catch (error) {
        console.error(`❌ Request ${i} failed:`, error);
      }
    }

    await loadBalancedClient.destroy();
    console.log('✅ Load balanced client destroyed');
  } catch (error) {
    console.error('❌ Load Balanced Error:', error);
  }
}

/**
 * Example 5: Failover WebSocket Client
 */
export async function failoverWebSocketExample() {
  console.log('🚀 Failover WebSocket Example');

  const factory = new WebSocketClientFactory();

  try {
    // Create failover client with primary and fallback endpoints
    const primaryConfig = WebSocketClientPresets.HighPerformance('wss://invalid-url.example.com');
    const fallbackConfigs = [
      WebSocketClientPresets.HighPerformance('wss://echo.websocket.org'),
      WebSocketClientPresets.HighPerformance('wss://ws.postman-echo.com/raw'),
    ];

    // This will fail on primary but succeed on fallback
    const failoverClient = await factory.createFailover(primaryConfig, fallbackConfigs);

    console.log('✅ Failover client created (should be using fallback)');

    const health = await failoverClient.healthCheck();
    console.log('🏥 Failover Health:', health);

    await failoverClient.destroy();
    console.log('✅ Failover client destroyed');
  } catch (error) {
    console.error('❌ Failover Error:', error);
  }
}

/**
 * Example 6: WebSocket Health Monitoring
 */
export async function webSocketHealthMonitoringExample() {
  console.log('🚀 WebSocket Health Monitoring Example');

  const monitor = new WebSocketHealthMonitor();

  // Create clients to monitor
  const client1 = await createSimpleWebSocketClient('wss://echo.websocket.org', {
    useEnhanced: true,
  });

  const client2 = await createOptimalWebSocketClient(
    WebSocketClientPresets.Robust('wss://ws.postman-echo.com/raw')
  );

  // Add clients to monitoring
  monitor.addClient('echo-client', client1, 10000); // Check every 10 seconds
  monitor.addClient('postman-client', client2, 15000); // Check every 15 seconds

  console.log('✅ Started health monitoring for 2 clients');

  // Get initial health status
  const healthStatus = await monitor.getHealthStatus();
  console.log('🏥 Initial Health Status:');
  for (const [name, status] of healthStatus) {
    console.log(`  ${name}: ${status.status}`);
  }

  // Let monitoring run for a bit
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Stop monitoring and cleanup
  monitor.stopAll();
  await client1.destroy();
  await client2.destroy();

  console.log('✅ Health monitoring stopped and clients cleaned up');
}

/**
 * Example 7: Migration from Legacy to UACL
 */
export async function migrationExample() {
  console.log('🚀 Migration from Legacy to UACL Example');

  // Legacy WebSocket client usage
  console.log('\n--- Legacy WebSocket Client ---');
  const legacyClient = new LegacyWebSocketClient('wss://echo.websocket.org', {
    reconnect: true,
    reconnectInterval: 1000,
    maxReconnectAttempts: 3,
    timeout: 30000,
  });

  legacyClient.on('connected', () => {
    console.log('Legacy: Connected');
    legacyClient.send({ type: 'test', message: 'Hello from legacy' });
  });

  legacyClient.on('message', (data) => {
    console.log('Legacy: Received:', data);
  });

  try {
    await legacyClient.connect();
    console.log('Legacy: Connection properties:', {
      connected: legacyClient.connected,
      connectionUrl: legacyClient.connectionUrl,
      queuedMessages: legacyClient.queuedMessages,
    });

    legacyClient.disconnect();
  } catch (error) {
    console.error('Legacy: Error:', error);
  }

  // UACL Enhanced WebSocket client (backward compatible)
  console.log('\n--- UACL Enhanced WebSocket Client (Backward Compatible) ---');
  const enhancedClient = new EnhancedWebSocketClient('wss://echo.websocket.org', {
    reconnect: true,
    reconnectInterval: 1000,
    maxReconnectAttempts: 3,
    timeout: 30000,
  });

  // Same legacy events work
  enhancedClient.on('connected', () => {
    console.log('Enhanced: Connected');
    enhancedClient.send({ type: 'test', message: 'Hello from enhanced' });
  });

  enhancedClient.on('message', (data) => {
    console.log('Enhanced: Received:', data);
  });

  try {
    await enhancedClient.connect();

    // Legacy properties still work
    console.log('Enhanced: Legacy properties:', {
      connected: enhancedClient.connected,
      connectionUrl: enhancedClient.connectionUrl,
      queuedMessages: enhancedClient.queuedMessages,
    });

    // But now UACL methods are also available
    const health = await enhancedClient.healthCheck();
    console.log('Enhanced: UACL Health:', health.status);

    const metrics = await enhancedClient.getMetrics();
    console.log('Enhanced: UACL Metrics:', {
      requests: metrics.requestCount,
      throughput: metrics.throughput,
    });

    // Enhanced WebSocket-specific features
    const connectionInfo = enhancedClient.getConnectionInfo();
    console.log('Enhanced: Connection Info:', {
      id: connectionInfo.id,
      readyState: connectionInfo.readyState,
      messagesSent: connectionInfo.messagesSent,
    });

    await enhancedClient.disconnect();
  } catch (error) {
    console.error('Enhanced: Error:', error);
  }

  console.log(
    '\n✅ Migration example completed - Enhanced client provides 100% backward compatibility plus UACL features'
  );
}

/**
 * Run all examples
 */
export async function runAllWebSocketExamples() {
  console.log('🚀 Running All WebSocket UACL Examples\n');

  const examples = [
    { name: 'Basic UACL WebSocket', fn: basicUACLWebSocketExample },
    { name: 'Enhanced WebSocket with Legacy Compatibility', fn: enhancedWebSocketExample },
    { name: 'WebSocket Client Factory', fn: webSocketFactoryExample },
    { name: 'Load Balanced WebSocket', fn: loadBalancedWebSocketExample },
    { name: 'Failover WebSocket', fn: failoverWebSocketExample },
    { name: 'WebSocket Health Monitoring', fn: webSocketHealthMonitoringExample },
    { name: 'Migration from Legacy to UACL', fn: migrationExample },
  ];

  for (const example of examples) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎯 ${example.name}`);
      console.log('='.repeat(60));

      await example.fn();

      console.log(`✅ ${example.name} completed successfully`);

      // Wait a bit between examples
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ ${example.name} failed:`, error);
    }
  }

  console.log('\n🎉 All WebSocket UACL examples completed!');
}

// Export for individual testing
export default {
  basicUACLWebSocketExample,
  enhancedWebSocketExample,
  webSocketFactoryExample,
  loadBalancedWebSocketExample,
  failoverWebSocketExample,
  webSocketHealthMonitoringExample,
  migrationExample,
  runAllWebSocketExamples,
};
