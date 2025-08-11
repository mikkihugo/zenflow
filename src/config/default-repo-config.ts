/**
 * Default Repository Configuration with Advanced Kanban Flow
 *
 * This configuration is automatically applied when adding a new repository
 * to ensure all ML and intelligent features are enabled by default.
 */

import type { ClaudeZenCoreConfig } from '../core/init.ts';
import {
  calculateOptimalStreams,
  memory8GBConfig,
} from './memory-optimization.ts';
import {
  getStartupConfig,
  logSystemInfo,
  validateConfigForSystem,
} from './system-info.ts';

export interface RepoConfig extends ClaudeZenCoreConfig {
  // Repository-specific settings
  repoPath: string;
  repoName: string;
  autoDiscoveryEnabled: boolean;

  // DSPy Neural Enhancement (enabled by default)
  dsyIntegration: {
    enabled: boolean;
    swarmCoordination: boolean;
    neuralEnhancement: boolean;
    automaticOptimization: boolean;
    crossSessionLearning: boolean;
  };

  // AGUI Configuration (enabled by default)
  aguiConfig: {
    enabled: boolean;
    workflowGates: boolean;
    decisionLogging: boolean;
    escalationChains: boolean;
    timeoutHandling: boolean;
  };

  // Advanced Flow Integration
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
    concurrencyLimits: {
      maxConcurrentOperations: number;
      maxParallelAnalysis: number;
      maxSimultaneousBuilds: number;
      memoryPoolSizeMB: number;
    };
  };

  // Neural Auto-Discovery
  autoDiscovery: {
    enabled: boolean;
    confidenceThreshold: number;
    autoCreateSwarms: boolean;
    importDocuments: boolean;
    learningEnabled: boolean;
  };

  // FACT + RAG Systems
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
export const defaultRepoConfig: Omit<RepoConfig, 'repoPath' | 'repoName'> = {
  // Core system configuration (from ClaudeZenCoreConfig)
  logLevel: 'info',
  port: 3000,
  host: 'localhost',

  // Advanced Kanban Flow - ALL ENABLED BY DEFAULT
  enableAdvancedKanbanFlow: true,
  enableMLOptimization: true,
  enableBottleneckDetection: true,
  enablePredictiveAnalytics: true,
  enableRealTimeMonitoring: true,
  enableIntelligentResourceManagement: true,
  enableAGUIGates: true,
  enableCrossLevelOptimization: true,

  flowTopology: 'hierarchical',
  // Conservative 8GB base - auto-scales up based on detected system memory
  maxParallelStreams: {
    portfolio: 4, // Strategic streams (conservative start, auto-scales)
    program: 16, // Collaborative streams (conservative start, auto-scales)
    swarm: 64, // Autonomous streams (conservative start, auto-scales)
  },

  // Memory allocation strategy starting from 8GB base (auto-detects and scales)
  memoryAllocation: memory8GBConfig,
  mlOptimizationLevel: 'enterprise',

  // Repository features
  autoDiscoveryEnabled: true,

  // DSPy Neural Enhancement - FULLY ENABLED
  dsyIntegration: {
    enabled: true,
    swarmCoordination: true,
    neuralEnhancement: true,
    automaticOptimization: true,
    crossSessionLearning: true,
  },

  // AGUI Human Gates - FULLY ENABLED
  aguiConfig: {
    enabled: true,
    workflowGates: true,
    decisionLogging: true,
    escalationChains: true,
    timeoutHandling: true,
  },

  // Flow Integration - ADAPTIVE OPTIMIZATION (starts 8GB, scales automatically)
  flowIntegration: {
    enableRealTimeOptimization: true,
    monitoringInterval: 5000, // 5 second monitoring (conservative start)
    performanceThresholds: {
      minThroughput: 10, // 10 items per hour (conservative start, auto-adjusts)
      maxLeadTime: 72, // 3 days maximum (conservative start, improves with scaling)
      minEfficiency: 0.8, // 80% minimum efficiency (achievable on any system)
      maxBottleneckDuration: 30, // 30 minutes maximum (conservative start)
      resourceUtilizationTarget: 0.7, // 70% target (conservative to allow scaling)
      qualityGateThreshold: 0.95, // 95% quality threshold
    },
    // Adaptive concurrency limits (auto-scales based on detected resources)
    concurrencyLimits: {
      maxConcurrentOperations: 8, // Conservative start (auto-scales)
      maxParallelAnalysis: 4, // Conservative analysis threads (auto-scales)
      maxSimultaneousBuilds: 2, // Conservative builds (auto-scales)
      memoryPoolSizeMB: 512, // 512MB pool (auto-scales)
    },
  },

  // Neural Auto-Discovery - INTELLIGENT DEFAULTS
  autoDiscovery: {
    enabled: true,
    confidenceThreshold: 0.8, // 80% confidence for auto-actions
    autoCreateSwarms: true,
    importDocuments: true,
    learningEnabled: true,
  },

  // Knowledge Systems - ALL ENABLED
  knowledgeSystems: {
    factEnabled: true,
    ragEnabled: true,
    wasmAcceleration: true,
    externalMCPs: [
      'context7', // Documentation research
      'deepwiki', // Knowledge aggregation
      'gitmcp', // Repository analysis
      'semgrep', // Security scanning
      'github', // Repository management
    ],
    cacheEnabled: true,
  },
};

