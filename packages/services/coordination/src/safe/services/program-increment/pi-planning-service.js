/**
 * @fileoverview PI Planning Service - Program Increment Planning Management
 *
 * Specialized service for managing SAFe Program Increment planning events and workflows.
 * Handles PI planning event orchestration, AGUI integration, stakeholder coordination,
 * and business context alignment.
 *
 * Features:
 * - PI planning event configuration and execution
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
-owner | architect | team - lead | scrum - master | 'stakeholder;;
teamId ?  : string;
artRole ?  :  | rte | product - manager | system - architect | 'business-owner;;
required: boolean;
// ============================================================================
// PI PLANNING SERVICE
// ============================================================================
/**
 * PI Planning Service for Program Increment planning event management
 */
export class PIPlanningService extends EventBus {
    logger;
    planningEvents = new Map();
    planningResults = new Map();
    workflowEngine;
    aguiSystem;
    knowledgeManager;
    initialized = false;
    constructor(logger, _config = {}) {
        super();
        this.logger = logger;
    }
    /**
     * Initialize the service with dependencies
     */
    initialize() {
        if (this.initialized)
            return;
        try {
            // Initialize with fallback implementations
            this.workflowEngine = this.createWorkflowEngineFallback();
            this.aguiSystem = this.createAGUISystemFallback();
            this.teamworkOrchestrator = this.createTeamworkOrchestratorFallback();
            this.knowledgeManager = this.createKnowledgeManagerFallback();
            this.initialized = true;
            this.logger.info('PI Planning Service initialized successfully');
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize PI Planning Service:', error);
            ';
            throw error;
        }
    }
    /**
     * Create comprehensive PI planning event configuration
     */
    async createPIPlanningEvent(artId, businessContext, architecturalVision, participants) {
        if (!this.initialized)
            this.initialize();
        this.logger.info('Creating PI planning event', { ': artId,
            participantCount: participants.length,
        });
        try {
            const eventId = `pi-planning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            `
      const piId = `;
            pi - $artId - $Date.now() `;`;
            // Generate comprehensive planning agenda
            const agenda = this.generatePlanningAgenda(businessContext, architecturalVision);
            // Create planning event configuration
            const planningEvent = {
                eventId,
                piId,
                artId,
                startDate: new Date(),
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
                facilitators: this.identifyEventFacilitators(participants),
                participants,
                agenda,
                businessContext,
                architecturalVision,
                planningAdjustments: [],
            };
            // Store planning event
            this.planningEvents.set(eventId, planningEvent);
            // Store in knowledge management
            await this.knowledgeManager.store({
                content: planningEvent,
                type: 'pi_planning_event',
                source: 'pi-planning-service',
                metadata: {
                    eventId,
                    artId,
                    participantCount: participants.length,
                },
            });
            this.emit('planning-event-created', { ': eventId,
                piId,
                artId,
                participantCount: participants.length,
                agendaItemCount: agenda.length,
            });
            this.logger.info('PI planning event created successfully', { ': eventId,
                piId,
                agendaItemCount: agenda.length,
            });
            return planningEvent;
        }
        catch (error) {
            this.logger.error('Failed to create PI planning event:', error);
            ';
            throw error;
        }
    }
    /**
     * Execute comprehensive PI planning workflow with AGUI integration
     */
    async executePIPlanningWorkflow(planningEvent) {
        if (!this.initialized)
            this.initialize();
        this.logger.info('Executing PI planning workflow', { ': eventId, planningEvent, : .eventId,
            agendaItemCount: planningEvent.agenda.length,
        });
        try {
            const planningResult = {
                eventId: planningEvent.eventId,
                outcomes: [],
                decisions: [],
                adjustments: [],
                risks: [],
                dependencies: [],
            };
            // Start workflow orchestration
            const workflowId = await this.workflowEngine.startWorkflow({
                workflowType: 'pi_planning_execution',
                entityId: planningEvent.eventId,
                participants: planningEvent.participants.map((p) => p.userId),
                data: {
                    planningEvent,
                    businessContext: planningEvent.businessContext,
                    architecturalVision: planningEvent.architecturalVision,
                },
            });
            // Execute planning agenda items with proper orchestration
            for (const agendaItem of planningEvent.agenda) {
                try {
                    // Execute agenda item with teamwork orchestration
                    const outcome = await this.executeAgendaItem(agendaItem, planningEvent);
                    planningResult.outcomes.push(outcome);
                    // Create AGUI gate if required
                    if (agendaItem.aguiGateRequired) {
                        const gateOutcome = await this.createPlanningGate(agendaItem, outcome, planningEvent);
                        planningResult.decisions.push(gateOutcome);
                    }
                    // Check for critical path delays
                    if (agendaItem.criticalPath && outcome.outcome !== 'completed') {
                        ';
                        await this.handleCriticalPathDelay(agendaItem, outcome, planningEvent);
                    }
                }
                catch (error) {
                    this.logger.error('Agenda item execution failed', { ': itemId, agendaItem, : .id,
                        activity: agendaItem.activity,
                        error: error instanceof Error ? error.message : String(error),
                    });
                    // Create adjustment for failed agenda item
                    const adjustment = {
                        type: 'scope',
                        description: `Failed to complete agenda item: ${agendaItem.activity}`,
                    } `
            impact: `, Planning, scope, reduced;
                    -$;
                    {
                        agendaItem.description;
                    }
                    `,`;
                    adjustment: {
                        skippedItem: agendaItem.id,
                            alternativeApproach;
                        this.suggestAlternativeApproach(agendaItem),
                            impactAnalysis;
                        this.analyzeAdjustmentImpact(agendaItem, planningEvent),
                        ;
                    }
                    rationale: error.message || 'Execution error during planning',
                        approvedBy;
                    'system',
                        timestamp;
                    new Date(),
                    ;
                }
                ;
                planningResult.adjustments.push(adjustment);
                // Create risk for failed critical path item
                if (agendaItem.criticalPath) {
                    const risk = {
                        riskId: `risk-${agendaItem.id}-${Date.now()}`,
                    } `
              description: `, Critical, path, agenda, item, failed, { agendaItem, activity };
                    `,`;
                    category: 'schedule',
                        probability;
                    0.9,
                        impact;
                    'high',
                        mitigation;
                    adjustment.adjustment.alternativeApproach || 'Manual intervention required',
                        owner;
                    agendaItem.facilitator,
                        dueDate;
                    new Date(Date.now() + 24 * 60 * 60 * 1000),
                    ; // 1 day
                }
                ;
                planningResult.risks.push(risk);
            }
        }
        finally // Analyze cross-agenda dependencies
         {
        }
    }
    // Analyze cross-agenda dependencies
    dependencies = await this.analyzePlanningDependencies(planningEvent.agenda, planningResult.outcomes);
    planningResult;
    dependencies;
    // Identify additional risks from outcomes
    additionalRisks = await this.identifyPlanningRisks(planningResult.outcomes, planningEvent.businessContext);
    planningResult;
    risks;
}
// Store planning result
this.planningResults.set(planningEvent.eventId, planningResult);
this.emit('planning-workflow-completed', { ': eventId, planningEvent, : .eventId,
    workflowId,
    outcomeCount: planningResult.outcomes.length,
    decisionCount: planningResult.decisions.length,
    adjustmentCount: planningResult.adjustments.length,
    riskCount: planningResult.risks.length,
});
this.logger.info('PI planning workflow completed successfully', { ': eventId, planningEvent, : .eventId,
    outcomes: planningResult.outcomes.length,
    decisions: planningResult.decisions.length,
    risks: planningResult.risks.length,
});
return planningResult;
try { }
catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error('PI planning workflow execution failed:', errorMessage);
    ';
    this.emit('planning-workflow-failed', ', eventId, planningEvent.eventId, error, errorMessage);
    throw error;
}
/**
 * Get planning event by ID
 */
getPlanningEvent(eventId, string);
PIPlanningEventConfig | undefined;
{
    return this.planningEvents.get(eventId);
}
/**
 * Get planning result by event ID
 */
getPlanningResult(eventId, string);
PIPlanningResult | undefined;
{
    return this.planningResults.get(eventId);
}
/**
 * Get all planning events
 */
getAllPlanningEvents();
PIPlanningEventConfig[];
{
    return Array.from(this.planningEvents.values())();
}
/**
 * Update planning event with adjustments
 */
async;
updatePlanningEvent(eventId, string, _adjustments, PlanningAdjustment[]);
Promise < void  > {
    const: event = this.planningEvents.get(eventId),
    if(, event) {
        throw new Error(`Planning event not found: ${eventId}`);
        `
    }

    const updatedEvent = {
      ...event,
      planningAdjustments: [...event.planningAdjustments, ...adjustments],
    };

    this.planningEvents.set(eventId, updatedEvent);

    this.emit('planning-event-updated', {'
      eventId,
      adjustmentCount: adjustments.length,
    });
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    this.logger.info('Shutting down PI Planning Service');'
    this.removeAllListeners();
    this.planningEvents.clear();
    this.planningResults.clear();
    this.initialized = false;
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
    // Standard SAFe PI planning agenda with AGUI integration points
    return [
      {
        id: 'business-context',
        activity: 'Business Context Presentation',
        description:
          'Present business objectives, market drivers, and strategic direction',
        duration: 60,
        facilitator: 'business-owner',
        participants: ['all'],
        prerequisites: [],
        deliverables: ['Business context alignment'],
        aguiGateRequired: true,
        criticalPath: true,
      },
      {
        id: 'product-vision',
        activity: 'Product/Solution Vision',
        description: 'Present product vision and upcoming features',
        duration: 45,
        facilitator: 'product-manager',
        participants: ['product-owners', 'architects'],
        prerequisites: ['business-context'],
        deliverables: ['Product vision alignment'],
        aguiGateRequired: true,
        criticalPath: true,
      },
      {
        id: 'architecture-vision',
        activity: 'Architecture Vision & Development Practices',
        description: 'Present architectural vision and development guidelines',
        duration: 45,
        facilitator: 'system-architect',
        participants: ['architects', 'team-leads'],
        prerequisites: ['product-vision'],
        deliverables: ['Architecture alignment'],
        aguiGateRequired: true,
        criticalPath: true,
      },
      {
        id: 'planning-context',
        activity: 'Planning Context & Guidance',
        description: 'Provide planning guidance, capacity, and constraints',
        duration: 30,
        facilitator: 'rte',
        participants: ['scrum-masters', 'team-leads'],
        prerequisites: ['architecture-vision'],
        deliverables: ['Planning guidance'],
        aguiGateRequired: false,
        criticalPath: false,
      },
      {
        id: 'team-breakouts',
        activity: 'Team Planning Breakouts',
        description: 'Teams plan their iterations and identify dependencies',
        duration: 240, // 4 hours
        facilitator: 'team-leads',
        participants: ['teams'],
        prerequisites: ['planning-context'],
        deliverables: ['Team plans', 'Dependencies'],
        aguiGateRequired: true,
        criticalPath: true,
      },
      {
        id: 'draft-plan-review',
        activity: 'Draft Plan Review',
        description: 'Review team plans and identify cross-team dependencies',
        duration: 60,
        facilitator: 'rte',
        participants: ['team-leads', 'product-owners'],
        prerequisites: ['team-breakouts'],
        deliverables: ['Draft plan review'],
        aguiGateRequired: true,
        criticalPath: true,
      },
      {
        id: 'management-review',
        activity: 'Management Review and Problem Solving',
        description: 'Address issues and finalize plans',
        duration: 90,
        facilitator: 'business-owner',
        participants: ['management', 'stakeholders'],
        prerequisites: ['draft-plan-review'],
        deliverables: ['Final plan decisions'],
        aguiGateRequired: true,
        criticalPath: true,
      },
      {
        id: 'plan-rework',
        activity: 'Plan Rework',
        description: 'Adjust plans based on management feedback',
        duration: 120,
        facilitator: 'teams',
        participants: ['teams'],
        prerequisites: ['management-review'],
        deliverables: ['Revised plans'],
        aguiGateRequired: false,
        criticalPath: false,
      },
      {
        id: 'final-plan-review',
        activity: 'Final Plan Review and Commitment',
        description: 'Final plan presentation and team commitment',
        duration: 90,
        facilitator: 'rte',
        participants: ['all'],
        prerequisites: ['plan-rework'],
        deliverables: ['Final PI plan', 'Team commitments'],
        aguiGateRequired: true,
        criticalPath: true,
      },
      {
        id: 'plan-retrospective',
        activity: 'Planning Retrospective',
        description: 'Retrospective on the planning process',
        duration: 45,
        facilitator: 'rte',
        participants: ['facilitators'],
        prerequisites: ['final-plan-review'],
        deliverables: ['Process improvements'],
        aguiGateRequired: false,
        criticalPath: false,
      },
    ];
  }

