/**
 * In-Memory Registry Backend
 * Simple, fast backend for development and testing
 */

import { EventEmitter } from 'events';
import { RegistryInterface } from '../index.js';

export class MemoryBackend extends RegistryInterface {
  constructor(options = {}) {
    super();
    this.options = options;
    this.data = new Map();
    this.watchers = new Map();
    this.watcherId = 0;
    this.emitter = new EventEmitter();
    
    // TTL cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, options.cleanupInterval || 30000);
  }

  async initialize(config = {}) {
    this.config = config;
    
    // Initialize with any predefined data
    if (config.initialData) {
      for (const [key, value] of Object.entries(config.initialData)) {
        await this.register(key, value);
      }
    }
  }

  async register(key, value, options = {}) {
    const id = `${key}-${Date.now()}`;
    const entry = {
      key,
      value,
      options,
      id,
      registered: new Date(),
      expires: options.ttl ? new Date(Date.now() + options.ttl * 1000) : null,
      tags: options.tags || []
    };

    this.data.set(key, entry);
    this.emitter.emit('change', { type: 'register', key, entry });
    
    return id;
  }

  async discover(query, options = {}) {
    const results = [];
    
    for (const [key, entry] of this.data.entries()) {
      if (this.matchesQuery(entry, query)) {
        results.push({
          key: entry.key,
          value: entry.value,
          metadata: {
            id: entry.id,
            registered: entry.registered,
            expires: entry.expires,
            tags: entry.tags
          }
        });
      }
    }

    // Apply sorting and limits
    if (options.sort) {
      results.sort((a, b) => {
        const field = options.sort.field || 'registered';
        const order = options.sort.order || 'asc';
        const valueA = a.metadata[field] || a.value[field];
        const valueB = b.metadata[field] || b.value[field];
        
        if (order === 'desc') {
          return valueB > valueA ? 1 : -1;
        }
        return valueA > valueB ? 1 : -1;
      });
    }

    if (options.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  async update(key, updates, options = {}) {
    const entry = this.data.get(key);
    if (!entry) {
      return false;
    }

    // Merge updates
    entry.value = { ...entry.value, ...updates };
    entry.updated = new Date();
    
    // Update TTL if provided
    if (options.ttl) {
      entry.expires = new Date(Date.now() + options.ttl * 1000);
    }

    this.data.set(key, entry);
    this.emitter.emit('change', { type: 'update', key, entry, updates });
    
    return true;
  }

  async unregister(key, options = {}) {
    const entry = this.data.get(key);
    if (!entry) {
      return false;
    }

    this.data.delete(key);
    this.emitter.emit('change', { type: 'unregister', key, entry });
    
    return true;
  }

  async watch(query, callback, options = {}) {
    const watcherId = ++this.watcherId;
    
    const watcher = {
      id: watcherId,
      query,
      callback,
      options,
      created: new Date()
    };

    this.watchers.set(watcherId, watcher);

    // Listen for changes
    const changeHandler = (event) => {
      if (this.matchesQuery(event.entry, query)) {
        callback(event);
      }
    };

    this.emitter.on('change', changeHandler);

    // Return unwatch function
    return () => {
      this.watchers.delete(watcherId);
      this.emitter.removeListener('change', changeHandler);
    };
  }

  async health() {
    return {
      status: 'healthy',
      backend: 'memory',
      entries: this.data.size,
      watchers: this.watchers.size,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  async close() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.data.clear();
    this.watchers.clear();
    this.emitter.removeAllListeners();
  }

  // Private methods
  matchesQuery(entry, query) {
    if (!query) return true;

    // Match by tags
    if (query.tags && query.tags.length > 0) {
      const hasAllTags = query.tags.every(tag => entry.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    // Match by key pattern
    if (query.keyPattern) {
      const regex = new RegExp(query.keyPattern);
      if (!regex.test(entry.key)) return false;
    }

    // Match by value properties
    if (query.valueMatch) {
      for (const [field, expectedValue] of Object.entries(query.valueMatch)) {
        if (entry.value[field] !== expectedValue) return false;
      }
    }

    // Match by custom filter function
    if (query.filter && typeof query.filter === 'function') {
      if (!query.filter(entry)) return false;
    }

    return true;
  }

  cleanupExpired() {
    const now = new Date();
    const expired = [];

    for (const [key, entry] of this.data.entries()) {
      if (entry.expires && entry.expires < now) {
        expired.push(key);
      }
    }

    for (const key of expired) {
      const entry = this.data.get(key);
      this.data.delete(key);
      this.emitter.emit('change', { type: 'expired', key, entry });
    }

    if (expired.length > 0) {
      this.emitter.emit('cleanup', { expired: expired.length });
    }
  }

  // Utility methods for testing and debugging
  dump() {
    return Array.from(this.data.entries()).map(([key, entry]) => ({
      key,
      value: entry.value,
      metadata: {
        id: entry.id,
        registered: entry.registered,
        expires: entry.expires,
        tags: entry.tags
      }
    }));
  }

  clear() {
    this.data.clear();
    this.emitter.emit('cleared');
  }

  size() {
    return this.data.size;
  }
}

export default MemoryBackend;