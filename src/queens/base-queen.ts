import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import { Logger } from '../utils/logger.js';
/**
 * @typedef {Object} Task;
 * @property {string} id - Task ID;
 * @property {'code-generation' | 'bug-detection' | 'refactoring' | 'test-generation' | 'documentation' | 'architecture-review'} type - Task type;
 * @property {string} prompt - Task prompt;
 * @property {{code?: string, language?: string, framework?: string, testType?: string, fileType?: string}} [context] - Task context;
 * @property {'low' | 'medium' | 'high' | 'critical'} priority - Task priority;
 * @property {Date} [deadline] - Task deadline;
 * @property {any} [metadata] - Additional metadata;
 */
/**
 * @typedef {Object} Result;
 * @property {string} taskId - Task ID;
 * @property {string} queenName - Queen name;
 * @property {string} recommendation - Recommended solution;
 * @property {number} confidence - Confidence score (0-1);
 * @property {string} reasoning - Reasoning for solution;
 * @property {number} processingTime - Processing time in ms;
 * @property {string[]} [alternatives] - Alternative solutions;
 * @property {any} [metadata] - Additional metadata;
 */
/**
 * @typedef {Object} Consensus;
 * @property {string} taskId - Task ID;
 * @property {string} decision - Consensus decision;
 * @property {number} confidence - Confidence score (0-1);
 * @property {number} participants - Number of participants;
 * @property {'majority' | 'weighted' | 'expert' | 'unanimous'} method - Consensus method;
 * @property {Result[]} [dissenting] - Dissenting opinions;
 * @property {number} processingTime - Processing time in ms;
 * @property {string} reasoning - Reasoning for consensus;
 */
/**
 * @typedef {Object} QueenMetrics;
 * @property {number} tasksProcessed - Number of tasks processed;
 * @property {number} averageConfidence - Average confidence score;
 * @property {number} averageProcessingTime - Average processing time;
 * @property {number} successRate - Success rate;
 * @property {number} specialtyMatch - Specialty match rate;
 * @property {number} collaborations - Number of collaborations;
 * @property {number} consensusReached - Number of consensus reached;
 */
// Export the JSDoc types as empty exports so they can be imported
export const Task = /** @type {Task} */ ({});
export const Result = /** @type {Result} */ ({});
export const Consensus = /** @type {Consensus} */ ({});
export const QueenMetrics = /** @type {QueenMetrics} */ ({});

