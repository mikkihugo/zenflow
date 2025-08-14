import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { loggingConfig } from './logging-config.ts';
export class ConnectionDiagnostics {
    logger;
    connectionHistory;
    maxHistorySize;
    activeConnections;
    constructor(logger) {
        this.logger =
            logger || loggingConfig?.getLogger('diagnostics', { level: 'DEBUG' });
        this.connectionHistory = [];
        this.maxHistorySize = 100;
        this.activeConnections = new Map();
    }
    recordEvent(connectionId, event, details = {}) {
        const timestamp = new Date().toISOString();
        const entry = {
            connectionId,
            event,
            timestamp,
            details,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
        };
        this.connectionHistory.push(entry);
        if (this.connectionHistory.length > this.maxHistorySize) {
            this.connectionHistory.shift();
        }
        if (event === 'established') {
            this.activeConnections.set(connectionId, {
                startTime: Date.now(),
                ...details,
            });
        }
        else if (event === 'closed' || event === 'failed') {
            const conn = this.activeConnections.get(connectionId);
            if (conn) {
                entry.duration =
                    Date.now() - conn.startTime;
                this.activeConnections.delete(connectionId);
            }
        }
        this.logger.debug('Connection event recorded', entry);
        return entry;
    }
    getConnectionSummary() {
        const events = this.connectionHistory.reduce((acc, event) => {
            acc[event['event']] = (acc[event['event']] || 0) + 1;
            return acc;
        }, {});
        const failures = this.connectionHistory.filter((e) => e.event === 'failed');
        const recentFailures = failures.slice(-10);
        return {
            totalEvents: this.connectionHistory.length,
            eventCounts: events,
            activeConnections: this.activeConnections.size,
            recentFailures,
            failureRate: failures.length / this.connectionHistory.length,
        };
    }
    analyzePatterns() {
        const failures = this.connectionHistory.filter((e) => e.event === 'failed');
        const errorTypes = failures.reduce((acc, failure) => {
            const errorObj = failure.details?.['error'];
            const error = errorObj?.message || 'Unknown';
            acc[error] = (acc[error] || 0) + 1;
            return acc;
        }, {});
        const hourlyFailures = new Array(24).fill(0);
        failures.forEach((failure) => {
            const hour = new Date(failure.timestamp).getHours();
            hourlyFailures[hour]++;
        });
        const memoryAtFailure = failures.map((f) => ({
            timestamp: f.timestamp,
            heapUsed: f.memoryUsage.heapUsed / (1024 * 1024),
            external: f.memoryUsage.external / (1024 * 1024),
        }));
        return {
            errorTypes,
            hourlyFailures,
            memoryAtFailure,
            avgMemoryAtFailure: memoryAtFailure.reduce((sum, m) => sum + m.heapUsed, 0) /
                memoryAtFailure.length,
        };
    }
    generateReport() {
        const summary = this.getConnectionSummary();
        const patterns = this.analyzePatterns();
        const systemInfo = {
            platform: process.platform,
            nodeVersion: process.version,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
        };
        const report = {
            timestamp: new Date().toISOString(),
            system: systemInfo,
            connections: summary,
            patterns,
            recommendations: this.generateRecommendations(summary, patterns),
        };
        this.logger.info('Diagnostic report generated', {
            failureRate: summary.failureRate,
            activeConnections: summary.activeConnections,
        });
        return report;
    }
    generateRecommendations(summary, patterns) {
        const recommendations = [];
        if (summary.failureRate > 0.1) {
            recommendations.push({
                severity: 'high',
                issue: 'High connection failure rate',
                suggestion: 'Check network stability and MCP server configuration',
            });
        }
        if (patterns.avgMemoryAtFailure > 500) {
            recommendations.push({
                severity: 'medium',
                issue: 'High memory usage during failures',
                suggestion: 'Consider increasing memory limits or optimizing memory usage',
            });
        }
        Object.entries(patterns.errorTypes).forEach(([error, count]) => {
            if (count > 5) {
                recommendations.push({
                    severity: 'medium',
                    issue: `Recurring error: ${error}`,
                    suggestion: `Investigate root cause of: ${error}`,
                });
            }
        });
        return recommendations;
    }
}
export class PerformanceDiagnostics {
    logger;
    operations;
    thresholds;
    constructor(logger) {
        this.logger =
            logger || loggingConfig?.getLogger('diagnostics', { level: 'DEBUG' });
        this.operations = new Map();
        this.thresholds = {
            swarm_init: 1000,
            agent_spawn: 500,
            task_orchestrate: 2000,
            neural_train: 5000,
        };
    }
    startOperation(name, metadata = {}) {
        const id = `${name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        this.operations.set(id, {
            name,
            startTime: performance.now(),
            startMemory: process.memoryUsage(),
            metadata,
        });
        return id;
    }
    endOperation(id, success = true) {
        const operation = this.operations.get(id);
        if (!operation) {
            return null;
        }
        const endTime = performance.now();
        const duration = endTime - operation.startTime;
        const endMemory = process.memoryUsage();
        const result = {
            ...operation,
            endTime,
            duration,
            success,
            memoryDelta: {
                heapUsed: endMemory.heapUsed - operation.startMemory.heapUsed,
                external: endMemory.external - operation.startMemory.external,
            },
            aboveThreshold: duration > (this.thresholds[operation.name] || 1000),
        };
        this.operations.delete(id);
        if (result?.aboveThreshold) {
            this.logger.warn('Operation exceeded threshold', {
                operation: operation.name,
                duration,
                threshold: this.thresholds[operation.name],
            });
        }
        return result;
    }
    getSlowOperations(limit = 10) {
        const completed = [];
        return completed
            .filter((op) => op.aboveThreshold)
            .sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))
            .slice(0, limit);
    }
}
export class SystemDiagnostics {
    logger;
    samples;
    maxSamples;
    monitorInterval;
    constructor(logger) {
        this.logger =
            logger || loggingConfig?.getLogger('diagnostics', { level: 'DEBUG' });
        this.samples = [];
        this.maxSamples = 60;
        this.monitorInterval = null;
    }
    collectSample() {
        const sample = {
            timestamp: Date.now(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            handles: process['_getActiveHandles']?.().length || 0,
            requests: process['_getActiveRequests']?.().length || 0,
        };
        this.samples.push(sample);
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
        return sample;
    }
    startMonitoring(interval = 1000) {
        if (this.monitorInterval) {
            this.stopMonitoring();
        }
        this.monitorInterval = setInterval(() => {
            const sample = this.collectSample();
            if (sample.memory.heapUsed > 500 * 1024 * 1024) {
                this.logger.warn('High memory usage detected', {
                    heapUsed: `${(sample.memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                });
            }
            if (sample.handles > 100) {
                this.logger.warn('High number of active handles', {
                    handles: sample.handles,
                });
            }
        }, interval);
        this.logger.info('System monitoring started', { interval });
    }
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            this.logger.info('System monitoring stopped');
        }
    }
    getSystemHealth() {
        if (this.samples.length === 0) {
            return {
                status: 'unknown',
                issues: [{ component: 'system', message: 'No samples collected' }],
            };
        }
        const latest = this.samples[this.samples.length - 1];
        if (!latest) {
            return {
                status: 'unknown',
                issues: [{ component: 'system', message: 'No latest sample' }],
            };
        }
        const avgMemory = this.samples.reduce((sum, s) => sum + s.memory.heapUsed, 0) /
            this.samples.length;
        let status = 'healthy';
        const issues = [];
        if (latest.memory.heapUsed > 400 * 1024 * 1024) {
            status = 'warning';
            issues.push({ component: 'memory', message: 'High memory usage' });
        }
        if (latest && latest.handles > 50) {
            status = 'warning';
            issues.push({ component: 'handles', message: 'Many active handles' });
        }
        if (avgMemory > 300 * 1024 * 1024) {
            status = 'warning';
            issues.push({
                component: 'memory',
                message: 'Sustained high memory usage',
            });
        }
        return {
            status,
            issues,
            metrics: {
                currentMemory: `${(latest.memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                avgMemory: `${(avgMemory / 1024 / 1024).toFixed(2)} MB`,
                handles: latest.handles,
                requests: latest.requests,
            },
        };
    }
}
export class DiagnosticsManager {
    logger;
    connection;
    performance;
    system;
    constructor() {
        this.logger = loggingConfig?.getLogger('diagnostics', { level: 'DEBUG' });
        this.connection = new ConnectionDiagnostics(this.logger);
        this.performance = new PerformanceDiagnostics(this.logger);
        this.system = new SystemDiagnostics(this.logger);
    }
    enableAll() {
        this.system.startMonitoring();
        this.logger.info('All diagnostics enabled');
    }
    disableAll() {
        this.system.stopMonitoring();
        this.logger.info('All diagnostics disabled');
    }
    async generateFullReport(outputPath = null) {
        const report = {
            timestamp: new Date().toISOString(),
            connection: this.connection.generateReport(),
            performance: {
                slowOperations: this.performance.getSlowOperations(),
            },
            system: this.system.getSystemHealth(),
            logs: await this.collectRecentLogs(),
        };
        if (outputPath) {
            const reportPath = resolve(outputPath);
            writeFileSync(reportPath, JSON.stringify(report, null, 2));
            this.logger.info('Diagnostic report saved', { path: reportPath });
        }
        return report;
    }
    async collectRecentLogs() {
        return {
            message: 'Log collection would read from log files',
            logsEnabled: process.env['LOG_TO_FILE'] === 'true',
        };
    }
    async runDiagnosticTests() {
        const tests = [];
        tests.push(await this.testMemoryAllocation());
        tests.push(await this.testFileSystem());
        tests.push(await this.testWasmLoading());
        return {
            timestamp: new Date().toISOString(),
            tests,
            summary: {
                total: tests.length,
                passed: tests.filter((t) => t.success).length,
                failed: tests.filter((t) => !t.success).length,
            },
        };
    }
    async testMemoryAllocation() {
        try {
            const start = process.memoryUsage().heapUsed;
            const _testArray = new Array(1000000).fill(0);
            void _testArray.length;
            const end = process.memoryUsage().heapUsed;
            return {
                name: 'Memory Allocation',
                success: true,
                allocated: `${((end - start) / 1024 / 1024).toFixed(2)} MB`,
            };
        }
        catch (error) {
            return {
                name: 'Memory Allocation',
                success: false,
                error: error.message,
            };
        }
    }
    async testFileSystem() {
        try {
            const testPath = join(process.cwd(), 'logs', '.diagnostic-test');
            mkdirSync(dirname(testPath), { recursive: true });
            writeFileSync(testPath, 'test');
            unlinkSync(testPath);
            return {
                name: 'File System Access',
                success: true,
                path: testPath,
            };
        }
        catch (error) {
            return {
                name: 'File System Access',
                success: false,
                error: error.message,
            };
        }
    }
    async testWasmLoading() {
        try {
            const wasmPath = join(process.cwd(), 'wasm', 'ruv_swarm_wasm_bg.wasm');
            const exists = existsSync(wasmPath);
            return {
                name: 'WASM Module Check',
                success: exists,
                path: wasmPath,
                exists,
            };
        }
        catch (error) {
            return {
                name: 'WASM Module Check',
                success: false,
                error: error.message,
            };
        }
    }
}
export const diagnostics = new DiagnosticsManager();
export default diagnostics;
//# sourceMappingURL=diagnostics.js.map