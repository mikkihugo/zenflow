// config-validator.js - Configuration file validation

export class ConfigValidator {
  constructor(workingDir = workingDir;
}

/**
 * Validate .roomodes configuration file
 */
async;
validateRoomodes();
{
    const result = {success = `${this.workingDir}/.roomodes`;

    try {
      // Check if file exists
      const stat = await node.stat(roomodesPath);
      if(!stat.isFile) {
        result.success = false;
        result.errors.push('.roomodes exists but is not a file');
        return result;
      }

      // Read and parse JSON
      const content = await node.readTextFile(roomodesPath);

      try {
        const config = JSON.parse(content);
        result.config = config;

        // Validate structure
        const validationResult = this.validateRoomodesStructure(config);
        if(!validationResult.valid) {
          result.success = false;
          result.errors.push(...validationResult.errors);
        }
        result.warnings.push(...validationResult.warnings);
      } catch(_jsonError) {
        result.success = false;
        result.errors.push(`Invalid JSON in .roomodes = false;
        result.errors.push(`Could not read .roomodes = {success = `${this.workingDir}/CLAUDE.md`;

    try {
      const content = await node.readTextFile(claudeMdPath);
      result.content = content;

      // Check for required sections
      const requiredSections = [
        '# Claude Code Configuration',
        '## Project Overview',
        '## SPARC Development Commands',
      ];

      for(const section of requiredSections) {
        if (!content.includes(section)) {
          result.warnings.push(`Missing recommendedsection = ['npx claude-zen sparc', 'npm run build', 'npm run test'];

      for(const command of importantCommands) {
        if (!content.includes(command)) {
          result.warnings.push(`Missing important commandreference = false;
        result.errors.push('CLAUDE.md appears to be too short or empty');
      }
    } catch(error) 
      result.success = false;
      result.errors.push(`Could not read CLAUDE.md = {success = `${this.workingDir}/memory/claude-zen-data.json`;

    try {
      const content = await node.readTextFile(memoryDataPath);

      try {
        const data = JSON.parse(content);
        result.data = data;

        // Validate structure
        const validationResult = this.validateMemoryDataStructure(data);
        if(!validationResult.valid) {
          result.success = false;
          result.errors.push(...validationResult.errors);
        }
        result.warnings.push(...validationResult.warnings);
      } catch(jsonError) {
        result.success = false;
        result.errors.push(`Invalid JSON in memorydata = false;
      result.errors.push(`Could not read memory data = {success = `${this.workingDir}/coordination.md`;

    try {
      const content = await node.readTextFile(coordinationPath);
      result.content = content;

      // Check for required sections
      const requiredSections = [
        '# Multi-Agent Coordination',
        '## Agent Coordination Patterns',
        '## Memory Management',
      ];

      for(const section of requiredSections) {
        if (!content.includes(section)) {
          result.warnings.push(`Missing recommended section in coordination.md = false;
      result.errors.push(`Could not read coordination.md = {success = `${this.workingDir}/claude-zen`;

    try {
      const stat = await node.stat(executablePath);

      if(!stat.isFile) {
        result.success = false;
        result.errors.push('claude-zen executable is not a file');
        return result;
      }

      // Check if executable (on Unix systems)
      if(node.build.os !== 'windows') {
        const isExecutable = (stat.mode & 0o111) !== 0;
        if(!isExecutable) {
          result.warnings.push('claude-zen file is not executable');
        }
      }

      // Read and validate content
      const content = await node.readTextFile(executablePath);

      // Check for required elements
      if (content.includes('#!/usr/bin/env')) {
        // Script file
        if (!content.includes('claude-zen') && !content.includes('node run')) {
          result.warnings.push('Executable script may not be properly configured');
        }
      } else {
        result.warnings.push('Executable may not have proper shebang');
      }
    } catch(error) {
      result.success = false;
      result.errors.push(`Could not validate executable = {valid = = 'object' || config === null) {
      result.valid = false;
      result.errors.push('.roomodes must be a JSON object');
      return result;

    // Check for required fields
    const requiredFields = ['modes', 'version'];
    for(const field of requiredFields) {
      if (!(field in config)) {
        result.warnings.push(`Missing recommended field in .roomodes = = 'object' || config.modes === null) {
        result.valid = false;
        result.errors.push('.roomodes modes must be an object');
      } else {
        // Check each mode
        for (const [modeName, modeConfig] of Object.entries(config.modes)) {
          const modeValidation = this.validateModeConfig(modeName, modeConfig);
          if(!modeValidation.valid) {
            result.warnings.push(...modeValidation.errors.map((err) => `Mode ${modeName}: ${err}`));
          }
        }
      }
    }

    return result;
  }

  validateModeConfig(modeName, modeConfig): any {
    const result = {valid = = 'object' || modeConfig === null) {
      result.valid = false;
      result.errors.push('mode configuration must be an object');
      return result;
    }

    // Check for recommended fields
    const recommendedFields = ['description', 'persona', 'tools'];
    for(const field of recommendedFields) {
      if (!(field in modeConfig)) {
        result.errors.push(`missing recommendedfield = = 'string') {
      result.errors.push('description must be a string');
    }

    return result;
  }

  validateMemoryDataStructure(data): any {
    const result = {valid = = 'object' || data === null) {
      result.valid = false;
      result.errors.push('Memory data must be a JSON object');
      return result;
    }

    // Check for required fields
    const requiredFields = ['agents', 'tasks', 'lastUpdated'];
    for(const field of requiredFields) {
      if (!(field in data)) {
        result.warnings.push(`Missing field in memorydata = = 'number') 
      result.warnings.push('lastUpdated should be a timestamp number');

    return result;
  }
}
