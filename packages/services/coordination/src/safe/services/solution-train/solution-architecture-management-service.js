/**
 * @fileoverview Solution Architecture Management Service
 *
 * Service for solution-level architecture management and governance.
 * Handles architectural runway management, technology standards, and cross-ART architectural alignment.
 *
 * SINGLE RESPONSIBILITY: Solution architecture management and governance
 * FOCUSES ON: Architectural runway, technology governance, cross-ART alignment
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addMonths, addWeeks, addDays } = dateFns;
/**
 * Principle categories
 */
export var PrincipleCategory;
(function (PrincipleCategory) {
    PrincipleCategory["BUSINESS"] = "business";
    PrincipleCategory["DATA"] = "data";
    PrincipleCategory["APPLICATION"] = "application";
    PrincipleCategory["TECHNOLOGY"] = "technology";
    PrincipleCategory["SECURITY"] = "security";
    PrincipleCategory["INTEGRATION"] = "integration";
})(PrincipleCategory || (PrincipleCategory = {}));
/**
 * Attribute priority
 */
export var AttributePriority;
(function (AttributePriority) {
    AttributePriority["CRITICAL"] = "critical";
    AttributePriority["HIGH"] = "high";
    AttributePriority["MEDIUM"] = "medium";
    AttributePriority["LOW"] = "low";
})(AttributePriority || (AttributePriority = {}));
/**
 * Constraint types
 */
export var ConstraintType;
(function (ConstraintType) {
    ConstraintType["TECHNICAL"] = "technical";
    ConstraintType["REGULATORY"] = "regulatory";
    ConstraintType["ORGANIZATIONAL"] = "organizational";
    ConstraintType["BUDGET"] = "budget";
    ConstraintType["TIME"] = "time";
    ConstraintType["LEGACY"] = "legacy";
})(ConstraintType || (ConstraintType = {}));
/**
 * Constraint impact
 */
export var ConstraintImpact;
(function (ConstraintImpact) {
    ConstraintImpact["HIGH"] = "high";
    ConstraintImpact["MEDIUM"] = "medium";
    ConstraintImpact["LOW"] = "low";
})(ConstraintImpact || (ConstraintImpact = {}));
/**
 * Transition approaches
 */
export var TransitionApproach;
(function (TransitionApproach) {
    TransitionApproach["BIG_BANG"] = "big_bang";
    TransitionApproach["PHASED"] = "phased";
    TransitionApproach["PARALLEL"] = "parallel";
    TransitionApproach["PILOT"] = "pilot";
})(TransitionApproach || (TransitionApproach = {}));
/**
 * Standard categories
 */
export var StandardCategory;
(function (StandardCategory) {
    StandardCategory["PROGRAMMING_LANGUAGE"] = "programming_language";
    StandardCategory["FRAMEWORK"] = "framework";
    StandardCategory["DATABASE"] = "database";
    StandardCategory["MESSAGING"] = "messaging";
    StandardCategory["SECURITY"] = "security";
    StandardCategory["MONITORING"] = "monitoring";
    StandardCategory["DEPLOYMENT"] = "deployment";
    StandardCategory["INTEGRATION"] = "integration";
})(StandardCategory || (StandardCategory = {}));
/**
 * Standard scope
 */
export var StandardScope;
(function (StandardScope) {
    StandardScope["MANDATORY"] = "mandatory";
    StandardScope["RECOMMENDED"] = "recommended";
    StandardScope["APPROVED"] = "approved";
    StandardScope["RESTRICTED"] = "restricted";
    StandardScope["DEPRECATED"] = "deprecated";
})(StandardScope || (StandardScope = {}));
/**
 * Compliance levels
 */
export var ComplianceLevel;
(function (ComplianceLevel) {
    ComplianceLevel["STRICT"] = "strict";
    ComplianceLevel["FLEXIBLE"] = "flexible";
    ComplianceLevel["ADVISORY"] = "advisory";
})(ComplianceLevel || (ComplianceLevel = {}));
/**
 * Lifecycle status
 */
export var LifecycleStatus;
(function (LifecycleStatus) {
    LifecycleStatus["EMERGING"] = "emerging";
    LifecycleStatus["TRIAL"] = "trial";
    LifecycleStatus["ADOPT"] = "adopt";
    LifecycleStatus["HOLD"] = "hold";
    LifecycleStatus["DEPRECATED"] = "deprecated";
})(LifecycleStatus || (LifecycleStatus = {}));
/**
 * Governance framework
 */
export var GovernanceFramework;
(function (GovernanceFramework) {
    GovernanceFramework["CENTRALIZED"] = "centralized";
    GovernanceFramework["FEDERATED"] = "federated";
    GovernanceFramework["DECENTRALIZED"] = "decentralized";
    GovernanceFramework["HYBRID"] = "hybrid";
})(GovernanceFramework || (GovernanceFramework = {}));
/**
 * Decision types
 */
