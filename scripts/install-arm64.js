#!/usr/bin/env node

import { spawn } from 'node:child_process';
import os from 'node:os';

// Check if SQLite bindings are working
async function checkSqliteBindings() {
  try {
    const Database = await import('better-sqlite3');
    const db = new Database.default(':memory:');
    db.close();
    return true;
  } catch (_error) {
    return false;
  }
}

// Attempt to rebuild better-sqlite3 for ARM64
async function rebuildSqlite() {
  return new Promise((resolve) => {
    const rebuild = spawn('npm', ['rebuild', 'better-sqlite3'], {
      stdio: 'inherit',
    });

    rebuild.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        console.error('Failed to rebuild better-sqlite3');
        resolve(false);
      }
    });

    rebuild.on('error', () => {
      console.error('Failed to rebuild better-sqlite3');
      resolve(false);
    });
  });
}

// Main installation logic
async function main() {
  const platform = os.platform();
  const arch = os.arch();

  // Only run on ARM64 macOS
  if (platform === 'darwin' && arch === 'arm64') {
    const bindingsWork = await checkSqliteBindings();
    if (!bindingsWork) {
      const rebuildSuccess = await rebuildSqlite();
      if (!rebuildSuccess) {
      }
    } else {
    }
  }
}

// Run the installation enhancement
main().catch(console.error);
