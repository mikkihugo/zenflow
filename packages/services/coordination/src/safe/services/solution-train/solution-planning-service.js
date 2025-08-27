/**
 * @fileoverview Solution Planning Service
 *
 * Service for solution-level planning and coordination activities.
 * Handles solution backlog management, PI planning coordination, and cross-ART synchronization.
 *
 * SINGLE RESPONSIBILITY: Solution-level planning and coordination
 * FOCUSES ON: Solution backlog, PI planning, cross-train coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addWeeks, addDays, startOfWeek } = dateFns;
/**
 * Commitment levels for ART planning
 */
export var CommitmentLevel;
(function (CommitmentLevel) {
    CommitmentLevel["HIGH"] = "high";
    CommitmentLevel["MEDIUM"] = "medium";
    CommitmentLevel["LOW"] = "low";
    CommitmentLevel["CONDITIONAL"] = "conditional";
})(CommitmentLevel || (CommitmentLevel = {}));
/**
 * Constraint types
 */
export var ConstraintType;
(function (ConstraintType) {
    ConstraintType["RESOURCE"] = "resource";
    ConstraintType["TECHNOLOGY"] = "technology";
    ConstraintType["REGULATORY"] = "regulatory";
    ConstraintType["BUDGET"] = "budget";
    ConstraintType["TIMELINE"] = "timeline";
    ConstraintType["DEPENDENCY"] = "dependency";
})(ConstraintType || (ConstraintType = {}));
/**
 * Impact levels
 */
export var ImpactLevel;
(function (ImpactLevel) {
    ImpactLevel["LOW"] = "low";
    ImpactLevel["MEDIUM"] = "medium";
    ImpactLevel["HIGH"] = "high";
    ImpactLevel["CRITICAL"] = "critical";
})(ImpactLevel || (ImpactLevel = {}));
/**
 * Event types
 */
export var EventType;
(function (EventType) {
    EventType["PI_PLANNING"] = "pi_planning";
    EventType["SOLUTION_SYNC"] = "solution_sync";
    EventType["ARCHITECTURAL_RUNWAY"] = "architectural_runway";
    EventType["SUPPLIER_SYNC"] = "supplier_sync";
    EventType["SOLUTION_DEMO"] = "solution_demo";
})(EventType || (EventType = {}));
/**
 * Event frequency
 */
export var EventFrequency;
(function (EventFrequency) {
    EventFrequency["DAILY"] = "daily";
    EventFrequency["WEEKLY"] = "weekly";
    EventFrequency["BI_WEEKLY"] = "bi_weekly";
    EventFrequency["PI_BOUNDARY"] = "pi_boundary";
    EventFrequency["ON_DEMAND"] = "on_demand";
})(EventFrequency || (EventFrequency = {}));
/**
 * Participant roles
 */
export var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["SOLUTION_TRAIN_ENGINEER"] = "solution_train_engineer";
    ParticipantRole["SOLUTION_ARCHITECT"] = "solution_architect";
    ParticipantRole["SOLUTION_MANAGER"] = "solution_manager";
    ParticipantRole["RTE"] = "rte";
    ParticipantRole["PRODUCT_MANAGER"] = "product_manager";
    ParticipantRole["SYSTEM_ARCHITECT"] = "system_architect";
    ParticipantRole["STAKEHOLDER"] = "stakeholder";
})(ParticipantRole || (ParticipantRole = {}));
/**
 * Stakeholder roles
 */
export var StakeholderRole;
(function (StakeholderRole) {
    StakeholderRole["BUSINESS_OWNER"] = "business_owner";
    StakeholderRole["SOLUTION_SPONSOR"] = "solution_sponsor";
    StakeholderRole["CUSTOMER"] = "customer";
    StakeholderRole["COMPLIANCE_OFFICER"] = "compliance_officer";
    StakeholderRole["SECURITY_LEAD"] = "security_lead";
    StakeholderRole["OPERATIONS_LEAD"] = "operations_lead";
})(StakeholderRole || (StakeholderRole = {}));
/**
 * Influence and interest levels
 */
