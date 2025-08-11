/**
 * Interfaces Module - Enhanced with Advanced CLI.
 *
 * Unified export for all interface types:
 * - Terminal: Unified CLI/TUI interface (React/Ink based)
 * - CLI: Advanced AI-powered CLI with intelligent project management
 * - Web: Web dashboard components
 * - MCP: Claude Desktop remote interface components
 * - API: REST API interface.
 */
/**
 * @file Interfaces module exports.
 */
export * from './api';
export * from './cli';
export * from './mcp';
export * from './terminal';
export * from './web';
export interface InterfaceConfig {
    mode: 'terminal' | 'web' | 'mcp' | 'api' | 'advanced-cli';
    theme?: 'dark' | 'light';
    verbose?: boolean;
    port?: number;
    serverUrl?: string;
    terminalMode?: 'cli' | 'tui' | 'advanced';
    aiAssistance?: boolean;
    realTimeMonitoring?: boolean;
    intelligentScaffolding?: boolean;
}
export declare const InterfaceUtils: {
    detectMode(): "terminal" | "web" | "mcp" | "api" | "advanced-cli";
    detectTerminalMode(): "cli" | "tui" | "advanced";
    validateConfig(config: InterfaceConfig): boolean;
    isAdvancedCLIEnabled(): boolean;
};
export declare const INTERFACE_CAPABILITIES: {
    advancedCLI: boolean;
    aiAssistedDevelopment: boolean;
    realTimeMonitoring: boolean;
    intelligentScaffolding: boolean;
    swarmCoordination: boolean;
    neuralNetworkOptimization: boolean;
    quantumInspiredAlgorithms: boolean;
    enterpriseIntegration: boolean;
};
declare const _default: {
    InterfaceUtils: {
        detectMode(): "terminal" | "web" | "mcp" | "api" | "advanced-cli";
        detectTerminalMode(): "cli" | "tui" | "advanced";
        validateConfig(config: InterfaceConfig): boolean;
        isAdvancedCLIEnabled(): boolean;
    };
    INTERFACE_CAPABILITIES: {
        advancedCLI: boolean;
        aiAssistedDevelopment: boolean;
        realTimeMonitoring: boolean;
        intelligentScaffolding: boolean;
        swarmCoordination: boolean;
        neuralNetworkOptimization: boolean;
        quantumInspiredAlgorithms: boolean;
        enterpriseIntegration: boolean;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map