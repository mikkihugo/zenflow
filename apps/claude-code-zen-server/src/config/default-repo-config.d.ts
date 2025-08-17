/**
 * @fileoverview Default Repository Configuration with Advanced Kanban Flow - Comprehensive configuration system
 *
 * This module provides intelligent default repository configurations with all ML and advanced features
 * enabled by default. Includes auto-detection of system resources, adaptive scaling, and comprehensive
 * validation to ensure optimal performance across different deployment environments.
 *
 * **Key Features:**
 * - **Intelligent Defaults**: Auto-detected system-optimal configuration
 * - **Adaptive Scaling**: Starts conservative, scales based on performance metrics
 * - **Advanced Kanban Flow**: Complete workflow optimization with ML enhancement
 * - **Neural Integration**: DSPy coordination and cross-session learning
 * - **Knowledge Systems**: FACT + RAG with WASM acceleration
 * - **AGUI Integration**: Human-in-the-loop workflow gates and decision points
 * - **Real-time Monitoring**: Performance tracking and bottleneck detection
 * - **Cross-level Optimization**: Portfolio, program, and swarm-level coordination
 *
 * **Configuration Philosophy:**
 * - Ultra-conservative startup to ensure stability on any system (8GB base)
 * - Automatic resource detection and adaptive scaling
 * - All advanced features enabled by default for maximum capability
 * - Comprehensive validation with detailed error reporting
 * - Human-friendly logging and status reporting
 *
 * @example Basic Repository Configuration
 * ```typescript
 * import { createRepoConfig, logRepoConfigStatus } from './default-repo-config';
 *
 * // Auto-detected optimal configuration
 * const config = createRepoConfig('/path/to/my-project');
 * logRepoConfigStatus(config);
 *
 * // Output: Complete status with all features enabled
 * ```
 *
 * @example Custom Configuration Override
 * ```typescript
 * const customConfig = createRepoConfig('/path/to/enterprise-project', {
 *   maxParallelStreams: {
 *     portfolio: 8,    // Increased for enterprise workload
 *     program: 32,     // Higher program coordination
 *     swarm: 128       // Massive swarm coordination
 *   },
 *   mlOptimizationLevel: 'maximum',
 *   dsyIntegration: {
 *     ...defaultRepoConfig.dsyIntegration,
 *     automaticOptimization: true,
 *     crossSessionLearning: true
 *   }
 * });
 * ```
 *
 * @example System Resource Validation
 * ```typescript
 * import { validateRepoConfig } from './default-repo-config';
 *
 * const validation = validateRepoConfig(config);
 * if (!validation.valid) {
 *   console.error('Configuration issues:', validation.errors);
 *   // Handles system-specific validation failures
 * }
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 *
 * @see {@link RepoConfig} Repository configuration interface
 * @see {@link ClaudeZenCoreConfig} Base system configuration
 * @see {@link createRepoConfig} Configuration factory function
 * @see {@link validateRepoConfig} Configuration validation system
 */
import type { ClaudeZenCoreConfig } from '../types/core-config';
/**
 * Repository Configuration Interface - Complete configuration structure for claude-code-zen repositories
 *
 * Extends the base ClaudeZenCoreConfig with repository-specific settings for advanced workflow
 * optimization, neural enhancement, knowledge systems, and intelligent automation. Provides
 * comprehensive configuration for all claude-code-zen features including DSPy integration,
 * AGUI human-in-the-loop gates, real-time performance monitoring, and adaptive resource management.
 *
 * **Configuration Categories:**
 * - Repository identification and path management
 * - DSPy neural enhancement and cross-session learning
 * - AGUI workflow gates and human decision points
 * - Advanced flow integration with real-time optimization
 * - Neural auto-discovery and confidence-based automation
 * - Knowledge systems (FACT + RAG) with WASM acceleration
 *
 * @interface RepoConfig
 * @extends ClaudeZenCoreConfig
 *
 * @example Complete Configuration
 * ```typescript
 * const config: RepoConfig = {
 *   repoPath: '/path/to/project',
 *   repoName: 'my-awesome-project',
 *   autoDiscoveryEnabled: true,
 *   dsyIntegration: {
 *     enabled: true,
 *     swarmCoordination: true,
 *     neuralEnhancement: true,
 *     automaticOptimization: true,
 *     crossSessionLearning: true
 *   },
 *   // ... other configuration sections
 * };
 * ```
 */
