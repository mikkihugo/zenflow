/**
 * MCP Client Adapter Tests
 *
 * Comprehensive test suite for UACL MCP client adapter
 * Tests both stdio and HTTP protocol implementations
 */

import { EventEmitter } from 'node:events';
import {
  createMCPConfigFromLegacy,
  MCPClientAdapter,
  type MCPClientConfig,
  MCPClientFactory,
} from '../mcp-client-adapter.js';

// Mock child_process for testing
jest.mock('node:child_process', () => ({
  spawn: jest.fn(),
}));

// Mock fetch for HTTP testing
global.fetch = jest.fn();

describe('MCPClientAdapter', () => {
  let adapter: MCPClientAdapter;
  let mockProcess: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock process
    mockProcess = new EventEmitter();
    mockProcess.stdin = {
      write: jest.fn((_data, callback) => {
        if (callback) callback();
      }),
    };
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    mockProcess.pid = 12345;
    mockProcess.kill = jest.fn();
    mockProcess.killed = false;

    const { spawn } = require('node:child_process');
    (spawn as jest.Mock).mockReturnValue(mockProcess);
  });

  describe('UACL Interface Compliance', () => {
    it('should implement all required IClient methods', () => {
      const config: MCPClientConfig = {
        name: 'test-client',
        baseURL: 'stdio://test',
        protocol: 'stdio',
        command: ['node', 'test.js'],
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test', version: '1.0.0' },
      };

      adapter = new MCPClientAdapter(config);

      // Check interface compliance
      expect(adapter).toHaveProperty('config');
      expect(adapter).toHaveProperty('name');
      expect(adapter).toHaveProperty('connect');
      expect(adapter).toHaveProperty('disconnect');
      expect(adapter).toHaveProperty('isConnected');
      expect(adapter).toHaveProperty('healthCheck');
      expect(adapter).toHaveProperty('getMetrics');
      expect(adapter).toHaveProperty('get');
      expect(adapter).toHaveProperty('post');
      expect(adapter).toHaveProperty('put');
      expect(adapter).toHaveProperty('delete');
      expect(adapter).toHaveProperty('updateConfig');
      expect(adapter).toHaveProperty('destroy');
      expect(adapter).toHaveProperty('on');
      expect(adapter).toHaveProperty('off');
    });

    it('should have correct configuration properties', () => {
      const config: MCPClientConfig = {
        name: 'test-client',
        baseURL: 'stdio://test',
        protocol: 'stdio',
        command: ['node', 'test.js'],
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test', version: '1.0.0' },
      };

      adapter = new MCPClientAdapter(config);

      expect(adapter.config).toMatchObject(config);
      expect(adapter.name).toBe('test-client');
    });
  });

  describe('Stdio Protocol', () => {
    beforeEach(() => {
      const config: MCPClientConfig = {
        name: 'stdio-client',
        baseURL: 'stdio://test',
        protocol: 'stdio',
        command: ['node', 'test-server.js'],
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test-server', version: '1.0.0' },
      };

      adapter = new MCPClientAdapter(config);
    });

    it('should connect via stdio protocol', async () => {
      const connectPromise = adapter.connect();

      // Simulate successful initialization response
      setTimeout(() => {
        mockProcess.stdout.emit(
          'data',
          `${JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            result: { protocolVersion: '2024-11-05' },
          })}\n`
        );
      }, 10);

      await connectPromise;

      expect(adapter.isConnected()).toBe(true);
      expect(mockProcess.stdin.write).toHaveBeenCalledWith(
        expect.stringContaining('"method":"initialize"'),
        expect.any(Function)
      );
    });

    it('should handle stdio messages correctly', async () => {
      await adapter.connect();

      // Simulate tool list response
      const toolsResponse = {
        jsonrpc: '2.0',
        id: 2,
        result: {
          tools: [
            { name: 'test-tool', description: 'A test tool' },
            { name: 'another-tool', description: 'Another test tool' },
          ],
        },
      };

      setTimeout(() => {
        mockProcess.stdout.emit('data', `${JSON.stringify(toolsResponse)}\n`);
      }, 10);

      const result = await adapter.get('/tools');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('test-tool');
    });

    it('should execute tools via stdio', async () => {
      await adapter.connect();

      // Mock tool discovery
      setTimeout(() => {
        mockProcess.stdout.emit(
          'data',
          `${JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            result: {
              tools: [{ name: 'test-tool', description: 'A test tool' }],
            },
          })}\n`
        );
      }, 10);

      // Wait for tools discovery
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Mock tool execution response
      const executionPromise = adapter.post('test-tool', { param: 'value' });

      setTimeout(() => {
        mockProcess.stdout.emit(
          'data',
          `${JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            result: {
              content: [{ type: 'text', text: 'Tool executed successfully' }],
            },
          })}\n`
        );
      }, 10);

      const result = await executionPromise;
      expect(result.status).toBe(200);
      expect(result.data.content[0].text).toBe('Tool executed successfully');
    });

    it('should handle process errors', async () => {
      const errorPromise = new Promise((resolve) => {
        adapter.on('error', resolve);
      });

      await adapter.connect();
      mockProcess.emit('error', new Error('Process failed'));

      const error = await errorPromise;
      expect(error).toBeInstanceOf(Error);
    });

    it('should disconnect properly', async () => {
      await adapter.connect();

      const disconnectPromise = adapter.disconnect();

      // Simulate process exit
      setTimeout(() => {
        mockProcess.killed = true;
        mockProcess.emit('exit', 0, 'SIGTERM');
      }, 10);

      await disconnectPromise;

      expect(adapter.isConnected()).toBe(false);
      expect(mockProcess.kill).toHaveBeenCalled();
    });
  });

  describe('HTTP Protocol', () => {
    beforeEach(() => {
      const config: MCPClientConfig = {
        name: 'http-client',
        baseURL: 'https://api.example.com',
        protocol: 'http',
        url: 'https://api.example.com/mcp',
        authentication: { type: 'bearer', credentials: 'test-token' },
        tools: { timeout: 30000, retries: 3, discovery: true },
        server: { name: 'remote-server', version: '2.0.0' },
      };

      adapter = new MCPClientAdapter(config);
    });

    it('should connect via HTTP protocol', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      await adapter.connect();

      expect(adapter.isConnected()).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should execute tools via HTTP', async () => {
      // Mock connection
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      await adapter.connect();

      // Mock tool discovery
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            tools: [{ name: 'http-tool', description: 'HTTP test tool' }],
          },
        }),
      });

      // Wait for tool discovery
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Mock tool execution
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            content: [{ type: 'text', text: 'HTTP tool executed' }],
          },
        }),
      });

      const result = await adapter.post('http-tool', { data: 'test' });

      expect(result.status).toBe(200);
      expect(result.data.content[0].text).toBe('HTTP tool executed');
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(adapter.connect()).rejects.toThrow('HTTP connection failed');
    });
  });

  describe('Health Checks and Metrics', () => {
    beforeEach(async () => {
      const config: MCPClientConfig = {
        name: 'metrics-client',
        baseURL: 'stdio://test',
        protocol: 'stdio',
        command: ['node', 'test.js'],
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test', version: '1.0.0' },
      };

      adapter = new MCPClientAdapter(config);
      await adapter.connect();
    });

    it('should perform health checks', async () => {
      // Mock ping response
      setTimeout(() => {
        mockProcess.stdout.emit(
          'data',
          `${JSON.stringify({
            jsonrpc: '2.0',
            id: expect.any(Number),
            result: {},
          })}\n`
        );
      }, 10);

      const health = await adapter.healthCheck();

      expect(health).toMatchObject({
        name: 'metrics-client',
        status: 'healthy',
        lastCheck: expect.any(Date),
        responseTime: expect.any(Number),
        errorRate: expect.any(Number),
        uptime: expect.any(Number),
      });
    });

    it('should track performance metrics', async () => {
      const metrics = await adapter.getMetrics();

      expect(metrics).toMatchObject({
        name: 'metrics-client',
        requestCount: expect.any(Number),
        successCount: expect.any(Number),
        errorCount: expect.any(Number),
        averageLatency: expect.any(Number),
        p95Latency: expect.any(Number),
        p99Latency: expect.any(Number),
        throughput: expect.any(Number),
        timestamp: expect.any(Date),
      });
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const config: MCPClientConfig = {
        name: 'config-client',
        baseURL: 'stdio://test',
        protocol: 'stdio',
        command: ['node', 'test.js'],
        timeout: 10000,
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test', version: '1.0.0' },
      };

      adapter = new MCPClientAdapter(config);

      adapter.updateConfig({ timeout: 15000 });

      expect(adapter.config.timeout).toBe(15000);
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported protocols', () => {
      const config = {
        name: 'bad-client',
        baseURL: 'invalid://test',
        protocol: 'invalid' as any,
        authentication: { type: 'none' as const },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test', version: '1.0.0' },
      };

      adapter = new MCPClientAdapter(config);

      expect(adapter.connect()).rejects.toThrow('Unsupported protocol');
    });

    it('should handle PUT and DELETE errors', async () => {
      const config: MCPClientConfig = {
        name: 'error-client',
        baseURL: 'stdio://test',
        protocol: 'stdio',
        command: ['node', 'test.js'],
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test', version: '1.0.0' },
      };

      adapter = new MCPClientAdapter(config);

      await expect(adapter.put('/test')).rejects.toThrow('PUT not supported');
      await expect(adapter.delete('/test')).rejects.toThrow('DELETE not supported');
    });
  });
});

