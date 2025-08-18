/**
 * Comprehensive Gateway Architecture Test
 * Tests the complete private package isolation system
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🏗️ Testing Complete Gateway Architecture...');

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
function checkDependency(parentPackage, childPackage, isDependency = true) {
  const packagePath = join(__dirname, 'packages', parentPackage.replace('@claude-zen/', ''), 'package.json');
  
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const dependencies = { 
      ...packageJson.dependencies, 
      ...packageJson.optionalDependencies 
    };
    const hasDependency = dependencies[childPackage];
    
    console.log(`\n🔗 ${parentPackage} → ${childPackage}:`);
    console.log(`   Has dependency: ${!!hasDependency}`);
    console.log(`   Expected: ${isDependency}`);
    
    if (!!hasDependency === isDependency) {
      if (isDependency) {
        console.log(`   ✅ Correct: ${parentPackage} can access ${childPackage}`);
      } else {
        console.log(`   ✅ Correct: ${parentPackage} does not depend on ${childPackage}`);
      }
      return true;
    } else {
      console.log(`   ❌ Dependency relationship incorrect`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot read package.json: ${error.message}`);
    return false;
  }
}

let success = true;

console.log('\n🔐 TESTING PRIVACY SETTINGS:');

// Private packages (implementation details)
console.log('\n--- PRIVATE PACKAGES (Implementation Details) ---');
success &= checkPackagePrivacy('@claude-zen/neural-ml', true);
success &= checkPackagePrivacy('@claude-zen/database', true);
success &= checkPackagePrivacy('@claude-zen/dspy', true);
success &= checkPackagePrivacy('@claude-zen/agent-monitoring', true);
success &= checkPackagePrivacy('@claude-zen/load-balancing', true);
success &= checkPackagePrivacy('@claude-zen/chaos-engineering', true);
success &= checkPackagePrivacy('@claude-zen/fact-system', true);

// Gateway packages (intelligent coordinators)
console.log('\n--- GATEWAY PACKAGES (Intelligent Coordinators) ---');
success &= checkPackagePrivacy('@claude-zen/brain', false);
success &= checkPackagePrivacy('@claude-zen/foundation', false);
success &= checkPackagePrivacy('@claude-zen/ai-safety', false);
success &= checkPackagePrivacy('@claude-zen/knowledge', false);

// Public packages (standalone utilities)
console.log('\n--- PUBLIC PACKAGES (Standalone Utilities) ---');
success &= checkPackagePrivacy('@claude-zen/event-system', false);
success &= checkPackagePrivacy('@claude-zen/agui', false);
success &= checkPackagePrivacy('@claude-zen/teamwork', false);
success &= checkPackagePrivacy('@claude-zen/workflows', false);
success &= checkPackagePrivacy('@claude-zen/agent-manager', false);

console.log('\n🔗 TESTING DEPENDENCY RELATIONSHIPS:');

// Brain gateway dependencies
console.log('\n--- BRAIN GATEWAY (Intelligence Coordinator) ---');
success &= checkDependency('@claude-zen/brain', '@claude-zen/neural-ml', true);
success &= checkDependency('@claude-zen/brain', '@claude-zen/dspy', true);
success &= checkDependency('@claude-zen/brain', '@claude-zen/agent-monitoring', true);
success &= checkDependency('@claude-zen/brain', '@claude-zen/load-balancing', true);

// Foundation gateway dependencies
console.log('\n--- FOUNDATION GATEWAY (Infrastructure Coordinator) ---');
success &= checkDependency('@claude-zen/foundation', '@claude-zen/database', true);

// AI-Safety gateway dependencies
console.log('\n--- AI-SAFETY GATEWAY (Safety Coordinator) ---');
success &= checkDependency('@claude-zen/ai-safety', '@claude-zen/chaos-engineering', true);

// Knowledge gateway dependencies
console.log('\n--- KNOWLEDGE GATEWAY (Knowledge Coordinator) ---');
success &= checkDependency('@claude-zen/knowledge', '@claude-zen/fact-system', true);

// Test that private packages are NOT accessible to other packages
console.log('\n❌ TESTING ISOLATION (Private packages should NOT be dependencies of others):');
success &= checkDependency('@claude-zen/agent-manager', '@claude-zen/neural-ml', false);
success &= checkDependency('@claude-zen/teamwork', '@claude-zen/database', false);
success &= checkDependency('@claude-zen/workflows', '@claude-zen/dspy', false);

// Final results
if (success) {
  console.log('\n🎉 COMPLETE GATEWAY ARCHITECTURE TEST PASSED!');
  console.log('\n✅ SUMMARY:');
  console.log('🔒 PRIVATE PACKAGES (7):');
  console.log('   - @claude-zen/neural-ml');
  console.log('   - @claude-zen/database'); 
  console.log('   - @claude-zen/dspy');
  console.log('   - @claude-zen/agent-monitoring');
  console.log('   - @claude-zen/load-balancing');
  console.log('   - @claude-zen/chaos-engineering');
  console.log('   - @claude-zen/fact-system');
  
  console.log('\n🌐 GATEWAY PACKAGES (4):');
  console.log('   - @claude-zen/brain (controls: neural-ml, dspy, agent-monitoring, load-balancing)');
  console.log('   - @claude-zen/foundation (controls: database)');
  console.log('   - @claude-zen/ai-safety (controls: chaos-engineering)');
  console.log('   - @claude-zen/knowledge (controls: fact-system)');
  
  console.log('\n✅ PUBLIC PACKAGES (5):');
  console.log('   - @claude-zen/event-system (core infrastructure)');
  console.log('   - @claude-zen/agui (user interface)');
  console.log('   - @claude-zen/teamwork (collaboration)');
  console.log('   - @claude-zen/workflows (process orchestration)');
  console.log('   - @claude-zen/agent-manager (simple swarm orchestrator)');
  
  console.log('\n🏗️ ARCHITECTURAL BENEFITS:');
  console.log('   ✅ Clean separation of concerns');
  console.log('   ✅ Intelligent coordination through gateways');
  console.log('   ✅ Implementation details properly hidden');
  console.log('   ✅ Gateway packages can make optimal routing decisions');
  console.log('   ✅ Maintainable and extensible architecture');
} else {
  console.log('\n❌ GATEWAY ARCHITECTURE TEST FAILED!');
  console.log('Some packages do not conform to the expected gateway pattern.');
  process.exit(1);
}