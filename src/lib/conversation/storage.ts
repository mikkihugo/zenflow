/**
 * Conversation Storage using Shared Infrastructure
 * 
 * Lightweight persistence using @claude-zen/foundation storage wrapper.
 * No direct database dependencies - delegates to existing infrastructure.
 */

// Simple logging for standalone mode
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
};

/**
 * Key-value storage interface for conversation persistence
 */
export interface ConversationKV {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
}

/**
 * In-memory KV implementation for standalone conversation library
 */
class InMemoryKV implements ConversationKV {
  private data = new Map<string, any>();

  async get(key: string): Promise<any> {
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.data.has(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }
}

import type { ConversationSession, ConversationMessage } from './types';

/**
 * Conversation storage interface using shared KV store
 */
export class ConversationStorage {
  private kv: ConversationKV | null = null;

  /**
   * Initialize storage (lazy loading)
   * Automatically uses @claude-zen/foundation storage if available, falls back to in-memory
   */
  private async getKV(): Promise<ConversationKV> {
    if (!this.kv) {
      // Try to detect if @claude-zen/foundation is available
      if (await this.isSharedAvailable()) {
        try {
          const sharedModule = await this.loadSharedModule();
          this.kv = await sharedModule.storage.getLibKV('conversation');
          logger.info('Conversation storage initialized with @claude-zen/foundation');
        } catch (error) {
          this.kv = new InMemoryKV();
          logger.info('Conversation storage fallback to in-memory (shared import failed)');
        }
      } else {
        this.kv = new InMemoryKV();
        logger.info('Conversation storage initialized with in-memory backend');
      }
    }
    return this.kv!;
  }

  /**
   * Check if @claude-zen/foundation is available without importing it
   */
  private async isSharedAvailable(): Promise<boolean> {
    try {
      // Try to resolve without importing - safer for compilation
      return typeof (globalThis as any)['@claude-zen/foundation'] !== 'undefined' ||
             (typeof require !== 'undefined' && typeof require.resolve === 'function');
    } catch {
      return false;
    }
  }

  /**
   * Load shared module dynamically
   */
  private async loadSharedModule(): Promise<any> {
    // Use eval to hide the import from TypeScript compiler
    const importPath = '@claude-zen/foundation';
    return new Function('path', 'return import(path)')(importPath);
  }

  /**
   * Store a conversation session
   */
  async storeSession(session: ConversationSession): Promise<void> {
    const kv = await this.getKV();
    const key = `session:${session.id}`;
    
    // Store session with serialized complex objects
    const serializedSession = {
      ...session,
      messages: JSON.stringify(session.messages),
      participants: JSON.stringify(session.participants),
      outcomes: JSON.stringify(session.outcomes),
      metrics: JSON.stringify(session.metrics),
      context: JSON.stringify(session.context),
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
    };

    await kv.set(key, serializedSession);
    
    // Index by participant for quick lookups
    for (const participant of session.participants) {
      const participantKey = `participant:${participant.id}`;
      const participantSessions = await kv.get(participantKey) || [];
      if (!participantSessions.includes(session.id)) {
        participantSessions.push(session.id);
        await kv.set(participantKey, participantSessions);
      }
    }

    logger.debug('Session stored:', session.id);
  }

  /**
   * Retrieve a conversation session by ID
   */
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    const kv = await this.getKV();
    const key = `session:${sessionId}`;
    const data = await kv.get(key);

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
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    };
  }

  /**
   * Update a conversation session
   */
  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
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
    const kv = await this.getKV();
    const session = await this.getSession(sessionId);
    
    if (session) {
      // Remove from participant indexes
      for (const participant of session.participants) {
        const participantKey = `participant:${participant.id}`;
        const participantSessions = await kv.get(participantKey) || [];
        const filtered = participantSessions.filter((id: any) => id !== sessionId);
        if (filtered.length > 0) {
          await kv.set(participantKey, filtered);
        } else {
          await kv.delete(participantKey);
        }
      }
    }

    // Remove session
    const key = `session:${sessionId}`;
    await kv.delete(key);
    
    logger.debug('Session deleted:', sessionId);
  }

  /**
   * Get all session Ds for a participant
   */
  async getParticipantSessions(participantId: string): Promise<string[]> {
    const kv = await this.getKV();
    const participantKey = `participant:${participantId}`;
    return await kv.get(participantKey) || [];
  }

  /**
   * Get all active session Ds
   */
  async getAllSessionIds(): Promise<string[]> {
    const kv = await this.getKV();
    const keys = await kv.keys();
    return keys
      .filter(key => key.startsWith('session:'))
      .map(key => key.substring(8)); // Remove 'session:' prefix
  }

  /**
   * Search sessions by status
   */
  async getSessionsByStatus(status: string): Promise<ConversationSession[]> {
    const sessionIds = await this.getAllSessionIds();
    const sessions: ConversationSession[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session && session.status === status) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Add a message to a session
   */
  async addMessage(sessionId: string, message: ConversationMessage): Promise<void> {
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
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  /**
   * Clear all conversation data (for testing/cleanup)
   */
  async clear(): Promise<void> {
    const kv = await this.getKV();
    await kv.clear();
    logger.info('All conversation data cleared');
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalMessages: number;
  }> {
    const sessionIds = await this.getAllSessionIds();
    let activeSessions = 0;
    let completedSessions = 0;
    let totalMessages = 0;

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        if (session.status === 'active') activeSessions++;
        if (session.status === 'completed') completedSessions++;
        totalMessages += session.messages.length;
      }
    }

    return {
      totalSessions: sessionIds.length,
      activeSessions,
      completedSessions,
      totalMessages,
    };
  }
}

// Singleton instance
let globalStorage: ConversationStorage | null = null;

/**
 * Get global conversation storage instance
 */
export function getConversationStorage(): ConversationStorage {
  if (!globalStorage) {
    globalStorage = new ConversationStorage();
    logger.info('Conversation storage singleton created');
  }
  return globalStorage;
}

/**
 * Quick access functions
 */
export const conversationStorage = {
  store: (session: ConversationSession) => getConversationStorage().storeSession(session),
  get: (sessionId: string) => getConversationStorage().getSession(sessionId),
  update: (sessionId: string, updates: Partial<ConversationSession>) => 
    getConversationStorage().updateSession(sessionId, updates),
  delete: (sessionId: string) => getConversationStorage().deleteSession(sessionId),
  addMessage: (sessionId: string, message: ConversationMessage) =>
    getConversationStorage().addMessage(sessionId, message),
  getMessages: (sessionId: string) => getConversationStorage().getSessionMessages(sessionId),
  getParticipantSessions: (participantId: string) =>
    getConversationStorage().getParticipantSessions(participantId),
  getByStatus: (status: string) => getConversationStorage().getSessionsByStatus(status),
  stats: () => getConversationStorage().getStats(),
  clear: () => getConversationStorage().clear(),
};