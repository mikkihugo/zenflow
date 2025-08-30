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
export declare class AutoScalingStrategy
  extends EventEmitter
  implements AutoScaler
{
  private autoScalingConfig;
  private scalingHistory;
  private lastScalingAction;
  private currentAgentCount;
  constructor(config: AutoScalingConfig);
  shouldScaleUp(metrics: Map<string, LoadMetrics>): Promise<boolean>;
  shouldScaleDown(metrics: Map<string, LoadMetrics>): Promise<boolean>;
  scaleUp(count: number): Promise<Agent[]>;
  scaleDown(count: number): Promise<string[]>;
  getScalingHistory(): Promise<ScalingHistory[]>;
  private makeScalingDecision;
  private calculateSystemLoad;
  private calculateScalingConfidence;
  private recordScalingAction;
}
export {};
//# sourceMappingURL=auto-scaling-strategy.d.ts.map
