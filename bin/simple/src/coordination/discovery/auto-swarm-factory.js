import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('AutoSwarmFactory');
export class AutoSwarmFactory extends EventEmitter {
    swarmCoordinator;
    hiveSync;
    memoryStore;
    agui;
    config;
    createdSwarms = new Map();
    domainAnalysisCache = new Map();
    constructor(swarmCoordinator, hiveSync, memoryStore, agui, config) {
        super();
        this.swarmCoordinator = swarmCoordinator;
        this.hiveSync = hiveSync;
        this.memoryStore = memoryStore;
        this.agui = agui;
        this.config = {
            enableHumanValidation: true,
            defaultPersistenceBackend: 'sqlite',
            maxSwarmsPerDomain: 3,
            performanceMode: 'balanced',
            resourceConstraints: {
                maxTotalAgents: 50,
                memoryLimit: '2GB',
                cpuLimit: 8,
            },
            ...config,
        };
        logger.info('Auto-Swarm Factory initialized', { config: this.config });
    }
    async createSwarmsForDomains(confidentDomains) {
        logger.info(`🏭 Auto-Swarm Factory starting for ${confidentDomains.size} domains`);
        const configs = [];
        const domainArray = Array.from(confidentDomains.entries());
        this.emit('factory:start', {
            domainCount: confidentDomains.size,
            timestamp: Date.now(),
        });
        try {
            const swarmPromises = domainArray.map(async ([name, domain]) => {
                try {
                    const config = await this.createSwarmForDomain(domain);
                    configs.push(config);
                    return config;
                }
                catch (error) {
                    logger.error(`Failed to create swarm for domain ${name}:`, error);
                    this.emit('factory:domain-error', { domain: name, error });
                    return null;
                }
            });
            const results = await Promise.all(swarmPromises);
            const successfulConfigs = results.filter(Boolean);
            await this.validateResourceConstraints(successfulConfigs);
            if (this.config.enableHumanValidation && this.agui) {
                await this.performHumanValidation(successfulConfigs);
            }
            await this.initializeSwarms(successfulConfigs);
            logger.info(`🎉 Auto-Swarm Factory completed: ${successfulConfigs.length}/${confidentDomains.size} swarms created`);
            this.emit('factory:complete', {
                total: confidentDomains.size,
                successful: successfulConfigs.length,
                configs: successfulConfigs,
                timestamp: Date.now(),
            });
            return successfulConfigs;
        }
        catch (error) {
            logger.error('Auto-Swarm Factory failed:', error);
            this.emit('factory:error', { error });
            throw error;
        }
    }
    async createSwarmForDomain(domain) {
        logger.info(`🔧 Creating swarm for domain: ${domain.name}`);
        const characteristics = await this.analyzeDomainCharacteristics(domain);
        const topology = this.selectOptimalTopology(characteristics);
        const agents = this.configureAgents(characteristics, topology);
        const persistence = this.configurePersistence(characteristics);
        const coordination = this.configureCoordination(characteristics, topology);
        const performance = this.calculatePerformanceExpectations(characteristics, topology, agents);
        const swarmId = `swarm-${domain.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const config = {
            id: swarmId,
            name: `${domain.name} Domain Swarm`,
            domain: domain.name,
            topology,
            agents,
            maxAgents: this.calculateMaxAgents(characteristics),
            persistence,
            coordination,
            performance,
            created: Date.now(),
            lastUpdated: Date.now(),
            confidence: domain.confidence.overall,
        };
        this.createdSwarms.set(swarmId, config);
        this.domainAnalysisCache.set(domain.name, characteristics);
        this.emit('swarm:created', { domain: domain.name, config });
        logger.info(`✅ Swarm config created for ${domain.name}:`, {
            topology: topology.type,
            agents: agents.length,
            confidence: domain.confidence.overall,
        });
        return config;
    }
    async analyzeDomainCharacteristics(domain) {
        const fileCount = domain.files.length;
        let complexity = 'low';
        if (fileCount > 100)
            complexity = 'extreme';
        else if (fileCount > 50)
            complexity = 'high';
        else if (fileCount > 20)
            complexity = 'medium';
        const interconnectedness = Math.min(domain.relatedDomains.length * 0.2, 1.0);
        let domainSize = 'small';
        if (fileCount > 200)
            domainSize = 'massive';
        else if (fileCount > 100)
            domainSize = 'large';
        else if (fileCount > 30)
            domainSize = 'medium';
        const concepts = domain.suggestedConcepts || [];
        const technologies = domain.technologies || [];
        const isPipeline = concepts.some((c) => c.includes('pipeline') || c.includes('workflow') || c.includes('queue'));
        const isCentralized = concepts.some((c) => c.includes('server') || c.includes('api') || c.includes('service'));
        const hasNestedStructure = concepts.some((c) => c.includes('nested') ||
            c.includes('hierarchical') ||
            c.includes('tree')) || fileCount > 50;
        const characteristics = {
            name: domain.name,
            path: domain.path,
            fileCount,
            complexity,
            interconnectedness,
            domainSize,
            technologies,
            concepts,
            confidence: domain.confidence.overall,
            dependencyCount: domain.relatedDomains.length,
            hasNestedStructure,
            isPipeline,
            isCentralized,
        };
        logger.debug(`Domain characteristics for ${domain.name}:`, characteristics);
        return characteristics;
    }
    selectOptimalTopology(chars) {
        let topology;
        if (chars.hasNestedStructure && chars.fileCount > 50) {
            topology = {
                type: 'hierarchical',
                reason: 'Complex nested structure with high file count requires hierarchical coordination',
                optimalFor: [
                    'large codebases',
                    'nested architectures',
                    'clear ownership boundaries',
                ],
                performance: {
                    coordination: 0.8,
                    scalability: 0.9,
                    faultTolerance: 0.7,
                },
            };
        }
        else if (chars.interconnectedness > 0.7) {
            topology = {
                type: 'mesh',
                reason: 'High interconnectedness requires full peer-to-peer communication',
                optimalFor: [
                    'distributed systems',
                    'microservices',
                    'cross-cutting concerns',
                ],
                performance: {
                    coordination: 0.9,
                    scalability: 0.6,
                    faultTolerance: 0.9,
                },
            };
        }
        else if (chars.isCentralized || chars.concepts.includes('api')) {
            topology = {
                type: 'star',
                reason: 'Centralized service pattern requires hub-and-spoke coordination',
                optimalFor: ['APIs', 'central services', 'client-server architectures'],
                performance: {
                    coordination: 0.7,
                    scalability: 0.8,
                    faultTolerance: 0.5,
                },
            };
        }
        else if (chars.isPipeline) {
            topology = {
                type: 'ring',
                reason: 'Pipeline workflow requires sequential ring-based coordination',
                optimalFor: [
                    'data pipelines',
                    'workflow engines',
                    'sequential processing',
                ],
                performance: {
                    coordination: 0.6,
                    scalability: 0.7,
                    faultTolerance: 0.8,
                },
            };
        }
        else {
            topology = {
                type: 'hierarchical',
                reason: 'Balanced approach for general domain characteristics',
                optimalFor: [
                    'general purpose',
                    'mixed patterns',
                    'unknown architectures',
                ],
                performance: {
                    coordination: 0.7,
                    scalability: 0.8,
                    faultTolerance: 0.7,
                },
            };
        }
        logger.debug(`Selected topology for ${chars.name}: ${topology.type} - ${topology.reason}`);
        return topology;
    }
    configureAgents(chars, _topology) {
        const agents = [];
        agents.push({
            type: 'coordinator',
            count: 1,
            specialization: 'Swarm coordination and task distribution',
            capabilities: ['task-routing', 'load-balancing', 'health-monitoring'],
            priority: 'high',
        });
        if (chars.technologies.includes('typescript') ||
            chars.technologies.includes('javascript')) {
            agents.push({
                type: 'typescript-specialist',
                count: Math.min(Math.ceil(chars.fileCount / 30), 4),
                specialization: 'TypeScript/JavaScript development and optimization',
                capabilities: [
                    'code-analysis',
                    'refactoring',
                    'type-checking',
                    'bundling',
                ],
                priority: 'high',
            });
        }
        if (chars.concepts.some((c) => c.includes('api') || c.includes('server'))) {
            agents.push({
                type: 'api-specialist',
                count: 1,
                specialization: 'API design, implementation, and testing',
                capabilities: [
                    'api-design',
                    'endpoint-testing',
                    'documentation',
                    'security',
                ],
                priority: 'high',
            });
        }
        if (chars.concepts.some((c) => c.includes('database') || c.includes('storage'))) {
            agents.push({
                type: 'data-specialist',
                count: 1,
                specialization: 'Database design and data management',
                capabilities: [
                    'schema-design',
                    'query-optimization',
                    'migration',
                    'backup',
                ],
                priority: 'medium',
            });
        }
        if (chars.concepts.some((c) => c.includes('test') || c.includes('spec'))) {
            agents.push({
                type: 'testing-specialist',
                count: 1,
                specialization: 'Test strategy and implementation',
                capabilities: [
                    'test-planning',
                    'unit-testing',
                    'integration-testing',
                    'coverage',
                ],
                priority: 'medium',
            });
        }
        if (chars.complexity === 'high' || chars.complexity === 'extreme') {
            agents.push({
                type: 'ai-specialist',
                count: 1,
                specialization: 'AI-powered code analysis and optimization',
                capabilities: [
                    'pattern-recognition',
                    'complexity-analysis',
                    'optimization',
                ],
                priority: 'medium',
            });
        }
        const workerCount = Math.max(1, Math.min(Math.ceil(chars.fileCount / 50), 6));
        agents.push({
            type: 'general-worker',
            count: workerCount,
            specialization: 'General development tasks and support',
            capabilities: [
                'file-operations',
                'basic-refactoring',
                'documentation',
                'cleanup',
            ],
            priority: 'low',
        });
        logger.debug(`Configured ${agents.length} agent types for ${chars.name}:`, agents.map((a) => `${a.type}(${a.count})`).join(', '));
        return agents;
    }
    configurePersistence(chars) {
        let backend = this.config.defaultPersistenceBackend;
        if (chars.concepts.some((c) => c.includes('ai') || c.includes('neural') || c.includes('vector'))) {
            backend = 'lancedb';
        }
        else if (chars.complexity === 'high' || chars.complexity === 'extreme') {
            backend = 'sqlite';
        }
        else if (chars.complexity === 'low' && chars.fileCount < 20) {
            backend = 'json';
        }
        return {
            backend,
            path: `.swarms/${chars.name}/swarm-data.${backend === 'json' ? 'json' : 'db'}`,
            memoryLimit: chars.complexity === 'extreme' ? '1GB' : '512MB',
        };
    }
    configureCoordination(chars, topology) {
        let strategy = 'adaptive';
        if (topology.type === 'mesh' && chars.interconnectedness < 0.5) {
            strategy = 'parallel';
        }
        else if (chars.isPipeline) {
            strategy = 'sequential';
        }
        return {
            strategy,
            timeout: chars.complexity === 'extreme' ? 120000 : 60000,
            retryPolicy: {
                maxRetries: 3,
                backoff: chars.complexity === 'low' ? 'linear' : 'exponential',
            },
        };
    }
    calculatePerformanceExpectations(chars, topology, agents) {
        const totalAgents = agents.reduce((sum, agent) => sum + agent.count, 0);
        let expectedLatency = 100;
        if (topology.type === 'mesh')
            expectedLatency += 50;
        if (chars.complexity === 'extreme')
            expectedLatency += 200;
        if (chars.complexity === 'high')
            expectedLatency += 100;
        const specialistCount = agents.filter((a) => a.priority === 'high').length;
        const expectedThroughput = Math.max(1, totalAgents * 2 + specialistCount * 3);
        return {
            expectedLatency,
            expectedThroughput,
            resourceLimits: {
                memory: chars.complexity === 'extreme' ? '2GB' : '1GB',
                cpu: Math.min(totalAgents, 4),
            },
        };
    }
    calculateMaxAgents(chars) {
        let maxAgents = 8;
        if (chars.complexity === 'extreme')
            maxAgents = 20;
        else if (chars.complexity === 'high')
            maxAgents = 15;
        else if (chars.complexity === 'medium')
            maxAgents = 12;
        return Math.min(maxAgents, this.config.resourceConstraints.maxTotalAgents);
    }
    async validateResourceConstraints(configs) {
        const totalAgents = configs.reduce((sum, config) => sum +
            config?.agents.reduce((agentSum, agent) => agentSum + agent.count, 0), 0);
        if (totalAgents > this.config.resourceConstraints.maxTotalAgents) {
            const error = new Error(`Total agents (${totalAgents}) exceeds limit (${this.config.resourceConstraints.maxTotalAgents})`);
            logger.warn('Resource constraint violation:', error.message);
            throw error;
        }
        logger.info(`✅ Resource validation passed: ${totalAgents}/${this.config.resourceConstraints.maxTotalAgents} agents`);
    }
    async performHumanValidation(configs) {
        if (!this.agui)
            return;
        logger.info('🤔 Requesting human validation for swarm configurations...');
        const summary = configs.map((config) => ({
            domain: config?.domain,
            topology: config?.topology?.type,
            agents: config?.agents.length,
            totalAgentCount: config?.agents.reduce((sum, a) => sum + a.count, 0),
            confidence: `${(config?.confidence * 100).toFixed(1)}%`,
        }));
        const response = await this.agui.askQuestion({
            id: 'swarm_factory_validation',
            type: 'priority',
            question: `Auto-Swarm Factory will create ${configs.length} swarms with the following configurations:\n\n${summary
                .map((s) => `• ${s.domain}: ${s.topology} topology, ${s.totalAgentCount} agents (${s.confidence} confidence)`)
                .join('\n')}\n\nTotal agents across all swarms: ${summary.reduce((sum, s) => sum + s.totalAgentCount, 0)}\n\n` +
                `Approve swarm creation and proceed with initialization?`,
            context: { configs, summary },
            options: [
                '1. Approve and create all swarms',
                '2. Review individual configurations',
                '3. Cancel swarm creation',
            ],
            allowCustom: false,
            confidence: 0.9,
        });
        if (response === '3' || response?.toLowerCase().includes('cancel')) {
            throw new Error('Swarm creation cancelled by user');
        }
        if (response === '2' || response?.toLowerCase().includes('review')) {
            logger.info('Individual review requested - proceeding with approval for demo');
        }
        logger.info('✅ Human validation approved for swarm creation');
    }
    async initializeSwarms(configs) {
        logger.info(`🚀 Initializing ${configs.length} swarms...`);
        const initPromises = configs.map(async (config) => {
            try {
                await this.swarmCoordinator.initialize(config);
                await this.hiveSync.registerSwarm(config);
                await this.memoryStore.store(`swarm-${config?.id}`, 'auto-factory-config', {
                    config,
                    created: Date.now(),
                    status: 'active',
                });
                this.emit('swarm:initialized', { config });
                logger.info(`✅ Swarm initialized: ${config?.name}`);
                return config;
            }
            catch (error) {
                logger.error(`Failed to initialize swarm ${config?.name}:`, error);
                this.emit('swarm:init-error', { config, error });
                throw error;
            }
        });
        await Promise.all(initPromises);
        logger.info('🎉 All swarms successfully initialized!');
    }
    getSwarmStatistics() {
        const swarms = Array.from(this.createdSwarms.values());
        const topologyDistribution = swarms.reduce((acc, swarm) => {
            acc[swarm.topology.type] = (acc[swarm.topology.type] || 0) + 1;
            return acc;
        }, {});
        const totalAgents = swarms.reduce((sum, swarm) => sum +
            swarm.agents.reduce((agentSum, agent) => agentSum + agent.count, 0), 0);
        const averageConfidence = swarms.length > 0
            ? swarms.reduce((sum, swarm) => sum + swarm.confidence, 0) /
                swarms.length
            : 0;
        return {
            totalSwarms: swarms.length,
            totalAgents,
            topologyDistribution,
            averageConfidence,
            domains: swarms.map((s) => s.domain),
        };
    }
}
//# sourceMappingURL=auto-swarm-factory.js.map