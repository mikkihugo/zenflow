import { EventEmitter } from 'node:events';
export class PersistentLearningSystem extends EventEmitter {
    eventBus;
    logger;
    agentKnowledge = new Map();
    globalPatterns = [];
    swarmMemories = new Map();
    crossSwarmLearnings = [];
    constructor(eventBus, logger) {
        super();
        this.eventBus = eventBus;
        this.logger = logger;
        this.setupEventHandlers();
        this.startPeriodicLearning();
    }
    async injectKnowledgeIntoSwarm(swarmId, agentTypes) {
        this.logger?.info('Injecting knowledge into new swarm', {
            swarmId,
            agentTypes: agentTypes.length,
        });
        const swarmMemory = {
            content: { swarmId, agentTypes, injectedKnowledge: [] },
            metadata: {
                source: 'persistent-learning-system',
                confidence: 0.8,
                expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
                tags: ['swarm-knowledge', 'injection'],
            },
            swarmId,
            agentTypes,
            injectedKnowledge: [],
            createdAt: new Date(),
            performance: {
                expectedSuccess: 0,
                riskFactors: [],
                recommendations: [],
            },
        };
        for (const agentType of agentTypes) {
            const knowledge = this.agentKnowledge.get(agentType);
            if (knowledge) {
                const relevantKnowledge = this.filterRelevantKnowledge(knowledge, swarmMemory);
                swarmMemory.injectedKnowledge.push({
                    agentType,
                    experiences: relevantKnowledge.experiences,
                    patterns: relevantKnowledge.patterns,
                    bestPractices: relevantKnowledge.bestPractices,
                });
                swarmMemory.performance.expectedSuccess +=
                    knowledge.performance.successfulTasks /
                        knowledge.performance.totalTasks;
            }
        }
        swarmMemory.performance.expectedSuccess /= agentTypes.length;
        swarmMemory.crossSwarmInsights = this.getCrossSwarmInsights(agentTypes);
        this.swarmMemories.set(swarmId, swarmMemory);
        this.eventBus.emit('swarm:knowledge:inject', {
            id: `swarm-knowledge-inject-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            version: '1.0.0',
            swarmId,
            knowledgeType: 'patterns',
            knowledge: {
                content: swarmMemory.content,
                metadata: swarmMemory.metadata,
            },
            source: 'persistent-learning-system',
            distributionScope: 'all-agents',
            timestamp: new Date(),
            persistenceRequested: true,
        });
        this.emit('knowledge:injected', { swarmId, agentTypes: agentTypes.length });
    }
    async collectSwarmLearnings(swarmId, swarmResults) {
        this.logger?.info('Collecting learnings from completed swarm', { swarmId });
        const swarmMemory = this.swarmMemories.get(swarmId);
        if (!swarmMemory)
            return;
        for (const agentResult of swarmResults?.agentResults) {
            await this.processAgentLearnings(agentResult, swarmMemory);
        }
        await this.extractGlobalPatterns(swarmResults);
        await this.updateCrossSwarmLearnings(swarmResults);
        this.archiveSwarmMemory(swarmId, swarmResults);
        this.emit('learnings:collected', {
            swarmId,
            insights: swarmResults?.insights?.length || 0,
        });
    }
    async processAgentLearnings(agentResult, swarmMemory) {
        let knowledge = this.agentKnowledge.get(agentResult?.agentType);
        if (!knowledge) {
            knowledge = this.initializeAgentKnowledge(agentResult?.agentType);
            this.agentKnowledge.set(agentResult?.agentType, knowledge);
        }
        const experience = {
            id: `exp_${Date.now()}_${agentResult?.agentId}`,
            timestamp: new Date(),
            swarmId: swarmMemory.swarmId,
            taskType: agentResult?.taskType,
            context: agentResult?.context,
            actions: agentResult?.actions,
            outcome: agentResult?.outcome,
            lessons: agentResult?.lessonsLearned,
            confidence: agentResult?.confidence,
        };
        knowledge.experiences.push(experience);
        knowledge.performance.totalTasks++;
        if (agentResult?.outcome?.success) {
            knowledge.performance.successfulTasks++;
        }
        knowledge.performance.averageExecutionTime =
            (knowledge.performance.averageExecutionTime *
                (knowledge.performance.totalTasks - 1) +
                agentResult?.executionTime) /
                knowledge.performance.totalTasks;
        knowledge.performance.qualityScores.push(agentResult?.outcome?.quality);
        await this.extractAgentPatterns(knowledge, agentResult);
        await this.updateAgentCapabilities(knowledge, agentResult);
        await this.updateAgentRelationships(knowledge, agentResult, swarmMemory);
        knowledge.lastUpdated = new Date();
        knowledge.version++;
        this.logger?.debug('Agent knowledge updated', {
            agentType: agentResult?.agentType,
            totalExperiences: knowledge.experiences.length,
            successRate: knowledge.performance.successfulTasks /
                knowledge.performance.totalTasks,
        });
    }
    async extractAgentPatterns(knowledge, agentResult) {
        const actionSequence = agentResult?.actions
            .map((a) => a.action)
            .join(' -> ');
        let pattern = knowledge.patterns.find((p) => p.pattern === actionSequence);
        if (pattern) {
            pattern.frequency++;
            pattern.lastReinforced = new Date();
            if (agentResult?.outcome?.success) {
                pattern.successRate =
                    (pattern.successRate * (pattern.frequency - 1) + 1) /
                        pattern.frequency;
            }
            else {
                pattern.successRate =
                    (pattern.successRate * (pattern.frequency - 1)) / pattern.frequency;
            }
        }
        else if (agentResult?.actions.length > 1) {
            pattern = {
                id: `pattern_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                pattern: actionSequence,
                frequency: 1,
                successRate: agentResult?.outcome?.success ? 1 : 0,
                contexts: [agentResult?.context?.domain],
                examples: [agentResult?.taskType],
                discovered: new Date(),
                lastReinforced: new Date(),
            };
            knowledge.patterns.push(pattern);
        }
    }
    async updateAgentCapabilities(knowledge, agentResult) {
        for (const action of agentResult?.actions) {
            if (action.success && action.impact > 0.7) {
                let skill = knowledge.capabilities.acquiredSkills.find((s) => s.skill === action.action);
                if (skill) {
                    skill.usageCount++;
                    skill.lastUsed = new Date();
                    skill.proficiency = Math.min(100, skill.proficiency + action.impact * 2);
                    skill.successRate =
                        (skill.successRate * (skill.usageCount - 1) +
                            (action.success ? 1 : 0)) /
                            skill.usageCount;
                }
                else {
                    skill = {
                        skill: action.action,
                        proficiency: Math.min(100, action.impact * 50),
                        acquiredAt: new Date(),
                        lastUsed: new Date(),
                        usageCount: 1,
                        successRate: action.success ? 1 : 0,
                    };
                    knowledge.capabilities.acquiredSkills.push(skill);
                }
            }
        }
        const domain = agentResult?.context?.domain;
        let specialization = knowledge.capabilities.specializations.find((s) => s.domain === domain);
        if (specialization) {
            const performanceBonus = (agentResult?.outcome?.quality / 100) * 5;
            specialization.expertise = Math.min(100, specialization.expertise + performanceBonus);
        }
        else if (agentResult?.outcome?.quality > 70) {
            specialization = {
                domain,
                expertise: agentResult?.outcome?.quality / 2,
                keyPatterns: [agentResult?.actions.map((a) => a.action).join(' -> ')],
                tools: agentResult?.actions
                    .map((a) => a.parameters['tool'])
                    .filter(Boolean),
                bestPractices: agentResult?.lessonsLearned,
            };
            knowledge.capabilities.specializations.push(specialization);
        }
    }
    async updateAgentRelationships(knowledge, agentResult, swarmMemory) {
        const otherAgentTypes = swarmMemory.agentTypes.filter((type) => type !== agentResult?.agentType);
        for (const partnerType of otherAgentTypes) {
            let collaboration = knowledge.relationships.collaborations.find((c) => c.partnerAgentType === partnerType);
            if (collaboration) {
                collaboration.frequency++;
                if (!collaboration.taskTypes.includes(agentResult?.taskType)) {
                    collaboration.taskTypes.push(agentResult?.taskType);
                }
                const taskSuccess = agentResult?.outcome?.success ? 1 : 0;
                collaboration.successRate =
                    (collaboration.successRate * (collaboration.frequency - 1) +
                        taskSuccess) /
                        collaboration.frequency;
            }
            else {
                collaboration = {
                    partnerAgentType: partnerType,
                    taskTypes: [agentResult?.taskType],
                    successRate: agentResult?.outcome?.success ? 1 : 0,
                    synergy: agentResult?.outcome?.efficiency / 100,
                    frequency: 1,
                };
                knowledge.relationships.collaborations.push(collaboration);
            }
        }
    }
    filterRelevantKnowledge(knowledge, _swarmMemory) {
        const relevantExperiences = knowledge.experiences
            .filter((exp) => exp.confidence > 0.7)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        const relevantPatterns = knowledge.patterns
            .filter((pattern) => pattern.successRate > 0.8 && pattern.frequency > 2)
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 5);
        const bestPractices = knowledge.capabilities.specializations
            .flatMap((spec) => spec.bestPractices)
            .concat(relevantExperiences.flatMap((exp) => exp.lessons))
            .filter((practice, index, arr) => arr.indexOf(practice) === index)
            .slice(0, 10);
        return {
            experiences: relevantExperiences,
            patterns: relevantPatterns,
            bestPractices,
        };
    }
    getCrossSwarmInsights(agentTypes) {
        return this.crossSwarmLearnings
            .filter((learning) => learning.agentCombination.some((type) => agentTypes.includes(type)))
            .map((learning) => ({
            insight: learning.insight,
            applicability: learning.confidence,
            evidence: learning.examples.length,
        }));
    }
    initializeAgentKnowledge(agentType) {
        return {
            agentType,
            experiences: [],
            patterns: [],
            capabilities: {
                baseCapabilities: [],
                acquiredSkills: [],
                specializations: [],
                adaptations: [],
            },
            performance: {
                totalTasks: 0,
                successfulTasks: 0,
                averageExecutionTime: 0,
                qualityScores: [],
                improvementTrend: 0,
                benchmarks: [],
            },
            relationships: {
                collaborations: [],
                synergies: [],
                conflicts: [],
            },
            lastUpdated: new Date(),
            version: 1,
        };
    }
    async extractGlobalPatterns(swarmResults) {
        const patterns = swarmResults?.insights?.filter((insight) => insight.type === 'pattern' && insight.confidence > 0.8);
        for (const patternInsight of patterns || []) {
            const globalPattern = this.globalPatterns.find((gp) => gp.pattern === patternInsight.description);
            if (globalPattern) {
                globalPattern.frequency++;
                globalPattern.reinforcedAt = new Date();
            }
            else {
                this.globalPatterns.push({
                    id: `global_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    pattern: patternInsight.description,
                    frequency: 1,
                    discoveredAt: new Date(),
                    reinforcedAt: new Date(),
                    applicableContexts: [swarmResults?.context],
                    impact: patternInsight.impact || 1,
                });
            }
        }
    }
    async updateCrossSwarmLearnings(swarmResults) {
        const agentTypes = swarmResults?.agentResults.map((r) => r.agentType);
        const overallSuccess = swarmResults?.overallSuccess;
        if (overallSuccess > 0.8) {
            const learning = this.crossSwarmLearnings.find((csl) => csl.agentCombination.length === agentTypes.length &&
                csl.agentCombination.every((type) => agentTypes.includes(type)));
            if (learning) {
                learning.frequency++;
                learning.confidence = Math.min(1.0, learning.confidence + 0.1);
                learning.examples.push({
                    swarmId: swarmResults?.swarmId,
                    success: overallSuccess,
                    context: swarmResults?.context,
                });
            }
            else {
                this.crossSwarmLearnings.push({
                    id: `cross_${Date.now()}`,
                    agentCombination: agentTypes,
                    insight: `Combination of ${agentTypes.join(' + ')} works well for ${swarmResults?.context}`,
                    frequency: 1,
                    confidence: 0.7,
                    discoveredAt: new Date(),
                    examples: [
                        {
                            swarmId: swarmResults?.swarmId,
                            success: overallSuccess,
                            context: swarmResults?.context,
                        },
                    ],
                });
            }
        }
    }
    archiveSwarmMemory(swarmId, swarmResults) {
        const swarmMemory = this.swarmMemories.get(swarmId);
        if (swarmMemory) {
            swarmMemory.completedAt = new Date();
            swarmMemory.finalPerformance = {
                actualSuccess: swarmResults?.overallSuccess,
                efficiency: swarmResults?.efficiency,
                quality: swarmResults?.quality,
                insights: swarmResults?.insights?.length || 0,
            };
            this.swarmMemories.delete(swarmId);
        }
    }
    setupEventHandlers() {
        this.eventBus.on('swarm:created', (data) => {
            this.injectKnowledgeIntoSwarm(data?.['swarmId'], [
                ...(data?.['agentTypes'] || []),
            ]);
        });
        this.eventBus.on('swarm:completed', (data) => {
            const results = data?.['results'] ||
                {
                    swarmId: data?.['swarmId'],
                    context: 'completion',
                    overallSuccess: 1.0,
                    efficiency: 0.8,
                    quality: 0.8,
                    agentResults: [],
                    learnings: [],
                };
            this.collectSwarmLearnings(data?.['swarmId'], results);
        });
    }
    startPeriodicLearning() {
        setInterval(() => {
            this.consolidateLearnings();
        }, 300000);
    }
    consolidateLearnings() {
        for (const knowledge of this.agentKnowledge.values()) {
            knowledge.patterns = knowledge.patterns.filter((pattern) => pattern.frequency > 1 || pattern.successRate > 0.6);
        }
        for (const knowledge of this.agentKnowledge.values()) {
            if (knowledge.experiences.length > 100) {
                knowledge.experiences = knowledge.experiences
                    .sort((a, b) => {
                    const aScore = a.confidence * 0.7 +
                        ((Date.now() - a.timestamp.getTime()) / 86400000) * 0.3;
                    const bScore = b.confidence * 0.7 +
                        ((Date.now() - b.timestamp.getTime()) / 86400000) * 0.3;
                    return bScore - aScore;
                })
                    .slice(0, 50);
            }
        }
        this.emit('learnings:consolidated');
    }
    getAgentKnowledgeSummary(agentType) {
        const knowledge = this.agentKnowledge.get(agentType);
        if (!knowledge)
            return null;
        return {
            agentType,
            totalExperiences: knowledge.experiences.length,
            successRate: knowledge.performance.successfulTasks /
                Math.max(knowledge.performance.totalTasks, 1),
            topPatterns: knowledge.patterns
                .sort((a, b) => b.successRate - a.successRate)
                .slice(0, 3)
                .map((p) => ({ pattern: p.pattern, successRate: p.successRate })),
            specializations: knowledge.capabilities.specializations.map((s) => ({
                domain: s.domain,
                expertise: s.expertise,
            })),
            lastUpdated: knowledge.lastUpdated,
        };
    }
}
export default PersistentLearningSystem;
//# sourceMappingURL=persistent-learning-system.js.map