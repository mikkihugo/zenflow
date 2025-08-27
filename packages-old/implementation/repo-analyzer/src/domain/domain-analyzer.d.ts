/**
 * @fileoverview Enhanced Domain Analyzer for repository domain identification
 * Advanced domain splitting with machine learning patterns and heuristics
 */
import type { AnalysisOptions, Domain } from '../types/index.js';
export declare class DomainAnalyzer {
    private logger;
    ': any;
    /**
     * Analyze repository domains
     */
    analyzeRepository(rootPath: string, files: string[], options?: AnalysisOptions): Promise<Domain[]>;
}
//# sourceMappingURL=domain-analyzer.d.ts.map