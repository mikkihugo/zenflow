/**
 * @file Integration module exports.
 */
/**
 * Integration Module - Barrel Export.
 *
 * Central export point for multi-system integration functionality.
 */
export * from './multi-system-coordinator.ts';
export { MultiSystemCoordinator as default } from './multi-system-coordinator.ts';
export declare const IntegrationUtils: {
    /**
     * Validate system compatibility.
     *
     * @param systemA
     * @param systemB
     */
    validateCompatibility: (systemA: string, systemB: string) => boolean;
    /**
     * Get integration requirements.
     *
     * @param systems
     */
    getRequirements: (systems: string[]) => string[];
    /**
     * Check system health.
     *
     * @param system
     */
    checkSystemHealth: (system: string) => Promise<boolean>;
};
export declare class IntegrationFactory {
    private static coordinators;
    /**
     * Create or get integration coordinator.
     *
     * @param systems
     * @param instanceKey
     */
    static getCoordinator(systems: string[], instanceKey?: string): Promise<any>;
    /**
     * Clear all coordinators.
     */
    static clearCoordinators(): void;
}
//# sourceMappingURL=index.d.ts.map