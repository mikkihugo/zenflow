/**
 * @file System and Solution Architecture Manager - Phase 3, Day 14 (Task 13.2)
 *
 * Implements system-level design coordination, solution architect workflow integration,
 * architecture review and approval gates, and architecture compliance monitoring.
 * Integrates with the Architecture Runway Manager and multi-level orchestration.
 *
 * ARCHITECTURE:
 * - System-level design coordination and management
 * - Solution architect workflow integration
 * - Architecture review and approval gates with AGUI
 * - Architecture compliance monitoring and enforcement
 * - Integration with Program Increment and Architecture Runway management
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { ArchitectureRunwayManager } from './architecture-runway-manager.ts';
import type { ProgramIncrementManager } from './program-increment-manager.ts';
import type { ValueStreamMapper } from './value-stream-mapper.ts';
/**
 * System and Solution Architecture Manager configuration
 */
export interface SystemSolutionArchConfig {
    readonly enableSystemDesignCoordination: boolean;
    readonly enableSolutionArchitectWorkflow: boolean;
    readonly enableArchitectureReviews: boolean;
    readonly enableComplianceMonitoring: boolean;
    readonly enableAGUIIntegration: boolean;
    readonly systemDesignReviewInterval: number;
    readonly complianceCheckInterval: number;
    readonly architectureReviewTimeout: number;
    readonly maxSystemsPerSolution: number;
    readonly maxComponentsPerSystem: number;
    readonly maxInterfacesPerComponent: number;
    readonly complianceThreshold: number;
}
/**
 * System architecture types
 */
export declare enum SystemArchitectureType {
    MONOLITHIC = "monolithic",
    MICROSERVICES = "microservices",
    MODULAR = "modular",
    LAYERED = "layered",
    EVENT_DRIVEN = "event_driven",
    SERVICE_ORIENTED = "service_oriented",
    HEXAGONAL = "hexagonal",
    CLEAN = "clean"
}
/**
 * Solution architecture patterns
 */
export declare enum SolutionArchitecturePattern {
    DISTRIBUTED_SYSTEM = "distributed_system",
    CLOUD_NATIVE = "cloud_native",
    HYBRID_CLOUD = "hybrid_cloud",
    MULTI_TENANT = "multi_tenant",
    SERVERLESS = "serverless",
    EDGE_COMPUTING = "edge_computing",
    IOT_SOLUTION = "iot_solution",
    DATA_PLATFORM = "data_platform"
}
/**
 * System design specification
 */
export interface SystemDesign {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly solutionId: string;
    readonly type: SystemArchitectureType;
    readonly version: string;
    readonly status: SystemDesignStatus;
    readonly architect: string;
    readonly stakeholders: string[];
    readonly businessContext: BusinessContext;
    readonly architecturalDrivers: ArchitecturalDriver[];
    readonly qualityAttributes: QualityAttributeSpec[];
    readonly constraints: ArchitecturalConstraint[];
    readonly components: SystemComponent[];
    readonly interfaces: SystemInterface[];
    readonly dependencies: SystemDependency[];
    readonly deployment: DeploymentArchitecture;
    readonly security: SecurityArchitecture;
    readonly data: DataArchitecture;
    readonly integration: IntegrationArchitecture;
    readonly governance: GovernanceFramework;
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly approvedAt?: Date;
    readonly approvedBy?: string;
}
/**
 * System design status
 */
export declare enum SystemDesignStatus {
    DRAFT = "draft",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    IMPLEMENTED = "implemented",
    DEPRECATED = "deprecated",
    SUPERSEDED = "superseded"
}
/**
 * Business context for system design
 */
export interface BusinessContext {
    readonly domain: string;
    readonly subdomain: string;
    readonly businessCapabilities: string[];
    readonly valuePropositions: string[];
    readonly stakeholders: Stakeholder[];
    readonly businessRules: BusinessRule[];
    readonly performanceExpectations: PerformanceExpectation[];
    readonly complianceRequirements: ComplianceRequirement[];
}
/**
 * Stakeholder information
 */
export interface Stakeholder {
    readonly name: string;
    readonly role: string;
    readonly organization: string;
    readonly interests: string[];
    readonly influence: 'low' | 'medium' | 'high';
    readonly involvement: 'inform' | 'consult' | 'collaborate' | 'empower';
}
/**
 * Business rule
 */
export interface BusinessRule {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: 'constraint' | 'guideline' | 'policy' | 'regulation';
    readonly priority: 'must' | 'should' | 'could' | 'wont';
    readonly source: string;
    readonly verification: string;
}
/**
 * Performance expectation
 */
