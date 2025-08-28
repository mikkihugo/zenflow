/**
 * @fileoverview Orchestration Domain - Task Flow Management and Enterprise Coordination
 * 
 * Clean orchestration implementation consolidating task management and enterprise coordination
 */

// Task flow management types
export type TaskState = 
|'backlog
|'analysis '
|'development
|'testing
|'review
|'deployment
|'done
|'blocked
|'expedite';
export type TaskPriority ='critical'|'high'|'medium'|'low';
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

// Task-specific WIP limits configuration
export interface TaskWIPLimits {
  backlog: number;
  analysis: number;
  development: number;
  testing: number;
  review: number;
  deployment: number;
}

// Task-specific flow metrics
export interface TaskFlowMetrics {
  throughput: number;
  cycleTime: number;
  leadTime: number;
  wipUtilization: number;
}

// Task orchestration manager
export class TaskOrchestrator {
  private tasks: Map<string, WorkflowTask> = new Map();
  private wipLimits: TaskWIPLimits;

  constructor(wipLimits: TaskWIPLimits) {
    this.wipLimits = wipLimits;
  }

  async createTask(task: Omit<WorkflowTask,'id'|'createdAt'|'updatedAt'>): Promise<WorkflowTask> {
    const newTask: WorkflowTask = {
      id: Math.random().toString(36),
      ...task,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async moveTask(taskId: string, newState: TaskState): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // Check WIP limits
    const tasksInState = Array.from(this.tasks.values()).filter(t => t.state === newState);
    const limit = this.wipLimits[newState as keyof TaskWIPLimits];
    
    if (limit && tasksInState.length >= limit) {
      throw new Error(`WIP limit exceeded for state ${newState}`);
    }

    task.state = newState;
    task.updatedAt = new Date();
    return true;
  }

  getFlowMetrics(): TaskFlowMetrics {
    // Calculate flow metrics
    return {
      throughput: 0,
      cycleTime: 0,
      leadTime: 0,
      wipUtilization: 0
    };
  }
}

// Enterprise coordination types
export interface EpicManagement {
  id: string;
  title: string;
  description: string;
  status:'funnel'|'analyzing'|'backlog'|'implementing'|'done';
  features: FeatureManagement[];
}

export interface FeatureManagement {
  id: string;
  title: string;
  description: string;
  epicId: string;
  status:'backlog'|'implementing'|'validating'|'deployed'|'released';
  stories: StoryManagement[];
}

export interface StoryManagement {
  id: string;
  title: string;
  description: string;
  featureId: string;
  points: number;
  status:'backlog'|'defined'|'in_progress'|'completed'|'accepted';
}

// Enterprise coordinator
export class EnterpriseCoordinator {
  private epics: Map<string, EpicManagement> = new Map();
  private features: Map<string, FeatureManagement> = new Map();
  private stories: Map<string, StoryManagement> = new Map();

  async createEpic(epic: Omit<EpicManagement,'id'|'features'>): Promise<EpicManagement> {
    const newEpic: EpicManagement = {
      id: Math.random().toString(36),
      ...epic,
      features: []
    };
    
    this.epics.set(newEpic.id, newEpic);
    return newEpic;
  }

  async createFeature(feature: Omit<FeatureManagement,'id'|'stories'>): Promise<FeatureManagement> {
    const newFeature: FeatureManagement = {
      id: Math.random().toString(36),
      ...feature,
      stories: []
    };
    
    this.features.set(newFeature.id, newFeature);
    
    // Add to epic
    const epic = this.epics.get(feature.epicId);
    if (epic) {
      epic.features.push(newFeature);
    }
    
    return newFeature;
  }

  async createStory(story: Omit<StoryManagement,'id'>): Promise<StoryManagement> {
    const newStory: StoryManagement = {
      id: Math.random().toString(36),
      ...story
    };
    
    this.stories.set(newStory.id, newStory);
    
    // Add to feature
    const feature = this.features.get(story.featureId);
    if (feature) {
      feature.stories.push(newStory);
    }
    
    return newStory;
  }
}

// Unified orchestration system
export interface OrchestrationSystem {
  taskOrchestrator: TaskOrchestrator;
  enterpriseCoordinator: EnterpriseCoordinator;
}

export function createOrchestrationSystem(wipLimits: TaskWIPLimits): OrchestrationSystem {
  return {
    taskOrchestrator: new TaskOrchestrator(wipLimits),
    enterpriseCoordinator: new EnterpriseCoordinator()
  };
}

// Legacy compatibility exports
export { TaskOrchestrator as TaskMaster };
export { EnterpriseCoordinator as EnterpriseCoordination };