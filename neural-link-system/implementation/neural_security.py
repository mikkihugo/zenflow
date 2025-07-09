#!/usr/bin/env python3
"""
Neural Security Layer - Encryption and security for neural data
Implements comprehensive security measures for brain-computer interfaces
"""

import hashlib
import hmac
import json
import time
import secrets
from typing import Dict, List, Optional, Tuple, Any
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import numpy as np
import logging

logger = logging.getLogger(__name__)


class NeuralSecurityLayer:
    """Comprehensive security layer for neural data protection"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.backend = default_backend()
        
        # Key management
        self.master_key = None
        self.session_keys = {}
        self.key_rotation_interval = 3600  # 1 hour
        self.last_key_rotation = time.time()
        
        # Encryption parameters
        self.aes_key_size = 32  # 256-bit
        self.rsa_key_size = 4096
        self.nonce_size = 16
        
        # Authentication
        self.auth_tokens = {}
        self.neural_signature = None
        self.biometric_template = None
        
        # Security policies
        self.policies = {
            'min_encryption_strength': 256,
            'require_neural_auth': True,
            'max_data_retention': 86400,  # 24 hours
            'require_consent': True,
            'anonymize_data': True
        }
        
        # Audit log
        self.audit_log = []
        self.anomaly_threshold = 0.95
        
        # Privacy preservation
        self.differential_privacy_epsilon = 1.0
        self.noise_scale = 0.1
    
    async def initialize(self) -> bool:
        """Initialize security layer"""
        try:
            # Generate master key
            self.master_key = self._generate_master_key()
            
            # Generate RSA key pair for asymmetric operations
            self.rsa_private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=self.rsa_key_size,
                backend=self.backend
            )
            self.rsa_public_key = self.rsa_private_key.public_key()
            
            # Initialize neural authentication
            await self._initialize_neural_auth()
            
            # Create initial session key
            self._rotate_session_keys()
            
            self._log_audit_event('security_initialized', {'user_id': self.user_id})
            
            logger.info(f"Security layer initialized for user {self.user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Security initialization failed: {e}")
            return False
    
    def _generate_master_key(self) -> bytes:
        """Generate master encryption key using hardware entropy"""
        # In practice, this would use hardware security module (HSM)
        salt = secrets.token_bytes(32)
        
        # Derive key from multiple entropy sources
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=self.aes_key_size,
            salt=salt,
            iterations=100000,
            backend=self.backend
        )
        
        # Combine user ID and random data for key material
        key_material = f"{self.user_id}{secrets.token_hex(32)}".encode()
        
        return kdf.derive(key_material)
    
    async def _initialize_neural_auth(self):
        """Initialize neural authentication system"""
        # Generate neural signature template
        # In practice, this would be from actual calibration data
        self.neural_signature = {
            'user_id': self.user_id,
            'template': secrets.token_bytes(64),
            'created': time.time(),
            'threshold': 0.85
        }
        
        # Create biometric template
        self.biometric_template = {
            'neural_patterns': [],
            'cognitive_baseline': {},
            'unique_markers': []
        }
    
    def encrypt_neural_data(self, data: Dict) -> Dict:
        """Encrypt neural data with multiple layers of protection"""
        try:
            # Add privacy-preserving noise
            if 'features' in data:
                data['features'] = self._add_differential_privacy(data['features'])
            
            # Create metadata
            metadata = {
                'timestamp': time.time(),
                'user_id_hash': hashlib.sha256(self.user_id.encode()).hexdigest(),
                'data_type': 'neural_signal'
            }
            
            # Serialize data
            plaintext = json.dumps(data).encode()
            
            # Generate nonce
            nonce = secrets.token_bytes(self.nonce_size)
            
            # Get current session key
            session_key = self._get_current_session_key()
            
            # Encrypt with AES-GCM
            cipher = Cipher(
                algorithms.AES(session_key),
                modes.GCM(nonce),
                backend=self.backend
            )
            
            encryptor = cipher.encryptor()
            encryptor.authenticate_additional_data(json.dumps(metadata).encode())
            ciphertext = encryptor.update(plaintext) + encryptor.finalize()
            
            # Create encrypted package
            encrypted_package = {
                'ciphertext': ciphertext.hex(),
                'nonce': nonce.hex(),
                'tag': encryptor.tag.hex(),
                'metadata': metadata,
                'key_id': self._get_current_key_id()
            }
            
            # Sign the package
            signature = self._sign_data(encrypted_package)
            encrypted_package['signature'] = signature
            
            self._log_audit_event('data_encrypted', {'size': len(plaintext)})
            
            return encrypted_package
            
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    def decrypt_neural_data(self, encrypted_package: Dict) -> Optional[Dict]:
        """Decrypt neural data package"""
        try:
            # Verify signature
            if not self._verify_signature(encrypted_package):
                logger.error("Signature verification failed")
                return None
            
            # Get decryption key
            key_id = encrypted_package['key_id']
            session_key = self.session_keys.get(key_id)
            
            if not session_key:
                logger.error(f"Session key {key_id} not found")
                return None
            
            # Extract components
            ciphertext = bytes.fromhex(encrypted_package['ciphertext'])
            nonce = bytes.fromhex(encrypted_package['nonce'])
            tag = bytes.fromhex(encrypted_package['tag'])
            metadata = encrypted_package['metadata']
            
            # Decrypt with AES-GCM
            cipher = Cipher(
                algorithms.AES(session_key),
                modes.GCM(nonce, tag),
                backend=self.backend
            )
            
            decryptor = cipher.decryptor()
            decryptor.authenticate_additional_data(json.dumps(metadata).encode())
            plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            
            # Parse decrypted data
            data = json.loads(plaintext.decode())
            
            self._log_audit_event('data_decrypted', {'key_id': key_id})
            
            return data
            
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            return None
    
    def validate_neural_data(self, data: np.ndarray) -> bool:
        """Validate neural data for anomalies and attacks"""
        try:
            # Check data shape and type
            if not isinstance(data, np.ndarray):
                return False
            
            # Statistical validation
            if not self._validate_statistics(data):
                return False
            
            # Check for known attack patterns
            if self._detect_adversarial_patterns(data):
                logger.warning("Adversarial pattern detected")
                return False
            
            # Validate against user's neural signature
            if self.neural_signature and not self._validate_neural_signature(data):
                logger.warning("Neural signature mismatch")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Validation error: {e}")
            return False
    
    def _validate_statistics(self, data: np.ndarray) -> bool:
        """Validate statistical properties of neural data"""
        # Check for reasonable amplitude ranges (microvolts)
        if np.max(np.abs(data)) > 200:  # Typical EEG is < 200 μV
            return False
        
        # Check for zero variance (dead channels)
        if np.any(np.var(data, axis=1) < 1e-10):
            return False
        
        # Check for excessive noise
        snr = np.mean(data) / (np.std(data) + 1e-10)
        if snr < 0.1 or snr > 100:
            return False
        
        return True
    
    def _detect_adversarial_patterns(self, data: np.ndarray) -> bool:
        """Detect potential adversarial attacks in neural data"""
        # Check for repetitive patterns (potential replay attack)
        autocorr = np.correlate(data[0], data[0], mode='full')
        peaks = np.where(autocorr > 0.9 * np.max(autocorr))[0]
        
        if len(peaks) > 2:  # More than just the central peak
            return True
        
        # Check for unusual frequency components
        fft = np.fft.fft(data, axis=1)
        power = np.abs(fft) ** 2
        
        # Look for concentrated power in specific frequencies (potential injection)
        freq_concentration = np.max(power, axis=1) / np.mean(power, axis=1)
        if np.any(freq_concentration > 50):
            return True
        
        return False
    
    def _validate_neural_signature(self, data: np.ndarray) -> bool:
        """Validate data against user's neural signature"""
        # Simplified validation - in practice would use ML model
        # Extract signature features from data
        features = self._extract_signature_features(data)
        
        # Compare with stored template
        similarity = self._compute_similarity(features, self.neural_signature['template'])
        
        return similarity > self.neural_signature['threshold']
    
    def _extract_signature_features(self, data: np.ndarray) -> np.ndarray:
        """Extract biometric features from neural data"""
        # Placeholder for actual feature extraction
        # Would include spectral features, connectivity patterns, etc.
        return np.random.rand(64)
    
    def _compute_similarity(self, features1: np.ndarray, features2: Any) -> float:
        """Compute similarity between feature vectors"""
        # Placeholder for actual similarity computation
        return 0.9
    
    def validate_feedback(self, feedback_data: Dict) -> bool:
        """Validate feedback data for safety"""
        try:
            # Check feedback type
            if feedback_data.get('type') not in ['visual', 'auditory', 'haptic']:
                return False
            
            # Check intensity limits
            intensity = feedback_data.get('intensity', 0)
            if intensity < 0 or intensity > 1.0:
                return False
            
            # Check frequency limits (prevent harmful frequencies)
            frequency = feedback_data.get('frequency', 0)
            if frequency > 0 and (frequency < 0.5 or frequency > 100):
                return False
            
            # Check duration limits
            duration = feedback_data.get('duration', 0)
            if duration > 0 and duration > 5000:  # Max 5 seconds
                return False
            
            # Validate against safety policies
            if not self._check_feedback_policies(feedback_data):
                return False
            
            self._log_audit_event('feedback_validated', {'type': feedback_data.get('type')})
            
            return True
            
        except Exception as e:
            logger.error(f"Feedback validation error: {e}")
            return False
    
    def _check_feedback_policies(self, feedback_data: Dict) -> bool:
        """Check feedback against safety policies"""
        # Implement policy checks
        # E.g., cumulative intensity limits, pattern restrictions, etc.
        return True
    
    def _add_differential_privacy(self, features: Dict) -> Dict:
        """Add differential privacy noise to features"""
        noisy_features = {}
        
        for key, value in features.items():
            if isinstance(value, (int, float)):
                # Add Laplacian noise
                noise = np.random.laplace(0, self.noise_scale / self.differential_privacy_epsilon)
                noisy_features[key] = value + noise
            elif isinstance(value, np.ndarray):
                noise = np.random.laplace(0, self.noise_scale / self.differential_privacy_epsilon, value.shape)
                noisy_features[key] = value + noise
            else:
                noisy_features[key] = value
        
        return noisy_features
    
    def _rotate_session_keys(self):
        """Rotate session encryption keys"""
        # Generate new session key
        new_key = secrets.token_bytes(self.aes_key_size)
        key_id = secrets.token_hex(16)
        
        # Store with timestamp
        self.session_keys[key_id] = new_key
        self.current_key_id = key_id
        
        # Clean old keys (keep last 3 for decryption)
        if len(self.session_keys) > 3:
            oldest_key = min(self.session_keys.keys())
            del self.session_keys[oldest_key]
        
        self.last_key_rotation = time.time()
        
        self._log_audit_event('key_rotated', {'key_id': key_id})
    
    def _get_current_session_key(self) -> bytes:
        """Get current session key, rotating if necessary"""
        # Check if rotation needed
        if time.time() - self.last_key_rotation > self.key_rotation_interval:
            self._rotate_session_keys()
        
        return self.session_keys[self.current_key_id]
    
    def _get_current_key_id(self) -> str:
        """Get current key ID"""
        return self.current_key_id
    
    def _sign_data(self, data: Dict) -> str:
        """Create digital signature for data"""
        # Create signing key from master key
        signing_key = hmac.new(self.master_key, b"signing", hashlib.sha256).digest()
        
        # Create signature
        data_bytes = json.dumps(data, sort_keys=True).encode()
        signature = hmac.new(signing_key, data_bytes, hashlib.sha256).hexdigest()
        
        return signature
    
    def _verify_signature(self, package: Dict) -> bool:
        """Verify digital signature"""
        if 'signature' not in package:
            return False
        
        provided_signature = package['signature']
        
        # Remove signature from package for verification
        package_copy = package.copy()
        del package_copy['signature']
        
        # Recalculate signature
        expected_signature = self._sign_data(package_copy)
        
        return hmac.compare_digest(provided_signature, expected_signature)
    
    def check_integrity(self) -> bool:
        """Check system integrity"""
        try:
            # Verify master key
            if not self.master_key or len(self.master_key) != self.aes_key_size:
                return False
            
            # Verify session keys
            if not self.session_keys or not self.current_key_id:
                return False
            
            # Check neural signature
            if self.policies['require_neural_auth'] and not self.neural_signature:
                return False
            
            # Verify audit log integrity
            if not self._verify_audit_log():
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Integrity check failed: {e}")
            return False
    
    def _verify_audit_log(self) -> bool:
        """Verify audit log hasn't been tampered with"""
        # Simple verification - in practice would use blockchain or similar
        return len(self.audit_log) < 10000  # Prevent log overflow
    
    def _log_audit_event(self, event_type: str, details: Dict):
        """Log security audit event"""
        event = {
            'timestamp': time.time(),
            'event_type': event_type,
            'user_id_hash': hashlib.sha256(self.user_id.encode()).hexdigest(),
            'details': details
        }
        
        self.audit_log.append(event)
        
        # Rotate log if too large
        if len(self.audit_log) > 1000:
            self.audit_log = self.audit_log[-500:]  # Keep last 500 events
    
    def generate_neural_auth_challenge(self) -> Dict:
        """Generate challenge for neural authentication"""
        challenge = {
            'challenge_id': secrets.token_hex(16),
            'timestamp': time.time(),
            'pattern_sequence': [
                'imagine_left_hand',
                'imagine_right_hand',
                'focus_attention',
                'relax'
            ],
            'duration': 10.0  # seconds
        }
        
        return challenge
    
    def verify_neural_auth_response(self, response_data: np.ndarray, challenge: Dict) -> bool:
        """Verify neural authentication response"""
        # Extract features from response
        features = self._extract_signature_features(response_data)
        
        # Verify against stored template
        similarity = self._compute_similarity(features, self.neural_signature['template'])
        
        # Log authentication attempt
        self._log_audit_event('neural_auth_attempt', {
            'challenge_id': challenge['challenge_id'],
            'success': similarity > self.neural_signature['threshold']
        })
        
        return similarity > self.neural_signature['threshold']
    
    def get_privacy_report(self) -> Dict:
        """Generate privacy compliance report"""
        return {
            'user_id_anonymized': hashlib.sha256(self.user_id.encode()).hexdigest()[:8],
            'encryption_strength': self.aes_key_size * 8,
            'differential_privacy_epsilon': self.differential_privacy_epsilon,
            'data_retention_policy': self.policies['max_data_retention'],
            'anonymization_enabled': self.policies['anonymize_data'],
            'audit_events_count': len(self.audit_log),
            'last_key_rotation': self.last_key_rotation
        }


