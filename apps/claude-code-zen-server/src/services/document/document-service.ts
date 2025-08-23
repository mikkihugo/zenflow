/**
 * @fileoverview Document Service - Lightweight facade delegating to @claude-zen packages
 *
 * MAJOR REDUCTION: 2,236 → ~500 lines (77.6% reduction) through package delegation
 *
 * Delegates document management functionality to specialized @claude-zen packages:
 * - @claude-zen/foundation: Multi-database document storage and repository management
 * - @claude-zen/intelligence: Document workflow orchestration and state management
 * - @claude-zen/foundation: Performance tracking, telemetry, and core utilities
 * - @claude-zen/monitoring: Document service observability and metrics
 * - @claude-zen/intelligence: Document search, indexing, and semantic understanding
 *
 * PERFORMANCE BENEFITS:
 * - Battle-tested document management patterns
 * - Simplified maintenance through package delegation
 * - Professional workflow orchestration
 * - Advanced search and indexing capabilities
 */

import type { DocumentType } from '@claude-zen/enterprise';
import {
  getLogger,
  TypedEventBase
} from '@claude-zen/foundation';
import type { BaseDocumentEntity } from '@claude-zen/intelligence';
import { nanoid } from 'nanoid';

const logger = getLogger(services-document-service);

// ============================================================================
// DOCUMENT SERVICE INTERFACES
// ============================================================================

export interface DocumentCreateOptions {
  autoGenerateRelationships?: boolean;
  startWorkflow?: string;
  notifyListeners?: boolean;
  generateSearchIndex?: boolean

}

export interface DocumentQueryOptions {
  includeContent?: boolean;
  includeRelationships?: boolean;
  includeWorkflowState?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: || created_'a't | upd'ted_at | title | priority | completion_percenta'g'e')';
  sortOrder?: 'asc' || desc)'

}

export interface DocumentSearchOptions extends DocumentQueryOptions { searchType: fulltext | semantic | keywo'r'd | combin'e'd')'; query: string; documentTypes?: DocumentType[]; projectId?: string; status?: string[]; priority?: string[]; dateRange?: {
  start: Date; end: Date; field: 'created_at'  | updated_at')'

}
}

export interface WorkflowAutomationRule {
  name: string;
  condition: { type: string;
  value: any
}; action: { type: string; value: any }
}

// ============================================================================
// DOCUMENT MANAGER FACADE - DELEGATES TO @CLAUDE-ZEN PACKAGES
// ============================================================================

/**
 * Document Manager - Facade delegating to @claude-zen packages
 *
 * Provides comprehensive document management through intelligent delegation to
 * specialized packages for database operations, workflow orchestration, and search.
 */