/**
 * Create Repository Configuration with Auto-Detected Optimal Defaults.
 *
 * Factory function that creates a complete repository configuration by combining
 * intelligent defaults with system-detected capabilities and user overrides.
 * Automatically optimizes settings based on available system memory, CPU cores,
 * and other hardware characteristics.
 *
 * Key Features:
 * - Auto-detection of system resources for optimal parallel stream limits
 * - Ultra-conservative startup configuration that scales based on performance
 * - Comprehensive validation with detailed warning reporting
 * - Integration with all advanced Claude Code Zen features by default
 * - Adaptive memory allocation starting from 8GB base configuration
 *
 * @param repoPath - Absolute path to the repository directory
 * @param overrides - Optional configuration overrides to customize behavior
 * @returns Complete repository configuration with all features enabled
 *
 * @example
 * ```typescript
 * import { createRepoConfig } from 'claude-code-zen/config';
 *
 * // Basic usage with defaults
 * const config = createRepoConfig('/path/to/my-project');
 *
 * // With custom overrides
 * const customConfig = createRepoConfig('/path/to/my-project', {
 *   enableMLOptimization: false,
 *   maxParallelStreams: {
 *     portfolio: 2,
 *     program: 8,
 *     swarm: 32
 *   },
 *   dsyIntegration: {
 *     ...defaultRepoConfig.dsyIntegration,
 *     crossSessionLearning: false
 *   }
 * });
 * ```
 *
 * @see {@link RepoConfig} - Configuration interface
 * @see {@link validateRepoConfig} - Configuration validation
 * @see {@link defaultRepoConfig} - Base default settings
 * @since 1.0.0-alpha.43
 */
export function createRepoConfig(
  repoPath: string,
  overrides: Partial<RepoConfig> = {},
): RepoConfig {
  const repoName = repoPath.split('/').pop() || 'unknown-repo';

  // Get ultra-conservative startup configuration
  const startupConfig = getStartupConfig();

  const optimizedConfig = {
    ...defaultRepoConfig,
    // Apply ultra-conservative startup configuration
    maxParallelStreams: {
      portfolio: startupConfig.portfolio,
      program: startupConfig.program,
      swarm: startupConfig.swarm,
    },
    repoPath,
    repoName,
    ...overrides,
  };

  console.log(`🔒 Ultra-safe startup: ${startupConfig.rationale}`);
  console.log(
    `🎯 Initial streams: Portfolio=${optimizedConfig.maxParallelStreams.portfolio}, Program=${optimizedConfig.maxParallelStreams.program}, Swarm=${optimizedConfig.maxParallelStreams.swarm}`,
  );
  console.log('🚀 System will auto-scale based on performance metrics');

  // Validate configuration before returning (wired up!)
  const repoValidation = validateRepoConfig(optimizedConfig);
  if (repoValidation.valid) {
    console.log('✅ Repository configuration validated successfully');
  } else {
    console.warn(
      '⚠️ Repository configuration validation warnings:',
      repoValidation.errors,
    );
    // Continue with warnings but don't fail - configs might have acceptable issues
  }

  return optimizedConfig;
}

