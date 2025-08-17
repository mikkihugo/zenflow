/**
 * Nix Integration for Claude Code Zen
 *
 * Detects Nix environment, available packages, and helps with setup
 */

import { exec } from 'node:child_process';
import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface NixPackage {
  name: string;
  version?: string;
  description?: string;
  available: boolean;
  installed: boolean;
  category: 'beam' | 'nodejs' | 'system' | 'dev-tools' | 'other';
}

export interface NixEnvironment {
  nixAvailable: boolean;
  flakesEnabled: boolean;
  currentShell: string | null;
  packages: NixPackage[];
  suggestedSetup: string[];
}

export class NixIntegration {
  private cachePath: string;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(private projectRoot: string = process.cwd()) {
    this.cachePath = join(projectRoot, '.cache', 'nix-integration.json');
  }

  /**
   * Detect full Nix environment and available packages
   */
  async detectEnvironment(): Promise<NixEnvironment> {
    try {
      // Check cache first
      const cached = await this.loadCache();
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      const nixAvailable = await this.isNixAvailable();
      const flakesEnabled = nixAvailable
        ? await this.areFlakesEnabled()
        : false;
      const currentShell = nixAvailable ? await this.getCurrentShell() : null;
      const packages = nixAvailable ? await this.scanAvailablePackages() : [];
      const suggestedSetup = this.generateSetupSuggestions(
        nixAvailable,
        flakesEnabled,
        packages
      );

      const environment: NixEnvironment = {
        nixAvailable,
        flakesEnabled,
        currentShell,
        packages,
        suggestedSetup,
      };

      // Cache the results
      await this.saveCache(environment);
      return environment;
    } catch (error) {
      console.error('Failed to detect Nix environment:', error);
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
  }

  /**
   * Check if Nix is available on the system
   */
  private async isNixAvailable(): Promise<boolean> {
    try {
      await execAsync('which nix');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Nix flakes are enabled
   */
  private async areFlakesEnabled(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('nix --version');
      const version = stdout.trim();

      // Check if flakes are enabled by trying a flake command
      try {
        await execAsync('nix flake --help', { timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Get current Nix shell information
   */
  private async getCurrentShell(): Promise<string | null> {
    try {
      // Check if we're in a nix-shell
      if (process.env.IN_NIX_SHELL) {
        return 'nix-shell';
      }

      // Check if we're in a flake dev shell
      if (process.env.FLAKE_DEVSHELL) {
        return 'flake-devshell';
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Scan for available and relevant Nix packages
   */
  private async scanAvailablePackages(): Promise<NixPackage[]> {
    const packages: NixPackage[] = [];

    // Define packages we care about for Claude Code Zen
    const relevantPackages = [
      // BEAM ecosystem
      {
        name: 'erlang',
        category: 'beam' as const,
        description: 'Erlang/OTP runtime',
      },
      {
        name: 'elixir',
        category: 'beam' as const,
        description: 'Elixir programming language',
      },
      {
        name: 'gleam',
        category: 'beam' as const,
        description: 'Gleam programming language',
      },
      {
        name: 'rebar3',
        category: 'beam' as const,
        description: 'Erlang build tool',
      },

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
        // Check if package is available in nixpkgs
        const available = await this.isPackageAvailable(pkg.name);

        // Check if package is currently installed/accessible
        const installed = await this.isPackageInstalled(pkg.name);

        packages.push({
          name: pkg.name,
          description: pkg.description,
          category: pkg.category,
          available,
          installed,
        });
      } catch (error) {
        console.error(`Failed to check package ${pkg.name}:`, error);
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
   * Check if a package is available in nixpkgs
   */
  private async isPackageAvailable(packageName: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `nix-env -qaP ${packageName} | head -1`,
        { timeout: 5000 }
      );
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if a package is currently installed/accessible
   */
  private async isPackageInstalled(packageName: string): Promise<boolean> {
    try {
      // Extract binary name from package name
      let binaryName = packageName;
      if (packageName.includes('.')) {
        binaryName = packageName.split('.').pop() || packageName;
      }
      if (packageName.includes('_')) {
        binaryName = packageName.split('_')[0];
      }

      await execAsync(`which ${binaryName}`, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate setup suggestions based on environment
   */
  private generateSetupSuggestions(
    nixAvailable: boolean,
    flakesEnabled: boolean,
    packages: NixPackage[]
  ): string[] {
    const suggestions: string[] = [];

    if (!nixAvailable) {
      suggestions.push(
        'Install Nix: curl -L https://nixos.org/nix/install | sh'
      );
      return suggestions;
    }

    if (!flakesEnabled) {
      suggestions.push(
        'Enable Nix flakes: echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf'
      );
    }

    // Check if flake.nix exists
    const hasFlakeNix = this.hasFlakeNix();
    if (hasFlakeNix) {
      suggestions.push('Enter development shell: nix develop');
    } else {
      suggestions.push(
        'Create flake.nix for reproducible development environment'
      );
    }

    // Suggest missing BEAM packages
    const beamPackages = packages.filter((p) => p.category === 'beam');
    const missingBeam = beamPackages.filter((p) => p.available && !p.installed);
    if (missingBeam.length > 0) {
      suggestions.push(
        `Install BEAM tools: nix-shell -p ${missingBeam.map((p) => p.name).join(' ')}`
      );
    }

    // Suggest missing dev tools
    const devTools = packages.filter((p) => p.category === 'dev-tools');
    const missingDev = devTools.filter((p) => p.available && !p.installed);
    if (missingDev.length > 0) {
      suggestions.push(
        `Install dev tools: nix-shell -p ${missingDev.map((p) => p.name).join(' ')}`
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
      return require('fs').existsSync(flakePath);
    } catch {
      return false;
    }
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
      if (this.hasFlakeNix()) {
        steps.push('✓ flake.nix already exists');
      } else {
        await this.createFlakeNx();
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
  private async createFlakeNx(): Promise<void> {
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
        beamPackages = pkgs.beam.packages.erlang_27;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js ecosystem
            nodejs_20
            nodePackages.npm
            nodePackages.typescript
            
            # BEAM Language Toolchain
            erlang
            beamPackages.elixir
            beamPackages.gleam
            
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
            echo "📦 BEAM languages: Elixir, Erlang, Gleam"
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
      const configPath = require('os').homedir() + '/.config/nix/nix.conf';
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
      const cacheDir = require('path').dirname(this.cachePath);
      await execAsync(`mkdir -p ${cacheDir}`);

      const cache = {
        timestamp: Date.now(),
        data,
      };

      await writeFile(this.cachePath, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.error('Failed to save Nix cache:', error);
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
    if (env.flakesEnabled) status += ', flakes enabled';
    if (env.currentShell) status += `, in ${env.currentShell}`;
    status += ` • ${installedCount}/${totalCount} packages`;

    return status;
  }
}

export default NixIntegration;
