#!/usr/bin/env node

/**
 * Claude Code Zen - Final Working Binary Distribution
 * Uses dynamic import to handle top-level await in NCC bundle
 */

const { join } = require('path');
const { spawn } = require('child_process');
const { existsSync } = require('fs');

const binDir = __dirname;
const bundleDir = join(binDir, 'bundle');
const mainScript = join(bundleDir, 'index.js');

// Pass all arguments to the main script  
const args = process.argv.slice(2);

// Ensure bundle directory exists
if (!existsSync(bundleDir)) {
  console.error('❌ Bundle directory not found. Please run: npm run binary:build');
  process.exit(1);
}

// Set environment variables for WASM modules
process.env.CLAUDE_ZEN_BUNDLE_MODE = 'true';
process.env.CLAUDE_ZEN_WASM_PATH = bundleDir;

// Create an eval script that dynamically imports the bundle
const evalScript = `
  // Change process.argv to include our args
  process.argv = ['node', '${mainScript}', ...${JSON.stringify(args)}];
  
  // Change cwd to bundle dir to help with module resolution
  process.chdir('${bundleDir}');
  
  // Dynamically import the bundle (handles top-level await)
  import('${mainScript}')
    .then(() => {
      console.log('✅ Claude Code Zen loaded successfully');
    })
    .catch(err => {
      console.error('❌ Failed to load Claude Code Zen:', err.message);
      process.exit(1);
    });
`;

console.log('🚀 Starting Claude Code Zen (Final Build)...');

// Launch with eval script in ES module mode
const child = spawn('node', ['--input-type=module', '--eval', evalScript], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('❌ Failed to start Claude Code Zen:', error.message);
  process.exit(1);
});