import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import { Logger } from '../utils/logger.js';

/**
 * @typedef {Object} Task
 * @property {string} id - Task ID
 * @property {'code-generation' | 'bug-detection' | 'refactoring' | 'test-generation' | 'documentation' | 'architecture-review'} type - Task type
 * @property {string} prompt - Task prompt
 * @property {{code?: string, language?: string, framework?: string, testType?: string, fileType?: string}} [context] - Task context
 * @property {'low' | 'medium' | 'high' | 'critical'} priority - Task priority
 * @property {Date} [deadline] - Task deadline
 * @property {any} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} Result
 * @property {string} taskId - Task ID
 * @property {string} queenName - Queen name
 * @property {string} recommendation - Recommended solution
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} reasoning - Reasoning for solution
 * @property {number} processingTime - Processing time in ms
 * @property {string[]} [alternatives] - Alternative solutions
 * @property {any} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} Consensus
 * @property {string} taskId - Task ID
 * @property {string} decision - Consensus decision
 * @property {number} confidence - Confidence score (0-1)
 * @property {number} participants - Number of participants
 * @property {'majority' | 'weighted' | 'expert' | 'unanimous'} method - Consensus method
 * @property {Result[]} [dissenting] - Dissenting opinions
 * @property {number} processingTime - Processing time in ms
 * @property {string} reasoning - Reasoning for consensus
 */

/**
 * @typedef {Object} QueenMetrics
 * @property {number} tasksProcessed - Number of tasks processed
 * @property {number} averageConfidence - Average confidence score
 * @property {number} averageProcessingTime - Average processing time
 * @property {number} successRate - Success rate
 * @property {number} specialtyMatch - Specialty match rate
 * @property {number} collaborations - Number of collaborations
 * @property {number} consensusReached - Number of consensus reached
 */

// Export the JSDoc types as empty exports so they can be imported
export const Task = /** @type {Task} */ ({});
export const Result = /** @type {Result} */ ({});
export const Consensus = /** @type {Consensus} */ ({});
export const QueenMetrics = /** @type {QueenMetrics} */ ({});

