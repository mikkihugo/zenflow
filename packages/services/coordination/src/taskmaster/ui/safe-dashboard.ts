/**
 * @fileoverview Complete SAFe 6.0 Dashboard - AGUI Interface for Full SAFe Flow Visibility
 * 
 * **COMPLETE VISIBILITY INTO ALL SAFe 6.0 FRAMEWORK FLOWS: **
 * 
 * search **REAL-TIME FLOW MONITORING:**
 * - Every gate decision across all SAFe 6.0 levels
 * - AI vs Human decision patterns
 * - Live approval status and bottlenecks
 * - Escalation tracking and resolution
 * 
 * **COMPREHENSIVE TRACEABILITY:**
 * - End-to-end decision chains
 * - SOC2-compliant audit trails
 * - Learning pattern visualization
 * - Performance analytics
 * 
 * **HUMAN-IN-THE-LOOP INTERFACE:**
 * - Review AI decisions before they execute
 * - Override any automated approval
 * - Batch approve similar items
 * - Set thresholds and preferences
 * 
 * 🧠 **LEARNING INSIGHTS:**
 * - How AI accuracy improves over time
 * - Your decision patterns and preferences
 * - System recommendations for optimization
 * - Compliance and risk trending
 * 
 * 🆕 **NEW SAFe COMPETENCIES (July 2025):**
 * - Investment Validation: Build-Measure-Learn cycle dashboard
 * - Value Stream Organization: Handoff reduction tracking
 * - Business Team Launch: Cross-functional team metrics
 * - Continuous Value Delivery: Automation and feedback analytics
 */
import { getLogger} from '@claude-zen/foundation')../core/approval-gate-manager.js')../integrations/complete-safe-flow-integration.js')../integrations/safe-framework-integration.js');
  ApprovalGateId,
  UserId
} from '../types/index.js')./task-approval-system.js')'; 
// AGUI DASHBOARD TYPES
// ============================================================================
/**
 * Dashboard view modes for different use cases
 */
export enum DashboardViewMode {
  EXECUTIVE_SUMMARY ='executive_summary,     // High-level portfolio view')rte,                                // Release Train Engineer (was Program Manager) - SAFe 6.0')team_lead,                    // Sprint and story focus')compliance_officer,   // Audit and compliance focus')devops_engineer,        // CD pipeline focus')architect,                    // Architecture and technical focus')product_owner,            // Product Owner - SAFe 6.0 (Business value focus)')full_traceability,    // Complete end-to-end view';
  
  // NEW SAFe Competencies Views (July 2025)')investment_validation,    // Build-Measure-Learn cycles')value_stream_optimization,// Handoff reduction tracking')business_agility,             // Cross-functional team metrics')continuous_delivery '        // Automation and feedback analytics';
}
/**
 * Live gate status for dashboard display
 */
export interface LiveGateStatus {
  gateId: getLogger(): void {
    ')Failed to initialize Complete SAFE Dashboard, error'))          case'approve : ';
            actionResult = await this.approvalGateManager.processApproval(): void {
              actionResult = await this.approvalGateManager.processApproval(): void {
    ')Batch approval not allowed for this gate;
}
            break;
            
          default: this.liveGates.get(): void {
            results.push(): void {';
      actionId: action.id,
      success,');
      successCount: results.filter(): void {}
  private updateAnalyticsFromActions(): void {}
  
  private initializeAnalytics(): void {
    return {
      realTime:  {
        activeFlows: 0,
        pendingGates: 0,
        gatesPerHour: 0,
        autoApprovalRate: 0,
        humanOverrideRate: 0,
        averageProcessingTime: 0
},
      aiPerformance:  {
        accuracy: 0.85,
        confidence: 0.82,
        improvement: 15,
        modelUsage:  {},
        decisionSpeed: 2500
},
      humanMetrics:  {
        averageReviewTime: 1200000,
        approvalRate: 0.78,
        rejectionReasons: [],
        escalationPatterns: [],
        productivityTrends: []
},
      flowHealth:  {
        bottlenecks:[],
        predictedDelays: [],
        riskIndicators: []
},
      learning:  {
        patternsDiscovered: 45,
        adaptationsApplied: 12,
        accuracyTrend: [0.75, 0.78, 0.82, 0.85],
        recommendationsGenerated: 8
},
      compliance:  {
        auditTrailCompleteness: 1.0,
        soc2Compliance: true,
        complianceViolations: 0,
        riskAssessments:  {}
}
};
};)};
export default CompleteSafeDashboard;