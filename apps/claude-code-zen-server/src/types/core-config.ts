/**
 * @fileoverview Core Configuration Types - Main App Configuration
 *
 * Central configuration type definitions that integrate with foundation package.
 * Uses foundation SharedConfig as the base and extends with app-specific config.
 */

/**
 * Claude Zen Core Configuration - extends foundation Config
 */
export interface ClaudeZenCoreConfig {
  // Repository-specific settings
  repoPath?: string;
  repoName?: string;

  // Server configuration
  port?: number;
  host?: string;

  // Feature flags
  enableAdvancedKanbanFlow?: boolean;
  enableMLOptimization?: boolean;
  enableBottleneckDetection?: boolean;
  enablePredictiveAnalytics?: boolean;
  enableRealTimeMonitoring?: boolean;
  enableIntelligentResourceManagement?: boolean;
  enableAGUIGates?: boolean;
  enableCrossLevelOptimization?: boolean;

  // Performance settings
  maxParallelStreams?:
    | number
    | {
        portfolio: number;
        program: number;
        swarm: number;
      };
  mlOptimizationLevel?: number;
  flowTopology?: string;

  // Logging configuration
  logLevel?: 'debug'' | ''info'' | ''warn'' | ''error');
}

/**
 * Repository Configuration Interface
 */
export interface RepoConfig extends ClaudeZenCoreConfig {
  repoPath: string;
  repoName: string;
}

/**
 * System Configuration Interface
 */
export interface SystemConfig extends ClaudeZenCoreConfig {
  systemInfo: {
    memory: number;
    cpus: number;
    platform: string;
  };
  capabilities: {
    hasGPU: boolean;
    hasDocker: boolean;
    hasKubernetes: boolean;
  };
}

// Default configuration
export const DEFAULT_CORE_CONFIG: ClaudeZenCoreConfig = {
  port: 3000,
  host: 'localhost',
  enableAdvancedKanbanFlow: true,
  enableMLOptimization: true,
  enableBottleneckDetection: true,
  enablePredictiveAnalytics: true,
  enableRealTimeMonitoring: true,
  enableIntelligentResourceManagement: true,
  enableAGUIGates: true,
  enableCrossLevelOptimization: true,
  maxParallelStreams: 4,
  mlOptimizationLevel: 1,
  flowTopology: 'hierarchical',
  logLevel: 'info',
};
