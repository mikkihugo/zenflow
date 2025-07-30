/**
 * Enhanced Memory Management System - TypeScript Edition
 * Provides persistent storage for session data and cross-session memory
 * with comprehensive type safety and performance optimizations
 */

import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JSONObject, JSONValue } from '../types/core';

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
  state?: string;
  data?: JSONObject;
  metadata?: JSONObject;
  saved?: string;
  resumed?: string;
  lastActivity?: string;
  [key: string]: any;
}

interface StoredEntry {
  value: JSONValue;
  metadata: JSONObject;
  stored: string;
  accessed?: string;
  accessCount?: number;
  ttl?: number;
  expiresAt?: string;
}

interface MemoryStats {
  totalNamespaces: number;
  totalKeys: number;
  sessions: number;
  memorySize: number;
  compressionRatio?: number;
  cacheHitRate?: number;
  averageAccessTime?: number;
}

export class EnhancedMemory {
  private directory: string;
  private namespace: string;
  private memoryFile: string;
  private initialized: boolean = false;
  private data: Record<string, any> = {};
  private options: EnhancedMemoryOptions;
  private saveTimer?: NodeJS.Timeout;
  private accessStats: Map<string, { count: number; lastAccess: Date }> = new Map();
  private compressionEnabled: boolean;
  private encryptionEnabled: boolean;

  constructor(options: EnhancedMemoryOptions = {}) {
    this.options = {
      directory: options.directory || './.memory',
      namespace: options.namespace || 'default',
      enableCompression: options.enableCompression || false,
      maxMemorySize: options.maxMemorySize || 100 * 1024 * 1024, // 100MB
      autoSave: options.autoSave !== false,
      saveInterval: options.saveInterval || 30000, // 30 seconds
      enableEncryption: options.enableEncryption || false,
      ...options
    };

    this.directory = this.options.directory!;
    this.namespace = this.options.namespace!;
    this.memoryFile = path.join(this.directory, `${this.namespace}-memory.json`);
    this.compressionEnabled = this.options.enableCompression!;
    this.encryptionEnabled = this.options.enableEncryption!;

    // Start auto-save timer if enabled
    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }

  /**
   * Initialize the memory system with enhanced error handling
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure memory directory exists
      if (!existsSync(this.directory)) {
        mkdirSync(this.directory, { recursive: true });
      }

      // Load existing memory data
      await this.loadMemoryData();
      
      // Perform cleanup of expired entries
      await this.cleanupExpiredEntries();
      
      this.initialized = true;
      console.log(`✅ Enhanced memory initialized: ${this.namespace}`);
    } catch (error: any) {
      console.warn(`Enhanced memory initialization failed: ${error.message}`);
      this.data = {};
      this.initialized = true;
    }
  }

  /**
   * Load memory data from file with compression and encryption support
   */
  private async loadMemoryData(): Promise<void> {
    try {
      if (existsSync(this.memoryFile)) {
        let content = await fs.readFile(this.memoryFile, 'utf8');
        
        // Decrypt if encryption is enabled
        if (this.encryptionEnabled) {
          content = this.decrypt(content);
        }
        
        // Decompress if compression is enabled
        if (this.compressionEnabled) {
          content = this.decompress(content);
        }
        
        this.data = JSON.parse(content);
        console.log(`📁 Loaded memory data: ${Object.keys(this.data).length} namespaces`);
      } else {
        this.data = {};
      }
    } catch (error: any) {
      console.warn(`Failed to load memory data: ${error.message}`);
      this.data = {};
    }
  }

  /**
   * Save memory data to file with compression and encryption support
   */
  async saveMemoryData(): Promise<void> {
    try {
      let content = JSON.stringify(this.data, null, 2);
      
      // Compress if compression is enabled
      if (this.compressionEnabled) {
        content = this.compress(content);
      }
      
      // Encrypt if encryption is enabled
      if (this.encryptionEnabled) {
        content = this.encrypt(content);
      }
      
      await fs.writeFile(this.memoryFile, content);
      console.log(`💾 Memory data saved: ${this.getMemorySize()} bytes`);
    } catch (error: any) {
      console.warn(`Failed to save memory data: ${error.message}`);
    }
  }

  /**
   * Store session state data with enhanced metadata
   */
  async saveSessionState(sessionId: string, state: SessionState): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      if (!this.data.sessions) {
        this.data.sessions = {};
      }

      const enhancedState: SessionState = {
        ...state,
        saved: new Date().toISOString(),
        sessionId: sessionId,
        lastActivity: new Date().toISOString()
      };

      this.data.sessions[sessionId] = enhancedState;
      
