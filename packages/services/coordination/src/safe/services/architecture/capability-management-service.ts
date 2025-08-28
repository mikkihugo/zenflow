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
import type { Logger} from '@claude-zen/foundation')// =========================================================================== = ';
// CAPABILITY MANAGEMENT INTERFACES
// ============================================================================
/**
 * Architecture Capability with enhanced tracking
 */
export interface ArchitectureCapability {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  maturityLevel: number; // 1-5 scale
  status: CapabilityStatus;
  enablers: string[]; // References to runway items
  dependencies: string[];
  kpis: CapabilityKPI[];
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  stakeholders: string[];
  businessValue: BusinessValueAssessment;
  technicalComplexity: TechnicalComplexityAssessment;
  investmentPlan: InvestmentPlan;
  roadmap: CapabilityRoadmap;
  metrics: CapabilityMetric[]'; 
}
/**
 * Capability categories for organization
 */
export type CapabilityCategory =| business_capability| technology_capability| process_capability| data_capability| security_capability| integration_capability| platform_capability| infrastructure_capability| governance_capability|'innovation_capability')/**';
 * Capability status enumeration
 */
export type CapabilityStatus =| planning| developing| active| optimizing| retiring| deprecated|'suspended')/**';
 * Capability KPI with enhanced tracking
 */
export interface CapabilityKPI {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  trend: KPITrend;
  frequency: MeasurementFrequency;
  threshold: PerformanceThreshold;
  historicalData: HistoricalDataPoint[];
  lastMeasured: Date;
  dataSource: DataSource;
}
/**
 * KPI trend analysis
 */
export type KPITrend =| improving|'improving' | ' stable'|' declining'| declining| volatile|' unknown')/**';
 * Measurement frequency options
 */
export type MeasurementFrequency =| real_time| hourly| daily| weekly| monthly| quarterly|'annually')/**';
 * Performance threshold configuration
 */
