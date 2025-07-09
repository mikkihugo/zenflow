#!/usr/bin/env python3
"""
Neural Link System - Main integration module
Combines all components for human-hive mind integration
"""

import asyncio
import threading
import time
import numpy as np
from typing import Dict, List, Optional, Callable
import logging
from dataclasses import dataclass
from datetime import datetime

# Import our modules
from neural_signal_processor import NeuralSignalProcessor
from hive_protocol import HiveProtocol, MessageType
from neural_security import NeuralSecurityLayer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class NeuralLinkConfig:
    """Configuration for neural link system"""
    num_channels: int = 64
    sampling_rate: int = 1000
    buffer_size: int = 1000
    safety_check_interval: float = 0.1
    max_session_duration: int = 3600  # 1 hour
    emergency_threshold: float = 0.9
    hive_host: str = 'localhost'
    hive_port: int = 9999
    enable_feedback: bool = True
    feedback_intensity_limit: float = 0.5


class NeuralLinkSystem:
    """Main neural link system for human-hive integration"""
    
    def __init__(self, user_id: str, config: NeuralLinkConfig = None):
        self.user_id = user_id
        self.config = config or NeuralLinkConfig()
        
        # Initialize components
        self.signal_processor = NeuralSignalProcessor(
            num_channels=self.config.num_channels,
            sampling_rate=self.config.sampling_rate
        )
        
        self.hive_protocol = HiveProtocol(
            node_id=f"neural_link_{user_id}"
        )
        
        self.security_layer = NeuralSecurityLayer(user_id)
        
        # System state
        self.is_active = False
        self.session_start_time = None
        self.emergency_stop = False
        
        # Performance tracking
        self.metrics = {
            'commands_sent': 0,
            'commands_received': 0,
            'patterns_recognized': 0,
            'consensus_participations': 0,
            'error_count': 0,
            'uptime': 0
        }
        
        # Cognitive state monitoring
        self.cognitive_state = {
            'attention_level': 0.0,
            'fatigue_level': 0.0,
            'stress_level': 0.0,
            'engagement_level': 0.0
        }
        
        # Neural feedback system
        self.feedback_queue = asyncio.Queue()
        self.feedback_handlers: List[Callable] = []
        
        # Safety monitoring
        self.safety_violations = []
        self.last_safety_check = time.time()
        
        # Setup message handlers
        self._setup_message_handlers()
    
    def _setup_message_handlers(self):
        """Setup handlers for hive messages"""
        # Handle incoming feedback
        async def handle_feedback(message):
            if self.config.enable_feedback:
                await self._process_feedback(message.payload)
        
        # Handle consensus requests
        async def handle_consensus(message):
            await self._participate_in_consensus(message)
        
        # Handle emergency messages
        async def handle_emergency(message):
            await self._handle_emergency(message.payload)
        
        self.hive_protocol.register_handler(MessageType.FEEDBACK, handle_feedback)
        self.hive_protocol.register_handler(MessageType.CONSENSUS_REQUEST, handle_consensus)
        self.hive_protocol.register_handler(MessageType.EMERGENCY, handle_emergency)
    
    async def initialize(self) -> bool:
        """Initialize the neural link system"""
        try:
            logger.info(f"Initializing neural link for user {self.user_id}")
            
            # Perform safety checks
            if not await self._perform_safety_checks():
                logger.error("Safety checks failed")
                return False
            
            # Initialize security
            if not await self.security_layer.initialize():
                logger.error("Security initialization failed")
                return False
            
            # Connect to hive
            await self.hive_protocol.connect_to_hive(
                self.config.hive_host,
                self.config.hive_port
            )
            
            # Start signal processing
            self.signal_processor.start_real_time_processing()
            
            # Start monitoring tasks
            asyncio.create_task(self._safety_monitor_loop())
            asyncio.create_task(self._cognitive_monitor_loop())
            asyncio.create_task(self._feedback_processing_loop())
            
            self.is_active = True
            self.session_start_time = datetime.now()
            
            logger.info("Neural link system initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Initialization failed: {e}")
            return False
    
    async def calibrate(self, calibration_tasks: List[Dict]) -> bool:
        """Calibrate the system with user-specific neural patterns"""
        logger.info("Starting calibration process...")
        
        for task in calibration_tasks:
            task_name = task['name']
            duration = task['duration']
            
            logger.info(f"Calibrating pattern: {task_name}")
            
            # Collect neural data for the task
            neural_data = await self._collect_neural_data(duration)
            
            # Train the pattern
            success = self.signal_processor.train_pattern(neural_data, task_name)
            
            if not success:
                logger.error(f"Failed to calibrate pattern: {task_name}")
                return False
            
            # Share calibration with hive
            await self.hive_protocol.share_memory(
                f"calibration/{self.user_id}/{task_name}",
                {'pattern': task_name, 'timestamp': time.time()}
            )
        
        logger.info("Calibration completed successfully")
        return True
    
    async def start_session(self) -> bool:
        """Start a neural link session"""
        if not self.is_active:
            logger.error("System not initialized")
            return False
        
        logger.info("Starting neural link session")
        
        # Start data collection and processing
        asyncio.create_task(self._neural_processing_loop())
        
        # Notify hive of session start
        await self.hive_protocol.send_command(
            'session_start',
            {'user_id': self.user_id, 'timestamp': time.time()}
        )
        
        return True
    
    async def _neural_processing_loop(self):
        """Main loop for processing neural signals"""
        while self.is_active and not self.emergency_stop:
            try:
                # Simulate getting neural data (would come from actual BCI hardware)
                neural_data = await self._get_neural_data()
                
                if neural_data is not None:
                    # Process through security layer first
                    if self.security_layer.validate_neural_data(neural_data):
                        # Send to signal processor
                        self.signal_processor.process_signal_chunk(neural_data)
                        
                        # Get processing results
                        results = self.signal_processor.get_results()
                        
                        if results:
                            await self._handle_neural_results(results)
                
                # Small delay to prevent CPU overload
                await asyncio.sleep(0.01)
                
            except Exception as e:
                logger.error(f"Error in neural processing: {e}")
                self.metrics['error_count'] += 1
    
    async def _handle_neural_results(self, results: Dict):
        """Handle processed neural data results"""
        pattern = results.get('pattern')
        features = results.get('features')
        
        if pattern:
            self.metrics['patterns_recognized'] += 1
            logger.info(f"Recognized pattern: {pattern}")
            
            # Encrypt and send to hive
            encrypted_data = self.security_layer.encrypt_neural_data({
                'pattern': pattern,
                'features': features,
                'timestamp': results['timestamp']
            })
            
            await self.hive_protocol.send_neural_data(
                encrypted_data,
                pattern
            )
            
            self.metrics['commands_sent'] += 1
            
            # Update cognitive state
            await self._update_cognitive_state(features)
    
    async def _update_cognitive_state(self, features: Dict):
        """Update cognitive state based on neural features"""
        # Simple cognitive state estimation (would be more sophisticated in practice)
        if 'alpha_power' in features:
            alpha_powers = features['alpha_power']
            if isinstance(alpha_powers, np.ndarray):
                self.cognitive_state['attention_level'] = float(np.mean(alpha_powers))
        
        if 'theta_power' in features:
            theta_powers = features['theta_power']
            if isinstance(theta_powers, np.ndarray):
                self.cognitive_state['fatigue_level'] = float(np.mean(theta_powers))
        
        # Check for concerning patterns
        if self.cognitive_state['fatigue_level'] > 0.8:
            logger.warning("High fatigue detected")
            await self._send_safety_alert('high_fatigue')
    
    async def _safety_monitor_loop(self):
        """Continuous safety monitoring"""
        while self.is_active:
            await asyncio.sleep(self.config.safety_check_interval)
            
            if not await self._perform_safety_checks():
                await self.emergency_shutdown("Safety check failed")
                break
            
            # Check session duration
            if self.session_start_time:
                duration = (datetime.now() - self.session_start_time).total_seconds()
                if duration > self.config.max_session_duration:
                    logger.warning("Maximum session duration reached")
                    await self.end_session()
                    break
    
    async def _perform_safety_checks(self) -> bool:
        """Perform comprehensive safety checks"""
        try:
            # Check system integrity
            if not self.security_layer.check_integrity():
                self.safety_violations.append({
                    'type': 'integrity_check_failed',
                    'timestamp': time.time()
                })
                return False
            
            # Check cognitive state
            if self.cognitive_state['stress_level'] > self.config.emergency_threshold:
                self.safety_violations.append({
                    'type': 'high_stress_detected',
                    'timestamp': time.time()
                })
                return False
            
            # Check for anomalies
            if self.metrics['error_count'] > 10:
                self.safety_violations.append({
                    'type': 'excessive_errors',
                    'timestamp': time.time()
                })
                return False
            
            self.last_safety_check = time.time()
            return True
            
        except Exception as e:
            logger.error(f"Safety check error: {e}")
            return False
    
    async def _cognitive_monitor_loop(self):
        """Monitor cognitive state and adapt system"""
        while self.is_active:
            await asyncio.sleep(1.0)  # Check every second
            
            # Share cognitive state with hive
            await self.hive_protocol.share_memory(
                f"cognitive_state/{self.user_id}",
                self.cognitive_state
            )
            
            # Adapt processing based on state
            if self.cognitive_state['fatigue_level'] > 0.7:
                # Reduce processing intensity
                self.signal_processor.pattern_threshold = 0.9
            else:
                self.signal_processor.pattern_threshold = 0.85
    
    async def _process_feedback(self, feedback_data: Dict):
        """Process feedback from hive to user"""
        if not self.config.enable_feedback:
            return
        
        feedback_type = feedback_data.get('type')
        intensity = min(feedback_data.get('intensity', 0.0), 
                       self.config.feedback_intensity_limit)
        
        # Validate feedback safety
        if not self.security_layer.validate_feedback(feedback_data):
            logger.warning("Feedback validation failed")
            return
        
        # Queue feedback for processing
        await self.feedback_queue.put({
            'type': feedback_type,
            'intensity': intensity,
            'timestamp': time.time()
        })
        
        self.metrics['commands_received'] += 1
    
    async def _feedback_processing_loop(self):
        """Process queued feedback"""
        while self.is_active:
            try:
                feedback = await asyncio.wait_for(
                    self.feedback_queue.get(), 
                    timeout=0.1
                )
                
                # Apply feedback (would interface with actual neurostimulation hardware)
                for handler in self.feedback_handlers:
                    await handler(feedback)
                    
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Feedback processing error: {e}")
    
    async def _participate_in_consensus(self, consensus_request):
        """Participate in hive consensus based on neural state"""
        # Use cognitive state to influence voting
        if self.cognitive_state['attention_level'] < 0.3:
            # Low attention, abstain from voting
            return
        
        # Simple voting logic based on neural patterns
        # In practice, this would be more sophisticated
        vote = await self._generate_consensus_vote(consensus_request.payload)
        
        if vote:
            self.metrics['consensus_participations'] += 1
    
    async def _generate_consensus_vote(self, request_data: Dict) -> Optional[str]:
        """Generate vote based on neural state and request"""
        # Placeholder for actual voting logic
        options = request_data.get('options', [])
        if options:
            return options[0]
        return None
    
    async def _handle_emergency(self, emergency_data: Dict):
        """Handle emergency messages from hive"""
        emergency_type = emergency_data.get('emergency_type')
        logger.critical(f"Emergency received: {emergency_type}")
        
        if emergency_type in ['system_failure', 'safety_violation']:
            await self.emergency_shutdown(f"Hive emergency: {emergency_type}")
    
    async def _send_safety_alert(self, alert_type: str):
        """Send safety alert to hive"""
        await self.hive_protocol.send_emergency(
            alert_type,
            {
                'user_id': self.user_id,
                'cognitive_state': self.cognitive_state,
                'timestamp': time.time()
            }
        )
    
    async def _get_neural_data(self) -> Optional[np.ndarray]:
        """Get neural data from acquisition system"""
        # Simulate neural data acquisition
        # In practice, this would interface with actual BCI hardware
        
        # Generate simulated EEG-like data
        samples = 100  # 0.1 seconds at 1000Hz
        data = np.random.randn(self.config.num_channels, samples) * 10
        
        # Add some realistic frequency components
        t = np.linspace(0, samples/self.config.sampling_rate, samples)
        for i in range(self.config.num_channels):
            # Add alpha rhythm (10 Hz)
            data[i] += 5 * np.sin(2 * np.pi * 10 * t)
            # Add beta rhythm (20 Hz)
            data[i] += 3 * np.sin(2 * np.pi * 20 * t)
        
        return data
    
    async def _collect_neural_data(self, duration: float) -> np.ndarray:
        """Collect neural data for specified duration"""
        samples_needed = int(duration * self.config.sampling_rate)
        collected_data = []
        
        start_time = time.time()
        while time.time() - start_time < duration:
            data = await self._get_neural_data()
            if data is not None:
                collected_data.append(data)
            await asyncio.sleep(0.1)
        
        # Concatenate all collected data
        if collected_data:
            return np.concatenate(collected_data, axis=1)
        else:
            return np.zeros((self.config.num_channels, samples_needed))
    
    def register_feedback_handler(self, handler: Callable):
        """Register a handler for neural feedback"""
        self.feedback_handlers.append(handler)
    
    async def send_thought(self, thought_pattern: str):
        """Send a specific thought pattern to hive"""
        # This would be triggered by recognized neural patterns
        await self.hive_protocol.send_command(
            'thought_transmission',
            {
                'pattern': thought_pattern,
                'user_id': self.user_id,
                'confidence': 0.85
            }
        )
    
    async def end_session(self):
        """End the neural link session gracefully"""
        logger.info("Ending neural link session")
        
        # Calculate session metrics
        if self.session_start_time:
            self.metrics['uptime'] = (
                datetime.now() - self.session_start_time
            ).total_seconds()
        
        # Notify hive
        await self.hive_protocol.send_command(
            'session_end',
            {
                'user_id': self.user_id,
                'metrics': self.metrics,
                'timestamp': time.time()
            }
        )
        
        # Stop processing
        self.is_active = False
        self.signal_processor.stop_real_time_processing()
        
        # Disconnect from hive
        await self.hive_protocol.disconnect()
        
        logger.info(f"Session ended. Metrics: {self.metrics}")
    
    async def emergency_shutdown(self, reason: str):
        """Perform emergency shutdown"""
        logger.critical(f"EMERGENCY SHUTDOWN: {reason}")
        
        self.emergency_stop = True
        
        # Send emergency signal to hive
        await self.hive_protocol.send_emergency(
            'emergency_shutdown',
            {
                'user_id': self.user_id,
                'reason': reason,
                'timestamp': time.time()
            }
        )
        
        # Immediate shutdown
        await self.end_session()
    
    def get_system_status(self) -> Dict:
        """Get current system status"""
        return {
            'user_id': self.user_id,
            'is_active': self.is_active,
            'session_duration': (
                (datetime.now() - self.session_start_time).total_seconds()
                if self.session_start_time else 0
            ),
            'cognitive_state': self.cognitive_state,
            'metrics': self.metrics,
            'safety_violations': len(self.safety_violations),
            'last_safety_check': self.last_safety_check
        }


