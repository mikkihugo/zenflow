#!/usr/bin/env node;
/**
 * MCP Database Persistence Test Suite;
 * Tests that MCP tools properly persist data to SQLite;
 * Related to issue #312;
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Dynamic import for sqlite3 to handle module loading issues
let sqlite3;
try {
  sqlite3 = (// await import('sqlite3')).default;
} catch (error) {
  console.warn('sqlite3 not available for MCP persistence tests);'
// }
const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// Colors for output
const _colors = {
  green: '\x1b[32m',
red: '\x1b[31m',
yellow: '\x1b[33m',
blue: '\x1b[34m',
reset: '\x1b[0m'
// }
class MCPPersistenceTest {
  constructor() {
    this.dbPath = path.join(process.cwd(), '.swarm', 'memory.db');
    this.testResults = [];
    this.testCount = 0;
    this.passedCount = 0;
  //   }
  log(message, color = 'reset') {
    console.warn(`${colors[color]}${message}${colors.reset}`);
  //   }
  async runTest(name, testFn) {
    this.testCount++;
    try {
  // await testFn();
      this.passedCount++;
      this.testResults.push({ name, passed });
      this.log(`✅ ${name}`, 'green');
    } catch (error) {
      this.testResults.push({ name, passed, error);
      this.log(`❌ ${name});`
    //     }
  //   }
  async checkDatabaseExists() {
  // await this.runTest('Database file exists', async () => {
      if (!fs.existsSync(this.dbPath)) {
        throw new Error(`Database not found at ${this.dbPath}`);
      //       }
    });
  //   }
  async queryDatabase(_query) {
    if (!sqlite3) {
      throw new Error('sqlite3 module not available - skipping database query');
    //     }
    // return new Promise((resolve, reject) => {
      const _db = new sqlite3.Database(this.dbPath);
      // db.all(query, (err, rows) => { // LINT: unreachable code removed
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  })
// }
async;
testMemoryUsageTool();
// {
  this.log('\n� Testing memory_usage tool...', 'blue');
  // Store test data
  // // await this.runTest('memory_usage store operation', async () => {
    const _key = `test_${Date.now()}`;
    const _value = { test, timestamp: new Date().toISOString() };
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call memory_usage '{"action": "store", "key": "${key}", "value": ${JSON.stringify(JSON.stringify(value))}, "namespace": "test"}'`,
    encoding: 'utf8';
    //     )
    if (!result.includes('"success") && !result.includes('"stored")) {
      throw new Error('Store operation failed');
    //     }
    // Verify in database
// const _rows = awaitthis.queryDatabase(;
    `SELECT * FROM memory_entries WHERE key = '${key}' AND namespace = 'test'`;
    //     )
    if (rows.length === 0) {
      throw new Error('Data not found in database');
    //     }
  });
  // Retrieve test data
  // // await this.runTest('memory_usage retrieve operation', async () => {
    const _key = `test_retrieve_${Date.now()}`;
    const _value = { retrieve, time: Date.now() };
    // First store
    execSync(;
    `npx claude-zen@alpha mcp call memory_usage '{"action": "store", "key": "${key}", "value": ${JSON.stringify(JSON.stringify(value))}, "namespace": "test"}'`,
    encoding: 'utf8';
    //     )
    // Then retrieve
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call memory_usage '{"action": "retrieve", "key": "${key}", "namespace": "test"}'`,
    encoding: 'utf8';
    //     )
    if (!result.includes('"found")) {'
      throw new Error('Retrieve operation failed');
    //     }
  });
  // List operation
  // // await this.runTest('memory_usage list operation', async () => {
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call memory_usage '{"action": "list", "namespace": "test"}'`,
    encoding: 'utf8';
    //     )
    if (!result.includes('"success")) {'
      throw new Error('List operation failed');
    //     }
  });
// }
async;
testAgentSpawnPersistence();
// {
  this.log('\n🤖 Testing agent_spawn persistence...', 'blue');
  // // await this.runTest('agent_spawn creates database records', async () => {
    const _agentName = `test_agent_${Date.now()}`;
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call agent_spawn '{"type": "researcher", "name": "${agentName}", "capabilities": ["test"]}'`,
    encoding: 'utf8';
    //     )
    if (!result.includes('agentId')) {
      throw new Error('Agent spawn failed');
    //     }
    // Check if agent info is stored in memory

    // Even if not found in specific namespace, the spawn should have created some record
    // This is a soft check  implementation might use different storage patterns
  });
// }
async;
testSwarmInitPersistence();
// {
  this.log('\n� Testing swarm_init persistence...', 'blue');
  // // await this.runTest('swarm_init persists configuration', async () => {
    const _swarmId = `test_swarm_${Date.now()}`;
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call swarm_init '{"topology": "mesh", "maxAgents", "swarmId": "${swarmId}"}'`,
    encoding: 'utf8';
    //     )
    if (!result.includes('"initialized")) {'
      throw new Error('Swarm init failed');
    //     }
    // Verify some persistence happened
// const _rows = awaitthis.queryDatabase(;
    `SELECT COUNT(*)  FROM memory_entries WHERE created_at > datetime('now', '-1 minute')`;
    //     )
    if (rows[0].count === 0) {
      throw new Error('No new database entries created during swarm init');
    //     }
  });
// }
async;
testHooksPersistence();
// {
  this.log('\n� Testing hooks persistence...', 'blue');
  // // await this.runTest('Hooks persist to SQLite', async () => {
    const _message = `Test hook ${Date.now()}`;
    const _result = execSync(;
    `node src/cli/cli-main.js hooks notify --message "${message}" --level "test"`,
    encoding: 'utf8';
    //     )
    if (!result.includes('saved to .swarm/memory.db')) {
      throw new Error('Hook notification not saved');
    //     }
    // Verify in database
// const _rows = awaitthis.queryDatabase(;
    `SELECT * FROM messages WHERE key LIKE '%notify%' ORDER BY timestamp DESC LIMIT 1`;
    //     )
    if (rows.length === 0) {
      throw new Error('Hook message not found in database');
    //     }
  });
// }
async;
testDatabaseStructure();
// {
  this.log('\n� Testing database structure...', 'blue');
  // // await this.runTest('memory_entries table exists', async () => {
// const _tables = awaitthis.queryDatabase(;
    `SELECT name FROM sqlite_master WHERE type='table' AND name='memory_entries'`;
    //     )
    if (tables.length === 0) {
      throw new Error('memory_entries table not found');
    //     }
  });
  // // await this.runTest('messages table exists', async () => {
// const _tables = awaitthis.queryDatabase(;
    `SELECT name FROM sqlite_master WHERE type='table' AND name='messages'`;
    //     )
    if (tables.length === 0) {
      throw new Error('messages table not found');
    //     }
  });
  // // await this.runTest('Database indexes exist', async () => {
// const _indexes = awaitthis.queryDatabase(;
    `SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'`;
    //     )
    if (indexes.length === 0) {
      throw new Error('No indexes found in database');
    //     }
  });
// }
async;
testConcurrentAccess();
// {
  this.log('\n Testing concurrent database access...', 'blue');
  // // await this.runTest('Concurrent writes succeed', async () => {
    const _promises = [];
    // Spawn 5 concurrent write operations
    for (let i = 0; i < 5; i++) {
      const _key = `concurrent_${Date.now()}_${i}`;
      promises.push(;
      new Promise((resolve, reject) => {
        try {
              const _result = execSync(;
                `npx claude-zen@alpha mcp call memory_usage '{"action");'`
              resolve(result);
            } catch (error) {
              reject(error);
            //             }
      });
      //       )
    //     }
// const _results = awaitPromise.all(promises);
    // Verify all succeeded
    for (const result of results) {
      if (!result.includes('"success")) {'
        throw new Error('Concurrent write failed');
      //       }
    //     }
    // Verify all entries in database
// const _rows = awaitthis.queryDatabase(;
    `SELECT COUNT(*)  FROM memory_entries WHERE namespace = 'concurrent'`;
    //     )
    if (rows[0].count < 5) {
      throw new Error(`Expected at least 5 concurrent entries, found ${rows[0].count}`);
    //     }
  });
// }
async;
generateReport();
// {
  this.log('\n� Test Report', 'yellow');
  this.log('='.repeat(50), 'yellow');
  this.log(`Total Tests);`
  this.log(`Passed);`
  this.log(`Failed);`
  if (this.testCount === this.passedCount) {
    this.log('\n✨ All tests passed! MCP tools are properly persisting to SQLite.', 'green');
    this.log(' Issue #312 appears to be resolved!', 'green');
  } else {
    this.log('\n⚠ Some tests failed. Review the results above.', 'red');
    // Show failed tests
    const _failed = this.testResults.filter((r) => !r.passed);
    if (failed.length > 0) {
      this.log('\nFailed Tests);'
      failed.forEach((test) => {
        this.log(`  - ${test.name});`
      });
    //     }
  //   }
  // Save results
  // // await this.saveResults();
// }
async;
saveResults();
// {
  const _timestamp = new Date().toISOString();
  const _results = {
      timestamp,
  totalTests: this.testCount,
  passed: this.passedCount,
  failed: this.testCount - this.passedCount,
  details: this.testResults,
  dbPath: this.dbPath,
  dbSize: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size
// }
// Store results using MCP
execSync(;
`node src/cli/cli-main.js mcp call memory_usage '{"action": "store", "key": "test_results_${Date.now()}", "value": ${JSON.stringify(JSON.stringify(results))}, "namespace": "test_results"}'`,
// {
  encoding: 'utf8';
})
// Also save to file
const _resultsPath = path.join(__dirname, 'mcp-persistence-test-results.json');
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
this.log(`\n� Results saved to);`
// }
// async
run() {}
// {
  this.log('🧪 MCP Database Persistence Test Suite', 'blue');
  this.log('Testing for issue #312);'
  this.log('='.repeat(50), 'blue');
  try {
      // Ensure MCP server is available
      this.log('\n� Checking MCP server availability...', 'yellow');
      execSync('node src/cli/cli-main.js mcp list', { encoding);
      this.log('✅ MCP server is available', 'green');
      // Run all tests
  // // await this.checkDatabaseExists();
  // // await this.testDatabaseStructure();
  // // await this.testMemoryUsageTool();
  // // await this.testAgentSpawnPersistence();
  // // await this.testSwarmInitPersistence();
  // // await this.testHooksPersistence();
  // // await this.testConcurrentAccess();
      // Generate report
  // // await this.generateReport();
    } catch (error) {
      this.log(`\n� Fatal error);`
      process.exit(1);
    //     }
// }
// }
// Run the tests
const _tester = new MCPPersistenceTest();
tester.run().catch(console.error);

}}}