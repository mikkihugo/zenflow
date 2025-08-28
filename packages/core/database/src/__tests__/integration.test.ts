/**
 * Integration Tests for Database Package
 *
 * Tests real database operations with actual SQLite, LanceDB, and Kuzu instances.
 * Designed to validate the production-grade implementations work correctly.
 */

import { existsSync, rmSync, unlinkSync} from 'node:fs';
import { afterAll, beforeAll, describe, expect, test} from 'vitest';
import {
  createStorage,
  type DatabaseConfig,
  defaultConfigs,
  getDatabaseFactory,
  SQLiteAdapter,
} from '../main.js';

// Test constants
const COUNT_QUERY = 'SELECT COUNT(*) as count FROM test_table';
const TEST_VALUE = 'test_value';
const TRANSACTION_TEST = 'transaction_test';
const TEST_KEY = 'test_key';
const CREATE_TABLE_SQL =
  'CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)';
const INSERT_TEST_SQL = 'INSERT INTO test_table (name) VALUES (?)';

// Helper functions for SQLite testing
async function performBasicSQLiteTests(adapter:SQLiteAdapter): Promise<void> {
  await adapter.execute(CREATE_TABLE_SQL);
  await adapter.execute(INSERT_TEST_SQL, [TEST_VALUE]);

  const result = await adapter.query<{ id:number; name: string}>(
    'SELECT * FROM test_table')  );
  expect(result.rows).toHaveLength(1);
  expect(result.rows[0].name).toBe(TEST_VALUE);

  const health = await adapter.health();
  expect(health.healthy).toBe(true);
  expect(health.score).toBeGreaterThan(0);
}

async function transactionCallback(tx:{ 
   
  // eslint-disable-next-line no-unused-vars
  execute:(sql: string, params?:unknown[]) => Promise<unknown>; 
   
  // eslint-disable-next-line no-unused-vars 
  query:(sql: string) => Promise<{ rows: { count: number}[]}> 
}):Promise<void> {
  // Transaction callback for testing
  await tx.execute(INSERT_TEST_SQL, [TRANSACTION_TEST]);
  const txResult = await tx.query(COUNT_QUERY);
  expect(txResult.rows[0].count).toBe(2);
}

async function performTransactionTest(adapter:SQLiteAdapter): Promise<void> {
  await adapter.transaction(transactionCallback);
  const finalResult = await adapter.query<{ count:number}>(COUNT_QUERY);
  expect(finalResult.rows[0].count).toBe(2);
}

function cleanupTestFiles(paths:string[]): void {
  for (const path of paths) {
    try {
      if (existsSync(path)) {
        if (path.includes('.db')) {
          unlinkSync(path);
} else {
          rmSync(path, { recursive:true, force:true});
}
}
} catch {
      // Note:Test cleanup failed, but continuing
}
}
}

// Test setup constants
const testDbPath = './test.db';
const testVectorPath = './test_vectors';
const testGraphPath = './test_graph';
const perfTestDbPath = './perf_test.db';

// Test setup and teardown
beforeAll(() => {
  cleanupTestFiles([testDbPath, testVectorPath, testGraphPath, perfTestDbPath]);
});

afterAll(() => {
  cleanupTestFiles([testDbPath, testVectorPath, testGraphPath, perfTestDbPath]);
});

describe('Database Package Integration Tests - SQLite Adapter', () => {
  describe('SQLite Adapter', () => {
    test('should create connection and perform basic operations', async () => {
      const config:DatabaseConfig = {
        type: 'sqlite',        database:testDbPath,
        pool:{ min: 1, max:3},
};

      const adapter = new SQLiteAdapter(config);

      try {
        await adapter.connect();
        expect(adapter.isConnected()).toBe(true);

        await performBasicSQLiteTests(adapter);
        await performTransactionTest(adapter);
} finally {
        await adapter.disconnect();
}
});

    test('should handle connection pooling correctly', async () => {
      const config:DatabaseConfig = {
        type: 'sqlite',        database:testDbPath,
        pool:{ min: 2, max:5},
};

      const adapter = new SQLiteAdapter(config);

      try {
        await adapter.connect();

        // Test concurrent operations
        const createConcurrentPromise = (i:number) =>
          adapter.execute(INSERT_TEST_SQL, [`concurrent_${i}`]);
        const promises = Array.from({ length:10}, (_unused, i) =>
          createConcurrentPromise(i)
        );

        await Promise.all(promises);

        const result = await adapter.query<{ count:number}>(COUNT_QUERY);
        expect(result.rows[0].count).toBeGreaterThanOrEqual(10);

        // Test stats
        const __stats = await adapter.getStats();
        expect(stats.total).toBeGreaterThan(0);
        expect(stats.currentLoad).toBeGreaterThanOrEqual(0);
} finally {
        await adapter.disconnect();
}
});
});
});

