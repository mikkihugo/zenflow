#!/usr/bin/env node

/**
 * Claude Code Zen - Cross-platform AI Development Platform  
 * Simple launcher that bypasses module system issues
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

// Remove type declaration temporarily and run bundle directly
const fs = require('fs');
const pkgPath = join(bundleDir, 'package.json');
const originalPkg = fs.readFileSync(pkgPath, 'utf8');
fs.writeFileSync(pkgPath, '{}');

// Launch the main application 
const child = spawn('node', [mainScript, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env }
});

child.on('exit', (code) => {
  // Restore package.json
  fs.writeFileSync(pkgPath, originalPkg);
  process.exit(code || 0);
});

child.on('error', (error) => {
  // Restore package.json on error
  fs.writeFileSync(pkgPath, originalPkg);
  console.error('❌ Failed to start Claude Code Zen:', error.message);
  process.exit(1);
});