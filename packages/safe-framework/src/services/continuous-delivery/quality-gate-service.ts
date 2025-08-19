/**
 * @fileoverview Quality Gate Service - Automated quality gates and criteria management.
 * 
 * Provides specialized quality gate management with automated criteria evaluation,
 * intelligent scoring, performance optimization, and comprehensive reporting for continuous delivery.
 * 
 * Integrates with:
 * - @claude-zen/ai-safety: Safety protocols for quality validation
 * - @claude-zen/brain: BrainCoordinator for intelligent gate optimization  
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/agui: Human-in-loop approvals for critical quality decisions
 * 
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import type { Logger } from '../../types';

// Re-export types from SPARC-CD mapping service
export type {
  QualityGate,
  QualityGateType,
  QualityGateCriterion,
  QualityGateResult,
  CriterionResult,
  EscalationRule,
  NotificationRule
} from './sparc-cd-mapping-service';

// ============================================================================
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
  readonly projectId: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly artifacts: QualityArtifact[];
  readonly metadata: Record<string, unknown>;
  readonly previousResults?: QualityGateResult[];
  readonly historicalData?: QualityHistoricalData;
}

/**
 * Quality artifact for evaluation
 */
export interface QualityArtifact {
  readonly id: string;
  readonly type: 'code' | 'binary' | 'test_results' | 'security_scan' | 'documentation';
  readonly location: string;
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
  readonly direction: 'improving' | 'stable' | 'degrading';
  readonly change: number;
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
  readonly impact: 'low' | 'medium' | 'high';
  readonly effort: 'low' | 'medium' | 'high';
  readonly priority: number;
}

/**
 * Gate retry policy
 */
export interface GateRetryPolicy {
  readonly enabled: boolean;
  readonly maxAttempts: number;
  readonly backoffStrategy: 'linear' | 'exponential' | 'fixed';
  readonly baseDelay: number;
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
  readonly category: 'security' | 'performance' | 'quality' | 'compliance' | 'architecture';
}

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
  QualityGateType,
  QualityGateCriterion,
  QualityGateResult,
  CriterionResult,
  EscalationRule,
  NotificationRule
} from './sparc-cd-mapping-service';

// ============================================================================
// QUALITY GATE SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Quality Gate Service - Automated quality gates and criteria management
 * 
 * Provides comprehensive quality gate management with automated criteria evaluation,
 * intelligent scoring, AI-powered optimization, and human-in-loop approvals for critical decisions.
 */
export class QualityGateService {
  private readonly logger: Logger;
  private aiSafetyManager?: any;
  private brainCoordinator?: any;
  private performanceTracker?: any;
  private aguiService?: any;
  private initialized = false;

  // Quality gate state
  private qualityGateTemplates = new Map<string, QualityGate>();
  private executionHistory = new Map<string, QualityGateResult[]>();
  private optimizationCache = new Map<string, QualityGateOptimization>();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Initialize service with lazy-loaded dependencies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Lazy load @claude-zen/ai-safety for safety protocols
      const { AIManager } = await import('@claude-zen/ai-safety');
      this.aiSafetyManager = new AIManager({
        safetyLevel: 'strict',
        enableDeceptionDetection: true,
        enableBehaviorAnalysis: true
      });
      await this.aiSafetyManager.initialize();

      // Lazy load @claude-zen/brain for intelligent optimization
      const { BrainCoordinator } = await import('@claude-zen/brain');
      this.brainCoordinator = new BrainCoordinator({
        autonomous: { enabled: true, learningRate: 0.1, adaptationThreshold: 0.7 }
      });
      await this.brainCoordinator.initialize();

      // Lazy load @claude-zen/foundation for performance tracking
      const { PerformanceTracker } = await import('@claude-zen/foundation/telemetry');
      this.performanceTracker = new PerformanceTracker();

      // Lazy load @claude-zen/agui for human approvals
      const { AGUIService } = await import('@claude-zen/agui');
      this.aguiService = new AGUIService({
        enableTaskApproval: true,
        enableRealTimeCollaboration: true,
        defaultTimeout: 1800000 // 30 minutes
      });
      await this.aguiService.initialize();

      // Initialize default quality gate templates
      await this.initializeQualityGateTemplates();

