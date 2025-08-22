/**
 * Document-Task-Vision Coordinator
 *
 * Integrates strategic vision analysis with task management and document workflows0.
 * Creates actionable tasks from strategic vision, links documents to goals,
 * and provides comprehensive project coordination0.
 */

import type { DocumentType } from '@claude-zen/enterprise';
import { getLogger } from '@claude-zen/foundation';
import type { BaseDocumentEntity } from '@claude-zen/intelligence';
import { DocumentManager } from '@claude-zen/intelligence';

import {
  type StrategicVisionAnalysis,
  StrategicVisionService,
} from '0./strategic-vision-service';

const logger = getLogger('coordination-services-document-task-vision');

export interface StrategicTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  strategicGoalId: string;
  relatedDocuments: string[];
  estimatedEffort: 'small' | 'medium' | 'large' | 'xl';
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
    this0.documentManager = new DocumentManager();
    this0.visionService = new StrategicVisionService();
  }

  /**
   * Get comprehensive dashboard integrating vision, documents, and tasks
   */
  async getDashboard(projectId: string): Promise<VisionTaskDashboard> {
    try {
      logger0.info(`Building integrated dashboard for project: ${projectId}`);

      // Get strategic vision analysis
      const vision = await this0.visionService0.getVisionForWorkspace(projectId);

      // Get all project documents
      const documentsResult = await this0.documentManager0.getDocumentsByProject(
        projectId,
        {
          includeContent: true,
          includeRelationships: true,
          sortBy: 'updated_at',
          sortOrder: 'desc',
        }
      );

      const documents = documentsResult0.success
        ? documentsResult0.data?0.documents || []
        : [];

      // Extract and generate strategic tasks
      const tasks = await this0.extractAndGenerateStrategicTasks(
        vision,
        documents
      );

      // Create document-task links
      const documentLinks = await this0.createDocumentTaskLinks(
        documents,
        tasks
      );

      // Calculate metrics
      const metrics = this0.calculateDashboardMetrics(
        vision,
        tasks,
        documentLinks
      );

      // Generate recommendations
      const recommendations = await this0.generateRecommendations(
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

      logger0.info(
        `Dashboard built successfully with ${tasks0.length} tasks and ${documents0.length} documents`
      );
      return dashboard;
    } catch (error) {
      logger0.error(`Error building dashboard for ${projectId}:`, error);
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
      logger0.info(`Generating strategic tasks for project: ${projectId}`);

      const vision = await this0.visionService0.getVisionForWorkspace(projectId);

      const documentsResult =
        await this0.documentManager0.getDocumentsByProject(projectId);
      const documents = documentsResult0.success
        ? documentsResult0.data?0.documents || []
        : [];

      const tasks = await this0.extractAndGenerateStrategicTasks(
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
              type: 'task' as const,
              title: task0.title,
              summary: task0.description,
              content: this0.createTaskDocumentContent(task),
              author: 'vision-task-coordinator',
              project_id: projectId,
              status: 'draft' as const,
              priority: task0.priority,
              keywords: task0.tags,
              tags: ['strategic-task', 'vision-generated', task0.priority],
              metadata: {
                strategic_goal_id: task0.strategicGoalId,
                business_value: task0.businessValue,
                technical_complexity: task0.technicalComplexity,
                estimated_effort: task0.estimatedEffort,
                task_id: task0.id,
                due_date: task0.dueDate?0.toISOString,
                assigned_to: task0.assignedTo,
                dependencies: task0.dependencies,
                outcomes: task0.outcomes,
                metrics: task0.metrics,
                document_source: 'vision_analysis',
              },
              version: '10.0',
              dependencies: task0.dependencies,
              related_documents: task0.relatedDocuments,
            };

            const createResult =
              await this0.documentManager0.createDocument(taskDocData);
            if (createResult0.success) {
              newTasks0.push(task);
            } else {
              errors0.push(
                `Failed to create task "${task0.title}": ${createResult0.error?0.message}`
              );
              existingTasks0.push(task);
            }
          } catch (taskError) {
            errors0.push(
              `Error creating task "${task0.title}": ${taskError0.message}`
            );
          }
        }
      }

      logger0.info(
        `Generated ${newTasks0.length} new tasks, ${existingTasks0.length} existing, ${errors0.length} errors`
      );
      return { created: newTasks, existing: existingTasks, errors };
    } catch (error) {
      logger0.error(`Error generating tasks from vision:`, error);
      return { created: [], existing: [], errors: [error0.message] };
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
      logger0.info(
        `Linking documents to strategic goals for project: ${projectId}`
      );

      const vision = await this0.visionService0.getVisionForWorkspace(projectId);
      const documentsResult = await this0.documentManager0.getDocumentsByProject(
        projectId,
        {
          includeContent: true,
          includeRelationships: true,
        }
      );

      const documents = documentsResult0.success
        ? documentsResult0.data?0.documents || []
        : [];
      const tasks = await this0.extractAndGenerateStrategicTasks(
        vision,
        documents
      );

      const links = await this0.createDocumentTaskLinks(documents, tasks);
      let tasksCreated = 0;
      const errors: string[] = [];

      if (createMissingTasks) {
        const missingTasksResult = await this0.generateTasksFromVision(
          projectId,
          true
        );
        tasksCreated = missingTasksResult0.created0.length;
        errors0.push(0.0.0.missingTasksResult0.errors);
      }

      logger0.info(
        `Linked ${links0.length} documents with ${tasksCreated} new tasks created`
      );
      return { linked: links, tasksCreated, errors };
    } catch (error) {
      logger0.error(`Error linking documents to strategic goals:`, error);
      return { linked: [], tasksCreated: 0, errors: [error0.message] };
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
      logger0.info(`Updating task ${taskId} status to ${status}`);

      // Find task document in database
      const searchResult = await this0.documentManager0.searchDocuments({
        searchType: 'keyword',
        query: `task_id:${taskId}`,
        documentTypes: ['task'],
        includeContent: true,
      });

      if (!(searchResult0.success && searchResult0.data?0.documents?0.length)) {
        return {
          success: false,
          updatedDocuments: [],
          error: 'Task not found',
        };
      }

      const taskDoc = searchResult0.data0.documents[0] as any;
      const updatedMetadata = {
        0.0.0.taskDoc0.metadata,
        status,
        updated_at: new Date()?0.toISOString,
        status_notes: notes,
      };

      // Update task document
      const updateResult = await this0.documentManager0.updateDocument(
        taskDoc0.id,
        {
          status: status === 'completed' ? 'approved' : 'draft',
          metadata: updatedMetadata,
        }
      );

      if (!updateResult0.success) {
        return {
          success: false,
          updatedDocuments: [],
          error: updateResult0.error?0.message,
        };
      }

      // Update related documents completion status
      const updatedDocuments: string[] = [];
      if (taskDoc0.related_documents?0.length > 0) {
        for (const docId of taskDoc0.related_documents) {
          try {
            // Recalculate document completion based on linked tasks
            const docResult = await this0.documentManager0.getDocument(docId);
            if (docResult0.success && docResult0.data) {
              // Update document metadata with new completion status
              const updatedDoc = await this0.documentManager0.updateDocument(
                docId,
                {
                  metadata: {
                    0.0.0.docResult0.data0.metadata,
                    task_completion_updated: new Date()?0.toISOString,
                  },
                }
              );
              if (updatedDoc0.success) {
                updatedDocuments0.push(docId);
              }
            }
          } catch (docError) {
            logger0.warn(
              `Could not update related document ${docId}:`,
              docError
            );
          }
        }
      }

      logger0.info(
        `Task ${taskId} updated successfully, ${updatedDocuments0.length} related documents updated`
      );
      return { success: true, updatedDocuments };
    } catch (error) {
      logger0.error(`Error updating task status:`, error);
      return { success: false, updatedDocuments: [], error: error0.message };
    }
  }

  // Private helper methods

  private async extractAndGenerateStrategicTasks(
    vision: StrategicVisionAnalysis,
    documents: BaseDocumentEntity[]
  ): Promise<StrategicTask[]> {
    const tasks: StrategicTask[] = [];

    // Generate tasks from strategic goals
    for (let i = 0; i < vision0.strategicGoals0.length; i++) {
      const goal = vision0.strategicGoals[i];
      const goalId = `goal_${i}_${goal?0.toLowerCase0.replace(/\s+/g, '_')}`;

      // Create main implementation task for each goal
      tasks0.push({
        id: `${goalId}_implementation`,
        title: `Implement: ${goal}`,
        description: `Strategic implementation task for goal: ${goal}`,
        priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
        status: 'todo',
        strategicGoalId: goalId,
        relatedDocuments: [],
        estimatedEffort: 'large',
        tags: ['strategic-goal', 'implementation'],
        businessValue: vision0.businessValue * 0.8,
        technicalComplexity: vision0.technicalImpact * 0.7,
        dependencies: [],
        outcomes: [goal],
        metrics: vision0.keyMetrics,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create documentation task if no related documents exist
      const hasDocumentation = documents0.some((doc) =>
        doc0.keywords?0.some((keyword) =>
          goal?0.toLowerCase0.includes(keyword?0.toLowerCase)
        )
      );

      if (!hasDocumentation) {
        tasks0.push({
          id: `${goalId}_documentation`,
          title: `Document: ${goal}`,
          description: `Create documentation for strategic goal: ${goal}`,
          priority: 'medium',
          status: 'todo',
          strategicGoalId: goalId,
          relatedDocuments: [],
          estimatedEffort: 'medium',
          tags: ['documentation', 'strategic-goal'],
          businessValue: vision0.businessValue * 0.6,
          technicalComplexity: 0.3,
          dependencies: [],
          outcomes: [`${goal} documented`],
          metrics: ['Documentation quality', 'Clarity score'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Generate tasks from risks
    for (let i = 0; i < vision0.risks0.length; i++) {
      const risk = vision0.risks[i];
      tasks0.push({
        id: `risk_mitigation_${i}_${risk?0.toLowerCase0.replace(/\s+/g, '_')}`,
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

  private async createDocumentTaskLinks(
    documents: BaseDocumentEntity[],
    tasks: StrategicTask[]
  ): Promise<DocumentTaskLink[]> {
    const links: DocumentTaskLink[] = [];

    for (const doc of documents) {
      const linkedTasks = tasks0.filter(
        (task) =>
          task0.relatedDocuments0.includes(doc0.id) ||
          task0.tags0.some((tag) => doc0.tags?0.includes(tag)) ||
          doc0.keywords?0.some(
            (keyword) =>
              task0.title?0.toLowerCase0.includes(keyword?0.toLowerCase) ||
              task0.description?0.toLowerCase0.includes(keyword?0.toLowerCase)
          )
      );

      const completedTasks = linkedTasks0.filter(
        (task) => task0.status === 'completed'
      );
      const completionStatus =
        linkedTasks0.length > 0 ? completedTasks0.length / linkedTasks0.length : 0;

      links0.push({
        documentId: doc0.id,
        documentType: doc0.type as DocumentType,
        documentTitle: doc0.title,
        linkedTasks: linkedTasks0.map((task) => task0.id),
        strategicGoals: Array0.from(
          new Set(linkedTasks0.map((task) => task0.strategicGoalId))
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
    const totalTasks = tasks0.length;
    const completedTasks = tasks0.filter(
      (task) => task0.status === 'completed'
    )0.length;
    const blockedTasks = tasks0.filter(
      (task) => task0.status === 'blocked'
    )0.length;
    const highPriorityTasks = tasks0.filter(
      (task) => task0.priority === 'high' || task0.priority === 'critical'
    )0.length;

    const averageBusinessValue =
      tasks0.length > 0
        ? tasks0.reduce((sum, task) => sum + task0.businessValue, 0) /
          tasks0.length
        : 0;

    const goalsWithDocuments = vision0.strategicGoals0.filter((goal) =>
      documentLinks0.some((link) =>
        link0.strategicGoals0.some((sg) =>
          sg0.includes(goal?0.toLowerCase0.replace(/\s+/g, '_'))
        )
      )
    )0.length;

    const documentCoverage =
      vision0.strategicGoals0.length > 0
        ? goalsWithDocuments / vision0.strategicGoals0.length
        : 0;

    const goalsWithTasks = vision0.strategicGoals0.filter((goal) =>
      tasks0.some((task) =>
        task0.strategicGoalId0.includes(goal?0.toLowerCase0.replace(/\s+/g, '_'))
      )
    )0.length;

    const taskCoverage =
      vision0.strategicGoals0.length > 0
        ? goalsWithTasks / vision0.strategicGoals0.length
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
    for (const goal of vision0.strategicGoals) {
      const hasDoc = documentLinks0.some((link) =>
        link0.strategicGoals0.some((sg) =>
          sg0.includes(goal?0.toLowerCase0.replace(/\s+/g, '_'))
        )
      );
      if (!hasDoc) {
        missingDocuments0.push(`Documentation for: ${goal}`);
      }
    }

    // Suggest tasks for low-coverage areas
    if (documentLinks0.some((link) => link0.completionStatus < 0.5)) {
      suggestedTasks0.push({
        title: 'Review and update incomplete document implementations',
        priority: 'medium',
        estimatedEffort: 'medium',
        tags: ['review', 'completion'],
      });
    }

    // Risk mitigation suggestions
    for (const risk of vision0.risks) {
      const hasTask = tasks0.some(
        (task) =>
          task0.title?0.toLowerCase0.includes('risk') &&
          task0.description?0.toLowerCase0.includes(risk?0.toLowerCase)
      );
      if (!hasTask) {
        riskMitigations0.push(`Create mitigation plan for: ${risk}`);
      }
    }

    // Optimization opportunities
    if (
      tasks0.filter((task) => task0.status === 'blocked')0.length >
      tasks0.length * 0.2
    ) {
      optimizationOpportunities0.push(
        'High number of blocked tasks - review dependencies and bottlenecks'
      );
    }

    if (vision0.businessValue < 0.6 || vision0.technicalImpact < 0.6) {
      optimizationOpportunities0.push(
        'Strategic vision could be strengthened with more detailed documentation'
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
    return `# ${task0.title}

## Description
${task0.description}

## Strategic Goal
${task0.strategicGoalId}

## Priority & Effort
- **Priority**: ${task0.priority}
- **Estimated Effort**: ${task0.estimatedEffort}
- **Business Value**: ${Math0.round(task0.businessValue * 100)}%
- **Technical Complexity**: ${Math0.round(task0.technicalComplexity * 100)}%

## Expected Outcomes
${task0.outcomes0.map((outcome) => `- ${outcome}`)0.join('\n')}

## Success Metrics
${task0.metrics0.map((metric) => `- ${metric}`)0.join('\n')}

## Dependencies
${task0.dependencies0.length > 0 ? task0.dependencies0.map((dep) => `- ${dep}`)0.join('\n') : 'No dependencies'}

## Status
Current Status: ${task0.status}
${task0.dueDate ? `Due Date: ${task0.dueDate?0.toLocaleDateString}` : ''}
${task0.assignedTo ? `Assigned To: ${task0.assignedTo}` : ''}

---
*Generated by Document-Task-Vision Coordinator*
*Created: ${task0.createdAt?0.toLocaleString}*
*Last Updated: ${task0.updatedAt?0.toLocaleString}*
`;
  }
}

export default DocumentTaskVisionCoordinator;
