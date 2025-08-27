/**
 * Interfaces Module - Enhanced with Advanced CLI.
 *
 * Unified export for all interface types:
 * - Terminal: Unified CLI interface (React/Ink based)
 * - CLI: Advanced AI-powered CLI with intelligent project management
 * - Web: Web dashboard components
 * - MCP: Claude Desktop remote interface components
 * - API: REST API interface
 */
export interface InterfaceConfig {
    mode: 'terminal' | 'web' | 'mcp' | 'api' | 'advanced-cli';
    theme?: 'dark' | 'light';
    verbose?: boolean;
    port?: number;
    serverUrl?: string;
    terminalMode?: 'basic' | 'advanced';
    aiAssistance?: boolean;
    realTimeMonitoring?: boolean;
    intelligentScaffolding?: boolean;
}
export declare const interfaceUtils: {
    detectMode(): "terminal" | "web" | "mcp" | "api" | "advanced-cli";
    detectTerminalMode(): "basic" | "advanced";
    validateConfig(config: InterfaceConfig): boolean;
    isAdvancedCLIEnabled(): boolean;
};
export declare const interfaceCapabilities: {
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
    interfaceUtils: {
        detectMode(): "terminal" | "web" | "mcp" | "api" | "advanced-cli";
        detectTerminalMode(): "basic" | "advanced";
        validateConfig(config: InterfaceConfig): boolean;
        isAdvancedCLIEnabled(): boolean;
    };
    interfaceCapabilities: {
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