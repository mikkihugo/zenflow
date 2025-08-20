/**
 * @fileoverview Environment Detection System - Foundation Integration
 * 
 * **EXTRACTED FROM MAIN APP → FOUNDATION INTEGRATION**
 * 
 * Comprehensive environment auto-detection system now integrated into
 * @claude-zen/foundation for universal development environment discovery.
 * 
 * Key Features:
 * - Auto-detects tools, package managers, runtimes
 * - Project context analysis
 * - System capabilities detection  
 * - Integration with existing monorepo detector
 * - Foundation logging and error handling
 * - Event-driven updates
 * 
 * **FOUNDATION INTEGRATION:**
 * - Extends existing monorepo detection
 * - Uses foundation Logger interface
 * - Integrates with foundation error handling
 * - Available for DI injection
 * - Follows foundation patterns
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0 (extracted from main app)
 * @version 1.0.0
 */

import { exec } from 'node:child_process';
import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { EventEmitter } from 'eventemitter3';
import type { Logger } from './logging';
import { getLogger } from './logging';
import { BaseError, createError } from './error-handling';
import { WorkspaceDetector, DetectedWorkspace } from './monorepo-detector';

const execAsync = promisify(exec);

// ============================================================================
// FOUNDATION-INTEGRATED ENVIRONMENT DETECTION TYPES
// ============================================================================

export interface EnvironmentTool {
  name: string;
  type:
    | 'package-manager'
    | 'runtime'
    | 'compiler'
    | 'cli-tool'
    | 'build-tool'
    | 'version-control';
  available: boolean;
  version?: string;
  path?: string;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

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
  workspace?: DetectedWorkspace; // Integration with monorepo detector
}

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

export interface EnvironmentSnapshot {
  timestamp: number;
  tools: EnvironmentTool[];
  projectContext: ProjectContext;
  systemCapabilities: SystemCapabilities;
  suggestions: string[];
}

export class EnvironmentDetectionError extends BaseError {
  constructor(message: string, public readonly tool?: string) {
    super('ENVIRONMENT_DETECTION_ERROR', message, 'EnvironmentDetectionError');
  }
}

// ============================================================================
// ENHANCED ENVIRONMENT DETECTOR WITH FOUNDATION INTEGRATION
// ============================================================================

export class EnvironmentDetector extends EventEmitter {
  private snapshot: EnvironmentSnapshot | null = null;
  private detectionInterval: NodeJS.Timer | null = null;
  private isDetecting = false;
  private logger: Logger;
  private workspaceDetector: WorkspaceDetector;

  constructor(
    private projectRoot: string = process.cwd(),
    private autoRefresh = true,
    private refreshInterval = 30000, // 30 seconds
    logger?: Logger
  ) {
    super();
    
    this.logger = logger || getLogger('EnvironmentDetector');
    this.workspaceDetector = new WorkspaceDetector();

    if (autoRefresh) {
      this.startAutoDetection();
    }
  }

  /**
   * Start automatic environment detection
   */
  startAutoDetection(): void {
    if (this.detectionInterval) return;

    // Initial detection
    this.detectEnvironment();

    // Set up periodic detection
    this.detectionInterval = setInterval(() => {
      this.detectEnvironment();
    }, this.refreshInterval);

    this.logger.info(`Started auto-detection with ${this.refreshInterval}ms interval`);
  }

