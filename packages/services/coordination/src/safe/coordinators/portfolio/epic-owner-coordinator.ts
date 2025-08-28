/**
 * @fileoverview Epic Owner Coordinator - Portfolio Epic Lifecycle Management
 * 
 * Manages portfolio epics through their entire lifecycle:
 * - Epic ideation and business case development
 * - WSJF prioritization and portfolio kanban flow
 * - Cross-ART coordination and value delivery tracking
 * - Integration with TaskMaster for approval workflows
 * 
 * @author Claude-Zen SAFe Team
 * @since 1.0.0
 */

import { EventBus, getLogger } from '@claude-zen/foundation';
import type { 
  PortfolioEpic
} from '../../types';
import type {
  WSJFScore,
  EpicLifecycleStage,
  PortfolioKanbanState,
  EpicBusinessCase
} from '../../types/epic-management';
const logger = getLogger('safe-epic-owner-coordinator'');

// TaskMaster integration interface
interface TaskMasterApprovalRequest {
  id: string;
  type:'investment'|'scope_change'|'completion';
  epicId: string;
  title: string;
  description: string;
  requiredApprover: string;
  businessCase?: EpicBusinessCase;
  urgency:'low'|'medium'|'high';
  dueDate: Date;
  createdAt: Date;
}

export interface EpicOwnerEvents {
 'epic:ideated: {
    epic: PortfolioEpic;
    businessCase: EpicBusinessCase;
    timestamp: number;
  };
 'epic:prioritized: {
    epic: PortfolioEpic;
    wsjfScore: WSJFScore;
    priority: number;
    timestamp: number;
  };
 'epic:approval_requested: {
    epic: PortfolioEpic;
    approvalType:'investment'|'scope_change'|'completion';
    taskMasterRequest: TaskMasterApprovalRequest;
    timestamp: number;
  };
 'epic:approved: {
    epic: PortfolioEpic;
    approver: string;
    approvalNotes?: string;
    timestamp: number;
  };
 'epic:stage_changed: {
    epic: PortfolioEpic;
    fromStage: PortfolioKanbanState;
    toStage: PortfolioKanbanState;
    reason: string;
    timestamp: number;
  };
 'epic:value_delivered: {
    epic: PortfolioEpic;
    businessValue: number;
    metrics: Record<string, number>;
    timestamp: number;
  };
}

export class EpicOwnerCoordinator extends EventBus<EpicOwnerEvents> {
  private epics: Map<string, PortfolioEpic> = new Map();
  private businessCases: Map<string, EpicBusinessCase> = new Map();
  private wsjfScores: Map<string, WSJFScore> = new Map();

  constructor() {
    super();
    logger.info('EpicOwnerCoordinator initialized'');
  }

  /**
   * Create and ideate a new portfolio epic with business case
   */
  async ideateEpic(
    title: string, 
    description: string, 
    strategicTheme: string,
    businessCase: Partial<EpicBusinessCase>
  ): Promise<PortfolioEpic> {
    const epic: PortfolioEpic = {
      id: `epic-${Date.now()}`,
      title,
      description,
      businessValue: businessCase.expectedValue|| 0,
      status:'backlog,
      priority: 0
    };

    // Create business case using epic management types - will need to check actual structure
    const fullBusinessCase = businessCase as EpicBusinessCase;

    this.epics.set(epic.id, epic);
    this.businessCases.set(epic.id, fullBusinessCase);

    await this.emitSafe('epic:ideated,{
      epic,
      businessCase: fullBusinessCase,
      timestamp: Date.now()
    });

    logger.info(`Portfolio epic ideated: ${epic.title} (${epic.id})`);
    return epic;
  }

  /**
   * Calculate WSJF score and prioritize epic in portfolio backlog
   */
  async prioritizeEpic(epicId: string): Promise<WSJFScore> {
    const epic = this.epics.get(epicId);
    const businessCase = this.businessCases.get(epicId);
    
    if (!epic|| !businessCase) {
      throw new Error(`Epic not found: ${epicId}`);
    }

    // WSJF = (User/Business Value + Time Criticality + RR| OE Value) / Job Size
    const userBusinessValue = businessCase.expectedValue / 100000; // Normalize
    const timeCriticality = businessCase.costOfDelay / 10000; // Normalize
    const rroeValue = (businessCase.risks?.length|| 0) > 0 ? 3 : 1; // Risk reduction
    const jobSize = Math.max(businessCase.estimatedEffort / 40, 1); // Story points normalized

    const wsjfScore: WSJFScore = {
      userBusinessValue,
      timeCriticality,
      rroeValue,
      jobSize,
      totalScore: (userBusinessValue + timeCriticality + rroeValue) / jobSize
    };

    epic.wsjfScore = wsjfScore.totalScore;
    epic.updatedAt = new Date();
    this.epics.set(epicId, epic);

    await this.emitSafe('epic:prioritized,{
      epic,
      wsjfScore,
      priority: wsjfScore.totalScore,
      timestamp: Date.now()
    });

