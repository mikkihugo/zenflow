/**
 * Server Examples;
 * Demonstrates how to use the TypeScript server implementations;
 */
import {
  authenticate,
  authorize,
  corsMiddleware,
  rateLimiter,
  requestLogger } from '../src/middleware/index.js'
import {
  createAPIServer,
  createMCPServer,
  createServerBuilder,
  createUnifiedServer,
  serverFactory } from '../src/server-factory.js'
// Import types
import type {
  MiddlewareDefinition,
  RouteDefinition,
  ServerConfig,
  UserContext } from '../src/types/server.js'

import { HealthMonitor } from '../src/utils/health-monitor.js';
/**
 * Example 1: Basic Unified Server;
 */
export async function example1_basicUnifiedServer(): Promise<void> {
  console.warn('🚀 Example 1: Basic Unified Server');
// const server = awaitcreateUnifiedServer({
    name: 'Example Unified Server',
    host: '0.0.0.0',
    port,
    enableAPI,
    enableMCP,
    enableWebSocket,
    enableNeural,
    enableAGUI,
    enableMetrics,
    enableCORS,
    enableRateLimit,
    enableAuth,
    enableSwagger,
    enableGraphQL,
    enableSSE,
    enableGRPC,
    enableHotReload,
    enableDebugMode,
    enableTracing,
    enableCSRF});
// await server.start();
  console.warn('✅ Unified server started on port 3001');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.warn('\n🛑 Shutting down unified server...');
// await server.stop();
    process.exit(0);
  });
// }
/**
 * Example 2: API-Only Server with Custom Middleware
 */
