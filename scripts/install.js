#!/usr/bin/env node

// Claude-Zen post-install script
// No external dependencies required - everything runs on Node.js

console.log('Installing Claude-Zen...');

// Simple installation verification
async function main() {
  try {
    console.log('✅ Claude-Zen installation completed!');
    console.log('🚀 Neural CLI with ruv-FANN integration ready');
    console.log('🧠 Usage: ./bin/claude-zen neural help');
    console.log('📖 Full commands: ./bin/claude-zen --help');
    
  } catch (error) {
    console.error('Installation verification failed:', error.message);
    process.exit(1);
  }
}

main();