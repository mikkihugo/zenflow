//! High-Performance Matrix Operations for Financial Modeling
//!
//! Optimized mathematical operations commonly used in financial neural networks
//! and pattern recognition systems, inspired by MQL5 mathematical functions.

use ndarray::{Array1, Array2, Axis, s};
use std::f32;
use serde::{Deserialize, Serialize};

/// Matrix operations optimized for financial calculations
#[derive(Debug, Clone)]
pub struct FinancialMatrix;

impl FinancialMatrix {
    /// Fast matrix multiplication using SIMD-optimized operations
    pub fn matmul_optimized(a: &Array2<f32>, b: &Array2<f32>) -> Array2<f32> {
        // Use ndarray's optimized dot product
        a.dot(b)
    }

    /// Compute moving average efficiently
    pub fn moving_average(data: &Array1<f32>, window: usize) -> Array1<f32> {
        let n = data.len();
        if window > n {
            return Array1::zeros(0);
        }
        
        let mut result = Array1::zeros(n - window + 1);
        let mut sum = data.slice(s![0..window]).sum();
        result[0] = sum / window as f32;
        
        for i in 1..(n - window + 1) {
            sum = sum - data[i - 1] + data[i + window - 1];
            result[i] = sum / window as f32;
        }
        
        result
    }

    /// Compute exponential moving average
    pub fn exponential_moving_average(data: &Array1<f32>, alpha: f32) -> Array1<f32> {
        let n = data.len();
        if n == 0 {
            return Array1::zeros(0);
        }
        
        let mut result = Array1::zeros(n);
        result[0] = data[0];
        
        for i in 1..n {
            result[i] = alpha * data[i] + (1.0 - alpha) * result[i - 1];
        }
        
        result
    }

    /// Compute Relative Strength Index (RSI)
    pub fn rsi(prices: &Array1<f32>, period: usize) -> Array1<f32> {
        let n = prices.len();
        if n < period + 1 {
            return Array1::zeros(0);
        }
        
        // Calculate price changes
        let mut changes = Array1::zeros(n - 1);
        for i in 0..(n - 1) {
            changes[i] = prices[i + 1] - prices[i];
        }
        
        // Separate gains and losses
        let gains: Array1<f32> = changes.mapv(|x| if x > 0.0 { x } else { 0.0 });
        let losses: Array1<f32> = changes.mapv(|x| if x < 0.0 { -x } else { 0.0 });
        
        // Calculate RSI
        let mut result = Array1::zeros(n - period);
        
        for i in 0..(n - period) {
            let window_start = i;
            let window_end = i + period;
            
            let avg_gain = gains.slice(s![window_start..window_end]).mean().unwrap_or(0.0);
            let avg_loss = losses.slice(s![window_start..window_end]).mean().unwrap_or(0.0);
            
            if avg_loss == 0.0 {
                result[i] = 100.0;
            } else {
                let rs = avg_gain / avg_loss;
                result[i] = 100.0 - (100.0 / (1.0 + rs));
            }
        }
        
        result
    }

    /// Compute Bollinger Bands
    pub fn bollinger_bands(prices: &Array1<f32>, period: usize, std_dev: f32) -> (Array1<f32>, Array1<f32>, Array1<f32>) {
        let ma = Self::moving_average(prices, period);
        let n = ma.len();
        
        let mut upper = Array1::zeros(n);
        let mut lower = Array1::zeros(n);
        
        for i in 0..n {
            let window_start = i;
            let window_end = i + period;
            let window = prices.slice(s![window_start..window_end]);
            
            let std = (window.mapv(|x| (x - ma[i]).powi(2)).sum() / period as f32).sqrt();
            upper[i] = ma[i] + std_dev * std;
            lower[i] = ma[i] - std_dev * std;
        }
        
        (upper, ma, lower)
    }

