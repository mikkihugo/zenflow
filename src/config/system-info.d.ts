/**
 * System Information and Memory Detection Utilities
 *
 * Provides reliable system memory detection and capacity reporting
 * for optimal adaptive configuration.
 */
export interface SystemInfo {
    totalMemoryGB: number;
    totalMemoryMB: number;
    availableMemoryGB: number;
    platform: string;
    cpuCores: number;
    recommendedConfig: {
        conservative: boolean;
        maxPortfolioStreams: number;
        maxProgramStreams: number;
        maxSwarmStreams: number;
    };
}
/**
 * Safely detect system memory with fallbacks
 */
export declare function detectSystemMemory(): number;
/**
 * Get comprehensive system information
 */
export declare function getSystemInfo(): SystemInfo;
/**
 * Log system information for debugging
 */
export declare function logSystemInfo(): void;
/**
 * Validate if a configuration is safe for the detected system
 */
export declare function validateConfigForSystem(config: {
    portfolio: number;
    program: number;
    swarm: number;
}): {
    safe: boolean;
    warnings: string[];
    systemInfo: SystemInfo;
};
/**
 * Get memory-appropriate starting configuration
 */
export declare function getStartupConfig(): {
    portfolio: number;
    program: number;
    swarm: number;
    rationale: string;
};
declare const _default: {
    detectSystemMemory: typeof detectSystemMemory;
    getSystemInfo: typeof getSystemInfo;
    logSystemInfo: typeof logSystemInfo;
    validateConfigForSystem: typeof validateConfigForSystem;
    getStartupConfig: typeof getStartupConfig;
};
export default _default;
//# sourceMappingURL=system-info.d.ts.map