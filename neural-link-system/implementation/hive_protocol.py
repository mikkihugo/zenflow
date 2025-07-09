#!/usr/bin/env python3
"""
Hive Communication Protocol - Bidirectional brain-to-hive data transfer
Implements the protocol for collective intelligence integration
"""

import asyncio
import json
import struct
import hashlib
import time
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
from cryptography.fernet import Fernet
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MessageType(Enum):
    """Types of messages in the hive protocol"""
    NEURAL_DATA = "neural_data"
    COMMAND = "command"
    FEEDBACK = "feedback"
    SYNC = "sync"
    HEARTBEAT = "heartbeat"
    CONSENSUS_REQUEST = "consensus_request"
    CONSENSUS_VOTE = "consensus_vote"
    MEMORY_SHARE = "memory_share"
    EMERGENCY = "emergency"


@dataclass
class HiveMessage:
    """Standard message format for hive communication"""
    message_id: str
    timestamp: float
    source_id: str
    message_type: MessageType
    payload: Dict
    priority: int = 0
    encrypted: bool = True
    
    def to_bytes(self) -> bytes:
        """Serialize message to bytes"""
        json_data = json.dumps({
            'message_id': self.message_id,
            'timestamp': self.timestamp,
            'source_id': self.source_id,
            'message_type': self.message_type.value,
            'payload': self.payload,
            'priority': self.priority,
            'encrypted': self.encrypted
        })
        return json_data.encode('utf-8')
    
    @classmethod
    def from_bytes(cls, data: bytes) -> 'HiveMessage':
        """Deserialize message from bytes"""
        json_data = json.loads(data.decode('utf-8'))
        json_data['message_type'] = MessageType(json_data['message_type'])
        return cls(**json_data)


