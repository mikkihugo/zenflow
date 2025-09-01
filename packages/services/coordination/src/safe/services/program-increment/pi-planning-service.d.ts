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
'; : any;
readonly role: product;
}
export interface PlanningAgendaItem {
id: string;
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
readonly type: budget | timeline | resource | regulatory | 'technical';
readonly description: string;
readonly impact: 'low| medium| high' | ' critical';
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
id: string;
}
export interface ArchitecturalConstraint {
readonly type: 'platform| integration| security' | ' performance';
readonly description: string;
readonly rationale: string;
readonly implications: string[];
}
export interface IntegrationPoint {
id: string;
}
export interface PlanningAdjustment {
readonly type: 'scope| timeline| resources' | ' quality';
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
readonly outcome: 'completed| partial| deferred' | ' failed';
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
readonly category: schedule | scope | resource | technical | 'business';
readonly probability: number;
readonly impact: 'low| medium| high' | ' critical';
readonly mitigation: string;
readonly owner: string;
readonly dueDate: Date;
}
export interface PlanningDependency {
readonly dependencyId: string;
readonly fromItem: string;
readonly toItem: string;
readonly type: 'finish-to-start| start-to-start' | ' finish-to-finish';
readonly description: string;
readonly criticality: 'low| medium| high' | ' critical';
readonly owner: string;
readonly status: 'identified| planned| resolved' | ' blocked';
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
private readonly planningResults;
private workflowEngine;
constructor(): void { Date, now }: {"
Date: any;
now: any;
}): any;
}
//# sourceMappingURL=pi-planning-service.d.ts.map