/**
 * @fileoverview Continuous Improvement Service
 *
 * Service for automated kaizen cycles and continuous improvement loops.
 * Handles improvement tracking, kaizen automation, and feedback loop management.
 *
 * SINGLE RESPONSIBILITY: Continuous improvement automation and kaizen cycles
 * FOCUSES ON: Kaizen automation, improvement tracking, feedback loops
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addDays, addWeeks, addMonths, differenceInDays, } = dateFns;
/**
 * Kaizen frequency
 */
export var KaizenFrequency;
(function (KaizenFrequency) {
    KaizenFrequency["DAILY"] = "daily";
    KaizenFrequency["WEEKLY"] = "weekly";
    KaizenFrequency["BI_WEEKLY"] = "bi_weekly";
    KaizenFrequency["MONTHLY"] = "monthly";
    KaizenFrequency["QUARTERLY"] = "quarterly";
})(KaizenFrequency || (KaizenFrequency = {}));
/**
 * Facilitation mode
 */
export var FacilitationMode;
(function (FacilitationMode) {
    FacilitationMode["FULLY_AUTOMATED"] = "fully_automated";
    FacilitationMode["HUMAN_GUIDED"] = "human_guided";
    FacilitationMode["HYBRID"] = "hybrid";
})(FacilitationMode || (FacilitationMode = {}));
/**
 * Improvement type
 */
export var ImprovementType;
(function (ImprovementType) {
    ImprovementType["PROCESS"] = "process";
    ImprovementType["TECHNOLOGY"] = "technology";
    ImprovementType["SKILLS"] = "skills";
    ImprovementType["ORGANIZATION"] = "organization";
    ImprovementType["CULTURE"] = "culture";
    ImprovementType["MEASUREMENT"] = "measurement";
})(ImprovementType || (ImprovementType = {}));
/**
 * Automation level
 */
export var AutomationLevel;
(function (AutomationLevel) {
    AutomationLevel["MANUAL"] = "manual";
    AutomationLevel["SEMI_AUTOMATED"] = "semi_automated";
    AutomationLevel["FULLY_AUTOMATED"] = "fully_automated";
})(AutomationLevel || (AutomationLevel = {}));
/**
 * Feedback loop type
 */
export var FeedbackLoopType;
(function (FeedbackLoopType) {
    FeedbackLoopType["METRICS_BASED"] = "metrics_based";
    FeedbackLoopType["OBSERVATION_BASED"] = "observation_based";
    FeedbackLoopType["SURVEY_BASED"] = "survey_based";
    FeedbackLoopType["EVENT_DRIVEN"] = "event_driven";
    FeedbackLoopType["HYBRID"] = "hybrid";
})(FeedbackLoopType || (FeedbackLoopType = {}));
/**
 * Loop frequency
 */
export var LoopFrequency;
(function (LoopFrequency) {
    LoopFrequency["REAL_TIME"] = "real_time";
    LoopFrequency["HOURLY"] = "hourly";
    LoopFrequency["DAILY"] = "daily";
    LoopFrequency["WEEKLY"] = "weekly";
    LoopFrequency["MONTHLY"] = "monthly";
})(LoopFrequency || (LoopFrequency = {}));
/**
 * Participant responsibility
 */
export var ParticipantResponsibility;
(function (ParticipantResponsibility) {
    ParticipantResponsibility["DATA_PROVIDER"] = "data_provider";
    ParticipantResponsibility["ANALYZER"] = "analyzer";
    ParticipantResponsibility["DECISION_MAKER"] = "decision_maker";
    ParticipantResponsibility["IMPLEMENTER"] = "implementer";
    ParticipantResponsibility["VALIDATOR"] = "validator";
})(ParticipantResponsibility || (ParticipantResponsibility = {}));
/**
 * Authority level
 */
