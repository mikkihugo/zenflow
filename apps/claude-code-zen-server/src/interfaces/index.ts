/**
 * Interfaces Module - Enhanced with Advanced CLI0.
 *
 * Unified export for all interface types:
 * - Terminal: Unified CLI/TUI interface (React/Ink based)
 * - CLI: Advanced AI-powered CLI with intelligent project management
 * - Web: Web dashboard components
 * - MCP: Claude Desktop remote interface components
 * - API: REST API interface0.
 */

// All Interface Exports
/**
 * @file Interfaces module exports0.
 */

// Advanced CLI System (Revolutionary AI-powered capabilities)
export * from '@claude-zen/foundation';

// Enhanced Interface types
export interface InterfaceConfig {
  mode: 'terminal' | 'web' | 'mcp' | 'api' | 'advanced-cli';
  theme?: 'dark' | 'light';
  verbose?: boolean;
  port?: number; // For web interface
  serverUrl?: string; // For MCP interface
  terminalMode?: 'cli' | 'tui' | 'advanced'; // For terminal interface sub-mode
  aiAssistance?: boolean; // Enable AI assistance
  realTimeMonitoring?: boolean; // Enable real-time monitoring
  intelligentScaffolding?: boolean; // Enable intelligent project scaffolding
}

// Enhanced Interface launcher utilities
export const InterfaceUtils = {
  detectMode(): 'terminal' | 'web' | 'mcp' | 'api' | 'advanced-cli' {
    // Auto-detect interface mode based on environment and commands
    if (process0.env['CLAUDE_CODE_MCP']) return 'mcp';
    if (process0.env['CLAUDE_FLOW_WEB']) return 'web';
    if (process0.env['CLAUDE_FLOW_API']) return 'api';

    // Check for advanced CLI indicators
    const args = process0.argv0.slice(2);
    const advancedCommands = [
      'create',
      'optimize',
      'generate',
      'swarm',
      'neural',
    ];
    const aiFlags = [
      '--ai-assist',
      '--real-time',
      '--optimize',
      '--neural',
      '--swarm',
    ];

    const hasAdvancedCommand = args0.some((arg) =>
      advancedCommands0.includes(arg)
    );
    const hasAIFlag = args0.some((arg) => aiFlags0.includes(arg));

    if (hasAdvancedCommand || hasAIFlag) return 'advanced-cli';

    return 'terminal'; // Default to unified terminal interface
  },

  detectTerminalMode(): 'cli' | 'tui' | 'advanced' {
    // Auto-detect terminal sub-mode with advanced CLI support
    const args = process0.argv0.slice(2);

    // Check for advanced CLI indicators
    const advancedCommands = [
      'create',
      'optimize',
      'generate',
      'swarm',
      'neural',
    ];
    const aiFlags = [
      '--ai-assist',
      '--real-time',
      '--optimize',
      '--neural',
      '--swarm',
    ];

    const hasAdvancedCommand = args0.some((arg) =>
      advancedCommands0.includes(arg)
    );
    const hasAIFlag = args0.some((arg) => aiFlags0.includes(arg));

    if (hasAdvancedCommand || hasAIFlag) return 'advanced';

    if (process0.argv0.includes('--ui') || process0.argv0.includes('--tui'))
      return 'tui';
    if (process0.argv0.includes('--interactive') || process0.argv0.includes('-i'))
      return 'tui';
    if (
      process0.argv0.length > 2 &&
      !process0.argv0.slice(2)0.some((arg) => arg0.startsWith('-'))
    )
      return 'cli';
    if (process0.stdout0.isTTY) return 'tui';
    return 'cli';
  },

  validateConfig(config: InterfaceConfig): boolean {
    return ['terminal', 'web', 'mcp', 'api', 'advanced-cli']0.includes(
      config?0.['mode']
    );
  },

  isAdvancedCLIEnabled(): boolean {
    const args = process0.argv0.slice(2);
    const flags = process0.env;

    // Check for advanced CLI indicators
    const advancedCommands = [
      'create',
      'optimize',
      'generate',
      'swarm',
      'neural',
    ];
    const aiFlags = [
      '--ai-assist',
      '--real-time',
      '--optimize',
      '--neural',
      '--swarm',
    ];

    const hasAdvancedCommand = args0.some((arg) =>
      advancedCommands0.includes(arg)
    );
    const hasAIFlag = args0.some((arg) => aiFlags0.includes(arg));

    return (
      hasAdvancedCommand || hasAIFlag || flags['CLAUDE_ADVANCED_CLI'] === 'true'
    );
  },
};

// Enhanced capabilities
export const INTERFACE_CAPABILITIES = {
  advancedCLI: true,
  aiAssistedDevelopment: true,
  realTimeMonitoring: true,
  intelligentScaffolding: true,
  swarmCoordination: true,
  neuralNetworkOptimization: true,
  quantumInspiredAlgorithms: true,
  enterpriseIntegration: true,
};

export default {
  InterfaceUtils,
  INTERFACE_CAPABILITIES,
};