describe('MCPClientFactory', () => {
  let factory: MCPClientFactory;

  beforeEach(() => {
    factory = new MCPClientFactory();
  });

  afterEach(async () => {
    await factory.shutdown();
  });

  it('should implement IClientFactory interface', () => {
    expect(factory).toHaveProperty('create');
    expect(factory).toHaveProperty('createMultiple');
    expect(factory).toHaveProperty('get');
    expect(factory).toHaveProperty('list');
    expect(factory).toHaveProperty('has');
    expect(factory).toHaveProperty('remove');
    expect(factory).toHaveProperty('healthCheckAll');
    expect(factory).toHaveProperty('getMetricsAll');
    expect(factory).toHaveProperty('shutdown');
    expect(factory).toHaveProperty('getActiveCount');
  });

  it('should create clients', async () => {
    const config: MCPClientConfig = {
      name: 'factory-test-client',
      baseURL: 'stdio://test',
      protocol: 'stdio',
      command: ['node', 'test.js'],
      authentication: { type: 'none' },
      tools: { timeout: 10000, retries: 2, discovery: true },
      server: { name: 'test', version: '1.0.0' },
    };

    const client = await factory.create(config);

    expect(client).toBeInstanceOf(MCPClientAdapter);
    expect(client.name).toBe('factory-test-client');
    expect(factory.has('factory-test-client')).toBe(true);
    expect(factory.getActiveCount()).toBe(1);
  });

  it('should create multiple clients', async () => {
    const configs: MCPClientConfig[] = [
      {
        name: 'client-1',
        baseURL: 'stdio://test1',
        protocol: 'stdio',
        command: ['node', 'test1.js'],
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test1', version: '1.0.0' },
      },
      {
        name: 'client-2',
        baseURL: 'stdio://test2',
        protocol: 'stdio',
        command: ['node', 'test2.js'],
        authentication: { type: 'none' },
        tools: { timeout: 10000, retries: 2, discovery: true },
        server: { name: 'test2', version: '1.0.0' },
      },
    ];

    const clients = await factory.createMultiple(configs);

    expect(clients).toHaveLength(2);
    expect(factory.getActiveCount()).toBe(2);
  });

  it('should perform bulk operations', async () => {
    const config: MCPClientConfig = {
      name: 'bulk-test-client',
      baseURL: 'stdio://test',
      protocol: 'stdio',
      command: ['node', 'test.js'],
      authentication: { type: 'none' },
      tools: { timeout: 10000, retries: 2, discovery: true },
      server: { name: 'test', version: '1.0.0' },
    };

    await factory.create(config);

    const healthResults = await factory.healthCheckAll();
    expect(healthResults.size).toBe(1);
    expect(healthResults.has('bulk-test-client')).toBe(true);

    const metricsResults = await factory.getMetricsAll();
    expect(metricsResults.size).toBe(1);
    expect(metricsResults.has('bulk-test-client')).toBe(true);
  });

  it('should remove clients', async () => {
    const config: MCPClientConfig = {
      name: 'remove-test-client',
      baseURL: 'stdio://test',
      protocol: 'stdio',
      command: ['node', 'test.js'],
      authentication: { type: 'none' },
      tools: { timeout: 10000, retries: 2, discovery: true },
      server: { name: 'test', version: '1.0.0' },
    };

    await factory.create(config);
    expect(factory.has('remove-test-client')).toBe(true);

    const removed = await factory.remove('remove-test-client');
    expect(removed).toBe(true);
    expect(factory.has('remove-test-client')).toBe(false);
  });
});