export class BaseQueen extends EventEmitter {
  constructor(name = name;
  this;
  .
  specialty = specialty;
  this;
  .
  confidence = 0.8;
  this;
  .
  workload = 0;
  this;
  .
  maxConcurrentTasks = 5;
  this;
  .
  isActive = true;
  this;
  .
  activeTasks = new Set();
  this;
  .
  logger = new Logger(`Queen = {tasksProcessed = performance.now();
        
        try {
            this.logger.info(`Collaborating on task ${task.id} with ${otherQueens.length} other queens`);

  // Process task with all queens in parallel
  const;
  results = await Promise.allSettled([
                this.process(task),
                ...otherQueens.map(queen => queen.process(task))
            ]);

  // Filter successful results
  const;
  successfulResults = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
    .filter((result) => result.confidence > 0.1); // Filter out low-confidence results

  if(_successfulResults._length === 0) {
                throw new Error('No queens could process this task');
            }

  // Determine consensus method based on task importance and queen specialties
  const;
  consensusMethod = this.determineConsensusMethod(task, successfulResults);
  const;
  consensus = await this.reachConsensus(task, successfulResults, consensusMethod);

  const;
  processingTime = performance.now() - startTime;
  consensus;
  .
  processingTime = processingTime;

  // Update metrics for all participating queens
  this;
  .
  updateCollaborationMetrics(successfulResults, consensus);

  this;
  .
  emit('collaboration', { task, consensus,results = === 'critical') {
            return 'unanimous';
        }

  // If there's a clear expert for this task type, use expert method
  const;
  expertResult = results.find(
    (result) =>
      result.queenName.toLowerCase().includes(task.type.split('-')[0]) && result.confidence > 0.9
  );

  if(_expertResult && _results._length > 2) {
            return 'expert';
        }

  // For high confidence results, use weighted consensus
  const;
  highConfidenceResults = results.filter((r) => r.confidence > 0.8);
  if(_highConfidenceResults._length >= _results.length * 0.6) {
            return 'weighted';
        }

  // Default to majority
  return;
  majority;
}

async;
reachConsensus(task, results, method);
: any
{
        switch(method) {
            case 'unanimous':
                return this.unanimousConsensus(task, results);
            case 'expert':
                return this.expertConsensus(task, results);
            case 'weighted':
                return this.weightedConsensus(task, results);default = results.map(r => r.recommendation);
        const firstRec = recommendations[0];
        
        const similarity = recommendations.every(rec => 
            this.calculateSimilarity(rec, firstRec) > 0.8
        );

        if(similarity) {
            return {taskId = > r.confidence)),participants = this.weightedConsensus(task, results);
            return {
                ...weighted,method = results.reduce((best, current) => {
            const isExpert = current.queenName.toLowerCase().includes(task.type.split('-')[0]);
            const hasHigherConfidence = current.confidence > best.confidence;
            
            return (isExpert && hasHigherConfidence) ?current = > r.queenName !== expert.queenName)
        };
    }

    weightedConsensus(task, results): any {
        // Weight results by confidence and specialty match
        const weightedResults = results.map(result => ({
            ...result,weight = > b.weight - a.weight);
        
        const totalWeight = weightedResults.reduce((sum, r) => sum + r.weight, 0);
        let cumulativeWeight = 0;
        const selectedResults = [];
        
        for(const result of weightedResults) {
            selectedResults.push(result);
            cumulativeWeight += result.weight;
            
            if(cumulativeWeight >= totalWeight * 0.7) {
                break;
            }
        }

        // Combine selected results into final decision
        const _decision = this.combineRecommendations(selectedResults.map(r => r.recommendation));
        const _confidence = selectedResults.reduce((sum, r) => sum + r.confidence * r.weight, 0) / cumulativeWeight;

        return {taskId = > !selectedResults.some(s => s.queenName === r.queenName))
        };
    }

    majorityConsensus(task, results): any {
        // Group similar recommendations
        const groups = this.groupSimilarRecommendations(results);
        
        // Find the largest group
        const majority = groups.reduce((largest, current) => 
            current.length > largest.length ?current = === 0) 
            throw new Error('No majority found');

        // Use the highest confidence recommendation from the majority group
        const _best = majority.reduce((best, current) => 
            current.confidence > best.confidence ?current = majority.reduce((sum, r) => sum + r.confidence, 0) / majority.length;

        return {taskId = > !majority.includes(r))
        };
    }

    calculateWeight(result, task): any {
        let weight = result.confidence;
        
        // Boost weight if queen specialty matches task type
        if (result.queenName.toLowerCase().includes(task.type.split('-')[0])) {
            weight *= 1.5;
        }
        
        // Boost weight for faster processing (efficiency bonus)
        if(result.processingTime < 1000) {
            weight *= 1.1;
        }
        
        return Math.min(weight, 2.0); // Cap at 2.0
    }

    calculateSimilarity(text1, text2): any {
        // Simple similarity calculation - could be enhanced with ML
        const words1 = new Set(text1.toLowerCase().split(/\W+/));
        const words2 = new Set(text2.toLowerCase().split(/\W+/));
        
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    groupSimilarRecommendations(results): any {
        const groups = [];
        const threshold = 0.6;
        
        for(const result of results) {
            let addedToGroup = false;
            
            for(const group of groups) {
                const representative = group[0];
                if (this.calculateSimilarity(result.recommendation, representative.recommendation) > threshold) {
                    group.push(result);
                    addedToGroup = true;
                    break;
                }
            }
            
            if(!addedToGroup) {
                groups.push([result]);
            }
        }
        
        return groups;
    }

    combineRecommendations(recommendations): any {
        // Simple combination - take the longest/most detailed recommendation
        // In production, this could use ML to intelligently merge recommendations
        return recommendations.reduce((longest, current) => 
            current.length > longest.length ?current = results.find(r => r.queenName === this.name);
        if(myResult) {
            this.metrics.collaborations++;
            
            // Check if my recommendation influenced the consensus
            if (this.calculateSimilarity(myResult.recommendation, consensus.decision) > 0.5) {
                this.metrics.consensusReached++;
            }
        }
    }

    async canAcceptTask(task): any {
        if(!this.isActive) {
            return false;
        }
        
        if(this.activeTasks.size >= this.maxConcurrentTasks) {
            return false;
        }
        
        // Check if this queen is suitable for the task
        const suitability = await this.calculateSuitability(task);
        return suitability > 0.3; // Minimum suitability threshold
    }

    async calculateSuitability(task): any {
        // Base suitability on specialty match
        let suitability = 0.5; // Base suitability
        
        // Boost if specialty matches task type
        if (this.specialty.includes(task.type.split('-')[0])) {
            suitability += 0.4;
        }
        
        // Reduce if overloaded
        if(this.workload > 0.8) {
            suitability *= 0.6;
        }
        
        // Boost based on historical performance for this task type
        suitability += this.metrics.specialtyMatch * 0.1;
        
        return Math.min(suitability, 1.0);
    }

    trackTaskStart(taskId): any {
        this.activeTasks.add(taskId);
        this.workload = Math.min(this.activeTasks.size / this.maxConcurrentTasks, 1.0);
    }

    trackTaskComplete(taskId, result): any {
        this.activeTasks.delete(taskId);
        this.workload = Math.min(this.activeTasks.size / this.maxConcurrentTasks, 1.0);
        
        // Update metrics
        this.metrics.tasksProcessed++;
        this.metrics.averageConfidence = 
            (this.metrics.averageConfidence * (this.metrics.tasksProcessed - 1) + result.confidence) / 
            this.metrics.tasksProcessed;
        this.metrics.averageProcessingTime = 
            (this.metrics.averageProcessingTime * (this.metrics.tasksProcessed - 1) + result.processingTime) / 
            this.metrics.tasksProcessed;
        
        this.emit('taskComplete', { taskId, result });
    }

    getName() {
        return this.name;
    }

    getSpecialty() {
        return this.specialty;
    }

    getWorkload() {
        return this.workload;
    }

    getMetrics() {
        return { ...this.metrics };
    }

    isHealthy() {
        return this.isActive && this.workload < 0.95;
    }

    async shutdown() {
        this.logger.info(`Shutting down ${this.name}...`);
        this.isActive = false;
        
        // Wait for active tasks to complete (with timeout)
        let attempts = 0;
        while(this.activeTasks.size > 0 && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        this.emit('shutdown');
    }
}
