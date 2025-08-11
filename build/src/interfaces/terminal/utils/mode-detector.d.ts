/**
 * Terminal Mode Detector.
 *
 * Determines whether to launch command execution mode or interactive terminal interface.
 * Based on command line arguments and environment.
 */
/**
 * @file Interface implementation: mode-detector.
 */
export type TerminalMode = 'command' | 'interactive';
export interface ModeDetectionResult {
    mode: TerminalMode;
    reason: string;
}
/**
 * Detect terminal mode based on commands and flags.
 *
 * @param commands
 * @param flags
 * @example
 */
export declare function detectMode(commands: string[], flags: Record<string, any>): TerminalMode;
/**
 * Get detailed mode detection result with reasoning.
 *
 * @param commands
 * @param flags
 * @example
 */
export declare function detectModeWithReason(commands: string[], flags: Record<string, any>): ModeDetectionResult;
/**
 * Check if current environment supports interactive terminal interface.
 *
 * @example
 */
export declare function isInteractiveSupported(): boolean;
/**
 * Check if current environment supports command execution mode.
 *
 * @example
 */
export declare function isCommandExecutionSupported(): boolean;
/**
 * Get environment information for debugging.
 *
 * @example
 */
export declare function getEnvironmentInfo(): {
    isTTY: boolean;
    isCI: boolean;
    term: string | undefined;
    platform: NodeJS.Platform;
    nodeVersion: string;
    interactiveSupported: boolean;
    commandExecutionSupported: boolean;
};
//# sourceMappingURL=mode-detector.d.ts.map