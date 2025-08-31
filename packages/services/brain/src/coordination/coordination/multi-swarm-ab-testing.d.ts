/**
 * @fileoverview: Multi-Swarm: A/B: Testing System
 *
 * Advanced: A/B testing system that launches multiple swarms simultaneously
 * to compare results and identify optimal approaches. Supports git tree
 * integration and multiple: AI model backends (Claude, Gemini, Aider, etc.)
 *
 * Features:
 * - Parallel swarm execution with result comparison
 * - Git tree integration for isolated testing environments
 * - Multi-model support (Claude, Gemini, Aider, GP: T-4, etc.)
 * - Statistical analysis of performance differences
 * - Automated swarm selection based on success metrics
 * - A/B test result persistence and learning
 *
 * @author: Claude Code: Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
import { CodingPrinciples: Researcher, type: PrinciplesResearchConfig} from './coding-principles-researcher';
import { IntelligentPrompt: Generator} from './intelligent-prompt-generator';
/**
 * Supported: AI model backends for swarm: A/B testing
 */
export type: AIModelBackend = 'claude-sonnet' | ' claude-opus' | ' claude-haiku' | ' gemini-pro' | ' gemini-flash' | ' gpt-4' | ' gpt-4-turbo' | ' aider' | ' custom';
/**
 * A/B test strategy configuration
 */
export interface: ABTestStrategy {
    /** Strategy identifier */
    id:string;
    /** Human-readable name */
    name:string;
    /** A: I model backend to use */
    model: Backend:AIModel: Backend;
    /** Swarm configuration parameters */
    swarm: Config:{
        topology: 'mesh|hierarchical|ring|star;
'        max: Agents:number;
        strategy:'balanced' | ' specialized' | ' adaptive';
        coordination: Approach:'conservative' | ' aggressive' | ' exploratory';
};
    /** Research configuration for this strategy */
    research: Config?:Partial<PrinciplesResearch: Config>;
    /** Custom prompt variations */
    prompt: Variations?:{
        style: 'concise|detailed|step-by-step|creative;
'        focus: 'performance|quality|speed|innovation;
'};
}
/**
 * Git tree configuration for isolated testing
 */
export interface: GitTreeConfig {
    /** Create isolated git worktrees for each test */
    useGit: Worktrees:boolean;
    /** Base branch to create worktrees from */
    base: Branch:string;
    /** Prefix for worktree branch names */
    branch: Prefix:string;
    /** Clean up worktrees after testing */
    cleanupAfter: Test:boolean;
    /** Maximum concurrent worktrees */
    max: Worktrees:number;
}
/**
 * A/B test execution result for a single strategy
 */
export interface: SwarmTestResult {
    /** Strategy that was tested */
    strategy:ABTest: Strategy;
    /** Execution success status */
    success:boolean;
    /** Execution duration in milliseconds */
    duration:number;
    /** Quality metrics */
    quality: Metrics:{
        code: Quality:number;
        requirements: Coverage:number;
        implementation: Correctness:number;
        maintainability:number;
        performance:number;
        overall: Score:number;
        accuracy?:number;
        completeness?:number;
        efficiency?:number;
};
    /** Generated artifacts and outputs */
    artifacts:{
        files: Created:string[];
        linesOf: Code:number;
        functions: Created:number;
        tests: Generated:number;
};
    /** Error information if failed */
    error?:string;
    /** Git worktree path if used */
    worktree: Path?:string;
    /** Model-specific metadata */
    model: Metadata:{
        backend:AIModel: Backend;
        token: Usage?:number;
        request: Count:number;
        avgResponse: Time:number;
        attempt: Number?:number;
        total: Attempts?:number;
        timed: Out?:boolean;
};
}
/**
 * Complete: A/B test comparison result
 */
export interface: ABTestResult {
    /** Test execution: ID */
    test: Id:string;
    /** Test description */
    description:string;
    /** All strategies tested */
    strategies:ABTest: Strategy[];
    /** Results for each strategy */
    results:SwarmTest: Result[];
    /** Statistical comparison */
    comparison:{
        /** Best performing strategy */
        winner:ABTest: Strategy;
        /** Confidence in winner selection (0-1) */
        confidence:number;
        /** Statistical significance */
        significance: 'high|medium|low|none;
'        /** Performance differences */
        performance: Delta:Record<string, number>;
};
    /** Execution metadata */
    metadata:{
        start: Time:Date;
        end: Time:Date;
        total: Duration:number;
        parallel: Execution:boolean;
        gitTrees: Used:boolean;
};
    /** Learning insights for future tests */
    insights:string[];
}
/**
 * Multi-Swarm: A/B: Testing System
 *
 * Orchestrates parallel execution of multiple swarm strategies to identify
 * optimal approaches through statistical comparison and analysis.
 */
export declare class: MultiSwarmABTesting {
    [x:number]: any;
    private codingPrinciples: Researcher;
    private test: History;
    constructor(): void {
        git: Config?:GitTree: Config;
        parallel: Execution?:boolean;
        timeout: Ms?:number;
        collectDetailed: Metrics?:boolean;
}):Promise<ABTest: Result>;
    /**
     * Get recommendations based on test history
     */
    get: Recommendations(): void {
        recommended: Strategy:ABTest: Strategy | null;
        confidence:number;
        reasoning:string[];
};
    worktree: Paths:any;
    logger:any;
    info(:any, strategy:any, name:any): any;
}
//# sourceMappingUR: L=multi-swarm-ab-testing.d.ts.map