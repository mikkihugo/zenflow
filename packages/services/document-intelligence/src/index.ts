/**
 * @fileoverview Document Intelligence Service - External Document Import and Integration
 * 
 * **PRIMARY PURPOSE: EXTERNAL DOCUMENT IMPORT INTO EXISTING SAFe PROJECTS**
 * 
 * This service is designed to process and import external documents into existing SAFe projects
 * created via the web interface. It is NOT the primary method for creating epics/features/stories.
 * 
 * **Use Cases:**
 * - Import external vision documents from stakeholders
 * - Process legacy requirements documents for project integration  
 * - Transform external PRDs into SAFe-compatible artifacts
 * - Analyze and extract insights from imported content
 * - Integrate external documentation into existing project structures
 * 
 * **NOT for:**
 * - Primary epic/feature creation (use web interface)
 * - Day-to-day SAFe artifact management (use web interface)
 * - Creating new SAFe projects from scratch (use web interface)
 * 
 * **Architecture Role:**
 * External Documents → Document Intelligence → Analysis & Transformation → Integration into Existing SAFe Projects
 * 
 * @version 1.0.0
 * @author Claude Code Zen Team
 */

// =============================================================================
// PRIMARY EVENT-DRIVEN EXPORTS - External Document Import Service
// =============================================================================

export {
createEventDrivenDocumentIntelligence,
EventDrivenDocumentIntelligence,
EventDrivenDocumentIntelligence as default,
} from './document-intelligence-event-driven.js';

// Event module wrapper for external integration
export {
  DocumentIntelligenceEventWrapper,
  createDocumentIntelligenceWrapper,
  getDocumentIntelligenceWrapper,
  shutdownGlobalWrapper
} from './event-module-wrapper.js';

export type {
EventDrivenDocumentIntelligenceConfig,
DocumentImportRequest,
DocumentImportResult,
ContentAnalysisRequest,
ContentAnalysisResult,
RequirementsExtractionRequest,
RequirementsExtractionResult,
WorkflowExecutionRequest,
WorkflowExecutionResult,
DocumentIntelligenceServiceEvents
} from './document-intelligence-event-driven.js';

// Event wrapper types for external integration
export type {
  ExternalDocumentImportRequest,
  ExternalDocumentImportResult,
  ExternalWorkflowExecutionRequest,
  ExternalContentAnalysisRequest,
  ExternalContentAnalysisResult
} from './event-module-wrapper.js';

// =============================================================================
// CORE DOCUMENT IMPORT TYPES
// =============================================================================

/**
 * External document import types
 */
export interface ExternalDocumentImport {
  sourceType: 'file-upload' | 'url-import' | 'email-attachment' | 'api-import';
  originalFormat: 'pdf' | 'docx' | 'md' | 'txt' | 'html' | 'confluence' | 'notion';
  targetProjectId: string; // Existing SAFe project to import into
  importType: 'vision-enhancement' | 'requirements-supplement' | 'stakeholder-input' | 'legacy-documentation';
}

/**
 * SAFe project integration context
 */
export interface SafeProjectIntegrationContext {
  projectId: string; // Existing project created via web interface
  integrationMode: 'enhance-existing' | 'create-new-artifacts' | 'merge-content';
  targetArtifacts: Array<'epic' | 'feature' | 'story' | 'capability' | 'enabler'>;
  stakeholderContext: {
    importedBy: string;
    approvalRequired: boolean;
    reviewers: string[];
  };
}

// =============================================================================
// MODERN EXTERNAL DOCUMENT IMPORT SERVICE
// =============================================================================