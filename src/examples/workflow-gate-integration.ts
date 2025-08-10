/**
 * @file Workflow Gate Integration Examples - Phase 1, Task 1.2
 * 
 * Comprehensive examples demonstrating integration of WorkflowGateRequest
 * with existing AGUI system, type-safe event system, and domain boundary validation.
 * 
 * Shows practical usage patterns for:
 * - Extending ValidationQuestion for workflow gates
 * - AGUI integration with existing interfaces
 * - Event-driven gate orchestration
 * - Escalation chain management
 * - Production-ready workflow scenarios
 */

import {
  WorkflowGateRequestProcessor,
  createApprovalGate,
  createCheckpointGate,
  createEmergencyGate,
  type WorkflowGateRequest,
  type WorkflowContext,
  type EscalationChain,
  GateEscalationLevel,
  type WorkflowGateResult
} from '../coordination/workflows/workflow-gate-request';
import {
  ValidationQuestion,
  ProgressiveConfidenceBuilder
} from '../coordination/discovery/progressive-confidence-builder';
import {
  TypeSafeEventBus,
  createTypeSafeEventBus,
  createEvent,
  createCorrelationId,
  EventPriority,
  type HumanValidationRequestedEvent,
  type HumanValidationCompletedEvent,
  type AGUIGateOpenedEvent,
  type AGUIGateClosedEvent
} from '../core/type-safe-event-system';
import { Domain } from '../core/domain-boundary-validator';
import type { AGUIInterface } from '../interfaces/agui/agui-adapter';
import type { SessionMemoryStore } from '../memory/memory';
import { getLogger } from '../config/logging-config';

const logger = getLogger('workflow-gate-integration-examples');

// ============================================================================
// EXAMPLE 1: Basic ValidationQuestion Extension
// ============================================================================

/**
 * Example 1: Seamless integration with existing ValidationQuestion system
 * Shows how WorkflowGateRequest extends ValidationQuestion while maintaining compatibility
 */
export class ValidationQuestionIntegrationExample {
  constructor(
    private eventBus: TypeSafeEventBus,
    private aguiInterface: AGUIInterface,
    private memoryStore: SessionMemoryStore
  ) {}

  async demonstrateValidationQuestionCompatibility(): Promise<void> {
    logger.info('=== ValidationQuestion Compatibility Demo ===');

    // 1. Create a WorkflowGateRequest that is fully compatible with ValidationQuestion
    const workflowGate: WorkflowGateRequest = {
      // Standard ValidationQuestion properties - fully compatible
      id: 'domain-boundary-validation-001',
      type: 'boundary',
      question: 'Is the "User Management" domain correctly identified and scoped?',
      context: {
        domain: {
          name: 'User Management',
          files: ['src/auth/*', 'src/users/*', 'src/profiles/*'],
          concepts: ['authentication', 'authorization', 'user profiles', 'permissions']
        }
      },
      options: ['Yes, correctly scoped', 'No, needs adjustment', 'Split into multiple domains'],
      allowCustom: false,
      confidence: 0.8,
      priority: 'high',
      validationReason: 'Domain boundary validation during progressive confidence building',
      expectedImpact: 0.2,

      // Extended workflow-specific properties
      workflowContext: {
        workflowId: 'domain-discovery-workflow-001',
        stepName: 'domain-boundary-validation',
        businessImpact: 'high',
        decisionScope: 'feature',
        stakeholders: ['domain-expert', 'lead-architect', 'product-manager'],
        deadline: new Date(Date.now() + 86400000), // 24 hours
        dependencies: [
          {
            id: 'code-analysis-complete',
            type: 'blocking',
            reference: 'code-analysis-task-001',
            criticality: 'high',
            description: 'Code analysis must be completed before domain validation'
          }
        ]
      },
      gateType: 'review',
      integrationConfig: {
        domainValidation: true,
        enableMetrics: true
      }
    };

    // 2. Use with existing ProgressiveConfidenceBuilder (as ValidationQuestion)
    const confidenceBuilder = new ProgressiveConfidenceBuilder(
      {} as any, // domain discovery bridge
      this.memoryStore,
      this.aguiInterface
    );

    logger.info('Using WorkflowGateRequest as ValidationQuestion in ProgressiveConfidenceBuilder');
    
    // The WorkflowGateRequest can be used directly as ValidationQuestion
    const validationResponse = await this.aguiInterface.askQuestion(workflowGate);
    
    logger.info('Validation response received', {
      questionId: workflowGate.id,
      response: validationResponse,
      domainValidation: workflowGate.integrationConfig?.domainValidation
    });

    // 3. Process as workflow gate for enhanced features
    const gateProcessor = new WorkflowGateRequestProcessor(
      this.eventBus,
      this.aguiInterface
    );

    const gateResult = await gateProcessor.processWorkflowGate(workflowGate);
    
    logger.info('Workflow gate processing completed', {
      approved: gateResult.approved,
      escalationLevel: gateResult.escalationLevel,
      processingTime: gateResult.processingTime
    });

    // 4. Demonstrate backward compatibility
    this.demonstrateBackwardCompatibility(workflowGate);
  }

