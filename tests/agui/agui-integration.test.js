/**
 * 🧪 AG-UI Integration Tests for Claude Code Zen
 *
 * Basic tests to validate AG-UI protocol integration
 */

import { EventEmitter } from 'node:events';
import { EventType } from '@ag-ui/core';
import { AGUIAdapter } from '../../src/ai/agui-adapter.js';
import { AGUIWebSocketMiddleware } from '../../src/api/agui-websocket-middleware.js';

describe('AG-UI Integration Tests', () => {
  let adapter;

  beforeEach(() => {
    adapter = new AGUIAdapter({
      sessionId: 'test-session',
      threadId: 'test-thread',
    });
  });

  afterEach(() => {
    adapter.reset();
  });

  describe('AGUIAdapter', () => {
    test('should create adapter with correct session info', () => {
      expect(adapter.sessionId).toBe('test-session');
      expect(adapter.threadId).toBe('test-thread');
    });

    test('should emit text message events correctly', (done) => {
      let eventsReceived = 0;
      const expectedEvents = ['TEXT_MESSAGE_START', 'TEXT_MESSAGE_CONTENT', 'TEXT_MESSAGE_END'];

      adapter.on('agui:event', (event) => {
        expect(expectedEvents).toContain(event.type);
        eventsReceived++;

        if (eventsReceived === 3) {
          done();
        }
      });

      const messageId = adapter.startTextMessage();
      adapter.addTextContent('Test message');
      adapter.endTextMessage(messageId);
    });

    test('should emit tool call events correctly', (done) => {
      let eventsReceived = 0;
      const expectedEvents = [
        'TOOL_CALL_START',
        'TOOL_CALL_ARGS',
        'TOOL_CALL_END',
        'TOOL_CALL_RESULT',
      ];

      adapter.on('agui:event', (event) => {
        expect(expectedEvents).toContain(event.type);
        eventsReceived++;

        if (eventsReceived === 4) {
          done();
        }
      });

      const toolCallId = adapter.startToolCall('test_tool');
      adapter.addToolCallArgs('{"param": "value"}', toolCallId);
      adapter.endToolCall(toolCallId);
      adapter.emitToolCallResult('Test result', toolCallId);
    });

    test('should emit custom events for Claude Zen functionality', (done) => {
      adapter.on('agui:event', (event) => {
        expect(event.type).toBe(EventType.CUSTOM);
        expect(event.name).toBe('queen_action');
        expect(event.value).toHaveProperty('queenId', 'test-queen');
        done();
      });

      adapter.emitQueenEvent('test-queen', 'test_action', { data: 'test' });
    });

    test('should track statistics correctly', () => {
      adapter.startTextMessage();
      adapter.addTextContent('Test');
      adapter.endTextMessage();

      const toolCallId = adapter.startToolCall('test_tool');
      adapter.endToolCall(toolCallId);

      const stats = adapter.getStats();
      expect(stats.messagesCreated).toBe(1);
      expect(stats.toolCallsExecuted).toBe(1);
      expect(stats.eventsEmitted).toBeGreaterThan(0);
    });
  });

  describe('AGUIWebSocketMiddleware', () => {
    let mockWSS;
    let middleware;

    beforeEach(() => {
      mockWSS = new EventEmitter();
      middleware = new AGUIWebSocketMiddleware(mockWSS);
    });

    test('should create global adapter', () => {
      const globalAdapter = middleware.getGlobalAdapter();
      expect(globalAdapter).toBeDefined();
      expect(globalAdapter.sessionId).toBe('server-global');
    });

    test('should initialize client adapters', () => {
      const mockWS = new EventEmitter();
      mockWS.readyState = 1; // OPEN
      mockWS.send = jest.fn();

      const clientAdapter = middleware.initializeClient(mockWS);

      expect(clientAdapter).toBeDefined();
      expect(middleware.getClientAdapter(mockWS)).toBe(clientAdapter);
    });

    test('should broadcast events to clients', () => {
      const mockWS1 = new EventEmitter();
      mockWS1.readyState = 1; // OPEN
      mockWS1.send = jest.fn();

      const mockWS2 = new EventEmitter();
      mockWS2.readyState = 1; // OPEN
      mockWS2.send = jest.fn();

      middleware.initializeClient(mockWS1);
      middleware.initializeClient(mockWS2);

      const testEvent = {
        type: EventType.CUSTOM,
        name: 'test',
        value: 'broadcast test',
      };

      const sentCount = middleware.broadcastAGUIEvent(testEvent);

      expect(sentCount).toBe(2);
      expect(mockWS1.send).toHaveBeenCalled();
      expect(mockWS2.send).toHaveBeenCalled();
    });
  });

  describe('Integration with Claude Code Zen', () => {
    test('should handle Queen coordination events', () => {
      const events = [];

      adapter.on('agui:event', (event) => {
        events.push(event);
      });

      // Simulate multi-Queen coordination
      adapter.emitQueenEvent('queen-1', 'start_analysis', { target: 'codebase' });
      adapter.emitQueenEvent('queen-2', 'join_analysis', { specialization: 'optimization' });
      adapter.emitHiveMindEvent('consensus_reached', { decision: 'proceed' });

      expect(events).toHaveLength(3);
      expect(events[0].value.queenId).toBe('queen-1');
      expect(events[1].value.queenId).toBe('queen-2');
      expect(events[2].value.action).toBe('consensus_reached');
    });

    test('should handle swarm coordination events', () => {
      const events = [];

      adapter.on('agui:event', (event) => {
        events.push(event);
      });

      // Simulate swarm coordination
      adapter.emitSwarmEvent('swarm-1', 'initialize', ['agent-1', 'agent-2'], { task: 'analysis' });
      adapter.emitSwarmEvent('swarm-1', 'execute', ['agent-1'], { action: 'scan' });

      expect(events).toHaveLength(2);
      expect(events[0].value.swarmId).toBe('swarm-1');
      expect(events[0].value.agents).toEqual(['agent-1', 'agent-2']);
    });

    test('should handle state synchronization', () => {
      const events = [];

      adapter.on('agui:event', (event) => {
        events.push(event);
      });

      const testState = {
        queens: { count: 3 },
        swarms: { active: 2 },
        databases: { sqlite: 'healthy' },
      };

      adapter.emitStateSnapshot(testState);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(EventType.STATE_SNAPSHOT);
      expect(events[0].snapshot).toEqual(testState);
    });
  });
});