    /// Fast correlation coefficient calculation
    pub fn correlation(x: &Array1<f32>, y: &Array1<f32>) -> f32 {
        if x.len() != y.len() || x.len() == 0 {
            return 0.0;
        }
        
        let _n = x.len() as f32;
        let mean_x = x.mean().unwrap_or(0.0);
        let mean_y = y.mean().unwrap_or(0.0);
        
        let mut numerator = 0.0;
        let mut sum_sq_x = 0.0;
        let mut sum_sq_y = 0.0;
        
        for i in 0..x.len() {
            let dx = x[i] - mean_x;
            let dy = y[i] - mean_y;
            numerator += dx * dy;
            sum_sq_x += dx * dx;
            sum_sq_y += dy * dy;
        }
        
        let denominator = (sum_sq_x * sum_sq_y).sqrt();
        if denominator == 0.0 {
            0.0
        } else {
            numerator / denominator
        }
    }

    /// Compute covariance matrix efficiently
    pub fn covariance_matrix(data: &Array2<f32>) -> Array2<f32> {
        let (n_samples, _n_features) = data.dim();
        let n_samples_f = n_samples as f32;
        
        // Center the data
        let means = data.mean_axis(Axis(0)).unwrap();
        let centered = data - &means;
        
        // Compute covariance matrix
        centered.t().dot(&centered) / (n_samples_f - 1.0)
    }

    /// Principal Component Analysis (PCA) for dimensionality reduction
    pub fn pca_transform(data: &Array2<f32>, n_components: usize) -> (Array2<f32>, Array1<f32>) {
        // Simplified PCA implementation
        // In a full implementation, you'd use proper eigenvalue decomposition
        let _cov_matrix = Self::covariance_matrix(data);
        
        // For demonstration, return a subset of features
        // Real PCA would compute eigenvectors and eigenvalues
        let (_, n_features) = data.dim();
        let actual_components = n_components.min(n_features);
        
        let transformed = data.slice(s![.., 0..actual_components]).to_owned();
        let explained_variance = Array1::ones(actual_components);
        
        (transformed, explained_variance)
    }

    /// Z-score normalization
    pub fn zscore_normalize(data: &Array1<f32>) -> (Array1<f32>, f32, f32) {
        let mean = data.mean().unwrap_or(0.0);
        let std = data.std(0.0);
        
        if std == 0.0 {
            return (data.clone(), mean, 1.0);
        }
        
        let normalized = data.mapv(|x| (x - mean) / std);
        (normalized, mean, std)
    }

    /// Min-Max normalization
    pub fn minmax_normalize(data: &Array1<f32>) -> (Array1<f32>, f32, f32) {
        let min_val = data.fold(f32::INFINITY, |acc, &x| acc.min(x));
        let max_val = data.fold(f32::NEG_INFINITY, |acc, &x| acc.max(x));
        
        if min_val == max_val {
            return (Array1::zeros(data.len()), min_val, max_val);
        }
        
        let range = max_val - min_val;
        let normalized = data.mapv(|x| (x - min_val) / range);
        (normalized, min_val, max_val)
    }
}

/// Technical indicators commonly used in financial analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicalIndicators;

impl TechnicalIndicators {
    /// MACD (Moving Average Convergence Divergence)
    pub fn macd(prices: &Array1<f32>, fast: f32, slow: f32, signal: f32) -> (Array1<f32>, Array1<f32>, Array1<f32>) {
        let ema_fast = FinancialMatrix::exponential_moving_average(prices, fast);
        let ema_slow = FinancialMatrix::exponential_moving_average(prices, slow);
        
        let macd_line = &ema_fast - &ema_slow;
        let signal_line = FinancialMatrix::exponential_moving_average(&macd_line, signal);
        let histogram = &macd_line - &signal_line;
        
        (macd_line, signal_line, histogram)
    }

