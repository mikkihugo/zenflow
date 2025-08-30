//! Advanced Optimization Algorithms for Neural Networks
//!
//! Implements high-performance optimization algorithms inspired by nature
//! and financial modeling techniques commonly used in MQL5 trading systems.

use ndarray::Array1;
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use std::f32;

/// Genetic Algorithm for hyperparameter optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneticOptimizer {
    pub population_size: usize,
    pub mutation_rate: f32,
    pub crossover_rate: f32,
    pub elite_size: usize,
    pub max_generations: usize,
    pub parameter_bounds: Vec<(f32, f32)>,
}

impl Default for GeneticOptimizer {
    fn default() -> Self {
        Self {
            population_size: 50,
            mutation_rate: 0.1,
            crossover_rate: 0.8,
            elite_size: 5,
            max_generations: 100,
            parameter_bounds: vec![],
        }
    }
}

/// Individual in genetic algorithm population
#[derive(Debug, Clone)]
pub struct Individual {
    pub genes: Array1<f32>,
    pub fitness: f32,
}

impl Individual {
    pub fn new(genes: Array1<f32>) -> Self {
        Self {
            genes,
            fitness: 0.0,
        }
    }

    /// Crossover with another individual
    pub fn crossover(&self, other: &Individual, rng: &mut ThreadRng) -> (Individual, Individual) {
        let len = self.genes.len();
        let crossover_point = rng.gen_range(1..len);
        
        let mut child1_genes = self.genes.clone();
        let mut child2_genes = other.genes.clone();
        
        for i in crossover_point..len {
            child1_genes[i] = other.genes[i];
            child2_genes[i] = self.genes[i];
        }
        
        (Individual::new(child1_genes), Individual::new(child2_genes))
    }

    /// Mutate individual
    pub fn mutate(&mut self, mutation_rate: f32, bounds: &[(f32, f32)], rng: &mut ThreadRng) {
        for (i, gene) in self.genes.iter_mut().enumerate() {
            if rng.gen::<f32>() < mutation_rate {
                let (min_val, max_val) = bounds[i];
                *gene = rng.gen_range(min_val..=max_val);
            }
        }
    }
}

impl GeneticOptimizer {
    pub fn new(parameter_bounds: Vec<(f32, f32)>) -> Self {
        Self {
            parameter_bounds,
            ..Default::default()
        }
    }

    /// Optimize using genetic algorithm
    pub fn optimize<F>(&self, fitness_fn: F) -> Array1<f32>
    where
        F: Fn(&Array1<f32>) -> f32,
    {
        let mut rng = thread_rng();
        let mut population = self.initialize_population(&mut rng);
        
        for generation in 0..self.max_generations {
            // Evaluate fitness
            for individual in &mut population {
                individual.fitness = fitness_fn(&individual.genes);
            }
            
            // Sort by fitness (higher is better)
            population.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());
            
            // Create next generation
            let mut new_population = Vec::new();
            
            // Elite selection
            for i in 0..self.elite_size {
                new_population.push(population[i].clone());
            }
            
            // Generate offspring
            while new_population.len() < self.population_size {
                let parent1 = self.tournament_selection(&population, &mut rng);
                let parent2 = self.tournament_selection(&population, &mut rng);
                
                if rng.gen::<f32>() < self.crossover_rate {
                    let (mut child1, mut child2) = parent1.crossover(&parent2, &mut rng);
                    child1.mutate(self.mutation_rate, &self.parameter_bounds, &mut rng);
                    child2.mutate(self.mutation_rate, &self.parameter_bounds, &mut rng);
                    
                    new_population.push(child1);
                    if new_population.len() < self.population_size {
                        new_population.push(child2);
                    }
                } else {
                    let mut child = parent1.clone();
                    child.mutate(self.mutation_rate, &self.parameter_bounds, &mut rng);
                    new_population.push(child);
                }
            }
            
            population = new_population;
            
            // Early stopping if converged
            if generation > 10 && self.has_converged(&population) {
                break;
            }
        }
        
        // Return best individual
        population.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());
        population[0].genes.clone()
    }

    fn initialize_population(&self, rng: &mut ThreadRng) -> Vec<Individual> {
        let mut population = Vec::new();
        
        for _ in 0..self.population_size {
            let genes = Array1::from_shape_fn(self.parameter_bounds.len(), |i| {
                let (min_val, max_val) = self.parameter_bounds[i];
                rng.gen_range(min_val..=max_val)
            });
            population.push(Individual::new(genes));
        }
        
        population
    }

    fn tournament_selection(&self, population: &[Individual], rng: &mut ThreadRng) -> Individual {
        let tournament_size = 3;
        let mut best = &population[rng.gen_range(0..population.len())];
        
        for _ in 1..tournament_size {
            let candidate = &population[rng.gen_range(0..population.len())];
            if candidate.fitness > best.fitness {
                best = candidate;
            }
        }
        
        best.clone()
    }

    fn has_converged(&self, population: &[Individual]) -> bool {
        let best_fitness = population.iter().map(|i| i.fitness).fold(f32::NEG_INFINITY, f32::max);
        let worst_fitness = population.iter().map(|i| i.fitness).fold(f32::INFINITY, f32::min);
        (best_fitness - worst_fitness) < 1e-6
    }
}

