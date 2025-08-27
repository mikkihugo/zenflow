/**
 * @fileoverview Environment Detection System
 *
 * Comprehensive environment auto-detection system for universal development
 * environment discovery and project context analysis.
 *
 * @example Basic Environment Detection
 * ```typescript
 * import { EnvironmentDetector } from '@claude-zen/foundation';
 *
 * const detector = new EnvironmentDetector();
 * const env = await detector.detect('/path/to/project');
 *
 * console.log('Node version:', env.runtime.node);
 * console.log('Package manager:', env.packageManager.type);
 * console.log('Available tools:', env.tools);
 * ```
 *
 * @example Advanced Usage with Caching
 * ```typescript
 * const detector = new EnvironmentDetector({
 *   useCache: true,
 *   cacheTimeout: 300000, // 5 minutes
 * });
 *
 * const environments = await detector.detectMultiple([
 *   '/path/to/project1',
 *   '/path/to/project2'
 * ]);
 * ```
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 */
import { exec } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { EventEmitter } from "../../events/event-emitter.js";
import { WorkspaceDetector, } from "../../utilities/system/index.js";
import { getLogger } from "../logging/index.js";
const execAsync = promisify(exec);
// Constants for common tool types and commands
const PACKAGE_MANAGER_TYPE = "package-manager";
const VERSION_CMD = " --version";
const BUILD_TOOL_TYPE = "build-tool";
const COMPILER_TYPE = "compiler";
/**
 * Specialized error for environment detection failures.
 * Provides context about which tool or component caused the failure.
 *
 * @class EnvironmentDetectionError
 * @extends Error
 */
export class EnvironmentDetectionError extends Error {
    tool;
    constructor(message, tool) {
        super(message);
        this.tool = tool;
        this.name = "EnvironmentDetectionError";
    }
}
// ============================================================================
// ENHANCED ENVIRONMENT DETECTOR WITH FOUNDATION INTEGRATION
// ============================================================================
/**
 * Comprehensive environment detection system for universal development environment discovery.
 * Provides auto-detection of tools, project context, system capabilities, and Nix integration.
 *
 * @class EnvironmentDetector
 * @extends TypedEventBase<ServiceEvents>
 *
 * @example Basic Usage
 * ```typescript
 * const detector = new EnvironmentDetector();
 * const env = await detector.detectEnvironment();
 * console.log('Available tools:', env.tools.filter(t => t.available));
 * ```
 *
 * @example With Caching and Auto-refresh
 * ```typescript
 * const detector = new EnvironmentDetector('/project/path', true, 30000);
 * detector.on('service-started', (event) => {
 *   console.log('Detection completed:', event.serviceName);
 * });
 * ```
 */
