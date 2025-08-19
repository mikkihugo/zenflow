/*!
 * GPU Executor - Unified GPU interface abstracting Metal, CUDA, OpenCL
 * 
 * Provides a common interface for:
 * - Apple Metal (macOS/iOS)
 * - NVIDIA CUDA (Linux/Windows) 
 * - OpenCL (cross-platform)
 * - WebGPU (browsers/WASM)
 * - Vulkan compute (future)
 */

use super::{OptimizedOps, ActivationType, Result};
use crate::error::NeuralError;

/// GPU backend types
#[derive(Debug, Clone, PartialEq)]
pub enum GpuBackend {
    Metal,
    Cuda,
    OpenCL,
    WebGPU,
    Vulkan,
    None,
}

/// GPU device information
#[derive(Debug, Clone)]
pub struct GpuDeviceInfo {
    pub backend: GpuBackend,
    pub name: String,
    pub memory_mb: u64,
    pub compute_units: u32,
    pub max_threads_per_group: u32,
    pub supports_fp16: bool,
    pub supports_int8: bool,
}

/// Unified GPU executor
pub struct GpuExecutor {
    backend: GpuBackend,
    device_info: GpuDeviceInfo,
    #[cfg(feature = "apple-acceleration")]
    metal_device: Option<metal::Device>,
    #[cfg(feature = "cuda-support")]
    cuda_device: Option<std::sync::Arc<cudarc::driver::CudaDevice>>,
}

impl GpuExecutor {
    /// Create GPU executor with auto-detected backend
    pub fn new() -> Result<Self> {
        let (backend, device_info) = Self::detect_best_gpu()?;
        
        let mut executor = Self {
            backend: backend.clone(),
            device_info,
            #[cfg(feature = "apple-acceleration")]
            metal_device: None,
            #[cfg(feature = "cuda-support")]
            cuda_device: None,
        };
        
        executor.initialize_backend()?;
        
        Ok(executor)
    }

    /// Detect the best available GPU backend
    fn detect_best_gpu() -> Result<(GpuBackend, GpuDeviceInfo)> {
        // Priority order: Metal (on Apple), CUDA (on NVIDIA), OpenCL (fallback)
        
        #[cfg(all(target_os = "macos", feature = "apple-acceleration"))]
        {
            if let Ok(info) = Self::detect_metal() {
                return Ok((GpuBackend::Metal, info));
            }
        }
        
        #[cfg(feature = "cuda-support")]
        {
            if let Ok(info) = Self::detect_cuda() {
                return Ok((GpuBackend::Cuda, info));
            }
        }
        
        // TODO: Add OpenCL detection
        // TODO: Add WebGPU detection for WASM
        
        // No GPU available
        Ok((GpuBackend::None, GpuDeviceInfo {
            backend: GpuBackend::None,
            name: "CPU Fallback".to_string(),
            memory_mb: 0,
            compute_units: 0,
            max_threads_per_group: 1,
            supports_fp16: false,
            supports_int8: false,
        }))
    }

    #[cfg(all(target_os = "macos", feature = "apple-acceleration"))]
    fn detect_metal() -> Result<GpuDeviceInfo> {
        use metal::*;
        
        let device = Device::system_default()
            .ok_or_else(|| NeuralError::OptimizationError("No Metal device found".to_string()))?;
        
        let name = device.name().to_string();
        let memory_mb = device.max_buffer_length() / (1024 * 1024);
        
        // Apple Silicon specific detection
        let compute_units = if name.contains("Apple") {
            // Estimate based on GPU cores (varies by M1/M2/M3/M4)
            if name.contains("M4") { 40 }
            else if name.contains("M3") { 30 }
            else if name.contains("M2") { 20 }
            else if name.contains("M1") { 16 }
            else { 8 }
        } else {
            8 // Conservative estimate for other Metal devices
        };
        
        Ok(GpuDeviceInfo {
            backend: GpuBackend::Metal,
            name,
            memory_mb,
            compute_units,
            max_threads_per_group: 1024, // Metal limit
            supports_fp16: true, // Apple Silicon supports fp16
            supports_int8: true,
        })
    }