export var AuthorityLevel;
(function (AuthorityLevel) {
    AuthorityLevel["OBSERVER"] = "observer";
    AuthorityLevel["ADVISOR"] = "advisor";
    AuthorityLevel["APPROVER"] = "approver";
    AuthorityLevel["EXECUTOR"] = "executor";
})(AuthorityLevel || (AuthorityLevel = {}));
/**
 * Data source type
 */
export var DataSourceType;
(function (DataSourceType) {
    DataSourceType["DATABASE"] = "database";
    DataSourceType["API"] = "api";
    DataSourceType["FILE"] = "file";
    DataSourceType["STREAM"] = "stream";
    DataSourceType["MANUAL"] = "manual";
    DataSourceType["SENSOR"] = "sensor";
})(DataSourceType || (DataSourceType = {}));
/**
 * Aggregation type
 */
export var AggregationType;
(function (AggregationType) {
    AggregationType["SUM"] = "sum";
    AggregationType["AVERAGE"] = "average";
    AggregationType["COUNT"] = "count";
    AggregationType["MAX"] = "max";
    AggregationType["MIN"] = "min";
    AggregationType["MEDIAN"] = "median";
    AggregationType["PERCENTILE"] = "percentile";
})(AggregationType || (AggregationType = {}));
/**
 * Action type
 */
export var ActionType;
(function (ActionType) {
    ActionType["NOTIFICATION"] = "notification";
    ActionType["ESCALATION"] = "escalation";
    ActionType["AUTOMATION"] = "automation";
    ActionType["INVESTIGATION"] = "investigation";
    ActionType["IMPROVEMENT"] = "improvement";
})(ActionType || (ActionType = {}));
/**
 * Trigger priority
 */
export var TriggerPriority;
(function (TriggerPriority) {
    TriggerPriority["LOW"] = "low";
    TriggerPriority["MEDIUM"] = "medium";
    TriggerPriority["HIGH"] = "high";
    TriggerPriority["CRITICAL"] = "critical";
})(TriggerPriority || (TriggerPriority = {}));
/**
 * Objective category
 */
export var ObjectiveCategory;
(function (ObjectiveCategory) {
    ObjectiveCategory["EFFICIENCY"] = "efficiency";
    ObjectiveCategory["QUALITY"] = "quality";
    ObjectiveCategory["SPEED"] = "speed";
    ObjectiveCategory["COST"] = "cost";
    ObjectiveCategory["SATISFACTION"] = "satisfaction";
    ObjectiveCategory["INNOVATION"] = "innovation";
})(ObjectiveCategory || (ObjectiveCategory = {}));
/**
 * Checkpoint purpose
 */
export var CheckpointPurpose;
(function (CheckpointPurpose) {
    CheckpointPurpose["PROGRESS_REVIEW"] = "progress_review";
    CheckpointPurpose["COURSE_CORRECTION"] = "course_correction";
    CheckpointPurpose["STAKEHOLDER_UPDATE"] = "stakeholder_update";
    CheckpointPurpose["RISK_ASSESSMENT"] = "risk_assessment";
})(CheckpointPurpose || (CheckpointPurpose = {}));
/**
 * Measurement approach
 */
export var MeasurementApproach;
(function (MeasurementApproach) {
    MeasurementApproach["OKR"] = "okr";
    MeasurementApproach["BALANCED_SCORECARD"] = "balanced_scorecard";
    MeasurementApproach["LEAN_METRICS"] = "lean_metrics";
    MeasurementApproach["CUSTOM"] = "custom";
})(MeasurementApproach || (MeasurementApproach = {}));
/**
 * Measurement frequency
 */
export var MeasurementFrequency;
(function (MeasurementFrequency) {
    MeasurementFrequency["REAL_TIME"] = "real_time";
    MeasurementFrequency["HOURLY"] = "hourly";
    MeasurementFrequency["DAILY"] = "daily";
    MeasurementFrequency["WEEKLY"] = "weekly";
    MeasurementFrequency["MONTHLY"] = "monthly";
    MeasurementFrequency["QUARTERLY"] = "quarterly";
})(MeasurementFrequency || (MeasurementFrequency = {}));
/**
 * Reporting frequency
 */
