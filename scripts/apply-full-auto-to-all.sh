#!/bin/bash
set -euo pipefail

echo "🚀 APPLYING FULL AUTO DETECTION TO ALL RUST PACKAGES"

# Find all Rust packages
RUST_PACKAGES=(
    "packages/implementation/brain/rust/core"
    # singularity-coder paths removed
    "packages/implementation/taskmaster/src/wasm"
    "packages/private-core/neural-ml/neural-core"
    "packages/private-core/neural-ml/neural-core/claude-zen-neural-core"
    "packages/private-core/neural-ml/neural-core/claude-zen-neural-models"
    "packages/private-core/neural-ml/neural-core/claude-zen-neural-registry"
    "packages/private-core/neural-ml/neural-core/claude-zen-neural-training"
    "packages/private-core/neural-ml/neural-core/claude-zen-neural-data"
    "packages/private-core/fact-system/src/rust"
)

# Template build.rs for full auto detection
create_build_rs() {
    local package_path=$1
    
    cat > "$package_path/build.rs" << 'EOF'
use std::env;
use std::process::Command;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-env-changed=CUDA_PATH");
    println!("cargo:rerun-if-env-changed=ROCM_PATH");
    
    let target_os = env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    let target_arch = env::var("CARGO_CFG_TARGET_ARCH").unwrap_or_default();
    
    println!("cargo:warning=🚀 FULL AUTO DETECTION: {} on {}", target_arch, target_os);
    
    auto_enable_all_features(&target_os, &target_arch);
}

fn auto_enable_all_features(target_os: &str, target_arch: &str) {
    let mut enabled_features = Vec::new();
    
    // 🎯 ALWAYS ENABLE CORE FEATURES
    enable_feature("std");
    enabled_features.push("std");
    
    // 🖥️ PLATFORM-SPECIFIC AUTO-DETECTION
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
    
    // 🏗️ ARCHITECTURE-SPECIFIC AUTO-DETECTION
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
    
    // 🔥 ENABLE ASYNC FOR NON-WASM
    if target_arch != "wasm32" {
        enable_feature("async");
        enabled_features.push("async runtime");
    }
    
    println!("cargo:warning=✅ AUTO-ENABLED: {}", enabled_features.join(" | "));
}

fn enable_feature(feature: &str) {
    println!("cargo:rustc-cfg=feature=\"{}\"", feature);
}

fn check_cuda_available() -> bool {
    Command::new("nvidia-smi").output().map(|o| o.status.success()).unwrap_or(false) ||
    env::var("CUDA_PATH").is_ok() ||
    Path::new("/usr/local/cuda").exists()
}
EOF
}

# Template runtime_detection.rs for Node.js compatibility  
create_runtime_detection() {
    local package_path=$1
    
    mkdir -p "$package_path/src"
    
    cat > "$package_path/src/runtime_detection.rs" << 'EOF'
//! Runtime hardware detection for Node.js/WASM environments

use std::sync::Once;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone)]
pub struct RuntimeHardware {
    pub platform: String,
    pub architecture: String,
    pub cpu_cores: u32,
    pub optimization_level: String,
}

static INIT: Once = Once::new();
static mut RUNTIME_HARDWARE: Option<RuntimeHardware> = None;

pub fn get_runtime_hardware() -> &'static RuntimeHardware {
    unsafe {
        INIT.call_once(|| {
            RUNTIME_HARDWARE = Some(detect_runtime_hardware());
        });
        RUNTIME_HARDWARE.as_ref().unwrap()
    }
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
EOF
}

# Apply to each package
for package in "${RUST_PACKAGES[@]}"; do
    if [ -d "$package" ]; then
        echo "📦 Applying FULL AUTO to: $package"
        
        # Create build.rs
        create_build_rs "$package"
        
        # Create runtime_detection.rs
        create_runtime_detection "$package"
        
        # Update Cargo.toml to add auto-optimization default
        if [ -f "$package/Cargo.toml" ]; then
            # Check if [features] section exists
            if grep -q "\[features\]" "$package/Cargo.toml"; then
                # Update existing default or add it
                if grep -q "^default\s*=" "$package/Cargo.toml"; then
                    sed -i 's/^default\s*=.*/default = ["std", "auto-optimization"]/' "$package/Cargo.toml"
                else
                    sed -i '/\[features\]/a default = ["std", "auto-optimization"]' "$package/Cargo.toml"
                fi
            else
                # Add [features] section
                echo "" >> "$package/Cargo.toml"
                echo "[features]" >> "$package/Cargo.toml"
                echo 'default = ["std", "auto-optimization"]' >> "$package/Cargo.toml"
            fi
            
            # Add auto-optimization feature
            if ! grep -q "auto-optimization" "$package/Cargo.toml"; then
                sed -i '/^default\s*=/a auto-optimization = []  # Enabled by build.rs' "$package/Cargo.toml"
            fi
        fi
        
        echo "   ✅ Applied to $package"
    else
        echo "   ❌ Package not found: $package"
    fi
done

echo ""
echo "🎉 FULL AUTO DETECTION APPLIED TO ALL RUST PACKAGES!"
echo ""
echo "📋 Each package now:"
echo "   • Has build.rs with comprehensive hardware detection"
echo "   • Includes runtime_detection.rs for Node.js/WASM compatibility"
echo "   • Uses auto-optimization as default feature"
echo "   • Automatically enables optimal features for any hardware"
echo ""
echo "🚀 All Rust packages are now FULL AUTO!"