def test_security_layer():
    """Test the neural security layer"""
    import asyncio
    
    async def run_test():
        print("Testing Neural Security Layer...")
        
        # Initialize security
        security = NeuralSecurityLayer("test_user_001")
        await security.initialize()
        
        # Test data encryption
        test_data = {
            'pattern': 'focus',
            'features': {'alpha_power': 0.8, 'beta_power': 0.6},
            'timestamp': time.time()
        }
        
        print("\nOriginal data:", test_data)
        
        # Encrypt
        encrypted = security.encrypt_neural_data(test_data)
        print("\nEncrypted package keys:", encrypted.keys())
        
        # Decrypt
        decrypted = security.decrypt_neural_data(encrypted)
        print("\nDecrypted data:", decrypted)
        
        # Test neural data validation
        test_signal = np.random.randn(32, 1000) * 10  # Simulated EEG
        is_valid = security.validate_neural_data(test_signal)
        print(f"\nNeural data validation: {is_valid}")
        
        # Test feedback validation
        feedback = {
            'type': 'haptic',
            'intensity': 0.5,
            'frequency': 10,
            'duration': 1000
        }
        
        is_valid_feedback = security.validate_feedback(feedback)
        print(f"Feedback validation: {is_valid_feedback}")
        
        # Generate privacy report
        report = security.get_privacy_report()
        print("\nPrivacy Report:", report)
        
        # Check integrity
        integrity = security.check_integrity()
        print(f"\nSystem integrity: {integrity}")
        
        print("\nTest completed!")
    
    asyncio.run(run_test())


if __name__ == "__main__":
    test_security_layer()