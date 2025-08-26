#!/usr/bin/env node

/**
 * Claude Code Zen - Cross-platform AI Development Platform  
 * Simple launcher that bypasses module system issues
 */

const { join } = require('node:path');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');

const binDir = __dirname;
const bundleDir = join(binDir, 'bundle');
const mainScript = join(bundleDir, 'index.js');

// Pass all arguments to the main script
const args = process.argv.slice(2);

// Handle auth command before checking bundle
if (args[0] === 'auth') {
  const provider = args[1];
  
  if (!provider || provider === '--help' || provider === '-h') {
    console.log(`
Claude Code Zen Authentication

Usage: claude-zen auth <command>

Commands:
  copilot    Authenticate with GitHub Copilot
  status     Show authentication status

Examples:
  claude-zen auth copilot
  claude-zen auth status
`);
    process.exit(0);
  }
  
  // Simple inline auth implementation
  const fs = require('node:fs');
  const path = require('node:path');
  const https = require('node:https');
  const readline = require('node:readline');
  const os = require('node:os');
  
  const CONFIG_DIR = '.claude-zen';
  const TOKEN_FILE = 'copilot-token.json';
  const CLIENT_ID = '01ab8ac9400c4e429b23'; // VSCode client ID for Copilot
  
  function ensureConfigDir() {
    const configDir = path.join(os.homedir(), CONFIG_DIR);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    return configDir;
  }
  
  function httpRequest(url, options, postData) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(data) }));
      });
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }
  
  async function authCopilot() {
    try {
      console.log('\n🔐 GitHub Copilot Authentication');
      console.log('═'.repeat(50));
      
      // Get device code
      const deviceRes = await httpRequest('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
      }, `client_id=${CLIENT_ID}&scope=read:user`);
      
      if (deviceRes.statusCode !== 200) throw new Error('Failed to get device code');
      
      const { device_code, user_code, verification_uri, interval } = deviceRes.data;
      
      console.log(`\n📋 Your verification code: ${user_code}`);
      console.log(`🌐 Visit: ${verification_uri}`);
      console.log(`⏰ Code expires in 15 minutes\n`);
      
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      await new Promise(resolve => rl.question('Press Enter after authorizing...', resolve));
      rl.close();
      
      // Poll for token
      let token = null;
      for (let i = 0; i < 60; i++) { // 15 minutes max
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        
        const tokenRes = await httpRequest('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
        }, `client_id=${CLIENT_ID}&device_code=${device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`);
        
        if (tokenRes.data.access_token) {
          token = tokenRes.data.access_token;
          break;
        } else if (tokenRes.data.error === 'authorization_pending') {
        } else if (tokenRes.data.error === 'expired_token') {
          throw new Error('Device code expired. Please try again.');
        } else {
          throw new Error(tokenRes.data.error_description || tokenRes.data.error);
        }
      }
      
      if (!token) throw new Error('Authentication timeout');
      
      // Save token
      const configDir = ensureConfigDir();
      const tokenPath = path.join(configDir, TOKEN_FILE);
      const tokenData = {
        access_token: token,
        created_at: new Date().toISOString(),
        source: 'github-copilot-oauth'
      };
      fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2));
      
      console.log('\n✅ Authentication successful!');
      console.log(`Token saved to: ${tokenPath}`);
    } catch (error) {
      console.error('\n❌ Authentication failed:', error.message);
      process.exit(1);
    }
  }
  
  function authStatus() {
    try {
      const configDir = path.join(os.homedir(), CONFIG_DIR);
      const tokenPath = path.join(configDir, TOKEN_FILE);
      
      if (fs.existsSync(tokenPath)) {
        const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        console.log('\n🔐 Authentication Status');
        console.log('═'.repeat(30));
        console.log('✅ Authenticated: Yes');
        console.log(`📅 Token created: ${tokenData.created_at}`);
        console.log(`📍 Token location: ${tokenPath}`);
      } else {
        console.log('\n🔐 Authentication Status');
        console.log('═'.repeat(30));
        console.log('❌ Authenticated: No');
        console.log('💡 Run `claude-zen auth copilot` to authenticate');
      }
    } catch (error) {
      console.error('❌ Failed to check status:', error.message);
      process.exit(1);
    }
  }
  
  if (provider === 'copilot') {
    authCopilot();
  } else if (provider === 'status') {
    authStatus();
  } else {
    console.log('Usage: claude-zen auth <command>');
    console.log('Available commands: copilot, status');
    process.exit(1);
  }
  
  return; // Don't continue to main app
}

// Ensure bundle directory exists
if (!existsSync(bundleDir)) {
  console.error('❌ Bundle directory not found. Please run: npm run binary:build');
  process.exit(1);
}

// Set environment variables for WASM modules
process.env.CLAUDE_ZEN_BUNDLE_MODE = 'true';
process.env.CLAUDE_ZEN_WASM_PATH = bundleDir;

// Remove type declaration temporarily and run bundle directly
const fs = require('node:fs');
const pkgPath = join(bundleDir, 'package.json');
const originalPkg = fs.readFileSync(pkgPath, 'utf8');
fs.writeFileSync(pkgPath, '{}');

// Launch the main application 
const child = spawn('node', [mainScript, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env }
});

child.on('exit', (code) => {
  // Restore package.json
  fs.writeFileSync(pkgPath, originalPkg);
  process.exit(code || 0);
});

child.on('error', (error) => {
  // Restore package.json on error
  fs.writeFileSync(pkgPath, originalPkg);
  console.error('❌ Failed to start Claude Code Zen:', error.message);
  process.exit(1);
});