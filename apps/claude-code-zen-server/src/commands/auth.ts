#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * @fileoverview Claude Code Zen Auth Commands
 *
 * Handles authentication for various external services including GitHub Copilot,
 * OpenAI, and other AI providers used within the claude-code-zen ecosystem.
 */

import { spawn } from "child_process";
import { promises as fs } from "fs";
// Using native fetch (Node 18+)
import { homedir } from "os";
import { join } from "path";
import { createInterface } from "readline";

import { getLogger } from "@claude-zen/foundation";

const logger = getLogger("claude-zen-auth");

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

const GITHUB_CLIENT_ID = "01ab8ac9400c4e429b23"; // VSCode client ID for Copilot
const DEVICE_CODE_URL = "https://github.com/login/device/code";
const ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";

/**
 * Configuration directory name for Claude Zen storage architecture.
 *
 * @description This directory is used consistently across the entire codebase for storing
 * configuration files, authentication tokens, databases, and other persistent data.
 * The actual location depends on configuration settings:
 *
 * **Project-local storage** (when `useProjectConfig: true`):
 * - Location: `./claude-zen/` (relative to project root)
 * - Use case: Project-specific settings, team configurations
 * - Example: `/path/to/project/.claude-zen/`
 *
 * **User-global storage** (default, when `useProjectConfig: false`):
 * - Location: `~/.claude-zen/` (in user home directory)
 * - Use case: Personal settings, cross-project authentication
 * - Example: `/home/user/.claude-zen/` or `C:\Users\user\.claude-zen\`
 *
 * @example
 * ```typescript
 * // Project storage: ./claude-zen/config.json
 * const projectPath = join(process.cwd(), CONFIG_PATH, 'config.json');
 *
 * // User storage: ~/.claude-zen/config.json
 * const userPath = join(homedir(), CONFIG_PATH, 'config.json');
 * ```
 *
 * @see {@link ensureClaudeZenDir} for directory resolution logic
 * @see {@link getAuthConfig} for configuration precedence rules
 * @since 1.0.0
 */
const CONFIG_PATH = ".claude-zen";

/**
 * Filename for storing GitHub Copilot OAuth tokens.
 *
 * @description Stored within the CONFIG_PATH directory structure:
 * - User storage: `~/.claude-zen/copilot-token.json`
 * - Project storage: `./.claude-zen/copilot-token.json`
 *
 * @see {@link CONFIG_PATH} for storage location details
 */
const TOKEN_FILENAME = "copilot-token.json";

/**
 * Retrieves authentication configuration using Claude Zen storage hierarchy.
 *
 * @description Implements a cascading configuration strategy that checks multiple locations
 * in order of precedence to determine authentication settings. This follows the Claude Zen
 * storage architecture pattern used throughout the codebase.
 *
 * **Configuration Precedence** (highest to lowest):
 * 1. **Project-local config**: `./.claude-zen/config.json` (project root)
 * 2. **User-global config**: `~/.claude-zen/config.json` (user home)
 * 3. **Default config**: Empty object with default behaviors
 *
 * @returns Promise resolving to authentication configuration object
 * @returns {Promise<{ useProjectConfig?: boolean }>} Configuration with optional settings:
 *   - `useProjectConfig`: If true, forces project-local storage for auth tokens
 *
 * @example
 * ```typescript
 * const authConfig = await getAuthConfig();
 * if (authConfig.useProjectConfig) {
 *   console.log('Using project-local authentication storage');
 * } else {
 *   console.log('Using user-global authentication storage');
 * }
 * ```
 *
 * @throws {Error} Never throws - uses graceful fallback to defaults
 *
 * @see {@link CONFIG_PATH} for storage directory structure
 * @see {@link ensureClaudeZenDir} for directory resolution logic
 * @since 1.0.0
 */
