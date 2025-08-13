/**
 * Communication Event Adapter Tests
 *
 * Comprehensive test suite for CommunicationEventAdapter using hybrid TDD approach:
 * - 70% London TDD (mockist) for distributed components and protocol interactions
 * - 30% Classical TDD (detroit) for pure functions and mathematical operations
 *
 * Tests cover WebSocket communication, MCP protocol events, HTTP communication,
 * and protocol management scenarios with full event correlation and performance tracking.
 */

import { EventEmitter } from 'node:events';
import {
  CommunicationEventAdapter,
  createDefaultCommunicationEventAdapterConfig,
} from '../../../interfaces/events/adapters/communication-event-adapter.ts';
import { CommunicationEventFactory } from '../../../interfaces/events/adapters/communication-event-factory.ts';

describe('CommunicationEventAdapter', () => {
  describe('🏗️ Constructor and Configuration (Classical TDD)', () => {
    it('should create adapter with valid configuration', () => {
      const config =
        createDefaultCommunicationEventAdapterConfig('test-comm-adapter');
      const adapter = new CommunicationEventAdapter(config);

      expect(adapter.name).toBe('test-comm-adapter');
      expect(adapter.type).toBe('communication');
      expect(adapter.config.websocketCommunication?.enabled).toBe(true);
      expect(adapter.config.mcpProtocol?.enabled).toBe(true);
      expect(adapter.config.httpCommunication?.enabled).toBe(true);
      expect(adapter.config.protocolCommunication?.enabled).toBe(true);
    });

    it('should apply custom configuration overrides correctly', () => {
      const config = createDefaultCommunicationEventAdapterConfig(
        'custom-adapter',
        {
          websocketCommunication: {
            enabled: false,
            wrapConnectionEvents: false,
            clients: ['custom-client'],
          },
          mcpProtocol: {
            enabled: true,
            servers: ['custom-mcp-server'],
          },
          performance: {
            enableConnectionCorrelation: false,
            maxConcurrentConnections: 500,
          },
        }
      );

      const adapter = new CommunicationEventAdapter(config);

      expect(adapter.config.websocketCommunication?.enabled).toBe(false);
      expect(adapter.config.websocketCommunication?.clients).toEqual([
        'custom-client',
      ]);
      expect(adapter.config.mcpProtocol?.servers).toEqual([
        'custom-mcp-server',
      ]);
      expect(adapter.config.performance?.maxConcurrentConnections).toBe(500);
    });

    it('should set default values for missing configuration', () => {
      const minimalConfig =
        createDefaultCommunicationEventAdapterConfig('minimal-adapter');

      const adapter = new CommunicationEventAdapter(minimalConfig);

      expect(adapter.config.communication?.correlationTTL).toBe(300000);
      expect(
        adapter.config.connectionHealthMonitoring?.healthCheckInterval
      ).toBe(30000);
      expect(adapter.config.communicationOptimization?.enabled).toBe(true);
    });
  });

  describe('🚀 Adapter Lifecycle (London TDD)', () => {
    let adapter: CommunicationEventAdapter;
    let mockLogger: unknown;

    beforeEach(() => {
      mockLogger = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const config =
        createDefaultCommunicationEventAdapterConfig('lifecycle-test');
      adapter = new CommunicationEventAdapter(config);

      // Mock the logger
      (adapter as any).logger = mockLogger;
    });

    afterEach(async () => {
      if (adapter.isRunning()) {
        await adapter.stop();
      }
      await adapter.destroy();
    });

    it('should start adapter and initialize communication integrations', async () => {
      const mockInitializeCommunicationIntegrations = vi
        .spyOn(adapter as any, 'initializeCommunicationIntegrations')
        .mockResolvedValue(undefined);

      const mockStartEventProcessing = vi
        .spyOn(adapter as any, 'startEventProcessing')
        .mockImplementation(() => {});

      await adapter.start();

      expect(adapter.isRunning()).toBe(true);
      expect(mockInitializeCommunicationIntegrations).toHaveBeenCalled();
      expect(mockStartEventProcessing).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Starting communication event adapter')
      );
    });

    it('should stop adapter and cleanup resources', async () => {
      await adapter.start();

      const mockUnwrapCommunicationComponents = vi
        .spyOn(adapter as any, 'unwrapCommunicationComponents')
        .mockResolvedValue(undefined);

      await adapter.stop();

      expect(adapter.isRunning()).toBe(false);
      expect(mockUnwrapCommunicationComponents).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Stopping communication event adapter')
      );
    });

    it('should handle start errors gracefully', async () => {
      const mockInitializeCommunicationIntegrations = vi
        .spyOn(adapter as any, 'initializeCommunicationIntegrations')
        .mockRejectedValue(new Error('Initialization failed'));

      await expect(adapter.start()).rejects.toThrow('Initialization failed');
      expect(adapter.isRunning()).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to start communication event adapter'),
        expect.any(Error)
      );
    });

    it('should restart adapter correctly', async () => {
      await adapter.start();
      expect(adapter.isRunning()).toBe(true);

      const mockStop = vi.spyOn(adapter, 'stop');
      const mockStart = vi.spyOn(adapter, 'start');

      await adapter.restart();

      expect(mockStop).toHaveBeenCalled();
      expect(mockStart).toHaveBeenCalled();
      expect(adapter.isRunning()).toBe(true);
    });
  });

  describe('📡 WebSocket Communication Events (London TDD)', () => {
    let adapter: CommunicationEventAdapter;
    let mockWebSocketClient: unknown;

    beforeEach(async () => {
      const config =
        createDefaultCommunicationEventAdapterConfig('websocket-test');
      adapter = new CommunicationEventAdapter(config);

      mockWebSocketClient = new EventEmitter();
      mockWebSocketClient.healthCheck = vi.fn().mockResolvedValue({
        status: 'healthy',
        responseTime: 50,
        errorRate: 0.02,
      });

      // Mock WebSocket client wrapping
      const mockWrapWebSocketClients = vi
        .spyOn(adapter as any, 'wrapWebSocketClients')
        .mockImplementation(async () => {
          const wrappedComponent = {
            component: mockWebSocketClient,
            componentType: 'websocket',
            wrapper: new EventEmitter(),
            originalMethods: new Map(),
            eventMappings: new Map([
              ['connect', 'communication:websocket'],
              ['disconnect', 'communication:websocket'],
              ['message', 'communication:websocket'],
            ]),
            isActive: true,
            healthMetrics: {
              lastSeen: new Date(),
              communicationCount: 0,
              errorCount: 0,
              avgLatency: 0,
            },
          };

          (adapter as any).wrappedComponents.set(
            'websocket-client-default',
            wrappedComponent
          );
        });

      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should emit WebSocket connection event with correct format', async () => {
      const connectionEvent = {
        source: 'websocket-client',
        type: 'communication:websocket' as const,
        operation: 'connect' as const,
        protocol: 'ws' as const,
        endpoint: 'ws://localhost:8080',
        details: {
          connectionId: 'conn-123',
          clientName: 'test-client',
        },
      };

      const eventListener = vi.fn();
      adapter.subscribeWebSocketCommunicationEvents(eventListener);

      await adapter.emitWebSocketCommunicationEvent(connectionEvent);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'websocket-client',
          type: 'communication:websocket',
          operation: 'connect',
          protocol: 'ws',
          endpoint: 'ws://localhost:8080',
          id: expect.any(String),
          timestamp: expect.any(Date),
          correlationId: expect.any(String),
        })
      );
    });

    it('should track WebSocket message flow with correlation', async () => {
      const correlationId = 'ws-flow-123';

      const connectEvent = {
        source: 'websocket-client',
        type: 'communication:websocket' as const,
        operation: 'connect' as const,
        protocol: 'ws' as const,
        endpoint: 'ws://localhost:8080',
        correlationId,
        details: { connectionId: 'conn-123' },
      };

      const messageEvent = {
        source: 'websocket-client',
        type: 'communication:websocket' as const,
        operation: 'send' as const,
        protocol: 'ws' as const,
        endpoint: 'ws://localhost:8080',
        correlationId,
        details: {
          connectionId: 'conn-123',
          messageId: 'msg-456',
          messageType: 'text',
        },
      };

      await adapter.emitWebSocketCommunicationEvent(connectEvent);
      await adapter.emitWebSocketCommunicationEvent(messageEvent);

      const correlation =
        adapter.getCommunicationCorrelatedEvents(correlationId);
      expect(correlation).toBeTruthy();
      expect(correlation?.events).toHaveLength(2);
      expect(correlation?.connectionId).toBe('conn-123');
      expect(correlation?.messageIds).toContain('msg-456');
    });

    it('should handle WebSocket error events with proper priority', async () => {
      const errorEvent = {
        source: 'websocket-client',
        type: 'communication:websocket' as const,
        operation: 'error' as const,
        protocol: 'ws' as const,
        endpoint: 'ws://localhost:8080',
        priority: 'high' as EventPriority,
        details: {
          connectionId: 'conn-123',
          errorCode: 'CONNECTION_LOST',
          errorMessage: 'WebSocket connection lost',
        },
      };

      const eventListener = vi.fn();
      adapter.subscribe(['communication:websocket'], eventListener);

      await adapter.emitWebSocketCommunicationEvent(errorEvent);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'error',
          priority: 'high',
          details: expect.objectContaining({
            errorCode: 'CONNECTION_LOST',
          }),
        })
      );
    });
  });

  describe('🔧 MCP Protocol Events (London TDD)', () => {
    let adapter: CommunicationEventAdapter;
    let mockMCPServer: unknown;

    beforeEach(async () => {
      const config = createDefaultCommunicationEventAdapterConfig('mcp-test');
      adapter = new CommunicationEventAdapter(config);

      mockMCPServer = new EventEmitter();
      mockMCPServer.healthCheck = vi.fn().mockResolvedValue({
        status: 'healthy',
        responseTime: 25,
        errorRate: 0.01,
      });

      // Mock MCP server wrapping
      const mockWrapMCPServers = vi
        .spyOn(adapter as any, 'wrapMCPServers')
        .mockImplementation(async () => {
          const wrappedComponent = {
            component: mockMCPServer,
            componentType: 'mcp-server',
            wrapper: new EventEmitter(),
            originalMethods: new Map(),
            eventMappings: new Map([
              ['tool:called', 'communication:mcp'],
              ['tool:completed', 'communication:mcp'],
              ['client:connected', 'communication:mcp'],
            ]),
            isActive: true,
            healthMetrics: {
              lastSeen: new Date(),
              communicationCount: 0,
              errorCount: 0,
              avgLatency: 0,
            },
          };

          (adapter as any).wrappedComponents.set(
            'mcp-server-http-mcp-server',
            wrappedComponent
          );
        });

      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should emit MCP tool execution event with tracking', async () => {
      const toolEvent = {
        source: 'mcp-server',
        type: 'communication:mcp' as const,
        operation: 'send' as const,
        protocol: 'http' as const,
        endpoint: '/tools/system_info',
        details: {
          toolName: 'system_info',
          requestId: 'req-789',
          statusCode: 200,
          responseTime: 150,
        },
      };

      const eventListener = vi.fn();
      adapter.subscribeMCPProtocolEvents(eventListener);

      await adapter.emitMCPProtocolEvent(toolEvent);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'mcp-server',
          type: 'communication:mcp',
          operation: 'send',
          details: expect.objectContaining({
            toolName: 'system_info',
            requestId: 'req-789',
          }),
        })
      );
    });

    it('should correlate MCP request-response pairs', async () => {
      const correlationId = 'mcp-req-res-123';

      const requestEvent = {
        source: 'mcp-client',
        type: 'communication:mcp' as const,
        operation: 'send' as const,
        protocol: 'stdio' as const,
        endpoint: '/tools/swarm_init',
        correlationId,
        details: {
          toolName: 'swarm_init',
          requestId: 'req-101',
        },
      };

      const responseEvent = {
        source: 'mcp-server',
        type: 'communication:mcp' as const,
        operation: 'receive' as const,
        protocol: 'http' as const,
        endpoint: '/tools/swarm_init',
        correlationId,
        details: {
          toolName: 'swarm_init',
          requestId: 'req-101',
          statusCode: 200,
          responseTime: 45,
        },
      };

      await adapter.emitMCPProtocolEvent(requestEvent);
      await adapter.emitMCPProtocolEvent(responseEvent);

      const correlation =
        adapter.getCommunicationCorrelatedEvents(correlationId);
      expect(correlation).toBeTruthy();
      expect(correlation?.events).toHaveLength(2);
      expect(correlation?.operation).toBe('send');
      expect(correlation?.protocolType).toBe('stdio');
    });

    it('should handle MCP timeout events with appropriate urgency', async () => {
      const timeoutEvent = {
        source: 'mcp-client',
        type: 'communication:mcp' as const,
        operation: 'timeout' as const,
        protocol: 'stdio' as const,
        endpoint: '/tools/long_running_task',
        priority: 'high' as EventPriority,
        details: {
          toolName: 'long_running_task',
          requestId: 'req-timeout-202',
          timeoutDuration: 30000,
        },
      };

      const eventListener = vi.fn();
      adapter.subscribeMCPProtocolEvents(eventListener);

      await adapter.emitMCPProtocolEvent(timeoutEvent);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'timeout',
          priority: 'high',
          details: expect.objectContaining({
            timeoutDuration: 30000,
          }),
        })
      );
    });
  });

  describe('🌐 HTTP Communication Events (London TDD)', () => {
    let adapter: CommunicationEventAdapter;

    beforeEach(async () => {
      const config = createDefaultCommunicationEventAdapterConfig('http-test');
      adapter = new CommunicationEventAdapter(config);

      // Mock HTTP communication wrapping
      const mockWrapHTTPCommunication = vi
        .spyOn(adapter as any, 'wrapHTTPCommunication')
        .mockImplementation(async () => {
          const wrappedComponent = {
            component: null,
            componentType: 'http',
            wrapper: new EventEmitter(),
            originalMethods: new Map(),
            eventMappings: new Map([
              ['request', 'communication:http'],
              ['response', 'communication:http'],
              ['timeout', 'communication:http'],
            ]),
            isActive: true,
            healthMetrics: {
              lastSeen: new Date(),
              communicationCount: 0,
              errorCount: 0,
              avgLatency: 0,
            },
          };

          (adapter as any).wrappedComponents.set(
            'http-communication',
            wrappedComponent
          );
        });

      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should emit HTTP request event with method and URL', async () => {
      const requestEvent = {
        id: 'http-test-1',
        timestamp: new Date(),
        source: 'http-client',
        type: 'communication:http' as const,
        operation: 'send' as const,
        protocol: 'https' as const,
        endpoint: 'https://api.example.com/data',
        priority: 'medium' as EventPriority,
        details: {
          requestId: 'http-req-1',
          statusCode: 200,
          responseTime: 320,
        },
      };

      const eventListener = vi.fn();
      adapter.subscribeHTTPCommunicationEvents(eventListener);

      await adapter.emit(requestEvent);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'communication:http',
          operation: 'send',
          protocol: 'https',
          endpoint: 'https://api.example.com/data',
        })
      );
    });

    it('should track HTTP retry attempts', async () => {
      const correlationId = 'http-retry-303';

      const initialRequest = {
        id: 'http-retry-1',
        timestamp: new Date(),
        source: 'http-client',
        type: 'communication:http' as const,
        operation: 'send' as const,
        protocol: 'https' as const,
        endpoint: 'https://api.example.com/flaky',
        priority: 'medium' as EventPriority,
        correlationId,
        details: { requestId: 'req-1', retryAttempt: 0 },
      };

      const retryRequest = {
        id: 'http-retry-2',
        timestamp: new Date(),
        source: 'http-client',
        type: 'communication:http' as const,
        operation: 'retry' as const,
        protocol: 'https' as const,
        endpoint: 'https://api.example.com/flaky',
        priority: 'medium' as EventPriority,
        correlationId,
        details: { requestId: 'req-1', retryAttempt: 1 },
      };

      await adapter.emit(initialRequest);
      await adapter.emit(retryRequest);

      const correlation =
        adapter.getCommunicationCorrelatedEvents(correlationId);
      expect(correlation).toBeTruthy();
      expect(correlation?.events).toHaveLength(2);
      expect(correlation?.events[1].operation).toBe('retry');
    });
  });

  describe('🔀 Protocol Communication Events (London TDD)', () => {
    let adapter: CommunicationEventAdapter;

    beforeEach(async () => {
      const config =
        createDefaultCommunicationEventAdapterConfig('protocol-test');
      adapter = new CommunicationEventAdapter(config);

      // Mock protocol communication wrapping
      const mockWrapProtocolCommunication = vi
        .spyOn(adapter as any, 'wrapProtocolCommunication')
        .mockImplementation(async () => {
          ['http', 'https', 'ws', 'wss', 'stdio'].forEach((protocolType) => {
            const wrappedComponent = {
              component: null,
              componentType: 'protocol',
              wrapper: new EventEmitter(),
              originalMethods: new Map(),
              eventMappings: new Map([
                ['protocol:switched', 'communication:protocol'],
                ['protocol:optimized', 'communication:protocol'],
                ['routing:message', 'communication:protocol'],
              ]),
              isActive: true,
              healthMetrics: {
                lastSeen: new Date(),
                communicationCount: 0,
                errorCount: 0,
                avgLatency: 0,
              },
            };

            (adapter as any).wrappedComponents.set(
              `${protocolType}-protocol`,
              wrappedComponent
            );
          });
        });

      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should emit protocol switching event with optimization details', async () => {
      const switchEvent = {
        id: 'protocol-switch-1',
        timestamp: new Date(),
        source: 'protocol-manager',
        type: 'communication:protocol' as const,
        operation: 'send' as const,
        protocol: 'ws' as const,
        endpoint: 'protocol-switch',
        priority: 'medium' as EventPriority,
        details: {
          requestId: 'protocol-switch-req',
          statusCode: 200,
          responseTime: 25,
        },
      };

      const eventListener = vi.fn();
      adapter.subscribeProtocolCommunicationEvents(eventListener);

      await adapter.emit(switchEvent);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'communication:protocol',
          details: expect.objectContaining({
            statusCode: 200,
            responseTime: 25,
          }),
        })
      );
    });

    it('should track protocol routing performance', async () => {
      const routingEvent = {
        id: 'protocol-routing-1',
        timestamp: new Date(),
        source: 'ws-protocol',
        type: 'communication:protocol' as const,
        operation: 'send' as const,
        protocol: 'ws' as const,
        endpoint: 'message-routing',
        priority: 'medium' as EventPriority,
        details: {
          requestId: 'msg-routing-404',
          responseTime: 15,
          statusCode: 200,
        },
      };

      await adapter.emit(routingEvent);

      const protocolMetrics = adapter.getProtocolMetrics('ws');
      expect(protocolMetrics.eventCount).toBe(1);
      expect(protocolMetrics.lastUpdate).toBeInstanceOf(Date);
    });
  });

  describe('📊 Event Correlation and Performance (Classical TDD)', () => {
    let adapter: CommunicationEventAdapter;

    beforeEach(async () => {
      const config = createDefaultCommunicationEventAdapterConfig(
        'correlation-test',
        {
          communication: {
            enabled: true,
            strategy: 'websocket',
            correlationTTL: 60000,
            maxCorrelationDepth: 10,
            correlationPatterns: [
              'communication:websocket->communication:mcp',
              'communication:http->communication:mcp',
            ],
            trackMessageFlow: true,
            trackConnectionHealth: true,
          },
        }
      );
      adapter = new CommunicationEventAdapter(config);
      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should calculate communication efficiency correctly', () => {
      const correlation = {
        correlationId: 'efficiency-test-505',
        events: [
          {
            operation: 'connect',
            details: { statusCode: 200 },
          },
          {
            operation: 'send',
            details: { statusCode: 200 },
          },
          {
            operation: 'receive',
            details: { statusCode: 200 },
          },
        ],
        startTime: new Date(Date.now() - 5000),
        lastUpdate: new Date(),
        protocolType: 'ws',
        messageIds: ['msg-1', 'msg-2'],
        operation: 'connect',
        status: 'active' as const,
        performance: {
          totalLatency: 5000,
          communicationEfficiency: 0,
          resourceUtilization: 0,
        },
        metadata: {},
      };

      const efficiency = (adapter as any).calculateCommunicationEfficiency(
        correlation
      );

      // Should have high efficiency: all events successful, reasonable time
      expect(efficiency).toBeGreaterThan(0.8);
      expect(efficiency).toBeLessThanOrEqual(1.0);
    });

    it('should detect communication correlation completion patterns', () => {
      const correlationWithPattern = {
        correlationId: 'pattern-test-606',
        events: [
          { type: 'communication:websocket', operation: 'connect' },
          { type: 'communication:mcp', operation: 'send' },
        ],
        startTime: new Date(),
        lastUpdate: new Date(),
        protocolType: 'ws',
        messageIds: [],
        operation: 'connect',
        status: 'active' as const,
        performance: {
          totalLatency: 1000,
          communicationEfficiency: 1.0,
          resourceUtilization: 0.5,
        },
        metadata: {},
      };

      const isComplete = (adapter as any).isCommunicationCorrelationComplete(
        correlationWithPattern
      );
      expect(isComplete).toBe(true);
    });

    it('should extract communication operation from event type correctly', () => {
      const testCases = [
        { eventType: 'websocket:connect', expected: 'connect' },
        { eventType: 'mcp:tool:request', expected: 'send' },
        { eventType: 'http:response', expected: 'receive' },
        { eventType: 'protocol:error', expected: 'error' },
        { eventType: 'websocket:timeout', expected: 'timeout' },
        { eventType: 'mcp:retry', expected: 'retry' },
        { eventType: 'unknown:operation', expected: 'send' },
      ];

      testCases.forEach(({ eventType, expected }) => {
        const operation = (adapter as any).extractCommunicationOperation(
          eventType
        );
        expect(operation).toBe(expected);
      });
    });

    it('should extract protocol type from event data correctly', () => {
      const testCases = [
        { eventType: 'websocket:message', data: null, expected: 'ws' },
        { eventType: 'http:request', data: null, expected: 'http' },
        { eventType: 'mcp:tool', data: null, expected: 'stdio' },
        {
          eventType: 'custom:event',
          data: { protocol: 'tcp' },
          expected: 'tcp',
        },
        { eventType: 'unknown:event', data: null, expected: 'custom' },
      ];

      testCases.forEach(({ eventType, data, expected }) => {
        const protocol = (adapter as any).extractProtocol(eventType, data);
        expect(protocol).toBe(expected);
      });
    });

    it('should determine communication event priority based on event type', () => {
      const testCases = [
        { eventType: 'websocket:error', expected: 'high' },
        { eventType: 'mcp:timeout', expected: 'high' },
        { eventType: 'http:disconnect', expected: 'high' },
        { eventType: 'protocol:connect', expected: 'high' },
        { eventType: 'websocket:message', expected: 'medium' },
        { eventType: 'mcp:response', expected: 'medium' },
        { eventType: 'http:completed', expected: 'medium' },
        { eventType: 'unknown:event', expected: 'medium' },
      ];

      testCases.forEach(({ eventType, expected }) => {
        const priority = (adapter as any).determineCommunicationEventPriority(
          eventType
        );
        expect(priority).toBe(expected);
      });
    });
  });

  describe('🏥 Health Monitoring (London TDD)', () => {
    let adapter: CommunicationEventAdapter;

    beforeEach(async () => {
      const config = createDefaultCommunicationEventAdapterConfig(
        'health-test',
        {
          connectionHealthMonitoring: {
            enabled: true,
            healthCheckInterval: 10000,
            connectionHealthThresholds: {
              'websocket-client': 0.9,
              'mcp-server': 0.85,
              'http-client': 0.8,
            },
            protocolHealthThresholds: {
              'communication-latency': 100,
              throughput: 1000,
              reliability: 0.95,
            },
            autoRecoveryEnabled: true,
          },
        }
      );
      adapter = new CommunicationEventAdapter(config);

      // Mock wrapped components for health testing
      (adapter as any).wrappedComponents.set('websocket-client-test', {
        component: {
          healthCheck: vi
            .fn()
            .mockResolvedValue({ responseTime: 50, errorRate: 0.05 }),
        },
        componentType: 'websocket',
        wrapper: new EventEmitter(),
        originalMethods: new Map(),
        eventMappings: new Map(),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          communicationCount: 100,
          errorCount: 5,
          avgLatency: 50,
        },
      });

      (adapter as any).wrappedComponents.set('mcp-server-test', {
        component: {
          getMetrics: vi.fn().mockResolvedValue({
            averageLatency: 75,
            throughput: 500,
            requestCount: 200,
            errorCount: 10,
          }),
        },
        componentType: 'mcp-server',
        wrapper: new EventEmitter(),
        originalMethods: new Map(),
        eventMappings: new Map(),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          communicationCount: 200,
          errorCount: 10,
          avgLatency: 75,
        },
      });

      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should perform comprehensive health check on all components', async () => {
      const healthResults = await adapter.performCommunicationHealthCheck();

      expect(healthResults).toHaveProperty('websocket-client-test');
      expect(healthResults).toHaveProperty('mcp-server-test');

      const websocketHealth = healthResults?.['websocket-client-test'];
      expect(websocketHealth.componentType).toBe('websocket');
      expect(websocketHealth.status).toMatch(/healthy|degraded|unhealthy/);
      expect(websocketHealth.communicationLatency).toBeGreaterThanOrEqual(0);
      expect(websocketHealth.reliability).toBeGreaterThanOrEqual(0);
      expect(websocketHealth.reliability).toBeLessThanOrEqual(1);

      const mcpHealth = healthResults?.['mcp-server-test'];
      expect(mcpHealth.componentType).toBe('mcp-server');
      expect(mcpHealth.throughput).toBeGreaterThanOrEqual(0);
    });

    it('should return overall adapter health status', async () => {
      const status: EventManagerStatus = await adapter.healthCheck();

      expect(status.name).toBe('health-test');
      expect(status.type).toBe('communication');
      expect(status.status).toMatch(/healthy|degraded|unhealthy/);
      expect(status.lastCheck).toBeInstanceOf(Date);
      expect(status.subscriptions).toBeGreaterThanOrEqual(0);
      expect(status.queueSize).toBeGreaterThanOrEqual(0);
      expect(status.errorRate).toBeGreaterThanOrEqual(0);
      expect(status.uptime).toBeGreaterThanOrEqual(0);
      expect(status.metadata).toHaveProperty('componentHealth');
      expect(status.metadata).toHaveProperty('avgCommunicationLatency');
    });

    it('should calculate correct health scores based on thresholds', async () => {
      const healthResults = await adapter.performCommunicationHealthCheck();

      for (const [componentName, health] of Object.entries(healthResults)) {
        const threshold =
          adapter.config.connectionHealthMonitoring
            ?.connectionHealthThresholds?.[componentName];

        if (health.status === 'healthy') {
          expect(health.reliability).toBeGreaterThanOrEqual(threshold || 0.8);
        } else if (health.status === 'degraded') {
          expect(health.reliability).toBeLessThan(threshold || 0.8);
          expect(health.reliability).toBeGreaterThan((threshold || 0.8) * 0.7);
        } else if (health.status === 'unhealthy') {
          expect(health.reliability).toBeLessThanOrEqual(
            (threshold || 0.8) * 0.7
          );
        }
      }
    });
  });

  describe('📈 Metrics Collection (Classical TDD)', () => {
    let adapter: CommunicationEventAdapter;

    beforeEach(async () => {
      const config =
        createDefaultCommunicationEventAdapterConfig('metrics-test');
      adapter = new CommunicationEventAdapter(config);
      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should collect and return adapter metrics', async () => {
      // Emit some events to generate metrics
      await adapter.emit({
        id: 'metric-test-1',
        timestamp: new Date(),
        source: 'test',
        type: 'communication:websocket',
        operation: 'connect',
        protocol: 'ws',
        priority: 'medium',
      });

      await adapter.emit({
        id: 'metric-test-2',
        timestamp: new Date(),
        source: 'test',
        type: 'communication:mcp',
        operation: 'send',
        protocol: 'http',
        priority: 'medium',
      });

      const metrics: EventManagerMetrics = await adapter.getMetrics();

      expect(metrics.name).toBe('metrics-test');
      expect(metrics.type).toBe('communication');
      expect(metrics.eventsProcessed).toBeGreaterThanOrEqual(2);
      expect(metrics.eventsEmitted).toBeGreaterThanOrEqual(2);
      expect(metrics.eventsFailed).toBeGreaterThanOrEqual(0);
      expect(metrics.averageLatency).toBeGreaterThanOrEqual(0);
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
      expect(metrics.subscriptionCount).toBeGreaterThanOrEqual(0);
      expect(metrics.queueSize).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThan(0);
      expect(metrics.timestamp).toBeInstanceOf(Date);
    });

    it('should estimate memory usage accurately', () => {
      // Add some data to estimate
      (adapter as any).subscriptions.set('sub-1', {
        eventTypes: ['test'],
        listener: () => {},
      });
      (adapter as any).eventHistory.push({ type: 'test' }, { type: 'test2' });
      (adapter as any).communicationCorrelations.set('corr-1', {
        events: [{ type: 'test' }, { type: 'test2' }],
      });

      const memoryUsage = (adapter as any).estimateMemoryUsage();

      expect(memoryUsage).toBeGreaterThan(0);
      expect(typeof memoryUsage).toBe('number');
    });

    it('should update communication-specific metrics correctly', () => {
      const testEvent: CommunicationEvent = {
        id: 'metrics-update-test',
        timestamp: new Date(),
        source: 'test-source',
        type: 'communication:websocket',
        operation: 'connect',
        protocol: 'ws',
        priority: 'medium',
        details: {
          connectionId: 'conn-789',
          requestId: 'msg-101',
        },
      };

      (adapter as any).updateCommunicationMetrics(testEvent);

      const connectionMetrics = adapter.getConnectionMetrics('conn-789');
      expect(connectionMetrics.eventCount).toBe(1);
      expect(connectionMetrics.lastUpdate).toBeInstanceOf(Date);
    });
  });

  describe('🔧 Configuration Management (Classical TDD)', () => {
    let adapter: CommunicationEventAdapter;

    beforeEach(async () => {
      const config =
        createDefaultCommunicationEventAdapterConfig('config-test');
      adapter = new CommunicationEventAdapter(config);
      await adapter.start();
    });

    afterEach(async () => {
      await adapter.stop();
      await adapter.destroy();
    });

    it('should update configuration correctly', () => {
      const newConfig = {
        performance: {
          enableConnectionCorrelation: false,
          maxConcurrentConnections: 2000,
        },
        communicationOptimization: {
          enabled: false,
          optimizationInterval: 60000,
          performanceThresholds: {
            latency: 50,
            throughput: 500,
            reliability: 0.98,
          },
          connectionPooling: true,
          messageCompression: true,
        },
      };

      adapter.updateConfig(newConfig);

      expect(adapter.config.performance?.enableConnectionCorrelation).toBe(
        false
      );
      expect(adapter.config.performance?.maxConcurrentConnections).toBe(2000);
      expect(adapter.config.communicationOptimization?.enabled).toBe(false);
    });

    it('should maintain existing configuration when partially updated', () => {
      const originalWebSocketConfig = adapter.config.websocketCommunication;

      adapter.updateConfig({
        mcpProtocol: {
          enabled: false,
        },
      });

      expect(adapter.config.websocketCommunication).toEqual(
        originalWebSocketConfig
      );
      expect(adapter.config.mcpProtocol?.enabled).toBe(false);
    });
  });

  describe('🏭 CommunicationEventFactory Integration (London TDD)', () => {
    let factory: CommunicationEventFactory;

    beforeEach(() => {
      factory = new CommunicationEventFactory();
    });

    afterEach(async () => {
      await factory.shutdown();
    });

    it('should create communication adapter through factory', async () => {
      const config =
        createDefaultCommunicationEventAdapterConfig('factory-test');
      const adapter = await factory.create(config);

      expect(adapter).toBeInstanceOf(CommunicationEventAdapter);
      expect(adapter.name).toBe('factory-test');
      expect(adapter.isRunning()).toBe(true);
    });

    it('should create specialized WebSocket adapter', async () => {
      const adapter = await factory.createWebSocketAdapter(
        'websocket-specialized'
      );

      expect(adapter.config.websocketCommunication?.enabled).toBe(true);
      expect(adapter.config.mcpProtocol?.enabled).toBe(false);
      expect(adapter.config.httpCommunication?.enabled).toBe(false);
      expect(adapter.config.protocolCommunication?.enabled).toBe(false);
    });

    it('should create specialized MCP adapter', async () => {
      const adapter = await factory.createMCPAdapter('mcp-specialized');

      expect(adapter.config.mcpProtocol?.enabled).toBe(true);
      expect(adapter.config.httpCommunication?.enabled).toBe(true);
      expect(adapter.config.websocketCommunication?.enabled).toBe(false);
      expect(adapter.config.protocolCommunication?.enabled).toBe(false);
    });

    it('should create comprehensive adapter with all communication types', async () => {
      const adapter =
        await factory.createComprehensiveAdapter('comprehensive-test');

      expect(adapter.config.websocketCommunication?.enabled).toBe(true);
      expect(adapter.config.mcpProtocol?.enabled).toBe(true);
      expect(adapter.config.httpCommunication?.enabled).toBe(true);
      expect(adapter.config.protocolCommunication?.enabled).toBe(true);
    });

    it('should get communication health summary from factory', async () => {
      await factory.createWebSocketAdapter('ws-health-test');
      await factory.createMCPAdapter('mcp-health-test');

      const healthSummary = await factory.getCommunicationHealthSummary();

      expect(healthSummary.totalAdapters).toBe(2);
      expect(healthSummary.healthyAdapters).toBeGreaterThanOrEqual(0);
      expect(healthSummary.degradedAdapters).toBeGreaterThanOrEqual(0);
      expect(healthSummary.unhealthyAdapters).toBeGreaterThanOrEqual(0);
      expect(healthSummary.connectionHealth).toBeDefined();
      expect(healthSummary.protocolHealth).toBeDefined();
    });

    it('should get communication metrics summary from factory', async () => {
      const adapter1 = await factory.createWebSocketAdapter('metrics-test-1');
      const adapter2 = await factory.createMCPAdapter('metrics-test-2');

      // Emit some events to generate metrics
      await adapter1.emit({
        id: 'factory-metric-1',
        timestamp: new Date(),
        source: 'factory-test',
        type: 'communication:websocket',
        operation: 'connect',
        protocol: 'ws',
        priority: 'medium',
      });

      await adapter2.emit({
        id: 'factory-metric-2',
        timestamp: new Date(),
        source: 'factory-test',
        type: 'communication:mcp',
        operation: 'send',
        protocol: 'http',
        priority: 'medium',
      });

      const metricsSummary = await factory.getCommunicationMetricsSummary();

      expect(metricsSummary.totalEvents).toBeGreaterThanOrEqual(2);
      expect(metricsSummary.successfulEvents).toBeGreaterThanOrEqual(2);
      expect(metricsSummary.failedEvents).toBeGreaterThanOrEqual(0);
      expect(metricsSummary.avgLatency).toBeGreaterThanOrEqual(0);
      expect(metricsSummary.totalThroughput).toBeGreaterThanOrEqual(0);
      expect(metricsSummary.connectionMetrics).toBeDefined();
      expect(metricsSummary.protocolMetrics).toBeDefined();
    });
  });

  describe('🧹 Cleanup and Error Handling (London TDD)', () => {
    let adapter: CommunicationEventAdapter;

    beforeEach(async () => {
      const config =
        createDefaultCommunicationEventAdapterConfig('cleanup-test');
      adapter = new CommunicationEventAdapter(config);
      await adapter.start();
    });

    it('should cleanup all resources on destroy', async () => {
      // Add some data to cleanup
      adapter.subscribe(['communication:websocket'], () => {});
      (adapter as any).eventHistory.push({ type: 'test' });
      (adapter as any).communicationCorrelations.set('cleanup-test', {
        events: [],
      });

      await adapter.destroy();

      expect(adapter.getSubscriptions()).toHaveLength(0);
      expect((adapter as any).eventHistory).toHaveLength(0);
      expect((adapter as any).communicationCorrelations.size).toBe(0);
      expect(adapter.isRunning()).toBe(false);
    });

    it('should handle emit errors gracefully', async () => {
      const invalidEvent = {
        // Missing required fields
        source: 'test',
        type: 'communication:websocket' as const,
      } as any;

      await expect(adapter.emit(invalidEvent)).rejects.toThrow();
    });

    it('should handle subscription listener errors without crashing', async () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      adapter.subscribe(['communication:websocket'], errorListener);

      const testEvent = {
        id: 'error-test',
        timestamp: new Date(),
        source: 'test',
        type: 'communication:websocket' as const,
        operation: 'connect' as const,
        protocol: 'ws' as const,
        priority: 'medium' as const,
      };

      // Should not throw despite listener error
      await expect(adapter.emit(testEvent)).resolves.not.toThrow();
      expect(errorListener).toHaveBeenCalled();
    });

    it('should handle start failures and remain in stopped state', async () => {
      const failingAdapter = new CommunicationEventAdapter(
        createDefaultCommunicationEventAdapterConfig('failing-adapter')
      );

      // Mock initialization to fail
      vi.spyOn(
        failingAdapter as any,
        'initializeCommunicationIntegrations'
      ).mockRejectedValue(new Error('Initialization failed'));

      await expect(failingAdapter.start()).rejects.toThrow(
        'Initialization failed'
      );
      expect(failingAdapter.isRunning()).toBe(false);

      await failingAdapter.destroy();
    });
  });
});
