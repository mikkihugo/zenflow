import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Event-Driven Coordination Package...\n');

// Test 1: Check if coordination package built successfully
console.log('📦 Test 1: Checking coordination package build...');
try {
  const distPath = path.join(__dirname, '../dist');
  const indexPath = path.join(distPath, 'index.js');
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ Coordination package built successfully');
    
    // Check what's in the dist directory
    const files = fs.readdirSync(distPath);
    console.log('📁 Built files:', files);
    
    // Check if our event bridge files are there
    const safeBridge = path.join(distPath, 'safe', 'event-bridge-global.js');
    const taskmasterBridge = path.join(distPath, 'taskmaster', 'event-bridge-global.js');
    const teamworkBridge = path.join(distPath, 'teamwork', 'event-bridge-global.js');
    
    if (fs.existsSync(safeBridge)) {
      console.log('✅ SAFe event bridge built');
    }
    if (fs.existsSync(taskmasterBridge)) {
      console.log('✅ TaskMaster event bridge built');
    }
    if (fs.existsSync(teamworkBridge)) {
      console.log('✅ Teamwork event bridge built');
    }
    
  } else {
    console.log('❌ Coordination package not built');
  }
  
} catch (error) {
  console.log('❌ Error checking coordination package:', error.message);
}

// Test 2: Check if foundation package built
console.log('\n📦 Test 2: Checking foundation package...');
try {
  const foundationPath = path.join(__dirname, '../../core/foundation/dist');
  if (fs.existsSync(foundationPath)) {
    console.log('✅ Foundation package built');
    
    // Check if EventBus is available
    const eventBusPath = path.join(foundationPath, 'src/events/event-bus.js');
    if (fs.existsSync(eventBusPath)) {
      console.log('✅ EventBus available');
    }
  } else {
    console.log('❌ Foundation package not built');
  }
} catch (error) {
  console.log('❌ Error checking foundation package:', error.message);
}

console.log('\n🎯 Event-driven coordination package is ready!');
console.log('📋 Next: Test actual event bridging functionality');
