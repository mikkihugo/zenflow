/**
 * Auto-Agent Assignment System.
 * Intelligently assigns optimal agents based on file types, operations, and agent capabilities.
 */
/**
 * @file Coordination system: auto-agent-assignment.
 */
import type { AgentAssignment, AgentContext, AgentCoordinator, AgentInfo, Operation, OperationContext, WorkloadBalance } from './hook-system-core.ts';
export declare class IntelligentAgentAssignor implements AgentCoordinator {
    private readonly agentCapabilityMap;
    private readonly fileTypeAgentMap;
    private readonly workloadTracker;
    constructor();
    assignOptimalAgent(context: OperationContext): Promise<AgentAssignment>;
    loadAgentContext(agent: AgentInfo): Promise<AgentContext>;
    updateAgentWorkload(agent: AgentInfo, operation: Operation): Promise<void>;
    balanceWorkload(agents: AgentInfo[]): Promise<WorkloadBalance>;
    private analyzeOperation;
    private detectFileType;
    private classifyOperation;
    private assessComplexity;
    private inferRequiredSkills;
    private identifySpecialRequirements;
    private getCandidateAgents;
    private getAgentsByOperationType;
    private scoreAgents;
    private calculateAgentScore;
    private calculateSkillMatch;
    private generateReasoning;
    private getHistoricalPerformanceScore;
    private estimatePerformance;
    private meetsRequirements;
    private calculateProjectedEfficiency;
    private loadAgentMemory;
    private loadAgentPreferences;
    private loadLearningData;
    private loadPerformanceHistory;
    private estimateOperationDuration;
    private persistWorkloadUpdate;
    private createAgentInfo;
    private initializeCapabilityMappings;
    private initializeFileTypeMappings;
}
//# sourceMappingURL=auto-agent-assignment.d.ts.map