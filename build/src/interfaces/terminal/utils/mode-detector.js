/**
 * Terminal Mode Detector.
 *
 * Determines whether to launch command execution mode or interactive terminal interface.
 * Based on command line arguments and environment.
 */
/**
 * @file Interface implementation: mode-detector.
 */
/**
 * Detect terminal mode based on commands and flags.
 *
 * @param commands
 * @param flags
 * @example
 */
export function detectMode(commands, flags) {
    // Force interactive mode if --ui or --tui flag is present
    if (flags.ui || flags.tui) {
        return 'interactive';
    }
    // Force interactive mode if --interactive or -i flag is present
    if (flags.interactive || flags.i) {
        return 'interactive';
    }
    // If commands are provided, use command execution mode for direct execution
    if (commands.length > 0) {
        return 'command';
    }
    // If no commands and in TTY, default to interactive mode
    if (process.stdin.isTTY) {
        return 'interactive';
    }
    // Default to command mode for non-interactive environments
    return 'command';
}
/**
 * Get detailed mode detection result with reasoning.
 *
 * @param commands
 * @param flags
 * @example
 */
export function detectModeWithReason(commands, flags) {
    // Force interactive mode if --ui or --tui flag is present
    if (flags.ui || flags.tui) {
        return {
            mode: 'interactive',
            reason: 'Interactive terminal interface forced by --ui or --tui flag',
        };
    }
    // Force interactive mode if --interactive or -i flag is present
    if (flags.interactive || flags.i) {
        return {
            mode: 'interactive',
            reason: 'Interactive terminal interface forced by --interactive or -i flag',
        };
    }
    // If commands are provided, use command execution mode for direct execution
    if (commands.length > 0) {
        return {
            mode: 'command',
            reason: `Command execution mode for: ${commands.join(' ')}`,
        };
    }
    // If no commands and in TTY, default to interactive mode
    if (process.stdin.isTTY) {
        return {
            mode: 'interactive',
            reason: 'Interactive terminal interface - no commands provided and TTY detected',
        };
    }
    // Default to command mode for non-interactive environments
    return {
        mode: 'command',
        reason: 'Command execution mode - non-interactive environment detected',
    };
}
/**
 * Check if current environment supports interactive terminal interface.
 *
 * @example
 */
export function isInteractiveSupported() {
    return (process.stdin.isTTY &&
        process.stdout.isTTY &&
        !process.env['CI'] &&
        process.env['TERM'] !== 'dumb');
}
/**
 * Check if current environment supports command execution mode.
 *
 * @example
 */
export function isCommandExecutionSupported() {
    // Command execution mode is supported in all environments
    return true;
}
/**
 * Get environment information for debugging.
 *
 * @example
 */
export function getEnvironmentInfo() {
    return {
        isTTY: process.stdin.isTTY,
        isCI: !!process.env['CI'],
        term: process.env['TERM'],
        platform: process.platform,
        nodeVersion: process.version,
        interactiveSupported: isInteractiveSupported(),
        commandExecutionSupported: isCommandExecutionSupported(),
    };
}
