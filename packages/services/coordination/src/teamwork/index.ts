/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 * 
 * Event-driven teamwork implementation that optionally integrates with SPARC.
 * Provides multi-agent coordination with graceful SPARC integration.
 */

import { EventBus, getLogger, EventLogger } from '@claude-zen/foundation';
const logger = getLogger('Teamwork'');

// Agent conversation types
export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  status:'idle'|'busy'|'offline';
}

export interface ConversationMessage {
  id: string;
  fromAgent: string;
  toAgent?: string; // undefined for broadcast
  content: string;
  timestamp: Date;
  type:'request'|'response'|'notification'|'broadcast';
}

export interface Conversation {
  id: string;
  name: string;
  participants: string[]; // agent IDs
  messages: ConversationMessage[];
  status:'active'|'completed'|'paused';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SPARC INTEGRATION TYPES
// ============================================================================

export interface SPARCCollaborationRequest {
  requestId: string;
  projectId: string;
  phase: string;
  requiresReview: boolean;
  suggestedAgents: string[];
  context: {
    artifacts: unknown[];
    requirements: string[];
  };
  timeout?: number;
}

export interface SPARCReviewResult {
  projectId: string;
  phase: string;
  approved: boolean;
  feedback: string[];
  recommendations: string[];
  conversationId: string;
}

// ============================================================================
// EVENT-DRIVEN CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Event-driven Conversation Manager with optional SPARC integration
 */
export class ConversationManager extends EventBus {
  private conversations: Map<string, Conversation> = new Map();
  private agents: Map<string, Agent> = new Map();
  private sparcReviews: Map<string, SPARCCollaborationRequest> = new Map();

