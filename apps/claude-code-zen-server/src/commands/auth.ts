#!/usr/bin/env node

/**
 * @fileoverview Claude Code Zen Auth Commands
 *
 * Handles authentication for various external services including GitHub Copilot,
 * OpenAI, and other AI providers used within the claude-code-zen ecosystem.
 */

import { promises as fs } from 'node:fs';
// Using native fetch (Node 18+)
import { homedir } from 'node:os';
import { join } from 'node:path';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('claude-zen-auth');

// Configuration constants
const CONFIG_PATH = '.claude-zen';
const TOKEN_FILENAME = 'copilot-token.json';

/**
 * Retrieves authentication configuration using Claude Zen storage hierarchy.
 *
 * @description Implements a cascading configuration strategy that checks multiple locations
 * in order of precedence to determine authentication settings. This follows the Claude Zen
 * storage architecture pattern used throughout the codebase.
 *
 * **Configuration Precedence** (highest to lowest):
 * 1. **Project-local config**:'./.claude-zen/config.json' (project root)'
 * 2. **User-global config**:'~/.claude-zen/config.json' (user home)'
 * 3. **Default config**:Empty object with default behaviors
 *
 * @returns Promise resolving to authentication configuration object
 * @returns {Promise<{ useProjectConfig?:boolean}>} Configuration with optional settings:
 *   - 'useProjectConfig':If true, forces project-local storage for auth tokens'
 *
 * @example
 * 'typescript'
 * const authConfig = await getAuthConfig();
 * if (authConfig.useProjectConfig) {
 *   logger.info('Using project-local authentication storage');
 *} else {
 *   logger.info('Using user-global authentication storage');
 *}
 * '
 *
 * @throws {Error} Never throws - uses graceful fallback to defaults
 *
 * @see {@link CONFIG_PATH} for storage directory structure
 * @see {@link ensureClaudeZenDir} for directory resolution logic
 * @since 1.0.0
 */
async function getAuthConfig(): Promise<{ useProjectConfig?: boolean }> {
  // Check for project-local config first (highest precedence)
  const projectConfigPath = join(process.cwd(), CONFIG_PATH, 'config.json');
  try {
    const projectConfig = JSON.parse(
      await fs.readFile(projectConfigPath, 'utf8')
    );
    return projectConfig.auth || {};
  } catch {
    // Fall back to user config (medium precedence)
    const userConfigPath = join(homedir(), CONFIG_PATH, 'config.json');
    try {
      const userConfig = JSON.parse(await fs.readFile(userConfigPath, 'utf8'));
      return userConfig.auth || {};
    } catch {
      // No config found, use defaults (lowest precedence)
      return {};
    }
  }
}

/**
 * Ensures the Claude Zen configuration directory exists and returns its absolute path.
 *
 * @description Creates the appropriate .claude-zen directory based on configuration settings
 * and ensures it exists with proper permissions. This function implements the core storage
 * resolution logic used throughout the Claude Zen architecture.
 *
 * **Directory Resolution Logic**:
 * 1. Calls {@link getAuthConfig} to determine storage preference
 * 2. If 'useProjectConfig:true'  uses project-local storage'
 * 3. If 'useProjectConfig:false/undefined'  uses user-global storage'
 * 4. Creates directory recursively if it doesn't exist
 * 5. Returns absolute path for use by calling functions
 *
 * **Storage Locations**:
 * - **Project-local**:'{project_root}/.claude-zen/'
 * - **User-global**:'{user_home}/.claude-zen/'
 *
 * @returns {Promise<string>} Absolute path to the Claude Zen configuration directory
 *
 * @example
 * 'typescript'
 * // Will create and return either:
 * // - "/path/to/project/.claude-zen" (project-local)
 * // - "/home/user/.claude-zen" (user-global)
 * const configDir = await ensureClaudeZenDir();
 * const tokenPath = join(configDir, TOKEN_FILENAME);
 * '
 *
 * @throws {Error} If directory cannot be created due to permissions or filesystem issues
 *
 * @see {@link getAuthConfig} for configuration precedence rules
 * @see {@link CONFIG_PATH} for directory naming convention
 * @since 1.0.0
 */
