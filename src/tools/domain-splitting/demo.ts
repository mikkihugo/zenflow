#!/usr/bin/env tsx
/**
 * Demo script for domain splitting functionality
 * Demonstrates analysis and splitting capabilities without requiring full build
 */

import fs from 'fs-extra';
import path from 'path';

// Simple implementation for demo purposes
interface DomainAnalysisResult {
  domainPath: string;
  totalFiles: number;
  filesByCategory: { [category: string]: string[] };
  complexityScore: number;
  recommendations: string[];
}

interface SplittingPlan {
  sourceDomain: string;
  targetSubDomains: Array<{
    name: string;
    description: string;
    files: string[];
  }>;
}

export default class DomainSplittingDemo {
  async analyzeDomain(domainPath: string): Promise<DomainAnalysisResult> {
    console.log(`🔍 Analyzing domain: ${domainPath}`);

    // Get all TypeScript files in the domain
    const files = await this.getTypeScriptFiles(domainPath);
    console.log(`📁 Found ${files.length} TypeScript files`);

    // Categorize files based on directory structure and naming patterns
    const filesByCategory = await this.categorizeFiles(files);

    // Calculate complexity based on file count and structure
    const complexityScore = this.calculateComplexity(files, filesByCategory);

    // Generate recommendations
    const recommendations = this.generateRecommendations(files, filesByCategory);

    return {
      domainPath,
      totalFiles: files.length,
      filesByCategory,
      complexityScore,
      recommendations,
    };
  }

  async demonstrateNeuralSplitting(): Promise<void> {
    console.log('🎯 Neural Domain Splitting Demonstration');
    console.log('='.repeat(50));

    const neuralPath = path.join(process.cwd(), 'src/neural');

    if (!(await fs.pathExists(neuralPath))) {
      console.log('❌ Neural domain not found at src/neural');
      return;
    }

    // Step 1: Analyze current structure
    const analysis = await this.analyzeDomain(neuralPath);
    this.displayAnalysis(analysis);

    // Step 2: Generate splitting plan
    const plan = this.generateNeuralSplittingPlan(analysis);
    this.displaySplittingPlan(plan);

    // Step 3: Simulate the splitting process
    console.log('\n🚀 Simulating Domain Split Process');
    console.log('-'.repeat(40));
    await this.simulateSplitting(plan);

    console.log('\n✅ Demo completed successfully!');
    console.log('\n📚 What would happen in a real split:');
    console.log('  - Files would be moved to new sub-domain directories');
    console.log('  - Import paths would be automatically updated');
    console.log('  - Index.ts files would be generated for each sub-domain');
    console.log('  - Build integrity would be validated');
    console.log('  - Rollback would be available if issues occur');
  }

