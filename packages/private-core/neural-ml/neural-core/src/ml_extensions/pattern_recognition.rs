//! # Pattern Recognition & Embeddings Module
//!
//! Provides advanced pattern recognition, text embeddings, similarity metrics,
//! and clustering algorithms for intelligent pattern analysis.

use super::{MLError, MLResult, AsyncOptimizer, MemoryAware, GpuAccelerated, Serializable, monitoring::Timer};
use ndarray::{Array1, Array2, ArrayView1, ArrayView2, Axis};
use num_traits::Float;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use std::time::Duration;
use rayon::prelude::*;

/// Pattern types for recognition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatternType {
    /// Sequential patterns
    Sequential,
    /// Temporal patterns
    Temporal,
    /// Frequency patterns
    Frequency,
    /// Structural patterns
    Structural,
    /// Behavioral patterns
    Behavioral,
    /// Optimization patterns
    Optimization,
}

/// Recognized pattern with metadata
#[derive(Debug, Clone)]
pub struct RecognizedPattern {
    /// Pattern type
    pub pattern_type: PatternType,
    /// Pattern confidence score
    pub confidence: f64,
    /// Pattern description
    pub description: String,
    /// Pattern features/attributes
    pub features: Array1<f64>,
    /// Pattern occurrence frequency
    pub frequency: usize,
    /// Pattern importance score
    pub importance: f64,
    /// Pattern validity range
    pub validity_range: (f64, f64),
    /// Associated metadata
    pub metadata: HashMap<String, String>,
}

impl RecognizedPattern {
    /// Create new recognized pattern
    pub fn new(
        pattern_type: PatternType,
        confidence: f64,
        description: String,
        features: Array1<f64>,
    ) -> Self {
        Self {
            pattern_type,
            confidence,
            description,
            features,
            frequency: 1,
            importance: confidence,
            validity_range: (0.0, 1.0),
            metadata: HashMap::new(),
        }
    }
    
    /// Calculate similarity to another pattern
    pub fn similarity(&self, other: &RecognizedPattern) -> f64 {
        // Cosine similarity of features
        let dot_product = self.features.iter()
            .zip(other.features.iter())
            .map(|(a, b)| a * b)
            .sum::<f64>();
        
        let norm_self = self.features.iter().map(|x| x * x).sum::<f64>().sqrt();
        let norm_other = other.features.iter().map(|x| x * x).sum::<f64>().sqrt();
        
        if norm_self == 0.0 || norm_other == 0.0 {
            0.0
        } else {
            dot_product / (norm_self * norm_other)
        }
    }
    
    /// Update pattern statistics
    pub fn update_statistics(&mut self, new_confidence: f64) {
        self.frequency += 1;
        // Update confidence using exponential moving average
        self.confidence = 0.9 * self.confidence + 0.1 * new_confidence;
        self.importance = self.confidence * (self.frequency as f64).ln();
    }
}

/// Pattern extraction configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternExtractionConfig {
    /// Minimum pattern confidence threshold
    pub min_confidence: f64,
    /// Maximum number of patterns to track
    pub max_patterns: usize,
    /// Pattern similarity threshold for merging
    pub similarity_threshold: f64,
    /// Enable temporal pattern detection
    pub enable_temporal: bool,
    /// Enable frequency pattern detection
    pub enable_frequency: bool,
    /// Enable structural pattern detection
    pub enable_structural: bool,
    /// Window size for pattern analysis
    pub window_size: usize,
    /// Pattern decay factor for relevance
    pub decay_factor: f64,
}

impl Default for PatternExtractionConfig {
    fn default() -> Self {
        Self {
            min_confidence: 0.5,
            max_patterns: 100,
            similarity_threshold: 0.8,
            enable_temporal: true,
            enable_frequency: true,
            enable_structural: true,
            window_size: 50,
            decay_factor: 0.95,
        }
    }
}

/// Advanced pattern extractor
#[derive(Debug)]
pub struct PatternExtractor {
    config: PatternExtractionConfig,
    recognized_patterns: Vec<RecognizedPattern>,
    pattern_history: Vec<Array1<f64>>,
    temporal_patterns: HashMap<String, Vec<(f64, usize)>>,
    frequency_patterns: HashMap<String, usize>,
    pattern_transitions: HashMap<(String, String), usize>,
    extraction_count: usize,
}

impl PatternExtractor {
    /// Create new pattern extractor
    pub fn new(config: PatternExtractionConfig) -> Self {
        Self {
            config,
            recognized_patterns: Vec::new(),
            pattern_history: Vec::new(),
            temporal_patterns: HashMap::new(),
            frequency_patterns: HashMap::new(),
            pattern_transitions: HashMap::new(),
            extraction_count: 0,
        }
    }
    
    /// Extract patterns from data
    pub fn extract_patterns(&mut self, data: &Array2<f64>) -> MLResult<Vec<RecognizedPattern>> {
        let timer = Timer::new("PatternExtractor::extract_patterns");
        self.extraction_count += 1;
        
        let mut new_patterns = Vec::new();
        
        // Extract different types of patterns
        if self.config.enable_temporal {
            new_patterns.extend(self.extract_temporal_patterns(data)?);
        }
        
        if self.config.enable_frequency {
            new_patterns.extend(self.extract_frequency_patterns(data)?);
        }
        
        if self.config.enable_structural {
            new_patterns.extend(self.extract_structural_patterns(data)?);
        }
        
        // Extract sequential patterns
        new_patterns.extend(self.extract_sequential_patterns(data)?);
        
        // Merge similar patterns
        self.merge_similar_patterns(&mut new_patterns)?;
        
        // Update existing patterns or add new ones
        for new_pattern in &new_patterns {
            self.update_or_add_pattern(new_pattern.clone())?;
        }
        
        // Apply decay to pattern importance
        self.apply_pattern_decay();
        
        // Remove low-confidence patterns
        self.prune_patterns();
        
        // Update history
        for row in data.axis_iter(Axis(0)) {
            self.pattern_history.push(row.to_owned());
        }
        
        // Limit history size
        if self.pattern_history.len() > self.config.window_size * 2 {
            self.pattern_history.truncate(self.config.window_size);
        }
        
        timer.finish();
        Ok(new_patterns)
    }
    