  private demonstrateBackwardCompatibility(workflowGate: WorkflowGateRequest): void {
    // WorkflowGateRequest can be used anywhere ValidationQuestion is expected
    const asValidationQuestion: ValidationQuestion = workflowGate;
    
    logger.info('Backward compatibility verified', {
      id: asValidationQuestion.id,
      type: asValidationQuestion.type,
      confidence: asValidationQuestion.confidence,
      priority: asValidationQuestion.priority,
      // Workflow-specific properties are preserved but not required for ValidationQuestion usage
      hasWorkflowContext: 'workflowContext' in workflowGate,
      hasEscalationChain: 'escalationChain' in workflowGate
    });
  }
}

// ============================================================================
// EXAMPLE 2: AGUI Integration with Existing Interfaces
// ============================================================================

/**
 * Example 2: Advanced AGUI integration with existing terminal and web interfaces
 * Shows how workflow gates integrate with MockAGUI, TerminalAGUI, and custom AGUI implementations
 */
export class AGUIIntegrationExample {
  constructor(
    private eventBus: TypeSafeEventBus,
    private gateProcessor: WorkflowGateRequestProcessor
  ) {}

  async demonstrateAGUIIntegration(): Promise<void> {
    logger.info('=== AGUI Integration Demo ===');

    // 1. Create different types of gates for different AGUI scenarios
    await this.demonstrateTerminalAGUIIntegration();
    await this.demonstrateWebAGUIIntegration();
    await this.demonstrateMockAGUIIntegration();
    await this.demonstrateCustomAGUIIntegration();
  }

  private async demonstrateTerminalAGUIIntegration(): Promise<void> {
    logger.info('--- Terminal AGUI Integration ---');

    // Create a gate suitable for terminal interaction
    const terminalGate = createApprovalGate(
      'ci-cd-pipeline-001',
      'production-deployment-approval',
      `🚀 PRODUCTION DEPLOYMENT APPROVAL

Version: 2.1.5
Environment: Production
Estimated Impact: High

Changes in this release:
- Database schema migrations (3 tables affected)
- API endpoint changes (backward compatible)
- Frontend UI updates for user dashboard

Pre-deployment checklist:
✅ All tests passed (unit: 98.5%, integration: 96.2%)
✅ Security scan completed (0 critical, 2 medium issues resolved)
✅ Performance benchmarks met (99th percentile < 200ms)
✅ Database backup completed
⚠️  Deployment will cause ~2 minutes downtime

Do you approve this deployment to production?`,
      ['devops-lead', 'product-manager', 'engineering-manager'],
      {
        businessImpact: 'high',
        priority: 'high',
        deadline: new Date(Date.now() + 3600000) // 1 hour
      }
    );

    // Add terminal-specific formatting and options
    terminalGate.options = [
      '✅ APPROVE - Deploy to production',
      '❌ REJECT - Block deployment',
      '⏸️  DEFER - Schedule for later',
      '🔧 REQUEST CHANGES - Need modifications'
    ];

    terminalGate.context.terminalFormatting = {
      useColors: true,
      showProgressBar: true,
      enableSound: true // Terminal bell on critical decisions
    };

    const result = await this.gateProcessor.processWorkflowGate(terminalGate);
    
    logger.info('Terminal AGUI gate completed', {
      approved: result.approved,
      terminalFriendly: true
    });
  }

  private async demonstrateWebAGUIIntegration(): Promise<void> {
    logger.info('--- Web AGUI Integration ---');

    // Create a gate with rich web UI context
    const webGate = createCheckpointGate(
      'feature-development-workflow-001',
      'code-quality-gate',
      {
        metrics: {
          codeQuality: {
            maintainability: 8.7,
            reliability: 9.2,
            security: 8.9,
            coverage: 87.3,
            duplications: 2.1,
            techDebt: '2h 15m'
          },
          performance: {
            buildTime: '3m 42s',
            testExecution: '1m 18s',
            bundleSize: '2.8MB',
            firstContentfulPaint: '1.2s'
          }
        },
        issues: {
          critical: 0,
          high: 2,
          medium: 8,
          low: 15,
          info: 3
        },
        webUI: {
          showCharts: true,
          enableInteractiveMetrics: true,
          theme: 'professional'
        }
      },
      {
        autoApprovalThreshold: 0.85,
        businessImpact: 'medium'
      }
    );

    // Add web-specific context
    webGate.context.webUIComponents = [
      {
        type: 'metrics-dashboard',
        data: webGate.context.metrics,
        interactive: true
      },
      {
        type: 'issue-summary',
        data: webGate.context.issues,
        expandable: true
      },
      {
        type: 'trend-chart',
        data: 'quality-over-time',
        timeRange: '30d'
      }
    ];

    const result = await this.gateProcessor.processWorkflowGate(webGate);
    
    logger.info('Web AGUI gate completed', {
      approved: result.approved,
      autoApproved: result.autoApproved,
      webUIEnhanced: true
    });
  }

