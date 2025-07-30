#!/usr/bin/env node
/**
 * SQLite Performance Optimization Validation Script;
 * Quick test to validate the performance improvements;
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { SQLiteConnectionPool } from '../src/memory/sqlite-connection-pool.js';
import { SqliteMemoryStore } from '../src/memory/sqlite-store.js';
import { getLoadError } from '../src/memory/sqlite-wrapper.js';

const _colors = {
  green: '\x1b[32m',
red: '\x1b[31m',
yellow: '\x1b[33m',
blue: '\x1b[34m',
cyan: '\x1b[36m',
reset: '\x1b[0m'
}
function log() {
  console.warn(`${colors[color]}${message}${colors.reset}`);
}
async function validateSQLiteOptimizations() {
  log('🔍 SQLite Performance Optimization Validation', 'blue');
  log('='.repeat(50), 'blue');
  // Check SQLite availability
  const _available = await isSQLiteAvailable();
  if (!available) {
    const _error = getLoadError();
    log(`❌ SQLite not available: ${error?.message  ?? 'Unknown error'}`, 'red');
    log('   Performance optimizations cannot be tested', 'yellow');
    return false;
    //   // LINT: unreachable code removed}
  log('✅ SQLite is available', 'green');
  // Create test directory
  const _testDir = path.join(os.tmpdir(), `sqlite-validation-${Date.now()}`);
  // await fs.mkdir(testDir, { recursive: true });
  log(`📂 Test directory: ${testDir}`, 'cyan');
  const _allTestsPassed = true;
  try {
    // Test 1: Basic functionality with optimizations
    log('\n📈 Test 1: Basic Functionality with Optimizations', 'blue');
    const _store = new SqliteMemoryStore({
      directory: testDir,
      dbName: 'optimization-test.db',
      enableCache: true,
      cacheSize: 5000,
      cacheTimeout: 60000,
    });
  // await store.initialize();
    log('✅ Store initialized with optimizations', 'green');
    // Check indexes were created
    const _indexCheck = store.db;
      .prepare(`;
      SELECT COUNT(*) as count FROM sqlite_master ;
      WHERE type = 'index' AND tbl_name = 'memory_entries';
    `);
      .get();
    if (indexCheck.count >= 10) {
      log(`✅ Performance indexes created ($indexCheck.countindexes)`, 'green');
    } else {
      log(`❌ Expected at least 10 indexes, found ${indexCheck.count}`, 'red');
      allTestsPassed = false;
    }
    // Test cache functionality
  // await store.store('cache-test', { data: 'test value' });
  // await store.retrieve('cache-test'); // Miss
  // await store.retrieve('cache-test'); // Hit

    const _cacheStats = store.getPerformanceStats();
    if (cacheStats.cache.enabled && cacheStats.cache.hits > 0) {
      log('✅ Query caching is working', 'green');
    } else {
      log('❌ Query caching not working as expected', 'red');
      allTestsPassed = false;
    }
    store.close();
    // Test 2: Connection Pool
    log('\n⚡ Test 2: Connection Pool', 'blue');
    const _poolDbPath = path.join(testDir, 'pool-test.db');
    const _pool = new SQLiteConnectionPool(poolDbPath, {
      minConnections: 2,
      maxConnections: 4
})
  // await pool.initialize()
const _poolStats = pool.getStats();
if (poolStats.totalConnections === 2 && poolStats.availableConnections === 2) {
  log('✅ Connection pool initialized correctly', 'green');
} else {
  log(`❌ Connection pool issue: ${JSON.stringify(poolStats)}`, 'red');
  allTestsPassed = false;
}
// Test concurrent operations
  // await pool.execute(`;
      CREATE TABLE IF NOT EXISTS test_concurrent (;
        id INTEGER PRIMARY KEY,
        value TEXT;
      );
    `);
const _concurrentOps = [];
for (let i = 0; i < 10; i++) {
  concurrentOps.push(;
  pool.execute('INSERT INTO test_concurrent (value) VALUES (?)', [`value-${i}`]);
  )
}
  // await Promise.all(concurrentOps);
const _result = await pool.execute('SELECT COUNT(*) as count FROM test_concurrent');
if (result[0].count === 10) {
  log('✅ Concurrent operations successful', 'green');
} else {
  log(`❌ Concurrent operations failed: expected 10, got ${result[0].count}`, 'red');
  allTestsPassed = false;
}
  // await pool.shutdown();
// Test 3: Performance with Large Dataset
log('\n🚀 Test 3: Performance with Large Dataset', 'blue');
const _perfStore = new SqliteMemoryStore({
      directory: testDir,
dbName: 'performance-test.db',
enableCache: true
})
  // await perfStore.initialize()
const _start = Date.now();
// Insert 1000 entries
for (let i = 0; i < 1000; i++) {
  // await perfStore.store(;
  `perf-key-${i}`,
  id: i,
  data: `Performance test entry ${i}`,
  tags: [`tag-${i % 10}`, `category-${i % 5}`],
  ,
  namespace: `namespace-${i % 10}`;
  )
}
const _insertTime = Date.now() - start;
log(`📊 Insert time for 1000 entries: ${insertTime}ms`, 'cyan');
// Test query performance
const _queryStart = Date.now();
// Key lookups
for (let i = 0; i < 100; i++) {
  // await perfStore.retrieve(`perf-key-${i}`, { namespace: `namespace-${i % 10}` });
}
// List operations
for (let i = 0; i < 10; i++) {
  // await perfStore.list({ namespace: `namespace-${i}`, limit: 50 });
}
// Search operations
  // await perfStore.search('Performance test', { limit: 50 });
const _queryTime = Date.now() - queryStart;
log(`📊 Query time for mixed operations: ${queryTime}ms`, 'cyan');
// Check cache effectiveness
const _finalStats = perfStore.getPerformanceStats();
log(`📊 Cache hit rate: ${(finalStats.cache.hitRate * 100).toFixed(1)}%`, 'cyan');
// Performance assertions
if (insertTime < 15000) {
  // 15 seconds for 1000 inserts
  log('✅ Insert performance acceptable', 'green');
} else {
  log(`⚠️ Insert performance slower than expected: ${insertTime}ms`, 'yellow');
}
if (queryTime < 5000) {
  // 5 seconds for mixed queries
  log('✅ Query performance acceptable', 'green');
} else {
  log(`⚠️ Query performance slower than expected: ${queryTime}ms`, 'yellow');
}
// Get database statistics
const _dbStats = await perfStore.getDatabaseStats();
log(;
`📊 Database stats: ${dbStats.entries} entries, ${dbStats.namespaces} namespaces, ${dbStats.indexes} indexes`,
('cyan');
)
perfStore.close()
// Test 4: Query Analysis
log('\n🔍 Test 4: Query Analysis', 'blue')
const _analysisStore = new SqliteMemoryStore({
      directory: testDir,
dbName: 'analysis-test.db'
})
  // await analysisStore.initialize()
const _analysis = await analysisStore.analyzeQueryPerformance();
if (analysis.queryPlans && Object.keys(analysis.queryPlans).length >= 4) {
  log('✅ Query analysis working', 'green');
} else {
  log('❌ Query analysis incomplete', 'red');
  allTestsPassed = false;
}
analysisStore.close();
} catch (error)
{
  log(`❌ Test failed with error: ${error.message}`, 'red');
  console.error(error);
  allTestsPassed = false;
}
finally
{
  // Cleanup
  // await fs.rm(testDir, { recursive: true, force: true });
}
// Summary
log('\n📋 Validation Summary', 'blue');
log('='.repeat(30), 'blue');
if (allTestsPassed) {
  log('🎉 All SQLite optimizations validated successfully!', 'green');
  log('📈 Performance improvements are working correctly', 'green');
  log('💾 Query caching is functional', 'green');
  log('⚡ Connection pooling is operational', 'green');
  log('🔍 Enhanced indexing is in place', 'green');
} else {
  log('⚠️ Some optimizations may have issues', 'yellow');
  log('   Check the output above for details', 'yellow');
}
return allTestsPassed;
}
// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSQLiteOptimizations();
  .then((success) => 
      process.exit(success ? 0 : 1)
  )
  .catch((error) => 
      console.error('Validation failed:', error)
  process.exit(1)
  )
}
export { validateSQLiteOptimizations };
export default validateSQLiteOptimizations;
