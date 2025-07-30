#!/usr/bin/env node
// Simple wrapper for pkg compilation
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to cli-main.ts (TypeScript version)
const cliMain = join(__dirname, '..', 'src', 'cli', 'cli-main.ts');

// Run the CLI with tsx for TypeScript support
try {
  execSync(`npx tsx ${cliMain} ${process.argv.slice(2).join(' ')}`, {
    stdio: 'inherit'
  });
} catch {
  // Fallback to compiled JS version if tsx fails
  const cliMainJs = join(__dirname, '..', 'src', 'cli', 'cli-main.js');
  execSync(`node ${cliMainJs} ${process.argv.slice(2).join(' ')}`, {
    stdio: 'inherit'
  });
}