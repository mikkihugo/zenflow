/**
 * Web Configuration Module - Configuration management for web interface.
 *
 * Provides centralized configuration loading, validation,
 * and type-safe access to web server settings.
 */

// Configuration types and functions
export type { WebConfig, WebSession } from './server.config';
export { createWebConfig, DEFAULT_WEB_CONFIG } from './server.config';