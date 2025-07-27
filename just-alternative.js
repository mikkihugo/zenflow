#!/usr/bin/env node

/**
 * just-alternative.js - Alternative to `just` command runner for Claude Code Zen
 * 
 * This script provides similar functionality to `just` when the tool cannot be installed.
 * Usage: node just-alternative.js [command]
 * Example: node just-alternative.js lint
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const justfile = path.join(process.cwd(), 'justfile');

// Parse commands from justfile
const commands = new Map();

try {
  const content = readFileSync(justfile, 'utf8');
  const lines = content.split('\n');
  let currentCommand = null;
  let currentDescription = '';
  
  for (const line of lines) {
    if (line.startsWith('#') && !line.startsWith('#!/')) {
      currentDescription = line.substring(1).trim();
    } else if (line.match(/^[\w-]+:/)) {
      const commandName = line.split(':')[0].trim();
      if (commandName !== 'default') {
        commands.set(commandName, {
          description: currentDescription,
          script: []
        });
        currentCommand = commandName;
        currentDescription = '';
      }
    } else if (currentCommand && (line.trim().startsWith('npm run') || line.trim().startsWith('npx') || line.trim().startsWith('@'))) {
      const script = line.trim().startsWith('@') ? line.trim().substring(1) : line.trim();
      if (commands.has(currentCommand)) {
        commands.get(currentCommand).script.push(script);
      }
    }
  }
} catch (error) {
  console.error('Error reading justfile:', error.message);
  process.exit(1);
}

const args = process.argv.slice(2);
const command = args[0] || 'default';

if (command === 'default' || command === '--list') {
  console.log('Available commands:');
  for (const [name, info] of commands) {
    console.log(`  ${name.padEnd(20)} ${info.description}`);
  }
  process.exit(0);
}

if (!commands.has(command)) {
  console.error(`Unknown command: ${command}`);
  console.log('\nAvailable commands:');
  for (const [name, info] of commands) {
    console.log(`  ${name.padEnd(20)} ${info.description}`);
  }
  process.exit(1);
}

// Execute the command
const commandInfo = commands.get(command);
console.log(`Running: ${command}`);

try {
  for (const script of commandInfo.script) {
    console.log(`> ${script}`);
    execSync(script, { stdio: 'inherit', cwd: process.cwd() });
  }
} catch (error) {
  console.error(`Command failed: ${error.message}`);
  process.exit(1);
}