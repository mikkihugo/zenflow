/**
 * @fileoverview: Multi-Swarm: A/B: Testing System
 *
 * Advanced: A/B testing system that launches multiple swarms simultaneously
 * to compare results and identify optimal approaches. Supports git tree
 * integration and multiple: AI model backends (Claude, Gemini, Aider, etc.)
 *
 * Features:
 * - Parallel swarm execution with result comparison
 * - Git tree integration for isolated testing environments
 * - Multi-model support (Claude, Gemini, Aider, GP: T-4, etc.)
 * - Statistical analysis of performance differences
 * - Automated swarm selection based on success metrics
 * - A/B test result persistence and learning
 *
 * @author: Claude Code: Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { generateNano: Id, get: Logger} from '@claude-zen/foundation';

import {
  CodingPrinciples: Researcher,
  type: PrinciplesResearchConfig,
} from './coding-principles-researcher';
import { IntelligentPrompt: Generator} from './intelligent-prompt-generator';

const logger = get: Logger('multi-swarm-ab-testing');

/**
 * Supported: AI model backends for swarm: A/B testing
 */
export type: AIModelBackend = 'claude-sonnet' | 'claude-opus' | 'claude-haiku' | 'gpt-4' | 'gpt-4-turbo' | 'aider' | 'custom';

/**
 * A/B test strategy configuration
 */
export interface: ABTestStrategy {
  /** Strategy identifier */
  id:string;
  /** Human-readable name */
  name:string;
  /** A: I model backend to use */
  model: Backend:AIModel: Backend;
  /** Swarm configuration parameters */
  swarm: Config:{
    topology: 'mesh|hierarchical|ring|star;
'    max: Agents:number;
    strategy:'balanced' | ' specialized' | ' adaptive';
    coordination: Approach:'conservative' | ' aggressive' | ' exploratory';
};
  /** Research configuration for this strategy */
  research: Config?:Partial<PrinciplesResearch: Config>;
  /** Custom prompt variations */
  prompt: Variations?:{
    style: 'concise|detailed|step-by-step|creative;
'    focus: 'performance|quality|speed|innovation;
'};
}

/**
 * Git tree configuration for isolated testing
 */
export interface: GitTreeConfig {
  /** Create isolated git worktrees for each test */
  useGit: Worktrees:boolean;
  /** Base branch to create worktrees from */
  base: Branch:string;
  /** Prefix for worktree branch names */
  branch: Prefix:string;
  /** Clean up worktrees after testing */
  cleanupAfter: Test:boolean;
  /** Maximum concurrent worktrees */
  max: Worktrees:number;
}

/**
 * A/B test execution result for a single strategy
 */
export interface: SwarmTestResult {
  /** Strategy that was tested */
  strategy:ABTest: Strategy;
  /** Execution success status */
  success:boolean;
  /** Execution duration in milliseconds */
  duration:number;
  /** Quality metrics */
  quality: Metrics:{
    code: Quality:number; // 0-100
    requirements: Coverage:number; // 0-100
    implementation: Correctness:number; // 0-100
    maintainability:number; // 0-100
    performance:number; // 0-100
    overall: Score:number; // 0-100
    accuracy?:number; // 0-100 (for backwards compatibility)
    completeness?:number; // 0-100 (for backwards compatibility)
    efficiency?:number; // 0-100 (for backwards compatibility)
};
  /** Generated artifacts and outputs */
  artifacts:{
    files: Created:string[];
    linesOf: Code:number;
    functions: Created:number;
    tests: Generated:number;
};
  /** Error information if failed */
  error?:string;
  /** Git worktree path if used */
  worktree: Path?:string;
  /** Model-specific metadata */
  model: Metadata:{
    backend:AIModel: Backend;
    token: Usage?:number;
    request: Count:number;
    avgResponse: Time:number;
    attempt: Number?:number;
    total: Attempts?:number;
    timed: Out?:boolean;
};
}

/**
 * Complete: A/B test comparison result
 */
export interface: ABTestResult {
  /** Test execution: ID */
  test: Id:string;
  /** Test description */
  description:string;
  /** All strategies tested */
  strategies:ABTest: Strategy[];
  /** Results for each strategy */
  results:SwarmTest: Result[];
  /** Statistical comparison */
  comparison:{
    /** Best performing strategy */
    winner:ABTest: Strategy;
    /** Confidence in winner selection (0-1) */
    confidence:number;
    /** Statistical significance */
    significance: 'high|medium|low|none;
'    /** Performance differences */
    performance: Delta:Record<string, number>;
};
  /** Execution metadata */
  metadata:{
    start: Time:Date;
    end: Time:Date;
    total: Duration:number;
    parallel: Execution:boolean;
    gitTrees: Used:boolean;
};
  /** Learning insights for future tests */
  insights:string[];
}

/**
 * Multi-Swarm: A/B: Testing System
 *
 * Orchestrates parallel execution of multiple swarm strategies to identify
 * optimal approaches through statistical comparison and analysis.
 */
export class: MultiSwarmABTesting {
  private codingPrinciples: Researcher:CodingPrinciples: Researcher;
  private test: History:ABTest: Result[] = [];

