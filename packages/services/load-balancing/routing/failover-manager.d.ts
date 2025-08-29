/**
 * Failover Manager.
 * Advanced failover and recovery management system.
 */
/**
 * @file failover management system
 */
export declare class FailoverManager {
    private failoverStrategies;
    activateFailover(failedAgentId: string): Promise<void>;
    private redistributeLoad;
    private activateStandbyAgent;
    private gracefulDegradation;
}
//# sourceMappingURL=failover-manager.d.ts.map