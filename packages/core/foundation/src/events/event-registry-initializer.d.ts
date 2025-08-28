/**
 * @file Event Registry Initializer - Sets up and initializes the dynamic event registry
 *
 * Initializes the event registry system with active modules and provides
 * event data for dashboard visualization components.
 */
export interface ActiveModule {
    id:string;
    name:string;
    type:'sparc' | ' brain' | ' dspy' | ' teamwork' | ' llm' | ' git' | ' system' | ' safe' | ' claude-code';
    status:'active' | ' idle' | ' error' | ' disconnected';
    lastSeen:Date;
    eventCount:number;
    events:string[];
    metadata:{
        version?:string;
        description?:string;
        uptime:number;
        memoryUsage?:number;
};
}
export interface EventFlow {
    id:string;
    eventName:string;
    source:string;
    target:string;
    timestamp:Date;
    latency:number;
    success:boolean;
}
export interface EventMetrics {
    totalEvents:number;
    eventsPerSecond:number;
    averageLatency:number;
    errorRate:number;
    activeModules:number;
    systemHealth:'healthy' | ' degraded' | ' critical';
}
export declare class EventRegistryInitializer {
    private activeModules;
    private eventFlows;
    private eventMetrics;
    private intervalId;
    private broadcastCallback;
    constructor();
    /**
     * Set broadcast callback for external systems (like WebSocket)
     */
    setBroadcastCallback(callback:(type: string, data:any) => void): void;
    /**
     * Initialize the event registry with active modules
     */
    private initializeModules;
    /**
     * Start the event registry and begin broadcasting data
     */
    start():void;
    /**
     * Stop the event registry
     */
    stop():void;
    /**
     * Get current module list
     */
    getActiveModules():ActiveModule[];
    /**
     * Get current event flows
     */
    getEventFlows():EventFlow[];
    /**
     * Get current event metrics
     */
    getEventMetrics():EventMetrics;
    /**
     * Generate new event data (simulated for demonstration)
     */
    private generateEventData;
    /**
     * Broadcast updates to external systems via callback
     */
    private broadcastUpdates;
}
export declare const eventRegistryInitializer:EventRegistryInitializer;
//# sourceMappingURL=event-registry-initializer.d.ts.map