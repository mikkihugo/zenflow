/**
 * @file Domain Boundary Integration Examples
 *
 * Comprehensive examples showing how the domain boundary validator integrates
 * with existing domain types and provides runtime validation for the entire system.
 *
 * These examples demonstrate real-world usage patterns for Phase 0 foundation.
 */

import { getLogger } from '../config/logging-config.ts';

import type { Agent, ExecutionPlan, PhaseAssignment, Task } from '../coordination/types.ts';
import {
  CommonSchemas,
  type ContractRule,
  Domain,
  DomainBoundaryValidator,
  type DomainOperation,
  domainValidatorRegistry,
  getDomainValidator,
  type TypeSchema,
  validateCrossDomain,
} from '../core/domain-boundary-validator.ts';
import type { WorkflowDefinition, WorkflowEvent, WorkflowExecution } from '../workflows/types.ts';

const logger = getLogger('domain-boundary-examples');

// ============================================================================
// EXTENDED SCHEMA DEFINITIONS - Building on CommonSchemas
// ============================================================================

/**
 * Extended schemas for complex domain operations
 */
export const ExtendedSchemas = {
  /**
   * PhaseAssignment schema for coordination domain
   */
  PhaseAssignment: {
    type: 'object',
    required: true,
    properties: {
      phase: { type: 'string', required: true },
      agentId: { type: 'string', required: true },
      capabilities: {
        type: 'array',
        required: true,
        items: { type: 'string' },
      },
      status: {
        type: 'string',
        required: true,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
      },
    },
  } as TypeSchema<PhaseAssignment>,

  /**
   * ExecutionPlan schema for coordination domain
   */
  ExecutionPlan: {
    type: 'object',
    required: true,
    properties: {
      taskId: { type: 'string', required: true },
      phases: {
        type: 'array',
        required: true,
        items: { type: 'string' },
      },
      phaseAssignments: {
        type: 'array',
        required: true,
        items: ExtendedSchemas.PhaseAssignment,
      },
      parallelizable: { type: 'boolean', required: true },
      checkpoints: { type: 'array', required: true },
    },
  } as TypeSchema<ExecutionPlan>,

  /**
   * WorkflowExecution schema for workflows domain
   */
  WorkflowExecution: {
    type: 'object',
    required: true,
    properties: {
      id: { type: 'string', required: true },
      workflowId: { type: 'string', required: true },
      status: {
        type: 'string',
        required: true,
        enum: ['queued', 'running', 'paused', 'completed', 'failed', 'cancelled'],
      },
      startTime: { type: 'string', required: true },
      endTime: { type: 'string', required: false },
      currentStep: { type: 'number', required: true },
      totalSteps: { type: 'number', required: true },
      results: { type: 'object', required: true },
      metrics: {
        type: 'object',
        required: true,
        properties: {
          duration: { type: 'number', required: false },
          stepsCompleted: { type: 'number', required: true },
          stepsFailed: { type: 'number', required: true },
          resourcesUsed: { type: 'object', required: true },
        },
      },
    },
  } as TypeSchema<WorkflowExecution>,

  /**
   * WorkflowEvent schema for workflows domain
   */
  WorkflowEvent: {
    type: 'object',
    required: true,
    properties: {
      type: {
        type: 'string',
        required: true,
        enum: [
          'workflow.started',
          'workflow.completed',
          'workflow.failed',
          'step.started',
          'step.completed',
          'step.failed',
        ],
      },
      workflowId: { type: 'string', required: true },
      stepIndex: { type: 'number', required: false },
      data: { type: 'object', required: false },
      timestamp: { type: 'string', required: true },
    },
  } as TypeSchema<WorkflowEvent>,
} as const;

// ============================================================================
// CONTRACT RULES - Real-world domain operation contracts
// ============================================================================

/**
 * Common contract rules for domain operations
 */
