#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Packages to migrate from file:/link: to workspace:*
const CLAUDE_ZEN_PACKAGES = [
  '@claude-zen/foundation',
  '@claude-zen/llm-providers', 
  '@claude-zen/infrastructure',
  '@claude-zen/intelligence',
  '@claude-zen/enterprise',
  '@claude-zen/operations',
  '@claude-zen/development',
  '@claude-zen/repo-analyzer',
  '@claude-zen/language-parsers',
  '@claude-zen/ai-linter',
  '@claude-zen/agui',
  '@claude-zen/brain',
  '@claude-zen/database',
  '@claude-zen/memory',
  '@claude-zen/telemetry',
  '@claude-zen/system-monitoring',
  '@claude-zen/agent-monitoring',
  '@claude-zen/neural-ml',
  '@claude-zen/workflows',
  '@claude-zen/teamwork',
  '@claude-zen/knowledge',
  '@claude-zen/event-system',
  '@claude-zen/ai-safety',
  '@claude-zen/load-balancing',
  '@claude-zen/otel-collector',
  '@claude-zen/agent-registry',
  '@claude-zen/file-aware-ai',
  '@claude-zen/llm-routing',
  '@claude-zen/chaos-engineering',
  '@claude-zen/agent-manager'
];

function findPackageJsonFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findPackageJsonFiles(fullPath));
      } else if (item === 'package.json') {
        files.push(fullPath);
      }
    } catch (err) {
      // Skip broken symlinks or inaccessible files
      console.log(`  Skipping ${fullPath}: ${err.code}`);
    }
  }
  
  return files;
}

function migratePackageJson(filePath) {
  console.log(`Checking: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let newContent = content;
  
  // Replace file: and link: references to Claude Zen packages
  for (const pkg of CLAUDE_ZEN_PACKAGES) {
    // Match file: or link: patterns
    const filePattern = new RegExp(`"${pkg}":\\s*"(?:file|link):[^"]*"`, 'g');
    
    if (filePattern.test(content)) {
      console.log(`  Migrating ${pkg} to workspace:*`);
      newContent = newContent.replace(filePattern, `"${pkg}": "workspace:*"`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`  ✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('🚀 Starting pnpm workspace migration...\n');

const projectRoot = process.cwd();
const packageFiles = findPackageJsonFiles(projectRoot);

let totalUpdated = 0;

for (const file of packageFiles) {
  if (migratePackageJson(file)) {
    totalUpdated++;
  }
}

console.log(`\n✅ Migration complete! Updated ${totalUpdated} package.json files.`);
console.log('\n📋 Next steps:');
console.log('1. Run: pnpm install');
console.log('2. Run: pnpm build');
console.log('3. Test your applications');