    #[cfg(feature = "cuda-support")]
    fn detect_cuda() -> Result<GpuDeviceInfo> {
        use cudarc::driver::CudaDevice;
        
        let device = CudaDevice::new(0)
            .map_err(|e| NeuralError::OptimizationError(format!("CUDA device creation failed: {}", e)))?;
        
        let props = device.device_properties()
            .map_err(|e| NeuralError::OptimizationError(format!("Failed to get CUDA properties: {}", e)))?;
        
        Ok(GpuDeviceInfo {
            backend: GpuBackend::Cuda,
            name: props.name.clone(),
            memory_mb: props.total_global_mem / (1024 * 1024),
            compute_units: props.multiprocessor_count as u32,
            max_threads_per_group: props.max_threads_per_block as u32,
            supports_fp16: props.major >= 6, // Pascal and newer
            supports_int8: props.major >= 6,
        })
    }

    /// Initialize the selected backend
    fn initialize_backend(&mut self) -> Result<()> {
        match self.backend {
            #[cfg(all(target_os = "macos", feature = "apple-acceleration"))]
            GpuBackend::Metal => {
                self.metal_device = metal::Device::system_default();
                log::info!("Metal GPU initialized: {}", self.device_info.name);
            }
            #[cfg(feature = "cuda-support")]
            GpuBackend::Cuda => {
                let device = cudarc::driver::CudaDevice::new(0)
                    .map_err(|e| NeuralError::OptimizationError(format!("CUDA initialization failed: {}", e)))?;
                self.cuda_device = Some(std::sync::Arc::new(device));
                log::info!("CUDA GPU initialized: {}", self.device_info.name);
            }
            GpuBackend::None => {
                log::info!("No GPU acceleration available, using CPU fallback");
            }
            _ => {
                return Err(NeuralError::OptimizationError(format!("Backend {:?} not implemented", self.backend)));
            }
        }
        
        Ok(())
    }

    /// Get device information
    pub fn device_info(&self) -> &GpuDeviceInfo {
        &self.device_info
    }

    /// Check if GPU is available and suitable for given operation size
    pub fn should_use_gpu(&self, operation_size: usize) -> bool {
        match self.backend {
            GpuBackend::None => false,
            GpuBackend::Metal => operation_size > 50_000, // Apple Metal threshold
            GpuBackend::Cuda => operation_size > 100_000, // NVIDIA CUDA threshold
            GpuBackend::OpenCL => operation_size > 75_000, // OpenCL threshold
            GpuBackend::WebGPU => operation_size > 25_000, // WebGPU threshold
            GpuBackend::Vulkan => operation_size > 100_000, // Vulkan threshold
        }
    }

    /// Execute matrix multiplication on GPU
    pub fn gpu_matrix_multiply(&self, _a: &[f32], _b: &[f32], _m: usize, _n: usize, _k: usize) -> Result<Vec<f32>> {
        match self.backend {
            #[cfg(all(target_os = "macos", feature = "apple-acceleration"))]
            GpuBackend::Metal => {
                self.metal_matrix_multiply(_a, _b, _m, _n, _k)
            }
            #[cfg(feature = "cuda-support")]
            GpuBackend::Cuda => {
                self.cuda_matrix_multiply(_a, _b, _m, _n, _k)
            }
            _ => {
                Err(NeuralError::OptimizationError("GPU backend not available for matrix multiply".to_string()))
            }
        }
    }

