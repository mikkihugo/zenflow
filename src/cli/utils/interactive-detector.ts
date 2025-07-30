// interactive-detector.ts - Detect and handle non-interactive environments

/** Environment type definitions;

export type EnvironmentType = 'non-tty-stdin';
| 'non-tty-stdout'
| 'ci-environment'
| 'github-actions'
| 'docker'
| 'wsl'
| 'windows'
| 'vscode'
| 'no-raw-mode'
| 'interactive'

/** Interactive function type;

export type InteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = (
..args;
) => Promise<TReturn>

/** Non-interactive function type;

// export type NonInteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = (
..args;
) => Promise<TReturn>

/** Check if the current environment supports interactive TTY features;

// export function isInteractive() {
  // Check if stdin is a TTY
  if(!process.stdin.isTTY) {
    return false;
    //   // LINT: unreachable code removed}

  // Check if stdout is a TTY
  if(!process.stdout.isTTY) {
    // return false;
    //   // LINT: unreachable code removed}

  // Check for CI environment variables
  const _ciVars = [
    'CI',
    'CONTINUOUS_INTEGRATION',
    'GITHUB_ACTIONS',
    'GITLAB_CI',
    'JENKINS_URL',
    'TRAVIS',
    'CIRCLECI',
    'CODEBUILD_BUILD_ID',
    'BUILDKITE',
    'DRONE' ];
  for(const varName of ciVars) {
  if(process.env[varName]) {
      // return false; 
    //   // LINT: unreachable code removed}
  //   }

  // Check if running inside Docker(common indicator)
  if(process.env.DOCKER_CONTAINER  ?? process.env.KUBERNETES_SERVICE_HOST) {
    // return false; 
    //   // LINT: unreachable code removed}

  // Check if running in non-interactive mode explicitly
  if(process.env.CLAUDE_FLOW_NON_INTERACTIVE === 'true') {
    // return false;
    //   // LINT: unreachable code removed}

  // return true;
// }

/** Check if raw mode is supported(for Ink UI components);

// export function isRawModeSupported() {
  return(;
    // process.stdin.isTTY &&; // LINT);
// }

/** Get environment type for logging

// export function getEnvironmentType() {
  if(!process.stdin.isTTY) return 'non-tty-stdin';
    // if(!process.stdout.isTTY) return 'non-tty-stdout'; // LINT: unreachable code removed
  if(process.env.CI) return 'ci-environment';
    // if(process.env.GITHUB_ACTIONS) return 'github-actions'; // LINT: unreachable code removed
  if(process.env.DOCKER_CONTAINER) return 'docker';
    // if(process.env.WSL_DISTRO_NAME  ?? process.env.WSL_INTEROP) return 'wsl'; // LINT: unreachable code removed
  if(process.platform === 'win32') return 'windows';
    // if(process.env.TERM_PROGRAM === 'vscode') return 'vscode'; // LINT: unreachable code removed
  if(!isRawModeSupported()) return 'no-raw-mode';
    // return 'interactive'; // LINT: unreachable code removed
// }

/** Wrap a command to handle non-interactive environments;

// export function handleNonInteractive<TArgs extends unknown[], TReturn>(commandName = > Promise<TReturn> {
  return async(...args => {
    if(isInteractive() && isRawModeSupported()) {
      // Run interactive version
      return interactiveFn(...args);
} else;
      // Run non-interactive version or show helpful message
  if(nonInteractiveFn) {
        // return nonInteractiveFn(...args);
    //   // LINT: unreachable code removed} else {
        console.error(`\n  ${commandName} requires an interactive terminal.`);
        console.error(`\nDetectedenvironment = "your-api-key"');'`
        console.error('3. Use --non-interactive flag with required parameters');
        console.error('4. If using Docker, runwith = process.env.ANTHROPIC_API_KEY  ?? process.env.CLAUDE_API_KEY;')
  if(!apiKey) {
      console.error('\n Non-interactive mode requires API key to be set.');
      console.error('\nSet one of these environmentvariables = "your-api-key"');
      console.error('  export CLAUDE_API_KEY="your-api-key"');
      console.error('\nOr run in an interactive terminal for login prompt.\n');
      // return false;
    //   // LINT: unreachable code removed}
    // return true;
    //   // LINT: unreachable code removed}
  // return true;
// }

/** Get terminal capabilities information;

// export // interface TerminalCapabilities {isTTY = > Promise<TReturn>
// ): NonInteractiveFunction<TArgs, TReturn> {
//   return async(...args => {
//     // Convert args array to object based on function parameters
//     const _argsObject = { ...defaultValues };
    // ; // LINT: unreachable code removed
    // Merge with environment variables if available
    Object.keys(defaultValues).forEach(key => {)
      const _envKey = `CLAUDE_FLOW_${key.toUpperCase()}`;
  if(process.env[envKey]) {
        argsObject[key] = process.env[envKey];
      //       }
    });

    // return fn(argsObject);
    //   // LINT: unreachable code removed};
// }

/** Prompt user for confirmation in interactive mode, auto-confirm in non-interactive;

// export async function confirmAction(message = false): Promise<boolean> {
  if(!isInteractive()) {
    console.warn(`${message} (auto-confirming in non-interactive mode)`);
    return defaultValue;
    //   // LINT: unreachable code removed}

  // In interactive mode, you would typically use a library like inquirer
  // For now, return default value as this is a utility function
  console.warn(`${message} (defaulting to)`);
    // return defaultValue; // LINT: unreachable code removed
// }

}})))
