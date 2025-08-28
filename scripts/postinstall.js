#!/usr/bin/env node

/**
 * Post-install script for Claude Code Zen NPM package
 * Provides installation feedback and setup guidance
 */

import { platform } from 'os';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple logger for postinstall script
const logger = {
  info: (message) => console.log(message)
};

logger.info('\n🎉 Claude Code Zen installed successfully!');

// Check what's available
const binaryMap = {
  'linux': 'claude-zen-linux',
  'darwin': 'claude-zen-macos', 
  'win32': 'claude-zen-win.exe'
};

const platformBinary = binaryMap[platform()];
const binaryPath = join(__dirname, 'bin', platformBinary);
const nodejsPath = join(__dirname, 'lib', 'index.js');

let installType = '';
if (existsSync(binaryPath)) {
  installType = '⚡ SEA Binary (fastest, no Node.js required)';
} else if (existsSync(nodejsPath)) {
  installType = '🔧 Node.js Version (requires Node.js runtime)';
} else {
  installType = '⚠️ Installation incomplete';
}

logger.info(`📦 Installation type: ${installType}`);
logger.info(`🖥️  Platform: ${platform()}`);
logger.info(`🔧 Node.js: ${process.version}`);

logger.info('\n🚀 Quick Start:');
logger.info('   claude-zen auth copilot     # Authenticate with GitHub Copilot');
logger.info('   claude-zen --port 3001      # Start server on custom port');
logger.info('   claude-zen                  # Start with default settings');

logger.info('\n📚 Documentation: https://github.com/zen-neural/claude-code-zen');
logger.info('🐛 Issues: https://github.com/zen-neural/claude-code-zen/issues');

if (!existsSync(binaryPath) && !existsSync(nodejsPath)) {
  logger.info('\n⚠️  Installation seems incomplete. Try reinstalling:');
  logger.info('   npm uninstall -g @zen-ai/claude-code-zen');
  logger.info('   npm install -g @zen-ai/claude-code-zen');
}

logger.info('\n✅ Ready to use! Run "claude-zen" to get started.\n');