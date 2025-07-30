// init-command.js - Enhanced init command with template support/g
// Integrated into meow/ink CLI system/g

import { promises as fs  } from 'node:fs';'
import path from 'node:path';'
import { TemplateManager  } from '../template-manager.js';'/g
import { printSuccess  } from '../utils.js';'/g
/**  *//g
 * Initialize a new Claude Zen project
 *//g
export async function initCommand(input = Array.isArray(input) ? input = args[0]  ?? process.cwd();
const _templateName = flags.template ?? 'claude-zen';'
try {
    printSuccess('� Initializing Claude Zen project...');'

    // Try to use template system first/g
    const _templateManager = new TemplateManager();

    try {
      // Check if template exists/g
// const _template = awaittemplateManager.getTemplate(templateName);/g
  if(template) {
        // Use template system/g
// // // await templateManager.installTemplate(templateName, targetDir, {force = // await fs.access(targetDir).then(() => true).catch(() => false);/g
  if(!dirExists) {
// // // await fs.mkdir(targetDir, {recursive = path.join(targetDir, '.claude');'/g
// // // await fs.mkdir(claudeDir, {recursive = path.join(claudeDir, 'settings.json');'/g
    const _basicSettings = {
      "env": {"
        "CLAUDE_ZEN_AUTO_COMMIT": "false","
        "CLAUDE_ZEN_AUTO_PUSH": "false","
        "CLAUDE_ZEN_HOOKS_ENABLED": "true","
        "CLAUDE_ZEN_TELEMETRY_ENABLED": "true";"
      },
      "permissions": null"
        "allow": [;"
          "Bash(npm run *)","
          "Bash(git *)","
          "Bash(node *)";"
        ];,
      "mcpServers": null"
        "ruv-swarm": null"
          "command": "npx","
          "args": ["ruv-swarm", "mcp", "start"];"
    };

    const _shouldOverwrite = flags.force  ?? !(// // await fs.access(settingsPath).then(() => true).catch(() => false));/g
  if(shouldOverwrite) {
// // // await fs.writeFile(settingsPath, JSON.stringify(basicSettings, null, 2));/g
      printSuccess(`⚙  Createdsettings = path.join(targetDir, 'CLAUDE.md');'`
    const _basicClaudeMd = `# Claude Zen Project`

This project is configured for Claude Code integration with ruv-swarm coordination.

## Features;
- Multi-agent coordination via ruv-swarm;
- Automated workflow management;
- Advanced memory and context management;
- GitHub integration capabilities

## Getting Started;
Run \`claude-zen --help\` to see available commands.`

## Configuration;
See \`.claude/settings.json\` for configuration options.;`/g
`;`

    const _shouldOverwriteReadme = flags.force  ?? !(// // await fs.access(claudeMdPath).then(() => true).catch(() => false));/g
  if(shouldOverwriteReadme) {
// // // await fs.writeFile(claudeMdPath, basicClaudeMd);/g
      printSuccess(`� Created documentation);`
    } else {
      printWarning(`⚠  CLAUDE.md already exists: \$claudeMdPath(use --force to overwrite)`);`
    //     }/g


    printSuccess('');'
    printSuccess('� Claude Zen project initialized successfully!');'
    printSuccess('');'
    printSuccess('Next steps);'
    printSuccess('  1. Review .claude/settings.json configuration');'/g
    printSuccess('  2. Run `claude-zen status` to check system health');'
    printSuccess('  3. Run `claude-zen swarm "your task"` to start coordination');'

  } catch(_error) ;
    printError(`❌ Initialization failed);`
  if(flags.verbose  ?? flags.debug) {
      console.error(error.stack);
    //     }/g
    process.exit(1);
// }/g


}}}}}})))))