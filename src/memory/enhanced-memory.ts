/** Enhanced Memory Management System - TypeScript Edition */
/** Provides persistent storage for session data and cross-session memory */
/** with comprehensive type safety and performance optimizations */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';

interface EnhancedMemoryOptions {
  directory?: string;
  namespace?: string;
  enableCompression?: boolean;
  maxMemorySize?: number;
  autoSave?: boolean;
  saveInterval?: number;
  enableEncryption?: boolean;
  encryptionKey?: string;
}

interface SessionState {
  sessionId: string;
  data: Record<string, any>;
  metadata: {
    created: number;
    updated: number;
    accessed: number;
    size: number;
  };
}

interface MemoryStats {
  totalSessions: number;
  totalSize: number;
  averageAccessTime: number;
  cacheHitRate: number;
}

export class EnhancedMemory extends EventEmitter {
  private initialized = false;
  private sessions = new Map<string, SessionState>();
  private options: Required<EnhancedMemoryOptions>;
  private directory: string;
  private namespace: string;
  private memoryFile: string;
  private compressionEnabled: boolean;
  private encryptionEnabled: boolean;
  private autoSaveTimer?: NodeJS.Timeout;
  private stats: MemoryStats;

  constructor(options: EnhancedMemoryOptions = {}) {
    super();
    
    this.options = {
      directory: options.directory ?? './data/memory',
      namespace: options.namespace ?? 'claude-flow',
      enableCompression: options.enableCompression ?? false,
      maxMemorySize: options.maxMemorySize ?? 100 * 1024 * 1024, // 100MB
      autoSave: options.autoSave ?? true,
      saveInterval: options.saveInterval ?? 30000, // 30 seconds
      enableEncryption: options.enableEncryption ?? false,
      encryptionKey: options.encryptionKey ?? ''
    };

    this.directory = this.options.directory;
    this.namespace = this.options.namespace;
    this.memoryFile = path.join(this.directory, `${this.namespace}-memory.json`);
    this.compressionEnabled = this.options.enableCompression;
    this.encryptionEnabled = this.options.enableEncryption;
    
    this.stats = {
      totalSessions: 0,
      totalSize: 0,
      averageAccessTime: 0,
      cacheHitRate: 0
    };
  }

  /** Initialize the memory system with enhanced error handling */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Ensure memory directory exists
      if (!existsSync(this.directory)) {
        mkdirSync(this.directory, { recursive: true });
      }

      // Load existing memory data
      await this.loadFromDisk();

      // Start auto-save timer if enabled
      if (this.options.autoSave) {
        this.startAutoSave();
      }

      this.initialized = true;
      this.emit('initialized', { namespace: this.namespace });
      
      console.log(`✅ Enhanced memory initialized: ${this.namespace}`);
      console.log(`📁 Directory: ${this.directory}`);
      console.log(`📊 Sessions loaded: ${this.sessions.size}`);
      
    } catch (error) {
      console.error('❌ Enhanced memory initialization failed:', error);
      throw error;
    }
  }

  /** Store data in a session with metadata tracking */
  async store(sessionId: string, key: string, data: any): Promise<void> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    
    try {
      let session = this.sessions.get(sessionId);
      
      if (!session) {
        session = {
          sessionId,
          data: {},
          metadata: {
            created: Date.now(),
            updated: Date.now(),
            accessed: Date.now(),
            size: 0
          }
        };
        this.sessions.set(sessionId, session);
        this.stats.totalSessions++;
      }

      // Store the data
      session.data[key] = data;
      session.metadata.updated = Date.now();
      session.metadata.accessed = Date.now();
      
      // Calculate size (approximate)
      const dataString = JSON.stringify(session.data);
      session.metadata.size = dataString.length;
      
      // Update statistics
      this.updateStats();
      
      const duration = Date.now() - startTime;
      this.emit('stored', { sessionId, key, duration });
      
    } catch (error) {
      console.error(`❌ Failed to store data for session ${sessionId}:`, error);
      throw error;
    }
  }

  /** Retrieve data from a session */
  async retrieve(sessionId: string, key?: string): Promise<any> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return null;
      }

      // Update access time
      session.metadata.accessed = Date.now();
      
      const result = key ? session.data[key] : session.data;
      
      const duration = Date.now() - startTime;
      this.emit('retrieved', { sessionId, key, found: !!result, duration });
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to retrieve data for session ${sessionId}:`, error);
      throw error;
    }
  }

  /** Get all session IDs */
  getSessions(): string[] {
    this.ensureInitialized();
    return Array.from(this.sessions.keys());
  }

  /** Get memory statistics */
  getStats(): MemoryStats {
    this.updateStats();
    return { ...this.stats };
  }

  /** Clear a specific session */
  async clearSession(sessionId: string): Promise<boolean> {
    this.ensureInitialized();
    
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.stats.totalSessions--;
      this.emit('sessionCleared', { sessionId });
    }
    
    return deleted;
  }

  /** Clear all sessions */
  async clearAll(): Promise<void> {
    this.ensureInitialized();
    
    const count = this.sessions.size;
    this.sessions.clear();
    this.stats.totalSessions = 0;
    
    this.emit('allCleared', { clearedCount: count });
  }

  /** Save memory to disk */
  async saveToDisk(): Promise<void> {
    this.ensureInitialized();
    
    try {
      const memoryData = {
        namespace: this.namespace,
        timestamp: Date.now(),
        sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
          id,
          ...session
        })),
        stats: this.stats
      };

      let dataToWrite = JSON.stringify(memoryData, null, 2);
      
      // Apply compression if enabled
      if (this.compressionEnabled) {
        // Simple compression could be implemented here
        // For now, just minify JSON
        dataToWrite = JSON.stringify(memoryData);
      }

      writeFileSync(this.memoryFile, dataToWrite);
      this.emit('saved', { file: this.memoryFile, size: dataToWrite.length });
      
    } catch (error) {
      console.error('❌ Failed to save memory to disk:', error);
      throw error;
    }
  }

  /** Load memory from disk */
  private async loadFromDisk(): Promise<void> {
    if (!existsSync(this.memoryFile)) {
      console.log('📝 No existing memory file found, starting fresh');
      return;
    }

    try {
      const dataString = readFileSync(this.memoryFile, 'utf8');
      const memoryData = JSON.parse(dataString);
      
      // Restore sessions
      if (memoryData.sessions) {
        for (const sessionData of memoryData.sessions) {
          this.sessions.set(sessionData.id, {
            sessionId: sessionData.sessionId,
            data: sessionData.data,
            metadata: sessionData.metadata
          });
        }
      }
      
      // Restore stats
      if (memoryData.stats) {
        this.stats = { ...this.stats, ...memoryData.stats };
      }
      
      this.emit('loaded', { sessions: this.sessions.size });
      
    } catch (error) {
      console.warn('⚠️ Failed to load existing memory, starting fresh:', error);
    }
  }

  /** Start auto-save timer */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(async () => {
      try {
        await this.saveToDisk();
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, this.options.saveInterval);
  }

  /** Update internal statistics */
  private updateStats(): void {
    let totalSize = 0;
    
    for (const session of this.sessions.values()) {
      totalSize += session.metadata.size;
    }
    
    this.stats.totalSessions = this.sessions.size;
    this.stats.totalSize = totalSize;
  }

  /** Ensure system is initialized */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Enhanced memory system not initialized. Call initialize() first.');
    }
  }

  /** Cleanup and shutdown */
  async shutdown(): Promise<void> {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    if (this.initialized) {
      await this.saveToDisk();
    }
    
    this.initialized = false;
    this.emit('shutdown');
  }
}

export default EnhancedMemory;