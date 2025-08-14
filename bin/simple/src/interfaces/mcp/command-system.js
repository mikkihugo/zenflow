import { EventEmitter } from 'node:events';
export class SwarmInitCommand {
    config;
    swarmManager;
    context;
    swarmId;
    executionStartTime;
    constructor(config, swarmManager, context) {
        this.config = config;
        this.swarmManager = swarmManager;
        this.context = context;
    }
    async validate() {
        const errors = [];
        const warnings = [];
        if (this.config.agentCount <= 0) {
            errors.push('Agent count must be greater than 0');
        }
        if (this.config.agentCount > 100) {
            errors.push('Agent count exceeds maximum limit of 100');
        }
        if (this.config.agentCount > 50) {
            warnings.push('Large agent count may impact performance');
        }
        const validTopologies = [
            'mesh',
            'hierarchical',
            'ring',
            'star',
        ];
        if (!validTopologies.includes(this.config.topology)) {
            errors.push(`Invalid topology: ${this.config.topology}`);
        }
        if (!this.swarmManager.isHealthy()) {
            errors.push('Swarm manager is not healthy');
        }
        if (!this.context.permissions.includes('swarm:create')) {
            errors.push('Insufficient permissions to create swarm');
        }
        if (this.context.resources.cpu < 0.1) {
            errors.push('Insufficient CPU resources');
        }
        if (this.context.resources.memory < 0.2) {
            warnings.push('Low memory resources may impact swarm performance');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    async execute() {
        this.executionStartTime = Date.now();
        const startResources = this.measureResources();
        const validation = await this.validate();
        if (!validation.valid) {
            return {
                success: false,
                error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
                executionTime: Date.now() - this.executionStartTime,
                resourceUsage: this.measureResources(),
                warnings: validation.warnings,
            };
        }
        try {
            const result = await this.swarmManager.initializeSwarm(this.config.topology, this.config.agentCount, {
                capabilities: this.config.capabilities,
                resourceLimits: this.config.resourceLimits,
                timeout: this.config.timeout,
            });
            this.swarmId = result?.swarmId;
            const endResources = this.measureResources();
            return {
                success: true,
                data: result,
                executionTime: Date.now() - this.executionStartTime,
                resourceUsage: this.calculateResourceDelta(startResources, endResources),
                warnings: result?.warnings,
                metadata: {
                    topology: this.config.topology,
                    agentCount: this.config.agentCount,
                    sessionId: this.context.sessionId,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error,
                executionTime: Date.now() - this.executionStartTime,
                resourceUsage: this.measureResources(),
            };
        }
    }
    async undo() {
        if (this.swarmId) {
            await this.swarmManager.destroySwarm(this.swarmId);
            this.swarmId = undefined;
            return {
                success: true,
                executionTime: 0,
                resourceUsage: this.measureResources(),
                message: 'Successfully undone',
            };
        }
        return {
            success: false,
            error: new Error('No swarm to undo'),
            executionTime: 0,
            resourceUsage: this.measureResources(),
        };
    }
    canUndo() {
        return !!this.swarmId;
    }
    getCommandType() {
        return 'swarm_init';
    }
    getEstimatedDuration() {
        return this.config.agentCount * 100 + 1000;
    }
    getDescription() {
        return `Initialize ${this.config.topology} swarm with ${this.config.agentCount} agents`;
    }
    getRequiredPermissions() {
        return ['swarm:create', 'agent:spawn'];
    }
    clone() {
        return new SwarmInitCommand({ ...this.config }, this.swarmManager, {
            ...this.context,
        });
    }
    measureResources() {
        return {
            cpu: process.cpuUsage().system / 1000000,
            memory: process.memoryUsage().heapUsed / 1024 / 1024,
            network: 0,
            storage: 0,
            timestamp: new Date(),
        };
    }
    calculateResourceDelta(start, end) {
        return {
            cpu: end.cpu - start.cpu,
            memory: end.memory - start.memory,
            network: end.network - start.network,
            storage: end.storage - start.storage,
            timestamp: end.timestamp,
        };
    }
}
export class AgentSpawnCommand {
    agentConfig;
    swarmManager;
    swarmId;
    context;
    agentId;
    constructor(agentConfig, swarmManager, swarmId, context) {
        this.agentConfig = agentConfig;
        this.swarmManager = swarmManager;
        this.swarmId = swarmId;
        this.context = context;
    }
    async validate() {
        const errors = [];
        const warnings = [];
        if (!this.agentConfig.type) {
            errors.push('Agent type is required');
        }
        if (!this.swarmId) {
            errors.push('Swarm ID is required');
        }
        if (!this.context.permissions.includes('agent:spawn')) {
            errors.push('Insufficient permissions to spawn agent');
        }
        const swarmStatus = await this.swarmManager.getSwarmStatus(this.swarmId);
        if (!swarmStatus.healthy) {
            errors.push('Target swarm is not healthy');
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    async execute() {
        const startTime = Date.now();
        const validation = await this.validate();
        if (!validation.valid) {
            return {
                success: false,
                error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
                executionTime: Date.now() - startTime,
                resourceUsage: this.measureResources(),
            };
        }
        try {
            const result = await this.swarmManager.spawnAgent(this.swarmId, this.agentConfig);
            this.agentId = result?.agentId;
            return {
                success: true,
                data: result,
                executionTime: Date.now() - startTime,
                resourceUsage: this.measureResources(),
                metadata: {
                    swarmId: this.swarmId,
                    agentType: this.agentConfig.type,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error,
                executionTime: Date.now() - startTime,
                resourceUsage: this.measureResources(),
            };
        }
    }
    async undo() {
        if (this.agentId && this.swarmId) {
            await this.swarmManager.destroyAgent(this.swarmId, this.agentId);
            this.agentId = undefined;
        }
    }
    canUndo() {
        return !!this.agentId;
    }
    getCommandType() {
        return 'agent_spawn';
    }
    getEstimatedDuration() {
        return 500;
    }
    getDescription() {
        return `Spawn ${this.agentConfig.type} agent in swarm ${this.swarmId}`;
    }
    getRequiredPermissions() {
        return ['agent:spawn'];
    }
    measureResources() {
        return {
            cpu: process.cpuUsage().system / 1000000,
            memory: process.memoryUsage().heapUsed / 1024 / 1024,
            network: 0,
            storage: 0,
            timestamp: new Date(),
        };
    }
}
export class TaskOrchestrationCommand {
    task;
    swarmManager;
    swarmId;
    context;
    constructor(task, swarmManager, swarmId, context) {
        this.task = task;
        this.swarmManager = swarmManager;
        this.swarmId = swarmId;
        this.context = context;
    }
    async validate() {
        const errors = [];
        if (!this.task.description) {
            errors.push('Task description is required');
        }
        if (!this.context.permissions.includes('task:orchestrate')) {
            errors.push('Insufficient permissions to orchestrate tasks');
        }
        return { valid: errors.length === 0, errors };
    }
    async execute() {
        const startTime = Date.now();
        const validation = await this.validate();
        if (!validation.valid) {
            return {
                success: false,
                error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
                executionTime: Date.now() - startTime,
                resourceUsage: this.measureResources(),
            };
        }
        try {
            const result = await this.swarmManager.orchestrateTask(this.swarmId, this.task);
            return {
                success: true,
                data: result,
                executionTime: Date.now() - startTime,
                resourceUsage: this.measureResources(),
                metadata: {
                    swarmId: this.swarmId,
                    priority: this.task.priority,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error,
                executionTime: Date.now() - startTime,
                resourceUsage: this.measureResources(),
            };
        }
    }
    canUndo() {
        return false;
    }
    getCommandType() {
        return 'task_orchestrate';
    }
    getEstimatedDuration() {
        const baseDuration = 200;
        const priorityMultiplier = this.task.priority === 'critical'
            ? 0.5
            : this.task.priority === 'high'
                ? 0.7
                : this.task.priority === 'medium'
                    ? 1.0
                    : 1.5;
        return baseDuration * priorityMultiplier;
    }
    getDescription() {
        return `Orchestrate task: ${this.task.description}`;
    }
    getRequiredPermissions() {
        return ['task:orchestrate'];
    }
    measureResources() {
        return {
            cpu: process.cpuUsage().system / 1000000,
            memory: process.memoryUsage().heapUsed / 1024 / 1024,
            network: 0,
            storage: 0,
            timestamp: new Date(),
        };
    }
}
export class MCPCommandQueue extends EventEmitter {
    logger;
    commandHistory = [];
    undoStack = [];
    activeTransactions = new Map();
    metrics;
    processing = false;
    maxConcurrentCommands = 5;
    currentlyExecuting = 0;
    queue = [];
    constructor(logger) {
        super();
        this.logger = logger;
        this.metrics = this.initializeMetrics();
        this.startProcessing();
    }
    async execute(command) {
        return new Promise((resolve, reject) => {
            this.queue.push({ command, resolve, reject });
            this.emit('queue:enqueued', {
                command: command.getCommandType(),
                queueSize: this.queue.length,
            });
        });
    }
    async executeBatch(commands) {
        const fastCommands = commands.filter((cmd) => cmd.getEstimatedDuration() < 1000);
        const slowCommands = commands.filter((cmd) => cmd.getEstimatedDuration() >= 1000);
        const parallelResults = await this.executeParallel(fastCommands);
        const sequentialResults = [];
        for (const command of slowCommands) {
            sequentialResults?.push(await this.execute(command));
        }
        return [...parallelResults, ...sequentialResults];
    }
    async executeTransaction(commands) {
        const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const transaction = {
            id: transactionId,
            commands,
            status: 'pending',
            createdAt: new Date(),
        };
        this.activeTransactions.set(transactionId, transaction);
        const results = [];
        try {
            transaction.status = 'executing';
            for (const command of commands) {
                const result = await this.execute(command);
                results.push(result);
                if (!result?.success) {
                    await this.rollbackTransaction(transactionId, results);
                    transaction.status = 'rolled_back';
                    transaction.rollbackReason = result?.error?.message;
                    break;
                }
            }
            if (results.every((r) => r.success)) {
                transaction.status = 'completed';
                transaction.completedAt = new Date();
            }
        }
        catch (error) {
            transaction.status = 'failed';
            transaction.rollbackReason = error.message;
            await this.rollbackTransaction(transactionId, results);
        }
        finally {
            this.activeTransactions.delete(transactionId);
        }
        return results;
    }
    async undo() {
        const command = this.undoStack.pop();
        if (command?.undo) {
            try {
                await command.undo();
                this.metrics.commandTypeStats.get(command.getCommandType())?.count || 0;
                this.emit('command:undone', { commandType: command.getCommandType() });
            }
            catch (error) {
                this.logger?.error('Undo operation failed:', error);
                this.emit('command:undo_failed', {
                    commandType: command.getCommandType(),
                    error,
                });
                throw error;
            }
        }
    }
    async retryCommand(originalCommand, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const command = originalCommand.clone
                    ? originalCommand.clone()
                    : originalCommand;
                const result = await this.execute(command);
                if (result?.success) {
                    return result;
                }
                lastError =
                    result?.error || new Error('Command failed without error details');
            }
            catch (error) {
                lastError = error;
            }
            if (attempt < maxRetries) {
                const delay = baseDelay * 2 ** (attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getHistory() {
        return [...this.commandHistory];
    }
    getActiveTransactions() {
        return Array.from(this.activeTransactions.values());
    }
    clearHistory() {
        this.commandHistory = [];
        this.undoStack = [];
        this.metrics = this.initializeMetrics();
    }
    async scheduleCommand(command, executeAt) {
        const delay = executeAt.getTime() - Date.now();
        if (delay <= 0) {
            return this.execute(command);
        }
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const result = await this.execute(command);
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            }, delay);
        });
    }
    async shutdown() {
        this.processing = false;
        while (this.currentlyExecuting > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        for (const [txId, transaction] of this.activeTransactions) {
            if (transaction.status === 'executing') {
                transaction.status = 'failed';
                transaction.rollbackReason = 'System shutdown';
                await this.rollbackTransaction(txId, []);
            }
        }
        this.emit('queue:shutdown');
    }
    async executeParallel(commands) {
        const chunks = [];
        for (let i = 0; i < commands.length; i += this.maxConcurrentCommands) {
            chunks.push(commands.slice(i, i + this.maxConcurrentCommands));
        }
        const results = [];
        for (const chunk of chunks) {
            const chunkResults = await Promise.allSettled(chunk.map((cmd) => this.execute(cmd)));
            results.push(...chunkResults?.map((result) => result?.status === 'fulfilled'
                ? result?.value
                : {
                    success: false,
                    error: result?.reason,
                    executionTime: 0,
                    resourceUsage: this.emptyResourceMetrics(),
                }));
        }
        return results;
    }
    startProcessing() {
        this.processing = true;
        const processNext = async () => {
            if (!this.processing ||
                this.currentlyExecuting >= this.maxConcurrentCommands) {
                setTimeout(processNext, 10);
                return;
            }
            const item = this.queue.shift();
            if (!item) {
                setTimeout(processNext, 10);
                return;
            }
            this.currentlyExecuting++;
            this.executeCommand(item?.command)
                .then(item?.resolve)
                .catch(item?.reject)
                .finally(() => {
                this.currentlyExecuting--;
                setImmediate(processNext);
            });
            setImmediate(processNext);
        };
        processNext();
    }
    async executeCommand(command) {
        const startTime = Date.now();
        try {
            const result = await command.execute();
            this.updateMetrics(command, result, Date.now() - startTime);
            this.commandHistory.push({
                command,
                result,
                timestamp: new Date(),
            });
            if (result?.success && command.canUndo()) {
                this.undoStack.push(command);
            }
            this.emit('command:executed', {
                commandType: command.getCommandType(),
                success: result?.success,
                executionTime: result?.executionTime,
            });
            return result;
        }
        catch (error) {
            const errorResult = {
                success: false,
                error: error,
                executionTime: Date.now() - startTime,
                resourceUsage: this.emptyResourceMetrics(),
            };
            this.updateMetrics(command, errorResult, errorResult?.executionTime);
            this.emit('command:error', {
                commandType: command.getCommandType(),
                error: error,
            });
            return errorResult;
        }
    }
    async rollbackTransaction(transactionId, results) {
        const transaction = this.activeTransactions.get(transactionId);
        if (!transaction)
            return;
        for (let i = results.length - 1; i >= 0; i--) {
            const command = transaction.commands[i];
            const result = results[i];
            if (command &&
                result &&
                result?.success &&
                command.canUndo() &&
                command.undo) {
                try {
                    await command.undo();
                }
                catch (error) {
                    this.logger?.error('Transaction rollback failed for command:', error);
                }
            }
        }
    }
    updateMetrics(command, result, actualExecutionTime) {
        this.metrics.totalExecuted++;
        if (!result?.success) {
            this.metrics.totalFailed++;
        }
        const commandType = command.getCommandType();
        const stats = this.metrics.commandTypeStats.get(commandType) || {
            count: 0,
            avgTime: 0,
            failureRate: 0,
        };
        stats.count++;
        stats.avgTime =
            (stats.avgTime * (stats.count - 1) + actualExecutionTime) / stats.count;
        stats.failureRate =
            (stats.failureRate * (stats.count - 1) + (result?.success ? 0 : 1)) /
                stats.count;
        this.metrics.commandTypeStats.set(commandType, stats);
        this.metrics.averageExecutionTime =
            (this.metrics.averageExecutionTime * (this.metrics.totalExecuted - 1) +
                actualExecutionTime) /
                this.metrics.totalExecuted;
        this.metrics.queueSize = this.queue.length;
    }
    initializeMetrics() {
        return {
            totalExecuted: 0,
            totalFailed: 0,
            averageExecutionTime: 0,
            commandTypeStats: new Map(),
            queueSize: 0,
            processingTime: 0,
        };
    }
    emptyResourceMetrics() {
        return {
            cpu: 0,
            memory: 0,
            network: 0,
            storage: 0,
            timestamp: new Date(),
        };
    }
}
export class CommandFactory {
    static createSwarmInitCommand(config, swarmManager, context) {
        return new SwarmInitCommand(config, swarmManager, context);
    }
    static createAgentSpawnCommand(agentConfig, swarmManager, swarmId, context) {
        return new AgentSpawnCommand(agentConfig, swarmManager, swarmId, context);
    }
    static createTaskOrchestrationCommand(task, swarmManager, swarmId, context) {
        return new TaskOrchestrationCommand(task, swarmManager, swarmId, context);
    }
}
//# sourceMappingURL=command-system.js.map