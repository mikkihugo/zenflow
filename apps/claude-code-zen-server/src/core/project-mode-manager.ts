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

import { EventEmitter } from 'events';

// Use simple console logging for now instead of complex logger dependencies
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[ProjectModeManager] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ProjectModeManager] ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(`[ProjectModeManager] ${msg}`, ...args)
};

/**
 * Project modes - progressive enhancement approach
 * Start with Kanban, add modes as needed
 */
export enum ProjectMode {
  KANBAN = 'kanban'         // Workflow engine with progressive enhancement
  // TODO: Add when ready
  // AGILE = 'agile',        // Kanban + Sprint planning and backlog management  
  // SAFE = 'safe',          // Kanban + Agile + Enterprise scaling (PIs, ARTs, Value Streams)
  // AGI_ENHANCED = 'agi'    // Universal AGI layer that can enhance any mode
}

// TODO: AGI enhancement configuration will be added later
// export interface AGIEnhancementConfig {
//   enabled: boolean;
//   capabilities: {
//     autonomousPlanning: boolean;
//     predictiveAnalytics: boolean;
//     collectiveIntelligence: boolean;
//     emergentOptimization: boolean;
//     adaptiveCoordination: boolean;
//   };
// }

/**
 * Mode capability matrix - Kanban implementation
 * Supports progressive enhancement and schema evolution
 */
export interface ModeCapabilities {
  // Core project management (all modes)
  tasks: boolean;
  projects: boolean;
  
  // Kanban features (progressive enhancement capable)
  kanbanBoards: boolean;
  wipLimits: boolean;
  flowMetrics: boolean;
  continuousFlow: boolean;
  visualWorkflow: boolean;
  
  // TODO: Add when Agile mode is implemented
  // sprints?: boolean;
  // epics?: boolean;
  // stories?: boolean;
  // backlog?: boolean;
  // sprintPlanning?: boolean;
  // retrospectives?: boolean;
  
  // TODO: Add when SAFe mode is implemented  
  // programIncrements?: boolean;
  // agileReleaseTrains?: boolean;
  // valueStreams?: boolean;
  // portfolioEpics?: boolean;
  
  // TODO: Add when AGI enhancements are implemented
  // autonomousPlanning?: boolean;
  // predictiveAnalytics?: boolean;
  // collectiveIntelligence?: boolean;
}

/**
 * Project mode configuration - Kanban implementation
 * Supports schema versioning for progressive enhancement
 */
export interface ProjectModeConfig {
  mode: ProjectMode;
  schemaVersion: string;
  capabilities: ModeCapabilities;
  
  // TODO: Add AGI enhancement layer when ready
  // agiEnhanced?: AGIEnhancementConfig;
  
  settings: {
    // Kanban settings (progressive enhancement ready)
    defaultWipLimit: number;
    flowMetricsEnabled: boolean;
    boardColumns: string[];
    
    // TODO: Add when Agile mode is implemented
    // sprintLength?: number;        // weeks (default 2)
    // velocityTracking?: boolean;
    // burndownCharts?: boolean;
    // backlogPrioritization?: string; // 'story_points' | 'business_value'
    
    // TODO: Add when SAFe mode is implemented
    // piLength?: number;            // weeks (default 10)
    // iterationLength?: number;     // weeks (default 2)
    // maxARTsPerValueStream?: number;
    // maxTeamsPerART?: number;
    // systemDemoFrequency?: string; // 'end_of_iteration' | 'mid_pi'
  };
  
  migration: {
    upgradeableTo: ProjectMode[];
    downgradeableTo: ProjectMode[];
    migrationRequired: boolean;
  };
}

// TODO: Add workflow definitions when custom workflows are needed
// export interface WorkflowDefinition {
//   id: string;
//   name: string;
//   states: WorkflowState[];
//   transitions: WorkflowTransition[];
// }

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
export class ProjectModeManager extends EventEmitter {
  private modeConfigs: Map<ProjectMode, ProjectModeConfig> = new Map();
  private schemaVersions: Map<string, SchemaVersion> = new Map();
  private initialized = false;
  
