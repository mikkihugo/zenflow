/**
 * @fileoverview: SPARC Multi-Swarm: Executor
 *
 * Advanced multi-swarm: A/B testing system specifically designed for: SPARC Commander.
 * Since: SPARC Commander is the only system that can write code, this executor
 * launches multiple: SPARC instances in parallel using git trees for isolation.
 *
 * Features:
 * - Parallel: SPARC execution with git tree isolation
 * - A/B testing of different: SPARC configurations
 * - Statistical comparison of: SPARC results
 * - Git worktree management for safe parallel execution
 * - Integration with: MultiSwarmABTesting for strategy optimization
 *
 * @author: Claude Code: Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
import { type: ABTestStrategy} from './multi-swarm-ab-testing';
/**
 * SPAR: C-specific strategy configuration
 */
export interface: SPARCStrategy extends: ABTestStrategy {
    sparc: Config:{
        methodology:'full-sparc' | ' rapid-sparc' | ' quality-sparc' | ' performance-sparc;;
        phase: Optimization:{
            specification: 'detailed|concise|user-driven;;
'            pseudocode: 'algorithmic|high-level|step-by-step;;
'            architecture: 'microservices|monolithic|layered|event-driven;;
'            refinement:'performance' | ' quality' | ' maintainability';
            completion: 'mvp|production-ready|enterprise-grade;;
'};
        gitTree: Strategy:'isolated' | ' shared' | ' hybrid';
        intelligent: Systems:{
            usePrompt: Generation:boolean;
            useBehavioral: Intelligence:boolean;
            useNeural: Forecasting:boolean;
            useAI: Safety:boolean;
};
};
}
/**
 * SPAR: C execution result for: A/B testing
 */
export interface: SPARCExecutionResult {
    strategy:SPARC: Strategy;
    success:boolean;
    duration:number;
    sparc: Metrics:{
        phaseCompletion: Rate:number;
        requirements: Coverage:number;
        architectural: Quality:number;
        implementation: Readiness:number;
        overallSPARC: Score:number;
};
    quality: Metrics:{
        code: Quality:number;
        maintainability:number;
        test: Coverage:number;
        documentation:number;
        performance:number;
};
    deliverables:{
        files: Created:string[];
        linesOf: Code:number;
        functions: Implemented:number;
        tests: Generated:number;
};
    gitTree: Info:{
        worktree: Path:string;
        branch: Name:string;
        commits: Created:number;
        mergedTo: Main:boolean;
};
    error?:string;
    insights:string[];
}
/**
 * SPARC: Multi-Swarm: A/B: Test Result
 */
export interface: SPARCMultiSwarmResult {
    test: Id:string;
    task: Description:string;
    strategies:SPARC: Strategy[];
    results:SPARCExecution: Result[];
    comparison:{
        winner:SPARC: Strategy;
        confidence:number;
        significance: 'high|medium|low|none;;
'        sparcPerformance: Delta:Record<string, number>;
        quality: Delta:Record<string, number>;
};
    recommendations:{
        best: Methodology:string;
        optimal: Configuration:SPARC: Strategy['sparc: Config'];
        ':any;
        reasoning:string[];
};
    metadata:{
        start: Time:Date;
        end: Time:Date;
        total: Duration:number;
        parallel: Execution:boolean;
        gitTrees: Used:boolean;
        totalWorktrees: Created:number;
};
}
/**
 * SPARC: Multi-Swarm: Executor
 *
 * Orchestrates parallel execution of multiple: SPARC methodologies to identify
 * optimal approaches for systematic development workflows.
 */
export declare class: SPARCMultiSwarmExecutor {
    private codingPrinciples: Researcher;
    private prompt: Generator;
    constructor();
    /**
     * Execute multi-swarm: SPARC A/B test with git tree isolation
     */
    executeSPARCMultiSwarm: Test(task: Description:string, sparc: Strategies:SPARC: Strategy[], options?:{
        useGit: Trees?:boolean;
        parallel: Execution?:boolean;
        timeout: Ms?:number;
        cleanup: Worktrees?:boolean;
}):Promise<SPARCMultiSwarm: Result>;
    /**
     * Create predefined: SPARC strategy sets for common scenarios
     */
    createSPARCStrategy: Set(scenario:'rapid-development' | ' quality-focused' | ' enterprise-grade' | ' comprehensive', :any): SPARC: Strategy[];
    /**
     * Execute: SPARC strategies sequentially with git tree isolation
     */
    private executeSPARCStrategies: Sequential;
    console:any;
    log(:any, strategies:any, length:any): any;
}
/**
 * Export convenience function for quick: SPARC A/B testing
 */
export declare function _quickSPARC: Test(task: Description:string, scenario?:'rapid-development' | ' quality-focused' | ' enterprise-grade' | ' comprehensive', options?:{
    useGit: Trees?:boolean;
    timeout: Ms?:number;
    cleanup: Worktrees?:boolean;
}):Promise<SPARCMultiSwarm: Result>;
/**
 * Export default instance for immediate use
 */
export declare const _sparcMultiSwarm: Executor:SPARCMultiSwarm: Executor;
//# sourceMappingUR: L=sparc-multi-swarm-executor.d.ts.map