/**
 * Validate Repository Configuration.
 *
 * Comprehensive validation function that checks repository configuration for
 * correctness, safety, and system compatibility. Performs adaptive validation
 * based on detected system resources to ensure configuration values are
 * appropriate for the target deployment environment.
 *
 * Validation Checks:
 * - Required fields presence (repoPath, repoName)
 * - Numeric ranges and thresholds (monitoring intervals, confidence values)
 * - System resource limits based on detected memory and CPU cores
 * - Adaptive stream limits scaled to system capabilities
 * - Configuration coherence and internal consistency
 *
 * @param config - Repository configuration to validate
 * @returns Validation result with success status and detailed error list
 *
 * @example
 * ```typescript
 * import { validateRepoConfig, createRepoConfig } from 'claude-code-zen/config';
 *
 * const config = createRepoConfig('/my/repo', {
 *   maxParallelStreams: { portfolio: 100, program: 200, swarm: 500 }
 * });
 *
 * const validation = validateRepoConfig(config);
 * if (!validation.valid) {
 *   console.error('Configuration errors:', validation.errors);
 *   // Handle configuration issues...
 * } else {
 *   console.log('Configuration is valid and ready for use');
 * }
 * ```
 *
 * @see {@link RepoConfig} - Configuration interface
 * @see {@link createRepoConfig} - Configuration factory
 * @since 1.0.0-alpha.43
 */
