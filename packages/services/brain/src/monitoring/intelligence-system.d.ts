/**
 * @fileoverview Complete Intelligence System Implementation
 *
 * Stub implementation for the main intelligence system
 */
import type { AgentId, AgentLearningState, IntelligenceSystem, IntelligenceSystemConfig, MultiHorizonTaskPrediction } from './types';
/**
 * Complete Intelligence System - Main implementation
 */
export declare class CompleteIntelligenceSystem implements IntelligenceSystem {
    constructor(config: IntelligenceSystemConfig);
    predictTaskDurationMultiHorizon(agentId: AgentId, taskType: string, context?: Record<string, unknown>): Promise<MultiHorizonTaskPrediction>;
    getAgentLearningState(agentId: AgentId): AgentLearningState | null;
    logger: any;
    debug(: any, { ')      agentId:agentId.id,: status, overallScore: overallHealth, responseTime: agentHealth, metrics, responseTime, errorRate: agentHealth, metrics, errorRate, }: {
        ")      agentId:agentId.id,": any;
        overallScore: any;
        responseTime: any;
        metrics: any;
        errorRate: any;
    }): any;
}
//# sourceMappingURL=intelligence-system.d.ts.map