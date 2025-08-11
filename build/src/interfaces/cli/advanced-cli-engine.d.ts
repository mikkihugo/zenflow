/**
 * @file Advanced CLI Engine - Revolutionary Command-Line Interface.
 *
 * Implements the most advanced AI project management and coordination platform CLI.
 * Features intelligent project scaffolding, real-time swarm monitoring, automated.
 * optimization, and seamless development workflow integration.
 */
import { EventEmitter } from 'node:events';
import type { AdvancedCLISystem, CommandCategory, ControlResult, DevPipeline, MonitoringDashboard, PipelineResult, ProjectConfig, ProjectCreationResult, SwarmCommand } from './types/advanced-cli-types.ts';
/**
 * Advanced CLI System Implementation.
 *
 * Revolutionary developer experience with AI-powered project management,
 * real-time swarm coordination, and intelligent development workflows.
 *
 * @example
 */
export declare class AdvancedCLIEngine extends EventEmitter implements AdvancedCLISystem {
    private readonly projectScaffolder;
    private readonly swarmController;
    private readonly workflowOrchestrator;
    private readonly commandRegistry;
    constructor();
    /**
     * Initialize the advanced command system with intelligent categorization.
     */
    private initializeCommandSystem;
    /**
     * Create intelligent project with AI-powered scaffolding.
     *
     * @param config
     */
    createIntelligentProject(config: ProjectConfig): Promise<ProjectCreationResult>;
    /**
     * Manage complete project lifecycle with AI optimization.
     *
     * @param project
     */
    manageProjectLifecycle(project: any): Promise<any>;
    /**
     * Optimize project structure with AI analysis.
     *
     * @param project
     */
    optimizeProjectStructure(project: any): Promise<any>;
    /**
     * Monitor swarm execution with real-time dashboard.
     *
     * @param swarmId
     */
    monitorSwarmExecution(swarmId: string): Promise<MonitoringDashboard>;
    /**
     * Control swarm operations with intelligent coordination.
     *
     * @param commands
     */
    controlSwarmOperations(commands: SwarmCommand[]): Promise<ControlResult>;
    /**
     * Visualize swarm topology with advanced graphics.
     *
     * @param topology
     */
    visualizeSwarmTopology(topology: any): Promise<any>;
    /**
     * Orchestrate complete development pipeline.
     *
     * @param pipeline
     */
    orchestrateDevelopmentPipeline(pipeline: DevPipeline): Promise<PipelineResult>;
    /**
     * Generate code automatically with AI assistance.
     *
     * @param specs
     */
    automateCodeGeneration(specs: any[]): Promise<any>;
    /**
     * Perform intelligent testing with comprehensive strategies.
     *
     * @param strategy
     */
    performIntelligentTesting(strategy: any): Promise<any>;
    /**
     * Execute individual lifecycle stage.
     *
     * @param project
     * @param stage
     */
    private executeLifecycleStage;
    private initializeProjectStage;
    private developmentStage;
    private testingStage;
    private optimizationStage;
    private deploymentStage;
    private maintenanceStage;
    private generateLifecycleRecommendations;
    /**
     * Get command registry for external access.
     */
    getCommandRegistry(): AdvancedCommandRegistry;
    /**
     * Execute command with intelligent routing and monitoring.
     *
     * @param commandName
     * @param args
     * @param options
     */
    executeCommand(commandName: string, args: any[], options?: any): Promise<any>;
    private executeProjectCommand;
    private executeSwarmCommand;
    private executeGenerateCommand;
    private handleProjectCreate;
    private handleProjectOptimize;
    private handleProjectStatus;
    private handleSwarmMonitor;
    private handleSwarmSpawn;
    private handleSwarmCoordinate;
    private handleGenerateFromSpec;
    private handleGenerateNeuralNetwork;
}
/**
 * Advanced Command Registry for intelligent command management.
 *
 * @example
 */
export declare class AdvancedCommandRegistry {
    private categories;
    private commands;
    registerCategory(name: string, category: any): void;
    getCommand(name: string): any;
    getCategories(): any[];
    getAllCommands(): any[];
    findCommandsByCategory(category: CommandCategory): any[];
}
export default AdvancedCLIEngine;
//# sourceMappingURL=advanced-cli-engine.d.ts.map