#!/usr/bin/env node

/**
 * Claude Code Zen - Cross-platform AI Development Platform  
 * Simple launcher that bypasses module system issues
 */

const { join } = require('node:path');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');

// Minimal logger (available even before main bundle starts)
const logger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

const binDir = __dirname;
const bundleDir = join(binDir, 'bundle');
const mainScript = join(bundleDir, 'index.js');

// Pass all arguments to the main script
const args = process.argv.slice(2);

// Handle auth/login commands before checking bundle
const first = args[0];
if (first === 'auth' || first === 'login' || first === 'copilot' || first === 'gemini' || first === 'status') {
  const isLoginAlias = first === 'login';
  // Support top-level provider aliases: `claude-zen copilot ...` and `claude-zen gemini ...`
  const provider = (first === 'copilot' || first === 'gemini' || first === 'status') ? first : args[1];
  
  if (!provider || provider === '--help' || provider === '-h') {
  logger.info(`
Claude Code Zen Authentication

Usage: claude-zen auth <command>
  or: claude-zen login <provider> [options]
  or: claude-zen <copilot|gemini> <login|status|logout>

Commands:
  copilot    Authenticate with GitHub Copilot (login|status|logout)
  gemini     Authenticate with Google Gemini (auto|login|status|logout)
  status     Show Copilot authentication status

Examples:
  # Copilot
  claude-zen auth copilot                # device login, then status
  claude-zen copilot status              # show status
  claude-zen copilot logout              # clear token

  # Gemini
  claude-zen auth gemini                 # auto: status if configured, else login
  claude-zen gemini status               # show status
  claude-zen gemini logout               # clear local config
  claude-zen auth gemini login --mode=api-key
  claude-zen auth gemini login --mode=oauth
  claude-zen auth gemini login --mode=vertex --project my-project --region us-central1
  
  # Login aliases (equivalent)
  claude-zen login copilot
  claude-zen login gemini --mode=oauth
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
  const GEMINI_FILE = 'gemini.json';
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
      logger.info('\n🔐 GitHub Copilot Authentication');
      logger.info('═'.repeat(50));
      
      // Get device code
      const deviceRes = await httpRequest('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
      }, `client_id=${CLIENT_ID}&scope=read:user`);
      
      if (deviceRes.statusCode !== 200) throw new Error('Failed to get device code');
      
      const { device_code, user_code, verification_uri, interval } = deviceRes.data;
      
      logger.info(`\n📋 Your verification code: ${user_code}`);
      logger.info(`🌐 Visit: ${verification_uri}`);
      logger.info(`⏰ Code expires in 15 minutes\n`);
      
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
      
      logger.info('\n✅ Authentication successful!');
      logger.info(`Token saved to: ${tokenPath}`);
    } catch (error) {
      logger.error('\n❌ Authentication failed:', error.message);
      process.exit(1);
    }
  }

  function copilotLogout() {
    try {
      const os = require('node:os');
      const path = require('node:path');
      const fs = require('node:fs');
      const configDir = path.join(os.homedir(), CONFIG_DIR);
      const tokenPath = path.join(configDir, TOKEN_FILE);
      if (fs.existsSync(tokenPath)) {
        fs.unlinkSync(tokenPath);
        logger.info('✅ Copilot token cleared');
      } else {
        logger.info('ℹ️ No Copilot token found');
      }
    } catch (e) {
      logger.error('❌ Failed to clear Copilot token:', e.message);
      process.exit(1);
    }
  }

  function showGeminiStatus(geminiPath) {
    try {
      if (fs.existsSync(geminiPath)) {
        const data = JSON.parse(fs.readFileSync(geminiPath, 'utf8'));
        logger.info('\n🔐 Gemini Auth Status');
        logger.info('═'.repeat(30));
        logger.info(`✅ Mode: ${data.authMode}`);
        if (data.authMode === 'api-key') logger.info('🔑 Using API key from secure config');
        if (data.authMode === 'oauth') logger.info('🌐 OAuth via gemini CLI cache');
        if (data.authMode === 'vertex') logger.info(`☁️ Vertex project: ${data.projectId}, region: ${data.region || 'auto'}`);
        logger.info(`📍 Config: ${geminiPath}`);
      } else {
        logger.info('\n🔐 Gemini Auth Status');
        logger.info('═'.repeat(30));
        logger.info('❌ Not configured');
        logger.info('💡 Run one of:');
        logger.info('   claude-zen auth gemini login --mode=api-key');
        logger.info('   claude-zen auth gemini login --mode=oauth');
        logger.info('   claude-zen auth gemini login --mode=vertex --project <id> [--region <region>]');
      }
    } catch (e) {
      logger.error('❌ Failed to read Gemini status:', e.message);
    }
  }

  async function authGemini() {
    // Support both `claude-zen auth gemini ...` and `claude-zen gemini ...`
    const base = (first === 'gemini') ? 1 : 2;
    const sub = args[base] || 'auto';
    const extraArgs = args.slice(base + 1);

    function parseFlag(name, defVal = undefined) {
      const i = extraArgs.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
      if (i === -1) return defVal;
      const a = extraArgs[i];
      if (a.includes('=')) return a.split('=')[1];
      return extraArgs[i+1] || defVal;
    }

    const configDir = ensureConfigDir();
    const geminiPath = path.join(configDir, GEMINI_FILE);

  if (sub === 'status') {
      showGeminiStatus(geminiPath);
      return;
    }

    if (sub === 'logout') {
      if (fs.existsSync(geminiPath)) fs.unlinkSync(geminiPath);
      logger.info('✅ Gemini credentials cleared');
      return;
    }

    // Automatic behavior: show status if configured, else try login heuristics
    async function tryGeminiLoginInteractive() {
      // Prefer modern `gemini login`, fallback to legacy `gemini auth login`
      const tryRun = (argv) => new Promise((resolve, reject) => {
        const child = spawn('gemini', argv, { stdio: 'inherit' });
        child.on('exit', code => code === 0 ? resolve(true) : resolve(false));
        child.on('error', reject);
      });
      // Try `gemini login`
      let ok = await tryRun(['login']);
      if (ok) return true;
      // Fallback `gemini auth login`
      ok = await tryRun(['auth','login']);
      return ok;
    }

    function openBrowser(url) {
      try {
        const platform = process.platform;
        if (platform === 'darwin') {
          spawn('open', [url], { stdio: 'ignore', detached: true });
        } else if (platform === 'win32') {
          spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true, windowsVerbatimArguments: true });
        } else {
          spawn('xdg-open', [url], { stdio: 'ignore', detached: true });
        }
      } catch {}
    }

    if (sub === 'auto') {
      if (fs.existsSync(geminiPath)) {
        showGeminiStatus(geminiPath);
        return;
      }
      // Default preference: OAuth first
      try {
        logger.info('🌐 Attempting OAuth via Gemini CLI login...');
        const ok = await tryGeminiLoginInteractive();
        if (ok) {
          const payload = { authMode: 'oauth', created_at: new Date().toISOString() };
          fs.writeFileSync(geminiPath, JSON.stringify(payload, null, 2));
          logger.info(`✅ OAuth configured. Saved to ${geminiPath}`);
          showGeminiStatus(geminiPath);
          return;
        }
        throw new Error('gemini login not available');
      } catch (e) {
        logger.warn('⚠️ OAuth via CLI not available.');
        const webUrl = 'https://aistudio.google.com/app';
        const apiUrl = 'https://aistudio.google.com/app/apikey';
        logger.info('🔗 Open this page to sign in with your Google account:');
        logger.info(`   ${webUrl}`);
        logger.info('   (After signing in, you can generate an API key here if needed:)');
        logger.info(`   ${apiUrl}`);
        openBrowser(webUrl);
        // Optional fallback: environment API key if present
        const envKey = process.env.GEMINI_API_KEY;
        if (envKey && envKey.trim()) {
          const payload = { authMode: 'api-key', apiKey: envKey.trim(), created_at: new Date().toISOString() };
          fs.writeFileSync(geminiPath, JSON.stringify(payload, null, 2));
          logger.info('🔑 Found GEMINI_API_KEY in environment and saved config as API key mode.');
          showGeminiStatus(geminiPath);
          return;
        }
        // Exit with guidance
        logger.info('\nNext steps:');
        logger.info('  1) Complete sign-in in your browser');
        logger.info('  2) EITHER run: node bin/claude-zen.cjs auth gemini login --mode=oauth');
        logger.info('     OR set GEMINI_API_KEY and re-run: node bin/claude-zen.cjs gemini');
        return process.exit(1);
      }
    }

    // Explicit login flow requires --mode
    const mode = parseFlag('mode');
    if (!mode || !['api-key','oauth','vertex'].includes(mode)) {
      logger.info('Usage: claude-zen auth gemini login --mode=api-key|oauth|vertex');
      return process.exit(1);
    }

    if (mode === 'api-key') {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const apiKey = await new Promise(resolve => rl.question('Enter your GEMINI_API_KEY: ', ans => { rl.close(); resolve(ans.trim()); }));
      if (!apiKey) {
        logger.error('❌ API key is required');
        return process.exit(1);
      }
      const payload = { authMode: 'api-key', apiKey, created_at: new Date().toISOString() };
      fs.writeFileSync(geminiPath, JSON.stringify(payload, null, 2));
  logger.info(`✅ Saved API key to ${geminiPath}`);
  if (isLoginAlias) showGeminiStatus(geminiPath);
      return;
    }

    if (mode === 'oauth') {
      logger.info('🌐 Launching Gemini CLI OAuth login...');
      try {
        const ok = await tryGeminiLoginInteractive();
        if (!ok) throw new Error('gemini login failed');
        const payload = { authMode: 'oauth', created_at: new Date().toISOString() };
        fs.writeFileSync(geminiPath, JSON.stringify(payload, null, 2));
  logger.info(`✅ OAuth configured. Saved to ${geminiPath}`);
  if (isLoginAlias) showGeminiStatus(geminiPath);
      } catch (e) {
        const webUrl = 'https://aistudio.google.com/app';
        logger.error('❌ Gemini CLI login not available. You can sign in on the web:');
        logger.error(`   ${webUrl}`);
        openBrowser(webUrl);
        return process.exit(1);
      }
      return;
    }

    if (mode === 'vertex') {
      const project = parseFlag('project') || parseFlag('projectId');
      const region = parseFlag('region');
      if (!project) {
        logger.error('❌ --project <id> is required for Vertex mode');
        return process.exit(1);
      }
      logger.info('☁️ Configuring Vertex AI via gcloud ADC...');
      try {
        const child = spawn('gcloud', ['auth','application-default','login'], { stdio: 'inherit' });
        await new Promise((resolve, reject) => {
          child.on('exit', code => code === 0 ? resolve() : reject(new Error(`gcloud exit ${code}`)));
          child.on('error', reject);
        });
      } catch (e) {
        logger.error('❌ Failed to run gcloud. Please install Google Cloud SDK.');
        return process.exit(1);
      }
      const payload = { authMode: 'vertex', projectId: project, region: region || null, created_at: new Date().toISOString() };
      fs.writeFileSync(geminiPath, JSON.stringify(payload, null, 2));
  logger.info(`✅ Vertex configured. Saved to ${geminiPath}`);
      logger.info('ℹ️ Set env when running builds/services if needed:');
      logger.info('   GOOGLE_GENAI_USE_VERTEXAI=true');
      logger.info(`   GOOGLE_CLOUD_PROJECT=${project}`);
      if (region) logger.info(`   GOOGLE_CLOUD_REGION=${region}`);
  if (isLoginAlias) showGeminiStatus(geminiPath);
      return;
    }
  }
  
  function authStatus() {
    try {
      const configDir = path.join(os.homedir(), CONFIG_DIR);
      const tokenPath = path.join(configDir, TOKEN_FILE);
      
      if (fs.existsSync(tokenPath)) {
        const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        logger.info('\n🔐 Authentication Status');
        logger.info('═'.repeat(30));
        logger.info('✅ Authenticated: Yes');
        logger.info(`📅 Token created: ${tokenData.created_at}`);
        logger.info(`📍 Token location: ${tokenPath}`);
      } else {
        logger.info('\n🔐 Authentication Status');
        logger.info('═'.repeat(30));
        logger.info('❌ Authenticated: No');
        logger.info('💡 Run `claude-zen auth copilot` to authenticate');
      }
    } catch (error) {
      logger.error('❌ Failed to check status:', error.message);
      process.exit(1);
    }
  }
  
  if (provider === 'status') {
    authStatus();
  } else if (provider === 'copilot') {
    const sub = (first === 'copilot') ? (args[1] || 'login') : 'login';
    if (sub === 'status') {
      authStatus();
      return;
    }
    if (sub === 'logout') {
      copilotLogout();
      return;
    }
    authCopilot().then(() => {
      if (isLoginAlias || first === 'copilot') authStatus();
    }).catch(err => {
      logger.error('❌ Authentication failed:', err.message);
      process.exit(1);
    });
  } else if (provider === 'gemini') {
    authGemini();
  } else {
    logger.info('Usage:');
    logger.info('  claude-zen auth <command>');
    logger.info('  claude-zen login <provider> [options]');
    logger.info('Also: claude-zen <copilot|gemini> <login|status|logout>');
    logger.info('Available: copilot, gemini, status');
    process.exit(1);
  }
  
  return; // Don't continue to main app
}

// Ensure bundle directory exists
if (!existsSync(bundleDir)) {
  logger.error('❌ Bundle directory not found. Please run: npm run binary:build');
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
  logger.error('❌ Failed to start Claude Code Zen:', error.message);
  process.exit(1);
});