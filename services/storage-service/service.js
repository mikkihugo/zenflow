#!/usr/bin/env node
/**
 * Storage Service
 * High-performance storage with memory management and persistence
 */

import { EventEmitter } from 'events';
import { memoryStore } from '../../src/memory/fallback-store.js';

export class StorageService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'storage-service';
    this.version = '1.0.0';
    this.port = options.port || 4004;
    this.memoryStore = memoryStore;
    this.cacheStrategy = options.cacheStrategy || 'lru';
    this.maxCacheSize = options.maxCacheSize || 1000;
    this.cache = new Map();
    this.status = 'stopped';
  }

  async start() {
    console.log(`🚀 Starting Storage Service on port ${this.port}`);
    
    await this.memoryStore.initialize();
    this.status = 'running';
    
    this.emit('started', { service: this.name, port: this.port });
    console.log(`✅ Storage Service running with ${this.memoryStore.isUsingFallback() ? 'in-memory' : 'SQLite'} backend`);
    
    return this;
  }

  async stop() {
    this.cache.clear();
    this.status = 'stopped';
    this.emit('stopped', { service: this.name });
    console.log(`🛑 Storage Service stopped`);
  }

  async store(key, value, options = {}) {
    try {
      const namespace = options.namespace || 'default';
      const metadata = {
        ...options.metadata,
        storedAt: new Date().toISOString(),
        service: this.name
      };

      // Store in persistent storage
      const result = await this.memoryStore.store(key, value, { 
        namespace, 
        metadata,
        ttl: options.ttl 
      });

      // Update cache
      this.updateCache(key, value, namespace);
      
      this.emit('data-stored', { key, namespace, size: JSON.stringify(value).length });
      
      return {
        success: true,
        key,
        namespace,
        stored: true,
        cached: true,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.emit('storage-error', { operation: 'store', key, error: error.message });
      return {
        success: false,
        error: error.message,
        key,
        timestamp: new Date().toISOString()
      };
    }
  }

  async retrieve(key, options = {}) {
    try {
      const namespace = options.namespace || 'default';
      const cacheKey = `${namespace}:${key}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        this.emit('cache-hit', { key, namespace });
        return {
          success: true,
          key,
          namespace,
          value: this.cache.get(cacheKey),
          source: 'cache',
          timestamp: new Date().toISOString()
        };
      }

      // Fallback to persistent storage
      const value = await this.memoryStore.retrieve(key, { namespace });
      
      if (value !== null) {
        this.updateCache(key, value, namespace);
        this.emit('cache-miss', { key, namespace });
        
        return {
          success: true,
          key,
          namespace,
          value,
          source: 'storage',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: false,
        error: 'Key not found',
        key,
        namespace,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.emit('storage-error', { operation: 'retrieve', key, error: error.message });
      return {
        success: false,
        error: error.message,
        key,
        timestamp: new Date().toISOString()
      };
    }
  }

  async search(pattern, options = {}) {
    try {
      const results = await this.memoryStore.search(pattern, options);
      
      this.emit('search-performed', { pattern, resultCount: results.length });
      
      return {
        success: true,
        pattern,
        results,
        count: results.length,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.emit('storage-error', { operation: 'search', pattern, error: error.message });
      return {
        success: false,
        error: error.message,
        pattern,
        timestamp: new Date().toISOString()
      };
    }
  }

  async delete(key, options = {}) {
    try {
      const namespace = options.namespace || 'default';
      const cacheKey = `${namespace}:${key}`;
      
      // Remove from cache
      this.cache.delete(cacheKey);
      
      // Remove from persistent storage
      const deleted = await this.memoryStore.delete(key, { namespace });
      
      this.emit('data-deleted', { key, namespace, deleted });
      
      return {
        success: true,
        key,
        namespace,
        deleted,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.emit('storage-error', { operation: 'delete', key, error: error.message });
      return {
        success: false,
        error: error.message,
        key,
        timestamp: new Date().toISOString()
      };
    }
  }

  updateCache(key, value, namespace) {
    const cacheKey = `${namespace}:${key}`;
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, value);
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      strategy: this.cacheStrategy,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }

  getStatus() {
    return {
      service: this.name,
      version: this.version,
      status: this.status,
      port: this.port,
      backend: this.memoryStore.isUsingFallback() ? 'in-memory' : 'SQLite',
      cache: this.getCacheStats(),
      endpoints: [
        'POST /storage/store',
        'GET /storage/retrieve/:key',
        'POST /storage/search',
        'DELETE /storage/delete/:key',
        'GET /storage/stats'
      ]
    };
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new StorageService();
  await service.start();
  
  process.on('SIGINT', async () => {
    await service.stop();
    process.exit(0);
  });
}