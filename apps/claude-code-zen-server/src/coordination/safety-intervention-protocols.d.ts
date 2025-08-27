/**
 * @file Safety Intervention Protocols
 * AI safety monitoring and intervention system
 */
export interface SafetyInterventionConfig {
    enabled: boolean;
    autoEscalationThreshold: number;
    humanTimeoutMs: number;
    defaultDecision: string;
    escalationChannels: string[];
    criticalPatterns: string[];
}
export declare class SafetyInterventionProtocols {
    private config;
    private initialized;
    constructor(config: SafetyInterventionConfig);
    initialize(): Promise<void>;
    isEnabled(): boolean;
    getCriticalPatterns(): string[];
    getEscalationThreshold(): number;
}
//# sourceMappingURL=safety-intervention-protocols.d.ts.map