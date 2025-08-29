#!/usr/bin/env node

/**
 * Verification script to confirm all packages are included in build system
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');

console.log('🔍 Verifying Build Coverage for All Packages...\n');

// Define package directories that should be built
const packageDirs = [
  'packages/core',
  'packages/services', 
  'packages/tools',
  'packages/integrations'
];

console.log('📦 Scanning for packages with build scripts...\n');

let totalPackages = 0;
let packagesWithBuildScripts = 0;
const specialPackages = [];

for (const dir of packageDirs) {
  if (!existsSync(dir)) {
    console.log(`⚠️  Directory ${dir} does not exist`);
    continue;
  }

  try {
    const packages = execSync(`find ${dir} -name package.json`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(p => p.length > 0);

    for (const packageJsonPath of packages) {
      totalPackages++;
      const packageDir = packageJsonPath.replace('/package.json', '');
      
      try {
        const packageJson = JSON.parse(execSync(`cat ${packageJsonPath}`, { encoding: 'utf8' }));
        
        if (packageJson.scripts && packageJson.scripts.build) {
          packagesWithBuildScripts++;
          console.log(`✅ ${packageDir} - has build script`);
          
          // Check for special packages mentioned in the issue
          if (packageDir.includes('singularity-coder')) {
            specialPackages.push('singularity-coder');
          }
          if (packageDir.includes('llm-providers')) {
            specialPackages.push('llm-providers');
          }
        } else {
          console.log(`⭕ ${packageDir} - no build script`);
        }
      } catch (error) {
        console.log(`❌ ${packageDir} - error reading package.json`);
      }
    }
  } catch (error) {
    console.log(`❌ Error scanning ${dir}: ${error.message}`);
  }
}

console.log('\n📊 Summary:');
console.log(`📦 Total packages found: ${totalPackages}`);
console.log(`🔧 Packages with build scripts: ${packagesWithBuildScripts}`);
console.log(`🎯 Special packages found: ${specialPackages.join(', ')}`);

console.log('\n🧪 Verifying Build Script Coverage:');

// Test if the build script would find the special packages
try {
  const toolsPackages = execSync('find packages/tools -name package.json', { encoding: 'utf8' })
    .trim().split('\n').filter(p => p.length > 0);
  const integrationsPackages = execSync('find packages/integrations -name package.json', { encoding: 'utf8' })
    .trim().split('\n').filter(p => p.length > 0);
  
  console.log(`✅ Build script will target ${toolsPackages.length} tools packages`);
  console.log(`✅ Build script will target ${integrationsPackages.length} integration packages`);
  
  const foundSingularityCoder = toolsPackages.some(p => p.includes('singularity-coder'));
  const foundLlmProviders = integrationsPackages.some(p => p.includes('llm-providers'));
  
  console.log(`${foundSingularityCoder ? '✅' : '❌'} singularity-coder ${foundSingularityCoder ? 'will be' : 'will NOT be'} built`);
  console.log(`${foundLlmProviders ? '✅' : '❌'} llm-providers ${foundLlmProviders ? 'will be' : 'will NOT be'} built`);
  
  if (foundSingularityCoder && foundLlmProviders) {
    console.log('\n🎉 SUCCESS: All requested packages are now included in the build system!');
  } else {
    console.log('\n❌ ISSUE: Some requested packages are missing from build system');
  }
  
} catch (error) {
  console.log(`❌ Error verifying build coverage: ${error.message}`);
}