/// Particle Swarm Optimization for neural network hyperparameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleSwarmOptimizer {
    pub num_particles: usize,
    pub max_iterations: usize,
    pub inertia_weight: f32,
    pub cognitive_weight: f32,
    pub social_weight: f32,
    pub parameter_bounds: Vec<(f32, f32)>,
}

impl Default for ParticleSwarmOptimizer {
    fn default() -> Self {
        Self {
            num_particles: 30,
            max_iterations: 100,
            inertia_weight: 0.9,
            cognitive_weight: 2.0,
            social_weight: 2.0,
            parameter_bounds: vec![],
        }
    }
}

/// Particle in swarm
#[derive(Debug, Clone)]
pub struct Particle {
    pub position: Array1<f32>,
    pub velocity: Array1<f32>,
    pub best_position: Array1<f32>,
    pub best_fitness: f32,
    pub fitness: f32,
}

impl Particle {
    pub fn new(position: Array1<f32>) -> Self {
        let velocity = Array1::zeros(position.len());
        Self {
            best_position: position.clone(),
            position,
            velocity,
            best_fitness: f32::NEG_INFINITY,
            fitness: f32::NEG_INFINITY,
        }
    }

    pub fn update_velocity(
        &mut self,
        global_best: &Array1<f32>,
        inertia: f32,
        cognitive: f32,
        social: f32,
        rng: &mut ThreadRng,
    ) {
        for i in 0..self.velocity.len() {
            let r1 = rng.gen::<f32>();
            let r2 = rng.gen::<f32>();
            
            self.velocity[i] = inertia * self.velocity[i]
                + cognitive * r1 * (self.best_position[i] - self.position[i])
                + social * r2 * (global_best[i] - self.position[i]);
        }
    }

    pub fn update_position(&mut self, bounds: &[(f32, f32)]) {
        for i in 0..self.position.len() {
            self.position[i] += self.velocity[i];
            
            // Apply bounds
            let (min_val, max_val) = bounds[i];
            self.position[i] = self.position[i].clamp(min_val, max_val);
        }
    }

    pub fn update_best(&mut self) {
        if self.fitness > self.best_fitness {
            self.best_fitness = self.fitness;
            self.best_position = self.position.clone();
        }
    }
}

impl ParticleSwarmOptimizer {
    pub fn new(parameter_bounds: Vec<(f32, f32)>) -> Self {
        Self {
            parameter_bounds,
            ..Default::default()
        }
    }

    /// Optimize using particle swarm optimization
    pub fn optimize<F>(&self, fitness_fn: F) -> Array1<f32>
    where
        F: Fn(&Array1<f32>) -> f32,
    {
        let mut rng = thread_rng();
        let mut swarm = self.initialize_swarm(&mut rng);
        let mut global_best = Array1::zeros(self.parameter_bounds.len());
        let mut global_best_fitness = f32::NEG_INFINITY;
        
        for iteration in 0..self.max_iterations {
            // Evaluate fitness for all particles
            for particle in &mut swarm {
                particle.fitness = fitness_fn(&particle.position);
                particle.update_best();
                
                // Update global best
                if particle.best_fitness > global_best_fitness {
                    global_best_fitness = particle.best_fitness;
                    global_best = particle.best_position.clone();
                }
            }
            
            // Update velocities and positions
            let inertia = self.inertia_weight * (1.0 - iteration as f32 / self.max_iterations as f32);
            
            for particle in &mut swarm {
                particle.update_velocity(
                    &global_best,
                    inertia,
                    self.cognitive_weight,
                    self.social_weight,
                    &mut rng,
                );
                particle.update_position(&self.parameter_bounds);
            }
            
            // Early stopping if converged
            if iteration > 10 && self.has_converged(&swarm) {
                break;
            }
        }
        
        global_best
    }

    fn initialize_swarm(&self, rng: &mut ThreadRng) -> Vec<Particle> {
        let mut swarm = Vec::new();
        
        for _ in 0..self.num_particles {
            let position = Array1::from_shape_fn(self.parameter_bounds.len(), |i| {
                let (min_val, max_val) = self.parameter_bounds[i];
                rng.gen_range(min_val..=max_val)
            });
            swarm.push(Particle::new(position));
        }
        
        swarm
    }

