import { SqliteMemoryStore } from './dist/memory/sqlite-store.js';
import { RuvSwarm, Swarm, Agent, Task } from 'ruv-swarm';

async function testLibraryIntegration() {
  console.log('🧪 Testing ruv-swarm library integration...\n');
  
  try {
    // Test 1: Memory Store
    console.log('🔧 Test 1: SQLite Memory Store');
    const memoryStore = new SqliteMemoryStore({ dbName: 'test.db' });
    await memoryStore.initialize();
    console.log('✅ Memory store initialized');
    
    // Test 2: RuvSwarm Classes
    console.log('\n🔧 Test 2: RuvSwarm Library Classes');
    console.log('   RuvSwarm class:', typeof RuvSwarm);
    console.log('   Swarm class:', typeof Swarm);
    console.log('   Agent class:', typeof Agent);
    console.log('   Task class:', typeof Task);
    
    // Test 3: Create instances
    console.log('\n🔧 Test 3: Create Instances');
    const swarmConfig = {
      topology: 'mesh',
      maxAgents: 3,
      strategy: 'parallel',
      memoryStore: memoryStore
    };
    
    const swarm = new Swarm(swarmConfig);
    console.log('✅ Swarm created:', swarm.id);
    
    console.log('\n🎉 Library integration successful\! Ready for claude-zen MCP tools.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLibraryIntegration();