export async function example2_apiServerWithMiddleware(): Promise<void> {
  console.warn('🚀 Example 2: API Server with Custom Middleware');
// const server = awaitcreateAPIServer(3002, '0.0.0.0');

  // Add custom middleware
  if ('addMiddleware' in server) {
    // Authentication middleware
    const authMiddleware: MiddlewareDefinition = {
      name: 'authentication',
      handler: authenticate({
        required,
        extractUser: async (token: string): Promise<UserContext | null> => {
          // Mock user extraction - replace with real implementation
          if (token === 'valid-token') {
            return {
              id: 'user-123',
              email: 'test@example.com',
              roles: ['user'],
              permissions: ['read', 'write'] };
// }
          return null;
// }
      }),
      order,
      enabled};
    server.addMiddleware(authMiddleware);

    // Authorization middleware
    const authzMiddleware: MiddlewareDefinition = {
      name: 'authorization',
      handler: authorize(['read', 'write']),
      order,
      routes: ['/api/protected/*'],
      enabled};
    server.addMiddleware(authzMiddleware);

    // Custom API route
    const protectedRoute: RouteDefinition = {
      path: '/api/protected/data',
      method: 'GET',
      handler: async (req, res) => {
        res.success({
          message: 'Protected data accessed successfully',
          user: req.user,
          timestamp: new Date().toISOString() });
      },
      auth,
      cache};
    server.addRoute(protectedRoute);
// }
// await server.start();
  console.warn('✅ API server with middleware started on port 3002');
  console.warn(
    '💡 Try: curl -H "Authorization: Bearer valid-token" http://localhost:3002/api/protected/data'
  );
// }
/**
 * Example 3: MCP Server with Health Monitoring
 */
export async function example3_mcpServerWithHealthMonitoring(): Promise<void> {
  console.warn('🚀 Example 3: MCP Server with Health Monitoring');
// const server = awaitcreateMCPServer(3003, '0.0.0.0');

  // Create health monitor
  const healthMonitor = new HealthMonitor({
    checkInterval, // 10 seconds
    timeout,
    retries,
    enabled,
    checks: [],
    memory: 0.8,
    cpu: 0.8,
    disk: 0.9,
    responseTime});

  // Add custom health checks
  healthMonitor.addCheck({
    name: 'mcp_server_health',
    type: 'service',
    url: 'http://localhost:3003/health',
    timeout,
    interval,
    retries,
    critical});

  // Monitor health events
  healthMonitor.on('health-changed', (health) => {
    console.warn(`🏥 Health status changed: ${health.status}`);
    if (health.status === 'error') {
      console.warn('❌ Critical health issues detected:', health.recommendations);
// }
  });

  healthMonitor.on('threshold-exceeded', (metric, value, threshold) => {
    console.warn(`⚠️ Threshold exceeded: ${metric} = ${value} > ${threshold}`);
  });

  // Start monitoring
  healthMonitor.start();
// await server.start();
  console.warn('✅ MCP server with health monitoring started on port 3003');
  console.warn('🏥 Health monitoring active');
  console.warn('💡 Try: curl http://localhost:3003/health');
// }
/**
 * Example 4: Advanced Server Builder
 */
export async function example4_advancedServerBuilder(): Promise<void> {
  console.warn('🚀 Example 4: Advanced Server Builder');
// const server = awaitcreateServerBuilder()
withConfig({
      name: 'Advanced Custom Server',
      host: '0.0.0.0',
      port,
      environment: 'development'
})
withProtocol('http', true)
withProtocol('ws', true)
withProtocol('mcp', true)
withFeature('enableAPI', true)
withFeature('enableWebSocket', true)
withFeature('enableMCP', true)
withFeature('enableNeural', false)
withFeature('enableMetrics', true)
withFeature('enableCORS', true)
withFeature('enableRateLimit', true)
withMiddleware({
      name: 'request_logger',
      handler: requestLogger(),
      order,
      enabled})
withMiddleware({
      name: 'cors',
      handler: corsMiddleware({
        origins: ['http://localhost:3000', 'http://localhost:8080'],
        credentials,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization', 'X-Requested-With'] }),
      order,
      enabled})
withMiddleware({
      name: 'rate_limiter',
      handler: rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max, // 100 requests per window
        message: 'Too many requests from this IP' }),
      order,
      enabled})
withRoute({
      path: '/api/status',
      method: 'GET',
      handler: async (_req, res) => {
        const status = 'getStatus' in server ? server.getStatus() : { running};
        res.success(status, 'Server status retrieved');
// }
})
withRoute({
      path: '/api/echo',
      method: 'POST',
      handler: async (req, res) => {
        const body = req.typedBody<{ message}>();
        res.success({
          echo: body.message,
          timestamp: new Date().toISOString(),
          correlation: req.correlation?.id });
// }
})
withHealthCheck({
      name: 'custom_endpoint_check',
      type: 'url',
      url: 'http://localhost:3004/api/status',
      timeout,
      interval,
      retries,
      critical})
build();
// await server.start();
  console.warn('✅ Advanced custom server started on port 3004');
  console.warn('💡 Available endpoints:');
  console.warn('   • GET  /api/status   - Server status');
  console.warn('   • POST /api/echo     - Echo service');
  console.warn('   • GET  /health       - Health check');
  console.warn('   • POST /mcp          - MCP endpoint');
  console.warn('   • WS   /ws           - WebSocket connection');
// }
/**
 * Example 5: Multiple Servers with Load Balancing
 */
export async function example5_multipleServers(): Promise<void> {
  console.warn('🚀 Example 5: Multiple Servers Setup');

  // API Server
// const apiServer = awaitcreateAPIServer(3005, '0.0.0.0');

  // MCP Server
// const mcpServer = awaitcreateMCPServer(3006, '0.0.0.0');

  // WebSocket Server (using builder)
// const wsServer = awaitcreateServerBuilder()
withConfig({ port, host: '0.0.0.0' })
withProtocol('http', true)
withProtocol('ws', true)
withFeature('enableWebSocket', true)
withFeature('enableAPI', false)
withFeature('enableMCP', false)
build();

  // Start all servers
// await Promise.all([apiServer.start(), mcpServer.start(), wsServer.start()]);
  console.warn('✅ Multiple servers started:');
  console.warn('   • API Server:       http://localhost:3005');
  console.warn('   • MCP Server:       http://localhost:3006');
  console.warn('   • WebSocket Server: ws://localhost:3007/ws');

  // Graceful shutdown for all servers
  process.on('SIGINT', async () => {
    console.warn('\n🛑 Shutting down all servers...');
// await Promise.all([apiServer.stop(), mcpServer.stop(), wsServer.stop()]);
    process.exit(0);
  });
// }
/**
 * Example 6: Server Configuration Validation
 */
export async function example6_configValidation(): Promise<void> {
  console.warn('🚀 Example 6: Configuration Validation');

  // Test with invalid configuration
  const invalidConfig: Partial<ServerConfig> = {
    name: '', // Invalid: empty name
    host: 'localhost',
    port, // Invalid: port out of range
    features: {
      enableWebSocket,
      enableAPI,
      enableMCP,
      enableNeural,
      enableAGUI,
      enableMetrics,
      enableCORS,
      enableRateLimit,
      enableAuth,
      enableSwagger,
      enableGraphQL,
      enableSSE,
      enableGRPC,
      enableHotReload,
      enableDebugMode,
      enableTracing,
      enableCSRF} } as ServerConfig;

  try {
    const validation = serverFactory.validateConfig(invalidConfig as ServerConfig);

    console.warn('📋 Validation Results:');
    console.warn(`   Valid: ${validation.valid}`);

    if (validation.errors.length > 0) {
      console.warn('   ❌ Errors:');
      validation.errors.forEach((error) => {
        console.warn(`      • ${error.field}: ${error.message}`);
      });
// }
    if (validation.warnings.length > 0) {
      console.warn('   ⚠️  Warnings:');
      validation.warnings.forEach((warning) => {
        console.warn(`      • ${warning}`);
      });
// }
    // Show valid configuration
    const validConfig = serverFactory.getDefaultConfig('unified');
    console.warn('\n✅ Valid Default Configuration:');
    console.warn(`   Name: ${validConfig.name}`);
    console.warn(`   Host: ${validConfig.host}`);
    console.warn(`   Port: ${validConfig.port}`);
    console.warn(
      `   Features: ${Object.entries(validConfig.features)
filter(([ enabled]) => enabled)
map(([feature]) => feature)
join(', ')}`
    );
  } catch (error) {
    console.error('❌ Configuration validation failed:', (error as Error).message);
// }
// }
/**
 * Main example runner
 */
export async function runExamples(): Promise<void> {
  console.warn('🎯 Claude Flow Server Examples\n');

  const examples = [
    { name: 'Basic Unified Server', fn},
    { name: 'API Server with Middleware', fn},
    { name: 'MCP Server with Health Monitoring', fn},
    { name: 'Advanced Server Builder', fn},
    { name: 'Multiple Servers', fn},
    { name: 'Configuration Validation', fn} ];

  // Run configuration validation example (doesn't start servers)
// await example6_configValidation();
  console.warn('\n🎉 Examples completed! Choose an example to run:');
  examples.slice(0, -1).forEach((example, index) => {
    console.warn(`${index + 1}. ${example.name}`);
  });

  console.warn('\n💡 To run an example, uncomment the respective function call below.');
  console.warn('⚠️  Note: Each example starts servers on different ports to avoid conflicts.');
// }
// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch((error) => {
    console.error('❌ Example execution failed:', error);
    process.exit(1);
  });
// }
// Export individual examples for selective execution
export default {
  runExamples,
  example1_basicUnifiedServer,
  example2_apiServerWithMiddleware,
  example3_mcpServerWithHealthMonitoring,
  example4_advancedServerBuilder,
  example5_multipleServers,
  example6_configValidation };
