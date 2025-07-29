#!/bin/bash

echo "🧠 Claude Code Flow Neural Network Integration Demo"
echo "=================================================="
echo ""
echo "This demo shows how neural networks enhance the system's capabilities."
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if ruv-FANN is built (optional but recommended)
if [ -f "ruv-FANN/target/release/ruv-fann" ]; then
    echo "✅ Native ruv-FANN binary detected - using high-performance mode"
else
    echo "⚠️  Native ruv-FANN not built - using fallback mode"
    echo "   To enable native performance: cd ruv-FANN && cargo build --release"
fi
echo ""

# Run the basic neural test
echo "1️⃣  Running basic neural engine test..."
echo "----------------------------------------"
node test-neural-integration.js
if [ $? -ne 0 ]; then
    echo "❌ Basic neural test failed"
    exit 1
fi

echo ""
echo ""

# Run the architecture advisor demo
echo "2️⃣  Running architecture advisor demo..."
echo "---------------------------------------"
node examples/neural-architecture-advisor.js
if [ $? -ne 0 ]; then
    echo "❌ Architecture advisor demo failed"
    exit 1
fi

echo ""
echo "✅ All neural integration tests completed successfully!"
echo ""
echo "Next steps:"
echo "- Check out docs/NEURAL_INTEGRATION.md for detailed documentation"
echo "- Try integrating neural networks into your own queens"
echo "- Build native bindings for maximum performance: cd ruv-FANN && cargo build --release"