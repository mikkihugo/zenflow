/**
 * DSPy Integration Manager.
 *
 * Central coordination point for all DSPy-powered systems:
 * - Core operations (code analysis, generation, error diagnosis)
 * - Swarm intelligence (agent selection, topology optimization)
 * - MCP tools enhancement (intelligent project tools)
 * - Unified learning and optimization across all DSPy systems.
 */
/**
 * @file Dspy-integration management system.
 */
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
            learningInterval: 600000, // 10 minutes
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
        // Initialize DSPy wrapper
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
        // Initialize core operations system
        this.coreOperations = new DSPyEnhancedOperations(this.dspyWrapper);
        // Initialize swarm intelligence system
        const swarmConfig = {
            enableContinuousLearning: false, // Managed by unified learning
        };
        if (this.config.model !== undefined)
            swarmConfig.model = this.config.model;
        if (this.config.temperature !== undefined)
            swarmConfig.temperature = this.config.temperature;
        this.swarmIntelligence = new DSPySwarmIntelligence(swarmConfig);
        // Initialize MCP tools system
        this.mcpTools = new DSPyEnhancedMCPTools();
    }
    /**
     * Analyze code with DSPy intelligence.
     *
     * @param code
     * @param taskType
     * @param context
     */
    async analyzeCode(code, taskType = 'general', context) {
        const startTime = Date.now();
        try {
            const result = await this.coreOperations.analyzeCode(code, taskType);
            this.recordUnifiedLearning('core', 'code_analysis', {
                code: code.substring(0, 200), // Truncate for storage
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
    /**
     * Generate code with DSPy intelligence.
     *
     * @param requirements
     * @param context
     * @param styleGuide
     */
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
    /**
     * Diagnose errors with DSPy intelligence.
     *
     * @param errorMessage
     * @param codeContext
     * @param filePath
     */
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
    /**
     * Select optimal agents with DSPy intelligence.
     *
     * @param taskRequirements
     * @param availableAgents
     */
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
    /**
     * Optimize swarm topology with DSPy intelligence.
     *
     * @param currentTopology
     * @param taskLoad
     * @param agentPerformance
     * @param communicationPatterns
     */
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
    /**
     * Enhanced MCP tool execution.
     *
     * @param toolName
     * @param parameters
     * @param context
     */
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
    /**
     * Update operation outcome for unified learning.
     *
     * @param system
     * @param operation
     * @param parameters
     * @param success
     * @param actualResult
     */
    updateOperationOutcome(system, operation, parameters, success, actualResult) {
        const entry = this.unifiedLearningHistory.find((e) => e.system === system &&
            e.operation === operation &&
            JSON.stringify(e.input) === JSON.stringify(parameters) &&
            Date.now() - e.timestamp.getTime() < 300000 // Within last 5 minutes
        );
        if (entry) {
            entry.success = success;
            if (actualResult) {
                entry.output.actual_result = actualResult;
            }
            logger.debug(`Updated operation outcome: ${system}.${operation} -> ${success ? 'success' : 'failure'}`);
            // Update specific system outcomes
            switch (system) {
                case 'core':
                    // Core operations handles its own learning
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
    /**
     * Get comprehensive DSPy system statistics.
     */
    async getSystemStats() {
        const coreStats = this.coreOperations.getProgramStats();
        const swarmStats = this.swarmIntelligence.getIntelligenceStats();
        const mcpStats = this.mcpTools.getToolStats();
        const recentHistory = this.unifiedLearningHistory.filter((e) => Date.now() - e.timestamp.getTime() < 3600000 // Last hour
        );
        const overallSuccessRate = recentHistory.length > 0
            ? recentHistory.filter((e) => e.success).length / recentHistory.length
            : 0;
        const learningVelocity = this.calculateLearningVelocity();
        const systemHealth = this.assessSystemHealth(overallSuccessRate, learningVelocity);
        return {
            totalPrograms: coreStats.totalPrograms + swarmStats.totalPrograms + mcpStats.totalTools,
            programsByType: {
                core: coreStats.totalPrograms,
                swarm: swarmStats.totalPrograms,
                mcp: mcpStats.totalTools,
            },
            totalExecutions: this.unifiedLearningHistory.length,
            averageExecutionTime: 0, // Calculate from history if needed
            successRate: overallSuccessRate,
            memoryUsage: 0, // Calculate from wrapper if needed
            performance: {
                coreOperations: {
                    totalPrograms: coreStats.totalPrograms,
                    totalExecutions: coreStats.readyPrograms || 0,
                    successRate: 85, // Placeholder
                    averageExecutionTime: 100, // Placeholder
                },
                swarmIntelligence: {
                    totalPrograms: swarmStats.totalPrograms,
                    totalExecutions: swarmStats.recentDecisions || 0,
                    successRate: swarmStats.successRate || 0,
                    averageExecutionTime: 150, // Placeholder
                },
                mcpTools: {
                    totalPrograms: mcpStats.totalTools || 0,
                    totalExecutions: mcpStats.recentUsage || 0,
                    successRate: mcpStats.successRate || 0,
                    averageExecutionTime: 200, // Placeholder
                },
            },
            unified: {
                totalPrograms: coreStats.totalPrograms + swarmStats.totalPrograms + mcpStats.totalTools,
                totalDecisions: this.unifiedLearningHistory.length,
                overallSuccessRate: Math.round(overallSuccessRate * 100),
                learningVelocity,
                systemHealth,
            },
        };
    }
    /**
     * Get system health report.
     */
    async getHealthReport() {
        const stats = await this.getSystemStats();
        return {
            overall: stats.unified.systemHealth,
            systems: {
                core: stats.performance.coreOperations.totalPrograms > 0 ? 'healthy' : 'degraded',
                swarm: stats.performance.swarmIntelligence.successRate > 70 ? 'healthy' : 'degraded',
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
        // Maintain history size limit
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
            return; // Need minimum examples
        // Analyze cross-system patterns
        const patterns = this.analyzeCrossSystemPatterns(recentHistory);
        // Apply learnings to improve system coordination
        if (patterns.length > 0) {
            await this.applyCrossSystemLearnings(patterns);
            logger.debug(`Applied ${patterns.length} cross-system learning patterns`);
        }
    }
    analyzeCrossSystemPatterns(history) {
        // Simple pattern analysis - in production would be more sophisticated
        const patterns = [];
        // Pattern: Code generation followed by error diagnosis
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
                systems: ['core'],
            });
        }
        // Pattern: Agent selection followed by poor performance
        const poorAgentSelection = history.filter((e, _i) => e.system === 'swarm' && e.operation === 'agent_selection' && e.confidence < 0.6);
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
                        // Could adjust code generation parameters or add more examples
                        logger.debug('Applying code quality improvement pattern');
                        break;
                    case 'agent_selection_improvement':
                        // Could adjust agent selection criteria or weights
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
        // Cross-system insights based on historical patterns
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
        // Simple quality assessment - in production would be more sophisticated
        const lines = code.split('\n').length;
        const comments = (code.match(/\/\//g) || []).length;
        const complexity = Math.min(100, Math.max(0, 100 - lines / 10));
        const documentation = Math.min(100, (comments / lines) * 100 * 10);
        return Math.round((complexity + documentation) / 2);
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
        // Look for patterns across systems
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
        return recent.length; // Simple metric - decisions per hour
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
        return recommendations.length > 0 ? recommendations : ['System operating optimally'];
    }
    calculateSimilarity(str1, str2) {
        // Simple similarity calculation - in production would use more sophisticated methods
        const words1 = str1.toLowerCase().split(/\s+/);
        const words2 = str2.toLowerCase().split(/\s+/);
        const commonWords = words1.filter((word) => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length);
    }
}
export default DSPyIntegrationManager;
