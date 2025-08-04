/**
 * Session Management Integration Tests
 *
 * Hybrid Testing Approach:
 * - London School: Mock session storage backends and external dependencies
 * - Classical School: Test actual session lifecycle and data integrity
 */

import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

// Session Management Interface
interface SessionData {
  sessionId: string;
  userId?: string;
  data: Record<string, any>;
  metadata: {
    created: number;
    lastAccessed: number;
    lastModified: number;
    accessCount: number;
    size: number;
  };
  ttl?: number;
}

interface SessionStorage {
  initialize(): Promise<void>;
  createSession(sessionId: string, data?: any): Promise<SessionData>;
  getSession(sessionId: string): Promise<SessionData | null>;
  updateSession(sessionId: string, data: any): Promise<SessionData>;
  deleteSession(sessionId: string): Promise<boolean>;
  listSessions(userId?: string): Promise<string[]>;
  cleanupExpiredSessions(): Promise<number>;
  getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    totalSize: number;
  }>;
}

// Session Manager Implementation
class SessionManager extends EventEmitter {
  private sessions = new Map<string, SessionData>();
  private storage: SessionStorage | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
  private maxSessions = 10000;

  constructor(storage?: SessionStorage) {
    super();
    this.storage = storage || null;
  }

  async initialize(): Promise<void> {
    if (this.storage) {
      await this.storage.initialize();
    }

    // Start cleanup interval
    this.startCleanupInterval();
    this.emit('initialized');
  }