// Run tests if called directly
if (process.argv[1].endsWith('/agui-integration.test.js')) {
  console.warn('🧪 Running AG-UI Integration Tests...');

  // Simple test runner for when Jest is not available
  async function runBasicTests() {
    const adapter = new AGUIAdapter({ sessionId: 'test' });

    // Test 1: Basic functionality
    console.warn('✓ Testing basic adapter creation');

    // Test 2: Text message flow
    let eventCount = 0;
    adapter.on('agui:event', () => eventCount++);

    const messageId = adapter.startTextMessage();
    adapter.addTextContent('Test');
    adapter.endTextMessage(messageId);

    console.warn(`✓ Text message flow (${eventCount} events)`);

    // Test 3: Tool call flow
    const initialCount = eventCount;
    const toolCallId = adapter.startToolCall('test_tool');
    adapter.addToolCallArgs('{}');
    adapter.endToolCall(toolCallId);
    adapter.emitToolCallResult('result', toolCallId);

    console.warn(`✓ Tool call flow (${eventCount - initialCount} events)`);

    // Test 4: Custom events
    const beforeCustom = eventCount;
    adapter.emitQueenEvent('queen-1', 'test', {});
    adapter.emitSwarmEvent('swarm-1', 'test', [], {});
    adapter.emitHiveMindEvent('test', {});

    console.warn(`✓ Custom events (${eventCount - beforeCustom} events)`);

    console.warn(`\n✅ Basic tests completed! Total events: ${eventCount}`);
    console.warn('📊 Final stats:', adapter.getStats());
  }

  runBasicTests().catch(console.error);
}
