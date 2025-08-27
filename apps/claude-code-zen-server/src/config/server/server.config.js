/**
 * Web Configuration - Centralized web interface configuration.
 *
 * Type definitions and configuration management for the web dashboard.
 * Follows Google TypeScript standards for clear interface design.
 */
/**
 * @file Interface implementation: web-config.
 */
/**
 * Default web configuration.
 */
export const DEFAULT_WEB_CONFIG = {
    port: 3000,
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
export function createWebConfig(config = {}) {
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