export const ContractRules = {
  /**
   * Validates that an agent has required capabilities for a task
   */
  agentCapabilityValidation: {
    name: 'agent-capability-validation',
    description: 'Validates agent capabilities match task requirements',
    validator: async (operation: DomainOperation, context) => {
      // This would typically access the actual data being validated
      // For demonstration, we'll validate the operation structure
      return (
        operation.sourceDomain === Domain.COORDINATION &&
        operation.targetDomain === Domain.WORKFLOWS
      );
    },
    severity: 'error' as const,
    errorMessage: 'Agent does not have required capabilities for task',
  },

  /**
   * Rate limiting for cross-domain operations
   */
  rateLimitValidation: {
    name: 'rate-limit-validation',
    description: 'Enforces rate limits on cross-domain operations',
    validator: async (operation: DomainOperation, context) => {
      // In a real implementation, this would check against a rate limiter
      const now = Date.now();
      const rateLimit = operation.metadata.rateLimit || 100; // requests per minute

      // Simple demonstration - always allow for examples
      return true;
    },
    severity: 'warning' as const,
    errorMessage: 'Rate limit exceeded for cross-domain operation',
  },

  /**
   * Security validation for sensitive operations
   */
  securityValidation: {
    name: 'security-validation',
    description: 'Validates security requirements for domain operations',
    validator: async (operation: DomainOperation, context) => {
      // Check for sensitive operations
      if (operation.operationType === 'write' && operation.targetDomain === Domain.DATABASE) {
        // In real implementation, would check authentication/authorization
        return context.metadata?.authenticated === true;
      }
      return true;
    },
    severity: 'error' as const,
    errorMessage: 'Security validation failed for sensitive operation',
  },

  /**
   * Data consistency validation
   */
  dataConsistencyValidation: {
    name: 'data-consistency-validation',
    description: 'Ensures data consistency across domain boundaries',
    validator: async (operation: DomainOperation, context) => {
      // Validate that the input and output schemas are compatible
      if (operation.inputSchema.type === 'object' && operation.outputSchema.type === 'object') {
        // In real implementation, would perform deep compatibility check
        return true;
      }
      return operation.inputSchema.type === operation.outputSchema.type;
    },
    severity: 'warning' as const,
    errorMessage: 'Data consistency issue detected between input and output schemas',
  },
} as const;

// ============================================================================
// INTEGRATION EXAMPLES - Real-world usage patterns
// ============================================================================

/**
 * Example: Coordination domain validating agent assignment
 */
export async function coordinationDomainExample(): Promise<void> {
  logger.info('Running coordination domain boundary validation example');

  const coordValidator = getDomainValidator(Domain.COORDINATION);

  // 1. Validate agent data
  const agentData: Agent = {
    id: 'agent-coordination-001',
    capabilities: ['task-planning', 'resource-allocation', 'workflow-orchestration'],
    status: 'idle',
  };

  try {
    const validatedAgent = coordValidator.validateInput(agentData, CommonSchemas.Agent);
    logger.info('Agent validation successful', { agentId: validatedAgent.id });
  } catch (error) {
    logger.error('Agent validation failed', { error });
    return;
  }

  // 2. Validate task assignment with cross-domain operation
  const taskData: Task = {
    id: 'task-sparc-001',
    description: 'Execute SPARC methodology workflow',
    strategy: 'adaptive',
    dependencies: [],
    requiredCapabilities: ['task-planning', 'workflow-orchestration'],
    maxAgents: 3,
    requireConsensus: false,
  };

  const validatedTask = coordValidator.validateInput(taskData, CommonSchemas.Task);

  // 3. Track cross-domain operation to workflows
  coordValidator.trackCrossings(Domain.COORDINATION, Domain.WORKFLOWS, 'task-assignment');

  // 4. Validate phase assignment
  const phaseAssignment: PhaseAssignment = {
    phase: 'specification',
    agentId: agentData.id,
    capabilities: agentData.capabilities,
    status: 'pending',
  };

  const validatedPhaseAssignment = coordValidator.validateInput(
    phaseAssignment,
    ExtendedSchemas.PhaseAssignment
  );

  logger.info('Coordination domain validation completed successfully', {
    agent: validatedAgent.id,
    task: validatedTask.id,
    phase: validatedPhaseAssignment.phase,
  });
}