    /// Extract temporal patterns
    fn extract_temporal_patterns(&mut self, data: &Array2<f64>) -> MLResult<Vec<RecognizedPattern>> {
        let mut patterns = Vec::new();
        
        if data.nrows() < 3 {
            return Ok(patterns);
        }
        
        // Look for trends and cycles
        for col in 0..data.ncols() {
            let column_data: Vec<f64> = data.column(col).to_vec();
            
            // Detect monotonic trends
            let trend = self.detect_trend(&column_data)?;
            if trend.abs() > 0.5 {
                let trend_type = if trend > 0.0 { "increasing" } else { "decreasing" };
                let confidence = trend.abs();
                
                let features = Array1::from_vec(vec![
                    trend,
                    column_data.len() as f64,
                    col as f64,
                    confidence,
                ]);
                
                let pattern = RecognizedPattern::new(
                    PatternType::Temporal,
                    confidence,
                    format!("Temporal {} trend in feature {}", trend_type, col),
                    features,
                );
                
                patterns.push(pattern);
            }
            
            // Detect periodicity
            if let Some((period, strength)) = self.detect_periodicity(&column_data)? {
                let confidence = strength;
                
                let features = Array1::from_vec(vec![
                    period as f64,
                    strength,
                    col as f64,
                    column_data.len() as f64,
                ]);
                
                let pattern = RecognizedPattern::new(
                    PatternType::Temporal,
                    confidence,
                    format!("Periodic pattern (period={}) in feature {}", period, col),
                    features,
                );
                
                patterns.push(pattern);
            }
        }
        
        Ok(patterns)
    }
    
    /// Extract frequency patterns
    fn extract_frequency_patterns(&mut self, data: &Array2<f64>) -> MLResult<Vec<RecognizedPattern>> {
        let mut patterns = Vec::new();
        
        // Discretize data and count frequencies
        let discretized = self.discretize_data(data, 10)?;
        let mut frequency_map: HashMap<String, usize> = HashMap::new();
        
        for row in discretized.axis_iter(Axis(0)) {
            let pattern_key = row.iter()
                .map(|&x| x.to_string())
                .collect::<Vec<_>>()
                .join(",");
            
            *frequency_map.entry(pattern_key).or_insert(0) += 1;
        }
        
        // Find frequent patterns
        let total_rows = discretized.nrows();
        for (pattern_key, count) in frequency_map {
            let frequency = count as f64 / total_rows as f64;
            
            if frequency > 0.1 && count > 2 { // At least 10% frequency and 3 occurrences
                let confidence = frequency;
                
                let features = Array1::from_vec(vec![
                    frequency,
                    count as f64,
                    pattern_key.len() as f64,
                    total_rows as f64,
                ]);
                
                let pattern = RecognizedPattern::new(
                    PatternType::Frequency,
                    confidence,
                    format!("Frequent pattern: {} (freq={:.2})", pattern_key, frequency),
                    features,
                );
                
                patterns.push(pattern);
            }
        }
        
        Ok(patterns)
    }
    
    /// Extract structural patterns
    fn extract_structural_patterns(&mut self, data: &Array2<f64>) -> MLResult<Vec<RecognizedPattern>> {
        let mut patterns = Vec::new();
        
        // Correlation patterns
        let correlations = self.compute_correlation_matrix(data)?;
        
        for i in 0..correlations.nrows() {
            for j in (i + 1)..correlations.ncols() {
                let correlation = correlations[[i, j]];
                
                if correlation.abs() > 0.7 { // Strong correlation
                    let confidence = correlation.abs();
                    let correlation_type = if correlation > 0.0 { "positive" } else { "negative" };
                    
                    let features = Array1::from_vec(vec![
                        correlation,
                        i as f64,
                        j as f64,
                        confidence,
                    ]);
                    
                    let pattern = RecognizedPattern::new(
                        PatternType::Structural,
                        confidence,
                        format!("Strong {} correlation between features {} and {}", correlation_type, i, j),
                        features,
                    );
                    
                    patterns.push(pattern);
                }
            }
        }
        
        // Cluster patterns
        let clusters = self.simple_kmeans(data, 3)?;
        let cluster_quality = self.evaluate_clustering_quality(data, &clusters)?;
        
        if cluster_quality > 0.5 {
            let confidence = cluster_quality;
            
            let features = Array1::from_vec(vec![
                cluster_quality,
                3.0, // Number of clusters
                data.nrows() as f64,
                data.ncols() as f64,
            ]);
            
            let pattern = RecognizedPattern::new(
                PatternType::Structural,
                confidence,
                format!("Clustering structure with {} clusters (quality={:.2})", 3, cluster_quality),
                features,
            );
            
            patterns.push(pattern);
        }
        
        Ok(patterns)
    }
    
    /// Extract sequential patterns
    fn extract_sequential_patterns(&mut self, data: &Array2<f64>) -> MLResult<Vec<RecognizedPattern>> {
        let mut patterns = Vec::new();
        
        if data.nrows() < 2 {
            return Ok(patterns);
        }
        
        // Look for repeating subsequences
        let sequences = self.find_repeating_subsequences(data, 3)?;
        
        for (sequence, occurrences) in sequences {
            if occurrences >= 2 {
                let confidence = (occurrences as f64 / data.nrows() as f64).min(1.0);
                
                let features = Array1::from_vec(vec![
                    sequence.len() as f64,
                    occurrences as f64,
                    confidence,
                    data.nrows() as f64,
                ]);
                
                let pattern = RecognizedPattern::new(
                    PatternType::Sequential,
                    confidence,
                    format!("Repeating sequence of length {} (occurs {} times)", sequence.len(), occurrences),
                    features,
                );
                
                patterns.push(pattern);
            }
        }
        
        Ok(patterns)
    }
    
    /// Detect trend in time series data
    fn detect_trend(&self, data: &[f64]) -> MLResult<f64> {
        if data.len() < 3 {
            return Ok(0.0);
        }
        
        // Simple linear regression slope
        let n = data.len() as f64;
        let x_mean = (n - 1.0) / 2.0;
        let y_mean = data.iter().sum::<f64>() / n;
        
        let numerator = data.iter()
            .enumerate()
            .map(|(i, &y)| (i as f64 - x_mean) * (y - y_mean))
            .sum::<f64>();
        
        let denominator = data.iter()
            .enumerate()
            .map(|(i, _)| (i as f64 - x_mean).powi(2))
            .sum::<f64>();
        
        if denominator.abs() < 1e-10 {
            Ok(0.0)
        } else {
            Ok(numerator / denominator)
        }
    }
    
    /// Detect periodicity using autocorrelation
    fn detect_periodicity(&self, data: &[f64]) -> MLResult<Option<(usize, f64)>> {
        if data.len() < 6 {
            return Ok(None);
        }
        
        let max_lag = (data.len() / 3).min(20);
        let mut best_period = 0;
        let mut best_strength = 0.0;
        
        for lag in 2..=max_lag {
            let correlation = self.autocorrelation(data, lag)?;
            if correlation > best_strength && correlation > 0.5 {
                best_strength = correlation;
                best_period = lag;
            }
        }
        
        if best_strength > 0.5 {
            Ok(Some((best_period, best_strength)))
        } else {
            Ok(None)
        }
    }
    
