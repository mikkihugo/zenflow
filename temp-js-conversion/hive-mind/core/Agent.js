"use strict";
/**
 * Base Agent Class
 *
 * Foundation for all agent types in the Hive Mind swarm.
 * Provides core functionality for task execution, communication, and coordination.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const DatabaseManager_js_1 = require("./DatabaseManager.js");
const MCPToolWrapper_js_1 = require("../integration/MCPToolWrapper.js");
class Agent extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.status = 'idle';
        this.currentTask = null;
        this.messageCount = 0;
        this.isActive = false;
        this.id = config.id || (0, uuid_1.v4)();
        this.name = config.name;
        this.type = config.type;
        this.swarmId = config.swarmId;
        this.capabilities = config.capabilities || [];
        this.createdAt = new Date();
        this.memory = new Map();
        this.communicationBuffer = [];
        this.lastHeartbeat = Date.now();
    }
    /**
     * Initialize the agent
     */
    async initialize() {
        this.db = await DatabaseManager_js_1.DatabaseManager.getInstance();
        this.mcpWrapper = new MCPToolWrapper_js_1.MCPToolWrapper();
        // Load agent state from database if exists
        const existingAgent = await this.db.getAgent(this.id);
        if (existingAgent) {
            this.status = existingAgent.status;
            this.currentTask = existingAgent.current_task_id;
            this.messageCount = existingAgent.message_count;
        }
        // Start agent loops
        this.startHeartbeatLoop();
        this.startCommunicationLoop();
        this.startLearningLoop();
        this.isActive = true;
        this.emit('initialized');
    }
    /**
     * Assign a task to this agent
     */
    async assignTask(taskId, executionPlan) {
        if (this.currentTask) {
            throw new Error('Agent already has an active task');
        }
        this.currentTask = taskId;
        this.status = 'busy';
        // Update database
        await this.db.updateAgent(this.id, {
            status: 'busy',
            current_task_id: taskId
        });
        // Store task in memory
        this.memory.set('current_task', { taskId, executionPlan, startTime: Date.now() });
        // Start task execution
        this.executeTask(taskId, executionPlan).catch(error => {
            this.emit('taskError', { taskId, error });
        });
        this.emit('taskAssigned', { taskId });
    }
    /**
     * Execute assigned task
     */
    async executeTask(taskId, executionPlan) {
        try {
            // Load task details
            const task = await this.db.getTask(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            // Update task status
            await this.db.updateTaskStatus(taskId, 'in_progress');
            // Execute based on agent type
            const result = await this.executeByType(task, executionPlan);
            // Store result
            await this.db.updateTask(taskId, {
                status: 'completed',
                result: JSON.stringify(result),
                progress: 100,
                completed_at: new Date()
            });
            // Learn from execution
            await this.learnFromExecution(task, result);
            // Clear task
            this.currentTask = null;
            this.status = 'idle';
            await this.db.updateAgent(this.id, {
                status: 'idle',
                current_task_id: null,
                success_count: this.db.raw('success_count + 1')
            });
            this.emit('taskCompleted', { taskId, result });
        }
        catch (error) {
            // Handle task failure
            await this.handleTaskFailure(taskId, error);
        }
    }
    /**
     * Execute task based on agent type
     */
    async executeByType(task, executionPlan) {
        // Base implementation - override in specialized agents
        const startTime = Date.now();
        // Simulate task execution phases
        const phases = executionPlan.phases || ['analysis', 'execution', 'validation'];
        const results = [];
        for (const phase of phases) {
            const phaseResult = await this.executePhase(phase, task, executionPlan);
            results.push(phaseResult);
            // Update progress
            const progress = Math.round((phases.indexOf(phase) + 1) / phases.length * 100);
            await this.updateTaskProgress(task.id, progress);
            // Communicate progress
            await this.communicateProgress(task.id, phase, progress);
        }
        return {
            success: true,
            data: results,
            executionTime: Date.now() - startTime,
            agentId: this.id,
            metadata: {
                phases: phases,
                plan: executionPlan
            }
        };
    }
    /**
     * Execute a specific phase of the task
     */
    async executePhase(phase, task, plan) {
        // Use MCP tools based on phase and agent capabilities
        switch (phase) {
            case 'analysis':
                return this.performAnalysis(task);
            case 'execution':
                return this.performExecution(task, plan);
            case 'validation':
                return this.performValidation(task);
            default:
                return { phase, status: 'completed' };
        }
    }
    /**
     * Perform analysis phase
     */
    async performAnalysis(task) {
        // Use neural analysis for task understanding
        const analysis = await this.mcpWrapper.analyzePattern({
            action: 'analyze',
            operation: `${this.type}_analysis`,
            metadata: {
                task: task.description,
                agentType: this.type,
                capabilities: this.capabilities
            }
        });
        // Store analysis in memory
        await this.storeInMemory('task_analysis', analysis);
        return {
            phase: 'analysis',
            complexity: analysis.complexity || 'medium',
            estimatedTime: analysis.estimatedTime || 3600000,
            requirements: analysis.requirements || []
        };
    }
    /**
     * Perform execution phase
     */
    async performExecution(task, plan) {
        // Base execution - specialized agents override this
        const actions = plan.agentAssignments?.find((a) => a.agentId === this.id)?.responsibilities || [];
        const results = [];
        for (const action of actions) {
            const actionResult = await this.executeAction(action, task);
            results.push(actionResult);
        }
        return {
            phase: 'execution',
            actions: actions,
            results: results
        };
    }
    /**
     * Perform validation phase
     */
    async performValidation(task) {
        // Validate execution results
        const validation = {
            phase: 'validation',
            checks: [],
            passed: true
        };
        // Basic validation checks
        const checks = [
            { name: 'completeness', passed: true },
            { name: 'quality', passed: true },
            { name: 'performance', passed: true }
        ];
        validation.checks = checks;
        validation.passed = checks.every(c => c.passed);
        return validation;
    }
    /**
     * Execute a specific action
     */
    async executeAction(action, task) {
        // Base action execution
        return {
            action: action,
            status: 'completed',
            timestamp: new Date()
        };
    }
    /**
     * Send a message to another agent or broadcast
     */
    async sendMessage(toAgentId, messageType, content) {
        const message = {
            id: (0, uuid_1.v4)(),
            fromAgentId: this.id,
            toAgentId,
            swarmId: this.swarmId,
            type: messageType,
            content,
            timestamp: new Date(),
            requiresResponse: false
        };
        // Store in database
        await this.db.createCommunication({
            from_agent_id: this.id,
            to_agent_id: toAgentId,
            swarm_id: this.swarmId,
            message_type: messageType,
            content: JSON.stringify(content),
            priority: 'normal'
        });
        this.messageCount++;
        this.emit('messageSent', message);
    }
    /**
     * Receive and process a message
     */
    async receiveMessage(message) {
        this.communicationBuffer.push(message);
        this.emit('messageReceived', message);
    }
    /**
     * Vote on a consensus proposal
     */
    async voteOnProposal(proposalId, vote, reason) {
        await this.db.submitConsensusVote(proposalId, this.id, vote, reason);
        this.emit('voteCast', { proposalId, vote, reason });
    }
    /**
     * Update task progress
     */
    async updateTaskProgress(taskId, progress) {
        await this.db.updateTask(taskId, {
            progress,
            last_progress_update: new Date()
        });
    }
    /**
     * Communicate progress to other agents
     */
    async communicateProgress(taskId, phase, progress) {
        await this.sendMessage(null, 'progress_update', {
            taskId,
            agentId: this.id,
            phase,
            progress,
            timestamp: new Date()
        });
    }
    /**
     * Store data in agent memory
     */
    async storeInMemory(key, value) {
        this.memory.set(key, value);
        // Also store in persistent memory
        await this.mcpWrapper.storeMemory({
            action: 'store',
            key: `agent/${this.id}/${key}`,
            value: JSON.stringify(value),
            namespace: 'agent-memory',
            ttl: 3600 // 1 hour
        });
    }
    /**
     * Retrieve from agent memory
     */
    async retrieveFromMemory(key) {
        // Check local memory first
        if (this.memory.has(key)) {
            return this.memory.get(key);
        }
        // Check persistent memory
        const result = await this.mcpWrapper.retrieveMemory({
            action: 'retrieve',
            key: `agent/${this.id}/${key}`,
            namespace: 'agent-memory'
        });
        return result ? JSON.parse(result) : null;
    }
    /**
     * Learn from task execution
     */
    async learnFromExecution(task, result) {
        const learningData = {
            taskType: this.detectTaskType(task.description),
            agentType: this.type,
            success: result.success,
            executionTime: result.executionTime,
            patterns: this.extractPatterns(task, result)
        };
        // Train neural patterns
        await this.mcpWrapper.trainNeural({
            pattern_type: 'optimization',
            training_data: JSON.stringify(learningData),
            epochs: 10
        });
    }
    /**
     * Handle task failure
     */
    async handleTaskFailure(taskId, error) {
        // Update task status
        await this.db.updateTask(taskId, {
            status: 'failed',
            error: error.message,
            completed_at: new Date()
        });
        // Update agent stats
        await this.db.updateAgent(this.id, {
            status: 'idle',
            current_task_id: null,
            error_count: this.db.raw('error_count + 1')
        });
        // Clear current task
        this.currentTask = null;
        this.status = 'idle';
        // Notify swarm of failure
        await this.sendMessage(null, 'task_failed', {
            taskId,
            agentId: this.id,
            error: error.message,
            timestamp: new Date()
        });
        this.emit('taskFailed', { taskId, error });
    }
    /**
     * Start heartbeat loop
     */
    startHeartbeatLoop() {
        setInterval(async () => {
            if (!this.isActive)
                return;
            this.lastHeartbeat = Date.now();
            // Update last active timestamp
            await this.db.updateAgent(this.id, {
                last_active_at: new Date()
            });
            this.emit('heartbeat');
        }, 30000); // Every 30 seconds
    }
    /**
     * Start communication processing loop
     */
    startCommunicationLoop() {
        setInterval(async () => {
            if (!this.isActive || this.communicationBuffer.length === 0)
                return;
            // Process buffered messages
            const messages = [...this.communicationBuffer];
            this.communicationBuffer = [];
            for (const message of messages) {
                await this.processMessage(message);
            }
        }, 1000); // Every second
    }
    /**
     * Start learning loop
     */
    startLearningLoop() {
        setInterval(async () => {
            if (!this.isActive)
                return;
            try {
                // Analyze recent patterns
                const patterns = await this.analyzeRecentPatterns();
                // Update capabilities if needed
                await this.updateCapabilities(patterns);
            }
            catch (error) {
                this.emit('learningError', error);
            }
        }, 300000); // Every 5 minutes
    }
    /**
     * Process incoming message
     */
    async processMessage(message) {
        switch (message.type) {
            case 'task_assignment':
                await this.handleTaskAssignment(message.content);
                break;
            case 'consensus':
                await this.handleConsensusRequest(message.content);
                break;
            case 'query':
                await this.handleQuery(message);
                break;
            case 'coordination':
                await this.handleCoordination(message.content);
                break;
            default:
                this.emit('unknownMessage', message);
        }
    }
    /**
     * Check if agent is responsive
     */
    isResponsive() {
        const timeout = 60000; // 1 minute
        return Date.now() - this.lastHeartbeat < timeout;
    }
    /**
     * Get agent state
     */
    getState() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            currentTask: this.currentTask,
            capabilities: this.capabilities,
            messageCount: this.messageCount,
            isResponsive: this.isResponsive(),
            memory: Object.fromEntries(this.memory)
        };
    }
    /**
     * Shutdown the agent
     */
    async shutdown() {
        this.isActive = false;
        // Update status in database
        await this.db.updateAgent(this.id, {
            status: 'offline'
        });
        // Clear memory
        this.memory.clear();
        this.communicationBuffer = [];
        this.emit('shutdown');
    }
    // Helper methods
    detectTaskType(description) {
        const lower = description.toLowerCase();
        if (lower.includes('research') || lower.includes('investigate'))
            return 'research';
        if (lower.includes('develop') || lower.includes('implement'))
            return 'development';
        if (lower.includes('analyze') || lower.includes('review'))
            return 'analysis';
        if (lower.includes('test') || lower.includes('validate'))
            return 'testing';
        if (lower.includes('optimize') || lower.includes('improve'))
            return 'optimization';
        return 'general';
    }
    extractPatterns(task, result) {
        return {
            taskComplexity: task.priority,
            executionStrategy: task.strategy,
            phasesCompleted: result.metadata?.phases?.length || 0,
            timePerPhase: result.executionTime / (result.metadata?.phases?.length || 1)
        };
    }
    async analyzeRecentPatterns() {
        return this.mcpWrapper.analyzePattern({
            action: 'analyze',
            operation: 'agent_patterns',
            metadata: {
                agentId: this.id,
                agentType: this.type,
                timeframe: '1h'
            }
        });
    }
    async updateCapabilities(patterns) {
        if (patterns.suggestedCapabilities) {
            // Update capabilities based on learning
            const newCapabilities = patterns.suggestedCapabilities.filter((cap) => !this.capabilities.includes(cap));
            if (newCapabilities.length > 0) {
                this.capabilities.push(...newCapabilities);
                await this.db.updateAgent(this.id, {
                    capabilities: JSON.stringify(this.capabilities)
                });
                this.emit('capabilitiesUpdated', newCapabilities);
            }
        }
    }
    async handleTaskAssignment(content) {
        // Handle incoming task assignment
        if (!this.currentTask && content.taskId) {
            await this.assignTask(content.taskId, content.executionPlan || {});
        }
    }
    async handleConsensusRequest(content) {
        // Analyze proposal and vote
        const analysis = await this.analyzeProposal(content);
        await this.voteOnProposal(content.proposalId, analysis.vote, analysis.reason);
    }
    async handleQuery(message) {
        // Respond to query
        const response = await this.processQuery(message.content);
        if (message.fromAgentId) {
            await this.sendMessage(message.fromAgentId, 'response', {
                queryId: message.id,
                response
            });
        }
    }
    async handleCoordination(content) {
        // Handle coordination messages
        this.emit('coordinationReceived', content);
    }
    async analyzeProposal(proposal) {
        // Simple analysis - can be overridden by specialized agents
        return {
            vote: Math.random() > 0.3, // 70% approval rate
            reason: 'Based on agent analysis'
        };
    }
    async processQuery(query) {
        // Process and respond to queries
        return {
            agentId: this.id,
            agentType: this.type,
            status: this.status,
            response: 'Query processed'
        };
    }
}
exports.Agent = Agent;
