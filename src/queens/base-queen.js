import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { Logger } from '../utils/logger.js';

export interface Task {
    id: string;
    type: 'code-generation' | 'bug-detection' | 'refactoring' | 'test-generation' | 'documentation' | 'architecture-review';
    prompt: string;
    context?: {
        code?: string;
        language?: string;
        framework?: string;
        testType?: string;
        fileType?: string;
    };
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: Date;
    metadata?: any;
}

export interface Result {
    taskId: string;
    queenName: string;
    recommendation: string;
    confidence: number;
    reasoning: string;
    processingTime: number;
    alternatives?: string[];
    metadata?: any;
}

export interface Consensus {
    taskId: string;
    decision: string;
    confidence: number;
    participants: number;
    method: 'majority' | 'weighted' | 'expert' | 'unanimous';
    dissenting?: Result[];
    processingTime: number;
    reasoning: string;
}

export interface QueenMetrics {
    tasksProcessed: number;
    averageConfidence: number;
    averageProcessingTime: number;
    successRate: number;
    specialtyMatch: number;
    collaborations: number;
    consensusReached: number;
}

export abstract class BaseQueen extends EventEmitter {
    protected name: string;
    protected specialty: string;
    protected confidence = 0.8;
    protected workload = 0;
    protected maxConcurrentTasks = 5;
    protected logger: Logger;
    protected metrics: QueenMetrics;
    protected isActive = true;
    private activeTasks = new Set<string>();

    constructor(name: string, specialty: string) {
        super();
        this.name = name;
        this.specialty = specialty;
        this.logger = new Logger(`Queen:${name}`);
        this.metrics = {
            tasksProcessed: 0,
            averageConfidence: 0,
            averageProcessingTime: 0,
            successRate: 0,
            specialtyMatch: 0,
            collaborations: 0,
            consensusReached: 0
        };
    }

    abstract async process(task: Task): Promise<Result>;

    async collaborate(task: Task, otherQueens: BaseQueen[]): Promise<Consensus> {
        const startTime = performance.now();
        
        try {
            this.logger.info(`Collaborating on task ${task.id} with ${otherQueens.length} other queens`);
            
            // Process task with all queens in parallel
            const results = await Promise.allSettled([
                this.process(task),
                ...otherQueens.map(queen => queen.process(task))
            ]);

            // Filter successful results
            const successfulResults: Result[] = results
                .filter(result => result.status === 'fulfilled')
                .map(result => (result as PromiseFulfilledResult<Result>).value)
                .filter(result => result.confidence > 0.1); // Filter out low-confidence results

            if (successfulResults.length === 0) {
                throw new Error('No queens could process this task');
            }

            // Determine consensus method based on task importance and queen specialties
            const consensusMethod = this.determineConsensusMethod(task, successfulResults);
            const consensus = await this.reachConsensus(task, successfulResults, consensusMethod);
            
            const processingTime = performance.now() - startTime;
            consensus.processingTime = processingTime;

            // Update metrics for all participating queens
            this.updateCollaborationMetrics(successfulResults, consensus);
            
            this.emit('collaboration', { task, consensus, results: successfulResults });
            this.logger.info(`Consensus reached for task ${task.id}: ${consensusMethod} method, confidence: ${consensus.confidence}`);
            
            return consensus;
        } catch (error) {
            this.logger.error(`Collaboration failed for task ${task.id}:`, error);
            throw error;
        }
    }

    private determineConsensusMethod(task: Task, results: Result[]): 'majority' | 'weighted' | 'expert' | 'unanimous' {
        // Critical tasks require unanimous consensus
        if (task.priority === 'critical') {
            return 'unanimous';
        }

        // If there's a clear expert for this task type, use expert method
        const expertResult = results.find(result => 
            result.queenName.toLowerCase().includes(task.type.split('-')[0]) && 
            result.confidence > 0.9
        );
        
        if (expertResult && results.length > 2) {
            return 'expert';
        }

        // For high confidence results, use weighted consensus
        const highConfidenceResults = results.filter(r => r.confidence > 0.8);
        if (highConfidenceResults.length >= results.length * 0.6) {
            return 'weighted';
        }

        // Default to majority
        return 'majority';
    }