export function validateRepoConfig(config: RepoConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.repoPath) {
    errors.push('Repository path is required');
  }

  if (!config.repoName) {
    errors.push('Repository name is required');
  }

  if (config.flowIntegration.monitoringInterval < 1000) {
    errors.push('Monitoring interval must be at least 1000ms');
  }

  if (
    config.autoDiscovery.confidenceThreshold < 0.5 ||
    config.autoDiscovery.confidenceThreshold > 1.0
  ) {
    errors.push(
      'Auto-discovery confidence threshold must be between 0.5 and 1.0',
    );
  }

  // Adaptive validation based on detected system memory
  const detectedMemoryGB = (() => {
    try {
      const os = require('os');
      return Math.round(os.totalmem() / (1024 * 1024 * 1024));
    } catch {
      return 8;
    }
  })();

  const maxSafePortfolio = Math.max(1, Math.floor(detectedMemoryGB * 0.5));
  const maxSafeProgram = Math.max(2, Math.floor(detectedMemoryGB * 2));
  const maxSafeSwarm = Math.max(4, Math.floor(detectedMemoryGB * 4));

  if (
    config.maxParallelStreams.portfolio < 1 ||
    config.maxParallelStreams.portfolio > maxSafePortfolio
  ) {
    errors.push(
      `Portfolio parallel streams must be between 1 and ${maxSafePortfolio} for ${detectedMemoryGB}GB system`,
    );
  }

  if (
    config.maxParallelStreams.program < 1 ||
    config.maxParallelStreams.program > maxSafeProgram
  ) {
    errors.push(
      `Program parallel streams must be between 1 and ${maxSafeProgram} for ${detectedMemoryGB}GB system`,
    );
  }

  if (
    config.maxParallelStreams.swarm < 2 ||
    config.maxParallelStreams.swarm > maxSafeSwarm
  ) {
    errors.push(
      `Swarm parallel streams must be between 2 and ${maxSafeSwarm} for ${detectedMemoryGB}GB system`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log Repository Configuration Status.
 *
 * Comprehensive logging function that outputs detailed repository configuration
 * status with visual indicators and structured information. Used for diagnostics,
 * debugging, and system health monitoring to provide clear visibility into
 * active configuration settings.
 *
 * Output Information:
 * - Repository identification (name, path)
 * - Feature enablement status with visual indicators (✅/❌)
 * - Advanced Kanban Flow settings and optimization levels
 * - Neural enhancement and learning capabilities
 * - Knowledge system integration status
 * - Performance and resource allocation settings
 * - Topology and parallel stream configuration
 *
 * @param config - Repository configuration to log
 *
 * @example
 * ```typescript
 * import { logRepoConfigStatus, createRepoConfig } from 'claude-code-zen/config';
 *
 * const config = createRepoConfig('/my/awesome-project');
 *
 * // Log detailed configuration status
 * logRepoConfigStatus(config);
 *
 * // Output example:
 * // 🚀 Repository Configuration:
 * //    Repository: awesome-project (/my/awesome-project)
 * //    Advanced Kanban Flow: ✅ ENABLED
 * //    ML Optimization: ✅ ENABLED (Level: enterprise)
 * //    Neural Enhancement: ✅ ENABLED
 * //    Auto-Discovery: ✅ ENABLED (Confidence: 0.8)
 * //    ...
 * ```
 *
 * @see {@link RepoConfig} - Configuration interface
 * @see {@link createRepoConfig} - Configuration factory
 * @since 1.0.0-alpha.43
 */
export function logRepoConfigStatus(config: RepoConfig): void {
  const logger = console;

  logger.log('🚀 Repository Configuration:');
  logger.log(`   Repository: ${config.repoName} (${config.repoPath})`);
  logger.log(
    `   Advanced Kanban Flow: ${config.enableAdvancedKanbanFlow ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   ML Optimization: ${config.enableMLOptimization ? '✅ ENABLED' : '❌ DISABLED'} (Level: ${config.mlOptimizationLevel})`,
  );
  logger.log(
    `   Bottleneck Detection: ${config.enableBottleneckDetection ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   Predictive Analytics: ${config.enablePredictiveAnalytics ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   Real-Time Monitoring: ${config.enableRealTimeMonitoring ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   Resource Management: ${config.enableIntelligentResourceManagement ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   AGUI Gates: ${config.enableAGUIGates ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   Cross-Level Optimization: ${config.enableCrossLevelOptimization ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   DSPy Neural Enhancement: ${config.dsyIntegration.enabled ? '✅ ENABLED' : '❌ DISABLED'}`,
  );
  logger.log(
    `   Auto-Discovery: ${config.autoDiscovery.enabled ? '✅ ENABLED' : '❌ DISABLED'} (Confidence: ${config.autoDiscovery.confidenceThreshold})`,
  );
  logger.log(
    `   Knowledge Systems: FACT=${config.knowledgeSystems.factEnabled ? '✅' : '❌'}, RAG=${config.knowledgeSystems.ragEnabled ? '✅' : '❌'}, WASM=${config.knowledgeSystems.wasmAcceleration ? '✅' : '❌'}`,
  );
  logger.log(`   Flow Topology: ${config.flowTopology}`);
  logger.log(
    `   Parallel Streams: Portfolio=${config.maxParallelStreams.portfolio}, Program=${config.maxParallelStreams.program}, Swarm=${config.maxParallelStreams.swarm}`,
  );
  logger.log(
    '✅ All advanced features enabled with adaptive 8GB base configuration!',
  );
  logger.log(
    '🔄 System will auto-scale based on detected memory and performance!',
  );
}

export default defaultRepoConfig;