export var InfluenceLevel;
(function (InfluenceLevel) {
    InfluenceLevel["HIGH"] = "high";
    InfluenceLevel["MEDIUM"] = "medium";
    InfluenceLevel["LOW"] = "low";
})(InfluenceLevel || (InfluenceLevel = {}));
export var InterestLevel;
(function (InterestLevel) {
    InterestLevel["HIGH"] = "high";
    InterestLevel["MEDIUM"] = "medium";
    InterestLevel["LOW"] = "low";
})(InterestLevel || (InterestLevel = {}));
/**
 * Planning types
 */
export var PlanningType;
(function (PlanningType) {
    PlanningType["PI_PLANNING"] = "pi_planning";
    PlanningType["SOLUTION_PLANNING"] = "solution_planning";
    PlanningType["ARCHITECTURAL_PLANNING"] = "architectural_planning";
    PlanningType["CAPACITY_PLANNING"] = "capacity_planning";
})(PlanningType || (PlanningType = {}));
/**
 * Outcome categories
 */
export var OutcomeCategory;
(function (OutcomeCategory) {
    OutcomeCategory["COMMITMENT"] = "commitment";
    OutcomeCategory["DEPENDENCY_RESOLUTION"] = "dependency_resolution";
    OutcomeCategory["RISK_MITIGATION"] = "risk_mitigation";
    OutcomeCategory["ARCHITECTURAL_DECISION"] = "architectural_decision";
    OutcomeCategory["RESOURCE_ALLOCATION"] = "resource_allocation";
})(OutcomeCategory || (OutcomeCategory = {}));
/**
 * Confidence levels
 */
export var ConfidenceLevel;
(function (ConfidenceLevel) {
    ConfidenceLevel["HIGH"] = "high";
    ConfidenceLevel["MEDIUM"] = "medium";
    ConfidenceLevel["LOW"] = "low";
})(ConfidenceLevel || (ConfidenceLevel = {}));
/**
 * Risk categories
 */
export var RiskCategory;
(function (RiskCategory) {
    RiskCategory["TECHNICAL"] = "technical";
    RiskCategory["RESOURCE"] = "resource";
    RiskCategory["SCHEDULE"] = "schedule";
    RiskCategory["INTEGRATION"] = "integration";
    RiskCategory["EXTERNAL"] = "external";
})(RiskCategory || (RiskCategory = {}));
/**
 * Risk probability and impact
 */
export var RiskProbability;
(function (RiskProbability) {
    RiskProbability["HIGH"] = "high";
    RiskProbability["MEDIUM"] = "medium";
    RiskProbability["LOW"] = "low";
})(RiskProbability || (RiskProbability = {}));
export var RiskImpact;
(function (RiskImpact) {
    RiskImpact["HIGH"] = "high";
    RiskImpact["MEDIUM"] = "medium";
    RiskImpact["LOW"] = "low";
})(RiskImpact || (RiskImpact = {}));
/**
 * Risk status
 */
export var RiskStatus;
(function (RiskStatus) {
    RiskStatus["OPEN"] = "open";
    RiskStatus["MITIGATING"] = "mitigating";
    RiskStatus["MITIGATED"] = "mitigated";
    RiskStatus["ACCEPTED"] = "accepted";
    RiskStatus["CLOSED"] = "closed";
})(RiskStatus || (RiskStatus = {}));
/**
 * Dependency types and status
 */
export var DependencyType;
(function (DependencyType) {
    DependencyType["FEATURE"] = "feature";
    DependencyType["DATA"] = "data";
    DependencyType["SERVICE"] = "service";
    DependencyType["INFRASTRUCTURE"] = "infrastructure";
    DependencyType["KNOWLEDGE"] = "knowledge";
})(DependencyType || (DependencyType = {}));
export var DependencyStatus;
(function (DependencyStatus) {
    DependencyStatus["PLANNED"] = "planned";
    DependencyStatus["IN_PROGRESS"] = "in_progress";
    DependencyStatus["DELIVERED"] = "delivered";
    DependencyStatus["BLOCKED"] = "blocked";
    DependencyStatus["AT_RISK"] = "at_risk";
})(DependencyStatus || (DependencyStatus = {}));
/**
 * Solution Planning Service for solution-level planning coordination
 */
