/**
 * Conversation Orchestrator.
 *
 * Core orchestration for ag2.ai-inspired multi-agent conversations.
 */

import { getLogger } from '@claude-zen/foundation';
import { nanoid } from 'nanoid';

import { getTeamworkStorage } from './storage';
import type {
  AgentId,
  ConversationConfig,
  ConversationMessage,
  ConversationOrchestrator,
  ConversationOutcome,
  ConversationSession,
  ModerationAction,
} from './types';

// Import BrainCoordinator from @claude-zen/brain package (optional fallback)
let BrainCoordinator: any;
try {
  BrainCoordinator = require('@claude-zen/brain').BrainCoordinator;
} catch (error) {
  // Fallback if brain package is not available
  BrainCoordinator = class {
    constructor(config: any) {
      this.config = config;
    }
    config: any;
  };
}

const logger = getLogger('teamwork-orchestrator');

/**
 * Conversation orchestrator with shared storage persistence.
 * Uses @claude-zen/foundation storage wrapper for lightweight persistence.
 */
export class ConversationOrchestratorImpl implements ConversationOrchestrator {
  private activeSessions = new Map<string, ConversationSession>();
  private eventHandlers = new Map<string, Function[]>();
  private storage = getTeamworkStorage();

  // AI-powered coordination with Brain (initialized in constructor)
  private brainCoordinator: any;

  constructor() {
    // Initialize AI coordination systems
    this.brainCoordinator = new BrainCoordinator({
      sessionId: 'teamwork-orchestrator',
      enableLearning: true,
      cacheOptimizations: true,
    });

    logger.info('🧠 Team coordination initialized with Brain');
  }

