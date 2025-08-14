//! Kernel execution module

pub mod grid;
pub mod shared_memory;
pub mod thread;
pub mod warp;

#[cfg(feature = "webgpu-only")]
pub use crate::runtime::kernel::{
  launch_kernel, KernelFunction, LaunchConfig, ThreadContext,
};
#[cfg(feature = "webgpu-only")]
pub use crate::runtime::{Block, Dim3, Grid};
