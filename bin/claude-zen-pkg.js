#!/usr/bin/env node
// Simple wrapper for pkg compilation
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to cli-main.js (updated from simple-cli.ts)
const cliMain = join(__dirname, '..', 'src', 'cli', 'cli-main.js');

// Run the CLI with node (updated from tsx since it's now a .js file)
execSync(`node ${cliMain} ${process.argv.slice(2).join(' ')}`, {
  stdio: 'inherit'
});