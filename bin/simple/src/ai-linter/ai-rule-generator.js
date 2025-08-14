export class AIRuleGenerator {
    logger;
    config;
    ruleTemplates = new Map();
    generatedRules = new Map();
    ruleEffectiveness = new Map();
    evolutionTimer;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this.initializeBuiltinTemplates();
        if (config.evolution.enabled) {
            this.setupRuleEvolution();
        }
    }
    async generateRules(analysisResults, context) {
        this.logger.info(`Generating AI rules from ${analysisResults.length} analysis results`);
        const generatedRules = [];
        const strategyPromises = this.config.strategies.map((strategy) => this.applyGenerationStrategy(strategy, analysisResults, context));
        const strategyResults = await Promise.all(strategyPromises);
        for (const rules of strategyResults) {
            generatedRules.push(...rules);
        }
        const uniqueRules = this.deduplicateRules(generatedRules);
        const rankedRules = this.rankRulesByConfidence(uniqueRules);
        const finalRules = rankedRules.slice(0, this.config.maxRulesPerAnalysis);
        for (const rule of finalRules) {
            this.generatedRules.set(rule.name, rule);
            if (this.config.trackEffectiveness &&
                !this.ruleEffectiveness.has(rule.name)) {
                this.ruleEffectiveness.set(rule.name, {
                    triggerCount: 0,
                    fixCount: 0,
                    falsePositiveCount: 0,
                    userRatings: [],
                    effectivenessScore: 0.5,
                });
            }
        }
        this.logger.info(`Generated ${finalRules.length} AI-powered rules`);
        return finalRules;
    }
    async applyGenerationStrategy(strategy, analysisResults, context) {
        this.logger.debug(`Applying ${strategy} generation strategy`);
        switch (strategy) {
            case 'pattern-based':
                return this.generatePatternBasedRules(analysisResults, context);
            case 'statistical':
                return this.generateStatisticalRules(analysisResults, context);
            case 'context-aware':
                return this.generateContextAwareRules(analysisResults, context);
            case 'collaborative':
                return this.generateCollaborativeRules(analysisResults, context);
            case 'evolutionary':
                return this.generateEvolutionaryRules(analysisResults, context);
            case 'creative':
                return this.generateCreativeRules(analysisResults, context);
            default:
                this.logger.warn(`Unknown generation strategy: ${strategy}`);
                return [];
        }
    }
    async generatePatternBasedRules(analysisResults, context) {
        const rules = [];
        const allPatterns = analysisResults.flatMap((result) => result.patterns);
        const patternGroups = this.groupPatternsByType(allPatterns);
        for (const [patternType, patterns] of Array.from(patternGroups.entries())) {
            if (patterns.length < 3)
                continue;
            const rule = await this.generateRuleFromPatterns(patternType, patterns, context);
            if (rule &&
                rule.metadata &&
                rule.metadata.confidence >= this.config.confidenceThreshold) {
                rules.push(rule);
            }
        }
        return rules;
    }
    async generateStatisticalRules(analysisResults, context) {
        const rules = [];
        const stats = this.calculateCodebaseStatistics(analysisResults);
        if (stats.averageComplexity > 15) {
            rules.push(await this.createComplexityRule(stats.averageComplexity * 0.8));
        }
        if (stats.typeAnnotationCoverage < 0.7) {
            rules.push(await this.createTypeAnnotationRule(stats.typeAnnotationCoverage));
        }
        if (stats.duplicatedCodePercentage > 0.1) {
            rules.push(await this.createDuplicationRule(stats.duplicatedCodePercentage));
        }
        return rules;
    }
    async generateContextAwareRules(analysisResults, context) {
        const rules = [];
        const { projectMetadata, teamPreferences } = context;
        switch (projectMetadata.type) {
            case 'library':
                rules.push(...(await this.generateLibrarySpecificRules(context)));
                break;
            case 'web-app':
                rules.push(...(await this.generateWebAppRules(context)));
                break;
            case 'api':
                rules.push(...(await this.generateAPIRules(context)));
                break;
        }
        for (const category of teamPreferences.priorityCategories) {
            const categoryRules = await this.generateCategorySpecificRules(category, analysisResults, context);
            rules.push(...categoryRules);
        }
        return rules;
    }
    async generateCollaborativeRules(analysisResults, context) {
        const rules = [];
        const { teamPreferences } = context;
        for (const [ruleName, feedback] of Array.from(teamPreferences.ruleFeedback.entries())) {
            if (feedback.rating < 3 && feedback.falsePositives > 5) {
                const improvedRule = await this.improveRule(ruleName, feedback, context);
                if (improvedRule) {
                    rules.push(improvedRule);
                }
            }
        }
        for (const feedback of Array.from(teamPreferences.ruleFeedback.values())) {
            for (const improvement of feedback.improvements) {
                const rule = await this.generateRuleFromSuggestion(improvement, context);
                if (rule) {
                    rules.push(rule);
                }
            }
        }
        return rules;
    }
    async generateEvolutionaryRules(analysisResults, context) {
        const rules = [];
        for (const [ruleName, effectiveness] of Array.from(this.ruleEffectiveness.entries())) {
            if (effectiveness.effectivenessScore <
                this.config.evolution.retirementThreshold) {
                const improvedRule = await this.evolveRule(ruleName, effectiveness, context);
                if (improvedRule) {
                    rules.push(improvedRule);
                }
            }
            else if (effectiveness.effectivenessScore > 0.9) {
                const variants = await this.generateRuleVariants(ruleName, effectiveness, context);
                rules.push(...variants);
            }
        }
        return rules;
    }
    async generateCreativeRules(analysisResults, context) {
        const rules = [];
        const creativeSuggestions = await this.requestCreativeRules(analysisResults, context);
        for (const suggestion of creativeSuggestions) {
            const rule = await this.implementCreativeRule(suggestion, context);
            if (rule &&
                rule.metadata &&
                rule.metadata.confidence >= this.config.confidenceThreshold) {
                rules.push(rule);
            }
        }
        return rules;
    }
    groupPatternsByType(patterns) {
        const groups = new Map();
        for (const pattern of patterns) {
            if (!groups.has(pattern.type)) {
                groups.set(pattern.type, []);
            }
            groups.get(pattern.type).push(pattern);
        }
        return groups;
    }
    calculateCodebaseStatistics(analysisResults) {
        const fileCount = analysisResults.length;
        const totalPatterns = analysisResults.reduce((sum, result) => sum + result.patterns.length, 0);
        return {
            averageComplexity: 12.5,
            typeAnnotationCoverage: 0.65,
            duplicatedCodePercentage: 0.08,
            testCoverage: 0.78,
            linesOfCode: fileCount * 150,
            functionCount: totalPatterns * 0.3,
            fileCount,
        };
    }
    async generateRuleFromPatterns(patternType, patterns, context) {
        return {
            name: `ai-${patternType}-rule`,
            category: 'complexity',
            level: 'warn',
            options: {
                threshold: patterns.length > 5 ? 'strict' : 'moderate',
            },
            metadata: {
                aiGenerated: true,
                generatedAt: Date.now(),
                reasoning: `Generated from ${patterns.length} instances of ${patternType} pattern`,
                confidence: 0.8,
                sourceAnalysis: `Pattern analysis of ${patterns.length} occurrences`,
            },
        };
    }
    async createComplexityRule(threshold) {
        return {
            name: 'ai-complexity-limit',
            category: 'complexity',
            level: 'error',
            options: {
                maxAllowedComplexity: Math.floor(threshold),
            },
            metadata: {
                aiGenerated: true,
                generatedAt: Date.now(),
                reasoning: `Complexity threshold based on codebase analysis`,
                confidence: 0.9,
                sourceAnalysis: 'Statistical analysis of codebase complexity',
            },
        };
    }
    async createTypeAnnotationRule(coverage) {
        return {
            name: 'ai-type-annotation-coverage',
            category: 'suspicious',
            level: 'warn',
            options: {
                minimumCoverage: Math.min(coverage + 0.1, 0.95),
            },
            metadata: {
                aiGenerated: true,
                generatedAt: Date.now(),
                reasoning: `Type annotation coverage below project standards`,
                confidence: 0.85,
                sourceAnalysis: 'Type annotation coverage analysis',
            },
        };
    }
    async createDuplicationRule(percentage) {
        return {
            name: 'ai-code-duplication-limit',
            category: 'style',
            level: 'warn',
            options: {
                maxDuplicationPercentage: Math.max(percentage - 0.02, 0.05),
            },
            metadata: {
                aiGenerated: true,
                generatedAt: Date.now(),
                reasoning: `Code duplication above recommended threshold`,
                confidence: 0.75,
                sourceAnalysis: 'Code duplication analysis',
            },
        };
    }
    deduplicateRules(rules) {
        const seen = new Set();
        return rules.filter((rule) => {
            const key = `${rule.category}:${rule.name}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    rankRulesByConfidence(rules) {
        return rules.sort((a, b) => {
            const aConf = a.metadata?.confidence || 0;
            const bConf = b.metadata?.confidence || 0;
            return bConf - aConf;
        });
    }
    initializeBuiltinTemplates() {
    }
    setupRuleEvolution() {
        this.evolutionTimer = setInterval(() => this.performRuleEvolution(), this.config.evolution.evolutionInterval);
    }
    performRuleEvolution() {
        this.logger.info('Performing rule evolution cycle');
    }
    async generateLibrarySpecificRules(context) {
        return [];
    }
    async generateWebAppRules(context) {
        return [];
    }
    async generateAPIRules(context) {
        return [];
    }
    async generateCategorySpecificRules(category, analysisResults, context) {
        return [];
    }
    async improveRule(ruleName, feedback, context) {
        return null;
    }
    async generateRuleFromSuggestion(suggestion, context) {
        return null;
    }
    async evolveRule(ruleName, effectiveness, context) {
        return null;
    }
    async generateRuleVariants(ruleName, effectiveness, context) {
        return [];
    }
    async requestCreativeRules(analysisResults, context) {
        return [];
    }
    async implementCreativeRule(suggestion, context) {
        return null;
    }
    getStatistics() {
        return {
            totalGeneratedRules: this.generatedRules.size,
            effectivenessTracking: this.ruleEffectiveness.size,
            averageConfidence: this.calculateAverageRuleConfidence(),
            topPerformingRules: this.getTopPerformingRules(5),
        };
    }
    calculateAverageRuleConfidence() {
        const rules = Array.from(this.generatedRules.values());
        if (rules.length === 0)
            return 0;
        const confidences = rules
            .map((rule) => rule.metadata?.confidence || 0)
            .filter((conf) => conf > 0);
        return (confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length);
    }
    getTopPerformingRules(limit) {
        return Array.from(this.ruleEffectiveness.entries())
            .sort((a, b) => b[1].effectivenessScore - a[1].effectivenessScore)
            .slice(0, limit)
            .map((entry) => entry[0]);
    }
    destroy() {
        if (this.evolutionTimer) {
            clearInterval(this.evolutionTimer);
        }
        this.ruleTemplates.clear();
        this.generatedRules.clear();
        this.ruleEffectiveness.clear();
    }
}
//# sourceMappingURL=ai-rule-generator.js.map