    /// Compute autocorrelation at given lag
    fn autocorrelation(&self, data: &[f64], lag: usize) -> MLResult<f64> {
        if data.len() <= lag {
            return Ok(0.0);
        }
        
        let mean = data.iter().sum::<f64>() / data.len() as f64;
        let variance = data.iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f64>() / data.len() as f64;
        
        if variance < 1e-10 {
            return Ok(0.0);
        }
        
        let covariance = data.iter()
            .take(data.len() - lag)
            .zip(data.iter().skip(lag))
            .map(|(&x1, &x2)| (x1 - mean) * (x2 - mean))
            .sum::<f64>() / (data.len() - lag) as f64;
        
        Ok(covariance / variance)
    }
    
    /// Discretize continuous data
    fn discretize_data(&self, data: &Array2<f64>, bins: usize) -> MLResult<Array2<usize>> {
        let mut discretized = Array2::zeros((data.nrows(), data.ncols()));
        
        for col in 0..data.ncols() {
            let column_data = data.column(col);
            let min_val = column_data.iter().fold(f64::INFINITY, |a, &b| a.min(b));
            let max_val = column_data.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            
            let range = max_val - min_val;
            let bin_width = if range > 1e-10 { range / bins as f64 } else { 1.0 };
            
            for (row, &value) in column_data.iter().enumerate() {
                let bin = if range > 1e-10 {
                    ((value - min_val) / bin_width).floor() as usize
                } else {
                    0
                };
                discretized[[row, col]] = bin.min(bins - 1);
            }
        }
        
        Ok(discretized)
    }
    
    /// Compute correlation matrix
    fn compute_correlation_matrix(&self, data: &Array2<f64>) -> MLResult<Array2<f64>> {
        let n_features = data.ncols();
        let mut correlations = Array2::zeros((n_features, n_features));
        
        // Compute means
        let means: Vec<f64> = (0..n_features)
            .map(|col| data.column(col).mean().unwrap_or(0.0))
            .collect();
        
        // Compute correlation coefficients
        for i in 0..n_features {
            for j in 0..n_features {
                if i == j {
                    correlations[[i, j]] = 1.0;
                } else {
                    let col_i = data.column(i);
                    let col_j = data.column(j);
                    
                    let covariance = col_i.iter()
                        .zip(col_j.iter())
                        .map(|(&x, &y)| (x - means[i]) * (y - means[j]))
                        .sum::<f64>() / (data.nrows() - 1) as f64;
                    
                    let std_i = col_i.iter()
                        .map(|&x| (x - means[i]).powi(2))
                        .sum::<f64>()
                        .sqrt() / (data.nrows() - 1) as f64;
                    
                    let std_j = col_j.iter()
                        .map(|&x| (x - means[j]).powi(2))
                        .sum::<f64>()
                        .sqrt() / (data.nrows() - 1) as f64;
                    
                    if std_i > 1e-10 && std_j > 1e-10 {
                        correlations[[i, j]] = covariance / (std_i * std_j);
                    } else {
                        correlations[[i, j]] = 0.0;
                    }
                }
            }
        }
        
        Ok(correlations)
    }
    
    /// Simple k-means clustering
    fn simple_kmeans(&self, data: &Array2<f64>, k: usize) -> MLResult<Vec<usize>> {
        if data.nrows() < k {
            return Ok((0..data.nrows()).collect());
        }
        
        let mut centroids = Array2::zeros((k, data.ncols()));
        let mut assignments = vec![0; data.nrows()];
        
        // Initialize centroids randomly
        for i in 0..k {
            let random_idx = rand::random::<usize>() % data.nrows();
            centroids.row_mut(i).assign(&data.row(random_idx));
        }
        
        // Iterate
        for _ in 0..10 {
            // Assign points to nearest centroid
            for (point_idx, point) in data.axis_iter(Axis(0)).enumerate() {
                let mut best_distance = f64::INFINITY;
                let mut best_cluster = 0;
                
                for cluster_idx in 0..k {
                    let centroid = centroids.row(cluster_idx);
                    let distance = point.iter()
                        .zip(centroid.iter())
                        .map(|(&a, &b)| (a - b).powi(2))
                        .sum::<f64>()
                        .sqrt();
                    
                    if distance < best_distance {
                        best_distance = distance;
                        best_cluster = cluster_idx;
                    }
                }
                
                assignments[point_idx] = best_cluster;
            }
            
            // Update centroids
            for cluster_idx in 0..k {
                let cluster_points: Vec<_> = assignments.iter()
                    .enumerate()
                    .filter_map(|(point_idx, &cluster)| {
                        if cluster == cluster_idx {
                            Some(data.row(point_idx))
                        } else {
                            None
                        }
                    })
                    .collect();
                
                if !cluster_points.is_empty() {
                    for dim in 0..data.ncols() {
                        let mean = cluster_points.iter()
                            .map(|row| row[dim])
                            .sum::<f64>() / cluster_points.len() as f64;
                        centroids[[cluster_idx, dim]] = mean;
                    }
                }
            }
        }
        
        Ok(assignments)
    }
    
