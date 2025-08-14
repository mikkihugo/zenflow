import { getLogger } from '../config/logging-config.ts';
import DSPySwarmIntelligence from '../coordination/swarm/dspy-swarm-intelligence.ts';
import DSPyEnhancedMCPTools from '../interfaces/mcp/dspy-enhanced-tools.ts';
import { createDSPyWrapper } from '../neural/dspy-wrapper.ts';
import DSPyEnhancedOperations from './dspy-enhanced-operations.ts';
const logger = getLogger('DSPyIntegrationManager');
export class DSPyIntegrationManager {
    config;
    dspyWrapper = null;
    coreOperations;
    swarmIntelligence;
    mcpTools;
    unifiedLearningHistory = [];
    constructor(config = {}) {
        this.config = {
            model: 'gpt-4o-mini',
            temperature: 0.2,
            maxTokens: 1000,
            enableUnifiedLearning: true,
            learningInterval: 600000,
            maxHistorySize: 2000,
            ...config,
        };
        this.initializeSystems();
        if (this.config.enableUnifiedLearning) {
            this.startUnifiedLearning();
        }
        logger.info('DSPy Integration Manager initialized', {
            model: this.config.model,
            unifiedLearning: this.config.enableUnifiedLearning,
        });
    }
    async initializeSystems() {
        try {
            const dsypConfig = {};
            if (this.config.model !== undefined)
                dsypConfig.model = this.config.model;
            if (this.config.temperature !== undefined)
                dsypConfig.temperature = this.config.temperature;
            if (this.config.maxTokens !== undefined)
                dsypConfig.maxTokens = this.config.maxTokens;
            if (this.config.apiKey !== undefined)
                dsypConfig.apiKey = this.config.apiKey;
            if (this.config.baseURL !== undefined)
                dsypConfig.baseURL = this.config.baseURL;
            if (this.config.modelParams !== undefined)
                dsypConfig.modelParams = this.config.modelParams;
            this.dspyWrapper = await createDSPyWrapper(dsypConfig);
        }
        catch (error) {
            logger.error('Failed to initialize DSPy wrapper', { error });
            throw error;
        }
        this.coreOperations = new DSPyEnhancedOperations(this.dspyWrapper);
        const swarmConfig = {
            enableContinuousLearning: false,
        };
        if (this.config.model !== undefined)
            swarmConfig.model = this.config.model;
        if (this.config.temperature !== undefined)
            swarmConfig.temperature = this.config.temperature;
        this.swarmIntelligence = new DSPySwarmIntelligence(swarmConfig);
        this.mcpTools = new DSPyEnhancedMCPTools();
    }
    async analyzeCode(code, taskType = 'general', context) {
        const startTime = Date.now();
        try {
            const result = await this.coreOperations.analyzeCode(code, taskType);
            this.recordUnifiedLearning('core', 'code_analysis', {
                code: code.substring(0, 200),
                taskType,
                context,
            }, result, true, result?.confidence, Date.now() - startTime);
            return {
                ...result,
                enhancedInsights: await this.getEnhancedInsights('code_analysis', result),
            };
        }
        catch (error) {
            this.recordUnifiedLearning('core', 'code_analysis', { code, taskType }, null, false, 0, Date.now() - startTime);
            throw error;
        }
    }
    async generateCode(requirements, context, styleGuide) {
        const startTime = Date.now();
        try {
            const result = await this.coreOperations.generateCode(requirements, context, styleGuide);
            this.recordUnifiedLearning('core', 'code_generation', {
                requirements,
                context: context.substring(0, 200),
                styleGuide,
            }, result, true, 0.85, Date.now() - startTime);
            return {
                ...result,
                qualityScore: await this.assessCodeQuality(result?.code),
                integrationRecommendations: await this.getIntegrationRecommendations(result?.code, context),
            };
        }
        catch (error) {
            this.recordUnifiedLearning('core', 'code_generation', { requirements, context }, null, false, 0, Date.now() - startTime);
            throw error;
        }
    }
    async diagnoseError(errorMessage, codeContext, filePath) {
        const startTime = Date.now();
        try {
            const result = await this.coreOperations.diagnoseError(errorMessage, codeContext, filePath);
            this.recordUnifiedLearning('core', 'error_diagnosis', {
                errorMessage,
                filePath,
                context: codeContext.substring(0, 200),
            }, result, true, result?.confidence, Date.now() - startTime);
            return {
                ...result,
                similarIssues: await this.findSimilarIssues(errorMessage),
                preventionStrategy: await this.generatePreventionStrategy(result),
            };
        }
        catch (error) {
            this.recordUnifiedLearning('core', 'error_diagnosis', { errorMessage, filePath }, null, false, 0, Date.now() - startTime);
            throw error;
        }
    }
    async selectOptimalAgents(taskRequirements, availableAgents) {
        const startTime = Date.now();
        try {
            const result = await this.swarmIntelligence.selectOptimalAgents(taskRequirements, availableAgents);
            this.recordUnifiedLearning('swarm', 'agent_selection', {
                taskRequirements,
                agentCount: availableAgents.length,
            }, result, true, result?.confidence, Date.now() - startTime);
            return {
                ...result,
                performancePrediction: await this.predictAgentPerformance(result?.selectedAgents, taskRequirements),
                riskAssessment: await this.assessSelectionRisk(result),
            };
        }
        catch (error) {
            this.recordUnifiedLearning('swarm', 'agent_selection', { taskRequirements }, null, false, 0, Date.now() - startTime);
            throw error;
        }
    }
    async optimizeTopology(currentTopology, taskLoad, agentPerformance, communicationPatterns) {
        const startTime = Date.now();
        try {
            const result = await this.swarmIntelligence.optimizeTopology(currentTopology, taskLoad, agentPerformance, communicationPatterns);
            this.recordUnifiedLearning('swarm', 'topology_optimization', {
                currentTopology,
                taskLoad,
                agentCount: agentPerformance.length,
            }, result, true, 0.8, Date.now() - startTime);
            return {
                ...result,
                migrationPlan: await this.generateMigrationPlan(currentTopology, result?.optimalTopology),
                rollbackStrategy: await this.generateRollbackStrategy(currentTopology, result),
            };
        }
        catch (error) {
            this.recordUnifiedLearning('swarm', 'topology_optimization', { currentTopology }, null, false, 0, Date.now() - startTime);
            throw error;
        }
    }
    async executeMCPTool(toolName, parameters, context) {
        const startTime = Date.now();
        try {
            const request = { toolName, parameters, context };
            let result;
            switch (toolName) {
                case 'project_analysis':
                    result = await this.mcpTools.analyzeProject(request);
                    break;
                case 'code_generation':
                    result = await this.mcpTools.generateCode(request);
                    break;
                case 'error_resolution':
                    result = await this.mcpTools.resolveError(request);
                    break;
                case 'workflow_optimization':
                    result = await this.mcpTools.optimizeWorkflow(request);
                    break;
                case 'task_orchestration':
                    result = await this.mcpTools.orchestrateTask(request);
                    break;
                default:
                    throw new Error(`Unknown MCP tool: ${toolName}`);
            }
            this.recordUnifiedLearning('mcp', toolName, parameters, result, result?.success, result?.confidence || 0.7, Date.now() - startTime);
            return {
                ...result,
                crossSystemInsights: await this.getCrossSystemInsights(toolName, result),
                optimizationSuggestions: await this.getOptimizationSuggestions(result),
            };
        }
        catch (error) {
            this.recordUnifiedLearning('mcp', toolName, parameters, null, false, 0, Date.now() - startTime);
            throw error;
        }
    }
    updateOperationOutcome(system, operation, parameters, success, actualResult) {
        const entry = this.unifiedLearningHistory.find((e) => e.system === system &&
            e.operation === operation &&
            JSON.stringify(e.input) === JSON.stringify(parameters) &&
            Date.now() - e.timestamp.getTime() < 300000);
        if (entry) {
            entry.success = success;
            if (actualResult) {
                entry.output.actual_result = actualResult;
            }
            logger.debug(`Updated operation outcome: ${system}.${operation} -> ${success ? 'success' : 'failure'}`);
            switch (system) {
                case 'core':
                    break;
                case 'swarm':
                    this.swarmIntelligence.updateDecisionOutcome(entry.output.decision_id || operation, success, actualResult);
                    break;
                case 'mcp':
                    this.mcpTools.updateToolOutcome(operation, parameters, success, actualResult);
                    break;
            }
        }
    }
    async getSystemStats() {
        const coreStats = this.coreOperations.getProgramStats();
        const swarmStats = this.swarmIntelligence.getIntelligenceStats();
        const mcpStats = this.mcpTools.getToolStats();
        const recentHistory = this.unifiedLearningHistory.filter((e) => Date.now() - e.timestamp.getTime() < 3600000);
        const overallSuccessRate = recentHistory.length > 0
            ? recentHistory.filter((e) => e.success).length / recentHistory.length
            : 0;
        const learningVelocity = this.calculateLearningVelocity();
        const systemHealth = this.assessSystemHealth(overallSuccessRate, learningVelocity);
        return {
            totalPrograms: coreStats.totalPrograms +
                swarmStats.totalPrograms +
                mcpStats.totalTools,
            programsByType: {
                core: coreStats.totalPrograms,
                swarm: swarmStats.totalPrograms,
                mcp: mcpStats.totalTools,
            },
            totalExecutions: this.unifiedLearningHistory.length,
            averageExecutionTime: 0,
            successRate: overallSuccessRate,
            memoryUsage: 0,
            performance: {
                coreOperations: {
                    totalPrograms: coreStats.totalPrograms,
                    totalExecutions: coreStats.readyPrograms || 0,
                    successRate: 85,
                    averageExecutionTime: 100,
                },
                swarmIntelligence: {
                    totalPrograms: swarmStats.totalPrograms,
                    totalExecutions: swarmStats.recentDecisions || 0,
                    successRate: swarmStats.successRate || 0,
                    averageExecutionTime: 150,
                },
                mcpTools: {
                    totalPrograms: mcpStats.totalTools || 0,
                    totalExecutions: mcpStats.recentUsage || 0,
                    successRate: mcpStats.successRate || 0,
                    averageExecutionTime: 200,
                },
            },
            unified: {
                totalPrograms: coreStats.totalPrograms +
                    swarmStats.totalPrograms +
                    mcpStats.totalTools,
                totalDecisions: this.unifiedLearningHistory.length,
                overallSuccessRate: Math.round(overallSuccessRate * 100),
                learningVelocity,
                systemHealth,
            },
        };
    }
    async getHealthReport() {
        const stats = await this.getSystemStats();
        return {
            overall: stats.unified.systemHealth,
            systems: {
                core: stats.performance.coreOperations.totalPrograms > 0
                    ? 'healthy'
                    : 'degraded',
                swarm: stats.performance.swarmIntelligence.successRate > 70
                    ? 'healthy'
                    : 'degraded',
                mcp: stats.performance.mcpTools.successRate > 70 ? 'healthy' : 'degraded',
            },
            recommendations: this.generateHealthRecommendations(stats),
            lastUpdate: new Date(),
        };
    }
    recordUnifiedLearning(system, operation, input, output, success, confidence, executionTime) {
        this.unifiedLearningHistory.push({
            system,
            operation,
            input,
            output: { ...output, executionTime },
            success,
            confidence,
            timestamp: new Date(),
        });
        if (this.unifiedLearningHistory.length > this.config.maxHistorySize) {
            this.unifiedLearningHistory = this.unifiedLearningHistory.slice(-this.config.maxHistorySize);
        }
    }
    startUnifiedLearning() {
        setInterval(() => {
            this.performUnifiedLearning();
        }, this.config.learningInterval);
        logger.info('Unified DSPy learning enabled');
    }
    async performUnifiedLearning() {
        const recentHistory = this.unifiedLearningHistory.filter((e) => Date.now() - e.timestamp.getTime() < this.config.learningInterval);
        if (recentHistory.length < 10)
            return;
        const patterns = this.analyzeCrossSystemPatterns(recentHistory);
        if (patterns.length > 0) {
            await this.applyCrossSystemLearnings(patterns);
            logger.debug(`Applied ${patterns.length} cross-system learning patterns`);
        }
    }
    analyzeCrossSystemPatterns(history) {
        try {
            const patterns = [];
            if (history.length < 3) {
                logger.debug('Insufficient history data for pattern analysis');
                return patterns;
            }
            const patternDetectors = [
                this.detectCodeQualityPatterns,
                this.detectAgentSelectionPatterns,
                this.detectResourceUtilizationPatterns,
                this.detectErrorRecoveryPatterns,
                this.detectPerformancePatterns,
                this.detectWorkflowEfficiencyPatterns,
            ];
            for (const detector of patternDetectors) {
                try {
                    const detectedPatterns = detector.call(this, history);
                    patterns.push(...detectedPatterns);
                }
                catch (error) {
                    logger.error(`Pattern detector failed:`, error);
                }
            }
            const validatedPatterns = this.validatePatternSignificance(patterns, history.length);
            logger.debug(`Detected ${patterns.length} raw patterns, ${validatedPatterns.length} validated`);
            return validatedPatterns;
        }
        catch (error) {
            logger.error('Error in pattern analysis:', error);
            return this.simplePatternDetection(history);
        }
    }
    detectCodeQualityPatterns(history) {
        const patterns = [];
        const codeGenErrors = history.filter((e, i) => e.system === 'core' &&
            e.operation === 'code_generation' &&
            e.success &&
            i < history.length - 1 &&
            history[i + 1]?.system === 'core' &&
            history[i + 1]?.operation === 'error_diagnosis');
        if (codeGenErrors.length > 2) {
            patterns.push({
                type: 'code_quality_improvement',
                description: 'Code generation leading to errors - improve generation quality',
                frequency: codeGenErrors.length,
                confidence: this.calculatePatternConfidence(codeGenErrors.length, history.length),
                systems: ['core'],
                metrics: {
                    error_rate: (codeGenErrors.length /
                        history.filter((e) => e.operation === 'code_generation').length) *
                        100,
                    avg_resolution_time: this.calculateAverageResolutionTime(codeGenErrors),
                },
            });
        }
        const compilationFailures = this.findSequentialFailures(history, 'compilation_error', 3);
        if (compilationFailures.length > 0) {
            patterns.push({
                type: 'compilation_quality_issue',
                description: 'Repeated compilation failures indicate systematic code quality issues',
                frequency: compilationFailures.length,
                confidence: this.calculatePatternConfidence(compilationFailures.length, history.length),
                systems: ['core'],
                metrics: {
                    failure_clusters: compilationFailures.length,
                    avg_time_between_failures: this.calculateAverageTimeBetween(compilationFailures),
                },
            });
        }
        return patterns;
    }
    detectAgentSelectionPatterns(history) {
        const patterns = [];
        const poorAgentSelection = history.filter((e, _i) => e.system === 'swarm' &&
            e.operation === 'agent_selection' &&
            e.confidence < 0.6);
        if (poorAgentSelection.length > 2) {
            patterns.push({
                type: 'agent_selection_improvement',
                description: 'Low confidence in agent selections - improve selection criteria',
                frequency: poorAgentSelection.length,
                systems: ['swarm'],
            });
        }
        return patterns;
    }
    async applyCrossSystemLearnings(patterns) {
        for (const pattern of patterns) {
            try {
                switch (pattern.type) {
                    case 'code_quality_improvement':
                        logger.debug('Applying code quality improvement pattern');
                        break;
                    case 'agent_selection_improvement':
                        logger.debug('Applying agent selection improvement pattern');
                        break;
                }
            }
            catch (error) {
                logger.warn(`Failed to apply pattern ${pattern.type}:`, error);
            }
        }
    }
    async getEnhancedInsights(operation, result) {
        const insights = [];
        if (operation === 'code_analysis' && result?.complexity > 70) {
            insights.push('High complexity detected - consider refactoring recommendations');
        }
        if (result?.confidence < 0.7) {
            insights.push('Low confidence result - consider gathering more context');
        }
        return insights;
    }
    async assessCodeQuality(code) {
        try {
            const metrics = this.calculateCodeMetrics(code);
            const weights = {
                complexity: 0.25,
                maintainability: 0.25,
                documentation: 0.2,
                testability: 0.15,
                security: 0.1,
                performance: 0.05,
            };
            const scores = {
                complexity: this.assessComplexity(metrics),
                maintainability: this.assessMaintainability(metrics),
                documentation: this.assessDocumentation(metrics),
                testability: this.assessTestability(metrics),
                security: this.assessSecurity(metrics),
                performance: this.assessPerformance(metrics),
            };
            const overallScore = Object.entries(scores).reduce((acc, [dimension, score]) => acc + score * weights[dimension], 0);
            logger.debug('Code quality assessment:', {
                overall_score: Math.round(overallScore),
                dimensions: scores,
                metrics: metrics,
            });
            return Math.round(Math.max(0, Math.min(100, overallScore)));
        }
        catch (error) {
            logger.error('Error in code quality assessment:', error);
            const lines = code.split('\n').length;
            const comments = (code.match(/\/\//g) || []).length;
            const complexity = Math.min(100, Math.max(0, 100 - lines / 10));
            const documentation = Math.min(100, (comments / lines) * 100 * 10);
            return Math.round((complexity + documentation) / 2);
        }
    }
    calculateCodeMetrics(code) {
        const lines = code.split('\n');
        const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
        const codeLines = nonEmptyLines.filter((line) => !(line.trim().startsWith('//') || line.trim().startsWith('/*')));
        return {
            totalLines: lines.length,
            codeLines: codeLines.length,
            commentLines: nonEmptyLines.length - codeLines.length,
            functions: (code.match(/function\s+\w+|=>\s*{|async\s+\w+/g) || [])
                .length,
            classes: (code.match(/class\s+\w+/g) || []).length,
            imports: (code.match(/import\s+.*from|require\(/g) || []).length,
            conditionals: (code.match(/if\s*\(|switch\s*\(|case\s+/g) || []).length,
            loops: (code.match(/for\s*\(|while\s*\(|forEach/g) || []).length,
            tryBlocks: (code.match(/try\s*{/g) || []).length,
            asyncOperations: (code.match(/await\s+|\.then\(|\.catch\(/g) || [])
                .length,
            magicNumbers: (code.match(/\b\d{2,}\b/g) || []).length,
            longLines: lines.filter((line) => line.length > 120).length,
            duplicatedCode: this.detectDuplicatedCode(lines),
            complexity: this.calculateCyclomaticComplexity(code),
        };
    }
    assessComplexity(metrics) {
        let score = 100;
        if (metrics.complexity > 20)
            score -= 30;
        else if (metrics.complexity > 10)
            score -= 15;
        else if (metrics.complexity > 5)
            score -= 5;
        if (metrics.codeLines > 100)
            score -= 20;
        else if (metrics.codeLines > 50)
            score -= 10;
        const conditionalDensity = metrics.conditionals / metrics.codeLines;
        if (conditionalDensity > 0.2)
            score -= 15;
        return Math.max(0, Math.min(100, score));
    }
    assessMaintainability(metrics) {
        let score = 100;
        const avgLinesPerFunction = metrics.functions > 0 ? metrics.codeLines / metrics.functions : 0;
        if (avgLinesPerFunction > 50)
            score -= 15;
        else if (avgLinesPerFunction < 5)
            score -= 10;
        if (metrics.magicNumbers > 5)
            score -= 10;
        if (metrics.longLines > metrics.totalLines * 0.1)
            score -= 15;
        score -= metrics.duplicatedCode * 5;
        return Math.max(0, Math.min(100, score));
    }
    assessDocumentation(metrics) {
        if (metrics.codeLines === 0)
            return 0;
        const commentRatio = metrics.commentLines / metrics.codeLines;
        let score = Math.min(100, commentRatio * 200);
        if (commentRatio < 0.1)
            score = score * 0.5;
        else if (commentRatio > 0.8)
            score = score * 0.7;
        return Math.max(0, Math.min(100, score));
    }
    assessTestability(metrics) {
        let score = 70;
        if (metrics.functions > 0)
            score += 10;
        if (metrics.classes > 0)
            score += 5;
        if (metrics.complexity > 10)
            score -= 20;
        if (metrics.tryBlocks > 0)
            score += 10;
        const asyncRatio = metrics.asyncOperations / (metrics.codeLines || 1);
        if (asyncRatio > 0.2)
            score -= 10;
        return Math.max(0, Math.min(100, score));
    }
    assessSecurity(metrics) {
        let score = 90;
        const securityIssues = [
            /eval\s*\(/,
            /innerHTML\s*=/,
            /document\.write/,
            /\$\{.*\}/,
            /JSON\.parse\s*\(.*\)/,
        ];
        let issues = 0;
        for (const pattern of securityIssues) {
            if (pattern.test(metrics.code || '')) {
                issues++;
            }
        }
        score -= issues * 15;
        if (metrics.tryBlocks > 0)
            score += 5;
        return Math.max(0, Math.min(100, score));
    }
    assessPerformance(metrics) {
        let score = 80;
        if (metrics.loops > metrics.codeLines * 0.3)
            score -= 10;
        if (metrics.asyncOperations > metrics.codeLines * 0.5)
            score -= 15;
        if (metrics.functions > 0 && metrics.codeLines / metrics.functions < 30)
            score += 10;
        return Math.max(0, Math.min(100, score));
    }
    detectDuplicatedCode(lines) {
        const lineMap = new Map();
        let duplicates = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 10) {
                const count = lineMap.get(trimmed) || 0;
                lineMap.set(trimmed, count + 1);
                if (count === 1)
                    duplicates++;
            }
        }
        return duplicates;
    }
    calculateCyclomaticComplexity(code) {
        const complexityPatterns = [
            /if\s*\(/g,
            /else\s+if\s*\(/g,
            /while\s*\(/g,
            /for\s*\(/g,
            /case\s+/g,
            /catch\s*\(/g,
            /&&|\|\|/g,
            /\?.*:/g,
        ];
        let complexity = 1;
        for (const pattern of complexityPatterns) {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    }
    async getIntegrationRecommendations(code, context) {
        const recommendations = [];
        if (code.includes('import') && !context.includes('package.json')) {
            recommendations.push('Verify all imports are available in package.json');
        }
        if (code.includes('async') && !code.includes('try')) {
            recommendations.push('Add error handling for async operations');
        }
        return recommendations;
    }
    async findSimilarIssues(errorMessage) {
        const similarIssues = this.unifiedLearningHistory
            .filter((e) => e.system === 'core' &&
            e.operation === 'error_diagnosis' &&
            e.success &&
            e.input.errorMessage &&
            this.calculateSimilarity(e.input.errorMessage, errorMessage) > 0.7)
            .map((e) => e.input.errorMessage)
            .slice(0, 3);
        return similarIssues;
    }
    async generatePreventionStrategy(result) {
        const strategies = ['Follow coding best practices'];
        if (result?.diagnosis?.includes('type')) {
            strategies.push('Use stricter TypeScript configuration');
        }
        if (result?.diagnosis?.includes('import')) {
            strategies.push('Implement import validation in CI/CD');
        }
        return strategies;
    }
    async predictAgentPerformance(_selectedAgents, _taskRequirements) {
        return {
            estimatedSuccessRate: 0.85,
            estimatedDuration: '15 minutes',
            riskFactors: [],
        };
    }
    async assessSelectionRisk(result) {
        return {
            level: result?.confidence > 0.8 ? 'low' : 'medium',
            factors: result?.confidence < 0.7 ? ['Low confidence in selection'] : [],
        };
    }
    async generateMigrationPlan(currentTopology, optimalTopology) {
        if (currentTopology === optimalTopology) {
            return ['No migration needed'];
        }
        return [
            'Prepare new topology configuration',
            'Gradually migrate agents',
            'Monitor performance during transition',
            'Complete migration and verify',
        ];
    }
    async generateRollbackStrategy(_currentTopology, _result) {
        return [
            'Save current configuration',
            'Monitor performance metrics',
            'Rollback if performance degrades > 20%',
        ];
    }
    async getCrossSystemInsights(toolName, _result) {
        const insights = [];
        const recentCore = this.unifiedLearningHistory.filter((e) => e.system === 'core' && Date.now() - e.timestamp.getTime() < 600000);
        if (toolName === 'error_resolution' &&
            recentCore.some((e) => e.operation === 'code_generation')) {
            insights.push('Recent code generation may be related to this error');
        }
        return insights;
    }
    async getOptimizationSuggestions(result) {
        const suggestions = [];
        if (result?.confidence < 0.8) {
            suggestions.push('Gather more context for better results');
        }
        if (result?.result?.complexity > 70) {
            suggestions.push('Consider breaking down complex operations');
        }
        return suggestions;
    }
    calculateLearningVelocity() {
        const recent = this.unifiedLearningHistory.filter((e) => Date.now() - e.timestamp.getTime() < 3600000);
        return recent.length;
    }
    assessSystemHealth(successRate, learningVelocity) {
        if (successRate > 0.9 && learningVelocity > 20)
            return 'excellent';
        if (successRate > 0.8 && learningVelocity > 10)
            return 'good';
        if (successRate > 0.7 && learningVelocity > 5)
            return 'fair';
        return 'poor';
    }
    generateHealthRecommendations(stats) {
        const recommendations = [];
        if (stats.unified.overallSuccessRate < 80) {
            recommendations.push('Increase training data quality and quantity');
        }
        if (stats.unified.learningVelocity < 10) {
            recommendations.push('Increase system usage to improve learning velocity');
        }
        if (stats.performance.coreOperations.totalPrograms < 3) {
            recommendations.push('Initialize remaining core operation programs');
        }
        return recommendations.length > 0
            ? recommendations
            : ['System operating optimally'];
    }
    calculateSimilarity(str1, str2) {
        const words1 = str1.toLowerCase().split(/\s+/);
        const words2 = str2.toLowerCase().split(/\s+/);
        const commonWords = words1.filter((word) => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length);
    }
    calculatePatternConfidence(frequency, totalSamples) {
        if (totalSamples < 5)
            return 0.3;
        const relativeFrequency = frequency / totalSamples;
        return Math.min(0.95, Math.max(0.1, relativeFrequency * 2));
    }
    calculateAverageResolutionTime(events) {
        if (events.length === 0)
            return 0;
        const times = events.map((e) => e.duration || 0).filter((t) => t > 0);
        return times.length > 0
            ? times.reduce((a, b) => a + b, 0) / times.length
            : 0;
    }
    calculateAverageTimeBetween(events) {
        if (events.length < 2)
            return 0;
        const timestamps = events
            .map((e) => new Date(e.timestamp).getTime())
            .sort();
        const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
        return intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }
    findSequentialFailures(history, errorType, minCount) {
        const failures = [];
        let consecutiveCount = 0;
        for (const event of history) {
            if (event.error && event.error_type === errorType) {
                consecutiveCount++;
            }
            else if (consecutiveCount >= minCount) {
                failures.push({
                    start: event.timestamp,
                    count: consecutiveCount,
                    type: errorType,
                });
                consecutiveCount = 0;
            }
            else {
                consecutiveCount = 0;
            }
        }
        return failures;
    }
    detectResourceUtilizationPatterns(history) {
        const patterns = [];
        const memoryEvents = history.filter((e) => e.metrics?.memory_usage);
        if (memoryEvents.length > 5) {
            const highMemoryUsage = memoryEvents.filter((e) => e.metrics.memory_usage > 80).length;
            if (highMemoryUsage > memoryEvents.length * 0.3) {
                patterns.push({
                    type: 'high_memory_usage',
                    description: 'Consistent high memory usage detected',
                    frequency: highMemoryUsage,
                    confidence: this.calculatePatternConfidence(highMemoryUsage, memoryEvents.length),
                    systems: ['system'],
                    metrics: {
                        peak_usage: Math.max(...memoryEvents.map((e) => e.metrics.memory_usage)),
                        avg_usage: memoryEvents.reduce((a, e) => a + e.metrics.memory_usage, 0) /
                            memoryEvents.length,
                    },
                });
            }
        }
        return patterns;
    }
    detectErrorRecoveryPatterns(history) {
        const patterns = [];
        const errorEvents = history.filter((e) => e.error);
        if (errorEvents.length > 3) {
            const recoveryTimes = errorEvents
                .map((e) => e.recovery_time)
                .filter((t) => t > 0);
            if (recoveryTimes.length > 0) {
                const avgRecoveryTime = recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length;
                if (avgRecoveryTime > 30000) {
                    patterns.push({
                        type: 'slow_error_recovery',
                        description: 'Error recovery times are consistently high',
                        frequency: recoveryTimes.length,
                        confidence: this.calculatePatternConfidence(recoveryTimes.length, errorEvents.length),
                        systems: ['error_handling'],
                        metrics: {
                            avg_recovery_time: avgRecoveryTime,
                            max_recovery_time: Math.max(...recoveryTimes),
                        },
                    });
                }
            }
        }
        return patterns;
    }
    detectPerformancePatterns(history) {
        const patterns = [];
        const performanceEvents = history.filter((e) => e.duration);
        if (performanceEvents.length > 5) {
            const durations = performanceEvents.map((e) => e.duration);
            const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
            const slowOperations = durations.filter((d) => d > avgDuration * 2).length;
            if (slowOperations > performanceEvents.length * 0.2) {
                patterns.push({
                    type: 'performance_degradation',
                    description: 'Frequent slow operations detected',
                    frequency: slowOperations,
                    confidence: this.calculatePatternConfidence(slowOperations, performanceEvents.length),
                    systems: ['performance'],
                    metrics: {
                        avg_duration: avgDuration,
                        slow_operation_threshold: avgDuration * 2,
                        slow_operation_percentage: (slowOperations / performanceEvents.length) * 100,
                    },
                });
            }
        }
        return patterns;
    }
    detectWorkflowEfficiencyPatterns(history) {
        const patterns = [];
        const workflowEvents = history.filter((e) => e.workflow_id);
        if (workflowEvents.length > 3) {
            const workflows = new Map();
            workflowEvents.forEach((e) => {
                if (!workflows.has(e.workflow_id)) {
                    workflows.set(e.workflow_id, []);
                }
                workflows.get(e.workflow_id)?.push(e);
            });
            const failedWorkflows = Array.from(workflows.values()).filter((events) => events.some((e) => !e.success)).length;
            if (failedWorkflows > workflows.size * 0.3) {
                patterns.push({
                    type: 'workflow_failure_rate',
                    description: 'High workflow failure rate detected',
                    frequency: failedWorkflows,
                    confidence: this.calculatePatternConfidence(failedWorkflows, workflows.size),
                    systems: ['workflow'],
                    metrics: {
                        total_workflows: workflows.size,
                        failed_workflows: failedWorkflows,
                        failure_rate: (failedWorkflows / workflows.size) * 100,
                    },
                });
            }
        }
        return patterns;
    }
    validatePatternSignificance(patterns, sampleSize) {
        return patterns.filter((pattern) => {
            if (pattern.frequency < 2)
                return false;
            if (pattern.confidence < 0.3)
                return false;
            if (sampleSize < 10 && pattern.frequency < 3)
                return false;
            return true;
        });
    }
    simplePatternDetection(history) {
        const patterns = [];
        const errors = history.filter((e) => e.error);
        if (errors.length > history.length * 0.3) {
            patterns.push({
                type: 'high_error_rate',
                description: 'High error rate detected',
                frequency: errors.length,
                confidence: 0.7,
                systems: ['general'],
            });
        }
        return patterns;
    }
}
export default DSPyIntegrationManager;
//# sourceMappingURL=dspy-integration-manager.js.map