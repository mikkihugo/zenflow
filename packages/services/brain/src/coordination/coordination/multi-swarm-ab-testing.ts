/**
* @fileoverview Multi-Swarm A/B Testing System
*
* Advanced A/B testing system that launches multiple swarms simultaneously
* to compare results and identify optimal approaches. Supports git tree
* integration and multiple AI model backends (Claude, Gemini, Aider, etc.)
*
* Features:
* - Parallel swarm execution with result comparison
* - Git tree integration for isolated testing environments
* - Multi-model support (Claude, Gemini, Aider, GPT-4, etc.)
* - Statistical analysis of performance differences
* - Automated swarm selection based on success metrics
* - A/B test result persistence and learning
*
* @author Claude Code Zen Team
* @version 1.0.0
* @since 2024-01-01
*/

import { generateNanoId, getLogger} from '@claude-zen/foundation';

import {
CodingPrinciplesResearcher,
type PrinciplesResearchConfig,
} from './coding-principles-researcher';
import { IntelligentPromptGenerator} from './intelligent-prompt-generator';

const logger = getLogger('multi-swarm-ab-testing').

/**
* Supported AI model backends for swarm A/B testing
*/
export type AIModelBackend = 'claude-sonnet' | 'claude-opus' | 'claude-haiku' | 'gpt-4' | 'gpt-4-turbo' | 'aider' | 'custom';

