/**
 * 🚀 AG-UI Integration Demo for Claude Code Zen
 * 
 * Demonstrates the AG-UI protocol integration with the existing architecture
 * Shows how to use AG-UI for real-time agent-to-UI communication
 * 
 * @module AGUIDemoIntegration
 */

import { AGUIAdapter, createMessageFlow, createToolCallFlow } from '../ai/agui-adapter.js';
import { AGUIWebSocketMiddleware } from '../api/agui-websocket-middleware.js';

/**
 * Demo class showcasing AG-UI integration
 */
export class AGUIDemoIntegration {
  constructor() {
    this.adapter = new AGUIAdapter({
      sessionId: 'demo-session',
      threadId: 'demo-thread'
    });
    
    this.setupEventLogging();
  }

  /**
   * Setup event logging for demo purposes
   */
  setupEventLogging() {
    this.adapter.on('agui:event', (event) => {
      console.log(`🌟 AG-UI Event [${event.type}]:`, event);
    });
  }

  /**
   * Demo 1: Basic text message flow
   */
  async demoBasicTextMessage() {
    console.log('\n📝 Demo 1: Basic Text Message Flow');
    
    // Simulate an assistant responding
    const messageId = this.adapter.startTextMessage(null, 'assistant');
    
    // Simulate streaming text content
    const text = "Hello! I'm demonstrating the AG-UI protocol integration with Claude Code Zen.";
    for (const char of text) {
      this.adapter.addTextContent(char, messageId);
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate typing
    }
    
    this.adapter.endTextMessage(messageId);
    
    return messageId;
  }

  /**
   * Demo 2: Tool call execution with AG-UI events
   */
  async demoToolCallExecution() {
    console.log('\n🔧 Demo 2: Tool Call Execution');
    
    // Start a tool call
    const toolCallId = this.adapter.startToolCall('analyze_codebase');
    
    // Stream arguments
    const args = { 
      directory: '/claude-code-zen',
      analysis_type: 'architecture',
      include_metrics: true
    };
    
    this.adapter.addToolCallArgs(JSON.stringify(args), toolCallId);
    this.adapter.endToolCall(toolCallId);
    
    // Simulate tool execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return results
    const result = {
      files_analyzed: 234,
      architecture: 'multi-queen-hive',
      complexity_score: 8.5,
      queens_detected: 3,
      swarms_active: 2
    };
    
    this.adapter.emitToolCallResult(result, toolCallId);
    
    return toolCallId;
  }

