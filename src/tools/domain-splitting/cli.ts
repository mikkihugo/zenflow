#!/usr/bin/env tsx

/**
 * CLI command for domain splitting operations
 * Converted from commander to meow as per project standards
 */

import path from 'node:path';
// Import the demo for now since full implementation has build dependencies
import fs from 'fs-extra';
import meow from 'meow';

interface CliOptions {
  domain?: string;
  analyze?: boolean;
  split?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

const cli = meow(
  `
🔧 Domain Splitting Tool
Manage large codebases by splitting domains intelligently

Usage
  $ domain-split <command> [options]

Commands
  analyze <domain-path>    Analyze a domain for splitting opportunities
  split <domain-path>      Split a domain into sub-domains  
  neural                   Split the neural domain using predefined plan
  validate <domain-path>   Validate domain structure and dependencies

Options
  --dry-run               Simulate actions without making changes
  --verbose, -v           Show detailed output
  --help                  Show help
  --version               Show version

Examples
  $ domain-split analyze src/neural --verbose
  $ domain-split split src/coordination --dry-run
  $ domain-split neural
  $ domain-split validate src/database
`,
  {
    importMeta: import.meta,
    flags: {
      dryRun: {
        type: 'boolean',
        default: false,
      },
      verbose: {
        type: 'boolean',
        shortFlag: 'v',
        default: false,
      },
    },
  },
);

const [command, domainPath] = cli.input;
const options = cli.flags;

if (!command) {
  cli.showHelp();
  process.exit(0);
}

async function executeCommand() {
  try {
    switch (command) {
      case 'analyze':
        await handleAnalyze(domainPath, options);
        break;
      case 'split':
        await handleSplit(domainPath, options);
        break;
      case 'neural':
        await handleNeural(options);
        break;
      case 'validate':
        await handleValidate(domainPath);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        cli.showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Command failed:`, error.message);
    process.exit(1);
  }
}

async function handleAnalyze(domainPath: string, options: any) {
  if (!domainPath) {
    console.error('❌ Domain path is required for analyze command');
    process.exit(1);
  }

  // For now, run the demo analysis
  const demoModule = await import('./demo.js');
  const demo = new demoModule.default();

  // Get full path
  const fullPath = path.resolve(domainPath);
  const analysis = await demo.analyzeDomain(fullPath);

  if (options.verbose) {
    for (const [_category, files] of Object.entries(analysis.filesByCategory)) {
      if (files.length > 0) {
        // Verbose output
      }
    }
    analysis.recommendations.forEach((_rec) => {
      // Verbose recommendations
    });
  }
}

async function handleSplit(domainPath: string, options: any) {
  if (!domainPath) {
    console.error('❌ Domain path is required for split command');
    process.exit(1);
  }

  if (domainPath.includes('neural')) {
    // Run neural domain demonstration
    const demoModule = await import('./demo.js');
    const demo = new demoModule.default();
    await demo.demonstrateNeuralSplitting();
  } else {
    if (options.dryRun) {
    }
    // Handle other domains
  }
}

async function handleNeural(_options: any) {
  const demoModule = await import('./demo.js');
  const demo = new demoModule.default();
  await demo.demonstrateNeuralSplitting();
}

async function handleValidate(domainPath: string) {
  if (!domainPath) {
    console.error('❌ Domain path is required for validate command');
    process.exit(1);
  }

  const fullPath = path.resolve(domainPath);

  if (!(await fs.pathExists(fullPath))) {
    console.error('❌ Domain path does not exist');
    process.exit(1);
  }

  // Basic validation
  const files = await getTypeScriptFiles(fullPath);

  // Check for common issues
  const issues = [];
  if (files.length > 50) {
    issues.push('Domain is very large (>50 files) - consider splitting');
  }

  const testFiles = files.filter((f) => f.includes('.test.') || f.includes('.spec.'));
  if (testFiles.length === 0) {
    issues.push('No test files found');
  }

  const indexFiles = files.filter((f) => path.basename(f) === 'index.ts');
  if (indexFiles.length === 0) {
    issues.push('No index.ts file found');
  }

  if (issues.length === 0) {
  } else {
    issues.forEach((_issue) => {});
  }
}

async function getTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  const scanDirectory = async (currentDir: string): Promise<void> => {
    if (!(await fs.pathExists(currentDir))) return;

    const items = await fs.readdir(currentDir);

    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        await scanDirectory(itemPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(itemPath);
      }
    }
  };

  await scanDirectory(dir);
  return files;
}

// Execute the command
executeCommand();