    /// Evaluate clustering quality using silhouette score
    fn evaluate_clustering_quality(&self, data: &Array2<f64>, assignments: &[usize]) -> MLResult<f64> {
        if data.nrows() < 2 {
            return Ok(0.0);
        }
        
        let mut silhouette_scores = Vec::new();
        
        for (i, point) in data.axis_iter(Axis(0)).enumerate() {
            let cluster_i = assignments[i];
            
            // Compute average distance to points in same cluster
            let mut intra_cluster_distances = Vec::new();
            for (j, other_point) in data.axis_iter(Axis(0)).enumerate() {
                if i != j && assignments[j] == cluster_i {
                    let distance = point.iter()
                        .zip(other_point.iter())
                        .map(|(&a, &b)| (a - b).powi(2))
                        .sum::<f64>()
                        .sqrt();
                    intra_cluster_distances.push(distance);
                }
            }
            
            let a = if intra_cluster_distances.is_empty() {
                0.0
            } else {
                intra_cluster_distances.iter().sum::<f64>() / intra_cluster_distances.len() as f64
            };
            
            // Compute minimum average distance to points in other clusters
            let mut min_inter_cluster_distance = f64::INFINITY;
            
            let unique_clusters: HashSet<usize> = assignments.iter().cloned().collect();
            for &other_cluster in &unique_clusters {
                if other_cluster != cluster_i {
                    let mut inter_cluster_distances = Vec::new();
                    for (j, other_point) in data.axis_iter(Axis(0)).enumerate() {
                        if assignments[j] == other_cluster {
                            let distance = point.iter()
                                .zip(other_point.iter())
                                .map(|(&a, &b)| (a - b).powi(2))
                                .sum::<f64>()
                                .sqrt();
                            inter_cluster_distances.push(distance);
                        }
                    }
                    
                    if !inter_cluster_distances.is_empty() {
                        let avg_distance = inter_cluster_distances.iter().sum::<f64>() / inter_cluster_distances.len() as f64;
                        min_inter_cluster_distance = min_inter_cluster_distance.min(avg_distance);
                    }
                }
            }
            
            let b = min_inter_cluster_distance;
            
            if a == 0.0 && b == f64::INFINITY {
                silhouette_scores.push(0.0);
            } else {
                let silhouette = (b - a) / a.max(b);
                silhouette_scores.push(silhouette);
            }
        }
        
        let avg_silhouette = if silhouette_scores.is_empty() {
            0.0
        } else {
            silhouette_scores.iter().sum::<f64>() / silhouette_scores.len() as f64
        };
        
        Ok((avg_silhouette + 1.0) / 2.0) // Normalize to [0, 1]
    }
    
    /// Find repeating subsequences
    fn find_repeating_subsequences(
        &self,
        data: &Array2<f64>,
        min_length: usize,
    ) -> MLResult<HashMap<Vec<String>, usize>> {
        let mut sequence_counts = HashMap::new();
        
        // Convert to discrete sequences
        let discretized = self.discretize_data(data, 5)?;
        
        for start in 0..discretized.nrows() {
            for length in min_length..=(discretized.nrows() - start).min(10) {
                let mut sequence = Vec::new();
                for i in start..(start + length) {
                    let row_str = discretized.row(i).iter()
                        .map(|&x| x.to_string())
                        .collect::<Vec<_>>()
                        .join(",");
                    sequence.push(row_str);
                }
                
                *sequence_counts.entry(sequence).or_insert(0) += 1;
            }
        }
        
        Ok(sequence_counts)
    }
    
    /// Merge similar patterns
    fn merge_similar_patterns(&self, patterns: &mut Vec<RecognizedPattern>) -> MLResult<()> {
        let mut merged_patterns = Vec::new();
        let mut used_indices = HashSet::new();
        
        for (i, pattern1) in patterns.iter().enumerate() {
            if used_indices.contains(&i) {
                continue;
            }
            
            let mut similar_patterns = vec![i];
            
            for (j, pattern2) in patterns.iter().enumerate().skip(i + 1) {
                if used_indices.contains(&j) {
                    continue;
                }
                
                let similarity = pattern1.similarity(pattern2);
                if similarity > self.config.similarity_threshold {
                    similar_patterns.push(j);
                }
            }
            
            if similar_patterns.len() > 1 {
                // Merge patterns
                let mut merged_features = pattern1.features.clone();
                let mut merged_confidence = pattern1.confidence;
                let mut merged_frequency = pattern1.frequency;
                
                for &idx in &similar_patterns[1..] {
                    merged_features = &merged_features + &patterns[idx].features;
                    merged_confidence = merged_confidence.max(patterns[idx].confidence);
                    merged_frequency += patterns[idx].frequency;
                }
                
                merged_features = merged_features / similar_patterns.len() as f64;
                
                let mut merged_pattern = pattern1.clone();
                merged_pattern.features = merged_features;
                merged_pattern.confidence = merged_confidence;
                merged_pattern.frequency = merged_frequency;
                merged_pattern.description = format!("Merged pattern ({})", similar_patterns.len());
                
                merged_patterns.push(merged_pattern);
                
                for &idx in &similar_patterns {
                    used_indices.insert(idx);
                }
            } else {
                merged_patterns.push(pattern1.clone());
                used_indices.insert(i);
            }
        }
        
        *patterns = merged_patterns;
        Ok(())
    }
    
    /// Update existing pattern or add new one
    fn update_or_add_pattern(&mut self, new_pattern: RecognizedPattern) -> MLResult<()> {
        let mut found_similar = false;
        
        for existing_pattern in &mut self.recognized_patterns {
            let similarity = existing_pattern.similarity(&new_pattern);
            if similarity > self.config.similarity_threshold {
                existing_pattern.update_statistics(new_pattern.confidence);
                found_similar = true;
                break;
            }
        }
        
        if !found_similar {
            self.recognized_patterns.push(new_pattern);
        }
        
        Ok(())
    }
    
    /// Apply decay to pattern importance
    fn apply_pattern_decay(&mut self) {
        for pattern in &mut self.recognized_patterns {
            pattern.importance *= self.config.decay_factor;
        }
    }
    
    /// Remove low-confidence patterns
    fn prune_patterns(&mut self) {
        self.recognized_patterns.retain(|pattern| {
            pattern.confidence >= self.config.min_confidence
        });
        
        // Limit number of patterns
        if self.recognized_patterns.len() > self.config.max_patterns {
            self.recognized_patterns.sort_by(|a, b| {
                b.importance.partial_cmp(&a.importance).unwrap()
            });
            self.recognized_patterns.truncate(self.config.max_patterns);
        }
    }
    
    /// Get all recognized patterns
    pub fn get_patterns(&self) -> &[RecognizedPattern] {
        &self.recognized_patterns
    }
    
    /// Get patterns by type
    pub fn get_patterns_by_type(&self, pattern_type: &PatternType) -> Vec<&RecognizedPattern> {
        self.recognized_patterns.iter()
            .filter(|pattern| std::mem::discriminant(&pattern.pattern_type) == std::mem::discriminant(pattern_type))
            .collect()
    }
    
    /// Reset pattern extractor
    pub fn reset(&mut self) {
        self.recognized_patterns.clear();
        self.pattern_history.clear();
        self.temporal_patterns.clear();
        self.frequency_patterns.clear();
        self.pattern_transitions.clear();
        self.extraction_count = 0;
    }
}

/// Text embedding model interface
pub trait EmbeddingModel {
    /// Generate embedding for text
    fn embed_text(&self, text: &str) -> MLResult<Array1<f64>>;
    
