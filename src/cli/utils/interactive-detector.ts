// interactive-detector.ts - Detect and handle non-interactive environments

/**
 * Environment type definitions
 */
export type EnvironmentType =
  | 'non-tty-stdin'
  | 'non-tty-stdout'
  | 'ci-environment'
  | 'github-actions'
  | 'docker'
  | 'wsl'
  | 'windows'
  | 'vscode'
  | 'no-raw-mode'
  | 'interactive';

/**
 * Interactive function type
 */
export type InteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = (
  ...args
) => Promise<TReturn>;

/**
 * Non-interactive function type
 */
export type NonInteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = (
  ...args
) => Promise<TReturn>;

/**
 * Check if the current environment supports interactive TTY features
 */
export function isInteractive(): boolean {
  // Check if stdin is a TTY
  if (!process.stdin.isTTY) {
    return false;
  }

  // Check if stdout is a TTY
  if (!process.stdout.isTTY) {
    return false;
  }

  // Check for CI environment variables
  const ciVars = [
    'CI',
    'CONTINUOUS_INTEGRATION',
    'GITHUB_ACTIONS',
    'GITLAB_CI',
    'JENKINS_URL',
    'TRAVIS',
    'CIRCLECI',
    'CODEBUILD_BUILD_ID',
    'BUILDKITE',
    'DRONE',
  ];

  for (const varName of ciVars) {
    if (process.env[varName]) {
      return false;
    }
  }

  // Check if running inside Docker (common indicator)
  if (process.env.DOCKER_CONTAINER || process.env.KUBERNETES_SERVICE_HOST) {
    return false;
  }

  // Check if running in non-interactive mode explicitly
  if (process.env.CLAUDE_FLOW_NON_INTERACTIVE === 'true') {
    return false;
  }

  return true;
}

/**
 * Check if raw mode is supported (for Ink UI components)
 */
export function isRawModeSupported(): boolean {
  return (
    process.stdin.isTTY &&
    process.stdin.setRawMode !== undefined &&
    typeof process.stdin.setRawMode === 'function'
  );
}

/**
 * Get environment type for logging/debugging
 */
export function getEnvironmentType(): EnvironmentType {
  if (!process.stdin.isTTY) return 'non-tty-stdin';
  if (!process.stdout.isTTY) return 'non-tty-stdout';
  if (process.env.CI) return 'ci-environment';
  if (process.env.GITHUB_ACTIONS) return 'github-actions';
  if (process.env.DOCKER_CONTAINER) return 'docker';
  if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) return 'wsl';
  if (process.platform === 'win32') return 'windows';
  if (process.env.TERM_PROGRAM === 'vscode') return 'vscode';
  if (!isRawModeSupported()) return 'no-raw-mode';
  return 'interactive';
}

/**
 * Wrap a command to handle non-interactive environments
 */
export function handleNonInteractive<TArgs extends unknown[], TReturn>(commandName = > Promise<TReturn> {
  return async (...args => {
    if (isInteractive() && isRawModeSupported()) {
      // Run interactive version
      return interactiveFn(...args);
} else
{
      // Run non-interactive version or show helpful message
      if (nonInteractiveFn) {
        return nonInteractiveFn(...args);
      } else {
        console.error(`\n⚠️  ${commandName} requires an interactive terminal.`);
        console.error(`\nDetectedenvironment = "your-api-key"');
        console.error('3. Use --non-interactive flag with required parameters');
        console.error('4. If using Docker, runwith = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.error('\n❌ Non-interactive mode requires API key to be set.');
      console.error('\nSet one of these environmentvariables = "your-api-key"');
      console.error('  export CLAUDE_API_KEY="your-api-key"');
      console.error('\nOr run in an interactive terminal for login prompt.\n');
      return false;
    }
    return true;
  }
  return true;
}

/**
 * Get terminal capabilities information
 */
export interface TerminalCapabilities {isTTY = > Promise<TReturn>
): NonInteractiveFunction<TArgs, TReturn> {
  return async (...args => {
    // Convert args array to object based on function parameters
    const argsObject = { ...defaultValues };
    
    // Merge with environment variables if available
    Object.keys(defaultValues).forEach(key => {
      const envKey = `CLAUDE_FLOW_${key.toUpperCase()}`;
      if (process.env[envKey]) {
        argsObject[key] = process.env[envKey];
      }
    });
    
    return fn(argsObject);
  };
}

/**
 * Prompt user for confirmation in interactive mode, auto-confirm in non-interactive
 */
export async function confirmAction(message = false): Promise<boolean> {
  if (!isInteractive()) {
    console.warn(`${message} (auto-confirming in non-interactive mode: ${defaultValue})`);
    return defaultValue;
  }
  
  // In interactive mode, you would typically use a library like inquirer
  // For now, return default value as this is a utility function
  console.warn(`${message} (defaulting to: ${defaultValue})`);
  return defaultValue;
}
