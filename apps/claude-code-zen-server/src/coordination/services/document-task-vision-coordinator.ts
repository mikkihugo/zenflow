/**
 * @file Document Task Vision Coordinator
 * Coordinates strategic document analysis with task management
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';
import type { BaseDocumentEntity } from '@claude-zen/intelligence';
import { DocumentManager } from '@claude-zen/intelligence';

import {
  type StrategicVisionAnalysis,
  StrategicVisionService
} from './strategic-vision-service';

const logger = getLogger('coordination-services-document-task-vision);

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
  businessValue: number;
  // 0-1 score
  technicalComplexity: number;
  // 0-1 score
  dependencies: string[];
  outcomes: string[];
  metrics: string[];
  createdAt: Date;
  updatedAt: Date

}

export interface TaskPlanningContext {
  availableResources: string[];
  timeConstraints: {
    startDate: Date;
  deadline?: Date;
  milestones: Array<{ date: Date;
  description: string
}>
};
  stakeholders: string[];
  constraints: string[]
}

export interface VisionTaskMapping {
  visionAnalysis: StrategicVisionAnalysis;
  generatedTasks: StrategicTask[];
  planningContext: TaskPlanningContext;
  confidenceScore: number;
  recommendations: string[]

}

/**
 * Document Task Vision Coordinator
 * Coordinates between strategic document analysis and task generation
 */
export class DocumentTaskVisionCoordinator {
  private readonly logger: Logger;
  private readonly documentManager: DocumentManager;
  private readonly visionService: StrategicVisionService;
  private readonly activeMappings = new Map<string, VisionTaskMapping>();

