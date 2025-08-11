/**
 * @file Claude Code Flow - Main Entry Point.
 *
 * Central export hub for all system components following clean architecture principles.
 * Organized by domain with clear separation of concerns.
 */
export * as Config from './config';
export * as Core from './core/index.ts';
export * as Types from './types/agent-types.ts';
export * as Utils from './utils/index.ts';
export * as Coordination from './coordination/index.ts';
export * as SPARC from './coordination/swarm/sparc/index.ts';
export * as Database from './database/index.ts';
export * as Memory from './memory/index.ts';
export * as Neural from './neural/index.ts';
export * as Optimization from './optimization/index.ts';
export * as Workflows from './workflows/index.ts';
export * as Interfaces from './interfaces/index.ts';
export * as Bindings from './bindings/index.ts';
export * as Integration from './integration/index.ts';
/**
 * @file Claude-Zen Integrated System
 * Unified entry point for all claude-zen components.
 */
export * from './coordination/public-api.ts';
export * from './coordination/swarm/mcp/mcp-server.ts';
export * from './coordination/swarm/mcp/mcp-tool-registry.ts';
export type { MCPRequest, MCPResponse, MCPTool, } from './coordination/swarm/mcp/types.ts';
export * from './core/logger.ts';
export * from './interfaces/terminal';
export { NeuralAgent, } from './neural/agents/neural-agent.ts';
export * from './neural/neural-bridge.ts';
export * as SharedTypes from './types/index.ts';
/**
 * Claude-Zen integrated system configuration.
 *
 * @example
 */
export interface ClaudeZenConfig {
    mcp: {
        http: {
            enabled: boolean;
            port?: number;
            host?: string;
        };
        stdio: {
            enabled: boolean;
        };
    };
    swarm: {
        maxAgents: number;
        topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
        strategy: 'balanced' | 'specialized' | 'adaptive' | 'parallel';
    };
    neural: {
        enabled: boolean;
        wasmPath?: string;
        gpuAcceleration?: boolean;
    };
    sparc: {
        enabled: boolean;
        aiAssisted: boolean;
        templateLibrary: string;
    };
    persistence: {
        provider: 'sqlite' | 'postgresql' | 'memory';
        connectionString?: string;
    };
    plugins: {
        paths: string[];
        autoLoad: boolean;
    };
}
/**
 * Default configuration for Claude-Zen
 * HTTP MCP enabled for Claude Desktop integration
 * stdio MCP dormant - only for temporary Claude Code coordination when needed.
 * Project swarms use direct real agent protocols (Raft, message passing, etc.).
 */
export declare const defaultConfig: ClaudeZenConfig;
/**
 * Initialize Claude-Zen integrated system.
 *
 * @param config
 * @example
 */
export declare function initializeClaudeZen(config?: Partial<ClaudeZenConfig>): Promise<void>;
/**
 * Shutdown Claude-Zen system gracefully.
 *
 * @example
 */
export declare function shutdownClaudeZen(): Promise<void>;
/**
 * System health check.
 *
 * @returns Promise resolving to system health status.
 * @example
 */
export declare function healthCheck(): Promise<{
    status: string;
    timestamp: string;
    components: {
        core: string;
        memory: string;
        neural: string;
        database: string;
        coordination: string;
        interfaces: string;
    };
}>;
/**
 * Get system version and build info.
 *
 * @returns System version information.
 * @example
 */
export declare function getVersion(): {
    version: string;
    build: string;
    timestamp: string;
};
declare const _default: {
    initializeClaudeZen: typeof initializeClaudeZen;
    shutdownClaudeZen: typeof shutdownClaudeZen;
    healthCheck: typeof healthCheck;
    getVersion: typeof getVersion;
    Core: any;
    Memory: any;
    Neural: any;
    Database: any;
    Coordination: any;
    SPARC: any;
    Interfaces: any;
    Integration: any;
    Bindings: any;
    Workflows: any;
    Optimization: any;
    Utils: any;
    Types: any;
    Config: any;
};
export default _default;
//# sourceMappingURL=index.d.ts.map