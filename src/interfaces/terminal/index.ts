/**
 * Unified Terminal Interface - Main Export.
 *
 * Consolidates command execution and interactive terminal functionality into a single interface.
 * This replaces the separate command execution and interactive terminal interface directories.
 */

// Business logic (separated from UI)
/**
 * @file Terminal module exports.
 */

export * from './command-execution-engine.ts';
export { CommandExecutionEngine } from './command-execution-engine.ts';
export * from './command-execution-renderer';
export { type CommandExecutionProps, CommandExecutionRenderer } from './command-execution-renderer';
// Additional specific component exports to resolve conflicts
export type { SwarmStatus } from './components/header';
// Components - specific exports to avoid conflicts
export {
  type BaseComponentProps,
  ComponentUtils,
  defaultUnifiedTheme,
  ErrorMessage,
  type ErrorMessageProps,
  Footer,
  type FooterProps,
  Header,
  type HeaderProps,
  ProgressBar,
  type ProgressBarProps,
  Spinner,
  type SpinnerProps,
  StatusBadge,
  type StatusBadgeProps,
  type Theme,
} from './components/index.ts';

export * from './interactive-terminal-application';
export {
  InteractiveTerminalApplication,
  type TUIModeProps,
} from './interactive-terminal-application';

// Process orchestrator - specific export to avoid conflicts
export {
  type ProcessResult,
  type TerminalConfig,
  TerminalManager,
  type TerminalSession,
} from './process-orchestrator.ts';

// Screens - specific exports to avoid conflicts
export {
  defaultScreenConfigs,
  MainMenu,
  type MainMenuProps,
  type ScreenConfig,
  type ScreenType,
  ScreenUtils,
  SwarmDashboard,
  type SwarmDashboardProps,
} from './screens/index.ts';

// Additional screen type exports to resolve conflicts
export type { SwarmAgent, SwarmMetrics, SwarmTask } from './screens/swarm-dashboard';
// State Hooks (React hooks for component state management) - avoid conflicts
// Note: Re-exporting from state-hooks causes conflicts, import directly when needed
// Specific exports to avoid conflicts:
export { type UseConfigReturn, useConfig } from './state-hooks/use-config.ts';
export {
  type SwarmState,
  type UseSwarmStatusReturn,
  useSwarmStatus,
} from './state-hooks/use-swarm-status.ts';

// Main components (updated for Google standards)
export * from './terminal-interface-router';
// Re-export key items for convenience (updated names)
export { TerminalApp, type TerminalAppProps } from './terminal-interface-router';
export * from './utils/mock-command-handler.ts';

export {
  type CommandContext,
  type CommandResult,
  MockCommandHandler,
} from './utils/mock-command-handler.ts';
// Utilities (updated for Google standards)
export * from './utils/mode-detector.ts';
export {
  detectMode,
  detectModeWithReason,
  getEnvironmentInfo,
  isCommandExecutionSupported,
  isInteractiveSupported,
  type ModeDetectionResult,
  type TerminalMode,
} from './utils/mode-detector.ts';

// Terminal interface configuration
export interface TerminalInterfaceConfig {
  mode?: 'auto' | 'command' | 'interactive';
  theme?: 'dark' | 'light';
  verbose?: boolean;
  debug?: boolean;
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
   * Initialize the terminal interface.
   */
  async initialize(): Promise<void> {
    // Initialization logic if needed
  }

  /**
   * Render the terminal interface.
   */
  async render(): Promise<void> {
    const { render } = await import('ink');
    const React = await import('react');
    const { TerminalApp } = await import('./terminal-interface-router');

    // Determine mode
    const _mode =
      this.config.mode === 'auto'
        ? detectMode(process.argv.slice(2), {})
        : (this.config.mode as TerminalMode);

    const commands = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
    const flags = this.parseFlags(process.argv.slice(2));
    if (this.config.debug) {
      console.log('Debug mode enabled', { mode: _mode, commands, flags });
    }

    // Render the appropriate interface
    const { unmount } = render(
      React.createElement(TerminalApp, {
        commands,
        flags: { ...flags, ...this.config },
        onExit: (code: number) => process.exit(code),
      })
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
   * Parse command line flags.
   *
   * @param args
   */
  private parseFlags(args: string[]): Record<string, any> {
    const flags: Record<string, any> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg && arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('-')) {
          flags[key] = nextArg;
          i++; // Skip next arg
        } else {
          flags[key] = true;
        }
      } else if (arg && arg.startsWith('-')) {
        const key = arg.slice(1);
        flags[key] = true;
      }
    }

    return flags;
  }

  /**
   * Get current configuration.
   */
  getConfig(): TerminalInterfaceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   *
   * @param updates
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
