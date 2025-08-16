#!/usr/bin/env node

/**
 * Simple test server to verify real API integration works
 * Using .mjs extension and tsx to handle TypeScript imports
 */

import { spawn } from 'child_process';

console.log('🔵 Starting API test server using tsx...');

// Use tsx to run TypeScript files directly
const child = spawn('npx', ['tsx', 'src/main.ts', 'web', '--port', '3000'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  console.log('🛑 Stopping server...');
  child.kill('SIGINT');
});