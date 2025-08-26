/**
 * @fileoverview Minimal Foundation Configuration System
 *
 * Contains ONLY the 5 core foundation systems configuration:
 * - Logging configuration
 * - Basic development settings
 * - Environment detection
 * - Core system settings
 *
 * All other configurations (storage, neural, telemetry, etc.) belong in
 * their respective implementation packages.
 */

import { z } from "zod";
import type { JsonObject } from "../../types/primitives";
import { getLogger } from "../logging";

const logger = getLogger("foundation-config");

// =============================================================================
// MINIMAL CONFIGURATION SCHEMA - Foundation Core Only (Using Zod)
// =============================================================================

/**
 * Configuration schema for the Foundation package core systems.
 * Validates environment variables and provides type-safe configuration access.
 *
 * @remarks
 * This schema defines the complete configuration structure for foundation systems:
 * - Environment detection (development, production, test)
 * - Logging configuration with multiple formats and outputs
 * - System identification and hostname settings
 * - Development environment detection for Nix shells
 * - Project configuration directories
 * - OpenTelemetry basic settings for observability
 */
const configSchema = z.object({
	// Environment Configuration
	env: z.enum(["production", "development", "test"]).default("development"),

	// Logging Configuration (Foundation Core System)
	logging: z.object({
		level: z.enum(["error", "warn", "info", "debug"]).default("info"),
		format: z.enum(["json", "text"]).default("text"),
		console: z.boolean().default(true),
		file: z.string().default(""),
		timestamp: z.boolean().default(true),
	}),

	// System Configuration
	system: z.object({
		hostname: z.string().default("localhost"),
		instanceId: z.string().default("foundation-default"),
	}),

	// Development Environment Detection
	development: z.object({
		debug: z.boolean().default(false),
		inNixShell: z.boolean().default(false),
		flakeDevShell: z.boolean().default(false),
	}),

	// Basic Project Configuration (for foundation config storage only)
	project: z.object({
		/**
		 * Configuration directory name following Claude Zen storage architecture.
		 *
		 * @description Defines the standard directory name used throughout the Claude Zen
		 * ecosystem for storing configuration files, databases, cache data, and other
		 * persistent application state. This creates a consistent storage pattern across
		 * all components and packages.
		 *
		 * **Default Value**: `.claude-zen`
		 *
		 * **Directory Structure Created**:
		 * ```
		 * .claude-zen/
		 * ├── config.json          # Main configuration file
		 * ├── data/                # Database storage directory
		 * │   ├── coordination.db  # Agent coordination database
		 * │   ├── kuzu-graph.db   # Graph database storage
		 * │   └── lancedb-vectors.db # Vector database storage
		 * ├── memory/              # Memory subsystem storage
		 * │   ├── sessions/        # Session storage directory
		 * │   ├── vectors/         # Vector memory storage
		 * │   └── debug.json       # Debug memory data
		 * ├── projects/            # Project management storage
		 * │   └── proj-{id}/       # Individual project directories
		 * └── copilot-token.json   # Authentication tokens
		 * ```
		 *
		 * **Usage Locations**:
		 * - Project root: `./claude-zen/` (when `storeInUserHome: false`)
		 * - User home: `~/.claude-zen/` (when `storeInUserHome: true`)
		 *
		 * @example
		 * ```typescript
		 * const config = await getConfig();
		 * const configPath = config.project.storeInUserHome
		 *   ? path.join(os.homedir(), config.project.configDir)
		 *   : path.join(process.cwd(), config.project.configDir);
		 * // Results in: "/home/user/.claude-zen" or "/project/.claude-zen"
		 * ```
		 *
		 * @see {@link storeInUserHome} for location selection logic
		 * @since 1.0.0
		 */
		configDir: z.string().default(".claude-zen"),

		/**
		 * Controls whether configuration and data are stored in user home or project directory.
		 *
		 * @description Determines the root location for the Claude Zen configuration directory,
		 * enabling either user-global or project-local storage patterns. This setting affects
		 * all storage operations including databases, memory, authentication tokens, and
		 * configuration files.
		 *
		 * **Default Value**: `true` (user home storage)
		 *
		 * **Storage Patterns**:
		 * - **`true` (User Home)**: `~/.claude-zen/` - Personal settings across projects
		 * - **`false` (Project Local)**: `./.claude-zen/` - Project-specific settings
		 *
		 * **Use Cases**:
		 * - **User Home** (`true`): Personal development, cross-project authentication,
		 *   shared settings, single-user environments
		 * - **Project Local** (`false`): Team projects, CI/CD environments,
		 *   project-specific configurations, containerized deployments
		 *
		 * @example
		 * ```typescript
		 * // Environment variable override:
		 * // ZEN_STORE_CONFIG_IN_USER_HOME=false
		 *
		 * const config = await getConfig();
		 * if (config.project.storeInUserHome) {
		 *   console.log('Using user-global storage: ~/.claude-zen/');
		 * } else {
		 *   console.log('Using project-local storage: ./.claude-zen/');
		 * }
		 * ```
		 *
		 * @see {@link configDir} for directory structure details
		 * @since 1.0.0
		 */
		storeInUserHome: z.boolean().default(true),
	}),

	// OpenTelemetry Configuration (foundation-only, basic settings)
	otel: z.object({
		enabled: z.boolean().default(false),
		useInternalCollector: z.boolean().default(true),
		internalCollectorEndpoint: z.string().default("http://localhost:4318"),
	}),
});

