//! # Canonical Types Module
//!
//! This module provides a single, consolidated source of truth for all data types
//! used across the code-analyzer-core crate, especially for enterprise and
//! SPARC methodology features. It combines definitions from previous `sparc_types`,
//! `enterprise_types`, and `sparc_production_types` modules.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;
use chrono::{DateTime, Utc};

// Import from other modules in this crate
use crate::enterprise_types::{TsosPermissionLevel, ComplianceLevel};

// Forward declarations - these types are defined in lib.rs and imported here
// This approach avoids circular dependencies
pub use crate::{AnalysisResult, MLProjectAnalysis};
use quality_gates::QualityGateResult;

// --- Enums ---

/// Macro to create production-grade enums with comprehensive variants
macro_rules! production_enum {
    ($name:ident { $( $variant:ident ),* $(,)? }) => {
        #[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
        pub enum $name {
            $($variant,)*
        }

        impl Default for $name {
            fn default() -> Self {
                // Use the first variant as default
                production_enum!(@first_variant $($variant,)*)
            }
        }
    };
    (@first_variant $first:ident, $($rest:ident,)*) => { Self::$first };
    (@first_variant $first:ident) => { Self::$first };
}

production_enum! {
    DeliverableType {
        RequirementsDocument,
        ArchitecturalDecisionRecord,
        TechnicalSpecification,
        TestPlan,
        SecurityAssessment,
        PerformanceBenchmark,
        UserDocumentation,
        APIDocumentation,
        DeploymentGuide,
        MaintenanceGuide,
        PseudocodeDocument,
        AlgorithmDesign,
        ArchitectureDocument,
        DesignDocument,
        DetailedDesign,
        OptimizationPlan,
        CodeImplementation,
        TestSuite,
        Documentation,
    }
}

production_enum! {
    QualityGateType {
        CodeReview,
        SecurityScan,
        PerformanceTest,
        IntegrationTest,
        UnitTestCoverage,
        StaticCodeAnalysis,
        DependencyVulnerabilityScan,
        ComplianceAudit,
        RequirementsReview,
        TechnicalReview,
        ArchitectureReview,
        SecurityReview,
        TestReview,
        CoverageCheck,
        TestCoverage,
    }
}

production_enum! {
    ExpertiseLevel {
        Junior,
        MidLevel,
        Senior,
        Expert,
        Architect,
    }
}

production_enum! {
    ReviewCategory {
        Architecture,
        Security,
        Performance,
        Maintainability,
        Testing,
        Documentation,
    }
}

production_enum! {
    DebtPrioritizationCriteria {
        BusinessImpact,
        TechnicalRisk,
        MaintenanceCost,
        DeveloperVelocity,
        CustomerSatisfaction,
    }
}

production_enum! {
    ValidationMethod {
        Automated,
        Manual,
        SemiAutomated,
        PeerReview,
        StakeholderReview,
    }
}

production_enum! {
    CriteriaPriority {
        MustHave,
        ShouldHave,
        CouldHave,
        WontHave,
    }
}

production_enum! {
    DeploymentType {
        BlueGreen,
        Canary,
        RollingUpdate,
        Recreate,
        A_B_Testing,
    }
}

production_enum! {
    PhaseOutcome {
        Successful,
        PartiallySuccessful,
        Failed,
        Cancelled,
        Deferred,
    }
}

production_enum! {
    PrefetchStrategy {
        Sequential,
        Random,
        Adaptive,
        None,
    }
}

// --- Core SPARC and Enterprise Data Structures ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplexityConstraints {
    pub max_cyclomatic_complexity: u32,
    pub max_cognitive_complexity: u32,
    pub max_nesting_depth: u32,
    pub max_function_length: u32,
    pub max_class_coupling: u32,
}

