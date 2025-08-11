/**
 * @file Terminal Adapters for CLI Interface.
 *
 * Provides CLI interface with access to terminal functionality without direct imports.
 * Uses adapter pattern to maintain interface separation while sharing functionality.
 */
/**
 * Command Execution Renderer Adapter
 * Wraps terminal command execution renderer functionality.
 *
 * @example
 */
export class CommandExecutionRendererAdapter {
    renderer = null;
    async initialize() {
        // Dynamic import to avoid circular dependency
        const { CommandExecutionRenderer } = await import('../../terminal/command-execution-renderer');
        this.renderer = new CommandExecutionRenderer({});
    }
    renderResult(result) {
        if (!this.renderer)
            return null;
        return this.renderer.renderResult?.(result) || null;
    }
    renderProgress(progress) {
        if (!this.renderer)
            return null;
        return this.renderer.renderProgress?.(progress) || null;
    }
    renderError(error) {
        if (!this.renderer)
            return null;
        return this.renderer.renderError?.(error) || null;
    }
}
/**
 * Interactive Terminal Application Adapter
 * Wraps terminal application functionality.
 *
 * @example
 */
export class InteractiveTerminalApplicationAdapter {
    terminal = null;
    async initialize(config) {
        // Dynamic import to avoid circular dependency
        const { InteractiveTerminalApplication } = await import('../../terminal/interactive-terminal-application');
        this.terminal = new InteractiveTerminalApplication(config || {});
        await this.terminal.initialize?.();
    }
    async execute(command, args, flags) {
        if (!this.terminal) {
            return {
                success: false,
                error: 'Terminal not initialized',
            };
        }
        try {
            const result = await this.terminal.execute?.(command, args, flags);
            return result || { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async shutdown() {
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
    static async detectMode(args, flags) {
        try {
            // Dynamic import to avoid circular dependency
            const { detectMode } = await import('../../terminal/utils/mode-detector.ts');
            return detectMode(args, flags);
        }
        catch (error) {
            console.warn('Mode detection failed, defaulting to interactive:', error);
            return 'interactive';
        }
    }
}
