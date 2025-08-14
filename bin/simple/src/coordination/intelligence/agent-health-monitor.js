import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('coordination-intelligence-agent-health-monitor');
export class AgentHealthMonitor {
    healthMetrics = new Map();
    healthHistory = new Map();
    healthTrends = new Map();
    activeAlerts = new Map();
    recoveryActions = new Map();
    config;
    monitoringTimer;
    alertCounter = 0;
    learningSystem;
    lastSystemHealthCheck = 0;
    constructor(config = {}, learningSystem) {
        this.config = {
            healthCheckInterval: 30000,
            historyRetention: 1000,
            alertThresholds: {
                cpu: 0.8,
                memory: 0.9,
                diskUsage: 0.85,
                networkLatency: 1000,
                taskFailureRate: 0.3,
                responseTime: 5000,
                errorRate: 0.2,
            },
            healthScoreWeights: {
                cpuUsage: 0.2,
                memoryUsage: 0.25,
                taskSuccessRate: 0.3,
                responseTime: 0.15,
                errorRate: 0.1,
                uptime: 0.0,
            },
            trendAnalysis: {
                windowSize: 50,
                minDataPoints: 10,
                significanceThreshold: 0.1,
            },
            prediction: {
                enabled: true,
                horizonMinutes: 30,
                updateInterval: 300000,
            },
            recovery: {
                enableAutoRecovery: false,
                maxRecoveryAttempts: 3,
                recoveryBackoffMs: 60000,
            },
            alerts: {
                enableAlerting: true,
                aggregationWindow: 300000,
                maxAlertsPerAgent: 10,
            },
            ...config,
        };
        this.learningSystem = learningSystem;
        logger.info('🏥 Initializing Agent Health Monitor', {
            config: this.config,
            learningIntegration: !!this.learningSystem,
            timestamp: Date.now(),
        });
        this.startHealthMonitoring();
        logger.info('✅ Agent Health Monitor initialized successfully');
    }
    updateAgentHealth(agentId, metrics) {
        logger.debug(`🔍 Updating health metrics for agent ${agentId}`, {
            metrics,
            timestamp: Date.now(),
        });
        const currentHealth = this.getOrCreateAgentHealth(agentId);
        const now = new Date();
        if (metrics.cpuUsage !== undefined)
            currentHealth.cpuUsage = metrics.cpuUsage;
        if (metrics.memoryUsage !== undefined)
            currentHealth.memoryUsage = metrics.memoryUsage;
        if (metrics.diskUsage !== undefined)
            currentHealth.diskUsage = metrics.diskUsage;
        if (metrics.networkLatency !== undefined)
            currentHealth.networkLatency = metrics.networkLatency;
        if (metrics.taskSuccessRate !== undefined)
            currentHealth.taskSuccessRate = metrics.taskSuccessRate;
        if (metrics.averageResponseTime !== undefined)
            currentHealth.averageResponseTime = metrics.averageResponseTime;
        if (metrics.errorRate !== undefined)
            currentHealth.errorRate = metrics.errorRate;
        if (metrics.uptime !== undefined)
            currentHealth.uptime = metrics.uptime;
        currentHealth.lastSeen = now;
        currentHealth.lastUpdated = now;
        currentHealth.healthScore = this.calculateHealthScore(currentHealth);
        currentHealth.status = this.determineHealthStatus(currentHealth);
        this.addHealthDataPoint(agentId, currentHealth);
        this.updateHealthTrend(agentId);
        if (this.config.alerts.enableAlerting) {
            this.checkHealthAlerts(agentId, currentHealth);
        }
        if (this.learningSystem) {
            this.integratWithLearningSystem(agentId, currentHealth);
        }
        this.healthMetrics.set(agentId, currentHealth);
        logger.debug(`✅ Health updated for agent ${agentId}`, {
            status: currentHealth.status,
            healthScore: currentHealth.healthScore,
            trend: currentHealth.trend,
        });
    }
    getAgentHealth(agentId) {
        const health = this.healthMetrics.get(agentId);
        if (!health) {
            logger.warn(`⚠️ No health data found for agent ${agentId}`);
            return null;
        }
        logger.debug(`📊 Retrieved health data for agent ${agentId}`, {
            status: health.status,
            healthScore: health.healthScore,
        });
        return { ...health };
    }
    getHealthyAgents() {
        const healthyAgents = Array.from(this.healthMetrics.entries())
            .filter(([_, health]) => health.status === 'healthy')
            .map(([agentId, _]) => agentId);
        logger.debug(`🟢 Found ${healthyAgents.length} healthy agents`);
        return healthyAgents;
    }
    getDegradedAgents() {
        const degradedAgents = Array.from(this.healthMetrics.entries())
            .filter(([_, health]) => health.status === 'degraded')
            .map(([agentId, _]) => agentId);
        logger.debug(`🟡 Found ${degradedAgents.length} degraded agents`);
        return degradedAgents;
    }
    getUnhealthyAgents() {
        const unhealthyAgents = Array.from(this.healthMetrics.entries())
            .filter(([_, health]) => health.status === 'unhealthy' || health.status === 'critical')
            .map(([agentId, _]) => agentId);
        logger.debug(`🔴 Found ${unhealthyAgents.length} unhealthy agents`);
        return unhealthyAgents;
    }
    getHealthTrend(agentId) {
        const trend = this.healthTrends.get(agentId);
        if (!trend) {
            logger.warn(`⚠️ No trend data available for agent ${agentId}`);
            return null;
        }
        logger.debug(`📈 Retrieved trend analysis for agent ${agentId}`, {
            trend: trend.trend,
            confidence: trend.confidence,
        });
        return { ...trend };
    }
    getRecoveryRecommendations(agentId) {
        const health = this.healthMetrics.get(agentId);
        if (!health) {
            logger.warn(`⚠️ No health data for recovery recommendations: agent ${agentId}`);
            return [];
        }
        const actions = this.generateRecoveryActions(agentId, health);
        this.recoveryActions.set(agentId, actions);
        logger.debug(`💡 Generated ${actions.length} recovery recommendations for agent ${agentId}`);
        return actions;
    }
    getActiveAlerts(agentId) {
        const alerts = Array.from(this.activeAlerts.values()).filter((alert) => !alert.resolved && (!agentId || alert.agentId === agentId));
        logger.debug(`🚨 Found ${alerts.length} active alerts${agentId ? ` for agent ${agentId}` : ''}`);
        return alerts;
    }
    getSystemHealthSummary() {
        const allHealth = Array.from(this.healthMetrics.values());
        const now = new Date();
        const statusCounts = {
            healthy: 0,
            degraded: 0,
            unhealthy: 0,
            critical: 0,
            unknown: 0,
        };
        for (const health of allHealth) {
            statusCounts[health.status] = (statusCounts[health.status] || 0) + 1;
        }
        const averageHealthScore = allHealth.length > 0
            ? allHealth.reduce((sum, h) => sum + h.healthScore, 0) /
                allHealth.length
            : 0;
        const systemHealthScore = this.calculateSystemHealthScore(allHealth, statusCounts);
        const activeAlerts = Array.from(this.activeAlerts.values()).filter((a) => !a.resolved);
        const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical').length;
        const performanceTrends = this.analyzeSystemPerformanceTrends();
        const topIssues = this.getTopHealthIssues();
        const summary = {
            totalAgents: allHealth.length,
            healthyAgents: statusCounts.healthy,
            degradedAgents: statusCounts.degraded,
            unhealthyAgents: statusCounts.unhealthy,
            criticalAgents: statusCounts.critical,
            unknownAgents: statusCounts.unknown,
            averageHealthScore,
            systemHealthScore,
            activeAlerts: activeAlerts.length,
            criticalAlerts,
            recentRecoveries: this.countRecentRecoveries(),
            topIssues,
            performanceTrends,
            lastUpdated: now,
        };
        logger.info('📊 Generated system health summary', {
            totalAgents: summary.totalAgents,
            systemHealthScore: summary.systemHealthScore,
            activeAlerts: summary.activeAlerts,
        });
        return summary;
    }
    resolveAlert(alertId, resolution) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) {
            logger.warn(`⚠️ Alert not found: ${alertId}`);
            return false;
        }
        alert.resolved = true;
        alert.resolvedAt = new Date();
        if (resolution) {
            alert.details.resolution = resolution;
        }
        logger.info(`✅ Alert resolved: ${alertId}`, {
            agentId: alert.agentId,
            type: alert.type,
            resolution,
        });
        return true;
    }
    async executeRecoveryAction(agentId, actionId) {
        const actions = this.recoveryActions.get(agentId);
        const action = actions?.find((a) => a.id === actionId);
        if (!action) {
            logger.warn(`⚠️ Recovery action not found: ${actionId} for agent ${agentId}`);
            return false;
        }
        logger.info(`🔧 Executing recovery action: ${action.type} for agent ${agentId}`, {
            description: action.description,
            priority: action.priority,
        });
        try {
            await this.simulateRecoveryAction(agentId, action);
            logger.info(`✅ Recovery action completed: ${actionId} for agent ${agentId}`);
            return true;
        }
        catch (error) {
            logger.error(`❌ Recovery action failed: ${actionId} for agent ${agentId}`, error);
            return false;
        }
    }
    startHealthMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }
        this.monitoringTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.healthCheckInterval);
        logger.debug('⏰ Health monitoring timer started', {
            interval: this.config.healthCheckInterval,
        });
    }
    performHealthCheck() {
        const now = Date.now();
        for (const [agentId, health] of this.healthMetrics) {
            const timeSinceLastSeen = now - health.lastSeen.getTime();
            if (timeSinceLastSeen > this.config.healthCheckInterval * 2) {
                health.status = 'unknown';
                health.healthScore = Math.max(0, health.healthScore - 0.1);
                health.lastUpdated = new Date(now);
                logger.warn(`⚠️ Agent appears stale: ${agentId}`, {
                    timeSinceLastSeen,
                    currentStatus: health.status,
                });
            }
        }
        if (now - this.lastSystemHealthCheck >
            this.config.prediction.updateInterval) {
            this.updateSystemHealthTrends();
            this.lastSystemHealthCheck = now;
        }
        logger.debug('🔍 Periodic health check completed', {
            totalAgents: this.healthMetrics.size,
            timestamp: now,
        });
    }
    getOrCreateAgentHealth(agentId) {
        let health = this.healthMetrics.get(agentId);
        if (!health) {
            const now = new Date();
            health = {
                agentId,
                status: 'unknown',
                cpuUsage: 0,
                memoryUsage: 0,
                diskUsage: 0,
                networkLatency: 0,
                taskSuccessRate: 0,
                averageResponseTime: 0,
                errorRate: 0,
                lastSeen: now,
                uptime: 0,
                healthScore: 0.5,
                trend: 'stable',
                lastUpdated: now,
            };
            this.healthMetrics.set(agentId, health);
            this.healthHistory.set(agentId, []);
            logger.debug(`🆕 Created new health record for agent ${agentId}`);
        }
        return health;
    }
    calculateHealthScore(health) {
        const weights = this.config.healthScoreWeights;
        const normalizedCpu = Math.max(0, 1 - health.cpuUsage);
        const normalizedMemory = Math.max(0, 1 - health.memoryUsage);
        const normalizedTaskSuccess = health.taskSuccessRate;
        const normalizedResponseTime = Math.max(0, 1 - health.averageResponseTime / 10000);
        const normalizedErrorRate = Math.max(0, 1 - health.errorRate);
        const normalizedUptime = Math.min(1, health.uptime / (24 * 60 * 60 * 1000));
        const score = normalizedCpu * weights.cpuUsage +
            normalizedMemory * weights.memoryUsage +
            normalizedTaskSuccess * weights.taskSuccessRate +
            normalizedResponseTime * weights.responseTime +
            normalizedErrorRate * weights.errorRate +
            normalizedUptime * weights.uptime;
        return Math.max(0, Math.min(1, score));
    }
    determineHealthStatus(health) {
        const thresholds = this.config.alertThresholds;
        if (health.cpuUsage > 0.95 ||
            health.memoryUsage > 0.98 ||
            health.errorRate > 0.5) {
            return 'critical';
        }
        if (health.healthScore < 0.3 ||
            health.cpuUsage > thresholds.cpu ||
            health.memoryUsage > thresholds.memory ||
            health.errorRate > thresholds.errorRate) {
            return 'unhealthy';
        }
        if (health.healthScore < 0.6 ||
            health.taskSuccessRate < 1 - thresholds.taskFailureRate ||
            health.averageResponseTime > thresholds.responseTime) {
            return 'degraded';
        }
        if (health.healthScore >= 0.7) {
            return 'healthy';
        }
        return 'unknown';
    }
    addHealthDataPoint(agentId, health) {
        const history = this.healthHistory.get(agentId) || [];
        const dataPoint = {
            timestamp: Date.now(),
            healthScore: health.healthScore,
            cpuUsage: health.cpuUsage,
            memoryUsage: health.memoryUsage,
            taskSuccessRate: health.taskSuccessRate,
            responseTime: health.averageResponseTime,
            errorRate: health.errorRate,
        };
        history.push(dataPoint);
        if (history.length > this.config.historyRetention) {
            history.shift();
        }
        this.healthHistory.set(agentId, history);
    }
    updateHealthTrend(agentId) {
        const history = this.healthHistory.get(agentId);
        if (!history || history.length < this.config.trendAnalysis.minDataPoints) {
            return;
        }
        const windowSize = Math.min(this.config.trendAnalysis.windowSize, history.length);
        const recentData = history.slice(-windowSize);
        const n = recentData.length;
        const sumX = recentData.reduce((sum, _, i) => sum + i, 0);
        const sumY = recentData.reduce((sum, point) => sum + point.healthScore, 0);
        const sumXY = recentData.reduce((sum, point, i) => sum + i * point.healthScore, 0);
        const sumXX = recentData.reduce((sum, _, i) => sum + i * i, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const trend = Math.abs(slope) < this.config.trendAnalysis.significanceThreshold
            ? 'stable'
            : slope > 0
                ? 'improving'
                : 'declining';
        const variance = this.calculateVariance(recentData.map((p) => p.healthScore));
        const confidence = Math.max(0.1, Math.min(1, 1 - variance));
        const prediction = this.generateHealthPrediction(agentId, recentData, slope, confidence);
        const healthTrend = {
            agentId,
            timeWindow: windowSize,
            dataPoints: recentData,
            trend,
            slope,
            confidence,
            prediction,
        };
        this.healthTrends.set(agentId, healthTrend);
        const health = this.healthMetrics.get(agentId);
        if (health) {
            health.trend = trend;
        }
    }
    generateHealthPrediction(agentId, recentData, slope, confidence) {
        const currentScore = recentData[recentData.length - 1].healthScore;
        const horizonMs = this.config.prediction.horizonMinutes * 60 * 1000;
        const projectedScore = Math.max(0, Math.min(1, currentScore + slope * this.config.trendAnalysis.windowSize));
        let predictedStatus = 'unknown';
        if (projectedScore >= 0.7)
            predictedStatus = 'healthy';
        else if (projectedScore >= 0.6)
            predictedStatus = 'degraded';
        else if (projectedScore >= 0.3)
            predictedStatus = 'unhealthy';
        else
            predictedStatus = 'critical';
        const currentHealth = this.healthMetrics.get(agentId);
        let timeToStatusChange = horizonMs;
        if (currentHealth &&
            currentHealth.status !== predictedStatus &&
            Math.abs(slope) > 0.001) {
            const scoreThresholds = {
                healthy: 0.7,
                degraded: 0.6,
                unhealthy: 0.3,
                critical: 0,
            };
            const targetScore = scoreThresholds[predictedStatus];
            const scoreDiff = Math.abs(targetScore - currentScore);
            timeToStatusChange = Math.min(horizonMs, (scoreDiff / Math.abs(slope)) * this.config.healthCheckInterval);
        }
        const factors = [];
        const lastPoint = recentData[recentData.length - 1];
        if (lastPoint.cpuUsage > this.config.alertThresholds.cpu)
            factors.push('High CPU usage');
        if (lastPoint.memoryUsage > this.config.alertThresholds.memory)
            factors.push('High memory usage');
        if (lastPoint.taskSuccessRate < 0.7)
            factors.push('Low task success rate');
        if (lastPoint.responseTime > this.config.alertThresholds.responseTime)
            factors.push('High response time');
        if (lastPoint.errorRate > this.config.alertThresholds.errorRate)
            factors.push('High error rate');
        const recommendations = this.generateRecoveryActions(agentId, currentHealth);
        return {
            predictedStatus,
            timeToStatusChange,
            confidence,
            factors,
            recommendations,
        };
    }
    checkHealthAlerts(agentId, health) {
        const thresholds = this.config.alertThresholds;
        const alerts = [];
        if (health.cpuUsage > thresholds.cpu) {
            alerts.push({
                agentId,
                severity: health.cpuUsage > 0.95 ? 'critical' : 'warning',
                type: 'high_cpu_usage',
                message: `High CPU usage: ${(health.cpuUsage * 100).toFixed(1)}%`,
                details: { cpuUsage: health.cpuUsage, threshold: thresholds.cpu },
                timestamp: new Date(),
                resolved: false,
                actions: [],
            });
        }
        if (health.memoryUsage > thresholds.memory) {
            alerts.push({
                agentId,
                severity: health.memoryUsage > 0.98 ? 'critical' : 'error',
                type: 'high_memory_usage',
                message: `High memory usage: ${(health.memoryUsage * 100).toFixed(1)}%`,
                details: {
                    memoryUsage: health.memoryUsage,
                    threshold: thresholds.memory,
                },
                timestamp: new Date(),
                resolved: false,
                actions: [],
            });
        }
        const taskFailureRate = 1 - health.taskSuccessRate;
        if (taskFailureRate > thresholds.taskFailureRate) {
            alerts.push({
                agentId,
                severity: taskFailureRate > 0.5 ? 'critical' : 'error',
                type: 'high_task_failure_rate',
                message: `High task failure rate: ${(taskFailureRate * 100).toFixed(1)}%`,
                details: { taskFailureRate, threshold: thresholds.taskFailureRate },
                timestamp: new Date(),
                resolved: false,
                actions: [],
            });
        }
        if (health.averageResponseTime > thresholds.responseTime) {
            alerts.push({
                agentId,
                severity: health.averageResponseTime > thresholds.responseTime * 2
                    ? 'error'
                    : 'warning',
                type: 'high_response_time',
                message: `High response time: ${health.averageResponseTime.toFixed(0)}ms`,
                details: {
                    responseTime: health.averageResponseTime,
                    threshold: thresholds.responseTime,
                },
                timestamp: new Date(),
                resolved: false,
                actions: [],
            });
        }
        if (health.errorRate > thresholds.errorRate) {
            alerts.push({
                agentId,
                severity: health.errorRate > 0.5 ? 'critical' : 'error',
                type: 'high_error_rate',
                message: `High error rate: ${(health.errorRate * 100).toFixed(1)}%`,
                details: {
                    errorRate: health.errorRate,
                    threshold: thresholds.errorRate,
                },
                timestamp: new Date(),
                resolved: false,
                actions: [],
            });
        }
        for (const alertData of alerts) {
            const alertId = `alert-${++this.alertCounter}-${Date.now()}`;
            const alert = { id: alertId, ...alertData };
            alert.actions = this.generateRecoveryActions(agentId, health);
            this.activeAlerts.set(alertId, alert);
            logger.warn(`🚨 Health alert created: ${alert.type} for agent ${agentId}`, {
                severity: alert.severity,
                message: alert.message,
            });
        }
    }
    generateRecoveryActions(agentId, health) {
        const actions = [];
        let actionCounter = 0;
        if (health.cpuUsage > this.config.alertThresholds.cpu) {
            actions.push({
                id: `recovery-${agentId}-cpu-${++actionCounter}`,
                type: 'optimize',
                priority: health.cpuUsage > 0.95 ? 'critical' : 'high',
                description: 'Optimize CPU-intensive operations and reduce workload',
                expectedImpact: `Reduce CPU usage by 20-40%`,
                estimatedDuration: 30000,
                confidence: 0.8,
                prerequisites: ['Agent must be responsive'],
                riskLevel: 'low',
                automation: true,
                metadata: { currentCpu: health.cpuUsage, targetCpu: 0.7 },
            });
        }
        if (health.memoryUsage > this.config.alertThresholds.memory) {
            actions.push({
                id: `recovery-${agentId}-memory-${++actionCounter}`,
                type: 'optimize',
                priority: health.memoryUsage > 0.98 ? 'critical' : 'high',
                description: 'Clear memory caches and optimize memory usage',
                expectedImpact: `Reduce memory usage by 15-30%`,
                estimatedDuration: 15000,
                confidence: 0.9,
                prerequisites: ['Memory cleanup tools available'],
                riskLevel: 'low',
                automation: true,
                metadata: { currentMemory: health.memoryUsage, targetMemory: 0.8 },
            });
        }
        if (health.taskSuccessRate < 0.7) {
            actions.push({
                id: `recovery-${agentId}-tasks-${++actionCounter}`,
                type: 'scale_down',
                priority: 'medium',
                description: 'Reduce task load and focus on easier tasks',
                expectedImpact: `Improve task success rate to 80-90%`,
                estimatedDuration: 60000,
                confidence: 0.7,
                prerequisites: ['Task queue management available'],
                riskLevel: 'medium',
                automation: false,
                metadata: {
                    currentSuccessRate: health.taskSuccessRate,
                    targetSuccessRate: 0.85,
                },
            });
        }
        if (health.averageResponseTime > this.config.alertThresholds.responseTime) {
            actions.push({
                id: `recovery-${agentId}-latency-${++actionCounter}`,
                type: 'optimize',
                priority: 'medium',
                description: 'Optimize response time through caching and async processing',
                expectedImpact: `Reduce response time by 30-50%`,
                estimatedDuration: 45000,
                confidence: 0.75,
                prerequisites: ['Performance optimization tools available'],
                riskLevel: 'low',
                automation: true,
                metadata: {
                    currentResponseTime: health.averageResponseTime,
                    targetResponseTime: 2000,
                },
            });
        }
        if (health.status === 'critical') {
            actions.push({
                id: `recovery-${agentId}-restart-${++actionCounter}`,
                type: 'restart',
                priority: 'critical',
                description: 'Restart agent to recover from critical state',
                expectedImpact: `Reset agent to healthy state`,
                estimatedDuration: 120000,
                confidence: 0.95,
                prerequisites: ['Agent restart capability available'],
                riskLevel: 'high',
                automation: false,
                metadata: { reason: 'critical_health_status' },
            });
        }
        return actions;
    }
    integratWithLearningSystem(agentId, health) {
        if (!this.learningSystem)
            return;
        const success = health.taskSuccessRate > 0.7 && health.healthScore > 0.6;
        this.learningSystem.updateAgentPerformance(agentId, success, {
            duration: health.averageResponseTime,
            quality: health.healthScore,
            resourceUsage: (health.cpuUsage + health.memoryUsage) / 2,
            taskType: 'health_monitoring',
        });
    }
    calculateSystemHealthScore(allHealth, statusCounts) {
        if (allHealth.length === 0)
            return 0;
        const totalAgents = allHealth.length;
        const healthyWeight = 1.0;
        const degradedWeight = 0.6;
        const unhealthyWeight = 0.2;
        const criticalWeight = 0.0;
        const weightedScore = (statusCounts.healthy * healthyWeight +
            statusCounts.degraded * degradedWeight +
            statusCounts.unhealthy * unhealthyWeight +
            statusCounts.critical * criticalWeight) /
            totalAgents;
        return Math.max(0, Math.min(1, weightedScore));
    }
    analyzeSystemPerformanceTrends() {
        const allTrends = Array.from(this.healthTrends.values());
        if (allTrends.length === 0) {
            return {
                cpu: 'stable',
                memory: 'stable',
                taskSuccess: 'stable',
                responseTime: 'stable',
            };
        }
        const cpuTrends = allTrends.map((t) => t.slope);
        const memoryTrends = allTrends.map((t) => t.slope);
        const taskTrends = allTrends.map((t) => t.slope);
        const responseTrends = allTrends.map((t) => t.slope);
        const getOverallTrend = (slopes) => {
            const avgSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
            return Math.abs(avgSlope) < 0.01
                ? 'stable'
                : avgSlope > 0
                    ? 'improving'
                    : 'declining';
        };
        return {
            cpu: getOverallTrend(cpuTrends),
            memory: getOverallTrend(memoryTrends),
            taskSuccess: getOverallTrend(taskTrends),
            responseTime: getOverallTrend(responseTrends),
        };
    }
    getTopHealthIssues() {
        const issueMap = new Map();
        for (const alert of this.activeAlerts.values()) {
            if (!alert.resolved) {
                const existing = issueMap.get(alert.type);
                if (existing) {
                    existing.count++;
                    if (this.getSeverityWeight(alert.severity) >
                        this.getSeverityWeight(existing.severity)) {
                        existing.severity = alert.severity;
                    }
                }
                else {
                    issueMap.set(alert.type, { count: 1, severity: alert.severity });
                }
            }
        }
        return Array.from(issueMap.entries())
            .map(([type, data]) => ({ type, ...data }))
            .sort((a, b) => {
            const severityDiff = this.getSeverityWeight(b.severity) -
                this.getSeverityWeight(a.severity);
            return severityDiff !== 0 ? severityDiff : b.count - a.count;
        })
            .slice(0, 10);
    }
    getSeverityWeight(severity) {
        const weights = { info: 1, warning: 2, error: 3, critical: 4 };
        return weights[severity] || 0;
    }
    countRecentRecoveries() {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        let count = 0;
        for (const alert of this.activeAlerts.values()) {
            if (alert.resolved &&
                alert.resolvedAt &&
                alert.resolvedAt.getTime() > oneHourAgo) {
                count++;
            }
        }
        return count;
    }
    calculateVariance(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }
    updateSystemHealthTrends() {
        for (const agentId of this.healthMetrics.keys()) {
            this.updateHealthTrend(agentId);
        }
        logger.debug('🔮 System-wide health trends updated');
    }
    async simulateRecoveryAction(agentId, action) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(action.estimatedDuration, 5000)));
        const success = Math.random() < action.confidence;
        if (!success) {
            throw new Error(`Recovery action ${action.type} failed for agent ${agentId}`);
        }
    }
    shutdown() {
        logger.info('🛑 Shutting down Agent Health Monitor');
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = undefined;
        }
        this.healthMetrics.clear();
        this.healthHistory.clear();
        this.healthTrends.clear();
        this.activeAlerts.clear();
        this.recoveryActions.clear();
        logger.info('✅ Agent Health Monitor shutdown complete');
    }
}
export const DEFAULT_HEALTH_MONITOR_CONFIG = {
    healthCheckInterval: 30000,
    historyRetention: 1000,
    alertThresholds: {
        cpu: 0.8,
        memory: 0.9,
        diskUsage: 0.85,
        networkLatency: 1000,
        taskFailureRate: 0.3,
        responseTime: 5000,
        errorRate: 0.2,
    },
    healthScoreWeights: {
        cpuUsage: 0.2,
        memoryUsage: 0.25,
        taskSuccessRate: 0.3,
        responseTime: 0.15,
        errorRate: 0.1,
        uptime: 0.0,
    },
    trendAnalysis: {
        windowSize: 50,
        minDataPoints: 10,
        significanceThreshold: 0.1,
    },
    prediction: {
        enabled: true,
        horizonMinutes: 30,
        updateInterval: 300000,
    },
    recovery: {
        enableAutoRecovery: false,
        maxRecoveryAttempts: 3,
        recoveryBackoffMs: 60000,
    },
    alerts: {
        enableAlerting: true,
        aggregationWindow: 300000,
        maxAlertsPerAgent: 10,
    },
};
export function createAgentHealthMonitor(config, learningSystem) {
    return new AgentHealthMonitor(config, learningSystem);
}
//# sourceMappingURL=agent-health-monitor.js.map