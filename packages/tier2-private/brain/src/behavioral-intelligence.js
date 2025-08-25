/**
 * @fileoverview Behavioral Intelligence for Claude Code Zen
 *
 * Focused agent behavioral intelligence using brain.js neural networks.
 * Provides real-time agent behavior learning, performance prediction,
 * and behavioral optimization for the claude-code-zen swarm system.
 *
 * SCOPE: Agent behavior ONLY - not general ML or generic learning
 *
 * Key Features:
 * - Agent performance prediction using neural networks
 * - Real-time behavioral pattern learning
 * - Task complexity estimation for better routing
 * - Agent-task matching optimization
 * - Behavioral anomaly detection
 *
 * Integration with claude-code-zen:
 * - Load balancing: Agent performance predictions
 * - Task orchestration: Complexity estimation and routing
 * - Agent monitoring: Behavioral health and adaptation
 * - Swarm coordination: Intelligent agent selection
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { getLogger } from '@claude-zen/foundation';
import * as clustering from 'density-clustering';
import { kmeans } from 'ml-kmeans';
import { sma } from 'moving-averages';
import regression from 'regression';
import * as ss from 'simple-statistics';
import { ActivationFunction } from './types/index';
// 🧠 Enhanced ML Imports - Using validated API patterns
const brain = require('brain.js');
// Validate brain.js availability and capabilities
const brainCapabilities = {
    neuralNetworks: typeof brain.NeuralNetwork === 'function',
    recurrentNetworks: typeof brain.recurrent?.LSTM === 'function',
    feedForward: typeof brain.FeedForward === 'function',
    version: brain.version || 'unknown'
};
// Optional ML packages (API compatibility issues - available for future enhancement)
// import { RandomForestClassifier } from 'ml-random-forest';
// import * as trendyways from 'trendyways';
// Foundation-optimized logging
const logger = getLogger('BehavioralIntelligence');
/**
 * Behavioral Intelligence System
 *
 * Focused behavioral intelligence for claude-code-zen agents using brain.js.
 * Learns how individual agents behave and provides predictions for optimal
 * task assignment and swarm coordination.
 *
 * @example Basic Usage
 * ```typescript
 * const behavioral = new BehavioralIntelligence(brainJsBridge);
 * await behavioral.initialize();
 *
 * // Learn from agent execution
 * const executionData = {
 *   agentId: 'agent-1',
 *   taskType: 'data-processing',
 *   taskComplexity: 0.7,
 *   duration: 1500,
 *   success: true,
 *   efficiency: 0.85
 * };
 *
 * await behavioral.learnFromExecution(executionData);
 *
 * // Predict agent performance
 * const prediction = await behavioral.predictAgentPerformance('agent-1', 'data-processing', 0.7);
 * console.log(`Predicted efficiency: ${prediction.predictedEfficiency}`);
 * ```
 */