async function getAuthConfig(): Promise<{ useProjectConfig?: boolean }> {
	// Check for project-local config first (highest precedence)
	const projectConfigPath = join(process.cwd(), CONFIG_PATH, "config.json");
	try {
		const projectConfig = JSON.parse(
			await fs.readFile(projectConfigPath, "utf8"),
		);
		return projectConfig.auth || {};
	} catch {
		// Fall back to user config (medium precedence)
		const userConfigPath = join(homedir(), CONFIG_PATH, "config.json");
		try {
			const userConfig = JSON.parse(await fs.readFile(userConfigPath, "utf8"));
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
 * 2. If `useProjectConfig: true` → uses project-local storage
 * 3. If `useProjectConfig: false/undefined` → uses user-global storage
 * 4. Creates directory recursively if it doesn't exist
 * 5. Returns absolute path for use by calling functions
 *
 * **Storage Locations**:
 * - **Project-local**: `{project_root}/.claude-zen/`
 * - **User-global**: `{user_home}/.claude-zen/`
 *
 * @returns {Promise<string>} Absolute path to the Claude Zen configuration directory
 *
 * @example
 * ```typescript
 * // Will create and return either:
 * // - "/path/to/project/.claude-zen" (project-local)
 * // - "/home/user/.claude-zen" (user-global)
 * const configDir = await ensureClaudeZenDir();
 * const tokenPath = join(configDir, TOKEN_FILENAME);
 * ```
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
		logger.info("Using project-local config directory");
	} else {
		// Default to user home directory
		claudeZenDir = join(homedir(), CONFIG_PATH);
		logger.info("Using user home config directory");
	}

	try {
		await fs.access(claudeZenDir);
	} catch {
		await fs.mkdir(claudeZenDir, { recursive: true });
	}
	return claudeZenDir;
}

async function initiateDeviceFlow(): Promise<DeviceFlowResponse> {
	logger.info("Initiating GitHub device flow for Copilot authentication");
	const response = await fetch(DEVICE_CODE_URL, {
		method: "POST",
		headers: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Accept: "application/json",
			// eslint-disable-next-line @typescript-eslint/naming-convention
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: GITHUB_CLIENT_ID,
			scope: "read:user",
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to initiate device flow: ${response.statusText}`);
	}

	return await response.json();
}

async function pollForToken(
	deviceCode: string,
	interval: number,
): Promise<TokenResponse> {
	const startTime = Date.now();
	const timeout = 15 * 60 * 1000; // 15 minutes

	while (Date.now() - startTime < timeout) {
		await new Promise((resolve) => setTimeout(resolve, interval * 1000));

		const response = await fetch(ACCESS_TOKEN_URL, {
			method: "POST",
			headers: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Accept: "application/json",
				// eslint-disable-next-line @typescript-eslint/naming-convention
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: GITHUB_CLIENT_ID,
				device_code: deviceCode,
				grant_type: "urn:ietf:params:oauth:grant-type:device_code",
			}),
		});

		if (!response.ok) {
			throw new Error(`Token request failed: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.access_token) {
			return data;
		}

		if (data.error === "authorization_pending") {
			continue; // Keep polling
		}

		if (data.error === "slow_down") {
			interval += 5; // Increase interval
			continue;
		}

		if (data.error === "expired_token") {
			throw new Error("Device code expired. Please try again.");
		}

		if (data.error === "access_denied") {
			throw new Error("Access denied by user.");
		}

		throw new Error(`OAuth error: ${data.error_description || data.error}`);
	}

	throw new Error("Authentication timeout. Please try again.");
}

async function saveToken(token: string): Promise<void> {
	const claudeZenDir = await ensureClaudeZenDir();
	const tokenPath = join(claudeZenDir, TOKEN_FILENAME);

	const tokenData = {
		access_token: token,
		created_at: new Date().toISOString(),
		source: "github-copilot-oauth",
		usage:
			"Use this token with OpenAI API endpoints for GitHub Copilot integration",
		expires_note:
			"This token does not expire, but can be revoked from GitHub settings",
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
			["pbcopy"], // macOS
			["xclip", "-selection", "clipboard"], // Linux
			["wl-copy"], // Wayland
		];

		for (const cmd of clipboardCommands) {
			try {
				const proc = spawn(cmd[0], cmd.slice(1), { stdio: "pipe" });
				proc.stdin.write(text);
				proc.stdin?.end();

				await new Promise<void>((resolve, reject) => {
					proc.on("exit", (code) => {
						if (code === 0) resolve();
						else reject(new Error(`Exit code ${code}`));
					});
					proc.on("error", reject);
				});

				logger.debug("Successfully copied to clipboard using", cmd[0]);
				return;
			} catch (error) {
				logger.debug(`Failed to use ${cmd[0]}:`, error);
				continue;
			}
		}

		// If all clipboard utilities fail, just inform the user
		logger.warn(
			"Could not copy to clipboard automatically. Please copy the code manually.",
		);
	} catch (error) {
		logger.error("Clipboard operation failed:", error);
	}
}