export class SolutionPlanningService {
    logger;
    planningConfigs = new Map();
    planningResults = new Map();
    commitments = new Map();
    risks = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Configure solution planning
     */
    async configurePlanning(config) {
        this.logger.info('Configuring solution planning', { ': planningId, config, : .planningId,
            solutionId: config.solutionId,
            artCount: config.participatingARTs.length,
        });
        // Validate configuration
        this.validatePlanningConfig(config);
        // Store configuration
        this.planningConfigs.set(config.planningId, config);
        // Initialize stakeholder communication
        await this.initializeStakeholderCommunication(config.stakeholders);
        this.logger.info('Solution planning configured successfully', { ': planningId, config, : .planningId,
        });
    }
    /**
     * Execute solution planning session
     */
    async executePlanning(planningId, planningType) {
        const config = this.planningConfigs.get(planningId);
        if (!config) {
            throw new Error(`Planning configuration not found: ${planningId}`);
            `
    }

    this.logger.info('Executing solution planning', {'
      planningId,
      planningType,
      artCount: config.participatingARTs.length,
    });

    const startTime = Date.now();
    const resultId = `;
            planning - $generateNanoId(12) `;`;
            try {
                // Execute planning activities
                const planningOutcomes = await this.executePlanningActivities(config, planningType);
                // Collect commitments
                const commitments = await this.collectCommitments(config.participatingARTs);
                // Identify risks
                const risks = await this.identifyPlanningRisks(config, commitments);
                // Manage dependencies
                const dependencies = await this.manageCrossARTDependencies(config.participatingARTs);
                // Generate next steps
                const nextSteps = await this.generateNextSteps(commitments, risks, dependencies);
                const result = {
                    planningId: resultId,
                    timestamp: new Date(),
                    planningType,
                    participatingARTs: config.participatingARTs.map((art) => art.artId),
                    planningOutcomes,
                    commitments,
                    risks,
                    dependencies,
                    success: planningOutcomes.every((outcome) => outcome.success),
                    nextSteps,
                };
                this.planningResults.set(resultId, result);
                // Store commitments and risks for tracking
                for (const commitment of commitments) {
                    this.commitments.set(commitment.commitmentId, commitment);
                }
                for (const risk of risks) {
                    this.risks.set(risk.riskId, risk);
                }
                this.logger.info('Solution planning completed', { ': planningId,
                    resultId,
                    duration: Date.now() - startTime,
                    success: result.success,
                    commitmentCount: commitments.length,
                    riskCount: risks.length,
                });
                return result;
            }
            catch (error) {
                this.logger.error('Solution planning failed', { ': planningId,
                    error,
                });
                throw error;
            }
        }
        /**
         * Track commitment progress
         */
        async;
        trackCommitment(commitmentId, string);
        Promise < CommitmentProgress > {
            const: commitment = this.commitments.get(commitmentId),
            if(, commitment) {
                throw new Error(`Commitment not found: ${commitmentId}`);
                `
    }

    // Simulate progress tracking
    const progress = Math.random() * 100;
    const onTrack = progress >= 70 && new Date() <= commitment.deliveryDate;

    return {
      commitmentId,
      progress,
      onTrack,
      lastUpdate: new Date(),
      blockers: onTrack ? [] : ['Resource constraints', 'Technical challenges'],
      nextMilestone: addWeeks(new Date(), 2),
    };
  }

  /**
   * Update risk status
   */
  async updateRisk(
    riskId: string,
    status: RiskStatus,
    notes?: string
  ): Promise<PlanningRisk> {
    const risk = this.risks.get(riskId);
    if (!risk) {
      throw new Error(`;
                Risk;
                not;
                found: $riskId `);`;
            },
            const: updatedRisk, PlanningRisk = {
                ...risk,
                status,
            },
            this: .risks.set(riskId, updatedRisk),
            this: .logger.info('Risk status updated', { ': riskId,
                oldStatus: risk.status,
                newStatus: status,
                notes,
            }),
            return: updatedRisk
        };
        /**
         * Private helper methods
         */
    }
    if(, config, planningId) { }
}
 || config.planningId.trim() === '';
{
    ';
    throw new Error('Planning ID is required');
    ';
}
if (config.participatingARTs.length < 2) {
    throw new Error('At least two ARTs must participate in solution planning', ');
}
async;
initializeStakeholderCommunication(stakeholders, SolutionStakeholder[]);
Promise;
this.logger.info('Initializing stakeholder communication', { ': stakeholderCount, stakeholders, : .length,
});
async;
executePlanningActivities(config, SolutionPlanningConfig, planningType, PlanningType);
Promise < PlanningOutcome[] > {
    const: outcomes, PlanningOutcome, []:  = [],
    // Execute coordination events
    for(, event, of, config) { }, : .coordinationStrategy.coordinationEvents
};
{
    if (this.isEventRelevant(event, planningType)) {
        outcomes.push({
            outcomeId: `outcome-${generateNanoId(8)}`,
        } `
          category: OutcomeCategory.COMMITMENT,
          description: `, $, { event, : .eventType }, completed, successfully `,`, deliverables, [`${event.eventType} artifacts`, 'Meeting notes'], success, Math.random() > 0.2, // 80% success rate
        participants, event.participants.map((p) => p.participantId));
    }
    ;
}
return outcomes;
isEventRelevant(event, CoordinationEvent, planningType, PlanningType);
boolean;
if (planningType === PlanningType.PI_PLANNING) {
    return (event.eventType === EventType.PI_PLANNING || event.eventType === EventType.SOLUTION_SYNC);
}
return true;
async;
collectCommitments(arts, PlanningART[]);
Promise < SolutionCommitment[] > {
    const: commitments, SolutionCommitment, []:  = [],
    for(, art, of, arts) {
        // Generate sample commitments for each ART
        const commitmentCount = Math.floor(Math.random() * 3) + 2; // 2-4 commitments per ART
        for (let i = 0; i < commitmentCount; i++) {
            commitments.push({
                commitmentId: `commit-${generateNanoId(8)}`,
            } `
          artId: art.artId,
          objectiveId: `, objective - $, {} `,`, description, `ART ${art.artName} commitment ${i + 1}`, `
          confidence: this.getRandomConfidence(),
          dependencies: [],
          risks: [],
          deliveryDate: addWeeks(
            new Date(),
            Math.floor(Math.random() * 12) + 4
          ),
        });
      }
    }

    return commitments;
  }

  private async identifyPlanningRisks(
    config: SolutionPlanningConfig,
    commitments: SolutionCommitment[]
  ): Promise<PlanningRisk[]> {
    const risks: PlanningRisk[] = [];

    // Identify resource risks
    const highCommitmentARTs = filter(
      config.participatingARTs,
      (art) => art.commitmentLevel === CommitmentLevel.HIGH
    );
    if (highCommitmentARTs.length > config.participatingARTs.length * 0.7) {
      risks.push({
        riskId: `, risk - $, {} `,`, category, RiskCategory.RESOURCE, description, 'High commitment levels across ARTs may lead to resource constraints', probability, RiskProbability.MEDIUM, impact, RiskImpact.HIGH, mitigation, 'Monitor capacity utilization and adjust commitments as needed', owner, 'Solution Train Engineer', status, RiskStatus.OPEN);
        }
        ;
    }
    // Identify integration risks
    ,
    // Identify integration risks
    if(commitments) { }, : .length > 15
};
{
    risks.push({
        riskId: `risk-${generateNanoId(8)}`,
    } `
        category: RiskCategory.INTEGRATION,
        description:
          'High number of commitments increases integration complexity',
        probability: RiskProbability.HIGH,
        impact: RiskImpact.MEDIUM,
        mitigation: 'Implement continuous integration practices',
        owner: 'Solution Architect',
        status: RiskStatus.OPEN,
      });
    }

    return risks;
  }

  private async manageCrossARTDependencies(
    arts: PlanningART[]
  ): Promise<CrossARTDependency[]> {
    const dependencies: CrossARTDependency[] = [];

    // Generate cross-ART dependencies based on ART domains
    for (let i = 0; i < arts.length; i++) {
      for (let j = i + 1; j < arts.length; j++) {
        if (Math.random() > 0.7) {
          // 30% chance of dependency
          dependencies.push({
            dependencyId: `, dep - $, {} `,`, fromART, arts[i].artId, toART, arts[j].artId, description, `Integration dependency between ${arts[i].domain} and ${arts[j].domain}`, `
            type: DependencyType.SERVICE,
            status: DependencyStatus.PLANNED,
            plannedDate: addWeeks(
              new Date(),
              Math.floor(Math.random() * 8) + 2
            ),
            impact: ImpactLevel.MEDIUM,
          });
        }
      }
    }

    return dependencies;
  }

  private async generateNextSteps(
    commitments: SolutionCommitment[],
    risks: PlanningRisk[],
    dependencies: CrossARTDependency[]
  ): Promise<NextStep[]> {
    const nextSteps: NextStep[] = [];

    // Generate steps for high-risk items
    for (const risk of risks) {
      if (
        risk.impact === RiskImpact.HIGH || risk.probability === RiskProbability.HIGH
      ) {
        nextSteps.push({
          stepId: `, step - $, {} `,`, description, `Address high-priority risk: ${risk.description}`, `
          owner: risk.owner,
          dueDate: addDays(new Date(), 7),
          priority:'high',
          dependencies: [],
        });
      }
    }

    // Generate steps for critical dependencies
    const criticalDeps = filter(
      dependencies,
      (dep) => dep.impact === ImpactLevel.HIGH
    );
    for (const dep of criticalDeps) {
      nextSteps.push({
        stepId: `, step - $, {} `,`, description, `Coordinate critical dependency: ${dep.description}`, `
        owner: 'Solution Train Engineer',
        dueDate: addDays(new Date(), 3),
        priority: 'high',
        dependencies: [dep.dependencyId],
      });
    }

    return nextSteps;
  }

  private getRandomConfidence(): ConfidenceLevel {
    const confidences = [
      ConfidenceLevel.HIGH,
      ConfidenceLevel.MEDIUM,
      ConfidenceLevel.LOW,
    ];
    return confidences[Math.floor(Math.random() * confidences.length)];
  }

  /**
   * Getter methods
   */
  getPlanningResult(resultId: string): SolutionPlanningResult | undefined 
    return this.planningResults.get(resultId);

  getCommitment(commitmentId: string): SolutionCommitment | undefined 
    return this.commitments.get(commitmentId);

  getRisk(riskId: string): PlanningRisk | undefined 
    return this.risks.get(riskId);

  getAllCommitments(): SolutionCommitment[] 
    return Array.from(this.commitments.values())();

  getAllRisks(): PlanningRisk[] 
    return Array.from(this.risks.values())();

  getOpenRisks(): PlanningRisk[] 
    return filter(
      Array.from(this.risks.values()),
      (risk) => risk.status === RiskStatus.OPEN
    );
}

/**
 * Commitment progress interface
 */
interface CommitmentProgress {
  readonly commitmentId: string;
  readonly progress: number; // percentage
  readonly onTrack: boolean;
  readonly lastUpdate: Date;
  readonly blockers: string[];
  readonly nextMilestone: Date;
}
    );
}