    /// Generate embeddings for multiple texts
    fn embed_batch(&self, texts: &[&str]) -> MLResult<Array2<f64>> {
        let mut embeddings = Vec::new();
        for text in texts {
            embeddings.push(self.embed_text(text)?);
        }
        
        if embeddings.is_empty() {
            return Ok(Array2::zeros((0, 0)));
        }
        
        let dim = embeddings[0].len();
        let mut result = Array2::zeros((embeddings.len(), dim));
        
        for (i, embedding) in embeddings.into_iter().enumerate() {
            result.row_mut(i).assign(&embedding);
        }
        
        Ok(result)
    }
    
    /// Get embedding dimension
    fn embedding_dim(&self) -> usize;
}

/// Simple TF-IDF based text embedding
#[derive(Debug)]
pub struct TfIdfEmbedding {
    vocabulary: HashMap<String, usize>,
    idf_scores: HashMap<String, f64>,
    embedding_dim: usize,
    min_df: usize,
    max_df: f64,
}

impl TfIdfEmbedding {
    /// Create new TF-IDF embedding model
    pub fn new(embedding_dim: usize) -> Self {
        Self {
            vocabulary: HashMap::new(),
            idf_scores: HashMap::new(),
            embedding_dim,
            min_df: 1,
            max_df: 0.95,
        }
    }
    
    /// Fit the model on a corpus
    pub fn fit(&mut self, corpus: &[&str]) -> MLResult<()> {
        let timer = Timer::new("TfIdfEmbedding::fit");
        
        // Build vocabulary
        let mut term_doc_count: HashMap<String, usize> = HashMap::new();
        let mut all_terms: HashSet<String> = HashSet::new();
        
        for document in corpus {
            let terms: HashSet<String> = self.tokenize(document).into_iter().collect();
            for term in &terms {
                *term_doc_count.entry(term.clone()).or_insert(0) += 1;
                all_terms.insert(term.clone());
            }
        }
        
        // Filter terms by document frequency
        let n_docs = corpus.len() as f64;
        for term in all_terms {
            let doc_freq = *term_doc_count.get(&term).unwrap_or(&0) as f64;
            if doc_freq >= self.min_df as f64 && doc_freq / n_docs <= self.max_df {
                if self.vocabulary.len() < self.embedding_dim {
                    let vocab_idx = self.vocabulary.len();
                    self.vocabulary.insert(term.clone(), vocab_idx);
                    
                    // Compute IDF score
                    let idf = (n_docs / doc_freq).ln();
                    self.idf_scores.insert(term, idf);
                }
            }
        }
        
        timer.finish();
        Ok(())
    }
    
    /// Tokenize text into terms
    fn tokenize(&self, text: &str) -> Vec<String> {
        text.split_whitespace()
            .map(|token| token.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string())
            .filter(|token| !token.is_empty())
            .collect()
    }
    
    /// Compute TF scores for document
    fn compute_tf(&self, document: &str) -> HashMap<String, f64> {
        let terms = self.tokenize(document);
        let mut tf_scores = HashMap::new();
        let total_terms = terms.len() as f64;
        
        for term in terms {
            *tf_scores.entry(term).or_insert(0.0) += 1.0;
        }
        
        // Normalize by document length
        for (_, score) in &mut tf_scores {
            *score /= total_terms;
        }
        
        tf_scores
    }
}

impl EmbeddingModel for TfIdfEmbedding {
    fn embed_text(&self, text: &str) -> MLResult<Array1<f64>> {
        let mut embedding = Array1::zeros(self.embedding_dim);
        let tf_scores = self.compute_tf(text);
        
        for (term, tf_score) in tf_scores {
            if let (Some(&vocab_idx), Some(&idf_score)) = (self.vocabulary.get(&term), self.idf_scores.get(&term)) {
                if vocab_idx < self.embedding_dim {
                    embedding[vocab_idx] = tf_score * idf_score;
                }
            }
        }
        
        // L2 normalize
        let norm = embedding.iter().map(|x| x * x).sum::<f64>().sqrt();
        if norm > 1e-10 {
            embedding = embedding / norm;
        }
        
        Ok(embedding)
    }
    
    fn embedding_dim(&self) -> usize {
        self.embedding_dim
    }
}

/// Similarity metrics for embeddings and patterns
#[derive(Debug)]
pub struct SimilarityMetrics;

impl SimilarityMetrics {
    /// Cosine similarity between two vectors
    pub fn cosine_similarity(a: ArrayView1<f64>, b: ArrayView1<f64>) -> MLResult<f64> {
        if a.len() != b.len() {
            return Err(MLError::PatternRecognitionError(
                "Vector dimensions must match for cosine similarity".to_string()
            ));
        }
        
        let dot_product = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum::<f64>();
        let norm_a = a.iter().map(|x| x * x).sum::<f64>().sqrt();
        let norm_b = b.iter().map(|x| x * x).sum::<f64>().sqrt();
        
        if norm_a < 1e-10 || norm_b < 1e-10 {
            Ok(0.0)
        } else {
            Ok(dot_product / (norm_a * norm_b))
        }
    }
    
    /// Euclidean distance between two vectors
    pub fn euclidean_distance(a: ArrayView1<f64>, b: ArrayView1<f64>) -> MLResult<f64> {
        if a.len() != b.len() {
            return Err(MLError::PatternRecognitionError(
                "Vector dimensions must match for Euclidean distance".to_string()
            ));
        }
        
        let distance = a.iter()
            .zip(b.iter())
            .map(|(x, y)| (x - y).powi(2))
            .sum::<f64>()
            .sqrt();
        
        Ok(distance)
    }
    
    /// Manhattan distance between two vectors
    pub fn manhattan_distance(a: ArrayView1<f64>, b: ArrayView1<f64>) -> MLResult<f64> {
        if a.len() != b.len() {
            return Err(MLError::PatternRecognitionError(
                "Vector dimensions must match for Manhattan distance".to_string()
            ));
        }
        
        let distance = a.iter()
            .zip(b.iter())
            .map(|(x, y)| (x - y).abs())
            .sum::<f64>();
        
        Ok(distance)
    }
    
    /// Mahalanobis distance (simplified - assumes identity covariance)
    pub fn mahalanobis_distance(a: ArrayView1<f64>, b: ArrayView1<f64>) -> MLResult<f64> {
        // Simplified version - in practice would use actual covariance matrix
        Self::euclidean_distance(a, b)
    }
    
