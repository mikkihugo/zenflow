/**
 * Auto-Scaling Strategy.
 * Intelligent auto-scaling based on load patterns and predictions.
 */
/**
 * @file Coordination system:auto-scaling-strategy
 */

import { EventEmitter} from '@claude-zen/foundation';

import type { AutoScaler} from '../interfaces';
import type { Agent, AutoScalingConfig, LoadMetrics} from '../types';
import { AgentStatus} from '../types';

interface ScalingDecision {
  action:'scale_up' | ' scale_down' | ' no_action';
  targetCount:number;
  confidence:number;
  reasoning:string;
  urgency:'low' | ' medium' | ' high' | ' critical';
}

interface ScalingHistory {
  timestamp:Date;
  action:string;
  reason:string;
  oldCount:number;
  newCount:number;
}

export class AutoScalingStrategy extends EventEmitter implements AutoScaler {
  private autoScalingConfig:AutoScalingConfig;
  private scalingHistory:ScalingHistory[] = [];
  private lastScalingAction:Date = new Date(0);
  private currentAgentCount:number = 0;

  constructor(config:AutoScalingConfig) {
    super();
    this.autoScalingConfig = config;
}

  public async shouldScaleUp(
    metrics:Map<string, LoadMetrics>
  ):Promise<boolean> {
    if (!this.autoScalingConfig.enabled) return false;

    const decision = await this.makeScalingDecision(metrics);
    return decision.action === 'scale_up';
}

  public async shouldScaleDown(
    metrics:Map<string, LoadMetrics>
  ):Promise<boolean> {
    if (!this.autoScalingConfig.enabled) return false;

    const decision = await this.makeScalingDecision(metrics);
    return decision.action === 'scale_down';
}

  public async scaleUp(count:number): Promise<Agent[]> {
    const newAgents:Agent[] = [];

    for (let i = 0; i < count; i++) {
      const agentId = `auto-agent-${Date.now()}-${i}`;
      newAgents.push({
        id:agentId,
        name:`Auto-scaled Agent ${agentId}`,
        capabilities:['general',    'auto-scaled'],
        status:AgentStatus.HEALTHY,
        endpoint:`http://auto-agent-${agentId}:8080`,
        lastHealthCheck:new Date(),
        metadata:{
          autoScaled:true,
          createdAt:new Date(),
},
});
}

    this.recordScalingAction(
      'scale_up',      `Added ${count} agents due to high load`,
      count
    );
    this.emit('scale:up', count);

    return newAgents;
}

  public async scaleDown(count:number): Promise<string[]> {
    // In practice, this would identify the best candidates for removal
    const agentsToRemove:string[] = [];

    for (let i = 0; i < count; i++) {
      agentsToRemove.push(`auto-agent-candidate-${i}`);
}

    this.recordScalingAction(
      'scale_down',      `Removed ${count} agents due to low load`,
      -count
    );
    this.emit('scale:down', agentsToRemove);

    return agentsToRemove;
}

  public async getScalingHistory():Promise<ScalingHistory[]> {
    return [...this.scalingHistory];
}

