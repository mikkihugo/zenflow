/**
 * Default Repository Configuration with Advanced Kanban Flow
 *
 * This configuration is automatically applied when adding a new repository
 * to ensure all ML and intelligent features are enabled by default.
 */
import type { ClaudeZenCoreConfig } from '../core/init.ts';
export interface RepoConfig extends ClaudeZenCoreConfig {
    repoPath: string;
    repoName: string;
    autoDiscoveryEnabled: boolean;
    dsyIntegration: {
        enabled: boolean;
        swarmCoordination: boolean;
        neuralEnhancement: boolean;
        automaticOptimization: boolean;
        crossSessionLearning: boolean;
    };
    aguiConfig: {
        enabled: boolean;
        workflowGates: boolean;
        decisionLogging: boolean;
        escalationChains: boolean;
        timeoutHandling: boolean;
    };
    flowIntegration: {
        enableRealTimeOptimization: boolean;
        monitoringInterval: number;
        performanceThresholds: {
            minThroughput: number;
            maxLeadTime: number;
            minEfficiency: number;
            maxBottleneckDuration: number;
            resourceUtilizationTarget: number;
            qualityGateThreshold: number;
        };
    };
    autoDiscovery: {
        enabled: boolean;
        confidenceThreshold: number;
        autoCreateSwarms: boolean;
        importDocuments: boolean;
        learningEnabled: boolean;
    };
    knowledgeSystems: {
        factEnabled: boolean;
        ragEnabled: boolean;
        wasmAcceleration: boolean;
        externalMCPs: string[];
        cacheEnabled: boolean;
    };
}
/**
 * Default configuration for new repositories - All advanced features enabled
 */
export declare const defaultRepoConfig: Omit<RepoConfig, 'repoPath' | 'repoName'>;
/**
 * Create repository configuration with defaults
 */
export declare function createRepoConfig(repoPath: string, overrides?: Partial<RepoConfig>): RepoConfig;
/**
 * Validate repository configuration
 */
export declare function validateRepoConfig(config: RepoConfig): {
    valid: boolean;
    errors: string[];
};
/**
 * Log configuration status
 */
export declare function logRepoConfigStatus(config: RepoConfig): void;
export default defaultRepoConfig;
//# sourceMappingURL=default-repo-config.d.ts.map