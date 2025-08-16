/**
 * Unified Documentation Linker - Direct Integration.
 *
 * Links code references to documentation and generates cross-references.
 * Integrated directly into core without plugin architecture.
 */
/**
 * @file Documentation-linker implementation.
 */
import { EventEmitter } from 'node:events';
export interface DocumentationIndex {
    id: string;
    title: string;
    path: string;
    type: 'vision' | 'adr' | 'prd' | 'epic' | 'feature' | 'task' | 'spec' | 'readme' | 'api' | 'guide';
    keywords: string[];
    sections: Array<{
        title: string;
        level: number;
        content: string;
    }>;
    metadata: {
        created: Date;
        modified: Date;
        size: number;
        language?: string;
    };
    links: Array<{
        type: 'internal' | 'external' | 'code';
        target: string;
        text: string;
    }>;
}
export interface CodeReference {
    file: string;
    line: number;
    column?: number;
    type: 'todo' | 'comment' | 'function' | 'class' | 'method' | 'import';
    text: string;
    context: string;
    suggestedLinks: Array<{
        documentId: string;
        title: string;
        relevance: number;
        reason: string;
    }>;
    confidence: number;
}
export interface CrossReference {
    sourceDocument: string;
    targetDocument: string;
    linkType: 'references' | 'implements' | 'extends' | 'validates' | 'supersedes';
    confidence: number;
    context: string;
}
export interface LinkSuggestion {
    type: 'missing_doc' | 'broken_link' | 'enhancement' | 'cross_reference';
    source: string;
    target?: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    autoFixable: boolean;
}
export declare class DocumentationLinker extends EventEmitter {
    private documentationIndex;
    private codeReferences;
    private crossReferences;
    private config;
    constructor(config?: Record<string, unknown>);
    initialize(): Promise<void>;
    /**
     * Index all documentation files.
     */
    private indexDocumentation;
    private indexDirectory;
    private indexDocument;
    /**
     * Analyze code files for documentation references.
     */
    private analyzeCodeReferences;
    private analyzeCodeDirectory;
    private analyzeCodeFile;
    private addCodeReference;
    /**
     * Generate cross-references between documents.
     */
    private generateCrossReferences;
    /**
     * Generate documentation enhancement suggestions.
     */
    generateLinkSuggestions(): Promise<LinkSuggestion[]>;
    /**
     * Generate comprehensive documentation report.
     */
    generateDocumentationReport(): Promise<string>;
    /**
     * Utility methods.
     *
     * @param text
     */
    private findRelatedDocumentation;
    private calculateLinkConfidence;
    private analyzeDocumentRelationship;
    private isSupportedDocumentFile;
    private isCodeFile;
    private generateDocumentId;
    private extractTitle;
    private determineDocumentType;
    private extractKeywords;
    private extractSections;
    private extractLinks;
    private getContextLines;
    /**
     * Public API methods.
     */
    getDocumentationIndex(): Map<string, DocumentationIndex>;
    getCodeReferences(): CodeReference[];
    getCrossReferences(): CrossReference[];
    saveReportToFile(outputPath: string): Promise<void>;
}
//# sourceMappingURL=documentation-linker.d.ts.map