impl Default for ComplexityConstraints {
    fn default() -> Self {
        Self {
            max_cyclomatic_complexity: 10,
            max_cognitive_complexity: 15,
            max_nesting_depth: 4,
            max_function_length: 50,
            max_class_coupling: 7,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewChecklistItem {
    pub item_id: String,
    pub description: String,
    pub mandatory: bool,
    pub category: ReviewCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewRequirements {
    pub minimum_reviewers: u32,
    pub required_expertise_levels: Vec<ExpertiseLevel>,
    pub review_checklist: Vec<ReviewChecklistItem>,
    pub approval_threshold_percentage: f32,
}

impl Default for ReviewRequirements {
    fn default() -> Self {
        Self {
            minimum_reviewers: 2,
            required_expertise_levels: vec![ExpertiseLevel::Senior, ExpertiseLevel::MidLevel],
            review_checklist: Vec::new(),
            approval_threshold_percentage: 80.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceBenchmarks {
    pub response_time_ms: u64,
    pub throughput_requests_per_second: f32,
    pub memory_usage_limit_mb: u32,
    pub cpu_utilization_limit_percent: f32,
    pub disk_io_limit_mbps: u32,
}

impl Default for PerformanceBenchmarks {
    fn default() -> Self {
        Self {
            response_time_ms: 200,
            throughput_requests_per_second: 1000.0,
            memory_usage_limit_mb: 512,
            cpu_utilization_limit_percent: 80.0,
            disk_io_limit_mbps: 100,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityThresholds {
    pub minimum_test_coverage_percent: f32,
    pub maximum_code_duplication_percent: f32,
    pub maximum_technical_debt_ratio: f32,
    pub minimum_maintainability_index: f32,
}

impl Default for QualityThresholds {
    fn default() -> Self {
        Self {
            minimum_test_coverage_percent: 80.0,
            maximum_code_duplication_percent: 10.0,
            maximum_technical_debt_ratio: 15.0,
            minimum_maintainability_index: 70.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DebtRepaymentSprint;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DebtPrioritizationFramework;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebtRepaymentSchedule {
    pub planned_sprints: Vec<DebtRepaymentSprint>,
    pub budget_allocation_percentage: f32,
    pub priority_framework: DebtPrioritizationFramework,
}

impl Default for DebtRepaymentSchedule {
    fn default() -> Self {
        Self {
            planned_sprints: Vec::new(),
            budget_allocation_percentage: 20.0,
            priority_framework: DebtPrioritizationFramework::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicalDebtLimits {
    pub maximum_debt_ratio: f32,
    pub maximum_debt_per_component: Duration,
    pub debt_repayment_schedule: DebtRepaymentSchedule,
    pub prioritization_criteria: Vec<DebtPrioritizationCriteria>,
}

impl Default for TechnicalDebtLimits {
    fn default() -> Self {
        Self {
            maximum_debt_ratio: 20.0,
            maximum_debt_per_component: Duration::from_secs(3600 * 24 * 7), // 1 week
            debt_repayment_schedule: DebtRepaymentSchedule::default(),
            prioritization_criteria: vec![
                DebtPrioritizationCriteria::BusinessImpact,
                DebtPrioritizationCriteria::TechnicalRisk,
            ],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationTestCoverage {
    pub api_endpoints_covered: f32,
    pub data_flows_covered: f32,
    pub error_scenarios_covered: f32,
    pub performance_scenarios_covered: f32,
}

impl Default for IntegrationTestCoverage {
    fn default() -> Self {
        Self {
            api_endpoints_covered: 95.0,
            data_flows_covered: 85.0,
            error_scenarios_covered: 75.0,
            performance_scenarios_covered: 60.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCoverageRequirements {
    pub line_coverage_percent: f32,
    pub branch_coverage_percent: f32,
    pub function_coverage_percent: f32,
    pub integration_test_coverage: IntegrationTestCoverage,
}

impl Default for TestCoverageRequirements {
    fn default() -> Self {
        Self {
            line_coverage_percent: 80.0,
            branch_coverage_percent: 70.0,
            function_coverage_percent: 90.0,
            integration_test_coverage: IntegrationTestCoverage::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProductionReadinessChecklist {
    pub security_review_completed: bool,
    pub performance_validated: bool,
    pub disaster_recovery_tested: bool,
    pub monitoring_configured: bool,
    pub documentation_complete: bool,
    pub deployment_procedures_verified: bool,
    pub rollback_procedures_tested: bool,
    pub support_team_trained: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CrossBrowserTestingRequirements;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MobileDeviceTestingRequirements;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct IntegrationTestRequirements {
    pub api_contract_testing: bool,
    pub database_integration_testing: bool,
    pub external_service_mocking: bool,
    pub end_to_end_scenario_coverage: f32,
    pub cross_browser_testing: Option<CrossBrowserTestingRequirements>,
    pub mobile_device_testing: Option<MobileDeviceTestingRequirements>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LoadTestSuccessCriteria;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LoadTestScenario;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LoadTestRequirements {
    pub concurrent_users: u32,
    pub test_duration_minutes: u32,
    pub ramp_up_time_minutes: u32,
    pub success_criteria: LoadTestSuccessCriteria,
    pub scenarios: Vec<LoadTestScenario>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AcceptanceCondition;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AcceptanceCriteria {
    pub criteria_id: String,
    pub description: String,
    pub acceptance_conditions: Vec<AcceptanceCondition>,
    pub validation_method: ValidationMethod,
    pub priority: CriteriaPriority,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StakeholderApprovalRequirement;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BusinessMetric;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UserAcceptanceTestingRequirements;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RegulatoryRequirement;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BusinessValidation {
    pub stakeholder_approvals: Vec<StakeholderApprovalRequirement>,
    pub business_metrics_validation: Vec<BusinessMetric>,
    pub user_acceptance_testing: UserAcceptanceTestingRequirements,
    pub regulatory_compliance_validation: Vec<RegulatoryRequirement>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EnvironmentStage;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RollbackStrategy;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MonitoringStrategy;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FeatureFlagStrategy;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentStrategy {
    pub deployment_type: DeploymentType,
    pub environment_progression: Vec<EnvironmentStage>,
    pub rollback_strategy: RollbackStrategy,
    pub monitoring_strategy: MonitoringStrategy,
    pub feature_flags: FeatureFlagStrategy,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResponseTimePercentiles;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MaintenanceWindow;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EscalationProcedures;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SlaRequirements {
    pub availability_percentage: f32,
    pub response_time_percentiles: ResponseTimePercentiles,
    pub error_rate_threshold: f32,
    pub maintenance_windows: Vec<MaintenanceWindow>,
    pub escalation_procedures: EscalationProcedures,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PhaseQualityMetrics;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PhaseIssue;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LessonLearned;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhaseExecutionRecord {
    pub phase: SparcPhase,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration: Option<Duration>,
    pub outcome: PhaseOutcome,
    pub quality_metrics: PhaseQualityMetrics,
    pub deliverables_produced: Vec<String>,
    pub issues_encountered: Vec<PhaseIssue>,
    pub lessons_learned: Vec<LessonLearned>,
    pub executed_by: String,
    pub approved_by: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityTrends;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityGateStatus;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityImprovement;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityMetricsTracking {
    pub overall_quality_score: f32,
    pub phase_quality_scores: HashMap<String, f32>,
    pub quality_trends: QualityTrends,
    pub quality_gates_status: HashMap<String, QualityGateStatus>,
    pub quality_improvements: Vec<QualityImprovement>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AllocatedResources;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResourceUtilization;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResourceConstraint;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResourceForecasting;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CostTracking;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResourceManagement {
    pub allocated_resources: AllocatedResources,
    pub resource_utilization: ResourceUtilization,
    pub resource_constraints: Vec<ResourceConstraint>,
    pub resource_forecasting: ResourceForecasting,
    pub cost_tracking: CostTracking,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Risk;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RiskAssessmentMatrix;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RiskMitigationStrategy;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ContingencyPlan;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RiskMonitoring;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RiskManagement {
    pub identified_risks: Vec<Risk>,
    pub risk_assessment_matrix: RiskAssessmentMatrix,
    pub mitigation_strategies: Vec<RiskMitigationStrategy>,
    pub contingency_plans: Vec<ContingencyPlan>,
    pub risk_monitoring: RiskMonitoring,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ComplianceFramework;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ComplianceStatus;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ComplianceAudit;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CompliancePolicy;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ViolationTracking;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ComplianceManagement {
    pub compliance_frameworks: Vec<ComplianceFramework>,
    pub compliance_status: ComplianceStatus,
    pub audit_history: Vec<ComplianceAudit>,
    pub compliance_policies: Vec<CompliancePolicy>,
    pub violation_tracking: ViolationTracking,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProjectTimeline;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CriticalPath;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Milestone;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TaskDependency;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TimelineRisk;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TimelineManagement {
    pub project_timeline: ProjectTimeline,
    pub critical_path: CriticalPath,
    pub milestones: Vec<Milestone>,
    pub dependencies: Vec<TaskDependency>,
    pub timeline_risks: Vec<TimelineRisk>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Stakeholder;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EngagementPlan;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CommunicationMatrix;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ApprovalWorkflow;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StakeholderFeedback;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StakeholderManagement {
    pub stakeholders: Vec<Stakeholder>,
    pub engagement_plan: EngagementPlan,
    pub communication_matrix: CommunicationMatrix,
    pub approval_workflows: Vec<ApprovalWorkflow>,
    pub stakeholder_feedback: Vec<StakeholderFeedback>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct InternalDependency;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ExternalDependency;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DependencyGraph;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DependencyImpactAnalysis;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DependencyMonitoring;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DependencyManagement {
    pub internal_dependencies: Vec<InternalDependency>,
    pub external_dependencies: Vec<ExternalDependency>,
    pub dependency_graph: DependencyGraph,
    pub impact_analysis: DependencyImpactAnalysis,
    pub dependency_monitoring: DependencyMonitoring,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AuditRecord;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct InternalAudit;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AuditFinding;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RemediationTracking;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AuditManagement {
    pub audit_trail: Vec<AuditRecord>,
    pub compliance_audits: Vec<ComplianceAudit>,
    pub internal_audits: Vec<InternalAudit>,
    pub audit_findings: Vec<AuditFinding>,
    pub remediation_tracking: RemediationTracking,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BusinessContext;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TechnicalContext;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct OrganizationalContext;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProjectMetadata {
    pub project_tags: Vec<String>,
    pub business_context: BusinessContext,
    pub technical_context: TechnicalContext,
    pub organizational_context: OrganizationalContext,
    pub custom_fields: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VelocityMetrics;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityMetrics;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProductivityMetrics;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EfficiencyMetrics;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SatisfactionMetrics;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PerformanceMetrics {
    pub velocity_metrics: VelocityMetrics,
    pub quality_metrics: QualityMetrics,
    pub productivity_metrics: ProductivityMetrics,
    pub efficiency_metrics: EfficiencyMetrics,
    pub satisfaction_metrics: SatisfactionMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityAssessment;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VulnerabilityManagement;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThreatModeling;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityControl;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityComplianceStatus;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityPosture {
    pub security_assessment: SecurityAssessment,
    pub vulnerability_management: VulnerabilityManagement,
    pub threat_modeling: ThreatModeling,
    pub security_controls: Vec<SecurityControl>,
    pub compliance_status: SecurityComplianceStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ExternalIntegration;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ApiConfiguration;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DataPipeline;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EventSubscription;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WebhookConfiguration;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct IntegrationConfiguration {
    pub external_integrations: Vec<ExternalIntegration>,
    pub api_configurations: Vec<ApiConfiguration>,
    pub data_pipelines: Vec<DataPipeline>,
    pub event_subscriptions: Vec<EventSubscription>,
    pub webhook_configurations: Vec<WebhookConfiguration>,
}


// --- High-Level Enterprise Configuration Structs ---

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DatabaseConnectionPool {
    pub min_connections: u32,
    pub max_connections: u32,
    pub connection_timeout_ms: u64,
    pub idle_timeout_ms: u64,
    pub max_lifetime_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MigrationConfiguration;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BackupConfiguration;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DatabaseOptimizationConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfiguration {
    pub primary_database_url: String,
    pub read_replica_urls: Vec<String>,
    pub connection_pool: DatabaseConnectionPool,
    pub migration_config: MigrationConfiguration,
    pub backup_config: BackupConfiguration,
    pub optimization_config: DatabaseOptimizationConfig,
}

impl Default for DatabaseConfiguration {
    fn default() -> Self {
        Self {
            primary_database_url: String::new(),
            read_replica_urls: Vec::new(),
            connection_pool: Default::default(),
            migration_config: Default::default(),
            backup_config: Default::default(),
            optimization_config: Default::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RequestTimeoutConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResourceLimitsConfig;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RateLimitingConfiguration {
    pub requests_per_minute: u32,
    pub burst_size: u32,
    pub window_size_ms: u64,
    pub cleanup_interval_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LoadBalancingConfiguration;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CircuitBreakerConfiguration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfiguration {
    pub max_concurrent_operations: u32,
    pub event_buffer_size: usize,
    pub request_timeouts: RequestTimeoutConfig,
    pub resource_limits: ResourceLimitsConfig,
    pub rate_limiting: RateLimitingConfiguration,
    pub load_balancing: LoadBalancingConfiguration,
    pub circuit_breaker: CircuitBreakerConfiguration,
    pub monitoring_thresholds: PerformanceThresholds,
}

impl Default for PerformanceConfiguration {
    fn default() -> Self {
        Self {
            max_concurrent_operations: 100,
            event_buffer_size: 1024,
            request_timeouts: Default::default(),
            resource_limits: Default::default(),
            rate_limiting: Default::default(),
            load_balancing: Default::default(),
            circuit_breaker: Default::default(),
            monitoring_thresholds: Default::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AuthenticationConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AuthorizationConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EncryptionConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AuditLoggingConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityMonitoringConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ComplianceFrameworkConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VulnerabilityScanningConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct IncidentResponseConfig;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityConfiguration {
    pub authentication: AuthenticationConfig,
    pub authorization: AuthorizationConfig,
    pub encryption: EncryptionConfig,
    pub audit_logging: AuditLoggingConfig,
    pub security_monitoring: SecurityMonitoringConfig,
    pub compliance_frameworks: Vec<ComplianceFrameworkConfig>,
    pub vulnerability_scanning: VulnerabilityScanningConfig,
    pub incident_response: IncidentResponseConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MetricsConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LoggingConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TracingConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AlertingConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DashboardConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct HealthCheckConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProfilingConfig;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MonitoringConfiguration {
    pub metrics_config: MetricsConfig,
    pub logging_config: LoggingConfig,
    pub tracing_config: TracingConfig,
    pub alerting_config: AlertingConfig,
    pub dashboard_config: DashboardConfig,
    pub health_check_config: HealthCheckConfig,
    pub profiling_config: ProfilingConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DataGovernanceConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TenantIsolationConfiguration {
    pub strict_isolation: bool,
    pub resource_quotas: HashMap<String, u64>,
    pub data_encryption_per_tenant: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ComplianceValidationConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AuditTrailConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DataRetentionConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PrivacyProtectionConfig;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GovernanceConfiguration {
    pub data_governance: DataGovernanceConfig,
    pub tenant_isolation: TenantIsolationConfiguration,
    pub compliance_validation: ComplianceValidationConfig,
    pub audit_trail: AuditTrailConfig,
    pub data_retention: DataRetentionConfig,
    pub privacy_protection: PrivacyProtectionConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FeatureFlags {
    pub sparc_features: HashMap<String, bool>,
    pub tsos_features: HashMap<String, bool>,
    pub ml_features: HashMap<String, bool>,
    pub analytics_features: HashMap<String, bool>,
    pub experimental_features: HashMap<String, bool>,
    pub rollout_percentages: HashMap<String, f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct IntegrationConfig;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CacheConfiguration;
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EventStreamingConfiguration;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EngineConfiguration {
    pub database_config: DatabaseConfiguration,
    pub performance_config: PerformanceConfiguration,
    pub security_config: SecurityConfiguration,
    pub monitoring_config: MonitoringConfiguration,
    pub feature_flags: FeatureFlags,
    pub integration_configs: HashMap<String, IntegrationConfig>,
    pub governance_config: GovernanceConfiguration,
    pub cache_config: CacheConfiguration,
    pub event_streaming_config: EventStreamingConfiguration,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualitySummary;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ComplianceSummary;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResourceUtilizationSummary;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RiskSummary;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ActivityRecord;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProjectPerformanceMetrics;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TenantProfile;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CustomMetric;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DashboardFeed;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DatabaseConnection;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TokenBucket;

pub trait RegulatoryAdapter: Send + Sync {}
pub trait IntegrationAdapter: Send + Sync {}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MLPrediction;

// SAFe Integration Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStory {
    pub id: String,
    pub title: String,
    pub description: String,
    pub acceptance_criteria: Vec<String>,
    pub story_points: u32,
    pub priority: ProjectPriority,
    pub status: StoryStatus,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum StoryStatus {
    Backlog,
    InProgress,
    Review,
    Done,
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgramIncrement {
    pub id: String,
    pub name: String,
    pub start_date: chrono::DateTime<chrono::Utc>,
    pub end_date: chrono::DateTime<chrono::Utc>,
    pub objectives: Vec<String>,
    pub teams: Vec<String>,
    pub user_stories: Vec<UserStory>,
}

// Additional missing types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeAnalyzer {
    pub name: String,
    pub version: String,
    pub capabilities: Vec<String>,
}

impl CodeAnalyzer {
    pub fn new() -> Self {
        Self {
            name: "CodeAnalyzer".to_string(),
            version: "1.0.0".to_string(),
            capabilities: vec![
                "AST Analysis".to_string(),
                "Code Metrics".to_string(),
                "Pattern Detection".to_string(),
                "Security Scanning".to_string(),
            ],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityScanner {
    pub name: String,
    pub version: String,
    pub enabled_rules: Vec<String>,
}

impl SecurityScanner {
    pub fn new() -> Self {
        Self {
            name: "SecurityScanner".to_string(),
            version: "1.0.0".to_string(),
            enabled_rules: vec![
                "SQL Injection".to_string(),
                "XSS Detection".to_string(),
                "Hardcoded Secrets".to_string(),
                "Unsafe Eval".to_string(),
            ],
        }
    }
}

// Project Analysis Result Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectAnalysisResult {
    pub code_analysis: AnalysisResult,
    pub security_scan: Vec<SecurityIssue>,
    pub quality_results: QualityGateResult,
    pub ml_analysis: MLProjectAnalysis,
    pub context: ProjectContext,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

// Project Context Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectContext {
    pub project_path: String,
    pub project_name: String,
    pub language: String,
    pub framework: Option<String>,
    pub dependencies: Vec<String>,
}

impl ProjectContext {
    pub fn new(project_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            project_path: project_path.to_string(),
            project_name: std::path::Path::new(project_path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("unknown")
                .to_string(),
            language: "rust".to_string(), // Default, could be detected
            framework: None,
            dependencies: Vec::new(),
        })
    }
}

/// Event types for coordination and workflow management
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EventType {
    SparcPhaseComplete,
    QualityGateResult,
    CoordinatedProjectStarted,
    CoordinatedPhaseAdvanced,
    TeamAssignmentChanged,
    KanbanStatusUpdated,
    AgentTaskAssigned,
    WorkflowDependencyResolved,
}

// ===== SPARC TYPES =====

/// SPARC Project representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SparcProject {
    pub id: String,
    pub name: String,
    pub description: String,
    pub current_phase: SparcPhase,
    pub methodology_type: SparcMethodologyType,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

/// SPARC methodology types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SparcMethodologyType {
    Standard,
    Agile,
    Enterprise,
    Research,
}

/// SPARC methodology phases
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SparcPhase {
    Specification,
    Pseudocode, 
    Architecture,
    Refinement,
    Completion,
}

/// SPARC Engine for methodology management
#[derive(Debug)]
pub struct SparcEngine {
    pub current_projects: std::collections::HashMap<String, SparcProject>,
}

impl Default for SparcEngine {
    fn default() -> Self {
        Self {
            current_projects: std::collections::HashMap::new(),
        }
    }
}

impl SparcEngine {
    pub fn new() -> Self {
        Self::default()
    }
}

// ===== TSOS AND ADDITIONAL TYPES =====

/// SPARC Methodology Engine
#[derive(Debug, Clone)]
pub struct SparcMethodologyEngine {
    pub active_methodology: SparcMethodologyType,
    pub phase_transition_history: Vec<SparcPhase>,
}

impl Default for SparcMethodologyEngine {
    fn default() -> Self {
        Self {
            active_methodology: SparcMethodologyType::Standard,
            phase_transition_history: Vec::new(),
        }
    }
}

/// System Resource Utilization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemResourceUtilization {
    pub cpu_usage_percent: f64,
    pub memory_usage_bytes: u64,
    pub disk_usage_bytes: u64,
    pub network_io_bytes_per_second: u64,
    pub timestamp: DateTime<Utc>,
}

/// Tenant Operational Status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantOperationalStatus {
    pub tenant_id: String,
    pub status: String,
    pub active_tasks: usize,
    pub resource_allocation: HashMap<String, f64>,
    pub last_health_check: DateTime<Utc>,
}

/// User TSOS Permissions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserTsosPermissions {
    pub user_id: String,
    pub permission_level: TsosPermissionLevel,
    pub allowed_operations: Vec<String>,
    pub resource_limits: HashMap<String, f64>,
}

impl UserTsosPermissions {
    pub fn can_access_tenant(&self, tenant_id: &str) -> bool {
        // Basic implementation - can be enhanced with more complex logic
        match self.permission_level {
            TsosPermissionLevel::Admin => true,
            TsosPermissionLevel::Standard => {
                // Allow if specific tenant operations are granted
                self.allowed_operations.iter().any(|op| op.contains(tenant_id))
            }
            _ => false,
        }
    }
}

/// Tenant Resource Check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantResourceCheck {
    pub tenant_id: String,
    pub resource_type: String,
    pub available_amount: f64,
    pub requested_amount: f64,
    pub can_allocate: bool,
}

/// Tenant Restriction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantRestriction {
    pub tenant_id: String,
    pub restriction_type: String,
    pub description: String,
    pub severity: IssueSeverity,
    pub active: bool,
}

impl TenantRestriction {
    pub fn blocks_tsos_access(&self) -> bool {
        // Block access if restriction is active and of sufficient severity
        self.active && matches!(self.severity, IssueSeverity::High | IssueSeverity::Critical)
    }
}

/// Issue Severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum IssueSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Compliance Issue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceIssue {
    pub issue_id: String,
    pub description: String,
    pub severity: IssueSeverity,
    pub compliance_level: ComplianceLevel,
    pub discovered_at: DateTime<Utc>,
}

/// Audit Trail Status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditTrailStatus {
    pub audit_id: String,
    pub status: String,
    pub entries_count: usize,
    pub last_updated: DateTime<Utc>,
    pub compliance_verified: bool,
}

/// Security Compliance Check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityComplianceCheck {
    pub check_id: String,
    pub security_level: String,
    pub compliance_status: String,
    pub issues_found: Vec<String>,
    pub passed: bool,
    pub timestamp: DateTime<Utc>,
}

/// Data Compliance Check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataComplianceCheck {
    pub check_id: String,
    pub data_classification: String,
    pub compliance_policies: Vec<String>,
    pub violations: Vec<String>,
    pub compliant: bool,
    pub timestamp: DateTime<Utc>,
}

/// Operational Compliance Check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationalComplianceCheck {
    pub check_id: String,
    pub operational_area: String,
    pub compliance_requirements: Vec<String>,
    pub status: String,
    pub compliant: bool,
    pub timestamp: DateTime<Utc>,
}

/// Performance Thresholds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceThresholds {
    pub cpu_threshold_percent: f64,
    pub memory_threshold_bytes: u64,
    pub response_time_threshold_ms: u64,
    pub throughput_threshold_rps: u64,
}

/// Project Priority levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ProjectPriority {
    Low,
    Medium,
    High,
    Critical,
    Emergency,
}

/// Security Issue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityIssue {
    pub id: String,
    pub description: String,
    pub severity: IssueSeverity,
    pub issue_type: String,
    pub location: String,
    pub recommendation: String,
    pub discovered_at: DateTime<Utc>,
}