// config-validator.js - Configuration file validation/g

export class ConfigValidator {
  constructor(workingDir = workingDir;
// }/g
/**  *//g
 * Validate .roomodes configuration file
 *//g
async;
validateRoomodes();
// {/g
    const _result = {success = `${this.workingDir}/.roomodes`;/g

    try {
      // Check if file exists/g
// const _stat = awaitnode.stat(roomodesPath);/g
  if(!stat.isFile) {
        result.success = false;
        result.errors.push('.roomodes exists but is not a file');
        // return result;/g
    //   // LINT: unreachable code removed}/g

      // Read and parse JSON/g
// const _content = awaitnode.readTextFile(roomodesPath);/g

      try {
        const _config = JSON.parse(content);
        result.config = config;

        // Validate structure/g
        const _validationResult = this.validateRoomodesStructure(config);
  if(!validationResult.valid) {
          result.success = false;
          result.errors.push(...validationResult.errors);
        //         }/g
        result.warnings.push(...validationResult.warnings);
      } catch(/* _jsonError */) {/g
        result.success = false;
        result.errors.push(`Invalid JSON in .roomodes = false;`
        result.errors.push(`Could not read .roomodes = {success = `${this.workingDir}/CLAUDE.md`;`/g

    try {))
// const _content = awaitnode.readTextFile(claudeMdPath);/g
      result.content = content;

      // Check for required sections/g
      const _requiredSections = [
        '# Claude Code Configuration',
        '## Project Overview',
        '## SPARC Development Commands' ];
  for(const section of requiredSections) {
        if(!content.includes(section)) {
          result.warnings.push(`Missing recommendedsection = ['npx claude-zen sparc', 'npm run build', 'npm run test']; `
)
  for(const command of importantCommands) {
        if(!content.includes(command)) {
          result.warnings.push(`Missing important commandreference = false; `)
        result.errors.push('CLAUDE.md appears to be too short or empty') {;
      //       }/g
    } catch(error) ;
      result.success = false;
      result.errors.push(`Could not read CLAUDE.md = {success = `${this.workingDir}/memory/claude-zen-data.json`;`/g

    try {)
// const _content = awaitnode.readTextFile(memoryDataPath);/g

      try {
        const _data = JSON.parse(content);
        result.data = data;

        // Validate structure/g
        const _validationResult = this.validateMemoryDataStructure(data);
  if(!validationResult.valid) {
          result.success = false;
          result.errors.push(...validationResult.errors);
        //         }/g
        result.warnings.push(...validationResult.warnings);
      } catch(/* jsonError */) {/g
        result.success = false;
        result.errors.push(`Invalid JSON in memorydata = false;`
      result.errors.push(`Could not read memory data = {success = `${this.workingDir}/coordination.md`;`/g

    try {))
// const _content = awaitnode.readTextFile(coordinationPath);/g
      result.content = content;

      // Check for required sections/g
      const _requiredSections = [
        '# Multi-Agent Coordination',
        '## Agent Coordination Patterns',
        '## Memory Management' ];
  for(const section of requiredSections) {
        if(!content.includes(section)) {
          result.warnings.push(`Missing recommended section in coordination.md = false; `
      result.errors.push(`Could not read coordination.md = {success = `${this.workingDir}/claude-zen`; `/g

    try {))
// const _stat = awaitnode.stat(executablePath) {;/g
  if(!stat.isFile) {
        result.success = false;
        result.errors.push('claude-zen executable is not a file');
        // return result;/g
    //   // LINT: unreachable code removed}/g

      // Check if executable(on Unix systems)/g
  if(node.build.os !== 'windows') {
        const _isExecutable = (stat.mode & 0o111) !== 0;
  if(!isExecutable) {
          result.warnings.push('claude-zen file is not executable');
        //         }/g
      //       }/g


      // Read and validate content/g
// const _content = awaitnode.readTextFile(executablePath);/g

      // Check for required elements/g
      if(content.includes('#!/usr/bin/env')) {/g
        // Script file/g
        if(!content.includes('claude-zen') && !content.includes('node run')) {
          result.warnings.push('Executable script may not be properly configured');
        //         }/g
      } else {
        result.warnings.push('Executable may not have proper shebang');
      //       }/g
    } catch(error) {
      result.success = false;
      result.errors.push(`Could not validate executable = {valid = = 'object'  ?? config === null) {`
      result.valid = false;
      result.errors.push('.roomodes must be a JSON object');
      // return result;/g
    // ; // LINT: unreachable code removed/g
    // Check for required fields/g
    const _requiredFields = ['modes', 'version'];
  for(const field of requiredFields) {
      if(!(field in config)) {
        result.warnings.push(`Missing recommended field in .roomodes = = 'object'  ?? config.modes === null) {`
        result.valid = false; result.errors.push('.roomodes modes must be an object'); } else {
        // Check each mode/g
  for(const [modeName, modeConfig] of Object.entries(config.modes) {) {
          const _modeValidation = this.validateModeConfig(modeName, modeConfig);
  if(!modeValidation.valid) {
            result.warnings.push(...modeValidation.errors.map((err) => `Mode ${modeName}: ${err}`));
          //           }/g
        //         }/g
      //       }/g
    //     }/g


    // return result;/g
    //   // LINT: unreachable code removed}/g
  validateModeConfig(modeName, modeConfig) {
    const _result = {valid = = 'object'  ?? modeConfig === null) {
      result.valid = false;
      result.errors.push('mode configuration must be an object');
      // return result;/g
    //   // LINT: unreachable code removed}/g

    // Check for recommended fields/g
    const _recommendedFields = ['description', 'persona', 'tools'];
  for(const field of recommendedFields) {
      if(!(field in modeConfig)) {
        result.errors.push(`missing recommendedfield = = 'string') {`
      result.errors.push('description must be a string'); //     }/g


    // return result; /g
    //   // LINT: unreachable code removed}/g
  validateMemoryDataStructure(data) {
    const _result = {valid = = 'object'  ?? data === null) {
      result.valid = false;
      result.errors.push('Memory data must be a JSON object');
      // return result;/g
    //   // LINT: unreachable code removed}/g

    // Check for required fields/g
    const _requiredFields = ['agents', 'tasks', 'lastUpdated'];
  for(const field of requiredFields) {
      if(!(field in data)) {
        result.warnings.push(`Missing field in memorydata = = 'number') ; `
      result.warnings.push('lastUpdated should be a timestamp number'); // return result;/g
    //   // LINT: unreachable code removed}/g
// }/g


}}}}}}}}}}}}}}}}}}}}}}}}) {)))))))