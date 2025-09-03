/**
 * GitHub Copilot Authentication
 * 
 * Handles VS Code-compatible OAuth device flow for Copilot access
 */

import { getLogger } from '@claude-zen/foundation';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const logger = getLogger('copilot-auth');

// VS Code's official GitHub Copilot OAuth client ID
const GITHUB_CLIENT_ID = '01ab8ac9400c4e429b23';
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

// Required scopes for Copilot access (aligned with VS Code)
const COPILOT_SCOPES = ['read:user', 'user:email', 'repo', 'workflow'];

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

export class CopilotAuth {
  
  /**
   * Initiate VS Code-compatible OAuth device flow
   */
  async initiateDeviceFlow(): Promise<DeviceFlowResponse> {
    logger.info('Initiating GitHub device flow for Copilot authentication (VS Code compatible)');
    
    const response = await fetch(DEVICE_CODE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'GitHubCopilotChat/0.22.4',
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        scope: COPILOT_SCOPES.join(' '),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate device flow: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Poll for OAuth token
   */
  async pollForToken(deviceCode: string, interval: number): Promise<TokenResponse> {
    const startTime = Date.now();
    const timeout = 15 * 60 * 1000; // 15 minutes

    while (Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, interval * 1000));

      const response = await fetch(ACCESS_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'GitHubCopilotChat/0.22.4',
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

  /**
   * Copy text to clipboard (cross-platform)
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      const clipboardCommands = [
        ['pbcopy'], // macOS
        ['xclip', '-selection', 'clipboard'], // Linux
        ['wl-copy'], // Wayland
      ];

      for (const cmd of clipboardCommands) {
        try {
          const proc = spawn(cmd[0], cmd.slice(1), { stdio: 'pipe' });
          proc.stdin?.write(text);
          proc.stdin?.end();

          await new Promise<void>((resolve, reject) => {
            proc.on('exit', (code: number) => {
              if (code === 0) resolve();
              else reject(new Error(`Exit code ${code}`));
            });
            proc.on('error', reject);
          });

          logger.debug('Successfully copied to clipboard using', cmd[0]);
          return;
        } catch (error) {
          logger.debug(`Failed to use ${cmd[0]}:`, error);
        }
      }

      logger.warn('Could not copy to clipboard automatically. Please copy the code manually.');
    } catch (error) {
      logger.error('Clipboard operation failed:', error);
    }
  }

  /**
   * Prompt user for input
   */
  promptUser(message: string): Promise<void> {
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

  /**
   * Complete OAuth flow and return VS Code-compatible token
   */
  async authenticate(): Promise<string> {
    try {
      logger.info('Starting GitHub Copilot authentication...');

      // Step 1: Initiate device flow
      const deviceFlow = await this.initiateDeviceFlow();

      // Step 2: Display user code and instructions
      console.log('\n🔐 GitHub Copilot Authentication');
      console.log('═'.repeat(50));
      console.log(`\n📋 Your verification code: ${deviceFlow.user_code}`);
      console.log(`🌐 Visit: ${deviceFlow.verification_uri}`);
      console.log(`⏰ Code expires in ${Math.floor(deviceFlow.expires_in / 60)} minutes\n`);

      // Try to copy code to clipboard
      await this.copyToClipboard(deviceFlow.user_code);
      console.log('📋 Verification code copied to clipboard!\n');

      // Step 3: Wait for user confirmation
      await this.promptUser('Press Enter after you have authorized the application...');

      // Step 4: Poll for token
      logger.info('Waiting for authorization...');
      const tokenResponse = await this.pollForToken(
        deviceFlow.device_code,
        deviceFlow.interval
      );

      logger.info('✅ Authentication successful!');
      logger.info('🎉 You can now use GitHub Copilot with full API access.');
      
      return tokenResponse.access_token;

    } catch (error) {
      logger.error('❌ Authentication failed:', error);
      throw error;
    }
  }
}