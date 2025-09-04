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
  EMERGENCY_SHUTDOWN_TOKEN: string;
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

function load(): AppEnv {
  const {
    NODE_ENV,
    PORT,
    HOST,
    EMERGENCY_SHUTDOWN_TOKEN
  } = process.env;

  return {
    NODE_ENV: coerceNodeEnv(NODE_ENV),
    PORT: parsePort(PORT),
    HOST: HOST || '0.0.0.0',
    EMERGENCY_SHUTDOWN_TOKEN: EMERGENCY_SHUTDOWN_TOKEN || 'emergency-shutdown-2025'
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

// Diagnostic log on first import (dev only)
if (isDev) {
  logger.debug('Loaded environment snapshot', {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    HOST: env.HOST
  });
}