export var DecisionType;
(function (DecisionType) {
    DecisionType["TECHNOLOGY_ADOPTION"] = "technology_adoption";
    DecisionType["ARCHITECTURAL_CHANGE"] = "architectural_change";
    DecisionType["STANDARD_EXCEPTION"] = "standard_exception";
    DecisionType["PATTERN_APPROVAL"] = "pattern_approval";
    DecisionType["DESIGN_REVIEW"] = "design_review";
})(DecisionType || (DecisionType = {}));
/**
 * Review triggers
 */
export var ReviewTrigger;
(function (ReviewTrigger) {
    ReviewTrigger["MILESTONE"] = "milestone";
    ReviewTrigger["TIME_BASED"] = "time_based";
    ReviewTrigger["CHANGE_DRIVEN"] = "change_driven";
    ReviewTrigger["EXCEPTION_REQUEST"] = "exception_request";
})(ReviewTrigger || (ReviewTrigger = {}));
/**
 * Criteria categories
 */
export var CriteriaCategory;
(function (CriteriaCategory) {
    CriteriaCategory["ALIGNMENT"] = "alignment";
    CriteriaCategory["COMPLIANCE"] = "compliance";
    CriteriaCategory["QUALITY"] = "quality";
    CriteriaCategory["FEASIBILITY"] = "feasibility";
    CriteriaCategory["RISK"] = "risk";
    CriteriaCategory["PERFORMANCE"] = "performance";
})(CriteriaCategory || (CriteriaCategory = {}));
/**
 * Measurement frequency
 */
export var MeasurementFrequency;
(function (MeasurementFrequency) {
    MeasurementFrequency["CONTINUOUS"] = "continuous";
    MeasurementFrequency["DAILY"] = "daily";
    MeasurementFrequency["WEEKLY"] = "weekly";
    MeasurementFrequency["MONTHLY"] = "monthly";
    MeasurementFrequency["QUARTERLY"] = "quarterly";
})(MeasurementFrequency || (MeasurementFrequency = {}));
/**
 * Runway approaches
 */
export var RunwayApproach;
(function (RunwayApproach) {
    RunwayApproach["CONTINUOUS"] = "continuous";
    RunwayApproach["BATCH"] = "batch";
    RunwayApproach["HYBRID"] = "hybrid";
})(RunwayApproach || (RunwayApproach = {}));
/**
 * Runway categories
 */
export var RunwayCategory;
(function (RunwayCategory) {
    RunwayCategory["INFRASTRUCTURE"] = "infrastructure";
    RunwayCategory["PLATFORM"] = "platform";
    RunwayCategory["INTEGRATION"] = "integration";
    RunwayCategory["SECURITY"] = "security";
    RunwayCategory["COMPLIANCE"] = "compliance";
    RunwayCategory["PERFORMANCE"] = "performance";
})(RunwayCategory || (RunwayCategory = {}));
/**
 * Component types
 */
export var ComponentType;
(function (ComponentType) {
    ComponentType["PLATFORM"] = "platform";
    ComponentType["LIBRARY"] = "library";
    ComponentType["SERVICE"] = "service";
    ComponentType["TOOL"] = "tool";
    ComponentType["PATTERN"] = "pattern";
    ComponentType["STANDARD"] = "standard";
})(ComponentType || (ComponentType = {}));
/**
 * Component status
 */
export var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["PLANNED"] = "planned";
    ComponentStatus["IN_DEVELOPMENT"] = "in_development";
    ComponentStatus["AVAILABLE"] = "available";
    ComponentStatus["DEPRECATED"] = "deprecated";
    ComponentStatus["RETIRED"] = "retired";
})(ComponentStatus || (ComponentStatus = {}));
/**
 * Solution Architecture Management Service
 */
