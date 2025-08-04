#!/usr/bin/env node

/**
 * Test script for monorepo detection in ProjectContextAnalyzer
 */

import ProjectContextAnalyzer from './project-context-analyzer';

async function testMonorepoDetection(projectPath: string) {
  console.log(`\n🔍 Testing monorepo detection for: ${projectPath}\n`);

  const analyzer = new ProjectContextAnalyzer({
    projectRoot: projectPath,
    swarmConfig: {
      // Minimal config for testing
      name: 'test-analyzer',
      type: 'knowledge',
      maxAgents: 1
    },
    analysisDepth: 'shallow',
    autoUpdate: false,
    cacheDuration: 1
  });

  // Listen for monorepo detection events
  analyzer.on('monorepoDetected', (data) => {
    console.log('📦 Monorepo detected!');
    console.log(`   Type: ${data.type}`);
    console.log(`   Confidence: ${(data.confidence * 100).toFixed(1)}%`);
    console.log(`   Packages: ${data.packages?.join(', ') || 'N/A'}`);
  });

  try {
    // Initialize analyzer (which will run monorepo detection)
    await analyzer.initialize();

    // Get monorepo info
    const monorepoInfo = analyzer.getMonorepoInfo();
    
    if (monorepoInfo && monorepoInfo.type !== 'none') {
      console.log('\n✅ Monorepo Analysis Results:');
      console.log(`   Type: ${monorepoInfo.type}`);
      console.log(`   Tool: ${monorepoInfo.tool || 'N/A'}`);
      console.log(`   Version: ${monorepoInfo.version || 'N/A'}`);
      console.log(`   Config File: ${monorepoInfo.configFile || 'N/A'}`);
      console.log(`   Confidence: ${(monorepoInfo.confidence * 100).toFixed(1)}%`);
      console.log(`   Has Root package.json: ${monorepoInfo.hasRootPackageJson}`);
      console.log(`   Package Manager: ${monorepoInfo.packageManager || 'N/A'}`);
      
      if (monorepoInfo.workspaces) {
        console.log(`   Workspaces: ${monorepoInfo.workspaces.join(', ')}`);
      }
      
      if (monorepoInfo.packages) {
        console.log(`   Packages: ${monorepoInfo.packages.join(', ')}`);
      }
    } else {
      console.log('\n❌ Not detected as a monorepo');
    }

    // Check with custom confidence threshold
    const isHighConfidenceMonorepo = analyzer.isMonorepo(0.8);
    console.log(`\n🎯 Is high-confidence monorepo (>80%)? ${isHighConfidenceMonorepo ? 'Yes' : 'No'}`);

    // Get full project context
    const status = analyzer.getStatus();
    console.log('\n📊 Project Context Summary:');
    console.log(`   Dependencies: ${status.projectContext?.dependencies.length || 0}`);
    console.log(`   Dev Dependencies: ${status.projectContext?.devDependencies.length || 0}`);
    console.log(`   Frameworks: ${status.projectContext?.frameworks.map(f => f.name).join(', ') || 'None'}`);
    console.log(`   Languages: ${status.projectContext?.languages.map(l => l.name).join(', ') || 'None'}`);

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await analyzer.shutdown();
  }
}

// Main execution
async function main() {
  const projectPath = process.argv[2] || process.cwd();
  
  console.log('🚀 Monorepo Detection Test');
  console.log('==========================');
  
  await testMonorepoDetection(projectPath);
  
  console.log('\n✨ Test complete!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { testMonorepoDetection };