/* eslint-disable no-process-env */
/**
 * Environment Accessor (Pilot)
 * Centralizes all process.env reads into a single validated, typed module.
 * Phase 2: Replaces scattered process.env usages to satisfy lint rule no-process-env.
 * Only import from application code; do not read process.env elsewhere.
 */
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('env');

export type RuntimeEnvironment = 'development' | 'production' | 'test';

export interface AppEnv {
  NODE_ENV: RuntimeEnvironment;
  PORT: number;
  HOST: string;
  CLAUDE_ZEN_PROJECT: string;
  EMERGENCY_SHUTDOWN_TOKEN: string;
  // Interface / mode flags
  CLAUDE_CODE_MCP: boolean;
  CLAUDE_FLOW_WEB: boolean;
  CLAUDE_FLOW_API: boolean;
  CLAUDE_ADVANCED_CLI: boolean;
  // Cross-cutting config
  CORS_ALLOWED_ORIGINS?: string;
  APP_VERSION: string;
}

function coerceNodeEnv(value: string | undefined): RuntimeEnvironment {
  if (value === 'production' || value === 'test' || value === 'development') return value;
  if (value) {
    logger.warn(`Unknown NODE_ENV "${value}" - defaulting to "development"`);
  }
  return 'development';
}

function parsePort(raw: string | undefined): number {
  if (!raw) return 3000;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0 || n > 65535) {
    logger.warn(`Invalid PORT "${raw}" - falling back to 3000`);
    return 3000;
  }
  return n;
}

function flag(value: string | undefined): boolean {
  if (!value) return false;
  return value === '1' || value.toLowerCase() === 'true' || value === 'enabled';
}

function load(): AppEnv {
  const {
    NODE_ENV,
    PORT,
    HOST,
    EMERGENCY_SHUTDOWN_TOKEN,
    CLAUDE_ZEN_PROJECT,
    CLAUDE_CODE_MCP,
    CLAUDE_FLOW_WEB,
    CLAUDE_FLOW_API,
    CLAUDE_ADVANCED_CLI,
    CORS_ALLOWED_ORIGINS,
    npm_package_version: NPM_PACKAGE_VERSION
  } = process.env;

  return {
    NODE_ENV: coerceNodeEnv(NODE_ENV),
    PORT: parsePort(PORT),
    HOST: HOST || '0.0.0.0',
    CLAUDE_ZEN_PROJECT: CLAUDE_ZEN_PROJECT || process.cwd(),
    EMERGENCY_SHUTDOWN_TOKEN: EMERGENCY_SHUTDOWN_TOKEN || 'emergency-shutdown-2025',
    CLAUDE_CODE_MCP: flag(CLAUDE_CODE_MCP),
    CLAUDE_FLOW_WEB: flag(CLAUDE_FLOW_WEB),
    CLAUDE_FLOW_API: flag(CLAUDE_FLOW_API),
    CLAUDE_ADVANCED_CLI: flag(CLAUDE_ADVANCED_CLI),
    CORS_ALLOWED_ORIGINS: CORS_ALLOWED_ORIGINS || '',
    APP_VERSION: NPM_PACKAGE_VERSION || '1.0.0'
  };
}

// Eager snapshot at module load (immutable for runtime)
export const env: AppEnv = load();

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Utility accessor (future: could add dynamic refresh / schema validation)
export function getEnv(): AppEnv {
  return env;
}

// Narrow helpers for frequent values
export function getPort(): number {
  return env.PORT;
}

export function getHost(): string {
  return env.HOST;
}

export function getEmergencyShutdownToken(): string {
  return env.EMERGENCY_SHUTDOWN_TOKEN;
}

export function getProjectPath(): string {
  return env.CLAUDE_ZEN_PROJECT;
}

export function getAppVersion(): string {
  return env.APP_VERSION;
}

export function getCorsAllowedOriginsRaw(): string | undefined {
  return env.CORS_ALLOWED_ORIGINS;
}

// Flag helpers
export const isMcpEnabled = (): boolean => env.CLAUDE_CODE_MCP;
export const isWebInterfaceEnabled = (): boolean => env.CLAUDE_FLOW_WEB;
export const isApiInterfaceEnabled = (): boolean => env.CLAUDE_FLOW_API;
export const isAdvancedCliFlagEnabled = (): boolean => env.CLAUDE_ADVANCED_CLI;

// Diagnostic log on first import (dev only)
if (isDev) {
  logger.debug('Loaded environment snapshot', {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    HOST: env.HOST,
    APP_VERSION: env.APP_VERSION,
    FLAGS: {
      MCP: env.CLAUDE_CODE_MCP,
      WEB: env.CLAUDE_FLOW_WEB,
      API: env.CLAUDE_FLOW_API,
      ADV_CLI: env.CLAUDE_ADVANCED_CLI
    }
  });
}