/**
 * Example: Workflows domain validating execution plans
 */
export async function workflowsDomainExample(): Promise<void> {
  logger.info('Running workflows domain boundary validation example');

  const workflowsValidator = getDomainValidator(Domain.WORKFLOWS);

  // 1. Validate workflow execution data
  const workflowExecution: WorkflowExecution = {
    id: 'exec-sparc-001',
    workflowId: 'workflow-sparc-methodology',
    status: 'running',
    startTime: new Date().toISOString(),
    currentStep: 1,
    totalSteps: 5,
    results: {},
    metrics: {
      stepsCompleted: 0,
      stepsFailed: 0,
      resourcesUsed: {
        agents: 2,
        computeTime: 150,
      },
    },
  };

  try {
    const validatedExecution = workflowsValidator.validateInput(
      workflowExecution,
      ExtendedSchemas.WorkflowExecution
    );
    logger.info('Workflow execution validation successful', {
      executionId: validatedExecution.id,
      status: validatedExecution.status,
    });
  } catch (error) {
    logger.error('Workflow execution validation failed', { error });
    return;
  }

  // 2. Validate workflow events
  const workflowEvent: WorkflowEvent = {
    type: 'step.completed',
    workflowId: workflowExecution.workflowId,
    stepIndex: 0,
    data: { stepName: 'specification', result: 'success' },
    timestamp: new Date().toISOString(),
  };

  const validatedEvent = workflowsValidator.validateInput(
    workflowEvent,
    ExtendedSchemas.WorkflowEvent
  );

  // 3. Track cross-domain operation back to coordination
  workflowsValidator.trackCrossings(Domain.WORKFLOWS, Domain.COORDINATION, 'status-update');

  logger.info('Workflows domain validation completed successfully', {
    execution: validatedExecution.id,
    event: validatedEvent.type,
  });
}

/**
 * Example: Contract enforcement for cross-domain operations
 */
export async function contractEnforcementExample(): Promise<void> {
  logger.info('Running contract enforcement example');

  const coordValidator = getDomainValidator(Domain.COORDINATION);

  // Define a cross-domain operation with comprehensive contract rules
  const crossDomainOperation: DomainOperation = {
    id: 'coord-to-workflow-execution',
    sourceDomain: Domain.COORDINATION,
    targetDomain: Domain.WORKFLOWS,
    operationType: 'execute',
    inputSchema: ExtendedSchemas.ExecutionPlan,
    outputSchema: ExtendedSchemas.WorkflowExecution,
    contractValidation: [
      ContractRules.agentCapabilityValidation,
      ContractRules.rateLimitValidation,
      ContractRules.dataConsistencyValidation,
    ],
    metadata: {
      description: 'Execute workflow from coordination domain',
      version: '1.0.0',
      rateLimit: 50,
      timeout: 30000,
    },
  };

  try {
    const result = await coordValidator.enforceContract(crossDomainOperation);

    if (result.success) {
      logger.info('Contract enforcement successful', {
        operationId: crossDomainOperation.id,
        validationTime: result.metadata?.validationTime,
      });
    } else {
      logger.error('Contract enforcement failed', {
        operationId: crossDomainOperation.id,
        error: result.error.message,
      });
    }
  } catch (error) {
    logger.error('Contract enforcement exception', { error });
  }
}

/**
 * Example: Performance monitoring and optimization
 */
