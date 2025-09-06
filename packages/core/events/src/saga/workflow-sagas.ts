/**
 * @fileoverview Predefined Saga Workflows for Document Intelligence Integration
 * 
 * Defines standard saga workflows for external document import and cross-package coordination
 */

import type { SagaStep, SagaWorkflow, CorrelationContext } from './correlation-tracker.js';
import { globalSagaManager } from './correlation-tracker.js';

// =============================================================================
// EXTERNAL DOCUMENT IMPORT SAGA
// =============================================================================

/**
 * Complete external document import saga workflow
 * 
 * Flow: External Document → Brain Analysis → Document Intelligence Processing → Coordination Integration → SAFe Integration
 */
export function createExternalDocumentImportSaga(
  correlationContext: CorrelationContext,
  documentData: {
    documentId: string;
    sourceType: string;
    targetProjectId: string;
    importType: string;
  }
): SagaWorkflow {
  const steps: Omit<SagaStep, 'stepId' | 'state' | 'retryCount'>[] = [
    {
      stepName: 'brain-document-analysis',
      service: 'brain',
      operation: 'analyze-external-document',
      input: {
        documentId: documentData.documentId,
        sourceType: documentData.sourceType,
        analysisType: 'import-readiness',
      },
      maxRetries: 3,
      compensationAction: 'brain:rollback-document-analysis',
    },
    {
      stepName: 'coordination-import-approval',
      service: 'coordination',
      operation: 'approve-import-request',
      input: {
        documentId: documentData.documentId,
        targetProjectId: documentData.targetProjectId,
        importType: documentData.importType,
      },
      maxRetries: 2,
      compensationAction: 'coordination:revoke-import-approval',
    },
    {
      stepName: 'document-intelligence-processing',
      service: 'document-intelligence',
      operation: 'process-external-import',
      input: {
        documentId: documentData.documentId,
        processingType: documentData.importType,
        targetProjectId: documentData.targetProjectId,
      },
      maxRetries: 3,
      compensationAction: 'document-intelligence:cleanup-import-artifacts',
    },
    {
      stepName: 'coordination-safe-integration',
      service: 'coordination',
      operation: 'integrate-with-safe-project',
      input: {
        documentId: documentData.documentId,
        targetProjectId: documentData.targetProjectId,
        integrationMode: 'enhance-existing',
      },
      maxRetries: 2,
      compensationAction: 'coordination:rollback-safe-integration',
    },
    {
      stepName: 'brain-completion-notification',
      service: 'brain',
      operation: 'notify-import-complete',
      input: {
        documentId: documentData.documentId,
        sagaId: 'TBD', // Will be filled by saga manager
      },
      maxRetries: 1,
      compensationAction: 'brain:cleanup-import-metadata',
    },
  ];

  return globalSagaManager.initiateSaga(
    'document-import',
    correlationContext,
    steps,
    {
      description: `External document import for ${documentData.importType}`,
      priority: 'medium',
      timeout: 300000, // 5 minutes
      stakeholders: ['document-intelligence', 'coordination', 'brain'],
      businessContext: {
        documentType: documentData.sourceType,
        targetProject: documentData.targetProjectId,
        importCategory: documentData.importType,
      },
    }
  );
}

// =============================================================================
// CROSS-PACKAGE COORDINATION SAGA
// =============================================================================

/**
 * Cross-package coordination saga for complex workflows
 * 
 * Flow: Brain Request → Coordination Orchestration → Multiple Service Coordination → Result Integration
 */
export function createCrossPackageCoordinationSaga(
  correlationContext: CorrelationContext,
  coordinationData: {
    requestType: 'safe-workflow' | 'sparc-phase-transition' | 'resource-allocation';
    initiatingService: 'brain' | 'document-intelligence' | 'web-interface';
    targetServices: string[];
    workflowContext: Record<string, unknown>;
  }
): SagaWorkflow {
  const steps: Omit<SagaStep, 'stepId' | 'state' | 'retryCount'>[] = [
    {
      stepName: 'coordination-request-validation',
      service: 'coordination',
      operation: 'validate-cross-package-request',
      input: {
        requestType: coordinationData.requestType,
        initiatingService: coordinationData.initiatingService,
        targetServices: coordinationData.targetServices,
      },
      maxRetries: 2,
      compensationAction: 'coordination:invalidate-request',
    },
    {
      stepName: 'resource-allocation',
      service: 'coordination',
      operation: 'allocate-cross-package-resources',
      input: {
        requestType: coordinationData.requestType,
        resourceRequirements: coordinationData.workflowContext,
      },
      maxRetries: 3,
      compensationAction: 'coordination:deallocate-resources',
    },
    // Dynamic steps based on target services
    ...coordinationData.targetServices.map((service, index) => ({
      stepName: `service-coordination-${service}`,
      service: service as SagaStep['service'],
      operation: `coordinate-${coordinationData.requestType}`,
      input: {
        coordinationRequest: coordinationData.workflowContext,
        serviceRole: service,
      },
      maxRetries: 2,
      compensationAction: `${service}:rollback-coordination`,
    })),
    {
      stepName: 'coordination-result-integration',
      service: 'coordination',
      operation: 'integrate-coordination-results',
      input: {
        requestType: coordinationData.requestType,
        participatingServices: coordinationData.targetServices,
      },
      maxRetries: 2,
      compensationAction: 'coordination:discard-coordination-results',
    },
  ];

  return globalSagaManager.initiateSaga(
    'cross-package-coordination',
    correlationContext,
    steps,
    {
      description: `Cross-package coordination for ${coordinationData.requestType}`,
      priority: 'high',
      timeout: 180000, // 3 minutes
      stakeholders: ['coordination', ...coordinationData.targetServices],
      businessContext: {
        requestType: coordinationData.requestType,
        initiatingService: coordinationData.initiatingService,
        scope: 'cross-package',
      },
    }
  );
}