    /// Jaccard similarity for binary vectors
    pub fn jaccard_similarity(a: ArrayView1<f64>, b: ArrayView1<f64>) -> MLResult<f64> {
        if a.len() != b.len() {
            return Err(MLError::PatternRecognitionError(
                "Vector dimensions must match for Jaccard similarity".to_string()
            ));
        }
        
        let threshold = 0.5;
        let mut intersection = 0;
        let mut union = 0;
        
        for (x, y) in a.iter().zip(b.iter()) {
            let a_binary = if *x > threshold { 1 } else { 0 };
            let b_binary = if *y > threshold { 1 } else { 0 };
            
            intersection += a_binary & b_binary;
            union += a_binary | b_binary;
        }
        
        if union == 0 {
            Ok(1.0) // Both vectors are all zeros
        } else {
            Ok(intersection as f64 / union as f64)
        }
    }
    
    /// Compute similarity matrix for a set of vectors
    pub fn similarity_matrix(
        vectors: ArrayView2<f64>,
        metric: SimilarityMetric,
    ) -> MLResult<Array2<f64>> {
        let n = vectors.nrows();
        let mut similarity_matrix = Array2::zeros((n, n));
        
        for i in 0..n {
            for j in 0..n {
                let similarity = if i == j {
                    1.0
                } else {
                    match metric {
                        SimilarityMetric::Cosine => {
                            Self::cosine_similarity(vectors.row(i), vectors.row(j))?
                        },
                        SimilarityMetric::Euclidean => {
                            let distance = Self::euclidean_distance(vectors.row(i), vectors.row(j))?;
                            1.0 / (1.0 + distance) // Convert distance to similarity
                        },
                        SimilarityMetric::Manhattan => {
                            let distance = Self::manhattan_distance(vectors.row(i), vectors.row(j))?;
                            1.0 / (1.0 + distance)
                        },
                        SimilarityMetric::Jaccard => {
                            Self::jaccard_similarity(vectors.row(i), vectors.row(j))?
                        },
                    }
                };
                
                similarity_matrix[[i, j]] = similarity;
            }
        }
        
        Ok(similarity_matrix)
    }
}

/// Similarity metric types
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum SimilarityMetric {
    Cosine,
    Euclidean,
    Manhattan,
    Jaccard,
}

/// Clustering algorithms
#[derive(Debug)]
pub struct ClusteringAlgorithm;

impl ClusteringAlgorithm {
    /// K-means clustering
    pub fn kmeans(
        data: ArrayView2<f64>,
        k: usize,
        max_iterations: usize,
        tolerance: f64,
    ) -> MLResult<(Vec<usize>, Array2<f64>)> {
        let timer = Timer::new("ClusteringAlgorithm::kmeans");
        
        if data.nrows() < k {
            timer.finish();
            return Err(MLError::PatternRecognitionError(
                "Number of data points must be >= k".to_string()
            ));
        }
        
        let n_features = data.ncols();
        let mut centroids = Array2::zeros((k, n_features));
        let mut assignments = vec![0; data.nrows()];
        
        // Initialize centroids using k-means++
        let mut rng = rand::random::<usize>();
        centroids.row_mut(0).assign(&data.row(rng % data.nrows()));
        
        for i in 1..k {
            let mut distances = vec![f64::INFINITY; data.nrows()];
            
            // Compute distances to nearest centroid
            for (point_idx, point) in data.axis_iter(Axis(0)).enumerate() {
                for centroid_idx in 0..i {
                    let centroid = centroids.row(centroid_idx);
                    let distance = point.iter()
                        .zip(centroid.iter())
                        .map(|(&a, &b)| (a - b).powi(2))
                        .sum::<f64>();
                    
                    distances[point_idx] = distances[point_idx].min(distance);
                }
            }
            
            // Choose next centroid with probability proportional to squared distance
            let total_distance: f64 = distances.iter().sum();
            let mut cumulative_prob = 0.0;
            let random_val = rand::random::<f64>() * total_distance;
            
            for (point_idx, &distance) in distances.iter().enumerate() {
                cumulative_prob += distance;
                if cumulative_prob >= random_val {
                    centroids.row_mut(i).assign(&data.row(point_idx));
                    break;
                }
            }
        }
        
        let mut previous_centroids = centroids.clone();
        
        // Main k-means loop
        for _ in 0..max_iterations {
            // Assign points to nearest centroid
            for (point_idx, point) in data.axis_iter(Axis(0)).enumerate() {
                let mut best_distance = f64::INFINITY;
                let mut best_cluster = 0;
                
                for cluster_idx in 0..k {
                    let centroid = centroids.row(cluster_idx);
                    let distance = point.iter()
                        .zip(centroid.iter())
                        .map(|(&a, &b)| (a - b).powi(2))
                        .sum::<f64>();
                    
                    if distance < best_distance {
                        best_distance = distance;
                        best_cluster = cluster_idx;
                    }
                }
                
                assignments[point_idx] = best_cluster;
            }
            
            // Update centroids
            for cluster_idx in 0..k {
                let cluster_points: Vec<_> = assignments.iter()
                    .enumerate()
                    .filter_map(|(point_idx, &cluster)| {
                        if cluster == cluster_idx {
                            Some(data.row(point_idx))
                        } else {
                            None
                        }
                    })
                    .collect();
                
                if !cluster_points.is_empty() {
                    for dim in 0..n_features {
                        let mean = cluster_points.iter()
                            .map(|row| row[dim])
                            .sum::<f64>() / cluster_points.len() as f64;
                        centroids[[cluster_idx, dim]] = mean;
                    }
                }
            }
            
            // Check for convergence
            let centroid_shift = centroids.iter()
                .zip(previous_centroids.iter())
                .map(|(&new, &old)| (new - old).powi(2))
                .sum::<f64>()
                .sqrt();
            
            if centroid_shift < tolerance {
                break;
            }
            
            previous_centroids = centroids.clone();
        }
        
        timer.finish();
        Ok((assignments, centroids))
    }
    
    /// DBSCAN clustering
    pub fn dbscan(
        data: ArrayView2<f64>,
        epsilon: f64,
        min_points: usize,
    ) -> MLResult<Vec<i32>> {
        let timer = Timer::new("ClusteringAlgorithm::dbscan");
        
        let n_points = data.nrows();
        let mut labels = vec![-1; n_points]; // -1 = noise, 0+ = cluster id
        let mut cluster_id = 0;
        
        for point_idx in 0..n_points {
            if labels[point_idx] != -1 {
                continue; // Already processed
            }
            
            // Find neighbors
            let neighbors = self.range_query(data, point_idx, epsilon)?;
            
            if neighbors.len() < min_points {
                labels[point_idx] = -1; // Mark as noise
                continue;
            }
            
            // Start new cluster
            labels[point_idx] = cluster_id;
            let mut seed_set = neighbors;
            
            let mut i = 0;
            while i < seed_set.len() {
                let q = seed_set[i];
                
                if labels[q] == -1 {
                    labels[q] = cluster_id; // Change noise to border point
                }
                
                if labels[q] != -1 {
                    i += 1;
                    continue; // Already processed
                }
                
                labels[q] = cluster_id;
                let q_neighbors = self.range_query(data, q, epsilon)?;
                
                if q_neighbors.len() >= min_points {
                    // Add new neighbors to seed set
                    for &neighbor in &q_neighbors {
                        if !seed_set.contains(&neighbor) {
                            seed_set.push(neighbor);
                        }
                    }
                }
                
                i += 1;
            }
            
            cluster_id += 1;
        }
        
        timer.finish();
        Ok(labels)
    }
    
