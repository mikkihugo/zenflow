/**
 * Conversation Orchestrator.
 *
 * Core orchestration engine for ag2.ai-inspired multi-agent conversations.
 */
/**
 * @file Orchestrator implementation.
 */

import { nanoid } from 'nanoid';
import type { AgentId } from '../types/agent-types';
import type {
  ConversationConfig,
  ConversationMemory,
  ConversationMessage,
  ConversationOrchestrator,
  ConversationOutcome,
  ConversationPattern,
  ConversationSession,
  ModerationAction,
} from './types.ts';

/**
 * Implementation of the conversation orchestrator.
 * Manages multi-agent conversations with patterns and learning.
 *
 * @example
 */
export class ConversationOrchestratorImpl implements ConversationOrchestrator {
  private activeSessions = new Map<string, ConversationSession>();
  private patterns = new Map<string, ConversationPattern>();
  private eventHandlers = new Map<string, Function[]>();

  constructor(private memory: ConversationMemory) {
    this.initializeDefaultPatterns();
  }

  /**
   * Create a new conversation session.
   *
   * @param config
   */
  async createConversation(
    config: ConversationConfig,
  ): Promise<ConversationSession> {
    const pattern = this.patterns.get(config?.pattern);
    if (!pattern) {
      throw new Error(`Unknown conversation pattern: ${config?.pattern}`);
    }

    const session: ConversationSession = {
      id: nanoid(),
      title: config?.title,
      description: config?.description,
      participants: [...config?.initialParticipants],
      initiator: config?.initialParticipants?.[0] || {
        id: 'unknown',
        swarmId: 'system',
        type: 'coordinator',
        instance: 0,
      },
      orchestrator: config?.orchestrator,
      startTime: new Date(),
      status: 'initializing',
      context: config?.context,
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
    config?.initialParticipants?.forEach((agent) => {
      session.metrics.participationByAgent[agent.id] = 0;
    });

    this.activeSessions.set(session.id, session);
    await this.memory.storeConversation(session);

    // Start the conversation pattern workflow
    await this.startPatternWorkflow(session, pattern);

    return session;
  }

  /**
   * Add an agent to an active conversation.
   *
   * @param conversationId
   * @param agent
   */
  async joinConversation(
    conversationId: string,
    agent: AgentId,
  ): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (session.status !== 'active') {
      throw new Error(`Cannot join conversation in status: ${session.status}`);
    }

    if (!session.participants.find((p) => p.id === agent.id)) {
      session.participants.push(agent);
      session.metrics.participationByAgent[agent.id] = 0;
      await this.memory.updateConversation(conversationId, {
        participants: session.participants,
      });
    }

    // Send join notification
    await this.sendSystemMessage(
      session,
      `Agent ${agent.id} joined the conversation`,
    );
  }

  /**
   * Remove an agent from a conversation.
   *
   * @param conversationId
   * @param agent
   */
  async leaveConversation(
    conversationId: string,
    agent: AgentId,
  ): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    session.participants = session.participants.filter(
      (p) => p.id !== agent.id,
    );
    await this.memory.updateConversation(conversationId, {
      participants: session.participants,
    });

