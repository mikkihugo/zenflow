/*!
 * Apple Acceleration - Metal GPU + Accelerate Framework + NEON optimization
 * 
 * Optimized for Apple Silicon (M1/M2/M3/M4) using:
 * - Metal GPU compute shaders for large matrix operations
 * - Apple Accelerate Framework for BLAS/LAPACK  
 * - ARM NEON SIMD for vector operations
 * - Unified memory architecture optimization
 */

use super::{OptimizedOps, ActivationType, Result};
use crate::error::NeuralError;

#[cfg(feature = "apple-acceleration")]
use {
    accelerate_src::*,
    metal::*,
    core_foundation::base::TCFType,
};

/// Apple Silicon optimized operations
pub struct AppleOptimizedOps {
    #[cfg(feature = "apple-acceleration")]
    metal_device: Option<Device>,
    #[cfg(feature = "apple-acceleration")]
    command_queue: Option<CommandQueue>,
    accelerate_available: bool,
}

impl AppleOptimizedOps {
    pub fn new() -> Result<Self> {
        #[cfg(feature = "apple-acceleration")]
        {
            let metal_device = Device::system_default();
            let command_queue = metal_device.as_ref().map(|device| device.new_command_queue());
            
            log::info!("Apple acceleration initialized: Metal={}, Accelerate=true", 
                      metal_device.is_some());
            
            Ok(Self {
                metal_device,
                command_queue,
                accelerate_available: true,
            })
        }
        #[cfg(not(feature = "apple-acceleration"))]
        {
            Ok(Self {
                accelerate_available: false,
            })
        }
    }

    #[cfg(feature = "apple-acceleration")]
    fn use_metal_for_large_matrices(&self, size: usize) -> bool {
        // Use Metal for matrices larger than 256x256
        self.metal_device.is_some() && size > 256 * 256
    }

    #[cfg(feature = "apple-acceleration")]
    fn metal_matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Result<Vec<f32>> {
        let device = self.metal_device.as_ref()
            .ok_or_else(|| NeuralError::OptimizationError("Metal device not available".to_string()))?;
        
        let command_queue = self.command_queue.as_ref()
            .ok_or_else(|| NeuralError::OptimizationError("Metal command queue not available".to_string()))?;

        // Create Metal buffers
        let a_buffer = device.new_buffer_with_data(
            a.as_ptr() as *const core::ffi::c_void,
            (a.len() * std::mem::size_of::<f32>()) as u64,
            MTLResourceOptions::StorageModeShared,
        );
        
        let b_buffer = device.new_buffer_with_data(
            b.as_ptr() as *const core::ffi::c_void,
            (b.len() * std::mem::size_of::<f32>()) as u64,
            MTLResourceOptions::StorageModeShared,
        );
        
        let result_size = m * n;
        let result_buffer = device.new_buffer(
            (result_size * std::mem::size_of::<f32>()) as u64,
            MTLResourceOptions::StorageModeShared,
        );

        // Metal compute shader for matrix multiplication
        let shader_source = format!(r#"
            #include <metal_stdlib>
            using namespace metal;
            
            kernel void matrix_multiply(
                device const float* a [[buffer(0)]],
                device const float* b [[buffer(1)]],
                device float* result [[buffer(2)]],
                constant uint& m [[buffer(3)]],
                constant uint& n [[buffer(4)]],
                constant uint& k [[buffer(5)]],
                uint2 gid [[thread_position_in_grid]]
            ) {{
                uint row = gid.y;
                uint col = gid.x;
                
                if (row >= m || col >= n) return;
                
                float sum = 0.0;
                for (uint i = 0; i < k; i++) {{
                    sum += a[row * k + i] * b[i * n + col];
                }}
                
                result[row * n + col] = sum;
            }}
        "#);

        let library = device.new_library_with_source(&shader_source, &CompileOptions::new())
            .map_err(|e| NeuralError::OptimizationError(format!("Metal shader compilation failed: {}", e)))?;
        
        let function = library.get_function("matrix_multiply", None)
            .map_err(|e| NeuralError::OptimizationError(format!("Metal function not found: {}", e)))?;
        
        let pipeline = device.new_compute_pipeline_state_with_function(&function)
            .map_err(|e| NeuralError::OptimizationError(format!("Metal pipeline creation failed: {}", e)))?;

        // Execute compute shader
        let command_buffer = command_queue.new_command_buffer();
        let encoder = command_buffer.new_compute_command_encoder();
        
        encoder.set_compute_pipeline_state(&pipeline);
        encoder.set_buffer(0, Some(&a_buffer), 0);
        encoder.set_buffer(1, Some(&b_buffer), 0);
        encoder.set_buffer(2, Some(&result_buffer), 0);
        
        let m_data = [m as u32];
        let n_data = [n as u32];
        let k_data = [k as u32];
        
        encoder.set_bytes(3, std::mem::size_of::<u32>() as u64, m_data.as_ptr() as *const core::ffi::c_void);
        encoder.set_bytes(4, std::mem::size_of::<u32>() as u64, n_data.as_ptr() as *const core::ffi::c_void);
        encoder.set_bytes(5, std::mem::size_of::<u32>() as u64, k_data.as_ptr() as *const core::ffi::c_void);
        
        let threads_per_group = MTLSize::new(16, 16, 1);
        let groups = MTLSize::new(
            (n + 15) / 16,
            (m + 15) / 16,
            1
        );
        
        encoder.dispatch_thread_groups(groups, threads_per_group);
        encoder.end_encoding();
        
        command_buffer.commit();
        command_buffer.wait_until_completed();

        // Extract results
        let result_ptr = result_buffer.contents() as *const f32;
        let result_slice = unsafe { std::slice::from_raw_parts(result_ptr, result_size) };
        
        Ok(result_slice.to_vec())
    }

    #[cfg(feature = "apple-acceleration")]
    fn accelerate_matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        let mut result = vec![0.0f32; m * n];
        
        unsafe {
            // Use Apple Accelerate Framework BLAS
            cblas_sgemm(
                CblasRowMajor,
                CblasNoTrans,
                CblasNoTrans,
                m as i32,
                n as i32,
                k as i32,
                1.0,
                a.as_ptr(),
                k as i32,
                b.as_ptr(),
                n as i32,
                0.0,
                result.as_mut_ptr(),
                n as i32,
            );
        }
        
        result
    }
}

