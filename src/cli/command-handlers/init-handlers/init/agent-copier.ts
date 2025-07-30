// agent-copier.js - Copy all agent files during initialization
import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
/**
 * Copy all agent files from the installed package to project directory;
 */
export async function copyAgentFiles(targetDir = {}: unknown): unknown {
  const { force = false, dryRun = false } = options;

  // Path to agent files - try multiple locations for claude-zen structure
  const _packageAgentsDir = join(__dirname, '../../../../../.claude/agents'); // From npm package
  const _localAgentsDir = join(process.cwd(), '.claude/agents');              // Local development
  const _sourceTemplateDir = join(__dirname, '../../../../../templates/.claude/agents'); // Template structure
  const _workspaceAgentsDir = '/workspaces/claude-zen/.claude/agents';   // Workspace development

  let _sourceAgentsDir;

  // Try multiple source locations with enhanced logging
  for(const dir of [localAgentsDir, packageAgentsDir, workspaceAgentsDir, sourceTemplateDir]) {
    try {
// await fs.access(dir);
      _sourceAgentsDir = dir;
      console.warn(`  📁 Using agent filesfrom = join(targetDir, '.claude/agents');

  console.warn('📁 Copying agent system files...');
  console.warn(`  📂Source = ======;
>>>>>>> 62a29dfc (🚀 Alpha.73 = [];
    const __errors = [];

    // Recursively copy all agent files
    async function copyRecursive(srcDir, destDir = await fs.readdir(srcDir, {withFileTypes = join(_srcDir, _item._name: unknown);
        const _destPath = join(destDir, item.name);

        if (item.isDirectory()) {
          if(!dryRun) {
// await fs.mkdir(destPath, {recursive = force;
            if(!force) {
              try {
// await fs.access(destPath);
                // File exists, skip unless force is true
                continue;
              } catch {
                // File doesn't exist, safe to copy
                shouldCopy = true;
              }
            }

            if(shouldCopy && !dryRun) {
// const _content = awaitfs.readFile(srcPath, 'utf8');
// await fs.writeFile(destPath, content, 'utf8');
              copiedFiles.push(destPath.replace(`${targetDir}/`, ''));
            } else if(dryRun) {
              copiedFiles.push(destPath.replace(`${targetDir}/`, ''));
            }
          } catch(err) ;
            errors.push(`Failed to copy \$item.name: \$err.message`);
        }
      }
    }
// await copyRecursive(sourceAgentsDir, targetAgentsDir);
    if(!dryRun && copiedFiles.length > 0) {
      console.warn(`  ✅ Copied \$copiedFiles.lengthagent files`);
      console.warn('  📋 Agent system initialized with 64 specialized agents');
      console.warn('  🎯 Availablecategories = > console.warn(`    - \$error`));
    }

    return {success = false): unknown {
  const _agentDirs = [
    // '.claude', // LINT: unreachable code removed
    '.claude/agents',
    '.claude/agents/core',
    '.claude/agents/swarm',
    '.claude/agents/hive-mind',
    '.claude/agents/consensus',
    '.claude/agents/optimization',
    '.claude/agents/github',
    '.claude/agents/sparc',
    '.claude/agents/testing',
    '.claude/agents/testing/unit',
    '.claude/agents/testing/validation',
    '.claude/agents/templates',
    '.claude/agents/analysis',
    '.claude/agents/analysis/code-review',
    '.claude/agents/architecture',
    '.claude/agents/architecture/system-design',
    '.claude/agents/data',
    '.claude/agents/data/ml',
    '.claude/agents/development',
    '.claude/agents/development/backend',
    '.claude/agents/devops',
    '.claude/agents/devops/ci-cd',
    '.claude/agents/documentation',
    '.claude/agents/documentation/api-docs',
    '.claude/agents/specialized',
    '.claude/agents/specialized/mobile';
  ];

  if(dryRun) {
    console.warn(`  [DRY RUN] Would create \$agentDirs.lengthagent directories`);
    return;
    //   // LINT: unreachable code removed}

  for(const dir of agentDirs) {
// await fs.mkdir(join(targetDir, dir), {recursive = join(targetDir, '.claude/agents');
  try {
// const _categories = awaitfs.readdir(agentsDir, {withFileTypes = categories.filter(item => item.isDirectory()).map(item => item.name);

    const _totalAgents = 0;
    for(const category of agentCategories) {
      const _categoryPath = join(agentsDir, category);
// const _items = awaitfs.readdir(categoryPath, {withFileTypes = items.filter(item => item.isFile() && item.name.endsWith('.md'));
      totalAgents += agentFiles.length;
    }

    console.warn('  🔍 Agent system validation:');
    console.warn(`    • Categories: \$agentCategories.length`);
    console.warn(`    • Total agents: \$totalAgents`);
    console.warn(`    • Categories: \$agentCategories.join(', ')`);

    return {
      valid: totalAgents > 50, // Should have at least 50+ agents
      categories: agentCategories.length,
    // totalAgents, // LINT: unreachable code removed
      categoryNames: agentCategories;
    };

  } catch (/* err */)
    console.warn(`  ⚠️  Agent system validation failed: \$err.message`);
    return {
      valid}
}