  constructor() {
    super();
    this.initializeModeConfigs();
    this.initializeSchemaVersions();
    logger.info('ProjectModeManager initialized with Kanban support and schema versioning');
  }
  
  /**
   * Simple initialization - no external packages needed for now
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Just mark as initialized - no external dependencies
    this.initialized = true;
    logger.info('ProjectModeManager initialized successfully (Kanban mode)');
  }
  
/**
   * Initialize mode configurations
   */
  private initializeModeConfigs(): void {
    // Kanban Mode
    this.modeConfigs.set(ProjectMode.KANBAN, {
      mode: ProjectMode.KANBAN,
      schemaVersion: '1.0.0',
      capabilities: {
        tasks: true,
        projects: true,
        kanbanBoards: true,
        wipLimits: true,
        flowMetrics: true,
        continuousFlow: true,
        visualWorkflow: true
      },
      settings: {
        defaultWipLimit: 3,
        flowMetricsEnabled: true,
        boardColumns: ['Backlog', 'In Progress', 'Review', 'Done']
      },
      migration: {
        upgradeableTo: [], // Future: add when other modes are available
        downgradeableTo: [],
        migrationRequired: false
      }
    });
  }
  
  /**
   * Initialize schema versions for Kanban mode
   */
  private initializeSchemaVersions(): void {
    // Kanban Schema v1.0.0
    this.schemaVersions.set('1.0.0', {
      version: '1.0.0',
      mode: ProjectMode.KANBAN,
      description: 'Initial Kanban implementation',
      changes: [
        'Kanban boards with configurable columns',
        'WIP limits per column',
        'Flow metrics tracking',
        'Visual workflow management'
      ],
      migrationRequired: false
    });
    
    // TODO: Future Kanban schema versions for enhanced Kanban features
    // this.schemaVersions.set('1.1.0', {
    //   version: '1.1.0',
    //   mode: ProjectMode.KANBAN,
    //   description: 'Enhanced Kanban with advanced flow metrics',
    //   changes: [
    //     'Cycle time analytics',
    //     'Cumulative flow diagrams', 
    //     'Lead time tracking',
    //     'Throughput metrics'
    //   ],
    //   migrationRequired: true,
    //   migrationScript: 'migrations/kanban-1.0.0-to-1.1.0.js'
    // });
    
    // this.schemaVersions.set('1.2.0', {
    //   version: '1.2.0', 
    //   mode: ProjectMode.KANBAN,
    //   description: 'Enhanced Kanban with workflow optimization',
    //   changes: [
    //     'Custom card types and templates',
    //     'Blocked item tracking and escalation',
    //     'Swimlanes for different work types',
    //     'Service level expectations (SLE)'
    //   ],
    //   migrationRequired: true,
    //   migrationScript: 'migrations/kanban-1.1.0-to-1.2.0.js'
    // });
    
    // this.schemaVersions.set('1.3.0', {
    //   version: '1.3.0',
    //   mode: ProjectMode.KANBAN,
    //   description: 'Advanced Kanban with team collaboration features',
    //   changes: [
    //     'Team capacity planning',
    //     'Work item dependencies',
    //     'Automated policy enforcement', 
    //     'Real-time collaboration features'
    //   ],
    //   migrationRequired: true,
    //   migrationScript: 'migrations/kanban-1.2.0-to-1.3.0.js'
    // });
  }
  
  // Schema management removed for simplicity
  
  /**
   * Get available modes for a project
   * Currently only Kanban is supported
   */
  getAvailableModes(currentMode: ProjectMode): ProjectMode[] {
    return [ProjectMode.KANBAN];
  }
  
  /**
   * Check if mode upgrade is possible
   * Currently no upgrades available since only Kanban exists
   */
  canUpgradeMode(fromMode: ProjectMode, toMode: ProjectMode): boolean {
    return false; // No other modes available yet
  }
  
  /**
   * Get mode capabilities
   */
  getModeCapabilities(mode: ProjectMode): ModeCapabilities | null {
    const config = this.modeConfigs.get(mode);
    return config?.capabilities || null;
  }
  