async function ensureClaudeZenDir(): Promise<string> {
  const authConfig = await getAuthConfig();
  // Use config to determine storage location
  let claudeZenDir: string;
  if (authConfig.useProjectConfig) {
    // Store in project directory if configured
    claudeZenDir = join(process.cwd(), CONFIG_PATH);
    logger.info('Using project-local config directory');
  } else {
    // Default to user home directory
    claudeZenDir = join(homedir(), CONFIG_PATH);
    logger.info('Using user home config directory');
  }

  try {
    await fs.access(claudeZenDir);
  } catch {
    await fs.mkdir(claudeZenDir, { recursive: true });
  }
  return claudeZenDir;
}

async function saveToken(token: string): Promise<void> {
  const claudeZenDir = await ensureClaudeZenDir();
  const tokenPath = join(claudeZenDir, TOKEN_FILENAME);

  const tokenData = {
    access_token: token,
    created_at: new Date().toISOString(),
    source: 'vscode-compatible-oauth',
    usage: 'VS Code compatible token for GitHub Copilot API access',
    expires_note: 'This token does not expire, but can be revoked from GitHub settings',
  };

  await fs.writeFile(tokenPath, JSON.stringify(tokenData, null, 2));
  logger.info(` Token saved to:${  tokenPath}`);
  logger.info(`GitHub Copilot token saved successfully to ${  tokenPath}`);
}

export async function authLogin(): Promise<void> {
  try {
    // Use the copilot provider for authentication
    const { CopilotAuth: copilotAuth } = await import('@claude-zen/copilot-provider');

    const auth = new copilotAuth();
    const githubToken = await auth.authenticate();

    // Save the VS Code-compatible token
    await saveToken(githubToken);

    logger.info('✅ Authentication successful!');
    logger.info('🎉 You can now use GitHub Copilot with Claude Code Zen.');

  } catch (error) {
    logger.error('Authentication failed: ', error);
    process.exit(1);
  }
}

export async function authStatus(): Promise<void> {
  try {
    const claudeZenDir = await ensureClaudeZenDir();
    const tokenPath = join(claudeZenDir, TOKEN_FILENAME);

    try {
      const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
      logger.info('\n Authentication Status');
      logger.info('═'.repeat(30));
      logger.info('Authenticated: Yes');
      logger.info(` Token created: ${  tokenData.created_at}`);
      logger.info(` Token location: ${  tokenPath}`);
      logger.info(` Source: ${  tokenData.source}`);
    } catch {
      logger.info('\n Authentication Status');
      logger.info('═'.repeat(30));
      logger.info('Authenticated: No');
      logger.info('Run "claude-zen auth login" to authenticate');
    }
  } catch (error) {
    logger.error('Failed to check authentication status: ', error);
    process.exit(1);
  }
}

export async function authLogout(): Promise<void> {
  try {
    const claudeZenDir = await ensureClaudeZenDir();
    const tokenPath = join(claudeZenDir, TOKEN_FILENAME);

    try {
      await fs.unlink(tokenPath);
      logger.info('\n Successfully logged out');
      logger.info('Token has been removed from local storage.');
    } catch {
      logger.info('\n No authentication token found');
      logger.info('You are already logged out.');
    }
  } catch (error) {
    logger.error('Failed to logout: ', error);
    process.exit(1);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'login':
      await authLogin();
      break;
    case 'status':
      await authStatus();
      break;
    case 'logout':
      await authLogout();
      break;
    default:
      logger.info(
        '\nClaude Code Zen Authentication\n\n' +
        'Usage: claude-zen auth <command>\n\n' +
        'Commands:\n' +
        '  login   Authenticate with GitHub Copilot\n' +
        '  status  Check authentication status\n' +
        '  logout  Remove authentication token\n\n' +
        'Examples:\n' +
        '  claude-zen auth login   # Start authentication flow\n' +
        '  claude-zen auth status  # Check if authenticated\n' +
        '  claude-zen auth logout  # Remove token\n'
      );
      break;
  }
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${  process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Command failed: ', error);
    process.exit(1);
  });
}