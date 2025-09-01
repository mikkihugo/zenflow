/**
* SPARC phase enumeration
*/
export declare enum SPARCPhase {
SPECIFICATION = "specification",
PSEUDOCODE = "pseudocode",
ARCHITECTURE = "architecture",
REFINEMENT = "refinement",
COMPLETION = "completion"
'}
/**
* CD Pipeline stage types
*/
export declare enum StageType {
') = 0,
build = 1,
') = 2,
test = 3,
') = 4,
security = 5,
') = 6,
quality = 7,
') = 8,
deploy = 9,
') = 10,
monitor = 11,
') = 12,
approval = 13,
')standard| microservice| library' | ' enterprise';
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
'}
/**
* Pipeline trigger configuration
*/
export interface PipelineTrigger {
id: string;
'}
/**
* Trigger condition
*/
export interface TriggerCondition {
readonly field: string;
readonly operator: equals | contains | matches | greater_than | 'less_than';
readonly value: string;
readonly caseSensitive: boolean;
'}
/**
* Notification configuration
*/
export interface NotificationConfig {
id: string;
'}
/**
* Notification event
*/
export type NotificationEvent = pipeline_started | pipeline_completed | pipeline_failed | stage_completed | stage_failed | quality_gate_failed | 'security_check_failed';
export interface SecurityCheck {
id: string;
'}
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
'}
/**
* Compliance check configuration
*/
export interface ComplianceCheck {
id: string;
'}
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
'}
/**
* Swarm Execution Orchestrator
*/
export interface SwarmExecutionOrchestrator {
id: string;
'}
export default SPARCCDMappingService;
//# sourceMappingURL=sparc-cd-mapping-service.d.ts.map