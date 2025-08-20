/**
 * Claude Code Zen - Binary Distribution Wrapper
 * Solves NCC ES/CJS module issues by running bundle with --input-type=module
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

// Launch with explicit ES module handling
const child = spawn('node', ['--input-type=module', '--eval', `
  // Import the NCC bundle as ES module
  import('${mainScript.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')
    .then(module => {
      // If it exports a default function, call it with args
      if (typeof module.default === 'function') {
        return module.default(...${JSON.stringify(args)});
      }
      // Otherwise just log success
      console.log('✅ Claude Code Zen loaded successfully');
    })
    .catch(err => {
      console.error('❌ Failed to load Claude Code Zen:', err.message);
      process.exit(1);
    });
`], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('❌ Failed to start Claude Code Zen wrapper:', error.message);
  process.exit(1);
});