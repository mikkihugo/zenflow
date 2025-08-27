/**
 * @fileoverview Teamwork Domain - Multi-Agent Conversation and Collaboration
 *
 * Clean teamwork implementation for multi-agent coordination
 */
// Conversation management
export class ConversationManager {
    conversations = new Map();
    agents = new Map();
    registerAgent(agent) {
        this.agents.set(agent.id, agent);
    }
    async createConversation(name, participantIds) {
        const conversation = {
            id: Math.random().toString(36),
            name,
            participants: participantIds,
            messages: [],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.conversations.set(conversation.id, conversation);
        return conversation;
    }
    async sendMessage(params) {
        const { conversationId, fromAgentId, content, toAgentId, type = 'request' } = params;
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation not found: ${conversationId}`);
        }
        const message = {
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
    getConversation(id) {
        return this.conversations.get(id);
    }
    getConversations(agentId) {
        const conversations = Array.from(this.conversations.values());
        if (agentId) {
            return conversations.filter(c => c.participants.includes(agentId));
        }
        return conversations;
    }
}
export class TeamworkOrchestrator {
    sessions = new Map();
    conversationManager;
    constructor() {
        this.conversationManager = new ConversationManager();
    }
    async createSession(name, goal, agents) {
        // Register all agents
        for (const agent of agents) {
            await this.conversationManager.registerAgent(agent);
        }
        const session = {
            id: Math.random().toString(36),
            name,
            goal,
            agents,
            conversations: [],
            status: 'planning',
            createdAt: new Date()
        };
        this.sessions.set(session.id, session);
        return session;
    }
    async startCollaboration(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // Create main conversation
        const agentIds = session.agents.map(a => a.id);
        const conversation = await this.conversationManager.createConversation(`${session.name} - Main Discussion`, agentIds);
        session.conversations.push(conversation);
        session.status = 'executing';
    }
    getSession(id) {
        return this.sessions.get(id);
    }
    getConversationManager() {
        return this.conversationManager;
    }
}
export class ConversationMemoryManager {
    memories = new Map();
    async storeMemory(memory) {
        this.memories.set(memory.conversationId, memory);
    }
    async getMemory(conversationId) {
        return this.memories.get(conversationId);
    }
    async updateMemory(conversationId, updates) {
        const existing = this.memories.get(conversationId);
        if (existing) {
            this.memories.set(conversationId, { ...existing, ...updates, lastUpdated: new Date() });
        }
    }
}
// Factory functions
export function createConversationManager() {
    return new ConversationManager();
}
export function createTeamworkOrchestrator() {
    return new TeamworkOrchestrator();
}
export function createConversationMemoryManager() {
    return new ConversationMemoryManager();
}
// Legacy compatibility
export { ConversationManager as TeamworkManager };
export { TeamworkOrchestrator as MultiAgentOrchestrator };