export async function authLogin(): Promise<void> {
	try {
		logger.info("Starting GitHub Copilot authentication...");

		// Step 1: Initiate device flow
		const deviceFlow = await initiateDeviceFlow();

		// Step 2: Display user code and instructions
		console.log("\n🔐 GitHub Copilot Authentication");
		console.log("═".repeat(50));
		console.log(`\n📋 Your verification code: ${deviceFlow.user_code}`);
		console.log(`🌐 Visit: ${deviceFlow.verification_uri}`);
		console.log(
			`⏰ Code expires in ${Math.floor(deviceFlow.expires_in / 60)} minutes\n`,
		);

		// Try to copy code to clipboard
		await copyToClipboard(deviceFlow.user_code);

		// Step 3: Wait for user confirmation
		await promptUser(
			"Press Enter after you have authorized the application...",
		);

		// Step 4: Poll for token
		logger.info("Waiting for authorization...");
		const tokenResponse = await pollForToken(
			deviceFlow.device_code,
			deviceFlow.interval,
		);

		// Step 5: Save token
		await saveToken(tokenResponse.access_token);

		console.log("\n✅ Authentication successful!");
		console.log("You can now use GitHub Copilot with Claude Code Zen.");
	} catch (error) {
		logger.error("Authentication failed:", error);
		process.exit(1);
	}
}

export async function authStatus(): Promise<void> {
	try {
		const claudeZenDir = await ensureClaudeZenDir();
		const tokenPath = join(claudeZenDir, TOKEN_FILENAME);

		try {
			const tokenData = JSON.parse(await fs.readFile(tokenPath, "utf8"));
			console.log("\n🔐 Authentication Status");
			console.log("═".repeat(30));
			console.log("✅ Authenticated: Yes");
			console.log(`📅 Token created: ${tokenData.created_at}`);
			console.log(`📍 Token location: ${tokenPath}`);
			console.log(`🔑 Source: ${tokenData.source}`);
		} catch {
			console.log("\n🔐 Authentication Status");
			console.log("═".repeat(30));
			console.log("❌ Authenticated: No");
			console.log("💡 Run `claude-zen auth login` to authenticate");
		}
	} catch (error) {
		logger.error("Failed to check authentication status:", error);
		process.exit(1);
	}
}

export async function authLogout(): Promise<void> {
	try {
		const claudeZenDir = await ensureClaudeZenDir();
		const tokenPath = join(claudeZenDir, TOKEN_FILENAME);

		try {
			await fs.unlink(tokenPath);
			console.log("\n✅ Successfully logged out");
			console.log("Token has been removed from local storage.");
		} catch {
			console.log("\n💡 No authentication token found");
			console.log("You are already logged out.");
		}
	} catch (error) {
		logger.error("Failed to logout:", error);
		process.exit(1);
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	switch (command) {
		case "login":
			await authLogin();
			break;
		case "status":
			await authStatus();
			break;
		case "logout":
			await authLogout();
			break;
		default:
			console.log(`
Claude Code Zen Authentication

Usage: claude-zen auth <command>

Commands:
  login   Authenticate with GitHub Copilot
  status  Check authentication status
  logout  Remove authentication token

Examples:
  claude-zen auth login   # Start authentication flow
  claude-zen auth status  # Check if authenticated
  claude-zen auth logout  # Remove token
`);
			break;
	}
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		logger.error("Command failed:", error);
		process.exit(1);
	});
}
