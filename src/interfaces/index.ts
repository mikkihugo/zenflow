/**
 * Interfaces Module
 *
 * Unified export for all interface types:
 * - CLI: Command line interface components
 * - TUI: Terminal UI components (Ink React)
 * - Web: Web dashboard components (same Ink components for web)
 * - MCP: Claude Desktop remote interface components
 */

// CLI Interface
export * from './cli';
// MCP Interface
export * from './mcp';
// TUI Interface
export * from './tui';
// Web Interface
export * from './web';

// Interface types
export interface InterfaceConfig {
  mode: 'cli' | 'tui' | 'web' | 'mcp';
  theme?: 'dark' | 'light';
  verbose?: boolean;
  port?: number; // For web interface
  serverUrl?: string; // For MCP interface
}

// Interface launcher utilities
export const InterfaceUtils = {
  detectMode(): 'cli' | 'tui' | 'web' | 'mcp' {
    // Auto-detect interface mode based on environment
    if (process.env.CLAUDE_CODE_MCP) return 'mcp';
    if (process.env.CLAUDE_FLOW_WEB) return 'web';
    if (process.stdout.isTTY && !process.argv.includes('--no-tui')) return 'tui';
    return 'cli';
  },

  validateConfig(config: InterfaceConfig): boolean {
    return ['cli', 'tui', 'web', 'mcp'].includes(config.mode);
  },
};

export default {
  InterfaceUtils,
};
