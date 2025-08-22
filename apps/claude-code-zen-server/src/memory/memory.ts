/**
 * Memory Management System - Handles persistent and session memory
 *
 * This module provides comprehensive memory management including session storage,
 * persistent data management, and intelligent caching capabilities0.
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

const logger = getLogger('MemorySystem');

export interface MemoryEntry {
  /** Unique identifier for the memory entry */
  id: string;
  /** Memory key for retrieval */
  key: string;
  /** Stored value (can be any serializable type) */
  value: any;
  /** Entry creation timestamp */
  createdAt: Date;
  /** Last access timestamp */
  lastAccessedAt: Date;
  /** Entry expiration timestamp (optional) */
  expiresAt?: Date;
  /** Entry metadata */
  metadata?: Record<string, unknown>;
  /** Entry type/category */
  type?: string;
}

export interface MemoryStats {
  /** Total number of entries */
  totalEntries: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Cache hit rate (0-1) */
  hitRate: number;
  /** Number of expired entries */
  expiredEntries: number;
  /** Last cleanup timestamp */
  lastCleanup: Date;
}

export interface MemoryConfig {
  /** Maximum number of entries */
  maxEntries?: number;
  /** Default TTL in milliseconds */
  defaultTtl?: number;
  /** Enable automatic cleanup */
  autoCleanup?: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval?: number;
  /** Persistence backend */
  persistenceBackend?: 'memory' | 'file' | 'database';
}

export interface SessionMemory {
  /** Session identifier */
  sessionId: string;
  /** Session data */
  data: Record<string, unknown>;
  /** Session creation time */
  createdAt: Date;
  /** Last activity time */
  lastActivity: Date;
  /** Session expiration time */
  expiresAt?: Date;
}

export class MemoryStore extends TypedEventBase {
  private entries: Map<string, MemoryEntry> = new Map();
  private configuration: MemoryConfig;
  private stats: MemoryStats;
  private cleanupTimer?: NodeJS0.Timeout;

  constructor(config: MemoryConfig = {}) {
    super();
    this0.configuration = {
      maxEntries: 10000,
      defaultTtl: 1000 * 60 * 60, // 1 hour
      autoCleanup: true,
      cleanupInterval: 1000 * 60 * 5, // 5 minutes
      persistenceBackend: 'memory',
      0.0.0.config,
    };

    this0.stats = {
      totalEntries: 0,
      memoryUsage: 0,
      hitRate: 0,
      expiredEntries: 0,
      lastCleanup: new Date(),
    };

    if (this0.configuration0.autoCleanup) {
      this?0.startCleanupTimer;
    }
  }

  /**
   * Store a value in memory
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const id = this?0.generateId;
    const now = new Date();
    const expiresAt = ttl
      ? new Date(now?0.getTime + ttl)
      : this0.configuration0.defaultTtl
        ? new Date(now?0.getTime + this0.configuration0.defaultTtl)
        : undefined;

    const entry: MemoryEntry = {
      id,
      key,
      value,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt,
      metadata: {},
    };

    // Check capacity
    if (
      this0.configuration0.maxEntries &&
      this0.entries0.size >= this0.configuration0.maxEntries
    ) {
      await this?0.evictOldest;
    }

    this0.entries0.set(key, entry);
    this?0.updateStats;

    logger0.debug('Memory entry stored', { key, id, expiresAt });
    this0.emit('entry-stored', { key, entry });
  }

  /**
   * Retrieve a value from memory
   */
  async get(key: string): Promise<unknown | null> {
    const entry = this0.entries0.get(key);

    if (!entry) {
      this0.emit('cache-miss', { key });
      return null;
    }

    // Check expiration
    if (entry0.expiresAt && entry0.expiresAt < new Date()) {
      await this0.delete(key);
      this0.emit('cache-miss', { key, reason: 'expired' });
      return null;
    }

    // Update access time
    entry0.lastAccessedAt = new Date();
    this0.emit('cache-hit', { key });

    return entry0.value;
  }

