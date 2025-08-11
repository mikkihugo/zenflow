// Interface mode detection utilities
/**
 * @file Interface-mode-detector implementation.
 */

export type InterfaceMode = 'cli' | 'tui' | 'web';

export interface ModeDetectionOptions {
  /** Force a specific mode regardless of environment */
  forceMode?: InterfaceMode;
  /** Enable web mode on specified port */
  webPort?: number;
  /** Enable daemon mode for web interface */
  daemon?: boolean;
  /** Prefer TUI over CLI in interactive environments */
  preferTui?: boolean;
}

export interface ModeDetectionResult {
  mode: InterfaceMode;
  reason: string;
  config: {
    port?: number;
    daemon?: boolean;
    interactive: boolean;
    hasTerminal: boolean;
    isCI: boolean;
  };
}

export class InterfaceModeDetector {
  /**
   * Detect the appropriate interface mode based on environment.
   *
   * @param options
   */
  static detect(options: ModeDetectionOptions = {}): ModeDetectionResult {
    const { forceMode, webPort, daemon, preferTui = true } = options;

    // Environment analysis
    const isCI = !!(
      process.env['CI'] ||
      process.env['GITHUB_ACTIONS'] ||
      process.env['TRAVIS'] ||
      process.env['JENKINS'] ||
      process.env['GITLAB_CI']
    );

    const hasTerminal = !!process.stdin?.isTTY;
    const interactive = hasTerminal && !isCI;

    // Command line argument analysis
    const args = process.argv.slice(2);
    const hasCliFlag = args.includes('--cli');
    const hasWebFlag = args.includes('--web') || args.includes('--daemon');
    const hasTuiFlag = args.includes('--tui') || args.includes('--interactive');

    let mode: InterfaceMode;
    let reason: string;

    // Force mode if specified
    if (forceMode) {
      mode = forceMode;
      reason = `Forced mode: ${forceMode}`;
    }
    // Explicit CLI flag or non-interactive environment
    else if (hasCliFlag || isCI || !hasTerminal) {
      mode = 'cli';
      reason = hasCliFlag
        ? 'Explicit --cli flag provided'
        : isCI
          ? 'CI/CD environment detected'
          : 'Non-interactive terminal detected';
    }
    // Explicit web flag or daemon mode
    else if (hasWebFlag || daemon || webPort) {
      mode = 'web';
      reason = hasWebFlag
        ? 'Explicit --web or --daemon flag provided'
        : webPort
          ? `Web port ${webPort} specified`
          : 'Daemon mode enabled';
    }
    // Explicit TUI flag
    else if (hasTuiFlag) {
      mode = 'tui';
      reason = 'Explicit --tui or --interactive flag provided';
    }
    // Interactive terminal - prefer TUI or CLI based on preference
    else if (interactive) {
      mode = preferTui ? 'tui' : 'cli';
      reason = preferTui
        ? 'Interactive terminal detected, preferring TUI mode'
        : 'Interactive terminal detected, preferring CLI mode';
    }
    // Fallback to CLI
    else {
      mode = 'cli';
      reason = 'Default fallback to CLI mode';
    }

    // Build config object with proper optional property handling
    const port = webPort || (mode === 'web' ? 3456 : undefined);
    const daemonMode = daemon || mode === 'web';

    const config: ModeDetectionResult['config'] = {
      interactive,
      hasTerminal,
      isCI,
    };

    // Only add optional properties when they have defined values
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

  /**
   * Get environment information for debugging.
   */
  static getEnvironmentInfo(): Record<string, any> {
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

  /**
   * Validate if a mode is supported in the current environment.
   *
   * @param mode
   */
  static validateMode(mode: InterfaceMode): {
    valid: boolean;
    reason?: string;
  } {
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
        // Web mode should work in any environment
        return { valid: true };

      default:
        return {
          valid: false,
          reason: `Unknown interface mode: ${mode}`,
        };
    }
  }

  /**
   * Get recommended mode based on current environment.
   */
  static getRecommendation(): {
    primary: InterfaceMode;
    alternatives: InterfaceMode[];
    explanation: string;
  } {
    const detection = InterfaceModeDetector.detect();
    const alternatives: InterfaceMode[] = [];

    // Always include CLI as it works everywhere
    if (detection.mode !== 'cli') {
      alternatives.push('cli');
    }

    // Add TUI if terminal is interactive
    if (detection.config.interactive && detection.mode !== 'tui') {
      alternatives.push('tui');
    }

    // Add web as it works everywhere
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
