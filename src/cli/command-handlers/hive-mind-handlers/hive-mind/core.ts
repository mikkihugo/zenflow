/**
 * Hive Mind Core System;
 * Central orchestration and coordination logic;
 */

import EventEmitter from 'node:events';
import { MCPToolWrapper } from './mcp-wrapper.js';
import { PerformanceOptimizer } from './performance-optimizer.js';
/**
 * HiveMindCore - Main orchestration class;
 */
export class HiveMindCore extends EventEmitter {
  constructor(metaRegistryManager = {}): unknown {
    super();

    this.metaRegistryManager = metaRegistryManager;
    this.defaultRegistry = null;
    this.hierarchicalTaskManagerPlugin = null;

    this.config = {
      objective = {status = new MCPToolWrapper({
      parallel,timeout = new PerformanceOptimizer({
      enableAsyncQueue,
      _enableBatchProcessing => {
      this.state.metrics.tasksCreated++;
      // Auto-scaling check will now query ruv-swarm for pending tasks and idle workers
// await this._checkAutoScale();
    }
  )

  this;

  on('task => {
      this.state.metrics.tasksCompleted++;
  await;
  this;

  _updatePerformanceMetrics();
}
  )
  this

  on('task => {
      console.warn(`Task failed =>;
  {
  this.
  state;

  metrics;

  decisionsReached;
  ++
}
)
this.on('worker => {
      // This event is now largely handled by ruv-swarm's internal task assignment
      console.warn('[HiveMindCore] worker => {
      console.error('Hive Mind Error => {
      console.warn(`Performance auto-tuned = $
{
  data.newValue;
}
`);
this.emit('performance => {
      console.error('Performance optimizer error => {;
this.emit('performance = (this.state.metrics.tasksFailed  ?? 0) + 1;
// Ruv-swarm handles task retry and recovery internally
console.warn('[HiveMindCore] Task failure handling is deprecated. RuvSwarm handles recovery.');
// Log the failure to memory via mcpWrapper
this.mcpWrapper.executeTool('memory_usage', {action = 'initializing';
// Get default registry and hierarchical task manager plugin
this.defaultRegistry = this.metaRegistryManager.getRegistry('default');
if (!this.defaultRegistry) {
  throw new Error('Default MetaRegistry not found.');
}
this.hierarchicalTaskManagerPlugin = this.defaultRegistry.pluginSystem.getPlugin(;
('hierarchical-task-manager');
)
if (!this.hierarchicalTaskManagerPlugin) {
  throw new Error('HierarchicalTaskManagerPlugin not found in MetaRegistry.');
}
// Initialize ruv-swarm via mcpWrapper
// await this.mcpWrapper.initialize();
// Initialize swarm with MCP tools (now directly using ruv-swarm via mcpWrapper)
// const _swarmInitResult = awaitthis.mcpWrapper.executeTool('swarm_init', {topology = swarmInitResult.swarmId;
// Store initial configuration in memory (via mcpWrapper, which uses ruv-swarm's memory)
// await this.mcpWrapper.executeTool('memory_usage', {action = 'ready';
this.emit('initialized', {swarmId = 'error';
this.emit('error', error);
throw error;
}
  }
/**
 * Determine optimal topology based on objective;
 */
_determineTopology();
{
  // If user explicitly provided topology, use it
  if (this.config.topology) {
    return this.config.topology;
    //   // LINT: unreachable code removed}

  const _objective = this.config.objective.toLowerCase();

  // Heuristic topology selection
  if (objective.includes('research')  ?? objective.includes('analysis')) {
    return 'mesh'; // Peer-to-peer for collaborative research
  } else if (objective.includes('build')  ?? objective.includes('develop')) {
    return 'hierarchical'; // Clear command structure for development
  } else if (objective.includes('monitor')  ?? objective.includes('maintain')) {
    return 'ring'; // Circular for continuous monitoring
  } else if (objective.includes('coordinate')  ?? objective.includes('orchestrate')) {
    return 'star'; // Centralized for coordination
  }

  return 'hierarchical'; // Default
}

/**
 * Spawn the queen coordinator;
 */;
async;
spawnQueen(queenData);
: unknown;

    try {
      // Batch spawn agents in parallel with optimized chunking
      const _groupedTypes = this._groupAgentTypes(workerTypes);
      const _allResults = [];

      for(const group of groupedTypes) {
        const _batch = group.map((_type) => ({tool = await this.mcpWrapper.executeParallel(batch);
        allResults.push(...groupResults);

        // Store agent information in memory (via mcpWrapper)
        for(const result of groupResults) {
          if(result?.agentId && !result.error) {
// await this.mcpWrapper.executeTool('memory_usage', {action = Date.now() - startTime;
      this._trackSpawnPerformance(workerTypes.length, spawnTime);

      // Store worker info in memory (via mcpWrapper)
// await this.mcpWrapper.executeTool('memory_usage', {action = > ({ id: r.agentId,type = 5, metadata = {}): unknown {
    const _timestamp = Date.now();
    const _randomPart = Math.random().toString(36).substring(2, 11); // Use substring instead of substr
    const __taskId = `;
task - $;
{
  timestamp;
}
-$;
{
  randomPart;
}
`;

    const __task = {id = await this.mcpWrapper.executeParallel([;
      {tool = orchestrateResult.taskId;

    this.emit('task = description.toLowerCase().split(/\s+/);
    const _complexityKeywords = {simple = 1;
    for(const word of words) {
      if (_complexityKeywords._complex._includes(_word)) score += 3;
      else if (complexityKeywords.medium.includes(word)) score += 2;
      else if (complexityKeywords.simple.includes(word)) score += 1;
    }

    return Math.min(score * 5000, 60000); // Cap at 1 minute
  }

  /**
   * Analyze task complexity;
   */;
  _analyzeTaskComplexity(description): unknown {
    const __words = description.toLowerCase().split(/\s+/);

      }
    }

    return 'medium';
    //   // LINT: unreachable code removed}

  /**
   * Find best worker for task (optimized async version);
   */;
  _findBestWorkerAsync(task): unknown ;
    // Ruv-swarm handles worker assignment internally via task orchestration
    console.warn('[HiveMindCore] _findBestWorkerAsync is deprecated. RuvSwarm handles worker assignment.');
    return null;
    // ; // LINT: unreachable code removed
  /**
   * Synchronous version for backward compatibility;
   */;
  _findBestWorker(task): unknown ;
    // Ruv-swarm handles worker assignment internally via task orchestration
    console.warn('[HiveMindCore] _findBestWorker is deprecated. RuvSwarm handles worker assignment.');
    return null;
    // ; // LINT: unreachable code removed
  /**
   * Assign task to worker;
   */;
  async _assignTask(workerId, taskId): unknown ;
    // Ruv-swarm handles task assignment internally
    console.warn('[HiveMindCore] _assignTask is deprecated. RuvSwarm handles task assignment.');

  /**
   * Execute task with performance optimization;
   */;
  _executeTask(workerId, taskId): unknown ;
    // Ruv-swarm handles task execution internally
    console.warn('[HiveMindCore] _executeTask is deprecated. RuvSwarm handles task execution.');

  /**
   * Assign next task to idle worker;
   */;
  _assignNextTask(workerId): unknown ;
    // Ruv-swarm handles task assignment internally
    console.warn('[HiveMindCore] _assignNextTask is deprecated. RuvSwarm handles task assignment.');

  /**
   * Build consensus for decision;
   */;
  async buildConsensus(topic, options): unknown {
    const _decision = {id = Array.from(this.state.workers.values());
    const _votes = {};

    // Each worker votes
    workers.forEach((worker) => {
      const _vote = options[Math.floor(Math.random() * options.length)];
      votes[worker.id] = vote;
      decision.votes.set(worker.id, vote);
    });

    // Queen gets weighted vote
    const _queenVote = options[Math.floor(Math.random() * options.length)];
    votes.queen = queenVote;
    decision.votes.set('queen', queenVote);

    // Calculate consensus
    const _result = this._calculateConsensus(decision);
    decision.result = result.decision;
    decision.confidence = result.confidence;
    decision.status = 'completed';

    // Convert Map to plain object for proper JSON serialization

    const _voteCount = {};

    // Count votes
    votes.forEach((vote) => {
      voteCount[vote] = (voteCount[vote]  ?? 0) + 1;
    });

    switch(decision.algorithm) {
      case 'majority': {
        // Simple majority
        const __sorted = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);

        return {decision = decision.votes.get('queen');
    // voteCount[queenVote] = (voteCount[queenVote]  ?? 0) + 2; // Queen counts as 3 votes // LINT: unreachable code removed

        const __weightedSorted = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);

        return {decision = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
    // const _byzantineWinner = byzantineSorted[0]; // LINT: unreachable code removed
        const _byzantineConfidence = byzantineWinner[1] / votes.length;

        if(byzantineConfidence >= 0.67) {
          return {decision = (await this.mcpWrapper.executeTool('swarm_status', {swarmId = (await this.mcpWrapper.executeTool('swarm_status', {swarmId = await this._determineWorkerType();
    // await this.spawnWorkers([newWorkerType]); // LINT: unreachable code removed
      console.warn(`;
Auto-scaled = (await this.mcpWrapper.executeTool('swarm_status', { swarmId = {};
// Analyze pending tasks to determine needed worker type (simulated for now)
// In a real scenario, ruv-swarm's neural capabilities would inform this.
typeScores.coder = 1; // Default to coder for now

// Return type with highest score
const _sorted = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
return sorted.length > 0 ? sorted[0][0] : 'coder'; // Default to coder
}
/**
 * Update performance metrics;
 */
async
_updatePerformanceMetrics()
{
  // Calculate performance metrics

  // Store metrics in memory (via mcpWrapper, which uses ruv-swarm's memory)
// await this.mcpWrapper.executeTool('memory_usage', {action = === 0) {
      await this.mcpWrapper.analyzePerformance(this.state.swarmId);
}
}
/**
 * Handle errors;
 */
_handleError(error)
: unknown
{
  // Log error to memory (via mcpWrapper, which uses ruv-swarm's memory)
  this.mcpWrapper.executeTool('memory_usage', {action = await this.mcpWrapper.executeTool('swarm_status', {swarmId = > a.role === 'worker'), // Filter for workerstasks = 'shutting_down';

    try {
      // Generate final performance report
      const _performanceReport = this.performanceOptimizer.generatePerformanceReport();
  // Save final state and performance report (via mcpWrapper, which uses ruv-swarm's memory)
// await this.mcpWrapper.executeTool('memory_usage', {action = 'shutdown';
  this.emit('shutdown', { performanceReport });
}
catch (error)
{
  this.emit('error', { type: 'shutdown_failed', error });
  throw error;
}
}
/**
 * Get performance insights and recommendations;
 */
getPerformanceInsights()
{
  return this.performanceOptimizer.generatePerformanceReport();
}
}
}
