// post-init-validator.js - Post-initialization verification checks

export class PostInitValidator {
  constructor(workingDir = workingDir;
// }
/**  */
 * Check file integrity (existence, size, readability)
 */
async;
checkFileIntegrity();
// {
  const _result = {success = [
      {path = `${this.workingDir}/${file.path}`;

      try {
// const _stat = awaitnode.stat(filePath);

        // Check if it exists and is a file
        if(!stat.isFile) {
          result.success = false;
          result.errors.push(`Expected file but found directory = {status = false;`
          result.errors.push(;
            `File toosmall = ${file.minSize})`)
  result.files[file.path] = status =
  = 'windows')
  //   {
    const _isExecutable = (stat.mode & 0o111) !== 0;
    if (!isExecutable) {
      result.warnings.push(`File not executable = {status = { status: 'ok',size = false;`
          result.errors.push(`Cannot read file = {status = false;`
      result.errors.push(`File not found = {status = {success = [`
      'memory',
      'memory/agents',
      'memory/sessions',
      'coordination',
      'coordination/memory_bank',
      'coordination/subtasks',
      'coordination/orchestration',
      '.claude',
      '.claude/commands',
      '.claude/logs' ];

    // Check required directories
    for(const dir of requiredDirs) {
      const _dirPath = `${this.workingDir}/${dir}`;

      try {
// const _stat = awaitnode.stat(dirPath);
        if(!stat.isDirectory) {
          result.success = false;
          result.errors.push(`Expected directory but foundfile = false;`
      result.errors.push(`Required directorymissing = `${this.workingDir}/${dir}`;`

      try {
// // await node.stat(dirPath);
      } catch {
        if (dir.includes('.roo')  ?? dir.includes('sparc')) {
          result.warnings.push(`Optional SPARC directory missing = {success = // await this.validateMemoryStructure();`
      result.structure.memory = memoryStructure;
      if (!memoryStructure.valid) {
        result.warnings.push('Memory directory structure is incomplete');
      //       }
      // Check coordination structure
// const _coordinationStructure = awaitthis.validateCoordinationStructure();
      result.structure.coordination = coordinationStructure;
      if (!coordinationStructure.valid) {
        result.warnings.push('Coordination directory structure is incomplete');
      //       }
      // Check Claude integration structure
// const _claudeStructure = awaitthis.validateClaudeStructure();
      result.structure.claude = claudeStructure;
      if (!claudeStructure.valid) {
        result.warnings.push('Claude integration structure is incomplete');
      //       }
      // Check SPARC structure (if present)
// const _sparcExists = awaitthis.checkSparcExists();
      if (sparcExists) {
// const _sparcStructure = awaitthis.validateSparcStructure();
        result.structure.sparc = sparcStructure;
        if (!sparcStructure.valid) {
          result.warnings.push('SPARC structure is incomplete');
        //         }
      //       }
    //     }
    catch(error)
    result.success = false
    result.errors.push(`Structure validation failed = success = [path = === 'windows') ;`
      result.warnings.push('Permission checks skipped on Windows');
      // return result;
    // ; // LINT: unreachable code removed
    for(const item of itemsToCheck) {
      const _itemPath = `${this.workingDir}/${item.path}`;

      try {
// const _stat = awaitnode.stat(itemPath);
        const _actualMode = stat.mode & 0o777;
        const _expectedMode = item.requiredMode;

        result.permissions[item.path] = {actual = === expectedMode };

        if(actualMode !== expectedMode) {
          result.warnings.push(;
            `Incorrect permissions on ${item.path}: ` +;
    `${actualMode.toString(8)} (expected ${expectedMode.toString(8)})`)
  //   }
  catch(error)
  result.warnings.push(`Could not check permissions`
  for ${item.path}
  )
// }
// return result;
// }
// Helper methods

// async
validateMemoryStructure();
// {
  const _structure = {valid = ['agents', 'sessions'];
  const _expectedFiles = ['claude-zen-data.json', 'agents/README.md', 'sessions/README.md'];
  for (const dir of expectedDirs) {
    try {
// // await node.stat(`\$this.workingDir/memory/\$dir`);
      structure.dirs.push(dir);
    } catch {
      structure.valid = false;
    //     }
  //   }
  for (const file of expectedFiles) {
    try {
// // await node.stat(`\$this.workingDir/memory/\$file`);
      structure.files.push(file);
    } catch {
      structure.valid = false;
    //     }
  //   }
  // return structure;
// }
async;
validateCoordinationStructure();
// {
  const _structure = {valid = ['memory_bank', 'subtasks', 'orchestration'];
  for (const dir of expectedDirs) {
    try {
// // await node.stat(`\$this.workingDir/coordination/\$dir`);
      structure.dirs.push(dir);
    } catch {
      structure.valid = false;
    //     }
  //   }
  // return structure;
// }
async;
validateClaudeStructure();
// {
  const _structure = {valid = ['commands', 'logs'];
  for (const dir of expectedDirs) {
    try {
// // await node.stat(`\$this.workingDir/.claude/\$dir`);
      structure.dirs.push(dir);
    } catch {
      structure.valid = false;
    //     }
  //   }
  // Check if there are any command files
  try {
    const _entries = [];
    for // await (const entry of node.readDir(`\$this.workingDir/.claude/commands`)) {
      if (entry.isFile && entry.name.endsWith('.js')) {
        entries.push(entry.name);
      //       }
    //     }
    structure.hasCommands = entries.length > 0;
    structure.commandCount = entries.length;
  } catch {
    structure.hasCommands = false;
  //   }
  // return structure;
// }
async;
checkSparcExists();
try {
// await node.stat(`\$this.workingDir/.roomodes`);
    // return true;
    //   // LINT: unreachable code removed} catch {
    // return false;
    //   // LINT: unreachable code removed}

async;
validateSparcStructure();
// {
  const _structure = {valid = await node.stat(`${this.workingDir}/.roomodes`);
  structure.hasRoomodes = stat.isFile;
// }
catch;
  structure.valid = false;

// Check .roo directory
try {
// const _stat = awaitnode.stat(`${this.workingDir}/.roo`);
  structure.hasRooDir = stat.isDirectory;

  if (structure.hasRooDir) {
    const _expectedDirs = ['templates', 'workflows', 'modes', 'configs'];
    for (const dir of expectedDirs) {
      try {
// // await node.stat(`${this.workingDir}/.roo/${dir}`);
        structure.dirs.push(dir);
      } catch {
        // Optional subdirectories
      //       }
    //     }
  //   }
} catch {
  // .roo directory is optional
// }


// return structure;
// }


}}}}}}}}}}}}}}}}}}}}}))))))