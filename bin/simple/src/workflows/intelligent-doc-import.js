#!/usr/bin/env npx tsx
import { EventEmitter } from 'events';
import { readdir, readFile } from 'fs/promises';
import { extname, join, relative } from 'path';
import { getLogger } from '../config/logging-config.js';
import { DocumentManager } from '../database/managers/document-manager.js';
const logger = getLogger('IntelligentDocImport');
export class IntelligentDocImport extends EventEmitter {
    config;
    documentManager;
    workflowGates = [];
    constructor(config) {
        super();
        this.config = config;
        this.documentManager = new DocumentManager({
            database: config.databaseConfig,
        });
    }
    async importAndAnalyze() {
        logger.info('🚀 Starting intelligent document import workflow');
        logger.info(`Repository: ${this.config.repositoryPath}`);
        try {
            this.emit('phase', 'discovery');
            const discoveredFiles = await this.discoverFiles();
            logger.info(`📁 Discovered ${discoveredFiles.length} files`);
            this.emit('phase', 'analysis');
            const analyses = await this.performSwarmAnalysis(discoveredFiles);
            logger.info(`🧠 Analyzed ${analyses.length} files with swarm intelligence`);
            this.emit('phase', 'classification');
            const classified = await this.classifyAndRecommend(analyses);
            logger.info(`📋 Classified files: ${classified.readyForImport.length} ready, ${classified.requiresApproval.length} need approval`);
            this.emit('phase', 'approval_gates');
            const approvalGates = await this.createApprovalGates(classified);
            logger.info(`🔒 Created ${approvalGates.length} approval gates`);
            this.emit('phase', 'recommendations');
            const overallRecommendations = await this.generateOverallRecommendations(classified);
            const result = {
                totalFiles: discoveredFiles.length,
                analyses,
                readyForImport: classified.readyForImport,
                requiresApproval: classified.requiresApproval,
                needsImprovement: classified.needsImprovement,
                overallRecommendations,
                approvalGates,
            };
            this.emit('completed', result);
            logger.info('✅ Intelligent import workflow completed');
            return result;
        }
        catch (error) {
            logger.error('❌ Workflow failed:', error);
            this.emit('error', error);
            throw error;
        }
    }
    async discoverFiles() {
        const files = [];
        const scanDirectory = async (dir) => {
            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!entry.name.startsWith('.') &&
                        !entry.name.includes('node_modules') &&
                        !entry.name.includes('target') &&
                        !entry.name.includes('dist') &&
                        !entry.name.includes('build')) {
                        await scanDirectory(fullPath);
                    }
                }
                else if (this.isRelevantFile(entry.name)) {
                    files.push(fullPath);
                }
            }
        };
        await scanDirectory(this.config.repositoryPath);
        return files;
    }
    isRelevantFile(filename) {
        const ext = extname(filename).toLowerCase();
        if (ext === '.md' || ext === '.rst' || ext === '.txt')
            return true;
        if ([
            '.ts',
            '.js',
            '.tsx',
            '.jsx',
            '.py',
            '.rs',
            '.go',
            '.java',
            '.cpp',
            '.hpp',
        ].includes(ext)) {
            return true;
        }
        if (filename.toLowerCase().includes('readme') ||
            filename.toLowerCase().includes('changelog') ||
            filename.toLowerCase().includes('todo')) {
            return true;
        }
        return false;
    }
    async performSwarmAnalysis(files) {
        const results = [];
        logger.info('🐝 Initializing analysis swarm...');
        const batchSize = 10;
        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map((file) => this.analyzeFile(file)));
            results.push(...batchResults);
            this.emit('progress', {
                phase: 'analysis',
                completed: i + batch.length,
                total: files.length,
            });
        }
        return results;
    }
    async analyzeFile(filePath) {
        const relativePath = relative(this.config.repositoryPath, filePath);
        const ext = extname(filePath).toLowerCase();
        const content = await readFile(filePath, 'utf8');
        logger.debug(`🔍 Analyzing: ${relativePath}`);
        const fileType = this.determineFileType(filePath, content);
        const result = {
            filePath: relativePath,
            fileType,
            recommendations: {
                action: 'manual_review',
                reasoning: 'Analysis in progress',
                confidence: 0.5,
            },
        };
        if (fileType === 'document') {
            result.documentType = this.classifyDocument(filePath, content);
            if (this.config.analysisConfig.analyzeDocuments) {
                result.llmAnalysis = await this.performLLMDocumentAnalysis(content, result.documentType);
            }
        }
        if (fileType === 'code' && this.config.analysisConfig.checkDocumentation) {
            result.documentationScore = await this.analyzeDocumentationCompleteness(content, ext);
        }
        result.recommendations = await this.generateRecommendations(result);
        return result;
    }
    determineFileType(filePath, content) {
        const ext = extname(filePath).toLowerCase();
        const filename = filePath.toLowerCase();
        if (ext === '.md' || ext === '.rst' || ext === '.txt')
            return 'document';
        if ([
            '.ts',
            '.js',
            '.tsx',
            '.jsx',
            '.py',
            '.rs',
            '.go',
            '.java',
            '.cpp',
            '.hpp',
        ].includes(ext)) {
            return 'code';
        }
        if (['.json', '.yaml', '.yml', '.toml', '.ini'].includes(ext) ||
            filename.includes('package.json') ||
            filename.includes('tsconfig') ||
            filename.includes('config')) {
            return 'config';
        }
        return 'other';
    }
    classifyDocument(filePath, content) {
        const filename = filePath.toLowerCase();
        const contentLower = content.toLowerCase();
        if (filename.includes('readme') || filename.includes('vision'))
            return 'vision';
        if (filename.includes('adr-') || filename.includes('decision'))
            return 'adr';
        if (filename.includes('prd') || filename.includes('requirements'))
            return 'prd';
        if (filename.includes('epic'))
            return 'epic';
        if (filename.includes('feature'))
            return 'feature';
        if (filename.includes('todo') || filename.includes('task'))
            return 'task';
        if (filename.includes('spec') || filename.includes('specification'))
            return 'spec';
        if (contentLower.includes('# vision') ||
            contentLower.includes('product vision'))
            return 'vision';
        if (contentLower.includes('architectural decision') ||
            contentLower.includes('# adr'))
            return 'adr';
        if (contentLower.includes('product requirements') ||
            contentLower.includes('# prd'))
            return 'prd';
        if (contentLower.includes('# epic') || contentLower.includes('user story'))
            return 'epic';
        if (contentLower.includes('# feature') || contentLower.includes('feature:'))
            return 'feature';
        if (contentLower.includes('# todo') || contentLower.includes('- [ ]'))
            return 'task';
        if (contentLower.includes('specification') ||
            contentLower.includes('# spec'))
            return 'spec';
        return 'task';
    }
    async performLLMDocumentAnalysis(content, documentType) {
        const qualityFactors = {
            hasIntroduction: content.includes('# ') || content.includes('## '),
            hasStructure: (content.match(/^#+/gm) || []).length >= 3,
            hasExamples: content.includes('```') || content.includes('example'),
            isComprehensive: content.length > 500,
            isWellFormatted: content.includes('\n') && !content.includes('\t\t\t'),
        };
        const qualityScore = Object.values(qualityFactors).filter(Boolean).length /
            Object.keys(qualityFactors).length;
        return {
            qualityScore,
            completenessScore: content.length > 1000 ? 0.8 : content.length / 1250,
            suggestions: [
                ...(qualityScore < 0.7
                    ? ['Improve document structure with clear headings']
                    : []),
                ...(content.length < 500 ? ['Add more comprehensive content'] : []),
                ...(!content.includes('```')
                    ? ['Add code examples or usage samples']
                    : []),
            ],
            riskFactors: [
                ...(content.length < 200
                    ? ['Document too short for comprehensive understanding']
                    : []),
                ...(qualityScore < 0.5
                    ? ['Poor document structure may confuse readers']
                    : []),
            ],
            confidence: 0.8,
        };
    }
    async analyzeDocumentationCompleteness(content, fileExt) {
        const functions = this.extractFunctions(content, fileExt);
        const classes = this.extractClasses(content, fileExt);
        const interfaces = this.extractInterfaces(content, fileExt);
        const functionDocumentation = functions.filter((f) => f.hasDocumentation).length /
            Math.max(functions.length, 1);
        const classDocumentation = classes.filter((c) => c.hasDocumentation).length /
            Math.max(classes.length, 1);
        const interfaceDocumentation = interfaces.filter((i) => i.hasDocumentation).length /
            Math.max(interfaces.length, 1);
        const overall = (functionDocumentation + classDocumentation + interfaceDocumentation) / 3;
        const missing = [
            ...functions
                .filter((f) => !f.hasDocumentation)
                .map((f) => `Function: ${f.name}`),
            ...classes
                .filter((c) => !c.hasDocumentation)
                .map((c) => `Class: ${c.name}`),
            ...interfaces
                .filter((i) => !i.hasDocumentation)
                .map((i) => `Interface: ${i.name}`),
        ];
        return {
            overall,
            functions: functionDocumentation,
            classes: classDocumentation,
            interfaces: interfaceDocumentation,
            missing,
        };
    }
    extractFunctions(content, fileExt) {
        const functions = [];
        if (fileExt === '.ts' || fileExt === '.js') {
            const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(\w+)\s*=\s*(?:async\s+)?\(/g;
            const lines = content.split('\n');
            let match;
            while ((match = functionRegex.exec(content)) !== null) {
                const functionName = match[1] || match[2];
                const lineIndex = content.substring(0, match.index).split('\n').length - 1;
                const hasDocumentation = lineIndex > 0 &&
                    (lines[lineIndex - 1]?.trim().includes('*/') ||
                        lines[lineIndex - 1]?.trim().startsWith('//') ||
                        lines[lineIndex - 2]?.trim().includes('/**'));
                functions.push({ name: functionName, hasDocumentation });
            }
        }
        return functions;
    }
    extractClasses(content, fileExt) {
        const classes = [];
        if (fileExt === '.ts' || fileExt === '.js') {
            const classRegex = /(?:export\s+)?class\s+(\w+)/g;
            const lines = content.split('\n');
            let match;
            while ((match = classRegex.exec(content)) !== null) {
                const className = match[1];
                const lineIndex = content.substring(0, match.index).split('\n').length - 1;
                const hasDocumentation = lineIndex > 0 &&
                    (lines[lineIndex - 1]?.trim().includes('*/') ||
                        lines[lineIndex - 2]?.trim().includes('/**'));
                classes.push({ name: className, hasDocumentation });
            }
        }
        return classes;
    }
    extractInterfaces(content, fileExt) {
        const interfaces = [];
        if (fileExt === '.ts') {
            const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
            const lines = content.split('\n');
            let match;
            while ((match = interfaceRegex.exec(content)) !== null) {
                const interfaceName = match[1];
                const lineIndex = content.substring(0, match.index).split('\n').length - 1;
                const hasDocumentation = lineIndex > 0 &&
                    (lines[lineIndex - 1]?.trim().includes('*/') ||
                        lines[lineIndex - 2]?.trim().includes('/**'));
                interfaces.push({ name: interfaceName, hasDocumentation });
            }
        }
        return interfaces;
    }
    async generateRecommendations(analysis) {
        let confidence = 0.5;
        let action = 'manual_review';
        let reasoning = 'Requires manual review';
        const improvements = [];
        if (analysis.fileType === 'document' && analysis.llmAnalysis) {
            confidence = analysis.llmAnalysis.confidence;
            if (analysis.llmAnalysis.qualityScore >= 0.8 &&
                analysis.llmAnalysis.completenessScore >= 0.8) {
                action = 'import';
                reasoning = 'High quality document ready for import';
            }
            else if (analysis.llmAnalysis.qualityScore >= 0.6) {
                action = 'improve';
                reasoning = 'Good document that could benefit from improvements';
                improvements.push(...analysis.llmAnalysis.suggestions);
            }
            else {
                action = 'manual_review';
                reasoning = 'Document quality below threshold, needs manual review';
            }
        }
        if (analysis.fileType === 'code' && analysis.documentationScore) {
            const score = analysis.documentationScore.overall;
            if (score >= 0.9) {
                action = 'import';
                reasoning = 'Well-documented code ready for import';
                confidence = 0.9;
            }
            else if (score >= 0.6) {
                action = 'improve';
                reasoning = 'Code partially documented, improvements recommended';
                confidence = 0.7;
                improvements.push(`Add documentation for ${analysis.documentationScore.missing.length} missing items`);
            }
            else {
                action = 'manual_review';
                reasoning = 'Poor documentation coverage, manual review required';
                confidence = 0.6;
            }
        }
        if (confidence >= this.config.analysisConfig.autoApprovalThreshold) {
            if (action === 'manual_review') {
                action = 'import';
                reasoning += ' (auto-approved due to high confidence)';
            }
        }
        return {
            action,
            reasoning,
            improvements: improvements.length > 0 ? improvements : undefined,
            confidence,
        };
    }
    async classifyAndRecommend(analyses) {
        const readyForImport = analyses.filter((a) => a.recommendations.action === 'import');
        const needsImprovement = analyses.filter((a) => a.recommendations.action === 'improve');
        const requiresApproval = analyses.filter((a) => a.recommendations.action === 'manual_review' ||
            a.recommendations.confidence <
                this.config.analysisConfig.autoApprovalThreshold);
        return { readyForImport, requiresApproval, needsImprovement };
    }
    async createApprovalGates(classified) {
        const gates = [];
        for (const analysis of classified.requiresApproval) {
            const gate = new WorkflowGateRequest({
                id: `doc-approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: `Approve Import: ${analysis.filePath}`,
                description: `Review and approve import of ${analysis.fileType}: ${analysis.filePath}`,
                context: {
                    fileAnalysis: analysis,
                    recommendations: analysis.recommendations,
                    workflowType: 'document_import_approval',
                },
                validationQuestions: [
                    {
                        question: `Should we import "${analysis.filePath}" as a ${analysis.documentType || analysis.fileType}?`,
                        context: `Analysis: ${analysis.recommendations.reasoning}`,
                        suggestedAnswer: analysis.recommendations.action === 'import' ? 'yes' : 'no',
                        confidence: analysis.recommendations.confidence,
                        rationale: analysis.recommendations.reasoning,
                        alternatives: analysis.recommendations.improvements || [],
                    },
                ],
                priority: analysis.recommendations.confidence > 0.8 ? 'high' : 'medium',
                escalation: {
                    enabled: true,
                    timeoutMinutes: 60,
                    escalateTo: 'system-admin',
                },
            });
            gates.push(gate);
            this.workflowGates.push(gate);
        }
        for (const analysis of classified.needsImprovement) {
            const gate = new WorkflowGateRequest({
                id: `doc-improve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: `Review Improvements: ${analysis.filePath}`,
                description: `Review suggested improvements for ${analysis.filePath}`,
                context: {
                    fileAnalysis: analysis,
                    improvements: analysis.recommendations.improvements,
                    workflowType: 'document_improvement_review',
                },
                validationQuestions: [
                    {
                        question: `Apply suggested improvements to "${analysis.filePath}"?`,
                        context: `Improvements: ${analysis.recommendations.improvements?.join(', ')}`,
                        suggestedAnswer: 'yes',
                        confidence: analysis.recommendations.confidence,
                        rationale: 'Improvements will enhance document quality',
                        alternatives: ['Import as-is', 'Manual edit', 'Skip import'],
                    },
                ],
                priority: 'low',
            });
            gates.push(gate);
            this.workflowGates.push(gate);
        }
        logger.info(`🔒 Created ${gates.length} approval gates`);
        return gates;
    }
    async generateOverallRecommendations(classified) {
        const total = classified.readyForImport.length +
            classified.requiresApproval.length +
            classified.needsImprovement.length;
        const readyPercent = (classified.readyForImport.length / total) * 100;
        const summary = `Repository analysis complete. ${readyPercent.toFixed(0)}% of files ready for immediate import.`;
        const keyFindings = [
            `${classified.readyForImport.length} files ready for automatic import`,
            `${classified.requiresApproval.length} files require manual approval`,
            `${classified.needsImprovement.length} files would benefit from improvements`,
        ];
        const suggestedActions = [
            'Import ready files immediately to database',
            'Review approval gates for manual validation',
            'Apply suggested improvements to enhance quality',
            'Consider establishing documentation standards',
        ];
        let estimatedEffort = 'low';
        if (classified.requiresApproval.length > total * 0.3)
            estimatedEffort = 'medium';
        if (classified.requiresApproval.length > total * 0.6)
            estimatedEffort = 'high';
        return {
            summary,
            keyFindings,
            suggestedActions,
            estimatedEffort,
        };
    }
    async executeApprovedImports(approvedFiles) {
        logger.info(`💾 Storing ${approvedFiles.length} approved files in database`);
        for (const analysis of approvedFiles) {
            try {
                const fullPath = join(this.config.repositoryPath, analysis.filePath);
                const content = await readFile(fullPath, 'utf8');
                await this.documentManager.createDocument(analysis.documentType || 'task', {
                    title: analysis.filePath,
                    content: content,
                    metadata: {
                        originalPath: analysis.filePath,
                        analysisResults: analysis,
                        importDate: new Date(),
                        source: 'intelligent_import',
                    },
                });
                logger.debug(`✅ Stored: ${analysis.filePath}`);
            }
            catch (error) {
                logger.error(`❌ Failed to store ${analysis.filePath}:`, error);
            }
        }
        logger.info('💾 Database import completed');
    }
    getApprovalStatus() {
        return this.workflowGates.map((gate) => ({
            gateId: gate.id,
            status: gate.status || 'pending',
            filePath: gate.context?.fileAnalysis?.filePath || 'unknown',
        }));
    }
}
//# sourceMappingURL=intelligent-doc-import.js.map