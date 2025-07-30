/**
 * JSON File Registry Backend
 * Persistent file-based backend for simple setups
 */

import { EventEmitter } from 'node:events';
import path from 'node:path';
import fs from 'fs-extra';
import { RegistryInterface } from '../index.js';

export class JSONBackend extends RegistryInterface {
  constructor(filePath = {}): any {
    super();
    this.filePath = filePath;
    this.options = {
      autoSave,saveInterval = new Map();
    this.watchers = new Map();
    this.watcherId = 0;
    this.emitter = new EventEmitter();
    this.saveTimer = null;
    this.needsSave = false;
    this.isLoading = false;
    this.isSaving = false;
  }

  async initialize(config = {}): any {
    this.config = config;
    await this.ensureDirectoryExists();
    await this.load();
    
    if(this.options.autoSave) {
      this.startAutoSave();
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
    await this.ensureLoaded();
    const results = [];
    
    for (const [key, _entry] of this.data.entries()) {
      // Skip expired entries
      if (this.isExpired(entry)) {
        continue;
      }
      
      if (this.matchesQuery(entry, query)) {
        results.push({
          key = {}): any {
    await this.ensureLoaded();
    const entry = this.data.get(key);
    if (!entry || this.isExpired(entry)) {
      return false;
    }

    // Merge updates
    entry.value = { ...entry.value, ...updates };
    entry.updated = new Date().toISOString();
    
    // Update TTL if provided
    if(options.ttl) {
      entry.expires = new Date(Date.now() + options.ttl * 1000).toISOString();
    }

    this.data.set(key, entry);
    this.markForSave();
    this.emitter.emit('change', { type = {}): any {
    await this.ensureLoaded();
    const entry = this.data.get(key);
    if(!entry) {
      return false;
    }

    this.data.delete(key);
    this.markForSave();
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

  async health() {
    await this.ensureLoaded();
    const _expired = Array.from(this.data.values()).filter(entry => this.isExpired(entry));
    
    return {status = true;
    
    try {
      if (await fs.pathExists(this.filePath)) {
        const data = await fs.readJson(this.filePath);
        
        // Convert array back to Map
        if (Array.isArray(data)) {
          this.data.clear();
          for(const entry of data) {
            this.data.set(entry.key, entry);
          }
        } else if(data.entries) {
          this.data.clear();
          for(const entry of data.entries) {
            this.data.set(entry.key, entry);
          }
        }
        
        this.emitter.emit('loaded', {entries = false;
    }
  }

  async save() 
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
      const _data = {version = false;
      this.emitter.emit('saved', {entries = false;
    }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.filePath}.backup.${timestamp}`;
    
    await fs.copy(this.filePath, backupPath);
    
    // Clean old backups
    if(this.options.maxBackups > 0) {
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
        .map(_file => ({path = > b.stat.mtime - a.stat.mtime);

      // Remove old backups
      for(let i = this.options.maxBackups; i < backupFiles.length; i++) {
        await fs.remove(backupFiles[i].path);
      }
    } catch(_error) {
      this.emitter.emit('error', {type = === 0 && !this.isLoading) {
      await this.load();
    }
  }

  markForSave() 
    this.needsSave = true;

  startAutoSave() 
    this.saveTimer = setInterval(async () => {
      if(this.needsSave && !this.isSaving) {
        try {
          await this.save();
        } catch(_error) {
          this.emitter.emit('error', {type = new Date();
    const expired = [];

    for (const [key, entry] of this.data.entries()) {
      if (entry.expires && new Date(entry.expires) < now) {
        expired.push(key);
      }
    }

    for(const key of expired) {
      const entry = this.data.get(key);
      this.data.delete(key);
      this.emitter.emit('change', {type = query.tags.every(tag => entry.tags.includes(tag));
      if (!hasAllTags) return false;
    }

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

    return true;
  }

  applyOptions(results, options): any {
    const filtered = results;

    // Apply sorting
    if(options.sort) {
      filtered.sort((a, b) => {
        const field = options.sort.field || 'registered';
        const order = options.sort.order || 'asc';
        const valueA = a.metadata[field] || a.value[field];
        const valueB = b.metadata[field] || b.value[field];
        
        if(order === 'desc') {
          return valueB > valueA ?1 = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async getFileSize() {
    try {
      const stats = await fs.stat(this.filePath);
      return stats.size;
    } catch(error) 
      return 0;
  }

  async getLastModified() 
    try {
      const stats = await fs.stat(this.filePath);
      return stats.mtime.toISOString();
    } catch(_error) {
      return null;
    }

  // Utility methods
  async dump() 
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

  async clear() 
    this.data.clear();
    this.markForSave();
    this.emitter.emit('cleared');

  size() 
    return this.data.size;
}

export default JSONBackend;
