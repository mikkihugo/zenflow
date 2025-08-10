/**
 * @file Interface implementation: websocket-demo.
 */

import { getLogger } from '../config/logging-config';

const logger = getLogger('interfaces-clients-adapters-websocket-demo');

/**
 * WebSocket Client Adapter Demo.
 *
 * Demonstrates how to use the UACL WebSocket client adapters.
 * And showcases the migration from legacy to UACL patterns.
 */

// Legacy WebSocket client for comparison
import { WebSocketClient as LegacyWebSocketClient } from '../api/websocket/client';
import {
  createOptimalWebSocketClient,
  createSimpleWebSocketClient,
  EnhancedWebSocketClient,
  // UACL WebSocket components
  WebSocketClientAdapter,
  WebSocketClientFactory,
  // Utilities and presets
  WebSocketClientPresets,
  WebSocketHealthMonitor,
} from './websocket-index';

/**
 * Example 1: Basic UACL WebSocket Client Usage.
 *
 * @example
 */
export async function basicUACLWebSocketExample() {
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
  client.on('connect', () => {});

  client.on('message', (data) => {});

  client.on('disconnect', (code, reason) => {});

  try {
    // Connect using UACL interface
    await client.connect();

    // Send a test message using REST-like interface
    const response = await client.post('/test', { message: 'Hello UACL!' });

    // Get health status
    const health = await client.healthCheck();

    // Get metrics
    const metrics = await client.getMetrics();

    // Disconnect
    await client.disconnect();
  } catch (error) {
    logger.error('❌ Error:', error);
  }
}

/**
 * Example 2: Enhanced WebSocket Client with Legacy Compatibility.
 *
 * @example
 */
export async function enhancedWebSocketExample() {
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
    try {
      await client.connect();

      // Legacy method (works on both)
      client.send({ type: 'test', data: `Hello from ${name}` });

      // UACL method (works on both)
      const health = await client.healthCheck();

      await client.disconnect();
    } catch (error) {
      logger.error(`❌ ${name} Client Error:`, error);
    }
  }
}

/**
 * Example 3: WebSocket Client Factory Usage.
 *
 * @example
 */
export async function webSocketFactoryExample() {
  const factory = new WebSocketClientFactory();

  // Create multiple clients with different configurations
  const configs: WebSocketClientConfig[] = [
    WebSocketClientPresets['HighPerformance']('wss://echo.websocket.org'),
    WebSocketClientPresets.Robust('wss://echo.websocket.org'),
    WebSocketClientPresets.Simple('wss://echo.websocket.org'),
  ];

  try {
    // Create all clients
    const _clients = await factory.createMultiple(configs);

    // Health check all clients
    const healthResults = await factory.healthCheckAll();
    for (const [name, status] of healthResults) {
    }

    // Get metrics for all clients
    const metricsResults = await factory.getMetricsAll();
    for (const [name, metrics] of metricsResults) {
    }

    // Shutdown all clients
    await factory.shutdown();
  } catch (error) {
    logger.error('❌ Factory Error:', error);
  }
}

/**
 * Example 4: Load Balanced WebSocket Clients.
 *
 * @example
 */
export async function loadBalancedWebSocketExample() {
  const factory = new WebSocketClientFactory();

  // Create load-balanced client with multiple endpoints
  const configs = [
    { ...WebSocketClientPresets['HighPerformance']('wss://echo.websocket.org'), name: 'echo-1' },
    {
      ...WebSocketClientPresets['HighPerformance']('wss://ws.postman-echo.com/raw'),
      name: 'postman-1',
    },
  ];

  try {
    const loadBalancedClient = await factory.createLoadBalanced(configs, 'round-robin');

    // Use the load balanced client
    const health = await loadBalancedClient.healthCheck();

    // Send requests - they will be distributed across endpoints
    for (let i = 0; i < 5; i++) {
      try {
        const response = await loadBalancedClient.post('/test', {
          message: `Load balanced message ${i}`,
        });
      } catch (error) {
        logger.error(`❌ Request ${i} failed:`, error);
      }
    }

    await loadBalancedClient.destroy();
  } catch (error) {
    logger.error('❌ Load Balanced Error:', error);
  }
}

/**
 * Example 5: Failover WebSocket Client.
 *
 * @example
 */
export async function failoverWebSocketExample() {
  const factory = new WebSocketClientFactory();

  try {
    // Create failover client with primary and fallback endpoints
    const primaryConfig = WebSocketClientPresets['HighPerformance'](
      'wss://invalid-url.example.com'
    );
    const fallbackConfigs = [
      WebSocketClientPresets['HighPerformance']('wss://echo.websocket.org'),
      WebSocketClientPresets['HighPerformance']('wss://ws.postman-echo.com/raw'),
    ];

    // This will fail on primary but succeed on fallback
    const failoverClient = await factory.createFailover(primaryConfig, fallbackConfigs);

    const health = await failoverClient.healthCheck();

    await failoverClient.destroy();
  } catch (error) {
    logger.error('❌ Failover Error:', error);
  }
}

/**
 * Example 6: WebSocket Health Monitoring.
 *
 * @example
 */
export async function webSocketHealthMonitoringExample() {
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

  // Get initial health status
  const healthStatus = await monitor.getHealthStatus();
  for (const [name, status] of healthStatus) {
  }

  // Let monitoring run for a bit
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Stop monitoring and cleanup
  monitor.stopAll();
  await client1.destroy();
  await client2.destroy();
}

/**
 * Example 7: Migration from Legacy to UACL.
 *
 * @example
 */
export async function migrationExample() {
  const legacyClient = new LegacyWebSocketClient('wss://echo.websocket.org', {
    reconnect: true,
    reconnectInterval: 1000,
    maxReconnectAttempts: 3,
    timeout: 30000,
  });

  legacyClient.on('connected', () => {
    legacyClient.send({ type: 'test', message: 'Hello from legacy' });
  });

  legacyClient.on('message', (data) => {});

  try {
    await legacyClient.connect();

    legacyClient.disconnect();
  } catch (error) {
    logger.error('Legacy: Error:', error);
  }
  const enhancedClient = new EnhancedWebSocketClient('wss://echo.websocket.org', {
    reconnect: true,
    reconnectInterval: 1000,
    maxReconnectAttempts: 3,
    timeout: 30000,
  });

  // Same legacy events work
  enhancedClient.on('connected', () => {
    enhancedClient.send({ type: 'test', message: 'Hello from enhanced' });
  });

  enhancedClient.on('message', (data) => {});

  try {
    await enhancedClient.connect();

    // But now UACL methods are also available
    const health = await enhancedClient.healthCheck();

    const metrics = await enhancedClient.getMetrics();

    // Enhanced WebSocket-specific features
    const _connectionInfo = enhancedClient.getConnectionInfo();

    await enhancedClient.disconnect();
  } catch (error) {
    logger.error('Enhanced: Error:', error);
  }
}

/**
 * Run all examples.
 *
 * @example
 */
export async function runAllWebSocketExamples() {
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
      await example.fn();

      // Wait a bit between examples
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      logger.error(`❌ ${example.name} failed:`, error);
    }
  }
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
