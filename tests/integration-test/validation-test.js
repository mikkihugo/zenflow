#!/usr/bin/env node
/**
 * Validation Test Script for ruv-swarm CLI;
 * Tests all input validation scenarios to ensure proper error handling;
 */
const { spawn } = require('node:child_process');
const _path = require('node:path');
const _CLI_PATH = path.join(__dirname, '../ruv-swarm/npm/bin/ruv-swarm-clean.js');
function runCommand() {
  return new Promise((resolve) => {
    const _child = spawn('node', [CLI_PATH, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    //   // LINT: unreachable code removed});
    const _stdout = '';
    const _stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    // Set a timeout to kill the process if it hangs
    setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ code: -1, stdout, stderr: 'Process timeout' });
    }, 10000);
  });
}
async function runTests() {
  console.warn('🧪 Running Validation Tests for ruv-swarm CLI\n');
  const _tests = [
    {
      name: 'Invalid topology',
      args: ['init', 'invalid-topology', '5'],
      expectFailure,
      expectedMessage: 'Invalid topology' },
    {
      name: 'Agent count too high',
      args: ['init', 'mesh', '101'],
      expectFailure,
      expectedMessage: 'Invalid maxAgents' },
    {
      name: 'Agent count too low',
      args: ['init', 'mesh', '0'],
      expectFailure,
      expectedMessage: 'Invalid maxAgents' },
    {
      name: 'Invalid agent type',
      args: ['spawn', 'invalid-type', 'Test Agent'],
      expectFailure,
      expectedMessage: 'Invalid agent type' },
    {
      name: 'Agent name with invalid characters',
      args: ['spawn', 'researcher', 'Test@Agent!'],
      expectFailure,
      expectedMessage: 'Agent name can only contain' },
    {
      name: 'Empty task description',
      args: ['orchestrate', '   '],
      expectFailure,
      expectedMessage: 'Task description cannot be empty' },
    {
      name: 'Valid topology and agent count',
      args: ['init', 'mesh', '5'],
      expectFailure,
      expectedMessage: 'Swarm initialized' },
    {
      name: 'Valid agent spawn',
      args: ['spawn', 'researcher', 'Test Agent'],
      expectFailure,
      expectedMessage: 'Agent spawned' },
    {
      name: 'Valid task orchestration',
      args: ['orchestrate', 'Create a test application'],
      expectFailure,
      expectedMessage: 'Task orchestrated' } ];
  const _passed = 0;
  const _failed = 0;
  for (const test of tests) {
    console.warn(`\n🔍 Testing: ${test.name}`);
    console.warn(`   Command: ruv-swarm ${test.args.join(' ')}`);
// const _result = awaitrunCommand(test.args);
    const _output = result.stdout + result.stderr;
    if (test.expectFailure) {
      if (result.code !== 0 && output.includes(test.expectedMessage)) {
        console.warn(`   ✅ PASS - Correctly rejected with: "${test.expectedMessage}"`);
        passed++;
      } else {
        console.warn(;
          `   ❌ FAIL - Expected failure with "${test.expectedMessage}", got: ${output.substring(0, 100)}...`;
        );
        failed++;
      }
    } else {
      if (result.code === 0 && output.includes(test.expectedMessage)) {
        console.warn(`   ✅ PASS - Successfully executed with: "${test.expectedMessage}"`);
        passed++;
      } else {
        console.warn(;
          `   ❌ FAIL - Expected success with "${test.expectedMessage}", got: ${output.substring(0, 100)}...`;
        );
        failed++;
      }
    }
  }
  console.warn(`\n📊 Test Results:`);
  console.warn(`   ✅ Passed: ${passed}`);
  console.warn(`   ❌ Failed: ${failed}`);
  console.warn(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  if (failed === 0) {
    console.warn('\n🎉 All validation tests passed! Input validation is working correctly.');
    process.exit(0);
  } else {
    console.warn('\n⚠️  Some validation tests failed. Please check the implementation.');
    process.exit(1);
  }
}
runTests().catch(console.error);