  private async makeScalingDecision(
    metrics:Map<string, LoadMetrics>
  ):Promise<ScalingDecision> {
    // Check cooldown period
    const timeSinceLastAction = Date.now() - this.lastScalingAction.getTime();
    if (timeSinceLastAction < this.autoScalingConfig.cooldownPeriod) {
      return {
        action: 'no_action',        targetCount:this.currentAgentCount,
        confidence:1.0,
        reasoning: 'In cooldown period',        urgency: 'low',};
}

    // Calculate current system load
    const systemLoad = this.calculateSystemLoad(metrics);
    const {avgUtilization} = systemLoad;
    const {maxUtilization} = systemLoad;
    const agentCount = metrics.size;

    // Scale up conditions
    if (
      (avgUtilization > this.autoScalingConfig.scaleUpThreshold ||
        maxUtilization > 0.95) &&
      agentCount < this.autoScalingConfig.maxAgents
    ) {
      const targetCount = Math.min(
        this.autoScalingConfig.maxAgents,
        Math.ceil(agentCount * 1.5) // Scale by 50%
      );

      return {
        action: 'scale_up',        targetCount,
        confidence:this.calculateScalingConfidence(systemLoad),
        reasoning:`High utilization: avg=${(avgUtilization * 100).toFixed(1)}%, max=${(maxUtilization * 100).toFixed(1)}%`,
        urgency:maxUtilization > 0.95 ? 'critical' : ' high',};
}

    // Scale down conditions
    if (
      avgUtilization < this.autoScalingConfig.scaleDownThreshold &&
      maxUtilization < 0.6 &&
      agentCount > this.autoScalingConfig.minAgents
    ) {
      const targetCount = Math.max(
        this.autoScalingConfig.minAgents,
        Math.floor(agentCount * 0.8) // Scale down by 20%
      );

      return {
        action: 'scale_down',        targetCount,
        confidence:this.calculateScalingConfidence(systemLoad),
        reasoning:`Low utilization: avg=${(avgUtilization * 100).toFixed(1)}%, max=${(maxUtilization * 100).toFixed(1)}%`,
        urgency: 'low',};
}

    return {
      action: 'no_action',      targetCount:agentCount,
      confidence:1.0,
      reasoning: 'System load within acceptable range',      urgency: 'low',};
}

  private calculateSystemLoad(metrics:Map<string, LoadMetrics>):{
    avgUtilization:number;
    maxUtilization:number;
    avgResponseTime:number;
    errorRate:number;
} {
    if (metrics.size === 0) {
      return {
        avgUtilization:0,
        maxUtilization:0,
        avgResponseTime:0,
        errorRate:0,
};
}

    const metricsArray = Array.from(metrics.values());

    // Calculate CPU-based utilization
    const cpuUtilizations = metricsArray.map((m) => m.cpuUsage);
    const avgUtilization =
      cpuUtilizations.reduce((sum, cpu) => sum + cpu, 0) /
      cpuUtilizations.length;
    const maxUtilization = Math.max(...cpuUtilizations);

    // Calculate average response time
    const responseTimes = metricsArray.map((m) => m.responseTime);
    const avgResponseTime =
      responseTimes?.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;

    // Calculate average error rate
    const errorRates = metricsArray.map((m) => m.errorRate);
    const errorRate =
      errorRates.reduce((sum, er) => sum + er, 0) / errorRates.length;

    return {
      avgUtilization,
      maxUtilization,
      avgResponseTime,
      errorRate,
};
}

  private calculateScalingConfidence(systemLoad:{
    avgUtilization:number;
    maxUtilization:number;
    avgResponseTime:number;
    errorRate:number;
}):number {
    // Higher confidence when metrics are more extreme
    const utilizationFactor = Math.abs(systemLoad.avgUtilization - 0.7); // Deviation from optimal 70%
    const responseTimeFactor = Math.min(1, systemLoad.avgResponseTime / 5000); // Normalize to 5s max
    const errorFactor = Math.min(1, systemLoad.errorRate * 10); // Scale error rate

    const confidence =
      (utilizationFactor + responseTimeFactor + errorFactor) / 3;
    return Math.min(1.0, Math.max(0.1, confidence));
}

  private recordScalingAction(
    action:string,
    reason:string,
    countChange:number
  ):void {
    const oldCount = this.currentAgentCount;
    this.currentAgentCount = Math.max(0, this.currentAgentCount + countChange);

    this.scalingHistory.push({
      timestamp:new Date(),
      action,
      reason,
      oldCount,
      newCount:this.currentAgentCount,
});

    // Limit history size
    if (this.scalingHistory.length > 100) {
      this.scalingHistory.shift();
}

    this.lastScalingAction = new Date();
}
}
