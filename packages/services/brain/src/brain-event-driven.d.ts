/**
 * @fileoverview Brain Service Event-Driven Implementation
 *
 * **100% EVENT-DRIVEN BRAIN COORDINATION WITH FOUNDATION**
 *
 * Foundation-powered event-driven brain service providing autonomous AI decision-making
 * through pure event coordination with zero package dependencies. Implements the
 * established event-driven pattern for brain coordination via typed events.
 *
 * **ARCHITECTURE:**
 * - Foundation imports internally (getLogger, recordMetric, withTrace, generateUUID, TypedEventBase)
 * - Event-based brain coordination only (no package dependencies)
 * - Event interfaces:'brain:brain-service:action' → ' brain-service:response') * - Internal professional service operations using foundation utilities
 * - Clean factory exports following established patterns
 *
 * **EVENT COORDINATION:**
 * - 'brain:brain-service:optimize-prompt' → ' brain-service:prompt-optimized') * - 'brain:brain-service:estimate-complexity' → ' brain-service:complexity-estimated') * - 'brain:brain-service:predict-performance' → ' brain-service:performance-predicted') * - 'brain:brain-service:coordinate-autonomous' → ' brain-service:autonomous-coordinated') * - 'brain:brain-service:analyze-behavioral' → ' brain-service:behavioral-analyzed') * - 'brain:brain-service:process-neural' → ' brain-service:neural-processed') *
 * @example Event-Driven Brain Coordination
 * ```typescript`
 * import { createEventDrivenBrain, EventDrivenBrain} from '@claude-zen/brain';
 *
 * // Create event-driven brain with brain coordination
 * const brainService = await createEventDrivenBrain({
 *   autonomous:{ enabled: true, learningRate:0.01},
 *   neural:{ rustAcceleration: true, gpuAcceleration:true},
 *   optimization:{ autoSelection: true, performanceTracking:true},
 *   enterprise:{ auditTrail: true, securityLevel: 'high'}
 *});
 *
 * // Event-driven prompt optimization
 * brainService.eventBus.emit('brain:brain-service:optimize-prompt', {
 *   requestId: 'req-123', *   task: 'complex-architecture-design', *   prompt: 'Design a scalable microservices architecture...', *   context:{ complexity: 0.8, priority: 'high', timeLimit:30000}
 *});
 *
 * // Listen for optimization results
 * brainService.eventBus.on('brain-service:prompt-optimized', (result) => {
 *   logger.info('Optimization completed: ', {
' *     strategy:result.strategy,
 *     confidence:result.confidence,
 *     optimizedPrompt:result.optimizedPrompt
 *});
 *});
 * ```
 *
 * @example Autonomous Decision-Making
 * ```typescript`
 * // Autonomous complexity estimation and strategy selection
 * brainService.eventBus.emit('brain:brain-service:estimate-complexity', {
 *   requestId: 'complexity-456', *   task: 'enterprise-system-design', *   content: 'Build a fault-tolerant distributed system...', *   context:{ domain: 'enterprise-architecture', scale: ' global'}
 *});
 *
 * // Autonomous coordination based on complexity
 * brainService.eventBus.on('brain-service:complexity-estimated', (analysis) => {
 *   brainService.eventBus.emit('brain:brain-service:coordinate-autonomous', {
 *     requestId: 'coord-789', *     complexityAnalysis:analysis,
 *     objectives:{
 *       performance:0.4,
 *       reliability:0.3,
 *       efficiency:0.3
 *}
 *});
 *});
 * ```
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.1.0
 */
import { TypedEventBase, Result } from '@claude-zen/foundation';
/**
 * Brain Service Configuration
 */
