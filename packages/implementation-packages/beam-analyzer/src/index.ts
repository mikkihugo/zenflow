/**
 * @fileoverview BEAM Analyzer Package - Main Entry Point
 * Comprehensive static analysis for BEAM ecosystem (Erlang, Elixir, Gleam, LFE)
 */

// Core exports
export { BeamBridge, createBeamBridge, checkBeamAvailability } from './analyzers/beam-bridge';

// Integration exports
export { DialyzerIntegration } from './integrations/dialyzer-integration';
export { SobelowIntegration } from './integrations/sobelow-integration';

// Pattern analysis exports
export { BeamPatternAnalyzer } from './queries/beam-patterns';

// Type exports
export type * from './types/beam-types';

// Re-export commonly used interfaces
export type {
  BeamAnalysisConfig,
  BeamAnalysisResult,
  BeamProject,
  BeamLanguage,
  BeamFinding,
  BeamSeverity,
  BeamFindingCategory,
  BeamAnalysisContext,
  DialyzerResult,
  SobelowResult,
  ElvisResult,
  BeamAnalysisError,
  BeamAnalysisExecutionResult
} from './types/beam-types';

/**
 * Default BEAM analysis configuration
 */
export const DEFAULT_BEAM_CONFIG: Partial<import('./types/beam-types').BeamAnalysisConfig> = {
  languages: ['erlang', 'elixir'],
  useDialyzer: true,
  useSobelow: true,
  useElvis: false,
  timeout: 300000, // 5 minutes
  includeDeps: true,
  otpVersion: 'latest',
  customRules: []
};

/**
 * Quick analysis function for BEAM projects
 */
export async function analyzeBeamProject(
  projectPath: string,
  options: {
    languages?: import('./types/beam-types').BeamLanguage[];
    config?: Partial<import('./types/beam-types').BeamAnalysisConfig>;
  } = {}
): Promise<import('./types/beam-types').BeamAnalysisExecutionResult> {
  const bridge = createBeamBridge(options.config);
  
  return bridge.analyzeProject(projectPath, {
    languages: options.languages || ['erlang', 'elixir'],
    ...options.config
  });
}

/**
 * Security-focused analysis for Elixir/Phoenix projects
 */
export async function analyzeElixirSecurity(
  projectPath: string,
  options: {
    confidence?: 'high' | 'medium' | 'low';
    skipFiles?: string[];
    config?: Partial<import('./types/beam-types').BeamAnalysisConfig>;
  } = {}
): Promise<import('./types/beam-types').BeamAnalysisExecutionResult> {
  const bridge = createBeamBridge({
    ...options.config,
    languages: ['elixir'],
    useSobelow: true,
    useDialyzer: false,
    useElvis: false
  });
  
  return bridge.analyzeProject(projectPath, {
    languages: ['elixir'],
    useSobelow: true
  });
}

/**
 * Type safety analysis using Dialyzer
 */
export async function analyzeBeamTypes(
  projectPath: string,
  options: {
    buildPlt?: boolean;
    languages?: import('./types/beam-types').BeamLanguage[];
    config?: Partial<import('./types/beam-types').BeamAnalysisConfig>;
  } = {}
): Promise<import('./types/beam-types').BeamAnalysisExecutionResult> {
  const bridge = createBeamBridge({
    ...options.config,
    languages: options.languages || ['erlang', 'elixir'],
    useDialyzer: true,
    useSobelow: false,
    useElvis: false
  });
  
  return bridge.analyzeProject(projectPath, {
    languages: options.languages,
    useDialyzer: true
  });
}

/**
 * Pattern analysis for BEAM best practices
 */
export async function analyzeBeamPatterns(
  projectPath: string,
  options: {
    languages?: import('./types/beam-types').BeamLanguage[];
    customRules?: import('./types/beam-types').BeamAnalysisRule[];
    config?: Partial<import('./types/beam-types').BeamAnalysisConfig>;
  } = {}
): Promise<import('./types/beam-types').BeamAnalysisExecutionResult> {
  const bridge = createBeamBridge({
    ...options.config,
    languages: options.languages || ['erlang', 'elixir'],
    useDialyzer: false,
    useSobelow: false,
    useElvis: false,
    customRules: options.customRules || []
  });
  
  return bridge.analyzeProject(projectPath, {
    languages: options.languages,
    customRules: options.customRules
  });
}