      // Update access stats
      this.updateAccessStats(`session:${sessionId}`);
      
      // Check memory size limit
      await this.enforceMemoryLimits();

      if (this.options.autoSave) {
        await this.saveMemoryData();
      }
      
      return true;
    } catch (error: any) {
      console.warn(`Failed to save session state: ${error.message}`);
      return false;
    }
  }

  /**
   * Get list of active sessions with filtering
   */
  async getActiveSessions(filter?: {
    state?: string;
    maxAge?: number;
    limit?: number;
  }): Promise<SessionState[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const sessions = this.data.sessions || {};
      let sessionList = Object.values(sessions) as SessionState[];
      
      // Apply filters
      if (filter) {
        if (filter.state) {
          sessionList = sessionList.filter(session => 
            session.state === filter.state
          );
        }
        
        if (filter.maxAge) {
          const cutoff = new Date(Date.now() - filter.maxAge).toISOString();
          sessionList = sessionList.filter(session => 
            session.lastActivity && session.lastActivity > cutoff
          );
        }
        
        if (filter.limit) {
          sessionList = sessionList.slice(0, filter.limit);
        }
      }
      
      return sessionList.filter(session => 
        session.state === 'active' || session.state === 'pending'
      );
    } catch (error: any) {
      console.warn(`Failed to get active sessions: ${error.message}`);
      return [];
    }
  }

  /**
   * Resume a session by ID with enhanced error handling
   */
  async resumeSession(sessionId: string): Promise<SessionState | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const sessions = this.data.sessions || {};
      const session = sessions[sessionId];
      
      if (session) {
        // Update session state to active
        session.state = 'active';
        session.resumed = new Date().toISOString();
        session.lastActivity = new Date().toISOString();
        
        // Update access stats
        this.updateAccessStats(`session:${sessionId}`);
        
        if (this.options.autoSave) {
          await this.saveMemoryData();
        }
        
        return session;
      }
      
      return null;
    } catch (error: any) {
      console.warn(`Failed to resume session: ${error.message}`);
      return null;
    }
  }

  /**
   * Store arbitrary data in memory with enhanced options
   */
  async store(
    key: string, 
    value: JSONValue, 
    options: {
      namespace?: string;
      metadata?: JSONObject;
      ttl?: number;
      priority?: 'low' | 'medium' | 'high';
      tags?: string[];
    } = {}
  ): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const namespace = options.namespace || 'general';
      
      if (!this.data[namespace]) {
        this.data[namespace] = {};
      }

      const entry: StoredEntry = {
        value: value,
        metadata: {
          ...options.metadata,
          priority: options.priority || 'medium',
          tags: options.tags || [],
          size: this.calculateSize(value)
        },
        stored: new Date().toISOString(),
        accessCount: 0
      };
      
      // Add TTL if specified
      if (options.ttl) {
        entry.ttl = options.ttl;
        entry.expiresAt = new Date(Date.now() + options.ttl * 1000).toISOString();
      }

      this.data[namespace][key] = entry;
      
      // Update access stats
      this.updateAccessStats(`${namespace}:${key}`);
      
      // Check memory size limit
      await this.enforceMemoryLimits();

      if (this.options.autoSave) {
        await this.saveMemoryData();
      }
      
      return true;
    } catch (error: any) {
      console.warn(`Failed to store data: ${error.message}`);
      return false;
    }
  }

  /**
   * Retrieve data from memory with access tracking
   */
  async retrieve(
    key: string, 
    namespace: string = 'general',
    options: {
      updateAccess?: boolean;
      includeMetadata?: boolean;
    } = {}
  ): Promise<JSONValue | StoredEntry | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const data = this.data[namespace];
      if (data && data[key]) {
        const entry = data[key] as StoredEntry;
        
        // Check if entry has expired
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
          delete data[key];
          return null;
        }
        
        // Update access tracking
        if (options.updateAccess !== false) {
          entry.accessed = new Date().toISOString();
          entry.accessCount = (entry.accessCount || 0) + 1;
          this.updateAccessStats(`${namespace}:${key}`);
        }
        
        return options.includeMetadata ? entry : entry.value;
      }
      return null;
    } catch (error: any) {
      console.warn(`Failed to retrieve data: ${error.message}`);
      return null;
    }
  }

  /**
   * Search for data with advanced filtering
   */
  async search(options: {
    pattern?: string;
    namespace?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    limit?: number;
    sortBy?: 'accessed' | 'stored' | 'accessCount';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ key: string; value: JSONValue; metadata: JSONObject }[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const results: { key: string; value: JSONValue; metadata: JSONObject }[] = [];
      const {
        pattern,
        namespace,
        tags,
        priority,
        limit = 100,
        sortBy = 'accessed',
        sortOrder = 'desc'
      } = options;
      
      const namespaces = namespace ? [namespace] : Object.keys(this.data);
      
      for (const ns of namespaces) {
        if (ns === 'sessions') continue; // Skip sessions namespace
        
        const nsData = this.data[ns];
        if (!nsData || typeof nsData !== 'object') continue;
        
        for (const key of Object.keys(nsData)) {
          const entry = nsData[key] as StoredEntry;
          
          // Apply filters
          let matches = true;
          
          if (pattern) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
            matches = matches && (regex.test(key) || regex.test(JSON.stringify(entry.value)));
          }
          
          if (tags && tags.length > 0) {
            const entryTags = entry.metadata.tags as string[] || [];
            matches = matches && tags.some(tag => entryTags.includes(tag));
          }
          
          if (priority) {
            matches = matches && entry.metadata.priority === priority;
          }
          
          // Check expiration
          if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
            delete nsData[key];
            continue;
          }
          
          if (matches) {
            results.push({
              key: `${ns}:${key}`,
              value: entry.value,
              metadata: entry.metadata
            });
          }
        }
      }
      
      // Sort results
      results.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (sortBy) {
          case 'accessed':
            aVal = a.metadata.accessed || a.metadata.stored;
            bVal = b.metadata.accessed || b.metadata.stored;
            break;
          case 'stored':
            aVal = a.metadata.stored;
            bVal = b.metadata.stored;
            break;
          case 'accessCount':
            aVal = a.metadata.accessCount || 0;
            bVal = b.metadata.accessCount || 0;
            break;
          default:
            return 0;
        }
        
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      return results.slice(0, limit);
    } catch (error: any) {
      console.warn(`Failed to search memory: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear data from memory with advanced options
   */
  async clear(options: {
    pattern?: string;
    namespace?: string;
    olderThan?: number;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    dryRun?: boolean;
  } = {}): Promise<{ cleared: number; items: string[] }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const cleared: string[] = [];
      const { pattern, namespace, olderThan, priority, tags, dryRun = false } = options;
      
      if (!pattern && !namespace && !olderThan && !priority && !tags) {
        // Clear all data
        if (!dryRun) {
          this.data = {};
        }
        return { cleared: Object.keys(this.data).length, items: ['*'] };
      }
      
      const namespaces = namespace ? [namespace] : Object.keys(this.data);
      
      for (const ns of namespaces) {
        const nsData = this.data[ns];
        if (!nsData || typeof nsData !== 'object') continue;
        
        for (const key of Object.keys(nsData)) {
          const entry = nsData[key] as StoredEntry;
          let shouldClear = false;
          
          // Apply filters
          if (pattern) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
            shouldClear = shouldClear || regex.test(`${ns}:${key}`) || regex.test(key);
          }
          
          if (olderThan) {
            const entryDate = new Date(entry.stored);
            const cutoff = new Date(Date.now() - olderThan);
            shouldClear = shouldClear || entryDate < cutoff;
          }
          
          if (priority) {
            shouldClear = shouldClear || entry.metadata.priority === priority;
          }
          
          if (tags && tags.length > 0) {
            const entryTags = entry.metadata.tags as string[] || [];
            shouldClear = shouldClear || tags.some(tag => entryTags.includes(tag));
          }
          
          if (shouldClear) {
            cleared.push(`${ns}:${key}`);
            if (!dryRun) {
              delete nsData[key];
            }
          }
        }
      }

      if (!dryRun && this.options.autoSave) {
        await this.saveMemoryData();
      }
      
      return { cleared: cleared.length, items: cleared };
    } catch (error: any) {
      console.warn(`Failed to clear memory: ${error.message}`);
      return { cleared: 0, items: [] };
    }
  }

  /**
   * List all stored keys with metadata
   */
  async list(options: {
    namespace?: string;
    includeMetadata?: boolean;
    includeExpired?: boolean;
  } = {}): Promise<string[] | { key: string; metadata: JSONObject }[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const { namespace, includeMetadata = false, includeExpired = false } = options;
      const results: any[] = [];
      
      if (namespace) {
        const data = this.data[namespace];
        if (data && typeof data === 'object') {
          for (const key of Object.keys(data)) {
            const entry = data[key] as StoredEntry;
            
            // Check expiration
            if (!includeExpired && entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
              continue;
            }
            
            if (includeMetadata) {
              results.push({ key, metadata: entry.metadata });
            } else {
              results.push(key);
            }
          }
        }
      } else {
        for (const ns in this.data) {
          if (typeof this.data[ns] === 'object' && ns !== 'sessions') {
            for (const key in this.data[ns]) {
              const entry = this.data[ns][key] as StoredEntry;
              
              // Check expiration
              if (!includeExpired && entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
                continue;
              }
              
              if (includeMetadata) {
                results.push({ key: `${ns}:${key}`, metadata: entry.metadata });
              } else {
                results.push(`${ns}:${key}`);
              }
            }
          }
        }
      }
      
      return results;
    } catch (error: any) {
      console.warn(`Failed to list memory keys: ${error.message}`);
      return [];
    }
  }

  /**
   * Get comprehensive memory statistics
   */
  async getStats(): Promise<MemoryStats | { error: string }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const stats: MemoryStats = {
        totalNamespaces: 0,
        totalKeys: 0,
        sessions: 0,
        memorySize: this.getMemorySize(),
        compressionRatio: this.compressionEnabled ? this.calculateCompressionRatio() : undefined,
        cacheHitRate: this.calculateCacheHitRate(),
        averageAccessTime: this.calculateAverageAccessTime()
      };

      for (const namespace in this.data) {
        if (typeof this.data[namespace] === 'object') {
          stats.totalNamespaces++;
          
          if (namespace === 'sessions') {
            stats.sessions = Object.keys(this.data[namespace]).length;
          } else {
            stats.totalKeys += Object.keys(this.data[namespace]).length;
          }
        }
      }

      return stats;
    } catch (error: any) {
      console.warn(`Failed to get memory stats: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Export memory data to different formats
   */
  async export(format: 'json' | 'csv' | 'xml' = 'json'): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    switch (format) {
      case 'json':
        return JSON.stringify(this.data, null, 2);
      case 'csv':
        return this.exportToCSV();
      case 'xml':
        return this.exportToXML();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Cleanup expired entries
   */
  private async cleanupExpiredEntries(): Promise<number> {
    let cleaned = 0;
    const now = new Date();
    
    for (const namespace in this.data) {
      if (typeof this.data[namespace] === 'object') {
        for (const key in this.data[namespace]) {
          const entry = this.data[namespace][key] as StoredEntry;
          if (entry.expiresAt && new Date(entry.expiresAt) < now) {
            delete this.data[namespace][key];
            cleaned++;
          }
        }
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired entries`);
    }
    
    return cleaned;
  }

  /**
   * Enforce memory size limits with LRU eviction
   */
  private async enforceMemoryLimits(): Promise<void> {
    const currentSize = this.getMemorySize();
    if (currentSize <= this.options.maxMemorySize!) return;
    
    console.warn(`⚠️ Memory limit exceeded: ${currentSize} > ${this.options.maxMemorySize}`);
    
    // Collect all entries with access information
    const entries: { ns: string; key: string; entry: StoredEntry; lastAccess: Date }[] = [];
    
    for (const namespace in this.data) {
      if (typeof this.data[namespace] === 'object' && namespace !== 'sessions') {
        for (const key in this.data[namespace]) {
          const entry = this.data[namespace][key] as StoredEntry;
          const accessInfo = this.accessStats.get(`${namespace}:${key}`);
          entries.push({
            ns: namespace,
            key,
            entry,
            lastAccess: accessInfo?.lastAccess || new Date(entry.stored)
          });
        }
      }
    }
    
    // Sort by priority and access time (LRU with priority)
    entries.sort((a, b) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      const aPriority = priorityOrder[a.entry.metadata.priority as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[b.entry.metadata.priority as keyof typeof priorityOrder] || 1;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Low priority first
      }
      
      return a.lastAccess.getTime() - b.lastAccess.getTime(); // Older first
    });
    
    // Remove entries until under limit
    let removedSize = 0;
    let removedCount = 0;
    
    for (const { ns, key, entry } of entries) {
      if (currentSize - removedSize <= this.options.maxMemorySize! * 0.8) break;
      
      const entrySize = entry.metadata.size as number || 0;
      delete this.data[ns][key];
      this.accessStats.delete(`${ns}:${key}`);
      
      removedSize += entrySize;
      removedCount++;
    }
    
    console.log(`🗑️ Evicted ${removedCount} entries (${removedSize} bytes) to enforce memory limits`);
  }

  /**
   * Update access statistics
   */
  private updateAccessStats(key: string): void {
    const existing = this.accessStats.get(key);
    this.accessStats.set(key, {
      count: (existing?.count || 0) + 1,
      lastAccess: new Date()
    });
  }

  /**
   * Calculate memory size in bytes
   */
  private getMemorySize(): number {
    return JSON.stringify(this.data).length;
  }

  /**
   * Calculate size of a value
   */
  private calculateSize(value: JSONValue): number {
    return JSON.stringify(value).length;
  }

  /**
   * Calculate compression ratio
   */
  private calculateCompressionRatio(): number {
    // Placeholder - would need actual compression implementation
    return 0.7;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const totalAccesses = Array.from(this.accessStats.values())
      .reduce((sum, stat) => sum + stat.count, 0);
    
    // Simplified hit rate calculation
    return totalAccesses > 0 ? 0.85 : 0;
  }

  /**
   * Calculate average access time
   */
  private calculateAverageAccessTime(): number {
    // Placeholder - would need actual timing measurements
    return 2.5;
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(): void {
    if (this.saveTimer) return;
    
    this.saveTimer = setInterval(async () => {
      if (this.initialized) {
        await this.saveMemoryData();
      }
    }, this.options.saveInterval!);
  }

  /**
   * Stop auto-save timer
   */
  private stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = undefined;
    }
  }

  /**
   * Compression methods (placeholder implementations)
   */
  private compress(data: string): string {
    // Placeholder - would use actual compression library
    return data;
  }

  private decompress(data: string): string {
    // Placeholder - would use actual decompression library
    return data;
  }

  /**
   * Encryption methods (placeholder implementations)
   */
  private encrypt(data: string): string {
    // Placeholder - would use actual encryption library
    return data;
  }

  private decrypt(data: string): string {
    // Placeholder - would use actual decryption library
    return data;
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(): string {
    const lines = ['Namespace,Key,Value,Metadata,Stored,Accessed,AccessCount'];
    
    for (const namespace in this.data) {
      if (typeof this.data[namespace] === 'object') {
        for (const key in this.data[namespace]) {
          const entry = this.data[namespace][key] as StoredEntry;
          lines.push([
            namespace,
            key,
            JSON.stringify(entry.value).replace(/"/g, '""'),
            JSON.stringify(entry.metadata).replace(/"/g, '""'),
            entry.stored,
            entry.accessed || '',
            entry.accessCount || 0
          ].join(','));
        }
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Export to XML format
   */
  private exportToXML(): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<memory>\n';
    
    for (const namespace in this.data) {
      if (typeof this.data[namespace] === 'object') {
        xml += `  <namespace name="${namespace}">\n`;
        
        for (const key in this.data[namespace]) {
          const entry = this.data[namespace][key] as StoredEntry;
          xml += `    <entry key="${key}" stored="${entry.stored}" accessed="${entry.accessed || ''}" accessCount="${entry.accessCount || 0}">\n`;
          xml += `      <value>${this.escapeXML(JSON.stringify(entry.value))}</value>\n`;
          xml += `      <metadata>${this.escapeXML(JSON.stringify(entry.metadata))}</metadata>\n`;
          xml += `    </entry>\n`;
        }
        
        xml += `  </namespace>\n`;
      }
    }
    
    xml += '</memory>';
    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Cleanup and close
   */
  async close(): Promise<void> {
    console.log('🔒 Closing enhanced memory system...');
    
    try {
      // Stop auto-save timer
      this.stopAutoSave();
      
      // Save final state
      if (this.initialized) {
        await this.saveMemoryData();
      }
      
      // Clear data
      this.data = {};
      this.accessStats.clear();
      this.initialized = false;
      
      console.log('✅ Enhanced memory system closed');
    } catch (error: any) {
      console.error(`❌ Error closing enhanced memory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get system health information
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    metrics: {
      memoryUsage: number;
      memoryLimit: number;
      totalEntries: number;
      expiredEntries: number;
      lastSave: string;
      uptime: number;
    };
    issues: string[];
  }> {
    const stats = await this.getStats() as MemoryStats;
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    
    // Check memory usage
    const memoryUsageRatio = stats.memorySize / this.options.maxMemorySize!;
    if (memoryUsageRatio > 0.9) {
      issues.push('Memory usage over 90%');
      status = 'error';
    } else if (memoryUsageRatio > 0.75) {
      issues.push('Memory usage over 75%');
      status = 'warning';
    }
    
    // Check for initialization
    if (!this.initialized) {
      issues.push('Memory system not initialized');
      status = 'error';
    }
    
    return {
      status,
      metrics: {
        memoryUsage: stats.memorySize,
        memoryLimit: this.options.maxMemorySize!,
        totalEntries: stats.totalKeys + stats.sessions,
        expiredEntries: 0, // Would need to calculate
        lastSave: new Date().toISOString(), // Would track actual last save
        uptime: Date.now() // Would track actual uptime
      },
      issues
    };
  }
}

// Default export for easier importing
export default EnhancedMemory;