describe('createMCPConfigFromLegacy', () => {
  it('should convert HTTP legacy config', () => {
    const legacyConfig = {
      url: 'https://api.example.com/mcp',
      type: 'http' as const,
      timeout: 30000,
      capabilities: ['research', 'analysis'],
    };

    const uaclConfig = createMCPConfigFromLegacy('test-client', legacyConfig);

    expect(uaclConfig).toMatchObject({
      name: 'test-client',
      baseURL: 'https://api.example.com/mcp',
      protocol: 'http',
      url: 'https://api.example.com/mcp',
      timeout: 30000,
      server: {
        name: 'test-client',
        version: '1.0.0',
        capabilities: ['research', 'analysis'],
      },
    });
  });

  it('should convert stdio legacy config', () => {
    const legacyConfig = {
      command: ['node', 'server.js'],
      timeout: 15000,
      capabilities: ['coordination', 'swarm'],
    };

    const uaclConfig = createMCPConfigFromLegacy('stdio-client', legacyConfig);

    expect(uaclConfig).toMatchObject({
      name: 'stdio-client',
      protocol: 'stdio',
      command: ['node', 'server.js'],
      timeout: 15000,
      server: {
        name: 'stdio-client',
        version: '1.0.0',
        capabilities: ['coordination', 'swarm'],
      },
    });
  });

  it('should use defaults for missing config', () => {
    const legacyConfig = {};

    const uaclConfig = createMCPConfigFromLegacy('minimal-client', legacyConfig);

    expect(uaclConfig).toMatchObject({
      name: 'minimal-client',
      protocol: 'http',
      timeout: 30000,
      authentication: { type: 'none' },
      tools: {
        timeout: 30000,
        retries: 3,
        discovery: true,
      },
    });
  });
});
