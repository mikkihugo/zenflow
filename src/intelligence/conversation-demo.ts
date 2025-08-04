/**
 * Simple Conversation Framework Demo
 *
 * Demonstrates ag2.ai-inspired conversation capabilities with minimal dependencies
 */

import type { AgentId } from '../types/agent-types';
import type {
  ConversationConfig,
  ConversationMessage,
  ConversationSession,
} from './conversation-framework/types';

/**
 * Mock memory backend for demo purposes
 */
class MockConversationMemory {
  private conversations = new Map<string, any>();

  async storeConversation(session: ConversationSession): Promise<void> {
    this.conversations.set(session.id, JSON.parse(JSON.stringify(session)));
  }

  async getConversation(id: string): Promise<ConversationSession | null> {
    const session = this.conversations.get(id);
    return session ? JSON.parse(JSON.stringify(session)) : null;
  }

  async updateConversation(id: string, updates: Partial<ConversationSession>): Promise<void> {
    const existing = this.conversations.get(id);
    if (existing) {
      this.conversations.set(id, { ...existing, ...updates });
    }
  }

  async searchConversations(): Promise<ConversationSession[]> {
    return Array.from(this.conversations.values());
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
  }

  async getAgentConversationHistory(): Promise<ConversationSession[]> {
    return Array.from(this.conversations.values());
  }
}

/**
 * Simplified conversation orchestrator for demo
 */
class DemoConversationOrchestrator {
  private memory = new MockConversationMemory();
  private activeSessions = new Map<string, ConversationSession>();

  async createConversation(config: ConversationConfig): Promise<ConversationSession> {
    const session: ConversationSession = {
      id: `demo-${Date.now()}`,
      title: config.title,
      description: config.description,
      participants: [...config.initialParticipants],
      initiator: config.initialParticipants[0],
      startTime: new Date(),
      status: 'active',
      context: config.context,
      messages: [],
      outcomes: [],
      metrics: {
        messageCount: 0,
        participationByAgent: {},
        averageResponseTime: 0,
        consensusScore: 0,
        qualityRating: 0,
      },
    };

    config.initialParticipants.forEach((agent) => {
      session.metrics.participationByAgent[agent.id] = 0;
    });

    this.activeSessions.set(session.id, session);
    await this.memory.storeConversation(session);

    return session;
  }

  async sendMessage(message: ConversationMessage): Promise<void> {
    const session = this.activeSessions.get(message.conversationId);
    if (!session) {
      throw new Error(`Conversation ${message.conversationId} not found`);
    }

    if (!message.id) {
      message.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!message.timestamp) {
      message.timestamp = new Date();
    }

    session.messages.push(message);
    session.metrics.messageCount++;
    session.metrics.participationByAgent[message.fromAgent.id]++;

    await this.memory.updateConversation(session.id, {
      messages: session.messages,
      metrics: session.metrics,
    });
  }

  async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
    const session = this.activeSessions.get(conversationId);
    return session ? session.messages : [];
  }

  async terminateConversation(conversationId: string, _reason?: string): Promise<any[]> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    session.status = 'completed';
    session.endTime = new Date();

    // Generate simple outcomes
    const outcomes = session.messages
      .filter((m) => m.messageType === 'decision' || m.messageType === 'agreement')
      .map((m) => ({
        type: m.messageType === 'decision' ? 'decision' : 'consensus',
        content: m.content,
        confidence: 0.8,
        contributors: [m.fromAgent],
        timestamp: m.timestamp,
      }));

    session.outcomes = outcomes;
    await this.memory.updateConversation(conversationId, {
      status: session.status,
      endTime: session.endTime,
      outcomes: session.outcomes,
    });

    this.activeSessions.delete(conversationId);
    return outcomes;
  }
}

/**
 * Demo script showing conversation framework capabilities
 */
export async function runSimpleConversationDemo(): Promise<void> {
  try {
    const orchestrator = new DemoConversationOrchestrator();

    // Sample agents for demonstration
    const agents: AgentId[] = [
      { id: 'alice-coder', swarmId: 'demo-swarm', type: 'coder', instance: 0 },
      { id: 'bob-reviewer', swarmId: 'demo-swarm', type: 'reviewer', instance: 0 },
      { id: 'charlie-architect', swarmId: 'demo-swarm', type: 'architect', instance: 0 },
    ];
    const conversation = await orchestrator.createConversation({
      title: 'Review Pull Request #142',
      description: 'Code review for new authentication system',
      pattern: 'code-review',
      context: {
        goal: 'Review and approve authentication improvements',
        domain: 'backend',
        constraints: ['security-focused', 'backwards-compatible'],
        resources: ['PR #142', 'Security guidelines'],
        expertise: ['authentication', 'nodejs', 'security'],
      },
      initialParticipants: agents,
      timeout: 3600000, // 1 hour
    });

    const messages = [
      {
        fromAgent: agents[0], // alice-coder
        content: {
          text: "I've implemented JWT tokens with refresh mechanism. The changes are in auth.ts and middleware.ts.",
        },
        messageType: 'task_request' as const,
        metadata: {
          priority: 'high' as const,
          requiresResponse: true,
          context: conversation.context,
          tags: ['code-review', 'authentication'],
        },
      },
      {
        fromAgent: agents[1], // bob-reviewer
        content: {
          text: 'Code looks clean. I have concerns about token expiration handling. Can you add more error handling?',
          code: 'if (!token.isValid()) { throw new AuthError("Token expired"); }',
        },
        messageType: 'critique' as const,
        metadata: {
          priority: 'medium' as const,
          requiresResponse: true,
          context: conversation.context,
          tags: ['security', 'error-handling'],
        },
      },
      {
        fromAgent: agents[2], // charlie-architect
        content: {
          text: 'From architecture perspective, consider adding rate limiting for token refresh endpoint.',
        },
        messageType: 'suggestion' as const,
        metadata: {
          priority: 'medium' as const,
          requiresResponse: false,
          context: conversation.context,
          tags: ['architecture', 'security', 'rate-limiting'],
        },
      },
      {
        fromAgent: agents[0], // alice-coder
        content: {
          text: "Good points! I'll add the error handling and rate limiting. Thanks for the review!",
        },
        messageType: 'agreement' as const,
        metadata: {
          priority: 'medium' as const,
          requiresResponse: false,
          context: conversation.context,
          tags: ['agreement', 'follow-up'],
        },
      },
    ];

    for (const [index, msgData] of messages.entries()) {
      await orchestrator.sendMessage({
        id: `demo-msg-${index + 1}`,
        conversationId: conversation.id,
        timestamp: new Date(),
        ...msgData,
      });
    }
    const history = await orchestrator.getConversationHistory(conversation.id);

    // Show message details
    history.forEach((_msg, _index) => {});
    Object.entries(conversation.metrics.participationByAgent).forEach(([_agentId, _count]) => {});
    const outcomes = await orchestrator.terminateConversation(
      conversation.id,
      'Code review completed successfully',
    );
    outcomes.forEach((_outcome, _index) => {});
    const patterns = [
      'code-review',
      'problem-solving',
      'brainstorming',
      'planning',
      'debugging',
      'architecture-review',
    ];
    patterns.forEach((_pattern) => {});
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Export for use in other modules
export { DemoConversationOrchestrator };

// If run directly, execute demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleConversationDemo().catch(console.error);
}
