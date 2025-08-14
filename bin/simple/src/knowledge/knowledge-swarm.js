import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('KnowledgeSwarm');
import { EventEmitter } from 'node:events';
import { createDao, EntityTypes } from '../database/index.ts';
import { ClientType, uacl } from '../interfaces/clients/index.ts';
import { FACTIntegration } from './knowledge-client.ts';
export class KnowledgeSwarm extends EventEmitter {
    config;
    agents = new Map();
    queryQueue = [];
    isProcessing = false;
    queryCounter = 0;
    vectorRepository;
    vectorDAO;
    static DEFAULT_SPECIALIZATIONS = [
        {
            name: 'documentation-specialist',
            domains: ['react', 'typescript', 'node', 'javascript', 'web-apis'],
            tools: [
                'web_scraper',
                'documentation_parser',
                'api_reference_extractor',
            ],
            priority: 9,
            expertise: ['official-docs', 'api-references', 'migration-guides'],
        },
        {
            name: 'community-knowledge-expert',
            domains: ['stackoverflow', 'github', 'dev-community', 'tutorials'],
            tools: ['stackoverflow_search', 'github_search', 'community_scraper'],
            priority: 8,
            expertise: ['problem-solving', 'code-examples', 'best-practices'],
        },
        {
            name: 'framework-specialist',
            domains: ['react', 'next', 'express', 'fastify', 'vue', 'angular'],
            tools: ['framework_docs', 'changelog_scraper', 'feature_tracker'],
            priority: 9,
            expertise: ['frameworks', 'libraries', 'ecosystem', 'versions'],
        },
        {
            name: 'api-integration-expert',
            domains: ['rest-apis', 'graphql', 'webhooks', 'authentication'],
            tools: [
                'api_documentation_scraper',
                'openapi_parser',
                'postman_importer',
            ],
            priority: 8,
            expertise: ['api-design', 'integration-patterns', 'authentication'],
        },
        {
            name: 'performance-optimization-specialist',
            domains: ['performance', 'optimization', 'benchmarking', 'monitoring'],
            tools: [
                'performance_analyzer',
                'benchmark_scraper',
                'optimization_guide',
            ],
            priority: 7,
            expertise: ['performance-tuning', 'scalability', 'monitoring'],
        },
        {
            name: 'security-compliance-expert',
            domains: ['security', 'compliance', 'authentication', 'encryption'],
            tools: ['security_scanner', 'compliance_checker', 'vulnerability_db'],
            priority: 9,
            expertise: [
                'security-patterns',
                'compliance',
                'vulnerability-analysis',
            ],
        },
    ];
    constructor(config) {
        super();
        this.config = {
            ...config,
            swarmSize: config.swarmSize || 6,
            specializations: config.specializations || KnowledgeSwarm.DEFAULT_SPECIALIZATIONS,
            parallelQueries: config.parallelQueries || 3,
            loadBalancingStrategy: config.loadBalancingStrategy || 'intelligent',
            crossAgentSharing: config.crossAgentSharing !== undefined
                ? config.crossAgentSharing
                : true,
        };
    }
    async initialize() {
        try {
            if (!uacl.isInitialized()) {
                await uacl.initialize({
                    healthCheckInterval: 30000,
                    enableLogging: true,
                });
            }
            if (this.config.persistentStorage) {
                this.vectorDAO = await createDao(EntityTypes.Vector, 'lancedb', {
                    database: './data/knowledge-swarm',
                    options: { vectorSize: 1536 },
                });
                await this.setupKnowledgeStorage();
            }
            await this.createSwarmAgents();
            this.startQueryProcessor();
            this.emit('swarmInitialized', { agentCount: this.agents.size });
        }
        catch (error) {
            logger.error('❌ FACT Swarm initialization failed:', error);
            throw error;
        }
    }
    async querySwarm(query) {
        const startTime = Date.now();
        try {
            const selectedAgents = await this.selectOptimalAgents(query);
            const results = await this.executeParallelQuery(query, selectedAgents);
            const consolidatedResponse = await this.consolidateResults(results);
            if (this.config.persistentStorage) {
                await this.storeKnowledge(query, results);
            }
            if (this.config.crossAgentSharing) {
                await this.shareKnowledge(selectedAgents, results);
            }
            const totalTime = Date.now() - startTime;
            const swarmResult = {
                queryId: query.id,
                results,
                consolidatedResponse,
                agentsUsed: selectedAgents?.map((a) => a.id),
                totalExecutionTime: totalTime,
                knowledgeConfidence: this.calculateConfidence(results),
                sourcesDiversity: this.calculateDiversity(results),
            };
            this.emit('swarmQueryCompleted', swarmResult);
            return swarmResult;
        }
        catch (error) {
            logger.error(`❌ Swarm Query failed [${query.id}]:`, error);
            throw error;
        }
    }
    async getTechnologyDocs(technology, version) {
        const query = {
            id: `tech-docs-${++this.queryCounter}`,
            query: `Get comprehensive documentation for ${technology} ${version ? `version ${version}` : '(latest)'}. Include API reference, guides, examples, and migration notes.`,
            domains: [technology.toLowerCase(), 'documentation', 'api-reference'],
            urgency: 'medium',
            parallel: true,
            metadata: { technology, version, type: 'documentation' },
        };
        return this.querySwarm(query);
    }
    async researchProblem(problem, context) {
        const query = {
            id: `problem-research-${++this.queryCounter}`,
            query: `Research solutions for: ${problem}${context ? `. Context: ${context.join(', ')}` : ''}. Include multiple approaches, code examples, and best practices.`,
            domains: ['stackoverflow', 'github', 'community', 'documentation'],
            urgency: 'high',
            parallel: true,
            metadata: { problem, context, type: 'problem_solving' },
        };
        return this.querySwarm(query);
    }
    async getAPIIntegration(api, language) {
        const query = {
            id: `api-integration-${++this.queryCounter}`,
            query: `Get comprehensive API integration guide for ${api}${language ? ` using ${language}` : ''}. Include authentication, endpoints, examples, and error handling.`,
            domains: ['api-integration', 'documentation', 'examples'],
            urgency: 'medium',
            parallel: true,
            metadata: { api, language, type: 'api_integration' },
        };
        return this.querySwarm(query);
    }
    async getPerformanceOptimization(context) {
        const query = {
            id: `perf-optimization-${++this.queryCounter}`,
            query: `Research performance optimization strategies for: ${context}. Include benchmarking, profiling, and specific optimization techniques.`,
            domains: ['performance', 'optimization', 'benchmarking'],
            urgency: 'medium',
            parallel: true,
            metadata: { context, type: 'performance_optimization' },
        };
        return this.querySwarm(query);
    }
    async getSecurityGuidance(technology, context) {
        const query = {
            id: `security-guidance-${++this.queryCounter}`,
            query: `Get security best practices and vulnerability guidance for ${technology}${context ? ` in context of ${context}` : ''}. Include common vulnerabilities, mitigation strategies, and compliance requirements.`,
            domains: ['security', 'compliance', 'vulnerabilities'],
            urgency: 'high',
            parallel: true,
            metadata: { technology, context, type: 'security_guidance' },
        };
        return this.querySwarm(query);
    }
    async createSwarmAgents() {
        const agentPromises = this.config.specializations
            .slice(0, this.config.swarmSize)
            .map(async (spec, index) => {
            const agentId = `fact-agent-${index}-${spec.name}`;
            try {
                const clientInstance = await uacl.createKnowledgeClient(agentId, this.config.factRepoPath, this.config.anthropicApiKey, {
                    enabled: true,
                    priority: spec.priority,
                    pythonPath: this.config.pythonPath,
                    enableCache: this.config.enableCache,
                    cacheConfig: {
                        prefix: `${this.config.cacheConfig?.prefix || 'fact'}-${spec.name}`,
                        minTokens: this.config.cacheConfig?.minTokens || 100,
                        maxSize: this.config.cacheConfig?.maxSize || '1MB',
                        ttlSeconds: this.config.cacheConfig?.ttlSeconds || 3600,
                    },
                });
                const factInstance = clientInstance.client;
                const agent = {
                    id: agentId,
                    specialization: spec,
                    factInstance,
                    clientInstance,
                    currentLoad: 0,
                    totalQueries: 0,
                    successRate: 1.0,
                    averageLatency: 0,
                    expertise: new Map(spec.expertise.map((e) => [e, 0.8])),
                };
                this.agents.set(agentId, agent);
            }
            catch (error) {
                logger.error(`❌ Failed to create UACL-managed agent ${agentId}:`, error);
                try {
                    const factInstance = new FACTIntegration({
                        factRepoPath: this.config.factRepoPath,
                        anthropicApiKey: this.config.anthropicApiKey,
                        pythonPath: this.config.pythonPath,
                        enableCache: this.config.enableCache,
                        cacheConfig: {
                            prefix: `${this.config.cacheConfig?.prefix || 'fact'}-${spec.name}`,
                            minTokens: this.config.cacheConfig?.minTokens || 100,
                            maxSize: this.config.cacheConfig?.maxSize || '1MB',
                            ttlSeconds: this.config.cacheConfig?.ttlSeconds || 3600,
                        },
                    });
                    const agent = {
                        id: agentId,
                        specialization: spec,
                        factInstance,
                        clientInstance: undefined,
                        currentLoad: 0,
                        totalQueries: 0,
                        successRate: 1.0,
                        averageLatency: 0,
                        expertise: new Map(spec.expertise.map((e) => [e, 0.8])),
                    };
                    this.agents.set(agentId, agent);
                }
                catch (fallbackError) {
                    logger.error(`❌ Both UACL and direct FACT creation failed for ${agentId}:`, fallbackError);
                    throw fallbackError;
                }
            }
        });
        await Promise.all(agentPromises);
    }
    async selectOptimalAgents(query) {
        const candidates = Array.from(this.agents.values());
        switch (this.config.loadBalancingStrategy) {
            case 'specialization':
                return this.selectBySpecialization(candidates, query);
            case 'least-loaded':
                return this.selectLeastLoaded(candidates, query);
            case 'round-robin':
                return this.selectRoundRobin(candidates, query);
            default:
                return this.selectIntelligent(candidates, query);
        }
    }
    selectIntelligent(candidates, query) {
        const scores = candidates.map((agent) => {
            let score = 0;
            const domainMatch = query.domains?.some((domain) => agent.specialization.domains.some((agentDomain) => domain.includes(agentDomain) || agentDomain.includes(domain)));
            if (domainMatch)
                score += 50;
            score += agent.specialization.priority * 5;
            score += agent.successRate * 20;
            score -= agent.currentLoad * 10;
            score -= (agent.averageLatency / 1000) * 5;
            if (query.metadata?.['type']) {
                const expertiseMatch = agent.expertise.has(query.metadata['type']);
                if (expertiseMatch)
                    score += 30;
            }
            return { agent, score };
        });
        scores.sort((a, b) => b.score - a.score);
        const selectedCount = Math.min(query.parallel ? this.config.parallelQueries : 1, Math.max(1, Math.ceil(candidates.length / 2)));
        return scores.slice(0, selectedCount).map((s) => s.agent);
    }
    selectBySpecialization(candidates, query) {
        if (!query.domains || query.domains.length === 0) {
            const firstAgent = candidates[0];
            return firstAgent ? [firstAgent] : [];
        }
        const specialized = candidates.filter((agent) => query.domains.some((domain) => agent.specialization.domains.includes(domain)));
        const fallbackAgent = candidates[0];
        return specialized.length > 0
            ? specialized.slice(0, this.config.parallelQueries)
            : fallbackAgent
                ? [fallbackAgent]
                : [];
    }
    selectLeastLoaded(candidates, query) {
        const sorted = [...candidates].sort((a, b) => a.currentLoad - b.currentLoad);
        return sorted.slice(0, query.parallel ? this.config.parallelQueries : 1);
    }
    selectRoundRobin(candidates, _query) {
        const index = this.queryCounter % candidates.length;
        const selectedAgent = candidates[index];
        return selectedAgent ? [selectedAgent] : [];
    }
    async executeParallelQuery(query, agents) {
        const promises = agents.map(async (agent) => {
            agent.currentLoad++;
            const startTime = Date.now();
            try {
                const result = await agent.factInstance.query({
                    query: query.query,
                    tools: agent.specialization.tools,
                    metadata: {
                        ...query.metadata,
                        agentId: agent.id,
                        specialization: agent.specialization.name,
                    },
                });
                const executionTime = Date.now() - startTime;
                agent.totalQueries++;
                agent.averageLatency =
                    (agent.averageLatency * (agent.totalQueries - 1) + executionTime) /
                        agent.totalQueries;
                return result;
            }
            catch (error) {
                agent.successRate =
                    (agent.successRate * agent.totalQueries) / (agent.totalQueries + 1);
                throw error;
            }
            finally {
                agent.currentLoad--;
            }
        });
        const results = await Promise.allSettled(promises);
        return results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value);
    }
    async consolidateResults(results) {
        if (results.length === 0) {
            return 'No results found from swarm agents.';
        }
        if (results.length === 1) {
            return results[0]?.response || 'No response available';
        }
        const uniqueResults = this.deduplicateResults(results);
        let consolidatedResponse = '# Consolidated Knowledge Swarm Results\\n\\n';
        uniqueResults?.forEach((result, index) => {
            consolidatedResponse += `## Source ${index + 1} (${result?.metadata?.['agentId'] || 'Unknown Agent'})\n`;
            consolidatedResponse += `**Tools Used:** ${result?.toolsUsed?.join(', ')}\n`;
            consolidatedResponse += `**Execution Time:** ${result?.executionTimeMs}ms\n`;
            consolidatedResponse += `**Cache Hit:** ${result?.cacheHit ? 'Yes' : 'No'}\n\n`;
            consolidatedResponse += `${result?.response}\n\n`;
            consolidatedResponse += '---\n\n';
        });
        return consolidatedResponse;
    }
    deduplicateResults(results) {
        const unique = [];
        for (const result of results) {
            const isDuplicate = unique.some((existing) => {
                const similarity = this.calculateSimilarity(existing.response, result?.response);
                return similarity > 0.8;
            });
            if (!isDuplicate) {
                unique.push(result);
            }
        }
        return unique;
    }
    calculateSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\W+/));
        const words2 = new Set(text2.toLowerCase().split(/\W+/));
        const intersection = new Set([...words1].filter((word) => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    async storeKnowledge(query, results) {
        try {
            const documents = results.map((result, index) => ({
                id: `${query.id}-result-${index}`,
                vector: new Array(1536).fill(0).map(() => Math.random()),
                metadata: {
                    queryId: query.id,
                    query: query.query,
                    agentId: result?.metadata?.['agentId'] || 'unknown',
                    specialization: result?.metadata?.['specialization'] || 'general',
                    domains: query.domains?.join(',') || '',
                    timestamp: new Date().toISOString(),
                    executionTime: result?.executionTimeMs.toString(),
                    cacheHit: result?.cacheHit.toString(),
                },
                timestamp: Date.now(),
            }));
            if (this.vectorRepository) {
                for (const doc of documents) {
                    await this.vectorRepository.create({
                        id: doc.id,
                        vector: doc.vector,
                        metadata: doc.metadata,
                    });
                }
            }
        }
        catch (error) {
            logger.error('Failed to store knowledge:', error);
        }
    }
    async shareKnowledge(_agents, results) {
        results.forEach((result) => {
            const agentId = result?.metadata?.['agentId'];
            if (agentId) {
                const agent = this.agents.get(agentId);
                if (agent && result?.executionTimeMs < 5000) {
                    if (result?.metadata?.['type']) {
                        const currentConfidence = agent.expertise.get(result.metadata['type']) || 0.5;
                        agent.expertise.set(result.metadata['type'], Math.min(1.0, currentConfidence + 0.1));
                    }
                }
            }
        });
    }
    calculateConfidence(results) {
        if (results.length === 0)
            return 0;
        let totalConfidence = 0;
        results.forEach((result) => {
            let confidence = 0.5;
            if (result?.cacheHit)
                confidence += 0.2;
            if (result?.executionTimeMs < 1000)
                confidence += 0.1;
            if (result?.toolsUsed.length > 1)
                confidence += 0.1;
            const agent = Array.from(this.agents.values()).find((a) => a.id === result?.metadata?.['agentId']);
            if (agent && agent.successRate > 0.8)
                confidence += 0.1;
            totalConfidence += Math.min(1.0, confidence);
        });
        return totalConfidence / results.length;
    }
    calculateDiversity(results) {
        if (results.length <= 1)
            return 0;
        const agents = new Set(results.map((r) => r.metadata?.['agentId']));
        const tools = new Set(results.flatMap((r) => r.toolsUsed));
        const agentDiversity = agents.size / this.agents.size;
        const toolDiversity = Math.min(1.0, tools.size / 10);
        return (agentDiversity + toolDiversity) / 2;
    }
    async setupKnowledgeStorage() {
        try {
        }
        catch (error) {
            logger.error('Failed to setup knowledge storage:', error);
        }
    }
    startQueryProcessor() { }
    async getSwarmMetrics() {
        const agentMetrics = Array.from(this.agents.values()).map((agent) => ({
            id: agent.id,
            specialization: agent.specialization.name,
            currentLoad: agent.currentLoad,
            totalQueries: agent.totalQueries,
            successRate: agent.successRate,
            averageLatency: agent.averageLatency,
            expertiseAreas: Object.fromEntries(agent.expertise),
        }));
        return {
            totalAgents: this.agents.size,
            agentMetrics,
            queueSize: this.queryQueue.length,
            isProcessing: this.isProcessing,
            totalQueries: this.queryCounter,
            configuration: {
                swarmSize: this.config.swarmSize,
                parallelQueries: this.config.parallelQueries,
                loadBalancingStrategy: this.config.loadBalancingStrategy,
            },
        };
    }
    async shutdown() {
        const shutdownPromises = Array.from(this.agents.values()).map((agent) => agent.factInstance.shutdown());
        await Promise.all(shutdownPromises);
        this.agents.clear();
        this.queryQueue = [];
        this.isProcessing = false;
        this.emit('swarmShutdown');
    }
    getSwarmHealth() {
        const agents = Array.from(this.agents.values());
        const healthyAgents = agents.filter((agent) => agent.clientInstance?.status === 'connected').length;
        const averageLoad = agents.length > 0
            ? agents.reduce((sum, a) => sum + a.currentLoad, 0) / agents.length
            : 0;
        const totalQueries = agents.reduce((sum, a) => sum + a.totalQueries, 0);
        const averageSuccessRate = agents.length > 0
            ? agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length
            : 1.0;
        const knowledgeClients = uacl.getClientsByType(ClientType.KNOWLEDGE);
        const uaclStatus = {
            knowledgeClients: knowledgeClients.length,
            healthyKnowledgeClients: knowledgeClients.filter((c) => c.status === 'connected').length,
            overallHealth: uacl.getHealthStatus(),
        };
        return {
            agentCount: agents.length,
            healthyAgents,
            averageLoad,
            totalQueries,
            successRate: averageSuccessRate,
            uaclStatus,
        };
    }
    getAgentMetrics() {
        return Array.from(this.agents.values()).map((agent) => ({
            id: agent.id,
            specialization: agent.specialization.name,
            load: agent.currentLoad,
            queries: agent.totalQueries,
            successRate: agent.successRate,
            latency: agent.averageLatency,
            clientStatus: agent.clientInstance?.status || 'unknown',
            expertise: Object.fromEntries(agent.expertise),
        }));
    }
}
let globalFACTSwarm = null;
export async function initializeFACTSwarm(config) {
    if (globalFACTSwarm) {
        return globalFACTSwarm;
    }
    globalFACTSwarm = new KnowledgeSwarm(config);
    await globalFACTSwarm.initialize();
    return globalFACTSwarm;
}
export function getFACTSwarm() {
    return globalFACTSwarm;
}
export const FACTSwarmHelpers = {
    async researchProblem(problem, context) {
        const swarm = getFACTSwarm();
        if (!swarm)
            throw new Error('FACT Swarm not initialized');
        const result = await swarm.researchProblem(problem, context);
        return result?.consolidatedResponse;
    },
    async getTechDocs(technology, version) {
        const swarm = getFACTSwarm();
        if (!swarm)
            throw new Error('FACT Swarm not initialized');
        const result = await swarm.getTechnologyDocs(technology, version);
        return result?.consolidatedResponse;
    },
    async getAPIGuidance(api, language) {
        const swarm = getFACTSwarm();
        if (!swarm)
            throw new Error('FACT Swarm not initialized');
        const result = await swarm.getAPIIntegration(api, language);
        return result?.consolidatedResponse;
    },
    async getPerformanceGuidance(context) {
        const swarm = getFACTSwarm();
        if (!swarm)
            throw new Error('FACT Swarm not initialized');
        const result = await swarm.getPerformanceOptimization(context);
        return result?.consolidatedResponse;
    },
    async getSecurityGuidance(technology, context) {
        const swarm = getFACTSwarm();
        if (!swarm)
            throw new Error('FACT Swarm not initialized');
        const result = await swarm.getSecurityGuidance(technology, context);
        return result?.consolidatedResponse;
    },
};
export default KnowledgeSwarm;
//# sourceMappingURL=knowledge-swarm.js.map