export interface PerformanceExpectation {
    readonly metric: string;
    readonly target: number;
    readonly threshold: number;
    readonly unit: string;
    readonly context: string;
    readonly measurement: string;
}
/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
    readonly standard: string;
    readonly version: string;
    readonly applicability: string;
    readonly requirements: string[];
    readonly controls: ControlRequirement[];
    readonly auditFrequency: string;
}
/**
 * Control requirement
 */
export interface ControlRequirement {
    readonly controlId: string;
    readonly description: string;
    readonly implementation: string;
    readonly verification: string;
    readonly responsible: string;
}
/**
 * Architectural driver
 */
export interface ArchitecturalDriver {
    readonly id: string;
    readonly name: string;
    readonly type: 'business' | 'technical' | 'quality' | 'constraint';
    readonly description: string;
    readonly rationale: string;
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly priority: number;
    readonly source: string;
    readonly traceability: string[];
}
/**
 * Quality attribute specification
 */
export interface QualityAttributeSpec {
    readonly attribute: string;
    readonly scenario: QualityAttributeScenario;
    readonly measures: QualityMeasure[];
    readonly tactics: ArchitecturalTactic[];
    readonly tradeoffs: string[];
    readonly priority: 'must-have' | 'should-have' | 'could-have';
}
/**
 * Quality attribute scenario
 */
export interface QualityAttributeScenario {
    readonly stimulus: string;
    readonly source: string;
    readonly environment: string;
    readonly artifact: string;
    readonly response: string;
    readonly measure: string;
}
/**
 * Quality measure
 */
export interface QualityMeasure {
    readonly name: string;
    readonly description: string;
    readonly metric: string;
    readonly target: number;
    readonly threshold: number;
    readonly unit: string;
    readonly testMethod: string;
}
/**
 * Architectural tactic
 */
export interface ArchitecturalTactic {
    readonly name: string;
    readonly category: string;
    readonly description: string;
    readonly applicability: string;
    readonly tradeoffs: string[];
    readonly implementation: string;
}
/**
 * Architectural constraint
 */
export interface ArchitecturalConstraint {
    readonly id: string;
    readonly name: string;
    readonly type: 'technical' | 'business' | 'regulatory' | 'organizational';
    readonly description: string;
    readonly rationale: string;
    readonly impact: string;
    readonly alternatives: string[];
    readonly flexibility: 'fixed' | 'negotiable' | 'flexible';
}
/**
 * System component
 */
export interface SystemComponent {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: ComponentType;
    readonly layer: string;
    readonly responsibilities: string[];
    readonly interfaces: ComponentInterface[];
    readonly dependencies: string[];
    readonly technology: TechnologyStack;
    readonly scalability: ScalabilitySpec;
    readonly reliability: ReliabilitySpec;
    readonly security: ComponentSecurity;
}
/**
 * Component types
 */
export declare enum ComponentType {
    SERVICE = "service",
    LIBRARY = "library",
    DATABASE = "database",
    QUEUE = "queue",
    CACHE = "cache",
    GATEWAY = "gateway",
    LOAD_BALANCER = "load_balancer",
    PROXY = "proxy",
    MONITOR = "monitor"
}
/**
 * Component interface
 */
export interface ComponentInterface {
    readonly id: string;
    readonly name: string;
    readonly type: 'api' | 'event' | 'database' | 'file' | 'stream';
    readonly protocol: string;
    readonly dataFormat: string;
    readonly operations: InterfaceOperation[];
    readonly contracts: InterfaceContract[];
    readonly versioning: VersioningStrategy;
    readonly security: InterfaceSecurity;
}
/**
 * Interface operation
 */
export interface InterfaceOperation {
    readonly name: string;
    readonly description: string;
    readonly inputs: DataElement[];
    readonly outputs: DataElement[];
    readonly preconditions: string[];
    readonly postconditions: string[];
    readonly errors: ErrorCondition[];
}
/**
 * Data element
 */
export interface DataElement {
    readonly name: string;
    readonly type: string;
    readonly description: string;
    readonly constraints: string[];
    readonly validation: ValidationRule[];
    readonly optional: boolean;
}
/**
 * Validation rule
 */
export interface ValidationRule {
    readonly type: 'format' | 'range' | 'pattern' | 'custom';
    readonly rule: string;
    readonly message: string;
}
/**
 * Error condition
 */
export interface ErrorCondition {
    readonly code: string;
    readonly description: string;
    readonly cause: string;
    readonly handling: string;
    readonly recovery: string;
}
/**
 * Interface contract
 */
