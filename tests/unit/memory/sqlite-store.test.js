import { promises   } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it  } from '@jest';
import { SqliteMemoryStore  } from '../../../src/memory/sqlite-store.js';

// Mock dependencies that don't need actual implementation'
const _mockSqliteWrapper = () => ({ createDatabase) => ({
    prepare) => ({
      run: jest.fn(),
get: jest.fn(),
all: jest.fn(),
finalize: jest.fn()   })),
close: jest.fn(),
exec: jest.fn(),
pragma: jest.fn() }))
})
jest.mock('../../../src/memory/sqlite-wrapper.js', mockSqliteWrapper)
describe('SqliteMemoryStore', () =>
// {
  let _memoryStore;
  let testDir;
  beforeEach(async() => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-zen-sqlite-test-'));
    _memoryStore = new SqliteMemoryStore({ directory,
    dbName);
  })
afterEach(async() =>
// {
  if(memoryStore?.db) {
  // await memoryStore.close();
  //   }
  try {
  // // await fs.rm(testDir, { recursive, force });
    } catch(/* _error */) {
      // Ignore cleanup errors
    //     }
})
describe('constructor', () =>
// {
  it('should initialize with default options', () => {
    const _store = new SqliteMemoryStore();
    expect(store.options.dbName).toBe('memory.db');
    expect(store.options.cacheSize).toBe(10000);
    expect(store.options.mmapSize).toBe(268435456);
    expect(store.options.enableCache).toBe(true);
  });
  it('should initialize with custom options', () => {
      const _customOptions = {
        dbName: 'custom.db',
        cacheSize,
        enableCache };
  const _store = new SqliteMemoryStore(customOptions);
  expect(store.options.dbName).toBe('custom.db');
  expect(store.options.cacheSize).toBe(5000);
  expect(store.options.enableCache).toBe(false);
})
})
describe('_getMemoryDirectory', () =>
// {
  it('should return .swarm directory in current working directory', () => {
    const _store = new SqliteMemoryStore();
    // const _expectedPath = path.join(process.cwd(), '.swarm'); // LINT: unreachable code removed
    expect(store._getMemoryDirectory()).toBe(expectedPath);
  });
})
describe('initialization', () =>
// {
  it('should initialize database and create directory if needed', async() => {
    expect(memoryStore.isInitialized).toBe(false);
  // await memoryStore.initialize();
    expect(memoryStore.isInitialized).toBe(true);
    expect(memoryStore.db).toBeDefined();
  });
  it('should not reinitialize if already initialized', async() => {
  // await memoryStore.initialize();
    const _firstDb = memoryStore.db;
  // await memoryStore.initialize();
    expect(memoryStore.db).toBe(firstDb);
  });
})
describe('memory operations', () =>
// {
  beforeEach(async() => {
  // await memoryStore.initialize();
  });
  it('should store and retrieve memory', async() => {
      const _testMemory = {
        key: 'test-key',
        value: 'test-value',type: 'test'  };
  // // await memoryStore.store(testMemory.key, testMemory.value, testMemory.metadata);
// const _retrieved = awaitmemoryStore.retrieve(testMemory.key);
  expect(retrieved).toEqual(;
  expect.objectContaining({ key: testMemory.key,
  value: testMemory.value,
  metadata: testMemory.metadata))
  })
// )
})
it('should return null for non-existent keys', async() =>
// {
// const _result = awaitmemoryStore.retrieve('non-existent-key');
  // expect(result).toBeNull(); // LINT: unreachable code removed
})
it('should list all memories', async() =>
// {
  // await memoryStore.store('key1', 'value1');
  // await memoryStore.store('key2', 'value2');
// const _memories = awaitmemoryStore.list();
  expect(memories).toHaveLength(2);
  expect(memories.map((m) => m.key)).toContain('key1');
  expect(memories.map((m) => m.key)).toContain('key2');
})
it('should delete memory', async() =>
// {
  // await memoryStore.store('delete-test', 'value');
// const _retrieved = awaitmemoryStore.retrieve('delete-test');
  expect(retrieved).toBeTruthy();
  // // await memoryStore.delete('delete-test');
  retrieved = // await memoryStore.retrieve('delete-test');
  expect(retrieved).toBeNull();
})
it('should clear all memories', async() =>
// {
  // await memoryStore.store('key1', 'value1');
  // await memoryStore.store('key2', 'value2');
// const _memories = awaitmemoryStore.list();
  expect(memories.length).toBeGreaterThan(0);
  // // await memoryStore.clear();
  memories = // await memoryStore.list();
  expect(memories).toHaveLength(0);
})
})
describe('search functionality', () =>
// {
  beforeEach(async() => {
  // await memoryStore.initialize();
  // await memoryStore.store('search1', 'hello world', { tags);
  // await memoryStore.store('search2', 'goodbye world', { tags);
  // // await memoryStore.store('search3', 'hello universe', { tags);
  });
  it('should search by term', async() => {
// const _results = awaitmemoryStore.search('hello');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.key === 'search1')).toBe(true);
  });
  it('should search with limit', async() => {
// const _results = awaitmemoryStore.search('world', { limit });
    expect(results).toHaveLength(1);
  });
})
describe('error handling', () =>
// {
  it('should handle initialization errors gracefully', async() => {
    const _store = new SqliteMemoryStore({ directory);
    // Should not throw but should handle gracefully
  // await expect(store.initialize()).rejects.toThrow();
    });
  it('should handle operations on uninitialized store', async() => {
    const _store = new SqliteMemoryStore();
  // await expect(store.store('key', 'value')).rejects.toThrow();
  });
})
describe('caching', () =>
// {
  beforeEach(async() => {
    memoryStore = new SqliteMemoryStore({ directory,
    enableCache,
    cacheTimeout   });
  // // await memoryStore.initialize();
})
it('should cache query results when enabled', async() =>
// {
  // await memoryStore.store('cache-test', 'value');
  // First call should miss cache
// const _result1 = awaitmemoryStore.retrieve('cache-test');
  expect(memoryStore.cacheStats.misses).toBeGreaterThan(0);
  // Second call should hit cache(if caching is implemented)
// const _result2 = awaitmemoryStore.retrieve('cache-test');
  expect(result1).toEqual(result2);
})
})
describe('cleanup', () =>
// {
  it('should close database connection properly', async() => {
  // await memoryStore.initialize();
    expect(memoryStore.db).toBeDefined();
  // await memoryStore.close();
    // After implementing close method, db should be null
  });
})
})
}}}}}
