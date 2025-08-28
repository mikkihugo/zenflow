/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 * 
 * Event-driven teamwork implementation that optionally integrates with SPARC.
 * Provides multi-agent coordination with graceful SPARC integration.
 */
import { EventBus, getLogger } from '@claude-zen/foundation';
const logger = getLogger('Teamwork');

// Agent conversation types
export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline';
}

export interface ConversationMessage {
  id: string;
  fromAgent: string;
  toAgent?: string; // undefined for broadcast
  content: string;
  timestamp: Date;
  type: 'request' | 'response' | 'notification' | 'broadcast';
}

export interface Conversation {
  id: string;
  name: string;
  participants: string[]; // agent IDs
  messages: ConversationMessage[];
  status: 'active' | 'completed' | 'paused';
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
  private conversations = new Map<string, Conversation>();
  private agents = new Map<string, Agent>();
  private sparcReviews = new Map<string, SPARCCollaborationRequest>();

  constructor() {
    super();
    
    // Listen for SPARC collaboration requests (optional - only if SPARC active)
    this.on('sparc:collaboration:request', async (request: SPARCCollaborationRequest) => {
      const conversationName = `SPARC ${request.phase} Review - ${request.projectId}`;
      const conversation = await this.createConversation(conversationName, request.suggestedAgents);
      
      // Store SPARC review context
      this.sparcReviews.set(conversation.id, request);
      
      // Add initial context message
      await this.addMessage(conversation.id, {
        fromAgent: 'system',
        content: `SPARC ${request.phase} phase review requested. Context: ${JSON.stringify(request.context, null, 2)}`,
        type: 'notification'
      });
      
      // Simulate review process (in real implementation, this would be actual agent conversations)
      setTimeout(() => {
        this.completeSPARCReview(conversation.id, true, ['Phase looks good'], ['Continue to next phase']);
      }, 5000); // 5 second simulated review
      
      logger.info(`Created SPARC review conversation: ${conversation.id}`);
    });
  }

  /**
   * Create a new conversation
   */
  async createConversation(name: string, participantIds: string[]): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      name,
      participants: participantIds,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations.set(conversation.id, conversation);
    this.emit('conversationCreated', conversation);
    
    return conversation;
  }

  /**
   * Add message to conversation
   */
  async addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<ConversationMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const fullMessage: ConversationMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date()
    };

    conversation.messages.push(fullMessage);
    conversation.updatedAt = new Date();
    
    this.emit('messageAdded', { conversationId, message: fullMessage });
    
    return fullMessage;
  }

  /**
   * Send message to conversation
   */
  async sendMessage(params: {
    conversationId: string;
    fromAgent: string;
    content: string;
    toAgent?: string;
    type?: ConversationMessage['type'];
  }): Promise<ConversationMessage> {
    const { type = 'request' } = params;
    
    const conversation = this.conversations.get(params.conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${params.conversationId}`);
    }

    const message: ConversationMessage = {
      id: this.generateMessageId(),
      fromAgent: params.fromAgent,
      toAgent: params.toAgent,
      content: params.content,
      type,
      timestamp: new Date()
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date();
    
    this.emit('messageSent', { conversationId: params.conversationId, message });
    
    return message;
  }

  /**
   * Get conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  /**
   * List conversations, optionally filtered by agent
   */
  listConversations(agentId?: string): Conversation[] {
    const conversations = Array.from(this.conversations.values());
    
    if (agentId) {
      return conversations.filter(c => c.participants.includes(agentId));
    }
    
    return conversations;
  }

  /**
   * Complete SPARC review
   */
  private completeSPARCReview(conversationId: string, approved: boolean, feedback: string[], recommendations: string[]): void {
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

    this.emit('sparc:review:completed', result);
    this.sparcReviews.delete(conversationId);
  }

  /**
   * Generate conversation ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Multi-agent orchestration
export interface TeamworkSession {
  id: string;
  name: string;
  agents: Agent[];
  conversations: Conversation[];
  status: 'idle' | 'executing' | 'completed';
  createdAt: Date;
}

export class TeamworkOrchestrator {
  private sessions = new Map<string, TeamworkSession>();
  private conversationManager = new ConversationManager();

  /**
   * Create teamwork session
   */
  async createSession(name: string, agents: Agent[]): Promise<TeamworkSession> {
    const session: TeamworkSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      agents,
      conversations: [],
      status: 'idle',
      createdAt: new Date()
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Start collaboration session
   */
  async startCollaboration(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const agentIds = session.agents.map(a => a.id);
    const conversation = await this.conversationManager.createConversation(
      `${session.name} - Main Discussion`,
      agentIds
    );
    
    session.conversations.push(conversation);
    session.status = 'executing';
  }

  /**
   * Get session by ID
   */
  getSession(id: string): TeamworkSession | undefined {
    return this.sessions.get(id);
  }
}

export class ConversationMemoryManager {
  private memories = new Map<string, any>();

  /**
   * Store memory for conversation
   */
  async storeMemory(memory: { conversationId: string; key: string; value: any }): Promise<void> {
    const existing = this.memories.get(memory.conversationId) || {};
    const updates = { [memory.key]: memory.value };
    
    this.memories.set(memory.conversationId, { ...existing, ...updates, lastUpdated: new Date() });
  }

  /**
   * Retrieve memory for conversation
   */
  getMemory(conversationId: string, key?: string): any {
    const memory = this.memories.get(conversationId);
    return key ? memory?.[key] : memory;
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