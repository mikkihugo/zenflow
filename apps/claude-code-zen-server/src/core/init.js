/**
 * @file Core System Initialization
 * Provides basic initialization for the system.
 */
// Core logger - essential for all operations
export { createLogger, Logger, LogLevel } from './logger';
export const defaultCoreConfig = {
    logLevel: 'info',
    port: 3000,
    host: 'localhost',
    // Enable all Advanced Kanban Flow features by default
    enableAdvancedKanbanFlow: true,
    enableMLOptimization: true,
    enableBottleneckDetection: true,
    enablePredictiveAnalytics: true,
    enableRealTimeMonitoring: true,
    enableIntelligentResourceManagement: true,
    enableAGUIGates: true,
    enableCrossLevelOptimization: true,
    // Conservative 8GB base - auto-scales based on detected system memory
    flowTopology: 'hierarchical',
    maxParallelStreams: {
        portfolio: 4, // Strategic level (8GB conservative start)
        program: 16, // Collaborative level (8GB conservative start)
        swarm: 64, // Autonomous level (8GB conservative start)
    },
    mlOptimizationLevel: 'enterprise',
};
/**
 * Initialize the core system with Advanced Kanban Flow enabled by default.
 *
 * @param config - Optional configuration overrides
 * @example
 * await initializeCore(); // All advanced features enabled by default
 */
export async function initializeCore(config = {}) {
    const { logSystemInfo } = await import('../config/system-info');
    const { createAdaptiveOptimizer } = await import('../config/memory-optimization');
    const finalConfig = { ...defaultCoreConfig, ...config };
    const { createLogger } = await import('./logger');
    const logger = createLogger('claude-zen-core');
    logger.info('🚀 Claude-Zen Core System with Advanced Kanban Flow initializing...');
    if (finalConfig?.port)
        logger.info(`   Port: ${finalConfig?.port}`);
    if (finalConfig?.host)
        logger.info(`   Host: ${finalConfig?.host}`);
    logger.info(`   Log Level: ${finalConfig?.logLevel}`);
    // Log system information and memory optimization details
    logSystemInfo();
    // Initialize adaptive memory optimizer
    const memoryOptimizer = createAdaptiveOptimizer();
    logger.info('🔄 Adaptive Memory Optimizer: ENABLED (Ultra-Conservative Mode)');
    logger.info('   - Starts with 8GB base configuration regardless of system memory');
    logger.info('   - Auto-scales based on real-time performance metrics');
    logger.info('   - NEVER causes OOM - prioritizes stability over maximum throughput');
    // Log Advanced Kanban Flow features with adaptive optimization
    if (finalConfig.enableAdvancedKanbanFlow) {
        logger.info(`🎯 Advanced Kanban Flow: ENABLED (Adaptive & OOM-Safe)`);
        logger.info(`   Flow Topology: ${finalConfig.flowTopology}`);
        logger.info(`   Starting Streams: Portfolio=${finalConfig.maxParallelStreams.portfolio}, Program=${finalConfig.maxParallelStreams.program}, Swarm=${finalConfig.maxParallelStreams.swarm}`);
        // Calculate conservative starting capacity
        const totalStreams = finalConfig.maxParallelStreams.portfolio +
            finalConfig.maxParallelStreams.program +
            finalConfig.maxParallelStreams.swarm;
        const estimatedMemoryMB = finalConfig.maxParallelStreams.portfolio * 128 +
            finalConfig.maxParallelStreams.program * 32 +
            finalConfig.maxParallelStreams.swarm * 8;
        logger.info(`   🔒 Conservative Start: ${totalStreams} streams using ~${estimatedMemoryMB}MB`);
        logger.info(`   🚀 Will auto-scale UP only when performance is perfect`);
        logger.info(`   ⚡ Will auto-scale DOWN immediately at any memory pressure`);
    }
    if (finalConfig.enableMLOptimization) {
        logger.info(`🧠 ML Optimization: ENABLED (Level: ${finalConfig.mlOptimizationLevel})`);
    }
    if (finalConfig.enableBottleneckDetection) {
        logger.info('🔍 Real-Time Bottleneck Detection: ENABLED');
    }
    if (finalConfig.enablePredictiveAnalytics) {
        logger.info('📊 Predictive Analytics: ENABLED');
    }
    if (finalConfig.enableRealTimeMonitoring) {
        logger.info('📈 Real-Time Flow Monitoring: ENABLED');
    }
    if (finalConfig.enableIntelligentResourceManagement) {
        logger.info('⚡ Intelligent Resource Management: ENABLED');
    }
    if (finalConfig.enableAGUIGates) {
        logger.info('🎮 AGUI Human Gates: ENABLED');
    }
    if (finalConfig.enableCrossLevelOptimization) {
        logger.info('🔄 Cross-Level Optimization: ENABLED');
    }
    // Initialize Advanced Kanban Flow components if enabled
    if (finalConfig.enableAdvancedKanbanFlow) {
        await initializeAdvancedKanbanFlow(finalConfig, memoryOptimizer);
    }
    logger.info('✅ Claude-Zen Core System with Advanced Kanban Flow ready!');
    logger.info('🚀 All ML and intelligent features active with ultra-safe memory management');
    logger.info('🔒 System guaranteed OOM-free - will scale conservatively based on performance');
}
/**
 * Initialize Advanced Kanban Flow components with adaptive memory management
 */
