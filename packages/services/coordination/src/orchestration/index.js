/**
 * @fileoverview Orchestration Domain - Task Flow Management and Enterprise Coordination
 *
 * Clean orchestration implementation consolidating task management and enterprise coordination
 */
// Task orchestration manager
export class TaskOrchestrator {
    tasks = new Map();
    wipLimits;
    constructor(wipLimits) {
        this.wipLimits = wipLimits;
    }
    async createTask(task) {
        const newTask = {
            id: Math.random().toString(36),
            ...task,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.tasks.set(newTask.id, newTask);
        return newTask;
    }
    async moveTask(taskId, newState) {
        const task = this.tasks.get(taskId);
        if (!task)
            return false;
        // Check WIP limits
        const tasksInState = Array.from(this.tasks.values()).filter(t => t.state === newState);
        const limit = this.wipLimits[newState];
        if (limit && tasksInState.length >= limit) {
            throw new Error(`WIP limit exceeded for state ${newState}`);
        }
        task.state = newState;
        task.updatedAt = new Date();
        return true;
    }
    getFlowMetrics() {
        // Calculate flow metrics
        return {
            throughput: 0,
            cycleTime: 0,
            leadTime: 0,
            wipUtilization: 0
        };
    }
}
// Enterprise coordinator
export class EnterpriseCoordinator {
    epics = new Map();
    features = new Map();
    stories = new Map();
    async createEpic(epic) {
        const newEpic = {
            id: Math.random().toString(36),
            ...epic,
            features: []
        };
        this.epics.set(newEpic.id, newEpic);
        return newEpic;
    }
    async createFeature(feature) {
        const newFeature = {
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
    async createStory(story) {
        const newStory = {
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
export function createOrchestrationSystem(wipLimits) {
    return {
        taskOrchestrator: new TaskOrchestrator(wipLimits),
        enterpriseCoordinator: new EnterpriseCoordinator()
    };
}
// Legacy compatibility exports
export { TaskOrchestrator as TaskMaster };
export { EnterpriseCoordinator as EnterpriseCoordination };
