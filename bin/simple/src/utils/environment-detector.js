import { exec } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
const execAsync = promisify(exec);
export class EnvironmentDetector extends EventEmitter {
    projectRoot;
    autoRefresh;
    refreshInterval;
    snapshot = null;
    detectionInterval = null;
    isDetecting = false;
    constructor(projectRoot = process.cwd(), autoRefresh = true, refreshInterval = 30000) {
        super();
        this.projectRoot = projectRoot;
        this.autoRefresh = autoRefresh;
        this.refreshInterval = refreshInterval;
        if (autoRefresh) {
            this.startAutoDetection();
        }
    }
    startAutoDetection() {
        if (this.detectionInterval)
            return;
        this.detectEnvironment();
        this.detectionInterval = setInterval(() => {
            this.detectEnvironment();
        }, this.refreshInterval);
    }
    stopAutoDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }
    getSnapshot() {
        return this.snapshot;
    }
    async detectEnvironment() {
        if (this.isDetecting) {
            return this.snapshot;
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
        }
        catch (error) {
            this.emit('detection-error', error);
            throw error;
        }
        finally {
            this.isDetecting = false;
        }
    }
    async detectTools() {
        const tools = [];
        const toolDefinitions = [
            {
                name: 'npm',
                type: 'package-manager',
                versionFlag: '--version',
            },
            {
                name: 'yarn',
                type: 'package-manager',
                versionFlag: '--version',
            },
            {
                name: 'pnpm',
                type: 'package-manager',
                versionFlag: '--version',
            },
            {
                name: 'bun',
                type: 'package-manager',
                versionFlag: '--version',
            },
            {
                name: 'cargo',
                type: 'package-manager',
                versionFlag: '--version',
            },
            {
                name: 'mix',
                type: 'package-manager',
                versionFlag: '--version',
            },
            {
                name: 'rebar3',
                type: 'package-manager',
                versionFlag: 'version',
            },
            {
                name: 'hex',
                type: 'package-manager',
                versionFlag: '--version',
            },
            { name: 'node', type: 'runtime', versionFlag: '--version' },
            { name: 'deno', type: 'runtime', versionFlag: '--version' },
            { name: 'python3', type: 'runtime', versionFlag: '--version' },
            { name: 'python', type: 'runtime', versionFlag: '--version' },
            { name: 'elixir', type: 'runtime', versionFlag: '--version' },
            { name: 'erl', type: 'runtime', versionFlag: '' },
            { name: 'rustc', type: 'compiler', versionFlag: '--version' },
            { name: 'gcc', type: 'compiler', versionFlag: '--version' },
            { name: 'clang', type: 'compiler', versionFlag: '--version' },
            { name: 'gleam', type: 'compiler', versionFlag: '--version' },
            { name: 'tsc', type: 'compiler', versionFlag: '--version' },
            { name: 'make', type: 'build-tool', versionFlag: '--version' },
            { name: 'cmake', type: 'build-tool', versionFlag: '--version' },
            { name: 'ninja', type: 'build-tool', versionFlag: '--version' },
            { name: 'docker', type: 'build-tool', versionFlag: '--version' },
            { name: 'podman', type: 'build-tool', versionFlag: '--version' },
            {
                name: 'git',
                type: 'version-control',
                versionFlag: '--version',
            },
            { name: 'nix', type: 'cli-tool', versionFlag: '--version' },
            { name: 'direnv', type: 'cli-tool', versionFlag: '--version' },
            { name: 'ripgrep', type: 'cli-tool', versionFlag: '--version' },
            { name: 'rg', type: 'cli-tool', versionFlag: '--version' },
            { name: 'fd', type: 'cli-tool', versionFlag: '--version' },
            { name: 'tree', type: 'cli-tool', versionFlag: '--version' },
            { name: 'jq', type: 'cli-tool', versionFlag: '--version' },
            { name: 'curl', type: 'cli-tool', versionFlag: '--version' },
            { name: 'wget', type: 'cli-tool', versionFlag: '--version' },
        ];
        const detectionPromises = toolDefinitions.map(async (tool) => {
            try {
                const available = await this.isCommandAvailable(tool.name);
                let version;
                let path;
                let capabilities = [];
                if (available) {
                    try {
                        const { stdout: pathOutput } = await execAsync(`which ${tool.name}`);
                        path = pathOutput.trim();
                    }
                    catch {
                    }
                    if (tool.versionFlag) {
                        try {
                            const { stdout: versionOutput } = await execAsync(`${tool.name} ${tool.versionFlag}`, { timeout: 5000 });
                            version = this.extractVersion(versionOutput);
                        }
                        catch {
                        }
                    }
                    if (tool.name === 'erl') {
                        try {
                            const { stdout: erlVersion } = await execAsync('erl -eval "erlang:display(erlang:system_info(otp_release)), halt()." -noshell', { timeout: 3000 });
                            version = erlVersion.replace(/"/g, '').trim();
                        }
                        catch {
                            version = 'unknown';
                        }
                    }
                    capabilities = await this.detectToolCapabilities(tool.name);
                }
                return {
                    name: tool.name,
                    type: tool.type,
                    available,
                    version,
                    path,
                    capabilities,
                };
            }
            catch (error) {
                return {
                    name: tool.name,
                    type: tool.type,
                    available: false,
                };
            }
        });
        const results = await Promise.allSettled(detectionPromises);
        return results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value);
    }
    async isCommandAvailable(command) {
        try {
            await execAsync(`which ${command}`, { timeout: 2000 });
            return true;
        }
        catch {
            return false;
        }
    }
    extractVersion(output) {
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
        return output.split('\n')[0].trim().substring(0, 50);
    }
    async detectToolCapabilities(toolName) {
        const capabilities = [];
        switch (toolName) {
            case 'nix':
                try {
                    await execAsync('nix flake --help', { timeout: 2000 });
                    capabilities.push('flakes');
                }
                catch {
                }
                break;
            case 'docker':
                try {
                    await execAsync('docker compose --help', { timeout: 2000 });
                    capabilities.push('compose');
                }
                catch {
                }
                break;
            case 'git':
                try {
                    const { stdout } = await execAsync('git config --get user.name', {
                        timeout: 2000,
                    });
                    if (stdout.trim())
                        capabilities.push('configured');
                }
                catch {
                }
                break;
        }
        return capabilities;
    }
    async detectProjectContext() {
        const context = {
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
                }
                catch {
                }
            }
            const languageExtensions = await this.scanForLanguages();
            context.languages.push(...languageExtensions);
            context.languages = [...new Set(context.languages)];
        }
        catch (error) {
            console.error('Failed to detect project context:', error);
        }
        return context;
    }
    async scanForLanguages() {
        const languages = [];
        const extensionMap = {
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
                if (entry.isFile()) {
                    const ext = entry.name.substring(entry.name.lastIndexOf('.'));
                    if (extensionMap[ext]) {
                        languages.push(extensionMap[ext]);
                    }
                }
            }
        }
        catch {
        }
        return [...new Set(languages)];
    }
    async detectSystemCapabilities() {
        const capabilities = {
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
        capabilities.nodeVersion = process.version;
        try {
            const { stdout } = await execAsync('python3 --version', {
                timeout: 2000,
            });
            capabilities.pythonVersion = this.extractVersion(stdout);
        }
        catch {
            try {
                const { stdout } = await execAsync('python --version', {
                    timeout: 2000,
                });
                capabilities.pythonVersion = this.extractVersion(stdout);
            }
            catch {
            }
        }
        try {
            const { stdout } = await execAsync('rustc --version', { timeout: 2000 });
            capabilities.rustVersion = this.extractVersion(stdout);
        }
        catch {
        }
        capabilities.containers.docker = await this.isCommandAvailable('docker');
        capabilities.containers.podman = await this.isCommandAvailable('podman');
        return capabilities;
    }
    generateSuggestions(tools, context) {
        const suggestions = [];
        const nixTool = tools.find((t) => t.name === 'nix');
        if (!nixTool?.available) {
            suggestions.push('🚀 Install Nix for reproducible development environments');
        }
        else if (!nixTool.capabilities?.includes('flakes')) {
            suggestions.push('⚡ Enable Nix flakes for better project management');
        }
        if (context.hasPackageJson &&
            !tools.find((t) => t.name === 'npm')?.available) {
            suggestions.push('📦 Install npm for Node.js package management');
        }
        if (context.hasMixExs &&
            !tools.find((t) => t.name === 'elixir')?.available) {
            suggestions.push('💧 Install Elixir for this Mix project');
        }
        if (context.hasCargoToml &&
            !tools.find((t) => t.name === 'cargo')?.available) {
            suggestions.push('🦀 Install Rust for this Cargo project');
        }
        if (!context.hasGitignore &&
            tools.find((t) => t.name === 'git')?.available) {
            suggestions.push('📝 Add .gitignore file for better version control');
        }
        if (!context.hasFlakeNix && nixTool?.available) {
            suggestions.push('❄️ Consider adding flake.nix for reproducible builds');
        }
        return suggestions;
    }
    getToolsByCategory(category) {
        return this.snapshot?.tools.filter((tool) => tool.type === category) || [];
    }
    getAvailableTools() {
        return this.snapshot?.tools.filter((tool) => tool.available) || [];
    }
    isToolAvailable(toolName) {
        return this.snapshot?.tools.find((tool) => tool.name === toolName)
            ?.available;
    }
}
export default EnvironmentDetector;
//# sourceMappingURL=environment-detector.js.map