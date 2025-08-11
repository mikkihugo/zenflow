/**
 * Persistent Learning System for Ephemeral Swarms.
 *
 * While swarm instances are ephemeral (temporary), their knowledge and learnings.
 * Are persistent and shared across all future swarm instances.
 */
/**
 * @file Coordination system: persistent-learning-system.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
import type { AgentType } from '../types/agent-types.ts';
export interface AgentKnowledge {
    agentType: AgentType;
    experiences: Experience[];
    patterns: LearnedPattern[];
    capabilities: CapabilityEvolution;
    performance: PerformanceHistory;
    relationships: AgentRelationships;
    lastUpdated: Date;
    version: number;
}
export interface Experience {
    id: string;
    timestamp: Date;
    swarmId: string;
    taskType: string;
    context: TaskContext;
    actions: Action[];
    outcome: TaskOutcome;
    lessons: string[];
    confidence: number;
}
export interface LearnedPattern {
    id: string;
    pattern: string;
    frequency: number;
    successRate: number;
    contexts: string[];
    examples: string[];
    discovered: Date;
    lastReinforced: Date;
}
export interface CapabilityEvolution {
    baseCapabilities: string[];
    acquiredSkills: AcquiredSkill[];
    specializations: Specialization[];
    adaptations: Adaptation[];
}
export interface AcquiredSkill {
    skill: string;
    proficiency: number;
    acquiredAt: Date;
    lastUsed: Date;
    usageCount: number;
    successRate: number;
}
export interface Specialization {
    domain: string;
    expertise: number;
    keyPatterns: string[];
    tools: string[];
    bestPractices: string[];
}
export interface Adaptation {
    trigger: string;
    change: string;
    impact: string;
    timestamp: Date;
}
export interface PerformanceHistory {
    totalTasks: number;
    successfulTasks: number;
    averageExecutionTime: number;
    qualityScores: number[];
    improvementTrend: number;
    benchmarks: PerformanceBenchmark[];
}
export interface PerformanceBenchmark {
    metric: string;
    value: number;
    timestamp: Date;
    context: string;
}
export interface AgentRelationships {
    collaborations: Collaboration[];
    synergies: Synergy[];
    conflicts: Conflict[];
}
export interface Collaboration {
    partnerAgentType: AgentType;
    taskTypes: string[];
    successRate: number;
    synergy: number;
    frequency: number;
}
export interface Synergy {
    combination: AgentType[];
    effect: string;
    multiplier: number;
    discoveredAt: Date;
}
export interface Conflict {
    conflictWith: AgentType;
    issue: string;
    resolution: string;
    occurrence: number;
}
export interface TaskContext {
    domain: string;
    complexity: 'low' | 'medium' | 'high' | 'extreme';
    timeConstraints: boolean;
    resources: string[];
    dependencies: string[];
    stakeholders: string[];
}
export interface Action {
    id: string;
    timestamp: Date;
    action: string;
    parameters: Record<string, any>;
    duration: number;
    success: boolean;
    impact: number;
}
export interface TaskOutcome {
    success: boolean;
    quality: number;
    efficiency: number;
    stakeholderSatisfaction: number;
    lessonsLearned: string[];
    improvements: string[];
    failures: string[];
}
/**
 * Manages persistent learning across ephemeral swarm instances.
 *
 * @example
 */
export declare class PersistentLearningSystem extends EventEmitter {
    private eventBus;
    private logger?;
    private agentKnowledge;
    private globalPatterns;
    private swarmMemories;
    private crossSwarmLearnings;
    constructor(eventBus: IEventBus, logger?: ILogger | undefined);
    /**
     * When a new swarm is created, inject accumulated knowledge.
     *
     * @param swarmId
     * @param agentTypes
     */
    injectKnowledgeIntoSwarm(swarmId: string, agentTypes: AgentType[]): Promise<void>;
    /**
     * Collect learnings when a swarm completes.
     *
     * @param swarmId
     * @param swarmResults
     */
    collectSwarmLearnings(swarmId: string, swarmResults: SwarmResults): Promise<void>;
    /**
     * Process individual agent learnings.
     *
     * @param agentResult
     * @param swarmMemory
     */
    private processAgentLearnings;
    /**
     * Extract patterns from agent behavior.
     *
     * @param knowledge
     * @param agentResult
     */
    private extractAgentPatterns;
    /**
     * Update agent capabilities based on performance.
     *
     * @param knowledge
     * @param agentResult
     */
    private updateAgentCapabilities;
    /**
     * Update agent relationships based on collaboration.
     *
     * @param knowledge
     * @param agentResult
     * @param swarmMemory
     */
    private updateAgentRelationships;
    /**
     * Filter relevant knowledge for a new swarm.
     *
     * @param knowledge
     * @param _swarmMemory
     */
    private filterRelevantKnowledge;
    /**
     * Get cross-swarm insights for new swarm.
     *
     * @param agentTypes
     */
    private getCrossSwarmInsights;
    /**
     * Initialize knowledge for a new agent type.
     *
     * @param agentType
     */
    private initializeAgentKnowledge;
    /**
     * Extract global patterns across all swarms.
     *
     * @param swarmResults
     */
    private extractGlobalPatterns;
    /**
     * Update cross-swarm learnings.
     *
     * @param swarmResults
     */
    private updateCrossSwarmLearnings;
    /**
     * Archive swarm memory for future reference.
     *
     * @param swarmId
     * @param swarmResults
     */
    private archiveSwarmMemory;
    /**
     * Setup event handlers.
     */
    private setupEventHandlers;
    /**
     * Start periodic learning processes.
     */
    private startPeriodicLearning;
    /**
     * Consolidate and optimize learnings.
     */
    private consolidateLearnings;
    /**
     * Get knowledge summary for an agent type.
     *
     * @param agentType
     */
    getAgentKnowledgeSummary(agentType: AgentType): AgentKnowledgeSummary | null;
}
interface SwarmResults {
    swarmId: string;
    context: string;
    overallSuccess: number;
    efficiency: number;
    quality: number;
    agentResults: AgentResult[];
    learnings: any[];
    insights?: Insight[];
}
interface AgentResult {
    agentId: string;
    agentType: AgentType;
    taskType: string;
    context: TaskContext;
    actions: Action[];
    outcome: TaskOutcome;
    executionTime: number;
    lessonsLearned: string[];
    confidence: number;
}
interface Insight {
    type: 'pattern' | 'improvement' | 'risk' | 'optimization';
    description: string;
    confidence: number;
    impact?: number;
}
interface AgentKnowledgeSummary {
    agentType: AgentType;
    totalExperiences: number;
    successRate: number;
    topPatterns: Array<{
        pattern: string;
        successRate: number;
    }>;
    specializations: Array<{
        domain: string;
        expertise: number;
    }>;
    lastUpdated: Date;
}
export default PersistentLearningSystem;
//# sourceMappingURL=persistent-learning-system.d.ts.map