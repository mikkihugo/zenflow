#!/usr/bin/env python3
"""
Integration Test Suite - Complete system validation
Tests the full neural link to hive mind integration
"""

import asyncio
import sys
import time
import numpy as np
from pathlib import Path
import unittest
from typing import Dict, List

# Add implementation directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "implementation"))

from neural_link_system import NeuralLinkSystem, NeuralLinkConfig
from neural_signal_processor import NeuralSignalProcessor
from hive_protocol import HiveProtocol, MessageType, HiveMessage
from neural_security import NeuralSecurityLayer
from performance_optimizer import NeuralStreamOptimizer


class MockHiveServer:
    """Mock hive server for testing"""
    
    def __init__(self, port: int = 9999):
        self.port = port
        self.connected_nodes = {}
        self.messages_received = []
        self.server = None
        
    async def start(self):
        """Start mock server"""
        self.server = await asyncio.start_server(
            self.handle_client, 'localhost', self.port
        )
        
    async def handle_client(self, reader: asyncio.StreamReader, 
                          writer: asyncio.StreamWriter):
        """Handle client connections"""
        client_addr = writer.get_extra_info('peername')
        print(f"Mock hive: Client connected from {client_addr}")
        
        try:
            while True:
                # Read message length
                length_data = await reader.readexactly(4)
                message_length = struct.unpack('!I', length_data)[0]
                
                # Read message
                message_data = await reader.readexactly(message_length)
                
                # Store message
                self.messages_received.append(message_data)
                
                # Send mock response
                response = HiveMessage(
                    message_id="mock_response",
                    timestamp=time.time(),
                    source_id="hive_master",
                    message_type=MessageType.FEEDBACK,
                    payload={'type': 'haptic', 'intensity': 0.3}
                )
                
                response_data = response.to_bytes()
                writer.write(struct.pack('!I', len(response_data)))
                writer.write(response_data)
                await writer.drain()
                
        except asyncio.IncompleteReadError:
            pass
            
    async def stop(self):
        """Stop mock server"""
        if self.server:
            self.server.close()
            await self.server.wait_closed()


