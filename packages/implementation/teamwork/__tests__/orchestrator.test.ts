/**
 * Conversation Orchestrator Tests - Classical TDD.
 *
 * Tests for conversation orchestration using classical approach
 * Focus on behavior verification with actual implementation.
 */

import type { AgentId } from '../src/types';
import { ConversationOrchestratorImpl } from '../src/main';
import type {
  ConversationConfig,
  ConversationMessage,
  ConversationSession,
} from '../src/types';

describe('ConversationOrchestratorImpl - Classical TDD', () => {'
  let orchestrator: ConversationOrchestratorImpl;

  const sampleAgents: AgentId[] = [
    { id: 'agent-1', swarmId: 'swarm-1', type: 'coder', instance: 0 },
    { id: 'agent-2', swarmId: 'swarm-1', type: 'reviewer', instance: 0 },
  ];

  beforeEach(async () => {
    orchestrator = new ConversationOrchestratorImpl();
  });

  describe('🎯 Create Conversation', () => {'
    it('should create conversation and store in memory', async () => {'
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

      // Act
      const session = await orchestrator.createConversation(config);

      // Assert
      expect(session).toMatchObject({
        title: config.title,
        participants: config.initialParticipants,
        status: 'active',
      });
      expect(session.id).toBeDefined();
      expect(session.startTime).toBeDefined();
      expect(session.participants).toHaveLength(2);
    });

    it('should create conversation with proper initial state', async () => {'
      // Arrange
      const config: ConversationConfig = {
        title: 'Problem Solving Session',
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

      // Act
      const session = await orchestrator.createConversation(config);

      // Assert
      expect(session.status).toBe('active');'
      expect(session.messages).toHaveLength(0);
      expect(session.outcomes).toHaveLength(0);
      expect(session.metrics.messageCount).toBe(0);
      expect(session.metrics.participationByAgent).toEqual({
        'agent-1': 0,
        'agent-2': 0,
      });
    });
  });

  describe('🤝 Join Conversation', () => {'
    it('should add agent to conversation', async () => {'
      // Arrange
      const config: ConversationConfig = {
        title: 'Test',
        pattern: 'problem-solving',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      const session = await orchestrator.createConversation(config);
      const newAgent: AgentId = {
        id: 'agent-3',
        swarmId: 'swarm-1',
        type: 'tester',
        instance: 0,
      };

      // Act
      await orchestrator.joinConversation(session.id, newAgent);

      // Assert
      const updatedSession = orchestrator.getSession(session.id);
      expect(updatedSession?.participants).toHaveLength(3);
      expect(updatedSession?.participants).toContain(newAgent);
      expect(updatedSession?.metrics.participationByAgent).toHaveProperty(
        'agent-3',
        0
      );
    });

    it('should reject joining non-existent conversation', async () => {'
      // Arrange
      const newAgent: AgentId = {
        id: 'agent-3',
        swarmId: 'swarm-1',
        type: 'tester',
        instance: 0,
      };

      // Act & Assert
      await expect(
        orchestrator.joinConversation('non-existent', newAgent)'
      ).rejects.toThrow('Conversation non-existent not found');'
    });
  });

  describe('💬 Send Message', () => {'
    it('should validate sender and store message', async () => {'
      // Arrange
      const config: ConversationConfig = {
        title: 'Test',
        pattern: 'problem-solving',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      const session = await orchestrator.createConversation(config);
      const message: ConversationMessage = {
        id: '',
        conversationId: session.id,
        fromAgent: sampleAgents[0]!,
        toAgent: undefined,
        timestamp: new Date(),
        content: {
          text: 'Hello, world!',
          code: undefined,
          data: undefined,
          attachments: undefined,
        },
        messageType: 'question',
        metadata: {
          priority: 'medium',
          requiresResponse: true,
          context: session.context,
          tags: ['greeting'],
          referencedMessages: undefined,
        },
      };

      // Act
      await orchestrator.sendMessage(message);

      // Assert
      const updatedSession = orchestrator.getSession(session.id);
      expect(updatedSession?.messages).toHaveLength(1);
      expect(updatedSession?.metrics.messageCount).toBe(1);
      expect(updatedSession?.metrics.participationByAgent['agent-1']).toBe(1);'
    });

    it('should reject messages from non-participants', async () => {'
      // Arrange
      const config: ConversationConfig = {
        title: 'Test',
        pattern: 'problem-solving',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      const session = await orchestrator.createConversation(config);
      const nonParticipant: AgentId = {
        id: 'outsider',
        swarmId: 'swarm-2',
        type: 'researcher',
        instance: 0,
      };

      const message: ConversationMessage = {
        id: '',
        conversationId: session.id,
        fromAgent: nonParticipant,
        toAgent: undefined,
        timestamp: new Date(),
        content: {
          text: 'Trying to join uninvited',
          code: undefined,
          data: undefined,
          attachments: undefined,
        },
        messageType: 'system_notification',
        metadata: {
          priority: 'high',
          requiresResponse: false,
          context: session.context,
          tags: [],
          referencedMessages: undefined,
        },
      };

      // Act & Assert
      await expect(orchestrator.sendMessage(message)).rejects.toThrow(
        'Agent outsider is not a participant''
      );
    });
  });

  describe('🔚 Terminate Conversation', () => {'
    it('should finalize conversation and generate outcomes', async () => {'
      // Arrange
      const config: ConversationConfig = {
        title: 'Code Review Complete',
        pattern: 'code-review',
        context: {
          goal: 'Review code',
          domain: 'backend',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      const session = await orchestrator.createConversation(config);

      // Send a decision message to generate outcomes
      const message: ConversationMessage = {
        id: 'msg-1',
        conversationId: session.id,
        fromAgent: sampleAgents[0]!,
        toAgent: undefined,
        timestamp: new Date(),
        content: {
          text: 'Code looks good',
          code: undefined,
          data: undefined,
          attachments: undefined,
        },
        messageType: 'decision',
        metadata: {
          priority: 'medium',
          requiresResponse: false,
          context: session.context,
          tags: [],
          referencedMessages: undefined,
        },
      };

      await orchestrator.sendMessage(message);

      // Act
      const outcomes = await orchestrator.terminateConversation(
        session.id,
        'Review complete''
      );

      // Assert
      expect(outcomes).toHaveLength(1);
      expect(outcomes[0]).toMatchObject({
        type: 'decision',
        content: { text: 'Code looks good' },
      });

      // Verify session is no longer active
      const finalSession = orchestrator.getSession(session.id);
      expect(finalSession).toBeUndefined();
    });
  });

  describe('🔍 Get Conversation History', () => {'
    it('should retrieve messages from active session', async () => {'
      // Arrange
      const config: ConversationConfig = {
        title: 'Test',
        pattern: 'problem-solving',
        context: {
          goal: 'Test',
          domain: 'test',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      const session = await orchestrator.createConversation(config);
      const message: ConversationMessage = {
        id: 'msg-1',
        conversationId: session.id,
        fromAgent: sampleAgents[0]!,
        toAgent: undefined,
        timestamp: new Date(),
        content: {
          text: 'First message',
          code: undefined,
          data: undefined,
          attachments: undefined,
        },
        messageType: 'question',
        metadata: {
          priority: 'medium',
          requiresResponse: true,
          context: session.context,
          tags: [],
          referencedMessages: undefined,
        },
      };

      await orchestrator.sendMessage(message);

      // Act
      const history = await orchestrator.getConversationHistory(session.id);

      // Assert
      expect(history).toHaveLength(1);
      expect(history[0]?.content.text).toBe('First message');'
    });
  });

  describe('📊 Session Management', () => {'
    it('should track active sessions correctly', async () => {'
      // Arrange
      const config: ConversationConfig = {
        title: 'Session Test',
        pattern: 'problem-solving',
        context: {
          goal: 'Test session management',
          domain: 'testing',
          constraints: [],
          resources: [],
          expertise: [],
        },
        initialParticipants: sampleAgents,
      };

      // Act - Create multiple sessions
      const session1 = await orchestrator.createConversation({
        ...config,
        title: 'Session 1',
      });
      const session2 = await orchestrator.createConversation({
        ...config,
        title: 'Session 2',
      });

      // Assert
      const activeSessions = orchestrator.getActiveSessions();
      expect(activeSessions).toHaveLength(2);
      expect(activeSessions.map((s) => s.title)).toContain('Session 1');'
      expect(activeSessions.map((s) => s.title)).toContain('Session 2');'

      // Terminate one session
      await orchestrator.terminateConversation(session1.id, 'Test complete');'

      const remainingSessions = orchestrator.getActiveSessions();
      expect(remainingSessions).toHaveLength(1);
      expect(remainingSessions[0]?.title).toBe('Session 2');'
    });
  });
});