export var ReportingFrequency;
(function (ReportingFrequency) {
    ReportingFrequency["REAL_TIME"] = "real_time";
    ReportingFrequency["DAILY"] = "daily";
    ReportingFrequency["WEEKLY"] = "weekly";
    ReportingFrequency["MONTHLY"] = "monthly";
    ReportingFrequency["QUARTERLY"] = "quarterly";
    ReportingFrequency["ANNUALLY"] = "annually";
})(ReportingFrequency || (ReportingFrequency = {}));
/**
 * Report format
 */
export var ReportFormat;
(function (ReportFormat) {
    ReportFormat["DASHBOARD"] = "dashboard";
    ReportFormat["EMAIL"] = "email";
    ReportFormat["PDF"] = "pdf";
    ReportFormat["PRESENTATION"] = "presentation";
    ReportFormat["API"] = "api";
})(ReportFormat || (ReportFormat = {}));
/**
 * Delivery method
 */
export var DeliveryMethod;
(function (DeliveryMethod) {
    DeliveryMethod["EMAIL"] = "email";
    DeliveryMethod["SLACK"] = "slack";
    DeliveryMethod["TEAMS"] = "teams";
    DeliveryMethod["DASHBOARD"] = "dashboard";
    DeliveryMethod["API"] = "api";
})(DeliveryMethod || (DeliveryMethod = {}));
/**
 * Change process
 */
export var ChangeProcess;
(function (ChangeProcess) {
    ChangeProcess["LIGHTWEIGHT"] = "lightweight";
    ChangeProcess["STANDARD"] = "standard";
    ChangeProcess["COMPREHENSIVE"] = "comprehensive";
})(ChangeProcess || (ChangeProcess = {}));
/**
 * Improvement category
 */
export var ImprovementCategory;
(function (ImprovementCategory) {
    ImprovementCategory["WASTE_ELIMINATION"] = "waste_elimination";
    ImprovementCategory["PROCESS_STREAMLINING"] = "process_streamlining";
    ImprovementCategory["AUTOMATION"] = "automation";
    ImprovementCategory["SKILL_DEVELOPMENT"] = "skill_development";
    ImprovementCategory["QUALITY_IMPROVEMENT"] = "quality_improvement";
    ImprovementCategory["COMMUNICATION"] = "communication";
})(ImprovementCategory || (ImprovementCategory = {}));
/**
 * Improvement priority
 */
export var ImprovementPriority;
(function (ImprovementPriority) {
    ImprovementPriority["CRITICAL"] = "critical";
    ImprovementPriority["HIGH"] = "high";
    ImprovementPriority["MEDIUM"] = "medium";
    ImprovementPriority["LOW"] = "low";
})(ImprovementPriority || (ImprovementPriority = {}));
/**
 * Effort complexity
 */
export var EffortComplexity;
(function (EffortComplexity) {
    EffortComplexity["SIMPLE"] = "simple";
    EffortComplexity["MODERATE"] = "moderate";
    EffortComplexity["COMPLEX"] = "complex";
    EffortComplexity["VERY_COMPLEX"] = "very_complex";
})(EffortComplexity || (EffortComplexity = {}));
/**
 * Feasibility level
 */
export var FeasibilityLevel;
(function (FeasibilityLevel) {
    FeasibilityLevel["HIGH"] = "high";
    FeasibilityLevel["MEDIUM"] = "medium";
    FeasibilityLevel["LOW"] = "low";
    FeasibilityLevel["BLOCKED"] = "blocked";
})(FeasibilityLevel || (FeasibilityLevel = {}));
/**
 * Implementation status
 */