describe('Database Package Integration Tests - Key-Value Storage', () => {
  describe('Key-Value Storage', () => {
    test('should perform basic key-value operations', async () => {
      const kvStorage = createStorage('keyValue',    'test_kv');

      // Test set/get
      await kvStorage.set(TEST_KEY, TEST_VALUE);
      const value = await kvStorage.get<string>(TEST_KEY);
      expect(value).toBe(TEST_VALUE);

      // Test has
      const exists = await kvStorage.has(TEST_KEY);
      expect(exists).toBe(true);

      // Test delete
      const deleted = await kvStorage.delete(TEST_KEY);
      expect(deleted).toBe(true);

      // Test get deleted key
      const deletedValue = await kvStorage.get(TEST_KEY);
      expect(deletedValue).toBeNull();

      // Test complex object storage
      const complexObject = {
        id:123,
        name: 'test',        nested:{ value: true},
        array:[1, 2, 3],
};

      await kvStorage.set('complex_key', complexObject);
      const retrievedObject =
        await kvStorage.get<typeof complexObject>('complex_key');
      expect(retrievedObject).toEqual(complexObject);
});

    test('should handle batch operations', async () => {
      const kvStorage = createStorage('keyValue',    'test_batch');

      // Test mset
      const entries = new Map([
        ['key1',    'value1'],
        ['key2',    'value2'],
        ['key3',    'value3'],
]);

      await kvStorage.mset(entries);

      // Test mget
      const results = await kvStorage.mget<string>([
        'key1',        'key2',        'key3',        'nonexistent',]);
      expect(results.get('key1')).toBe(' value1');
      expect(results.get('key2')).toBe(' value2');
      expect(results.get('key3')).toBe(' value3');
      expect(results.has('nonexistent')).toBe(false);

      // Test keys listing
      const keys = await kvStorage.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');

      // Test size
      const size = await kvStorage.size();
      expect(size).toBeGreaterThanOrEqual(3);

      // Test mdelete
      const deletedCount = await kvStorage.mdelete([
        'key1',        'key3',        'nonexistent',]);
      expect(deletedCount).toBe(2);

      // Verify deletion
      const remainingKeys = await kvStorage.keys();
      expect(remainingKeys).toContain('key2');
      expect(remainingKeys).not.toContain('key1');
      expect(remainingKeys).not.toContain('key3');
});
});
});

describe('Database Package Integration Tests - Default Configurations', () => {
  describe('Default Configurations', () => {
    test('should provide valid development configurations', () => {
      const { development} = defaultConfigs;

      expect(development.sqlite).toBeDefined();
      expect(development.sqlite.type).toBe('sqlite');
      expect(development.sqlite.pool?.min).toBe(1);

      expect(development.lancedb).toBeDefined();
      expect(development.lancedb.type).toBe('lancedb');

      expect(development.kuzu).toBeDefined();
      expect(development.kuzu.type).toBe('kuzu');
});

    test('should provide valid production configurations', () => {
      const { production} = defaultConfigs;

      expect(production.sqlite).toBeDefined();
      expect(production.sqlite.type).toBe('sqlite');
      expect(production.sqlite.pool?.min).toBe(5);
      expect(production.sqlite.pool?.max).toBe(50);
      expect(production.sqlite.healthCheck?.enabled).toBe(true);

      expect(production.lancedb).toBeDefined();
      expect(production.lancedb.healthCheck?.enabled).toBe(true);

      expect(production.kuzu).toBeDefined();
      expect(production.kuzu.options?.bufferPoolSize).toBe(
        4 * 1024 * 1024 * 1024
      );
});
});
});

