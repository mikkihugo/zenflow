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

import { PerformanceTracker, TelemetryManager } from '@claude-zen/foundation';
import type { ConversationOrchestrator } from '../../teamwork';
// import { EventBus } from '@claude-zen/event-system';
// import type { EventPriority } from '@claude-zen/event-system';
import type { WorkflowEngine } from '@claude-zen/workflows';
import { getLogger } from '../config/logging-config';
import {
  ApprovalWorkflowManager,
  createApprovalRequest,
} from '../events/approval-events';
import type { OptionalAIEnhancements } from '../interfaces/ai-enhancements';
import { BusinessCaseService } from '../services/business-case-service';
import { EpicLifecycleService } from '../services/epic-lifecycle-service';
import type {
  Logger,
  MemorySystem,
  PortfolioEpic,
} from '../types';
import type {
  EpicBusinessCase,
  EpicOwnerManagerConfig,
} from '../types/epic-management';
import { PortfolioKanbanState } from '../types/epic-management';
import { SafeCollectionUtils } from '../utilities/collections/safe-collections';
import { SafeDateUtils } from '../utilities/date/safe-date-utils';
import { SafeValidationUtils } from '../utilities/validation/safe-validation';

/**
 * Epic owner manager state
 */
interface EpicOwnerState {
  readonly isInitialized: boolean;
  readonly activeEpicsCount: number;
  readonly portfolioValue: number;
  readonly lastWSJFUpdate: Date|null;
  readonly businessCasesCount: number;
}

/**
 * Epic performance metrics
 */
interface EpicPerformanceMetrics {
  readonly totalEpics: number;
  readonly completedEpics: number;
  readonly averageLeadTime: number; // days
  readonly portfolioThroughput: number; // epics per PI
  readonly wsjfScoreDistribution: { min: number; max: number; avg: number };
  readonly businessValueRealized: number;
}

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
export class EpicOwnerManager extends EventBus {
  private readonly config: EpicOwnerManagerConfig;
  private readonly logger: Logger;
  private readonly memorySystem: MemorySystem;
  // private readonly eventBus: EventBus;
  private state: EpicOwnerState;
  private initialized = false;

  // Core SAFe services (initialized during setup)
  private lifecycleService?: EpicLifecycleService;
  private businessCaseService?: BusinessCaseService;

  // @claude-zen package integrations
  private readonly workflowEngine?: WorkflowEngine;

  // Infrastructure services (foundation - always available)
  private readonly performanceTracker: PerformanceTracker;
  private readonly approvalWorkflow: ApprovalWorkflowManager;

  // Optional AI enhancements (injected via DI)
  private readonly aiEnhancements: OptionalAIEnhancements;

  constructor(
    config: EpicOwnerManagerConfig,
    _logger: Logger,
    _memorySystem: MemorySystem,
    // @claude-zen package services (optional but recommended)
    workflowEngine?: WorkflowEngine,
    conversationOrchestrator?: ConversationOrchestrator,
    // Optional AI enhancements
    aiEnhancements?: OptionalAIEnhancements
  ) {
    super();
    this.config = config;
    this.logger = getLogger('EpicOwnerManager');'
    this.memorySystem = memorySystem;
    // this.eventBus = eventBus;
    this.state = this.initializeState();

    // Initialize @claude-zen integrations
    this.workflowEngine = workflowEngine;
    this.conversationOrchestrator = conversationOrchestrator;

    // Initialize infrastructure services (foundation - always available)
    this.performanceTracker = new PerformanceTracker();
    this.telemetryManager = new TelemetryManager({
      serviceName: 'epic-owner-manager',
      enableTracing: true,
      enableMetrics: true,
    });
    this.approvalWorkflow = new ApprovalWorkflowManager();

    // Store optional AI enhancements
    this.aiEnhancements = aiEnhancements||{};

    this.setupEventHandlers();
  }

