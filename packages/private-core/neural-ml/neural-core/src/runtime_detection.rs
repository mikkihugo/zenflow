//! Runtime hardware detection for Node.js/WASM environments

use std::sync::OnceLock;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Platform {
    Linux,
    Windows,
    MacOS,
    Browser,
    NodeJS,
    Unknown,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Architecture {
    X86_64,
    Aarch64,
    Wasm32,
    Unknown,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OptimizationLevel {
    Basic,
    Enhanced,
    Maximum,
    WebOptimized,
}

#[derive(Debug, Clone)]
pub struct RuntimeHardware {
    pub platform: String,
    pub architecture: String,
    pub cpu_cores: u32,
    pub optimization_level: String,
}

static RUNTIME_HARDWARE: OnceLock<RuntimeHardware> = OnceLock::new();

pub fn get_runtime_hardware() -> &'static RuntimeHardware {
    RUNTIME_HARDWARE.get_or_init(detect_runtime_hardware)
}

fn detect_runtime_hardware() -> RuntimeHardware {
    #[cfg(target_arch = "wasm32")]
    {
        RuntimeHardware {
            platform: "WASM/Node.js".to_string(),
            architecture: "wasm32".to_string(),
            cpu_cores: 1,
            optimization_level: "web-optimized".to_string(),
        }
    }
    #[cfg(not(target_arch = "wasm32"))]
    {
        RuntimeHardware {
            platform: std::env::consts::OS.to_string(),
            architecture: std::env::consts::ARCH.to_string(),
            cpu_cores: std::thread::available_parallelism()
                .map(|n| n.get() as u32)
                .unwrap_or(1),
            optimization_level: "native-optimized".to_string(),
        }
    }
}

/// Get optimal features based on runtime hardware detection
pub fn get_optimal_features() -> Vec<String> {
    let hardware = get_runtime_hardware();
    let mut features = vec!["std".to_string()];
    
    match hardware.architecture.as_str() {
        "x86_64" => {
            features.push("simd-acceleration".to_string());
            features.push("enhanced-parallelism".to_string());
        }
        "aarch64" => {
            features.push("simd-acceleration".to_string());
            features.push("apple-acceleration".to_string());
        }
        "wasm32" => {
            features.push("wasm".to_string());
            return features;
        }
        _ => {}
    }
    
    // Add async for non-WASM targets
    if hardware.architecture != "wasm32" {
        features.push("async".to_string());
    }
    
    // Add ML optimization if sufficient cores
    if hardware.cpu_cores >= 4 {
        features.push("ml-optimization".to_string());
    }
    
    features
}