    /// Range query for DBSCAN
    fn range_query(&self, data: ArrayView2<f64>, point_idx: usize, epsilon: f64) -> MLResult<Vec<usize>> {
        let mut neighbors = Vec::new();
        let point = data.row(point_idx);
        
        for (other_idx, other_point) in data.axis_iter(Axis(0)).enumerate() {
            let distance = point.iter()
                .zip(other_point.iter())
                .map(|(&a, &b)| (a - b).powi(2))
                .sum::<f64>()
                .sqrt();
            
            if distance <= epsilon {
                neighbors.push(other_idx);
            }
        }
        
        Ok(neighbors)
    }
    
    /// Hierarchical clustering (agglomerative)
    pub fn hierarchical_clustering(
        data: ArrayView2<f64>,
        n_clusters: usize,
        linkage: LinkageMethod,
    ) -> MLResult<Vec<usize>> {
        let timer = Timer::new("ClusteringAlgorithm::hierarchical_clustering");
        
        let n_points = data.nrows();
        if n_clusters > n_points {
            timer.finish();
            return Err(MLError::PatternRecognitionError(
                "Number of clusters cannot exceed number of data points".to_string()
            ));
        }
        
        // Initialize - each point is its own cluster
        let mut clusters: Vec<Vec<usize>> = (0..n_points).map(|i| vec![i]).collect();
        
        // Compute distance matrix
        let mut distances = Array2::from_elem((n_points, n_points), f64::INFINITY);
        for i in 0..n_points {
            for j in (i + 1)..n_points {
                let distance = data.row(i).iter()
                    .zip(data.row(j).iter())
                    .map(|(&a, &b)| (a - b).powi(2))
                    .sum::<f64>()
                    .sqrt();
                
                distances[[i, j]] = distance;
                distances[[j, i]] = distance;
            }
            distances[[i, i]] = 0.0;
        }
        
        // Merge clusters until target number is reached
        while clusters.len() > n_clusters {
            let mut min_distance = f64::INFINITY;
            let mut merge_i = 0;
            let mut merge_j = 0;
            
            // Find closest pair of clusters
            for i in 0..clusters.len() {
                for j in (i + 1)..clusters.len() {
                    let cluster_distance = self.compute_cluster_distance(
                        &clusters[i],
                        &clusters[j],
                        &distances,
                        linkage,
                    )?;
                    
                    if cluster_distance < min_distance {
                        min_distance = cluster_distance;
                        merge_i = i;
                        merge_j = j;
                    }
                }
            }
            
            // Merge clusters
            let cluster_j = clusters.remove(merge_j);
            clusters[merge_i].extend(cluster_j);
        }
        
        // Assign cluster labels
        let mut labels = vec![0; n_points];
        for (cluster_id, cluster) in clusters.iter().enumerate() {
            for &point_idx in cluster {
                labels[point_idx] = cluster_id;
            }
        }
        
        timer.finish();
        Ok(labels)
    }
    
    /// Compute distance between two clusters
    fn compute_cluster_distance(
        &self,
        cluster1: &[usize],
        cluster2: &[usize],
        distances: &Array2<f64>,
        linkage: LinkageMethod,
    ) -> MLResult<f64> {
        match linkage {
            LinkageMethod::Single => {
                // Minimum distance between any two points
                let mut min_distance = f64::INFINITY;
                for &i in cluster1 {
                    for &j in cluster2 {
                        min_distance = min_distance.min(distances[[i, j]]);
                    }
                }
                Ok(min_distance)
            },
            
            LinkageMethod::Complete => {
                // Maximum distance between any two points
                let mut max_distance = 0.0;
                for &i in cluster1 {
                    for &j in cluster2 {
                        max_distance = max_distance.max(distances[[i, j]]);
                    }
                }
                Ok(max_distance)
            },
            
            LinkageMethod::Average => {
                // Average distance between all pairs
                let mut total_distance = 0.0;
                let mut count = 0;
                for &i in cluster1 {
                    for &j in cluster2 {
                        total_distance += distances[[i, j]];
                        count += 1;
                    }
                }
                Ok(if count > 0 { total_distance / count as f64 } else { 0.0 })
            },
        }
    }
}

/// Linkage methods for hierarchical clustering
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum LinkageMethod {
    Single,
    Complete,
    Average,
}

impl MemoryAware for PatternExtractor {
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
        let patterns_memory = self.recognized_patterns.len() * 1000; // Approximate per pattern
        let history_memory = self.pattern_history.len() * 100; // Approximate per history item
        let temporal_memory = self.temporal_patterns.len() * 200;
        let frequency_memory = self.frequency_patterns.len() * 100;
        
        patterns_memory + history_memory + temporal_memory + frequency_memory
    }
}

impl GpuAccelerated for PatternExtractor {
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

impl Serializable for PatternExtractor {
    fn serialize(&self) -> MLResult<Vec<u8>> {
        let data = serde_json::to_vec(&self.config)
            .map_err(|e| MLError::SerializationError(format!("Failed to serialize PatternExtractor: {}", e)))?;
        Ok(data)
    }
    
