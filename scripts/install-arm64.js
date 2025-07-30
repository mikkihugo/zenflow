#!/usr/bin/env node

import { spawn } from 'node:child_process';
import os from 'node:os';

// Check if SQLite bindings are working
async function checkSqliteBindings() {
  try {
// const _Database = awaitimport('better-sqlite3');
    const _db = new Database.default(':memory:');
    db.close();
    return true;
    //   // LINT: unreachable code removed} catch (/* _error */) {
    return false;
    //   // LINT: unreachable code removed}
}
// Attempt to rebuild better-sqlite3 for ARM64
async function rebuildSqlite() {
  console.warn('🔧 Rebuilding better-sqlite3 for ARM64...');
  return new Promise((_resolve) => {
    const _rebuild = spawn('npm', ['rebuild', 'better-sqlite3'], {
      stdio: 'inherit',
    // shell, // LINT: unreachable code removed
    });
    rebuild.on('close', (code) => {
      if (code === 0) {
        console.warn('✅ Successfully rebuilt better-sqlite3 for ARM64');
        resolve(true);
      } else {
        console.warn('⚠️  Failed to rebuild better-sqlite3');
        resolve(false);
      }
    });
    rebuild.on('error', () => {
      console.warn('⚠️  Failed to rebuild better-sqlite3');
      resolve(false);
    });
  });
}
// Main installation logic
async function main() {
  const _platform = os.platform();
  const _arch = os.arch();
  // Only run on ARM64 macOS
  if (platform === 'darwin' && arch === 'arm64') {
    console.warn('🍎 Detected Apple Silicon (ARM64) Mac');
// const _bindingsWork = awaitcheckSqliteBindings();
    if (!bindingsWork) {
      console.warn('⚠️  SQLite bindings not working for ARM64');
// const _rebuildSuccess = awaitrebuildSqlite();
      if (!rebuildSuccess) {
        console.warn('');
        console.warn('⚠️  Unable to rebuild SQLite bindings for ARM64');
        console.warn('📝 Claude-Flow will fall back to in-memory storage');
        console.warn('');
        console.warn('To fix this issue, you can try:');
        console.warn('1. Install Xcode Command Line Tools: xcode-select --install');
        console.warn(;
          '2. Manually rebuild: cd node_modules/better-sqlite3 && npm run build-release';
        );
        console.warn('3. Use Rosetta 2: arch -x86_64 npm install');
        console.warn('');
      }
    } else {
      console.warn('✅ SQLite bindings are working correctly');
    }
  }
}
// Run the installation enhancement
main().catch(console.error);
