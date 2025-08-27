/**
 * @fileoverview Complete Intelligence System Implementation
 *
 * Stub implementation for the main intelligence system
 */
import type { AgentId, IntelligenceSystem, IntelligenceSystemConfig, TaskPrediction } from './types';
/**
 * Complete Intelligence System - Main implementation
 */
export declare class CompleteIntelligenceSystem implements IntelligenceSystem {
    constructor(config: IntelligenceSystemConfig);
    predictTaskDuration(agentId: AgentId, taskType: string, context?: Record<string, unknown>): Promise<TaskPrediction>;
}
//# sourceMappingURL=intelligence-system.d.ts.map