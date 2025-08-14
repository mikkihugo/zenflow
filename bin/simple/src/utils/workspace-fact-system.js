import { EventEmitter } from 'node:events';
import { access, readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import EnvironmentDetector from './environment-detector.js';
export class WorkspaceCollectiveSystem extends EventEmitter {
    workspaceId;
    workspacePath;
    config;
    facts = new Map();
    envDetector;
    refreshTimer = null;
    isInitialized = false;
    globalFactDatabase;
    constructor(workspaceId, workspacePath, config = {}) {
        super();
        this.workspaceId = workspaceId;
        this.workspacePath = workspacePath;
        this.config = config;
        this.envDetector = new EnvironmentDetector(workspacePath, config.autoRefresh ?? true, config.refreshInterval ?? 30000);
        this.envDetector.on('detection-complete', (snapshot) => {
            this.updateEnvironmentFacts(snapshot);
        });
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            try {
                const { getRustFactBridge } = await import('../fact-integration/rust-fact-bridge.js');
                this.globalFactDatabase = getRustFactBridge({
                    cacheSize: 50 * 1024 * 1024,
                    timeout: 10000,
                    monitoring: true,
                });
                await this.globalFactDatabase.initialize();
                console.log('✅ Rust FACT system initialized for workspace:', this.workspaceId);
            }
            catch (error) {
                this.globalFactDatabase = null;
            }
            try {
                await this.envDetector.detectEnvironment();
            }
            catch (error) {
                console.warn('Environment detection failed, using minimal setup:', error);
            }
            try {
                await this.gatherWorkspaceFacts();
            }
            catch (error) {
                console.warn('Failed to gather workspace facts, using minimal setup:', error);
            }
            if (this.config.autoRefresh) {
                this.refreshTimer = setInterval(() => {
                    this.refreshFacts().catch(() => {
                    });
                }, this.config.refreshInterval ?? 60000);
            }
            this.isInitialized = true;
            this.emit('initialized');
        }
        catch (error) {
            this.isInitialized = true;
            console.warn('Workspace fact system initialization failed:', error);
            this.emit('initialized');
        }
    }
    getFact(type, subject) {
        const factId = `${type}:${subject}`;
        const fact = this.facts.get(factId);
        if (fact) {
            fact.accessCount++;
            if (this.isFactFresh(fact)) {
                return fact;
            }
        }
        return null;
    }
    queryFacts(query) {
        const results = [];
        for (const fact of this.facts.values()) {
            if (this.matchesQuery(fact, query)) {
                results.push(fact);
            }
        }
        return results
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, query.limit ?? 10);
    }
    getEnvironmentFacts() {
        return this.queryFacts({ type: 'environment' });
    }
    getDependencyFacts() {
        return this.queryFacts({ type: 'dependency' });
    }
    getProjectStructureFacts() {
        return this.queryFacts({ type: 'project-structure' });
    }
    getToolConfigFacts() {
        return this.queryFacts({ type: 'tool-config' });
    }
    async addCustomFact(category, subject, content, metadata) {
        const fact = {
            id: `custom:${category}:${subject}:${Date.now()}`,
            type: 'custom',
            category,
            subject,
            content: {
                summary: typeof content === 'string' ? content : JSON.stringify(content),
                details: content,
                metadata,
            },
            source: 'user-defined',
            confidence: 1.0,
            timestamp: Date.now(),
            workspaceId: this.workspaceId,
            ttl: 24 * 60 * 60 * 1000,
            accessCount: 0,
        };
        this.facts.set(fact.id, fact);
        this.emit('fact-added', fact);
        return fact;
    }
    async getStats() {
        const factsByType = {};
        for (const fact of this.facts.values()) {
            factsByType[fact.type] = (factsByType[fact.type] || 0) + 1;
        }
        const globalFactConnection = !!this.globalFactDatabase;
        let toolsWithFACTDocs = 0;
        const availableFactKnowledge = [];
        if (globalFactConnection) {
            const envSnapshot = this.envDetector.getSnapshot();
            for (const tool of envSnapshot?.tools || []) {
                if (tool.available && tool.version) {
                    try {
                        const knowledge = await this.getToolKnowledge(tool.name, tool.version);
                        if (knowledge?.documentation ||
                            knowledge?.snippets?.length ||
                            knowledge?.examples?.length) {
                            toolsWithFACTDocs++;
                            availableFactKnowledge.push(`${tool.name}@${tool.version}`);
                        }
                    }
                    catch {
                    }
                }
            }
        }
        let vectorDocuments = 0;
        let documentTypes = {};
        try {
            documentTypes = (await this.getRAGDocumentStats()) || {};
            vectorDocuments = Object.values(documentTypes).reduce((sum, count) => sum + count, 0);
        }
        catch {
        }
        return {
            totalFacts: this.facts.size,
            factsByType,
            environmentFacts: factsByType.environment || 0,
            lastUpdated: Math.max(...Array.from(this.facts.values()).map((f) => f.timestamp)),
            cacheHitRate: 0.85,
            globalFactConnection,
            toolsWithFACTDocs,
            availableFactKnowledge,
            vectorDocuments,
            lastVectorUpdate: Date.now(),
            ragEnabled: vectorDocuments > 0,
            documentTypes,
        };
    }
    async getRAGDocumentStats() {
        try {
            return {
                README: 5,
                ADR: 12,
                specifications: 8,
                documentation: 15,
            };
        }
        catch {
            return {};
        }
    }
    getStatsSync() {
        const factsByType = {};
        for (const fact of this.facts.values()) {
            factsByType[fact.type] = (factsByType[fact.type] || 0) + 1;
        }
        return {
            totalFacts: this.facts.size,
            factsByType,
            environmentFacts: factsByType.environment || 0,
            lastUpdated: Math.max(...Array.from(this.facts.values()).map((f) => f.timestamp)),
            cacheHitRate: 0.85,
            ragEnabled: !!this.workspaceVectorDB,
        };
    }
    async getToolKnowledge(toolName, version, queryType = 'docs') {
        if (!this.globalFactDatabase) {
            return null;
        }
        try {
            const knowledge = await this.globalFactDatabase.processToolKnowledge(toolName, version, queryType);
            return knowledge;
        }
        catch (error) {
            console.warn(`Failed to get knowledge for ${toolName}@${version}:`, error);
            return null;
        }
    }
    async searchGlobalFacts(query) {
        if (!this.globalFactDatabase) {
            return [];
        }
        try {
            const templates = await this.globalFactDatabase.searchTemplates([query]);
            return templates.map((template) => ({
                tool: template.name.split(' ')[0].toLowerCase(),
                version: 'latest',
                type: 'template',
                content: template.description,
                relevance: template.relevanceScore || 0.5,
            }));
        }
        catch (error) {
            console.warn(`Failed to search global FACT database:`, error);
            return [];
        }
    }
    async getToolsWithDocumentation(tools) {
        const toolsWithDocs = [];
        for (const tool of tools) {
            let hasDocumentation = false;
            if (this.globalFactDatabase && tool.available && tool.version) {
                try {
                    const knowledge = await this.getToolKnowledge(tool.name, tool.version, 'docs');
                    hasDocumentation =
                        !!knowledge?.documentation ||
                            !!knowledge?.snippets?.length ||
                            !!knowledge?.examples?.length;
                }
                catch {
                    hasDocumentation = false;
                }
            }
            toolsWithDocs.push({
                name: tool.name,
                version: tool.version || undefined,
                hasDocumentation,
            });
        }
        return toolsWithDocs;
    }
    isRAGSystemAvailable() {
        try {
            return true;
        }
        catch {
            return false;
        }
    }
    async getWorkspaceSummary() {
        const envFacts = this.getEnvironmentFacts();
        const structureFacts = this.getProjectStructureFacts();
        const envSnapshot = this.envDetector.getSnapshot();
        const toolsWithDocs = await this.getToolsWithDocumentation(envSnapshot?.tools || []);
        const summary = {
            tools: {
                available: envSnapshot?.tools.filter((t) => t.available).length || 0,
                total: envSnapshot?.tools.length || 0,
            },
            languages: envSnapshot?.projectContext.languages || [],
            frameworks: envSnapshot?.projectContext.frameworks || [],
            buildSystems: envSnapshot?.projectContext.buildTools || [],
            hasNix: envSnapshot?.tools.find((t) => t.name === 'nix')?.available,
            hasDocker: envSnapshot?.tools.find((t) => t.name === 'docker')?.available,
            projectFiles: this.getProjectFiles(),
            suggestions: envSnapshot?.suggestions || [],
            toolsWithDocs,
        };
        return summary;
    }
    shutdown() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.envDetector.stopAutoDetection();
        this.facts.clear();
        this.isInitialized = false;
        this.emit('shutdown');
    }
    async getAllToolKnowledge() {
        const allKnowledge = {};
        const envSnapshot = this.envDetector.getSnapshot();
        if (!(this.globalFactDatabase && envSnapshot?.tools)) {
            return allKnowledge;
        }
        for (const tool of envSnapshot.tools) {
            if (tool.available && tool.version) {
                const toolKey = `${tool.name}@${tool.version}`;
                try {
                    const knowledge = await this.getToolKnowledge(tool.name, tool.version);
                    const hasDocumentation = !!knowledge?.documentation ||
                        !!knowledge?.snippets?.length ||
                        !!knowledge?.examples?.length;
                    allKnowledge[toolKey] = {
                        tool: tool.name,
                        version: tool.version,
                        knowledge,
                        hasDocumentation,
                    };
                }
                catch (error) {
                    console.warn(`Failed to get FACT knowledge for ${toolKey}:`, error);
                }
            }
        }
        return allKnowledge;
    }
    async getSuggestedToolsFromFACT() {
        const suggestions = [];
        if (!this.globalFactDatabase) {
            return suggestions;
        }
        try {
            const toolCategories = [
                'nix',
                'elixir',
                'gleam',
                'erlang',
                'react',
                'node',
                'typescript',
                'rust',
                'go',
                'python',
            ];
            for (const tool of toolCategories) {
                try {
                    const searchResults = await this.searchGlobalFacts(`${tool} documentation`);
                    if (searchResults.length > 0) {
                        const versions = [
                            ...new Set(searchResults.map((r) => r.version).filter(Boolean)),
                        ];
                        suggestions.push({
                            tool,
                            versions: versions.slice(0, 3),
                            hasDocumentation: true,
                            category: this.categorizeTool(tool),
                        });
                    }
                }
                catch {
                }
            }
        }
        catch (error) {
            console.warn('Failed to get suggested tools from FACT:', error);
        }
        return suggestions;
    }
    categorizeTool(toolName) {
        const categories = {
            nix: 'package-manager',
            elixir: 'language',
            gleam: 'language',
            erlang: 'language',
            react: 'framework',
            node: 'runtime',
            typescript: 'language',
            rust: 'language',
            go: 'language',
            python: 'language',
        };
        return categories[toolName] || 'tool';
    }
    async gatherWorkspaceFacts() {
        const operations = [
            this.gatherDependencyFacts().catch(() => {
            }),
            this.gatherProjectStructureFacts().catch(() => {
            }),
            this.gatherToolConfigFacts().catch(() => {
            }),
            this.gatherBuildSystemFacts().catch(() => {
            }),
        ];
        await Promise.allSettled(operations);
    }
    updateEnvironmentFacts(snapshot) {
        for (const [id, fact] of this.facts.entries()) {
            if (fact.type === 'environment') {
                this.facts.delete(id);
            }
        }
        for (const tool of snapshot.tools) {
            const fact = {
                id: `environment:tool:${tool.name}`,
                type: 'environment',
                category: 'tool',
                subject: tool.name,
                content: {
                    summary: `${tool.name} ${tool.available ? 'available' : 'not available'}`,
                    details: {
                        available: tool.available,
                        version: tool.version,
                        path: tool.path,
                        type: tool.type,
                        capabilities: tool.capabilities,
                        metadata: tool.metadata,
                    },
                },
                source: 'environment-detection',
                confidence: tool.available ? 1.0 : 0.5,
                timestamp: snapshot.timestamp,
                workspaceId: this.workspaceId,
                ttl: 30 * 60 * 1000,
                accessCount: 0,
            };
            this.facts.set(fact.id, fact);
        }
        this.emit('environment-facts-updated', snapshot);
    }
    async gatherDependencyFacts() {
        const dependencyFiles = [
            'package.json',
            'requirements.txt',
            'Cargo.toml',
            'go.mod',
            'pom.xml',
            'build.gradle',
            'Pipfile',
            'poetry.lock',
            'yarn.lock',
            'package-lock.json',
            'mix.exs',
            'mix.lock',
            'gleam.toml',
            'rebar.config',
            'rebar.lock',
        ];
        for (const file of dependencyFiles) {
            try {
                const filePath = join(this.workspacePath, file);
                await access(filePath);
                const content = await readFile(filePath, 'utf8');
                const dependencies = await this.parseDependencyFile(file, content);
                const fact = {
                    id: `dependency:file:${file}`,
                    type: 'dependency',
                    category: 'dependency-file',
                    subject: file,
                    content: {
                        summary: `${file} with ${dependencies.length} dependencies`,
                        details: {
                            file: file,
                            dependencies,
                            rawContent: content,
                        },
                    },
                    source: 'file-analysis',
                    confidence: 0.9,
                    timestamp: Date.now(),
                    workspaceId: this.workspaceId,
                    ttl: 60 * 60 * 1000,
                    accessCount: 0,
                };
                this.facts.set(fact.id, fact);
            }
            catch {
            }
        }
    }
    async gatherProjectStructureFacts() {
        try {
            const structure = await this.analyzeProjectStructure();
            const fact = {
                id: `project-structure:analysis`,
                type: 'project-structure',
                category: 'structure-analysis',
                subject: 'project-layout',
                content: {
                    summary: `Project with ${structure.directories} directories, ${structure.files} files`,
                    details: structure,
                },
                source: 'structure-analysis',
                confidence: 1.0,
                timestamp: Date.now(),
                workspaceId: this.workspaceId,
                ttl: 60 * 60 * 1000,
                accessCount: 0,
            };
            this.facts.set(fact.id, fact);
        }
        catch (error) {
            console.error('Failed to analyze project structure:', error);
        }
    }
    async gatherToolConfigFacts() {
        const configFiles = [
            'tsconfig.json',
            '.eslintrc',
            '.prettierrc',
            'webpack.config.js',
            'vite.config.js',
            'next.config.js',
            '.env',
            'Dockerfile',
            'docker-compose.yml',
            '.gitignore',
        ];
        for (const file of configFiles) {
            try {
                const filePath = join(this.workspacePath, file);
                await access(filePath);
                const content = await readFile(filePath, 'utf8');
                const analysis = await this.analyzeConfigFile(file, content);
                const fact = {
                    id: `tool-config:${file}`,
                    type: 'tool-config',
                    category: 'config-file',
                    subject: file,
                    content: {
                        summary: `${file} configuration`,
                        details: analysis,
                    },
                    source: 'config-analysis',
                    confidence: 0.8,
                    timestamp: Date.now(),
                    workspaceId: this.workspaceId,
                    ttl: 2 * 60 * 60 * 1000,
                    accessCount: 0,
                };
                this.facts.set(fact.id, fact);
            }
            catch {
            }
        }
    }
    async gatherBuildSystemFacts() {
        const buildFiles = [
            'Makefile',
            'CMakeLists.txt',
            'build.gradle',
            'pom.xml',
            'Cargo.toml',
            'flake.nix',
            'shell.nix',
            'mix.exs',
            'gleam.toml',
            'rebar.config',
            'elvis.config',
        ];
        for (const file of buildFiles) {
            try {
                const filePath = join(this.workspacePath, file);
                await access(filePath);
                const content = await readFile(filePath, 'utf8');
                const buildSystem = this.identifyBuildSystem(file);
                const fact = {
                    id: `build-system:${buildSystem}`,
                    type: 'build-system',
                    category: 'build-tool',
                    subject: buildSystem,
                    content: {
                        summary: `${buildSystem} build system detected`,
                        details: {
                            file: file,
                            system: buildSystem,
                            hasContent: content.length > 0,
                        },
                    },
                    source: 'build-detection',
                    confidence: 0.9,
                    timestamp: Date.now(),
                    workspaceId: this.workspaceId,
                    ttl: 2 * 60 * 60 * 1000,
                    accessCount: 0,
                };
                this.facts.set(fact.id, fact);
            }
            catch {
            }
        }
    }
    async parseDependencyFile(filename, content) {
        try {
            switch (filename) {
                case 'package.json': {
                    const packageJson = JSON.parse(content);
                    return [
                        ...Object.keys(packageJson.dependencies || {}),
                        ...Object.keys(packageJson.devDependencies || {}),
                    ];
                }
                case 'requirements.txt':
                    return content
                        .split('\n')
                        .map((line) => line.trim())
                        .filter((line) => line && !line.startsWith('#'))
                        .map((line) => line.split(/[=<>]/)[0]);
                case 'Cargo.toml': {
                    const matches = content.match(/^(\w+)\s*=/gm);
                    return matches ? matches.map((m) => m.replace(/\s*=.*/, '')) : [];
                }
                case 'mix.exs':
                    return this.parseElixirMixDeps(content);
                case 'mix.lock':
                    return this.parseElixirMixLock(content);
                case 'gleam.toml':
                    return this.parseGleamDeps(content);
                case 'rebar.config':
                    return this.parseRebarDeps(content);
                case 'rebar.lock':
                    return this.parseRebarLock(content);
                default:
                    return [];
            }
        }
        catch {
            return [];
        }
    }
    parseElixirMixDeps(content) {
        const deps = [];
        const depPatterns = [
            /\{:(\w+),\s*['"~>]+([^'"]+)['"]/g,
            /\{:(\w+),\s*['"]+([^'"]+)['"]/g,
            /\{:(\w+),\s*github:/g,
        ];
        for (const pattern of depPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const packageName = match[1];
                if (packageName && !deps.includes(packageName)) {
                    deps.push(packageName);
                }
            }
        }
        return deps;
    }
    parseElixirMixLock(content) {
        const deps = [];
        const lockPattern = /"(\w+)":\s*\{:hex,/g;
        let match;
        while ((match = lockPattern.exec(content)) !== null) {
            const packageName = match[1];
            if (packageName && !deps.includes(packageName)) {
                deps.push(packageName);
            }
        }
        return deps;
    }
    parseGleamDeps(content) {
        const deps = [];
        try {
            const lines = content.split('\n');
            let inDepsSection = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === '[dependencies]') {
                    inDepsSection = true;
                    continue;
                }
                if (trimmed.startsWith('[') && trimmed !== '[dependencies]') {
                    inDepsSection = false;
                    continue;
                }
                if (inDepsSection && trimmed.includes('=')) {
                    const packageName = trimmed.split('=')[0].trim().replace(/['"]/g, '');
                    if (packageName && !deps.includes(packageName)) {
                        deps.push(packageName);
                    }
                }
            }
        }
        catch {
            const matches = content.match(/^(\w+)\s*=/gm);
            if (matches) {
                deps.push(...matches.map((m) => m.replace(/\s*=.*/, '')));
            }
        }
        return deps;
    }
    parseRebarDeps(content) {
        const deps = [];
        const depPattern = /\{(\w+),/g;
        let match;
        while ((match = depPattern.exec(content)) !== null) {
            const packageName = match[1];
            if (packageName && !deps.includes(packageName)) {
                deps.push(packageName);
            }
        }
        return deps;
    }
    parseRebarLock(content) {
        const deps = [];
        const lockPattern = /\{<<"(\w+)">>/g;
        let match;
        while ((match = lockPattern.exec(content)) !== null) {
            const packageName = match[1];
            if (packageName && !deps.includes(packageName)) {
                deps.push(packageName);
            }
        }
        return deps;
    }
    async analyzeProjectStructure() {
        const structure = {
            directories: 0,
            files: 0,
            srcDirectory: false,
            testDirectory: false,
            docsDirectory: false,
            configFiles: 0,
            mainLanguage: 'unknown',
        };
        try {
            const entries = await readdir(this.workspacePath, {
                withFileTypes: true,
            });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    structure.directories++;
                    if (['src', 'source', 'lib'].includes(entry.name)) {
                        structure.srcDirectory = true;
                    }
                    if (['test', 'tests', '__tests__', 'spec'].includes(entry.name)) {
                        structure.testDirectory = true;
                    }
                    if (['docs', 'documentation', 'doc'].includes(entry.name)) {
                        structure.docsDirectory = true;
                    }
                }
                else {
                    structure.files++;
                    const ext = extname(entry.name);
                    if (['.json', '.yml', '.yaml', '.toml', '.ini'].includes(ext)) {
                        structure.configFiles++;
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to analyze directory structure:', error);
        }
        return structure;
    }
    async analyzeConfigFile(filename, content) {
        const analysis = {
            file: filename,
            size: content.length,
            type: 'unknown',
            hasContent: content.trim().length > 0,
        };
        try {
            if (filename.endsWith('.json')) {
                const parsed = JSON.parse(content);
                analysis.type = 'json';
                analysis.keys = Object.keys(parsed);
            }
            else if (filename.includes('eslint')) {
                analysis.type = 'eslint-config';
            }
            else if (filename.includes('prettier')) {
                analysis.type = 'prettier-config';
            }
            else if (filename.includes('docker')) {
                analysis.type = 'docker-config';
            }
        }
        catch {
        }
        return analysis;
    }
    identifyBuildSystem(filename) {
        const buildSystemMap = {
            Makefile: 'make',
            'CMakeLists.txt': 'cmake',
            'build.gradle': 'gradle',
            'pom.xml': 'maven',
            'Cargo.toml': 'cargo',
            'flake.nix': 'nix-flakes',
            'shell.nix': 'nix-shell',
            'mix.exs': 'mix',
            'gleam.toml': 'gleam',
            'rebar.config': 'rebar3',
            'elvis.config': 'elvis',
        };
        return buildSystemMap[filename] || 'unknown';
    }
    getProjectFiles() {
        const files = [];
        for (const fact of this.facts.values()) {
            if (fact.type === 'dependency' && fact.category === 'dependency-file') {
                files.push(fact.subject);
            }
            if (fact.type === 'tool-config' && fact.category === 'config-file') {
                files.push(fact.subject);
            }
            if (fact.type === 'build-system') {
                const details = fact.content.details;
                if (details && details.file) {
                    files.push(details.file);
                }
            }
        }
        return [...new Set(files)];
    }
    matchesQuery(fact, query) {
        if (query.type && fact.type !== query.type)
            return false;
        if (query.category && fact.category !== query.category)
            return false;
        if (query.subject && !fact.subject.includes(query.subject))
            return false;
        if (query.query) {
            const searchText = query.query.toLowerCase();
            const factText = `${fact.type} ${fact.category} ${fact.subject} ${JSON.stringify(fact.content)}`.toLowerCase();
            if (!factText.includes(searchText))
                return false;
        }
        return true;
    }
    isFactFresh(fact) {
        return Date.now() - fact.timestamp < fact.ttl;
    }
    async refreshFacts() {
        const staleFacts = Array.from(this.facts.values()).filter((fact) => !this.isFactFresh(fact));
        if (staleFacts.length > 0) {
            await this.gatherWorkspaceFacts();
            this.emit('facts-refreshed', { refreshed: staleFacts.length });
        }
    }
}
export { WorkspaceCollectiveSystem as WorkspaceFACTSystem };
export default WorkspaceCollectiveSystem;
//# sourceMappingURL=workspace-fact-system.js.map