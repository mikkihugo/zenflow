/**
 * @fileoverview Environment Detection System
 *
 * Comprehensive environment auto-detection system for universal development
 * environment discovery and project context analysis.
 *
 * @example Basic Environment Detection
 * '''typescript'
 * import { EnvironmentDetector} from '@claude-zen/foundation';
 *
 * const detector = new EnvironmentDetector();
 * const env = await detector.detect('/path/to/project');
 *
 * logger.info('Node version: ', env.runtime.node);
' * logger.info('Package manager: ', env.packageManager.type);
' * logger.info('Available tools: ', env.tools);
' * '
 *
 * @example Advanced Usage with Caching
 * '''typescript'
 * const detector = new EnvironmentDetector({
 *   useCache:true,
 *   cacheTimeout:300000, // 5 minutes
 *});
 *
 * const environments = await detector.detectMultiple([
 *   '/path/to/project1', *   '/path/to/project2') *]);
 * '
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 */
import { EventEmitter } from '../../events/event-emitter.js';
import { type DetectedWorkspace } from '../../utilities/system/index.js';
import { type Logger } from '../logging/index.js';
/**
 * Represents a development tool available in the environment.
 * Provides comprehensive information about tool availability, version, and capabilities.
 *
 * @interface EnvironmentTool
 */
export interface EnvironmentTool {
    name: string;
    type: 'package-manager' | 'runtime' | 'compiler' | 'cli-tool' | 'build-tool' | 'version-control';
    available: boolean;
    version?: string;
    path?: string;
    capabilities?: string[];
    metadata?: Record<string, unknown>;
}
/**
 * Project context information including file presence and detected technologies.
 * Integrates with workspace detection for comprehensive project analysis.
 *
 * @interface ProjectContext
 */
export interface ProjectContext {
    hasPackageJson: boolean;
    hasCargoToml: boolean;
    hasMixExs: boolean;
    hasFlakeNix: boolean;
    hasShellNix: boolean;
    hasDockerfile: boolean;
    hasGitignore: boolean;
    languages: string[];
    frameworks: string[];
    buildTools: string[];
    workspace?: DetectedWorkspace;
}
/**
 * System capabilities and runtime information.
 * Provides details about the operating system, architecture, and available runtimes.
 *
 * @interface SystemCapabilities
 */
export interface SystemCapabilities {
    operatingSystem: string;
    architecture: string;
    nodeVersion?: string;
    pythonVersion?: string;
    rustVersion?: string;
    containers: {
        docker: boolean;
        podman: boolean;
    };
    virtualization: {
        available: boolean;
        type?: string;
    };
}
/**
 * Information about a Nix package in the package ecosystem.
 * Tracks availability, installation status, and categorization.
 *
 * @interface NixPackage
 */
export interface NixPackage {
    name: string;
    version?: string;
    description?: string;
    available: boolean;
    installed: boolean;
    category: 'nodejs' | 'system' | 'dev-tools' | 'other';
}
/**
 * Comprehensive Nix environment information.
 * Provides details about Nix availability, flakes support, and package ecosystem.
 *
 * @interface NixEnvironment
 */
export interface NixEnvironment {
    nixAvailable: boolean;
    flakesEnabled: boolean;
    currentShell: string | null;
    packages: NixPackage[];
    suggestedSetup: string[];
}
/**
 * Complete environment snapshot at a specific point in time.
 * Combines all detected information into a comprehensive view.
 *
 * @interface EnvironmentSnapshot
 */
export interface EnvironmentSnapshot {
    timestamp: number;
    tools: EnvironmentTool[];
    projectContext: ProjectContext;
    systemCapabilities: SystemCapabilities;
    nixEnvironment?: NixEnvironment;
    suggestions: string[];
}
/**
 * Specialized error for environment detection failures.
 * Provides context about which tool or component caused the failure.
 *
 * @class EnvironmentDetectionError
 * @extends Error
 */
export declare class EnvironmentDetectionError extends Error {
    readonly tool?: string | undefined;
    constructor(message: string, tool?: string | undefined);
}
/**
 * Comprehensive environment detection system for universal development environment discovery.
 * Provides auto-detection of tools, project context, system capabilities, and Nix integration.
 *
 * @class EnvironmentDetector
 * @extends EventEmitter
 *
 * @example Basic Usage
 * '''typescript'
 * const detector = new EnvironmentDetector();
 * const env = await detector.detectEnvironment();
 * logger.info('Available tools: ', env.tools.filter(t => t.available));
' * '
 *
 * @example With Caching and Auto-refresh
 * '''typescript'
 * const detector = new EnvironmentDetector('/project/path', true, 30000);
 * detector.on('service-started', (event) => {
 *   logger.info('Detection completed: ', event.serviceName);
' *});
 * '
 */
