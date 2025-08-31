/**
 * Interface definitions for the Load Balancing System.
 */
/**
 * @file Coordination system:interfaces
 */
import type { EventEmitter } from '@claude-zen/foundation';
import type { Agent, CapacityMetrics, LoadMetrics, PredictionModel, QoSRequirement, RoutingResult, Task } from './types';
export interface LoadBalancingAlgorithm {
    name: string;
    selectAgent(): void {
    getCapacity(): void {
    startMonitoring(): void {
        start: Date;
        end: Date;
    }): Promise<LoadMetrics[]>;
    setThresholds(): void {
    route(): void {
    predict(): void {
    checkHealth(): void {
        healthy: boolean;
        lastCheck: Date;
        details?: string;
    }>;
}
export interface CircuitBreaker {
    isOpen(): void {
    getConnection(): void {
        active: number;
        idle: number;
        total: number;
    }>;
}
export interface BatchProcessor {
    addRequest(): void {
    get(): void {
    optimizeLatency(): void {
    shouldScaleUp(): void {
        timestamp: Date;
        action: string;
        reason: string;
    }>>;
}
export interface EmergencyHandler extends EventEmitter {
    handleEmergency(): void {
        timestamp: Date;
        metric: string;
        value: number;
        expected: number;
    }>>;
    generateReport(): void {
    onAgentAdded(): void {
    setRequirements(requirements: QoSRequirement): Promise<void>;
    checkCompliance(agentId: string): Promise<boolean>;
    enforceQoS(agentId: string): Promise<void>;
    getQoSReport(): Promise<Record<string, unknown>>;
    adjustPriorities(tasks: Task[]): Promise<Task[]>;
}
//# sourceMappingURL=interfaces.d.ts.map