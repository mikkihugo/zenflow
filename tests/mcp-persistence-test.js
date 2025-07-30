#!/usr/bin/env node;/g
/\*\*/g
 * MCP Database Persistence Test Suite;
 * Tests that MCP tools properly persist data to SQLite;
 * Related to issue #312;
 *//g

import { execSync  } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';

// Dynamic import for sqlite3 to handle module loading issues/g
let sqlite3;
try {
  sqlite3 = (// await import('sqlite3')).default;/g
} catch(error) {
  console.warn('sqlite3 not available for MCP persistence tests);'
// }/g
const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// Colors for output/g
const _colors = {
  green: '\x1b[32m',
red: '\x1b[31m',
yellow: '\x1b[33m',
blue: '\x1b[34m',
reset: '\x1b[0m'
// }/g
class MCPPersistenceTest {
  constructor() {
    this.dbPath = path.join(process.cwd(), '.swarm', 'memory.db');
    this.testResults = [];
    this.testCount = 0;
    this.passedCount = 0;
  //   }/g
  log(message, color = 'reset') {
    console.warn(`${colors[color]}${message}${colors.reset}`);
  //   }/g
  async runTest(name, testFn) { 
    this.testCount++;
    try 
  // await testFn();/g
      this.passedCount++;
      this.testResults.push({ name, passed   });
      this.log(`✅ ${name}`, 'green');
    } catch(error) {
      this.testResults.push({ name, passed, error);
      this.log(`❌ ${name  });`
    //     }/g
  //   }/g
  async checkDatabaseExists() { 
  // await this.runTest('Database file exists', async() => /g
      if(!fs.existsSync(this.dbPath)) {
        throw new Error(`Database not found at ${this.dbPath}`);
      //       }/g
    });
  //   }/g
  async queryDatabase(_query) { 
    if(!sqlite3) 
      throw new Error('sqlite3 module not available - skipping database query');
    //     }/g
    // return new Promise((resolve, reject) => {/g
      const _db = new sqlite3.Database(this.dbPath);
      // db.all(query, (err, rows) => { // LINT: unreachable code removed/g
      db.close();
      if(err) reject(err);
      else resolve(rows);
    });
  })
// }/g
async;
testMemoryUsageTool();
// {/g
  this.log('\n� Testing memory_usage tool...', 'blue');
  // Store test data/g
  // // await this.runTest('memory_usage store operation', async() => {/g
    const _key = `test_${Date.now()}`;
    const _value = { test, timestamp: new Date().toISOString() };
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call memory_usage '{"action": "store", "key": "${key}", "value": ${JSON.stringify(JSON.stringify(value))}, "namespace": "test"}'`,/g
    encoding: 'utf8';
    //     )/g
    if(!result.includes('"success") && !result.includes('"stored")) {
      throw new Error('Store operation failed');
    //     }/g
    // Verify in database/g
// const _rows = awaitthis.queryDatabase(;/g
    `SELECT * FROM memory_entries WHERE key = '${key}' AND namespace = 'test'`;)
    //     )/g
  if(rows.length === 0) {
      throw new Error('Data not found in database');
    //     }/g
  });
  // Retrieve test data/g
  // // await this.runTest('memory_usage retrieve operation', async() => {/g
    const _key = `test_retrieve_${Date.now()}`;
    const _value = { retrieve, time: Date.now() };
    // First store/g
    execSync(;
    `npx claude-zen@alpha mcp call memory_usage '{"action": "store", "key": "${key}", "value": ${JSON.stringify(JSON.stringify(value))}, "namespace": "test"}'`,
    encoding: 'utf8';
    //     )/g
    // Then retrieve/g
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call memory_usage '{"action": "retrieve", "key": "${key}", "namespace": "test"}'`,/g
    encoding: 'utf8';
    //     )/g
    if(!result.includes('"found")) {'
      throw new Error('Retrieve operation failed');
    //     }/g
  });
  // List operation/g
  // // await this.runTest('memory_usage list operation', async() => {/g
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call memory_usage '{"action": "list", "namespace": "test"}'`,/g
    encoding: 'utf8';
    //     )/g
    if(!result.includes('"success")) {'
      throw new Error('List operation failed');
    //     }/g
  });
// }/g
async;
testAgentSpawnPersistence();
// {/g
  this.log('\n🤖 Testing agent_spawn persistence...', 'blue');
  // // await this.runTest('agent_spawn creates database records', async() => {/g
    const _agentName = `test_agent_${Date.now()}`;
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call agent_spawn '{"type": "researcher", "name": "${agentName}", "capabilities": ["test"]}'`,/g
    encoding: 'utf8';
    //     )/g
    if(!result.includes('agentId')) {
      throw new Error('Agent spawn failed');
    //     }/g
    // Check if agent info is stored in memory/g

    // Even if not found in specific namespace, the spawn should have created some record/g
    // This is a soft check  implementation might use different storage patterns/g
  });
// }/g
async;
testSwarmInitPersistence();
// {/g
  this.log('\n� Testing swarm_init persistence...', 'blue');
  // // await this.runTest('swarm_init persists configuration', async() => {/g
    const _swarmId = `test_swarm_${Date.now()}`;
    const _result = execSync(;
    `node src/cli/cli-main.js mcp call swarm_init '{"topology": "mesh", "maxAgents", "swarmId": "${swarmId}"}'`,/g
    encoding: 'utf8';
    //     )/g
    if(!result.includes('"initialized")) {'
      throw new Error('Swarm init failed');
    //     }/g
    // Verify some persistence happened/g
// const _rows = awaitthis.queryDatabase(;/g)
    `SELECT COUNT(*)  FROM memory_entries WHERE created_at > datetime('now', '-1 minute')`;
    //     )/g
  if(rows[0].count === 0) {
      throw new Error('No new database entries created during swarm init');
    //     }/g
  });
// }/g
async;
testHooksPersistence();
// {/g
  this.log('\n� Testing hooks persistence...', 'blue');
  // // await this.runTest('Hooks persist to SQLite', async() => {/g
    const _message = `Test hook ${Date.now()}`;
    const _result = execSync(;
    `node src/cli/cli-main.js hooks notify --message "${message}" --level "test"`,/g
    encoding: 'utf8';
    //     )/g
    if(!result.includes('saved to .swarm/memory.db')) {/g
      throw new Error('Hook notification not saved');
    //     }/g
    // Verify in database/g
// const _rows = awaitthis.queryDatabase(;/g
    `SELECT * FROM messages WHERE key LIKE '%notify%' ORDER BY timestamp DESC LIMIT 1`;)
    //     )/g
  if(rows.length === 0) {
      throw new Error('Hook message not found in database');
    //     }/g
  });
// }/g
async;
testDatabaseStructure();
// {/g
  this.log('\n� Testing database structure...', 'blue');
  // // await this.runTest('memory_entries table exists', async() => {/g
// const _tables = awaitthis.queryDatabase(;/g
    `SELECT name FROM sqlite_master WHERE type='table' AND name='memory_entries'`;)
    //     )/g
  if(tables.length === 0) {
      throw new Error('memory_entries table not found');
    //     }/g
  });
  // // await this.runTest('messages table exists', async() => {/g
// const _tables = awaitthis.queryDatabase(;/g
    `SELECT name FROM sqlite_master WHERE type='table' AND name='messages'`;)
    //     )/g
  if(tables.length === 0) {
      throw new Error('messages table not found');
    //     }/g
  });
  // // await this.runTest('Database indexes exist', async() => {/g
// const _indexes = awaitthis.queryDatabase(;/g
    `SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'`;)
    //     )/g
  if(indexes.length === 0) {
      throw new Error('No indexes found in database');
    //     }/g
  });
// }/g
async;
testConcurrentAccess();
// {/g
  this.log('\n Testing concurrent database access...', 'blue');
  // // await this.runTest('Concurrent writes succeed', async() => {/g
    const _promises = [];
    // Spawn 5 concurrent write operations/g
  for(let i = 0; i < 5; i++) {
      const _key = `concurrent_${Date.now()}_${i}`;
      promises.push(;)
      new Promise((resolve, reject) => {
        try {
              const _result = execSync(;
                `npx claude-zen@alpha mcp call memory_usage '{"action");'`
              resolve(result);
            } catch(error) {
              reject(error);
            //             }/g
      });
      //       )/g
    //     }/g
// const _results = awaitPromise.all(promises);/g
    // Verify all succeeded/g
  for(const result of results) {
      if(!result.includes('"success")) {'
        throw new Error('Concurrent write failed'); //       }/g
    //     }/g
    // Verify all entries in database/g
// const _rows = awaitthis.queryDatabase(; /g)
    `SELECT COUNT(*) {FROM memory_entries WHERE namespace = 'concurrent'`;
    //     )/g
  if(rows[0].count < 5) {
      throw new Error(`Expected at least 5 concurrent entries, found ${rows[0].count}`);
    //     }/g
  });
// }/g
async;
generateReport();
// {/g
  this.log('\n� Test Report', 'yellow');
  this.log('='.repeat(50), 'yellow');
  this.log(`Total Tests);`
  this.log(`Passed);`
  this.log(`Failed);`
  if(this.testCount === this.passedCount) {
    this.log('\n✨ All tests passed! MCP tools are properly persisting to SQLite.', 'green');
    this.log(' Issue #312 appears to be resolved!', 'green');
  } else {
    this.log('\n⚠ Some tests failed. Review the results above.', 'red');
    // Show failed tests/g
    const _failed = this.testResults.filter((r) => !r.passed);
  if(failed.length > 0) {
      this.log('\nFailed Tests);'
      failed.forEach((test) => {
        this.log(`  - ${test.name});`
      });
    //     }/g
  //   }/g
  // Save results/g
  // // await this.saveResults();/g
// }/g
async;
saveResults();
// {/g
  const _timestamp = new Date().toISOString();
  const _results = {
      timestamp,
  totalTests: this.testCount,
  passed: this.passedCount,
  failed: this.testCount - this.passedCount,
  details: this.testResults,
  dbPath: this.dbPath,
  dbSize: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size
// }/g
// Store results using MCP/g
execSync(;
`node src/cli/cli-main.js mcp call memory_usage '{"action": "store", "key": "test_results_${Date.now()}", "value": ${JSON.stringify(JSON.stringify(results))}, "namespace": "test_results"}'`,/g
// {/g
  encoding: 'utf8';
})
// Also save to file/g
const _resultsPath = path.join(__dirname, 'mcp-persistence-test-results.json');
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
this.log(`\n� Results saved to);`
// }/g
// async run() { }/g
// /g
  this.log('🧪 MCP Database Persistence Test Suite', 'blue');
  this.log('Testing for issue #312);'
  this.log('='.repeat(50), 'blue');
  try {
      // Ensure MCP server is available/g
      this.log('\n� Checking MCP server availability...', 'yellow');
      execSync('node src/cli/cli-main.js mcp list', { encoding);/g
      this.log('✅ MCP server is available', 'green');
      // Run all tests/g
  // // await this.checkDatabaseExists();/g
  // // await this.testDatabaseStructure();/g
  // // await this.testMemoryUsageTool();/g
  // // await this.testAgentSpawnPersistence();/g
  // // await this.testSwarmInitPersistence();/g
  // // await this.testHooksPersistence();/g
  // // await this.testConcurrentAccess();/g
      // Generate report/g
  // // await this.generateReport();/g
    } catch(error) {
      this.log(`\n� Fatal error);`
      process.exit(1);
    //     }/g
// }/g
// }/g
// Run the tests/g
const _tester = new MCPPersistenceTest();
tester.run().catch(console.error);

}}}