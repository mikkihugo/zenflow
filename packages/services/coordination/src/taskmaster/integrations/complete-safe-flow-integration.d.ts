import { SafeFrameworkIntegration } from './safe-framework-integration.js';
/**
 * ALL SAFe 6.0 framework gate categories that TaskMaster orchestrates
 * Official terminology from framework.scaledagile.com: 'strategic_theme')investment_funding')value_stream')portfolio_kanban')epic_approval,';
  // ART Level Gates (Agile Release Train) - SAFe 6.0')planning_interval_planning,// Was PI_PLANNING')feature_approval')capability_approval')enabler_approval')system_demo')inspect_adapt,';
  // Team Level Gates')story_approval')task_approval')code_review')definition_of_done')sprint_review,';
  // Solution Level Gates')solution_intent')architecture_review')compliance_review')integration_approval')deployment_approval,';
  // Continuous Delivery Gates')build_gate')test_gate')security_gate')performance_gate')release_gate,';
  // Cross-Cutting Gates')risk_assessment')dependency_resolution')resource_allocation')stakeholder_signoff,';
  // NEW SAFe Competencies Gates (July 2025)')investment_validation,// Validating Investment Opportunities')value_stream_organization,// Organizing Around Value for Large Solutions')business_team_launch,// Launching Agile Business Teams and Trains')continuous_value_delivery,// Continuously Delivering Value')strategic_planning',
  PORTFOLIO_BACKLOG = 'portfolio_backlog',
  EPIC_DEVELOPMENT = 'epic_development,',
  /**
   * Complete SAFE entity types that flow through gates
   */
  export,
  interface,
  SafeEntity,
}
/**
 * Complete SAFE flow configuration
 */
export interface CompleteSafeFlowConfig {
  portfolio: {
    enableStrategicThemeGates: boolean;
    enableInvestmentGates: boolean;
    enableValueStreamGates: boolean;
    enableEpicGates: boolean;
    autoApprovalThresholds: Record<string, number>;
  };
  art: {
    enablePlanningIntervalPlanningGates: boolean;
    enableFeatureGates: boolean;
    enableCapabilityGates: boolean;
    enableSystemDemoGates: boolean;
    autoApprovalThresholds: Record<string, number>;
  };
  team: {
    enableStoryGates: boolean;
    enableTaskGates: boolean;
    enableCodeReviewGates: boolean;
    enableSprintGates: boolean;
    autoApprovalThresholds: Record<string, number>;
  };
  solution: {
    enableSolutionIntentGates: boolean;
    enableArchitectureGates: boolean;
    enableComplianceGates: boolean;
    enableIntegrationGates: boolean;
    autoApprovalThresholds: Record<string, number>;
  };
  continuousDelivery: {
    enableBuildGates: boolean;
    enableTestGates: boolean;
    enableSecurityGates: boolean;
    enablePerformanceGates: boolean;
    enableReleaseGates: boolean;
    autoApprovalThresholds: Record<string, number>;
  };
  crossCutting: {
    enableRiskGates: boolean;
    enableDependencyGates: boolean;
    enableResourceGates: boolean;
    enableStakeholderGates: boolean;
    globalEscalationRules: any[];
  };
  traceability: {
    enableFullTraceability: boolean;
    enableLearning: boolean;
    enablePatternRecognition: boolean;
    auditLevel: 'basic| soc2' | ' comprehensive';
    retentionDays: number;
  };
}
/**
 * Complete SAFE Flow Integration Service
 *
 * Orchestrates TaskMaster approval gates for EVERY aspect of the SAFE framework.
 * Provides end-to-end traceability, learning, and AGUI visibility.
 */
export declare class CompleteSafeFlowIntegration {
  private readonly logger;
  private llmApprovalService;
  private gateOrchestration;
  constructor(
    approvalGateManager: approvalGateManager,
    this: any,
    config: any,
    this: any,
    baseIntegration?: SafeFrameworkIntegration
  );
}
export default CompleteSafeFlowIntegration;
//# sourceMappingURL=complete-safe-flow-integration.d.ts.map
