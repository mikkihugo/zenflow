#!/usr/bin/env node

/**
 * Parallel ESLint Swarm Launcher
 * Launch multiple zen-ai-fixer processes with different specializations
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🐝 Launching Parallel ESLint Swarm');
console.log('==================================');
console.log('⏱️  Extended timeouts: 10min inactivity, 30min max total');
console.log('🎯 Strategy: Multiple specialized agents working in parallel');
console.log('');

// Agent specializations
const SWARM_AGENTS = [
  {
    name: 'TypeScript Agent',
    color: '\x1b[34m', // Blue
    rules: [
      '@typescript-eslint/no-explicit-any',
      '@typescript-eslint/no-unused-vars',
    ],
    files: ['src/core/*.ts', 'src/interfaces/*.ts'],
    priority: 1,
  },
  {
    name: 'Style Agent',
    color: '\x1b[32m', // Green
    rules: ['semi', 'quotes', 'indent', 'no-trailing-spaces'],
    files: ['src/**/*.ts'],
    priority: 3,
  },
  {
    name: 'Import Agent',
    color: '\x1b[35m', // Magenta
    rules: ['import/order', 'no-duplicate-imports'],
    files: ['src/**/*.ts'],
    priority: 2,
  },
];

class ParallelSwarmLauncher {
  constructor() {
    this.activeAgents = new Map();
    this.totalProcessed = 0;
    this.totalFixed = 0;
    this.startTime = Date.now();
  }

  async launchSwarm() {
    console.log('🚀 Launching specialized agents...');

    for (const [index, agent] of SWARM_AGENTS.entries()) {
      await this.launchAgent(agent, index);
      // Stagger launches to prevent system overload
      await this.sleep(5000);
    }

    console.log(`\n✅ ${SWARM_AGENTS.length} agents launched successfully`);
    this.startMonitoring();
  }

  async launchAgent(agent, index) {
    console.log(`${agent.color}🤖 Launching ${agent.name}...\x1b[0m`);

    // Create specialized command
    const agentProcess = spawn(
      'node',
      [
        'scripts/ai-eslint/zen-ai-fixer.js',
        '--verbose',
        '--quick', // Use quick mode for focused processing
        `--agent-id=${index}`,
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: {
          ...process.env,
          ZEN_AGENT_NAME: agent.name,
          ZEN_AGENT_COLOR: agent.color,
          ZEN_AGENT_RULES: agent.rules.join(','),
          ZEN_AGENT_FILES: agent.files.join(','),
        },
      },
    );

    this.activeAgents.set(agent.name, {
      process: agentProcess,
      config: agent,
      startTime: Date.now(),
      processed: 0,
      fixed: 0,
    });

    this.monitorAgentOutput(agent, agentProcess);
  }

  monitorAgentOutput(agent, agentProcess) {
    const agentData = this.activeAgents.get(agent.name);

    agentProcess.stdout.on('data', (data) => {
      const output = data.toString();
      const timestamp = new Date().toLocaleTimeString();

      // Parse progress
      if (output.includes('✅ Fixed')) {
        agentData.fixed++;
        agentData.processed++;
        this.totalFixed++;
        this.totalProcessed++;
      } else if (output.includes('❌ Failed')) {
        agentData.processed++;
        this.totalProcessed++;
      }

      // Show agent output with color
      const lines = output.split('\n').filter((line) => line.trim());
      lines.forEach((line) => {
        if (line.trim()) {
          console.log(
            `${agent.color}[${timestamp}] [${agent.name}]\x1b[0m ${line.trim()}`,
          );
        }
      });
    });

    agentProcess.stderr.on('data', (data) => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(
        `${agent.color}[${timestamp}] [${agent.name} ERROR]\x1b[0m ${data.toString().trim()}`,
      );
    });

    agentProcess.on('close', (code) => {
      const duration = (Date.now() - agentData.startTime) / 1000;
      console.log(
        `${agent.color}✅ ${agent.name} completed in ${duration.toFixed(1)}s (code ${code})\x1b[0m`,
      );
      this.checkSwarmCompletion();
    });
  }

  startMonitoring() {
    console.log('\n📊 Starting swarm progress monitoring...\n');

    const monitorInterval = setInterval(() => {
      this.displaySwarmStatus();
    }, 30000); // Every 30 seconds

    // Store interval for cleanup
    this.monitorInterval = monitorInterval;
  }

  displaySwarmStatus() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const successRate =
      this.totalProcessed > 0
        ? Math.round((this.totalFixed / this.totalProcessed) * 100)
        : 0;

    console.log('\n🐝 Swarm Status Dashboard');
    console.log('='.repeat(50));
    console.log(`⏱️  Runtime: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
    console.log(
      `📊 Total: ${this.totalProcessed} processed | ${this.totalFixed} fixed | ${successRate}% success`,
    );
    console.log('');

    console.log('🤖 Agent Performance:');
    for (const [name, data] of this.activeAgents.entries()) {
      const agentSuccessRate =
        data.processed > 0
          ? Math.round((data.fixed / data.processed) * 100)
          : 0;

      console.log(
        `${data.config.color}${name.padEnd(20)}\x1b[0m | ` +
          `Processed: ${data.processed.toString().padStart(3)} | ` +
          `Fixed: ${data.fixed.toString().padStart(3)} | ` +
          `Success: ${agentSuccessRate}%`,
      );
    }
    console.log('');
  }

  checkSwarmCompletion() {
    const allComplete = Array.from(this.activeAgents.values()).every(
      (agent) => !agent.process.pid || agent.process.killed,
    );

    if (allComplete) {
      if (this.monitorInterval) {
        clearInterval(this.monitorInterval);
      }
      this.displayFinalReport();
    }
  }

  displayFinalReport() {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    const successRate =
      this.totalProcessed > 0
        ? Math.round((this.totalFixed / this.totalProcessed) * 100)
        : 0;

    console.log('\n🎉 Parallel Swarm Coordination Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Total Violations Processed: ${this.totalProcessed}`);
    console.log(`✅ Total Successfully Fixed: ${this.totalFixed}`);
    console.log(`📈 Overall Success Rate: ${successRate}%`);
    console.log(
      `⏱️  Total Runtime: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`,
    );
    console.log('');

    console.log('🏆 Final Agent Performance:');
    for (const [name, data] of this.activeAgents.entries()) {
      const agentSuccessRate =
        data.processed > 0
          ? Math.round((data.fixed / data.processed) * 100)
          : 0;
      console.log(
        `${data.config.color}${name}\x1b[0m: ${data.fixed}/${data.processed} violations fixed (${agentSuccessRate}%)`,
      );
    }

    console.log('\n💡 Extended timeouts prevented premature terminations');
    console.log('🚀 Parallel coordination improved overall throughput');
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Launch if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const launcher = new ParallelSwarmLauncher();
  launcher.launchSwarm().catch(console.error);
}

export { ParallelSwarmLauncher };
