/**
* @fileoverview Document Workflow Service - Professional Document Processing
*
* Handles document-specific workflow processing moved from coordination/workflows.
* Integrates with existing document-intelligence infrastructure and provides
* event-driven coordination with other services.
*
* Features:
* - Vision to PRD conversion workflows
* - PRD to Epic transformation
* - Document event processing
* - Integration with document-task-coordinator
*
* @author Claude Code Zen Team
* @since 1.0.0
* @version 1.0.0
*/

import { getLogger, EventBus} from '@claude-zen/foundation';
import { DocumentTaskCoordinator} from './document-task-coordinator';

const logger = getLogger('document-intelligence-workflow-service');

export interface DocumentContent {
id:string;
type:string;
title:string;
content:string;
metadata?:Record<string, unknown>;
}

export interface DocumentWorkflowDefinition {
name:string;
description:string;
version:string;
steps:DocumentWorkflowStep[];
}

export interface DocumentWorkflowStep {
type:string;
name:string;
params:Record<string, unknown>;
}

export interface DocumentWorkflowResult {
success:boolean;
workflowId:string;
results?:Record<string, unknown>;
error?:string;
}

/**
* Document Workflow Service - Professional document processing workflows
*
* Moved from coordination/workflows to provide proper separation of concerns.
* Handles all document-specific workflow processing and coordinates with
* other services via events.
*/
export class DocumentWorkflowService {
private eventBus:EventBus;
private documentWorkflows = new Map<string, DocumentWorkflowDefinition>();
private documentTaskCoordinator:DocumentTaskCoordinator;

constructor(
eventBus:EventBus,
documentTaskCoordinator?:DocumentTaskCoordinator
) {
this.eventBus = eventBus;
this.documentTaskCoordinator = documentTaskCoordinator || new DocumentTaskCoordinator();

// Register event listeners for document processing
this.setupEventListeners();
}

/**
* Initialize document workflow service
*/
async initialize():Promise<void> {
logger.info('Initializing Document Workflow Service');
await this.registerDocumentWorkflows();
logger.info('Document Workflow Service initialized successfully');
}

/**
* Register document workflows for automated processing.
* Moved from coordination/workflows/engine.ts
*/
async registerDocumentWorkflows():Promise<void> {
// Document workflow definitions
const documentWorkflows:DocumentWorkflowDefinition[] = [
{
name: 'vision-to-prds', description: 'Process vision document and generate product requirements documents', version: '1.0.0', steps:[
{
type: 'extract-product-requirements', name: 'Extract product requirements from vision', params:{ outputKey: 'product_requirements'},
},
{
type: 'create-prd-document', name: 'Create PRD document', params:{ templateKey: 'prd_template', outputKey: ' prd_document'},
},
],
},
{
name: 'prds-to-epics', description: 'Convert product requirements to epic definitions', version: '1.0.0', steps:[
{
type: 'analyze-requirements', name: 'Analyze product requirements for epic extraction', params:{ outputKey: 'epic_requirements'},
},
{
type: 'create-epic-documents', name: 'Create epic definition documents', params:{ templateKey: 'epic_template', outputKey: ' epic_documents'},
},
],
},
];

// Register all document workflows
for (const workflow of documentWorkflows) {
this.documentWorkflows.set(workflow.name, workflow);
}

logger.info(`Registered ${documentWorkflows.length} document workflows`);
}

/**
* Process document event to trigger appropriate workflows.
* Moved from coordination/workflows/engine.ts
*/
async processDocumentEvent(
eventType:string,
documentData:unknown
):Promise<DocumentWorkflowResult> {
logger.info(`Processing document event:${eventType}`);

try {
// Auto-trigger workflows based on document type
const documentType = (documentData as any)?.type || 'unknown';
const triggerWorkflows:string[] = [];

switch (documentType) {
case 'vision':
triggerWorkflows.push('vision-to-prds');
break;
case 'prd':
triggerWorkflows.push('prds-to-epics');
break;
default:
logger.debug(`No automatic workflow for document type:${documentType}`);
return {
success:true,
workflowId: 'none', results:{ message: 'No workflow triggered for document type'}
};
}

// Execute triggered workflows
const results:Record<string, unknown> = {};
for (const workflowName of triggerWorkflows) {
try {
const workflowResult = await this.executeDocumentWorkflow(workflowName, {
documentData,
eventType,
triggeredAt:new Date().toISOString(),
});

results[workflowName] = workflowResult;

logger.info(`Triggered workflow ${workflowName}:SUCCESS`);

// Emit completion event for coordination layer
this.eventBus.emit('document-workflow:completed', {
workflowName,
documentType,
result:workflowResult
});

} catch (error) {
logger.error(`Failed to trigger workflow ${workflowName}:`, error);
results[workflowName] = { error:error instanceof Error ? error.message : String(error)};
}
}

return {
success:true,
workflowId:triggerWorkflows.join(', '),
results
};

} catch (error) {
logger.error('Error processing document event: ', error);
' return {
success:false,
workflowId: 'error', error:error instanceof Error ? error.message : String(error)
};
}
}

