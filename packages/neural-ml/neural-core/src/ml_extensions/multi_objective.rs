//! # Multi-Objective Optimization Module
//!
//! Provides Pareto optimization, diversity preservation, and multi-objective
//! decision making for complex optimization scenarios with competing objectives.

use super::{MLError, MLResult, AsyncOptimizer, MemoryAware, GpuAccelerated, Serializable, monitoring::Timer};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use num_traits::Float;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use std::time::Duration;
use rayon::prelude::*;

/// Multi-objective solution representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Solution {
    /// Decision variables
    pub variables: Array1<f64>,
    /// Objective function values
    pub objectives: Array1<f64>,
    /// Constraint violation (if any)
    pub constraint_violation: f64,
    /// Solution rank in Pareto sorting
    pub rank: usize,
    /// Crowding distance for diversity
    pub crowding_distance: f64,
    /// Unique solution identifier
    pub id: usize,
}

impl Solution {
    /// Create new solution
    pub fn new(
        id: usize,
        variables: Array1<f64>,
        objectives: Array1<f64>,
    ) -> Self {
        Self {
            variables,
            objectives,
            constraint_violation: 0.0,
            rank: 0,
            crowding_distance: 0.0,
            id,
        }
    }
    
    /// Check if this solution dominates another
    pub fn dominates(&self, other: &Solution) -> bool {
        // For minimization problems
        let mut at_least_one_better = false;
        
        for (obj1, obj2) in self.objectives.iter().zip(other.objectives.iter()) {
            if obj1 > obj2 {
                return false; // This solution is worse in at least one objective
            }
            if obj1 < obj2 {
                at_least_one_better = true;
            }
        }
        
        at_least_one_better
    }
    
    /// Calculate Euclidean distance to another solution in objective space
    pub fn objective_distance(&self, other: &Solution) -> f64 {
        self.objectives.iter()
            .zip(other.objectives.iter())
            .map(|(a, b)| (a - b).powi(2))
            .sum::<f64>()
            .sqrt()
    }
    
    /// Calculate Euclidean distance to another solution in decision space
    pub fn variable_distance(&self, other: &Solution) -> f64 {
        self.variables.iter()
            .zip(other.variables.iter())
            .map(|(a, b)| (a - b).powi(2))
            .sum::<f64>()
            .sqrt()
    }
}

/// Dominance relationship between solutions
#[derive(Debug, Clone, PartialEq)]
pub enum Dominance {
    /// First solution dominates second
    First,
    /// Second solution dominates first
    Second,
    /// Solutions are non-dominated
    NonDominated,
}

/// Dominance checker for comparing solutions
#[derive(Debug)]
pub struct DominanceCheck {
    /// Number of objectives
    num_objectives: usize,
    /// Whether to minimize (true) or maximize (false) each objective
    minimize: Vec<bool>,
}

impl DominanceCheck {
    /// Create new dominance checker
    pub fn new(num_objectives: usize, minimize: Vec<bool>) -> MLResult<Self> {
        if minimize.len() != num_objectives {
            return Err(MLError::MultiObjectiveError(
                "Minimize vector length must match number of objectives".to_string()
            ));
        }
        
        Ok(Self {
            num_objectives,
            minimize,
        })
    }
    
    /// Create dominance checker for all minimization objectives
    pub fn minimization(num_objectives: usize) -> Self {
        Self {
            num_objectives,
            minimize: vec![true; num_objectives],
        }
    }
    
    /// Create dominance checker for all maximization objectives
    pub fn maximization(num_objectives: usize) -> Self {
        Self {
            num_objectives,
            minimize: vec![false; num_objectives],
        }
    }
    
    /// Check dominance relationship between two solutions
    pub fn check_dominance(&self, sol1: &Solution, sol2: &Solution) -> MLResult<Dominance> {
        if sol1.objectives.len() != self.num_objectives || sol2.objectives.len() != self.num_objectives {
            return Err(MLError::MultiObjectiveError(
                "Solution objective count mismatch".to_string()
            ));
        }
        
        let mut sol1_better = false;
        let mut sol2_better = false;
        
        for i in 0..self.num_objectives {
            let obj1 = sol1.objectives[i];
            let obj2 = sol2.objectives[i];
            
            let comparison = if self.minimize[i] {
                // For minimization: smaller is better
                if obj1 < obj2 {
                    sol1_better = true;
                } else if obj1 > obj2 {
                    sol2_better = true;
                }
            } else {
                // For maximization: larger is better
                if obj1 > obj2 {
                    sol1_better = true;
                } else if obj1 < obj2 {
                    sol2_better = true;
                }
            };
        }
        
        if sol1_better && !sol2_better {
            Ok(Dominance::First)
        } else if sol2_better && !sol1_better {
            Ok(Dominance::Second)
        } else {
            Ok(Dominance::NonDominated)
        }
    }
    