export interface InterfaceContract {
    readonly version: string;
    readonly specification: string;
    readonly schema: any;
    readonly examples: any[];
    readonly tests: ContractTest[];
}
/**
 * Contract test
 */
export interface ContractTest {
    readonly name: string;
    readonly description: string;
    readonly scenario: string;
    readonly expected: any;
    readonly validation: string;
}
/**
 * Versioning strategy
 */
export interface VersioningStrategy {
    readonly scheme: 'semantic' | 'date' | 'sequential' | 'custom';
    readonly compatibility: 'backward' | 'forward' | 'both' | 'none';
    readonly migration: MigrationStrategy;
}
/**
 * Migration strategy
 */
export interface MigrationStrategy {
    readonly approach: 'big_bang' | 'gradual' | 'parallel' | 'canary';
    readonly timeline: string;
    readonly rollback: string;
    readonly validation: string;
}
/**
 * Interface security
 */
export interface InterfaceSecurity {
    readonly authentication: AuthenticationSpec[];
    readonly authorization: AuthorizationSpec[];
    readonly encryption: EncryptionSpec;
    readonly rateLimiting: RateLimitingSpec;
    readonly monitoring: SecurityMonitoring;
}
/**
 * Authentication specification
 */
export interface AuthenticationSpec {
    readonly method: 'oauth2' | 'jwt' | 'api_key' | 'basic' | 'certificate';
    readonly configuration: any;
    readonly scope: string[];
    readonly expiration: string;
}
/**
 * Authorization specification
 */
export interface AuthorizationSpec {
    readonly model: 'rbac' | 'abac' | 'acl' | 'custom';
    readonly policies: AuthorizationPolicy[];
    readonly enforcement: string;
    readonly delegation: boolean;
}
/**
 * Authorization policy
 */
export interface AuthorizationPolicy {
    readonly name: string;
    readonly subjects: string[];
    readonly actions: string[];
    readonly resources: string[];
    readonly conditions: string[];
    readonly effect: 'allow' | 'deny';
}
/**
 * Rate limiting specification
 */
export interface RateLimitingSpec {
    readonly strategy: 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';
    readonly limits: RateLimit[];
    readonly scope: 'global' | 'per_user' | 'per_ip' | 'per_api_key';
    readonly actions: RateLimitAction[];
}
/**
 * Rate limit
 */
export interface RateLimit {
    readonly requests: number;
    readonly window: string;
    readonly burst?: number;
    readonly queue?: number;
}
/**
 * Rate limit action
 */
export interface RateLimitAction {
    readonly trigger: string;
    readonly action: 'block' | 'queue' | 'throttle' | 'charge';
    readonly duration: string;
    readonly response: string;
}
/**
 * Security monitoring
 */
export interface SecurityMonitoring {
    readonly logging: boolean;
    readonly anomalyDetection: boolean;
    readonly threatIntelligence: boolean;
    readonly alerting: AlertingConfiguration;
}
/**
 * Alerting configuration
 */
export interface AlertingConfiguration {
    readonly channels: string[];
    readonly severity: string[];
    readonly escalation: EscalationRule[];
}
/**
 * Escalation rule
 */
export interface EscalationRule {
    readonly condition: string;
    readonly delay: string;
    readonly actions: string[];
    readonly recipients: string[];
}
/**
 * Technology stack
 */
export interface TechnologyStack {
    readonly platform: string;
    readonly runtime: string;
    readonly frameworks: string[];
    readonly libraries: string[];
    readonly tools: string[];
    readonly databases: string[];
    readonly messaging: string[];
    readonly monitoring: string[];
}
/**
 * Scalability specification
 */
export interface ScalabilitySpec {
    readonly horizontal: ScalingSpec;
    readonly vertical: ScalingSpec;
    readonly bottlenecks: string[];
    readonly patterns: string[];
}
/**
 * Scaling specification
 */
export interface ScalingSpec {
    readonly supported: boolean;
    readonly triggers: ScalingTrigger[];
    readonly limits: ScalingLimits;
    readonly strategy: string;
}
/**
 * Scaling trigger
 */
export interface ScalingTrigger {
    readonly metric: string;
    readonly threshold: number;
    readonly duration: string;
    readonly action: 'scale_up' | 'scale_down';
}
/**
 * Scaling limits
 */
export interface ScalingLimits {
    readonly min: number;
    readonly max: number;
    readonly step: number;
    readonly cooldown: string;
}
/**
 * Reliability specification
 */
