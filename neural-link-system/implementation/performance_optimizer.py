#!/usr/bin/env python3
"""
Performance Optimizer - Latency and bandwidth optimization for neural communication
Implements advanced techniques for real-time neural data streaming
"""

import numpy as np
import asyncio
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import lz4.frame
import struct
from collections import deque
import logging

logger = logging.getLogger(__name__)


@dataclass
class OptimizationMetrics:
    """Performance metrics for optimization tracking"""
    latency_ms: float
    throughput_mbps: float
    compression_ratio: float
    packet_loss: float
    jitter_ms: float
    cpu_usage: float
    memory_usage_mb: float


class NeuralDataCompressor:
    """Advanced compression for neural data streams"""
    
    def __init__(self):
        self.compression_level = 3  # Balance between speed and ratio
        self.use_delta_encoding = True
        self.use_predictive_coding = True
        self.reference_frame = None
        
    def compress(self, data: np.ndarray) -> bytes:
        """Compress neural data using multiple techniques"""
        # Convert to int16 for better compression (from float32)
        # Scale to preserve precision
        scale_factor = 1000
        data_int = (data * scale_factor).astype(np.int16)
        
        if self.use_delta_encoding and self.reference_frame is not None:
            # Delta encoding - only send differences
            delta = data_int - self.reference_frame
            compressed_data = delta
        else:
            compressed_data = data_int
            
        # Update reference frame
        self.reference_frame = data_int.copy()
        
        # LZ4 compression for speed
        data_bytes = compressed_data.tobytes()
        compressed_bytes = lz4.frame.compress(
            data_bytes,
            compression_level=self.compression_level
        )
        
        # Add metadata
        metadata = struct.pack(
            '!IIHH',
            len(data_bytes),  # Original size
            len(compressed_bytes),  # Compressed size
            data.shape[0],  # Channels
            data.shape[1]   # Samples
        )
        
        return metadata + compressed_bytes
    
    def decompress(self, compressed: bytes) -> np.ndarray:
        """Decompress neural data"""
        # Extract metadata
        metadata_size = struct.calcsize('!IIHH')
        original_size, compressed_size, channels, samples = struct.unpack(
            '!IIHH', compressed[:metadata_size]
        )
        
        # Decompress
        compressed_data = compressed[metadata_size:]
        decompressed_bytes = lz4.frame.decompress(compressed_data)
        
        # Reconstruct array
        data_int = np.frombuffer(decompressed_bytes, dtype=np.int16)
        data_int = data_int.reshape((channels, samples))
        
        # Apply inverse delta encoding if needed
        if self.use_delta_encoding and self.reference_frame is not None:
            data_int = data_int + self.reference_frame
            
        # Convert back to float
        data = data_int.astype(np.float32) / 1000
        
        return data


class AdaptiveBandwidthManager:
    """Manages bandwidth allocation based on network conditions"""
    
    def __init__(self, target_latency_ms: float = 5.0):
        self.target_latency_ms = target_latency_ms
        self.current_bandwidth_mbps = 100.0
        self.min_bandwidth_mbps = 1.0
        self.max_bandwidth_mbps = 1000.0
        
        # Adaptive parameters
        self.sampling_rate_multiplier = 1.0
        self.channel_selection_mask = None
        self.quality_level = 1.0  # 0.1 to 1.0
        
        # Network monitoring
        self.latency_history = deque(maxlen=100)
        self.throughput_history = deque(maxlen=100)
        
    def adapt_parameters(self, metrics: OptimizationMetrics) -> Dict:
        """Adapt transmission parameters based on network conditions"""
        self.latency_history.append(metrics.latency_ms)
        self.throughput_history.append(metrics.throughput_mbps)
        
        avg_latency = np.mean(self.latency_history) if self.latency_history else 0
        
        adaptations = {}
        
        # Adjust quality based on latency
        if avg_latency > self.target_latency_ms * 1.5:
            # Reduce quality to improve latency
            self.quality_level = max(0.1, self.quality_level - 0.1)
            adaptations['action'] = 'reduce_quality'
            
            # Reduce sampling rate
            self.sampling_rate_multiplier = max(0.25, self.sampling_rate_multiplier - 0.1)
            
            # Select fewer channels
            adaptations['channel_reduction'] = 0.75
            
        elif avg_latency < self.target_latency_ms * 0.7:
            # Increase quality if latency is good
            self.quality_level = min(1.0, self.quality_level + 0.05)
            adaptations['action'] = 'increase_quality'
            
            # Increase sampling rate
            self.sampling_rate_multiplier = min(1.0, self.sampling_rate_multiplier + 0.05)
        
        adaptations['quality_level'] = self.quality_level
        adaptations['sampling_rate_multiplier'] = self.sampling_rate_multiplier
        
        return adaptations


