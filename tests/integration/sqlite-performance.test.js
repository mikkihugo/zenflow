/\*\*/g
 * SQLite Performance Optimization Tests;
 * Validates the performance improvements work correctly;
 *//g

import fs from 'node:fs/promises';/g
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe  } from '@jest/globals';/g
import { SqliteMemoryStore  } from '../../src/memory/sqlite-store.js';/g
import { isSQLiteAvailable  } from '../../src/memory/sqlite-wrapper.js';/g

describe('SQLite Performance Optimization Tests', () => {
  let testDir;
  let _memoryStore;
  beforeEach(async() => {
    // Create temporary test directory/g
    testDir = path.join(os.tmpdir(), `claude-zen-perf-test-${Date.now()}`);
  // await fs.mkdir(testDir, { recursive });/g
    // Initialize memory store with performance optimizations/g
    _memoryStore = new SqliteMemoryStore({ directory,
    dbName);
  });
afterEach(async() => {
  // Close database connections/g
  if(memoryStore?.db) {
    memoryStore.close();
  //   }/g
  // Clean up test directory/g
  // // await fs.rm(testDir, { recursive, force });/g
});
describe('Optimized Index Usage', () => {
    it('should create all performance indexes', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
  // // await memoryStore.initialize();/g
      // Check that all expected indexes exist/g
      const _indexes = memoryStore.db;
prepare(`;`
        SELECT name FROM sqlite_master ;
        WHERE type = 'index' AND tbl_name = 'memory_entries';
      `);`
all();
      const _indexNames = indexes.map((idx) => idx.name);
      // Verify core performance indexes/g
      expect(indexNames).toContain('idx_memory_namespace');
      expect(indexNames).toContain('idx_memory_expires');
      expect(indexNames).toContain('idx_memory_accessed');
      // Verify composite indexes/g
      expect(indexNames).toContain('idx_memory_namespace_key');
      expect(indexNames).toContain('idx_memory_namespace_updated');
      expect(indexNames).toContain('idx_memory_namespace_access_count');
      expect(indexNames).toContain('idx_memory_active_entries');
      // Verify search indexes/g
      expect(indexNames).toContain('idx_memory_key_search');
      expect(indexNames).toContain('idx_memory_value_search');
    });
    it('should use indexes for key lookups', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
  // // await memoryStore.initialize();/g
      // Insert test data/g
  // // await memoryStore.store('test-key', 'test-value', { namespace);/g
      // Check query plan for key lookup/g
      const _plan = memoryStore.db;
prepare(`;`
        EXPLAIN QUERY PLAN ;
        SELECT * FROM memory_entries ;
        WHERE key = ? AND namespace = ?;
      `);`
all('test-key', 'test-ns');
      // Should use the composite index/g
      const _planText = plan.map((row) => row.detail).join(' ');
      expect(planText).toContain('idx_memory_namespace_key');
    });
  });
  describe('Query Caching', () => {
    beforeEach(async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(available) {
  // await memoryStore.initialize();/g
      //       }/g
    });
    it('should cache retrieve operations', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      const _key = 'cache-test-key';
      const _value = { data: 'cached value' };
      // Store value/g
  // // await memoryStore.store(key, value);/g
      // First retrieve(should miss cache)/g
// const _result1 = awaitmemoryStore.retrieve(key);/g
      const _stats1 = memoryStore.getPerformanceStats();
      // Second retrieve(should hit cache)/g
// const _result2 = awaitmemoryStore.retrieve(key);/g
      const _stats2 = memoryStore.getPerformanceStats();
      expect(result1).toEqual(value);
      expect(result2).toEqual(value);
      expect(stats2.cache.hits).toBeGreaterThan(stats1.cache.hits);
    });
    it('should invalidate cache on updates', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      const _key = 'invalidation-test';
      const _value1 = { version };
      const _value2 = { version };
      // Store and retrieve initial value/g
  // // await memoryStore.store(key, value1);/g
  // // await memoryStore.retrieve(key); // Cache it/g

      // Update value/g
  // // await memoryStore.store(key, value2);/g
      // Retrieve should return new value, not cached/g
// const _result = awaitmemoryStore.retrieve(key);/g
    // expect(result).toEqual(value2); // LINT: unreachable code removed/g
    });
    it('should cache list operations', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      const _namespace = 'list-cache-test';
      // Store test data/g
  for(let i = 0; i < 5; i++) {
  // // await memoryStore.store(`key-\$i`, `value-\$i`, { namespace });/g
      //       }/g
      // First list(should miss cache)/g
// const _list1 = awaitmemoryStore.list({ namespace, limit   });/g
      const _stats1 = memoryStore.getPerformanceStats();
      // Second list(should hit cache)/g
// const _list2 = awaitmemoryStore.list({ namespace, limit   });/g
      const _stats2 = memoryStore.getPerformanceStats();
      expect(list1).toHaveLength(5);
      expect(list2).toHaveLength(5);
      expect(stats2.cache.hits).toBeGreaterThan(stats1.cache.hits);
    });
    it('should provide cache statistics', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      // Perform some operations to generate cache activity/g
  // // await memoryStore.store('stats-test', 'test-value');/g
  // // await memoryStore.retrieve('stats-test'); // miss/g
  // // await memoryStore.retrieve('stats-test'); // hit/g

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
    beforeEach(async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(available) {
  // await memoryStore.initialize();/g
      //       }/g
    });
    it('should provide database statistics', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      // Add some test data/g
  for(let i = 0; i < 10; i++) {
  // // await memoryStore.store(`stats-key-\$i`, `value-\$i`, {/g)
          namespace);
      //       }/g
// const _stats = awaitmemoryStore.getDatabaseStats();/g
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
      expect(stats.indexes).toBeGreaterThan(8); // At least our custom indexes/g
    });
    it('should analyze query performance', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
// const _analysis = awaitmemoryStore.analyzeQueryPerformance();/g
      expect(analysis).toHaveProperty('queryPlans');
      expect(analysis).toHaveProperty('performance');
      // Should have plans for common operations/g
      expect(analysis.queryPlans).toHaveProperty('get');
      expect(analysis.queryPlans).toHaveProperty('list');
      expect(analysis.queryPlans).toHaveProperty('search');
      expect(analysis.queryPlans).toHaveProperty('cleanup');
    });
  });
  describe('Connection Pool', () => {
    let pool;
    let poolDbPath;
    beforeEach(async() => {
      poolDbPath = path.join(testDir, 'pool-test.db');
    });
    afterEach(async() => {
  if(pool) {
  // await pool.shutdown();/g
      //       }/g
    });
    it('should create and manage connection pool', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      pool = new SQLiteConnectionPool(poolDbPath, {
        minConnections,
        maxConnections });
  // // await pool.initialize();/g
      const _stats = pool.getStats();
      expect(stats.totalConnections).toBe(2); // min connections/g
      expect(stats.availableConnections).toBe(2);
      expect(stats.activeConnections).toBe(0);
    });
    it('should handle concurrent connections', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      pool = new SQLiteConnectionPool(poolDbPath, {
        minConnections,
        maxConnections });
  // // await pool.initialize();/g
      // Create table/g
  // // await pool.execute(`;`/g
        CREATE TABLE IF NOT EXISTS test_table(;
          id INTEGER PRIMARY KEY,
          value TEXT;))
        );
      `);`
      // Perform concurrent operations/g
      const _operations = [];
  for(let i = 0; i < 5; i++) {
        operations.push(pool.execute('INSERT INTO test_table(value) VALUES(?)', [`value-\$i`]));
      //       }/g
  // // await Promise.all(operations);/g
      // Verify all operations completed/g
// const _results = awaitpool.execute('SELECT COUNT(*)  FROM test_table');/g
      expect(results[0].count).toBe(5);
    });
    it('should handle transaction operations', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      pool = new SQLiteConnectionPool(poolDbPath);
  // // await pool.initialize();/g
      // Create table/g
  // // await pool.execute(`;`/g
        CREATE TABLE IF NOT EXISTS transaction_test(;
          id INTEGER PRIMARY KEY,
          value TEXT;))
        );
      `);`
      // Execute transaction/g
      const _queries = [
        { query: 'INSERT INTO transaction_test(value) VALUES(?)', params: ['tx-value-1'] },
        { query: 'INSERT INTO transaction_test(value) VALUES(?)', params: ['tx-value-2'] },
        { query: 'INSERT INTO transaction_test(value) VALUES(?)', params: ['tx-value-3'] } ];
  // // await pool.executeTransaction(queries);/g
      // Verify transaction results/g