impl OptimizedOps<f32> for AppleOptimizedOps {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        #[cfg(feature = "apple-acceleration")]
        {
            let total_ops = m * n * k;
            
            // Use Metal for very large matrices, Accelerate for medium, fallback for small
            if self.use_metal_for_large_matrices(total_ops) {
                match self.metal_matrix_multiply(a, b, m, n, k) {
                    Ok(result) => {
                        log::debug!("Used Metal GPU for {}x{}x{} matrix multiply", m, n, k);
                        return result;
                    }
                    Err(e) => {
                        log::warn!("Metal GPU failed, falling back to Accelerate: {}", e);
                    }
                }
            }
            
            if self.accelerate_available {
                log::debug!("Used Accelerate Framework for {}x{}x{} matrix multiply", m, n, k);
                return self.accelerate_matrix_multiply(a, b, m, n, k);
            }
        }
        
        // Fallback to parallel matrix multiplication
        log::debug!("Used parallel fallback for {}x{}x{} matrix multiply", m, n, k);
        super::simple_matrix::matrix_multiply_parallel(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        #[cfg(feature = "apple-acceleration")]
        {
            if self.accelerate_available && a.len() >= 1024 {
                let mut result = vec![0.0f32; a.len()];
                
                unsafe {
                    // Use Accelerate vDSP for vector addition
                    vDSP_vadd(
                        a.as_ptr(),
                        1,
                        b.as_ptr(),
                        1,
                        result.as_mut_ptr(),
                        1,
                        a.len() as u64,
                    );
                }
                
                return result;
            }
        }
        
        // NEON SIMD fallback
        use ultraviolet::Vec4;
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 4;
        
        for i in 0..chunks {
            let base = i * 4;
            let a_vec = Vec4::new(a[base], a[base+1], a[base+2], a[base+3]);
            let b_vec = Vec4::new(b[base], b[base+1], b[base+2], b[base+3]);
            let sum = a_vec + b_vec;
            result.extend_from_slice(&[sum.x, sum.y, sum.z, sum.w]);
        }
        
        for i in (chunks * 4)..a.len() {
            result.push(a[i] + b[i]);
        }
        
        result
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        #[cfg(feature = "apple-acceleration")]
        {
            if self.accelerate_available && a.len() >= 1024 {
                let mut result = vec![0.0f32; a.len()];
                
                unsafe {
                    vDSP_vmul(
                        a.as_ptr(),
                        1,
                        b.as_ptr(),
                        1,
                        result.as_mut_ptr(),
                        1,
                        a.len() as u64,
                    );
                }
                
                return result;
            }
        }
        
        // NEON SIMD fallback
        use ultraviolet::Vec4;
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 4;
        
        for i in 0..chunks {
            let base = i * 4;
            let a_vec = Vec4::new(a[base], a[base+1], a[base+2], a[base+3]);
            let b_vec = Vec4::new(b[base], b[base+1], b[base+2], b[base+3]);
            let product = a_vec * b_vec;
            result.extend_from_slice(&[product.x, product.y, product.z, product.w]);
        }
        
        for i in (chunks * 4)..a.len() {
            result.push(a[i] * b[i]);
        }
        
        result
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        #[cfg(feature = "apple-acceleration")]
        {
            if self.accelerate_available && values.len() >= 1024 {
                let mut result = 0.0f32;
                
                unsafe {
                    vDSP_sve(values.as_ptr(), 1, &mut result, values.len() as u64);
                }
                
                return result;
            }
        }
        
        // NEON SIMD fallback
        use ultraviolet::Vec4;
        
        let chunks = values.len() / 4;
        let mut sum = Vec4::zero();
        
        for i in 0..chunks {
            let base = i * 4;
            let chunk = Vec4::new(values[base], values[base+1], values[base+2], values[base+3]);
            sum = sum + chunk;
        }
        
        let mut total = sum.x + sum.y + sum.z + sum.w;
        
        for i in (chunks * 4)..values.len() {
            total += values[i];
        }
        
        total
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        #[cfg(feature = "apple-acceleration")]
        {
            if self.accelerate_available && values.len() >= 1024 {
                match activation {
                    ActivationType::Tanh => {
                        let mut result = vec![0.0f32; values.len()];
                        let input_count = values.len() as i32;
                        
                        unsafe {
                            vvtanhf(result.as_mut_ptr(), values.as_ptr(), &input_count);
                        }
                        
                        return result;
                    }
                    _ => {
                        // Fall through to NEON implementation
                    }
                }
            }
        }
        
        // NEON/scalar implementations
        match activation {
            ActivationType::ReLU => {
                values.iter().map(|&x| x.max(0.0)).collect()
            }
            ActivationType::Sigmoid => {
                values.iter().map(|&x| 1.0 / (1.0 + (-x).exp())).collect()
            }
            ActivationType::Tanh => {
                values.iter().map(|&x| x.tanh()).collect()
            }
            ActivationType::Gelu => {
                values.iter().map(|&x| {
                    0.5 * x * (1.0 + (0.7978845608 * (x + 0.044715 * x.powi(3))).tanh())
                }).collect()
            }
        }
    }
}