  /**
   * Initialize Epic Owner Manager with service delegation
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Epic Owner Manager already initialized');'
      return;
    }

    try {
      this.logger.info('Initializing Epic Owner Manager...');'

      // Delegate to EpicLifecycleService for Portfolio Kanban management
      if (this.config.enablePortfolioKanban) {
        this.lifecycleService = new EpicLifecycleService(
          {
            analysisTimeLimit: this.config.epicAnalysisTimeLimit,
            maxEpicsPerState: this.config.maxActiveEpics,
            autoProgressEnabled: true,
            wsjfUpdateFrequency: this.config.wsjfUpdateFrequency,
            gateValidationStrict: true,
          },
          this.logger
        );
      }

      // Delegate to BusinessCaseService for investment analysis
      if (this.config.enableBusinessCaseManagement) {
        this.businessCaseService = new BusinessCaseService(
          {
            discountRate: 8, // 8% discount rate
            analysisHorizon: 5, // 5 years
            riskThreshold: 70,
            roiThreshold: 15, // 15% ROI threshold
            paybackPeriodLimit: 36, // 36 months
            confidenceThreshold: 70,
          },
          this.logger
        );
      }

      // Restore state from memory if available
      await this.restoreState();

      this.initialized = true;
      this.logger.info('Epic Owner Manager initialized successfully');'

      this.emit('initialized', timestamp: SafeDateUtils.formatISOString() );'
    } catch (error) {
      this.logger.error('Failed to initialize Epic Owner Manager:', error);'
      throw error;
    }
  }

  /**
   * Progress epic through Portfolio Kanban - delegates to EpicLifecycleService
   */
  async progressEpic(
    epicId: string,
    targetState: PortfolioKanbanState,
    evidence?: Record<string, string[]>
  ): Promise<{
    success: boolean;
    newState: PortfolioKanbanState;
    recommendations: string[];
    nextActions: string[];
  }> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Progressing epic through Portfolio Kanban', {'
      epicId,
      targetState,
    });

    if (!this.lifecycleService) {
      throw new Error('Lifecycle service not initialized');'
    }

    const result = await this.lifecycleService.progressEpicState(
      epicId,
      targetState,
      evidence
    );

    // Update state if progression was successful
    if (result.success && targetState === PortfolioKanbanState.DONE) {
      this.state = {
        ...this.state,
        activeEpicsCount: Math.max(0, this.state.activeEpicsCount - 1),
      };
      await this.persistState();
    }

    this.emit('epic-progressed', {'
      epicId,
      newState: result.newState,
      success: result.success,
      timestamp: SafeDateUtils.formatISOString(),
    });

    return {
      success: result.success,
      newState: result.newState,
      recommendations: result.recommendations,
      nextActions: result.nextActions,
    };
  }

  /**
   * Calculate WSJF score for epic with optional AI enhancement
   */
  async calculateEpicWSJF(input: {
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
  }> {
    if (!this.initialized) await this.initialize();

    const _timer = this.performanceTracker.startTimer('calculate_wsjf');'

    try {
      this.logger.info('Calculating WSJF score', { epicId: input.epicId });'

      if (!this.lifecycleService) {
        throw new Error('Lifecycle service not initialized');'
      }

      // Standard SAFe WSJF calculation via lifecycle service
      const result = await this.lifecycleService.calculateWSJFScore({
        ...input,
        confidence: 85, // Default confidence level
      });

      // Optional AI enhancement for WSJF analysis
      const enhancedResult = {
        wsjfScore: result.currentScore.wsjfScore,
        rank: 1, // Would be calculated from all epics
        rankChange: result.rankChange,
        recommendations: result.recommendedActions,
      };

      if (this.aiEnhancements.brainCoordinator) {
        try {
          const aiAnalysis =
            await this.aiEnhancements.brainCoordinator.analyzeWSJF({
              epicId: input.epicId,
              businessValue: input.businessValue,
              urgency: input.urgency,
              riskReduction: input.riskReduction,
              opportunityEnablement: input.opportunityEnablement,
              size: input.size,
              context: { scoredBy: input.scoredBy },
            });

          // Enhance recommendations with AI insights
          enhancedResult.recommendations = [
            ...enhancedResult.recommendations,
            ...aiAnalysis.recommendations,
          ];

          this.logger.debug('WSJF enhanced with AI analysis', {'
            epicId: input.epicId,
            confidenceLevel: aiAnalysis.confidenceLevel,
          });
        } catch (error) {
          this.logger.warn(
            'AI WSJF enhancement failed, using standard calculation:',
            error
          );
        }
      }

      // Update state
      this.state = {
        ...this.state,
        lastWSJFUpdate: new Date(),
      };
      await this.persistState();

      this.emit('wsjf-calculated', {'
        epicId: input.epicId,
        score: enhancedResult.wsjfScore,
        rank: enhancedResult.rankChange,
        timestamp: SafeDateUtils.formatISOString(),
      });

      this.performanceTracker.endTimer('calculate_wsjf');'
      this.telemetryManager.recordCounter('wsjf_calculations', 1);'

      return enhancedResult;
    } catch (error) {
      this.performanceTracker.endTimer('calculate_wsjf');'
      this.logger.error('WSJF calculation failed:', error);'
      throw error;
    }
  }

  /**
   * Create epic business case with optional AI enhancement and workflow automation
   */
  async createEpicBusinessCase(input: {
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
      category:|'technical|market|financial|regulatory|operational;
      probability: number;
      impact: number;
      owner: string;
    }>;
    assumptions: string[];
  }): Promise<{
    businessCaseId: string;
    recommendation: 'proceed|defer|pivot|stop;
    financialViability: boolean;
    roi: number;
    paybackPeriod: number;
  }> {
    if (!this.initialized) await this.initialize();

    const _timer = this.performanceTracker.startTimer('create_business_case');'

    try {
      this.logger.info('Creating epic business case', { epicId: input.epicId });'

      if (!this.businessCaseService) {
        throw new Error('Business case service not initialized');'
      }

      // Standard SAFe business case creation
      const businessCase = await this.businessCaseService.createBusinessCase({
        epicId: input.epicId,
        businessHypothesis: input.businessHypothesis,
        marketData: {
          marketSize: 10000000, // Would be retrieved from market data service
          targetMarketSegment: input.businessHypothesis.targetCustomers,
          competitiveAnalysis: [],
          marketTrends: [],
          customerNeeds: [],
          marketEntry: {
            approach: 'direct',
            timeline: 18,
            investmentRequired: input.financialInputs.investmentRequired,
            expectedMarketShare: 5,
            keySuccessFactors: ['Product differentiation'],
          },
        },
        financialInputs: {
          ...input.financialInputs,
          revenueAssumptions: [
            {
              revenue: input.financialInputs.expectedRevenue,
              customerCount: 1000,
              averageRevenuePerCustomer:
                input.financialInputs.expectedRevenue / 1000,
              assumptions: ['Base revenue projection'],
            },
          ],
        },
        risks: input.risks.map((risk) => ({
          ...risk,
          riskScore: (risk.probability * risk.impact) / 10, // Calculate risk score from probability and impact
        })),
        assumptions: input.assumptions,
      });

      // Standard business case analysis
      const analysis = await this.businessCaseService.analyzeBusinessCase(
        businessCase.id
      );

      // Optional workflow automation for approval process
      if (this.aiEnhancements.workflowEngine) {
        try {
          await this.aiEnhancements.workflowEngine.executeWorkflow(
            'business-case-approval',
            {
              businessCaseId: businessCase.id,
              epicId: input.epicId,
              recommendation: analysis.recommendation.recommendation,
              financialViability: analysis.financialViability.isViable,
            }
          );
          this.logger.info('Business case approval workflow initiated');'
        } catch (error) {
          this.logger.warn('Workflow automation failed:', error);'
        }
      }

      // Update state
      this.state = {
        ...this.state,
        businessCasesCount: this.state.businessCasesCount + 1,
      };
      await this.persistState();

      this.emit('business-case-created', {'
        businessCaseId: businessCase.id,
        epicId: input.epicId,
        recommendation: analysis.recommendation.recommendation,
        timestamp: SafeDateUtils.formatISOString(),
      });

      this.performanceTracker.endTimer('create_business_case');'
      this.telemetryManager.recordCounter('business_cases_created', 1);'

      return {
        businessCaseId: businessCase.id,
        recommendation: analysis.recommendation.recommendation,
        financialViability: analysis.financialViability.isViable,
        roi: analysis.financialViability.roi,
        paybackPeriod: analysis.financialViability.paybackPeriod,
      };
    } catch (error) {
      this.performanceTracker.endTimer('create_business_case');'
      this.logger.error('Business case creation failed:', error);'
      throw error;
    }
  }

  /**
   * Get prioritized epic portfolio - uses SafeCollectionUtils
   */
  async getPrioritizedPortfolio(): Promise<
    Array<{
      epic: PortfolioEpic;
      wsjfScore: number;
      rank: number;
      stage: PortfolioKanbanState;
    }>
  > {
    if (!this.initialized) await this.initialize();

    this.logger.info('Retrieving prioritized epic portfolio');'

    if (!this.lifecycleService) {
      throw new Error('Lifecycle service not initialized');'
    }

    const backlog = await this.lifecycleService.getPrioritizedBacklog();

    // Transform to include stage information
    const portfolio = backlog.map((item, _index) => ({
      epic: item.epic,
      wsjfScore: item.wsjfScore.wsjfScore,
      rank: item.rank,
      stage: item.epic.status as PortfolioKanbanState,
    }));

    // Use SafeCollectionUtils for additional sorting if needed
    const _filteredPortfolio = SafeCollectionUtils.filterByPriority(
      portfolio.map((p) => ({
        ...p.epic,
        priority:
          p.epic.priority > 80
            ? 'critical''
            : p.epic.priority > 60
              ? 'high''
              : 'medium',
      })),
      ['critical', 'high', 'medium']'
    );

    this.logger.info('Portfolio retrieved', { epicCount: portfolio.length });'

    return portfolio;
  }

  /**
   * Add epic blocker - delegates to EpicLifecycleService
   */
  async addEpicBlocker(
    epicId: string,
    blockerData: {
      description: string;
      category:|'technical|business|resource|external|regulatory;
      severity: 'low|medium|high|critical;
      owner: string;
      resolutionPlan: string[];
      impact: string;
    }
  ): Promise<string> {
    if (!this.initialized) await this.initialize();

    this.logger.warn('Adding epic blocker', {'
      epicId,
      severity: blockerData.severity,
    });

    if (!this.lifecycleService) {
      throw new Error('Lifecycle service not initialized');'
    }

    const blockerId = await this.lifecycleService.addEpicBlocker(epicId, {
      ...blockerData,
      dependencies: [],
    });

    this.emit('blocker-added', {'
      epicId,
      blockerId,
      severity: blockerData.severity,
      timestamp: SafeDateUtils.formatISOString(),
    });

    return blockerId;
  }

  /**
   * Resolve epic blocker - delegates to EpicLifecycleService
   */
  async resolveEpicBlocker(epicId: string, blockerId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Resolving epic blocker', { epicId, blockerId });'

    if (!this.lifecycleService) {
      throw new Error('Lifecycle service not initialized');'
    }

    await this.lifecycleService.resolveEpicBlocker(epicId, blockerId);

    this.emit('blocker-resolved', {'
      epicId,
      blockerId,
      timestamp: SafeDateUtils.formatISOString(),
    });
  }

  /**
   * Generate epic timeline - uses SafeDateUtils
   */
  async generateEpicTimeline(
    epicId: string,
    estimatedMonths: number
  ): Promise<{
    timelineId: string;
    phases: Array<{
      name: string;
      start: Date;
      end: Date;
      duration: number;
      milestones: string[];
    }>;
    criticalPath: string[];
  }> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Generating epic timeline', { epicId, estimatedMonths });'

    const timeline = SafeDateUtils.generateEpicTimeline(
      new Date(),
      estimatedMonths
    );

    const enhancedPhases = timeline.phases.map((phase) => ({
      ...phase,
      milestones: [`${phase.name} completion`, 'Stakeholder review'],
    }));

    const result = {
      timelineId: `timeline-${epicId}-${Date.now()}`,`
      phases: enhancedPhases,
      criticalPath: ['Epic Hypothesis', 'Development', 'Validation'],
    };

    this.emit('timeline-generated', {'
      epicId,
      timelineId: result.timelineId,
      duration: estimatedMonths,
      timestamp: SafeDateUtils.formatISOString(),
    });

    return result;
  }

  /**
   * Get Portfolio Kanban metrics - delegates to EpicLifecycleService
   */
  async getPortfolioMetrics(): Promise<EpicPerformanceMetrics> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Retrieving portfolio metrics');'

    if (!this.lifecycleService) {
      throw new Error('Lifecycle service not initialized');'
    }

    const kanbanMetrics =
      await this.lifecycleService.getPortfolioKanbanMetrics();

    const completedCount =
      kanbanMetrics.stateDistribution[PortfolioKanbanState.DONE]||0;
    const totalCount = Object.values(kanbanMetrics.stateDistribution).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalEpics: totalCount,
      completedEpics: completedCount,
      averageLeadTime: kanbanMetrics.averageLeadTime,
      portfolioThroughput: kanbanMetrics.throughput,
      wsjfScoreDistribution: kanbanMetrics.wsjfScoreDistribution,
      businessValueRealized: completedCount * 1000000, // Mock calculation
    };
  }

  /**
   * Validate epic data - delegates to SafeValidationUtils
   */
  validateEpicData(epicData: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    this.logger.info('Validating epic data');'

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate using schema validation
    const epicValidation = SafeValidationUtils.validateEpic(epicData);
    if (!epicValidation.success) {
      errors.push(...epicValidation.error.errors.map((e) => e.message));
    }

    // Additional epic-specific validation
    if (epicData.wsjfScore && epicData.wsjfScore < 5) {
      warnings.push('Low WSJF score may indicate low priority');'
    }

    if (epicData.businessCase && !epicData.businessCase.financialProjection) {
      errors.push('Business case missing financial projection');'
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Epic approval using optimal event-driven architecture
   * Emits approval events for UI layer to handle, maintains business/UI separation
   */
  async approveEpic(
    epicId: string,
    approvalContext: {
      businessCase: EpicBusinessCase;
      wsjfScore: number;
      stakeholders: string[];
      deadline?: Date;
    }
  ): Promise<{
    requestId: string;
    status: 'pending|auto-approved';
    message: string;
  }> {
    if (!this.initialized) await this.initialize();

    const _timer = this.performanceTracker.startTimer('epic_approval');'

    try {
      // Auto-approve if conditions are met (business logic)
      const shouldAutoApprove = this.shouldAutoApproveEpic(
        epicId,
        approvalContext
      );

      if (shouldAutoApprove) {
        this.logger.info('Epic auto-approved', {'
          epicId,
          wsjfScore: approvalContext.wsjfScore,
        });

        // Emit approval completed event
        this.emit('approval-received', {'
          type: 'APPROVAL_RECEIVED',
          data: {
            requestId: `auto-${epicId}`,`
            approved: true,
            approvedBy: 'system',
            timestamp: new Date(),
          },
          priority: 'high',
        });

        return {
          requestId: `auto-${epicId}`,`
          status: 'auto-approved',
          message: 'Epic meets auto-approval criteria',
        };
      }

      // Create approval request for human review (event-driven)
      const approvalRequest = createApprovalRequest({
        type: 'epic',
        title: `Epic Approval: ${epicId}`,`
        description: `Business case: ${approvalContext.businessCase.id}, WSJF: ${approvalContext.wsjfScore}`,`
        priority: approvalContext.wsjfScore > 20 ? 'high' : 'medium',
        requestedBy: 'epic-owner-manager',
        approvers: approvalContext.stakeholders,
        deadline: approvalContext.deadline,
        context: {
          epicId,
          businessCaseId: approvalContext.businessCase.id,
          wsjfScore: approvalContext.wsjfScore,
        },
      });

      // Track approval workflow
      this.approvalWorkflow.trackApprovalRequest(approvalRequest);

      // Emit approval request event (UI layer will handle presentation)
      this.emit('request-approval', {'
        type: 'REQUEST_APPROVAL',
        data: approvalRequest,
        priority: approvalRequest.priority === 'high' ? 'high' : 'medium',
      });

      this.logger.info('Epic approval requested via event system', {'
        epicId,
        requestId: approvalRequest.requestId,
      });

      this.performanceTracker.endTimer('epic_approval');'
      this.telemetryManager.recordCounter('epic_approvals_requested', 1);'

      return {
        requestId: approvalRequest.requestId,
        status: 'pending',
        message: 'Approval request sent to stakeholders',
      };
    } catch (error) {
      this.performanceTracker.endTimer('epic_approval');'
      this.logger.error('Epic approval failed:', error);'
      throw error;
    }
  }

  /**
   * Business logic for auto-approval determination
   */
  private shouldAutoApproveEpic(
    _epicId: string,
    context: {
      businessCase: EpicBusinessCase;
      wsjfScore: number;
      stakeholders: string[];
    }
  ): boolean {
    // SAFe business rules for auto-approval
    return (
      context.wsjfScore >= this.config.autoApprovalWSJFThreshold &&
      context.businessCase.financialViability.roi >= 15 &&
      context.businessCase.financialViability.paybackPeriod <= 24
    );
  }

  /**
   * Get manager status and metrics
   */
  getStatus(): {
    initialized: boolean;
    state: EpicOwnerState;
    config: EpicOwnerManagerConfig;
    pendingApprovals: number;
    lastActivity: string;
  } {
    return {
      initialized: this.initialized,
      state: this.state,
      config: this.config,
      pendingApprovals: this.approvalWorkflow.getPendingApprovals().length,
      lastActivity: SafeDateUtils.formatISOString(),
    };
  }

  // Private helper methods

  /**
   * Initialize manager state
   */
  private initializeState(): EpicOwnerState {
    return {
      isInitialized: false,
      activeEpicsCount: 0,
      portfolioValue: 0,
      lastWSJFUpdate: null,
      businessCasesCount: 0,
    };
  }

  /**
   * Setup event handlers for coordination
   */
  private setupEventHandlers(): void {
    // Event handlers temporarily disabled due to event system resolution
    // this.eventBus.on('epic-state-changed', (data) => {'
    //   this.logger.info('Epic state changed', data);'
    //   this.emit('epic-updated', data);'
    // });
    // this.eventBus.on('wsjf-scores-updated', (data) => {'
    //   this.logger.info('WSJF scores updated', data);'
    //   this.emit('portfolio-rebalanced', data);'
    // });
    // this.eventBus.on('business-case-approved', (data) => {'
    //   this.logger.info('Business case approved', data);'
    //   this.emit('investment-approved', data);'
    // });
  }

  /**
   * Restore state from memory system
   */
  private async restoreState(): Promise<void> {
    try {
      const savedState = (await this.memorySystem.retrieve(
        'epic-owner-state')) as Partial<EpicOwnerState>|null;'
      if (savedState && typeof savedState ==='object') {'
        this.state = ...this.state, ...savedState ;
        this.logger.info('Epic owner state restored from memory');'
      }
    } catch (error) {
      this.logger.warn('Failed to restore state from memory:', error);'
    }
  }

  /**
   * Persist current state to memory system
   */
  private async persistState(): Promise<void> {
    try {
      await this.memorySystem.store('epic-owner-state', {'
        activeEpicsCount: this.state.activeEpicsCount,
        portfolioValue: this.state.portfolioValue,
        lastWSJFUpdate: this.state.lastWSJFUpdate,
        businessCasesCount: this.state.businessCasesCount,
      });
    } catch (error) {
      this.logger.warn('Failed to persist state to memory:', error);'
    }
  }
}

// Default export for backwards compatibility
export default EpicOwnerManager;
