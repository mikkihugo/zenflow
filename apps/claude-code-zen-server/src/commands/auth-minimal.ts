#!/usr/bin/env node

/**
 * @fileoverview Claude Code Zen Auth Commands - Minimal Version
 *
 * Handles authentication for GitHub Copilot without heavy dependencies.
 * This version avoids foundation imports to prevent LogTape initialization.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createInterface } from 'readline';

// Enhanced console logger for CLI with structured logging capabilities
const logger = {
  info: (...args: any[]) => {
    console.log(...args);
    // Add structured logging with timestamp and process info
    if (args.length > 0 && typeof args[0] === 'string') {
      const logEntry = {
        level: 'info',
        message: args[0],
        timestamp: new Date()?.toISOString(),
        processId: process.pid,
        command: 'auth-minimal',
        additionalData: args.slice(1),
      };
      // Optional: Write to debug file for troubleshooting
      if (process.env.DEBUG_AUTH) {
        console.log('📊 Structured log:', JSON.stringify(logEntry, null, 2));
      }
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
    // Add structured error logging with enhanced context
    if (args.length > 0) {
      const errorEntry = {
        level: 'error',
        message: typeof args[0] === 'string' ? args[0] : String(args[0]),
        timestamp: new Date()?.toISOString(),
        processId: process.pid,
        command: 'auth-minimal',
        stack: args[0] instanceof Error ? args[0].stack : undefined,
        additionalContext: args.slice(1),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      };
      // Optional: Write to error file for debugging
      if (process.env.DEBUG_AUTH) {
        console.error(
          '🔴 Structured error:',
          JSON.stringify(errorEntry, null, 2)
        );
      }
    }
  },
  debug: (args: any[]) => {
    // Add debug logging capability for enhanced development experience
    if (process.env.DEBUG_AUTH || process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG:', args);
      const debugEntry = {
        level: 'debug',
        message: args.join(' '),
        timestamp: new Date()?.toISOString(),
        processId: process.pid,
        command: 'auth-minimal',
      };
      console.log('📊 Debug structured:', JSON.stringify(debugEntry, null, 2));
    }
  },
  warn: (args: any[]) => {
    console.warn(args);
    // Add structured warning logging
    const warnEntry = {
      level: 'warn',
      message: args.join(' '),
      timestamp: new Date()?.toISOString(),
      processId: process.pid,
      command: 'auth-minimal',
    };
    if (process.env.DEBUG_AUTH) {
      console.warn(
        '⚠️ Structured warning:',
        JSON.stringify(warnEntry, null, 2)
      );
    }
  },
};

interface DeviceFlowResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

const GITHUB_CLIENT_ID = '01ab8ac9400c4e429b23'; // VSCode client ID for Copilot
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

// Simple config reader that doesn't trigger LogTape
async function getAuthConfig(): Promise<{ useProjectConfig?: boolean }> {
  // Check for project-local config first
  const projectConfigPath = join(process.cwd(), '.claude-zen', 'config.json');
  try {
    const projectConfig = JSON.parse(
      await fs.readFile(projectConfigPath, 'utf8')
    );
    return projectConfig.auth || {};
  } catch {
    // Fall back to user config
    const userConfigPath = join(homedir(), '.claude-zen', 'config.json');
    try {
      const userConfig = JSON.parse(await fs.readFile(userConfigPath, 'utf8'));
      return userConfig.auth || {};
    } catch {
      // No config found, use defaults
      return {};
    }
  }
}

async function ensureClaudeZenDir(): Promise<string> {
  const authConfig = await getAuthConfig();

  // Use config to determine storage location
  // Check if we should use project-local config or user home config
  let claudeZenDir: string;

  if (authConfig.useProjectConfig) {
    // Store in project directory if configured
    claudeZenDir = join(process.cwd(), '.claude-zen');
    logger.info('Using project-local config directory');
  } else {
    // Default to user home directory
    claudeZenDir = join(homedir(), '.claude-zen');
    logger.info('Using user home config directory');
  }

  try {
    await fs.access(claudeZenDir);
  } catch {
    await fs.mkdir(claudeZenDir, { recursive: true });
  }

  return claudeZenDir;
}

async function initiateDeviceFlow(): Promise<DeviceFlowResponse> {
  logger.info('Initiating GitHub device flow for Copilot authentication');

  const response = await fetch(DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      scope: 'read:user',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to initiate device flow: ${response.statusText}`);
  }

  return await response.json();
}

async function pollForToken(
  deviceCode: string,
  interval: number
): Promise<TokenResponse> {
  const startTime = Date.now();
  const timeout = 15 * 60 * 1000; // 15 minutes

  while (Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));

    const response = await fetch(ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.access_token) {
      return data;
    }

    if (data.error === 'authorization_pending') {
      continue; // Keep polling
    }

    if (data.error === 'slow_down') {
      interval += 5; // Increase interval
      continue;
    }

    if (data.error === 'expired_token') {
      throw new Error('Device code expired. Please try again.');
    }

    if (data.error === 'access_denied') {
      throw new Error('Access denied by user.');
    }

    throw new Error(`OAuth error: ${data.error_description || data.error}`);
  }

  throw new Error('Authentication timeout. Please try again.');
}

async function saveToken(token: string): Promise<void> {
  const claudeZenDir = await ensureClaudeZenDir();
  const tokenPath = join(claudeZenDir, 'copilot-token.json');

  const tokenData = {
    access_token: token,
    created_at: new Date()?.toISOString(),
    source: 'github-copilot-oauth',
    usage:
      'Use this token with OpenAI API endpoints for GitHub Copilot integration',
    expires_note:
      'This token does not expire, but can be revoked from GitHub settings',
  };

  await fs.writeFile(tokenPath, JSON.stringify(tokenData, null, 2));
  console.log(`✅ Token saved to: ${tokenPath}`);
  logger.info(`GitHub Copilot token saved successfully to ${tokenPath}`);
}

function promptUser(message: string): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    // Try different clipboard utilities
    const clipboardCommands = [
      ['pbcopy'], // macOS
      ['xclip, -selection', 'clipboard'], // Linux
      ['wl-copy'], // Wayland
    ];

    for (const cmd of clipboardCommands) {
      try {
        const proc = spawn(cmd[0], cmd.slice(1), { stdio: 'pipe' });
        proc.stdin.write(text);
        proc.stdin?.end();

        await new Promise<void>((resolve, reject) => {
          proc.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Exit code ${code}`));
          });
          proc.on('error', reject);
        });

        console.log(`📋 Code copied to clipboard`);
        return;
      } catch {
        continue;
      }
    }

    console.log(`📋 Could not copy to clipboard automatically`);
  } catch {
    console.log(`📋 Could not copy to clipboard automatically`);
  }
}

export async function authenticateCopilot(): Promise<void> {
  console.log('🔑 GitHub Copilot OAuth Authentication for claude-code-zen');
  console.log('=======================================================\\n');

  try {
    // Check if token already exists
    const claudeZenDir = await ensureClaudeZenDir();
    const tokenPath = join(claudeZenDir, 'copilot-token.json');

    try {
      await fs.access(tokenPath);
      console.log(`⚠️  Token already exists at: ${tokenPath}`);
      await promptUser('Press ENTER to continue and replace existing token.');
    } catch {
      // Token doesn't exist, continue
    }

    console.log('🚀 Initiating GitHub device flow.');
    const deviceFlow = await initiateDeviceFlow();

    console.log('\\n📱 Authentication Steps:');
    console.log('========================');
    console.log(`1. Copy this code: ${deviceFlow.user_code}`);
    console.log(`2. Visit: ${deviceFlow.verification_uri}`);
    console.log(`3. Enter the code and authorize the application`);
    console.log(`4. Return here and wait for completion\\n`);

    // Copy code to clipboard
    await copyToClipboard(deviceFlow.user_code);

    await promptUser(
      'Press ENTER after completing authorization in your browser.'
    );

    console.log('⏳ Waiting for authorization.');
    const tokenResponse = await pollForToken(
      deviceFlow.device_code,
      deviceFlow.interval
    );

    await saveToken(tokenResponse.access_token);

    console.log('\\n🎉 GitHub Copilot authentication successful!');
    console.log(
      '\\nYou can now use this token with claude-code-zen for AI code generation.'
    );
    console.log(`Token stored in: ${tokenPath}`);
    console.log('\\nNext steps:');
    console.log('- The token can be used with OpenAI API endpoints');
    console.log(
      '- Integrate with aider or other tools that support Copilot tokens'
    );
    console.log('- Use in claude-code-zen for enhanced code generation');
  } catch (error) {
    console.error('\\n❌ Authentication failed:');
    console.error(error instanceof Error ? error.message : String(error));
    logger.error('GitHub Copilot authentication failed', error);
    process.exit(1);
  }
}

export async function authStatus(): Promise<void> {
  console.log('🔍 Claude Code Zen Authentication Status');
  console.log('======================================\\n');

  const claudeZenDir = await ensureClaudeZenDir();
  const tokenPath = join(claudeZenDir, 'copilot-token.json');

  try {
    await fs.access(tokenPath);
    const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));

    console.log('✅ GitHub Copilot: Authenticated');
    console.log(`   Created: ${tokenData.created_at}`);
    console.log(`   Source: ${tokenData.source}`);
    console.log(`   File: ${tokenPath}`);
  } catch {
    console.log('❌ GitHub Copilot: Not authenticated');
    console.log('   Run: claude-zen auth copilot');
  }

  console.log('\\nSupported authentication providers:');
  console.log('- GitHub Copilot (OAuth device flow)');
  console.log('- More providers coming soon.');
}

// CLI interface
export function authCommand(provider?: string): void {
  switch (provider) {
    case 'copilot':
      authenticateCopilot().catch(console.error);
      break;
    case 'status':
      authStatus().catch(console.error);
      break;
    default:
      console.log('Usage: claude-zen auth <provider>');
      console.log('');
      console.log('Available providers:');
      console.log('  copilot    Authenticate with GitHub Copilot');
      console.log('  status     Show authentication status');
      console.log('');
      console.log('Examples:');
      console.log('  claude-zen auth copilot');
      console.log('  claude-zen auth status');
      break;
  }
}