export interface ReliabilitySpec {
    readonly availability: AvailabilitySpec;
    readonly faultTolerance: FaultToleranceSpec;
    readonly recovery: RecoverySpec;
    readonly monitoring: ReliabilityMonitoring;
}
/**
 * Availability specification
 */
export interface AvailabilitySpec {
    readonly target: number;
    readonly measurement: string;
    readonly dependencies: DependencyAvailability[];
    readonly downtime: DowntimeSpec;
}
/**
 * Dependency availability
 */
export interface DependencyAvailability {
    readonly component: string;
    readonly availability: number;
    readonly impact: 'none' | 'degraded' | 'failed';
    readonly mitigation: string;
}
/**
 * Downtime specification
 */
export interface DowntimeSpec {
    readonly planned: string;
    readonly unplanned: string;
    readonly notification: string;
    readonly communication: string;
}
/**
 * Fault tolerance specification
 */
export interface FaultToleranceSpec {
    readonly patterns: string[];
    readonly redundancy: RedundancySpec;
    readonly isolation: IsolationSpec;
    readonly gracefulDegradation: DegradationSpec;
}
/**
 * Redundancy specification
 */
export interface RedundancySpec {
    readonly level: 'none' | 'active_passive' | 'active_active' | 'n_plus_one';
    readonly scope: 'component' | 'service' | 'system' | 'datacenter';
    readonly synchronization: string;
    readonly failover: string;
}
/**
 * Isolation specification
 */
export interface IsolationSpec {
    readonly bulkhead: boolean;
    readonly circuitBreaker: boolean;
    readonly timeout: boolean;
    readonly rateLimiting: boolean;
}
/**
 * Degradation specification
 */
export interface DegradationSpec {
    readonly levels: DegradationLevel[];
    readonly triggers: string[];
    readonly recovery: string;
}
/**
 * Degradation level
 */
export interface DegradationLevel {
    readonly name: string;
    readonly description: string;
    readonly functionality: string[];
    readonly performance: PerformanceLevel;
}
/**
 * Performance level
 */
export interface PerformanceLevel {
    readonly throughput: number;
    readonly latency: number;
    readonly availability: number;
}
/**
 * Recovery specification
 */
export interface RecoverySpec {
    readonly rto: string;
    readonly rpo: string;
    readonly backup: BackupSpec;
    readonly disaster: DisasterRecoverySpec;
}
/**
 * Backup specification
 */
export interface BackupSpec {
    readonly frequency: string;
    readonly retention: string;
    readonly encryption: boolean;
    readonly testing: string;
}
/**
 * Disaster recovery specification
 */
export interface DisasterRecoverySpec {
    readonly strategy: 'backup_restore' | 'pilot_light' | 'warm_standby' | 'hot_standby';
    readonly location: string;
    readonly automation: boolean;
    readonly testing: string;
}
/**
 * Reliability monitoring
 */
export interface ReliabilityMonitoring {
    readonly sla: SLASpec[];
    readonly slo: SLOSpec[];
    readonly sli: SLISpec[];
    readonly errorBudget: ErrorBudgetSpec;
}
/**
 * SLA specification
 */
export interface SLASpec {
    readonly metric: string;
    readonly target: number;
    readonly measurement: string;
    readonly penalties: string[];
    readonly reporting: string;
}
/**
 * SLO specification
 */
export interface SLOSpec {
    readonly metric: string;
    readonly target: number;
    readonly window: string;
    readonly alerting: boolean;
}
/**
 * SLI specification
 */
export interface SLISpec {
    readonly name: string;
    readonly description: string;
    readonly measurement: string;
    readonly calculation: string;
    readonly frequency: string;
}
/**
 * Error budget specification
 */
export interface ErrorBudgetSpec {
    readonly period: string;
    readonly budget: number;
    readonly burn: number;
    readonly actions: string[];
}
/**
 * Component security
 */
export interface ComponentSecurity {
    readonly classification: 'public' | 'internal' | 'confidential' | 'restricted';
    readonly threats: ThreatModel[];
    readonly controls: SecurityControl[];
    readonly compliance: string[];
    readonly auditing: AuditingSpec;
}
/**
 * Threat model
 */
export interface ThreatModel {
    readonly id: string;
    readonly description: string;
    readonly assets: string[];
    readonly threats: Threat[];
    readonly vulnerabilities: Vulnerability[];
    readonly mitigations: Mitigation[];
}
/**
 * Threat
 */
export interface Threat {
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly likelihood: 'low' | 'medium' | 'high';
    readonly impact: 'low' | 'medium' | 'high';
    readonly source: string;
}
/**
 * Vulnerability
 */
