/**
 * Default Repository Configuration with Advanced Kanban Flow
 *
 * This configuration is automatically applied when adding a new repository
 * to ensure all ML and intelligent features are enabled by default.
 */
/**
 * Default configuration for new repositories - All advanced features enabled
 */
export const defaultRepoConfig = {
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
    maxParallelStreams: {
        portfolio: 10, // Strategic human-controlled streams
        program: 50, // AI-human collaborative streams  
        swarm: 200 // AI autonomous streams with SPARC
    },
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
    // Flow Integration - ENTERPRISE DEFAULTS
    flowIntegration: {
        enableRealTimeOptimization: true,
        monitoringInterval: 5000, // 5 second real-time monitoring
        performanceThresholds: {
            minThroughput: 15, // 15 items per hour minimum
            maxLeadTime: 72, // 3 days maximum lead time
            minEfficiency: 0.85, // 85% minimum efficiency
            maxBottleneckDuration: 30, // 30 minutes maximum bottleneck
            resourceUtilizationTarget: 0.80, // 80% target utilization
            qualityGateThreshold: 0.95, // 95% quality threshold
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
 * Create repository configuration with defaults
 */
export function createRepoConfig(repoPath, overrides = {}) {
    const repoName = repoPath.split('/').pop() || 'unknown-repo';
    return {
        ...defaultRepoConfig,
        repoPath,
        repoName,
        ...overrides,
    };
}
/**
 * Validate repository configuration
 */
export function validateRepoConfig(config) {
    const errors = [];
    if (!config.repoPath) {
        errors.push('Repository path is required');
    }
    if (!config.repoName) {
        errors.push('Repository name is required');
    }
    if (config.flowIntegration.monitoringInterval < 1000) {
        errors.push('Monitoring interval must be at least 1000ms');
    }
    if (config.autoDiscovery.confidenceThreshold < 0.5 || config.autoDiscovery.confidenceThreshold > 1.0) {
        errors.push('Auto-discovery confidence threshold must be between 0.5 and 1.0');
    }
    if (config.maxParallelStreams.portfolio < 1 || config.maxParallelStreams.portfolio > 50) {
        errors.push('Portfolio parallel streams must be between 1 and 50');
    }
    if (config.maxParallelStreams.program < 5 || config.maxParallelStreams.program > 200) {
        errors.push('Program parallel streams must be between 5 and 200');
    }
    if (config.maxParallelStreams.swarm < 10 || config.maxParallelStreams.swarm > 1000) {
        errors.push('Swarm parallel streams must be between 10 and 1000');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Log configuration status
 */
export function logRepoConfigStatus(config) {
    const logger = console;
    logger.log('🚀 Repository Configuration:');
    logger.log(`   Repository: ${config.repoName} (${config.repoPath})`);
    logger.log(`   Advanced Kanban Flow: ${config.enableAdvancedKanbanFlow ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   ML Optimization: ${config.enableMLOptimization ? '✅ ENABLED' : '❌ DISABLED'} (Level: ${config.mlOptimizationLevel})`);
    logger.log(`   Bottleneck Detection: ${config.enableBottleneckDetection ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   Predictive Analytics: ${config.enablePredictiveAnalytics ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   Real-Time Monitoring: ${config.enableRealTimeMonitoring ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   Resource Management: ${config.enableIntelligentResourceManagement ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   AGUI Gates: ${config.enableAGUIGates ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   Cross-Level Optimization: ${config.enableCrossLevelOptimization ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   DSPy Neural Enhancement: ${config.dsyIntegration.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    logger.log(`   Auto-Discovery: ${config.autoDiscovery.enabled ? '✅ ENABLED' : '❌ DISABLED'} (Confidence: ${config.autoDiscovery.confidenceThreshold})`);
    logger.log(`   Knowledge Systems: FACT=${config.knowledgeSystems.factEnabled ? '✅' : '❌'}, RAG=${config.knowledgeSystems.ragEnabled ? '✅' : '❌'}, WASM=${config.knowledgeSystems.wasmAcceleration ? '✅' : '❌'}`);
    logger.log(`   Flow Topology: ${config.flowTopology}`);
    logger.log(`   Parallel Streams: Portfolio=${config.maxParallelStreams.portfolio}, Program=${config.maxParallelStreams.program}, Swarm=${config.maxParallelStreams.swarm}`);
    logger.log('✅ All advanced features enabled by default for optimal performance!');
}
export default defaultRepoConfig;
