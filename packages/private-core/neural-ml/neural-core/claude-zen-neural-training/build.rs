use std::env;
use std::process::Command;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-env-changed=CUDA_PATH");
    println!("cargo:rerun-if-env-changed=ROCM_PATH");
    
    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    let target_arch = env::var("CARGO_CFG_TARGET_ARCH").unwrap_or_default();
    
    eprintln!("FULL AUTO DETECTION: {} on {}", target_arch, target_os);
    
    auto_enable_all_features(&target_os, &target_arch);
}

fn auto_enable_all_features(target_os: &str, target_arch: &str) {
    let mut enabled_features = Vec::new();
    
    // ALWAYS ENABLE CORE FEATURES
    enable_feature("std");
    enabled_features.push("std");
    
    // PLATFORM-SPECIFIC AUTO-DETECTION
    match target_os {
        "macos" => {
            enable_feature("apple-acceleration");
            enabled_features.push("Apple Acceleration");
        }
        "linux" => {
            if check_cuda_available() {
                enable_feature("cuda-support");
                enabled_features.push("NVIDIA CUDA");
            }
        }
        "windows" => {
            if check_cuda_available() {
                enable_feature("cuda-support");
                enabled_features.push("NVIDIA CUDA");
            }
        }
        _ => {}
    }
    
    // ARCHITECTURE-SPECIFIC AUTO-DETECTION
    match target_arch {
        "x86_64" => {
            enable_feature("simd-acceleration");
            enabled_features.push("x86_64 SIMD");
        }
        "aarch64" => {
            enable_feature("simd-acceleration");
            enabled_features.push("ARM64 NEON");
        }
        "wasm32" => {
            enable_feature("wasm");
            enabled_features.push("WASM optimized");
            return;
        }
        _ => {}
    }
    
    // ENABLE ASYNC FOR NON-WASM
    if target_arch != "wasm32" {
        enable_feature("async");
        enabled_features.push("async runtime");
    }
    
    eprintln!("AUTO-ENABLED: {}", enabled_features.join(" | "));
}

fn enable_feature(feature: &str) {
    println!("cargo:rustc-cfg=feature=\"{}\"", feature);
}

fn check_cuda_available() -> bool {
    Command::new("nvidia-smi").output().map(|o| o.status.success()).unwrap_or(false) ||
    env::var("CUDA_PATH").is_ok() ||
    Path::new("/usr/local/cuda").exists()
}
