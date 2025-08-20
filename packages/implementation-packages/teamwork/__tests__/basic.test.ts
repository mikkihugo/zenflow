/**
 * Basic Integration Tests
 * Tests that the teamwork system works with hybrid brain integration
 */

import { ConversationOrchestratorImpl } from '../src/main';
import type { AgentId, ConversationConfig } from '../src/types';

describe('Teamwork Basic Integration - Hybrid Brain', () => {
  let orchestrator: ConversationOrchestratorImpl;

  const sampleAgents: AgentId[] = [
    { id: 'agent-1', swarmId: 'test-swarm', type: 'coder', instance: 0 },
    { id: 'agent-2', swarmId: 'test-swarm', type: 'analyst', instance: 0 },
  ];

  beforeEach(async () => {
    orchestrator = new ConversationOrchestratorImpl();
  });

  describe('🎯 Core Functionality', () => {
    it('should create orchestrator with brain coordination', () => {
      expect(orchestrator).toBeDefined();
      expect(typeof orchestrator.createConversation).toBe('function');
      expect(typeof orchestrator.joinConversation).toBe('function');
      expect(typeof orchestrator.sendMessage).toBe('function');
      expect(typeof orchestrator.terminateConversation).toBe('function');
    });

    it('should create a conversation successfully', async () => {
      const config: ConversationConfig = {
        title: 'Test Conversation',
        pattern: 'problem-solving',
        context: {
          goal: 'Test hybrid brain integration',
          domain: 'testing',
          constraints: [],
          resources: [],
          expertise: ['testing'],
        },
        initialParticipants: sampleAgents,
      };

      const session = await orchestrator.createConversation(config);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.title).toBe('Test Conversation');
      expect(session.participants).toHaveLength(2);
      expect(session.status).toBe('active');
      expect(session.participants[0]?.id).toBe('agent-1');
      expect(session.participants[1]?.id).toBe('agent-2');
    });

    it('should handle brain coordination initialization without errors', () => {
      // Test that the brain coordinator is initialized properly
      // This verifies our hybrid brain system doesn't break the orchestrator
      const sessions = orchestrator.getActiveSessions();
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions).toHaveLength(0); // No sessions initially
    });
  });

  describe('🧠 Hybrid Brain Integration', () => {
    it('should maintain hybrid brain functionality during conversation lifecycle', async () => {
      const config: ConversationConfig = {
        title: 'Brain Test Conversation',
        pattern: 'code-review',
        context: {
          goal: 'Test neural coordination',
          domain: 'neural-testing',
          constraints: [],
          resources: [],
          expertise: ['neural-networks'],
        },
        initialParticipants: sampleAgents,
      };

      // Create conversation with brain coordination
      const session = await orchestrator.createConversation(config);
      expect(session.status).toBe('active');

      // Join additional agent
      const newAgent: AgentId = {
        id: 'brain-agent',
        swarmId: 'test-swarm',
        type: 'researcher',
        instance: 0,
      };

      await orchestrator.joinConversation(session.id, newAgent);
      const updatedSession = orchestrator.getSession(session.id);
      expect(updatedSession?.participants).toHaveLength(3);

      // Terminate conversation
      const outcomes = await orchestrator.terminateConversation(session.id, 'Test completed');
      expect(Array.isArray(outcomes)).toBe(true);

      // Verify session is no longer active
      const finalSession = orchestrator.getSession(session.id);
      expect(finalSession).toBeUndefined();
    });
  });
});