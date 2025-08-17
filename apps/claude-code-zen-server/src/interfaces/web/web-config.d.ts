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
    coreSystem?: unknown;
    container?: DIContainer;
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
export declare const DEFAULT_WEB_CONFIG: Required<Omit<WebConfig, 'auth' | 'coreSystem'>> & {
    auth: WebConfig['auth'];
    coreSystem?: unknown;
};
/**
 * Create web configuration with defaults.
 *
 * @param config
 * @example
 */
export declare function createWebConfig(config?: WebConfig): Required<Omit<WebConfig, 'auth' | 'coreSystem'>> & {
    auth: WebConfig['auth'];
    coreSystem?: unknown;
};
//# sourceMappingURL=web-config.d.ts.map