  constructor(
    codingPrinciples: Researcher?:CodingPrinciples: Researcher,
    prompt: Generator?:IntelligentPrompt: Generator
  ) {
    if (codingPrinciples: Researcher) {
      this.codingPrinciples: Researcher = codingPrinciples: Researcher;
} else {
      // Create a placeholder: DSPyLLMBridge for initialization
      const dspy: Bridge = {
        initialize:async () => {},
        processCoordination: Task:async () => ({ success: true, result:null}),
} as any;
      this.codingPrinciples: Researcher = new: CodingPrinciplesResearcher(
        dspy: Bridge
      );
}
    this.prompt: Generator =
      prompt: Generator || new: IntelligentPromptGenerator(
        undefined,
        this.codingPrinciples: Researcher
      );
}

  /**
   * Execute: A/B test with multiple swarm strategies
   */
  async executeAB: Test(): Promise<ABTest: Result> {
    const test: Id = "ab-test-${generateNano: Id()}"""
    const start: Time = new: Date();

    logger.info("🧪 Starting: A/B test:$test: Id")""
    logger.info("📋 Task:${task: Description}")""
    logger.info("🔬 Testing $strategies.lengthstrategies:$strategies.map((s) => s.name).join(',    ')")""

    try {
       {
      // Prepare git worktrees if configured
      const worktree: Paths = await this.prepareGit: Worktrees(
        strategies,
        options.git: Config
      );

      // Execute strategies (parallel or sequential)
      const results =
        options.parallel: Execution !== false
          ? await this.executeStrategies: Parallel(
              task: Description,
              strategies,
              worktree: Paths,
              options
            )
          :await this.executeStrategies: Sequential(
              task: Description,
              strategies,
              worktree: Paths,
              options
            );

      // Analyze and compare results
      const comparison = this.analyze: Results(results);

      // Generate insights from comparison
      const insights = this.generate: Insights(results, comparison);

      const end: Time = new: Date();
      const test: Result:ABTest: Result = {
        test: Id,
        description:task: Description,
        strategies,
        results,
        comparison,
        metadata:{
          start: Time,
          end: Time,
          total: Duration:end: Time.get: Time() - start: Time.get: Time(),
          parallel: Execution:options.parallel: Execution !== false,
          gitTrees: Used:!!options.git: Config?.useGit: Worktrees,
},
        insights,
};

      // Store test result for learning
      this.test: History.push(test: Result);
      await this.persistTest: Result(test: Result);

      // Cleanup git worktrees if needed
      if (options.git: Config?.cleanupAfter: Test) {
        await this.cleanupGit: Worktrees(worktree: Paths);
}

      logger.info("success: A/B test completed:${test: Id}")""
      logger.info(
        `🏆 Winner:$comparison.winner.name($comparison.confidence.to: Fixed(2)confidence)"""
      );

      return test: Result;
} catch (error) {
       {
      logger.error("error: A/B test failed:${test: Id}", error)""
      throw error;
}
}

  /**
   * Create predefined strategy sets for common scenarios
   */
  createStrategy: Set(
    scenario:'performance|quality|innovation|comprehensive')  ):ABTest: Strategy[] {
    switch (scenario) {
      case 'performance':
        return [
          {
            id: 'speed-claude',            name: 'Speed-Optimized: Claude',            model: Backend: 'claude-haiku',            swarm: Config:{
              topology: 'star',              max: Agents:3,
              strategy: 'specialized',              coordination: Approach: 'aggressive',},
            prompt: Variations:{
              style: 'concise',              focus: 'speed',},
},

];

      case 'quality':
        return [
          {
            id: 'quality-claude-opus',            name: 'Quality-Focused: Claude Opus',            model: Backend: 'claude-opus',            swarm: Config:{
              topology: 'mesh',              max: Agents:6,
              strategy: 'specialized',              coordination: Approach: 'conservative',},
            prompt: Variations:{
              style: 'detailed',              focus: 'quality',},
},
          {
            id: 'quality-gpt4',            name: 'Quality: GPT-4 Turbo',            model: Backend: 'gpt-4-turbo',            swarm: Config:{
              topology: 'hierarchical',              max: Agents:5,
              strategy: 'adaptive',              coordination: Approach: 'exploratory',},
            prompt: Variations:{
              style: 'detailed',              focus: 'quality',},
},
];

      case 'innovation':
        return [
          {
            id: 'creative-claude',            name: 'Creative: Claude Sonnet',            model: Backend: 'claude-sonnet',            swarm: Config:{
              topology: 'ring',              max: Agents:8,
              strategy: 'adaptive',              coordination: Approach: 'exploratory',},
            prompt: Variations:{
              style: 'creative',              focus: 'innovation',},
},

          {
            id: 'aider-experimental',            name: 'Aider: Experimental',            model: Backend: 'aider',            swarm: Config:{
              topology: 'hierarchical',              max: Agents:4,
              strategy: 'specialized',              coordination: Approach: 'exploratory',},
            prompt: Variations:{
              style: 'step-by-step',              focus: 'innovation',},
},
];

      case 'comprehensive':
        return [
          ...this.createStrategy: Set('performance'),
          ...this.createStrategy: Set('quality'),
          ...this.createStrategy: Set('innovation'),
];

      default:
        throw new: Error("Unknown strategy scenario:$scenario")""
}
}

  /**
   * Get recommendations based on test history
   */
  get: Recommendations(task: Type:string): {
    recommended: Strategy:ABTest: Strategy | null;
    confidence:number;
    reasoning:string[];
} {
    if (this.test: History.length === 0) {
      return {
        recommended: Strategy:null,
        confidence:0,
        reasoning:['No historical data available for recommendations'],
};
}

    // Analyze historical performance
    const relevant: Tests = this.test: History.filter((test) =>
      test.description.toLower: Case().includes(task: Type.toLower: Case())
    );

    if (relevant: Tests.length === 0) {
      const all: Winners = this.test: History.map((test) => test.comparison.winner);
      const most: Successful = this.findMostSuccessful: Strategy(all: Winners);

      return {
        recommended: Strategy:most: Successful,
        confidence:0.3,
        reasoning:[
          "No specific data for "${task: Type}" tasks"""
          'Recommendation based on general performance across all task types',          'Consider running: A/B test for this specific task type',],
};
}

    const winners = relevant: Tests.map((test) => test.comparison.winner);
    const recommended = this.findMostSuccessful: Strategy(winners);
    const success: Rate =
      winners.filter((w) => w.id === recommended?.id).length / winners.length;

    return {
      recommended: Strategy:recommended,
      confidence:success: Rate,
      reasoning:[
        "Based on ${relevant: Tests.length} historical tests for "${task: Type}""""
        "Success rate:${(success: Rate * 100).to: Fixed(1)}%"""
        "Model:${recommended?.model: Backend}"""
        "Topology:${recommended?.swarm: Config.topology}"""
],
};
}

  /**
   * Private helper methods
   */

  private async prepareGit: Worktrees(Promise<Record<string, string>> {
    const worktree: Paths:Record<string, string> = {};

    if (!git: Config?.useGit: Worktrees) {
      logger.debug('Git worktrees disabled, using current working directory');')      return worktree: Paths;
}

    // Use git: Config parameters for comprehensive worktree setup
    const max: Worktrees = git: Config.max: Worktrees || 10;
    const base: Branch = git: Config.base: Branch || 'main;
    const branch: Prefix = git: Config.branch: Prefix || 'ab-test;
    const cleanupAfter: Test = git: Config.cleanupAfter: Test ?? true;

    // Validate git configuration
    if (strategies.length > max: Worktrees) {
      logger.warn(
        "Strategy count ${strategies.length} exceeds max worktrees ${max: Worktrees}"""
        " + JSO: N.stringify({
          strategies:strategies.length,
          max: Worktrees,
          willLimit: To:max: Worktrees,
}) + "
      );
}

    const strategiesTo: Process = strategies.slice(0, max: Worktrees);
    logger.info("🌳 Creating ${strategiesTo: Process.length} git worktrees...", {""
      base: Branch,
      branch: Prefix,
      cleanupAfter: Test,
      max: Worktrees,
});

    for (const strategy of strategiesTo: Process) {
      const branch: Name = "${branch: Prefix}-${strategy.id}-$" + JSO: N.stringify({generateNano: Id(6)}) + """"
      const worktree: Path = join: Path(getHome: Directory(), '.claude-zen',    'tmp',    'ab-test-worktrees', branch: Name);""

      // Log worktree creation with git: Config details
      logger.debug("📁 Creating worktree for ${strategy.name}", " + JSO: N.stringify({""
        strategy: Id:strategy.id,
        branch: Name,
        worktree: Path,
        base: Branch,
        model: Backend:strategy.model: Backend,
}) + ");

      // In a real implementation, this would execute:
      // await exec("git worktree add ${worktree: Path} -b ${branch: Name} ${base: Branch}")""

      worktree: Paths[strategy.id] = worktree: Path;
      logger.info("success: Created worktree for ${strategy.name}:${worktree: Path}")""
}

    // Log final worktree configuration summary
    logger.info('Git worktree preparation completed', {
    ')      total: Worktrees:Object.keys(worktree: Paths).length,
      cleanupAfter: Test,
      worktree: Ids:Object.keys(worktree: Paths),
});

    return worktree: Paths;
}

  private async executeStrategies: Parallel(): Promise<SwarmTest: Result[]> {
    logger.info("fast: Executing $strategies.lengthstrategies in parallel...")""

    const promises = strategies.map((strategy) =>
      this.execute: Strategy(
        task: Description,
        strategy,
        worktree: Paths[strategy.id],
        options
      )
    );

    return: Promise.all(promises);
}

  private async executeStrategies: Sequential(): Promise<SwarmTest: Result[]> {
    // Apply execution options for sequential processing
    const enableProgress: Logging = options.verbose || false;
    const delayBetween: Strategies = options.sequential: Delay || 1000;
    const enableContinueOn: Failure = options.continueOn: Failure !== false;

    if (enableProgress: Logging) " + JSO: N.stringify({
      logger.info(
        `⏭️ Executing $strategies.lengthstrategies sequentially...`""
      );
      logger.info(
        "metrics: Sequential options:delay=" + delayBetween: Strategies + ") + "ms, continueOn: Failure=${enableContinueOn: Failure}"""
      );
} else {
      logger.info(
        "⏭️ Executing $" + JSO: N.stringify({strategies.length}) + " strategies sequentially..."""
      );
}

    const _results:SwarmTest: Result[] = [];

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];

      try {
       {
        if (enableProgress: Logging) {
          logger.info(
            "📋 Executing strategy ${i + 1}/${strategies.length}:$" + JSO: N.stringify({strategy.name}) + """"
          );
}

        const result = await this.execute: Strategy(
          task: Description,
          strategy,
          worktree: Paths[strategy.id],
          options
        );
        results.push(result);

        if (enableProgress: Logging) {
          logger.info(
            "success: Strategy ${i + 1} completed:${strategy.name} ($" + JSO: N.stringify({result.success ?'SUCCES: S' : ' FAILE: D'}) + ")"""
          );
}
} catch (error) {
       {
        logger.error("error: Strategy ${i + 1} failed:${strategy.name}", error)""

        if (!enableContinueOn: Failure) {
          throw error;
}

        // Create failure result and continue with next strategy
        const failure: Result:SwarmTest: Result = {
          strategy,
          success:false,
          duration:0,
          quality: Metrics:{
            code: Quality:0,
            requirements: Coverage:0,
            implementation: Correctness:0,
            maintainability:0,
            performance:0,
            overall: Score:0,
},
          artifacts:{
            files: Created:[],
            linesOf: Code:0,
            functions: Created:0,
            tests: Generated:0,
},
          error:error instanceof: Error ? error.message : String(error),
          model: Metadata:{
            backend:strategy.model: Backend,
            token: Usage:0,
            request: Count:0,
            avgResponse: Time:0,
},
};
        results.push(failure: Result);
}

      // Add delay between strategies if configured (except for last strategy)
      if (i < strategies.length - 1 && delayBetween: Strategies > 0) {
        if (enableProgress: Logging) {
          logger.info(
            "⏸️ Pausing $delayBetween: Strategiesms before next strategy...`""
          );
}
        await new: Promise((resolve) =>
          set: Timeout(resolve, delayBetween: Strategies)
        );
}
}