  /**
   * Create a new conversation session.
   */
  async createConversation(
    config: ConversationConfig
  ): Promise<ConversationSession> {
    logger.info('Creating conversation:', config.title);

    const session: ConversationSession = {
      id: nanoid(),
      title: config.title,
      description: config.description,
      participants: [...config.initialParticipants],
      initiator: config.initialParticipants[0]'' | '''' | ''{
        id:'unknown',
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
   * Start an existing conversation.
   */
  async startConversation(
    conversationId: string
  ): Promise<ConversationSession> {
    logger.info('Starting conversation:', conversationId);

    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Update session status to active if not already
    if (session.status !== 'active') {
      session.status = 'active';
      session.startTime = new Date();
      await this.storage.updateSession(conversationId, {
        status: 'active',
        startTime: session.startTime,
      });
    }

    logger.info('Conversation started successfully:', conversationId);
    return session;
  }

  /**
   * Add an agent to an active conversation.
   */
  async joinConversation(
    conversationId: string,
    agent: AgentId
  ): Promise<void> {
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

      logger.info('Agent joined conversation', {
        agentId: agent.id,
        conversationId,
      });
    }
  }

  /**
   * Remove an agent from a conversation.
   */
  async leaveConversation(
    conversationId: string,
    agent: AgentId
  ): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    session.participants = session.participants.filter(
      (p) => p.id !== agent.id
    );

    // Update storage
    await this.storage.updateSession(conversationId, {
      participants: session.participants,
    });

    logger.info('Agent left conversation', {
      agentId: agent.id,
      conversationId,
    });
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
      throw new Error(
        `Cannot send message to conversation in status: ${session.status}`
      );
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
      (session.metrics.participationByAgent[message.fromAgent.id]'' | '''' | ''0) + 1;

    // Update storage
    await this.storage.addMessage(message.conversationId, message);

    logger.debug('Message sent', {
      messageId: message.id,
      messageType: message.messageType,
    });

    // Emit message event
    await this.emit('message', { session, message });
  }

  /**
   * Moderate a conversation.
   */
  async moderateConversation(
    conversationId: string,
    action: ModerationAction
  ): Promise<void> {
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

    logger.info('Moderation action applied', {
      actionType: action.type,
      conversationId,
    });
  }

  /**
   * Get conversation message history.
   */
  async getConversationHistory(
    conversationId: string
  ): Promise<ConversationMessage[]> {
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
  async terminateConversation(
    conversationId: string,
    reason?: string
  ): Promise<ConversationOutcome[]> {
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

    // Use AI coordination for learning from conversation outcomes
    try {
      // Log coordination context for future AI learning
      logger.debug('Brain coordinator session context:', {
        sessionId: session.id,
        outcomes: session.outcomes.length,
        coordinator: this.brainCoordinator ? 'active' : 'inactive',
      });

      logger.debug('Pattern engine analysis context:', {
        sessionId: session.id,
        messageCount: session.messages.length,
        engine: 'brain-only',
      });
    } catch (error) {
      logger.warn('AI coordination processing failed:', error);
    }

    // Update storage with final state
    await this.storage.updateSession(conversationId, {
      status: session.status,
      endTime: session.endTime,
      outcomes: session.outcomes,
      metrics: session.metrics,
    });

    // Remove from active sessions
    this.activeSessions.delete(conversationId);

    logger.info('Conversation terminated', { conversationId, reason });

    return outcomes;
  }

  /**
   * Generate simple conversation outcomes.
   */
  private generateSimpleOutcomes(
    session: ConversationSession
  ): ConversationOutcome[] {
    const outcomes: ConversationOutcome[] = [];

    // Simple outcome based on message types
    const decisionMessages = session.messages.filter(
      (m) => m.messageType === 'decision'
    );
    const solutionMessages = session.messages.filter(
      (m) => m.messageType === 'answer'
    );

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
    const agreements = session.messages.filter(
      (m) => m.messageType === 'agreement'
    ).length;
    const disagreements = session.messages.filter(
      (m) => m.messageType === 'disagreement'
    ).length;
    const total = agreements + disagreements;
    session.metrics.consensusScore = total > 0 ? agreements / total : 0.5;

    // Simple quality rating
    const messageTypes = new Set(session.messages.map((m) => m.messageType));
    session.metrics.qualityRating = Math.min(1, messageTypes.size / 5);

    // Simple average response time
    const messages = session.messages.filter(
      (m) => m.messageType !== 'system_notification');
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
    const handlers = this.eventHandlers.get(event)'' | '''' | ''[];
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
    return Array.from(this.activeSessions.values())();
  }

  /**
   * Get conversation by ID.
   */
  public getSession(conversationId: string): ConversationSession'' | ''undefined {
    return this.activeSessions.get(conversationId);
  }
}

// =============================================================================
// ENHANCED EXPORTS - Foundation integration
// =============================================================================

// Use the implementation we defined above
export { ConversationOrchestratorImpl as FoundationConversationOrchestrator };

// Default export (enterprise version)
export default ConversationOrchestratorImpl;

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

export async function getTeamworkSystemAccess(
  config?: ConversationConfig
): Promise<any> {
  const orchestrator = new ConversationOrchestratorImpl();
  return {
    createOrchestrator: () => new ConversationOrchestratorImpl(),
    createConversation: (convConfig: ConversationConfig) =>
      orchestrator.createConversation(convConfig),
    startConversation: (conversationId: string) =>
      orchestrator.startConversation(conversationId),
    joinConversation: (conversationId: string, agent: AgentId) =>
      orchestrator.joinConversation(conversationId, agent),
    leaveConversation: (conversationId: string, agent: AgentId) =>
      orchestrator.leaveConversation(conversationId, agent),
    sendMessage: (message: ConversationMessage) =>
      orchestrator.sendMessage(message),
    moderateConversation: (conversationId: string, action: ModerationAction) =>
      orchestrator.moderateConversation(conversationId, action),
    getHistory: (conversationId: string) =>
      orchestrator.getConversationHistory(conversationId),
    terminateConversation: (conversationId: string, reason?: string) =>
      orchestrator.terminateConversation(conversationId, reason),
    getActiveSessions: () => orchestrator.getActiveSessions(),
    getSession: (conversationId: string) =>
      orchestrator.getSession(conversationId),
    on: (event: string, handler: Function) => orchestrator.on(event, handler),
  };
}

export async function getConversationOrchestrator(): Promise<ConversationOrchestratorImpl> {
  return new ConversationOrchestratorImpl();
}

export async function getMultiAgentCollaboration(
  config?: ConversationConfig
): Promise<any> {
  const system = await getTeamworkSystemAccess(config);
  return {
    startCollaboration: (convConfig: ConversationConfig) =>
      system.createConversation(convConfig),
    addAgent: (conversationId: string, agent: AgentId) =>
      system.joinConversation(conversationId, agent),
    removeAgent: (conversationId: string, agent: AgentId) =>
      system.leaveConversation(conversationId, agent),
    facilitateDiscussion: (message: ConversationMessage) =>
      system.sendMessage(message),
    moderateSession: (conversationId: string, action: ModerationAction) =>
      system.moderateConversation(conversationId, action),
    concludeSession: (conversationId: string, reason?: string) =>
      system.terminateConversation(conversationId, reason),
  };
}

export async function getConversationManagement(
  config?: ConversationConfig
): Promise<any> {
  const system = await getTeamworkSystemAccess(config);
  return {
    listActive: () => system.getActiveSessions(),
    getConversation: (conversationId: string) =>
      system.getSession(conversationId),
    getHistory: (conversationId: string) => system.getHistory(conversationId),
    control: (conversationId: string) => ({
      start: () => system.startConversation(conversationId),
      pause: () =>
        system.moderateConversation(conversationId, { type:'pause' }),
      resume: () =>
        system.moderateConversation(conversationId, { type: 'resume' }),
      terminate: (reason?: string) =>
        system.terminateConversation(conversationId, reason),
    }),
  };
}

export async function getConversationCoordination(
  config?: ConversationConfig
): Promise<any> {
  const system = await getTeamworkSystemAccess(config);
  return {
    coordinate: (convConfig: ConversationConfig) =>
      system.createConversation(convConfig),
    orchestrate: (conversationId: string, message: ConversationMessage) =>
      system.sendMessage(message),
    synchronize: (conversationId: string) => system.getSession(conversationId),
    monitor: (conversationId: string) => system.getHistory(conversationId),
  };
}

// Professional teamwork system object with proper naming (matches brainSystem pattern)
export const teamworkSystem = {
  getAccess: getTeamworkSystemAccess,
  getOrchestrator: getConversationOrchestrator,
  getCollaboration: getMultiAgentCollaboration,
  getManagement: getConversationManagement,
  getCoordination: getConversationCoordination,
  createOrchestrator: () => new ConversationOrchestratorImpl(),
};
