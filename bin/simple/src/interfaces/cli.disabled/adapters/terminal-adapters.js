export class CommandExecutionRendererAdapter {
    renderer = null;
    async initialize() {
        const { CommandExecutionRenderer } = await import('../../terminal/command-execution-renderer.js');
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
export class InteractiveTerminalApplicationAdapter {
    terminal = null;
    async initialize(config) {
        const { InteractiveTerminalApplication } = await import('../../terminal/interactive-terminal-application.js');
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
export class ModeDetectorAdapter {
    static async detectMode(args, flags) {
        try {
            const { detectMode } = await import('../../terminal/utils/mode-detector.ts');
            return detectMode(args, flags);
        }
        catch (error) {
            console.warn('Mode detection failed, defaulting to interactive:', error);
            return 'interactive';
        }
    }
}
//# sourceMappingURL=terminal-adapters.js.map