export class EnvironmentDetector extends EventEmitter {
    projectRoot;
    refreshInterval;
    snapshot = null;
    detectionInterval = null;
    isDetecting = false;
    logger;
    workspaceDetector;
    constructor(projectRoot = process.cwd(), autoRefresh = true, refreshInterval = 30000, // 30 seconds
    logger) {
        super({
            captureRejections: true,
        });
        this.projectRoot = projectRoot;
        this.refreshInterval = refreshInterval;
        this.logger = logger || getLogger("EnvironmentDetector");
        // Initialize workspace detector for comprehensive environment analysis
        this.workspaceDetector = null;
        if (autoRefresh) {
            this.startAutoDetection();
        }
    }
    /**
     * Starts automatic environment detection with periodic refresh.
     * Sets up interval-based detection to keep environment information current.
     */
    startAutoDetection() {
        if (this.detectionInterval) {
            return;
        }
        // Initial detection
        this.detectEnvironment();
        // Set up periodic detection
        this.detectionInterval = setInterval(() => {
            this.detectEnvironment();
        }, this.refreshInterval);
        this.logger.info(`Started auto-detection with ${this.refreshInterval}ms interval`);
    }
    /**
     * Stops automatic environment detection and clears the refresh interval.
     */
    stopAutoDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
            this.logger.info("Stopped auto-detection");
        }
    }
    /**
     * Performs comprehensive environment detection across all systems.
     * Detects tools, project context, system capabilities, and Nix environment.
     *
     * @returns Complete environment snapshot
     * @throws {EnvironmentDetectionError} When detection fails
     */
    async detectEnvironment() {
        if (this.isDetecting) {
            return this.snapshot || this.createEmptySnapshot();
        }
        this.isDetecting = true;
        this.logger.info("Starting environment detection...");
        try {
            const [tools, projectContext, systemCapabilities, nixEnvironment] = await Promise.all([
                this.detectTools(),
                this.detectProjectContext(),
                this.detectSystemCapabilities(),
                this.detectNixEnvironment(),
            ]);
            const suggestions = this.generateSuggestions(tools, projectContext, systemCapabilities, nixEnvironment);
            this.snapshot = {
                timestamp: Date.now(),
                tools,
                projectContext,
                systemCapabilities,
                nixEnvironment,
                suggestions,
            };
            this.emit("service-started", {
                serviceName: "environment-detector",
                timestamp: new Date(),
            });
            this.logger.info("Environment detection completed", {
                toolsFound: tools.filter((t) => t.available).length,
                totalTools: tools.length,
                languages: projectContext.languages,
                workspace: projectContext.workspace?.tool,
            });
            return this.snapshot;
        }
        catch (error) {
            this.logger.error("Environment detection failed:", error);
            throw new EnvironmentDetectionError(`Failed to detect environment: ${error instanceof Error ? error['message'] : "Unknown error"}`);
        }
        finally {
            this.isDetecting = false;
        }
    }
    /**
     * Detect available development tools
     */
    async detectTools() {
        const toolsToDetect = this.getToolDefinitions();
        const results = await this.detectToolsParallel(toolsToDetect);
        return this.processToolResults(results, toolsToDetect);
    }
    /**
     * Get predefined tool definitions
     */
    getToolDefinitions() {
        return [
            // Package Managers
            {
                name: "npm",
                type: PACKAGE_MANAGER_TYPE,
                command: `npm${VERSION_CMD}`,
            },
            {
                name: "yarn",
                type: PACKAGE_MANAGER_TYPE,
                command: `yarn${VERSION_CMD}`,
            },
            {
                name: "pnpm",
                type: PACKAGE_MANAGER_TYPE,
                command: `pnpm${VERSION_CMD}`,
            },
            {
                name: "bun",
                type: PACKAGE_MANAGER_TYPE,
                command: `bun${VERSION_CMD}`,
            },
            // Runtimes
            { name: "node", type: "runtime", command: "node --version" },
            { name: "deno", type: "runtime", command: "deno --version" },
            { name: "python", type: "runtime", command: "python --version" },
            {
                name: "python3",
                type: "runtime",
                command: "python3 --version",
            },
            { name: "rust", type: "runtime", command: "rustc --version" },
            // Build Tools
            {
                name: "cargo",
                type: BUILD_TOOL_TYPE,
                command: "cargo --version",
            },
            { name: "go", type: COMPILER_TYPE, command: "go version" },
            { name: "gcc", type: "compiler", command: "gcc --version" },
            { name: "clang", type: "compiler", command: "clang --version" },
            // CLI Tools
            {
                name: "git",
                type: "version-control",
                command: "git --version",
            },
            {
                name: "docker",
                type: "cli-tool",
                command: "docker --version",
            },
            {
                name: "podman",
                type: "cli-tool",
                command: "podman --version",
            },
            // Build Systems
            { name: "nx", type: "build-tool", command: "nx --version" },
            {
                name: "turbo",
                type: BUILD_TOOL_TYPE,
                command: "turbo --version",
            },
            {
                name: "lerna",
                type: BUILD_TOOL_TYPE,
                command: "lerna --version",
            },
            // Nix ecosystem
            {
                name: "nix",
                type: PACKAGE_MANAGER_TYPE,
                command: "nix --version",
            },
            {
                name: "nix-shell",
                type: "cli-tool",
                command: "nix-shell --version",
            },
        ];
    }
    /**
     * Detect tools in parallel
     */
    async detectToolsParallel(toolsToDetect) {
        return await Promise.allSettled(toolsToDetect.map(async (tool) => {
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
            }
            catch (error) {
                this.logToolDetectionFailure(tool, error);
                return {
                    name: tool.name,
                    type: tool.type,
                    available: false,
                };
            }
        }));
    }
    /**
     * Log tool detection failure for security audit
     */
    logToolDetectionFailure(tool, error) {
        this.logger.debug("Tool detection failed - security audit", {
            toolName: tool.name,
            toolType: tool.type,
            error: error instanceof Error ? error['message'] : String(error),
        });
    }
    /**
     * Process tool detection results
     */
    processToolResults(results, toolsToDetect) {
        return results.map((result, index) => result.status === "fulfilled"
            ? result.value
            : {
                name: toolsToDetect[index]?.name || "unknown",
                type: toolsToDetect[index]?.type || "cli-tool",
                available: false,
            });
    }
    /**
     * Detect project context with workspace integration
     */
    async detectProjectContext() {
        const projectFiles = [
            "package.json",
            "Cargo.toml",
            "mix.exs",
            "flake.nix",
            "shell.nix",
            "Dockerfile",
            ".gitignore",
        ];
        const fileChecks = await Promise.allSettled(projectFiles.map((file) => access(join(this.projectRoot, file))
            .then(() => true)
            .catch(() => false)));
        // Integrate with workspace detector for comprehensive project analysis
        let workspace;
        try {
            // Initialize workspace detector if not already done
            if (!this.workspaceDetector) {
                this.workspaceDetector = new WorkspaceDetector();
            }
            const detected = await this.workspaceDetector.detectWorkspaceRoot(this.projectRoot);
            workspace = detected ?? undefined;
        }
        catch (error) {
            this.logger.warn("Failed to detect workspace:", error);
            workspace = undefined;
        }
        // Detect languages and frameworks
        const languages = await this.detectLanguages();
        const frameworks = await this.detectFrameworks();
        const buildTools = await this.detectBuildTools();
        return {
            hasPackageJson: Boolean(fileChecks[0]?.status === "fulfilled" && fileChecks[0].value),
            hasCargoToml: Boolean(fileChecks[1]?.status === "fulfilled" && fileChecks[1].value),
            hasMixExs: Boolean(fileChecks[2]?.status === "fulfilled" && fileChecks[2].value),
            hasFlakeNix: Boolean(fileChecks[3]?.status === "fulfilled" && fileChecks[3].value),
            hasShellNix: Boolean(fileChecks[4]?.status === "fulfilled" && fileChecks[4].value),
            hasDockerfile: Boolean(fileChecks[5]?.status === "fulfilled" && fileChecks[5].value),
            hasGitignore: Boolean(fileChecks[6]?.status === "fulfilled" && fileChecks[6].value),
            languages,
            frameworks,
            buildTools,
            workspace,
        };
    }
    /**
     * Detect system capabilities
     */
    async detectSystemCapabilities() {
        const os = process.platform;
        const { arch, version } = process;
        // Check for containerization
        const dockerAvailable = await this.checkCommandExists("docker");
        const podmanAvailable = await this.checkCommandExists("podman");
        // Basic virtualization detection
        const virtualizationAvailable = dockerAvailable || podmanAvailable;
        return {
            operatingSystem: os,
            architecture: arch,
            nodeVersion: version,
            containers: {
                docker: dockerAvailable,
                podman: podmanAvailable,
            },
            virtualization: {
                available: virtualizationAvailable,
                type: dockerAvailable
                    ? "docker"
                    : podmanAvailable
                        ? "podman"
                        : undefined,
            },
        };
    }
    /**
     * Detect Nix environment and available packages
     */
    async detectNixEnvironment() {
        try {
            // Check if Nix is available
            const nixTool = await this.checkCommandExists("nix");
            if (!nixTool) {
                return {
                    nixAvailable: false,
                    flakesEnabled: false,
                    currentShell: null,
                    packages: [],
                    suggestedSetup: [
                        "Install Nix: curl -L https://nixos.org/nix/install|sh",
                    ],
                };
            }
            const flakesEnabled = await this.areFlakesEnabled();
            const currentShell = this.getCurrentNixShell();
            const packages = await this.scanAvailableNixPackages();
            const suggestedSetup = this.generateNixSetupSuggestions(flakesEnabled, packages);
            return {
                nixAvailable: true,
                flakesEnabled,
                currentShell,
                packages,
                suggestedSetup,
            };
        }
        catch (error) {
            this.logger.error("Failed to detect Nix environment:", error);
            return undefined;
        }
    }
    /**
     * Check if Nix flakes are enabled
     */
    async areFlakesEnabled() {
        try {
            await execAsync("nix flake --help", { timeout: 2000 });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get current Nix shell information
     */
    getCurrentNixShell() {
        if (process.env['IN_NIX_SHELL']) {
            return "nix-shell";
        }
        if (process.env['FLAKE_DEVSHELL']) {
            return "flake-devshell";
        }
        return null;
    }
    /**
     * Scan for available and relevant Nix packages
     */
    async scanAvailableNixPackages() {
        const packages = [];
        const relevantPackages = [
            // Node.js ecosystem
            {
                name: "nodejs_20",
                category: "nodejs",
                description: "Node.js runtime v20",
            },
            {
                name: "nodejs_18",
                category: "nodejs",
                description: "Node.js runtime v18",
            },
            {
                name: "nodePackages.npm",
                category: "nodejs",
                description: "NPM package manager",
            },
            {
                name: "nodePackages.typescript",
                category: "nodejs",
                description: "TypeScript compiler",
            },
            // Development tools
            {
                name: "git",
                category: "dev-tools",
                description: "Version control system",
            },
            {
                name: "ripgrep",
                category: "dev-tools",
                description: "Fast text search tool",
            },
            {
                name: "fd",
                category: "dev-tools",
                description: "Fast file finder",
            },
            {
                name: "tree",
                category: "dev-tools",
                description: "Directory tree viewer",
            },
            {
                name: "jq",
                category: "dev-tools",
                description: "JSON processor",
            },
            // System utilities
            { name: "curl", category: "system", description: "HTTP client" },
            {
                name: "wget",
                category: "system",
                description: "Web downloader",
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
            }
            catch (error) {
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
    async isNixPackageAvailable(packageName) {
        try {
            const { stdout } = await execAsync(`nix-env -qaP ${packageName}|head -1`, { timeout: 5000 });
            return stdout.trim().length > 0;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if a Nix package is currently installed/accessible
     */
    async isNixPackageInstalled(packageName) {
        try {
            // Extract binary name from package name
            let binaryName = packageName;
            if (packageName.includes(".")) {
                const parts = packageName.split(".");
                binaryName = parts[parts.length - 1] || packageName;
            }
            if (packageName.includes("_")) {
                const parts = packageName.split("_");
                binaryName = parts[0] || packageName;
            }
            return await this.checkCommandExists(binaryName);
        }
        catch {
            return false;
        }
    }
    /**
     * Generate Nix-specific setup suggestions
     */
    generateNixSetupSuggestions(flakesEnabled, packages) {
        const suggestions = [];
        if (!flakesEnabled) {
            suggestions.push('Enable Nix flakes: echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf');
        }
        // Check if flake.nix exists
        const hasFlakeNix = this.hasFlakeNix();
        if (hasFlakeNix) {
            suggestions.push("Enter development shell: nix develop");
        }
        else {
            suggestions.push("Create flake.nix for reproducible development environment");
        }
        // No BEAM-specific suggestions (foundation focuses on claude-zen core)
        // Suggest missing dev tools
        const devTools = packages.filter((p) => p.category === "dev-tools");
        const missingDev = devTools.filter((p) => p.available && !p.installed);
        if (missingDev.length > 0) {
            suggestions.push(`Install dev tools: nix-shell -p ${missingDev.map((p) => p.name).join(" ")}`);
        }
        return suggestions;
    }
    /**
     * Check if flake.nix exists in project
     */
    hasFlakeNix() {
        try {
            const flakePath = join(this.projectRoot, "flake.nix");
            return existsSync(flakePath);
        }
        catch {
            return false;
        }
    }
    /**
     * Generate environment-based suggestions
     */
    generateSuggestions(tools, projectContext, systemCapabilities, nixEnvironment) {
        const suggestions = [];
        // Package manager suggestions
        if (projectContext.hasPackageJson &&
            !tools.some((t) => t.name === "pnpm" && t.available)) {
            suggestions.push("Consider installing pnpm for faster package management");
        }
        // Monorepo tool suggestions
        if (projectContext.workspace &&
            !tools.some((t) => t.name === "nx" && t.available)) {
            suggestions.push("Consider installing Nx for better monorepo management");
        }
        // Container suggestions
        if (!systemCapabilities.containers.docker &&
            !systemCapabilities.containers.podman) {
            suggestions.push("Consider installing Docker for containerized development");
        }
        // Nix-specific suggestions
        if (nixEnvironment) {
            suggestions.push(...nixEnvironment.suggestedSetup);
        }
        return suggestions;
    }
    // Helper methods
    parseVersion(output) {
        const versionMatch = output.match(/v?(\d+\.\d+\.\d+)/);
        return versionMatch?.[1] || output.split("\n")[0] || "unknown";
    }
    async checkCommandExists(command) {
        try {
            await execAsync(`which ${command}`, { timeout: 2000 });
            return true;
        }
        catch {
            return false;
        }
    }
    detectToolCapabilities(toolName) {
        // Security audit: tracking tool capability detection for security analysis
        this.logger.debug("Detecting tool capabilities for security audit", {
            toolName,
        });
        // Tool-specific capability detection could be implemented here
        return [];
    }
    detectLanguages() {
        // Implementation would check for language files
        const languages = [];
        return languages;
    }
    detectFrameworks() {
        // Framework detection logic
        return [];
    }
    detectBuildTools() {
        // Build tools detection logic
        return [];
    }
    createEmptySnapshot() {
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
    getSnapshot() {
        return this.snapshot;
    }
    async refreshEnvironment() {
        return await this.detectEnvironment();
    }
    getAvailableTools() {
        return this.snapshot?.tools.filter((t) => t.available) || [];
    }
    hasTools(...toolNames) {
        const availableTools = this.getAvailableTools();
        return toolNames.every((name) => availableTools.some((tool) => tool.name === name));
    }
    /**
     * Get Nix environment information
     */
    getNixEnvironment() {
        return this.snapshot?.nixEnvironment || null;
    }
    /**
     * Check if Nix is available
     */
    hasNix() {
        return this.getNixEnvironment()?.nixAvailable || false;
    }
    /**
     * Check if currently in a Nix shell
     */
    isInNixShell() {
        return this.getNixEnvironment()?.currentShell !== null;
    }
    /**
     * Get installed Nix packages
     */
    getInstalledNixPackages() {
        return this.getNixEnvironment()?.packages.filter((p) => p.installed) || [];
    }
    /**
     * Cleanup resources and stop all intervals to prevent memory leaks
     */
    cleanup() {
        // Stop auto-detection interval
        this.stopAutoDetection();
        // Remove all event listeners
        this.removeAllListeners();
        // Clear snapshot
        this.snapshot = null;
        this.logger.info("Environment detector cleanup completed");
    }
    /**
     * Dispose of the environment detector (alias for cleanup)
     */
    dispose() {
        this.cleanup();
    }
}
// ============================================================================
// NIX INTEGRATION CLASS WITH AUTO-SETUP
// ============================================================================
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
 * ```typescript
 * const nix = new NixIntegration('/project/path');
 * const result = await nix.autoSetup();
 * if (result.success) {
 *   console.log('Nix setup completed:', result.steps);
 * }
 * ```
 */
export class NixIntegration {
    projectRoot;
    environmentDetector;
    logger;
    cachePath;
    cacheExpiry = 5 * 60 * 1000; // 5 minutes
    constructor(projectRoot = process.cwd(), environmentDetector, logger) {
        this.projectRoot = projectRoot;
        this.environmentDetector = environmentDetector;
        this.logger = logger || getLogger("NixIntegration");
        this.cachePath = join(projectRoot, ".cache", "nix-integration.json");
        // Create environment detector if not provided
        if (!this.environmentDetector) {
            this.environmentDetector = new EnvironmentDetector(projectRoot, false, 30000, this.logger);
        }
    }
    /**
     * Detects and returns the complete Nix environment with caching.
     *
     * @returns Complete Nix environment information
     * @throws {Error} When environment detector is not initialized
     */
    async detectEnvironment() {
        // Check cache first
        const cached = await this.loadCache();
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        // Use environment detector to get Nix environment
        if (!this.environmentDetector) {
            throw new Error("Environment detector not initialized");
        }
        const snapshot = await this.environmentDetector.detectEnvironment();
        const nixEnvironment = snapshot.nixEnvironment || {
            nixAvailable: false,
            flakesEnabled: false,
            currentShell: null,
            packages: [],
            suggestedSetup: [
                "Install Nix: curl -L https://nixos.org/nix/install | sh",
            ],
        };
        // Cache the results
        await this.saveCache(nixEnvironment);
        return nixEnvironment;
    }
    /**
     * Automatically sets up Nix environment for Claude Code Zen development.
     * Creates flake.nix, enables flakes, and configures development shell.
     *
     * @returns Setup result with success status, steps performed, and any errors
     */
    async autoSetup() {
        const steps = [];
        const errors = [];
        try {
            const env = await this.detectEnvironment();
            if (!env.nixAvailable) {
                errors.push("Nix is not installed. Please install Nix first.");
                return { success: false, steps, errors };
            }
            steps.push("✓ Nix is available");
            // Create flake.nix if it doesn't exist
            const hasFlakeNix = this.hasFlakeNix();
            if (hasFlakeNix) {
                steps.push("✓ flake.nix already exists");
            }
            else {
                await this.createFlakeNix();
                steps.push("✓ Created flake.nix with BEAM language support");
            }
            // Enable flakes if not enabled
            if (env.flakesEnabled) {
                steps.push("✓ Nix flakes already enabled");
            }
            else {
                try {
                    await this.enableFlakes();
                    steps.push("✓ Enabled Nix flakes");
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
    /**
     * Create a flake.nix file for the project
     */
    async createFlakeNix() {
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
        devShells['default'] = pkgs.mkShell {
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
          
          shellHook = '
            echo "🚀 Claude Code Zen Development Environment"
            echo "📦 TypeScript/Node.js development ready"
            echo "🛠️  Ready for development!"
          ';
        };
      });
}`;
        await writeFile(join(this.projectRoot, "flake.nix"), flakeContent);
    }
    /**
     * Enable Nix flakes
     */
    async enableFlakes() {
        try {
            // Create nix config directory if it doesn't exist
            await execAsync("mkdir -p ~/.config/nix");
            // Add flakes configuration
            const configPath = `${homedir()}/.config/nix/nix.conf`;
            const configContent = "experimental-features = nix-command flakes\n";
            try {
                const existing = await readFile(configPath, "utf8");
                if (!existing.includes("experimental-features")) {
                    await writeFile(configPath, existing + configContent);
                }
            }
            catch {
                // File doesn't exist, create it
                await writeFile(configPath, configContent);
            }
        }
        catch (error) {
            throw new Error(`Failed to enable flakes: ${error}`);
        }
    }
    /**
     * Check if flake.nix exists in project with enhanced validation
     */
    hasFlakeNix() {
        try {
            const flakePath = join(this.projectRoot, "flake.nix");
            if (!existsSync(flakePath)) {
                return false;
            }
            // Enhanced validation: check if the flake.nix file is readable and non-empty
            try {
                const content = readFileSync(flakePath, "utf-8");
                return content.trim().length > 0 && content.includes("outputs");
            }
            catch {
                // If we can't read the file, still consider it as existing
                return true;
            }
        }
        catch {
            return false;
        }
    }
    /**
     * Load cached environment data
     */
    async loadCache() {
        try {
            const content = await readFile(this.cachePath, "utf8");
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    /**
     * Save environment data to cache
     */
    async saveCache(data) {
        try {
            const cacheDir = join(this.cachePath, "..");
            await execAsync(`mkdir -p ${cacheDir}`);
            const cache = {
                timestamp: Date.now(),
                data,
            };
            await writeFile(this.cachePath, JSON.stringify(cache, null, 2));
        }
        catch (error) {
            this.logger.error("Failed to save Nix cache:", error);
        }
    }
    /**
     * Get environment summary for TUI display
     */
    async getEnvironmentSummary() {
        const env = await this.detectEnvironment();
        if (!env.nixAvailable) {
            return "❌ Nix not available";
        }
        const installedCount = env.packages.filter((p) => p.installed).length;
        const totalCount = env.packages.length;
        let status = "✓ Nix available";
        if (env.flakesEnabled) {
            status += ", flakes enabled";
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
export const ENVIRONMENT_DETECTOR_TOKEN = Symbol("EnvironmentDetector");
/**
 * DI token for NixIntegration
 */
export const NIX_INTEGRATION_TOKEN = Symbol("NixIntegration");
/**
 * Create EnvironmentDetector with DI
 */
export function createEnvironmentDetector(projectRoot, autoRefresh, logger) {
    return new EnvironmentDetector(projectRoot, autoRefresh, 30000, logger);
}
/**
 * Create NixIntegration with DI
 */
export function createNixIntegration(projectRoot, environmentDetector, logger) {
    return new NixIntegration(projectRoot, environmentDetector, logger);
}
