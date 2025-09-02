// Web config shim for web services
// Re-export the canonical server config to avoid duplication
export type { WebConfig, WebSession } from '../../config/server/server.config';
export { createWebConfig, DEFAULT_WEB_CONFIG } from '../../config/server/server.config';
