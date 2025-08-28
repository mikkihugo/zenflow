/**
 * SPARC phase enumeration
 */
export declare enum SPARCPhase {
    SPECIFICATION = "specification",
    PSEUDOCODE = "pseudocode",
    ARCHITECTURE = "architecture",
    REFINEMENT = "refinement",
    COMPLETION = "completion"
}
/**
 * CD Pipeline stage types
 */
export declare enum StageType {
    ')  BUILD = ' = 0,
    build = 1,
    ')  TEST = ' = 2,
    test = 3,
    ')  SECURITY = ' = 4,
    security = 5,
    ')  QUALITY = ' = 6,
    quality = 7,
    ')  DEPLOY = ' = 8,
    deploy = 9,
    ')  MONITOR = ' = 10,
    monitor = 11,
    ')  APPROVAL = ' = 12,
    approval = 13,
    ')};; 
    /**
     * Quality gate types
     */
    = 14
    /**
     * Quality gate types
     */
    ,
    /**
     * Quality gate types
     */
    export = 15,
    enum = 16,
    QualityGateType = 17
}
/**
 * CD Pipeline Configuration
 */
export interface CDPipelineConfig {
    readonly pipelineId: string;
    readonly name: string;
    readonly description: string;
    readonly type: 'standard| microservice| library' | ' enterprise';
    readonly stages: CDPipelineStage[];
    readonly triggers: PipelineTrigger[];
    readonly variables: Record<string, string>;
    readonly notifications: NotificationConfig[];
    readonly timeout: number;
    readonly retryPolicy: RetryPolicy;
    readonly rollbackPolicy: RollbackPolicy;
    readonly qualityGates: QualityGate[];
    readonly securityChecks: SecurityCheck[];
    readonly complianceChecks: ComplianceCheck[];
}
/**
 * Pipeline trigger configuration
 */
export interface PipelineTrigger {
    readonly id: string;
    readonly type: 'webhook| schedule| manual' | ' dependency';
    readonly enabled: boolean;
    readonly configuration: Record<string, unknown>;
    readonly conditions: TriggerCondition[];
}
/**
 * Trigger condition
 */
export interface TriggerCondition {
    readonly field: string;
    readonly operator: equals | contains | matches | greater_than | 'less_than';
    readonly value: string;
    readonly caseSensitive: boolean;
}
/**
 * Notification configuration
 */
export interface NotificationConfig {
    readonly id: string;
    readonly channel: 'email| slack| teams' | ' webhook';
    readonly recipients: string[];
    readonly events: NotificationEvent[];
    readonly template: string;
    readonly enabled: boolean;
}
/**
 * Notification event
 */
export type NotificationEvent = pipeline_started | pipeline_completed | pipeline_failed | stage_completed | stage_failed | quality_gate_failed | 'security_check_failed';
export interface SecurityCheck {
    readonly id: string;
    readonly name: string;
    readonly type: vulnerability_scan | dependency_check | secrets_scan | 'compliance_check';
    readonly tool: string;
    readonly configuration: Record<string, unknown>;
    readonly enabled: boolean;
    readonly blocking: boolean;
    readonly threshold: SecurityThreshold;
}
/**
 * Security threshold
 */
export interface SecurityThreshold {
    readonly critical: number;
    readonly high: number;
    readonly medium: number;
    readonly low: number;
    readonly failOnCritical: boolean;
    readonly failOnHigh: boolean;
}
/**
 * Compliance check configuration
 */
export interface ComplianceCheck {
    readonly id: string;
    readonly name: string;
    readonly framework: string;
    readonly controls: string[];
    readonly automated: boolean;
    readonly enabled: boolean;
    readonly blocking: boolean;
    readonly evidenceRequired: boolean;
}
/**
 * CD Pipeline State
 */
export interface CDPipelineState {
    readonly pipelineId: string;
    readonly currentStage?: string;
    readonly status: PipelineStatus;
    readonly progress: number;
    readonly estimatedCompletion?: Date;
    readonly health: 'healthy' | ' degraded' | ' unhealthy';
}
/**
 * Swarm Execution Orchestrator
 */
export interface SwarmExecutionOrchestrator {
    readonly id: string;
    readonly name: string;
    readonly pipelines: string[];
    readonly coordination: 'sequential' | ' parallel' | ' adaptive';
    readonly loadBalancing: boolean;
    readonly monitoring: boolean;
}
export default SPARCCDMappingService;
//# sourceMappingURL=sparc-cd-mapping-service.d.ts.map