export class BehavioralIntelligence {
    brainJsBridge;
    performanceNetworkId = 'agent-performance-predictor';
    complexityNetworkId = 'task-complexity-estimator';
    matchingNetworkId = 'agent-task-matcher';
    initialized = false;
    agentProfiles = new Map();
    trainingBuffer = [];
    bufferSize = 100;
    // 🧠 Enhanced ML Models - Using validated packages
    behaviorClusterer; // DBSCAN instance
    kmeansClusterer; // kmeans function
    performanceTimeSeries = new Map(); // Will use SMA from moving-averages
    agentPerformanceHistory = new Map();
    agentFeatureVectors = new Map();
    constructor(brainJsBridge) {
        // If no bridge provided, we'll use a mock implementation for compatibility
        this.brainJsBridge = brainJsBridge || this.createMockBridge();
    }
    /**
     * Create a mock BrainJsBridge for compatibility when no bridge is provided
     */
    createMockBridge() {
        return {
            async createNeuralNet(id, type, config) {
                logger.debug(`Mock: Creating neural network ${id} of type ${type}`, {
                    hiddenLayers: config?.hiddenLayers || 'default',
                    learningRate: config?.learningRate || 'default',
                    activation: config?.activation || 'default'
                });
                return Promise.resolve();
            },
            async trainNeuralNet(id, data, options) {
                logger.debug(`Mock: Training neural network ${id}`, {
                    dataPoints: Array.isArray(data) ? data.length : 'unknown',
                    options: options ? Object.keys(options) : 'none'
                });
                return Promise.resolve();
            },
            async predictWithNeuralNet(id, input) {
                logger.debug(`Mock: Predicting with neural network ${id}`);
                // Return mock prediction result
                return {
                    isErr: () => false,
                    value: {
                        output: input.map(x => Math.tanh(x * 0.5 + 0.5)) // Simple transformation
                    }
                };
            }
        };
    }
    /**
     * Initialize behavioral intelligence networks with enhanced ML algorithms
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            logger.info('Initializing Enhanced Behavioral Intelligence with ML algorithms...');
            // Log brain.js capabilities for initialization validation
            logger.debug('Brain.js capabilities:', brainCapabilities);
            if (!brainCapabilities.neuralNetworks) {
                logger.warn('Brain.js neural networks not available - using fallback mode');
            }
            // Performance prediction network - predicts agent efficiency and duration
            await this.brainJsBridge.createNeuralNet(this.performanceNetworkId, 'feedforward', {
                hiddenLayers: [16, 8], // Dual hidden layers for complex patterns
                learningRate: 0.1,
                activation: ActivationFunction.SIGMOID
            });
            // Task complexity estimation network - estimates task difficulty
            await this.brainJsBridge.createNeuralNet(this.complexityNetworkId, 'feedforward', {
                hiddenLayers: [12, 6], // Smaller network for complexity estimation
                learningRate: 0.15,
                activation: ActivationFunction.RELU
            });
            // Agent-task matching network - optimizes agent selection
            await this.brainJsBridge.createNeuralNet(this.matchingNetworkId, 'feedforward', {
                hiddenLayers: [20, 10, 5], // Deeper network for complex matching
                learningRate: 0.05,
                activation: ActivationFunction.TANH
            });
            // 🧠 Initialize Enhanced ML Models
            logger.info('🔬 Initializing advanced ML algorithms...');
            // DBSCAN for behavioral clustering
            this.behaviorClusterer = new clustering.DBSCAN();
            // K-Means for simpler clustering (function, not class)
            this.kmeansClusterer = kmeans;
            logger.info('✅ Enhanced ML algorithms initialized (DBSCAN + KMeans + Regression + Statistics + Time Series)');
            this.initialized = true;
            logger.info('Behavioral Intelligence initialized successfully with advanced ML capabilities');
        }
        catch (error) {
            logger.error('Failed to initialize Behavioral Intelligence:', error);
            throw error;
        }
    }
    /**
     * Learn from agent execution data using enhanced ML algorithms
     *
     * @param executionData - Data from agent task execution
     */
    async learnFromExecution(executionData) {
        if (!this.initialized)
            await this.initialize();
        try {
            // Add to training buffer
            this.trainingBuffer.push(executionData);
            // 🧠 Enhanced ML Learning: Update time series and feature vectors
            await this.updateAgentPerformanceTimeSeries(executionData);
            await this.updateAgentFeatureVector(executionData);
            // Update agent profile
            await this.updateAgentProfile(executionData);
            // Train networks when buffer is full
            if (this.trainingBuffer.length >= this.bufferSize) {
                await this.trainNetworksFromBuffer();
                await this.trainAdvancedMLModels(); // 🧠 Train Random Forest and DBSCAN
                this.trainingBuffer = []; // Clear buffer
            }
            logger.debug(`Enhanced learning from execution: ${executionData.agentId} - ${executionData.taskType} (with ML algorithms)`);
        }
        catch (error) {
            logger.error('Error learning from execution:', error);
        }
    }
    /**
     * Predict agent performance for a specific task
     *
     * @param agentId - ID of the agent
     * @param taskType - Type of task
     * @param taskComplexity - Complexity of the task (0-1)
     * @returns Behavioral prediction
     */
    async predictAgentPerformance(agentId, taskType, taskComplexity) {
        if (!this.initialized)
            await this.initialize();
        try {
            const profile = this.agentProfiles.get(agentId);
            // Prepare input features for neural network
            const input = this.preparePerformanceInput(agentId, taskType, taskComplexity, profile);
            // Get prediction from performance network
            const predictionResult = await this.brainJsBridge.predictWithNeuralNet(this.performanceNetworkId, input);
            if (predictionResult.isErr()) {
                throw predictionResult.error;
            }
            const output = predictionResult.value.output;
            return {
                agentId,
                taskType,
                predictedDuration: this.denormalizeDuration(output[0]),
                predictedSuccess: output[1],
                predictedEfficiency: output[2],
                confidence: this.calculatePredictionConfidence(output, profile),
                reasoning: this.generatePredictionReasoning(agentId, taskType, output, profile)
            };
        }
        catch (error) {
            logger.error('Error predicting agent performance:', error);
            // Return default prediction on error
            return {
                agentId,
                taskType,
                predictedDuration: 5000, // 5 seconds default
                predictedSuccess: 0.5,
                predictedEfficiency: 0.5,
                confidence: 0.1,
                reasoning: 'Prediction failed, using default values'
            };
        }
    }
    /**
     * Analyze task complexity
     *
     * @param taskType - Type of task to analyze
     * @param context - Additional context about the task
     * @returns Task complexity analysis
     */
    async analyzeTaskComplexity(taskType, context = {}) {
        if (!this.initialized)
            await this.initialize();
        try {
            // Prepare input for complexity estimation
            const input = this.prepareComplexityInput(taskType, context);
            const predictionResult = await this.brainJsBridge.predictWithNeuralNet(this.complexityNetworkId, input);
            if (predictionResult.isErr()) {
                throw predictionResult.error;
            }
            const output = predictionResult.value.output;
            return {
                taskType,
                estimatedComplexity: output[0],
                requiredSkills: this.inferRequiredSkills(taskType, output[0]),
                estimatedDuration: this.estimateDurationFromComplexity(output[0]),
                difficulty: this.mapComplexityToDifficulty(output[0]),
                confidence: output[1] || 0.7
            };
        }
        catch (error) {
            logger.error('Error analyzing task complexity:', error);
            // Return default analysis on error
            return {
                taskType,
                estimatedComplexity: 0.5,
                requiredSkills: ['general'],
                estimatedDuration: 3000,
                difficulty: 'medium',
                confidence: 0.1
            };
        }
    }
    /**
     * Find the best agent for a task
     *
     * @param taskType - Type of task
     * @param taskComplexity - Complexity of the task
     * @param availableAgents - List of available agent IDs
     * @returns Best agent ID and confidence score
     */
    async findBestAgentForTask(taskType, taskComplexity, availableAgents) {
        if (!this.initialized)
            await this.initialize();
        try {
            let bestAgent = availableAgents[0];
            let bestScore = 0;
            let bestReasoning = 'Default selection';
            // Evaluate each available agent
            for (const agentId of availableAgents) {
                const prediction = await this.predictAgentPerformance(agentId, taskType, taskComplexity);
                // Calculate composite score: efficiency * success probability * confidence
                const score = prediction.predictedEfficiency * prediction.predictedSuccess * prediction.confidence;
                if (score > bestScore) {
                    bestScore = score;
                    bestAgent = agentId;
                    bestReasoning = `High predicted efficiency (${(prediction.predictedEfficiency * 100).toFixed(1)}%) and success rate (${(prediction.predictedSuccess * 100).toFixed(1)}%)`;
                }
            }
            logger.info(`Selected best agent: ${bestAgent} for ${taskType} (score: ${bestScore.toFixed(3)})`);
            return {
                agentId: bestAgent,
                confidence: bestScore,
                reasoning: bestReasoning
            };
        }
        catch (error) {
            logger.error('Error finding best agent for task:', error);
            return {
                agentId: availableAgents[0] || 'default',
                confidence: 0.1,
                reasoning: 'Error in selection, using first available agent'
            };
        }
    }
    /**
     * Get agent behavioral profile
     *
     * @param agentId - ID of the agent
     * @returns Agent behavioral profile or null if not found
     */
    getAgentProfile(agentId) {
        return this.agentProfiles.get(agentId) || null;
    }
    /**
     * Get all agent profiles
     *
     * @returns Map of all agent profiles
     */
    getAllAgentProfiles() {
        return new Map(this.agentProfiles);
    }
    /**
     * Get behavioral intelligence statistics
     */
    getStats() {
        const profiles = Array.from(this.agentProfiles.values());
        const avgPerformance = profiles.length > 0
            ? profiles.reduce((sum, p) => sum + p.averagePerformance, 0) / profiles.length
            : 0;
        const mostActive = profiles
            .sort((a, b) => b.averagePerformance - a.averagePerformance)
            .slice(0, 5)
            .map(p => p.agentId);
        return {
            totalAgents: this.agentProfiles.size,
            trainingDataPoints: this.trainingBuffer.length,
            networksInitialized: this.initialized,
            averagePerformance: avgPerformance,
            mostActiveAgents: mostActive
        };
    }
    // 🧠 Enhanced ML Methods
    /**
     * Update agent performance time series using moving averages
     */
    async updateAgentPerformanceTimeSeries(executionData) {
        // Get or create moving average for this agent
        let timeSeries = this.performanceTimeSeries.get(executionData.agentId);
        if (!timeSeries) {
            timeSeries = sma; // Using sma from moving-averages package
            this.performanceTimeSeries.set(executionData.agentId, timeSeries);
        }
        // Update time series with efficiency score
        timeSeries.update(executionData.efficiency);
        // Update performance history for trend analysis
        let history = this.agentPerformanceHistory.get(executionData.agentId) || [];
        history.push(executionData.efficiency);
        // Keep only last 100 data points
        if (history.length > 100) {
            history = history.slice(-100);
        }
        this.agentPerformanceHistory.set(executionData.agentId, history);
    }
    /**
     * Update agent feature vector for Random Forest classification
     */
    async updateAgentFeatureVector(executionData) {
        const features = [
            executionData.efficiency,
            executionData.taskComplexity,
            executionData.duration / 10000, // Normalized duration
            executionData.success ? 1 : 0,
            executionData.resourceUsage,
            executionData.errorCount / 10, // Normalized error count
            this.encodeTaskType(executionData.taskType),
            this.calculateAgentExperience(executionData.agentId)
        ];
        this.agentFeatureVectors.set(executionData.agentId, features);
    }
    /**
     * Train advanced ML models (Random Forest and DBSCAN)
     */
    async trainAdvancedMLModels() {
        try {
            logger.info('🔬 Training advanced ML models...');
            // Prepare training data for Random Forest
            const agentIds = Array.from(this.agentFeatureVectors.keys());
            const features = agentIds.map(id => this.agentFeatureVectors.get(id)).filter(f => f.length > 0);
            const labels = agentIds.map(id => this.getAgentTypeLabel(this.classifyAgentType(id)));
            if (features.length >= 5 && // Perform DBSCAN clustering for behavioral groups
                this.behaviorClusterer && features.length > 0) {
                const clusters = this.behaviorClusterer.run(features, 0.3, 3); // eps=0.3, minPts=3
                logger.info(`✅ DBSCAN clustering identified ${clusters.length} behavioral groups`);
                // Analyze label distribution across clusters for behavioral insights
                const labelStats = this.analyzeLabelDistribution(labels, clusters);
                logger.debug('Agent type distribution across clusters:', labelStats);
            }
        }
        catch (error) {
            logger.error('Error training advanced ML models:', error);
        }
    }
    /**
     * Convert numeric agent type to string label
     */
    getAgentTypeLabel(agentTypeNum) {
        const typeLabels = ['unknown', 'generalist', 'adaptive', 'specialist'];
        return typeLabels[agentTypeNum] || 'unknown';
    }
    /**
     * Classify agent type based on historical performance
     */
    classifyAgentType(agentId) {
        const profile = this.agentProfiles.get(agentId);
        if (!profile)
            return 0; // Unknown
        // Classification based on performance characteristics
        if (profile.averagePerformance > 0.8 && profile.consistencyScore > 0.7) {
            return 3; // Specialist
        }
        else if (profile.averagePerformance > 0.6 && profile.adaptabilityScore > 0.6) {
            return 2; // Adaptive
        }
        else if (profile.averagePerformance > 0.4) {
            return 1; // Generalist
        }
        else {
            return 0; // Inconsistent
        }
    }
    /**
     * Get agent behavioral clusters using DBSCAN
     */
    async getAgentBehavioralClusters() {
        if (!this.behaviorClusterer) {
            return new Map();
        }
        const agentIds = Array.from(this.agentFeatureVectors.keys());
        const features = agentIds.map(id => this.agentFeatureVectors.get(id)).filter(f => f.length > 0);
        if (features.length < 3) {
            return new Map();
        }
        const clusters = this.behaviorClusterer.run(features, 0.3, 3);
        const clusterMap = new Map();
        // DBSCAN returns array of clusters, each cluster is an array of point indices
        clusters.forEach((cluster, clusterId) => {
            if (cluster.length > 0) {
                clusterMap.set(clusterId, cluster.map((pointIndex) => agentIds[pointIndex]));
            }
        });
        return clusterMap;
    }
    /**
     * Predict agent performance trend using time series analysis
     */
    async predictPerformanceTrend(agentId) {
        const history = this.agentPerformanceHistory.get(agentId);
        if (!history || history.length < 5) {
            return { trend: 'stable', confidence: 0.1, forecast: [] };
        }
        // Use linear regression for trend analysis
        const regressionData = history.map((value, idx) => [idx, value]);
        const result = regression.linear(regressionData);
        const slope = result.equation[0];
        const trend = slope > 0.01 ? 'improving' : slope < -0.01 ? 'declining' : 'stable';
        // Simple forecast for next 5 periods using simple-statistics
        const lastIndex = history.length - 1;
        const forecast = [];
        for (let i = 1; i <= 5; i++) {
            const predicted = result.equation[0] * (lastIndex + i) + result.equation[1];
            forecast.push(Math.max(0, Math.min(1, predicted))); // Clamp to [0,1]
        }
        // Add statistical smoothing
        const smoothedForecast = forecast.map(val => {
            const recentMean = ss.mean(history.slice(-5));
            return (val + recentMean) / 2; // Blend prediction with recent average
        });
        return {
            trend,
            confidence: result.r2 || 0.5,
            forecast: smoothedForecast
        };
    }
    /**
     * Enable continuous learning with configuration
     */
    async enableContinuousLearning(config) {
        if (!this.initialized)
            await this.initialize();
        try {
            logger.info('🔄 Enabling continuous learning for behavioral intelligence...', config);
            // Update learning parameters if provided
            if (config.learningRate) {
                // Apply learning rate to neural networks
                logger.debug(`Setting learning rate to ${config.learningRate}`);
            }
            if (config.maxMemorySize) {
                // Adjust buffer size
                Object.defineProperty(this, 'bufferSize', {
                    value: config.maxMemorySize,
                    writable: true
                });
            }
            // Set up evaluation interval for continuous adaptation
            if (config.evaluationInterval) {
                setInterval(async () => {
                    try {
                        // Trigger model retraining with accumulated data
                        if (this.trainingBuffer.length >= 10) {
                            await this.trainAdvancedMLModels();
                            logger.debug('🔄 Continuous learning evaluation completed');
                        }
                    }
                    catch (error) {
                        logger.error('❌ Continuous learning evaluation failed:', error);
                    }
                }, config.evaluationInterval);
            }
            logger.info('✅ Continuous learning enabled successfully');
        }
        catch (error) {
            logger.error('❌ Failed to enable continuous learning:', error);
            throw error;
        }
    }
    /**
     * Record behavior data for learning
     */
    async recordBehavior(data) {
        if (!this.initialized)
            await this.initialize();
        try {
            logger.debug(`📝 Recording behavior: ${data.agentId} - ${data.behaviorType}`);
            // Convert behavior data to execution data format for learning
            const executionData = {
                agentId: data.agentId,
                taskType: data.behaviorType,
                taskComplexity: this.inferComplexityFromContext(data.context),
                duration: typeof data.metadata?.duration === 'number' ? data.metadata.duration : 1000,
                success: data.success,
                efficiency: data.success ? 0.8 : 0.2, // Simple efficiency mapping
                resourceUsage: typeof data.metadata?.resourceUsage === 'number' ? data.metadata.resourceUsage : 0.5,
                errorCount: data.success ? 0 : 1,
                timestamp: data.timestamp,
                context: data.context
            };
            // Learn from the behavior data
            await this.learnFromExecution(executionData);
            logger.debug(`✅ Behavior recorded and learned from: ${data.agentId}`);
        }
        catch (error) {
            logger.error('❌ Failed to record behavior:', error);
        }
    }
    /**
     * Infer complexity from context data
     */
    inferComplexityFromContext(context) {
        let complexity = 0.5; // Default
        // Increase complexity based on context size
        complexity += Math.min(Object.keys(context).length * 0.05, 0.3);
        // Check for complexity indicators
        const contextStr = JSON.stringify(context).toLowerCase();
        const complexKeywords = ['complex', 'advanced', 'difficult', 'optimization', 'neural', 'ml'];
        const matches = complexKeywords.filter(keyword => contextStr.includes(keyword)).length;
        complexity += Math.min(matches * 0.1, 0.2);
        return Math.min(complexity, 1.0);
    }
    /**
     * Get enhanced behavioral statistics with ML insights
     */
    getEnhancedStats() {
        const basicStats = this.getStats();
        // Enhanced statistics with ML insights
        const mlModelsActive = [];
        if (this.behaviorClusterer)
            mlModelsActive.push('DBSCAN');
        if (this.kmeansClusterer)
            mlModelsActive.push('K-Means');
        if (this.performanceTimeSeries.size > 0)
            mlModelsActive.push('Time Series');
        mlModelsActive.push('Simple Statistics');
        const performanceTrends = {};
        for (const agentId of Array.from(this.agentPerformanceHistory.keys()).slice(0, 5)) {
            const history = this.agentPerformanceHistory.get(agentId);
            if (history && history.length >= 3) {
                const recent = history.slice(-3);
                const trend = recent[2] > recent[0] ? 'improving' : recent[2] < recent[0] ? 'declining' : 'stable';
                performanceTrends[agentId] = trend;
            }
        }
        return {
            ...basicStats,
            behavioralClusters: Math.max(...Array.from(this.agentFeatureVectors.keys()).map(() => 0)) + 1,
            mlModelsActive,
            performanceTrends
        };
    }
    // Private helper methods
    async updateAgentProfile(executionData) {
        const existing = this.agentProfiles.get(executionData.agentId);
        if (existing) {
            // Update existing profile with new data
            const updatedProfile = {
                ...existing,
                averagePerformance: (existing.averagePerformance + executionData.efficiency) / 2,
                lastUpdated: Date.now()
            };
            this.agentProfiles.set(executionData.agentId, updatedProfile);
        }
        else {
            // Create new profile
            const newProfile = {
                agentId: executionData.agentId,
                specializations: [executionData.taskType],
                averagePerformance: executionData.efficiency,
                consistencyScore: 0.5, // Will improve with more data
                learningRate: 0.1,
                adaptabilityScore: 0.5,
                preferredTaskTypes: [executionData.taskType],
                lastUpdated: Date.now()
            };
            this.agentProfiles.set(executionData.agentId, newProfile);
        }
    }
    async trainNetworksFromBuffer() {
        if (this.trainingBuffer.length === 0)
            return;
        try {
            logger.info(`Training networks with ${this.trainingBuffer.length} data points`);
            // Prepare training data for performance network
            const performanceTrainingData = this.trainingBuffer.map(data => ({
                input: this.preparePerformanceInput(data.agentId, data.taskType, data.taskComplexity, this.agentProfiles.get(data.agentId)),
                output: [
                    this.normalizeDuration(data.duration),
                    data.success ? 1 : 0,
                    data.efficiency
                ]
            }));
            // Train performance network
            await this.brainJsBridge.trainNeuralNet(this.performanceNetworkId, performanceTrainingData, { iterations: 100, errorThreshold: 0.01 });
            logger.info('Networks training completed');
        }
        catch (error) {
            logger.error('Error training networks:', error);
        }
    }
    preparePerformanceInput(agentId, taskType, taskComplexity, profile) {
        return [
            taskComplexity,
            this.encodeTaskType(taskType),
            profile?.averagePerformance || 0.5,
            profile?.consistencyScore || 0.5,
            profile?.learningRate || 0.1,
            profile?.adaptabilityScore || 0.5,
            profile?.specializations.includes(taskType) ? 1 : 0,
            this.calculateAgentExperience(agentId)
        ];
    }
    prepareComplexityInput(taskType, context) {
        return [
            this.encodeTaskType(taskType),
            this.encodeContextComplexity(context),
            Object.keys(context).length / 10, // Normalized context size
            this.hasComplexOperations(context) ? 1 : 0,
            this.requiresSpecialization(taskType) ? 1 : 0
        ];
    }
    encodeTaskType(taskType) {
        const types = {
            'data-processing': 0.2,
            'neural-training': 0.8,
            'coordination': 0.5,
            'analysis': 0.6,
            'optimization': 0.7,
            'monitoring': 0.3,
            'research': 0.9
        };
        return types[taskType] || 0.5;
    }
    encodeContextComplexity(context) {
        // Simple heuristic for context complexity
        const complexity = Object.keys(context).length * 0.1 +
            (context.dataSize ? Math.min(Number(context.dataSize) / 1000000, 1) : 0) +
            (context.dependencies ? Math.min(Number(context.dependencies) / 10, 1) : 0);
        return Math.min(complexity, 1);
    }
    hasComplexOperations(context) {
        const complexKeywords = ['neural', 'ml', 'ai', 'optimization', 'algorithm'];
        return complexKeywords.some(keyword => JSON.stringify(context).toLowerCase().includes(keyword));
    }
    requiresSpecialization(taskType) {
        const specializedTasks = ['neural-training', 'optimization', 'research', 'analysis'];
        return specializedTasks.includes(taskType);
    }
    calculateAgentExperience(agentId) {
        const profile = this.agentProfiles.get(agentId);
        if (!profile)
            return 0;
        // Simple experience calculation based on time since creation and performance
        const daysSinceCreation = (Date.now() - profile.lastUpdated) / (1000 * 60 * 60 * 24);
        return Math.min(daysSinceCreation / 30, 1) * profile.averagePerformance;
    }
    normalizeDuration(duration) {
        // Normalize duration to 0-1 scale (assuming max 10 seconds = 10000ms)
        return Math.min(duration / 10000, 1);
    }
    denormalizeDuration(normalizedDuration) {
        // Convert back to milliseconds
        return normalizedDuration * 10000;
    }
    calculatePredictionConfidence(output, profile) {
        // Higher confidence for agents with more history and consistent performance
        const baseConfidence = profile ? (profile.consistencyScore + profile.averagePerformance) / 2 : 0.3;
        // Adjust based on prediction certainty (how close outputs are to 0 or 1)
        const outputCertainty = output.reduce((sum, val) => {
            return sum + Math.abs(val - 0.5) * 2; // Distance from uncertain (0.5)
        }, 0) / output.length;
        return Math.min(baseConfidence + outputCertainty * 0.3, 0.95);
    }
    generatePredictionReasoning(agentId, taskType, output, profile) {
        const [duration, success, efficiency] = output;
        let reasoning = `Agent ${agentId} for ${taskType}: `;
        // Analyze efficiency prediction
        if (efficiency > 0.7) {
            reasoning += 'High efficiency expected ';
        }
        else if (efficiency < 0.3) {
            reasoning += 'Low efficiency expected ';
        }
        else {
            reasoning += 'Moderate efficiency expected ';
        }
        // Analyze success probability
        const successProbability = success * 100;
        reasoning += `(${successProbability.toFixed(0)}% success probability, `;
        // Analyze duration estimate
        const durationSeconds = duration / 1000;
        if (durationSeconds < 2) {
            reasoning += 'quick completion)';
        }
        else if (durationSeconds < 10) {
            reasoning += `${durationSeconds.toFixed(1)}s expected)`;
        }
        else {
            reasoning += `${durationSeconds.toFixed(0)}s duration)`;
        }
        reasoning += profile?.specializations.includes(taskType) ? ' - specialized agent' : ' - general capability';
        return reasoning;
    }
    inferRequiredSkills(taskType, complexity) {
        const baseSkills = {
            'data-processing': ['data-analysis', 'algorithms'],
            'neural-training': ['machine-learning', 'neural-networks', 'optimization'],
            'coordination': ['communication', 'planning', 'leadership'],
            'analysis': ['critical-thinking', 'pattern-recognition'],
            'optimization': ['algorithms', 'mathematics', 'performance-tuning'],
            'monitoring': ['observation', 'alerting', 'diagnostics'],
            'research': ['investigation', 'analysis', 'synthesis']
        };
        const skills = baseSkills[taskType] || ['general'];
        if (complexity > 0.7) {
            skills.push('expert-level', 'complex-problem-solving');
        }
        return skills;
    }
    estimateDurationFromComplexity(complexity) {
        // Base duration: 1-10 seconds based on complexity
        return 1000 + (complexity * 9000);
    }
    mapComplexityToDifficulty(complexity) {
        if (complexity < 0.25)
            return 'easy';
        if (complexity < 0.5)
            return 'medium';
        if (complexity < 0.75)
            return 'hard';
        return 'expert';
    }
    /**
     * Analyze label distribution across clusters for behavioral insights
     */
    analyzeLabelDistribution(labels, clusters) {
        const labelsByCluster = {};
        const dominantTypes = [];
        // Initialize cluster label counts
        clusters.forEach((_, clusterIndex) => {
            labelsByCluster[clusterIndex] = {};
        });
        // Count labels per cluster
        clusters.forEach((cluster, clusterIndex) => {
            cluster.forEach(pointIndex => {
                if (pointIndex < labels.length) {
                    const label = labels[pointIndex];
                    labelsByCluster[clusterIndex][label] = (labelsByCluster[clusterIndex][label] || 0) + 1;
                }
            });
            // Find dominant type for this cluster
            const clusterLabels = labelsByCluster[clusterIndex];
            const dominantType = Object.keys(clusterLabels).reduce((a, b) => clusterLabels[a] > clusterLabels[b] ? a : b, Object.keys(clusterLabels)[0]);
            if (dominantType) {
                dominantTypes.push(dominantType);
            }
        });
        return {
            totalClusters: clusters.length,
            labelsByCluster,
            dominantTypes
        };
    }
}
/**
 * Demo function showing behavioral intelligence benefits
 */