    #[cfg(all(target_os = "macos", feature = "apple-acceleration"))]
    fn metal_matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Result<Vec<f32>> {
        let device = self.metal_device.as_ref()
            .ok_or_else(|| NeuralError::OptimizationError("Metal device not initialized".to_string()))?;
        
        // Use Metal Performance Shaders (MPS) if available
        let command_queue = device.new_command_queue();
        
        // Create Metal buffers
        let a_buffer = device.new_buffer_with_data(
            a.as_ptr() as *const core::ffi::c_void,
            (a.len() * std::mem::size_of::<f32>()) as u64,
            metal::MTLResourceOptions::StorageModeShared,
        );
        
        let b_buffer = device.new_buffer_with_data(
            b.as_ptr() as *const core::ffi::c_void,
            (b.len() * std::mem::size_of::<f32>()) as u64,
            metal::MTLResourceOptions::StorageModeShared,
        );
        
        let result_size = m * n;
        let result_buffer = device.new_buffer(
            (result_size * std::mem::size_of::<f32>()) as u64,
            metal::MTLResourceOptions::StorageModeShared,
        );

        // Simple compute shader for matrix multiply
        let shader_source = r#"
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
            ) {
                uint row = gid.y;
                uint col = gid.x;
                
                if (row >= m || col >= n) return;
                
                float sum = 0.0;
                for (uint i = 0; i < k; i++) {
                    sum += a[row * k + i] * b[i * n + col];
                }
                
                result[row * n + col] = sum;
            }
        "#;

        let library = device.new_library_with_source(shader_source, &metal::CompileOptions::new())
            .map_err(|e| NeuralError::OptimizationError(format!("Metal shader compilation failed: {}", e)))?;
        
        let function = library.get_function("matrix_multiply", None)
            .map_err(|e| NeuralError::OptimizationError(format!("Metal function not found: {}", e)))?;
        
        let pipeline = device.new_compute_pipeline_state_with_function(&function)
            .map_err(|e| NeuralError::OptimizationError(format!("Metal pipeline creation failed: {}", e)))?;

        // Execute
        let command_buffer = command_queue.new_command_buffer();
        let encoder = command_buffer.new_compute_command_encoder();
        
        encoder.set_compute_pipeline_state(&pipeline);
        encoder.set_buffer(0, Some(&a_buffer), 0);
        encoder.set_buffer(1, Some(&b_buffer), 0);
        encoder.set_buffer(2, Some(&result_buffer), 0);
        
        // Set scalar parameters
        let m_data = [m as u32];
        let n_data = [n as u32];
        let k_data = [k as u32];
        
        encoder.set_bytes(3, std::mem::size_of::<u32>() as u64, m_data.as_ptr() as *const core::ffi::c_void);
        encoder.set_bytes(4, std::mem::size_of::<u32>() as u64, n_data.as_ptr() as *const core::ffi::c_void);
        encoder.set_bytes(5, std::mem::size_of::<u32>() as u64, k_data.as_ptr() as *const core::ffi::c_void);
        
