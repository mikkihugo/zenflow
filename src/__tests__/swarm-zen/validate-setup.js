#!/usr/bin/env node

/**
 * Test Setup Validation Script
 * Ensures all test dependencies and files are properly configured
 */

import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks = [];
let _passed = 0;
let failed = 0;

function check(name, condition, error = null) {
  if (condition) {
    _passed++;
  } else {
    if (error) {
    }
    failed++;
  }
  checks.push({ name, passed: condition, error });
}
const testFiles = [
  'mcp-integration.test.js',
  'persistence.test.js',
  'neural-integration.test.js',
  'run-all-tests.js',
  'test.js',
  'README.md',
];

testFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  check(`  ${file}`, fs.existsSync(filePath), `File not found: ${filePath}`);
});
const examplePath = path.join(__dirname, '..', 'examples', 'mcp-workflows.js');
check(
  '  mcp-workflows.js',
  fs.existsSync(examplePath),
  `File not found: ${examplePath}`
);
try {
  const packageJson = require('../package.json');
  const requiredDeps = ['ws', 'uuid', 'better-sqlite3'];

  requiredDeps.forEach((dep) => {
    check(
      `  ${dep}`,
      packageJson.dependencies[dep] || packageJson.devDependencies[dep],
      'Missing dependency in package.json'
    );
  });
} catch (error) {
  check('  package.json', false, error.message);
}
const nodeVersion = process.version;
const majorVersion = Number.parseInt(
  nodeVersion.split('.')[0].substring(1),
  10
);
check(
  `  Node.js version (${nodeVersion})`,
  majorVersion >= 14,
  'Node.js 14+ required'
);
const modules = ['ws', 'uuid', 'sqlite3'];
modules.forEach((mod) => {
  try {
    require(mod);
    check(`  ${mod}`, true);
  } catch (_error) {
    check(`  ${mod}`, false, 'Module not installed. Run: npm install');
  }
});
const mcpServerPath = path.join(
  __dirname,
  '..',
  '..',
  'crates',
  'ruv-swarm-mcp',
  'Cargo.toml'
);
check(
  '  MCP server crate',
  fs.existsSync(mcpServerPath),
  'MCP server crate not found'
);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
