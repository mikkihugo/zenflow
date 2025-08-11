/**
 * @file Coordination system: health-checker
 */
import { getLogger } from '../config/logging-config';
const logger = getLogger('coordination-load-balancing-routing-health-checker');
/**
 * Health Checker.
 * Comprehensive agent health monitoring and status management.
 */
import { EventEmitter } from 'node:events';
export class HealthChecker extends EventEmitter {
    healthStatuses = new Map();
    checkInterval;
    healthCheckTimer = null;
    activeAgents = [];
    constructor(checkInterval = 30000) {
        super();
        this.checkInterval = checkInterval;
    }
    async checkHealth(agent) {
        const startTime = Date.now();
        try {
            // Mock health check - in practice this would make HTTP request to agent
            const isHealthy = Math.random() > 0.1; // 90% success rate
            const responseTime = Date.now() - startTime;
            const status = this.healthStatuses.get(agent.id) || {
                healthy: true,
                lastCheck: new Date(),
                consecutiveFailures: 0,
            };
            if (isHealthy) {
                status.healthy = true;
                status.consecutiveFailures = 0;
                status.details = 'Agent responding normally';
            }
            else {
                status.healthy = false;
                status.consecutiveFailures++;
                status.details = 'Agent not responding';
                if (status.consecutiveFailures >= 3) {
                    this.emit('agent:unhealthy', agent.id);
                }
            }
            status.lastCheck = new Date();
            status.responseTime = responseTime;
            this.healthStatuses.set(agent.id, status);
            return isHealthy;
        }
        catch (error) {
            const status = this.healthStatuses.get(agent.id) || {
                healthy: false,
                lastCheck: new Date(),
                consecutiveFailures: 1,
            };
            status.healthy = false;
            status.consecutiveFailures++;
            status.details = `Health check failed: ${error}`;
            status.lastCheck = new Date();
            this.healthStatuses.set(agent.id, status);
            if (status.consecutiveFailures >= 3) {
                this.emit('agent:unhealthy', agent.id);
            }
            return false;
        }
    }
    async startHealthChecks(agents) {
        this.activeAgents = [...agents];
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        this.healthCheckTimer = setInterval(async () => {
            await this.performHealthChecks();
        }, this.checkInterval);
        // Perform initial health check
        await this.performHealthChecks();
    }
    async stopHealthChecks() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
        this.activeAgents = [];
    }
    async getHealthStatus(agentId) {
        return (this.healthStatuses.get(agentId) || {
            healthy: false,
            lastCheck: new Date(0),
            details: 'No health data available',
            consecutiveFailures: 0,
        });
    }
    async performHealthChecks() {
        const healthCheckPromises = this.activeAgents.map((agent) => this.checkHealth(agent).catch((error) => {
            logger.error(`Health check failed for agent ${agent.id}:`, error);
            return false;
        }));
        await Promise.allSettled(healthCheckPromises);
    }
}
