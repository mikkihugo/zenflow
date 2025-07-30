#!/usr/bin/env node;

/** Simple MCP Persistence Verification Script;
/** Verifies that MCP tools persist data without requiring sqlite3 module;

import { execSync  } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const _colors = {
  green: '\x1b[32m',
red: '\x1b[31m',
yellow: '\x1b[33m',
blue: '\x1b[34m',
reset: '\x1b[0m'
// }
function log() {
  console.warn(`${colors[color]}${message}${colors.reset}`);
// }
async function runTest() {
  log(' MCP Persistence Verification', 'blue');
  log('Testing issue #312);'
  const _dbPath = path.join(process.cwd(), '.swarm', 'memory.db');
  const _testsPassed = 0;
  const _testsTotal = 0;
  // Test 1: Check if database exists
  testsTotal++;
  log('1 Checking if SQLite database exists...', 'yellow');
  if(fs.existsSync(dbPath)) {
    log(` Database found at);`
    log(`   Size: ${fs.statSync(dbPath).size} bytes`, 'green');
    testsPassed++;
  } else {
    log(` Database not found at);`
// }
  // Test 2: Store data using memory_usage
  testsTotal++;
  log('\n2 Testing memory_usage store operation...', 'yellow');
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
      log(' Store operation succeeded', 'green');
      testsPassed++;
      // Store the key for later retrieval
      fs.writeFileSync('.test-key', testKey);
    } else {
      log(' Store operation failed', 'red');
      log(`   Response);`
// }
// }
catch(error)
// {
  log(` Store operation error);`
// }
// Test 3: Retrieve the stored data
testsTotal++;
log('\n3 Testing memory_usage retrieve operation...', 'yellow');
try {
    const _testKey = fs.existsSync('.test-key');
      ? fs.readFileSync('.test-key', 'utf8');
      : `verify_test_\$Date.now()`;
    const _retrieveResult = execSync(;
      `npx claude-zen@alpha mcp call memory_usage '{"action");'`
    if(retrieveResult.includes('"found")) {'
      log(' Retrieve operation succeeded - data w!', 'green');
      testsPassed++;
    } else {
      log(' Retrieve operation failed - data not found', 'red');
      log(`   Response);`
// }
  } catch(error) {
    log(` Retrieve operation error);`
// }
// Test 4: List stored entries
testsTotal++;
log('\n4 Testing memory_usage list operation...', 'yellow');
try {
    const _listResult = execSync(;
      `npx claude-zen@alpha mcp call memory_usage '{"action");'`
    if(listResult.includes('"success")) {'
      log(' List operation succeeded', 'green');
      testsPassed++;
      // Try to parse and show entry count
      try {
        const _parsed = JSON.parse(listResult);
        if(parsed.entries && Array.isArray(parsed.entries)) {
          log(`   Found \$parsed.entries.lengthentries in namespace "verification"`, 'green');
// }
      } catch(/* _e */) {
        // Ignore parse errors
// }
    } else {
      log(' List operation failed', 'red');
// }
  } catch(error) {
    log(` List operation error);`
// }
// Test 5: Test hooks persistence
testsTotal++;
log('\n5 Testing hooks notification persistence...', 'yellow');
try {
    const _message = `Persistence test \$Date.now()`;
    const _hookResult = execSync(;
      `npx claude-zen@alpha hooks notify --message "${message}" --level "test"`,encoding);
    if(hookResult.includes('saved to .swarm/memory.db')) {
      log(' Hook notification persisted to database', 'green');
      testsPassed++;
    } else {
      log(' Hook notification not persisted', 'red');
// }
  } catch(error) {
    log(` Hook notification error);`
// }
// Test 6: Database size check(should grow after operations)
testsTotal++;
log('\n6 Checking if database size increased...', 'yellow');
if(fs.existsSync(dbPath)) {
  const _newSize = fs.statSync(dbPath).size;
  log(` Database size);`
  if(newSize > 0) {
    testsPassed++;
// }
} else {
  log(' Database still not found', 'red');
// }
// Summary
log(`\n\$'='.repeat(50)`, 'yellow');
log(;
` Test Summary: $testsPassed/${testsTotal} passed`,
testsPassed === testsTotal ? 'green' : 'yellow';
// )
  if(testsPassed === testsTotal) {
  log('\n All tests passed!', 'green');
  log(' MCP tools are properly persisting data to SQLite', 'green');
  log(' Issue #312 appears to be resolved!', 'green');
} else if(testsPassed > testsTotal / 2) {
  log('\n Partial success - some persistence is working', 'yellow');
  log('Check the failed tests above for details', 'yellow');
} else {
  log('\n Most tests failed - persistence may not be working', 'red');
  log('Issue #312 may not be fully resolved', 'red');
// }
// Cleanup
if(fs.existsSync('.test-key')) {
  fs.unlinkSync('.test-key');
// }
// }
// Run the test
runTest().catch((error) =>
// {
  log(`\n Fatal error);`
  process.exit(1);
})
}}
