/**
 * DSPy Agent Programs.
 *
 * Individual DSPy programs that function as intelligent agents in the swarm.
 * Each program is specialized for specific tasks and learns from examples.
 */
/**
 * @file Coordination system: dspy-agent-programs
 */
import type { DSPyProgram, DSPyWrapper } from '../neural/dspy-wrapper';
import type { DSPyExample } from '../neural/types/dspy-types';
/**
 * Base class for DSPy Agent Programs.
 */
export declare abstract class BaseDSPyAgentProgram {
    protected dspyWrapper: DSPyWrapper;
    protected program: DSPyProgram | null;
    protected examples: DSPyExample[];
    protected performance: {
        accuracy: number;
        totalExecutions: number;
        successfulExecutions: number;
        averageResponseTime: number;
    };
    constructor(dspyWrapper: DSPyWrapper);
    abstract getSignature(): string;
    abstract getDescription(): string;
    abstract getCapabilities(): string[];
    /**
     * Initialize the DSPy program.
     */
    initialize(): Promise<void>;
    /**
     * Execute the program with input.
     */
    execute(input: any): Promise<any>;
    /**
     * Add learning examples.
     */
    addExamples(examples: Array<{
        input: any;
        output: any;
    }>): Promise<void>;
    /**
     * Optimize the program.
     */
    optimize(): Promise<void>;
    /**
     * Get performance metrics.
     */
    getPerformance(): {
        accuracy: number;
        totalExecutions: number;
        successfulExecutions: number;
        averageResponseTime: number;
    };
}
/**
 * Code Generator Agent Program.
 */
export declare class CodeGeneratorProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Generate code with tests and documentation.
     */
    generateCode(requirements: string, context?: string, styleGuide?: string): Promise<any>;
}
/**
 * Code Analyzer Agent Program.
 */
export declare class CodeAnalyzerProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Analyze code quality and provide suggestions.
     */
    analyzeCode(code: string, filePath: string, projectContext?: string): Promise<any>;
}
/**
 * Architecture Designer Agent Program.
 */
export declare class ArchitectureDesignerProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Design system architecture.
     */
    designArchitecture(requirements: string, constraints?: string[], domain?: string, scale?: string): Promise<any>;
}
/**
 * Test Engineer Agent Program.
 */
export declare class TestEngineerProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Generate comprehensive test suite.
     */
    generateTests(code: string, requirements: string, testStrategy?: string): Promise<any>;
}
/**
 * Research Specialist Agent Program.
 */
export declare class ResearchSpecialistProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Conduct research and provide insights.
     */
    conductResearch(query: string, domain?: string, depth?: string, sources?: string[]): Promise<any>;
}
/**
 * Task Coordinator Agent Program.
 */
export declare class TaskCoordinatorProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Coordinate multi-agent task execution.
     */
    coordinateTasks(tasks: any[], agents: any[], dependencies?: any[], constraints?: any): Promise<any>;
}
/**
 * Error Diagnosis Agent Program.
 */
export declare class ErrorDiagnosisProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Diagnose errors and provide solutions.
     */
    diagnoseError(errorMessage: string, stackTrace?: string, codeContext?: string, environment?: string): Promise<any>;
}
/**
 * Performance Optimizer Agent Program.
 */
export declare class PerformanceOptimizerProgram extends BaseDSPyAgentProgram {
    getSignature(): string;
    getDescription(): string;
    getCapabilities(): string[];
    /**
     * Optimize code performance.
     */
    optimizePerformance(code: string, metrics?: any, constraints?: any[], targets?: any): Promise<any>;
}
/**
 * DSPy Agent Program Factory.
 */
export declare class DSPyAgentProgramFactory {
    private dspyWrapper;
    constructor(dspyWrapper: DSPyWrapper);
    /**
     * Create agent program by type.
     */
    createProgram(type: string): Promise<BaseDSPyAgentProgram>;
    /**
     * Get available program types.
     */
    getAvailableTypes(): string[];
}
//# sourceMappingURL=dspy-agent-programs.d.ts.map