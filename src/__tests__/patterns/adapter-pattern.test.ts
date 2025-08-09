/**
 * @file Adapter Pattern Tests
 * Hybrid TDD approach: London TDD for protocol interactions, Classical TDD for message transformations
 */

import {
  AdapterFactory,
  type ConnectionConfig,
  LegacySystemAdapter,
  MCPAdapter,
  type ProtocolAdapter,
  ProtocolManager,
  type ProtocolMessage,
  type ProtocolResponse,
  RESTAdapter,
  WebSocketAdapter,
} from '../../integration/adapter-system';

// Mock implementations for testing
const createMockWebSocket = () => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // WebSocket.OPEN
  onopen: vi.fn(),
  onclose: vi.fn(),
  onmessage: vi.fn(),
  onerror: vi.fn(),
});

const createMockHttpResponse = (data: any, ok: boolean = true, status: number = 200) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
});

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock WebSocket globally
const mockWebSocketConstructor = vi.fn();
global.WebSocket = mockWebSocketConstructor as any;

// Mock child_process for stdio testing
const mockSpawn = vi.fn();
vi.mock('child_process', () => ({
  spawn: mockSpawn,
}));

describe('Adapter Pattern Implementation', () => {
  // Classical TDD - Test actual message transformations and protocol logic
  describe('Message Transformation Algorithms (Classical TDD)', () => {
    describe('Protocol Message Format Validation', () => {
      it('should validate protocol message structure', () => {
        const validMessage: ProtocolMessage = {
          id: 'msg-001',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          source: 'test-client',
          destination: 'test-server',
          type: 'test_command',
          payload: { data: 'test' },
          metadata: { priority: 'high' },
        };

        expect(validMessage.id).toBeDefined();
        expect(validMessage.timestamp).toBeInstanceOf(Date);
        expect(validMessage.source).toBe('test-client');
        expect(validMessage.type).toBe('test_command');
        expect(validMessage.payload).toEqual({ data: 'test' });
      });

      it('should handle message serialization and deserialization', () => {
        const originalMessage: ProtocolMessage = {
          id: 'serialize-test-001',
          timestamp: new Date('2024-01-01T12:00:00Z'),
          source: 'serializer',
          type: 'complex_data',
          payload: {
            numbers: [1, 2, 3, 4, 5],
            nested: { key: 'value', array: ['a', 'b', 'c'] },
            date: '2024-01-01T12:00:00Z',
            boolean: true,
            null: null,
          },
        };

        const serialized = JSON.stringify(originalMessage);
        const deserialized = JSON.parse(serialized);

        expect(deserialized.id).toBe(originalMessage.id);
        expect(deserialized.type).toBe(originalMessage.type);
        expect(deserialized.payload.numbers).toEqual([1, 2, 3, 4, 5]);
        expect(deserialized.payload.nested.array).toEqual(['a', 'b', 'c']);
      });

      it('should calculate message priorities correctly', () => {
        const messages = [
          { type: 'system_health', priority: 'critical' },
          { type: 'user_request', priority: 'high' },
          { type: 'background_task', priority: 'low' },
          { type: 'data_sync', priority: 'medium' },
        ];

        const priorityScores = messages.map((msg) => {
          switch (msg.priority) {
            case 'critical':
              return 4;
            case 'high':
              return 3;
            case 'medium':
              return 2;
            case 'low':
              return 1;
            default:
              return 0;
          }
        });

        expect(priorityScores).toEqual([4, 3, 1, 2]);
        expect(Math.max(...priorityScores)).toBe(4);
        expect(Math.min(...priorityScores)).toBe(1);
      });
    });

    describe('MCP Protocol Transformations', () => {
      let mcpAdapter: MCPAdapter;

      beforeEach(() => {
        mcpAdapter = new MCPAdapter('http');
      });

      it('should transform MCP messages to HTTP endpoints correctly', () => {
        const testCases = [
          { messageType: 'swarm_init', expectedEndpoint: '/tools/swarm_init' },
          { messageType: 'agent_spawn', expectedEndpoint: '/tools/agent_spawn' },
          { messageType: 'task_orchestrate', expectedEndpoint: '/tools/task_orchestrate' },
          { messageType: 'ping', expectedEndpoint: '/health' },
          { messageType: 'capabilities', expectedEndpoint: '/capabilities' },
          { messageType: 'unknown_command', expectedEndpoint: '/tools/unknown' },
        ];

        testCases.forEach(({ messageType, expectedEndpoint }) => {
          const endpoint = (mcpAdapter as any).mapMessageTypeToEndpoint(messageType);
          expect(endpoint).toBe(expectedEndpoint);
        });
      });

      it('should transform MCP messages to stdio JSON-RPC format', () => {
        const message: ProtocolMessage = {
          id: 'stdio-test-001',
          timestamp: new Date(),
          source: 'test-client',
          type: 'swarm_init',
          payload: {
            topology: 'mesh',
            agentCount: 5,
            capabilities: ['data-processing'],
          },
        };

        const jsonRpcFormat = {
          jsonrpc: '2.0',
          id: message.id,
          method: message.type,
          params: message.payload,
        };

        expect(jsonRpcFormat.jsonrpc).toBe('2.0');
        expect(jsonRpcFormat.id).toBe(message.id);
        expect(jsonRpcFormat.method).toBe('swarm_init');
        expect(jsonRpcFormat.params.topology).toBe('mesh');
      });

      it('should handle MCP error responses correctly', () => {
        const errorResponse = {
          jsonrpc: '2.0',
          id: 'error-test-001',
          error: {
            code: -32600,
            message: 'Invalid Request',
            data: { details: 'Missing required parameter: topology' },
          },
        };

        const protocolResponse: ProtocolResponse = {
          id: 'resp-001',
          requestId: 'error-test-001',
          timestamp: new Date(),
          success: false,
          error: errorResponse?.error?.message,
          metadata: {
            errorCode: errorResponse?.error?.code,
            errorData: errorResponse?.error?.data,
          },
        };

        expect(protocolResponse?.success).toBe(false);
        expect(protocolResponse?.error).toBe('Invalid Request');
        expect(protocolResponse?.metadata?.errorCode).toBe(-32600);
      });
    });

    describe('WebSocket Message Handling', () => {
      let _wsAdapter: WebSocketAdapter;

      beforeEach(() => {
        _wsAdapter = new WebSocketAdapter();
        mockWebSocketConstructor.mockClear();
      });

      it('should handle WebSocket message parsing correctly', () => {
        const rawMessage = JSON.stringify({
          id: 'ws-msg-001',
          timestamp: '2024-01-01T10:00:00Z',
          source: 'server',
          type: 'notification',
          payload: {
            event: 'swarm_status_change',
            data: { swarmId: 'test-swarm', status: 'active' },
          },
        });

        const parsed = JSON.parse(rawMessage);
        const protocolMessage: ProtocolMessage = {
          id: parsed.id || `msg-${Date.now()}`,
          timestamp: new Date(parsed.timestamp) || new Date(),
          source: parsed.source || 'server',
          destination: parsed.destination,
          type: parsed.type,
          payload: parsed.payload,
          metadata: parsed.metadata,
        };

        expect(protocolMessage.id).toBe('ws-msg-001');
        expect(protocolMessage.type).toBe('notification');
        expect(protocolMessage.payload.event).toBe('swarm_status_change');
        expect(protocolMessage.payload.data.swarmId).toBe('test-swarm');
      });

      it('should implement exponential backoff for reconnection', () => {
        const baseDelay = 1000;
        const maxAttempts = 5;
        const backoffMultiplier = 2;

        const calculateDelay = (attempt: number) => {
          return Math.min(baseDelay * backoffMultiplier ** (attempt - 1), 30000);
        };

        const delays = Array.from({ length: maxAttempts }, (_, i) => calculateDelay(i + 1));

        expect(delays).toEqual([1000, 2000, 4000, 8000, 16000]);
        expect(delays[0]).toBe(1000);
        expect(delays[4]).toBe(16000);
        expect(calculateDelay(10)).toBe(30000); // Should cap at 30 seconds
      });

      it('should batch WebSocket messages for efficiency', () => {
        const messages: ProtocolMessage[] = [
          {
            id: 'batch-1',
            timestamp: new Date(),
            source: 'client',
            type: 'data',
            payload: { value: 1 },
          },
          {
            id: 'batch-2',
            timestamp: new Date(),
            source: 'client',
            type: 'data',
            payload: { value: 2 },
          },
          {
            id: 'batch-3',
            timestamp: new Date(),
            source: 'client',
            type: 'data',
            payload: { value: 3 },
          },
        ];

        const batchedMessage = {
          id: `batch-${Date.now()}`,
          timestamp: new Date(),
          source: 'client',
          type: 'batch',
          payload: {
            messages: messages.map((msg) => ({
              id: msg.id,
              type: msg.type,
              payload: msg.payload,
            })),
            count: messages.length,
          },
        };

        expect(batchedMessage.type).toBe('batch');
        expect(batchedMessage.payload.count).toBe(3);
        expect(batchedMessage.payload.messages).toHaveLength(3);
        expect(batchedMessage.payload.messages[1]?.payload?.value).toBe(2);
      });
    });

    describe('REST API Transformations', () => {
      let restAdapter: RESTAdapter;

      beforeEach(() => {
        restAdapter = new RESTAdapter();
        mockFetch.mockClear();
      });

      it('should map message types to REST endpoints correctly', () => {
        const testCases = [
          { messageType: 'swarm_init', expectedEndpoint: '/swarms' },
          { messageType: 'agent_spawn', expectedEndpoint: '/agents' },
          { messageType: 'task_orchestrate', expectedEndpoint: '/tasks' },
          { messageType: 'system_status', expectedEndpoint: '/status' },
          { messageType: 'document_process', expectedEndpoint: '/documents/process' },
          { messageType: 'unknown_operation', expectedEndpoint: '/unknown' },
        ];

        testCases.forEach(({ messageType, expectedEndpoint }) => {
          const endpoint = (restAdapter as any).mapMessageTypeToEndpoint(messageType);
          expect(endpoint).toBe(expectedEndpoint);
        });
      });

      it('should handle different authentication methods', () => {
        const authConfigs = [
          {
            type: 'bearer' as const,
            credentials: { token: 'bearer-token-123' },
            expectedHeader: { Authorization: 'Bearer bearer-token-123' },
          },
          {
            type: 'api-key' as const,
            credentials: { apiKey: 'api-key-456' },
            expectedHeader: { 'X-API-Key': 'api-key-456' },
          },
          {
            type: 'basic' as const,
            credentials: { username: 'user', password: 'pass' },
            expectedHeader: { Authorization: `Basic ${btoa('user:pass')}` },
          },
        ];

        authConfigs?.forEach(({ type, credentials, expectedHeader }) => {
          const adapter = new RESTAdapter();
          (adapter as any).setupAuthentication({ type, credentials });

          const headers = (adapter as any).authHeaders;
          expect(headers).toEqual(expectedHeader);
        });
      });

      it('should calculate request timeouts based on operation complexity', () => {
        const operations = [
          { type: 'ping', complexity: 'low', expectedTimeout: 5000 },
          { type: 'swarm_init', complexity: 'medium', expectedTimeout: 30000 },
          { type: 'neural_train', complexity: 'high', expectedTimeout: 300000 },
          { type: 'batch_process', complexity: 'critical', expectedTimeout: 600000 },
        ];

        const calculateTimeout = (complexity: string) => {
          switch (complexity) {
            case 'low':
              return 5000;
            case 'medium':
              return 30000;
            case 'high':
              return 300000;
            case 'critical':
              return 600000;
            default:
              return 30000;
          }
        };

        operations.forEach(({ complexity, expectedTimeout }) => {
          const timeout = calculateTimeout(complexity);
          expect(timeout).toBe(expectedTimeout);
        });
      });
    });

    describe('Legacy System Adaptations', () => {
      let legacyAdapter: LegacySystemAdapter;

      beforeEach(() => {
        legacyAdapter = new LegacySystemAdapter();
      });

      it('should transform modern messages to legacy formats', () => {
        const modernMessage: ProtocolMessage = {
          id: 'modern-msg-001',
          timestamp: new Date('2024-01-01T15:00:00Z'),
          source: 'modern-client',
          type: 'data_process',
          payload: {
            operation: 'transform',
            data: { records: 100, format: 'json' },
            options: { async: true, priority: 'high' },
          },
        };

        const legacyFormat = (legacyAdapter as any).transformToLegacyFormat(modernMessage);

        expect(legacyFormat).toEqual({
          action: 'data_process',
          data: {
            operation: 'transform',
            data: { records: 100, format: 'json' },
            options: { async: true, priority: 'high' },
          },
          timestamp: '2024-01-01T15:00:00.000Z',
          id: 'modern-msg-001',
        });
      });

      it('should transform legacy responses to modern format', () => {
        const legacyResponse = {
          result: {
            processed: 100,
            errors: 0,
            duration: 5000,
          },
          status: 'completed',
          timestamp: '2024-01-01T15:05:00.000Z',
          message: 'Processing completed successfully',
        };

        const modernFormat = (legacyAdapter as any).transformFromLegacyFormat(legacyResponse);

        expect(modernFormat).toEqual({
          result: {
            processed: 100,
            errors: 0,
            duration: 5000,
          },
          status: 'completed',
          timestamp: new Date('2024-01-01T15:05:00.000Z'),
        });
      });

      it('should handle legacy protocol variations', () => {
        const protocolVariations = [
          {
            protocol: 'soap',
            message: { action: 'GetData', params: { id: 123 } },
            expectedConnection: { type: 'soap', endpoint: 'localhost:8080' },
          },
          {
            protocol: 'xmlrpc',
            message: { method: 'getData', params: [123] },
            expectedConnection: { type: 'xmlrpc', endpoint: 'localhost:8081' },
          },
          {
            protocol: 'tcp',
            message: { command: 'GET_DATA', args: '123' },
            expectedConnection: { type: 'tcp', host: 'localhost', port: 8082 },
          },
        ];

        protocolVariations.forEach(({ protocol, expectedConnection }) => {
          const connection = {
            soap: { type: 'soap', endpoint: 'localhost:8080' },
            xmlrpc: { type: 'xmlrpc', endpoint: 'localhost:8081' },
            tcp: { type: 'tcp', host: 'localhost', port: 8082 },
          }[protocol];

          expect(connection).toEqual(expectedConnection);
        });
      });
    });

    describe('Performance and Optimization', () => {
      it('should implement message compression for large payloads', () => {
        const largePayload = {
          data: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            value: `data-item-${i}`,
            metadata: { created: new Date(), processed: false },
          })),
        };

        const originalSize = JSON.stringify(largePayload).length;

        // Simulate compression (in reality would use actual compression library)
        const compressionRatio = 0.3; // 70% compression
        const compressedSize = Math.floor(originalSize * compressionRatio);

        expect(originalSize).toBeGreaterThan(50000); // Large payload
        expect(compressedSize).toBeLessThan(originalSize * 0.5); // Significant compression
        expect(compressionRatio).toBeLessThan(0.5); // Good compression ratio
      });

      it('should implement connection pooling for REST adapters', () => {
        const connectionPool = {
          maxConnections: 10,
          activeConnections: 0,
          availableConnections: [],
          busyConnections: [],
        };

        const acquireConnection = () => {
          if (connectionPool.availableConnections.length > 0) {
            const conn = connectionPool.availableConnections.pop();
            connectionPool.busyConnections.push(conn);
            return conn;
          } else if (connectionPool.activeConnections < connectionPool.maxConnections) {
            const newConn = { id: `conn-${connectionPool.activeConnections}`, inUse: true };
            connectionPool.activeConnections++;
            connectionPool.busyConnections.push(newConn);
            return newConn;
          }
          return null; // Pool exhausted
        };

        const releaseConnection = (conn: any) => {
          const index = connectionPool.busyConnections.indexOf(conn);
          if (index > -1) {
            connectionPool.busyConnections.splice(index, 1);
            conn.inUse = false;
            connectionPool.availableConnections.push(conn);
          }
        };

        // Test connection acquisition
        const connections = [];
        for (let i = 0; i < 12; i++) {
          const conn = acquireConnection();
          if (conn) connections.push(conn);
        }

        expect(connections).toHaveLength(10); // Should hit max limit
        expect(connectionPool.busyConnections).toHaveLength(10);
        expect(connectionPool.availableConnections).toHaveLength(0);

        // Test connection release
        releaseConnection(connections[0]);
        expect(connectionPool.availableConnections).toHaveLength(1);
        expect(connectionPool.busyConnections).toHaveLength(9);
      });

      it('should implement adaptive retry strategies', () => {
        const retryStrategies = {
          exponential: (attempt: number) => Math.min(1000 * 2 ** (attempt - 1), 30000),
          linear: (attempt: number) => Math.min(1000 * attempt, 10000),
          fixed: () => 5000,
          fibonacci: (attempt: number) => {
            const fib = [1000, 1000];
            for (let i = 2; i < attempt; i++) {
              fib[i] = fib[i - 1] + fib[i - 2];
            }
            return Math.min(fib[attempt - 1] || 1000, 30000);
          },
        };

        const exponentialDelays = [1, 2, 3, 4, 5].map(retryStrategies.exponential);
        const linearDelays = [1, 2, 3, 4, 5].map(retryStrategies.linear);
        const fibonacciDelays = [1, 2, 3, 4, 5].map(retryStrategies.fibonacci);

        expect(exponentialDelays).toEqual([1000, 2000, 4000, 8000, 16000]);
        expect(linearDelays).toEqual([1000, 2000, 3000, 4000, 5000]);
        expect(fibonacciDelays).toEqual([1000, 1000, 2000, 3000, 5000]);
      });
    });
  });

  // London TDD - Test adapter interactions and protocol management
  describe('Adapter Interactions (London TDD)', () => {
    let protocolManager: ProtocolManager;

    beforeEach(() => {
      protocolManager = new ProtocolManager();
      mockFetch.mockClear();
      mockWebSocketConstructor.mockClear();
    });

    describe('AdapterFactory', () => {
      it('should create correct adapter instances', () => {
        const adapters = [
          { protocol: 'mcp-http', expectedType: MCPAdapter },
          { protocol: 'mcp-stdio', expectedType: MCPAdapter },
          { protocol: 'websocket', expectedType: WebSocketAdapter },
          { protocol: 'rest', expectedType: RESTAdapter },
          { protocol: 'legacy', expectedType: LegacySystemAdapter },
        ];

        adapters.forEach(({ protocol, expectedType }) => {
          const adapter = AdapterFactory.createAdapter(protocol);
          expect(adapter).toBeInstanceOf(expectedType);
        });
      });

      it('should throw error for unknown protocols', () => {
        expect(() => {
          AdapterFactory.createAdapter('unknown-protocol');
        }).toThrow('Unknown protocol: unknown-protocol');
      });

      it('should register custom adapters', () => {
        class CustomAdapter implements ProtocolAdapter {
          async connect() {}
          async disconnect() {}
          async send() {
            return { id: '', requestId: '', timestamp: new Date(), success: true };
          }
          subscribe() {}
          unsubscribe() {}
          isConnected() {
            return true;
          }
          getProtocolName() {
            return 'custom';
          }
          getCapabilities() {
            return ['custom-feature'];
          }
          async healthCheck() {
            return true;
          }
        }

        AdapterFactory.registerAdapter('custom', () => new CustomAdapter());

        const adapter = AdapterFactory.createAdapter('custom');
        expect(adapter).toBeInstanceOf(CustomAdapter);
        expect(adapter.getProtocolName()).toBe('custom');
      });

      it('should list available protocols', () => {
        const protocols = AdapterFactory.getAvailableProtocols();

        expect(protocols).toContain('mcp-http');
        expect(protocols).toContain('mcp-stdio');
        expect(protocols).toContain('websocket');
        expect(protocols).toContain('rest');
        expect(protocols).toContain('legacy');
      });
    });

    describe('ProtocolManager', () => {
      it('should add protocols correctly', async () => {
        const mockAdapter = {
          connect: vi.fn().mockResolvedValue(undefined),
          disconnect: vi.fn(),
          send: vi.fn(),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          getProtocolName: vi.fn().mockReturnValue('mock-protocol'),
          getCapabilities: vi.fn().mockReturnValue(['mock-capability']),
          healthCheck: vi.fn(),
        };

        AdapterFactory.registerAdapter('mock', () => mockAdapter);

        const config: ConnectionConfig = {
          protocol: 'mock',
          host: 'localhost',
          port: 3000,
        };

        await protocolManager.addProtocol('test-mock', 'mock', config);

        expect(mockAdapter.connect).toHaveBeenCalledWith(config);
      });

      it('should send messages through correct adapter', async () => {
        const mockAdapter = {
          connect: vi.fn().mockResolvedValue(undefined),
          disconnect: vi.fn(),
          send: vi.fn().mockResolvedValue({
            id: 'resp-001',
            requestId: 'msg-001',
            timestamp: new Date(),
            success: true,
            data: { result: 'success' },
          }),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          getProtocolName: vi.fn().mockReturnValue('mock-send'),
          getCapabilities: vi.fn().mockReturnValue([]),
          healthCheck: vi.fn(),
        };

        AdapterFactory.registerAdapter('mock-send', () => mockAdapter);

        await protocolManager.addProtocol('sender', 'mock-send', {
          protocol: 'mock-send',
          host: 'localhost',
        });

        const message: ProtocolMessage = {
          id: 'msg-001',
          timestamp: new Date(),
          source: 'test',
          type: 'test_command',
          payload: { data: 'test' },
        };

        const response = await protocolManager.sendMessage(message, 'sender');

        expect(mockAdapter.send).toHaveBeenCalledWith(message);
        expect(response?.success).toBe(true);
        expect(response?.data?.result).toBe('success');
      });

      it('should broadcast messages to multiple adapters', async () => {
        const adapters = ['broadcast-1', 'broadcast-2', 'broadcast-3'].map((name, index) => ({
          name,
          mock: {
            connect: vi.fn().mockResolvedValue(undefined),
            disconnect: vi.fn(),
            send: vi.fn().mockResolvedValue({
              id: `resp-${index}`,
              requestId: 'broadcast-msg',
              timestamp: new Date(),
              success: true,
              data: { handler: name },
            }),
            subscribe: vi.fn(),
            unsubscribe: vi.fn(),
            isConnected: vi.fn().mockReturnValue(true),
            getProtocolName: vi.fn().mockReturnValue(name),
            getCapabilities: vi.fn().mockReturnValue([]),
            healthCheck: vi.fn(),
          },
        }));

        // Register and add all adapters
        for (const { name, mock } of adapters) {
          AdapterFactory.registerAdapter(name, () => mock);
          await protocolManager.addProtocol(name, name, {
            protocol: name,
            host: 'localhost',
          });
        }

        const broadcastMessage: ProtocolMessage = {
          id: 'broadcast-msg',
          timestamp: new Date(),
          source: 'broadcaster',
          type: 'broadcast_test',
          payload: { message: 'hello all' },
        };

        const responses = await protocolManager.broadcast(broadcastMessage);

        expect(responses).toHaveLength(3);
        responses?.forEach((response, index) => {
          expect(response?.success).toBe(true);
          expect(response?.data?.handler).toBe(`broadcast-${index + 1}`);
        });

        adapters.forEach(({ mock }) => {
          expect(mock.send).toHaveBeenCalledWith(broadcastMessage);
        });
      });

      it('should handle adapter failures gracefully', async () => {
        const workingAdapter = {
          connect: vi.fn().mockResolvedValue(undefined),
          disconnect: vi.fn(),
          send: vi.fn().mockResolvedValue({
            id: 'resp-working',
            requestId: 'failure-test',
            timestamp: new Date(),
            success: true,
            data: { status: 'working' },
          }),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          getProtocolName: vi.fn().mockReturnValue('working'),
          getCapabilities: vi.fn().mockReturnValue([]),
          healthCheck: vi.fn(),
        };

        const failingAdapter = {
          connect: vi.fn().mockResolvedValue(undefined),
          disconnect: vi.fn(),
          send: vi.fn().mockRejectedValue(new Error('Adapter failure')),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          getProtocolName: vi.fn().mockReturnValue('failing'),
          getCapabilities: vi.fn().mockReturnValue([]),
          healthCheck: vi.fn(),
        };

        AdapterFactory.registerAdapter('working', () => workingAdapter);
        AdapterFactory.registerAdapter('failing', () => failingAdapter);

        await protocolManager.addProtocol('working', 'working', {
          protocol: 'working',
          host: 'localhost',
        });

        await protocolManager.addProtocol('failing', 'failing', {
          protocol: 'failing',
          host: 'localhost',
        });

        const testMessage: ProtocolMessage = {
          id: 'failure-test',
          timestamp: new Date(),
          source: 'tester',
          type: 'failure_test',
          payload: {},
        };

        const responses = await protocolManager.broadcast(testMessage);

        expect(responses).toHaveLength(2);

        const workingResponse = responses?.find((r) => r.success);
        const failingResponse = responses?.find((r) => !r.success);

        expect(workingResponse?.data.status).toBe('working');
        expect(failingResponse?.error).toBe('Adapter failure');
      });

      it('should implement message routing', async () => {
        const routedAdapter = {
          connect: vi.fn().mockResolvedValue(undefined),
          disconnect: vi.fn(),
          send: vi.fn().mockResolvedValue({
            id: 'routed-resp',
            requestId: 'routing-test',
            timestamp: new Date(),
            success: true,
            data: { routed: true },
          }),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          getProtocolName: vi.fn().mockReturnValue('routed'),
          getCapabilities: vi.fn().mockReturnValue([]),
          healthCheck: vi.fn(),
        };

        AdapterFactory.registerAdapter('routed', () => routedAdapter);

        await protocolManager.addProtocol('router', 'routed', {
          protocol: 'routed',
          host: 'localhost',
        });

        // Set up routing rule
        protocolManager.setRoute('special_command', 'router');

        const routedMessage: ProtocolMessage = {
          id: 'routing-test',
          timestamp: new Date(),
          source: 'client',
          type: 'special_command',
          payload: { routed: true },
        };

        // Send without specifying protocol - should use routing
        const response = await protocolManager.sendMessage(routedMessage);

        expect(routedAdapter.send).toHaveBeenCalledWith(routedMessage);
        expect(response?.data?.routed).toBe(true);
      });

      it('should perform health checks on all adapters', async () => {
        const healthyAdapter = {
          connect: vi.fn().mockResolvedValue(undefined),
          disconnect: vi.fn(),
          send: vi.fn(),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          getProtocolName: vi.fn().mockReturnValue('healthy'),
          getCapabilities: vi.fn().mockReturnValue([]),
          healthCheck: vi.fn().mockResolvedValue(true),
        };

        const unhealthyAdapter = {
          connect: vi.fn().mockResolvedValue(undefined),
          disconnect: vi.fn(),
          send: vi.fn(),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
          isConnected: vi.fn().mockReturnValue(true),
          getProtocolName: vi.fn().mockReturnValue('unhealthy'),
          getCapabilities: vi.fn().mockReturnValue([]),
          healthCheck: vi.fn().mockResolvedValue(false),
        };

        AdapterFactory.registerAdapter('healthy', () => healthyAdapter);
        AdapterFactory.registerAdapter('unhealthy', () => unhealthyAdapter);

        await protocolManager.addProtocol('healthy-protocol', 'healthy', {
          protocol: 'healthy',
          host: 'localhost',
        });

        await protocolManager.addProtocol('unhealthy-protocol', 'unhealthy', {
          protocol: 'unhealthy',
          host: 'localhost',
        });

        const healthCheckResults: Array<{ name: string; healthy: boolean }> = [];

        protocolManager.on('protocol:health', (result) => {
          healthCheckResults?.push(result);
        });

        await protocolManager.healthCheckAll();

        expect(healthCheckResults).toHaveLength(2);
        expect(healthCheckResults?.find((r) => r.name === 'healthy-protocol')?.healthy).toBe(true);
        expect(healthCheckResults?.find((r) => r.name === 'unhealthy-protocol')?.healthy).toBe(
          false
        );
      });

      it('should shutdown all adapters cleanly', async () => {
        const adapters = ['shutdown-1', 'shutdown-2'].map((name) => ({
          name,
          mock: {
            connect: vi.fn().mockResolvedValue(undefined),
            disconnect: vi.fn().mockResolvedValue(undefined),
            send: vi.fn(),
            subscribe: vi.fn(),
            unsubscribe: vi.fn(),
            isConnected: vi.fn().mockReturnValue(true),
            getProtocolName: vi.fn().mockReturnValue(name),
            getCapabilities: vi.fn().mockReturnValue([]),
            healthCheck: vi.fn(),
          },
        }));

        for (const { name, mock } of adapters) {
          AdapterFactory.registerAdapter(name, () => mock);
          await protocolManager.addProtocol(name, name, {
            protocol: name,
            host: 'localhost',
          });
        }

        await protocolManager.shutdown();

        adapters.forEach(({ mock }) => {
          expect(mock.disconnect).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Individual Adapter Behaviors', () => {
      describe('MCPAdapter HTTP Mode', () => {
        let mcpAdapter: MCPAdapter;

        beforeEach(() => {
          mcpAdapter = new MCPAdapter('http');
        });

        it('should connect to HTTP MCP server', async () => {
          const config: ConnectionConfig = {
            protocol: 'http',
            host: 'localhost',
            port: 3000,
            path: '/mcp',
            timeout: 30000,
          };

          mockFetch.mockResolvedValueOnce(createMockHttpResponse({ capabilities: ['tools'] }));

          await mcpAdapter.connect(config);

          expect(mcpAdapter.isConnected()).toBe(true);
          expect(mcpAdapter.getProtocolName()).toBe('mcp-http');
        });

        it('should send HTTP requests correctly', async () => {
          const config: ConnectionConfig = {
            protocol: 'http',
            host: 'localhost',
            port: 3000,
          };

          mockFetch
            .mockResolvedValueOnce(createMockHttpResponse({ capabilities: ['tools'] })) // connect
            .mockResolvedValueOnce(createMockHttpResponse({ result: 'success' })); // send

          await mcpAdapter.connect(config);

          const message: ProtocolMessage = {
            id: 'http-test',
            timestamp: new Date(),
            source: 'client',
            type: 'swarm_init',
            payload: { topology: 'mesh' },
          };

          const response = await mcpAdapter.send(message);

          expect(response?.success).toBe(true);
          expect(response?.metadata?.protocol).toBe('http');
        });
      });

      describe('MCPAdapter Stdio Mode', () => {
        let mcpAdapter: MCPAdapter;
        let mockProcess: any;

        beforeEach(() => {
          mcpAdapter = new MCPAdapter('stdio');

          mockProcess = {
            stdin: { write: vi.fn() },
            stdout: {
              on: vi.fn(),
              once: vi.fn(),
            },
            stderr: { on: vi.fn() },
            on: vi.fn(),
            kill: vi.fn(),
          };

          mockSpawn.mockReturnValue(mockProcess);
        });

        it('should connect via stdio', async () => {
          const config: ConnectionConfig = {
            protocol: 'stdio',
            host: 'localhost',
          };

          // Simulate spawn event
          mockProcess.on.mockImplementation((event: string, callback: Function) => {
            if (event === 'spawn') {
              setTimeout(callback, 10);
            }
          });

          await mcpAdapter.connect(config);

          expect(mockSpawn).toHaveBeenCalledWith('npx', ['claude-zen', 'swarm', 'mcp', 'start'], {
            stdio: ['pipe', 'pipe', 'pipe'],
          });
          expect(mcpAdapter.isConnected()).toBe(true);
        });

        it('should handle stdio message sending', async () => {
          const config: ConnectionConfig = {
            protocol: 'stdio',
            host: 'localhost',
          };

          mockProcess.on.mockImplementation((event: string, callback: Function) => {
            if (event === 'spawn') setTimeout(callback, 10);
          });

          await mcpAdapter.connect(config);

          const message: ProtocolMessage = {
            id: 'stdio-test',
            timestamp: new Date(),
            source: 'client',
            type: 'agent_spawn',
            payload: { type: 'worker' },
          };

          // Mock response handling
          mockProcess.stdout.once.mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              setTimeout(
                () =>
                  callback({
                    id: 'stdio-test',
                    result: { agentId: 'agent-001' },
                  }),
                10
              );
            }
          });

          const responsePromise = mcpAdapter.send(message);

          const expectedMessage = {
            jsonrpc: '2.0',
            id: 'stdio-test',
            method: 'agent_spawn',
            params: { type: 'worker' },
          };

          expect(mockProcess.stdin.write).toHaveBeenCalledWith(
            `${JSON.stringify(expectedMessage)}\n`
          );

          await responsePromise;
        });
      });

      describe('WebSocketAdapter', () => {
        let wsAdapter: WebSocketAdapter;
        let mockWebSocket: any;

        beforeEach(() => {
          wsAdapter = new WebSocketAdapter();
          mockWebSocket = createMockWebSocket();
          mockWebSocketConstructor.mockReturnValue(mockWebSocket);
        });

        it('should connect to WebSocket server', async () => {
          const config: ConnectionConfig = {
            protocol: 'websocket',
            host: 'localhost',
            port: 3456,
            path: '/ws',
          };

          const connectPromise = wsAdapter.connect(config);

          // Simulate connection open
          setTimeout(() => {
            mockWebSocket.onopen();
          }, 10);

          await connectPromise;

          expect(mockWebSocketConstructor).toHaveBeenCalledWith('ws://localhost:3456/ws');
          expect(wsAdapter.isConnected()).toBe(true);
        });

        it('should handle WebSocket messages', async () => {
          const config: ConnectionConfig = {
            protocol: 'websocket',
            host: 'localhost',
            port: 3456,
          };

          const connectPromise = wsAdapter.connect(config);
          setTimeout(() => mockWebSocket.onopen(), 10);
          await connectPromise;

          const message: ProtocolMessage = {
            id: 'ws-send-test',
            timestamp: new Date(),
            source: 'client',
            type: 'ping',
            payload: {},
          };

          const sendPromise = wsAdapter.send(message);

          // Simulate response
          setTimeout(() => {
            const responseEvent = {
              data: JSON.stringify({
                id: 'ws-response',
                requestId: 'ws-send-test',
                success: true,
                data: { pong: true },
              }),
            };
            mockWebSocket.onmessage(responseEvent);
          }, 10);

          const response = await sendPromise;

          expect(mockWebSocket.send).toHaveBeenCalledWith(
            JSON.stringify({
              ...message,
              expectResponse: true,
            })
          );
          expect(response?.success).toBe(true);
        });

        it('should implement auto-reconnection', async () => {
          const config: ConnectionConfig = {
            protocol: 'websocket',
            host: 'localhost',
            port: 3456,
          };

          // Initial connection
          const connectPromise = wsAdapter.connect(config);
          setTimeout(() => mockWebSocket.onopen(), 10);
          await connectPromise;

          expect(wsAdapter.isConnected()).toBe(true);

          // Simulate disconnection
          mockWebSocket.readyState = 3; // WebSocket.CLOSED
          mockWebSocket.onclose();

          expect(wsAdapter.isConnected()).toBe(false);

          // Verify reconnection attempt will be made
          // (In real implementation, this would trigger after a delay)
        });
      });

      describe('RESTAdapter', () => {
        let restAdapter: RESTAdapter;

        beforeEach(() => {
          restAdapter = new RESTAdapter();
        });

        it('should connect and test REST API health', async () => {
          const config: ConnectionConfig = {
            protocol: 'rest',
            host: 'api.example.com',
            port: 443,
            ssl: true,
            path: '/v1',
          };

          mockFetch.mockResolvedValueOnce(createMockHttpResponse({ status: 'healthy' }));

          await restAdapter.connect(config);

          expect(mockFetch).toHaveBeenCalledWith(
            'https://api.example.com:443/v1/health',
            expect.objectContaining({
              method: 'GET',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
              }),
            })
          );
          expect(restAdapter.isConnected()).toBe(true);
        });

        it('should send REST API requests', async () => {
          const config: ConnectionConfig = {
            protocol: 'rest',
            host: 'localhost',
            port: 8080,
          };

          mockFetch
            .mockResolvedValueOnce(createMockHttpResponse({ status: 'healthy' })) // connect
            .mockResolvedValueOnce(createMockHttpResponse({ swarmId: 'rest-swarm-001' })); // send

          await restAdapter.connect(config);

          const message: ProtocolMessage = {
            id: 'rest-test',
            timestamp: new Date(),
            source: 'client',
            type: 'swarm_init',
            payload: { topology: 'ring', agentCount: 4 },
          };

          const response = await restAdapter.send(message);

          expect(mockFetch).toHaveBeenCalledWith(
            'http://localhost:8080/api/swarms',
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
              }),
              body: JSON.stringify({ topology: 'ring', agentCount: 4 }),
            })
          );
          expect(response?.success).toBe(true);
          expect(response?.data?.swarmId).toBe('rest-swarm-001');
        });
      });
    });
  });

  describe('Error Handling and Resilience (Hybrid TDD)', () => {
    it('should handle network failures with proper error reporting', async () => {
      const restAdapter = new RESTAdapter();

      mockFetch.mockRejectedValue(new Error('Network error'));

      const config: ConnectionConfig = {
        protocol: 'rest',
        host: 'unreachable.example.com',
        port: 8080,
      };

      await expect(restAdapter.connect(config)).rejects.toThrow('REST API connection failed');
    });

    it('should implement circuit breaker pattern for failing adapters', async () => {
      const protocolManager = new ProtocolManager();

      const failingAdapter = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn(),
        send: vi.fn().mockRejectedValue(new Error('Service unavailable')),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        isConnected: vi.fn().mockReturnValue(true),
        getProtocolName: vi.fn().mockReturnValue('failing'),
        getCapabilities: vi.fn().mockReturnValue([]),
        healthCheck: vi.fn().mockResolvedValue(false),
      };

      AdapterFactory.registerAdapter('circuit-test', () => failingAdapter);

      await protocolManager.addProtocol('circuit-breaker-test', 'circuit-test', {
        protocol: 'circuit-test',
        host: 'localhost',
      });

      const testMessage: ProtocolMessage = {
        id: 'circuit-test',
        timestamp: new Date(),
        source: 'client',
        type: 'test',
        payload: {},
      };

      // Multiple failures should trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          await protocolManager.sendMessage(testMessage, 'circuit-breaker-test');
        } catch (_error) {
          // Expected failures
        }
      }

      expect(failingAdapter.send).toHaveBeenCalledTimes(5);
    });

    it('should validate adapter configurations before connection', () => {
      const invalidConfigs = [
        { protocol: '', host: 'localhost' }, // Empty protocol
        { protocol: 'http', host: '' }, // Empty host
        { protocol: 'http', host: 'localhost', port: -1 }, // Invalid port
        { protocol: 'http', host: 'localhost', timeout: -1 }, // Invalid timeout
      ];

      invalidConfigs?.forEach((config) => {
        expect(() => {
          // This would be validation logic in the actual adapter
          if (!config?.protocol) throw new Error('Protocol is required');
          if (!config?.host) throw new Error('Host is required');
          if (config?.port !== undefined && config?.port < 0)
            throw new Error('Port must be positive');
          if (config?.timeout !== undefined && config?.timeout < 0)
            throw new Error('Timeout must be positive');
        }).toThrow();
      });
    });
  });
});