/**
 * Parses environment variable values into their appropriate types.
 * Handles boolean, number, and string conversions with intelligent type inference.
 *
 * @param value - The environment variable value to parse
 * @returns The parsed value as boolean, number, or string
 *
 * @example
 * ```typescript
 * parseEnvValue('true')  // returns boolean true
 * parseEnvValue('42')    // returns number 42
 * parseEnvValue('hello') // returns string 'hello'
 * ```
 */
function parseEnvValue(value: string | undefined): unknown {
	if (!value) {
		return undefined;
	}

	// Boolean parsing
	if (value.toLowerCase() === "true") {
		return true;
	}
	if (value.toLowerCase() === "false") {
		return false;
	}

	// Number parsing
	const num = Number(value);
	if (!Number.isNaN(num)) {
		return num;
	}

	// String value
	return value;
}

/**
 * Builds configuration object from environment variables.
 * Maps environment variables to configuration structure using parseEnvValue.
 *
 * @returns Configuration object built from current environment variables
 *
 * @remarks
 * Supported environment variables:
 * - NODE_ENV: Application environment (development/production/test)
 * - ZEN_LOG_LEVEL: Logging level (error/warn/info/debug)
 * - ZEN_LOG_FORMAT: Log format (json/text)
 * - HOSTNAME: System hostname
 * - IN_NIX_SHELL: Nix development shell detection
 * - ZEN_DEBUG_MODE: Debug mode flag
 *
 * **Claude Zen Storage Architecture Variables**:
 * - ZEN_PROJECT_CONFIG_DIR: Override default `.claude-zen` directory name
 * - ZEN_STORE_CONFIG_IN_USER_HOME: Control user vs project storage location
 */