export interface Vulnerability {
    readonly name: string;
    readonly description: string;
    readonly cve?: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly exploitability: 'low' | 'medium' | 'high';
    readonly detection: string;
}
/**
 * Mitigation
 */
export interface Mitigation {
    readonly name: string;
    readonly description: string;
    readonly type: 'preventive' | 'detective' | 'corrective';
    readonly effectiveness: 'low' | 'medium' | 'high';
    readonly cost: 'low' | 'medium' | 'high';
}
/**
 * Security control
 */
export interface SecurityControl {
    readonly id: string;
    readonly name: string;
    readonly type: 'technical' | 'administrative' | 'physical';
    readonly category: string;
    readonly implementation: string;
    readonly testing: string;
    readonly responsible: string;
}
/**
 * Auditing specification
 */
export interface AuditingSpec {
    readonly logging: boolean;
    readonly retention: string;
    readonly integrity: boolean;
    readonly monitoring: boolean;
    readonly reporting: string;
}
/**
 * System interface
 */
export interface SystemInterface {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: 'synchronous' | 'asynchronous' | 'batch' | 'stream';
    readonly provider: string;
    readonly consumer: string;
    readonly protocol: string;
    readonly dataFormat: string;
    readonly contract: InterfaceContract;
    readonly security: InterfaceSecurity;
    readonly performance: InterfacePerformance;
    readonly monitoring: InterfaceMonitoring;
}
/**
 * Interface performance
 */
export interface InterfacePerformance {
    readonly latency: PerformanceSpec;
    readonly throughput: PerformanceSpec;
    readonly concurrency: ConcurrencySpec;
    readonly caching: CachingSpec;
}
/**
 * Performance spec
 */
export interface PerformanceSpec {
    readonly target: number;
    readonly unit: string;
    readonly percentile: number;
    readonly measurement: string;
}
/**
 * Concurrency spec
 */
export interface ConcurrencySpec {
    readonly maxConnections: number;
    readonly pooling: boolean;
    readonly queuing: QueueingSpec;
}
/**
 * Queuing spec
 */
export interface QueueingSpec {
    readonly strategy: 'fifo' | 'lifo' | 'priority' | 'fair';
    readonly capacity: number;
    readonly timeout: string;
    readonly overflow: 'block' | 'drop' | 'reject';
}
/**
 * Caching spec
 */
export interface CachingSpec {
    readonly enabled: boolean;
    readonly strategy: 'lru' | 'lfu' | 'ttl' | 'custom';
    readonly size: string;
    readonly ttl: string;
    readonly invalidation: string;
}
/**
 * Interface monitoring
 */
export interface InterfaceMonitoring {
    readonly metrics: string[];
    readonly healthChecks: HealthCheckSpec[];
    readonly tracing: TracingSpec;
    readonly logging: LoggingSpec;
}
/**
 * Health check spec
 */
export interface HealthCheckSpec {
    readonly type: 'shallow' | 'deep';
    readonly endpoint: string;
    readonly interval: string;
    readonly timeout: string;
    readonly retries: number;
}
/**
 * Tracing spec
 */
export interface TracingSpec {
    readonly enabled: boolean;
    readonly sampling: number;
    readonly propagation: string[];
    readonly storage: string;
}
/**
 * Logging spec
 */
export interface LoggingSpec {
    readonly level: 'debug' | 'info' | 'warn' | 'error';
    readonly format: 'json' | 'text' | 'custom';
    readonly fields: string[];
    readonly sampling: number;
}
/**
 * System dependency
 */
export interface SystemDependency {
    readonly id: string;
    readonly name: string;
    readonly type: 'internal' | 'external' | 'third_party';
    readonly provider: string;
    readonly interfaces: string[];
    readonly criticality: 'low' | 'medium' | 'high' | 'critical';
    readonly availability: DependencyAvailability;
    readonly fallback: FallbackStrategy;
}
/**
 * Fallback strategy
 */
export interface FallbackStrategy {
    readonly strategy: 'cache' | 'default' | 'alternative' | 'queue' | 'circuit_breaker';
    readonly configuration: any;
    readonly timeout: string;
    readonly recovery: string;
}
/**
 * Solution design specification
 */
export interface SolutionDesign {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly pattern: SolutionArchitecturePattern;
    readonly version: string;
    readonly status: SolutionDesignStatus;
    readonly architect: string;
    readonly businessContext: BusinessContext;
    readonly systems: SystemDesign[];
    readonly capabilities: CapabilityMap;
    readonly integration: SolutionIntegration;
    readonly governance: SolutionGovernance;
    readonly deployment: SolutionDeployment;
    readonly operations: SolutionOperations;
    readonly createdAt: Date;
    readonly lastUpdated: Date;
    readonly approvedAt?: Date;
    readonly approvedBy?: string;
}
/**
 * Solution design status
 */
