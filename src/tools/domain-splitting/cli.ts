#!/usr/bin/env tsx
/**
 * CLI command for domain splitting operations
 */

import { program } from 'commander';
import path from 'path';

// Import the demo for now since full implementation has build dependencies
import fs from 'fs-extra';

interface CliOptions {
  domain?: string;
  analyze?: boolean;
  split?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

program
  .name('domain-split')
  .description('Domain splitting tool for managing large codebases')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a domain for splitting opportunities')
  .argument('<domain-path>', 'Path to domain directory (e.g., src/neural)')
  .option('-v, --verbose', 'Show detailed analysis')
  .action(async (domainPath: string, options: any) => {
    console.log(`🔍 Analyzing domain: ${domainPath}`);
    
    try {
      // For now, run the demo analysis
      const demoModule = await import('./demo.js');
      const demo = new demoModule.default();
      
      // Get full path
      const fullPath = path.resolve(domainPath);
      const analysis = await demo.analyzeDomain(fullPath);
      
      console.log('\n📊 Analysis Results:');
      console.log(`  Total Files: ${analysis.totalFiles}`);
      console.log(`  Complexity Score: ${analysis.complexityScore}/10`);
      console.log(`  Recommendations: ${analysis.recommendations.length}`);
      
      if (options.verbose) {
        console.log('\n📂 File Categories:');
        for (const [category, files] of Object.entries(analysis.filesByCategory)) {
          if (files.length > 0) {
            console.log(`  ${category}: ${files.length} files`);
          }
        }
        
        console.log('\n💡 Recommendations:');
        analysis.recommendations.forEach(rec => console.log(`  • ${rec}`));
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('split')
  .description('Split a domain into sub-domains')
  .argument('<domain-path>', 'Path to domain directory')
  .option('--dry-run', 'Simulate split without making changes')
  .option('-v, --verbose', 'Show detailed progress')
  .action(async (domainPath: string, options: any) => {
    console.log(`🚀 ${options.dryRun ? 'Simulating' : 'Executing'} domain split: ${domainPath}`);
    
    if (domainPath.includes('neural')) {
      // Run neural domain demonstration
      try {
        const demoModule = await import('./demo.js');
        const demo = new demoModule.default();
        await demo.demonstrateNeuralSplitting();
      } catch (error) {
        console.error('❌ Split failed:', error.message);
        process.exit(1);
      }
    } else {
      console.log('🚧 Full splitting implementation available for neural domain');
      console.log('For other domains, use --dry-run for simulation');
      
      if (options.dryRun) {
        console.log('📋 Dry run completed - no changes made');
      }
    }
  });

program
  .command('neural')
  .description('Split the neural domain using predefined plan')
  .option('--dry-run', 'Simulate split without making changes')
  .action(async (options: any) => {
    console.log(`🧠 Neural domain splitting ${options.dryRun ? '(simulation)' : ''}`);
    
    try {
      const demoModule = await import('./demo.js');
      const demo = new demoModule.default();
      await demo.demonstrateNeuralSplitting();
    } catch (error) {
      console.error('❌ Neural split failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate domain structure and dependencies')
  .argument('<domain-path>', 'Path to domain directory')
  .action(async (domainPath: string) => {
    console.log(`✅ Validating domain: ${domainPath}`);
    
    const fullPath = path.resolve(domainPath);
    
    if (!await fs.pathExists(fullPath)) {
      console.error('❌ Domain path does not exist');
      process.exit(1);
    }
    
    // Basic validation
    const files = await getTypeScriptFiles(fullPath);
    console.log(`📁 Found ${files.length} TypeScript files`);
    
    // Check for common issues
    const issues = [];
    if (files.length > 50) {
      issues.push('Domain is very large (>50 files) - consider splitting');
    }
    
    const testFiles = files.filter(f => f.includes('.test.') || f.includes('.spec.'));
    if (testFiles.length === 0) {
      issues.push('No test files found');
    }
    
    const indexFiles = files.filter(f => path.basename(f) === 'index.ts');
    if (indexFiles.length === 0) {
      issues.push('No index.ts file found');
    }
    
    if (issues.length === 0) {
      console.log('✅ Domain structure looks good');
    } else {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => console.log(`  • ${issue}`));
    }
  });

async function getTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  const scanDirectory = async (currentDir: string): Promise<void> => {
    if (!await fs.pathExists(currentDir)) return;
    
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

// Parse and execute
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}