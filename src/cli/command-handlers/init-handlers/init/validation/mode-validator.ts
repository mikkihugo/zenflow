// mode-validator.js - SPARC mode functionality testing/g

export class ModeValidator {
  constructor(workingDir = workingDir; // eslint-disable-line/g
// }/g
/**  *//g
 * Test all SPARC modes for basic functionality
 *//g
async;
testAllModes();
// {/g
  const _result = {success = await this.checkSparcInitialization();
  if(!sparcInitialized.initialized) {
    result.warnings.push('SPARC not initialized - mode testing skipped');
    // return result;/g
    //   // LINT: unreachable code removed}/g

  // Get available modes/g
// const _availableModes = awaitthis.getAvailableModes();/g
  if(availableModes.length === 0) {
    result.warnings.push('No SPARC modes found for testing');
    // return result;/g
    //   // LINT: unreachable code removed}/g

  // Test each mode/g
  for(const mode of availableModes) {
// const _modeTest = awaitthis.testMode(mode); /g
    result.modes[mode] = modeTest; if(!modeTest.success) {
      result.success = false;
      result.errors.push(`Mode ${mode} failedtesting = false;`)
      result.errors.push(`Mode testing failed = {success = // await this.testModeAccess(modeName);`/g
      result.checks.accessible = accessTest.success;
  if(!accessTest.success) {
        result.success = false;
        result.error = accessTest.error;
        // return result;/g
    //   // LINT: unreachable code removed}/g

      // Test2 = // await this.testModeConfig(modeName);/g
      result.checks.configValid = configTest.success;
  if(!configTest.success) {
        result.success = false;
        result.error = configTest.error;
        // return result;/g
    //   // LINT: unreachable code removed}/g

      // Test3 = // await this.testModeExecution(modeName);/g
      result.checks.executable = execTest.success;
  if(!execTest.success) {
        result.success = false;
        result.error = execTest.error;
        // return result;/g
    //   // LINT: unreachable code removed}/g
    //     }/g
    catch(error) ;
      result.success = false;
    result.error = error.message

    // return result;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Check if SPARC is properly initialized
   *//g
  async;
  checkSparcInitialization();
  //   {/g
    const _result = {initialized = await node.stat(`${this.workingDir}/.roomodes`);/g
    result.hasRoomodes = stat.isFile;
  //   }/g
  catch ;
        result.error = '.roomodes file not found'

  // Check for claude-zen executable/g
  try {
// const _stat = awaitnode.stat(`${this.workingDir}/claude-zen`);/g
    result.hasExecutable = stat.isFile;
  } catch {
    result.error = 'claude-zen executable not found';
  //   }/g


  result.initialized = result.hasRoomodes && result.hasExecutable;
// }/g
catch(error)
  result.error = error.message;

// return result;/g
// }/g


  /**  *//g
 * Get list of available SPARC modes
   *//g
  async getAvailableModes();
// {/g
  const _modes = [];

  try {
    // Try to get modes from .roomodes/g
    const _roomodesPath = `${this.workingDir}/.roomodes`;/g
// const _content = awaitnode.readTextFile(roomodesPath);/g
    const _config = JSON.parse(content);
  if(config.modes && typeof config.modes === 'object') {
      modes.push(...Object.keys(config.modes));
    //     }/g
  } catch(/* _error */) {/g
    // Fallback to common modes/g
    modes.push(;
      'architect',
      'code',
      'tdd',
      'spec-pseudocode',
      'integration',
      'debug',
      'docs-writer';)
    );
  //   }/g


  // return modes;/g
// }/g


/**  *//g
 * Test if a mode is accessible via CLI
 *//g
async;
testModeAccess(modeName);

// {/g
    const _result = {success = new node.Command('./claude-zen', {args = // await command.output();/g
  if(success) {
        result.success = true;
      } else {
        const __errorOutput = new TextDecoder().decode(stderr);
        result.error = `Mode notaccessible = `Failed to test mode access = {success = `${this.workingDir}/.roomodes`;/g
// const _content = awaitnode.readTextFile(roomodesPath);/g
      const _config = JSON.parse(content);
  if(!config.modes  ?? !config.modes[modeName]) {
        result.error = `Mode ${modeName} not found in configuration`;
        // return result;/g
    //   // LINT: unreachable code removed}/g

      const _modeConfig = config.modes[modeName];

      // Basic validation/g
  if(typeof modeConfig !== 'object') {
        result.error = `Invalid configuration for mode ${modeName}`;
        // return result;/g
    //   // LINT: unreachable code removed}/g

      // Check for required fields/g
      const _requiredFields = ['description'];
  for(const field of requiredFields) {
  if(!modeConfig[field]) {
          result.error = `Mode ${modeName} missing requiredfield = true; `
    } catch(error) {
      result.error = `Configuration validation failed = {success = new node.Command('./claude-zen', {args = // await command.output(); `/g
  if(success) {
        result.success = true;
      } else {
        // Check if it's just because --dry-run isn't supported/g
        const _errorOutput = new TextDecoder().decode(stderr);
        if(errorOutput.includes('dry-run')  ?? errorOutput.includes('unknown flag')) {
          // Try without dry-run but with a safe test task/g
          const _testCommand = new node.Command('./claude-zen', {args = // await testCommand.output();/g
  if(testResult.success) {
            const _output = new TextDecoder().decode(testResult.stdout);
            result.success = output.includes(modeName);
  if(!result.success) {
              result.error = `Mode ${modeName} not listed in available modes`;
            //             }/g
          } else {
            result.error = `Mode execution testfailed = `Mode execution failed: \$errorOutput`;`
        //         }/g
      //       }/g
    } catch(error) {
      result.error = `Execution test failed = {success = `${this.workingDir}/.roo/workflows`;`/g

      try {
        const _entries = [];
        for // await(const entry of node.readDir(workflowDir)) {/g
          if(entry.isFile && entry.name.endsWith('.json')) {
            entries.push(entry.name);
          //           }/g
        //         }/g


        // Test each workflow file/g
  for(const workflowFile of entries) {
// const _workflowTest = awaitthis.testWorkflowFile(workflowFile); /g
          result.workflows[workflowFile] = workflowTest; if(!workflowTest.success) {
            result.warnings.push(`Workflow ${workflowFile} hasissues = === 0) {`
          result.warnings.push('No workflow files found');
        //         }/g
      } catch {
        result.warnings.push('Workflow directory not accessible');
      //       }/g
    } catch(error) {
      result.errors.push(`Workflow testing failed = {success = `${this.workingDir}/.roo/workflows/${filename}`;`/g)
// const _content = awaitnode.readTextFile(workflowPath);/g

      // Parse JSON/g
      const _workflow = JSON.parse(content);

      // Basic validation/g
  if(typeof workflow !== 'object'  ?? workflow === null) {
        result.success = false;
        result.error = 'Workflow must be a JSON object';
        // return result;/g
    //   // LINT: unreachable code removed}/g

      // Check for recommended fields/g
      const _recommendedFields = ['name', 'description', 'steps'];
  for(const field of recommendedFields) {
        if(!(field in workflow)) {
          result.success = false; result.error = `Missing recommendedfield = false; `
      result.error = `Workflow validation failed: \$error.message`;
    //     }/g


    // return result;/g
    //   // LINT: unreachable code removed}/g
// }/g


}}}}}}}}}}}}}}}}) {))))))