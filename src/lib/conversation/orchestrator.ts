/**
 * Conversation Orchestrator.
 *
 * Core orchestration for ag2.ai-inspired multi-agent conversations.
 */

import { nanoid } from 'nanoid';
import { getConversationStorage } from './storage';

// Simple logging for standalone mode
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
};
import type {
  AgentId,
  ConversationConfig,
  ConversationMessage,
  ConversationOrchestrator,
  ConversationOutcome,
  ConversationSession,
  ModerationAction,
} from './types';


/**
 * Conversation orchestrator with shared storage persistence.
 * Uses @claude-zen/foundation storage wrapper for lightweight persistence.
 */
export class ConversationOrchestratorImpl implements ConversationOrchestrator {
  private activeSessions = new Map<string, ConversationSession>();
  private eventHandlers = new Map<string, Function[]>();
  private storage = getConversationStorage();

  /**
   * Create a new conversation session.
   */
  async createConversation(config: ConversationConfig): Promise<ConversationSession> {
    logger.info('Creating conversation:', config.title);

    const session: ConversationSession = {
      id: nanoid(),
      title: config.title,
      description: config.description,
      participants: [...config.initialParticipants],
      initiator: config.initialParticipants[0] || {
        id: 'unknown',
        swarmId: 'system',
        type: 'coordinator',
        instance: 0,
      },
      orchestrator: config.orchestrator,
      startTime: new Date(),
      endTime: undefined,
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

    // Initialize participation tracking
    config.initialParticipants.forEach((agent) => {
      session.metrics.participationByAgent[agent.id] = 0;
    });

    this.activeSessions.set(session.id, session);
    
    // Persist to storage
    await this.storage.storeSession(session);
    
    logger.info('Conversation created:', session.id);

    return session;
  }

  /**
   * Add an agent to an active conversation.
   */
  async joinConversation(conversationId: string, agent: AgentId): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (!session.participants.find((p) => p.id === agent.id)) {
      session.participants.push(agent);
      session.metrics.participationByAgent[agent.id] = 0;
      
      // Update storage
      await this.storage.updateSession(conversationId, {
        participants: session.participants,
        metrics: session.metrics,
      });
      
      logger.info('Agent joined conversation:', agent.id, conversationId);
    }
  }

  /**
   * Remove an agent from a conversation.
   */
  async leaveConversation(conversationId: string, agent: AgentId): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    session.participants = session.participants.filter((p) => p.id !== agent.id);
    
    // Update storage
    await this.storage.updateSession(conversationId, {
      participants: session.participants,
    });
    
