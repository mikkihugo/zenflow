#!/usr/bin/env node

/**
 * Architecture Validation Script
 * 
 * Enforces the 3-tier package architecture:
 * - Tier 1: Public API (Strategic Facades + Foundation)
 * - Tier 2: Internal Implementation Packages
 * - Tier 3: Deep Internal Packages (only accessible by specific packages)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const TIER_1_PUBLIC = [
  '@claude-zen/foundation',
  '@claude-zen/llm-providers',
  '@claude-zen/infrastructure',
  '@claude-zen/intelligence', 
  '@claude-zen/enterprise',
  '@claude-zen/operations',
  '@claude-zen/development'
];

const TIER_3_DEEP_INTERNAL = {
  '@claude-zen/dspy': ['@claude-zen/brain'],
  '@claude-zen/neural-ml': ['@claude-zen/brain'],
  '@claude-zen/fact-system': ['@claude-zen/knowledge']
};

const FORBIDDEN_DEPENDENCIES = {
  // Implementation packages should NOT depend on facades
  '@claude-zen/neural-ml': ['@claude-zen/intelligence', '@claude-zen/infrastructure', '@claude-zen/operations'],
  '@claude-zen/teamwork': ['@claude-zen/brain'], // Should be reversed - brain can depend on teamwork
  '@claude-zen/event-system': ['@claude-zen/brain'], // Event system should not depend on brain
  
  // ALL packages should use foundation utilities instead of direct dependencies
  '*': [
    'eventemitter3',     // Use foundation's TypedEventBase or EventEmitter
    'winston',           // Use foundation's getLogger()  
    'pino',              // Use foundation's getLogger()
    'dotenv',            // Use foundation's getConfig()
    'yargs',             // Use foundation's config system
    'commander',         // Use foundation's Command, program from foundation
    'joi',               // Use foundation's z (Zod validation)
    'ajv',               // Use foundation's z (Zod validation)
    'uuid',              // Use foundation's generateUUID()
    'nanoid',            // Use foundation's generateNanoId()
    'lodash',            // Use foundation's _ or lodash namespace
    'ramda',             // Use foundation's utilities or native JS
    'moment',            // Use foundation's dateFns utilities
    'date-fns'           // Use foundation's dateFns exports
  ],
  
  // Foundation is allowed to centralize these common utilities
  '@claude-zen/foundation': []
};

class ArchitectureValidator {
  constructor() {
    this.violations = [];
    this.packageJsonCache = new Map();
  }

  async validate() {
    console.log('🏗️  Validating 3-Tier Package Architecture...\n');
    
    await this.validateWorkspaceCatalog();
    await this.validatePackagePrivacy();
    await this.validateDependencyRules();
    await this.validateDeepInternalAccess();
    
    this.printResults();
    
    if (this.violations.length > 0) {
      process.exit(1);
    }
  }

  async validateWorkspaceCatalog() {
    console.log('📋 Validating workspace catalog...');
    
    const workspaceFile = path.join(projectRoot, 'pnpm-workspace.yaml');
    const content = fs.readFileSync(workspaceFile, 'utf8');
    
    // Check that only Tier 1 packages are in catalog
    for (const line of content.split('\n')) {
      if (line.trim().startsWith("'@claude-zen/") && line.includes('workspace:*')) {
        const packageName = line.match(/'(@claude-zen\/[^']+)'/)?.[1];
        if (packageName && !TIER_1_PUBLIC.includes(packageName)) {
          this.addViolation('CATALOG', 
            `Implementation package ${packageName} should not be in workspace catalog`,
            'Remove from catalog - only Tier 1 packages allowed'
          );
        }
      }
    }
  }

  async validatePackagePrivacy() {
    console.log('🔒 Validating package privacy settings...');
    
    const packages = await this.findAllPackages();
    
    for (const pkg of packages) {
      const packageJson = await this.getPackageJson(pkg);
      const packageName = packageJson.name;
      
      if (TIER_1_PUBLIC.includes(packageName)) {
        // Tier 1 should be public
        if (packageJson.private === true) {
          this.addViolation('PRIVACY',
            `Tier 1 package ${packageName} should not be private`,
            'Set "private": false or remove private field'
          );
        }
        if (packageJson.publishConfig?.access === 'restricted') {
          this.addViolation('PRIVACY',
            `Tier 1 package ${packageName} should have public access`,
            'Set publishConfig.access to "public"'
          );
        }
      } else {
        // Tier 2 & 3 should be private/restricted
        if (packageJson.private !== true) {
          this.addViolation('PRIVACY',
            `Implementation package ${packageName} should be private`,
            'Set "private": true'
          );
        }
        if (packageJson.publishConfig?.access === 'public') {
          this.addViolation('PRIVACY',
            `Implementation package ${packageName} should have restricted access`,
            'Set publishConfig.access to "restricted"'
          );
        }
      }
    }
  }

  async validateDependencyRules() {
    console.log('🔗 Validating dependency rules...');
    
    const packages = await this.findAllPackages();
    
    for (const pkg of packages) {
      const packageJson = await this.getPackageJson(pkg);
      const packageName = packageJson.name;
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.peerDependencies,
        ...packageJson.devDependencies
      };
      
      // Check forbidden dependencies - specific to package
      if (FORBIDDEN_DEPENDENCIES[packageName]) {
        for (const forbiddenDep of FORBIDDEN_DEPENDENCIES[packageName]) {
          if (dependencies[forbiddenDep]) {
            this.addViolation('FORBIDDEN_DEPENDENCY',
              `${packageName} should not depend on ${forbiddenDep}`,
              'Remove dependency or refactor architecture'
            );
          }
        }
      }

      // Check universal forbidden dependencies (apply to all packages except foundation)
      if (FORBIDDEN_DEPENDENCIES['*'] && packageName !== '@claude-zen/foundation') {
        for (const forbiddenDep of FORBIDDEN_DEPENDENCIES['*']) {
          if (dependencies[forbiddenDep]) {
            this.addViolation('FOUNDATION_VIOLATION',
              `${packageName} should use foundation utilities instead of ${forbiddenDep}`,
              `Replace with foundation equivalent - see @claude-zen/foundation documentation`
            );
          }
        }
      }
      
      // Implementation packages should not depend on facade packages
      if (!TIER_1_PUBLIC.includes(packageName)) {
        for (const depName of Object.keys(dependencies)) {
          if (TIER_1_PUBLIC.includes(depName) && depName !== '@claude-zen/foundation') {
            this.addViolation('CIRCULAR_DEPENDENCY',
              `Implementation package ${packageName} depends on facade ${depName}`,
              'Implementation packages should only depend on foundation and other implementation packages'
            );
          }
        }
      }
    }
  }

  async validateDeepInternalAccess() {
    console.log('🔐 Validating deep internal package access...');
    
    const packages = await this.findAllPackages();
    
    for (const pkg of packages) {
      const packageJson = await this.getPackageJson(pkg);
      const packageName = packageJson.name;
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.peerDependencies,
        ...packageJson.devDependencies
      };
      
      // Check that deep internal packages are only accessed by allowed packages
      for (const [deepPackage, allowedAccessors] of Object.entries(TIER_3_DEEP_INTERNAL)) {
        if (dependencies[deepPackage] && !allowedAccessors.includes(packageName)) {
          this.addViolation('DEEP_INTERNAL_ACCESS',
            `${packageName} should not directly access deep internal package ${deepPackage}`,
            `Only ${allowedAccessors.join(', ')} should access ${deepPackage}`
          );
        }
      }
    }
  }

  async findAllPackages() {
    const packages = [];
    
    // Check main packages directory
    const packagesDir = path.join(projectRoot, 'packages');
    if (fs.existsSync(packagesDir)) {
      for (const dir of fs.readdirSync(packagesDir)) {
        const packagePath = path.join(packagesDir, dir);
        if (fs.statSync(packagePath).isDirectory() && 
            fs.existsSync(path.join(packagePath, 'package.json'))) {
          packages.push(packagePath);
        }
      }
    }
    
    // Check implementation packages
    const implDir = path.join(projectRoot, 'packages', 'implementation-packages');
    if (fs.existsSync(implDir)) {
      for (const dir of fs.readdirSync(implDir)) {
        const packagePath = path.join(implDir, dir);
        if (fs.statSync(packagePath).isDirectory() && 
            fs.existsSync(path.join(packagePath, 'package.json'))) {
          packages.push(packagePath);
        }
      }
    }
    
    return packages;
  }

  async getPackageJson(packagePath) {
    if (!this.packageJsonCache.has(packagePath)) {
      const content = fs.readFileSync(path.join(packagePath, 'package.json'), 'utf8');
      this.packageJsonCache.set(packagePath, JSON.parse(content));
    }
    return this.packageJsonCache.get(packagePath);
  }

  addViolation(type, message, fix) {
    this.violations.push({ type, message, fix });
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));
    
    if (this.violations.length === 0) {
      console.log('✅ All architecture rules validated successfully!');
      console.log('\n🏗️  3-Tier Architecture Status:');
      console.log(`   📦 Tier 1 (Public): ${TIER_1_PUBLIC.length} packages`);
      console.log(`   🔒 Tier 2 (Implementation): Private packages`);
      console.log(`   🔐 Tier 3 (Deep Internal): ${Object.keys(TIER_3_DEEP_INTERNAL).length} packages`);
      return;
    }

    console.log(`❌ Found ${this.violations.length} architecture violations:\n`);
    
    const grouped = this.violations.reduce((acc, violation) => {
      if (!acc[violation.type]) acc[violation.type] = [];
      acc[violation.type].push(violation);
      return acc;
    }, {});

    for (const [type, violations] of Object.entries(grouped)) {
      console.log(`🚫 ${type} (${violations.length} issues):`);
      for (const violation of violations) {
        console.log(`   ❌ ${violation.message}`);
        console.log(`      💡 Fix: ${violation.fix}`);
      }
      console.log('');
    }

    console.log('🔧 To fix these issues, run the individual commands above or use:');
    console.log('   pnpm run fix:architecture');
  }
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ArchitectureValidator();
  validator.validate().catch(console.error);
}

export default ArchitectureValidator;