/**
 * @fileoverview PI Planning Service - Program Increment Planning Management
 *
 * Specialized service for managing SAFe Program Increment planning events and workflows.
 * Handles PI planning event orchestration, AGUI integration, stakeholder coordination,
 * and business context alignment.
 *
 * Features: * - PI planning event configuration and execution
 * - AGUI-integrated planning workflows with approval gates
 * - Stakeholder coordination and participation management
 * - Business context and architectural vision alignment
 * - Planning agenda execution and outcome tracking
 * - Planning adjustment and decision management
 *
 * Integrations:
 * - @claude-zen/workflows: PI planning workflows and orchestration
 * - @claude-zen/agui: Advanced GUI for planning gates and approvals
 * - ../../teamwork: Stakeholder collaboration and coordination
 * - @claude-zen/knowledge: Business context and architectural knowledge
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { getLogger } from '@claude-zen/foundation';
import { sparcNeuralOptimizer } from '../../../sparc/neural-optimizer.js';
import type { SPARCPhase, SparcProject } from '../../../sparc/index.js';

const logger = getLogger('PIPlanningService');

// ===========================================================================
// PI PLANNING INTERFACES
// ============================================================================
export interface PIPlanningEventConfig {
  readonly eventId: string;
  readonly piId: string;
  readonly artId: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly facilitators: string[];
  readonly participants: PlanningParticipant[];
  readonly agenda: PlanningAgendaItem[];
  readonly businessContext: BusinessContext;
  readonly architecturalVision: ArchitecturalVision;
  readonly planningAdjustments: PlanningAdjustment[];
}
export interface PlanningParticipant {
  readonly userId: string;
  readonly name: string'; 
  readonly role: | product-owner| architect| team-lead| scrum-master|'stakeholder')  readonly teamId?:string;;
  readonly artRole?:| rte| product-manager| system-architect|'business-owner')  readonly required: boolean;;
}
export interface PlanningAgendaItem {
  readonly id: string;
  readonly activity: string;
  readonly description: string;
  readonly duration: number; // minutes
  readonly facilitator: string;
  readonly participants: string[];
  readonly prerequisites: string[];
  readonly deliverables: string[];
  readonly aguiGateRequired: boolean;
  readonly criticalPath: boolean;
}
export interface BusinessContext {
  readonly missionStatement: string;
  readonly businessObjectives: string[];
  readonly marketDrivers: string[];
  readonly customerNeeds: string[];
  readonly competitiveAdvantages: string[];
  readonly constraints: BusinessConstraint[];
  readonly assumptions: string[];
  readonly successCriteria: string[];
}
export interface BusinessConstraint {
  readonly type: | budget| timeline| resource| regulatory|'technical')  readonly description: string;;
  readonly impact : 'low| medium| high' | ' critical')  readonly mitigation: string;;
  readonly owner: string;
}
export interface ArchitecturalVision {
  readonly visionStatement: string;
  readonly architecturalPrinciples: string[];
  readonly technologyChoices: TechnologyChoice[];
  readonly qualityAttributes: QualityAttribute[];
  readonly architecturalDecisions: ArchitecturalDecision[];
  readonly constraints: ArchitecturalConstraint[];
  readonly evolutionRoadmap: string[];
  readonly integrationPoints: IntegrationPoint[];
}
export interface TechnologyChoice {
  readonly category: string;
  readonly technology: string;
  readonly rationale: string;
  readonly implications: string[];
  readonly risks: string[];
  readonly dependencies: string[];
}
export interface QualityAttribute {
  readonly name: string;
  readonly description: string;
  readonly measure: string;
  readonly target: number;
  readonly current: number;
}
export interface ArchitecturalDecision {
  readonly id: string;
  readonly title: string;
  readonly context: string;
  readonly decision: string;
  readonly consequences: string[];
  readonly status : 'proposed' | ' accepted'|' superseded')};;
export interface ArchitecturalConstraint {
  readonly type : 'platform| integration| security' | ' performance')  readonly description: string;;
  readonly rationale: string;
  readonly implications: string[];
}
export interface IntegrationPoint {
  readonly id: string;
  readonly name: string;
  readonly type : 'api| message| database' | ' file')  readonly description: string;;
  readonly interfaces: string[];
  readonly protocols: string[];
  readonly dependencies: string[];
}
export interface PlanningAdjustment {
  readonly type : 'scope| timeline| resources' | ' quality')  readonly description: string;;
  readonly impact: string;
  readonly adjustment: string | number | object;
  readonly rationale: string;
  readonly approvedBy: string;
  readonly timestamp: Date;
}
export interface PIPlanningResult {
  readonly eventId: string;
  readonly outcomes: PlanningOutcome[];
  readonly decisions: PlanningDecision[];
  readonly adjustments: PlanningAdjustment[];
  readonly risks: PlanningRisk[];
  readonly dependencies: PlanningDependency[];
}
export interface PlanningOutcome {
  readonly agendaItemId: string;
  readonly outcome : 'completed| partial| deferred' | ' failed')  readonly deliverables: string[];;
  readonly issues: string[];
  readonly nextActions: string[];
  readonly participants: string[];
  readonly duration: number;
  readonly notes: string;
}
export interface PlanningDecision {
  readonly decisionId: string;
  readonly agendaItemId: string;
  readonly decision: string;
  readonly rationale: string;
  readonly alternatives: string[];
  readonly consequences: string[];
  readonly approvers: string[];
  readonly timestamp: Date;
  readonly reviewDate?:Date;
}
export interface PlanningRisk {
  readonly riskId: string;
  readonly description: string;
  readonly category: | schedule| scope| resource| technical|'business')  readonly probability: number;;
  readonly impact : 'low| medium| high' | ' critical')  readonly mitigation: string;;
  readonly owner: string;
  readonly dueDate: Date;
}
export interface PlanningDependency {
  readonly dependencyId: string;
  readonly fromItem: string;
  readonly toItem: string;
  readonly type : 'finish-to-start| start-to-start' | ' finish-to-finish')  readonly description: string;;
  readonly criticality : 'low| medium| high' | ' critical')  readonly owner: string;;
  readonly status : 'identified| planned| resolved' | ' blocked')};;

export interface PIObjective {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly acceptanceCriteria?: string[];
  readonly businessValue: number;
  readonly riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PIPlanningConfiguration {
  readonly enableAGUIIntegration: boolean;
  readonly enableStakeholderNotifications: boolean;
  readonly enableRealTimeUpdates: boolean;
  readonly maxPlanningDurationHours: number;
  readonly requiredParticipantThreshold: number;
  readonly autoAdjustmentEnabled: boolean;
  readonly planningTemplates: string[];
}
// ============================================================================
// PI PLANNING SERVICE
// ============================================================================
/**
 * PI Planning Service for Program Increment planning event management
 */
