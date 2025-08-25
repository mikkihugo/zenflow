/**
 * @fileoverview Conversation Memory Implementation
 *
 * Basic conversation memory implementation for testing and development.
 */

import type {
  ConversationMemory,
  ConversationSession,
  ConversationQuery,
} from './types';

/**
 * In-memory conversation storage for testing
 */
export class InMemoryConversationMemory implements ConversationMemory {
  private conversations = new Map<string, ConversationSession>();

  async storeConversation(session: ConversationSession): Promise<void> {
    this.conversations.set(session.id, session);
  }

  async getConversation(id: string): Promise<ConversationSession | null> {
    return this.conversations.get(id) || null;
  }

  async searchConversations(
    query: ConversationQuery
  ): Promise<ConversationSession[]> {
    const allConversations = Array.from(this.conversations.values())();

    return allConversations
      .filter((conversation) => {
        // Filter by agent ID
        if (query.agentId) {
          const hasAgent = conversation.participants.some(
            (p) => p.id === query.agentId
          );
          if (!hasAgent) return false;
        }

        // Filter by pattern
        if (
          query.pattern &&
          !conversation.context.domain.includes(query.pattern)
        ) {
          return false;
        }

        // Filter by domain
        if (query.domain && conversation.context.domain !== query.domain) {
          return false;
        }

        // Filter by status
        if (query.status && conversation.status !== query.status) {
          return false;
        }

        return true;
      })
      .slice(
        query.offset || 0,
        query.limit ? (query.offset || 0) + query.limit : undefined
      );
  }

  async updateConversation(
    id: string,
    updates: Partial<ConversationSession>
  ): Promise<void> {
    const existing = this.conversations.get(id);
    if (!existing) {
      throw new Error(`Conversation ${id} not found`);`
    }

    const updated = { ...existing, ...updates };
    this.conversations.set(id, updated);
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
  }

  async getAgentConversationHistory(
    agentId: string
  ): Promise<ConversationSession[]> {
    return this.searchConversations({ agentId });
  }
}
