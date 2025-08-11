/**
 * High-Availability and Load Testing for SQLite Connection Pool
 *
 * This test suite validates the production readiness of the connection pool
 * by testing under various failure scenarios and high-load conditions.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SwarmPersistencePooled } from '../src/persistence-pooled.js';
import { SQLiteConnectionPool } from '../src/sqlite-pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_DB_PATH = path.join(__dirname, 'test-ha.db');
const STRESS_TEST_DURATION = 5000; // 5 seconds
const CONCURRENT_CONNECTIONS = 20;
const OPERATIONS_PER_CONNECTION = 100;

// Cleanup function
function cleanup() {
  try {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (fs.existsSync(`${TEST_DB_PATH}-wal`)) {
      fs.unlinkSync(`${TEST_DB_PATH}-wal`);
    }
    if (fs.existsSync(`${TEST_DB_PATH}-shm`)) {
      fs.unlinkSync(`${TEST_DB_PATH}-shm`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Test 1: Connection Pool Initialization and Health Check
async function testPoolInitialization() {
  try {
    cleanup();

    const pool = new SQLiteConnectionPool(TEST_DB_PATH, {
      maxReaders: 4,
      maxWorkers: 2,
      healthCheckInterval: 1000,
    });

    // Wait for pool to be ready
    await new Promise((resolve, reject) => {
      pool.once('ready', resolve);
      pool.once('error', reject);

      setTimeout(() => reject(new Error('Pool initialization timeout')), 10000);
    });

    // Test health check
    const stats = pool.getStats();

    if (!stats.isHealthy) {
      throw new Error('Pool health check failed');
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    throw error;
  }
}

// Test 2: Concurrent Read Operations
async function testConcurrentReads() {
  try {
    cleanup();

    const pool = new SQLiteConnectionPool(TEST_DB_PATH, {
      maxReaders: 8,
      maxWorkers: 2,
    });

    await new Promise((resolve, reject) => {
      pool.once('ready', resolve);
      pool.once('error', reject);
    });

    // Create test table
    await pool.write(`
      CREATE TABLE test_data (
        id INTEGER PRIMARY KEY,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert test data
    for (let i = 0; i < 1000; i++) {
      await pool.write('INSERT INTO test_data (value) VALUES (?)', [
        `test-value-${i}`,
      ]);
    }

    // Concurrent read test
    const startTime = Date.now();
    const concurrentReads = [];

    for (let i = 0; i < CONCURRENT_CONNECTIONS; i++) {
      concurrentReads.push(
        pool.read('SELECT * FROM test_data WHERE id = ?', [
          Math.floor(Math.random() * 1000) + 1,
        ]),
      );
    }

    const results = await Promise.all(concurrentReads);
    const _duration = Date.now() - startTime;

    // Verify all reads succeeded
    if (results.every((result) => result.length > 0)) {
    } else {
      throw new Error('Some concurrent reads failed');
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    throw error;
  }
}

// Test 3: Write Queue Under Load
async function testWriteQueueUnderLoad() {
  try {
    cleanup();

    const pool = new SQLiteConnectionPool(TEST_DB_PATH, {
      maxReaders: 4,
      maxWorkers: 2,
    });

    await new Promise((resolve, reject) => {
      pool.once('ready', resolve);
      pool.once('error', reject);
    });

    // Create test table
    await pool.write(`
      CREATE TABLE load_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER,
        operation_id INTEGER,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Simulate high-load write scenario
    const startTime = Date.now();
    const writePromises = [];

    for (let thread = 0; thread < CONCURRENT_CONNECTIONS; thread++) {
      for (let op = 0; op < OPERATIONS_PER_CONNECTION; op++) {
        writePromises.push(
          pool.write(
            'INSERT INTO load_test (thread_id, operation_id, value) VALUES (?, ?, ?)',
            [thread, op, `data-${thread}-${op}`],
          ),
        );
      }
    }

    await Promise.all(writePromises);
    const _duration = Date.now() - startTime;

    const totalOperations = CONCURRENT_CONNECTIONS * OPERATIONS_PER_CONNECTION;

    // Verify all writes succeeded
    const count = await pool.read('SELECT COUNT(*) as total FROM load_test');
    if (count[0].total === totalOperations) {
    } else {
      throw new Error(
        `Expected ${totalOperations} writes, got ${count[0].total}`,
      );
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    throw error;
  }
}

// Test 4: Worker Thread Performance
async function testWorkerThreadPerformance() {
  try {
    cleanup();

    const pool = new SQLiteConnectionPool(TEST_DB_PATH, {
      maxReaders: 4,
      maxWorkers: 4,
    });

    await new Promise((resolve, reject) => {
      pool.once('ready', resolve);
      pool.once('error', reject);
    });

    // Create test table with more complex structure
    await pool.write(`
      CREATE TABLE worker_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        value INTEGER,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert test data
    for (let i = 0; i < 5000; i++) {
      await pool.write(
        'INSERT INTO worker_test (category, value, description) VALUES (?, ?, ?)',
        [
          `category-${i % 10}`,
          Math.floor(Math.random() * 1000),
          `description-${i}`,
        ],
      );
    }

    // Test CPU-intensive queries in worker threads
    const startTime = Date.now();
    const workerPromises = [];

    for (let i = 0; i < 20; i++) {
      workerPromises.push(
        pool.executeInWorker(
          `
          SELECT category, 
                 COUNT(*) as count, 
                 AVG(value) as avg_value,
                 MAX(value) as max_value,
                 MIN(value) as min_value
          FROM worker_test 
          WHERE category = ? 
          GROUP BY category
        `,
          [`category-${i % 10}`],
        ),
      );
    }

    const results = await Promise.all(workerPromises);
    const _duration = Date.now() - startTime;

    // Verify results
    if (results.every((result) => result.length > 0)) {
    } else {
      throw new Error('Some worker thread queries failed');
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
    throw error;
  }
}

// Test 5: High-Availability Persistence Layer
async function testHAPersistenceLayer() {
  try {
    cleanup();

    const persistence = new SwarmPersistencePooled(TEST_DB_PATH, {
      maxReaders: 6,
      maxWorkers: 3,
    });

    await persistence.initialize();

    // Test swarm operations
    const swarmId = `swarm-${Date.now()}`;
    await persistence.createSwarm({
      id: swarmId,
      name: 'Test Swarm',
      topology: 'mesh',
      maxAgents: 10,
      strategy: 'balanced',
    });

    // Test concurrent agent creation
    const agentPromises = [];
    for (let i = 0; i < 50; i++) {
      agentPromises.push(
        persistence.createAgent({
          id: `agent-${i}`,
          swarmId: swarmId,
          name: `Agent ${i}`,
          type: 'researcher',
          capabilities: ['research', 'analysis'],
        }),
      );
    }

    await Promise.all(agentPromises);

    // Test concurrent memory operations
    const memoryPromises = [];
    for (let i = 0; i < 50; i++) {
      memoryPromises.push(
        persistence.storeMemory(`agent-${i}`, 'test-key', {
          value: `test-value-${i}`,
          timestamp: Date.now(),
        }),
      );
    }

    await Promise.all(memoryPromises);

    // Test mixed read/write operations
    const mixedPromises = [];
    for (let i = 0; i < 100; i++) {
      if (i % 2 === 0) {
        // Read operation
        mixedPromises.push(persistence.getAgent(`agent-${i % 50}`));
      } else {
        // Write operation
        mixedPromises.push(
          persistence.updateAgentStatus(`agent-${i % 50}`, 'busy'),
        );
      }
    }

    await Promise.all(mixedPromises);

    // Check statistics
    const _poolStats = persistence.getPoolStats();
    const persistenceStats = persistence.getPersistenceStats();

    if (persistenceStats.totalErrors > 0) {
      throw new Error(
        `${persistenceStats.totalErrors} errors occurred during testing`,
      );
    }

    await persistence.close();
  } catch (error) {
    console.error('❌ Test 5 failed:', error.message);
    throw error;
  }
}

// Test 6: Stress Test - Sustained Load
async function testStressTestSustainedLoad() {
  try {
    cleanup();

    const pool = new SQLiteConnectionPool(TEST_DB_PATH, {
      maxReaders: 8,
      maxWorkers: 4,
    });

    await new Promise((resolve, reject) => {
      pool.once('ready', resolve);
      pool.once('error', reject);
    });

    // Create test table
    await pool.write(`
      CREATE TABLE stress_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let operationCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    // Sustained load test
    const loadTest = async () => {
      const operations = [];

      while (Date.now() - startTime < STRESS_TEST_DURATION) {
        // Mix of read and write operations
        for (let i = 0; i < 10; i++) {
          if (Math.random() > 0.3) {
            // Read operation (70% of operations)
            operations.push(
              pool
                .read('SELECT COUNT(*) as count FROM stress_test')
                .then(() => operationCount++)
                .catch(() => errorCount++),
            );
          } else {
            // Write operation (30% of operations)
            operations.push(
              pool
                .write('INSERT INTO stress_test (data) VALUES (?)', [
                  `data-${operationCount}`,
                ])
                .then(() => operationCount++)
                .catch(() => errorCount++),
            );
          }
        }

        // Execute batch
        await Promise.all(operations);
        operations.length = 0;

        // Brief pause to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    };

    await loadTest();

    const duration = Date.now() - startTime;
    const _throughput = ((operationCount / duration) * 1000).toFixed(2);

    if (errorCount / operationCount > 0.01) {
      // Allow up to 1% error rate
      throw new Error(
        `Error rate too high: ${((errorCount / operationCount) * 100).toFixed(2)}%`,
      );
    }

    // Check pool health after stress test
    const stats = pool.getStats();
    if (!stats.isHealthy) {
      throw new Error('Pool became unhealthy during stress test');
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Test 6 failed:', error.message);
    throw error;
  }
}

// Test 7: Connection Recovery and Resilience
async function testConnectionRecovery() {
  try {
    cleanup();

    const pool = new SQLiteConnectionPool(TEST_DB_PATH, {
      maxReaders: 4,
      maxWorkers: 2,
      healthCheckInterval: 500,
    });

    await new Promise((resolve, reject) => {
      pool.once('ready', resolve);
      pool.once('error', reject);
    });

    // Create test table
    await pool.write(`
      CREATE TABLE recovery_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT
      )
    `);

    // Test normal operations
    await pool.write('INSERT INTO recovery_test (value) VALUES (?)', [
      'test-1',
    ]);
    const _result1 = await pool.read('SELECT * FROM recovery_test');

    // Simulate some stress to trigger potential issues
    const stressPromises = [];
    for (let i = 0; i < 100; i++) {
      stressPromises.push(
        pool.write('INSERT INTO recovery_test (value) VALUES (?)', [
          `stress-${i}`,
        ]),
      );
    }

    await Promise.all(stressPromises);

    // Test operations after stress
    await pool.write('INSERT INTO recovery_test (value) VALUES (?)', [
      'test-2',
    ]);
    const _result2 = await pool.read(
      'SELECT COUNT(*) as count FROM recovery_test',
    );

    // Check pool health
    const stats = pool.getStats();
    if (!stats.isHealthy) {
      throw new Error('Pool health check failed after stress');
    }

    await pool.close();
  } catch (error) {
    console.error('❌ Test 7 failed:', error.message);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  const tests = [
    testPoolInitialization,
    testConcurrentReads,
    testWriteQueueUnderLoad,
    testWorkerThreadPerformance,
    testHAPersistenceLayer,
    testStressTestSustainedLoad,
    testConnectionRecovery,
  ];

  let _passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      _passed++;
    } catch (error) {
      failed++;
      console.error(`Test failed: ${error.message}\n`);
    }
  }

  if (failed === 0) {
  } else {
  }

  cleanup();
}

// Handle cleanup on exit
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Run tests
runAllTests().catch(console.error);
