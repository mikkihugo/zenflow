/**
 * @fileoverview Solution Train Engineer Manager - Large Solution SAFe Configuration
 *
 * Solution Train Engineer management for SAFe Large Solution configuration.
 * Coordinates multiple Agile Release Trains (ARTs) to deliver complex solutions
 * requiring coordination across multiple development value streams.
 *
 * Delegates to:
 * - Multi-ART Coordination Service for cross-ART synchronization and dependency management
 * - Solution Planning Service for solution-level PI planning and coordination activities
 * - Solution Architecture Management Service for architectural runway and governance
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
export interface SolutionTrainEngineerConfig {
    steId: string;
    name: string;
    solutionContext: SolutionContext;
    artCoordination: ARTCoordinationConfig;
    solutionPlanning: SolutionPlanningConfig;
    governanceConfig: SolutionGovernanceConfig;
    metricsConfig: SolutionMetricsConfig;
    stakeholderConfig: StakeholderConfig;
    architectureConfig: SolutionArchitectureConfig;
    capabilities: SolutionTrainCapabilities;
}
export interface SolutionContext {
    solutionId: string;
    solutionName: string;
    domain: string;
    complexity: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;;
    artCount: number;
    teamCount: number;
    stakeholderCount: number;
    complianceRequirements: string[];
    businessValue: string;
    strategicImportance: 'low|medium|high|critical;;
}
export interface ARTCoordinationConfig {
    coordinationStrategy: 'hierarchical' | 'network' | 'hybrid';
    synchronizationFrequency: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;;
    dependencyManagement: DependencyManagementStrategy;
    escalationMatrix: EscalationRule[];
    communicationProtocols: CommunicationProtocol[];
}
export interface SolutionPlanningConfig {
    planningApproach: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;;
    planningHorizon: number;
    stakeholderInvolvement: StakeholderInvolvement[];
    riskManagement: RiskManagementStrategy;
    capacityPlanning: CapacityPlanningStrategy;
}
export interface SolutionGovernanceConfig {
    framework: 'lightweight' | 'standard' | 'comprehensive';
    decisionRights: DecisionRight[];
    complianceRequirements: ComplianceRequirement[];
    auditRequirements: AuditRequirement[];
}
export interface SolutionMetricsConfig {
    kpiFramework: string;
    measurementFrequency: 'real-time|daily | weekly' | monthly;
    reportingCadence: 'weekly' | 'monthly' | 'quarterly';
    stakeholderReporting: StakeholderReportingConfig[];
}
export interface StakeholderConfig {
    primaryStakeholders: Stakeholder[];
    communicationPlan: CommunicationPlan;
    engagementStrategy: EngagementStrategy;
    feedbackMechanisms: FeedbackMechanism[];
}
export interface SolutionArchitectureConfig {
    architecturalRunway: ArchitecturalRunwayConfig;
    technologyStandards: TechnologyStandard[];
    integrationStrategy: IntegrationStrategy;
    platformStrategy: PlatformStrategy;
}
export interface SolutionTrainCapabilities {
    multiARTCoordination: boolean;
    solutionPlanning: boolean;
    dependencyManagement: boolean;
    architecturalGovernance: boolean;
    stakeholderManagement: boolean;
    metricsAndReporting: boolean;
    complianceManagement: boolean;
    riskManagement: boolean;
}
export interface DependencyManagementStrategy {
    approach: string;
    tools: string[];
    escalationRules: string[];
}
export interface EscalationRule {
    trigger: string;
    escalationPath: string[];
    timeThresholds: number[];
}
export interface CommunicationProtocol {
    type: string;
    frequency: string;
    participants: string[];
}
export interface StakeholderInvolvement {
    stakeholder: string;
    role: string;
    involvement: string;
}
export interface RiskManagementStrategy {
    approach: string;
    framework: string;
    escalationCriteria: string[];
}
export interface CapacityPlanningStrategy {
    method: string;
    factors: string[];
    bufferPercentage: number;
}
export interface DecisionRight {
    decision: string;
    authority: string[];
    escalation: string[];
}
export interface ComplianceRequirement {
    framework: string;
    requirements: string[];
    controls: string[];
}
export interface AuditRequirement {
    type: string;
    frequency: string;
    scope: string[];
}
export interface StakeholderReportingConfig {
    stakeholder: string;
    frequency: string;
    format: string;
    content: string[];
}
export interface Stakeholder {
    id: string;
    name: string;
    role: string;
    influence: string;
    interest: string;
}
export interface CommunicationPlan {
    channels: string[];
    frequency: string;
    protocols: string[];
}
export interface EngagementStrategy {
    approach: string;
    touchpoints: string[];
    feedback: string[];
}
export interface FeedbackMechanism {
    type: string;
    frequency: string;
    method: string;
}
export interface ArchitecturalRunwayConfig {
    strategy: string;
    capacity: number;
    priorities: string[];
}
export interface TechnologyStandard {
    category: string;
    standard: string;
    compliance: string;
}
export interface IntegrationStrategy {
    approach: string;
    patterns: string[];
    governance: string[];
}
export interface PlatformStrategy {
    approach: string;
    capabilities: string[];
    governance: string[];
}
/**
 * Solution Train Engineer Manager for SAFe Large Solution coordination
 */
export declare class SolutionTrainEngineerManager extends EventBus {
    private readonly logger;
    private multiARTCoordinationService;
    private solutionPlanningService;
    private solutionArchitectureManagementService;
    private initialized;
    constructor(_config?: SolutionTrainEngineerConfig);
    /**
     * Initialize with service delegation
     */
    initialize(): Promise<void>;
    /**
     * Configure solution train engineer
     */
    configure(config: SolutionTrainEngineerConfig): Promise<void>;
    /**
     * Coordinate multiple ARTs - Delegates to Multi-ART Coordination Service
     */
    coordinateARTs(coordinationConfig: any): Promise<any>;
    /**
     * Facilitate solution PI planning - Delegates to Solution Planning Service
     */
    facilitateSolutionPlanning(planningConfig: any): Promise<any>;
    /**
     * Manage solution architecture - Delegates to Solution Architecture Management Service
     */
    manageSolutionArchitecture(architectureConfig: any): Promise<any>;
    /**
     * Track cross-ART dependencies - Delegates to Multi-ART Coordination Service
     */
    trackDependency(dependency: any): Promise<any>;
    /**
     * Update dependency status - Delegates to Multi-ART Coordination Service
     */
    updateDependencyStatus(dependencyId: string, status: string, actualDeliveryDate?: Date): Promise<any>;
    /**
     * Make architectural decision - Delegates to Solution Architecture Management Service
     */
    makeArchitecturalDecision(decision: any): Promise<any>;
    /**
     * Get solution train metrics
     */
    getSolutionMetrics(): Promise<any>;
    /**
     * Get solution train status
     */
    getSolutionTrainStatus(): any;
    /**
     * Shutdown solution train engineer
     */
    shutdown(): void;
}
export default SolutionTrainEngineerManager;
//# sourceMappingURL=solution-train-engineer-manager.d.ts.map