export class SolutionArchitectureManagementService {
    logger;
    configurations = new Map();
    runwayComponents = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Configure solution architecture management
     */
    async configureArchitecture(config) {
        this.logger.info('Configuring solution architecture management', { ': configId, config, : .configId,
            solutionId: config.solutionId,
            standardsCount: config.technologyStandards.length,
        });
        // Validate configuration
        this.validateArchitectureConfig(config);
        // Store configuration
        this.configurations.set(config.configId, config);
        // Initialize runway components
        for (const component of config.runwayManagement.components) {
            this.runwayComponents.set(component.componentId, component);
        }
        this.logger.info('Solution architecture management configured', { ': configId, config, : .configId,
        });
    }
    /**
     * Make architectural decision
     */
    async makeArchitecturalDecision(_decision) {
        const _decisionId = `decision-${generateNanoId(12)}`;
        `

    this.logger.info('Making architectural decision', {'
      decisionId,
      title: decision.title,
      alternativeCount: decision.alternatives.length,
    });

    // Evaluate alternatives
    const evaluation = await this.evaluateAlternatives(
      decision.alternatives,
      decision.criteria
    );

    // Select best alternative
    const selectedAlternative = this.selectBestAlternative(evaluation);

    const architecturalDecision: ArchitecturalDecision = {
      decisionId,
      title: decision.title,
      context: decision.context,
      alternatives: decision.alternatives,
      criteria: decision.criteria,
      selectedAlternative,
      rationale: `;
        Selected;
        based;
        on;
        evaluation;
        criteria: $selectedAlternative.name `,`;
        consequences: selectedAlternative.consequences,
            stakeholders;
        decision.stakeholders,
            status;
        DecisionStatus.APPROVED,
            decisionDate;
        new Date(),
            reviewDate;
        addMonths(new Date(), 6),
            urgency;
        decision.urgency,
        ;
    }
    ;
}
this.architecturalDecisions.set(decisionId, architecturalDecision);
this.logger.info('Architectural decision made', { ': decisionId,
    selectedAlternative, : .name,
    status: architecturalDecision.status,
});
return architecturalDecision;
/**
 * Assess architectural compliance
 */
async;
assessCompliance(configId, string);
Promise < ArchitecturalComplianceReport > {
    const: config = this.configurations.get(configId),
    if(, config) {
        throw new Error(`Configuration not found: ${configId}`);
        `
    }

    this.logger.info('Assessing architectural compliance', { configId });'

    const reportId = `;
        compliance - $generateNanoId(12) `;`;
        // Assess technology standards compliance
        const standardsCompliance = await this.assessStandardsCompliance(config.technologyStandards);
        // Assess principle adherence
        const principleCompliance = await this.assessPrincipleCompliance(config.architecturalVision.principles);
        // Assess quality attributes
        const qualityCompliance = await this.assessQualityCompliance(config.architecturalVision.qualityAttributes);
        // Calculate overall compliance
        const overallCompliance = this.calculateOverallCompliance(standardsCompliance, principleCompliance, qualityCompliance);
        const report = {
            reportId,
            configId,
            timestamp: new Date(),
            overallCompliance,
            standardsCompliance,
            principleCompliance,
            qualityCompliance,
            violations: this.identifyViolations(standardsCompliance, principleCompliance, qualityCompliance),
            recommendations: this.generateComplianceRecommendations(overallCompliance),
        };
        this.complianceReports.set(reportId, report);
        this.logger.info('Compliance assessment completed', { ': reportId,
            overallCompliance: Math.round(overallCompliance),
            violationCount: report.violations.length,
        });
        return report;
    }
    /**
     * Manage runway component
     */
    ,
    /**
     * Manage runway component
     */
    async manageRunwayComponent(componentId, operation, metadata) {
        const component = this.runwayComponents.get(componentId);
        if (!component) {
            throw new Error(`Runway component not found: ${componentId}`);
            `
    }

    this.logger.info('Managing runway component', {'
      componentId,
      operation,
      currentStatus: component.status,
    });

    let updatedComponent: RunwayComponent;

    switch (operation) {
      case ComponentOperation.PROMOTE:
        updatedComponent = {
          ...component,
          status: this.getNextStatus(component.status),
          lifecycle: {
            ...component.lifecycle,
            availableDate:
              component.status === ComponentStatus.IN_DEVELOPMENT
                ? new Date()
                : component.lifecycle.availableDate,
          },
        };
        break;

      case ComponentOperation.DEPRECATE:
        updatedComponent = {
          ...component,
          status: ComponentStatus.DEPRECATED,
          lifecycle: {
            ...component.lifecycle,
            deprecationDate: new Date(),
          },
        };
        break;

      case ComponentOperation.RETIRE:
        updatedComponent = {
          ...component,
          status: ComponentStatus.RETIRED,
          lifecycle: {
            ...component.lifecycle,
            retirementDate: new Date(),
          },
        };
        break;

      default:
        throw new Error(`;
            Unknown;
            component;
            operation: $operation `);`;
        }
        this.runwayComponents.set(componentId, updatedComponent);
        this.logger.info('Runway component updated', { ': componentId,
            newStatus: updatedComponent.status,
        });
        return updatedComponent;
    }
    /**
     * Private helper methods
     */
    ,
    if(, config) { }, : .configId || config.configId.trim() === ''
};
{
    ';
    throw new Error('Configuration ID is required');
    ';
}
if (!config.solutionId || config.solutionId.trim() === '') {
    ';
    throw new Error('Solution ID is required');
    ';
}
async;
evaluateAlternatives(alternatives, Alternative[], criteria, DecisionCriteria[]);
Promise;
return alternatives.map((alternative) => ({
    alternative,
    scores: criteria.map((criterion) => ({
        criterion: criterion.name,
        score: this.scoreAlternative(alternative, criterion),
        weight: criterion.weight,
    })),
    totalScore: this.calculateTotalScore(alternative, criteria),
}));
scoreAlternative(alternative, Alternative, criterion, DecisionCriteria);
number;
// Simplified scoring logic
return Math.random() * 100;
calculateTotalScore(alternative, Alternative, criteria, DecisionCriteria[]);
number;
return criteria.reduce((total, criterion) => {
    const score = this.scoreAlternative(alternative, criterion);
    return total + (score * criterion.weight) / 100;
}, 0);
selectBestAlternative(evaluations, AlternativeEvaluation[]);
Alternative;
return orderBy(evaluations, 'totalScore', 'desc')[0].alternative;
';
async;
assessStandardsCompliance(standards, TechnologyStandard[]);
Promise;
// Simulate standards compliance assessment
return Math.random() * 20 + 75; // 75-95% compliance
async;
assessPrincipleCompliance(principles, ArchitecturalPrinciple[]);
Promise;
// Simulate principle compliance assessment
return Math.random() * 25 + 70; // 70-95% compliance
async;
assessQualityCompliance(attributes, QualityAttribute[]);
Promise;
// Simulate quality attributes compliance assessment
return Math.random() * 30 + 65; // 65-95% compliance
calculateOverallCompliance(standards, number, principles, number, quality, number);
number;
return standards * 0.4 + principles * 0.3 + quality * 0.3;
identifyViolations(standards, number, principles, number, quality, number);
ComplianceViolation[];
{
    const violations = [];
    if (standards < 80) {
        violations.push({
            violationId: `violation-${generateNanoId(8)}`,
        } `
        type: 'standards',
        severity: 'medium',
        description: 'Technology standards compliance below threshold',
        recommendation: 'Review and align with approved technology standards',
      });
    }

    if (principles < 75) {
      violations.push({
        violationId: `, violation - $, {} `,`, type, 'principles', severity, 'high', description, 'Architectural principles adherence below threshold', recommendation, 'Align implementation with architectural principles');
    }
    ;
}
return violations;
generateComplianceRecommendations(compliance, number);
string[];
{
    const recommendations = [];
    if (compliance < 80) {
        recommendations.push('Implement architectural governance processes');
        ';
        recommendations.push('Increase compliance monitoring frequency');
        ';
    }
    recommendations.push('Regular architecture review sessions');
    ';
    recommendations.push('Automated compliance checking in CI/CD');
    ';
    return recommendations;
}
getNextStatus(currentStatus, ComponentStatus);
ComponentStatus;
switch (currentStatus) {
    case ComponentStatus.PLANNED:
        return ComponentStatus.IN_DEVELOPMENT;
    case ComponentStatus.IN_DEVELOPMENT:
        return ComponentStatus.AVAILABLE;
    default:
        return currentStatus;
}
/**
 * Getter methods
 */
