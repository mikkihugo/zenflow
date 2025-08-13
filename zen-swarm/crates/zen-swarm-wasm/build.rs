use std::env;

fn main() {
    // Get build configuration and validate
    let target_arch = env::var("CARGO_CFG_TARGET_ARCH").unwrap_or_default();
    let current_rustflags = env::var("RUSTFLAGS").unwrap_or_default();
    let package_version = env::var("CARGO_PKG_VERSION").unwrap_or_default();
    
    println!("cargo:warning=Building zen-swarm-wasm version: {}", package_version);
    println!("cargo:warning=Target architecture: {}", target_arch);
    
    // Enable SIMD target features for WebAssembly builds
    if target_arch == "wasm32" {
        println!("cargo:warning=WebAssembly target detected - configuring SIMD optimizations");
        
        // Don't override RUSTFLAGS if already set by user
        if current_rustflags.is_empty() {
            println!("cargo:rustc-env=RUSTFLAGS=-C target-feature=+simd128");
            println!("cargo:warning=Setting RUSTFLAGS for SIMD128 support");
        } else {
            println!("cargo:warning=RUSTFLAGS already set: {}", current_rustflags);
        }

        // Tell cargo to rerun if environment changes
        println!("cargo:rerun-if-env-changed=RUSTFLAGS");
        println!("cargo:rerun-if-env-changed=CARGO_CFG_TARGET_ARCH");

        // Feature detection and warnings
        if env::var("CARGO_FEATURE_SIMD").is_ok() {
            println!("cargo:warning=✅ SIMD feature enabled for WebAssembly build");

            // Set a config flag to help with detection
            println!("cargo:rustc-cfg=ruv_simd_enabled");
        } else {
            println!("cargo:warning=⚠️ SIMD feature not enabled - compile with --features simd for best performance");
        }

        // Check current RUSTFLAGS for SIMD and validate configuration
        let effective_rustflags = if current_rustflags.is_empty() {
            "-C target-feature=+simd128".to_string()
        } else {
            current_rustflags.clone()
        };
        
        if effective_rustflags.contains("simd128") {
            println!("cargo:warning=✅ SIMD128 target feature detected in RUSTFLAGS");
            println!("cargo:rustc-cfg=ruv_simd128_enabled");
        } else {
            println!("cargo:warning=⚠️ SIMD128 not found in RUSTFLAGS - set RUSTFLAGS=\"-C target-feature=+simd128\" for SIMD support");
        }
        
        // Log effective RUSTFLAGS for debugging
        println!("cargo:warning=Effective RUSTFLAGS: {}", effective_rustflags);

        // Output build information
        println!("cargo:warning=🚀 Building zen-swarm-wasm with enhanced SIMD detection");

        // Enable wasm-bindgen features for SIMD
        println!("cargo:rustc-env=WASM_BINDGEN_FEATURES=simd");
    }

    // For non-WASM targets, check for native SIMD support
    match target_arch.as_str() {
        "x86_64" | "x86" => {
            // Enable x86 SIMD features if available
            if env::var("CARGO_CFG_TARGET_FEATURE")
                .unwrap_or_default()
                .contains("sse")
            {
                println!("cargo:rustc-cfg=has_sse");
            }
            if env::var("CARGO_CFG_TARGET_FEATURE")
                .unwrap_or_default()
                .contains("avx")
            {
                println!("cargo:rustc-cfg=has_avx");
            }
        }
        "aarch64" => {
            // Enable ARM NEON if available
            if env::var("CARGO_CFG_TARGET_FEATURE")
                .unwrap_or_default()
                .contains("neon")
            {
                println!("cargo:rustc-cfg=has_neon");
            }
        }
        _ => {}
    }

    // Version information and build metadata
    println!("cargo:rustc-env=RUV_SWARM_WASM_VERSION={}", package_version);
    println!("cargo:rustc-env=BUILD_TARGET_ARCH={}", target_arch);
    
    // Final build validation
    println!("cargo:warning=zen-swarm-wasm build configuration complete for {} target", target_arch);
}
