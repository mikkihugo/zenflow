import { EventEmitter } from 'node:events';
import { logRepoConfigStatus } from './default-repo-config.ts';
import { configManager } from './manager.ts';
import { ConfigValidator } from './validator.ts';
export class ConfigHealthChecker extends EventEmitter {
    validator = new ConfigValidator();
    lastHealthReport = null;
    monitoringInterval = null;
    healthCheckFrequency = 30000;
    environment = process.env['NODE_ENV'] || 'development';
    async initialize(options = {}) {
        const { enableMonitoring = true, healthCheckFrequency = 30000 } = options;
        this.healthCheckFrequency = healthCheckFrequency;
        await this.performHealthCheck();
        configManager?.on('config:changed', () => {
            this.performHealthCheck().catch((error) => {
                this.emit('error', error);
            });
        });
        configManager?.on('config:loaded', () => {
            this.performHealthCheck().catch((error) => {
                this.emit('error', error);
            });
        });
        if (enableMonitoring) {
            this.startMonitoring();
        }
    }
    async getHealthReport(includeDetails = false) {
        const config = configManager?.getConfig();
        const healthReport = this.validator.getHealthReport(config);
        const report = {
            ...healthReport,
            timestamp: Date.now(),
            environment: this.environment,
        };
        this.lastHealthReport = report;
        if (includeDetails) {
            const validationResult = this.validator.validateEnhanced(config);
            return {
                ...report,
                validationDetails: validationResult,
            };
        }
        return report;
    }
    async validateForProduction(config) {
        const configToValidate = config || configManager?.getConfig();
        const result = this.validator.validateEnhanced(configToValidate);
        const blockers = [];
        const warnings = [];
        const recommendations = [];
        if (!result?.valid) {
            blockers.push(...result?.errors);
        }
        if (result?.securityIssues.length > 0) {
            blockers.push(...result?.securityIssues);
        }
        if (result?.portConflicts.length > 0) {
            blockers.push(...result?.portConflicts);
        }
        warnings.push(...result?.warnings);
        warnings.push(...result?.performanceWarnings);
        if (!result?.productionReady) {
            recommendations.push('Configuration is not production-ready');
        }
        if (result?.failsafeApplied.length > 0) {
            recommendations.push('Failsafe defaults were applied - review configuration');
        }
        if (this.environment === 'production') {
            if (!process.env['ANTHROPIC_API_KEY']) {
                blockers.push('ANTHROPIC_API_KEY environment variable required in production');
            }
            if (configToValidate?.core?.logger?.level === 'debug') {
                recommendations.push('Consider using "info" log level in production instead of "debug"');
            }
        }
        return {
            deploymentReady: blockers.length === 0,
            blockers,
            warnings,
            recommendations,
        };
    }
    async checkPortConflicts() {
        const config = configManager?.getConfig();
        const conflicts = [];
        const recommendations = [];
        const portMappings = [
            {
                name: 'MCP HTTP',
                port: config?.interfaces?.mcp?.http?.port,
                critical: true,
            },
            {
                name: 'Web Dashboard',
                port: config?.interfaces?.web?.port,
                critical: true,
            },
            {
                name: 'Monitoring',
                port: config?.monitoring?.dashboard?.port,
                critical: false,
            },
        ].filter((mapping) => typeof mapping.port === 'number');
        const portGroups = new Map();
        for (const mapping of portMappings) {
            if (typeof mapping.port === 'number') {
                if (!portGroups.has(mapping.port)) {
                    portGroups.set(mapping.port, []);
                }
                portGroups
                    .get(mapping.port)
                    .push({ name: mapping.name, critical: mapping.critical });
            }
        }
        for (const [port, services] of portGroups.entries()) {
            if (services.length > 1) {
                const isCritical = services.some((s) => s.critical);
                conflicts.push({
                    port,
                    services: services.map((s) => s.name),
                    severity: isCritical ? 'error' : 'warning',
                });
            }
        }
        if (conflicts.length > 0) {
            recommendations.push('Configure unique ports for each service');
            recommendations.push('Use environment variables to override default ports');
            recommendations.push('Consider using a reverse proxy for port management');
        }
        return { conflicts, recommendations };
    }
    async getHealthStatus() {
        const report = await this.getHealthReport();
        let message = '';
        switch (report.status) {
            case 'healthy':
                message = 'Configuration is healthy and production-ready';
                break;
            case 'warning':
                message = `Configuration has ${report.recommendations.length} recommendations`;
                break;
            case 'critical':
                message = 'Configuration has critical issues requiring attention';
                break;
        }
        return {
            status: report.status,
            message,
            timestamp: report.timestamp,
        };
    }
    startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.monitoringInterval = setInterval(() => {
            this.performHealthCheck().catch((error) => {
                this.emit('error', error);
            });
        }, this.healthCheckFrequency);
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    async exportHealthReport(format = 'json') {
        const report = await this.getHealthReport(true);
        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        }
        if (format === 'prometheus') {
            return this.toPrometheusFormat(report);
        }
        throw new Error(`Unsupported export format: ${format}`);
    }
    destroy() {
        this.stopMonitoring();
        this.removeAllListeners();
    }
    async performHealthCheck() {
        try {
            const currentReport = await this.getHealthReport();
            if (this.lastHealthReport) {
                if (this.lastHealthReport.status !== currentReport?.status) {
                    this.emit('health:changed', currentReport);
                    if (currentReport?.status === 'critical') {
                        this.emit('health:critical', currentReport);
                    }
                    else if (currentReport?.status === 'healthy' &&
                        this.lastHealthReport.status !== 'healthy') {
                        this.emit('health:recovered', currentReport);
                    }
                }
            }
            this.emit('health:checked', currentReport);
            this.lastHealthReport = currentReport;
            if (currentReport?.configuration) {
                try {
                    logRepoConfigStatus(currentReport.configuration);
                }
                catch (error) {
                    console.debug('Config status logging failed:', error);
                }
            }
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    toPrometheusFormat(report) {
        const lines = [];
        lines.push('# HELP claude_zen_config_health_score Configuration health score (0-100)');
        lines.push('# TYPE claude_zen_config_health_score gauge');
        lines.push(`claude_zen_config_health_score{environment="${this.environment}"} ${report.score}`);
        const statusValue = report.status === 'healthy' ? 2 : report.status === 'warning' ? 1 : 0;
        lines.push('# HELP claude_zen_config_health_status Configuration health status');
        lines.push('# TYPE claude_zen_config_health_status gauge');
        lines.push(`claude_zen_config_health_status{environment="${this.environment}",status="${report.status}"} ${statusValue}`);
        for (const [component, healthy] of Object.entries(report.details)) {
            lines.push(`# HELP claude_zen_config_${component}_health ${component} configuration health`);
            lines.push(`# TYPE claude_zen_config_${component}_health gauge`);
            lines.push(`claude_zen_config_${component}_health{environment="${this.environment}"} ${healthy ? 1 : 0}`);
        }
        lines.push('# HELP claude_zen_config_recommendations_total Number of configuration recommendations');
        lines.push('# TYPE claude_zen_config_recommendations_total gauge');
        lines.push(`claude_zen_config_recommendations_total{environment="${this.environment}"} ${report.recommendations.length}`);
        return `${lines.join('\n')}\n`;
    }
}
export const configHealthChecker = new ConfigHealthChecker();
export async function initializeConfigHealthChecker(options) {
    await configHealthChecker?.initialize(options);
}
export function createConfigHealthEndpoint() {
    return async (_req, res) => {
        try {
            const healthReport = await configHealthChecker?.getHealthReport(true);
            const statusCode = healthReport.status === 'healthy'
                ? 200
                : healthReport.status === 'warning'
                    ? 200
                    : 503;
            res.status(statusCode).json({
                success: healthReport.status !== 'critical',
                health: healthReport,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Health check failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            });
        }
    };
}
export function createDeploymentReadinessEndpoint() {
    return async (_req, res) => {
        try {
            const deploymentCheck = await configHealthChecker?.validateForProduction();
            const portCheck = await configHealthChecker?.checkPortConflicts();
            const statusCode = deploymentCheck.deploymentReady && portCheck.conflicts.length === 0
                ? 200
                : 503;
            res.status(statusCode).json({
                success: deploymentCheck.deploymentReady && portCheck.conflicts.length === 0,
                deployment: {
                    ready: deploymentCheck.deploymentReady,
                    blockers: deploymentCheck.blockers,
                    warnings: deploymentCheck.warnings,
                    recommendations: deploymentCheck.recommendations,
                },
                ports: {
                    conflicts: portCheck.conflicts,
                    recommendations: portCheck.recommendations,
                },
                timestamp: new Date().toISOString(),
                environment: process.env['NODE_ENV'] || 'development',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Deployment readiness check failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            });
        }
    };
}
//# sourceMappingURL=health-checker.js.map