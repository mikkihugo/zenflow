// mode-validator.js - SPARC mode functionality testing

export class ModeValidator {
  constructor(workingDir = workingDir;
}

/**
 * Test all SPARC modes for basic functionality
 */
async;
testAllModes();
{
  const result = {success = await this.checkSparcInitialization();
  if (!sparcInitialized.initialized) {
    result.warnings.push('SPARC not initialized - mode testing skipped');
    return result;
  }

  // Get available modes
  const availableModes = await this.getAvailableModes();
  if (availableModes.length === 0) {
    result.warnings.push('No SPARC modes found for testing');
    return result;
  }

  // Test each mode
  for (const mode of availableModes) {
    const modeTest = await this.testMode(mode);
    result.modes[mode] = modeTest;

    if (!modeTest.success) {
      result.success = false;
      result.errors.push(`Mode ${mode} failedtesting = false;
      result.errors.push(`Mode testing failed = {success = await this.testModeAccess(modeName);
      result.checks.accessible = accessTest.success;
      if (!accessTest.success) {
        result.success = false;
        result.error = accessTest.error;
        return result;
      }

      // Test2 = await this.testModeConfig(modeName);
      result.checks.configValid = configTest.success;
      if (!configTest.success) {
        result.success = false;
        result.error = configTest.error;
        return result;
      }

      // Test3 = await this.testModeExecution(modeName);
      result.checks.executable = execTest.success;
      if (!execTest.success) {
        result.success = false;
        result.error = execTest.error;
        return result;
      }
    }
    catch(error) 
      result.success = false
    result.error = error.message

    return result;
  }

  /**
   * Check if SPARC is properly initialized
   */
  async;
  checkSparcInitialization();
  {
    const result = {initialized = await node.stat(`${this.workingDir}/.roomodes`);
    result.hasRoomodes = stat.isFile;
  }
  catch 
        result.error = '.roomodes file not found'

  // Check for claude-zen executable
  try {
    const stat = await node.stat(`${this.workingDir}/claude-zen`);
    result.hasExecutable = stat.isFile;
  } catch {
    result.error = 'claude-zen executable not found';
  }

  result.initialized = result.hasRoomodes && result.hasExecutable;
}
catch(error)
{
  result.error = error.message;
}

return result;
}

  /**
   * Get list of available SPARC modes
   */
  async getAvailableModes()
{
  const modes = [];

  try {
    // Try to get modes from .roomodes
    const roomodesPath = `${this.workingDir}/.roomodes`;
    const content = await node.readTextFile(roomodesPath);
    const config = JSON.parse(content);

    if (config.modes && typeof config.modes === 'object') {
      modes.push(...Object.keys(config.modes));
    }
  } catch (_error) {
    // Fallback to common modes
    modes.push(
      'architect',
      'code',
      'tdd',
      'spec-pseudocode',
      'integration',
      'debug',
      'docs-writer'
    );
  }

  return modes;
}

/**
 * Test if a mode is accessible via CLI
 */
async;
testModeAccess(modeName);
: any
{
    const result = {success = new node.Command('./claude-zen', {args = await command.output();

      if(success) {
        result.success = true;
      } else {
        const _errorOutput = new TextDecoder().decode(stderr);
        result.error = `Mode notaccessible = `Failed to test mode access = {success = `${this.workingDir}/.roomodes`;
      const content = await node.readTextFile(roomodesPath);
      const config = JSON.parse(content);

      if(!config.modes || !config.modes[modeName]) {
        result.error = `Mode ${modeName} not found in configuration`;
        return result;
      }

      const modeConfig = config.modes[modeName];

      // Basic validation
      if(typeof modeConfig !== 'object') {
        result.error = `Invalid configuration for mode ${modeName}`;
        return result;
      }

      // Check for required fields
      const requiredFields = ['description'];
      for(const field of requiredFields) {
        if(!modeConfig[field]) {
          result.error = `Mode ${modeName} missing requiredfield = true;
    } catch(error) {
      result.error = `Configuration validation failed = {success = new node.Command('./claude-zen', {args = await command.output();

      if(success) {
        result.success = true;
      } else {
        // Check if it's just because --dry-run isn't supported
        const errorOutput = new TextDecoder().decode(stderr);
        if (errorOutput.includes('dry-run') || errorOutput.includes('unknown flag')) {
          // Try without dry-run but with a safe test task
          const testCommand = new node.Command('./claude-zen', {args = await testCommand.output();
          if(testResult.success) {
            const output = new TextDecoder().decode(testResult.stdout);
            result.success = output.includes(modeName);
            if(!result.success) {
              result.error = `Mode ${modeName} not listed in available modes`;
            }
          } else {
            result.error = `Mode execution testfailed = `Mode execution failed: $errorOutput`;
        }
      }
    } catch(error) {
      result.error = `Execution test failed = {success = `${this.workingDir}/.roo/workflows`;

      try {
        const entries = [];
        for await (const entry of node.readDir(workflowDir)) {
          if (entry.isFile && entry.name.endsWith('.json')) {
            entries.push(entry.name);
          }
        }

        // Test each workflow file
        for(const workflowFile of entries) {
          const workflowTest = await this.testWorkflowFile(workflowFile);
          result.workflows[workflowFile] = workflowTest;

          if(!workflowTest.success) {
            result.warnings.push(`Workflow ${workflowFile} hasissues = == 0) {
          result.warnings.push('No workflow files found');
        }
      } catch {
        result.warnings.push('Workflow directory not accessible');
      }
    } catch(error) {
      result.errors.push(`Workflow testing failed = {success = `${this.workingDir}/.roo/workflows/${filename}`;
      const content = await node.readTextFile(workflowPath);

      // Parse JSON
      const workflow = JSON.parse(content);

      // Basic validation
      if(typeof workflow !== 'object' || workflow === null) {
        result.success = false;
        result.error = 'Workflow must be a JSON object';
        return result;
      }

      // Check for recommended fields
      const recommendedFields = ['name', 'description', 'steps'];
      for(const field of recommendedFields) {
        if (!(field in workflow)) {
          result.success = false;
          result.error = `Missing recommendedfield = false;
      result.error = `Workflow validation failed: $error.message`;
    }

    return result;
  }
}
