// Simple test to isolate the import issue
console.log('Starting simple test...');

async function testImport() {
  try {
    console.log('Testing import...');
    const diModule = await import('./src/core/di-container');
    console.log('✅ Import successful');
    console.log('Available exports:', Object.keys(diModule));
    
    console.log('Testing function...');
    const container = diModule.createClaudeZenDIContainer();
    console.log('✅ Function call successful');
    
    console.log('Testing initialization...');
    await diModule.initializeDIServices(container);
    console.log('✅ Initialization successful');
    
    console.log('Testing shutdown...');
    await diModule.shutdownDIContainer(container);
    console.log('✅ Shutdown successful');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testImport().then(() => {
  console.log('Test completed');
}).catch(error => {
  console.error('Test failed:', error);
});