class HiveProtocol:
    """Core protocol implementation for hive mind communication"""
    
    def __init__(self, node_id: str, encryption_key: Optional[bytes] = None):
        self.node_id = node_id
        self.encryption_key = encryption_key or Fernet.generate_key()
        self.cipher = Fernet(self.encryption_key)
        
        # Connection management
        self.connections: Dict[str, asyncio.StreamWriter] = {}
        self.is_connected = False
        
        # Message handling
        self.message_handlers: Dict[MessageType, List[Callable]] = {
            msg_type: [] for msg_type in MessageType
        }
        self.message_queue = asyncio.Queue()
        self.outgoing_queue = asyncio.Queue()
        
        # Consensus mechanism
        self.consensus_requests: Dict[str, Dict] = {}
        self.consensus_threshold = 0.66  # 2/3 majority
        
        # Performance metrics
        self.metrics = {
            'messages_sent': 0,
            'messages_received': 0,
            'average_latency': 0,
            'bandwidth_used': 0
        }
        
        # Shared memory
        self.shared_memory: Dict[str, Any] = {}
        self.memory_subscribers: Dict[str, List[str]] = {}
    
    def register_handler(self, message_type: MessageType, handler: Callable):
        """Register a message handler for specific message type"""
        self.message_handlers[message_type].append(handler)
    
    async def connect_to_hive(self, host: str = 'localhost', port: int = 9999):
        """Connect to the hive network"""
        try:
            reader, writer = await asyncio.open_connection(host, port)
            self.connections['hive_master'] = writer
            self.is_connected = True
            
            # Start message processing tasks
            asyncio.create_task(self._receive_messages(reader))
            asyncio.create_task(self._send_messages())
            asyncio.create_task(self._heartbeat_loop())
            
            # Send initial sync
            await self.send_sync_request()
            
            logger.info(f"Node {self.node_id} connected to hive at {host}:{port}")
            
        except Exception as e:
            logger.error(f"Failed to connect to hive: {e}")
            self.is_connected = False
    
    async def _receive_messages(self, reader: asyncio.StreamReader):
        """Receive and process incoming messages"""
        while self.is_connected:
            try:
                # Read message length (4 bytes)
                length_data = await reader.readexactly(4)
                message_length = struct.unpack('!I', length_data)[0]
                
                # Read message data
                message_data = await reader.readexactly(message_length)
                
                # Decrypt if needed
                if message_data[0] == 1:  # Encrypted flag
                    message_data = self.cipher.decrypt(message_data[1:])
                
                # Parse message
                message = HiveMessage.from_bytes(message_data)
                
                # Update metrics
                self.metrics['messages_received'] += 1
                self.metrics['bandwidth_used'] += message_length
                
                # Queue for processing
                await self.message_queue.put(message)
                
                # Process message
                await self._handle_message(message)
                
            except asyncio.IncompleteReadError:
                logger.warning("Connection closed by remote host")
                break
            except Exception as e:
                logger.error(f"Error receiving message: {e}")
    
    async def _send_messages(self):
        """Send outgoing messages"""
        while self.is_connected:
            try:
                message = await self.outgoing_queue.get()
                
                # Serialize message
                message_data = message.to_bytes()
                
                # Encrypt if needed
                if message.encrypted:
                    message_data = b'\x01' + self.cipher.encrypt(message_data)
                else:
                    message_data = b'\x00' + message_data
                
                # Send to all connections
                for conn_id, writer in self.connections.items():
                    # Send message length
                    writer.write(struct.pack('!I', len(message_data)))
                    # Send message
                    writer.write(message_data)
                    await writer.drain()
                
                # Update metrics
                self.metrics['messages_sent'] += 1
                self.metrics['bandwidth_used'] += len(message_data)
                
            except Exception as e:
                logger.error(f"Error sending message: {e}")
    
    async def _handle_message(self, message: HiveMessage):
        """Handle incoming message based on type"""
        handlers = self.message_handlers.get(message.message_type, [])
        
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(message)
                else:
                    handler(message)
            except Exception as e:
                logger.error(f"Error in message handler: {e}")
        
        # Handle protocol-specific messages
        if message.message_type == MessageType.CONSENSUS_REQUEST:
            await self._handle_consensus_request(message)
        elif message.message_type == MessageType.CONSENSUS_VOTE:
            await self._handle_consensus_vote(message)
        elif message.message_type == MessageType.MEMORY_SHARE:
            await self._handle_memory_share(message)
    
    async def _heartbeat_loop(self):
        """Send periodic heartbeat messages"""
        while self.is_connected:
            await asyncio.sleep(5)  # 5 second heartbeat
            
            heartbeat = HiveMessage(
                message_id=self._generate_message_id(),
                timestamp=time.time(),
                source_id=self.node_id,
                message_type=MessageType.HEARTBEAT,
                payload={'status': 'active', 'metrics': self.metrics}
            )
            
            await self.send_message(heartbeat)
    
    async def send_neural_data(self, neural_features: Dict, decoded_pattern: Optional[str] = None):
        """Send neural data to the hive"""
        # Compress features for bandwidth efficiency
        compressed_features = self._compress_features(neural_features)
        
        message = HiveMessage(
            message_id=self._generate_message_id(),
            timestamp=time.time(),
            source_id=self.node_id,
            message_type=MessageType.NEURAL_DATA,
            payload={
                'features': compressed_features,
                'pattern': decoded_pattern,
                'confidence': neural_features.get('confidence', 0.0)
            },
            priority=1
        )
        
        await self.send_message(message)
    
    async def send_command(self, command: str, parameters: Dict = None):
        """Send command to the hive"""
        message = HiveMessage(
            message_id=self._generate_message_id(),
            timestamp=time.time(),
            source_id=self.node_id,
            message_type=MessageType.COMMAND,
            payload={
                'command': command,
                'parameters': parameters or {}
            },
            priority=2
        )
        
        await self.send_message(message)
    
    async def request_consensus(self, proposal: str, options: List[str], timeout: float = 10.0):
        """Request consensus from hive members"""
        request_id = self._generate_message_id()
        
        # Store consensus request
        self.consensus_requests[request_id] = {
            'proposal': proposal,
            'options': options,
            'votes': {},
            'start_time': time.time(),
            'timeout': timeout
        }
        
        message = HiveMessage(
            message_id=request_id,
            timestamp=time.time(),
            source_id=self.node_id,
            message_type=MessageType.CONSENSUS_REQUEST,
            payload={
                'proposal': proposal,
                'options': options,
                'timeout': timeout
            },
            priority=3
        )
        
        await self.send_message(message)
        
        # Wait for consensus
        return await self._wait_for_consensus(request_id)
    
    async def _handle_consensus_request(self, message: HiveMessage):
        """Handle incoming consensus request"""
        # This would be implemented by individual nodes
        # For now, simulate a vote
        request_id = message.message_id
        options = message.payload['options']
        
        # Simple voting logic (would be replaced by actual decision making)
        vote = options[0]  # Default to first option
        
        vote_message = HiveMessage(
            message_id=self._generate_message_id(),
            timestamp=time.time(),
            source_id=self.node_id,
            message_type=MessageType.CONSENSUS_VOTE,
            payload={
                'request_id': request_id,
                'vote': vote
            }
        )
        
        await self.send_message(vote_message)
    
    async def _handle_consensus_vote(self, message: HiveMessage):
        """Handle incoming consensus vote"""
        request_id = message.payload['request_id']
        
        if request_id in self.consensus_requests:
            voter_id = message.source_id
            vote = message.payload['vote']
            
            self.consensus_requests[request_id]['votes'][voter_id] = vote
    
    async def _wait_for_consensus(self, request_id: str) -> Optional[str]:
        """Wait for consensus to be reached"""
        request = self.consensus_requests[request_id]
        start_time = request['start_time']
        timeout = request['timeout']
        
        while time.time() - start_time < timeout:
            votes = request['votes']
            total_votes = len(votes)
            
            if total_votes > 0:
                # Count votes for each option
                vote_counts = {}
                for vote in votes.values():
                    vote_counts[vote] = vote_counts.get(vote, 0) + 1
                
                # Check if any option has reached consensus
                for option, count in vote_counts.items():
                    if count / total_votes >= self.consensus_threshold:
                        del self.consensus_requests[request_id]
                        return option
            
            await asyncio.sleep(0.1)
        
        # Timeout reached
        del self.consensus_requests[request_id]
        return None
    
    async def share_memory(self, key: str, value: Any, subscribers: List[str] = None):
        """Share memory with hive members"""
        self.shared_memory[key] = value
        
        if subscribers:
            self.memory_subscribers[key] = subscribers
        
        message = HiveMessage(
            message_id=self._generate_message_id(),
            timestamp=time.time(),
            source_id=self.node_id,
            message_type=MessageType.MEMORY_SHARE,
            payload={
                'key': key,
                'value': value,
                'subscribers': subscribers or []
            }
        )
        
        await self.send_message(message)
    
    async def _handle_memory_share(self, message: HiveMessage):
        """Handle incoming memory share"""
        key = message.payload['key']
        value = message.payload['value']
        
        # Check if we're a subscriber
        subscribers = message.payload.get('subscribers', [])
        if not subscribers or self.node_id in subscribers:
            self.shared_memory[key] = value
            logger.info(f"Received shared memory: {key}")
    
    async def send_emergency(self, emergency_type: str, details: Dict):
        """Send emergency message with highest priority"""
        message = HiveMessage(
            message_id=self._generate_message_id(),
            timestamp=time.time(),
            source_id=self.node_id,
            message_type=MessageType.EMERGENCY,
            payload={
                'emergency_type': emergency_type,
                'details': details
            },
            priority=10  # Highest priority
        )
        
        await self.send_message(message)
    
    async def send_message(self, message: HiveMessage):
        """Queue message for sending"""
        await self.outgoing_queue.put(message)
    
    async def send_sync_request(self):
        """Send synchronization request to hive"""
        message = HiveMessage(
            message_id=self._generate_message_id(),
            timestamp=time.time(),
            source_id=self.node_id,
            message_type=MessageType.SYNC,
            payload={
                'node_info': {
                    'capabilities': ['neural_processing', 'consensus_voting'],
                    'version': '1.0.0'
                }
            }
        )
        
        await self.send_message(message)
    
    def _generate_message_id(self) -> str:
        """Generate unique message ID"""
        timestamp = str(time.time())
        node_id = self.node_id
        random_data = str(np.random.randint(0, 1000000))
        
        return hashlib.sha256(f"{timestamp}{node_id}{random_data}".encode()).hexdigest()[:16]
    
    def _compress_features(self, features: Dict) -> Dict:
        """Compress neural features for efficient transmission"""
        compressed = {}
        
        for key, value in features.items():
            if isinstance(value, np.ndarray):
                # Convert to list and round to reduce size
                compressed[key] = np.round(value, 4).tolist()
            else:
                compressed[key] = value
        
        return compressed
    
    async def disconnect(self):
        """Disconnect from hive"""
        self.is_connected = False
        
        for writer in self.connections.values():
            writer.close()
            await writer.wait_closed()
        
        self.connections.clear()
        logger.info(f"Node {self.node_id} disconnected from hive")


async def test_hive_protocol():
    """Test the hive protocol"""
    print("Testing Hive Protocol...")
    
    # Create protocol instance
    protocol = HiveProtocol(node_id="test_node_001")
    
    # Register message handlers
    async def handle_neural_data(message: HiveMessage):
        print(f"Received neural data: {message.payload.get('pattern')}")
    
    protocol.register_handler(MessageType.NEURAL_DATA, handle_neural_data)
    
    # Simulate some operations
    print("Sending test messages...")
    
    # Send neural data
    await protocol.send_neural_data(
        neural_features={'alpha_power': 0.8, 'beta_power': 0.6},
        decoded_pattern='focus'
    )
    
    # Send command
    await protocol.send_command('activate_module', {'module': 'visual_cortex'})
    
    # Request consensus
    print("Requesting consensus...")
    # result = await protocol.request_consensus(
    #     "Should we increase processing power?",
    #     ["yes", "no", "defer"],
    #     timeout=5.0
    # )
    # print(f"Consensus result: {result}")
    
    # Share memory
    await protocol.share_memory('test_memory', {'data': 'important_info'})
    
    print("Test completed!")


if __name__ == "__main__":
    asyncio.run(test_hive_protocol())