  private async demonstrateMockAGUIIntegration(): Promise<void> {
    logger.info('--- Mock AGUI Integration (Testing/CI) ---');

    // Create a gate for automated testing environments
    const mockGate = createCheckpointGate(
      'automated-testing-workflow-001',
      'regression-test-gate',
      {
        testResults: {
          totalTests: 2847,
          passed: 2831,
          failed: 16,
          skipped: 0,
          duration: '12m 34s',
          coverage: 91.7,
          flaky: 3
        },
        environment: 'CI',
        automated: true
      }
    );

    // Configure for mock/automated approval
    mockGate.conditionalLogic = {
      autoApprovalConditions: [
        {
          id: 'high_pass_rate',
          type: 'custom',
          operator: 'greater_than',
          field: 'testResults.passed',
          value: 2800,
          required: false
        },
        {
          id: 'low_failure_rate',
          type: 'custom',
          operator: 'less_than',
          field: 'testResults.failed',
          value: 20,
          required: false
        }
      ]
    };

    const result = await this.gateProcessor.processWorkflowGate(mockGate);
    
    logger.info('Mock AGUI gate completed', {
      approved: result.approved,
      autoApproved: result.autoApproved,
      suitableForCI: true
    });
  }

  private async demonstrateCustomAGUIIntegration(): Promise<void> {
    logger.info('--- Custom AGUI Integration ---');

    // Create a gate that requires custom AGUI implementation
    const customGate = createEmergencyGate(
      'incident-response-workflow-001',
      'security-breach-response',
      {
        incident: {
          severity: 'CRITICAL',
          type: 'security_breach',
          affectedSystems: ['user-auth', 'payment-gateway', 'user-data'],
          detectedAt: new Date(),
          estimatedImpact: 'HIGH',
          containmentStatus: 'IN_PROGRESS'
        },
        responseTeam: ['security-lead', 'devops-lead', 'legal-counsel'],
        customAGUIFeatures: {
          requireBiometric: true,
          logAllInteractions: true,
          enableVideoCall: true,
          notificationChannels: ['sms', 'phone', 'slack', 'email'],
          escalationMode: 'IMMEDIATE'
        }
      },
      ['security-lead', 'cto', 'ceo']
    );

    // Add custom AGUI requirements
    customGate.integrationConfig = {
      ...customGate.integrationConfig,
      aguiInterface: 'emergency-response-agui',
      enableMetrics: true,
      correlationId: createCorrelationId()
    };

    const result = await this.gateProcessor.processWorkflowGate(customGate, {
      timeout: 600000 // 10 minutes max for emergency
    });
    
    logger.info('Custom AGUI gate completed', {
      approved: result.approved,
      escalationLevel: result.escalationLevel,
      emergencyHandled: true
    });
  }
}

// ============================================================================
// EXAMPLE 3: Event-Driven Gate Orchestration
// ============================================================================

/**
 * Example 3: Advanced event-driven orchestration using type-safe event system
 * Shows complex workflows with multiple gates, event coordination, and state management
 */
export class EventDrivenGateOrchestration {
  private readonly gateStates = new Map<string, GateState>();
  private readonly workflowStates = new Map<string, WorkflowState>();

  constructor(
    private eventBus: TypeSafeEventBus,
    private gateProcessor: WorkflowGateRequestProcessor
  ) {
    this.initializeEventHandlers();
  }

  async demonstrateEventDrivenOrchestration(): Promise<void> {
    logger.info('=== Event-Driven Gate Orchestration Demo ===');

    // Create a complex multi-gate workflow
    const workflowId = 'release-management-workflow-001';
    
    await this.orchestrateReleaseWorkflow(workflowId);
  }

  private async orchestrateReleaseWorkflow(workflowId: string): Promise<void> {
    logger.info('Starting release management workflow', { workflowId });

    // Initialize workflow state
    const workflowState: WorkflowState = {
      id: workflowId,
      status: 'running',
      completedGates: new Set(),
      pendingGates: new Set(),
      failedGates: new Set(),
      startTime: new Date(),
      gates: {
        'code-quality-gate': 'pending',
        'security-review-gate': 'pending',
        'performance-gate': 'pending',
        'stakeholder-approval-gate': 'pending',
        'deployment-gate': 'pending'
      }
    };

    this.workflowStates.set(workflowId, workflowState);

    // 1. Start with parallel quality gates
    await this.processGateInParallel(workflowId, 'code-quality-gate', this.createCodeQualityGate(workflowId));
    await this.processGateInParallel(workflowId, 'security-review-gate', this.createSecurityReviewGate(workflowId));
    await this.processGateInParallel(workflowId, 'performance-gate', this.createPerformanceGate(workflowId));

    // 2. Wait for quality gates to complete before stakeholder approval
    await this.waitForGatesCompletion(workflowId, ['code-quality-gate', 'security-review-gate', 'performance-gate']);

    // 3. Proceed with stakeholder approval if quality gates passed
    if (this.allGatesPassed(workflowId, ['code-quality-gate', 'security-review-gate', 'performance-gate'])) {
      await this.processGate(workflowId, 'stakeholder-approval-gate', this.createStakeholderApprovalGate(workflowId));

      // 4. Final deployment gate if stakeholder approved
      if (this.gatePassedp(workflowId, 'stakeholder-approval-gate')) {
        await this.processGate(workflowId, 'deployment-gate', this.createDeploymentGate(workflowId));
      }
    }

    // 5. Complete workflow
    await this.completeWorkflow(workflowId);
  }

