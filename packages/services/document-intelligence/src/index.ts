/**
 * @fileoverview Document Processing Package
 *
 * Provides document workflow and processing capabilities for Claude Code Zen.
 * Moved from core to maintain clean separation between generic document
 * processing and SAFe-specific coordination.
 */

export type * from './document-driven-system';
export { DocumentDrivenSystem } from './document-driven-system';
export type * from './document-workflow-system';
// Legacy export for backward compatibility
export {
  DocumentWorkflowSystem,
  DocumentWorkflowSystem as ProductFlowSystem,
} from './document-workflow-system';

// Document workflow service - moved from coordination
export { DocumentWorkflowService } from './services/document-workflow-service';
export type {
  DocumentContent,
  DocumentWorkflowDefinition,
  DocumentWorkflowStep,
  DocumentWorkflowResult,
} from './services/document-workflow-service';

// Document task coordination
export { DocumentTaskCoordinator } from './services/document-task-coordinator';
export { StrategicVisionService } from './services/strategic-vision-service';