export declare enum SolutionDesignStatus {
    CONCEPT = "concept",
    DESIGN = "design",
    REVIEW = "review",
    APPROVED = "approved",
    IMPLEMENTATION = "implementation",
    DEPLOYED = "deployed",
    RETIRED = "retired"
}
/**
 * Capability map
 */
export interface CapabilityMap {
    readonly businessCapabilities: BusinessCapability[];
    readonly technicalCapabilities: TechnicalCapability[];
    readonly crossCuttingConcerns: CrossCuttingConcern[];
    readonly capabilityModel: CapabilityModel;
}
/**
 * Business capability
 */
export interface BusinessCapability {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly level: number;
    readonly parent?: string;
    readonly children: string[];
    readonly systems: string[];
    readonly processes: string[];
    readonly data: string[];
    readonly maturity: MaturityLevel;
}
/**
 * Technical capability
 */
export interface TechnicalCapability {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly systems: string[];
    readonly services: string[];
    readonly apis: string[];
    readonly maturity: MaturityLevel;
}
/**
 * Cross cutting concern
 */
export interface CrossCuttingConcern {
    readonly name: string;
    readonly description: string;
    readonly category: 'security' | 'logging' | 'monitoring' | 'caching' | 'configuration';
    readonly implementation: string;
    readonly systems: string[];
    readonly standards: string[];
}
/**
 * Capability model
 */
export interface CapabilityModel {
    readonly framework: string;
    readonly levels: string[];
    readonly assessment: CapabilityAssessment[];
    readonly gaps: CapabilityGap[];
    readonly roadmap: CapabilityRoadmap;
}
/**
 * Capability assessment
 */
export interface CapabilityAssessment {
    readonly capabilityId: string;
    readonly currentLevel: MaturityLevel;
    readonly targetLevel: MaturityLevel;
    readonly gap: string;
    readonly effort: string;
    readonly priority: number;
}
/**
 * Maturity level
 */
export declare enum MaturityLevel {
    INITIAL = "initial",
    DEVELOPING = "developing",
    DEFINED = "defined",
    MANAGED = "managed",
    OPTIMIZING = "optimizing"
}
/**
 * Capability gap
 */
export interface CapabilityGap {
    readonly id: string;
    readonly capability: string;
    readonly description: string;
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly effort: 'small' | 'medium' | 'large' | 'very_large';
    readonly timeline: string;
    readonly dependencies: string[];
}
/**
 * Capability roadmap
 */
export interface CapabilityRoadmap {
    readonly timeframes: Timeframe[];
    readonly milestones: CapabilityMilestone[];
    readonly initiatives: CapabilityInitiative[];
    readonly dependencies: string[];
}
/**
 * Timeframe
 */
export interface Timeframe {
    readonly name: string;
    readonly start: Date;
    readonly end: Date;
    readonly capabilities: string[];
    readonly milestones: string[];
}
/**
 * Capability milestone
 */
export interface CapabilityMilestone {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly date: Date;
    readonly capabilities: string[];
    readonly outcomes: string[];
    readonly metrics: string[];
}
/**
 * Capability initiative
 */
export interface CapabilityInitiative {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly objectives: string[];
    readonly capabilities: string[];
    readonly timeline: string;
    readonly budget: number;
    readonly resources: string[];
}
/**
 * System and Solution Architecture Manager state
 */
export interface SystemSolutionArchState {
    readonly solutionDesigns: Map<string, SolutionDesign>;
    readonly systemDesigns: Map<string, SystemDesign>;
    readonly architectureReviews: Map<string, ArchitectureReview>;
    readonly complianceReports: Map<string, ComplianceReport>;
    readonly designApprovals: Map<string, DesignApproval>;
    readonly capabilityMaps: Map<string, CapabilityMap>;
    readonly lastComplianceCheck: Date;
    readonly lastArchitectureReview: Date;
}
/**
 * Architecture review
 */
export interface ArchitectureReview {
    readonly id: string;
    readonly type: 'system' | 'solution' | 'integration' | 'security' | 'performance';
    readonly subjectId: string;
    readonly reviewDate: Date;
    readonly reviewers: ArchitectureReviewer[];
    readonly criteria: ReviewCriterion[];
    readonly findings: ReviewFinding[];
    readonly recommendations: ReviewRecommendation[];
    readonly decisions: ReviewDecision[];
    readonly followUp: FollowUpAction[];
    readonly status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    readonly outcome: 'approved' | 'conditional' | 'rejected' | 'deferred';
}
/**
 * Architecture reviewer
 */