  /**
   * Demo 3: Multi-Queen hive coordination events
   */
  async demoMultiQueenCoordination() {
    console.log('\n👑 Demo 3: Multi-Queen Coordination');
    
    // Simulate Queen 1 starting analysis
    this.adapter.emitQueenEvent('queen-1', 'start_analysis', {
      target: 'codebase_structure',
      priority: 'high'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Queen 2 joins coordination
    this.adapter.emitQueenEvent('queen-2', 'join_analysis', {
      specialization: 'performance_optimization',
      coordination_with: 'queen-1'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Queen 3 provides neural network insights
    this.adapter.emitQueenEvent('queen-3', 'neural_analysis', {
      model_type: 'ruv-FANN',
      insights: ['pattern_recognition', 'optimization_suggestions'],
      confidence: 0.92
    });
    
    // Hive mind coordination
    this.adapter.emitHiveMindEvent('consensus_reached', {
      queens_participating: ['queen-1', 'queen-2', 'queen-3'],
      decision: 'implement_agui_protocol',
      confidence: 0.95,
      next_actions: ['setup_event_streams', 'integrate_websockets', 'test_real_time_updates']
    });
  }

  /**
   * Demo 4: Swarm coordination events
   */
  async demoSwarmCoordination() {
    console.log('\n🐝 Demo 4: Swarm Coordination');
    
    // Start swarm run
    const { runId, threadId } = this.adapter.startRun();
    
    // Swarm initialization
    this.adapter.emitSwarmEvent('swarm-alpha', 'initialize', ['agent-1', 'agent-2', 'agent-3'], {
      task: 'code_analysis_and_optimization',
      coordination_strategy: 'hierarchical',
      neural_backing: true
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Agent coordination
    this.adapter.emitSwarmEvent('swarm-alpha', 'agent_coordination', ['agent-1', 'agent-2'], {
      action: 'parallel_analysis',
      targets: ['src/api/', 'src/mcp/'],
      sync_point: 'phase_1_complete'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Complete swarm task
    this.adapter.emitSwarmEvent('swarm-alpha', 'task_complete', ['agent-1', 'agent-2', 'agent-3'], {
      results: {
        analysis_complete: true,
        optimizations_found: 12,
        agui_integration_status: 'successful'
      },
      performance: {
        execution_time: '2.3s',
        efficiency: 0.89
      }
    });
    
    // Finish run
    this.adapter.finishRun({
      success: true,
      swarm_results: 'optimization_complete',
      agui_events_generated: this.adapter.getStats().eventsEmitted
    }, runId, threadId);
  }

  /**
   * Demo 5: State synchronization
   */
  async demoStateSynchronization() {
    console.log('\n🔄 Demo 5: State Synchronization');
    
    // Emit hive mind state
    const hiveMindState = {
      queens: {
        'queen-1': { status: 'active', task: 'analysis' },
        'queen-2': { status: 'active', task: 'optimization' },
        'queen-3': { status: 'active', task: 'neural_processing' }
      },
      swarms: {
        'swarm-alpha': { agents: 3, status: 'executing', progress: 0.75 }
      },
      databases: {
        sqlite: { status: 'healthy', connections: 5 },
        lancedb: { status: 'healthy', vectors: 12450 },
        kuzu: { status: 'healthy', nodes: 890, edges: 2340 }
      },
      agui: {
        adapters_active: 1,
        events_processed: this.adapter.getStats().eventsEmitted,
        websocket_clients: 0
      }
    };
    
    this.adapter.emitStateSnapshot(hiveMindState);
  }

  /**
   * Run all demos in sequence
   */
  async runAllDemos() {
    console.log('🚀 Starting AG-UI Integration Demos for Claude Code Zen\n');
    
    try {
      await this.demoBasicTextMessage();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.demoToolCallExecution();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.demoMultiQueenCoordination();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.demoSwarmCoordination();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.demoStateSynchronization();
      
      console.log('\n✅ All AG-UI integration demos completed successfully!');
      console.log('📊 Final Stats:', this.adapter.getStats());
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  /**
   * Interactive demo with WebSocket
   */
  async demoWithWebSocket(webSocketServer) {
    console.log('\n🔗 Demo: AG-UI with WebSocket Integration');
    
    // Setup AG-UI WebSocket middleware
    const aguiWS = new AGUIWebSocketMiddleware(webSocketServer);
    
    // Connect our demo adapter to the WebSocket middleware
    this.adapter.connectGlobalEmitter(aguiWS.getGlobalAdapter());
    
    // Run demos - events will be broadcast to connected WebSocket clients
    await this.runAllDemos();
    
    return aguiWS;
  }
}

/**
 * Standalone demo runner
 */
export async function runAGUIDemo() {
  const demo = new AGUIDemoIntegration();
  await demo.runAllDemos();
  return demo;
}

/**
 * Integration test helper
 */
export function createAGUIIntegrationTest(server) {
  return async () => {
    console.log('🧪 Running AG-UI Integration Test...');
    
    const demo = new AGUIDemoIntegration();
    
    // Test basic functionality
    await demo.demoBasicTextMessage();
    await demo.demoToolCallExecution();
    
    // Test server integration if available
    if (server && server.aguiMiddleware) {
      const globalAdapter = server.aguiMiddleware.getGlobalAdapter();
      globalAdapter.emitCustomEvent('integration_test', {
        status: 'success',
        timestamp: Date.now()
      });
    }
    
    console.log('✅ AG-UI Integration Test completed');
    return demo.adapter.getStats();
  };
}

export default AGUIDemoIntegration;