class PriorityQueue:
    """Priority queue for neural data packets"""
    
    def __init__(self, max_size: int = 1000):
        self.queues = {
            'critical': deque(maxlen=max_size // 4),
            'high': deque(maxlen=max_size // 2),
            'normal': deque(maxlen=max_size),
            'low': deque(maxlen=max_size)
        }
        self.packet_count = 0
        
    def enqueue(self, packet: Dict, priority: str = 'normal'):
        """Add packet to appropriate priority queue"""
        if priority in self.queues:
            self.queues[priority].append(packet)
            self.packet_count += 1
            
    def dequeue(self) -> Optional[Dict]:
        """Get highest priority packet"""
        for priority in ['critical', 'high', 'normal', 'low']:
            if self.queues[priority]:
                self.packet_count -= 1
                return self.queues[priority].popleft()
        return None
    
    def size(self) -> int:
        """Get total queue size"""
        return self.packet_count


class LatencyPredictor:
    """Predicts network latency using machine learning"""
    
    def __init__(self):
        self.history_window = 100
        self.latency_history = deque(maxlen=self.history_window)
        self.time_history = deque(maxlen=self.history_window)
        
    def add_measurement(self, latency_ms: float):
        """Add latency measurement"""
        self.latency_history.append(latency_ms)
        self.time_history.append(time.time())
        
    def predict_next_latency(self) -> float:
        """Predict next latency using simple moving average"""
        if len(self.latency_history) < 3:
            return 5.0  # Default
            
        # Weighted moving average (recent values weighted more)
        weights = np.linspace(0.1, 1.0, len(self.latency_history))
        weighted_avg = np.average(self.latency_history, weights=weights)
        
        # Add trend component
        if len(self.latency_history) > 10:
            recent = list(self.latency_history)[-10:]
            older = list(self.latency_history)[-20:-10]
            trend = np.mean(recent) - np.mean(older)
            weighted_avg += trend * 0.5
            
        return max(0.1, weighted_avg)


class NeuralStreamOptimizer:
    """Main optimization system for neural data streaming"""
    
    def __init__(self, target_latency_ms: float = 5.0):
        self.target_latency_ms = target_latency_ms
        
        # Components
        self.compressor = NeuralDataCompressor()
        self.bandwidth_manager = AdaptiveBandwidthManager(target_latency_ms)
        self.priority_queue = PriorityQueue()
        self.latency_predictor = LatencyPredictor()
        
        # Optimization state
        self.is_optimizing = False
        self.optimization_interval = 0.1  # seconds
        self.last_optimization = time.time()
        
        # Metrics
        self.current_metrics = OptimizationMetrics(
            latency_ms=0,
            throughput_mbps=0,
            compression_ratio=1.0,
            packet_loss=0,
            jitter_ms=0,
            cpu_usage=0,
            memory_usage_mb=0
        )
        
        # Edge computing simulation
        self.edge_processing_enabled = True
        self.edge_cache = {}
        
    async def optimize_stream(self, neural_data: np.ndarray, 
                            priority: str = 'normal') -> Tuple[bytes, Dict]:
        """Optimize neural data for transmission"""
        start_time = time.time()
        
        # Predict latency for proactive optimization
        predicted_latency = self.latency_predictor.predict_next_latency()
        
        # Apply adaptive parameters
        if predicted_latency > self.target_latency_ms:
            # Preemptive quality reduction
            quality_factor = self.bandwidth_manager.quality_level
            
            # Downsample if needed
            if quality_factor < 0.8:
                downsample_factor = int(1 / quality_factor)
                neural_data = neural_data[:, ::downsample_factor]
                
            # Channel selection for critical data
            if quality_factor < 0.5:
                # Select most informative channels (simplified)
                channel_variance = np.var(neural_data, axis=1)
                top_channels = np.argsort(channel_variance)[-16:]  # Top 16 channels
                neural_data = neural_data[top_channels]
        
        # Edge processing
        if self.edge_processing_enabled:
            processed_data = await self._edge_process(neural_data)
        else:
            processed_data = neural_data
            
        # Compress data
        compressed_data = self.compressor.compress(processed_data)
        
        # Calculate metrics
        original_size = neural_data.nbytes
        compressed_size = len(compressed_data)
        compression_ratio = original_size / compressed_size
        
        # Create packet
        packet = {
            'data': compressed_data,
            'timestamp': time.time(),
            'priority': priority,
            'original_shape': neural_data.shape,
            'compression_ratio': compression_ratio
        }
        
        # Queue packet
        self.priority_queue.enqueue(packet, priority)
        
        # Update metrics
        processing_time = (time.time() - start_time) * 1000
        self.current_metrics.latency_ms = processing_time
        self.current_metrics.compression_ratio = compression_ratio
        
        self.latency_predictor.add_measurement(processing_time)
        
        # Optimization info
        optimization_info = {
            'compression_ratio': compression_ratio,
            'processing_time_ms': processing_time,
            'predicted_latency_ms': predicted_latency,
            'quality_level': self.bandwidth_manager.quality_level,
            'queue_size': self.priority_queue.size()
        }
        
        return compressed_data, optimization_info
    
    async def _edge_process(self, data: np.ndarray) -> np.ndarray:
        """Perform edge processing to reduce data before transmission"""
        # Extract key features at edge to reduce bandwidth
        
        # Simple feature extraction (would be more sophisticated in practice)
        features = []
        
        # Power spectral density for each channel
        for channel in data:
            # FFT for frequency analysis
            fft = np.fft.fft(channel)
            psd = np.abs(fft[:len(fft)//2]) ** 2
            
            # Bin into frequency bands
            bands = self._extract_frequency_bands(psd)
            features.append(bands)
            
        # Cache for quick access
        cache_key = f"edge_{time.time():.2f}"
        self.edge_cache[cache_key] = np.array(features)
        
        # Clean old cache entries
        if len(self.edge_cache) > 100:
            oldest_key = min(self.edge_cache.keys())
            del self.edge_cache[oldest_key]
            
        # Return reduced feature set instead of raw data
        return np.array(features)
    
    def _extract_frequency_bands(self, psd: np.ndarray) -> np.ndarray:
        """Extract power in standard EEG frequency bands"""
        # Define frequency bins (simplified)
        total_bins = len(psd)
        
        bands = {
            'delta': (0, int(0.04 * total_bins)),
            'theta': (int(0.04 * total_bins), int(0.08 * total_bins)),
            'alpha': (int(0.08 * total_bins), int(0.13 * total_bins)),
            'beta': (int(0.13 * total_bins), int(0.30 * total_bins)),
            'gamma': (int(0.30 * total_bins), total_bins)
        }
        
        band_powers = []
        for band_name, (start, end) in bands.items():
            power = np.sum(psd[start:end])
            band_powers.append(power)
            
        return np.array(band_powers)
    
    async def get_optimized_packet(self) -> Optional[Dict]:
        """Get next packet from priority queue"""
        packet = self.priority_queue.dequeue()
        
        if packet:
            # Add transmission metadata
            packet['transmission_time'] = time.time()
            
        return packet
    
    def get_optimization_stats(self) -> Dict:
        """Get current optimization statistics"""
        return {
            'current_metrics': {
                'latency_ms': self.current_metrics.latency_ms,
                'throughput_mbps': self.current_metrics.throughput_mbps,
                'compression_ratio': self.current_metrics.compression_ratio,
                'packet_loss': self.current_metrics.packet_loss,
                'jitter_ms': self.current_metrics.jitter_ms
            },
            'bandwidth_adaptation': {
                'quality_level': self.bandwidth_manager.quality_level,
                'sampling_rate_multiplier': self.bandwidth_manager.sampling_rate_multiplier
            },
            'queue_status': {
                'total_packets': self.priority_queue.size(),
                'critical': len(self.priority_queue.queues['critical']),
                'high': len(self.priority_queue.queues['high']),
                'normal': len(self.priority_queue.queues['normal']),
                'low': len(self.priority_queue.queues['low'])
            },
            'edge_processing': {
                'enabled': self.edge_processing_enabled,
                'cache_size': len(self.edge_cache)
            },
            'predicted_latency_ms': self.latency_predictor.predict_next_latency()
        }
    
    async def run_continuous_optimization(self):
        """Run continuous optimization loop"""
        self.is_optimizing = True
        
        while self.is_optimizing:
            current_time = time.time()
            
            if current_time - self.last_optimization >= self.optimization_interval:
                # Adapt parameters based on current metrics
                adaptations = self.bandwidth_manager.adapt_parameters(self.current_metrics)
                
                if adaptations.get('action'):
                    logger.info(f"Optimization action: {adaptations['action']}")
                    
                self.last_optimization = current_time
                
            await asyncio.sleep(0.01)
    
    def stop_optimization(self):
        """Stop optimization loop"""
        self.is_optimizing = False


async def test_optimizer():
    """Test the performance optimizer"""
    print("Testing Neural Stream Optimizer...")
    
    # Create optimizer
    optimizer = NeuralStreamOptimizer(target_latency_ms=5.0)
    
    # Start optimization loop
    optimization_task = asyncio.create_task(optimizer.run_continuous_optimization())
    
    # Simulate neural data streaming
    print("\nSimulating neural data stream...")
    
    for i in range(10):
        # Generate test data
        channels = 32
        samples = 100
        neural_data = np.random.randn(channels, samples) * 10
        
        # Determine priority based on pattern
        priority = 'high' if i % 3 == 0 else 'normal'
        
        # Optimize and compress
        compressed, info = await optimizer.optimize_stream(neural_data, priority)
        
        print(f"\nPacket {i+1}:")
        print(f"  Original size: {neural_data.nbytes} bytes")
        print(f"  Compressed size: {len(compressed)} bytes")
        print(f"  Compression ratio: {info['compression_ratio']:.2f}x")
        print(f"  Processing time: {info['processing_time_ms']:.2f}ms")
        print(f"  Quality level: {info['quality_level']:.2f}")
        
        # Simulate varying network conditions
        if i == 5:
            print("\n📡 Simulating network congestion...")
            optimizer.current_metrics.latency_ms = 15.0
            
        await asyncio.sleep(0.1)
    
    # Get optimization statistics
    print("\n📊 Optimization Statistics:")
    stats = optimizer.get_optimization_stats()
    
    for category, values in stats.items():
        print(f"\n{category}:")
        for key, value in values.items():
            print(f"  {key}: {value}")
    
    # Stop optimization
    optimizer.stop_optimization()
    await optimization_task
    
    print("\n✅ Optimizer test completed!")


if __name__ == "__main__":
    asyncio.run(test_optimizer())