// const _results = awaitpool.execute('SELECT COUNT(*)  FROM transaction_test');/g
      expect(results[0].count).toBe(3);
    });
  });
  describe('Performance Regression Tests', () => {
    beforeEach(async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(available) {
  // await memoryStore.initialize();/g
      //       }/g
    });
    it('should handle large datasets efficiently', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      const _startTime = Date.now();
      // Insert large dataset/g
  for(let i = 0; i < 1000; i++) {
  // // await memoryStore.store(;/g
          `large-key-\$i`,
          //           {/g
            id,
            data: `Large dataset entry number \$i`,)
            metadata: { batch: Math.floor(i / 100) } },/g
          { namespace: `batch-\$Math.floor(i / 100)` }/g
        );
      //       }/g
      const _insertTime = Date.now() - startTime;
      // Perform various queries/g
      const _queryStart = Date.now();
      // Key lookups/g
  for(let i = 0; i < 100; i++) {
  // // await memoryStore.retrieve(`large-key-\$i * 10`, {)/g
          namespace: `batch-\$Math.floor((i * 10) / 100)` });/g
      //       }/g
      // List operations/g
  for(let i = 0; i < 10; i++) {
  // // await memoryStore.list({ namespace);/g
      //       }/g
      // Search operations/g
  // // await memoryStore.search('Large dataset', { limit });/g
  // // await memoryStore.search('entry number 5', { limit });/g
      const _queryTime = Date.now() - queryStart;
      // Performance assertions(these are rough benchmarks)/g
      expect(insertTime).toBeLessThan(10000); // 10 seconds for 1000 inserts/g
      expect(queryTime).toBeLessThan(5000); // 5 seconds for mixed queries/g

      // Verify cache effectiveness/g
      const _stats = memoryStore.getPerformanceStats();
      expect(stats.cache.hitRate).toBeGreaterThan(0); // Some cache hits expected/g
    });
    it('should maintain performance with TTL entries', async() => {
// const _available = awaitisSQLiteAvailable();/g
  if(!available) {
        console.warn('Skipping test);'
        return;
    //   // LINT: unreachable code removed}/g
      // Insert entries with various TTLs/g
  for(let i = 0; i < 500; i++) {
  // // await memoryStore.store(`ttl-key-\$i`, `value-\$i`, {/g)
          ttl: (i % 4) + 1, // TTL between 1-4 seconds/g
          namespace: 'ttl-test' });
      //       }/g
      // Wait for some to expire/g
  // // await new Promise((resolve) => setTimeout(resolve, 2000));/g
      const _cleanupStart = Date.now();
// const _cleanedCount = awaitmemoryStore.cleanup();/g
      const _cleanupTime = Date.now() - cleanupStart;
      expect(cleanedCount).toBeGreaterThan(0); // Some entries should have expired/g
      expect(cleanupTime).toBeLessThan(1000); // Cleanup should be fast/g

      // Verify remaining entries are still accessible/g
// const _remaining = awaitmemoryStore.list({ namespace);/g
      expect(remaining.length).toBeLessThan(500);
      expect(remaining.length).toBeGreaterThan(0);
      });
  });
});

}}}}}