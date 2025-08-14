//! CUDA-Rust-WASM: A CUDA to Rust transpiler with WebGPU/WASM support
//!
//! This crate provides a complete toolchain for translating CUDA code to Rust,
//! with support for WebGPU backends and WASM compilation.

#![warn(missing_docs)]
// Allow unsafe code for low-level memory operations
#![allow(unsafe_code)]

#[cfg(feature = "webgpu-only")]
pub mod backend;
pub mod error;
#[cfg(not(feature = "cpu-only"))]
pub mod kernel;
#[cfg(not(feature = "cpu-only"))]
pub mod memory;
pub mod parser;
#[cfg(not(feature = "cpu-only"))]
pub mod prelude;
#[cfg(not(feature = "cpu-only"))]
pub mod profiling;
#[cfg(feature = "webgpu-only")]
pub mod runtime;
pub mod transpiler;
pub mod utils;

// Neural integration module for ruv-FANN (disabled for CPU-only builds)
#[cfg(all(not(feature = "minimal"), not(feature = "cpu-only")))]
pub mod neural_integration;

// Re-export main types
pub use error::{CudaRustError, Result};
pub use parser::CudaParser;
#[cfg(feature = "webgpu-only")]
pub use runtime::Runtime;
pub use transpiler::{CudaTranspiler, Transpiler};

// The kernel_function macro is automatically available globally through #[macro_export]

// Re-export neural integration types (disabled for CPU-only builds)
#[cfg(all(not(feature = "minimal"), not(feature = "cpu-only")))]
pub use neural_integration::{
  get_capabilities as get_neural_capabilities,
  initialize as init_neural_integration,
  ActivationFunction as NeuralActivationFunction, BridgeConfig, NeuralBridge,
  NeuralOperation, SystemCapabilities as NeuralCapabilities,
};

/// Main entry point for transpiling CUDA code to Rust
pub struct CudaRust {
  parser: CudaParser,
  transpiler: Transpiler,
}

impl CudaRust {
  /// Create a new CUDA-Rust transpiler instance
  pub fn new() -> Self {
    Self {
      parser: CudaParser::new(),
      transpiler: Transpiler::new(),
    }
  }

  /// Transpile CUDA source code to Rust
  pub fn transpile(&self, cuda_source: &str) -> Result<String> {
    // Parse CUDA source
    let ast = self.parser.parse(cuda_source)?;

    // Transpile to Rust
    let rust_code = self.transpiler.transpile(ast)?;

    Ok(rust_code)
  }

  /// Transpile and compile to WebGPU shader
  #[cfg(feature = "webgpu-only")]
  pub fn to_webgpu(&self, cuda_source: &str) -> Result<String> {
    let ast = self.parser.parse(cuda_source)?;
    let wgsl = self.transpiler.to_wgsl(ast)?;
    Ok(wgsl)
  }
}

impl Default for CudaRust {
  fn default() -> Self {
    Self::new()
  }
}

/// Initialize the CUDA-Rust runtime
#[cfg(feature = "webgpu-only")]
pub fn init() -> Result<Runtime> {
  Runtime::new()
}

// Feature flags for conditional compilation
#[cfg(target_arch = "wasm32")]
pub mod wasm {
  use wasm_bindgen::prelude::*;

  /// Initialize WASM module
  #[wasm_bindgen(start)]
  pub fn init_wasm() {
    console_error_panic_hook::set_once();

    #[cfg(feature = "debug-transpiler")]
    {
      console_log::init_with_level(log::Level::Debug).ok();
    }
  }

  /// Transpile CUDA code from JavaScript
  #[wasm_bindgen]
  pub fn transpile_cuda(cuda_code: &str) -> Result<String, JsValue> {
    let transpiler = super::CudaRust::new();
    transpiler
      .transpile(cuda_code)
      .map_err(|e| JsValue::from_str(&e.to_string()))
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_basic_transpilation() {
    let cuda_rust = CudaRust::new();
    let cuda_code = r#"
            __global__ void add(float* a, float* b, float* c) {
                int i = threadIdx.x;
                c[i] = a[i] + b[i];
            }
        "#;

    let result = cuda_rust.transpile(cuda_code);
    assert!(result.is_ok());
  }
}
