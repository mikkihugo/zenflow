/**
 * Domain analyzer for complexity analysis and splitting recommendations.
 */
/**
 * @file domain-analyzer implementation
 */
export interface DomainAnalysis {
    domainPath: string;
    complexity: number;
    complexityScore: number;
    files: any[];
    metrics: Record<string, unknown>;
    subdomains?: any[];
    categories: Record<string, any[]>;
    coupling: {
        internal: number;
        external: number;
        tightlyCoupledGroups: Array<{
            files: string[];
            couplingScore: number;
        }>;
    };
}
export interface AnalysisConfig {
    [key: string]: unknown;
}
export interface SubDomainPlan {
    name: string;
    files: string[];
    dependencies: string[];
}
export interface SplittingMetrics {
    totalComplexity: number;
    reductionPercentage: number;
    maintainabilityScore: number;
}
export interface DomainAnalyzer {
    analyzeDomainComplexity(domainPath: string): Promise<DomainAnalysis>;
    identifySubDomains(analysis: DomainAnalysis): Promise<SubDomainPlan[]>;
    calculateSplittingBenefits(plan: SubDomainPlan[]): Promise<SplittingMetrics>;
}
export declare class DomainAnalysisEngine implements DomainAnalyzer {
    private config;
    constructor(config?: AnalysisConfig);
    analyzeDomainComplexity(domainPath: string): Promise<DomainAnalysis>;
    identifySubDomains(analysis: DomainAnalysis): Promise<SubDomainPlan[]>;
    calculateSplittingBenefits(plans: SubDomainPlan[]): Promise<SplittingMetrics>;
}
//# sourceMappingURL=domain-analyzer.d.ts.map