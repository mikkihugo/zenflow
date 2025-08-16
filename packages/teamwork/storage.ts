/**
 * Teamwork Storage using @claude-zen/foundation Infrastructure
 * 
 * Production-ready persistence using the existing database infrastructure.
 * Integrates with @claude-zen/foundation for proper logging, config, and database access.
 */

import { getLogger, storage } from '@claude-zen/foundation';
import type { ConversationSession, ConversationMessage } from './types';

const logger = getLogger('teamwork-storage');

/**
 * Teamwork storage using production database infrastructure.
 * Uses @claude-zen/foundation storage system with proper SQLite/LanceDB/Kuzu integration.
 */
export class TeamworkStorage {
  private initialized = false;
  private kv: any = null;
  private sqliteDao: any = null;

  /**
   * Initialize storage with proper shared infrastructure
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Use @claude-zen/foundation storage system
      this.kv = await storage.getLibKV('teamwork');
      this.sqliteDao = await storage.getLibSQLite('teamwork');
      
      this.initialized = true;
      logger.info('Teamwork storage initialized with @claude-zen/foundation infrastructure');
    } catch (error) {
      logger.error('Failed to initialize teamwork storage:', error);
      throw new Error('Teamwork storage initialization failed');
    }
  }

  /**
   * Store a conversation session
   */
  async storeSession(session: ConversationSession): Promise<void> {
    await this.initialize();
    
    try {
      const sessionData = {
        id: session.id,
        title: session.title,
        description: session.description,
        status: session.status,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        participants: JSON.stringify(session.participants),
        initiator: JSON.stringify(session.initiator),
        orchestrator: JSON.stringify(session.orchestrator),
        context: JSON.stringify(session.context),
        outcomes: JSON.stringify(session.outcomes),
        metrics: JSON.stringify(session.metrics),
        messages: JSON.stringify(session.messages),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store in both KV (fast access) and SQLite (rich queries)
      await this.kv.set(`session:${session.id}`, sessionData);
      
      // Store in SQLite for complex queries
      await this.sqliteDao.createOrUpdate(
        { id: session.id },
        sessionData
      );

      // Index by participant for quick lookups
      for (const participant of session.participants) {
        const participantKey = `participant:${participant.id}`;
        const participantSessions = await this.kv.get(participantKey) || [];
        if (!participantSessions.includes(session.id)) {
          participantSessions.push(session.id);
          await this.kv.set(participantKey, participantSessions);
        }
      }

      logger.debug('Session stored successfully:', session.id);
    } catch (error) {
      logger.error('Failed to store session:', error);
      throw error;
    }
  }

  /**
   * Retrieve a conversation session by ID
   */
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    await this.initialize();
    
    try {
      // Try KV first for fast access
      let data = await this.kv.get(`session:${sessionId}`);
      
      // Fallback to SQLite if not in KV
      if (!data) {
        const results = await this.sqliteDao.findBy({ id: sessionId });
        data = results?.[0];
      }

      if (!data) {
        return null;
      }

      // Deserialize complex objects
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        participants: JSON.parse(data.participants || '[]'),
        initiator: JSON.parse(data.initiator || '{}'),
        orchestrator: JSON.parse(data.orchestrator || '{}'),
        context: JSON.parse(data.context || '{}'),
        outcomes: JSON.parse(data.outcomes || '[]'),
        metrics: JSON.parse(data.metrics || '{}'),
        messages: JSON.parse(data.messages || '[]'),
      };
    } catch (error) {
      logger.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Update a conversation session
   */
  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    await this.initialize();
    
    const existing = await this.getSession(sessionId);
    if (!existing) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updated = { ...existing, ...updates };
    await this.storeSession(updated);
  }

  /**
   * Delete a conversation session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.initialize();
    
    try {
      const session = await this.getSession(sessionId);
      
      if (session) {
        // Remove from participant indexes
        for (const participant of session.participants) {
          const participantKey = `participant:${participant.id}`;
          const participantSessions = await this.kv.get(participantKey) || [];
          const filtered = participantSessions.filter((id: any) => id !== sessionId);
          if (filtered.length > 0) {
            await this.kv.set(participantKey, filtered);
          } else {
            await this.kv.delete(participantKey);
          }
        }
      }

      // Remove from both KV and SQLite
      await this.kv.delete(`session:${sessionId}`);
      await this.sqliteDao.deleteBy({ id: sessionId });
      
      logger.debug('Session deleted successfully:', sessionId);
    } catch (error) {
      logger.error('Failed to delete session:', error);
      throw error;
    }
  }

  /**
   * Get all session IDs for a participant
   */
  async getParticipantSessions(participantId: string): Promise<string[]> {
    await this.initialize();
    
    try {
      const participantKey = `participant:${participantId}`;
      return await this.kv.get(participantKey) || [];
    } catch (error) {
      logger.warn('Failed to get participant sessions:', error);
      return [];
    }
  }

  /**
   * Get all active session IDs
   */
  async getAllSessionIds(): Promise<string[]> {
    await this.initialize();
    
    try {
      const keys = await this.kv.keys();
      return keys
        .filter((key: string) => key.startsWith('session:'))
        .map((key: string) => key.substring(8)); // Remove 'session:' prefix
    } catch (error) {
      logger.warn('Failed to get all session IDs:', error);
      return [];
    }
  }

