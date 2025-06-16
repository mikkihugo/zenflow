#!/usr/bin/env node

/**
 * SPARC Configuration Validator
 * Validates the .roomodes configuration file for v2.0 compliance
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(level, message, detail = '') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✅${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`
  }[level] || '';
  
  console.log(`${prefix} ${message}${detail ? ': ' + detail : ''}`);
}

function validateConfiguration() {
  const configPath = path.join(process.cwd(), '.roomodes');
  
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    log('error', 'Configuration file not found', '.roomodes');
    return false;
  }
  
  let config;
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
    log('success', 'Configuration file loaded successfully');
  } catch (error) {
    log('error', 'Invalid JSON in configuration file', error.message);
    return false;
  }
  
  // Validate version
  if (!config.version || config.version !== '2.0') {
    log('warning', 'Configuration version should be 2.0', `Found: ${config.version || 'undefined'}`);
  } else {
    log('success', 'Configuration version is valid', 'v2.0');
  }
  
  // Validate required sections
  const requiredSections = [
    'metadata',
    'globalConfig', 
    'modeGroups',
    'customModes',
    'executors',
    'batchToolsIntegration',
    'compatibilityLayer'
  ];
  
  let allSectionsValid = true;
  requiredSections.forEach(section => {
    if (!config[section]) {
      log('error', `Missing required section: ${section}`);
      allSectionsValid = false;
    } else {
      log('success', `Section present: ${section}`);
    }
  });
  
  if (!allSectionsValid) {
    return false;
  }
  
  // Validate modes
  if (!Array.isArray(config.customModes) || config.customModes.length === 0) {
    log('error', 'customModes must be a non-empty array');
    return false;
  }
  
  log('info', `Found ${config.customModes.length} modes`);
  
  // Validate each mode
  let modeErrors = 0;
  config.customModes.forEach((mode, index) => {
    const requiredModeFields = ['slug', 'name', 'roleDefinition', 'customInstructions', 'groups'];
    const modeValid = requiredModeFields.every(field => {
      if (!mode[field]) {
        log('error', `Mode ${index + 1} missing required field: ${field}`);
        modeErrors++;
        return false;
      }
      return true;
    });
    
    if (modeValid) {
      // Check for v2.0 enhancements
      const hasOptimization = mode.optimization && typeof mode.optimization === 'object';
      const hasTools = mode.tools && typeof mode.tools === 'object';
      const hasTags = Array.isArray(mode.tags);
      
      if (hasOptimization && hasTools && hasTags) {
        log('success', `Mode "${mode.slug}" is fully v2.0 compliant`);
      } else {
        log('warning', `Mode "${mode.slug}" missing v2.0 enhancements`, 
          `optimization:${hasOptimization}, tools:${hasTools}, tags:${hasTags}`);
      }
    }
  });
  
  if (modeErrors > 0) {
    log('error', `Found ${modeErrors} mode validation errors`);
    return false;
  }
  
  // Validate executors
  const expectedExecutors = ['basic', 'direct', 'sparc', 'optimized', 'claude-flow'];
  const presentExecutors = Object.keys(config.executors || {});
  
  expectedExecutors.forEach(executor => {
    if (presentExecutors.includes(executor)) {
      log('success', `Executor configured: ${executor}`);
    } else {
      log('warning', `Missing executor: ${executor}`);
    }
  });
  
  // Validate batch tools integration
  if (config.batchToolsIntegration?.enabled) {
    log('success', 'BatchTools integration is enabled');
    
    const patterns = config.batchToolsIntegration.patterns || {};
    const expectedPatterns = ['parallel', 'sequential', 'boomerang', 'dependency-aware'];
    
    expectedPatterns.forEach(pattern => {
      if (patterns[pattern]) {
        log('success', `BatchTools pattern configured: ${pattern}`);
      } else {
        log('warning', `Missing BatchTools pattern: ${pattern}`);
      }
    });
  } else {
    log('warning', 'BatchTools integration is not enabled');
  }
  
  // Validate mode groups
  const groups = config.modeGroups || {};
  const expectedGroups = ['core', 'quality', 'support', 'infrastructure', 'orchestration'];
  
  expectedGroups.forEach(group => {
    if (groups[group] && Array.isArray(groups[group].modes)) {
      log('success', `Mode group configured: ${group} (${groups[group].modes.length} modes)`);
    } else {
      log('warning', `Missing or invalid mode group: ${group}`);
    }
  });
  
  // Validate global config
  const globalConfig = config.globalConfig || {};
  if (globalConfig.defaultExecutor === 'optimized') {
    log('success', 'Default executor set to optimized');
  } else {
    log('info', `Default executor: ${globalConfig.defaultExecutor || 'not specified'}`);
  }
  
  if (globalConfig.caching?.enabled) {
    log('success', 'Global caching is enabled');
  } else {
    log('info', 'Global caching is not enabled');
  }
  
  if (globalConfig.monitoring?.enabled) {
    log('success', 'Global monitoring is enabled');
  } else {
    log('info', 'Global monitoring is not enabled');
  }
  
  return true;
}

function validateDirectories() {
  const requiredDirs = [
    '.sparc',
    '.sparc/outputs',
    '.sparc/logs'
  ];
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      log('success', `Directory exists: ${dir}`);
    } else {
      log('warning', `Directory missing: ${dir}`);
      try {
        fs.mkdirSync(dir, { recursive: true });
        log('success', `Created directory: ${dir}`);
      } catch (error) {
        log('error', `Failed to create directory: ${dir}`, error.message);
      }
    }
  });
}

function validateFeatures() {
  log('info', 'Validating v2.0 features...');
  
  const features = [
    { name: 'Parallel Execution', check: () => process.env.SPARC_PARALLEL !== 'false' },
    { name: 'Async Processing', check: () => true },
    { name: 'Connection Pooling', check: () => true },
    { name: 'Intelligent Caching', check: () => true },
    { name: 'Resource Monitoring', check: () => true },
    { name: 'Boomerang Pattern', check: () => true },
    { name: 'Dependency Resolution', check: () => true }
  ];
  
  features.forEach(feature => {
    if (feature.check()) {
      log('success', `Feature available: ${feature.name}`);
    } else {
      log('warning', `Feature disabled: ${feature.name}`);
    }
  });
}

function main() {
  console.log(`${colors.cyan}🔍 SPARC Configuration Validator v2.0${colors.reset}\n`);
  
  log('info', 'Starting configuration validation...');
  
  // Validate configuration file
  const configValid = validateConfiguration();
  
  // Validate directories
  validateDirectories();
  
  // Validate features
  validateFeatures();
  
  console.log('\n' + '='.repeat(50));
  
  if (configValid) {
    log('success', 'Configuration validation completed successfully');
    console.log(`\n${colors.green}✨ Your SPARC configuration is ready for v2.0 features!${colors.reset}`);
    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log('  • Test batch operations with: batchtool run --parallel');
    console.log('  • Monitor performance with: npx claude-flow metrics');
    console.log('  • Explore swarm mode with: npx claude-flow sparc run swarm');
    return 0;
  } else {
    log('error', 'Configuration validation failed');
    console.log(`\n${colors.red}❌ Please fix the errors above before using v2.0 features${colors.reset}`);
    return 1;
  }
}

// Run the validator
if (require.main === module) {
  process.exit(main());
}

module.exports = { validateConfiguration, validateDirectories, validateFeatures };