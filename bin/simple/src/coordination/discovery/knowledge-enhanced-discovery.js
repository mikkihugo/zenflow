import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('Knowledge-Aware-Discovery');
export class KnowledgeAwareDiscovery extends EventEmitter {
    config;
    hiveFact;
    swarmKnowledge;
    memoryStore;
    appliedPatterns = new Map();
    constructor(config, hiveFact, swarmKnowledge, memoryStore) {
        super();
        this.config = {
            useHiveFACT: true,
            useSwarmKnowledge: true,
            knowledgeWeight: 0.4,
            confidenceThreshold: 0.7,
            maxKnowledgeQueries: 10,
            ...config,
        };
        this.hiveFact = hiveFact;
        this.swarmKnowledge = swarmKnowledge;
        this.memoryStore = memoryStore;
    }
    async applyKnowledgeInsights(originalDomains, context) {
        logger.info(`Applying knowledge insights for ${originalDomains.length} domains`);
        try {
            const projectKnowledge = await this.loadProjectKnowledge(context);
            const knowledgeAwareDomains = [];
            for (const domain of originalDomains) {
                const knowledgeAware = await this.applyDomainKnowledge(domain, projectKnowledge, context);
                knowledgeAwareDomains.push(knowledgeAware);
            }
            await this.applyCrossDomainKnowledge(knowledgeAwareDomains, projectKnowledge);
            this.adjustConfidenceWithKnowledge(knowledgeAwareDomains);
            await this.storeKnowledgeAwareResults(knowledgeAwareDomains, context);
            logger.info(`Successfully applied knowledge insights to ${knowledgeAwareDomains.length} domains`);
            this.emit('discovery:knowledge-applied', {
                domains: knowledgeAwareDomains,
                context,
            });
            return knowledgeAwareDomains;
        }
        catch (error) {
            logger.error('Failed to enhance discovery with knowledge:', error);
            return originalDomains.map((domain) => this.createMinimalKnowledgeInsights(domain));
        }
    }
    async loadProjectKnowledge(context) {
        const knowledgeMap = new Map();
        let queryCount = 0;
        try {
            if (this.config.useHiveFACT &&
                this.hiveFact &&
                queryCount < this.config.maxKnowledgeQueries) {
                for (const domain of context.domains) {
                    if (queryCount >= this.config.maxKnowledgeQueries)
                        break;
                    const domainKnowledge = await this.queryHiveFACTForDomain(domain, context);
                    if (domainKnowledge) {
                        knowledgeMap.set(domain, domainKnowledge);
                        queryCount++;
                    }
                }
            }
            if (this.config.useSwarmKnowledge &&
                this.swarmKnowledge &&
                queryCount < this.config.maxKnowledgeQueries) {
                for (const domain of context.domains) {
                    if (queryCount >= this.config.maxKnowledgeQueries)
                        break;
                    const swarmKnowledge = await this.querySwarmKnowledgeForDomain(domain, context);
                    if (swarmKnowledge) {
                        const existing = knowledgeMap.get(domain);
                        if (existing) {
                            knowledgeMap.set(domain, this.mergeKnowledge(existing, swarmKnowledge));
                        }
                        else {
                            knowledgeMap.set(domain, swarmKnowledge);
                        }
                        queryCount++;
                    }
                }
            }
            for (const tech of context.technologies.slice(0, 3)) {
                if (queryCount >= this.config.maxKnowledgeQueries)
                    break;
                const techKnowledge = await this.queryTechnologyPatterns(tech, context);
                if (techKnowledge) {
                    knowledgeMap.set(`tech-${tech}`, techKnowledge);
                    queryCount++;
                }
            }
            logger.debug(`Loaded knowledge for ${knowledgeMap.size} domains/technologies with ${queryCount} queries`);
            return knowledgeMap;
        }
        catch (error) {
            logger.error('Error loading project knowledge:', error);
            return knowledgeMap;
        }
    }
    async queryHiveFACTForDomain(domain, context) {
        try {
            const query = `domain patterns for ${domain} in ${context.projectType} projects`;
            const facts = await this.hiveFact?.searchFacts({
                query,
                limit: 5,
            });
            if (!facts || facts.length === 0)
                return null;
            return this.convertFactsToDomainKnowledge(domain, facts, 'hive-fact');
        }
        catch (error) {
            logger.warn(`Failed to query Hive FACT for domain ${domain}:`, error);
            return null;
        }
    }
    async querySwarmKnowledgeForDomain(domain, context) {
        try {
            const query = `successful patterns for ${domain} domain in ${context.size} projects`;
            const knowledge = await this.swarmKnowledge?.queryKnowledge(query, domain);
            if (!(knowledge && knowledge.results))
                return null;
            return this.convertSwarmKnowledgeToDomainKnowledge(domain, knowledge, 'swarm-learning');
        }
        catch (error) {
            logger.warn(`Failed to query swarm knowledge for domain ${domain}:`, error);
            return null;
        }
    }
    async queryTechnologyPatterns(technology, _context) {
        try {
            let knowledge = null;
            if (this.hiveFact) {
                const query = `${technology} architecture patterns and best practices`;
                const facts = await this.hiveFact.searchFacts({ query, limit: 3 });
                if (facts.length > 0) {
                    knowledge = this.convertFactsToDomainKnowledge(`tech-${technology}`, facts, 'hive-fact');
                }
            }
            if (!knowledge && this.swarmKnowledge) {
                const query = `${technology} implementation patterns and optimization`;
                const swarmData = await this.swarmKnowledge.queryKnowledge(query, 'technology');
                if (swarmData) {
                    knowledge = this.convertSwarmKnowledgeToDomainKnowledge(`tech-${technology}`, swarmData, 'swarm-learning');
                }
            }
            return knowledge;
        }
        catch (error) {
            logger.warn(`Failed to query technology patterns for ${technology}:`, error);
            return null;
        }
    }
    async applyDomainKnowledge(domain, projectKnowledge, _context) {
        const domainKnowledge = projectKnowledge.get(domain.name) ||
            this.findBestMatchingKnowledge(domain, projectKnowledge);
        let appliedPatterns = [];
        let knowledgeScore = 0;
        let recommendedTopology = domain.suggestedTopology || 'mesh';
        let recommendedAgents = [];
        let riskFactors = [];
        let optimizations = [];
        if (domainKnowledge) {
            appliedPatterns = this.selectRelevantPatterns(domain, domainKnowledge);
            knowledgeScore = this.calculateKnowledgeScore(domain, domainKnowledge, appliedPatterns);
            const topologyRec = this.getTopologyRecommendation(domain, appliedPatterns);
            if (topologyRec &&
                ['mesh', 'hierarchical', 'ring', 'star'].includes(topologyRec)) {
                recommendedTopology = topologyRec;
            }
            recommendedAgents = this.getAgentRecommendations(domain, appliedPatterns);
            riskFactors = this.identifyRiskFactors(domain, domainKnowledge);
            optimizations = this.generateOptimizations(domain, domainKnowledge, appliedPatterns);
            this.appliedPatterns.set(domain.name, appliedPatterns);
        }
        const originalConfidence = domain.confidence;
        const knowledgeAwareConfidence = this.calculateKnowledgeAwareConfidence(originalConfidence, knowledgeScore);
        const knowledgeAware = {
            ...domain,
            confidence: knowledgeAwareConfidence,
            knowledgeInsights: {
                appliedPatterns,
                knowledgeScore,
                recommendedTopology,
                recommendedAgents,
                riskFactors,
                optimizations,
            },
        };
        logger.debug(`Applied knowledge to domain ${domain.name}: confidence ${originalConfidence} -> ${knowledgeAwareConfidence}, patterns: ${appliedPatterns.length}`);
        return knowledgeAware;
    }
    async applyCrossDomainKnowledge(domains, projectKnowledge) {
        for (let i = 0; i < domains.length; i++) {
            for (let j = i + 1; j < domains.length; j++) {
                const domain1 = domains[i];
                const domain2 = domains[j];
                if (!(domain1 && domain2))
                    continue;
                const relationshipStrength = this.calculateDomainRelationshipStrength(domain1, domain2, projectKnowledge);
                if (relationshipStrength > 0.6) {
                    if (!domain1.relatedDomains)
                        domain1.relatedDomains = [];
                    if (!domain2.relatedDomains)
                        domain2.relatedDomains = [];
                    domain1.relatedDomains.push(domain2.name);
                    domain2.relatedDomains.push(domain1.name);
                    this.applyCrossDomainOptimizations(domain1, domain2, relationshipStrength);
                }
            }
        }
    }
    convertFactsToDomainKnowledge(domain, facts, source) {
        const patterns = [];
        const bestPractices = [];
        const commonPitfalls = [];
        const relatedDomains = [];
        const toolRecommendations = [];
        for (const fact of facts) {
            const content = typeof fact.content === 'string'
                ? JSON.parse(fact.content)
                : fact.content;
            if (content.patterns) {
                patterns.push(...this.extractPatternsFromContent(content.patterns));
            }
            if (content.bestPractices || content.insights) {
                bestPractices.push(...(content.bestPractices || content.insights || []));
            }
            if (content.commonPitfalls || content.failures) {
                commonPitfalls.push(...(content.commonPitfalls || content.failures || []));
            }
            if (content.relatedDomains || content.dependencies) {
                relatedDomains.push(...(content.relatedDomains || content.dependencies || []));
            }
            if (content.tools || content.recommendations) {
                toolRecommendations.push(...(content.tools || content.recommendations || []));
            }
        }
        return {
            domain,
            patterns,
            bestPractices,
            commonPitfalls,
            relatedDomains,
            toolRecommendations,
            confidenceScore: this.calculateAverageConfidence(facts),
            source,
        };
    }
    convertSwarmKnowledgeToDomainKnowledge(domain, swarmData, source) {
        const patterns = this.extractPatternsFromSwarmData(swarmData);
        const bestPractices = swarmData?.insights?.whatWorked || [];
        const commonPitfalls = swarmData?.insights?.whatFailed || [];
        const optimizations = swarmData?.insights?.optimizations || [];
        return {
            domain,
            patterns,
            bestPractices,
            commonPitfalls,
            relatedDomains: [],
            toolRecommendations: optimizations,
            confidenceScore: swarmData?.confidence || 0.8,
            source,
        };
    }
    findBestMatchingKnowledge(domain, projectKnowledge) {
        let bestMatch = null;
        let bestScore = 0;
        for (const [_key, knowledge] of projectKnowledge) {
            const similarity = this.calculateDomainSimilarity(domain, knowledge);
            if (similarity > bestScore && similarity > 0.3) {
                bestScore = similarity;
                bestMatch = knowledge;
            }
        }
        return bestMatch;
    }
    selectRelevantPatterns(_domain, knowledge) {
        return knowledge.patterns.filter((pattern) => pattern.confidenceScore > 0.6);
    }
    calculateKnowledgeScore(_domain, knowledge, patterns) {
        return ((knowledge.confidenceScore +
            patterns.reduce((sum, p) => sum + p.confidenceScore, 0) /
                Math.max(patterns.length, 1)) /
            2);
    }
    getTopologyRecommendation(_domain, patterns) {
        const topologies = patterns.map((p) => p.topology);
        return this.getMostCommon(topologies);
    }
    getAgentRecommendations(_domain, patterns) {
        const allAgents = patterns.flatMap((p) => p.agentTypes);
        return [...new Set(allAgents)];
    }
    identifyRiskFactors(_domain, knowledge) {
        return knowledge.commonPitfalls.slice(0, 5);
    }
    generateOptimizations(_domain, knowledge, _patterns) {
        return knowledge.bestPractices.slice(0, 5);
    }
    calculateKnowledgeAwareConfidence(originalConfidence, knowledgeScore) {
        const weight = this.config.knowledgeWeight;
        return originalConfidence * (1 - weight) + knowledgeScore * weight;
    }
    adjustConfidenceWithKnowledge(_domains) {
    }
    async storeKnowledgeAwareResults(domains, context) {
        if (!this.memoryStore)
            return;
        try {
            await this.memoryStore.store(`knowledge-aware-discovery/${this.config.swarmId}/${Date.now()}`, 'knowledge-aware-discovery', { domains, context, timestamp: Date.now() });
        }
        catch (error) {
            logger.error('Failed to store knowledge-aware discovery results:', error);
        }
    }
    createMinimalKnowledgeInsights(domain) {
        return {
            ...domain,
            knowledgeInsights: {
                appliedPatterns: [],
                knowledgeScore: 0,
                recommendedTopology: domain.suggestedTopology || 'mesh',
                recommendedAgents: [],
                riskFactors: [],
                optimizations: [],
            },
        };
    }
    extractPatternsFromContent(_content) {
        return [];
    }
    extractPatternsFromSwarmData(_data) {
        return [];
    }
    calculateAverageConfidence(facts) {
        if (facts.length === 0)
            return 0;
        return (facts.reduce((sum, fact) => sum + (fact.metadata?.confidence || 0.5), 0) /
            facts.length);
    }
    calculateDomainSimilarity(_domain, _knowledge) {
        return 0.5;
    }
    calculateDomainRelationshipStrength(_domain1, _domain2, _knowledge) {
        return 0.5;
    }
    applyCrossDomainOptimizations(_domain1, _domain2, _strength) {
    }
    mergeKnowledge(existing, additional) {
        return {
            ...existing,
            patterns: [...existing.patterns, ...additional.patterns],
            bestPractices: [...existing.bestPractices, ...additional.bestPractices],
            commonPitfalls: [
                ...existing.commonPitfalls,
                ...additional.commonPitfalls,
            ],
            confidenceScore: (existing.confidenceScore + additional.confidenceScore) / 2,
        };
    }
    getMostCommon(items) {
        if (items.length === 0)
            return null;
        const counts = new Map();
        for (const item of items) {
            counts.set(item, (counts.get(item) || 0) + 1);
        }
        return Array.from(counts.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }
}
export default KnowledgeAwareDiscovery;
//# sourceMappingURL=knowledge-enhanced-discovery.js.map