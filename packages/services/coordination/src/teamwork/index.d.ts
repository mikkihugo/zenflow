/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 *
 * Clean teamwork implementation for multi-agent coordination
 */
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
export declare class ConversationManager {
    private conversations;
    private agents;
    registerAgent(agent: Agent): void;
    createConversation(name: string, participantIds: string[]): Promise<Conversation>;
    sendMessage(params: {
        conversationId: string;
        fromAgentId: string;
        content: string;
        toAgentId?: string;
        type?: ConversationMessage['type'];
    }): Promise<ConversationMessage>;
    getConversation(id: string): Conversation | undefined;
    getConversations(agentId?: string): Conversation[];
}
export interface TeamworkSession {
    id: string;
    name: string;
    goal: string;
    agents: Agent[];
    conversations: Conversation[];
    status: 'planning' | 'executing' | 'completed';
    createdAt: Date;
}
export declare class TeamworkOrchestrator {
    private sessions;
    private conversationManager;
    constructor();
    createSession(name: string, goal: string, agents: Agent[]): Promise<TeamworkSession>;
    startCollaboration(sessionId: string): Promise<void>;
    getSession(id: string): TeamworkSession | undefined;
    getConversationManager(): ConversationManager;
}
export interface ConversationMemory {
    conversationId: string;
    summary: string;
    keyDecisions: string[];
    actionItems: string[];
    participants: string[];
    lastUpdated: Date;
}
export declare class ConversationMemoryManager {
    private memories;
    storeMemory(memory: ConversationMemory): Promise<void>;
    getMemory(conversationId: string): Promise<ConversationMemory | undefined>;
    updateMemory(conversationId: string, updates: Partial<ConversationMemory>): Promise<void>;
}
export declare function createConversationManager(): ConversationManager;
export declare function createTeamworkOrchestrator(): TeamworkOrchestrator;
export declare function createConversationMemoryManager(): ConversationMemoryManager;
export { ConversationManager as TeamworkManager };
export { TeamworkOrchestrator as MultiAgentOrchestrator };
//# sourceMappingURL=index.d.ts.map