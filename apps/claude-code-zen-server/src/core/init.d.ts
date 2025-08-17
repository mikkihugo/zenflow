/**
 * @file Core System Initialization
 * Provides basic initialization for the system.
 */
export { createLogger, Logger, LogLevel } from './logger';
export interface ClaudeZenCoreConfig {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    port?: number;
    host?: string;
    enableAdvancedKanbanFlow: boolean;
    enableMLOptimization: boolean;
    enableBottleneckDetection: boolean;
    enablePredictiveAnalytics: boolean;
    enableRealTimeMonitoring: boolean;
    enableIntelligentResourceManagement: boolean;
    enableAGUIGates: boolean;
    enableCrossLevelOptimization: boolean;
    flowTopology: 'hierarchical' | 'mesh' | 'star' | 'ring';
    maxParallelStreams: {
        portfolio: number;
        program: number;
        swarm: number;
    };
    mlOptimizationLevel: 'basic' | 'advanced' | 'enterprise';
}
export declare const defaultCoreConfig: ClaudeZenCoreConfig;
/**
 * Initialize the core system with Advanced Kanban Flow enabled by default.
 *
 * @param config - Optional configuration overrides
 * @example
 * await initializeCore(); // All advanced features enabled by default
 */
export declare function initializeCore(config?: Partial<ClaudeZenCoreConfig>): Promise<void>;
//# sourceMappingURL=init.d.ts.map