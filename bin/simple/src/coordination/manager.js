var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { EventEmitter } from 'node:events';
import { CORE_TOKENS, inject, injectable } from '../di/index.ts';
let CoordinationManager = class CoordinationManager extends EventEmitter {
    _logger;
    _eventBus;
    config;
    agents = new Map();
    tasks = new Map();
    heartbeatTimer;
    isRunning = false;
    constructor(config, _logger, _eventBus) {
        super();
        this._logger = _logger;
        this._eventBus = _eventBus;
        this.config = {
            maxAgents: config?.maxAgents,
            heartbeatInterval: config?.heartbeatInterval,
            timeout: config?.timeout,
            enableHealthCheck: config?.enableHealthCheck !== false,
        };
        this.setupEventHandlers();
        this._logger.info("CoordinationManager initialized");
    }
    async start() {
        if (this.isRunning) {
            return;
        }
        this._logger?.info('Starting CoordinationManager...');
        if (this.config.enableHealthCheck) {
            this.startHeartbeatMonitoring();
        }
        this.isRunning = true;
        this.emit('started');
        this._logger?.info('CoordinationManager started');
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this._logger?.info('Stopping CoordinationManager...');
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        this.isRunning = false;
        this.emit('stopped');
        this._logger?.info('CoordinationManager stopped');
    }
    async registerAgent(agentConfig) {
        if (this.agents.size >= this.config.maxAgents) {
            throw new Error('Maximum agents limit reached');
        }
        const agent = {
            id: agentConfig?.id,
            type: agentConfig?.type,
            status: 'idle',
            capabilities: agentConfig?.capabilities,
            lastHeartbeat: new Date(),
            taskCount: 0,
            created: new Date(),
        };
        this.agents.set(agent.id, agent);
        this._logger?.info(`Agent registered: ${agent.id}`, { type: agent.type });
        this.emit('agentRegistered', agent);
    }
    async unregisterAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            return;
        }
        this.agents.delete(agentId);
        this._logger?.info(`Agent unregistered: ${agentId}`);
        this.emit('agentUnregistered', { agentId });
    }
    async submitTask(taskConfig) {
        const task = {
            id: taskConfig?.id,
            type: taskConfig?.type,
            priority: taskConfig?.priority,
            status: 'pending',
            created: new Date(),
            ...(taskConfig?.metadata && { metadata: taskConfig?.metadata }),
        };
        this.tasks.set(task.id, task);
        this._logger?.info(`Task submitted: ${task.id}`, { type: task.type });
        await this.assignTask(task, taskConfig?.requiredCapabilities || []);
    }
    getAvailableAgents() {
        return Array.from(this.agents.values()).filter((agent) => agent.status === 'idle' || agent.status === 'busy');
    }
    getAgentsByCapability(capability) {
        return Array.from(this.agents.values()).filter((agent) => agent.capabilities.includes(capability));
    }
    getPendingTasks() {
        return Array.from(this.tasks.values()).filter((task) => task.status === 'pending');
    }
    updateAgentHeartbeat(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.lastHeartbeat = new Date();
            if (agent.status === 'offline') {
                agent.status = 'idle';
                this.emit('agentOnline', { agentId });
            }
        }
    }
    updateTaskStatus(taskId, status) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = status;
            this.emit('taskStatusChanged', { taskId, status });
            if (status === 'completed' || status === 'failed') {
                if (task.assignedAgent) {
                    const agent = this.agents.get(task.assignedAgent);
                    if (agent && agent.status === 'busy') {
                        agent.status = 'idle';
                        agent.taskCount = Math.max(0, agent.taskCount - 1);
                    }
                }
            }
        }
    }
    getStats() {
        const agents = Array.from(this.agents.values());
        const tasks = Array.from(this.tasks.values());
        return {
            totalAgents: agents.length,
            availableAgents: agents.filter((a) => a.status === 'idle').length,
            busyAgents: agents.filter((a) => a.status === 'busy').length,
            offlineAgents: agents.filter((a) => a.status === 'offline').length,
            totalTasks: tasks.length,
            pendingTasks: tasks.filter((t) => t.status === 'pending').length,
            runningTasks: tasks.filter((t) => t.status === 'running').length,
            completedTasks: tasks.filter((t) => t.status === 'completed').length,
        };
    }
    setupEventHandlers() {
        if (this._eventBus) {
            this._eventBus.on('agent:heartbeat', (data) => {
                this.updateAgentHeartbeat(data?.agentId);
            });
            this._eventBus.on('task:completed', (data) => {
                this.updateTaskStatus(data?.taskId, 'completed');
            });
            this._eventBus.on('task:failed', (data) => {
                this.updateTaskStatus(data?.taskId, 'failed');
            });
        }
    }
    startHeartbeatMonitoring() {
        this.heartbeatTimer = setInterval(() => {
            this.checkAgentHeartbeats();
        }, this.config.heartbeatInterval);
    }
    checkAgentHeartbeats() {
        const now = Date.now();
        const timeoutMs = this.config.timeout;
        for (const agent of Array.from(this.agents.values())) {
            const lastHeartbeatTime = agent.lastHeartbeat.getTime();
            if (now - lastHeartbeatTime > timeoutMs && agent.status !== 'offline') {
                agent.status = 'offline';
                this._logger?.warn(`Agent went offline: ${agent.id}`);
                this.emit('agentOffline', { agentId: agent.id });
            }
        }
    }
    async assignTask(task, requiredCapabilities) {
        const suitableAgents = Array.from(this.agents.values()).filter((agent) => agent.status === 'idle' &&
            (requiredCapabilities.length === 0 ||
                requiredCapabilities.some((cap) => agent.capabilities.includes(cap))));
        if (suitableAgents.length === 0) {
            this._logger?.warn(`No suitable agents found for task: ${task.id}`);
            return;
        }
        suitableAgents.sort((a, b) => a.taskCount - b.taskCount);
        const selectedAgent = suitableAgents[0];
        if (!selectedAgent) {
            this._logger?.error(`Unexpected: No agent found after filtering`);
            return;
        }
        task.assignedAgent = selectedAgent.id;
        task.status = 'assigned';
        selectedAgent.status = 'busy';
        selectedAgent.taskCount++;
        this._logger?.info(`Task assigned: ${task.id} -> ${selectedAgent.id}`);
        this.emit('taskAssigned', { taskId: task.id, agentId: selectedAgent.id });
    }
};
CoordinationManager = __decorate([
    injectable,
    __param(1, inject(CORE_TOKENS.Logger)),
    __param(2, inject(CORE_TOKENS.EventBus)),
    __metadata("design:paramtypes", [Object, Object, Object])
], CoordinationManager);
export { CoordinationManager };
export default CoordinationManager;
//# sourceMappingURL=manager.js.map