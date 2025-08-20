/**
 * @fileoverview Complete Intelligence System Implementation
 *
 * Stub implementation for the main intelligence system
 */
import type { IntelligenceSystemConfig, IntelligenceSystem, AgentId, SwarmId, TaskPrediction, MultiHorizonTaskPrediction, AgentLearningState, AgentHealth, PerformanceOptimizationForecast, KnowledgeTransferPrediction, EmergentBehaviorPrediction, AdaptiveLearningUpdate, SystemHealthSummary, ForecastHorizon } from './types';
/**
 * Complete Intelligence System - Main implementation
 */
export declare class CompleteIntelligenceSystem implements IntelligenceSystem {
    private config;
    private initialized;
    constructor(config: IntelligenceSystemConfig);
    predictTaskDuration(agentId: AgentId, taskType: string, context?: Record<string, unknown>): Promise<TaskPrediction>;
    predictTaskDurationMultiHorizon(agentId: AgentId, taskType: string, context?: Record<string, unknown>): Promise<MultiHorizonTaskPrediction>;
    getAgentLearningState(agentId: AgentId): AgentLearningState | null;
    updateAgentPerformance(agentId: AgentId, success: boolean, metadata?: Record<string, unknown>): void;
    getAgentHealth(agentId: AgentId): AgentHealth | null;
    forecastPerformanceOptimization(swarmId: SwarmId, horizon?: ForecastHorizon): Promise<PerformanceOptimizationForecast>;
    predictKnowledgeTransferSuccess(sourceSwarm: SwarmId, targetSwarm: SwarmId, patterns: unknown[]): Promise<KnowledgeTransferPrediction>;
    private analyzePatternComplexity;
    predictEmergentBehavior(): Promise<EmergentBehaviorPrediction>;
    updateAdaptiveLearningModels(): Promise<AdaptiveLearningUpdate>;
    getSystemHealth(): SystemHealthSummary;
    /**
     * Convert ForecastHorizon string to days for calculations
     */
    private convertHorizonToDays;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=intelligence-system.d.ts.map