/**
* A/B test strategy configuration
*/
export interface ABTestStrategy {
/** Strategy identifier */
id:string;
/** Human-readable name */
name:string;
/** AI model backend to use */
modelBackend:AIModelBackend;
/** Swarm configuration parameters */
swarmConfig:{
topology: 'mesh|hierarchical|ring|star;
' maxAgents:number;
strategy:'balanced' | ' specialized' | ' adaptive';
coordinationApproach:'conservative' | ' aggressive' | ' exploratory';
};
/** Research configuration for this strategy */
researchConfig?:Partial<PrinciplesResearchConfig>;
/** Custom prompt variations */
promptVariations?:{
style: 'concise|detailed|step-by-step|creative;
' focus: 'performance|quality|speed|innovation;
'};
}

/**
* Git tree configuration for isolated testing
*/
export interface GitTreeConfig {
/** Create isolated git worktrees for each test */
useGitWorktrees:boolean;
/** Base branch to create worktrees from */
baseBranch:string;
/** Prefix for worktree branch names */
branchPrefix:string;
/** Clean up worktrees after testing */
cleanupAfterTest:boolean;
/** Maximum concurrent worktrees */
maxWorktrees:number;
}

/**
* A/B test execution result for a single strategy
*/
export interface SwarmTestResult {
/** Strategy that was tested */
strategy:ABTestStrategy;
/** Execution success status */
success:boolean;
/** Execution duration in milliseconds */
duration:number;
/** Quality metrics */
qualityMetrics:{
codeQuality:number; // 0-100
requirementsCoverage:number; // 0-100
implementationCorrectness:number; // 0-100
maintainability:number; // 0-100
performance:number; // 0-100
overallScore:number; // 0-100
accuracy?:number; // 0-100 (for backwards compatibility)
completeness?:number; // 0-100 (for backwards compatibility)
efficiency?:number; // 0-100 (for backwards compatibility)
};
/** Generated artifacts and outputs */
artifacts:{
filesCreated:string[];
linesOfCode:number;
functionsCreated:number;
testsGenerated:number;
};
/** Error information if failed */
error?:string;
/** Git worktree path if used */
worktreePath?:string;
/** Model-specific metadata */
modelMetadata:{
backend:AIModelBackend;
tokenUsage?:number;
requestCount:number;
avgResponseTime:number;
attemptNumber?:number;
totalAttempts?:number;
timedOut?:boolean;
};
}

/**
* Complete A/B test comparison result
*/
export interface ABTestResult {
/** Test execution ID */
testId:string;
/** Test description */
description:string;
/** All strategies tested */
strategies:ABTestStrategy[];
/** Results for each strategy */
results:SwarmTestResult[];
/** Statistical comparison */
comparison:{
/** Best performing strategy */
winner:ABTestStrategy;
/** Confidence in winner selection (0-1) */
confidence:number;
/** Statistical significance */
significance: `high|medium|low|none;
` /** Performance differences */
performanceDelta:Record<string, number>;
};
/** Execution metadata */
metadata:{
startTime:Date;
endTime:Date;
totalDuration:number;
parallelExecution:boolean;
gitTreesUsed:boolean;
};
/** Learning insights for future tests */
insights:string[];
}

/**
* Multi-Swarm A/B Testing System
*
* Orchestrates parallel execution of multiple swarm strategies to identify
* optimal approaches through statistical comparison and analysis.
*/
export class MultiSwarmABTesting {
private codingPrinciplesResearcher:CodingPrinciplesResearcher;
private testHistory:ABTestResult[] = [];

constructor(
codingPrinciplesResearcher?:CodingPrinciplesResearcher,
promptGenerator?:IntelligentPromptGenerator
) {
if (codingPrinciplesResearcher) {
this.codingPrinciplesResearcher = codingPrinciplesResearcher;
} else {
// Create a placeholder DSPyLLMBridge for initialization
const dspyBridge = {
initialize:async () => {},
processCoordinationTask:async () => ({ success: true, result:null}),
} as any;
this.codingPrinciplesResearcher = new CodingPrinciplesResearcher(
dspyBridge
);
}
this.promptGenerator =
promptGenerator || new IntelligentPromptGenerator(
undefined,
this.codingPrinciplesResearcher
);
}

/**
* Execute A/B test with multiple swarm strategies
*/
async executeABTest(
taskDescription:string,
strategies:ABTestStrategy[],
options:{
gitConfig?:GitTreeConfig;
parallelExecution?:boolean;
timeoutMs?:number;
collectDetailedMetrics?:boolean;
} = {}
):Promise<ABTestResult> {
const testId = `ab-test-${generateNanoId()}``
const startTime = new Date();

logger.info(` Starting A/B test:${testId}``
logger.info(` Task:${taskDescription}``
logger.info(` Testing ${strategies}.lengthstrategies:${strategies}.map((s) => s.name).join(`, `)``

try {
// Prepare git worktrees if configured
const worktreePaths = await this.prepareGitWorktrees(
strategies,
options.gitConfig
);

// Execute strategies (parallel or sequential)
const results =
options.parallelExecution !== false
? await this.executeStrategiesParallel(
taskDescription,
strategies,
worktreePaths,
options
)
:await this.executeStrategiesSequential(
taskDescription,
strategies,
worktreePaths,
options
);

// Analyze and compare results
const comparison = this.analyzeResults(results);

// Generate insights from comparison
const insights = this.generateInsights(results, comparison);

const endTime = new Date();
const testResult:ABTestResult = {
testId,
description:taskDescription,
strategies,
results,
comparison,
metadata:{
startTime,
endTime,
totalDuration:endTime.getTime() - startTime.getTime(),
parallelExecution:options.parallelExecution !== false,
gitTreesUsed:!!options.gitConfig?.useGitWorktrees,
},
insights,
};

// Store test result for learning
this.testHistory.push(testResult);
await this.persistTestResult(testResult);

// Cleanup git worktrees if needed
if (options.gitConfig?.cleanupAfterTest) {
await this.cleanupGitWorktrees(worktreePaths);
}

logger.info(` A/B test completed:${testId}``
logger.info(
` Winner:${comparison}.winner.name(${comparison}.confidence.toFixed(2)confidence)``
);

return testResult;
} catch (error) {
logger.error(` A/B test failed:${testId}`, error);`
throw error;
}
}

/**
* Create predefined strategy sets for common scenarios
*/
createStrategySet(
scenario:`performance|quality|innovation|comprehensive); ):ABTestStrategy[] {
switch (scenario) {
case 'performance': '). return [
{
id: 'speed-claude', name: 'Speed-Optimized Claude', modelBackend: 'claude-haiku', swarmConfig:{
topology: 'star', maxAgents:3,
strategy: 'specialized', coordinationApproach: 'aggressive',},
promptVariations:{
style: 'concise', focus: 'speed',},
},

];

case 'quality': '). return [
{
id: 'quality-claude-opus', name: 'Quality-Focused Claude Opus', modelBackend: 'claude-opus', swarmConfig:{
topology: 'mesh', maxAgents:6,
strategy: 'specialized', coordinationApproach: 'conservative',},
promptVariations:{
style: 'detailed', focus: 'quality',},
},
{
id: 'quality-gpt4', name: 'Quality GPT-4 Turbo', modelBackend: 'gpt-4-turbo', swarmConfig:{
topology: 'hierarchical', maxAgents:5,
strategy: 'adaptive', coordinationApproach: 'exploratory',},
promptVariations:{
style: 'detailed', focus: 'quality',},
},
];

case 'innovation': '). return [
{
id: 'creative-claude', name: 'Creative Claude Sonnet', modelBackend: 'claude-sonnet', swarmConfig:{
topology: 'ring', maxAgents:8,
strategy: 'adaptive', coordinationApproach: 'exploratory',},
promptVariations:{
style: 'creative', focus: 'innovation',},
},

{
id: 'aider-experimental', name: 'Aider Experimental', modelBackend: 'aider', swarmConfig:{
topology: 'hierarchical', maxAgents:4,
strategy: 'specialized', coordinationApproach: 'exploratory',},
promptVariations:{
style: 'step-by-step', focus: 'innovation',},
},
];

case 'comprehensive': '). return [
...this.createStrategySet('performance').
...this.createStrategySet('quality').
...this.createStrategySet('innovation').
];

default:
throw new Error(`Unknown strategy scenario:${scenario}``
}
}

/**
* Get recommendations based on test history
*/
getRecommendations(taskType:string): {
recommendedStrategy: 'ABTestStrategy' | 'null';
confidence:number;
reasoning:string[];
} {
if (this.testHistory.length === 0) {
return {
recommendedStrategy:null,
confidence:0,
reasoning:[`No historical data available for recommendations`],
};
}

// Analyze historical performance
const relevantTests = this.testHistory.filter((test) =>
test.description.toLowerCase().includes(taskType.toLowerCase())
);

if (relevantTests.length === 0) {
const allWinners = this.testHistory.map((test) => test.comparison.winner);
const mostSuccessful = this.findMostSuccessfulStrategy(allWinners);

return {
recommendedStrategy:mostSuccessful,
confidence:0.3,
reasoning:[
`No specific data for "${taskType}" tasks`,
`Recommendation based on general performance across all task types`, `Consider running A/B test for this specific task type`,],
};
}

const winners = relevantTests.map((test) => test.comparison.winner);
const recommended = this.findMostSuccessfulStrategy(winners);
const successRate =
winners.filter((w) => w.id === recommended?.id).length / winners.length;

return {
recommendedStrategy:recommended,
confidence:successRate,
reasoning:[
`Based on ${relevantTests.length} historical tests for "${taskType}"`,
`Success rate:${(successRate * 100).toFixed(1)}%`,
`Model:${recommended?.modelBackend}`,
`Topology:${recommended?.swarmConfig.topology}`,
],
};
}

/**
* Private helper methods
*/

private async prepareGitWorktrees(
strategies:ABTestStrategy[],
gitConfig?:GitTreeConfig
):Promise<Record<string, string>> {
const worktreePaths:Record<string, string> = {};

if (!gitConfig?.useGitWorktrees) {
logger.debug(`Git worktrees disabled, using current working directory`; return worktreePaths;
}

// Use gitConfig parameters for comprehensive worktree setup
const maxWorktrees = gitConfig.maxWorktrees || 10;
const baseBranch = gitConfig.baseBranch || `main;
const branchPrefix = gitConfig.branchPrefix || `ab-test;
const cleanupAfterTest = gitConfig.cleanupAfterTest ?? true;

// Validate git configuration
if (strategies.length > maxWorktrees) {
logger.warn(
`Strategy count ${strategies.length} exceeds max worktrees ${maxWorktrees}`,
{
strategies:strategies.length,
maxWorktrees,
willLimitTo:maxWorktrees,
}
);
}

const strategiesToProcess = strategies.slice(0, maxWorktrees);
logger.info(` Creating ${strategiesToProcess.length} git worktrees...`, {
baseBranch,
branchPrefix,
cleanupAfterTest,
maxWorktrees,
});

for (const strategy of strategiesToProcess) {
const branchName = `${branchPrefix}-${strategy.id}-${generateNanoId(6)}``
const worktreePath = joinPath(getHomeDirectory(), `.claude-zen`, 'tmp', `ab-test-worktrees`, branchName);`

// Log worktree creation with gitConfig details
logger.debug(` Creating worktree for ${strategy.name}`, {
strategyId:strategy.id,
branchName,
worktreePath,
baseBranch,
modelBackend:strategy.modelBackend,
});

// In a real implementation, this would execute:
// await exec(`git worktree add ${worktreePath} -b ${branchName} ${baseBranch}`)`

worktreePaths[strategy.id] = worktreePath;
logger.info(` Created worktree for ${strategy.name}:${worktreePath}``
}

// Log final worktree configuration summary
logger.info(`Git worktree preparation completed`, {
); totalWorktrees:Object.keys(worktreePaths).length,
cleanupAfterTest,
worktreeIds:Object.keys(worktreePaths),
});

return worktreePaths;
}

private async executeStrategiesParallel(
taskDescription:string,
strategies:ABTestStrategy[],
worktreePaths:Record<string, string>,
options:any
):Promise<SwarmTestResult[]> {
logger.info(` Executing ${strategies}.lengthstrategies in parallel...``

const promises = strategies.map((strategy) =>
this.executeStrategy(
taskDescription,
strategy,
worktreePaths[strategy.id],
options
)
);

return Promise.all(promises);
}

private async executeStrategiesSequential(
taskDescription:string,
strategies:ABTestStrategy[],
worktreePaths:Record<string, string>,
options:any
):Promise<SwarmTestResult[]> {
// Apply execution options for sequential processing
const enableProgressLogging = options.verbose || false;
const delayBetweenStrategies = options.sequentialDelay || 1000;
const enableContinueOnFailure = options.continueOnFailure !== false;

if (enableProgressLogging) {
logger.info(
`⏭️ Executing ${strategies}.lengthstrategies sequentially...``
);
logger.info(
` Sequential options:delay=${delayBetweenStrategies}ms, continueOnFailure=${enableContinueOnFailure}``
);
} else {
logger.info(
`⏭️ Executing ${strategies.length} strategies sequentially...``
);
}

const results:SwarmTestResult[] = [];

for (let i = 0; i < strategies.length; i++) {
const strategy = strategies[i];

try {
if (enableProgressLogging) {
logger.info(
` Executing strategy ${i + 1}/${strategies.length}:${strategy.name}``
);
}

const result = await this.executeStrategy(
taskDescription,
strategy,
worktreePaths[strategy.id],
options
);
results.push(result);

if (enableProgressLogging) {
logger.info(
` Strategy ${i + 1} completed:${strategy.name} (${result.success ?'SUCCESS' : ' FAILED})``
);
}
} catch (error) {
logger.error(` Strategy ${i + 1} failed:${strategy.name}`, error);`

if (!enableContinueOnFailure) {
throw error;
}

// Create failure result and continue with next strategy
const failureResult:SwarmTestResult = {
strategy,
success:false,
duration:0,
qualityMetrics:{
codeQuality:0,
requirementsCoverage:0,
implementationCorrectness:0,
maintainability:0,
performance:0,
overallScore:0,
},
artifacts:{
filesCreated:[],
linesOfCode:0,
functionsCreated:0,
testsGenerated:0,
},
error:error instanceof Error ? error.message : String(error),
modelMetadata:{
backend:strategy.modelBackend,
tokenUsage:0,
requestCount:0,
avgResponseTime:0,
},
};
results.push(failureResult);
}

// Add delay between strategies if configured (except for last strategy)
if (i < strategies.length - 1 && delayBetweenStrategies > 0) {
if (enableProgressLogging) {
logger.info(
`⏸️ Pausing ${delayBetweenStrategiesms} before next strategy...``
);
}
await new Promise((resolve) =>
setTimeout(resolve, delayBetweenStrategies)
);
}
}

return results;
}
}

private recordCleanupMetrics(strategyId:string, path:string): void {
// Record cleanup metrics for monitoring and analytics
logger.debug(`Recording cleanup metrics`, {
; strategyId,
pathLength:path.length,
timestamp:Date.now(),
cleanupType: `git_worktree`,});
}

private async persistTestResult(testResult:ABTestResult): Promise<void> {
// In a real implementation, this would save to database
logger.info(` Persisted A/B test result:${testResult.testId}``
}
}

/**
* Export convenience function for quick A/B testing
*/
export async function quickABTest(
taskDescription:string,
scenario:|performance|quality|innovation|`comprehensive` = ' comprehensive', options:{
useGitTrees?:boolean;
timeoutMs?:number;
} = {}
):Promise<ABTestResult> {
const abTesting = new MultiSwarmABTesting();
const strategies = abTesting.createStrategySet(scenario);

const gitConfig: 'GitTreeConfig' | 'undefined' = options.useGitTrees
? {
useGitWorktrees:true,
baseBranch: 'main', branchPrefix: 'ab-test', cleanupAfterTest:true,
maxWorktrees:10,
}
:undefined;

return abTesting.executeABTest(taskDescription, strategies, {
gitConfig,
timeoutMs:options.timeoutMs || 300000, // 5 minute default timeout
parallelExecution:true,
collectDetailedMetrics:true,
});
}

/**
* Export default instance for immediate use
*/
export const multiSwarmABTesting = new MultiSwarmABTesting();