export async function performanceMonitoringExample(): Promise<void> {
  logger.info('Running performance monitoring example');

  // Perform multiple validations to generate metrics
  const domains = [Domain.COORDINATION, Domain.WORKFLOWS, Domain.NEURAL, Domain.MEMORY];
  const schema: TypeSchema<string> = {
    type: 'string',
    required: true,
    description: 'performance-test',
  };

  for (const domain of domains) {
    const validator = getDomainValidator(domain);

    // Perform multiple validations
    for (let i = 0; i < 10; i++) {
      validator.validateInput(`test-data-${i}`, schema);
    }

    // Add some domain crossings
    for (let i = 0; i < 5; i++) {
      const targetDomain = domains[(domains.indexOf(domain) + 1) % domains.length];
      validator.trackCrossings(domain, targetDomain, `operation-${i}`);
    }
  }

  // Get system-wide statistics
  const systemStats = domainValidatorRegistry.getSystemStatistics();

  logger.info('System validation statistics', {
    totalDomains: systemStats.totalDomains,
    totalValidations: systemStats.systemTotalValidations,
    errorRate: systemStats.systemErrorRate,
    averageValidationTime: systemStats.systemAverageValidationTime,
  });

  // Get detailed statistics for each domain
  for (const [domain, stats] of systemStats.domainStatistics) {
    logger.info(`Domain statistics for ${domain}`, {
      validations: stats.totalValidations,
      errors: stats.totalErrors,
      errorRate: stats.errorRate,
      avgTime: stats.averageValidationTime,
      cacheSize: stats.cacheSize,
      crossings: stats.crossingCount,
    });
  }
}

/**
 * Example: Complex multi-domain workflow validation
 */
export async function complexMultiDomainExample(): Promise<void> {
  logger.info('Running complex multi-domain workflow example');

  // 1. Start with coordination domain - plan execution
  const executionPlan: ExecutionPlan = {
    taskId: 'complex-sparc-workflow',
    phases: ['specification', 'pseudocode', 'architecture', 'refinement', 'code'],
    phaseAssignments: [
      {
        phase: 'specification',
        agentId: 'agent-spec-001',
        capabilities: ['requirements-analysis', 'user-story-creation'],
        status: 'completed',
      },
      {
        phase: 'architecture',
        agentId: 'agent-arch-001',
        capabilities: ['system-design', 'architecture-review'],
        status: 'in_progress',
      },
    ],
    parallelizable: false,
    checkpoints: [],
  };

  // Validate in coordination domain
  const coordValidator = getDomainValidator(Domain.COORDINATION);
  const validatedPlan = coordValidator.validateInput(executionPlan, ExtendedSchemas.ExecutionPlan);

  // 2. Cross-domain validation to workflows
  const workflowData = validateCrossDomain(
    validatedPlan,
    ExtendedSchemas.ExecutionPlan,
    Domain.COORDINATION,
    Domain.WORKFLOWS,
    'execution-plan-transfer'
  );

  // 3. Validate workflow execution creation
  const workflowsValidator = getDomainValidator(Domain.WORKFLOWS);
  const workflowExecution: WorkflowExecution = {
    id: `exec-${validatedPlan.taskId}`,
    workflowId: validatedPlan.taskId,
    status: 'queued',
    startTime: new Date().toISOString(),
    currentStep: 0,
    totalSteps: validatedPlan.phases.length,
    results: {},
    metrics: {
      stepsCompleted: validatedPlan.phaseAssignments.filter((p) => p.status === 'completed').length,
      stepsFailed: validatedPlan.phaseAssignments.filter((p) => p.status === 'failed').length,
      resourcesUsed: {
        agents: validatedPlan.phaseAssignments.length,
        phases: validatedPlan.phases.length,
      },
    },
  };

  const validatedExecution = workflowsValidator.validateInput(
    workflowExecution,
    ExtendedSchemas.WorkflowExecution
  );

  // 4. Contract enforcement for neural domain integration
  const neuralIntegrationOperation: DomainOperation = {
    id: 'workflow-to-neural-optimization',
    sourceDomain: Domain.WORKFLOWS,
    targetDomain: Domain.NEURAL,
    operationType: 'transform',
    inputSchema: ExtendedSchemas.WorkflowExecution,
    outputSchema: {
      type: 'object',
      properties: { optimizationMetrics: { type: 'object' } },
    },
    contractValidation: [
      ContractRules.dataConsistencyValidation,
      ContractRules.rateLimitValidation,
    ],
    metadata: {
      description: 'Neural optimization of workflow execution',
      version: '1.0.0',
    },
  };

  const neuralValidator = getDomainValidator(Domain.NEURAL);
  const neuralResult = await neuralValidator.enforceContract(neuralIntegrationOperation);

  if (neuralResult.success) {
    logger.info('Complex multi-domain workflow validation completed successfully', {
      planId: validatedPlan.taskId,
      executionId: validatedExecution.id,
      neuralIntegration: 'success',
    });
  } else {
    logger.warn('Neural integration contract failed', {
      error: neuralResult.error.message,
    });
  }

  // 5. Get final statistics
  const finalStats = domainValidatorRegistry.getSystemStatistics();
  logger.info('Final system statistics', {
    totalValidations: finalStats.systemTotalValidations,
    averageTime: finalStats.systemAverageValidationTime,
  });
}

