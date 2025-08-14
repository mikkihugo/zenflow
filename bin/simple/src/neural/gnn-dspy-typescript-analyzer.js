import { getLogger } from '../config/logging-config.ts';
import { NeuralDomainMapper } from '../coordination/discovery/neural-domain-mapper.ts';
import { LLMIntegrationService } from '../coordination/services/llm-integration.service.ts';
import { createDSPyWrapper } from './dspy-wrapper.ts';
import { GNNModel } from './models/presets/gnn.js';
import { WASMNeuralAccelerator } from './wasm/wasm-neural-accelerator.ts';
const logger = getLogger('GNN-DSPy-TS-Analyzer');
export class GNNDSPyTypeScriptAnalyzer {
    gnnModel;
    domainMapper;
    dspyWrapper = null;
    llmService;
    wasmAccelerator;
    errorAnalysisProgram = null;
    fixGenerationProgram = null;
    relationshipAnalysisProgram = null;
    constructor(config = {}) {
        this.llmService = new LLMIntegrationService({
            projectPath: process.cwd(),
            preferredProvider: 'github-models',
            model: 'openai/gpt-5',
            temperature: config.temperature || 0.1,
            maxTokens: config.maxTokens || 128000,
            debug: config.debug,
        });
        this.gnnModel = new GNNModel({
            nodeDimensions: 64,
            edgeDimensions: 32,
            hiddenDimensions: 128,
            outputDimensions: 96,
            numLayers: 4,
            aggregation: 'mean',
            activation: 'relu',
            dropoutRate: 0.3,
            messagePassingSteps: 3,
        });
        this.domainMapper = new NeuralDomainMapper();
        this.wasmAccelerator = new WASMNeuralAccelerator({
            wasmPath: './wasm/neural.wasm',
            memoryPages: 256,
            maxInstances: 4,
            enableSIMD: true,
            enableThreads: false,
            optimizationLevel: 'O2',
        });
        this.initializeDSPyPrograms(config);
        logger.info('GNN-DSPy TypeScript Analyzer initialized', {
            gnnLayers: 4,
            llmProvider: 'github-models',
            llmModel: 'openai/gpt-5',
        });
    }
    async initializeDSPyPrograms(config) {
        try {
            this.dspyWrapper = await createDSPyWrapper({
                model: 'openai/gpt-5',
                temperature: config.temperature || 0.1,
                maxTokens: config.maxTokens || 128000,
                llmService: this.llmService,
                ...config,
            });
            this.errorAnalysisProgram = await this.dspyWrapper.createProgram('typescript_errors: array, error_graph: object, domain_analysis: object -> error_clusters: array, root_causes: array, fix_priority: array, reasoning: string', 'Analyze TypeScript errors using GNN relationship understanding to identify clusters, root causes, and optimal fix strategies');
            this.fixGenerationProgram = await this.dspyWrapper.createProgram('error_analysis: object, code_context: string, project_structure: object -> fix_suggestions: array, code_changes: array, impact_analysis: object, confidence: number', 'Generate intelligent TypeScript error fixes based on GNN analysis and code understanding');
            this.relationshipAnalysisProgram = await this.dspyWrapper.createProgram('error_graph: object, gnn_predictions: array, domain_mapping: object -> relationship_insights: array, cascade_analysis: object, optimization_suggestions: array', 'Analyze error relationships and cascading effects using GNN predictions for optimal fix sequencing');
            logger.info('DSPy programs initialized for TypeScript error analysis');
        }
        catch (error) {
            logger.error('Failed to initialize DSPy programs:', error);
            throw error;
        }
    }
    async analyzeTypeScriptErrors(errors) {
        logger.info('Starting GNN-enhanced TypeScript error analysis', {
            errorCount: errors.length,
        });
        try {
            const errorGraph = await this.buildErrorRelationshipGraph(errors);
            const gnnPredictions = await this.runGNNAnalysis(errorGraph);
            const domainMapping = await this.mapErrorsToDomains(errors, errorGraph);
            const analysis = await this.performDSPyErrorAnalysis(errors, errorGraph, gnnPredictions, domainMapping);
            logger.info('GNN-enhanced analysis completed', {
                clusters: analysis.errorClusters.length,
                relationships: analysis.errorRelationships.length,
                confidence: analysis.confidence,
            });
            return analysis;
        }
        catch (error) {
            logger.error('Error analysis failed:', error);
            throw error;
        }
    }
    async generateIntelligentFixes(errors, analysis, codeContext) {
        if (!(this.fixGenerationProgram && this.dspyWrapper)) {
            throw new Error('Fix generation program not initialized');
        }
        logger.info('Generating intelligent fixes using GNN analysis');
        const fixes = [];
        for (const cluster of analysis.errorClusters.sort((a, b) => b.priority - a.priority)) {
            for (const errorId of cluster.suggestedFixOrder) {
                const error = errors.find((e) => e.id === errorId);
                if (!error)
                    continue;
                try {
                    const result = await this.dspyWrapper.execute(this.fixGenerationProgram, {
                        error_analysis: {
                            error: error,
                            cluster: cluster,
                            relationships: analysis.errorRelationships.filter((r) => r.sourceError === errorId || r.targetError === errorId),
                            domain_context: analysis.domainMapping.errorDomains.find((d) => d.errors.includes(errorId)),
                        },
                        code_context: codeContext[error.file] || '',
                        project_structure: {
                            domains: analysis.domainMapping.errorDomains,
                            dependencies: analysis.domainMapping.crossDomainDependencies,
                        },
                    });
                    if (result?.success && result?.result) {
                        const suggestion = {
                            errorId: error.id,
                            fixType: this.determinateFixType(error, result.result),
                            description: result.result['fix_suggestions']?.[0]?.description ||
                                'Fix TypeScript error',
                            codeChanges: result.result['code_changes'] || [],
                            impactAnalysis: result.result['impact_analysis'] || {
                                affectedFiles: [error.file],
                                riskLevel: 'low',
                                testingRequired: false,
                                rollbackStrategy: 'Revert code changes',
                            },
                            confidence: result.result['confidence'] || 0.8,
                            reasoning: result.result['reasoning'] ||
                                'Generated using GNN-enhanced analysis',
                        };
                        fixes.push(suggestion);
                    }
                }
                catch (error) {
                    logger.warn(`Failed to generate fix for error ${errorId}:`, error);
                }
            }
        }
        logger.info('Generated intelligent fixes', { fixCount: fixes.length });
        return fixes;
    }
    async buildErrorRelationshipGraph(errors) {
        const numErrors = errors.length;
        const nodeFeatures = new Float32Array(numErrors * 8);
        for (let i = 0; i < numErrors; i++) {
            const error = errors[i];
            if (!error)
                continue;
            const baseIdx = i * 8;
            nodeFeatures[baseIdx + 0] = this.encodeErrorSeverity(error.severity);
            nodeFeatures[baseIdx + 1] = this.encodeErrorCategory(error.category);
            nodeFeatures[baseIdx + 2] = error.line / 1000;
            nodeFeatures[baseIdx + 3] = error.column / 100;
            nodeFeatures[baseIdx + 4] = error.context.codeSnippet.length / 1000;
            nodeFeatures[baseIdx + 5] = error.context.imports.length / 10;
            nodeFeatures[baseIdx + 6] = error.context.dependencies.length / 10;
            nodeFeatures[baseIdx + 7] = error.relatedErrors?.length || 0;
        }
        const adjacency = [];
        const edgeFeaturesList = [];
        for (let i = 0; i < numErrors; i++) {
            const error1 = errors[i];
            for (let j = i + 1; j < numErrors; j++) {
                const error2 = errors[j];
                if (!error2)
                    continue;
                const relationship = this.calculateErrorRelationship(error1, error2);
                if (relationship.strength > 0.3) {
                    adjacency.push([i, j]);
                    adjacency.push([j, i]);
                    edgeFeaturesList.push(relationship.strength, error1?.file === error2?.file ? 1 : 0, this.areSameFunction(error1, error2) ? 1 : 0, Math.abs((error1?.line || 0) - (error2?.line || 0)) / 100);
                    edgeFeaturesList.push(relationship.strength, error1?.file === error2?.file ? 1 : 0, this.areSameFunction(error1, error2) ? 1 : 0, Math.abs((error1?.line || 0) - (error2?.line || 0)) / 100);
                }
            }
        }
        const edgeFeatures = new Float32Array(edgeFeaturesList);
        return {
            nodes: nodeFeatures,
            edges: edgeFeatures,
            adjacency,
            errorTypes: errors.map((e) => e.category),
            relationships: [],
        };
    }
    async runGNNAnalysis(graph) {
        logger.debug('Running GNN analysis on error relationship graph');
        try {
            if (this.wasmAccelerator.getMetrics) {
                return await this.gnnModel.forward({
                    nodes: graph.nodes,
                    edges: graph.edges,
                    adjacency: graph.adjacency,
                });
            }
            return await this.gnnModel.forward({
                nodes: graph.nodes,
                edges: graph.edges,
                adjacency: graph.adjacency,
            });
        }
        catch (error) {
            logger.error('GNN analysis failed:', error);
            throw error;
        }
    }
    async mapErrorsToDomains(errors, graph) {
        const domains = this.extractDomainsFromErrors(errors);
        const dependencies = this.buildDomainDependencies(errors, graph);
        return await this.domainMapper.mapDomainRelationships(domains, dependencies);
    }
    async performDSPyErrorAnalysis(errors, graph, gnnPredictions, domainMapping) {
        if (!(this.errorAnalysisProgram && this.dspyWrapper)) {
            throw new Error('Error analysis program not initialized');
        }
        const result = await this.dspyWrapper.execute(this.errorAnalysisProgram, {
            typescript_errors: errors.map((e) => ({
                id: e.id,
                message: e.message,
                category: e.category,
                severity: e.severity,
                file: e.file,
                context: e.context,
            })),
            error_graph: {
                relationships: graph.relationships,
                adjacency: graph.adjacency,
                gnn_embeddings: Array.from(gnnPredictions),
            },
            domain_analysis: domainMapping,
        });
        if (!(result?.success && result?.result)) {
            throw new Error('DSPy error analysis failed');
        }
        const relationships = this.extractRelationshipsFromGNN(errors, gnnPredictions, graph.adjacency);
        return {
            errorClusters: result.result['error_clusters'] || [],
            errorRelationships: relationships,
            domainMapping: {
                errorDomains: domainMapping.cohesionScores?.map((cs) => ({
                    domain: cs.domainName,
                    errors: errors
                        .filter((e) => e.file.includes(cs.domainName))
                        .map((e) => e.id),
                    cohesionScore: cs.score,
                })) || [],
                crossDomainDependencies: domainMapping.crossDomainDependencies || [],
            },
            confidence: result.result['confidence'] || 0.8,
        };
    }
    calculateErrorRelationship(error1, error2) {
        let strength = 0;
        let type = 'similar';
        if (error1.file === error2.file) {
            strength += 0.3;
        }
        if (error1.category === error2.category) {
            strength += 0.2;
            type = 'similar';
        }
        if (error1.category === 'import' || error2.category === 'import') {
            if (error1.context.imports.some((imp) => error2.context.imports.includes(imp))) {
                strength += 0.4;
                type = 'dependency';
            }
        }
        if (error1.category === 'type' && error2.category === 'type') {
            if (Math.abs(error1.line - error2.line) < 10) {
                strength += 0.3;
                type = 'cascade';
            }
        }
        if (error1.relatedErrors?.includes(error2.id) ||
            error2.relatedErrors?.includes(error1.id)) {
            strength += 0.5;
            type = 'root_cause';
        }
        return { strength: Math.min(strength, 1.0), type };
    }
    extractRelationshipsFromGNN(errors, predictions, adjacency) {
        const relationships = [];
        const outputDim = predictions.length / errors.length;
        for (const [sourceIdx, targetIdx] of adjacency) {
            if (sourceIdx == null || targetIdx == null || sourceIdx >= targetIdx)
                continue;
            const sourceEmbedding = predictions.slice((sourceIdx || 0) * outputDim, ((sourceIdx || 0) + 1) * outputDim);
            const targetEmbedding = predictions.slice((targetIdx || 0) * outputDim, ((targetIdx || 0) + 1) * outputDim);
            let similarity = 0;
            for (let i = 0; i < outputDim; i++) {
                similarity += (sourceEmbedding?.[i] || 0) * (targetEmbedding?.[i] || 0);
            }
            similarity = Math.max(0, Math.min(1, similarity));
            const sourceError = errors[sourceIdx || 0];
            const targetError = errors[targetIdx || 0];
            if (similarity > 0.5 && sourceError && targetError) {
                relationships.push({
                    sourceError: sourceError.id,
                    targetError: targetError.id,
                    relationshipType: this.determineRelationshipType(sourceError, targetError),
                    strength: similarity,
                });
            }
        }
        return relationships;
    }
    encodeErrorSeverity(severity) {
        const mapping = {
            error: 1.0,
            warning: 0.5,
            info: 0.1,
        };
        return mapping[severity] || 0.5;
    }
    encodeErrorCategory(category) {
        const mapping = {
            type: 0.8,
            syntax: 0.9,
            import: 0.7,
            declaration: 0.6,
            assignment: 0.5,
            generic: 0.4,
        };
        return mapping[category] || 0.5;
    }
    areSameFunction(error1, error2) {
        return (error1.file === error2.file &&
            error1.context.functionContext === error2.context.functionContext &&
            error1.context.functionContext !== undefined);
    }
    determinateFixType(error, result) {
        if (error.category === 'type')
            return 'type_annotation';
        if (error.category === 'import')
            return 'import_fix';
        if (result.fix_suggestions?.[0]?.type)
            return result.fix_suggestions[0].type;
        return 'refactor';
    }
    determineRelationshipType(error1, error2) {
        if (error1.category === 'import' && error2.category !== 'import')
            return 'causes';
        if (error1.category === error2.category)
            return 'similar_to';
        return 'depends_on';
    }
    extractDomainsFromErrors(errors) {
        const fileGroups = new Map();
        errors.forEach((error) => {
            const domain = this.extractDomainFromFile(error.file);
            if (!fileGroups.has(domain)) {
                fileGroups.set(domain, []);
            }
            fileGroups.get(domain).push(error);
        });
        return Array.from(fileGroups.entries()).map(([domain, domainErrors]) => ({
            name: domain,
            files: Array.from(new Set(domainErrors.map((e) => e.file))),
            dependencies: Array.from(new Set(domainErrors.flatMap((e) => e.context.dependencies))),
            confidenceScore: domainErrors.length / errors.length,
        }));
    }
    extractDomainFromFile(filePath) {
        const parts = filePath.split('/');
        if (parts.includes('src')) {
            const srcIndex = parts.indexOf('src');
            return parts[srcIndex + 1] || 'root';
        }
        return 'root';
    }
    buildDomainDependencies(errors, graph) {
        const dependencies = {};
        for (const [sourceIdx, targetIdx] of graph.adjacency) {
            if (sourceIdx == null || targetIdx == null)
                continue;
            const sourceError = errors[sourceIdx];
            const targetError = errors[targetIdx];
            if (!(sourceError && targetError))
                continue;
            const sourceDomain = this.extractDomainFromFile(sourceError.file);
            const targetDomain = this.extractDomainFromFile(targetError.file);
            if (sourceDomain !== targetDomain) {
                if (!dependencies[sourceDomain]) {
                    dependencies[sourceDomain] = {};
                }
                dependencies[sourceDomain][targetDomain] =
                    (dependencies[sourceDomain][targetDomain] || 0) + 1;
            }
        }
        return dependencies;
    }
    getAnalyzerStats() {
        return {
            gnnModel: this.gnnModel.getConfig(),
            initialized: !!this.dspyWrapper,
            programs: {
                errorAnalysis: !!this.errorAnalysisProgram,
                fixGeneration: !!this.fixGenerationProgram,
                relationshipAnalysis: !!this.relationshipAnalysisProgram,
            },
            wasmAcceleration: !!this.wasmAccelerator.getMetrics,
        };
    }
    async cleanup() {
        if (this.dspyWrapper?.cleanup) {
            await this.dspyWrapper.cleanup();
        }
        await this.wasmAccelerator.shutdown();
        logger.info('GNN-DSPy TypeScript Analyzer cleaned up');
    }
}
export default GNNDSPyTypeScriptAnalyzer;
//# sourceMappingURL=gnn-dspy-typescript-analyzer.js.map