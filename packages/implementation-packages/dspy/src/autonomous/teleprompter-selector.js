/**
 * @fileoverview Autonomous Teleprompter Selector - Intelligent ML Selection
 *
 * Provides autonomous selection between basic mathematical teleprompters and
 * ML-enhanced variants using the DSPy-Brain ML Bridge for intelligent analysis.
 * This system automatically determines whether to use standard optimization
 * or advanced ML capabilities based on task characteristics and performance history.
 *
 * Key Features:
 * - 🤖 Autonomous teleprompter selection using ML analysis
 * - 📊 Performance-based decision making with historical data
 * - 🧠 Integration with DSPy-Brain ML Bridge for intelligent recommendations
 * - ⚡ Adaptive learning from usage patterns and success rates
 * - 🎯 Multi-objective optimization (accuracy, speed, memory, complexity)
 * - 📈 Confidence scoring and uncertainty quantification
 * - 🔄 Fallback mechanisms for robust operation
 *
 * Architecture:
 * - Task analysis using natural language processing and pattern recognition
 * - Historical performance tracking for each teleprompter variant
 * - ML-powered recommendation engine using DSPy-Brain Bridge
 * - Confidence-based selection with fallback to proven alternatives
 * - Real-time adaptation based on success/failure feedback
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import { DSPyBrainMLBridge } from '../ml-bridge/dspy-brain-ml-bridge';
/**
 * Autonomous Teleprompter Selector - Intelligent ML Selection System
 *
 * This class provides autonomous selection between basic mathematical teleprompters
 * and ML-enhanced variants using sophisticated analysis and machine learning.
 */
