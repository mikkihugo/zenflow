#!/usr/bin/env python3
"""Simple demonstration that the code is real and works"""

import numpy as np
print("NumPy imported successfully:", np.__version__)

# Import our actual neural signal processor
try:
    from neural_signal_processor import NeuralSignalProcessor
    print("✅ Neural Signal Processor imported successfully!")
    
    # Create instance
    processor = NeuralSignalProcessor(num_channels=16, sampling_rate=500)
    print(f"✅ Created processor: {processor.num_channels} channels @ {processor.sampling_rate}Hz")
    
    # Generate test signal
    test_signal = np.random.randn(16, 500) * 10
    print(f"✅ Generated test signal: shape={test_signal.shape}")
    
    # Process it
    preprocessed = processor.preprocess_signal(test_signal)
    print(f"✅ Preprocessed signal successfully")
    
    # Extract features
    features = processor.extract_features(preprocessed)
    print(f"✅ Extracted {len(features)} feature types:")
    for i, key in enumerate(list(features.keys())[:5]):
        print(f"   • {key}")
    
    print("\n🎉 NEURAL SIGNAL PROCESSOR IS WORKING!")
    
except Exception as e:
    print(f"Error: {e}")

# Show file stats
import os
import glob

print("\n📁 Project Files:")
py_files = glob.glob("*.py")
for f in sorted(py_files):
    size = os.path.getsize(f)
    with open(f) as file:
        lines = len(file.readlines())
    print(f"  • {f}: {lines} lines, {size:,} bytes")

print(f"\n✅ Total: {len(py_files)} Python files")
print("📍 Location:", os.getcwd())