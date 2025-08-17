/**
 * @file Composite Pattern Implementation for Agent Hierarchies
 * Provides uniform interfaces for individual agents and agent groups.
 */
import { getLogger } from '../../config/logging-config';
const logger = getLogger('coordination-agents-composite-system');
import { EventEmitter } from 'node:events';
// Individual agent implementation (Leaf)
export class Agent extends EventEmitter {
    id;
    name;
    capabilities = new Map();
    status;
    currentTask;
    taskQueue = [];
    taskHistory = [];
    maxConcurrentTasks = 1;
    resourceLimits;
    taskExecutor;
    executionStats = {
        min: Number.MAX_VALUE,
        max: 0,
        total: 0,
        count: 0,
    };
    // private config?: AgentConfig; // xxx REMOVED: config not stored, only used in initialize()
    constructor(id, name, initialCapabilities = [], resourceLimits = {
        cpu: 1.0,
        memory: 1024,
        network: 100,
        storage: 1024,
    }) {
        super();
        this.id = id;
        this.name = name;
        this.resourceLimits = resourceLimits;
        // Initialize capabilities
        initialCapabilities.forEach((cap) => {
            this.capabilities.set(cap.name, cap);
        });
        // Initialize status
        this.status = {
            id,
            state: 'initializing',
            health: 1.0,
            uptime: 0,
            queuedTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            totalCompletedTasks: 0,
            totalFailedTasks: 0,
            averageExecutionTime: 0,
            minExecutionTime: 0,
            maxExecutionTime: 0,
            lastActivity: new Date(),
            currentTasks: 0,
            lastTaskTimestamp: new Date(),
            resourceUtilization: {
                cpu: 0,
                memory: 0,
                network: 0,
                storage: 0,
            },
            resources: {
                allocated: { cpu: 0, memory: 0, network: 0, storage: 0 },
                used: { cpu: 0, memory: 0, network: 0, storage: 0 },
                available: { ...resourceLimits },
                efficiency: 1.0,
            },
        };
        // currentTask is intentionally omitted as it's optional and undefined initially
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getType() {
        return 'individual';
    }
    getCapabilities() {
        return Array.from(this.capabilities.values());
    }
    getStatus() {
        const avgExecutionTime = this.executionStats.count > 0
            ? this.executionStats.total / this.executionStats.count
            : 0;
        const minExecutionTime = this.executionStats.count > 0 ? this.executionStats.min : 0;
        const maxExecutionTime = this.executionStats.max;
        const status = {
            ...this.status,
            totalCompletedTasks: this.status.completedTasks,
            totalFailedTasks: this.status.failedTasks,
            averageExecutionTime: avgExecutionTime,
            minExecutionTime: minExecutionTime,
            maxExecutionTime: maxExecutionTime,
            currentTasks: this.status.state === 'busy' ? 1 : 0,
            lastTaskTimestamp: this.status.lastActivity,
            resourceUtilization: {
                cpu: this.resourceLimits.cpu > 0
                    ? this.status.resources.allocated.cpu / this.resourceLimits.cpu
                    : 0,
                memory: this.resourceLimits.memory > 0
                    ? this.status.resources.allocated.memory /
                        this.resourceLimits.memory
                    : 0,
                network: this.resourceLimits.network > 0
                    ? this.status.resources.allocated.network /
                        this.resourceLimits.network
                    : 0,
                storage: this.resourceLimits.storage > 0
                    ? this.status.resources.allocated.storage /
                        this.resourceLimits.storage
                    : 0,
            },
        };
        if (this.currentTask) {
            status.currentTask = this.currentTask.id;
        }
        return status;
    }
    getMetrics() {
        const successRate = this.status.completedTasks > 0
            ? this.status.completedTasks /
                (this.status.completedTasks + this.status.failedTasks)
            : 1.0;
        const avgExecutionTime = this.taskHistory.length > 0
            ? this.taskHistory
                .filter((t) => t.metrics?.executionTime)
                .reduce((sum, t) => sum + (t.metrics?.executionTime || 0), 0) /
                this.taskHistory.length
            : 0;
        return {
            totalTasks: this.status.completedTasks + this.status.failedTasks,
            successRate,
            averageExecutionTime: avgExecutionTime,
            resourceEfficiency: this.status.resources.efficiency,
            reliability: this.status.health,
            lastWeekActivity: this.generateWeeklyActivity(),
            capabilities: this.getCapabilities(),
        };
    }
    async executeTask(task) {
        // Validate task structure
        if (!task.id ||
            !task.type ||
            !task.requirements ||
            !task.requirements.capabilities) {
            throw new Error('Invalid task definition');
        }
        // Validate resources are not negative
        const resources = task.requirements.resources;
        if (resources &&
            (resources.cpu < 0 ||
                resources.memory < 0 ||
                resources.network < 0 ||
                resources.storage < 0)) {
            throw new Error('Invalid task definition - negative resources');
        }
        if (!this.canHandleTask(task)) {
            throw new Error('Agent cannot handle task');
        }
        if (this.status.state === 'busy' && this.maxConcurrentTasks <= 1) {
            // Queue the task
            this.taskQueue.push(task);
            this.status.queuedTasks = this.taskQueue.length;
            const queuedTaskResult = {
                taskId: task.id,
                agentId: this.id,
                success: false,
                executionTime: 0,
                timestamp: new Date(),
                status: 'pending',
                startTime: new Date(),
            };
            return queuedTaskResult;
        }
        return this.executeTaskImmediately(task);
    }
    canHandleTask(task) {
        // Check if agent has required capabilities
        const hasCapabilities = task.requirements.capabilities.every((reqCap) => this.capabilities.has(reqCap));
        if (!hasCapabilities)
            return false;
        // Check resource requirements
        const requiredResources = task.requirements.resources;
        return this.canAllocateResources(requiredResources);
    }
    addCapability(capability) {
        this.capabilities.set(capability.name, capability);
        this.emit('capability:added', { agentId: this.id, capability });
    }
    removeCapability(capabilityName) {
        const removed = this.capabilities.delete(capabilityName);
        if (removed) {
            this.emit('capability:removed', { agentId: this.id, capabilityName });
        }
    }
    allocateResources(requirements) {
        if (!this.canAllocateResources(requirements)) {
            return false;
        }
        this.status.resources.allocated.cpu += requirements.cpu;
        this.status.resources.allocated.memory += requirements.memory;
        this.status.resources.allocated.network += requirements.network;
        this.status.resources.allocated.storage += requirements.storage;
        this.updateAvailableResources();
        return true;
    }
    releaseResources(requirements) {
        this.status.resources.allocated.cpu = Math.max(0, this.status.resources.allocated.cpu - requirements.cpu);
        this.status.resources.allocated.memory = Math.max(0, this.status.resources.allocated.memory - requirements.memory);
        this.status.resources.allocated.network = Math.max(0, this.status.resources.allocated.network - requirements.network);
        this.status.resources.allocated.storage = Math.max(0, this.status.resources.allocated.storage - requirements.storage);
        this.updateAvailableResources();
    }
    getResourceLimits() {
        return { ...this.resourceLimits };
    }
    getAvailableResources() {
        return { ...this.status.resources.available };
    }
    async initialize(config) {
        // Config is applied to individual settings, not stored as a whole
        this.status.state = 'idle';
        this.status.lastActivity = new Date();
        // Apply configuration
        if (config?.maxConcurrentTasks) {
            this.maxConcurrentTasks = config?.maxConcurrentTasks;
        }
        if (config?.capabilities) {
            config?.capabilities.forEach((cap) => {
                this.addCapability(cap);
            });
        }
        if (config?.taskExecutor) {
            this.taskExecutor = config.taskExecutor;
        }
        this.emit('agent:initialized', { agentId: this.id, config });
    }
    async shutdown() {
        // Cancel current task if any
        if (this.currentTask) {
            await this.cancelCurrentTask();
        }
        // Clear task queue
        this.taskQueue = [];
        this.status.queuedTasks = 0;
        this.status.state = 'offline';
        this.emit('agent:shutdown', { agentId: this.id });
    }
    async pause() {
        if (this.status.state === 'busy') {
            // Let current task complete but don't start new ones
            this.status.state = 'busy'; // Keep current state
        }
        else {
            this.status.state = 'idle';
        }
        this.emit('agent:paused', { agentId: this.id });
    }
    async resume() {
        if (this.status.state !== 'offline') {
            this.status.state = 'idle';
            await this.processTaskQueue();
        }
        this.emit('agent:resumed', { agentId: this.id });
    }
    // Private helper methods
    async executeTaskImmediately(task) {
        const startTime = new Date();
        const requiredResources = task.requirements.resources;
        if (!this.allocateResources(requiredResources)) {
            throw new Error('Cannot allocate required resources');
        }
        this.currentTask = task;
        this.status.state = 'busy';
        this.status.lastActivity = startTime;
        let result;
        try {
            if (this.taskExecutor) {
                // Use custom task executor
                result = await this.taskExecutor(task);
                result.agentId = this.id; // Ensure correct agent ID
                // Use the executionTime from the task executor result
                this.updateExecutionStats(result.executionTime);
            }
            else {
                // Fallback to default simulation
                const executionTime = this.estimateExecutionTime(task);
                const outputs = await this.performTaskExecution(task, executionTime);
                const endTime = new Date();
                const actualExecutionTime = endTime.getTime() - startTime.getTime();
                result = {
                    taskId: task.id,
                    agentId: this.id,
                    success: true,
                    result: `Completed ${task.type} task`,
                    executionTime: actualExecutionTime,
                    timestamp: endTime,
                    status: 'completed',
                    startTime,
                    endTime,
                    outputs,
                    metrics: {
                        executionTime: actualExecutionTime,
                        resourceUsage: requiredResources,
                        memoryPeak: requiredResources.memory * 0.8,
                        cpuPeak: requiredResources.cpu * 0.9,
                        networkUsage: requiredResources.network * 0.6,
                        errorCount: 0,
                        retryCount: 0,
                    },
                };
                this.updateExecutionStats(actualExecutionTime);
            }
            this.status.completedTasks++;
            this.updateHealth(true);
        }
        catch (error) {
            const endTime = new Date();
            result = {
                taskId: task.id,
                agentId: this.id,
                success: false,
                executionTime: endTime.getTime() - startTime.getTime(),
                timestamp: endTime,
                status: 'failed',
                startTime,
                endTime,
                error: { message: error.message },
                metrics: {
                    executionTime: endTime.getTime() - startTime.getTime(),
                    resourceUsage: requiredResources,
                    memoryPeak: 0,
                    cpuPeak: 0,
                    networkUsage: 0,
                    errorCount: 1,
                    retryCount: 0,
                },
            };
            this.status.failedTasks++;
            this.updateHealth(false);
        }
        finally {
            this.releaseResources(requiredResources);
            this.currentTask = undefined;
            this.status.state = 'idle';
            if (result) {
                this.taskHistory.push(result);
            }
            // Process next task in queue
            await this.processTaskQueue();
        }
        this.emit('task:completed', result);
        return result;
    }
    async performTaskExecution(task, executionTime) {
        // Simulate task execution
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure based on health
                if (Math.random() < this.status.health) {
                    resolve({
                        result: `Task ${task.id} completed successfully`,
                        timestamp: new Date(),
                        agentId: this.id,
                        processingTime: executionTime,
                    });
                }
                else {
                    reject(new Error(`Task execution failed for ${task.id}`));
                }
            }, executionTime);
        });
    }
    estimateTaskResources(task) {
        // Use task requirements directly if available
        if (task.requirements?.resources) {
            return task.requirements.resources;
        }
        // Fallback to estimation
        let cpu = 0.1;
        let memory = 64;
        let network = 10;
        let storage = 10;
        // Adjust based on task type and capabilities
        task.requirements.capabilities.forEach((capName) => {
            const capability = this.capabilities.get(capName);
            if (capability?.resourceRequirements) {
                cpu += capability.resourceRequirements.cpu;
                memory += capability.resourceRequirements.memory;
                network += capability.resourceRequirements.network;
                storage += capability.resourceRequirements.storage;
            }
        });
        // Adjust based on priority
        const priorityMultiplier = {
            low: 0.8,
            medium: 1.0,
            high: 1.2,
            critical: 1.5,
        }[task.priority];
        return {
            cpu: cpu * priorityMultiplier,
            memory: memory * priorityMultiplier,
            network: network * priorityMultiplier,
            storage: storage * priorityMultiplier,
        };
    }
    estimateExecutionTime(task) {
        // Base execution time: 100ms
        let baseTime = 100;
        // Adjust based on task complexity (number of required capabilities)
        baseTime += task.requirements.capabilities.length * 50;
        // Adjust based on priority (higher priority = faster processing)
        const priorityMultiplier = {
            low: 1.5,
            medium: 1.0,
            high: 0.8,
            critical: 0.5,
        }[task.priority];
        return baseTime * priorityMultiplier;
    }
    canAllocateResources(requirements) {
        const available = this.status.resources.available;
        return (available.cpu >= requirements.cpu &&
            available.memory >= requirements.memory &&
            available.network >= requirements.network &&
            available.storage >= requirements.storage);
    }
    updateAvailableResources() {
        const allocated = this.status.resources.allocated;
        this.status.resources.available = {
            cpu: this.resourceLimits.cpu - allocated.cpu,
            memory: this.resourceLimits.memory - allocated.memory,
            network: this.resourceLimits.network - allocated.network,
            storage: this.resourceLimits.storage - allocated.storage,
        };
        // Update efficiency
        const totalAllocated = allocated.cpu + allocated.memory + allocated.network + allocated.storage;
        const totalLimits = this.resourceLimits.cpu +
            this.resourceLimits.memory +
            this.resourceLimits.network +
            this.resourceLimits.storage;
        this.status.resources.efficiency =
            totalLimits > 0 ? 1 - totalAllocated / totalLimits : 1;
    }
    updateHealth(taskSuccess) {
        // Simple health calculation based on success rate
        const totalTasks = this.status.completedTasks + this.status.failedTasks;
        if (totalTasks > 0) {
            this.status.health = this.status.completedTasks / totalTasks;
        }
        // Apply recent task result with weight
        if (taskSuccess) {
            this.status.health = Math.min(1.0, this.status.health + 0.01);
        }
        else {
            this.status.health = Math.max(0.0, this.status.health - 0.05);
        }
    }
    async processTaskQueue() {
        if (this.taskQueue.length > 0 && this.status.state === 'idle') {
            const nextTask = this.taskQueue.shift();
            if (nextTask) {
                this.status.queuedTasks = this.taskQueue.length;
                await this.executeTaskImmediately(nextTask);
            }
        }
    }
    async cancelCurrentTask() {
        if (this.currentTask) {
            const result = {
                taskId: this.currentTask.id,
                agentId: this.id,
                success: false,
                executionTime: 0,
                timestamp: new Date(),
                status: 'cancelled',
                startTime: new Date(),
                endTime: new Date(),
                error: { message: 'Task cancelled due to agent shutdown' },
            };
            this.taskHistory.push(result);
            this.emit('task:cancelled', result);
        }
    }
    generateWeeklyActivity() {
        // Generate mock weekly activity data
        return Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
    }
    updateExecutionStats(executionTime) {
        this.executionStats.count++;
        this.executionStats.total += executionTime;
        this.executionStats.min = Math.min(this.executionStats.min, executionTime);
        this.executionStats.max = Math.max(this.executionStats.max, executionTime);
    }
}
// Agent group implementation (Composite)
export class AgentGroup extends EventEmitter {
    id;
    name;
    members = new Map();
    groupCapabilities = new Map();
    loadBalancingStrategy = 'capability-based';
    currentRoundRobinIndex = 0;
    isShutdown = false;
    constructor(id, name, members = []) {
        super();
        this.id = id;
        this.name = name;
        members.forEach((member) => this.addMember(member));
        this.updateGroupCapabilities();
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getType() {
        return 'composite';
    }
    getCapabilities() {
        return Array.from(this.groupCapabilities.values());
    }
    getStatus() {
        const memberStatuses = Array.from(this.members.values()).map((member) => member.getStatus());
        const individualStatuses = memberStatuses.filter((s) => 'state' in s);
        const compositeStatuses = memberStatuses.filter((s) => 'memberCount' in s);
        const activeMemberCount = individualStatuses.filter((s) => s.state !== 'offline').length +
            compositeStatuses.filter((s) => s.state !== 'inactive').length;
        const totalHealth = [
            ...individualStatuses.map((s) => s.health),
            ...compositeStatuses.map((s) => s.health),
        ];
        const avgHealth = totalHealth.length > 0
            ? totalHealth.reduce((sum, h) => sum + h, 0) / totalHealth.length
            : 1;
        const totalQueuedTasks = individualStatuses.reduce((sum, s) => sum + s.queuedTasks, 0) +
            compositeStatuses.reduce((sum, s) => sum + s.totalQueuedTasks, 0);
        const totalCompletedTasks = individualStatuses.reduce((sum, s) => sum + s.completedTasks, 0) +
            compositeStatuses.reduce((sum, s) => sum + s.totalCompletedTasks, 0);
        const totalFailedTasks = individualStatuses.reduce((sum, s) => sum + s.failedTasks, 0) +
            compositeStatuses.reduce((sum, s) => sum + s.totalFailedTasks, 0);
        // Aggregate resources
        const totalAllocated = this.aggregateResources(individualStatuses.map((s) => s.resources.allocated));
        const totalAvailable = this.aggregateResources(individualStatuses.map((s) => s.resources.available));
        const avgEfficiency = individualStatuses.length > 0
            ? individualStatuses.reduce((sum, s) => sum + s.resources.efficiency, 0) / individualStatuses.length
            : 1;
        const lastActivity = new Date(Math.max(...memberStatuses.map((s) => 'lastActivity' in s ? s.lastActivity.getTime() : Date.now())));
        // Calculate additional metrics
        const currentTasks = individualStatuses.reduce((sum, s) => sum + s.currentTasks, 0);
        const executionTimes = individualStatuses
            .filter((s) => s.averageExecutionTime > 0)
            .map((s) => s.averageExecutionTime);
        const avgExecutionTime = executionTimes.length > 0
            ? executionTimes.reduce((sum, t) => sum + t, 0) / executionTimes.length
            : 0;
        const minTimes = individualStatuses
            .filter((s) => s.minExecutionTime > 0)
            .map((s) => s.minExecutionTime);
        const minExecutionTime = minTimes.length > 0 ? Math.min(...minTimes) : 0;
        const maxTimes = individualStatuses.map((s) => s.maxExecutionTime);
        const maxExecutionTime = maxTimes.length > 0 ? Math.max(...maxTimes) : 0;
        const uptime = individualStatuses.length > 0
            ? Math.max(...individualStatuses.map((s) => s.uptime || 0))
            : 0;
        // Calculate resource capacity and utilization
        // Get actual resource limits from agents, not utilization percentages
        const resourceCapacity = this.aggregateResources(Array.from(this.members.values())
            .filter((m) => m.getType() === 'individual')
            .map((agent) => {
            if (agent instanceof Agent) {
                const limits = agent.getResourceLimits();
                return (limits || { cpu: 1.0, memory: 1024, network: 100, storage: 100 });
            }
            // Fallback for non-Agent members
            return { cpu: 1.0, memory: 1024, network: 100, storage: 100 };
        }));
        const resourceUtilization = {
            cpu: resourceCapacity.cpu > 0
                ? totalAllocated.cpu / resourceCapacity.cpu
                : 0,
            memory: resourceCapacity.memory > 0
                ? totalAllocated.memory / resourceCapacity.memory
                : 0,
            network: resourceCapacity.network > 0
                ? totalAllocated.network / resourceCapacity.network
                : 0,
            storage: resourceCapacity.storage > 0
                ? totalAllocated.storage / resourceCapacity.storage
                : 0,
        };
        return {
            id: this.id,
            state: this.isShutdown
                ? 'shutdown'
                : activeMemberCount === 0
                    ? 'inactive'
                    : activeMemberCount === this.members.size
                        ? 'active'
                        : 'partial',
            health: avgHealth,
            memberCount: this.members.size,
            totalMembers: this.members.size,
            activeMemberCount,
            totalQueuedTasks,
            totalCompletedTasks,
            totalFailedTasks,
            currentTasks,
            averageExecutionTime: avgExecutionTime,
            minExecutionTime,
            maxExecutionTime,
            uptime,
            lastActivity,
            lastTaskTimestamp: lastActivity, // Use same as lastActivity for now
            resourceUtilization,
            resourceCapacity,
            resources: {
                totalAllocated,
                totalAvailable,
                averageEfficiency: avgEfficiency,
            },
        };
    }
    getMetrics() {
        const memberMetrics = Array.from(this.members.values()).map((member) => member.getMetrics());
        const totalTasks = memberMetrics.reduce((sum, m) => sum + m.totalTasks, 0);
        const weightedSuccessRate = memberMetrics.reduce((sum, m) => sum + m.successRate * m.totalTasks, 0) /
            totalTasks || 1;
        const avgExecutionTime = memberMetrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) /
            memberMetrics.length || 0;
        const avgResourceEfficiency = memberMetrics.reduce((sum, m) => sum + m.resourceEfficiency, 0) /
            memberMetrics.length || 1;
        const avgReliability = memberMetrics.reduce((sum, m) => sum + m.reliability, 0) /
            memberMetrics.length || 1;
        // Aggregate weekly activity
        const weeklyActivity = Array.from({ length: 7 }, (_, day) => memberMetrics.reduce((sum, m) => sum + (m.lastWeekActivity[day] || 0), 0));
        // Distribution by type
        const distributionByType = {};
        Array.from(this.members.values()).forEach((member) => {
            const type = member.getType();
            distributionByType[type] = (distributionByType[type] || 0) + 1;
        });
        return {
            totalTasks,
            successRate: weightedSuccessRate,
            averageExecutionTime: avgExecutionTime,
            resourceEfficiency: avgResourceEfficiency,
            reliability: avgReliability,
            lastWeekActivity: weeklyActivity,
            capabilities: this.getCapabilities(),
            memberMetrics: {
                totalMembers: this.members.size,
                activeMembers: Array.from(this.members.values()).filter((m) => {
                    const status = m.getStatus();
                    // Both AgentStatus and CompositeStatus have state property
                    if ('memberCount' in status) {
                        // CompositeStatus
                        return status.state !== 'inactive';
                    }
                    // AgentStatus
                    return status.state !== 'offline';
                }).length,
                averageHealth: avgReliability,
                distributionByType,
            },
        };
    }
    async executeTask(task) {
        if (!this.canHandleTask(task)) {
            throw new Error(`Agent group ${this.id} cannot handle task ${task.id}`);
        }
        const selectedAgent = this.selectAgentForTask(task);
        if (!selectedAgent) {
            throw new Error(`No suitable agent found for task ${task.id}`);
        }
        try {
            const result = await selectedAgent?.executeTask(task);
            this.emit('task:delegated', {
                taskId: task.id,
                selectedAgentId: selectedAgent?.getId(),
                groupId: this.id,
            });
            return result;
        }
        catch (error) {
            this.emit('task:delegation_failed', {
                taskId: task.id,
                selectedAgentId: selectedAgent?.getId(),
                groupId: this.id,
                error: error.message,
            });
            throw error;
        }
    }
    canHandleTask(task) {
        // Check if any member can handle the task
        return Array.from(this.members.values()).some((member) => member.canHandleTask(task));
    }
    addCapability(capability) {
        this.groupCapabilities.set(capability.name, capability);
        this.emit('group:capability_added', { groupId: this.id, capability });
    }
    removeCapability(capabilityName) {
        const removed = this.groupCapabilities.delete(capabilityName);
        if (removed) {
            this.emit('group:capability_removed', {
                groupId: this.id,
                capabilityName,
            });
        }
    }
    allocateResources(requirements) {
        // Try to find a member that can allocate the resources
        for (const member of Array.from(this.members.values())) {
            if (member.allocateResources(requirements)) {
                return true;
            }
        }
        return false;
    }
    releaseResources(requirements) {
        // This is a simplified implementation - in practice, you'd track which member allocated what
        for (const member of Array.from(this.members.values())) {
            member.releaseResources(requirements);
            break; // Release from first member (simplified)
        }
    }
    getAvailableResources() {
        const allResources = Array.from(this.members.values()).map((member) => member.getAvailableResources());
        return this.aggregateResources(allResources);
    }
    async initialize(config) {
        // Apply group-specific configuration
        if (config.loadBalancing) {
            this.setLoadBalancingStrategy(config.loadBalancing);
        }
        // Initialize all members
        const initPromises = Array.from(this.members.values()).map((member) => member
            .initialize(config)
            .catch((error) => logger.error(`Failed to initialize member ${member.getId()}:`, error)));
        await Promise.allSettled(initPromises);
        this.emit('group:initialized', {
            groupId: this.id,
            memberCount: this.members.size,
        });
    }
    async shutdown() {
        if (this.isShutdown) {
            return; // Already shutdown, avoid duplicate operations
        }
        this.isShutdown = true;
        // Shutdown all members
        const shutdownPromises = Array.from(this.members.values()).map((member) => member
            .shutdown()
            .catch((error) => logger.error(`Failed to shutdown member ${member.getId()}:`, error)));
        await Promise.allSettled(shutdownPromises);
        this.emit('group:shutdown', { groupId: this.id });
    }
    async pause() {
        // Pause all members
        const pausePromises = Array.from(this.members.values()).map((member) => member.pause());
        await Promise.allSettled(pausePromises);
        this.emit('group:paused', { groupId: this.id });
    }
    async resume() {
        // Resume all members
        const resumePromises = Array.from(this.members.values()).map((member) => member.resume());
        await Promise.allSettled(resumePromises);
        this.emit('group:resumed', { groupId: this.id });
    }
    // Group-specific methods
    addMember(member) {
        // Prevent adding group to itself
        if (member === this || member.getId() === this.id) {
            throw new Error('Cannot add group to itself');
        }
        this.members.set(member.getId(), member);
        this.updateGroupCapabilities();
        // Forward member events (if member supports events)
        if (member && typeof member.on === 'function') {
            member.on('task:completed', (result) => {
                this.emit('member:task_completed', {
                    groupId: this.id,
                    memberId: member.getId(),
                    result,
                });
            });
        }
        this.emit('group:member_added', {
            groupId: this.id,
            memberId: member.getId(),
        });
    }
    removeMember(memberId) {
        const member = this.members.get(memberId);
        if (!member)
            return false;
        // Remove event listeners
        member.removeAllListeners();
        this.members.delete(memberId);
        this.updateGroupCapabilities();
        this.emit('group:member_removed', { groupId: this.id, memberId });
        return true;
    }
    getMember(memberId) {
        return this.members.get(memberId);
    }
    getMembers() {
        return Array.from(this.members.values());
    }
    getMemberIds() {
        return Array.from(this.members.keys());
    }
    setLoadBalancingStrategy(strategy) {
        this.loadBalancingStrategy = strategy;
        this.emit('group:strategy_changed', { groupId: this.id, strategy });
    }
    getLoadBalancingStrategy() {
        return this.loadBalancingStrategy;
    }
    getTotalAgentCount() {
        let count = 0;
        for (const member of Array.from(this.members.values())) {
            if (member.getType() === 'individual') {
                count++;
            }
            else if (member instanceof AgentGroup) {
                count += member.getTotalAgentCount();
            }
        }
        return count;
    }
    // Broadcast task to all members (parallel execution)
    async broadcastTask(task) {
        const eligibleMembers = Array.from(this.members.values()).filter((member) => member.canHandleTask(task));
        if (eligibleMembers.length === 0) {
            throw new Error(`No members can handle task ${task.id}`);
        }
        const taskPromises = eligibleMembers.map(async (member, index) => {
            const memberTask = {
                ...task,
                id: `${task.id}-${index}`,
                metadata: {
                    ...task.metadata,
                    originalTaskId: task.id,
                    memberId: member.getId(),
                },
            };
            return member.executeTask(memberTask);
        });
        const results = await Promise.allSettled(taskPromises);
        return results?.map((result, index) => {
            if (result?.status === 'fulfilled') {
                return result?.value;
            }
            const agent = eligibleMembers[index];
            return {
                taskId: `${task.id}-${index}`,
                agentId: agent ? agent.getId() : `unknown-${index}`,
                success: false,
                executionTime: 0,
                timestamp: new Date(),
                status: 'failed',
                startTime: new Date(),
                endTime: new Date(),
                error: { message: result?.reason?.message || 'Unknown error' },
            };
        });
    }
    // Private helper methods
    selectAgentForTask(task) {
        const eligibleMembers = Array.from(this.members.values()).filter((member) => member.canHandleTask(task));
        if (eligibleMembers.length === 0)
            return null;
        switch (this.loadBalancingStrategy) {
            case 'round-robin':
                return this.selectRoundRobin(eligibleMembers);
            case 'least-loaded':
                return this.selectLeastLoaded(eligibleMembers);
            case 'capability-based':
                return this.selectByCapability(eligibleMembers, task);
            default:
                return eligibleMembers.length > 0 ? (eligibleMembers[0] ?? null) : null;
        }
    }
    selectRoundRobin(eligibleMembers) {
        if (eligibleMembers.length === 0) {
            return null;
        }
        const selected = eligibleMembers[this.currentRoundRobinIndex % eligibleMembers.length];
        this.currentRoundRobinIndex++;
        return selected ?? null;
    }
    selectLeastLoaded(eligibleMembers) {
        if (eligibleMembers.length === 0) {
            return null;
        }
        // Sort by current load and then by number of completed tasks for better distribution
        return eligibleMembers.reduce((least, current) => {
            const leastStatus = least.getStatus();
            const currentStatus = current?.getStatus();
            const leastLoad = 'queuedTasks' in leastStatus ? leastStatus.queuedTasks : 0;
            const currentLoad = 'queuedTasks' in currentStatus ? currentStatus?.queuedTasks : 0;
            // If load is equal, prefer agent with fewer completed tasks for better distribution
            if (leastLoad === currentLoad) {
                const leastCompleted = 'completedTasks' in leastStatus ? leastStatus.completedTasks : 0;
                const currentCompleted = 'completedTasks' in currentStatus ? currentStatus.completedTasks : 0;
                return leastCompleted <= currentCompleted ? least : current;
            }
            return leastLoad < currentLoad ? least : current;
        });
    }
    selectByCapability(eligibleMembers, task) {
        if (eligibleMembers.length === 0) {
            return null;
        }
        // Select member with the most matching capabilities
        return eligibleMembers.reduce((best, current) => {
            const bestCapabilities = best.getCapabilities();
            const currentCapabilities = current?.getCapabilities();
            const bestMatches = task.requirements.capabilities.filter((req) => bestCapabilities.some((cap) => cap.name === req)).length;
            const currentMatches = task.requirements.capabilities.filter((req) => currentCapabilities?.some((cap) => cap.name === req)).length;
            return bestMatches >= currentMatches ? best : current;
        });
    }
    updateGroupCapabilities() {
        const allCapabilities = new Map();
        // Collect all unique capabilities from members
        for (const member of Array.from(this.members.values())) {
            const capabilities = member.getCapabilities();
            if (capabilities && Array.isArray(capabilities)) {
                capabilities.forEach((cap) => {
                    allCapabilities.set(cap.name, cap);
                });
            }
        }
        // Add group-specific capabilities
        for (const [name, cap] of Array.from(this.groupCapabilities.entries())) {
            allCapabilities.set(name, cap);
        }
        this.groupCapabilities = allCapabilities;
    }
    aggregateResources(resourcesList) {
        return resourcesList
            .filter((resources) => resources != null)
            .reduce((total, resources) => ({
            cpu: total.cpu + (resources.cpu || 0),
            memory: total.memory + (resources.memory || 0),
            network: total.network + (resources.network || 0),
            storage: total.storage + (resources.storage || 0),
        }), { cpu: 0, memory: 0, network: 0, storage: 0 });
    }
}
// Hierarchical agent group for complex organizational structures
export class HierarchicalAgentGroup extends AgentGroup {
    subGroups = new Map();
    maxDepth = 3;
    currentDepth = 0;
    constructor(id, name, members = [], maxDepth = 3, currentDepth = 0) {
        super(id, name, members);
        this.maxDepth = maxDepth;
        this.currentDepth = currentDepth;
        // Populate subGroups from members that are AgentGroups
        for (const member of members) {
            if (member instanceof AgentGroup) {
                this.subGroups.set(member.getId(), member);
            }
        }
    }
    addSubGroup(subGroup) {
        if (this.currentDepth >= this.maxDepth) {
            throw new Error(`Maximum hierarchy depth (${this.maxDepth}) exceeded`);
        }
        this.subGroups.set(subGroup.getId(), subGroup);
        this.addMember(subGroup); // Also add as a regular member for uniform treatment
        this.emit('hierarchy:subgroup_added', {
            groupId: this.getId(),
            subGroupId: subGroup.getId(),
            depth: this.currentDepth + 1,
        });
    }
    removeSubGroup(subGroupId) {
        const subGroup = this.subGroups.get(subGroupId);
        if (!subGroup)
            return false;
        this.subGroups.delete(subGroupId);
        this.removeMember(subGroupId);
        this.emit('hierarchy:subgroup_removed', {
            groupId: this.getId(),
            subGroupId,
            depth: this.currentDepth,
        });
        return true;
    }
    getSubGroups() {
        return Array.from(this.subGroups.values());
    }
    getHierarchyDepth() {
        if (this.subGroups.size === 0) {
            // If no subgroups, check if we have individual agents as members
            const hasIndividualMembers = this.getMembers().some((m) => m.getType() === 'individual');
            return hasIndividualMembers ? this.currentDepth + 1 : this.currentDepth;
        }
        let maxDepth = this.currentDepth;
        for (const subGroup of Array.from(this.subGroups.values())) {
            if (subGroup instanceof HierarchicalAgentGroup) {
                maxDepth = Math.max(maxDepth, 1 + subGroup.getHierarchyDepth());
            }
            else {
                // Regular AgentGroup: check if it has individual agents = +2 levels
                // (1 for the subGroup level, +1 for individual agents inside it)
                const subGroupMembers = subGroup.getMembers();
                const hasIndividuals = subGroupMembers.some((m) => m.getType() === 'individual');
                maxDepth = Math.max(maxDepth, this.currentDepth + (hasIndividuals ? 2 : 1));
            }
        }
        return maxDepth;
    }
    getTotalAgentCount() {
        let count = 0;
        for (const member of this.getMembers()) {
            if (member.getType() === 'individual') {
                count++;
            }
            else if (member instanceof HierarchicalAgentGroup) {
                count += member.getTotalAgentCount();
            }
            else if (member instanceof AgentGroup) {
                count += member.getTotalAgentCount();
            }
        }
        return count;
    }
    getStatus() {
        const baseStatus = super.getStatus();
        return {
            ...baseStatus,
            hierarchyDepth: this.getHierarchyDepth(),
        };
    }
    // Override task execution to support hierarchical delegation
    async executeTask(task) {
        // Try to delegate to most appropriate level in hierarchy
        const bestHandler = this.findBestHandlerInHierarchy(task);
        if (!bestHandler) {
            throw new Error(`No suitable handler found in hierarchy for task ${task.id}`);
        }
        return bestHandler.executeTask(task);
    }
    findBestHandlerInHierarchy(task) {
        // First, try individual agents at this level
        const individualAgents = this.getMembers().filter((m) => m.getType() === 'individual');
        const capableIndividuals = individualAgents.filter((agent) => agent.canHandleTask(task));
        if (capableIndividuals.length > 0) {
            return (this.selectByCapability(capableIndividuals, task) ||
                capableIndividuals[0]);
        }
        // Then, try subgroups
        for (const subGroup of Array.from(this.subGroups.values())) {
            if (subGroup.canHandleTask(task)) {
                return subGroup;
            }
        }
        // If no specific handlers found, try any available member as fallback
        const availableMembers = this.getMembers().filter((m) => {
            const status = m.getStatus();
            const hasState = 'state' in status && status.state;
            const isAvailable = hasState
                ? status.state !== 'offline'
                : 'state' in status && status.state !== 'inactive';
            return isAvailable;
        });
        if (availableMembers.length > 0) {
            return availableMembers[0];
        }
        return null;
    }
}
// Factory for creating agents and groups
export class AgentFactory {
    static createAgent(id, name, capabilities, resourceLimits) {
        return new Agent(id, name, capabilities, resourceLimits);
    }
    static createGroup(id, name, members = []) {
        return new AgentGroup(id, name, members);
    }
    // Alias for createGroup to match test expectations
    static createAgentGroup(id, name, members = []) {
        return new AgentGroup(id, name, members);
    }
    static createHierarchicalGroup(id, name, members = [], maxDepth = 3, currentDepth = 0) {
        return new HierarchicalAgentGroup(id, name, members, maxDepth, currentDepth);
    }
    static createCapability(name, version = '1.0.0', description = '', parameters, requiredResources) {
        const capability = {
            name,
            version,
            description,
        };
        if (parameters !== undefined) {
            capability.parameters = parameters;
        }
        if (requiredResources !== undefined) {
            capability.resourceRequirements = requiredResources;
        }
        return capability;
    }
}
//# sourceMappingURL=composite-system.js.map