export interface PerformanceThreshold {
  readonly excellent: 'accelerating|',improving' | ' stable'| ' declining' | ' decelerating')};;
/**
 * Risk exposure data
 */
export interface RiskExposure {
  readonly category: CapabilityCategory;
  readonly riskScore: number;
  readonly exposureValue: number;
  readonly mitigationCoverage: number; // percentage
  readonly residualRisk: number;
}
// ============================================================================
// CAPABILITY MANAGEMENT SERVICE IMPLEMENTATION
// ============================================================================
/**
 * Capability Management Service - Architecture capability tracking and management
 *
 * Provides comprehensive architecture capability management with AI-powered maturity assessment,
 * capability roadmapping, dependency tracking, and performance monitoring.
 */
export class CapabilityManagementService {
  private readonly logger: false;
  // Capability state
  private capabilities = new Map<string, ArchitectureCapability>();
  private config: {}) {
    this.logger = logger;
    this.config = {
      enableAIAnalysis: 'quarterly,',
'      maxCapabilities: await import('@claude-zen/brain');
      this.brainCoordinator = new BrainCoordinator(
          enabled: await import(';')';
       '@claude-zen/foundation'));
      this.performanceTracker = new PerformanceTracker();
      this.telemetryManager = new TelemetryManager({
        serviceName : 'capability-management,'
'        enableTracing: await import('@claude-zen/workflows');
      this.workflowEngine = new WorkflowEngine(
        maxConcurrentWorkflows: await import('@claude-zen/agui');
      const aguiResult = await AGUISystem({
    ')        aguiType : 'terminal,'
'        taskApprovalConfig: aguiResult.agui;
      // Lazy load @claude-zen/brain for LoadBalancer - resource optimization')      const { LoadBalancer} = await import('@claude-zen/brain');
      this.loadBalancer = new LoadBalancer(';')';
        strategy : 'intelligent_distribution,'
'        enablePredictiveScaling: true;',      this.logger.info(';')';
       'Capability Management Service initialized successfully'));
} catch (error) {
      this.logger.error(';')';
       'Failed to initialize Capability Management Service:,';
        error
      );
      throw error;
}
}
  /**
   * Add architecture capability with AI-powered maturity assessment
   */
  async addCapability(
    capability: this.performanceTracker.startTimer('add_capability');
    try {
    ')      this.logger.info('Adding architecture capability with AI analysis,{';
        name: await this.brainCoordinator.analyzeCapability({
        capability,
        existingCapabilities: this.calculateBusinessValue(
        capability,
        capabilityAnalysis;
      );
      // Calculate technical complexity assessment
      const technicalComplexity = this.calculateTechnicalComplexity(
        capability,
        capabilityAnalysis;
      );
      // Generate investment plan
      const investmentPlan = this.generateInvestmentPlan(
        capability,
        businessValue,
        technicalComplexity;
      );
      // Generate capability roadmap
      const roadmap = this.generateCapabilityRoadmap(
        capability,
        capabilityAnalysis;
      );
      // Generate capability metrics
      const metrics = this.generateCapabilityMetrics(
        capability,
        capabilityAnalysis;
      );
      // Create capability with AI-enhanced data
      const newCapability: {
        id,    `)        businessValue,`;
        technicalComplexity,
        investmentPlan,
        roadmap,
        metrics,
        createdAt: await this.requestInvestmentApproval(newCapability);
        if (!approval.approved) {
          throw new Error(``)`;
            `Capability investment approval rejected: this.performanceTracker.startTimer(')     'update_capability_status)    );`;
    try {
      const capability = this.capabilities.get(capabilityId);
      if (!capability) {
        throw new Error(`Architecture capability not found: ${capabilityId});``)};;
      // Use workflow engine for status transition validation
      const statusTransition =
        await this.workflowEngine.validateStatusTransition({
          fromStatus: {
        ...capability,
        status: this.performanceTracker.startTimer('generate_capability_dashboard');
    try {
      const allCapabilities = Array.from(this.capabilities.values())();
      // Use brain coordinator for intelligent dashboard insights
      const dashboardInsights =
        await this.brainCoordinator.generateCapabilityDashboardInsights({
          capabilities: {
        totalCapabilities: allCapabilities.length,
        capabilitiesByCategory: this.groupCapabilitiesByCategory(allCapabilities),
        capabilitiesByStatus: this.groupCapabilitiesByStatus(allCapabilities),
        capabilitiesByMaturity: this.groupCapabilitiesByMaturity(allCapabilities),
        averageMaturityLevel: this.calculateAverageMaturity(allCapabilities),
        totalInvestment: this.calculateTotalInvestment(allCapabilities),
        portfolioROI: this.calculatePortfolioROI(allCapabilities),
        topPerformingCapabilities: allCapabilities
          .sort(
            (a, b) =>
              b.businessValue.overallValue - a.businessValue.overallValue
          )
          .slice(0, 10),
        investmentAllocation: false;')    this.logger.info('Capability Management Service shutdown complete);
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  private async requestInvestmentApproval(
    capability: await this.aguiService.createApprovalTask({
    `)        taskType:`capability_investment_approval``;
        description,    ')        context: 'approval_system_error};,
}
  private calculateBusinessValue(
    capability: any,
    analysis: any
  ):BusinessValueAssessment {
    // AI-enhanced business value calculation
    const strategicAlignment =;
      analysis.businessValue?.strategicAlignment|| this.assessStrategicAlignment(capability);
    const revenueImpact =;
      analysis.businessValue?.revenueImpact|| this.assessRevenueImpact(capability);
    const costReduction =;
      analysis.businessValue?.costReduction|| this.assessCostReduction(capability);
    const riskMitigation =;
      analysis.businessValue?.riskMitigation|| this.assessRiskMitigation(capability);
    const marketAdvantage =;
      analysis.businessValue?.marketAdvantage|| this.assessMarketAdvantage(capability);
    const customerSatisfaction =;
      analysis.businessValue?.customerSatisfaction|| this.assessCustomerSatisfaction(capability);
    const overallValue =
      (strategicAlignment +
        revenueImpact +
        costReduction +
        riskMitigation +
        marketAdvantage +
        customerSatisfaction) /;
      6;
    return {
      strategicAlignment,
      revenueImpact,
      costReduction,
      riskMitigation,
      marketAdvantage,
      customerSatisfaction,
      overallValue,
      confidence: analysis.businessValue?.confidence|| 0.7,
      lastAssessed: new Date(),
};
}
  private calculateTechnicalComplexity(
    capability: any,
    analysis: any
  ):TechnicalComplexityAssessment {
    // AI-enhanced technical complexity calculation
    const architecturalComplexity =;
      analysis.technicalComplexity?.architecturalComplexity|| this.assessArchitecturalComplexity(capability);
    const integrationComplexity =;
      analysis.technicalComplexity?.integrationComplexity|| this.assessIntegrationComplexity(capability);
    const dataComplexity =;
      analysis.technicalComplexity?.dataComplexity|| this.assessDataComplexity(capability);
    const securityComplexity =;
      analysis.technicalComplexity?.securityComplexity|| this.assessSecurityComplexity(capability);
    const scalabilityRequirements =;
      analysis.technicalComplexity?.scalabilityRequirements|| this.assessScalabilityRequirements(capability);
    const maintenanceOverhead =;
      analysis.technicalComplexity?.maintenanceOverhead|| this.assessMaintenanceOverhead(capability);
    const overallComplexity =
      (architecturalComplexity +
        integrationComplexity +
        dataComplexity +
        securityComplexity +
        scalabilityRequirements +
        maintenanceOverhead) /;
      6;
    return {
      architecturalComplexity,
      integrationComplexity,
      dataComplexity,
      securityComplexity,
      scalabilityRequirements,
      maintenanceOverhead,
      overallComplexity,
      confidence: [
      {
    ')        phaseId : 'assessment-phase')        name : 'Assessment & Planning')        description : 'Detailed assessment and planning phase,'
'        investment: 'development-phase',)        name : 'Development & Implementation')        description : 'Core capability development and implementation,'
'        investment: 'deployment-phase',)        name : 'Deployment & Optimization')        description : 'Production deployment and optimization,'
'        investment: phases.reduce(
      (sum, phase) => sum + phase.investment,
      0;
    );
    const timeline: {
      startDate: 'planning-complete',)          name : 'Planning Complete')          description,          targetDate: {
      method : 'net_present_value,'
'      timeHorizon: {
      risks:[],
      overallRiskScore: analysis.roadmap
      ?.initiatives|| [
      {
    ')        initiativeId : 'init-1')        name : 'Foundation Development')        description : 'Build foundational capability components,'
'        startDate: [
      {
        metricId : 'adoption-rate')        name,        description,         'Percentage of intended users actively using the capability,';
        type : 'adoption,'
'        currentValue: 'percentage',)        trend : 'stable,'
'        lastMeasured: 'performance-score',)        name : 'Performance Score')        description : 'Overall performance score based on key metrics')        type : 'performance,'
'        currentValue: 'score',)        trend : 'stable,'
'        lastMeasured: new Date(),',},';
];
    // Add category-specific metrics')    if (capability.category ==='technology_capability){';
    ')      baseMetrics.push(';')';
        metricId : 'availability')        name : 'System Availability')        description : 'Percentage uptime of the technology capability')        type : 'quality,'
'        currentValue: 'percentage',)        trend : 'stable,'
'        benchmarkValue: {
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
  private assessRevenueImpact(capability: any): number 
    // Revenue impact based on category')    return capability.category ===business_capability')      ? 8';
      :capability.category ==='innovation_capability')        ? 7';
        :4;
  private assessCostReduction(capability: any): number 
    // Cost reduction potential
    return capability.category ==='process_capability')      ? 8';
      :capability.category ==='technology_capability')        ? 6';
        :3;
  private assessRiskMitigation(capability: any): number 
    // Risk mitigation value
    return capability.category ==='security_capability')      ? 9';
      :capability.category ==='governance_capability')        ? 7';
        :4;
  private assessMarketAdvantage(capability: any): number 
    // Market advantage potential
    return capability.category ==='innovation_capability')      ? 9';
      :capability.category ==='business_capability')        ? 7';
        :3;
  private assessCustomerSatisfaction(capability: any): number 
    // Customer satisfaction impact
    return capability.category ==='business_capability'? 8: capability.dependencies?.length|| 0;
    const enablerCount = capability.enablers?.length|| 0;
    return Math.min(10, Math.max(1, (dependencyCount + enablerCount) / 2);
}
  private assessIntegrationComplexity(capability: any): number 
    return capability.category ===integration_capability '? 8: 4')  private assessDataComplexity(capability: any): number ';
    return capability.category ==='data_capability '? 7: 3')  private assessSecurityComplexity(capability: any): number ';
    return capability.category ==='security_capability '? 8: 4')  private assessScalabilityRequirements(capability: any): number ';
    return capability.category ==='platform_capability '? 8: 5')  private assessMaintenanceOverhead(capability: any): number ')    return capability.category ==='infrastructure_capability '? 7: 4')  // Analytics helper methods';
  private groupCapabilitiesByCategory(
    capabilities: ArchitectureCapability[]
  ):Record<CapabilityCategory, number> 
    return capabilities.reduce(
      (groups, capability) => {
        groups[capability.category] = (groups[capability.category]|| 0) + 1;
        return groups;
},
      {} as Record<CapabilityCategory, number>
    );
  private groupCapabilitiesByStatus(
    capabilities: ArchitectureCapability[]
  ):Record<CapabilityStatus, number> 
    return capabilities.reduce(
      (groups, capability) => {
        groups[capability.status] = (groups[capability.status]|| 0) + 1;
        return groups;
},
      {} as Record<CapabilityStatus, number>
    );
  private groupCapabilitiesByMaturity(
    capabilities: ArchitectureCapability[]
  ):Record<number, number> 
    return capabilities.reduce(
      (groups, capability) => {
        groups[capability.maturityLevel] =
          (groups[capability.maturityLevel]|| 0) + 1;
        return groups;
},
      {} as Record<number, number>
    );
  private calculateAverageMaturity(
    capabilities: ArchitectureCapability[]
  ):number {
    if (capabilities.length === 0) return 0;
    const totalMaturity = capabilities.reduce(
      (sum, capability) => sum + capability.maturityLevel,
      0;
    );
    return totalMaturity / capabilities.length;
}
  private calculateTotalInvestment(
    capabilities: ArchitectureCapability[]
  ):number 
    return capabilities.reduce(
      (total, capability) => total + capability.investmentPlan.totalInvestment,
      0
    );
  private calculatePortfolioROI(
    capabilities: ArchitectureCapability[]
  ):number {
    if (capabilities.length === 0) return 0;
    const totalROI = capabilities.reduce(
      (sum, capability) => sum + capability.investmentPlan.roi.expectedROI,
      0;
    );
    return totalROI / capabilities.length;
}
}
export default CapabilityManagementService;
;