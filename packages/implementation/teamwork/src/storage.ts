/**
 * Teamwork Storage using @claude-zen/foundation Infrastructure
 *
 * Production-ready persistence using the existing database infrastructure.
 * Integrates with @claude-zen/foundation for proper logging, config, and database access.
 */

import { getLogger, Storage } from '@claude-zen/foundation';

import type { ConversationSession, ConversationMessage } from './types';

const logger = getLogger('teamwork-storage');'

/**
 * Production storage manager for teamwork system
 */
export class TeamworkStorage {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info(
        'Initializing teamwork storage with foundation infrastructure...''
      );
      this.initialized = true;
      logger.info('✅ Teamwork storage initialized successfully');'
    } catch (error) {
      logger.error('Failed to initialize teamwork storage:', error);'
      throw error;
    }
  }

  /**
   * Store conversation session using foundation KV storage
   */
  async storeSession(session: ConversationSession): Promise<void> {
    await this.ensureInitialized();

    try {
      const kv = await Storage.getNamespacedKV('teamwork');'
      // Ensure session is serializable as Record<string, unknown>
      const sessionData: Record<string, unknown> = {
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        messages: session.messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
        outcomes: session.outcomes.map((outcome) => ({
          ...outcome,
          timestamp: outcome.timestamp.toISOString(),
        })),
      };
      await kv.set(`session:${session.id}`, sessionData);`
      logger.debug(`Stored conversation session: ${session.id}`);`
    } catch (error) {
      logger.error(`Failed to store session ${session.id}:`, error);`
      throw error;
    }
  }

  /**
   * Retrieve conversation session
   */
  async getSession(sessionId: string): Promise<ConversationSession|null> {
    await this.ensureInitialized();

    try {
      const kv = await Storage.getNamespacedKV('teamwork');'
      const sessionData = await kv.get(`session:${sessionId}`);`

      if (sessionData && typeof sessionData === 'object') {'
        const data = sessionData as Record<string, unknown>;

        // Deserialize dates and reconstruct proper ConversationSession object
        return {
          ...data,
          startTime: new Date(data['startTime'] as string),
          endTime: data['endTime']'
            ? new Date(data['endTime'] as string)'
            : undefined,
          messages:
            (data['messages'] as any[])?.map((msg) => ({'
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))||[],
          outcomes:
            (data['outcomes'] as any[])?.map((outcome) => ({'
              ...outcome,
              timestamp: new Date(outcome.timestamp),
            }))||[],
        } as ConversationSession;
      }

      return null;
    } catch (error) {
      logger.error(`Failed to retrieve session ${sessionId}:`, error);`
      return null;
    }
  }

  /**
   * Store conversation message using foundation SQL storage
   */
  async storeMessage(message: ConversationMessage): Promise<void> {
    await this.ensureInitialized();

    try {
      const sql = await Storage.getNamespacedSQL('teamwork');'
      // Store message in SQL database - implementation will depend on specific SQL adapter
      await sql.query(
        'INSERT OR REPLACE INTO messages VALUES (?, ?, ?, ?, ?, ?)',
        [
          message.id,
          message.conversationId,
          message.fromAgent.id,
          JSON.stringify(message.content),
          message.timestamp.toISOString(),
          JSON.stringify(message.metadata||{}),
        ]
      );
      logger.debug(`Stored message: ${message.id}`);`
    } catch (error) {
      logger.error(`Failed to store message ${message.id}:`, error);`
      throw error;
    }
  }

  /**
   * Retrieve messages for a session
   */
  async getMessages(
    sessionId: string,
    limit = 100
  ): Promise<ConversationMessage[]> {
    await this.ensureInitialized();

    try {
      const sql = await Storage.getNamespacedSQL('teamwork');'
      const results = await sql.query(
        'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp DESC LIMIT ?',
        [sessionId, limit]
      );

      return results.map((row: any) => ({
        id: row.id,
        conversationId: row.conversationId,
        fromAgent: {
          id: row.agentId,
          type: 'coordinator',
          swarmId: 'default',
          instance: 0,
        }, // Reconstruct AgentId
        toAgent: undefined, // Will need to be stored if needed
        timestamp: new Date(row.timestamp),
        content: JSON.parse(row.content||'{}'),
        messageType: 'system_notification', // Default type'
        metadata: JSON.parse(row.metadata||'{}'),
      })) as ConversationMessage[];
    } catch (error) {
      logger.error(
        `Failed to retrieve messages for session ${sessionId}:`,`
        error
      );
      return [];
    }
  }

  /**
   * Clear storage (for cleanup/testing)
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    try {
      const kv = await Storage.getNamespacedKV('teamwork');'
      await kv.clear();

      const sql = await Storage.getNamespacedSQL('teamwork');'
      await sql.query('DELETE FROM messages WHERE 1=1'); // Clear all messages safely'

      logger.info('Cleared teamwork storage');'
    } catch (error) {
      logger.error('Failed to clear teamwork storage:', error);'
      throw error;
    }
  }

  /**
   * Update conversation session with partial data - forward compatibility extension
   */
  async updateSession(
    sessionId: string,
    updates: Partial<ConversationSession>
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      const existingSession = await this.getSession(sessionId);
      if (!existingSession) {
        logger.warn(`Session ${sessionId} not found for update`);`
        return;
      }

      // Merge updates with existing session
      const updatedSession: ConversationSession = {
        ...existingSession,
        ...updates,
        id: sessionId, // Ensure ID doesn't get overwritten'
      };

      await this.storeSession(updatedSession);
      logger.debug(`Updated session: ${sessionId}`);`
    } catch (error) {
      logger.error(`Failed to update session ${sessionId}:`, error);`
      throw error;
    }
  }

  /**
   * Add a message to a conversation - forward compatibility extension
   */
  async addMessage(
    conversationId: string,
    message: ConversationMessage
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.storeMessage(message);
      logger.debug(
        `Added message ${message.id} to conversation ${conversationId}``
      );
    } catch (error) {
      logger.error(
        `Failed to add message to conversation ${conversationId}:`,`
        error
      );
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export singleton instance
export const teamworkStorage = new TeamworkStorage();
export default teamworkStorage;

// Extend to support index.ts exports - forward compatibility
export const conversationStorage = teamworkStorage;
export const getConversationStorage = () => teamworkStorage;
export const getTeamworkStorage = () => teamworkStorage;
