#!/usr/bin/env node

/**
 * Test the enhanced project management system on our own claude-code-zen monorepo
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Our Own Claude-Code-Zen Monorepo Detection');
console.log('===================================================\n');

try {
  // Import the foundation package
  const { getProjectManager } = require('./dist/index.js');
  
  console.log('✅ Foundation package loaded successfully');
  
  // Our own monorepo path
  const ourMonorepoPath = '/home/mhugo/code/claude-code-zen';
  
  // Clear existing registration and register fresh
  console.log('🧹 Clearing existing project registrations...');
  const projectManager = getProjectManager();
  
  // Register our monorepo
  console.log('🚀 Registering our claude-code-zen monorepo...');
  const projectId = projectManager.registerProjectSync(ourMonorepoPath, {
    name: 'Claude-Code-Zen Monorepo',
    description: 'Our own TypeScript/Rust swarm system with 21 production libraries',
    framework: 'TypeScript',
    language: 'TypeScript'
  });
  
  console.log(`✅ Project registered with ID: ${projectId}`);
  
  // Get detailed project info
  const project = projectManager.getProject(projectId);
  if (project) {
    console.log('\n📊 Our Monorepo Detection Results:');
    console.log('==================================');
    console.log(`Name: ${project.name}`);
    console.log(`Path: ${project.path}`);
    console.log(`Git Remote: ${project.gitRemote || 'Not detected'}`);
    console.log(`Framework: ${project.framework}`);
    console.log(`Language: ${project.language}`);
    
    if (project.workspace) {
      console.log('\n🏗️  Our Workspace Analysis:');
      console.log(`Type: ${project.workspace.type}`);
      console.log(`Build System: ${project.workspace.buildSystem}`);
      console.log(`Workspace File: ${project.workspace.workspaceFile}`);
      
      if (project.workspace.structure) {
        console.log('\n📁 Our Directory Structure:');
        const structure = project.workspace.structure;
        console.log(`Has Apps: ${structure.hasApps}`);
        console.log(`Has Packages: ${structure.hasPackages}`);
        console.log(`Has Libs: ${structure.hasLibs}`);
        console.log(`Has Services: ${structure.hasServices}`);
        console.log(`Has Domains: ${structure.hasDomains}`);
        console.log(`Has Monolib: ${structure.hasMonolib}`);
        console.log(`Custom Dirs: ${structure.customDirs?.join(', ') || 'none'}`);
      }
      
      if (project.workspace.subProjects && project.workspace.subProjects.length > 0) {
        console.log(`\n📦 Our Sub-projects detected: ${project.workspace.subProjects.length}`);
        
        // Group by type
        const byType = {};
        project.workspace.subProjects.forEach(subProject => {
          if (!byType[subProject.type]) byType[subProject.type] = [];
          byType[subProject.type].push(subProject);
        });
        
        console.log('\n📊 Breakdown by Type:');
        Object.entries(byType).forEach(([type, projects]) => {
          console.log(`   ${type.padEnd(12)}: ${projects.length.toString().padStart(3)} projects`);
        });
        
        console.log('\n🔍 First 25 sub-projects:');
        project.workspace.subProjects.slice(0, 25).forEach((subProject, i) => {
          console.log(`  ${(i + 1).toString().padStart(2)}. ${subProject.name.padEnd(35)} (${subProject.type.padEnd(9)}) - ${subProject.path}`);
        });
        if (project.workspace.subProjects.length > 25) {
          console.log(`  ... and ${project.workspace.subProjects.length - 25} more`);
        }
      } else {
        console.log('\n❌ No sub-projects detected - this suggests an issue with our detection!');
      }
    }
  }
  
  // Compare with actual package count
  console.log('\n🔢 Reality Check:');
  console.log('=================');
  
  // Count actual packages in our monorepo
  const { execSync } = require('child_process');
  try {
    const actualPackageCount = execSync('find /home/mhugo/code/claude-code-zen -name "package.json" | wc -l', { encoding: 'utf8' }).trim();
    const detectedCount = project?.workspace?.subProjects?.length || 0;
    
    console.log(`📁 Actual package.json files: ${actualPackageCount}`);
    console.log(`🔍 Detected sub-projects: ${detectedCount}`);
    console.log(`📊 Detection rate: ${((detectedCount / parseInt(actualPackageCount)) * 100).toFixed(1)}%`);
    
    if (detectedCount < parseInt(actualPackageCount) * 0.5) {
      console.log('⚠️  Low detection rate suggests algorithm needs improvement');
    } else if (detectedCount >= parseInt(actualPackageCount) * 0.8) {
      console.log('✅ Good detection rate!');
    } else {
      console.log('📈 Moderate detection rate - room for improvement');
    }
  } catch (error) {
    console.log('❌ Could not run reality check:', error.message);
  }
  
  console.log('\n💡 Insights:');
  console.log('============');
  console.log('- Our monorepo has apps/ and packages/ structure');
  console.log('- Should detect TypeScript packages, apps, and potentially test files');
  console.log('- Detection algorithm effectiveness can be measured against actual file count');
  console.log('- Next.js comparison: We have more packages but similar structure patterns');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}