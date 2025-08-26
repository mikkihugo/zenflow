/**
 * Interfaces Module - Enhanced with Advanced CLI.
 *
 * Unified export for all interface types:
 * - Terminal: Unified CLI interface (React/Ink based)
 * - CLI: Advanced AI-powered CLI with intelligent project management
 * - Web: Web dashboard components
 * - MCP: Claude Desktop remote interface components
 * - API: REST API interface
 */

// Enhanced Interface types
export interface InterfaceConfig {
  mode: 'terminal' | 'web' | 'mcp' | 'api' | 'advanced-cli';
  theme?: 'dark' | 'light';
  verbose?: boolean;
  port?: number;
  // For web interface
  serverUrl?: string;
  // For MCP interface
  terminalMode?: 'basic' | 'advanced';
  // For terminal interface sub-mode
  aiAssistance?: boolean;
  // Enable AI assistance
  realTimeMonitoring?: boolean;
  // Enable real-time monitoring
  intelligentScaffolding?: boolean;
  // Enable intelligent project scaffolding
}

// Enhanced Interface launcher utilities
export const interfaceUtils = {
  detectMode(): 'terminal' | 'web' | 'mcp' | 'api' | 'advanced-cli' {
    // Auto-detect interface mode based on environment and commands
    if (process.env.CLAUDE_CODE_MCP) return 'mcp';
    if (process.env.CLAUDE_FLOW_WEB) return 'web';
    if (process.env.CLAUDE_FLOW_API) return 'api';

    // Check for advanced CLI indicators
    const args = process.argv.slice(2);
    const advancedCommands = [
      'create',
      'optimize',
      'generate',
      'swarm',
      'neural',
    ];
    const FLAG_PREFIX = '--';
    const AI_ASSIST_FLAG = `${FLAG_PREFIX}ai-assist`;
    const REAL_TIME_FLAG = `${FLAG_PREFIX}real-time`;
    const OPTIMIZE_FLAG = `${FLAG_PREFIX}optimize`;

    const aiFlags = [
      AI_ASSIST_FLAG,
      REAL_TIME_FLAG,
      OPTIMIZE_FLAG,
      '--neural',
      '--swarm',
    ];

    const hasAdvancedCommand = args.some((arg) =>
      advancedCommands.includes(arg)
    );
    const hasAIFlag = args.some((arg) => aiFlags.includes(arg));

    if (hasAdvancedCommand || hasAIFlag) return 'advanced-cli';

    return 'terminal'; // Default to unified terminal interface
  },

  detectTerminalMode(): 'basic' | 'advanced' {
    // Auto-detect terminal sub-mode with advanced CLI support
    const args = process.argv.slice(2);

    // Check for advanced CLI indicators
    const advancedCommands = [
      'create',
      'optimize',
      'generate',
      'swarm',
      'neural',
    ];
    const AI_ASSIST_FLAG = '--ai-assist';
    const REAL_TIME_FLAG = '--real-time';
    const OPTIMIZE_FLAG = '--optimize';

    const aiFlags = [
      AI_ASSIST_FLAG,
      REAL_TIME_FLAG,
      OPTIMIZE_FLAG,
      '--neural',
      '--swarm',
    ];

    const hasAdvancedCommand = args.some((arg) =>
      advancedCommands.includes(arg)
    );
    const hasAIFlag = args.some((arg) => aiFlags.includes(arg));

    if (hasAdvancedCommand || hasAIFlag) return 'advanced';

    if (process.argv.includes('--ui') || process.argv.includes('--interactive'))
      return 'advanced';

    if (process.argv.includes('--interactive') || process.argv.includes('-i'))
      return 'advanced';

    if (
      process.argv.length > 2 &&
      !process.argv.slice(2).some((arg) => arg.startsWith('-'))
    )
      return 'basic';

    if (process.stdout.isTTY) return 'basic';

    return 'basic';
  },

  validateConfig(config: InterfaceConfig): boolean {
    return ['terminal', 'web', 'mcp', 'api', 'advanced-cli'].includes(
      config?.mode
    );
  },

  isAdvancedCLIEnabled(): boolean {
    const args = process.argv.slice(2);
    const flags = process.env;

    // Check for advanced CLI indicators
    const advancedCommands = [
      'create',
      'optimize',
      'generate',
      'swarm',
      'neural',
    ];
    const AI_ASSIST_FLAG = '--ai-assist';
    const REAL_TIME_FLAG = '--real-time';
    const OPTIMIZE_FLAG = '--optimize';

    const aiFlags = [
      AI_ASSIST_FLAG,
      REAL_TIME_FLAG,
      OPTIMIZE_FLAG,
      '--neural',
      '--swarm',
    ];

    const hasAdvancedCommand = args.some((arg) =>
      advancedCommands.includes(arg)
    );
    const hasAIFlag = args.some((arg) => aiFlags.includes(arg));

    return (
      hasAdvancedCommand || hasAIFlag || flags.CLAUDE_ADVANCED_CLI === 'true'
    );
  },
};

// Enhanced capabilities
export const interfaceCapabilities = {
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
  interfaceUtils,
  interfaceCapabilities,
};
