/**
 * Coordination Manager - Agent coordination and swarm management
 * Handles agent lifecycle, communication, and task distribution.
 * Following Google TypeScript standards with strict typing.
 */
/**
 * @file Coordination system: manager.
 */
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { EventEmitter } from 'node:events';
import { injectable } from '../di/index.ts';
/**
 * Coordination Manager for agent and task management.
 *
 * @example
 */
let CoordinationManager = (() => {
    let _classDecorators = [injectable];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = EventEmitter;
    var CoordinationManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CoordinationManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
        /**
         * Start coordination services.
         */
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
        /**
         * Stop coordination services.
         */
        async stop() {
            if (!this.isRunning) {
                return;
            }
            this._logger?.info('Stopping CoordinationManager...');
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                delete this.heartbeatTimer;
            }
            this.isRunning = false;
            this.emit('stopped');
            this._logger?.info('CoordinationManager stopped');
        }
        /**
         * Register an agent.
         *
         * @param agentConfig
         * @param agentConfig.id
         * @param agentConfig.type
         * @param agentConfig.capabilities
         */
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
        /**
         * Unregister an agent.
         *
         * @param agentId
         */
        async unregisterAgent(agentId) {
            const agent = this.agents.get(agentId);
            if (!agent) {
                return;
            }
            this.agents.delete(agentId);
            this._logger?.info(`Agent unregistered: ${agentId}`);
            this.emit('agentUnregistered', { agentId });
        }
        /**
         * Submit a task for execution.
         *
         * @param taskConfig
         * @param taskConfig.id
         * @param taskConfig.type
         * @param taskConfig.priority
         * @param taskConfig.requiredCapabilities
         * @param taskConfig.metadata
         */
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
            // Try to assign task immediately
            await this.assignTask(task, taskConfig?.requiredCapabilities || []);
        }
        /**
         * Get available agents.
         */
        getAvailableAgents() {
            return Array.from(this.agents.values()).filter((agent) => agent.status === 'idle' || agent.status === 'busy');
        }
        /**
         * Get agents by capability.
         *
         * @param capability
         */
        getAgentsByCapability(capability) {
            return Array.from(this.agents.values()).filter((agent) => agent.capabilities.includes(capability));
        }
        /**
         * Get pending tasks.
         */
        getPendingTasks() {
            return Array.from(this.tasks.values()).filter((task) => task.status === 'pending');
        }
        /**
         * Update agent heartbeat.
         *
         * @param agentId
         */
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
        /**
         * Update task status.
         *
         * @param taskId
         * @param status
         */
        updateTaskStatus(taskId, status) {
            const task = this.tasks.get(taskId);
            if (task) {
                task.status = status;
                this.emit('taskStatusChanged', { taskId, status });
                if (status === 'completed' || status === 'failed') {
                    // Free up the assigned agent
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
        /**
         * Get coordination statistics.
         */
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
            // Find suitable agents
            const suitableAgents = Array.from(this.agents.values()).filter((agent) => agent.status === 'idle' &&
                (requiredCapabilities.length === 0 ||
                    requiredCapabilities.some((cap) => agent.capabilities.includes(cap))));
            if (suitableAgents.length === 0) {
                this._logger?.warn(`No suitable agents found for task: ${task.id}`);
                return;
            }
            // Sort by task count (load balancing)
            suitableAgents.sort((a, b) => a.taskCount - b.taskCount);
            const selectedAgent = suitableAgents[0];
            if (!selectedAgent) {
                // This should never happen due to the check above, but TypeScript needs this
                this._logger?.error(`Unexpected: No agent found after filtering`);
                return;
            }
            // Assign task
            task.assignedAgent = selectedAgent.id;
            task.status = 'assigned';
            selectedAgent.status = 'busy';
            selectedAgent.taskCount++;
            this._logger?.info(`Task assigned: ${task.id} -> ${selectedAgent.id}`);
            this.emit('taskAssigned', { taskId: task.id, agentId: selectedAgent.id });
        }
    };
    return CoordinationManager = _classThis;
})();
export { CoordinationManager };
export default CoordinationManager;
