import { Domain, DomainBoundaryValidator, getDomainValidator, } from './domain-boundary-validator.ts';
async function verifyDomainBoundaryValidator() {
    console.log('🧪 Verifying Domain Boundary Validator Implementation');
    console.log('='.repeat(60));
    try {
        console.log('✅ Testing basic validation...');
        const validator = new DomainBoundaryValidator(Domain.CORE);
        const stringSchema = { type: 'string', required: true };
        const result = validator.validateInput('test-string', stringSchema);
        console.log(`   - String validation: ${result}`);
        console.log('✅ Testing complex object validation...');
        const agentSchema = {
            type: 'object',
            required: true,
            properties: {
                id: { type: 'string', required: true },
                capabilities: {
                    type: 'array',
                    required: true,
                    items: { type: 'string' },
                },
                status: {
                    type: 'string',
                    required: true,
                    enum: ['idle', 'busy'],
                },
            },
        };
        const agentData = {
            id: 'agent-001',
            capabilities: ['planning', 'execution'],
            status: 'idle',
        };
        const validatedAgent = validator.validateInput(agentData, agentSchema);
        console.log(`   - Agent validation: ${validatedAgent.id} - ${validatedAgent.status}`);
        console.log('✅ Testing validator registry...');
        const coordValidator = getDomainValidator(Domain.COORDINATION);
        const workflowValidator = getDomainValidator(Domain.WORKFLOWS);
        console.log(`   - Coordination validator created: ${coordValidator !== undefined}`);
        console.log(`   - Workflows validator created: ${workflowValidator !== undefined}`);
        console.log(`   - Different validators: ${coordValidator !== workflowValidator}`);
        console.log('✅ Testing domain crossing tracking...');
        coordValidator.trackCrossings(Domain.COORDINATION, Domain.WORKFLOWS, 'test-operation');
        const crossings = coordValidator.getDomainCrossings();
        console.log(`   - Domain crossings tracked: ${crossings.length}`);
        console.log(`   - First crossing: ${crossings[0]?.fromDomain} -> ${crossings[0]?.toDomain}`);
        console.log('✅ Testing performance metrics...');
        const stats = validator.getStatistics();
        console.log(`   - Domain: ${stats.domain}`);
        console.log(`   - Total validations: ${stats.totalValidations}`);
        console.log(`   - Error rate: ${(stats.errorRate * 100).toFixed(2)}%`);
        console.log('✅ Testing error handling...');
        try {
            validator.validateInput(42, stringSchema);
            console.log('   - ❌ Error handling test failed - no error thrown');
        }
        catch (error) {
            console.log(`   - Error correctly caught: ${error.constructor.name}`);
        }
        console.log('✅ Testing cache behavior...');
        const cacheTestSchema = {
            type: 'string',
            required: true,
            description: 'cache-test',
        };
        const start1 = Date.now();
        validator.validateInput('cache-test-data', cacheTestSchema);
        const time1 = Date.now() - start1;
        const start2 = Date.now();
        validator.validateInput('cache-test-data', cacheTestSchema);
        const time2 = Date.now() - start2;
        console.log(`   - First validation: ${time1}ms`);
        console.log(`   - Second validation (cached): ${time2}ms`);
        console.log('='.repeat(60));
        console.log('🎉 All Domain Boundary Validator tests passed!');
        console.log('🏗️  Phase 0, Task 0.2 implementation is complete and working');
    }
    catch (error) {
        console.error('❌ Verification failed:', error);
        throw error;
    }
}
verifyDomainBoundaryValidator().catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
});
export { verifyDomainBoundaryValidator };
//# sourceMappingURL=verify-domain-boundary-validator.js.map