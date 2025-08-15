/**
 * Conversation Orchestrator Tests - London TDD.
 *
 * Tests for conversation orchestration using London School TDD (mockist approach)
 * Focus on interactions between orchestrator and its dependencies.
 */

import type { AgentId } from '../../../types/agent-types';
import { ConversationOrchestratorImpl } from '../orchestrator';
import type {
  ConversationConfig,
  ConversationMemory,
  ConversationMessage,
  ConversationSession,
} from '../types';

describe('ConversationOrchestratorImpl - London TDD', () => {
  let orchestrator: ConversationOrchestratorImpl;
  let mockMemory: vi.Mocked<ConversationMemory>;

  const sampleAgents: AgentId[] = [
    { id: 'agent-1', swarmId: 'swarm-1', type: 'coder', instance: 0 },
    { id: 'agent-2', swarmId: 'swarm-1', type: 'reviewer', instance: 0 },
  ];

  beforeEach(() => {
    // Mock the memory dependency
    mockMemory = {
      storeConversation: vi.fn(),
      getConversation: vi.fn(),
      searchConversations: vi.fn(),
      updateConversation: vi.fn(),
      deleteConversation: vi.fn(),
      getAgentConversationHistory: vi.fn(),
    };

    orchestrator = new ConversationOrchestratorImpl(mockMemory);
  });

  describe('🎯 Create Conversation', () => {
    it('should create conversation and store in memory', async () => {
      // Arrange
      const config: ConversationConfig = {
        title: 'Test Code Review',
        pattern: 'code-review',
        context: {
          goal: 'Review pull request #123',
          domain: 'backend',
          constraints: [],
          resources: [],
          expertise: ['typescript', 'api-design'],
        },
        initialParticipants: sampleAgents,
      };

      mockMemory.storeConversation.mockResolvedValue();
      mockMemory.updateConversation.mockResolvedValue();

      // Act
      const session = await orchestrator.createConversation(config);

      // Assert
      expect(session).toMatchObject({
        title: config?.title,
        participants: config?.initialParticipants,
        status: 'active',
      });
      expect(mockMemory.storeConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          title: config?.title,
          status: 'initializing',
        })
      );
      expect(mockMemory.updateConversation).toHaveBeenCalledWith(
        session.id,
        expect.objectContaining({ status: 'active' })
      );
    });

    it('should reject unknown conversation patterns', async () => {
      // Arrange
      const config: ConversationConfig = {
        title: 'Test',
        pattern: 'unknown-pattern',
        context: {
          goal: 'Test goal',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      // Act & Assert
      await expect(orchestrator.createConversation(config)).rejects.toThrow(
        'Unknown conversation pattern: unknown-pattern'
      );
      expect(mockMemory.storeConversation).not.toHaveBeenCalled();
    });
  });

  describe('🤝 Join Conversation', () => {
    it('should add agent to conversation and update memory', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const newAgent: AgentId = {
        id: 'agent-3',
        swarmId: 'swarm-1',
        type: 'tester',
        instance: 0,
      };

      const existingSession: ConversationSession = {
        id: conversationId,
        title: 'Test',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date(),
        status: 'active',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages: [],
        outcomes: [],
        metrics: {
          messageCount: 0,
          participationByAgent: { 'agent-1': 0, 'agent-2': 0 },
          averageResponseTime: 0,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      // Mock active session
      (orchestrator as any).activeSessions.set(conversationId, existingSession);
      mockMemory.updateConversation.mockResolvedValue();

      // Act
      await orchestrator.joinConversation(conversationId, newAgent);

      // Assert
      expect(existingSession.participants).toContain(newAgent);
      expect(existingSession.metrics.participationByAgent).toHaveProperty(
        'agent-3',
        0
      );
      expect(mockMemory.updateConversation).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          participants: expect.arrayContaining([newAgent]),
        })
      );
    });

    it('should reject joining non-existent conversation', async () => {
      // Arrange
      const conversationId = 'non-existent';
      const newAgent: AgentId = {
        id: 'agent-3',
        swarmId: 'swarm-1',
        type: 'tester',
        instance: 0,
      };

      // Act & Assert
      await expect(
        orchestrator.joinConversation(conversationId, newAgent)
      ).rejects.toThrow('Conversation non-existent not found');
      expect(mockMemory.updateConversation).not.toHaveBeenCalled();
    });
  });

  describe('💬 Send Message', () => {
    it('should validate sender and store message', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const existingSession: ConversationSession = {
        id: conversationId,
        title: 'Test',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date(),
        status: 'active',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages: [],
        outcomes: [],
        metrics: {
          messageCount: 0,
          participationByAgent: { 'agent-1': 0, 'agent-2': 0 },
          averageResponseTime: 0,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      (orchestrator as any).activeSessions.set(conversationId, existingSession);
      mockMemory.updateConversation.mockResolvedValue();

      const message: ConversationMessage = {
        id: '',
        conversationId,
        fromAgent: sampleAgents[0]!,
        timestamp: new Date(),
        content: { text: 'Hello, world!' },
        messageType: 'question',
        metadata: {
          priority: 'medium',
          requiresResponse: true,
          context: existingSession.context,
          tags: ['greeting'],
        },
      };

      // Act
      await orchestrator.sendMessage(message);

      // Assert
      expect(existingSession.messages).toHaveLength(1);
      expect(existingSession.metrics.messageCount).toBe(1);
      expect(existingSession.metrics.participationByAgent['agent-1']).toBe(1);
      expect(mockMemory.updateConversation).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ content: { text: 'Hello, world!' } }),
          ]),
          metrics: expect.objectContaining({ messageCount: 1 }),
        })
      );
    });

    it('should reject messages from non-participants', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const nonParticipant: AgentId = {
        id: 'outsider',
        swarmId: 'swarm-2',
        type: 'hacker' as any,
        instance: 0,
      };

      const existingSession: ConversationSession = {
        id: conversationId,
        title: 'Test',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date(),
        status: 'active',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages: [],
        outcomes: [],
        metrics: {
          messageCount: 0,
          participationByAgent: { 'agent-1': 0, 'agent-2': 0 },
          averageResponseTime: 0,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      (orchestrator as any).activeSessions.set(conversationId, existingSession);

      const message: ConversationMessage = {
        id: '',
        conversationId,
        fromAgent: nonParticipant,
        timestamp: new Date(),
        content: { text: 'Trying to join uninvited' },
        messageType: 'system_notification',
        metadata: {
          priority: 'high',
          requiresResponse: false,
          context: existingSession.context,
          tags: [],
        },
      };

      // Act & Assert
      await expect(orchestrator.sendMessage(message)).rejects.toThrow(
        'Agent outsider is not a participant in this conversation'
      );
      expect(mockMemory.updateConversation).not.toHaveBeenCalled();
    });
  });

  describe('🔚 Terminate Conversation', () => {
    it('should finalize conversation and generate outcomes', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const existingSession: ConversationSession = {
        id: conversationId,
        title: 'Code Review Complete',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date(Date.now() - 60000), // 1 minute ago
        status: 'active',
        context: {
          goal: 'Review code',
          domain: 'backend',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages: [
          {
            id: 'msg-1',
            conversationId,
            fromAgent: sampleAgents[0]!,
            timestamp: new Date(),
            content: { text: 'Code looks good' },
            messageType: 'decision',
            metadata: {
              priority: 'medium',
              requiresResponse: false,
              context: {} as any,
              tags: [],
            },
          },
        ],
        outcomes: [],
        metrics: {
          messageCount: 1,
          participationByAgent: { 'agent-1': 1, 'agent-2': 0 },
          averageResponseTime: 0,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      (orchestrator as any).activeSessions.set(conversationId, existingSession);
      mockMemory.updateConversation.mockResolvedValue();

      // Act
      const outcomes = await orchestrator.terminateConversation(
        conversationId,
        'Review complete'
      );

      // Assert
      expect(outcomes).toHaveLength(1);
      expect(outcomes[0]).toMatchObject({
        type: 'decision',
        content: { text: 'Code looks good' },
      });
      expect(existingSession.status).toBe('completed');
      expect(existingSession.endTime).toBeDefined();
      expect(mockMemory.updateConversation).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          status: 'completed',
          endTime: expect.any(Date),
          outcomes: expect.arrayContaining([
            expect.objectContaining({ type: 'decision' }),
          ]),
        })
      );
    });
  });

  describe('🔍 Get Conversation History', () => {
    it('should retrieve messages from active session', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const messages: ConversationMessage[] = [
        {
          id: 'msg-1',
          conversationId,
          fromAgent: sampleAgents[0]!,
          timestamp: new Date(),
          content: { text: 'First message' },
          messageType: 'question',
          metadata: {
            priority: 'medium',
            requiresResponse: true,
            context: {} as any,
            tags: [],
          },
        },
      ];

      const existingSession: ConversationSession = {
        id: conversationId,
        title: 'Test',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date(),
        status: 'active',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages,
        outcomes: [],
        metrics: {
          messageCount: 1,
          participationByAgent: { 'agent-1': 1, 'agent-2': 0 },
          averageResponseTime: 0,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      (orchestrator as any).activeSessions.set(conversationId, existingSession);

      // Act
      const history = await orchestrator.getConversationHistory(conversationId);

      // Assert
      expect(history).toEqual(messages);
      expect(mockMemory.getConversation).not.toHaveBeenCalled(); // Should use active session
    });

    it('should fallback to memory for non-active conversations', async () => {
      // Arrange
      const conversationId = 'conv-archived';
      const messages: ConversationMessage[] = [
        {
          id: 'msg-1',
          conversationId,
          fromAgent: sampleAgents[0]!,
          timestamp: new Date(),
          content: { text: 'Archived message' },
          messageType: 'summary',
          metadata: {
            priority: 'low',
            requiresResponse: false,
            context: {} as any,
            tags: [],
          },
        },
      ];

      const archivedSession: ConversationSession = {
        id: conversationId,
        title: 'Archived Conversation',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date(),
        endTime: new Date(),
        status: 'completed',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages,
        outcomes: [],
        metrics: {
          messageCount: 1,
          participationByAgent: { 'agent-1': 1, 'agent-2': 0 },
          averageResponseTime: 0,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      mockMemory.getConversation.mockResolvedValue(archivedSession);

      // Act
      const history = await orchestrator.getConversationHistory(conversationId);

      // Assert
      expect(history).toEqual(messages);
      expect(mockMemory.getConversation).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('🚨 London School Patterns - Interaction Testing', () => {
    it('should demonstrate orchestrator interactions with memory', async () => {
      // Arrange
      const config: ConversationConfig = {
        title: 'Integration Test',
        pattern: 'problem-solving',
        context: {
          goal: 'Solve the integration puzzle',
          domain: 'integration',
          constraints: ['time-limit'],
          resources: ['documentation'],
          expertise: ['testing'],
        },
        initialParticipants: sampleAgents,
      };

      mockMemory.storeConversation.mockResolvedValue();
      mockMemory.updateConversation.mockResolvedValue();

      // Act
      const session = await orchestrator.createConversation(config);

      // Assert - Verify the interaction chain
      expect(mockMemory.storeConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          title: config?.title,
          status: 'initializing',
        })
      );
      expect(mockMemory.updateConversation).toHaveBeenCalledWith(
        session.id,
        expect.objectContaining({ status: 'active' })
      );

      // Verify orchestrator state
      expect((orchestrator as any).activeSessions.has(session.id)).toBe(true);
    });
  });
});
