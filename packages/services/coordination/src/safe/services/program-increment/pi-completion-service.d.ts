export interface PICompletionWorkflowConfig {
readonly piId: string;
readonly completionDate: Date;
readonly finalMetrics: PIExecutionMetrics;
readonly stakeholders: CompletionStakeholder[];
readonly deliverables: CompletionDeliverable[];
readonly workshops: InspectAndAdaptWorkshop[];
readonly archivalRequirements: ArchivalRequirement[];

}
export interface CompletionStakeholder {
    readonly userId: string;
    readonly name: string;
    readonly role: 'product' | 'engineering' | 'quality' | 'release';
}
export interface CompletionDeliverable {
id: string;

}
export interface InspectAndAdaptWorkshop {
id: string;

}
export interface WorkshopAgendaItem {
id: string;

}
export interface ArchivalRequirement {
readonly category: metrics | decisions | lessons | artifacts | 'communications';
readonly description: string;
readonly retentionPeriod: number;
readonly accessLevel: 'public' | ' internal' | ' restricted';
readonly format: 'json| pdf| csv' | ' archive';

}
export interface PICompletionReport {
readonly piId: string;
readonly completionDate: Date;
readonly overallSuccessRate: number;
readonly objectivesAchieved: number;
readonly totalObjectives: number;
readonly featuresDelivered: number;
readonly totalFeatures: number;
readonly finalMetrics: PIExecutionMetrics;
readonly achievements: Achievement[];
readonly challenges: Challenge[];
readonly lessonsLearned: LessonLearned[];
readonly improvements: ImprovementRecommendation[];
readonly nextPIRecommendations: string[];
readonly stakeholderFeedback: StakeholderFeedback[];
readonly qualityAssessment: QualityAssessment;
readonly riskAnalysis: CompletionRiskAnalysis;
readonly budgetAnalysis: BudgetAnalysis;

}
export interface Achievement {
readonly category: delivery | quality | innovation | collaboration | 'process';
readonly title: string;
readonly description: string;
readonly impact: string;
readonly metrics: Record<string, number>;
readonly contributors: string[];

}
export interface Challenge {
readonly category: technical | process | resource | external | 'communication';
readonly title: string;
readonly description: string;
readonly impact: string;
readonly rootCause: string;
readonly mitigationAttempts: string[];
readonly resolution: string;
readonly preventionStrategy: string;

}
export interface LessonLearned {
readonly category: planning | execution | coordination | technical | 'leadership';
readonly lesson: string;
readonly context: string;
readonly outcome: string;
readonly applicability: string[];
readonly actionItems: string[];
readonly priority: high;

}
export interface ImprovementRecommendation {
readonly area: 'process| tools| skills| communication' | ' planning';
readonly recommendation: string;
readonly rationale: string;
readonly expectedBenefit: string;
readonly implementationEffort: 'low' | ' medium' | ' high';
readonly timeline: string;
readonly owner: string;
readonly successCriteria: string[];

}
export interface StakeholderFeedback {
readonly stakeholderId: string;
readonly role: string;
readonly satisfaction: number;
readonly feedback: string;
readonly positives: string[];
readonly improvements: string[];
readonly wouldRecommend: boolean;

}
export interface QualityAssessment {
readonly overallQuality: number;
readonly codeQuality: number;
readonly testCoverage: number;
readonly defectRate: number;
readonly performanceScore: number;
readonly securityScore: number;
readonly maintainabilityScore: number;
readonly documentationScore: number;

}
export interface CompletionRiskAnalysis {
readonly totalRisks: number;
readonly mitigatedRisks: number;
readonly unresolvedRisks: number;
readonly riskManagementEffectiveness: number;
readonly highImpactRisks: PIRisk[];
readonly riskTrends: RiskTrend[];

}
export interface PIRisk {
id: string;

}
export interface RiskTrend {
readonly period: string;
readonly riskCount: number;
readonly avgProbability: number;
readonly trend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' worsening';

}
export interface BudgetAnalysis {
readonly plannedBudget: number;
readonly actualSpend: number;
readonly variance: number;
readonly utilizationRate: number;
readonly costPerStoryPoint: number;
readonly costPerFeature: number;
readonly budgetEfficiency: number;

}
export interface PIExecutionMetrics {
readonly piId: string;
readonly progressPercentage: number;
readonly velocityTrend: any;
readonly predictability: any;
readonly qualityMetrics: any;
readonly riskBurndown: any;
readonly dependencyHealth: any;
readonly teamMetrics: any[];
readonly lastUpdated: Date;

}
export interface PICompletionConfiguration {
readonly enableAutomatedReporting: boolean;
readonly enableStakeholderSurveys: boolean;
readonly enableInspectAndAdapt: boolean;
readonly enableDataArchival: boolean;
readonly completionTimeoutHours: number;
readonly reportGenerationTimeout: number;
readonly stakeholderSurveyTimeout: number;
readonly workshopSchedulingLeadTime: number;

}
/**
* PI Completion Service for Program Increment completion management
*/
export declare class PICompletionService extends EventBus {
private readonly logger;
private readonly workshops;
private brainCoordinator;
constructor(logger: {});
/**
* Initialize the service with dependencies
*/
initialize(): Promise<void>;
/**
* Complete Program Increment with comprehensive workflow
*/
completeProgramIncrement(piId: this, performanceTracker: any, startTimer: any): any;

}
//# sourceMappingURL=pi-completion-service.d.ts.map