  async createSession(
    sessionId?: string,
    initialData?: any,
    userId?: string
  ): Promise<SessionData> {
    sessionId = sessionId || this.generateSessionId();

    if (this.sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`);
    }

    // Check session limit
    if (this.sessions.size >= this.maxSessions) {
      await this.cleanupOldestSessions(100);
    }

    const now = Date.now();
    const session: SessionData = {
      sessionId,
      userId,
      data: initialData || {},
      metadata: {
        created: now,
        lastAccessed: now,
        lastModified: now,
        accessCount: 1,
        size: JSON.stringify(initialData || {}).length,
      },
      ttl: now + this.defaultTTL,
    };

    this.sessions.set(sessionId, session);

    if (this.storage) {
      await this.storage.createSession(sessionId, session);
    }

    this.emit('sessionCreated', { sessionId, userId });
    return { ...session };
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    let session = this.sessions.get(sessionId);

    // Try storage if not in memory
    if (!session && this.storage) {
      session = await this.storage.getSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
      }
    }

    if (!session) {
      return null;
    }

    // Check if expired
    if (session.ttl && Date.now() > session.ttl) {
      await this.deleteSession(sessionId);
      return null;
    }

    // Update access metadata
    session.metadata.lastAccessed = Date.now();
    session.metadata.accessCount++;

    this.emit('sessionAccessed', { sessionId, userId: session.userId });
    return { ...session };
  }

  async updateSession(sessionId: string, data: any, merge = true): Promise<SessionData> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update data
    if (merge && typeof data === 'object' && data !== null) {
      session.data = { ...session.data, ...data };
    } else {
      session.data = data;
    }

    // Update metadata
    session.metadata.lastModified = Date.now();
    session.metadata.size = JSON.stringify(session.data).length;

    this.sessions.set(sessionId, session);

    if (this.storage) {
      await this.storage.updateSession(sessionId, session);
    }

    this.emit('sessionUpdated', { sessionId, userId: session.userId });
    return { ...session };
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    const deleted = this.sessions.delete(sessionId);

    if (deleted && this.storage) {
      await this.storage.deleteSession(sessionId);
    }

    if (deleted) {
      this.emit('sessionDeleted', { sessionId, userId: session?.userId });
    }

    return deleted;
  }

  async listSessions(userId?: string): Promise<string[]> {
    const sessions = Array.from(this.sessions.values());

    return sessions
      .filter((session) => !userId || session.userId === userId)
      .filter((session) => !session.ttl || Date.now() <= session.ttl)
      .map((session) => session.sessionId);
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.ttl && now > session.ttl) {
        await this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    this.emit('sessionsCleanedUp', { count: cleanedCount });
    return cleanedCount;
  }

  async getStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    totalSize: number;
  }> {
    const now = Date.now();
    let activeSessions = 0;
    let expiredSessions = 0;
    let totalSize = 0;

    for (const session of this.sessions.values()) {
      totalSize += session.metadata.size;

      if (session.ttl && now > session.ttl) {
        expiredSessions++;
      } else {
        activeSessions++;
      }
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      expiredSessions,
      totalSize,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      async () => {
        try {
          await this.cleanupExpiredSessions();
        } catch (error) {
          this.emit('error', error);
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  private async cleanupOldestSessions(count: number): Promise<void> {
    const sessions = Array.from(this.sessions.values())
      .sort((a, b) => a.metadata.lastAccessed - b.metadata.lastAccessed)
      .slice(0, count);

    for (const session of sessions) {
      await this.deleteSession(session.sessionId);
    }
  }

  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Save all sessions to storage if available
    if (this.storage) {
      for (const session of this.sessions.values()) {
        await this.storage.updateSession(session.sessionId, session);
      }
    }

    this.emit('shutdown');
  }
}

// Mock Storage Implementation for London-style tests
class MockSessionStorage implements SessionStorage {
  private mockData = new Map<string, SessionData>();
  public initializeCalled = false;
  public operations: string[] = [];

  async initialize(): Promise<void> {
    this.initializeCalled = true;
    this.operations.push('initialize');
  }

  async createSession(sessionId: string, data?: any): Promise<SessionData> {
    this.operations.push(`create:${sessionId}`);
    const session = data as SessionData;
    this.mockData.set(sessionId, session);
    return { ...session };
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    this.operations.push(`get:${sessionId}`);
    return this.mockData.get(sessionId) || null;
  }

  async updateSession(sessionId: string, data: any): Promise<SessionData> {
    this.operations.push(`update:${sessionId}`);
    const session = data as SessionData;
    this.mockData.set(sessionId, session);
    return { ...session };
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    this.operations.push(`delete:${sessionId}`);
    return this.mockData.delete(sessionId);
  }

  async listSessions(userId?: string): Promise<string[]> {
    this.operations.push(`list:${userId || 'all'}`);
    return Array.from(this.mockData.keys());
  }

  async cleanupExpiredSessions(): Promise<number> {
    this.operations.push('cleanup');
    return 0;
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    totalSize: number;
  }> {
    this.operations.push('stats');
    return {
      totalSessions: this.mockData.size,
      activeSessions: this.mockData.size,
      expiredSessions: 0,
      totalSize: 0,
    };
  }
}

describe('Session Management Integration Tests', () => {
  let sessionManager: SessionManager;
  let mockStorage: MockSessionStorage;

  beforeEach(() => {
    mockStorage = new MockSessionStorage();
    sessionManager = new SessionManager(mockStorage);
  });

  afterEach(async () => {
    if (sessionManager) {
      await sessionManager.shutdown();
    }
  });

  describe('Storage Interface (London School)', () => {
    it('should initialize storage properly', async () => {
      await sessionManager.initialize();

      expect(mockStorage.initializeCalled).toBe(true);
      expect(mockStorage.operations).toContain('initialize');
    });

    it('should delegate operations to storage', async () => {
      await sessionManager.initialize();

      const _session = await sessionManager.createSession('test-session', { test: 'data' });
      await sessionManager.getSession('test-session');
      await sessionManager.updateSession('test-session', { updated: true });
      await sessionManager.deleteSession('test-session');

      expect(mockStorage.operations).toContain('create:test-session');
      expect(mockStorage.operations).toContain('update:test-session');
      expect(mockStorage.operations).toContain('delete:test-session');
    });

    it('should handle storage failures gracefully', async () => {
      const failingStorage = new MockSessionStorage();
      failingStorage.createSession = jest.fn().mockRejectedValue(new Error('Storage error'));

      const failingManager = new SessionManager(failingStorage);
      await failingManager.initialize();

      await expect(failingManager.createSession('failing-session', {})).rejects.toThrow(
        'Storage error'
      );
    });
  });

  describe('Session Lifecycle (Classical School)', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should create sessions with proper metadata', async () => {
      const sessionData = { user: 'john', preferences: { theme: 'dark' } };

      const session = await sessionManager.createSession('user-session', sessionData, 'john');

      expect(session.sessionId).toBe('user-session');
      expect(session.userId).toBe('john');
      expect(session.data).toEqual(sessionData);
      expect(session.metadata.created).toBeGreaterThan(0);
      expect(session.metadata.lastAccessed).toBeGreaterThan(0);
      expect(session.metadata.accessCount).toBe(1);
      expect(session.metadata.size).toBeGreaterThan(0);
    });

    it('should generate unique session IDs when not provided', async () => {
      const session1 = await sessionManager.createSession();
      const session2 = await sessionManager.createSession();

      expect(session1.sessionId).toBeDefined();
      expect(session2.sessionId).toBeDefined();
      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session1.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should retrieve and update session access metadata', async () => {
      const initialData = { counter: 0 };
      await sessionManager.createSession('access-test', initialData);

      // First access
      const session1 = await sessionManager.getSession('access-test');
      expect(session1?.metadata.accessCount).toBe(2); // 1 from create + 1 from get

      // Add small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 2));

      // Second access
      const session2 = await sessionManager.getSession('access-test');
      expect(session2?.metadata.accessCount).toBe(3);
      expect(session2?.metadata.lastAccessed).toBeGreaterThanOrEqual(
        session1?.metadata.lastAccessed
      );
    });

    it('should update session data correctly', async () => {
      await sessionManager.createSession('update-test', { a: 1, b: 2 });

      // Merge update
      const updated1 = await sessionManager.updateSession('update-test', { b: 3, c: 4 });
      expect(updated1.data).toEqual({ a: 1, b: 3, c: 4 });

      // Add small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 2));

      // Replace update
      const updated2 = await sessionManager.updateSession('update-test', { x: 10 }, false);
      expect(updated2.data).toEqual({ x: 10 });

      expect(updated2.metadata.lastModified).toBeGreaterThanOrEqual(updated1.metadata.lastModified);
    });

    it('should handle session deletion', async () => {
      await sessionManager.createSession('delete-test', { temporary: true });

      const deleted = await sessionManager.deleteSession('delete-test');
      expect(deleted).toBe(true);

      const retrieved = await sessionManager.getSession('delete-test');
      expect(retrieved).toBeNull();

      // Deleting non-existent session should return false
      const deletedAgain = await sessionManager.deleteSession('delete-test');
      expect(deletedAgain).toBe(false);
    });

    it('should list sessions correctly', async () => {
      await sessionManager.createSession('user1-session', {}, 'user1');
      await sessionManager.createSession('user2-session', {}, 'user2');
      await sessionManager.createSession('user1-session2', {}, 'user1');

      const allSessions = await sessionManager.listSessions();
      expect(allSessions).toHaveLength(3);
      expect(allSessions).toContain('user1-session');
      expect(allSessions).toContain('user2-session');

      const user1Sessions = await sessionManager.listSessions('user1');
      expect(user1Sessions).toHaveLength(2);
      expect(user1Sessions).toContain('user1-session');
      expect(user1Sessions).toContain('user1-session2');
      expect(user1Sessions).not.toContain('user2-session');
    });
  });

  describe('Session Expiration and Cleanup', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should handle expired sessions', async () => {
      // Create session with short TTL
      const session = await sessionManager.createSession('expire-test', {});
      session.ttl = Date.now() - 1000; // Already expired

      // Manually set the expired session
      (sessionManager as any).sessions.set('expire-test', session);

      const retrieved = await sessionManager.getSession('expire-test');
      expect(retrieved).toBeNull();

      // Session should be cleaned up
      const sessions = await sessionManager.listSessions();
      expect(sessions).not.toContain('expire-test');
    });

    it('should cleanup expired sessions in batch', async () => {
      const expiredTime = Date.now() - 1000;

      // Create expired sessions
      for (let i = 0; i < 5; i++) {
        const session = await sessionManager.createSession(`expired-${i}`, {});
        session.ttl = expiredTime;
        (sessionManager as any).sessions.set(`expired-${i}`, session);
      }

      // Create active session
      await sessionManager.createSession('active', {});

      const cleanedCount = await sessionManager.cleanupExpiredSessions();
      expect(cleanedCount).toBe(5);

      const remainingSessions = await sessionManager.listSessions();
      expect(remainingSessions).toHaveLength(1);
      expect(remainingSessions).toContain('active');
    });

    it('should handle session limit by cleaning oldest sessions', async () => {
      // Set low limit for testing
      (sessionManager as any).maxSessions = 3;

      await sessionManager.createSession('session-1', {});
      await sessionManager.createSession('session-2', {});
      await sessionManager.createSession('session-3', {});

      // Adding 4th session should trigger cleanup
      await sessionManager.createSession('session-4', {});

      const sessions = await sessionManager.listSessions();
      expect(sessions.length).toBeLessThanOrEqual(3);
      expect(sessions).toContain('session-4'); // Newest should remain
    });
  });

  describe('Session Statistics', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should calculate session statistics correctly', async () => {
      // Create some test sessions
      await sessionManager.createSession('stats-1', { data: 'small' });
      await sessionManager.createSession('stats-2', { data: 'larger data content' });

      // Create expired session
      const expiredSession = await sessionManager.createSession('stats-expired', {});
      expiredSession.ttl = Date.now() - 1000;
      (sessionManager as any).sessions.set('stats-expired', expiredSession);

      const stats = await sessionManager.getStats();

      expect(stats.totalSessions).toBe(3);
      expect(stats.activeSessions).toBe(2);
      expect(stats.expiredSessions).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  describe('Event Emission', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should emit events for session operations', async () => {
      const events: string[] = [];

      sessionManager.on('sessionCreated', (data) => {
        events.push(`created:${data.sessionId}`);
      });

      sessionManager.on('sessionAccessed', (data) => {
        events.push(`accessed:${data.sessionId}`);
      });

      sessionManager.on('sessionUpdated', (data) => {
        events.push(`updated:${data.sessionId}`);
      });

      sessionManager.on('sessionDeleted', (data) => {
        events.push(`deleted:${data.sessionId}`);
      });

      await sessionManager.createSession('event-test', {});
      await sessionManager.getSession('event-test');
      await sessionManager.updateSession('event-test', { updated: true });
      await sessionManager.deleteSession('event-test');

      expect(events).toContain('created:event-test');
      expect(events).toContain('accessed:event-test');
      expect(events).toContain('updated:event-test');
      expect(events).toContain('deleted:event-test');
    });

    it('should emit cleanup events', async () => {
      let cleanupEvent: any = null;

      sessionManager.on('sessionsCleanedUp', (data) => {
        cleanupEvent = data;
      });

      const count = await sessionManager.cleanupExpiredSessions();

      expect(cleanupEvent).toBeDefined();
      expect(cleanupEvent.count).toBe(count);
    });
  });

  describe('Concurrent Operations', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should handle concurrent session creation', async () => {
      const createPromises = Array.from({ length: 10 }, (_, i) =>
        sessionManager.createSession(`concurrent-${i}`, { index: i })
      );

      const sessions = await Promise.all(createPromises);

      expect(sessions).toHaveLength(10);
      sessions.forEach((session, index) => {
        expect(session.sessionId).toBe(`concurrent-${index}`);
        expect(session.data.index).toBe(index);
      });
    });

    it('should handle concurrent access to same session', async () => {
      await sessionManager.createSession('concurrent-access', { counter: 0 });

      const accessPromises = Array.from({ length: 5 }, () =>
        sessionManager.getSession('concurrent-access')
      );

      const results = await Promise.all(accessPromises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result?.sessionId).toBe('concurrent-access');
      });

      // Final access count should reflect all accesses
      const finalSession = await sessionManager.getSession('concurrent-access');
      expect(finalSession?.metadata.accessCount).toBeGreaterThan(5);
    });

    it('should handle mixed concurrent operations', async () => {
      await sessionManager.createSession('mixed-ops', { value: 0 });

      const operations = [
        () => sessionManager.getSession('mixed-ops'),
        () => sessionManager.updateSession('mixed-ops', { value: 1 }),
        () => sessionManager.getSession('mixed-ops'),
        () => sessionManager.updateSession('mixed-ops', { value: 2 }),
        () => sessionManager.getSession('mixed-ops'),
      ];

      const results = await Promise.all(operations.map((op) => op()));

      // All operations should complete successfully
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Memory Management', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should track memory usage accurately', async () => {
      const largeData = { content: 'x'.repeat(10000) };

      await sessionManager.createSession('memory-test', largeData);

      const stats = await sessionManager.getStats();
      expect(stats.totalSize).toBeGreaterThan(10000);

      const session = await sessionManager.getSession('memory-test');
      expect(session?.metadata.size).toBeGreaterThan(10000);
    });

    it('should update size when session data changes', async () => {
      await sessionManager.createSession('size-test', { small: 'data' });

      const initialSession = await sessionManager.getSession('size-test');
      const initialSize = initialSession?.metadata.size;

      await sessionManager.updateSession('size-test', {
        large: 'x'.repeat(5000),
        additional: 'y'.repeat(3000),
      });

      const updatedSession = await sessionManager.getSession('size-test');
      expect(updatedSession?.metadata.size).toBeGreaterThan(initialSize);
    });
  });
});
