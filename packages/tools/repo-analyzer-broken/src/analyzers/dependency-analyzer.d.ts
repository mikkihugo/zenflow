/**
 * @fileoverview Battle-hardened dependency analyzer using madge and detective
 * Gold standard dependency analysis with graph theory and advanced metrics
 */
import type { AnalysisOptions, DependencyMetrics} from '../types/index.js';
export declare class DependencyAnalyzer {
    private logger;
    ':any;
    /**
     * Analyze dependencies for the entire repository
     */
    analyzeRepository(rootPath:string, options?:AnalysisOptions): Promise<DependencyMetrics>;
}
//# sourceMappingURL=dependency-analyzer.d.ts.map