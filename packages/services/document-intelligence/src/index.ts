// =============================================================================
// PRIMARY EVENT-DRIVEN EXPORTS - Foundation powered with brain coordination
// =============================================================================

export {
createEventDrivenDocumentIntelligence,
EventDrivenDocumentIntelligence,
EventDrivenDocumentIntelligence as default,
} from './document-intelligence-event-driven.js';

// =============================================================================
// LEGACY EXPORTS - Backward compatibility (DEPRECATED)
// =============================================================================

/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export type * from './document-driven-system';
/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export { DocumentDrivenSystem } from './document-driven-system';
/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export type * from './document-workflow-system';
/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export {
DocumentWorkflowSystem,
DocumentWorkflowSystem as ProductFlowSystem,
} from './document-workflow-system';

/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export { DocumentWorkflowService } from './services/document-workflow-service';
/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export type {
DocumentContent,
DocumentWorkflowDefinition,
DocumentWorkflowStep,
DocumentWorkflowResult,
} from './services/document-workflow-service';

/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export { DocumentTaskCoordinator } from './services/document-task-coordinator';
/**
* @deprecated Use EventDrivenDocumentIntelligence instead for event-based brain coordination
*/
export { StrategicVisionService } from './services/strategic-vision-service';