  constructor(
    documentManager: DocumentManager,
    visionService: StrategicVisionService
  ) {
  this.logger = getLogger('DocumentTaskVisionCoordinator);
    this.documentManager = documentManager;
    this.visionService = visionService

}

  /**
   * Analyze documents and generate strategic tasks
   */
  async analyzeDocumentsAndGenerateTasks(
  documentIds: string[],
  planningContext: TaskPlanningContext
  ': Promise<VisionTaskMapping> {
    this.logger.info('Starting document analysis and task generation',
  {
  documetCount: documentIds.length,
  context: planningContext

}
);

    try {
      // Load documents
      const documents = await this.loadDocuments(documentIds);

      // Perform strategic vision analysis
      const visionAnalysis = await this.visionService.analyzeDocuments(documents);

      // Generate tasks based on vision analysis
      const generatedTasks = await this.generateTasksFromVision(
        visionAnalysis,
        planningContext
      );

      // Calculate confidence and recommendations
      const confidenceScore = this.calculateConfidenceScore(
        visionAnalysis,
        generatedTasks
      );

      const recommendations = this.generateRecommendations(
  visionAnalysis,
  generatedTasks,
  planningContext
);

      const mapping: VisionTaskMapping = {
  visionAnalysis,
  generatedTasks,
  planningContext,
  confidenceScore,
  recommendations

};

      // Cache the mapping
      const mappingId = this.generateMappingId(documentIds);
      this.activeMappings.set(mappingId, mapping);

      this.logger.info(
  'Document analysis and task generation completed',
  {
  mappingId,
  taskCount: generate'Tasks.length,
  confidence: confidenceScore

}
);

      return mapping
} catch (error) {
      this.logger.error('Failed to analyze documents and generate tasks', {
  error: error in'tanceof Error ? error.message : String(error),
  documentIds

});
      throw error
}
  }

  /**
   * Refine existing tasks based on updated document analysis
   */
  async refineTasks(mappingId: string,
    updatedDocumentIds: string[]
  ): Promise<VisionTaskMapping>  {
    const existingMapping = this.activeMappings.get(mappingId);
    if (!existingMapping) {
      throw new Error('Mapping ' + mappingId + ' not found)'
}

    this.logger.info(
  'Refining tasks based on updated documents',
  {
  mappingId,
  updatedDocument: updatedDocumentIds.length

}
);

    // Re-analyze with updated documents
    const allDocumentIds = [
      ...new Set([
        ...existingMapping.visionAnalysis.sourceDocuments.map(d => d.id),
        ...updatedDocumentIds,
      ]),
    ];

    return this.analyzeDocumentsAndGenerateTasks(
      allDocumentIds,
      existingMapping.planningContext
    )
}

  /**
   * Get task dependencies and relationships
   */
  getTaskDependencies(tasks: StrategicTask[]): Map<string, string[]>  {
    const dependencies = new Map<string, string[]>();

    for (const task of tasks) {
  dependencies.set(task.id,
  task.dependencies)

}

    return dependencies
}

  /**
   * Generate execution timeline for tasks
   */
  generateExecutionTimeline(tasks: StrategicTask[],
    context: TaskPlanningContext
  ): Array< {
  date: Date; tasks: StrategicTask[]; milestone?: string
}> {
    const timeline: Array<{
  date: Date; tasks: StrategicTask[]; milestone?: string
}> = [];
    const sortedTasks = this.sortTasksByPriority(tasks);

    let currentDate = context.timeConstraints.startDate;
    const increment = 7; // 1 week increments

    for (const task of sortedTasks) {
      timeline.push({
  date: new Date(currentDate),
  tasks: [task]

});

      // Add time based on effort estimation
      const daysToAdd = this.getEffortInDays(task.estimatedEffort);
      currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
}

    // Add milestones
    for (const milestone of context.timeConstraints.milestones) {
      const existingEntry = timeline.find(entry =>
        entry.date.toDateString() === milestone.date.toDateString()
      );

      if (existingEntry) {
        existingEntry.milestone = milestone.description
} else {
        timeline.push(
  {
  date: milestone.date,
  tasks: [],
  milestone: milestone.description

}
)
}
    }

    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime())
}

  private async loadDocuments(documentIds: string[]): Promise<BaseDocumentEntity[]>  {
    const documents: BaseDocumentEntity[] = [];

    for (const id of documentIds) {
      try {
        const doc = await this.documentManager.getDocument(id);
        if (doc) {
          documents.push(doc)
}
      } catch (error) {
        this.logger.warn('Failed to load document ' + id + '', { error })'
}
    }

    return documents
}

  private async generateTasksFromVision(
    analysis: StrategicVisionAnalysis,
    context: TaskPlanningContext
  ': Promise<StrategicTask[]> {
    const tasks: StrategicTask[] = [];

    // Generate tasks from strategic goals
    for (const goal of analysis.strategicGoals) {
  const goalTasks = this.createTasksForGoal(
  goal,
  analysis,
  context
);
      tasks.push(...goalTasks)

}

    // Generate tasks from identified gaps
    if (analysis.gaps) {
  const gapTasks = this.createTasksForGaps(analysis.gaps,
  context);
      tasks.push(...gapTasks)

}

    // Generate tasks from opportunities
    if (analysis.opportunities) {
  const opportunityTasks = this.createTasksForOpportunities(analysis.opportunities,
  context);
      tasks.push(...opportunityTasks)

}

    return tasks
}

  private createTasksForGoal(
  goal: any,
  analysis: StrategicVisionAnalysis,
  context: TaskPlanningContext
): StrategicTask[]  {
    const tasks: StrategicTask[] = [];
    const baseTask: StrategicTask = {
      id: 'task-' + Date.now() + '-${
  Math.random().toString(36).substring(2,
  '9)
}',
      title: Implement:'' + goal.name || goal.description + '',
      description: goal.description || 'Strategic'task for ' + goal.name + '',
      priority: this.mapPriorityFromGoal(goal),
      status: 'todo',
      strategicGalId: goal.id || goal.name,
      relatedDocuments: analysis.sourceDocuments.map(d => d.id),
      estimatedEffort: this.estimateEffortFromGoal(goal),
      tags: goal.tags || ['strategic],
      businessValue: goal.businessValue || 0.7,
      tehnicalComplexity: goal.complexity || 0.5,
      dependencies: [],
      outcomes: goal.outcomes || [],
      metrics: goal.metrics || [],
      createdAt: new Date(),
      updatedAt: new Date()
};

    tasks.push(baseTask);
    return tasks
}

  private createTasksForGaps(gaps: any[], context: TaskPlanningContext): StrategicTask[]  {
    return gaps.map(gap => ({
      id: 'gap-task-' + Date.now() + '-${
  Math.random().toString(36).substring(2,
  '9)
}',
      title: 'AddressGap: ' + gap.area || gap.description + '',
      description: gap.description || 'Address'identified gap in ' + gap.area + '',
      priority: 'high' as const,
      status: 'todo' as c'nst,
      strategicGoalId: 'gap-analysis',
      relatedDocument: [],
      estimatedEffort: 'medium' as const,
      tags: ['gap-analysis', 'improvement],
      businessValue: 0.8,
      echnicalComplexity: 0.6,
      dependencies: [],
      outcomes: gap.outcomes || [],
      metrics: gap.metrics || [],
      createdAt: new Date(),
      updatedAt: new Date()
}))
}

  private createTasksForOpportunities(opportunities: any[], context: TaskPlanningContext): StrategicTask[]  {
    return opportunities.map(opportunity => ({
      id: 'opp-task-' + Date.now() + '-${
  Math.random().toString(36).substring(2,
  '9)
}',
      title: Pursue:'' + opportunity.name || opportunity.description + '',
      description: opportunity.description || 'Strategic'opportunity task',
      priority: 'medium' as const,
      status: 'todo' as c'nst,
      strategicGoalId: 'opportunities',
      relatedDocument: [],
      estimatedEffort: 'large' as const,
      tags: ['opportunity', 'growth],
      businessValue: 0.9,
      tecnicalComplexity: 0.4,
      dependencies: [],
      outcomes: opportunity.outcomes || [],
      metrics: opportunity.metrics || [],
      createdAt: new Date(),
      updatedAt: new Date()
}))
}

  private calculateConfidenceScore(analysis: StrategicVisionAnalysis,
    tasks: StrategicTask[]
  ): number  {
  const factors = [
      analysis.sourceDocuments.length > 0 ? 0.3 : 0,
  analysis.strategicGoals.length > 0 ? 0.3 : 0,
  tasks.length > 0 ? 0.2 : 0,
  analysis.confidence || 0.2,
  ];

    return Math.min(
  1,
  factors.reduce((sum,
  factor
) => sum + factor,
  0))

}

  private generateRecommendations(
  analysis: StrategicVisionAnalysis,
  tasks: StrategicTask[],
  context: TaskPlanningContext
): string[]  {
    const recommendations: string[] = [];

    if (tasks.length === 0) {
  recommendations.push('No tasks generated - consider reviewing document quality or strategic goals)'

}

    if(analysis.confidence && analysis.confidence < 0.7' {
  recommendations.push('Low confidence in analysis - consider additional documentation or stakeholder input)'

}

    const highPriorityTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high)';
    if(highPriorityTasks.length > tasks.length * 0.8' {
  recommendations.push('Many high-priority tasks identified - consider resource allocation and timeline)'

}

    return recommendations
}

  private sortTasksByPriority(
  tasks: StrategicTask[]': StrategicTask[] {
    const priorityOrder = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};
    return tasks.sort((a, b
) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

  private getEffortInDays(effort: StrategicTask['estimatedEffort]): number  {
    cons' effortDays = {
  small: 3,
  medium: 7,
  large: 14,
  xl: 21
};
    return effortDays[effort]
}

  private mapPriorityFromGoal(goal: any): StrategicTask['priority]  {
    if (goal.priority) {
      return goal.priority
}
    if (goal.businessValue > 0.8) return 'critical;;
    if (goal.businessValue > 0.6) return 'high;;
    if (goal.businessValue > 0.4) return 'medium;;
    return 'low'
}

  private estimateEffortFromGoal(goal: any): StrategicTask['estimatedEffort]  {
  if (goal.complexi'y > 0.8) return 'xl;;
    if (goal.complexity > 0.6) return 'large;;
    if (goal.complexity > 0.4) return 'medium;;
    return 'small;

}

  private generateMappingId(documentIds: string[]): string  {
    return 'mapping-' + Date.now() + '-${
  documentIds.join('-).substring(0,
  20)
}``
}
}