export interface EventDrivenBrainConfig {
    /** Service identification */
    serviceId?: string;
    serviceName?: string;
    /** Autonomous decision-making configuration */
    autonomous?: {
        enabled?: boolean;
        learningRate?: number;
        adaptationThreshold?: number;
        decisionConfidenceMinimum?: number;
        enableSelfImprovement?: boolean;
    };
    /** Neural computation configuration */
    neural?: {
        backend?: 'rust-fann' | ' brain-js' | ' gpu-accelerated';
        rustAcceleration?: boolean;
        gpuAcceleration?: boolean;
        parallelProcessing?: number;
        memoryPoolSize?: string;
        acceleration?: {
            gpu?: boolean;
            multiThreading?: boolean;
            vectorization?: 'avx512' | ' avx2' | ' sse4';
            memoryOptimization?: boolean;
        };
    };
    /** Optimization strategy configuration */
    optimization?: {
        strategies?: ('dspy' | ' ml' | ' hybrid' | ' ensemble')[];
        autoSelection?: boolean;
        performanceTracking?: boolean;
        kernelFusion?: boolean;
        memoryOptimization?: boolean;
        pipelineParallelism?: boolean;
    };
    /** Enterprise features configuration */
    enterprise?: {
        auditTrail?: boolean;
        securityLevel?: 'low' | ' medium' | ' high' | ' critical';
        multiTenant?: boolean;
        governanceCompliance?: 'soc2' | ' iso27001' | ' gdpr';
        modelEncryption?: boolean;
        accessControl?: 'rbac' | ' rbac-with-abac';
    };
    /** Behavioral intelligence configuration */
    behavioral?: {
        enabled?: boolean;
        realTimeAdaptation?: boolean;
        crossAgentLearning?: boolean;
        feedbackIntegration?: boolean;
        privacyPreservation?: boolean;
    };
    /** Performance and monitoring */
    monitoring?: {
        realTimeMetrics?: boolean;
        performanceProfiler?: boolean;
        memoryTracker?: boolean;
        checkpointInterval?: number;
        validationInterval?: number;
    };
    /** Advanced features */
    advanced?: {
        distributedTraining?: boolean;
        federatedLearning?: boolean;
        transferLearning?: boolean;
        ensembleMethods?: boolean;
        quantization?: 'int8' | ' int16' | ' fp16' | ' mixed';
    };
}
/**
 * Prompt Optimization Request
 */
export interface PromptOptimizationRequest {
    requestId: string;
    task: string;
    prompt: string;
    context?: {
        complexity?: number;
        domain?: string;
        priority?: 'low' | ' medium' | ' high' | ' critical';
        timeLimit?: number;
        qualityRequirement?: number;
        resourceBudget?: 'low' | ' medium' | ' high';
    };
    enableLearning?: boolean;
}
/**
 * Prompt Optimization Result
 */
export interface PromptOptimizationResult {
    requestId: string;
    strategy: 'dspy' | ' ml' | ' hybrid' | ' basic';
    confidence: number;
    optimizedPrompt: string;
    reasoning: string;
    performancePrediction: {
        expectedAccuracy: number;
        estimatedDuration: number;
        resourceRequirements: string;
    };
    metadata: {
        processingTime: number;
        modelUsed: string;
        complexityScore: number;
    };
}
/**
 * Complexity Estimation Request
 */
export interface ComplexityEstimationRequest {
    requestId: string;
    task: string;
    content: string;
    context?: {
        domain?: string;
        scale?: 'small' | ' medium' | ' large' | ' global';
        constraints?: Record<string, any>;
        requirements?: Record<string, any>;
    };
    expertise?: 'junior' | ' mid' | ' senior' | ' expert';
}
/**
 * Complexity Analysis Result
 */
export interface ComplexityAnalysisResult {
    requestId: string;
    overallComplexity: number;
    dimensions: {
        technical: number;
        architectural: number;
        operational: number;
        business: number;
    };
    recommendations: {
        optimizationStrategy: 'dspy' | ' ml' | ' hybrid';
        timeEstimate: number;
        resourceRequirements: string;
        riskFactors: string[];
    };
    confidence: number;
}
/**
 * Performance Prediction Request
 */
export interface PerformancePredictionRequest {
    requestId: string;
    agentId: string;
    taskType: string;
    complexity: number;
    context: {
        timeOfDay?: string;
        workload?: 'light' | ' moderate' | ' heavy';
        collaboration?: boolean;
        urgency?: 'low' | ' medium' | ' high';
    };
    horizons: ('1h' | '4h' | '1d')[];
}
/**
 * Performance Prediction Result
 */