export interface ArchitectureReviewer {
    readonly name: string;
    readonly role: 'solution_architect' | 'system_architect' | 'security_architect' | 'enterprise_architect';
    readonly expertise: string[];
    readonly decision_weight: number;
}
/**
 * Review criterion
 */
export interface ReviewCriterion {
    readonly category: string;
    readonly criterion: string;
    readonly weight: number;
    readonly evaluation: string;
    readonly score: number;
}
/**
 * Review finding
 */
export interface ReviewFinding {
    readonly id: string;
    readonly category: string;
    readonly severity: 'info' | 'minor' | 'major' | 'critical';
    readonly description: string;
    readonly evidence: string;
    readonly impact: string;
    readonly recommendation: string;
}
/**
 * Review recommendation
 */
export interface ReviewRecommendation {
    readonly id: string;
    readonly type: 'must' | 'should' | 'could' | 'consider';
    readonly description: string;
    readonly rationale: string;
    readonly effort: 'small' | 'medium' | 'large' | 'very_large';
    readonly timeline: string;
    readonly responsible: string;
}
/**
 * Review decision
 */
export interface ReviewDecision {
    readonly criterion: string;
    readonly decision: 'accept' | 'reject' | 'modify' | 'defer';
    readonly rationale: string;
    readonly conditions: string[];
    readonly reviewer: string;
}
/**
 * Follow-up action
 */
export interface FollowUpAction {
    readonly id: string;
    readonly description: string;
    readonly assignee: string;
    readonly dueDate: Date;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly status: 'open' | 'in_progress' | 'completed' | 'cancelled';
}
/**
 * Compliance report
 */
export interface ComplianceReport {
    readonly id: string;
    readonly subjectId: string;
    readonly subjectType: 'system' | 'solution';
    readonly standards: string[];
    readonly assessmentDate: Date;
    readonly overallScore: number;
    readonly compliance: ComplianceAssessment[];
    readonly violations: ComplianceViolation[];
    readonly risks: ComplianceRisk[];
    readonly remediation: RemediationPlan[];
    readonly nextAssessment: Date;
}
/**
 * Compliance assessment
 */
export interface ComplianceAssessment {
    readonly standard: string;
    readonly requirement: string;
    readonly status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
    readonly score: number;
    readonly evidence: string[];
    readonly gaps: string[];
    readonly effort: string;
}
/**
 * Compliance violation
 */
export interface ComplianceViolation {
    readonly id: string;
    readonly standard: string;
    readonly requirement: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly impact: string;
    readonly remediation: string;
    readonly timeline: string;
    readonly responsible: string;
}
/**
 * Compliance risk
 */
export interface ComplianceRisk {
    readonly id: string;
    readonly description: string;
    readonly probability: 'low' | 'medium' | 'high';
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly mitigation: string;
    readonly contingency: string;
    readonly owner: string;
}
/**
 * Remediation plan
 */
export interface RemediationPlan {
    readonly violationId: string;
    readonly actions: RemediationAction[];
    readonly timeline: string;
    readonly cost: number;
    readonly resources: string[];
    readonly success_criteria: string[];
}
/**
 * Remediation action
 */
export interface RemediationAction {
    readonly description: string;
    readonly type: 'immediate' | 'short_term' | 'long_term';
    readonly effort: string;
    readonly dependencies: string[];
    readonly deliverables: string[];
}
/**
 * Design approval
 */
export interface DesignApproval {
    readonly id: string;
    readonly designId: string;
    readonly designType: 'system' | 'solution';
    readonly requestDate: Date;
    readonly approvers: DesignApprover[];
    readonly approvals: ApprovalDecision[];
    readonly conditions: string[];
    readonly finalDecision: 'approved' | 'rejected' | 'conditional' | 'pending';
    readonly effectiveDate?: Date;
    readonly expirationDate?: Date;
}
/**
 * Design approver
 */
export interface DesignApprover {
    readonly name: string;
    readonly role: string;
    readonly authority: 'recommend' | 'approve' | 'veto';
    readonly required: boolean;
    readonly expertise: string[];
}
/**
 * Approval decision
 */
export interface ApprovalDecision {
    readonly approver: string;
    readonly decision: 'approve' | 'reject' | 'conditional' | 'abstain';
    readonly rationale: string;
    readonly conditions: string[];
    readonly concerns: string[];
    readonly date: Date;
}
/**
 * System and Solution Architecture Manager
 */
export declare class SystemSolutionArchitectureManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly runwayManager;
    private readonly piManager;
    private readonly valueStreamMapper;
    private readonly config;
    private state;
    private complianceTimer?;
    private reviewTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, runwayManager: ArchitectureRunwayManager, piManager: ProgramIncrementManager, valueStreamMapper: ValueStreamMapper, config?: Partial<SystemSolutionArchConfig>);
    /**
     * Initialize the System and Solution Architecture Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the System and Solution Architecture Manager
     */
    shutdown(): Promise<void>;
    /**
     * Create system-level design
     */
    createSystemDesign(solutionId: string, systemData: Partial<SystemDesign>): Promise<SystemDesign>;
    /**
     * Coordinate system-level design across multiple systems
     */
    coordinateSystemDesigns(solutionId: string): Promise<SystemDesignCoordination>;
    /**
     * Create solution architect workflow
     */
    createSolutionArchitectWorkflow(solutionId: string, workflowType: 'design' | 'review' | 'approval' | 'governance'): Promise<SolutionArchitectWorkflow>;
    /**
     * Execute solution architect workflow integration
     */
    executeSolutionArchitectWorkflow(workflowId: string): Promise<void>;
    /**
     * Create architecture review and approval gates
     */
    createArchitectureReviewGate(subjectId: string, subjectType: 'system' | 'solution', reviewType: 'design' | 'implementation' | 'security' | 'performance'): Promise<ArchitectureReview>;
    /**
     * Execute architecture review with AGUI
     */
    executeArchitectureReview(reviewId: string): Promise<ArchitectureReview>;
    /**
     * Monitor architecture compliance
     */
    monitorArchitectureCompliance(): Promise<void>;
    /**
     * Assess system compliance against standards
     */
    assessSystemCompliance(systemId: string): Promise<ComplianceReport>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private startComplianceMonitoring;
    private startArchitectureReviews;
    private registerEventHandlers;
    private createDefaultBusinessContext;
    private createDefaultDeploymentArchitecture;
    private createDefaultSecurityArchitecture;
    private createDefaultDataArchitecture;
    private createDefaultIntegrationArchitecture;
    private createDefaultGovernanceFramework;
    private createSystemDesignReviewGate;
    private analyzeSystemInteractions;
    private identifyDesignConflicts;
    private generateCoordinationRecommendations;
    private assessArchitecturalConsistency;
    private createCoordinationApprovalGate;
    private generateWorkflowSteps;
    private identifyWorkflowParticipants;
    private defineWorkflowDeliverables;
    private estimateWorkflowTimeline;
    private identifyWorkflowDependencies;
    private defineWorkflowGates;
    private executeWorkflowStep;
    private getWorkflowById;
    private executeWorkflowGate;
    private completeWorkflow;
    private failWorkflow;
    private assignReviewers;
    private getReviewCriteria;
    private createReviewProcessGate;
    private evaluateReviewCriterion;
    private determineReviewOutcome;
    private generateFollowUpActions;
    private createArchitectureApprovalGate;
    private monitorSystemCompliance;
    private monitorSolutionCompliance;
    private generateComplianceReports;
    private processComplianceViolations;
    private getApplicableStandards;
    private assessStandardCompliance;
    private createComplianceViolation;
    private assessComplianceRisk;
    private calculateComplianceScore;
    private generateRemediationPlans;
    private createComplianceAlert;
    private performScheduledReviews;
    private handleSystemDesignUpdate;
    private handleComplianceThresholdExceeded;
}
export interface SystemDesignCoordination {
    readonly solutionId: string;
    readonly systemCount: number;
    readonly interactions: any[];
    readonly conflicts: any[];
    readonly recommendations: string[];
    readonly consistencyScore: number;
    readonly coordinationStatus: string;
    readonly lastCoordinated: Date;
}
export interface SolutionArchitectWorkflow {
    readonly id: string;
    readonly solutionId: string;
    readonly type: 'design' | 'review' | 'approval' | 'governance';
    readonly status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    readonly steps: any[];
    readonly participants: string[];
    readonly deliverables: string[];
    readonly timeline: string;
    readonly dependencies: string[];
    readonly gates: any[];
    readonly createdAt: Date;
    readonly lastUpdated: Date;
}
export default SystemSolutionArchitectureManager;
export type { SystemSolutionArchConfig, SystemDesign, SolutionDesign, ArchitectureReview, ComplianceReport, SystemSolutionArchState, SystemDesignCoordination, SolutionArchitectWorkflow, };
//# sourceMappingURL=system-solution-architecture-manager.d.ts.map