        let threads_per_group = metal::MTLSize::new(16, 16, 1);
        let groups = metal::MTLSize::new(
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

    #[cfg(feature = "cuda-support")]
    fn cuda_matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Result<Vec<f32>> {
        let device = self.cuda_device.as_ref()
            .ok_or_else(|| NeuralError::OptimizationError("CUDA device not initialized".to_string()))?;

        // CUDA kernel (same as in cuda_acceleration.rs)
        let kernel_src = r#"
        extern "C" __global__ void matrix_multiply(
            const float* a, 
            const float* b, 
            float* c,
            int m, int n, int k
        ) {
            int row = blockIdx.y * blockDim.y + threadIdx.y;
            int col = blockIdx.x * blockDim.x + threadIdx.x;
            
            if (row < m && col < n) {
                float sum = 0.0f;
                for (int i = 0; i < k; i++) {
                    sum += a[row * k + i] * b[i * n + col];
                }
                c[row * n + col] = sum;
            }
        }
        "#;

        // Compile and execute (similar to cuda_acceleration.rs implementation)
        let ptx = device.compile_ptx_from_src(kernel_src)
            .map_err(|e| NeuralError::OptimizationError(format!("CUDA compilation failed: {}", e)))?;
        
        device.load_ptx(ptx, "matrix_multiply", &["matrix_multiply"])
            .map_err(|e| NeuralError::OptimizationError(format!("CUDA kernel loading failed: {}", e)))?;

        let a_gpu = device.htod_copy(a.to_vec())
            .map_err(|e| NeuralError::OptimizationError(format!("CUDA memory allocation failed: {}", e)))?;
        let b_gpu = device.htod_copy(b.to_vec())
            .map_err(|e| NeuralError::OptimizationError(format!("CUDA memory allocation failed: {}", e)))?;
        let mut c_gpu = device.alloc_zeros::<f32>(m * n)
            .map_err(|e| NeuralError::OptimizationError(format!("CUDA memory allocation failed: {}", e)))?;

        let block_size = 16;
        let config = cudarc::driver::LaunchConfig {
            grid_dim: (((n + block_size - 1) / block_size) as u32, ((m + block_size - 1) / block_size) as u32, 1),
            block_dim: (block_size as u32, block_size as u32, 1),
            shared_mem_bytes: 0,
        };

        unsafe {
            device.launch_async(
                "matrix_multiply",
                config,
                (&a_gpu, &b_gpu, &mut c_gpu, m as i32, n as i32, k as i32),
            ).map_err(|e| NeuralError::OptimizationError(format!("CUDA kernel launch failed: {}", e)))?;
        }

        let result = device.dtoh_sync_copy(&c_gpu)
            .map_err(|e| NeuralError::OptimizationError(format!("CUDA memory copy failed: {}", e)))?;

        Ok(result)
    }

    /// Get GPU utilization statistics
    pub fn get_gpu_stats(&self) -> Result<GpuStats> {
        match self.backend {
            GpuBackend::None => Ok(GpuStats::default()),
            _ => {
                // TODO: Implement GPU utilization monitoring
                Ok(GpuStats {
                    utilization_percent: 0.0,
                    memory_used_mb: 0,
                    memory_total_mb: self.device_info.memory_mb,
                    temperature_celsius: 0.0,
                })
            }
        }
    }
}

/// GPU utilization statistics
#[derive(Debug, Clone, Default)]
pub struct GpuStats {
    pub utilization_percent: f64,
    pub memory_used_mb: u64,
    pub memory_total_mb: u64,
    pub temperature_celsius: f64,
}

impl OptimizedOps<f32> for GpuExecutor {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        let operation_size = m * n * k;
        
        if self.should_use_gpu(operation_size) {
            match self.gpu_matrix_multiply(a, b, m, n, k) {
                Ok(result) => {
                    log::debug!("GPU matrix multiply successful: {}x{}x{} on {:?}", m, n, k, self.backend);
                    return result;
                }
                Err(e) => {
                    log::warn!("GPU matrix multiply failed, falling back to CPU: {e}");
                }
            }
        }
        
        // CPU fallback
        super::simple_matrix::matrix_multiply_parallel(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        // TODO: Implement GPU vector operations
        use rayon::prelude::*;
        a.par_iter().zip(b.par_iter()).map(|(&x, &y)| x + y).collect()
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        // TODO: Implement GPU vector operations  
        use rayon::prelude::*;
        a.par_iter().zip(b.par_iter()).map(|(&x, &y)| x * y).collect()
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        // TODO: Implement GPU reduction
        use rayon::prelude::*;
        values.par_iter().sum()
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        // TODO: Implement GPU activations
        use rayon::prelude::*;
        
        match activation {
            ActivationType::ReLU => {
                values.par_iter().map(|&x| x.max(0.0)).collect()
            }
            ActivationType::Sigmoid => {
                values.par_iter().map(|&x| 1.0 / (1.0 + (-x).exp())).collect()
            }
            ActivationType::Tanh => {
                values.par_iter().map(|&x| x.tanh()).collect()
            }
            ActivationType::Gelu => {
                values.par_iter().map(|&x| {
                    0.5 * x * (1.0 + (0.797_884_6 * (x + 0.044715 * x.powi(3))).tanh())
                }).collect()
            }
        }
    }
}