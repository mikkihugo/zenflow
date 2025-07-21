"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessManager = void 0;
/**
 * Process Manager - Handles lifecycle of system processes
 */
const event_emitter_js_1 = require("./event-emitter.js");
const chalk_1 = require("chalk");
const types_js_1 = require("./types.js");
const orchestrator_js_1 = require("../../../core/orchestrator.js");
const manager_js_1 = require("../../../terminal/manager.js");
const manager_js_2 = require("../../../memory/manager.js");
const manager_js_3 = require("../../../coordination/manager.js");
const server_js_1 = require("../../../mcp/server.js");
const event_bus_js_1 = require("../../../core/event-bus.js");
const logger_js_1 = require("../../../core/logger.js");
const config_js_1 = require("../../../core/config.js");
class ProcessManager extends event_emitter_js_1.EventEmitter {
    constructor() {
        super();
        this.processes = new Map();
        this.initializeProcesses();
    }
    initializeProcesses() {
        // Define all manageable processes
        const processDefinitions = [
            {
                id: 'event-bus',
                name: 'Event Bus',
                type: types_js_1.ProcessType.EVENT_BUS,
                status: types_js_1.ProcessStatus.STOPPED
            },
            {
                id: 'orchestrator',
                name: 'Orchestrator Engine',
                type: types_js_1.ProcessType.ORCHESTRATOR,
                status: types_js_1.ProcessStatus.STOPPED
            },
            {
                id: 'memory-manager',
                name: 'Memory Manager',
                type: types_js_1.ProcessType.MEMORY_MANAGER,
                status: types_js_1.ProcessStatus.STOPPED
            },
            {
                id: 'terminal-pool',
                name: 'Terminal Pool',
                type: types_js_1.ProcessType.TERMINAL_POOL,
                status: types_js_1.ProcessStatus.STOPPED
            },
            {
                id: 'mcp-server',
                name: 'MCP Server',
                type: types_js_1.ProcessType.MCP_SERVER,
                status: types_js_1.ProcessStatus.STOPPED
            },
            {
                id: 'coordinator',
                name: 'Coordination Manager',
                type: types_js_1.ProcessType.COORDINATOR,
                status: types_js_1.ProcessStatus.STOPPED
            }
        ];
        for (const process of processDefinitions) {
            this.processes.set(process.id, process);
        }
    }
    async initialize(configPath) {
        try {
            this.config = await config_js_1.configManager.load(configPath);
            this.emit('initialized', { config: this.config });
        }
        catch (error) {
            this.emit('error', { component: 'ProcessManager', error });
            throw error;
        }
    }
    async startProcess(processId) {
        const process = this.processes.get(processId);
        if (!process) {
            throw new Error(`Unknown process: ${processId}`);
        }
        if (process.status === types_js_1.ProcessStatus.RUNNING) {
            throw new Error(`Process ${processId} is already running`);
        }
        this.updateProcessStatus(processId, types_js_1.ProcessStatus.STARTING);
        try {
            switch (process.type) {
                case types_js_1.ProcessType.EVENT_BUS:
                    // Event bus is already initialized globally
                    process.pid = Deno.pid;
                    break;
                case types_js_1.ProcessType.MEMORY_MANAGER:
                    this.memoryManager = new manager_js_2.MemoryManager(this.config.memory, event_bus_js_1.eventBus, logger_js_1.logger);
                    await this.memoryManager.initialize();
                    break;
                case types_js_1.ProcessType.TERMINAL_POOL:
                    this.terminalManager = new manager_js_1.TerminalManager(this.config.terminal, event_bus_js_1.eventBus, logger_js_1.logger);
                    await this.terminalManager.initialize();
                    break;
                case types_js_1.ProcessType.COORDINATOR:
                    this.coordinationManager = new manager_js_3.CoordinationManager(this.config.coordination, event_bus_js_1.eventBus, logger_js_1.logger);
                    await this.coordinationManager.initialize();
                    break;
                case types_js_1.ProcessType.MCP_SERVER:
                    this.mcpServer = new server_js_1.MCPServer(this.config.mcp, event_bus_js_1.eventBus, logger_js_1.logger);
                    await this.mcpServer.start();
                    break;
                case types_js_1.ProcessType.ORCHESTRATOR:
                    if (!this.terminalManager || !this.memoryManager ||
                        !this.coordinationManager || !this.mcpServer) {
                        throw new Error('Required components not initialized');
                    }
                    this.orchestrator = new orchestrator_js_1.Orchestrator(this.config, this.terminalManager, this.memoryManager, this.coordinationManager, this.mcpServer, event_bus_js_1.eventBus, logger_js_1.logger);
                    await this.orchestrator.initialize();
                    break;
            }
            process.startTime = Date.now();
            this.updateProcessStatus(processId, types_js_1.ProcessStatus.RUNNING);
            this.emit('processStarted', { processId, process });
        }
        catch (error) {
            this.updateProcessStatus(processId, types_js_1.ProcessStatus.ERROR);
            process.metrics = {
                ...process.metrics,
                lastError: error.message
            };
            this.emit('processError', { processId, error });
            throw error;
        }
    }
    async stopProcess(processId) {
        const process = this.processes.get(processId);
        if (!process || process.status !== types_js_1.ProcessStatus.RUNNING) {
            throw new Error(`Process ${processId} is not running`);
        }
        this.updateProcessStatus(processId, types_js_1.ProcessStatus.STOPPING);
        try {
            switch (process.type) {
                case types_js_1.ProcessType.ORCHESTRATOR:
                    if (this.orchestrator) {
                        await this.orchestrator.shutdown();
                        this.orchestrator = undefined;
                    }
                    break;
                case types_js_1.ProcessType.MCP_SERVER:
                    if (this.mcpServer) {
                        await this.mcpServer.stop();
                        this.mcpServer = undefined;
                    }
                    break;
                case types_js_1.ProcessType.MEMORY_MANAGER:
                    if (this.memoryManager) {
                        await this.memoryManager.shutdown();
                        this.memoryManager = undefined;
                    }
                    break;
                case types_js_1.ProcessType.TERMINAL_POOL:
                    if (this.terminalManager) {
                        await this.terminalManager.shutdown();
                        this.terminalManager = undefined;
                    }
                    break;
                case types_js_1.ProcessType.COORDINATOR:
                    if (this.coordinationManager) {
                        await this.coordinationManager.shutdown();
                        this.coordinationManager = undefined;
                    }
                    break;
            }
            this.updateProcessStatus(processId, types_js_1.ProcessStatus.STOPPED);
            this.emit('processStopped', { processId });
        }
        catch (error) {
            this.updateProcessStatus(processId, types_js_1.ProcessStatus.ERROR);
            this.emit('processError', { processId, error });
            throw error;
        }
    }
    async restartProcess(processId) {
        await this.stopProcess(processId);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
        await this.startProcess(processId);
    }
    async startAll() {
        // Start in dependency order
        const startOrder = [
            'event-bus',
            'memory-manager',
            'terminal-pool',
            'coordinator',
            'mcp-server',
            'orchestrator'
        ];
        for (const processId of startOrder) {
            try {
                await this.startProcess(processId);
            }
            catch (error) {
                console.error(chalk_1.default.red(`Failed to start ${processId}:`), error.message);
                // Continue with other processes
            }
        }
    }
    async stopAll() {
        // Stop in reverse dependency order
        const stopOrder = [
            'orchestrator',
            'mcp-server',
            'coordinator',
            'terminal-pool',
            'memory-manager',
            'event-bus'
        ];
        for (const processId of stopOrder) {
            const process = this.processes.get(processId);
            if (process && process.status === types_js_1.ProcessStatus.RUNNING) {
                try {
                    await this.stopProcess(processId);
                }
                catch (error) {
                    console.error(chalk_1.default.red(`Failed to stop ${processId}:`), error.message);
                }
            }
        }
    }
    getProcess(processId) {
        return this.processes.get(processId);
    }
    getAllProcesses() {
        return Array.from(this.processes.values());
    }
    getSystemStats() {
        const processes = this.getAllProcesses();
        const runningProcesses = processes.filter(p => p.status === types_js_1.ProcessStatus.RUNNING);
        const stoppedProcesses = processes.filter(p => p.status === types_js_1.ProcessStatus.STOPPED);
        const errorProcesses = processes.filter(p => p.status === types_js_1.ProcessStatus.ERROR);
        return {
            totalProcesses: processes.length,
            runningProcesses: runningProcesses.length,
            stoppedProcesses: stoppedProcesses.length,
            errorProcesses: errorProcesses.length,
            systemUptime: this.getSystemUptime(),
            totalMemory: this.getTotalMemoryUsage(),
            totalCpu: this.getTotalCpuUsage()
        };
    }
    updateProcessStatus(processId, status) {
        const process = this.processes.get(processId);
        if (process) {
            process.status = status;
            this.emit('statusChanged', { processId, status });
        }
    }
    getSystemUptime() {
        const orchestrator = this.processes.get('orchestrator');
        if (orchestrator && orchestrator.startTime) {
            return Date.now() - orchestrator.startTime;
        }
        return 0;
    }
    getTotalMemoryUsage() {
        // Placeholder - would integrate with actual memory monitoring
        return 0;
    }
    getTotalCpuUsage() {
        // Placeholder - would integrate with actual CPU monitoring
        return 0;
    }
    async getProcessLogs(processId, lines = 50) {
        // Placeholder - would integrate with actual logging system
        return [
            `[${new Date().toISOString()}] Process ${processId} started`,
            `[${new Date().toISOString()}] Process ${processId} is running normally`
        ];
    }
}
exports.ProcessManager = ProcessManager;
