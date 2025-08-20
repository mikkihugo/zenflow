/**
 * @fileoverview Autonomous Optimization Engine
 *
 * Intelligent system that automatically chooses the best optimization approach
 * (DSPy vs Smart ML vs Hybrid) based on context, performance history, and
 * continuous learning. Makes autonomous decisions to maximize effectiveness.
 *
 * Features:
 * - Automatic method selection based on performance history
 * - Continuous learning from optimization results
 * - Dynamic switching between DSPy, ML, and hybrid approaches
 * - Performance-driven decision making
 * - Real-time adaptation to changing patterns
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
import { getLogger } from '@claude-zen/foundation';
import { ema } from 'moving-averages';
import * as ss from 'simple-statistics';
import { SmartPromptOptimizer } from './smart-prompt-optimizer';
import { TaskComplexityEstimator } from './task-complexity-estimator';
const logger = getLogger('AutonomousOptimizationEngine');
/**
 * Autonomous Optimization Engine
 *
 * Intelligently decides which optimization method to use based on:
 * - Historical performance of each method
 * - Context of the current request
 * - Time constraints and priorities
 * - Continuous learning from results
 */
export class AutonomousOptimizationEngine {
    dspyBridge = null;
    smartOptimizer = null;
    complexityEstimator = null;
    initialized = false;
    // Performance tracking for each method
    methodPerformance = new Map();
    optimizationHistory = [];
    // Learning parameters
    learningRate = 0.1;
    adaptationThreshold = 0.15; // Switch methods if performance diff > 15%
    minDataPoints = 5; // Minimum data before making autonomous decisions
    constructor() {
        logger.info('🤖 Autonomous Optimization Engine created');
    }
    /**
     * Initialize the autonomous engine
     */
    async initialize(dspyBridge) {
        if (this.initialized)
            return;
        try {
            logger.info('🚀 Initializing Autonomous Optimization Engine...');
            this.dspyBridge = dspyBridge || null;
            // Initialize Smart ML Optimizer
            this.smartOptimizer = new SmartPromptOptimizer();
            await this.smartOptimizer.initialize();
            // Initialize Task Complexity Estimator
            this.complexityEstimator = new TaskComplexityEstimator();
            await this.complexityEstimator.initialize();
            // Initialize method performance tracking
            this.initializeMethodPerformance();
            this.initialized = true;
            logger.info('✅ Autonomous Optimization Engine initialized successfully');
        }
        catch (error) {
            logger.error('❌ Failed to initialize Autonomous Optimization Engine:', error);
            throw error;
        }
    }
    /**
     * Autonomously optimize prompt using the best method for the context
     */
    async autonomousOptimize(context) {
        if (!this.initialized) {
            throw new Error('Autonomous Optimization Engine not initialized');
        }
        const startTime = Date.now();
        try {
            logger.info(`🤖 Autonomous optimization for: "${context.task}"`);
            // 1. Estimate task complexity automatically
            let complexityEstimate = null;
            if (this.complexityEstimator) {
                try {
                    complexityEstimate = await this.complexityEstimator.estimateComplexity(context.task, context.basePrompt, context.context || {}, context.agentRole);
                    // Update context with complexity estimate
                    context = {
                        ...context,
                        expectedComplexity: complexityEstimate.estimatedComplexity
                    };
                    logger.info(`🎯 Task complexity estimated: ${(complexityEstimate.estimatedComplexity * 100).toFixed(1)}% (${complexityEstimate.difficultyLevel})`);
                }
                catch (error) {
                    logger.debug('Complexity estimation failed:', error);
                }
            }
            // 2. Analyze context and decide best approach (enhanced with complexity)
            const selectedMethod = await this.selectOptimalMethod(context, complexityEstimate);
            logger.info(`🎯 Autonomous decision: Using ${selectedMethod} method`);
            // 3. Execute optimization using selected method
            const result = await this.executeOptimization(context, selectedMethod);
            // 4. Record the optimization for learning
            await this.recordOptimization(context, result);
            // 5. Update method performance metrics
            await this.updateMethodPerformance(selectedMethod, result, startTime);
            // 6. Learn from complexity estimation if available
            if (this.complexityEstimator && complexityEstimate) {
                try {
                    // Provide feedback to complexity estimator for continuous learning
                    const actualComplexity = this.inferActualComplexity(result, context);
                    await this.complexityEstimator.learnFromOutcome(context.task, context.basePrompt, context.context || {}, actualComplexity, result.processingTime, result.confidence > 0.7, // Success indicator
                    context.agentRole);
                }
                catch (error) {
                    logger.debug('Complexity learning failed:', error);
                }
            }
            logger.info(`✅ Autonomous optimization complete: ${selectedMethod} method, confidence ${result.confidence.toFixed(2)}`);
            return result;
        }
        catch (error) {
            logger.error('❌ Autonomous optimization failed:', error);
            // Fallback to simple optimization
            return {
                optimizedPrompt: context.basePrompt,
                confidence: 0.3,
                method: 'fallback',
                processingTime: Date.now() - startTime,
                improvementScore: 1.0,
                reasoning: ['Autonomous optimization failed, using fallback']
            };
        }
    }
    /**
     * Learn from optimization results to improve future decisions
     */
    async learnFromFeedback(context, result, feedback) {
        try {
            logger.debug(`📚 Learning from feedback: ${result.method} method, success rate ${feedback.actualSuccessRate.toFixed(2)}`);
            // Find the optimization record
            const optimizationRecord = this.optimizationHistory.find(record => record.context.task === context.task &&
                record.result.method === result.method &&
                Math.abs(record.timestamp - Date.now()) < 3600000 // Within last hour
            );
            if (optimizationRecord) {
                optimizationRecord.feedback = feedback;
            }
            // Update method performance based on actual results
            await this.updateMethodPerformanceFromFeedback(result.method, feedback);
            // Analyze if we should adjust our method selection strategy
            await this.adaptSelectionStrategy();
            logger.debug(`🎯 Method performance updated for ${result.method}`);
        }
        catch (error) {
            logger.error('❌ Failed to learn from feedback:', error);
        }
    }
    /**
     * Record optimization result for continuous learning
     */
    async recordOptimizationResult(result) {
        try {
            logger.debug(`📊 Recording optimization result for continuous learning`);
            // Convert to feedback format and learn from it
            const feedback = {
                actualSuccessRate: result.actualSuccessRate,
                actualResponseTime: result.actualDuration,
                userSatisfaction: result.actualPerformance,
                taskCompleted: result.actualSuccessRate > 0.5,
                errorOccurred: result.actualSuccessRate < 0.3
            };
            // Find recent optimization to learn from
            const recentOptimization = this.optimizationHistory.find(opt => opt.context.task === result.context.task &&
                Math.abs(opt.timestamp - Date.now()) < 3600000 // Within last hour
            );
            if (recentOptimization) {
                await this.learnFromFeedback(result.context, recentOptimization.result, feedback);
            }
            logger.debug(`✅ Optimization result recorded and learned from`);
        }
        catch (error) {
            logger.error('❌ Failed to record optimization result:', error);
        }
    }
    /**
     * Enable continuous optimization learning
     */
    async enableContinuousOptimization(config) {
        try {
            logger.info(`🔄 Enabling continuous optimization with config:`, config);
            // Update learning parameters
            if (config.learningRate) {
                // Store in private field (we'll need to make learningRate mutable)
                Object.defineProperty(this, 'learningRate', {
                    value: config.learningRate,
                    writable: true
                });
            }
            if (config.adaptationThreshold) {
                Object.defineProperty(this, 'adaptationThreshold', {
                    value: config.adaptationThreshold,
                    writable: true
                });
            }
            // Set up evaluation interval if provided
            if (config.evaluationInterval && config.autoTuning) {
                setInterval(async () => {
                    try {
                        await this.adaptSelectionStrategy();
                        logger.debug('🔄 Continuous optimization evaluation completed');
                    }
                    catch (error) {
                        logger.error('❌ Continuous optimization evaluation failed:', error);
                    }
                }, config.evaluationInterval);
            }
            logger.info('✅ Continuous optimization enabled successfully');
        }
        catch (error) {
            logger.error('❌ Failed to enable continuous optimization:', error);
            throw error;
        }
    }
    /**
     * Get autonomous optimization insights
     */
    getAutonomousInsights() {
        const methods = Array.from(this.methodPerformance.entries());
        // Calculate overall score for each method
        const methodScores = methods.map(([method, perf]) => {
            const score = (perf.successRate * 0.4) +
                (perf.improvementFactor * 0.3) +
                (perf.confidence * 0.2) +
                (perf.recentTrend * 0.1);
            const trend = perf.recentTrend > 0.05 ? 'improving' :
                perf.recentTrend < -0.05 ? 'declining' : 'stable';
            return { method, score, trend };
        }).sort((a, b) => b.score - a.score);
        const bestMethod = methodScores.length > 0 ? methodScores[0].method : 'hybrid';
        // Calculate adaptation rate (how often we switch methods)
        const recentOptimizations = this.optimizationHistory.slice(-20);
        const methodSwitches = recentOptimizations.reduce((switches, opt, index) => {
            if (index > 0 && opt.result.method !== recentOptimizations[index - 1].result.method) {
                return switches + 1;
            }
            return switches;
        }, 0);
        const adaptationRate = recentOptimizations.length > 1 ? methodSwitches / (recentOptimizations.length - 1) : 0;
        // Calculate learning effectiveness
        const withFeedback = this.optimizationHistory.filter(opt => opt.feedback).length;
        const learningEffectiveness = this.optimizationHistory.length > 0 ? withFeedback / this.optimizationHistory.length : 0;
        return {
            bestMethod,
            methodRankings: methodScores,
            adaptationRate,
            totalOptimizations: this.optimizationHistory.length,
            learningEffectiveness
        };
    }
    // Private methods for autonomous decision making
    async selectOptimalMethod(context, complexityEstimate) {
        // If we don't have enough data, use complexity estimate guidance
        if (this.optimizationHistory.length < this.minDataPoints) {
            if (complexityEstimate?.suggestedMethod) {
                logger.debug(`🎯 Using complexity-based method suggestion: ${complexityEstimate.suggestedMethod}`);
                return complexityEstimate.suggestedMethod;
            }
            logger.debug('🎯 Insufficient data for autonomous decision, using hybrid approach');
            return 'hybrid';
        }
        // Calculate method scores based on context
        const dspyScore = this.calculateMethodScore('dspy', context);
        const mlScore = this.calculateMethodScore('ml', context);
        const hybridScore = this.calculateMethodScore('hybrid', context);
        logger.debug(`📊 Method scores - DSPy: ${dspyScore.toFixed(2)}, ML: ${mlScore.toFixed(2)}, Hybrid: ${hybridScore.toFixed(2)}`);
        // Select method with highest score
        if (hybridScore >= dspyScore && hybridScore >= mlScore) {
            return 'hybrid';
        }
        else if (dspyScore >= mlScore) {
            return 'dspy';
        }
        else {
            return 'ml';
        }
    }
    calculateMethodScore(method, context) {
        const performance = this.methodPerformance.get(method);
        if (!performance || performance.usageCount < 2) {
            return 0.5; // Default score for insufficient data
        }
        let score = 0;
        // Base performance score
        score += performance.successRate * 0.4;
        score += (performance.improvementFactor - 1) * 0.3; // Improvement over baseline
        score += performance.confidence * 0.2;
        score += Math.max(0, performance.recentTrend) * 0.1; // Bonus for improving trend
        // Context-specific adjustments
        if (context.priority === 'high' && performance.averageTime < 3000) {
            score += 0.1; // Bonus for fast methods in high priority tasks
        }
        if (context.expectedComplexity && context.expectedComplexity > 0.7) {
            // Complex tasks might benefit from DSPy
            if (method === 'dspy')
                score += 0.15;
            if (method === 'hybrid')
                score += 0.1;
        }
        if (context.timeConstraint && context.timeConstraint < 2000) {
            // Time-constrained tasks favor ML
            if (method === 'ml')
                score += 0.2;
            if (method === 'hybrid')
                score += 0.1;
        }
        return Math.max(0, Math.min(1, score));
    }
    async executeOptimization(context, method) {
        const startTime = Date.now();
        switch (method) {
            case 'dspy':
                return await this.executeDSPyOptimization(context, startTime);
            case 'ml':
                return await this.executeMLOptimization(context, startTime);
            case 'hybrid':
                return await this.executeHybridOptimization(context, startTime);
            default:
                throw new Error(`Unknown optimization method: ${method}`);
        }
    }
    async executeDSPyOptimization(context, startTime) {
        if (!this.dspyBridge) {
            throw new Error('DSPy bridge not available');
        }
        const coordinationTask = {
            id: `auto-dspy-${Date.now()}`,
            type: 'generation',
            input: `Optimize this prompt: ${context.basePrompt}`,
            context: {
                ...context.context,
                originalPrompt: context.basePrompt,
                taskType: context.task,
                agentRole: context.agentRole
            },
            priority: context.priority || 'medium'
        };
        const result = await this.dspyBridge.processCoordinationTask(coordinationTask, {
            teleprompter: 'MIPROv2',
            hybridMode: false, // Pure DSPy
            optimizationSteps: context.priority === 'high' ? 3 : 2
        });
        return {
            optimizedPrompt: String(result.result || context.basePrompt),
            confidence: result.confidence,
            method: 'dspy',
            processingTime: Date.now() - startTime,
            improvementScore: result.confidence * 1.2, // DSPy typically provides good improvements
            reasoning: [`DSPy optimization with ${coordinationTask.priority} priority`, `Confidence: ${result.confidence.toFixed(2)}`]
        };
    }
    async executeMLOptimization(context, startTime) {
        if (!this.smartOptimizer) {
            throw new Error('Smart ML optimizer not available');
        }
        const result = await this.smartOptimizer.optimizePrompt(context.basePrompt, {
            taskComplexity: context.expectedComplexity,
            agentType: context.agentRole,
            expectedResponseTime: context.timeConstraint,
            domainSpecific: false
        });
        return {
            optimizedPrompt: result.optimizedPrompt,
            confidence: result.confidence,
            method: 'ml',
            processingTime: Date.now() - startTime,
            improvementScore: result.improvementFactor,
            reasoning: [`ML optimization applied ${result.appliedPatterns.length} patterns`, ...result.reasoning]
        };
    }
    async executeHybridOptimization(context, startTime) {
        // Hybrid: Start with fast ML optimization, then enhance with DSPy if needed
        // Step 1: Quick ML optimization
        const mlResult = await this.executeMLOptimization(context, startTime);
        // Step 2: If ML confidence is low and we have time, enhance with DSPy
        if (mlResult.confidence < 0.7 && (!context.timeConstraint || (Date.now() - startTime) < context.timeConstraint * 0.5) && this.dspyBridge) {
            try {
                // Use ML-optimized prompt as input to DSPy
                const enhancedContext = { ...context, basePrompt: mlResult.optimizedPrompt };
                const dspyResult = await this.executeDSPyOptimization(enhancedContext, startTime);
                // Combine insights from both methods
                return {
                    optimizedPrompt: dspyResult.optimizedPrompt,
                    confidence: Math.max(mlResult.confidence, dspyResult.confidence),
                    method: 'hybrid',
                    processingTime: Date.now() - startTime,
                    improvementScore: mlResult.improvementScore * dspyResult.improvementScore,
                    reasoning: [
                        'Hybrid optimization: ML + DSPy',
                        ...mlResult.reasoning,
                        ...dspyResult.reasoning
                    ]
                };
            }
            catch (error) {
                logger.debug('DSPy enhancement failed, using ML result:', error);
            }
        }
        // Return ML result if DSPy enhancement wasn't needed or failed
        return {
            ...mlResult,
            method: 'hybrid',
            reasoning: ['Hybrid optimization: ML-only (DSPy not needed)', ...mlResult.reasoning]
        };
    }
    initializeMethodPerformance() {
        // Initialize with baseline performance estimates
        const methods = ['dspy', 'ml', 'hybrid'];
        methods.forEach(method => {
            this.methodPerformance.set(method, {
                successRate: 0.7, // Conservative baseline
                averageTime: 3000, // 3 seconds baseline  
                improvementFactor: 1.1, // 10% improvement baseline
                confidence: 0.5,
                usageCount: 0,
                recentTrend: 0
            });
        });
        logger.debug('📊 Initialized baseline performance for 3 optimization methods');
    }
    async recordOptimization(context, result) {
        this.optimizationHistory.push({
            context,
            result,
            timestamp: Date.now()
        });
        // Keep only recent history (last 500 optimizations)
        if (this.optimizationHistory.length > 500) {
            this.optimizationHistory = this.optimizationHistory.slice(-500);
        }
    }
    async updateMethodPerformance(method, result, startTime) {
        const performance = this.methodPerformance.get(method);
        if (!performance)
            return;
        const actualTime = Date.now() - startTime;
        // Update with exponential moving average for responsiveness
        const alpha = this.learningRate;
        performance.confidence = (1 - alpha) * performance.confidence + alpha * result.confidence;
        performance.averageTime = (1 - alpha) * performance.averageTime + alpha * actualTime;
        performance.improvementFactor = (1 - alpha) * performance.improvementFactor + alpha * result.improvementScore;
        performance.usageCount++;
        this.methodPerformance.set(method, performance);
    }
    async updateMethodPerformanceFromFeedback(method, feedback) {
        const performance = this.methodPerformance.get(method);
        if (!performance)
            return;
        // Update success rate based on actual feedback
        const alpha = this.learningRate;
        performance.successRate = (1 - alpha) * performance.successRate + alpha * feedback.actualSuccessRate;
        // Update recent trend
        const recentSuccessRates = this.optimizationHistory
            .filter(opt => opt.result.method === method && opt.feedback)
            .slice(-10)
            .map(opt => opt.feedback.actualSuccessRate);
        if (recentSuccessRates.length >= 3) {
            const trend = ema(recentSuccessRates, 3);
            const trendSlope = trend[trend.length - 1] - trend[Math.max(0, trend.length - 3)];
            performance.recentTrend = trendSlope;
        }
        this.methodPerformance.set(method, performance);
    }
    async adaptSelectionStrategy() {
        // Analyze if our method selection is working well
        const recentOptimizations = this.optimizationHistory.slice(-20);
        const withFeedback = recentOptimizations.filter(opt => opt.feedback);
        if (withFeedback.length < 5)
            return; // Not enough feedback data
        // Calculate average performance by method
        const methodAverages = new Map();
        withFeedback.forEach(opt => {
            const method = opt.result.method;
            const score = opt.feedback.actualSuccessRate;
            if (!methodAverages.has(method)) {
                methodAverages.set(method, []);
            }
            methodAverages.get(method).push(score);
        });
        // Check if we should adjust our adaptation threshold
        const performanceSpread = Math.max(...Array.from(methodAverages.values()).map(scores => ss.mean(scores))) -
            Math.min(...Array.from(methodAverages.values()).map(scores => ss.mean(scores)));
        if (performanceSpread > this.adaptationThreshold * 2) {
            logger.info('🎯 High performance spread detected - increasing adaptation sensitivity');
        }
        logger.debug('🧠 Adaptation strategy analysis complete');
    }
    /**
     * Infer actual task complexity from optimization results
     */
    inferActualComplexity(result, context) {
        let complexity = 0;
        // Context-aware complexity inference
        const contextComplexity = this.analyzeContextComplexity(context);
        complexity += contextComplexity * 0.2; // Context contributes 20% to complexity
        // Processing time indicates complexity
        const timeComplexity = Math.min(result.processingTime / 10000, 0.4); // Normalize to 0-0.4
        complexity += timeComplexity;
        // Low confidence suggests high complexity
        const confidenceComplexity = (1 - result.confidence) * 0.3;
        complexity += confidenceComplexity;
        // Method used indicates complexity
        const methodComplexity = result.method === 'dspy' ? 0.2 :
            result.method === 'hybrid' ? 0.15 : 0.1;
        complexity += methodComplexity;
        // Improvement score (low improvement suggests high baseline complexity)
        const improvementComplexity = Math.max(0, (2 - result.improvementScore) * 0.1);
        complexity += improvementComplexity;
        return Math.max(0, Math.min(1, complexity));
    }
    /**
     * Analyze context to determine inherent complexity
     */
    analyzeContextComplexity(context) {
        let contextComplexity = 0;
        // Analyze task type complexity from task description
        const task = context.task.toLowerCase();
        const complexTaskTypes = ['coordination', 'multi-agent', 'neural', 'reasoning'];
        if (complexTaskTypes.some(type => task.includes(type))) {
            contextComplexity += 0.3;
        }
        // Domain complexity from context metadata
        const domain = context.context?.domain;
        if (domain) {
            const complexDomains = ['ai', 'ml', 'optimization', 'distributed', 'parallel'];
            if (complexDomains.some(d => domain.toLowerCase().includes(d))) {
                contextComplexity += 0.2;
            }
        }
        // Priority suggests urgency which can indicate complexity  
        if (context.priority === 'high') {
            contextComplexity += 0.1;
        }
        // Agent count indicates coordination complexity from context
        const agentCount = context.context?.agentCount;
        if (agentCount && agentCount > 5) {
            contextComplexity += Math.min(0.2, agentCount * 0.02);
        }
        return Math.max(0, Math.min(1, contextComplexity));
    }
}
export default AutonomousOptimizationEngine;
//# sourceMappingURL=autonomous-optimization-engine.js.map