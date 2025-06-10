#!/usr/bin/env node
/**
 * NPM post-install script for Claude-Flow
 * Downloads the appropriate binary for the platform
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BINARY_NAME = 'claude-flow';
const REPO = 'your-org/claude-flow';
const VERSION = require('../package.json').version;

// Platform mapping
const PLATFORM_MAP = {
  'darwin-x64': 'darwin-amd64',
  'darwin-arm64': 'darwin-arm64',
  'linux-x64': 'linux-amd64',
  'linux-arm64': 'linux-arm64',
  'win32-x64': 'windows-amd64.exe',
};

async function install() {
  console.log('Installing Claude-Flow...');

  // Check if Deno is installed
  try {
    await execCommand('deno --version');
    console.log('✓ Deno is installed');
    
    // Use Deno to compile instead of downloading pre-built binary
    console.log('Compiling Claude-Flow with Deno...');
    const srcPath = path.join(__dirname, '..', 'src', 'cli', 'index.ts');
    const outPath = path.join(__dirname, '..', 'dist', BINARY_NAME);
    
    // Ensure dist directory exists
    const distDir = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    await execCommand(`deno compile --allow-all --output="${outPath}" "${srcPath}"`);
    
    // Make binary executable on Unix-like systems
    if (process.platform !== 'win32') {
      fs.chmodSync(outPath, '755');
    }
    
    console.log('✓ Claude-Flow installed successfully!');
    console.log(`Binary location: ${outPath}`);
    
  } catch (error) {
    console.log('Deno not found. Attempting to download pre-built binary...');
    
    const platform = `${process.platform}-${process.arch}`;
    const binaryFile = PLATFORM_MAP[platform];
    
    if (!binaryFile) {
      console.error(`Unsupported platform: ${platform}`);
      console.error('Please install Deno and run: npm run build');
      process.exit(1);
    }
    
    // In a real implementation, download pre-built binary from GitHub releases
    console.error('Pre-built binaries not yet available.');
    console.error('Please install Deno from https://deno.land and run: npm run build');
    process.exit(1);
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Run installation
install().catch(error => {
  console.error('Installation failed:', error.message);
  process.exit(1);
});