export class CapacityPredictor {
    async predict(profile, timeHorizon) {
        const history = profile.utilizationHistory.slice(-20);
        if (history.length < 5) {
            return (profile.utilizationHistory[profile.utilizationHistory.length - 1] || 5);
        }
        const trend = this.calculateTrend(history);
        const currentCapacity = history[history.length - 1];
        const timeFactorHours = timeHorizon / (1000 * 60 * 60);
        const predictedCapacity = currentCapacity + trend * timeFactorHours;
        return Math.max(1, Math.round(predictedCapacity));
    }
    async predictDemand(profile, _timeHorizon) {
        const history = profile.utilizationHistory.slice(-30);
        if (history.length < 10) {
            return Math.max(1, profile.utilizationHistory[profile.utilizationHistory.length - 1] || 3);
        }
        const avgDemand = history.reduce((sum, val) => sum + val, 0) / history.length;
        const variance = this.calculateVariance(history);
        const volatilityFactor = Math.sqrt(variance) / avgDemand;
        const adjustedVariation = Math.max(0.1, Math.min(0.5, volatilityFactor));
        const demandFactor = 1 + (Math.random() - 0.5) * adjustedVariation;
        const prediction = Math.max(1, Math.round(avgDemand * demandFactor));
        this.logger.debug('Capacity prediction', {
            avgDemand,
            variance,
            volatilityFactor,
            prediction,
            confidence: 1 - Math.min(volatilityFactor, 1),
        });
        return prediction;
    }
    calculateTrend(values) {
        if (values.length < 2)
            return 0;
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return (values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length);
    }
}
//# sourceMappingURL=capacity-predictor.js.map