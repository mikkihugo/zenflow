/**
 * @fileoverview Epic Owner Manager - Clean DI-based SAFe Epic Lifecycle Management
 *
 * Manages epic lifecycle through Portfolio Kanban states with WSJF prioritization.
 * Uses clean dependency injection for core SAFe services and optional AI enhancements.
 * AI features are completely optional and injected via @claude-zen/foundation DI system.
 *
 * Core SAFe Features:
 * - Portfolio Kanban state management
 * - WSJF scoring and prioritization
 * - Business case development
 * - Epic lifecycle tracking
 * - Stakeholder coordination
 *
 * Optional AI Enhancements (injected via DI):
 * - Brain Coordinator for intelligent decision making
 * - Performance tracking and telemetry
 * - Workflow automation
 * - Interactive approvals via AGUI
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */
import type { ConversationOrchestrator } from '../../teamwork';
import type { WorkflowEngine } from '@claude-zen/workflows';
import type { OptionalAIEnhancements } from '../interfaces/ai-enhancements';
import type { Logger, MemorySystem, PortfolioEpic } from '../types';
import type { EpicOwnerManagerConfig } from '../types/epic-management';
import { PortfolioKanbanState } from '../types/epic-management';
/**
 * Epic Owner Manager - Optimal SAFe architecture with full @claude-zen integration
 *
 * Leverages proven @claude-zen packages:
 * - @claude-zen/event-system: Type-safe event handling
 * - @claude-zen/workflows: Ceremony and process orchestration
 * - ../../teamwork: Cross-stakeholder collaboration
 * - @claude-zen/agent-monitoring: Performance tracking and health monitoring
 * - @claude-zen/foundation: Logging, DI, error handling, telemetry
 * - Event-driven approval architecture (clean separation from UI)
 */
export declare class EpicOwnerManager extends EventBus {
    private readonly config;
    private readonly logger;
    private readonly memorySystem;
    private state;
    private initialized;
    private lifecycleService?;
    private businessCaseService?;
    private readonly workflowEngine?;
    private readonly performanceTracker;
    private readonly approvalWorkflow;
    private readonly aiEnhancements;
    constructor(config: EpicOwnerManagerConfig, _logger: Logger, _memorySystem: MemorySystem, workflowEngine?: WorkflowEngine, conversationOrchestrator?: ConversationOrchestrator, aiEnhancements?: OptionalAIEnhancements);
    /**
     * Initialize Epic Owner Manager with service delegation
     */
    initialize(): Promise<void>;
    /**
     * Progress epic through Portfolio Kanban - delegates to EpicLifecycleService
     */
    progressEpic(epicId: string, targetState: PortfolioKanbanState, evidence?: Record<string, string[]>): Promise<{
        success: boolean;
        newState: PortfolioKanbanState;
        recommendations: string[];
        nextActions: string[];
    }>;
    /**
     * Calculate WSJF score for epic with optional AI enhancement
     */
    calculateEpicWSJF(input: {
        epicId: string;
        businessValue: number;
        urgency: number;
        riskReduction: number;
        opportunityEnablement: number;
        size: number;
        scoredBy: string;
    }): Promise<{
        wsjfScore: number;
        rank: number;
        rankChange: number;
        recommendations: string[];
    }>;
    /**
     * Create epic business case with optional AI enhancement and workflow automation
     */
    createEpicBusinessCase(input: {
        epicId: string;
        businessHypothesis: {
            problemStatement: string;
            targetCustomers: string[];
            proposedSolution: string;
            expectedOutcome: string;
        };
        financialInputs: {
            investmentRequired: number;
            developmentCost: number;
            operationalCost: number;
            expectedRevenue: number;
        };
        risks: Array<{
            description: string;
            category: 'technical|market|financial|regulatory|operational;;
            probability: number;
            impact: number;
            owner: string;
        }>;
        assumptions: string[];
    }): Promise<{
        businessCaseId: string;
        recommendation: 'proceed|defer|pivot|stop;;
        financialViability: boolean;
        roi: number;
        paybackPeriod: number;
    }>;
    /**
     * Get prioritized epic portfolio - uses SafeCollectionUtils
     */
    getPrioritizedPortfolio(): Promise<Array<{
        epic: PortfolioEpic;
        wsjfScore: number;
        rank: number;
        stage: PortfolioKanbanState;
    }>>;
    /**
     * Add epic blocker - delegates to EpicLifecycleService
     */
    addEpicBlocker(epicId: string, blockerData: {
        description: string;
        category: 'technical|business|resource|external|regulatory;;
        severity: 'low|medium|high|critical;;
        owner: string;
        resolutionPlan: string[];
        impact: string;
    }): Promise<string>;
    /**
     * Resolve epic blocker - delegates to EpicLifecycleService
     */
    resolveEpicBlocker(epicId: string, blockerId: string): Promise<void>;
    /**
     * Generate epic timeline - uses SafeDateUtils
     */
    generateEpicTimeline(epicId: string, estimatedMonths: number): Promise<{
        timelineId: string;
        phases: Array<{
            name: string;
            start: Date;
            end: Date;
            duration: number;
            milestones: string[];
        }>;
        criticalPath: string[];
    }>;
    priority: 'high';
}
//# sourceMappingURL=epic-owner-manager.d.ts.map