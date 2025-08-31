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
    predict(): void {};
//# sourceMappingURL=capacity-predictor.d.ts.map