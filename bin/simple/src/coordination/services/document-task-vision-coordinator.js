import { createLogger } from '../../core/logger.ts';
import { DocumentManager } from '../../database/managers/document-manager.ts';
import { StrategicVisionService, } from './strategic-vision-service.ts';
const logger = createLogger('coordination-services-document-task-vision');
export class DocumentTaskVisionCoordinator {
    documentManager;
    visionService;
    constructor() {
        this.documentManager = new DocumentManager();
        this.visionService = new StrategicVisionService();
    }
    async getDashboard(projectId) {
        try {
            logger.info(`Building integrated dashboard for project: ${projectId}`);
            const vision = await this.visionService.getVisionForWorkspace(projectId);
            const documentsResult = await this.documentManager.getDocumentsByProject(projectId, {
                includeContent: true,
                includeRelationships: true,
                sortBy: 'updated_at',
                sortOrder: 'desc',
            });
            const documents = documentsResult.success
                ? documentsResult.data?.documents || []
                : [];
            const tasks = await this.extractAndGenerateStrategicTasks(vision, documents);
            const documentLinks = await this.createDocumentTaskLinks(documents, tasks);
            const metrics = this.calculateDashboardMetrics(vision, tasks, documentLinks);
            const recommendations = await this.generateRecommendations(vision, tasks, documentLinks);
            const dashboard = {
                projectId,
                vision,
                tasks,
                documents: documentLinks,
                metrics,
                recommendations,
                lastUpdated: new Date(),
            };
            logger.info(`Dashboard built successfully with ${tasks.length} tasks and ${documents.length} documents`);
            return dashboard;
        }
        catch (error) {
            logger.error(`Error building dashboard for ${projectId}:`, error);
            throw error;
        }
    }
    async generateTasksFromVision(projectId, saveToDatabase = true) {
        try {
            logger.info(`Generating strategic tasks for project: ${projectId}`);
            const vision = await this.visionService.getVisionForWorkspace(projectId);
            const documentsResult = await this.documentManager.getDocumentsByProject(projectId);
            const documents = documentsResult.success
                ? documentsResult.data?.documents || []
                : [];
            const tasks = await this.extractAndGenerateStrategicTasks(vision, documents);
            const newTasks = [];
            const existingTasks = [];
            const errors = [];
            if (saveToDatabase) {
                for (const task of tasks) {
                    try {
                        const taskDocData = {
                            type: 'task',
                            title: task.title,
                            summary: task.description,
                            content: this.createTaskDocumentContent(task),
                            author: 'vision-task-coordinator',
                            project_id: projectId,
                            status: 'draft',
                            priority: task.priority,
                            keywords: task.tags,
                            tags: ['strategic-task', 'vision-generated', task.priority],
                            metadata: {
                                strategic_goal_id: task.strategicGoalId,
                                business_value: task.businessValue,
                                technical_complexity: task.technicalComplexity,
                                estimated_effort: task.estimatedEffort,
                                task_id: task.id,
                                due_date: task.dueDate?.toISOString(),
                                assigned_to: task.assignedTo,
                                dependencies: task.dependencies,
                                outcomes: task.outcomes,
                                metrics: task.metrics,
                                document_source: 'vision_analysis',
                            },
                            version: '1.0',
                            dependencies: task.dependencies,
                            related_documents: task.relatedDocuments,
                        };
                        const createResult = await this.documentManager.createDocument(taskDocData);
                        if (createResult.success) {
                            newTasks.push(task);
                        }
                        else {
                            errors.push(`Failed to create task "${task.title}": ${createResult.error?.message}`);
                            existingTasks.push(task);
                        }
                    }
                    catch (taskError) {
                        errors.push(`Error creating task "${task.title}": ${taskError.message}`);
                    }
                }
            }
            logger.info(`Generated ${newTasks.length} new tasks, ${existingTasks.length} existing, ${errors.length} errors`);
            return { created: newTasks, existing: existingTasks, errors };
        }
        catch (error) {
            logger.error(`Error generating tasks from vision:`, error);
            return { created: [], existing: [], errors: [error.message] };
        }
    }
    async linkDocumentsToStrategicGoals(projectId, createMissingTasks = true) {
        try {
            logger.info(`Linking documents to strategic goals for project: ${projectId}`);
            const vision = await this.visionService.getVisionForWorkspace(projectId);
            const documentsResult = await this.documentManager.getDocumentsByProject(projectId, {
                includeContent: true,
                includeRelationships: true,
            });
            const documents = documentsResult.success
                ? documentsResult.data?.documents || []
                : [];
            const tasks = await this.extractAndGenerateStrategicTasks(vision, documents);
            const links = await this.createDocumentTaskLinks(documents, tasks);
            let tasksCreated = 0;
            const errors = [];
            if (createMissingTasks) {
                const missingTasksResult = await this.generateTasksFromVision(projectId, true);
                tasksCreated = missingTasksResult.created.length;
                errors.push(...missingTasksResult.errors);
            }
            logger.info(`Linked ${links.length} documents with ${tasksCreated} new tasks created`);
            return { linked: links, tasksCreated, errors };
        }
        catch (error) {
            logger.error(`Error linking documents to strategic goals:`, error);
            return { linked: [], tasksCreated: 0, errors: [error.message] };
        }
    }
    async updateTaskStatus(taskId, status, notes) {
        try {
            logger.info(`Updating task ${taskId} status to ${status}`);
            const searchResult = await this.documentManager.searchDocuments({
                searchType: 'keyword',
                query: `task_id:${taskId}`,
                documentTypes: ['task'],
                includeContent: true,
            });
            if (!(searchResult.success && searchResult.data?.documents?.length)) {
                return {
                    success: false,
                    updatedDocuments: [],
                    error: 'Task not found',
                };
            }
            const taskDoc = searchResult.data.documents[0];
            const updatedMetadata = {
                ...taskDoc.metadata,
                status,
                updated_at: new Date().toISOString(),
                status_notes: notes,
            };
            const updateResult = await this.documentManager.updateDocument(taskDoc.id, {
                status: status === 'completed' ? 'approved' : 'draft',
                metadata: updatedMetadata,
            });
            if (!updateResult.success) {
                return {
                    success: false,
                    updatedDocuments: [],
                    error: updateResult.error?.message,
                };
            }
            const updatedDocuments = [];
            if (taskDoc.related_documents?.length > 0) {
                for (const docId of taskDoc.related_documents) {
                    try {
                        const docResult = await this.documentManager.getDocument(docId);
                        if (docResult.success && docResult.data) {
                            const updatedDoc = await this.documentManager.updateDocument(docId, {
                                metadata: {
                                    ...docResult.data.metadata,
                                    task_completion_updated: new Date().toISOString(),
                                },
                            });
                            if (updatedDoc.success) {
                                updatedDocuments.push(docId);
                            }
                        }
                    }
                    catch (docError) {
                        logger.warn(`Could not update related document ${docId}:`, docError);
                    }
                }
            }
            logger.info(`Task ${taskId} updated successfully, ${updatedDocuments.length} related documents updated`);
            return { success: true, updatedDocuments };
        }
        catch (error) {
            logger.error(`Error updating task status:`, error);
            return { success: false, updatedDocuments: [], error: error.message };
        }
    }
    async extractAndGenerateStrategicTasks(vision, documents) {
        const tasks = [];
        for (let i = 0; i < vision.strategicGoals.length; i++) {
            const goal = vision.strategicGoals[i];
            const goalId = `goal_${i}_${goal.toLowerCase().replace(/\s+/g, '_')}`;
            tasks.push({
                id: `${goalId}_implementation`,
                title: `Implement: ${goal}`,
                description: `Strategic implementation task for goal: ${goal}`,
                priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
                status: 'todo',
                strategicGoalId: goalId,
                relatedDocuments: [],
                estimatedEffort: 'large',
                tags: ['strategic-goal', 'implementation'],
                businessValue: vision.businessValue * 0.8,
                technicalComplexity: vision.technicalImpact * 0.7,
                dependencies: [],
                outcomes: [goal],
                metrics: vision.keyMetrics,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const hasDocumentation = documents.some((doc) => doc.keywords?.some((keyword) => goal.toLowerCase().includes(keyword.toLowerCase())));
            if (!hasDocumentation) {
                tasks.push({
                    id: `${goalId}_documentation`,
                    title: `Document: ${goal}`,
                    description: `Create documentation for strategic goal: ${goal}`,
                    priority: 'medium',
                    status: 'todo',
                    strategicGoalId: goalId,
                    relatedDocuments: [],
                    estimatedEffort: 'medium',
                    tags: ['documentation', 'strategic-goal'],
                    businessValue: vision.businessValue * 0.6,
                    technicalComplexity: 0.3,
                    dependencies: [],
                    outcomes: [`${goal} documented`],
                    metrics: ['Documentation quality', 'Clarity score'],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
        for (let i = 0; i < vision.risks.length; i++) {
            const risk = vision.risks[i];
            tasks.push({
                id: `risk_mitigation_${i}_${risk.toLowerCase().replace(/\s+/g, '_')}`,
                title: `Mitigate Risk: ${risk}`,
                description: `Address and mitigate identified risk: ${risk}`,
                priority: 'high',
                status: 'todo',
                strategicGoalId: 'risk_management',
                relatedDocuments: [],
                estimatedEffort: 'medium',
                tags: ['risk-mitigation', 'strategic'],
                businessValue: 0.7,
                technicalComplexity: 0.6,
                dependencies: [],
                outcomes: [`${risk} mitigated`],
                metrics: ['Risk reduction', 'Mitigation effectiveness'],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        return tasks;
    }
    async createDocumentTaskLinks(documents, tasks) {
        const links = [];
        for (const doc of documents) {
            const linkedTasks = tasks.filter((task) => task.relatedDocuments.includes(doc.id) ||
                task.tags.some((tag) => doc.tags?.includes(tag)) ||
                doc.keywords?.some((keyword) => task.title.toLowerCase().includes(keyword.toLowerCase()) ||
                    task.description.toLowerCase().includes(keyword.toLowerCase())));
            const completedTasks = linkedTasks.filter((task) => task.status === 'completed');
            const completionStatus = linkedTasks.length > 0 ? completedTasks.length / linkedTasks.length : 0;
            links.push({
                documentId: doc.id,
                documentType: doc.type,
                documentTitle: doc.title,
                linkedTasks: linkedTasks.map((task) => task.id),
                strategicGoals: Array.from(new Set(linkedTasks.map((task) => task.strategicGoalId))),
                completionStatus,
                lastUpdated: new Date(),
            });
        }
        return links;
    }
    calculateDashboardMetrics(vision, tasks, documentLinks) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.status === 'completed').length;
        const blockedTasks = tasks.filter((task) => task.status === 'blocked').length;
        const highPriorityTasks = tasks.filter((task) => task.priority === 'high' || task.priority === 'critical').length;
        const averageBusinessValue = tasks.length > 0
            ? tasks.reduce((sum, task) => sum + task.businessValue, 0) /
                tasks.length
            : 0;
        const goalsWithDocuments = vision.strategicGoals.filter((goal) => documentLinks.some((link) => link.strategicGoals.some((sg) => sg.includes(goal.toLowerCase().replace(/\s+/g, '_'))))).length;
        const documentCoverage = vision.strategicGoals.length > 0
            ? goalsWithDocuments / vision.strategicGoals.length
            : 0;
        const goalsWithTasks = vision.strategicGoals.filter((goal) => tasks.some((task) => task.strategicGoalId.includes(goal.toLowerCase().replace(/\s+/g, '_')))).length;
        const taskCoverage = vision.strategicGoals.length > 0
            ? goalsWithTasks / vision.strategicGoals.length
            : 0;
        return {
            totalTasks,
            completedTasks,
            blockedTasks,
            highPriorityTasks,
            averageBusinessValue,
            documentCoverage,
            taskCoverage,
        };
    }
    async generateRecommendations(vision, tasks, documentLinks) {
        const missingDocuments = [];
        const suggestedTasks = [];
        const riskMitigations = [];
        const optimizationOpportunities = [];
        for (const goal of vision.strategicGoals) {
            const hasDoc = documentLinks.some((link) => link.strategicGoals.some((sg) => sg.includes(goal.toLowerCase().replace(/\s+/g, '_'))));
            if (!hasDoc) {
                missingDocuments.push(`Documentation for: ${goal}`);
            }
        }
        if (documentLinks.filter((link) => link.completionStatus < 0.5).length > 0) {
            suggestedTasks.push({
                title: 'Review and update incomplete document implementations',
                priority: 'medium',
                estimatedEffort: 'medium',
                tags: ['review', 'completion'],
            });
        }
        for (const risk of vision.risks) {
            const hasTask = tasks.some((task) => task.title.toLowerCase().includes('risk') &&
                task.description.toLowerCase().includes(risk.toLowerCase()));
            if (!hasTask) {
                riskMitigations.push(`Create mitigation plan for: ${risk}`);
            }
        }
        if (tasks.filter((task) => task.status === 'blocked').length >
            tasks.length * 0.2) {
            optimizationOpportunities.push('High number of blocked tasks - review dependencies and bottlenecks');
        }
        if (vision.businessValue < 0.6 || vision.technicalImpact < 0.6) {
            optimizationOpportunities.push('Strategic vision could be strengthened with more detailed documentation');
        }
        return {
            missingDocuments,
            suggestedTasks,
            riskMitigations,
            optimizationOpportunities,
        };
    }
    createTaskDocumentContent(task) {
        return `# ${task.title}

## Description
${task.description}

## Strategic Goal
${task.strategicGoalId}

## Priority & Effort
- **Priority**: ${task.priority}
- **Estimated Effort**: ${task.estimatedEffort}
- **Business Value**: ${Math.round(task.businessValue * 100)}%
- **Technical Complexity**: ${Math.round(task.technicalComplexity * 100)}%

## Expected Outcomes
${task.outcomes.map((outcome) => `- ${outcome}`).join('\n')}

## Success Metrics
${task.metrics.map((metric) => `- ${metric}`).join('\n')}

## Dependencies
${task.dependencies.length > 0 ? task.dependencies.map((dep) => `- ${dep}`).join('\n') : 'No dependencies'}

## Status
Current Status: ${task.status}
${task.dueDate ? `Due Date: ${task.dueDate.toLocaleDateString()}` : ''}
${task.assignedTo ? `Assigned To: ${task.assignedTo}` : ''}

---
*Generated by Document-Task-Vision Coordinator*
*Created: ${task.createdAt.toLocaleString()}*
*Last Updated: ${task.updatedAt.toLocaleString()}*
`;
    }
}
export default DocumentTaskVisionCoordinator;
//# sourceMappingURL=document-task-vision-coordinator.js.map