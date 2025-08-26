/**
 * Memory Health Monitor - Continuous Health Monitoring
 *
 * Monitors health of memory nodes with configurable health checks,
 * automatic recovery detection, and comprehensive health reporting.
 */
import { TypedEventBase, getLogger, recordMetric, withTimeout, withRetry, } from '@claude-zen/foundation';
export class MemoryHealthMonitor extends TypedEventBase {
    logger;
    config;
    nodes = new Map();
    healthHistory = new Map();
    checkIntervals = new Map();
    stats;
    initialized = false;
    constructor(config) {
        super();
        this.config = config;
        this.logger = getLogger('MemoryHealthMonitor');
        this.stats = {
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            averageLatency: 0,
            healthyNodes: 0,
            unhealthyNodes: 0,
            recoveringNodes: 0,
        };
    }
    async initialize() {
        if (this.initialized || !this.config.enabled)
            return;
        try {
            this.initialized = true;
            this.logger.info('Memory health monitor initialized');
            recordMetric('memory_health_monitor_initialized', 1);
        }
        catch (error) {
            this.logger.error('Failed to initialize health monitor:', error);
            throw error;
        }
    }
    addNode(node) {
        if (!this.config.enabled)
            return;
        this.nodes.set(node.id, node);
        this.healthHistory.set(node.id, []);
        // Start health checking for this node
        this.startHealthChecking(node.id);
        this.logger.debug(`Added node to health monitor: ${node.id}`);
        this.updateHealthStats();
    }
    removeNode(nodeId) {
        if (!this.config.enabled)
            return;
        // Stop health checking
        this.stopHealthChecking(nodeId);
        // Remove from tracking
        this.nodes.delete(nodeId);
        this.healthHistory.delete(nodeId);
        this.logger.debug(`Removed node from health monitor: ${nodeId}`);
        this.updateHealthStats();
    }
    startHealthChecking(nodeId) {
        if (!this.config.enabled)
            return;
        // Clear any existing interval
        this.stopHealthChecking(nodeId);
        // Start periodic health checks
        const interval = setInterval(async () => {
            try {
                await this.performHealthCheck(nodeId);
            }
            catch (error) {
                this.logger.error(`Health check error for node ${nodeId}:`, error);
            }
        }, this.config.interval);
        this.checkIntervals.set(nodeId, interval);
        // Perform initial health check
        setImmediate(() => this.performHealthCheck(nodeId));
    }
    stopHealthChecking(nodeId) {
        const interval = this.checkIntervals.get(nodeId);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(nodeId);
        }
    }
    async performHealthCheck(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node)
            return;
        const startTime = Date.now();
        let result;
        try {
            // Perform health check with timeout and retries
            const healthData = await withRetry(() => withTimeout(() => this.checkNodeHealth(node), this.config.timeout), { retries: this.config.retries, factor: 1.5 });
            const latency = Date.now() - startTime;
            result = {
                nodeId,
                healthy: this.evaluateHealth(healthData),
                latency,
                timestamp: Date.now(),
                details: healthData,
            };
            this.stats.successfulChecks++;
            recordMetric('memory_health_check_success', 1, { nodeId });
        }
        catch (error) {
            const latency = Date.now() - startTime;
            result = {
                nodeId,
                healthy: false,
                latency,
                timestamp: Date.now(),
                details: {
                    connectivity: false,
                    responsiveness: false,
                    errorRate: 1.0,
                    memoryUsage: 0,
                    storageUsage: 0,
                    lastError: error.message,
                },
            };
            this.stats.failedChecks++;
            recordMetric('memory_health_check_failure', 1, {
                nodeId,
                error: error.message,
            });
        }
        this.stats.totalChecks++;
        this.stats.averageLatency =
            (this.stats.averageLatency + result.latency) / 2;
        // Store health check result
        this.storeHealthResult(result);
        // Update node status
        this.updateNodeStatus(node, result);
        // Emit events if health status changed
        this.checkHealthStatusChange(node, result);
        recordMetric('memory_health_check_latency', result.latency, { nodeId });
    }
    async checkNodeHealth(node) {
        const details = {
            connectivity: true,
            responsiveness: true,
            errorRate: node.status.errorRate,
            memoryUsage: node.metrics.memoryUsage,
            storageUsage: node.metrics.storageUsage,
        };
        try {
            // Test basic connectivity with a simple operation
            const testKey = `health_check_${Date.now()}`;
            const testValue = { timestamp: Date.now(), check: 'health' };
            // Test write
            await node.backend.store(testKey, testValue, 'health_check');
            // Test read
            const retrieved = await node.backend.retrieve(testKey, 'health_check');
            if (!retrieved) {
                details.responsiveness = false;
            }
            // Test delete (cleanup)
            await node.backend.delete(testKey, 'health_check');
            // Get backend-specific health if available
            if (typeof node.backend.healthCheck === 'function') {
                const backendHealth = await node.backend.healthCheck();
                details.connectivity = backendHealth.healthy;
                details.memoryUsage =
                    backendHealth.details?.memoryUsage || details.memoryUsage;
                details.storageUsage =
                    backendHealth.details?.storageUsage || details.storageUsage;
            }
            // Check error rate from recent operations
            const history = this.healthHistory.get(node.id) || [];
            const recentHistory = history.slice(-10); // Last 10 checks
            const recentFailures = recentHistory.filter((h) => !h.healthy).length;
            details.errorRate =
                recentHistory.length > 0 ? recentFailures / recentHistory.length : 0;
        }
        catch (error) {
            details.connectivity = false;
            details.responsiveness = false;
            details.lastError = error.message;
        }
        return details;
    }
    evaluateHealth(details) {
        // Node is healthy if all critical checks pass
        return (details.connectivity &&
            details.responsiveness &&
            details.errorRate < 0.5 && // Less than 50% error rate
            details.memoryUsage < 0.95); // Less than 95% memory usage
    }
    storeHealthResult(result) {
        const history = this.healthHistory.get(result.nodeId) || [];
        // Add new result
        history.push(result);
        // Keep only last 100 results
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        this.healthHistory.set(result.nodeId, history);
    }
    updateNodeStatus(node, result) {
        const previouslyHealthy = node.status.healthy;
        // Update node status
        node.status = {
            healthy: result.healthy,
            latency: result.latency,
            errorRate: result.details.errorRate,
            uptime: node.status.uptime,
            lastError: result.details.lastError,
            details: result.details,
        };
        node.lastHealthCheck = result.timestamp;
        // Update metrics
        node.metrics.memoryUsage = result.details.memoryUsage;
        node.metrics.storageUsage = result.details.storageUsage;
        recordMetric('memory_node_health_status', result.healthy ? 1 : 0, {
            nodeId: node.id,
        });
    }
    checkHealthStatusChange(node, result) {
        const history = this.healthHistory.get(node.id) || [];
        if (history.length < 2)
            return;
        const previous = history[history.length - 2];
        const current = result;
        // Check for transitions
        if (previous.healthy && !current.healthy) {
            // Node became unhealthy
            const consecutiveFailures = this.getConsecutiveFailures(node.id);
            if (consecutiveFailures >= this.config.unhealthyThreshold) {
                this.emit('nodeUnhealthy', node.id);
                this.logger.warn(`Node marked as unhealthy after ${consecutiveFailures} consecutive failures: ${node.id}`);
                recordMetric('memory_node_status_change', 1, {
                    nodeId: node.id,
                    status: 'unhealthy',
                    consecutiveFailures,
                });
            }
        }
        else if (!previous.healthy && current.healthy) {
            // Node became healthy
            const consecutiveSuccesses = this.getConsecutiveSuccesses(node.id);
            if (consecutiveSuccesses >= this.config.healthyThreshold) {
                this.emit('nodeRecovered', node.id);
                this.logger.info(`Node recovered after ${consecutiveSuccesses} consecutive successes: ${node.id}`);
                recordMetric('memory_node_status_change', 1, {
                    nodeId: node.id,
                    status: 'recovered',
                    consecutiveSuccesses,
                });
            }
        }
        this.updateHealthStats();
    }
    getConsecutiveFailures(nodeId) {
        const history = this.healthHistory.get(nodeId) || [];
        let count = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (!history[i].healthy) {
                count++;
            }
            else {
                break;
            }
        }
        return count;
    }
    getConsecutiveSuccesses(nodeId) {
        const history = this.healthHistory.get(nodeId) || [];
        let count = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].healthy) {
                count++;
            }
            else {
                break;
            }
        }
        return count;
    }
    updateHealthStats() {
        const nodes = Array.from(this.nodes.values())();
        this.stats.healthyNodes = nodes.filter((n) => n.status.healthy).length;
        this.stats.unhealthyNodes = nodes.filter((n) => !n.status.healthy).length;
        // Count recovering nodes (recently failed but showing improvement)
        this.stats.recoveringNodes = nodes.filter((n) => {
            if (n.status.healthy)
                return false;
            const history = this.healthHistory.get(n.id) || [];
            if (history.length < 3)
                return false;
            // Check if last few checks show improvement
            const recent = history.slice(-3);
            return (recent[2].latency < recent[1].latency &&
                recent[1].latency < recent[0].latency);
        }).length;
        recordMetric('memory_health_stats_healthy_nodes', this.stats.healthyNodes);
        recordMetric('memory_health_stats_unhealthy_nodes', this.stats.unhealthyNodes);
        recordMetric('memory_health_stats_recovering_nodes', this.stats.recoveringNodes);
    }
    // Public methods
    getNodeHealth(nodeId) {
        const node = this.nodes.get(nodeId);
        return node ? { ...node.status } : null;
    }
    getNodeHealthHistory(nodeId, limit = 10) {
        const history = this.healthHistory.get(nodeId) || [];
        return history.slice(-limit);
    }
    getOverallHealth() {
        const totalNodes = this.nodes.size;
        if (totalNodes === 0) {
            return {
                status: 'unhealthy',
                score: 0,
                summary: 'No nodes available',
                details: this.stats,
            };
        }
        const healthyRatio = this.stats.healthyNodes / totalNodes;
        let status;
        let score = Math.round(healthyRatio * 100);
        if (healthyRatio >= 0.8) {
            status = 'healthy';
        }
        else if (healthyRatio >= 0.5) {
            status = 'degraded';
        }
        else {
            status = 'unhealthy';
        }
        // Adjust score based on average latency
        if (this.stats.averageLatency > 1000) {
            score -= 20;
        }
        else if (this.stats.averageLatency > 500) {
            score -= 10;
        }
        score = Math.max(0, Math.min(100, score));
        const summary = `${this.stats.healthyNodes}/${totalNodes} nodes healthy, avg latency: ${Math.round(this.stats.averageLatency)}ms`;
        return {
            status,
            score,
            summary,
            details: { ...this.stats },
        };
    }
    getStats() {
        return { ...this.stats };
    }
    async forceHealthCheck(nodeId) {
        if (nodeId) {
            await this.performHealthCheck(nodeId);
        }
        else {
            // Check all nodes
            const promises = Array.from(this.nodes.keys()).map((id) => this.performHealthCheck(id));
            await Promise.allSettled(promises);
        }
    }
    reset() {
        this.stats = {
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            averageLatency: 0,
            healthyNodes: 0,
            unhealthyNodes: 0,
            recoveringNodes: 0,
        };
        // Clear health history
        for (const nodeId of this.nodes.keys()) {
            this.healthHistory.set(nodeId, []);
        }
        this.logger.info('Health monitor statistics reset');
    }
    async shutdown() {
        if (!this.initialized)
            return;
        try {
            // Stop all health checking intervals
            for (const nodeId of this.checkIntervals.keys()) {
                this.stopHealthChecking(nodeId);
            }
            this.initialized = false;
            this.logger.info('Memory health monitor shut down');
        }
        catch (error) {
            this.logger.error('Error during health monitor shutdown:', error);
            throw error;
        }
    }
}