export declare class EnvironmentDetector extends EventEmitter {
    private projectRoot;
    private refreshInterval;
    private snapshot;
    private detectionInterval;
    private isDetecting;
    private logger;
    private workspaceDetector;
    constructor(projectRoot?: string, autoRefresh?: boolean, refreshInterval?: number, // 30 seconds
    logger?: Logger);
    /**
     * Starts automatic environment detection with periodic refresh.
     * Sets up interval-based detection to keep environment information current.
     */
    startAutoDetection(): void;
    /**
     * Stops automatic environment detection and clears the refresh interval.
     */
    stopAutoDetection(): void;
    /**
     * Performs comprehensive environment detection across all systems.
     * Detects tools, project context, system capabilities, and Nix environment.
     *
     * @returns Complete environment snapshot
     * @throws {EnvironmentDetectionError} When detection fails
     */
    detectEnvironment(): Promise<EnvironmentSnapshot>;
    /**
     * Detect available development tools
     */
    private detectTools;
    /**
     * Get predefined tool definitions
     */
    private getToolDefinitions;
    /**
     * Detect tools in parallel
     */
    private detectToolsParallel;
    /**
     * Log tool detection failure for security audit
     */
    private logToolDetectionFailure;
    /**
     * Process tool detection results
     */
    private processToolResults;
    /**
     * Detect project context with workspace integration
     */
    private detectProjectContext;
    /**
     * Detect system capabilities
     */
    private detectSystemCapabilities;
    /**
     * Detect Nix environment and available packages
     */
    private detectNixEnvironment;
    /**
     * Check if Nix flakes are enabled
     */
    private areFlakesEnabled;
    /**
     * Get current Nix shell information
     */
    private getCurrentNixShell;
    /**
     * Scan for available and relevant Nix packages
     */
    private scanAvailableNixPackages;
    /**
     * Check if a Nix package is available in nixpkgs
     */
    private isNixPackageAvailable;
    /**
     * Check if a Nix package is currently installed/accessible
     */
    private isNixPackageInstalled;
    /**
     * Generate Nix-specific setup suggestions
     */
    private generateNixSetupSuggestions;
    /**
     * Check if flake.nix exists in project
     */
    private hasFlakeNix;
    /**
     * Generate environment-based suggestions
     */
    private generateSuggestions;
    private parseVersion;
    private checkCommandExists;
    private detectToolCapabilities;
    private detectLanguages;
    private detectFrameworks;
    private detectBuildTools;
    private createEmptySnapshot;
    getSnapshot(): EnvironmentSnapshot | null;
    refreshEnvironment(): Promise<EnvironmentSnapshot>;
    getAvailableTools(): EnvironmentTool[];
    hasTools(...toolNames: string[]): boolean;
    /**
     * Get Nix environment information
     */
    getNixEnvironment(): NixEnvironment | null;
    /**
     * Check if Nix is available
     */
    hasNix(): boolean;
    /**
     * Check if currently in a Nix shell
     */
    isInNixShell(): boolean;
    /**
     * Get installed Nix packages
     */
    getInstalledNixPackages(): NixPackage[];
    /**
     * Cleanup resources and stop all intervals to prevent memory leaks
     */
    cleanup(): void;
    /**
     * Dispose of the environment detector (alias for cleanup)
     */
    dispose(): void;
}
/**
 * High-level Nix integration class with auto-setup capabilities
 */
/**
 * High-level Nix integration class with auto-setup capabilities.
 * Provides comprehensive Nix environment management and project setup.
 *
 * @class NixIntegration
 *
 * @example Basic Usage
 * '''typescript'
 * const nix = new NixIntegration('/project/path');
 * const result = await nix.autoSetup();
 * if (result.success) {
 *   logger.info('Nix setup completed: ', result.steps);
' *}
 * `;
 */
export declare class NixIntegration {
    private projectRoot;
    private environmentDetector?;
    private logger;
    private cachePath;
    private cacheExpiry;
    constructor(projectRoot?: string, environmentDetector?: EnvironmentDetector | undefined, logger?: Logger);
    /**
     * Detects and returns the complete Nix environment with caching.
     *
     * @returns Complete Nix environment information
     * @throws {Error} When environment detector is not initialized
     */
    detectEnvironment(): Promise<NixEnvironment>;
    /**
     * Automatically sets up Nix environment for Claude Code Zen development.
     * Creates flake.nix, enables flakes, and configures development shell.
     *
     * @returns Setup result with success status, steps performed, and any errors
     */
    autoSetup(): Promise<{
        success: boolean;
        steps: string[];
        errors: string[];
    }>;
    /**
     * Create a flake.nix file for the project
     */
    private createFlakeNix;
    /**
     * Enable Nix flakes
     */
    private enableFlakes;
    /**
     * Check if flake.nix exists in project with enhanced validation
     */
    private hasFlakeNix;
    /**
     * Load cached environment data
     */
    private loadCache;
    /**
     * Save environment data to cache
     */
    private saveCache;
    /**
     * Get environment summary for TUI display
     */
    getEnvironmentSummary(): Promise<string>;
}
/**
 * DI token for EnvironmentDetector
 */
export declare const ENVIRONMENT_DETECTOR_TOKEN: unique symbol;
/**
 * DI token for NixIntegration
 */
export declare const NIX_INTEGRATION_TOKEN: unique symbol;
/**
 * Create EnvironmentDetector with DI
 */
export declare function createEnvironmentDetector(projectRoot?: string, autoRefresh?: boolean, logger?: Logger): EnvironmentDetector;
/**
 * Create NixIntegration with DI
 */
export declare function createNixIntegration(projectRoot?: string, environmentDetector?: EnvironmentDetector, logger?: Logger): NixIntegration;
//# sourceMappingURL=environment.detector.d.ts.map