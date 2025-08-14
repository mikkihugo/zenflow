export class InterfaceModeDetector {
    static detect(options = {}) {
        const { forceMode, webPort, daemon, preferTui = true } = options;
        const isCI = !!(process.env['CI'] ||
            process.env['GITHUB_ACTIONS'] ||
            process.env['TRAVIS'] ||
            process.env['JENKINS'] ||
            process.env['GITLAB_CI']);
        const hasTerminal = !!process.stdin?.isTTY;
        const interactive = hasTerminal && !isCI;
        const args = process.argv.slice(2);
        const hasCliFlag = args.includes('--cli');
        const hasWebFlag = args.includes('--web') || args.includes('--daemon');
        const hasTuiFlag = args.includes('--tui') || args.includes('--interactive');
        let mode;
        let reason;
        if (forceMode) {
            mode = forceMode;
            reason = `Forced mode: ${forceMode}`;
        }
        else if (hasCliFlag || isCI || !hasTerminal) {
            mode = 'cli';
            reason = hasCliFlag
                ? 'Explicit --cli flag provided'
                : isCI
                    ? 'CI/CD environment detected'
                    : 'Non-interactive terminal detected';
        }
        else if (hasWebFlag || daemon || webPort) {
            mode = 'web';
            reason = hasWebFlag
                ? 'Explicit --web or --daemon flag provided'
                : webPort
                    ? `Web port ${webPort} specified`
                    : 'Daemon mode enabled';
        }
        else if (hasTuiFlag) {
            mode = 'tui';
            reason = 'Explicit --tui or --interactive flag provided';
        }
        else if (interactive) {
            mode = preferTui ? 'tui' : 'cli';
            reason = preferTui
                ? 'Interactive terminal detected, preferring TUI mode'
                : 'Interactive terminal detected, preferring CLI mode';
        }
        else {
            mode = 'cli';
            reason = 'Default fallback to CLI mode';
        }
        const port = webPort || (mode === 'web' ? 3456 : undefined);
        const daemonMode = daemon || mode === 'web';
        const config = {
            interactive,
            hasTerminal,
            isCI,
        };
        if (port !== undefined) {
            config.port = port;
        }
        if (daemonMode !== undefined) {
            config.daemon = daemonMode;
        }
        return {
            mode,
            reason,
            config,
        };
    }
    static getEnvironmentInfo() {
        return {
            platform: process.platform,
            nodeVersion: process.version,
            tty: {
                stdin: !!process.stdin?.isTTY,
                stdout: !!process.stdout?.isTTY,
                stderr: !!process.stderr?.isTTY,
            },
            environment: {
                ci: !!process.env['CI'],
                github: !!process.env['GITHUB_ACTIONS'],
                term: process.env['TERM'],
                termProgram: process.env['TERM_PROGRAM'],
                colorTerm: process.env['COLORTERM'],
            },
            argv: process.argv,
            cwd: process.cwd(),
        };
    }
    static validateMode(mode) {
        switch (mode) {
            case 'cli':
                return { valid: true };
            case 'tui':
                if (!(process.stdin && process.stdin.isTTY)) {
                    return {
                        valid: false,
                        reason: 'TUI mode requires an interactive terminal',
                    };
                }
                return { valid: true };
            case 'web':
                return { valid: true };
            default:
                return {
                    valid: false,
                    reason: `Unknown interface mode: ${mode}`,
                };
        }
    }
    static getRecommendation() {
        const detection = InterfaceModeDetector.detect();
        const alternatives = [];
        if (detection.mode !== 'cli') {
            alternatives.push('cli');
        }
        if (detection.config.interactive && detection.mode !== 'tui') {
            alternatives.push('tui');
        }
        if (detection.mode !== 'web') {
            alternatives.push('web');
        }
        let explanation = `Primary mode: ${detection.mode} (${detection.reason}).`;
        if (alternatives.length > 0) {
            explanation += ` Alternatives: ${alternatives.join(', ')}.`;
        }
        return {
            primary: detection.mode,
            alternatives,
            explanation,
        };
    }
}
//# sourceMappingURL=interface-mode-detector.js.map