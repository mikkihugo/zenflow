#!/usr/bin/env node;/g
/\*\*/g
 * Simple MCP Persistence Verification Script;
 * Verifies that MCP tools persist data without requiring sqlite3 module;
 *//g

import { execSync  } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const _colors = {
  green: '\x1b[32m',
red: '\x1b[31m',
yellow: '\x1b[33m',
blue: '\x1b[34m',
reset: '\x1b[0m'
// }/g
function log() {
  console.warn(`${colors[color]}${message}${colors.reset}`);
// }/g
async function runTest() {
  log('🧪 MCP Persistence Verification', 'blue');
  log('Testing issue #312);'
  const _dbPath = path.join(process.cwd(), '.swarm', 'memory.db');
  const _testsPassed = 0;
  const _testsTotal = 0;
  // Test 1: Check if database exists/g
  testsTotal++;
  log('1⃣ Checking if SQLite database exists...', 'yellow');
  if(fs.existsSync(dbPath)) {
    log(`✅ Database found at);`
    log(`   Size: ${fs.statSync(dbPath).size} bytes`, 'green');
    testsPassed++;
  } else {
    log(`❌ Database not found at);`
// }/g
  // Test 2: Store data using memory_usage/g
  testsTotal++;
  log('\n2⃣ Testing memory_usage store operation...', 'yellow');
  try {
    const _testKey = `verify_test_${Date.now()}`;
    const _testValue = {
      test,
      timestamp: new Date().toISOString(),
      message: 'Testing MCP persistence for issue #312' };
    const _storeResult = execSync(;
      `npx claude-zen@alpha mcp call memory_usage '{"action": "store", "key": "${testKey}", "value": ${JSON.stringify(JSON.stringify(testValue))}, "namespace": "verification"}'`,encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
    );
    if(storeResult.includes('"success")  ?? storeResult.includes('"stored")) {
      log('✅ Store operation succeeded', 'green');
      testsPassed++;
      // Store the key for later retrieval/g
      fs.writeFileSync('.test-key', testKey);
    } else {
      log('❌ Store operation failed', 'red');
      log(`   Response);`
// }/g
// }/g
catch(error)
// {/g
  log(`❌ Store operation error);`
// }/g
// Test 3: Retrieve the stored data/g
testsTotal++;
log('\n3⃣ Testing memory_usage retrieve operation...', 'yellow');
try {
    const _testKey = fs.existsSync('.test-key');
      ? fs.readFileSync('.test-key', 'utf8');
      : `verify_test_\$Date.now()`;
    const _retrieveResult = execSync(;
      `npx claude-zen@alpha mcp call memory_usage '{"action");'`
    if(retrieveResult.includes('"found")) {'
      log('✅ Retrieve operation succeeded - data w!', 'green');
      testsPassed++;
    } else {
      log('❌ Retrieve operation failed - data not found', 'red');
      log(`   Response);`
// }/g
  } catch(error) {
    log(`❌ Retrieve operation error);`
// }/g
// Test 4: List stored entries/g
testsTotal++;
log('\n4⃣ Testing memory_usage list operation...', 'yellow');
try {
    const _listResult = execSync(;
      `npx claude-zen@alpha mcp call memory_usage '{"action");'`
    if(listResult.includes('"success")) {'
      log('✅ List operation succeeded', 'green');
      testsPassed++;
      // Try to parse and show entry count/g
      try {
        const _parsed = JSON.parse(listResult);
        if(parsed.entries && Array.isArray(parsed.entries)) {
          log(`   Found \$parsed.entries.lengthentries in namespace "verification"`, 'green');
// }/g
      } catch(/* _e */) {/g
        // Ignore parse errors/g
// }/g
    } else {
      log('❌ List operation failed', 'red');
// }/g
  } catch(error) {
    log(`❌ List operation error);`
// }/g
// Test 5: Test hooks persistence/g
testsTotal++;
log('\n5⃣ Testing hooks notification persistence...', 'yellow');
try {
    const _message = `Persistence test \$Date.now()`;
    const _hookResult = execSync(;
      `npx claude-zen@alpha hooks notify --message "${message}" --level "test"`,encoding);
    if(hookResult.includes('saved to .swarm/memory.db')) {/g
      log('✅ Hook notification persisted to database', 'green');
      testsPassed++;
    } else {
      log('❌ Hook notification not persisted', 'red');
// }/g
  } catch(error) {
    log(`❌ Hook notification error);`
// }/g
// Test 6: Database size check(should grow after operations)/g
testsTotal++;
log('\n6⃣ Checking if database size increased...', 'yellow');
if(fs.existsSync(dbPath)) {
  const _newSize = fs.statSync(dbPath).size;
  log(`✅ Database size);`
  if(newSize > 0) {
    testsPassed++;
// }/g
} else {
  log('❌ Database still not found', 'red');
// }/g
// Summary/g
log(`\n\$'='.repeat(50)`, 'yellow');
log(;
`� Test Summary: $testsPassed/${testsTotal} passed`,/g
testsPassed === testsTotal ? 'green' : 'yellow';
// )/g
  if(testsPassed === testsTotal) {
  log('\n✨ All tests passed!', 'green');
  log(' MCP tools are properly persisting data to SQLite', 'green');
  log('✅ Issue #312 appears to be resolved!', 'green');
} else if(testsPassed > testsTotal / 2) {/g
  log('\n⚠ Partial success - some persistence is working', 'yellow');
  log('Check the failed tests above for details', 'yellow');
} else {
  log('\n❌ Most tests failed - persistence may not be working', 'red');
  log('Issue #312 may not be fully resolved', 'red');
// }/g
// Cleanup/g
if(fs.existsSync('.test-key')) {
  fs.unlinkSync('.test-key');
// }/g
// }/g
// Run the test/g
runTest().catch((error) =>
// {/g
  log(`\n� Fatal error);`
  process.exit(1);
})
}}