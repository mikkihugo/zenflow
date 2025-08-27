/**
 * @fileoverview Orchestration Domain - Task Flow Management and Enterprise Coordination
 *
 * Clean orchestration implementation consolidating task management and enterprise coordination
 */
export type TaskState = 'backlog' | 'analysis' | 'development' | 'testing' | 'review' | 'deployment' | 'done' | 'blocked' | 'expedite';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export interface WorkflowTask {
    id: string;
    title: string;
    description: string;
    state: TaskState;
    priority: TaskPriority;
    assignee?: string;
    estimatedEffort: number;
    actualEffort?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface TaskWIPLimits {
    backlog: number;
    analysis: number;
    development: number;
    testing: number;
    review: number;
    deployment: number;
}
export interface TaskFlowMetrics {
    throughput: number;
    cycleTime: number;
    leadTime: number;
    wipUtilization: number;
}
export declare class TaskOrchestrator {
    private tasks;
    private wipLimits;
    constructor(wipLimits: TaskWIPLimits);
    createTask(task: Omit<WorkflowTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowTask>;
    moveTask(taskId: string, newState: TaskState): Promise<boolean>;
    getFlowMetrics(): TaskFlowMetrics;
}
export interface EpicManagement {
    id: string;
    title: string;
    description: string;
    status: 'funnel' | 'analyzing' | 'backlog' | 'implementing' | 'done';
    features: FeatureManagement[];
}
export interface FeatureManagement {
    id: string;
    title: string;
    description: string;
    epicId: string;
    status: 'backlog' | 'implementing' | 'validating' | 'deployed' | 'released';
    stories: StoryManagement[];
}
export interface StoryManagement {
    id: string;
    title: string;
    description: string;
    featureId: string;
    points: number;
    status: 'backlog' | 'defined' | 'in_progress' | 'completed' | 'accepted';
}
export declare class EnterpriseCoordinator {
    private epics;
    private features;
    private stories;
    createEpic(epic: Omit<EpicManagement, 'id' | 'features'>): Promise<EpicManagement>;
    createFeature(feature: Omit<FeatureManagement, 'id' | 'stories'>): Promise<FeatureManagement>;
    createStory(story: Omit<StoryManagement, 'id'>): Promise<StoryManagement>;
}
export interface OrchestrationSystem {
    taskOrchestrator: TaskOrchestrator;
    enterpriseCoordinator: EnterpriseCoordinator;
}
export declare function createOrchestrationSystem(wipLimits: TaskWIPLimits): OrchestrationSystem;
export { TaskOrchestrator as TaskMaster };
export { EnterpriseCoordinator as EnterpriseCoordination };
//# sourceMappingURL=index.d.ts.map