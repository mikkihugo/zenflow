/**
 * Document-Task-Vision Coordinator
 *
 * Integrates strategic vision analysis with task management and document workflows.
 * Creates actionable tasks from strategic vision, links documents to goals,
 * and provides comprehensive project coordination.
 */

import type { DocumentType } from '@claude-zen/enterprise';
import { getLogger } from '@claude-zen/foundation';
import type { BaseDocumentEntity } from '@claude-zen/intelligence';
import { DocumentManager } from '@claude-zen/intelligence';

import {
  type StrategicVisionAnalysis,
  StrategicVisionService,
} from "./strategic-vision-service";

const logger = getLogger('coordination-services-document-task-vision');

export interface StrategicTask {
  id: string;
  title: string;
  description: string;
  priority: 'low'' | ''medium'' | ''high'' | ''critical');
  status: 'todo'' | ''in_progress'' | ''blocked'' | ''completed');
  strategicGoalId: string;
  relatedDocuments: string[];
  estimatedEffort: 'small'' | ''medium'' | ''large'' | ''xl');
  dueDate?: Date;
  assignedTo?: string;
  tags: string[];
  businessValue: number; // 0-1 score
  technicalComplexity: number; // 0-1 score
  dependencies: string[];
  outcomes: string[];
  metrics: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTaskLink {
  documentId: string;
  documentType: DocumentType;
  documentTitle: string;
  linkedTasks: string[];
  strategicGoals: string[];
  completionStatus: number; // 0-1 based on linked tasks
  lastUpdated: Date;
}

export interface VisionTaskDashboard {
  projectId: string;
  vision: StrategicVisionAnalysis;
  tasks: StrategicTask[];
  documents: DocumentTaskLink[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    highPriorityTasks: number;
    averageBusinessValue: number;
    documentCoverage: number; // % of goals with linked documents
    taskCoverage: number; // % of goals with linked tasks
  };
  recommendations: {
    missingDocuments: string[];
    suggestedTasks: Partial<StrategicTask>[];
    riskMitigations: string[];
    optimizationOpportunities: string[];
  };
  lastUpdated: Date;
}

export class DocumentTaskVisionCoordinator {
  private documentManager: DocumentManager;
  private visionService: StrategicVisionService;

  constructor() {
    this.documentManager = new DocumentManager();
    this.visionService = new StrategicVisionService();
  }

