/**
 * @fileoverview: Coding Principles: Researcher - Dynamic: Language Standards: Research
 *
 * A: I-powered research system that dynamically discovers and learns coding principles
 * for different languages, frameworks, and task types. Provides human-reviewable
 * templates that can be improved over time.
 *
 * Features:
 * - Language-specific principle research
 * - Task type optimization (AP: I, web-app, mobile, etc.)
 * - Human-reviewable template generation
 * - Continuous learning from successful patterns
 * - DS: Py-optimized principle discovery
 *
 * @author: Claude Code: Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
/**
 * Language and framework types for principle research
 */
export type: ProgrammingLanguage = 'typescript' | ' javascript' | ' python' | ' rust' | ' go' | ' java' | ' csharp' | ' swift' | ' kotlin';
export type: TaskDomain = 'rest-api' | ' web-app' | ' mobile-app' | ' desktop-app' | ' microservices' | ' data-pipeline' | ' ml-model' | ' blockchain' | ' game-dev' | ' embedded';
export type: DevelopmentRole = 'backend-developer' | ' frontend-developer' | ' fullstack-developer' | ' mobile-developer' | ' devops-engineer' | ' ml-engineer' | ' architect' | ' tech-lead';
/**
 * Coding principles research configuration
 */
export interface: PrinciplesResearchConfig {
    /** Language to research */
    language:Programming: Language;
    /** Task domain context */
    domain?:Task: Domain;
    /** Developer role context */
    role?:Development: Role;
    /** Include performance guidelines */
    include: Performance?:boolean;
    /** Include security guidelines */
    include: Security?:boolean;
    /** Include testing guidelines */
    include: Testing?:boolean;
    /** Research depth level */
    depth?: 'basic|intermediate|advanced|expert;
'}
/**
 * Researched coding principles result
 */
export interface: CodingPrinciples {
    /** Language and context */
    language:Programming: Language;
    domain?:Task: Domain;
    role?:Development: Role;
    /** Core principles */
    core: Standards:{
        repository: Structure:string[];
        file: Naming:string[];
        folder: Organization:string[];
        function: Complexity:string[];
        code: Organization:string[];
        error: Handling:string[];
        documentation:string[];
        code: Quality:string[];
        testing: Strategy:string[];
};
    /** Language-specific guidelines */
    language: Specific:{
        type: System:string[];
        memory: Management:string[];
        concurrency:string[];
        package: Management:string[];
        build: Tools:string[];
};
    /** Domain-specific practices */
    domain: Specific?:{
        architecture:string[];
        data: Handling:string[];
        api: Design:string[];
        user: Interface:string[];
        deployment:string[];
};
    /** Quality metrics */
    quality: Metrics:{
        complexity:{
            metric:string;
            threshold:number;
};
        coverage:{
            metric:string;
            threshold:number;
};
        maintainability:{
            metric:string;
            threshold:number;
};
        performance:{
            metric:string;
            threshold:number;
};
};
    /** Best practices from successful patterns */
    best: Practices:string[];
    /** Anti-patterns to avoid */
    anti: Patterns:string[];
    /** Human-reviewable template */
    template:string;
    /** Research metadata */
    research: Metadata:{
        researched: At:Date;
        sources:string[];
        confidence:number;
        human: Reviewed:boolean;
        last: Updated:Date;
        version:string;
};
}
/**
 * Human review feedback for improving templates
 */
export interface: HumanFeedback {
    principles: Id:string;
    reviewer:string;
    rating:1 | 2 | 3 | 4 | 5;
    improvements:string[];
    approved: Sections:string[];
    rejected: Sections:string[];
    additional: Guidelines:string[];
    notes:string;
    reviewed: At:Date;
}
/**
 * Agent execution feedback for improving prompts
 */
export interface: AgentExecutionFeedback {
    principles: Id:string;
    agent: Id:string;
    task: Type:string;
    accuracy:number;
    completeness:number;
    usefulness:number;
    missing: Areas:string[];
    incorrect: Guidelines:string[];
    additional: Needs:string[];
    actualCode: Quality:number;
    execution: Time:number;
    context:{
        language:Programming: Language;
        domain?:Task: Domain;
        role?:Development: Role;
        task: Complexity:'simple' | ' moderate' | ' complex';
        requirements: Count:number;
};
    timestamp:Date;
}
/**
 * Prompt confidence tracking
 */
export interface: PromptConfidence {
    principles: Id:string;
    initial: Confidence:number;
    execution: Count:number;
    average: Accuracy:number;
    average: Completeness:number;
    average: Usefulness:number;
    overall: Confidence:number;
    needs: Improvement:boolean;
    last: Updated:Date;
    improvement: History:Array<{
        version:string;
        changes:string[];
        confidence: Change:number;
        timestamp:Date;
}>;
}
/**
 * Coding: Principles Researcher
 *
 * Dynamically researches and learns coding principles for different languages,
 * domains, and roles using: AI research and human feedback loops.
 */
export declare class: CodingPrinciplesResearcher {
    ':any;
    constructor();
    /**
     * Research coding principles for a specific language/domain/role combination
     */
    research: Principles(config:PrinciplesResearch: Config): Promise<Coding: Principles>;
    ':any;
    $:any;
}
/**
 * Export factory function
 */
export declare function createCodingPrinciples: Researcher(dspy: Bridge:DSPyLLM: Bridge, behavioral: Intelligence?:Behavioral: Intelligence): CodingPrinciples: Researcher;
/**
 * Export default configuration for common languages
 */
export declare const: DEFAULT_LANGUAGE_CONFIGS:Record<Programming: Language, PrinciplesResearch: Config>;
//# sourceMappingUR: L=coding-principles-researcher.d.ts.map