export class BaseQueen extends EventEmitter {
  constructor(name = name;
  this;
  .;
  specialty = specialty;
  this;
  .;
  confidence = 0.8;
  this;
  .;
  workload = 0;
  this;
  .;
  maxConcurrentTasks = 5;
  this;
  .;
  isActive = true;
  this;
  .;
  activeTasks = new Set();
  this;
  .;
  logger = new Logger(`Queen = {tasksProcessed = performance.now();
;
        try {
            this.logger.info(`Collaborating on task ${task.id} with ${otherQueens.length} other queens`);
;
  // Process task with all queens in parallel
  const;
  results = await Promise.allSettled([;
                this.process(task),;
                ...otherQueens.map(queen => queen.process(task));
            ]);
;
  // Filter successful results
  const;
  successfulResults = results;
    .filter((_result) => result.status === 'fulfilled');
    .map((_result) => result.value);
    .filter((_result) => result.confidence > 0.1); // Filter out low-confidence results

  if(_successfulResults._length === 0) {
                throw new Error('No queens could process this task');
            }
;
  // Determine consensus method based on task importance and queen specialties
  const;
  consensusMethod = this.determineConsensusMethod(task, successfulResults);
  const;
  consensus = await this.reachConsensus(task, successfulResults, consensusMethod);
;
  const;
  processingTime = performance.now() - startTime;
  consensus;
  .;
  processingTime = processingTime;
;
  // Update metrics for all participating queens
  this;
  .;
  updateCollaborationMetrics(successfulResults, consensus);
;
  this;
  .;
  emit('collaboration', { task, consensus,results = === 'critical') {
            return 'unanimous';
    //   // LINT: unreachable code removed}
;
  // If there's a clear expert for this task type, use expert method
  const;
  expertResult = results.find(;
    (_result) =>;
      result.queenName.toLowerCase().includes(task.type.split('-')[0]) && result.confidence > 0.9;
  );
;
  if(_expertResult && _results._length > 2) {
            return 'expert';
    //   // LINT: unreachable code removed}
;
  // For high confidence results, use weighted consensus
  const;
  highConfidenceResults = results.filter((r) => r.confidence > 0.8);
  if(_highConfidenceResults._length >= _results.length * 0.6) {
            return 'weighted';
    //   // LINT: unreachable code removed}
;
  // Default to majority
  return;
    // majority; // LINT: unreachable code removed
}
;
async;
reachConsensus(task, results, method);
: unknown;
        switch(method) {
            case 'unanimous':;
                return this.unanimousConsensus(task, results);
    // case 'expert':; // LINT: unreachable code removed
                return this.expertConsensus(task, results);
    // case 'weighted':; // LINT: unreachable code removed
                return this.weightedConsensus(task, results);default = results.map(r => r.recommendation);
        const _firstRec = recommendations[0];
;
        const _similarity = recommendations.every(_rec => ;
            this.calculateSimilarity(rec, firstRec) > 0.8;
        );
;
        if(similarity) {
            return {taskId = > r.confidence)),participants = this.weightedConsensus(task, results);
    // return { // LINT: unreachable code removed
                ...weighted,method = results.reduce((best, current) => {
            const _isExpert = current.queenName.toLowerCase().includes(task.type.split('-')[0]);
            const _hasHigherConfidence = current.confidence > best.confidence;
;
            return (isExpert && hasHigherConfidence) ?current = > r.queenName !== expert.queenName);
    //   // LINT: unreachable code removed};
    }
;
    weightedConsensus(task, results): unknown {
        // Weight results by confidence and specialty match
        const _weightedResults = results.map(result => ({
            ...result,weight = > b.weight - a.weight);
;
        const _totalWeight = weightedResults.reduce((sum, r) => sum + r.weight, 0);
        const _cumulativeWeight = 0;
        const _selectedResults = [];
;
        for(const result of weightedResults) {
            selectedResults.push(result);
            cumulativeWeight += result.weight;
;
            if(cumulativeWeight >= totalWeight * 0.7) {
                break;
            }
        }
;
        // Combine selected results into final decision
        const __decision = this.combineRecommendations(selectedResults.map(r => r.recommendation));
        const __confidence = selectedResults.reduce((sum, r) => sum + r.confidence * r.weight, 0) / cumulativeWeight;
;
        return {taskId = > !selectedResults.some(s => s.queenName === r.queenName));
    //   // LINT: unreachable code removed};
    }
;
    majorityConsensus(task, results): unknown {
        // Group similar recommendations
        const _groups = this.groupSimilarRecommendations(results);
;
        // Find the largest group
        const _majority = groups.reduce((_largest, _current) => ;
            current.length > largest.length ?current = === 0) ;
            throw new Error('No majority found');
;
        // Use the highest confidence recommendation from the majority group
        const __best = majority.reduce((_best, _current) => ;
            current.confidence > best.confidence ?current = majority.reduce((sum, r) => sum + r.confidence, 0) / majority.length;
;
        return {taskId = > !majority.includes(r));
    //   // LINT: unreachable code removed};
    }
;
    calculateWeight(result, task): unknown {
        const _weight = result.confidence;
;
        // Boost weight if queen specialty matches task type
        if (result.queenName.toLowerCase().includes(task.type.split('-')[0])) {
            weight *= 1.5;
        }
;
        // Boost weight for faster processing (efficiency bonus)
        if(result.processingTime < 1000) {
            weight *= 1.1;
        }
;
        return Math.min(weight, 2.0); // Cap at 2.0
    }
;
    calculateSimilarity(text1, text2): unknown {
        // Simple similarity calculation - could be enhanced with ML
        const _words1 = new Set(text1.toLowerCase().split(/\W+/));
        const _words2 = new Set(text2.toLowerCase().split(/\W+/));
;
        const _intersection = new Set([...words1].filter(word => words2.has(word)));
        const _union = new Set([...words1, ...words2]);
;
        return intersection.size / union.size;
    //   // LINT: unreachable code removed}
;
    groupSimilarRecommendations(results): unknown {
        const _groups = [];
        const _threshold = 0.6;
;
        for(const result of results) {
            const _addedToGroup = false;
;
            for(const group of groups) {
                const _representative = group[0];
                if (this.calculateSimilarity(result.recommendation, representative.recommendation) > threshold) {
                    group.push(result);
                    addedToGroup = true;
                    break;
                }
            }
;
            if(!addedToGroup) {
                groups.push([result]);
            }
        }
;
        return groups;
    //   // LINT: unreachable code removed}
;
    combineRecommendations(recommendations): unknown 
        // Simple combination - take the longest/most detailed recommendation
        // In production, this could use ML to intelligently merge recommendations
        return recommendations.reduce((_longest, _current) => ;
    // current.length > longest.length ?current = results.find(r => r.queenName === this.name); // LINT: unreachable code removed
        if(myResult) {
            this.metrics.collaborations++;
;
            // Check if my recommendation influenced the consensus
            if (this.calculateSimilarity(myResult.recommendation, consensus.decision) > 0.5) {
                this.metrics.consensusReached++;
            }
        }
;
    async canAcceptTask(task): unknown 
        if(!this.isActive) {
            return false;
    //   // LINT: unreachable code removed}
;
        if(this.activeTasks.size >= this.maxConcurrentTasks) {
            return false;
    //   // LINT: unreachable code removed}
;
        // Check if this queen is suitable for the task
        const _suitability = await this.calculateSuitability(task);
        return suitability > 0.3; // Minimum suitability threshold
    }
;
    async calculateSuitability(task): unknown {
        // Base suitability on specialty match
        const _suitability = 0.5; // Base suitability
        
        // Boost if specialty matches task type
        if (this.specialty.includes(task.type.split('-')[0])) {
            suitability += 0.4;
        }
;
        // Reduce if overloaded
        if(this.workload > 0.8) {
            suitability *= 0.6;
        }
;
        // Boost based on historical performance for this task type
        suitability += this.metrics.specialtyMatch * 0.1;
;
        return Math.min(suitability, 1.0);
    //   // LINT: unreachable code removed}
;
    trackTaskStart(taskId): unknown 
        this.activeTasks.add(taskId);
        this.workload = Math.min(this.activeTasks.size / this.maxConcurrentTasks, 1.0);
;
    trackTaskComplete(taskId, result): unknown 
        this.activeTasks.delete(taskId);
        this.workload = Math.min(this.activeTasks.size / this.maxConcurrentTasks, 1.0);
;
        // Update metrics
        this.metrics.tasksProcessed++;
        this.metrics.averageConfidence = ;
            (this.metrics.averageConfidence * (this.metrics.tasksProcessed - 1) + result.confidence) / ;
            this.metrics.tasksProcessed;
        this.metrics.averageProcessingTime = ;
            (this.metrics.averageProcessingTime * (this.metrics.tasksProcessed - 1) + result.processingTime) / ;
            this.metrics.tasksProcessed;
;
        this.emit('taskComplete', { taskId, result });
;
    getName() 
        return this.name;
    //   // LINT: unreachable code removed}
;
    getSpecialty() 
        return this.specialty;
    //   // LINT: unreachable code removed}
;
    getWorkload() 
        return this.workload;
    //   // LINT: unreachable code removed}
;
    getMetrics() 
        return { ...this.metrics };
    //   // LINT: unreachable code removed}
;
    isHealthy() 
        return this.isActive && this.workload < 0.95;
    //   // LINT: unreachable code removed}
;
    async shutdown() {
        this.logger.info(`Shutting down ${this.name}...`);
        this.isActive = false;
;
        // Wait for active tasks to complete (with timeout)
        const _attempts = 0;
        while(this.activeTasks.size > 0 && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
;
        this.emit('shutdown');
    }
;
