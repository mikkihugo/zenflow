/**
 * Conversation Memory Backend
 * 
 * Memory management for conversation persistence using existing memory backends
 */

import {
  ConversationMemory,
  ConversationSession,
  ConversationQuery,
  ConversationStatus
} from './types.js';

/**
 * Conversation memory implementation using SQLite backend
 */
export class ConversationMemoryImpl implements ConversationMemory {
  private backend: any;

  constructor(backend: any) {
    this.backend = backend;
    this.initializeSchema();
  }

  /**
   * Initialize database schema for conversations
   */
  private async initializeSchema(): Promise<void> {
    // This would typically be handled by migration system
    // For now, we'll assume the schema exists
  }

  /**
   * Store a conversation session
   */
  async storeConversation(session: ConversationSession): Promise<void> {
    const key = `conversation:${session.id}`;
    const data = {
      ...session,
      // Serialize complex objects
      messages: JSON.stringify(session.messages),
      participants: JSON.stringify(session.participants),
      outcomes: JSON.stringify(session.outcomes),
      metrics: JSON.stringify(session.metrics),
      context: JSON.stringify(session.context)
    };

    await this.backend.save(key, data);

    // Index by agent for quick agent history lookups
    for (const participant of session.participants) {
      const agentKey = `agent_conversations:${participant.id}`;
      const agentConversations = await this.backend.get(agentKey) || [];
      if (!agentConversations.includes(session.id)) {
        agentConversations.push(session.id);
        await this.backend.save(agentKey, agentConversations);
      }
    }

    // Index by pattern for pattern analysis
    const patternKey = `pattern_conversations:${session.context.domain}`;
    const patternConversations = await this.backend.get(patternKey) || [];
    if (!patternConversations.includes(session.id)) {
      patternConversations.push(session.id);
      await this.backend.save(patternKey, patternConversations);
    }
  }

  /**
   * Retrieve a conversation by ID
   */
  async getConversation(id: string): Promise<ConversationSession | null> {
    const key = `conversation:${id}`;
    const data = await this.backend.get(key);
    
    if (!data) {
      return null;
    }

    // Deserialize complex objects
    return {
      ...data,
      messages: JSON.parse(data.messages || '[]'),
      participants: JSON.parse(data.participants || '[]'),
      outcomes: JSON.parse(data.outcomes || '[]'),
      metrics: JSON.parse(data.metrics || '{}'),
      context: JSON.parse(data.context || '{}'),
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined
    };
  }

  /**
   * Search conversations based on query parameters
   */
  async searchConversations(query: ConversationQuery): Promise<ConversationSession[]> {
    const results: ConversationSession[] = [];
    const limit = query.limit || 50;
    const offset = query.offset || 0;

    // If searching by agent ID, use agent index
    if (query.agentId) {
      const agentKey = `agent_conversations:${query.agentId}`;
      const conversationIds = await this.backend.get(agentKey) || [];
      
      for (const id of conversationIds.slice(offset, offset + limit)) {
        const conversation = await this.getConversation(id);
        if (conversation && this.matchesQuery(conversation, query)) {
          results.push(conversation);
        }
      }
      return results;
    }

    // If searching by pattern, use pattern index
    if (query.pattern) {
      const patternKey = `pattern_conversations:${query.pattern}`;
      const conversationIds = await this.backend.get(patternKey) || [];
      
      for (const id of conversationIds.slice(offset, offset + limit)) {
        const conversation = await this.getConversation(id);
        if (conversation && this.matchesQuery(conversation, query)) {
          results.push(conversation);
        }
      }
      return results;
    }

    // General search would require scanning all conversations
    // In a real implementation, this would use proper indexing
    return results;
  }

  /**
   * Update a conversation
   */
  async updateConversation(id: string, updates: Partial<ConversationSession>): Promise<void> {
    const existing = await this.getConversation(id);
    if (!existing) {
      throw new Error(`Conversation ${id} not found`);
    }

    const updated = { ...existing, ...updates };
    await this.storeConversation(updated);
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    const conversation = await this.getConversation(id);
    if (!conversation) {
      return;
    }

    // Remove from main storage
    const key = `conversation:${id}`;
    await this.backend.delete(key);

    // Remove from agent indexes
    for (const participant of conversation.participants) {
      const agentKey = `agent_conversations:${participant.id}`;
      const agentConversations = await this.backend.get(agentKey) || [];
      const filtered = agentConversations.filter((cId: string) => cId !== id);
      await this.backend.save(agentKey, filtered);
    }

    // Remove from pattern index
    const patternKey = `pattern_conversations:${conversation.context.domain}`;
    const patternConversations = await this.backend.get(patternKey) || [];
    const filtered = patternConversations.filter((cId: string) => cId !== id);
    await this.backend.save(patternKey, filtered);
  }

  /**
   * Get all conversations for a specific agent
   */
  async getAgentConversationHistory(agentId: string): Promise<ConversationSession[]> {
    return this.searchConversations({ agentId });
  }

  /**
   * Check if conversation matches query criteria
   */
  private matchesQuery(conversation: ConversationSession, query: ConversationQuery): boolean {
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
      const hasOutcome = conversation.outcomes.some(o => o.type === query.outcome);
      if (!hasOutcome) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Factory for creating conversation memory instances
 */
export class ConversationMemoryFactory {
  /**
   * Create conversation memory with SQLite backend
   */
  static async createWithSQLite(config: any = {}): Promise<ConversationMemory> {
    const { SQLiteBackend } = await import('../../memory/backends/sqlite.backend.js');
    const backend = new SQLiteBackend(config);
    return new ConversationMemoryImpl(backend);
  }

  /**
   * Create conversation memory with JSON backend
   */
  static async createWithJSON(config: any = {}): Promise<ConversationMemory> {
    const { JSONBackend } = await import('../../memory/backends/json.backend.js');
    const backend = new JSONBackend(config);
    return new ConversationMemoryImpl(backend);
  }

  /**
   * Create conversation memory with LanceDB backend for vector search
   */
  static async createWithLanceDB(config: any = {}): Promise<ConversationMemory> {
    const { LanceDBBackend } = await import('../../memory/backends/lancedb.backend.js');
    const backend = new LanceDBBackend(config);
    return new ConversationMemoryImpl(backend);
  }
}