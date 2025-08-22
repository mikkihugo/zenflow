/**
 * @fileoverview Conversation Orchestrator Implementation
 *
 * Implements the ConversationOrchestrator interface for managing
 * multi-agent conversations and coordination workflows.
 */

import { getLogger } from '@claude-zen/foundation';

import type {
  ConversationOrchestrator,
  ConversationConfig,
  ConversationSession,
  ConversationMessage,
  ConversationOutcome,
  ConversationMemory,
  AgentId,
  ModerationAction,
} from './types';

/**
 * Implementation of conversation orchestrator for multi-agent coordination
 */
export class ConversationOrchestratorImpl implements ConversationOrchestrator {
  private logger = getLogger('ConversationOrchestrator');
  private activeSessions = new Map<string, ConversationSession>();
  private patternRegistry = new Map<string, any>();

  constructor(private memory: ConversationMemory) {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Register known conversation patterns
    this.patternRegistry.set('code-review', {
      name: 'Code Review',
      description: 'Structured code review workflow',
    });
    this.patternRegistry.set('problem-solving', {
      name: 'Problem Solving',
      description: 'Collaborative problem solving',
    });
    this.patternRegistry.set('planning', {
      name: 'Planning',
      description: 'Sprint or project planning',
    });
  }

  async createConversation(
    config: ConversationConfig
  ): Promise<ConversationSession> {
    this.logger.info('Creating conversation', {
      title: config.title,
      pattern: config.pattern,
    });

    // Validate pattern
    if (!this.patternRegistry.has(config.pattern)) {
      throw new Error(`Unknown conversation pattern: ${config.pattern}`);
    }

    // Create conversation session
    const session: ConversationSession = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: config.title,
      description: config.description,
      participants: [...config.initialParticipants],
      initiator:
        config.initialParticipants[0]'' | '''' | ''({
          id:'',
          swarmId: '',
          type: 'researcher' as const,
          instance: 0,
        } as AgentId),
      orchestrator: config.orchestrator,
      startTime: new Date(),
      endTime: undefined,
      status: 'active', // Start immediately
      context: { ...config.context },
      messages: [],
      outcomes: [],
      metrics: {
        messageCount: 0,
        participationByAgent: Object.fromEntries(
          config.initialParticipants.map((agent) => [agent.id, 0])
        ),
        averageResponseTime: 0,
        resolutionTime: 0,
        consensusScore: 0,
        qualityRating: 0,
      },
    };

    // Store in memory
    await this.memory.storeConversation(session);

    // Store in active sessions
    this.activeSessions.set(session.id, session);

    // Update status to active
    await this.memory.updateConversation(session.id, { status: 'active' });

    this.logger.info('Conversation created successfully', { id: session.id });
    return session;
  }

  async startConversation(
    conversationId: string
  ): Promise<ConversationSession> {
    this.logger.info('Starting conversation', { conversationId });

    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Update session status to active if not already
    if (session.status !== 'active') {
      session.status = 'active';
      session.startTime = new Date();
      await this.memory.updateConversation(conversationId, {
        status: 'active',
        startTime: session.startTime,
      });
    }

    this.logger.info('Conversation started successfully', {
      id: conversationId,
    });
    return session;
  }

  async joinConversation(
    conversationId: string,
    agent: AgentId
  ): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Add agent to participants
    if (!session.participants.some((p) => p.id === agent.id)) {
      session.participants.push(agent);
      session.metrics.participationByAgent[agent.id] = 0;

      // Update in memory
      await this.memory.updateConversation(conversationId, {
        participants: session.participants,
        metrics: session.metrics,
      });

      this.logger.info('Agent joined conversation', {
        conversationId,
        agentId: agent.id,
      });
    }
  }

  async leaveConversation(
    conversationId: string,
    agent: AgentId
  ): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Remove agent from participants
    session.participants = session.participants.filter(
      (p) => p.id !== agent.id
    );
    delete session.metrics.participationByAgent[agent.id];

    // Update in memory
    await this.memory.updateConversation(conversationId, {
      participants: session.participants,
      metrics: session.metrics,
    });

    this.logger.info('Agent left conversation', {
      conversationId,
      agentId: agent.id,
    });
  }

  async sendMessage(message: ConversationMessage): Promise<void> {
    const session = this.activeSessions.get(message.conversationId);
    if (!session) {
      throw new Error(`Conversation ${message.conversationId} not found`);
    }

    // Validate sender is participant
    const isParticipant = session.participants.some(
      (p) => p.id === message.fromAgent.id
    );
    if (!isParticipant) {
      throw new Error(
        `Agent ${message.fromAgent.id} is not a participant in this conversation`
      );
    }

    // Add message to session
    const messageWithId = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    session.messages.push(messageWithId);
    session.metrics.messageCount++;
    session.metrics.participationByAgent[message.fromAgent.id] =
      (session.metrics.participationByAgent[message.fromAgent.id]'' | '''' | ''0) + 1;

    // Update in memory
    await this.memory.updateConversation(message.conversationId, {
      messages: session.messages,
      metrics: session.metrics,
    });

    this.logger.debug('Message sent', {
      conversationId: message.conversationId,
      messageId: messageWithId.id,
      fromAgent: message.fromAgent.id,
    });
  }

  async moderateConversation(
    conversationId: string,
    action: ModerationAction
  ): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    this.logger.info('Moderating conversation', {
      conversationId,
      action: action.type,
      target: action.target.id,
    });

    // Apply moderation action
    switch (action.type) {
      case 'pause':
        session.status = 'paused';
        break;
      case 'resume':
        session.status = 'active';
        break;
      case 'remove':
        await this.leaveConversation(conversationId, action.target);
        break;
      // Other moderation actions can be implemented as needed
    }

    // Update in memory
    await this.memory.updateConversation(conversationId, {
      status: session.status,
    });
  }

  async getConversationHistory(
    conversationId: string
  ): Promise<ConversationMessage[]> {
    // Check active sessions first
    const activeSession = this.activeSessions.get(conversationId);
    if (activeSession) {
      return activeSession.messages;
    }

    // Fallback to memory
    const session = await this.memory.getConversation(conversationId);
    return session?.messages'' | '''' | ''[];
  }

  async terminateConversation(
    conversationId: string,
    reason?: string
  ): Promise<ConversationOutcome[]> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Generate outcomes from conversation
    const outcomes: ConversationOutcome[] = [];

    // Create outcomes from messages with decisions
    for (const message of session.messages) {
      if (message.messageType ==='decision') {
        outcomes.push({
          type: 'decision',
          content: message.content,
          confidence: 0.8, // Default confidence
          contributors: [message.fromAgent],
          timestamp: message.timestamp,
        });
      }
    }

    // Finalize session
    session.status = 'completed';
    session.endTime = new Date();
    session.outcomes = outcomes;

    // Calculate final metrics
    if (session.startTime && session.endTime) {
      session.metrics.resolutionTime =
        session.endTime.getTime() - session.startTime.getTime();
    }

    // Update in memory
    await this.memory.updateConversation(conversationId, {
      status: session.status,
      endTime: session.endTime,
      outcomes: session.outcomes,
      metrics: session.metrics,
    });

    // Remove from active sessions
    this.activeSessions.delete(conversationId);

    this.logger.info('Conversation terminated', {
      conversationId,
      reason,
      outcomesCount: outcomes.length,
    });
    return outcomes;
  }
}
