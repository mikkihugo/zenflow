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
import { EventEmitter, getLogger } from '@claude-zen/foundation';
const logger = getLogger('project-mode-manager');
/**
 * Project modes - progressive enhancement approach
 * Start with Kanban, add modes as needed
 */
export var ProjectMode;
(function (ProjectMode) {
    ProjectMode["KANBAN"] = "kanban";
    ProjectMode["SAFE"] = "safe";
})(ProjectMode || (ProjectMode = {}));
/**
 * Project Mode Manager
 *
 * Kanban mode management with progressive enhancement capability
 */
export class ProjectModeManager extends EventEmitter {
    modeConfigs = new Map();
    schemaVersions = new Map();
    initialized = false;
    constructor() {
        super();
        this.initializeModeConfigs();
        this.initializeSchemaVersions();
        logger.info('ProjectModeManager initialized with Kanban support and schema versioning');
    }
    /**
     * Simple initialization - no external packages needed for now
     */
    initialize() {
        if (this.initialized)
            return;
        // Just mark as initialized - no external dependencies
        this.initialized = true;
        logger.info('ProjectModeManager initialized successfully (Kanban mode)');
    }
    /**
     * Initialize mode configurations
     */
    initializeModeConfigs() {
        // Kanban Mode
        this.modeConfigs.set(ProjectMode.KANBAN, {
            mode: ProjectMode.KANBAN,
            schemaVersion: '1.0.0',
            capabilities: {
                tasks: true,
                projects: true,
                portfolioManagement: true,
                wipLimits: true,
                flowMetrics: true,
                continuousFlow: true,
                visualWorkflow: true,
            },
            settings: {
                defaultWipLimit: 3,
                flowMetricsEnabled: true,
                boardColumns: ['Backlog', 'In Progress', 'Review', 'Done'],
            },
            migration: {
                upgradeableTo: [], // Future: add when other modes are available
                downgradeableTo: [],
                migrationRequired: false,
            },
        });
    }
    /**
     * Initialize schema versions for Kanban mode
     */
    initializeSchemaVersions() {
        // Kanban Schema v1.0.0
        this.schemaVersions.set('1.0.0', {
            version: '1.0.0',
            mode: ProjectMode.KANBAN,
            description: 'Initial Kanban implementation',
            changes: [
                'Kanban boards with configurable columns',
                'WIP limits per column',
                'Flow metrics tracking',
                'Visual workflow management',
            ],
            migrationRequired: false,
        });
        // TODO: Future Kanban schema versions for enhanced Kanban features
        // this.schemaVersions.set(
        //   '1.1.0',
        //   {
        //     version: '1.1.0',
        //     mode: ProjectMode.KANBAN,
        //     description: 'Enhanced Kanban with advanced flow metrics',
        //     changes: [
        //       'Cycle time analytics',
        //       'Cumulative flow diagrams',
        //       'Lead time tracking',
        //       'Throughput metrics'
        //     ],
        //     migrationRequired: true,
        //     migrationScript: 'migrations/safe-1.0.0-to-1.1.0.js'
        //   }
        // );
        // this.schemaVersions.set(
        //   '1.2.0',
        //   {
        //     version: '1.2.0',
        //     mode: ProjectMode.KANBAN,
        //     description: 'Enhanced Kanban with workflow optimization',
        //     changes: [
        //       'Custom card types and templates',
        //       'Blocked item tracking and escalation',
        //       'Swimlanes for different work types',
        //       'Service level expectations (SLE)'
        //     ],
        //     migrationRequired: true,
        //     migrationScript: 'migrations/safe-1.1.0-to-1.2.0.js'
        //   }
        // );
        // this.schemaVersions.set(
        //   '1.3.0',
        //   {
        //     version: '1.3.0',
        //     mode: ProjectMode.KANBAN,
        //     description: 'Advanced Kanban with team collaboration features',
        //     changes: [
        //       'Team capacity planning',
        //       'Work item dependencies',
        //       'Automated policy enforcement',
        //       'Real-time collaboration features'
        //     ],
        //     migrationRequired: true,
        //     migrationScript: 'migrations/safe-1.2.0-to-1.3.0.js'
        //   }
        // );
    }
    // Schema management removed for simplicity
    /**
     * Get available modes for a project
     * Currently only Kanban is supported
     */
    getAvailableModes( /* currentMode: ProjectMode */) {
        return [ProjectMode.KANBAN];
    }
    /**
     * Check if mode upgrade is possible
     * Currently no upgrades available since only Kanban exists
     */
    canUpgradeMode( /* fromMode: ProjectMode, toMode: ProjectMode */) {
        return false; // No other modes available yet
    }
    /**
     * Get mode capabilities
     */
    getModeCapabilities(mode) {
        const config = this.modeConfigs.get(mode);
        return config?.capabilities || null;
    }
    /**
     * Get mode configuration
     */
    getModeConfig(mode) {
        return this.modeConfigs.get(mode) || null;
    }
    /**
     * TODO: Upgrade project mode - will be implemented when multiple modes exist
     */
    upgradeProjectMode() {
        // Currently no upgrades available - only Kanban mode exists
        return {
            success: false,
            migrationLog: [
                'No upgrade paths available - only Kanban mode is currently supported',
            ],
            warnings: [
                'Mode upgrades will be available when Agile and SAFe modes are implemented',
            ],
        };
    }
    // TODO: Initialize Agile mode when @claude-zen/enterprise is available
    // private async initializeAgileMode(projectId: string): Promise<void> {
    //   // Will integrate with @claude-zen/enterprise (Agile subset)
    //   // Initialize sprints, epics, stories, backlog management
    //   // Enable Kanban-Agile integration
    // }
    // TODO: Initialize SAFe mode when @claude-zen/enterprise is available
    // private async initializeSAFeMode(projectId: string): Promise<void> {
    //   // Will integrate with @claude-zen/enterprise (full)
    //   // Initialize Program Increments, ARTs, Value Streams
    //   // Enable enterprise architecture features
    // }
    /**
     * Get schema migration path for Kanban mode upgrades
     * Enables progressive enhancement within basic mode
     */
    getSchemaMigrationPath(fromVersion, toVersion) {
        // For now, only support Kanban 1.0.0 schema
        if (fromVersion === '1.0.0' && toVersion === '1.0.0') {
            return []; // No migration needed for same version
        }
        // TODO: Add migration paths when Kanban schema upgrades are available
        // Example for future use:
        // if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
        //   return ['safe-1.0.0-to-1.1.0'];
        // }
        return []; // No migration paths available yet
    }
    /**
     * Get available schema versions for a mode
     */
    getAvailableSchemaVersions(mode) {
        return Array.from(this.schemaVersions.values()).filter((schema) => schema.mode === mode);
    }
    /**
     * Get schema version details
     */
    getSchemaVersion(version) {
        return this.schemaVersions.get(version) || null;
    }
    // TODO: AGI enhancement methods - will be added when @claude-zen/intelligence is available
    // async enableAGIEnhancements(
    //   projectId: string,
    //   currentMode: ProjectMode,
    //   agiConfig: AGIEnhancementConfig
    // ) {
    //   // Will integrate with @claude-zen/intelligence package
    //   // Enable autonomous planning, predictive analytics, collective intelligence
    //   // Apply mode-specific AGI enhancements (Kanban, Agile, SAFe)
    // }
    // async disableAGIEnhancements(projectId: string) {
    //   // Cleanup AGI systems and revert to standard mode
    // }
    // private async initializeAGIEnhancements(
    //   projectId: string,
    //   mode: ProjectMode,
    //   agiConfig: AGIEnhancementConfig
    // ) {
    //   // Setup AGI coordination agents, predictive models, autonomous systems
    //   // Configure mode-specific enhancements based on current project mode
    // }
    /**
     * Get description of the modular architecture for a mode
     */
    getModeArchitectureDescription(mode) {
        switch (mode) {
            case ProjectMode.KANBAN:
                return 'Kanban workflow management with continuous flow, WIP limits, and flow metrics.';
            case ProjectMode.SAFE:
                return 'Enterprise SAFe Lean Portfolio Management with strategic coordination, neural intelligence, and comprehensive SAFe database services.';
            default:
                return 'Unknown project mode';
        }
    }
}
// Global instance
let globalModeManager = null;
/**
 * Get global project mode manager instance
 */
export function getProjectModeManager() {
    if (!globalModeManager) {
        globalModeManager = new ProjectModeManager();
    }
    return globalModeManager;
}
// Export types (interfaces already exported above)
// export type {
//   ProjectModeConfig,
//   ModeCapabilities,
//   SchemaVersion,
//   // TODO: Add when needed
//   // CoreDataStructure,
//   // WorkflowDefinition,
//   // FieldDefinition,
//   // AGIEnhancementConfig
// };
