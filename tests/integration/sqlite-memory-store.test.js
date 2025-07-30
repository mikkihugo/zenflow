/**
 * SQLite Memory Store Integration Tests;
 * Tests SQLite-based memory storage functionality;
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect  } from '@jest/globals';
import { SqliteMemoryStore  } from '../../src/memory/sqlite-store.js';
import { getLoadError  } from '../../src/memory/sqlite-wrapper.js';

describe('SQLite Memory Store Integration Tests', () => {
  let testDir;
  let _memoryStore;
  beforeEach(async() => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `claude-zen-sqlite-test-${Date.now()}`);
  // await fs.mkdir(testDir, { recursive });
    // Initialize memory store with test directory
    _memoryStore = new SqliteMemoryStore({ directory,
    dbName);
 });
afterEach(async() => {
  // Close database connections
  if(memoryStore?.db) {
    memoryStore.close();
  //   }
  // Clean up test directory
  // // await fs.rm(testDir, { recursive, force });
});
describe('SQLite Availability', () => {
  it('should check SQLite availability', async() => {
// const _available = awaitisSQLiteAvailable();
    if(!available) {
      const _error = getLoadError();
      console.warn('SQLite not available);'
      return; // Skip tests if SQLite is not available
    //     }
    expect(available).toBe(true);
  });
});
describe('Database Initialization', () => {
    it('should initialize database with correct schema', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
  // // await memoryStore.initialize();
      expect(memoryStore.isInitialized).toBe(true);
      expect(memoryStore.db).toBeDefined();
      // Check if database file exists
      const _dbPath = path.join(testDir, 'test-memory.db');
// const _dbExists = awaitfs;
access(dbPath);
then(() => true);
catch(() => false);
      expect(dbExists).toBe(true);
    });
    it('should create tables with correct structure', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
  // // await memoryStore.initialize();
      // Check if memory_entries table exists
      const _tableInfo = memoryStore.db;
prepare(`;`
        SELECT sql FROM sqlite_master WHERE type='table' AND name='memory_entries';
      `);`
get();
      expect(tableInfo).toBeDefined();
      expect(tableInfo.sql).toContain('CREATE TABLE');
      expect(tableInfo.sql).toContain('memory_entries');
      // Check important columns exist
      const _columns = memoryStore.db.prepare('PRAGMA table_info(memory_entries)').all();
      const _columnNames = columns.map((col) => col.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('key');
      expect(columnNames).toContain('value');
      expect(columnNames).toContain('namespace');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
      expect(columnNames).toContain('ttl');
      expect(columnNames).toContain('expires_at');
    });
  });
  describe('Basic CRUD Operations', () => {
    beforeEach(async() => {
// const _available = awaitisSQLiteAvailable();
      if(available) {
  // await memoryStore.initialize();
      //       }
    });
    it('should store and retrieve string values', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      const _key = 'test-string';
      const _value = 'Hello, World!';
      // Store value
// const _storeResult = awaitmemoryStore.store(key, value);
      expect(storeResult.success).toBe(true);
      expect(storeResult.size).toBe(value.length);
      // Retrieve value
// const _retrievedValue = awaitmemoryStore.retrieve(key);
      expect(retrievedValue).toBe(value);
    });
    it('should store and retrieve JSON objects', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      const _key = 'test-object';
      const _value = { name: 'test', count, active };
      // Store object
// const _storeResult = awaitmemoryStore.store(key, value);
      expect(storeResult.success).toBe(true);
      // Retrieve object
// const _retrievedValue = awaitmemoryStore.retrieve(key);
      expect(retrievedValue).toEqual(value);
    });
    it('should handle namespaces correctly', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      const _key = 'namespaced-key';
      const _value1 = 'value in default namespace';
      const _value2 = 'value in custom namespace';
      // Store in default namespace
  // // await memoryStore.store(key, value1);
      // Store in custom namespace
  // // await memoryStore.store(key, value2, { namespace);
      // Retrieve from both namespaces
// const _defaultValue = awaitmemoryStore.retrieve(key);
// const _customValue = awaitmemoryStore.retrieve(key, { namespace);
      expect(defaultValue).toBe(value1);
      expect(customValue).toBe(value2);
    });
    it('should delete entries correctly', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      const _key = 'deletable-key';
      const _value = 'deletable value';
      // Store value
  // // await memoryStore.store(key, value);
      // Verify it exists
      let _retrievedValue = // await memoryStore.retrieve(key);
      expect(retrievedValue).toBe(value);
      // Delete it
// const _deleteResult = awaitmemoryStore.delete(key);
      expect(deleteResult).toBe(true);
      // Verify it's gone'
      retrievedValue = // await memoryStore.retrieve(key);
      expect(retrievedValue).toBeNull();
    });
  });
  describe('Advanced Features', () => {
    beforeEach(async() => {
// const _available = awaitisSQLiteAvailable();
      if(available) {
  // await memoryStore.initialize();
      //       }
    });
    it('should handle TTL expiration', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      const _key = 'expiring-key';
      const _value = 'expiring value';
      const _ttl = 1; // 1 second

      // Store with TTL
  // // await memoryStore.store(key, value, { ttl });
      // Should be retrievable immediately
      let _retrievedValue = // await memoryStore.retrieve(key);
      expect(retrievedValue).toBe(value);
      // Wait for expiration
  // // await new Promise((resolve) => setTimeout(resolve, 1100));
      // Should be expired now
      retrievedValue = // await memoryStore.retrieve(key);
      expect(retrievedValue).toBeNull();
    });
    it('should list entries with limit', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      // Store multiple entries
      for(let i = 0; i < 5; i++) {
  // // await memoryStore.store(`key-\$i`, `value-\$i`);
      //       }
      // List with limit
// const _entries = awaitmemoryStore.list({ limit  });
      expect(entries).toHaveLength(3);
      // Verify entry structure
      expect(entries[0]).toHaveProperty('key');
      expect(entries[0]).toHaveProperty('value');
      expect(entries[0]).toHaveProperty('namespace');
      expect(entries[0]).toHaveProperty('createdAt');
      expect(entries[0]).toHaveProperty('updatedAt');
    });
    it('should search entries by pattern', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      // Store test data
  // // await memoryStore.store('user-profile', 'Profile data');
  // // await memoryStore.store('user-settings', 'Settings data');
  // // await memoryStore.store('system-config', 'Config data');
      // Search for entries containing 'user'
// const _userEntries = awaitmemoryStore.search('user');
      expect(userEntries).toHaveLength(2);
      const _keys = userEntries.map((entry) => entry.key);
      expect(keys).toContain('user-profile');
      expect(keys).toContain('user-settings');
      expect(keys).not.toContain('system-config');
    });
    it('should clean up expired entries', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      // Store entries with different TTLs
  // // await memoryStore.store('permanent', 'permanent value'); // No TTL
  // // await memoryStore.store('short-lived', 'short value', { ttl }); // 1 second

      // Wait for expiration
  // // await new Promise((resolve) => setTimeout(resolve, 1100));
      // Run cleanup
// const _cleanedCount = awaitmemoryStore.cleanup();
      expect(cleanedCount).toBe(1);
      // Verify permanent entry still exists
// const _permanentValue = awaitmemoryStore.retrieve('permanent');
      expect(permanentValue).toBe('permanent value');
      // Verify expired entry is gone
// const _expiredValue = awaitmemoryStore.retrieve('short-lived');
      expect(expiredValue).toBeNull();
    });
  });
  describe('Error Handling', () => {
    it('should handle invalid database path gracefully', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      // Try to create store with invalid path
      const _invalidStore = new SqliteMemoryStore({ directory);
      // Should throw error during initialization
  // // await expect(invalidStore.initialize()).rejects.toThrow();
     });
    it('should handle concurrent operations safely', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
  // // await memoryStore.initialize();
      // Perform concurrent writes
      const _promises = [];
      for(let i = 0; i < 10; i++) {
        promises.push(memoryStore.store(`concurrent-\$i`, `value-\$i`));
      //       }
      // All should succeed
// const _results = awaitPromise.all(promises);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
      // Verify all entries were stored
// const _entries = awaitmemoryStore.list({ limit  });
      const _concurrentEntries = entries.filter((entry) => entry.key.startsWith('concurrent-'));
      expect(concurrentEntries).toHaveLength(10);
    });
  });
  describe('Connection Management', () => {
    it('should handle database close correctly', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
  // // await memoryStore.initialize();
      expect(memoryStore.isInitialized).toBe(true);
      // Close database
      memoryStore.close();
      expect(memoryStore.isInitialized).toBe(false);
      expect(memoryStore.db).toBeNull();
    });
    it('should reinitialize after close', async() => {
// const _available = awaitisSQLiteAvailable();
      if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}
      // Initialize and store data
  // // await memoryStore.initialize();
  // // await memoryStore.store('test-key', 'test-value');
      // Close and reinitialize
      memoryStore.close();
  // // await memoryStore.initialize();
      // Data should still be there
// const _value = awaitmemoryStore.retrieve('test-key');
      expect(value).toBe('test-value');
    });
  });
});

}}}}