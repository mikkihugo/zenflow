/**
 * @fileoverview Quality Gate Service - Automated quality gates and criteria management.
 *
 * Provides specialized quality gate management with automated criteria evaluation,
 * intelligent scoring, performance optimization, and comprehensive reporting for continuous delivery.
 *
 * Integrates with: * - @claude-zen/ai-safety: Safety protocols for quality validation
 * - @claude-zen/brain: BrainCoordinator for intelligent gate optimization
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/agui: Human-in-loop approvals for critical quality decisions
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger} from '../../types')// Re-export types from SPARC-CD mapping service';
export type {
  CriterionResult,
  EscalationRule,
  NotificationRule,
  QualityGate,
  QualityGateCriterion,
  QualityGateResult,
  QualityGateType,
} from './sparc-cd-mapping-service')// =========================================================================== = ';
// QUALITY GATE SERVICE INTERFACES
// ============================================================================
/**
 * Quality gate execution configuration
 */
export interface QualityGateExecutionConfig {
  readonly gateId: string;
  readonly pipelineId: string;
  readonly stageId: string;
  readonly context: QualityGateContext;
  readonly timeout: number;
  readonly retryPolicy: GateRetryPolicy;
  readonly escalationEnabled: boolean;
  readonly notificationEnabled: boolean;
}
/**
 * Quality gate context for execution
 */
export interface QualityGateContext {
  readonly projectId: string'; 
  readonly environment : 'development' | ' staging'|' production')  readonly artifacts: QualityArtifact[];;
  readonly metadata: Record<string, unknown>;
  readonly previousResults?:QualityGateResult[];
  readonly historicalData?:QualityHistoricalData;
}
/**
 * Quality artifact for evaluation
 */
export interface QualityArtifact {
  readonly id: string;
  readonly type: | code| binary| test_results| security_scan|'documentation')  readonly location: string;;
  readonly size: number;
  readonly checksum: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
}
/**
 * Historical quality data
 */
export interface QualityHistoricalData {
  readonly previousScores: number[];
  readonly trends: QualityTrend[];
  readonly benchmarks: QualityBenchmark[];
  readonly improvements: QualityImprovement[];
}
/**
 * Quality trend analysis
 */
export interface QualityTrend {
  readonly metric: string;
  readonly direction : 'improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' degrading')  readonly change: number;;
  readonly period: string;
  readonly confidence: number;
}
/**
 * Quality benchmark
 */
export interface QualityBenchmark {
  readonly metric: string;
  readonly industryAverage: number;
  readonly bestPractice: number;
  readonly organizationAverage: number;
  readonly currentValue: number;
}
/**
 * Quality improvement suggestion
 */
export interface QualityImprovement {
  readonly area: string;
  readonly suggestion: string;
  readonly impact : 'low' | ' medium'|' high')  readonly effort : 'low' | ' medium'|' high')  readonly priority: number;;
}
/**
 * Gate retry policy
 */
export interface GateRetryPolicy {
  readonly enabled: boolean;
  readonly maxAttempts: number;
  readonly backoffStrategy : 'linear' | ' exponential'|' fixed')  readonly baseDelay: number;;
  readonly maxDelay: number;
  readonly retryableFailures: string[];
}
/**
 * Quality gate templates for different scenarios
 */
export interface QualityGateTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly applicableStages: string[];
  readonly defaultCriteria: QualityGateCriterion[];
  readonly recommendedTimeout: number;
  readonly category: | security| performance| quality| compliance|'architecture')};;
/**
 * Quality gate optimization result
 */
export interface QualityGateOptimization {
  readonly gateId: string;
  readonly originalScore: number;
  readonly optimizedScore: number;
  readonly improvements: string[];
  readonly adjustedCriteria: QualityGateCriterion[];
  readonly recommendedActions: string[];
  readonly confidence: number;
}
// Re-import types from mapping service
import type {
  QualityGate,
  QualityGateCriterion,
  QualityGateResult,
} from './sparc-cd-mapping-service')// =========================================================================== = ';
// QUALITY GATE SERVICE IMPLEMENTATION
// ============================================================================
/**
 * Quality Gate Service - Automated quality gates and criteria management
 *
 * Provides comprehensive quality gate management with automated criteria evaluation,
 * intelligent scoring, AI-powered optimization, and human-in-loop approvals for critical decisions.
 */
