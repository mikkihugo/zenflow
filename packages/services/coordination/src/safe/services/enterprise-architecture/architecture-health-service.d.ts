export interface ArchitectureHealthMetrics {
  readonly timestamp: Date;
  readonly overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  readonly overallScore: number;
  readonly dimensions: HealthDimension[];
  readonly lastAssessment: Date;
}

export interface HealthDimension {
  readonly id: string;
  readonly name: string;
  readonly category: 'technical' | 'operational' | 'strategic' | 'compliance';
  readonly score: number;
  readonly weight: number;
  readonly status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  readonly trend: 'improving' | 'stable' | 'declining';
  readonly metrics: DimensionMetric[];
  readonly issues: HealthIssue[];
  readonly recommendations: string[];
}
export interface DimensionMetric {
readonly metricId: string;
readonly name: string;
readonly value: number;
readonly unit: string;
readonly target: number;
readonly threshold: MetricThreshold;
readonly importance: 'critical| high| medium' | ' low';
readonly dataSource: string;
readonly lastUpdated: Date;
readonly trend: MetricTrend;

}
export interface MetricThreshold {
readonly excellent: number;
readonly good: number;
readonly fair: number;
readonly poor: number;
readonly critical: number;

}
export interface MetricTrend {
readonly direction: 'up' | ' down' | ' stable';
readonly velocity: number;
readonly confidence: number;
readonly projection: TrendProjection;

}
export interface TrendProjection {
readonly timeframe: string;
readonly projectedValue: number;
readonly confidence: number;
readonly factors: string[];

}
export interface HealthIssue {
  readonly issueId: string;
  readonly title: string;
  readonly description: string;
  readonly category: 'architecture' | 'design' | 'implementation' | 'operations' | 'governance';
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly impact: IssueImpact;
  readonly cost: IssueCost;
  readonly status: 'open' | 'in_progress' | 'resolved' | 'closed';
  readonly assignedTo?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
export interface IssueImpact {
readonly performance: 'high| medium| low' | ' none';
readonly security: 'high| medium| low' | ' none';
readonly maintainability: 'high| medium| low' | ' none';
readonly scalability: 'high| medium| low' | ' none';
readonly compliance: 'high| medium| low' | ' none';
readonly business: 'high| medium| low' | ' none';

}
export interface IssueCost {
readonly immediate: number;
readonly ongoing: number;
readonly currency: string;
readonly timeToResolve: string;
readonly resourcesRequired: ResourceRequirement[];

}
export interface ResourceRequirement {
readonly type: 'developer| architect| ops| security' | ' budget';
readonly quantity: number;
readonly duration: string;
readonly skillLevel: 'junior| mid| senior' | ' expert';
readonly availability: string;

}
export interface HealthTrend {
readonly dimension: string;
readonly period: string;
readonly direction: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';
readonly velocity: number;
readonly significance: number;
readonly confidence: number;
readonly driverFactors: TrendFactor[];
readonly projections: TrendProjection[];

}
export interface TrendFactor {
readonly factor: string;
readonly impact: number;
readonly confidence: number;
readonly description: string;
readonly category: 'internal| external| organizational' | ' technical';

}
export interface HealthAlert {
readonly alertId: string;
readonly type: threshold_breach | trend_deterioration | anomaly_detected | 'prediction_warning';
readonly severity: critical | high | medium;

}
export interface AlertImpact {
readonly immediate: 'high' | ' medium' | ' low';
readonly shortTerm: 'high' | ' medium' | ' low';
readonly longTerm: 'high' | ' medium' | ' low';
readonly affectedSystems: string[];
readonly affectedTeams: string[];
readonly businessImpact: string;

}
export interface EscalationRule {
readonly autoEscalate: boolean;
readonly escalationDelay: string;
readonly escalateToRoles: string[];
readonly escalationMessage: string;
readonly maxEscalations: number;

}
export interface HealthRecommendation {
readonly recommendationId: string;
readonly priority: critical | high | medium;

}
export interface RecommendationImpact {
readonly healthImprovement: number;
readonly affectedDimensions: string[];
readonly business: BusinessImpact;
readonly technical: TechnicalImpact;
readonly operational: OperationalImpact;

}
export interface BusinessImpact {
readonly revenue: 'positive' | ' negative' | ' neutral';
readonly cost: 'decrease' | ' increase' | ' neutral';
readonly risk: 'decrease' | ' increase' | ' neutral';
readonly agility: 'increase' | ' decrease' | ' neutral';
readonly innovation: 'increase' | ' decrease' | ' neutral';

}
export interface TechnicalImpact {
readonly performance: 'improve' | ' degrade' | ' neutral';
readonly scalability: 'improve' | ' degrade' | ' neutral';
readonly maintainability: 'improve' | ' degrade' | ' neutral';
readonly security: 'improve' | ' degrade' | ' neutral';
readonly reliability: 'improve' | ' degrade' | ' neutral';

}
export interface OperationalImpact {
readonly deployability: 'improve' | ' degrade' | ' neutral';
readonly monitoring: 'improve' | ' degrade' | ' neutral';
readonly troubleshooting: 'improve' | ' degrade' | ' neutral';
readonly automation: 'increase' | ' decrease' | ' neutral';
readonly complexity: 'decrease' | ' increase' | ' neutral';

}
export interface ImplementationGuide {
readonly phases: ImplementationPhase[];
readonly prerequisites: string[];
readonly resources: ResourceRequirement[];
readonly tools: string[];
readonly documentation: string[];
readonly training: TrainingRequirement[];

}
export interface ImplementationPhase {
readonly phaseId: string;
readonly name: string;
readonly description: string;
readonly duration: string;
readonly effort: 'low' | ' medium' | ' high';
readonly parallelizable: boolean;
readonly deliverables: string[];
readonly acceptance: string[];
readonly risks: string[];

}
export interface TrainingRequirement {
readonly audience: string;
readonly topic: string;
readonly duration: string;
readonly format: 'classroom| online| hands_on' | ' mentoring';
readonly priority: required;

}
export interface RecommendationCost {
readonly development: number;
readonly infrastructure: number;
readonly training: number;
readonly operational: number;
readonly total: number;
readonly currency: string;
readonly paybackPeriod: string;
readonly roi: number;

}
export interface SuccessMetrics {
readonly objectives: string[];
readonly kpis: SuccessKPI[];
readonly milestones: Milestone[];
readonly reviewFrequency: string;

}
export interface SuccessKPI {
readonly name: string;
readonly currentValue: number;
readonly targetValue: number;
readonly unit: string;
readonly measurement: string;
readonly threshold: number;

}
export interface Milestone {
readonly name: string;
readonly description: string;
readonly targetDate: Date;
readonly criteria: string[];
readonly dependencies: string[];

}
export interface HistoricalHealthData {
readonly timestamp: Date;
readonly overallHealth: number;
readonly dimensionScores: Record<string, number>;
readonly events: HealthEvent[];
readonly context: HealthContext;

}
export interface HealthEvent {
readonly eventId: string;
readonly type: improvement | degradation | incident | change | 'milestone';
readonly description: string;
readonly impact: number;
readonly duration: string;
readonly affectedDimensions: string[];

}
export interface HealthContext {
readonly organizationalChanges: string[];
readonly technologyChanges: string[];
readonly businessChanges: string[];
readonly externalFactors: string[];

}
export interface ArchitecturalDebt {
readonly totalDebt: number;
readonly currency: string;
readonly categories: DebtCategory[];
readonly timeline: DebtTimeline;
readonly priority: DebtPriority[];
readonly trends: DebtTrend;

}
export interface DebtCategory {
readonly category: technical | design | documentation | testing | 'security';
readonly amount: number;
readonly percentage: number;
readonly items: DebtItem[];
readonly trend: 'increasing' | ' decreasing' | ' stable';

}
export interface DebtItem {
readonly itemId: string;
readonly title: string;
readonly description: string;
readonly cost: number;
readonly interest: number;
readonly severity: critical | high | medium;

}
export interface DebtTimeline {
readonly immediate: number;
readonly shortTerm: number;
readonly mediumTerm: number;
readonly longTerm: number;
readonly recommendations: TimelineRecommendation[];

}
export interface TimelineRecommendation {
readonly period: 'immediate| short_term| medium_term' | ' long_term';
readonly items: string[];
readonly rationale: string;
readonly impact: string;

}
export interface DebtPriority {
readonly itemId: string;
readonly priority: number;
readonly rationale: string;
readonly dependencies: string[];
readonly blockingIssues: string[];

}
export interface DebtTrend {
readonly direction: 'increasing' | ' decreasing' | ' stable';
readonly velocity: number;
readonly projectedDebt: number;
readonly timeframe: string;
readonly factors: string[];

}
export interface ComplianceHealth {
readonly overallCompliance: number;
readonly regulations: RegulationCompliance[];
readonly standards: StandardCompliance[];
readonly policies: PolicyCompliance[];
readonly violations: ComplianceViolation[];
readonly riskLevel: 'low| medium| high' | ' critical';

}
export interface RegulationCompliance {
readonly regulation: string;
readonly compliance: number;
readonly requirements: RequirementCompliance[];
readonly gaps: ComplianceGap[];
readonly nextAudit: Date;

}
export interface RequirementCompliance {
readonly requirement: string;
readonly status: 'compliant' | ' non_compliant' | ' partially_compliant';
readonly evidence: string[];
readonly lastVerified: Date;

}
export interface ComplianceGap {
readonly gapId: string;
readonly description: string;
readonly impact: 'high' | ' medium' | ' low';
readonly remediation: string;
readonly timeline: string;
readonly owner: string;

}
export interface StandardCompliance {
readonly standard: string;
readonly compliance: number;
readonly violations: number;
readonly lastCheck: Date;

}
export interface PolicyCompliance {
readonly policy: string;
readonly compliance: number;
readonly exceptions: number;
readonly lastReview: Date;

}
export interface ComplianceViolation {
readonly violationId: string;
readonly type: string;
readonly description: string;
readonly severity: critical | high | medium;

}
export interface PerformanceHealth {
readonly overallPerformance: number;
readonly throughput: ThroughputMetrics;
readonly latency: LatencyMetrics;
readonly availability: AvailabilityMetrics;
readonly scalability: ScalabilityMetrics;
readonly bottlenecks: PerformanceBottleneck[];

}
export interface ThroughputMetrics {
readonly current: number;
readonly target: number;
readonly peak: number;
readonly unit: string;
readonly trend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';

}
export interface LatencyMetrics {
readonly p50: number;
readonly p95: number;
readonly p99: number;
readonly target: number;
readonly unit: string;
readonly trend: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' declining';

}
export interface AvailabilityMetrics {
readonly uptime: number;
readonly target: number;
readonly mtbf: number;
readonly mttr: number;
readonly incidents: number;

}
export interface ScalabilityMetrics {
readonly currentCapacity: number;
readonly maxCapacity: number;
readonly utilizationRate: number;
readonly elasticity: number;
readonly constraints: string[];

}
export interface PerformanceBottleneck {
readonly bottleneckId: string;
readonly component: string;
readonly type: cpu | memory | disk | network | database | 'application';
readonly impact: number;
readonly frequency: number;
readonly resolution: string;

}
export interface SecurityHealth {
readonly overallSecurity: number;
readonly vulnerabilities: SecurityVulnerability[];
readonly threats: SecurityThreat[];
readonly controls: SecurityControl[];
readonly incidents: SecurityIncident[];
readonly riskLevel: 'low| medium| high' | ' critical';

}
export interface SecurityVulnerability {
readonly cveId?: string;
readonly severity: critical | high | medium;

}
export interface SecurityThreat {
readonly threatId: string;
readonly type: string;
readonly likelihood: number;
readonly impact: number;
readonly risk: number;
readonly mitigations: string[];

}
export interface SecurityControl {
readonly controlId: string;
readonly type: 'preventive' | ' detective' | ' corrective';
readonly effectiveness: number;
readonly coverage: number;
readonly status: 'active' | ' inactive' | ' partial';

}
export interface SecurityIncident {
readonly incidentId: string;
readonly type: string;
readonly severity: critical | high | medium;

}
export interface MaintainabilityHealth {
readonly overallMaintainability: number;
readonly codeQuality: CodeQualityMetrics;
readonly documentation: DocumentationMetrics;
readonly testCoverage: TestCoverageMetrics;
readonly complexity: ComplexityMetrics;
readonly coupling: CouplingMetrics;

}
export interface CodeQualityMetrics {
readonly score: number;
readonly issues: number;
readonly duplication: number;
readonly technicalDebt: number;
readonly maintainabilityIndex: number;

}
export interface DocumentationMetrics {
readonly coverage: number;
readonly quality: number;
readonly freshness: number;
readonly accessibility: number;

}
export interface TestCoverageMetrics {
readonly overall: number;
readonly unit: number;
readonly integration: number;
readonly endToEnd: number;
readonly quality: number;

}
export interface ComplexityMetrics {
readonly cyclomatic: number;
readonly cognitive: number;
readonly npath: number;
readonly halstead: number;

}
export interface CouplingMetrics {
readonly afferent: number;
readonly efferent: number;
readonly instability: number;
readonly abstractness: number;

}
export interface ScalabilityHealth {
readonly overallScalability: number;
readonly horizontal: ScalabilityDimension;
readonly vertical: ScalabilityDimension;
readonly elasticity: ElasticityMetrics;
readonly constraints: ScalabilityConstraint[];

}
export interface ScalabilityDimension {
readonly current: number;
readonly maximum: number;
readonly efficiency: number;
readonly bottlenecks: string[];

}
export interface ElasticityMetrics {
readonly responseTime: number;
readonly accuracy: number;
readonly cost: number;
readonly automation: number;

}
export interface ScalabilityConstraint {
readonly type: resource | architectural | data | network | 'operational';
readonly description: string;
readonly impact: number;
readonly remediation: string;

}
export interface HealthMonitoringConfig {
readonly enableRealTimeMonitoring: boolean;
readonly monitoringInterval: number;
readonly alertThresholds: AlertThreshold[];
readonly escalationRules: EscalationRule[];
readonly reportingSchedule: ReportingSchedule[];
readonly retentionPeriod: number;
readonly dimensions: DimensionConfig[];

}
export interface AlertThreshold {
readonly dimension: string;
readonly metric: string;
readonly warningThreshold: number;
readonly criticalThreshold: number;
readonly enabled: boolean;

}
export interface ReportingSchedule {
readonly frequency: 'hourly| daily| weekly| monthly' | ' quarterly';
readonly recipients: string[];
readonly format: 'dashboard| email| slack' | ' api';
readonly includeRecommendations: boolean;

}
export interface DimensionConfig {
readonly name: string;
readonly enabled: boolean;
readonly weight: number;
readonly metrics: string[];
readonly thresholds: MetricThreshold;

}
/**
* Architecture Health Service for enterprise architecture health monitoring
*/
export declare class ArchitectureHealthService extends EventBus {
private readonly logger;
private config;

}
//# sourceMappingURL=architecture-health-service.d.ts.map