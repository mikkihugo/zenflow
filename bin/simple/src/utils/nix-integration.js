import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
const execAsync = promisify(exec);
export class NixIntegration {
    projectRoot;
    cachePath;
    cacheExpiry = 5 * 60 * 1000;
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.cachePath = join(projectRoot, '.cache', 'nix-integration.json');
    }
    async detectEnvironment() {
        try {
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
            const suggestedSetup = this.generateSetupSuggestions(nixAvailable, flakesEnabled, packages);
            const environment = {
                nixAvailable,
                flakesEnabled,
                currentShell,
                packages,
                suggestedSetup,
            };
            await this.saveCache(environment);
            return environment;
        }
        catch (error) {
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
    async isNixAvailable() {
        try {
            await execAsync('which nix');
            return true;
        }
        catch {
            return false;
        }
    }
    async areFlakesEnabled() {
        try {
            const { stdout } = await execAsync('nix --version');
            const version = stdout.trim();
            try {
                await execAsync('nix flake --help', { timeout: 2000 });
                return true;
            }
            catch {
                return false;
            }
        }
        catch {
            return false;
        }
    }
    async getCurrentShell() {
        try {
            if (process.env.IN_NIX_SHELL) {
                return 'nix-shell';
            }
            if (process.env.FLAKE_DEVSHELL) {
                return 'flake-devshell';
            }
            return null;
        }
        catch {
            return null;
        }
    }
    async scanAvailablePackages() {
        const packages = [];
        const relevantPackages = [
            {
                name: 'erlang',
                category: 'beam',
                description: 'Erlang/OTP runtime',
            },
            {
                name: 'elixir',
                category: 'beam',
                description: 'Elixir programming language',
            },
            {
                name: 'gleam',
                category: 'beam',
                description: 'Gleam programming language',
            },
            {
                name: 'rebar3',
                category: 'beam',
                description: 'Erlang build tool',
            },
            {
                name: 'nodejs_20',
                category: 'nodejs',
                description: 'Node.js runtime v20',
            },
            {
                name: 'nodejs_18',
                category: 'nodejs',
                description: 'Node.js runtime v18',
            },
            {
                name: 'nodePackages.npm',
                category: 'nodejs',
                description: 'NPM package manager',
            },
            {
                name: 'nodePackages.typescript',
                category: 'nodejs',
                description: 'TypeScript compiler',
            },
            {
                name: 'git',
                category: 'dev-tools',
                description: 'Version control system',
            },
            {
                name: 'ripgrep',
                category: 'dev-tools',
                description: 'Fast text search tool',
            },
            {
                name: 'fd',
                category: 'dev-tools',
                description: 'Fast file finder',
            },
            {
                name: 'tree',
                category: 'dev-tools',
                description: 'Directory tree viewer',
            },
            {
                name: 'jq',
                category: 'dev-tools',
                description: 'JSON processor',
            },
            { name: 'curl', category: 'system', description: 'HTTP client' },
            {
                name: 'wget',
                category: 'system',
                description: 'Web downloader',
            },
        ];
        for (const pkg of relevantPackages) {
            try {
                const available = await this.isPackageAvailable(pkg.name);
                const installed = await this.isPackageInstalled(pkg.name);
                packages.push({
                    name: pkg.name,
                    description: pkg.description,
                    category: pkg.category,
                    available,
                    installed,
                });
            }
            catch (error) {
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
    async isPackageAvailable(packageName) {
        try {
            const { stdout } = await execAsync(`nix-env -qaP ${packageName} | head -1`, { timeout: 5000 });
            return stdout.trim().length > 0;
        }
        catch {
            return false;
        }
    }
    async isPackageInstalled(packageName) {
        try {
            let binaryName = packageName;
            if (packageName.includes('.')) {
                binaryName = packageName.split('.').pop() || packageName;
            }
            if (packageName.includes('_')) {
                binaryName = packageName.split('_')[0];
            }
            await execAsync(`which ${binaryName}`, { timeout: 2000 });
            return true;
        }
        catch {
            return false;
        }
    }
    generateSetupSuggestions(nixAvailable, flakesEnabled, packages) {
        const suggestions = [];
        if (!nixAvailable) {
            suggestions.push('Install Nix: curl -L https://nixos.org/nix/install | sh');
            return suggestions;
        }
        if (!flakesEnabled) {
            suggestions.push('Enable Nix flakes: echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf');
        }
        const hasFlakeNix = this.hasFlakeNix();
        if (hasFlakeNix) {
            suggestions.push('Enter development shell: nix develop');
        }
        else {
            suggestions.push('Create flake.nix for reproducible development environment');
        }
        const beamPackages = packages.filter((p) => p.category === 'beam');
        const missingBeam = beamPackages.filter((p) => p.available && !p.installed);
        if (missingBeam.length > 0) {
            suggestions.push(`Install BEAM tools: nix-shell -p ${missingBeam.map((p) => p.name).join(' ')}`);
        }
        const devTools = packages.filter((p) => p.category === 'dev-tools');
        const missingDev = devTools.filter((p) => p.available && !p.installed);
        if (missingDev.length > 0) {
            suggestions.push(`Install dev tools: nix-shell -p ${missingDev.map((p) => p.name).join(' ')}`);
        }
        return suggestions;
    }
    hasFlakeNix() {
        try {
            const flakePath = join(this.projectRoot, 'flake.nix');
            return require('fs').existsSync(flakePath);
        }
        catch {
            return false;
        }
    }
    async autoSetup() {
        const steps = [];
        const errors = [];
        try {
            const env = await this.detectEnvironment();
            if (!env.nixAvailable) {
                errors.push('Nix is not installed. Please install Nix first.');
                return { success: false, steps, errors };
            }
            steps.push('✓ Nix is available');
            if (this.hasFlakeNix()) {
                steps.push('✓ flake.nix already exists');
            }
            else {
                await this.createFlakeNx();
                steps.push('✓ Created flake.nix with BEAM language support');
            }
            if (env.flakesEnabled) {
                steps.push('✓ Nix flakes already enabled');
            }
            else {
                try {
                    await this.enableFlakes();
                    steps.push('✓ Enabled Nix flakes');
                }
                catch (error) {
                    errors.push(`Failed to enable flakes: ${error}`);
                }
            }
            return { success: errors.length === 0, steps, errors };
        }
        catch (error) {
            errors.push(`Auto-setup failed: ${error}`);
            return { success: false, steps, errors };
        }
    }
    async createFlakeNx() {
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
    async enableFlakes() {
        try {
            await execAsync('mkdir -p ~/.config/nix');
            const configPath = require('os').homedir() + '/.config/nix/nix.conf';
            const configContent = 'experimental-features = nix-command flakes\n';
            try {
                const existing = await readFile(configPath, 'utf8');
                if (!existing.includes('experimental-features')) {
                    await writeFile(configPath, existing + configContent);
                }
            }
            catch {
                await writeFile(configPath, configContent);
            }
        }
        catch (error) {
            throw new Error(`Failed to enable flakes: ${error}`);
        }
    }
    async loadCache() {
        try {
            const content = await readFile(this.cachePath, 'utf8');
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    async saveCache(data) {
        try {
            const cacheDir = require('path').dirname(this.cachePath);
            await execAsync(`mkdir -p ${cacheDir}`);
            const cache = {
                timestamp: Date.now(),
                data,
            };
            await writeFile(this.cachePath, JSON.stringify(cache, null, 2));
        }
        catch (error) {
            console.error('Failed to save Nix cache:', error);
        }
    }
    async getEnvironmentSummary() {
        const env = await this.detectEnvironment();
        if (!env.nixAvailable) {
            return '❌ Nix not available';
        }
        const installedCount = env.packages.filter((p) => p.installed).length;
        const totalCount = env.packages.length;
        let status = '✓ Nix available';
        if (env.flakesEnabled)
            status += ', flakes enabled';
        if (env.currentShell)
            status += `, in ${env.currentShell}`;
        status += ` • ${installedCount}/${totalCount} packages`;
        return status;
    }
}
export default NixIntegration;
//# sourceMappingURL=nix-integration.js.map