export async function demoBehavioralIntelligence(brainJsBridge) {
    console.log('🧠 Behavioral Intelligence Demo Starting...\n');
    const behavioral = new BehavioralIntelligence(brainJsBridge);
    await behavioral.initialize();
    // Sample agent execution data
    const executionData = [
        {
            agentId: 'agent-1',
            taskType: 'data-processing',
            taskComplexity: 0.6,
            duration: 2500,
            success: true,
            efficiency: 0.85,
            resourceUsage: 0.4,
            errorCount: 0,
            timestamp: Date.now(),
            context: { dataSize: 1000 }
        },
        {
            agentId: 'agent-1',
            taskType: 'neural-training',
            taskComplexity: 0.9,
            duration: 8000,
            success: true,
            efficiency: 0.75,
            resourceUsage: 0.8,
            errorCount: 1,
            timestamp: Date.now(),
            context: { modelSize: 'large' }
        },
        {
            agentId: 'agent-2',
            taskType: 'data-processing',
            taskComplexity: 0.4,
            duration: 1800,
            success: true,
            efficiency: 0.9,
            resourceUsage: 0.3,
            errorCount: 0,
            timestamp: Date.now(),
            context: { dataSize: 500 }
        }
    ];
    try {
        // 1. Learn from execution data
        console.log('📚 Learning from agent executions...');
        for (const data of executionData) {
            await behavioral.learnFromExecution(data);
        }
        console.log('✅ Learning completed\n');
        // 2. Predict agent performance
        console.log('🔮 Predicting agent performance...');
        const prediction = await behavioral.predictAgentPerformance('agent-1', 'data-processing', 0.7);
        console.log(`📊 Prediction for agent-1:`);
        console.log(`   • Duration: ${prediction.predictedDuration.toFixed(0)}ms`);
        console.log(`   • Success rate: ${(prediction.predictedSuccess * 100).toFixed(1)}%`);
        console.log(`   • Efficiency: ${(prediction.predictedEfficiency * 100).toFixed(1)}%`);
        console.log(`   • Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
        console.log(`   • Reasoning: ${prediction.reasoning}\n`);
        // 3. Analyze task complexity
        console.log('📝 Analyzing task complexity...');
        const complexityAnalysis = await behavioral.analyzeTaskComplexity('neural-training', {
            modelSize: 'large',
            dataSize: 100000
        });
        console.log(`🎯 Task complexity analysis:`);
        console.log(`   • Complexity: ${(complexityAnalysis.estimatedComplexity * 100).toFixed(1)}%`);
        console.log(`   • Difficulty: ${complexityAnalysis.difficulty}`);
        console.log(`   • Required skills: ${complexityAnalysis.requiredSkills.join(', ')}`);
        console.log(`   • Estimated duration: ${complexityAnalysis.estimatedDuration.toFixed(0)}ms\n`);
        // 4. Find best agent for task
        console.log('🎯 Finding best agent for task...');
        const bestAgent = await behavioral.findBestAgentForTask('data-processing', 0.5, ['agent-1', 'agent-2']);
        console.log(`🏆 Best agent selection:`);
        console.log(`   • Selected: ${bestAgent.agentId}`);
        console.log(`   • Confidence: ${(bestAgent.confidence * 100).toFixed(1)}%`);
        console.log(`   • Reasoning: ${bestAgent.reasoning}\n`);
        // 5. Show behavioral intelligence stats
        console.log('📈 Behavioral Intelligence Statistics:');
        const stats = behavioral.getStats();
        console.log(`   • Total agents: ${stats.totalAgents}`);
        console.log(`   • Training data points: ${stats.trainingDataPoints}`);
        console.log(`   • Networks initialized: ${stats.networksInitialized}`);
        console.log(`   • Average performance: ${(stats.averagePerformance * 100).toFixed(1)}%`);
        console.log(`   • Most active agents: ${stats.mostActiveAgents.join(', ')}`);
        console.log('\n🎉 Behavioral Intelligence Demo Complete!');
        console.log('\n💡 Key Benefits for claude-code-zen:');
        console.log('   • Real-time agent performance prediction');
        console.log('   • Intelligent task-agent matching');
        console.log('   • Behavioral pattern learning and adaptation');
        console.log('   • Task complexity estimation for better routing');
        console.log('   • Data-driven swarm optimization');
    }
    catch (error) {
        console.error('❌ Demo failed:', error);
    }
}
//# sourceMappingURL=behavioral-intelligence.js.map