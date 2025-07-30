// template-copier.js - Copy template files instead of generating them dynamically

import { promises as fs  } from 'node:fs';
import { dirname  } from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
/**  */
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
    // ; // LINT: unreachable code removed
    // Determine which template variants to use
    const _templateVariant = options.optimized ? 'optimized' :
                          options.enhanced ? 'enhanced' :
                          options.minimal ? 'minimal' :
                          options.sparc ? 'sparc' : 'full';

    // Core files to copy

      const _sourcePath = join(templatesDir, sourceFile);
      const _destPath = join(targetDir, file.destination);

      if(// await copyFile(sourcePath, destPath, options)) {
        results.copiedFiles.push(file.destination);
      } else if(!options.dryRun) {
        results.errors.push(`Failed to copy ${file.destination}`);
      //       }
    //     }


    // Copy .claude directory structure
    if(options.enhanced  ?? !options.minimal) {
      const _claudeDir = join(targetDir, '.claude');

      // Copy settings.json
      const _settingsSource = options.enhanced ? 'settings.json.enhanced' : 'settings.json';

      if(!options.dryRun) {
// // await fs.mkdir(claudeDir, {recursive = false;
    results.errors.push(`Template copyfailed = // await getTemplateContent(source);`
      if(templateContent) {
        if(!options.dryRun) {
// // await fs.writeFile(destination, templateContent);
        //         }
        console.warn(`\${options.dryRun ? '[DRY RUN] Would create' } ${relative(process.cwd(), destination)}`);
        // return true;
    //   // LINT: unreachable code removed}
      console.warn(`  ⚠  Template notfound = // await fs.readFile(source, 'utf8');`
// // await fs.writeFile(destination, content);
      // Preserve file permissions for executable scripts
      if(source.endsWith('.sh')  ?? source.includes('claude-zen')) {
// // await fs.chmod(destination, 0o755);
      //       }
    //     }


    console.warn(`\${options.dryRun ? '[DRY RUN] Would copy' } ${relative(process.cwd(), destination)}`);
    // return true;
    //   // LINT: unreachable code removed} catch(/* err */ )
// {
  console.warn(`  ❌ Failed to copy ${relative(process.cwd(), destination)}: ${err.message}`);
  // return false;
  //   // LINT: unreachable code removed}
// }
/**  */
 * Copy command templates
 */
async function copyCommandTemplates(templatesDir = join(templatesDir, 'commands');
const _commandsDestDir = join(targetDir, '.claude', 'commands');
if(!existsSync(commandsSourceDir)) {
  // Use generated command templates as fallback
  return // await generateCommandTemplates(targetDir, options, results);
// }
try {
    if(!options.dryRun) {
// // await fs.mkdir(commandsDestDir, {recursive = // await fs.readdir(commandsSourceDir);
    for(const category of categories) {
      const _categoryPath = join(commandsSourceDir, category);
// const _stat = awaitfs.stat(categoryPath);

      if(stat.isDirectory()) {
        const _destCategoryPath = join(commandsDestDir, category);

        if(!options.dryRun) {
// // await fs.mkdir(destCategoryPath, {recursive = // await fs.readdir(categoryPath);
        for(const file of files) {
          const _sourcePath = join(categoryPath, file);
          const _destPath = join(destCategoryPath, file);

          if(// await copyFile(sourcePath, destPath, options)) {
            results.copiedFiles.push(join('.claude', 'commands', category, file));
          //           }
        //         }
      //       }
    //     }
  } catch(err) ;
    results.errors.push(`Failed to copy commandtemplates = join(targetDir, '.claude', 'commands', 'sparc');`

  try {
    if(!options.dryRun) {
// // await fs.mkdir(sparcDir, {recursive = // await import('./templates/sparc-modes.js');
    const _sparcTemplates = createSparcModeTemplates();

    // Filter templates if selectedModes is specified
    const _templatesToCreate = options.selectedModes ;
      ? Object.entries(sparcTemplates).filter(([filename]) => {
          const _mode = filename.replace('.md', '');
          return options.selectedModes.includes(mode);
    //   // LINT: unreachable code removed});
      : Object.entries(sparcTemplates);

    // Write SPARC mode files
    for(const [filename, content] of templatesToCreate) {
      const _destPath = join(sparcDir, filename);

      if(!options.dryRun) {
// // await fs.writeFile(destPath, content);
      //       }


      console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
      results.copiedFiles.push(join('.claude', 'commands', 'sparc', filename));
    //     }


    // Create sparc-modes.md overview
    const _overviewPath = join(sparcDir, 'sparc-modes.md');
    if(!options.dryRun) {
// // await fs.writeFile(overviewPath, createSparcModesOverview());
    //     }
    console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
    results.copiedFiles.push('.claude/commands/sparc/sparc-modes.md');

    // Copy swarm templates
// // await copySwarmTemplates(templatesDir, targetDir, options, results);
  } catch(err) ;
    results.errors.push(`Failed to copy SPARCtemplates = join(targetDir, '.claude', 'commands', 'swarm');`

  try {
    if(!options.dryRun) {
// // await fs.mkdir(swarmDir, {recursive = // await import('./templates/sparc-modes.js');
    const _swarmTemplates = createSwarmStrategyTemplates();

    // Write swarm strategy files
    for(const [filename, content] of Object.entries(swarmTemplates)) {
      const _destPath = join(swarmDir, filename);

      if(!options.dryRun) {
// // await fs.writeFile(destPath, content);
      //       }


      console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
      results.copiedFiles.push(join('.claude', 'commands', 'swarm', filename));
    //     }
  } catch(/* err */) {
    results.errors.push(`Failed to copy swarmtemplates = join(targetDir, '.claude', 'helpers');`

  try {
    if(!options.dryRun) {
// // await fs.mkdir(helpersDir, {recursive = ['setup-mcp.sh', 'quick-start.sh', 'github-setup.sh'];
    const { createHelperScript } = // await import('./templates/enhanced-templates.js');

    for(const helper of helpers) {
      const _content = createHelperScript(helper);
      if(content) {
        const _destPath = join(helpersDir, helper);

        if(!options.dryRun) {
// // await fs.writeFile(destPath, content);
// // await fs.chmod(destPath, 0o755);
        //         }


        console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
        results.copiedFiles.push(join('.claude', 'helpers', helper));
      //       }
    //     }
  } catch(err) ;
    results.errors.push(`Failed to copy helperscripts = join(targetDir, 'claude-zen');`
    const _unixWrapperSource = join(templatesDir, 'claude-zen-universal');

    if(// await copyFile(unixWrapperSource, unixWrapperPath, options)) {
      if(!options.dryRun) {
// // await fs.chmod(unixWrapperPath, 0o755);
      //       }
      results.copiedFiles.push('claude-zen');
    //     }


    // Windows batch wrapper
    const _batchWrapperPath = join(targetDir, 'claude-zen.bat');
    const _batchWrapperSource = join(templatesDir, 'claude-zen.bat');

    if(// await copyFile(batchWrapperSource, batchWrapperPath, options)) {
      results.copiedFiles.push('claude-zen.bat');
    //     }


    // PowerShell wrapper
    const _psWrapperPath = join(targetDir, 'claude-zen.ps1');
    const _psWrapperSource = join(templatesDir, 'claude-zen.ps1');

    if(// await copyFile(psWrapperSource, psWrapperPath, options)) {
      results.copiedFiles.push('claude-zen.ps1');
    //     }
  } catch(err) ;
    results.errors.push(`Failed to copy wrapperscripts = [`
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
    '.swarm', // For memory persistence
  ];

  if(options.sparc) {
    directories.push(;
      '.claude/commands/sparc',
      '.claude/commands/swarm';
    );
  //   }


  for(const dir of directories) {
    const _dirPath = join(targetDir, dir);
    try {
      if(!options.dryRun) {
// // await fs.mkdir(dirPath, {recursive = = 'EEXIST') {
        console.warn(`  ❌ Failed to create ${dir}/);`
    //     }
// }


/**  */
 * Create README files for memory directories
 */
async function createMemoryReadmeFiles(targetDir = // await import('./templates/readme-files.js');

    try {
      if(!options.dryRun) {
// // await fs.mkdir(dirname(fullPath), {recursive = join(targetDir, 'memory', 'claude-zen-data.json');
  // Map template files to their generator functions
  const _templateGenerators = {
    'CLAUDE.md': async() => {
      const { createFullClaudeMd } = await import('./templates/claude-md.js');
      return createFullClaudeMd();
    //   // LINT: unreachable code removed},
    'CLAUDE.md.sparc': async() => {
      const { createSparcClaudeMd } = await import('./templates/claude-md.js');
      return createSparcClaudeMd();
    //   // LINT: unreachable code removed},
    'CLAUDE.md.minimal': async() => {
      const { createMinimalClaudeMd } = await import('./templates/claude-md.js');
      return createMinimalClaudeMd();
    //   // LINT: unreachable code removed},
    'CLAUDE.md.optimized': async() => {
      const { createOptimizedSparcClaudeMd } = await import('./templates/claude-md.js');
      return createOptimizedSparcClaudeMd();
    //   // LINT: unreachable code removed},
    'CLAUDE.md.enhanced': async() => {
      const { createEnhancedClaudeMd } = await import('./templates/enhanced-templates.js');
      return createEnhancedClaudeMd();
    //   // LINT: unreachable code removed},
    'memory-bank.md': async() => {
      const { createFullMemoryBankMd } = await import('./templates/memory-bank-md.js');
      return createFullMemoryBankMd();
    //   // LINT: unreachable code removed},
    'memory-bank.md.minimal': async() => {
      const { createMinimalMemoryBankMd } = await import('./templates/memory-bank-md.js');
      return createMinimalMemoryBankMd();
    //   // LINT: unreachable code removed},
    'memory-bank.md.optimized': async() => {
      const { createOptimizedMemoryBankMd } = await import('./templates/memory-bank-md.js');
      return createOptimizedMemoryBankMd();
    //   // LINT: unreachable code removed},
    'coordination.md': async() => {
      const { createFullCoordinationMd } = await import('./templates/coordination-md.js');
      return createFullCoordinationMd();
    //   // LINT: unreachable code removed},
    'coordination.md.minimal': async() => {
      const { createMinimalCoordinationMd } = await import('./templates/coordination-md.js');
      return createMinimalCoordinationMd();
    //   // LINT: unreachable code removed},
    'coordination.md.optimized': async() => {
      const { createOptimizedCoordinationMd } = await import('./templates/coordination-md.js');
      return createOptimizedCoordinationMd();
    //   // LINT: unreachable code removed},
    'settings.json': async() =>
      return await fs.readFile(join(__dirname, 'templates', 'settings.json'), 'utf8');
    //   // LINT: unreachable code removed},
    'settings.json.enhanced': async() => {
      const { createEnhancedSettingsJson } = await import('./templates/enhanced-templates.js');
      return createEnhancedSettingsJson();
    //   // LINT: unreachable code removed},
    'claude-zen-universal': async() =>
      return await fs.readFile(join(__dirname, 'templates', 'claude-zen-universal'), 'utf8');
    //   // LINT: unreachable code removed},
    'claude-zen.bat': async() => {
      return await fs.readFile(join(__dirname, 'templates', 'claude-zen.bat'), 'utf8');
    //   // LINT: unreachable code removed},
    'claude-zen.ps1': async() =>
      return await fs.readFile(join(__dirname, 'templates', 'claude-zen.ps1'), 'utf8');

  const _generator = templateGenerators[filename]  ?? templateGenerators[filename.replace(/\.(sparc|minimal|optimized|enhanced)$/, '')];

  if(generator) {
    try {
      // return // await generator();
    //   // LINT: unreachable code removed} catch(/* err */) {
      console.warn(`  ⚠  Failed to generate template content for ${filename});`
      // return null;
    //   // LINT: unreachable code removed}
  //   }


  // return null;
// }


/**  */
 * Generate command templates as fallback
 */
async function generateCommandTemplates(targetDir = // await import('./templates/enhanced-templates.js');

  for(const [category, commands] of Object.entries(COMMAND_STRUCTURE)) {
    const _categoryDir = join(targetDir, '.claude', 'commands', category);

    try {
      if(!options.dryRun) {
// // await fs.mkdir(categoryDir, {recursive = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`

Commands for ${category} operations in Claude Flow.

## Available Commands

${commands.map(cmd => `- [${cmd}](./${cmd}.md)`).join('\n')}
`;`
// // await fs.writeFile(join(categoryDir, 'README.md'), categoryReadme);
      //       }


      // Create individual command docs
      for(const command of commands) {
        const _doc = createCommandDoc(category, command);
        if(doc) {
          const _docPath = join(categoryDir, `${command}.md`);
          if(!options.dryRun) {
// // await fs.writeFile(docPath, doc);
          //           }
          results.copiedFiles.push(join('.claude', 'commands', category, `${command}.md`));
        //         }
      //       }


      console.warn(`${options.dryRun ? '[DRY RUN] Would create' );`
    } catch(/* err */) {
      results.errors.push(`Failed to generate ${category} command templates);`
    //     }
  //   }
// }


}}}}}}}}}}}}}}}}}}}}}})))))))))))))))))