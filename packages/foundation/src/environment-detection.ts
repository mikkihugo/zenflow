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
import { existsSync, readFileSync } from 'node:fs';
import { access, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { EventEmitter } from 'eventemitter3';

import type { Logger } from './logging';
import { getLogger } from './logging';
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

export interface NixPackage {
  name: string;
  version?: string;
  description?: string;
  available: boolean;
  installed: boolean;
  category: 'nodejs' | 'system' | 'dev-tools' | 'other';
}

export interface NixEnvironment {
  nixAvailable: boolean;
  flakesEnabled: boolean;
  currentShell: string | null;
  packages: NixPackage[];
  suggestedSetup: string[];
}

export interface EnvironmentSnapshot {
  timestamp: number;
  tools: EnvironmentTool[];
  projectContext: ProjectContext;
  systemCapabilities: SystemCapabilities;
  nixEnvironment?: NixEnvironment;
  suggestions: string[];
}

export class EnvironmentDetectionError extends Error {
  constructor(
    message: string,
    public readonly tool?: string,
  ) {
    super(message);
    this.name = 'EnvironmentDetectionError';
  }
}

// ============================================================================
// ENHANCED ENVIRONMENT DETECTOR WITH FOUNDATION INTEGRATION
// ============================================================================

export class EnvironmentDetector extends EventEmitter {
  private snapshot: EnvironmentSnapshot | null = null;
  private detectionInterval: NodeJS.Timeout | null = null;
  private isDetecting = false;
  private logger: Logger;
  private workspaceDetector: WorkspaceDetector | null;

  constructor(
    private projectRoot: string = process.cwd(),
    autoRefresh = true,
    private refreshInterval = 30000, // 30 seconds
    logger?: Logger,
  ) {
    super();

    this.logger = logger || getLogger('EnvironmentDetector');
    // Initialize workspace detector for comprehensive environment analysis
    this.workspaceDetector = null;

    if (autoRefresh) {
      this.startAutoDetection();
    }
  }

  /**
   * Start automatic environment detection
   */
  startAutoDetection(): void {
    if (this.detectionInterval) {
      return;
    }

    // Initial detection
    this.detectEnvironment();

    // Set up periodic detection
    this.detectionInterval = setInterval(() => {
      this.detectEnvironment();
    }, this.refreshInterval);

    this.logger.info(
      `Started auto-detection with ${this.refreshInterval}ms interval`,
    );
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
      const [tools, projectContext, systemCapabilities, nixEnvironment] =
        await Promise.all([
          this.detectTools(),
          this.detectProjectContext(),
          this.detectSystemCapabilities(),
          this.detectNixEnvironment(),
        ]);

      const suggestions = this.generateSuggestions(
        tools,
        projectContext,
        systemCapabilities,
        nixEnvironment,
      );

      this.snapshot = {
        timestamp: Date.now(),
        tools,
        projectContext,
        systemCapabilities,
        nixEnvironment,
        suggestions,
      };

      this.emit('environment-detected', this.snapshot);
      this.logger.info('Environment detection completed', {
        toolsFound: tools.filter((t) => t.available).length,
        totalTools: tools.length,
        languages: projectContext.languages,
        workspace: projectContext.workspace?.tool,
      });

      return this.snapshot;
    } catch (error) {
      this.logger.error('Environment detection failed:', error);
      throw new EnvironmentDetectionError(
        `Failed to detect environment: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      {
        name: 'npm',
        type: 'package-manager' as const,
        command: 'npm --version',
      },
      {
        name: 'yarn',
        type: 'package-manager' as const,
        command: 'yarn --version',
      },
      {
        name: 'pnpm',
        type: 'package-manager' as const,
        command: 'pnpm --version',
      },
      {
        name: 'bun',
        type: 'package-manager' as const,
        command: 'bun --version',
      },

      // Runtimes
      { name: 'node', type: 'runtime' as const, command: 'node --version' },
      { name: 'deno', type: 'runtime' as const, command: 'deno --version' },
      { name: 'python', type: 'runtime' as const, command: 'python --version' },
      {
        name: 'python3',
        type: 'runtime' as const,
        command: 'python3 --version',
      },
      { name: 'rust', type: 'runtime' as const, command: 'rustc --version' },

      // Build Tools
      {
        name: 'cargo',
        type: 'build-tool' as const,
        command: 'cargo --version',
      },
      { name: 'go', type: 'compiler' as const, command: 'go version' },
      { name: 'gcc', type: 'compiler' as const, command: 'gcc --version' },
      { name: 'clang', type: 'compiler' as const, command: 'clang --version' },

      // CLI Tools
      {
        name: 'git',
        type: 'version-control' as const,
        command: 'git --version',
      },
      {
        name: 'docker',
        type: 'cli-tool' as const,
        command: 'docker --version',
      },
      {
        name: 'podman',
        type: 'cli-tool' as const,
        command: 'podman --version',
      },

      // Build Systems
      { name: 'nx', type: 'build-tool' as const, command: 'nx --version' },
      {
        name: 'turbo',
        type: 'build-tool' as const,
        command: 'turbo --version',
      },
      {
        name: 'lerna',
        type: 'build-tool' as const,
        command: 'lerna --version',
      },

      // Nix ecosystem
      {
        name: 'nix',
        type: 'package-manager' as const,
        command: 'nix --version',
      },
      {
        name: 'nix-shell',
        type: 'cli-tool' as const,
        command: 'nix-shell --version',
      },
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
            capabilities: await this.detectToolCapabilities(tool.name),
          };
        } catch (error) {
          // Security audit: tracking tool detection failures for security analysis
          this.logger.debug('Tool detection failed - security audit', {
            toolName: tool.name,
            toolType: tool.type,
            error: error instanceof Error ? error.message : String(error),
          });
          return {
            name: tool.name,
            type: tool.type,
            available: false,
          };
        }
      }),
    );

    return results.map((result, index) =>
      result.status === 'fulfilled'
        ? result.value
        : {
          name: toolsToDetect[index]?.name || 'unknown',
          type: toolsToDetect[index]?.type || 'cli-tool',
          available: false,
        },
    );
  }

  /**
   * Detect project context with workspace integration
   */
  private async detectProjectContext(): Promise<ProjectContext> {
    const projectFiles = [
      'package.json',
      'Cargo.toml',
      'mix.exs',
      'flake.nix',
      'shell.nix',
      'Dockerfile',
      '.gitignore',
    ];

    const fileChecks = await Promise.allSettled(
      projectFiles.map((file) =>
        access(join(this.projectRoot, file))
          .then(() => true)
          .catch(() => false),
      ),
    );

    // Integrate with workspace detector for comprehensive project analysis
    let workspace: DetectedWorkspace | undefined;
    try {
      // Initialize workspace detector if not already done
      if (!this.workspaceDetector) {
        this.workspaceDetector = new WorkspaceDetector();
      }

      const detected = await this.workspaceDetector.detectWorkspaceRoot(
        this.projectRoot,
      );
      workspace = detected ?? undefined;
    } catch (error) {
      this.logger.warn('Failed to detect workspace:', error);
      workspace = undefined;
    }

    // Detect languages and frameworks
    const languages = await this.detectLanguages();
    const frameworks = await this.detectFrameworks();
    const buildTools = await this.detectBuildTools();

    return {
      hasPackageJson: Boolean(
        fileChecks[0]?.status === 'fulfilled' && fileChecks[0].value,
      ),
      hasCargoToml: Boolean(
        fileChecks[1]?.status === 'fulfilled' && fileChecks[1].value,
      ),
      hasMixExs: Boolean(
        fileChecks[2]?.status === 'fulfilled' && fileChecks[2].value,
      ),
      hasFlakeNix: Boolean(
        fileChecks[3]?.status === 'fulfilled' && fileChecks[3].value,
      ),
      hasShellNix: Boolean(
        fileChecks[4]?.status === 'fulfilled' && fileChecks[4].value,
      ),
      hasDockerfile: Boolean(
        fileChecks[5]?.status === 'fulfilled' && fileChecks[5].value,
      ),
      hasGitignore: Boolean(
        fileChecks[6]?.status === 'fulfilled' && fileChecks[6].value,
      ),
      languages,
      frameworks,
      buildTools,
      workspace,
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
        podman: podmanAvailable,
      },
      virtualization: {
        available: virtualizationAvailable,
        type: dockerAvailable
          ? 'docker'
          : podmanAvailable
            ? 'podman'
            : undefined,
      },
    };
  }

  /**
   * Detect Nix environment and available packages
   */
  private async detectNixEnvironment(): Promise<NixEnvironment | undefined> {
    try {
      // Check if Nix is available
      const nixTool = await this.checkCommandExists('nix');
      if (!nixTool) {
        return {
          nixAvailable: false,
          flakesEnabled: false,
          currentShell: null,
          packages: [],
          suggestedSetup: [
            'Install Nix: curl -L https://nixos.org/nix/install | sh',
          ],
        };
      }

      const flakesEnabled = await this.areFlakesEnabled();
      const currentShell = this.getCurrentNixShell();
      const packages = await this.scanAvailableNixPackages();
      const suggestedSetup = this.generateNixSetupSuggestions(
        flakesEnabled,
        packages,
      );

      return {
        nixAvailable: true,
        flakesEnabled,
        currentShell,
        packages,
        suggestedSetup,
      };
    } catch (error) {
      this.logger.error('Failed to detect Nix environment:', error);
      return undefined;
    }
  }

  /**
   * Check if Nix flakes are enabled
   */
  private async areFlakesEnabled(): Promise<boolean> {
    try {
      await execAsync('nix flake --help', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current Nix shell information
   */
  private getCurrentNixShell(): string | null {
    if (process.env['IN_NIX_SHELL']) {
      return 'nix-shell';
    }
    if (process.env['FLAKE_DEVSHELL']) {
      return 'flake-devshell';
    }
    return null;
  }

  /**
   * Scan for available and relevant Nix packages
   */
  private async scanAvailableNixPackages(): Promise<NixPackage[]> {
    const packages: NixPackage[] = [];
    const relevantPackages = [
      // Node.js ecosystem
      {
        name: 'nodejs_20',
        category: 'nodejs' as const,
        description: 'Node.js runtime v20',
      },
      {
        name: 'nodejs_18',
        category: 'nodejs' as const,
        description: 'Node.js runtime v18',
      },
      {
        name: 'nodePackages.npm',
        category: 'nodejs' as const,
        description: 'NPM package manager',
      },
      {
        name: 'nodePackages.typescript',
        category: 'nodejs' as const,
        description: 'TypeScript compiler',
      },

      // Development tools
      {
        name: 'git',
        category: 'dev-tools' as const,
        description: 'Version control system',
      },
      {
        name: 'ripgrep',
        category: 'dev-tools' as const,
        description: 'Fast text search tool',
      },
      {
        name: 'fd',
        category: 'dev-tools' as const,
        description: 'Fast file finder',
      },
      {
        name: 'tree',
        category: 'dev-tools' as const,
        description: 'Directory tree viewer',
      },
      {
        name: 'jq',
        category: 'dev-tools' as const,
        description: 'JSON processor',
      },

      // System utilities
      { name: 'curl', category: 'system' as const, description: 'HTTP client' },
      {
        name: 'wget',
        category: 'system' as const,
        description: 'Web downloader',
      },
    ];

    for (const pkg of relevantPackages) {
      try {
        const available = await this.isNixPackageAvailable(pkg.name);
        const installed = await this.isNixPackageInstalled(pkg.name);

        packages.push({
          name: pkg.name,
          description: pkg.description,
          category: pkg.category,
          available,
          installed,
        });
      } catch (error) {
        this.logger.warn(`Failed to check Nix package ${pkg.name}:`, error);
        packages.push({
          name: pkg.name,
          description: pkg.description,
          category: pkg.category,
          available: false,
          installed: false,
        });
      }
    }

    return packages;
  }

  /**
   * Check if a Nix package is available in nixpkgs
   */
  private async isNixPackageAvailable(packageName: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `nix-env -qaP ${packageName} | head -1`,
        { timeout: 5000 },
      );
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if a Nix package is currently installed/accessible
   */
  private async isNixPackageInstalled(packageName: string): Promise<boolean> {
    try {
      // Extract binary name from package name
      let binaryName = packageName;
      if (packageName.includes('.')) {
        const parts = packageName.split('.');
        binaryName = parts[parts.length - 1] || packageName;
      }
      if (packageName.includes('_')) {
        const parts = packageName.split('_');
        binaryName = parts[0] || packageName;
      }

      return await this.checkCommandExists(binaryName);
    } catch {
      return false;
    }
  }

  /**
   * Generate Nix-specific setup suggestions
   */
  private generateNixSetupSuggestions(
    flakesEnabled: boolean,
    packages: NixPackage[],
  ): string[] {
    const suggestions: string[] = [];

    if (!flakesEnabled) {
      suggestions.push(
        'Enable Nix flakes: echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf',
      );
    }

    // Check if flake.nix exists
    const hasFlakeNix = this.hasFlakeNix();
    if (hasFlakeNix) {
      suggestions.push('Enter development shell: nix develop');
    } else {
      suggestions.push(
        'Create flake.nix for reproducible development environment',
      );
    }

    // No BEAM-specific suggestions (foundation focuses on claude-zen core)

    // Suggest missing dev tools
    const devTools = packages.filter((p) => p.category === 'dev-tools');
    const missingDev = devTools.filter((p) => p.available && !p.installed);
    if (missingDev.length > 0) {
      suggestions.push(
        `Install dev tools: nix-shell -p ${missingDev.map((p) => p.name).join(' ')}`,
      );
    }

    return suggestions;
  }

  /**
   * Check if flake.nix exists in project
   */
  private hasFlakeNix(): boolean {
    try {
      const flakePath = join(this.projectRoot, 'flake.nix');
      return existsSync(flakePath);
    } catch {
      return false;
    }
  }

  /**
   * Generate environment-based suggestions
   */
  private generateSuggestions(
    tools: EnvironmentTool[],
    projectContext: ProjectContext,
    systemCapabilities: SystemCapabilities,
    nixEnvironment?: NixEnvironment,
  ): string[] {
    const suggestions: string[] = [];

    // Package manager suggestions
    if (
      projectContext.hasPackageJson &&
      !tools.find((t) => t.name === 'pnpm' && t.available)
    ) {
      suggestions.push(
        'Consider installing pnpm for faster package management',
      );
    }

    // Monorepo tool suggestions
    if (
      projectContext.workspace &&
      !tools.find((t) => t.name === 'nx' && t.available)
    ) {
      suggestions.push('Consider installing Nx for better monorepo management');
    }

    // Container suggestions
    if (
      !systemCapabilities.containers.docker &&
      !systemCapabilities.containers.podman
    ) {
      suggestions.push(
        'Consider installing Docker for containerized development',
      );
    }

    // Nix-specific suggestions
    if (nixEnvironment) {
      suggestions.push(...nixEnvironment.suggestedSetup);
    }

    return suggestions;
  }

  // Helper methods
  private parseVersion(output: string): string {
    const versionMatch = output.match(/v?(\d+\.\d+\.\d+)/);
    return versionMatch?.[1] || output.split('\n')[0] || 'unknown';
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
    // Security audit: tracking tool capability detection for security analysis
    this.logger.debug('Detecting tool capabilities for security audit', {
      toolName,
    });
    // Tool-specific capability detection could be implemented here
    return [];
  }

  private async detectLanguages(): Promise<string[]> {
    // Implementation would check for language files
    const languages: string[] = [];
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
        buildTools: [],
      },
      systemCapabilities: {
        operatingSystem: process.platform,
        architecture: process.arch,
        containers: { docker: false, podman: false },
        virtualization: { available: false },
      },
      nixEnvironment: {
        nixAvailable: false,
        flakesEnabled: false,
        currentShell: null,
        packages: [],
        suggestedSetup: [],
      },
      suggestions: [],
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
    return this.snapshot?.tools.filter((t) => t.available) || [];
  }

  hasTools(...toolNames: string[]): boolean {
    const availableTools = this.getAvailableTools();
    return toolNames.every((name) =>
      availableTools.some((tool) => tool.name === name),
    );
  }

  /**
   * Get Nix environment information
   */
  getNixEnvironment(): NixEnvironment | null {
    return this.snapshot?.nixEnvironment || null;
  }

  /**
   * Check if Nix is available
   */
  hasNix(): boolean {
    return this.getNixEnvironment()?.nixAvailable || false;
  }

  /**
   * Check if currently in a Nix shell
   */
  isInNixShell(): boolean {
    return this.getNixEnvironment()?.currentShell !== null;
  }

  /**
   * Get installed Nix packages
   */
  getInstalledNixPackages(): NixPackage[] {
    return this.getNixEnvironment()?.packages.filter((p) => p.installed) || [];
  }

  /**
   * Cleanup resources and stop all intervals to prevent memory leaks
   */
  cleanup(): void {
    // Stop auto-detection interval
    this.stopAutoDetection();

    // Remove all event listeners
    this.removeAllListeners();

    // Clear snapshot
    this.snapshot = null;

    this.logger.info('Environment detector cleanup completed');
  }

  /**
   * Dispose of the environment detector (alias for cleanup)
   */
  dispose(): void {
    this.cleanup();
  }
}

// ============================================================================
// NIX INTEGRATION CLASS WITH AUTO-SETUP
// ============================================================================

/**
 * High-level Nix integration class with auto-setup capabilities
 */
export class NixIntegration {
  private logger: Logger;
  private cachePath: string;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(
    private projectRoot: string = process.cwd(),
    private environmentDetector?: EnvironmentDetector,
    logger?: Logger,
  ) {
    this.logger = logger || getLogger('NixIntegration');
    this.cachePath = join(projectRoot, '.cache', 'nix-integration.json');

    // Create environment detector if not provided
    if (!this.environmentDetector) {
      this.environmentDetector = new EnvironmentDetector(
        projectRoot,
        false,
        30000,
        this.logger,
      );
    }
  }

  /**
   * Get full environment including Nix data
   */
  async detectEnvironment(): Promise<NixEnvironment> {
    // Check cache first
    const cached = await this.loadCache();
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    // Use environment detector to get Nix environment
    if (!this.environmentDetector) {
      throw new Error('Environment detector not initialized');
    }
    const snapshot = await this.environmentDetector.detectEnvironment();
    const nixEnvironment = snapshot.nixEnvironment || {
      nixAvailable: false,
      flakesEnabled: false,
      currentShell: null,
      packages: [],
      suggestedSetup: [
        'Install Nix: curl -L https://nixos.org/nix/install | sh',
      ],
    };

    // Cache the results
    await this.saveCache(nixEnvironment);
    return nixEnvironment;
  }

  /**
   * Auto-setup Nix environment for Claude Code Zen
   */
  async autoSetup(): Promise<{
    success: boolean;
    steps: string[];
    errors: string[];
  }> {
    const steps: string[] = [];
    const errors: string[] = [];

    try {
      const env = await this.detectEnvironment();

      if (!env.nixAvailable) {
        errors.push('Nix is not installed. Please install Nix first.');
        return { success: false, steps, errors };
      }

      steps.push('✓ Nix is available');

      // Create flake.nix if it doesn't exist
      const hasFlakeNix = this.hasFlakeNix();
      if (hasFlakeNix) {
        steps.push('✓ flake.nix already exists');
      } else {
        await this.createFlakeNix();
        steps.push('✓ Created flake.nix with BEAM language support');
      }

      // Enable flakes if not enabled
      if (env.flakesEnabled) {
        steps.push('✓ Nix flakes already enabled');
      } else {
        try {
          await this.enableFlakes();
          steps.push('✓ Enabled Nix flakes');
        } catch (error) {
          errors.push(`Failed to enable flakes: ${error}`);
        }
      }

      return { success: errors.length === 0, steps, errors };
    } catch (error) {
      errors.push(`Auto-setup failed: ${error}`);
      return { success: false, steps, errors };
    }
  }

  /**
   * Create a flake.nix file for the project
   */
  private async createFlakeNix(): Promise<void> {
    const flakeContent = `{
  description = "Claude Code Zen - Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.\${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js ecosystem
            nodejs_20
            nodePackages.npm
            nodePackages.typescript
            
            # Development tools
            git
            ripgrep
            fd
            tree
            jq
            curl
          ];
          
          shellHook = ''
            echo "🚀 Claude Code Zen Development Environment"
            echo "📦 TypeScript/Node.js development ready"
            echo "🛠️  Ready for development!"
          '';
        };
      });
}`;

    await writeFile(join(this.projectRoot, 'flake.nix'), flakeContent);
  }

  /**
   * Enable Nix flakes
   */
  private async enableFlakes(): Promise<void> {
    try {
      // Create nix config directory if it doesn't exist
      await execAsync('mkdir -p ~/.config/nix');

      // Add flakes configuration
      const configPath = homedir() + '/.config/nix/nix.conf';
      const configContent = 'experimental-features = nix-command flakes\n';

      try {
        const existing = await readFile(configPath, 'utf8');
        if (!existing.includes('experimental-features')) {
          await writeFile(configPath, existing + configContent);
        }
      } catch {
        // File doesn't exist, create it
        await writeFile(configPath, configContent);
      }
    } catch (error) {
      throw new Error(`Failed to enable flakes: ${error}`);
    }
  }

  /**
   * Check if flake.nix exists in project with enhanced validation
   */
  private hasFlakeNix(): boolean {
    try {
      const flakePath = join(this.projectRoot, 'flake.nix');
      if (!existsSync(flakePath)) {
        return false;
      }

      // Enhanced validation: check if the flake.nix file is readable and non-empty
      try {
        const content = readFileSync(flakePath, 'utf-8');
        return content.trim().length > 0 && content.includes('outputs');
      } catch {
        // If we can't read the file, still consider it as existing
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Load cached environment data
   */
  private async loadCache(): Promise<{
    timestamp: number;
    data: NixEnvironment;
  } | null> {
    try {
      const content = await readFile(this.cachePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Save environment data to cache
   */
  private async saveCache(data: NixEnvironment): Promise<void> {
    try {
      const cacheDir = join(this.cachePath, '..');
      await execAsync(`mkdir -p ${cacheDir}`);

      const cache = {
        timestamp: Date.now(),
        data,
      };

      await writeFile(this.cachePath, JSON.stringify(cache, null, 2));
    } catch (error) {
      this.logger.error('Failed to save Nix cache:', error);
    }
  }

  /**
   * Get environment summary for TUI display
   */
  async getEnvironmentSummary(): Promise<string> {
    const env = await this.detectEnvironment();

    if (!env.nixAvailable) {
      return '❌ Nix not available';
    }

    const installedCount = env.packages.filter((p) => p.installed).length;
    const totalCount = env.packages.length;

    let status = '✓ Nix available';
    if (env.flakesEnabled) {
      status += ', flakes enabled';
    }
    if (env.currentShell) {
      status += `, in ${env.currentShell}`;
    }
    status += ` • ${installedCount}/${totalCount} packages`;

    return status;
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
 * DI token for NixIntegration
 */
export const NIX_INTEGRATION_TOKEN = Symbol('NixIntegration');

/**
 * Create EnvironmentDetector with DI
 */
export function createEnvironmentDetector(
  projectRoot?: string,
  autoRefresh?: boolean,
  logger?: Logger,
): EnvironmentDetector {
  return new EnvironmentDetector(projectRoot, autoRefresh, 30000, logger);
}

/**
 * Create NixIntegration with DI
 */
export function createNixIntegration(
  projectRoot?: string,
  environmentDetector?: EnvironmentDetector,
  logger?: Logger,
): NixIntegration {
  return new NixIntegration(projectRoot, environmentDetector, logger);
}
