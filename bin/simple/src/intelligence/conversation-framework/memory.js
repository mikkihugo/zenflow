import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('intelligence-conversation-framework-memory');
class MemoryBackendAdapter {
    backend;
    constructor(backend) {
        this.backend = backend;
    }
    async save(key, data) {
        try {
            await this.backend.store(key, data, 'conversations');
        }
        catch (error) {
            logger.error(`Failed to save conversation data for key ${key}:`, error);
            throw new Error(`Memory save operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async get(key) {
        try {
            return await this.backend.retrieve(key, 'conversations');
        }
        catch (error) {
            logger.error(`Failed to retrieve conversation data for key ${key}:`, error);
            return null;
        }
    }
    async delete(key) {
        try {
            await this.backend.delete(key, 'conversations');
        }
        catch (error) {
            logger.error(`Failed to delete conversation data for key ${key}:`, error);
            throw new Error(`Memory delete operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async search(pattern) {
        try {
            return await this.backend.search(pattern, 'conversations');
        }
        catch (error) {
            logger.error(`Failed to search conversation data for pattern ${pattern}:`, error);
            return {};
        }
    }
}
export class ConversationMemoryImpl {
    adapter;
    constructor(backend) {
        this.adapter = new MemoryBackendAdapter(backend);
        this.initializeSchema();
    }
    async initializeSchema() {
    }
    async storeConversation(session) {
        const key = `conversation:${session.id}`;
        const data = {
            ...session,
            messages: JSON.stringify(session.messages),
            participants: JSON.stringify(session.participants),
            outcomes: JSON.stringify(session.outcomes),
            metrics: JSON.stringify(session.metrics),
            context: JSON.stringify(session.context),
        };
        await this.adapter.save(key, data);
        for (const participant of session.participants) {
            const agentKey = `agent_conversations:${participant.id}`;
            const agentConversations = (await this.adapter.get(agentKey)) || [];
            if (!agentConversations.includes(session.id)) {
                agentConversations.push(session.id);
                await this.adapter.save(agentKey, agentConversations);
            }
        }
        const patternKey = `pattern_conversations:${session.context.domain}`;
        const patternConversations = (await this.adapter.get(patternKey)) || [];
        if (!patternConversations.includes(session.id)) {
            patternConversations.push(session.id);
            await this.adapter.save(patternKey, patternConversations);
        }
    }
    async getConversation(id) {
        const key = `conversation:${id}`;
        const data = await this.adapter.get(key);
        if (!data) {
            return null;
        }
        return {
            ...data,
            messages: JSON.parse(data?.messages || '[]'),
            participants: JSON.parse(data?.participants || '[]'),
            outcomes: JSON.parse(data?.outcomes || '[]'),
            metrics: JSON.parse(data?.metrics || '{}'),
            context: JSON.parse(data?.context || '{}'),
            startTime: new Date(data?.startTime),
            endTime: data?.endTime ? new Date(data?.endTime) : undefined,
        };
    }
    async searchConversations(query) {
        const results = [];
        const limit = query.limit || 50;
        const offset = query.offset || 0;
        if (query.agentId) {
            const agentKey = `agent_conversations:${query.agentId}`;
            const conversationIds = (await this.adapter.get(agentKey)) || [];
            for (const id of conversationIds.slice(offset, offset + limit)) {
                const conversation = await this.getConversation(id);
                if (conversation && this.matchesQuery(conversation, query)) {
                    results.push(conversation);
                }
            }
            return results;
        }
        if (query.pattern) {
            const patternKey = `pattern_conversations:${query.pattern}`;
            const conversationIds = (await this.adapter.get(patternKey)) || [];
            for (const id of conversationIds.slice(offset, offset + limit)) {
                const conversation = await this.getConversation(id);
                if (conversation && this.matchesQuery(conversation, query)) {
                    results.push(conversation);
                }
            }
            return results;
        }
        return results;
    }
    async updateConversation(id, updates) {
        const existing = await this.getConversation(id);
        if (!existing) {
            throw new Error(`Conversation ${id} not found`);
        }
        const updated = { ...existing, ...updates };
        await this.storeConversation(updated);
    }
    async deleteConversation(id) {
        const conversation = await this.getConversation(id);
        if (!conversation) {
            return;
        }
        const key = `conversation:${id}`;
        await this.adapter.delete(key);
        for (const participant of conversation.participants) {
            const agentKey = `agent_conversations:${participant.id}`;
            const agentConversations = (await this.adapter.get(agentKey)) || [];
            const filtered = agentConversations.filter((cId) => cId !== id);
            await this.adapter.save(agentKey, filtered);
        }
        const patternKey = `pattern_conversations:${conversation.context.domain}`;
        const patternConversations = (await this.adapter.get(patternKey)) || [];
        const filtered = patternConversations.filter((cId) => cId !== id);
        await this.adapter.save(patternKey, filtered);
    }
    async getAgentConversationHistory(agentId) {
        return this.searchConversations({ agentId });
    }
    matchesQuery(conversation, query) {
        if (query.domain && conversation.context.domain !== query.domain) {
            return false;
        }
        if (query.status && conversation.status !== query.status) {
            return false;
        }
        if (query.dateRange) {
            const start = conversation.startTime;
            if (start < query.dateRange.start || start > query.dateRange.end) {
                return false;
            }
        }
        if (query.outcome) {
            const hasOutcome = conversation.outcomes.some((o) => o.type === query.outcome);
            if (!hasOutcome) {
                return false;
            }
        }
        return true;
    }
}
export class ConversationMemoryFactory {
    static async createWithSQLite(config = {}) {
        const { MemoryBackendFactory } = await import('../../memory/backends/factory.ts');
        const backend = await MemoryBackendFactory.createBackend('sqlite', {
            type: 'sqlite',
            path: config?.path || './data',
            ...config,
        });
        return new ConversationMemoryImpl(backend);
    }
    static async createWithJSON(config = {}) {
        const { MemoryBackendFactory } = await import('../../memory/backends/factory.ts');
        const backend = await MemoryBackendFactory.createBackend('jsonb', {
            type: 'jsonb',
            path: config?.basePath || '/tmp/conversations',
            ...config,
        });
        return new ConversationMemoryImpl(backend);
    }
    static async createWithLanceDB(config = {}) {
        const { MemoryBackendFactory } = await import('../../memory/backends/factory.ts');
        const backend = await MemoryBackendFactory.createBackend('sqlite', {
            type: 'sqlite',
            path: config?.path || './data',
            ...config,
        });
        return new ConversationMemoryImpl(backend);
    }
}
//# sourceMappingURL=memory.js.map