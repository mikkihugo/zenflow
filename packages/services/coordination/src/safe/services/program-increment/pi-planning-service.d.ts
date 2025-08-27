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
import type { Logger } from '@claude-zen/foundation';
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
    readonly name: string;
    readonly role: product;
}
export interface PlanningAgendaItem {
    readonly id: string;
    readonly activity: string;
    readonly description: string;
    readonly duration: number;
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
    readonly type: budget | timeline | resource | regulatory | 'technical;;
    readonly description: string;
    readonly impact: 'low|medium|high|critical;;
    readonly mitigation: string;
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
    readonly status: 'proposed' | 'accepted' | 'superseded';
}
export interface ArchitecturalConstraint {
    readonly type: 'platform|integration|security|performance;;
    readonly description: string;
    readonly rationale: string;
    readonly implications: string[];
}
export interface IntegrationPoint {
    readonly id: string;
    readonly name: string;
    readonly type: 'api|message|database|file;;
    readonly description: string;
    readonly interfaces: string[];
    readonly protocols: string[];
    readonly dependencies: string[];
}
export interface PlanningAdjustment {
    readonly type: 'scope|timeline|resources|quality;;
    readonly description: string;
    readonly impact: string;
    readonly adjustment: any;
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
    readonly outcome: 'completed|partial|deferred|failed;;
    readonly deliverables: string[];
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
    readonly reviewDate?: Date;
}
export interface PlanningRisk {
    readonly riskId: string;
    readonly description: string;
    readonly category: schedule | scope | resource | technical | 'business;;
    readonly probability: number;
    readonly impact: 'low|medium|high|critical;;
    readonly mitigation: string;
    readonly owner: string;
    readonly dueDate: Date;
}
export interface PlanningDependency {
    readonly dependencyId: string;
    readonly fromItem: string;
    readonly toItem: string;
    readonly type: 'finish-to-start|start-to-start|finish-to-finish;;
    readonly description: string;
    readonly criticality: 'low|medium|high|critical;;
    readonly owner: string;
    readonly status: 'identified|planned|resolved|blocked;;
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
/**
 * PI Planning Service for Program Increment planning event management
 */
export declare class PIPlanningService extends EventBus {
    private readonly logger;
    private readonly planningEvents;
    private readonly planningResults;
    private workflowEngine;
    private aguiSystem;
    private knowledgeManager;
    private initialized;
    constructor(logger: Logger, _config?: Partial<PIPlanningConfiguration>);
    /**
     * Initialize the service with dependencies
     */
    initialize(): void;
    /**
     * Create comprehensive PI planning event configuration
     */
    createPIPlanningEvent(artId: string, businessContext: BusinessContext, architecturalVision: ArchitecturalVision, participants: PlanningParticipant[]): Promise<PIPlanningEventConfig>;
    /**
     * Execute comprehensive PI planning workflow with AGUI integration
     */
    executePIPlanningWorkflow(planningEvent: PIPlanningEventConfig): Promise<PIPlanningResult>;
    const dependencies: any;
    planningResult: any;
    dependencies: any;
    push(...dependencies: any[]): any;
    const additionalRisks: any;
    planningResult: any;
    risks: any;
    push(...additionalRisks: any[]): any;
}
//# sourceMappingURL=pi-planning-service.d.ts.map