    fn has_converged(&self, swarm: &[Particle]) -> bool {
        let best_fitness = swarm.iter().map(|p| p.best_fitness).fold(f32::NEG_INFINITY, f32::max);
        let worst_fitness = swarm.iter().map(|p| p.best_fitness).fold(f32::INFINITY, f32::min);
        (best_fitness - worst_fitness) < 1e-6
    }
}

/// Hyperparameter optimization result
#[derive(Debug, Clone)]
pub struct OptimizationResult {
    pub best_parameters: Array1<f32>,
    pub best_fitness: f32,
    pub iterations: usize,
    pub convergence_history: Vec<f32>,
}

/// High-level hyperparameter optimizer combining multiple algorithms
#[derive(Debug)]
pub struct HyperparameterOptimizer {
    pub parameter_bounds: Vec<(f32, f32)>,
    pub parameter_names: Vec<String>,
}

impl HyperparameterOptimizer {
    pub fn new() -> Self {
        Self {
            parameter_bounds: vec![],
            parameter_names: vec![],
        }
    }

    pub fn add_parameter(&mut self, name: &str, min_val: f32, max_val: f32) {
        self.parameter_names.push(name.to_string());
        self.parameter_bounds.push((min_val, max_val));
    }

    /// Optimize using genetic algorithm
    pub fn optimize_with_ga<F>(&self, fitness_fn: F) -> OptimizationResult
    where
        F: Fn(&Array1<f32>) -> f32 + Clone,
    {
        let ga = GeneticOptimizer::new(self.parameter_bounds.clone());
        let best_params = ga.optimize(fitness_fn.clone());
        
        OptimizationResult {
            best_fitness: fitness_fn(&best_params),
            best_parameters: best_params,
            iterations: ga.max_generations,
            convergence_history: vec![], // TODO: implement history tracking
        }
    }

    /// Optimize using particle swarm optimization
    pub fn optimize_with_pso<F>(&self, fitness_fn: F) -> OptimizationResult
    where
        F: Fn(&Array1<f32>) -> f32 + Clone,
    {
        let pso = ParticleSwarmOptimizer::new(self.parameter_bounds.clone());
        let best_params = pso.optimize(fitness_fn.clone());
        
        OptimizationResult {
            best_fitness: fitness_fn(&best_params),
            best_parameters: best_params,
            iterations: pso.max_iterations,
            convergence_history: vec![], // TODO: implement history tracking
        }
    }

    /// Compare both algorithms and return the best result
    pub fn optimize_hybrid<F>(&self, fitness_fn: F) -> OptimizationResult
    where
        F: Fn(&Array1<f32>) -> f32 + Clone,
    {
        let ga_result = self.optimize_with_ga(fitness_fn.clone());
        let pso_result = self.optimize_with_pso(fitness_fn);
        
        if ga_result.best_fitness > pso_result.best_fitness {
            ga_result
        } else {
            pso_result
        }
    }
}

impl Default for HyperparameterOptimizer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_genetic_optimizer() {
        let bounds = vec![(-5.0, 5.0), (-5.0, 5.0)];
        let ga = GeneticOptimizer::new(bounds);
        
        // Optimize Rosenbrock function: f(x,y) = (a-x)^2 + b(y-x^2)^2
        // Global minimum at (1, 1) with value 0
        let result = ga.optimize(|params| {
            let x = params[0];
            let y = params[1];
            let a = 1.0;
            let b = 100.0;
            -((a - x).powi(2) + b * (y - x.powi(2)).powi(2)) // Negative for maximization
        });
        
        // Should find solution reasonably close to (1, 1) - genetic algorithms are stochastic
        assert!((result[0] - 1.0).abs() < 2.0, "GA result x: {}", result[0]);
        assert!((result[1] - 1.0).abs() < 2.0, "GA result y: {}", result[1]);
    }

    #[test]
    fn test_particle_swarm_optimizer() {
        let bounds = vec![(-5.0, 5.0), (-5.0, 5.0)];
        let pso = ParticleSwarmOptimizer::new(bounds);
        
        // Optimize sphere function: f(x,y) = x^2 + y^2
        // Global minimum at (0, 0) with value 0
        let result = pso.optimize(|params| {
            let x = params[0];
            let y = params[1];
            -(x.powi(2) + y.powi(2)) // Negative for maximization
        });
        
        // Should find solution close to (0, 0)
        assert!(result[0].abs() < 0.5);
        assert!(result[1].abs() < 0.5);
    }

    #[test]
    fn test_hyperparameter_optimizer() {
        let mut optimizer = HyperparameterOptimizer::new();
        optimizer.add_parameter("learning_rate", 0.001, 0.1);
        optimizer.add_parameter("batch_size", 16.0, 128.0);
        
        let result = optimizer.optimize_hybrid(|params| {
            // Simple fitness function for testing
            let lr = params[0];
            let batch_size = params[1];
            -(lr - 0.01).powi(2) - (batch_size - 64.0).powi(2)
        });
        
        assert!(result.best_fitness > -1.0);
    }
}