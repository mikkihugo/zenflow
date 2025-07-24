"use strict";
/**
 * @fileoverview Shared utilities for Claude Zen + ruv-FANN integration
 * @module shared-utils
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.ConcurrencyLimiter = exports.PerformanceTimer = exports.Logger = void 0;
exports.generateId = generateId;
exports.generateSwarmId = generateSwarmId;
exports.generateAgentId = generateAgentId;
exports.generateTaskId = generateTaskId;
exports.measureAsync = measureAsync;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.formatPercentage = formatPercentage;
exports.validateServiceName = validateServiceName;
exports.validateSwarmConfig = validateSwarmConfig;
exports.retry = retry;
exports.sleep = sleep;
exports.getMemoryUsage = getMemoryUsage;
exports.formatMemoryUsage = formatMemoryUsage;
exports.mergeConfigs = mergeConfigs;
const chalk_1 = __importDefault(require("chalk"));
const crypto_1 = require("crypto");
// ==================== LOGGING UTILITIES ====================
class Logger {
    module;
    logLevel;
    constructor(module, logLevel = 'info') {
        this.module = module;
        this.logLevel = logLevel;
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
    formatMessage(level, message, metadata) {
        const timestamp = new Date().toISOString();
        const moduleTag = chalk_1.default.blue(`[${this.module}]`);
        const levelTag = this.getLevelTag(level);
        let formatted = `${timestamp} ${levelTag} ${moduleTag} ${message}`;
        if (metadata) {
            formatted += `\n${JSON.stringify(metadata, null, 2)}`;
        }
        return formatted;
    }
    getLevelTag(level) {
        switch (level) {
            case 'debug': return chalk_1.default.gray('DEBUG');
            case 'info': return chalk_1.default.green('INFO ');
            case 'warn': return chalk_1.default.yellow('WARN ');
            case 'error': return chalk_1.default.red('ERROR');
            default: return chalk_1.default.white('     ');
        }
    }
    debug(message, metadata) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message, metadata));
        }
    }
    info(message, metadata) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, metadata));
        }
    }
    warn(message, metadata) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, metadata));
        }
    }
    error(message, metadata) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, metadata));
        }
    }
    createLogEntry(level, message, metadata) {
        return {
            timestamp: new Date().toISOString(),
            level,
            module: this.module,
            message,
            metadata
        };
    }
}
exports.Logger = Logger;
// ==================== ID GENERATION ====================
function generateId(prefix) {
    // Using crypto.randomUUID as temporary workaround for nanoid dependency issue
    const id = (0, crypto_1.randomUUID)().replace(/-/g, '').substring(0, 12);
    return prefix ? `${prefix}-${id}` : id;
}
function generateSwarmId(serviceName) {
    return generateId(`swarm-${serviceName}`);
}
function generateAgentId(agentType) {
    return generateId(`agent-${agentType}`);
}
function generateTaskId() {
    return generateId('task');
}
// ==================== PERFORMANCE UTILITIES ====================
class PerformanceTimer {
    startTime;
    endTime;
    markers = new Map();
    constructor() {
        this.startTime = performance.now();
    }
    mark(label) {
        this.markers.set(label, performance.now());
    }
    end() {
        this.endTime = performance.now();
        return this.getDuration();
    }
    getDuration() {
        const end = this.endTime || performance.now();
        return end - this.startTime;
    }
    getMarkerDuration(label) {
        const markerTime = this.markers.get(label);
        if (!markerTime) {
            throw new Error(`Marker '${label}' not found`);
        }
        return markerTime - this.startTime;
    }
    getAllMarkers() {
        const result = {};
        for (const [label, time] of this.markers) {
            result[label] = time - this.startTime;
        }
        return result;
    }
}
exports.PerformanceTimer = PerformanceTimer;
function measureAsync(fn, logger) {
    return new Promise(async (resolve, reject) => {
        const timer = new PerformanceTimer();
        try {
            const result = await fn();
            const duration = timer.end();
            if (logger) {
                logger.debug(`Operation completed in ${duration.toFixed(2)}ms`);
            }
            resolve({ result, duration });
        }
        catch (error) {
            const duration = timer.end();
            if (logger) {
                logger.error(`Operation failed after ${duration.toFixed(2)}ms`, { error });
            }
            reject(error);
        }
    });
}
// ==================== FORMAT UTILITIES ====================
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms.toFixed(2)}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(2)}s`;
    if (ms < 3600000)
        return `${(ms / 60000).toFixed(2)}m`;
    return `${(ms / 3600000).toFixed(2)}h`;
}
function formatPercentage(value, total) {
    if (total === 0)
        return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
}
// ==================== VALIDATION UTILITIES ====================
function validateServiceName(name) {
    return /^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) && name.length >= 2 && name.length <= 50;
}
function validateSwarmConfig(config) {
    const errors = [];
    if (config.maxAgents && (config.maxAgents < 1 || config.maxAgents > 100)) {
        errors.push('maxAgents must be between 1 and 100');
    }
    if (config.topology && !['hierarchical', 'mesh', 'ring', 'star'].includes(config.topology)) {
        errors.push('topology must be one of: hierarchical, mesh, ring, star');
    }
    if (config.strategy && !['adaptive', 'parallel', 'sequential'].includes(config.strategy)) {
        errors.push('strategy must be one of: adaptive, parallel, sequential');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
// ==================== RETRY UTILITIES ====================
async function retry(fn, options = {}) {
    const { maxAttempts = 3, delay = 1000, backoff = 'linear', onRetry } = options;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                break;
            }
            if (onRetry) {
                onRetry(attempt, error);
            }
            const waitTime = backoff === 'exponential'
                ? delay * Math.pow(2, attempt - 1)
                : delay * attempt;
            await sleep(waitTime);
        }
    }
    throw lastError;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// ==================== CONCURRENCY UTILITIES ====================
class ConcurrencyLimiter {
    limit;
    running = 0;
    queue = [];
    constructor(limit) {
        this.limit = limit;
    }
    async run(fn) {
        return new Promise((resolve, reject) => {
            const execute = async () => {
                this.running++;
                try {
                    const result = await fn();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
                finally {
                    this.running--;
                    this.processQueue();
                }
            };
            if (this.running < this.limit) {
                execute();
            }
            else {
                this.queue.push(execute);
            }
        });
    }
    processQueue() {
        if (this.queue.length > 0 && this.running < this.limit) {
            const next = this.queue.shift();
            if (next) {
                next();
            }
        }
    }
    getStats() {
        return {
            running: this.running,
            queued: this.queue.length,
            limit: this.limit
        };
    }
}
exports.ConcurrencyLimiter = ConcurrencyLimiter;
// ==================== MEMORY UTILITIES ====================
function getMemoryUsage() {
    const memUsage = process.memoryUsage();
    const used = memUsage.heapUsed;
    const total = memUsage.heapTotal;
    return {
        used,
        total,
        percentage: (used / total) * 100
    };
}
function formatMemoryUsage() {
    const usage = getMemoryUsage();
    return `${formatBytes(usage.used)} / ${formatBytes(usage.total)} (${usage.percentage.toFixed(1)}%)`;
}
// ==================== CONFIGURATION UTILITIES ====================
function mergeConfigs(base, override) {
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
        if (value !== undefined) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result[key] = mergeConfigs(result[key], value);
            }
            else {
                result[key] = value;
            }
        }
    }
    return result;
}
// ==================== EXPORT ALL ====================
exports.utils = {
    Logger,
    generateId,
    generateSwarmId,
    generateAgentId,
    generateTaskId,
    PerformanceTimer,
    measureAsync,
    formatBytes,
    formatDuration,
    formatPercentage,
    validateServiceName,
    validateSwarmConfig,
    retry,
    sleep,
    ConcurrencyLimiter,
    getMemoryUsage,
    formatMemoryUsage,
    mergeConfigs
};
exports.default = exports.utils;
//# sourceMappingURL=index.js.map