  private async processGate(workflowId: string, gateId: string, gate: WorkflowGateRequest): Promise<void> {
    const workflowState = this.workflowStates.get(workflowId);
    if (!workflowState) return;

    logger.info('Processing gate', { workflowId, gateId });

    workflowState.pendingGates.add(gateId);
    workflowState.gates[gateId] = 'processing';

    try {
      const result = await this.gateProcessor.processWorkflowGate(gate);
      
      if (result.success && result.approved) {
        workflowState.completedGates.add(gateId);
        workflowState.gates[gateId] = 'approved';
        
        // Emit workflow gate completed event
        await this.emitWorkflowGateCompletedEvent(workflowId, gateId, result);
      } else {
        workflowState.failedGates.add(gateId);
        workflowState.gates[gateId] = 'failed';
        
        // Emit workflow gate failed event
        await this.emitWorkflowGateFailedEvent(workflowId, gateId, result);
      }
      
      workflowState.pendingGates.delete(gateId);
      
    } catch (error) {
      logger.error('Gate processing failed', { workflowId, gateId, error });
      workflowState.failedGates.add(gateId);
      workflowState.gates[gateId] = 'failed';
      workflowState.pendingGates.delete(gateId);
    }
  }

  private async processGateInParallel(workflowId: string, gateId: string, gate: WorkflowGateRequest): Promise<void> {
    // Process gate without waiting for completion (parallel execution)
    this.processGate(workflowId, gateId, gate).catch(error => {
      logger.error('Parallel gate processing failed', { workflowId, gateId, error });
    });
  }

  private async waitForGatesCompletion(workflowId: string, gateIds: string[]): Promise<void> {
    const workflowState = this.workflowStates.get(workflowId);
    if (!workflowState) return;

    logger.info('Waiting for gates completion', { workflowId, gateIds });

    return new Promise((resolve) => {
      const checkCompletion = () => {
        const allCompleted = gateIds.every(gateId => 
          workflowState.completedGates.has(gateId) || workflowState.failedGates.has(gateId)
        );

        if (allCompleted) {
          logger.info('All gates completed', { workflowId, gateIds });
          resolve();
        } else {
          setTimeout(checkCompletion, 100); // Check every 100ms
        }
      };

      checkCompletion();
    });
  }

  private allGatesPassed(workflowId: string, gateIds: string[]): boolean {
    const workflowState = this.workflowStates.get(workflowId);
    if (!workflowState) return false;

    return gateIds.every(gateId => workflowState.completedGates.has(gateId));
  }

  private gatePassedp(workflowId: string, gateId: string): boolean {
    const workflowState = this.workflowStates.get(workflowId);
    if (!workflowState) return false;

    return workflowState.completedGates.has(gateId);
  }

  private async completeWorkflow(workflowId: string): Promise<void> {
    const workflowState = this.workflowStates.get(workflowId);
    if (!workflowState) return;

    workflowState.status = 'completed';
    workflowState.endTime = new Date();

    logger.info('Workflow completed', {
      workflowId,
      duration: workflowState.endTime.getTime() - workflowState.startTime.getTime(),
      completedGates: Array.from(workflowState.completedGates),
      failedGates: Array.from(workflowState.failedGates)
    });

    // Emit workflow completion event
    await this.eventBus.emitEvent(createEvent(
      'workflow.completed',
      Domain.WORKFLOWS,
      {
        payload: {
          workflowId,
          result: {
            status: workflowState.status,
            completedGates: Array.from(workflowState.completedGates),
            failedGates: Array.from(workflowState.failedGates)
          },
          duration: workflowState.endTime.getTime() - workflowState.startTime.getTime(),
          stepsExecuted: workflowState.completedGates.size
        }
      }
    ));
  }

  // Gate factory methods for the release workflow
  private createCodeQualityGate(workflowId: string): WorkflowGateRequest {
    return createCheckpointGate(
      workflowId,
      'code-quality-gate',
      {
        codeQuality: {
          maintainability: 8.5,
          reliability: 9.1,
          security: 8.8,
          coverage: 89.2,
          duplications: 1.8,
          issues: { critical: 0, high: 1, medium: 5 }
        }
      },
      {
        autoApprovalThreshold: 0.85,
        businessImpact: 'medium'
      }
    );
  }

