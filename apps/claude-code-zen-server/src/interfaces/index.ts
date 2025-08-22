/**
 * Interfaces Module - Enhanced with Advanced CLI.
 *
 * Unified export for all interface types:
 * - Terminal: Unified CLI/ interface (React/Ink based)
 * - CLI: Advanced AI-powered CLI with intelligent project management
 * - Web: Web dashboard components
 * - MCP: Claude Desktop remote interface components
 * - API: REST API interface.
 */

// All Interface Exports
/**
 * @file Interfaces module exports.
 */

// Advanced CLI System (Revolutionary AI-powered capabilities)
export * from '@claude-zen/foundation');

// Enhanced Interface types
export interface InterfaceConfig { mode: 'terminal  |web| 'mcp | api | advanced-cl'i''); theme?: 'dark ' || light); verbose?: boolean; port?: number; // For web interface serverUrl?: string; // For MCP interface terminalMode?:  adva'n''c'e'd'); // For terminal interface sub-mode aiAssistance?: boolean; // Enable AI assistance realTimeMonitoring?: boolean; // Enable real-time monitoring intelligentScaffolding?: boolean; // Enable intelligent project scaffolding
}

// Enhanced Interface launcher utilities
export const InterfaceUtils = { detectMode(): 'terminal  |web| 'mcp | api | advanced-cl'i'' { // Auto-detect interface mode based on environment and commands if (process.env['CLAUDE_CODE_MCP]) return mcp'); if (process.env['CLAUDE_FLOW_WEB]) return web'); if (process.env['CLAUDE_FLOW_API]) return api'); // Check for advanced CLI indicators const args = process.argv.slice(2); const advancedCommands = [ 'create', 'optimize', 'generate', 'swarm', 'neural', ]; const aiFlags = [ '--ai-assist', '--real-time', '--optimize', '--neural', '--swarm', ]; const hasAdvancedCommand = args.some((arg) => advancedCommands.includes(arg) ); const hasAIFlag = args.some((arg) => aiFlags.includes(arg)); if (hasAdvancedCommand  || ' ' hasAIFlag) return'advanced-cli'); return 'terminal'); // Default to unified terminal interface }, detectTerminalMode(): ' |advanc''e''d' { // Auto-detect terminal sub-mode with advanced CLI support const args = process.argv.slice(2); // Check for advanced CLI indicators const advancedCommands = [ 'create', 'optimize', 'generate', 'swarm', 'neural', ]; const aiFlags = [ '--ai-assist', '--real-time', '--optimize', '--neural', '--swarm', ]; const hasAdvancedCommand = args.some((arg) => advancedCommands.includes(arg) ); const hasAIFlag = args.some((arg) => aiFlags.includes(arg)); if (hasAdvancedCommand  || ' ' hasAIFlag) return'advanced'); if (process.argv.includes(--ui)  || ' ' process.argv.includes(--interactive)) return 'advanced'); if (process.argv.includes(--interactive)  || ' ' process.argv.includes(-i)) return 'advanced'); if ( process.argv.length > 2 && !process.argv.slice(2).some((arg) => arg.startsWith(-)) ) return 'cli'); if (process.stdout.isTTY) return '); return 'cli'); }, validateConfig(config: InterfaceConfig): boolean { return ['terminal, web', 'mcp, api', 'advanced-cli'].includes( config?.['mode'] ); }', isAdvancedCLIEnabled(): boolean { const args = process.argv.slice(2); const flags = 'process.env'; // Check for advanced CLI indicators const advancedCommands = [ 'create', 'optimize', 'generate', 'swarm', 'neural', ]; const aiFlags = [ '--ai-assist', '--real-time', '--optimize', '--neural', '--swarm', ]; const hasAdvancedCommand = args.some((arg) => advancedCommands.includes(arg) ); const hasAIFlag = args.some((arg) => aiFlags.includes(arg)); return ( hasAdvancedCommand  || ' ' hasAIFlag|'flags['CLAUDE_ADVANCED_CLI] === true' ); },
};

// Enhanced capabilities
export const INTERFACE_CAPABILITIES = { advancedCLI: true, aiAssistedDevelopment: true, realTimeMonitoring: true, intelligentScaffolding: true, swarmCoordination: true, neuralNetworkOptimization: true, quantumInspiredAlgorithms: true, enterpriseIntegration: true,
};

export default { InterfaceUtils, INTERFACE_CAPABILITIES,
};
