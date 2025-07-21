"use strict";
/**
 * HiveMind Core Class
 *
 * Main orchestrator for the collective intelligence swarm system.
 * Manages agents, tasks, memory, and coordination.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveMind = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const Queen_js_1 = require("./Queen.js");
const Agent_js_1 = require("./Agent.js");
const Memory_js_1 = require("./Memory.js");
const Communication_js_1 = require("./Communication.js");
const DatabaseManager_js_1 = require("./DatabaseManager.js");
const SwarmOrchestrator_js_1 = require("../integration/SwarmOrchestrator.js");
const ConsensusEngine_js_1 = require("../integration/ConsensusEngine.js");
class HiveMind extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.started = false;
        this.config = config;
        this.id = (0, uuid_1.v4)();
        this.agents = new Map();
        this.startTime = Date.now();
    }
    /**
     * Initialize the Hive Mind and all subsystems
     */
    async initialize() {
        try {
            // Initialize database
            this.db = await DatabaseManager_js_1.DatabaseManager.getInstance();
            // Create swarm in database
            await this.db.createSwarm({
                id: this.id,
                name: this.config.name,
                topology: this.config.topology,
                queenMode: this.config.queenMode,
                maxAgents: this.config.maxAgents,
                consensusThreshold: this.config.consensusThreshold,
                memoryTTL: this.config.memoryTTL,
                config: JSON.stringify(this.config)
            });
            // Initialize Queen
            this.queen = new Queen_js_1.Queen({
                swarmId: this.id,
                mode: this.config.queenMode,
                topology: this.config.topology
            });
            // Initialize subsystems
            this.memory = new Memory_js_1.Memory(this.id);
            this.communication = new Communication_js_1.Communication(this.id);
            this.orchestrator = new SwarmOrchestrator_js_1.SwarmOrchestrator(this);
            this.consensus = new ConsensusEngine_js_1.ConsensusEngine(this.config.consensusThreshold);
            // Initialize subsystems
            await Promise.all([
                this.queen.initialize(),
                this.memory.initialize(),
                this.communication.initialize(),
                this.orchestrator.initialize()
            ]);
            // Set as active swarm
            await this.db.setActiveSwarm(this.id);
            // Auto-spawn agents if configured
            if (this.config.autoSpawn) {
                await this.autoSpawnAgents();
            }
            this.started = true;
            this.emit('initialized', { swarmId: this.id });
            return this.id;
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Load an existing Hive Mind from the database
     */
    static async load(swarmId) {
        const db = await DatabaseManager_js_1.DatabaseManager.getInstance();
        const swarmData = await db.getSwarm(swarmId);
        if (!swarmData) {
            throw new Error(`Swarm ${swarmId} not found`);
        }
        const config = JSON.parse(swarmData.config);
        const hiveMind = new HiveMind(config);
        hiveMind.id = swarmId;
        await hiveMind.initialize();
        // Load existing agents
        const agents = await db.getAgents(swarmId);
        for (const agentData of agents) {
            const agent = new Agent_js_1.Agent({
                id: agentData.id,
                name: agentData.name,
                type: agentData.type,
                swarmId: swarmId,
                capabilities: JSON.parse(agentData.capabilities)
            });
            await agent.initialize();
            hiveMind.agents.set(agent.id, agent);
        }
        return hiveMind;
    }
    /**
     * Auto-spawn initial agents based on topology
     */
    async autoSpawnAgents() {
        const topologyConfigs = {
            hierarchical: [
                { type: 'coordinator', count: 1 },
                { type: 'researcher', count: 2 },
                { type: 'coder', count: 2 },
                { type: 'analyst', count: 1 },
                { type: 'tester', count: 1 }
            ],
            mesh: [
                { type: 'coordinator', count: 2 },
                { type: 'researcher', count: 2 },
                { type: 'coder', count: 2 },
                { type: 'specialist', count: 2 }
            ],
            ring: [
                { type: 'coordinator', count: 1 },
                { type: 'coder', count: 3 },
                { type: 'reviewer', count: 2 }
            ],
            star: [
                { type: 'coordinator', count: 1 },
                { type: 'specialist', count: 4 }
            ]
        };
        const config = topologyConfigs[this.config.topology];
        const spawnedAgents = [];
        for (const agentConfig of config) {
            for (let i = 0; i < agentConfig.count; i++) {
                const agent = await this.spawnAgent({
                    type: agentConfig.type,
                    name: `${agentConfig.type}-${i + 1}`
                });
                spawnedAgents.push(agent);
            }
        }
        return spawnedAgents;
    }
    /**
     * Spawn a new agent into the swarm
     */
    async spawnAgent(options) {
        if (this.agents.size >= this.config.maxAgents) {
            throw new Error('Maximum agent limit reached');
        }
        const agent = new Agent_js_1.Agent({
            name: options.name || `${options.type}-${Date.now()}`,
            type: options.type,
            swarmId: this.id,
            capabilities: options.capabilities || this.getDefaultCapabilities(options.type)
        });
        await agent.initialize();
        // Register with Queen
        await this.queen.registerAgent(agent);
        // Store in database
        await this.db.createAgent({
            id: agent.id,
            swarmId: this.id,
            name: agent.name,
            type: agent.type,
            capabilities: JSON.stringify(agent.capabilities),
            status: 'idle'
        });
        // Add to local map
        this.agents.set(agent.id, agent);
        // Setup communication channels
        this.communication.addAgent(agent);
        // Auto-assign to pending tasks if configured
        if (options.autoAssign) {
            await this.assignPendingTasksToAgent(agent);
        }
        this.emit('agentSpawned', { agent });
        return agent;
    }
    /**
     * Submit a task to the Hive Mind
     */
    async submitTask(options) {
        const task = {
            id: (0, uuid_1.v4)(),
            swarmId: this.id,
            description: options.description,
            priority: options.priority,
            strategy: options.strategy,
            status: 'pending',
            progress: 0,
            dependencies: options.dependencies || [],
            assignedAgents: [],
            requireConsensus: options.requireConsensus || false,
            maxAgents: options.maxAgents || 3,
            requiredCapabilities: options.requiredCapabilities || [],
            createdAt: new Date(),
            metadata: options.metadata || {}
        };
        // Store in database
        await this.db.createTask({
            ...task,
            dependencies: JSON.stringify(task.dependencies),
            assignedAgents: JSON.stringify(task.assignedAgents),
            requiredCapabilities: JSON.stringify(task.requiredCapabilities),
            metadata: JSON.stringify(task.metadata)
        });
        // Submit to orchestrator
        await this.orchestrator.submitTask(task);
        // Notify Queen
        await this.queen.onTaskSubmitted(task);
        this.emit('taskSubmitted', { task });
        return task;
    }
    /**
     * Get full status of the Hive Mind
     */
    async getFullStatus() {
        const agents = Array.from(this.agents.values());
        const tasks = await this.db.getTasks(this.id);
        const memoryStats = await this.memory.getStats();
        const communicationStats = await this.communication.getStats();
        // Calculate agent statistics
        const agentsByType = agents.reduce((acc, agent) => {
            acc[agent.type] = (acc[agent.type] || 0) + 1;
            return acc;
        }, {});
        // Calculate task statistics
        const taskStats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            failed: tasks.filter(t => t.status === 'failed').length
        };
        // Calculate performance metrics
        const performance = await this.calculatePerformanceMetrics();
        // Determine health status
        const health = this.determineHealth(agents, tasks, performance);
        // Get any warnings
        const warnings = this.getSystemWarnings(agents, tasks, performance);
        return {
            swarmId: this.id,
            name: this.config.name,
            topology: this.config.topology,
            queenMode: this.config.queenMode,
            health,
            uptime: Date.now() - this.startTime,
            agents: agents.map(a => ({
                id: a.id,
                name: a.name,
                type: a.type,
                status: a.status,
                currentTask: a.currentTask,
                messageCount: a.messageCount,
                createdAt: a.createdAt.getTime()
            })),
            agentsByType,
            tasks: tasks.map(t => ({
                id: t.id,
                description: t.description,
                status: t.status,
                priority: t.priority,
                progress: t.progress,
                assignedAgent: t.assigned_agents ? JSON.parse(t.assigned_agents)[0] : null
            })),
            taskStats,
            memoryStats,
            communicationStats,
            performance,
            warnings
        };
    }
    /**
     * Get basic statistics
     */
    async getStats() {
        const agents = Array.from(this.agents.values());
        const tasks = await this.db.getTasks(this.id);
        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'busy').length,
            pendingTasks: tasks.filter(t => t.status === 'pending').length,
            availableCapacity: Math.round((1 - (agents.filter(a => a.status === 'busy').length / agents.length)) * 100)
        };
    }
    /**
     * Get list of agents
     */
    async getAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Get list of tasks
     */
    async getTasks() {
        return this.db.getTasks(this.id);
    }
    /**
     * Get specific task
     */
    async getTask(taskId) {
        return this.db.getTask(taskId);
    }
    /**
     * Cancel a task
     */
    async cancelTask(taskId) {
        await this.orchestrator.cancelTask(taskId);
        await this.db.updateTaskStatus(taskId, 'cancelled');
        this.emit('taskCancelled', { taskId });
    }
    /**
     * Retry a failed task
     */
    async retryTask(taskId) {
        const originalTask = await this.db.getTask(taskId);
        if (!originalTask) {
            throw new Error('Task not found');
        }
        const newTask = await this.submitTask({
            description: originalTask.description + ' (Retry)',
            priority: originalTask.priority,
            strategy: originalTask.strategy,
            dependencies: [],
            requireConsensus: originalTask.require_consensus,
            maxAgents: originalTask.max_agents,
            requiredCapabilities: JSON.parse(originalTask.required_capabilities || '[]'),
            metadata: {
                ...JSON.parse(originalTask.metadata || '{}'),
                retryOf: taskId
            }
        });
        return newTask;
    }
    /**
     * Rebalance agents across tasks
     */
    async rebalanceAgents() {
        await this.orchestrator.rebalance();
        this.emit('agentsRebalanced');
    }
    /**
     * Shutdown the Hive Mind
     */
    async shutdown() {
        this.started = false;
        // Shutdown all agents
        for (const agent of this.agents.values()) {
            await agent.shutdown();
        }
        // Shutdown subsystems
        await Promise.all([
            this.queen.shutdown(),
            this.memory.shutdown(),
            this.communication.shutdown(),
            this.orchestrator.shutdown()
        ]);
        this.emit('shutdown');
    }
    // Private helper methods
    getDefaultCapabilities(type) {
        const capabilityMap = {
            coordinator: ['task_management', 'resource_allocation', 'consensus_building'],
            researcher: ['information_gathering', 'pattern_recognition', 'knowledge_synthesis'],
            coder: ['code_generation', 'refactoring', 'debugging'],
            analyst: ['data_analysis', 'performance_metrics', 'bottleneck_detection'],
            architect: ['system_design', 'architecture_patterns', 'integration_planning'],
            tester: ['test_generation', 'quality_assurance', 'edge_case_detection'],
            reviewer: ['code_review', 'standards_enforcement', 'best_practices'],
            optimizer: ['performance_optimization', 'resource_optimization', 'algorithm_improvement'],
            documenter: ['documentation_generation', 'api_docs', 'user_guides'],
            monitor: ['system_monitoring', 'health_checks', 'alerting'],
            specialist: ['domain_expertise', 'custom_capabilities', 'problem_solving']
        };
        return capabilityMap[type] || [];
    }
    async assignPendingTasksToAgent(agent) {
        const pendingTasks = await this.db.getPendingTasks(this.id);
        for (const task of pendingTasks) {
            const requiredCapabilities = JSON.parse(task.required_capabilities || '[]');
            // Check if agent has required capabilities
            if (requiredCapabilities.every((cap) => agent.capabilities.includes(cap))) {
                await this.orchestrator.assignTaskToAgent(task.id, agent.id);
                break; // Only assign one task at a time
            }
        }
    }
    async calculatePerformanceMetrics() {
        // This would calculate real metrics from the database
        return {
            avgTaskCompletion: 3500,
            messageThroughput: 120,
            consensusSuccessRate: 92,
            memoryHitRate: 85,
            agentUtilization: 78
        };
    }
    determineHealth(agents, tasks, performance) {
        if (agents.length === 0)
            return 'critical';
        const busyAgents = agents.filter(a => a.status === 'busy').length;
        const utilization = busyAgents / agents.length;
        if (utilization > 0.9)
            return 'degraded';
        if (performance.consensusSuccessRate < 50)
            return 'degraded';
        if (agents.filter(a => a.status === 'error').length > agents.length * 0.2)
            return 'critical';
        return 'healthy';
    }
    getSystemWarnings(agents, tasks, performance) {
        const warnings = [];
        const utilization = agents.filter(a => a.status === 'busy').length / agents.length;
        if (utilization > 0.8) {
            warnings.push('High agent utilization - consider spawning more agents');
        }
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        if (pendingTasks > agents.length * 2) {
            warnings.push('Large task backlog - tasks may be delayed');
        }
        if (performance.memoryHitRate < 60) {
            warnings.push('Low memory hit rate - consider optimizing memory usage');
        }
        return warnings;
    }
}
exports.HiveMind = HiveMind;
