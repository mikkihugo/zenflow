"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptValidator = exports.PromptPathResolver = exports.PromptConfigManager = exports.DEFAULT_CONFIG = void 0;
exports.createProgressBar = createProgressBar;
exports.formatFileSize = formatFileSize;
exports.formatDuration = formatDuration;
const fs = require("fs/promises");
const path = require("path");
const logger_js_1 = require("../core/logger.js");
exports.DEFAULT_CONFIG = {
    sourceDirectories: [
        '.roo',
        '.claude/commands',
        'src/templates',
        'templates'
    ],
    destinationDirectory: './project-prompts',
    defaultOptions: {
        backup: true,
        verify: true,
        parallel: true,
        maxWorkers: 4,
        conflictResolution: 'backup',
        includePatterns: ['*.md', '*.txt', '*.prompt', '*.prompts', '*.json'],
        excludePatterns: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**']
    },
    profiles: {
        'sparc': {
            includePatterns: ['*.md', 'rules.md', 'sparc-*.md'],
            excludePatterns: ['**/README.md', '**/CHANGELOG.md']
        },
        'templates': {
            includePatterns: ['*.template', '*.tmpl', '*.hbs', '*.mustache'],
            conflictResolution: 'merge'
        },
        'safe': {
            backup: true,
            verify: true,
            conflictResolution: 'skip',
            parallel: false
        },
        'fast': {
            backup: false,
            verify: false,
            parallel: true,
            maxWorkers: 8,
            conflictResolution: 'overwrite'
        }
    }
};
class PromptConfigManager {
    constructor(configPath) {
        this.configPath = configPath || path.join(process.cwd(), '.prompt-config.json');
        this.config = { ...exports.DEFAULT_CONFIG };
    }
    async loadConfig() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf-8');
            const userConfig = JSON.parse(configData);
            // Merge with defaults
            this.config = this.mergeConfig(exports.DEFAULT_CONFIG, userConfig);
            logger_js_1.logger.info(`Loaded config from ${this.configPath}`);
        }
        catch (error) {
            logger_js_1.logger.info('Using default configuration');
        }
        return this.config;
    }
    async saveConfig(config) {
        if (config) {
            this.config = this.mergeConfig(this.config, config);
        }
        await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
        logger_js_1.logger.info(`Saved config to ${this.configPath}`);
    }
    getConfig() {
        return this.config;
    }
    getProfile(profileName) {
        const profile = this.config.profiles[profileName];
        if (!profile) {
            throw new Error(`Profile '${profileName}' not found`);
        }
        return { ...this.config.defaultOptions, ...profile };
    }
    listProfiles() {
        return Object.keys(this.config.profiles);
    }
    mergeConfig(base, override) {
        return {
            ...base,
            ...override,
            defaultOptions: {
                ...base.defaultOptions,
                ...override.defaultOptions
            },
            profiles: {
                ...base.profiles,
                ...override.profiles
            }
        };
    }
}
exports.PromptConfigManager = PromptConfigManager;
class PromptPathResolver {
    constructor(basePath = process.cwd()) {
        this.basePath = basePath;
    }
    resolvePaths(sourceDirectories, destinationDirectory) {
        const sources = sourceDirectories
            .map(dir => path.resolve(this.basePath, dir))
            .filter(dir => this.directoryExists(dir));
        const destination = path.resolve(this.basePath, destinationDirectory);
        return { sources, destination };
    }
    directoryExists(dirPath) {
        try {
            const stats = require('fs').statSync(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    // Discover prompt directories automatically
    async discoverPromptDirectories() {
        const candidates = [
            '.roo',
            '.claude',
            'prompts',
            'templates',
            'src/prompts',
            'src/templates',
            'docs/prompts',
            'scripts/prompts'
        ];
        const discovered = [];
        for (const candidate of candidates) {
            const fullPath = path.resolve(this.basePath, candidate);
            if (await this.containsPromptFiles(fullPath)) {
                discovered.push(fullPath);
            }
        }
        return discovered;
    }
    async containsPromptFiles(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile()) {
                    const fileName = entry.name.toLowerCase();
                    if (fileName.endsWith('.md') ||
                        fileName.endsWith('.txt') ||
                        fileName.endsWith('.prompt') ||
                        fileName.includes('prompt') ||
                        fileName.includes('template')) {
                        return true;
                    }
                }
                else if (entry.isDirectory()) {
                    const subPath = path.join(dirPath, entry.name);
                    if (await this.containsPromptFiles(subPath)) {
                        return true;
                    }
                }
            }
            return false;
        }
        catch {
            return false;
        }
    }
}
exports.PromptPathResolver = PromptPathResolver;
class PromptValidator {
    static async validatePromptFile(filePath) {
        const issues = [];
        let metadata = {};
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Check for empty files
            if (content.trim().length === 0) {
                issues.push('File is empty');
            }
            // Check for common prompt markers
            const hasPromptMarkers = [
                '# ', '## ', '### ', // Markdown headers
                'You are', 'Your task', 'Please', // Common prompt starters
                '```', '`', // Code blocks
                '{{', '}}', // Template variables
            ].some(marker => content.includes(marker));
            if (!hasPromptMarkers) {
                issues.push('File may not contain valid prompt content');
            }
            // Extract metadata from front matter
            const frontMatterMatch = content.match(/^---\n([\s\S]*?\n)---/);
            if (frontMatterMatch) {
                try {
                    metadata = this.parseFrontMatter(frontMatterMatch[1]);
                }
                catch (error) {
                    issues.push('Invalid front matter format');
                }
            }
            // Check file size (warn if too large)
            const stats = await fs.stat(filePath);
            if (stats.size > 100 * 1024) { // 100KB
                issues.push('File is unusually large for a prompt');
            }
            return {
                valid: issues.length === 0,
                issues,
                metadata
            };
        }
        catch (error) {
            return {
                valid: false,
                issues: [`Failed to read file: ${(error instanceof Error ? error.message : String(error))}`]
            };
        }
    }
    static parseFrontMatter(frontMatter) {
        // Simple YAML-like parser for basic key-value pairs
        const metadata = {};
        const lines = frontMatter.split('\n');
        for (const line of lines) {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
                const [, key, value] = match;
                metadata[key] = value.trim();
            }
        }
        return metadata;
    }
}
exports.PromptValidator = PromptValidator;
function createProgressBar(total) {
    const barLength = 40;
    return {
        update: (current) => {
            const percentage = Math.round((current / total) * 100);
            const filledLength = Math.round((current / total) * barLength);
            const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
            process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total})`);
        },
        complete: () => {
            process.stdout.write('\n');
        }
    };
}
// Utility function to format file sizes
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
// Utility function to format duration
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}
