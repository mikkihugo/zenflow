/**
 * @file Memory implementation.
 */
/**
 * Conversation Memory Backend.
 *
 * Memory management for conversation persistence using existing memory backends.
 */
import type { ConversationMemory, ConversationQuery, ConversationSession } from './types.ts';
/**
 * Conversation memory implementation using backend storage.
 *
 * @example
 */
export declare class ConversationMemoryImpl implements ConversationMemory {
    private adapter;
    constructor(backend: any);
    /**
     * Initialize database schema for conversations.
     */
    private initializeSchema;
    /**
     * Store a conversation session.
     *
     * @param session
     */
    storeConversation(session: ConversationSession): Promise<void>;
    /**
     * Retrieve a conversation by ID.
     *
     * @param id
     */
    getConversation(id: string): Promise<ConversationSession | null>;
    /**
     * Search conversations based on query parameters.
     *
     * @param query
     */
    searchConversations(query: ConversationQuery): Promise<ConversationSession[]>;
    /**
     * Update a conversation.
     *
     * @param id
     * @param updates
     */
    updateConversation(id: string, updates: Partial<ConversationSession>): Promise<void>;
    /**
     * Delete a conversation.
     *
     * @param id
     */
    deleteConversation(id: string): Promise<void>;
    /**
     * Get all conversations for a specific agent.
     *
     * @param agentId
     */
    getAgentConversationHistory(agentId: string): Promise<ConversationSession[]>;
    /**
     * Check if conversation matches query criteria.
     *
     * @param conversation
     * @param query
     */
    private matchesQuery;
}
/**
 * Factory for creating conversation memory instances.
 *
 * @example
 */
export declare class ConversationMemoryFactory {
    /**
     * Create conversation memory with SQLite backend.
     *
     * @param config
     */
    static createWithSQLite(config?: any): Promise<ConversationMemory>;
    /**
     * Create conversation memory with JSON backend.
     *
     * @param config
     */
    static createWithJSON(config?: any): Promise<ConversationMemory>;
    /**
     * Create conversation memory with LanceDB backend for vector search.
     *
     * @param config
     */
    static createWithLanceDB(config?: any): Promise<ConversationMemory>;
}
//# sourceMappingURL=memory.d.ts.map