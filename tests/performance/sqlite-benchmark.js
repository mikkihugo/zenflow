/**
 * SQLite Performance Benchmark Suite
 * Tests and measures performance improvements for SQLite memory backend
 */

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SqliteMemoryStore } from '../../src/memory/sqlite-store.js';
import { isSQLiteAvailable } from '../../src/memory/sqlite-wrapper.js';

class SQLitePerformanceBenchmark {
  constructor(options = {}) {
    this.options = {
      testDataSize: options.testDataSize || 1000,
      concurrentOperations: options.concurrentOperations || 10,
      iterationsPerTest: options.iterationsPerTest || 5,
      ...options
    };
    
    this.results = {};
    this.testDir = null;
    this.stores = new Map();
  }

  async initialize() {
    // Check SQLite availability
    const available = await isSQLiteAvailable();
    if (!available) {
      throw new Error('SQLite not available for benchmarking');
    }

    // Create test directory
    this.testDir = path.join(os.tmpdir(), `sqlite-benchmark-${Date.now()}`);
    await fs.mkdir(this.testDir, { recursive: true });

    console.log(`🧪 SQLite Performance Benchmark Suite`);
    console.log(`📂 Test directory: ${this.testDir}`);
    console.log(`📊 Test data size: ${this.options.testDataSize} entries`);
    console.log(`⚡ Concurrent operations: ${this.options.concurrentOperations}`);
    console.log(`🔄 Iterations per test: ${this.options.iterationsPerTest}`);
  }

  async createStore(name, options = {}) {
    const store = new SqliteMemoryStore({
      directory: this.testDir,
      dbName: `${name}.db`,
      ...options
    });
    
    await store.initialize();
    this.stores.set(name, store);
    return store;
  }

  generateTestData(size = this.options.testDataSize) {
    const data = [];
    for (let i = 0; i < size; i++) {
      data.push({
        key: `test-key-${i.toString().padStart(6, '0')}`,
        value: {
          id: i,
          name: `Test Item ${i}`,
          description: `This is test item number ${i} with some additional content to make the data more realistic`,
          tags: [`tag-${i % 10}`, `category-${i % 5}`, `type-${i % 3}`],
          metadata: {
            created: new Date().toISOString(),
            priority: i % 5,
            active: i % 2 === 0,
            score: Math.random() * 100
          }
        },
        namespace: `namespace-${i % 10}`
      });
    }
    return data;
  }

  async measureOperation(name, operation) {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    const duration = end - start;

    if (!this.results[name]) {
      this.results[name] = [];
    }
    this.results[name].push(duration);

    return { result, duration };
  }

  async benchmarkBasicOperations() {
    console.log('\n📈 Benchmarking Basic Operations...');
    
    // Test with and without cache
    const storeWithCache = await this.createStore('with-cache', { enableCache: true });
    const storeWithoutCache = await this.createStore('without-cache', { enableCache: false });

    const testData = this.generateTestData(100);

    for (let iteration = 0; iteration < this.options.iterationsPerTest; iteration++) {
      console.log(`  Iteration ${iteration + 1}/${this.options.iterationsPerTest}`);

      // Test store operations
      for (const store of [storeWithCache, storeWithoutCache]) {
        const suffix = store === storeWithCache ? '-cached' : '-uncached';

        // Store operations
        await this.measureOperation(`store${suffix}`, async () => {
          for (const item of testData) {
            await store.store(item.key, item.value, { namespace: item.namespace });
          }
        });

        // Retrieve operations
        await this.measureOperation(`retrieve${suffix}`, async () => {
          for (const item of testData) {
            await store.retrieve(item.key, { namespace: item.namespace });
          }
        });

        // List operations
        await this.measureOperation(`list${suffix}`, async () => {
          for (let i = 0; i < 10; i++) {
            await store.list({ namespace: `namespace-${i}`, limit: 50 });
          }
        });

        // Search operations
        await this.measureOperation(`search${suffix}`, async () => {
          const patterns = ['test-key-00', 'Test Item', 'tag-5', 'priority'];
          for (const pattern of patterns) {
            await store.search(pattern, { namespace: 'namespace-0', limit: 20 });
          }
        });
      }
    }
  }