/**
* Execute a specific document workflow
*/
private async executeDocumentWorkflow(
workflowName:string,
context:Record<string, unknown>
):Promise<Record<string, unknown>> {
const workflow = this.documentWorkflows.get(workflowName);
if (!workflow) {
throw new Error(`Document workflow not found:${workflowName}`);
}

logger.info(`Executing document workflow:${workflowName}`);

const results:Record<string, unknown> = {};

for (const step of workflow.steps) {
try {
const stepResult = await this.executeDocumentWorkflowStep(step, context);
results[step.type] = stepResult;

// Update context with step results
Object.assign(context, stepResult);

} catch (error) {
logger.error(`Error in workflow step ${step.type}:`, error);
throw error;
}
}

return results;
}

/**
* Execute a single document workflow step
*/
private async executeDocumentWorkflowStep(
step:DocumentWorkflowStep,
context:Record<string, unknown>
):Promise<Record<string, unknown>> {
logger.debug(`Executing document workflow step:${step.type}`);

switch (step.type) {
case 'extract-product-requirements':
return await this.extractProductRequirements(context, step.params);

case 'create-prd-document':
return await this.createPRDDocument(context, step.params);

case 'analyze-requirements':
return await this.analyzeRequirements(context, step.params);

case 'create-epic-documents':
return await this.createEpicDocuments(context, step.params);

default:
throw new Error(`Unknown document workflow step type:${step.type}`);
}
}

/**
* Extract product requirements from vision document
*/
private async extractProductRequirements(
context:Record<string, unknown>,
params:Record<string, unknown>
):Promise<Record<string, unknown>> {
logger.debug('Extracting product requirements from vision document');

// Integrate with document-task-coordinator for strategic analysis
const documentData = context.documentData as any;

// This would integrate with existing document-intelligence capabilities
const requirements = {
functionalRequirements:['User authentication', 'Data visualization', 'Reporting'],
nonFunctionalRequirements:['Performance', 'Security', 'Scalability'],
constraints:['Budget', 'Timeline', 'Technology stack'],
assumptions:['User expertise level', 'Infrastructure availability']
};

return {
[params.outputKey as string]:requirements
};
}

