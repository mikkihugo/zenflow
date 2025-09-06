/**
 * @fileoverview Predefined Saga Workflows (Foundation)
 *
 * Defines standard saga workflows for external document import and cross-package coordination.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalSagaManager, type SagaStep, type SagaWorkflow, type CorrelationContext } from './correlation-tracker.js';

// External Document Import Saga
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
  } as unknown as SagaStep,
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
  } as unknown as SagaStep,
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
  } as unknown as SagaStep,
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
  } as unknown as SagaStep,
    {
      stepName: 'brain-completion-notification',
      service: 'brain',
      operation: 'notify-import-complete',
      input: {
        documentId: documentData.documentId,
        sagaId: 'TBD',
      },
      maxRetries: 1,
      compensationAction: 'brain:cleanup-import-metadata',
  } as unknown as SagaStep,
  ];

  return globalSagaManager.initiateSaga(
    'document-import',
    correlationContext,
    steps,
    {
      description: `External document import for ${documentData.importType}`,
      priority: 'medium',
      timeout: 300000,
      stakeholders: ['document-intelligence', 'coordination', 'brain'],
      businessContext: {
        documentType: documentData.sourceType,
        targetProject: documentData.targetProjectId,
        importCategory: documentData.importType,
      },
    }
  );
}

// Cross-Package Coordination Saga
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
  } as unknown as SagaStep,
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
  } as unknown as SagaStep,
  ...coordinationData.targetServices.map((service) => ({
      stepName: `service-coordination-${service}`,
      service: service as SagaStep['service'],
      operation: `coordinate-${coordinationData.requestType}`,
      input: {
        coordinationRequest: coordinationData.workflowContext,
        serviceRole: service,
      },
      maxRetries: 2,
      compensationAction: `${service}:rollback-coordination`,
  })) as unknown as SagaStep[],
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
  } as unknown as SagaStep,
  ];

  return globalSagaManager.initiateSaga(
    'cross-package-coordination',
    correlationContext,
    steps,
    {
      description: `Cross-package coordination for ${coordinationData.requestType}`,
      priority: 'high',
      timeout: 180000,
      stakeholders: ['coordination', ...coordinationData.targetServices],
      businessContext: {
        requestType: coordinationData.requestType,
        initiatingService: coordinationData.initiatingService,
        scope: 'cross-package',
      },
    }
  );
}

// SAFe Artifact Creation Saga
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
    } as any,
    ...(artifactData.creationContext === 'web-interface'
      ? ([
          {
            stepName: 'brain-artifact-enhancement',
            service: 'brain' as const,
            operation: 'enhance-safe-artifact',
            input: {
              artifactType: artifactData.artifactType,
              artifactData: artifactData.artifactData,
            },
            maxRetries: 2,
            compensationAction: 'brain:remove-artifact-enhancements',
          },
        ] as any)
      : ([] as any)),
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
    } as any,
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
    } as any,
  ];

  return globalSagaManager.initiateSaga(
    'safe-artifact-creation',
    correlationContext,
    steps,
    {
      description: `SAFe ${artifactData.artifactType} creation via ${artifactData.creationContext}`,
      priority: 'medium',
      timeout: 120000,
      stakeholders: ['coordination', 'brain', 'web-interface'],
      businessContext: {
        artifactType: artifactData.artifactType,
        projectId: artifactData.projectId,
        creationMethod: artifactData.creationContext,
      },
    }
  );
}

export class SagaWorkflowFactory {
  static createDocumentImport(
    correlationContext: CorrelationContext,
    documentData: Parameters<typeof createExternalDocumentImportSaga>[1]
  ) {
    return createExternalDocumentImportSaga(correlationContext, documentData);
  }
  static createCrossPackageCoordination(
    correlationContext: CorrelationContext,
    coordinationData: Parameters<typeof createCrossPackageCoordinationSaga>[1]
  ) {
    return createCrossPackageCoordinationSaga(correlationContext, coordinationData);
  }
  static createSafeArtifactCreation(
    correlationContext: CorrelationContext,
    artifactData: Parameters<typeof createSafeArtifactCreationSaga>[1]
  ) {
    return createSafeArtifactCreationSaga(correlationContext, artifactData);
  }
}

export function emitSagaProgressEvent(
  sagaId: string,
  stepId: string,
  eventType: 'step-started' | 'step-completed' | 'step-failed' | 'saga-completed' | 'saga-failed',
  eventData: Record<string, unknown> = {}
): void {
  const saga = globalSagaManager.getSaga(sagaId);
  if (!saga) return;
  // Placeholder: integrate with EventBus logging or metrics if needed
  void stepId;
  void eventType;
  void eventData;
}
