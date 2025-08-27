/**
 * @fileoverview Battle-hardened complexity analyzer using multiple NPM tools
 * Gold standard complexity analysis with comprehensive metrics
 */
import type { AnalysisOptions, ComplexityThresholds } from '../types/index.js';
export declare class ComplexityAnalyzer {
    private logger;
    ': any;
    private project?;
    private thresholds;
    constructor(thresholds?: Partial<ComplexityThresholds>);
    /**
     * Initialize TypeScript project for AST analysis
     */
    initialize(projectPath: string, options?: AnalysisOptions): Promise<void>;
}
//# sourceMappingURL=complexity-analyzer.d.ts.map