export var ImplementationStatus;
(function (ImplementationStatus) {
    ImplementationStatus["PLANNED"] = "planned";
    ImplementationStatus["IN_PROGRESS"] = "in_progress";
    ImplementationStatus["COMPLETED"] = "completed";
    ImplementationStatus["ON_HOLD"] = "on_hold";
    ImplementationStatus["CANCELLED"] = "cancelled";
})(ImplementationStatus || (ImplementationStatus = {}));
/**
 * Blocker category
 */
export var BlockerCategory;
(function (BlockerCategory) {
    BlockerCategory["TECHNICAL"] = "technical";
    BlockerCategory["ORGANIZATIONAL"] = "organizational";
    BlockerCategory["RESOURCE"] = "resource";
    BlockerCategory["DEPENDENCY"] = "dependency";
    BlockerCategory["POLICY"] = "policy";
})(BlockerCategory || (BlockerCategory = {}));
/**
 * Blocker severity
 */
export var BlockerSeverity;
(function (BlockerSeverity) {
    BlockerSeverity["MINOR"] = "minor";
    BlockerSeverity["MODERATE"] = "moderate";
    BlockerSeverity["MAJOR"] = "major";
    BlockerSeverity["CRITICAL"] = "critical";
})(BlockerSeverity || (BlockerSeverity = {}));
/**
 * Learning category
 */
export var LearningCategory;
(function (LearningCategory) {
    LearningCategory["PROCESS"] = "process";
    LearningCategory["FACILITATION"] = "facilitation";
    LearningCategory["ENGAGEMENT"] = "engagement";
    LearningCategory["MEASUREMENT"] = "measurement";
    LearningCategory["IMPLEMENTATION"] = "implementation";
})(LearningCategory || (LearningCategory = {}));
/**
 * Continuous Improvement Service
 */
