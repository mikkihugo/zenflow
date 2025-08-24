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
      functions: ComplexityFunctionReport[];
      maintainability: number;
      dependencies: DependencyReport[];
      loc: {
        logical: number;
        physical: number;
      };
    };
    reports: ComplexityFunctionReport[];
    errors: ComplexityError[];
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
  export interface DependencyReport {
    path: string;
    type: 'CommonJS' | 'AMD' | 'ES6';
    line: number;
    source: string;
  }
  export interface ComplexityError {
    name: string;
    message: string;
    line?: number;
    column?: number;
  }
  export function analyze(
    code: string,
    options?: AnalyzeOptions
  ): ComplexityReport;
  export function analyzeModule(
    ast: any,
    options?: AnalyzeOptions
  ): ComplexityReport;
}