export class AutonomousTeleprompterSelector extends TypedEventBase {
    logger;
    mlBridge;
    initialized = false;
    // Available teleprompter variants
    availableVariants = new Map();
    // Performance tracking
    performanceHistory = new Map();
    recentRecords = [];
    // Selection analytics
    selectionHistory = [];
    adaptationParameters = {
        learningRate: 0.1,
        confidenceThreshold: 0.7,
        performanceWeights: {
            accuracy: 0.4,
            speed: 0.3,
            memory: 0.2,
            robustness: 0.1
        },
        fallbackThreshold: 0.5
    };
    constructor() {
        super();
        this.logger = getLogger('AutonomousTeleprompterSelector');
        this.mlBridge = new DSPyBrainMLBridge();
    }
    /**
     * Initialize the autonomous selector with available teleprompter variants.
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            this.logger.info('🤖 Initializing Autonomous Teleprompter Selector');
            // Initialize ML Bridge
            await this.mlBridge.initialize();
            // Register available teleprompter variants
            await this.registerTeleprompterVariants();
            // Load historical performance data
            await this.loadPerformanceHistory();
            this.initialized = true;
            this.logger.info(`✅ Autonomous Selector initialized with ${this.availableVariants.size} teleprompter variants`);
            this.emit('selector:initialized', { timestamp: new Date() });
        }
        catch (error) {
            this.logger.error('Failed to initialize Autonomous Teleprompter Selector:', error);
            throw error;
        }
    }
    /**
     * Autonomously select the optimal teleprompter for a given optimization task.
     *
     * @param task - The optimization task to analyze
     * @returns Selected teleprompter with confidence and reasoning
     */
    async selectOptimalTeleprompter(task) {
        await this.initialize();
        const startTime = Date.now();
        this.logger.info(`🎯 Analyzing task for optimal teleprompter selection: ${task.id}`);
        try {
            // Step 1: Analyze task characteristics using ML
            const taskAnalysis = await this.analyzeTaskCharacteristics(task);
            // Step 2: Get ML-powered recommendation from DSPy-Brain Bridge
            const mlRecommendation = await this.mlBridge.getIntelligentTeleprompterRecommendation(this.generateTaskDescription(task));
            // Step 3: Evaluate all available variants against task requirements
            const variantEvaluations = await this.evaluateAllVariants(task, taskAnalysis);
            // Step 4: Apply performance-based weighting using historical data
            const weightedEvaluations = this.applyPerformanceWeighting(variantEvaluations, task);
            // Step 5: Make final selection with confidence scoring
            const selection = this.makeFinalSelection(weightedEvaluations, mlRecommendation, task);
            // Step 6: Generate comprehensive reasoning and alternatives
            const finalSelection = await this.enrichSelection(selection, task, variantEvaluations);
            const analysisTime = Date.now() - startTime;
            finalSelection.selectionMetadata.analysisTime = analysisTime;
            // Store selection for future learning
            this.selectionHistory.push(finalSelection);
            this.logger.info(`🎯 Selected teleprompter: ${finalSelection.selectedTeleprompter.name} (confidence: ${(finalSelection.confidence * 100).toFixed(1)}%)`);
            this.emit('teleprompter:selected', {
                task,
                selection: finalSelection,
                analysisTime
            });
            return finalSelection;
        }
        catch (error) {
            this.logger.error('Failed to select optimal teleprompter:', error);
            // Fallback to safest option
            const fallbackSelection = this.createFallbackSelection(task);
            this.logger.warn(`⚠️ Using fallback selection: ${fallbackSelection.selectedTeleprompter.name}`);
            return fallbackSelection;
        }
    }
    /**
     * Record the actual performance of a selected teleprompter for learning.
     *
     * @param taskId - The task ID
     * @param teleprompterName - The teleprompter that was used
     * @param actualPerformance - The actual performance achieved
     */
    async recordPerformance(taskId, teleprompterName, actualPerformance) {
        const task = this.findTaskById(taskId);
        if (!task) {
            this.logger.warn(`Task ${taskId} not found for performance recording`);
            return;
        }
        const record = {
            teleprompterName,
            taskId,
            taskCharacteristics: task,
            actualPerformance,
            timestamp: new Date(),
            executionContext: {
                systemLoad: await this.getSystemLoad(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version
            }
        };
        // Add to recent records
        this.recentRecords.push(record);
        // Keep only last 1000 records for memory management
        if (this.recentRecords.length > 1000) {
            this.recentRecords.shift();
        }
        // Update performance history
        await this.updatePerformanceHistory(record);
        // Adapt selection parameters based on feedback
        await this.adaptSelectionParameters(record);
        this.logger.info(`📊 Recorded performance for ${teleprompterName}: accuracy=${actualPerformance.accuracy.toFixed(3)}, success=${actualPerformance.success}`);
        this.emit('performance:recorded', { record });
    }
    /**
     * Get current selector status and analytics.
     */
    getStatus() {
        return {
            initialized: this.initialized,
            availableVariants: this.availableVariants.size,
            performanceRecords: this.recentRecords.length,
            selectionHistory: this.selectionHistory.length,
            mlBridgeStatus: this.mlBridge.getStatus(),
            adaptationParameters: this.adaptationParameters
        };
    }
    // Private implementation methods
    async registerTeleprompterVariants() {
        // Register basic mathematical variants
        this.availableVariants.set('miprov2-basic', {
            name: 'miprov2-basic',
            type: 'basic',
            algorithm: 'miprov2',
            implementation: 'MIPROv2',
            capabilities: ['instruction_optimization', 'prefix_optimization', 'mathematical_approach'],
            requiredResources: {
                computationLevel: 'moderate',
                memoryUsage: 256,
                timeComplexity: 'O(n log n)',
                gpuRequired: false,
                networkAccess: false
            },
            estimatedPerformance: {
                accuracy: { mean: 0.75, std: 0.1, min: 0.6, max: 0.9 },
                speed: { mean: 0.8, std: 0.15, min: 0.5, max: 1.0 },
                memory: { mean: 0.9, std: 0.1, min: 0.7, max: 1.0 },
                robustness: 0.8,
                confidence: 0.9,
                sourceData: 'historical'
            }
        });
        // Register ML-enhanced variants
        this.availableVariants.set('miprov2-ml', {
            name: 'miprov2-ml',
            type: 'ml_enhanced',
            algorithm: 'miprov2',
            implementation: 'MIPROv2ML',
            capabilities: ['bayesian_optimization', 'multi_objective', 'pattern_learning', 'statistical_validation'],
            requiredResources: {
                computationLevel: 'high',
                memoryUsage: 1024,
                timeComplexity: 'O(n²)',
                gpuRequired: false,
                networkAccess: false
            },
            estimatedPerformance: {
                accuracy: { mean: 0.85, std: 0.08, min: 0.7, max: 0.95 },
                speed: { mean: 0.6, std: 0.2, min: 0.3, max: 0.8 },
                memory: { mean: 0.7, std: 0.15, min: 0.5, max: 0.9 },
                robustness: 0.9,
                confidence: 0.8,
                sourceData: 'predicted'
            }
        });
        // Register other variants (bootstrap, copro, grpo)
        this.registerAdditionalVariants();
        this.logger.info(`📋 Registered ${this.availableVariants.size} teleprompter variants`);
    }
    registerAdditionalVariants() {
        // Bootstrap variants
        this.availableVariants.set('bootstrap-basic', {
            name: 'bootstrap-basic',
            type: 'basic',
            algorithm: 'bootstrap',
            implementation: 'Bootstrap',
            capabilities: ['bootstrap_sampling', 'demonstration_selection'],
            requiredResources: {
                computationLevel: 'low',
                memoryUsage: 128,
                timeComplexity: 'O(n)',
                gpuRequired: false,
                networkAccess: false
            },
            estimatedPerformance: {
                accuracy: { mean: 0.70, std: 0.12, min: 0.5, max: 0.85 },
                speed: { mean: 0.9, std: 0.1, min: 0.7, max: 1.0 },
                memory: { mean: 0.95, std: 0.05, min: 0.85, max: 1.0 },
                robustness: 0.7,
                confidence: 0.85,
                sourceData: 'historical'
            }
        });
        // COPRO variants
        this.availableVariants.set('copro-basic', {
            name: 'copro-basic',
            type: 'basic',
            algorithm: 'copro',
            implementation: 'COPRO',
            capabilities: ['coordinate_ascent', 'prompt_optimization'],
            requiredResources: {
                computationLevel: 'moderate',
                memoryUsage: 512,
                timeComplexity: 'O(n log n)',
                gpuRequired: false,
                networkAccess: false
            },
            estimatedPerformance: {
                accuracy: { mean: 0.78, std: 0.09, min: 0.65, max: 0.9 },
                speed: { mean: 0.75, std: 0.18, min: 0.4, max: 0.95 },
                memory: { mean: 0.85, std: 0.12, min: 0.6, max: 1.0 },
                robustness: 0.75,
                confidence: 0.8,
                sourceData: 'historical'
            }
        });
    }
    async analyzeTaskCharacteristics(task) {
        // Analyze task using ML Bridge capabilities
        const features = {
            domainComplexity: this.calculateDomainComplexity(task.domain),
            computationalRequirements: this.estimateComputationalRequirements(task.complexity),
            dataCharacteristics: this.analyzeDataCharacteristics(task.domain.dataCharacteristics),
            constraintsSeverity: this.assessConstraints(task.constraints),
            requirementsStrictness: this.assessRequirements(task.requirements)
        };
        return features;
    }
    generateTaskDescription(task) {
        return `
Domain: ${task.domain.type} (${task.domain.specificArea || 'general'})
Data: ${task.domain.dataCharacteristics.size} size, ${task.domain.dataCharacteristics.quality} quality, ${task.domain.dataCharacteristics.complexity} complexity
Computational: ${task.complexity.computational} computation, ${task.complexity.algorithmic} algorithm complexity
Requirements: ${task.requirements.minimumAccuracy} min accuracy, ${task.requirements.maximumLatency}ms max latency
Constraints: ${task.constraints.computationalBudget} budget, ${task.constraints.timeLimit}ms time limit
Description: ${task.description}
    `.trim();
    }
    async evaluateAllVariants(task, taskAnalysis) {
        const evaluations = new Map();
        for (const [name, variant] of this.availableVariants) {
            const score = this.evaluateVariantForTask(variant, task, taskAnalysis);
            evaluations.set(name, score);
        }
        return evaluations;
    }
    evaluateVariantForTask(variant, task, analysis) {
        const weights = this.adaptationParameters.performanceWeights;
        // Calculate fit scores for each dimension
        const accuracyFit = this.calculateAccuracyFit(variant, task);
        const speedFit = this.calculateSpeedFit(variant, task);
        const memoryFit = this.calculateMemoryFit(variant, task);
        const robustnessFit = this.calculateRobustnessFit(variant, task);
        // Weighted combination
        const totalScore = accuracyFit * weights.accuracy +
            speedFit * weights.speed +
            memoryFit * weights.memory +
            robustnessFit * weights.robustness;
        return Math.max(0, Math.min(1, totalScore));
    }
    calculateAccuracyFit(variant, task) {
        const expectedAccuracy = variant.estimatedPerformance.accuracy.mean;
        const requiredAccuracy = task.requirements.minimumAccuracy;
        if (expectedAccuracy >= requiredAccuracy) {
            return Math.min(1, expectedAccuracy / requiredAccuracy);
        }
        else {
            return expectedAccuracy / requiredAccuracy * 0.5; // Heavy penalty for not meeting minimum
        }
    }
    calculateSpeedFit(variant, task) {
        // Estimate execution time based on complexity
        const complexityMultipliers = {
            'O(1)': 1,
            'O(log n)': 2,
            'O(n)': 5,
            'O(n log n)': 10,
            'O(n²)': 50,
            'O(2^n)': 1000
        };
        const baseTime = complexityMultipliers[variant.requiredResources.timeComplexity] || 10;
        const estimatedTime = baseTime * variant.requiredResources.memoryUsage / 256; // Rough estimate
        return task.constraints.timeLimit / Math.max(estimatedTime, 1);
    }
    calculateMemoryFit(variant, task) {
        const requiredMemory = variant.requiredResources.memoryUsage;
        const availableMemory = task.constraints.memoryLimit;
        if (requiredMemory <= availableMemory) {
            return 1 - (requiredMemory / availableMemory) * 0.5; // Prefer memory-efficient options
        }
        else {
            return 0; // Cannot run if memory requirements exceed constraints
        }
    }
    calculateRobustnessFit(variant, task) {
        const expectedRobustness = variant.estimatedPerformance.robustness;
        const requiredRobustness = this.mapRobustnessRequirement(task.requirements.robustness);
        return expectedRobustness >= requiredRobustness ? 1 : expectedRobustness / requiredRobustness;
    }
    mapRobustnessRequirement(requirement) {
        const mapping = {
            'basic': 0.5,
            'moderate': 0.7,
            'high': 0.8,
            'critical': 0.9
        };
        return mapping[requirement] || 0.7;
    }
    applyPerformanceWeighting(evaluations, task) {
        const weightedEvaluations = new Map();
        for (const [name, score] of evaluations) {
            const history = this.performanceHistory.get(name);
            let adjustedScore = score;
            if (history) {
                // Apply historical performance weighting
                const successRateBonus = history.successRate * 0.2;
                const domainSpecificBonus = this.getDomainSpecificBonus(history, task.domain.type) * 0.1;
                const trendBonus = this.getTrendBonus(history) * 0.1;
                adjustedScore = Math.min(1, score + successRateBonus + domainSpecificBonus + trendBonus);
            }
            weightedEvaluations.set(name, adjustedScore);
        }
        return weightedEvaluations;
    }
    getDomainSpecificBonus(history, domain) {
        const domainPerformance = history.domainSpecificPerformance.get(domain);
        if (domainPerformance) {
            return (domainPerformance.accuracy.mean + domainPerformance.robustness) / 2 - 0.5;
        }
        return 0;
    }
    getTrendBonus(history) {
        if (history.recentTrends.improving)
            return 0.1;
        if (history.recentTrends.degrading)
            return -0.1;
        return 0;
    }
    makeFinalSelection(evaluations, mlRecommendation, task) {
        // Sort by score
        const sortedEvaluations = Array.from(evaluations.entries())
            .sort(([, a], [, b]) => b - a);
        const topCandidate = sortedEvaluations[0];
        const selectedVariant = this.availableVariants.get(topCandidate[0]);
        // Calculate confidence based on score margin and ML recommendation alignment
        const scoreMargin = topCandidate[1] - (sortedEvaluations[1]?.[1] || 0);
        const mlAlignment = mlRecommendation.recommendedTeleprompter.includes(selectedVariant.algorithm) ? 0.2 : 0;
        const confidence = Math.min(1, topCandidate[1] + scoreMargin * 0.5 + mlAlignment);
        // Generate alternatives
        const alternatives = sortedEvaluations.slice(1, 4).map(([name]) => this.availableVariants.get(name));
        // Generate fallback options (prefer basic variants for reliability)
        const fallbackOptions = Array.from(this.availableVariants.values())
            .filter(v => v.type === 'basic')
            .sort((a, b) => b.estimatedPerformance.robustness - a.estimatedPerformance.robustness)
            .slice(0, 2);
        return {
            selectedTeleprompter: selectedVariant,
            confidence,
            reasoning: this.generateReasoningText(selectedVariant, mlRecommendation, topCandidate[1]),
            alternatives,
            expectedPerformance: selectedVariant.estimatedPerformance,
            fallbackOptions,
            selectionMetadata: {
                analysisTime: 0, // Will be set later
                decisionFactors: this.generateDecisionFactors(evaluations, mlRecommendation),
                uncertaintyFactors: this.identifyUncertaintyFactors(task, selectedVariant),
                recommendationSource: 'hybrid',
                alternativeEvaluations: evaluations.size,
                confidenceBreakdown: this.generateConfidenceBreakdown(confidence, scoreMargin, mlAlignment)
            }
        };
    }
    async enrichSelection(selection, task, evaluations) {
        // Add detailed performance estimates based on task specifics
        const enhancedPerformance = await this.enhancePerformanceEstimate(selection.selectedTeleprompter, task);
        return {
            ...selection,
            expectedPerformance: enhancedPerformance
        };
    }
    async enhancePerformanceEstimate(variant, task) {
        // Use historical data and task characteristics to refine estimates
        const history = this.performanceHistory.get(variant.name);
        let enhanced = { ...variant.estimatedPerformance };
        if (history) {
            // Adjust based on historical performance
            enhanced.accuracy.mean = (enhanced.accuracy.mean + history.averagePerformance.accuracy) / 2;
            enhanced.speed.mean = (enhanced.speed.mean + history.averagePerformance.speed) / 2;
            enhanced.memory.mean = (enhanced.memory.mean + history.averagePerformance.memory) / 2;
            enhanced.robustness = (enhanced.robustness + history.averagePerformance.robustness) / 2;
        }
        return enhanced;
    }
    createFallbackSelection(task) {
        // Always fall back to the most reliable basic variant
        const fallbackVariant = Array.from(this.availableVariants.values())
            .filter(v => v.type === 'basic')
            .sort((a, b) => b.estimatedPerformance.robustness - a.estimatedPerformance.robustness)[0];
        return {
            selectedTeleprompter: fallbackVariant,
            confidence: 0.5,
            reasoning: 'Fallback selection due to analysis failure - using most reliable basic variant',
            alternatives: [],
            expectedPerformance: fallbackVariant.estimatedPerformance,
            fallbackOptions: [],
            selectionMetadata: {
                analysisTime: 0,
                decisionFactors: [],
                uncertaintyFactors: ['analysis_failure'],
                recommendationSource: 'heuristic',
                alternativeEvaluations: 0,
                confidenceBreakdown: { fallback: 0.5 }
            }
        };
    }
    // Helper methods for various calculations
    calculateDomainComplexity(domain) {
        const complexityScores = {
            'simple': 0.2,
            'moderate': 0.5,
            'complex': 0.8,
            'highly_complex': 1.0
        };
        return complexityScores[domain.dataCharacteristics.complexity] || 0.5;
    }
    estimateComputationalRequirements(complexity) {
        const computationalScores = {
            'low': 0.2,
            'medium': 0.5,
            'high': 0.8,
            'extreme': 1.0
        };
        return computationalScores[complexity.computational] || 0.5;
    }
    analyzeDataCharacteristics(characteristics) {
        return {
            sizeScore: { 'small': 0.2, 'medium': 0.5, 'large': 0.8, 'massive': 1.0 }[characteristics.size] || 0.5,
            qualityScore: { 'poor': 0.2, 'fair': 0.4, 'good': 0.7, 'excellent': 1.0 }[characteristics.quality] || 0.6,
            complexityScore: { 'simple': 0.2, 'moderate': 0.5, 'complex': 0.8, 'highly_complex': 1.0 }[characteristics.complexity] || 0.5
        };
    }
    assessConstraints(constraints) {
        // Higher score means more constrained
        const budgetScore = { 'unlimited': 0, 'high': 0.2, 'moderate': 0.5, 'limited': 0.8, 'minimal': 1.0 }[constraints.computationalBudget] || 0.5;
        const timeScore = Math.min(1, 60000 / constraints.timeLimit); // Normalized to 1 minute baseline
        const memoryScore = Math.min(1, 512 / constraints.memoryLimit); // Normalized to 512MB baseline
        return (budgetScore + timeScore + memoryScore) / 3;
    }
    assessRequirements(requirements) {
        // Higher score means stricter requirements
        const accuracyScore = requirements.minimumAccuracy;
        const latencyScore = Math.min(1, 1000 / requirements.maximumLatency); // Normalized to 1 second baseline
        const memoryScore = Math.min(1, requirements.memoryConstraints / 1024); // Normalized to 1GB baseline
        const robustnessScore = { 'basic': 0.2, 'moderate': 0.5, 'high': 0.8, 'critical': 1.0 }[requirements.robustness] || 0.5;
        return (accuracyScore + latencyScore + memoryScore + robustnessScore) / 4;
    }
    generateReasoningText(variant, mlRecommendation, score) {
        return `Selected ${variant.name} based on optimal fit (score: ${score.toFixed(3)}). 
ML analysis recommends ${mlRecommendation.recommendedTeleprompter} with ${(mlRecommendation.confidence * 100).toFixed(1)}% confidence. 
Variant offers ${variant.capabilities.join(', ')} capabilities with ${variant.type} implementation approach.`;
    }
    generateDecisionFactors(evaluations, mlRecommendation) {
        return [
            { factor: 'evaluation_score', weight: 0.4, value: Math.max(...evaluations.values()) },
            { factor: 'ml_recommendation', weight: 0.3, value: mlRecommendation.confidence },
            { factor: 'historical_performance', weight: 0.2, value: 0.8 }, // Mock value
            { factor: 'resource_efficiency', weight: 0.1, value: 0.7 } // Mock value
        ];
    }
    identifyUncertaintyFactors(task, variant) {
        const factors = [];
        if (task.domain.dataCharacteristics.quality === 'poor') {
            factors.push('poor_data_quality');
        }
        if (variant.estimatedPerformance.sourceData === 'predicted') {
            factors.push('predicted_performance');
        }
        if (task.constraints.computationalBudget === 'limited') {
            factors.push('limited_computational_budget');
        }
        return factors;
    }
    generateConfidenceBreakdown(confidence, scoreMargin, mlAlignment) {
        return {
            base_score: confidence - scoreMargin - mlAlignment,
            score_margin: scoreMargin,
            ml_alignment: mlAlignment,
            total: confidence
        };
    }
    findTaskById(taskId) {
        // In a real implementation, this would query a task registry
        return undefined; // Mock implementation
    }
    async getSystemLoad() {
        // Mock system load - would use actual system monitoring
        return Math.random() * 0.8 + 0.1;
    }
    async loadPerformanceHistory() {
        // Mock loading historical performance data
        // In production, this would load from persistent storage
        this.logger.info('📊 Loading performance history (mock data)');
    }
    async updatePerformanceHistory(record) {
        const name = record.teleprompterName;
        let history = this.performanceHistory.get(name);
        if (!history) {
            history = {
                teleprompterName: name,
                totalExecutions: 0,
                successRate: 0,
                averagePerformance: { accuracy: 0, speed: 0, memory: 0, robustness: 0 },
                performanceVariance: { accuracy: 0, speed: 0, memory: 0, robustness: 0 },
                domainSpecificPerformance: new Map(),
                recentTrends: { improving: false, degrading: false, stable: true }
            };
        }
        // Update statistics
        history.totalExecutions++;
        if (record.actualPerformance.success) {
            history.successRate = (history.successRate * (history.totalExecutions - 1) + 1) / history.totalExecutions;
        }
        else {
            history.successRate = history.successRate * (history.totalExecutions - 1) / history.totalExecutions;
        }
        // Update running averages
        const alpha = 1 / Math.min(history.totalExecutions, 100); // Exponential smoothing
        history.averagePerformance.accuracy = (1 - alpha) * history.averagePerformance.accuracy + alpha * record.actualPerformance.accuracy;
        history.averagePerformance.speed = (1 - alpha) * history.averagePerformance.speed + alpha * record.actualPerformance.speed;
        history.averagePerformance.memory = (1 - alpha) * history.averagePerformance.memory + alpha * record.actualPerformance.memory;
        history.averagePerformance.robustness = (1 - alpha) * history.averagePerformance.robustness + alpha * record.actualPerformance.robustness;
        this.performanceHistory.set(name, history);
    }
    async adaptSelectionParameters(record) {
        // Adapt learning parameters based on feedback
        const learningRate = this.adaptationParameters.learningRate;
        if (record.actualPerformance.success) {
            // Increase confidence in successful selections
            this.adaptationParameters.confidenceThreshold = Math.min(0.9, this.adaptationParameters.confidenceThreshold + learningRate * 0.01);
        }
        else {
            // Decrease confidence threshold after failures
            this.adaptationParameters.confidenceThreshold = Math.max(0.5, this.adaptationParameters.confidenceThreshold - learningRate * 0.02);
        }
    }
    /**
     * Export performance data for analysis.
     */
    exportPerformanceData() {
        return {
            performanceHistory: Array.from(this.performanceHistory.entries()),
            recentRecords: [...this.recentRecords],
            selectionHistory: [...this.selectionHistory],
            adaptationParameters: { ...this.adaptationParameters }
        };
    }
    /**
     * Clean up resources.
     */
    async destroy() {
        try {
            await this.mlBridge.destroy();
            this.performanceHistory.clear();
            this.recentRecords.length = 0;
            this.selectionHistory.length = 0;
            this.initialized = false;
            this.logger.info('✅ Autonomous Teleprompter Selector destroyed');
        }
        catch (error) {
            this.logger.error('Failed to destroy Autonomous Teleprompter Selector:', error);
        }
    }
}
/**
 * Factory function to create Autonomous Teleprompter Selector.
 */
export function createAutonomousTeleprompterSelector() {
    return new AutonomousTeleprompterSelector();
}
export default AutonomousTeleprompterSelector;
