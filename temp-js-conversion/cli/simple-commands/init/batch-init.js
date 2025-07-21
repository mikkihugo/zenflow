"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENVIRONMENT_CONFIGS = exports.PROJECT_TEMPLATES = void 0;
exports.batchInitCommand = batchInitCommand;
exports.parseBatchConfig = parseBatchConfig;
exports.batchInitFromConfig = batchInitFromConfig;
exports.validateBatchOptions = validateBatchOptions;
// batch-init.js - Batch initialization features with parallel processing
const utils_js_1 = require("../../utils.js");
const node_compat_js_1 = require("../../node-compat.js");
const process_1 = require("process");
const performance_monitor_js_1 = require("./performance-monitor.js");
const index_js_1 = require("./index.js");
const sparc_structure_js_1 = require("./sparc-structure.js");
const slash_commands_js_1 = require("./claude-commands/slash-commands.js");
const claude_md_js_1 = require("./templates/claude-md.js");
const memory_bank_md_js_1 = require("./templates/memory-bank-md.js");
const coordination_md_js_1 = require("./templates/coordination-md.js");
const readme_files_js_1 = require("./templates/readme-files.js");
// Progress tracking for batch operations
class BatchProgressTracker {
    constructor(totalProjects) {
        this.totalProjects = totalProjects;
        this.completed = 0;
        this.failed = 0;
        this.inProgress = new Map();
        this.startTime = Date.now();
    }
    startProject(projectName) {
        this.inProgress.set(projectName, Date.now());
        this.updateDisplay();
    }
    completeProject(projectName, success = true) {
        this.inProgress.delete(projectName);
        if (success) {
            this.completed++;
        }
        else {
            this.failed++;
        }
        this.updateDisplay();
    }
    updateDisplay() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const progress = Math.floor(((this.completed + this.failed) / this.totalProjects) * 100);
        console.clear();
        console.log('🚀 Batch Initialization Progress');
        console.log('================================');
        console.log(`Total Projects: ${this.totalProjects}`);
        console.log(`Completed: ${this.completed} ✅`);
        console.log(`Failed: ${this.failed} ❌`);
        console.log(`In Progress: ${this.inProgress.size} 🔄`);
        console.log(`Progress: ${progress}% [${this.getProgressBar(progress)}]`);
        console.log(`Elapsed Time: ${elapsed}s`);
        if (this.inProgress.size > 0) {
            console.log('\nActive Projects:');
            for (const [project, startTime] of this.inProgress) {
                const projectElapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`  - ${project} (${projectElapsed}s)`);
            }
        }
    }
    getProgressBar(progress) {
        const filled = Math.floor(progress / 5);
        const empty = 20 - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
    getReport() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        return {
            total: this.totalProjects,
            completed: this.completed,
            failed: this.failed,
            elapsedTime: elapsed,
            successRate: this.totalProjects > 0 ? (this.completed / this.totalProjects * 100).toFixed(1) : 0
        };
    }
}
// Resource management to prevent overload
class ResourceManager {
    constructor(maxConcurrency = 5, maxMemoryMB = 1024) {
        this.maxConcurrency = maxConcurrency;
        this.maxMemoryMB = maxMemoryMB;
        this.currentTasks = 0;
        this.queue = [];
    }
    async acquire() {
        while (this.currentTasks >= this.maxConcurrency) {
            await new Promise(resolve => {
                this.queue.push(resolve);
            });
        }
        this.currentTasks++;
    }
    release() {
        this.currentTasks--;
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
        }
    }
    async withResource(fn) {
        await this.acquire();
        try {
            return await fn();
        }
        finally {
            this.release();
        }
    }
}
// Project template definitions
const PROJECT_TEMPLATES = {
    'web-api': {
        name: 'Web API',
        description: 'RESTful API with Express.js',
        extraDirs: ['src', 'src/controllers', 'src/models', 'src/routes', 'tests'],
        extraFiles: {
            'package.json': {
                name: '{{PROJECT_NAME}}',
                version: '1.0.0',
                type: 'module',
                scripts: {
                    start: 'node src/index.js',
                    dev: 'nodemon src/index.js',
                    test: 'jest'
                },
                dependencies: {
                    express: '^4.18.0',
                    cors: '^2.8.5',
                    dotenv: '^16.0.0'
                }
            },
            'src/index.js': `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to {{PROJECT_NAME}} API' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
        }
    },
    'react-app': {
        name: 'React Application',
        description: 'Modern React app with TypeScript',
        extraDirs: ['src', 'src/components', 'src/hooks', 'src/services', 'public'],
        extraFiles: {
            'package.json': {
                name: '{{PROJECT_NAME}}',
                version: '0.1.0',
                private: true,
                dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0',
                    'react-scripts': '5.0.1',
                    typescript: '^4.9.5'
                },
                scripts: {
                    start: 'react-scripts start',
                    build: 'react-scripts build',
                    test: 'react-scripts test'
                }
            },
            'tsconfig.json': {
                compilerOptions: {
                    target: 'es5',
                    lib: ['dom', 'es2015'],
                    jsx: 'react-jsx',
                    module: 'esnext',
                    moduleResolution: 'node',
                    strict: true,
                    esModuleInterop: true,
                    skipLibCheck: true,
                    forceConsistentCasingInFileNames: true
                }
            }
        }
    },
    'microservice': {
        name: 'Microservice',
        description: 'Containerized microservice with Docker',
        extraDirs: ['src', 'config', 'tests', 'scripts'],
        extraFiles: {
            'Dockerfile': `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "src/index.js"]
`,
            'docker-compose.yml': `version: '3.8'
services:
  {{PROJECT_NAME}}:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV={{ENVIRONMENT}}
      - PORT=8080
    restart: unless-stopped
`,
            '.dockerignore': `node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.DS_Store
coverage
.nyc_output
`
        }
    },
    'cli-tool': {
        name: 'CLI Tool',
        description: 'Command-line interface tool',
        extraDirs: ['src', 'src/commands', 'src/utils', 'tests'],
        extraFiles: {
            'package.json': {
                name: '{{PROJECT_NAME}}',
                version: '1.0.0',
                type: 'module',
                bin: {
                    '{{PROJECT_NAME}}': './src/cli.js'
                },
                scripts: {
                    test: 'jest',
                    lint: 'eslint src/'
                }
            },
            'src/cli.js': `#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('{{PROJECT_NAME}}')
  .description('{{PROJECT_DESCRIPTION}}')
  .version('1.0.0');

program
  .command('hello')
  .description('Say hello')
  .option('-n, --name <name>', 'name to greet', 'World')
  .action((options) => {
    console.log(\`Hello, \${options.name}!\`);
  });

program.parse();
`
        }
    }
};
exports.PROJECT_TEMPLATES = PROJECT_TEMPLATES;
// Environment configurations
const ENVIRONMENT_CONFIGS = {
    dev: {
        name: 'development',
        features: ['debug', 'hot-reload', 'verbose-logging'],
        config: {
            NODE_ENV: 'development',
            DEBUG: 'true',
            LOG_LEVEL: 'debug'
        }
    },
    staging: {
        name: 'staging',
        features: ['testing', 'monitoring'],
        config: {
            NODE_ENV: 'staging',
            DEBUG: 'false',
            LOG_LEVEL: 'info'
        }
    },
    prod: {
        name: 'production',
        features: ['optimization', 'security', 'monitoring'],
        config: {
            NODE_ENV: 'production',
            DEBUG: 'false',
            LOG_LEVEL: 'error'
        }
    }
};
exports.ENVIRONMENT_CONFIGS = ENVIRONMENT_CONFIGS;
// Initialize a single project with options
async function initializeProject(projectPath, options = {}) {
    const { template = null, environment = 'dev', sparc = false, minimal = false, force = false, customConfig = {} } = options;
    try {
        // Get absolute project path
        const currentDir = (0, node_compat_js_1.cwd)();
        const absoluteProjectPath = projectPath.startsWith('/') ? projectPath : `${currentDir}/${projectPath}`;
        // Create project directory
        await node_compat_js_1.Deno.mkdir(absoluteProjectPath, { recursive: true });
        // Change to project directory
        const originalDir = (0, node_compat_js_1.cwd)();
        process_1.default.chdir(absoluteProjectPath);
        // Initialize base structure
        const directories = [
            'memory',
            'memory/agents',
            'memory/sessions',
            'coordination',
            'coordination/memory_bank',
            'coordination/subtasks',
            'coordination/orchestration',
            '.claude',
            '.claude/commands',
            '.claude/commands/sparc',
            '.claude/logs'
        ];
        // Add template-specific directories
        if (template && PROJECT_TEMPLATES[template]) {
            const templateConfig = PROJECT_TEMPLATES[template];
            if (templateConfig.extraDirs) {
                directories.push(...templateConfig.extraDirs);
            }
        }
        // Create all directories in parallel
        await Promise.all(directories.map(dir => node_compat_js_1.Deno.mkdir(dir, { recursive: true }).catch(() => { })));
        // Create configuration files in parallel
        const fileCreationTasks = [];
        // CLAUDE.md
        const claudeMd = sparc ? (0, claude_md_js_1.createSparcClaudeMd)() :
            minimal ? (0, claude_md_js_1.createMinimalClaudeMd)() : (0, claude_md_js_1.createFullClaudeMd)();
        fileCreationTasks.push(node_compat_js_1.Deno.writeTextFile('CLAUDE.md', claudeMd));
        // memory-bank.md
        const memoryBankMd = minimal ? (0, memory_bank_md_js_1.createMinimalMemoryBankMd)() : (0, memory_bank_md_js_1.createFullMemoryBankMd)();
        fileCreationTasks.push(node_compat_js_1.Deno.writeTextFile('memory-bank.md', memoryBankMd));
        // coordination.md
        const coordinationMd = minimal ? (0, coordination_md_js_1.createMinimalCoordinationMd)() : (0, coordination_md_js_1.createFullCoordinationMd)();
        fileCreationTasks.push(node_compat_js_1.Deno.writeTextFile('coordination.md', coordinationMd));
        // README files
        fileCreationTasks.push(node_compat_js_1.Deno.writeTextFile('memory/agents/README.md', (0, readme_files_js_1.createAgentsReadme)()), node_compat_js_1.Deno.writeTextFile('memory/sessions/README.md', (0, readme_files_js_1.createSessionsReadme)()));
        // Persistence database
        const initialData = {
            agents: [],
            tasks: [],
            environment: environment,
            template: template,
            customConfig: customConfig,
            lastUpdated: Date.now()
        };
        fileCreationTasks.push(node_compat_js_1.Deno.writeTextFile('memory/claude-flow-data.json', JSON.stringify(initialData, null, 2)));
        // Environment configuration
        if (ENVIRONMENT_CONFIGS[environment]) {
            const envConfig = ENVIRONMENT_CONFIGS[environment];
            const envContent = Object.entries(envConfig.config)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');
            fileCreationTasks.push(node_compat_js_1.Deno.writeTextFile('.env', envContent));
        }
        // Template-specific files
        if (template && PROJECT_TEMPLATES[template]) {
            const templateConfig = PROJECT_TEMPLATES[template];
            if (templateConfig.extraFiles) {
                for (const [filePath, content] of Object.entries(templateConfig.extraFiles)) {
                    let fileContent = typeof content === 'object' ?
                        JSON.stringify(content, null, 2) : content;
                    // Replace template variables
                    fileContent = fileContent
                        .replace(/{{PROJECT_NAME}}/g, projectPath.split('/').pop())
                        .replace(/{{PROJECT_DESCRIPTION}}/g, templateConfig.description)
                        .replace(/{{ENVIRONMENT}}/g, environment);
                    fileCreationTasks.push(node_compat_js_1.Deno.writeTextFile(filePath, fileContent));
                }
            }
        }
        // Execute all file creation tasks in parallel
        await Promise.all(fileCreationTasks);
        // SPARC initialization if requested
        if (sparc) {
            await (0, sparc_structure_js_1.createSparcStructureManually)();
            await (0, slash_commands_js_1.createClaudeSlashCommands)(projectPath);
        }
        // Change back to original directory
        process_1.default.chdir(originalDir);
        return { success: true, projectPath: absoluteProjectPath };
    }
    catch (error) {
        return { success: false, projectPath, error: error.message };
    }
}
// Batch initialization with parallel processing
async function batchInitCommand(projects, options = {}) {
    const { parallel = true, maxConcurrency = 5, template = null, environments = ['dev'], sparc = false, minimal = false, force = false, progressTracking = true, performanceMonitoring = true } = options;
    if (!projects || projects.length === 0) {
        (0, utils_js_1.printError)('No projects specified for batch initialization');
        return;
    }
    const totalProjects = projects.length * environments.length;
    const tracker = progressTracking ? new BatchProgressTracker(totalProjects) : null;
    const resourceManager = new ResourceManager(parallel ? maxConcurrency : 1);
    // Initialize performance monitoring
    const perfMonitor = new performance_monitor_js_1.PerformanceMonitor({
        enabled: performanceMonitoring,
        logLevel: 'info'
    });
    const resourceMonitor = new performance_monitor_js_1.ResourceThresholdMonitor({
        maxMemoryMB: 2048,
        ...performance_monitor_js_1.ResourceThresholdMonitor.createDefaultCallbacks()
    });
    // Calculate optimal settings
    const optimalConcurrency = performance_monitor_js_1.BatchOptimizer.calculateOptimalConcurrency(totalProjects);
    const timeEstimate = performance_monitor_js_1.BatchOptimizer.estimateCompletionTime(totalProjects, options);
    const recommendations = performance_monitor_js_1.BatchOptimizer.generateRecommendations(totalProjects, options);
    if (maxConcurrency > optimalConcurrency) {
        (0, utils_js_1.printWarning)(`Concurrency ${maxConcurrency} may be too high. Optimal: ${optimalConcurrency}`);
    }
    perfMonitor.start();
    resourceMonitor.start();
    (0, utils_js_1.printSuccess)(`Starting batch initialization for ${projects.length} projects across ${environments.length} environments`);
    console.log(`Template: ${template || 'default'}`);
    console.log(`Parallelism: ${parallel ? `Yes (max ${maxConcurrency} concurrent)` : 'No'}`);
    console.log(`SPARC: ${sparc ? 'Enabled' : 'Disabled'}\n`);
    const results = [];
    const initTasks = [];
    for (const project of projects) {
        for (const env of environments) {
            const projectPath = environments.length > 1 ?
                `${project}-${env}` : project;
            const initTask = async () => {
                if (tracker)
                    tracker.startProject(projectPath);
                perfMonitor.recordOperation('project-init-start', { projectPath, template, environment: env });
                const result = await resourceManager.withResource(async () => {
                    return await initializeProject(projectPath, {
                        template,
                        environment: env,
                        sparc,
                        minimal,
                        force
                    });
                });
                if (result.success) {
                    perfMonitor.recordOperation('project-init-success', { projectPath });
                }
                else {
                    perfMonitor.recordError(result.error, { projectPath, template, environment: env });
                }
                if (tracker)
                    tracker.completeProject(projectPath, result.success);
                results.push(result);
            };
            if (parallel) {
                initTasks.push(initTask());
            }
            else {
                await initTask();
            }
        }
    }
    if (parallel) {
        await Promise.all(initTasks);
    }
    // Final report
    console.log('\n\n📊 Batch Initialization Report');
    console.log('================================');
    if (tracker) {
        const report = tracker.getReport();
        console.log(`Total Projects: ${report.total}`);
        console.log(`Successful: ${report.completed} ✅`);
        console.log(`Failed: ${report.failed} ❌`);
        console.log(`Success Rate: ${report.successRate}%`);
        console.log(`Total Time: ${report.elapsedTime}s`);
        console.log(`Average Time per Project: ${(report.elapsedTime / report.total).toFixed(1)}s`);
    }
    // List successful projects
    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
        console.log('\n✅ Successfully initialized:');
        successful.forEach(r => console.log(`  - ${r.projectPath}`));
    }
    // List failed projects
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
        console.log('\n❌ Failed to initialize:');
        failed.forEach(r => console.log(`  - ${r.projectPath}: ${r.error}`));
    }
    // Stop monitoring and generate performance report
    perfMonitor.stop();
    resourceMonitor.stop();
    if (performanceMonitoring) {
        console.log(perfMonitor.generateReport());
        // Show recommendations
        if (recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            recommendations.forEach(rec => console.log(`  • ${rec}`));
        }
    }
    return results;
}
// Parse batch initialization config from file
async function parseBatchConfig(configFile) {
    try {
        const content = await node_compat_js_1.Deno.readTextFile(configFile);
        return JSON.parse(content);
    }
    catch (error) {
        (0, utils_js_1.printError)(`Failed to read batch config file: ${error.message}`);
        return null;
    }
}
// Create batch initialization from config file
async function batchInitFromConfig(configFile, options = {}) {
    const config = await parseBatchConfig(configFile);
    if (!config)
        return;
    const { projects = [], baseOptions = {}, projectConfigs = {} } = config;
    // Merge options with config
    const mergedOptions = { ...baseOptions, ...options };
    // If projectConfigs are specified, use them for individual project customization
    if (Object.keys(projectConfigs).length > 0) {
        const results = [];
        const resourceManager = new ResourceManager(mergedOptions.maxConcurrency || 5);
        for (const [projectName, projectConfig] of Object.entries(projectConfigs)) {
            const projectOptions = { ...mergedOptions, ...projectConfig };
            const result = await resourceManager.withResource(async () => {
                return await initializeProject(projectName, projectOptions);
            });
            results.push(result);
        }
        return results;
    }
    // Otherwise, use standard batch init
    return await batchInitCommand(projects, mergedOptions);
}
// Validation for batch operations
function validateBatchOptions(options) {
    const errors = [];
    if (options.maxConcurrency && (options.maxConcurrency < 1 || options.maxConcurrency > 20)) {
        errors.push('maxConcurrency must be between 1 and 20');
    }
    if (options.template && !PROJECT_TEMPLATES[options.template]) {
        errors.push(`Unknown template: ${options.template}. Available: ${Object.keys(PROJECT_TEMPLATES).join(', ')}`);
    }
    if (options.environments) {
        for (const env of options.environments) {
            if (!ENVIRONMENT_CONFIGS[env]) {
                errors.push(`Unknown environment: ${env}. Available: ${Object.keys(ENVIRONMENT_CONFIGS).join(', ')}`);
            }
        }
    }
    return errors;
}