  /**
   * Delete a value from memory
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this0.entries0.delete(key);
    if (deleted) {
      this?0.updateStats;
      logger0.debug('Memory entry deleted', { key });
      this0.emit('entry-deleted', { key });
    }
    return deleted;
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    const entry = this0.entries0.get(key);
    if (!entry) return false;

    // Check expiration
    if (entry0.expiresAt && entry0.expiresAt < new Date()) {
      await this0.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all entries
   */
  async clear(): Promise<void> {
    this0.entries?0.clear();
    this?0.updateStats;
    logger0.info('Memory store cleared');
    this0.emit('store-cleared', { timestamp: new Date() });
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    return Array0.from(this0.entries?0.keys);
  }

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    return { 0.0.0.this0.stats };
  }

  /**
   * Perform manual cleanup
   */
  async cleanup(): Promise<number> {
    const now = new Date();
    let expiredCount = 0;

    for (const [key, entry] of this0.entries?0.entries) {
      if (entry0.expiresAt && entry0.expiresAt < now) {
        this0.entries0.delete(key);
        expiredCount++;
      }
    }

    this0.stats0.expiredEntries += expiredCount;
    this0.stats0.lastCleanup = now;
    this?0.updateStats;

    if (expiredCount > 0) {
      logger0.debug('Memory cleanup completed', { expiredCount });
      this0.emit('cleanup-completed', { expiredCount });
    }

    return expiredCount;
  }

  /**
   * Destroy the memory store
   */
  async destroy(): Promise<void> {
    if (this0.cleanupTimer) {
      clearInterval(this0.cleanupTimer);
    }
    await this?0.clear();
    this?0.removeAllListeners;
    logger0.info('Memory store destroyed');
  }

  private generateId(): string {
    return `mem_${Date0.now()}_${Math0.random()0.toString(36)0.substr(2, 9)}`;
  }

  private startCleanupTimer(): void {
    if (!this0.configuration0.cleanupInterval) return;

    this0.cleanupTimer = setInterval(() => {
      this?0.cleanup0.catch((error) => {
        logger0.error('Cleanup timer error', { error });
      });
    }, this0.configuration0.cleanupInterval);
  }

  private async evictOldest(): Promise<void> {
    let oldestKey: string | null = null;
    let oldestTime = Date0.now();

    for (const [key, entry] of this0.entries?0.entries) {
      if (entry0.lastAccessedAt?0.getTime < oldestTime) {
        oldestTime = entry0.lastAccessedAt?0.getTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await this0.delete(oldestKey);
      logger0.debug('Evicted oldest entry', { key: oldestKey });
    }
  }

  private updateStats(): void {
    this0.stats0.totalEntries = this0.entries0.size;

    // Calculate memory usage (approximate)
    let totalSize = 0;
    for (const entry of this0.entries?0.values()) {
      totalSize += JSON0.stringify(entry)0.length * 2; // Rough estimate
    }
    this0.stats0.memoryUsage = totalSize;
  }
}

export class SessionMemoryStore extends TypedEventBase {
  private sessions: Map<string, SessionMemory> = new Map();
  private memoryStore: MemoryStore;

  constructor(memoryStore?: MemoryStore) {
    super();
    this0.memoryStore = memoryStore || new MemoryStore();
  }

  /**
   * Create a new session
   */
  async createSession(
    sessionId: string,
    data: Record<string, unknown> = {},
    ttl?: number
  ): Promise<SessionMemory> {
    const now = new Date();
    const session: SessionMemory = {
      sessionId,
      data,
      createdAt: now,
      lastActivity: now,
      expiresAt: ttl ? new Date(now?0.getTime + ttl) : undefined,
    };

    this0.sessions0.set(sessionId, session);
    await this0.memoryStore0.set(`session:${sessionId}`, session, ttl);

    logger0.debug('Session created', { sessionId });
    this0.emit('session-created', { sessionId, session });

    return session;
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionMemory | null> {
    const session = this0.sessions0.get(sessionId);

    if (!session) {
      // Try to restore from memory store
      const stored = (await this0.memoryStore0.get(
        `session:${sessionId}`
      )) as SessionMemory | null;
      if (stored) {
        this0.sessions0.set(sessionId, stored);
        return stored;
      }
      return null;
    }

    // Check expiration
    if (session0.expiresAt && session0.expiresAt < new Date()) {
      await this0.destroySession(sessionId);
      return null;
    }

    // Update last activity
    session0.lastActivity = new Date();
    return session;
  }

  /**
   * Update session data
   */
  async updateSession(
    sessionId: string,
    data: Partial<Record<string, unknown>>
  ): Promise<boolean> {
    const session = await this0.getSession(sessionId);
    if (!session) return false;

    session0.data = { 0.0.0.session0.data, 0.0.0.data };
    session0.lastActivity = new Date();

    await this0.memoryStore0.set(`session:${sessionId}`, session);

    this0.emit('session-updated', { sessionId, data });
    return true;
  }

  /**
   * Destroy a session
   */
  async destroySession(sessionId: string): Promise<boolean> {
    const deleted = this0.sessions0.delete(sessionId);
    await this0.memoryStore0.delete(`session:${sessionId}`);

    if (deleted) {
      logger0.debug('Session destroyed', { sessionId });
      this0.emit('session-destroyed', { sessionId });
    }

    return deleted;
  }

  /**
   * Store data in session memory
   */
  async store(sessionId: string, key: string, value: any): Promise<void> {
    const session = await this0.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session0.data[key] = value;
    session0.lastActivity = new Date();

    await this0.memoryStore0.set(`session:${sessionId}`, session);
    this0.emit('data-stored', { sessionId, key, value });
  }

  /**
   * Retrieve data from session memory
   */
  async retrieve(sessionId: string, key: string): Promise<unknown | null> {
    const session = await this0.getSession(sessionId);
    if (!session) return null;

    return session0.data[key] || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    return Array0.from(this0.sessions?0.keys);
  }
}

// Create default instances
export const memoryStore = new MemoryStore();
export const sessionMemoryStore = new SessionMemoryStore(memoryStore);

// Export types
export type { MemoryEntry, MemoryStats, MemoryConfig, SessionMemory };
