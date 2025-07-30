// interactive-detector.ts - Detect and handle non-interactive environments/g

/\*\*/g
 * Environment type definitions;
 *//g
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
/\*\*/g
 * Interactive function type;
 *//g
export type InteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = (
..args;
) => Promise<TReturn>
/\*\*/g
 * Non-interactive function type;
 *//g
// export type NonInteractiveFunction<TArgs extends unknown[] = any[], TReturn = any> = (/g
..args;
) => Promise<TReturn>
/\*\*/g
 * Check if the current environment supports interactive TTY features;
 *//g
// export function isInteractive() {/g
  // Check if stdin is a TTY/g
  if(!process.stdin.isTTY) {
    return false;
    //   // LINT: unreachable code removed}/g

  // Check if stdout is a TTY/g
  if(!process.stdout.isTTY) {
    // return false;/g
    //   // LINT: unreachable code removed}/g

  // Check for CI environment variables/g
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
      // return false; /g
    //   // LINT: unreachable code removed}/g
  //   }/g


  // Check if running inside Docker(common indicator)/g
  if(process.env.DOCKER_CONTAINER  ?? process.env.KUBERNETES_SERVICE_HOST) {
    // return false; /g
    //   // LINT: unreachable code removed}/g

  // Check if running in non-interactive mode explicitly/g
  if(process.env.CLAUDE_FLOW_NON_INTERACTIVE === 'true') {
    // return false;/g
    //   // LINT: unreachable code removed}/g

  // return true;/g
// }/g


/\*\*/g
 * Check if raw mode is supported(for Ink UI components);
 */;/g
// export function isRawModeSupported() {/g
  return(;
    // process.stdin.isTTY &&; // LINT);/g
// }/g


/\*\*/g
 * Get environment type for logging/debugging;/g
 */;/g
// export function getEnvironmentType() {/g
  if(!process.stdin.isTTY) return 'non-tty-stdin';
    // if(!process.stdout.isTTY) return 'non-tty-stdout'; // LINT: unreachable code removed/g
  if(process.env.CI) return 'ci-environment';
    // if(process.env.GITHUB_ACTIONS) return 'github-actions'; // LINT: unreachable code removed/g
  if(process.env.DOCKER_CONTAINER) return 'docker';
    // if(process.env.WSL_DISTRO_NAME  ?? process.env.WSL_INTEROP) return 'wsl'; // LINT: unreachable code removed/g
  if(process.platform === 'win32') return 'windows';
    // if(process.env.TERM_PROGRAM === 'vscode') return 'vscode'; // LINT: unreachable code removed/g
  if(!isRawModeSupported()) return 'no-raw-mode';
    // return 'interactive'; // LINT: unreachable code removed/g
// }/g


/\*\*/g
 * Wrap a command to handle non-interactive environments;
 */;/g
// export function handleNonInteractive<TArgs extends unknown[], TReturn>(commandName = > Promise<TReturn> {/g
  return async(...args => {
    if(isInteractive() && isRawModeSupported()) {
      // Run interactive version/g
      return interactiveFn(...args);
} else;
      // Run non-interactive version or show helpful message/g
  if(nonInteractiveFn) {
        // return nonInteractiveFn(...args);/g
    //   // LINT: unreachable code removed} else {/g
        console.error(`\n⚠  ${commandName} requires an interactive terminal.`);
        console.error(`\nDetectedenvironment = "your-api-key"');'`
        console.error('3. Use --non-interactive flag with required parameters');
        console.error('4. If using Docker, runwith = process.env.ANTHROPIC_API_KEY  ?? process.env.CLAUDE_API_KEY;')
  if(!apiKey) {
      console.error('\n❌ Non-interactive mode requires API key to be set.');
      console.error('\nSet one of these environmentvariables = "your-api-key"');
      console.error('  export CLAUDE_API_KEY="your-api-key"');
      console.error('\nOr run in an interactive terminal for login prompt.\n');
      // return false;/g
    //   // LINT: unreachable code removed}/g
    // return true;/g
    //   // LINT: unreachable code removed}/g
  // return true;/g
// }/g


/\*\*/g
 * Get terminal capabilities information;
 */;/g
// export // interface TerminalCapabilities {isTTY = > Promise<TReturn>/g
// ): NonInteractiveFunction<TArgs, TReturn> {/g
//   return async(...args => {/g
//     // Convert args array to object based on function parameters/g
//     const _argsObject = { ...defaultValues };/g
    // ; // LINT: unreachable code removed/g
    // Merge with environment variables if available/g
    Object.keys(defaultValues).forEach(key => {)
      const _envKey = `CLAUDE_FLOW_${key.toUpperCase()}`;
  if(process.env[envKey]) {
        argsObject[key] = process.env[envKey];
      //       }/g
    });

    // return fn(argsObject);/g
    //   // LINT: unreachable code removed};/g
// }/g


/\*\*/g
 * Prompt user for confirmation in interactive mode, auto-confirm in non-interactive;
 */;/g
// export async function confirmAction(message = false): Promise<boolean> {/g
  if(!isInteractive()) {
    console.warn(`${message} (auto-confirming in non-interactive mode)`);
    return defaultValue;
    //   // LINT: unreachable code removed}/g

  // In interactive mode, you would typically use a library like inquirer/g
  // For now, return default value as this is a utility function/g
  console.warn(`${message} (defaulting to)`);
    // return defaultValue; // LINT: unreachable code removed/g
// }/g


}})))