    fn deserialize(data: &[u8]) -> MLResult<Self> {
        let config: PatternExtractionConfig = serde_json::from_slice(data)
            .map_err(|e| MLError::SerializationError(format!("Failed to deserialize PatternExtractor: {}", e)))?;
        
        Ok(Self::new(config))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;
    
    #[test]
    fn test_pattern_extraction() {
        let config = PatternExtractionConfig::default();
        let mut extractor = PatternExtractor::new(config);
        
        // Create test data with patterns
        let data = Array2::from_shape_vec(
            (10, 3),
            vec![
                1.0, 2.0, 3.0,
                2.0, 4.0, 6.0,
                3.0, 6.0, 9.0,
                4.0, 8.0, 12.0,
                5.0, 10.0, 15.0,
                1.0, 2.0, 3.0,
                2.0, 4.0, 6.0,
                3.0, 6.0, 9.0,
                4.0, 8.0, 12.0,
                5.0, 10.0, 15.0,
            ]
        ).unwrap();
        
        let patterns = extractor.extract_patterns(&data).unwrap();
        assert!(!patterns.is_empty());
        
        // Should detect correlations and frequency patterns
        let structural_patterns = extractor.get_patterns_by_type(&PatternType::Structural);
        let frequency_patterns = extractor.get_patterns_by_type(&PatternType::Frequency);
        
        assert!(!structural_patterns.is_empty() || !frequency_patterns.is_empty());
    }
    
    #[test]
    fn test_tfidf_embedding() {
        let mut embedding_model = TfIdfEmbedding::new(10);
        
        let corpus = vec![
            "hello world test",
            "world test example",
            "test example hello",
        ];
        
        embedding_model.fit(&corpus).unwrap();
        
        let embedding = embedding_model.embed_text("hello test").unwrap();
        assert_eq!(embedding.len(), 10);
        
        // Embedding should be normalized
        let norm = embedding.iter().map(|x| x * x).sum::<f64>().sqrt();
        assert_relative_eq!(norm, 1.0, epsilon = 1e-6);
    }
    
    #[test]
    fn test_similarity_metrics() {
        let a = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let b = Array1::from_vec(vec![2.0, 4.0, 6.0]);
        let c = Array1::from_vec(vec![-1.0, -2.0, -3.0]);
        
        let cosine_ab = SimilarityMetrics::cosine_similarity(a.view(), b.view()).unwrap();
        let cosine_ac = SimilarityMetrics::cosine_similarity(a.view(), c.view()).unwrap();
        
        assert_relative_eq!(cosine_ab, 1.0, epsilon = 1e-6); // Parallel vectors
        assert_relative_eq!(cosine_ac, -1.0, epsilon = 1e-6); // Anti-parallel vectors
        
        let euclidean = SimilarityMetrics::euclidean_distance(a.view(), b.view()).unwrap();
        assert!(euclidean > 0.0);
        
        let manhattan = SimilarityMetrics::manhattan_distance(a.view(), b.view()).unwrap();
        assert!(manhattan > 0.0);
    }
    
    #[test]
    fn test_kmeans_clustering() {
        // Create clustered data
        let data = Array2::from_shape_vec(
            (6, 2),
            vec![
                1.0, 1.0,  // Cluster 1
                1.5, 1.5,
                2.0, 2.0,
                10.0, 10.0, // Cluster 2
                10.5, 10.5,
                11.0, 11.0,
            ]
        ).unwrap();
        
        let (assignments, centroids) = ClusteringAlgorithm::kmeans(
            data.view(),
            2,
            100,
            1e-6,
        ).unwrap();
        
        assert_eq!(assignments.len(), 6);
        assert_eq!(centroids.nrows(), 2);
        assert_eq!(centroids.ncols(), 2);
        
        // Check that points are properly clustered
        assert_eq!(assignments[0], assignments[1]);
        assert_eq!(assignments[1], assignments[2]);
        assert_eq!(assignments[3], assignments[4]);
        assert_eq!(assignments[4], assignments[5]);
        assert_ne!(assignments[0], assignments[3]);
    }
    
    #[test]
    fn test_dbscan_clustering() {
        // Create data with clear clusters and noise
        let data = Array2::from_shape_vec(
            (7, 2),
            vec![
                1.0, 1.0,  // Cluster 1
                1.1, 1.1,
                1.2, 1.2,
                10.0, 10.0, // Cluster 2
                10.1, 10.1,
                10.2, 10.2,
                5.0, 5.0,   // Noise point
            ]
        ).unwrap();
        
        let labels = ClusteringAlgorithm::dbscan(data.view(), 1.0, 2).unwrap();
        
        assert_eq!(labels.len(), 7);
        
        // Check that clusters are identified
        let unique_labels: std::collections::HashSet<_> = labels.into_iter().collect();
        assert!(unique_labels.len() >= 2); // At least 2 clusters (and possibly noise)
    }
    
    #[test]
    fn test_pattern_similarity() {
        let pattern1 = RecognizedPattern::new(
            PatternType::Sequential,
            0.8,
            "Test pattern 1".to_string(),
            Array1::from_vec(vec![1.0, 2.0, 3.0]),
        );
        
        let pattern2 = RecognizedPattern::new(
            PatternType::Sequential,
            0.7,
            "Test pattern 2".to_string(),
            Array1::from_vec(vec![1.0, 2.0, 3.0]), // Same features
        );
        
        let pattern3 = RecognizedPattern::new(
            PatternType::Sequential,
            0.9,
            "Test pattern 3".to_string(),
            Array1::from_vec(vec![-1.0, -2.0, -3.0]), // Opposite features
        );
        
        let similarity12 = pattern1.similarity(&pattern2);
        let similarity13 = pattern1.similarity(&pattern3);
        
        assert_relative_eq!(similarity12, 1.0, epsilon = 1e-6);
        assert_relative_eq!(similarity13, -1.0, epsilon = 1e-6);
    }
    
    #[test]
    fn test_trend_detection() {
        let config = PatternExtractionConfig::default();
        let extractor = PatternExtractor::new(config);
        
        // Increasing trend
        let increasing_data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let trend = extractor.detect_trend(&increasing_data).unwrap();
        assert!(trend > 0.0);
        
        // Decreasing trend
        let decreasing_data = vec![5.0, 4.0, 3.0, 2.0, 1.0];
        let trend = extractor.detect_trend(&decreasing_data).unwrap();
        assert!(trend < 0.0);
        
        // No trend
        let flat_data = vec![3.0, 3.0, 3.0, 3.0, 3.0];
        let trend = extractor.detect_trend(&flat_data).unwrap();
        assert_relative_eq!(trend, 0.0, epsilon = 1e-6);
    }
    
    #[test]
    fn test_hierarchical_clustering() {
        let data = Array2::from_shape_vec(
            (4, 2),
            vec![
                1.0, 1.0,
                1.5, 1.5,
                10.0, 10.0,
                10.5, 10.5,
            ]
        ).unwrap();
        
        let labels = ClusteringAlgorithm::hierarchical_clustering(
            data.view(),
            2,
            LinkageMethod::Single,
        ).unwrap();
        
        assert_eq!(labels.len(), 4);
        
        // Points that are close should be in the same cluster
        assert_eq!(labels[0], labels[1]);
        assert_eq!(labels[2], labels[3]);
        assert_ne!(labels[0], labels[2]);
    }
}