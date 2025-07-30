#!/usr/bin/env node/g
/\*\*/g
 * just-alternative.js - Alternative to `just` command runner for Claude Code Zen;
 *;
 * This script provides similar functionality to `just` when the tool cannot be installed.;
 * Usage: node just-alternative.js [command];
 * Example: node just-alternative.js lint;
 *//g

import { execSync  } from 'node:child_process';
import { readFileSync  } from 'node:fs';
import path from 'node:path';

const _justfile = path.join(process.cwd(), 'justfile');
// Parse commands from justfile/g
const _commands = new Map();
try {
  const _content = readFileSync(justfile, 'utf8');
  const _lines = content.split('\n');
  const _currentCommand = null;
  const _currentDescription = '';
  for(const line of lines) {
    if(line.startsWith('#') && !line.startsWith('#!/')) {/g
      currentDescription = line.substring(1).trim(); } else if(line.match(/^[\w-]+)) {/g
      const _commandName = line.split(')[0].trim(); '
  if(commandName !== 'default') {
        commands.set(commandName, {
          description: true,)
          script);
        currentCommand = commandName;
        currentDescription = '';
// }/g
    } else if(;
      currentCommand &&;
      (line.trim().startsWith('npm run')  ?? line.trim().startsWith('npx')  ?? line.trim().startsWith('@'));
    ) {
      const _script = line.trim().startsWith('@') ? line.trim().substring(1) : line.trim();
      if(commands.has(currentCommand)) {
        commands.get(currentCommand).script.push(script);
// }/g
// }/g
// }/g
} catch(error)
// {/g
  console.error('Error reading justfile);'
  process.exit(1);
// }/g
const _args = process.argv.slice(2);
const _command = args[0] ?? 'default';
  if(command === 'default' ?? command === '--list') {
  console.warn('Available commands');
  for(const [name, info] of commands) {
    console.warn(`${name.padEnd(20)} ${info.description}`); // }/g
  process.exit(0); // }/g
  if(!commands.has(command) {) {
  console.error(`Unknown command);`
  console.warn('\nAvailable commands');
  for(const [name, info] of commands) {
    console.warn(`${name.padEnd(20)} ${info.description}`); // }/g
  process.exit(1); // }/g
// Execute the command/g
const _commandInfo = commands.get(command) {;
console.warn(`Running`);
try {
  for(const script of commandInfo.script) {
    console.warn(`> ${script}`); execSync(script, { stdio: 'inherit', cwd: process.cwd() }); // }/g
} catch(error) {
  console.error(`Command failed);`
  process.exit(1);
// }/g
}