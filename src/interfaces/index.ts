/**
 * Interfaces Module
 *
 * Unified export for all interface types:
 * - Terminal: Unified CLI/TUI interface (React/Ink based)
 * - Web: Web dashboard components
 * - MCP: Claude Desktop remote interface components
 * - API: REST API interface
 */

// All Interface Exports
export * from './api';
export * from './mcp';
export * from './terminal';
export * from './web';

// Interface types
export interface InterfaceConfig {
  mode: 'terminal' | 'web' | 'mcp' | 'api';
  theme?: 'dark' | 'light';
  verbose?: boolean;
  port?: number; // For web interface
  serverUrl?: string; // For MCP interface
  terminalMode?: 'cli' | 'tui'; // For terminal interface sub-mode
}

// Interface launcher utilities
export const InterfaceUtils = {
  detectMode(): 'terminal' | 'web' | 'mcp' | 'api' {
    // Auto-detect interface mode based on environment
    if (process.env.CLAUDE_CODE_MCP) return 'mcp';
    if (process.env.CLAUDE_FLOW_WEB) return 'web';
    if (process.env.CLAUDE_FLOW_API) return 'api';
    return 'terminal'; // Default to unified terminal interface
  },

  detectTerminalMode(): 'cli' | 'tui' {
    // Auto-detect terminal sub-mode
    if (process.argv.includes('--ui') || process.argv.includes('--tui')) return 'tui';
    if (process.argv.includes('--interactive') || process.argv.includes('-i')) return 'tui';
    if (process.argv.length > 2 && !process.argv.slice(2).some((arg) => arg.startsWith('-')))
      return 'cli';
    if (process.stdout.isTTY) return 'tui';
    return 'cli';
  },

  validateConfig(config: InterfaceConfig): boolean {
    return ['terminal', 'web', 'mcp', 'api'].includes(config.mode);
  },
};

export default {
  InterfaceUtils,
};
