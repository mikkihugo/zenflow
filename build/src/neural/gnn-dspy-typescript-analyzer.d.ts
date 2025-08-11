/**
 * @file GNN-Enhanced DSPy TypeScript Error Analyzer.
 *
 * Integrates Graph Neural Networks with DSPy for intelligent TypeScript error fixing.
 * Uses GNN to understand error relationships and DSPy for generating intelligent fixes.
 */
import type { DSPyConfig } from './types/dspy-types.ts';
export interface TypeScriptError {
    id: string;
    message: string;
    code: string;
    file: string;
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info';
    category: 'type' | 'syntax' | 'import' | 'declaration' | 'assignment' | 'generic';
    relatedErrors?: string[];
    context: {
        codeSnippet: string;
        functionContext?: string;
        classContext?: string;
        imports: string[];
        dependencies: string[];
    };
}
export interface ErrorRelationshipGraph {
    nodes: Float32Array;
    edges: Float32Array;
    adjacency: number[][];
    errorTypes: string[];
    relationships: Array<{
        source: string;
        target: string;
        type: 'dependency' | 'cascade' | 'similar' | 'root_cause';
        weight: number;
    }>;
}
export interface GNNErrorAnalysis {
    errorClusters: Array<{
        clusterId: string;
        errors: string[];
        rootCause: string;
        priority: number;
        suggestedFixOrder: string[];
    }>;
    errorRelationships: Array<{
        sourceError: string;
        targetError: string;
        relationshipType: 'causes' | 'similar_to' | 'depends_on';
        strength: number;
    }>;
    domainMapping: {
        errorDomains: Array<{
            domain: string;
            errors: string[];
            cohesionScore: number;
        }>;
        crossDomainDependencies: Array<{
            sourceDomain: string;
            targetDomain: string;
            errorCount: number;
        }>;
    };
    confidence: number;
}
export interface IntelligentFixSuggestion {
    errorId: string;
    fixType: 'type_annotation' | 'import_fix' | 'refactor' | 'config_change' | 'dependency_update';
    description: string;
    codeChanges: Array<{
        file: string;
        line: number;
        column: number;
        oldCode: string;
        newCode: string;
        explanation: string;
    }>;
    impactAnalysis: {
        affectedFiles: string[];
        riskLevel: 'low' | 'medium' | 'high';
        testingRequired: boolean;
        rollbackStrategy: string;
    };
    confidence: number;
    reasoning: string;
}
export declare class GNNDSPyTypeScriptAnalyzer {
    private gnnModel;
    private domainMapper;
    private dspyWrapper;
    private wasmAccelerator;
    private errorAnalysisProgram;
    private fixGenerationProgram;
    private relationshipAnalysisProgram;
    constructor(config?: DSPyConfig);
    private initializeDSPyPrograms;
    /**
     * Analyze TypeScript errors using GNN-enhanced DSPy intelligence.
     *
     * @param errors
     */
    analyzeTypeScriptErrors(errors: TypeScriptError[]): Promise<GNNErrorAnalysis>;
    /**
     * Generate intelligent fixes for TypeScript errors.
     *
     * @param errors
     * @param analysis
     * @param codeContext
     */
    generateIntelligentFixes(errors: TypeScriptError[], analysis: GNNErrorAnalysis, codeContext: Record<string, string>): Promise<IntelligentFixSuggestion[]>;
    private buildErrorRelationshipGraph;
    private runGNNAnalysis;
    private mapErrorsToDomains;
    private performDSPyErrorAnalysis;
    private calculateErrorRelationship;
    private extractRelationshipsFromGNN;
    private encodeErrorSeverity;
    private encodeErrorCategory;
    private areSameFunction;
    private determinateFixType;
    private determineRelationshipType;
    private extractDomainsFromErrors;
    private extractDomainFromFile;
    private buildDomainDependencies;
    /**
     * Get system statistics.
     */
    getAnalyzerStats(): {
        gnnModel: any;
        initialized: boolean;
        programs: {
            errorAnalysis: boolean;
            fixGeneration: boolean;
            relationshipAnalysis: boolean;
        };
        wasmAcceleration: boolean;
    };
    /**
     * Cleanup resources.
     */
    cleanup(): Promise<void>;
}
export default GNNDSPyTypeScriptAnalyzer;
//# sourceMappingURL=gnn-dspy-typescript-analyzer.d.ts.map