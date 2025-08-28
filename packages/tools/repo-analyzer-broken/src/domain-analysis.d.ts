/**
 * Domain Analyzer - Analyzes code domains and architectural boundaries
 * Moved from main app to repo-analyzer package for better organization
 *
 * This module provides sophisticated domain analysis capabilities for identifying
 * architectural boundaries, domain relationships, and code organization patterns.
 *
 * Enhanced with DeepCode patterns for better repository intelligence.
 */
import { TypedEventBase} from '@claude-zen/foundation';
export interface DomainBoundary {
    /** Unique identifier for the domain boundary */
    id:string;
    /** Domain name */
    name:string;
    /** Domain description */
    description:string;
    /** Root path of the domain */
    rootPath:string;
    /** Files belonging to this domain */
    files:string[];
    /** Subdirectories within the domain */
    subdirectories:string[];
    /** Domain type classification */
    type: 'core | support | infrastructure | application | presentation;;
'    /** Confidence score for domain identification (0-1) */
    confidence:number;
}
export interface DomainRelationship {
    /** Source domain ID */
    sourceId:string;
    /** Target domain ID */
    targetId:string;
    /** Relationship type */
    type: 'depends-on | uses | extends | implements | aggregates | composes;;
'    /** Relationship strength (0-1) */
    strength:number;
    /** Evidence for the relationship */
    evidence:string[];
    /** Number of connections */
    connectionCount:number;
}
export interface DomainMetrics {
    /** Cyclomatic complexity */
    cyclomaticComplexity:number;
    /** Lines of code */
    linesOfCode:number;
    /** Number of files */
    fileCount:number;
    /** Number of dependencies */
    dependencyCount:number;
    /** Cohesion score (0-1) */
    cohesion:number;
    /** Coupling score (0-1, lower is better) */
    coupling:number;
    /** Maintainability index */
    maintainabilityIndex:number;
}
export interface DomainAnalysis {
    /** Identified domain boundaries */
    domains:DomainBoundary[];
    /** Relationships between domains */
    relationships:DomainRelationship[];
    /** Domain categories for classification */
    categories:string[];
    /** Domain complexity metrics */
    complexity:number;
    /** Domain coupling metrics */
    coupling:number;
    /** Tightly coupled groups of domains */
    tightlyCoupledGroups:DomainBoundary[][];
    /** Overall analysis metrics */
    metrics:{
        totalDomains:number;
        averageCohesion:number;
        averageCoupling:number;
        architecturalQuality:number;
};
    /** Analysis timestamp */
    timestamp:Date;
    /** Analysis configuration used */
    config:DomainAnalysisConfig;
}
export interface DomainAnalysisConfig {
    /** Root directory to analyze */
    rootPath:string;
    /** File patterns to include */
    includePatterns:string[];
    /** File patterns to exclude */
    excludePatterns:string[];
    /** Minimum files required for a domain */
    minFilesPerDomain:number;
    /** Maximum depth to analyze */
    maxDepth:number;
    /** Enable dependency analysis */
    analyzeDependencies:boolean;
    /** Enable semantic analysis */
    enableSemanticAnalysis:boolean;
}
export interface CodeFile {
    /** File path */
    path:string;
    /** File content */
    content:string;
    /** Extracted imports */
    imports:string[];
    /** Extracted exports */
    exports:string[];
    /** Identified concepts */
    concepts:string[];
    /** File metrics */
    metrics:{
        linesOfCode:number;
        complexity:number;
        maintainability:number;
};
}
export declare class DomainAnalysisEngine extends TypedEventBase {
    private configuration;
    private discoveredDomains;
    private analyzedFiles;
    private relationships;
    constructor(config:DomainAnalysisConfig);
    /**
     * Perform comprehensive domain analysis
     */
    analyzeDomains():Promise<DomainAnalysis>;
    /**
     * Analyze domain complexity metrics
     */
    analyzeDomainComplexity(domainPath:string): Promise<number>;
    /**
     * Analyze a specific domain
     */
    analyzeDomain(domainPath:string): Promise<DomainBoundary | null>;
    /**
     * Get domain metrics
     */
    getDomainMetrics(domainId:string): Promise<DomainMetrics | null>;
    /**
     * Get suggested domain improvements
     */
    getSuggestedImprovements(domainId:string): Promise<string[]>;
    private discoverFiles;
    private discoverFilesInPath;
    private extractConcepts;
    private calculateFileMetrics;
    number:any;
    complexity:number;
    maintainability:number;
}
//# sourceMappingURL=domain-analysis.d.ts.map