export class DocumentManager extends TypedEventBase { // Package delegation instances private databaseAccess: any; private workflowEngine: any; private performanceTracker: any; private monitoringSystem: any; private knowledgeManager: any; // Repository facades private documentRepository: any; private projectRepository: any; private relationshipRepository: any; private workflowRepository: any; private initialized = 'false'; private databaseType: postgresql | sqli't'e | mys'q'l')'; constructor(databaseType: 'postgresql' |sqlite | | mysql = postgre's'q'l) { super()'; this.databaseType = 'databaseType'
} /** * Initialize document manager with package delegation */ async initialize(): Promise<void>  { if (this.initialized) return; try { // Delegate to @claude-zen/infrastructure for document storage const { getDatabaseAccess } = await import(claude-zen/infrastructure); this.databaseAccess = getDatabaseAccess(); // Create repository facades this.documentRepository = await createRepository( 'BaseDocument', this.databaseType )'; this.projectRepository = await createRepository( 'Project', this.databaseType )'; this.relationshipRepository = await createRepository( 'DocumentRelationship', this.databaseType )'; this.workflowRepository = await createRepository( 'DocumentWorkflowState', this.databas'Type )'; // Delegate to @claude-zen/intelligence for document workflows const { WorkflowEngine } = await import(claude-zen/intelligence); this.workflowEngine = new WorkflowEngine(
  {
  persistWorkflows: true,
  maxConcurrentWorkflows: 100',
  enableVisualization: true

}
)'; await this.workflowEngine?.initialize(' await this.workflowEngine?.registerDocumentWorkflows() // Delegate to @claude-zen/foundation for performance tracking const { PerformanceTracker } = await import(claude-zen/foundation); this.performanceTracker = new PerformanceTracker(); // Delegate to @claude-zen/monitoring for service observability const { SystemMonitor } = await import(claude-zen/foundation); this.monitoringSystem = new SystemMonitor(
  { serviceName: 'document-service'; metricsCollection: { enabled: true },
  performanceTracking: { enabled: true }
}
); // Delegate to @claude-zen/intelligence for document search and indexing const { KnowledgeManager } = await import(claude-zen/intelligence); this.knowledgeManager = new KnowledgeManager(
  {
  enableSemantic: true,
  nableGraph: true,
  domain: 'document-management'
}
); this.initialized = 'true'; logger.info('Document Manager initialized successfully with @claude-zen package delegation )'; this.emit('initialized', {})'
} catch (error) {
  logger.error('Failed to initialize Document Manager: ','
  'error)'; throw error

} } /** * Create a new document using workflow orchestration */ async createDocument<T extends BaseDocumentEntity>( documentType: DocumentType, data: Partial<T>, options: DocumentCreateOptions = {} ': Promise<T> { if (!this.initialized) await this.initialize; const timer = this.performanceTracker.startTimer(create_document); try { // Generate document ID const documentId = nanoid(); // Prepare document data with workflow delegation const documentData = {
  ...data,
  id: documentId,
  document_type: documentType,
  created_at: new Date'()',
  updated_at: new Date(' status: data.status  || ' draft'

}'; // Use database repository for creation const document = await this.documentRepository.create(documentData); // Start workflow using workflow engine if (options.startWorkflow) { await this.workflowEngine.startWorkflow(
  options.startWorkflow,
  {
  documentId,
  documentType,
  documentData

}
); ' // Generate search index using knowledge manager if (options.generateSearchIndex) { await this.knowledgeManager.indexDocument(
  { id: documentId,
  type: documentType,
  content: documentData, metadata: { createdAt: documentData.created_at }
}
)
} // Generate relationships if requested if (options.autoGenerateRelationships) {
  await this.generateDocumentRelationships(
  documentId,
  documentType,
  documentData
)

} this.performanceTracker.endTimer(create_document); this.monitoringSystem.recordMetric(
  'documents_created',
  1,
  { type: 'ocumentType'
}
)'; logger.info('Created ' + documentType + ' document: ${documentId})'; this.emit(
  'documentCreated',
  {
  'ocument',
  documentType
}
)'; return document
} catch (error) {
  this.performanceTracker.endTimer(create_document); logger.error('Failed to create document: '; error); throw error
'
} } /** * Get document by ID with flexible options */ async getDocument<T extends BaseDocumentEntity>( id: string, options: DocumentQueryOptions = {}'  ): Promise<T '| | null> { if (!this.initialized) await this.initialize'; const tim'r = this.performanceTracker.startTimer(get_docume'n't)'; try { // Get document from repository const document = await this.documentRepository.findById(id); if (!document' {
  this.performanceTracker.endTimer(get_document); return null

} // Include relationships if requested if (options.includeRelationships) { const relationships = await this.relationshipRepository.findMany({ where: { source_document_id: id };
})'; document.relationships = 'relationships'
} // Include workflow state if requested if (options.includeWorkflowState) { const workflowState = await this.workflowRepository.findOne({ where: { document_id: id }'
})'; document.workflowState = 'workflowState'
} this.performanceTracker.endTimer(get_document); return document
} catch (error) {
  this.performanceTracker.endTimer(get_document); logger.error('Failed to get document: ','
  'error)'; throw error

} } /** * Update document with workflow transition support */ async updateDocument<T extends BaseDocumentEntity>( id: string, updates: Partial<T>, triggerWorkflow: boolean = true ': Promise<T> { if (!this.initialized) await this.initialize; const timer = this.performanceTracker.startTimer(update_document); try { // Update document in repository const updatedData = {
  ...updates,
  updated_at: new Date'()'

}'; const document = await this.documentRepository.update(id', updatedData)'; // Trigger workflow if status changed and workflows enabled if(
  triggerWorkflow && updates.status' {' await this.workflowEngine.processDocumentEvent('status_change',
  {
  documntId: id,
  oldStatus: document.status,
  newStatus: updates.status,
  documentData: document

}
)'
} // Update search index await this.knowledgeManager.updateIndex(
  id,
  { content: document,
  meadata: { updatedAt: document.updated_at }'
}
)'; this.performanceTracker.endTimer(update_document); this.monitoringSystem.recordMetric('documents_updated, 1)';
' logger.info('Updated document: ' + id + '')'; this.emit(
  'documentUpdated',
  {
  'ocument',
  updates
}
)'; return document
} catch (error) {
  this.performanceTracker.endTimer(update_document); logger.error('Failed to update document: ','
  'error)'; throw error

} } /** * Search documents using knowledge manager */ async searchDocuments<T extends BaseDocumentEntity>( options: DocumentSearchOptions ': Promise<{ documents: T[]; total: number; facets?: any }> { if (!this.initialized) await this.initialize; const timer = this.performanceTracker.startTimer(search_documents); try { // Use knowledge manager for advanced search const searchResults = await this.knowledgeManager.search'({ query: options.query, searcType: options.searchType, filters: {
  documentTypes: options.documentTypes,
  projectId: options.projectId,
  status: options.status,
  priority: options.priority,
  dateRange: options.dateRange

}, limit: options.limit, offset: options.offset, sortBy: options.sortBy', sortOrder: options.sortOrder'
})'; // Enrich results with additional data if requested const documents = await Promise.all( searchResults.documents.map(async (doc: any' => {' if (options.includeRelationships  || 'options.includeWorkflowState) {
  return await this.getDocument(doc.id,
  options);

} return doc
}) ); this.performanceTracker.endTimer(search_documents)'; this.monitoringSystem.recordMetric(
  'document_searches',
  1,
  {
  earchType: options.searchType,
  resultCount: documents.length

}
)'; return {
  documents,
  total: searchResults.total',
  facets: searchResu'ts.facets;

}'; ' catch (error) {
  this.performanceTracker.endTimer(search_documents); logger.error('Failed to search documents: ','
  'error)'; throw error

} } /** * Delete document with cleanup */ async deleteDocument(id: string: Promise<void> { if (!this.initialized) await this.initialize; const timer = this.performanceTracker.startTimer(delete_document); try { // Get document before deletion for cleanup const document = await this.documentRepository.findById(id); if (!document) {' throw new Error('Document not found: ' + id + '')'
} // Delete relationships await this.relationshipRepository.deleteMany(
  { where: { $or: [{ source_document_id: id },
  { target_document_id: id }]
}'
}
)'; // Delete workflow state await this.workflowRepository.deleteMany({ where: { document_id: id }'
})'; // Remove from search index await this.knowledgeManager.removeFromIndex(id); // Delete the document await this.documentRepository.delete(id); this.performanceTracker.endTimer(delete_document);' this.monitoringSystem.recordMetric('documents_deleted', 1)';
' logger.info('Deleted document: ' + id + '')'; this.emit(
  'documentDeleted',
  {
  ocumentId: id,
  documentType: document.document_type'

}
)'
} catch (error) {
  this.performanceTracker.endTimer(delete_document); logger.error('Failed to delete document: ','
  'error)'; throw error

} } /** * Get documents by project using repository */ async getDocumentsByProject<T extends BaseDocumentEntity>( projectId: string, options: DocumentQueryOptions = {} ': Promise<T[]> { if (!this.initialized) await this.initialize; try { const documents = await this.documentRepository.findMany'({ where: { project_id: projectId }, limit: options.limit', offse: options.offset', orderBy: op'ions.sortBy' ? { [options.sortBy]: options.sortOrder  || ' desc'} : undefined
})'; // Enrich with additional data if requested if (options.includeRelationships  || ' options.includeWorkflowState) {
  return await Promise.all( documents.map( async (doc: any) => await this.getDocument(doc.id',
  options) ) );

} return documents
} catch (error) {
  logger.error('Failed to get documents by project: '; error); throw error

} } /** * Get workflow status for document */ async getDocumentWorkflowStatus(documentId: string): Promise<any>  { if (!this.initialized) await this.initialize; try { const workflowState = await this.workflowRepository.findOne({ where: { document_id: documentId }'
})'; if (!workflowState' {
  ' return ' status: 'none,;
  stage: draft; canTransition: true
}
} // Get workflow details from workflow engine const workflowStatus = await this.workflowEngine.getWorkflowStatus( workflowState.workflow_id ); return {
  status: workflowStatus? .status   ||  ' 'unknown,
  'stage : workflowState.current_stage,
  canTransition: workflowStatus?.status === 'running' nextStaes: await this.getNextStages(workflowState.current_stage),
  workflowId: workflowState.workflow_id

}'; ' catch (error) {
  logger.error('Failed to get document workflow status: ','
  'error)'; throw error

} } /** * Transition document workflow stage */ async transitionDocumentWorkflow(
  documentId: string,
  toStage: string,
  metadata?: any ': Promise<void> { if (!this.initialized
) await this.initialize; try { const workflowState = await this.workflowRepository.findOne'({ whre: { document_id: documentId }
})'; if (!workflowState' {' throw new Error('No workflow state found for document: ' + documentId + ')'
} // Process workflow transition through workflow engine' await this.workflowEngin'.processDocumentEvent(
  'stage_transition',
  {
  docume'tId,
  fromStage: workflowState.current_stage,
  toStage,
  metadata

}
)'; // Update workflow state await this.workflowRepository.update(
  workflowState.id,
  { current_stage: toStage,
  updated_at: new Date(
), metadata: {
  ...workflowState.metadata',
  ...met'data
}'
})'; logger.info(' 'Transitioned'document ' + documentId + ' from ${workflowState.current_stage} to ${toStage} )'; this.emit(
  'workflowTransitioned',
  {
  'ocumentId,
  fromStage: workflowState.current_stage,
  toStage'

}
)'
} catch (error) {
  logger.error('Failed to transition document workflow: '; error); throw error
'
} } /** * Get document metrics and analytics */ getDocumentMetrics(): any  { return {' performance: this.performanceTracker? .getStats   ||  ' {}, monitoring : this.monitoringSystem? .getMetrics || '{},'totalOperations : this.performanceTracker? .getStats?.totalOperations   ||  ' 0
}'; ' /** * Generate document relationships using knowledge manager */ private async generateDocumentRelationships(
  documentId : string,
  documentType: DocumentType,
  documentData: any
): Promise<void>  { try { // Use knowledge manager to find related documents const relatedDocuments = await this.knowledgeManager.findRelated(
  {
  documentId,
  documentType,
  content: documentData,
  maxResults: 10

}
); // Create relationship entities for (const related of relatedDocuments) { await this.relationshipRepository.create({
  id: nanoid(),
  source_document_id: documentId,
  target_document_id: related.id,
  relationship_type: related.relationshipType|'related',
  strength: relate'.strength  || '.5,
  created_at: new Date()

})'
} logger.info(' 'Generated'' + relatedDocuments.length + ' relationships for document: ${documentId}' )'
} catch (error) {
  logger.error(Failed to generate document relationships: '; error);' // Don't throw - relatio'ships are optional
} } /** * Get next workflow stages using workflow engine */ private async getNextStages(currentStage: string): Promise<string[]>  { try { // This would be handled by workflow definitions in the workflow engine const stageMap: Record<string, string[]> = {
  draft: ['review,
  approved],
  review: ['approved,
  draft],
  approved: ['implementation,
  active],
  implmentation: ['testing,
  completed],
  testing: ['completed,
  implementation],
  completed: [],
  active: []

}'; return stageMap[currentStage]  || ' [];
} catch (error) {
  logger.error('Failed to get next stages: '; error); return []

} } /** * Shutdown document manager */ async shutdown(): Promise<void>  { try { if (this.workflowEngine) { await this.workflowEngine?.shutdown()
}'
' logger.info('Document Manager shutdown completed);
} catch (error) {
  logger.error('Error during Document Manager shutdown: '; error); throw error

} }
}

/**
 * Create a Document Manager with default configuration
 */'
export function createDocumentManager('  databaseType: 'postgresql' |sqlite | | mysql = postgre's'ql
): DocumentManager  { return new DocumentManager(databa'eType)
}

/**
 * Default export for easy import
 */
export default {
  DocumentManager,
  createDocumentManager;

};'