// =============================================================================
// SAFE ARTIFACT CREATION SAGA
// =============================================================================

/**
 * SAFe artifact creation saga (for web interface workflows)
 * 
 * Flow: Web Request → Coordination Validation → Brain Enhancement → SAFe Integration → Completion
 */
export function createSafeArtifactCreationSaga(
  correlationContext: CorrelationContext,
  artifactData: {
    artifactType: 'epic' | 'feature' | 'story' | 'capability';
    projectId: string;
    creationContext: 'web-interface' | 'imported-enhancement';
    artifactData: Record<string, unknown>;
  }
): SagaWorkflow {
  const steps: Omit<SagaStep, 'stepId' | 'state' | 'retryCount'>[] = [
    {
      stepName: 'coordination-artifact-validation',
      service: 'coordination',
      operation: 'validate-safe-artifact-request',
      input: {
        artifactType: artifactData.artifactType,
        projectId: artifactData.projectId,
        creationContext: artifactData.creationContext,
      },
      maxRetries: 2,
      compensationAction: 'coordination:reject-artifact-request',
    },
    // Only include brain enhancement if this is web-interface created
    ...(artifactData.creationContext === 'web-interface' ? [{
      stepName: 'brain-artifact-enhancement',
      service: 'brain' as const,
      operation: 'enhance-safe-artifact',
      input: {
        artifactType: artifactData.artifactType,
        artifactData: artifactData.artifactData,
      },
      maxRetries: 2,
      compensationAction: 'brain:remove-artifact-enhancements',
    }] : []),
    {
      stepName: 'coordination-safe-integration',
      service: 'coordination',
      operation: 'create-safe-artifact',
      input: {
        artifactType: artifactData.artifactType,
        projectId: artifactData.projectId,
        artifactData: artifactData.artifactData,
      },
      maxRetries: 3,
      compensationAction: 'coordination:delete-safe-artifact',
    },
    {
      stepName: 'coordination-stakeholder-notification',
      service: 'coordination',
      operation: 'notify-artifact-created',
      input: {
        artifactType: artifactData.artifactType,
        projectId: artifactData.projectId,
        creationContext: artifactData.creationContext,
      },
      maxRetries: 1,
      compensationAction: 'coordination:cancel-notifications',
    },
  ];

  return globalSagaManager.initiateSaga(
    'safe-artifact-creation',
    correlationContext,
    steps,
    {
      description: `SAFe ${artifactData.artifactType} creation via ${artifactData.creationContext}`,
      priority: 'medium',
      timeout: 120000, // 2 minutes
      stakeholders: ['coordination', 'brain', 'web-interface'],
      businessContext: {
        artifactType: artifactData.artifactType,
        projectId: artifactData.projectId,
        creationMethod: artifactData.creationContext,
      },
    }
  );
}

// =============================================================================
// SAGA WORKFLOW FACTORY
// =============================================================================

/**
 * Factory for creating common saga workflows
 */
export class SagaWorkflowFactory {
  /**
   * Create external document import saga
   */
  static createDocumentImport(
    correlationContext: CorrelationContext,
    documentData: Parameters<typeof createExternalDocumentImportSaga>[1]
  ) {
    return createExternalDocumentImportSaga(correlationContext, documentData);
  }

  /**
   * Create cross-package coordination saga
   */
  static createCrossPackageCoordination(
    correlationContext: CorrelationContext,
    coordinationData: Parameters<typeof createCrossPackageCoordinationSaga>[1]
  ) {
    return createCrossPackageCoordinationSaga(correlationContext, coordinationData);
  }

  /**
   * Create SAFe artifact creation saga
   */
  static createSafeArtifactCreation(
    correlationContext: CorrelationContext,
    artifactData: Parameters<typeof createSafeArtifactCreationSaga>[1]
  ) {
    return createSafeArtifactCreationSaga(correlationContext, artifactData);
  }
}

// =============================================================================
// SAGA EVENT HELPERS
// =============================================================================

/**
 * Helper to emit saga progress events
 */
export function emitSagaProgressEvent(
  sagaId: string,
  stepId: string,
  eventType: 'step-started' | 'step-completed' | 'step-failed' | 'saga-completed' | 'saga-failed',
  eventData: Record<string, unknown> = {}
): void {
  const saga = globalSagaManager.getSaga(sagaId);
  if (!saga) return;

  // This would integrate with the foundation EventBus
  console.log(`Saga Progress: ${eventType}`, {
    sagaId,
    stepId,
    workflowType: saga.workflowType,
    correlationId: saga.correlationId,
    ...eventData,
  });
}