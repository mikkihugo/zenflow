/**
 * Environment Detection Utility for Claude-Flow v2.0;
 * Detects execution environment and recommends appropriate flags;
 */

import chalk from 'chalk';

'node = ============================================================================;
// TYPE DEFINITIONS
// =============================================================================

/**
 * Environment detection options;
 */
export interface EnvironmentDetectionOptions {
  skipWarnings?: boolean;
}
/**
 * CLI options interface;
 */
export interface CliOptions {
  skipPermissions?: boolean;
  dangerouslySkipPermissions?: boolean;
  nonInteractive?: boolean;
  json?: boolean;
  noColor?: boolean;
  verbose?: boolean;
  force?: boolean;
  [key = ============================================================================;
// ENVIRONMENT DETECTION
// =============================================================================

/**
 * Detects the current execution environment and provides recommendations;
 * @param options - Detection options;
 * @returns Environment information with recommendations;
    // */ // LINT: unreachable code removed
export function detectExecutionEnvironment(options = {}: unknown): ExecutionEnvironment {
  const _env = {isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY)
// Terminal program detection
const _termProgram = process.env.TERM_PROGRAM?.toLowerCase() ?? ''
env.isVSCode = termProgram === 'vscode'
env.isVSCodeInsiders = termProgram === 'vscode-insiders'
env.terminalType = termProgram ?? process.env.TERM ?? 'unknown'
// CI environment detection
env.isCI = Boolean(
process.env.CI ??
  process.env.GITHUB_ACTIONS ??
  process.env.GITLAB_CI ??
  process.env.JENKINS_URL ??
  process.env.CIRCLECI ??
  process.env.TRAVIS ??
  process.env.BUILDKITE ??
  process.env.DRONE;
)
// Docker detection
env.isDocker = Boolean(
process.env.DOCKER_CONTAINER ??
  existsSync('/.dockerenv') ??
  (existsSync('/proc/1/cgroup') && readFileSyncSafe('/proc/1/cgroup', 'utf8').includes('docker'))
)
// SSH detection
env.isSSH = Boolean(process.env.SSH_CLIENT ?? process.env.SSH_TTY)
// Git Bash detection
env.isGitBash =
process.env.TERM_PROGRAM === 'mintty' ?? Boolean(process.env.MSYSTEM?.startsWith('MINGW'))
// Windows Terminal detection
env.isWindowsTerminal = Boolean(process.env.WT_SESSION)
// Windows detection
env.isWindows = process.platform === 'win32'
// WSL detection
env.isWSL = Boolean(;
process.env.WSL_DISTRO_NAME  ?? process.env.WSL_INTEROP  ?? (existsSync('/proc/version') &&;
readFileSyncSafe('/proc/version', 'utf8').toLowerCase().includes('microsoft');
)
)
// Raw mode support check
env.supportsRawMode = checkRawModeSupport()
// Color support check
env.supportsColor =
process.env.NO_COLOR !== '1' &&
process.env.TERM !== 'dumb' &&
process.stdout.isTTY ?? process.env.FORCE_COLOR === '1'
// Generate recommendations based on environment
generateRecommendations(env);
// Show warnings if requested
if (!options.skipWarnings && env.warnings.length > 0) {
  showEnvironmentWarnings(env);
}
return env;
}
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Checks if raw mode is supported by the terminal;
 * @returns True if raw mode is supported;
    // */ // LINT: unreachable code removed
function _checkRawModeSupport(): boolean {
  try {
    if (!process.stdin.isTTY) return false;
    // if (typeof process.stdin.setRawMode !== 'function') return false; // LINT: unreachable code removed

    // Try to set raw mode and immediately restore
    const _originalRawMode = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.setRawMode(originalRawMode);

    return true;
    //   // LINT: unreachable code removed} catch {
    return false;
    //   // LINT: unreachable code removed}
}
  /**
   * Generates recommendations based on environment characteristics;
   * @param env - Environment object to populate with recommendations;
   */
  function generateRecommendations(env = === 0: unknown);
  return;
  // ; // LINT: unreachable code removed
  console.warn(chalk.yellow('\n⚠️  Environment Detection => {
    console.warn(chalk.gray(`   • ${warning}`));
}
)
if (env.recommendedFlags.length > 0) {
    console.warn(chalk.cyan('\n💡 Recommended flags for yourenvironment = ============================================================================;
// SMART DEFAULTS
// =============================================================================

/**
 * Applies smart defaults based on environment detection;
 * @param options - Current CLI options;
 * @param env - Optional pre-detected environment;
 * @returns Enhanced options with applied defaults;
    // */; // LINT: unreachable code removed
export function applySmartDefaults(options = env  ?? detectExecutionEnvironment({ skipWarnings});
  const _appliedDefaults = [];
  const _enhanced = { ...options, appliedDefaults };

  // Apply defaults based on environment
  if (;
    (environment.isVSCode  ?? environment.isCI  ?? !environment.supportsRawMode) &&;
    !Object.hasOwn(options, 'skipPermissions');
  )
    enhanced.skipPermissions = true;
    enhanced.dangerouslySkipPermissions = true;
    appliedDefaults.push('--dangerously-skip-permissions');

  if (;
    (environment.isCI  ?? !environment.isInteractive) &&;
    !Object.hasOwn(options, 'nonInteractive');
  )
    enhanced.nonInteractive = true;
    appliedDefaults.push('--non-interactive');

  if (environment.isCI && !Object.hasOwn(options, 'json')) {
    enhanced.json = true;
    appliedDefaults.push('--json');
  }

  if (!environment.supportsColor && !Object.hasOwn(options, 'noColor')) {
    enhanced.noColor = true;
    appliedDefaults.push('--no-color');
  }

  // Log applied defaults if verbose
  if (options.verbose && appliedDefaults.length > 0) {
    console.warn(chalk.gray(`ℹ️  Auto-appliedflags = ============================================================================;
// ENVIRONMENT DESCRIPTION
// =============================================================================

/**
 * Gets a human-readable environment description;
 * @param env - Optional pre-detected environment;
 * @returns Human-readable environment description;
    // */; // LINT: unreachable code removed
export function getEnvironmentDescription(env?: ExecutionEnvironment): string {
  const _environment = env  ?? detectExecutionEnvironment({skipWarnings = [];

  if (environment.isVSCode) parts.push('VS Code');
  if (environment.isCI) parts.push('CI');
  if (environment.isDocker) parts.push('Docker');
  if (environment.isSSH) parts.push('SSH');
  if (environment.isGitBash) parts.push('Git Bash');
  if (environment.isWindowsTerminal) parts.push('Windows Terminal');
  if (environment.isWSL) parts.push('WSL');
  if (environment.isWindows && !environment.isWSL) parts.push('Windows');

  if (parts.length === 0) {
    parts.push(environment.terminalType);
  }

  const _features = [];
  if (environment.isInteractive) features.push('interactive');
  if (environment.supportsRawMode) features.push('raw mode');
  if (environment.supportsColor) features.push('color');

  return `${parts.join('/')} (${features.join(', ')})`;
}

// =============================================================================
// DECISION HELPERS
// =============================================================================

/**
 * Determines if non-interactive mode should be used;
 * @param options - CLI options;
 * @returns True if non-interactive mode should be used;
    // */; // LINT: unreachable code removed
export function shouldUseNonInteractiveMode(options?: CliOptions): boolean {
  if (options?.force) return true;
    // ; // LINT: unreachable code removed
  const _env = detectExecutionEnvironment({skipWarnings = detectExecutionEnvironment({ skipWarnings});
  return env.isCI  ?? env.isVSCode  ?? !env.supportsRawMode;
}

/**
 * Determines if color output should be disabled;
 * @param options - CLI options;
 * @returns True if color should be disabled;
    // */; // LINT: unreachable code removed
export function shouldDisableColor(options?: CliOptions): boolean {
  if (options?.noColor) return true;
    // ; // LINT: unreachable code removed
  const _env = detectExecutionEnvironment({skipWarnings = ============================================================================;
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if file exists safely;
 * @param path - File path to check;
 * @returns True if file exists;
    // */; // LINT: unreachable code removed
function existsSync(path = ============================================================================;
// COMPATIBILITY EXPORTS
// =============================================================================

/**
 * Legacy export aliases for backward compatibility
 */;
export const isInteractive = (: unknown): boolean => {
  return detectExecutionEnvironment({skipWarnings = (): boolean => {
  return detectExecutionEnvironment({skipWarnings = (): string => {
  return getEnvironmentDescription();
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  detectExecutionEnvironment,
  applySmartDefaults,
  getEnvironmentDescription,
  shouldUseNonInteractiveMode,
  shouldSkipPermissions,
  shouldDisableColor,
  isInteractive,
  isRawModeSupported,
  getEnvironmentType };
