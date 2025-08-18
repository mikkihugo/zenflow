/**
 * Test package isolation from workspace context
 * This test verifies the architectural boundaries we've set up
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔒 Testing Package Isolation from Workspace Context...');

// Check if packages are marked as private
function checkPackagePrivacy(packageName, shouldBePrivate) {
  const packagePath = join(__dirname, 'packages', packageName.replace('@claude-zen/', ''), 'package.json');
  
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const isPrivate = packageJson.private === true;
    
    console.log(`\n📦 ${packageName}:`);
    console.log(`   Private: ${isPrivate}`);
    console.log(`   Expected Private: ${shouldBePrivate}`);
    
    if (isPrivate === shouldBePrivate) {
      console.log(`   ✅ Correct privacy setting`);
      return true;
    } else {
      console.log(`   ❌ Wrong privacy setting`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot read package.json: ${error.message}`);
    return false;
  }
}

// Check dependencies
function checkDependency(parentPackage, childPackage) {
  const packagePath = join(__dirname, 'packages', parentPackage.replace('@claude-zen/', ''), 'package.json');
  
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.optionalDependencies };
    const hasDependency = dependencies[childPackage];
    
    console.log(`\n🔗 ${parentPackage} → ${childPackage}:`);
    console.log(`   Has dependency: ${!!hasDependency}`);
    
    if (hasDependency) {
      console.log(`   ✅ Correct: ${parentPackage} can access ${childPackage}`);
      return true;
    } else {
      console.log(`   ❌ Missing dependency`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot read package.json: ${error.message}`);
    return false;
  }
}

let success = true;

console.log('\n🔐 Testing Privacy Settings:');

// Test that private packages are marked as private
success &= checkPackagePrivacy('@claude-zen/neural-ml', true);
success &= checkPackagePrivacy('@claude-zen/database', true);
success &= checkPackagePrivacy('@claude-zen/dspy', true);

// Test that public packages are not marked as private
success &= checkPackagePrivacy('@claude-zen/foundation', false);
success &= checkPackagePrivacy('@claude-zen/brain', false);

console.log('\n🔗 Testing Dependency Relationships:');

// Test that brain has neural-ml as dependency
success &= checkDependency('@claude-zen/brain', '@claude-zen/neural-ml');

// Test that brain has dspy as dependency
success &= checkDependency('@claude-zen/brain', '@claude-zen/dspy');

// Test that foundation has database as dependency  
success &= checkDependency('@claude-zen/foundation', '@claude-zen/database');

if (success) {
  console.log('\n🎉 Package isolation architecture is correctly configured!');
  console.log('✅ Private packages (@claude-zen/neural-ml, @claude-zen/database, @claude-zen/dspy) are marked private');
  console.log('✅ Public packages (@claude-zen/brain, @claude-zen/foundation) are not private');
  console.log('✅ Correct dependency relationships established');
  console.log('   - Brain controls neural-ml and dspy');
  console.log('   - Foundation controls database');
  console.log('🔒 Architectural boundaries enforced');
} else {
  console.log('\n❌ Package isolation architecture has issues!');
  process.exit(1);
}