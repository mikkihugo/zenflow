/**
 * @fileoverview Project Mode Manager - Kanban Implementation
 *
 * Progressive architecture focusing on Kanban workflow engine:
 * - Kanban: Workflow engine with continuous enhancement capability
 * - Future: Agile and SAFe modes to be added later when packages are ready
 *
 * This implementation provides Kanban mode that can be progressively
 * enhanced with additional features and improved schema versions.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.3.0
 */
import { EventEmitter } from '@claude-zen/foundation';
/**
 * Project modes - progressive enhancement approach
 * Start with Kanban, add modes as needed
 */
export declare enum ProjectMode {
    KANBAN = "kanban",
    SAFE = "safe"
}
/**
 * Mode capability matrix - Kanban implementation
 * Supports progressive enhancement and schema evolution
 */
export interface ModeCapabilities {
    tasks: boolean;
    projects: boolean;
    portfolioManagement: boolean;
    wipLimits: boolean;
    flowMetrics: boolean;
    continuousFlow: boolean;
    visualWorkflow: boolean;
}
/**
 * Project mode configuration - Kanban implementation
 * Supports schema versioning for progressive enhancement
 */
export interface ProjectModeConfig {
    mode: ProjectMode;
    schemaVersion: string;
    capabilities: ModeCapabilities;
    settings: {
        defaultWipLimit: number;
        flowMetricsEnabled: boolean;
        boardColumns: string[];
    };
    migration: {
        upgradeableTo: ProjectMode[];
        downgradeableTo: ProjectMode[];
        migrationRequired: boolean;
    };
}
/**
 * Schema version definition for Kanban mode progressive enhancement
 * Enables iteration and improvement within the Kanban mode
 */
export interface SchemaVersion {
    version: string;
    mode: ProjectMode;
    description: string;
    changes: string[];
    migrationRequired: boolean;
    migrationScript?: string;
}
/**
 * Project Mode Manager
 *
 * Kanban mode management with progressive enhancement capability
 */
export declare class ProjectModeManager extends EventEmitter {
    private modeConfigs;
    private schemaVersions;
    private initialized;
    constructor();
    /**
     * Simple initialization - no external packages needed for now
     */
    initialize(): void;
    /**
     * Initialize mode configurations
     */
    private initializeModeConfigs;
    /**
     * Initialize schema versions for Kanban mode
     */
    private initializeSchemaVersions;
    /**
     * Get available modes for a project
     * Currently only Kanban is supported
     */
    getAvailableModes(): ProjectMode[];
    /**
     * Check if mode upgrade is possible
     * Currently no upgrades available since only Kanban exists
     */
    canUpgradeMode(): boolean;
    /**
     * Get mode capabilities
     */
    getModeCapabilities(mode: ProjectMode): ModeCapabilities | null;
    /**
     * Get mode configuration
     */
    getModeConfig(mode: ProjectMode): ProjectModeConfig | null;
    /**
     * TODO: Upgrade project mode - will be implemented when multiple modes exist
     */
    upgradeProjectMode(): {
        success: boolean;
        migrationLog: string[];
        warnings: string[];
    };
    /**
     * Get schema migration path for Kanban mode upgrades
     * Enables progressive enhancement within basic mode
     */
    getSchemaMigrationPath(fromVersion: string, toVersion: string): string[];
    /**
     * Get available schema versions for a mode
     */
    getAvailableSchemaVersions(mode: ProjectMode): SchemaVersion[];
    /**
     * Get schema version details
     */
    getSchemaVersion(version: string): SchemaVersion | null;
    /**
     * Get description of the modular architecture for a mode
     */
    getModeArchitectureDescription(mode: ProjectMode): string;
}
/**
 * Get global project mode manager instance
 */
export declare function getProjectModeManager(): ProjectModeManager;
//# sourceMappingURL=project-mode-manager.d.ts.map