  /**
   * Identify event facilitators based on participants
   */
  private identifyEventFacilitators(
    participants: PlanningParticipant[]
  ): string[] {
    const facilitators = participants
      .filter((p) => p.artRole === 'rte' || p.role ==='scrum-master')'
      .map((p) => p.userId);

    // Ensure we have at least one facilitator
    if (facilitators.length === 0) {
      facilitators.push('default-facilitator');'
    }

    return facilitators;
  }

  /**
   * Execute individual agenda item with teamwork coordination
   */
  private async executeAgendaItem(
    agendaItem: PlanningAgendaItem,
    planningEvent: PIPlanningEventConfig
  ): Promise<PlanningOutcome> {
    this.logger.debug('Executing agenda item', {'
      itemId: agendaItem.id,
      activity: agendaItem.activity,
      duration: agendaItem.duration,
    });

    // Coordinate with teamwork orchestrator
    const coordination = await this.teamworkOrchestrator.coordinateActivity({
      activityId: agendaItem.id,
      facilitator: agendaItem.facilitator,
      participants: this.resolveParticipants(
        agendaItem.participants,
        planningEvent.participants
      ),
      duration: agendaItem.duration,
      deliverables: agendaItem.deliverables,
    });

    // Simulate activity execution (in practice, this would coordinate actual work)
    await new Promise((resolve) => setTimeout(resolve, 100));

    const outcome: PlanningOutcome = {
      agendaItemId: agendaItem.id,
      outcome: coordination.success ? 'completed' : 'partial',
      deliverables: agendaItem.deliverables,
      issues: coordination.issues || [],
      nextActions: coordination.nextActions || [],
      participants: coordination.actualParticipants || [],
      duration: coordination.actualDuration || agendaItem.duration,
      notes: coordination.notes || `;
        Executed;
        $agendaItem.activity `,`;
    },
    return: outcome
};
async;
createPlanningGate(agendaItem, PlanningAgendaItem, outcome, PlanningOutcome, planningEvent, PIPlanningEventConfig);
Promise < PlanningDecision > {
    this: .logger.debug('Creating planning gate', { ': itemId, agendaItem, : .id,
        outcome: outcome.outcome,
    }),
    // Create AGUI interface for decision
    const: _gateInterface = await this.aguiSystem.createInterface({
        type: 'planning_gate',
        entityId: `${planningEvent.eventId}-${agendaItem.id}`,
    } `
      title: `, Planning, Gate, $, { agendaItem, : .activity } `,`, participants, this.resolveParticipants(agendaItem.participants, planningEvent.participants), sections, [
        {
            id: 'outcome-review',
            title: 'Outcome Review',
            content: outcome,
            type: 'readonly',
        },
        {
            id: 'deliverables',
            title: 'Deliverables',
            content: outcome.deliverables,
            type: 'checklist',
        },
        {
            id: 'approval',
            title: 'Approval Decision',
            type: 'approval',
            options: ['Approve', 'Approve with Conditions', 'Reject', 'Defer'],
        },
    ])
};
;
// Wait for gate decision (simulated)
await new Promise((resolve) => setTimeout(resolve, 100));
const decision = {
    decisionId: `decision-${agendaItem.id}-${Date.now()}`,
} `
      agendaItemId: agendaItem.id,
      decision: 'Approve', // In practice, this would come from AGUI'
      rationale: `, Planning, gate, approved;
for ($; { agendaItem, : .activity } `,`; alternatives)
    : [],
        consequences;
[],
    approvers;
this.resolveParticipants(agendaItem.participants, planningEvent.participants),
    timestamp;
new Date(),
    reviewDate;
new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
; // 30 days
;
return decision;
suggestAlternativeApproach(agendaItem, PlanningAgendaItem);
string;
{
    const alternatives = {
        'business-context': ',
        'Asynchronous business context review with recorded session': ,
        'product-vision': 'Written product vision with Q&A session',
        'architecture-vision': ',
        'Architecture documentation review with office hours': ,
        'team-breakouts': 'Individual team planning with cross-team coordination',
        'draft-plan-review': 'Peer review process with documented feedback',
        'management-review': 'Executive summary review with escalation process',
        'final-plan-review': ',
        'Recorded plan presentation with asynchronous approval': ,
    };
    return (alternatives[agendaItem.id] || 'Manual coordination with subject matter experts');
    ';
    ;
}
analyzeAdjustmentImpact(agendaItem, PlanningAgendaItem, planningEvent, PIPlanningEventConfig);
string;
{
    if (agendaItem.criticalPath) {
        return 'High impact - critical path affected, timeline and dependencies at risk;;
    }
    const dependentItems = planningEvent.agenda.filter((item) => item.prerequisites.includes(agendaItem.id));
    if (dependentItems.length > 0) {
        return `Medium impact - ${dependentItems.length} dependent activities affected`;
        `
    }

    return 'Low impact - isolated activity with minimal downstream effects;
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
          dependencyId: `;
        dep - $prerequisite - $agendaItem.id `,`;
        fromItem: prerequisite,
            toItem;
        agendaItem.id,
            type;
        'finish-to-start',
            description;
        `$agendaItem.activitydepends on completion of $prerequisite`, `
          criticality: agendaItem.criticalPath ? 'critical' : 'medium',
          owner: agendaItem.facilitator,
          status: this.getDependencyStatus(prerequisite, outcomes),
        };

