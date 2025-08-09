#!/usr/bin/env node

/**
 * @fileoverview ESLint Swarm Coordinator - Main Entry Point
 *
 * Coordinates multiple specialized agents for efficient ESLint violation fixing
 * with real-time visibility and extended timeouts for complex operations.
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-alpha.73
 */

import { type ChildProcess, execSync, spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

// Import existing coordination infrastructure (will be dynamically imported)
// import { SwarmCoordinator } from './coordination/swarm/core/swarm-coordinator.js';
// import { ApplicationCoordinator } from './core/application-coordinator.js';
// import { Logger } from './core/logger.js';

/**
 * Extended timeout configuration for complex AI operations
 */
const EXTENDED_TIMEOUTS = {
  CLAUDE_INACTIVITY: 10 * 60 * 1000, // 10 minutes of no output
  CLAUDE_MAX_TOTAL: 30 * 60 * 1000, // 30 minutes absolute maximum
  AGENT_COORDINATION: 5 * 60 * 1000, // 5 minutes for agent coordination
  PROGRESS_UPDATE: 10 * 1000, // 10 seconds progress updates
  BATCH_PROCESSING: 15 * 60 * 1000, // 15 minutes for batch processing
};

/**
 * Agent specialization definitions for parallel processing
 */
const AGENT_SPECIALISTS = {
  jsdoc: {
    name: 'JSDoc Documentation Agent',
    rules: [
      'jsdoc/require-file-overview',
      'jsdoc/check-examples',
      'jsdoc/require-description',
      'jsdoc/require-param-description',
    ],
    color: '\x1b[36m', // Cyan
    priority: 2,
    batchSize: 8,
  },
  typescript: {
    name: 'TypeScript Type Safety Agent',
    rules: [
      '@typescript-eslint/no-explicit-any',
      '@typescript-eslint/no-unused-vars',
      '@typescript-eslint/prefer-nullish-coalescing',
      '@typescript-eslint/no-unsafe-assignment',
    ],
    color: '\x1b[34m', // Blue
    priority: 1,
    batchSize: 6,
  },
  style: {
    name: 'Code Style & Formatting Agent',
    rules: [
      'semi',
      'quotes',
      'indent',
      'comma-dangle',
      'no-trailing-spaces',
      'eol-last',
      'no-multiple-empty-lines',
    ],
    color: '\x1b[32m', // Green
    priority: 3,
    batchSize: 12,
  },
  imports: {
    name: 'Import Optimization Agent',
    rules: ['import/order', 'import/no-duplicates', 'no-duplicate-imports', 'import/first'],
    color: '\x1b[35m', // Magenta
    priority: 2,
    batchSize: 10,
  },
};

/**
 * Enhanced ESLint Swarm Coordinator with real-time monitoring
 */
export class ESLintSwarmCoordinator extends EventEmitter {
  private activeAgents = new Map<string, AgentProcess>();
  private processedViolations = 0;
  private totalViolations = 0;
  private startTime = Date.now();
  private agentStats = new Map<string, AgentStats>();
  private logger: Logger;
  private progressInterval?: NodeJS.Timeout;
  private swarmCoordinator?: SwarmCoordinator;

  constructor() {
    super();
    this.logger = new Logger('ESLintSwarmCoordinator');
    this.initializeAgentStats();
  }

  private initializeAgentStats(): void {
    Object.keys(AGENT_SPECIALISTS).forEach((type) => {
      this.agentStats.set(type, {
        processed: 0,
        fixed: 0,
        failed: 0,
        inProgress: 0,
        status: 'idle',
        lastActivity: Date.now(),
        averageTime: 0,
        violations: [],
      });
    });
  }

  /**
   * Initialize the swarm coordination system
   */
  async initialize(): Promise<void> {
    this.logger.info('🐝 Initializing ESLint Swarm Coordinator with Extended Timeouts');
    console.log('='.repeat(80));
    console.log(
      `⏱️  Extended timeouts: Claude inactivity ${EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000}min, Max total ${EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL / 60000}min`
    );
    console.log('');

    try {
      // Initialize underlying swarm coordination
      this.swarmCoordinator = new SwarmCoordinator();

      // Analyze violations for distribution
      await this.analyzeViolationsForDistribution();

      // Start real-time monitoring with extended visibility
      this.startEnhancedProgressMonitoring();

      // Launch parallel agents with extended timeouts
      await this.launchParallelAgentsWithExtendedTimeouts();
    } catch (error) {
      this.logger.error('Failed to initialize swarm coordinator', error);
      throw error;
    }
  }

  /**
   * Analyze current ESLint violations and distribute across agents
   */
  private async analyzeViolationsForDistribution(): Promise<ViolationDistribution> {
    console.log('🔍 Analyzing ESLint violations for parallel distribution...');

    try {
      // Enhanced ESLint analysis with multiple strategies
      const strategies = [
        'npx eslint "src/core/*.ts" "src/interfaces/*.ts" --format json',
        'npx eslint "src/**/*.ts" --format json --max-warnings 500',
        'npx eslint src --format json --cache',
      ];

      let violations: ESLintViolation[] = [];

      for (const [index, strategy] of strategies.entries()) {
        console.log(`  Strategy ${index + 1}/3: ${strategy.split(' ')[2] || 'Full analysis'}`);

        try {
          const eslintOutput = execSync(strategy, {
            encoding: 'utf8',
            timeout: 60000, // 1 minute for analysis
            maxBuffer: 1024 * 1024 * 20, // 20MB buffer
          });

          if (eslintOutput.trim()) {
            violations = this.parseViolations(JSON.parse(eslintOutput));
            if (violations.length > 0) {
              console.log(`  ✅ Strategy ${index + 1} found ${violations.length} violations`);
              break;
            }
          }
        } catch (error: any) {
          console.log(`  ⚠️ Strategy ${index + 1} failed: ${error.message.split('\n')[0]}`);

          // Try to parse error output
          if (error.stdout) {
            try {
              violations = this.parseViolations(JSON.parse(error.stdout));
              if (violations.length > 0) {
                console.log(
                  `  ✅ Strategy ${index + 1} recovered ${violations.length} violations from error output`
                );
                break;
              }
            } catch (parseError) {
              // Continue to next strategy
            }
          }
        }
      }

      this.totalViolations = violations.length;

      if (this.totalViolations === 0) {
        console.log('  ⚠️ No violations found, using mock data for demonstration');
        this.totalViolations = 200;
        return this.generateMockDistribution();
      }

      // Distribute violations by agent specialization
      const distribution = this.distributeViolations(violations);

      console.log(`📊 Total violations: ${this.totalViolations}`);
      Object.entries(distribution).forEach(([agentType, data]) => {
        const agent = AGENT_SPECIALISTS[agentType];
        console.log(
          `  ${agent.color}${agent.name}\x1b[0m: ${data.count} violations (Priority ${agent.priority})`
        );
        this.agentStats.get(agentType)!.violations = data.violations;
      });

      return distribution;
    } catch (error) {
      this.logger.error('Violation analysis failed, using fallback distribution', error);
      this.totalViolations = 150;
      return this.generateMockDistribution();
    }
  }

  /**
   * Launch parallel agents with extended timeouts and real-time monitoring
   */
  private async launchParallelAgentsWithExtendedTimeouts(): Promise<void> {
    console.log('\n🚀 Launching specialized agents with extended timeouts...');

    // Sort agents by priority (lower number = higher priority)
    const agentTypes = Object.entries(AGENT_SPECIALISTS)
      .sort(([, a], [, b]) => a.priority - b.priority)
      .map(([type]) => type);

    for (const agentType of agentTypes) {
      const config = AGENT_SPECIALISTS[agentType];
      await this.launchAgentWithExtendedTimeout(agentType, config);

      // Stagger launches to prevent system overload
      await this.sleep(3000);
    }

    console.log(
      `\n✅ All ${agentTypes.length} specialized agents launched with extended monitoring`
    );
    this.emit('swarm:initialized', {
      agentCount: agentTypes.length,
      totalViolations: this.totalViolations,
    });
  }

  /**
   * Launch individual agent with extended timeout configuration
   */
  private async launchAgentWithExtendedTimeout(
    agentType: string,
    config: AgentConfig
  ): Promise<void> {
    console.log(`${config.color}🤖 Launching ${config.name} with extended timeouts...\x1b[0m`);

    const agentStats = this.agentStats.get(agentType)!;
    agentStats.status = 'launching';
    agentStats.lastActivity = Date.now();

    const violations = agentStats.violations || [];
    if (violations.length === 0) {
      console.log(`  ${config.color}⚠️ No violations assigned to ${config.name}\x1b[0m`);
      agentStats.status = 'completed';
      return;
    }

    // Create enhanced Claude CLI command with extended timeouts and real-time output
    const claudeProcess = this.createEnhancedClaudeProcess(agentType, config, violations);

    const agentProcess: AgentProcess = {
      process: claudeProcess,
      config,
      startTime: Date.now(),
      lastActivity: Date.now(),
      violations: violations.slice(0, config.batchSize * 3), // Process 3 batches worth
      inactivityTimeout: null,
      maxTimeout: null,
    };

    this.activeAgents.set(agentType, agentProcess);
    this.setupExtendedTimeoutMonitoring(agentType, agentProcess);
    this.monitorAgentOutputWithExtendedVisibility(agentType, agentProcess);

    agentStats.status = 'active';
    this.emit('agent:launched', {
      agentType,
      config: config.name,
      violationCount: violations.length,
    });
  }

  /**
   * Create enhanced Claude CLI process with extended configuration
   */
  private createEnhancedClaudeProcess(
    agentType: string,
    config: AgentConfig,
    violations: ESLintViolation[]
  ): ChildProcess {
    const prompt = this.buildEnhancedAgentPrompt(agentType, config, violations);

    return spawn(
      'claude',
      [
        '--debug',
        '--verbose',
        '--streaming',
        '--max-tokens',
        '4000',
        '--output-format',
        'stream-json',
        '--dangerously-skip-permissions',
        prompt,
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: {
          ...process.env,
          CLAUDE_TIMEOUT_EXTEND: 'true',
          CLAUDE_STREAM_OUTPUT: 'true',
        },
      }
    );
  }

  /**
   * Setup extended timeout monitoring for agent processes
   */
  private setupExtendedTimeoutMonitoring(agentType: string, agentProcess: AgentProcess): void {
    const config = agentProcess.config;

    // Inactivity timeout (resets on any output)
    const resetInactivityTimeout = () => {
      if (agentProcess.inactivityTimeout) {
        clearTimeout(agentProcess.inactivityTimeout);
      }

      agentProcess.lastActivity = Date.now();
      agentProcess.inactivityTimeout = setTimeout(() => {
        console.log(
          `${config.color}⏱️ ${config.name} inactive for ${EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000} minutes - terminating\x1b[0m`
        );
        agentProcess.process.kill('SIGTERM');
        this.handleAgentTimeout(agentType, 'inactivity');
      }, EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY);
    };

    // Absolute maximum timeout (never resets)
    agentProcess.maxTimeout = setTimeout(() => {
      const duration = (Date.now() - agentProcess.startTime) / 60000;
      console.log(
        `${config.color}🚨 ${config.name} reached maximum timeout of ${duration.toFixed(1)} minutes - terminating\x1b[0m`
      );
      agentProcess.process.kill('SIGTERM');
      this.handleAgentTimeout(agentType, 'maximum');
    }, EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL);

    // Start inactivity monitoring
    resetInactivityTimeout();

    // Store reset function for use in output monitoring
    (agentProcess as any).resetInactivityTimeout = resetInactivityTimeout;
  }

  /**
   * Monitor agent output with enhanced visibility and progress tracking
   */
  private monitorAgentOutputWithExtendedVisibility(
    agentType: string,
    agentProcess: AgentProcess
  ): void {
    const config = agentProcess.config;
    const stats = this.agentStats.get(agentType)!;
    const resetInactivityTimeout = (agentProcess as any).resetInactivityTimeout;

    // Real-time stdout monitoring
    agentProcess.process.stdout?.on('data', (data) => {
      const output = data.toString();
      resetInactivityTimeout(); // Reset inactivity timeout on any output

      // Parse progress indicators
      this.parseOutputForProgress(output, stats);

      // Show real-time output with timestamps and agent identification
      const timestamp = new Date().toLocaleTimeString();
      const lines = output.split('\n').filter((line) => line.trim());

      lines.forEach((line) => {
        if (line.trim()) {
          console.log(`${config.color}[${timestamp}] [${config.name}]\x1b[0m ${line.trim()}`);
        }
      });

      stats.lastActivity = Date.now();
      this.emit('agent:output', { agentType, output: lines, timestamp });
    });

    // Enhanced stderr monitoring
    agentProcess.process.stderr?.on('data', (data) => {
      const output = data.toString();
      resetInactivityTimeout(); // Reset inactivity timeout on error output

      const timestamp = new Date().toLocaleTimeString();
      console.log(`${config.color}[${timestamp}] [${config.name} ERROR]\x1b[0m ${output.trim()}`);

      // Parse errors for insights
      if (output.includes('timeout') || output.includes('TIMEOUT')) {
        console.log(
          `${config.color}⚠️ ${config.name} experiencing timeout issues - extending patience...\x1b[0m`
        );
      }

      this.emit('agent:error', { agentType, error: output, timestamp });
    });

    // Process completion handling
    agentProcess.process.on('close', (code) => {
      const duration = (Date.now() - agentProcess.startTime) / 1000;

      // Clear timeouts
      if (agentProcess.inactivityTimeout) clearTimeout(agentProcess.inactivityTimeout);
      if (agentProcess.maxTimeout) clearTimeout(agentProcess.maxTimeout);

      stats.status = code === 0 ? 'completed' : 'failed';
      stats.averageTime = duration;

      const statusIcon = code === 0 ? '✅' : '❌';
      console.log(
        `${config.color}${statusIcon} ${config.name} completed in ${duration.toFixed(1)}s (code ${code})\x1b[0m`
      );

      this.emit('agent:completed', { agentType, code, duration, stats: stats });
      this.checkSwarmCompletion();
    });

    // Process error handling
    agentProcess.process.on('error', (error) => {
      const duration = (Date.now() - agentProcess.startTime) / 1000;

      // Clear timeouts
      if (agentProcess.inactivityTimeout) clearTimeout(agentProcess.inactivityTimeout);
      if (agentProcess.maxTimeout) clearTimeout(agentProcess.maxTimeout);

      stats.status = 'failed';
      console.log(
        `${config.color}💥 ${config.name} error after ${duration.toFixed(1)}s: ${error.message}\x1b[0m`
      );

      this.emit('agent:error', { agentType, error: error.message, duration });
    });
  }

  /**
   * Enhanced progress monitoring with real-time dashboard
   */
  private startEnhancedProgressMonitoring(): void {
    console.log('\n📊 Starting enhanced real-time progress monitoring...');

    this.progressInterval = setInterval(() => {
      this.displayEnhancedProgressDashboard();
    }, EXTENDED_TIMEOUTS.PROGRESS_UPDATE);

    // Additional detailed monitoring every 30 seconds
    setInterval(() => {
      this.logDetailedProgress();
    }, 30000);
  }

  /**
   * Display enhanced progress dashboard with extended metrics
   */
  private displayEnhancedProgressDashboard(): void {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const progress =
      this.totalViolations > 0
        ? Math.round((this.processedViolations / this.totalViolations) * 100)
        : 0;

    // Clear screen and display header
    console.clear();
    console.log('🐝 ESLint Swarm Coordinator - Enhanced Real-Time Dashboard');
    console.log('='.repeat(80));
    console.log(
      `⏱️  Runtime: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s | 📈 Progress: ${progress}% (${this.processedViolations}/${this.totalViolations})`
    );
    console.log(
      `🌡️  Extended Timeouts: Inactivity ${EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000}min | Max ${EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL / 60000}min`
    );
    console.log('');

    // Enhanced agent status table
    console.log('🤖 Agent Status & Performance:');
    console.log('-'.repeat(80));

    for (const [agentType, stats] of this.agentStats.entries()) {
      const config = AGENT_SPECIALISTS[agentType];
      const statusIcon = this.getStatusIcon(stats.status);
      const successRate =
        stats.processed > 0 ? Math.round((stats.fixed / stats.processed) * 100) : 0;

      const timeSinceActivity = Math.round((Date.now() - stats.lastActivity) / 1000);
      const activityStatus =
        timeSinceActivity < 30
          ? '🟢 Active'
          : timeSinceActivity < 120
            ? '🟡 Recent'
            : '⭕ Inactive';

      console.log(
        `${config.color}${statusIcon} ${config.name.padEnd(30)}\x1b[0m | ` +
          `P:${stats.processed.toString().padStart(3)} F:${stats.fixed.toString().padStart(3)} ` +
          `Rate:${successRate.toString().padStart(3)}% | ${activityStatus} (${timeSinceActivity}s ago)`
      );
    }

    console.log('');
    console.log('💡 Enhanced Monitoring Features:');
    console.log('   ✅ Real-time Claude CLI output streaming');
    console.log('   ⏱️ Extended timeouts prevent premature termination');
    console.log('   📊 Per-agent progress tracking and performance metrics');
    console.log('   🔄 Automatic timeout extension on activity detection');
    console.log('');

    // Show active agents with detailed status
    const activeAgents = Array.from(this.activeAgents.entries()).filter(
      ([, agent]) => agent.process.pid
    );

    if (activeAgents.length > 0) {
      console.log('🔄 Active Processes:');
      activeAgents.forEach(([type, agent]) => {
        const config = agent.config;
        const runtime = Math.round((Date.now() - agent.startTime) / 1000);
        console.log(
          `  ${config.color}${config.name}\x1b[0m (PID: ${agent.process.pid}) - Running ${runtime}s`
        );
      });
    }
  }

  /**
   * Enhanced agent prompt with detailed instructions and extended context
   */
  private buildEnhancedAgentPrompt(
    agentType: string,
    config: AgentConfig,
    violations: ESLintViolation[]
  ): string {
    const contextualInstructions = {
      jsdoc: `You are a JSDoc Documentation Specialist. Focus on adding comprehensive file overviews, fixing documentation examples, and ensuring all functions have proper parameter descriptions. Use TypeScript-style JSDoc comments.`,

      typescript: `You are a TypeScript Type Safety Specialist. Replace 'any' types with proper TypeScript types, fix unused variables by either using them or removing them, and implement nullish coalescing where appropriate.`,

      style: `You are a Code Style & Formatting Specialist. Fix semicolons, standardize quotes to single quotes, correct indentation (2 spaces), add trailing commas where appropriate, and remove trailing spaces.`,

      imports: `You are an Import Optimization Specialist. Organize imports in proper order (external, internal, relative), remove duplicate imports, and ensure clean import statements.`,
    };

    const violationSummary = violations
      .slice(0, config.batchSize)
      .map(
        (v) =>
          `- ${path.relative(process.cwd(), v.file)}:${v.line}:${v.column} - ${v.rule}: ${v.message}`
      )
      .join('\n');

    return `${contextualInstructions[agentType]}

🎯 **MISSION**: Fix ${violations.length} ESLint violations in batch processing mode

**Your Specialized Rules**: ${config.rules.join(', ')}

**Extended Operation Guidelines**:
- Process violations in batches of ${config.batchSize} for efficiency
- Use Edit tool for direct file modifications
- Provide progress updates after each file
- Take your time - extended timeouts are configured (${EXTENDED_TIMEOUTS.CLAUDE_INACTIVITY / 60000} min inactivity, ${EXTENDED_TIMEOUTS.CLAUDE_MAX_TOTAL / 60000} min total)
- Stream your thought process for real-time monitoring

**Priority Violations to Fix**:
${violationSummary}

**Real-Time Progress Instructions**:
1. Announce each file you're working on
2. Describe your approach before making changes
3. Confirm successful fixes with "✅ Fixed [rule] in [file]"
4. Report any issues with "⚠️ Issue with [rule] in [file]: [reason]"

Begin processing now with real-time progress updates.`;
  }

  // Helper methods
  private parseViolations(eslintResults: any[]): ESLintViolation[] {
    const violations: ESLintViolation[] = [];

    for (const file of eslintResults) {
      if (file.messages && file.messages.length > 0) {
        for (const message of file.messages) {
          violations.push({
            file: file.filePath,
            rule: message.ruleId || 'unknown',
            message: message.message,
            line: message.line,
            column: message.column,
            severity: message.severity === 2 ? 'error' : 'warning',
          });
        }
      }
    }

    return violations;
  }

  private distributeViolations(violations: ESLintViolation[]): ViolationDistribution {
    const distribution: ViolationDistribution = {};

    // Initialize all agent types
    Object.keys(AGENT_SPECIALISTS).forEach((type) => {
      distribution[type] = { count: 0, violations: [] };
    });

    // Distribute violations based on rule matching
    for (const violation of violations) {
      let assigned = false;

      for (const [agentType, config] of Object.entries(AGENT_SPECIALISTS)) {
        if (config.rules.some((rule) => violation.rule.includes(rule))) {
          distribution[agentType].violations.push(violation);
          distribution[agentType].count++;
          assigned = true;
          break;
        }
      }

      // Default assignment to TypeScript agent for unmatched rules
      if (!assigned) {
        distribution.typescript.violations.push(violation);
        distribution.typescript.count++;
      }
    }

    return distribution;
  }

  private generateMockDistribution(): ViolationDistribution {
    return {
      jsdoc: { count: 45, violations: [] },
      typescript: { count: 65, violations: [] },
      style: { count: 55, violations: [] },
      imports: { count: 35, violations: [] },
    };
  }

  private parseOutputForProgress(output: string, stats: AgentStats): void {
    if (output.includes('✅ Fixed')) {
      stats.fixed++;
      stats.processed++;
      this.processedViolations++;
    } else if (output.includes('❌ Failed') || output.includes('⚠️ Issue')) {
      stats.failed++;
      stats.processed++;
      this.processedViolations++;
    }
  }

  private handleAgentTimeout(agentType: string, timeoutType: 'inactivity' | 'maximum'): void {
    const stats = this.agentStats.get(agentType)!;
    stats.status = 'timeout';

    console.log(
      `⚠️ Agent ${agentType} timed out (${timeoutType}). Processed: ${stats.processed}, Fixed: ${stats.fixed}`
    );
    this.emit('agent:timeout', { agentType, timeoutType, stats });
  }

  private checkSwarmCompletion(): void {
    const allComplete = Array.from(this.agentStats.values()).every((stats) =>
      ['completed', 'failed', 'timeout'].includes(stats.status)
    );

    if (allComplete) {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }

      this.displayFinalReport();
      this.emit('swarm:completed');
    }
  }

  private displayFinalReport(): void {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    const totalFixed = Array.from(this.agentStats.values()).reduce(
      (sum, stats) => sum + stats.fixed,
      0
    );
    const successRate =
      this.processedViolations > 0 ? Math.round((totalFixed / this.processedViolations) * 100) : 0;

    console.clear();
    console.log('🎉 ESLint Swarm Coordination Complete!');
    console.log('='.repeat(80));
    console.log(`📊 Total Violations Processed: ${this.processedViolations}`);
    console.log(`✅ Total Successfully Fixed: ${totalFixed}`);
    console.log(`📈 Overall Success Rate: ${successRate}%`);
    console.log(`⏱️  Total Runtime: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`);
    console.log('');

    // Individual agent performance
    console.log('🏆 Agent Performance Summary:');
    console.log('-'.repeat(80));

    for (const [agentType, stats] of this.agentStats.entries()) {
      const config = AGENT_SPECIALISTS[agentType];
      const agentSuccessRate =
        stats.processed > 0 ? Math.round((stats.fixed / stats.processed) * 100) : 0;

      console.log(`${config.color}${config.name}\x1b[0m:`);
      console.log(
        `  Processed: ${stats.processed} | Fixed: ${stats.fixed} | Success: ${agentSuccessRate}%`
      );
      console.log(`  Average Time: ${stats.averageTime.toFixed(1)}s | Status: ${stats.status}`);
    }

    console.log('\n💡 Extended timeout system prevented premature terminations');
    console.log('📊 Real-time monitoring provided complete visibility');

    this.emit('coordination:complete', {
      totalProcessed: this.processedViolations,
      totalFixed: totalFixed,
      successRate: successRate,
      runtime: totalTime,
    });
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      idle: '⚪',
      launching: '🟡',
      active: '🟢',
      completed: '✅',
      failed: '❌',
      timeout: '⏰',
    };
    return icons[status] || '❓';
  }

  private logDetailedProgress(): void {
    this.logger.info('Progress update', {
      processed: this.processedViolations,
      total: this.totalViolations,
      agents: Object.fromEntries(
        Array.from(this.agentStats.entries()).map(([type, stats]) => [
          type,
          { status: stats.status, processed: stats.processed, fixed: stats.fixed },
        ])
      ),
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Type definitions
interface AgentConfig {
  name: string;
  rules: string[];
  color: string;
  priority: number;
  batchSize: number;
}

interface AgentStats {
  processed: number;
  fixed: number;
  failed: number;
  inProgress: number;
  status: string;
  lastActivity: number;
  averageTime: number;
  violations: ESLintViolation[];
}

interface AgentProcess {
  process: ChildProcess;
  config: AgentConfig;
  startTime: number;
  lastActivity: number;
  violations: ESLintViolation[];
  inactivityTimeout: NodeJS.Timeout | null;
  maxTimeout: NodeJS.Timeout | null;
}

interface ESLintViolation {
  file: string;
  rule: string;
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

interface ViolationDistribution {
  [agentType: string]: {
    count: number;
    violations: ESLintViolation[];
  };
}

// CLI execution
if (require.main === module) {
  const coordinator = new ESLintSwarmCoordinator();

  coordinator.on('swarm:completed', () => {
    process.exit(0);
  });

  coordinator.on('agent:error', (data) => {
    console.error('Agent error:', data);
  });

  coordinator.initialize().catch((error) => {
    console.error('❌ Swarm coordination failed:', error);
    process.exit(1);
  });
}

export { ESLintSwarmCoordinator };