/**
 * Example: Error handling and recovery patterns
 */
export async function errorHandlingExample(): Promise<void> {
  logger.info('Running error handling example');

  const validator = getDomainValidator(Domain.CORE);

  // 1. Invalid type validation
  try {
    const invalidData = { id: 123, status: 'invalid-status' }; // id should be string, status invalid
    validator.validateInput(invalidData, CommonSchemas.Agent);
  } catch (error) {
    logger.info('Caught expected validation error', {
      errorType: error.constructor.name,
      message: error.message,
    });
  }

  // 2. Contract violation
  const failingRule: ContractRule = {
    name: 'always-fails',
    description: 'Rule that always fails for testing',
    validator: async () => false,
    severity: 'error',
    errorMessage: 'Test contract violation',
  };

  const failingOperation: DomainOperation = {
    id: 'failing-operation',
    sourceDomain: Domain.CORE,
    targetDomain: Domain.COORDINATION,
    operationType: 'read',
    inputSchema: { type: 'string' },
    outputSchema: { type: 'string' },
    contractValidation: [failingRule],
    metadata: {
      description: 'Operation designed to fail',
      version: '1.0.0',
    },
  };

  const contractResult = await validator.enforceContract(failingOperation);
  if (!contractResult.success) {
    logger.info('Caught expected contract violation', {
      operationId: failingOperation.id,
      error: contractResult.error.message,
    });
  }

  // 3. Recovery and continued operation
  logger.info('Demonstrating system resilience - continuing after errors');

  const validData: Agent = {
    id: 'recovery-agent',
    capabilities: ['error-recovery'],
    status: 'idle',
  };

  const recoveredAgent = validator.validateInput(validData, CommonSchemas.Agent);
  logger.info('System recovered successfully', {
    agentId: recoveredAgent.id,
  });
}

/**
 * Run all integration examples
 */
export async function runAllExamples(): Promise<void> {
  logger.info('='.repeat(80));
  logger.info('DOMAIN BOUNDARY VALIDATOR INTEGRATION EXAMPLES');
  logger.info('='.repeat(80));

  try {
    await coordinationDomainExample();
    logger.info('-'.repeat(40));

    await workflowsDomainExample();
    logger.info('-'.repeat(40));

    await contractEnforcementExample();
    logger.info('-'.repeat(40));

    await performanceMonitoringExample();
    logger.info('-'.repeat(40));

    await complexMultiDomainExample();
    logger.info('-'.repeat(40));

    await errorHandlingExample();
    logger.info('-'.repeat(40));

    logger.info('All integration examples completed successfully');

    // Final system reset for cleanup
    domainValidatorRegistry.resetAll();
    logger.info('System reset completed');
  } catch (error) {
    logger.error('Integration examples failed', { error });
    throw error;
  } finally {
    logger.info('='.repeat(80));
  }
}

// Export for use in other parts of the system
export { ContractRules, ExtendedSchemas };
