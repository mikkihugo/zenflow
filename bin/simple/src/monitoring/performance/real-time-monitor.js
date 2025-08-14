import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import { cpuUsage, memoryUsage } from 'node:process';
export class RealTimePerformanceMonitor extends EventEmitter {
    config;
    metrics = new Map();
    alerts = [];
    isMonitoring = false;
    monitoringInterval;
    constructor(config = {}) {
        super();
        this.config = config;
        this.config = {
            retentionPeriod: 5 * 60 * 1000,
            samplingInterval: 1000,
            ...config,
        };
        if (config?.alertThresholds) {
            this.alerts = config?.alertThresholds;
        }
        this.setupDefaultAlerts();
    }
    start() {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectSystemMetrics();
            this.cleanupOldMetrics();
            this.checkAlerts();
        }, this.config.samplingInterval);
        this.emit('monitoring:started');
    }
    stop() {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.emit('monitoring:stopped');
    }
    record(name, value, tags) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
            tags,
        };
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)?.push(metric);
        this.emit('metric:recorded', metric);
        this.checkMetricAlerts(metric);
    }
    measure(name, fn, tags) {
        const start = performance.now();
        try {
            const result = fn();
            const duration = performance.now() - start;
            this.record(`${name}.duration`, duration, tags);
            return result;
        }
        catch (error) {
            const duration = performance.now() - start;
            this.record(`${name}.error_duration`, duration, tags);
            this.record(`${name}.error_count`, 1, tags);
            throw error;
        }
    }
    async measureAsync(name, fn, tags) {
        const start = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - start;
            this.record(`${name}.duration`, duration, tags);
            return result;
        }
        catch (error) {
            const duration = performance.now() - start;
            this.record(`${name}.error_duration`, duration, tags);
            this.record(`${name}.error_count`, 1, tags);
            throw error;
        }
    }
    getMetrics(name) {
        return this.metrics.get(name) || [];
    }
    getStats(name) {
        const metrics = this.getMetrics(name);
        if (metrics.length === 0) {
            return { count: 0 };
        }
        const values = metrics.map((m) => m.value).sort((a, b) => a - b);
        return {
            count: values.length,
            min: values[0],
            max: values[values.length - 1],
            p95: this.percentile(values, 0.95),
            p99: this.percentile(values, 0.99),
        };
    }
    getSystemSnapshot() {
        const mem = memoryUsage();
        const cpu = cpuUsage();
        return {
            timestamp: Date.now(),
            memory: {
                heapUsed: mem.heapUsed / 1024 / 1024,
                heapTotal: mem.heapTotal / 1024 / 1024,
                external: mem.external / 1024 / 1024,
                rss: mem.rss / 1024 / 1024,
            },
            cpu: {
                user: cpu.user / 1000,
                system: cpu.system / 1000,
            },
            uptime: process.uptime(),
            nodeVersion: process.version,
        };
    }
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            monitoring: {
                isActive: this.isMonitoring,
                metricsCount: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
                uniqueMetrics: this.metrics.size,
            },
            system: this.getSystemSnapshot(),
            metrics: {},
        };
        for (const [name] of this.metrics) {
            report.metrics[name] = this.getStats(name);
        }
        return JSON.stringify(report, null, 2);
    }
    addAlert(alert) {
        this.alerts.push(alert);
    }
    removeAlert(metric) {
        this.alerts = this.alerts.filter((alert) => alert.metric !== metric);
    }
    collectSystemMetrics() {
        const snapshot = this.getSystemSnapshot();
        this.record('system.memory.heap_used', snapshot.memory.heapUsed);
        this.record('system.memory.heap_total', snapshot.memory.heapTotal);
        this.record('system.memory.rss', snapshot.memory.rss);
        this.record('system.cpu.user', snapshot.cpu.user);
        this.record('system.cpu.system', snapshot.cpu.system);
        this.record('system.uptime', snapshot.uptime);
    }
    cleanupOldMetrics() {
        const cutoff = Date.now() - this.config.retentionPeriod;
        for (const [name, metrics] of this.metrics) {
            const filtered = metrics.filter((metric) => metric.timestamp > cutoff);
            if (filtered.length !== metrics.length) {
                this.metrics.set(name, filtered);
            }
        }
    }
    checkAlerts() {
        for (const alert of this.alerts) {
            if (!alert.enabled)
                continue;
            const latestMetrics = this.getMetrics(alert.metric);
            if (latestMetrics.length === 0)
                continue;
            const latestValue = latestMetrics[latestMetrics.length - 1]?.value;
            const triggered = this.evaluateAlert(latestValue, alert);
            if (triggered) {
                this.emit('alert:triggered', {
                    alert,
                    value: latestValue,
                    timestamp: Date.now(),
                });
            }
        }
    }
    checkMetricAlerts(metric) {
        const relevantAlerts = this.alerts.filter((alert) => alert.enabled && alert.metric === metric.name);
        for (const alert of relevantAlerts) {
            const triggered = this.evaluateAlert(metric.value, alert);
            if (triggered) {
                this.emit('alert:triggered', {
                    alert,
                    value: metric.value,
                    timestamp: metric.timestamp,
                });
            }
        }
    }
    evaluateAlert(value, alert) {
        switch (alert.comparison) {
            case 'gt':
                return value > alert.threshold;
            case 'lt':
                return value < alert.threshold;
            case 'eq':
                return value === alert.threshold;
            default:
                return false;
        }
    }
    percentile(values, p) {
        const index = Math.ceil(values.length * p) - 1;
        return values[Math.max(0, Math.min(index, values.length - 1))];
    }
    setupDefaultAlerts() {
        this.alerts.push({
            metric: 'system.memory.heap_used',
            threshold: 200,
            comparison: 'gt',
            enabled: true,
        }, {
            metric: 'build.duration',
            threshold: 30000,
            comparison: 'gt',
            enabled: true,
        }, {
            metric: 'api.response.duration',
            threshold: 1000,
            comparison: 'gt',
            enabled: true,
        });
    }
}
export const globalMonitor = new RealTimePerformanceMonitor();
if (process.env['NODE_ENV'] === 'production') {
    globalMonitor.start();
    process.on('SIGTERM', () => globalMonitor.stop());
    process.on('SIGINT', () => globalMonitor.stop());
}
export function monitored(metricName) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        const name = metricName || `${target.constructor.name}.${propertyKey}`;
        descriptor.value = function (...args) {
            return globalMonitor.measure(name, () => originalMethod.apply(this, args));
        };
        return descriptor;
    };
}
export function monitoredAsync(metricName) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        const name = metricName || `${target.constructor.name}.${propertyKey}`;
        descriptor.value = function (...args) {
            return globalMonitor.measureAsync(name, () => originalMethod.apply(this, args));
        };
        return descriptor;
    };
}
//# sourceMappingURL=real-time-monitor.js.map