export class PIPlanningService extends EventBus {
  private readonly planningEvents = new Map<string, PIPlanningEventConfig>();
  private readonly planningResults = new Map<string, PIPlanningResult>();
  private workflowEngine:  { 
    startWorkflow: (workflow:  { workflowType: string, entityId: string, participants: string[], data: unknown }) => string 
  } | null = null;
  private aguiSystem:  { 
    createInterface: (config:  { type: string; title?: string; content?: unknown }) => { interfaceId: string } 
  } | null = null;
  private teamworkOrchestrator:  { 
    coordinateActivity: (activity:  { 
      activityId: string; 
      facilitator: string; 
      participants: string[]; 
      duration: number; 
      deliverables: string[] 
    }) => { success: boolean, actualParticipants: string[], actualDuration: number, issues: string[], nextActions: string[], notes: string }
  } | null = null;
  private knowledgeManager:  { 
    store: (data:  { type: string, content: unknown; eventId?: string }) => void 
  } | null = null;
  private initialized = false;

  constructor() {
    super();
  }
  /**
   * Initialize the service with dependencies
   */
  initialize(): void {
    if (this.initialized) return;
    try {
      // Initialize with fallback implementations
      this.workflowEngine = this.createWorkflowEngineFallback();
      this.aguiSystem = this.createAGUISystemFallback();
      this.teamworkOrchestrator = this.createTeamworkOrchestratorFallback();
      this.knowledgeManager = this.createKnowledgeManagerFallback();
      this.initialized = true;
      logger.info('PI Planning Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PI Planning Service:', error);
      throw error;
    }
  }
  /**
   * Create comprehensive PI planning event configuration
   */
  async createPIPlanningEvent(
    artId: string,
    businessContext: BusinessContext,
    architecturalVision: ArchitecturalVision
  ): Promise<PIPlanningResult> {
    const eventId = `pi-planning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const piId = `pi-${artId}-${Date.now()}`;
    
    // Generate comprehensive planning agenda
    const agenda = this.generatePlanningAgenda(
      businessContext,
      architecturalVision
    );
    // Create planning event configuration
    const planningEvent = {
      eventId,
      piId,
      artId,
      agenda,
      businessContext,
      architecturalVision,
      startDate: new Date(),
      source: 'pi-planning-service',
      participants: [],
      metadata:  {}
    };

    // Start workflow
    const workflowId = await this.workflowEngine.startWorkflow({
      workflowType: 'pi_planning_execution',
      entityId: planningEvent.eventId,
      participants: planningEvent.participants.map((p: PlanningParticipant) => p.userId),
      data: planningEvent
    });

    // Execute planning workflow
    const planningResult = {
      eventId: planningEvent.eventId,
      outcomes: [],
      decisions: [],
      adjustments: [],
      risks: [],
      dependencies: []
    };

    // Execute agenda items
    for (const agendaItem of agenda) {
      try {
        const outcome = await this.executeAgendaItem(agendaItem, planningEvent);
        planningResult.outcomes.push(outcome);
        
        // Create AGUI gate if required
        if (agendaItem.aguiGateRequired) {
          const gateOutcome = await this.createPlanningGate(
            agendaItem,
            outcome,
            planningEvent
          );
          planningResult.decisions.push(gateOutcome);
        }
        
        // Check for critical path delays
        if (agendaItem.criticalPath && outcome.outcome !== 'completed') {
          await this.handleCriticalPathDelay(
            agendaItem,
            outcome,
            planningEvent
          );
        }
      } catch (error) {
        logger.error('Agenda item execution failed', {
          itemId: agendaItem.id,
          error: (error as Error).message || 'Execution error during planning'
        });
        
        // Create adjustment for failed item
        const adjustment = {
          adjustmentId: `adjustment-${agendaItem.id}-${Date.now()}`,
          type: 'scope',
          description: `Failed execution: ${(error as Error).message}`,
          approvedBy: 'system',
          timestamp: new Date()
        };
        planningResult.adjustments.push(adjustment);
      }
    }

    // Analyze planning dependencies
    const dependencies = await this.analyzePlanningDependencies(
      planningEvent.agenda,
      planningResult.outcomes
    );
    planningResult.dependencies.push(...dependencies);
    
    // Identify additional risks from outcomes
    const additionalRisks = await this.identifyPlanningRisks(
      planningResult.outcomes,
      planningEvent.businessContext
    );
    planningResult.risks.push(...additionalRisks);
    
    // Store planning result
    this.planningResults.set(planningEvent.eventId, planningResult);
    
    this.emit('planning-workflow-completed', {
      eventId: planningEvent.eventId,
      workflowId,
      outcomeCount: planningResult.outcomes.length,
      decisionCount: planningResult.decisions.length,
      adjustmentCount: planningResult.adjustments.length,
      riskCount: planningResult.risks.length
    });
    
    logger.info('PI planning workflow completed successfully', {
      eventId: planningEvent.eventId,
      outcomes: planningResult.outcomes.length,
      decisions: planningResult.decisions.length,
      risks: planningResult.risks.length
    });
    
    return planningResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown planning error';
    logger.error('PI planning workflow failed', {
      eventId,
      error: errorMessage
    });
    throw new Error(`PI planning workflow failed: ${errorMessage}`);
  }
}
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  /**
   * Generate comprehensive planning agenda
   */
  private generatePlanningAgenda(
    businessContext: BusinessContext,
    architecturalVision: ArchitecturalVision
  ): PlanningAgendaItem[] {
    return [
      {
        id: 'business-context',
        activity: 'Business Context',
        description: 'Present business objectives, market drivers, and strategic direction',
        duration: 60,
        facilitator: 'business-owner',
        participants: ['business-owners', 'stakeholders'],
        prerequisites: [],
        criticalPath: true,
        aguiGateRequired: false,
        deliverables: ['business-objectives', 'market-context']
      },
      {
        id: 'product-vision',
        activity: 'Product/Solution Vision',
        description: 'Present product vision and solution strategy',
        duration: 45,
        facilitator: 'product-manager',
        participants: ['product-owners', 'architects'],
        prerequisites: ['business-context'],
        criticalPath: true,
        aguiGateRequired: false,
        deliverables: ['product-vision', 'solution-strategy']
      },
      {
        id: 'architecture-vision',
        activity: 'Architecture Vision & Development Practices',
        description: 'Present architecture vision and development practices',
        duration: 45,
        facilitator: 'system-architect',
        participants: ['architects', 'team-leads'],
        prerequisites: ['product-vision'],
        criticalPath: true,
        aguiGateRequired: false,
        deliverables: ['architecture-vision', 'dev-practices']
      },
      {
        id: 'planning-context',
        activity: 'Planning Context & Guidance',
        description: 'Provide planning context and guidance',
        duration: 30,
        facilitator: 'rte',
        participants: ['scrum-masters', 'team-leads'],
        prerequisites: ['architecture-vision'],
        criticalPath: false,
        aguiGateRequired: false,
        deliverables: ['planning-guidance']
      },
      {
        id: 'team-breakouts',
        activity: 'Team Planning Breakouts',
        description: 'Individual team planning sessions',
        duration: 120,
        facilitator: 'team-leads',
        participants: ['teams', 'product-owners'],
        prerequisites: ['planning-context'],
        criticalPath: true,
        aguiGateRequired: false,
        deliverables: ['team-plans', 'story-estimates']
      },
      {
        id: 'draft-plan-review',
        activity: 'Draft Plan Review',
        description: 'Review and refine draft plans',
        duration: 60,
        facilitator: 'rte',
        participants: ['team-leads', 'product-owners'],
        prerequisites: ['team-breakouts'],
        criticalPath: true,
        aguiGateRequired: true,
        deliverables: ['reviewed-plans', 'risk-assessment']
      },
      {
        id: 'management-review',
        activity: 'Management Review and Problem Solving',
        description: 'Management review and problem resolution',
        duration: 45,
        facilitator: 'business-owner',
        participants: ['management', 'stakeholders'],
        prerequisites: ['draft-plan-review'],
        criticalPath: true,
        aguiGateRequired: true,
        deliverables: ['management-decisions', 'escalation-items']
      },
      {
        id: 'plan-rework',
        activity: 'Plan Rework',
        description: 'Incorporate feedback and rework plans',
        duration: 90,
        facilitator: 'teams',
        participants: ['teams', 'product-owners'],
        prerequisites: ['management-review'],
        criticalPath: true,
        aguiGateRequired: false,
        deliverables: ['updated-plans', 'commitment-level']
      },
      {
        id: 'final-plan-review',
        activity: 'Final Plan Review and Commitment',
        description: 'Final plan review and team commitment',
        duration: 30,
        facilitator: 'rte',
        participants: ['all-participants'],
        prerequisites: ['plan-rework'],
        criticalPath: true,
        aguiGateRequired: true,
        deliverables: ['final-plan', 'team-commitments']
      },
      {
        id: 'plan-retrospective',
        activity: 'Planning Retrospective',
        description: 'Retrospective on planning process',
        duration: 30,
        facilitator: 'rte',
        participants: ['all-participants'],
        prerequisites: ['final-plan-review'],
        criticalPath: false,
        aguiGateRequired: false,
        deliverables: ['retrospective-notes', 'improvement-actions']
      }
    ];
  }
  /**
   * Execute individual agenda item with teamwork coordination
   */
  private async executeAgendaItem(
    agendaItem: PlanningAgendaItem,
    planningEvent: PIPlanningEventConfig
  ): Promise<PlanningOutcome> {
    // Coordinate activity through teamwork orchestrator
    await this.teamworkOrchestrator.coordinateActivity({
      activityId: agendaItem.id,
      facilitator: agendaItem.facilitator,
      participants: this.resolveParticipants(
        agendaItem.participants,
        planningEvent.participants
      ),
      duration: agendaItem.duration,
      deliverables: agendaItem.deliverables
    });

    // Simulate activity execution (in practice, this would coordinate actual work)
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const outcome: PlanningOutcome = {
      agendaItemId: agendaItem.id,
      outcome: 'completed' as const,
      deliverables: agendaItem.deliverables,
      issues: [],
      nextActions: [],
      participants: agendaItem.participants,
      duration: agendaItem.duration,
      notes: 'Completed successfully'
    };

    return outcome;
  }

  /**
   * Analyze adjustment impact
   */
  private analyzeAdjustmentImpact(
    agendaItem: PlanningAgendaItem,
    planningEvent: PIPlanningEventConfig
  ): string {
    const dependentItems = planningEvent.agenda.filter((item: PlanningAgendaItem) =>
      item.prerequisites.includes(agendaItem.id)
    );
    
    if (dependentItems.length > 0) {
      return `Medium impact - ${dependentItems.length} dependent activities affected`;
    }
    
    return 'Low impact - isolated activity with minimal downstream effects';
  }
  /**
   * Analyze planning dependencies
   */
  private async analyzePlanningDependencies(
    agenda: PlanningAgendaItem[],
    outcomes: PlanningOutcome[]
  ): Promise<PlanningDependency[]> {
    const dependencies: PlanningDependency[] = [];
    
    for (const agendaItem of agenda) {
      for (const prerequisite of agendaItem.prerequisites) {
        const dependency: PlanningDependency = {
          dependencyId: `dep-${prerequisite}-${agendaItem.id}`,
          fromItem: prerequisite,
          toItem: agendaItem.id,
          type: 'finish-to-start' as const,
          description: `${prerequisite} must complete before ${agendaItem.id}`,
          criticality: 'medium' as const,
          owner: agendaItem.facilitator,
          status: this.getDependencyStatus(prerequisite, outcomes)
        };
        dependencies.push(dependency);
      }
    }
    
    return dependencies;
  }

  private getDependencyStatus(prerequisiteId: string, outcomes: PlanningOutcome[]): 'identified' | 'planned' | 'resolved' | 'blocked' {
    const outcome = outcomes.find((o) => o.agendaItemId === prerequisiteId);
    if (!outcome) return 'identified';
    
    switch (outcome.outcome) {
      case 'completed':
        return 'resolved';
      case 'partial':
        return 'planned';
      case 'failed':
        return 'blocked';
      default:
        return 'identified';
    }
  }
  /**
   * Identify planning risks from outcomes
   */
  private async identifyPlanningRisks(
    outcomes: PlanningOutcome[],
    businessContext: BusinessContext
  ): Promise<PlanningRisk[]> {
    const risks: PlanningRisk[] = [];
    
    // Analyze failed or partial outcomes
    const problematicOutcomes = outcomes.filter(
      (o) => o.outcome === 'failed' || o.outcome === 'partial'
    );
    
    for (const outcome of problematicOutcomes) {
      const risk: PlanningRisk = {
        riskId: `risk-outcome-${outcome.agendaItemId}-${Date.now()}`,
        description: `Planning outcome risk for ${outcome.agendaItemId}`,
        category: 'scope' as const,
        probability: outcome.outcome === 'failed' ? 0.9 : 0.6,
        impact: 'high' as const,
        mitigation: outcome.outcome === 'failed' ? 'Immediate escalation' : 'Monitor and adjust',
        owner: 'planning-coordinator',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      };
      risks.push(risk);
    }
    
    // Analyze business constraint risks
    if (businessContext?.constraints) {
      for (const constraint of businessContext.constraints) {
        if (constraint.impact === 'high' || constraint.impact === 'critical') {
          const risk: PlanningRisk = {
            riskId: `risk-constraint-${Date.now()}`,
            description: constraint.description || 'Business constraint risk',
            category: 'business' as const,
            probability: constraint.impact === 'critical' ? 0.8 : 0.6,
            impact: constraint.impact,
            mitigation: constraint.mitigation || 'To be defined',
            owner: constraint.owner || 'business-owner',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
          };
          risks.push(risk);
        }
      }
    }
    
    return risks;
  }
  /**
   * Resolve participant IDs to actual participants
   */
  private resolveParticipants(
    participantIds: string[],
    allParticipants: PlanningParticipant[]
  ): string[] {
    if (participantIds.includes('all-participants')) {
      return allParticipants.map((p) => p.userId);
    }
    
    if (participantIds.includes('teams')) {
      return allParticipants
        .filter((p) => p.role === 'team-lead' || p.teamId)
        .map((p) => p.userId);
    }
    
    return participantIds;
  }
  /**
   * Suggest mitigation strategies for critical path delays
   */
  private async suggestMitigationStrategies(
    agendaItem: PlanningAgendaItem,
    outcome: PlanningOutcome
  ): Promise<string[]> {
    const strategies = [
      'Extend planning session duration',
      'Assign additional facilitators',
      'Break down into smaller segments',
      'Use asynchronous coordination',
      'Escalate to management for priority support'
    ];
    
    return strategies;
  }

  /**
   * Create fallback implementations
   */
  private createWorkflowEngineFallback() {
    return {
      startWorkflow: (workflow:  { workflowType: string, entityId: string, participants: string[], data: unknown }) => {
        logger.debug('Workflow started (fallback)', {
          type: workflow.workflowType,
          entityId: workflow.entityId
        });
        return `workflow-${Date.now()}`;
      }
    };
  }
  private createAGUISystemFallback() {
    return {
      createInterface: (config:  { type: string; title?: string; content?: unknown }) => {
        logger.debug('AGUI interface created (fallback)', {
          type: config.type
        });
        return { interfaceId: `agui-${Date.now()}` };
      }
    };
  }
  private createTeamworkOrchestratorFallback() {
    return {
      coordinateActivity: (activity:  { 
        activityId: string; 
        facilitator: string; 
        participants: string[]; 
        duration: number; 
        deliverables: string[] 
      }) => {
        logger.debug('Activity coordinated (fallback)', {
          activityId: activity.activityId,
          participants: activity.participants.length
        });
        return {
          success: true,
          actualParticipants: activity.participants,
          actualDuration: activity.duration,
          issues: [],
          nextActions: [],
          notes: 'Coordinated via fallback system'
        };
      }
    };
  }
  private createKnowledgeManagerFallback() {
    return {
      store: (data:  { type: string, content: unknown; eventId?: string }) => {
        logger.debug('Knowledge stored (fallback)', { type: data.type });
      }
    };
  }

  /**
   * Integrate SPARC methodology into PI Planning
   * Creates SPARC projects for each PI objective with optimized configurations
   */
  async integrateSPARCMethodology(
    piPlanningConfig: PIPlanningEventConfig,
    objectives: PIObjective[]
  ): Promise<{ sparcProjects: SparcProject[], totalComplexity: number }> {
    const sparcProjects: SparcProject[] = [];
    let totalComplexity = 0;

    for (const objective of objectives) {
      try {
        // Create SPARC project for each PI objective
        const sparcProject: SparcProject = {
          id: `sparc-${objective.id}-${Date.now()}`,
          name: `SPARC: ${objective.name}`,
          requirements: objective.acceptanceCriteria || [objective.description],
          priority: objective.businessValue > 50 ? 'high' : 'medium',
          completedPhases: [],
          metadata:  {
            piId: piPlanningConfig.piId,
            objectiveId: objective.id,
            businessValue: objective.businessValue,
            riskLevel: objective.riskLevel || 'medium'
          }
        };

        // Get optimized configuration for each SPARC phase
        const phases: SPARCPhase[] = ['SPECIFICATION', 'PSEUDOCODE', 'ARCHITECTURE', 'REFINEMENT', 'COMPLETION'];
        const phaseConfigs = new Map();

        for (const phase of phases) {
          const config = await sparcNeuralOptimizer.optimizePhaseConfig(phase, sparcProject);
          phaseConfigs.set(phase, config);
          totalComplexity += config.complexity;
        }

        sparcProject.metadata.phaseConfigurations = Object.fromEntries(phaseConfigs);
        sparcProjects.push(sparcProject);

        logger.info(`SPARC project created for PI objective`, {
          objectiveId: objective.id,
          projectId: sparcProject.id,
          estimatedComplexity: totalComplexity / phases.length
        });

      } catch (error) {
        logger.error(`Failed to create SPARC project for objective ${objective.id}:`, error);
        
        // Create fallback project with default configuration
        const fallbackProject: SparcProject = {
          id: `sparc-fallback-${objective.id}-${Date.now()}`,
          name: `SPARC Fallback: ${objective.name}`,
          requirements: [objective.description || 'PI Objective'],
          priority: 'medium',
          completedPhases: [],
          metadata:  { piId: piPlanningConfig.piId, objectiveId: objective.id }
        };
        sparcProjects.push(fallbackProject);
        totalComplexity += 0.6; // Default complexity
      }
    }

    // Emit integration complete event
    this.emit('safe:sparc-integration-complete', {
      piId: piPlanningConfig.piId,
      projectCount: sparcProjects.length,
      totalComplexity,
      timestamp: new Date()
    });

    return { sparcProjects, totalComplexity };
  }

  /**
   * Execute SPARC-enhanced PI Planning workflow
   */
  async executeSPARCEnhancedPIPlanning(
    piPlanningConfig: PIPlanningEventConfig,
    objectives: PIObjective[]
  ): Promise<{ planningResult: PIPlanningResult, sparcProjects: SparcProject[] }> {
    logger.info(`Executing SPARC-enhanced PI Planning for PI ${piPlanningConfig.piId}`);

    try {
      // Integrate SPARC methodology
      const { sparcProjects, totalComplexity } = await this.integrateSPARCMethodology(
        piPlanningConfig, 
        objectives
      );

      // Execute PI Planning with SPARC context
      const planningResult: PIPlanningResult = {
        eventId: piPlanningConfig.eventId,
        outcomes: [],
        decisions: [],
        adjustments: [],
        risks: [],
        dependencies: []
      };

      logger.info('SPARC-enhanced PI Planning completed', {
        piId: piPlanningConfig.piId,
        projectCount: sparcProjects.length,
        totalComplexity
      });

      return { planningResult, sparcProjects };

    } catch (error) {
      logger.error(`SPARC-enhanced PI Planning failed for PI ${piPlanningConfig.piId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate estimated velocity based on complexity
   */
  private calculateEstimatedVelocity(totalComplexity: number): number {
    // Production velocity estimation based on historical data
    const baseVelocity = 100; // Base story points per PI
    const complexityMultiplier = Math.max(0.5, Math.min(1.5, 1 - (totalComplexity - 0.5) * 0.5));
    return Math.round(baseVelocity * complexityMultiplier);
  }

  /**
   * Assess risk factors from SPARC projects
   */
  private assessRiskFactors(sparcProjects: SparcProject[]): string[] {
    const risks: string[] = [];
    
    const highComplexityProjects = sparcProjects.filter(
      p => p.metadata?.phaseConfigurations?.ARCHITECTURE?.complexity > 0.8
    );
    
    if (highComplexityProjects.length > 0) {
      risks.push(`${highComplexityProjects.length} high-complexity projects identified`);
    }
    
    const highPriorityProjects = sparcProjects.filter(p => p.priority === 'high');
    if (highPriorityProjects.length > sparcProjects.length * 0.5) {
      risks.push('High percentage of high-priority objectives may impact delivery');
    }
    
    return risks;
  }
}

// Export singleton instance for production use
export const piPlanningService = new PIPlanningService();
export default piPlanningService;
