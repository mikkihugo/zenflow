#!/usr/bin/env node

/**
 * @file ESLint Swarm Coordinator - Main Entry Point.
 *
 * Coordinates multiple specialized agents for efficient ESLint violation fixing.
 * with real-time visibility and extended timeouts for complex operations.
 * @author Claude Code Zen Team
 * @version 2.0-alpha.73
 */

import { type ChildProcess, execSync, spawn} from 'node:child_process';
import path from 'node:path';
import {
  EventEmitter,
  getLogger,
} from '@claude-zen/foundation';

// Fallback implementations for missing foundation exports
const getConsoleReplacementLogger = () => getLogger('console');
type LoggerInterface = ReturnType<typeof getLogger>;

// Import existing coordination infrastructure (will be dynamically imported)
// import('/coordination/swarm/core/swarm-coordinator)';

interface ESLintViolation {
  filePath:string;
  messages:Array<{
    ruleId:string;
    severity:number;
    message:string;
    line:number;
    column:number;
    fix?:{
      range:[number, number];
      text:string;
};
}>;
}

interface SwarmAgentConfig {
  name:string;
  specialization:'syntax' | ' imports' | ' types' | ' performance' | ' general';
  rules:string[];
  maxConcurrentFixes:number;
  timeoutMs:number;
}

interface SwarmCoordinatorOptions {
  projectRoot:string;
  concurrentAgents:number;
  verboseLogging:boolean;
  dryRun:boolean;
  extensions:string[];
  excludePatterns:string[];
  timeout:number;
}

/**
 * ESLint Swarm Coordinator
 * Coordinates multiple specialized ESLint fixing agents for efficient parallel processing
 */
export class ESLintSwarmCoordinator extends EventEmitter {
  private logger:LoggerInterface;
  private options:SwarmCoordinatorOptions;
  private agents:SwarmAgentConfig[] = [];
  private activeProcesses:Map<string, ChildProcess> = new Map();

  constructor(options:Partial<SwarmCoordinatorOptions> = {}) {
    super();

    this.options = {
      projectRoot:process.cwd(),
      concurrentAgents:4,
      verboseLogging:false,
      dryRun:false,
      extensions:['.ts',    '.tsx',    '.js',    '.jsx'],
      excludePatterns:['node_modules/**',    'dist/**',    'build/**'],
      timeout:300000, // 5 minutes
      ...options,
};

    this.logger = getConsoleReplacementLogger();
    this.setupSpecializedAgents();
}

  /**
   * Setup specialized ESLint agents for different types of violations
   */
  private setupSpecializedAgents():void {
    this.agents = [
      {
        name: 'SyntaxAgent',        specialization: 'syntax',        rules:[
          'quotes',          'semi',          'comma-dangle',          'indent',          'no-trailing-spaces',],
        maxConcurrentFixes:10,
        timeoutMs:30000,
},
      {
        name: 'ImportAgent',        specialization: 'imports',        rules:[
          'import/order',          'import/no-unresolved',          'unused-imports/no-unused-imports',],
        maxConcurrentFixes:5,
        timeoutMs:60000,
},
      {
        name: 'TypeAgent',        specialization: 'types',        rules:[
          '@typescript-eslint/no-unused-vars',          '@typescript-eslint/explicit-function-return-type',],
        maxConcurrentFixes:3,
        timeoutMs:90000,
},
      {
        name: 'PerformanceAgent',        specialization: 'performance',        rules:['prefer-const',    'no-var',    'prefer-template'],
        maxConcurrentFixes:8,
        timeoutMs:45000,
},
      {
        name: 'GeneralAgent',        specialization: 'general',        rules:[], // Handles everything else
        maxConcurrentFixes:6,
        timeoutMs:60000,
},
];
}

  /**
   * Start the ESLint swarm coordination process
   */
  async startCoordination():Promise<void> {
    this.logger.info('🚀 Starting ESLint Swarm Coordination');
    this.logger.info(`Project root: ${this.options.projectRoot}`);
    this.logger.info(`Concurrent agents: ${this.options.concurrentAgents}`);

    try {
      // 1. Discover all violations
      const violations = this.discoverViolations();
      this.logger.info(
        `📊 Discovered ${violations.length} files with violations`
      );

      // 2. Categorize violations by agent specialization
      const categorizedViolations = this.categorizeViolations(violations);

      // 3. Coordinate parallel fixing
      await this.coordinateParallelFixes(categorizedViolations);

      // 4. Verify results
      this.verifyFixResults();

      this.logger.info('✅ ESLint Swarm Coordination completed successfully');
} catch (error) {
      this.logger.error('❌ ESLint Swarm Coordination failed: ', error);
      throw error;
}
}

