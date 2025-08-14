export const DEFAULT_WEB_CONFIG = {
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
export function createWebConfig(config = {}) {
    return {
        ...DEFAULT_WEB_CONFIG,
        ...config,
        auth: { ...DEFAULT_WEB_CONFIG?.auth, ...config?.auth },
    };
}
//# sourceMappingURL=web-config.js.map