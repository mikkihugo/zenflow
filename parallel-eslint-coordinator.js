#!/usr/bin/env node

/**
 * Parallel ESLint Swarm Coordinator
 * Coordinates multiple specialized agents for efficient violation fixing
 */

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPORTS_DIR = './scripts/ai-eslint/reports';
const MAX_PARALLEL_AGENTS = 4;
const MONITORING_INTERVAL = 5000; // 5 seconds

// Violation type specialists for parallel processing
const AGENT_SPECIALISTS = {
  jsdoc: {
    name: 'JSDoc Agent',
    rules: ['jsdoc/require-file-overview', 'jsdoc/check-examples', 'jsdoc/require-description'],
    color: '\x1b[36m', // Cyan
  },
  typescript: {
    name: 'TypeScript Agent', 
    rules: ['@typescript-eslint/no-explicit-any', '@typescript-eslint/no-unused-vars', '@typescript-eslint/prefer-nullish-coalescing'],
    color: '\x1b[34m', // Blue
  },
  style: {
    name: 'Code Style Agent',
    rules: ['semi', 'quotes', 'indent', 'comma-dangle', 'no-trailing-spaces', 'eol-last'],
    color: '\x1b[32m', // Green
  },
  imports: {
    name: 'Import Agent',
    rules: ['import/order', 'import/no-duplicates', 'no-duplicate-imports'],
    color: '\x1b[35m', // Magenta
  }
};

class SwarmCoordinator {
  constructor() {
    this.activeAgents = new Map();
    this.processedViolations = 0;
    this.totalViolations = 0;
    this.startTime = Date.now();
    this.agentStats = new Map();
    
    // Initialize agent statistics
    Object.keys(AGENT_SPECIALISTS).forEach(type => {
      this.agentStats.set(type, {
        processed: 0,
        fixed: 0,
        failed: 0,
        status: 'idle'
      });
    });
  }

  async initialize() {
    console.log('🐝 Initializing ESLint Violation Swarm Coordinator');
    console.log('=' .repeat(60));
    
    // Analyze current violations to distribute workload
    await this.analyzeViolationsForDistribution();
    
    // Start monitoring system
    this.startProgressMonitoring();
    
    // Launch parallel agents
    await this.launchParallelAgents();
  }

  async analyzeViolationsForDistribution() {
    console.log('🔍 Analyzing violations for parallel distribution...');
    
    try {
      // Get current ESLint violations with categorization
      const eslintOutput = execSync('npx eslint "src/core/*.ts" "src/interfaces/*.ts" --format json', {
        encoding: 'utf8',
        timeout: 30000
      });
      
      const results = JSON.parse(eslintOutput);
      const violations = this.parseViolations(results);
      this.totalViolations = violations.length;
      
      console.log(`📊 Found ${this.totalViolations} violations to distribute across agents`);
      
      // Categorize by agent specialization
      const distribution = this.distributeViolations(violations);
      
      Object.entries(distribution).forEach(([agentType, count]) => {
        const agent = AGENT_SPECIALISTS[agentType];
        console.log(`  ${agent.color}${agent.name}\x1b[0m: ${count} violations`);
      });
      
      return distribution;
      
    } catch (error) {
      console.log('⚠️ Using mock distribution for demonstration');
      this.totalViolations = 150; // Mock for demo
      return {
        jsdoc: 40,
        typescript: 60,
        style: 35,
        imports: 15
      };
    }
  }

  parseViolations(eslintResults) {
    const violations = [];
    for (const file of eslintResults) {
      if (file.messages && file.messages.length > 0) {
        for (const message of file.messages) {
          violations.push({
            file: file.filePath,
            rule: message.ruleId,
            message: message.message,
            line: message.line,
            column: message.column
          });
        }
      }
    }
    return violations;
  }