describe('Database Package Integration Tests - Error Handling', () => {
  describe('Error Handling', () => {
    test('should handle connection errors gracefully', async () => {
      const config:DatabaseConfig = {
        type: 'sqlite',        database: '/invalid/path/cannot/create.db',};

      const adapter = new SQLiteAdapter(config);

      // Connection should fail gracefully
      await expect(adapter.connect()).rejects.toThrow();
      expect(adapter.isConnected()).toBe(false);
});

    test('should handle query errors gracefully', async () => {
      const config:DatabaseConfig = {
        type: 'sqlite',        database: ':memory:',};

      const adapter = new SQLiteAdapter(config);

      try {
        await adapter.connect();

        // Invalid SQL should throw proper error
        await expect(adapter.query('INVALID SQL SYNTAX')).rejects.toThrow();

        // Connection should still be healthy after error
        expect(adapter.isConnected()).toBe(true);

        // Should still be able to execute valid queries
        const result = await adapter.query('SELECT 1 as test');
        expect(result.rows).toHaveLength(1);
} finally {
        await adapter.disconnect();
}
});
});
});

describe('Database Package Integration Tests - Performance', () => {
  describe('Performance and Reliability', () => {
    function createPerformanceAdapter():SQLiteAdapter {
      const config:DatabaseConfig = {
        type: 'sqlite',        database:perfTestDbPath,
        pool:{ min: 1, max:1}, // Single connection to avoid table visibility issues
};
      return new SQLiteAdapter(config);
}

    async function performBulkInserts(
      adapter:SQLiteAdapter,
      operations:number
    ):Promise<void> {
      const insertPromises = Array.from({ length:operations}, (_unused, i) =>
        adapter.execute('INSERT INTO perf_test (data) VALUES (?)', [
          `data_${i}`,
])
      );
      await Promise.all(insertPromises);
}

    test('should handle high-volume operations efficiently', async () => {
      const adapter = createPerformanceAdapter();
      const operations = 1000;

      try {
        await adapter.connect();
        await adapter.execute(
          'CREATE TABLE perf_test (id INTEGER PRIMARY KEY, data TEXT)')        );

        // Ensure table creation is committed across all connections
        await adapter.query('SELECT COUNT(*) FROM perf_test');

        await performBulkInserts(adapter, operations);

        // Verify all records inserted
        const count = await adapter.query<{ total:number}>(
          'SELECT COUNT(*) as total FROM perf_test')        );
        expect(count.rows[0].total).toBe(operations);

        // Test bulk reads
        const readResult = await adapter.query(
          'SELECT * FROM perf_test ORDER BY id LIMIT 100')        );
        expect(readResult.rows).toHaveLength(100);
} finally {
        await adapter.disconnect();
}
}, 30000); // 30 second timeout for performance test
});
});

describe('Database Package Integration Tests - Database Factory', () => {
  test('should create connections with factory', () => {
    const factory = getDatabaseFactory();

    const sqliteConfig:DatabaseConfig = {
      type: 'sqlite',      database: ':memory:',};

    const connection = factory.createConnection(sqliteConfig);
    expect(connection).toBeDefined();
    expect(typeof connection.connect).toBe('function');
    expect(typeof connection.query).toBe('function');
    expect(typeof connection.transaction).toBe('function');
});

  test('should create storage configurations', () => {
    const factory = getDatabaseFactory();

    const kvConfig = factory.createStorageConfig('keyValue',    'test');
    expect(kvConfig.type).toBe('sqlite');
    expect(kvConfig.database).toBe('test_keyValue');

    const vectorConfig = factory.createStorageConfig('vector',    'test');
    expect(vectorConfig.type).toBe('lancedb');
    expect(vectorConfig.database).toBe('test_vector');

    const graphConfig = factory.createStorageConfig('graph',    'test');
    expect(graphConfig.type).toBe('kuzu');
    expect(graphConfig.database).toBe('test_graph');
});
});
