// config-validator.js - Configuration file validation

export class ConfigValidator {
  constructor(workingDir = workingDir;
// }

/** Validate .roomodes configuration file

async;
validateRoomodes();
// {
    const _result = {success = `${this.workingDir}

    try {
      // Check if file exists
// const _stat = awaitnode.stat(roomodesPath);
  if(!stat.isFile) {
        result.success = false;
        result.errors.push('.roomodes exists but is not a file');
        // return result;
    //   // LINT: unreachable code removed}

      // Read and parse JSON
// const _content = awaitnode.readTextFile(roomodesPath);

      try {
        const _config = JSON.parse(content);
        result.config = config;

        // Validate structure
        const _validationResult = this.validateRoomodesStructure(config);
  if(!validationResult.valid) {
          result.success = false;
          result.errors.push(...validationResult.errors);
        //         }
        result.warnings.push(...validationResult.warnings);
      } catch(/* _jsonError */) {
        result.success = false;
        result.errors.push(`Invalid JSON in .roomodes = false;`
        result.errors.push(`Could not read .roomodes = {success = `${this.workingDir}

    try {))
// const _content = awaitnode.readTextFile(claudeMdPath);
      result.content = content;

      // Check for required sections
      const _requiredSections = [
        '# Claude Code Configuration',
        '## Project Overview',
        '## SPARC Development Commands' ];
  for(const section of requiredSections) {
        if(!content.includes(section)) {
          result.warnings.push(`Missing recommendedsection = ['npx claude-zen sparc', 'npm run build', 'npm run test']; `

  for(const command of importantCommands) {
        if(!content.includes(command)) {
          result.warnings.push(`Missing important commandreference = false; `)
        result.errors.push('CLAUDE.md appears to be too short or empty') {;
      //       }
    } catch(error) ;
      result.success = false;
      result.errors.push(`Could not read CLAUDE.md = {success = `${this.workingDir}/memory/claude-zen-data.json`;`

    try {)
// const _content = awaitnode.readTextFile(memoryDataPath);

      try {
        const _data = JSON.parse(content);
        result.data = data;

        // Validate structure
        const _validationResult = this.validateMemoryDataStructure(data);
  if(!validationResult.valid) {
          result.success = false;
          result.errors.push(...validationResult.errors);
        //         }
        result.warnings.push(...validationResult.warnings);
      } catch(/* jsonError */) {
        result.success = false;
        result.errors.push(`Invalid JSON in memorydata = false;`
      result.errors.push(`Could not read memory data = {success = `${this.workingDir}

    try {))
// const _content = awaitnode.readTextFile(coordinationPath);
      result.content = content;

      // Check for required sections
      const _requiredSections = [
        '# Multi-Agent Coordination',
        '## Agent Coordination Patterns',
        '## Memory Management' ];
  for(const section of requiredSections) {
        if(!content.includes(section)) {
          result.warnings.push(`Missing recommended section in coordination.md = false; `
      result.errors.push(`Could not read coordination.md = {success = `${this.workingDir}/claude-zen`; `

    try {))
// const _stat = awaitnode.stat(executablePath) {;
  if(!stat.isFile) {
        result.success = false;
        result.errors.push('claude-zen executable is not a file');
        // return result;
    //   // LINT: unreachable code removed}

      // Check if executable(on Unix systems)
  if(node.build.os !== 'windows') {
        const _isExecutable = (stat.mode & 0o111) !== 0;
  if(!isExecutable) {
          result.warnings.push('claude-zen file is not executable');
        //         }
      //       }

      // Read and validate content
// const _content = awaitnode.readTextFile(executablePath);

      // Check for required elements
      if(content.includes('#!/usr/bin/env')) {
        // Script file
        if(!content.includes('claude-zen') && !content.includes('node run')) {
          result.warnings.push('Executable script may not be properly configured');
        //         }
      } else {
        result.warnings.push('Executable may not have proper shebang');
      //       }
    } catch(error) {
      result.success = false;
      result.errors.push(`Could not validate executable = {valid = = 'object'  ?? config === null) {`
      result.valid = false;
      result.errors.push('.roomodes must be a JSON object');
      // return result;
    // ; // LINT: unreachable code removed
    // Check for required fields
    const _requiredFields = ['modes', 'version'];
  for(const field of requiredFields) {
      if(!(field in config)) {
        result.warnings.push(`Missing recommended field in .roomodes = = 'object'  ?? config.modes === null) {`
        result.valid = false; result.errors.push('.roomodes modes must be an object'); } else {
        // Check each mode
  for(const [modeName, modeConfig] of Object.entries(config.modes) {) {
          const _modeValidation = this.validateModeConfig(modeName, modeConfig);
  if(!modeValidation.valid) {
            result.warnings.push(...modeValidation.errors.map((err) => `Mode ${modeName}: ${err}`));
          //           }
        //         }
      //       }
    //     }

    // return result;
    //   // LINT: unreachable code removed}
  validateModeConfig(modeName, modeConfig) {
    const _result = {valid = = 'object'  ?? modeConfig === null) {
      result.valid = false;
      result.errors.push('mode configuration must be an object');
      // return result;
    //   // LINT: unreachable code removed}

    // Check for recommended fields
    const _recommendedFields = ['description', 'persona', 'tools'];
  for(const field of recommendedFields) {
      if(!(field in modeConfig)) {
        result.errors.push(`missing recommendedfield = = 'string') {`
      result.errors.push('description must be a string'); //     }

    // return result; 
    //   // LINT: unreachable code removed}
  validateMemoryDataStructure(data) {
    const _result = {valid = = 'object'  ?? data === null) {
      result.valid = false;
      result.errors.push('Memory data must be a JSON object');
      // return result;
    //   // LINT: unreachable code removed}

    // Check for required fields
    const _requiredFields = ['agents', 'tasks', 'lastUpdated'];
  for(const field of requiredFields) {
      if(!(field in data)) {
        result.warnings.push(`Missing field in memorydata = = 'number') ; `
      result.warnings.push('lastUpdated should be a timestamp number'); // return result;
    //   // LINT: unreachable code removed}
// }

}}}}}}}}}}}}}}}}}}}}}}}}) {)))))))