  distributeViolations(violations) {
    const distribution = {};
    Object.keys(AGENT_SPECIALISTS).forEach(type => distribution[type] = 0);
    
    violations.forEach(violation => {
      let assigned = false;
      for (const [agentType, config] of Object.entries(AGENT_SPECIALISTS)) {
        if (config.rules.some(rule => violation.rule && violation.rule.includes(rule))) {
          distribution[agentType]++;
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        distribution.typescript++; // Default to TypeScript agent
      }
    });
    
    return distribution;
  }

  async launchParallelAgents() {
    console.log('\n🚀 Launching parallel specialized agents...');
    
    // Launch each agent type with specific focus
    for (const [agentType, config] of Object.entries(AGENT_SPECIALISTS)) {
      await this.launchAgent(agentType, config);
      // Stagger launches to avoid overwhelming system
      await this.sleep(2000);
    }
    
    console.log(`\n✅ All ${Object.keys(AGENT_SPECIALISTS).length} specialized agents launched`);
  }

  async launchAgent(agentType, config) {
    console.log(`${config.color}🤖 Launching ${config.name}...\x1b[0m`);
    
    const agentStats = this.agentStats.get(agentType);
    agentStats.status = 'launching';
    
    // Create specialized command for this agent type
    const command = this.buildAgentCommand(agentType, config);
    
    const agentProcess = spawn('node', [
      'scripts/ai-eslint/zen-ai-fixer.js',
      '--agent-type', agentType,
      '--rules', config.rules.join(','),
      '--verbose'
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    // Store agent process
    this.activeAgents.set(agentType, {
      process: agentProcess,
      config: config,
      startTime: Date.now()
    });

    // Monitor agent output
    this.monitorAgentOutput(agentType, agentProcess);
    
    agentStats.status = 'active';
  }

  buildAgentCommand(agentType, config) {
    // Build specialized prompts for different agent types
    const specializations = {
      jsdoc: 'Focus on JSDoc documentation violations. Fix missing file overviews, incomplete documentation, and example formatting.',
      typescript: 'Focus on TypeScript violations. Replace explicit any types with proper types, fix unused variables, use nullish coalescing.',
      style: 'Focus on code style violations. Fix semicolons, quotes, indentation, trailing spaces, and line endings.',
      imports: 'Focus on import/export violations. Organize imports, remove duplicates, and optimize import statements.'
    };
    
    return `You are a specialized ${config.name} in an ESLint violation fixing swarm. ${specializations[agentType]} Process violations in batches of 5-10 for efficiency.`;
  }

  monitorAgentOutput(agentType, agentProcess) {
    const config = AGENT_SPECIALISTS[agentType];
    const stats = this.agentStats.get(agentType);

    agentProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Parse progress indicators
      if (output.includes('✅ Fixed')) {
        stats.fixed++;
        stats.processed++;
        this.processedViolations++;
      } else if (output.includes('❌ Failed')) {
        stats.failed++;
        stats.processed++;
        this.processedViolations++;
      }
      
      // Show real-time agent activity (with color)
      const lines = output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.trim()) {
          console.log(`${config.color}[${config.name}]\x1b[0m ${line.trim()}`);
        }
      });
    });

    agentProcess.stderr.on('data', (data) => {
      console.log(`${config.color}[${config.name} ERROR]\x1b[0m ${data.toString().trim()}`);
    });

    agentProcess.on('close', (code) => {
      stats.status = code === 0 ? 'completed' : 'failed';
      console.log(`${config.color}[${config.name}]\x1b[0m Process completed with code ${code}`);
    });
  }

  startProgressMonitoring() {
    console.log('\n📊 Starting real-time progress monitoring...');
    
    const monitoringInterval = setInterval(() => {
      this.displayProgressDashboard();
    }, MONITORING_INTERVAL);

    // Stop monitoring when all agents are done
    const checkCompletion = setInterval(() => {
      const allComplete = Array.from(this.agentStats.values())
        .every(stats => ['completed', 'failed'].includes(stats.status));
      
      if (allComplete) {
        clearInterval(monitoringInterval);
        clearInterval(checkCompletion);
        this.displayFinalReport();
      }
    }, 2000);
  }

  displayProgressDashboard() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const progress = this.totalViolations > 0 ? 
      Math.round((this.processedViolations / this.totalViolations) * 100) : 0;
    
    console.clear();
    console.log('🐝 ESLint Violation Swarm - Real-Time Dashboard');
    console.log('=' .repeat(60));
    console.log(`⏱️  Elapsed: ${elapsed}s | 📈 Progress: ${progress}% (${this.processedViolations}/${this.totalViolations})`);
    console.log('');
    
    // Agent status table
    console.log('🤖 Agent Status:');
    for (const [agentType, stats] of this.agentStats.entries()) {
      const config = AGENT_SPECIALISTS[agentType];
      const statusIcon = this.getStatusIcon(stats.status);
      const successRate = stats.processed > 0 ? 
        Math.round((stats.fixed / stats.processed) * 100) : 0;
      
      console.log(`${config.color}${statusIcon} ${config.name.padEnd(18)}\x1b[0m | ` +
        `Processed: ${stats.processed.toString().padStart(3)} | ` +
        `Fixed: ${stats.fixed.toString().padStart(3)} | ` +
        `Success: ${successRate}%`);
    }
    
    console.log('');
    console.log('💡 Monitoring Claude CLI activity in real-time...');
    console.log('   Each agent shows detailed progress during 180s operations');
  }

  getStatusIcon(status) {
    const icons = {
      idle: '⚪',
      launching: '🟡',
      active: '🟢', 
      completed: '✅',
      failed: '❌'
    };
    return icons[status] || '❓';
  }

  displayFinalReport() {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    const totalFixed = Array.from(this.agentStats.values()).reduce((sum, stats) => sum + stats.fixed, 0);
    const successRate = this.processedViolations > 0 ? 
      Math.round((totalFixed / this.processedViolations) * 100) : 0;

    console.log('\n🎉 Swarm Coordination Complete!');
    console.log('=' .repeat(60));
    console.log(`📊 Total Violations Processed: ${this.processedViolations}`);
    console.log(`✅ Total Fixed: ${totalFixed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️  Total Time: ${totalTime}s`);
    console.log('');
    
    // Individual agent performance
    console.log('🏆 Agent Performance:');
    for (const [agentType, stats] of this.agentStats.entries()) {
      const config = AGENT_SPECIALISTS[agentType];
      console.log(`${config.color}${config.name}\x1b[0m: ${stats.fixed}/${stats.processed} violations fixed`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Launch coordinator if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const coordinator = new SwarmCoordinator();
  coordinator.initialize().catch(console.error);
}

export { SwarmCoordinator };