    /// Fast non-dominated sorting
    pub fn fast_non_dominated_sort(&self, solutions: &mut [Solution]) -> MLResult<Vec<Vec<usize>>> {
        let timer = Timer::new("DominanceCheck::fast_non_dominated_sort");
        let n = solutions.len();
        
        // Initialize dominance data structures
        let mut domination_count = vec![0; n]; // Number of solutions that dominate each solution
        let mut dominated_solutions = vec![Vec::new(); n]; // Solutions dominated by each solution
        
        // Compute dominance relationships
        for i in 0..n {
            for j in (i + 1)..n {
                match self.check_dominance(&solutions[i], &solutions[j])? {
                    Dominance::First => {
                        dominated_solutions[i].push(j);
                        domination_count[j] += 1;
                    },
                    Dominance::Second => {
                        dominated_solutions[j].push(i);
                        domination_count[i] += 1;
                    },
                    Dominance::NonDominated => {
                        // No dominance relationship
                    },
                }
            }
        }
        
        // Find first front (non-dominated solutions)
        let mut fronts = Vec::new();
        let mut current_front = Vec::new();
        
        for i in 0..n {
            if domination_count[i] == 0 {
                current_front.push(i);
                solutions[i].rank = 0;
            }
        }
        
        fronts.push(current_front.clone());
        
        // Find subsequent fronts
        let mut front_index = 0;
        while !fronts[front_index].is_empty() {
            let mut next_front = Vec::new();
            
            for &i in &fronts[front_index] {
                for &j in &dominated_solutions[i] {
                    domination_count[j] -= 1;
                    if domination_count[j] == 0 {
                        next_front.push(j);
                        solutions[j].rank = front_index + 1;
                    }
                }
            }
            
            front_index += 1;
            fronts.push(next_front);
        }
        
        // Remove empty last front
        fronts.pop();
        
        timer.finish();
        Ok(fronts)
    }
    
    /// Check if solution is feasible (no constraint violations)
    pub fn is_feasible(&self, solution: &Solution) -> bool {
        solution.constraint_violation <= 1e-10
    }
}

/// Crowding distance calculator for diversity preservation
#[derive(Debug)]
pub struct CrowdingDistance {
    /// Number of objectives
    num_objectives: usize,
}

impl CrowdingDistance {
    /// Create new crowding distance calculator
    pub fn new(num_objectives: usize) -> Self {
        Self { num_objectives }
    }
    
