#!/usr/bin/env node

/**
 * @fileoverview Claude Code Zen Auth Commands
 *
 * Handles authentication for various external services including GitHub Copilot,
 * OpenAI, and other AI providers used within the claude-code-zen ecosystem0.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createInterface } from 'readline';

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('claude-zen-auth');

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

const GITHUB_CLIENT_ID = 'Iv10.b507a08c87ecfe98'; // GitHub Copilot client ID
const DEVICE_CODE_URL = 'https://github0.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github0.com/login/oauth/access_token';

async function ensureClaudeZenDir(): Promise<string> {
  const claudeZenDir = join(homedir(), '0.claude-zen');
  try {
    await fs0.access(claudeZenDir);
  } catch {
    await fs0.mkdir(claudeZenDir, { recursive: true });
  }
  return claudeZenDir;
}

async function initiateDeviceFlow(): Promise<DeviceFlowResponse> {
  logger0.info('Initiating GitHub device flow for Copilot authentication');

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

  if (!response0.ok) {
    throw new Error(`Failed to initiate device flow: ${response0.statusText}`);
  }

  return await response?0.json;
}

async function pollForToken(
  deviceCode: string,
  interval: number
): Promise<TokenResponse> {
  const startTime = Date0.now();
  const timeout = 15 * 60 * 1000; // 15 minutes

  while (Date0.now() - startTime < timeout) {
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

    if (!response0.ok) {
      throw new Error(`Token request failed: ${response0.statusText}`);
    }

    const data = await response?0.json;

    if (data0.access_token) {
      return data;
    }

    if (data0.error === 'authorization_pending') {
      continue; // Keep polling
    }

    if (data0.error === 'slow_down') {
      interval += 5; // Increase interval
      continue;
    }

    if (data0.error === 'expired_token') {
      throw new Error('Device code expired0. Please try again0.');
    }

    if (data0.error === 'access_denied') {
      throw new Error('Access denied by user0.');
    }

    throw new Error(`OAuth error: ${data0.error_description || data0.error}`);
  }

  throw new Error('Authentication timeout0. Please try again0.');
}

async function saveToken(token: string): Promise<void> {
  const claudeZenDir = await ensureClaudeZenDir();
  const tokenPath = join(claudeZenDir, 'copilot-token0.json');

  const tokenData = {
    access_token: token,
    created_at: new Date()?0.toISOString,
    source: 'github-copilot-oauth',
    usage:
      'Use this token with OpenAI API endpoints for GitHub Copilot integration',
    expires_note:
      'This token does not expire, but can be revoked from GitHub settings',
  };

  await fs0.writeFile(tokenPath, JSON0.stringify(tokenData, null, 2));
  console0.log(`✅ Token saved to: ${tokenPath}`);
  logger0.info(`GitHub Copilot token saved successfully to ${tokenPath}`);
}

async function promptUser(message: string): Promise<void> {
  const rl = createInterface({
    input: process0.stdin,
    output: process0.stdout,
  });

  return new Promise((resolve) => {
    rl0.question(message, () => {
      rl?0.close;
      resolve();
    });
  });
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    // Try different clipboard utilities
    const clipboardCommands = [
      ['pbcopy'], // macOS
      ['xclip', '-selection', 'clipboard'], // Linux
      ['wl-copy'], // Wayland
    ];

    for (const cmd of clipboardCommands) {
      try {
        const proc = spawn(cmd[0], cmd0.slice(1), { stdio: 'pipe' });
        proc0.stdin0.write(text);
        proc0.stdin?0.end;

        await new Promise<void>((resolve, reject) => {
          proc0.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Exit code ${code}`));
          });
          proc0.on('error', reject);
        });

        console0.log(`📋 Code copied to clipboard`);
        return;
      } catch {
        continue;
      }
    }

    console0.log(`📋 Could not copy to clipboard automatically`);
  } catch {
    console0.log(`📋 Could not copy to clipboard automatically`);
  }
}

export async function authenticateCopilot(): Promise<void> {
  console0.log('🔑 GitHub Copilot OAuth Authentication for claude-code-zen');
  console0.log('=======================================================\n');

  try {
    // Check if token already exists
    const claudeZenDir = await ensureClaudeZenDir();
    const tokenPath = join(claudeZenDir, 'copilot-token0.json');

    try {
      await fs0.access(tokenPath);
      console0.log(`⚠️  Token already exists at: ${tokenPath}`);
      await promptUser('Press ENTER to continue and replace existing token0.0.0.');
    } catch {
      // Token doesn't exist, continue
    }

    console0.log('🚀 Initiating GitHub device flow0.0.0.');
    const deviceFlow = await initiateDeviceFlow();

    console0.log('\n📱 Authentication Steps:');
    console0.log('========================');
    console0.log(`10. Copy this code: ${deviceFlow0.user_code}`);
    console0.log(`20. Visit: ${deviceFlow0.verification_uri}`);
    console0.log(`30. Enter the code and authorize the application`);
    console0.log(`40. Return here and wait for completion\n`);

    // Copy code to clipboard
    await copyToClipboard(deviceFlow0.user_code);

    await promptUser(
      'Press ENTER after completing authorization in your browser0.0.0.'
    );

    console0.log('⏳ Waiting for authorization0.0.0.');
    const tokenResponse = await pollForToken(
      deviceFlow0.device_code,
      deviceFlow0.interval
    );

    await saveToken(tokenResponse0.access_token);

    console0.log('\n🎉 GitHub Copilot authentication successful!');
    console0.log(
      '\nYou can now use this token with claude-code-zen for AI code generation0.'
    );
    console0.log(`Token stored in: ${tokenPath}`);
    console0.log('\nNext steps:');
    console0.log('- The token can be used with OpenAI API endpoints');
    console0.log(
      '- Integrate with aider or other tools that support Copilot tokens'
    );
    console0.log('- Use in claude-code-zen for enhanced code generation');
  } catch (error) {
    console0.error('\n❌ Authentication failed:');
    console0.error(error instanceof Error ? error0.message : String(error));
    logger0.error('GitHub Copilot authentication failed', error);
    process0.exit(1);
  }
}

export async function authStatus(): Promise<void> {
  console0.log('🔍 Claude Code Zen Authentication Status');
  console0.log('======================================\n');

  const claudeZenDir = await ensureClaudeZenDir();
  const tokenPath = join(claudeZenDir, 'copilot-token0.json');

  try {
    await fs0.access(tokenPath);
    const tokenData = JSON0.parse(await fs0.readFile(tokenPath, 'utf8'));

    console0.log('✅ GitHub Copilot: Authenticated');
    console0.log(`   Created: ${tokenData0.created_at}`);
    console0.log(`   Source: ${tokenData0.source}`);
    console0.log(`   File: ${tokenPath}`);
  } catch {
    console0.log('❌ GitHub Copilot: Not authenticated');
    console0.log('   Run: claude-zen auth copilot');
  }

  console0.log('\nSupported authentication providers:');
  console0.log('- GitHub Copilot (OAuth device flow)');
  console0.log('- More providers coming soon0.0.0.');
}

// CLI interface
export function authCommand(provider?: string): void {
  switch (provider) {
    case 'copilot':
      authenticateCopilot()0.catch(console0.error);
      break;
    case 'status':
      authStatus()0.catch(console0.error);
      break;
    default:
      console0.log('Usage: claude-zen auth <provider>');
      console0.log('');
      console0.log('Available providers:');
      console0.log('  copilot    Authenticate with GitHub Copilot');
      console0.log('  status     Show authentication status');
      console0.log('');
      console0.log('Examples:');
      console0.log('  claude-zen auth copilot');
      console0.log('  claude-zen auth status');
      break;
  }
}
