/**
 * @file Terminal Adapters for CLI Interface.
 * 
 * Provides CLI interface with access to terminal functionality without direct imports.
 * Uses adapter pattern to maintain interface separation while sharing functionality.
 */

import type React from 'react';
import type { 
  CommandResult, 
  ExecutionContext,
  TerminalMode,
  CommandRenderer,
  TerminalApplication
} from '../../shared/command-interfaces';

/**
 * Command Execution Renderer Adapter
 * Wraps terminal command execution renderer functionality.
 *
 * @example
 */
export class CommandExecutionRendererAdapter implements CommandRenderer {
  private renderer: any = null;
  
  async initialize(): Promise<void> {
    // Dynamic import to avoid circular dependency
    const { CommandExecutionRenderer } = await import('../../terminal/command-execution-renderer');
    this.renderer = new CommandExecutionRenderer({});
  }

  renderResult(result: CommandResult): React.ReactElement | null {
    if (!this.renderer) return null;
    return this.renderer.renderResult?.(result) || null;
  }

  renderProgress(progress: { current: number; total: number; message?: string }): React.ReactElement | null {
    if (!this.renderer) return null;
    return this.renderer.renderProgress?.(progress) || null;
  }

  renderError(error: Error): React.ReactElement | null {
    if (!this.renderer) return null;
    return this.renderer.renderError?.(error) || null;
  }
}

/**
 * Interactive Terminal Application Adapter
 * Wraps terminal application functionality.
 *
 * @example
 */
export class InteractiveTerminalApplicationAdapter implements TerminalApplication {
  private terminal: any = null;

  async initialize(config?: any): Promise<void> {
    // Dynamic import to avoid circular dependency
    const { InteractiveTerminalApplication } = await import('../../terminal/interactive-terminal-application');
    this.terminal = new InteractiveTerminalApplication(config || {});
    await this.terminal.initialize?.();
  }

  async execute(command: string, args: string[], flags: Record<string, any>): Promise<CommandResult> {
    if (!this.terminal) {
      return {
        success: false,
        error: 'Terminal not initialized'
      };
    }

    try {
      const result = await this.terminal.execute?.(command, args, flags);
      return result || { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async shutdown(): Promise<void> {
    await this.terminal?.shutdown?.();
  }
}

/**
 * Mode Detector Adapter
 * Wraps terminal mode detection functionality.
 *
 * @example
 */
export class ModeDetectorAdapter {
  static async detectMode(
    args: string[], 
    flags: Record<string, any>
  ): Promise<TerminalMode> {
    try {
      // Dynamic import to avoid circular dependency
      const { detectMode } = await import('../../terminal/utils/mode-detector');
      return detectMode(args, flags);
    } catch (error) {
      console.warn('Mode detection failed, defaulting to interactive:', error);
      return 'interactive';
    }
  }
}