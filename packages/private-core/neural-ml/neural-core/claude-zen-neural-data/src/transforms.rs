//! Data transformation utilities

use crate::Result;
use polars::prelude::*;

/// Log transformation
pub struct LogTransform {
  pub base: f64,
}

impl Default for LogTransform {
  fn default() -> Self {
    Self {
      base: std::f64::consts::E,
    }
  }
}

impl LogTransform {
  pub fn new(base: f64) -> Self {
    Self { base }
  }

  pub fn transform(&self, data: &DataFrame) -> Result<DataFrame> {
    let mut result = data.clone();

    // Apply log transformation to numeric columns
    for col_name in data.get_column_names() {
      if let Ok(series) = data.column(col_name) {
        match series.dtype() {
          DataType::Float64
          | DataType::Float32
          | DataType::Int64
          | DataType::Int32 => {
            let transformed = series
              .f64()?
              .apply(|val| {
                val.map(|v| {
                  if v > 0.0 {
                    if self.base == std::f64::consts::E {
                      v.ln()
                    } else {
                      v.log(self.base)
                    }
                  } else {
                    // Handle non-positive values by adding small constant
                    let adjusted = v + 1.0;
                    if self.base == std::f64::consts::E {
                      adjusted.ln()
                    } else {
                      adjusted.log(self.base)
                    }
                  }
                })
              })
              .with_name(col_name.clone());

            let column = transformed.into_column();
            result = result.hstack(&[column])?;
          }
          _ => {
            // Skip non-numeric columns
            continue;
          }
        }
      }
    }

    Ok(result)
  }

  pub fn inverse_transform(&self, data: &DataFrame) -> Result<DataFrame> {
    let mut result = data.clone();

    // Apply inverse log transformation (exponential) to numeric columns
    for col_name in data.get_column_names() {
      if let Ok(series) = data.column(col_name) {
        match series.dtype() {
          DataType::Float64
          | DataType::Float32
          | DataType::Int64
          | DataType::Int32 => {
            let transformed = series
              .f64()?
              .apply(|val| {
                val.map(|v| {
                  if self.base == std::f64::consts::E {
                    v.exp()
                  } else {
                    self.base.powf(v)
                  }
                })
              })
              .with_name(col_name.clone());

            let column = transformed.into_column();
            result = result.hstack(&[column])?;
          }
          _ => {
            // Skip non-numeric columns
            continue;
          }
        }
      }
    }

    Ok(result)
  }
}

/// Difference transformation
pub struct DifferenceTransform {
  pub periods: usize,
}

impl Default for DifferenceTransform {
  fn default() -> Self {
    Self { periods: 1 }
  }
}

impl DifferenceTransform {
  pub fn new(periods: usize) -> Self {
    Self { periods }
  }

  pub fn transform(&self, data: &DataFrame) -> Result<DataFrame> {
    let mut result = data.clone();

    // Apply differencing to numeric columns
    for col_name in data.get_column_names() {
      if let Ok(series) = data.column(col_name) {
        match series.dtype() {
          DataType::Float64
          | DataType::Float32
          | DataType::Int64
          | DataType::Int32 => {
            let numeric_series = series.f64()?;
            let len = numeric_series.len();

            if len <= self.periods {
              // Not enough data for differencing, return NaN values
              let nan_values: Vec<Option<f64>> = vec![None; len];
              let transformed = Series::new(col_name.clone(), nan_values);
              let column = transformed.into_column();
              result = result.hstack(&[column])?;
              continue;
            }

            // Calculate differences
            let mut diff_values = Vec::with_capacity(len);

            // Fill first `periods` values with None (NaN)
            for _ in 0..self.periods {
              diff_values.push(None);
            }

            // Calculate differences for remaining values
            for i in self.periods..len {
              if let (Some(current), Some(previous)) =
                (numeric_series.get(i), numeric_series.get(i - self.periods))
              {
                diff_values.push(Some(current - previous));
              } else {
                diff_values.push(None);
              }
            }

            let transformed = Series::new(col_name.clone(), diff_values);
            let column = transformed.into_column();
            result = result.hstack(&[column])?;
          }
          _ => {
            // Skip non-numeric columns
            continue;
          }
        }
      }
    }

    Ok(result)
  }

  pub fn inverse_transform(&self, data: &DataFrame) -> Result<DataFrame> {
    // Note: Inverse differencing requires the original values for the first `periods` observations
    // This is a simplified implementation that assumes the first values are cumulative sums
    let mut result = data.clone();

    for col_name in data.get_column_names() {
      if let Ok(series) = data.column(col_name) {
        match series.dtype() {
          DataType::Float64
          | DataType::Float32
          | DataType::Int64
          | DataType::Int32 => {
            let numeric_series = series.f64()?;
            let len = numeric_series.len();

            if len == 0 {
              continue;
            }

            let mut original_values = Vec::with_capacity(len);

            // For inverse differencing, we need to cumulative sum
            // Starting from the first non-null value
            let mut running_sum = 0.0;
            let mut found_first = false;

            for i in 0..len {
              if let Some(diff_val) = numeric_series.get(i) {
                if !found_first {
                  // First non-null value becomes our starting point
                  running_sum = diff_val;
                  found_first = true;
                } else {
                  running_sum += diff_val;
                }
                original_values.push(Some(running_sum));
              } else {
                original_values.push(None);
              }
            }

            let transformed = Series::new(col_name.clone(), original_values);
            let column = transformed.into_column();
            result = result.hstack(&[column])?;
          }
          _ => {
            // Skip non-numeric columns
            continue;
          }
        }
      }
    }

    Ok(result)
  }
}
