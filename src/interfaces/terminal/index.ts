/**
 * Unified Terminal Interface - Main Export
 *
 * Consolidates command execution and interactive terminal functionality into a single interface.
 * This replaces the separate command execution and interactive terminal interface directories.
 */

// Business logic (separated from UI)
export * from './CommandExecutionEngine';
export { CommandExecutionEngine } from './CommandExecutionEngine';
export * from './CommandExecutionRenderer';
export { type CommandExecutionProps, CommandExecutionRenderer } from './CommandExecutionRenderer';
// Components
export * from './components/index';
export * from './InteractiveTerminalApplication';
export {
  InteractiveTerminalApplication,
  type TUIModeProps,
} from './InteractiveTerminalApplication';
export * from './ProcessOrchestrator';
export { TerminalManager } from './ProcessOrchestrator';
// Screens
export * from './screens/index';
// State Hooks (React hooks for component state management)
export * from './state-hooks/index';
// Main components (updated for Google standards)
export * from './TerminalInterfaceRouter';
// Re-export key items for convenience (updated names)
export { TerminalApp, type TerminalAppProps } from './TerminalInterfaceRouter';
export * from './utils/MockCommandHandler';

export {
  type CommandContext,
  type CommandResult,
  MockCommandHandler,
} from './utils/MockCommandHandler';
// Utilities (updated for Google standards)
export * from './utils/mode-detector';
export {
  detectMode,
  detectModeWithReason,
  getEnvironmentInfo,
  isCommandExecutionSupported,
  isInteractiveSupported,
  type ModeDetectionResult,
  type TerminalMode,
} from './utils/mode-detector';

// Terminal interface configuration
export interface TerminalInterfaceConfig {
  mode?: 'auto' | 'command' | 'interactive';
  theme?: 'dark' | 'light';
  verbose?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Terminal interface class for external integration
export class TerminalInterface {
  private config: TerminalInterfaceConfig;

  constructor(config: TerminalInterfaceConfig = {}) {
    this.config = {
      mode: 'auto',
      theme: 'dark',
      verbose: false,
      autoRefresh: true,
      refreshInterval: 3000,
      ...config,
    };
  }

  /**
   * Initialize the terminal interface
   */
  async initialize(): Promise<void> {
    // Initialization logic if needed
  }

  /**
   * Render the terminal interface
   */
  async render(): Promise<void> {
    const { render } = await import('ink');
    const React = await import('react');
    const { TerminalApp } = await import('./TerminalInterfaceRouter');

    // Determine mode
    const mode =
      this.config.mode === 'auto'
        ? detectMode(process.argv.slice(2), {})
        : (this.config.mode as TerminalMode);

    const commands = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
    const flags = this.parseFlags(process.argv.slice(2));
    if (this.config.debug) {
    }

    // Render the appropriate interface
    const { unmount } = render(
      React.createElement(TerminalApp, {
        commands,
        flags: { ...flags, ...this.config },
        onExit: (code: number) => process.exit(code),
      }),
    );

    // Setup graceful shutdown
    const shutdown = () => {
      unmount();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  /**
   * Parse command line flags
   */
  private parseFlags(args: string[]): Record<string, any> {
    const flags: Record<string, any> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('-')) {
          flags[key] = nextArg;
          i++; // Skip next arg
        } else {
          flags[key] = true;
        }
      } else if (arg.startsWith('-')) {
        const key = arg.slice(1);
        flags[key] = true;
      }
    }

    return flags;
  }

  /**
   * Get current configuration
   */
  getConfig(): TerminalInterfaceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<TerminalInterfaceConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Convenience functions for direct usage
export const createTerminalInterface = (config?: TerminalInterfaceConfig) => {
  return new TerminalInterface(config);
};

export const launchTerminalInterface = async (config?: TerminalInterfaceConfig) => {
  const terminal = new TerminalInterface(config);
  await terminal.initialize();
  await terminal.render();
};

// Version info
export const TERMINAL_INTERFACE_VERSION = '1.0.0';

// Export default for convenience
export default TerminalInterface;