  async benchmarkConcurrentOperations() {
    console.log('\n⚡ Benchmarking Concurrent Operations...');
    
    const store = await this.createStore('concurrent', { 
      enableCache: true,
      maxConnections: 4 
    });

    const testData = this.generateTestData(this.options.testDataSize);

    for (let iteration = 0; iteration < this.options.iterationsPerTest; iteration++) {
      console.log(`  Iteration ${iteration + 1}/${this.options.iterationsPerTest}`);

      // Concurrent writes
      await this.measureOperation('concurrent-writes', async () => {
        const chunks = this.chunkArray(testData, this.options.concurrentOperations);
        const promises = chunks.map(async (chunk, chunkIndex) => {
          for (const item of chunk) {
            await store.store(`${item.key}-${chunkIndex}`, item.value, { 
              namespace: item.namespace 
            });
          }
        });
        await Promise.all(promises);
      });

      // Concurrent reads
      await this.measureOperation('concurrent-reads', async () => {
        const readPromises = [];
        for (let i = 0; i < this.options.concurrentOperations; i++) {
          readPromises.push(async () => {
            for (let j = 0; j < 100; j++) {
              const key = `test-key-${j.toString().padStart(6, '0')}-${i}`;
              await store.retrieve(key, { namespace: `namespace-${j % 10}` });
            }
          });
        }
        await Promise.all(readPromises.map(fn => fn()));
      });

      // Mixed operations
      await this.measureOperation('mixed-operations', async () => {
        const operations = [];
        for (let i = 0; i < this.options.concurrentOperations; i++) {
          operations.push(async () => {
            // Mix of reads, writes, searches
            for (let j = 0; j < 20; j++) {
              if (j % 3 === 0) {
                await store.store(`mixed-${i}-${j}`, { data: `value-${j}` });
              } else if (j % 3 === 1) {
                await store.retrieve(`mixed-${i}-${j-1}`);
              } else {
                await store.search(`mixed-${i}`, { limit: 10 });
              }
            }
          });
        }
        await Promise.all(operations.map(fn => fn()));
      });
    }
  }

  async benchmarkIndexPerformance() {
    console.log('\n🔍 Benchmarking Index Performance...');
    
    const storeWithIndexes = await this.createStore('with-indexes');
    
    // Create a large dataset to test index effectiveness
    const largeDataset = this.generateTestData(5000);
    
    // Populate the database
    console.log('  Populating database with test data...');
    for (const item of largeDataset) {
      await storeWithIndexes.store(item.key, item.value, { 
        namespace: item.namespace,
        ttl: Math.random() > 0.5 ? 3600 : null // Some with TTL
      });
    }

    for (let iteration = 0; iteration < this.options.iterationsPerTest; iteration++) {
      console.log(`  Iteration ${iteration + 1}/${this.options.iterationsPerTest}`);

      // Test queries that should benefit from indexes
      await this.measureOperation('namespace-queries', async () => {
        for (let i = 0; i < 10; i++) {
          await storeWithIndexes.list({ namespace: `namespace-${i}`, limit: 100 });
        }
      });

      await this.measureOperation('expiration-queries', async () => {
        await storeWithIndexes.cleanup();
      });

      await this.measureOperation('key-lookups', async () => {
        for (let i = 0; i < 100; i++) {
          const key = `test-key-${i.toString().padStart(6, '0')}`;
          await storeWithIndexes.retrieve(key, { namespace: `namespace-${i % 10}` });
        }
      });

      await this.measureOperation('pattern-searches', async () => {
        const patterns = ['test-key-001', 'Test Item 1', 'tag-1', 'namespace-1'];
        for (const pattern of patterns) {
          await storeWithIndexes.search(pattern, { limit: 50 });
        }
      });
    }
  }