async def demo_neural_link():
    """Demonstrate the neural link system"""
    print("=== Neural Link System Demo ===")
    
    # Create system
    config = NeuralLinkConfig(
        num_channels=32,
        sampling_rate=1000,
        enable_feedback=True
    )
    
    neural_link = NeuralLinkSystem(
        user_id="demo_user_001",
        config=config
    )
    
    # Initialize
    print("Initializing system...")
    if not await neural_link.initialize():
        print("Initialization failed!")
        return
    
    # Calibrate
    print("\nCalibrating neural patterns...")
    calibration_tasks = [
        {'name': 'focus', 'duration': 2.0},
        {'name': 'relax', 'duration': 2.0},
        {'name': 'imagine_movement', 'duration': 2.0}
    ]
    
    if not await neural_link.calibrate(calibration_tasks):
        print("Calibration failed!")
        return
    
    # Start session
    print("\nStarting neural link session...")
    await neural_link.start_session()
    
    # Register feedback handler
    async def handle_feedback(feedback):
        print(f"Received feedback: {feedback['type']} @ {feedback['intensity']}")
    
    neural_link.register_feedback_handler(handle_feedback)
    
    # Run for a short demo period
    print("\nRunning for 10 seconds...")
    await asyncio.sleep(10)
    
    # Get status
    status = neural_link.get_system_status()
    print(f"\nSystem Status: {status}")
    
    # End session
    print("\nEnding session...")
    await neural_link.end_session()
    
    print("\nDemo completed!")


if __name__ == "__main__":
    # Create neural_security.py first
    with open('neural_security.py', 'w') as f:
        f.write('''#!/usr/bin/env python3
"""Neural Security Layer - Placeholder for security implementation"""

class NeuralSecurityLayer:
    def __init__(self, user_id: str):
        self.user_id = user_id
    
    async def initialize(self) -> bool:
        return True
    
    def check_integrity(self) -> bool:
        return True
    
    def validate_neural_data(self, data) -> bool:
        return True
    
    def encrypt_neural_data(self, data) -> dict:
        return data
    
    def validate_feedback(self, feedback) -> bool:
        return True
''')
    
    # Run demo
    asyncio.run(demo_neural_link())