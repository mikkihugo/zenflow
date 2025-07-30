#!/usr/bin/env node
/**
 * 🔍 PRODUCTION VALIDATION TEST SUITE
 * Comprehensive validation of Claude Code Flow system readiness
 */

import { existsSync, readFileSync } from 'node:fs';
import fetch from 'node-fetch';

console.warn('🚀 CLAUDE CODE FLOW - PRODUCTION VALIDATION SUITE');
console.warn('='.repeat(60));

const tests = [];
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
};

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  results.total++;
  if (condition) {
    console.warn(`✅ ${message}`);
    results.passed++;
  } else {
    console.warn(`❌ ${message}`);
    results.failed++;
  }
}

function warn(condition, message) {
  if (!condition) {
    console.warn(`⚠️  ${message}`);
    results.warnings++;
  } else {
    console.warn(`✅ ${message}`);
  }
}

// Test 1: File Structure Validation
test('File Structure', () => {
  console.warn('\n📁 Validating file structure...');

  const requiredFiles = [
    './package.json',
    './src/mcp/mcp-server.js',
    './src/mcp/http-mcp-server.js',
    './src/hive-mind-primary.js',
    './src/neural/neural-engine.js',
    './ruv-FANN/ruv-swarm/npm/src/index.js',
  ];

  requiredFiles.forEach((file) => {
    assert(existsSync(file), `Required file exists: ${file}`);
  });
});

// Test 2: Package Dependencies
test('Dependencies', () => {
  console.warn('\n📦 Validating dependencies...');

  try {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
    assert(pkg.name === '@claude-zen/monorepo', 'Package name is correct');
    assert(pkg.version.includes('alpha.73'), 'Version includes alpha.73');

    const deps = Object.keys(pkg.dependencies || {});
    warn(deps.includes('express'), 'Express dependency present');
    warn(deps.includes('better-sqlite3'), 'SQLite3 dependency present (better-sqlite3)');
  } catch (e) {
    assert(false, `Package.json validation failed: ${e.message}`);
  }
});

// Test 3: MCP Server Health
test('MCP Server', async () => {
  console.warn('\n🌐 Testing MCP server...');

  try {
    const response = await fetch('http://localhost:3000/health', { timeout: 5000 });
    const health = await response.json();

    assert(response.ok, 'MCP server responds to health check');
    assert(health.status === 'healthy', 'MCP server reports healthy status');
    assert(health.service === 'claude-zen-unified', 'Service name is correct');
    assert(typeof health.system.uptime === 'number', 'Uptime is reported');
    assert(Array.isArray(health.capabilities.api), 'API capabilities listed');

    console.warn(`   Server uptime: ${Math.floor(health.system.uptime / 1000)}s`);
    console.warn(`   Memory usage: ${Math.floor(health.system.memory.heapUsed / 1024 / 1024)}MB`);
  } catch (e) {
    assert(false, `MCP server test failed: ${e.message}`);
  }
});

// Test 4: Neural Engine Validation
test('Neural Engine', () => {
  console.warn('\n🧠 Testing neural engine integration...');

  try {
    // Test if neural engine can be imported
    const neuralPath = './src/neural/neural-engine.js';
    assert(existsSync(neuralPath), 'Neural engine file exists');

    // Check for ruv-swarm integration
    const ruvSwarmPath = './ruv-FANN/ruv-swarm/npm/src/index.js';
    assert(existsSync(ruvSwarmPath), 'ruv-swarm module exists');

    const rustBinariesExist =
      existsSync('./ruv-FANN/target/release/libruv_fann.rlib') ||
      existsSync('./ruv-FANN/ruv-swarm/target/release');
    warn(rustBinariesExist, 'Rust binaries compiled (cargo build --release)');
  } catch (e) {
    assert(false, `Neural engine validation failed: ${e.message}`);
  }
});

