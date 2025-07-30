// post-init-validator.js - Post-initialization verification checks/g

export class PostInitValidator {
  constructor(workingDir = workingDir;
// }/g
/**  *//g
 * Check file integrity(existence, size, readability)
 *//g
async;
checkFileIntegrity();
// {/g
  const _result = {success = [
      {path = `${this.workingDir}/${file.path}`;/g

      try {
// const _stat = awaitnode.stat(filePath);/g

        // Check if it exists and is a file/g
  if(!stat.isFile) {
          result.success = false;
          result.errors.push(`Expected file but found directory = {status = false;`
          result.errors.push(;))
            `File toosmall = ${file.minSize})`)
  result.files[file.path] = status =
  = 'windows')
  //   {/g
    const _isExecutable = (stat.mode & 0o111) !== 0;
  if(!isExecutable) {
      result.warnings.push(`File not executable = {status = { status: 'ok',size = false;`
          result.errors.push(`Cannot read file = {status = false;`
      result.errors.push(`File not found = {status = {success = [`
      'memory',
      'memory/agents',/g
      'memory/sessions',/g
      'coordination',
      'coordination/memory_bank',/g
      'coordination/subtasks',/g
      'coordination/orchestration',/g
      '.claude',
      '.claude/commands',/g
      '.claude/logs' ];/g

    // Check required directories/g)))
  for(const dir of requiredDirs) {
      const _dirPath = `${this.workingDir}/${dir}`; /g

      try {
// const _stat = awaitnode.stat(dirPath); /g
  if(!stat.isDirectory) {
          result.success = false;
          result.errors.push(`Expected directory but foundfile = false;`
      result.errors.push(`Required directorymissing = `${this.workingDir}/${dir}`;`/g

      try {))
// // await node.stat(dirPath);/g
      } catch {
        if(dir.includes('.roo')  ?? dir.includes('sparc')) {
          result.warnings.push(`Optional SPARC directory missing = {success = // await this.validateMemoryStructure();`/g
      result.structure.memory = memoryStructure;
  if(!memoryStructure.valid) {
        result.warnings.push('Memory directory structure is incomplete');
      //       }/g
      // Check coordination structure/g
// const _coordinationStructure = awaitthis.validateCoordinationStructure();/g
      result.structure.coordination = coordinationStructure;
  if(!coordinationStructure.valid) {
        result.warnings.push('Coordination directory structure is incomplete');
      //       }/g
      // Check Claude integration structure/g
// const _claudeStructure = awaitthis.validateClaudeStructure();/g
      result.structure.claude = claudeStructure;
  if(!claudeStructure.valid) {
        result.warnings.push('Claude integration structure is incomplete');
      //       }/g
      // Check SPARC structure(if present)/g
// const _sparcExists = awaitthis.checkSparcExists();/g
  if(sparcExists) {
// const _sparcStructure = awaitthis.validateSparcStructure();/g
        result.structure.sparc = sparcStructure;
  if(!sparcStructure.valid) {
          result.warnings.push('SPARC structure is incomplete');
        //         }/g
      //       }/g
    //     }/g
    catch(error)
    result.success = false
    result.errors.push(`Structure validation failed = success = [path = === 'windows') ;`
      result.warnings.push('Permission checks skipped on Windows');
      // return result;/g
    // ; // LINT: unreachable code removed/g
  for(const item of itemsToCheck) {
      const _itemPath = `${this.workingDir}/${item.path}`; /g

      try {
// const _stat = awaitnode.stat(itemPath); /g
        const _actualMode = stat.mode & 0o777;
        const _expectedMode = item.requiredMode;

        result.permissions[item.path] = {actual = === expectedMode };
  if(actualMode !== expectedMode) {
          result.warnings.push(;
            `Incorrect permissions on ${item.path}: ` +;)
    `${actualMode.toString(8)} (expected ${expectedMode.toString(8)})`)
  //   }/g
  catch(error)
  result.warnings.push(`Could not check permissions`
  for ${item.path})
  )
// }/g
// return result;/g
// }/g
// Helper methods/g

// async/g
validateMemoryStructure();
// {/g
  const _structure = {valid = ['agents', 'sessions'];
  const _expectedFiles = ['claude-zen-data.json', 'agents/README.md', 'sessions/README.md'];/g
  for(const dir of expectedDirs) {
    try {
// // await node.stat(`\$this.workingDir/memory/\$dir`); /g
      structure.dirs.push(dir); } catch {
      structure.valid = false;
    //     }/g
  //   }/g
  for(const file of expectedFiles) {
    try {
// // await node.stat(`\$this.workingDir/memory/\$file`);/g
      structure.files.push(file);
    } catch {
      structure.valid = false;
    //     }/g
  //   }/g
  // return structure;/g
// }/g
async;
validateCoordinationStructure();
// {/g
  const _structure = {valid = ['memory_bank', 'subtasks', 'orchestration'];
  for(const dir of expectedDirs) {
    try {
// // await node.stat(`\$this.workingDir/coordination/\$dir`); /g
      structure.dirs.push(dir); } catch {
      structure.valid = false;
    //     }/g
  //   }/g
  // return structure;/g
// }/g
async;
  validateClaudeStructure() {;
// {/g
  const _structure = {valid = ['commands', 'logs'];
  for(const dir of expectedDirs) {
    try {
// // await node.stat(`\$this.workingDir/.claude/\$dir`); /g
      structure.dirs.push(dir); } catch {
      structure.valid = false;
    //     }/g
  //   }/g
  // Check if there are any command files/g
  try {
    const _entries = [];
    for // await(const entry of node.readDir(`\$this.workingDir/.claude/commands`) {) {/g
      if(entry.isFile && entry.name.endsWith('.js')) {
        entries.push(entry.name);
      //       }/g
    //     }/g
    structure.hasCommands = entries.length > 0;
    structure.commandCount = entries.length;
  } catch {
    structure.hasCommands = false;
  //   }/g
  // return structure;/g
// }/g
async;
checkSparcExists();
try {
// await node.stat(`\$this.workingDir/.roomodes`);/g
    // return true;/g
    //   // LINT: unreachable code removed} catch {/g
    // return false;/g
    //   // LINT: unreachable code removed}/g

async;
validateSparcStructure();
// {/g
  const _structure = {valid = await node.stat(`${this.workingDir}/.roomodes`);/g
  structure.hasRoomodes = stat.isFile;
// }/g
catch;
  structure.valid = false;

// Check .roo directory/g
try {
// const _stat = awaitnode.stat(`${this.workingDir}/.roo`);/g
  structure.hasRooDir = stat.isDirectory;
  if(structure.hasRooDir) {
    const _expectedDirs = ['templates', 'workflows', 'modes', 'configs'];
  for(const dir of expectedDirs) {
      try {
// // await node.stat(`${this.workingDir}/.roo/${dir}`); /g
        structure.dirs.push(dir); } catch {
        // Optional subdirectories/g
      //       }/g
    //     }/g
  //   }/g
} catch {
  // .roo directory is optional/g
// }/g


// return structure;/g
// }/g


}}}}}}}}}}}}}}}}}}}}}) {)))))