export class ContinuousImprovementService {
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Execute automated kaizen cycle
     */
    async executeAutomatedKaizenCycle(_config, _currentMetrics) {
        const _cycleId = `kaizen-${generateNanoId(12)}`;
        `

    this.logger.info('Executing automated kaizen cycle', {'
      cycleId,
      valueStreamId: config.valueStreamId,
      automationLevel: config.automationLevel,
    });

    try {
      // Identify improvement opportunities
      const improvementsIdentified =
        await this.identifyImprovementOpportunities(config, currentMetrics);

      // Prioritize improvements
      const prioritizedImprovements = await this.prioritizeImprovements(
        improvementsIdentified,
        config.improvementObjectives
      );

      // Plan implementations
      const implementationPlans = await this.planImplementations(
        prioritizedImprovements,
        config
      );

      // Execute quick wins
      const implementedImprovements = await this.executeQuickWins(
        implementationPlans,
        config.automationLevel
      );

      // Measure cycle effectiveness
      const cycleMetrics = await this.measureCycleEffectiveness(
        improvementsIdentified,
        implementedImprovements
      );

      // Capture learnings
      const learnings = await this.captureCycleLearnings(
        improvementsIdentified,
        implementedImprovements,
        cycleMetrics
      );

      const cycle: AutomatedKaizenCycle = {
        cycleId,
        valueStreamId: config.valueStreamId,
        timestamp: new Date(),
        cycleNumber: this.getNextCycleNumber(config.valueStreamId),
        participantsCount: config.kaizenConfig.participantRoles.length,
        improvementsIdentified,
        improvementsImplemented: implementedImprovements,
        cycleMetrics,
        nextCycleDate: this.calculateNextCycleDate(config.kaizenConfig),
        learnings,
      };

      this.kaizenCycles.set(cycleId, cycle);

      this.logger.info('Automated kaizen cycle completed', {'
        cycleId,
        improvementsIdentified: improvementsIdentified.length,
        improvementsImplemented: implementedImprovements.length,
        cycleEffectiveness: Math.round(cycleMetrics.improvementRate * 100),
        nextCycleDate: format(cycle.nextCycleDate, 'yyyy-MM-dd'),
      });

      return cycle;
    } catch (error) {
      this.logger.error('Failed to execute automated kaizen cycle', {'
        cycleId,
        error,
      });
      throw error;
    }
  }

  /**
   * Execute continuous improvement loop
   */
  async executeContinuousImprovementLoop(
    valueStreamId: string,
    config: ContinuousImprovementConfig
  ): Promise<void> {
    this.logger.info('Executing continuous improvement loop', {'
      valueStreamId,
    });

    // Initialize feedback loops
    for (const loopConfig of config.feedbackLoops) {
      await this.initializeFeedbackLoop(loopConfig);
    }

    // Start monitoring and improvement cycle
    await this.startImprovementMonitoring(config);
  }

  /**
   * Get kaizen cycle result
   */
  getKaizenCycle(cycleId: string): AutomatedKaizenCycle | undefined {
    return this.kaizenCycles.get(cycleId);
  }

  /**
   * Get active improvements
   */
  getActiveImprovements(): ImprovementImplementation[] {
    return Array.from(this.activeImprovements.values()).filter(
      (impl) => impl.status === ImplementationStatus.IN_PROGRESS
    );
  }

  /**
   * Private helper methods
   */
  private async identifyImprovementOpportunities(
    config: ContinuousImprovementConfig,
    currentMetrics: any
  ): Promise<ImprovementItem[]> {
    const opportunities: ImprovementItem[] = [];

    // Analyze current metrics for improvement opportunities
    if (
      currentMetrics.cycleTime &&
      currentMetrics.cycleTime.variance > currentMetrics.cycleTime.average * 0.3
    ) {
      opportunities.push({
        itemId: `;
        improvement - $generateNanoId(8) `,`;
        title: 'Reduce cycle time variance',
            description;
        'High variance in cycle time indicates process inconsistency',
            category;
        ImprovementCategory.PROCESS_STREAMLINING,
            priority;
        ImprovementPriority.HIGH,
            effort;
        timeHours: 40,
            resources;
        [
            resourceType, 'people',
            quantity, 2,
            duration, 5,
            skills, ['Process Analysis', 'Lean'], ,
        ],
            complexity;
        EffortComplexity.MODERATE,
            dependencies;
        [], ,
            impact;
        cycleTimeReduction: 15,
            qualityImprovement;
        10,
            costSavings;
        5000,
            satisfactionIncrease;
        8,
            confidence;
        80, ,
            feasibility;
        technical: FeasibilityLevel.HIGH,
            organizational;
        FeasibilityLevel.MEDIUM,
            financial;
        FeasibilityLevel.HIGH,
            timeline;
        FeasibilityLevel.HIGH,
            overall;
        FeasibilityLevel.HIGH,
            constraints;
        [], ,
            proposedBy;
        'AI Analysis',
            supportLevel;
        85,
        ;
    }
    ;
}
// Add more opportunity identification logic based on metrics
if (currentMetrics.queueLength && currentMetrics.queueLength.average > 10) {
    opportunities.push({
        itemId: `improvement-${generateNanoId(8)}`,
    } `
        title: 'Reduce queue length',
        description:
          'Long queues indicate capacity constraints or inefficient resource allocation',
        category: ImprovementCategory.WASTE_ELIMINATION,
        priority: ImprovementPriority.HIGH,
        effort: {
          timeHours: 60,
          resources: [
            {
              resourceType: 'people',
              quantity: 3,
              duration: 10,
              skills: ['Capacity Planning', 'Resource Management'],
            },
          ],
          complexity: EffortComplexity.COMPLEX,
          dependencies: ['Resource approval'],
        },
        impact: {
          cycleTimeReduction: 20,
          qualityImprovement: 5,
          costSavings: 8000,
          satisfactionIncrease: 12,
          confidence: 75,
        },
        feasibility: {
          technical: FeasibilityLevel.MEDIUM,
          organizational: FeasibilityLevel.MEDIUM,
          financial: FeasibilityLevel.MEDIUM,
          timeline: FeasibilityLevel.MEDIUM,
          overall: FeasibilityLevel.MEDIUM,
          constraints: ['Budget approval required'],
        },
        proposedBy: 'AI Analysis',
        supportLevel: 78,
      });
    }

    return orderBy(
      opportunities,
      ['priority', 'supportLevel'],
      ['desc', 'desc']'
    );
  }

  private async prioritizeImprovements(
    improvements: ImprovementItem[],
    objectives: ImprovementObjective[]
  ): Promise<ImprovementItem[]> {
    // Score improvements based on alignment with objectives
    const scoredImprovements = improvements.map((improvement) => ({
      ...improvement,
      score: this.scoreImprovement(improvement, objectives),
    }));

    return orderBy(scoredImprovements, 'score', 'desc');'
  }

  private scoreImprovement(
    improvement: ImprovementItem,
    objectives: ImprovementObjective[]
  ): number {
    let score = 0;

    // Base score from impact and feasibility
    score += improvement.impact.confidence * 0.3;
    score += this.mapFeasibilityToScore(improvement.feasibility.overall) * 0.2;
    score += this.mapPriorityToScore(improvement.priority) * 0.2;
    score += improvement.supportLevel * 0.1;

    // Bonus for alignment with objectives
    const alignmentBonus = objectives.reduce((bonus, objective) => {
      if (this.isAlignedWithObjective(improvement, objective)) {
        return bonus + 20;
      }
      return bonus;
    }, 0);

    score += Math.min(alignmentBonus, 20) * 0.2;

    return Math.min(100, Math.max(0, score));
  }

  private async planImplementations(
    improvements: ImprovementItem[],
    config: ContinuousImprovementConfig
  ): Promise<ImprovementImplementation[]> {
    const plans: ImprovementImplementation[] = [];

    for (const improvement of improvements.slice(0, 5)) {
      // Top 5 improvements
      const implementation: ImprovementImplementation = {
        implementationId: `, impl - $, {} `,`, improvementId, improvement.itemId, status, ImplementationStatus.PLANNED, progress, 0, startDate, new Date(), actualEffort, {
        timeHours: 0,
        resourcesUsed: [],
        complexityEncountered: improvement.effort.complexity,
        blockers: [],
    }, actualImpact, {
        measuredImprovements: [],
        unexpectedBenefits: [],
        unintendedConsequences: [],
        satisfaction: {
            participants: 0,
            averageScore: 0,
            feedback: [],
            recommendations: [],
        },
    }, lessons, []);
}
;
plans.push(implementation);
return plans;
async;
executeQuickWins(implementations, ImprovementImplementation[], automationLevel, AutomationLevel);
Promise < ImprovementImplementation[] > {
    const: executed, ImprovementImplementation, []:  = [],
    for(, impl, of, implementations) {
        if (automationLevel === AutomationLevel.FULLY_AUTOMATED) {
            // Simulate quick implementation for demo
            const executedImpl = {
                ...impl,
                status: ImplementationStatus.COMPLETED,
                progress: 100,
                completionDate: new Date(),
                actualImpact: {
                    measuredImprovements: [
                        {
                            metric: 'Cycle Time',
                            before: 100,
                            after: 85,
                            improvement: 15,
                            confidence: 80,
                        },
                    ],
                    unexpectedBenefits: ['Improved team morale'],
                    unintendedConsequences: [],
                    satisfaction: {
                        participants: 5,
                        averageScore: 8.2,
                        feedback: ['Great improvement', 'Easy to implement'],
                        recommendations: ['Scale to other areas'],
                    },
                },
                lessons: ['Automation accelerates implementation'],
            };
            this.activeImprovements.set(impl.implementationId, executedImpl);
            executed.push(executedImpl);
        }
    },
    return: executed
};
async;
measureCycleEffectiveness(identified, ImprovementItem[], implemented, ImprovementImplementation[]);
Promise < CycleMetrics > {
    return: {
        participationRate: 85, // Simulated
        improvementRate: implemented.length / identified.length,
        cycleTime: 7, // days
        satisfaction: 8.2, // 1-10 scale
        roi: 150, // percentage
        learningIndex: 75, // 0-100
    }
};
async;
captureCycleLearnings(identified, ImprovementItem[], implemented, ImprovementImplementation[], metrics, CycleMetrics);
Promise < CycleLearning[] > {
    return: [
        {
            learningId: `learning-${generateNanoId(6)}`,
        } `
        category: LearningCategory.PROCESS,
        description: 'Automated identification increases opportunity discovery',
        application: 'Use AI analysis for future cycles',
        confidence: 85,
        source: 'Cycle Analysis',
      },
      {
        learningId: `, learning - $, {} `,`,
        category, LearningCategory.IMPLEMENTATION,
        description, 'Quick wins build momentum',
        application, 'Prioritize quick wins in early cycles',
        confidence, 90,
        source, 'Implementation Results',
    ]
},
;
;
async;
initializeFeedbackLoop(config, FeedbackLoopConfig);
Promise < void  > {
    this: .feedbackLoops.set(config.loopId, config),
    this: .logger.info('Feedback loop initialized', { ': loopId, config, : .loopId,
        type: config.type,
        frequency: config.frequency,
    })
};
async;
startImprovementMonitoring(config, ContinuousImprovementConfig);
Promise < void  > {
    // Start monitoring improvement progress and triggering actions
    this: .logger.info('Started improvement monitoring', { ': valueStreamId, config, : .valueStreamId,
        feedbackLoops: config.feedbackLoops.length,
    })
};
getNextCycleNumber(valueStreamId, string);
number;
{
    const cycles = Array.from(this.kaizenCycles.values()).filter((c) => c.valueStreamId === valueStreamId);
    return cycles.length + 1;
}
calculateNextCycleDate(config, KaizenConfig);
Date;
{
    return addDays(new Date(), config.cycleLength);
}
mapFeasibilityToScore(feasibility, FeasibilityLevel);
number;
{
    switch (feasibility) {
        case FeasibilityLevel.HIGH:
            return 90;
        case FeasibilityLevel.MEDIUM:
            return 60;
        case FeasibilityLevel.LOW:
            return 30;
        case FeasibilityLevel.BLOCKED:
            return 0;
        default:
            return 50;
    }
}
mapPriorityToScore(priority, ImprovementPriority);
number;
{
    switch (priority) {
        case ImprovementPriority.CRITICAL:
            return 100;
        case ImprovementPriority.HIGH:
            return 80;
        case ImprovementPriority.MEDIUM:
            return 60;
        case ImprovementPriority.LOW:
            return 40;
        default:
            return 50;
    }
}
isAlignedWithObjective(improvement, ImprovementItem, objective, ImprovementObjective);
boolean;
{
    // Simple alignment check based on category matching
    const categoryAlignment = {
        [ImprovementCategory.WASTE_ELIMINATION]: [
            ObjectiveCategory.EFFICIENCY,
            ObjectiveCategory.COST,
        ],
        [ImprovementCategory.PROCESS_STREAMLINING]: [
            ObjectiveCategory.EFFICIENCY,
            ObjectiveCategory.SPEED,
        ],
        [ImprovementCategory.QUALITY_IMPROVEMENT]: [
            ObjectiveCategory.QUALITY,
            ObjectiveCategory.SATISFACTION,
        ],
        [ImprovementCategory.AUTOMATION]: [
            ObjectiveCategory.EFFICIENCY,
            ObjectiveCategory.SPEED,
            ObjectiveCategory.COST,
        ],
    };
    const alignedCategories = categoryAlignment[improvement.category] || [];
    return alignedCategories.includes(objective.category);
}
