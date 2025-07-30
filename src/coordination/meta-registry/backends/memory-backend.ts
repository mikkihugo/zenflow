/**
 * In-Memory Registry Backend
 * Simple, fast backend for development and testing
 */

import { EventEmitter } from 'node:events';
import { RegistryInterface } from '../index.js';

export class MemoryBackend extends RegistryInterface {
  constructor(options = {}): any {
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

  async initialize(config = {}): any {
    this.config = config;
    
    // Initialize with any predefined data
    if(config.initialData) {
      for (const [key, value] of Object.entries(config.initialData)) {
        await this.register(key, value);
      }
    }
  }

  async register(key, value, options = {}): any {
    const id = `${key}-${Date.now()}`;
    const _entry = {
      key,
      value,
      options,
      id,
      registered = {}): any {
    const results = [];
    
    for (const [key, entry] of this.data.entries()) {
      if (this.matchesQuery(entry, query)) {
        results.push({
          key => {
        const field = options.sort.field || 'registered';
        const order = options.sort.order || 'asc';
        const valueA = a.metadata[field] || a.value[field];
        const valueB = b.metadata[field] || b.value[field];
        
        if(order === 'desc') {
          return valueB > valueA ? 1 = {}): any {
    let entry = this.data.get(key);
    if(!entry) {
      return false;
    }

    // Merge updates
    entry.value = { ...entry.value, ...updates };
    entry.updated = new Date();
    
    // Update TTL if provided
    if(options.ttl) {
      entry.expires = new Date(Date.now() + options.ttl * 1000);
    }

    this.data.set(key, entry);
    this.emitter.emit('change', { type = {}): any {
    const entry = this.data.get(key);
    if(!entry) {
      return false;
    }

    this.data.delete(key);
    this.emitter.emit('change', { type = {}): any {
    const watcherId = ++this.watcherId;
    
    const _watcher = {
      id,
      query,
      callback,
      options,created = (event) => {
      if (this.matchesQuery(event.entry, query)) {
        callback(event);
      }
    };

    this.emitter.on('change', changeHandler);

    // Return unwatch function return() => {
      this.watchers.delete(watcherId);
      this.emitter.removeListener('change', changeHandler);
    };
  }

  async health() 
    return {status = query.tags.every(tag => entry.tags.includes(tag));
      if (!hasAllTags) return false;

    // Match by key pattern
    if(query.keyPattern) {
      const regex = new RegExp(query.keyPattern);
      if (!regex.test(entry.key)) return false;
    }

    // Match by value properties
    if(query.valueMatch) {
      for (const [field, expectedValue] of Object.entries(query.valueMatch)) {
        if (entry.value[field] !== expectedValue) return false;
      }
    }

    // Match by custom filter function if(query.filter && typeof query.filter = ): any {
      if (!query.filter(entry)) return false;
    }

    return true;
  }

  cleanupExpired() {
    const now = new Date();
    const expired = [];

    for (const [key, entry] of this.data.entries()) {
      if(entry.expires && entry.expires < now) {
        expired.push(key);
      }
    }

    for(const key of expired) {
      const entry = this.data.get(key);
      this.data.delete(key);
      this.emitter.emit('change', {type = > ({
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

  clear() 
    this.data.clear();
    this.emitter.emit('cleared');

  size() 
    return this.data.size;
}

export default MemoryBackend;