export class QualityGateService {
  private readonly logger: false;
  // Quality gate state
  private qualityGateTemplates = new Map<string, QualityGate>();
  private executionHistory = new Map<string, QualityGateResult[]>();
  constructor(logger: logger;
}
  /**
   * Initialize service with lazy-loaded dependencies
   */
  async initialize(Promise<void> {
    if (this.initialized) return'; 
    try {
      // Lazy load @claude-zen/ai-safety for safety protocols
      const { AISafetyOrchestrator} = await import('@claude-zen/ai-safety');
      this.aiSafetyManager = new AISafetyOrchestrator();
      await this.aiSafetyManager.initialize();
      // Lazy load @claude-zen/brain for LoadBalancer - intelligent optimization')      const { BrainCoordinator} = await import('@claude-zen/brain');
      this.brainCoordinator = new BrainCoordinator(
          enabled: await import('@claude-zen/foundation');
      this.performanceTracker = new PerformanceTracker();
      // Lazy load @claude-zen/agui for human approvals')      const { AGUISystem} = await import('@claude-zen/agui');
      const aguiResult = await AGUISystem({
    ')        aguiType : 'terminal,'
'        taskApprovalConfig: aguiResult.agui;
      // Initialize default quality gate templates
      await this.initializeQualityGateTemplates();
      this.initialized = true;')      this.logger.info('Quality Gate Service initialized successfully');
} catch (error) {
    ')      this.logger.error('Failed to initialize Quality Gate Service:, error');
      throw error;
}
}
  /**
   * Create automated quality gates with AI optimization
   */
  async createAutomatedQualityGates(Promise<Map<string, QualityGate>> {
    if (!this.initialized) await this.initialize();')    const __timer = this.performanceTracker.startTimer('create_quality_gates');
    try {
    ')      this.logger.info('Creating automated quality gates with AI optimization');
      const qualityGates = new Map<string, QualityGate>();
      // Use brain coordinator for intelligent gate configuration
      const gateOptimization = await this.brainCoordinator.optimizeQualityGates(
        {
    ')          context,          requirements: [')           'security,';
           'performance,')           'reliability,';
           'maintainability,';
],
          historicalData: Array.from(this.executionHistory.values()).flat(),
}
      );
      // Create optimized quality gates
      const codeQualityGate =;
        await this.createCodeQualityGate(gateOptimization);
      qualityGates.set(codeQualityGate.id, codeQualityGate);
      const testCoverageGate =;
        await this.createTestCoverageGate(gateOptimization);
      qualityGates.set(testCoverageGate.id, testCoverageGate);
      const securityGate = await this.createSecurityGate(gateOptimization);
      qualityGates.set(securityGate.id, securityGate);
      const performanceGate =;
        await this.createPerformanceGate(gateOptimization);
      qualityGates.set(performanceGate.id, performanceGate);
      const architectureGate =;
        await this.createArchitectureComplianceGate(gateOptimization);
      qualityGates.set(architectureGate.id, architectureGate);
      const businessValidationGate =;
        await this.createBusinessValidationGate(gateOptimization);
      qualityGates.set(businessValidationGate.id, businessValidationGate);
      // Store in templates for reuse
      this.qualityGateTemplates = qualityGates;')      this.performanceTracker.endTimer('create_quality_gates');')      this.logger.info('Automated quality gates created with AI optimization,';
        gateCount: this.performanceTracker.startTimer('execute_quality_gate');";"
    try {
      const gate = this.qualityGateTemplates.get(config.gateId);
      if (!gate) {
        throw new Error("Quality gate not found: "${config.gateId})"")};)      this.logger.info('Executing quality gate with AI evaluation,{';"
        gateId: config.gateId,
        pipelineId: config.pipelineId,
        stageId: config.stageId,
        criteriaCount: gate.criteria.length,')';
});
      // AI safety validation before execution
      const safetyValidation =
        await this.aiSafetyManager.validateQualityGateExecution({
          gate,
          config,
          context: await this.aguiService.createApprovalTask({
          taskType: Date.now();
      const criterionResults: [];
      let totalScore = 0;
      let totalWeight = 0;
      // Execute each criterion with AI enhancement
      for (const criterion of gate.criteria) {
        const result = await this.executeCriterionWithAI(
          criterion,
          config.pipelineId,
          config.context;
        );
        criterionResults.push(result);
        totalScore += result.contribution;
        totalWeight += result.weight;
}
      // Calculate final score with AI adjustment
      let finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100: await this.brainCoordinator.adjustQualityScore({
        originalScore: scoreAdjustment.adjustedScore|| finalScore;
      // Determine status with AI-powered decision making
      const status = this.determineGateStatus(
        finalScore,
        criterionResults,
        gate,
        scoreAdjustment;
      );
      // Generate AI-powered recommendations
      const recommendations = await this.generateIntelligentRecommendations(
        criterionResults,
        config.context,
        scoreAdjustment;
      );
      const result:  {
        gateId: this.executionHistory.get(config.gateId)|| [];
      history.push(result);
      this.executionHistory.set(config.gateId, history.slice(-50)); // Keep last 50 results
      // Handle escalation if needed')      if (status ===fail '&& gate.escalation.length > 0) {';
        this.handleGateEscalation(gate, result, config);
}
      // Send notifications if configured
      if (gate.notifications.length > 0) {
        this.sendGateNotifications(gate, result, config);')};)      this.performanceTracker.endTimer('execute_quality_gate');')      this.logger.info('Quality gate executed with AI enhancement,{';
        gateId: this.performanceTracker.startTimer('optimize_quality_gate);
    try {
      const gate = this.qualityGateTemplates.get(gateId);
      if (!gate) " + JSON.stringify({
    `)        throw new Error("Quality gate not found: this.executionHistory.get(gateId)|| [];)      this.logger.info('Optimizing quality gate with AI analysis,{';"
        gateId,
        historyCount: await this.brainCoordinator.optimizeQualityGate({
        gate,
        executionHistory:  {
        gateId,
        originalScore: this.calculateAverageScore(history),
        optimizedScore: optimization.expectedScore|| 0,
        improvements: optimization.improvements|| [],
        adjustedCriteria: optimization.optimizedCriteria|| gate.criteria,
        recommendedActions: optimization.actions|| [],
        confidence: optimization.confidence|| 0.8,
}) + ";
      // Cache the optimization result
      this.optimizationCache.set(gateId, result);
      this.performanceTracker.endTimer('optimize_quality_gate');')      this.logger.info('Quality gate optimization completed,{';
        gateId,
        improvementScore: result.optimizedScore - result.originalScore,
        confidence: result.confidence,')';
});
      return result;
} catch (error) {
    ')      this.performanceTracker.endTimer('optimize_quality_gate');')      this.logger.error('Quality gate optimization failed:, error');
      throw error;
}
}
  /**
   * Get quality gate template with intelligent recommendations
   */
  async getQualityGateTemplate(Promise<QualityGate| null> {
    if (!this.initialized) await this.initialize();
    // Find matching template
    for (const [id, gate] of this.qualityGateTemplates) {
      if (gate.type === gateType) {
        // Apply any cached optimizations
        const optimization = this.optimizationCache.get(id);
        if (optimization && optimization.confidence > 0.7) {
          return {
            ...gate,
            criteria: optimization.adjustedCriteria,
};
}
        return gate;
}
};)    this.logger.warn('Quality gate template not found,{ gateType};);
    return null;
}
  /**
   * Get quality insights and analytics
   */')  async getQualityInsights(this.performanceTracker.startTimer('quality_insights');
    try {
      // Aggregate execution history
      const allResults = Array.from(this.executionHistory.values()).flat();
      // Use brain coordinator for intelligent analysis
      const insights = await this.brainCoordinator.analyzeQualityInsights({
        executionHistory:  {
        overallQuality: false;')    this.logger.info('Quality Gate Service shutdown complete');
}
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  private async initializeQualityGateTemplates(Promise<void> {
    // Initialize with basic templates - will be optimized by AI
    await this.createAutomatedQualityGates();
}
  private createCodeQualityGate(optimization: [
      {
    ')        metric : 'code_coverage')        operator : 'gte'as const,';
        threshold: 'complexity_score',)        operator : 'lte'as const,';
        threshold: 'maintainability_index',)        operator : 'gte'as const,';
        threshold: 'code-quality-gate',)      name : 'Code Quality Gate')      type : 'code_quality 'as QualityGateType,';
      criteria: 'critical_failure',)          escalateTo:['tech-lead,' quality-engineer'],';
          delay: 'gate_fail',)          channels:['slack,' email'],';
          recipients: 'test-coverage-gate',)      name : 'Test Coverage Gate')      type : 'test_coverage 'as QualityGateType,';
      criteria: 'line_coverage',)          operator : 'gte'as const,';
          threshold: 'branch_coverage',)          operator : 'gte'as const,';
          threshold: 'mutation_coverage',)          operator : 'gte'as const,';
          threshold: 'security-gate',)      name : 'Security Gate')      type : 'security_scan 'as QualityGateType,';
      criteria: 'critical_vulnerabilities',)          operator : 'eq 'as const,';
          threshold: 'high_vulnerabilities',)          operator : 'lte'as const,';
          threshold: 'security_critical',)          escalateTo:['security-team,' tech-lead'],';
          delay: 'gate_fail',)          channels:['slack,' pagerduty'],';
          recipients: 'performance-gate',)      name : 'Performance Gate')      type : 'performance 'as QualityGateType,';
      criteria: 'response_time_p95',)          operator : 'lte'as const,';
          threshold: 'throughput',)          operator : 'gte'as const,';
          threshold: 'error_rate',)          operator : 'lte'as const,';
          threshold: 'architecture-compliance-gate',)      name : 'Architecture Compliance Gate')      type : 'architecture 'as QualityGateType,';
      criteria: 'architecture_compliance_score',)          operator : 'gte'as const,';
          threshold: 'business-validation-gate',)      name : 'Business Validation Gate')      type : 'business_validation 'as QualityGateType,';
      criteria: 'acceptance_criteria_coverage',)          operator : 'gte 'as const,';
          threshold: 'stakeholder_approval',)          operator : 'eq 'as const,';
          threshold: 'approval_timeout',)          escalateTo:['product-owner,' business-stakeholder'],';
          delay: 'approval_required',)          channels:['email,' slack'],';
          recipients: await this.measureCriterion(
      criterion,
      pipelineId,
      context;
    );
    const passed = this.evaluateCriterion(criterion, actualValue);
    const contribution = passed ? criterion.weight: await this.brainCoordinator.measureQualityCriterion({
      criterion,
      pipelineId,
      context,
      artifacts: ';
        return actualValue > criterion.threshold;
      case',gte : ';
        return actualValue >= criterion.threshold;
      case'lt : ';
        return actualValue < criterion.threshold;
      case'lte : ';
        return actualValue <= criterion.threshold;
      case'eq : ';
        return actualValue === criterion.threshold;
      case'neq  = ';
        return actualValue !== criterion.threshold;
      default: criterionResults.filter(
      (r) =>
        !r.passed && gate.criteria.find((c) => c.metric === r.metric)?.critical;
    )'; 
    if (criticalFailures.length > 0) {
      return'fail')};;
    if (finalScore < 70) {
      return'warning')};;
    returnpass")};;"
  private generateGateResultMessage(
    status: criterionResults.filter((r) => !r.passed).length;
    return "Quality gate ${s}tatuswith score ${M}ath.round(score)% (${c}riticalFailuresfailed criteria)`")};;"
  private async generateIntelligentRecommendations(Promise<string[]> {
    // Use brain coordinator for intelligent recommendations
    const recommendations =
      await this.brainCoordinator.generateQualityRecommendations({
        criterionResults,
        context,
        scoreAdjustment,
});
    return (
      recommendations.recommendations|| ['Review failed criteria and implement improvements,')       'Consider updating thresholds based on project context,';
       'Analyze trends to identify systematic issues,';
]
    );
}
  private handleGateEscalation(
    gate: QualityGate,
    result: QualityGateResult,
    config: QualityGateExecutionConfig
  ): void {
    ')    // Handle escalation logic - could integrate with AGUI for approvals')    this.logger.info('Handling quality gate escalation,{';
      gateId: gate.id,
      escalationCount: gate.escalation.length,')';
});
}
  private sendGateNotifications(
    gate: QualityGate,
    result: QualityGateResult,
    config: QualityGateExecutionConfig
  ): void {
    // Handle notification logic
    this.logger.info('Sending quality gate notifications,{';
      gateId: gate.id,
      notificationCount: gate.notifications.length,')';
});
}
  private calculateAverageScore(history: QualityGateResult[]): number {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, result) => acc + result.score, 0);
    return sum / history.length;
}
  private calculateOverallQuality(results: QualityGateResult[]): number {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, result) => acc + result.score, 0);
    return sum / results.length;
}
  private calculateGatePerformance():Record<string, number> {
    const performance:  {};
    for (const [gateId, history] of this.executionHistory) {
      performance[gateId] = this.calculateAverageScore(history);
}
    return performance;
};)};;
export default QualityGateService;
)";"