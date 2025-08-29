/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 *
 * Event-driven teamwork implementation that optionally integrates with SPARC.
 * Provides multi-agent coordination with graceful SPARC integration.
 */
import { EventBus } from '@claude-zen/foundation';
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
    toAgent?: string;
    content: string;
    timestamp: Date;
    type: 'request' | 'response' | 'notification' | 'broadcast';
}
export interface Conversation {
    id: string;
    name: string;
    participants: string[];
    messages: ConversationMessage[];
    status: 'active' | 'completed' | 'paused';
    createdAt: Date;
    updatedAt: Date;
}
export interface SPARCCollaborationRequest {
    requestId: string;
    projectId: string;
    phase: string;
    requiresReview: boolean;
    suggestedAgents: string[];
    context:  {
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
/**
 * Event-driven Conversation Manager with optional SPARC integration
 */
export declare class ConversationManager extends EventBus {
    private conversations;
    private agents;
    private sparcReviews;
    constructor();
    /**
     * Create a new conversation
     */
    createConversation(name: string, participantIds: string[]): Promise<Conversation>;
    /**
     * Add message to conversation
     */
    addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<ConversationMessage>;
    /**
     * Send message to conversation
     */
    sendMessage(params:  {
        conversationId: string;
        fromAgent: string;
        content: string;
        toAgent?: string;
        type?: ConversationMessage['type'];
    }): Promise<ConversationMessage>;
    /**
     * Get conversation by ID
     */
    getConversation(id: string): Conversation | undefined;
    /**
     * List conversations, optionally filtered by agent
     */
    listConversations(agentId?: string): Conversation[];
    /**
     * Complete SPARC review
     */
    private completeSPARCReview;
    /**
     * Generate conversation ID
     */
    private generateConversationId;
    /**
     * Generate message ID
     */
    private generateMessageId;
}
export interface TeamworkSession {
    id: string;
    name: string;
    agents: Agent[];
    conversations: Conversation[];
    status: 'idle' | 'executing' | 'completed';
    createdAt: Date;
}
export declare class TeamworkOrchestrator {
    private sessions;
    private conversationManager;
    /**
     * Create teamwork session
     */
    createSession(name: string, agents: Agent[]): Promise<TeamworkSession>;
    /**
     * Start collaboration session
     */
    startCollaboration(sessionId: string): Promise<void>;
    /**
     * Get session by ID
     */
    getSession(id: string): TeamworkSession | undefined;
}
export declare class ConversationMemoryManager {
    private memories;
    /**
     * Store memory for conversation
     */
    storeMemory(memory:  {
        conversationId: string;
        key: string;
        value: any;
    }): Promise<void>;
    /**
     * Retrieve memory for conversation
     */
    getMemory(conversationId: string, key?: string): any;
}
export declare function createConversationManager(): ConversationManager;
export declare function createTeamworkOrchestrator(): TeamworkOrchestrator;
export declare function createConversationMemoryManager(): ConversationMemoryManager;
export { ConversationManager as TeamworkManager };
export { TeamworkOrchestrator as MultiAgentOrchestrator };
//# sourceMappingURL=index.d.ts.map