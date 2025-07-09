#!/usr/bin/env python3
"""
Neural Link System Demo Runner
Demonstrates the complete neural-link to hive-mind integration
"""

import asyncio
import sys
import time
from pathlib import Path

# Add the implementation directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from neural_link_system import NeuralLinkSystem, NeuralLinkConfig
from neural_signal_processor import NeuralSignalProcessor
from hive_protocol import HiveProtocol
from neural_security import NeuralSecurityLayer


async def run_complete_demo():
    """Run a complete demonstration of the neural link system"""
    print("=" * 60)
    print("NEURAL LINK SYSTEM - HIVE MIND INTEGRATION DEMO")
    print("=" * 60)
    print()
    
    # Configuration
    config = NeuralLinkConfig(
        num_channels=32,
        sampling_rate=1000,
        buffer_size=1000,
        enable_feedback=True,
        max_session_duration=300  # 5 minutes for demo
    )
    
    # Create neural link system
    print("📡 Creating Neural Link System...")
    neural_link = NeuralLinkSystem(
        user_id="demo_user_hive_001",
        config=config
    )
    
    # Initialize system
    print("🔧 Initializing system components...")
    init_success = await neural_link.initialize()
    
    if not init_success:
        print("❌ System initialization failed!")
        return
    
    print("✅ System initialized successfully!")
    print()
    
    # Perform calibration
    print("🧠 Starting neural calibration...")
    calibration_tasks = [
        {'name': 'focus_attention', 'duration': 3.0},
        {'name': 'imagine_left_movement', 'duration': 3.0},
        {'name': 'imagine_right_movement', 'duration': 3.0},
        {'name': 'relax_state', 'duration': 3.0},
        {'name': 'visual_imagination', 'duration': 3.0}
    ]
    
    for i, task in enumerate(calibration_tasks, 1):
        print(f"  [{i}/{len(calibration_tasks)}] Calibrating: {task['name']}...")
        # In real scenario, user would perform the mental task here
        await asyncio.sleep(1)  # Simulate calibration time
    
    calibration_success = await neural_link.calibrate(calibration_tasks)
    
    if not calibration_success:
        print("❌ Calibration failed!")
        return
    
    print("✅ Calibration completed successfully!")
    print()
    
    # Start neural link session
    print("🚀 Starting Neural Link Session...")
    await neural_link.start_session()
    
    # Register feedback handler
    feedback_count = 0
    async def demo_feedback_handler(feedback):
        nonlocal feedback_count
        feedback_count += 1
        print(f"  💫 Feedback #{feedback_count}: {feedback['type']} @ intensity {feedback['intensity']:.2f}")
    
    neural_link.register_feedback_handler(demo_feedback_handler)
    
    print("✅ Session started - Neural link active!")
    print()
    
    # Simulate neural activity
    print("🧠 Simulating neural activity and hive integration...")
    print("  (In a real system, this would be actual brain signals)")
    print()
    
    # Run for demo duration
    demo_duration = 20  # seconds
    start_time = time.time()
    
    while time.time() - start_time < demo_duration:
        # Simulate sending thoughts to hive
        if int(time.time()) % 5 == 0:  # Every 5 seconds
            thought_patterns = ['focus_attention', 'imagine_movement', 'visual_imagination']
            pattern = thought_patterns[int(time.time()) % len(thought_patterns)]
            
            print(f"  🎯 Sending thought pattern: {pattern}")
            await neural_link.send_thought(pattern)
        
        # Get and display system status
        if int(time.time()) % 10 == 0:  # Every 10 seconds
            status = neural_link.get_system_status()
            print(f"\n📊 System Status Update:")
            print(f"  • Session Duration: {status['session_duration']:.1f}s")
            print(f"  • Patterns Recognized: {status['metrics']['patterns_recognized']}")
            print(f"  • Commands Sent: {status['metrics']['commands_sent']}")
            print(f"  • Cognitive State:")
            print(f"    - Attention: {status['cognitive_state']['attention_level']:.2f}")
            print(f"    - Fatigue: {status['cognitive_state']['fatigue_level']:.2f}")
            print()
        
        await asyncio.sleep(1)
    
    # End session
    print("🏁 Ending neural link session...")
    await neural_link.end_session()
    
    # Final statistics
    print()
    print("=" * 60)
    print("SESSION COMPLETE - FINAL STATISTICS")
    print("=" * 60)
    
    final_status = neural_link.get_system_status()
    print(f"📈 Session Metrics:")
    print(f"  • Total Duration: {final_status['metrics']['uptime']:.1f} seconds")
    print(f"  • Patterns Recognized: {final_status['metrics']['patterns_recognized']}")
    print(f"  • Commands Sent to Hive: {final_status['metrics']['commands_sent']}")
    print(f"  • Commands Received: {final_status['metrics']['commands_received']}")
    print(f"  • Consensus Participations: {final_status['metrics']['consensus_participations']}")
    print(f"  • Error Count: {final_status['metrics']['error_count']}")
    print(f"  • Safety Violations: {final_status['safety_violations']}")
    
    # Security report
    security_report = neural_link.security_layer.get_privacy_report()
    print()
    print(f"🔒 Security & Privacy Report:")
    print(f"  • Encryption Strength: {security_report['encryption_strength']}-bit")
    print(f"  • Differential Privacy ε: {security_report['differential_privacy_epsilon']}")
    print(f"  • Audit Events: {security_report['audit_events_count']}")
    print(f"  • Anonymization: {'Enabled' if security_report['anonymization_enabled'] else 'Disabled'}")
    
    print()
    print("✅ Demo completed successfully!")
    print("🧠 Neural Link System is ready for human-hive integration research!")


async def test_individual_components():
    """Test individual components separately"""
    print("\n" + "=" * 60)
    print("TESTING INDIVIDUAL COMPONENTS")
    print("=" * 60)
    
    # Test Signal Processor
    print("\n1️⃣ Testing Neural Signal Processor...")
    processor = NeuralSignalProcessor(num_channels=16, sampling_rate=500)
    processor.start_real_time_processing()
    
    # Generate test signal
    test_signal = np.random.randn(16, 500) * 10
    processor.train_pattern(test_signal, 'test_pattern')
    
    print("   ✅ Signal processor operational")
    processor.stop_real_time_processing()
    
    # Test Hive Protocol
    print("\n2️⃣ Testing Hive Communication Protocol...")
    protocol = HiveProtocol(node_id="test_node")
    
    # Test message creation
    await protocol.send_neural_data(
        {'test_feature': 0.5},
        'test_pattern'
    )
    
    print("   ✅ Hive protocol functional")
    
    # Test Security Layer
    print("\n3️⃣ Testing Neural Security Layer...")
    security = NeuralSecurityLayer("test_user")
    await security.initialize()
    
    # Test encryption
    test_data = {'pattern': 'test', 'value': 42}
    encrypted = security.encrypt_neural_data(test_data)
    decrypted = security.decrypt_neural_data(encrypted)
    
    assert decrypted['pattern'] == test_data['pattern']
    print("   ✅ Security layer operational")
    
    print("\n✅ All components tested successfully!")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Neural Link System Demo')
    parser.add_argument(
        '--test-components',
        action='store_true',
        help='Test individual components instead of full demo'
    )
    
    args = parser.parse_args()
    
    try:
        if args.test_components:
            asyncio.run(test_individual_components())
        else:
            asyncio.run(run_complete_demo())
    except KeyboardInterrupt:
        print("\n\n⚠️  Demo interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Import numpy for the test
    import numpy as np
    
    main()