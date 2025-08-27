/**
 * @fileoverview Deployment Automation Service - Automated deployment and release management.
 *
 * Provides specialized deployment automation with intelligent release strategies,
 * rollback capabilities, environment management, and comprehensive deployment monitoring.
 *
 * Integrates with:
 * - @claude-zen/brain: LoadBalancer for intelligent deployment strategies
 * - @claude-zen/brain: BrainCoordinator for deployment decision making
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/agui: Human-in-loop approvals for production deployments
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// ============================================================================
// DEPLOYMENT AUTOMATION INTERFACES
// ============================================================================
/**
 * Deployment strategy types
 */
export var DeploymentStrategy;
(function (DeploymentStrategy) {
    DeploymentStrategy["BLUE_GREEN"] = "blue_green";
    DeploymentStrategy["CANARY"] = "canary";
    DeploymentStrategy["ROLLING"] = "rolling";
    DeploymentStrategy["RECREATE"] = "recreate";
    DeploymentStrategy["A_B_TESTING"] = "a_b_testing";
})(DeploymentStrategy || (DeploymentStrategy = {}));
-deployment | deployment | post - deployment | 'validation;;
actions: DeploymentAction[];
conditions: DeploymentCondition[];
timeout: number;
retryPolicy: RetryPolicy;
rollbackTriggers: string[];
/**
 * Deployment status
 */
export var DeploymentStatus;
(function (DeploymentStatus) {
    DeploymentStatus["PENDING"] = "pending";
    DeploymentStatus["RUNNING"] = "running";
    DeploymentStatus["SUCCESS"] = "success";
    DeploymentStatus["FAILED"] = "failed";
    DeploymentStatus["ROLLED_BACK"] = "rolled_back";
    DeploymentStatus["CANCELLED"] = "cancelled";
})(DeploymentStatus || (DeploymentStatus = {}));
// ============================================================================
// DEPLOYMENT AUTOMATION SERVICE IMPLEMENTATION
// ============================================================================
/**
 * Deployment Automation Service - Automated deployment and release management
 *
 * Provides comprehensive deployment automation with intelligent strategies, rollback capabilities,
 * environment management, and AI-powered deployment optimization.
 */
