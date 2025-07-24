#!/bin/bash

# AI Enhancement Integration Test Suite
# Tests the MultiModelEnhancer capabilities for neural network and swarm coordination

echo "🤖 AI Enhancement Integration Test Suite"
echo "========================================"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo ""
    echo "🔍 Testing: $test_name"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo "✅ PASSED: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "❌ FAILED: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Test 1: AI Tool Availability
test_ai_availability() {
    echo "📋 Checking aichat availability..."
    aichat --version >/dev/null 2>&1
}

# Test 2: Neural Network Output Analysis
test_neural_analysis() {
    echo "📋 Testing neural network output analysis..."
    
    local neural_prompt="Analyze this neural network output for XOR classification:

Output: [0.85, 0.12, 0.03] (probabilities for classes: XOR_result, noise1, noise2)
Input: [1.0, 0.0] (represents 1 XOR 0)
Expected: XOR result should be 1 (high confidence in first class)

Assessment:
1. Is the confidence level appropriate?
2. Does this match expected XOR behavior?
3. Any concerns with this output?

Respond in 2-3 sentences."
    
    local response
    response=$(aichat -m "gemini:gemini-2.0-flash" "$neural_prompt" 2>&1)
    local exit_code=$?
    
    if [[ $exit_code -eq 0 && ${#response} -gt 50 ]]; then
        echo "🧠 Neural Analysis Response:"
        echo "$response" | head -3
        return 0
    else
        echo "❌ Neural analysis failed: $response"
        return 1
    fi
}

# Test 3: Swarm Coordination Strategy
test_swarm_optimization() {
    echo "📋 Testing swarm coordination optimization..."
    
    local swarm_prompt="Optimize this swarm scenario:

Current State:
- 100 agents in mesh topology
- Task: Distributed machine learning training
- Performance: 65% efficiency
- Bottleneck: Network communication overhead (30% of time)
- Memory usage: 85% (near capacity)

Recommend the top 2 optimizations to improve performance.
Be specific and actionable."
    
    local response
    response=$(aichat -m "gemini:gemini-2.0-flash" "$swarm_prompt" 2>&1)
    local exit_code=$?
    
    if [[ $exit_code -eq 0 && ${#response} -gt 50 ]]; then
        echo "🐝 Swarm Optimization Response:"
        echo "$response" | head -4
        return 0
    else
        echo "❌ Swarm optimization failed: $response"
        return 1
    fi
}

# Test 4: Code Performance Analysis
test_code_analysis() {
    echo "📋 Testing code performance analysis..."
    
    local code_prompt="Analyze this neural network training code for performance issues:

\`\`\`python
def train_neural_network(data):
    for epoch in range(1000):
        for sample in data:
            # Create new network each iteration (ISSUE!)
            network = create_network()
            loss = compute_loss(network, sample)
            update_weights(network, loss)
            save_network(network, f'/tmp/network_{epoch}_{sample}.pkl')
\`\`\`

Identify the main performance problem and suggest 1 specific fix."
    
    local response
    response=$(aichat -m "gemini:gemini-2.0-flash" "$code_prompt" 2>&1)
    local exit_code=$?
    
    if [[ $exit_code -eq 0 && ${#response} -gt 30 ]]; then
        echo "💻 Code Analysis Response:"
        echo "$response" | head -3
        return 0
    else
        echo "❌ Code analysis failed: $response"
        return 1
    fi
}

# Test 5: Multi-Model Comparison
test_multi_model() {
    echo "📋 Testing multi-model comparison..."
    
    local comparison_prompt="Compare neural network architectures for image classification:

Option A: Simple CNN (3 conv layers, 2 dense)
Option B: ResNet-18 (residual connections)
Option C: Vision Transformer (attention-based)

For 10,000 training images, which would you recommend? One sentence explanation."
    
    # Test with two different models
    local gemini_response
    local gemini_lite_response
    
    gemini_response=$(aichat -m "gemini:gemini-2.0-flash" "$comparison_prompt" 2>/dev/null)
    gemini_lite_response=$(aichat -m "gemini:gemini-2.0-flash-lite" "$comparison_prompt" 2>/dev/null)
    
    if [[ ${#gemini_response} -gt 20 || ${#gemini_lite_response} -gt 20 ]]; then
        echo "🔄 Multi-Model Comparison Results:"
        if [[ ${#gemini_response} -gt 20 ]]; then
            echo "  Gemini Flash: $(echo "$gemini_response" | head -1 | cut -c1-80)..."
        fi
        if [[ ${#gemini_lite_response} -gt 20 ]]; then
            echo "  Gemini Lite:  $(echo "$gemini_lite_response" | head -1 | cut -c1-80)..."
        fi
        return 0
    else
        echo "❌ Multi-model comparison failed"
        return 1
    fi
}

# Test 6: Debugging Assistance
test_debugging() {
    echo "📋 Testing debugging assistance..."
    
    local debug_prompt="Debug this neural network issue:

Problem: Training loss suddenly jumps from 0.45 to NaN at epoch 67
Error: 'RuntimeError: Loss became NaN during training'
Code: Using Adam optimizer with learning_rate=0.01

What's the most likely cause and quick fix?"
    
    local response
    response=$(aichat -m "gemini:gemini-2.0-flash" "$debug_prompt" 2>&1)
    local exit_code=$?
    
    if [[ $exit_code -eq 0 && ${#response} -gt 30 ]]; then
        echo "🐛 Debug Analysis Response:"
        echo "$response" | head -3
        return 0
    else
        echo "❌ Debugging assistance failed: $response"
        return 1
    fi
}

# Run all tests
echo "🚀 Starting AI Enhancement Tests..."

run_test "AI Tool Availability" "test_ai_availability"
run_test "Neural Network Analysis" "test_neural_analysis"
run_test "Swarm Optimization" "test_swarm_optimization"
run_test "Code Performance Analysis" "test_code_analysis"
run_test "Multi-Model Comparison" "test_multi_model"
run_test "Debugging Assistance" "test_debugging"

# Results Summary
echo ""
echo "🎯 Test Results Summary"
echo "======================="
echo "Total Tests:  $TOTAL_TESTS"
echo "Passed:       $PASSED_TESTS"
echo "Failed:       $FAILED_TESTS"

if [[ $PASSED_TESTS -eq $TOTAL_TESTS ]]; then
    echo "🎉 All AI enhancement tests PASSED!"
    echo ""
    echo "✅ AI Enhancement Integration Status: OPERATIONAL"
    echo "✅ Neural Network Analysis: Ready"
    echo "✅ Swarm Coordination: Ready" 
    echo "✅ Multi-Model Support: Ready"
    echo "✅ Performance Analysis: Ready"
    echo "✅ Debugging Assistance: Ready"
    echo ""
    echo "🚀 The AI enhancement system is fully functional and ready to enhance"
    echo "   neural network decisions and swarm coordination in the Singularity Engine!"
    
    exit 0
else
    echo "⚠️  Some AI enhancement tests failed"
    echo "Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
    
    if [[ $PASSED_TESTS -gt 0 ]]; then
        echo "✅ Partial AI enhancement capabilities available"
    else
        echo "❌ AI enhancement not available"
    fi
    
    exit 1
fi