  private async getTypeScriptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (currentDir: string): Promise<void> => {
      if (!(await fs.pathExists(currentDir))) return;

      const items = await fs.readdir(currentDir);

      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          await scanDirectory(itemPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
          files.push(itemPath);
        }
      }
    };

    await scanDirectory(dir);
    return files;
  }

  private async categorizeFiles(files: string[]): Promise<{ [category: string]: string[] }> {
    const categories = {
      'core-algorithms': [] as string[],
      models: [] as string[],
      agents: [] as string[],
      coordination: [] as string[],
      wasm: [] as string[],
      bridge: [] as string[],
      utilities: [] as string[],
      tests: [] as string[],
      other: [] as string[],
    };

    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const filename = path.basename(file).toLowerCase();
      const directory = path.dirname(relativePath).toLowerCase();

      if (filename.includes('test') || filename.includes('spec')) {
        categories.tests.push(file);
      } else if (
        directory.includes('core') ||
        filename.includes('core') ||
        filename.includes('network')
      ) {
        categories['core-algorithms'].push(file);
      } else if (
        directory.includes('model') ||
        directory.includes('preset') ||
        filename.includes('model')
      ) {
        categories.models.push(file);
      } else if (directory.includes('agent') || filename.includes('agent')) {
        categories.agents.push(file);
      } else if (directory.includes('coordination') || filename.includes('coordination')) {
        categories.coordination.push(file);
      } else if (directory.includes('wasm') || filename.includes('wasm')) {
        categories.wasm.push(file);
      } else if (filename.includes('bridge') || filename.includes('index')) {
        categories.bridge.push(file);
      } else if (filename.includes('util') || filename.includes('helper')) {
        categories.utilities.push(file);
      } else {
        categories.other.push(file);
      }
    }

    return categories;
  }

  private calculateComplexity(
    files: string[],
    categories: { [category: string]: string[] }
  ): number {
    const fileCount = files.length;
    const categoryCount = Object.values(categories).filter((cat) => cat.length > 0).length;
    const avgFilesPerCategory = fileCount / Math.max(categoryCount, 1);

    // Complexity based on file count and distribution
    let complexity = Math.log(fileCount) / Math.log(10); // Log scale for file count

    // Add complexity for uneven distribution
    if (avgFilesPerCategory > 10) {
      complexity += 2;
    } else if (avgFilesPerCategory > 5) {
      complexity += 1;
    }

    // Add complexity for many categories
    if (categoryCount > 5) {
      complexity += 1;
    }

    return Math.round(complexity * 10) / 10;
  }

  private generateRecommendations(
    files: string[],
    categories: { [category: string]: string[] }
  ): string[] {
    const recommendations: string[] = [];

    if (files.length > 15) {
      recommendations.push('Consider splitting this domain - it has grown quite large');
    }

    // Check for categories with many files
    for (const [category, categoryFiles] of Object.entries(categories)) {
      if (categoryFiles.length > 8) {
        recommendations.push(
          `${category} category has ${categoryFiles.length} files - consider sub-dividing`
        );
      }
    }

    if (categories.other.length > 3) {
      recommendations.push('Several files are uncategorized - consider better organization');
    }

    if (recommendations.length === 0) {
      recommendations.push('Domain structure looks well-organized');
    }

    return recommendations;
  }

  private generateNeuralSplittingPlan(analysis: DomainAnalysisResult): SplittingPlan {
    return {
      sourceDomain: 'neural',
      targetSubDomains: [
        {
          name: 'neural-core',
          description: 'Core neural network algorithms and primitives',
          files: analysis.filesByCategory['core-algorithms'] || [],
        },
        {
          name: 'neural-models',
          description: 'Neural network models, architectures, and presets',
          files: analysis.filesByCategory['models'] || [],
        },
        {
          name: 'neural-agents',
          description: 'Neural-specific agent implementations',
          files: analysis.filesByCategory['agents'] || [],
        },
        {
          name: 'neural-coordination',
          description: 'Neural coordination protocols and systems',
          files: analysis.filesByCategory['coordination'] || [],
        },
        {
          name: 'neural-wasm',
          description: 'WASM integration and Rust computational core',
          files: analysis.filesByCategory['wasm'] || [],
        },
        {
          name: 'neural-bridge',
          description: 'Bridge functionality and integration layers',
          files: [
            ...(analysis.filesByCategory['bridge'] || []),
            ...(analysis.filesByCategory['utilities'] || []),
          ],
        },
      ],
    };
  }

  private displayAnalysis(analysis: DomainAnalysisResult): void {
    console.log('\n📊 Domain Analysis Results');
    console.log('-'.repeat(30));
    console.log(`📁 Total Files: ${analysis.totalFiles}`);
    console.log(`🎯 Complexity Score: ${analysis.complexityScore}/10`);

    console.log('\n📂 Files by Category:');
    for (const [category, files] of Object.entries(analysis.filesByCategory)) {
      if (files.length > 0) {
        console.log(`  ${category}: ${files.length} files`);
        files.forEach((file) => {
          const relativePath = path.relative(process.cwd(), file);
          console.log(`    - ${relativePath}`);
        });
      }
    }

    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach((rec) => {
      console.log(`  • ${rec}`);
    });
  }

  private displaySplittingPlan(plan: SplittingPlan): void {
    console.log('\n📋 Proposed Splitting Plan');
    console.log('-'.repeat(30));
    console.log(`Source Domain: ${plan.sourceDomain}`);
    console.log(`Target Sub-domains: ${plan.targetSubDomains.length}`);

    for (const subdomain of plan.targetSubDomains) {
      console.log(`\n🎯 ${subdomain.name}`);
      console.log(`   Description: ${subdomain.description}`);
      console.log(`   Files: ${subdomain.files.length}`);

      if (subdomain.files.length > 0) {
        subdomain.files.forEach((file) => {
          const filename = path.basename(file);
          console.log(`     - ${filename}`);
        });
      }
    }
  }

  private async simulateSplitting(plan: SplittingPlan): Promise<void> {
    const totalFiles = plan.targetSubDomains.reduce((sum, sub) => sum + sub.files.length, 0);

    console.log(`📦 Creating backup...`);
    await this.delay(500);
    console.log(`✅ Backup created`);

    console.log(`📁 Creating ${plan.targetSubDomains.length} sub-domain directories...`);
    await this.delay(300);
    for (const subdomain of plan.targetSubDomains) {
      console.log(`   ✓ Created src/${subdomain.name}/`);
      await this.delay(100);
    }

    console.log(`🔄 Moving ${totalFiles} files...`);
    let moved = 0;
    for (const subdomain of plan.targetSubDomains) {
      for (const file of subdomain.files) {
        moved++;
        const filename = path.basename(file);
        console.log(`   ✓ ${filename} → ${subdomain.name}/`);
        await this.delay(50);
      }
    }

    console.log(`🔗 Updating import paths...`);
    await this.delay(800);
    console.log(`   ✓ Updated ${Math.floor(totalFiles * 0.6)} import statements`);

    console.log(`📄 Generating index files...`);
    await this.delay(400);
    for (const subdomain of plan.targetSubDomains) {
      console.log(`   ✓ Generated ${subdomain.name}/index.ts`);
      await this.delay(100);
    }

    console.log(`🔍 Validating split integrity...`);
    await this.delay(1000);
    console.log(`   ✓ No circular dependencies detected`);
    console.log(`   ✓ All imports resolved successfully`);
    console.log(`   ✓ Build validation passed`);

    console.log(`🧹 Cleaning up backup...`);
    await this.delay(200);
    console.log(`✅ Split completed successfully!`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run the demonstration
async function main() {
  try {
    const demo = new DomainSplittingDemo();
    await demo.demonstrateNeuralSplitting();
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
