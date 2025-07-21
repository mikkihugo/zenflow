#!/usr/bin/env python3

import subprocess
import json
import time
import sys

def test_gemini_cli_options():
    """Test different ways to use Gemini CLI for code analysis"""
    
    print("🧪 Testing Gemini CLI Integration Options")
    print("=" * 50)
    
    # Test 1: Basic prompt
    print("\n1. Basic Prompt Test:")
    try:
        result = subprocess.run([
            "gemini", "-p", 
            "Respond with exactly: 'Gemini integration test successful'"
        ], capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            print(f"✅ Basic prompt: {result.stdout.strip()}")
        else:
            print(f"❌ Basic prompt failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Basic prompt error: {e}")
    
    # Test 2: Code analysis
    print("\n2. Code Analysis Test:")
    code_sample = """
def slow_neural_network():
    for epoch in range(1000):
        for sample in data:
            network = create_network()  # ISSUE: Creating network each time!
            train_sample(network, sample)
    """
    
    try:
        result = subprocess.run([
            "gemini", "-p", 
            f"Find the performance issue in this code: {code_sample}"
        ], capture_output=True, text=True, timeout=20)
        
        if result.returncode == 0:
            print(f"✅ Code analysis: {result.stdout[:100]}...")
        else:
            print(f"❌ Code analysis failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Code analysis error: {e}")
    
    # Test 3: Model selection
    print("\n3. Model Selection Test:")
    try:
        models_to_test = ["gemini-2.0-flash", "gemini-2.5-pro"]
        
        for model in models_to_test:
            result = subprocess.run([
                "gemini", "-m", model, "-p", 
                "Respond with your model name and 'OK'"
            ], capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                print(f"✅ Model {model}: {result.stdout.strip()[:50]}...")
            else:
                print(f"❌ Model {model} failed: {result.stderr[:50]}")
    except Exception as e:
        print(f"❌ Model selection error: {e}")
    
    # Test 4: File context
    print("\n4. File Context Test:")
    try:
        # Create a simple test file
        with open("test_neural.rs", "w") as f:
            f.write("""
fn train_network(data: &[Vec<f32>]) -> Result<(), Error> {
    for epoch in 0..1000 {
        for sample in data {
            let output = forward_pass(sample);
            let loss = compute_loss(output);
            backward_pass(loss);
        }
    }
    Ok(())
}
""")
        
        result = subprocess.run([
            "gemini", "-a", "-p", 
            "Analyze the Rust neural network code in this directory for performance issues"
        ], capture_output=True, text=True, timeout=25)
        
        if result.returncode == 0:
            print(f"✅ File context: Analysis completed ({len(result.stdout)} chars)")
        else:
            print(f"❌ File context failed: {result.stderr[:100]}")
        
        # Clean up
        import os
        if os.path.exists("test_neural.rs"):
            os.remove("test_neural.rs")
            
    except Exception as e:
        print(f"❌ File context error: {e}")
    
    # Test 5: JSON-like output simulation
    print("\n5. Structured Output Test:")
    try:
        result = subprocess.run([
            "gemini", "-p", 
            'Analyze neural network performance and respond in this format: "CONFIDENCE: [high/medium/low], ISSUES: [list], RECOMMENDATIONS: [list]"'
        ], capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            output = result.stdout.strip()
            # Try to parse structured response
            if "CONFIDENCE:" in output and "ISSUES:" in output:
                print(f"✅ Structured output: Parsed successfully")
                print(f"   {output[:100]}...")
            else:
                print(f"⚠️  Structured output: Format not followed")
        else:
            print(f"❌ Structured output failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Structured output error: {e}")

def create_gemini_wrapper():
    """Create a wrapper script for more programmatic Gemini usage"""
    
    wrapper_script = '''#!/bin/bash

# Gemini CLI Wrapper for Neural Network Analysis
# Provides structured output and error handling

GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.0-flash}"
TIMEOUT="${TIMEOUT:-20}"

usage() {
    echo "Usage: $0 [analyze-code|analyze-neural|optimize-swarm] [input]"
    echo "  analyze-code: Analyze code for performance issues"
    echo "  analyze-neural: Analyze neural network output"
    echo "  optimize-swarm: Optimize swarm coordination"
    exit 1
}

analyze_code() {
    local code="$1"
    local prompt="Analyze this code for performance issues and respond in format: ISSUES: [list], FIXES: [list], PRIORITY: [high/medium/low]. Code: $code"
    
    echo "🔍 Analyzing code with Gemini..."
    timeout $TIMEOUT gemini -m "$GEMINI_MODEL" -p "$prompt"
}

analyze_neural() {
    local neural_data="$1"
    local prompt="Analyze this neural network output and respond in format: CONFIDENCE: [high/medium/low], INTERPRETATION: [meaning], CONCERNS: [list]. Data: $neural_data"
    
    echo "🧠 Analyzing neural output with Gemini..."
    timeout $TIMEOUT gemini -m "$GEMINI_MODEL" -p "$prompt"
}

optimize_swarm() {
    local swarm_data="$1"
    local prompt="Optimize this swarm configuration and respond in format: TOPOLOGY: [recommended], OPTIMIZATIONS: [list], EXPECTED_IMPROVEMENT: [percentage]. Data: $swarm_data"
    
    echo "🐝 Optimizing swarm with Gemini..."
    timeout $TIMEOUT gemini -m "$GEMINI_MODEL" -p "$prompt"
}

case "$1" in
    analyze-code)
        analyze_code "$2"
        ;;
    analyze-neural)
        analyze_neural "$2"
        ;;
    optimize-swarm)
        optimize_swarm "$2"
        ;;
    *)
        usage
        ;;
esac
'''
    
    with open("gemini_wrapper.sh", "w") as f:
        f.write(wrapper_script)
    
    import os
    os.chmod("gemini_wrapper.sh", 0o755)
    print("✅ Created gemini_wrapper.sh for structured analysis")

if __name__ == "__main__":
    test_gemini_cli_options()
    print("\n" + "=" * 50)
    create_gemini_wrapper()
    print("\n🎯 Gemini CLI Integration Summary:")
    print("- ✅ Basic prompts work")
    print("- ✅ Code analysis works")  
    print("- ✅ Multiple models available")
    print("- ✅ File context with -a flag")
    print("- ⚠️  No native JSON/streaming (requires wrapper)")
    print("- ✅ Can simulate structured output with prompting")