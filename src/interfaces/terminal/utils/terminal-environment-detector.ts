/**
 * @fileoverview Terminal Environment Detector
 *
 * Comprehensive detection of terminal capabilities and environment for better
 * TUI compatibility and graceful fallbacks.
 */

export interface TerminalEnvironment {
  isTTY: boolean;
  hasRawMode: boolean;
  supportsColor: boolean;
  terminalType: string | undefined;
  platform: string;
  nodeVersion: string;
  columns: number;
  rows: number;
  isCI: boolean;
  isDocker: boolean;
  isWSL: boolean;
  capabilities: {
    cursor: boolean;
    mouse: boolean;
    focus: boolean;
    unicode: boolean;
  };
}

export interface TerminalDetectionResult {
  supported: boolean;
  environment: TerminalEnvironment;
  issues: string[];
  recommendations: string[];
  fallbackOptions: string[];
}

/**
 * Detect if running in a CI environment.
 */
function detectCI(): boolean {
  const ciVariables = [
    'CI',
    'CONTINUOUS_INTEGRATION',
    'GITHUB_ACTIONS',
    'GITLAB_CI',
    'JENKINS_URL',
    'TRAVIS',
    'CIRCLECI',
    'BUILDKITE',
  ];

  return ciVariables.some((variable) => process.env[variable]);
}

/**
 * Detect if running in Docker.
 */