export interface RepoConfig extends ClaudeZenCoreConfig {
    /** Repository absolute path for file system operations and project identification */
    repoPath: string;
    /** Repository display name derived from path or explicitly set for human-readable identification */
    repoName: string;
    /** Enable automatic discovery of project patterns, dependencies, and optimization opportunities */
    autoDiscoveryEnabled: boolean;
    /**
     * DSPy Neural Enhancement Configuration
     *
     * Controls the integration with DSPy (Declarative Self-improving Language Programs)
     * for advanced neural coordination, automatic optimization, and cross-session learning.
     * When enabled, provides intelligent swarm coordination with neural adaptation.
     *
     * @see {@link https://github.com/stanfordnlp/dspy} DSPy Documentation
     */
    dsyIntegration: {
        /** Master enable/disable for all DSPy neural enhancement features */
        enabled: boolean;
        /** Enable neural coordination between swarm agents for optimized task distribution */
        swarmCoordination: boolean;
        /** Enable neural enhancement of individual agent capabilities and decision making */
        neuralEnhancement: boolean;
        /** Enable automatic optimization of neural models based on performance feedback */
        automaticOptimization: boolean;
        /** Enable learning persistence across sessions for continuous improvement */
        crossSessionLearning: boolean;
    };
    /**
     * AGUI (Adaptive Graphical User Interface) Configuration
     *
     * Controls human-in-the-loop workflow gates, decision logging, and escalation chains
     * for critical decisions that require human oversight. Provides intelligent prompting
     * and decision tracking for workflow validation and quality assurance.
     *
     * @see {@link ../interfaces/agui/agui-adapter} AGUI Implementation
     */
    aguiConfig: {
        /** Master enable/disable for all AGUI human interaction features */
        enabled: boolean;
        /** Enable workflow gates that pause for human validation at critical decision points */
        workflowGates: boolean;
        /** Enable logging of all human decisions for audit trails and learning */
        decisionLogging: boolean;
        /** Enable escalation chains for complex decisions requiring multiple approvers */
        escalationChains: boolean;
        /** Enable timeout handling for human responses with fallback strategies */
        timeoutHandling: boolean;
    };
    /**
     * Advanced Flow Integration Configuration
     *
     * Controls real-time workflow optimization, performance monitoring, and adaptive
     * resource management. Provides comprehensive metrics tracking, bottleneck detection,
     * and automatic scaling based on performance thresholds and resource utilization.
     */
    flowIntegration: {
        /** Enable real-time optimization of workflow parameters based on performance metrics */
        enableRealTimeOptimization: boolean;
        /** Monitoring interval in milliseconds for performance metrics collection (minimum: 1000ms) */
        monitoringInterval: number;
        /**
         * Performance Thresholds for Adaptive Optimization
         *
         * Defines the target performance metrics that trigger automatic scaling and optimization.
         * When thresholds are exceeded, the system automatically adjusts resource allocation
         * and concurrency limits to maintain optimal performance.
         */
        performanceThresholds: {
            /** Minimum throughput in items per hour before scaling up resources */
            minThroughput: number;
            /** Maximum lead time in hours before optimization triggers */
            maxLeadTime: number;
            /** Minimum efficiency ratio (0.0-1.0) before performance optimization */
            minEfficiency: number;
            /** Maximum bottleneck duration in minutes before escalation */
            maxBottleneckDuration: number;
            /** Target resource utilization ratio (0.0-1.0) for optimal performance */
            resourceUtilizationTarget: number;
            /** Quality gate threshold (0.0-1.0) for output validation */
            qualityGateThreshold: number;
        };
        /**
         * Concurrency Limits for Resource Management
         *
         * Defines the maximum concurrent operations allowed to prevent resource exhaustion
         * and ensure system stability. Values are automatically scaled based on detected
         * system resources and performance metrics.
         */
        concurrencyLimits: {
            /** Maximum concurrent operations across all workflow levels */
            maxConcurrentOperations: number;
            /** Maximum parallel analysis threads for data processing */
            maxParallelAnalysis: number;
            /** Maximum simultaneous builds to prevent CPU/memory exhaustion */
            maxSimultaneousBuilds: number;
            /** Memory pool size in MB reserved for concurrent operations */
            memoryPoolSizeMB: number;
        };
    };
    /**
     * Neural Auto-Discovery Configuration
     *
     * Controls intelligent automatic discovery of project patterns, optimization opportunities,
     * and swarm creation based on confidence thresholds. Provides learning-enabled discovery
     * with document import and automated swarm orchestration.
     */
    autoDiscovery: {
        /** Master enable/disable for all auto-discovery features */
        enabled: boolean;
        /** Confidence threshold (0.0-1.0) for automatic actions (recommended: 0.7-0.9) */
        confidenceThreshold: number;
        /** Enable automatic creation of swarms based on discovered patterns */
        autoCreateSwarms: boolean;
        /** Enable automatic import of project documents and documentation */
        importDocuments: boolean;
        /** Enable learning from discovery patterns for improved future performance */
        learningEnabled: boolean;
    };
    /**
     * Knowledge Systems Configuration (FACT + RAG)
     *
     * Controls the integration of FACT (Fast Adaptive Context Technology) and RAG
     * (Retrieval-Augmented Generation) systems with WASM acceleration and external
     * MCP (Model Context Protocol) integrations for enhanced knowledge processing.
     *
     * @see {@link ../services/fact-service} FACT Service Implementation
     * @see {@link ../services/rag-service} RAG Service Implementation
     */
    knowledgeSystems: {
        /** Enable FACT (Fast Adaptive Context Technology) for rapid context processing */
        factEnabled: boolean;
        /** Enable RAG (Retrieval-Augmented Generation) for enhanced knowledge retrieval */
        ragEnabled: boolean;
        /** Enable WASM acceleration for high-performance knowledge processing */
        wasmAcceleration: boolean;
        /** List of external MCP server names for additional knowledge sources */
        externalMCPs: string[];
        /** Enable caching of knowledge processing results for improved performance */
        cacheEnabled: boolean;
    };
}
/**
 * Default configuration for new repositories - All advanced features enabled
 */
export declare const defaultRepoConfig: Omit<RepoConfig, 'repoPath' | 'repoName'>;
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
export declare function createRepoConfig(repoPath: string, overrides?: Partial<RepoConfig>): RepoConfig;
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
export declare function validateRepoConfig(config: RepoConfig): {
    valid: boolean;
    errors: string[];
};
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
export declare function logRepoConfigStatus(config: RepoConfig): void;
export default defaultRepoConfig;
//# sourceMappingURL=default-repo-config.d.ts.map