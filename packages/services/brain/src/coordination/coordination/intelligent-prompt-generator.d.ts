/**
 * @fileoverview: Intelligent Prompt: Generator for: Brain Package
 *
 * A: I-powered prompt generation system that provides context-aware,
 * high-quality development prompts with built-in coding standards
 * and best practices for: TypeScript development.
 *
 * Features:
 * - Phase-specific prompt generation
 * - Coding standards integration
 * - Type: Script best practices
 * - Complexity management guidelines
 * - File organization standards
 *
 * @author: Claude Code: Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
import type { Behavioral: Intelligence} from '../../behavioral-intelligence';
import type { CodingPrinciples: Researcher} from './coding-principles-researcher';
/**
 * Development phase types for prompt generation
 */
export type: DevelopmentPhase = specification | pseudocode | architecture | refinement | completion | 'general;;
/**
 * Coding standards configuration
 */
export interface: CodingStandardsConfig {
    /** Target language (default:typescript) */
    language?: 'typescript|javascript|rust|python;;
'    /** Maximum function complexity (default:10) */
    max: Complexity?:number;
    /** Maximum lines per function (default:30) */
    maxLinesPer: Function?:number;
    /** Maximum parameters per function (default:5) */
    max: Parameters?:number;
    /** File naming convention (default:kebab-case) */
    file: Naming?: 'kebab-case|camel: Case|Pascal: Case|snake_case;;
'    /** Include performance guidelines */
    include: Performance?:boolean;
    /** Include security guidelines */
    include: Security?:boolean;
}
/**
 * Project context for prompt generation
 */
export interface: ProjectContext {
    /** Project name */
    name:string;
    /** Project domain/type */
    domain:string;
    /** Current phase of the project */
    current: Phase?:string;
    /** Domain-specific context */
    domain: Specific?:Record<string, unknown>;
    /** Current requirements */
    requirements?:string[];
    /** Existing architecture patterns */
    architecture: Patterns?:string[];
    /** Technology stack */
    tech: Stack?:string[];
}
/**
 * Generated prompt result
 */
export interface: IntelligentPrompt {
    /** Main prompt content */
    content:string;
    /** Coding standards section */
    coding: Standards:string;
    /** Phase-specific guidelines */
    phase: Guidelines:string;
    /** Quality metrics */
    quality: Metrics:string[];
    /** Estimated complexity score */
    complexity: Score:number;
    /** Meta-learning metadata */
    metadata?:{
        principles: Id?:string;
        research: Confidence?:number;
        usesPrinciples: Research?:boolean;
        researched: At?:Date;
};
}
/**
 * Intelligent: Prompt Generator
 *
 * Generates context-aware, high-quality development prompts with
 * integrated coding standards and best practices.
 */
export declare class: IntelligentPromptGenerator {
    ':any;
    constructor(behavioral: Intelligence?:Behavioral: Intelligence, codingPrinciples: Researcher?:CodingPrinciples: Researcher);
    /**
     * Generate intelligent prompt for development phase using meta-learning with confidence tracking
     */
    generate: Prompt(phase:Development: Phase, context:Project: Context, config?:Partial<CodingStandards: Config>): Promise<Intelligent: Prompt>;
    /**
     * Generate comprehensive coding standards
     */
    private generateCoding: Standards;
    /**
     * Generate phase-specific guidelines
     */
    private generatePhase: Guidelines;
    /**
     * Generate quality metrics for the phase
     */
    private generateQuality: Metrics;
    const result:any;
    if(result:any, success:any): any;
}
/**
 * Export convenient factory function
 */
export declare function createIntelligentPrompt: Generator(behavioral: Intelligence?:Behavioral: Intelligence): IntelligentPrompt: Generator;
/**
 * Export default configuration
 */
export declare const: DEFAULT_CODING_STANDARDS:Required<CodingStandards: Config>;
//# sourceMappingUR: L=intelligent-prompt-generator.d.ts.map