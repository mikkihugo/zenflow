/**
 * Web Configuration - Centralized web interface configuration.
 *
 * Type definitions and configuration management for the web dashboard.
 * Follows Google TypeScript standards for clear interface design.
 */
/**
 * @file Interface implementation: web-config.
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
export declare const DEFAULT_WEB_CONFIG: Required<Omit<WebConfig, 'auth' | 'coreSystem' | 'container'>> & {
    auth: WebConfig['auth'];
    coreSystem?: CoreSystemInterface;
    container?: Container;
};
/**
 * Create web configuration with defaults.
 *
 * @param config
 * @example
 */
export declare function createWebConfig(config?: WebConfig): Required<Omit<WebConfig, 'auth' | 'coreSystem' | 'container'>> & {
    auth: WebConfig['auth'];
    coreSystem?: CoreSystemInterface;
    container?: Container;
};
//# sourceMappingURL=server.config.d.ts.map