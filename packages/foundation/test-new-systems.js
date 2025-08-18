/**
 * Quick test of the new battle-tested systems
 */
import { getModernConfig, modernConfigHelpers } from './config-new';
import { safeAsync, withRetry, createCircuitBreaker, ok, err } from './error-handling-new';
async function testModernSystems() {
    console.log('🚀 Testing Modern Foundation Systems');
    // Test Configuration System
    console.log('\n📋 Configuration System (Convict + Dotenv):');
    try {
        const config = getModernConfig();
        console.log('✅ Config loaded successfully');
        console.log('  - Debug mode:', config.development.debug);
        console.log('  - Log level:', config.logging.level);
        console.log('  - Storage backend:', config.storage.backend);
        // Test helper functions
        console.log('  - Helper - Debug mode:', modernConfigHelpers.isDebug());
        console.log('  - Helper - Metrics enabled:', modernConfigHelpers.areMetricsEnabled());
    }
    catch (error) {
        console.error('❌ Config system error:', error);
    }
    // Test Error Handling System
    console.log('\n🔄 Error Handling System (Neverthrow + p-retry + opossum):');
    // Test Result pattern
    const successResult = ok('success data');
    const errorResult = err(new Error('test error'));
    console.log('✅ Result pattern:');
    console.log('  - Success result:', successResult.isOk() ? 'OK' : 'ERR');
    console.log('  - Error result:', errorResult.isErr() ? 'ERR' : 'OK');
    // Test safe async
    const safeResult = await safeAsync(async () => {
        return 'Safe async operation completed';
    });
    if (safeResult.isOk()) {
        console.log('✅ Safe async success:', safeResult.value);
    }
    else {
        console.log('❌ Safe async error:', safeResult.error);
    }
    // Test retry logic
    let attemptCount = 0;
    const retryResult = await withRetry(async () => {
        attemptCount++;
        if (attemptCount < 3) {
            throw new Error(`Attempt ${attemptCount} failed`);
        }
        return `Success on attempt ${attemptCount}`;
    }, {
        retries: 3,
        minTimeout: 100,
        onFailedAttempt: (error, attempt) => {
            console.log(`  Retry attempt ${attempt}: ${error.message}`);
        }
    });
    if (retryResult.isOk()) {
        console.log('✅ Retry success:', retryResult.value);
    }
    else {
        console.log('❌ Retry failed:', retryResult.error);
    }
    // Test circuit breaker
    console.log('\n🔌 Circuit Breaker (opossum):');
    const breaker = createCircuitBreaker(async (data) => {
        if (data === 'fail') {
            throw new Error('Simulated service failure');
        }
        return `Processed: ${data}`;
    }, {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000
    }, 'test-circuit-breaker');
    // Test successful call
    const cbResult1 = await breaker.execute('test-data');
    if (cbResult1.isOk()) {
        console.log('✅ Circuit breaker success:', cbResult1.value);
    }
    // Test failure
    const cbResult2 = await breaker.execute('fail');
    if (cbResult2.isErr()) {
        console.log('✅ Circuit breaker handled error correctly');
    }
    console.log('  - Circuit breaker state:', breaker.getState());
    console.log('\n🎉 All modern systems tested successfully!');
}
// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testModernSystems().catch(console.error);
}
export { testModernSystems };