    private async reachConsensus(task: Task, results: Result[], method: string): Promise<Consensus> {
        switch (method) {
            case 'unanimous':
                return this.unanimousConsensus(task, results);
            case 'expert':
                return this.expertConsensus(task, results);
            case 'weighted':
                return this.weightedConsensus(task, results);
            case 'majority':
            default:
                return this.majorityConsensus(task, results);
        }
    }

    private unanimousConsensus(task: Task, results: Result[]): Consensus {
        // Check if all results are substantially similar
        const recommendations = results.map(r => r.recommendation);
        const firstRec = recommendations[0];
        
        const similarity = recommendations.every(rec => 
            this.calculateSimilarity(rec, firstRec) > 0.8
        );

        if (similarity) {
            return {
                taskId: task.id,
                decision: firstRec,
                confidence: Math.min(...results.map(r => r.confidence)),
                participants: results.length,
                method: 'unanimous',
                processingTime: 0,
                reasoning: 'All queens reached unanimous agreement'
            };
        } else {
            // Fall back to weighted consensus with lower confidence
            const weighted = this.weightedConsensus(task, results);
            return {
                ...weighted,
                method: 'unanimous',
                confidence: weighted.confidence * 0.7,
                reasoning: 'Unanimous consensus failed, used weighted fallback with reduced confidence'
            };
        }
    }

    private expertConsensus(task: Task, results: Result[]): Consensus {
        // Find the expert for this task type
        const expert = results.reduce((best, current) => {
            const isExpert = current.queenName.toLowerCase().includes(task.type.split('-')[0]);
            const hasHigherConfidence = current.confidence > best.confidence;
            
            return (isExpert && hasHigherConfidence) ? current : best;
        });

        return {
            taskId: task.id,
            decision: expert.recommendation,
            confidence: expert.confidence,
            participants: results.length,
            method: 'expert',
            processingTime: 0,
            reasoning: `Expert ${expert.queenName} provided the most authoritative answer`,
            dissenting: results.filter(r => r.queenName !== expert.queenName)
        };
    }

    private weightedConsensus(task: Task, results: Result[]): Consensus {
        // Weight results by confidence and specialty match
        const weightedResults = results.map(result => ({
            ...result,
            weight: this.calculateWeight(result, task)
        }));

        // Sort by weight and take top results that comprise 70% of total weight
        weightedResults.sort((a, b) => b.weight - a.weight);
        
        const totalWeight = weightedResults.reduce((sum, r) => sum + r.weight, 0);
        let cumulativeWeight = 0;
        const selectedResults = [];
        
        for (const result of weightedResults) {
            selectedResults.push(result);
            cumulativeWeight += result.weight;
            
            if (cumulativeWeight >= totalWeight * 0.7) {
                break;
            }
        }

        // Combine selected results into final decision
        const decision = this.combineRecommendations(selectedResults.map(r => r.recommendation));
        const confidence = selectedResults.reduce((sum, r) => sum + r.confidence * r.weight, 0) / cumulativeWeight;

        return {
            taskId: task.id,
            decision,
            confidence,
            participants: results.length,
            method: 'weighted',
            processingTime: 0,
            reasoning: `Weighted consensus from ${selectedResults.length} top-performing queens`,
            dissenting: results.filter(r => !selectedResults.some(s => s.queenName === r.queenName))
        };
    }

    private majorityConsensus(task: Task, results: Result[]): Consensus {
        // Group similar recommendations
        const groups = this.groupSimilarRecommendations(results);
        
        // Find the largest group
        const majority = groups.reduce((largest, current) => 
            current.length > largest.length ? current : largest
        );

        if (majority.length === 0) {
            throw new Error('No majority found');
        }

        // Use the highest confidence recommendation from the majority group
        const best = majority.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
        );

        const confidence = majority.reduce((sum, r) => sum + r.confidence, 0) / majority.length;