  private createSecurityReviewGate(workflowId: string): WorkflowGateRequest {
    return createApprovalGate(
      workflowId,
      'security-review-gate',
      'Security review passed. No critical vulnerabilities found. Approve for release?',
      ['security-lead', 'devops-lead'],
      {
        businessImpact: 'high',
        priority: 'high'
      }
    );
  }

  private createPerformanceGate(workflowId: string): WorkflowGateRequest {
    return createCheckpointGate(
      workflowId,
      'performance-gate',
      {
        performance: {
          loadTestPassed: true,
          averageResponseTime: 145, // ms
          p99ResponseTime: 380, // ms
          throughput: 1250, // req/sec
          errorRate: 0.02 // 0.02%
        }
      },
      {
        autoApprovalThreshold: 0.9,
        businessImpact: 'high'
      }
    );
  }

  private createStakeholderApprovalGate(workflowId: string): WorkflowGateRequest {
    return createApprovalGate(
      workflowId,
      'stakeholder-approval-gate',
      `All quality gates have passed. Ready for production release.

Quality Summary:
✅ Code Quality: High (8.5/10)  
✅ Security Review: Approved
✅ Performance Tests: Passed

Release includes:
- 15 new features
- 23 bug fixes  
- 8 performance improvements

Estimated deployment time: 15 minutes
Rollback capability: Available

Approve for production release?`,
      ['product-manager', 'engineering-director', 'business-stakeholder'],
      {
        businessImpact: 'critical',
        priority: 'high'
      }
    );
  }

  private createDeploymentGate(workflowId: string): WorkflowGateRequest {
    return createApprovalGate(
      workflowId,
      'deployment-gate',
      '🚀 FINAL DEPLOYMENT APPROVAL - Production deployment is ready to begin.',
      ['devops-lead', 'on-call-engineer'],
      {
        businessImpact: 'critical',
        priority: 'critical'
      }
    );
  }

  private async emitWorkflowGateCompletedEvent(
    workflowId: string, 
    gateId: string, 
    result: WorkflowGateResult
  ): Promise<void> {
    await this.eventBus.emitEvent(createEvent(
      'workflow.step.completed',
      Domain.WORKFLOWS,
      {
        payload: {
          workflowId,
          stepIndex: 0,
          stepResult: { gateId, result },
          duration: result.processingTime
        }
      }
    ));
  }

  private async emitWorkflowGateFailedEvent(
    workflowId: string,
    gateId: string,
    result: WorkflowGateResult
  ): Promise<void> {
    await this.eventBus.emitEvent(createEvent(
      'error.occurred',
      Domain.CORE,
      {
        payload: {
          error: result.error || new Error('Gate failed'),
          context: { workflowId, gateId, result },
          severity: 'high' as const,
          recoverable: true
        }
      }
    ));
  }

  private initializeEventHandlers(): void {
    // Listen for human validation events
    this.eventBus.registerHandler('human.validation.requested', async (event: HumanValidationRequestedEvent) => {
      const { requestId, validationType, priority } = event.payload;
      
      logger.debug('Human validation requested', {
        requestId,
        validationType,
        priority
      });
    });

    this.eventBus.registerHandler('human.validation.completed', async (event: HumanValidationCompletedEvent) => {
      const { requestId, approved, feedback } = event.payload;
      
      logger.debug('Human validation completed', {
        requestId,
        approved,
        feedback
      });
    });

    // Listen for AGUI gate events
    this.eventBus.registerHandler('agui.gate.opened', async (event: AGUIGateOpenedEvent) => {
      const { gateId, gateType, requiredApproval } = event.payload;
      
      this.gateStates.set(gateId, {
        id: gateId,
        type: gateType,
        status: 'opened',
        openedAt: new Date(),
        requiredApproval
      });

      logger.debug('AGUI gate opened', { gateId, gateType });
    });

    this.eventBus.registerHandler('agui.gate.closed', async (event: AGUIGateClosedEvent) => {
      const { gateId, approved, duration } = event.payload;
      
      const gateState = this.gateStates.get(gateId);
      if (gateState) {
        gateState.status = approved ? 'approved' : 'rejected';
        gateState.closedAt = new Date();
        gateState.duration = duration;
      }

      logger.debug('AGUI gate closed', { gateId, approved, duration });
    });
  }
}

// ============================================================================
// EXAMPLE 4: Production-Ready Workflow Scenarios
// ============================================================================

/**
 * Example 4: Real-world production scenarios demonstrating advanced features
 * Complex workflows with realistic business requirements and edge cases
 */
export class ProductionWorkflowScenarios {
  constructor(
    private eventBus: TypeSafeEventBus,
    private gateProcessor: WorkflowGateRequestProcessor
  ) {}

  async demonstrateProductionScenarios(): Promise<void> {
    logger.info('=== Production Workflow Scenarios Demo ===');

    await this.demoDataMigrationWorkflow();
    await this.demoIncidentResponseWorkflow(); 
    await this.demoFeatureToggleWorkflow();
    await this.demoComplianceApprovalWorkflow();
  }