    /// Stochastic Oscillator
    pub fn stochastic(high: &Array1<f32>, low: &Array1<f32>, close: &Array1<f32>, k_period: usize) -> Array1<f32> {
        let n = close.len();
        if n < k_period {
            return Array1::zeros(0);
        }
        
        let mut result = Array1::zeros(n - k_period + 1);
        
        for i in 0..(n - k_period + 1) {
            let window_start = i;
            let window_end = i + k_period;
            
            let period_high = high.slice(s![window_start..window_end]).fold(f32::NEG_INFINITY, |acc, &x| acc.max(x));
            let period_low = low.slice(s![window_start..window_end]).fold(f32::INFINITY, |acc, &x| acc.min(x));
            let current_close = close[window_end - 1];
            
            if period_high == period_low {
                result[i] = 50.0;
            } else {
                result[i] = 100.0 * (current_close - period_low) / (period_high - period_low);
            }
        }
        
        result
    }

    /// Average True Range (ATR)
    pub fn atr(high: &Array1<f32>, low: &Array1<f32>, close: &Array1<f32>, period: usize) -> Array1<f32> {
        let n = close.len();
        if n < 2 {
            return Array1::zeros(0);
        }
        
        let mut true_ranges = Array1::zeros(n - 1);
        
        for i in 1..n {
            let tr1 = high[i] - low[i];
            let tr2 = (high[i] - close[i - 1]).abs();
            let tr3 = (low[i] - close[i - 1]).abs();
            true_ranges[i - 1] = tr1.max(tr2).max(tr3);
        }
        
        FinancialMatrix::moving_average(&true_ranges, period)
    }
}

/// High-performance pattern recognition functions
#[derive(Debug, Clone)]
pub struct PatternRecognition;

impl PatternRecognition {
    /// Detect trend patterns using linear regression
    pub fn detect_trend(prices: &Array1<f32>) -> f32 {
        let n = prices.len() as f32;
        if n < 2.0 {
            return 0.0;
        }
        
        let x_sum = (n * (n - 1.0)) / 2.0;
        let x_squared_sum = (n * (n - 1.0) * (2.0 * n - 1.0)) / 6.0;
        let y_sum = prices.sum();
        
        let mut xy_sum = 0.0;
        for (i, &price) in prices.iter().enumerate() {
            xy_sum += i as f32 * price;
        }
        
        let slope = (n * xy_sum - x_sum * y_sum) / (n * x_squared_sum - x_sum * x_sum);
        slope
    }

    /// Detect support and resistance levels
    pub fn find_support_resistance(prices: &Array1<f32>, window: usize) -> (Vec<(usize, f32)>, Vec<(usize, f32)>) {
        let n = prices.len();
        let mut supports = Vec::new();
        let mut resistances = Vec::new();
        
        for i in window..(n - window) {
            let current = prices[i];
            let mut is_support = true;
            let mut is_resistance = true;
            
            // Check if current point is a local minimum (support)
            for j in (i - window)..(i + window + 1) {
                if j != i && prices[j] < current {
                    is_support = false;
                }
                if j != i && prices[j] > current {
                    is_resistance = false;
                }
            }
            
            if is_support {
                supports.push((i, current));
            }
            if is_resistance {
                resistances.push((i, current));
            }
        }
        
        (supports, resistances)
    }

    /// Calculate pattern similarity using dynamic time warping distance
    pub fn pattern_similarity(pattern1: &Array1<f32>, pattern2: &Array1<f32>) -> f32 {
        // Simplified DTW implementation
        let n = pattern1.len();
        let m = pattern2.len();
        
        if n == 0 || m == 0 {
            return f32::INFINITY;
        }
        
        let mut dtw = Array2::from_elem((n + 1, m + 1), f32::INFINITY);
        dtw[[0, 0]] = 0.0;
        
        for i in 1..=n {
            for j in 1..=m {
                let cost = (pattern1[i - 1] - pattern2[j - 1]).abs();
                dtw[[i, j]] = cost + dtw[[i - 1, j]].min(dtw[[i, j - 1]]).min(dtw[[i - 1, j - 1]]);
            }
        }
        
        dtw[[n, m]]
    }

