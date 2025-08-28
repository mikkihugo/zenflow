/**
 * @fileoverview AI Safety Implementation - 100% Event-Driven
 *
 * Foundation-powered AI safety system with event-based brain coordination
 * Uses foundation imports internally but coordinates via events only
 */
import { TypedEventBase } from '@claude-zen/foundation';
type SafetyStatus = 'safe' | ' monitoring' | ' warning' | ' alert' | ' intervention' | ' emergency';
export declare class EventDrivenAISafety extends TypedEventBase {
    private logger;
    private serviceContainer;
    private config;
    private initialized;
    private monitoring;
    private monitoringInterval;
    private totalAnalyses;
    private deceptionCount;
    private interventionCount;
    private alertCount;
    private activeAlerts;
    private agentRiskLevels;
    constructor();
    private setupBrainEventHandlers;
    private initializeInternal;
    private startMonitoringInternal;
    private stopMonitoringInternal;
    private analyzeResponseInternal;
    private checkAgentSafetyInternal;
    private getSafetyMetricsInternal;
    private emergencyShutdownInternal;
    private detectDeceptionInternal;
    private analyzeBehaviorInternal;
    private calculateRiskLevel;
    private generateRecommendation;
    private calculateAverageRiskLevel;
    private determineSystemStatus;
    private performSafetyCheckCycle;
    private emitSafetyAlert;
    private emitSystemIntervention;
    private mapRiskToSeverity;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    isMonitoring(): boolean;
    getActiveAlertCount(): number;
    getSystemStatus(): SafetyStatus;
}
export declare function createEventDrivenAISafety(): EventDrivenAISafety;
export default EventDrivenAISafety;
//# sourceMappingURL=ai-safety-event-driven.d.ts.map