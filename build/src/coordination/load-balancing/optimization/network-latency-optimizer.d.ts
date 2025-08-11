/**
 * Network Latency Optimizer.
 * Advanced network path optimization and latency reduction.
 */
/**
 * @file Coordination system: network-latency-optimizer
 */
import type { NetworkOptimizer } from '../interfaces.ts';
export declare class NetworkLatencyOptimizer implements NetworkOptimizer {
    private bandwidthMeasurements;
    private connectionLatencies;
    optimizeLatency(source: string, destinations: string[]): Promise<Map<string, number>>;
    selectOptimalPath(source: string, destination: string): Promise<string[]>;
    monitorBandwidth(): Promise<Map<string, number>>;
    adjustQoS(_requirements: QoSRequirement): Promise<void>;
    private calculatePathLatency;
    private getHopLatency;
}
//# sourceMappingURL=network-latency-optimizer.d.ts.map