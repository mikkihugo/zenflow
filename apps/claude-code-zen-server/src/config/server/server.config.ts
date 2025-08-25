/**
 * Web Configuration - Centralized web interface configuration.
 *
 * Type definitions and configuration management for the web dashboard.
 * Follows Google TypeScript standards for clear interface design.
 */
/**
 * @file Interface implementation: web-config.
 */

import type { createContainer } from '@claude-zen/foundation';

export interface CoreSystemInterface {
  initialize?: () => Promise<void>;
  shutdown?: () => Promise<void>;
  getStatus?: () => unknown;
}

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
  coreSystem?: CoreSystemInterface;
  container?: ReturnType<typeof createContainer>;
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
  coreSystem?: CoreSystemInterface;
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
  container: undefined,
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
  coreSystem?: CoreSystemInterface;
} {
  return {
    ...DEFAULT_WEB_CONFIG,
    ...config,
    auth: {
      ...DEFAULT_WEB_CONFIG?.auth,
      ...config?.auth,
    },
  };
}
