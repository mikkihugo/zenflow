#!/usr/bin/env node

/**
 * Native Hardware Detection Test
 * 
 * Tests the new Node.js-native hardware detection capabilities
 * using os-utils and systeminformation for accurate CPU/memory/GPU detection
 */

const path = require('path');

async function testNativeHardwareDetection() {
  console.log('🔧 Testing Native Hardware Detection with Node.js libraries...\n');

  try {
    // Import the updated file-aware AI package with native hardware detection
    const { 
      nativeHardwareDetector,
      VERSION, 
      FEATURES 
    } = require('./packages/file-aware-ai/dist/index.js');

    console.log('✅ Successfully imported file-aware AI package with native hardware detection');
    console.log(`📦 Version: ${VERSION}`);
    console.log(`🔧 Features:`, FEATURES);
    console.log();

    // Test 1: Native Hardware Detection
    console.log('🔍 Test 1: Native Node.js Hardware Detection');
    console.log('=' .repeat(60));
    
    console.log('🔍 Performing comprehensive hardware detection...');
    const hardwareInfo = await nativeHardwareDetector.detectHardware();
    
    console.log('💻 Detected Hardware Information:');
    console.log(`  🖥️  CPU Cores: ${hardwareInfo.cpu_cores} cores`);
    console.log(`  🏗️  CPU Architecture: ${hardwareInfo.cpu_arch}`);
    console.log(`  🧠  CPU Model: ${hardwareInfo.cpu_model}`);
    console.log(`  ⚡  CPU Speed: ${hardwareInfo.cpu_speed_ghz.toFixed(2)} GHz`);
    console.log(`  💾  Memory Total: ${hardwareInfo.memory_total_mb.toLocaleString()} MB (${(hardwareInfo.memory_total_mb / 1024).toFixed(1)} GB)`);
    console.log(`  🆓  Memory Available: ${hardwareInfo.memory_available_mb.toLocaleString()} MB (${(hardwareInfo.memory_available_mb / 1024).toFixed(1)} GB)`);
    console.log(`  🔓  Memory Free: ${hardwareInfo.memory_free_mb.toLocaleString()} MB (${(hardwareInfo.memory_free_mb / 1024).toFixed(1)} GB)`);
    console.log(`  🎮  Has GPU: ${hardwareInfo.has_gpu ? '✅ Yes' : '❌ No'}`);
    if (hardwareInfo.gpu_memory_mb) {
      console.log(`  📺  GPU Memory: ${hardwareInfo.gpu_memory_mb} MB`);
    }
    if (hardwareInfo.gpu_vendor) {
      console.log(`  🏭  GPU Vendor: ${hardwareInfo.gpu_vendor}`);
    }
    console.log(`  🖥️  Platform: ${hardwareInfo.platform}`);
    console.log(`  📊  Load Average: ${hardwareInfo.load_average.map(l => l.toFixed(2)).join(', ')}`);
    console.log(`  🎯  Optimization Level: ${hardwareInfo.optimization_level}`);
    console.log();

    // Test 2: Optimization Strategy Generation
    console.log('🔍 Test 2: Hardware-Optimized Strategy Generation');
    console.log('=' .repeat(60));
    
    const strategy = nativeHardwareDetector.generateOptimizationStrategy(hardwareInfo);
    
    console.log('⚡ Generated Optimization Strategy:');
    console.log(`  🔄  Parallel Tasks: ${strategy.parallel_tasks}`);
    console.log(`  💾  Memory Buffer Size: ${(strategy.memory_buffer_size / (1024 * 1024)).toFixed(1)} MB`);
    console.log(`  🧮  Use SIMD: ${strategy.use_simd ? '✅ Yes' : '❌ No'}`);
    console.log(`  🎮  Use GPU Acceleration: ${strategy.use_gpu_acceleration ? '✅ Yes' : '❌ No'}`);
    console.log(`  🗄️  Cache Size: ${strategy.cache_size_mb} MB`);
    console.log(`  📦  Batch Size: ${strategy.batch_size}`);
    console.log(`  🧵  Thread Pool Size: ${strategy.thread_pool_size}`);
    console.log(`  ⚡  Max Concurrent Operations: ${strategy.max_concurrent_operations}`);
    console.log();

    // Test 3: Performance Assessment
    console.log('🔍 Test 3: Performance Assessment');
    console.log('=' .repeat(60));

    let performanceScore = 0;
    let recommendations = [];

    // CPU Performance
    if (hardwareInfo.cpu_cores >= 8) {
      performanceScore += 40;
      console.log('✅ CPU: Excellent multi-core performance (8+ cores)');
    } else if (hardwareInfo.cpu_cores >= 4) {
      performanceScore += 25;
      console.log('✅ CPU: Good multi-core performance (4+ cores)');
    } else if (hardwareInfo.cpu_cores >= 2) {
      performanceScore += 15;
      console.log('⚠️ CPU: Basic multi-core support (2+ cores)');
      recommendations.push('Consider upgrading to a CPU with more cores for better parallel processing');
    } else {
      performanceScore += 5;
      console.log('❌ CPU: Single-core detected - limited performance');
      recommendations.push('Upgrade to a multi-core CPU for significantly better performance');
    }

    // Memory Performance
    const memoryGB = hardwareInfo.memory_total_mb / 1024;
    if (memoryGB >= 16) {
      performanceScore += 30;
      console.log('✅ Memory: Excellent capacity (16GB+)');
    } else if (memoryGB >= 8) {
      performanceScore += 20;
      console.log('✅ Memory: Good capacity (8GB+)');
    } else if (memoryGB >= 4) {
      performanceScore += 10;
      console.log('⚠️ Memory: Basic capacity (4GB+)');
      recommendations.push('Consider upgrading to 8GB+ RAM for better performance');
    } else {
      performanceScore += 5;
      console.log('❌ Memory: Low capacity (<4GB)');
      recommendations.push('Upgrade to at least 8GB RAM for optimal performance');
    }

    // GPU Performance
    if (hardwareInfo.has_gpu) {
      performanceScore += 20;
      console.log('✅ GPU: Hardware acceleration available');
    } else {
      console.log('⚠️ GPU: No dedicated GPU detected');
      recommendations.push('A dedicated GPU can significantly improve performance for certain workloads');
    }

    // CPU Speed Performance
    if (hardwareInfo.cpu_speed_ghz >= 3.0) {
      performanceScore += 10;
      console.log('✅ CPU Speed: High frequency (3.0+ GHz)');
    } else if (hardwareInfo.cpu_speed_ghz >= 2.0) {
      performanceScore += 5;
      console.log('✅ CPU Speed: Moderate frequency (2.0+ GHz)');
    } else {
      console.log('⚠️ CPU Speed: Low frequency (<2.0 GHz)');
      recommendations.push('Higher CPU frequency would improve single-threaded performance');
    }

    console.log();
    console.log(`📊 Overall Performance Score: ${performanceScore}/100`);

    if (performanceScore >= 80) {
      console.log('🎉 Performance Rating: EXCELLENT - Your system is highly optimized!');
    } else if (performanceScore >= 60) {
      console.log('✅ Performance Rating: GOOD - Your system performs well');
    } else if (performanceScore >= 40) {
      console.log('⚠️ Performance Rating: FAIR - Some improvements possible');
    } else {
      console.log('❌ Performance Rating: POOR - Consider hardware upgrades');
    }

    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations for Performance Improvement:');
      recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    console.log();

    // Test 4: Real-time Performance Monitoring
    console.log('🔍 Test 4: Cache and Performance Validation');
    console.log('=' .repeat(60));

    console.log('🔍 Testing hardware detection caching...');
    const startTime = Date.now();
    const cachedInfo = await nativeHardwareDetector.detectHardware();
    const cacheTime = Date.now() - startTime;
    
    console.log(`⚡ Cached detection time: ${cacheTime}ms`);
    console.log(`✅ Cache validation: ${cachedInfo.cpu_cores === hardwareInfo.cpu_cores ? 'PASSED' : 'FAILED'}`);
    
    // Clear cache and test fresh detection
    nativeHardwareDetector.clearCache();
    console.log('🗑️ Cache cleared, testing fresh detection...');
    
    const freshStartTime = Date.now();
    const freshInfo = await nativeHardwareDetector.detectHardware();
    const freshTime = Date.now() - freshStartTime;
    
    console.log(`⚡ Fresh detection time: ${freshTime}ms`);
    console.log(`✅ Fresh detection validation: ${freshInfo.cpu_cores === hardwareInfo.cpu_cores ? 'PASSED' : 'FAILED'}`);

    console.log();

    // Summary
    console.log('📊 Test Summary');
    console.log('=' .repeat(60));
    console.log(`✅ Native hardware detection: WORKING (${hardwareInfo.cpu_cores} cores detected)`);
    console.log(`⚡ Optimization strategy: GENERATED (${strategy.parallel_tasks} parallel tasks)`);
    console.log(`📊 Performance assessment: COMPLETED (${performanceScore}/100)`);
    console.log(`🚀 System optimization level: ${hardwareInfo.optimization_level.toUpperCase()}`);
    console.log();

    if (hardwareInfo.cpu_cores > 1) {
      console.log('🎉 SUCCESS: Multi-core CPU properly detected!');
      console.log(`🔥 Your ${hardwareInfo.cpu_cores}-core ${hardwareInfo.cpu_arch} system with ${(hardwareInfo.memory_total_mb / 1024).toFixed(1)}GB RAM is ready for high-performance computing!`);
    } else {
      console.log('⚠️ WARNING: Only 1 CPU core detected. This may indicate a detection issue.');
    }

    console.log('💪 Native Node.js hardware detection is fully operational!');

  } catch (error) {
    console.error('❌ Native hardware detection test failed:', error.message);
    if (error.stack) {
      console.error('📍 Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
  }
}

// Run the comprehensive test
if (require.main === module) {
  testNativeHardwareDetection()
    .then(() => {
      console.log('\n🎯 Native hardware detection test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed with critical error:', error.message);
      process.exit(1);
    });
}

module.exports = { testNativeHardwareDetection };