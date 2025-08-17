/**
 * Enhanced Document Scanner - Code Analysis & Swarm Task Generation
 *
 * Scans .md documents and source code to extract:
 * - TODO items and FIXME comments
 * - Missing implementations (empty functions, incomplete features)
 * - Code quality issues and technical debt
 * - Documentation gaps and improvement opportunities
 *
 * Integrates with THE COLLECTIVE document entity system and provides
 * GUI approval workflow for generated swarm tasks.
 *
 * @file Enhanced document scanner for code analysis and task generation.
 */
import { EventEmitter } from 'node:events';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { getLogger } from '../config/logging-config';
const logger = getLogger('EnhancedDocumentScanner');
/**
 * Enhanced document and code scanner with AI-powered analysis
 */
export class EnhancedDocumentScanner extends EventEmitter {
    config;
    analysisPatterns;
    isScanning = false;
    constructor(config = {}) {
        super();
        this.config = {
            rootPath: config.rootPath || './src',
            includePatterns: config.includePatterns || ['**/*.md', '**/*', '**/*', '**/*.tsx', '**/*.jsx'],
            excludePatterns: config.excludePatterns || ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
            enabledPatterns: config.enabledPatterns || [
                'todo', 'fixme', 'hack', 'deprecated', 'missing_implementation',
                'empty_function', 'code_quality', 'documentation_gap'
            ],
            maxDepth: config.maxDepth || 10,
            deepAnalysis: config.deepAnalysis !== false
        };
        this.analysisPatterns = this.initializeAnalysisPatterns();
    }
    /**
     * Initialize regex patterns for different analysis types
     */
    initializeAnalysisPatterns() {
        const patterns = new Map();
        // TODO pattern detection
        patterns.set('todo', [
            /(?:\/\/|#|<!--)\s*TODO[:\s](.*?)(?:-->|$)/gi,
            /(?:\/\*|\*)\s*TODO[:\s](.*?)(?:\*\/|$)/gi,
            /\b(?:TODO|To-Do|@todo)[:\s](.*?)(?:\n|$)/gi
        ]);
        // FIXME pattern detection  
        patterns.set('fixme', [
            /(?:\/\/|#|<!--)\s*FIXME[:\s](.*?)(?:-->|$)/gi,
            /(?:\/\*|\*)\s*FIXME[:\s](.*?)(?:\*\/|$)/gi,
            /\b(?:FIXME|FIX|@fixme)[:\s](.*?)(?:\n|$)/gi
        ]);
        // HACK pattern detection
        patterns.set('hack', [
            /(?:\/\/|#|<!--)\s*HACK[:\s](.*?)(?:-->|$)/gi,
            /(?:\/\*|\*)\s*HACK[:\s](.*?)(?:\*\/|$)/gi,
            /\b(?:HACK|HACKY|@hack)[:\s](.*?)(?:\n|$)/gi
        ]);
        // Deprecated pattern detection
        patterns.set('deprecated', [
            /@deprecated[:\s](.*?)(?:\n|$)/gi,
            /\b(?:DEPRECATED|@deprecated)[:\s](.*?)(?:\n|$)/gi,
            /(?:\/\/|#)\s*DEPRECATED[:\s](.*?)(?:\n|$)/gi
        ]);
        // Missing implementation patterns
        patterns.set('missing_implementation', [
            /throw new Error\(['"`]Not implemented['"`]\)/gi,
            /throw new NotImplementedError/gi,
            /\/\/ TODO[:\s]*implement/gi,
            /\/\* TODO[:\s]*implement/gi
        ]);
        // Empty function patterns
        patterns.set('empty_function', [
            /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/gi,
            /\w+\s*=\s*\([^)]*\)\s*=>\s*\{\s*\}/gi,
            /async\s+function\s+\w+\s*\([^)]*\)\s*\{\s*\}/gi
        ]);
        return patterns;
    }
    /**
     * Scan the configured directory for issues and generate tasks
     */
    async scanAndGenerateTasks() {
        if (this.isScanning) {
            throw new Error('Scanner is already running');
        }
        this.isScanning = true;
        const startTime = Date.now();
        try {
            logger.info(`🔍 Starting enhanced document scan in ${this.config.rootPath}`);
            const analysisResults = [];
            const scannedFiles = await this.scanDirectory(this.config.rootPath, analysisResults);
            // Generate swarm tasks from analysis results
            const generatedTasks = await this.generateSwarmTasks(analysisResults);
            const scanDuration = Date.now() - startTime;
            const results = {
                analysisResults,
                generatedTasks,
                scannedFiles,
                totalIssues: analysisResults.length,
                severityCounts: this.calculateSeverityCounts(analysisResults),
                patternCounts: this.calculatePatternCounts(analysisResults),
                scanDuration
            };
            logger.info(`✅ Scan complete: ${scannedFiles} files, ${analysisResults.length} issues, ${generatedTasks.length} tasks generated (${scanDuration}ms)`);
            this.emit('scan:completed', results);
            return results;
        }
        finally {
            this.isScanning = false;
        }
    }
    /**
     * Recursively scan directory for files to analyze
     */
    async scanDirectory(dirPath, analysisResults, depth = 0) {
        if (depth > this.config.maxDepth) {
            return 0;
        }
        let scannedFiles = 0;
        try {
            const entries = await readdir(dirPath);
            for (const entry of entries) {
                const fullPath = join(dirPath, entry);
                const stats = await stat(fullPath);
                if (stats.isDirectory()) {
                    // Check if directory should be excluded
                    if (this.shouldExcludePath(fullPath)) {
                        continue;
                    }
                    scannedFiles += await this.scanDirectory(fullPath, analysisResults, depth + 1);
                }
                else if (stats.isFile()) {
                    // Check if file should be included
                    if (this.shouldIncludeFile(fullPath)) {
                        await this.analyzeFile(fullPath, analysisResults);
                        scannedFiles++;
                    }
                }
            }
        }
        catch (error) {
            logger.warn(`Failed to scan directory ${dirPath}:`, error);
        }
        return scannedFiles;
    }
    /**
     * Analyze a single file for issues
     */
    async analyzeFile(filePath, results) {
        try {
            const content = await readFile(filePath, 'utf8');
            const lines = content.split('\n');
            const fileExt = extname(filePath);
            // Analyze each enabled pattern
            for (const pattern of this.config.enabledPatterns) {
                const patterns = this.analysisPatterns.get(pattern);
                if (!patterns)
                    continue;
                for (const regex of patterns) {
                    let match;
                    while ((match = regex.exec(content)) !== null) {
                        const lineNumber = this.getLineNumber(content, match.index);
                        const result = this.createAnalysisResult(pattern, match, filePath, lineNumber, lines[lineNumber - 1]);
                        if (result) {
                            results.push(result);
                        }
                    }
                }
            }
            // Deep analysis for TypeScript/JavaScript files
            if (this.config.deepAnalysis && ['', '.tsx', '', '.jsx'].includes(fileExt)) {
                await this.performDeepAnalysis(filePath, content, lines, results);
            }
            // Markdown-specific analysis
            if (fileExt === '.md') {
                await this.analyzeMarkdownDocument(filePath, content, results);
            }
        }
        catch (error) {
            logger.warn(`Failed to analyze file ${filePath}:`, error);
        }
    }
    /**
     * Perform deep code analysis using AST parsing
     */
    async performDeepAnalysis(filePath, content, lines, results) {
        try {
            // Check for empty functions
            const emptyFunctionMatches = content.matchAll(/(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))\s*\([^)]*\)\s*\{\s*(?:\/\/[^\n]*\n\s*)*\}/g);
            for (const match of emptyFunctionMatches) {
                const functionName = match[1] || match[2];
                const lineNumber = this.getLineNumber(content, match.index || 0);
                results.push({
                    id: this.generateId(),
                    type: 'empty_function',
                    severity: 'medium',
                    title: `Empty function: ${functionName}`,
                    description: `Function '${functionName}' appears to be empty and may need implementation`,
                    filePath,
                    lineNumber,
                    codeSnippet: lines[lineNumber - 1],
                    suggestedAction: `Implement the ${functionName} function or add documentation explaining why it's empty`,
                    estimatedEffort: 'small',
                    tags: ['implementation', 'code-quality']
                });
            }
            // Check for missing error handling
            const asyncFunctionMatches = content.matchAll(/(?:async\s+function\s+\w+|=\s*async\s*\([^)]*\)\s*=>)/g);
            for (const match of asyncFunctionMatches) {
                const functionText = this.extractFunctionBody(content, match.index || 0);
                if (functionText && !functionText.includes('try') && !functionText.includes('catch')) {
                    const lineNumber = this.getLineNumber(content, match.index || 0);
                    results.push({
                        id: this.generateId(),
                        type: 'code_quality',
                        severity: 'medium',
                        title: 'Missing error handling in async function',
                        description: 'Async function lacks proper try-catch error handling',
                        filePath,
                        lineNumber,
                        codeSnippet: lines[lineNumber - 1],
                        suggestedAction: 'Add try-catch blocks to handle potential errors',
                        estimatedEffort: 'small',
                        tags: ['error-handling', 'robustness']
                    });
                }
            }
        }
        catch (error) {
            logger.debug(`Deep analysis failed for ${filePath}:`, error);
        }
    }
    /**
     * Analyze markdown documents for documentation issues
     */
    async analyzeMarkdownDocument(filePath, content, results) {
        const lines = content.split('\n');
        // Check for incomplete sections
        const incompleteSections = content.matchAll(/(?:^|\n)##?\s+([^\n]+)\n\s*(?:\n|$)/g);
        for (const match of incompleteSections) {
            const sectionName = match[1];
            const lineNumber = this.getLineNumber(content, match.index || 0);
            results.push({
                id: this.generateId(),
                type: 'documentation_gap',
                severity: 'low',
                title: `Empty documentation section: ${sectionName}`,
                description: `Section "${sectionName}" appears to be empty and needs content`,
                filePath,
                lineNumber,
                codeSnippet: lines[lineNumber - 1],
                suggestedAction: `Add content to the "${sectionName}" section`,
                estimatedEffort: 'medium',
                tags: ['documentation', 'content']
            });
        }
        // Check for broken internal links
        const internalLinks = content.matchAll(/\[([^\]]+)\]\(([^)]+)\.md\)/g);
        for (const match of internalLinks) {
            const linkText = match[1];
            const linkPath = match[2];
            const lineNumber = this.getLineNumber(content, match.index || 0);
            results.push({
                id: this.generateId(),
                type: 'documentation_gap',
                severity: 'low',
                title: `Verify internal link: ${linkText}`,
                description: `Internal link to "${linkPath}.md" should be verified`,
                filePath,
                lineNumber,
                codeSnippet: lines[lineNumber - 1],
                suggestedAction: `Verify that "${linkPath}.md" exists and the link is correct`,
                estimatedEffort: 'small',
                tags: ['documentation', 'links']
            });
        }
    }
    /**
     * Generate swarm tasks from analysis results
     */
    async generateSwarmTasks(analysisResults) {
        const tasks = [];
        // Group similar issues for batch processing
        const groupedResults = this.groupAnalysisResults(analysisResults);
        for (const [groupKey, results] of groupedResults.entries()) {
            const task = this.createSwarmTask(groupKey, results);
            if (task) {
                tasks.push(task);
            }
        }
        return tasks;
    }
    /**
     * Group analysis results by type and file proximity
     */
    groupAnalysisResults(results) {
        const groups = new Map();
        for (const result of results) {
            // Group by pattern type and directory
            const dirPath = relative(this.config.rootPath, result.filePath).split('/')[0];
            const groupKey = `${result.type}-${dirPath}`;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey).push(result);
        }
        return groups;
    }
    /**
     * Create a swarm task from grouped analysis results
     */
    createSwarmTask(groupKey, results) {
        if (results.length === 0)
            return null;
        const [patternType, directory] = groupKey.split('-');
        const pattern = patternType;
        const primaryResult = results[0];
        const maxSeverity = this.getMaxSeverity(results);
        const taskTemplates = {
            todo: {
                title: `Complete TODO items in ${directory}/`,
                type: 'task',
                swarmType: 'implementation',
                agents: ['coder', 'reviewer']
            },
            fixme: {
                title: `Fix identified issues in ${directory}/`,
                type: 'task',
                swarmType: 'collaborative',
                agents: ['coder', 'debugger', 'tester']
            },
            empty_function: {
                title: `Implement empty functions in ${directory}/`,
                type: 'feature',
                swarmType: 'implementation',
                agents: ['architect', 'coder', 'documenter']
            },
            documentation_gap: {
                title: `Improve documentation in ${directory}/`,
                type: 'task',
                swarmType: 'single_agent',
                agents: ['documenter']
            },
            code_quality: {
                title: `Improve code quality in ${directory}/`,
                type: 'task',
                swarmType: 'collaborative',
                agents: ['architect', 'coder', 'reviewer']
            }
        };
        const template = taskTemplates[pattern] || {
            title: `Address ${pattern} issues in ${directory}/`,
            type: 'task',
            swarmType: 'collaborative',
            agents: ['coder', 'reviewer']
        };
        return {
            id: this.generateId(),
            title: template.title,
            description: this.generateTaskDescription(results),
            type: template.type,
            priority: this.severityToPriority(maxSeverity),
            estimatedHours: this.estimateEffort(results),
            sourceAnalysis: primaryResult,
            suggestedSwarmType: template.swarmType,
            requiredAgentTypes: template.agents,
            dependencies: [],
            acceptanceCriteria: this.generateAcceptanceCriteria(results)
        };
    }
    /**
     * Generate detailed task description from analysis results
     */
    generateTaskDescription(results) {
        const pattern = results[0].type;
        const fileCount = new Set(results.map(r => r.filePath)).size;
        const issueCount = results.length;
        let description = `Address ${issueCount} ${pattern} issue${issueCount > 1 ? 's' : ''} across ${fileCount} file${fileCount > 1 ? 's' : ''}.\n\n`;
        description += '**Issues to address:**\n';
        for (const result of results.slice(0, 5)) { // Show first 5 issues
            const fileName = relative(this.config.rootPath, result.filePath);
            description += `- ${fileName}:${result.lineNumber || '?'} - ${result.description}\n`;
        }
        if (results.length > 5) {
            description += `- ... and ${results.length - 5} more issues\n`;
        }
        return description;
    }
    /**
     * Generate acceptance criteria for the task
     */
    generateAcceptanceCriteria(results) {
        const criteria = [];
        const pattern = results[0].type;
        switch (pattern) {
            case 'todo':
                criteria.push('All TODO items are either implemented or converted to proper issues');
                criteria.push('Code is fully functional with no temporary placeholders');
                break;
            case 'fixme':
                criteria.push('All FIXME issues are resolved and tested');
                criteria.push('Code passes all existing tests');
                break;
            case 'empty_function':
                criteria.push('All empty functions are implemented with proper logic');
                criteria.push('Functions have appropriate documentation');
                criteria.push('Unit tests are added for new implementations');
                break;
            case 'documentation_gap':
                criteria.push('All documentation sections are complete and accurate');
                criteria.push('Links are verified and functional');
                break;
            default:
                criteria.push(`All ${pattern} issues are resolved`);
                criteria.push('Code quality standards are maintained');
        }
        return criteria;
    }
    /**
     * Utility methods
     */
    shouldIncludeFile(filePath) {
        const relativePath = relative(this.config.rootPath, filePath);
        // Check exclude patterns first
        for (const pattern of this.config.excludePatterns) {
            if (this.matchesPattern(relativePath, pattern)) {
                return false;
            }
        }
        // Check include patterns
        for (const pattern of this.config.includePatterns) {
            if (this.matchesPattern(relativePath, pattern)) {
                return true;
            }
        }
        return false;
    }
    shouldExcludePath(dirPath) {
        const relativePath = relative(this.config.rootPath, dirPath);
        return this.config.excludePatterns.some(pattern => this.matchesPattern(relativePath, pattern));
    }
    matchesPattern(path, pattern) {
        // Simple glob pattern matching
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '[^/]');
        return new RegExp(`^${regexPattern}$`).test(path);
    }
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }
    createAnalysisResult(pattern, match, filePath, lineNumber, codeLine) {
        const description = match[1]?.trim() || match[0].trim();
        return {
            id: this.generateId(),
            type: pattern,
            severity: this.getPatternSeverity(pattern),
            title: `${pattern.toUpperCase()}: ${description.substring(0, 50)}...`,
            description,
            filePath,
            lineNumber,
            codeSnippet: codeLine,
            suggestedAction: this.getSuggestedAction(pattern, description),
            estimatedEffort: this.getPatternEffort(pattern),
            tags: this.getPatternTags(pattern)
        };
    }
    getPatternSeverity(pattern) {
        const severityMap = {
            todo: 'low',
            fixme: 'medium',
            hack: 'medium',
            deprecated: 'high',
            missing_implementation: 'high',
            empty_function: 'medium',
            code_quality: 'medium',
            documentation_gap: 'low',
            test_missing: 'medium',
            performance_issue: 'medium',
            security_concern: 'critical',
            refactor_needed: 'medium'
        };
        return severityMap[pattern] || 'medium';
    }
    getPatternEffort(pattern) {
        const effortMap = {
            todo: 'small',
            fixme: 'medium',
            hack: 'medium',
            deprecated: 'large',
            missing_implementation: 'large',
            empty_function: 'medium',
            code_quality: 'medium',
            documentation_gap: 'small',
            test_missing: 'medium',
            performance_issue: 'large',
            security_concern: 'large',
            refactor_needed: 'large'
        };
        return effortMap[pattern] || 'medium';
    }
    getPatternTags(pattern) {
        const tagMap = {
            todo: ['implementation', 'task'],
            fixme: ['bug', 'fix'],
            hack: ['refactor', 'technical-debt'],
            deprecated: ['refactor', 'upgrade'],
            missing_implementation: ['feature', 'implementation'],
            empty_function: ['implementation', 'stub'],
            code_quality: ['refactor', 'quality'],
            documentation_gap: ['documentation', 'content'],
            test_missing: ['testing', 'coverage'],
            performance_issue: ['performance', 'optimization'],
            security_concern: ['security', 'critical'],
            refactor_needed: ['refactor', 'architecture']
        };
        return tagMap[pattern] || ['general'];
    }
    getSuggestedAction(pattern, description) {
        const actionMap = {
            todo: `Implement the TODO: ${description}`,
            fixme: `Fix the identified issue: ${description}`,
            hack: `Refactor the hack into proper implementation: ${description}`,
            deprecated: `Update deprecated code: ${description}`,
            missing_implementation: `Implement missing functionality: ${description}`,
            empty_function: `Add implementation to empty function`,
            code_quality: `Improve code quality: ${description}`,
            documentation_gap: `Add missing documentation: ${description}`,
            test_missing: `Add test coverage: ${description}`,
            performance_issue: `Optimize performance: ${description}`,
            security_concern: `Address security concern: ${description}`,
            refactor_needed: `Refactor code: ${description}`
        };
        return actionMap[pattern] || `Address ${pattern}: ${description}`;
    }
    extractFunctionBody(content, startIndex) {
        // Simple function body extraction - would be more sophisticated with proper AST parsing
        let braceCount = 0;
        let inFunction = false;
        let body = '';
        for (let i = startIndex; i < content.length; i++) {
            const char = content[i];
            if (char === '{') {
                inFunction = true;
                braceCount++;
            }
            if (inFunction) {
                body += char;
            }
            if (char === '}') {
                braceCount--;
                if (braceCount === 0 && inFunction) {
                    break;
                }
            }
        }
        return inFunction ? body : null;
    }
    getMaxSeverity(results) {
        const severityOrder = ['low', 'medium', 'high', 'critical'];
        return results.reduce((max, result) => {
            return severityOrder.indexOf(result.severity) > severityOrder.indexOf(max)
                ? result.severity : max;
        }, 'low');
    }
    severityToPriority(severity) {
        const mapping = {
            low: 'low',
            medium: 'medium',
            high: 'high',
            critical: 'critical'
        };
        return mapping[severity];
    }
    estimateEffort(results) {
        const effortMap = { small: 2, medium: 6, large: 16 };
        const totalHours = results.reduce((sum, result) => {
            return sum + effortMap[result.estimatedEffort];
        }, 0);
        return Math.min(totalHours, 40); // Cap at 40 hours for a single task
    }
    calculateSeverityCounts(results) {
        const counts = {};
        for (const result of results) {
            counts[result.severity] = (counts[result.severity] || 0) + 1;
        }
        return counts;
    }
    calculatePatternCounts(results) {
        const counts = {};
        for (const result of results) {
            counts[result.type] = (counts[result.type] || 0) + 1;
        }
        return counts;
    }
    generateId() {
        return `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
//# sourceMappingURL=enhanced-document-scanner.js.map