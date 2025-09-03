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
export declare class CapacityPredictor {
    private logger;
    predict(profile: AgentCapacityProfile, timeHorizon: number): Promise<number>;
    predictDemand(profile: AgentCapacityProfile, timeHorizon: number): Promise<number>;
    private calculateTrend;
    private calculateVariance;
}
export {};
//# sourceMappingURL=capacity-predictor.d.ts.map