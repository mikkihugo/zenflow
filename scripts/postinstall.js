#!/usr/bin/env node

/**
 * Post-install script for Claude Code Zen NPM package
 * Provides installation feedback and setup guidance
 */

const { platform } = require('os');
const { existsSync } = require('fs');
const { join } = require('path');

console.log('\n🎉 Claude Code Zen installed successfully!');

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

console.log(`📦 Installation type: ${installType}`);
console.log(`🖥️  Platform: ${platform()}`);
console.log(`🔧 Node.js: ${process.version}`);

console.log('\n🚀 Quick Start:');
console.log('   claude-zen auth copilot     # Authenticate with GitHub Copilot');
console.log('   claude-zen --port 3001      # Start server on custom port');
console.log('   claude-zen                  # Start with default settings');

console.log('\n📚 Documentation: https://github.com/zen-neural/claude-code-zen');
console.log('🐛 Issues: https://github.com/zen-neural/claude-code-zen/issues');

if (!existsSync(binaryPath) && !existsSync(nodejsPath)) {
  console.log('\n⚠️  Installation seems incomplete. Try reinstalling:');
  console.log('   npm uninstall -g @zen-ai/claude-code-zen');
  console.log('   npm install -g @zen-ai/claude-code-zen');
}

console.log('\n✅ Ready to use! Run "claude-zen" to get started.\n');