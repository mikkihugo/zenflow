/**
 * Capacity Predictor.
 * ML-based capacity prediction and forecasting.
 */
/**
 * @file Coordination system:capacity-predictor
 */

interface AgentCapacityProfile {
  agentId: string;
  utilizationHistory: number[];
  performanceMetrics: unknown;
  lastUpdate: Date;
}

export class CapacityPredictor {
  private logger = {
    debug: (message: string, meta?: unknown) =>
      logger.info(`[DEBUG] ${  message}`, meta || ''),
    info: (message: string, meta?: unknown) =>
      logger.info(`[INFO] ${  message}`, meta || ''),
    warn: (message: string, meta?: unknown) =>
      logger.warn(`[WARN] ${  message}`, meta || ''),
    error: (message: string, meta?: unknown) =>
      logger.error(`[ERROR] ${  message}`, meta || ''),
  };

  public async predict(
    profile: AgentCapacityProfile,
    timeHorizon: number
  ): Promise<number> {
    // Simple linear prediction based on recent trends
    const history = profile.utilizationHistory.slice(-20);
    if (history.length < 5) {
      return (
        profile.utilizationHistory[profile.utilizationHistory.length - 1] || 5
      );
    }

    // Calculate trend
    const trend = this.calculateTrend(history);
    const currentCapacity = history[history.length - 1];

    // Project future capacity
    const timeFactorHours = timeHorizon / (1000 * 60 * 60);
    const predictedCapacity = currentCapacity + trend * timeFactorHours;

    return Math.max(1, Math.round(predictedCapacity));
  }

  public async predictDemand(
    profile: AgentCapacityProfile,
    _timeHorizon: number
  ): Promise<number> {
    // Predict future demand based on historical patterns
    const history = profile.utilizationHistory.slice(-30);
    if (history.length < 10) {
      return Math.max(
        1,
        profile.utilizationHistory[profile.utilizationHistory.length - 1] || 3
      );
    }

    const avgDemand =
      history.reduce((sum, val) => sum + val, 0) / history.length;
    const variance = this.calculateVariance(history);

    // Use variance to adjust prediction confidence and range
    const volatilityFactor = Math.sqrt(variance) / avgDemand; // Coefficient of variation
    const adjustedVariation = Math.max(0.1, Math.min(0.5, volatilityFactor)); // 10-50% based on volatility
    const demandFactor = 1 + (Math.random() - 0.5) * adjustedVariation;

    const prediction = Math.max(1, Math.round(avgDemand * demandFactor));

    // Log prediction with confidence metrics
    this.logger.debug('Capacity prediction', {
      avgDemand,
      variance,
      volatilityFactor,
      prediction,
      confidence: 1 - Math.min(volatilityFactor, 1),
    });

    return prediction;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return (
      values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
    );
  }
}