  private async demoDataMigrationWorkflow(): Promise<void> {
    logger.info('--- Data Migration Workflow ---');

    const workflowId = 'data-migration-v2-001';
    
    // Pre-migration validation gate
    const preMigrationGate: WorkflowGateRequest = {
      id: 'pre-migration-validation',
      type: 'checkpoint',
      question: 'Pre-migration validation complete. All safety checks passed. Proceed with data migration?',
      context: {
        migration: {
          type: 'schema_upgrade',
          affectedTables: ['users', 'orders', 'payments', 'audit_logs'],
          estimatedDuration: '45 minutes',
          estimatedDowntime: '10 minutes',
          dataVolumeGB: 2847,
          backupStatus: 'completed',
          rollbackPlan: 'available'
        },
        validation: {
          schemaValidation: 'passed',
          dataIntegrityCheck: 'passed',
          performanceBaseline: 'established',
          rollbackTested: true
        }
      },
      confidence: 0.95,
      priority: 'critical',
      
      workflowContext: {
        workflowId,
        stepName: 'pre-migration-validation',
        businessImpact: 'critical',
        decisionScope: 'portfolio',
        stakeholders: ['database-admin', 'platform-lead', 'business-continuity-manager'],
        deadline: new Date(Date.now() + 7200000), // 2 hours
        dependencies: [
          {
            id: 'backup-verification',
            type: 'blocking',
            reference: 'backup-validation-task',
            criticality: 'critical',
            description: 'Full database backup must be verified before migration'
          },
          {
            id: 'maintenance-window',
            type: 'blocking', 
            reference: 'maintenance-schedule',
            criticality: 'high',
            description: 'Migration must occur during approved maintenance window'
          }
        ],
        riskFactors: [
          {
            id: 'migration-failure',
            category: 'technical',
            severity: 'critical',
            probability: 0.05,
            description: 'Migration could fail leaving database in inconsistent state',
            mitigation: ['verified backup', 'rollback procedure', 'database monitoring']
          }
        ]
      },
      gateType: 'approval',
      requiredApprovalLevel: GateEscalationLevel.DIRECTOR,
      timeoutConfig: {
        initialTimeout: 1800000, // 30 minutes
        escalationTimeouts: [1800000, 1800000],
        maxTotalTimeout: 7200000 // 2 hours
      }
    };

    const result = await this.gateProcessor.processWorkflowGate(preMigrationGate);
    logger.info('Data migration gate processed', { approved: result.approved });
  }

  private async demoIncidentResponseWorkflow(): Promise<void> {
    logger.info('--- Incident Response Workflow ---');

    const incidentId = 'INC-2024-001847';
    
    // Emergency response gate
    const emergencyGate = createEmergencyGate(
      `incident-response-${incidentId}`,
      'emergency-response-authorization',
      {
        incident: {
          id: incidentId,
          severity: 'P1-CRITICAL',
          title: 'Payment Processing System Outage',
          description: 'Complete failure of payment processing system affecting all transactions',
          detectedAt: new Date(Date.now() - 600000), // 10 minutes ago
          impact: 'All customer payments failing, revenue loss estimated at $10K/minute',
          affectedSystems: ['payment-gateway', 'fraud-detection', 'billing-service'],
          currentStatus: 'investigating',
          estimatedTimeToResolve: 'unknown'
        },
        proposedActions: [
          'Immediate failover to backup payment processor',
          'Bypass fraud detection for critical transactions', 
          'Enable manual payment processing',
          'Communicate with affected customers'
        ],
        riskAssessment: {
          revenueImpact: 'critical',
          customerImpact: 'high', 
          reputationalRisk: 'high',
          complianceImpact: 'medium'
        }
      },
      ['incident-commander', 'engineering-director', 'cto']
    );

    // Add incident-specific escalation chain
    emergencyGate.escalationChain = {
      id: `emergency-escalation-${incidentId}`,
      levels: [
        {
          level: GateEscalationLevel.MANAGER,
          approvers: ['incident-commander'],
          requiredApprovals: 1,
          timeLimit: 300000, // 5 minutes
          notifications: {
            channels: ['sms', 'phone', 'slack'],
            priority: 'urgent',
            followUpIntervals: [60000, 120000] // 1min, 2min
          }
        },
        {
          level: GateEscalationLevel.DIRECTOR,
          approvers: ['engineering-director'],
          requiredApprovals: 1,
          timeLimit: 600000, // 10 minutes
          notifications: {
            channels: ['phone', 'sms'],
            priority: 'urgent'
          }
        },
        {
          level: GateEscalationLevel.EXECUTIVE,
          approvers: ['cto', 'ceo'],
          requiredApprovals: 1,
          timeLimit: 900000, // 15 minutes
          notifications: {
            channels: ['phone'],
            priority: 'urgent'
          }
        }
      ],
      triggers: [
        {
          type: 'timeout',
          threshold: 'time_limit',
          delay: 0,
          skipLevels: false
        }
      ],
      maxLevel: GateEscalationLevel.EXECUTIVE,
      notifyAllLevels: true
    };

    const result = await this.gateProcessor.processWorkflowGate(emergencyGate, {
      timeout: 900000 // 15 minutes max
    });

    logger.info('Emergency response gate processed', {
      approved: result.approved,
      escalationLevel: result.escalationLevel,
      responseTime: result.processingTime
    });
  }

