#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory to process
const baseDir = path.join(__dirname, 'apps/claude-code-zen-server/src');

// Comprehensive syntax repair patterns
const repairs = [
  // Fix unterminated string literals - common patterns
  { regex: /const logger = getLogger\('([^']*?)'\)';/g, replacement: "const logger = getLogger('$1');" },
  { regex: /getLogger\('([^']*?)'\)';/g, replacement: "getLogger('$1');" },
  { regex: /logger\.info\('([^']*?)'\)';/g, replacement: "logger.info('$1');" },
  { regex: /logger\.error\('([^']*?)'\)`;/g, replacement: "logger.error('$1');" },
  { regex: /logger\.debug\('([^']*?)'\)'/g, replacement: "logger.debug('$1')" },
  { regex: /process\.exit\(([^)]*?)\)';/g, replacement: "process.exit($1);" },
  
  // Fix method parameter syntax
  { regex: /\(\s*args: any\['\s*\):/g, replacement: "(args: any[]):" },
  { regex: /\(\s*event: string,\s*handler: \(data: any\)\s*=>\s*void\):\s*void\s*\{/g, replacement: "(event: string, handler: (data: any) => void): void {" },
  
  // Fix object property syntax
  { regex: /options\.'erbose/g, replacement: "options.verbose" },
  { regex: /options\.de'/g, replacement: "options.dev" },
  { regex: /optio's\.daemon/g, replacement: "options.daemon" },
  { regex: /re'urn/g, replacement: "return" },
  { regex: /cas' '-v':/g, replacement: "case '-v':" },
  { regex: /t'is\./g, replacement: "this." },
  
  // Fix string literal breaks
  { regex: /'ref: /g, replacement: "$ref: " },
  { regex: /descrip'ion:/g, replacement: "description:" },
  { regex: /c'eateAgent/g, replacement: "createAgent" },
  { regex: /c'eateTask/g, replacement: "createTask" },
  { regex: /'emoveAgent/g, replacement: "removeAgent" },
  { regex: /getTask\(_taskId: st'ing\)/g, replacement: "getTask(_taskId: string)" },
  { regex: /assignTask\(_taskId: st'ing, _agentId: string\)/g, replacement: "assignTask(_taskId: string, _agentId: string)" },
  { regex: /getAgent\(_agentId: st'ing\)/g, replacement: "getAgent(_agentId: string)" },
  
  // Fix broken template literals and backticks
  { regex: /import\.meta\.url === `file:\/\/\$\{process\.argv\[1\]\}`/g, replacement: "import.meta.url === `file://${process.argv[1]}`" },
  { regex: /process\.on\(`SIGINT',/g, replacement: "process.on('SIGINT'," },
  { regex: /getLogger\(`([^`]*?)'\)';/g, replacement: "getLogger('$1');" },
  
  // Fix object syntax
  { regex: /Objec'\.assign/g, replacement: "Object.assign" },
  { regex: /da'abase:/g, replacement: "database:" },
  { regex: /agents'/g, replacement: "agents:" },
  
  // Fix method calls
  { regex: /async function main\(\` \{/g, replacement: "async function main() {" },
  { regex: /async initialize\(\`: Promise<void>/g, replacement: "async initialize(): Promise<void>" },
  { regex: /async startServer\(\': Promise<void>/g, replacement: "async startServer(): Promise<void>" },
  { regex: /async shutdown\(\': Promise<void>/g, replacement: "async shutdown(): Promise<void>" },
  { regex: /async function main\(' \{/g, replacement: "async function main() {" },
  { regex: /private async demonstrateSystemIntegration\(\`: Promise<void>/g, replacement: "private async demonstrateSystemIntegration(): Promise<void>" },
  
  // Fix error handling
  { regex: /\} catch \(error' \{/g, replacement: "} catch (error) {" },
  { regex: /\} catch \(error` \{/g, replacement: "} catch (error) {" },
  
  // Fix type annotations
  { regex: /status?: Agent\['status,\s*'\]';/g, replacement: "status?: Agent['status'];" },
  { regex: /type?: Agent\['type,\s*'\]';/g, replacement: "type?: Agent['type'];" },
  { regex: /priority?: Task\['priority,\s*'\]';/g, replacement: "priority?: Task['priority'];" },
  
  // Fix static method declarations
  { regex: /'tatic /g, replacement: "static " },
  
  // Fix broken assignment operators
  { regex: /container\.register\(TOKENS\.Logger, \(\' =>/g, replacement: "container.register(TOKENS.Logger, () =>" },
  
  // Fix console.log calls
  { regex: /console\.log\(\`([^`]*?)\`\)'/g, replacement: "console.log(`$1`)" },
  
  // Fix express imports
  { regex: /const express = await import\('express'\)';/g, replacement: "const express = await import('express');" },
  
  // Fix server status string
  { regex: /status: `running',/g, replacement: "status: 'running'," },
  
  // Fix uptime property
  { regex: /up'ime: /g, replacement: "uptime: " },
  
  // Fix various broken strings in object properties
  { regex: /daemo': /g, replacement: "daemon: " },
  { regex: /re': \{/g, replacement: "res: {" },
  
  // Fix method signatures
  { regex: /\): \{ skipNext: boolean \} \{/g, replacement: "): { skipNext: boolean } {" },
  { regex: /static parseArgs\(args: string\[\]\): IntegratedOptions\s+\{/g, replacement: "static parseArgs(args: string[]): IntegratedOptions {" },
  { regex: /private static showHelp\(\): void\s+\{/g, replacement: "private static showHelp(): void {" },
  
  // Fix conditional statements
  { regex: /if \(this\.options\.port' \{/g, replacement: "if (this.options.port) {" },
  { regex: /if \(this\.server\?\. close' \{/g, replacement: "if (this.server?.close) {" },
  { regex: /if \(!options\?\.daemon' \{/g, replacement: "if (!options?.daemon) {" },
  
  // Fix various control flow
  { regex: /if \(this\.orchestrator' \{/g, replacement: "if (this.orchestrator) {" },
  { regex: /if \(this\.coordinationManager' \{/g, replacement: "if (this.coordinationManager) {" },
  { regex: /if \(this\.behavioralIntelligence' \{/g, replacement: "if (this.behavioralIntelligence) {" },
  { regex: /if \(this\.multiSystemCoordinator' \{/g, replacement: "if (this.multiSystemCoordinator) {" },
  
  // Fix resolve calls
  { regex: /const database = this\.container!\.resolve\(TOKENS\.Database' as any;/g, replacement: "const database = this.container!.resolve(TOKENS.Database) as any;" },
  
  // Fix arrow functions in setInterval
  { regex: /setInterval\(\(\' =>/g, replacement: "setInterval(() =>" },
  { regex: /setInterval\(\(' =>/g, replacement: "setInterval(() =>" },
  
  // Fix object literal syntax in error handling
  { regex: /if \(hasErrorCode\(err' &&/g, replacement: "if (hasErrorCode(err) &&" },
  
  // Fix method call chains
  { regex: /logger\.error\(`❌ Server error:',\s*err\)';/g, replacement: "logger.error('❌ Server error:', err);" },
  { regex: /logger\.error\(`Port \$\{this\.options\.port\} is already in use`\)'/g, replacement: "logger.error(`Port ${this.options.port} is already in use`);" },
  
  // Fix return statement syntax
  { regex: /\s+\{/, replacement: " {" },
  
  // Fix more complex string literal issues
  { regex: /logger\.info\('🚀 Initializing Claude Code Zen with full DI integration\.'\)';/g, replacement: "logger.info('🚀 Initializing Claude Code Zen with full DI integration.');" },
  { regex: /logger\.info\('✅ All systems initialized successfully with dependency injection!'\)';/g, replacement: "logger.info('✅ All systems initialized successfully with dependency injection!');" },
  { regex: /logger\.info\(`🔗 Demonstrating DI-enhanced system integration\.'\)';/g, replacement: "logger.info('🔗 Demonstrating DI-enhanced system integration.');" },
  { regex: /logger\.info\('📋 Testing Orchestrator with DI\.'\)';/g, replacement: "logger.info('📋 Testing Orchestrator with DI.');" },
  { regex: /logger\.info\('🤝 Testing CoordinationManager with DI\.'\)';/g, replacement: "logger.info('🤝 Testing CoordinationManager with DI.');" },
  { regex: /logger\.info\('🧠 Testing BehavioralIntelligence with DI\.'\)';/g, replacement: "logger.info('🧠 Testing BehavioralIntelligence with DI.');" },
  { regex: /logger\.info\('🌐 Testing MultiSystemCoordinator with DI\.'\)';/g, replacement: "logger.info('🌐 Testing MultiSystemCoordinator with DI.');" },
  
  // Fix string concatenation and template literals
  { regex: /logger\.info\('  - Orchestrator successfully using injected dependencies'\)'/g, replacement: "logger.info('  - Orchestrator successfully using injected dependencies');" },
  { regex: /logger\.info\('  - CoordinationManager successfully using injected dependencies'\)'/g, replacement: "logger.info('  - CoordinationManager successfully using injected dependencies');" },
  { regex: /logger\.info\('  - BehavioralIntelligence successfully using injected dependencies'\)'/g, replacement: "logger.info('  - BehavioralIntelligence successfully using injected dependencies');" },
  { regex: /logger\.info\('  - MultiSystemCoordinator successfully using injected dependencies'\)'/g, replacement: "logger.info('  - MultiSystemCoordinator successfully using injected dependencies');" },
  { regex: /logger\.info\('🎉 All DI integration demonstrations completed successfully!'\)'/g, replacement: "logger.info('🎉 All DI integration demonstrations completed successfully!');" },
  { regex: /logger\.info\('✅ Shutdown completed successfully'\)'/g, replacement: "logger.info('✅ Shutdown completed successfully');" },
  
  // Fix more specific error cases
  { regex: /logger\.error\(`❌ Error during shutdown: \$\{error\}`\)'/g, replacement: "logger.error(`❌ Error during shutdown: ${error}`);" },
  { regex: /logger\.info\('Coordination manager has basic interface,\s*no shutdown method'\)'/g, replacement: "logger.info('Coordination manager has basic interface, no shutdown method');" },
  
  // Fix specific method issues
  { regex: /if \(coordinator && typeof coordinator === 'object'\) \{[\s\S]*?Objec'\.assign\(/g, 
    replacement: "if (coordinator && typeof coordinator === 'object') {\n        Object.assign(" },
  
  // Fix very specific broken patterns we saw in the files
  { regex: /logger\.error\('❌ Failed to start application:',\s*error\)';/g, replacement: "logger.error('❌ Failed to start application:', error);" },
  { regex: /const logger = getLogger\(`claude-zen-core'\)';/g, replacement: "const logger = getLogger('claude-zen-core');" },
  { regex: /logger\.error\('Failed to start application:',\s*error\)';/g, replacement: "logger.error('Failed to start application:', error);" },
  { regex: /const logger = getLogger\(`ClaudeZenIntegrated'\)';/g, replacement: "const logger = getLogger('ClaudeZenIntegrated');" },
  { regex: /logger\.error\('Fatal error in main:',\s*error\)';/g, replacement: "logger.error('Fatal error in main:', error);" },
  
  // Fix process.on listeners  
  { regex: /process\.on\('SIGINT', shutdown\)';/g, replacement: "process.on('SIGINT', shutdown);" },
  { regex: /process\.on\('SIGTERM', shutdown\)';/g, replacement: "process.on('SIGTERM', shutdown);" },
  
  // Clean up extra quotes and formatting
  { regex: /logger\.info\('Running in foreground mode'\)'/g, replacement: "logger.info('Running in foreground mode');" },
  { regex: /logger\.debug\('Application heartbeat'\)'/g, replacement: "logger.debug('Application heartbeat');" },
  { regex: /logger\.error\('❌ Failed to start Claude Code Zen Integrated:',\s*error\)';/g, replacement: "logger.error('❌ Failed to start Claude Code Zen Integrated:', error);" },
  
  // Fix more specific integration issues
  { regex: /logger\.info\(`🚀 Initializing Claude Code Zen Integrated'\)';/g, replacement: "logger.info('🚀 Initializing Claude Code Zen Integrated');" },
  { regex: /logger\.info\('✅ Claude Code Zen Integrated initialized successfully'\)'/g, replacement: "logger.info('✅ Claude Code Zen Integrated initialized successfully');" },
  { regex: /logger\.info\(`✅ HTTP server started on port \$\{this\.options\.port\}`\)`;/g, replacement: "logger.info(`✅ HTTP server started on port ${this.options.port}`);" },
  { regex: /logger\.info\(`🌐 Health check: http:\/\/localhost:\$\{this\.options\.port\}\/health`\)'/g, replacement: "logger.info(`🌐 Health check: http://localhost:${this.options.port}/health`);" },
  { regex: /logger\.info\('🛑 Shutting down Claude Code Zen Integrated'\)';/g, replacement: "logger.info('🛑 Shutting down Claude Code Zen Integrated');" },
  { regex: /logger\.info\('✅ Shutdown completed successfully'\)'/g, replacement: "logger.info('✅ Shutdown completed successfully');" },
  
  // Fix error patterns
  { regex: /logger\.error\(`❌ Failed to start HTTP server:',\s*error\)';/g, replacement: "logger.error('❌ Failed to start HTTP server:', error);" },
  
  // Fix assignment with template literals
  { regex: /id: `server-\$\{Date\.now\(\)\}`,/g, replacement: "id: `server-${Date.now()}`," },
  
  // Fix API endpoint patterns
  { regex: /listTas's\(/g, replacement: "listTasks(" },
  { regex: /'otal:/g, replacement: "total:" },
  { regex: /'etSwarmConfig/g, replacement: "getSwarmConfig" },
  { regex: /updateSwa'mConfig/g, replacement: "updateSwarmConfig" },
  { regex: /Confi'uration/g, replacement: "Configuration" },
  { regex: /confi'uration/g, replacement: "configuration" },
  { regex: /getSwarmStatus\(\': \{/g, replacement: "getSwarmStatus(): {" },
  { regex: /Tas' not found/g, replacement: "Task not found" },
  { regex: /Tas' or agent not found/g, replacement: "Task or agent not found" },
];

// Function to apply repairs to content
function repairContent(content, filePath) {
  let repairedContent = content;
  let changesApplied = 0;
  
  for (const repair of repairs) {
    const matches = repairedContent.match(repair.regex);
    if (matches) {
      repairedContent = repairedContent.replace(repair.regex, repair.replacement);
      changesApplied += matches.length;
    }
  }
  
  if (changesApplied > 0) {
    console.log(`✅ Applied ${changesApplied} repairs to ${filePath}`);
  }
  
  return { content: repairedContent, changed: changesApplied > 0 };
}

// Function to process files recursively
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalFilesProcessed = 0;
  let totalFilesChanged = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = processDirectory(fullPath);
      totalFilesProcessed += subResults.processed;
      totalFilesChanged += subResults.changed;
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const result = repairContent(content, fullPath);
        
        if (result.changed) {
          fs.writeFileSync(fullPath, result.content, 'utf8');
          totalFilesChanged++;
        }
        
        totalFilesProcessed++;
      } catch (error) {
        console.error(`❌ Error processing ${fullPath}:`, error.message);
      }
    }
  }
  
  return { processed: totalFilesProcessed, changed: totalFilesChanged };
}

// Main execution
console.log('🔧 Starting TypeScript syntax error repairs...');
console.log(`📁 Processing directory: ${baseDir}`);

const results = processDirectory(baseDir);

console.log('\n📊 Repair Summary:');
console.log(`   Files processed: ${results.processed}`);
console.log(`   Files modified: ${results.changed}`);
console.log(`   Files unchanged: ${results.processed - results.changed}`);

if (results.changed > 0) {
  console.log('\n✅ Syntax repairs completed! Running TypeScript compilation check...');
  
  // Check if repairs were successful
  import('child_process').then(({ exec }) => {
    exec('npx tsc --noEmit', { cwd: path.join(__dirname, 'apps/claude-code-zen-server') }, (error, stdout, stderr) => {
      if (error) {
        console.log('\n⚠️  Some TypeScript errors may still remain:');
        console.log(stdout || stderr);
      } else {
        console.log('\n🎉 All TypeScript syntax errors have been fixed!');
      }
    });
  });
} else {
  console.log('\n✨ No syntax errors found that matched our repair patterns.');
}