    logger.info('Agent left conversation:', agent.id, conversationId);
  }

  /**
   * Send a message in a conversation.
   */
  async sendMessage(message: ConversationMessage): Promise<void> {
    const session = this.activeSessions.get(message.conversationId);
    if (!session) {
      throw new Error(`Conversation ${message.conversationId} not found`);
    }

    if (session.status !== 'active') {
      throw new Error(`Cannot send message to conversation in status: ${session.status}`);
    }

    // Validate sender is participant
    if (!session.participants.find((p) => p.id === message.fromAgent.id)) {
      throw new Error(`Agent ${message.fromAgent.id} is not a participant`);
    }

    // Add timestamp and ID if not set
    if (!message.id) {
      message.id = nanoid();
    }
    if (!message.timestamp) {
      message.timestamp = new Date();
    }

    // Add to session
    session.messages.push(message);
    session.metrics.messageCount++;
    session.metrics.participationByAgent[message.fromAgent.id] =
      (session.metrics.participationByAgent[message.fromAgent.id] || 0) + 1;

    // Update storage
    await this.storage.addMessage(message.conversationId, message);

    logger.debug('Message sent:', message.id, message.messageType);

    // Emit message event
    await this.emit('message', { session, message });
  }

  /**
   * Moderate a conversation.
   */
  async moderateConversation(conversationId: string, action: ModerationAction): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    switch (action.type) {
      case 'pause':
        session.status = 'paused';
        break;
      case 'resume':
        if (session.status === 'paused') {
          session.status = 'active';
        }
        break;
      case 'remove':
        await this.leaveConversation(conversationId, action.target);
        break;
    }

    // Update storage
    await this.storage.updateSession(conversationId, {
      status: session.status,
    });
    
    logger.info('Moderation action applied:', action.type, conversationId);
  }

  /**
   * Get conversation message history.
   */
  async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
    let session = this.activeSessions.get(conversationId);
    
    // Try to load from storage if not in memory
    if (!session) {
      const storedSession = await this.storage.getSession(conversationId);
      if (storedSession) {
        session = storedSession;
        this.activeSessions.set(conversationId, session);
      }
    }
    
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return [...session.messages]; // Return copy
  }

  /**
   * Terminate a conversation and return outcomes.
   */
  async terminateConversation(conversationId: string, reason?: string): Promise<ConversationOutcome[]> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    session.status = 'completed';
    session.endTime = new Date();

    // Generate simple outcomes
    const outcomes = this.generateSimpleOutcomes(session);
    session.outcomes = outcomes;

    // Update final metrics
    this.updateFinalMetrics(session);

    // Update storage with final state
    await this.storage.updateSession(conversationId, {
      status: session.status,
      endTime: session.endTime,
      outcomes: session.outcomes,
      metrics: session.metrics,
    });

    // Remove from active sessions
    this.activeSessions.delete(conversationId);

    logger.info('Conversation terminated:', conversationId, reason);

    return outcomes;
  }

  /**
   * Generate simple conversation outcomes.
   */
  private generateSimpleOutcomes(session: ConversationSession): ConversationOutcome[] {
    const outcomes: ConversationOutcome[] = [];

    // Simple outcome based on message types
    const decisionMessages = session.messages.filter((m) => m.messageType === 'decision');
    const solutionMessages = session.messages.filter((m) => m.messageType === 'answer');

    decisionMessages.forEach((msg) => {
      outcomes.push({
        type: 'decision',
        content: msg.content,
        confidence: 0.8,
        contributors: [msg.fromAgent],
        timestamp: msg.timestamp,
      });
    });

    solutionMessages.forEach((msg) => {
      outcomes.push({
        type: 'solution',
        content: msg.content,
        confidence: 0.7,
        contributors: [msg.fromAgent],
        timestamp: msg.timestamp,
      });
    });

    return outcomes;
  }

  /**
   * Update final conversation metrics.
   */
  private updateFinalMetrics(session: ConversationSession): void {
    const duration = session.endTime
      ? session.endTime.getTime() - session.startTime.getTime()
      : 0;
    session.metrics.resolutionTime = duration;

    // Simple consensus score
    const agreements = session.messages.filter((m) => m.messageType === 'agreement').length;
    const disagreements = session.messages.filter((m) => m.messageType === 'disagreement').length;
    const total = agreements + disagreements;
    session.metrics.consensusScore = total > 0 ? agreements / total : 0.5;

    // Simple quality rating
    const messageTypes = new Set(session.messages.map((m) => m.messageType));
    session.metrics.qualityRating = Math.min(1, messageTypes.size / 5);

    // Simple average response time
    const messages = session.messages.filter((m) => m.messageType !== 'system_notification');
    if (messages.length > 1) {
      let totalTime = 0;
      for (let i = 1; i < messages.length; i++) {
        const current = messages[i];
        const prev = messages[i - 1];
        if (current && prev) {
          totalTime += current.timestamp.getTime() - prev.timestamp.getTime();
        }
      }
      session.metrics.averageResponseTime = totalTime / (messages.length - 1);
    }
  }

  /**
   * Simple event system.
   */
  private async emit(event: string, data: unknown): Promise<void> {
    const handlers = this.eventHandlers.get(event) || [];
    await Promise.all(handlers.map((handler) => handler(data)));
  }

  /**
   * Register event handler.
   */
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  /**
   * Get active conversations.
   */
  public getActiveSessions(): ConversationSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get conversation by ID.
   */
  public getSession(conversationId: string): ConversationSession | undefined {
    return this.activeSessions.get(conversationId);
  }
}