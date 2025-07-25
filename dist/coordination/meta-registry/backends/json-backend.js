/**
 * JSON File Registry Backend
 * Persistent file-based backend for simple setups
 */

import fs from 'fs-extra';
import path from 'path';
import { EventEmitter } from 'events';
import { RegistryInterface } from '../index.js';

export class JSONBackend extends RegistryInterface {
  constructor(filePath, options = {}) {
    super();
    this.filePath = filePath;
    this.options = {
      autoSave: true,
      saveInterval: 5000,
      backup: true,
      maxBackups: 5,
      ...options
    };
    
    this.data = new Map();
    this.watchers = new Map();
    this.watcherId = 0;
    this.emitter = new EventEmitter();
    this.saveTimer = null;
    this.needsSave = false;
    this.isLoading = false;
    this.isSaving = false;
  }

  async initialize(config = {}) {
    this.config = config;
    await this.ensureDirectoryExists();
    await this.load();
    
    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }

  async register(key, value, options = {}) {
    const id = `${key}-${Date.now()}`;
    const entry = {
      key,
      value,
      options,
      id,
      registered: new Date().toISOString(),
      expires: options.ttl ? new Date(Date.now() + options.ttl * 1000).toISOString() : null,
      tags: options.tags || []
    };

    this.data.set(key, entry);
    this.markForSave();
    this.emitter.emit('change', { type: 'register', key, entry });
    
    return id;
  }

  async discover(query, options = {}) {
    await this.ensureLoaded();
    const results = [];
    
    for (const [key, entry] of this.data.entries()) {
      // Skip expired entries
      if (this.isExpired(entry)) {
        continue;
      }
      
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

    return this.applyOptions(results, options);
  }

  async update(key, updates, options = {}) {
    await this.ensureLoaded();
    const entry = this.data.get(key);
    if (!entry || this.isExpired(entry)) {
      return false;
    }

    // Merge updates
    entry.value = { ...entry.value, ...updates };
    entry.updated = new Date().toISOString();
    
    // Update TTL if provided
    if (options.ttl) {
      entry.expires = new Date(Date.now() + options.ttl * 1000).toISOString();
    }

    this.data.set(key, entry);
    this.markForSave();
    this.emitter.emit('change', { type: 'update', key, entry, updates });
    
    return true;
  }

  async unregister(key, options = {}) {
    await this.ensureLoaded();
    const entry = this.data.get(key);
    if (!entry) {
      return false;
    }

    this.data.delete(key);
    this.markForSave();
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
      created: new Date().toISOString()
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
    await this.ensureLoaded();
    const expired = Array.from(this.data.values()).filter(entry => this.isExpired(entry));
    
    return {
      status: 'healthy',
      backend: 'json-file',
      filePath: this.filePath,
      entries: this.data.size,
      expired: expired.length,
      watchers: this.watchers.size,
      fileSize: await this.getFileSize(),
      lastModified: await this.getLastModified(),
      needsSave: this.needsSave,
      uptime: process.uptime()
    };
  }

  async close() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }
    
    if (this.needsSave) {
      await this.save();
    }
    
    this.watchers.clear();
    this.emitter.removeAllListeners();
  }

  // File operations
  async load() {
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      if (await fs.pathExists(this.filePath)) {
        const data = await fs.readJson(this.filePath);
        
        // Convert array back to Map
        if (Array.isArray(data)) {
          this.data.clear();
          for (const entry of data) {
            this.data.set(entry.key, entry);
          }
        } else if (data.entries) {
          this.data.clear();
          for (const entry of data.entries) {
            this.data.set(entry.key, entry);
          }
        }
        
        this.emitter.emit('loaded', { entries: this.data.size });
      }
    } catch (error) {
      this.emitter.emit('error', { type: 'load', error });
      throw new Error(`Failed to load registry from ${this.filePath}: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async save() {
    if (this.isSaving) return;
    this.isSaving = true;
    
    try {
      // Create backup if enabled
      if (this.options.backup && await fs.pathExists(this.filePath)) {
        await this.createBackup();
      }

      // Clean expired entries before saving
      this.cleanupExpired();

      // Convert Map to array for JSON serialization
      const entries = Array.from(this.data.values());
      const data = {
        version: '1.0',
        saved: new Date().toISOString(),
        entries
      };

      await fs.writeJson(this.filePath, data, { spaces: 2 });
      this.needsSave = false;
      this.emitter.emit('saved', { entries: entries.length });
    } catch (error) {
      this.emitter.emit('error', { type: 'save', error });
      throw new Error(`Failed to save registry to ${this.filePath}: ${error.message}`);
    } finally {
      this.isSaving = false;
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.filePath}.backup.${timestamp}`;
    
    await fs.copy(this.filePath, backupPath);
    
    // Clean old backups
    if (this.options.maxBackups > 0) {
      await this.cleanupBackups();
    }
  }

  async cleanupBackups() {
    const dir = path.dirname(this.filePath);
    const filename = path.basename(this.filePath);
    
    try {
      const files = await fs.readdir(dir);
      const backupFiles = files
        .filter(file => file.startsWith(`${filename}.backup.`))
        .map(file => ({
          path: path.join(dir, file),
          name: file,
          stat: fs.statSync(path.join(dir, file))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);

      // Remove old backups
      for (let i = this.options.maxBackups; i < backupFiles.length; i++) {
        await fs.remove(backupFiles[i].path);
      }
    } catch (error) {
      this.emitter.emit('error', { type: 'cleanup-backups', error });
    }
  }

  // Private methods
  async ensureDirectoryExists() {
    await fs.ensureDir(path.dirname(this.filePath));
  }

  async ensureLoaded() {
    if (this.data.size === 0 && !this.isLoading) {
      await this.load();
    }
  }

  markForSave() {
    this.needsSave = true;
  }

  startAutoSave() {
    this.saveTimer = setInterval(async () => {
      if (this.needsSave && !this.isSaving) {
        try {
          await this.save();
        } catch (error) {
          this.emitter.emit('error', { type: 'auto-save', error });
        }
      }
    }, this.options.saveInterval);
  }

  isExpired(entry) {
    return entry.expires && new Date(entry.expires) < new Date();
  }

  cleanupExpired() {
    const now = new Date();
    const expired = [];

    for (const [key, entry] of this.data.entries()) {
      if (entry.expires && new Date(entry.expires) < now) {
        expired.push(key);
      }
    }

    for (const key of expired) {
      const entry = this.data.get(key);
      this.data.delete(key);
      this.emitter.emit('change', { type: 'expired', key, entry });
    }

    return expired;
  }

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

    return true;
  }

  applyOptions(results, options) {
    let filtered = results;

    // Apply sorting
    if (options.sort) {
      filtered.sort((a, b) => {
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

    // Apply limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async getFileSize() {
    try {
      const stats = await fs.stat(this.filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  async getLastModified() {
    try {
      const stats = await fs.stat(this.filePath);
      return stats.mtime.toISOString();
    } catch (error) {
      return null;
    }
  }

  // Utility methods
  async dump() {
    await this.ensureLoaded();
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

  async clear() {
    this.data.clear();
    this.markForSave();
    this.emitter.emit('cleared');
  }

  size() {
    return this.data.size;
  }
}

export default JSONBackend;