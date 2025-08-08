/**
 * Type declarations for escomplex module
 * ESComplex is a JavaScript/TypeScript complexity analysis tool
 */

declare module 'escomplex' {
  export interface ComplexityReport {
    aggregate: {
      cyclomatic: number;
      cyclomaticDensity: number;
      halstead: {
        bugs: number;
        difficulty: number;
        effort: number;
        length: number;
        time: number;
        vocabulary: number;
        volume: number;
        operands: {
          distinct: number;
          total: number;
        };
        operators: {
          distinct: number;
          total: number;
        };
      };
      functions: any[];
      maintainability: number;
      dependencies: any[];
      loc: {
        logical: number;
        physical: number;
      };
    };
    reports: ComplexityFunctionReport[];
    errors: any[];
  }

  export interface ComplexityFunctionReport {
    name: string;
    cyclomatic: number;
    halstead: {
      bugs: number;
      difficulty: number;
      effort: number;
      length: number;
      time: number;
      vocabulary: number;
      volume: number;
    };
    params: number;
    line: number;
    cyclomaticDensity: number;
    complexity: {
      cyclomatic: number;
      halstead: {
        difficulty: number;
        volume: number;
      };
    };
  }

  export interface AnalyzeOptions {
    skipCalculation?: boolean;
    noCoreSize?: boolean;
    logicalor?: boolean;
    switchcase?: boolean;
    forin?: boolean;
    trycatch?: boolean;
    newmi?: boolean;
    ignoreErrors?: boolean;
  }

  export function analyze(code: string, options?: AnalyzeOptions): ComplexityReport;

  export function analyzeModule(ast: any, options?: AnalyzeOptions): ComplexityReport;
}