getArchitecturalDecision(decisionId, string);
ArchitecturalDecision | undefined;
return this.architecturalDecisions.get(decisionId);
getRunwayComponent(componentId, string);
RunwayComponent | undefined;
return this.runwayComponents.get(componentId);
getComplianceReport(reportId, string);
ArchitecturalComplianceReport | undefined;
return this.complianceReports.get(reportId);
getAllArchitecturalDecisions();
ArchitecturalDecision[];
return Array.from(this.architecturalDecisions.values())();
getAllRunwayComponents();
RunwayComponent[];
return Array.from(this.runwayComponents.values())();
getAvailableComponents();
RunwayComponent[];
return filter(Array.from(this.runwayComponents.values()), (component) => component.status === ComponentStatus.AVAILABLE);
var DecisionUrgency;
(function (DecisionUrgency) {
    DecisionUrgency["LOW"] = "low";
    DecisionUrgency["MEDIUM"] = "medium";
    DecisionUrgency["HIGH"] = "high";
    DecisionUrgency["CRITICAL"] = "critical";
})(DecisionUrgency || (DecisionUrgency = {}));
var DecisionStatus;
(function (DecisionStatus) {
    DecisionStatus["PROPOSED"] = "proposed";
    DecisionStatus["UNDER_REVIEW"] = "under_review";
    DecisionStatus["APPROVED"] = "approved";
    DecisionStatus["REJECTED"] = "rejected";
    DecisionStatus["SUPERSEDED"] = "superseded";
})(DecisionStatus || (DecisionStatus = {}));
var ComponentOperation;
(function (ComponentOperation) {
    ComponentOperation["PROMOTE"] = "promote";
    ComponentOperation["DEPRECATE"] = "deprecate";
    ComponentOperation["RETIRE"] = "retire";
    ComponentOperation["UPDATE"] = "update";
})(ComponentOperation || (ComponentOperation = {}));