export interface PerformancePredictionResult {
    requestId: string;
    predictions: {
        [horizon: string]: {
            expectedQuality: number;
            confidence: number;
            influencingFactors: string[];
            adaptationPotential?: number;
            improvement?: number;
        };
    };
    optimizationRecommendations: string[];
}
/**
 * Autonomous Coordination Request
 */
export interface AutonomousCoordinationRequest {
    requestId: string;
    complexityAnalysis: ComplexityAnalysisResult;
    objectives: {
        performance: number;
        reliability: number;
        efficiency: number;
        learning?: number;
    };
    constraints?: {
        timeLimit?: number;
        qualityRequirement?: number;
        resourceBudget?: 'low' | ' medium' | ' high';
    };
}
/**
 * Autonomous Coordination Result
 */
export interface AutonomousCoordinationResult {
    requestId: string;
    decisions: {
        strategy: string;
        resourceAllocation: Record<string, any>;
        scalingDecisions: Record<string, any>;
        optimizationActions: string[];
    };
    expectedImpact: {
        performanceGain: number;
        costImpact: number;
        reliabilityChange: number;
    };
    confidence: number;
    implementationPlan: string[];
    rollbackStrategy: string[];
}
/**
 * Behavioral Analysis Request
 */
export interface BehavioralAnalysisRequest {
    requestId: string;
    agentId: string;
    executionData: {
        taskType: string;
        startTime: number;
        endTime: number;
        performance: {
            qualityScore: number;
            efficiency: number;
            innovation: number;
            completeness: number;
        };
        context: Record<string, any>;
        outcomes: Record<string, any>;
    };
}
/**
 * Behavioral Analysis Result
 */
export interface BehavioralAnalysisResult {
    requestId: string;
    patterns: {
        performanceTrends: Record<string, number>;
        behavioralClusters: string[];
        anomalies: string[];
    };
    insights: {
        strengths: string[];
        improvementAreas: string[];
        recommendations: string[];
    };
    learningOutcomes: {
        modelUpdates: boolean;
        adaptationRate: number;
        confidenceImpact: number;
    };
}
/**
 * Neural Processing Request
 */
export interface NeuralProcessingRequest {
    requestId: string;
    taskType: 'embedding' | ' inference' | ' training' | ' optimization';
    inputData: any;
    modelConfig?: {
        architecture: string;
        parameters: Record<string, any>;
        optimization: Record<string, any>;
    };
    processingOptions?: {
        useGPU?: boolean;
        batchSize?: number;
        precision?: 'fp16' | ' fp32' | ' mixed';
    };
}
/**
 * Neural Processing Result
 */
export interface NeuralProcessingResult {
    requestId: string;
    output: any;
    metadata: {
        processingTime: number;
        modelUsed: string;
        computeResources: string;
        accuracy?: number;
    };
    performance: {
        throughput: number;
        latency: number;
        memoryUsage: number;
    };
}
/**
 * Brain Service Events Interface
 */
export interface BrainServiceEvents {
    'brain:brain-service:optimize-prompt': PromptOptimizationRequest;
    'brain:brain-service:estimate-complexity': ComplexityEstimationRequest;
    'brain:brain-service:predict-performance': PerformancePredictionRequest;
    'brain:brain-service:coordinate-autonomous': AutonomousCoordinationRequest;
    'brain:brain-service:analyze-behavioral': BehavioralAnalysisRequest;
    'brain:brain-service:process-neural': NeuralProcessingRequest;
    'brain-service:prompt-optimized': PromptOptimizationResult;
    'brain-service:complexity-estimated': ComplexityAnalysisResult;
    'brain-service:performance-predicted': PerformancePredictionResult;
    'brain-service:autonomous-coordinated': AutonomousCoordinationResult;
    'brain-service:behavioral-analyzed': BehavioralAnalysisResult;
    'brain-service:neural-processed': NeuralProcessingResult;
    'brain-service:error': {
        requestId: string;
        operation: string;
        error: string;
        context: Record<string, any>;
    };
    'brain-service:status': {
        serviceId: string;
        status: 'initializing' | ' ready' | ' busy' | ' error';
        metrics: Record<string, any>;
    };
}
/**
 * Event-Driven Brain Service Implementation
 *
 * Foundation-powered brain service providing autonomous AI decision-making
 * through pure event coordination with zero external package dependencies.
 */
