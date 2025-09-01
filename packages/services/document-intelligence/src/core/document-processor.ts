/**
* Document Processor - Unified Document Processing System.
*
* Clean, focused document processor that consolidates DocumentDrivenSystem and DatabaseDrivenSystem.
* Into a single, coherent document processing system. Handles Vision → PRDs → Epics → Features → Tasks → Code.
* ADRs are independent architectural governance documents that constrain and guide implementation..
*
* @example
* ```typescript`
* const processor = new DocumentProcessor(memorySystem, workflowEngine, {
* autoWatch:true,
* enableWorkflows:true
*});
*
* await processor.initialize();
* await processor.processDocument('./docs/vision/product-vision.md');') * ````
*/
/**
* @file Document-processor implementation.
*/

import { existsSync} from 'node:fs';
import { dirname} from 'node:path';
import { getLogger, TypedEventBase} from '@claude-zen/foundation';
// Removed intelligence facade; define minimal local interfaces
interface BrainCoordinator {
store<T = unknown>(key: string, data: T, category?: string): Promise<void>;
}
interface WorkflowEngine { initialize(): Promise<void>; }

const logger = getLogger('DocumentProcessor');

/**
* Document types in the processing workflow.
*/
export type DocumentType =
| 'vision'
| 'architecture_runway'
| 'business_epic'
| 'program_epic'
| 'feature'
| 'task'
| 'story'
| 'spec';

/**
* Document processing configuration.
*
* @example
*/
export interface DocumentProcessorConfig {
/** Enable automatic file watching */
autoWatch?:boolean;
/** Enable workflow processing */
enableWorkflows?:boolean;
/** Workspace root directory */
workspaceRoot?:string;
/** Document directory structure */
documentDirs?:{
vision?:string;
adrs?:string;
prds?:string;
epics?:string;
features?:string;
tasks?:string;
specs?:string;
};
}

/**
* Document metadata.
*
* @example
*/
export interface DocumentMetadata {
/** Document author */
author?:string;
/** Creation date */
created?:Date;
/** Last updated date */
updated?:Date;
/** Document status */
status?:string;
/** Related documents */
relatedDocs?:string[];
/** Document tags */
tags?:string[];
/** Document priority */
priority?: 'low' | 'medium' | 'high';
}

/**
* Document representation.
*
* @example
*/
export interface Document {
/** Document type */
type:DocumentType;
/** File path */
path:string;
/** Document content */
content?:string;
/** Document metadata */
metadata?:DocumentMetadata;
/** Unique document ID */
id?:string;
}

/**
* Workspace structure for document organization.
*
* @example
*/
export interface DocumentWorkspace {
/** Workspace root directory */
root:string;
/** Vision documents directory */
vision?:string;
/** ADR documents directory */
adrs?:string;
/** PRD documents directory */
prds?:string;
/** Epic documents directory */
epics?:string;
/** Feature documents directory */
features?:string;
/** Task documents directory */
tasks?:string;
/** Spec documents directory */
specs?:string;
/** Implementation directory */
implementation?:string;
}

/**
* Document processing context.
*
* @example
*/
export interface ProcessingContext {
/** Workspace configuration */
workspace:DocumentWorkspace;
/** Active documents */
activeDocuments:Map<string, Document>;
/** Current processing phase */
phase?: 'requirements' | 'design' | 'planning' | 'execution' | 'validation';
/** Enable background processing */
backgroundProcessing:boolean;
}

/**
* Document processor statistics.
*
* @example
*/
export interface DocumentStats {
/** Total documents processed */
totalDocuments:number;
/** Documents by type */
byType:Record<DocumentType, number>;
/** Documents by status */
byStatus:Record<string, number>;
/** Processing errors */
errors:number;
}

