"use strict";
/**
 * Diagnostic Tools for Claude Flow v2.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticManager = void 0;
const system_integration_js_1 = require("../integration/system-integration.js");
const health_check_js_1 = require("./health-check.js");
const error_handler_js_1 = require("../utils/error-handler.js");
const fs_1 = require("fs");
class DiagnosticManager {
    constructor(eventBus, logger, healthCheckManager) {
        this.performanceHistory = new Map();
        this.errorHistory = new Map();
        this.eventBus = eventBus;
        this.logger = logger;
        this.systemIntegration = system_integration_js_1.SystemIntegration.getInstance();
        this.healthCheckManager = healthCheckManager || new health_check_js_1.HealthCheckManager(eventBus, logger);
        this.setupEventHandlers();
    }
    /**
     * Generate comprehensive diagnostic report
     */
    async generateDiagnosticReport(config = {}) {
        this.logger.info('Generating comprehensive diagnostic report');
        const startTime = Date.now();
        try {
            // Get system health
            const systemHealth = await this.systemIntegration.getSystemHealth();
            // Get current metrics
            const metrics = this.healthCheckManager.getCurrentMetrics();
            // Analyze components
            const components = await this.analyzeComponents(config);
            // Analyze performance
            const performance = await this.analyzePerformance(config);
            // Generate recommendations
            const recommendations = config.generateRecommendations !== false
                ? this.generateRecommendations(systemHealth, performance, components)
                : [];
            // Determine overall severity
            const severity = this.calculateSeverity(systemHealth, components);
            const report = {
                timestamp: Date.now(),
                systemHealth,
                metrics,
                components,
                performance,
                recommendations,
                severity
            };
            // Export report if requested
            if (config.outputPath) {
                await this.exportReport(report, config);
            }
            const duration = Date.now() - startTime;
            this.logger.info(`Diagnostic report generated in ${duration}ms`);
            this.eventBus.emit('diagnostics:report:generated', {
                report,
                duration,
                timestamp: Date.now()
            });
            return report;
        }
        catch (error) {
            this.logger.error('Failed to generate diagnostic report:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Analyze individual components
     */
    async analyzeComponents(config) {
        const componentNames = [
            'orchestrator',
            'configManager',
            'memoryManager',
            'agentManager',
            'swarmCoordinator',
            'taskEngine',
            'monitor',
            'mcpServer'
        ];
        const diagnostics = await Promise.all(componentNames.map(name => this.analyzeComponent(name, config)));
        return diagnostics.filter(d => d !== null);
    }
    /**
     * Analyze individual component
     */
    async analyzeComponent(componentName, config) {
        try {
            const component = this.systemIntegration.getComponent(componentName);
            if (!component) {
                return {
                    name: componentName,
                    status: 'unhealthy',
                    uptime: 0,
                    issues: [{
                            type: 'missing_component',
                            severity: 'critical',
                            message: 'Component is not available',
                            recommendation: 'Check component initialization'
                        }]
                };
            }
            const issues = [];
            let status = 'healthy';
            // Check component health history
            const healthHistory = this.healthCheckManager.getHealthHistory(componentName);
            const recentChecks = healthHistory.slice(-10); // Last 10 checks
            const failureRate = recentChecks.filter(check => !check.healthy).length / recentChecks.length;
            if (failureRate > 0.5) {
                status = 'unhealthy';
                issues.push({
                    type: 'high_failure_rate',
                    severity: 'high',
                    message: `High failure rate: ${(failureRate * 100).toFixed(1)}%`,
                    recommendation: 'Investigate component stability'
                });
            }
            else if (failureRate > 0.2) {
                status = 'warning';
                issues.push({
                    type: 'moderate_failure_rate',
                    severity: 'medium',
                    message: `Moderate failure rate: ${(failureRate * 100).toFixed(1)}%`,
                    recommendation: 'Monitor component health'
                });
            }
            // Check for performance issues
            if (config.includePerformanceMetrics !== false) {
                const performanceIssues = this.analyzeComponentPerformance(componentName);
                issues.push(...performanceIssues);
            }
            // Check for memory leaks
            const memoryIssues = this.checkMemoryLeaks(componentName);
            issues.push(...memoryIssues);
            // Get component metrics
            let componentMetrics = {};
            if (typeof component.getMetrics === 'function') {
                componentMetrics = await component.getMetrics();
            }
            // Get last error
            const lastError = this.getLastError(componentName);
            return {
                name: componentName,
                status,
                uptime: this.getComponentUptime(componentName),
                lastError,
                metrics: componentMetrics,
                issues
            };
        }
        catch (error) {
            return {
                name: componentName,
                status: 'unhealthy',
                uptime: 0,
                lastError: (0, error_handler_js_1.getErrorMessage)(error),
                issues: [{
                        type: 'analysis_error',
                        severity: 'medium',
                        message: `Failed to analyze component: ${(0, error_handler_js_1.getErrorMessage)(error)}`,
                        recommendation: 'Check component accessibility'
                    }]
            };
        }
    }
    /**
     * Analyze system performance
     */
    async analyzePerformance(config) {
        const metrics = this.healthCheckManager.getCurrentMetrics();
        const bottlenecks = [];
        const optimization = [];
        // Calculate averages from history
        const responseTimeHistory = this.performanceHistory.get('responseTime') || [];
        const averageResponseTime = responseTimeHistory.length > 0
            ? responseTimeHistory.reduce((sum, time) => sum + time, 0) / responseTimeHistory.length
            : 0;
        // Calculate throughput
        const throughput = this.calculateThroughput();
        // Calculate error rate
        const errorRate = this.calculateErrorRate();
        // Check for memory leaks
        const memoryLeaks = this.detectMemoryLeaks();
        // Identify bottlenecks
        if (metrics) {
            if (metrics.cpu > 80) {
                bottlenecks.push('High CPU usage');
                optimization.push('Consider distributing load across more workers');
            }
            if (metrics.memory > 80) {
                bottlenecks.push('High memory usage');
                optimization.push('Implement memory optimization strategies');
            }
            if (metrics.queuedTasks > metrics.activeTasks * 2) {
                bottlenecks.push('Task queue buildup');
                optimization.push('Increase task processing capacity');
            }
            if (errorRate > 0.05) {
                bottlenecks.push('High error rate');
                optimization.push('Investigate and fix recurring errors');
            }
        }
        if (averageResponseTime > 1000) {
            bottlenecks.push('Slow response times');
            optimization.push('Optimize critical path operations');
        }
        return {
            averageResponseTime,
            throughput,
            errorRate,
            memoryLeaks,
            bottlenecks,
            optimization
        };
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(health, performance, components) {
        const recommendations = [];
        // System-level recommendations
        if (health.overall === 'unhealthy') {
            recommendations.push('System health is compromised - immediate attention required');
        }
        else if (health.overall === 'warning') {
            recommendations.push('System showing warning signs - proactive maintenance recommended');
        }
        // Performance recommendations
        if (performance.averageResponseTime > 1000) {
            recommendations.push('Response times are slow - consider performance optimization');
        }
        if (performance.errorRate > 0.05) {
            recommendations.push('Error rate is high - investigate error sources');
        }
        if (performance.memoryLeaks) {
            recommendations.push('Memory leaks detected - review memory management');
        }
        // Component-specific recommendations
        const unhealthyComponents = components.filter(c => c.status === 'unhealthy');
        if (unhealthyComponents.length > 0) {
            recommendations.push(`${unhealthyComponents.length} component(s) unhealthy - restart or investigate`);
        }
        const highFailureComponents = components.filter(c => c.issues.some(issue => issue.type === 'high_failure_rate'));
        if (highFailureComponents.length > 0) {
            recommendations.push('Some components have high failure rates - check logs and dependencies');
        }
        // Add performance optimizations
        recommendations.push(...performance.optimization);
        // General recommendations
        if (recommendations.length === 0) {
            recommendations.push('System appears healthy - continue regular monitoring');
        }
        return recommendations;
    }
    /**
     * Calculate overall severity
     */
    calculateSeverity(health, components) {
        if (health.overall === 'unhealthy') {
            return 'critical';
        }
        const criticalIssues = components.reduce((count, component) => count + component.issues.filter(issue => issue.severity === 'critical').length, 0);
        const highIssues = components.reduce((count, component) => count + component.issues.filter(issue => issue.severity === 'high').length, 0);
        if (criticalIssues > 0) {
            return 'critical';
        }
        if (highIssues > 2) {
            return 'high';
        }
        if (health.overall === 'warning' || highIssues > 0) {
            return 'medium';
        }
        return 'low';
    }
    /**
     * Export diagnostic report
     */
    async exportReport(report, config) {
        const format = config.exportFormat || 'json';
        const outputPath = config.outputPath;
        try {
            let content;
            switch (format) {
                case 'json':
                    content = JSON.stringify(report, null, 2);
                    break;
                case 'html':
                    content = this.generateHtmlReport(report);
                    break;
                case 'text':
                    content = this.generateTextReport(report);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            await fs_1.promises.writeFile(outputPath, content, 'utf8');
            this.logger.info(`Diagnostic report exported to: ${outputPath}`);
        }
        catch (error) {
            this.logger.error('Failed to export report:', (0, error_handler_js_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Generate HTML report
     */
    generateHtmlReport(report) {
        const timestamp = new Date(report.timestamp).toISOString();
        const severityColor = {
            low: '#28a745',
            medium: '#ffc107',
            high: '#fd7e14',
            critical: '#dc3545'
        }[report.severity];
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Claude Flow v2.0.0 Diagnostic Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #ccc; padding-bottom: 20px; }
        .severity { color: ${severityColor}; font-weight: bold; }
        .section { margin: 20px 0; }
        .component { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .healthy { border-left: 4px solid #28a745; }
        .warning { border-left: 4px solid #ffc107; }
        .unhealthy { border-left: 4px solid #dc3545; }
        .issue { margin: 5px 0; padding: 5px; background: #f8f9fa; }
        .critical { background: #f8d7da; }
        .high { background: #fff3cd; }
        .medium { background: #cce5ff; }
        .low { background: #d1ecf1; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Claude Flow v2.0.0 Diagnostic Report</h1>
        <p><strong>Generated:</strong> ${timestamp}</p>
        <p><strong>Severity:</strong> <span class="severity">${report.severity.toUpperCase()}</span></p>
    </div>

    <div class="section">
        <h2>System Health</h2>
        <p><strong>Overall Status:</strong> ${report.systemHealth.overall}</p>
        <p><strong>Total Components:</strong> ${report.systemHealth.metrics.totalComponents}</p>
        <p><strong>Healthy:</strong> ${report.systemHealth.metrics.healthyComponents}</p>
        <p><strong>Unhealthy:</strong> ${report.systemHealth.metrics.unhealthyComponents}</p>
        <p><strong>Uptime:</strong> ${(report.systemHealth.metrics.uptime / 1000 / 60).toFixed(1)} minutes</p>
    </div>

    <div class="section">
        <h2>Components</h2>
        ${report.components.map(component => `
            <div class="component ${component.status}">
                <h3>${component.name}</h3>
                <p><strong>Status:</strong> ${component.status}</p>
                <p><strong>Uptime:</strong> ${(component.uptime / 1000 / 60).toFixed(1)} minutes</p>
                ${component.lastError ? `<p><strong>Last Error:</strong> ${component.lastError}</p>` : ''}
                ${component.issues.length > 0 ? `
                    <h4>Issues:</h4>
                    ${component.issues.map(issue => `
                        <div class="issue ${issue.severity}">
                            <strong>${issue.type}:</strong> ${issue.message}
                            ${issue.recommendation ? `<br><em>Recommendation: ${issue.recommendation}</em>` : ''}
                        </div>
                    `).join('')}
                ` : '<p>No issues detected</p>'}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Performance</h2>
        <p><strong>Average Response Time:</strong> ${report.performance.averageResponseTime.toFixed(2)}ms</p>
        <p><strong>Throughput:</strong> ${report.performance.throughput.toFixed(2)} ops/sec</p>
        <p><strong>Error Rate:</strong> ${(report.performance.errorRate * 100).toFixed(2)}%</p>
        <p><strong>Memory Leaks:</strong> ${report.performance.memoryLeaks ? 'Detected' : 'None detected'}</p>
        
        ${report.performance.bottlenecks.length > 0 ? `
            <h3>Bottlenecks:</h3>
            <ul>${report.performance.bottlenecks.map(b => `<li>${b}</li>`).join('')}</ul>
        ` : ''}
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <ol>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ol>
    </div>
</body>
</html>`;
    }
    /**
     * Generate text report
     */
    generateTextReport(report) {
        const timestamp = new Date(report.timestamp).toISOString();
        let text = `
CLAUDE FLOW v2.0.0 DIAGNOSTIC REPORT
=====================================

Generated: ${timestamp}
Severity: ${report.severity.toUpperCase()}

SYSTEM HEALTH
-------------
Overall Status: ${report.systemHealth.overall}
Total Components: ${report.systemHealth.metrics.totalComponents}
Healthy: ${report.systemHealth.metrics.healthyComponents}
Unhealthy: ${report.systemHealth.metrics.unhealthyComponents}
Uptime: ${(report.systemHealth.metrics.uptime / 1000 / 60).toFixed(1)} minutes

COMPONENTS
----------
`;
        report.components.forEach(component => {
            text += `
${component.name}
  Status: ${component.status}
  Uptime: ${(component.uptime / 1000 / 60).toFixed(1)} minutes
`;
            if (component.lastError) {
                text += `  Last Error: ${component.lastError}\n`;
            }
            if (component.issues.length > 0) {
                text += `  Issues:\n`;
                component.issues.forEach(issue => {
                    text += `    - ${issue.type}: ${issue.message}\n`;
                    if (issue.recommendation) {
                        text += `      Recommendation: ${issue.recommendation}\n`;
                    }
                });
            }
        });
        text += `
PERFORMANCE
-----------
Average Response Time: ${report.performance.averageResponseTime.toFixed(2)}ms
Throughput: ${report.performance.throughput.toFixed(2)} ops/sec
Error Rate: ${(report.performance.errorRate * 100).toFixed(2)}%
Memory Leaks: ${report.performance.memoryLeaks ? 'Detected' : 'None detected'}
`;
        if (report.performance.bottlenecks.length > 0) {
            text += `\nBottlenecks:\n`;
            report.performance.bottlenecks.forEach(bottleneck => {
                text += `  - ${bottleneck}\n`;
            });
        }
        text += `
RECOMMENDATIONS
---------------
`;
        report.recommendations.forEach((rec, index) => {
            text += `${index + 1}. ${rec}\n`;
        });
        return text;
    }
    // Helper methods for analysis
    analyzeComponentPerformance(componentName) {
        // Placeholder implementation
        return [];
    }
    checkMemoryLeaks(componentName) {
        // Placeholder implementation
        return [];
    }
    getLastError(componentName) {
        const errors = this.errorHistory.get(componentName);
        return errors && errors.length > 0 ? errors[errors.length - 1]?.message : undefined;
    }
    getComponentUptime(componentName) {
        // Placeholder implementation
        return process.uptime() * 1000;
    }
    calculateThroughput() {
        // Placeholder implementation
        return 100; // ops/sec
    }
    calculateErrorRate() {
        // Placeholder implementation
        return 0.01; // 1%
    }
    detectMemoryLeaks() {
        // Placeholder implementation
        return false;
    }
    setupEventHandlers() {
        // Track performance metrics
        this.eventBus.on('performance:metric', (metric) => {
            if (!this.performanceHistory.has(metric.name)) {
                this.performanceHistory.set(metric.name, []);
            }
            const history = this.performanceHistory.get(metric.name);
            history.push(metric.value);
            // Keep only last 100 measurements
            if (history.length > 100) {
                history.shift();
            }
        });
        // Track errors
        this.eventBus.on('system:error', (error) => {
            const component = error.component || 'system';
            if (!this.errorHistory.has(component)) {
                this.errorHistory.set(component, []);
            }
            const history = this.errorHistory.get(component);
            history.push({
                message: error.message || error.error,
                timestamp: Date.now(),
                stack: error.stack
            });
            // Keep only last 50 errors per component
            if (history.length > 50) {
                history.shift();
            }
        });
    }
    /**
     * Run quick diagnostic check
     */
    async quickDiagnostic() {
        const health = await this.systemIntegration.getSystemHealth();
        const components = await this.analyzeComponents({ enableDetailedAnalysis: false });
        const issues = components.reduce((count, comp) => count + comp.issues.length, 0);
        const recommendations = this.generateRecommendations(health, {
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            memoryLeaks: false,
            bottlenecks: [],
            optimization: []
        }, components).slice(0, 3); // Top 3 recommendations
        return {
            status: health.overall,
            issues,
            recommendations
        };
    }
}
exports.DiagnosticManager = DiagnosticManager;
