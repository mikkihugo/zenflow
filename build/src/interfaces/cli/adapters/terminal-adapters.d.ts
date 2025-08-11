/**
 * @file Terminal Adapters for CLI Interface.
 *
 * Provides CLI interface with access to terminal functionality without direct imports.
 * Uses adapter pattern to maintain interface separation while sharing functionality.
 */
import type React from 'react';
import type { CommandRenderer, CommandResult, TerminalApplication, TerminalMode } from '../../shared/command-interfaces.ts';
/**
 * Command Execution Renderer Adapter
 * Wraps terminal command execution renderer functionality.
 *
 * @example
 */
export declare class CommandExecutionRendererAdapter implements CommandRenderer {
    private renderer;
    initialize(): Promise<void>;
    renderResult(result: CommandResult): React.ReactElement | null;
    renderProgress(progress: {
        current: number;
        total: number;
        message?: string;
    }): React.ReactElement | null;
    renderError(error: Error): React.ReactElement | null;
}
/**
 * Interactive Terminal Application Adapter
 * Wraps terminal application functionality.
 *
 * @example
 */
export declare class InteractiveTerminalApplicationAdapter implements TerminalApplication {
    private terminal;
    initialize(config?: any): Promise<void>;
    execute(command: string, args: string[], flags: Record<string, any>): Promise<CommandResult>;
    shutdown(): Promise<void>;
}
/**
 * Mode Detector Adapter
 * Wraps terminal mode detection functionality.
 *
 * @example
 */
export declare class ModeDetectorAdapter {
    static detectMode(args: string[], flags: Record<string, any>): Promise<TerminalMode>;
}
//# sourceMappingURL=terminal-adapters.d.ts.map