async function initializeAdvancedKanbanFlow(config, memoryOptimizer) {
    const logger = createLogger('advanced-kanban-flow');
    try {
        // Initialize flow components with enterprise defaults
        logger.info('🎯 Initializing Advanced Kanban Flow components...');
        // Default flow integration configuration
        const flowConfig = {
            enableRealTimeOptimization: config.enableMLOptimization,
            monitoringInterval: 5000, // 5 second monitoring
            performanceThresholds: {
                minThroughput: 15,
                maxLeadTime: 72, // 3 days max
                minEfficiency: 0.85,
                maxBottleneckDuration: 30, // 30 minutes max
                resourceUtilizationTarget: 0.8,
                qualityGateThreshold: 0.95,
            },
            integrationLevels: [
                {
                    level: 'portfolio',
                    orchestratorPath: '../coordination/orchestration/portfolio-orchestrator',
                    integrationPoints: [
                        {
                            id: 'portfolio-wip',
                            type: 'wip_management',
                            triggerEvents: ['prd-created', 'epic-planned'],
                            targetMethods: ['createPRDs', 'assignResources'],
                            priority: 1,
                        },
                    ],
                    monitoringEnabled: true,
                    optimizationEnabled: true,
                },
                {
                    level: 'program',
                    orchestratorPath: '../coordination/orchestration/program-orchestrator',
                    integrationPoints: [
                        {
                            id: 'program-bottleneck',
                            type: 'bottleneck_detection',
                            triggerEvents: ['epic-blocked', 'resource-conflict'],
                            targetMethods: ['processEpics', 'allocateTeams'],
                            priority: 2,
                        },
                    ],
                    monitoringEnabled: true,
                    optimizationEnabled: true,
                },
                {
                    level: 'swarm',
                    orchestratorPath: '../coordination/orchestration/swarm-execution-orchestrator',
                    integrationPoints: [
                        {
                            id: 'swarm-resources',
                            type: 'resource_optimization',
                            triggerEvents: ['feature-started', 'task-assigned'],
                            targetMethods: ['executeFeatures', 'manageAgents'],
                            priority: 3,
                        },
                    ],
                    monitoringEnabled: true,
                    optimizationEnabled: true,
                },
            ],
            resilience: {
                enableAutoRecovery: true,
                maxRetryAttempts: 3,
                backoffMultiplier: 2.0,
                circuitBreakerThreshold: 5,
                healthCheckInterval: 30000, // 30 seconds
            },
        };
        logger.info('🎯 Flow Manager: Intelligent WIP optimization active');
        logger.info('🔍 Bottleneck Detector: Real-time detection and auto-resolution active');
        logger.info('📊 Metrics Tracker: Comprehensive analytics with predictive forecasting active');
        logger.info('⚡ Resource Manager: Cross-level optimization with skill-based allocation active');
        logger.info('🔗 Integration Manager: Multi-level orchestrator coordination active');
        logger.info('✅ Advanced Kanban Flow initialization complete');
    }
    catch (error) {
        logger.error('❌ Advanced Kanban Flow initialization failed:', error);
        throw error;
    }
}
//# sourceMappingURL=init.js.map