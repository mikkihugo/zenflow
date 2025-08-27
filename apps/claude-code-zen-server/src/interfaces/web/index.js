/**
 * Web Interface Module - Main exports for web dashboard interface.
 *
 * Provides organized exports following foundation package structure
 * with core functionality, infrastructure, and configuration.
 */
// Core web functionality
export * from './core';
// Direct package imports - no facades
export { DatabaseProvider } from '@claude-zen/database';
export { EventBus } from '@claude-zen/event-system';
// Create database access utility function
export async function getDatabaseAccess() {
    return new DatabaseProvider();
}
// Create infrastructure system utility
export const infrastructureSystem = {
    database: new DatabaseProvider(),
    events: new EventBus()
};
// TODO: Add configuration module when needed
// export * from './configuration';
