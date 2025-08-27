/**
 * @fileoverview Epic Lifecycle Service - Portfolio Kanban Management
 *
 * Service for managing epic lifecycle through Portfolio Kanban states.
 * Handles epic progression, gate criteria, and WSJF prioritization.
 *
 * SINGLE RESPONSIBILITY: Epic lifecycle and Portfolio Kanban management
 * FOCUSES ON: State transitions, gate validation, epic progression tracking
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../types';
import type { EpicBlocker, GateCriterion, PortfolioKanbanState, WSJFScore } from '../types/epic-management';
/**
 * Epic lifecycle service configuration
 */
export interface EpicLifecycleConfig {
    readonly analysisTimeLimit: number;
    readonly maxEpicsPerState: number;
    readonly autoProgressEnabled: boolean;
    readonly wsjfUpdateFrequency: number;
    readonly gateValidationStrict: boolean;
}
/**
 * Epic progression result
 */
export interface EpicProgressionResult {
    readonly success: boolean;
    readonly newState: PortfolioKanbanState;
    readonly previousState: PortfolioKanbanState;
    readonly blockers: EpicBlocker[];
    readonly unmetCriteria: GateCriterion[];
    readonly recommendations: string[];
    readonly nextActions: string[];
}
/**
 * Portfolio Kanban metrics
 */
export interface PortfolioKanbanMetrics {
    readonly stateDistribution: Record<PortfolioKanbanState, number>;
    readonly averageLeadTime: number;
    readonly averageCycleTime: number;
    readonly throughput: number;
    readonly blockerCount: number;
    readonly wsjfScoreDistribution: {
        min: number;
        max: number;
        avg: number;
    };
    readonly flowEfficiency: number;
}
/**
 * WSJF calculation result
 */
export interface WSJFCalculationResult {
    readonly epicId: string;
    readonly currentScore: WSJFScore;
    readonly previousScore?: WSJFScore;
    readonly rankChange: number;
    readonly confidence: number;
    readonly recommendedActions: string[];
}
/**
 * Epic Lifecycle Service for Portfolio Kanban management
 */
export declare class EpicLifecycleService {
    [x: number]: any;
    private readonly logger;
    private epics;
    private wsjfScores;
    private blockers;
    constructor(config: EpicLifecycleConfig, logger: Logger);
    /**
     * Progress epic through Portfolio Kanban states
     */
    progressEpicState(epicId: string, targetState: PortfolioKanbanState, _gateEvidence?: Record<string, string[]>): Promise<EpicProgressionResult>;
    /**
     * Calculate and update WSJF scores
     */
    calculateWSJFScore(input: {
        epicId: string;
        businessValue: number;
        urgency: number;
        riskReduction: number;
        opportunityEnablement: number;
        size: number;
        scoredBy: string;
        confidence: number;
    }): Promise<WSJFCalculationResult>;
    /**
     * Add blocker to epic
     */
    addEpicBlocker(epicId: string, blockerData: Omit<EpicBlocker, 'id|identifiedAt'>, : any): Promise<string>;
    blockers: Map<string, EpicBlocker[]>;
}
//# sourceMappingURL=epic-lifecycle-service.d.ts.map