export const memory8GBConfig = {
    portfolioStreamMB: 128,
    programStreamMB: 32,
    swarmStreamMB: 8,
    systemReserveMB: 4096,
    cacheBufferMB: 1024,
    totalCapacityGB: 8,
};
export const memory32GBConfig = {
    portfolioStreamMB: 256,
    programStreamMB: 64,
    swarmStreamMB: 16,
    systemReserveMB: 8192,
    cacheBufferMB: 4096,
    totalCapacityGB: 32,
};
export const defaultMemoryConfig = memory8GBConfig;
export function detectAvailableMemory() {
    const os = require('os');
    const totalMemoryGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
    return totalMemoryGB;
}
export function calculateOptimalStreams(availableMemoryGB) {
    if (!availableMemoryGB) {
        availableMemoryGB = detectAvailableMemory();
    }
    let baseConfig;
    if (availableMemoryGB >= 24) {
        baseConfig = memory32GBConfig;
    }
    else if (availableMemoryGB >= 12) {
        const scaleFactor = (availableMemoryGB - 8) / (32 - 8);
        baseConfig = {
            portfolioStreamMB: Math.round(memory8GBConfig.portfolioStreamMB +
                (memory32GBConfig.portfolioStreamMB -
                    memory8GBConfig.portfolioStreamMB) *
                    scaleFactor),
            programStreamMB: Math.round(memory8GBConfig.programStreamMB +
                (memory32GBConfig.programStreamMB - memory8GBConfig.programStreamMB) *
                    scaleFactor),
            swarmStreamMB: Math.round(memory8GBConfig.swarmStreamMB +
                (memory32GBConfig.swarmStreamMB - memory8GBConfig.swarmStreamMB) *
                    scaleFactor),
            systemReserveMB: Math.round(memory8GBConfig.systemReserveMB +
                (memory32GBConfig.systemReserveMB - memory8GBConfig.systemReserveMB) *
                    scaleFactor),
            cacheBufferMB: Math.round(memory8GBConfig.cacheBufferMB +
                (memory32GBConfig.cacheBufferMB - memory8GBConfig.cacheBufferMB) *
                    scaleFactor),
            totalCapacityGB: availableMemoryGB,
        };
    }
    else {
        baseConfig = memory8GBConfig;
    }
    const availableMemoryMB = availableMemoryGB * 1024 -
        baseConfig.systemReserveMB -
        baseConfig.cacheBufferMB;
    const portfolioStreams = Math.max(1, Math.min(24, Math.floor((availableMemoryMB * 0.25) / baseConfig.portfolioStreamMB)));
    const programStreams = Math.max(2, Math.min(200, Math.floor((availableMemoryMB * 0.4) / baseConfig.programStreamMB)));
    const swarmStreams = Math.max(4, Math.min(1000, Math.floor((availableMemoryMB * 0.35) / baseConfig.swarmStreamMB)));
    return {
        portfolio: portfolioStreams,
        program: programStreams,
        swarm: swarmStreams,
        totalStreams: portfolioStreams + programStreams + swarmStreams,
        memoryPerStream: {
            portfolio: baseConfig.portfolioStreamMB,
            program: baseConfig.programStreamMB,
            swarm: baseConfig.swarmStreamMB,
        },
    };
}
export class AdaptiveMemoryOptimizer {
    config;
    activeStreams = new Map();
    performanceHistory = [];
    autoScaleEnabled = true;
    lastOptimization = 0;
    optimizationInterval = 30000;
    constructor(config) {
        if (config) {
            this.config = config;
        }
        else {
            const detectedMemoryGB = detectAvailableMemory();
            console.log(`🔍 Auto-detected ${detectedMemoryGB}GB system memory`);
            const optimalConfig = calculateOptimalStreams(detectedMemoryGB);
            if (detectedMemoryGB >= 24) {
                this.config = memory32GBConfig;
            }
            else if (detectedMemoryGB >= 12) {
                const scaleFactor = (detectedMemoryGB - 8) / (32 - 8);
                this.config = {
                    portfolioStreamMB: Math.round(memory8GBConfig.portfolioStreamMB +
                        (memory32GBConfig.portfolioStreamMB -
                            memory8GBConfig.portfolioStreamMB) *
                            scaleFactor),
                    programStreamMB: Math.round(memory8GBConfig.programStreamMB +
                        (memory32GBConfig.programStreamMB -
                            memory8GBConfig.programStreamMB) *
                            scaleFactor),
                    swarmStreamMB: Math.round(memory8GBConfig.swarmStreamMB +
                        (memory32GBConfig.swarmStreamMB - memory8GBConfig.swarmStreamMB) *
                            scaleFactor),
                    systemReserveMB: Math.round(memory8GBConfig.systemReserveMB +
                        (memory32GBConfig.systemReserveMB -
                            memory8GBConfig.systemReserveMB) *
                            scaleFactor),
                    cacheBufferMB: Math.round(memory8GBConfig.cacheBufferMB +
                        (memory32GBConfig.cacheBufferMB - memory8GBConfig.cacheBufferMB) *
                            scaleFactor),
                    totalCapacityGB: detectedMemoryGB,
                };
            }
            else {
                this.config = memory8GBConfig;
            }
            console.log(`⚡ Adaptive configuration: Portfolio=${optimalConfig.portfolio}, Program=${optimalConfig.program}, Swarm=${optimalConfig.swarm}`);
        }
    }
    canAllocateStream(type) {
        const currentStreams = this.activeStreams.get(type) || 0;
        const memoryPerStream = this.config[`${type}StreamMB`];
        const maxStreams = this.getMaxStreamsForType(type);
        return currentStreams < maxStreams;
    }
    allocateStream(type, streamId) {
        if (!this.canAllocateStream(type)) {
            return false;
        }
        const currentStreams = this.activeStreams.get(type) || 0;
        this.activeStreams.set(type, currentStreams + 1);
        return true;
    }
    deallocateStream(type, streamId) {
        const currentStreams = this.activeStreams.get(type) || 0;
        if (currentStreams > 0) {
            this.activeStreams.set(type, currentStreams - 1);
        }
    }
    getMemoryStats() {
        const portfolioActive = this.activeStreams.get('portfolio') || 0;
        const programActive = this.activeStreams.get('program') || 0;
        const swarmActive = this.activeStreams.get('swarm') || 0;
        const portfolioMax = this.getMaxStreamsForType('portfolio');
        const programMax = this.getMaxStreamsForType('program');
        const swarmMax = this.getMaxStreamsForType('swarm');
        const totalAllocated = portfolioActive * this.config.portfolioStreamMB +
            programActive * this.config.programStreamMB +
            swarmActive * this.config.swarmStreamMB;
        const totalCapacity = portfolioMax * this.config.portfolioStreamMB +
            programMax * this.config.programStreamMB +
            swarmMax * this.config.swarmStreamMB;
        return {
            allocated: {
                portfolio: portfolioActive,
                program: programActive,
                swarm: swarmActive,
            },
            available: {
                portfolio: portfolioMax - portfolioActive,
                program: programMax - programActive,
                swarm: swarmMax - swarmActive,
            },
            utilization: totalAllocated / totalCapacity,
        };
    }
    getMaxStreamsForType(type) {
        const streamConfig = calculateOptimalStreams(this.config.totalCapacityGB);
        return streamConfig[type];
    }
    recordPerformance(metrics) {
        const fullMetrics = {
            memoryUtilization: 0,
            cpuUtilization: 0,
            activeStreams: 0,
            throughput: 0,
            avgResponseTime: 0,
            errorRate: 0,
            timestamp: Date.now(),
            ...metrics,
        };
        this.performanceHistory.push(fullMetrics);
        if (this.performanceHistory.length > 100) {
            this.performanceHistory.shift();
        }
        if (this.autoScaleEnabled &&
            Date.now() - this.lastOptimization > this.optimizationInterval) {
            this.performAutoOptimization();
        }
    }
    performAutoOptimization() {
        if (this.performanceHistory.length < 15)
            return;
        const recentMetrics = this.performanceHistory.slice(-20);
        const avgMemoryUtil = recentMetrics.reduce((sum, m) => sum + m.memoryUtilization, 0) /
            recentMetrics.length;
        const avgCpuUtil = recentMetrics.reduce((sum, m) => sum + m.cpuUtilization, 0) /
            recentMetrics.length;
        const avgThroughput = recentMetrics.reduce((sum, m) => sum + m.throughput, 0) /
            recentMetrics.length;
        const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) /
            recentMetrics.length;
        const maxRecentMemory = Math.max(...recentMetrics.map((m) => m.memoryUtilization));
        const memoryVolatility = Math.max(...recentMetrics.map((m) => m.memoryUtilization)) -
            Math.min(...recentMetrics.map((m) => m.memoryUtilization));
        let adjustmentFactor = 1.0;
        let action = 'maintain';
        if (avgMemoryUtil > 0.6 || maxRecentMemory > 0.65 || avgErrorRate > 0.001) {
            adjustmentFactor = 0.6;
            action = 'emergency-scale-down';
        }
        else if (avgMemoryUtil > 0.45 ||
            memoryVolatility > 0.15 ||
            maxRecentMemory > 0.55) {
            adjustmentFactor = 0.8;
            action = 'preventive-scale-down';
        }
        else if (avgMemoryUtil < 0.25 &&
            maxRecentMemory < 0.3 &&
            avgCpuUtil < 0.35 &&
            avgErrorRate === 0 &&
            avgThroughput > 25 &&
            memoryVolatility < 0.03 &&
            this.performanceHistory.length >= 30) {
            adjustmentFactor = 1.01;
            action = 'ultra-cautious-scale-up';
        }
        if (adjustmentFactor !== 1.0) {
            console.log(`🔄 ULTRA-SAFE optimization: ${action} (factor: ${adjustmentFactor})`);
            console.log(`   Memory: ${(avgMemoryUtil * 100).toFixed(1)}% (max: ${(maxRecentMemory * 100).toFixed(1)}%), CPU: ${(avgCpuUtil * 100).toFixed(1)}%, Errors: ${(avgErrorRate * 100).toFixed(4)}%`);
            console.log(`   Memory volatility: ${(memoryVolatility * 100).toFixed(1)}% (MUST be <3% for scale-up)`);
            this.adjustCapacity(adjustmentFactor, action);
        }
        this.lastOptimization = Date.now();
    }
    adjustCapacity(factor, action) {
        const currentConfig = calculateOptimalStreams(this.config.totalCapacityGB);
        const newPortfolio = Math.max(1, Math.min(24, Math.round(currentConfig.portfolio * factor)));
        const newProgram = Math.max(2, Math.min(200, Math.round(currentConfig.program * factor)));
        const newSwarm = Math.max(4, Math.min(1000, Math.round(currentConfig.swarm * factor)));
        console.log(`📊 Capacity adjustment (${action}):`);
        console.log(`   Portfolio: ${currentConfig.portfolio} → ${newPortfolio}`);
        console.log(`   Program: ${currentConfig.program} → ${newProgram}`);
        console.log(`   Swarm: ${currentConfig.swarm} → ${newSwarm}`);
    }
    getPerformanceTrends() {
        if (this.performanceHistory.length < 6) {
            return {
                memoryTrend: 'stable',
                cpuTrend: 'stable',
                throughputTrend: 'stable',
                recommendation: 'Collecting performance data...',
            };
        }
        const recent = this.performanceHistory.slice(-3);
        const older = this.performanceHistory.slice(-6, -3);
        const avgRecentMemory = recent.reduce((sum, m) => sum + m.memoryUtilization, 0) / recent.length;
        const avgOlderMemory = older.reduce((sum, m) => sum + m.memoryUtilization, 0) / older.length;
        const avgRecentCpu = recent.reduce((sum, m) => sum + m.cpuUtilization, 0) / recent.length;
        const avgOlderCpu = older.reduce((sum, m) => sum + m.cpuUtilization, 0) / older.length;
        const avgRecentThroughput = recent.reduce((sum, m) => sum + m.throughput, 0) / recent.length;
        const avgOlderThroughput = older.reduce((sum, m) => sum + m.throughput, 0) / older.length;
        const memoryTrend = avgRecentMemory > avgOlderMemory * 1.1
            ? 'increasing'
            : avgRecentMemory < avgOlderMemory * 0.9
                ? 'decreasing'
                : 'stable';
        const cpuTrend = avgRecentCpu > avgOlderCpu * 1.1
            ? 'increasing'
            : avgRecentCpu < avgOlderCpu * 0.9
                ? 'decreasing'
                : 'stable';
        const throughputTrend = avgRecentThroughput > avgOlderThroughput * 1.1
            ? 'increasing'
            : avgRecentThroughput < avgOlderThroughput * 0.9
                ? 'decreasing'
                : 'stable';
        let recommendation = 'System performance is stable';
        if (memoryTrend === 'increasing' && cpuTrend === 'increasing') {
            recommendation = 'Consider scaling down - resource pressure detected';
        }
        else if (memoryTrend === 'decreasing' &&
            throughputTrend === 'increasing') {
            recommendation = 'System optimized well - consider scaling up capacity';
        }
        else if (throughputTrend === 'decreasing') {
            recommendation = 'Performance declining - investigate bottlenecks';
        }
        return { memoryTrend, cpuTrend, throughputTrend, recommendation };
    }
    optimizeAllocation() {
        const stats = this.getMemoryStats();
        const trends = this.getPerformanceTrends();
        const recommendations = [];
        if (trends.memoryTrend === 'increasing' && stats.utilization > 0.8) {
            recommendations.push('🚨 MEMORY PRESSURE: Scale down non-critical streams immediately');
        }
        else if (trends.memoryTrend === 'decreasing' && stats.utilization < 0.6) {
            recommendations.push('⚡ SCALE UP: Memory available for more parallel streams');
        }
        if (trends.throughputTrend === 'decreasing') {
            recommendations.push('🔍 PERFORMANCE: Investigate bottlenecks causing throughput decline');
        }
        else if (trends.throughputTrend === 'increasing') {
            recommendations.push('🚀 OPTIMIZE: Good throughput trend, consider adding more capacity');
        }
        if (stats.allocated.portfolio < stats.available.portfolio * 0.5) {
            recommendations.push('📈 PORTFOLIO: Can handle more strategic streams');
        }
        if (stats.allocated.program < stats.available.program * 0.7) {
            recommendations.push('🤝 PROGRAM: Underutilized collaborative capacity');
        }
        if (stats.allocated.swarm < stats.available.swarm * 0.8) {
            recommendations.push('🐝 SWARM: Significant autonomous processing capacity available');
        }
        const potentialGains = (1 - stats.utilization) * 100;
        return {
            recommendations,
            canOptimize: recommendations.length > 0,
            potentialGains,
            currentPerformance: trends,
        };
    }
    setAutoScale(enabled) {
        this.autoScaleEnabled = enabled;
        console.log(`🔄 Auto-scaling ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
    getPerformanceSummary() {
        if (this.performanceHistory.length === 0) {
            return '⏳ Collecting performance data...';
        }
        const latest = this.performanceHistory[this.performanceHistory.length - 1];
        const trends = this.getPerformanceTrends();
        const memStats = this.getMemoryStats();
        return `
🎯 Adaptive Performance Summary:
   Memory: ${(latest.memoryUtilization * 100).toFixed(1)}% (${trends.memoryTrend})
   CPU: ${(latest.cpuUtilization * 100).toFixed(1)}% (${trends.cpuTrend})
   Throughput: ${latest.throughput.toFixed(1)}/sec (${trends.throughputTrend})
   Active Streams: ${memStats.allocated.portfolio + memStats.allocated.program + memStats.allocated.swarm}
   Auto-scaling: ${this.autoScaleEnabled ? '✅ ENABLED' : '❌ DISABLED'}
   ${trends.recommendation}`;
    }
}
export function createAdaptiveOptimizer() {
    return new AdaptiveMemoryOptimizer();
}
export function createMemoryOptimizer(config) {
    return new AdaptiveMemoryOptimizer(config);
}
export function validateMemoryConfig(config) {
    const warnings = [];
    const portfolioMemory = config.portfolio * config.memoryPerStream.portfolio;
    const programMemory = config.program * config.memoryPerStream.program;
    const swarmMemory = config.swarm * config.memoryPerStream.swarm;
    const totalMemoryMB = portfolioMemory + programMemory + swarmMemory;
    const totalSystemMemoryMB = totalMemoryMB +
        memory32GBConfig.systemReserveMB +
        memory32GBConfig.cacheBufferMB;
    if (totalSystemMemoryMB > 32 * 1024) {
        warnings.push(`Configuration requires ${Math.round(totalSystemMemoryMB / 1024)}GB but only 32GB available`);
    }
    if (config.portfolio > 24) {
        warnings.push('Portfolio streams > 24 may cause resource contention');
    }
    if (config.program > 200) {
        warnings.push('Program streams > 200 may impact coordination efficiency');
    }
    if (config.swarm > 1000) {
        warnings.push('Swarm streams > 1000 may exceed optimal coordination limits');
    }
    return {
        valid: warnings.length === 0,
        warnings,
        totalMemoryMB,
    };
}
export default {
    memory8GBConfig,
    memory32GBConfig,
    defaultMemoryConfig,
    calculateOptimalStreams,
    detectAvailableMemory,
    AdaptiveMemoryOptimizer,
    createAdaptiveOptimizer,
    createMemoryOptimizer,
    validateMemoryConfig,
};
//# sourceMappingURL=memory-optimization.js.map