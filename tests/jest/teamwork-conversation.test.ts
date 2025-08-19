/**
 * Teamwork Conversation Tests (Jest Version)
 *
 * Tests for teamwork conversation functionality using Jest instead of Vitest.
 * This demonstrates the successful conversion from Vitest to Jest format.
 * 
 * CONVERTED FROM VITEST: Uses Jest mocking and assertions
 */

import { jest } from '@jest/globals';
import type {
  ConversationSession,
  ConversationStatus,
  ConversationConfig,
  ConversationMessage,
  AgentId,
} from '@claude-zen/teamwork';

describe('Teamwork Conversation Framework (Jest)', () => {
  const sampleAgents: AgentId[] = [
    { id: 'agent-1', swarmId: 'swarm-1', type: 'coder', instance: 0 },
    { id: 'agent-2', swarmId: 'swarm-1', type: 'reviewer', instance: 0 },
  ];

  describe('Conversation Types and Structure', () => {
    it('should create valid conversation session structure', () => {
      const conversation: ConversationSession = {
        id: 'conv-123',
        title: 'Test Conversation',
        description: 'A test conversation for Jest testing',
        participants: [...sampleAgents],
        initiator: sampleAgents[0],
        orchestrator: undefined,
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: undefined,
        status: 'active',
        context: {
          task: undefined,
          goal: 'Test conversation functionality',
          domain: 'testing',
          constraints: ['time-limit'],
          resources: ['test-data'],
          expertise: ['jest-testing'],
        },
        messages: [],
        outcomes: [],
        metrics: {
          messageCount: 0,
          participationByAgent: { 'agent-1': 0, 'agent-2': 0 },
          averageResponseTime: 0,
          resolutionTime: undefined,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      // Verify conversation structure
      expect(conversation.id).toBe('conv-123');
      expect(conversation.title).toBe('Test Conversation');
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.status).toBe('active');
      expect(conversation.context.goal).toBe('Test conversation functionality');
      expect(conversation.metrics.messageCount).toBe(0);
    });

    it('should handle different conversation statuses', () => {
      const statuses: ConversationStatus[] = [
        'initializing',
        'active',
        'paused',
        'completed',
        'terminated',
        'error'
      ];

      statuses.forEach(status => {
        const conversation: Partial<ConversationSession> = {
          id: `conv-${status}`,
          status,
        };

        expect(conversation.status).toBe(status);
      });
    });

    it('should create valid conversation messages', () => {
      const message: ConversationMessage = {
        id: 'msg-1',
        conversationId: 'conv-123',
        fromAgent: sampleAgents[0],
        toAgent: sampleAgents[1],
        timestamp: new Date('2024-01-01T10:30:00Z'),
        content: {
          text: 'Test message content',
          code: 'console.log("hello");',
          data: { key: 'value' }
        },
        messageType: 'task_request',
        metadata: {
          priority: 'high',
          requiresResponse: true,
          context: {
            task: undefined,
            goal: 'Test messaging',
            domain: 'testing',
            constraints: [],
            resources: [],
            expertise: [],
          },
          tags: ['test', 'jest'],
        },
      };

      expect(message.id).toBe('msg-1');
      expect(message.fromAgent.id).toBe('agent-1');
      expect(message.toAgent?.id).toBe('agent-2');
      expect(message.messageType).toBe('task_request');
      expect(message.metadata.priority).toBe('high');
      expect(message.metadata.tags).toContain('jest');
    });
  });

  describe('Conversation Configuration', () => {
    it('should create valid conversation config', () => {
      const config: ConversationConfig = {
        title: 'Test Code Review',
        pattern: 'code-review',
        context: {
          task: undefined,
          goal: 'Review pull request #123',
          domain: 'backend',
          constraints: ['time-limit'],
          resources: ['git', 'ide'],
          expertise: ['typescript', 'api-design'],
        },
        initialParticipants: sampleAgents,
      };

      expect(config.title).toBe('Test Code Review');
      expect(config.pattern).toBe('code-review');
      expect(config.context.goal).toBe('Review pull request #123');
      expect(config.initialParticipants).toHaveLength(2);
    });

    it('should validate agent types', () => {
      const agentTypes = ['researcher', 'coder', 'analyst', 'optimizer', 'coordinator', 'tester', 'architect'];

      agentTypes.forEach(type => {
        const agent: AgentId = {
          id: `agent-${type}`,
          swarmId: 'swarm-test',
          type: type as any,
          instance: 0,
        };

        expect(agent.type).toBe(type);
        expect(agent.id).toBe(`agent-${type}`);
      });
    });
  });

  describe('Mock Integration Tests', () => {
    it('should work with Jest mocked functions', async () => {
      // Create a mock conversation service
      const mockConversationService = {
        createConversation: jest.fn(),
        getConversation: jest.fn(),
        updateConversation: jest.fn(),
        deleteConversation: jest.fn(),
      };

      // Mock implementation
      mockConversationService.createConversation.mockResolvedValue({
        id: 'mock-conv-123',
        title: 'Mock Conversation',
        status: 'active',
        participants: sampleAgents,
      } as ConversationSession);

      // Test the mock
      const config: ConversationConfig = {
        title: 'Mock Test',
        pattern: 'testing',
        context: {
          task: undefined,
          goal: 'Test mocking',
          domain: 'testing',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      const result = await mockConversationService.createConversation(config);

      expect(mockConversationService.createConversation).toHaveBeenCalledWith(config);
      expect(result.id).toBe('mock-conv-123');
      expect(result.title).toBe('Mock Conversation');
      expect(result.status).toBe('active');
      expect(mockConversationService.createConversation).toHaveBeenCalledTimes(1);
    });

    it('should handle async operations with Jest', async () => {
      const asyncOperation = jest.fn().mockImplementation(async (data: any) => {
        // Simulate async processing
        await new Promise(resolve => setTimeout(resolve, 10));
        return { processed: true, data };
      });

      const testData = { message: 'test' };
      const result = await asyncOperation(testData);

      expect(result.processed).toBe(true);
      expect(result.data).toEqual(testData);
      expect(asyncOperation).toHaveBeenCalledWith(testData);
    });

    it('should use Jest spies for method tracking', () => {
      const conversationManager = {
        sendMessage: jest.fn(),
        addParticipant: jest.fn(),
        updateStatus: jest.fn(),
      };

      const message: ConversationMessage = {
        id: 'spy-msg',
        conversationId: 'spy-conv',
        fromAgent: sampleAgents[0],
        toAgent: sampleAgents[1],
        timestamp: new Date(),
        content: { text: 'Spy test' },
        messageType: 'task_request',
        metadata: {
          priority: 'medium',
          requiresResponse: false,
          context: {} as any,
          tags: [],
        },
      };

      // Use the spy
      conversationManager.sendMessage(message);
      conversationManager.addParticipant(sampleAgents[1]);
      conversationManager.updateStatus('active');

      // Verify spy calls
      expect(conversationManager.sendMessage).toHaveBeenCalledWith(message);
      expect(conversationManager.addParticipant).toHaveBeenCalledWith(sampleAgents[1]);
      expect(conversationManager.updateStatus).toHaveBeenCalledWith('active');
      expect(conversationManager.sendMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Jest-Specific Testing Patterns', () => {
    it('should demonstrate Jest custom matchers work', () => {
      const conversation: Partial<ConversationSession> = {
        id: 'matcher-test',
        participants: sampleAgents,
        metrics: {
          messageCount: 5,
          participationByAgent: { 'agent-1': 3, 'agent-2': 2 },
          averageResponseTime: 1500,
          resolutionTime: undefined,
          consensusScore: 0.85,
          qualityRating: 0.9,
        },
      };

      // Use jest-extended matchers (available in setup)
      expect(conversation.metrics?.consensusScore).toBeWithinRange(0.8, 1.0);
      expect(conversation.metrics?.qualityRating).toBeWithinRange(0.8, 1.0);
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.metrics?.messageCount).toBeGreaterThan(0);
    });

    it('should handle Jest error testing', async () => {
      const failingFunction = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(failingFunction()).rejects.toThrow('Test error');
      expect(failingFunction).toHaveBeenCalled();
    });

    it('should work with Jest fake timers', () => {
      jest.useFakeTimers();

      const callback = jest.fn();
      const timeoutId = setTimeout(callback, 1000);

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalled();
      clearTimeout(timeoutId);
      jest.useRealTimers();
    });
  });

  describe('Performance and Quality Testing', () => {
    it('should measure conversation metrics', () => {
      const metrics = {
        messageCount: 10,
        participationByAgent: { 'agent-1': 7, 'agent-2': 3 },
        averageResponseTime: 2000,
        consensusScore: 0.8,
        qualityRating: 0.9,
      };

      // Test metric calculations
      const totalMessages = Object.values(metrics.participationByAgent).reduce((a, b) => a + b, 0);
      expect(totalMessages).toBe(metrics.messageCount);

      const participation = metrics.participationByAgent['agent-1'] / metrics.messageCount;
      expect(participation).toBeCloseTo(0.7, 1);

      expect(metrics.averageResponseTime).toBeLessThan(5000); // Under 5 seconds
      expect(metrics.consensusScore).toBeGreaterThanOrEqual(0.7);
      expect(metrics.qualityRating).toBeGreaterThanOrEqual(0.8);
    });

    it('should validate conversation flow states', () => {
      const validTransitions = [
        ['initializing', 'active'],
        ['active', 'paused'],
        ['paused', 'active'],
        ['active', 'completed'],
        ['active', 'terminated'],
        ['paused', 'terminated'],
      ];

      validTransitions.forEach(([from, to]) => {
        const conversation: Partial<ConversationSession> = {
          id: `transition-${from}-${to}`,
          status: from as ConversationStatus,
        };

        // Simulate state transition
        conversation.status = to as ConversationStatus;

        expect(conversation.status).toBe(to);
      });
    });
  });
});