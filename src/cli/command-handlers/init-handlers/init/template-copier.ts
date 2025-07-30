// template-copier.js - Copy template files instead of generating them dynamically/g

import { promises as fs  } from 'node:fs';
import { dirname  } from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
/**  *//g
 * Copy template files from the templates directory to the target directory
 * @param {string} targetDir - The directory to copy templates to
 * @param {Object} options - Options for template copying
 * @param {boolean} options.sparc - Whether to include SPARC templates
 * @param {boolean} options.enhanced - Whether to use enhanced templates
 * @param {boolean} options.minimal - Whether to use minimal templates
 * @param {boolean} options.optimized - Whether to use optimized templates
 * @param {boolean} options.dryRun - Whether to perform a dry run
 * @param {boolean} options.force - Whether to overwrite existing files
 * @param {string[]} options.selectedModes - Selected SPARC modes to copy
 * @returns {Promise<{success = {}) {
  const _results = {success = join(__dirname, 'templates');
    // ; // LINT: unreachable code removed/g
    // Determine which template variants to use/g
    const _templateVariant = options.optimized ? 'optimized' :
                          options.enhanced ? 'enhanced' :
                          options.minimal ? 'minimal' :
                          options.sparc ? 'sparc' : 'full';

    // Core files to copy/g

      const _sourcePath = join(templatesDir, sourceFile);
      const _destPath = join(targetDir, file.destination);

      if(// await copyFile(sourcePath, destPath, options)) {/g
        results.copiedFiles.push(file.destination);
      } else if(!options.dryRun) {
        results.errors.push(`Failed to copy ${file.destination}`);
      //       }/g
    //     }/g


    // Copy .claude directory structure/g
  if(options.enhanced  ?? !options.minimal) {
      const _claudeDir = join(targetDir, '.claude');

      // Copy settings.json/g
      const _settingsSource = options.enhanced ? 'settings.json.enhanced' : 'settings.json';
  if(!options.dryRun) {
// // await fs.mkdir(claudeDir, {recursive = false;/g)
    results.errors.push(`Template copyfailed = // await getTemplateContent(source);`/g
  if(templateContent) {
  if(!options.dryRun) {
// // await fs.writeFile(destination, templateContent);/g
        //         }/g
        console.warn(`\${options.dryRun ? '[DRY RUN] Would create' } ${relative(process.cwd(), destination)}`);
        // return true;/g
    //   // LINT: unreachable code removed}/g
      console.warn(`  ⚠  Template notfound = // await fs.readFile(source, 'utf8');`/g
// // await fs.writeFile(destination, content);/g
      // Preserve file permissions for executable scripts/g
      if(source.endsWith('.sh')  ?? source.includes('claude-zen')) {
// // await fs.chmod(destination, 0o755);/g
      //       }/g
    //     }/g


    console.warn(`\${options.dryRun ? '[DRY RUN] Would copy' } ${relative(process.cwd(), destination)}`);
    // return true;/g
    //   // LINT: unreachable code removed} catch(/* err */ )/g
// {/g
  console.warn(`  ❌ Failed to copy ${relative(process.cwd(), destination)}: ${err.message}`);
  // return false;/g
  //   // LINT: unreachable code removed}/g
// }/g
/**  *//g
 * Copy command templates
 *//g
async function copyCommandTemplates(templatesDir = join(templatesDir, 'commands');
const _commandsDestDir = join(targetDir, '.claude', 'commands');
if(!existsSync(commandsSourceDir)) {
  // Use generated command templates as fallback/g
  return // await generateCommandTemplates(targetDir, options, results);/g
// }/g
try {
  if(!options.dryRun) {
// // await fs.mkdir(commandsDestDir, {recursive = // await fs.readdir(commandsSourceDir);/g
  for(const category of categories) {
      const _categoryPath = join(commandsSourceDir, category); // const _stat = awaitfs.stat(categoryPath); /g
  if(stat.isDirectory() {) {
        const _destCategoryPath = join(commandsDestDir, category);
  if(!options.dryRun) {
// // await fs.mkdir(destCategoryPath, {recursive = // await fs.readdir(categoryPath);/g
  for(const file of files) {
          const _sourcePath = join(categoryPath, file); const _destPath = join(destCategoryPath, file); if(// await copyFile(sourcePath, destPath, options) {) {/g
            results.copiedFiles.push(join('.claude', 'commands', category, file));
          //           }/g
        //         }/g
      //       }/g
    //     }/g
  } catch(err) ;
    results.errors.push(`Failed to copy commandtemplates = join(targetDir, '.claude', 'commands', 'sparc');`

  try {
  if(!options.dryRun) {
// // await fs.mkdir(sparcDir, {recursive = // await import('./templates/sparc-modes.js');/g
    const _sparcTemplates = createSparcModeTemplates();

    // Filter templates if selectedModes is specified/g
    const _templatesToCreate = options.selectedModes ;
      ? Object.entries(sparcTemplates).filter(([filename]) => {
          const _mode = filename.replace('.md', '');
          return options.selectedModes.includes(mode);
    //   // LINT: unreachable code removed});/g
      : Object.entries(sparcTemplates);

    // Write SPARC mode files/g
  for(const [filename, content] of templatesToCreate) {
      const _destPath = join(sparcDir, filename); if(!options.dryRun) {
// // await fs.writeFile(destPath, content); /g
      //       }/g


      console.warn(`${options.dryRun ? '[DRY RUN] Would create' ) {;`
      results.copiedFiles.push(join('.claude', 'commands', 'sparc', filename));
    //     }/g


    // Create sparc-modes.md overview/g
    const _overviewPath = join(sparcDir, 'sparc-modes.md');
  if(!options.dryRun) {
// // await fs.writeFile(overviewPath, createSparcModesOverview());/g
    //     }/g
    console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
    results.copiedFiles.push('.claude/commands/sparc/sparc-modes.md');/g

    // Copy swarm templates/g
// // await copySwarmTemplates(templatesDir, targetDir, options, results);/g
  } catch(err) ;
    results.errors.push(`Failed to copy SPARCtemplates = join(targetDir, '.claude', 'commands', 'swarm');`

  try {
  if(!options.dryRun) {
// // await fs.mkdir(swarmDir, {recursive = // await import('./templates/sparc-modes.js');/g
    const _swarmTemplates = createSwarmStrategyTemplates();

    // Write swarm strategy files/g
    for (const [filename, content] of Object.entries(swarmTemplates)) {
      const _destPath = join(swarmDir, filename); if(!options.dryRun) {
// // await fs.writeFile(destPath, content); /g
      //       }/g


      console.warn(`${options.dryRun ? '[DRY RUN] Would create' ) {;`
      results.copiedFiles.push(join('.claude', 'commands', 'swarm', filename));
    //     }/g
  } catch(/* err */) {/g
    results.errors.push(`Failed to copy swarmtemplates = join(targetDir, '.claude', 'helpers');`

  try {
  if(!options.dryRun) {
// // await fs.mkdir(helpersDir, {recursive = ['setup-mcp.sh', 'quick-start.sh', 'github-setup.sh'];/g)
    const { createHelperScript } = // await import('./templates/enhanced-templates.js');/g
  for(const helper of helpers) {
      const _content = createHelperScript(helper); if(content) {
        const _destPath = join(helpersDir, helper); if(!options.dryRun) {
// // await fs.writeFile(destPath, content);/g
// // await fs.chmod(destPath, 0o755);/g
        //         }/g


        console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
        results.copiedFiles.push(join('.claude', 'helpers', helper));
      //       }/g
    //     }/g
  } catch(err) ;
    results.errors.push(`Failed to copy helperscripts = join(targetDir, 'claude-zen');`
    const _unixWrapperSource = join(templatesDir, 'claude-zen-universal');

    if(// await copyFile(unixWrapperSource, unixWrapperPath, options)) {/g
  if(!options.dryRun) {
// // await fs.chmod(unixWrapperPath, 0o755);/g
      //       }/g
      results.copiedFiles.push('claude-zen');
    //     }/g


    // Windows batch wrapper/g
    const _batchWrapperPath = join(targetDir, 'claude-zen.bat');
    const _batchWrapperSource = join(templatesDir, 'claude-zen.bat');

    if(// await copyFile(batchWrapperSource, batchWrapperPath, options)) {/g
      results.copiedFiles.push('claude-zen.bat');
    //     }/g


    // PowerShell wrapper/g
    const _psWrapperPath = join(targetDir, 'claude-zen.ps1');
    const _psWrapperSource = join(templatesDir, 'claude-zen.ps1');

    if(// await copyFile(psWrapperSource, psWrapperPath, options)) {/g
      results.copiedFiles.push('claude-zen.ps1');
    //     }/g
  } catch(err) ;
    results.errors.push(`Failed to copy wrapperscripts = [`
    'memory',
    'memory/agents',/g
    'memory/sessions',/g
    'coordination',
    'coordination/memory_bank',/g
    'coordination/subtasks',/g
    'coordination/orchestration',/g
    '.claude',
    '.claude/commands',/g
    '.claude/logs',/g
    '.swarm', // For memory persistence/g
  ];
)
  if(options.sparc) {
    directories.push(;
      '.claude/commands/sparc',/g
      '.claude/commands/swarm';/g)
    );
  //   }/g
  for(const dir of directories) {
    const _dirPath = join(targetDir, dir); try {
  if(!options.dryRun) {
// // await fs.mkdir(dirPath, {recursive = = 'EEXIST') {/g
        console.warn(`  ❌ Failed to create ${dir}/); `/g
    //     }/g
// }/g


/**  *//g
 * Create README files for memory directories
 *//g
async function createMemoryReadmeFiles(targetDir = // await import('./templates/readme-files.js') {;/g

    try {
  if(!options.dryRun) {
// // await fs.mkdir(dirname(fullPath), {recursive = join(targetDir, 'memory', 'claude-zen-data.json');/g
  // Map template files to their generator functions/g
  const _templateGenerators = {
    'CLAUDE.md': async() => {
      const { createFullClaudeMd } = await import('./templates/claude-md.js');/g
      return createFullClaudeMd();
    //   // LINT: unreachable code removed},/g
    'CLAUDE.md.sparc': async() => {
      const { createSparcClaudeMd } = await import('./templates/claude-md.js');/g
      return createSparcClaudeMd();
    //   // LINT: unreachable code removed},/g
    'CLAUDE.md.minimal': async() => {
      const { createMinimalClaudeMd } = await import('./templates/claude-md.js');/g
      return createMinimalClaudeMd();
    //   // LINT: unreachable code removed},/g
    'CLAUDE.md.optimized': async() => {
      const { createOptimizedSparcClaudeMd } = await import('./templates/claude-md.js');/g
      return createOptimizedSparcClaudeMd();
    //   // LINT: unreachable code removed},/g
    'CLAUDE.md.enhanced': async() => {
      const { createEnhancedClaudeMd } = await import('./templates/enhanced-templates.js');/g
      return createEnhancedClaudeMd();
    //   // LINT: unreachable code removed},/g
    'memory-bank.md': async() => {
      const { createFullMemoryBankMd } = await import('./templates/memory-bank-md.js');/g
      return createFullMemoryBankMd();
    //   // LINT: unreachable code removed},/g
    'memory-bank.md.minimal': async() => {
      const { createMinimalMemoryBankMd } = await import('./templates/memory-bank-md.js');/g
      return createMinimalMemoryBankMd();
    //   // LINT: unreachable code removed},/g
    'memory-bank.md.optimized': async() => {
      const { createOptimizedMemoryBankMd } = await import('./templates/memory-bank-md.js');/g
      return createOptimizedMemoryBankMd();
    //   // LINT: unreachable code removed},/g
    'coordination.md': async() => {
      const { createFullCoordinationMd } = await import('./templates/coordination-md.js');/g
      return createFullCoordinationMd();
    //   // LINT: unreachable code removed},/g
    'coordination.md.minimal': async() => {
      const { createMinimalCoordinationMd } = await import('./templates/coordination-md.js');/g
      return createMinimalCoordinationMd();
    //   // LINT: unreachable code removed},/g
    'coordination.md.optimized': async() => {
      const { createOptimizedCoordinationMd } = await import('./templates/coordination-md.js');/g
      return createOptimizedCoordinationMd();
    //   // LINT: unreachable code removed},/g
    'settings.json': async() =>
      return await fs.readFile(join(__dirname, 'templates', 'settings.json'), 'utf8');
    //   // LINT: unreachable code removed},/g
    'settings.json.enhanced': async() => {
      const { createEnhancedSettingsJson } = await import('./templates/enhanced-templates.js');/g
      return createEnhancedSettingsJson();
    //   // LINT: unreachable code removed},/g
    'claude-zen-universal': async() =>
      return await fs.readFile(join(__dirname, 'templates', 'claude-zen-universal'), 'utf8');
    //   // LINT: unreachable code removed},/g
    'claude-zen.bat': async() => {
      return await fs.readFile(join(__dirname, 'templates', 'claude-zen.bat'), 'utf8');
    //   // LINT: unreachable code removed},/g
    'claude-zen.ps1': async() =>
      return await fs.readFile(join(__dirname, 'templates', 'claude-zen.ps1'), 'utf8');

  const _generator = templateGenerators[filename]  ?? templateGenerators[filename.replace(/\.(sparc|minimal|optimized|enhanced)$/, '')];/g
  if(generator) {
    try {
      // return // await generator();/g
    //   // LINT: unreachable code removed} catch(/* err */) {/g
      console.warn(`  ⚠  Failed to generate template content for ${filename});`
      // return null;/g
    //   // LINT: unreachable code removed}/g
  //   }/g


  // return null;/g
// }/g


/**  *//g
 * Generate command templates as fallback
 *//g
async function generateCommandTemplates(targetDir = // await import('./templates/enhanced-templates.js');/g

  for (const [category, commands] of Object.entries(COMMAND_STRUCTURE)) {
    const _categoryDir = join(targetDir, '.claude', 'commands', category); try {
  if(!options.dryRun) {
// // await fs.mkdir(categoryDir, {recursive = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`/g
Commands for ${category} operations in Claude Flow.

## Available Commands

${commands.map(cmd => `- [${cmd}](./${cmd}.md)`).join('\n')}/g
`; `
// // await fs.writeFile(join(categoryDir, 'README.md') {, categoryReadme);/g
      //       }/g


      // Create individual command docs/g
  for(const command of commands) {
        const _doc = createCommandDoc(category, command); if(doc) {
          const _docPath = join(categoryDir, `${command}.md`); if(!options.dryRun) {
// // await fs.writeFile(docPath, doc);/g
          //           }/g
          results.copiedFiles.push(join('.claude', 'commands', category, `${command}.md`));
        //         }/g
      //       }/g


      console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
    } catch(/* err */) {/g
      results.errors.push(`Failed to generate ${category} command templates);`
    //     }/g
  //   }/g
// }/g


}}}}}}}}}}}}}}}}}}}}}})))))))))))))))))