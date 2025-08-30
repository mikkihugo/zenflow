/**
 * @fileoverview System Capability Data Providers - Foundation Data Layer Only
 *
 * Provides data access functions for system capability tracking. This module
 * contains ONLY data providers - no UI, no display logic, no Express routes.
 */
/**
 * Installation suggestion for missing packages
 */
export interface InstallationSuggestion {
    package: string;
    facade: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    features: string[];
}
/**
 * Facade summary for dashboard
 */
export interface FacadeSummary {
    name: string;
    capability: string;
    healthScore: number;
    availablePackages: number;
    totalPackages: number;
    missingPackages: string[];
    registeredServices: string[];
    features: string[];
}
/**
 * System capability data structure
 */
export interface SystemCapabilityData {
    overall: string;
    systemHealthScore: number;
    timestamp: string;
    facades: FacadeSummary[];
    totalPackages: number;
    availablePackages: number;
    registeredServices: number;
    installationSuggestions: InstallationSuggestion[];
}
/**
 * Get comprehensive system capability data
 */
export declare function getSystemCapabilityData(): Promise<SystemCapabilityData>;
/**
 * Get installation suggestions for missing packages
 */
export declare function getInstallationSuggestions(): Promise<InstallationSuggestion[]>;
/**
 * Display system status in console with colors and emojis
 */
export declare function displaySystemStatus(): Promise<void>;
/**
 * Create health check data providers (data only, no Express routing)
 */
export declare function createHealthDataProviders(): {
    getStatusData: () => Promise<{
        status: string;
        healthScore: number;
        timestamp: string;
        summary: {
            facades: number;
            packages: string;
            services: number;
        };
    }>;
    getFacadesData: () => Promise<{
        facades: {
            name: string;
            capability: string;
            healthScore: number;
            packages: string;
            missingPackages: string[];
            features: string[];
        }[];
    }>;
    getSuggestionsData: () => Promise<{
        suggestions: {
            package: string;
            facade: string;
            priority: "low" | "medium" | "high";
            reason: string;
            installCommand: string;
        }[];
    }>;
    getDetailedData: () => Promise<SystemCapabilityData>;
};
/**
 * Monitor system status changes and log important events
 */
export declare function startSystemMonitoring(): void;
/**
 * Get capability score for specific areas
 */
export declare function getCapabilityScores(): Promise<Record<string, number>>;
//# sourceMappingURL=capability.provider.d.ts.map