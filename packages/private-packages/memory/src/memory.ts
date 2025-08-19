/**
 * @file Session-based memory storage with pluggable backends.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('Memory');

import { EventEmitter } from 'eventemitter3';
import type {
  MemoryStore,
  MemoryStats,
  StoreOptions,
  SessionMemoryStoreOptions as SessionMemoryStoreOptionsType,
} from './types';
// import { MemoryBackendFactory as BackendFactory } from './backends/factory';
import type { BackendInterface, JSONValue } from './core/memory-system';

// Use types from types.ts to avoid duplication
import type { SessionState, CacheEntry } from './types';

type BackendConfig = SessionMemoryStoreOptionsType['backendConfig'];
type SessionMemoryStoreOptions = SessionMemoryStoreOptionsType;

export class SessionMemoryStore extends EventEmitter implements MemoryStore {
  private backend: BackendInterface | null = null;
  private initialized = false;
  private sessions = new Map<string, SessionState>();
  private options: Required<SessionMemoryStoreOptions>;

  private cache = new Map<string, CacheEntry>();
  private cacheKeys: string[] = [];

  // TODO: Use dependency injection for backend creation
  // Instead of using BackendFactory.create(), inject the backend via constructor
  // Example:
  // constructor(
  //   @inject(MEMORY_TOKENS.Backend) private backend: BackendInterface,
  //   @inject(MEMORY_TOKENS.Config) options: SessionMemoryStoreOptions
  // ) {
  constructor(options: SessionMemoryStoreOptions) {
    super();

    this.options = {
      backendConfig: options?.['backendConfig'],
      enableCache: options?.['enableCache'] ?? true,
      cacheSize: options?.['cacheSize'] ?? 1000,
      cacheTTL: options?.['cacheTTL'] ?? 300000, // 5 minutes
      enableVectorStorage: options?.['enableVectorStorage'] ?? false,
      vectorDimensions: options?.['vectorDimensions'] ?? 512,
    };

    // Backend will be created during initialization
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // TODO: Implement backend creation when factory is available
      // For now, use a simple in-memory mock backend
      this.backend = {
        initialize: async () => Promise.resolve(),
        store: async () => Promise.resolve(),
        retrieve: async () => Promise.resolve(null),
        get: async () => Promise.resolve(null),
        set: async () => Promise.resolve(),
        delete: async () => Promise.resolve(false),
        search: async () => Promise.resolve({}),
        listNamespaces: async () => Promise.resolve([]),
        clear: async () => Promise.resolve(),
        close: async () => Promise.resolve(),
      };

      await this.backend.initialize();
      await this.loadFromBackend();
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      logger.error('❌ Session memory store initialization failed:', error);
      throw error;
    }
  }

  async store(
    sessionId: string,
    key: string,
    data: unknown,
    options?: StoreOptions
  ): Promise<void>;
  async store(
    key: string,
    data: unknown,
    options?: StoreOptions
  ): Promise<void>;
  async store(
    sessionIdOrKey: string,
    keyOrData?: string | unknown,
    dataOrOptions?: unknown | StoreOptions,
    options?: StoreOptions
  ): Promise<void> {
    // Handle both overloads: (sessionId, key, data, options) and (key, data, options)
    let sessionId: string;
    let key: string;
    let data: unknown;
    let storeOptions: StoreOptions | undefined;

    if (typeof keyOrData === 'string') {
      // (sessionId, key, data, options) overload
      sessionId = sessionIdOrKey;
      key = keyOrData;
      data = dataOrOptions;
      storeOptions = options;
    } else {
      // (key, data, options) overload - use default session
      sessionId = 'default';
      key = sessionIdOrKey;
      data = keyOrData;
      storeOptions = dataOrOptions as StoreOptions | undefined;
    }

    this.ensureInitialized();

    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        data: {},
        metadata: {
          created: Date.now(),
          updated: Date.now(),
          accessed: Date.now(),
          size: 0,
          tags: storeOptions?.tags || [],
          priority: storeOptions?.priority || 'medium',
          ttl: storeOptions?.ttl,
        },
        vectors: new Map(),
      };
      this.sessions.set(sessionId, session);
    }

    session.data[key] = data;
    session.metadata.updated = Date.now();
    session.metadata.accessed = Date.now();

    if (storeOptions?.vector && this.options.enableVectorStorage) {
      session.vectors?.set(key, storeOptions?.vector);
    }

    await this.backend?.store(
      sessionId,
      session as unknown as JSONValue
    );

    if (this.options.enableCache) {
      this.updateCache(sessionId, key, data);
    }
  }

  async retrieve<T = unknown>(
    sessionId: string,
    key: string
  ): Promise<T | null>;
  async retrieve<T = unknown>(key: string): Promise<T | null>;
  async retrieve<T = unknown>(
    sessionIdOrKey: string,
    key?: string
  ): Promise<T | null> {
    // Handle both overloads
    const actualSessionId = key ? sessionIdOrKey : 'default';
    const actualKey = key || sessionIdOrKey;

    this.ensureInitialized();

    if (this.options.enableCache) {
      const cached = this.getCachedData(actualSessionId, actualKey);
      if (cached !== null) {
        return cached as T;
      }
    }

    const session = await this.retrieveSession(actualSessionId);
    return (session?.data[actualKey] as T) ?? null;
  }

  async retrieveSession(sessionId: string): Promise<SessionState | null> {
    this.ensureInitialized();

    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    const sessionData = await this.backend?.retrieve(sessionId);
    if (sessionData) {
      const session = sessionData as unknown as SessionState;
      this.sessions.set(sessionId, session);
      return session;
    }

    return null;
  }

  async delete(sessionId: string, key: string): Promise<boolean>;
  async delete(key: string): Promise<boolean>;
  async delete(sessionIdOrKey: string, key?: string): Promise<boolean> {
    // Handle both overloads
    const actualSessionId = key ? sessionIdOrKey : 'default';
    const actualKey = key || sessionIdOrKey;

    this.ensureInitialized();

    const session = this.sessions.get(actualSessionId);
    if (!(session && actualKey in session.data)) {
      return false;
    }

    delete session.data[actualKey];
    session.vectors?.delete(actualKey);
    session.metadata.updated = Date.now();

    // Update backend
    await this.backend?.store(
      actualSessionId,
      session as unknown as JSONValue
    );

    // Remove from cache
    const cacheKey = `${actualSessionId}:${actualKey}`;
    this.cache.delete(cacheKey);

    return true;
  }

  async getStats(): Promise<MemoryStats> {
    this.ensureInitialized();

    let totalEntries = 0;
    let totalSize = 0;
    let lastModified = 0;

    for (const session of Array.from(this.sessions.values())) {
      totalEntries += Object.keys(session.data).length;
      totalSize += JSON.stringify(session.data).length;
      lastModified = Math.max(lastModified, session.metadata.updated);
    }

    return {
      entries: totalEntries,
      size: totalSize,
      lastModified,
      namespaces: this.sessions.size,
    };
  }

  async shutdown(): Promise<void> {
    if (this.initialized) {
      await this.saveToBackend();
      this.initialized = false;
      this.emit('shutdown');
    }
  }

  // Additional methods to implement MemoryStore interface
  async clear(): Promise<void> {
    this.ensureInitialized();
    this.sessions.clear();
    this.cache.clear();
    this.cacheKeys = [];
    
    // Clear backend data if needed
    const namespaces = await this.backend?.listNamespaces();
    if (namespaces) {
      for (const namespace of namespaces) {
        if (namespace === 'session') {
          // Clear all session data from backend
          const sessionKeys = await this.backend?.search('*', 'session');
          for (const key in sessionKeys) {
            await this.backend?.delete(key);
          }
        }
      }
    }
  }

  async size(): Promise<number> {
    this.ensureInitialized();
    let totalEntries = 0;
    for (const session of Array.from(this.sessions.values())) {
      totalEntries += Object.keys(session.data).length;
    }
    return totalEntries;
  }

  async health(): Promise<boolean> {
    try {
      this.ensureInitialized();
      return this.backend !== null && this.initialized;
    } catch {
      return false;
    }
  }

  async stats(): Promise<MemoryStats> {
    return this.getStats();
  }

  private async loadFromBackend(): Promise<void> {
    const namespaces = await this.backend?.listNamespaces();
    if (!namespaces) return;
    for (const namespace of namespaces) {
      if (namespace === 'session') {
        const sessionKeys = await this.backend?.search('*', 'session');
        for (const key in sessionKeys) {
          const sessionData = await this.backend?.retrieve(key);
          if (sessionData) {
            this.sessions.set(key, sessionData as unknown as SessionState);
          }
        }
      }
    }
  }

  private async saveToBackend(): Promise<void> {
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      await this.backend?.store(
        sessionId,
        session as unknown as JSONValue
      );
    }
  }

  private updateCache(sessionId: string, key: string, data: unknown): void {
    const cacheKey = `${sessionId}:${key}`;
    if (this.cache.size >= this.options.cacheSize) {
      const oldestKey = this.cacheKeys.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(cacheKey, { key: cacheKey, data, timestamp: Date.now() });
    this.cacheKeys.push(cacheKey);
  }

  private getCachedData(sessionId: string, key: string): unknown {
    const cacheKey = `${sessionId}:${key}`;
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.options.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  private ensureInitialized(): void {
    if (!(this.initialized && this.backend)) {
      throw new Error(
        'Session memory store not initialized. Call initialize() first.'
      );
    }
  }
}

export class MemoryManager {
  private store: SessionMemoryStore;

  constructor(options: SessionMemoryStoreOptions) {
    this.store = new SessionMemoryStore(options);
  }

  async initialize(): Promise<void> {
    await this.store.initialize();
  }

  async storeData(key: string, data: unknown, options?: StoreOptions): Promise<void> {
    return this.store.store('default', key, data, options);
  }

  async retrieve<T = unknown>(key: string): Promise<T | null> {
    return this.store.retrieve('default', key);
  }

  async shutdown(): Promise<void> {
    await this.store.shutdown();
  }

  async clear(): Promise<void> {
    return this.store.clear();
  }

  async size(): Promise<number> {
    return this.store.size();
  }

  async health(): Promise<boolean> {
    return this.store.health();
  }

  async stats(): Promise<MemoryStats> {
    return this.store.stats();
  }


  async delete(key: string): Promise<boolean> {
    return this.store.delete('default', key);
  }
}