  private async demoFeatureToggleWorkflow(): Promise<void> {
    logger.info('--- Feature Toggle Workflow ---');

    const featureToggleGate = createApprovalGate(
      'feature-rollout-advanced-analytics',
      'progressive-rollout-gate',
      `🎯 PROGRESSIVE FEATURE ROLLOUT

Feature: Advanced Analytics Dashboard
Current Rollout: 5% → 25% of users

Performance Impact Analysis:
📊 Current Metrics (5% rollout):
- Page load time: +120ms average (acceptable)
- Database queries: +15% load (within limits)
- Error rate: 0.03% (baseline: 0.02%)
- User engagement: +23% time on site

🔍 Monitoring Results:
✅ No critical errors detected
✅ Infrastructure scaling working properly  
⚠️  Slightly higher memory usage (+8%)
✅ User feedback positive (4.2/5 rating)

Rollout Plan:
- Next: 25% of user base (estimated 50K users)
- Timeline: Gradual over 48 hours
- Monitoring: Enhanced metrics collection
- Rollback: Automatic if error rate > 0.1%

Approve rollout to 25% of users?`,
      ['product-manager', 'engineering-lead', 'data-analyst'],
      {
        businessImpact: 'medium',
        priority: 'medium'
      }
    );

    // Add feature-specific context
    featureToggleGate.context.featureRollout = {
      featureName: 'advanced-analytics-dashboard',
      currentPercentage: 5,
      targetPercentage: 25,
      metrics: {
        performance: 'acceptable',
        stability: 'good',
        userSatisfaction: 'high'
      },
      rollbackAvailable: true
    };

    // Auto-approval if metrics are good
    featureToggleGate.conditionalLogic = {
      autoApprovalConditions: [
        {
          id: 'low_error_rate',
          type: 'custom',
          operator: 'less_than',
          field: 'errorRate',
          value: 0.05,
          required: false
        }
      ]
    };

    const result = await this.gateProcessor.processWorkflowGate(featureToggleGate);
    logger.info('Feature toggle gate processed', {
      approved: result.approved,
      autoApproved: result.autoApproved
    });
  }

