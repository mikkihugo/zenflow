import { getLogger } from '../core/logger';

const logger = getLogger('src-memory-memory');

/**
 * @file Session-based memory storage with pluggable backends.
 */

import { EventEmitter } from 'node:events';
import type { IMemoryStore } from '../core/interfaces/base-interfaces';
import type { BackendInterface, JSONValue, MemoryStats, StoreOptions } from '../memory/interfaces';
import { MemoryBackendFactory as BackendFactory } from './backends/factory';

interface BackendConfig {
  type: 'sqlite' | 'json' | 'lancedb' | 'memory';
  path?: string;
  maxSize?: number;
  ttl?: number;
}

interface SessionMemoryStoreOptions {
  backendConfig: BackendConfig;
  enableCache?: boolean;
  cacheSize?: number;
  cacheTTL?: number;
  enableVectorStorage?: boolean;
  vectorDimensions?: number;
}

export interface SessionState {
  sessionId: string;
  data: Record<string, any>;
  metadata: {
    created: number;
    updated: number;
    accessed: number;
    size: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    ttl?: number;
  };
  vectors?: Map<string, number[]>;
}

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
}

export class SessionMemoryStore extends EventEmitter implements IMemoryStore {
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
      backendConfig: options?.backendConfig,
      enableCache: options?.enableCache ?? true,
      cacheSize: options?.cacheSize ?? 1000,
      cacheTTL: options?.cacheTTL ?? 300000, // 5 minutes
      enableVectorStorage: options?.enableVectorStorage ?? false,
      vectorDimensions: options?.vectorDimensions ?? 512,
    };

    // Backend will be created during initialization
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create backend instance
      this.backend = await BackendFactory.createBackend(
        this.options.backendConfig.type as any,
        this.options.backendConfig
      );

      await this.backend.initialize();
      await this.loadFromBackend();
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      logger.error('❌ Session memory store initialization failed:', error);
      throw error;
    }
  }

  async store(sessionId: string, key: string, data: any, options?: StoreOptions): Promise<void>;
  async store(key: string, data: any, options?: StoreOptions): Promise<void>;
  async store(
    sessionIdOrKey: string,
    keyOrData?: string | any,
    dataOrOptions?: any | StoreOptions,
    options?: StoreOptions
  ): Promise<void> {
    // Handle both overloads: (sessionId, key, data, options) and (key, data, options)
    let sessionId: string;
    let key: string;
    let data: any;
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
      storeOptions = dataOrOptions;
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

    await this.backend?.store(sessionId, session as unknown as JSONValue, 'session');

    if (this.options.enableCache) {
      this.updateCache(sessionId, key, data);
    }
  }

  async retrieve(sessionId: string, key: string): Promise<any>;
  async retrieve(key: string): Promise<any>;
  async retrieve(sessionIdOrKey: string, key?: string): Promise<any> {
    // Handle both overloads
    const actualSessionId = key ? sessionIdOrKey : 'default';
    const actualKey = key || sessionIdOrKey;

    this.ensureInitialized();

    if (this.options.enableCache) {
      const cached = this.getCachedData(actualSessionId, actualKey);
      if (cached !== null) {
        return cached;
      }
    }

    const session = await this.retrieveSession(actualSessionId);
    return session?.data[actualKey] ?? null;
  }

  async retrieveSession(sessionId: string): Promise<SessionState | null> {
    this.ensureInitialized();

    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    const sessionData = await this.backend?.retrieve(sessionId, 'session');
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
    if (!session || !(actualKey in session.data)) {
      return false;
    }

    delete session.data[actualKey];
    session.vectors?.delete(actualKey);
    session.metadata.updated = Date.now();

    // Update backend
    await this.backend?.store(actualSessionId, session as unknown as JSONValue, 'session');

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

    for (const session of this.sessions.values()) {
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

  private async loadFromBackend(): Promise<void> {
    const namespaces = await this.backend?.listNamespaces();
    for (const namespace of namespaces) {
      if (namespace === 'session') {
        const sessionKeys = await this.backend?.search('*', 'session');
        for (const key in sessionKeys) {
          const sessionData = await this.backend?.retrieve(key, 'session');
          if (sessionData) {
            this.sessions.set(key, sessionData as unknown as SessionState);
          }
        }
      }
    }
  }

  private async saveToBackend(): Promise<void> {
    for (const [sessionId, session] of this.sessions.entries()) {
      await this.backend?.store(sessionId, session as unknown as JSONValue, 'session');
    }
  }

  private updateCache(sessionId: string, key: string, data: any): void {
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

  private getCachedData(sessionId: string, key: string): any {
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
    if (!this.initialized || !this.backend) {
      throw new Error('Session memory store not initialized. Call initialize() first.');
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

  async storeData(key: string, data: any): Promise<void> {
    return this.store.store('default', key, data);
  }

  async retrieve(key: string): Promise<any> {
    return this.store.retrieve('default', key);
  }

  async shutdown(): Promise<void> {
    await this.store.shutdown();
  }
}
