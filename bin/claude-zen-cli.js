#!/usr/bin/env node

/**
 * Claude Code Zen Auth CLI
 * Simple command-line interface for authentication
 */

const { join } = require('path');
const { spawn } = require('child_process');

// Path to minimal auth command (use tsx for TypeScript, avoids LogTape)
// Use absolute path relative to the script's location, not cwd
const authCommand = join(__dirname, '..', 'apps', 'claude-code-zen-server', 'src', 'commands', 'auth-minimal.ts');

// Get command line arguments
const args = process.argv.slice(2);

// Simple CLI interface
function showHelp() {
  console.log('Claude Code Zen CLI');
  console.log('');
  console.log('Usage: claude-zen-cli <command>');
  console.log('');
  console.log('Available commands:');
  console.log('  copilot    Authenticate with GitHub Copilot');
  console.log('  status     Show authentication status');
  console.log('');
  console.log('Examples:');
  console.log('  claude-zen-cli copilot');
  console.log('  claude-zen-cli status');
}

// Handle commands
const provider = args[0];

if (!provider || provider === '--help' || provider === '-h') {
  showHelp();
  process.exit(0);
}

// Change to the script's directory to ensure relative paths work
const scriptDir = join(__dirname, '..');

// Run the auth command with tsx for TypeScript support (avoid server startup)
const command = `cd "${scriptDir}" && npx tsx -e "
  // Set environment to avoid server initialization
  process.env.CLAUDE_ZEN_CLI_MODE = 'true';

  import { authenticateCopilot, authStatus } from '${authCommand.replace(/\\/g, '\\\\')}';

  (async () => {
    const provider = '${provider}';
    try {
      if (provider === 'copilot') {
        await authenticateCopilot();
      } else if (provider === 'status') {
        await authStatus();
      } else {
        console.log('Usage: claude-zen-cli <provider>');
        console.log('Available providers: copilot, status');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
"`;

const child = spawn('bash', ['-c', command], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('❌ Failed to start auth command:', error.message);
  console.error('Make sure tsx is installed: npm install -g tsx');
  process.exit(1);
});