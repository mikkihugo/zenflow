import { CapacityPredictor } from './capacity-predictor.ts';
import { ResourceMonitor } from './resource-monitor.ts';
export class AgentCapacityManager {
    capacityProfiles = new Map();
    capacityPredictor;
    resourceMonitor;
    adjustmentHistory = [];
    config = {
        baseCapacity: 10,
        minCapacity: 1,
        maxCapacity: 100,
        adaptationRate: 0.1,
        utilizationWindow: 50,
        thresholdAdaptationRate: 0.05,
        capacityBufferRatio: 0.1,
        predictionHorizon: 300000,
        emergencyThresholds: {
            cpu: 0.95,
            memory: 0.9,
            errorRate: 0.1,
            responseTime: 10000,
        },
        autoScalingEnabled: true,
        constraintWeights: {
            cpu: 0.3,
            memory: 0.3,
            disk: 0.2,
            network: 0.2,
        },
    };
    constructor() {
        this.capacityPredictor = new CapacityPredictor();
        this.resourceMonitor = new ResourceMonitor();
    }
    async getCapacity(agentId) {
        const profile = this.getOrCreateProfile(agentId);
        await this.updateProfile(profile);
        const resourceConstraints = this.evaluateResourceConstraints(profile);
        return {
            maxConcurrentTasks: profile.currentCapacity,
            currentUtilization: this.calculateCurrentUtilization(profile),
            availableCapacity: this.calculateAvailableCapacity(profile),
            predictedCapacity: profile.predictedCapacity,
            capacityTrend: profile.capacityTrend,
            resourceConstraints,
        };
    }
    async predictCapacity(agentId, timeHorizon) {
        const profile = this.getOrCreateProfile(agentId);
        const prediction = await this.capacityPredictor.predict(profile, timeHorizon);
        return Math.max(this.config.minCapacity, Math.min(this.config.maxCapacity, prediction));
    }
    async updateCapacity(agentId, metrics) {
        const profile = this.getOrCreateProfile(agentId);
        profile.utilizationHistory.push(metrics.activeTasks);
        if (profile.utilizationHistory.length > this.config.utilizationWindow) {
            profile.utilizationHistory.shift();
        }
        this.updatePerformanceMetrics(profile, metrics);
        this.updateAdaptiveThresholds(profile, metrics);
        const newCapacity = await this.calculateOptimalCapacity(profile, metrics);
        if (Math.abs(newCapacity - profile.currentCapacity) >= 1) {
            await this.adjustCapacity(profile, newCapacity, 'performance_based');
        }
        profile.predictedCapacity = await this.capacityPredictor.predict(profile, this.config.predictionHorizon);
        profile.capacityTrend = this.calculateCapacityTrend(profile);
        profile.lastUpdate = new Date();
    }
    async isCapacityAvailable(agentId, requiredResources) {
        const profile = this.getOrCreateProfile(agentId);
        const currentMetrics = await this.resourceMonitor.getCurrentMetrics(agentId);
        if (!currentMetrics) {
            return false;
        }
        const constraints = this.evaluateResourceConstraints(profile);
        const criticalConstraints = constraints.filter((c) => c.severity === 'critical');
        if (criticalConstraints.length > 0) {
            return false;
        }
        const projectedUtilization = currentMetrics?.activeTasks + (requiredResources.tasks || 1);
        const availableCapacity = this.calculateAvailableCapacity(profile);
        return projectedUtilization <= availableCapacity;
    }
    getOrCreateProfile(agentId) {
        if (!this.capacityProfiles.has(agentId)) {
            this.capacityProfiles.set(agentId, {
                agentId,
                baseCapacity: this.config.baseCapacity,
                currentCapacity: this.config.baseCapacity,
                predictedCapacity: this.config.baseCapacity,
                utilizationHistory: [],
                performanceMetrics: {
                    throughput: 0,
                    averageResponseTime: 1000,
                    errorRate: 0,
                    successfulTasks: 0,
                    failedTasks: 0,
                    resourceEfficiency: 0.8,
                },
                resourceConstraints: [],
                adaptiveThresholds: {
                    cpuThreshold: 0.8,
                    memoryThreshold: 0.8,
                    diskThreshold: 0.8,
                    networkThreshold: 0.8,
                    responseTimeThreshold: 5000,
                    errorRateThreshold: 0.05,
                },
                lastUpdate: new Date(),
                capacityTrend: 'stable',
            });
        }
        return this.capacityProfiles.get(agentId);
    }
    async updateProfile(profile) {
        const currentMetrics = await this.resourceMonitor.getCurrentMetrics(profile.agentId);
        if (currentMetrics) {
            profile.resourceConstraints = this.evaluateResourceConstraints(profile, currentMetrics);
            this.updatePerformanceMetrics(profile, currentMetrics);
        }
    }
    async calculateOptimalCapacity(profile, metrics) {
        let optimalCapacity = profile.currentCapacity;
        const resourceScore = this.calculateResourceScore(metrics);
        const performanceScore = this.calculatePerformanceScore(profile.performanceMetrics);
        const utilizationScore = this.calculateUtilizationScore(profile);
        const demandScore = await this.calculateDemandScore(profile);
        const combinedScore = resourceScore * 0.3 +
            performanceScore * 0.3 +
            utilizationScore * 0.2 +
            demandScore * 0.2;
        if (combinedScore > 0.8) {
            optimalCapacity = Math.min(this.config.maxCapacity, profile.currentCapacity * (1 + this.config.adaptationRate));
        }
        else if (combinedScore < 0.4) {
            optimalCapacity = Math.max(this.config.minCapacity, profile.currentCapacity * (1 - this.config.adaptationRate));
        }
        optimalCapacity = this.applyConstraints(profile, optimalCapacity, metrics);
        return Math.round(optimalCapacity);
    }
    calculateResourceScore(metrics) {
        const weights = this.config.constraintWeights;
        const cpuScore = Math.max(0, 1 - metrics.cpuUsage);
        const memoryScore = Math.max(0, 1 - metrics.memoryUsage);
        const diskScore = Math.max(0, 1 - metrics.diskUsage);
        const networkScore = Math.max(0, 1 - metrics.networkUsage);
        return (cpuScore * weights.cpu +
            memoryScore * weights.memory +
            diskScore * weights.disk +
            networkScore * weights.network);
    }
    calculatePerformanceScore(performance) {
        const errorScore = Math.max(0, 1 - performance.errorRate);
        const responseTimeScore = Math.max(0, 1 - performance.averageResponseTime / 10000);
        const efficiencyScore = performance.resourceEfficiency;
        return (errorScore + responseTimeScore + efficiencyScore) / 3;
    }
    calculateUtilizationScore(profile) {
        const history = profile.utilizationHistory;
        if (history.length < 5)
            return 0.5;
        const avgUtilization = history.reduce((sum, val) => sum + val, 0) / history.length;
        const utilizationRatio = avgUtilization / profile.currentCapacity;
        if (utilizationRatio >= 0.7 && utilizationRatio <= 0.8) {
            return 1.0;
        }
        if (utilizationRatio < 0.5) {
            return 0.3;
        }
        if (utilizationRatio > 0.9) {
            return 0.2;
        }
        return 0.7;
    }
    async calculateDemandScore(profile) {
        const predictedDemand = await this.capacityPredictor.predictDemand(profile, this.config.predictionHorizon);
        const currentCapacity = profile.currentCapacity;
        const demandRatio = predictedDemand / currentCapacity;
        if (demandRatio >= 0.8 && demandRatio <= 1.2) {
            return 1.0;
        }
        if (demandRatio < 0.5) {
            return 0.4;
        }
        if (demandRatio > 1.5) {
            return 0.3;
        }
        return 0.7;
    }
    applyConstraints(profile, proposedCapacity, metrics) {
        let constrainedCapacity = proposedCapacity;
        const constraints = this.evaluateResourceConstraints(profile, metrics);
        for (const constraint of constraints) {
            if (constraint.severity === 'critical') {
                constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.5);
            }
            else if (constraint.severity === 'high') {
                constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity);
            }
        }
        if (metrics.cpuUsage > this.config.emergencyThresholds.cpu) {
            constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.8);
        }
        if (metrics.memoryUsage > this.config.emergencyThresholds.memory) {
            constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.8);
        }
        if (metrics.errorRate > this.config.emergencyThresholds.errorRate) {
            constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.7);
        }
        return Math.max(this.config.minCapacity, constrainedCapacity);
    }
    evaluateResourceConstraints(profile, metrics) {
        const constraints = [];
        if (!metrics) {
            return constraints;
        }
        const thresholds = profile.adaptiveThresholds;
        if (metrics.cpuUsage > thresholds.cpuThreshold) {
            constraints.push({
                type: 'cpu',
                threshold: thresholds.cpuThreshold,
                currentValue: metrics.cpuUsage,
                severity: this.calculateConstraintSeverity(metrics.cpuUsage, thresholds.cpuThreshold),
            });
        }
        if (metrics.memoryUsage > thresholds.memoryThreshold) {
            constraints.push({
                type: 'memory',
                threshold: thresholds.memoryThreshold,
                currentValue: metrics.memoryUsage,
                severity: this.calculateConstraintSeverity(metrics.memoryUsage, thresholds.memoryThreshold),
            });
        }
        if (metrics.diskUsage > thresholds.diskThreshold) {
            constraints.push({
                type: 'disk',
                threshold: thresholds.diskThreshold,
                currentValue: metrics.diskUsage,
                severity: this.calculateConstraintSeverity(metrics.diskUsage, thresholds.diskThreshold),
            });
        }
        if (metrics.networkUsage > thresholds.networkThreshold) {
            constraints.push({
                type: 'network',
                threshold: thresholds.networkThreshold,
                currentValue: metrics.networkUsage,
                severity: this.calculateConstraintSeverity(metrics.networkUsage, thresholds.networkThreshold),
            });
        }
        return constraints;
    }
    calculateConstraintSeverity(currentValue, threshold) {
        const violation = (currentValue - threshold) / threshold;
        if (violation > 0.3)
            return 'critical';
        if (violation > 0.2)
            return 'high';
        if (violation > 0.1)
            return 'medium';
        return 'low';
    }
    updatePerformanceMetrics(profile, metrics) {
        const perf = profile.performanceMetrics;
        const alpha = this.config.adaptationRate;
        perf.throughput =
            (1 - alpha) * perf.throughput + alpha * metrics.throughput;
        perf.averageResponseTime =
            (1 - alpha) * perf.averageResponseTime + alpha * metrics.responseTime;
        perf.errorRate = (1 - alpha) * perf.errorRate + alpha * metrics.errorRate;
        if (metrics.errorRate > 0) {
            perf.failedTasks++;
        }
        else {
            perf.successfulTasks++;
        }
        const resourceUtilization = (metrics.cpuUsage +
            metrics.memoryUsage +
            metrics.diskUsage +
            metrics.networkUsage) /
            4;
        const taskEfficiency = metrics.activeTasks / profile.currentCapacity;
        perf.resourceEfficiency = (resourceUtilization + taskEfficiency) / 2;
    }
    updateAdaptiveThresholds(profile, metrics) {
        const thresholds = profile.adaptiveThresholds;
        const rate = this.config.thresholdAdaptationRate;
        if (metrics.errorRate < 0.01 && metrics.responseTime < 2000) {
            thresholds.cpuThreshold = Math.min(0.9, thresholds.cpuThreshold + rate);
            thresholds.memoryThreshold = Math.min(0.9, thresholds.memoryThreshold + rate);
        }
        else if (metrics.errorRate > 0.05 || metrics.responseTime > 5000) {
            thresholds.cpuThreshold = Math.max(0.5, thresholds.cpuThreshold - rate);
            thresholds.memoryThreshold = Math.max(0.5, thresholds.memoryThreshold - rate);
        }
    }
    calculateCurrentUtilization(profile) {
        const history = profile.utilizationHistory;
        if (history.length === 0)
            return 0;
        const currentTasks = history[history.length - 1];
        return currentTasks / profile.currentCapacity;
    }
    calculateAvailableCapacity(profile) {
        const buffer = profile.currentCapacity * this.config.capacityBufferRatio;
        const effectiveCapacity = profile.currentCapacity - buffer;
        const currentUtilization = this.calculateCurrentUtilization(profile);
        return Math.max(0, effectiveCapacity - currentUtilization * profile.currentCapacity);
    }
    calculateCapacityTrend(profile) {
        const history = profile.utilizationHistory;
        if (history.length < 10)
            return 'stable';
        const recent = history.slice(-10);
        const older = history.slice(-20, -10);
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        const change = (recentAvg - olderAvg) / olderAvg;
        if (change > 0.1)
            return 'increasing';
        if (change < -0.1)
            return 'decreasing';
        return 'stable';
    }
    async adjustCapacity(profile, newCapacity, reason) {
        const oldCapacity = profile.currentCapacity;
        profile.currentCapacity = newCapacity;
        const adjustment = {
            agentId: profile.agentId,
            oldCapacity,
            newCapacity,
            reason,
            confidence: this.calculateAdjustmentConfidence(profile),
            timestamp: new Date(),
        };
        this.adjustmentHistory.push(adjustment);
        if (this.adjustmentHistory.length > 1000) {
            this.adjustmentHistory.shift();
        }
    }
    calculateAdjustmentConfidence(profile) {
        const historyLength = profile.utilizationHistory.length;
        const dataQuality = Math.min(1, historyLength / this.config.utilizationWindow);
        const performanceConsistency = this.calculatePerformanceConsistency(profile);
        return (dataQuality + performanceConsistency) / 2;
    }
    calculatePerformanceConsistency(profile) {
        const perf = profile.performanceMetrics;
        const totalTasks = perf.successfulTasks + perf.failedTasks;
        if (totalTasks < 10)
            return 0.5;
        const successRate = perf.successfulTasks / totalTasks;
        return successRate;
    }
}
//# sourceMappingURL=agent-capacity-manager.js.map