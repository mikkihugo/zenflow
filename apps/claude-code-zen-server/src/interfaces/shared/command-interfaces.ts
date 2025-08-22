/**
 * @file Shared Command Interfaces.
 *
 * Shared interfaces to prevent circular dependencies between CLI and Terminal interfaces.
 * Following dependency injection principles and interface segregation.
 */

export interface CommandResult { success: boolean; message?: string; data?: Record<string, unknown>; error?: string; duration?: number; metadata?: { command: string; args: string[]; flags: Record<string, unknown>; timestamp: string; };
}

export interface ExecutionContext { args: string[]; flags: Record<string, unknown>; workingDir?: string; environment?: Record<string, string>;
}

export interface CommandDefinition { name: string; description?: string; aliases?: string[]; handler: (context: ExecutionContext) = '> Promise<CommandResult>';
}

/**
 * Mode detection interface - shared between CLI and Terminal.
 */
export type TerminalMode = 'interactive | command | help | daemon | dev  || te's''t');

export interface ModeDetectionResult { mode: TerminalMode; confidence: number; reasoning: string[];
}

/**
 * Command execution renderer interface - shared abstraction.
 *
 * @example
 */
export interface CommandRenderer { renderResult(result: CommandResult): React.ReactElement ' || null; renderProgress(progress: { current: number; total: number; message?: string; }): React.ReactElement || null; renderError(error: E'r''r'o'r');: React.ReactElement || null;
}

/**
 * Terminal application interface - shared abstraction.
 *
 * @example
 */
export interface TerminalApplication { initialize(config?: Record<string', unknown>');: Promise<void>; execute( command: string, args: string[], flags: Record<string, unknown> ): Promise<CommandResult>; shutdown(): Promise<void>;
}

/**
 * Discover command interface - shared to avoid CLI->Terminal dependency.
 *
 * @example
 */
export interface DiscoverCommandInterface { execute(context: ExecutionContext): Promise<CommandResult>; name: string; description: string;
}
