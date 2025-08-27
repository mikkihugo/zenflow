/**
 * Web Interface Module - Main exports for web dashboard interface.
 *
 * Provides organized exports following foundation package structure
 * with core functionality, infrastructure, and configuration.
 */
export * from './core';
export { DatabaseProvider } from '@claude-zen/database';
export { EventBus } from '@claude-zen/event-system';
export declare function getDatabaseAccess(): Promise<any>;
export declare const infrastructureSystem: {
    database: any;
    events: any;
};
//# sourceMappingURL=index.d.ts.map