    logger.info(`Epic prioritized: ${epic.title} - WSJF: ${wsjfScore.totalScore.toFixed(2)}`);
    return wsjfScore;
  }

  /**
   * Request approval for epic investment decision via TaskMaster
   */
  async requestApproval(
    epicId: string, 
    approvalType:'investment'|'scope_change'|'completion
  ): Promise<TaskMasterApprovalRequest> {
    const epic = this.epics.get(epicId);
    const businessCase = this.businessCases.get(epicId);
    
    if (!epic|| !businessCase) {
      throw new Error(`Epic not found: ${epicId}`);
    }

    const approvalRequest: TaskMasterApprovalRequest = {
      id: `approval-${epic.id}-${approvalType}-${Date.now()}`,
      type: approvalType,
      epicId: epic.id,
      title: `${{approvalType} Approval: ${epic.title}}`,
      description: `Requesting ${approvalType} approval for portfolio epic: ${epic.description}`,
      requiredApprover: this.getRequiredApprover(approvalType),
      businessCase,
      urgency: epic.wsjfScore > 10 ?'high: epic.wsjfScore > 5 ?'medium:'low,
      dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
      createdAt: new Date()
    };

    await this.emitSafe('epic:approval_requested,{
      epic,
      approvalType,
      taskMasterRequest: approvalRequest,
      timestamp: Date.now()
    });

    logger.info(`Approval requested for epic: ${epic.title} - Type: ${approvalType}`);
    return approvalRequest;
  }

  /**
   * Move epic through lifecycle stages with proper governance
   */
  async moveEpicToStage(
    epicId: string, 
    toStage: PortfolioKanbanState, 
    reason: string
  ): Promise<void> {
    const epic = this.epics.get(epicId);
    if (!epic) {
      throw new Error(`Epic not found: ${epicId}`);
    }

    const fromStage = epic.lifecycleStage;
    
    // Validate stage transition
    if (!this.isValidStageTransition(fromStage, toStage)) {
      throw new Error(`Invalid stage transition: ${fromStage} -> ${toStage}`);
    }

    epic.lifecycleStage = toStage;
    epic.updatedAt = new Date();
    this.epics.set(epicId, epic);

    await this.emitSafe('epic:stage_changed,{
      epic,
      fromStage,
      toStage,
      reason,
      timestamp: Date.now()
    });

    logger.info(`Epic stage changed: ${epic.title} - ${fromStage} -> ${toStage}`);
  }

  /**
   * Track business value delivery and outcomes
   */
  async trackValueDelivery(
    epicId: string,
    businessValue: number,
    metrics: Record<string, number>
  ): Promise<void> {
    const epic = this.epics.get(epicId);
    if (!epic) {
      throw new Error(`Epic not found: ${epicId}`);
    }

    epic.businessValue = businessValue;
    epic.updatedAt = new Date();
    this.epics.set(epicId, epic);

    await this.emitSafe('epic:value_delivered,{
      epic,
      businessValue,
      metrics,
      timestamp: Date.now()
    });

    logger.info(`Value delivery tracked for epic: ${epic.title} - Value: $${businessValue}`);
  }

  /**
   * Get epic by ID
   */
  getEpic(epicId: string): PortfolioEpic| undefined {
    return this.epics.get(epicId);
  }

  /**
   * Get all epics sorted by WSJF score
   */
  getEpicsByPriority(): PortfolioEpic[] {
    return Array.from(this.epics.values())
      .sort((a, b) => (b.wsjfScore|| 0) - (a.wsjfScore|| 0);
  }

  // Private helper methods

  private getRequiredApprover(approvalType: string): string {
    switch (approvalType) {
      case'investment: return'lean-portfolio-management';
      case'scope_change: return'epic-owner';
      case'completion: return'business-owner';
      default: return'epic-owner';
    }
  }

  private isValidStageTransition(from: EpicLifecycleStage, to: EpicLifecycleStage): boolean {
    const validTransitions: Record<EpicLifecycleStage, EpicLifecycleStage[]> = {
     'funnel: ['analyzing,'done'],
     'analyzing: ['portfolio_backlog,'funnel,'done'],
     'portfolio_backlog: ['implementing,'analyzing,'done'],
     'implementing: ['done,'portfolio_backlog'],
     'done: [] // Terminal state
    };

    return validTransitions[from]?.includes(to)|| false;
  }
}

export default EpicOwnerCoordinator;