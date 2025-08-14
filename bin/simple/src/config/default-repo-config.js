import { memory8GBConfig, } from './memory-optimization.ts';
import { getStartupConfig, } from './system-info.ts';
export const defaultRepoConfig = {
    logLevel: 'info',
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
    flowTopology: 'hierarchical',
    maxParallelStreams: {
        portfolio: 4,
        program: 16,
        swarm: 64,
    },
    memoryAllocation: memory8GBConfig,
    mlOptimizationLevel: 'enterprise',
    autoDiscoveryEnabled: true,
    dsyIntegration: {
        enabled: true,
        swarmCoordination: true,
        neuralEnhancement: true,
        automaticOptimization: true,
        crossSessionLearning: true,
    },
    aguiConfig: {
        enabled: true,
        workflowGates: true,
        decisionLogging: true,
        escalationChains: true,
        timeoutHandling: true,
    },
    flowIntegration: {
        enableRealTimeOptimization: true,
        monitoringInterval: 5000,
        performanceThresholds: {
            minThroughput: 10,
            maxLeadTime: 72,
            minEfficiency: 0.8,
            maxBottleneckDuration: 30,
            resourceUtilizationTarget: 0.7,
            qualityGateThreshold: 0.95,
        },
        concurrencyLimits: {
            maxConcurrentOperations: 8,
            maxParallelAnalysis: 4,
            maxSimultaneousBuilds: 2,
            memoryPoolSizeMB: 512,
        },
    },
    autoDiscovery: {
        enabled: true,
        confidenceThreshold: 0.8,
        autoCreateSwarms: true,
        importDocuments: true,
        learningEnabled: true,
    },
    knowledgeSystems: {
        factEnabled: true,
        ragEnabled: true,
        wasmAcceleration: true,
        externalMCPs: [
            'context7',
            'deepwiki',
            'gitmcp',
            'semgrep',
            'github',
        ],
        cacheEnabled: true,
    },
};
export function createRepoConfig(repoPath, overrides = {}) {
    const repoName = repoPath.split('/').pop() || 'unknown-repo';
    const startupConfig = getStartupConfig();
    const optimizedConfig = {
        ...defaultRepoConfig,
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
    console.log(`🎯 Initial streams: Portfolio=${optimizedConfig.maxParallelStreams.portfolio}, Program=${optimizedConfig.maxParallelStreams.program}, Swarm=${optimizedConfig.maxParallelStreams.swarm}`);
    console.log('🚀 System will auto-scale based on performance metrics');
    const repoValidation = validateRepoConfig(optimizedConfig);
    if (repoValidation.valid) {
        console.log('✅ Repository configuration validated successfully');
    }
    else {
        console.warn('⚠️ Repository configuration validation warnings:', repoValidation.errors);
    }
    return optimizedConfig;
}
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
    if (config.autoDiscovery.confidenceThreshold < 0.5 ||
        config.autoDiscovery.confidenceThreshold > 1.0) {
        errors.push('Auto-discovery confidence threshold must be between 0.5 and 1.0');
    }
    const detectedMemoryGB = (() => {
        try {
            const os = require('os');
            return Math.round(os.totalmem() / (1024 * 1024 * 1024));
        }
        catch {
            return 8;
        }
    })();
    const maxSafePortfolio = Math.max(1, Math.floor(detectedMemoryGB * 0.5));
    const maxSafeProgram = Math.max(2, Math.floor(detectedMemoryGB * 2));
    const maxSafeSwarm = Math.max(4, Math.floor(detectedMemoryGB * 4));
    if (config.maxParallelStreams.portfolio < 1 ||
        config.maxParallelStreams.portfolio > maxSafePortfolio) {
        errors.push(`Portfolio parallel streams must be between 1 and ${maxSafePortfolio} for ${detectedMemoryGB}GB system`);
    }
    if (config.maxParallelStreams.program < 1 ||
        config.maxParallelStreams.program > maxSafeProgram) {
        errors.push(`Program parallel streams must be between 1 and ${maxSafeProgram} for ${detectedMemoryGB}GB system`);
    }
    if (config.maxParallelStreams.swarm < 2 ||
        config.maxParallelStreams.swarm > maxSafeSwarm) {
        errors.push(`Swarm parallel streams must be between 2 and ${maxSafeSwarm} for ${detectedMemoryGB}GB system`);
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
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
    logger.log('✅ All advanced features enabled with adaptive 8GB base configuration!');
    logger.log('🔄 System will auto-scale based on detected memory and performance!');
}
export default defaultRepoConfig;
//# sourceMappingURL=default-repo-config.js.map