  /**
   * Stop automatic environment detection
   */
  stopAutoDetection(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
      this.logger.info('Stopped auto-detection');
    }
  }

  /**
   * Perform comprehensive environment detection
   */
  async detectEnvironment(): Promise<EnvironmentSnapshot> {
    if (this.isDetecting) {
      return this.snapshot || this.createEmptySnapshot();
    }

    this.isDetecting = true;
    this.logger.info('Starting environment detection...');

    try {
      const [tools, projectContext, systemCapabilities] = await Promise.all([
        this.detectTools(),
        this.detectProjectContext(),
        this.detectSystemCapabilities()
      ]);

      const suggestions = this.generateSuggestions(tools, projectContext, systemCapabilities);

      this.snapshot = {
        timestamp: Date.now(),
        tools,
        projectContext,
        systemCapabilities,
        suggestions
      };

      this.emit('environment-detected', this.snapshot);
      this.logger.info('Environment detection completed', {
        toolsFound: tools.filter(t => t.available).length,
        totalTools: tools.length,
        languages: projectContext.languages,
        workspace: projectContext.workspace?.tool
      });

      return this.snapshot;

    } catch (error) {
      this.logger.error('Environment detection failed:', error);
      throw new EnvironmentDetectionError(
        `Failed to detect environment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * Detect available development tools
   */
  private async detectTools(): Promise<EnvironmentTool[]> {
    const toolsToDetect = [
      // Package Managers
      { name: 'npm', type: 'package-manager' as const, command: 'npm --version' },
      { name: 'yarn', type: 'package-manager' as const, command: 'yarn --version' },
      { name: 'pnpm', type: 'package-manager' as const, command: 'pnpm --version' },
      { name: 'bun', type: 'package-manager' as const, command: 'bun --version' },
      
      // Runtimes
      { name: 'node', type: 'runtime' as const, command: 'node --version' },
      { name: 'deno', type: 'runtime' as const, command: 'deno --version' },
      { name: 'python', type: 'runtime' as const, command: 'python --version' },
      { name: 'python3', type: 'runtime' as const, command: 'python3 --version' },
      { name: 'rust', type: 'runtime' as const, command: 'rustc --version' },
      
      // Build Tools
      { name: 'cargo', type: 'build-tool' as const, command: 'cargo --version' },
      { name: 'go', type: 'compiler' as const, command: 'go version' },
      { name: 'gcc', type: 'compiler' as const, command: 'gcc --version' },
      { name: 'clang', type: 'compiler' as const, command: 'clang --version' },
      
      // CLI Tools
      { name: 'git', type: 'version-control' as const, command: 'git --version' },
      { name: 'docker', type: 'cli-tool' as const, command: 'docker --version' },
      { name: 'podman', type: 'cli-tool' as const, command: 'podman --version' },
      
      // Build Systems
      { name: 'nx', type: 'build-tool' as const, command: 'nx --version' },
      { name: 'turbo', type: 'build-tool' as const, command: 'turbo --version' },
      { name: 'lerna', type: 'build-tool' as const, command: 'lerna --version' },
    ];

    const results = await Promise.allSettled(
      toolsToDetect.map(async (tool) => {
        try {
          const { stdout } = await execAsync(tool.command, { timeout: 5000 });
          const version = this.parseVersion(stdout.trim());
          
          return {
            name: tool.name,
            type: tool.type,
            available: true,
            version,
            capabilities: await this.detectToolCapabilities(tool.name)
          };
        } catch (error) {
          return {
            name: tool.name,
            type: tool.type,
            available: false
          };
        }
      })
    );

    return results.map((result, index) => 
      result.status === 'fulfilled' ? result.value : {
        name: toolsToDetect[index].name,
        type: toolsToDetected[index].type,
        available: false
      }
    );
  }

  /**
   * Detect project context with workspace integration
   */
  private async detectProjectContext(): Promise<ProjectContext> {
    const projectFiles = [
      'package.json', 'Cargo.toml', 'mix.exs', 'flake.nix', 
      'shell.nix', 'Dockerfile', '.gitignore'
    ];

    const fileChecks = await Promise.allSettled(
      projectFiles.map(file => 
        access(join(this.projectRoot, file))
          .then(() => true)
          .catch(() => false)
      )
    );

    // Integrate with workspace detector
    let workspace: DetectedWorkspace | undefined;
    try {
      workspace = (await this.workspaceDetector.detectWorkspaceRoot(this.projectRoot)) || undefined;
    } catch (error) {
      this.logger.warn('Failed to detect workspace:', error);
    }

    // Detect languages and frameworks
    const languages = await this.detectLanguages();
    const frameworks = await this.detectFrameworks();
    const buildTools = await this.detectBuildTools();

    return {
      hasPackageJson: fileChecks[0]?.status === 'fulfilled' && fileChecks[0].value,
      hasCargoToml: fileChecks[1]?.status === 'fulfilled' && fileChecks[1].value,
      hasMixExs: fileChecks[2]?.status === 'fulfilled' && fileChecks[2].value,
      hasFlakeNix: fileChecks[3]?.status === 'fulfilled' && fileChecks[3].value,
      hasShellNix: fileChecks[4]?.status === 'fulfilled' && fileChecks[4].value,
      hasDockerfile: fileChecks[5]?.status === 'fulfilled' && fileChecks[5].value,
      hasGitignore: fileChecks[6]?.status === 'fulfilled' && fileChecks[6].value,
      languages,
      frameworks,
      buildTools,
      workspace
    };
  }

  /**
   * Detect system capabilities
   */
  private async detectSystemCapabilities(): Promise<SystemCapabilities> {
    const os = process.platform;
    const arch = process.arch;

    // Check for containerization
    const dockerAvailable = await this.checkCommandExists('docker');
    const podmanAvailable = await this.checkCommandExists('podman');

    // Basic virtualization detection
    const virtualizationAvailable = dockerAvailable || podmanAvailable;

    return {
      operatingSystem: os,
      architecture: arch,
      nodeVersion: process.version,
      containers: {
        docker: dockerAvailable,
        podman: podmanAvailable
      },
      virtualization: {
        available: virtualizationAvailable,
        type: dockerAvailable ? 'docker' : podmanAvailable ? 'podman' : undefined
      }
    };
  }

  /**
   * Generate environment-based suggestions
   */
  private generateSuggestions(
    tools: EnvironmentTool[],
    projectContext: ProjectContext,
    systemCapabilities: SystemCapabilities
  ): string[] {
    const suggestions: string[] = [];
    
    // Package manager suggestions
    if (projectContext.hasPackageJson && !tools.find(t => t.name === 'pnpm' && t.available)) {
      suggestions.push('Consider installing pnpm for faster package management');
    }
    
    // Monorepo tool suggestions
    if (projectContext.workspace && !tools.find(t => t.name === 'nx' && t.available)) {
      suggestions.push('Consider installing Nx for better monorepo management');
    }
    
    // Container suggestions
    if (!systemCapabilities.containers.docker && !systemCapabilities.containers.podman) {
      suggestions.push('Consider installing Docker for containerized development');
    }

    return suggestions;
  }

  // Helper methods
  private parseVersion(output: string): string {
    const versionMatch = output.match(/v?(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : output.split('\n')[0];
  }

  private async checkCommandExists(command: string): Promise<boolean> {
    try {
      await execAsync(`which ${command}`, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  private async detectToolCapabilities(toolName: string): Promise<string[]> {
    // Tool-specific capability detection could be implemented here
    return [];
  }

  private async detectLanguages(): Promise<string[]> {
    const languageFiles = {
      typescript: ['*.ts', '*.tsx'],
      javascript: ['*.js', '*.jsx'],
      rust: ['*.rs'],
      python: ['*.py'],
      go: ['*.go'],
      elixir: ['*.ex', '*.exs']
    };

    const languages: string[] = [];
    // Implementation would check for these file types
    return languages;
  }

  private async detectFrameworks(): Promise<string[]> {
    // Framework detection logic
    return [];
  }

  private async detectBuildTools(): Promise<string[]> {
    // Build tools detection logic
    return [];
  }

  private createEmptySnapshot(): EnvironmentSnapshot {
    return {
      timestamp: Date.now(),
      tools: [],
      projectContext: {
        hasPackageJson: false,
        hasCargoToml: false,
        hasMixExs: false,
        hasFlakeNix: false,
        hasShellNix: false,
        hasDockerfile: false,
        hasGitignore: false,
        languages: [],
        frameworks: [],
        buildTools: []
      },
      systemCapabilities: {
        operatingSystem: process.platform,
        architecture: process.arch,
        containers: { docker: false, podman: false },
        virtualization: { available: false }
      },
      suggestions: []
    };
  }

  // Public API methods
  getSnapshot(): EnvironmentSnapshot | null {
    return this.snapshot;
  }

  async refreshEnvironment(): Promise<EnvironmentSnapshot> {
    return this.detectEnvironment();
  }

  getAvailableTools(): EnvironmentTool[] {
    return this.snapshot?.tools.filter(t => t.available) || [];
  }

  hasTools(...toolNames: string[]): boolean {
    const availableTools = this.getAvailableTools();
    return toolNames.every(name => 
      availableTools.some(tool => tool.name === name)
    );
  }
}

// ============================================================================
// DI CONTAINER INTEGRATION
// ============================================================================

/**
 * DI token for EnvironmentDetector
 */
export const ENVIRONMENT_DETECTOR_TOKEN = Symbol('EnvironmentDetector');

/**
 * Create EnvironmentDetector with DI
 */
export function createEnvironmentDetector(
  projectRoot?: string,
  autoRefresh?: boolean,
  logger?: Logger
): EnvironmentDetector {
  return new EnvironmentDetector(projectRoot, autoRefresh, 30000, logger);
}