  /**
   * Get comprehensive dashboard integrating vision, documents, and tasks
   */
  async getDashboard(projectId: string): Promise<VisionTaskDashboard> {
    try {
      logger.info(`Building integrated dashboard for project: ${projectId}`);

      // Get strategic vision analysis
      const vision = await this.visionService.getVisionForWorkspace(projectId);

      // Get all project documents
      const documentsResult = await this.documentManager.getDocumentsByProject(
        projectId,
        {
          includeContent: true,
          includeRelationships: true,
          sortBy: 'updated_at',
          sortOrder: 'desc',
        }
      );

      const documents = documentsResult.success
        ? documentsResult.data?.documents'' | '''' | ''[]
        : [];

      // Extract and generate strategic tasks
      const tasks = await this.extractAndGenerateStrategicTasks(
        vision,
        documents
      );

      // Create document-task links
      const documentLinks = await this.createDocumentTaskLinks(
        documents,
        tasks
      );

      // Calculate metrics
      const metrics = this.calculateDashboardMetrics(
        vision,
        tasks,
        documentLinks
      );

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        vision,
        tasks,
        documentLinks
      );

      const dashboard: VisionTaskDashboard = {
        projectId,
        vision,
        tasks,
        documents: documentLinks,
        metrics,
        recommendations,
        lastUpdated: new Date(),
      };

      logger.info(
        `Dashboard built successfully with ${tasks.length} tasks and ${documents.length} documents`
      );
      return dashboard;
    } catch (error) {
      logger.error(`Error building dashboard for ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Generate strategic tasks from vision analysis and documents
   */
  async generateTasksFromVision(
    projectId: string,
    saveToDatabase = true
  ): Promise<{
    created: StrategicTask[];
    existing: StrategicTask[];
    errors: string[];
  }> {
    try {
      logger.info(`Generating strategic tasks for project: ${projectId}`);

      const vision = await this.visionService.getVisionForWorkspace(projectId);

      const documentsResult =
        await this.documentManager.getDocumentsByProject(projectId);
      const documents = documentsResult.success
        ? documentsResult.data?.documents'' | '''' | ''[]
        : [];

      const tasks = await this.extractAndGenerateStrategicTasks(
        vision,
        documents
      );
      const newTasks: StrategicTask[] = [];
      const existingTasks: StrategicTask[] = [];
      const errors: string[] = [];

      if (saveToDatabase) {
        for (const task of tasks) {
          try {
            const taskDocData = {
              type:'task' as const,
              title: task.title,
              summary: task.description,
              content: this.createTaskDocumentContent(task),
              author: 'vision-task-coordinator',
              project_id: projectId,
              status: 'draft' as const,
              priority: task.priority,
              keywords: task.tags,
              tags: ['strategic-task, vision-generated', task.priority],
              metadata: {
                strategic_goal_id: task.strategicGoalId,
                business_value: task.businessValue,
                technical_complexity: task.technicalComplexity,
                estimated_effort: task.estimatedEffort,
                task_id: task.id,
                due_date: task.dueDate?.toISOString,
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

            const createResult =
              await this.documentManager.createDocument(taskDocData);
            if (createResult.success) {
              newTasks.push(task);
            } else {
              errors.push(
                `Failed to create task "${task.title}": ${createResult.error?.message}`
              );
              existingTasks.push(task);
            }
          } catch (taskError) {
            errors.push(
              `Error creating task "${task.title}": ${taskError.message}`
            );
          }
        }
      }

      logger.info(
        `Generated ${newTasks.length} new tasks, ${existingTasks.length} existing, ${errors.length} errors`
      );
      return { created: newTasks, existing: existingTasks, errors };
    } catch (error) {
      logger.error(`Error generating tasks from vision:`, error);
      return { created: [], existing: [], errors: [error.message] };
    }
  }

  /**
   * Link documents to strategic goals and create actionable connections
   */
  async linkDocumentsToStrategicGoals(
    projectId: string,
    createMissingTasks = true
  ): Promise<{
    linked: DocumentTaskLink[];
    tasksCreated: number;
    errors: string[];
  }> {
    try {
      logger.info(
        `Linking documents to strategic goals for project: ${projectId}`
      );

      const vision = await this.visionService.getVisionForWorkspace(projectId);
      const documentsResult = await this.documentManager.getDocumentsByProject(
        projectId,
        {
          includeContent: true,
          includeRelationships: true,
        }
      );

      const documents = documentsResult.success
        ? documentsResult.data?.documents'' | '''' | ''[]
        : [];
      const tasks = await this.extractAndGenerateStrategicTasks(
        vision,
        documents
      );

      const links = await this.createDocumentTaskLinks(documents, tasks);
      let tasksCreated = 0;
      const errors: string[] = [];

      if (createMissingTasks) {
        const missingTasksResult = await this.generateTasksFromVision(
          projectId,
          true
        );
        tasksCreated = missingTasksResult.created.length;
        errors.push(...missingTasksResult.errors);
      }

      logger.info(
        `Linked ${links.length} documents with ${tasksCreated} new tasks created`
      );
      return { linked: links, tasksCreated, errors };
    } catch (error) {
      logger.error(`Error linking documents to strategic goals:`, error);
      return { linked: [], tasksCreated: 0, errors: [error.message] };
    }
  }

  /**
   * Update task status and propagate to related documents and vision
   */
  async updateTaskStatus(
    taskId: string,
    status: StrategicTask['status'],
    notes?: string
  ): Promise<{ success: boolean; updatedDocuments: string[]; error?: string }> {
    try {
      logger.info(`Updating task ${taskId} status to ${status}`);

      // Find task document in database
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

      const taskDoc = searchResult.data.documents[0] as any;
      const updatedMetadata = {
        ...taskDoc.metadata,
        status,
        updated_at: new Date()?.toISOString,
        status_notes: notes,
      };

      // Update task document
      const updateResult = await this.documentManager.updateDocument(
        taskDoc.id,
        {
          status: status === 'completed' ? 'approved' : 'draft',
          metadata: updatedMetadata,
        }
      );

      if (!updateResult.success) {
        return {
          success: false,
          updatedDocuments: [],
          error: updateResult.error?.message,
        };
      }

      // Update related documents completion status
      const updatedDocuments: string[] = [];
      if (taskDoc.related_documents?.length > 0) {
        for (const docId of taskDoc.related_documents) {
          try {
            // Recalculate document completion based on linked tasks
            const docResult = await this.documentManager.getDocument(docId);
            if (docResult.success && docResult.data) {
              // Update document metadata with new completion status
              const updatedDoc = await this.documentManager.updateDocument(
                docId,
                {
                  metadata: {
                    ...docResult.data.metadata,
                    task_completion_updated: new Date()?.toISOString,
                  },
                }
              );
              if (updatedDoc.success) {
                updatedDocuments.push(docId);
              }
            }
          } catch (docError) {
            logger.warn(
              `Could not update related document ${docId}:`,
              docError
            );
          }
        }
      }

      logger.info(
        `Task ${taskId} updated successfully, ${updatedDocuments.length} related documents updated`
      );
      return { success: true, updatedDocuments };
    } catch (error) {
      logger.error(`Error updating task status:`, error);
      return { success: false, updatedDocuments: [], error: error.message };
    }
  }

  // Private helper methods

  private async extractAndGenerateStrategicTasks(
    vision: StrategicVisionAnalysis,
    documents: BaseDocumentEntity[]
  ): Promise<StrategicTask[]> {
    const tasks: StrategicTask[] = [];

    // Generate tasks from strategic goals
    for (let i = 0; i < vision.strategicGoals.length; i++) {
      const goal = vision.strategicGoals[i];
      const goalId = `goal_${i}_${goal?.toLowerCase.replace(/\s+/g, '_')}`;

      // Create main implementation task for each goal
      tasks.push({
        id: `${goalId}_implementation`,
        title: `Implement: ${goal}`,
        description: `Strategic implementation task for goal: ${goal}`,
        priority: i < 2 ? 'high : i < 4 ? medium' : 'low',
        status: 'todo',
        strategicGoalId: goalId,
        relatedDocuments: [],
        estimatedEffort: 'large',
        tags: ['strategic-goal, implementation'],
        businessValue: vision.businessValue * .8,
        technicalComplexity: vision.technicalImpact * .7,
        dependencies: [],
        outcomes: [goal],
        metrics: vision.keyMetrics,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create documentation task if no related documents exist
      const hasDocumentation = documents.some((doc) =>
        doc.keywords?.some((keyword) =>
          goal?.toLowerCase.includes(keyword?.toLowerCase)
        )
      );

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
          tags: ['documentation, strategic-goal'],
          businessValue: vision.businessValue * .6,
          technicalComplexity: .3,
          dependencies: [],
          outcomes: [`${goal} documented`],
          metrics: ['Documentation quality, Clarity score'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Generate tasks from risks
    for (let i = 0; i < vision.risks.length; i++) {
      const risk = vision.risks[i];
      tasks.push({
        id: `risk_mitigation_${i}_${risk?.toLowerCase.replace(/\s+/g, '_')}`,
        title: `Mitigate Risk: ${risk}`,
        description: `Address and mitigate identified risk: ${risk}`,
        priority: 'high',
        status: 'todo',
        strategicGoalId: 'risk_management',
        relatedDocuments: [],
        estimatedEffort: 'medium',
        tags: ['risk-mitigation, strategic'],
        businessValue: .7,
        technicalComplexity: .6,
        dependencies: [],
        outcomes: [`${risk} mitigated`],
        metrics: ['Risk reduction, Mitigation effectiveness'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return tasks;
  }

  private async createDocumentTaskLinks(
    documents: BaseDocumentEntity[],
    tasks: StrategicTask[]
  ): Promise<DocumentTaskLink[]> {
    const links: DocumentTaskLink[] = [];

    for (const doc of documents) {
      const linkedTasks = tasks.filter(
        (task) =>
          task.relatedDocuments.includes(doc.id)'' | '''' | ''task.tags.some((tag) => doc.tags?.includes(tag))'' | '''' | ''doc.keywords?.some(
            (keyword) =>
              task.title?.toLowerCase.includes(keyword?.toLowerCase)'' | '''' | ''task.description?.toLowerCase.includes(keyword?.toLowerCase)
          )
      );

      const completedTasks = linkedTasks.filter(
        (task) => task.status ==='completed'
      );
      const completionStatus =
        linkedTasks.length > 0 ? completedTasks.length / linkedTasks.length : 0;

      links.push({
        documentId: doc.id,
        documentType: doc.type as DocumentType,
        documentTitle: doc.title,
        linkedTasks: linkedTasks.map((task) => task.id),
        strategicGoals: Array.from(
          new Set(linkedTasks.map((task) => task.strategicGoalId))
        ),
        completionStatus,
        lastUpdated: new Date(),
      });
    }

    return links;
  }

