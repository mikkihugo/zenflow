import { EventEmitter } from 'node:events';
import { nanoid } from 'nanoid';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('ProductFlowSystem');
export class ProductFlowSystem extends EventEmitter {
    workflowEngine;
    documentService;
    activeWorkspaces = new Map();
    constructor(workflowEngine, documentService) {
        super();
        this.workflowEngine = workflowEngine;
        this.documentService = documentService;
    }
    async initialize() {
        logger.info('Initializing Product Flow System');
        await this.workflowEngine.initialize();
        await this.documentService.initialize();
        this.emit('initialized');
        logger.info('Product Flow System ready');
    }
    async processVisionaryDocument(workspaceId, docPath) {
        logger.info(`🚀 Processing visionary document: ${docPath}`);
        try {
            const result = await this.workflowEngine.startProductWorkflow('complete-product-flow', {
                workspaceId,
                variables: { visionDocPath: docPath },
            });
            if (result?.success && result?.workflowId) {
                logger.info(`✅ Product Flow workflow started: ${result?.workflowId}`);
                this.emit('product-flow:started', {
                    workflowId: result?.workflowId,
                    docPath,
                });
            }
        }
        catch (error) {
            logger.error(`❌ Failed to process visionary document ${docPath}:`, error);
            throw error;
        }
    }
    async loadWorkspace(workspacePath) {
        const workspaceId = nanoid();
        this.activeWorkspaces.set(workspaceId, workspacePath);
        logger.info(`📁 Loaded Product Flow workspace: ${workspaceId} at ${workspacePath}`);
        return workspaceId;
    }
    async getWorkspaceStatus(workspaceId) {
        const path = this.activeWorkspaces.get(workspaceId);
        const activeWorkflows = await this.workflowEngine.getActiveProductWorkflows();
        return {
            workspaceId,
            path,
            activeWorkflows: activeWorkflows.length,
            sparcIntegration: true,
        };
    }
}
//# sourceMappingURL=product-flow-system.js.map