  /**
   * Search sessions by status using SQLite for complex queries
   */
  async getSessionsByStatus(status: string): Promise<ConversationSession[]> {
    await this.initialize();
    
    try {
      const results = await this.sqliteDao.findBy({ status });
      const sessions: ConversationSession[] = [];
      
      for (const data of results) {
        const session = await this.deserializeSession(data);
        if (session) sessions.push(session);
      }
      
      return sessions;
    } catch (error) {
      logger.error('Failed to get sessions by status:', error);
      return [];
    }
  }

  /**
   * Add a message to a session
   */
  async addMessage(sessionId: string, message: ConversationMessage): Promise<void> {
    await this.initialize();
    
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.messages.push(message);
    session.metrics.messageCount++;
    session.metrics.participationByAgent[message.fromAgent.id] = 
      (session.metrics.participationByAgent[message.fromAgent.id] || 0) + 1;

    await this.storeSession(session);
  }

  /**
   * Get conversation history (messages only)
   */
  async getSessionMessages(sessionId: string): Promise<ConversationMessage[]> {
    await this.initialize();
    
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  /**
   * Search sessions by title or description using SQLite full-text search
   */
  async searchSessions(query: string): Promise<ConversationSession[]> {
    await this.initialize();
    
    try {
      // Use SQLite for full-text search capabilities
      const results = await this.sqliteDao.findBy({
        $or: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      });
      
      const sessions: ConversationSession[] = [];
      for (const data of results) {
        const session = await this.deserializeSession(data);
        if (session) sessions.push(session);
      }
      
      return sessions;
    } catch (error) {
      logger.error('Failed to search sessions:', error);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalMessages: number;
    participantCount: number;
  }> {
    await this.initialize();
    
    try {
      // Use SQLite aggregation queries for efficient stats
      const totalSessions = await this.sqliteDao.count({});
      const activeSessions = await this.sqliteDao.count({ status: 'active' });
      const completedSessions = await this.sqliteDao.count({ status: 'completed' });
      
      // Get participant count from KV keys
      const keys = await this.kv.keys();
      const participantKeys = keys.filter((key: string) => key.startsWith('participant:'));
      const participantCount = participantKeys.length;
      
      // Calculate total messages (would need optimization for large datasets)
      const sessionIds = await this.getAllSessionIds();
      let totalMessages = 0;
      for (const sessionId of sessionIds.slice(0, 100)) { // Limit for performance
        const session = await this.getSession(sessionId);
        if (session) totalMessages += session.messages.length;
      }

      return {
        totalSessions,
        activeSessions,
        completedSessions,
        totalMessages,
        participantCount,
      };
    } catch (error) {
      logger.error('Failed to get storage stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        completedSessions: 0,
        totalMessages: 0,
        participantCount: 0,
      };
    }
  }

  /**
   * Clear all conversation data (for testing/cleanup)
   */
  async clear(): Promise<void> {
    await this.initialize();
    
    try {
      await this.kv.clear();
      await this.sqliteDao.deleteBy({}); // Delete all
      logger.info('All teamwork data cleared');
    } catch (error) {
      logger.error('Failed to clear teamwork data:', error);
      throw error;
    }
  }

  /**
   * Helper to deserialize session data
   */
  private async deserializeSession(data: any): Promise<ConversationSession | null> {
    try {
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        participants: JSON.parse(data.participants || '[]'),
        initiator: JSON.parse(data.initiator || '{}'),
        orchestrator: JSON.parse(data.orchestrator || '{}'),
        context: JSON.parse(data.context || '{}'),
        outcomes: JSON.parse(data.outcomes || '[]'),
        metrics: JSON.parse(data.metrics || '{}'),
        messages: JSON.parse(data.messages || '[]'),
      };
    } catch (error) {
      logger.warn('Failed to deserialize session:', error);
      return null;
    }
  }
}

// Singleton instance
let globalStorage: TeamworkStorage | null = null;

/**
 * Get global teamwork storage instance
 */
export function getTeamworkStorage(): TeamworkStorage {
  if (!globalStorage) {
    globalStorage = new TeamworkStorage();
    logger.info('Teamwork storage singleton created');
  }
  return globalStorage;
}

/**
 * Quick access functions using proper shared infrastructure
 */
export const teamworkStorage = {
  store: (session: ConversationSession) => getTeamworkStorage().storeSession(session),
  get: (sessionId: string) => getTeamworkStorage().getSession(sessionId),
  update: (sessionId: string, updates: Partial<ConversationSession>) => 
    getTeamworkStorage().updateSession(sessionId, updates),
  delete: (sessionId: string) => getTeamworkStorage().deleteSession(sessionId),
  addMessage: (sessionId: string, message: ConversationMessage) =>
    getTeamworkStorage().addMessage(sessionId, message),
  getMessages: (sessionId: string) => getTeamworkStorage().getSessionMessages(sessionId),
  getParticipantSessions: (participantId: string) =>
    getTeamworkStorage().getParticipantSessions(participantId),
  getByStatus: (status: string) => getTeamworkStorage().getSessionsByStatus(status),
  search: (query: string) => getTeamworkStorage().searchSessions(query),
  stats: () => getTeamworkStorage().getStats(),
  clear: () => getTeamworkStorage().clear(),
};

// Legacy compatibility
export const getConversationStorage = getTeamworkStorage;
export const conversationStorage = teamworkStorage;