class TestNeuralLinkIntegration(unittest.TestCase):
    """Integration tests for neural link system"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.mock_server = MockHiveServer()
        cls.server_task = asyncio.create_task(cls.mock_server.start())
        
    def setUp(self):
        """Set up each test"""
        self.config = NeuralLinkConfig(
            num_channels=16,
            sampling_rate=500,
            hive_port=9999,
            max_session_duration=60
        )
        
    async def test_full_system_integration(self):
        """Test complete system integration"""
        print("\n🧪 Testing Full System Integration...")
        
        # Create system
        system = NeuralLinkSystem("test_user_001", self.config)
        
        # Initialize
        success = await system.initialize()
        self.assertTrue(success, "System initialization failed")
        
        # Calibrate
        calibration_tasks = [
            {'name': 'test_pattern_1', 'duration': 0.5},
            {'name': 'test_pattern_2', 'duration': 0.5}
        ]
        
        success = await system.calibrate(calibration_tasks)
        self.assertTrue(success, "Calibration failed")
        
        # Start session
        success = await system.start_session()
        self.assertTrue(success, "Session start failed")
        
        # Run for a bit
        await asyncio.sleep(2)
        
        # Check metrics
        status = system.get_system_status()
        self.assertGreater(status['metrics']['patterns_recognized'], 0)
        
        # End session
        await system.end_session()
        
        print("✅ Full system integration test passed!")
        
    async def test_signal_processing_pipeline(self):
        """Test signal processing pipeline"""
        print("\n🧪 Testing Signal Processing Pipeline...")
        
        processor = NeuralSignalProcessor(num_channels=8, sampling_rate=250)
        
        # Generate test signal with known pattern
        t = np.linspace(0, 1, 250)
        test_signal = np.zeros((8, 250))
        
        # Add 10Hz alpha wave
        for i in range(8):
            test_signal[i] = 5 * np.sin(2 * np.pi * 10 * t + i * 0.1)
            
        # Train pattern
        processor.train_pattern(test_signal, 'alpha_wave')
        
        # Process signal
        preprocessed = processor.preprocess_signal(test_signal)
        features = processor.extract_features(preprocessed)
        
        # Verify features
        self.assertIn('alpha_power', features)
        self.assertGreater(np.mean(features['alpha_power']), 0)
        
        # Test pattern recognition
        pattern = processor.decode_neural_pattern(features)
        self.assertEqual(pattern, 'alpha_wave')
        
        print("✅ Signal processing pipeline test passed!")
        
    async def test_security_layer(self):
        """Test security layer functionality"""
        print("\n🧪 Testing Security Layer...")
        
        security = NeuralSecurityLayer("test_user")
        await security.initialize()
        
        # Test encryption/decryption
        test_data = {
            'pattern': 'test_pattern',
            'features': {'power': 0.8},
            'timestamp': time.time()
        }
        
        # Encrypt
        encrypted = security.encrypt_neural_data(test_data)
        self.assertIn('ciphertext', encrypted)
        self.assertIn('signature', encrypted)
        
        # Decrypt
        decrypted = security.decrypt_neural_data(encrypted)
        self.assertEqual(decrypted['pattern'], test_data['pattern'])
        
        # Test neural data validation
        valid_data = np.random.randn(16, 1000) * 10
        self.assertTrue(security.validate_neural_data(valid_data))
        
        # Test invalid data (too high amplitude)
        invalid_data = np.random.randn(16, 1000) * 1000
        self.assertFalse(security.validate_neural_data(invalid_data))
        
        print("✅ Security layer test passed!")
        
    async def test_hive_protocol(self):
        """Test hive communication protocol"""
        print("\n🧪 Testing Hive Protocol...")
        
        protocol = HiveProtocol("test_node_001")
        
        # Test message creation
        await protocol.send_neural_data(
            {'test_feature': 0.5},
            'test_pattern'
        )
        
        # Verify message in queue
        message = await protocol.outgoing_queue.get()
        self.assertEqual(message.message_type, MessageType.NEURAL_DATA)
        self.assertEqual(message.payload['pattern'], 'test_pattern')
        
        print("✅ Hive protocol test passed!")
        
    async def test_performance_optimization(self):
        """Test performance optimization"""
        print("\n🧪 Testing Performance Optimization...")
        
        optimizer = NeuralStreamOptimizer(target_latency_ms=5.0)
        
        # Test data compression
        test_data = np.random.randn(32, 1000) * 10
        compressed, info = await optimizer.optimize_stream(test_data)
        
        # Verify compression
        self.assertLess(len(compressed), test_data.nbytes)
        self.assertGreater(info['compression_ratio'], 1.0)
        self.assertLess(info['processing_time_ms'], 50)
        
        # Test adaptive quality
        optimizer.current_metrics.latency_ms = 20.0  # High latency
        adaptations = optimizer.bandwidth_manager.adapt_parameters(
            optimizer.current_metrics
        )
        
        self.assertEqual(adaptations['action'], 'reduce_quality')
        self.assertLess(optimizer.bandwidth_manager.quality_level, 1.0)
        
        print("✅ Performance optimization test passed!")
        
    async def test_emergency_shutdown(self):
        """Test emergency shutdown procedures"""
        print("\n🧪 Testing Emergency Shutdown...")
        
        system = NeuralLinkSystem("test_emergency", self.config)
        await system.initialize()
        await system.start_session()
        
        # Trigger emergency
        await system.emergency_shutdown("Test emergency")
        
        # Verify system stopped
        self.assertFalse(system.is_active)
        self.assertTrue(system.emergency_stop)
        
        print("✅ Emergency shutdown test passed!")
        
    async def test_cognitive_monitoring(self):
        """Test cognitive state monitoring"""
        print("\n🧪 Testing Cognitive Monitoring...")
        
        system = NeuralLinkSystem("test_cognitive", self.config)
        await system.initialize()
        
        # Simulate cognitive state changes
        system.cognitive_state['fatigue_level'] = 0.9
        system.cognitive_state['stress_level'] = 0.8
        
        # Perform safety check
        safe = await system._perform_safety_checks()
        self.assertTrue(safe)  # Just below threshold
        
        # Test over threshold
        system.cognitive_state['stress_level'] = 0.95
        safe = await system._perform_safety_checks()
        self.assertFalse(safe)
        
        print("✅ Cognitive monitoring test passed!")


class TestDataFlow(unittest.TestCase):
    """Test data flow through the system"""
    
    async def test_end_to_end_data_flow(self):
        """Test complete data flow from acquisition to hive"""
        print("\n🧪 Testing End-to-End Data Flow...")
        
        # Track data through pipeline
        data_tracker = {
            'acquired': False,
            'processed': False,
            'encrypted': False,
            'compressed': False,
            'transmitted': False
        }
        
        # 1. Signal acquisition
        raw_signal = np.random.randn(32, 1000) * 10
        data_tracker['acquired'] = True
        
        # 2. Signal processing
        processor = NeuralSignalProcessor(32, 1000)
        preprocessed = processor.preprocess_signal(raw_signal)
        features = processor.extract_features(preprocessed)
        data_tracker['processed'] = True
        
        # 3. Security encryption
        security = NeuralSecurityLayer("test_user")
        await security.initialize()
        encrypted_data = security.encrypt_neural_data({
            'features': features,
            'timestamp': time.time()
        })
        data_tracker['encrypted'] = True
        
        # 4. Performance optimization
        optimizer = NeuralStreamOptimizer()
        compressed, _ = await optimizer.optimize_stream(
            np.array(list(features.values())[0])
        )
        data_tracker['compressed'] = True
        
        # 5. Transmission (simulated)
        protocol = HiveProtocol("test_node")
        await protocol.send_neural_data(features, "test_pattern")
        data_tracker['transmitted'] = True
        
        # Verify all stages completed
        for stage, completed in data_tracker.items():
            self.assertTrue(completed, f"Stage {stage} not completed")
            
        print("✅ End-to-end data flow test passed!")


async def run_all_tests():
    """Run all integration tests"""
    print("=" * 60)
    print("NEURAL LINK SYSTEM - INTEGRATION TEST SUITE")
    print("=" * 60)
    
    # Start mock hive server
    mock_server = MockHiveServer()
    server_task = asyncio.create_task(mock_server.start())
    await asyncio.sleep(1)  # Let server start
    
    try:
        # Run integration tests
        suite = unittest.TestLoader().loadTestsFromTestCase(TestNeuralLinkIntegration)
        runner = unittest.TextTestRunner(verbosity=2)
        
        # Convert sync tests to async
        for test in suite:
            if hasattr(test, '_testMethodName'):
                method = getattr(test, test._testMethodName)
                if asyncio.iscoroutinefunction(method):
                    await method()
                    
        # Run data flow tests
        flow_suite = unittest.TestLoader().loadTestsFromTestCase(TestDataFlow)
        for test in flow_suite:
            if hasattr(test, '_testMethodName'):
                method = getattr(test, test._testMethodName)
                if asyncio.iscoroutinefunction(method):
                    await method()
                    
    finally:
        # Stop mock server
        await mock_server.stop()
        
    print("\n" + "=" * 60)
    print("ALL INTEGRATION TESTS COMPLETED")
    print("=" * 60)


def benchmark_performance():
    """Run performance benchmarks"""
    print("\n📊 Running Performance Benchmarks...")
    
    import timeit
    
    # Benchmark signal processing
    processor = NeuralSignalProcessor(32, 1000)
    test_signal = np.random.randn(32, 1000)
    
    processing_time = timeit.timeit(
        lambda: processor.preprocess_signal(test_signal),
        number=100
    ) / 100
    
    print(f"Signal preprocessing: {processing_time*1000:.2f}ms average")
    
    # Benchmark feature extraction
    feature_time = timeit.timeit(
        lambda: processor.extract_features(test_signal),
        number=100
    ) / 100
    
    print(f"Feature extraction: {feature_time*1000:.2f}ms average")
    
    # Calculate throughput
    samples_per_second = 1000 / (processing_time + feature_time)
    print(f"Maximum throughput: {samples_per_second:.0f} samples/second")
    
    print("\n✅ Benchmarks completed!")


if __name__ == "__main__":
    import struct  # Add missing import
    
    # Run tests
    asyncio.run(run_all_tests())
    
    # Run benchmarks
    benchmark_performance()