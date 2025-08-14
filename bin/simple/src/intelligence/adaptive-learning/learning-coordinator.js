var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { EventEmitter } from 'node:events';
import { CORE_TOKENS, inject, injectable } from '../../di/index.ts';
let LearningCoordinator = class LearningCoordinator extends EventEmitter {
    _logger;
    agents = new Map();
    knowledgeBase = new Map();
    expertiseTracking = new Map();
    bestPractices = new Map();
    antiPatterns = new Map();
    learningHistory = new Map();
    config;
    context;
    constructor(config, context, _logger) {
        super();
        this._logger = _logger;
        this.config = config;
        this.context = context;
        this.startLearningCoordination();
    }
    async coordinateLearning(agents) {
        for (const agent of agents) {
            this.agents.set(agent.id, agent);
        }
        const learningStrategy = this.determineLearningStrategy(agents);
        const learningResults = await this.executeLearning(agents, learningStrategy);
        const aggregatedResult = this.aggregateLearningResults(learningResults);
        await this.updateKnowledgeBase(aggregatedResult?.patterns);
        this.trackLearningProgress(agents, aggregatedResult);
        this.emit('learningCompleted', {
            agents: agents.map((a) => a.id),
            result: aggregatedResult,
            timestamp: Date.now(),
        });
        return aggregatedResult;
    }
    async updateKnowledgeBase(patterns) {
        for (const pattern of patterns) {
            const existing = this.knowledgeBase.get(pattern.id);
            if (existing) {
                const updated = this.mergePatterns(existing, pattern);
                this.knowledgeBase.set(pattern.id, updated);
                this.emit('knowledgeUpdated', {
                    patternId: pattern.id,
                    type: 'updated',
                    confidence: updated.confidence,
                    timestamp: Date.now(),
                });
            }
            else {
                this.knowledgeBase.set(pattern.id, pattern);
                this.emit('knowledgeAdded', {
                    patternId: pattern.id,
                    type: pattern.type,
                    confidence: pattern.confidence,
                    timestamp: Date.now(),
                });
            }
        }
        this.pruneKnowledgeBase();
        await this.distributeKnowledgeUpdates(patterns);
    }
    trackExpertiseEvolution(agentId) {
        if (!this.expertiseTracking.has(agentId)) {
            this.initializeExpertiseTracking(agentId);
        }
        const expertise = this.expertiseTracking.get(agentId);
        const agent = this.agents.get(agentId);
        if (agent) {
            this.updateExpertiseMetrics(expertise, agent);
            this.identifyGrowthOpportunities(expertise, agent);
            this.updateLearningRecommendations(expertise, agent);
        }
        return expertise;
    }
    emergeBestPractices(successes) {
        const practices = [];
        const groupedSuccesses = this.groupSuccessesByCategory(successes);
        for (const [category, categorySuccesses] of groupedSuccesses) {
            const commonPatterns = this.findCommonPatterns(categorySuccesses);
            for (const pattern of commonPatterns) {
                const practice = this.extractBestPractice(category, pattern, categorySuccesses);
                if (practice.confidence >= this.config.learning.adaptationRate) {
                    practices.push(practice);
                    this.bestPractices.set(practice.id, practice);
                    this.emit('bestPracticeIdentified', {
                        practice: practice.id,
                        category,
                        confidence: practice.confidence,
                        timestamp: Date.now(),
                    });
                }
            }
        }
        return this.validateAndRankPractices(practices);
    }
    detectAntiPatterns(failures) {
        const antiPatterns = [];
        const groupedFailures = this.groupFailuresByType(failures);
        for (const [type, typeFailures] of groupedFailures) {
            const commonTriggers = this.identifyCommonTriggers(typeFailures);
            const commonConsequences = this.identifyCommonConsequences(typeFailures);
            const antiPattern = {
                id: `antipattern_${type}_${Date.now()}`,
                category: type,
                description: this.generateAntiPatternDescription(type, commonTriggers),
                triggers: commonTriggers,
                consequences: commonConsequences,
                avoidance: this.generateAvoidanceStrategies(commonTriggers, commonConsequences),
                detectionConfidence: this.calculateDetectionConfidence(typeFailures),
            };
            if (antiPattern.detectionConfidence >= 0.7) {
                antiPatterns.push(antiPattern);
                this.antiPatterns.set(antiPattern.id, antiPattern);
                this.emit('antiPatternDetected', {
                    antiPattern: antiPattern.id,
                    category: type,
                    confidence: antiPattern.detectionConfidence,
                    timestamp: Date.now(),
                });
            }
        }
        return antiPatterns;
    }
    getKnowledgeBase() {
        return new Map(this.knowledgeBase);
    }
    getAllExpertiseEvolution() {
        return new Map(this.expertiseTracking);
    }
    getBestPractices() {
        return Array.from(this.bestPractices.values()).sort((a, b) => b.successRate - a.successRate);
    }
    getAntiPatterns() {
        return Array.from(this.antiPatterns.values()).sort((a, b) => b.detectionConfidence - a.detectionConfidence);
    }
    getLearningHistory(agentId) {
        return this.learningHistory.get(agentId) || [];
    }
    clearLearningData() {
        this.knowledgeBase.clear();
        this.expertiseTracking.clear();
        this.bestPractices.clear();
        this.antiPatterns.clear();
        this.learningHistory.clear();
        this.emit('learningDataCleared', { timestamp: Date.now() });
    }
    determineLearningStrategy(agents) {
        const avgPerformance = agents.reduce((sum, agent) => sum + agent.performance.efficiency, 0) / agents.length;
        const hasSpecializations = agents.some((agent) => agent.specializations.length > 0);
        const learningProgress = agents.reduce((sum, agent) => sum + agent.learningProgress.adaptability, 0) / agents.length;
        if (avgPerformance < 0.5) {
            return 'supervised';
        }
        if (hasSpecializations && learningProgress > 0.7) {
            return 'reinforcement';
        }
        if (learningProgress > 0.5) {
            return 'unsupervised';
        }
        return 'online';
    }
    async executeLearning(agents, strategy) {
        const results = [];
        for (const agent of agents) {
            const agentResult = await this.executeAgentLearning(agent, strategy);
            results.push(agentResult);
            if (!this.learningHistory.has(agent.id)) {
                this.learningHistory.set(agent.id, []);
            }
            this.learningHistory.get(agent.id)?.push(agentResult);
        }
        return results;
    }
    async executeAgentLearning(agent, strategy) {
        const patterns = await this.generateLearningPatterns(agent, strategy);
        const improvements = this.calculateImprovements(agent, patterns);
        const knowledge = this.extractKnowledgeUpdates(agent, patterns);
        const metadata = {
            algorithmUsed: strategy,
            trainingTime: Math.random() * 1000,
            dataQuality: 0.8 + Math.random() * 0.2,
            convergence: Math.random() > 0.2,
            iterations: Math.floor(Math.random() * 100) + 10,
            validationScore: 0.7 + Math.random() * 0.3,
        };
        return {
            agentId: agent.id,
            learningType: strategy,
            patterns,
            improvements,
            knowledge,
            metadata,
        };
    }
    aggregateLearningResults(results) {
        const allPatterns = [];
        const allImprovements = [];
        const allKnowledge = [];
        for (const result of results) {
            allPatterns.push(...result?.patterns);
            allImprovements.push(...result?.improvements);
            allKnowledge.push(...result?.knowledge);
        }
        const avgMetadata = {
            algorithmUsed: 'ensemble',
            trainingTime: results.reduce((sum, r) => sum + r.metadata.trainingTime, 0) / results.length,
            dataQuality: results.reduce((sum, r) => sum + r.metadata.dataQuality, 0) / results.length,
            convergence: results.every((r) => r.metadata.convergence),
            iterations: Math.max(...results.map((r) => r.metadata.iterations)),
            validationScore: results.reduce((sum, r) => sum + r.metadata.validationScore, 0) / results.length,
        };
        return {
            agentId: 'swarm_aggregate',
            learningType: 'ensemble',
            patterns: allPatterns,
            improvements: allImprovements,
            knowledge: allKnowledge,
            metadata: avgMetadata,
        };
    }
    async generateLearningPatterns(agent, strategy) {
        const patterns = [];
        for (let i = 0; i < 3; i++) {
            const pattern = {
                id: `pattern_${agent.id}_${Date.now()}_${i}`,
                type: this.selectPatternType(agent),
                data: this.generatePatternData(agent, strategy),
                confidence: 0.7 + Math.random() * 0.3,
                frequency: Math.floor(Math.random() * 10) + 1,
                context: { agentId: agent.id, strategy },
                metadata: {
                    complexity: Math.random(),
                    predictability: Math.random(),
                    stability: Math.random(),
                    anomalyScore: Math.random() * 0.3,
                    correlations: [],
                    quality: 0.8 + Math.random() * 0.2,
                    relevance: Math.random(),
                },
                timestamp: Date.now(),
            };
            patterns.push(pattern);
        }
        return patterns;
    }
    calculateImprovements(agent, _patterns) {
        const improvements = [];
        const metrics = ['efficiency', 'quality', 'latency', 'throughput'];
        for (const metric of metrics) {
            const baseline = agent.performance.efficiency;
            const improved = baseline + Math.random() * 0.2;
            improvements.push({
                metric,
                baseline,
                improved,
                improvement: ((improved - baseline) / baseline) * 100,
                confidence: 0.8 + Math.random() * 0.2,
                sustainability: 0.7 + Math.random() * 0.3,
            });
        }
        return improvements;
    }
    extractKnowledgeUpdates(agent, patterns) {
        const updates = [];
        for (const pattern of patterns) {
            updates.push({
                domain: pattern.type,
                type: 'new',
                knowledge: pattern.data,
                confidence: pattern.confidence,
                source: agent.id,
                timestamp: Date.now(),
            });
        }
        return updates;
    }
    trackLearningProgress(agents, result) {
        for (const agent of agents) {
            const agentResult = result?.patterns.filter((p) => p.context['agentId'] === agent.id);
            agent.learningProgress.totalExperience += agentResult.length;
            this.trackExpertiseEvolution(agent.id);
        }
    }
    mergePatterns(existing, newPattern) {
        return {
            ...existing,
            confidence: (existing.confidence + newPattern.confidence) / 2,
            frequency: existing.frequency + newPattern.frequency,
            metadata: {
                ...existing.metadata,
                quality: Math.max(existing.metadata.quality, newPattern.metadata.quality),
            },
            timestamp: Date.now(),
        };
    }
    pruneKnowledgeBase() {
        const currentTime = Date.now();
        const maxAge = 24 * 60 * 60 * 1000;
        const minConfidence = 0.5;
        for (const [id, pattern] of this.knowledgeBase) {
            if (currentTime - pattern.timestamp > maxAge || pattern.confidence < minConfidence) {
                this.knowledgeBase.delete(id);
                this.emit('knowledgePruned', {
                    patternId: id,
                    reason: currentTime - pattern.timestamp > maxAge ? 'age' : 'confidence',
                    timestamp: Date.now(),
                });
            }
        }
    }
    async distributeKnowledgeUpdates(patterns) {
        for (const [agentId, agent] of this.agents) {
            const relevantPatterns = patterns.filter((pattern) => agent.specializations.includes(pattern.type) || pattern.confidence > 0.9);
            if (relevantPatterns.length > 0) {
                this.emit('knowledgeDistributed', {
                    agentId,
                    patterns: relevantPatterns.map((p) => p.id),
                    timestamp: Date.now(),
                });
            }
        }
    }
    initializeExpertiseTracking(agentId) {
        const agent = this.agents.get(agentId);
        this.expertiseTracking.set(agentId, {
            agentId,
            domain: agent?.specializations[0] || 'general',
            currentLevel: agent?.learningProgress.adaptability || 0.5,
            growthRate: 0.1,
            specializations: agent?.specializations || [],
            knowledgeGaps: [],
            timeline: [
                {
                    timestamp: Date.now(),
                    level: agent?.learningProgress.adaptability || 0.5,
                    domain: agent?.specializations[0] || 'general',
                },
            ],
        });
    }
    updateExpertiseMetrics(expertise, agent) {
        const currentLevel = agent.performance.efficiency;
        const previousLevel = expertise.currentLevel;
        expertise.currentLevel = currentLevel;
        expertise.growthRate = (currentLevel - previousLevel) / previousLevel;
        expertise.timeline.push({
            timestamp: Date.now(),
            level: currentLevel,
            domain: expertise.domain,
        });
        const maxEntries = 100;
        if (expertise.timeline.length > maxEntries) {
            expertise.timeline = expertise.timeline.slice(-maxEntries);
        }
    }
    identifyGrowthOpportunities(expertise, agent) {
        const knowledgeGaps = [];
        for (const [_patternId, pattern] of this.knowledgeBase) {
            if (!agent.specializations.includes(pattern.type) && pattern.confidence > 0.8) {
                knowledgeGaps.push(pattern.type);
            }
        }
        expertise.knowledgeGaps = [...new Set(knowledgeGaps)];
    }
    updateLearningRecommendations(expertise, agent) {
        this.emit('learningRecommendation', {
            agentId: agent.id,
            recommendations: expertise.knowledgeGaps.slice(0, 3),
            priority: expertise.growthRate < 0.05 ? 'high' : 'medium',
            timestamp: Date.now(),
        });
    }
    groupSuccessesByCategory(successes) {
        const groups = new Map();
        for (const success of successes) {
            const category = success.context || 'general';
            if (!groups.has(category)) {
                groups.set(category, []);
            }
            groups.get(category)?.push(success);
        }
        return groups;
    }
    findCommonPatterns(successes) {
        const actionCounts = new Map();
        for (const success of successes) {
            for (const action of success.actions) {
                actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
            }
        }
        return Array.from(actionCounts.entries())
            .filter(([, count]) => count >= Math.max(2, successes.length * 0.3))
            .map(([action, count]) => ({ action, frequency: count }));
    }
    extractBestPractice(category, pattern, successes) {
        const relevantSuccesses = successes.filter((s) => s.actions.includes(pattern.action));
        return {
            id: `bestpractice_${category}_${pattern.action}_${Date.now()}`,
            category,
            description: `Use ${pattern.action} for ${category} tasks`,
            conditions: this.extractConditions(relevantSuccesses),
            outcomes: this.calculateAverageOutcomes(relevantSuccesses),
            confidence: pattern.frequency / successes.length,
            usageCount: pattern.frequency,
            successRate: relevantSuccesses.length / successes.length,
        };
    }
    validateAndRankPractices(practices) {
        return practices
            .filter((p) => p.confidence >= 0.6 && p.successRate >= 0.7)
            .sort((a, b) => b.confidence * b.successRate - a.confidence * a.successRate);
    }
    groupFailuresByType(failures) {
        const groups = new Map();
        for (const failure of failures) {
            if (!groups.has(failure.type)) {
                groups.set(failure.type, []);
            }
            groups.get(failure.type)?.push(failure);
        }
        return groups;
    }
    identifyCommonTriggers(failures) {
        const triggerCounts = new Map();
        for (const failure of failures) {
            for (const context of failure.context) {
                triggerCounts.set(context, (triggerCounts.get(context) || 0) + 1);
            }
        }
        return Array.from(triggerCounts.entries())
            .filter(([, count]) => count >= Math.max(2, failures.length * 0.3))
            .map(([trigger]) => trigger);
    }
    identifyCommonConsequences(failures) {
        const consequenceCounts = new Map();
        for (const failure of failures) {
            for (const impact of failure.impacts) {
                consequenceCounts.set(impact, (consequenceCounts.get(impact) || 0) + 1);
            }
        }
        return Array.from(consequenceCounts.entries())
            .filter(([, count]) => count >= Math.max(2, failures.length * 0.3))
            .map(([consequence]) => consequence);
    }
    generateAntiPatternDescription(type, triggers) {
        return `Anti-pattern for ${type}: Avoid when ${triggers.join(', ')} are present`;
    }
    generateAvoidanceStrategies(triggers, consequences) {
        return [
            `Monitor for conditions: ${triggers.join(', ')}`,
            `Implement safeguards to prevent: ${consequences.join(', ')}`,
            'Use alternative approaches when triggers are detected',
        ];
    }
    calculateDetectionConfidence(failures) {
        if (failures.length === 0)
            return 0;
        const avgFrequency = failures.reduce((sum, f) => sum + f.frequency, 0) / failures.length;
        const consistencyScore = failures.length >= 3 ? 0.8 : failures.length * 0.3;
        return Math.min(0.95, (avgFrequency / 10) * consistencyScore);
    }
    selectPatternType(agent) {
        const types = ['task_completion', 'communication', 'resource_utilization', 'optimization'];
        if (agent.specializations.length > 0) {
            return agent.specializations[0];
        }
        return types[Math.floor(Math.random() * types.length)];
    }
    generatePatternData(agent, strategy) {
        return {
            agentCapabilities: agent.capabilities,
            strategy,
            performance: agent.performance,
            learningContext: agent.learningProgress,
        };
    }
    extractConditions(successes) {
        const allConditions = successes.flatMap((s) => s.conditions);
        const conditionCounts = new Map();
        for (const condition of allConditions) {
            conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
        }
        return Array.from(conditionCounts.entries())
            .filter(([, count]) => count >= successes.length * 0.5)
            .map(([condition]) => condition);
    }
    calculateAverageOutcomes(successes) {
        const totals = {
            efficiency: 0,
            quality: 0,
            cost: 0,
            satisfaction: 0,
            sustainability: 0,
        };
        for (const success of successes) {
            totals.efficiency += success.outcomes.efficiency;
            totals.quality += success.outcomes.quality;
            totals.cost += success.outcomes.cost;
            totals.satisfaction += success.outcomes.satisfaction;
            totals.sustainability += success.outcomes.sustainability;
        }
        const count = successes.length;
        return {
            efficiency: totals.efficiency / count,
            quality: totals.quality / count,
            cost: totals.cost / count,
            satisfaction: totals.satisfaction / count,
            sustainability: totals.sustainability / count,
        };
    }
    startLearningCoordination() {
        setInterval(() => {
            if (this.agents.size > 0) {
                const agents = Array.from(this.agents.values());
                this.coordinateLearning(agents).catch((error) => {
                    this.emit('learningError', { error: error.message, timestamp: Date.now() });
                });
            }
        }, 5 * 60 * 1000);
    }
};
LearningCoordinator = __decorate([
    injectable,
    __param(2, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Object, Object, Object])
], LearningCoordinator);
export { LearningCoordinator };
//# sourceMappingURL=learning-coordinator.js.map