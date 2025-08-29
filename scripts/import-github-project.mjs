#!/usr/bin/env node

/**
 * GitHub Project Import CLI Tool
 * 
 * Import TODOs and roadmaps from markdown files into GitHub project boards
 * 
 * Usage:
 *   npm run import-github-project -- --token=<token> --owner=<owner> --repo=<repo>
 *   
 * Or directly:
 *   node scripts/import-github-project.mjs --token=<token> --owner=<owner> --repo=<repo>
 */

import { Command } from 'commander';
import { resolve } from 'node:path';
import { GitHubImportCLI } from '../packages/integrations/github/dist/cli.js';

const program = new Command();

program
  .name('github-project-import')
  .description('Import TODOs and roadmaps from markdown files to GitHub project boards')
  .version('1.0.0')
  .requiredOption('-t, --token <token>', 'GitHub personal access token')
  .requiredOption('-o, --owner <owner>', 'GitHub repository owner')
  .requiredOption('-r, --repo <repo>', 'GitHub repository name')
  .option('-p, --project <number>', 'GitHub project number', parseInt)
  .option('--docs-path <path>', 'Path to docs directory', './docs')
  .option('--todo-files <files...>', 'Specific TODO files to process')
  .option('--roadmap-files <files...>', 'Specific roadmap files to process')
  .option('--no-create-issues', 'Don\'t create GitHub issues (parse only)')
  .option('--add-to-project', 'Add created issues to project board')
  .option('--include-completed', 'Include completed items (default: only incomplete)')
  .option('--label-prefix <prefix>', 'Prefix for generated labels')
  .option('--dry-run', 'Show what would be imported without creating issues')
  .action(async (options) => {
    try {
      const cliOptions = {
        token: options.token,
        owner: options.owner,
        repo: options.repo,
        projectNumber: options.project,
        docsPath: resolve(options.docsPath),
        todoFiles: options.todoFiles?.map((f) => resolve(f)),
        roadmapFiles: options.roadmapFiles?.map((f) => resolve(f)),
        createIssues: options.createIssues,
        addToProject: options.addToProject,
        onlyIncomplete: !options.includeCompleted,
        labelPrefix: options.labelPrefix,
        dryRun: options.dryRun,
      };

      console.log('🚀 GitHub Project Import Tool');
      console.log(`📁 Repository: ${options.owner}/${options.repo}`);
      
      if (options.project) {
        console.log(`📋 Project: #${options.project}`);
      }
      
      if (options.dryRun) {
        console.log('🏃 Mode: DRY RUN (no issues will be created)');
      }
      
      console.log();

      await GitHubImportCLI.run(cliOptions);
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Add example usage
program.addHelpText('after', `
Example usage:
  # Basic import (dry run first to see what would be imported)
  $ node scripts/import-github-project.mjs \\
    --token ghp_xxxxxxxxxxxxxxxxxxxx \\
    --owner mikkihugo \\
    --repo zenflow \\
    --dry-run

  # Import to specific project board
  $ node scripts/import-github-project.mjs \\
    --token ghp_xxxxxxxxxxxxxxxxxxxx \\
    --owner mikkihugo \\
    --repo zenflow \\
    --project 3 \\
    --add-to-project

  # Import specific files only
  $ node scripts/import-github-project.mjs \\
    --token ghp_xxxxxxxxxxxxxxxxxxxx \\
    --owner mikkihugo \\
    --repo zenflow \\
    --todo-files docs/TODO.md \\
    --roadmap-files docs/archive/AI_ROADMAP.md docs/archive/PROJECT_STATUS.md

Environment variables:
  GITHUB_TOKEN    - GitHub personal access token (alternative to --token)
  GITHUB_OWNER    - GitHub repository owner (alternative to --owner)
  GITHUB_REPO     - GitHub repository name (alternative to --repo)
`);

// Support environment variables
if (process.env.GITHUB_TOKEN && !process.argv.includes('--token')) {
  process.argv.push('--token', process.env.GITHUB_TOKEN);
}
if (process.env.GITHUB_OWNER && !process.argv.includes('--owner')) {
  process.argv.push('--owner', process.env.GITHUB_OWNER);
}
if (process.env.GITHUB_REPO && !process.argv.includes('--repo')) {
  process.argv.push('--repo', process.env.GITHUB_REPO);
}

program.parse();