/**
 * Minimal, cleaned Document Processor implementation retained for parsing.
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

interface BrainCoordinator {
	store<T = unknown>(key: string, data: T, category?: string): Promise<void>;
}
interface WorkflowEngine {
	initialize(): Promise<void>;
	execute?(opts: any): Promise<void>;
/**
 * Minimal, cleaned Document Processor implementation retained for parsing.
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

interface BrainCoordinator {
	store<T = unknown>(key: string, data: T, category?: string): Promise<void>;
}
interface WorkflowEngine {
	initialize(): Promise<void>;
	execute?(opts: any): Promise<void>;
}

const logger = getLogger('DocumentProcessor');

export type DocumentType =
	| 'vision'
	| 'architecture_runway'
	| 'business_epic'
	| 'program_epic'
	| 'feature'
	| 'task'
	| 'story'
	| 'spec';

export interface DocumentProcessorConfig {
	autoWatch?: boolean;
	enableWorkflows?: boolean;
	workspaceRoot?: string;
	documentDirs?: Partial<Record<string, string>>;
}

export interface DocumentMetadata {
	author?: string;
	created?: Date;
	updated?: Date;
	status?: string;
	relatedDocs?: string[];
	tags?: string[];
	priority?: 'low' | 'medium' | 'high';
}

export interface Document {
	type: DocumentType;
	path: string;
	content?: string;
	metadata?: DocumentMetadata;
	id?: string;
}

export interface DocumentWorkspace {
	root: string;
	vision?: string;
	adrs?: string;
	prds?: string;
	epics?: string;
	features?: string;
	tasks?: string;
	specs?: string;
	implementation?: string;
}

export interface ProcessingContext {
	workspace: DocumentWorkspace;
	activeDocuments: Map<string, Document>;
	phase?: 'requirements' | 'design' | 'planning' | 'execution' | 'validation';
	backgroundProcessing: boolean;
}

export interface DocumentStats {
	totalDocuments: number;
	byType: Record<DocumentType, number>;
	byStatus: Record<string, number>;
	errors: number;
}

export class DocumentProcessor extends TypedEventBase {
	private memory: BrainCoordinator;
	private workflowEngine: WorkflowEngine | null = null;
	private workspaces: Map<string, ProcessingContext> = new Map();
	private documentWatchers: Map<string, any> = new Map();
	private initialized = false;
	private config: DocumentProcessorConfig;
	private stats: DocumentStats = {
		totalDocuments: 0,
		byType: {} as Record<DocumentType, number>,
		byStatus: {},
		errors: 0,
	};

	constructor(memory: BrainCoordinator, workflowEngine?: WorkflowEngine, config: DocumentProcessorConfig = {}) {
		super();
		this.memory = memory;
		this.workflowEngine = workflowEngine || null;
		this.config = {
			autoWatch: config?.autoWatch !== false,
			enableWorkflows: config?.enableWorkflows !== false,
			workspaceRoot: config?.workspaceRoot || './docs',
			documentDirs: config?.documentDirs || {},
		};
	}

	async initialize(): Promise<void> {
		if (this.initialized) return;
		logger.info('Initializing document processor');
		if (this.config.workspaceRoot && existsSync(this.config.workspaceRoot)) {
			await this.loadWorkspace(this.config.workspaceRoot);
		}
		this.initialized = true;
		this.emit('initialized', {});
		logger.info('Document processor ready');
	}

	async loadWorkspace(workspacePath: string): Promise<string> {
		const workspaceId = `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

		const dirs = this.config.documentDirs || {};
		const workspace: DocumentWorkspace = {
			root: workspacePath,
			vision: dirs['vision'] || join(workspacePath, '01-vision'),
			adrs: dirs['adrs'] || join(workspacePath, '02-adrs'),
			prds: dirs['prds'] || join(workspacePath, '03-prds'),
			epics: dirs['epics'] || join(workspacePath, '04-epics'),
			features: dirs['features'] || join(workspacePath, '05-features'),
			tasks: dirs['tasks'] || join(workspacePath, '06-tasks'),
			specs: dirs['specs'] || join(workspacePath, '07-specs'),
			implementation: join(workspacePath, 'src'),
		};

		const context: ProcessingContext = {
			workspace,
			activeDocuments: new Map(),
			backgroundProcessing: !!this.config.autoWatch,
			phase: 'requirements',
		};

		this.workspaces.set(workspaceId, context);
		return workspaceId;
	}

	private async ensureInitialized(): Promise<void> {
		if (!this.initialized) await this.initialize();
	}

	private generateDocumentId(type: DocumentType, path: string): string {
		return `${type}:${Buffer.from(path).toString('hex').slice(0, 12)}`;
	}

	private updateStats(doc: Document): void {
		this.stats.totalDocuments += 1;
		const prev = this.stats.byType[doc.type] || 0;
		this.stats.byType[doc.type] = prev + 1;
	}

	async processDocument(documentPath: string, workspaceId?: string): Promise<void> {
		await this.ensureInitialized();

		if (!workspaceId) {
			workspaceId = Array.from(this.workspaces.keys())[0];
			if (!workspaceId) workspaceId = await this.loadWorkspace(dirname(documentPath));
		}

		const context = this.workspaces.get(workspaceId!);
		if (!context) throw new Error(`Workspace not found: ${workspaceId}`);

		try {
			const content = await readFile(documentPath, 'utf8');
			const docType: DocumentType = 'spec';

			const document: Document = {
				type: docType,
				path: documentPath,
				content,
				id: this.generateDocumentId(docType, documentPath),
			};

			context.activeDocuments.set(documentPath, document);
			try {
				if (typeof (this.memory as any).store === 'function') {
					await (this.memory as any).store(document.id ?? document.path, document, 'documents');
				}
			} catch (e) {
				logger.debug('Memory store unavailable', e);
			}

			this.updateStats(document);
			this.emit('document:processed', { workspaceId, document });
		} catch (error) {
			this.stats.errors += 1;
			logger.error(`Failed to process document ${documentPath}:`, error);
			throw error;
		}
	}

	async createDocument(type: DocumentType, title: string, content: string, workspaceId?: string): Promise<Document> {
		await this.ensureInitialized();
		if (!workspaceId) {
			workspaceId = Array.from(this.workspaces.keys())[0];
			if (!workspaceId) throw new Error('No workspace available. Load a workspace first.');
		}

		const context = this.workspaces.get(workspaceId!);
		if (!context) throw new Error(`Workspace not found: ${workspaceId}`);

		const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
		const dirPath = context.workspace.vision || context.workspace.root;
		const filePath = join(dirPath!, fileName);

		const documentContent = `# ${title}\n\n${content}`;
		await writeFile(filePath, documentContent, 'utf8');
		await this.processDocument(filePath, workspaceId);
		const doc = context.activeDocuments.get(filePath);
		if (!doc) throw new Error('Failed to create document');
		return doc;
	}
}
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
logger.info('Shutting down document processor...').// Stop all file watchers
for (const [id, watcher] of this.documentWatchers) {
if (watcher && typeof watcher.close === 'function{
; watcher.close();
}
}
this.documentWatchers.clear();

// Clear workspaces
this.workspaces.clear();

this.removeAllListeners();
logger.info('Document processor shutdown complete').').

// ==================== PRIVATE METHODS ====================

/**
* Setup event handlers.
*/
private setupEventHandlers():void {
this.on('document:created', this.handleDocumentCreated.bind(this)); this.on('document:updated', this.handleDocumentUpdated.bind(this)); this.on('document:deleted', this.handleDocumentDeleted.bind(this));').

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
const _context = this.workspaces.get(workspaceId)!;

switch (document.type) {
case 'vision': '). context.phase = 'requirements';
logger.info(' Processing Vision document').; break;
case 'adr': '). logger.info(' Processing ADR document').; break;
case 'prd': '). context.phase = 'design';
logger.info(' Processing PRD document').; break;
case 'epic': '). context.phase = 'planning';
logger.info('️ Processing Epic document').; break;
case 'feature': '). context.phase = 'planning';
logger.info(' Processing Feature document').; break;
case 'task': '). context.phase = 'execution';
logger.info(' Processing Task document').; break;
case 'spec': '). logger.info(' Processing Spec document').; break;
}
}