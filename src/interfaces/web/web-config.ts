/**
 * Web Configuration - Centralized web interface configuration.
 *
 * Type definitions and configuration management for the web dashboard.
 * Follows Google TypeScript standards for clear interface design.
 */
/**
 * @file Interface implementation: web-config.
 */

import type { DIContainer } from '../../config/di-container';

export interface WebConfig {
  port?: number;
  host?: string;
  daemon?: boolean;
  staticDir?: string;
  apiPrefix?: string;
  cors?: boolean;
  auth?: {
    enabled: boolean;
    secret?: string;
  };
  theme?: 'dark' | 'light';
  realTime?: boolean;
  coreSystem?: unknown; // Reference to core system/orchestrator
  container?: DIContainer; // DI container for enhanced architecture
}

export interface WebSession {
  id: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
  preferences: {
    theme: 'dark' | 'light';
    refreshInterval: number;
    notifications: boolean;
  };
}

/**
 * Default web configuration.
 */
export const DEFAULT_WEB_CONFIG: Required<
  Omit<WebConfig, 'auth' | 'coreSystem'>
> & {
  auth: WebConfig['auth'];
  coreSystem?: unknown;
} = {
  port: 3456,
  host: '0.0.0.0',
  daemon: false,
  staticDir: '',
  apiPrefix: '/api',
  cors: true,
  auth: { enabled: false },
  theme: 'dark',
  realTime: true,
  coreSystem: undefined,
};

/**
 * Create web configuration with defaults.
 *
 * @param config
 * @example
 */
export function createWebConfig(config: WebConfig = {}): Required<
  Omit<WebConfig, 'auth' | 'coreSystem'>
> & {
  auth: WebConfig['auth'];
  coreSystem?: unknown;
} {
  return {
    ...DEFAULT_WEB_CONFIG,
    ...config,
    auth: { ...DEFAULT_WEB_CONFIG?.auth, ...config?.auth },
  };
}
