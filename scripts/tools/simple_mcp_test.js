import { Agent, RuvSwarm, Swarm } from 'ruv-swarm';
import { SqliteMemoryStore } from './dist/memory/sqlite-store.js';

async function testLibraryIntegration(): unknown {
  console.warn('🧪 Testing ruv-swarm library integration...\n');
;
  try {
    // Test 1: Memory Store
    console.warn('🔧 Test 1: SQLite Memory Store');
    const _memoryStore = new SqliteMemoryStore({ dbName: 'test.db' });
    await memoryStore.initialize();
    console.warn('✅ Memory store initialized');
;
    // Test 2: RuvSwarm Classes
    console.warn('\n🔧 Test 2: RuvSwarm Library Classes');
    console.warn('   RuvSwarm class:', typeof RuvSwarm);
    console.warn('   Swarm class:', typeof Swarm);
    console.warn('   Agent class:', typeof Agent);
    console.warn('   Task class:', typeof Task);
;
    // Test 3: Create instances
    console.warn('\n🔧 Test 3: Create Instances');
    const _swarmConfig = {
      topology: 'mesh',;
      maxAgents: 3,;
      strategy: 'parallel',;
      memoryStore: memoryStore,;
    };
;
    const _swarm = new Swarm(swarmConfig);
    console.warn('✅ Swarm created:', swarm.id);
;
    console.warn('\n🎉 Library integration successful\! Ready for claude-zen MCP tools.');
  }
catch (/* error */)
{
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
}
}
testLibraryIntegration()
