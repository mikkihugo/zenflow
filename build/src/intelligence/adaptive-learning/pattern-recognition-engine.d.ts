/**
 * Pattern Recognition Engine for Swarm Execution Analysis
 * Analyzes swarm behaviors, task patterns, and communication flows.
 * Enhanced to implement the adaptive learning interface.
 */
/**
 * @file Pattern-recognition processing engine.
 */
import { EventEmitter } from 'node:events';
import type { AdaptiveLearningConfig, ExecutionData, FailurePrediction, CommunicationPattern as ICommunicationPattern, FailurePattern as IFailurePattern, PatternRecognitionEngine as IPatternRecognitionEngine, Message, PatternAnalysis, ResourcePattern, ResourceUsage, SystemContext, TaskCompletionPattern, TaskResult } from './types.ts';
export interface ExecutionPattern {
    id: string;
    type: 'task_completion' | 'communication' | 'resource_utilization' | 'failure' | 'coordination';
    pattern: any;
    frequency: number;
    confidence: number;
    context: ExecutionContext;
    metadata: PatternMetadata;
    timestamp: number;
}
export interface ExecutionContext {
    swarmId: string;
    agentIds: string[];
    taskType: string;
    topology: string;
    environment: string;
    resourceConstraints: ResourceConstraints;
}
export interface PatternMetadata {
    complexity: number;
    predictability: number;
    stability: number;
    anomalyScore: number;
    correlations: PatternCorrelation[];
}
export interface PatternCorrelation {
    patternId: string;
    strength: number;
    type: 'causal' | 'temporal' | 'spatial' | 'behavioral';
}
export interface ResourceConstraints {
    cpuLimit: number;
    memoryLimit: number;
    networkBandwidth: number;
    concurrencyLimit: number;
}
export interface ExecutionTrace {
    swarmId: string;
    agentId: string;
    action: string;
    parameters: any;
    result: any;
    timestamp: number;
    duration: number;
    resourceUsage: ResourceUsage;
}
export interface CommunicationPattern {
    source: string;
    target: string;
    messageType: string;
    frequency: number;
    latency: number;
    payloadSize: number;
    reliability: number;
}
export interface FailurePattern {
    type: string;
    frequency: number;
    context: string[];
    preconditions: any[];
    impacts: string[];
    recoveryTime: number;
}
export declare class PatternRecognitionEngine extends EventEmitter implements IPatternRecognitionEngine {
    private patterns;
    private traces;
    private communicationPatterns;
    private failurePatterns;
    private analysisWindow;
    private minPatternFrequency;
    private confidenceThreshold;
    private config;
    private context;
    constructor(config?: AdaptiveLearningConfig, context?: SystemContext);
    /**
     * Analyze execution patterns from execution data.
     *
     * @param data
     */
    analyzeExecutionPatterns(data: ExecutionData[]): Promise<PatternAnalysis>;
    /**
     * Classify task completion patterns.
     *
     * @param task
     */
    classifyTaskCompletion(task: TaskResult): TaskCompletionPattern;
    /**
     * Detect communication patterns from messages.
     *
     * @param messages
     */
    detectCommunicationPatterns(messages: Message[]): ICommunicationPattern[];
    /**
     * Identify resource usage patterns.
     *
     * @param usage
     */
    identifyResourcePatterns(usage: ResourceUsage[]): ResourcePattern[];
    /**
     * Predict failures based on failure patterns.
     *
     * @param patterns
     */
    predictFailures(patterns: IFailurePattern[]): FailurePrediction[];
    /**
     * Record execution trace for pattern analysis.
     *
     * @param trace
     */
    recordTrace(trace: ExecutionTrace): void;
    /**
     * Analyze execution patterns from traces.
     */
    private analyzePatterns;
    /**
     * Analyze task completion patterns.
     */
    private analyzeTaskCompletionPatterns;
    /**
     * Analyze communication patterns between agents.
     */
    private analyzeCommunicationPatterns;
    /**
     * Analyze resource utilization patterns.
     */
    private analyzeResourceUtilizationPatterns;
    /**
     * Analyze failure patterns.
     */
    private analyzeFailurePatterns;
    /**
     * Analyze coordination patterns.
     */
    private analyzeCoordinationPatterns;
    /**
     * Get patterns by type and confidence.
     *
     * @param type
     * @param minConfidence
     */
    getPatterns(type?: string, minConfidence?: number): ExecutionPattern[];
    /**
     * Predict likely patterns for given context.
     *
     * @param context
     */
    predictPatterns(context: ExecutionContext): ExecutionPattern[];
    /**
     * Get communication patterns for agents.
     *
     * @param agentId
     */
    getCommunicationPatterns(agentId?: string): CommunicationPattern[];
    /**
     * Get failure patterns.
     */
    getFailurePatterns(): FailurePattern[];
    /**
     * Start continuous pattern analysis.
     */
    private startPatternAnalysis;
    private groupTracesByTask;
    private groupTracesByResource;
    private calculateTaskPattern;
    private calculateResourcePattern;
    private calculateCoordinationPattern;
    private calculateConfidence;
    private calculateMetadata;
    private extractContext;
    private calculateVariance;
    private calculateAverageResourceUsage;
    private calculateTrend;
    private calculateUtilization;
    private calculateSignificance;
    private calculateAgentParticipation;
    private calculateComplexity;
    private calculatePredictability;
    private calculateStabilityFromPattern;
    private calculateAnomalyScore;
    private findCorrelations;
    private getMostFrequentMessageTypeFromTraces;
    private calculateAverageLatencyFromTraces;
    private calculateAveragePayloadSize;
    private calculateReliabilityFromTraces;
    private classifyError;
    private extractFailureContext;
    private identifyPreconditions;
    private assessFailureImpacts;
    private calculateRecoveryTime;
    private extractResourceContext;
    private calculateResourceMetadata;
    private extractCoordinationContext;
    private calculateCoordinationMetadata;
    private isContextRelevant;
    private getDefaultConfig;
    private getDefaultContext;
    private convertToTrace;
    private maintainSlidingWindow;
    private generatePatternClusters;
    private calculateCentroid;
    private calculateStabilityFromData;
    private detectAnomalies;
    private generateInsights;
    private calculateOverallConfidence;
    private calculateAverageLatency;
    private calculateAverageSize;
    private calculateReliability;
    private calculateCommunicationEfficiency;
    private calculateResourceStatistics;
    private analyzeTrends;
    private detectSeasonality;
    private detectSeasonalitySimple;
    private calculateAutocorrelation;
    private detectCyclePeriod;
    private calculateSeasonalAmplitude;
    private detectResourceAnomalies;
    private generateResourceOptimizations;
    private getSeverityMultiplier;
    private estimateTimeToFailure;
    private calculatePredictionConfidence;
    private identifyAffectedComponents;
    private generatePreventionActions;
    private calculateRiskLevel;
    private getRiskScore;
    private identifyOptimalConditions;
    private identifyCommonFailures;
    private calculateStability;
}
//# sourceMappingURL=pattern-recognition-engine.d.ts.map