//! Dependency analysis and graph building
//! 
//! Analyzes dependencies between files, modules, and external packages
//! to understand codebase structure and relationships.

use std::collections::{HashMap, HashSet};
use serde::{Deserialize, Serialize};

use crate::{FileDependency, DependencyType, Result, FileAwareError};

/// Dependency graph builder and analyzer
#[derive(Debug, Default)]
pub struct DependencyAnalyzer {
    /// Map from file to its dependencies
    dependencies: HashMap<String, Vec<FileDependency>>,
    /// Reverse lookup: what files depend on this file
    dependents: HashMap<String, Vec<String>>,
}

impl DependencyAnalyzer {
    /// Create a new dependency analyzer
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a dependency relationship
    pub fn add_dependency(&mut self, dependency: FileDependency) {
        // Add to forward map
        self.dependencies
            .entry(dependency.from.clone())
            .or_default()
            .push(dependency.clone());

        // Add to reverse map
        self.dependents
            .entry(dependency.to.clone())
            .or_default()
            .push(dependency.from);
    }

    /// Build dependency graph from a list of dependencies
    pub fn build_graph(&mut self, dependencies: Vec<FileDependency>) -> Result<DependencyGraph> {
        self.dependencies.clear();
        self.dependents.clear();

        for dep in dependencies {
            self.add_dependency(dep);
        }

        Ok(DependencyGraph {
            nodes: self.get_all_files(),
            edges: self.get_all_dependencies(),
            cycles: self.detect_cycles()?,
            metrics: self.calculate_metrics(),
        })
    }

    /// Get all files in the dependency graph
    fn get_all_files(&self) -> Vec<String> {
        let mut files = HashSet::new();
        
        for deps in self.dependencies.values() {
            for dep in deps {
                files.insert(dep.from.clone());
                files.insert(dep.to.clone());
            }
        }
        
        files.into_iter().collect()
    }

    /// Get all dependencies as edges
    fn get_all_dependencies(&self) -> Vec<FileDependency> {
        self.dependencies
            .values()
            .flat_map(|deps| deps.iter())
            .cloned()
            .collect()
    }

    /// Detect circular dependencies
    fn detect_cycles(&self) -> Result<Vec<DependencyCycle>> {
        let mut cycles = Vec::new();
        let mut visited = HashSet::new();
        let mut rec_stack = HashSet::new();

        for file in self.dependencies.keys() {
            if !visited.contains(file) {
                self.detect_cycles_util(
                    file,
                    &mut visited,
                    &mut rec_stack,
                    &mut cycles,
                    &mut Vec::new(),
                );
            }
        }

        Ok(cycles)
    }

    fn detect_cycles_util(
        &self,
        file: &str,
        visited: &mut HashSet<String>,
        rec_stack: &mut HashSet<String>,
        cycles: &mut Vec<DependencyCycle>,
        path: &mut Vec<String>,
    ) {
        visited.insert(file.to_string());
        rec_stack.insert(file.to_string());
        path.push(file.to_string());

        if let Some(deps) = self.dependencies.get(file) {
            for dep in deps {
                if !visited.contains(&dep.to) {
                    self.detect_cycles_util(&dep.to, visited, rec_stack, cycles, path);
                } else if rec_stack.contains(&dep.to) {
                    // Found a cycle
                    if let Some(start) = path.iter().position(|f| f == &dep.to) {
                        let cycle_path = path[start..].to_vec();
                        cycles.push(DependencyCycle {
                            files: cycle_path,
                            severity: CycleSeverity::High,
                        });
                    }
                }
            }
        }

        path.pop();
        rec_stack.remove(file);
    }

    /// Calculate dependency metrics
    fn calculate_metrics(&self) -> DependencyMetrics {
        let total_files = self.get_all_files().len();
        let total_dependencies = self.get_all_dependencies().len();

        let max_dependencies = self.dependencies
            .values()
            .map(|deps| deps.len())
            .max()
            .unwrap_or(0);

        let max_dependents = self.dependents
            .values()
            .map(|deps| deps.len())
            .max()
            .unwrap_or(0);

        DependencyMetrics {
            total_files,
            total_dependencies,
            max_dependencies,
            max_dependents,
            average_dependencies: if total_files > 0 {
                total_dependencies as f64 / total_files as f64
            } else {
                0.0
            },
        }
    }

    /// Get dependencies for a specific file
    pub fn get_dependencies(&self, file: &str) -> Vec<&FileDependency> {
        self.dependencies
            .get(file)
            .map(|deps| deps.iter().collect())
            .unwrap_or_default()
    }

    /// Get files that depend on a specific file
    pub fn get_dependents(&self, file: &str) -> Vec<&str> {
        self.dependents
            .get(file)
            .map(|deps| deps.iter().map(|s| s.as_str()).collect())
            .unwrap_or_default()
    }
}

/// Complete dependency graph representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyGraph {
    /// All files in the graph
    pub nodes: Vec<String>,
    /// All dependency relationships
    pub edges: Vec<FileDependency>,
    /// Detected circular dependencies
    pub cycles: Vec<DependencyCycle>,
    /// Graph metrics
    pub metrics: DependencyMetrics,
}

/// Represents a circular dependency
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyCycle {
    /// Files involved in the cycle
    pub files: Vec<String>,
    /// Severity of the cycle
    pub severity: CycleSeverity,
}

/// Severity levels for circular dependencies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CycleSeverity {
    Low,    // Simple back-reference
    Medium, // Multi-file cycle
    High,   // Complex cycle affecting core modules
}

/// Metrics about the dependency graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyMetrics {
    pub total_files: usize,
    pub total_dependencies: usize,
    pub max_dependencies: usize,
    pub max_dependents: usize,
    pub average_dependencies: f64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dependency_analyzer_creation() {
        let analyzer = DependencyAnalyzer::new();
        assert!(analyzer.dependencies.is_empty());
        assert!(analyzer.dependents.is_empty());
    }

    #[test]
    fn test_add_dependency() {
        let mut analyzer = DependencyAnalyzer::new();
        let dep = FileDependency {
            from: "a.rs".to_string(),
            to: "b.rs".to_string(),
            dependency_type: DependencyType::Import,
            line: Some(1),
        };

        analyzer.add_dependency(dep);

        assert_eq!(analyzer.dependencies.len(), 1);
        assert_eq!(analyzer.dependents.len(), 1);
    }

    #[test]
    fn test_build_simple_graph() {
        let mut analyzer = DependencyAnalyzer::new();
        let deps = vec![
            FileDependency {
                from: "main.rs".to_string(),
                to: "lib.rs".to_string(),
                dependency_type: DependencyType::Import,
                line: Some(1),
            }
        ];

        let graph = analyzer.build_graph(deps).unwrap();
        assert_eq!(graph.nodes.len(), 2);
        assert_eq!(graph.edges.len(), 1);
        assert!(graph.cycles.is_empty());
    }
}