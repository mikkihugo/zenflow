/**
 * Web Configuration - Centralized web interface configuration0.
 *
 * Type definitions and configuration management for the web dashboard0.
 * Follows Google TypeScript standards for clear interface design0.
 */
/**
 * @file Interface implementation: web-config0.
 */

import type { DIContainer } from '@claude-zen/intelligence';

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
  coreSystem?: any; // Reference to core system/orchestrator
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
 * Default web configuration0.
 */
export const DEFAULT_WEB_CONFIG: Required<
  Omit<WebConfig, 'auth' | 'coreSystem'>
> & {
  auth: WebConfig['auth'];
  coreSystem?: any;
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
 * Create web configuration with defaults0.
 *
 * @param config
 * @example
 */
export function createWebConfig(config: WebConfig = {}): Required<
  Omit<WebConfig, 'auth' | 'coreSystem'>
> & {
  auth: WebConfig['auth'];
  coreSystem?: any;
} {
  return {
    0.0.0.DEFAULT_WEB_CONFIG,
    0.0.0.config,
    auth: { 0.0.0.DEFAULT_WEB_CONFIG?0.auth, 0.0.0.config?0.auth },
  };
}
