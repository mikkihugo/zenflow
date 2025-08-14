export function detectMode(commands, flags) {
    if (flags.ui || flags.tui) {
        return 'interactive';
    }
    if (flags.interactive || flags.i) {
        return 'interactive';
    }
    if (commands.length > 0) {
        return 'command';
    }
    if (process.stdin.isTTY) {
        return 'interactive';
    }
    return 'command';
}
export function detectModeWithReason(commands, flags) {
    if (flags.ui || flags.tui) {
        return {
            mode: 'interactive',
            reason: 'Interactive terminal interface forced by --ui or --tui flag',
        };
    }
    if (flags.interactive || flags.i) {
        return {
            mode: 'interactive',
            reason: 'Interactive terminal interface forced by --interactive or -i flag',
        };
    }
    if (commands.length > 0) {
        return {
            mode: 'command',
            reason: `Command execution mode for: ${commands.join(' ')}`,
        };
    }
    if (process.stdin.isTTY) {
        return {
            mode: 'interactive',
            reason: 'Interactive terminal interface - no commands provided and TTY detected',
        };
    }
    return {
        mode: 'command',
        reason: 'Command execution mode - non-interactive environment detected',
    };
}
export function isInteractiveSupported() {
    return (process.stdin.isTTY &&
        process.stdout.isTTY &&
        !process.env['CI'] &&
        process.env['TERM'] !== 'dumb');
}
export function isCommandExecutionSupported() {
    return true;
}
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
//# sourceMappingURL=mode-detector.js.map