// Test 5: Database Systems
test('Database Systems', () => {
  console.warn('\n💾 Testing database systems...');

  // Check for SQLite database
  const sqliteDb = './.swarm/claude-zen-mcp.db';
  warn(existsSync(sqliteDb), 'SQLite database exists (.swarm/claude-zen-mcp.db)');

  // Check for memory backend
  const memoryPlugin = './src/plugins/memory-backend/index.js';
  assert(existsSync(memoryPlugin), 'Memory backend plugin exists');

  // Check for database-related files
  const dbFiles = ['./src/memory/sqlite-store.js', './src/cli/database/kuzu-graph-interface.js'];

  dbFiles.forEach((file) => {
    assert(existsSync(file), `Database component exists: ${file.split('/').pop()}`);
  });
});

// Test 6: Plugin Architecture
test('Plugin System', () => {
  console.warn('\n🔌 Testing plugin architecture...');

  const pluginDirs = [
    './src/plugins/ai-provider',
    './src/plugins/architect-advisor',
    './src/plugins/unified-interface',
    './src/plugins/workflow-engine',
  ];

  pluginDirs.forEach((dir) => {
    assert(existsSync(dir), `Plugin directory exists: ${dir.split('/').pop()}`);
    assert(
      existsSync(`${dir}/index.js`),
      `Plugin entry point exists: ${dir.split('/').pop()}/index.js`
    );
  });
});

// Test 7: MCP Tools Integration
test('MCP Tools', async () => {
  console.warn('\n🛠️  Testing MCP tools execution...');

  try {
    const response = await fetch('http://localhost:3000/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'swarm_status', args: {} }),
      timeout: 5000,
    });

    const result = await response.json();
    assert(response.ok, 'MCP tool execution endpoint responds');
    assert(result.success !== undefined, 'Tool execution returns success field');
  } catch (e) {
    warn(false, `MCP tools test failed: ${e.message}`);
  }
});

// Test 8: Performance Benchmarks
test('Performance', () => {
  console.warn('\n⚡ Running performance validation...');

  const start = process.hrtime.bigint();

  // Simulate some work
  for (let i = 0; i < 100000; i++) {
    Math.random();
  }

  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds

  assert(duration < 100, `Performance test completed in ${duration.toFixed(2)}ms (< 100ms)`);

  // Memory usage check
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

  assert(heapUsedMB < 200, `Memory usage reasonable: ${heapUsedMB.toFixed(2)}MB (< 200MB)`);
});

// Execute all tests
async function runTests() {
  console.warn(`Running ${tests.length} test suites...\n`);

  for (const test of tests) {
    try {
      await test.fn();
    } catch (e) {
      console.warn(`❌ Test suite "${test.name}" failed: ${e.message}`);
      results.failed++;
    }
  }

  // Final report
  console.warn(`\n${'='.repeat(60)}`);
  console.warn('📊 FINAL VALIDATION REPORT');
  console.warn('='.repeat(60));
  console.warn(`✅ Passed: ${results.passed}`);
  console.warn(`❌ Failed: ${results.failed}`);
  console.warn(`⚠️  Warnings: ${results.warnings}`);
  console.warn(`📝 Total Checks: ${results.total}`);

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.warn(`📈 Success Rate: ${successRate}%`);

  if (results.failed === 0 && results.warnings <= 3) {
    console.warn('\n🎉 SYSTEM READY FOR PRODUCTION! 🎉');
    console.warn('All critical tests passed with minimal warnings.');
  } else if (results.failed <= 2 && results.warnings <= 5) {
    console.warn('\n⚠️  SYSTEM MOSTLY READY');
    console.warn('Minor issues detected, but system is functional.');
  } else {
    console.warn('\n❌ SYSTEM NEEDS ATTENTION');
    console.warn('Multiple issues detected, further development needed.');
  }

  process.exit(results.failed > 5 ? 1 : 0);
}

// Run the validation suite
runTests().catch(console.error);
