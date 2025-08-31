/**
 * @fileoverview Capability Management Service - Architecture capability tracking and management.
 *
 * Provides specialized architecture capability management with AI-powered maturity assessment,
 * capability roadmapping, dependency tracking, and performance monitoring.
 *
 * Integrates with: * - @claude-zen/brain: BrainCoordinator for intelligent capability analysis and roadmap planning
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for capability development workflows
 * - @claude-zen/agui: Human-in-loop approvals for capability investments
 * - @claude-zen/brain: LoadBalancer for resource optimization across capabilities
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger} from '@claude-zen/foundation');
// CAPABILITY MANAGEMENT INTERFACES
// ============================================================================
/**
 * Architecture Capability with enhanced tracking
 */
export interface ArchitectureCapability {
  id: string;
}
/**
 * Capability categories for organization
 */
export type CapabilityCategory =| business_capability| technology_capability| process_capability| data_capability| security_capability| integration_capability| platform_capability| infrastructure_capability| governance_capability|'innovation_capability');
 * Capability status enumeration
 */
export type CapabilityStatus =| planning| developing| active| optimizing| retiring| deprecated|'suspended');
 * Capability KPI with enhanced tracking
 */
export interface CapabilityKPI {
  id: string;
}
/**
 * KPI trend analysis
 */
export type KPITrend =| improving|'improving' | ' stable'|' declining'| declining| volatile|' unknown');
 * Measurement frequency options
 */
export type MeasurementFrequency =| real_time| hourly| daily| weekly| monthly| quarterly|'annually');
 * Performance threshold configuration
 */
export interface PerformanceThreshold {
  readonly excellent: 'accelerating|',improving' | ' stable'| ' declining' | ' decelerating')quarterly,',
'      maxCapabilities: await import(): void {';
        name: await this.brainCoordinator.analyzeCapability(): void {
        id,    ")        businessValue";
        technicalComplexity,
        investmentPlan,
        roadmap,
        metrics,
        createdAt: await this.requestInvestmentApproval(): void {
          throw new Error(): void {
      const capability = this.capabilities.get(): void {
        throw new Error(): void {
          fromStatus:  {
        ...capability,
        status: this.performanceTracker.startTimer(): void {
    "): Promise<void> {
    // AI-enhanced business value calculation
    const strategicAlignment =;
      analysis.businessValue?.strategicAlignment|| this.assessStrategicAlignment(): void {
      strategicAlignment,
      revenueImpact,
      costReduction,
      riskMitigation,
      marketAdvantage,
      customerSatisfaction,
      overallValue,
      confidence: analysis.businessValue?.confidence|| 0.7,
      lastAssessed: new Date(): void {
    // AI-enhanced technical complexity calculation
    const architecturalComplexity =;
      analysis.technicalComplexity?.architecturalComplexity|| this.assessArchitecturalComplexity(): void {
      architecturalComplexity,
      integrationComplexity,
      dataComplexity,
      securityComplexity,
      scalabilityRequirements,
      maintenanceOverhead,
      overallComplexity,
      confidence: [
      {
    ')assessment-phase')Assessment & Planning')Detailed assessment and planning phase,'
'        investment: 'development-phase',)        name : 'Development & Implementation')Core capability development and implementation,'
'        investment: 'deployment-phase',)        name : 'Deployment & Optimization')Production deployment and optimization,'
'        investment: phases.reduce(): void {
      startDate: 'planning-complete',)          name : 'Planning Complete')net_present_value,'
'      timeHorizon:  {
      risks:[],
      overallRiskScore: analysis.roadmap
      ?.initiatives|| [
      {
    ')init-1')Foundation Development')Build foundational capability components,'
'        startDate: [
      {
        metricId : 'adoption-rate')Percentage of intended users actively using the capability,';
        type : 'adoption,'
'        currentValue: 'percentage',)        trend : 'stable,'
'        lastMeasured: 'performance-score',)        name : 'Performance Score')Overall performance score based on key metrics')performance,'
'        currentValue: 'score',)        trend : 'stable,'
'        lastMeasured: new Date(): void {';
    ');)';
        metricId : 'availability')System Availability')Percentage uptime of the technology capability')quality,'
'        currentValue: 'percentage',)        trend : 'stable,'
'        benchmarkValue:  {
      business_capability: 9,
      technology_capability: 7,
      process_capability: 6,
      data_capability: 8,
      security_capability: 8,
      integration_capability: 7,
      platform_capability: 7,
      infrastructure_capability: 6,
      governance_capability: 5,
      innovation_capability: 9,
};
    return categoryWeights[capability.category]|| 5;
}
  private assessRevenueImpact(): void {
        groups[capability.category] = (groups[capability.category]|| 0) + 1;
        return groups;
},
      {} as Record<CapabilityCategory, number>
    );
  private groupCapabilitiesByStatus(): void {
        groups[capability.status] = (groups[capability.status]|| 0) + 1;
        return groups;
},
      {} as Record<CapabilityStatus, number>
    );
  private groupCapabilitiesByMaturity(): void {
        groups[capability.maturityLevel] =
          (groups[capability.maturityLevel]|| 0) + 1;
        return groups;
},
      {} as Record<number, number>
    );
  private calculateAverageMaturity(): void {
    if (capabilities.length === 0) return 0;
    const totalMaturity = capabilities.reduce(): void {
    if (capabilities.length === 0) return 0;
    const totalROI = capabilities.reduce(
      (sum, capability) => sum + capability.investmentPlan.roi.expectedROI,
      0;
    );
    return totalROI / capabilities.length;
}
}
export default CapabilityManagementService;