#!/usr/bin/env node

/**
 * Test script for enhanced project registration with Next.js monorepo
 * This demonstrates how the claude-zen project management system works
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('🧪 Testing Enhanced Project Registration with Next.js Monorepo');
console.log('============================================================\n');

// Set up paths
const claudeZenRoot = '/home/mhugo/code/claude-code-zen';
const testRepoPath = '/home/mhugo/code/test-nextjs-monorepo';
const homeConfigPath = path.join(os.homedir(), '.claude-zen');

console.log('📁 Paths:');
console.log(`   Claude-Zen Root: ${claudeZenRoot}`);
console.log(`   Test Repository: ${testRepoPath}`);
console.log(`   Home Config: ${homeConfigPath}\n`);

// Test 1: Check if test repository exists
console.log('🔍 Test 1: Verify test repository structure');
if (fs.existsSync(testRepoPath)) {
  console.log('   ✅ Test repository exists');
  
  // Check for monorepo indicators
  const monorepoFiles = [
    'pnpm-workspace.yaml',
    'lerna.json', 
    'package.json',
    'turbo.json'
  ];
  
  const foundFiles = monorepoFiles.filter(file => 
    fs.existsSync(path.join(testRepoPath, file))
  );
  
  console.log(`   ✅ Monorepo files found: ${foundFiles.join(', ')}`);
  
  // Check for standard directories
  const standardDirs = ['packages', 'apps', 'docs', 'examples'];
  const foundDirs = standardDirs.filter(dir => 
    fs.existsSync(path.join(testRepoPath, dir))
  );
  
  console.log(`   ✅ Standard directories: ${foundDirs.join(', ')}\n`);
} else {
  console.log('   ❌ Test repository not found\n');
  process.exit(1);
}

// Test 2: Try to load and use the project manager
console.log('🔧 Test 2: Load foundation package and register project');
try {
  // Change to foundation directory and require the module
  process.chdir(path.join(claudeZenRoot, 'packages', 'foundation'));
  
  // Try to import - this will test if our TypeScript fixes work
  const { getProjectManager, findProjectRoot } = require('./dist/index.js');
  
  console.log('   ✅ Foundation package loaded successfully');
  
  // Get project manager instance
  const projectManager = getProjectManager();
  console.log('   ✅ Project manager instance created');
  
  // Register the test repository
  console.log('   🚀 Registering test repository...');
  const projectId = projectManager.registerProjectSync(testRepoPath, {
    name: 'Next.js Test Monorepo',
    description: 'Test project for enhanced monorepo detection',
    framework: 'Next.js',
    language: 'TypeScript'
  });
  
  console.log(`   ✅ Project registered with ID: ${projectId}`);
  
  // Get detailed project info
  const project = projectManager.getProject(projectId);
  if (project) {
    console.log('\n📊 Project Details:');
    console.log(`   Name: ${project.name}`);
    console.log(`   Path: ${project.path}`);
    console.log(`   Workspace Type: ${project.workspace?.type}`);
    console.log(`   Build System: ${project.workspace?.buildSystem}`);
    console.log(`   Workspace File: ${project.workspace?.workspaceFile}`);
    
    if (project.workspace?.structure) {
      console.log('\n🏗️  Structure Analysis:');
      const structure = project.workspace.structure;
      console.log(`   Has Apps: ${structure.hasApps}`);
      console.log(`   Has Packages: ${structure.hasPackages}`);
      console.log(`   Has Libs: ${structure.hasLibs}`);
      console.log(`   Custom Dirs: ${structure.customDirs?.join(', ') || 'none'}`);
    }
    
    if (project.workspace?.subProjects) {
      console.log(`\n📦 Sub-projects detected: ${project.workspace.subProjects.length}`);
      project.workspace.subProjects.slice(0, 10).forEach((subProject, i) => {
        console.log(`   ${i + 1}. ${subProject.name} (${subProject.type}) - ${subProject.path}`);
      });
      if (project.workspace.subProjects.length > 10) {
        console.log(`   ... and ${project.workspace.subProjects.length - 10} more`);
      }
    }
  }
  
} catch (error) {
  console.log('   ❌ Error loading foundation package:');
  console.log(`   ${error.message}`);
  console.log('\n   This might be expected if the package needs to be built first.');
}

// Test 3: Check home directory structure
console.log('\n🏠 Test 3: Check home directory structure');
if (fs.existsSync(homeConfigPath)) {
  console.log('   ✅ ~/.claude-zen directory exists');
  
  // Check projects.json
  const projectsJsonPath = path.join(homeConfigPath, 'projects.json');
  if (fs.existsSync(projectsJsonPath)) {
    console.log('   ✅ projects.json exists');
    
    try {
      const projectsData = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));
      const projectCount = Object.keys(projectsData.projects || {}).length;
      console.log(`   ✅ Registered projects: ${projectCount}`);
      
      // Show project structure
      const projectsDir = path.join(homeConfigPath, 'projects');
      if (fs.existsSync(projectsDir)) {
        const projectDirs = fs.readdirSync(projectsDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        console.log(`   ✅ Project directories: ${projectDirs.length}`);
        projectDirs.forEach(dir => {
          const dbPath = path.join(projectsDir, dir, 'workspace.db');
          const memoryPath = path.join(projectsDir, dir, 'memory');
          const cachePath = path.join(projectsDir, dir, 'cache');
          
          console.log(`     📁 ${dir}/`);
          console.log(`        ${fs.existsSync(dbPath) ? '✅' : '❌'} workspace.db`);
          console.log(`        ${fs.existsSync(memoryPath) ? '✅' : '❌'} memory/`);
          console.log(`        ${fs.existsSync(cachePath) ? '✅' : '❌'} cache/`);
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Error reading projects.json: ${error.message}`);
    }
  } else {
    console.log('   ❌ projects.json not found');
  }
} else {
  console.log('   ❌ ~/.claude-zen directory not found');
  console.log('   This will be created automatically when the project manager is first used');
}

console.log('\n✨ Test Complete!');
console.log('\nTo see the project in action:');
console.log('1. cd /home/mhugo/code/test-nextjs-monorepo');
console.log('2. The system will automatically detect this as a registered project');
console.log('3. Individual sub-packages will be recognized within the monorepo context');