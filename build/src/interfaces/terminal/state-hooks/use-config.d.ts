/**
 * Configuration State Hook.
 *
 * React hook for managing terminal interface configuration state.
 * Note: This is a React hook, NOT a Claude Code hook (which belongs in templates/).
 */
/**
 * @file Interface implementation: use-config.
 */
export interface TerminalConfig {
    theme: 'dark' | 'light';
    refreshInterval: number;
    verbose: boolean;
    showAnimations: boolean;
    swarmConfig: {
        defaultTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
        maxAgents: number;
        autoRefresh: boolean;
        showAdvancedMetrics: boolean;
    };
    ui: {
        showBorders: boolean;
        centerAlign: boolean;
        compactMode: boolean;
    };
}
export interface UseConfigReturn {
    data: TerminalConfig;
    isLoading: boolean;
    error?: Error;
    updateConfig: (updates: Partial<TerminalConfig>) => Promise<void>;
    updateUIConfig: (updates: Partial<TerminalConfig['ui']>) => Promise<void>;
    updateSwarmConfig: (updates: Partial<TerminalConfig['swarmConfig']>) => Promise<void>;
    resetConfig: () => Promise<void>;
}
/**
 * Configuration React Hook.
 *
 * Provides reactive configuration management for terminal interface components.
 */
export declare const useConfig: () => UseConfigReturn;
export default useConfig;
//# sourceMappingURL=use-config.d.ts.map