function detectDocker(): boolean {
  try {
    const fs = require('fs');
    return (
      fs.existsSync('/.dockerenv') ||
      (fs.existsSync('/proc/self/cgroup') &&
        fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker'))
    );
  } catch {
    return false;
  }
}

/**
 * Detect if running in WSL (Windows Subsystem for Linux).
 */
function detectWSL(): boolean {
  try {
    const fs = require('fs');
    if (fs.existsSync('/proc/version')) {
      const version = fs.readFileSync('/proc/version', 'utf8');
      return (
        version.toLowerCase().includes('microsoft') ||
        version.toLowerCase().includes('wsl')
      );
    }
  } catch {
    // Ignore errors
  }

  return (
    process.env.WSL_DISTRO_NAME !== undefined ||
    process.env.WSLENV !== undefined
  );
}

/**
 * Detect color support in terminal.
 */
function detectColorSupport(): boolean {
  // Force color settings
  if (process.env.FORCE_COLOR !== undefined) {
    return process.env.FORCE_COLOR !== '0';
  }

  // No color settings
  if (process.env.NO_COLOR !== undefined || process.env.NODE_DISABLE_COLORS) {
    return false;
  }

  // CI environments often support color
  if (detectCI()) {
    return true;
  }

  // Check terminal type
  const term = process.env.TERM;
  if (!term || term === 'dumb') {
    return false;
  }

  // Color terminal indicators
  if (
    term.includes('color') ||
    term.includes('256') ||
    term.includes('true') ||
    term === 'xterm' ||
    term === 'screen'
  ) {
    return true;
  }

  return process.stdout.isTTY;
}

/**
 * Detect terminal capabilities.
 */
function detectCapabilities(): TerminalEnvironment['capabilities'] {
  const term = process.env.TERM || '';

  return {
    cursor: !['dumb', 'cons25'].includes(term),
    mouse:
      term.includes('xterm') ||
      term.includes('screen') ||
      term.includes('tmux'),
    focus: term.includes('xterm') || term.includes('screen'),
    unicode:
      process.env.LANG?.includes('UTF-8') ||
      process.env.LC_ALL?.includes('UTF-8') ||
      process.platform !== 'win32',
  };
}

/**
 * Get terminal dimensions safely.
 */
function getTerminalDimensions(): { columns: number; rows: number } {
  try {
    return {
      columns: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
    };
  } catch {
    return { columns: 80, rows: 24 };
  }
}

/**
 * Comprehensive terminal environment detection.
 */
export function detectTerminalEnvironment(): TerminalDetectionResult {
  const environment: TerminalEnvironment = {
    isTTY: process.stdin.isTTY || false,
    hasRawMode: typeof process.stdin.setRawMode === 'function',
    supportsColor: detectColorSupport(),
    terminalType: process.env.TERM,
    platform: process.platform,
    nodeVersion: process.version,
    ...getTerminalDimensions(),
    isCI: detectCI(),
    isDocker: detectDocker(),
    isWSL: detectWSL(),
    capabilities: detectCapabilities(),
  };

  const issues: string[] = [];
  const recommendations: string[] = [];
  const fallbackOptions: string[] = [];

  // Check TTY support
  if (!environment.isTTY) {
    issues.push('No TTY available (not running in interactive terminal)');
    recommendations.push('Run in an interactive terminal session');
    fallbackOptions.push('Use command-line interface instead');
  }

  // Check raw mode support
  if (!environment.hasRawMode) {
    issues.push('setRawMode function not available');
    recommendations.push('Update Node.js to latest version');
    fallbackOptions.push('Use simplified text interface');
  }

  // Check CI environment
  if (environment.isCI) {
    issues.push('Running in CI environment');
    recommendations.push(
      'CI environments typically do not support interactive TUI'
    );
    fallbackOptions.push('Use automated/headless mode');
  }

  // Check Docker environment
  if (environment.isDocker) {
    issues.push('Running in Docker container');
    recommendations.push('Use docker run -it for interactive mode');
    fallbackOptions.push('Use API or configuration file interface');
  }

  // Check terminal size
  if (environment.columns < 80 || environment.rows < 24) {
    issues.push(
      `Terminal too small (${environment.columns}x${environment.rows})`
    );
    recommendations.push('Use a larger terminal window (minimum 80x24)');
    fallbackOptions.push('Use compact text mode');
  }

  // Check color support
  if (!environment.supportsColor) {
    issues.push('Terminal does not support colors');
    recommendations.push('Use a color-capable terminal');
    fallbackOptions.push('Use monochrome text interface');
  }

  // Platform-specific checks
  if (environment.platform === 'win32') {
    if (!environment.terminalType || environment.terminalType === 'dumb') {
      issues.push('Windows terminal may have limited support');
      recommendations.push('Use Windows Terminal, PowerShell, or WSL');
      fallbackOptions.push('Use web interface');
    }
  }

  // WSL specific
  if (environment.isWSL) {
    recommendations.push('WSL detected - should work well with TUI');
  }

  // Determine overall support
  const supported =
    environment.isTTY &&
    environment.hasRawMode &&
    !environment.isCI &&
    environment.columns >= 60 &&
    environment.rows >= 15;

  return {
    supported,
    environment,
    issues,
    recommendations,
    fallbackOptions,
  };
}

/**
 * Check specific raw mode support with enhanced error handling.
 */
export function checkRawModeSupport(): {
  supported: boolean;
  error?: string;
  canTest: boolean;
} {
  try {
    // First check if function exists
    if (typeof process.stdin.setRawMode !== 'function') {
      return {
        supported: false,
        error: 'setRawMode function not available',
        canTest: false,
      };
    }

    // Check if we can test (TTY required)
    if (!process.stdin.isTTY) {
      return {
        supported: false,
        error: 'Cannot test raw mode - not a TTY',
        canTest: false,
      };
    }

    // Try to test raw mode (this might fail on some platforms)
    const originalMode = process.stdin.isRaw;

    try {
      process.stdin.setRawMode(true);
      process.stdin.setRawMode(false);

      // Restore original mode
      if (originalMode !== undefined) {
        process.stdin.setRawMode(originalMode);
      }

      return {
        supported: true,
        canTest: true,
      };
    } catch (testError) {
      return {
        supported: false,
        error: `Raw mode test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`,
        canTest: true,
      };
    }
  } catch (error) {
    return {
      supported: false,
      error: `Raw mode check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      canTest: false,
    };
  }
}

/**
 * Generate a detailed environment report.
 */
export function generateEnvironmentReport(): string {
  const detection = detectTerminalEnvironment();
  const rawModeCheck = checkRawModeSupport();

  const lines = [
    '🔍 Terminal Environment Report',
    '='.repeat(50),
    '',
    '📊 Basic Information:',
    `  Platform: ${detection.environment.platform}`,
    `  Node.js: ${detection.environment.nodeVersion}`,
    `  Terminal Type: ${detection.environment.terminalType || 'unknown'}`,
    `  Size: ${detection.environment.columns}x${detection.environment.rows}`,
    '',
    '🔌 Terminal Support:',
    `  TTY Available: ${detection.environment.isTTY ? '✅' : '❌'}`,
    `  Raw Mode Function: ${detection.environment.hasRawMode ? '✅' : '❌'}`,
    `  Color Support: ${detection.environment.supportsColor ? '✅' : '❌'}`,
    `  Unicode Support: ${detection.environment.capabilities.unicode ? '✅' : '❌'}`,
    '',
    '🌍 Environment:',
    `  CI Environment: ${detection.environment.isCI ? '⚠️ Yes' : '✅ No'}`,
    `  Docker Container: ${detection.environment.isDocker ? '⚠️ Yes' : '✅ No'}`,
    `  WSL: ${detection.environment.isWSL ? 'ℹ️ Yes' : 'No'}`,
    '',
    '🧪 Raw Mode Test:',
    `  Can Test: ${rawModeCheck.canTest ? '✅' : '❌'}`,
    `  Supported: ${rawModeCheck.supported ? '✅' : '❌'}`,
    ...(rawModeCheck.error ? [`  Error: ${rawModeCheck.error}`] : []),
    '',
    '📋 Overall Assessment:',
    `  TUI Supported: ${detection.supported ? '✅ YES' : '❌ NO'}`,
  ];

  if (detection.issues.length > 0) {
    lines.push('', '⚠️ Issues Found:');
    detection.issues.forEach((issue) => lines.push(`  • ${issue}`));
  }

  if (detection.recommendations.length > 0) {
    lines.push('', '💡 Recommendations:');
    detection.recommendations.forEach((rec) => lines.push(`  • ${rec}`));
  }

  if (detection.fallbackOptions.length > 0) {
    lines.push('', '🔄 Fallback Options:');
    detection.fallbackOptions.forEach((option) => lines.push(`  • ${option}`));
  }

  return lines.join('\n');
}