  private calculateDashboardMetrics(
    vision: StrategicVisionAnalysis,
    tasks: StrategicTask[],
    documentLinks: DocumentTaskLink[]
  ) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === 'completed'
    ).length;
    const blockedTasks = tasks.filter(
      (task) => task.status === 'blocked'
    ).length;
    const highPriorityTasks = tasks.filter(
      (task) => task.priority === 'high'' | '''' | ''task.priority === critical'
    ).length;

    const averageBusinessValue =
      tasks.length > 0
        ? tasks.reduce((sum, task) => sum + task.businessValue, 0) /
          tasks.length
        : 0;

    const goalsWithDocuments = vision.strategicGoals.filter((goal) =>
      documentLinks.some((link) =>
        link.strategicGoals.some((sg) =>
          sg.includes(goal?.toLowerCase.replace(/\s+/g, '_'))
        )
      )
    ).length;

    const documentCoverage =
      vision.strategicGoals.length > 0
        ? goalsWithDocuments / vision.strategicGoals.length
        : 0;

    const goalsWithTasks = vision.strategicGoals.filter((goal) =>
      tasks.some((task) =>
        task.strategicGoalId.includes(goal?.toLowerCase.replace(/\s+/g, '_'))
      )
    ).length;

    const taskCoverage =
      vision.strategicGoals.length > 0
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

  private async generateRecommendations(
    vision: StrategicVisionAnalysis,
    tasks: StrategicTask[],
    documentLinks: DocumentTaskLink[]
  ) {
    const missingDocuments: string[] = [];
    const suggestedTasks: Partial<StrategicTask>[] = [];
    const riskMitigations: string[] = [];
    const optimizationOpportunities: string[] = [];

    // Identify missing documentation
    for (const goal of vision.strategicGoals) {
      const hasDoc = documentLinks.some((link) =>
        link.strategicGoals.some((sg) =>
          sg.includes(goal?.toLowerCase.replace(/\s+/g, '_'))
        )
      );
      if (!hasDoc) {
        missingDocuments.push(`Documentation for: ${goal}`);
      }
    }

    // Suggest tasks for low-coverage areas
    if (documentLinks.some((link) => link.completionStatus < .5)) {
      suggestedTasks.push({
        title: 'Review and update incomplete document implementations',
        priority: 'medium',
        estimatedEffort: 'medium',
        tags: ['review, completion'],
      });
    }

    // Risk mitigation suggestions
    for (const risk of vision.risks) {
      const hasTask = tasks.some(
        (task) =>
          task.title?.toLowerCase.includes('risk') &&
          task.description?.toLowerCase.includes(risk?.toLowerCase)
      );
      if (!hasTask) {
        riskMitigations.push(`Create mitigation plan for: ${risk}`);
      }
    }

    // Optimization opportunities
    if (
      tasks.filter((task) => task.status === 'blocked').length >
      tasks.length * .2
    ) {
      optimizationOpportunities.push(
        'High number of blocked tasks - review dependencies and bottlenecks');
    }

    if (vision.businessValue < .6'' | '''' | ''vision.technicalImpact < .6) {
      optimizationOpportunities.push('Strategic vision could be strengthened with more detailed documentation'
      );
    }

    return {
      missingDocuments,
      suggestedTasks,
      riskMitigations,
      optimizationOpportunities,
    };
  }

  private createTaskDocumentContent(task: StrategicTask): string {
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
${task.dueDate ? `Due Date: ${task.dueDate?.toLocaleDateString}` : ''}
${task.assignedTo ? `Assigned To: ${task.assignedTo}` : ''}

---
*Generated by Document-Task-Vision Coordinator*
*Created: ${task.createdAt?.toLocaleString}*
*Last Updated: ${task.updatedAt?.toLocaleString}*
`;
  }
}

export default DocumentTaskVisionCoordinator;
