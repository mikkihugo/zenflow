export { CollaborativeReasoningEngine } from './collaborative-reasoning-engine.ts';
export { CollectiveIntelligenceCoordinator } from './collective-intelligence-coordinator.ts';
export { CrossAgentKnowledgeIntegration, createCrossAgentKnowledgeIntegration, getDefaultConfig as getDefaultKnowledgeConfig, } from './cross-agent-knowledge-integration.ts';
export { DistributedLearningSystem } from './distributed-learning-system.ts';
export { IntelligenceCoordinationSystem } from './intelligence-coordination-system.ts';
export { KnowledgeQualityManagementSystem } from './knowledge-quality-management.ts';
export { KnowledgeSwarm } from './knowledge-swarm.ts';
export { PerformanceOptimizationSystem } from './performance-optimization-system.ts';
export { ProjectContextAnalyzer } from './project-context-analyzer.ts';
export { SQLiteBackend } from './storage-backends/sqlite-backend.ts';
export async function createKnowledgeSharingSystem(config, logger, eventBus) {
    const { CrossAgentKnowledgeIntegration, getDefaultConfig } = await import('./cross-agent-knowledge-integration.ts');
    const finalConfig = config
        ? { ...getDefaultConfig(), ...config }
        : getDefaultConfig();
    const finalLogger = logger || console;
    const finalEventBus = eventBus || new (await import('node:events')).EventEmitter();
    const system = new CrossAgentKnowledgeIntegration(finalConfig, finalLogger, finalEventBus);
    await system.initialize();
    return system;
}
export async function createKnowledgeSwarm(config) {
    const { initializeFACTSwarm } = await import('./knowledge-swarm.ts');
    return initializeFACTSwarm(config);
}
export function validateKnowledgeConfig(config) {
    const errors = [];
    const warnings = [];
    if (!config?.collectiveIntelligence) {
        errors.push('Missing collectiveIntelligence configuration');
    }
    if (config?.integration) {
        if (config?.integration?.factIntegration?.enabled &&
            !config?.integration?.factIntegration?.knowledgeSwarmIntegration) {
            warnings.push('FACT integration enabled but knowledge swarm integration disabled');
        }
        if (config?.integration?.ragIntegration?.enabled &&
            !config?.integration?.ragIntegration?.vectorStoreIntegration) {
            warnings.push('RAG integration enabled but vector store integration disabled');
        }
    }
    else {
        errors.push('Missing integration configuration');
    }
    if (config?.distributedLearning?.federatedConfig) {
        const fedConfig = config?.distributedLearning?.federatedConfig;
        if (fedConfig?.clientFraction > 1.0 || fedConfig?.clientFraction <= 0) {
            errors.push('federatedConfig.clientFraction must be between 0 and 1');
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}
export function getSystemCapabilities(config) {
    return {
        collectiveIntelligence: !!config?.collectiveIntelligence,
        distributedLearning: !!config?.distributedLearning,
        collaborativeReasoning: !!config?.collaborativeReasoning,
        crossDomainTransfer: !!config?.intelligenceCoordination,
        qualityManagement: !!config?.qualityManagement,
        performanceOptimization: !!config?.performanceOptimization,
        factIntegration: config?.integration?.factIntegration?.enabled,
        ragIntegration: config?.integration?.ragIntegration?.enabled,
    };
}
export function createTestConfig() {
    const defaultConfig = {};
    return {
        ...defaultConfig,
        integration: {
            ...defaultConfig?.integration,
            factIntegration: {
                ...defaultConfig?.integration?.factIntegration,
                enabled: false,
            },
            ragIntegration: {
                ...defaultConfig?.integration?.ragIntegration,
                enabled: false,
            },
        },
    };
}
export async function ensureStorageDirectory(basePath = process.cwd()) {
    const path = await import('node:path');
    const fs = await import('node:fs/promises');
    const swarmDir = path.join(basePath, '.swarm');
    const hiveMindDir = path.join(basePath, '.hive-mind');
    const knowledgeDir = path.join(basePath, '.knowledge');
    const cacheDir = path.join(basePath, '.cache', 'knowledge');
    await fs.mkdir(swarmDir, { recursive: true });
    await fs.mkdir(hiveMindDir, { recursive: true });
    await fs.mkdir(knowledgeDir, { recursive: true });
    await fs.mkdir(cacheDir, { recursive: true });
    return {
        swarmDir,
        hiveMindDir,
        knowledgeDir,
        cacheDir,
    };
}
export function getKnowledgeStoragePaths(basePath = process.cwd()) {
    const path = require('node:path');
    return {
        collective: path.join(basePath, '.hive-mind', 'collective-intelligence'),
        distributed: path.join(basePath, '.swarm', 'distributed-learning'),
        collaborative: path.join(basePath, '.hive-mind', 'collaborative-reasoning'),
        intelligence: path.join(basePath, '.swarm', 'intelligence-coordination'),
        quality: path.join(basePath, '.knowledge', 'quality-management'),
        performance: path.join(basePath, '.cache', 'performance-optimization'),
    };
}
//# sourceMappingURL=index.js.map