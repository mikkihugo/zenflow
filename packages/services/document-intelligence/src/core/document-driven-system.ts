/**
* SAFe Artifact Intelligence System - Database-Driven SAFe 6.0 Essential
*
* The SAFe-based artifact intelligence system:
* - Portfolio Epics → Features → User Stories → SPARC Development
* - ALL artifacts stored in databases (SQLite, LanceDB, Kuzu)
* - Can IMPORT documents from files, but stores in database
* - SAFe 6.0 Essential workflow with SPARC execution
*/
/**
* @file Safe artifact intelligence implementation.
*/
import { getLogger, TypedEventBase} from '@claude-zen/foundation';
import { readFile } from 'node:fs/promises';

const logger = getLogger('SafeArtifactIntelligence');

// SAFe 6.0 Essential artifacts - ALL STORED IN DATABASE
export interface SafeArtifact {
id: string; // Database ID
type: 'portfolio-epic' | 'business-case' | 'pi-objective' | 'feature' | 'user-story' | 'enabler' | 'architecture-runway';
safeLevel: 'portfolio' | 'program' | 'team';
artifactState: string; // Portfolio Kanban states, PI states, etc.
title: string;
description: string;
content: string; // Stored in database, NOT files
databaseId?: string; // Reference to specific database record
metadata?: {
author?: string;
created?: Date;
updated?: Date;
wsjfScore?: number;
epicId?: string;
piId?: string;
businessValue?: number;
relatedArtifacts?: string[];
};
}

export interface SafeWorkspace {
workspaceId:string; // Database workspace identifier
name:string;
safeConfiguration: 'essential' | 'large-solution' | 'portfolio';
// NO file paths - everything stored in databases
databases:{
    artifacts:string; // Artifact database connection
    relationships:string; // Relationship graph database
    analytics:string; // Performance analytics database
};
}

export interface SafeWorkflowContext {
workspace:SafeWorkspace;
activeArtifacts:Map<string, SafeArtifact>;
currentPI?:string; // Current Program Increment
safeLevel: 'essential' | 'large-solution' | 'portfolio'; // SAFe configuration
sparcIntegration?: boolean; // SPARC development execution
}

// Minimal VisionaryDocument used by processors
interface VisionaryDocument {
    type: string;
    path: string;
    content: string;
    metadata?: Record<string, any>;
}

export class SafeArtifactIntelligence extends TypedEventBase {
private workspaces:Map<string, SafeWorkflowContext> = new Map();

constructor() {
super();
this.setupDocumentHandlers();
}

/**
* Initialize system - SAFe 6.0 Essential artifact intelligence.
*/
async initialize():Promise<void> {
    logger.info('Initializing SAFe Artifact Intelligence System');
    logger.info('SAFe Artifact Intelligence ready');
    this.emit('initialized', { timestamp: new Date() });
}

/**
* Load existing workspace with documents.
*
* @param workspacePath
*/
async loadWorkspace(workspaceName:string, databaseConnections:any): Promise<string> {
const workspaceId = `safe-workspace-${Date.now()}`;
const workspace: SafeWorkspace = {
    workspaceId,
    name: workspaceName,
    safeConfiguration: 'essential', // SAFe 6.0 Essential by default
    databases: {
        artifacts: databaseConnections?.artifacts ?? 'safe_artifacts.db',
        relationships: databaseConnections?.relationships ?? 'safe_relationships.db',
        analytics: databaseConnections?.analytics ?? 'safe_analytics.db',
    },
};

const context: SafeWorkflowContext = {
    workspace,
    activeArtifacts: new Map(),
    currentPI: undefined,
    safeLevel: 'essential',
    sparcIntegration: true,
};

this.workspaces.set(workspaceId, context);

// Load existing artifacts from database if implemented
if (typeof (this as any).loadArtifactsFromDatabase === 'function') {
    await (this as any).loadArtifactsFromDatabase(workspaceId);
}

logger.info(`Loaded SAFe workspace: ${workspaceName}`);
this.emit('workspace:loaded', { workspaceId, name: workspaceName });

return workspaceId;
}

/**
* Process Visionary document with optional structured approach.
*
* @param workspaceId
* @param docPath
*/
async processVisionaryDocument(
workspaceId:string,
docPath:string
):Promise<void> {
// Route to appropriate processor based on document type
    const context = this.workspaces.get(workspaceId);
    if (!context) throw new Error(`Workspace ${workspaceId} not found`);

    const docType = typeof (this as any).getDocumentType === 'function'
        ? (this as any).getDocumentType(docPath)
        : 'vision';

    let content = '';
    try {
        content = await readFile(docPath, 'utf8');
    } catch (err) {
        logger.warn('Failed to read document', { docPath, err });
    }

    logger.info(`Processing ${docType}: ${docPath}`);

    const doc: VisionaryDocument = {
        type: docType,
        path: docPath,
        content,
        metadata: typeof (this as any).extractMetadata === 'function' ? await (this as any).extractMetadata(content) : {},
    };

    context.activeArtifacts.set(docPath, doc as unknown as SafeArtifact);

    // Route to appropriate processor if implemented
    try {
        switch (docType) {
            case 'vision':
                if (typeof (this as any).processVisionDocument === 'function') await (this as any).processVisionDocument(workspaceId, doc);
                break;
            case 'adr':
                if (typeof (this as any).processADR === 'function') await (this as any).processADR(workspaceId, doc);
                break;
            case 'prd':
                if (typeof (this as any).processPRD === 'function') await (this as any).processPRD(workspaceId, doc);
                break;
            case 'epic':
                if (typeof (this as any).processEpic === 'function') await (this as any).processEpic(workspaceId, doc);
                break;
            case 'feature':
                if (typeof (this as any).processFeature === 'function') await (this as any).processFeature(workspaceId, doc);
                break;
            case 'task':
                if (typeof (this as any).processTask === 'function') await (this as any).processTask(workspaceId, doc);
                break;
            default:
                logger.debug('No processor for document type', { docType });
        }
    } catch (error) {
        logger.error('Error processing document', { error });
    }

    this.emit('document:created', {
        workspaceId,
        path: docPath,
        type: docType,
        document: doc,
    });
}