  constructor() {
    super();
    
    // Listen for SPARC collaboration requests (optional - only if SPARC active)
    this.on('sparc:collaboration-needed,this.handleSPARCCollaboration.bind(this)');
    
    logger.info('ConversationManager initialized with optional SPARC integration'');
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    logger.info(`Agent registered: ${agent.name} (${agent.role})`);
  }

  /**
   * Handle SPARC collaboration request (optional integration)
   */
  private async handleSPARCCollaboration(request: SPARCCollaborationRequest): Promise<void> {
    logger.info(`SPARC collaboration requested for ${request.phase} in project ${request.projectId}`);

    try {
      // Create review conversation
      const conversationName = `SPARC ${request.phase} Review - ${request.projectId}`;
      const conversation = await this.createConversation(conversationName, request.suggestedAgents);

      // Store SPARC review context
      this.sparcReviews.set(conversation.id, request);

      // Add initial context message
      await this.addMessage(conversation.id, {
        fromAgent:'system,
        content: `SPARC ${request.phase} phase review requested. Context: ${JSON.stringify(request.context, null, 2)}`,
        type:'notification
      });

      // Simulate review process (in real implementation, this would be actual agent conversations)
      setTimeout(() => {
        this.completeSPARCReview(conversation.id, true, ['Phase looks good'], ['Continue to next phase]);
      }, 5000); // 5 second simulated review

      logger.info(`Created SPARC review conversation: ${conversation.id}`);

    } catch (error) {
      logger.error(`Failed to handle SPARC collaboration: ${error}`);
      
      // Emit failure so SPARC can continue independently
      const failurePayload = {
        projectId: request.projectId,
        phase: request.phase,
        error: error instanceof Error ? error.message : String(error)
      };
      
      EventLogger.log('teamwork:collaboration-failed,failurePayload');
      this.emit('teamwork:collaboration-failed,failurePayload');
    }
  }

  /**
   * Complete SPARC review and notify SPARC
   */
  private completeSPARCReview(
    conversationId: string, 
    approved: boolean, 
    feedback: string[], 
    recommendations: string[]
  ): void {
    const request = this.sparcReviews.get(conversationId);
    if (!request) {
      logger.warn(`No SPARC review found for conversation: ${conversationId}`);
      return;
    }

    const result: SPARCReviewResult = {
      projectId: request.projectId,
      phase: request.phase,
      approved,
      feedback,
      recommendations,
      conversationId
    };

    // Notify SPARC of review completion
    EventLogger.log('teamwork:review-complete,result');
    this.emit('teamwork:review-complete,result');
    
    // Clean up
    this.sparcReviews.delete(conversationId);
    
    logger.info(`SPARC review completed for ${request.phase}: ${approved ?'APPROVED:'REJECTED}`');
  }

  async createConversation(name: string, participantIds: string[]): Promise<Conversation> {
    const conversation: Conversation = {
      id: Math.random().toString(36),
      name,
      participants: participantIds,
      messages: [],
      status:'active,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversations.set(conversation.id, conversation);
    logger.info(`Created conversation: ${name} with participants: ${participantIds.join(,')}`');
    return conversation;
  }

  /**
   * Add message to conversation (internal method)
   */
  async addMessage(conversationId: string, messageData: {
    fromAgent: string;
    content: string;
    toAgent?: string;
    type: ConversationMessage['type];
  }): Promise<ConversationMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const message: ConversationMessage = {
      id: Math.random().toString(36),
      fromAgent: messageData.fromAgent,
      toAgent: messageData.toAgent,
      content: messageData.content,
      timestamp: new Date(),
      type: messageData.type
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    return message;
  }

  async sendMessage(params: {
    conversationId: string;
    fromAgentId: string;
    content: string;
    toAgentId?: string;
    type?: ConversationMessage['type];
  }): Promise<ConversationMessage> {
    const { conversationId, fromAgentId, content, toAgentId, type = 'request '} = params';
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const message: ConversationMessage = {
      id: Math.random().toString(36),
      fromAgent: fromAgentId,
      toAgent: toAgentId,
      content,
      timestamp: new Date(),
      type
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    return message;
  }

  getConversation(id: string): Conversation| undefined {
    return this.conversations.get(id);
  }

  getConversations(agentId?: string): Conversation[] {
    const conversations = Array.from(this.conversations.values();
    
    if (agentId) {
      return conversations.filter(c => c.participants.includes(agentId);
    }
    
    return conversations;
  }
}

// Multi-agent orchestration
export interface TeamworkSession {
  id: string;
  name: string;
  goal: string;
  agents: Agent[];
  conversations: Conversation[];
  status:'planning'|'executing'|'completed';
  createdAt: Date;
}

export class TeamworkOrchestrator {
  private sessions: Map<string, TeamworkSession> = new Map();
  private conversationManager: ConversationManager;

  constructor() {
    this.conversationManager = new ConversationManager();
  }

  async createSession(name: string, goal: string, agents: Agent[]): Promise<TeamworkSession> {
    // Register all agents
    for (const agent of agents) {
      await this.conversationManager.registerAgent(agent);
    }

    const session: TeamworkSession = {
      id: Math.random().toString(36),
      name,
      goal,
      agents,
      conversations: [],
      status:'planning,
      createdAt: new Date()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async startCollaboration(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Create main conversation
    const agentIds = session.agents.map(a => a.id);
    const conversation = await this.conversationManager.createConversation(
      `${{session.name} - Main Discussion}`,
      agentIds
    );

    session.conversations.push(conversation);
    session.status = 'executing';
  }

  getSession(id: string): TeamworkSession| undefined {
    return this.sessions.get(id);
  }

  getConversationManager(): ConversationManager {
    return this.conversationManager;
  }
}

// Memory management for conversations
export interface ConversationMemory {
  conversationId: string;
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  participants: string[];
  lastUpdated: Date;
}

export class ConversationMemoryManager {
  private memories: Map<string, ConversationMemory> = new Map();

  async storeMemory(memory: ConversationMemory): Promise<void> {
    this.memories.set(memory.conversationId, memory);
  }

  async getMemory(conversationId: string): Promise<ConversationMemory| undefined> {
    return this.memories.get(conversationId);
  }

  async updateMemory(conversationId: string, updates: Partial<ConversationMemory>): Promise<void> {
    const existing = this.memories.get(conversationId);
    if (existing) {
      this.memories.set(conversationId, { ...existing, ...updates, lastUpdated: new Date() });
    }
  }
}

// Factory functions
export function createConversationManager(): ConversationManager {
  return new ConversationManager();
}

export function createTeamworkOrchestrator(): TeamworkOrchestrator {
  return new TeamworkOrchestrator();
}

export function createConversationMemoryManager(): ConversationMemoryManager {
  return new ConversationMemoryManager();
}

// Legacy compatibility
export { ConversationManager as TeamworkManager };
export { TeamworkOrchestrator as MultiAgentOrchestrator };