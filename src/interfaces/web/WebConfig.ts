/**
 * Web Configuration - Centralized web interface configuration
 *
 * Type definitions and configuration management for the web dashboard.
 * Follows Google TypeScript standards for clear interface design.
 */

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
 * Default web configuration
 */
export const DEFAULT_WEB_CONFIG: Required<Omit<WebConfig, 'auth'>> & { auth: WebConfig['auth'] } = {
  port: 3456,
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
 * Create web configuration with defaults
 */
export function createWebConfig(
  config: WebConfig = {}
): Required<Omit<WebConfig, 'auth'>> & { auth: WebConfig['auth'] } {
  return {
    ...DEFAULT_WEB_CONFIG,
    ...config,
    auth: { ...DEFAULT_WEB_CONFIG.auth, ...config.auth },
  };
}
