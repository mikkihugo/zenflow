#!/usr/bin/env python3
"""
Neural Signal Processor - Core signal processing for neural link system
Implements real-time signal processing, feature extraction, and neural decoding
"""

import numpy as np
from scipy import signal
from scipy.signal import butter, filtfilt, welch
from typing import Dict, List, Tuple, Optional
import threading
import queue
import time

class NeuralSignalProcessor:
    """Advanced neural signal processing pipeline with real-time capabilities"""
    
    def __init__(self, num_channels: int = 64, sampling_rate: int = 1000):
        self.num_channels = num_channels
        self.sampling_rate = sampling_rate
        self.buffer_size = 1000  # 1 second buffer
        
        # Initialize signal buffers
        self.signal_buffer = np.zeros((num_channels, self.buffer_size))
        self.buffer_index = 0
        
        # Processing parameters
        self.filters = self._initialize_filters()
        self.feature_extractors = self._initialize_feature_extractors()
        
        # Real-time processing
        self.processing_queue = queue.Queue()
        self.results_queue = queue.Queue()
        self.processing_thread = None
        self.is_running = False
        
        # Neural patterns database
        self.neural_patterns = {}
        self.pattern_threshold = 0.85
        
    def _initialize_filters(self) -> Dict:
        """Initialize frequency band filters"""
        filters = {}
        
        # Define frequency bands
        bands = {
            'delta': (0.5, 4),
            'theta': (4, 8),
            'alpha': (8, 13),
            'beta': (13, 30),
            'gamma': (30, 100),
            'high_gamma': (100, 200)
        }
        
        # Create Butterworth filters for each band
        for band_name, (low, high) in bands.items():
            nyquist = self.sampling_rate / 2
            low_norm = low / nyquist
            high_norm = high / nyquist
            
            if high_norm < 1:
                b, a = butter(4, [low_norm, high_norm], btype='band')
            else:
                b, a = butter(4, low_norm, btype='high')
                
            filters[band_name] = (b, a)
            
        # Add notch filter for powerline noise
        b_notch, a_notch = signal.iirnotch(60, 30, self.sampling_rate)
        filters['notch'] = (b_notch, a_notch)
        
        return filters
    
    def _initialize_feature_extractors(self) -> Dict:
        """Initialize feature extraction methods"""
        return {
            'power_spectrum': self._extract_power_spectrum,
            'coherence': self._extract_coherence,
            'phase_locking': self._extract_phase_locking,
            'entropy': self._extract_entropy,
            'hjorth': self._extract_hjorth_parameters,
            'wavelet': self._extract_wavelet_features
        }
    
    def preprocess_signal(self, raw_signal: np.ndarray) -> np.ndarray:
        """Apply preprocessing to raw neural signal"""
        # Apply notch filter for powerline noise
        b, a = self.filters['notch']
        filtered = filtfilt(b, a, raw_signal, axis=1)
        
        # Remove baseline drift with high-pass filter
        b_hp, a_hp = butter(4, 0.5 / (self.sampling_rate / 2), btype='high')
        filtered = filtfilt(b_hp, a_hp, filtered, axis=1)
        
        # Artifact rejection using z-score
        z_scores = np.abs((filtered - np.mean(filtered, axis=1, keepdims=True)) / 
                          np.std(filtered, axis=1, keepdims=True))
        
        # Mark artifacts (z-score > 5)
        artifact_mask = z_scores > 5
        filtered[artifact_mask] = 0
        
        return filtered
    
    def _extract_power_spectrum(self, signal_data: np.ndarray) -> Dict:
        """Extract power spectral density features"""
        features = {}
        
        for band_name, (b, a) in self.filters.items():
            if band_name == 'notch':
                continue
                
            # Filter signal to specific band
            band_signal = filtfilt(b, a, signal_data, axis=1)
            
            # Calculate power for each channel
            band_power = np.mean(band_signal ** 2, axis=1)
            features[f'{band_name}_power'] = band_power
            
            # Calculate relative power
            total_power = np.sum([features[f'{bn}_power'] 
                                for bn in ['delta', 'theta', 'alpha', 'beta', 'gamma'] 
                                if f'{bn}_power' in features], axis=0)
            
            if np.any(total_power > 0):
                features[f'{band_name}_relative'] = band_power / total_power
        
        return features
    
    def _extract_coherence(self, signal_data: np.ndarray) -> Dict:
        """Extract coherence between channels"""
        coherence_matrix = np.zeros((self.num_channels, self.num_channels))
        
        for i in range(self.num_channels):
            for j in range(i + 1, self.num_channels):
                # Calculate coherence using Welch's method
                f, cxy = signal.coherence(signal_data[i], signal_data[j], 
                                        self.sampling_rate, nperseg=256)
                
                # Average coherence in specific bands
                alpha_idx = np.logical_and(f >= 8, f <= 13)
                beta_idx = np.logical_and(f >= 13, f <= 30)
                
                coherence_matrix[i, j] = np.mean(cxy[alpha_idx])
                coherence_matrix[j, i] = np.mean(cxy[beta_idx])
        
        return {'coherence_matrix': coherence_matrix}
    
    def _extract_phase_locking(self, signal_data: np.ndarray) -> Dict:
        """Extract phase locking values between channels"""
        # Apply Hilbert transform to get instantaneous phase
        analytic_signal = signal.hilbert(signal_data, axis=1)
        phase = np.angle(analytic_signal)
        
        # Calculate phase locking value (PLV)
        plv_matrix = np.zeros((self.num_channels, self.num_channels))
        
        for i in range(self.num_channels):
            for j in range(i + 1, self.num_channels):
                phase_diff = phase[i] - phase[j]
                plv = np.abs(np.mean(np.exp(1j * phase_diff)))
                plv_matrix[i, j] = plv_matrix[j, i] = plv
        
        return {'phase_locking': plv_matrix}
    
    def _extract_entropy(self, signal_data: np.ndarray) -> Dict:
        """Extract entropy-based features"""
        from scipy.stats import entropy
        
        features = {}
        
        for i in range(self.num_channels):
            # Shannon entropy of power spectrum
            freqs, psd = welch(signal_data[i], self.sampling_rate)
            psd_norm = psd / np.sum(psd)
            features[f'spectral_entropy_ch{i}'] = entropy(psd_norm)
            
            # Sample entropy (simplified version)
            # This is a placeholder - full implementation would be more complex
            features[f'sample_entropy_ch{i}'] = self._sample_entropy(signal_data[i])
        
        return features
    
    def _sample_entropy(self, signal: np.ndarray, m: int = 2, r: float = 0.2) -> float:
        """Calculate sample entropy (simplified)"""
        N = len(signal)
        r = r * np.std(signal)
        
        def _maxdist(xi, xj, m):
            return max([abs(float(xi[k]) - float(xj[k])) for k in range(m)])
        
        def _phi(m):
            patterns = np.array([signal[i:i + m] for i in range(N - m + 1)])
            C = np.zeros(N - m + 1)
            
            for i in range(N - m + 1):
                template = patterns[i]
                for j in range(N - m + 1):
                    if i != j and _maxdist(template, patterns[j], m) <= r:
                        C[i] += 1
            
            phi = np.mean(C) / (N - m)
            return phi
        
        return -np.log(_phi(m + 1) / _phi(m)) if _phi(m) > 0 else 0
    
    def _extract_hjorth_parameters(self, signal_data: np.ndarray) -> Dict:
        """Extract Hjorth parameters (activity, mobility, complexity)"""
        features = {}
        
        for i in range(self.num_channels):
            # Activity (variance)
            activity = np.var(signal_data[i])
            
            # Mobility (sqrt of variance of first derivative / variance)
            diff1 = np.diff(signal_data[i])
            mobility = np.sqrt(np.var(diff1) / activity) if activity > 0 else 0
            
            # Complexity (mobility of first derivative / mobility)
            diff2 = np.diff(diff1)
            mobility_diff = np.sqrt(np.var(diff2) / np.var(diff1)) if np.var(diff1) > 0 else 0
            complexity = mobility_diff / mobility if mobility > 0 else 0
            
            features[f'hjorth_activity_ch{i}'] = activity
            features[f'hjorth_mobility_ch{i}'] = mobility
            features[f'hjorth_complexity_ch{i}'] = complexity
        
        return features
    
    def _extract_wavelet_features(self, signal_data: np.ndarray) -> Dict:
        """Extract wavelet-based features (simplified)"""
        # This is a placeholder for wavelet analysis
        # Full implementation would use pywt library
        features = {}
        
        for i in range(self.num_channels):
            # Simulate wavelet decomposition levels
            features[f'wavelet_energy_ch{i}'] = np.sum(signal_data[i] ** 2)
            
        return features
    
    def extract_features(self, preprocessed_signal: np.ndarray) -> Dict:
        """Extract all features from preprocessed signal"""
        all_features = {}
        
        for extractor_name, extractor_func in self.feature_extractors.items():
            try:
                features = extractor_func(preprocessed_signal)
                all_features.update(features)
            except Exception as e:
                print(f"Error in {extractor_name}: {e}")
        
        return all_features
    
    def decode_neural_pattern(self, features: Dict) -> Optional[str]:
        """Decode neural pattern into command/intention"""
        # Create feature vector
        feature_vector = []
        for key in sorted(features.keys()):
            if isinstance(features[key], np.ndarray):
                feature_vector.extend(features[key].flatten())
            else:
                feature_vector.append(features[key])
        
        feature_vector = np.array(feature_vector)
        
        # Compare with known patterns
        best_match = None
        best_score = 0
        
        for pattern_name, pattern_data in self.neural_patterns.items():
            # Cosine similarity
            similarity = np.dot(feature_vector, pattern_data) / (
                np.linalg.norm(feature_vector) * np.linalg.norm(pattern_data)
            )
            
            if similarity > best_score and similarity > self.pattern_threshold:
                best_score = similarity
                best_match = pattern_name
        
        return best_match
    
    def train_pattern(self, signal_data: np.ndarray, pattern_name: str):
        """Train system to recognize a neural pattern"""
        # Preprocess and extract features
        preprocessed = self.preprocess_signal(signal_data)
        features = self.extract_features(preprocessed)
        
        # Create feature vector
        feature_vector = []
        for key in sorted(features.keys()):
            if isinstance(features[key], np.ndarray):
                feature_vector.extend(features[key].flatten())
            else:
                feature_vector.append(features[key])
        
        # Store pattern
        self.neural_patterns[pattern_name] = np.array(feature_vector)
        
        return True
    
    def start_real_time_processing(self):
        """Start real-time signal processing thread"""
        if not self.is_running:
            self.is_running = True
            self.processing_thread = threading.Thread(target=self._processing_loop)
            self.processing_thread.start()
    
    def stop_real_time_processing(self):
        """Stop real-time processing"""
        self.is_running = False
        if self.processing_thread:
            self.processing_thread.join()
    
    def _processing_loop(self):
        """Main processing loop for real-time operation"""
        while self.is_running:
            try:
                # Get signal chunk from queue (timeout prevents hanging)
                signal_chunk = self.processing_queue.get(timeout=0.1)
                
                # Process signal
                preprocessed = self.preprocess_signal(signal_chunk)
                features = self.extract_features(preprocessed)
                pattern = self.decode_neural_pattern(features)
                
                # Put results in output queue
                self.results_queue.put({
                    'timestamp': time.time(),
                    'features': features,
                    'pattern': pattern
                })
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Processing error: {e}")
    
    def process_signal_chunk(self, signal_chunk: np.ndarray):
        """Process a chunk of signal data"""
        if self.is_running:
            self.processing_queue.put(signal_chunk)
    
    def get_results(self, timeout: float = 0.1) -> Optional[Dict]:
        """Get processing results"""
        try:
            return self.results_queue.get(timeout=timeout)
        except queue.Empty:
            return None


