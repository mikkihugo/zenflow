/**
 * Auto-Scaling Strategy.
 * Intelligent auto-scaling based on load patterns and predictions.
 */
/**
 * @file Coordination system:auto-scaling-strategy
 */
import { EventEmitter } from '@claude-zen/foundation';
import type { AutoScaler } from '../interfaces';
import type { Agent, AutoScalingConfig, LoadMetrics } from '../types';
interface ScalingHistory {
    timestamp: Date;
    action: string;
    reason: string;
    oldCount: number;
    newCount: number;
}
export declare class AutoScalingStrategy extends EventEmitter implements AutoScaler {
    private autoScalingConfig;
    private scalingHistory;
    private lastScalingAction;
    private currentAgentCount;
    constructor(): void {};
//# sourceMappingURL=auto-scaling-strategy.d.ts.map