  async benchmarkCacheEffectiveness() {
    console.log('\n💾 Benchmarking Cache Effectiveness...');
    
    const store = await this.createStore('cache-test', { 
      enableCache: true,
      cacheTimeout: 300000 // 5 minutes
    });

    const testData = this.generateTestData(200);
    
    // Populate data
    for (const item of testData) {
      await store.store(item.key, item.value, { namespace: item.namespace });
    }

    for (let iteration = 0; iteration < this.options.iterationsPerTest; iteration++) {
      console.log(`  Iteration ${iteration + 1}/${this.options.iterationsPerTest}`);

      // First read (cold cache)
      await this.measureOperation('cold-cache-reads', async () => {
        for (let i = 0; i < 50; i++) {
          const key = `test-key-${i.toString().padStart(6, '0')}`;
          await store.retrieve(key, { namespace: `namespace-${i % 10}` });
        }
      });

      // Second read (warm cache)
      await this.measureOperation('warm-cache-reads', async () => {
        for (let i = 0; i < 50; i++) {
          const key = `test-key-${i.toString().padStart(6, '0')}`;
          await store.retrieve(key, { namespace: `namespace-${i % 10}` });
        }
      });

      // List operations (cached)
      await this.measureOperation('cached-list-operations', async () => {
        for (let i = 0; i < 5; i++) {
          await store.list({ namespace: `namespace-${i}`, limit: 20 });
          await store.list({ namespace: `namespace-${i}`, limit: 20 }); // Should hit cache
        }
      });
    }
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  calculateStats(measurements) {
    if (measurements.length === 0) return {};
    
    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);
    
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  async generateReport() {
    console.log('\n📊 Generating Performance Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testConfiguration: this.options,
      results: {}
    };

    // Calculate statistics for each operation
    for (const [operation, measurements] of Object.entries(this.results)) {
      report.results[operation] = this.calculateStats(measurements);
    }

    // Get database and cache statistics
    for (const [name, store] of this.stores) {
      const dbStats = await store.getDatabaseStats();
      const perfStats = store.getPerformanceStats();
      
      report.results[`${name}-database-stats`] = dbStats;
      report.results[`${name}-performance-stats`] = perfStats;
    }

    // Save report
    const reportPath = path.join(this.testDir, 'performance-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    this.printSummary(report);
    
    return { report, reportPath };
  }

  printSummary(report) {
    console.log('\n📈 Performance Summary');
    console.log('='.repeat(50));

    const operations = Object.keys(report.results).filter(key => 
      !key.includes('-database-stats') && !key.includes('-performance-stats')
    );

    for (const operation of operations) {
      const stats = report.results[operation];
      if (stats.mean !== undefined) {
        console.log(`${operation.padEnd(25)} | Avg: ${stats.mean.toFixed(2)}ms | Med: ${stats.median.toFixed(2)}ms | P95: ${stats.p95.toFixed(2)}ms`);
      }
    }

    // Cache effectiveness
    const cacheOperations = operations.filter(op => op.includes('cache'));
    if (cacheOperations.length >= 2) {
      const cold = report.results['cold-cache-reads'];
      const warm = report.results['warm-cache-reads'];
      if (cold && warm) {
        const improvement = ((cold.mean - warm.mean) / cold.mean * 100);
        console.log(`\n💾 Cache Improvement: ${improvement.toFixed(1)}% faster (${warm.mean.toFixed(2)}ms vs ${cold.mean.toFixed(2)}ms)`);
      }
    }

    // Concurrent vs sequential comparison
    const concurrent = report.results['concurrent-reads'];
    const sequential = report.results['retrieve-cached'];
    if (concurrent && sequential) {
      console.log(`\n⚡ Concurrency: ${this.options.concurrentOperations}x operations in ${concurrent.mean.toFixed(2)}ms`);
    }
  }

  async cleanup() {
    // Close all stores
    for (const store of this.stores.values()) {
      store.close();
    }
    this.stores.clear();

    // Clean up test directory
    if (this.testDir) {
      await fs.rm(this.testDir, { recursive: true, force: true });
    }
  }

  async run() {
    try {
      await this.initialize();
      
      await this.benchmarkBasicOperations();
      await this.benchmarkConcurrentOperations();
      await this.benchmarkIndexPerformance();
      await this.benchmarkCacheEffectiveness();
      
      const { report, reportPath } = await this.generateReport();
      
      console.log(`\n✅ Benchmark completed successfully!`);
      console.log(`📁 Report saved to: ${reportPath}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Benchmark failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new SQLitePerformanceBenchmark({
    testDataSize: parseInt(process.argv[2]) || 1000,
    concurrentOperations: parseInt(process.argv[3]) || 10,
    iterationsPerTest: parseInt(process.argv[4]) || 3
  });

  benchmark.run().catch(error => {
    console.error('Benchmark execution failed:', error);
    process.exit(1);
  });
}

export { SQLitePerformanceBenchmark };
export default SQLitePerformanceBenchmark;