  /**
   * Discover all ESLint violations in the project
   */
  private discoverViolations():ESLintViolation[] {
    this.logger.info('🔍 Discovering ESLint violations...');

    const eslintCmd = [
      'npx',      'eslint',      '--format',      'json',      '--ext',      this.options.extensions.join(','),
      ...this.options.excludePatterns.map((p) => `--ignore-pattern=${p}`),
      this.options.projectRoot,
].join(' ');

    try {
      const output = execSync(eslintCmd, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: this.options.timeout,
});

      return JSON.parse(output) as ESLintViolation[];
} catch (error:unknown) {
      return this.handleEslintError(error);
}
}

  /**
   * Handle ESLint execution error
   */
  private handleEslintError(error:unknown): ESLintViolation[] {
    // ESLint returns non-zero exit code when violations are found
    if (!this.isEslintOutputError(error)) {
      this.logger.error('ESLint command failed: ', error);
      return [];
}

    try {
      return JSON.parse(error.stdout) as ESLintViolation[];
} catch (parseError) {
      this.logger.error('Failed to parse ESLint output: ', parseError);
      return [];
}
}

  /**
   * Check if error contains ESLint output
   */
  private isEslintOutputError(error:unknown): error is { stdout: string} {
    return Boolean(
      error &&
      typeof error === 'object' &&
      'stdout' in error &&
      typeof (error as { stdout: unknown }).stdout === 'string'
    );
}

  /**
   * Categorize violations by agent specialization
   */
  private categorizeViolations(
    violations:ESLintViolation[]
  ):Map<string, ESLintViolation[]> {
    const categorized = new Map<string, ESLintViolation[]>();

    // Initialize categories
    for (const agent of this.agents) {
      categorized.set(agent.name, []);
}

    // Categorize violations
    for (const violation of violations) {
      const agentAssigned = this.assignViolationToAgent(violation);
      const existingViolations = categorized.get(agentAssigned.name) || [];
      existingViolations.push(violation);
      categorized.set(agentAssigned.name, existingViolations);
}

    // Log categorization results
    for (const [agentName, violations] of categorized.entries()) {
      if (violations.length > 0) {
        this.logger.info(
          `📋 ${agentName}:${violations.length} files assigned`
        );
}
}

    return categorized;
}

  /**
   * Assign a violation to the most appropriate agent
   */
  private assignViolationToAgent(violation:ESLintViolation): SwarmAgentConfig {
    // Find the agent that specializes in the most rules found in this violation
    let bestAgent = this.agents[this.agents.length - 1]; // Default to GeneralAgent
    let bestScore = 0;

    for (const agent of this.agents.slice(0, -1)) {
      // Exclude GeneralAgent from scoring
      const ruleMatches = this.countRuleMatches(violation, agent);

      if (ruleMatches > bestScore) {
        bestScore = ruleMatches;
        bestAgent = agent;
}
}

    return bestAgent;
}

  /**
   * Count rule matches between violation and agent
   */
  private countRuleMatches(
    violation:ESLintViolation,
    agent:SwarmAgentConfig
  ):number {
    return violation.messages.filter(
      (msg) =>
        msg.ruleId && agent.rules.some((rule) => msg.ruleId?.includes(rule))
    ).length;
}

  /**
   * Coordinate parallel fixing across specialized agents
   */
  private async coordinateParallelFixes(
    categorizedViolations:Map<string, ESLintViolation[]>
  ):Promise<void> {
    this.logger.info('⚡ Starting parallel ESLint fixing...');

    const fixPromises:Promise<void>[] = [];

    for (const [agentName, violations] of categorizedViolations) {
      if (violations.length === 0) continue;

      const agent = this.agents.find((a) => a.name === agentName)!;
      fixPromises.push(this.runAgentFixes(agent, violations));
}

    // Wait for all agents to complete
    await Promise.allSettled(fixPromises);
}

  /**
   * Run fixes for a specific agent
   */
  private async runAgentFixes(
    agent:SwarmAgentConfig,
    violations:ESLintViolation[]
  ):Promise<void> {
    this.logger.info(
      `🤖 ${agent.name} processing ${violations.length} files...`
    );

    const batchSize = agent.maxConcurrentFixes;
    const batches = this.chunkArray(violations, batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map((violation) =>
        this.fixViolation(agent, violation)
      );
      await Promise.allSettled(batchPromises);
}

    this.logger.info(`✅ ${agent.name} completed processing`);
}

  /**
   * Fix a single violation using the specified agent
   */
  private async fixViolation(
    agent:SwarmAgentConfig,
    violation:ESLintViolation
  ):Promise<void> {
    try {
      const fixCmd = ['npx',    'eslint',    '--fix', violation.filePath].join(' ');

      if (this.options.dryRun) {
        this.logger.info(`[DRY RUN] Would fix:${violation.filePath}`);
        return;
}

      await new Promise<void>((resolve, reject) => {
        const process = spawn(fixCmd, [], {
          shell:true,
          timeout:agent.timeoutMs,
          cwd:this.options.projectRoot,
});

        this.activeProcesses.set(
          `${agent.name}-${violation.filePath}`,
          process
        );

        process.on('close', (code) => {
          this.activeProcesses.delete(`${agent.name}-${violation.filePath}`);
          if (code === 0) {
            if (this.options.verboseLogging) {
              this.logger.debug(`Fixed:${violation.filePath}`);
}
            resolve();
} else {
            reject(
              new Error(
                `ESLint fix failed for ${violation.filePath} with code ${code}`
              )
            );
}
});

        process.on('error', (error) => {
          this.activeProcesses.delete(`${agent.name}-${violation.filePath}`);
          reject(error);
});
});
} catch (error) {
      this.logger.warn(
        `⚠️ ${agent.name} failed to fix ${violation.filePath}:`,
        error
      );
}
}

  /**
   * Verify the results of the fixing process
   */
  private verifyFixResults():void {
    this.logger.info('🔍 Verifying fix results...');

    try {
      const remainingViolations = this.discoverViolations();
      const remainingCount = remainingViolations.reduce(
        (sum, v) => sum + v.messages.length,
        0
      );

      if (remainingCount === 0) {
        this.logger.info('🎉 All violations have been fixed!');
} else {
        this.logger.warn(
          `⚠️ ${remainingCount} violations remaining after fixes`
        );

        // Log details about remaining violations
        this.logRemainingViolations(remainingViolations);
}
} catch (error) {
      this.logger.error('Failed to verify results: ', error);
      }
}

  /**
   * Log remaining violations details
   */
  private logRemainingViolations(violations:ESLintViolation[]): void {
    if (!this.options.verboseLogging) {
      return;
}

    for (const violation of violations) {
      for (const msg of violation.messages) {
        this.logger.debug(
          `Remaining: ${violation.filePath}:${msg.line}:${msg.column} - ${msg.ruleId}`
        );
}
}

  /**
   * Utility function to chunk arrays into smaller batches
   */
  private chunkArray<T>(array:T[], size:number): T[][] {
    const chunks:T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

  /**
   * Gracefully shutdown all active processes
   */
  shutdown():void {
    this.logger.info('🛑 Shutting down ESLint Swarm Coordinator...');

    // Kill all active processes
    for (const [key, process] of this.activeProcesses) {
      this.logger.debug(`Terminating process:${key}`);
      process.kill('SIGTERM');
}

    this.activeProcesses.clear();
    this.logger.info('✅ ESLint Swarm Coordinator shutdown complete');
}
}

/**
 * CLI entry point
 */
async function main():Promise<void> {
  const args = process.argv.slice(2);

  const options:Partial<SwarmCoordinatorOptions> = {
    verboseLogging:args.includes('--verbose') || args.includes('-v'),
    dryRun:args.includes('--dry-run'),
    concurrentAgents:parseInt(
      args.find((arg) => arg.startsWith('--agents='))?.split('=')[1] || '4',      10
    ),
    timeout:parseInt(
      args.find((arg) => arg.startsWith('--timeout='))?.split('=')[1] ||
        '300000',      10
    ),
};

  // Get project root from arguments
  const projectRootIndex = args.indexOf('--project-root');
  if (projectRootIndex !== -1 && args[projectRootIndex + 1]) {
    options.projectRoot = path.resolve(args[projectRootIndex + 1]);
}

  const coordinator = new ESLintSwarmCoordinator(options);

  // Handle graceful shutdown
  const shutdown = async () => {
    await coordinator.shutdown();
    process.exit(0);
};

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await coordinator.startCoordination();
    process.exit(0);
} catch (error) {
    getLogger('eslint-swarm-main').error(
      'ESLint Swarm Coordination failed: ',
      error
    );
    process.exit(1);
}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {`
  main().catch((error) => {
    getLogger('eslint-swarm-main').error(' Fatal error: ', error);
      process.exit(1);
});
}

export type {
  SwarmCoordinatorOptions,
  ESLintViolation,
  SwarmAgentConfig,
};
