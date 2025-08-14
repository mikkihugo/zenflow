import { EventEmitter } from 'node:events';
export class KnowledgeEvolution extends EventEmitter {
    knowledgeBases = new Map();
    expertiseProfiles = new Map();
    bestPractices = new Map();
    antiPatterns = new Map();
    evolutionQueue = [];
    config;
    constructor(config = {}) {
        super();
        this.config = {
            maxKnowledgeItems: 10000,
            confidenceThreshold: 0.7,
            evolutionInterval: 900000,
            validationInterval: 3600000,
            expertiseDecayRate: 0.95,
            knowledgeRetentionPeriod: 7776000000,
            bestPracticeThreshold: 0.8,
            antiPatternThreshold: 0.3,
            ...config,
        };
        this.initializeDefaultKnowledgeBases();
        this.startContinuousEvolution();
    }
    async learnFromInteractions(patterns, behaviors, domain = 'general') {
        const learningResult = {
            domain,
            newKnowledge: [],
            updatedKnowledge: [],
            emergentPatterns: [],
            bestPracticesIdentified: [],
            antiPatternsDetected: [],
            expertiseUpdates: [],
        };
        const extractedKnowledge = await this.extractKnowledgeFromPatterns(patterns, domain);
        learningResult?.newKnowledge.push(...extractedKnowledge.newItems);
        learningResult?.updatedKnowledge.push(...extractedKnowledge.updatedItems);
        const emergentPatterns = this.identifyEmergentPatterns(patterns);
        learningResult?.emergentPatterns.push(...emergentPatterns);
        const bestPractices = await this.detectBestPractices(patterns, behaviors);
        learningResult?.bestPracticesIdentified.push(...bestPractices);
        const antiPatterns = await this.detectAntiPatterns(patterns, behaviors);
        learningResult?.antiPatternsDetected.push(...antiPatterns);
        const expertiseUpdates = await this.updateExpertiseProfiles(patterns, behaviors);
        learningResult?.expertiseUpdates.push(...expertiseUpdates);
        await this.updateKnowledgeBase(domain, learningResult);
        this.emit('learning_completed', learningResult);
        return learningResult;
    }
    async updateKnowledgeFromPatterns(patternClusters, domain = 'general') {
        const knowledgeBase = this.getOrCreateKnowledgeBase(domain);
        for (const cluster of patternClusters) {
            if (cluster.confidence &&
                cluster.confidence > this.config.confidenceThreshold) {
                const knowledgeItem = this.createKnowledgeItemFromCluster(cluster, domain);
                await this.addOrUpdateKnowledgeItem(knowledgeBase, knowledgeItem);
            }
        }
        await this.validateKnowledgeConsistency(knowledgeBase);
        this.emit('knowledge_updated', {
            domain,
            clusters: patternClusters.length,
        });
    }
    async trackExpertiseEvolution(agentId, patterns, domain = 'general') {
        const profile = this.getOrCreateExpertiseProfile(agentId, domain);
        const previousLevel = profile.level;
        const recentPatterns = patterns
            .filter((p) => p.context.agentId === agentId)
            .filter((p) => Date.now() - p.timestamp < 86400000);
        if (recentPatterns.length === 0) {
            return {
                agentId,
                domain,
                change: 0,
                newLevel: profile.level,
                factors: [],
            };
        }
        await this.updateSkillsFromPatterns(profile, recentPatterns);
        await this.updateExperienceFromPatterns(profile, recentPatterns);
        const newLevel = this.calculateExpertiseLevel(profile);
        const change = newLevel - previousLevel;
        profile.level = newLevel;
        profile.lastAssessment = Date.now();
        const evolution = {
            agentId,
            domain,
            change,
            newLevel,
            factors: this.identifyEvolutionFactors(recentPatterns, change),
        };
        this.expertiseProfiles.set(agentId, profile);
        this.emit('expertise_evolved', evolution);
        return evolution;
    }
    async identifyBestPractices(patterns, minEffectiveness = 0.8, minOccurrences = 5) {
        const practices = [];
        const successfulPatterns = patterns.filter((p) => p.metadata.success === true && p.confidence >= minEffectiveness);
        const practiceGroups = this.clusterPatternsByPractice(successfulPatterns);
        for (const group of practiceGroups) {
            if (group.patterns.length >= minOccurrences) {
                const practice = await this.codifyBestPractice(group);
                practices.push(practice);
                this.bestPractices.set(practice.id, practice);
            }
        }
        this.emit('best_practices_identified', practices);
        return practices;
    }
    async detectAntiPatterns(patterns, behaviors) {
        const antiPatterns = [];
        const failurePatterns = patterns.filter((p) => p.metadata.success === false ||
            p.confidence < this.config.antiPatternThreshold);
        const failureGroups = this.groupSimilarFailures(failurePatterns);
        for (const group of failureGroups) {
            if (group.frequency >= 3) {
                const antiPattern = await this.identifyAntiPattern(group);
                antiPatterns.push(antiPattern);
                this.antiPatterns.set(antiPattern.id, antiPattern);
            }
        }
        const behavioralAntiPatterns = await this.detectBehavioralAntiPatterns(behaviors);
        antiPatterns.push(...behavioralAntiPatterns);
        this.emit('anti_patterns_detected', antiPatterns);
        return antiPatterns;
    }
    async validateKnowledgeConsistency(knowledgeBase) {
        const report = {
            knowledgeBaseId: knowledgeBase.id,
            conflicts: [],
            inconsistencies: [],
            outdatedItems: [],
            validationResults: [],
            recommendations: [],
        };
        const conflicts = this.detectKnowledgeConflicts(knowledgeBase);
        report.conflicts.push(...conflicts);
        const inconsistencies = this.detectInconsistencies(knowledgeBase);
        report.inconsistencies.push(...inconsistencies);
        const outdatedItems = this.identifyOutdatedKnowledge(knowledgeBase);
        report.outdatedItems.push(...outdatedItems);
        const validationResults = await this.validateEvidence(knowledgeBase);
        report.validationResults.push(...validationResults);
        report.recommendations = this.generateConsistencyRecommendations(report);
        await this.applyAutomaticFixes(knowledgeBase, report);
        this.emit('knowledge_validated', report);
        return report;
    }
    async evolveKnowledgeBase(domain, trigger, evidence) {
        const knowledgeBase = this.knowledgeBases.get(domain);
        if (!knowledgeBase) {
            throw new Error(`Knowledge base for domain ${domain} not found`);
        }
        const evolution = {
            id: this.generateEvolutionId(),
            type: this.determineEvolutionType(trigger, evidence),
            timestamp: Date.now(),
            description: this.generateEvolutionDescription(trigger, evidence),
            trigger,
            impact: this.calculateEvolutionImpact(knowledgeBase, evidence),
            changes: [],
        };
        switch (evolution.type) {
            case 'creation':
                await this.createNewKnowledge(knowledgeBase, evidence, evolution);
                break;
            case 'update':
                await this.updateExistingKnowledge(knowledgeBase, evidence, evolution);
                break;
            case 'merge':
                await this.mergeKnowledgeItems(knowledgeBase, evidence, evolution);
                break;
            case 'split':
                await this.splitKnowledgeItems(knowledgeBase, evidence, evolution);
                break;
            case 'deprecation':
                await this.deprecateKnowledge(knowledgeBase, evidence, evolution);
                break;
            case 'validation':
                await this.validateKnowledgeItems(knowledgeBase, evidence, evolution);
                break;
        }
        knowledgeBase.evolutionHistory.push(evolution);
        knowledgeBase.lastUpdated = Date.now();
        this.emit('knowledge_evolved', evolution);
        return evolution;
    }
    getKnowledgeRecommendations(context) {
        const recommendations = [];
        const relevantKnowledgeBases = this.findRelevantKnowledgeBases(context);
        relevantKnowledgeBases.forEach((kb) => {
            const applicableItems = this.findApplicableKnowledge(kb, context);
            applicableItems?.forEach((item) => {
                const relevance = this.calculateRelevance(item, context);
                if (relevance >= 0.7) {
                    recommendations.push({
                        type: this.determineRecommendationType(item, context),
                        knowledgeItem: item,
                        relevance,
                        confidence: item?.confidence,
                        applicability: this.assessApplicability(item, context),
                        reasoning: this.generateReasoningExplanation(item, context),
                    });
                }
            });
        });
        recommendations.sort((a, b) => b.relevance * b.confidence - a.relevance * a.confidence);
        return recommendations.slice(0, 10);
    }
    exportKnowledge(domain, format = 'json') {
        const knowledgeBase = this.knowledgeBases.get(domain);
        if (!knowledgeBase) {
            throw new Error(`Knowledge base for domain ${domain} not found`);
        }
        const exportData = {
            domain,
            format,
            timestamp: Date.now(),
            version: knowledgeBase.version,
            data: this.serializeKnowledge(knowledgeBase, format),
            metadata: {
                itemCount: knowledgeBase.knowledge.length,
                avgConfidence: knowledgeBase.metadata.avgConfidence,
                coverage: knowledgeBase.metadata.coverage,
                exportSize: 0,
            },
        };
        exportData?.metadata.exportSize = JSON.stringify(exportData?.data).length;
        this.emit('knowledge_exported', exportData);
        return exportData;
    }
    async extractKnowledgeFromPatterns(patterns, domain) {
        const newItems = [];
        const updatedItems = [];
        const patternGroups = this.groupPatternsByType(patterns);
        for (const [type, groupPatterns] of patternGroups) {
            const successfulPatterns = groupPatterns.filter((p) => p.metadata.success === true);
            if (successfulPatterns.length >= 3) {
                const rule = this.extractRuleFromPatterns(successfulPatterns, type, domain);
                if (rule) {
                    newItems.push(rule);
                }
            }
            const consistentFacts = this.extractFactsFromPatterns(groupPatterns, domain);
            newItems.push(...consistentFacts);
        }
        return { newItems, updatedItems };
    }
    identifyEmergentPatterns(patterns) {
        const emergentPatterns = [];
        const timeWindows = this.createTimeWindows(patterns, 3600000);
        for (let i = 1; i < timeWindows.length; i++) {
            const previousWindow = timeWindows[i - 1];
            const currentWindow = timeWindows[i];
            if (!(previousWindow && currentWindow))
                continue;
            const previousTypes = new Map();
            const currentTypes = new Map();
            previousWindow.forEach((p) => {
                previousTypes.set(p.type, (previousTypes.get(p.type) || 0) + 1);
            });
            currentWindow.forEach((p) => {
                currentTypes?.set(p.type, (currentTypes?.get(p.type) || 0) + 1);
            });
            currentTypes?.forEach((currentCount, type) => {
                const previousCount = previousTypes.get(type) || 0;
                const growthRate = previousCount > 0 ? currentCount / previousCount : currentCount;
                if (growthRate >= 2 && currentCount >= 3) {
                    emergentPatterns.push({
                        type,
                        emergenceTime: currentWindow?.[0]?.timestamp || Date.now(),
                        frequency: currentCount,
                        growthRate,
                        confidence: Math.min(0.95, growthRate / 5),
                        context: this.extractEmergenceContext(currentWindow.filter((p) => p.type === type)),
                    });
                }
            });
        }
        return emergentPatterns;
    }
    async detectBestPractices(patterns, _behaviors) {
        const practices = [];
        const highPerformancePatterns = patterns.filter((p) => p.confidence >= this.config.bestPracticeThreshold &&
            p.metadata.success === true);
        const practiceGroups = this.clusterPatternsByPractice(highPerformancePatterns);
        for (const group of practiceGroups) {
            if (group.patterns.length >= 5) {
                const practice = await this.codifyBestPractice(group);
                practices.push(practice);
            }
        }
        return practices;
    }
    clusterPatternsByPractice(patterns) {
        const groups = [];
        const visited = new Set();
        for (const pattern of patterns) {
            if (visited.has(pattern.id))
                continue;
            const group = {
                id: `practice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                patterns: [pattern],
                commonCharacteristics: this.extractCharacteristics(pattern),
                effectiveness: pattern.confidence,
            };
            visited.add(pattern.id);
            for (const otherPattern of patterns) {
                if (visited.has(otherPattern.id))
                    continue;
                const similarity = this.calculatePatternSimilarity(pattern, otherPattern);
                if (similarity >= 0.8) {
                    group.patterns.push(otherPattern);
                    visited.add(otherPattern.id);
                }
            }
            if (group.patterns.length >= 3) {
                group.effectiveness =
                    group.patterns.reduce((sum, p) => sum + p.confidence, 0) /
                        group.patterns.length;
                groups.push(group);
            }
        }
        return groups;
    }
    async codifyBestPractice(group) {
        const practice = {
            id: `bp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            name: this.generatePracticeName(group),
            description: this.generatePracticeDescription(group),
            applicableContexts: this.extractApplicableContexts(group),
            effectiveness: group.effectiveness,
            adoption: 0,
            evidence: group.patterns.map((p) => this.patternToEvidence(p)),
            variations: [],
            emergencePattern: {
                discoveryDate: Date.now(),
                discoveryTrigger: 'pattern_analysis',
                evolutionStages: ['identified', 'validated'],
                adoptionRate: 0,
                stabilityIndicators: {},
            },
        };
        return practice;
    }
    groupSimilarFailures(patterns) {
        const groups = [];
        const visited = new Set();
        for (const pattern of patterns) {
            if (visited.has(pattern.id))
                continue;
            const group = {
                id: `failure_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                patterns: [pattern],
                commonCauses: this.extractFailureCauses(pattern),
                frequency: 1,
                severity: this.calculateFailureSeverity(pattern),
            };
            visited.add(pattern.id);
            for (const otherPattern of patterns) {
                if (visited.has(otherPattern.id))
                    continue;
                const similarity = this.calculateFailureSimilarity(pattern, otherPattern);
                if (similarity >= 0.7) {
                    group.patterns.push(otherPattern);
                    visited.add(otherPattern.id);
                }
            }
            group.frequency = group.patterns.length;
            groups.push(group);
        }
        return groups.filter((group) => group.frequency >= 2);
    }
    async identifyAntiPattern(group) {
        const antiPattern = {
            id: `ap_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            name: this.generateAntiPatternName(group),
            description: this.generateAntiPatternDescription(group),
            harmfulEffects: this.extractHarmfulEffects(group),
            detectionCriteria: this.generateDetectionCriteria(group),
            prevalence: group.frequency / 100,
            severity: group.severity,
            alternatives: this.suggestAlternatives(group),
            preventionStrategies: this.generatePreventionStrategies(group),
        };
        return antiPattern;
    }
    async detectBehavioralAntiPatterns(behaviors) {
        const antiPatterns = [];
        const lowPerformanceBehaviors = behaviors.filter((b) => this.calculateOverallPerformance(b) < this.config.antiPatternThreshold);
        if (lowPerformanceBehaviors.length >= 3) {
            const commonIssues = this.identifyCommonBehavioralIssues(lowPerformanceBehaviors);
            for (const issue of commonIssues) {
                antiPatterns.push({
                    id: `behavioral_ap_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                    name: issue.name,
                    description: issue.description,
                    harmfulEffects: issue.effects,
                    detectionCriteria: issue.criteria,
                    prevalence: issue.prevalence,
                    severity: 0.7,
                    alternatives: issue.alternatives,
                    preventionStrategies: issue.prevention,
                });
            }
        }
        return antiPatterns;
    }
    detectKnowledgeConflicts(knowledgeBase) {
        const conflicts = [];
        const rules = knowledgeBase.knowledge.filter((item) => item?.type === 'rule');
        for (let i = 0; i < rules.length; i++) {
            for (let j = i + 1; j < rules.length; j++) {
                const rule1 = rules[i];
                const rule2 = rules[j];
                if (rule1 && rule2) {
                    const conflict = this.detectRuleConflict(rule1, rule2);
                    if (conflict) {
                        conflicts.push(conflict);
                    }
                }
            }
        }
        const facts = knowledgeBase.knowledge.filter((item) => item?.type === 'fact');
        for (let i = 0; i < facts.length; i++) {
            for (let j = i + 1; j < facts.length; j++) {
                const fact1 = facts[i];
                const fact2 = facts[j];
                if (fact1 && fact2) {
                    const conflict = this.detectFactConflict(fact1, fact2);
                    if (conflict) {
                        conflicts.push(conflict);
                    }
                }
            }
        }
        return conflicts;
    }
    detectRuleConflict(rule1, rule2) {
        const content1 = rule1.content.toLowerCase();
        const content2 = rule2.content.toLowerCase();
        const contradictoryPairs = [
            ['should', 'should not'],
            ['always', 'never'],
            ['must', 'must not'],
            ['increase', 'decrease'],
            ['enable', 'disable'],
        ];
        for (const [positive, negative] of contradictoryPairs) {
            if (positive &&
                negative &&
                ((content1.includes(positive) && content2.includes(negative)) ||
                    (content1.includes(negative) && content2.includes(positive)))) {
                return {
                    type: 'rule_contradiction',
                    item1Id: rule1.id,
                    item2Id: rule2.id,
                    description: `Rule conflict detected between "${rule1.content}" and "${rule2.content}"`,
                    severity: 0.8,
                    resolution: 'manual_review',
                };
            }
        }
        return null;
    }
    detectFactConflict(fact1, fact2) {
        if (fact1.content === fact2.content &&
            Math.abs(fact1.confidence - fact2.confidence) > 0.3) {
            return {
                type: 'confidence_conflict',
                item1Id: fact1.id,
                item2Id: fact2.id,
                description: `Confidence conflict for fact "${fact1.content}"`,
                severity: 0.5,
                resolution: 'evidence_review',
            };
        }
        return null;
    }
    calculateOverallPerformance(behavior) {
        const perf = behavior.performance;
        return ((perf.efficiency +
            perf.accuracy +
            perf.reliability +
            perf.collaboration +
            perf.adaptability) /
            5);
    }
    getOrCreateKnowledgeBase(domain) {
        let knowledgeBase = this.knowledgeBases.get(domain);
        if (!knowledgeBase) {
            knowledgeBase = {
                id: `kb_${domain}_${Date.now()}`,
                domain,
                version: '1.0.0',
                knowledge: [],
                metadata: {
                    totalItems: 0,
                    avgConfidence: 0,
                    domains: [domain],
                    coverage: 0,
                    reliability: 0,
                    recency: 1,
                },
                lastUpdated: Date.now(),
                evolutionHistory: [],
            };
            this.knowledgeBases.set(domain, knowledgeBase);
        }
        return knowledgeBase;
    }
    getOrCreateExpertiseProfile(agentId, domain) {
        let profile = this.expertiseProfiles.get(agentId);
        if (!profile) {
            profile = {
                agentId,
                domain,
                level: 0.1,
                skills: [],
                experience: [],
                specializations: [],
                adaptability: 0.5,
                reliability: 0.5,
                knowledgeContributions: 0,
                lastAssessment: Date.now(),
            };
            this.expertiseProfiles.set(agentId, profile);
        }
        return profile;
    }
    createTimeWindows(patterns, windowSize) {
        const windows = [];
        const sortedPatterns = patterns.sort((a, b) => a.timestamp - b.timestamp);
        if (sortedPatterns.length === 0)
            return windows;
        let currentWindow = [];
        const firstPattern = sortedPatterns[0];
        if (!firstPattern)
            return windows;
        let windowStart = firstPattern.timestamp;
        for (const pattern of sortedPatterns) {
            if (pattern.timestamp - windowStart > windowSize) {
                if (currentWindow.length > 0) {
                    windows.push([...currentWindow]);
                }
                currentWindow = [pattern];
                windowStart = pattern.timestamp;
            }
            else {
                currentWindow.push(pattern);
            }
        }
        if (currentWindow.length > 0) {
            windows.push(currentWindow);
        }
        return windows;
    }
    extractEmergenceContext(patterns) {
        const context = {};
        if (patterns.length > 0) {
            const swarmIds = [...new Set(patterns.map((p) => p.context.swarmId))];
            const taskTypes = [...new Set(patterns.map((p) => p.context.taskType))];
            const avgComplexity = patterns.reduce((sum, p) => sum + (p.context.complexity || 0), 0) / patterns.length;
            context['swarmIds'] = swarmIds;
            context['taskTypes'] = taskTypes;
            context['avgComplexity'] = avgComplexity;
            context['agentCount'] = Math.max(...patterns.map((p) => p.context.agentCount || 0));
        }
        return context;
    }
    generateEvolutionId() {
        return `evolution_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
    determineEvolutionType(trigger, _evidence) {
        switch (trigger.type) {
            case 'pattern_discovery':
                return 'creation';
            case 'performance_change':
                return 'update';
            case 'conflict_resolution':
                return 'merge';
            case 'validation_failure':
                return 'deprecation';
            default:
                return 'update';
        }
    }
    generateEvolutionDescription(trigger, evidence) {
        return `Evolution triggered by ${trigger.type} with ${evidence.length} pieces of evidence`;
    }
    calculateEvolutionImpact(knowledgeBase, evidence) {
        return {
            itemsAffected: Math.min(evidence.length, knowledgeBase.knowledge.length / 10),
            confidenceChange: 0.1,
            coverageChange: 0.05,
            performanceImpact: 0.1,
            stabilityImpact: -0.02,
        };
    }
    async createNewKnowledge(knowledgeBase, evidence, evolution) {
        const newItems = evidence.map((e) => this.evidenceToKnowledgeItem(e));
        knowledgeBase.knowledge.push(...newItems);
        evolution.changes.push(...newItems.map((item) => ({
            itemId: item?.id,
            field: 'creation',
            oldValue: null,
            newValue: item,
            reason: 'New knowledge from evidence',
        })));
    }
    async updateExistingKnowledge(knowledgeBase, evidence, evolution) {
        evidence.forEach((e) => {
            const relevantItems = this.findRelevantKnowledgeItems(knowledgeBase, e);
            relevantItems?.forEach((item) => {
                const oldConfidence = item?.confidence;
                item?.evidence.push(e);
                item.confidence = this.recalculateConfidence(item);
                item.lastVerified = Date.now();
                evolution.changes.push({
                    itemId: item?.id,
                    field: 'confidence',
                    oldValue: oldConfidence,
                    newValue: item?.confidence,
                    reason: 'Updated with new evidence',
                });
            });
        });
    }
    async mergeKnowledgeItems(knowledgeBase, _evidence, evolution) {
        const items = knowledgeBase.knowledge;
        const merged = new Set();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || merged.has(item?.id))
                continue;
            const similarItems = items
                ?.slice(i + 1)
                .filter((item) => item &&
                !merged.has(item?.id) &&
                this.areItemsSimilar(items[i], item));
            if (similarItems.length > 0) {
                const mergedItem = this.mergeItems(item, similarItems);
                [item, ...similarItems].forEach((itemToRemove) => {
                    if (itemToRemove) {
                        merged.add(itemToRemove?.id);
                        const index = knowledgeBase.knowledge.indexOf(itemToRemove);
                        if (index > -1) {
                            knowledgeBase.knowledge.splice(index, 1);
                        }
                    }
                });
                knowledgeBase.knowledge.push(mergedItem);
                evolution.changes.push({
                    itemId: mergedItem?.id,
                    field: 'merge',
                    oldValue: [item?.id, ...similarItems?.map((s) => s.id)],
                    newValue: mergedItem?.id,
                    reason: 'Merged similar knowledge items',
                });
            }
        }
    }
    async splitKnowledgeItems(_knowledgeBase, _evidence, _evolution) {
    }
    async deprecateKnowledge(knowledgeBase, evidence, evolution) {
        evidence.forEach((e) => {
            const relevantItems = this.findRelevantKnowledgeItems(knowledgeBase, e);
            relevantItems?.forEach((item) => {
                if (e.strength < 0) {
                    item.confidence = Math.max(0, item?.confidence - Math.abs(e.strength));
                    if (item?.confidence < 0.1) {
                        item?.tags.push('deprecated');
                        evolution.changes.push({
                            itemId: item?.id,
                            field: 'tags',
                            oldValue: item?.tags.filter((t) => t !== 'deprecated'),
                            newValue: item?.tags,
                            reason: 'Deprecated due to negative evidence',
                        });
                    }
                }
            });
        });
    }
    async validateKnowledgeItems(knowledgeBase, evidence, evolution) {
        knowledgeBase.knowledge.forEach((item) => {
            const relevantEvidence = evidence.filter((e) => this.isEvidenceRelevant(e, item));
            if (relevantEvidence.length > 0) {
                const validationResult = this.validateItemWithEvidence(item, relevantEvidence);
                if (validationResult?.confidence !== item?.confidence) {
                    evolution.changes.push({
                        itemId: item?.id,
                        field: 'confidence',
                        oldValue: item?.confidence,
                        newValue: validationResult?.confidence,
                        reason: 'Validation against new evidence',
                    });
                    item.confidence = validationResult?.confidence;
                }
            }
        });
    }
    extractCharacteristics(pattern) {
        return {
            type: pattern.type,
            complexity: pattern.context.complexity,
            agentCount: pattern.context.agentCount,
            taskType: pattern.context.taskType,
            success: pattern.metadata.success,
        };
    }
    calculatePatternSimilarity(p1, p2) {
        let similarity = 0;
        let factors = 0;
        if (p1.type === p2.type)
            similarity += 0.3;
        factors++;
        const complexity1 = p1.context.complexity || 0;
        const complexity2 = p2.context.complexity || 0;
        similarity += 1 - Math.abs(complexity1 - complexity2);
        factors++;
        if (p1.context.taskType === p2.context.taskType)
            similarity += 0.2;
        factors++;
        similarity += 1 - Math.abs(p1.confidence - p2.confidence) / 2;
        factors++;
        return similarity / factors;
    }
    initializeDefaultKnowledgeBases() {
        const domains = [
            'task_execution',
            'communication',
            'resource_management',
            'coordination',
        ];
        domains.forEach((domain) => {
            this.getOrCreateKnowledgeBase(domain);
        });
    }
    startContinuousEvolution() {
        setInterval(() => {
            this.processEvolutionQueue();
        }, this.config.evolutionInterval);
        setInterval(() => {
            this.validateAllKnowledgeBases();
        }, this.config.validationInterval);
        setInterval(() => {
            this.decayExpertise();
        }, 86400000);
    }
    async processEvolutionQueue() {
        while (this.evolutionQueue.length > 0) {
            const task = this.evolutionQueue.shift();
            if (!task)
                continue;
            try {
                await this.evolveKnowledgeBase(task.domain, task.trigger, task.evidence);
            }
            catch (error) {
                this.emit('evolution_error', { task, error });
            }
        }
    }
    async validateAllKnowledgeBases() {
        for (const [domain, kb] of this.knowledgeBases) {
            try {
                await this.validateKnowledgeConsistency(kb);
            }
            catch (error) {
                this.emit('validation_error', { domain, error });
            }
        }
    }
    decayExpertise() {
        this.expertiseProfiles.forEach((profile) => {
            const daysSinceAssessment = (Date.now() - profile.lastAssessment) / (24 * 60 * 60 * 1000);
            if (daysSinceAssessment > 7) {
                const decayRate = this.config.expertiseDecayRate;
                if (decayRate) {
                    profile.level *= decayRate;
                    profile.skills.forEach((skill) => {
                        skill.proficiency *= decayRate;
                    });
                }
            }
        });
    }
    getKnowledgeBase(domain) {
        return this.knowledgeBases.get(domain);
    }
    getAllKnowledgeBases() {
        return Array.from(this.knowledgeBases.values());
    }
    getExpertiseProfile(agentId) {
        return this.expertiseProfiles.get(agentId);
    }
    getBestPractices() {
        return Array.from(this.bestPractices.values());
    }
    getAntiPatterns() {
        return Array.from(this.antiPatterns.values());
    }
    groupPatternsByType(patterns) {
        const groups = new Map();
        patterns.forEach((pattern) => {
            const group = groups.get(pattern.type) || [];
            group.push(pattern);
            groups.set(pattern.type, group);
        });
        return groups;
    }
    extractRuleFromPatterns(patterns, type, domain) {
        if (patterns.length < 3)
            return null;
        const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
        return {
            id: `rule_${type}_${Date.now()}`,
            type: 'rule',
            content: `When ${type} patterns occur with high confidence, success rate is ${(avgConfidence * 100).toFixed(1)}%`,
            confidence: avgConfidence,
            evidence: patterns.map((p) => this.patternToEvidence(p)),
            relationships: [],
            tags: [type, domain],
            applicability: {
                contexts: [domain],
                conditions: [`pattern_type == '${type}'`],
                limitations: [],
                prerequisites: [],
            },
            createdAt: Date.now(),
            lastVerified: Date.now(),
        };
    }
    extractFactsFromPatterns(patterns, domain) {
        const facts = [];
        if (patterns.length > 0) {
            const durationsWithValues = patterns
                .filter((p) => p.duration !== undefined)
                .map((p) => p.duration || 0);
            const avgDuration = durationsWithValues.length > 0
                ? durationsWithValues.reduce((sum, d) => sum + d, 0) /
                    durationsWithValues.length
                : 0;
            if (avgDuration > 0) {
                facts.push({
                    id: `fact_duration_${domain}_${Date.now()}`,
                    type: 'fact',
                    content: `Average execution duration in ${domain} is ${avgDuration.toFixed(0)}ms`,
                    confidence: 0.9,
                    evidence: patterns.map((p) => this.patternToEvidence(p)),
                    relationships: [],
                    tags: ['duration', domain, 'statistical'],
                    applicability: {
                        contexts: [domain],
                        conditions: [],
                        limitations: ['based_on_historical_data'],
                        prerequisites: [],
                    },
                    createdAt: Date.now(),
                    lastVerified: Date.now(),
                });
            }
        }
        return facts;
    }
    patternToEvidence(pattern) {
        return {
            id: `evidence_${pattern.id}`,
            type: 'pattern',
            source: pattern.context.agentId || 'unknown',
            strength: pattern.confidence,
            timestamp: pattern.timestamp,
            context: {
                patternType: pattern.type,
                swarmId: pattern.context.swarmId,
                taskType: pattern.context.taskType,
            },
        };
    }
    calculateFailureSeverity(pattern) {
        let severity = 0.5;
        const metadata = pattern.metadata;
        if (metadata?.errorType === 'critical')
            severity += 0.3;
        if (metadata?.impactLevel === 'high')
            severity += 0.2;
        if (metadata?.recoverable === false)
            severity += 0.2;
        return Math.min(1, severity);
    }
    calculateFailureSimilarity(p1, p2) {
        let similarity = 0;
        let factors = 0;
        const errorType1 = p1.metadata.errorType;
        const errorType2 = p2.metadata.errorType;
        if (errorType1 === errorType2) {
            similarity += 0.4;
        }
        factors++;
        if (p1.context.taskType === p2.context.taskType) {
            similarity += 0.3;
        }
        factors++;
        const metadataKeys = new Set([
            ...Object.keys(p1.metadata),
            ...Object.keys(p2.metadata),
        ]);
        let matchingKeys = 0;
        metadataKeys?.forEach((key) => {
            if (p1.metadata[key] ===
                p2.metadata[key]) {
                matchingKeys++;
            }
        });
        similarity += (matchingKeys / metadataKeys.size) * 0.3;
        factors++;
        return similarity / factors;
    }
    extractFailureCauses(pattern) {
        const causes = [];
        const metadata = pattern.metadata;
        if (metadata?.errorType)
            causes.push(metadata?.errorType);
        if (metadata?.rootCause)
            causes.push(metadata?.rootCause);
        if (metadata?.contributingFactors) {
            causes.push(...metadata?.contributingFactors);
        }
        return causes;
    }
    generatePracticeName(group) {
        const firstPattern = group.patterns[0];
        if (!firstPattern)
            return 'Unknown Practice';
        const commonType = firstPattern.type;
        const effectiveness = (group.effectiveness * 100).toFixed(0);
        return `High-Performance ${commonType} (${effectiveness}% effective)`;
    }
    generatePracticeDescription(group) {
        const patterns = group.patterns;
        const firstPattern = patterns[0];
        if (!firstPattern)
            return 'No description available';
        const commonContext = firstPattern.context.taskType;
        const avgComplexity = patterns.reduce((sum, p) => sum + (p.context.complexity || 0), 0) / patterns.length;
        return (`Best practice for ${commonContext} tasks with complexity ${avgComplexity.toFixed(1)}, ` +
            `observed ${patterns.length} times with ${(group.effectiveness * 100).toFixed(1)}% success rate`);
    }
    extractApplicableContexts(group) {
        const contexts = new Set();
        group.patterns.forEach((p) => {
            contexts.add(p.context.taskType);
            contexts.add(p.context.swarmId);
        });
        return Array.from(contexts);
    }
    generateAntiPatternName(group) {
        const commonCause = group.commonCauses[0] || 'Unknown';
        return `${commonCause} Anti-Pattern`;
    }
    generateAntiPatternDescription(group) {
        return (`Anti-pattern identified from ${group.frequency} failure occurrences, ` +
            `commonly caused by ${group.commonCauses.join(', ')}`);
    }
    extractHarmfulEffects(group) {
        const effects = new Set();
        group.patterns.forEach((p) => {
            const impacts = p.metadata.impacts;
            if (impacts) {
                impacts.forEach((impact) => effects.add(impact));
            }
        });
        return Array.from(effects);
    }
    generateDetectionCriteria(group) {
        const criteria = [];
        group.commonCauses.forEach((cause) => {
            criteria.push(`Check for ${cause} conditions`);
        });
        criteria.push(`Monitor failure frequency > ${group.frequency / 10}`);
        criteria.push(`Severity level >= ${group.severity.toFixed(1)}`);
        return criteria;
    }
    suggestAlternatives(_group) {
        return [
            'Use validated configuration parameters',
            'Implement error handling and recovery',
            'Apply gradual rollout strategy',
            'Monitor resource utilization',
        ];
    }
    generatePreventionStrategies(_group) {
        return [
            'Pre-deployment validation',
            'Resource monitoring',
            'Graceful degradation',
            'Circuit breaker pattern',
        ];
    }
    identifyCommonBehavioralIssues(behaviors) {
        const issues = [];
        const highResourceUsage = behaviors.filter((b) => b.performance.resourceUtilization > 0.9);
        if (highResourceUsage.length >= 3) {
            issues.push({
                name: 'Resource Over-utilization',
                description: 'Agents consistently using excessive resources',
                effects: ['System slowdown', 'Resource starvation', 'Poor scalability'],
                criteria: ['Resource utilization > 90%', 'Sustained high usage'],
                prevalence: highResourceUsage.length / behaviors.length,
                alternatives: [
                    'Resource budgeting',
                    'Lazy loading',
                    'Resource pooling',
                ],
                prevention: [
                    'Set resource limits',
                    'Monitor resource usage',
                    'Implement backpressure',
                ],
            });
        }
        return issues;
    }
    detectInconsistencies(_knowledgeBase) {
        return [];
    }
    identifyOutdatedKnowledge(knowledgeBase) {
        const outdated = [];
        const now = Date.now();
        const cutoff = this.config.knowledgeRetentionPeriod;
        if (cutoff) {
            knowledgeBase.knowledge.forEach((item) => {
                if (now - item?.lastVerified > cutoff) {
                    outdated.push({
                        itemId: item?.id,
                        age: now - item?.lastVerified,
                        lastVerified: item?.lastVerified,
                        confidence: item?.confidence,
                        reason: 'Not verified within retention period',
                    });
                }
            });
        }
        return outdated;
    }
    async validateEvidence(knowledgeBase) {
        const results = [];
        knowledgeBase.knowledge.forEach((item) => {
            const weakEvidence = item?.evidence.filter((e) => e.strength < 0.3);
            if (weakEvidence.length > item?.evidence.length / 2) {
                results.push({
                    itemId: item?.id,
                    type: 'weak_evidence',
                    severity: 'medium',
                    description: 'Majority of evidence has low strength',
                    recommendation: 'Gather stronger supporting evidence',
                });
            }
        });
        return results;
    }
    generateConsistencyRecommendations(report) {
        const recommendations = [];
        if (report.conflicts.length > 0) {
            recommendations.push('Resolve knowledge conflicts through expert review');
        }
        if (report.outdatedItems.length > 10) {
            recommendations.push('Update or deprecate outdated knowledge items');
        }
        if (report.validationResults.length > 5) {
            recommendations.push('Strengthen evidence for low-confidence items');
        }
        return recommendations;
    }
    async applyAutomaticFixes(knowledgeBase, report) {
        report.outdatedItems.forEach((outdated) => {
            const item = knowledgeBase.knowledge.find((k) => k.id === outdated.itemId);
            if (item && outdated.confidence < 0.3) {
                item?.tags.push('needs_review');
            }
        });
    }
    updateKnowledgeBase(_domain, _result) {
        return Promise.resolve();
    }
    updateSkillsFromPatterns(_profile, _patterns) {
        return Promise.resolve();
    }
    updateExperienceFromPatterns(_profile, _patterns) {
        return Promise.resolve();
    }
    updateExpertiseProfiles(_patterns, _behaviors) {
        return Promise.resolve([]);
    }
    calculateExpertiseLevel(profile) {
        return Math.min(1, profile.level + 0.01);
    }
    identifyEvolutionFactors(_patterns, _change) {
        return ['performance_improvement', 'task_complexity_handling'];
    }
    findRelevantKnowledgeBases(_context) {
        return Array.from(this.knowledgeBases.values());
    }
    findApplicableKnowledge(kb, _context) {
        return kb.knowledge.slice(0, 10);
    }
    calculateRelevance(_item, _context) {
        return Math.random() * 0.5 + 0.5;
    }
    determineRecommendationType(item, _context) {
        return item?.type === 'best_practice'
            ? 'practice_suggestion'
            : 'knowledge_application';
    }
    assessApplicability(item, _context) {
        return item?.confidence * 0.8;
    }
    generateReasoningExplanation(item, _context) {
        return `Based on ${item?.evidence.length} pieces of evidence with ${(item?.confidence * 100).toFixed(1)}% confidence`;
    }
    serializeKnowledge(knowledgeBase, format) {
        switch (format) {
            case 'json':
                return knowledgeBase;
            case 'rdf':
                return { rdf: 'serialized_rdf_data' };
            case 'ontology':
                return { ontology: 'serialized_ontology_data' };
            default:
                return knowledgeBase;
        }
    }
    evidenceToKnowledgeItem(evidence) {
        return {
            id: `ki_from_${evidence.id}`,
            type: 'fact',
            content: `Evidence from ${evidence.source}`,
            confidence: evidence.strength,
            evidence: [evidence],
            relationships: [],
            tags: ['auto_generated'],
            applicability: {
                contexts: [],
                conditions: [],
                limitations: [],
                prerequisites: [],
            },
            createdAt: Date.now(),
            lastVerified: Date.now(),
        };
    }
    findRelevantKnowledgeItems(knowledgeBase, evidence) {
        return knowledgeBase.knowledge.filter((item) => item?.tags.some((tag) => evidence.context.patternType?.includes(tag)));
    }
    recalculateConfidence(item) {
        const avgEvidenceStrength = item?.evidence.reduce((sum, e) => sum + e.strength, 0) /
            item?.evidence.length;
        return Math.min(1, avgEvidenceStrength * 1.1);
    }
    areItemsSimilar(item1, item2) {
        return (item1?.type === item2?.type &&
            item1?.content
                .toLowerCase()
                .includes(item2?.content.toLowerCase().split(' ')[0]));
    }
    mergeItems(primary, others) {
        const merged = { ...primary };
        merged.id = `merged_${Date.now()}`;
        others.forEach((other) => {
            merged.evidence.push(...other.evidence);
            merged.tags = [...new Set([...merged.tags, ...other.tags])];
        });
        merged.confidence = this.recalculateConfidence(merged);
        return merged;
    }
    isEvidenceRelevant(evidence, item) {
        return (evidence.context.patternType === item?.type ||
            item?.tags.some((tag) => evidence.source.includes(tag)));
    }
    validateItemWithEvidence(item, evidence) {
        const positiveEvidence = evidence.filter((e) => e.strength > 0.5);
        const negativeEvidence = evidence.filter((e) => e.strength <= 0.5);
        const boost = positiveEvidence.length * 0.1;
        const penalty = negativeEvidence.length * 0.05;
        return {
            confidence: Math.max(0, Math.min(1, item?.confidence + boost - penalty)),
        };
    }
    async addOrUpdateKnowledgeItem(knowledgeBase, item) {
        const existingIndex = knowledgeBase.knowledge.findIndex((k) => k.content === item?.content);
        if (existingIndex >= 0) {
            const existing = knowledgeBase.knowledge[existingIndex];
            if (existing) {
                existing.evidence.push(...item?.evidence);
                existing.confidence = this.recalculateConfidence(existing);
                existing.lastVerified = Date.now();
            }
        }
        else {
            knowledgeBase.knowledge.push(item);
        }
        knowledgeBase.metadata.totalItems = knowledgeBase.knowledge.length;
        knowledgeBase.metadata.avgConfidence =
            knowledgeBase.knowledge.reduce((sum, k) => sum + k.confidence, 0) /
                knowledgeBase.knowledge.length;
    }
    createKnowledgeItemFromCluster(cluster, domain) {
        return {
            id: `ki_cluster_${cluster.id}`,
            type: 'pattern',
            content: `Pattern cluster with ${cluster.members.length} occurrences in ${domain}`,
            confidence: cluster.confidence || 0.5,
            evidence: cluster.members.map((p) => this.patternToEvidence(p)),
            relationships: [],
            tags: [
                domain,
                'cluster_derived',
                cluster.members[0]?.taskType || 'unknown',
            ],
            applicability: {
                contexts: [domain],
                conditions: [`pattern_frequency >= ${cluster.members.length}`],
                limitations: [],
                prerequisites: [],
            },
            createdAt: Date.now(),
            lastVerified: Date.now(),
        };
    }
}
export default KnowledgeEvolution;
//# sourceMappingURL=knowledge-evolution.js.map