/**
 * Integration tests for SQLite Backend.
 * 
 * Tests the SQLite knowledge cache backend implementation using temporary database files.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';
import { SQLiteBackend } from '../storage-backends/sqlite-backend';

describe('SQLiteBackend Integration Tests', () => {
  let backend;
  let tempDbPath;

  beforeEach(async () => {
    // Create a temporary database file path
    tempDbPath = join(tmpdir(), 'test-knowledge-cache-' + (Date.now()) + '-' + Math.random().toString(36).substr(2, 9) + '.db');
    
    backend = new SQLiteBackend({
      dbPath: tempDbPath,
      enableWAL: false, // Disable WAL for tests for simpler cleanup
      enableFullTextSearch: true
    });
    
    await backend.initialize();
  });

  afterEach(async () => {
    // Clean up
    if (backend) {
      await backend.shutdown();
    }
    
    // Remove temporary database file
    if (existsSync(tempDbPath)) {
      try {
        unlinkSync(tempDbPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      expect(backend.isInitialized).toBe(true);
    });

    it('should create database file', () => {
      expect(existsSync(tempDbPath)).toBe(true);
    });

    it('should handle multiple initializations', async () => {
      await backend.initialize(); // Should not throw
      expect(backend.isInitialized).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    const sampleEntry = {
      id: 'test-entry-1',
      query: 'What is TypeScript?',
      result: { answer: 'TypeScript is a typed superset of JavaScript' },
      source: 'test-source',
      timestamp: Date.now(),
      ttl: 3600000, // 1 hour
      accessCount: 0,
      lastAccessed: Date.now(),
      metadata: {
        type: 'definition',
        domains: ['programming', 'javascript'],
        confidence: 0.9
      }
    };

    it('should store and retrieve an entry', async () => {
      await backend.store(sampleEntry);
      
      const retrieved = await backend.get(sampleEntry.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved.id).toBe(sampleEntry.id);
      expect(retrieved.query).toBe(sampleEntry.query);
      expect(retrieved.result).toEqual(sampleEntry.result);
      expect(retrieved.source).toBe(sampleEntry.source);
      expect(retrieved.metadata).toEqual(sampleEntry.metadata);
    });

    it('should return null for non-existent entry', async () => {
      const retrieved = await backend.get('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should update access count when retrieving', async () => {
      await backend.store(sampleEntry);
      
      const retrieved1 = await backend.get(sampleEntry.id);
      expect(retrieved1.accessCount).toBe(1);
      
      const retrieved2 = await backend.get(sampleEntry.id);
      expect(retrieved2.accessCount).toBe(2);
    });

    it('should update an existing entry', async () => {
      await backend.store(sampleEntry);
      
      const updatedEntry = {
        ...sampleEntry,
        result: { answer: 'Updated answer about TypeScript' }
      };
      
      await backend.store(updatedEntry);
      
      const retrieved = await backend.get(sampleEntry.id);
      expect(retrieved.result).toEqual(updatedEntry.result);
    });

    it('should delete an entry', async () => {
      await backend.store(sampleEntry);
      
      const deleted = await backend.delete(sampleEntry.id);
      expect(deleted).toBe(true);
      
      const retrieved = await backend.get(sampleEntry.id);
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent entry', async () => {
      const deleted = await backend.delete('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should clear all entries', async () => {
      await backend.store(sampleEntry);
      await backend.store({ ...sampleEntry, id: 'test-entry-2' });
      
      await backend.clear();
      
      const retrieved1 = await backend.get(sampleEntry.id);
      const retrieved2 = await backend.get('test-entry-2');
      
      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });
  });

  describe('Search Operations', () => {
    beforeEach(async () => {
      // Add test data
      const entries = [
        {
          id: 'entry-1',
          query: 'What is JavaScript?',
          result: { answer: 'JavaScript is a programming language' },
          source: 'source-1',
          timestamp: Date.now() - 1000,
          ttl: 3600000,
          accessCount: 0,
          lastAccessed: Date.now(),
          metadata: { type: 'definition', domains: ['programming'], confidence: 0.9 }
        },
        {
          id: 'entry-2',
          query: 'What is TypeScript?',
          result: { answer: 'TypeScript is a typed superset of JavaScript' },
          source: 'source-2',
          timestamp: Date.now(),
          ttl: 3600000,
          accessCount: 0,
          lastAccessed: Date.now(),
          metadata: { type: 'definition', domains: ['programming', 'typescript'], confidence: 0.8 }
        }
      ];

      for (const entry of entries) {
        await backend.store(entry);
      }
    });

    it('should search by text query', async () => {
      const results = await backend.search({ query: 'JavaScript' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.id === 'entry-1')).toBe(true);
    });

    it('should search by type', async () => {
      const results = await backend.search({ type: 'definition' });
      expect(results.length).toBe(2);
    });

    it('should search by domains', async () => {
      const results = await backend.search({ domains: ['typescript'] });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('entry-2');
    });

    it('should limit search results', async () => {
      const results = await backend.search({ maxResults: 1 });
      expect(results.length).toBe(1);
    });

    it('should search by confidence threshold', async () => {
      const results = await backend.search({ minConfidence: 0.85 });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('entry-1');
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', async () => {
      const entry = {
        id: 'stats-test',
        query: 'Test query',
        result: { answer: 'Test answer' },
        source: 'test',
        timestamp: Date.now(),
        ttl: 3600000,
        accessCount: 0,
        lastAccessed: Date.now(),
        metadata: { type: 'test' }
      };

      await backend.store(entry);
      await backend.get(entry.id); // This should be a cache hit

      const stats = await backend.getStats();

      expect(stats.totalEntries).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.cacheHits).toBe(1);
      expect(stats.hitRate).toBe(1);
      expect(stats.backend).toBe('sqlite');
      expect(stats.healthy).toBe(true);
    });
  });

  describe('Cleanup Operations', () => {
    it('should cleanup old entries', async () => {
      const oldEntry = {
        id: 'old-entry',
        query: 'Old query',
        result: { answer: 'Old answer' },
        source: 'test',
        timestamp: Date.now() - 7200000, // 2 hours ago
        ttl: 3600000,
        accessCount: 0,
        lastAccessed: Date.now(),
        metadata: { type: 'test' }
      };

      const newEntry = {
        id: 'new-entry',
        query: 'New query',
        result: { answer: 'New answer' },
        source: 'test',
        timestamp: Date.now(),
        ttl: 3600000,
        accessCount: 0,
        lastAccessed: Date.now(),
        metadata: { type: 'test' }
      };

      await backend.store(oldEntry);
      await backend.store(newEntry);

      const cleanedCount = await backend.cleanup(3600000); // Clean entries older than 1 hour
      expect(cleanedCount).toBe(1);

      const oldRetrieved = await backend.get('old-entry');
      const newRetrieved = await backend.get('new-entry');

      expect(oldRetrieved).toBeNull();
      expect(newRetrieved).not.toBeNull();
    });
  });

  describe('Memory Database', () => {
    it('should work with in-memory database', async () => {
      const memoryBackend = new SQLiteBackend({
        dbPath: ':memory:',
        enableFullTextSearch: true
      });

      await memoryBackend.initialize();

      const entry = {
        id: 'memory-test',
        query: 'Memory test',
        result: { answer: 'Memory test answer' },
        source: 'test',
        timestamp: Date.now(),
        ttl: 3600000,
        accessCount: 0,
        lastAccessed: Date.now(),
        metadata: { type: 'test' }
      };

      await memoryBackend.store(entry);
      const retrieved = await memoryBackend.get(entry.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved.id).toBe(entry.id);

      await memoryBackend.shutdown();
    });
  });
});