        dependencies.push(dependency);
      }
    }

    return dependencies;
  }

  /**
   * Get dependency status based on outcome
   */
  private getDependencyStatus(
    prerequisiteId: string,
    outcomes: PlanningOutcome[]
  ): 'identified|planned|resolved|blocked' {'
    const outcome = outcomes.find((o) => o.agendaItemId === prerequisiteId);

    if (!outcome) return 'identified;

    switch (outcome.outcome) {
      case 'completed':'
        return 'resolved;
      case 'partial':'
        return 'planned;
      case 'failed':'
        return 'blocked;
      default:
        return 'identified;
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
      (o) => o.outcome === 'failed' || o.outcome ==='partial''
    );

    for (const outcome of problematicOutcomes) {
      const risk: PlanningRisk = {
        riskId: `;
        risk - outcome - $;
        {
            outcome.agendaItemId;
        }
        -$;
        {
            Date.now();
        }
        `,`;
        description: `Incomplete planning outcome for ${outcome.agendaItemId}`, `
        category: 'scope',
        probability: outcome.outcome === 'failed' ? 0.9 : 0.6,
        impact: outcome.issues.length > 2 ? 'high' : 'medium',
        mitigation: `;
        Address;
        issues: $;
        {
            outcome.issues.join(', ');
        }
        `,`;
        owner: 'planning-coordinator',
            dueDate;
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ; // 1 week
    }
    ;
    risks.push(risk);
}
// Analyze business constraint risks
for (const constraint of businessContext.constraints) {
    if (constraint.impact === 'high' || constraint.impact === 'critical') {
        ';
        const risk = {
            riskId: `risk-constraint-${constraint.type}-${Date.now()}`,
        } `
          description: `, Business, constraint, risk, { constraint, description };
        `,`;
        category: 'business',
            probability;
        constraint.impact === 'critical' ? 0.8 : 0.6,
            impact;
        constraint.impact,
            mitigation;
        constraint.mitigation,
            owner;
        constraint.owner,
            dueDate;
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        ; // 2 weeks
    }
    ;
    risks.push(risk);
}
return risks;
resolveParticipants(participantIds, string[], allParticipants, PlanningParticipant[]);
string[];
{
    if (participantIds.includes('all')) {
        ';
        return allParticipants.map((p) => p.userId);
    }
    if (participantIds.includes('teams')) {
        ';
        return allParticipants
            .filter((p) => p.role === 'team-lead' || p.teamId);
        '
            .map((p) => p.userId);
    }
    return participantIds;
}
async;
suggestMitigationStrategies(agendaItem, PlanningAgendaItem, outcome, PlanningOutcome);
Promise < string[] > {
    const: strategies, string, []:  = ['Extend planning session duration',
        'Assign additional facilitators',
        'Break down into smaller segments',
        'Use asynchronous coordination',
        'Escalate to management for priority support',
    ],
    // Add item-specific strategies
    if(agendaItem) { }, : .id === 'team-breakouts'
};
{
    ';
    strategies.push('Provide pre-planning templates', 'Assign planning coaches to teams', 'Use parallel planning rooms', ');
}
return strategies;
createWorkflowEngineFallback();
{
    return {
        startWorkflow: (workflow) => {
            this.logger.debug('Workflow started (fallback)', { ': type, workflow, : .workflowType,
            });
            return `workflow-${Date.now()}`;
            `
      },
    };
  }

  private createAGUISystemFallback() {
    return {
      createInterface: (config: any) => {
        this.logger.debug('AGUI interface created (fallback)', {'
          type: config.type,
        });
        return { interfaceId: `;
            interface - $Date.now() ` };`;
        },
    };
}
createTeamworkOrchestratorFallback();
{
    return {
        coordinateActivity: (activity) => {
            this.logger.debug('Activity coordinated (fallback)', { ': activityId, activity, : .activityId,
            });
            return {
                success: true,
                actualParticipants: activity.participants,
                actualDuration: activity.duration,
                issues: [],
                nextActions: [],
                notes: `Coordinated ${activity.activityId}`,
            } `
        };
      },
    };
  }

  private createKnowledgeManagerFallback() {
    return {
      store: (data: any) => {
        this.logger.debug('Knowledge stored (fallback)', { type: data.type });'
      },
    };
  }
}
            ;
        }
    };
}
