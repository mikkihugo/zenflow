/**
 * @fileoverview Main Repository Analyzer - Orchestrates all analysis components
 * Battle-hardened repository analysis with comprehensive metrics and recommendations
 */
import type { AnalysisOptions, AnalysisResult} from './types/index.js';
export declare class RepositoryAnalyzer {
    private repositoryPath;
    private logger;
    ':any;
    constructor(repositoryPath:string);
    /**
     * Perform comprehensive repository analysis
     */
    analyze(_options?:AnalysisOptions): Promise<AnalysisResult>;
    private getRepositoryName;
    private getSettledValue;
    private getEmptyComplexity;
    private getEmptyDependencies;
}
//# sourceMappingURL=repository-analyzer.d.ts.map