  private async demoComplianceApprovalWorkflow(): Promise<void> {
    logger.info('--- Compliance Approval Workflow ---');

    const complianceGate: WorkflowGateRequest = {
      id: 'gdpr-data-retention-policy-update',
      type: 'review',
      question: `📋 GDPR COMPLIANCE REVIEW

Data Retention Policy Update Required

Regulatory Requirement:
European regulations require updated data retention policies for user personal data.

Proposed Changes:
1. Reduce retention period: 5 years → 3 years
2. Enhanced data anonymization procedures  
3. Improved user data deletion workflows
4. Additional consent tracking mechanisms

Impact Assessment:
✅ Legal: Ensures GDPR compliance
✅ Technical: Implementation plan ready
⚠️  Business: May impact analytics historical data
⚠️  Operations: Requires training updates

Stakeholder Review Required:
- Legal team approval
- Privacy officer sign-off  
- Engineering feasibility confirmation
- Business impact acceptance

Approve implementation of updated data retention policy?`,
      context: {
        compliance: {
          regulation: 'GDPR',
          requirement: 'data_retention_update',
          deadline: new Date(Date.now() + 2592000000), // 30 days
          impact: 'moderate',
          implementation_effort: '3 sprints'
        },
        approvals: {
          legal_review: 'pending',
          privacy_officer: 'pending',
          engineering_assessment: 'completed',
          business_impact_review: 'pending'
        }
      },
      confidence: 0.8,
      priority: 'high',
      
      workflowContext: {
        workflowId: 'gdpr-compliance-update-2024-q1',
        stepName: 'stakeholder-review-gate',
        businessImpact: 'high',
        decisionScope: 'epic',
        stakeholders: [
          'legal-counsel',
          'privacy-officer', 
          'engineering-director',
          'product-director',
          'compliance-manager'
        ],
        deadline: new Date(Date.now() + 2592000000), // 30 days
        dependencies: [
          {
            id: 'legal-analysis',
            type: 'blocking',
            reference: 'legal-review-task-001',
            criticality: 'critical',
            description: 'Legal team must review and approve policy changes'
          },
          {
            id: 'technical-assessment',
            type: 'blocking', 
            reference: 'tech-feasibility-study',
            criticality: 'high',
            description: 'Engineering team must confirm technical implementation plan'
          }
        ],
        riskFactors: [
          {
            id: 'regulatory-compliance',
            category: 'compliance',
            severity: 'critical',
            probability: 0.9,
            description: 'Non-compliance could result in regulatory penalties',
            mitigation: ['legal review', 'privacy impact assessment', 'compliance monitoring']
          },
          {
            id: 'data-loss-risk',
            category: 'operational',
            severity: 'medium',
            probability: 0.3,
            description: 'Earlier data deletion could impact business analytics',
            mitigation: ['data export procedures', 'anonymization options']
          }
        ]
      },
      gateType: 'review',
      requiredApprovalLevel: GateEscalationLevel.DIRECTOR,
      escalationChain: {
        id: 'compliance-escalation-chain',
        levels: [
          {
            level: GateEscalationLevel.MANAGER,
            approvers: ['compliance-manager'],
            requiredApprovals: 1,
            timeLimit: 604800000 // 7 days
          },
          {
            level: GateEscalationLevel.DIRECTOR,
            approvers: ['legal-director', 'engineering-director'],
            requiredApprovals: 2, // Both legal and engineering directors
            timeLimit: 1209600000 // 14 days
          },
          {
            level: GateEscalationLevel.EXECUTIVE,
            approvers: ['cpo', 'cto'],
            requiredApprovals: 1,
            timeLimit: 604800000 // 7 days
          }
        ],
        triggers: [
          {
            type: 'timeout',
            threshold: 'time_limit',
            delay: 86400000 // 1 day delay before escalation
          }
        ],
        maxLevel: GateEscalationLevel.EXECUTIVE
      },
      timeoutConfig: {
        initialTimeout: 604800000, // 7 days initial
        escalationTimeouts: [1209600000, 604800000], // 14 days, 7 days
        maxTotalTimeout: 2592000000 // 30 days maximum
      }
    };

    const result = await this.gateProcessor.processWorkflowGate(complianceGate);
    logger.info('Compliance approval gate processed', {
      approved: result.approved,
      escalationLevel: result.escalationLevel
    });
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

interface GateState {
  id: string;
  type: string;
  status: 'opened' | 'approved' | 'rejected' | 'failed';
  openedAt: Date;
  closedAt?: Date;
  duration?: number;
  requiredApproval: boolean;
}

interface WorkflowState {
  id: string;
  status: 'running' | 'completed' | 'failed';
  completedGates: Set<string>;
  pendingGates: Set<string>;
  failedGates: Set<string>;
  startTime: Date;
  endTime?: Date;
  gates: Record<string, string>;
}

// ============================================================================
// MAIN DEMO FUNCTION
// ============================================================================

/**
 * Complete integration demonstration
 * Run all examples to show full WorkflowGateRequest system capabilities
 */
export async function runWorkflowGateIntegrationDemo(): Promise<void> {
  logger.info('🚀 Starting Workflow Gate Integration Demo');

  try {
    // Initialize system components
    const eventBus = createTypeSafeEventBus({
      enableMetrics: true,
      domainValidation: true
    });
    await eventBus.initialize();

    // Mock AGUI for demo (in production, use actual AGUI implementation)
    const mockAGUI: AGUIInterface = {
      async askQuestion(question: any): Promise<string> {
        // Simulate decision based on context
        if (question.context?.automated || question.gateType === 'checkpoint') {
          return 'approve';
        }
        if (question.workflowContext?.businessImpact === 'critical') {
          return 'approve'; // Emergency approvals
        }
        return Math.random() > 0.3 ? 'approve' : 'review needed';
      },
      async askBatchQuestions(questions: any[]): Promise<string[]> {
        return Promise.all(questions.map(q => this.askQuestion(q)));
      },
      async showMessage(message: string): Promise<void> {
        logger.info('AGUI Message', { message });
      },
      async showProgress(progress: any): Promise<void> {
        logger.info('AGUI Progress', { progress });
      }
    };

    const memoryStore: SessionMemoryStore = {} as any; // Mock memory store

    const gateProcessor = new WorkflowGateRequestProcessor(eventBus, mockAGUI);

    // Run all examples
    const validationExample = new ValidationQuestionIntegrationExample(eventBus, mockAGUI, memoryStore);
    const aguiExample = new AGUIIntegrationExample(eventBus, gateProcessor);
    const orchestrationExample = new EventDrivenGateOrchestration(eventBus, gateProcessor);
    const productionExample = new ProductionWorkflowScenarios(eventBus, gateProcessor);

    await validationExample.demonstrateValidationQuestionCompatibility();
    await aguiExample.demonstrateAGUIIntegration();
    await orchestrationExample.demonstrateEventDrivenOrchestration();
    await productionExample.demonstrateProductionScenarios();

    logger.info('✅ Workflow Gate Integration Demo completed successfully');

    await eventBus.shutdown();

  } catch (error) {
    logger.error('❌ Demo failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ValidationQuestionIntegrationExample,
  AGUIIntegrationExample, 
  EventDrivenGateOrchestration,
  ProductionWorkflowScenarios
};

// Run demo if executed directly
if (require.main === module) {
  runWorkflowGateIntegrationDemo().catch(console.error);
}