export declare class EventDrivenBrain {
    private readonly serviceId;
    private readonly config;
    private readonly logger;
    private readonly container;
    readonly eventBus: TypedEventBase<BrainServiceEvents>;
    private readonly promptOptimizationBreaker;
    private readonly complexityEstimationBreaker;
    private readonly performancePredictionBreaker;
    private readonly autonomousCoordinationBreaker;
    private isInitialized;
    private performanceHistory;
    private behavioralModels;
    private neuralNetworks;
    constructor(config?: EventDrivenBrainConfig);
    /**
     * Initialize the event-driven brain service
     */
    initialize(): Promise<Result<void, string>>;
    /**
     * Setup event handlers for brain coordination
     */
    private setupEventHandlers;
    /**
     * Handle prompt optimization with autonomous strategy selection
     */
    private handlePromptOptimization;
    /**
     * Handle complexity estimation with ML-powered analysis
     */
    private handleComplexityEstimation;
    /**
     * Handle performance prediction with behavioral intelligence
     */
    private handlePerformancePrediction;
    /**
     * Handle autonomous coordination with system-wide optimization
     */
    private handleAutonomousCoordination;
    /**
     * Handle behavioral analysis with learning integration
     */
    private handleBehavioralAnalysis;
    /**
     * Handle neural processing with GPU acceleration
     */
    private handleNeuralProcessing;
    /**
     * Perform intelligent prompt optimization
     */
    private performPromptOptimization;
    private analyzeTechnicalComplexity;
    private analyzeArchitecturalComplexity;
    private analyzeOperationalComplexity;
    private analyzeBusinessComplexity;
    private generateComplexityRecommendations;
    private calculateComplexityConfidence;
    private getBehavioralProfile;
    private predictPerformanceForHorizon;
    private calculateContextAdjustments;
    private identifyInfluencingFactors;
    private generatePerformanceRecommendations;
    private makeAutonomousDecisions;
    private selectCoordinationStrategy;
    private calculateResourceAllocation;
    private makeScalingDecisions;
    private generateOptimizationActions;
    private predictCoordinationImpact;
    private calculateCoordinationConfidence;
    private generateImplementationPlan;
    private generateRollbackStrategy;
    private analyzeBehavioralPatterns;
    private generateBehavioralInsights;
    private updateBehavioralModels;
    private selectNeuralModel;
    private processEmbedding;
    private processInference;
    private processTraining;
    private processOptimization;
    private calculateThroughput;
    private getMemoryUsage;
    private getComputeResources;
    private getActiveRequestCount;
    private getCpuUsage;
    private learnFromOptimization;
}
/**
 * Create Event-Driven Brain Service
 *
 * Factory function for creating event-driven brain service with brain coordination.
 * Returns initialized service ready for autonomous AI decision-making operations.
 *
 * @param config - Brain service configuration
 * @returns Initialized EventDrivenBrain service
 *
 * @example
 * ```typescript`
 * const brainService = await createEventDrivenBrain({
 *   autonomous:{ enabled: true, learningRate:0.01},
 *   neural:{ rustAcceleration: true, gpuAcceleration:true},
 *   enterprise:{ auditTrail: true, securityLevel: 'high'}
 *});
 * ```
 */
export declare function createEventDrivenBrain(config?: EventDrivenBrainConfig): Promise<EventDrivenBrain>;
export { EventDrivenBrain };
export default EventDrivenBrain;
export type { EventDrivenBrainConfig, PromptOptimizationRequest, PromptOptimizationResult, ComplexityEstimationRequest, ComplexityAnalysisResult, PerformancePredictionRequest, PerformancePredictionResult, AutonomousCoordinationRequest, AutonomousCoordinationResult, BehavioralAnalysisRequest, BehavioralAnalysisResult, NeuralProcessingRequest, NeuralProcessingResult, BrainServiceEvents };
//# sourceMappingURL=brain-event-driven.d.ts.map