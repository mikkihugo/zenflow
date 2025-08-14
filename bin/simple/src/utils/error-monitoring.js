import { EventEmitter } from 'node:events';
export class ErrorMonitoring extends EventEmitter {
    logger;
    errors = new Map();
    patterns = new Map();
    metrics = {
        totalErrors: 0,
        errorRate: 0,
        criticalErrors: 0,
        errorsByComponent: {},
        errorsByType: {},
        mttr: 0,
    };
    monitoringInterval;
    constructor(logger) {
        super();
        this.logger = logger;
        this.initializeDefaultPatterns();
        this.startMonitoring();
    }
    recordError(error, context = {}) {
        const errorContext = {
            component: context.component || 'unknown',
            operation: context.operation || 'unknown',
            ...(context.userId !== undefined && { userId: context.userId }),
            ...(context.sessionId !== undefined && { sessionId: context.sessionId }),
            metadata: context.metadata || {},
            stackTrace: error.stack || '',
            timestamp: new Date(),
        };
        const errorKey = `${errorContext.component}:${error.name}`;
        const componentErrors = this.errors.get(errorKey) || [];
        componentErrors.push(errorContext);
        this.errors.set(errorKey, componentErrors);
        this.updateMetrics(error, errorContext);
        this.checkPatterns(error, errorContext);
        this.emit('error:recorded', { error, context: errorContext });
        this.logger.error('Error recorded', {
            errorName: error.name,
            message: error.message,
            component: errorContext.component,
            operation: errorContext.operation,
        });
    }
    addPattern(pattern) {
        this.patterns.set(pattern.id, pattern);
        this.emit('pattern:added', { pattern });
    }
    removePattern(patternId) {
        this.patterns.delete(patternId);
        this.emit('pattern:removed', { patternId });
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getComponentErrors(component, since) {
        const allErrors = [];
        const sinceTime = since?.getTime() || 0;
        for (const [key, errors] of Array.from(this.errors)) {
            if (key.startsWith(`${component}:`)) {
                const filteredErrors = errors.filter((e) => e.timestamp.getTime() >= sinceTime);
                allErrors.push(...filteredErrors);
            }
        }
        return allErrors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getErrorTrends(component, timeWindow = 3600000) {
        const now = Date.now();
        const hourly = Array(24).fill(0);
        const daily = Array(7).fill(0);
        const components = {};
        for (const [key, errors] of Array.from(this.errors)) {
            if (component && !key.startsWith(`${component}:`))
                continue;
            const componentName = key.split(':')[0];
            if (componentName) {
                components[componentName] =
                    (components[componentName] || 0) + errors.length;
            }
            for (const error of errors) {
                const errorTime = error.timestamp.getTime();
                if (now - errorTime <= timeWindow) {
                    const hourIndex = Math.floor((now - errorTime) / (1000 * 60 * 60));
                    const dayIndex = Math.floor((now - errorTime) / (1000 * 60 * 60 * 24));
                    if (hourIndex >= 0 && hourIndex < 24) {
                        const hourlyIdx = 23 - hourIndex;
                        if (hourly[hourlyIdx] !== undefined) {
                            hourly[hourlyIdx]++;
                        }
                    }
                    if (dayIndex >= 0 && dayIndex < 7) {
                        const dailyIdx = 6 - dayIndex;
                        if (daily[dailyIdx] !== undefined) {
                            daily[dailyIdx]++;
                        }
                    }
                }
            }
        }
        return { hourly, daily, components };
    }
    clearOldErrors(maxAge = 7 * 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - maxAge;
        let cleared = 0;
        for (const [key, errors] of Array.from(this.errors)) {
            const filtered = errors.filter((e) => e.timestamp.getTime() > cutoff);
            cleared += errors.length - filtered.length;
            if (filtered.length === 0) {
                this.errors.delete(key);
            }
            else {
                this.errors.set(key, filtered);
            }
        }
        if (cleared > 0) {
            this.logger.info('Cleared old errors', { count: cleared });
            this.emit('errors:cleared', { count: cleared });
        }
    }
    generateReport(timeWindow = 24 * 60 * 60 * 1000) {
        const trends = this.getErrorTrends(undefined, timeWindow);
        const topErrors = [];
        const errorCounts = new Map();
        for (const [key, errors] of Array.from(this.errors)) {
            const [component, _errorType] = key.split(':');
            const recentErrors = errors.filter((e) => Date.now() - e.timestamp.getTime() <= timeWindow);
            if (recentErrors.length > 0 && component) {
                errorCounts.set(key, { count: recentErrors.length, component });
            }
        }
        const sortedErrors = Array.from(errorCounts.entries())
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10);
        for (const [key, data] of sortedErrors) {
            const errorType = key.split(':')[1] || 'unknown';
            topErrors.push({
                error: errorType,
                count: data?.['count'],
                component: data?.['component'],
            });
        }
        return {
            summary: this.getMetrics(),
            trends,
            topErrors,
            recentAlerts: [],
        };
    }
    updateMetrics(error, context) {
        this.metrics.totalErrors++;
        this.metrics.lastError = context.timestamp;
        const component = context.component;
        this.metrics.errorsByComponent[component] =
            (this.metrics.errorsByComponent[component] || 0) + 1;
        const errorType = error.name;
        this.metrics.errorsByType[errorType] =
            (this.metrics.errorsByType[errorType] || 0) + 1;
        if (this.isCriticalError(error, context)) {
            this.metrics.criticalErrors++;
        }
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        let recentErrors = 0;
        for (const errors of Array.from(this.errors.values())) {
            recentErrors += errors.filter((e) => e.timestamp.getTime() > oneHourAgo).length;
        }
        this.metrics.errorRate = recentErrors / 60;
    }
    checkPatterns(error, context) {
        for (const pattern of Array.from(this.patterns.values())) {
            if (this.matchesPattern(error, context, pattern)) {
                const recentMatches = this.countRecentMatches(pattern);
                if (recentMatches >= pattern.threshold) {
                    this.triggerAlert(pattern, recentMatches);
                }
            }
        }
    }
    matchesPattern(error, context, pattern) {
        const regex = new RegExp(pattern.pattern, 'i');
        return (regex.test(error.message) ||
            regex.test(error.name) ||
            regex.test(context.component) ||
            regex.test(context.operation));
    }
    countRecentMatches(pattern) {
        const cutoff = Date.now() - pattern.timeWindow;
        let count = 0;
        for (const errors of Array.from(this.errors.values())) {
            for (const error of errors) {
                if (error.timestamp.getTime() > cutoff) {
                    if (Math.random() < 0.1) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    triggerAlert(pattern, count) {
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: 'pattern',
            message: `Pattern "${pattern.description}" triggered`,
            severity: pattern.severity,
            component: 'error-monitoring',
            count,
            timeframe: `${pattern.timeWindow / 1000}s`,
            timestamp: new Date(),
        };
        this.emit('alert:triggered', { alert, pattern });
        this.logger.warn('Error pattern alert triggered', {
            patternId: pattern.id,
            description: pattern.description,
            count,
            severity: pattern.severity,
        });
    }
    isCriticalError(error, context) {
        const criticalPatterns = [
            'OutOfMemoryError',
            'StackOverflowError',
            'SecurityError',
            'DatabaseConnectionError',
            'ServiceUnavailableError',
        ];
        return (criticalPatterns.some((pattern) => error.name.includes(pattern) || error.message.includes(pattern)) ||
            context.component === 'security' ||
            context.component === 'database');
    }
    initializeDefaultPatterns() {
        const defaultPatterns = [
            {
                id: 'high-error-rate',
                pattern: '.*',
                description: 'High error rate detected',
                severity: 'medium',
                threshold: 10,
                timeWindow: 5 * 60 * 1000,
                actions: ['notify-admin', 'scale-resources'],
            },
            {
                id: 'memory-errors',
                pattern: 'memory|oom|out of memory',
                description: 'Memory-related errors',
                severity: 'high',
                threshold: 3,
                timeWindow: 10 * 60 * 1000,
                actions: ['restart-service', 'allocate-memory'],
            },
            {
                id: 'security-errors',
                pattern: 'security|unauthorized|forbidden|auth',
                description: 'Security-related errors',
                severity: 'critical',
                threshold: 1,
                timeWindow: 60 * 1000,
                actions: ['lock-account', 'notify-security-team'],
            },
            {
                id: 'database-errors',
                pattern: 'database|sql|connection|timeout',
                description: 'Database connectivity issues',
                severity: 'high',
                threshold: 5,
                timeWindow: 2 * 60 * 1000,
                actions: ['restart-db-connection', 'failover-database'],
            },
        ];
        for (const pattern of defaultPatterns) {
            this.addPattern(pattern);
        }
    }
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.clearOldErrors();
        }, 5 * 60 * 1000);
    }
    async shutdown() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.emit('shutdown');
    }
}
export function createErrorMonitoring(logger) {
    return new ErrorMonitoring(logger);
}
export default ErrorMonitoring;
//# sourceMappingURL=error-monitoring.js.map