  /**
   * Get mode configuration
   */
  getModeConfig(mode: ProjectMode): ProjectModeConfig | null {
    return this.modeConfigs.get(mode) || null;
  }
  
  /**
   * TODO: Upgrade project mode - will be implemented when multiple modes exist
   */
  async upgradeProjectMode(
    projectId: string,
    fromMode: ProjectMode,
    toMode: ProjectMode,
    options: {
      preserveData?: boolean;
      backupBeforeMigration?: boolean;
      validateAfterMigration?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    migrationLog: string[];
    warnings: string[];
  }> {
    // Currently no upgrades available - only Kanban mode exists
    return {
      success: false,
      migrationLog: ['No upgrade paths available - only Kanban mode is currently supported'],
      warnings: ['Mode upgrades will be available when Agile and SAFe modes are implemented']
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
  getSchemaMigrationPath(fromVersion: string, toVersion: string): string[] {
    // For now, only support Kanban 1.0.0 schema
    if (fromVersion === '1.0.0' && toVersion === '1.0.0') {
      return []; // No migration needed for same version
    }
    
    // TODO: Add migration paths when Kanban schema upgrades are available
    // Example for future use:
    // if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
    //   return ['kanban-1.0.0-to-1.1.0'];
    // }
    
    return []; // No migration paths available yet
  }
  
  /**
   * Get available schema versions for a mode
   */
  getAvailableSchemaVersions(mode: ProjectMode): SchemaVersion[] {
    return Array.from(this.schemaVersions.values())
      .filter(schema => schema.mode === mode);
  }
  
  /**
   * Get schema version details
   */
  getSchemaVersion(version: string): SchemaVersion | null {
    return this.schemaVersions.get(version) || null;
  }
  
  // TODO: AGI enhancement methods - will be added when @claude-zen/intelligence is available
  // async enableAGIEnhancements(projectId: string, currentMode: ProjectMode, agiConfig: AGIEnhancementConfig) {
  //   // Will integrate with @claude-zen/intelligence package
  //   // Enable autonomous planning, predictive analytics, collective intelligence
  //   // Apply mode-specific AGI enhancements (Kanban, Agile, SAFe)
  // }
  
  // async disableAGIEnhancements(projectId: string) {
  //   // Cleanup AGI systems and revert to standard mode
  // }
  
  // private async initializeAGIEnhancements(projectId: string, mode: ProjectMode, agiConfig: AGIEnhancementConfig) {
  //   // Setup AGI coordination agents, predictive models, autonomous systems
  //   // Configure mode-specific enhancements based on current project mode
  // }
  
  /**
   * Get description of the modular architecture for a mode
   */
  getModeArchitectureDescription(mode: ProjectMode): string {
    switch (mode) {
      case ProjectMode.KANBAN:
        return 'Base workflow engine with continuous flow, WIP limits, and flow metrics. Uses @claude-zen/kanban package.';
      case ProjectMode.AGILE:
        return 'Kanban + Sprint-based development with backlog management and retrospectives. Uses @claude-zen/kanban + @claude-zen/enterprise (Agile subset).';
      case ProjectMode.SAFE:
        return 'Kanban + Agile + Scaled enterprise framework with Program Increments, ARTs, and Value Streams. Uses @claude-zen/kanban + @claude-zen/enterprise (full).';
      default:
        return 'Unknown project mode';
    }
  }
}

// Global instance
let globalModeManager: ProjectModeManager | null = null;

/**
 * Get global project mode manager instance
 */
export function getProjectModeManager(): ProjectModeManager {
  if (!globalModeManager) {
    globalModeManager = new ProjectModeManager();
  }
  return globalModeManager;
}

// Export types
export type {
  ProjectModeConfig,
  ModeCapabilities,
  SchemaVersion
  // TODO: Add when needed
  // CoreDataStructure,
  // WorkflowDefinition,
  // FieldDefinition,
  // AGIEnhancementConfig
};