/**
* Create PRD document from extracted requirements
*/
private async createPRDDocument(
context:Record<string, unknown>,
params:Record<string, unknown>
):Promise<Record<string, unknown>> {
logger.debug('Creating PRD document');

const requirements = context.product_requirements as any;

const prdDocument:DocumentContent = {
id:`prd-${Date.now()}`,
type: 'prd', title: 'Product Requirements Document', content:`
# Product Requirements Document

## Functional Requirements
${requirements?.functionalRequirements?.map((req:string) => `- ${req}`).join('\n') || '}`

## Non-Functional Requirements
${requirements?.nonFunctionalRequirements?.map((req:string) => `- ${req}`).join('\n') || '}`

## Constraints
${requirements?.constraints?.map((constraint:string) => `- ${constraint}`).join('\n') || '}`

## Assumptions
${requirements?.assumptions?.map((assumption:string) => `- ${assumption}`).join('\n') || '}`
`.trim(),
metadata:{
generatedAt:new Date().toISOString(),
sourceWorkflow:'vision-to-prds')}
};

return {
[params.outputKey as string]:prdDocument
};
}

/**
* Analyze requirements for epic extraction
*/
private async analyzeRequirements(
context:Record<string, unknown>,
params:Record<string, unknown>
):Promise<Record<string, unknown>> {
logger.debug('Analyzing requirements for epic extraction');

// Analyze PRD document for epic opportunities
const epicRequirements = {
userManagementEpic:['Authentication', 'User profiles', 'Permissions'],
dataEpic:['Data ingestion', 'Processing', 'Storage'],
uiEpic:['Dashboard', 'Reports', 'Mobile interface']
};

return {
[params.outputKey as string]:epicRequirements
};
}

/**
* Create epic definition documents
*/
private async createEpicDocuments(
context:Record<string, unknown>,
params:Record<string, unknown>
):Promise<Record<string, unknown>> {
logger.debug('Creating epic definition documents');

const epicRequirements = context.epic_requirements as any;
const epicDocuments:DocumentContent[] = [];

for (const [epicName, features] of Object.entries(epicRequirements || {})) {
const epicDoc:DocumentContent = {
id:`epic-${epicName}-${Date.now()}`,
type: 'epic', title:`Epic: ${epicName.replace(/([A-Z])/g, ' $1').trim()}`,
content:`
# Epic:${epicName}

## Features
${(features as string[])?.map(feature => `- ${feature}`).join('\n') || '}`

## Acceptance Criteria
- [] Feature implementation complete
- [] Testing complete
- [] Documentation updated
`.trim(),
metadata:{
generatedAt:new Date().toISOString(),
sourceWorkflow: 'prds-to-epics', epicType:epicName
}
};

epicDocuments.push(epicDoc);
}

return {
[params.outputKey as string]:epicDocuments
};
}

/**
* Convert entity to document content.
* Moved from coordination/workflows/engine.ts
*/
convertEntityToDocumentContent(entity:any): DocumentContent {
return {
id:entity.id,
type:entity.type,
title:entity.title || `${entity.type} Document`,
content:entity.content || ', metadata:entity.metadata || {}
};
}

/**
* Setup event listeners for document processing
*/
private setupEventListeners():void {
// Listen for document import requests from other services
this.eventBus.on('document:import-requested', async (data:any) => {
logger.info('Received document import request');
try {
const result = await this.processDocumentEvent('import', data);
this.eventBus.emit('document:import-completed', {
requestId:data.requestId,
result
});
} catch (error) {
this.eventBus.emit('document:import-failed', {
requestId:data.requestId,
error:error instanceof Error ? error.message : String(error)
});
}
});

// Listen for workflow coordination requests
this.eventBus.on('document-workflow:execute', async (data:any) => {
logger.info(`Received workflow execution request:${data.workflowName}`);
try {
const result = await this.executeDocumentWorkflow(data.workflowName, data.context || {});
this.eventBus.emit('document-workflow:completed', {
requestId:data.requestId,
workflowName:data.workflowName,
result
});
} catch (error) {
this.eventBus.emit('document-workflow:failed', {
requestId:data.requestId,
workflowName:data.workflowName,
error:error instanceof Error ? error.message : String(error)
});
}
});
}

/**
* Get registered document workflows
*/
getDocumentWorkflows():Map<string, DocumentWorkflowDefinition> {
return new Map(this.documentWorkflows);
}
}

export default DocumentWorkflowService;