    /// Compute crowding distances for a front of solutions
    pub fn compute_crowding_distance(&self, solutions: &mut [Solution]) -> MLResult<()> {
        let timer = Timer::new("CrowdingDistance::compute_crowding_distance");
        let n = solutions.len();
        
        if n <= 2 {
            // All solutions get infinite crowding distance
            for solution in solutions.iter_mut() {
                solution.crowding_distance = f64::INFINITY;
            }
            timer.finish();
            return Ok(());
        }
        
        // Initialize crowding distances to 0
        for solution in solutions.iter_mut() {
            solution.crowding_distance = 0.0;
        }
        
        // For each objective
        for obj_idx in 0..self.num_objectives {
            // Sort solutions by this objective
            let mut indices: Vec<usize> = (0..n).collect();
            indices.sort_by(|&a, &b| {
                solutions[a].objectives[obj_idx]
                    .partial_cmp(&solutions[b].objectives[obj_idx])
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
            
            // Set boundary solutions to infinite distance
            solutions[indices[0]].crowding_distance = f64::INFINITY;
            solutions[indices[n - 1]].crowding_distance = f64::INFINITY;
            
            // Calculate objective range
            let obj_min = solutions[indices[0]].objectives[obj_idx];
            let obj_max = solutions[indices[n - 1]].objectives[obj_idx];
            let obj_range = obj_max - obj_min;
            
            // Skip if all solutions have same objective value
            if obj_range <= 1e-10 {
                continue;
            }
            
            // Calculate crowding distance for intermediate solutions
            for i in 1..(n - 1) {
                let current_idx = indices[i];
                let prev_obj = solutions[indices[i - 1]].objectives[obj_idx];
                let next_obj = solutions[indices[i + 1]].objectives[obj_idx];
                
                if solutions[current_idx].crowding_distance != f64::INFINITY {
                    solutions[current_idx].crowding_distance += (next_obj - prev_obj) / obj_range;
                }
            }
        }
        
        timer.finish();
        Ok(())
    }
    
    /// Select solutions based on crowding distance (larger is better)
    pub fn crowding_distance_selection(
        &self,
        solutions: &[Solution],
        num_select: usize,
    ) -> Vec<usize> {
        let mut indices: Vec<usize> = (0..solutions.len()).collect();
        
        // Sort by crowding distance (descending)
        indices.sort_by(|&a, &b| {
            solutions[b].crowding_distance
                .partial_cmp(&solutions[a].crowding_distance)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        
        indices.into_iter().take(num_select).collect()
    }
    
    /// Calculate diversity metric for a set of solutions
    pub fn calculate_diversity(&self, solutions: &[Solution]) -> f64 {
        if solutions.len() < 2 {
            return 0.0;
        }
        
        let mut total_distance = 0.0;
        let mut count = 0;
        
        for i in 0..solutions.len() {
            for j in (i + 1)..solutions.len() {
                total_distance += solutions[i].objective_distance(&solutions[j]);
                count += 1;
            }
        }
        
        if count > 0 {
            total_distance / count as f64
        } else {
            0.0
        }
    }
}

/// Hypervolume calculator for quality assessment
#[derive(Debug)]
pub struct HypervolumeCalculator {
    /// Reference point for hypervolume calculation
    reference_point: Array1<f64>,
    /// Number of objectives
    num_objectives: usize,
}

impl HypervolumeCalculator {
    /// Create new hypervolume calculator
    pub fn new(reference_point: Array1<f64>) -> Self {
        let num_objectives = reference_point.len();
        Self {
            reference_point,
            num_objectives,
        }
    }
    
    /// Calculate hypervolume using Monte Carlo estimation
    pub fn calculate_hypervolume(&self, solutions: &[Solution]) -> MLResult<f64> {
        let timer = Timer::new("HypervolumeCalculator::calculate_hypervolume");
        
        if solutions.is_empty() {
            timer.finish();
            return Ok(0.0);
        }
        
        // Find the bounds for sampling
        let mut min_bounds = self.reference_point.clone();
        let mut max_bounds = self.reference_point.clone();
        
        for solution in solutions {
            for i in 0..self.num_objectives {
                min_bounds[i] = min_bounds[i].min(solution.objectives[i]);
                max_bounds[i] = max_bounds[i].max(solution.objectives[i]);
            }
        }
        
        // Monte Carlo sampling
        let n_samples = 100000;
        let mut dominated_count = 0;
        
        for _ in 0..n_samples {
            // Generate random point
            let mut sample_point = Array1::zeros(self.num_objectives);
            for i in 0..self.num_objectives {
                sample_point[i] = min_bounds[i] + 
                    rand::random::<f64>() * (max_bounds[i] - min_bounds[i]);
            }
            
            // Check if point is dominated by any solution
            let mut is_dominated = false;
            for solution in solutions {
                let mut dominates = true;
                for i in 0..self.num_objectives {
                    if solution.objectives[i] > sample_point[i] {
                        dominates = false;
                        break;
                    }
                }
                if dominates {
                    is_dominated = true;
                    break;
                }
            }
            
            // Check if point is within reference point bounds
            let mut within_bounds = true;
            for i in 0..self.num_objectives {
                if sample_point[i] > self.reference_point[i] {
                    within_bounds = false;
                    break;
                }
            }
            
            if is_dominated && within_bounds {
                dominated_count += 1;
            }
        }
        
        // Calculate hypervolume
        let total_volume = (0..self.num_objectives)
            .map(|i| max_bounds[i] - min_bounds[i])
            .product::<f64>();
        
        let hypervolume = total_volume * (dominated_count as f64) / (n_samples as f64);
        
        timer.finish();
        Ok(hypervolume)
    }
    
    /// Calculate hypervolume contribution of individual solutions
    pub fn calculate_contributions(&self, solutions: &[Solution]) -> MLResult<Vec<f64>> {
        let timer = Timer::new("HypervolumeCalculator::calculate_contributions");
        let mut contributions = Vec::new();
        
        let total_hypervolume = self.calculate_hypervolume(solutions)?;
        
        for i in 0..solutions.len() {
            // Create subset without solution i
            let subset: Vec<&Solution> = solutions.iter()
                .enumerate()
                .filter_map(|(j, sol)| if i != j { Some(sol) } else { None })
                .collect();
            
            let subset_hypervolume = if subset.is_empty() {
                0.0
            } else {
                // Convert back to owned for the method call
                let subset_owned: Vec<Solution> = subset.into_iter().cloned().collect();
                self.calculate_hypervolume(&subset_owned)?
            };
            
            contributions.push(total_hypervolume - subset_hypervolume);
        }
        
        timer.finish();
        Ok(contributions)
    }
    
    /// Update reference point based on current solutions
    pub fn update_reference_point(&mut self, solutions: &[Solution], margin: f64) {
        for i in 0..self.num_objectives {
            let max_obj = solutions.iter()
                .map(|sol| sol.objectives[i])
                .fold(f64::NEG_INFINITY, f64::max);
            
            self.reference_point[i] = max_obj + margin;
        }
    }
}

/// Configuration for Pareto optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParetoOptimizerConfig {
    /// Population size
    pub population_size: usize,
    /// Maximum number of generations
    pub max_generations: usize,
    /// Number of objectives
    pub num_objectives: usize,
    /// Number of decision variables
    pub num_variables: usize,
    /// Variable bounds (min, max) for each variable
    pub variable_bounds: Vec<(f64, f64)>,
    /// Whether to minimize each objective
    pub minimize_objectives: Vec<bool>,
    /// Mutation probability
    pub mutation_probability: f64,
    /// Mutation strength
    pub mutation_strength: f64,
    /// Crossover probability
    pub crossover_probability: f64,
    /// Tournament size for selection
    pub tournament_size: usize,
    /// Elite preservation ratio
    pub elite_ratio: f64,
}

impl Default for ParetoOptimizerConfig {
    fn default() -> Self {
        Self {
            population_size: 100,
            max_generations: 100,
            num_objectives: 2,
            num_variables: 10,
            variable_bounds: vec![(0.0, 1.0); 10],
            minimize_objectives: vec![true, true],
            mutation_probability: 0.1,
            mutation_strength: 0.1,
            crossover_probability: 0.9,
            tournament_size: 2,
            elite_ratio: 0.1,
        }
    }
}

/// Multi-objective Pareto optimizer using NSGA-II algorithm
#[derive(Debug)]
pub struct ParetoOptimizer {
    config: ParetoOptimizerConfig,
    dominance_checker: DominanceCheck,
    crowding_distance: CrowdingDistance,
    hypervolume_calculator: Option<HypervolumeCalculator>,
    population: Vec<Solution>,
    generation: usize,
    next_solution_id: usize,
    pareto_front: Vec<Solution>,
    convergence_history: Vec<f64>,
}

impl ParetoOptimizer {
    /// Create new Pareto optimizer
    pub fn new(config: ParetoOptimizerConfig) -> MLResult<Self> {
        let dominance_checker = DominanceCheck::new(
            config.num_objectives,
            config.minimize_objectives.clone(),
        )?;
        
        let crowding_distance = CrowdingDistance::new(config.num_objectives);
        
        Ok(Self {
            config,
            dominance_checker,
            crowding_distance,
            hypervolume_calculator: None,
            population: Vec::new(),
            generation: 0,
            next_solution_id: 0,
            pareto_front: Vec::new(),
            convergence_history: Vec::new(),
        })
    }
    
    /// Set reference point for hypervolume calculation
    pub fn set_reference_point(&mut self, reference_point: Array1<f64>) -> MLResult<()> {
        if reference_point.len() != self.config.num_objectives {
            return Err(MLError::MultiObjectiveError(
                "Reference point dimension mismatch".to_string()
            ));
        }
        
        self.hypervolume_calculator = Some(HypervolumeCalculator::new(reference_point));
        Ok(())
    }
    
    /// Initialize population with random solutions
    pub fn initialize_population(&mut self) -> MLResult<()> {
        let timer = Timer::new("ParetoOptimizer::initialize_population");
        
        self.population.clear();
        
        for _ in 0..self.config.population_size {
            let mut variables = Array1::zeros(self.config.num_variables);
            
            for (i, &(min_val, max_val)) in self.config.variable_bounds.iter().enumerate() {
                variables[i] = min_val + rand::random::<f64>() * (max_val - min_val);
            }
            
            // Create solution with placeholder objectives (will be evaluated externally)
            let objectives = Array1::zeros(self.config.num_objectives);
            let solution = Solution::new(self.next_solution_id, variables, objectives);
            self.next_solution_id += 1;
            
            self.population.push(solution);
        }
        
        timer.finish();
        Ok(())
    }
    
    /// Update solution objectives after external evaluation
    pub fn update_objectives(&mut self, solution_id: usize, objectives: Array1<f64>) -> MLResult<()> {
        if objectives.len() != self.config.num_objectives {
            return Err(MLError::MultiObjectiveError(
                "Objective dimension mismatch".to_string()
            ));
        }
        
        // Find solution in population
        if let Some(solution) = self.population.iter_mut().find(|sol| sol.id == solution_id) {
            solution.objectives = objectives;
            Ok(())
        } else {
            Err(MLError::MultiObjectiveError(
                format!("Solution {} not found in population", solution_id)
            ))
        }
    }
    
    /// Perform one generation of evolution
    pub fn evolve_generation(&mut self) -> MLResult<()> {
        let timer = Timer::new("ParetoOptimizer::evolve_generation");
        
        // Create offspring through crossover and mutation
        let mut offspring = self.create_offspring()?;
        
        // Combine parent and offspring populations
        let mut combined_population = self.population.clone();
        combined_population.extend(offspring);
        
        // Perform NSGA-II selection
        self.population = self.nsga2_selection(combined_population)?;
        
        // Update Pareto front
        self.update_pareto_front()?;
        
        // Calculate convergence metric
        let hypervolume = if let Some(ref calc) = self.hypervolume_calculator {
            calc.calculate_hypervolume(&self.pareto_front)?
        } else {
            self.crowding_distance.calculate_diversity(&self.pareto_front)
        };
        
        self.convergence_history.push(hypervolume);
        self.generation += 1;
        
        timer.finish();
        Ok(())
    }
    
    /// Create offspring through crossover and mutation
    fn create_offspring(&mut self) -> MLResult<Vec<Solution>> {
        let timer = Timer::new("ParetoOptimizer::create_offspring");
        let mut offspring = Vec::new();
        
        for _ in 0..self.config.population_size {
            // Tournament selection for parents
            let parent1_idx = self.tournament_selection()?;
            let parent2_idx = self.tournament_selection()?;
            
            let parent1 = &self.population[parent1_idx];
            let parent2 = &self.population[parent2_idx];
            
            // Crossover
            let mut child_vars = if rand::random::<f64>() < self.config.crossover_probability {
                self.simulated_binary_crossover(&parent1.variables, &parent2.variables)?
            } else {
                parent1.variables.clone()
            };
            
            // Mutation
            if rand::random::<f64>() < self.config.mutation_probability {
                self.polynomial_mutation(&mut child_vars)?;
            }
            
            // Create child solution
            let objectives = Array1::zeros(self.config.num_objectives);
            let child = Solution::new(self.next_solution_id, child_vars, objectives);
            self.next_solution_id += 1;
            
            offspring.push(child);
        }
        
        timer.finish();
        Ok(offspring)
    }
    
    /// Tournament selection for parent selection
    fn tournament_selection(&self) -> MLResult<usize> {
        let mut best_idx = 0;
        let mut best_rank = usize::MAX;
        let mut best_crowding = f64::NEG_INFINITY;
        
        for _ in 0..self.config.tournament_size {
            let candidate_idx = rand::random::<usize>() % self.population.len();
            let candidate = &self.population[candidate_idx];
            
            // Select based on rank first, then crowding distance
            if candidate.rank < best_rank || 
               (candidate.rank == best_rank && candidate.crowding_distance > best_crowding) {
                best_idx = candidate_idx;
                best_rank = candidate.rank;
                best_crowding = candidate.crowding_distance;
            }
        }
        
        Ok(best_idx)
    }
    
    /// Simulated Binary Crossover (SBX)
    fn simulated_binary_crossover(
        &self,
        parent1: &Array1<f64>,
        parent2: &Array1<f64>,
    ) -> MLResult<Array1<f64>> {
        let mut child = Array1::zeros(self.config.num_variables);
        let eta_c = 20.0; // Distribution index for crossover
        
        for i in 0..self.config.num_variables {
            let p1 = parent1[i];
            let p2 = parent2[i];
            
            if (p1 - p2).abs() > 1e-14 {
                let y1 = p1.min(p2);
                let y2 = p1.max(p2);
                let (min_val, max_val) = self.config.variable_bounds[i];
                
                let rand_val = rand::random::<f64>();
                
                let beta = if rand_val <= 0.5 {
                    let alpha = 2.0 - (2.0 * rand_val).powf(1.0 / (eta_c + 1.0));
                    alpha
                } else {
                    let alpha = (1.0 / (2.0 * (1.0 - rand_val))).powf(1.0 / (eta_c + 1.0));
                    alpha
                };
                
                child[i] = 0.5 * ((y1 + y2) - beta * (y2 - y1).abs());
                
                // Bound checking
                child[i] = child[i].max(min_val).min(max_val);
            } else {
                child[i] = p1;
            }
        }
        
        Ok(child)
    }
    
    /// Polynomial mutation
    fn polynomial_mutation(&self, variables: &mut Array1<f64>) -> MLResult<()> {
        let eta_m = 20.0; // Distribution index for mutation
        
        for i in 0..self.config.num_variables {
            if rand::random::<f64>() < 1.0 / self.config.num_variables as f64 {
                let (min_val, max_val) = self.config.variable_bounds[i];
                let y = variables[i];
                
                let delta1 = (y - min_val) / (max_val - min_val);
                let delta2 = (max_val - y) / (max_val - min_val);
                
                let rnd = rand::random::<f64>();
                let mut_pow = 1.0 / (eta_m + 1.0);
                
                let deltaq = if rnd <= 0.5 {
                    let xy = 1.0 - delta1;
                    let val = 2.0 * rnd + (1.0 - 2.0 * rnd) * xy.powf(eta_m + 1.0);
                    val.powf(mut_pow) - 1.0
                } else {
                    let xy = 1.0 - delta2;
                    let val = 2.0 * (1.0 - rnd) + 2.0 * (rnd - 0.5) * xy.powf(eta_m + 1.0);
                    1.0 - val.powf(mut_pow)
                };
                
                variables[i] = y + deltaq * (max_val - min_val);
                variables[i] = variables[i].max(min_val).min(max_val);
            }
        }
        
        Ok(())
    }
    
    /// NSGA-II selection algorithm
    fn nsga2_selection(&mut self, mut population: Vec<Solution>) -> MLResult<Vec<Solution>> {
        let timer = Timer::new("ParetoOptimizer::nsga2_selection");
        
        // Fast non-dominated sorting
        let fronts = self.dominance_checker.fast_non_dominated_sort(&mut population)?;
        
        let mut new_population = Vec::new();
        
        // Add fronts until population is filled
        for front in &fronts {
            if new_population.len() + front.len() <= self.config.population_size {
                // Add entire front
                for &idx in front {
                    new_population.push(population[idx].clone());
                }
            } else {
                // Partial front - use crowding distance
                let mut front_solutions: Vec<Solution> = front.iter()
                    .map(|&idx| population[idx].clone())
                    .collect();
                
                self.crowding_distance.compute_crowding_distance(&mut front_solutions)?;
                
                // Sort by crowding distance (descending)
                front_solutions.sort_by(|a, b| {
                    b.crowding_distance.partial_cmp(&a.crowding_distance)
                        .unwrap_or(std::cmp::Ordering::Equal)
                });
                
                // Add solutions until population is full
                let remaining = self.config.population_size - new_population.len();
                for i in 0..remaining {
                    new_population.push(front_solutions[i].clone());
                }
                break;
            }
        }
        
        timer.finish();
        Ok(new_population)
    }
    
    /// Update current Pareto front
    fn update_pareto_front(&mut self) -> MLResult<()> {
        // Find first front (rank 0)
        self.pareto_front = self.population.iter()
            .filter(|sol| sol.rank == 0)
            .cloned()
            .collect();
        
        Ok(())
    }
    
    /// Get current Pareto front
    pub fn get_pareto_front(&self) -> &[Solution] {
        &self.pareto_front
    }
    
    /// Get current population
    pub fn get_population(&self) -> &[Solution] {
        &self.population
    }
    
    /// Get convergence history
    pub fn get_convergence_history(&self) -> &[f64] {
        &self.convergence_history
    }
    
    /// Get current generation number
    pub fn get_generation(&self) -> usize {
        self.generation
    }
    
    /// Check if optimization has converged
    pub fn has_converged(&self, tolerance: f64, patience: usize) -> bool {
        if self.convergence_history.len() < patience {
            return false;
        }
        
        let recent_history = &self.convergence_history[self.convergence_history.len() - patience..];
        let first = recent_history[0];
        
        recent_history.iter().all(|&val| (val - first).abs() < tolerance)
    }
    
    /// Calculate quality metrics for current front
    pub fn calculate_metrics(&self) -> MLResult<HashMap<String, f64>> {
        let mut metrics = HashMap::new();
        
        // Hypervolume
        if let Some(ref calc) = self.hypervolume_calculator {
            let hypervolume = calc.calculate_hypervolume(&self.pareto_front)?;
            metrics.insert("hypervolume".to_string(), hypervolume);
        }
        
        // Diversity
        let diversity = self.crowding_distance.calculate_diversity(&self.pareto_front);
        metrics.insert("diversity".to_string(), diversity);
        
        // Number of solutions in Pareto front
        metrics.insert("pareto_size".to_string(), self.pareto_front.len() as f64);
        
        // Average crowding distance
        if !self.pareto_front.is_empty() {
            let avg_crowding = self.pareto_front.iter()
                .filter(|sol| sol.crowding_distance != f64::INFINITY)
                .map(|sol| sol.crowding_distance)
                .sum::<f64>() / self.pareto_front.len() as f64;
            metrics.insert("avg_crowding_distance".to_string(), avg_crowding);
        }
        
        Ok(metrics)
    }
}

impl AsyncOptimizer for ParetoOptimizer {
    type Input = Vec<(usize, Array1<f64>)>; // Solution ID and objectives
    type Output = Vec<Solution>; // New solutions to evaluate
    type Config = ParetoOptimizerConfig;
    
    async fn initialize(&mut self, config: Self::Config) -> MLResult<()> {
        self.config = config;
        self.dominance_checker = DominanceCheck::new(
            self.config.num_objectives,
            self.config.minimize_objectives.clone(),
        )?;
        self.crowding_distance = CrowdingDistance::new(self.config.num_objectives);
        
        self.initialize_population()?;
        Ok(())
    }
    
    async fn optimize(&mut self, input: Self::Input, _timeout: Duration) -> MLResult<Self::Output> {
        // Update objectives for evaluated solutions
        for (solution_id, objectives) in input {
            self.update_objectives(solution_id, objectives)?;
        }
        
        // Evolve one generation
        self.evolve_generation()?;
        
        // Return new solutions that need evaluation
        Ok(self.population.clone())
    }
    
    fn get_metrics(&self) -> MLResult<super::metrics::PerformanceMetrics> {
        let quality_metrics = self.calculate_metrics()?;
        
        Ok(super::metrics::PerformanceMetrics {
            iterations: self.generation,
            best_value: quality_metrics.get("hypervolume").copied().unwrap_or(0.0),
            convergence_rate: if self.generation > 0 { 
                quality_metrics.get("diversity").copied().unwrap_or(0.0) / self.generation as f64 
            } else { 
                0.0 
            },
            memory_usage: self.population.len() * self.config.num_variables * 8,
            computation_time: Duration::from_secs(0), // Would track in real implementation
        })
    }
}

impl MemoryAware for ParetoOptimizer {
    fn check_memory_requirements(&self, config: &super::MLExtensionsConfig) -> MLResult<()> {
        let estimated = self.estimated_memory_usage();
        if estimated > config.max_memory {
            return Err(MLError::MemoryError {
                requested: estimated,
                limit: config.max_memory,
            });
        }
        Ok(())
    }
    
    fn estimated_memory_usage(&self) -> usize {
        let pop_size = self.config.population_size;
        let n_vars = self.config.num_variables;
        let n_objs = self.config.num_objectives;
        
        // Population storage
        let pop_memory = pop_size * (n_vars + n_objs) * 8; // f64 = 8 bytes
        
        // Pareto front storage
        let front_memory = pop_size * (n_vars + n_objs) * 8;
        
        // Algorithm overhead
        let overhead = pop_size * 64; // Approximate per solution
        
        pop_memory + front_memory + overhead
    }
}

impl GpuAccelerated for ParetoOptimizer {
    fn is_gpu_available(&self) -> bool {
        false // CPU-only implementation
    }
    
    fn enable_gpu(&mut self) -> MLResult<()> {
        Err(MLError::GpuError("GPU acceleration not implemented".to_string()))
    }
    
    fn disable_gpu(&mut self) {
        // No-op for CPU-only implementation
    }
}

impl Serializable for ParetoOptimizer {
    fn serialize(&self) -> MLResult<Vec<u8>> {
        let data = serde_json::to_vec(&self.config)
            .map_err(|e| MLError::SerializationError(format!("Failed to serialize ParetoOptimizer: {}", e)))?;
        Ok(data)
    }
    
    fn deserialize(data: &[u8]) -> MLResult<Self> {
        let config: ParetoOptimizerConfig = serde_json::from_slice(data)
            .map_err(|e| MLError::SerializationError(format!("Failed to deserialize ParetoOptimizer: {}", e)))?;
        
        Self::new(config)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;
    
    #[test]
    fn test_solution_dominance() {
        let sol1 = Solution::new(
            1,
            Array1::from_vec(vec![1.0, 2.0]),
            Array1::from_vec(vec![1.0, 2.0]), // Better in both objectives
        );
        
        let sol2 = Solution::new(
            2,
            Array1::from_vec(vec![2.0, 3.0]),
            Array1::from_vec(vec![2.0, 3.0]), // Worse in both objectives
        );
        
        assert!(sol1.dominates(&sol2));
        assert!(!sol2.dominates(&sol1));
    }
    
    #[test]
    fn test_dominance_check() {
        let checker = DominanceCheck::minimization(2);
        
        let sol1 = Solution::new(1, Array1::zeros(2), Array1::from_vec(vec![1.0, 2.0]));
        let sol2 = Solution::new(2, Array1::zeros(2), Array1::from_vec(vec![2.0, 3.0]));
        let sol3 = Solution::new(3, Array1::zeros(2), Array1::from_vec(vec![0.5, 4.0]));
        
        assert_eq!(checker.check_dominance(&sol1, &sol2).unwrap(), Dominance::First);
        assert_eq!(checker.check_dominance(&sol2, &sol1).unwrap(), Dominance::Second);
        assert_eq!(checker.check_dominance(&sol1, &sol3).unwrap(), Dominance::NonDominated);
    }
    
    #[test]
    fn test_fast_non_dominated_sort() {
        let checker = DominanceCheck::minimization(2);
        
        let mut solutions = vec![
            Solution::new(1, Array1::zeros(2), Array1::from_vec(vec![1.0, 3.0])),
            Solution::new(2, Array1::zeros(2), Array1::from_vec(vec![2.0, 2.0])),
            Solution::new(3, Array1::zeros(2), Array1::from_vec(vec![3.0, 1.0])),
            Solution::new(4, Array1::zeros(2), Array1::from_vec(vec![2.0, 3.0])),
        ];
        
        let fronts = checker.fast_non_dominated_sort(&mut solutions).unwrap();
        
        // First front should have solutions 1, 2, 3 (non-dominated)
        assert_eq!(fronts[0].len(), 3);
        
        // Second front should have solution 4 (dominated by others)
        assert_eq!(fronts[1].len(), 1);
        
        // Check ranks
        assert_eq!(solutions[0].rank, 0);
        assert_eq!(solutions[1].rank, 0);
        assert_eq!(solutions[2].rank, 0);
        assert_eq!(solutions[3].rank, 1);
    }
    
    #[test]
    fn test_crowding_distance() {
        let crowding_calc = CrowdingDistance::new(2);
        
        let mut solutions = vec![
            Solution::new(1, Array1::zeros(2), Array1::from_vec(vec![1.0, 3.0])),
            Solution::new(2, Array1::zeros(2), Array1::from_vec(vec![2.0, 2.0])),
            Solution::new(3, Array1::zeros(2), Array1::from_vec(vec![3.0, 1.0])),
        ];
        
        crowding_calc.compute_crowding_distance(&mut solutions).unwrap();
        
        // Boundary solutions should have infinite crowding distance
        assert_eq!(solutions[0].crowding_distance, f64::INFINITY);
        assert_eq!(solutions[2].crowding_distance, f64::INFINITY);
        
        // Middle solution should have finite crowding distance
        assert!(solutions[1].crowding_distance > 0.0 && solutions[1].crowding_distance < f64::INFINITY);
    }
    
    #[test]
    fn test_hypervolume_calculation() {
        let reference_point = Array1::from_vec(vec![5.0, 5.0]);
        let calculator = HypervolumeCalculator::new(reference_point);
        
        let solutions = vec![
            Solution::new(1, Array1::zeros(2), Array1::from_vec(vec![1.0, 3.0])),
            Solution::new(2, Array1::zeros(2), Array1::from_vec(vec![2.0, 2.0])),
            Solution::new(3, Array1::zeros(2), Array1::from_vec(vec![3.0, 1.0])),
        ];
        
        let hypervolume = calculator.calculate_hypervolume(&solutions).unwrap();
        assert!(hypervolume > 0.0);
    }
    
    #[test]
    fn test_pareto_optimizer_initialization() {
        let mut config = ParetoOptimizerConfig::default();
        config.population_size = 10;
        config.num_variables = 3;
        config.variable_bounds = vec![(0.0, 1.0); 3];
        
        let mut optimizer = ParetoOptimizer::new(config).unwrap();
        optimizer.initialize_population().unwrap();
        
        assert_eq!(optimizer.get_population().len(), 10);
        
        for solution in optimizer.get_population() {
            assert_eq!(solution.variables.len(), 3);
            for &var in solution.variables.iter() {
                assert!(var >= 0.0 && var <= 1.0);
            }
        }
    }
    
    #[test]
    fn test_solution_distance_metrics() {
        let sol1 = Solution::new(
            1,
            Array1::from_vec(vec![1.0, 2.0]),
            Array1::from_vec(vec![1.0, 2.0]),
        );
        
        let sol2 = Solution::new(
            2,
            Array1::from_vec(vec![4.0, 6.0]),
            Array1::from_vec(vec![4.0, 6.0]),
        );
        
        let obj_distance = sol1.objective_distance(&sol2);
        let var_distance = sol1.variable_distance(&sol2);
        
        assert_relative_eq!(obj_distance, 5.0); // sqrt((4-1)^2 + (6-2)^2) = sqrt(9+16) = 5
        assert_relative_eq!(var_distance, 5.0); // Same calculation
    }
}