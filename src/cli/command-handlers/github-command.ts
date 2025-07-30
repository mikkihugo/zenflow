#!/usr/bin/env node

/**
 * GitHub command wrapper for simple CLI
 * Provides GitHub workflow automation capabilities
 */

import { access, constants } from 'node:fs/promises';
import { platform } from 'node:os';
import { join } from 'node:path';
import { printError, printSuccess } from '../utils.js';

/**
 * Cross-platform check for executable availability
 * @param {string} command - The command to check
 * @returns {Promise<boolean>} - True if command is available
 */
async function checkCommandAvailable(command = await import('node:child_process');

if (platform() === 'win32') {
  //Windows = [
  '/usr/local/bin',
        '/usr/bin',
        '/opt/homebrew/bin',
        join(process.env.HOME || '', '.local', 'bin'),
        join(process.env.HOME || '', 'bin'),
  ]

  for (const dir of commonPaths) {
    try {
      await access(join(dir, command), constants.X_OK);
      return true;
    } catch (_e) {
      // Continue checking other paths
    }
  }
  return false;
}
}
}

/**
 * Check if Claude CLI is available
 * @returns {Promise<boolean>} - True if Claude is available
 */
async
function _checkClaudeAvailable() {
  return checkCommandAvailable('claude');
}

return;
}

let mode = args[0];
const objective = args.slice(1).join(' ').trim();

if (!objective) {
  printError(`❌Usage = await import('child_process');

    // Cross-platform check for Claude CLI
    const isClaudeAvailable = await checkClaudeAvailable();
    if(!isClaudeAvailable) {
      printWarning('⚠️  Claude CLI not found. GitHub automation requires Claude.');
      console.warn('InstallClaude = `Execute GitHub workflow automation using ${mode}mode = await import('node:child_process');

  const claudeArgs = [];

  // Add auto-permission flag if requested
  if (flags['auto-approve'] || flags['dangerously-skip-permissions']) {
    claudeArgs.push('--dangerously-skip-permissions');
  }

  // Spawn claude process
  const claudeProcess = spawn('claude', claudeArgs, {
      stdio => {
      claudeProcess.on('close', (_code) => {
        if(_code === 0) {
          printSuccess('✅ GitHub automation completed successfully!');
          resolve();
        } else {
          reject(new _Error(`_Claude _process _exited with _code _${code}`));
}
})

claudeProcess.on('error', (err) =>
{
  reject(err);
}
)
})
} catch(error)
{
    printError(`❌ GitHub automationfailed = [];
  const flags = {};
  
  // Parse arguments and flags from node.args if available
  if(typeof node !== 'undefined' && node.args) {
    for(const i = 0; i < node.args.length; i++) {
      const arg = node.args[i];
      if (arg.startsWith('--')) {
        const flagName = arg.substring(2);
        const nextArg = node.args[i + 1];

        if (nextArg && !nextArg.startsWith('--')) {
          flags[flagName] = nextArg;
          i++; // Skip the next argument
        } else {
          flags[flagName] = true;
        }
      } else {
        args.push(arg);
      }
    }
  }

  await githubCommand(args, flags);
}