      this.initialized = true;
      this.logger.info('Quality Gate Service initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Quality Gate Service:', error);
      throw error;
    }
  }

  /**
   * Create automated quality gates with AI optimization
   */
  async createAutomatedQualityGates(): Promise<Map<string, QualityGate>> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('create_quality_gates');

    try {
      this.logger.info('Creating automated quality gates with AI optimization');

      const qualityGates = new Map<string, QualityGate>();

      // Use brain coordinator for intelligent gate configuration
      const gateOptimization = await this.brainCoordinator.optimizeQualityGates({
        context: 'automated_cd_pipeline',
        requirements: ['security', 'performance', 'reliability', 'maintainability'],
        historicalData: Array.from(this.executionHistory.values()).flat()
      });

      // Create optimized quality gates
      const codeQualityGate = await this.createCodeQualityGate(gateOptimization);
      qualityGates.set(codeQualityGate.id, codeQualityGate);

      const testCoverageGate = await this.createTestCoverageGate(gateOptimization);
      qualityGates.set(testCoverageGate.id, testCoverageGate);

      const securityGate = await this.createSecurityGate(gateOptimization);
      qualityGates.set(securityGate.id, securityGate);

      const performanceGate = await this.createPerformanceGate(gateOptimization);
      qualityGates.set(performanceGate.id, performanceGate);

      const architectureGate = await this.createArchitectureComplianceGate(gateOptimization);
      qualityGates.set(architectureGate.id, architectureGate);

      const businessValidationGate = await this.createBusinessValidationGate(gateOptimization);
      qualityGates.set(businessValidationGate.id, businessValidationGate);

      // Store in templates for reuse
      this.qualityGateTemplates = qualityGates;

      this.performanceTracker.endTimer('create_quality_gates');

      this.logger.info('Automated quality gates created with AI optimization', {
        gateCount: qualityGates.size,
        optimizationScore: gateOptimization.overallScore || 0.8,
        aiSafetyEnabled: !!this.aiSafetyManager
      });

      return qualityGates;

    } catch (error) {
      this.performanceTracker.endTimer('create_quality_gates');
      this.logger.error('Failed to create automated quality gates:', error);
      throw error;
    }
  }

  /**
   * Execute quality gate with AI-powered evaluation and safety validation
   */
  async executeQualityGate(
    config: QualityGateExecutionConfig
  ): Promise<QualityGateResult> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('execute_quality_gate');

    try {
      const gate = this.qualityGateTemplates.get(config.gateId);
      if (!gate) {
        throw new Error(`Quality gate not found: ${config.gateId}`);
      }

      this.logger.info('Executing quality gate with AI evaluation', {
        gateId: config.gateId,
        pipelineId: config.pipelineId,
        stageId: config.stageId,
        criteriaCount: gate.criteria.length
      });

      // AI safety validation before execution
      const safetyValidation = await this.aiSafetyManager.validateQualityGateExecution({
        gate,
        config,
        context: config.context
      });

      if (!safetyValidation.safe) {
        this.logger.warn('Quality gate execution blocked by AI safety:', {
          gateId: config.gateId,
          safetyReasons: safetyValidation.reasons
        });
        
        // Create AGUI gate for manual review
        const manualReview = await this.aguiService.createApprovalTask({
          taskType: 'quality_gate_safety_review',
          description: `Quality gate ${gate.name} requires manual safety review`,
          context: { config, safetyReasons: safetyValidation.reasons },
          approvers: ['security-team', 'quality-lead'],
          timeout: 1800000 // 30 minutes
        });

        if (!manualReview.approved) {
          throw new Error(`Quality gate execution rejected: ${manualReview.reason}`);
        }
      }

      const startTime = Date.now();
      const criterionResults: CriterionResult[] = [];
      let totalScore = 0;
      let totalWeight = 0;

      // Execute each criterion with AI enhancement
      for (const criterion of gate.criteria) {
        const result = await this.executeCriterionWithAI(
          criterion,
          config.pipelineId,
          config.context
        );
        criterionResults.push(result);

        totalScore += result.contribution;
        totalWeight += result.weight;
      }

      // Calculate final score with AI adjustment
      let finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
      
      // Apply brain coordinator intelligence for score adjustment
      const scoreAdjustment = await this.brainCoordinator.adjustQualityScore({
        originalScore: finalScore,
        criterionResults,
        historicalData: this.executionHistory.get(config.gateId) || [],
        context: config.context
      });

      finalScore = scoreAdjustment.adjustedScore || finalScore;

      // Determine status with AI-powered decision making
      const status = this.determineGateStatus(
        finalScore,
        criterionResults,
        gate,
        scoreAdjustment
      );

      // Generate AI-powered recommendations
      const recommendations = await this.generateIntelligentRecommendations(
        criterionResults,
        config.context,
        scoreAdjustment
      );

      const result: QualityGateResult = {
        gateId: config.gateId,
        status,
        score: finalScore,
        criterionResults,
        executionTime: Date.now() - startTime,
        message: this.generateGateResultMessage(status, finalScore, criterionResults),
        recommendations,
        timestamp: new Date(),
      };

      // Store execution history for learning
      const history = this.executionHistory.get(config.gateId) || [];
      history.push(result);
      this.executionHistory.set(config.gateId, history.slice(-50)); // Keep last 50 results

      // Handle escalation if needed
      if (status === 'fail' && gate.escalation.length > 0) {
        this.handleGateEscalation(gate, result, config);
      }

      // Send notifications if configured
      if (gate.notifications.length > 0) {
        this.sendGateNotifications(gate, result, config);
      }

      this.performanceTracker.endTimer('execute_quality_gate');

      this.logger.info('Quality gate executed with AI enhancement', {
        gateId: config.gateId,
        status,
        score: finalScore,
        executionTime: result.executionTime,
        aiAdjustment: scoreAdjustment.adjustment || 0
      });

      return result;

    } catch (error) {
      this.performanceTracker.endTimer('execute_quality_gate');
      this.logger.error('Quality gate execution failed:', error);
      throw error;
    }
  }

  /**
   * Optimize quality gate based on execution history and AI analysis
   */
  async optimizeQualityGate(gateId: string): Promise<QualityGateOptimization> {
    if (!this.initialized) await this.initialize();

    // Check cache first
    if (this.optimizationCache.has(gateId)) {
      return this.optimizationCache.get(gateId)!;
    }

    const timer = this.performanceTracker.startTimer('optimize_quality_gate');

    try {
      const gate = this.qualityGateTemplates.get(gateId);
      if (!gate) {
        throw new Error(`Quality gate not found: ${gateId}`);
      }

      const history = this.executionHistory.get(gateId) || [];
      
      this.logger.info('Optimizing quality gate with AI analysis', {
        gateId,
        historyCount: history.length
      });

      // Use brain coordinator for intelligent optimization
      const optimization = await this.brainCoordinator.optimizeQualityGate({
        gate,
        executionHistory: history,
        optimizationGoals: ['improve_accuracy', 'reduce_false_positives', 'enhance_reliability']
      });

      const result: QualityGateOptimization = {
        gateId,
        originalScore: this.calculateAverageScore(history),
        optimizedScore: optimization.expectedScore || 0,
        improvements: optimization.improvements || [],
        adjustedCriteria: optimization.optimizedCriteria || gate.criteria,
        recommendedActions: optimization.actions || [],
        confidence: optimization.confidence || 0.8
      };

      // Cache the optimization result
      this.optimizationCache.set(gateId, result);

      this.performanceTracker.endTimer('optimize_quality_gate');

      this.logger.info('Quality gate optimization completed', {
        gateId,
        improvementScore: result.optimizedScore - result.originalScore,
        confidence: result.confidence
      });

      return result;

    } catch (error) {
      this.performanceTracker.endTimer('optimize_quality_gate');
      this.logger.error('Quality gate optimization failed:', error);
      throw error;
    }
  }

  /**
   * Get quality gate template with intelligent recommendations
   */
  async getQualityGateTemplate(gateType: QualityGateType): Promise<QualityGate | null> {
    if (!this.initialized) await this.initialize();

    // Find matching template
    for (const [id, gate] of this.qualityGateTemplates) {
      if (gate.type === gateType) {
        // Apply any cached optimizations
        const optimization = this.optimizationCache.get(id);
        if (optimization && optimization.confidence > 0.7) {
          return {
            ...gate,
            criteria: optimization.adjustedCriteria
          };
        }
        return gate;
      }
    }

    this.logger.warn('Quality gate template not found', { gateType });
    return null;
  }

  /**
   * Get quality insights and analytics
   */
  async getQualityInsights(timeframe: string = '30d'): Promise<{
    overallQuality: number;
    trendAnalysis: QualityTrend[];
    topIssues: string[];
    recommendations: QualityImprovement[];
    gatePerformance: Record<string, number>;
  }> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('quality_insights');

    try {
      // Aggregate execution history
      const allResults = Array.from(this.executionHistory.values()).flat();
      
      // Use brain coordinator for intelligent analysis
      const insights = await this.brainCoordinator.analyzeQualityInsights({
        executionHistory: allResults,
        timeframe,
        analysisDepth: 'comprehensive'
      });

      const result = {
        overallQuality: insights.overallQuality || this.calculateOverallQuality(allResults),
        trendAnalysis: insights.trends || [],
        topIssues: insights.issues || [],
        recommendations: insights.recommendations || [],
        gatePerformance: insights.gatePerformance || this.calculateGatePerformance()
      };

      this.performanceTracker.endTimer('quality_insights');

      this.logger.info('Quality insights generated', {
        overallQuality: result.overallQuality,
        trendCount: result.trendAnalysis.length,
        recommendationCount: result.recommendations.length
      });

      return result;

    } catch (error) {
      this.performanceTracker.endTimer('quality_insights');
      this.logger.error('Failed to generate quality insights:', error);
      throw error;
    }
  }

  /**
   * Shutdown service gracefully
   */
  async shutdown(): Promise<void> {
    if (this.aiSafetyManager?.shutdown) {
      await this.aiSafetyManager.shutdown();
    }
    if (this.brainCoordinator?.shutdown) {
      await this.brainCoordinator.shutdown();
    }
    if (this.aguiService?.shutdown) {
      await this.aguiService.shutdown();
    }
    this.initialized = false;
    this.logger.info('Quality Gate Service shutdown complete');
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async initializeQualityGateTemplates(): Promise<void> {
    // Initialize with basic templates - will be optimized by AI
    await this.createAutomatedQualityGates();
  }

  private createCodeQualityGate(optimization: any): QualityGate {
    const baseCriteria = [
      {
        metric: 'code_coverage',
        operator: 'gte' as const,
        threshold: optimization.codeQualityThresholds?.coverage || 80,
        weight: 0.3,
        critical: true,
        description: 'Code coverage must meet minimum threshold'
      },
      {
        metric: 'complexity_score',
        operator: 'lte' as const,
        threshold: optimization.codeQualityThresholds?.complexity || 7.0,
        weight: 0.3,
        critical: false,
        description: 'Cyclomatic complexity should be manageable'
      },
      {
        metric: 'maintainability_index',
        operator: 'gte' as const,
        threshold: optimization.codeQualityThresholds?.maintainability || 60,
        weight: 0.4,
        critical: false,
        description: 'Code maintainability should be acceptable'
      }
    ];

    return {
      id: 'code-quality-gate',
      name: 'Code Quality Gate',
      type: 'code_quality' as QualityGateType,
      criteria: baseCriteria,
      automated: true,
      blocking: true,
      timeout: 600000, // 10 minutes
      escalation: [{
        condition: 'critical_failure',
        escalateTo: ['tech-lead', 'quality-engineer'],
        delay: 300000, // 5 minutes
        maxEscalations: 3
      }],
      notifications: [{
        trigger: 'gate_fail',
        channels: ['slack', 'email'],
        recipients: ['development-team'],
        template: 'code_quality_failure'
      }]
    };
  }

  private createTestCoverageGate(optimization: any): QualityGate {
    return {
      id: 'test-coverage-gate',
      name: 'Test Coverage Gate',
      type: 'test_coverage' as QualityGateType,
      criteria: [
        {
          metric: 'line_coverage',
          operator: 'gte' as const,
          threshold: optimization.testThresholds?.lineCoverage || 85,
          weight: 0.4,
          critical: true,
          description: 'Line coverage must meet minimum threshold'
        },
        {
          metric: 'branch_coverage',
          operator: 'gte' as const,
          threshold: optimization.testThresholds?.branchCoverage || 80,
          weight: 0.4,
          critical: true,
          description: 'Branch coverage must be comprehensive'
        },
        {
          metric: 'mutation_coverage',
          operator: 'gte' as const,
          threshold: optimization.testThresholds?.mutationCoverage || 70,
          weight: 0.2,
          critical: false,
          description: 'Mutation testing should validate test quality'
        }
      ],
      automated: true,
      blocking: true,
      timeout: 900000, // 15 minutes
      escalation: [],
      notifications: []
    };
  }

  private createSecurityGate(optimization: any): QualityGate {
    return {
      id: 'security-gate',
      name: 'Security Gate',
      type: 'security_scan' as QualityGateType,
      criteria: [
        {
          metric: 'critical_vulnerabilities',
          operator: 'eq' as const,
          threshold: 0,
          weight: 1.0,
          critical: true,
          description: 'No critical security vulnerabilities allowed'
        },
        {
          metric: 'high_vulnerabilities',
          operator: 'lte' as const,
          threshold: optimization.securityThresholds?.highVulns || 2,
          weight: 0.8,
          critical: true,
          description: 'Limited high-severity vulnerabilities allowed'
        }
      ],
      automated: true,
      blocking: true,
      timeout: 1200000, // 20 minutes
      escalation: [{
        condition: 'security_critical',
        escalateTo: ['security-team', 'tech-lead'],
        delay: 0, // Immediate escalation
        maxEscalations: 1
      }],
      notifications: [{
        trigger: 'gate_fail',
        channels: ['slack', 'pagerduty'],
        recipients: ['security-team', 'development-team'],
        template: 'security_failure_alert'
      }]
    };
  }

  private createPerformanceGate(optimization: any): QualityGate {
    return {
      id: 'performance-gate',
      name: 'Performance Gate',
      type: 'performance' as QualityGateType,
      criteria: [
        {
          metric: 'response_time_p95',
          operator: 'lte' as const,
          threshold: optimization.performanceThresholds?.responseTime || 500,
          weight: 0.4,
          critical: false,
          description: '95th percentile response time should be under threshold'
        },
        {
          metric: 'throughput',
          operator: 'gte' as const,
          threshold: optimization.performanceThresholds?.throughput || 1000,
          weight: 0.3,
          critical: false,
          description: 'System throughput should meet requirements'
        },
        {
          metric: 'error_rate',
          operator: 'lte' as const,
          threshold: optimization.performanceThresholds?.errorRate || 1.0,
          weight: 0.3,
          critical: true,
          description: 'Error rate should be within acceptable limits'
        }
      ],
      automated: true,
      blocking: false,
      timeout: 600000, // 10 minutes
      escalation: [],
      notifications: []
    };
  }

  private createArchitectureComplianceGate(optimization: any): QualityGate {
    return {
      id: 'architecture-compliance-gate',
      name: 'Architecture Compliance Gate',
      type: 'architecture' as QualityGateType,
      criteria: [
        {
          metric: 'architecture_compliance_score',
          operator: 'gte' as const,
          threshold: optimization.architectureThresholds?.compliance || 90,
          weight: 1.0,
          critical: false,
          description: 'Architecture must comply with established patterns'
        }
      ],
      automated: true,
      blocking: false,
      timeout: 300000, // 5 minutes
      escalation: [],
      notifications: []
    };
  }

  private createBusinessValidationGate(optimization: any): QualityGate {
    return {
      id: 'business-validation-gate',
      name: 'Business Validation Gate',
      type: 'business_validation' as QualityGateType,
      criteria: [
        {
          metric: 'acceptance_criteria_coverage',
          operator: 'gte' as const,
          threshold: 100,
          weight: 0.6,
          critical: true,
          description: 'All acceptance criteria must be covered'
        },
        {
          metric: 'stakeholder_approval',
          operator: 'eq' as const,
          threshold: 1,
          weight: 0.4,
          critical: true,
          description: 'Stakeholder approval required'
        }
      ],
      automated: false,
      blocking: true,
      timeout: 3600000, // 1 hour
      escalation: [{
        condition: 'approval_timeout',
        escalateTo: ['product-owner', 'business-stakeholder'],
        delay: 1800000, // 30 minutes
        maxEscalations: 2
      }],
      notifications: [{
        trigger: 'approval_required',
        channels: ['email', 'slack'],
        recipients: ['product-owner', 'business-stakeholder'],
        template: 'business_validation_request'
      }]
    };
  }

  private async executeCriterionWithAI(
    criterion: QualityGateCriterion,
    pipelineId: string,
    context: QualityGateContext
  ): Promise<CriterionResult> {
    // Simulate criterion execution with AI enhancement
    // In a real implementation, this would integrate with actual measurement tools
    
    const actualValue = await this.measureCriterion(criterion, pipelineId, context);
    const passed = this.evaluateCriterion(criterion, actualValue);
    const contribution = passed ? criterion.weight : 0;

    return {
      metric: criterion.metric,
      actualValue,
      threshold: criterion.threshold,
      passed,
      weight: criterion.weight,
      contribution
    };
  }

  private async measureCriterion(
    criterion: QualityGateCriterion,
    pipelineId: string,
    context: QualityGateContext
  ): Promise<number> {
    // Placeholder implementation - would integrate with actual measurement tools
    // Use brain coordinator for intelligent measurement
    const measurement = await this.brainCoordinator.measureQualityCriterion({
      criterion,
      pipelineId,
      context,
      artifacts: context.artifacts
    });

    return measurement.value || Math.random() * 100;
  }

  private evaluateCriterion(criterion: QualityGateCriterion, actualValue: number): boolean {
    switch (criterion.operator) {
      case 'gt': return actualValue > criterion.threshold;
      case 'gte': return actualValue >= criterion.threshold;
      case 'lt': return actualValue < criterion.threshold;
      case 'lte': return actualValue <= criterion.threshold;
      case 'eq': return actualValue === criterion.threshold;
      case 'neq': return actualValue !== criterion.threshold;
      default: return false;
    }
  }

  private determineGateStatus(
    finalScore: number,
    criterionResults: CriterionResult[],
    gate: QualityGate,
    scoreAdjustment: any
  ): 'pass' | 'fail' | 'warning' {
    const criticalFailures = criterionResults.filter(
      r => !r.passed && gate.criteria.find(c => c.metric === r.metric)?.critical
    );

    if (criticalFailures.length > 0) {
      return 'fail';
    }

    if (finalScore < 70) {
      return 'warning';
    }

    return 'pass';
  }

  private generateGateResultMessage(
    status: string,
    score: number,
    criterionResults: CriterionResult[]
  ): string {
    const criticalFailures = criterionResults.filter(r => !r.passed).length;
    return `Quality gate ${status} with score ${Math.round(score)}% (${criticalFailures} failed criteria)`;
  }

  private async generateIntelligentRecommendations(
    criterionResults: CriterionResult[],
    context: QualityGateContext,
    scoreAdjustment: any
  ): Promise<string[]> {
    // Use brain coordinator for intelligent recommendations
    const recommendations = await this.brainCoordinator.generateQualityRecommendations({
      criterionResults,
      context,
      scoreAdjustment
    });

    return recommendations.recommendations || [
      'Review failed criteria and implement improvements',
      'Consider updating thresholds based on project context',
      'Analyze trends to identify systematic issues'
    ];
  }

  private handleGateEscalation(
    gate: QualityGate,
    result: QualityGateResult,
    config: QualityGateExecutionConfig
  ): void {
    // Handle escalation logic - could integrate with AGUI for approvals
    this.logger.info('Handling quality gate escalation', {
      gateId: gate.id,
      escalationCount: gate.escalation.length
    });
  }

  private sendGateNotifications(
    gate: QualityGate,
    result: QualityGateResult,
    config: QualityGateExecutionConfig
  ): void {
    // Handle notification logic
    this.logger.info('Sending quality gate notifications', {
      gateId: gate.id,
      notificationCount: gate.notifications.length
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

  private calculateGatePerformance(): Record<string, number> {
    const performance: Record<string, number> = {};
    
    for (const [gateId, history] of this.executionHistory) {
      performance[gateId] = this.calculateAverageScore(history);
    }

    return performance;
  }
}

export default QualityGateService;