def test_signal_processor():
    """Test the neural signal processor"""
    print("Testing Neural Signal Processor...")
    
    # Initialize processor
    processor = NeuralSignalProcessor(num_channels=32, sampling_rate=1000)
    
    # Generate test signal (simulated EEG)
    duration = 2  # seconds
    t = np.linspace(0, duration, duration * processor.sampling_rate)
    
    # Create multi-channel signal with different frequency components
    test_signal = np.zeros((32, len(t)))
    for i in range(32):
        # Add different frequency components to different channels
        test_signal[i] = (
            0.5 * np.sin(2 * np.pi * 10 * t + i * 0.1) +  # Alpha
            0.3 * np.sin(2 * np.pi * 20 * t + i * 0.2) +  # Beta
            0.1 * np.random.randn(len(t))  # Noise
        )
    
    # Train a pattern
    print("Training 'focus' pattern...")
    processor.train_pattern(test_signal[:, :1000], 'focus')
    
    # Start real-time processing
    processor.start_real_time_processing()
    
    # Process signal
    print("Processing signal...")
    processor.process_signal_chunk(test_signal)
    
    # Get results
    time.sleep(0.5)
    results = processor.get_results()
    
    if results:
        print(f"Detected pattern: {results['pattern']}")
        print(f"Feature count: {len(results['features'])}")
    
    # Stop processing
    processor.stop_real_time_processing()
    print("Test completed!")


if __name__ == "__main__":
    test_signal_processor()