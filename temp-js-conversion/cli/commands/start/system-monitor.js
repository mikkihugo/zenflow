"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMonitor = void 0;
/**
 * System Monitor - Real-time monitoring of system processes
 */
const chalk_1 = require("chalk");
const types_js_1 = require("../../../utils/types.js");
const event_bus_js_1 = require("../../../core/event-bus.js");
class SystemMonitor {
    constructor(processManager) {
        this.events = [];
        this.maxEvents = 100;
        this.processManager = processManager;
        this.setupEventListeners();
    }
    setupEventListeners() {
        // System events
        event_bus_js_1.eventBus.on(types_js_1.SystemEvents.AGENT_SPAWNED, (data) => {
            this.addEvent({
                type: 'agent_spawned',
                timestamp: Date.now(),
                data,
                level: 'info'
            });
        });
        event_bus_js_1.eventBus.on(types_js_1.SystemEvents.AGENT_TERMINATED, (data) => {
            this.addEvent({
                type: 'agent_terminated',
                timestamp: Date.now(),
                data,
                level: 'warning'
            });
        });
        event_bus_js_1.eventBus.on(types_js_1.SystemEvents.TASK_ASSIGNED, (data) => {
            this.addEvent({
                type: 'task_assigned',
                timestamp: Date.now(),
                data,
                level: 'info'
            });
        });
        event_bus_js_1.eventBus.on(types_js_1.SystemEvents.TASK_COMPLETED, (data) => {
            this.addEvent({
                type: 'task_completed',
                timestamp: Date.now(),
                data,
                level: 'success'
            });
        });
        event_bus_js_1.eventBus.on(types_js_1.SystemEvents.TASK_FAILED, (data) => {
            this.addEvent({
                type: 'task_failed',
                timestamp: Date.now(),
                data,
                level: 'error'
            });
        });
        event_bus_js_1.eventBus.on(types_js_1.SystemEvents.SYSTEM_ERROR, (data) => {
            this.addEvent({
                type: 'system_error',
                timestamp: Date.now(),
                data,
                level: 'error'
            });
        });
        // Process manager events
        this.processManager.on('processStarted', ({ processId, process }) => {
            this.addEvent({
                type: 'process_started',
                timestamp: Date.now(),
                data: { processId, processName: process.name },
                level: 'success'
            });
        });
        this.processManager.on('processStopped', ({ processId }) => {
            this.addEvent({
                type: 'process_stopped',
                timestamp: Date.now(),
                data: { processId },
                level: 'warning'
            });
        });
        this.processManager.on('processError', ({ processId, error }) => {
            this.addEvent({
                type: 'process_error',
                timestamp: Date.now(),
                data: { processId, error: (error instanceof Error ? error.message : String(error)) },
                level: 'error'
            });
        });
    }
    addEvent(event) {
        this.events.unshift(event);
        if (this.events.length > this.maxEvents) {
            this.events.pop();
        }
    }
    start() {
        // Start collecting metrics
        this.metricsInterval = setInterval(() => {
            this.collectMetrics();
        }, 5000);
    }
    stop() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
    }
    collectMetrics() {
        // Collect system metrics
        const processes = this.processManager.getAllProcesses();
        for (const process of processes) {
            if (process.status === 'running') {
                // Simulate metrics collection (would integrate with actual monitoring)
                process.metrics = {
                    ...process.metrics,
                    cpu: Math.random() * 50,
                    memory: Math.random() * 200,
                    uptime: process.startTime ? Date.now() - process.startTime : 0
                };
            }
        }
    }
    getRecentEvents(count = 10) {
        return this.events.slice(0, count);
    }
    printEventLog(count = 20) {
        console.log(chalk_1.default.cyan.bold('📊 Recent System Events'));
        console.log(chalk_1.default.gray('─'.repeat(80)));
        const events = this.getRecentEvents(count);
        for (const event of events) {
            const timestamp = new Date(event.timestamp).toLocaleTimeString();
            const icon = this.getEventIcon(event.type);
            const color = this.getEventColor(event.level);
            console.log(chalk_1.default.gray(timestamp), icon, color(this.formatEventMessage(event)));
        }
    }
    getEventIcon(type) {
        const icons = {
            agent_spawned: '🤖',
            agent_terminated: '🔚',
            task_assigned: '📌',
            task_completed: '✅',
            task_failed: '❌',
            system_error: '⚠️',
            process_started: '▶️',
            process_stopped: '⏹️',
            process_error: '🚨'
        };
        return icons[type] || '•';
    }
    getEventColor(level) {
        switch (level) {
            case 'success':
                return chalk_1.default.green;
            case 'info':
                return chalk_1.default.blue;
            case 'warning':
                return chalk_1.default.yellow;
            case 'error':
                return chalk_1.default.red;
            default:
                return chalk_1.default.white;
        }
    }
    formatEventMessage(event) {
        switch (event.type) {
            case 'agent_spawned':
                return `Agent spawned: ${event.data.agentId} (${event.data.profile?.type || 'unknown'})`;
            case 'agent_terminated':
                return `Agent terminated: ${event.data.agentId} - ${event.data.reason}`;
            case 'task_assigned':
                return `Task ${event.data.taskId} assigned to ${event.data.agentId}`;
            case 'task_completed':
                return `Task completed: ${event.data.taskId}`;
            case 'task_failed':
                return `Task failed: ${event.data.taskId} - ${event.data.error?.message}`;
            case 'system_error':
                return `System error in ${event.data.component}: ${event.data.error?.message}`;
            case 'process_started':
                return `Process started: ${event.data.processName}`;
            case 'process_stopped':
                return `Process stopped: ${event.data.processId}`;
            case 'process_error':
                return `Process error: ${event.data.processId} - ${event.data.error}`;
            default:
                return JSON.stringify(event.data);
        }
    }
    printSystemHealth() {
        const stats = this.processManager.getSystemStats();
        const processes = this.processManager.getAllProcesses();
        console.log(chalk_1.default.cyan.bold('🏥 System Health'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        // Overall status
        const healthStatus = stats.errorProcesses === 0 ?
            chalk_1.default.green('● Healthy') :
            chalk_1.default.red(`● Unhealthy (${stats.errorProcesses} errors)`);
        console.log('Status:', healthStatus);
        console.log('Uptime:', this.formatUptime(stats.systemUptime));
        console.log();
        // Process status
        console.log(chalk_1.default.white.bold('Process Status:'));
        for (const process of processes) {
            const status = this.getProcessStatusIcon(process.status);
            const metrics = process.metrics;
            let line = `  ${status} ${process.name.padEnd(20)}`;
            if (metrics && process.status === 'running') {
                line += chalk_1.default.gray(` CPU: ${metrics.cpu?.toFixed(1)}% `);
                line += chalk_1.default.gray(` MEM: ${metrics.memory?.toFixed(0)}MB`);
            }
            console.log(line);
        }
        console.log();
        // System metrics
        console.log(chalk_1.default.white.bold('System Metrics:'));
        console.log(`  Active Processes: ${stats.runningProcesses}/${stats.totalProcesses}`);
        console.log(`  Recent Events: ${this.events.length}`);
        // Recent errors
        const recentErrors = this.events
            .filter(e => e.level === 'error')
            .slice(0, 3);
        if (recentErrors.length > 0) {
            console.log();
            console.log(chalk_1.default.red.bold('Recent Errors:'));
            for (const error of recentErrors) {
                const time = new Date(error.timestamp).toLocaleTimeString();
                console.log(chalk_1.default.red(`  ${time} - ${this.formatEventMessage(error)}`));
            }
        }
    }
    getProcessStatusIcon(status) {
        switch (status) {
            case 'running':
                return chalk_1.default.green('●');
            case 'stopped':
                return chalk_1.default.gray('○');
            case 'starting':
                return chalk_1.default.yellow('◐');
            case 'stopping':
                return chalk_1.default.yellow('◑');
            case 'error':
                return chalk_1.default.red('✗');
            default:
                return chalk_1.default.gray('?');
        }
    }
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }
}
exports.SystemMonitor = SystemMonitor;
