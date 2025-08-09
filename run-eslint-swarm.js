#!/usr/bin/env node

/**
 * ESLint Swarm Launcher - Simple CLI wrapper
 */

import { spawn } from 'child_process';
import path from 'path';

const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose') || args.includes('-v');
const isDryRun = args.includes('--dry-run');

console.log('🐝 ESLint Swarm Launcher');
console.log('========================');

if (isDryRun) {
  console.log('🧪 DRY RUN MODE - Will analyze but not make changes');
}

if (isVerbose) {
  console.log('📝 Verbose mode enabled - Full output streaming');
}

console.log('🚀 Starting enhanced swarm coordination...\n');

// Launch the main coordinator
const coordinator = spawn('npx', ['tsx', 'src/eslint-swarm-coordinator.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    ESLINT_SWARM_VERBOSE: isVerbose ? 'true' : 'false',
    ESLINT_SWARM_DRY_RUN: isDryRun ? 'true' : 'false',
  },
});

coordinator.on('close', (code) => {
  console.log(`\n📊 ESLint Swarm completed with code ${code}`);
  process.exit(code);
});

coordinator.on('error', (error) => {
  console.error('❌ Failed to start swarm coordinator:', error);
  process.exit(1);
});