        return {
            taskId: task.id,
            decision: best.recommendation,
            confidence,
            participants: results.length,
            method: 'majority',
            processingTime: 0,
            reasoning: `Majority of ${majority.length}/${results.length} queens agreed`,
            dissenting: results.filter(r => !majority.includes(r))
        };
    }

    private calculateWeight(result: Result, task: Task): number {
        let weight = result.confidence;
        
        // Boost weight if queen specialty matches task type
        if (result.queenName.toLowerCase().includes(task.type.split('-')[0])) {
            weight *= 1.5;
        }
        
        // Boost weight for faster processing (efficiency bonus)
        if (result.processingTime < 1000) {
            weight *= 1.1;
        }
        
        return Math.min(weight, 2.0); // Cap at 2.0
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Simple similarity calculation - could be enhanced with ML
        const words1 = new Set(text1.toLowerCase().split(/\W+/));
        const words2 = new Set(text2.toLowerCase().split(/\W+/));
        
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    private groupSimilarRecommendations(results: Result[]): Result[][] {
        const groups: Result[][] = [];
        const threshold = 0.6;
        
        for (const result of results) {
            let addedToGroup = false;
            
            for (const group of groups) {
                const representative = group[0];
                if (this.calculateSimilarity(result.recommendation, representative.recommendation) > threshold) {
                    group.push(result);
                    addedToGroup = true;
                    break;
                }
            }
            
            if (!addedToGroup) {
                groups.push([result]);
            }
        }
        
        return groups;
    }

    private combineRecommendations(recommendations: string[]): string {
        // Simple combination - take the longest/most detailed recommendation
        // In production, this could use ML to intelligently merge recommendations
        return recommendations.reduce((longest, current) => 
            current.length > longest.length ? current : longest
        );
    }

    private updateCollaborationMetrics(results: Result[], consensus: Consensus): void {
        // Update metrics for this queen if it participated
        const myResult = results.find(r => r.queenName === this.name);
        if (myResult) {
            this.metrics.collaborations++;
            
            // Check if my recommendation influenced the consensus
            if (this.calculateSimilarity(myResult.recommendation, consensus.decision) > 0.5) {
                this.metrics.consensusReached++;
            }
        }
    }

    async canAcceptTask(task: Task): Promise<boolean> {
        if (!this.isActive) {
            return false;
        }
        
        if (this.activeTasks.size >= this.maxConcurrentTasks) {
            return false;
        }
        
        // Check if this queen is suitable for the task
        const suitability = await this.calculateSuitability(task);
        return suitability > 0.3; // Minimum suitability threshold
    }

    protected async calculateSuitability(task: Task): Promise<number> {
        // Base suitability on specialty match
        let suitability = 0.5; // Base suitability
        
        // Boost if specialty matches task type
        if (this.specialty.includes(task.type.split('-')[0])) {
            suitability += 0.4;
        }
        
        // Reduce if overloaded
        if (this.workload > 0.8) {
            suitability *= 0.6;
        }
        
        // Boost based on historical performance for this task type
        suitability += this.metrics.specialtyMatch * 0.1;
        
        return Math.min(suitability, 1.0);
    }

    protected trackTaskStart(taskId: string): void {
        this.activeTasks.add(taskId);
        this.workload = Math.min(this.activeTasks.size / this.maxConcurrentTasks, 1.0);
    }

    protected trackTaskComplete(taskId: string, result: Result): void {
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

    getName(): string {
        return this.name;
    }

    getSpecialty(): string {
        return this.specialty;
    }

    getWorkload(): number {
        return this.workload;
    }

    getMetrics(): QueenMetrics {
        return { ...this.metrics };
    }

    isHealthy(): boolean {
        return this.isActive && this.workload < 0.95;
    }

    async shutdown(): Promise<void> {
        this.logger.info(`Shutting down ${this.name}...`);
        this.isActive = false;
        
        // Wait for active tasks to complete (with timeout)
        let attempts = 0;
        while (this.activeTasks.size > 0 && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        this.emit('shutdown');
    }
}