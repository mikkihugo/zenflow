/**
 * Agent Communication Protocols Test Suite
 * London TDD approach - testing interactions and message patterns
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { AgentCommunicationProtocol } from '../../../../coordination/protocols/communication/communication-protocols';
import { CoordinationTestHelpers } from '../../../helpers/coordination-test-helpers';

describe('Agent Communication Protocols (London TDD)', () => {
  let communicationProtocol: AgentCommunicationProtocol;
  let mockMessageBroker: jest.Mocked<MessageBroker>;
  let mockAgents: jest.Mocked<Agent>[];
  let testHelpers: CoordinationTestHelpers;

  beforeEach(() => {
    mockMessageBroker = {
      broadcast: vi.fn(),
      sendDirectMessage: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      createChannel: vi.fn(),
      destroyChannel: vi.fn(),
      getChannelHealth: vi.fn(),
      routeMessage: vi.fn(),
    } as jest.Mocked<MessageBroker>;

    mockAgents = Array.from(
      { length: 6 },
      (_, i) =>
        ({
          id: `agent-${i}`,
          type: i < 2 ? 'coordinator' : 'worker',
          status: 'active',
          capabilities: i < 2 ? ['coordination', 'supervision'] : ['execution', 'analysis'],
          sendMessage: vi.fn(),
          receiveMessage: vi.fn(),
          subscribeToChannel: vi.fn(),
          unsubscribeFromChannel: vi.fn(),
          getMessageQueue: vi.fn(),
          processMessage: vi.fn(),
        }) as jest.Mocked<Agent>
    );

    testHelpers = new CoordinationTestHelpers();

    communicationProtocol = new AgentCommunicationProtocol(mockMessageBroker, {
      enableEncryption: true,
      compressionThreshold: 1024,
      messageTimeout: 30000,
      retryAttempts: 3,
    });
  });

  describe('Direct Message Routing', () => {
    it('should route point-to-point messages correctly', async () => {
      const sender = mockAgents[0];
      const receiver = mockAgents[1];
      const message = {
        id: 'msg-001',
        type: 'task_assignment',
        content: { task: 'analyze_data', priority: 'high' },
        timestamp: Date.now(),
      };

      mockMessageBroker.sendDirectMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-001',
      });
      mockMessageBroker.routeMessage.mockResolvedValue({ delivered: true, latency: 45 });

      await communicationProtocol.sendDirectMessage(sender.id, receiver.id, message);

      // Verify message broker routing
      expect(mockMessageBroker.sendDirectMessage).toHaveBeenCalledWith(
        sender.id,
        receiver.id,
        expect.objectContaining({
          ...message,
          encrypted: true,
          compressed: false, // Below compression threshold
        })
      );

      // Verify routing optimization
      expect(mockMessageBroker.routeMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: sender.id,
          to: receiver.id,
          optimizeRoute: true,
        })
      );
    });

    it('should handle message delivery failures with retry logic', async () => {
      const sender = mockAgents[0];
      const receiver = mockAgents[2];
      const message = { id: 'msg-002', type: 'status_update', content: { status: 'completed' } };

      // Mock failure then success
      mockMessageBroker.sendDirectMessage
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Receiver busy'))
        .mockResolvedValueOnce({ success: true, messageId: 'msg-002' });

      const result = await communicationProtocol.sendDirectMessage(sender.id, receiver.id, message);

      // Verify retry attempts
      expect(mockMessageBroker.sendDirectMessage).toHaveBeenCalledTimes(3);
      expect(result?.success).toBe(true);
      expect(result?.retryCount).toBe(2);
    });

    it('should compress large messages automatically', async () => {
      const sender = mockAgents[0];
      const receiver = mockAgents[1];
      const largeMessage = {
        id: 'msg-003',
        type: 'data_transfer',
        content: { data: 'x'.repeat(2048) }, // Above compression threshold
        attachments: ['large-file-1.json', 'large-file-2.json'],
      };

      mockMessageBroker.sendDirectMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-003',
      });

      await communicationProtocol.sendDirectMessage(sender.id, receiver.id, largeMessage);

      expect(mockMessageBroker.sendDirectMessage).toHaveBeenCalledWith(
        sender.id,
        receiver.id,
        expect.objectContaining({
          id: 'msg-003',
          compressed: true,
          originalSize: expect.any(Number),
          compressedSize: expect.any(Number),
        })
      );
    });
  });

  describe('Broadcast Communication Patterns', () => {
    it('should broadcast messages to all agents in topology', async () => {
      const broadcaster = mockAgents[0];
      const broadcastMessage = {
        id: 'broadcast-001',
        type: 'system_announcement',
        content: { announcement: 'System maintenance scheduled', urgency: 'medium' },
        scope: 'all_agents',
      };

      mockMessageBroker.broadcast.mockResolvedValue({
        success: true,
        deliveredTo: mockAgents.slice(1).map((a) => a.id),
        failedDeliveries: [],
      });

      const result = await communicationProtocol.broadcastMessage(broadcaster.id, broadcastMessage);

      expect(mockMessageBroker.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          ...broadcastMessage,
          sender: broadcaster.id,
          broadcastType: 'topology_wide',
        })
      );

      expect(result?.success).toBe(true);
      expect(result?.deliveredTo.length).toBe(mockAgents.length - 1);
    });

    it('should support selective broadcast with agent filtering', async () => {
      const broadcaster = mockAgents[0];
      const selectiveMessage = {
        id: 'selective-001',
        type: 'coordinator_meeting',
        content: { meeting: 'coordination_sync', time: Date.now() + 3600000 },
        targetFilter: { type: 'coordinator' },
      };

      const coordinatorAgents = mockAgents.filter((a) => a.type === 'coordinator');

      mockMessageBroker.broadcast.mockResolvedValue({
        success: true,
        deliveredTo: coordinatorAgents.map((a) => a.id),
        filteredOut: mockAgents.filter((a) => a.type !== 'coordinator').map((a) => a.id),
      });

      await communicationProtocol.broadcastMessage(broadcaster.id, selectiveMessage);

      expect(mockMessageBroker.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          targetFilter: { type: 'coordinator' },
          broadcastType: 'filtered',
        })
      );
    });

    it('should handle broadcast reliability with delivery confirmation', async () => {
      const broadcaster = mockAgents[0];
      const reliableMessage = {
        id: 'reliable-001',
        type: 'critical_update',
        content: { update: 'security_patch', requiresConfirmation: true },
        reliability: 'high',
      };

      // Mock some failures
      mockMessageBroker.broadcast.mockResolvedValue({
        success: true,
        deliveredTo: mockAgents.slice(1, 4).map((a) => a.id),
        failedDeliveries: mockAgents.slice(4).map((a) => a.id),
      });

      // Mock confirmation from agents
      mockAgents.slice(1, 4).forEach((agent) => {
        agent.receiveMessage.mockResolvedValue({
          confirmed: true,
          confirmationId: `conf-${agent.id}-${reliableMessage.id}`,
        });
      });

      const result = await communicationProtocol.broadcastMessage(broadcaster.id, reliableMessage);

      // Verify retry for failed deliveries
      expect(mockMessageBroker.broadcast).toHaveBeenCalledTimes(1);
      expect(result?.requiresRetry).toBe(true);
      expect(result?.failedDeliveries.length).toBe(2);
    });
  });

  describe('Channel-Based Communication', () => {
    it('should create and manage dedicated communication channels', async () => {
      const channelName = 'task-coordination';
      const participants = mockAgents.slice(0, 4).map((a) => a.id);

      mockMessageBroker.createChannel.mockResolvedValue({
        channelId: 'ch-001',
        name: channelName,
        participants,
        created: true,
      });

      const channel = await communicationProtocol.createChannel({
        name: channelName,
        participants,
        type: 'persistent',
        encryption: true,
      });

      expect(mockMessageBroker.createChannel).toHaveBeenCalledWith(
        expect.objectContaining({
          name: channelName,
          participants,
          settings: expect.objectContaining({
            type: 'persistent',
            encryption: true,
            maxMessages: expect.any(Number),
          }),
        })
      );

      expect(channel.channelId).toBe('ch-001');
      expect(channel.participants).toEqual(participants);
    });

    it('should handle channel subscription and message distribution', async () => {
      const channelId = 'ch-001';
      const subscriber = mockAgents[2];
      const channelMessage = {
        id: 'ch-msg-001',
        type: 'channel_message',
        content: { discussion: 'task_progress', updates: ['step1_complete', 'step2_in_progress'] },
      };

      mockMessageBroker.subscribe.mockResolvedValue({ subscribed: true, channelId });

      await communicationProtocol.subscribeToChannel(subscriber.id, channelId);

      expect(mockMessageBroker.subscribe).toHaveBeenCalledWith(
        subscriber.id,
        channelId,
        expect.objectContaining({
          messageHandler: expect.any(Function),
          errorHandler: expect.any(Function),
        })
      );

      // Verify agent subscription
      expect(subscriber.subscribeToChannel).toHaveBeenCalledWith(channelId, expect.any(Function));
    });

    it('should support channel message threading and replies', async () => {
      const channelId = 'ch-002';
      const originalMessage = {
        id: 'thread-root',
        type: 'discussion',
        content: { topic: 'optimization_strategies' },
        threadId: 'thread-001',
      };

      const replyMessage = {
        id: 'thread-reply-001',
        type: 'reply',
        content: { response: 'Agreed on strategy A', references: ['strategy_doc_v2'] },
        threadId: 'thread-001',
        replyTo: 'thread-root',
      };

      mockMessageBroker.sendDirectMessage.mockResolvedValue({ success: true });

      await communicationProtocol.sendChannelMessage(channelId, originalMessage);
      await communicationProtocol.sendChannelMessage(channelId, replyMessage);

      // Verify threading structure
      expect(mockMessageBroker.sendDirectMessage).toHaveBeenCalledWith(
        channelId,
        'channel_participants',
        expect.objectContaining({
          threadId: 'thread-001',
          messageType: 'threaded',
        })
      );
    });
  });

  describe('Message Prioritization and QoS', () => {
    it('should prioritize critical messages over regular communication', async () => {
      const sender = mockAgents[0];
      const receiver = mockAgents[1];

      const criticalMessage = {
        id: 'critical-001',
        type: 'emergency_shutdown',
        content: { reason: 'security_breach', immediate: true },
        priority: 'critical',
        qos: { guaranteedDelivery: true, maxLatency: 1000 },
      };

      const regularMessage = {
        id: 'regular-001',
        type: 'status_update',
        content: { status: 'running' },
        priority: 'normal',
      };

      mockMessageBroker.sendDirectMessage.mockImplementation((from, to, msg) => {
        return Promise.resolve({
          success: true,
          messageId: msg.id,
          priority: msg.priority,
          queuePosition: msg.priority === 'critical' ? 0 : 10,
        });
      });

      // Send regular message first, then critical
      await communicationProtocol.sendDirectMessage(sender.id, receiver.id, regularMessage);
      await communicationProtocol.sendDirectMessage(sender.id, receiver.id, criticalMessage);

      const criticalCall = mockMessageBroker.sendDirectMessage.mock.calls.find(
        (call) => call[2]?.priority === 'critical'
      );

      expect(criticalCall[2]).toMatchObject({
        priority: 'critical',
        qos: expect.objectContaining({
          guaranteedDelivery: true,
          maxLatency: 1000,
        }),
      });
    });

    it('should implement message queuing with priority ordering', async () => {
      const agent = mockAgents[0];
      const messages = [
        { id: 'msg-1', priority: 'low', content: { task: 'cleanup' } },
        { id: 'msg-2', priority: 'high', content: { task: 'urgent_analysis' } },
        { id: 'msg-3', priority: 'normal', content: { task: 'regular_processing' } },
        { id: 'msg-4', priority: 'critical', content: { task: 'emergency_response' } },
      ];

      agent.getMessageQueue.mockReturnValue({
        pending: [],
        processing: [],
        enqueue: vi.fn(),
        dequeue: vi.fn(),
        prioritySort: vi.fn(),
      });

      for (const message of messages) {
        await communicationProtocol.enqueueMessage(agent.id, message);
      }

      // Verify queue operations
      expect(agent.getMessageQueue().enqueue).toHaveBeenCalledTimes(4);
      expect(agent.getMessageQueue().prioritySort).toHaveBeenCalled();

      // Verify priority ordering
      const enqueueCalls = (agent.getMessageQueue().enqueue as jest.Mock).mock.calls;
      enqueueCalls.forEach(([message], index) => {
        expect(message).toMatchObject({
          priorityScore: expect.any(Number),
          queueTimestamp: expect.any(Number),
        });
      });
    });

    it('should enforce rate limiting for agent communication', async () => {
      const sender = mockAgents[0];
      const receiver = mockAgents[1];

      const rateLimitConfig = {
        messagesPerSecond: 10,
        burstLimit: 15,
        timeWindow: 1000,
      };

      communicationProtocol.setRateLimit(sender.id, rateLimitConfig);

      // Send messages rapidly
      const rapidMessages = Array.from({ length: 20 }, (_, i) => ({
        id: `rapid-${i}`,
        type: 'test_message',
        content: { index: i },
      }));

      const sendPromises = rapidMessages.map((msg) =>
        communicationProtocol.sendDirectMessage(sender.id, receiver.id, msg)
      );

      const results = await Promise.allSettled(sendPromises);

      const successful = results?.filter((r) => r.status === 'fulfilled' && r.value.success).length;
      const rateLimited = results?.filter(
        (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
      ).length;

      // Some messages should be rate limited
      expect(successful).toBeLessThanOrEqual(rateLimitConfig?.burstLimit);
      expect(rateLimited).toBeGreaterThan(0);
    });
  });

  describe('Message Security and Encryption', () => {
    it('should encrypt sensitive messages automatically', async () => {
      const sender = mockAgents[0];
      const receiver = mockAgents[1];

      const sensitiveMessage = {
        id: 'secure-001',
        type: 'credential_transfer',
        content: {
          credentials: { apiKey: 'secret-key-123', token: 'bearer-token-456' },
          classification: 'confidential',
        },
        requireEncryption: true,
      };

      mockMessageBroker.sendDirectMessage.mockResolvedValue({ success: true, encrypted: true });

      await communicationProtocol.sendDirectMessage(sender.id, receiver.id, sensitiveMessage);

      expect(mockMessageBroker.sendDirectMessage).toHaveBeenCalledWith(
        sender.id,
        receiver.id,
        expect.objectContaining({
          encrypted: true,
          encryptionAlgorithm: expect.any(String),
          encryptedContent: expect.any(String),
          contentHash: expect.any(String),
        })
      );
    });

    it('should verify message integrity with digital signatures', async () => {
      const sender = mockAgents[0];
      const receiver = mockAgents[1];

      const signedMessage = {
        id: 'signed-001',
        type: 'command_execution',
        content: { command: 'shutdown_system', authorization: 'admin' },
        requireSignature: true,
      };

      mockMessageBroker.sendDirectMessage.mockImplementation((from, to, msg) => {
        // Simulate signature verification
        const hasValidSignature = msg.signature && msg.signatureTimestamp;
        return Promise.resolve({
          success: hasValidSignature,
          signatureVerified: hasValidSignature,
        });
      });

      const result = await communicationProtocol.sendDirectMessage(
        sender.id,
        receiver.id,
        signedMessage
      );

      expect(result?.success).toBe(true);
      expect(result?.signatureVerified).toBe(true);

      expect(mockMessageBroker.sendDirectMessage).toHaveBeenCalledWith(
        sender.id,
        receiver.id,
        expect.objectContaining({
          signature: expect.any(String),
          signatureTimestamp: expect.any(Number),
          signatureAlgorithm: expect.any(String),
        })
      );
    });
  });

  describe('Communication Analytics and Monitoring', () => {
    it('should track message delivery metrics', async () => {
      const sender = mockAgents[0];
      const receivers = mockAgents.slice(1, 4);

      // Send multiple messages
      for (let i = 0; i < 10; i++) {
        const receiver = receivers[i % receivers.length];
        const message = {
          id: `metric-${i}`,
          type: 'test_communication',
          content: { test: true, iteration: i },
        };

        mockMessageBroker.sendDirectMessage.mockResolvedValue({
          success: true,
          latency: 25 + i * 5, // Simulate varying latency
          messageId: message.id,
        });

        await communicationProtocol.sendDirectMessage(sender.id, receiver.id, message);
      }

      const metrics = await communicationProtocol.getCommunicationMetrics(sender.id);

      expect(metrics).toMatchObject({
        totalMessagesSent: 10,
        averageLatency: expect.any(Number),
        successRate: 1.0,
        messagesPerSecond: expect.any(Number),
        topRecipients: expect.any(Array),
      });

      expect(metrics.averageLatency).toBeGreaterThan(0);
      expect(metrics.messagesPerSecond).toBeGreaterThan(0);
    });

    it('should detect communication anomalies and patterns', async () => {
      const agents = mockAgents.slice(0, 4);

      // Simulate communication pattern
      const communicationMatrix = [];

      for (let i = 0; i < agents.length; i++) {
        for (let j = 0; j < agents.length; j++) {
          if (i !== j) {
            const frequency = Math.random() * 10; // Random communication frequency
            communicationMatrix.push({
              from: agents[i]?.id,
              to: agents[j]?.id,
              frequency,
              avgLatency: 20 + Math.random() * 60,
            });
          }
        }
      }

      mockMessageBroker.getChannelHealth.mockResolvedValue({
        overallHealth: 0.85,
        communicationMatrix,
        anomalies: [
          { type: 'high_latency', agents: ['agent-2', 'agent-3'], severity: 'medium' },
          { type: 'message_loss', agents: ['agent-1'], severity: 'low' },
        ],
      });

      const healthReport = await communicationProtocol.generateHealthReport();

      expect(healthReport).toMatchObject({
        overallHealth: expect.any(Number),
        communicationPatterns: expect.any(Object),
        detectedAnomalies: expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            severity: expect.stringMatching(/low|medium|high|critical/),
          }),
        ]),
        recommendations: expect.any(Array),
      });

      expect(healthReport.overallHealth).toBeGreaterThan(0);
      expect(healthReport.overallHealth).toBeLessThanOrEqual(1);
    });
  });
});