    /// Detect head and shoulders pattern
    pub fn detect_head_shoulders(prices: &Array1<f32>) -> Option<(usize, usize, usize)> {
        let (_, peaks) = Self::find_support_resistance(prices, 5);
        
        if peaks.len() < 3 {
            return None;
        }
        
        // Look for three consecutive peaks where middle is highest
        for i in 0..(peaks.len() - 2) {
            let (idx1, price1) = peaks[i];
            let (idx2, price2) = peaks[i + 1];
            let (idx3, price3) = peaks[i + 2];
            
            // Head and shoulders: shoulder1 < head > shoulder2
            if price1 < price2 && price3 < price2 && (price1 - price3).abs() / price2 < 0.1 {
                return Some((idx1, idx2, idx3));
            }
        }
        
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::array;

    #[test]
    fn test_moving_average() {
        let data = array![1.0, 2.0, 3.0, 4.0, 5.0];
        let ma = FinancialMatrix::moving_average(&data, 3);
        assert_eq!(ma.len(), 3);
        assert!((ma[0] - 2.0).abs() < 1e-6);
        assert!((ma[1] - 3.0).abs() < 1e-6);
        assert!((ma[2] - 4.0).abs() < 1e-6);
    }

    #[test]
    fn test_exponential_moving_average() {
        let data = array![1.0, 2.0, 3.0, 4.0, 5.0];
        let ema = FinancialMatrix::exponential_moving_average(&data, 0.5);
        assert_eq!(ema.len(), 5);
        assert_eq!(ema[0], 1.0);
        assert_eq!(ema[1], 1.5); // 0.5 * 2 + 0.5 * 1
    }

    #[test]
    fn test_correlation() {
        let x = array![1.0, 2.0, 3.0, 4.0, 5.0];
        let y = array![2.0, 4.0, 6.0, 8.0, 10.0];
        let corr = FinancialMatrix::correlation(&x, &y);
        assert!((corr - 1.0).abs() < 1e-6); // Perfect positive correlation
    }

    #[test]
    fn test_zscore_normalize() {
        let data = array![1.0, 2.0, 3.0, 4.0, 5.0];
        let (normalized, mean, _std) = FinancialMatrix::zscore_normalize(&data);
        assert!((mean - 3.0).abs() < 1e-6);
        assert!(normalized.mean().unwrap().abs() < 1e-6); // Mean should be ~0
    }

    #[test]
    fn test_rsi() {
        let prices = array![44.0, 44.3, 44.1, 44.2, 44.5, 43.9, 44.9, 44.5, 44.6, 44.8, 44.2, 45.1, 45.3, 45.4, 45.4, 45.2];
        let rsi = FinancialMatrix::rsi(&prices, 14);
        assert!(!rsi.is_empty());
        // RSI should be between 0 and 100
        for &value in rsi.iter() {
            assert!(value >= 0.0 && value <= 100.0);
        }
    }

    #[test]
    fn test_trend_detection() {
        let uptrend = array![1.0, 2.0, 3.0, 4.0, 5.0];
        let downtrend = array![5.0, 4.0, 3.0, 2.0, 1.0];
        
        let up_slope = PatternRecognition::detect_trend(&uptrend);
        let down_slope = PatternRecognition::detect_trend(&downtrend);
        
        assert!(up_slope > 0.0);
        assert!(down_slope < 0.0);
    }

    #[test]
    fn test_macd() {
        let prices = array![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
        let (macd, signal, histogram) = TechnicalIndicators::macd(&prices, 0.2, 0.1, 0.15);
        
        assert_eq!(macd.len(), prices.len());
        assert_eq!(signal.len(), prices.len());
        assert_eq!(histogram.len(), prices.len());
    }

    #[test]
    fn test_pattern_similarity() {
        let pattern1 = array![1.0, 2.0, 3.0, 2.0, 1.0];
        let pattern2 = array![1.0, 2.0, 3.0, 2.0, 1.0];
        let pattern3 = array![5.0, 4.0, 3.0, 4.0, 5.0];
        
        let similarity_identical = PatternRecognition::pattern_similarity(&pattern1, &pattern2);
        let similarity_different = PatternRecognition::pattern_similarity(&pattern1, &pattern3);
        
        assert!(similarity_identical < similarity_different);
    }
}