function buildConfigFromEnv(): unknown {
	return {
		env: parseEnvValue(process.env.NODE_ENV),
		logging: {
			level: parseEnvValue(process.env.ZEN_LOG_LEVEL),
			format: parseEnvValue(process.env.ZEN_LOG_FORMAT),
			console: parseEnvValue(process.env.ZEN_LOG_CONSOLE),
			file: parseEnvValue(process.env.ZEN_LOG_FILE),
			timestamp: parseEnvValue(process.env.ZEN_LOG_TIMESTAMP),
		},
		system: {
			hostname: parseEnvValue(process.env.HOSTNAME),
			instanceId: parseEnvValue(process.env.ZEN_INSTANCE_ID),
		},
		development: {
			debug: parseEnvValue(process.env.ZEN_DEBUG_MODE),
			inNixShell: parseEnvValue(process.env.IN_NIX_SHELL),
			flakeDevShell: parseEnvValue(process.env.FLAKE_DEVSHELL),
		},
		project: {
			/**
			 * Environment override for Claude Zen configuration directory name.
			 *
			 * **Environment Variable**: `ZEN_PROJECT_CONFIG_DIR`
			 * **Default**: `.claude-zen`
			 *
			 * Allows customization of the standard directory name used throughout
			 * the Claude Zen storage architecture. When set, this overrides the
			 * default `.claude-zen` directory name across all storage operations.
			 *
			 * @example
			 * ```bash
			 * # Use custom directory name
			 * export ZEN_PROJECT_CONFIG_DIR=".my-claude-zen"
			 *
			 * # Results in: ./.my-claude-zen/ or ~/.my-claude-zen/
			 * ```
			 */
			configDir: parseEnvValue(process.env.ZEN_PROJECT_CONFIG_DIR),

			/**
			 * Environment override for Claude Zen storage location selection.
			 *
			 * **Environment Variable**: `ZEN_STORE_CONFIG_IN_USER_HOME`
			 * **Default**: `true` (user home storage)
			 *
			 * Controls whether the Claude Zen directory is created in the user's
			 * home directory or in the current project directory. This affects
			 * all storage operations throughout the system.
			 *
			 * @example
			 * ```bash
			 * # Force project-local storage
			 * export ZEN_STORE_CONFIG_IN_USER_HOME=false
			 *
			 * # Results in: ./.claude-zen/ (project-local)
			 *
			 * # Force user-global storage (default)
			 * export ZEN_STORE_CONFIG_IN_USER_HOME=true
			 *
			 * # Results in: ~/.claude-zen/ (user-global)
			 * ```
			 */
			storeInUserHome: parseEnvValue(process.env.ZEN_STORE_CONFIG_IN_USER_HOME),
		},
		otel: {
			enabled: parseEnvValue(process.env.ZEN_OTEL_ENABLED),
			useInternalCollector: parseEnvValue(
				process.env.ZEN_USE_INTERNAL_OTEL_COLLECTOR,
			),
			internalCollectorEndpoint: parseEnvValue(
				process.env.ZEN_INTERNAL_COLLECTOR_ENDPOINT,
			),
		},
	};
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Foundation configuration interface defining all core system settings.
 * Provides type-safe access to validated configuration values.
 *
 * @interface Config
 *
 * @example
 * ```typescript
 * const config: Config = getConfig();
 * console.log(config.env); // 'development' | 'production' | 'test'
 * console.log(config.logging.level); // 'error' | 'warn' | 'info' | 'debug'
 * ```
 */
export interface Config {
	env: string;
	logging: {
		level: string;
		format: string;
		console: boolean;
		file: string;
		timestamp: boolean;
	};
	system: {
		hostname: string;
		instanceId: string;
	};
	development: {
		debug: boolean;
		inNixShell: boolean;
		flakeDevShell: boolean;
	};
	project: {
		configDir: string;
		storeInUserHome: boolean;
	};
	otel: {
		enabled: boolean;
		useInternalCollector: boolean;
		internalCollectorEndpoint: string;
	};
}

// =============================================================================
// CONFIGURATION MANAGEMENT CLASS
// =============================================================================

/**
 * Foundation configuration management class.
 * Handles initialization, validation, and access to configuration values.
 *
 * @class FoundationConfig
 *
 * @example
 * ```typescript
 * const config = new FoundationConfig();
 * config.initialize();
 * const logLevel = config.get('logging.level');
 * ```
 */
export class FoundationConfig {
	private config: Config;
	private isInitialized = false;

	constructor() {
		// Initialize config with defaults, then apply environment overrides
		this.config = {} as Config; // Will be properly initialized in initialize()
	}

	/**
	 * Initializes the configuration by parsing and validating environment variables.
	 * Must be called before using any configuration values.
	 *
	 * @throws {Error} When configuration validation fails
	 */
	initialize(): void {
		try {
			// Parse and validate configuration from environment
			const envConfig = buildConfigFromEnv();
			this.config = configSchema.parse(envConfig);
			this.isInitialized = true;
			logger.info("Foundation configuration initialized successfully");
		} catch (error) {
			logger.error("Foundation configuration initialization failed:", error);
			throw new Error(
				`Configuration error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Gets a configuration value by key path.
	 * Supports nested key access using dot notation.
	 *
	 * @param key - The configuration key path (e.g., 'logging.level')
	 * @returns The configuration value
	 * @throws {Error} When the key is not found or configuration is not initialized
	 *
	 * @example
	 * ```typescript
	 * const level = config.get('logging.level'); // Gets nested value
	 * const env = config.get('env'); // Gets top-level value
	 * ```
	 */
	get(key: string): unknown {
		this.ensureInitialized();
		try {
			// Handle nested key access (e.g., 'logging.level')
			const keys = key.split(".");
			let value: Record<string, unknown> | unknown = this.config;

			for (const k of keys) {
				if (
					value &&
					typeof value === "object" &&
					value !== null &&
					k in value
				) {
					value = (value as Record<string, unknown>)[k];
				} else {
					throw new Error(`Key '${key}' not found`);
				}
			}

			return value;
		} catch (error) {
			logger.error(`Failed to get config key '${key}':`, error);
			throw new Error(`Configuration key '${key}' not found or invalid`);
		}
	}

	/**
	 * Gets the complete configuration object.
	 *
	 * @returns The complete validated configuration
	 * @throws {Error} When configuration is not initialized
	 */
	getAll(): JsonObject {
		this.ensureInitialized();
		return this.config as unknown as JsonObject;
	}

	/**
	 * Validates the current environment variables against the schema.
	 *
	 * @returns True if validation passes, false otherwise
	 */
	validate(): boolean {
		try {
			const envConfig = buildConfigFromEnv();
			configSchema.parse(envConfig);
			return true;
		} catch (error) {
			logger.error("Configuration validation failed:", error);
			return false;
		}
	}

	private ensureInitialized(): void {
		if (!this.isInitialized) {
			throw new Error(
				"Configuration not initialized. Call initialize() first.",
			);
		}
	}
}

// =============================================================================
// GLOBAL CONFIGURATION INSTANCE
// =============================================================================

const globalConfig = new FoundationConfig();

// Auto-initialize
globalConfig.initialize();

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Gets the global configuration instance.
 * Auto-initializes on first access with environment variables.
 *
 * @returns The validated foundation configuration
 *
 * @example
 * ```typescript
 * const config = getConfig();
 * console.log(config.logging.level);
 * ```
 */
export function getConfig(): Config {
	return globalConfig.getAll() as unknown as Config;
}

/**
 * Validates the current configuration against the schema.
 *
 * @returns True if configuration is valid, false otherwise
 */
export function validateConfig(): boolean {
	return globalConfig.validate();
}

/**
 * Reloads configuration from environment variables.
 * Useful when environment changes during runtime.
 */
export function reloadConfig(): void {
	globalConfig.initialize();
}

/**
 * Checks if debug mode is enabled.
 *
 * @returns True if debug mode is active
 */
export function isDebugMode(): boolean {
	return globalConfig.get("development.debug") as boolean;
}

// FORCING EXPORTS - Force using central config instead of process.env
export const config = getConfig;
export const env = getConfig;
export const settings = getConfig;
export const validate = validateConfig;
export const reload = reloadConfig;
export const isDebug = isDebugMode;
export const isDevelopment = () => getConfig().env === "development";
export const isProduction = () => getConfig().env === "production";
export const isTest = () => getConfig().env === "test";

// FORCING PATTERN - Replace direct process.env access
export const getEnv = (key: string, defaultValue?: string): string =>
	process.env[key] || defaultValue || "";

export const requireEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Required environment variable ${key} is not set`);
	}
	return value;
};

// FORCING PATTERN - Replace console.log with configured logging
export const shouldLog = (
	level: "error" | "warn" | "info" | "debug",
): boolean => {
	const configLevel = getConfig().logging.level;
	const levels = { error: 0, warn: 1, info: 2, debug: 3 };
	return levels[level] <= levels[configLevel as keyof typeof levels];
};

export const configHelpers = {
	get: (key: string) => globalConfig.get(key),
	getAll: () => globalConfig.getAll(),
	validate: validateConfig,
	reload: reloadConfig,
	isDebug: isDebugMode,
	// Forcing patterns
	config,
	env,
	settings,
	isDevelopment,
	isProduction,
	isTest,
	getEnv,
	requireEnv,
	shouldLog,
};

/**
 * Placeholder for neural config - should be implemented in neural packages
 */
export function getNeuralConfig(): Record<string, unknown> {
	// Neural configuration is handled by the intelligence package
	// This function provides basic defaults for neural system integration
	return {
		enabled: false,
		fallbackMode: true,
		timeout: 30000,
		retries: 3,
		models: {
			default: "claude-3",
			reasoning: "o3-mini",
			fast: "gpt-4",
		},
	};
}

export default globalConfig;
