/**
 * Capacity Predictor
 * ML-based capacity prediction and forecasting
 */

interface AgentCapacityProfile {
  agentId: string;
  utilizationHistory: number[];
  performanceMetrics: any;
  lastUpdate: Date;
}

export class CapacityPredictor {
  private predictionModels: Map<string, any> = new Map();

  public async predict(profile: AgentCapacityProfile, timeHorizon: number): Promise<number> {
    // Simple linear prediction based on recent trends
    const history = profile.utilizationHistory.slice(-20);
    if (history.length < 5) {
      return profile.utilizationHistory[profile.utilizationHistory.length - 1] || 5;
    }

    // Calculate trend
    const trend = this.calculateTrend(history);
    const currentCapacity = history[history.length - 1];

    // Project future capacity
    const timeFactorHours = timeHorizon / (1000 * 60 * 60);
    const predictedCapacity = currentCapacity + trend * timeFactorHours;

    return Math.max(1, Math.round(predictedCapacity));
  }

  public async predictDemand(profile: AgentCapacityProfile, timeHorizon: number): Promise<number> {
    // Predict future demand based on historical patterns
    const history = profile.utilizationHistory.slice(-30);
    if (history.length < 10) {
      return Math.max(1, profile.utilizationHistory[profile.utilizationHistory.length - 1] || 3);
    }

    const avgDemand = history.reduce((sum, val) => sum + val, 0) / history.length;
    const variance = this.calculateVariance(history);

    // Add some randomness for demand prediction
    const demandFactor = 1 + (Math.random() - 0.5) * 0.2; // ±10% variation

    return Math.max(1, Math.round(avgDemand * demandFactor));
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
    return values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  }
}
