/**
 * Environment Auto-Detection System
 *
 * Automatically discovers and monitors available development tools,
 * package managers, runtimes, and system capabilities
 */

import { exec } from 'node:child_process';

import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { getLogger } from '@claude-zen/foundation';
import { EventEmitter } from 'eventemitter3';

const execAsync = promisify(exec);

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

export class EnvironmentDetector extends EventEmitter {
  private snapshot: EnvironmentSnapshot | null = null;
  private detectionInterval: NodeJS.Timer | null = null;
  private isDetecting = false;
  private logger = getLogger('EnvironmentDetector');

  constructor(
    private projectRoot: string = process.cwd(),
    private autoRefresh = true,
    private refreshInterval = 30000 // 30 seconds
  ) {
    super();

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
  }

  /**
   * Stop automatic detection
   */
  stopAutoDetection(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  /**
   * Get current environment snapshot
   */
  getSnapshot(): EnvironmentSnapshot | null {
    return this.snapshot;
  }

  /**
   * Perform full environment detection
   */
  async detectEnvironment(): Promise<EnvironmentSnapshot> {
    if (this.isDetecting) {
      return this.snapshot!;
    }

    this.isDetecting = true;
    this.emit('detection-started');

    try {
      const [tools, projectContext, systemCapabilities] = await Promise.all([
        this.detectTools(),
        this.detectProjectContext(),
        this.detectSystemCapabilities(),
      ]);

      const suggestions = this.generateSuggestions(tools, projectContext);

      this.snapshot = {
        timestamp: Date.now(),
        tools,
        projectContext,
        systemCapabilities,
        suggestions,
      };

      this.emit('detection-complete', this.snapshot);
      return this.snapshot;
    } catch (error) {
      this.emit('detection-error', error);
      throw error;
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * Detect available development tools
   */
  private async detectTools(): Promise<EnvironmentTool[]> {
    const tools: EnvironmentTool[] = [];

    // Define tools to detect
    const toolDefinitions = [
      // Package Managers
      {
        name: 'npm',
        type: 'package-manager' as const,
        versionFlag: '--version',
      },
      {
        name: 'yarn',
        type: 'package-manager' as const,
        versionFlag: '--version',
      },
      {
        name: 'pnpm',
        type: 'package-manager' as const,
        versionFlag: '--version',
      },
      {
        name: 'bun',
        type: 'package-manager' as const,
        versionFlag: '--version',
      },
      {
        name: 'cargo',
        type: 'package-manager' as const,
        versionFlag: '--version',
      },
      {
        name: 'mix',
        type: 'package-manager' as const,
        versionFlag: '--version',
      },
      {
        name: 'rebar3',
        type: 'package-manager' as const,
        versionFlag: 'version',
      },
      {
        name: 'hex',
        type: 'package-manager' as const,
        versionFlag: '--version',
      },

      // Runtimes
      { name: 'node', type: 'runtime' as const, versionFlag: '--version' },
      { name: 'deno', type: 'runtime' as const, versionFlag: '--version' },
      { name: 'python3', type: 'runtime' as const, versionFlag: '--version' },
      { name: 'python', type: 'runtime' as const, versionFlag: '--version' },
      { name: 'elixir', type: 'runtime' as const, versionFlag: '--version' },
      { name: 'erl', type: 'runtime' as const, versionFlag: '' }, // Special case

      // Compilers
      { name: 'rustc', type: 'compiler' as const, versionFlag: '--version' },
      { name: 'gcc', type: 'compiler' as const, versionFlag: '--version' },
      { name: 'clang', type: 'compiler' as const, versionFlag: '--version' },
      { name: 'gleam', type: 'compiler' as const, versionFlag: '--version' },
      { name: 'tsc', type: 'compiler' as const, versionFlag: '--version' },

      // Build Tools
      { name: 'make', type: 'build-tool' as const, versionFlag: '--version' },
      { name: 'cmake', type: 'build-tool' as const, versionFlag: '--version' },
      { name: 'ninja', type: 'build-tool' as const, versionFlag: '--version' },
      { name: 'docker', type: 'build-tool' as const, versionFlag: '--version' },
      { name: 'podman', type: 'build-tool' as const, versionFlag: '--version' },

      // CLI Tools
      {
        name: 'git',
        type: 'version-control' as const,
        versionFlag: '--version',
      },
      { name: 'nix', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'direnv', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'ripgrep', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'rg', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'fd', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'tree', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'jq', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'curl', type: 'cli-tool' as const, versionFlag: '--version' },
      { name: 'wget', type: 'cli-tool' as const, versionFlag: '--version' },
    ];

    // Detect each tool in parallel
    const detectionPromises = toolDefinitions.map(async (tool) => {
      try {
        const available = await this.isCommandAvailable(tool.name);
        let version: string | undefined;
        let path: string | undefined;
        let capabilities: string[] = [];

        if (available) {
          // Get path
          try {
            const { stdout: pathOutput } = await execAsync(
              `which ${tool.name}`
            );
            path = pathOutput.trim();
          } catch {
            // Path not available
          }

          // Get version
          if (tool.versionFlag) {
            try {
              const { stdout: versionOutput } = await execAsync(
                `${tool.name} ${tool.versionFlag}`,
                { timeout: 5000 }
              );
              version = this.extractVersion(versionOutput);
            } catch {
              // Version not available
            }
          }

          // Special case for Erlang
          if (tool.name === 'erl') {
            try {
              const { stdout: erlVersion } = await execAsync(
                'erl -eval "erlang:display(erlang:system_info(otp_release)), halt()." -noshell',
                { timeout: 3000 }
              );
              version = erlVersion.replace(/"/g, '').trim();
            } catch {
              version = 'unknown';
            }
          }

          // Detect capabilities based on tool
          capabilities = await this.detectToolCapabilities(tool.name);
        }

        return {
          name: tool.name,
          type: tool.type,
          available,
          version,
          path,
          capabilities,
        } as EnvironmentTool;
      } catch (error) {
        return {
          name: tool.name,
          type: tool.type,
          available: false,
        } as EnvironmentTool;
      }
    });

    const results = await Promise.allSettled(detectionPromises);
    return results
      .filter((result) => result.status === 'fulfilled')
      .map(
        (result) => (result as PromiseFulfilledResult<EnvironmentTool>).value
      );
  }

  /**
   * Check if a command is available
   */
  private async isCommandAvailable(command: string): Promise<boolean> {
    try {
      await execAsync(`which ${command}`, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract version from command output
   */
  private extractVersion(output: string): string {
    // Common version patterns
    const patterns = [
      /v?(\d+\.\d+\.\d+)/,
      /version\s+(\d+\.\d+\.\d+)/i,
      /(\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Return first line if no pattern matches
    return output.split('\n')[0].trim().substring(0, 50);
  }

  /**
   * Detect tool-specific capabilities
   */
  private async detectToolCapabilities(toolName: string): Promise<string[]> {
    const capabilities: string[] = [];

    switch (toolName) {
      case 'nix':
        try {
          await execAsync('nix flake --help', { timeout: 2000 });
          capabilities.push('flakes');
        } catch {
          // Flakes not available
        }
        break;

      case 'docker':
        try {
          await execAsync('docker compose --help', { timeout: 2000 });
          capabilities.push('compose');
        } catch {
          // Docker Compose not available
        }
        break;

      case 'git':
        try {
          const { stdout } = await execAsync('git config --get user.name', {
            timeout: 2000,
          });
          if (stdout.trim()) capabilities.push('configured');
        } catch {
          // Git not configured
        }
        break;
    }

    return capabilities;
  }

  /**
   * Detect project context and files
   */
  private async detectProjectContext(): Promise<ProjectContext> {
    const context: ProjectContext = {
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
    };

    try {
      // Check for common project files
      const projectFiles = [
        'package.json',
        'Cargo.toml',
        'mix.exs',
        'flake.nix',
        'shell.nix',
        'Dockerfile',
        '.gitignore',
      ];

      for (const file of projectFiles) {
        try {
          await access(join(this.projectRoot, file));
          switch (file) {
            case 'package.json':
              context.hasPackageJson = true;
              context.languages.push('JavaScript/TypeScript');
              break;
            case 'Cargo.toml':
              context.hasCargoToml = true;
              context.languages.push('Rust');
              break;
            case 'mix.exs':
              context.hasMixExs = true;
              context.languages.push('Elixir');
              break;
            case 'flake.nix':
              context.hasFlakeNix = true;
              context.buildTools.push('Nix Flakes');
              break;
            case 'shell.nix':
              context.hasShellNix = true;
              context.buildTools.push('Nix Shell');
              break;
            case 'Dockerfile':
              context.hasDockerfile = true;
              context.buildTools.push('Docker');
              break;
            case '.gitignore':
              context.hasGitignore = true;
              break;
          }
        } catch {
          // File doesn't exist
        }
      }

      // Detect languages from file extensions
      const languageExtensions = await this.scanForLanguages();
      context.languages.push(...languageExtensions);

      // Remove duplicates
      context.languages = [...new Set(context.languages)];
    } catch (error) {
      this.logger.error('Failed to detect project context:', error);
    }

    return context;
  }

  /**
   * Scan for programming languages by file extensions
   */
  private async scanForLanguages(): Promise<string[]> {
    const languages: string[] = [];
    const extensionMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React',
      '.tsx': 'React TypeScript',
      '.py': 'Python',
      '.rs': 'Rust',
      '.go': 'Go',
      '.java': 'Java',
      '.ex': 'Elixir',
      '.exs': 'Elixir Script',
      '.erl': 'Erlang',
      '.hrl': 'Erlang Header',
      '.gleam': 'Gleam',
      '.c': 'C',
      '.cpp': 'C++',
      '.cs': 'C#',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.clj': 'Clojure',
    };

    try {
      const entries = await readdir(this.projectRoot, { withFileTypes: true });

      for (const entry of entries.slice(0, 50)) {
        // Limit to avoid performance issues
        if (entry.isFile()) {
          const ext = entry.name.substring(entry.name.lastIndexOf('.'));
          if (extensionMap[ext]) {
            languages.push(extensionMap[ext]);
          }
        }
      }
    } catch {
      // Directory scan failed
    }

    return [...new Set(languages)];
  }

  /**
   * Detect system capabilities
   */
  private async detectSystemCapabilities(): Promise<SystemCapabilities> {
    const capabilities: SystemCapabilities = {
      operatingSystem: process.platform,
      architecture: process.arch,
      containers: {
        docker: false,
        podman: false,
      },
      virtualization: {
        available: false,
      },
    };

    // Detect Node.js version
    capabilities.nodeVersion = process.version;

    // Detect Python version
    try {
      const { stdout } = await execAsync('python3 --version', {
        timeout: 2000,
      });
      capabilities.pythonVersion = this.extractVersion(stdout);
    } catch {
      try {
        const { stdout } = await execAsync('python --version', {
          timeout: 2000,
        });
        capabilities.pythonVersion = this.extractVersion(stdout);
      } catch {
        // Python not available
      }
    }

    // Detect Rust version
    try {
      const { stdout } = await execAsync('rustc --version', { timeout: 2000 });
      capabilities.rustVersion = this.extractVersion(stdout);
    } catch {
      // Rust not available
    }

    // Detect container runtimes
    capabilities.containers.docker = await this.isCommandAvailable('docker');
    capabilities.containers.podman = await this.isCommandAvailable('podman');

    return capabilities;
  }

  /**
   * Generate intelligent suggestions based on detected environment
   */
  private generateSuggestions(
    tools: EnvironmentTool[],
    context: ProjectContext
  ): string[] {
    const suggestions: string[] = [];

    // Nix suggestions
    const nixTool = tools.find((t) => t.name === 'nix');
    if (!nixTool?.available) {
      suggestions.push(
        '🚀 Install Nix for reproducible development environments'
      );
    } else if (!nixTool.capabilities?.includes('flakes')) {
      suggestions.push('⚡ Enable Nix flakes for better project management');
    }

    // Project-specific suggestions
    if (
      context.hasPackageJson &&
      !tools.find((t) => t.name === 'npm')?.available
    ) {
      suggestions.push('📦 Install npm for Node.js package management');
    }

    if (
      context.hasMixExs &&
      !tools.find((t) => t.name === 'elixir')?.available
    ) {
      suggestions.push('💧 Install Elixir for this Mix project');
    }

    if (
      context.hasCargoToml &&
      !tools.find((t) => t.name === 'cargo')?.available
    ) {
      suggestions.push('🦀 Install Rust for this Cargo project');
    }

    // Development workflow suggestions
    if (
      !context.hasGitignore &&
      tools.find((t) => t.name === 'git')?.available
    ) {
      suggestions.push('📝 Add .gitignore file for better version control');
    }

    if (!context.hasFlakeNix && nixTool?.available) {
      suggestions.push('❄️ Consider adding flake.nix for reproducible builds');
    }

    return suggestions;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: EnvironmentTool['type']): EnvironmentTool[] {
    return this.snapshot?.tools.filter((tool) => tool.type === category) || [];
  }

  /**
   * Get available tools only
   */
  getAvailableTools(): EnvironmentTool[] {
    return this.snapshot?.tools.filter((tool) => tool.available) || [];
  }

  /**
   * Check if specific tool is available
   */
  isToolAvailable(toolName: string): boolean {
    return this.snapshot?.tools.find((tool) => tool.name === toolName)
      ?.available;
  }
}

export default EnvironmentDetector;
