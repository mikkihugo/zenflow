/**
 * @fileoverview GEPAML - ML-Enhanced Genetic Programming and Evolution
 *
 * Advanced ML-enhanced version of GEPA teleprompter using battle-tested
 * Rust crates (smartcore, statrs, argmin) and sophisticated evolutionary
 * algorithms with genetic programming capabilities.
 *
 * Key ML Enhancements:
 * - Genetic programming with adaptive mutation and crossover rates
 * - Multi-population evolution with migration and diversity control
 * - Fitness landscape analysis and local search integration
 * - Advanced selection mechanisms (tournament, roulette, rank-based)
 * - Statistical convergence detection and population diversity monitoring
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { Teleprompter } from "./teleprompter";
import { DSPyModule } from "../primitives/module";
import type { HypothesisTest, Pattern } from "@claude-zen/neural-ml";
export interface GEPAMLConfig {
	populationSize: number;
	maxGenerations: number;
	eliteSize: number;
	migrationRate: number;
	crossoverRate: number;
	mutationRate: number;
	adaptiveRates: boolean;
	selectionMethod: "tournament|roulette|rank|stochastic_universal";
	useMultiPopulation: boolean;
	numPopulations: number;
	migrationInterval: number;
	isolationGenerations: number;
	useNichingAndSpeciation: boolean;
	useFitnessSharing: boolean;
	useLocalSearch: boolean;
	useCoevolution: boolean;
	diversityMaintenance: boolean;
	diversityThreshold: number;
	diversityMeasure: "hamming|euclidean|phenotypic";
	convergenceThreshold: number;
	stagnationGenerations: number;
	statisticalTests: Array<"anova|t_test|kruskal_wallis">;
	parallelEvaluation: boolean;
	cacheResults: boolean;
	maxEvaluationTime: number;
	memoryLimitMb: number;
	useFitnessLandscapeAnalysis: boolean;
	useAdaptiveMutation: boolean;
	useStatisticalSelection: boolean;
	usePredictiveModeling: boolean;
}
export interface Individual {
	genes: Float32Array;
	fitness: number;
	age: number;
	species?: number;
	parentFitnesses?: [number, number];
	metadata: {
		generation: number;
		evaluations: number;
		mutations: number;
		crossovers: number;
	};
}
export interface PopulationStats {
	generation: number;
	bestFitness: number;
	averageFitness: number;
	worstFitness: number;
	fitnessStdDev: number;
	diversity: number;
	convergenceRate: number;
	selectionPressure: number;
}
export interface GEPAMLResult {
	optimizedModule: DSPyModule;
	bestIndividual: Individual;
	finalPopulation: Individual[];
	totalGenerations: number;
	evolutionHistory: PopulationStats[];
	fitnessProgress: number[];
	diversityProgress: number[];
	adaptationHistory: {
		crossoverRates: number[];
		mutationRates: number[];
		selectionPressures: number[];
	};
	populationStats?: {
		populations: PopulationStats[];
		migrationEvents: number;
		speciesFormation: number[];
		diversityMetrics: Record<string, number[]>;
	};
	convergenceAnalysis: {
		converged: boolean;
		convergenceGeneration?: number;
		statisticalTests: HypothesisTest[];
		trendAnalysis: Pattern[];
	};
	fitnessLandscape?: {
		localOptima: number;
		globalOptimumConfidence: number;
		ruggedness: number;
		neutrality: number;
		deceptiveness: number;
	};
	executionTime: number;
	evaluationTime: number;
	totalEvaluations: number;
	cacheHitRate: number;
	memoryPeakUsage: number;
	evolutionaryInsights: string[];
	performanceRecommendations: string[];
	parameterSensitivity: Record<string, number>;
	solutionQuality: {
		robustness: number;
		generalizability: number;
		interpretability: number;
		complexity: number;
	};
}
/**
 * GEPAML - ML-Enhanced Genetic Programming and Evolution
 *
 * Provides sophisticated evolutionary algorithms with ML enhancements
 * for optimizing DSPy module configurations and architectures.
 */
export declare class GEPAML extends Teleprompter {
	private eventEmitter;
	private config;
	private logger;
	private mlEngine;
	private bayesianOptimizer;
	private multiObjectiveOptimizer;
	private statisticalAnalyzer;
	private patternLearner;
	private populations;
	private currentGeneration;
	private evolutionHistory;
	private bestIndividualOverall;
	private evaluationCount;
	private fitnessCache;
	private currentCrossoverRate;
	private currentMutationRate;
	private crossoverRateHistory;
	private mutationRateHistory;
	private selectionPressureHistory;
	private startTime?;
	private lastImprovementGeneration;
	private stagnationCounter;
	constructor(config?: Partial<GEPAMLConfig>);
	/**
	 * Emit events through internal EventEmitter
	 */
	private emit;
	/**
	 * Initialize ML components with lazy loading
	 */
	private initializeMLComponents;
	/**
	 * Compile the module with base interface compatibility
	 */
	compile(
		student: DSPyModule,
		config: {
			trainset: any[];
			teacher?: DSPyModule | null;
			valset?: any[] | null;
			[key: string]: any;
		},
	): Promise<DSPyModule>;
	/**
	 * ML-enhanced compilation with detailed results
	 */
	compileML(
		student: DSPyModule,
		teacher?: DSPyModule,
		trainset?: any[],
		valset?: any[],
	): Promise<GEPAMLResult>;
	/**
	 * Initialize multiple populations for evolution
	 */
	private initializePopulations;
	/**
	 * Main evolutionary optimization loop
	 */
	private performEvolution;
	/**
	 * Evolve a single population for one generation
	 */
	private evolvePopulation;
	/**
	 * Helper methods for genetic operations
	 */
	private generateRandomGenes;
	private evaluateFitness;
	private genesToParameters;
	private evaluateModulePerformance;
	private selectParent;
	private tournamentSelection;
	private rouletteWheelSelection;
	private rankSelection;
	private stochasticUniversalSelection;
	private crossover;
	private mutate;
	private calculateAdaptiveMutationStrength;
	private getCurrentDiversity;
	private calculateDistance;
	private performMigration;
	private updateAdaptiveParameters;
	private calculateFitnessVariance;
	private calculateSelectionPressure;
	private maintainDiversity;
	private checkEarlyConvergence;
	private calculatePopulationStats;
	private analyzeConvergence;
	private analyzeFitnessLandscape;
	private createOptimizedModule;
	private getPopulationStats;
	private calculateMigrationEvents;
	private analyzeSpeciesFormation;
	private calculateDiversityMetrics;
	private calculateEvaluationTime;
	private calculateCacheHitRate;
	private getMemoryUsage;
	private generateEvolutionaryInsights;
	private generatePerformanceRecommendations;
	private analyzeParameterSensitivity;
	private assessSolutionQuality;
}
/**
 * Factory function to create GEPAML teleprompter
 */
export declare function createGEPAML(config?: Partial<GEPAMLConfig>): GEPAML;
//# sourceMappingURL=gepa-ml.d.ts.map