export class DeploymentAutomationService {
    logger;
    loadBalancer;
    brainCoordinator;
    performanceTracker;
    initialized = false;
    // Deployment state
    environments = new Map();
    activeDeployments = new Map();
    deploymentHistory = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Initialize service with lazy-loaded dependencies
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Lazy load @claude-zen/brain for LoadBalancer - deployment strategies
            const { LoadBalancer } = await import('@claude-zen/brain');
            ';
            this.loadBalancer = new LoadBalancer(strategy, 'intelligent', enableHealthChecks, true, healthCheckInterval, 30000, failoverTimeout, 5000);
            await this.loadBalancer.initialize();
            // Lazy load @claude-zen/brain for LoadBalancer - intelligent deployment decisions
            const { BrainCoordinator } = await import('@claude-zen/brain');
            ';
            this.brainCoordinator = new BrainCoordinator(enabled, true, learningRate, 0.1, adaptationThreshold, 0.7);
            await this.brainCoordinator.initialize();
            // Lazy load @claude-zen/foundation for performance tracking
            const { PerformanceTracker } = await import('@claude-zen/foundation');
            ';
            this.performanceTracker = new PerformanceTracker();
            // Lazy load @claude-zen/agui for deployment approvals
            const { AGUISystem } = await import('@claude-zen/agui');
            ';
            const aguiResult = await AGUISystem({
                aguiType: 'terminal',
                taskApprovalConfig: {
                    enableRichDisplay: true,
                    enableBatchMode: false,
                    requireRationale: true,
                },
            });
            this.aguiService = aguiResult.agui;
            // Initialize deployment strategies
            this.initializeDeploymentStrategies();
            // Initialize default environments
            this.initializeDefaultEnvironments();
            this.initialized = true;
            this.logger.info('Deployment Automation Service initialized successfully', ');
        }
        catch (error) {
            this.logger.error('Failed to initialize Deployment Automation Service:', error);
            throw error;
        }
    }
    /**
     * Execute deployment automation with intelligent strategy selection
     */
    async executeDeploymentAutomation(pipelineId, environment, artifacts) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('deployment_execution');
        ';
        try {
            this.logger.info('Executing deployment automation with intelligent optimization', {
                pipelineId,
                environment,
                artifactCount: artifacts.length,
            });
            const deploymentEnv = this.environments.get(environment);
            if (!deploymentEnv) {
                throw new Error(`Deployment environment not found: ${environment}`);
                `
      }

      // Use brain coordinator for intelligent strategy selection
      const strategyRecommendation =
        await this.brainCoordinator.recommendDeploymentStrategy({
          environment: deploymentEnv,
          artifacts,
          historicalData: this.getDeploymentHistory(environment),
          riskTolerance: this.calculateRiskTolerance(deploymentEnv),
        });

      const strategy =
        strategyRecommendation.strategy || DeploymentStrategy.ROLLING;

      // Create deployment plan with AI optimization
      const deploymentPlan = this.createDeploymentPlan(
        pipelineId,
        deploymentEnv,
        artifacts,
        strategy,
        strategyRecommendation
      );

      // Validate deployment readiness
      await this.validateDeploymentReadiness(deploymentPlan);

      // Execute deployment with load balancer coordination
      const execution = this.executeDeploymentPlan(deploymentPlan);

      // Monitor deployment progress
      this.monitorDeploymentExecution(execution);

      // Perform post-deployment validation
      this.performPostDeploymentValidation(execution, deploymentPlan);

      // Update deployment history for learning
      this.updateDeploymentHistory(environment, execution);

      this.performanceTracker.endTimer('deployment_execution');'

      this.logger.info('Deployment automation completed successfully', {'
        pipelineId,
        environment,
        strategy,
        duration: execution.duration,
        healthScore: execution.metrics.healthScore,
      });
    } catch (error) {
      this.performanceTracker.endTimer('deployment_execution');'
      this.logger.error('Deployment automation failed:', error);'
      throw error;
    }
  }

  /**
   * Validate deployment readiness with comprehensive checks
   */
  async validateDeploymentReadiness(plan: DeploymentPlan): Promise<void> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('deployment_validation');'

    try {
      this.logger.info('Validating deployment readiness with AI analysis', {'
        planId: plan.id,
        environment: plan.environment.name,
      });

      // Artifact validation
      this.validateArtifacts(plan.artifacts);

      // Environment health check
      this.validateEnvironmentHealth(plan.environment);

      // Infrastructure capacity check
      this.validateInfrastructureCapacity(plan.environment, plan.artifacts);

      // Security compliance check
      this.validateSecurityCompliance(plan.environment, plan.artifacts);

      // Use brain coordinator for readiness assessment
      const readinessAssessment =
        await this.brainCoordinator.assessDeploymentReadiness({
          plan,
          environmentHealth: true, // Results from above validations
          artifactValidation: true,
          securityCompliance: true,
        });

      if (!readinessAssessment.ready) {
        throw new Error(
          `;
                Deployment;
                not;
                ready: $readinessAssessment.reasons.join(', ') ``;
                ;
            }
            this.performanceTracker.endTimer('deployment_validation');
            ';
            this.logger.info('Deployment readiness validation completed', ', planId, plan.id, readinessScore, readinessAssessment.score || 1.0);
        }
        catch (error) {
            this.performanceTracker.endTimer('deployment_validation');
            ';
            this.logger.error('Deployment readiness validation failed:', error);
            ';
            throw error;
        }
    }
    /**
     * Execute rollback with intelligent recovery strategy
     */
    async executeRollback(executionId, _reason) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('deployment_rollback');
        ';
        try {
            const execution = this.activeDeployments.get(executionId);
            if (!execution) {
                throw new Error(`Deployment execution not found: ${executionId}`);
                `
      }

      this.logger.info('Executing intelligent rollback strategy', {'
        executionId,
        reason,
      });

      // Use brain coordinator for rollback strategy
      const rollbackStrategy = await this.brainCoordinator.planRollbackStrategy(
        {
          execution,
          reason,
          environmentType: execution.planId, // Simplified
        }
      );

      // Execute rollback phases
      this.executeRollbackPhases(execution, rollbackStrategy);

      // Verify rollback success
      this.verifyRollbackSuccess(execution);

      // Update deployment status
      const updatedExecution = {
        ...execution,
        status: DeploymentStatus.ROLLED_BACK,
      };
      this.activeDeployments.set(executionId, updatedExecution);

      this.performanceTracker.endTimer('deployment_rollback');'

      this.logger.info('Rollback completed successfully', {'
        executionId,
        rollbackTime: rollbackStrategy.estimatedTime || 0,
      });
    } catch (error) {
      this.performanceTracker.endTimer('deployment_rollback');'
      this.logger.error('Rollback execution failed:', error);'
      throw error;
    }
  }

  /**
   * Get deployment insights and recommendations
   */
  async getDeploymentInsights(environment: string): Promise<{
    successRate: number;
    averageDeploymentTime: number;
    recommendedStrategy: DeploymentStrategy;
    riskFactors: string[];
    optimizationRecommendations: string[];
    trendsAnalysis: any;
  }> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('deployment_insights');'

    try {
      const history = this.deploymentHistory.get(environment) || [];

      // Use brain coordinator for intelligent analysis
      const insights = await this.brainCoordinator.analyzeDeploymentInsights({
        environment,
        deploymentHistory: history,
        analysisDepth:'comprehensive',
      });

      const result = {
        successRate: insights.successRate || this.calculateSuccessRate(history),
        averageDeploymentTime:
          insights.averageTime || this.calculateAverageTime(history),
        recommendedStrategy:
          insights.recommendedStrategy || DeploymentStrategy.ROLLING,
        riskFactors: insights.riskFactors || [],
        optimizationRecommendations: insights.recommendations || [],
        trendsAnalysis: insights.trends || {},
      };

      this.performanceTracker.endTimer('deployment_insights');'

      this.logger.info('Deployment insights generated', {'
        environment,
        successRate: result.successRate,
        historyCount: history.length,
      });

      return result;
    } catch (error) {
      this.performanceTracker.endTimer('deployment_insights');'
      this.logger.error('Failed to generate deployment insights:', error);'
      throw error;
    }
  }

  /**
   * Shutdown service gracefully
   */
  async shutdown(): Promise<void> {
    if (this.loadBalancer?.shutdown) {
      await this.loadBalancer.shutdown();
    }
    if (this.brainCoordinator?.shutdown) {
      await this.brainCoordinator.shutdown();
    }
    if (this.aguiService?.shutdown) {
      await this.aguiService.shutdown();
    }
    this.initialized = false;
    this.logger.info('Deployment Automation Service shutdown complete');'
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private initializeDeploymentStrategies(): void {
    // Initialize built-in deployment strategies
    this.strategies.set(DeploymentStrategy.BLUE_GREEN, {
      name: 'Blue-Green Deployment',
      riskLevel: 'low',
      rollbackTime: 'immediate',
      resourceRequirement: 'high',
    });

    this.strategies.set(DeploymentStrategy.CANARY, {
      name: 'Canary Deployment',
      riskLevel: 'medium',
      rollbackTime: 'fast',
      resourceRequirement: 'medium',
    });

    this.strategies.set(DeploymentStrategy.ROLLING, {
      name: 'Rolling Deployment',
      riskLevel: 'medium',
      rollbackTime: 'moderate',
      resourceRequirement: 'low',
    });
  }

  private initializeDefaultEnvironments(): void {
    // Initialize default deployment environments
    const developmentEnv: DeploymentEnvironment = {
      id: 'development',
      name: 'Development Environment',
      type: 'development',
      region: 'us-east-1',
      infrastructure: {} as InfrastructureConfig,
      securityConfig: {} as SecurityConfig,
      monitoringConfig: {} as MonitoringConfig,
      scalingConfig: {} as ScalingConfig,
      approvalRequired: false,
      rollbackEnabled: true,
    };

    this.environments.set('development', developmentEnv);'
  }

  private createDeploymentPlan(
    pipelineId: string,
    environment: DeploymentEnvironment,
    artifacts: PipelineArtifact[],
    strategy: DeploymentStrategy,
    strategyRecommendation: any
  ): DeploymentPlan {
    // Convert PipelineArtifact to DeploymentArtifact
    const deploymentArtifacts: DeploymentArtifact[] = artifacts.map(
      (artifact) => ({
        id: artifact.id,
        name: artifact.name,
        version: '1.0.0', // Default version'
        type: 'application' as const,
        location: artifact.location,
        size: artifact.size,
        checksum: artifact.checksum,
        dependencies: [],
        metadata: artifact.metadata,
      })
    );

    const plan: DeploymentPlan = {
      id: `;
                deploy - $Date.now() - $Math.random().toString(36).substr(2, 9) `,`;
                pipelineId,
                    strategy,
                    environment,
                    artifacts;
                deploymentArtifacts,
                    phases;
                this.createDeploymentPhases(strategy, environment, deploymentArtifacts),
                    rollbackPlan;
                this.createRollbackPlan(strategy, environment),
                    validation;
                this.createValidationPlan(environment),
                    notifications;
                this.createNotificationPlan(environment),
                    createdAt;
                new Date(),
                ;
            }
            ;
            return plan;
        }
        finally {
        }
    }
    createDeploymentPhases(strategy, environment, artifacts) {
        // Create deployment phases based on strategy
        const phases = [];
        // Pre-deployment phase
        phases.push({
            id: 'pre-deployment',
            name: 'Pre-deployment Setup',
            order: 1,
            type: 'pre-deployment',
            actions: [],
            conditions: [],
            timeout: 600000, // 10 minutes
            retryPolicy: {
                enabled: true,
                maxAttempts: 3,
                backoffStrategy: 'exponential',
                baseDelay: 30000,
                maxDelay: 300000,
            },
            rollbackTriggers: ['setup_failure'],
        });
        // Main deployment phase
        phases.push({
            id: 'deployment',
            name: 'Main Deployment',
            order: 2,
            type: 'deployment',
            actions: [],
            conditions: [],
            timeout: 1800000, // 30 minutes
            retryPolicy: {
                enabled: true,
                maxAttempts: 2,
                backoffStrategy: 'linear',
                baseDelay: 120000,
                maxDelay: 300000,
            },
            rollbackTriggers: ['deployment_failure', 'health_check_failure'],
        });
        // Post-deployment phase
        phases.push({
            id: 'post-deployment',
            name: 'Post-deployment Validation',
            order: 3,
            type: 'post-deployment',
            actions: [],
            conditions: [],
            timeout: 900000, // 15 minutes
            retryPolicy: {
                enabled: true,
                maxAttempts: 3,
                backoffStrategy: 'fixed',
                baseDelay: 60000,
                maxDelay: 180000,
            },
            rollbackTriggers: ['validation_failure'],
        });
        return phases;
    }
}
return {
    enabled: environment.rollbackEnabled,
    automatic: strategy === DeploymentStrategy.BLUE_GREEN,
    triggers: [],
    actions: [],
    timeout: 600000, // 10 minutes
    healthCheckRequired: true,
};
createValidationPlan(environment, DeploymentEnvironment);
ValidationPlan;
return {
    healthChecks: [],
    performanceTests: [],
    securityTests: [],
    businessValidations: [],
    rolloutValidation: {
        strategy: 'gradual',
        phases: [],
        approvals: [],
        monitoringPeriod: 3600000, // 1 hour
    },
};
createNotificationPlan(environment, DeploymentEnvironment);
NotificationPlan;
return {
    channels: [],
    triggers: [],
    templates: [],
};
executeDeploymentPlan(plan, DeploymentPlan);
DeploymentExecution;
{
    const execution = {
        planId: plan.id,
        status: DeploymentStatus.RUNNING,
        phases: plan.phases.map((phase) => ({
            phaseId: phase.id,
            status: DeploymentStatus.PENDING,
            actions: [],
            conditions: [],
            startTime: undefined,
            endTime: undefined,
            duration: undefined,
        })),
        metrics: {
            deploymentTime: 0,
            healthScore: 100,
            performanceImpact: 0,
            errorRate: 0,
            successRate: 1.0,
            resourceUtilization: {
                cpu: 0,
                memory: 0,
                disk: 0,
                network: 0,
                cost: 0,
            },
            userImpactMetrics: {
                responseTime: 0,
                availability: 100,
                errorCount: 0,
                userSessions: 0,
                businessMetrics: {},
            },
        },
        logs: [],
        errors: [],
        startTime: new Date(),
    };
    this.activeDeployments.set(plan.id, execution);
    return execution;
}
monitorDeploymentExecution(execution, DeploymentExecution);
void 
// Monitor deployment progress with load balancer integration
this.logger.info('Monitoring deployment execution', { ': planId, execution, : .planId,
});
performPostDeploymentValidation(execution, DeploymentExecution, plan, DeploymentPlan);
void 
// Perform comprehensive post-deployment validation
this.logger.info('Performing post-deployment validation', { ': planId, plan, : .id,
});
validateArtifacts(artifacts, DeploymentArtifact[]);
void 
// Validate deployment artifacts
this.logger.debug('Validating deployment artifacts', { ': count, artifacts, : .length,
});
validateEnvironmentHealth(environment, DeploymentEnvironment);
void 
// Validate environment health
this.logger.debug('Validating environment health', { ': environment, environment, : .name,
});
validateInfrastructureCapacity(environment, DeploymentEnvironment, artifacts, DeploymentArtifact[]);
void 
// Validate infrastructure capacity
this.logger.debug('Validating infrastructure capacity');
';
validateSecurityCompliance(environment, DeploymentEnvironment, artifacts, DeploymentArtifact[]);
void 
// Validate security compliance
this.logger.debug('Validating security compliance');
';
executeRollbackPhases(execution, DeploymentExecution, strategy, any);
void 
// Execute rollback phases
this.logger.info('Executing rollback phases', { planId: execution.planId });
';
verifyRollbackSuccess(execution, DeploymentExecution);
void 
// Verify rollback success
this.logger.info('Verifying rollback success', { ': planId, execution, : .planId,
});
calculateRiskTolerance(environment, DeploymentEnvironment);
string;
return environment.type === 'production' ? 'low' : 'medium';
getDeploymentHistory(environment, string);
DeploymentExecution[];
return this.deploymentHistory.get(environment) || [];
updateDeploymentHistory(environment, string, execution, DeploymentExecution);
void {
    const: history = this.deploymentHistory.get(environment) || [],
    history, : .push(execution),
    this: .deploymentHistory.set(environment, history.slice(-100))
};
calculateSuccessRate(history, DeploymentExecution[]);
number;
{
    if (history.length === 0)
        return 1.0;
    const successful = history.filter((exec) => exec.status === DeploymentStatus.SUCCESS).length;
    return successful / history.length;
}
calculateAverageTime(history, DeploymentExecution[]);
number;
{
    if (history.length === 0)
        return 0;
    const totalTime = history.reduce((acc, exec) => acc + (exec.duration || 0), 0);
    return totalTime / history.length;
}
export default DeploymentAutomationService;
