import type { AgentId } from '../src/types';
import { TeamworkStorage } from '../src/storage';
import type { ConversationSession } from '../src/types';

describe('TeamworkStorage - Classical TDD', () => {
  let storage: TeamworkStorage;
  let mockBackend: unknown;

  const sampleAgents: AgentId[] = [
    { id: 'agent-1', swarmId: 'test-swarm', type: 'coder', instance: 0 },
    { id: 'agent-2', swarmId: 'test-swarm', type: 'reviewer', instance: 0 },
  ];

  beforeEach(() => {
    // Use actual TeamworkStorage implementation
    storage = new TeamworkStorage();
  });

  describe('💾 Store and Retrieve Conversation', () => {
    it('should store conversation and retrieve it exactly', async () => {
      // Arrange
      const conversation: ConversationSession = {
        id: 'conv-123',
        title: 'Test Conversation',
        description: 'A test conversation for Classical TDD',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        status: 'completed',
        context: {
          goal: 'Test storage and retrieval',
          domain: 'testing',
          constraints: ['time-limit'],
          resources: ['test-data'],
          expertise: ['storage-testing'],
        },
        messages: [
          {
            id: 'msg-1',
            conversationId: 'conv-123',
            fromAgent: sampleAgents[0]!,
            timestamp: new Date('2024-01-01T10:30:00Z'),
            content: { text: 'Test message' },
            messageType: 'question',
            metadata: {
              priority: 'high',
              requiresResponse: true,
              context: {
                goal: 'Test storage',
                domain: 'testing',
                constraints: [],
                resources: [],
                expertise: [],
              },
              tags: ['test', 'storage'],
            },
          },
        ],
        outcomes: [
          {
            type: 'solution',
            content: { result: 'Storage working correctly' },
            confidence: 0.95,
            contributors: [sampleAgents[0]!],
            timestamp: new Date('2024-01-01T10:45:00Z'),
          },
        ],
        metrics: {
          messageCount: 1,
          participationByAgent: { 'agent-1': 1, 'agent-2': 0 },
          averageResponseTime: 15000, // 15 seconds
          resolutionTime: 3600000, // 1 hour
          consensusScore: 0.8,
          qualityRating: 0.9,
        },
      };

      // Act
      await storage.storeSession(conversation);
      const retrieved = await storage.getSession('conv-123');

      // Assert - Verify exact data integrity
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(conversation.id);
      expect(retrieved?.title).toBe(conversation.title);
      expect(retrieved?.description).toBe(conversation.description);
      expect(retrieved?.status).toBe(conversation.status);

      // Verify participants are preserved
      expect(retrieved?.participants).toHaveLength(2);
      expect(retrieved?.participants[0]).toEqual(sampleAgents[0]);
      expect(retrieved?.participants[1]).toEqual(sampleAgents[1]);

      // Verify context is preserved
      expect(retrieved?.context.goal).toBe(conversation.context.goal);
      expect(retrieved?.context.domain).toBe(conversation.context.domain);
      expect(retrieved?.context.constraints).toEqual(
        conversation.context.constraints
      );

      // Verify messages are preserved with exact content
      expect(retrieved?.messages).toHaveLength(1);
      expect(retrieved!.messages[0]!.content.text).toBe('Test message');
      expect(retrieved!.messages[0]!.metadata.tags).toEqual([
        'test',
        'storage',
      ]);

      // Verify outcomes are preserved
      expect(retrieved?.outcomes).toHaveLength(1);
      expect(retrieved!.outcomes[0]!.type).toBe('solution');
      expect(retrieved!.outcomes[0]!.confidence).toBe(0.95);

      // Verify metrics are preserved with exact values
      expect(retrieved?.metrics.messageCount).toBe(1);
      expect(retrieved?.metrics.averageResponseTime).toBe(15000);
      expect(retrieved?.metrics.consensusScore).toBe(0.8);
      expect(retrieved?.metrics.qualityRating).toBe(0.9);

      // Verify dates are properly restored
      expect(retrieved?.startTime).toEqual(conversation.startTime);
      expect(retrieved?.endTime).toEqual(conversation.endTime);
    });

    it('should return null for non-existent conversation', async () => {
      // Act
      const result = await storage.getSession('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('🔍 Search Conversations by Agent', () => {
    it('should find conversations by agent ID with correct indexing', async () => {
      // Arrange - Create multiple conversations with different participants
      const conversations: ConversationSession[] = [
        {
          id: 'conv-1',
          title: 'Agent 1 Conversation',
          participants: [sampleAgents[0]!], // Only agent-1
          initiator: sampleAgents[0]!,
          startTime: new Date('2024-01-01T09:00:00Z'),
          status: 'completed',
          context: {
            goal: 'Test 1',
            domain: 'testing',
            constraints: [],
            resources: [],
            expertise: [],
          },
          messages: [],
          outcomes: [],
          metrics: {
            messageCount: 0,
            participationByAgent: { 'agent-1': 1 },
            averageResponseTime: 0,
            consensusScore: 0,
            qualityRating: 0,
          },
        },
        {
          id: 'conv-2',
          title: 'Both Agents Conversation',
          participants: [...sampleAgents], // Both agents
          initiator: sampleAgents[0]!,
          startTime: new Date('2024-01-01T10:00:00Z'),
          status: 'active',
          context: {
            goal: 'Test 2',
            domain: 'testing',
            constraints: [],
            resources: [],
            expertise: [],
          },
          messages: [],
          outcomes: [],
          metrics: {
            messageCount: 0,
            participationByAgent: { 'agent-1': 1, 'agent-2': 1 },
            averageResponseTime: 0,
            consensusScore: 0,
            qualityRating: 0,
          },
        },
        {
          id: 'conv-3',
          title: 'Agent 2 Only',
          participants: [sampleAgents[1]!], // Only agent-2
          initiator: sampleAgents[1]!,
          startTime: new Date('2024-01-01T11:00:00Z'),
          status: 'paused',
          context: {
            goal: 'Test 3',
            domain: 'testing',
            constraints: [],
            resources: [],
            expertise: [],
          },
          messages: [],
          outcomes: [],
          metrics: {
            messageCount: 0,
            participationByAgent: { 'agent-2': 1 },
            averageResponseTime: 0,
            consensusScore: 0,
            qualityRating: 0,
          },
        },
      ];

      // Store all conversations
      for (const conv of conversations) {
        await storage.storeSession(conv);
      }

      // Act - Search for agent-1's conversations
      const agent1Conversations = await storage.searchConversations({
        agentId: 'agent-1',
      });

      // Assert - Should find conversations where agent-1 participated
      expect(agent1Conversations).toHaveLength(2);
      const foundIds = agent1Conversations.map((c) => c.id).sort();
      expect(foundIds).toEqual(['conv-1', 'conv-2']);

      // Verify the conversations are correctly retrieved
      const conv1 = agent1Conversations.find((c) => c.id === 'conv-1');
      const conv2 = agent1Conversations.find((c) => c.id === 'conv-2');

      expect(conv1?.title).toBe('Agent 1 Conversation');
      expect(conv2?.title).toBe('Both Agents Conversation');
    });

    it('should handle pagination in agent conversation search', async () => {
      // Arrange - Create many conversations for one agent
      const manyConversations: ConversationSession[] = [];
      for (let i = 1; i <= 10; i++) {
        manyConversations.push({
          id: `conv-${i}`,
          title: `Conversation ${i}`,
          participants: [sampleAgents[0]!],
          initiator: sampleAgents[0]!,
          startTime: new Date(`2024-01-0${Math.min(i, 9)}T${10 + i}:00:00Z`),
          status: 'completed',
          context: {
            goal: `Goal ${i}`,
            domain: 'testing',
            constraints: [],
            resources: [],
            expertise: [],
          },
          messages: [],
          outcomes: [],
          metrics: {
            messageCount: 0,
            participationByAgent: { 'agent-1': 1 },
            averageResponseTime: 0,
            consensusScore: 0,
            qualityRating: 0,
          },
        });
      }

      // Store all conversations
      for (const conv of manyConversations) {
        await storage.storeSession(conv);
      }

      // Act - Test pagination
      const firstPage = await storage.searchConversations({
        agentId: 'agent-1',
        limit: 3,
        offset: 0,
      });
      const secondPage = await storage.searchConversations({
        agentId: 'agent-1',
        limit: 3,
        offset: 3,
      });

      // Assert
      expect(firstPage).toHaveLength(3);
      expect(secondPage).toHaveLength(3);

      // Verify no overlap between pages
      const firstPageIds = firstPage.map((c) => c.id);
      const secondPageIds = secondPage.map((c) => c.id);
      const intersection = firstPageIds.filter((id) =>
        secondPageIds.includes(id)
      );
      expect(intersection).toHaveLength(0);
    });
  });

  describe('🗂️ Search Conversations by Pattern and Domain', () => {
    it('should correctly filter by conversation pattern', async () => {
      // Arrange
      const conversations: ConversationSession[] = [
        {
          id: 'conv-review-1',
          title: 'Code Review Session',
          participants: [...sampleAgents],
          initiator: sampleAgents[0]!,
          startTime: new Date(),
          status: 'completed',
          context: {
            goal: 'Review code',
            domain: 'code-review',
            constraints: [],
            resources: [],
            expertise: [],
          },
          messages: [],
          outcomes: [],
          metrics: {
            messageCount: 0,
            participationByAgent: {},
            averageResponseTime: 0,
            consensusScore: 0,
            qualityRating: 0,
          },
        },
        {
          id: 'conv-planning-1',
          title: 'Sprint Planning',
          participants: [...sampleAgents],
          initiator: sampleAgents[0]!,
          startTime: new Date(),
          status: 'active',
          context: {
            goal: 'Plan sprint',
            domain: 'planning',
            constraints: [],
            resources: [],
            expertise: [],
          },
          messages: [],
          outcomes: [],
          metrics: {
            messageCount: 0,
            participationByAgent: {},
            averageResponseTime: 0,
            consensusScore: 0,
            qualityRating: 0,
          },
        },
      ];

      // Store conversations
      for (const conv of conversations) {
        await storage.storeSession(conv);
      }

      // Act
      const reviewConversations = await storage.searchConversations({
        pattern: 'code-review',
      });

      // Assert
      expect(reviewConversations).toHaveLength(1);
      expect(reviewConversations[0]!.id).toBe('conv-review-1');
      expect(reviewConversations[0]!.context.domain).toBe('code-review');
    });
  });

  describe('✏️ Update Conversation', () => {
    it('should update existing conversation while preserving other data', async () => {
      // Arrange
      const originalConversation: ConversationSession = {
        id: 'conv-update-test',
        title: 'Original Title',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date('2024-01-01T10:00:00Z'),
        status: 'active',
        context: {
          goal: 'Original goal',
          domain: 'testing',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages: [
          {
            id: 'msg-1',
            conversationId: 'conv-update-test',
            fromAgent: sampleAgents[0]!,
            timestamp: new Date(),
            content: { text: 'Original message' },
            messageType: 'question',
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

      await storage.storeSession(originalConversation);

      // Act - Update status and add a message
      const updates: Partial<ConversationSession> = {
        status: 'completed' as ConversationStatus,
        endTime: new Date('2024-01-01T11:00:00Z'),
        messages: [
          ...originalConversation.messages,
          {
            id: 'msg-2',
            conversationId: 'conv-update-test',
            fromAgent: sampleAgents[1]!,
            timestamp: new Date(),
            content: { text: 'New message after update' },
            messageType: 'answer' as any,
            metadata: {
              priority: 'high' as any,
              requiresResponse: false,
              context: {} as any,
              tags: ['update'],
            },
          },
        ],
        metrics: {
          ...originalConversation.metrics,
          messageCount: 2,
          participationByAgent: { 'agent-1': 1, 'agent-2': 1 },
        },
      };

      await storage.updateSession('conv-update-test', updates);

      // Assert
      const updatedConversation =
        await storage.getSession('conv-update-test');

      expect(updatedConversation).not.toBeNull();
      expect(updatedConversation?.status).toBe('completed');
      expect(updatedConversation?.endTime).toEqual(
        new Date('2024-01-01T11:00:00Z')
      );
      expect(updatedConversation?.messages).toHaveLength(2);
      expect(updatedConversation?.metrics.messageCount).toBe(2);
      expect(updatedConversation?.metrics.participationByAgent['agent-2']).toBe(
        1
      );

      // Verify original data is preserved
      expect(updatedConversation?.title).toBe('Original Title');
      expect(updatedConversation?.context.goal).toBe('Original goal');
      expect(updatedConversation!.messages[0]!.content.text).toBe(
        'Original message'
      );
      expect(updatedConversation!.messages[1]!.content.text).toBe(
        'New message after update'
      );
    });

    it('should throw error when updating non-existent conversation', async () => {
      // Act & Assert
      await expect(
        storage.updateSession('non-existent', { status: 'completed' })
      ).rejects.toThrow('Conversation non-existent not found');
    });
  });

  describe('🗑️ Delete Conversation', () => {
    it('should completely remove conversation and its indexes', async () => {
      // Arrange
      const conversation: ConversationSession = {
        id: 'conv-delete-test',
        title: 'To Be Deleted',
        participants: [...sampleAgents],
        initiator: sampleAgents[0]!,
        startTime: new Date(),
        status: 'completed',
        context: {
          goal: 'Delete test',
          domain: 'deletion-testing',
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

      await storage.storeSession(conversation);

      // Verify it exists
      const beforeDelete = await storage.getSession('conv-delete-test');
      expect(beforeDelete).not.toBeNull();

      // Act
      await storage.deleteSession('conv-delete-test');

      // Assert
      const afterDelete = await storage.getSession('conv-delete-test');
      expect(afterDelete).toBeNull();

      // Verify it's removed from agent indexes
      const agent1Conversations = await storage.searchConversations({
        agentId: 'agent-1',
      });
      const deletedConvExists = agent1Conversations.some(
        (c) => c.id === 'conv-delete-test'
      );
      expect(deletedConvExists).toBe(false);
    });

    it('should handle deletion of non-existent conversation gracefully', async () => {
      // Act & Assert - Should not throw
      await expect(
        storage.deleteSession('non-existent')
      ).resolves.toBeUndefined();
    });
  });

  describe('🔢 Classical TDD Patterns - State Verification', () => {
    it('should maintain data consistency across multiple operations', async () => {
      // Arrange
      const conversation: ConversationSession = {
        id: 'conv-consistency-test',
        title: 'Consistency Test',
        participants: [sampleAgents[0]!],
        initiator: sampleAgents[0]!,
        startTime: new Date('2024-01-01T10:00:00Z'),
        status: 'active',
        context: {
          goal: 'Test consistency',
          domain: 'testing',
          constraints: [],
          resources: [],
          expertise: [],
        },
        messages: [],
        outcomes: [],
        metrics: {
          messageCount: 0,
          participationByAgent: { 'agent-1': 0 },
          averageResponseTime: 0,
          consensusScore: 0,
          qualityRating: 0,
        },
      };

      // Act - Perform multiple operations
      await storage.storeSession(conversation);

      const retrieved1 = await storage.getSession('conv-consistency-test');

      await storage.updateSession('conv-consistency-test', {
        status: 'paused',
        metrics: { ...conversation.metrics, messageCount: 5 },
      });

      const retrieved2 = await storage.getSession('conv-consistency-test');

      const searchResults = await storage.searchConversations({
        agentId: 'agent-1',
      });

      // Assert - Verify consistency throughout all operations
      expect(retrieved1?.status).toBe('active');
      expect(retrieved1?.metrics.messageCount).toBe(0);

      expect(retrieved2?.status).toBe('paused');
      expect(retrieved2?.metrics.messageCount).toBe(5);
      expect(retrieved2?.title).toBe(conversation.title); // Unchanged

      expect(searchResults?.some((c) => c.id === 'conv-consistency-test')).toBe(
        true
      );
      const foundConv = searchResults?.find(
        (c) => c.id === 'conv-consistency-test'
      );
      expect(foundConv?.status).toBe('paused');
      expect(foundConv?.metrics.messageCount).toBe(5);
    });
  });
});
