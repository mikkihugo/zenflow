/**
 * Hybrid Testing - WebSocket Swarm Coordination
 *
 * Combines TDD London (mocking protocols) with Classical TDD (testing latency/throughput)
 * Perfect for real-time distributed systems
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventEmitter } from 'events';

// Mock WebSocket for protocol testing (London)
class MockWebSocket extends EventEmitter {
  readyState: number = 0; // CONNECTING
  url: string;

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url: string) {
    super();
    this.url = url;
    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.emit('open');
    }, 10);
  }

  send = jest.fn((data: string) => {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Simulate echo for testing
    setTimeout(() => {
      this.emit('message', { data });
    }, 5);
  });

  close = jest.fn(() => {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.emit('close');
    }, 5);
  });
}

// Swarm Coordinator that uses WebSocket
interface SwarmMessage {
  type: 'init' | 'spawn' | 'task' | 'sync' | 'heartbeat';
  agentId?: string;
  payload?: any;
  timestamp: number;
}

class SwarmCoordinator {
  private agents = new Map<string, { lastSeen: number; status: string }>();
  private messageHandlers = new Map<string, (msg: SwarmMessage) => void>();
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    averageLatency: 0,
    latencySamples: [] as number[],
  };

  constructor(
    private websocket: MockWebSocket | WebSocket,
    private protocol: { encode: Function; decode: Function }
  ) {
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.websocket.addEventListener('open', () => {
      console.log('WebSocket connected');
    });

    this.websocket.addEventListener('message', (event: any) => {
      const message = this.protocol.decode(event.data);
      this.handleMessage(message);
    });

    this.websocket.addEventListener('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  async broadcastMessage(message: Omit<SwarmMessage, 'timestamp'>): Promise<void> {
    const fullMessage: SwarmMessage = {
      ...message,
      timestamp: Date.now(),
    };

    const encoded = this.protocol.encode(fullMessage);
    this.websocket.send(encoded);
    this.metrics.messagesSent++;
  }

  private handleMessage(message: SwarmMessage) {
    this.metrics.messagesReceived++;

    // Calculate latency
    const latency = Date.now() - message.timestamp;
    this.metrics.latencySamples.push(latency);
    this.metrics.averageLatency =
      this.metrics.latencySamples.reduce((a, b) => a + b, 0) / this.metrics.latencySamples.length;

    // Update agent status
    if (message.agentId) {
      this.agents.set(message.agentId, {
        lastSeen: Date.now(),
        status: 'active',
      });
    }

    // Handle specific message types
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  onMessage(type: string, handler: (msg: SwarmMessage) => void) {
    this.messageHandlers.set(type, handler);
  }

  async coordinateAgents(agentIds: string[], task: any): Promise<void> {
    // Broadcast task to all agents
    const promises = agentIds.map((agentId) =>
      this.broadcastMessage({
        type: 'task',
        agentId,
        payload: task,
      })
    );

    await Promise.all(promises);
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getActiveAgents(): string[] {
    const now = Date.now();
    const activeAgents: string[] = [];

    this.agents.forEach((info, agentId) => {
      if (now - info.lastSeen < 30000) {
        // 30 second timeout
        activeAgents.push(agentId);
      }
    });

    return activeAgents;
  }

  async measureRoundTripTime(): Promise<number> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const echoHandler = (msg: SwarmMessage) => {
        if (msg.type === 'heartbeat') {
          const rtt = Date.now() - startTime;
          this.messageHandlers.delete('heartbeat');
          resolve(rtt);
        }
      };

      this.onMessage('heartbeat', echoHandler);
      this.broadcastMessage({ type: 'heartbeat' });
    });
  }
}

describe('WebSocket Swarm Coordination - Hybrid Testing', () => {
  let mockWebSocket: MockWebSocket;
  let mockProtocol: { encode: jest.Mock; decode: jest.Mock };
  let coordinator: SwarmCoordinator;

  beforeEach(() => {
    mockWebSocket = new MockWebSocket('ws://localhost:8080');
    mockProtocol = {
      encode: jest.fn((msg) => JSON.stringify(msg)),
      decode: jest.fn((data) => JSON.parse(data)),
    };
    coordinator = new SwarmCoordinator(mockWebSocket, mockProtocol);
  });

  afterEach(() => {
    mockWebSocket.close();
  });

  describe('Protocol Behavior (TDD London)', () => {
    it('should encode messages before sending', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      await coordinator.broadcastMessage({ type: 'init' });

      expect(mockProtocol.encode).toHaveBeenCalledWith({
        type: 'init',
        timestamp: expect.any(Number),
      });
      expect(mockWebSocket.send).toHaveBeenCalledWith(expect.any(String));
    });

    it('should decode received messages', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      const testMessage = { type: 'sync', timestamp: Date.now() };
      mockWebSocket.emit('message', { data: JSON.stringify(testMessage) });

      expect(mockProtocol.decode).toHaveBeenCalledWith(JSON.stringify(testMessage));
    });

    it('should handle agent coordination workflow', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      const agentIds = ['agent-1', 'agent-2', 'agent-3'];
      const task = { type: 'analyze', data: 'test' };

      await coordinator.coordinateAgents(agentIds, task);

      expect(mockWebSocket.send).toHaveBeenCalledTimes(3);
      agentIds.forEach((agentId) => {
        expect(mockProtocol.encode).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'task',
            agentId,
            payload: task,
          })
        );
      });
    });
  });

  describe('Performance Characteristics (Classical TDD)', () => {
    it('should maintain low latency for message round trips', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      // Test actual round-trip time
      const rtt = await coordinator.measureRoundTripTime();

      // Should be very fast for local mock
      expect(rtt).toBeLessThan(50); // 50ms max for local
    });

    it('should track message metrics accurately', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      // Send multiple messages
      for (let i = 0; i < 10; i++) {
        await coordinator.broadcastMessage({ type: 'sync' });
      }

      // Wait for echo responses
      await new Promise((resolve) => setTimeout(resolve, 100));

      const metrics = coordinator.getMetrics();
      expect(metrics.messagesSent).toBe(10);
      expect(metrics.messagesReceived).toBe(10); // Due to echo
      expect(metrics.averageLatency).toBeLessThan(20); // Should be fast
    });

    it('should handle high-throughput message bursts', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      const messageCount = 1000;
      const startTime = performance.now();

      // Send burst of messages
      const promises = [];
      for (let i = 0; i < messageCount; i++) {
        promises.push(
          coordinator.broadcastMessage({
            type: 'task',
            agentId: `agent-${i % 10}`,
            payload: { index: i },
          })
        );
      }

      await Promise.all(promises);
      const duration = performance.now() - startTime;

      // Should handle 1000 messages quickly
      expect(duration).toBeLessThan(1000); // < 1 second

      const throughput = messageCount / (duration / 1000);
      expect(throughput).toBeGreaterThan(1000); // > 1000 msg/sec
    });
  });

  describe('Agent Management (Hybrid)', () => {
    it('should track active agents based on heartbeats', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      // Mock behavior - agents sending heartbeats
      const agents = ['agent-1', 'agent-2', 'agent-3'];

      for (const agentId of agents) {
        mockWebSocket.emit('message', {
          data: JSON.stringify({
            type: 'heartbeat',
            agentId,
            timestamp: Date.now(),
          }),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Test actual state
      const activeAgents = coordinator.getActiveAgents();
      expect(activeAgents).toHaveLength(3);
      expect(activeAgents).toEqual(expect.arrayContaining(agents));
    });

    it('should handle connection failures gracefully', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      // Track errors
      let errorCount = 0;
      coordinator.onMessage('error', () => errorCount++);

      // Simulate connection drop
      mockWebSocket.readyState = MockWebSocket.CLOSED;

      // Try to send message
      await expect(coordinator.broadcastMessage({ type: 'test' })).rejects.toThrow(
        'WebSocket is not open'
      );

      // Verify protocol wasn't called for failed send
      expect(mockProtocol.encode).toHaveBeenCalledTimes(0);
    });
  });

  describe('Real-time Coordination (Hybrid)', () => {
    it('should synchronize multiple agents within time window', async () => {
      await new Promise((resolve) => mockWebSocket.once('open', resolve));

      const syncWindow = 100; // 100ms sync window
      const agentCount = 5;
      const syncTimes: number[] = [];

      // Set up sync handler
      coordinator.onMessage('sync', (msg) => {
        syncTimes.push(Date.now());
      });

      // Broadcast sync request
      const startTime = Date.now();
      await coordinator.broadcastMessage({ type: 'sync' });

      // Simulate agents responding
      for (let i = 0; i < agentCount; i++) {
        setTimeout(() => {
          mockWebSocket.emit('message', {
            data: JSON.stringify({
              type: 'sync',
              agentId: `agent-${i}`,
              timestamp: Date.now(),
            }),
          });
        }, Math.random() * 50); // Random delay up to 50ms
      }

      // Wait for all responses
      await new Promise((resolve) => setTimeout(resolve, syncWindow));

      // Verify all agents synced within window
      expect(syncTimes).toHaveLength(agentCount);

      const maxTime = Math.max(...syncTimes);
      const minTime = Math.min(...syncTimes);
      expect(maxTime - minTime).toBeLessThan(syncWindow);
    });
  });
});

/**
 * Hybrid Testing Benefits:
 *
 * 1. Mock the protocol/transport layer (London)
 * 2. Test real performance metrics (Classical)
 * 3. Verify both interactions AND results
 * 4. Suitable for real-time systems
 * 5. Balance between isolation and integration
 *
 * Use this approach for:
 * - WebSocket communication
 * - Real-time coordination
 * - Network protocols
 * - Streaming systems
 * - Performance-critical integrations
 */
