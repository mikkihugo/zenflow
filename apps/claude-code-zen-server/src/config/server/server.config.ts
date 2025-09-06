/**
 * Web Configuration - Centralized web interface configuration.
 *
 * Type definitions and configuration management for the web dashboard.
 * Follows Google TypeScript standards for clear interface design.
 */
/**
 * @file Interface implementation:web-config.
 */

import type { Container } from '@claude-zen/foundation';

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
  container?: Container;
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
  Omit<WebConfig, 'auth' | 'coreSystem' | 'container'>
> & {
  auth: WebConfig['auth'];
  coreSystem?: CoreSystemInterface;
  container?: Container;
} = {
  port: 3000,
  host: '0.0.0.0',
  daemon: false,
  staticDir: '',
  apiPrefix: '/api',
  cors: true,
  auth: { enabled: false },
  theme: 'dark',
  realTime: true,
};

/**
 * Create web configuration with defaults.
 *
 * @param config
 * @example
 */
export function createWebConfig(config: WebConfig = {}): Required<
  Omit<WebConfig, 'auth' | 'coreSystem' | 'container'>
> & {
  auth: WebConfig['auth'];
  coreSystem?: CoreSystemInterface;
  container?: Container;
} {
  return {
    ...DEFAULT_WEB_CONFIG,
    ...config,
    auth: {
      enabled: DEFAULT_WEB_CONFIG?.auth?.enabled ?? false,
      ...DEFAULT_WEB_CONFIG?.auth,
      ...config?.auth,
    },
  };
}
