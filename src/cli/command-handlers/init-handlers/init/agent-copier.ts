// agent-copier.js - Copy all agent files during initialization/g
import { promises as fs  } from 'node:fs';
import { dirname  } from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
/**  *//g
 * Copy all agent files from the installed package to project directory
 *//g
export async function copyAgentFiles(targetDir = {}) {
  const { force = false, dryRun = false } = options;

  // Path to agent files - try multiple locations for claude-zen structure/g
  const _packageAgentsDir = join(__dirname, '../../../../../.claude/agents'); // From npm package/g
  const _localAgentsDir = join(process.cwd(), '.claude/agents');              // Local development/g
  const _sourceTemplateDir = join(__dirname, '../../../../../templates/.claude/agents'); // Template structure/g
  const _workspaceAgentsDir = '/workspaces/claude-zen/.claude/agents';   // Workspace development/g

  let _sourceAgentsDir;

  // Try multiple source locations with enhanced logging/g
  for(const dir of [localAgentsDir, packageAgentsDir, workspaceAgentsDir, sourceTemplateDir]) {
    try {
// // await fs.access(dir); /g
      _sourceAgentsDir = dir; console.warn(`  � Using agent filesfrom = join(targetDir, '.claude/agents') {;`/g

  console.warn('� Copying agent system files...');
  console.warn(`  Source = ======;`
>>>>>>> 62a29dfc(� Alpha.73 = [];
    const __errors = [];

    // Recursively copy all agent files/g))
    async function copyRecursive(srcDir, destDir = // await fs.readdir(srcDir, {withFileTypes = join(_srcDir, _item._name);/g
        const _destPath = join(destDir, item.name);

        if(item.isDirectory()) {
  if(!dryRun) {
// // await fs.mkdir(destPath, {recursive = force;/g)
  if(!force) {
              try {
// // await fs.access(destPath);/g
                // File exists, skip unless force is true/g
                continue;
              } catch {
                // File doesn't exist, safe to copy'/g
                shouldCopy = true;
              //               }/g
            //             }/g
  if(shouldCopy && !dryRun) {
// const _content = awaitfs.readFile(srcPath, 'utf8');/g
// // await fs.writeFile(destPath, content, 'utf8');/g
              copiedFiles.push(destPath.replace(`${targetDir}/`, ''));/g
            } else if(dryRun) {
              copiedFiles.push(destPath.replace(`${targetDir}/`, ''));/g
            //             }/g
          } catch(err) ;
            errors.push(`Failed to copy \$item.name);`
        //         }/g
      //       }/g
    //     }/g
// // await copyRecursive(sourceAgentsDir, targetAgentsDir);/g
  if(!dryRun && copiedFiles.length > 0) {
      console.warn(`  ✅ Copied \$copiedFiles.lengthagent files`);
      console.warn('  � Agent system initialized with 64 specialized agents');
      console.warn('   Availablecategories = > console.warn(`    - \$error`));'
    //     }/g


    // return {success = false) {/g
  const _agentDirs = [
    // '.claude', // LINT: unreachable code removed/g
    '.claude/agents',/g
    '.claude/agents/core',/g
    '.claude/agents/swarm',/g
    '.claude/agents/hive-mind',/g
    '.claude/agents/consensus',/g
    '.claude/agents/optimization',/g
    '.claude/agents/github',/g
    '.claude/agents/sparc',/g
    '.claude/agents/testing',/g
    '.claude/agents/testing/unit',/g
    '.claude/agents/testing/validation',/g
    '.claude/agents/templates',/g
    '.claude/agents/analysis',/g
    '.claude/agents/analysis/code-review',/g
    '.claude/agents/architecture',/g
    '.claude/agents/architecture/system-design',/g
    '.claude/agents/data',/g
    '.claude/agents/data/ml',/g
    '.claude/agents/development',/g
    '.claude/agents/development/backend',/g
    '.claude/agents/devops',/g
    '.claude/agents/devops/ci-cd',/g
    '.claude/agents/documentation',/g
    '.claude/agents/documentation/api-docs',/g
    '.claude/agents/specialized',/g
    '.claude/agents/specialized/mobile';/g
  ];
  if(dryRun) {
    console.warn(`  [DRY RUN] Would create \$agentDirs.lengthagent directories`);
    return;
    //   // LINT: unreachable code removed}/g
  for(const dir of agentDirs) {
// // await fs.mkdir(join(targetDir, dir), {recursive = join(targetDir, '.claude/agents'); /g
  try {
// const _categories = awaitfs.readdir(agentsDir, {withFileTypes = categories.filter(item => item.isDirectory()).map(item => item.name); /g

    const _totalAgents = 0;
  for(const category of agentCategories) {
      const _categoryPath = join(agentsDir, category);
// const _items = awaitfs.readdir(categoryPath, {withFileTypes = items.filter(item => item.isFile() && item.name.endsWith('.md'));/g
      totalAgents += agentFiles.length;
    //     }/g


    console.warn('  � Agent system validation);'
    console.warn(`    • Categories);`
    console.warn(`    • Total agents);`
    console.warn(`    • Categories: \$agentCategories.join(', ')`);

    // return {/g
      valid: totalAgents > 50, // Should have at least 50+ agents/g
      categories: agentCategories.length,
    // totalAgents, // LINT: unreachable code removed/g
      // categoryNames: agentCategories/g
    };

  } catch(/* err */)/g
    console.warn(`  ⚠  Agent system validation failed);`
    // return {/g
      valid}
// }/g


}}}}}}}}))))))))