/**
 * SQLite Performance Optimization Tests;
 * Validates the performance improvements work correctly;
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe } from '@jest/globals';
import { SqliteMemoryStore } from '../../src/memory/sqlite-store.js';
import { isSQLiteAvailable } from '../../src/memory/sqlite-wrapper.js';

describe('SQLite Performance Optimization Tests', () => {
  let testDir;
  let _memoryStore;
  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `claude-zen-perf-test-${Date.now()}`);
  // await fs.mkdir(testDir, { recursive });
    // Initialize memory store with performance optimizations
    _memoryStore = new SqliteMemoryStore({
      directory,
    dbName);
});
afterEach(async () => {
  // Close database connections
  if (memoryStore?.db) {
    memoryStore.close();
  //   }
  // Clean up test directory
  // await fs.rm(testDir, { recursive, force });
});
describe('Optimized Index Usage', () => {
    it('should create all performance indexes', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
  // await memoryStore.initialize();
      // Check that all expected indexes exist
      const _indexes = memoryStore.db;
prepare(`;
        SELECT name FROM sqlite_master ;
        WHERE type = 'index' AND tbl_name = 'memory_entries';
      `);
all();
      const _indexNames = indexes.map((idx) => idx.name);
      // Verify core performance indexes
      expect(indexNames).toContain('idx_memory_namespace');
      expect(indexNames).toContain('idx_memory_expires');
      expect(indexNames).toContain('idx_memory_accessed');
      // Verify composite indexes
      expect(indexNames).toContain('idx_memory_namespace_key');
      expect(indexNames).toContain('idx_memory_namespace_updated');
      expect(indexNames).toContain('idx_memory_namespace_access_count');
      expect(indexNames).toContain('idx_memory_active_entries');
      // Verify search indexes
      expect(indexNames).toContain('idx_memory_key_search');
      expect(indexNames).toContain('idx_memory_value_search');
    });
    it('should use indexes for key lookups', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
  // await memoryStore.initialize();
      // Insert test data
  // await memoryStore.store('test-key', 'test-value', { namespace);
      // Check query plan for key lookup
      const _plan = memoryStore.db;
prepare(`;
        EXPLAIN QUERY PLAN ;
        SELECT * FROM memory_entries ;
        WHERE key = ? AND namespace = ?;
      `);
all('test-key', 'test-ns');
      // Should use the composite index
      const _planText = plan.map((row) => row.detail).join(' ');
      expect(planText).toContain('idx_memory_namespace_key');
    });
  });
  describe('Query Caching', () => {
    beforeEach(async () => {
// const _available = awaitisSQLiteAvailable();
      if (available) {
  // await memoryStore.initialize();
      //       }
    });
    it('should cache retrieve operations', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      const _key = 'cache-test-key';
      const _value = { data: 'cached value' };
      // Store value
  // await memoryStore.store(key, value);
      // First retrieve (should miss cache)
// const _result1 = awaitmemoryStore.retrieve(key);
      const _stats1 = memoryStore.getPerformanceStats();
      // Second retrieve (should hit cache)
// const _result2 = awaitmemoryStore.retrieve(key);
      const _stats2 = memoryStore.getPerformanceStats();
      expect(result1).toEqual(value);
      expect(result2).toEqual(value);
      expect(stats2.cache.hits).toBeGreaterThan(stats1.cache.hits);
    });
    it('should invalidate cache on updates', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      const _key = 'invalidation-test';
      const _value1 = { version };
      const _value2 = { version };
      // Store and retrieve initial value
  // await memoryStore.store(key, value1);
  // await memoryStore.retrieve(key); // Cache it

      // Update value
  // await memoryStore.store(key, value2);
      // Retrieve should return new value, not cached
// const _result = awaitmemoryStore.retrieve(key);
    // expect(result).toEqual(value2); // LINT: unreachable code removed
    });
    it('should cache list operations', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      const _namespace = 'list-cache-test';
      // Store test data
      for (let i = 0; i < 5; i++) {
  // await memoryStore.store(`key-\$i`, `value-\$i`, { namespace });
      //       }
      // First list (should miss cache)
// const _list1 = awaitmemoryStore.list({ namespace, limit });
      const _stats1 = memoryStore.getPerformanceStats();
      // Second list (should hit cache)
// const _list2 = awaitmemoryStore.list({ namespace, limit });
      const _stats2 = memoryStore.getPerformanceStats();
      expect(list1).toHaveLength(5);
      expect(list2).toHaveLength(5);
      expect(stats2.cache.hits).toBeGreaterThan(stats1.cache.hits);
    });
    it('should provide cache statistics', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      // Perform some operations to generate cache activity
  // await memoryStore.store('stats-test', 'test-value');
  // await memoryStore.retrieve('stats-test'); // miss
  // await memoryStore.retrieve('stats-test'); // hit

      const _stats = memoryStore.getPerformanceStats();
      expect(stats.cache).toHaveProperty('enabled');
      expect(stats.cache).toHaveProperty('hits');
      expect(stats.cache).toHaveProperty('misses');
      expect(stats.cache).toHaveProperty('hitRate');
      expect(stats.cache).toHaveProperty('size');
      expect(stats.cache.enabled).toBe(true);
      expect(stats.cache.hits).toBeGreaterThanOrEqual(1);
      expect(stats.cache.misses).toBeGreaterThanOrEqual(1);
    });
  });
  describe('Performance Monitoring', () => {
    beforeEach(async () => {
// const _available = awaitisSQLiteAvailable();
      if (available) {
  // await memoryStore.initialize();
      //       }
    });
    it('should provide database statistics', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      // Add some test data
      for (let i = 0; i < 10; i++) {
  // await memoryStore.store(`stats-key-\$i`, `value-\$i`, {
          namespace);
      //       }
// const _stats = awaitmemoryStore.getDatabaseStats();
      expect(stats).toHaveProperty('entries');
      expect(stats).toHaveProperty('namespaces');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('avgAccessCount');
      expect(stats).toHaveProperty('activeWithTTL');
      expect(stats).toHaveProperty('indexes');
      expect(stats).toHaveProperty('indexNames');
      expect(stats.entries).toBe(10);
      expect(stats.namespaces).toBe(3);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.indexes).toBeGreaterThan(8); // At least our custom indexes
    });
    it('should analyze query performance', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
// const _analysis = awaitmemoryStore.analyzeQueryPerformance();
      expect(analysis).toHaveProperty('queryPlans');
      expect(analysis).toHaveProperty('performance');
      // Should have plans for common operations
      expect(analysis.queryPlans).toHaveProperty('get');
      expect(analysis.queryPlans).toHaveProperty('list');
      expect(analysis.queryPlans).toHaveProperty('search');
      expect(analysis.queryPlans).toHaveProperty('cleanup');
    });
  });
  describe('Connection Pool', () => {
    let pool;
    let poolDbPath;
    beforeEach(async () => {
      poolDbPath = path.join(testDir, 'pool-test.db');
    });
    afterEach(async () => {
      if (pool) {
  // await pool.shutdown();
      //       }
    });
    it('should create and manage connection pool', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      pool = new SQLiteConnectionPool(poolDbPath, {
        minConnections,
        maxConnections });
  // await pool.initialize();
      const _stats = pool.getStats();
      expect(stats.totalConnections).toBe(2); // min connections
      expect(stats.availableConnections).toBe(2);
      expect(stats.activeConnections).toBe(0);
    });
    it('should handle concurrent connections', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      pool = new SQLiteConnectionPool(poolDbPath, {
        minConnections,
        maxConnections });
  // await pool.initialize();
      // Create table
  // await pool.execute(`;
        CREATE TABLE IF NOT EXISTS test_table (;
          id INTEGER PRIMARY KEY,
          value TEXT;
        );
      `);
      // Perform concurrent operations
      const _operations = [];
      for (let i = 0; i < 5; i++) {
        operations.push(pool.execute('INSERT INTO test_table (value) VALUES (?)', [`value-\$i`]));
      //       }
  // await Promise.all(operations);
      // Verify all operations completed
// const _results = awaitpool.execute('SELECT COUNT(*)  FROM test_table');
      expect(results[0].count).toBe(5);
    });
    it('should handle transaction operations', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      pool = new SQLiteConnectionPool(poolDbPath);
  // await pool.initialize();
      // Create table
  // await pool.execute(`;
        CREATE TABLE IF NOT EXISTS transaction_test (;
          id INTEGER PRIMARY KEY,
          value TEXT;
        );
      `);
      // Execute transaction
      const _queries = [
        { query: 'INSERT INTO transaction_test (value) VALUES (?)', params: ['tx-value-1'] },
        { query: 'INSERT INTO transaction_test (value) VALUES (?)', params: ['tx-value-2'] },
        { query: 'INSERT INTO transaction_test (value) VALUES (?)', params: ['tx-value-3'] } ];
  // await pool.executeTransaction(queries);
      // Verify transaction results
// const _results = awaitpool.execute('SELECT COUNT(*)  FROM transaction_test');
      expect(results[0].count).toBe(3);
    });
  });
  describe('Performance Regression Tests', () => {
    beforeEach(async () => {
// const _available = awaitisSQLiteAvailable();
      if (available) {
  // await memoryStore.initialize();
      //       }
    });
    it('should handle large datasets efficiently', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      const _startTime = Date.now();
      // Insert large dataset
      for (let i = 0; i < 1000; i++) {
  // await memoryStore.store(;
          `large-key-\$i`,
          //           {
            id,
            data: `Large dataset entry number \$i`,
            metadata: { batch: Math.floor(i / 100) } },
          { namespace: `batch-\$Math.floor(i / 100)` }
        );
      //       }
      const _insertTime = Date.now() - startTime;
      // Perform various queries
      const _queryStart = Date.now();
      // Key lookups
      for (let i = 0; i < 100; i++) {
  // await memoryStore.retrieve(`large-key-\$i * 10`, {
          namespace: `batch-\$Math.floor((i * 10) / 100)` });
      //       }
      // List operations
      for (let i = 0; i < 10; i++) {
  // await memoryStore.list({ namespace);
      //       }
      // Search operations
  // await memoryStore.search('Large dataset', { limit });
  // await memoryStore.search('entry number 5', { limit });
      const _queryTime = Date.now() - queryStart;
      // Performance assertions (these are rough benchmarks)
      expect(insertTime).toBeLessThan(10000); // 10 seconds for 1000 inserts
      expect(queryTime).toBeLessThan(5000); // 5 seconds for mixed queries

      // Verify cache effectiveness
      const _stats = memoryStore.getPerformanceStats();
      expect(stats.cache.hitRate).toBeGreaterThan(0); // Some cache hits expected
    });
    it('should maintain performance with TTL entries', async () => {
// const _available = awaitisSQLiteAvailable();
      if (!available) {
        console.warn('Skipping test);
        return;
    //   // LINT: unreachable code removed}
      // Insert entries with various TTLs
      for (let i = 0; i < 500; i++) {
  // await memoryStore.store(`ttl-key-\$i`, `value-\$i`, {
          ttl: (i % 4) + 1, // TTL between 1-4 seconds
          namespace: 'ttl-test' });
      //       }
      // Wait for some to expire
  // await new Promise((resolve) => setTimeout(resolve, 2000));
      const _cleanupStart = Date.now();
// const _cleanedCount = awaitmemoryStore.cleanup();
      const _cleanupTime = Date.now() - cleanupStart;
      expect(cleanedCount).toBeGreaterThan(0); // Some entries should have expired
      expect(cleanupTime).toBeLessThan(1000); // Cleanup should be fast

      // Verify remaining entries are still accessible
// const _remaining = awaitmemoryStore.list({ namespace);
      expect(remaining.length).toBeLessThan(500);
      expect(remaining.length).toBeGreaterThan(0);
    });
  });
});
