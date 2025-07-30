// post-init-validator.js - Post-initialization verification checks

export class PostInitValidator {
  constructor(workingDir = workingDir;
}

/**
 * Check file integrity (existence, size, readability)
 */
async;
checkFileIntegrity();
{
  const result = {success = [
      {path = `${this.workingDir}/${file.path}`;

      try {
        const stat = await node.stat(filePath);

        // Check if it exists and is a file
        if(!stat.isFile) {
          result.success = false;
          result.errors.push(`Expected file but found directory = {status = false;
          result.errors.push(
            `File toosmall = ${file.minSize})`,
  )
  result.files[file.path] = status = = 'windows') {
          const isExecutable = (stat.mode & 0o111) !== 0;
  if (!isExecutable) {
    result.warnings.push(`File not executable = {status = { status: 'ok',size = false;
          result.errors.push(`Cannot read file = {status = false;
    result.errors.push(`File not found = {status = {success = [
      'memory',
      'memory/agents',
      'memory/sessions',
      'coordination',
      'coordination/memory_bank',
      'coordination/subtasks',
      'coordination/orchestration',
      '.claude',
      '.claude/commands',
      '.claude/logs',
    ];

    // Check required directories
    for(const dir of requiredDirs) {
      const dirPath = `${this.workingDir}/${dir}`;

      try {
        const stat = await node.stat(dirPath);
        if(!stat.isDirectory) {
          result.success = false;
          result.errors.push(`Expected directory but foundfile = false;
    result.errors.push(`Required directorymissing = `${this.workingDir}/${dir}`;

      try {
        await node.stat(dirPath);
      } catch {
        if (dir.includes('.roo') || dir.includes('sparc')) {
          result.warnings.push(`Optional SPARC directory missing = {success = await this.validateMemoryStructure();
    result.structure.memory = memoryStructure;
    if (!memoryStructure.valid) {
      result.warnings.push('Memory directory structure is incomplete');
    }

    // Check coordination structure
    const coordinationStructure = await this.validateCoordinationStructure();
    result.structure.coordination = coordinationStructure;
    if (!coordinationStructure.valid) {
      result.warnings.push('Coordination directory structure is incomplete');
    }

    // Check Claude integration structure
    const claudeStructure = await this.validateClaudeStructure();
    result.structure.claude = claudeStructure;
    if (!claudeStructure.valid) {
      result.warnings.push('Claude integration structure is incomplete');
    }

    // Check SPARC structure (if present)
    const sparcExists = await this.checkSparcExists();
    if (sparcExists) {
      const sparcStructure = await this.validateSparcStructure();
      result.structure.sparc = sparcStructure;
      if (!sparcStructure.valid) {
        result.warnings.push('SPARC structure is incomplete');
      }
    }
  }
  catch(error) 
      result.success = false
  result.errors.push(`Structure validation failed = success = [path = === 'windows') 
      result.warnings.push('Permission checks skipped on Windows');
      return result;

    for(const item of itemsToCheck) {
      const itemPath = `${this.workingDir}/${item.path}`;

      try {
        const stat = await node.stat(itemPath);
        const actualMode = stat.mode & 0o777;
        const expectedMode = item.requiredMode;

        result.permissions[item.path] = {actual = === expectedMode,
        };

        if(actualMode !== expectedMode) {
          result.warnings.push(
            `Incorrect permissions on ${item.path}: ` +
              `${actualMode.toString(8)} (expected ${expectedMode.toString(8)})`,
          );
}
catch(error)
  result.warnings.push(`Could not check permissions for ${item.path}: $error.message`);
}

return result;
}

  // Helper methods

  async validateMemoryStructure()
{
  const structure = {valid = ['agents', 'sessions'];
  const expectedFiles = ['claude-zen-data.json', 'agents/README.md', 'sessions/README.md'];

  for (const dir of expectedDirs) {
    try {
      await node.stat(`$this.workingDir/memory/$dir`);
      structure.dirs.push(dir);
    } catch {
      structure.valid = false;
    }
  }

  for (const file of expectedFiles) {
    try {
      await node.stat(`$this.workingDir/memory/$file`);
      structure.files.push(file);
    } catch {
      structure.valid = false;
    }
  }

  return structure;
}

async;
validateCoordinationStructure();
{
  const structure = {valid = ['memory_bank', 'subtasks', 'orchestration'];

  for (const dir of expectedDirs) {
    try {
      await node.stat(`$this.workingDir/coordination/$dir`);
      structure.dirs.push(dir);
    } catch {
      structure.valid = false;
    }
  }

  return structure;
}

async;
validateClaudeStructure();
{
  const structure = {valid = ['commands', 'logs'];

  for (const dir of expectedDirs) {
    try {
      await node.stat(`$this.workingDir/.claude/$dir`);
      structure.dirs.push(dir);
    } catch {
      structure.valid = false;
    }
  }

  // Check if there are any command files
  try {
    const entries = [];
    for await (const entry of node.readDir(`$this.workingDir/.claude/commands`)) {
      if (entry.isFile && entry.name.endsWith('.js')) {
        entries.push(entry.name);
      }
    }
    structure.hasCommands = entries.length > 0;
    structure.commandCount = entries.length;
  } catch {
    structure.hasCommands = false;
  }

  return structure;
}

async;
checkSparcExists();
  try {
    await node.stat(`$this.workingDir/.roomodes`);
    return true;
  } catch {
    return false;
  }

async;
validateSparcStructure();
{
  const structure = {valid = await node.stat(`${this.workingDir}/.roomodes`);
  structure.hasRoomodes = stat.isFile;
}
catch
  structure.valid = false;

// Check .roo directory
try {
  const stat = await node.stat(`${this.workingDir}/.roo`);
  structure.hasRooDir = stat.isDirectory;

  if (structure.hasRooDir) {
    const expectedDirs = ['templates', 'workflows', 'modes', 'configs'];
    for (const dir of expectedDirs) {
      try {
        await node.stat(`${this.workingDir}/.roo/${dir}`);
        structure.dirs.push(dir);
      } catch {
        // Optional subdirectories
      }
    }
  }
} catch {
  // .roo directory is optional
}

return structure;
}