/**
* Clean, focused document processor that consolidates file-based and database-driven approaches.
*
* @example
*/
export class DocumentProcessor extends TypedEventBase {
private memory:BrainCoordinator;
private workflowEngine:WorkflowEngine|null = null;
private workspaces:Map<string, ProcessingContext> = new Map();
private documentWatchers:Map<string, any> = new Map();
private initialized = false;
private stats:DocumentStats = {
totalDocuments:0,
byType:{} as Record<DocumentType, number>,
byStatus:{},
errors:0,
};

/**
* Create a new document processor.
*
* @param memory - Memory system for persistence.
* @param workflowEngine - Workflow engine for processing.
* @param config - Configuration options.
*/
constructor(
memory:BrainCoordinator,
workflowEngine?:WorkflowEngine,
config:DocumentProcessorConfig = {}
) {
super();
this.memory = memory;
this.workflowEngine = workflowEngine||null;
this.config = {
autoWatch:config?.autoWatch !== false,
enableWorkflows:config?.enableWorkflows !== false,
workspaceRoot:config?.workspaceRoot||'./docs', documentDirs:{
vision:config?.documentDirs?.vision||'01-vision', adrs:config?.documentDirs?.adrs||'02-adrs', prds:config?.documentDirs?.prds||'03-prds', epics:config?.documentDirs?.epics||'04-epics', features:config?.documentDirs?.features||'05-features', tasks:config?.documentDirs?.tasks||'06-tasks', specs:config?.documentDirs?.specs||'07-specs', ...config?.documentDirs,
},
};

this.setupEventHandlers();
}

/**
* Initialize the document processor.
*/
async initialize():Promise<void> {
if (this.initialized) return;

logger.info('Initializing document processor');// Initialize default workspace if workspace root exists
if (existsSync(this.config.workspaceRoot)) {
await this.loadWorkspace(this.config.workspaceRoot);
}

this.initialized = true;
this.emit('initialized', {});
logger.info('Document processor ready`);`)}

/**
* Load or create a document workspace.
*
* @param workspacePath - Path to the workspace root.
* @returns Workspace ID.
*/
async loadWorkspace(workspacePath:string): Promise<string> {
const workspaceId = `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;`

// Create workspace structure
const workspace:DocumentWorkspace = {
root:workspacePath,
vision:join(workspacePath, this.config.documentDirs.vision!),
adrs:join(workspacePath, this.config.documentDirs.adrs!),
prds:join(workspacePath, this.config.documentDirs.prds!),
epics:join(workspacePath, this.config.documentDirs.epics!),
features:join(workspacePath, this.config.documentDirs.features!),
tasks:join(workspacePath, this.config.documentDirs.tasks!),
specs:join(workspacePath, this.config.documentDirs.specs!),
implementation:join(workspacePath, `src`),
};

// Create processing context
const context:ProcessingContext = {
workspace,
activeDocuments:new Map(),
backgroundProcessing:this.config.enableWorkflows,
};

this.workspaces.set(workspaceId, context);

// Create directories if they don't exist') await this.ensureDirectories(workspace);

// Load existing documents
await this.scanDocuments(workspaceId);

// Setup file watchers if enabled
if (this.config.autoWatch) {
this.setupDocumentWatchers(workspaceId);
}

logger.info(
`Loaded workspace:$workspacePath($context.activeDocuments.sizedocuments)``
);
this.emit('workspace:loaded`, {
`) workspaceId,
path:workspacePath,
documentCount:context.activeDocuments.size,
});

return workspaceId;
}

/**
* Process a document file.
*
* @param documentPath - Path to the document file.
* @param workspaceId - Optional workspace ID (uses default if not provided).
*/
async processDocument(
documentPath:string,
workspaceId?:string
):Promise<void> {
await this.ensureInitialized();

// Find or create workspace
if (!workspaceId) {
workspaceId = Array.from(this.workspaces.keys())[0];
if (!workspaceId) {
workspaceId = await this.loadWorkspace(dirname(documentPath));
}
}

const context = this.workspaces.get(workspaceId);
if (!context) {
throw new Error(`Workspace not found:${workspaceId}`);`
}

try {
const docType = this.getDocumentType(documentPath);
const content = await readFile(documentPath, `utf8`);') const metadata = await this.extractMetadata(content);

logger.info(`Processing $docTypedocument:$documentPath`);`

const document:Document = {
type:docType,
path:documentPath,
content,
metadata,
id:this.generateDocumentId(docType, documentPath),
};

// Store in context
context.activeDocuments.set(documentPath, document);

// Store in memory system
await this.memory.storeDocument(docType, document.id!, document);

// Update statistics
this.updateStats(document);

// Route to appropriate processor
await this.processDocumentByType(workspaceId, document);

// Trigger workflows if enabled
if (this.config.enableWorkflows && this.workflowEngine) {
try {
await this.workflowEngine.execute({
type: 'document_created', data:document,
context:{ workspaceId},
});
} catch (error) {
logger.warn('Workflow processing failed:', error);')}
}

this.emit('document:processed`, {
`) workspaceId,
document,
suggestedNextSteps:this.getSuggestedNextSteps(docType),
});
} catch (error)
this.stats.errors++;
logger.error(`Failed to process document ${documentPath}:`, error);`
throw error;
}
}

/**
* Create a new document from template.
*
* @param type - Document type.
* @param title - Document title.
* @param content - Document content.
* @param workspaceId - Workspace ID.
* @returns Created document.
*/
async createDocument(
type:DocumentType,
title:string,
content:string,
workspaceId?:string
):Promise<Document> {
await this.ensureInitialized();

if (!workspaceId) {
workspaceId = Array.from(this.workspaces.keys())[0];
if (!workspaceId) {
throw new Error(`No workspace available. Load a workspace first.`);`)}
}

const context = this.workspaces.get(workspaceId);
if (!context) {
throw new Error(`Workspace not found:$workspaceId`);`

// Generate file path
const __dirPath = this.getDocumentDirectory(context.workspace, type);
const __fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;`
const filePath = join(dirPath, fileName);

// Create document content with metadata
const documentContent = this.generateDocumentContent(title, content, type);

// Write file
await writeFile(filePath, documentContent, `utf8');// Process the created document
await this.processDocument(filePath, workspaceId);

const document = context.activeDocuments.get(filePath);
if (!document) {
throw new Error('Failed to create document');')}

logger.info(`Created $typedocument:$title`);`
return document;
}

/**
* Get document processor statistics.
*
* @returns Current statistics.
*/
async getStats():Promise<DocumentStats> {
return { ...this.stats};
}

/**
* Get all documents in a workspace.
*
* @param workspaceId - Workspace ID.
* @returns Map of documents.
*/
getWorkspaceDocuments(workspaceId:string): Map<string, Document> {
const context = this.workspaces.get(workspaceId);
return context ? context.activeDocuments:new Map();
}

/**
* Get all workspace Ds.
*
* @returns Array of workspace Ds.
*/
getWorkspaces():string[] {
return Array.from(this.workspaces.keys())();
}

/**
* Shutdown the document processor.
*/
async shutdown():Promise<void> {
logger.info('Shutting down document processor...');// Stop all file watchers
for (const [_id, watcher] of this.documentWatchers) {
if (watcher && typeof watcher.close === 'function{
') watcher.close();
}
}
this.documentWatchers.clear();

// Clear workspaces
this.workspaces.clear();

this.removeAllListeners();
logger.info('Document processor shutdown complete');')}

// ==================== PRIVATE METHODS ====================

/**
* Setup event handlers.
*/
private setupEventHandlers():void {
this.on('document:created', this.handleDocumentCreated.bind(this));') this.on('document:updated', this.handleDocumentUpdated.bind(this));') this.on('document:deleted', this.handleDocumentDeleted.bind(this));')}

/**
* Process document based on its type.
*
* @param workspaceId
* @param document
*/
private async processDocumentByType(
workspaceId:string,
document:Document
):Promise<void> {
const __context = this.workspaces.get(workspaceId)!;

switch (document.type) {
case 'vision': ')' context.phase = 'requirements';
logger.info(' Processing Vision document');') break;
case 'adr': ')' logger.info(' Processing ADR document');') break;
case 'prd': ')' context.phase = 'design';
logger.info(' Processing PRD document');') break;
case 'epic': ')' context.phase = 'planning';
logger.info('️ Processing Epic document');') break;
case 'feature': ')' context.phase = 'planning';
logger.info(' Processing Feature document');') break;
case 'task': ')' context.phase = 'execution';
logger.info(' Processing Task document');') break;
case 'spec': ')' logger.info(' Processing Spec document');') break;
}
}