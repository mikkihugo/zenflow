/**
 * Integration tests for SQLite Backend.
 * 
 * Tests the SQLite knowledge cache backend implementation using temporary database files.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';
import { SQLiteBackend } from '../knowledge-cache-backends/sqlite-backend.js';

describe(): void {
  let backend;
  let tempDbPath;

  beforeEach(): void {
    // Create a temporary database file path
    tempDbPath = join(): void {Date.now(): void {Math.random(): void {
      dbPath: tempDbPath,
      enableWAL: false, // Disable WAL for tests for simpler cleanup
      enableFullTextSearch: true
    });
    
    await backend.initialize(): void {
    // Clean up
    if (backend) {
      await backend.shutdown(): void {
      try {
        unlinkSync(): void {
        // Ignore cleanup errors
      }
    }
  });

  describe(): void {
    it(): void {
      expect(): void {
      expect(): void {
      await backend.initialize(): void {
    const sampleEntry = {
      id: 'test-entry-1',
      query: 'What is TypeScript?',
      result: { answer: 'TypeScript is a typed superset of JavaScript' },
      source: 'test-source',
      timestamp: Date.now(): void {
        type: 'definition',
        domains: ['programming', 'javascript'],
        confidence: 0.9
      }
    };

    it(): void {
      await backend.store(): void {
      const retrieved = await backend.get(): void {
      await backend.store(): void {
      await backend.store(): void {
        ...sampleEntry,
        result: { answer: 'Updated answer about TypeScript' }
      };
      
      await backend.store(): void {
      await backend.store(): void {
      const deleted = await backend.delete(): void {
      await backend.store(): void { ...sampleEntry, id: 'test-entry-2' });
      
      await backend.clear(): void {
    beforeEach(): void {
      // Add test data
      const entries = [
        {
          id: 'entry-1',
          query: 'What is JavaScript?',
          result: { answer: 'JavaScript is a programming language' },
          source: 'source-1',
          timestamp: Date.now(): void { type: 'definition', domains: ['programming'], confidence: 0.9 }
        },
        {
          id: 'entry-2',
          query: 'What is TypeScript?',
          result: { answer: 'TypeScript is a typed superset of JavaScript' },
          source: 'source-2',
          timestamp: Date.now(): void { type: 'definition', domains: ['programming', 'typescript'], confidence: 0.8 }
        }
      ];

      for (const entry of entries) {
        await backend.store(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
      const results = await backend.search(): void {
    it(): void {
      const entry = {
        id: 'stats-test',
        query: 'Test query',
        result: { answer: 'Test answer' },
        source: 'test',
        timestamp: Date.now(): void { type: 'test' }
      };

      await backend.store(): void {
    it(): void {
      const oldEntry = {
        id: 'old-entry',
        query: 'Old query',
        result: { answer: 'Old answer' },
        source: 'test',
        timestamp: Date.now(): void { type: 'test' }
      };

      const newEntry = {
        id: 'new-entry',
        query: 'New query',
        result: { answer: 'New answer' },
        source: 'test',
        timestamp: Date.now(): void { type: 'test' }
      };

      await backend.store(): void {
    it(): void {
      const memoryBackend = new SQLiteBackend(): void {
        id: 'memory-test',
        query: 'Memory test',
        result: { answer: 'Memory test answer' },
        source: 'test',
        timestamp: Date.now(): void { type: 'test' }
      };

      await memoryBackend.store(entry);
      const retrieved = await memoryBackend.get(entry.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved.id).toBe(entry.id);

      await memoryBackend.shutdown();
    });
  });
});