/**
 * Comprehensive analysis combining all tools
 */
export async function analyzeBeamComprehensive(
  projectPath: string,
  options: {
    languages?: import('./types/beam-types').BeamLanguage[];
    config?: Partial<import('./types/beam-types').BeamAnalysisConfig>;
  } = {}
): Promise<import('./types/beam-types').BeamAnalysisExecutionResult> {
  const config = {
    ...DEFAULT_BEAM_CONFIG,
    ...options.config,
    languages: options.languages || ['erlang', 'elixir']
  };

  const bridge = createBeamBridge(config);
  return bridge.analyzeProject(projectPath, config);
}

/**
 * Get analysis configuration for different project types
 */
export function getBeamConfigForProject(
  projectType: 'library' | 'application' | 'phoenix' | 'nerves' | 'umbrella'
): Partial<import('./types/beam-types').BeamAnalysisConfig> {
  const baseConfig = { ...DEFAULT_BEAM_CONFIG };

  switch (projectType) {
    case 'library':
      return {
        ...baseConfig,
        useDialyzer: true,
        useSobelow: false,
        useElvis: true,
        timeout: 180000 // 3 minutes for libraries
      };

    case 'application':
      return {
        ...baseConfig,
        useDialyzer: true,
        useSobelow: false,
        useElvis: false,
        timeout: 300000 // 5 minutes for applications
      };

    case 'phoenix':
      return {
        ...baseConfig,
        languages: ['elixir'],
        useDialyzer: true,
        useSobelow: true,
        useElvis: false,
        timeout: 600000 // 10 minutes for Phoenix apps
      };

    case 'nerves':
      return {
        ...baseConfig,
        languages: ['elixir'],
        useDialyzer: true,
        useSobelow: false,
        useElvis: false,
        timeout: 900000, // 15 minutes for Nerves
        includeDeps: false // Skip deps for embedded
      };

    case 'umbrella':
      return {
        ...baseConfig,
        useDialyzer: true,
        useSobelow: true,
        useElvis: false,
        timeout: 1200000, // 20 minutes for umbrella apps
        includeDeps: true
      };

    default:
      return baseConfig;
  }
}

/**
 * Language detection utilities
 */
export function detectBeamLanguage(filePath: string): import('./types/beam-types').BeamLanguage | null {
  const ext = require('path').extname(filePath).toLowerCase();
  
  const languageMap: Record<string, import('./types/beam-types').BeamLanguage> = {
    '.erl': 'erlang',
    '.hrl': 'erlang',
    '.ex': 'elixir',
    '.exs': 'elixir',
    '.gleam': 'gleam',
    '.lfe': 'lfe'
  };

  return languageMap[ext] || null;
}

/**
 * Check if project is a BEAM project
 */
export async function isBeamProject(projectPath: string): Promise<boolean> {
  const { promises: fs } = require('fs');
  const path = require('path');

  try {
    // Check for common BEAM project files
    const indicators = [
      'mix.exs',          // Elixir
      'rebar.config',     // Erlang
      'rebar3.config',    // Erlang
      'gleam.toml',       // Gleam
      'rebar.lfe',        // LFE
      'lfe.config'        // LFE
    ];

    for (const indicator of indicators) {
      try {
        await fs.access(path.join(projectPath, indicator));
        return true;
      } catch {
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
  name: '@claude-zen/beam-analyzer',
  version: '1.0.0',
  description: 'BEAM ecosystem static analysis and security scanning for Erlang, Elixir, Gleam, and LFE',
  author: 'Claude Code Zen Team',
  license: 'MIT',
  keywords: [
    'beam',
    'erlang',
    'elixir',
    'gleam',
    'lfe',
    'static-analysis',
    'security',
    'dialyzer',
    'sobelow',
    'otp',
    'phoenix',
    'actor-model',
    'fault-tolerance',
    'supervision-trees',
    'claude-zen'
  ],
  supportedLanguages: ['erlang', 'elixir', 'gleam', 'lfe'] as import('./types/beam-types').BeamLanguage[],
  supportedTools: ['dialyzer', 'sobelow', 'elvis', 'xref'] as import('./types/beam-types').BeamAnalysisTool[]
} as const;