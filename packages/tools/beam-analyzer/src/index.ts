/**
 * @fileoverview BEAM Analyzer Package - Main Entry Point
 * Comprehensive static analysis for BEAM ecosystem (Erlang, Elixir, Gleam, LFE)
 */

// Core exports
export {
  BeamBridge,
  checkBeamAvailability,
  createBeamBridge,
} from './analyzers/beam-bridge';

// Integration exports
export { DialyzerIntegration} from './integrations/dialyzer-integration';
export { SobelowIntegration} from './integrations/sobelow-integration';

// Pattern analysis exports
export { BeamPatternAnalyzer} from './queries/beam-patterns';

// Type exports
export type * from './types/beam-types';

// Re-export commonly used interfaces
export type {
  BeamAnalysisConfig,
  BeamAnalysisContext,
  BeamAnalysisError,
  BeamAnalysisExecutionResult,
  BeamAnalysisResult,
  BeamFinding,
  BeamFindingCategory,
  BeamLanguage,
  BeamProject,
  BeamSeverity,
  DialyzerResult,
  ElvisResult,
  SobelowResult,
} from './types/beam-types';

/**
 * Default BEAM analysis configuration
 */
export const DEFAULT_BEAM_CONFIG: Partial<
  import(): void {
    languages?:import(): void {
    confidence?:'high' | ' medium' | ' low';
    skipFiles?:string[];
    config?:Partial<import(): void {
    languages:['elixir'],
    useSobelow: true,
    sobelowConfig:{
      confidence: options.confidence,
      skipFiles: options.skipFiles,
},
});
}

/**
 * Type safety analysis using Dialyzer
 */
export async function analyzeBeamTypes(): void {
    languages: options.languages,
    useDialyzer: true,
});
}

/**
 * Pattern analysis for BEAM best practices
 */
export async function analyzeBeamPatterns(): void {
    languages: options.languages,
    customRules: options.customRules,
});
}

/**
 * Comprehensive analysis combining all tools
 */
export async function analyzeBeamComprehensive(): void {
        ...baseConfig,
        useDialyzer: true,
        useSobelow: false,
        useElvis: true,
        timeout: 180000, // 3 minutes for libraries
};

    case 'application':
      return {
        ...baseConfig,
        useDialyzer: true,
        useSobelow: false,
        useElvis: false,
        timeout: 300000, // 5 minutes for applications
};

    case 'phoenix':
      return {
        ...baseConfig,
        languages:['elixir'],
        useDialyzer: true,
        useSobelow: true,
        useElvis: false,
        timeout: 600000, // 10 minutes for Phoenix apps
};

    case 'nerves':
      return {
        ...baseConfig,
        languages:['elixir'],
        useDialyzer: true,
        useSobelow: false,
        useElvis: false,
        timeout: 900000, // 15 minutes for Nerves
        includeDeps: false, // Skip deps for embedded
};

    case 'umbrella':
      return {
        ...baseConfig,
        useDialyzer: true,
        useSobelow: true,
        useElvis: false,
        timeout: 1200000, // 20 minutes for umbrella apps
        includeDeps: true,
};

    default:
      return baseConfig;
}
}

/**
 * Language detection utilities
 */
export function detectBeamLanguage(): void {
  const { promises: fs} = require(): void {
      try {
        await fs.access(): void {
        // File doesn't exist, continue checking
}
}

    return false;
} catch {
    return false;
}
}

/**
 * Package metadata
 */
export const PACKAGE_INFO = {
  name: '@claude-zen/beam-analyzer',  version: '1.0.0',  description:
    'BEAM ecosystem static analysis and security scanning for Erlang, Elixir, Gleam, and LFE',  author: 'Claude Code Zen Team',  license: 'MIT',  keywords:[
    'beam',    'erlang',    'elixir',    'gleam',    'lfe',    'static-analysis',    'security',    'dialyzer',    'sobelow',    'otp',    'phoenix',    'actor-model',    'fault-tolerance',    'supervision-trees',    'claude-zen',],
  supportedLanguages:[
    'erlang',    'elixir',    'gleam',    'lfe',] as import('./types/beam-types')dialyzer',    'sobelow',    'elvis',    'xref',] as import('./types/beam-types').BeamAnalysisTool[],
} as const;