    // Send leave notification
    await this.sendSystemMessage(
      session,
      `Agent ${agent.id} left the conversation`,
    );
  }

  /**
   * Send a message in a conversation.
   *
   * @param message
   */
  async sendMessage(message: ConversationMessage): Promise<void> {
    const session = this.activeSessions.get(message.conversationId);
    if (!session) {
      throw new Error(`Conversation ${message.conversationId} not found`);
    }

    if (session.status !== 'active') {
      throw new Error(
        `Cannot send message to conversation in status: ${session.status}`,
      );
    }

    // Validate sender is participant
    if (!session.participants.find((p) => p.id === message.fromAgent.id)) {
      throw new Error(
        `Agent ${message.fromAgent.id} is not a participant in this conversation`,
      );
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

    // Update session in memory
    await this.memory.updateConversation(session.id, {
      messages: session.messages,
      metrics: session.metrics,
    });

    // Emit message event
    await this.emit('message', { session, message });

    // Process message for pattern workflow
    await this.processMessageForWorkflow(session, message);
  }

  /**
   * Moderate a conversation (mute, warn, etc.).
   *
   * @param conversationId
   * @param action
   */
  async moderateConversation(
    conversationId: string,
    action: ModerationAction,
  ): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Apply moderation action
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
      // Additional moderation actions can be implemented
    }

    await this.memory.updateConversation(conversationId, {
      status: session.status,
    });
    await this.sendSystemMessage(
      session,
      `Moderation action: ${action.type} - ${action.reason}`,
    );
  }

  /**
   * Get conversation message history.
   *
   * @param conversationId
   */
  async getConversationHistory(
    conversationId: string,
  ): Promise<ConversationMessage[]> {
    const session =
      this.activeSessions.get(conversationId) ||
      (await this.memory.getConversation(conversationId));

    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return session.messages;
  }

  /**
   * Terminate a conversation and return outcomes.
   *
   * @param conversationId
   * @param reason
   */
  async terminateConversation(
    conversationId: string,
    reason?: string,
  ): Promise<ConversationOutcome[]> {
    const session = this.activeSessions.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    session.status = 'completed';
    session.endTime = new Date();

    // Generate conversation outcomes
    const outcomes = await this.generateConversationOutcomes(session);
    session.outcomes = outcomes;

    // Update final metrics
    await this.updateFinalMetrics(session);

    // Store final state
    await this.memory.updateConversation(conversationId, {
      status: session.status,
      endTime: session.endTime,
      outcomes: session.outcomes,
      metrics: session.metrics,
    });

    // Remove from active sessions
    this.activeSessions.delete(conversationId);

    if (reason) {
      await this.sendSystemMessage(
        session,
        `Conversation terminated: ${reason}`,
      );
    }

    return outcomes;
  }

  /**
   * Initialize default conversation patterns.
   */
  private initializeDefaultPatterns(): void {
    // Code Review Pattern
    this.patterns.set('code-review', {
      name: 'code-review',
      description: 'Multi-agent code review process',
      roles: [
        {
          name: 'author',
          agentTypes: ['coder', 'developer', 'frontend-dev', 'api-dev'],
          responsibilities: [
            'Present code',
            'Answer questions',
            'Address feedback',
          ],
          permissions: [{ action: 'write', scope: 'own' }],
          required: true,
        },
        {
          name: 'reviewer',
          agentTypes: ['reviewer', 'architect'],
          responsibilities: [
            'Review code',
            'Provide feedback',
            'Approve/reject',
          ],
          permissions: [{ action: 'write', scope: 'group' }],
          required: true,
        },
        {
          name: 'moderator',
          agentTypes: ['coordinator'],
          responsibilities: ['Facilitate discussion', 'Resolve conflicts'],
          permissions: [{ action: 'moderate', scope: 'all' }],
          required: false,
        },
      ],
      workflow: [
        {
          id: 'present-code',
          name: 'Present Code',
          description: 'Author presents code for review',
          trigger: { type: 'manual', condition: null },
          actions: [
            {
              type: 'send_message',
              params: { messageType: 'task_request' },
              agent: 'author',
            },
          ],
          participants: ['author'],
        },
        {
          id: 'review-code',
          name: 'Review Code',
          description: 'Reviewers analyze and provide feedback',
          trigger: {
            type: 'message',
            condition: { messageType: 'task_request' },
          },
          actions: [
            {
              type: 'send_message',
              params: { messageType: 'critique' },
              agent: 'reviewer',
            },
          ],
          participants: ['reviewer'],
          timeout: 300000, // 5 minutes
        },
        {
          id: 'address-feedback',
          name: 'Address Feedback',
          description: 'Author responds to feedback',
          trigger: { type: 'message', condition: { messageType: 'critique' } },
          actions: [
            {
              type: 'send_message',
              params: { messageType: 'task_response' },
              agent: 'author',
            },
          ],
          participants: ['author'],
        },
        {
          id: 'finalize',
          name: 'Finalize Review',
          description: 'Make final decision',
          trigger: { type: 'consensus', condition: { threshold: 0.7 } },
          actions: [{ type: 'make_decision', params: {}, agent: 'moderator' }],
          participants: ['moderator', 'reviewer'],
        },
      ],
      constraints: [
        { type: 'time_limit', value: 3600000 }, // 1 hour
        { type: 'message_limit', value: 50 },
        { type: 'quality_threshold', value: 0.8 },
      ],
    });

    // Problem Solving Pattern
    this.patterns.set('problem-solving', {
      name: 'problem-solving',
      description: 'Collaborative problem-solving session',
      roles: [
        {
          name: 'analyst',
          agentTypes: ['analyst', 'researcher'],
          responsibilities: ['Analyze problem', 'Gather requirements'],
          permissions: [{ action: 'write', scope: 'group' }],
          required: true,
        },
        {
          name: 'solver',
          agentTypes: ['coder', 'architect', 'specialist'],
          responsibilities: ['Propose solutions', 'Implement fixes'],
          permissions: [{ action: 'write', scope: 'group' }],
          required: true,
        },
        {
          name: 'validator',
          agentTypes: ['tester', 'quality_reviewer'],
          responsibilities: ['Validate solutions', 'Test implementations'],
          permissions: [{ action: 'write', scope: 'group' }],
          required: true,
        },
      ],
      workflow: [
        {
          id: 'analyze-problem',
          name: 'Analyze Problem',
          description: 'Understand and define the problem',
          trigger: { type: 'manual', condition: null },
          actions: [
            {
              type: 'send_message',
              params: { messageType: 'question' },
              agent: 'analyst',
            },
          ],
          participants: ['analyst'],
        },
        {
          id: 'propose-solutions',
          name: 'Propose Solutions',
          description: 'Generate potential solutions',
          trigger: { type: 'message', condition: { messageType: 'question' } },
          actions: [
            {
              type: 'send_message',
              params: { messageType: 'suggestion' },
              agent: 'solver',
            },
          ],
          participants: ['solver'],
        },
        {
          id: 'validate-solutions',
          name: 'Validate Solutions',
          description: 'Test and validate proposed solutions',
          trigger: {
            type: 'message',
            condition: { messageType: 'suggestion' },
          },
          actions: [
            {
              type: 'send_message',
              params: { messageType: 'answer' },
              agent: 'validator',
            },
          ],
          participants: ['validator'],
        },
        {
          id: 'select-solution',
          name: 'Select Solution',
          description: 'Choose the best solution',
          trigger: { type: 'consensus', condition: { threshold: 0.6 } },
          actions: [{ type: 'make_decision', params: {}, agent: 'analyst' }],
          participants: ['analyst', 'solver', 'validator'],
        },
      ],
      constraints: [
        { type: 'time_limit', value: 7200000 }, // 2 hours
        { type: 'message_limit', value: 100 },
      ],
    });
  }

  /**
   * Start pattern workflow for a session.
   *
   * @param session
   * @param pattern
   */
  private async startPatternWorkflow(
    session: ConversationSession,
    pattern: ConversationPattern,
  ): Promise<void> {
    session.status = 'active';
    await this.memory.updateConversation(session.id, {
      status: session.status,
    });

    // Send welcome message
    await this.sendSystemMessage(
      session,
      `Starting ${pattern.name} conversation: ${session.title}`,
    );

    // Trigger first workflow step
    const firstStep = pattern.workflow[0];
    if (firstStep && firstStep.trigger.type === 'manual') {
      await this.executeWorkflowStep(session, pattern, firstStep);
    }
  }

  /**
   * Process message for workflow progression.
   *
   * @param session
   * @param message
   */
  private async processMessageForWorkflow(
    session: ConversationSession,
    message: ConversationMessage,
  ): Promise<void> {
    const pattern = this.patterns.get(session.context.domain);
    if (!pattern) return;

    // Check for workflow triggers
    for (const step of pattern.workflow) {
      if (this.shouldTriggerStep(step, message, session)) {
        await this.executeWorkflowStep(session, pattern, step);
      }
    }
  }

  /**
   * Check if a workflow step should be triggered.
   *
   * @param step
   * @param message
   * @param session
   */
  private shouldTriggerStep(
    step: any,
    message: ConversationMessage,
    session: ConversationSession,
  ): boolean {
    if (step.trigger.type === 'message') {
      return step.trigger.condition.messageType === message.messageType;
    }
    if (step.trigger.type === 'consensus') {
      return this.checkConsensus(session, step.trigger.condition.threshold);
    }
    return false;
  }

  /**
   * Execute a workflow step.
   *
   * @param session
   * @param _pattern
   * @param step
   */
  private async executeWorkflowStep(
    session: ConversationSession,
    _pattern: ConversationPattern,
    step: any,
  ): Promise<void> {
    // Implementation would depend on step actions
    // For now, just send a system message
    await this.sendSystemMessage(
      session,
      `Executing workflow step: ${step.name}`,
    );
  }

  /**
   * Check consensus among participants.
   *
   * @param session
   * @param threshold
   */
  private checkConsensus(
    session: ConversationSession,
    threshold: number,
  ): boolean {
    // Simple consensus check based on agreement messages
    const agreementMessages = session.messages.filter(
      (m) => m.messageType === 'agreement',
    );
    const participantCount = session.participants.length;

    return agreementMessages.length / participantCount >= threshold;
  }

  /**
   * Send system message.
   *
   * @param session
   * @param text
   */
  private async sendSystemMessage(
    session: ConversationSession,
    text: string,
  ): Promise<void> {
    const systemMessage: ConversationMessage = {
      id: nanoid(),
      conversationId: session.id,
      fromAgent: {
        id: 'system',
        swarmId: 'system',
        type: 'coordinator',
        instance: 0,
      },
      timestamp: new Date(),
      content: { text },
      messageType: 'system_notification',
      metadata: {
        priority: 'medium',
        requiresResponse: false,
        context: session.context,
        tags: ['system'],
      },
    };

    session.messages.push(systemMessage);
    await this.memory.updateConversation(session.id, {
      messages: session.messages,
    });
  }

  /**
   * Generate conversation outcomes.
   *
   * @param session
   */
  private async generateConversationOutcomes(
    session: ConversationSession,
  ): Promise<ConversationOutcome[]> {
    const outcomes: ConversationOutcome[] = [];

    // Analyze messages for decisions and solutions
    const decisionMessages = session.messages.filter(
      (m) => m.messageType === 'decision',
    );
    const solutionMessages = session.messages.filter(
      (m) => m.messageType === 'answer',
    );

    decisionMessages.forEach((msg) => {
      outcomes.push({
        type: 'decision',
        content: msg.content,
        confidence: 0.8, // Could be calculated based on consensus
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
   *
   * @param session
   */
  private async updateFinalMetrics(
    session: ConversationSession,
  ): Promise<void> {
    const duration = session.endTime
      ? session.endTime.getTime() - session.startTime.getTime()
      : 0;
    session.metrics.resolutionTime = duration;

    // Calculate consensus score
    session.metrics.consensusScore = this.calculateConsensusScore(session);

    // Calculate quality rating
    session.metrics.qualityRating = this.calculateQualityRating(session);

    // Calculate average response time
    session.metrics.averageResponseTime =
      this.calculateAverageResponseTime(session);
  }

  /**
   * Calculate consensus score.
   *
   * @param session
   */
  private calculateConsensusScore(session: ConversationSession): number {
    const agreements = session.messages.filter(
      (m) => m.messageType === 'agreement',
    ).length;
    const disagreements = session.messages.filter(
      (m) => m.messageType === 'disagreement',
    ).length;
    const total = agreements + disagreements;

    return total > 0 ? agreements / total : 0.5;
  }

  /**
   * Calculate quality rating.
   *
   * @param session
   */
  private calculateQualityRating(session: ConversationSession): number {
    // Simple quality rating based on message diversity and participation
    const messageTypes = new Set(session.messages.map((m) => m.messageType));
    const participationBalance = this.calculateParticipationBalance(session);

    return (messageTypes.size / 10 + participationBalance) / 2;
  }

  /**
   * Calculate participation balance.
   *
   * @param session
   */
  private calculateParticipationBalance(session: ConversationSession): number {
    const participationCounts = Object.values(
      session.metrics.participationByAgent,
    );
    const avgParticipation =
      participationCounts.reduce((a, b) => a + b, 0) /
      participationCounts.length;
    const variance =
      participationCounts.reduce(
        (acc, val) => acc + (val - avgParticipation) ** 2,
        0,
      ) / participationCounts.length;

    return Math.max(0, 1 - variance / (avgParticipation + 1));
  }

  /**
   * Calculate average response time.
   *
   * @param session
   */
  private calculateAverageResponseTime(session: ConversationSession): number {
    const messages = session.messages.filter(
      (m) => m.messageType !== 'system_notification',
    );
    if (messages.length < 2) return 0;

    let totalTime = 0;
    for (let i = 1; i < messages.length; i++) {
      const currentMsg = messages[i];
      const prevMsg = messages[i - 1];
      if (currentMsg && prevMsg) {
        totalTime +=
          currentMsg?.timestamp?.getTime() - prevMsg.timestamp.getTime();
      }
    }

    return totalTime / (messages.length - 1);
  }

  /**
   * Event system for conversation events.
   *
   * @param event
   * @param data
   */
  private async emit(event: string, data: any): Promise<void> {
    const handlers = this.eventHandlers.get(event) || [];
    await Promise.all(handlers.map((handler) => handler(data)));
  }

  /**
   * Register event handler.
   *
   * @param event
   * @param handler
   */
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }
}