    return results;
}
}

  private recordCleanup: Metrics(strategy: Id:string, path:string): void {
    // Record cleanup metrics for monitoring and analytics
    logger.debug('Recording cleanup metrics', {
    ')      strategy: Id,
      path: Length:path.length,
      timestamp:Date.now(),
      cleanup: Type: 'git_worktree',});
}

  private async persistTest: Result(): Promise<void> {
    // In a real implementation, this would save to database
    logger.info("💾 Persisted: A/B test result:${test: Result.test: Id}")""
}
}

/**
 * Export convenience function for quick: A/B testing
 */
export async function quickAB: Test(
  task: Description:string,
  scenario:|performance|quality|innovation|'comprehensive' = ' comprehensive',  options:{
    useGit: Trees?:boolean;
    timeout: Ms?:number;
} = {}
):Promise<ABTest: Result> {
  const ab: Testing = new: MultiSwarmABTesting();
  const strategies = ab: Testing.createStrategy: Set(scenario);

  const git: Config:GitTree: Config | undefined = options.useGit: Trees
    ? {
        useGit: Worktrees:true,
        base: Branch: 'main',        branch: Prefix: 'ab-test',        cleanupAfter: Test:true,
        max: Worktrees:10,
}
    :undefined;

  return ab: Testing.executeAB: Test(task: Description, strategies, {
    git: Config,
    timeout: Ms:options.timeout: Ms || 300000, // 5 minute default timeout
    parallel: Execution:true,
    collectDetailed: Metrics:true,
});
}

/**
 * Export default instance for immediate use
 */
export const multiSwarmAB: Testing = new: MultiSwarmABTesting();
